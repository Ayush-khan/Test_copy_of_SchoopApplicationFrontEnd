import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";

const PublishHPCReportCard = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [sessionData, setSessionData] = useState({});
  const [fromDate, setFromDate] = useState(null);
  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [loadingForSearch, setLoadingForSearch] = useState(false);
  const [loadingExams, setLoadingExams] = useState(false);
  const [loading, setLoading] = useState(false); // 👈 used for class change loader

  const [terms, setTerms] = useState([]);
  const [termIds, setTermIds] = useState([]);
  const navigate = useNavigate();
  const [studentError, setStudentError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timetable, setTimetable] = useState([]);
  const [publishStatus, setPublishStatus] = useState({}); // { termId: "Y"/"N" }
  const [isReadyToRender, setIsReadyToRender] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // NEW

  const pageSize = 10;
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  <ToastContainer
    position="top-right"
    autoClose={3000}
    hideProgressBar={false}
    newestOnTop={false}
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
    theme="colored"
  />;
  useEffect(() => {
    const init = async () => {
      try {
        await fetchTerms();
        const regId = await fetchData();
        if (regId) {
          await fetchClasses(regId);
        }
      } catch (err) {
        console.error("Error in init:", err);
      } finally {
        setInitialLoading(false); // ✅ mark done when everything is fetched
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (selectedClassId && selectedSectionId && termIds.length > 0) {
      console.log("useEffect triggered fetchPublishStatus");
      fetchPublishStatus(selectedClassId, selectedSectionId)
        .then(() => {
          setIsReadyToRender(true);
        })
        .catch((e) =>
          console.error("Error in useEffect fetchPublishStatus", e)
        );
    }
  }, [selectedClassId, selectedSectionId, termIds]);

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

      if (classes.length > 0) {
        const firstClass = {
          value: classes[0].class_id,
          section_id: classes[0].section_id,
          label: `${classes[0].classname} ${classes[0].sectionname}`,
        };

        setSelectedStudent(firstClass);
        setSelectedClassId(firstClass.value);
        setSelectedSectionId(firstClass.section_id);

        // ✅ Only fetch publish status after terms are loaded
        if (termIds.length > 0) {
          await fetchPublishStatus(firstClass.value, firstClass.section_id);
          setIsReadyToRender(true); // ✅ Mark ready to render
        }
      }
    } catch (error) {
      toast.error("Error fetching Classes");
      console.error("Error fetching Classes:", error);
    } finally {
      setLoadingExams(false);
    }
  };

  const fetchPublishStatus = async (classId, sectionId) => {
    console.log(
      "fetchPublishStatus called with:",
      classId,
      sectionId,
      "termIds:",
      termIds
    );
    if (!classId || !sectionId || !termIds?.length) {
      console.warn(
        "Skipping fetchPublishStatus because missing class, section, or termIds"
      );
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const results = {};
      for (const termId of termIds) {
        console.log("Fetching for termId:", termId);
        const requests = termIds.map((termId) =>
          axios
            .get(`${API_URL}/api/get_hpcreportcardpublishvalue`, {
              headers: { Authorization: `Bearer ${token}` },
              params: {
                class_id: classId,
                section_id: sectionId,
                term_id: termId,
              },
            })
            .then((res) => ({ termId, status: res?.data?.data || "N" }))
        );

        const responses = await Promise.all(requests);
        const results = {};
        responses.forEach(({ termId, status }) => {
          results[termId] = status;
        });
        setPublishStatus(results);
      }
    } catch (error) {
      toast.error("Failed to load publish statuses");
      console.error("Error in fetchPublishStatus:", error);
    } finally {
      setLoading(false);
      console.log(
        "fetchPublishStatus done, loading => false, publishStatus:",
        publishStatus
      );
    }
  };

  const handleStudentSelect = async (selectedOption) => {
    setStudentError("");
    setSelectedStudent(selectedOption);
    setSelectedClassId(selectedOption?.value);
    setSelectedSectionId(selectedOption?.section_id);

    if (
      selectedOption?.value &&
      selectedOption?.section_id &&
      termIds.length > 0
    ) {
      await fetchPublishStatus(
        selectedOption?.value,
        selectedOption?.section_id
      );
      console.log("In handleStudentSelect, setting isReadyToRender = true");
      setIsReadyToRender(true);
    }
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
          toast.success("Holistic report card Published successfully.");
        } else {
          toast.success("Holistic report card Unpublished successfully.");
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
      <div className="w-full md:w-[80%] mx-auto p-4 ">
        <ToastContainer />
        <div className="card p-2 rounded-md ">
          <div className=" card-header mb-4 flex justify-between items-center ">
            <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
              Publish Holistic Report Card
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
            <div className="bg-white border border-blue-400 rounded-md shadow-md overflow-x-auto">
              {/* Header Row */}
              <div className="grid grid-cols-[220px_repeat(auto-fit,minmax(150px,1fr))] border-b border-gray-200 px-4 py-2 bg-blue-50 text-sm font-semibold text-gray-800">
                <div className="flex justify-center items-center text-center">
                  Select Class
                </div>

                {terms.map((term) => (
                  <div
                    key={term.term_id}
                    className="flex justify-center items-center text-center"
                  >
                    {term.name}
                  </div>
                ))}
              </div>

              {/* Body Row */}
              <div className="grid grid-cols-[220px_repeat(auto-fit,minmax(150px,1fr))] px-4 py-4 items-center bg-white text-sm">
                {/* Select Dropdown */}
                <div className="max-w-xs">
                  {initialLoading ? (
                    <div className="text-blue-600 text-sm flex items-center gap-2 py-3 px-2">
                      <svg
                        className="animate-spin h-5 w-5"
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
                      Loading data, please wait...
                    </div>
                  ) : (
                    <>
                      <Select
                        value={selectedStudent}
                        onChange={handleStudentSelect}
                        options={studentOptions}
                        placeholder="Select"
                        isSearchable
                        isClearable
                        isDisabled={loadingExams}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        className="text-sm"
                        styles={{
                          control: (base) => ({
                            ...base,
                            fontSize: ".9em",
                            minHeight: "36px",
                          }),
                          menu: (base) => ({
                            ...base,
                            zIndex: 9999,
                            fontSize: ".9em",
                          }),
                        }}
                      />
                      {studentError && (
                        <p className="text-xs text-red-500 mt-1">
                          {studentError}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Term Buttons */}
                {!isReadyToRender || loading ? (
                  <div className="flex justify-center items-center h-full py-6">
                    <svg
                      className="animate-spin h-6 w-6 text-indigo-500 mr-2"
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
                    <span className="text-gray-600 text-sm font-medium animate-pulse">
                      Fetching report card status for selected class and
                      section...
                    </span>
                  </div>
                ) : (
                  terms.map((term) => {
                    const isPublished = publishStatus[term.term_id] === "Y";
                    const isLoading = publishStatus[`loading_${term.term_id}`];

                    return (
                      <div key={term.term_id} className="text-center">
                        <button
                          onClick={() =>
                            handlePublishToggle(
                              selectedClassId,
                              selectedSectionId,
                              term.term_id
                            )
                          }
                          disabled={isLoading || loadingExams}
                          className={`w-[100px] px-3 py-1.5 rounded font-semibold text-white text-sm transition duration-200
                  ${
                    isPublished
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-green-500 hover:bg-green-600"
                  }
                  ${
                    isLoading || loadingExams
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }
                `}
                        >
                          {isLoading ? (
                            <span className="flex justify-center items-center gap-1">
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
                              ...
                            </span>
                          ) : isPublished ? (
                            "Unpublish"
                          ) : (
                            "Publish"
                          )}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        </div>
      </div>
    </>
  );
};

export default PublishHPCReportCard;
