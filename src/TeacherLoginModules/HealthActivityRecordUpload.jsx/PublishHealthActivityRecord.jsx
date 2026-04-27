import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";

const PublishHealthActivityRecord = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [sessionData, setSessionData] = useState({});

  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [loadingForSearch, setLoadingForSearch] = useState(false);
  const [loadingExams, setLoadingExams] = useState(false);
  const [loading, setLoading] = useState(false); //  used for class change loader

  const navigate = useNavigate();
  const [studentError, setStudentError] = useState("");

  const [publishStatus, setPublishStatus] = useState({});
  const [isReadyToRender, setIsReadyToRender] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // NEW

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
        const regId = await fetchData();
        if (regId) {
          await fetchClasses(regId);
        }
      } catch (err) {
        console.error("Error in init:", err);
      } finally {
        setInitialLoading(false);
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (selectedClassId && selectedSectionId) {
      console.log("useEffect triggered fetchPublishStatus");
      fetchPublishStatus(selectedClassId, selectedSectionId)
        .then(() => {
          setIsReadyToRender(true);
        })
        .catch((e) => console.error("Error in useEffect fetchPublishStatus"));
    }
  }, [selectedClassId, selectedSectionId]);

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
      return regId; //  Return reg_id from here
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
        `${API_URL}/api/get_teacherclasseswithclassteacher?teacher_id=${teacherId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const classes = response?.data?.data || [];
      setStudentNameWithClassId(classes);
    } catch (error) {
      toast.error("Error fetching Classes");
      console.error("Error fetching Classes:", error);
    } finally {
      setLoadingExams(false);
    }
  };

  const fetchPublishStatus = async (classId, sectionId) => {
    if (!classId || !sectionId) {
      console.warn(
        "Skipping fetchPublishStatus because missing class, section",
      );
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/get_health_card_publish_value/${classId}/${sectionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setPublishStatus(response.data.publish_value);
      console.log("publish status", response.data);
    } catch (error) {
      console.error("Error fetching publish status:", error);
      toast.error("Failed to load publish status");
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSelect = (selectedOption) => {
    setStudentError("");

    if (!selectedOption) {
      setSelectedStudent(null);
      setSelectedClassId(null);
      setSelectedSectionId(null);
      return;
    }

    setSelectedStudent(selectedOption);
    setSelectedClassId(selectedOption.class_id); // from custom field
    setSelectedSectionId(selectedOption.section_id); //correct

    console.log("Class ID:", selectedOption.class_id);
    console.log("Section ID:", selectedOption.section_id);
  };
  const studentOptions = useMemo(
    () =>
      studentNameWithClassId?.map((cls) => ({
        value: `${cls.class_id}-${cls.section_id}`,
        class_id: cls.class_id,
        section_id: cls.section_id,
        label: `${cls.classname} ${cls.sectionname}`,
      })) || [],
    [studentNameWithClassId],
  );

  const handlePublishToggle = async (classId, sectionId) => {
    if (!classId || !sectionId) {
      toast.error("Please select class.");
      return;
    }
    const token = localStorage.getItem("authToken");

    // const currentStatus = publishStatus;
    // const newStatus = currentStatus === "Y" ? "Y" : "N";
    const currentStatus = publishStatus || "";

    const newStatus =
      currentStatus === "" ? "Y" : currentStatus === "Y" ? "Y" : "N";

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/api/publish_health_activity_card`,
        {
          class_id: classId,
          section_id: sectionId,
          publish: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response?.data?.status) {
        // use backend value (better than frontend toggle)
        const updatedStatus = response?.data?.publish_status;

        setPublishStatus(updatedStatus);

        toast.success(response?.data?.message);
      } else {
        toast.error(response?.data?.message || "Failed to update status.");
      }
    } catch (err) {
      console.error("Publish toggle error:", err);
      toast.error("Error saving publish status.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div className="w-full md:w-[50%] max-w-4xl mx-auto p-3 sm:p-4">
        <ToastContainer />

        <div className="bg-white rounded-md shadow-md">
          {/* Header */}
          <div className="flex justify-between items-center px-3 sm:px-4 py-3 border-b">
            <h5 className="text-gray-700 text-sm sm:text-base lg:text-lg font-medium">
              Publish Health And Activity Card
            </h5>

            <RxCross1
              className="text-lg sm:text-xl text-red-600 hover:cursor-pointer hover:bg-red-100 rounded"
              onClick={() => navigate("/dashboard")}
            />
          </div>

          <div className="w-full h-1 bg-[#C03078]" />

          <div className="p-3 sm:p-4">
            <div className="border border-blue-400 rounded-md shadow-sm overflow-hidden">
              <div className="bg-blue-50 text-sm font-semibold text-gray-800 text-center py-2">
                Select Class <span className="text-sm text-red-500">*</span>
              </div>

              <div className="p-3 sm:p-4 bg-white flex justify-center">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                  <div className="w-full sm:w-64">
                    {initialLoading ? (
                      <div className="text-blue-600 text-sm flex items-center gap-2 py-2">
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
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Loading data...
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
                              minHeight: "38px",
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

                  <button
                    onClick={() =>
                      handlePublishToggle(selectedClassId, selectedSectionId)
                    }
                    className={`w-full sm:w-auto px-4 py-2 rounded-md text-white transition 
    ${
      publishStatus === "N"
        ? "bg-red-600 hover:bg-red-700"
        : "bg-green-600 hover:bg-green-700"
    }
    ${loading ? "opacity-50 cursor-not-allowed" : ""}
  `}
                  >
                    {loading
                      ? "Processing..."
                      : publishStatus === "N"
                        ? "Unpublish"
                        : "Publish"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PublishHealthActivityRecord;

//  <div className="bg-white border border-blue-400 rounded-md shadow-md overflow-x-auto">
//    <div className="grid grid-cols-2 border-b border-gray-200 px-4 py-2 bg-blue-50 text-sm font-semibold text-gray-800">
//      <div className="text-center">Select Class</div>
//      <div></div>
//    </div>

//    <div className="px-4 py-4 bg-white text-sm flex justify-center">
//      <div className="flex items-center gap-4 flex-wrap">
//        <div className="w-64">
//          {initialLoading ? (
//            <div className="text-blue-600 text-sm flex items-center gap-2 py-3 px-2">
//              <svg
//                className="animate-spin h-5 w-5"
//                xmlns="http://www.w3.org/2000/svg"
//                fill="none"
//                viewBox="0 0 24 24"
//              >
//                <circle
//                  className="opacity-25"
//                  cx="12"
//                  cy="12"
//                  r="10"
//                  stroke="currentColor"
//                  strokeWidth="4"
//                ></circle>
//                <path
//                  className="opacity-75"
//                  fill="currentColor"
//                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
//                ></path>
//              </svg>
//              Loading data, please wait...
//            </div>
//          ) : (
//            <>
//              <Select
//                value={selectedStudent}
//                onChange={handleStudentSelect}
//                options={studentOptions}
//                placeholder="Select"
//                isSearchable
//                isClearable
//                isDisabled={loadingExams}
//                menuPortalTarget={document.body}
//                menuPosition="fixed"
//                className="text-sm"
//                styles={{
//                  control: (base) => ({
//                    ...base,
//                    fontSize: ".9em",
//                    minHeight: "36px",
//                  }),
//                  menu: (base) => ({
//                    ...base,
//                    zIndex: 9999,
//                    fontSize: ".9em",
//                  }),
//                }}
//              />
//              {studentError && (
//                <p className="text-xs text-red-500 mt-1">{studentError}</p>
//              )}
//            </>
//          )}
//        </div>

//        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition">
//          Publish
//        </button>
//      </div>
//    </div>
//  </div>;
