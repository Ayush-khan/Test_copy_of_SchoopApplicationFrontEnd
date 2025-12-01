import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";

const PullPreviousYearMarksAllotmentData = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [currentPage, setCurrentPage] = useState(0);

  const [loadingForSearch, setLoadingForSearch] = useState(false);

  const navigate = useNavigate();
  const [loadingExams, setLoadingExams] = useState(false);

  const [timetable, setTimetable] = useState([]);

  const pageSize = 10;
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const [roleId, setRoleId] = useState("");
  const [regId, setRegId] = useState("");

  const [currentAcademicYear, setCurrentAcademicYear] = useState("");
  const [previousAcademicYear, setPreviousAcademicYear] = useState("");
  const [examCurrentList, setCurrentExamList] = useState([]);
  const [examPreviousList, setPreviosExamList] = useState([]);

  const [selectedCurrent, setSelectedCurrent] = useState("");
  const [selectedPrevious, setSelectedPrevious] = useState("");
  const [selectedCurrentId, setSelectedCurrentId] = useState("");
  const [selectedPreviousId, setSelectedPreviousId] = useState("");
  const [currenrError, setCurrentError] = useState("");
  const [previousError, setPreviousError] = useState("");

  useEffect(() => {
    fetchDataRoleId();
  }, []);

  const fetchDataRoleId = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.error("No authentication token found");
      return;
    }

    try {
      const sessionResponse = await axios.get(`${API_URL}/api/sessionData`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const role_id = sessionResponse.data.user.role_id;
      const reg_id = sessionResponse.data.user.reg_id;
      const academicyear = sessionResponse.data.custom_claims?.academic_year;

      setRoleId(role_id);
      setRegId(reg_id);
      setCurrentAcademicYear(academicyear);

      console.log("acadmeic year", academicyear);

      return { roleId, regId };
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getPreviousAcademicYear = (currentAcademicYear) => {
    if (!currentAcademicYear) return "";

    const [startYear, endYear] = currentAcademicYear.split("-");

    const prevStartYear = parseInt(startYear, 10) - 1;
    const prevEndYear = parseInt(endYear, 10) - 1;

    return `${prevStartYear}-${prevEndYear}`;
  };

  // Example usage inside useEffect if currentAcademicYear comes from state or API
  useEffect(() => {
    if (currentAcademicYear) {
      const prevAcdYear = getPreviousAcademicYear(currentAcademicYear);
      setPreviousAcademicYear(prevAcdYear);
    }
    console.log(previousAcademicYear);
  }, [currentAcademicYear]);

  useEffect(() => {
    if (currentAcademicYear) {
      fetchCurrentExam();
    }
  }, [currentAcademicYear]);

  useEffect(() => {
    if (previousAcademicYear) {
      fetchPreviousExam();
    }
  }, [previousAcademicYear]);

  const fetchCurrentExam = async () => {
    try {
      setLoadingExams(true);

      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/exams_academicyr/${currentAcademicYear}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCurrentExamList(response.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Error fetching data.");
    } finally {
      setLoadingExams(false);
    }
  };

  const fetchPreviousExam = async () => {
    try {
      setLoadingExams(true);

      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/exams_academicyr/${previousAcademicYear}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPreviosExamList(response.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Error fetching data.");
    } finally {
      setLoadingExams(false);
    }
  };

  const handleExamCurrentSelect = (selectedOption) => {
    setCurrentError("");
    setSelectedCurrent(selectedOption);
    setSelectedCurrentId(selectedOption?.value);
  };

  const handleExamPreviousSelect = (selectedOption) => {
    setPreviousError("");
    setSelectedPrevious(selectedOption);
    setSelectedPreviousId(selectedOption?.value);
  };

  const currentExamOptions = useMemo(() => {
    if (!Array.isArray(examCurrentList)) return [];

    return examCurrentList.map((cls) => ({
      value: cls.exam_id,
      label: `${cls.name} (${cls.comment})`,
    }));
  }, [examCurrentList]);

  const previosExamOptions = useMemo(() => {
    if (!Array.isArray(examPreviousList)) return [];

    return examPreviousList.map((cls) => ({
      value: cls.exam_id,
      label: `${cls.name} (${cls.comment})`,
    }));
  }, [examPreviousList]);

  const handlePull = async () => {
    setCurrentError("");
    setPreviousError("");
    setSearchTerm("");
    setTimetable([]);

    // Validation
    if (!selectedPreviousId) {
      setPreviousError("Please select Exam From.");
      return;
    }
    if (!selectedCurrentId) {
      setCurrentError("Please select Exam To.");
      return;
    }

    try {
      setLoadingForSearch(true);

      const token = localStorage.getItem("authToken");

      const params = {
        exam_from_id: selectedCurrentId,
        exam_to_id: selectedPreviousId,
      };

      const response = await axios.post(
        `${API_URL}/api/marks/pull_prev_year`,
        params, // body
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const status = response?.data?.status;
      const message = response?.data?.message;
      const data = response?.data?.data || [];

      // ✅ If API returns success
      if (status === true) {
        toast.success(message || "Data pulled successfully.");

        if (data.length > 0) {
          setTimetable(data);
          setPageCount(Math.ceil(data.length / pageSize));
        } else {
          setTimetable([]);
        }
      }

      // ❌ If API returns failure (status: false)
      else if (status === false) {
        toast.error(message || "Data is already pulled.");
        setTimetable([]);
      }
    } catch (error) {
      console.error("Error fetching :", error);

      // Handle API 400 error structure
      if (error?.response?.status === 400) {
        toast.error(
          error?.response?.data?.message || "Data is already pulled."
        );
      } else {
        toast.error("Error pulling data. Please try again.");
      }
    } finally {
      setLoadingForSearch(false);
    }
  };

  console.log("row", timetable);

  const filteredSections = timetable.filter((section) => {
    const searchLower = searchTerm.toLowerCase();

    // Extract relevant fields and convert them to lowercase for case-insensitive search

    const regNo = section?.reg_no?.toLowerCase() || "";
    const admissionClass = section?.admission_class?.toLowerCase() || "";
    const studentName = `${section?.first_name || ""} ${
      section?.mid_name?.trim() || ""
    } ${section?.last_name || ""}`
      .toLowerCase()
      .trim();
    const studentDOB = section?.dob?.toLowerCase() || "";
    const admissionDate = section?.admission_date?.toLowerCase() || "";
    const permanentAddress = section?.permant_add?.toLowerCase() || "";
    const studentCity = section?.city?.toLowerCase() || "";
    const studentState = section?.state?.toLowerCase() || "";
    const studentPincode = section?.pincode?.toString().toLowerCase() || "";
    const studentNationality = section?.nationality?.toLowerCase() || "";
    const studentMotherTongue = section?.mother_tongue?.toLowerCase() || "";
    const studentGender =
      section?.gender === "M"
        ? "male"
        : section?.gender === "F"
        ? "female"
        : section?.gender?.toLowerCase() || "";
    const studentBloodGroup = section?.blood_group?.toLowerCase() || "";
    const studentReligion = section?.religion?.toLowerCase() || "";
    const studentCaste = section?.caste?.toLowerCase() || "";
    const studentCategory = section?.category?.toLowerCase() || "";
    const emergencyName = section?.emergency_name?.toLowerCase() || "";
    const emergencyAddress = section?.emergency_add?.toLowerCase() || "";
    const emergencyContact = section?.emergency_contact?.toLowerCase() || "";
    const studentAadhaar = section?.stu_aadhaar_no?.toLowerCase() || "";
    const fatherName = section?.father_name?.toLowerCase() || "";
    const fatherMobile = section?.f_mobile?.toLowerCase() || "";
    const fatherEmail = section?.f_email?.toLowerCase() || "";
    const motherName = section?.mother_name?.toLowerCase() || "";
    const motherMobile = section?.m_mobile?.toLowerCase() || "";
    const motherEmail = section?.m_emailid?.toLowerCase() || "";
    const parentAadhaar = section?.parent_adhar_no?.toLowerCase() || "";
    const totalPercent = section?.total_percent?.toLowerCase() || "";
    const totalAttendance = section?.total_attendance?.toLowerCase() || "";

    // Check if the search term is present in any of the specified fields
    return (
      regNo.includes(searchLower) ||
      admissionClass.includes(searchLower) ||
      studentName.includes(searchLower) ||
      studentDOB.includes(searchLower) ||
      admissionDate.includes(searchLower) ||
      permanentAddress.includes(searchLower) ||
      studentCity.includes(searchLower) ||
      studentState.includes(searchLower) ||
      studentPincode.includes(searchLower) ||
      studentNationality.includes(searchLower) ||
      studentMotherTongue.includes(searchLower) ||
      studentGender.includes(searchLower) ||
      studentBloodGroup.includes(searchLower) ||
      studentReligion.includes(searchLower) ||
      studentCaste.includes(searchLower) ||
      studentCategory.includes(searchLower) ||
      emergencyName.includes(searchLower) ||
      emergencyAddress.includes(searchLower) ||
      emergencyContact.includes(searchLower) ||
      studentAadhaar.includes(searchLower) ||
      fatherName.includes(searchLower) ||
      fatherMobile.includes(searchLower) ||
      fatherEmail.includes(searchLower) ||
      motherName.includes(searchLower) ||
      motherMobile.includes(searchLower) ||
      motherEmail.includes(searchLower) ||
      parentAadhaar.includes(searchLower) ||
      totalPercent.includes(searchLower) ||
      totalAttendance.includes(searchLower)
    );
  });

  const displayedSections = filteredSections.slice(currentPage * pageSize);
  return (
    <>
      <div
        className={`mx-auto p-4 transition-all duration-700 ease-[cubic-bezier(0.4, 0, 0.2, 1)] transform ${
          timetable.length > 0
            ? "w-full md:w-[60%] scale-100"
            : "w-full md:w-[60%] scale-[0.98]"
        }`}
      >
        <ToastContainer />
        <div className="card  rounded-md ">
          <div className=" card-header mb-4 flex justify-between items-center ">
            <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
              Pull Previous Year Marks Allotment Data
            </h5>
            <RxCross1
              className="  relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
              onClick={() => {
                navigate("/dashboard");
              }}
            />
          </div>
          <div
            className=" relative w-[98%] -top-6 h-1  mx-auto bg-red-700"
            style={{
              backgroundColor: "#C03078",
            }}
          ></div>

          <>
            <div
              className={`w-full mx-auto p-4 ${
                timetable.length > 0 ? "md:w-[80%]" : "md:w-[80%]"
              }`}
            >
              <div className="flex flex-col gap-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <label className="w-full md:w-[40%] text-md font-medium">
                    Exam From {`(${previousAcademicYear})`}{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <div className="w-full md:w-[55%]">
                    <Select
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      value={selectedPrevious}
                      onChange={handleExamPreviousSelect}
                      options={previosExamOptions}
                      placeholder={loadingExams ? "Loading..." : "Select"}
                      isSearchable
                      isClearable
                      className="text-sm"
                      isDisabled={loadingExams}
                    />

                    {previousError && (
                      <p className="text-red-500 text-xs mt-1">
                        {previousError}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <label className="w-full md:w-[40%] text-md font-medium">
                    Exam To {`(${currentAcademicYear})`}{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <div className="w-full md:w-[55%]">
                    <Select
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      value={selectedCurrent}
                      onChange={handleExamCurrentSelect}
                      options={currentExamOptions}
                      placeholder={loadingExams ? "Loading..." : "Select"}
                      isSearchable
                      isClearable
                      className="text-sm"
                      isDisabled={loadingExams}
                    />

                    {currenrError && (
                      <p className="text-red-500 text-xs mt-1">
                        {currenrError}
                      </p>
                    )}
                  </div>
                </div>

                {/* Browse Button */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handlePull}
                    style={{ backgroundColor: "#2196F3" }}
                    className={`btn h-10 w-32 text-white font-bold px-4 rounded shadow ${
                      loadingForSearch ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={loadingForSearch}
                  >
                    {loadingForSearch ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin h-4 w-4 mr-2 text-white"
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
                        Pulling
                      </span>
                    ) : (
                      "Pull"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        </div>
      </div>
    </>
  );
};

export default PullPreviousYearMarksAllotmentData;
