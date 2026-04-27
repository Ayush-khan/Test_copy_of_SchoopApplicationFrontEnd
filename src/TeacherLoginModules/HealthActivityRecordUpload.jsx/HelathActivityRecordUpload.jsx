import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  faEdit,
  faTrash,
  faPlus,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import { RxCross1 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Select from "react-select";
import { FaInfoCircle } from "react-icons/fa";

function HealthActivityRecordUpload() {
  const API_URL = import.meta.env.VITE_API_URL; // URL for host
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDActiveModal, setShowDActiveModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  //   variable to store the respone of the allot subject tab
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [filteredSections, setFilteredSections] = useState([]);
  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");

  const [selectedSectionId, setSelectedSectionId] = useState(null);

  const [loadingForSearch, setLoadingForSearch] = useState(false);

  const pageSize = 10;
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(""); // For success message
  const [errorMessage, setErrorMessage] = useState(""); // For error message
  const [errorMessageUrl, setErrorMessageUrl] = useState(""); // For error message
  const [loading, setLoading] = useState(false); // For loader
  const [isDataPosted, setIsDataPosted] = useState(false); // Flag for tracking successful post

  const [holidays, setHolidays] = useState([]);
  const [showDownloadReportCard, setShowDownloadReportCard] = useState(false);

  const [currentHoliday, setCurrentHoliday] = useState("");
  const [currentHolidayNameForDelete, setCurrentHolidayNameForDelete] =
    useState("");

  const [deletedHolidays, setDeletedHolidays] = useState([]);

  const [allClasses, setAllClasses] = useState([]);
  const [allSubject, setAllSubject] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState([]);

  const [showUploadSection, setShowUploadSection] = useState(false);
  const [userName, setUserName] = useState("");

  const [loadingEvent, setLoadingEvent] = useState(false);
  const [roleID, setRoleId] = useState(null);
  const [roleIdValue, setRoleIdValue] = useState(null);
  const [classError, setClassError] = useState("");

  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState("");
  const [loadingStudents, setLoadingStudents] = useState("");

  const [nameError, setNameError] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const [classIdForManage, setclassIdForManage] = useState("");
  const [sectionIdForStudentList, setSectionIdForStudentList] = useState(null);

  const [selectedClassSearch, setSelectedClassSearch] = useState("");
  const [classForModal, setClassForModal] = useState("");
  const [sectionForModal, setSectionForModal] = useState("");

  const [showRollNo, setShowRollNo] = useState(false);

  useEffect(() => {
    if (!roleIdValue) return;
    fetchClassNames(roleID, roleIdValue);
  }, [roleIdValue]);

  const fetchClassNames = async (roleId, roleIdValue) => {
    try {
      setLoadingClasses(true);
      setLoadingStudents(true);

      const token = localStorage.getItem("authToken");

      const classApiUrl =
        roleId === "T"
          ? // get_teacherclasseswithclassteacher
            `${API_URL}/api/get_sportsteacherclasses?teacher_id=${roleIdValue}`
          : `${API_URL}/api/getallClassWithStudentCount`;

      const [classResponse] = await Promise.all([
        axios.get(classApiUrl, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const classData =
        roleId === "T"
          ? classResponse.data.data || []
          : classResponse.data || [];

      setAllClasses(classData);
    } catch (error) {
      toast.error("Error fetching data.");
    } finally {
      setLoadingClasses(false);
      setLoadingStudents(false);
    }
  };

  const fetchSubjectNames = async (classId) => {
    if (!classId) return; // no class selected, skip API
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/api/get_subjects_according_class?class_id=${classId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setAllSubject(response.data.data || []);
    } catch (error) {
      toast.error("Error fetching subject names");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If multiple classes can be selected, pick the first one or handle as needed
    const classId = Array.isArray(selectedClasses)
      ? selectedClasses[0]
      : selectedClasses;

    fetchSubjectNames(classId);
  }, [selectedClasses]);

  useEffect(() => {
    const classId = Array.isArray(selectedClasses)
      ? selectedClasses[0]
      : selectedClasses;

    fetchSubjectNames(classId);
  }, [selectedClasses]);

  const fetchSessionData = async () => {
    const token = localStorage.getItem("authToken");

    try {
      const response = await axios.get(`${API_URL}/api/sessionData`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      // console.log("response session data", response.data);

      const roleId = response?.data?.user?.role_id;
      const regId = response?.data?.user?.reg_id;

      // console.log("roleid", roleId);
      // console.log("regid", regId);

      setRoleId(roleId); // optional for global use
      setRoleIdValue(regId);

      if (response.data && response.data.user) {
        const { name } = response.data.user;
        setUserName(name); // Set user name in state
      } else {
        console.error("User data not found in the response");
      }
    } catch (error) {
      console.error("Error fetching session data:", error);
    }
  };
  useEffect(() => {
    if (!sectionIdForStudentList) return;
    fetchStudentNameWithClassId(sectionIdForStudentList);
  }, [sectionIdForStudentList]);

  const fetchStudentNameWithClassId = async (section_id = null) => {
    if (roleID === "T" && !section_id) {
      setStudentNameWithClassId([]); // clear dropdown
      return;
    }

    setLoadingStudents(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/api/getStudentListBySectionData`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: section_id ? { section_id } : {},
        },
      );
      setStudentNameWithClassId(response?.data?.data || []);
    } catch (error) {
      toast.error("Error fetching students.");
    } finally {
      setLoadingStudents(false);
    }
  };

  // const classOptions = useMemo(() => {
  //   return allClasses.map((cls) => {
  //     // if (roleID === "T") {
  //     //   return {
  //     //     value: cls.section_id,
  //     //     label: `${cls.classname} ${cls.sectionname} (${cls.health_record_count})`,
  //     //     class_id: cls.class_id,
  //     //     section_id: cls.section_id,
  //     //   };
  //     // }
  //     if (roleID === "T") {
  //       return {
  //         value: cls.section_id,
  //         label: (
  //           <>
  //             {cls.classname} {cls.sectionname} (
  //             <span style={{ color: "#C03078", fontWeight: "400" }}>
  //               {cls.health_record_count}
  //             </span>
  //             )
  //           </>
  //         ),
  //         class_id: cls.class_id,
  //         section_id: cls.section_id,
  //       };
  //     } else {
  //       return {
  //         value: cls.section_id,
  //         label: `${cls?.get_class?.name} ${cls.name} (${cls.students_count})`,
  //         class_id: cls.class_id,
  //         section_id: cls.section_id,
  //       };
  //     }
  //   });
  // }, [allClasses, roleID]);

  const classOptions = useMemo(() => {
    return allClasses.map((cls) => {
      if (roleID === "T") {
        return {
          value: cls.section_id,
          label: (
            <>
              {cls.classname} {cls.sectionname} (
              <span style={{ color: "#C03078", fontWeight: "400" }}>
                {cls.health_record_count}
              </span>
              )
            </>
          ),
          name: `${cls.classname} ${cls.sectionname}`, // ADD THIS
          class_id: cls.class_id,
          section_id: cls.section_id,
        };
      } else {
        return {
          value: cls.section_id,
          label: `${cls?.get_class?.name} ${cls.name} (${cls.students_count})`,
          name: `${cls?.get_class?.name} ${cls.name}`, // ADD THIS
          class_id: cls.class_id,
          section_id: cls.section_id,
        };
      }
    });
  }, [allClasses, roleID]);
  const handleClassSelect = (selectedOption) => {
    setNameError("");

    // if (!selectedOption) {
    //   setShowRollNo(false);
    // }

    setSelectedClassSearch(selectedOption);

    // console.log("selictioon class", selectedOption);
    setSelectedStudent(null);
    setSelectedStudentId(null);

    const sectionId = selectedOption ? selectedOption.section_id : null;
    const classId = selectedOption ? selectedOption.class_id : null;

    setclassIdForManage(classId);
    setSectionIdForStudentList(sectionId); // triggers useEffect
    setSelectedSectionId(sectionId);
  };

  const handleClassSelectModal = (selectedOption) => {
    setNameError("");

    setSelectedClass(selectedOption);

    const sectionId = selectedOption ? selectedOption.section_id : null;
    const classId = selectedOption ? selectedOption.class_id : null;

    setClassForModal(classId);
    setSectionForModal(sectionId);
  };

  const studentOptions = useMemo(
    () =>
      studentNameWithClassId
        .map((stu) => ({
          value: stu.student_id,
          label: [stu?.first_name, stu?.mid_name, stu?.last_name]
            .filter((namePart) => namePart)
            .join(" "),
        }))
        .filter((option) => option.label),
    [studentNameWithClassId],
  );
  const handleStudentSelect = (selectedOption) => {
    setNameError(""); // Reset student error on selection
    setSelectedStudent(selectedOption);
    setSelectedStudentId(selectedOption?.value);
  };

  const fetchEvents = async () => {
    setLoadingEvent(true);
    setLoadingForSearch(true);

    try {
      const token = localStorage.getItem("authToken");

      // build dynamic payload
      const payload = {};

      if (classIdForManage) payload.class_id = classIdForManage;
      if (selectedSectionId) payload.section_id = selectedSectionId;
      if (selectedStudentId) payload.student_id = selectedStudentId;

      const response = await axios.post(
        `${API_URL}/api/health_activity_report_list`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setHolidays(response.data.data || []);
      setPageCount(Math.ceil((response.data.data?.length || 0) / pageSize));
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Error fetching data.");
    } finally {
      setLoadingEvent(false);
      setLoadingForSearch(false);
    }
  };

  useEffect(() => {
    fetchSessionData();
    // console.log("session.data", fetchSessionData);

    fetchEvents();

    // If data is posted successfully, reset the flag and refetch
    if (isDataPosted) {
      setIsDataPosted(false); // Reset the flag after refresh
    }
  }, [isDataPosted]);

  const handlePageClick = (data) => {
    // console.log("Page clicked:", data.selected);
    setCurrentPage(data.selected);
  };

  // const handleEdit = (chapter) => {
  //   navigate(`/editHealthActivityRecord/${chapter.student_id}`, {
  //     state: { chapter },
  //   });
  // };

  const handleEdit = (student, index) => {
    navigate(`/editHealthActivityRecord/${student.student_id}`, {
      state: {
        chapter: student, //  current selected student
        students: holidays, //  full list
        currentIndex: index, //  selected index
      },
    });
  };
  useEffect(() => {
    const storedDeletedHolidays =
      JSON.parse(localStorage.getItem("deletedHolidays")) || [];
    setDeletedHolidays(storedDeletedHolidays);
  }, []);

  const handleDelete = (holiday) => {
    setCurrentHoliday(holiday.student_id);
    setCurrentHolidayNameForDelete(
      camelCase(
        `${holiday.first_name} ${holiday.mid_name} ${holiday.last_name}`,
      ),
    );

    setShowDeleteModal(true);
  };

  // const handleSubmitDelete = async (holidayId) => {
  //   if (!holidayId) {
  //     toast.error("Invalid Record selected.");
  //     return;
  //   }

  //   if (isSubmitting) return;
  //   setIsSubmitting(true);

  //   try {
  //     const token = localStorage.getItem("authToken");
  //     if (!token) {
  //       toast.error("No authentication token found. Please log in again.");
  //       setIsSubmitting(false);
  //       return;
  //     }

  //     // Call API to delete holiday
  //     const response = await axios.delete(
  //       `${API_URL}/api/delete_health_record/${holidayId}`,
  //       { headers: { Authorization: `Bearer ${token}` } },
  //     );

  //     const { data } = response;

  //     if (!data.success) {
  //       toast.error("Failed to delete the health and activity data.");
  //       setIsSubmitting(false);
  //       return;
  //     }

  //     setHolidays((prevHolidays) =>
  //       prevHolidays.filter((h) => h.chapter_id !== holidayId),
  //     );

  //     setDeletedHolidays((prev) => {
  //       const updatedDeletedHolidays = [...prev, holidayId];
  //       localStorage.setItem(
  //         "deletedChapters",
  //         JSON.stringify(updatedDeletedHolidays),
  //       );
  //       return updatedDeletedHolidays;
  //     });

  //     toast.success("Health & Activity data deleted successfully!");
  //     setShowDeleteModal(false);
  //     fetchClassNames(roleID, roleIdValue);
  //     fetchEvents();
  //   } catch (error) {
  //     console.error("Error deleting :", error);
  //     toast.error("Server error. Please try again later.");
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const handleSubmitDelete = async (holidayId) => {
    if (!holidayId) {
      toast.error("Invalid Record selected.");
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("No authentication token found. Please log in again.");
        return;
      }

      const response = await axios.delete(
        `${API_URL}/api/delete_health_record/${holidayId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const { data } = response;

      if (!data.success) {
        toast.error(data.message || "Failed to delete record.");
        return;
      }

      // Remove from UI
      setHolidays((prevHolidays) =>
        prevHolidays.filter((h) => h.chapter_id !== holidayId),
      );

      setDeletedHolidays((prev) => {
        const updated = [...prev, holidayId];
        localStorage.setItem("deletedChapters", JSON.stringify(updated));
        return updated;
      });

      toast.success("Health & Activity data deleted successfully!");
      setShowDeleteModal(false);

      fetchClassNames(roleID, roleIdValue);
      fetchEvents();
    } catch (error) {
      console.error("Error deleting :", error);

      //  Handle API error response
      if (error.response) {
        const { status, data } = error.response;

        if (status === 403) {
          toast.error(data.message); //your main fix
        } else {
          toast.error(data.message || "Server error.");
        }
      } else {
        toast.error("Network error. Please check connection.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowDActiveModal(false);
    setShowDownloadReportCard(false);
  };

  const handleDownloadTemplate = async () => {
    if (!classForModal && !sectionForModal) {
      toast.error("Please select class");
      return;
    }

    const token = localStorage.getItem("authToken");

    try {
      const response = await axios.get(
        `${API_URL}/api/generate_health_activity_csv?class_id=${classForModal}&section_id=${sectionForModal}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        },
      );

      let filename = "Health_Activity_Report.csv";

      //use selectedClass directly
      // if (selectedClass?.label) {
      //   const cleanName = selectedClass.label.replace(/\s+/g, "");
      //   filename = `${cleanName}_Health_Activity_Report.csv`;
      // }

      if (selectedClass?.name) {
        const cleanName = selectedClass.name.replace(/\s+/g, "");
        filename = `${cleanName}_Health_Activity_Report.csv`;
      }

      triggerFileDownload(response.data, filename);
    } catch (error) {
      console.error("Error downloading template:", error);
      toast.error("Failed to download template. Please try again.");
    }
  };

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
        },
      );

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
    //  Check if file is selected
    if (!selectedFile) {
      setErrorMessage("Please select a file first.");
      toast.warning("Please select a file first.");
      return;
    }

    // Check if file is empty (0 bytes)
    if (selectedFile.size === 0) {
      setErrorMessage("Selected file is empty. Please choose a valid file.");
      toast.error("Selected file is empty. Please choose a valid file.");
      return;
    }

    const checkEmptyCSV = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
          const text = e.target.result;
          const rows = text
            .trim()
            .split("\n")
            .map((row) => row.split(","));

          if (rows.length <= 1) {
            reject("Empty file cannot be uploaded.");
            return;
          }

          const header = rows[0];

          //  Columns to IGNORE (non-health fields)
          const ignoreIndexes = [0, 1, 2, 3, 4];
          // Code, Roll No, First Name, Mid Name, Last Name

          let allRowsEmpty = true;

          for (let i = 1; i < rows.length; i++) {
            const row = rows[i];

            // Check only health columns
            const hasHealthData = row.some((cell, index) => {
              return !ignoreIndexes.includes(index) && cell.trim() !== "";
            });

            if (hasHealthData) {
              allRowsEmpty = false;
              break;
            }
          }

          if (allRowsEmpty) {
            resolve("ALL_EMPTY"); // custom flag
          } else {
            resolve("VALID");
          }
        };

        reader.onerror = () => reject("Failed to read file.");
        reader.readAsText(file);
      });

    setErrorMessage("");
    setErrorMessageUrl("");
    setUploadStatus("");

    const fileName = selectedFile.name.trim();

    const selectedArray = Array.isArray(selectedClass)
      ? selectedClass
      : [selectedClass];

    // const selectedNames = selectedArray
    //   .map((opt) => opt?.label?.replace(/\s+/g, ""))
    //   .filter(Boolean);
    const selectedNames = selectedArray
      .map((opt) => {
        const label =
          typeof opt?.label === "string" ? opt.label : opt?.name || "";

        return label.replace(/\s+/g, "");
      })
      .filter(Boolean);

    const selectedClassNameStr = selectedNames[0];

    // ONLY validate if class/section is selected
    if (selectedClassNameStr) {
      const classPattern = selectedClassNameStr.replace(
        /[-\/\\^$*+?.()|[\]{}]/g,
        "\\$&",
      );

      const validPattern = new RegExp(
        `^${classPattern}_Health_Activity_Report(\\s?\\(\\d+\\))?\\.csv$`,
        "i",
      );

      if (!validPattern.test(fileName)) {
        toast.warning(
          `Invalid file name. Please upload file in format: ${selectedClassNameStr}_Health_Activity_Report.csv`,
        );
        return;
      }
    }

    try {
      const result = await checkEmptyCSV(selectedFile);

      if (result === "ALL_EMPTY") {
        toast.warning("All students health data is empty. Please fill data.");
        return;
      }
    } catch (err) {
      setErrorMessage(err);
      toast.error(err);
      return;
    }

    //  If no class selected → skip filename validation
    setLoading(true);

    //  Prepare FormData
    const formData = new FormData();
    formData.append("file", selectedFile);

    // 8️ Upload file via Axios
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      const response = await axios.post(
        `${API_URL}/api/upload_health_activity_record_from_excelsheet`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      //  Check if backend returned 422 inside body
      if (response.data?.status === 422) {
        const backendMessage = response.data?.message || "Invalid data in file";
        const invalidRows = response.data?.invalid_rows || "";

        setErrorMessage(backendMessage);
        setErrorMessageUrl(`${invalidRows}`);
        toast.error(backendMessage);
        return; // stop further processing
      }

      // Success case
      toast.success("Health & Activity data uploded successfully.");
      setIsDataPosted(true);
      setSelectedFile(null);
      fetchEvents();
    } catch (error) {
      setLoading(false);

      if (error.response) {
        const status = error.response.status;
        const backendMessage = error.response.data?.message || "Unknown error";
        const invalidRows = error.response.data?.invalid_rows || "";

        setErrorMessage(backendMessage);
        setErrorMessageUrl(`${invalidRows}`);
        toast.error(`Error ${status}: ${backendMessage}`);
        return;
      }

      // Network or unknown errors
      setErrorMessage("Something went wrong. Please try again.");
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setTimeout(() => handleReset(), 2000);
    }
  };

  const handleReset = () => {
    setSelectedClass(null);
    setSelectedClasses(null);
    setSelectedSubject(null);
    setClassForModal(null);
    setSectionForModal(null);
    setShowUploadSection(false);
    setSelectedFile(null);
    setErrorMessage("");
    setErrorMessageUrl("");
    setUploadStatus("");
    setIsDataPosted(false);
  };

  const camelCase = (str) =>
    str
      ?.toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  useEffect(() => {
    const trimmedSearch = searchTerm.trim().toLowerCase();

    if (trimmedSearch !== "" && prevSearchTermRef.current === "") {
      previousPageRef.current = currentPage;
      setCurrentPage(0);
    }

    if (trimmedSearch === "" && prevSearchTermRef.current !== "") {
      setCurrentPage(previousPageRef.current);
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

  // useEffect(() => {
  //   const filtered = (Array.isArray(holidays) ? holidays : []).filter(
  //     (holiday) => {
  //       if (!searchTerm) return true;

  //       const normalize = (str) =>
  //         (str || "").toLowerCase().trim().replace(/\s+/g, " ");

  //       const searchLower = normalize(searchTerm);

  //       const subjectName = normalize(holiday?.sub_name);

  //       const fullName = normalize(
  //         `${holiday.first_name || ""} ${holiday.mid_name || ""} ${holiday.last_name || ""}`,
  //       );

  //       const className = normalize(
  //         `${holiday.class_name || ""} ${holiday.section_name || ""}`,
  //       );

  //       return (
  //         fullName.includes(searchLower) ||
  //         subjectName.includes(searchLower) ||
  //         className.includes(searchLower)
  //       );
  //     },
  //   );

  //   setFilteredSections(filtered);
  // }, [holidays, searchTerm]);

  // console.log("filtered Chapter", filteredSections);

  useEffect(() => {
    const filtered = (Array.isArray(holidays) ? holidays : []).filter(
      (holiday) => {
        if (!searchTerm) return true;

        const normalize = (str) =>
          (str ?? "").toString().toLowerCase().trim().replace(/\s+/g, " ");

        const searchLower = normalize(searchTerm);

        const subjectName = normalize(holiday?.sub_name);

        const fullName = normalize(
          `${holiday.first_name || ""} ${holiday.mid_name || ""} ${holiday.last_name || ""}`,
        );

        const className = normalize(
          `${holiday.class_name || ""} ${holiday.section_name || ""}`,
        );

        const rollNo = normalize(holiday.roll_no); // ✅ now safe

        return (
          fullName.includes(searchLower) ||
          subjectName.includes(searchLower) ||
          className.includes(searchLower) ||
          rollNo.includes(searchLower)
        );
      },
    );

    setFilteredSections(filtered);
  }, [holidays, searchTerm]);

  useEffect(() => {
    setPageCount(Math.ceil(filteredSections.length / pageSize));
  }, [filteredSections, pageSize]);

  const displayedSections = filteredSections.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize,
  );

  // console.log("displayted sections", displayedSections);

  const isAllHealthFieldsEmpty = (data) => {
    if (!data.value) return true;

    let parsed = {};

    try {
      parsed = JSON.parse(data.value);
    } catch (e) {
      return true;
    }

    return Object.values(parsed).every(
      (val) => val === null || val === "" || val === undefined,
    );
  };

  const handleDownloadPdf = (holiday) => {
    setCurrentHoliday(holiday.student_id);
    setCurrentHolidayNameForDelete(
      camelCase(
        `${holiday.first_name} ${holiday.mid_name} ${holiday.last_name}`,
      ),
    );

    setShowDownloadReportCard(true);
  };

  const handleDownloadSumbit = async (holidayId) => {
    console.log("Student id", holidayId);
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");

      if (!holidayId) {
        throw new Error("Student ID is missing");
      }

      const response = await axios.get(
        `${API_URL}/api/health_activity_data_pdf?student_id=${holidayId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        },
      );

      if (response.status === 200) {
        toast.success("Health & Activity Card downloaded successfully!");

        const contentDisposition = response.headers["content-disposition"];
        let filename = "Health_Activity_Card.pdf";

        if (contentDisposition) {
          const match = contentDisposition.match(/filename="?(.+)"?/);
          if (match && match[1]) filename = match[1];
        }

        const pdfBlob = new Blob([response.data], { type: "application/pdf" });
        const pdfUrl = URL.createObjectURL(pdfBlob);

        const link = document.createElement("a");
        link.href = pdfUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // window.open(pdfUrl, "_blank");

        window.URL.revokeObjectURL(pdfUrl);

        fetchEvents();
        handleCloseModal();
      } else {
        throw new Error("Failed to download the file");
      }
    } catch (error) {
      toast.error(
        `Error in Downloading Report Card: ${
          error.response?.data?.error || error.message
        }`,
      );
    } finally {
      setIsSubmitting(false);
      setShowDeleteModal(false);
    }
  };

  // const handleDownloadSumbit = async (holidayId) => {
  //   if (isSubmitting) return;
  //   setIsSubmitting(true);

  //   try {
  //     const token = localStorage.getItem("authToken");

  //     if (!holidayId) {
  //       throw new Error("Student ID is missing");
  //     }

  //     const response = await axios.get(
  //       `${API_URL}/api/health_activity_data_pdf?student_id=${holidayId}`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //         responseType: "blob",
  //       },
  //     );

  //     if (response.status === 200) {
  //       toast.success("Health & Activity Certificate downloaded successfully!");

  //       // Extract filename from Content-Disposition header if available
  //       const contentDisposition = response.headers["content-disposition"];
  //       let filename = "Health_Activity_Certificate.pdf";

  //       if (contentDisposition) {
  //         const match = contentDisposition.match(/filename="?(.+)"?/);
  //         if (match && match[1]) filename = match[1];
  //       }

  //       // Create a blob URL for the PDF file
  //       const pdfBlob = new Blob([response.data], { type: "application/pdf" });
  //       const pdfUrl = URL.createObjectURL(pdfBlob);

  //       // Create a link to initiate the download
  //       const link = document.createElement("a");
  //       link.href = pdfUrl;
  //       link.download = filename;
  //       document.body.appendChild(link);
  //       link.click();
  //       document.body.removeChild(link);

  //       URL.revokeObjectURL(pdfUrl);

  //       fetchEvents();
  //       handleCloseModal();
  //     } else {
  //       throw new Error("Failed to download the file");
  //     }
  //   } catch (error) {
  //     if (error.response && error.response.data) {
  //       toast.error(
  //         `Error in Downloading Report Card: ${
  //           error.response.data.error || error.message
  //         }`,
  //       );
  //     } else {
  //       toast.error(`Error in Downloading Report Card: ${error.message}`);
  //     }
  //   } finally {
  //     setIsSubmitting(false);
  //     setShowDeleteModal(false);
  //   }
  // };

  return (
    <>
      <div className="md:mx-auto md:w-[90%] p-4 bg-white mt-3 ">
        <div className="w-full  flex flex-row justify-between">
          <h3 className="text-gray-700  text-[1.2em] lg:text-xl text-nowrap">
            Health & Activity Record
          </h3>
          <RxCross1
            className=" relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
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

        <div className="flex flex-wrap items-center gap-4 w-full ml-5">
          {/* Class */}
          <div className="flex items-center gap-3">
            <label className="font-semibold text-gray-700 whitespace-nowrap">
              Class
            </label>
            <div className="w-48">
              <Select
                // value={selectedClass}
                value={selectedClassSearch}
                onChange={handleClassSelect}
                options={classOptions}
                placeholder="Select"
                isSearchable
                isClearable
                disabled={loadingClasses}
              />
              {classError && (
                <p className="text-red-600 text-sm">{classError}</p>
              )}
            </div>
          </div>

          {/* Student */}
          <div className="flex items-center gap-3">
            <label className="font-semibold text-gray-700 whitespace-nowrap">
              Student
            </label>
            <div className="w-48">
              <Select
                value={selectedStudent}
                onChange={handleStudentSelect}
                options={studentOptions}
                placeholder="Select"
                isSearchable
                isClearable
              />
            </div>
          </div>
          <div>
            <button
              onClick={() => {
                fetchEvents();
                // if (selectedClassSearch) {
                setShowRollNo(true);
                // }
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-200"
            >
              {loadingForSearch ? "Searching.." : "Search"}
            </button>
          </div>

          {/* Upload Button */}
          <div>
            <button
              onClick={() => setShowUploadSection(true)}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition duration-200"
            >
              Upload Health & Activity Data from Excel Sheet
            </button>
          </div>
        </div>

        <div className="bg-white w-full md:w-[97%] mx-auto rounded-md ">
          <div className="w-full  mx-auto">
            <ToastContainer />

            {showUploadSection && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white w-full max-w-6xl mx-4 rounded-lg shadow-lg p-6 overflow-y-auto max-h-[90vh] relative">
                  <RxCross1
                    className="absolute top-3 right-4 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                    onClick={() => handleReset()}
                  />

                  <h2 className="text-center text-xl font-semibold text-blue-600 mb-4 flex items-center justify-center gap-2">
                    📂 Upload Health & Activity Data from Excel Sheet
                  </h2>

                  <div className="mb-6">
                    {/* Card container */}
                    <div className="bg-white shadow-md rounded-2xl p-3 flex flex-col md:flex-row items-center gap-6 border border-gray-200">
                      <div className="flex items-center w-full md:w-1/2 gap-3">
                        <label className="font-semibold text-gray-700 whitespace-nowrap">
                          Select Class <span className="text-red-500">*</span>
                        </label>
                        <div className="w-[60%]">
                          <Select
                            value={selectedClass}
                            // onChange={handleClassSelect}
                            onChange={handleClassSelectModal}
                            options={classOptions}
                            placeholder="Select"
                            className="basic-single"
                            classNamePrefix="select"
                            isSearchable
                            isClearable
                            styles={{
                              control: (provided, state) => ({
                                ...provided,
                                borderRadius: "0.5rem",
                                borderColor: state.isFocused
                                  ? "#3b82f6"
                                  : "#d1d5db",
                                boxShadow: state.isFocused
                                  ? "0 0 0 1px #3b82f6"
                                  : "none",
                                minHeight: "40px",
                              }),
                              menu: (provided) => ({
                                ...provided,
                                borderRadius: "0.5rem",
                              }),
                            }}
                          />

                          {classError && (
                            <p className="text-red-600 text-sm">{classError}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Three Card Upload Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    {/* Template Download */}
                    <div className="flex flex-col items-center p-6 bg-gradient-to-br from-blue-100 via-white to-blue-50 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
                      <h5 className="font-semibold mb-3 text-black text-lg">
                        Download Template
                      </h5>

                      <div className="text-sm text-gray-700 leading-relaxed space-y-4 mb-4 text-left">
                        <div className="flex items-start gap-3">
                          <strong className="w-12 flex-shrink-0">
                            Step 1:
                          </strong>
                          <p className="flex-1">Please select class</p>
                        </div>

                        <div className="flex items-start gap-3">
                          <strong className="w-12 flex-shrink-0">
                            Step 2:
                          </strong>
                          <p className="flex-1">
                            Please download the health & activity template by
                            clicking below
                            <strong> "Download Template"</strong> button below.
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={handleDownloadTemplate}
                        className="mt-5 bg-blue-600 text-white text-sm rounded-full px-6 py-3 hover:bg-blue-700 transition"
                      >
                        <i className="fas fa-download text-base"></i> Download
                        Template
                      </button>
                    </div>

                    {/* File Upload */}
                    <div className="flex flex-col items-center p-6 bg-gradient-to-br  from-blue-100 via-white to-blue-50 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
                      <h5 className="font-semibold mb-3 text-black text-lg">
                        Select a File to Upload
                      </h5>
                      <div className="text-sm text-gray-700 leading-relaxed space-y-4  text-left">
                        <div className="flex items-start gap-3">
                          <strong className="w-12 flex-shrink-0">
                            Step 3:
                          </strong>
                          <p className="flex-1">
                            Enter data in the downloaded file.
                          </p>
                        </div>
                      </div>

                      <div className="text-sm text-blue-900 bg-blue-50 p-2 rounded-md border border-blue-200 text-left space-y-1">
                        <strong className="block text-blue-700">PS:</strong>
                        <ul className="list-disc list-outside pl-6 ">
                          <li>Do not change the name of the file.</li>
                          <li>
                            Do not change the contents of first 4 columns in the
                            downloaded excelsheet.
                          </li>
                          <li>
                            Please click on the button below to select the file
                            which was downloaded in the previous step.
                          </li>
                        </ul>
                      </div>

                      <label className="mt-4 bg-blue-600 text-white md:w-[45%] rounded-full text-sm px-6 py-3 hover:bg-blue-700 cursor-pointer whitespace-nowrap overflow-hidden">
                        <i className="fas fa-upload text-base"></i>{" "}
                        {selectedFile
                          ? selectedFile.name.length > 20
                            ? `${selectedFile.name.substring(0, 10)}...`
                            : selectedFile.name
                          : "Choose File"}
                        <input
                          type="file"
                          accept=".csv"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Upload Submit */}
                    <div className="flex flex-col items-center p-6 bg-gradient-to-br  from-blue-100 via-white to-blue-50 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
                      <h5 className="font-semibold mb-3 text-black text-lg">
                        Enter New Health & Activity List
                      </h5>
                      <div className="text-sm text-gray-700 leading-relaxed space-y-4 mb-4 text-left">
                        <div className="flex items-start gap-3">
                          <strong className="w-12 flex-shrink-0">
                            Step 4:
                          </strong>
                          <p className="flex-1">
                            Please click on the
                            <strong> "Upload"</strong> button to upload the
                            file.
                          </p>
                        </div>

                        <div className="flex items-start gap-3">
                          <strong className="w-12 flex-shrink-0">
                            Step 5:
                          </strong>
                          <p className="flex-1">
                            Health & Activity Record will be entered in the
                            application
                          </p>
                        </div>
                      </div>

                      <div className="text-xs flex flex-col justify-around">
                        {errorMessage && (
                          <p className="text-red-500">{errorMessage}</p>
                        )}

                        {errorMessageUrl && errorMessageUrl !== "undefined" && (
                          <a
                            href="#"
                            className="underline text-blue-600 hover:text-blue-800"
                            onClick={(e) => {
                              e.preventDefault();
                              downloadCsv(errorMessageUrl);
                            }}
                          >
                            Download CSV to see errors.
                          </a>
                        )}
                      </div>
                      <button
                        onClick={handleUpload}
                        className="mt-5 bg-blue-600 text-white text-sm rounded-full px-6 py-3 hover:bg-blue-700 transition"
                        disabled={loading}
                      >
                        <i className="fas fa-cloud-upload-alt text-base"></i>{" "}
                        {loading ? "Uploading..." : "Upload"}
                      </button>
                      {uploadStatus && (
                        <p className="text-green-600 mt-2">{uploadStatus}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="w-full  mt-4">
              <div className="card mx-auto lg:w-full shadow-lg">
                <div className="bg-gray-100 flex justify-between items-center p-2">
                  {/* LEFT: Note */}
                  <div className="px-2 py-1 bg-blue-50 border border-blue-300 text-blue-800 text-sm rounded">
                    {/* <strong>Note:</strong> Highlighted rows indicate students
                    with no health & activity data filled. */}

                    <span className="flex items-center gap-2">
                      <FaInfoCircle className="text-blue-700" />
                      Highlighted rows indicate students with no health &
                      activity data filled.
                    </span>
                  </div>

                  {/* RIGHT: Search */}
                  <div className="w-1/2 md:w-fit">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div
                  className=" relative w-[97%]   mb-3 h-0.5  mx-auto bg-red-700"
                  style={{
                    backgroundColor: "#C03078",
                  }}
                ></div>

                <div className="card-body w-full">
                  <div className="w-full overflow-x-auto">
                    <div className="h-96 overflow-y-auto">
                      <table className="w-full table-auto ">
                        <thead>
                          <tr className="bg-gray-200">
                            <th className="px-2 py-2 border text-center text-sm font-semibold">
                              Sr. No
                            </th>
                            {/* {showRollNo && ( */}
                            <th className="px-2 py-2 border text-center text-sm font-semibold">
                              Roll No.
                            </th>
                            {/* )} */}
                            <th className="px-2 py-2 border text-center text-sm font-semibold">
                              Student Name
                            </th>

                            <th className="px-2 py-2 border text-center text-sm font-semibold">
                              Class
                            </th>
                            <th className="px-2 py-2 border text-center text-sm font-semibold">
                              Edit
                            </th>
                            <th className="px-2 py-2 border text-center text-sm font-semibold">
                              Delete
                            </th>
                            <th className="px-2 py-2 border text-center text-sm font-semibold">
                              Download
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {loadingEvent ? (
                            <tr>
                              <td colSpan="7">
                                <div className="flex justify-center items-center py-10 text-blue-700 text-sm sm:text-base md:text-lg">
                                  Please wait while data is loading..
                                </div>
                              </td>
                            </tr>
                          ) : displayedSections.length ? (
                            displayedSections.map((holiday, index) => (
                              <tr
                                key={holiday.latest_event_id}
                                // className="text-sm"
                                className={`text-sm ${
                                  isAllHealthFieldsEmpty(holiday)
                                    ? "bg-blue-50 border border-blue-400"
                                    : ""
                                }`}
                              >
                                <td className="px-2 py-2 border text-center">
                                  {currentPage * pageSize + index + 1}
                                </td>

                                {/* {showRollNo && ( */}
                                <td className="px-2 py-2 border text-center">
                                  {holiday.roll_no}
                                </td>
                                {/* )} */}

                                <td className="px-2 py-2 border text-center whitespace-nowrap">
                                  {camelCase(
                                    `${holiday.first_name} ${holiday.mid_name} ${holiday.last_name}`,
                                  )}
                                </td>

                                <td className="px-2 py-2 border text-center">
                                  {holiday.class_name} {holiday.section_name}
                                </td>

                                {/* <td className="px-2 py-2 border text-center">
                                  <button
                                    className="text-blue-600 hover:text-blue-800"
                                    onClick={() => handleEdit(holiday)}
                                  >
                                    <FontAwesomeIcon icon={faEdit} />
                                  </button>
                                </td> */}

                                <td className="px-2 py-2 border text-center">
                                  <button
                                    className="text-blue-600 hover:text-blue-800"
                                    onClick={() => handleEdit(holiday, index)}
                                  >
                                    <FontAwesomeIcon icon={faEdit} />
                                  </button>
                                </td>

                                <td className="px-2 py-2 border text-center">
                                  <button
                                    onClick={() => handleDelete(holiday)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </button>
                                </td>

                                <td className="px-2 py-2 border text-center">
                                  <button
                                    className="text-green-600 hover:text-green-800"
                                    onClick={() => handleDownloadPdf(holiday)}
                                  >
                                    <FontAwesomeIcon icon={faDownload} />
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : holidays.length === 0 ? (
                            <tr>
                              <td colSpan="7">
                                <div className="text-center py-10 text-red-700 text-sm md:text-lg">
                                  Click on 'Upload Health & Activity Data From
                                  Excel Sheet' button to upload and view the
                                  data.
                                </div>
                              </td>
                            </tr>
                          ) : (
                            <tr>
                              <td colSpan="7">
                                <div className="text-center py-10 text-red-700 text-sm md:text-lg">
                                  Result not found!
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pagination */}
                  <div className="flex justify-center pt-3">
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
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50   flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="flex justify-between p-3">
                  <h5 className="modal-title">Confirm Delete</h5>
                  <RxCross1
                    className="float-end relative mt-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                    type="button"
                    onClick={handleCloseModal}
                  />
                </div>
                <div
                  className=" relative  mb-3 h-1 w-[97%] mx-auto bg-red-700"
                  style={{
                    backgroundColor: "#C03078",
                  }}
                ></div>
                <div className="modal-body">
                  Are you sure you want to delete the health and activity record
                  of {` ${currentHolidayNameForDelete} `} ?
                </div>
                <div className=" flex justify-end p-3">
                  <button
                    type="button"
                    className="btn btn-danger px-3 mb-2"
                    onClick={() => handleSubmitDelete(currentHoliday)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDownloadReportCard && (
        <div className="fixed inset-0 z-50   flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="flex justify-between p-3">
                  <h5 className="modal-title">Confirm Download</h5>
                  <RxCross1
                    className="float-end relative mt-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                    type="button"
                    onClick={handleCloseModal}
                  />
                </div>
                <div
                  className=" relative  mb-3 h-1 w-[97%] mx-auto bg-red-700"
                  style={{
                    backgroundColor: "#C03078",
                  }}
                ></div>
                <div className="modal-body">
                  Are you sure you want to Download this Health & Activity
                  Certificate {` ${currentHolidayNameForDelete} `}?
                </div>
                <div className=" flex justify-end p-3">
                  <button
                    type="button"
                    style={{ backgroundColor: "#2196F3" }}
                    className="btn text-white px-3 mb-2"
                    onClick={() => handleDownloadSumbit(currentHoliday)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Downloading..." : "Download"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default HealthActivityRecordUpload;
