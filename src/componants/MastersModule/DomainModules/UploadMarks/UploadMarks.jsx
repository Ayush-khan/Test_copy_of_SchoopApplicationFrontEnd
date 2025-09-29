import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import { RxCross1 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Select from "react-select";

function UploadMarks() {
  const API_URL = import.meta.env.VITE_API_URL; // URL for host
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  //   variable to store the respone of the allot subject tab
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingandPublishing, setIsSubmittingandPublishing] =
    useState(false);

  const [filteredSections, setFilteredSections] = useState([]);
  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");

  const [classSectionList, setClassSectionList] = useState([]);
  const [selectedClassSection, setSelectedClassSection] = useState(null);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [loadingClassSection, setLoadingClassSection] = useState(false);

  const [monthError, setMonthError] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedMonthId, setSelectedMonthId] = useState(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState(null);

  const pageSize = 10;
  // State for form fields and validation errors
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(""); // For success message
  const [errorMessage, setErrorMessage] = useState(""); // For error message
  const [errorMessageUrl, setErrorMessageUrl] = useState(""); // For error message
  const [loading, setLoading] = useState(false); // For loader
  const [showDisplayUpload, setShowDisplayUpload] = useState(false);
  const [isDataPosted, setIsDataPosted] = useState(false); // Flag for tracking successful post
  const [userName, setUserName] = useState("");
  const [holidays, setHolidays] = useState([]);
  const [selectedHolidays, setSelectedHolidays] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentHoliday, setCurrentHoliday] = useState("");
  const [currentHolidayNameForDelete, setCurrentHolidayNameForDelete] =
    useState("");
  const [publishedHolidays, setPublishedHolidays] = useState([]);
  const [deletedHolidays, setDeletedHolidays] = useState([]);
  const [dateLimits, setDateLimits] = useState({ min: "", max: "" });
  // const [formData, setFormData] = useState({ holiday_date: "" });
  const [allClasses, setAllClasses] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState("");
  const [errors, setErrors] = useState({});
  const [roles, setRoles] = useState([]);
  const [loadingEvent, setLoadingEvent] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    holiday_date: "",
    to_date: "",
  });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [roleId, setRoleId] = useState(null);
  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [loadingExams, setLoadingExams] = useState(false);
  const [studentError, setStudentError] = useState("");
  const [regId, setRegId] = useState(null);

  const [examOptions, setExamOptions] = useState([]);
  const [termsOptions, setTermsOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);

  const [loadingExamsData, setLoadingExamsData] = useState(false);
  const [loadingTermsData, setLoadingTermsData] = useState(false);
  const [loadingSubjectsData, setLoadingSubjectsData] = useState(false);

  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedTerms, setSelectedTerms] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [loadingForSearch, setLoadingForSearch] = useState(false);
  const [showSearchForm, setShowSearchForm] = useState(true);
  const [examError, setExamError] = useState("");
  const [showUploadSection, setShowUploadSection] = useState(false);
  const [dataUploaded, setDataUploaded] = useState(false); // new state
  const [tableDataReady, setTableDataReady] = useState(false);

  const [subjectError, setSubjectError] = useState("");
  const navigate = useNavigate();

  // Fetch roleId and class list on mount
  useEffect(() => {
    const init = async () => {
      const sessionData = await fetchRoleId();
      if (sessionData) {
        await fetchClass(sessionData.roleId, sessionData.regId);
      }
    };

    init();
    fetchClass();
  }, []);

  // Fetch roleId and regId from session
  const fetchRoleId = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      toast.error("Authentication token not found. Please login again.");
      navigate("/");
      return null;
    }

    try {
      const response = await axios.get(`${API_URL}/api/sessionData`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const roleId = response?.data?.user?.role_id;
      const regId = response?.data?.user?.reg_id;

      if (roleId) {
        setRoleId(roleId);
        setRegId(regId);
        return { roleId, regId };
      } else {
        console.warn("role_id not found in sessionData response");
        return null;
      }
    } catch (error) {
      console.error("Failed to fetch session data:", error);
      return null;
    }
  };

  // Fetch class list based on role
  const fetchClass = async (roleId, regId) => {
    const token = localStorage.getItem("authToken");
    setLoadingExams(true);

    try {
      if (roleId === "T") {
        const response = await axios.get(
          `${API_URL}/api/get_teacherclasstimetable?teacher_id=${regId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const mappedData = response.data.data.map((item) => ({
          section_id: item.section_id,
          class_id: item.class_id,
          get_class: { name: item.classname },
          name: item.sectionname,
        }));

        setStudentNameWithClassId(mappedData || []);
      } else {
        const response = await axios.get(`${API_URL}/api/get_class_section`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setStudentNameWithClassId(response?.data || []);
      }
    } catch (error) {
      toast.error("Error fetching Classes");
      console.error("Error fetching Classes:", error);
    } finally {
      setLoadingExams(false);
    }
  };

  // Memoize class options for dropdown
  const studentOptions = useMemo(
    () =>
      studentNameWithClassId.map((cls) => ({
        value: cls?.section_id,
        valueclass: cls?.class_id,
        class: cls?.get_class?.name,
        section: cls.name,
        label: `${cls?.get_class?.name} ${cls.name}`,
      })),
    [studentNameWithClassId]
  );

  // Handle class select - fetch exams and subjects for selected class
  const handleClassSelect = async (selectedOption) => {
    setStudentError("");
    setSelectedStudent(selectedOption);
    setSelectedStudentId(selectedOption?.value);

    // Reset related selects & loading states
    setExamOptions([]);
    setSubjectOptions([]);
    setSelectedExam(null);
    setSelectedSubject(null);

    if (!selectedOption) return;

    const class_id = selectedOption?.valueclass;
    const section_id = selectedOption?.value;

    setLoadingExamsData(true);
    setLoadingSubjectsData(true);

    await Promise.all([
      fetchSubjectsByClassId(),
      fetchExamsByClassIdSubjectId(class_id),
    ]);

    setLoadingExamsData(false);
    setLoadingSubjectsData(false);
  };

  // Fetch Terms (not dependent on class)
  const fetchSubjectsByClassId = async () => {
    const token = localStorage.getItem("authToken");
    setLoadingTermsData(true);
    const classId = selectedStudent?.valueclass;
    const sectionId = selectedStudent?.value;
    try {
      const response = await axios.get(`${API_URL}/api/get_subject_by_class`, {
        params: {
          class_id: classId,
          section_id: sectionId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const mappedSubjects =
        response?.data?.data?.map((subject) => ({
          label: subject.name,
          value: subject.sub_rc_master_id,
        })) || [];

      setTermsOptions(mappedSubjects);
    } catch (err) {
      console.error("Error fetching subjects:", err);
    } finally {
      setLoadingTermsData(false);
    }
  };

  // Fetch Exams by class ID
  const fetchExamsByClassIdSubjectId = async (classId) => {
    const token = localStorage.getItem("authToken");
    const subjectId = termsOptions?.value;
    try {
      const response = await axios.get(
        `${API_URL}/api/get_exams_by_class_subject`,
        {
          params: {
            class_id: classId,
            sub_rc_master_id: subjectId,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const mappedExams =
        response?.data?.data?.map((exam) => ({
          label: exam.name,
          value: exam?.exam_id,
        })) || [];

      setExamOptions(mappedExams);
    } catch (err) {
      console.error("Error fetching exams:", err);
    }
  };

  const handleSearch = async () => {
    setStudentError("");
    setExamError("");
    setSubjectError("");
    setLoadingForSearch(true);

    let hasError = false;

    if (!selectedStudent) {
      setStudentError("Please select a Class.");
      hasError = true;
    }
    if (!selectedExam) {
      setExamError("Please select an Exam.");
      hasError = true;
    }
    // if (!selectedSubject) {
    //   setSubjectError("Please select a Subject.");
    //   hasError = true;
    // }

    if (hasError) {
      setLoadingForSearch(false);
      return;
    }

    try {
      toast.info("Searching, please wait...");

      // 🌟 We want to keep the Upload button visible
      setShowUploadSection(false); // just close modal (not hide the button)
      setDataUploaded(false); // Reset data uploaded state
      setTableDataReady(false); // reset for new search

      setLoadingEvent(true);
      const token = localStorage.getItem("authToken");

      const response = await axios.get(`${API_URL}/api/get_eventlist`, {
        params: {
          class_id: selectedSectionId,
          month_year: selectedMonthId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const eventData = response.data?.data || [];

      if (!eventData.length) {
        toast.warn("No events found for the selected criteria.");
        return;
      }

      // Set academic year and date limits if applicable
      const academicYear = eventData[0]?.academic_yr;
      if (academicYear) {
        setDateLimits(getDateLimits(academicYear));
      }

      // ✅ Update UI
      setHolidays(eventData);
      setPageCount(Math.ceil(eventData.length / pageSize));
      toast.success("Search successful! Events loaded.");

      // 🌟 These 2 lines are most important
      setDataUploaded(true); // ✅ show Upload Button
      setTableDataReady(true); // ✅ show Table
    } catch (error) {
      console.error("Search Error:", error);
      toast.error("Error occurred while searching or fetching events.");
    } finally {
      setLoadingForSearch(false);
      setLoadingEvent(false);
    }
  };

  const capitalizeWords = (str) =>
    str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

  const getDateLimits = (academicYear) => {
    if (!academicYear) return {};

    const [startYear, endYear] = academicYear.split("-").map(Number);

    return {
      min: `${startYear}-04-01`, // Start of academic year (April 1st)
      max: `${endYear}-03-31`, // End of academic year (March 31st)
    };
  };

  // Handle pagination
  const handlePageClick = (data) => {
    console.log("Page clicked:", data.selected);
    setCurrentPage(data.selected);
  };

  const handleEdit = (holiday) => {
    navigate(`/editEvent/${holiday.unq_id}`, { state: { holiday } });
  };

  const handleView = (holiday) => {
    console.log("inside view", holiday);

    setShowViewModal(true);
    setSelectedHoliday(holiday);
  };

  const handleSelectAll = () => {
    if (!holidays || holidays.length === 0) {
      toast.warning("No events available to select.");
      return;
    }

    // Find all unpublished events only
    const unpublishedHolidayIds = holidays
      .filter((holiday) => holiday.publish === "N")
      .map((holiday) => holiday.unq_id);

    if (unpublishedHolidayIds.length === 0) {
      toast.warning("No unpublished events available for publish.");
      setSelectAll(false); // ✅ make sure checkbox stays unchecked
      setSelectedHolidays([]);
      return;
    }

    setSelectAll((prev) => {
      const newSelectAll = !prev;

      if (newSelectAll) {
        // ✅ Only unpublished IDs will be selected
        setSelectedHolidays(unpublishedHolidayIds);
        console.log("allUnpublishedEvents", unpublishedHolidayIds);
      } else {
        // Deselect all
        setSelectedHolidays([]);
      }

      return newSelectAll;
    });
  };

  const handleCheckboxChange = (holidayId) => {
    if (selectedHolidays.includes(holidayId)) {
      setSelectedHolidays(selectedHolidays.filter((id) => id !== holidayId));
    } else {
      setSelectedHolidays([...selectedHolidays, holidayId]);
    }
  };

  const handlePublish = async () => {
    // 1️⃣ Check if there are any events at all
    if (!holidays || holidays.length === 0) {
      toast.warning("No events available for publish.");
      return;
    }

    // 2️⃣ Check if the user selected any events
    if (!selectedHolidays || selectedHolidays.length === 0) {
      toast.warning("Please select at least one event to publish.");
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem("authToken");

    if (!token) {
      alert("Authentication required. Please log in.");
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      selectedHolidays.forEach((id) => formData.append("checkbxuniqid[]", id));
      console.log("selectedHolidys", selectedHolidays);

      const response = await axios.post(
        `${API_URL}/api/update_publishevent`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = response.data;

      if (data.success) {
        toast.success(data.message || "Event published successfully!");
        setHolidays((prev) =>
          prev.map((holiday) =>
            selectedHolidays.includes(holiday.unq_id)
              ? { ...holiday, publish: "Y" }
              : holiday
          )
        );
        setSelectedHolidays([]);
        setSelectAll(false);
      } else {
        toast.error(data.message || "Failed to publish events.");
      }
    } catch (error) {
      console.error("Error publishing events:", error);
      toast.error("An error occurred while publishing events.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const storedDeletedHolidays =
      JSON.parse(localStorage.getItem("deletedHolidays")) || [];
    setDeletedHolidays(storedDeletedHolidays);
  }, []);

  const handleDelete = (holiday) => {
    setCurrentHoliday(holiday.unq_id);
    setCurrentHolidayNameForDelete(holiday.title);

    console.log("Event to delete:", holiday);
    console.log("Current Event name for delete:", holiday.title);

    // Show confirmation modal for all holidays (published & unpublished)
    setShowDeleteModal(true);
  };

  const handleDownloadTemplate = async () => {
    if (selectedClasses.length === 0) {
      toast.error("Please select at least one class to download the template.");
      return; // Stop function execution
    }

    const token = localStorage.getItem("authToken");

    try {
      const response = await axios.get(
        `${API_URL}/api/get_template_csv_event`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      let filename = "event_template.csv"; // Default fallback

      if (selectedClasses.length === allClasses.length) {
        filename = "all_event.csv";
      } else if (selectedClasses.length > 0) {
        const selectedClassNames = allClasses
          .filter((cls) => selectedClasses.includes(cls.class_id))
          .map((cls) => cls.name.replace(/\s+/g, "_"));

        filename = `${selectedClassNames.join("_")}_event.csv`;
      }

      triggerFileDownload(response.data, filename);
    } catch (error) {
      console.error("Error downloading template:", error);
    }
  };

  // Helper function to trigger file download
  const triggerFileDownload = (blobData, fileName) => {
    const url = window.URL.createObjectURL(new Blob([blobData]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName); // Set the file name
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); // Cleanup after download
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);

      setErrorMessage("");
      setErrorMessageUrl("");
      setUploadStatus("");
    }

    e.target.value = null;
  };

  const downloadCsv = async (fileUrl) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        `${API_URL}/api/download_csv_rejected/${fileUrl}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob", //Correct placement
        }
      );

      //  Build dynamic filename based on selected classes
      let filename = "rejected_template.csv"; // fallback
      if (selectedClasses.length > 0 && allClasses.length > 0) {
        const selectedClassNames = allClasses
          .filter((cls) => selectedClasses.includes(cls.class_id))
          .map((cls) => cls.name.replace(/\s+/g, "_"));
        filename = `${selectedClassNames.join("_")}.rejected.template.csv`;
      }

      triggerFileDownload(response.data, filename);
    } catch (error) {
      console.error("Error downloading template:", error);
      toast.error("Failed to download the file.");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage("Please select a file first.");
      return;
    }

    setErrorMessage("");
    setErrorMessageUrl("");
    setUploadStatus("");

    const fileName = selectedFile.name.trim();

    // Accept if filename ends with "_event.csv" or "_rejected_template.csv" (+ optional numbered suffix like (1), (2))
    const validPattern = /_(event|rejected_template)(\s?\(\d+\))?\.csv$/i;
    const validPatternone = /(event|rejected_template)(\s?\(\d+\))?\.csv$/i;

    if (!validPattern.test(fileName) && !validPatternone.test(fileName)) {
      toast.warning("Please check if correct file is selected for upload.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setDataUploaded(true); // ✅ Now show the table
      setErrorMessage("");
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.post(
        `${API_URL}/api/import_event_csv`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Events Data posted successfully!");
        setIsDataPosted(true);
        setSelectedFile(null);
        handleSearch();
      }

      setTimeout(() => {
        handleReset();
      }, 2000);
    } catch (error) {
      setLoading(false);

      const showErrorForUploading = error?.response?.data?.message;
      const showErrorForUploadingUrl = error?.response?.data?.invalid_rows;

      setErrorMessage(
        !showErrorForUploading
          ? "Failed to upload file. Please try again..."
          : `Error: ${showErrorForUploading}.`
      );

      setErrorMessageUrl(`${showErrorForUploadingUrl}`);

      toast.error(
        !showErrorForUploading
          ? "Error uploading file."
          : error?.response?.data?.message
      );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return " ";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-4); // Last 2 digits of the year
    return `${day}-${month}-${year}`;
  };

  const handleReset = () => {
    setShowUploadSection(false);
    setSelectedClasses([]);
    setSelectedFile(null);
    setErrorMessage("");
    setErrorMessageUrl("");
    setUploadStatus("");
    setIsDataPosted(false);
    setShowUploadSection(false);
    setDataUploaded(false);
    setSelectedFile(null);
    setErrorMessage("");
    setUploadStatus("");
  };

  useEffect(() => {
    const trimmedSearch = searchTerm.trim().toLowerCase();

    if (trimmedSearch !== "" && prevSearchTermRef.current === "") {
      previousPageRef.current = currentPage; // Save current page before search
      setCurrentPage(0); // Jump to first page when searching
    }

    if (trimmedSearch === "" && prevSearchTermRef.current !== "") {
      setCurrentPage(previousPageRef.current); // Restore saved page when clearing search
    }

    prevSearchTermRef.current = trimmedSearch;
  }, [searchTerm]);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setShowUploadSection(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    const filtered = (Array.isArray(holidays) ? holidays : []).filter(
      (holiday) => {
        if (!searchTerm) return true;

        const searchLower = searchTerm.toLowerCase().trim();
        const holidayName = holiday?.title?.toLowerCase().trim() || "";
        const holidayStartDate =
          holiday?.start_date?.toLowerCase().trim() || "";
        const createdBy = holiday?.created_by_name?.toLowerCase().trim() || "";

        return (
          holidayName.includes(searchLower) ||
          holidayStartDate.includes(searchLower) ||
          createdBy.includes(searchLower)
        );
      }
    );

    setFilteredSections(filtered);
  }, [holidays, searchTerm]);

  console.log("filtered events", filteredSections);
  useEffect(() => {
    setPageCount(Math.ceil(filteredSections.length / pageSize));
  }, [filteredSections, pageSize]);

  const displayedSections = filteredSections.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  console.log("displayted sections", displayedSections);

  return (
    <>
      <div className="md:mx-auto md:w-[90%] p-4 bg-white mt-4 ">
        <div className="w-full  flex flex-row justify-between">
          <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
            Enter exam marks
          </h3>
          <RxCross1
            className=" relative  mt-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
            onClick={() => {
              navigate("/dashboard");
            }}
          />
        </div>

        <div
          className=" relative  mb-8   h-1  mx-auto bg-red-700"
          style={{
            backgroundColor: "#C03078",
          }}
        ></div>
        {/* Step 1: Dropdown + Browse Button */}
        {!showUploadSection && (!dataUploaded || !tableDataReady) && (
          <div className="bg-white w-full md:w-[97%] mx-auto rounded-md ">
            {/* ✅ Place your dropdowns and "Browse" button section here */}
            <div className="mb-10 ml-5">
              <div className="w-full bg-white shadow-md rounded-xl p-6 border border-gray-200">
                {/* Form Container */}
                <div className="flex flex-col md:flex-row md:items-end md:gap-x-6 gap-y-6">
                  {/* Class Dropdown */}
                  <div className="w-full md:w-1/3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Class <span className="text-red-500">*</span>
                    </label>
                    <Select
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      id="studentSelect"
                      value={selectedStudent}
                      onChange={handleClassSelect}
                      options={studentOptions}
                      placeholder={loadingExams ? "Loading..." : "Select"}
                      isSearchable
                      isClearable
                      isDisabled={loadingExams}
                      className="text-sm"
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          fontSize: "0.9em",
                          minHeight: "36px",
                        }),
                        menu: (provided) => ({
                          ...provided,
                          fontSize: "0.9em",
                        }),
                        option: (provided) => ({
                          ...provided,
                          fontSize: "0.85em",
                        }),
                      }}
                    />
                    {studentError && (
                      <p className="text-xs text-red-500 mt-1">
                        {studentError}
                      </p>
                    )}
                  </div>

                  {/* Exam Dropdown */}
                  <div className="w-full md:w-1/3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Exam
                    </label>
                    <Select
                      value={selectedExam}
                      onChange={(option) => setSelectedExam(option)}
                      options={examOptions}
                      placeholder={
                        loadingExamsData ? "Loading..." : "Select..."
                      }
                      isSearchable
                      isClearable
                      isDisabled={loadingExamsData}
                      className="text-sm"
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          fontSize: "0.9em",
                          minHeight: "36px",
                        }),
                        menu: (provided) => ({
                          ...provided,
                          fontSize: "0.9em",
                        }),
                        option: (provided) => ({
                          ...provided,
                          fontSize: "0.85em",
                        }),
                      }}
                    />
                    {examError && (
                      <p className="text-xs text-red-500 mt-1">{examError}</p>
                    )}
                  </div>

                  {/* Subject Dropdown */}
                  <div className="w-full md:w-1/3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <Select
                      value={selectedSubject}
                      onChange={(option) => setSelectedSubject(option)}
                      options={subjectOptions}
                      placeholder={
                        loadingSubjectsData ? "Loading..." : "Select..."
                      }
                      isSearchable
                      isClearable
                      isDisabled={loadingSubjectsData}
                      className="text-sm"
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          fontSize: "0.9em",
                          minHeight: "36px",
                        }),
                        menu: (provided) => ({
                          ...provided,
                          fontSize: "0.9em",
                        }),
                        option: (provided) => ({
                          ...provided,
                          fontSize: "0.85em",
                        }),
                      }}
                    />
                    {subjectError && (
                      <p className="text-xs text-red-500 mt-1">
                        {subjectError}
                      </p>
                    )}
                  </div>
                </div>

                {/* Buttons Row */}
                <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
                  {/* Browse Button */}
                  <button
                    onClick={handleSearch}
                    style={{ backgroundColor: "#2196F3" }}
                    className={`text-white font-semibold px-6 py-2 rounded-md shadow-sm border border-blue-500 transition duration-200 hover:bg-blue-600 ${
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
                        Browsing...
                      </span>
                    ) : (
                      "Browse"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Upload Excel UI */}
        {showUploadSection && (
          <div className="mt-4">
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white bg-opacity-90 backdrop-blur-md w-full max-w-6xl mx-4 rounded-xl shadow-2xl p-8 overflow-y-auto max-h-[90vh] relative border border-gray-200">
                {/* Close Button */}
                {/* Header with Title & Close Button */}
                <div className="flex items-center justify-between  ">
                  <h2 className="text-2xl font-bold text-blue-700 tracking-wide w-full text-center relative -top-4">
                    📂 Upload Student Marks from Excel
                    {/* Close Button */}
                    <RxCross1
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-2xl text-red-500 hover:text-red-700 cursor-pointer transition"
                      onClick={() => handleReset()}
                    />
                  </h2>
                </div>

                {/* Grid Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* LEFT: Download Instructions */}
                  <div className="bg-gradient-to-br from-blue-100 via-white to-blue-50 border border-blue-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
                        1
                      </span>
                      Download & Fill Marksheet
                    </h3>

                    <div className="text-sm text-gray-700 leading-relaxed space-y-3 mb-4">
                      <p>
                        <strong>Step 1:</strong> Please download the marksheet
                        format by clicking on the
                        <strong> "Download Marksheet format"</strong> button
                        below.
                      </p>
                      <p>
                        <strong>Step 2:</strong> Enter marks in the downloaded
                        file.
                      </p>
                    </div>

                    <div className="text-sm text-blue-900 bg-blue-50 p-4 rounded-md border border-blue-200">
                      <strong className="block mb-1 text-blue-700">PS:</strong>
                      • Do not change the contents of first 3 columns of the
                      downloaded Excel sheet. Please enter only marks.
                      <br />
                      • If a student is absent, leave the column blank in the
                      Excel sheet. The application will mark the child absent.
                      <br />
                      • Do not add or delete any student.
                      <br />• Do not change the name of the file.
                    </div>

                    <div className="flex justify-center">
                      <button
                        onClick={handleDownloadTemplate}
                        className="mt-6 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-medium rounded-full px-6 py-2 hover:from-blue-700 hover:to-blue-600 transition shadow-md flex items-center gap-2"
                      >
                        <i className="fas fa-download text-base"></i>
                        Download Marksheet Format
                      </button>
                    </div>
                  </div>

                  {/* RIGHT: Upload Instructions */}
                  <div className="bg-gradient-to-br from-purple-100 via-white to-purple-50 border border-purple-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
                        2
                      </span>
                      Upload & Finalize Marks
                    </h3>

                    <div className="text-sm text-gray-700 leading-relaxed space-y-3 mb-4">
                      <p>
                        <strong>Step 3:</strong> Please click on the{" "}
                        <strong>"Browse"</strong> button to select the file to
                        be uploaded.
                      </p>
                      <p>
                        <strong>Step 4:</strong> Please click on the{" "}
                        <strong>"Upload Marks"</strong> button to upload the
                        file.
                      </p>
                      <p>
                        <strong>Step 5:</strong> Marks will be saved and
                        displayed in the text boxes below.
                      </p>
                    </div>

                    <div className="text-sm text-purple-900 bg-purple-50 p-4 rounded-md border border-purple-200 mb-4">
                      <strong className="block mb-1 text-purple-700">
                        PS:
                      </strong>
                      • Marks in the textboxes can be edited.
                      <br />• Click on the <strong>"Save"</strong> button to
                      save the data.
                      <br />• Once the marks are finalised, click on the{" "}
                      <strong>"Publish"</strong> button to publish the data to
                      parents.
                    </div>

                    {/* File Picker + Upload Button - Horizontal Layout */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
                      {/* Choose File Button */}
                      <label className="bg-purple-600 text-white text-sm font-medium rounded-full px-5 py-2.5 hover:bg-purple-700 cursor-pointer shadow-md flex items-center gap-2 transition whitespace-nowrap">
                        <i className="fas fa-upload text-base"></i>
                        {selectedFile
                          ? selectedFile.name.length > 25
                            ? `${selectedFile.name.substring(0, 20)}...`
                            : selectedFile.name
                          : "Choose File"}
                        <input
                          type="file"
                          accept=".csv"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>

                      {/* Upload Button */}
                      <button
                        onClick={handleUpload}
                        className="bg-purple-700 hover:bg-purple-800 text-white text-sm font-medium rounded-full px-6 py-2.5 shadow-md transition flex items-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                      >
                        <i className="fas fa-cloud-upload-alt text-base"></i>
                        {loading ? "Uploading..." : "Upload Marks"}
                      </button>
                    </div>

                    {/* Errors / Status */}
                    {errorMessage && (
                      <p className="text-red-600 text-sm text-center mt-2">
                        {errorMessage}
                      </p>
                    )}

                    {errorMessageUrl && errorMessageUrl !== "undefined" && (
                      <p className="text-center mt-2">
                        <a
                          href="#"
                          className="text-blue-500 underline hover:text-blue-700"
                          onClick={(e) => {
                            e.preventDefault();
                            downloadCsv(errorMessageUrl);
                          }}
                        >
                          📥 Download CSV with Errors
                        </a>
                      </p>
                    )}

                    {uploadStatus && (
                      <p className="text-green-600 text-sm text-center mt-2">
                        {uploadStatus}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* ✅ Place your upload instructions, file input, and upload button here */}
          </div>
        )}

        {/* Step 3: Show table after upload */}
        {dataUploaded && tableDataReady && (
          <>
            {dataUploaded && (
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setShowUploadSection(true)} // ✅ Show modal on click
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition duration-200 shadow-md"
                >
                  Upload Marksheet from Excel Sheet
                </button>
              </div>
            )}

            <div className="w-full mt-4">
              <div className="card mx-auto lg:w-full shadow-lg">
                <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                  <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
                    Enter exam marks List
                  </h3>
                  <div className="box-border flex md:gap-x-2 justify-end md:h-10">
                    <div className=" w-1/2 md:w-fit mr-1">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search"
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <button
                      // type="submit"
                      className="btn btn-primary btn-sm md:h-9 text-xs md:text-sm"
                      onClick={handlePublish}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Publishing..." : "Publish"}
                    </button>
                  </div>
                </div>
                <div
                  className=" relative w-[97%]   mb-3 h-1  mx-auto bg-red-700"
                  style={{
                    backgroundColor: "#C03078",
                  }}
                ></div>

                <div className="card-body w-full">
                  <div className="h-96 lg:h-96 overflow-y-scroll lg:overflow-x-hidden w-full  md:w-[100%] mx-auto">
                    <table className="min-w-full leading-normal table-fixed">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="px-2 w-full md:w-[6%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                            Sr.No
                          </th>
                          <th className="px-2 w-full md:w-[6%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                            <input
                              type="checkbox"
                              checked={selectAll}
                              onChange={handleSelectAll}
                              className="cursor-pointer"
                            />{" "}
                            All
                          </th>
                          <th className="px-2 w-[20%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                            Event Title
                          </th>

                          <th className="px-2 w-full md:w-[15%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                            Class
                          </th>
                          <th className="px-2 w-full md:w-[10%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                            Start Date
                          </th>
                          <th className="px-2 w-full md:w-[15%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                            Created By
                          </th>
                          <th className="px-2 w-full md:w-[6%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                            Edit
                          </th>
                          <th className="px-2 w-full md:w-[6%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                            Delete
                          </th>
                          <th className="px-2 w-full md:w-[6%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                            View
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {loadingEvent ? (
                          <div className="absolute left-[1%] w-[100%]  text-center flex justify-center items-center mt-14">
                            <div className=" text-center text-xl text-blue-700">
                              Please Wait While Data is Loading...
                            </div>
                          </div>
                        ) : displayedSections.length ? (
                          displayedSections.map((holiday, index) => (
                            <tr
                              key={holiday.latest_event_id}
                              className="text-sm"
                            >
                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                {currentPage * pageSize + index + 1}
                              </td>

                              <td className="px-2 text-center lg:px-3 border border-gray-950 text-sm">
                                <p className="text-gray-900 whitespace-no-wrap relative top-2">
                                  {holiday.publish === "N" && (
                                    <input
                                      type="checkbox"
                                      checked={selectedHolidays.includes(
                                        holiday.unq_id
                                      )}
                                      onChange={(e) => {
                                        e.stopPropagation(); // Prevents row click from triggering publish
                                        handleCheckboxChange(holiday.unq_id);
                                      }}
                                    />
                                  )}
                                </p>
                              </td>

                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm text-nowrap">
                                {holiday.title}
                              </td>

                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                {holiday.classes && holiday.classes.length > 0
                                  ? holiday.classes
                                      .map((cls) => cls.class_name)
                                      .join(", ")
                                  : "-"}
                              </td>

                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                {holiday.start_date === "0000-00-00"
                                  ? " "
                                  : formatDate(holiday.start_date)}
                              </td>

                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                {capitalizeWords(holiday.created_by_name)}
                              </td>

                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                {holiday.publish === "N" && (
                                  <button
                                    className="text-blue-600 hover:text-blue-800 hover:bg-transparent"
                                    onClick={() => handleEdit(holiday)}
                                  >
                                    <FontAwesomeIcon icon={faEdit} />
                                  </button>
                                )}
                              </td>

                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                {deletedHolidays.includes(holiday.unq_id) ? (
                                  <span className="text-red-600 font-semibold">
                                    Deleted
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleDelete(holiday)}
                                    className="text-red-600 hover:text-red-800 hover:bg-transparent"
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </button>
                                )}
                              </td>

                              <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                                <button
                                  type="button"
                                  className="text-blue-600 hover:text-blue-800 hover:bg-transparent"
                                  onClick={() => handleView(holiday)}
                                >
                                  <MdOutlineRemoveRedEye className="font-bold text-xl" />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <div className="absolute left-[1%] w-[100%]  text-center flex justify-center items-center mt-14">
                            <div className=" text-center text-xl text-red-700">
                              Oops! No data found..
                            </div>
                          </div>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className=" flex justify-center pt-2 -mb-3">
                    <ReactPaginate
                      previousLabel={"Previous"}
                      nextLabel={"Next"}
                      breakLabel={"..."}
                      breakClassName={"page-item"}
                      breakLinkClassName={"page-link"}
                      pageCount={pageCount}
                      marginPagesDisplayed={1}
                      pageRangeDisplayed={1}
                      onPageChange={handlePageClick}
                      containerClassName={"pagination"}
                      pageClassName={"page-item"}
                      pageLinkClassName={"page-link"}
                      previousClassName={"page-item"}
                      previousLinkClassName={"page-link"}
                      nextClassName={"page-item"}
                      nextLinkClassName={"page-link"}
                      activeClassName={"active"}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        <div className="bg-white w-full md:w-[97%] mx-auto rounded-md ">
          <div className="w-full  mx-auto">
            <ToastContainer />

            {/* {holidays.length > 0 && ( */}

            {/* )} */}
          </div>
        </div>
      </div>
    </>
  );
}

export default UploadMarks;
