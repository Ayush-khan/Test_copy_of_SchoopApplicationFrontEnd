import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { faEdit, faTrash, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import { TbFileCertificate } from "react-icons/tb";
import { RxCross1 } from "react-icons/rx";
import Select from "react-select";
import { MdLockReset, MdOutlineRemoveRedEye } from "react-icons/md";
import { FaCheck } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

function ManageSubjectList() {
  const API_URL = import.meta.env.VITE_API_URL; // URL for host
  // const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [classes, setClasses] = useState([]);
  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
  const [subjects, setSubjects] = useState([]);
  // for allot subject tab
  const [sectionIdForStudentList, setSectionIdForStudentList] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDActiveModal, setShowDActiveModal] = useState(false);
  const [currentStudentDataForActivate, setCurrentStudentDataForActivate] =
    useState(null);

  const [currentSection, setCurrentSection] = useState(null);
  const [currestSubjectNameForDelete, setCurrestSubjectNameForDelete] =
    useState("");

  // This is hold the allot subjet api response
  const [classIdForManage, setclassIdForManage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  // validations state for unique name
  const [grNumber, setGrNumber] = useState("");
  //   variable to store the respone of the allot subject tab
  const [nameError, setNameError] = useState(null);
  const pageSize = 10;

  // for react-search of manage tab teacher Edit and select class
  const [selectedClass, setSelectedClass] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  //   For students
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  // for showing the buttons delete and edit controls
  const [roleId, setRoleId] = useState("");
  const [roleIdValue, setRoleIdValue] = useState("");
  const [hpcClasses, setHpcClasses] = useState([]);

  const navigate = useNavigate();

  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");
  const [showDownloadReportCard, setShowDownloadReportCard] = useState(false);

  // State for form fields and validation errors
  const [setPassword, setSetpassword] = useState("");
  const [userIdset, setUserIdset] = useState("");
  const [passwordError, setPasswordError] = useState(""); // For password error
  const [userIdError, setUserIdError] = useState(""); // For userId error
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [isHpcClass, setIsHpcClass] = useState(false);

  const [classTeacher, setClassTeacher] = useState([]);
  const [isClassTeacher, setIsClassTeacher] = useState("");

  const location = useLocation();
  const section_id = location.state?.section_id || null;
  // console.log("manage section id", section_id);

  const [selectedClassIdHPC, setSelectedClassIdHPC] = useState(null);
  const [selectedSectionIdHPC, setSelectedSectionIdHPC] = useState(null);

  useEffect(() => {
    fetchHPCClasses();
  }, []);

  useEffect(() => {
    if (!roleIdValue) return; // guard against empty
    fetchClassTeacherData(roleIdValue);
  }, [roleIdValue]);

  useEffect(() => {
    fetchStudentNameWithClassId(section_id);
  }, [section_id]);

  const classOptions = useMemo(() => {
    return classes.map((cls) => {
      if (roleId === "T") {
        return {
          value: cls.section_id,
          label: `${cls.classname} ${cls.sectionname}`,
          class_id: cls.class_id,
          section_id: cls.section_id,
        };
      } else {
        return {
          value: cls.section_id,
          label: `${cls?.get_class?.name} ${cls.name} (${cls.students_count})`,
          class_id: cls.class_id,
          section_id: cls.section_id,
        };
      }
    });
  }, [classes, roleId]);

  useEffect(() => {
    if (location.state?.section_id) {
      const matchingOption = classOptions.find(
        (opt) => opt.value === location.state.section_id
      );

      if (matchingOption) {
        handleClassSelect(matchingOption); // Simulates user selecting from dropdown

        // Trigger the search only for programmatic selection
        handleSearch(matchingOption.value);
      }

      // Clear location state to avoid re-triggering on reload
      window.history.replaceState({}, document.title);
    }
  }, [location.state, classOptions]);

  const studentOptions = useMemo(
    () =>
      studentNameWithClassId
        .map((stu) => ({
          value: stu.student_id,
          label: [stu?.first_name, stu?.mid_name, stu?.last_name]
            .filter((namePart) => namePart)
            .join(" "),
        }))
        .filter((option) => option.label), // Remove items with empty labels
    [studentNameWithClassId]
  );

  const fetchClassTeacherData = async () => {
    setLoading(true);
    const token = localStorage.getItem("authToken");

    try {
      const response = await axios.get(
        `${API_URL}/api/get_classes_of_classteacher?teacher_id=${roleIdValue}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const classData = response.data.data;
      console.log("class teacher", classData);

      setClassTeacher(classData);

      // Check if the teacher is a class teacher

      // Check if the teacher is a class teacher
      const isClassTeacherFlag = classData.some(
        (cls) => cls.is_class_teacher === 1
      )
        ? 1
        : 0; // store as 1 or 0
      setIsClassTeacher(isClassTeacherFlag);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching class teacher data:", err);
      setLoading(false);
    }
  };

  const fetchHPCClasses = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.get(`${API_URL}/api/get_hpc_classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // console.log("hpc classes", response?.data.data);
      setHpcClasses(response?.data.data || []);
    } catch (error) {
      toast.error("Error fetching Hpc classes.");
    }
  };
  const hpcClassIds = useMemo(() => {
    return hpcClasses.map((cls) => cls.class_id);
  }, [hpcClasses]);

  // const fetchStudentNameWithClassId = async (section_id = null) => {
  //   try {
  //     setLoadingStudents(true);

  //     const params = section_id ? { section_id } : {};
  //     const token = localStorage.getItem("authToken");

  //     const response = await axios.get(
  //       `${API_URL}/api/getStudentListBySectionData`,
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //         params,
  //       }
  //     );

  //     setStudentNameWithClassId(response?.data?.data || []);
  //   } catch (error) {
  //     toast.error("Error fetching students.");
  //   } finally {
  //     setLoadingStudents(false);
  //   }
  // };

  const fetchStudentNameWithClassId = async (section_id = null) => {
    if (roleId === "T" && !section_id) {
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
        }
      );
      setStudentNameWithClassId(response?.data?.data || []);
    } catch (error) {
      toast.error("Error fetching students.");
    } finally {
      setLoadingStudents(false);
    }
  };

  // const handleClassSelect = (selectedOption) => {
  //   // console.log("", setNameError());
  //   setNameError("");
  //   setSelectedClass(selectedOption);
  //   setSelectedStudent(null);
  //   setSelectedStudentId(null);

  //   const sectionId = selectedOption ? selectedOption.value : null;
  //   setclassIdForManage(sectionId);
  //   setSectionIdForStudentList(sectionId);
  //   fetchStudentNameWithClassId(sectionId);
  // };

  const handleClassSelect = (selectedOption) => {
    setNameError("");
    setSelectedClass(selectedOption);
    console.log("selected class", selectedOption);
    setSelectedStudent(null);
    setSelectedStudentId(null);

    const sectionId = selectedOption ? selectedOption.value : null;
    setclassIdForManage(sectionId);
    setSectionIdForStudentList(sectionId);
    fetchStudentNameWithClassId(sectionId);
  };

  const handleStudentSelect = (selectedOption) => {
    setNameError(""); // Reset student error on selection
    setSelectedStudent(selectedOption);
    setSelectedStudentId(selectedOption?.value);
  };

  const handleGrChange = (e) => {
    setNameError("");
    const numericInput = e.target.value.replace(/[^0-9]/g, ""); // Remove non-numeric characters
    setGrNumber(numericInput);
  };

  useEffect(() => {
    const fetchData = async () => {
      const { roleId, roleIdValue } = await fetchDataRoleId(); // 🔁 returns both values
      await fetchInitialDataAndStudents(roleId, roleIdValue); // ✅ pass them as args
    };

    fetchData();
  }, []);

  const fetchInitialDataAndStudents = async (roleId, roleIdValue) => {
    try {
      setLoadingClasses(true);
      setLoadingStudents(true);

      const token = localStorage.getItem("authToken");

      const classApiUrl =
        roleId === "T"
          ? `${API_URL}/api/get_teacherclasseswithclassteacher?teacher_id=${roleIdValue}`
          : `${API_URL}/api/getallClassWithStudentCount`;

      const [classResponse, studentResponse] = await Promise.all([
        axios.get(classApiUrl, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/getStudentListBySectionData`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const classData =
        roleId === "T"
          ? classResponse.data.data || []
          : classResponse.data || [];

      setClasses(classData);
      setStudentNameWithClassId(studentResponse?.data?.data || []);
    } catch (error) {
      toast.error("Error fetching data.");
    } finally {
      setLoadingClasses(false);
      setLoadingStudents(false);
    }
  };

  const handleSearch = async (incomingSectionId = null) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubjects([]);
    setNameError("");

    const selectedclassid = selectedClass
      ? selectedClass.class_id || selectedClass.id || selectedClass.value
      : null;

    const selectedsectionid = selectedClass
      ? selectedClass.section_id || null
      : null;

    setSelectedClassIdHPC(selectedclassid);
    setSelectedSectionIdHPC(selectedsectionid);
    console.log("Selected class inside handleSearch:", selectedClass);
    console.log("Selected class_id:", selectedclassid);
    console.log("Selected section_id:", selectedsectionid);

    const finalSectionId =
      classIdForManage ||
      incomingSectionId ||
      location?.state?.section_id ||
      null;

    //  No field selected (all users)
    if (roleId !== "T" && !selectedStudentId && !finalSectionId && !grNumber) {
      setNameError("Please select at least one of them.");
      setIsSubmitting(false);
      return;
    }

    //  Teacher tries to search GR No or student without selecting class
    if (roleId === "T" && !classIdForManage && selectedStudentId) {
      setNameError("Please select a class before searching!");
      setIsSubmitting(false);
      return;
    }

    setLoading(true);
    setSearchTerm("");

    try {
      const token = localStorage.getItem("authToken");
      const queryParams = {};

      if (selectedStudentId) queryParams.student_id = selectedStudentId;
      if (finalSectionId) {
        queryParams.section_id =
          typeof finalSectionId === "object"
            ? finalSectionId.id || finalSectionId.value || ""
            : finalSectionId;
      }
      if (grNumber) queryParams.reg_no = grNumber;

      const response = await axios.get(`${API_URL}/api/get_students`, {
        headers: { Authorization: `Bearer ${token}` },
        params: queryParams,
      });

      // 🟡 Handle specific case: API returns 402 or success=false
      if (response.status === 402 || response?.data?.success === false) {
        setNameError("This Gr no student not found for this classes.");
        setSubjects([]);
        setLoading(false);
        setIsSubmitting(false);
        return;
      }

      const studentList =
        response?.data?.students || response?.data?.student || [];

      //  No students found for selected criteria
      if (studentList.length === 0) {
        setNameError("No student found for selected criteria.");
      }

      setSubjects(studentList);
      setPageCount(Math.ceil(studentList.length / pageSize));

      // HPC class check
      const selectedClassId =
        (typeof finalSectionId === "object"
          ? finalSectionId.class_id
          : selectedClass?.class_id) || null;
      setIsHpcClass(selectedClassId && hpcClassIds.includes(selectedClassId));

      setHasSearched(true);
    } catch (error) {
      //  Handle explicit 402 error here also
      if (error?.response?.status === 402) {
        setNameError("This Gr no student not found");
      } else {
        setNameError(error?.response?.data?.message || "Something went wrong!");
      }
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const fetchDataRoleId = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      // console.error("No authentication token found");
      return {};
    }

    try {
      const sessionResponse = await axios.get(`${API_URL}/api/sessionData`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const roleId = sessionResponse?.data?.user?.role_id;
      const regId = sessionResponse?.data?.user?.reg_id;

      setRoleId(roleId); // optional for global use
      setRoleIdValue(regId); // optional for global use

      return { roleId, roleIdValue: regId }; // ✅ return both
    } catch (error) {
      // console.error("Error fetching role data:", error);
      return {};
    }
  };

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const handleEdit = (section) => {
    setCurrentSection(section);
    navigate(`/student/edit/${section.student_id}`, {
      state: {
        student: section,
        section_id: section.section_id,
      },
    });
  };

  const handleDelete = (subject) => {
    // console.log("inside delete of subjectallotmenbt____", subject);
    // console.log("inside delete of subjectallotmenbt", subject.student_id);
    const sectionId = subject.student_id;
    const classToDelete = subjects.find((cls) => cls.student_id === sectionId);
    // setCurrentClass(classToDelete);
    setCurrentSection({ classToDelete });
    // console.log("the currecne t section", currentSection);
    setCurrestSubjectNameForDelete(
      currentSection?.CurrentSection?.student_name
    );
  };

  const handleActiveAndInactive = (subjectIsPass) => {
    // console.log("handleActiveAndInactive-->", subjectIsPass.student_id);
    const studentToActiveOrDeactive = subjects.find(
      (cls) => cls.student_id === subjectIsPass.student_id
    );
    setCurrentStudentDataForActivate({ studentToActiveOrDeactive });
    // console.log("studentToActiveOrDeactive", studentToActiveOrDeactive);
    setShowDActiveModal(true);
  };

  const handleActivateOrNot = async () => {
    if (isSubmitting) return; // Prevent re-submitting
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");

      if (
        !token ||
        !currentStudentDataForActivate ||
        !currentStudentDataForActivate?.studentToActiveOrDeactive?.student_id
      ) {
        throw new Error("Student ID is missing");
      }

      const response = await axios.patch(
        `${API_URL}/api/students/${currentStudentDataForActivate?.studentToActiveOrDeactive?.student_id}/deactivate`,
        {}, // Empty data object
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      handleSearch();

      setShowDActiveModal(false);
      toast.success(response?.data?.message);
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error(`Error activate or deactivate Student: ${error.message}`);
      }
      // console.error("Error activate or deactivate Student:", error);
    } finally {
      setIsSubmitting(false); // Re-enable the button after the operation
      setShowDActiveModal(false);
    }
  };

  const handleView = (subjectIsPassForView) => {
    // console.log("HandleView -->", subjectIsPassForView);
    setCurrentSection(subjectIsPassForView);

    navigate(`/student/view/${subjectIsPassForView.student_id}`, {
      state: {
        student: subjectIsPassForView,
        section_id: section_id || classIdForManage,
      },
    });
  };

  const handleCertificateView = (subjectIsPass) => {
    navigate("/comingSoon");
    // console.log("handleCertificateView-->", subjectIsPass);
  };

  const handleResetPassword = (subjectIsPass) => {
    setUserIdset(subjectIsPass?.user_master?.user_id);
    // console.log("handleResetPassword", subjectIsPass);
    // console.log("userId", userIdset);

    setShowEditModal(true);
  };

  // Handle Reset Password form submission
  // const handleSubmitResetPassword = async () => {
  //   try {
  //     const token = localStorage.getItem("authToken");
  //     console.log("toekn", token);
  //     if (!token) {
  //       toast.error("Authentication token missing");
  //       return;
  //     }
  //     await axios.put(`${API_URL}/api/resetPasssword/${userIdset}`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     // API call to reset the password

  //     toast.success("Password updated successfully!");
  //     setShowEditModal(false); // Close modal after success
  //   } catch (error) {
  //     console.error("Error resetting password:", error);

  //     // Reset previous errors
  //     setPasswordError("");
  //     setUserIdError("");

  //     if (error.response && error.response.data && error.response.data.errors) {
  //       const backendErrors = error.response.data.errors;

  //       // Display each error message for specific fields

  //       if (backendErrors.user_id) {
  //         setUserIdError(backendErrors.user_id.join(", "));
  //       }
  //     } else {
  //       toast.error("Server error. Please try again later.");
  //     }
  //   }
  // };

  const [errorMessage, setErrorMessage] = useState(""); // State to store error message

  const handleSubmitResetPassword = async () => {
    if (isSubmitting) return; // Prevent re-submitting
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        toast.error("Authentication token missing");
        setErrorMessage("Authentication token missing"); // Set error below the field
        return;
      }

      // API call to reset the password with correct header placement
      const response = await axios.put(
        `${API_URL}/api/resetPasssword/${userIdset}`,
        {}, // Pass empty body if there's no data to send
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response?.data?.Status === 404) {
        // console.log("Response is fail");
        // toast.error("User not found");
        setErrorMessage("Invalid user ID");
        return;
      }
      toast.success(
        `Password for user id "${userIdset}" is reset to arnolds successfully!`
      );
      setShowEditModal(false); // Close modal after success
      setErrorMessage(""); // Clear error message on success
    } catch (error) {
      // console.error("Error resetting password:", error);

      // Capture server error message and set it below the field
      if (
        error.response &&
        error?.response?.data &&
        error?.response?.data?.Message
      ) {
        setErrorMessage(error?.response?.data?.Message);
        toast.error(error?.response?.data?.Message); // Show toast with the error
      } else {
        setErrorMessage("Failed to update password. Please try again.");
        toast.error("Failed to update password. Please try again.");
      }
    } finally {
      setIsSubmitting(false); // Re-enable the button after the operation
    }
  };

  // Handle input change for password

  // Handle input change for User ID

  const handleUserIdChange = (e) => {
    setErrorMessage(""); // Clear previous error message
    setUserIdset(e.target.value);
  };

  // const handleSubmitEdit = async () => {
  //   console.log(
  //     "inside the edit model of the subjectallotment",
  //     currentSection.subject_id
  //   );
  // };

  const handleSubmitDelete = async () => {
    if (isSubmitting) return; // Prevent re-submitting
    setIsSubmitting(true);
    // Handle delete submission logic
    try {
      const token = localStorage.getItem("authToken");
      // console.log(
      //   "the currecnt section inside the delte___",
      //   currentSection?.classToDelete?.student_id
      // );
      // console.log("the classes inside the delete", classes);
      // console.log(
      //   "the current section insde the handlesbmitdelete",
      //   currentSection.classToDelete
      // );
      if (
        !token ||
        !currentSection ||
        !currentSection?.classToDelete?.student_id
      ) {
        throw new Error("Student ID is missing");
      }

      await axios.delete(
        `${API_URL}/api/students/${currentSection?.classToDelete?.student_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      // fetchClassNames();
      handleSearch();

      setShowDeleteModal(false);
      // setSubjects([]);
      toast.success("Student deleted successfully!");
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(`Error deleting Student: ${error.response.data.message}`);
      } else {
        toast.error(`Error deleting Student: ${error.message}`);
      }
      // console.error("Error deleting Student:", error);
      // setError(error.message);
    } finally {
      setIsSubmitting(false); // Re-enable the button after the operation
      setShowDeleteModal(false);
    }
  };

  const handleCloseModal = () => {
    setErrorMessage("");
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowDActiveModal(false);
    setShowDownloadReportCard(false);
  };

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

  const filteredSections = subjects.filter((section) => {
    // Convert the search term to lowercase for case-insensitive comparison
    const searchLower = searchTerm.toLowerCase();

    // Get the student's full name, class name, and user ID for filtering
    const studentName =
      `${section?.first_name} ${section?.mid_name} ${section?.last_name}`?.toLowerCase() ||
      "";
    const studentClass = section?.get_class?.name?.toLowerCase() || "";
    const studentUserId = section?.user_master?.user_id?.toLowerCase() || "";
    const studentRollNo = section?.roll_no?.toString().toLowerCase() || ""; // Convert roll number to string for comparison
    const studentGrNo = section?.reg_no?.toString().toLowerCase() || ""; // Convert roll number to string for comparison

    // Check if the search term is present in Roll No, Name, Class, or UserId
    return (
      studentRollNo.includes(searchLower) ||
      studentGrNo.includes(searchLower) ||
      studentName.includes(searchLower) ||
      studentClass.includes(searchLower) ||
      studentUserId.includes(searchLower)
    );
  });

  useEffect(() => {
    setPageCount(Math.ceil(filteredSections.length / pageSize));
  }, [filteredSections, pageSize]);

  const displayedSections = filteredSections.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  // handle allot subject close model
  // console.log("displayedSections", displayedSections);

  const handleReportView = (subject) => {
    // console.log("inside delete of subjectallotmenbt____", subject);
    // console.log("inside delete of subjectallotmenbt", subject.student_id);
    const sectionId = subject.student_id;
    const classToDelete = subjects.find((cls) => cls.student_id === sectionId);
    // setCurrentClass(classToDelete);
    setCurrentSection({ classToDelete });
    // console.log("the currecne t section", currentSection);
    setCurrestSubjectNameForDelete(
      currentSection?.CurrentSection?.student_name
    );

    setShowDownloadReportCard(true);
  };

  const handleDownloadSumbit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");

      if (!token || !currentSection?.classToDelete?.student_id) {
        throw new Error("Student ID is missing");
      }

      const response = await axios.get(
        `${API_URL}/api/get_hpcreportcard?student_id=${currentSection.classToDelete.student_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      if (response.status === 200) {
        toast.success("Holistic Report Card downloaded successfully!");

        // Extract filename from Content-Disposition header if available
        const contentDisposition = response.headers["content-disposition"];
        let filename = "HPC_ReportCard.pdf";

        if (contentDisposition) {
          const match = contentDisposition.match(/filename="?(.+)"?/);
          if (match && match[1]) filename = match[1];
        }

        // Create a blob URL for the PDF file
        const pdfBlob = new Blob([response.data], { type: "application/pdf" });
        const pdfUrl = URL.createObjectURL(pdfBlob);

        // Create a link to initiate the download
        const link = document.createElement("a");
        link.href = pdfUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(pdfUrl);

        handleSearch();
        handleCloseModal();
      } else {
        throw new Error("Failed to download the file");
      }
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(
          `Error in Downloading Report Card: ${error.response.data.error || error.message
          }`
        );
      } else {
        toast.error(`Error in Downloading Report Card: ${error.message}`);
      }
      // console.error("Error in Downloading Report Card:", error);
    } finally {
      setIsSubmitting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      {/* <ToastContainer /> */}
      {/* <div className="md:mx-auto md:w-3/4 p-4 bg-white mt-4 "> */}
      <div className="md:mx-auto md:w-[95%] p-4 bg-white mt-4 ">
        <div className=" card-header  flex justify-between items-center  ">
          <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
            Manage Student
          </h3>
          <RxCross1
            className="float-end relative -top-1 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
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
        {/* <hr className="relative -top-3" /> */}

        <div className="bg-white w-full md:w-[95%] mx-auto rounded-md ">
          <div className="w-full  mx-auto">
            <ToastContainer />
            <div className="mb-4  ">
              <div className="  w-[90%]  mx-auto ">
                <div className=" w-full flex justify-center flex-col md:flex-row gap-x-1 md:gap-x-8">
                  <div className="w-full  gap-x-3 md:justify-start justify-between  my-1 md:my-4 flex  md:flex-row  ">
                    <label
                      htmlFor="classSection"
                      className=" mr-2 pt-2 items-center text-center"
                    >
                      Class
                    </label>
                    <div className="w-[60%] md:w-[50%] ">
                      <Select
                        value={selectedClass}
                        onChange={handleClassSelect}
                        options={classOptions}
                        // placeholder="Select "
                        isSearchable
                        isClearable
                        placeholder={
                          loadingClasses ? "Loading classes..." : "Select"
                        }
                        isDisabled={loadingClasses}
                        className="text-sm"
                      />
                      {/* {nameError && (
                        <div className=" relative top-0.5 ml-1 text-danger text-xs">
                          {nameError}
                        </div>
                      )} */}
                    </div>
                  </div>
                  <div className="w-full  relative left-0 md:-left-[7%] justify-between  md:w-[90%] my-1 md:my-4 flex  md:flex-row  ">
                    <label
                      htmlFor="classSection"
                      className="relative left-0 md:-left-3  md:text-nowrap pt-2 items-center text-center"
                    >
                      Student Name
                    </label>
                    <div className="w-[60%] md:w-[85%] ">
                      {roleId !== "T" ||
                        (roleId === "T" && classIdForManage) ? (
                        <Select
                          value={selectedStudent}
                          onChange={handleStudentSelect}
                          options={studentOptions}
                          // placeholder="Select "
                          isSearchable
                          isClearable
                          className="text-sm"
                          isDisabled={loadingStudents}
                          placeholder={
                            loadingStudents ? "Loading students..." : "Select"
                          }
                        />
                      ) : (
                        // <p className="text-gray-500 text-sm">
                        //   Select a class first to see students.
                        // </p>

                        <Select
                          value={selectedStudent}
                          onChange={handleStudentSelect}
                          isSearchable
                          isClearable
                          className="text-sm"
                          isDisabled={loadingStudents}
                          placeholder={
                            loadingStudents ? "Loading students..." : "Select"
                          }
                        />
                      )}
                      {/* <Select
                        value={selectedStudent}
                        onChange={handleStudentSelect}
                        options={studentOptions}
                        // placeholder="Select "
                        isSearchable
                        isClearable
                        className="text-sm"
                        isDisabled={loadingStudents}
                        placeholder={
                          loadingStudents ? "Loading students..." : "Select"
                        }
                        // isClearable={() => {
                        //   setSelectedStudentId("");
                        // }}
                      /> */}
                      {nameError && (
                        <div className=" relative top-0.5 md:top-[50%] ml-1 text-danger text-md">
                          {nameError}
                        </div>
                      )}{" "}
                    </div>
                  </div>
                  <div className=" relative w-full  justify-between  md:w-[45%] my-1 md:my-4 flex  md:flex-row  ">
                    <label
                      htmlFor="GRnumber"
                      className=" mt-2 ml-0 md:ml-4 text-nowrap"
                    >
                      {" "}
                      GR No.
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      className="h-10 text-gray-600 p-1 border-1 border-gray-300 outline-blue-400 rounded-md w-[60%] md:w-[50%] "
                      id="GRnumber"
                      value={grNumber}
                      onChange={handleGrChange}
                    />
                    {/* {nameError && (
                      <div className=" absolute  top-10 ml-1 text-danger text-xs">
                        {nameError}
                      </div>
                    )}{" "} */}
                  </div>
                  <button
                    onClick={handleSearch}
                    type="button"
                    disabled={isSubmitting}
                    className=" my-1 md:my-4 btn h-10  w-18 md:w-auto btn-primary "
                  >
                    {isSubmitting ? "Searching..." : "Search"}
                  </button>
                </div>
              </div>
            </div>
            {subjects.length > 0 && (
              <div className="w-full  mt-4">
                <div className="card mx-auto lg:w-full shadow-lg">
                  <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                    <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
                      Student List
                    </h3>
                    <div className="w-1/2 md:w-fit mr-1 ">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search "
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div
                    className=" relative w-[97%]   mb-3 h-1  mx-auto bg-red-700"
                    style={{
                      backgroundColor: "#C03078",
                    }}
                  ></div>

                  <div className="card-body w-full">
                    <div className="h-96 lg:h-96 overflow-y-scroll lg:overflow-x-hidden">
                      <table className="min-w-full leading-normal table-auto">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Sr.No
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Roll No
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              GR No.
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Photo
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Name
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Class
                            </th>
                            {/* <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Division
                            </th> */}
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              UserId
                            </th>
                            {(roleId === "A" ||
                              roleId === "M" ||
                              roleId === "U") && (
                                <>
                                  <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                    Edit
                                  </th>
                                  <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                    Delete
                                  </th>
                                  <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                    Inactive
                                  </th>
                                </>
                              )}

                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              View
                            </th>

                            {/* {hasSearched &&
                              ((roleId === "T" &&
                                classTeacher.some(
                                  (cls) =>
                                    cls.is_class_teacher === 1 &&
                                    cls.class_id === selectedClass?.class_id &&
                                    cls.section_id ===
                                      selectedClass?.section_id && 
                                    hpcClassIds.includes(cls.class_id)
                                )) ||
                                (["A", "M", "U"].includes(roleId) &&
                                  hpcClassIds.includes(
                                    selectedClass?.class_id
                                  ))) && (
                                <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                  HPC Report Card
                                </th>
                              )} */}
                            {hasSearched &&
                              ((roleId === "T" &&
                                classTeacher.some(
                                  (cls) =>
                                    cls.is_class_teacher === 1 &&
                                    cls.class_id === selectedClassIdHPC &&
                                    cls.section_id === selectedSectionIdHPC &&
                                    hpcClassIds.includes(cls.class_id)
                                )) ||
                                (["A", "M", "U"].includes(roleId) &&
                                  hpcClassIds.includes(
                                    selectedClassIdHPC
                                  ))) && (
                                <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                  HPC Report Card
                                </th>
                              )}

                            {/* <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              RC & Certificates
                            </th> */}
                            {(roleId === "A" ||
                              roleId === "M" ||
                              roleId === "U") && (
                                <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                  Reset Password
                                </th>
                              )}
                          </tr>
                        </thead>
                        <tbody>
                          {displayedSections.length ? (
                            displayedSections.map((subject, index) => (
                              <tr key={subject.student_id} className="text-sm ">
                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {currentPage * pageSize + index + 1}
                                </td>
                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {subject?.roll_no}
                                </td>
                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {subject?.reg_no}
                                </td>

                                <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm py-1">
                                  <img
                                    src={
                                      subject?.image_name
                                        ? // ? `https://sms.evolvu.in/storage/app/public/student_images/${subject?.image_name}`
                                        `${subject?.image_name}`
                                        : "https://via.placeholder.com/50"
                                    }
                                    alt={subject?.name}
                                    className="rounded-full w-8 h-8 lg:w-10 lg:h-10 object-cover"
                                  />
                                </td>
                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {`${subject?.first_name ?? ""} ${subject?.mid_name
                                    ? subject.mid_name + " "
                                    : ""
                                    }${subject?.last_name ?? ""}`.trim()}
                                </td>

                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm text-nowrap">
                                  {`${subject?.get_class?.name}${" "}${subject?.get_division?.name
                                    }`}
                                </td>
                                {/* <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                {subject?.get_division?.name}
                              </td> */}
                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {subject?.user_master?.user_id}
                                </td>
                                {(roleId === "A" ||
                                  roleId === "M" ||
                                  roleId === "U") && (
                                    <>
                                      <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                        <button
                                          onClick={() => handleEdit(subject)}
                                          className="text-blue-600 hover:text-blue-800 hover:bg-transparent "
                                        >
                                          <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                      </td>
                                      {subject.isPromoted !== "Y" ? (
                                        <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                          <button
                                            onClick={() => handleDelete(subject)}
                                            className="text-red-600 hover:text-red-800 hover:bg-transparent "
                                          >
                                            <FontAwesomeIcon icon={faTrash} />
                                          </button>
                                        </td>
                                      ) : (
                                        <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                          <button
                                            // onClick={() => ()}
                                            className="text-green-500-600 hover:text-green-800 hover:bg-transparent "
                                          >
                                            {/* <FontAwesomeIcon icon={faTrash} /> */}
                                          </button>
                                        </td>
                                      )}
                                      <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm hover:bg-none">
                                        <button
                                          onClick={() =>
                                            handleActiveAndInactive(subject)
                                          }
                                          className={`  font-bold hover:bg-none ${subject.isActive === "Y"
                                            ? "text-green-600 hover:text-green-800 hover:bg-transparent"
                                            : "text-red-700 hover:text-red-900  hover:bg-transparent"
                                            }`}
                                        >
                                          {subject.isActive === "Y" ? (
                                            <FaCheck className="text-xl" />
                                          ) : (
                                            <FontAwesomeIcon
                                              icon={faXmark}
                                              className="text-xl"
                                            />
                                          )}
                                        </button>
                                      </td>
                                    </>
                                  )}

                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  <button
                                    onClick={() => handleView(subject)}
                                    className="text-blue-600 hover:text-blue-800 hover:bg-transparent "
                                  >
                                    <MdOutlineRemoveRedEye className="font-bold text-xl" />
                                  </button>
                                </td>

                                {/* {hasSearched &&
                                  ((roleId === "T" &&
                                    classTeacher.some(
                                      (cls) =>
                                        cls.is_class_teacher === 1 &&
                                        cls.class_id ===
                                          selectedClass?.class_id &&
                                        cls.section_id ===
                                          selectedClass?.section_id &&
                                        hpcClassIds.includes(cls.class_id)
                                    )) ||
                                    (["A", "M", "U"].includes(roleId) &&
                                      hpcClassIds.includes(
                                        selectedClass?.class_id
                                      ))) && (
                                    <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                      <button
                                        onClick={() =>
                                          handleReportView(subject)
                                        }
                                        className="text-green-600 hover:text-green-800 hover:bg-transparent"
                                      >
                                        <TbFileCertificate className="font-bold text-xl" />
                                      </button>
                                    </td>
                                  )} */}

                                {hasSearched &&
                                  ((roleId === "T" &&
                                    classTeacher.some(
                                      (cls) =>
                                        cls.is_class_teacher === 1 &&
                                        cls.class_id === selectedClassIdHPC &&
                                        cls.section_id ===
                                        selectedSectionIdHPC &&
                                        hpcClassIds.includes(cls.class_id)
                                    )) ||
                                    (["A", "M", "U"].includes(roleId) &&
                                      hpcClassIds.includes(
                                        selectedClassIdHPC
                                      ))) && (
                                    <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                      <button
                                        onClick={() =>
                                          handleReportView(subject)
                                        }
                                        className="text-green-600 hover:text-green-800 hover:bg-transparent"
                                      >
                                        <TbFileCertificate className="font-bold text-xl" />
                                      </button>
                                    </td>
                                  )}

                                {/* <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  <button
                                    onClick={() =>
                                      handleCertificateView(subject)
                                    }
                                    className="text-blue-600 hover:text-blue-800 hover:bg-transparent "
                                  >
                                    <TbFileCertificate className="font-bold text-xl" />
                                  </button>
                                </td> */}
                                {(roleId === "A" ||
                                  roleId === "M" ||
                                  roleId === "U") && (
                                    <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                      <button
                                        onClick={() =>
                                          handleResetPassword(subject)
                                        }
                                        className="text-blue-600 hover:text-blue-800 hover:bg-transparent "
                                      >
                                        <MdLockReset className="font-bold text-xl" />
                                      </button>
                                    </td>
                                  )}
                              </tr>
                            ))
                          ) : (
                            <div className=" absolute left-[1%] w-[100%]  text-center flex justify-center items-center mt-14">
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
            )}
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
                    // className="btn-close text-red-600"
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
                  Are you sure you want to delete this student{" "}
                  {`${[
                    currentSection?.classToDelete?.first_name,
                    currentSection?.classToDelete?.mid_name,
                    currentSection?.classToDelete?.last_name,
                  ]
                    .filter(Boolean)
                    .join(" ")}`}
                  ?
                </div>
                <div className=" flex justify-end p-3">
                  <button
                    type="button"
                    className="btn btn-danger px-3 mb-2"
                    onClick={handleSubmitDelete}
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

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal show" style={{ display: "block" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="flex justify-between p-3">
                  <h5 className="modal-title">Reset Password</h5>
                  <RxCross1
                    className="float-end relative mt-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                    onClick={handleCloseModal}
                  />
                </div>
                <div
                  className="relative mb-3 h-1 w-[97%] mx-auto bg-red-700"
                  style={{ backgroundColor: "#C03078" }}
                ></div>

                <div className="modal-body">
                  {/* User ID Input */}
                  <div className="relative mb-3 flex justify-center mx-4">
                    <label htmlFor="userId" className="w-1/2 mt-2">
                      User ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={30}
                      className="form-control shadow-md mb-2"
                      id="userId"
                      value={userIdset} // Prefill userId
                      onChange={handleUserIdChange}
                    />
                    <div className="absolute top-9 left-1/3">
                      {errorMessage && (
                        <span className="text-danger text-xs">
                          {errorMessage}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Password Input
                  <div className="relative mb-3 flex justify-center mx-4">
                    <label htmlFor="newPassword" className="w-1/2 mt-2">
                      New Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      maxLength={30}
                      className="form-control shadow-md mb-2"
                      id="newPassword"
                      value={setPassword} // Prefill password
                      onChange={handleInputChange}
                    />
                    {passwordError && (
                      <span className="text-danger text-xs">
                        {passwordError}
                      </span>
                    )}
                  </div> */}
                </div>

                <div className="flex justify-end p-3">
                  <button
                    type="button"
                    className="btn btn-primary px-3 mb-2"
                    onClick={handleSubmitResetPassword}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Reseting..." : "Reset"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDActiveModal && (
        <div className="fixed inset-0 z-50   flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="flex justify-between p-3">
                  <h5 className="modal-title">
                    {/* Confirm Activate or Deactivate */}
                    {currentStudentDataForActivate?.studentToActiveOrDeactive
                      ?.isActive === "Y"
                      ? `Confirm Deactivate`
                      : `Confirm Activate`}
                  </h5>
                  <RxCross1
                    className="float-end relative mt-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                    type="button"
                    // className="btn-close text-red-600"
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
                  {currentStudentDataForActivate?.studentToActiveOrDeactive
                    ?.isActive === "Y"
                    ? `Are you sure you want to deactivate this student ${[
                      currentStudentDataForActivate?.studentToActiveOrDeactive
                        ?.first_name,
                      currentStudentDataForActivate?.studentToActiveOrDeactive
                        ?.mid_name,
                      currentStudentDataForActivate?.studentToActiveOrDeactive
                        ?.last_name,
                    ]
                      .filter(Boolean) // removes undefined/null/empty strings
                      .join(" ")}?`
                    : `Are you sure you want to activate this student ${[
                      currentStudentDataForActivate?.studentToActiveOrDeactive
                        ?.first_name,
                      currentStudentDataForActivate?.studentToActiveOrDeactive
                        ?.mid_name,
                      currentStudentDataForActivate?.studentToActiveOrDeactive
                        ?.last_name,
                    ]
                      .filter(Boolean) // removes undefined/null/empty strings
                      .join(" ")}?`}
                </div>

                <div className=" flex justify-end p-3">
                  <button
                    type="button"
                    className="btn btn-primary px-3 mb-2"
                    onClick={handleActivateOrNot}
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? currentStudentDataForActivate?.studentToActiveOrDeactive
                        ?.isActive === "Y"
                        ? "Deactivating..."
                        : "Activating..."
                      : currentStudentDataForActivate?.studentToActiveOrDeactive
                        ?.isActive === "Y"
                        ? "Deactivate"
                        : "Activate"}
                    {/* {isSubmitting ? "Activating..." : "Active"} */}
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
                    // className="btn-close text-red-600"
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
                  Are you sure you want to Download this HPC Report Card{" "}
                  {`${[
                    currentSection?.classToDelete?.first_name,
                    currentSection?.classToDelete?.mid_name,
                    currentSection?.classToDelete?.last_name,
                  ]
                    .filter(Boolean)
                    .join(" ")}`}
                  ?
                </div>
                <div className=" flex justify-end p-3">
                  <button
                    type="button"
                    style={{ backgroundColor: "#2196F3" }}
                    className="btn text-white px-3 mb-2"
                    onClick={handleDownloadSumbit}
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

export default ManageSubjectList;
