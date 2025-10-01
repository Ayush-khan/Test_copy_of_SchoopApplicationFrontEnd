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
  const [isDownloading, setIsDownloading] = useState(false);
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
  const [marksHeadings, setMarksHeadings] = useState([]); // Dynamic headings
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
  const [students, setStudents] = useState([]); // Roll No, Name, Present, Marks
  const [subjectError, setSubjectError] = useState("");
  const navigate = useNavigate();
  const mockStudentList = [
    { rollNo: "101", name: "SKYLAR STEPHEN MENDONSA" },
    { rollNo: "102", name: "VED VIJAY VEER" },
    { rollNo: "103", name: "LESHA VIKRAM MAHANKALE" },
  ];
  const [expectedFileName, setExpectedFileName] = useState("");

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

    // Clear previously selected subject & exam
    setSubjectOptions([]);
    setSelectedSubject(null);
    setExamOptions([]);
    setSelectedExam(null);

    if (!selectedOption) return;

    const class_id = selectedOption?.valueclass;
    const section_id = selectedOption?.value;

    setLoadingSubjectsData(true);
    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.get(`${API_URL}/api/get_subject_by_class`, {
        params: {
          class_id,
          section_id,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const subjects =
        response?.data?.data?.map((subject) => ({
          label: subject.name,
          value: subject.sub_rc_master_id,
        })) || [];

      setSubjectOptions(subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast.error("Failed to load subjects.");
    } finally {
      setLoadingSubjectsData(false);
    }
  };

  const handleSubjectChange = async (selectedOption) => {
    setSelectedSubject(selectedOption);

    // Clear previous exam selection
    setSelectedExam(null);
    setExamOptions([]);

    if (!selectedStudent || !selectedOption) return;

    const class_id = selectedStudent?.valueclass;
    const subject_id = selectedOption?.value;

    setLoadingExamsData(true);
    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/get_exams_by_class_subject`,
        {
          params: {
            class_id,
            sub_rc_master_id: subject_id,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const exams =
        response?.data?.data?.map((exam) => ({
          label: exam.name,
          value: exam.exam_id,
        })) || [];

      setExamOptions(exams);
    } catch (error) {
      console.error("Error fetching exams:", error);
      toast.error("Failed to load exams.");
    } finally {
      setLoadingExamsData(false);
    }
  };
  const fetchMarksHeadings = async () => {
    if (!selectedStudent || !selectedSubject || !selectedExam) {
      toast.error("Please select Class, Subject, and Exam.");
      return;
    }

    const class_id = selectedStudent.valueclass;
    const subject_id = selectedSubject.value;
    const exam_id = selectedExam.value;

    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `https://sms.evolvu.in/arnolds_test/public/api/get_marks_heading_class`,
        {
          params: {
            class_id,
            sub_rc_master_id: subject_id,
            exam_id,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const headings = response?.data?.data || [];

      setMarksHeadings(headings);

      // Sample mock students (replace with API data if needed)
      const mockStudents = [
        { roll_no: 1, name: "Skylar Stephen Mendonsa" },
        { roll_no: 2, name: "Ved Vijay Veer" },
        { roll_no: 3, name: "Lesha Vikram Mahankale" },
      ];

      const initializedStudents = mockStudents.map((student) => ({
        ...student,
        present: true,
        marks: marksHeadings.reduce((acc, h) => {
          acc[h.marks_headings_name] = "";
          return acc;
        }, {}),
        errors: marksHeadings.reduce((acc, h) => {
          acc[h.marks_headings_name] = "";
          return acc;
        }, {}),
      }));

      setStudents(initializedStudents);
    } catch (error) {
      console.error("Error fetching marks headings:", error);
      toast.error("Failed to load marks headings.");
    }
  };

  const handlePresentChange = (rollNo, isPresent) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.rollNo === rollNo
          ? {
              ...s,
              present: isPresent,
              marks: isPresent
                ? s.marks
                : Object.fromEntries(
                    Object.keys(s.marks).map((key) => [key, ""])
                  ),
            }
          : s
      )
    );
  };

  const handleMarksInputChange = (rollNo, headingName, value) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.rollNo === rollNo
          ? {
              ...s,
              marks: {
                ...s.marks,
                [headingName]: value,
              },
            }
          : s
      )
    );
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
    if (!selectedSubject) {
      setSubjectError("Please select a Subject.");
      hasError = true;
    }

    if (hasError) {
      setLoadingForSearch(false);
      return;
    }
    fetchMarksHeadings();
    try {
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
    if (!selectedStudent || !selectedSubject || !selectedExam) {
      toast.error("Please select Class, Subject, and Exam.");
      return;
    }

    const token = localStorage.getItem("authToken");

    const class_id = selectedStudent.valueclass;
    const section_id = selectedStudent.value;
    const subject_id = selectedSubject.value;
    const exam_id = selectedExam.value;

    const class_name = selectedStudent.class?.replace(/\s+/g, "");
    const section_name = selectedStudent.section?.replace(/\s+/g, "");
    const subject_name = selectedSubject.label?.replace(/\s+/g, "");
    const exam_name = selectedExam.label?.replace(/\s+/g, "");

    const filename = `${class_name}${section_name}_${subject_name}_${exam_name}.csv`;
    setExpectedFileName(filename); // <-- this line sets the expected file name

    try {
      setIsDownloading(true); // 🔄 Start loader

      const response = await axios.get(`${API_URL}/api/get_marksgeneratecsv`, {
        params: {
          exam_id,
          class_id,
          section_id,
          subject_id,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });

      // Trigger file download
      triggerFileDownload(response.data, filename);
    } catch (error) {
      console.error("Error downloading template:", error);
      toast.error("Failed to download the template.");
    } finally {
      setIsDownloading(false); // ✅ Stop loader
    }
  };

  const triggerFileDownload = (blobData, filename) => {
    const url = window.URL.createObjectURL(new Blob([blobData]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
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

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage("Please select a file first.");
      return;
    }

    setErrorMessage("");
    setErrorMessageUrl("");
    setUploadStatus("");
    const fileName = selectedFile.name.trim();

    console.log("Selected file name -->", fileName);
    console.log("Expected file name -->", expectedFileName);

    if (fileName !== expectedFileName) {
      toast.warning(
        "Invalid file selected. Please upload the same file you downloaded."
      );
      return;
    }

    // Accept patterns
    // const validPattern = /_(event|rejected_template)(\s?\(\d+\))?\.csv$/i;
    // const validPatternOne = /(event|rejected_template)(\s?\(\d+\))?\.csv$/i;
    // console.log("FileName is-->", fileName);
    // console.log("FileName is-->", validPattern.test(fileName));
    // console.log("FileName is-->", validPatternOne.test(fileName));

    // if (!validPattern.test(fileName) && !validPatternOne.test(fileName)) {
    //   toast.warning("Please check if correct file is selected for upload.");
    //   return;
    // }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.post(
        `${API_URL}/api/save_uploadmarkscsv`, // <-- your API endpoint
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Agar successful
      if (response.status === 200) {
        toast.success("File uploaded successfully!");
        setUploadStatus("success");
        setSelectedFile(null);
        // Agar table ya list reload karna hai:
        handleSearch?.();
      } else {
        // Unexpected status
        toast.error("Upload failed. Please try again.");
        setUploadStatus("failed");
      }
    } catch (error) {
      console.error("Upload error:", error);

      const showErrorForUploading = error?.response?.data?.message;
      const showErrorForUploadingUrl = error?.response?.data?.invalid_rows;

      setErrorMessage(
        showErrorForUploading
          ? `Error: ${showErrorForUploading}`
          : "Failed to upload file. Please try again..."
      );
      setErrorMessageUrl(`${showErrorForUploadingUrl ?? ""}`);
      setUploadStatus("failed");

      toast.error(
        showErrorForUploading ? showErrorForUploading : "Error uploading file."
      );
    } finally {
      setLoading(false);
    }
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
  const formatDate = (dateString) => {
    if (!dateString) return " ";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-4); // Last 2 digits of the year
    return `${day}-${month}-${year}`;
  };

  const handleReset = () => {
    setSelectedClasses([]);
    setIsDataPosted(false);
    setShowUploadSection(false);
    // setDataUploaded(false);
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
        <ToastContainer />

        <div className="w-full  flex flex-row justify-between">
          <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
            Enter exam marks
          </h3>
          <RxCross1
            className=" relative  mt-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
            onClick={() => {
              setLoadingEvent(false);
              setDataUploaded(false);
              setTableDataReady(false);
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
            <div className="mx-5 my-10">
              <div className="w-full bg-white shadow-xl rounded-2xl px-8 py-8 border border-gray-100">
                <div className="flex flex-wrap items-end gap-4 lg:gap-6 justify-between">
                  {/* Class Dropdown */}
                  <div className="w-full sm:w-[22%] min-h-[92px] flex flex-col justify-between">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Class <span className="text-red-500">*</span>
                    </label>
                    <Select
                      id="studentSelect"
                      value={selectedStudent}
                      onChange={handleClassSelect}
                      options={studentOptions}
                      placeholder={loadingExams ? "Loading..." : "Select Class"}
                      isSearchable
                      isClearable
                      isDisabled={loadingExams}
                      styles={{
                        control: (base) => ({
                          ...base,
                          fontSize: "0.9em",
                          minHeight: "42px",
                          borderRadius: "8px",
                          borderColor: "#d1d5db",
                          boxShadow: "none",
                          "&:hover": {
                            borderColor: "#3b82f6", // Tailwind blue-500
                          },
                        }),
                      }}
                    />
                    <p className="text-xs text-red-500 mt-1 h-4">
                      {studentError || "\u00A0"}
                    </p>
                  </div>

                  {/* Subject Dropdown */}
                  <div className="w-full sm:w-[22%] min-h-[92px] flex flex-col justify-between">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={selectedSubject}
                      onChange={handleSubjectChange}
                      options={subjectOptions}
                      placeholder={
                        loadingSubjectsData ? "Loading..." : "Select Subject"
                      }
                      isSearchable
                      isClearable
                      isDisabled={loadingSubjectsData}
                      styles={{
                        control: (base) => ({
                          ...base,
                          fontSize: "0.9em",
                          minHeight: "42px",
                          borderRadius: "8px",
                          borderColor: "#d1d5db",
                          boxShadow: "none",
                          "&:hover": {
                            borderColor: "#3b82f6",
                          },
                        }),
                      }}
                    />
                    <p className="text-xs text-red-500 mt-1 h-4">
                      {subjectError || "\u00A0"}
                    </p>
                  </div>

                  {/* Exam Dropdown */}
                  <div className="w-full sm:w-[22%] min-h-[92px] flex flex-col justify-between">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Exam <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={selectedExam}
                      onChange={(option) => setSelectedExam(option)}
                      options={examOptions}
                      placeholder={
                        loadingExamsData ? "Loading..." : "Select Exam"
                      }
                      isSearchable
                      isClearable
                      isDisabled={!selectedSubject || loadingExamsData}
                      styles={{
                        control: (base) => ({
                          ...base,
                          fontSize: "0.9em",
                          minHeight: "42px",
                          borderRadius: "8px",
                          borderColor: "#d1d5db",
                          boxShadow: "none",
                          "&:hover": {
                            borderColor: "#3b82f6",
                          },
                        }),
                      }}
                    />
                    <p className="text-xs text-red-500 mt-1 h-4">
                      {examError || "\u00A0"}
                    </p>
                  </div>

                  {/* Browse Button */}
                  <div className="w-full sm:w-[18%] flex items-center mb-2 min-h-[92px] ">
                    <button
                      onClick={handleSearch}
                      className={`w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 shadow-sm ${
                        loadingForSearch ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      disabled={loadingForSearch}
                    >
                      {loadingForSearch ? (
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
                          Browsing...
                        </>
                      ) : (
                        "Browse"
                      )}
                    </button>
                  </div>
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
                        disabled={isDownloading}
                        className={`mt-6 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-medium rounded-full px-6 py-2 transition shadow-md flex items-center gap-2
      ${
        isDownloading
          ? "opacity-50 cursor-not-allowed"
          : "hover:from-blue-700 hover:to-blue-600"
      }
    `}
                      >
                        {isDownloading ? (
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
                                d="M4 12a8 8 0 018-8v4l5-5-5-5v4a8 8 0 000 16v-4l-5 5 5 5v-4a8 8 0 01-8-8z"
                              ></path>
                            </svg>
                            Downloading...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-download text-base"></i>
                            Download Marksheet Format
                          </>
                        )}
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

                    {/* {uploadStatus && (
                      <p className="text-green-600 text-sm text-center mt-2">
                        {uploadStatus}
                      </p>
                    )} */}
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
            <div className="w-full mt-4">
              <div className="card mx-auto lg:w-full shadow-lg">
                <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                  {dataUploaded && (
                    <div className="item-center ">
                      <button
                        onClick={() => setShowUploadSection(true)} // ✅ Show modal on click
                        className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition duration-200 shadow-md"
                      >
                        Upload Marksheet from Excel Sheet
                      </button>
                    </div>
                  )}
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
                      {/* <thead>
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
                      </thead> */}
                      <table className="min-w-full border mt-4">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="border px-3 py-2 text-center">
                              Roll No
                            </th>
                            <th className="border px-3 py-2 text-center">
                              Student
                            </th>
                            {marksHeadings.map((heading) => (
                              <th
                                key={heading.marks_headings_id}
                                className="border px-3 py-2 text-center"
                              >
                                *{heading.marks_headings_name}(
                                {heading.highest_marks})
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {loadingEvent ? (
                            <tr>
                              <td
                                colSpan={2 + marksHeadings.length}
                                className="text-center py-6"
                              >
                                <span className="text-blue-700 text-xl">
                                  Please Wait While Data is Loading...
                                </span>
                              </td>
                            </tr>
                          ) : students.length === 0 ? (
                            <tr>
                              <td
                                colSpan={2 + marksHeadings.length}
                                className="text-center py-6"
                              >
                                <span className="text-red-700 text-xl">
                                  Oops! No data found..
                                </span>
                              </td>
                            </tr>
                          ) : (
                            students.map((student, studentIdx) => (
                              <tr
                                key={studentIdx}
                                className={
                                  studentIdx % 2 === 1 ? "bg-gray-50" : ""
                                }
                              >
                                <td className="border px-3 py-2 text-center">
                                  {student.roll_no}
                                </td>
                                <td className="border px-3 py-2">
                                  <div className="flex items-center justify-between gap-2">
                                    {student.name}
                                    <label className="flex items-center space-x-1 text-sm">
                                      <span>Present</span>
                                      <input
                                        type="checkbox"
                                        checked={student.present}
                                        onChange={(e) => {
                                          const updated = [...students];
                                          updated[studentIdx].present =
                                            e.target.checked;

                                          // Clear marks if unchecked
                                          if (!e.target.checked) {
                                            marksHeadings.forEach((heading) => {
                                              updated[studentIdx].marks[
                                                heading.marks_headings_name
                                              ] = "";
                                              updated[studentIdx].errors[
                                                heading.marks_headings_name
                                              ] = "";
                                            });
                                          }

                                          setStudents(updated);
                                        }}
                                      />
                                    </label>
                                  </div>
                                </td>

                                {marksHeadings.map((heading) => {
                                  const headingName =
                                    heading.marks_headings_name;
                                  const highest = heading.highest_marks;
                                  const value =
                                    student.marks[headingName] || "";
                                  const error = student.errors?.[headingName];

                                  return (
                                    <td
                                      key={heading.marks_headings_id}
                                      className="border px-3 py-2"
                                    >
                                      <div>
                                        <input
                                          type="number"
                                          value={value}
                                          disabled={!student.present}
                                          max={highest}
                                          className={`w-full border px-2 py-1 rounded ${
                                            error
                                              ? "border-red-500"
                                              : "border-gray-300"
                                          }`}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            const updated = [...students];
                                            updated[studentIdx].marks[
                                              headingName
                                            ] = val;

                                            if (+val <= highest) {
                                              updated[studentIdx].errors[
                                                headingName
                                              ] = "";
                                            }

                                            setStudents(updated);
                                          }}
                                          onBlur={(e) => {
                                            const val = e.target.value;
                                            const updated = [...students];

                                            if (val && +val > highest) {
                                              updated[studentIdx].errors[
                                                headingName
                                              ] = `Please enter marks less than ${highest}`;
                                            } else {
                                              updated[studentIdx].errors[
                                                headingName
                                              ] = "";
                                            }

                                            setStudents(updated);
                                          }}
                                        />

                                        {error && (
                                          <p className="text-xs text-red-500 mt-1">
                                            {error}
                                          </p>
                                        )}
                                      </div>
                                    </td>
                                  );
                                })}
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
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
      </div>
    </>
  );
}

export default UploadMarks;
