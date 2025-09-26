import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";

const PublishreportCard = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [sessionData, setSessionData] = useState({});
  const [fromDate, setFromDate] = useState(null);
  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [loadingForSearch, setLoadingForSearch] = useState(false);
  const [terms, setTerms] = useState([]);
  const [termIds, setTermIds] = useState([]);
  const navigate = useNavigate();
  const [loadingExams, setLoadingExams] = useState(false);
  const [studentError, setStudentError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [timetable, setTimetable] = useState([]);
  const [publishStatus, setPublishStatus] = useState({}); // { termId: "Y"/"N" }

  const pageSize = 10;
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const init = async () => {
      await fetchTerms(); // 🟢 Fetch terms first

      const regId = await fetchData(); // 🟢 Then get reg_id
      if (regId) {
        await fetchClasses(regId); // 🟢 Finally fetch classes
      }
    };

    init();
  }, []);

  const fetchTerms = async () => {
    try {
      setLoadingExams(true);
      const token = localStorage.getItem("authToken");

      const response = await axios.get(`${API_URL}/api/get_Term`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const termData = response?.data || [];

      // Set terms (full objects)
      setTerms(termData);

      // Set termIds (array of IDs)
      const ids = termData.map((term) => term.term_id);
      setTermIds(ids);

      console.log("Terms:", termData);
      console.log("Term IDs:", ids);
    } catch (error) {
      toast.error("Error fetching Terms");
      console.error("Error fetching Terms:", error);
    } finally {
      setLoadingExams(false);
    }
  };

  const fetchData = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.error("No authentication token found");
      navigate("/");
      return null;
    }

    try {
      const sessionResponse = await axios.get(`${API_URL}/api/sessionData`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const errorMsg = sessionResponse?.data?.message;
      if (errorMsg === "Token has expired") {
        localStorage.removeItem("authToken");
        navigate("/");
        return null;
      }

      setSessionData(sessionResponse.data);

      const regId = sessionResponse?.data?.user?.reg_id;
      return regId; // 👈 Return reg_id from here
    } catch (error) {
      const errorMsg = error.response?.data?.message;
      if (errorMsg === "Token has expired") {
        localStorage.removeItem("authToken");
        navigate("/");
      }
      console.error("Error fetching data:", error);
      return null;
    }
  };

  const fetchClasses = async (teacherId) => {
    try {
      setLoadingExams(true);
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/get_classes_of_classteacher?teacher_id=${teacherId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const classes = response?.data?.data || [];
      setStudentNameWithClassId(classes);

      // ✅ Auto-select first class
      if (classes.length > 0) {
        const firstClass = {
          value: classes[0].class_id,
          section_id: classes[0].section_id,
          label: `${classes[0].classname} ${classes[0].sectionname}`,
        };
        setSelectedStudent(firstClass);
        setSelectedClassId(firstClass.value);
        setSelectedSectionId(firstClass.section_id);
        await fetchPublishStatus(firstClass.value, firstClass.section_id); // 🟢 Fetch publish status
      }
    } catch (error) {
      toast.error("Error fetching Classes");
      console.error("Error fetching Classes:", error);
    } finally {
      setLoadingExams(false);
    }
  };
  const fetchPublishStatus = async (classId, sectionId) => {
    if (!classId || !sectionId || !termIds?.length) return;

    setLoading(true); // 🟢 Full-screen loader start

    try {
      const token = localStorage.getItem("authToken");

      const results = {};

      // Loop through all terms and call API
      for (const termId of termIds) {
        const res = await axios.get(
          `${API_URL}/api/get_hpcreportcardpublishvalue`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              class_id: classId,
              section_id: sectionId,
              term_id: termId,
            },
          }
        );

        results[termId] = res?.data?.data || "N";
      }

      setPublishStatus(results); // ✅ Save all term publish statuses
    } catch (error) {
      console.error("Error fetching publish status:", error);
      toast.error("Failed to load publish statuses");
    } finally {
      setLoading(false); // 🟢 Full-screen loader end
    }
  };

  const handleStudentSelect = async (selectedOption) => {
    setStudentError("");
    setSelectedStudent(selectedOption);
    setSelectedClassId(selectedOption?.value);
    setSelectedSectionId(selectedOption?.section_id);

    await fetchPublishStatus(selectedOption?.value, selectedOption?.section_id); // ⬅️ Fetch
  };

  const studentOptions = useMemo(
    () =>
      studentNameWithClassId?.map((cls) => ({
        value: cls?.class_id,
        section_id: cls?.section_id,
        label: `${cls?.classname} ${cls?.sectionname}`,
      })) || [],
    [studentNameWithClassId]
  );

  // Handle search and fetch parent information

  const handleSearch = async () => {
    setLoadingForSearch(false);
    if (!selectedClassId) {
      setLoadingForSearch(false);
      return;
    }
    setSearchTerm("");
    try {
      setLoadingForSearch(true); // Start loading
      setTimetable([]);
      const token = localStorage.getItem("authToken");
      const params = {};
      if (selectedClassId) params.staff_id = selectedClassId;
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      const response = await axios.get(
        `${API_URL}/api/get_consolidatedleavereport`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      if (!response?.data?.data || response?.data?.data?.length === 0) {
        toast.error("Consolidated Leave Report data not found.");
        setTimetable([]);
      } else {
        setTimetable(response?.data?.data);
        setPageCount(Math.ceil(response?.data?.data?.length / pageSize)); // Set page count based on response size
      }
    } catch (error) {
      console.error("Error fetching Consolidated Leave Report:", error);
      toast.error(
        "Error fetching Consolidated Leave Report. Please try again."
      );
    } finally {
      setIsSubmitting(false); // Re-enable the button after the operation
      setLoadingForSearch(false);
    }
  };
  const handlePublishToggle = async (classId, sectionId, termId) => {
    if (!classId || !sectionId || !termId) return;

    const token = localStorage.getItem("authToken");
    const currentStatus = publishStatus[termId];
    const newStatus = currentStatus === "Y" ? "N" : "Y";

    // Update button loading state for this term
    setPublishStatus((prev) => ({
      ...prev,
      [`loading_${termId}`]: true,
    }));

    try {
      const formData = new FormData();
      formData.append("term_id", termId);
      formData.append("publish", newStatus);
      formData.append("class_id", classId);
      formData.append("section_id", sectionId);

      const response = await axios.post(
        `${API_URL}/api/save_hpcreportcardpublishvalue`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response?.data?.success) {
        setPublishStatus((prev) => ({
          ...prev,
          [termId]: newStatus,
        }));

        if (newStatus === "Y") {
          toast.success("Report card Published successfully.");
        } else {
          toast.success("Report card Unpublished successfully.");
        }
      } else {
        toast.error("Failed to update status.");
      }
    } catch (err) {
      toast.error("Error saving publish status.");
      console.error(err);
    } finally {
      // Remove loading state for this button
      setPublishStatus((prev) => {
        const updated = { ...prev };
        delete updated[`loading_${termId}`];
        return updated;
      });
    }
  };

  return (
    <>
      <div className="w-full md:w-[100%] mx-auto p-4 ">
        <ToastContainer />
        <div className="card p-2 rounded-md ">
          <div className=" card-header mb-4 flex justify-between items-center ">
            <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
              Publish report Card
            </h5>
            <RxCross1
              className=" relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
              onClick={() => {
                navigate("/dashboard");
              }}
            />
          </div>
          <div
            className=" relative w-full   -top-6 h-1  mx-auto bg-red-700"
            style={{
              backgroundColor: "#C03078",
            }}
          ></div>

          <>
            <div className="w-full md:w-[85%] flex justify-center flex-col md:flex-row gap-x-1 ml-0 p-2">
              <div className="w-full md:w-[99%] flex md:flex-col items-start mt-0 md:mt-4">
                {/* Class Dropdown */}
                <div className="w-full gap-x-0 md:gap-x-12 flex flex-col gap-y-2 md:gap-y-0 md:flex-row">
                  <div className="w-full md:w-[50%] gap-x-2 justify-around my-1 md:my-4 flex md:flex-row">
                    <label
                      className="w-full md:w-[25%] text-md pl-0 md:pl-5 mt-1.5"
                      htmlFor="studentSelect"
                    >
                      Select Class <span className="text-red-500">*</span>
                    </label>
                    <div className="w-full md:w-[65%]">
                      <Select
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        id="studentSelect"
                        value={selectedStudent}
                        onChange={handleStudentSelect}
                        options={studentOptions}
                        placeholder={loadingExams ? "Loading..." : "Select"}
                        isSearchable
                        isClearable
                        className="text-sm"
                        isDisabled={loadingExams}
                        styles={{
                          control: (provided) => ({
                            ...provided,
                            fontSize: ".9em",
                            minHeight: "30px",
                          }),
                          menu: (provided) => ({
                            ...provided,
                            fontSize: "1em",
                          }),
                          option: (provided) => ({
                            ...provided,
                            fontSize: ".9em",
                          }),
                        }}
                      />
                      {studentError && (
                        <div className="h-8 relative ml-1 text-danger text-xs">
                          {studentError}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Term Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                  {terms.map((term) => {
                    const isLoading = publishStatus[`loading_${term.term_id}`];

                    return (
                      <div
                        key={term.term_id}
                        className="bg-gray-100 p-4 rounded-md shadow-sm text-center"
                      >
                        <div className="font-semibold text-gray-700 mb-3">
                          {term.name}
                        </div>
                        <button
                          onClick={() =>
                            handlePublishToggle(
                              selectedClassId,
                              selectedSectionId,
                              term.term_id
                            )
                          }
                          disabled={isLoading}
                          className={`w-full flex justify-center items-center gap-2 px-4 py-2 rounded-md font-semibold transition ${
                            publishStatus[term.term_id] === "Y"
                              ? "bg-red-500 hover:bg-red-600"
                              : "bg-green-500 hover:bg-green-600"
                          } text-white ${
                            isLoading ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          {isLoading ? (
                            <>
                              <svg
                                className="animate-spin h-4 w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                ></path>
                              </svg>
                              Processing...
                            </>
                          ) : publishStatus[term.term_id] === "Y" ? (
                            "Unpublish"
                          ) : (
                            "Publish"
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        </div>
      </div>
    </>
  );
};

export default PublishreportCard;
