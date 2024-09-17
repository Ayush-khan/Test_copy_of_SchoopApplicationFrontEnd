// import { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { faEdit, faTrash, faXmark } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import ReactPaginate from "react-paginate";
// import "bootstrap/dist/css/bootstrap.min.css";
// import { TbFileCertificate } from "react-icons/tb";

// import { RxCross1 } from "react-icons/rx";
// import Select from "react-select";
// import { MdLockReset, MdOutlineRemoveRedEye } from "react-icons/md";
// import { FaCheck } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";

// function ManageSubjectList() {
//   const API_URL = import.meta.env.VITE_API_URL; // URL for host
//   // const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const [classes, setClasses] = useState([]);
//   const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
//   const [classesforsubjectallot, setclassesforsubjectallot] = useState([]);
//   const [subjects, setSubjects] = useState([]);
//   // for allot subject tab

//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [showDActiveModal, setShowDActiveModal] = useState(false);
//   const [currentStudentDataForActivate, setCurrentStudentDataForActivate] =
//     useState(null);

//   const [currentSection, setCurrentSection] = useState(null);
//   const [currestSubjectNameForDelete, setCurrestSubjectNameForDelete] =
//     useState("");
//   const [newSection, setnewSectionName] = useState("");
//   const [newSubject, setnewSubjectnName] = useState("");
//   const [newclassnames, setnewclassnames] = useState("");
//   const [teacherIdIs, setteacherIdIs] = useState("");
//   const [teacherNameIs, setTeacherNameIs] = useState("");
//   // This is hold the allot subjet api response
//   const [classIdForManage, setclassIdForManage] = useState("");
//   //   This is for the subject id in the dropdown
//   const [newDepartmentId, setNewDepartmentId] = useState("");
//   const [selectedDepartment, setSelectedDepartment] = useState("");
//   //   For the dropdown of Teachers name api
//   const [departments, setDepartments] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(0);
//   const [pageCount, setPageCount] = useState(0);
//   // validations state for unique name
//   const [nameAvailable, setNameAvailable] = useState(true);
//   const [grNumber, setGrNumber] = useState("");
//   //   variable to store the respone of the allot subject tab

//   const dropdownRef = useRef(null);

//   //   for allot subject checkboxes

//   const [error, setError] = useState(null);
//   const [nameError, setNameError] = useState(null);

//   // errors messages for allot subject tab

//   // for react-search of manage tab teacher Edit and select class
//   const [selectedTeacher, setSelectedTeacher] = useState(null);
//   const [selectedClass, setSelectedClass] = useState(null);
//   //   For students
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [selectedStudentId, setSelectedStudentId] = useState(null);
//   const navigate = useNavigate();
//   // Custom styles for the close button
//   const closeButtonStyle = {
//     background: "transparent",
//     border: "none",
//     fontSize: "16px",
//     cursor: "pointer",
//     color: "red", // White color for the cross icon
//     marginRight: "8px", // Adjust the position of the cross icon
//   };
//   const handleTeacherSelect = (selectedOption) => {
//     setSelectedTeacher(selectedOption);
//     console.log("selectedTeacher", selectedTeacher);
//     setNewDepartmentId(selectedOption.value); // Assuming value is the teacher's ID
//     console.log("setNewDepartmentId", newDepartmentId);
//   };

//   const handleClassSelect = (selectedOption) => {
//     setNameError("");
//     setSelectedClass(selectedOption);
//     setSelectedStudent("");
//     setSelectedStudentId("");

//     setGrNumber("");
//     setclassIdForManage(selectedOption.value); // Assuming value is the class ID
//     // Set loading state for student dropdown
//     // setLoading(false);
//     fetchStudentNameWithClassId(selectedOption.value);
//     // Fetch student list based on selected class and section
//     // fetchStudentNameWithClassId(selectedOption.value).finally(() => {
//     //   setLoading(true); // Stop loading once the API call is complete
//     // });
//   };
//   const handleStudentSelect = (selectedOption) => {
//     setNameError("");
//     setGrNumber("");
//     setSelectedStudent(selectedOption);
//     setSelectedStudentId(selectedOption.value);
//   };

//   const teacherOptions = departments.map((dept) => ({
//     value: dept.reg_id,
//     label: dept.name,
//   }));
//   console.log("teacherOptions", teacherOptions);
//   const classOptions = classes.map((cls) => ({
//     value: cls.section_id,
//     label: `${cls?.get_class?.name}  ${cls.name} (${cls.students_count})`,
//   }));
//   const studentOptions = studentNameWithClassId.map((stu) => ({
//     value: stu.student_id,
//     label: `${stu?.first_name}  ${stu?.mid_name} ${stu.last_name}`,
//   }));

//   //   Sorting logic state
//   const handleGrChange = (e) => {
//     const input = e.target.value;
//     setNameError("");
//     // Use regex to remove any non-numeric characters
//     const numericInput = input.replace(/[^0-9]/g, "");
//     setGrNumber(numericInput);
//   };
//   const pageSize = 10;

//   //   FOr serial number
//   // fetch className with division and student count
//   const fetchClassNames = async () => {
//     try {
//       const token = localStorage.getItem("authToken");
//       const response = await axios.get(
//         `${API_URL}/api/getallClassWithStudentCount`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       if (Array.isArray(response.data)) {
//         setClasses(response.data);
//         console.log("class with student count data", response.data);
//       } else {
//         setError("Unexpected data format");
//       }
//     } catch (error) {
//       console.error(
//         "Error fetching class, section with student count :",
//         error
//       );
//       setError("Error fetching class, section with student count");
//     }
//   };
//   const fetchStudentNameWithClassId = async (section_id = null) => {
//     try {
//       const token = localStorage.getItem("authToken");
//       const params = section_id ? { section_id } : {};
//       console.log("sectionIdfor dropdownstudent search", section_id);
//       const response = await axios.get(
//         `${API_URL}/api/getStudentListBySection`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//           params, // Pass section_id as a query parameter if available
//         }
//       );

//       if (Array.isArray(response?.data?.students)) {
//         setStudentNameWithClassId(response?.data?.students);
//         console.log("Student data is for dropdown", response?.data?.students);
//       } else {
//         setError("Unexpected data format");
//       }
//     } catch (error) {
//       console.error("Error fetching class, section with student count:", error);
//       setError("Error fetching class, section with student count");
//     }
//   };

//   // useEffect(() => {
//   //   fetchClassNames();
//   //   fetchStudentNameWithClassId(); // Initial call without section_id
//   //   fetchDepartments();
//   //   fetchClassNamesForAllotSubject();
//   // }, []);

//   // Example usage within useEffect

//   const fetchClassNamesForAllotSubject = async () => {
//     try {
//       const token = localStorage.getItem("authToken");
//       const response = await axios.get(`${API_URL}/api/getClassList`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (Array.isArray(response.data)) {
//         setclassesforsubjectallot(response.data);
//         console.log(
//           "this is the dropdown of the allot subject tab for class",
//           response.data
//         );
//       } else {
//         setError("Unexpected data format");
//       }
//     } catch (error) {
//       console.error("Error fetching class names:", error);
//       setError("Error fetching class names");
//     }
//   };
//   // THis is for the ALlotTeacherFOrACLaSS tAB FECTH class
//   //   This is the api for get teacher list in the manage tab edit
//   const fetchDepartments = async () => {
//     try {
//       const token = localStorage.getItem("authToken");

//       if (!token) {
//         throw new Error("No authentication token found");
//       }

//       const response = await axios.get(`${API_URL}/api/get_teacher_list`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         withCredentials: true,
//       });

//       setDepartments(response.data);
//       console.log(
//         "888888888888888888888888 this is the edit of get_teacher list in the subject allotement tab",
//         response.data
//       );
//     } catch (error) {
//       setError(error.message);
//     }
//   };

//   useEffect(() => {
//     fetchClassNames();
//     fetchStudentNameWithClassId(classOptions.value);
//     fetchDepartments();
//     fetchClassNamesForAllotSubject();
//   }, []);
//   // Listing tabs data for diffrente tabs
//   // const handleSearch = async () => {
//   //   if (!classIdForManage && !selectedStudentId && !grNumber) {
//   //     setNameError("Please select atleast one of them.");
//   //     return;
//   //   }
//   //   try {
//   //     console.log(
//   //       "for this sectiong id in seaching inside subjectallotment",
//   //       selectedStudentId
//   //     );
//   //     const token = localStorage.getItem("authToken");
//   //     if (selectedStudentId) {
//   //       const response = await axios.get(
//   //         `${API_URL}/api/students/${selectedStudentId}`,
//   //         {
//   //           headers: { Authorization: `Bearer ${token}` },
//   //           //   params: { section_id: classSection },
//   //           //   params: { studentId: selectedStudentId },
//   //         }
//   //       );
//   //       if (Array.isArray(response?.data?.students)) {
//   //         // if (responseArray.length > 0) {
//   //         console.log("inside this getStudentLIstpai");
//   //         setSubjects(response?.data?.students);
//   //         // setSubjects(responseArray);
//   //         setPageCount(Math.ceil(response.data.length / 10)); // Example pagination logic
//   //       } else {
//   //         setSubjects([]);
//   //         toast.error("No student found.");
//   //       }
//   //       console.log(
//   //         "the response of the stdent list is *******",
//   //         response.data.students
//   //       );
//   //     } else if (grNumber) {
//   //       const response = await axios.get(
//   //         `${API_URL}/api/student/reg_no/${grNumber}`,
//   //         {
//   //           headers: { Authorization: `Bearer ${token}` },
//   //           //   params: { section_id: classSection },
//   //           //   params: { studentId: selectedStudentId },
//   //         }
//   //       );
//   //       if (Array.isArray(response?.data?.students)) {
//   //         // if (responseArray.length > 0) {
//   //         console.log("inside this getStudentLIstpai");
//   //         setSubjects(response?.data?.students);
//   //         // setSubjects(responseArray);
//   //         setPageCount(Math.ceil(response.data.length / 10)); // Example pagination logic
//   //       } else {
//   //         setSubjects([]);
//   //         toast.error("No student found.");
//   //       }
//   //       console.log(
//   //         "the response of the stdent list is *******",
//   //         response.data.students
//   //       );
//   //     } else {
//   //       // const params = classIdForManage ? { classIdForManage } : {};
//   //       if (!classIdForManage) {
//   //         error("no classIdForManage");
//   //         console.log("no classId selected please select them");
//   //         return;
//   //       } else {
//   //         setSubjects(studentNameWithClassId);
//   //       }
//   //       // const response = await axios.get(
//   //       //   `${API_URL}/api/getStudentListBySection`,
//   //       //   {
//   //       //     headers: { Authorization: `Bearer ${token}` },
//   //       //     params,
//   //       //     //   params: { section_id: classSection },
//   //       //     //   params: { studentId: selectedStudentId },
//   //       //   }
//   //       // );

//   //       console.log(
//   //         "the response of the stdent list is *******||on the bases of selected class",
//   //         classIdForManage,
//   //         ":",
//   //         subjects
//   //       );
//   //       // Convert the response object to an array of values
//   //       // const responseArray = Object.values(response.data);
//   //       // if (Array.isArray(response?.data?.students)) {
//   //       //   // if (responseArray.length > 0) {
//   //       //   console.log("inside this getStudentLIstpai");
//   //       //   setSubjects(response?.data?.students);
//   //       //   // setSubjects(responseArray);
//   //       //   setPageCount(Math.ceil(response.data.length / 10)); // Example pagination logic
//   //       // } else {
//   //       //   setSubjects([]);
//   //       //   toast.error("No student found.");
//   //       // }
//   //     }
//   //   } catch (error) {
//   //     console.error("Error fetching subjects:", error);
//   //     setError("Error fetching subjects");
//   //   }
//   // };
//   const handleSearch = async () => {
//     if (!classIdForManage && !selectedStudentId && !grNumber) {
//       setNameError("Please select at least one of them.");
//       // aleart("Please select at least one of them!");
//       toast("Please select at least one of them!", {
//         autoClose: 100000,
//         className: "black-background", // Toast will disappear after 3 seconds
//         closeButton: ({ closeToast }) => (
//           <button onClick={closeToast} style={closeButtonStyle}>
//             &#10005; {/* Cross Icon (HTML Entity for "×") */}
//           </button>
//         ),
//       });
//       // alert("Please select at least one of them.");

//       return;
//     }
//     try {
//       const token = localStorage.getItem("authToken");

//       if (selectedStudentId) {
//         const response = await axios.get(
//           `${API_URL}/api/students/${selectedStudentId}`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );
//         if (
//           Array.isArray(response?.data?.students) &&
//           response.data.students.length > 0
//         ) {
//           setSubjects(response.data.students);
//           setPageCount([]); // Example pagination logic
//         } else {
//           setSubjects([]);
//           toast.error("No student found.");
//         }
//       } else if (grNumber) {
//         const response = await axios.get(
//           `${API_URL}/api/student_by_reg_no/${grNumber}`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );
//         if (Array.isArray(response?.data?.student)) {
//           setSubjects([]);
//           console.log(
//             "------>This is the data of the response of the student GrNumber based.....",
//             response?.data?.student
//           );
//           setSubjects(response.data.student);
//           setPageCount([]); // Example pagination logic
//         } else {
//           setSubjects([]);
//           toast.error("No student found.");
//         }
//       } else {
//         if (!classIdForManage) {
//           console.log("No classId selected, please select one.");
//           return;
//         } else {
//           setSubjects([]);
//           setSubjects(studentNameWithClassId);
//           setPageCount(Math.ceil(subjects.length / 10));
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching subjects:", error);
//       if (error.response) {
//         // Server responded with a status other than 200 range
//         const errorMessage =
//           error.response.message || "Server response no student found.";
//         toast.error(`Error: ${errorMessage}`);
//       } else if (error.request) {
//         // Request was made but no response received
//         toast.error("No response from server. Please check your connection.");
//       } else {
//         // Something else caused the error
//         toast.error("An error occurred. Please try again.");
//       }
//       setError("Error fetching subjects");
//     }
//   };

//   const handlePageClick = (data) => {
//     setCurrentPage(data.selected);
//     // Handle page change logic
//   };

//   const handleEdit = (section) => {
//     setCurrentSection(section);
//     navigate(
//       `/student/edit/${section.student_id}`,

//       {
//         state: { student: section },
//       }
//     );
//     // console.log("the currecne t section", currentSection);
//   };

//   const handleDelete = (subject) => {
//     console.log("inside delete of subjectallotmenbt____", subject);
//     console.log("inside delete of subjectallotmenbt", subject.student_id);
//     const sectionId = subject.student_id;
//     const classToDelete = subjects.find((cls) => cls.student_id === sectionId);
//     // setCurrentClass(classToDelete);
//     setCurrentSection({ classToDelete });
//     console.log("the currecne t section", currentSection);
//     setCurrestSubjectNameForDelete(currentSection?.classToDelete?.student_name);
//     console.log("cureendtsungjeg", currentSection?.classToDelete?.student_name);
//     console.log("currestSubjectNameForDelete", currestSubjectNameForDelete);
//     setShowDeleteModal(true);
//   };
//   const handleActiveAndInactive = (subjectIsPass) => {
//     console.log("handleActiveAndInactive-->", subjectIsPass.student_id);
//     const studentToActiveOrDeactive = subjects.find(
//       (cls) => cls.student_id === subjectIsPass.student_id
//     );
//     setCurrentStudentDataForActivate({ studentToActiveOrDeactive });
//     console.log("studentToActiveOrDeactive", studentToActiveOrDeactive);
//     setShowDActiveModal(true);
//   };
//   // const handleActivateOrNot = async () => {
//   //   // Handle delete submission logic
//   //   try {
//   //     const token = localStorage.getItem("authToken");

//   //     console.log(
//   //       "the classes inside the delete",
//   //       currentStudentDataForActivate?.studentToActiveOrDeactive?.student_id
//   //     );

//   //     if (
//   //       !token ||
//   //       !currentStudentDataForActivate ||
//   //       !currentStudentDataForActivate?.studentToActiveOrDeactive?.student_id
//   //     ) {
//   //       throw new Error("Student ID is missing");
//   //     }

//   //     const response = await axios.patch(
//   //       `${API_URL}/api/students/${currentStudentDataForActivate?.studentToActiveOrDeactive?.student_id}/deactivate`,
//   //       {
//   //         headers: {
//   //           Authorization: `Bearer ${token}`,
//   //         },
//   //       }
//   //     );

//   //     // fetchClassNames();
//   //     handleSearch();

//   //     setShowDActiveModal(false);
//   //     // setSubjects([]);
//   //     toast.success(response?.data?.message);
//   //   } catch (error) {
//   //     if (error.response && error.response.data) {
//   //       toast.error(`Error : ${error.response.data.message}`);
//   //     } else {
//   //       toast.error(`Error activate or deactivate Student: ${error.message}`);
//   //     }
//   //     console.error("Error activate or deactivate Student:", error);
//   //     // setError(error.message);
//   //   }
//   //   setShowDActiveModal(false);
//   // };

//   const handleActivateOrNot = async () => {
//     try {
//       const token = localStorage.getItem("authToken");

//       console.log(
//         "the classes inside the delete",
//         currentStudentDataForActivate?.studentToActiveOrDeactive?.student_id
//       );

//       if (
//         !token ||
//         !currentStudentDataForActivate ||
//         !currentStudentDataForActivate?.studentToActiveOrDeactive?.student_id
//       ) {
//         throw new Error("Student ID is missing");
//       }

//       const response = await axios.patch(
//         `${API_URL}/api/students/${currentStudentDataForActivate?.studentToActiveOrDeactive?.student_id}/deactivate`,
//         {}, // Empty data object
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       handleSearch();

//       setShowDActiveModal(false);
//       toast.success(response?.data?.message);
//     } catch (error) {
//       if (error.response && error.response.data) {
//         toast.error(`Error: ${error.response.data.message}`);
//       } else {
//         toast.error(`Error activate or deactivate Student: ${error.message}`);
//       }
//       console.error("Error activate or deactivate Student:", error);
//     }
//     setShowDActiveModal(false);
//   };

//   const handleView = (subjectIsPassForView) => {
//     console.log("HandleView-->", subjectIsPassForView);
//     setCurrentSection(subjectIsPassForView);
//     navigate(
//       `/student/view/${subjectIsPassForView.student_id}`,

//       {
//         state: { student: subjectIsPassForView },
//       }
//     );
//   };
//   const handleCertificateView = (subjectIsPass) => {
//     console.log("handleCertificateView-->", subjectIsPass);
//   };
//   const handleResetPassword = (subjectIsPass) => {
//     console.log("handleResetPassword-->", subjectIsPass);
//   };

//   const handleSubmitEdit = async () => {
//     console.log(
//       "inside the edit model of the subjectallotment",
//       currentSection.subject_id
//     );
//   };

//   const handleSubmitDelete = async () => {
//     // Handle delete submission logic
//     try {
//       const token = localStorage.getItem("authToken");
//       console.log(
//         "the currecnt section inside the delte___",
//         currentSection?.classToDelete?.student_id
//       );
//       console.log("the classes inside the delete", classes);
//       console.log(
//         "the current section insde the handlesbmitdelete",
//         currentSection.classToDelete
//       );
//       if (
//         !token ||
//         !currentSection ||
//         !currentSection?.classToDelete?.student_id
//       ) {
//         throw new Error("Student ID is missing");
//       }

//       await axios.delete(
//         `${API_URL}/api/students/${currentSection?.classToDelete?.student_id}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           withCredentials: true,
//         }
//       );

//       // fetchClassNames();
//       handleSearch();

//       setShowDeleteModal(false);
//       // setSubjects([]);
//       toast.success("Student deleted successfully!");
//     } catch (error) {
//       if (error.response && error.response.data) {
//         toast.error(`Error deleting Student: ${error.response.data.message}`);
//       } else {
//         toast.error(`Error deleting Student: ${error.message}`);
//       }
//       console.error("Error deleting Student:", error);
//       // setError(error.message);
//     }
//     setShowDeleteModal(false);
//   };

//   const handleCloseModal = () => {
//     setShowEditModal(false);
//     setShowDeleteModal(false);
//     setShowDActiveModal(false);
//   };

//   const filteredSections = subjects.filter((section) => {
//     // Convert the teacher's name and subject's name to lowercase for case-insensitive comparison
//     const studentFullName =
//       `${section?.first_name} ${section?.mid_name} ${section?.last_name}`?.toLowerCase() ||
//       "";
//     const UserId = section?.user?.user_id?.toLowerCase() || "";

//     // Check if the search term is present in either the teacher's name or the subject's name
//     return (
//       studentFullName.includes(searchTerm.toLowerCase()) ||
//       UserId.includes(searchTerm.toLowerCase())
//     );
//   });
//   const displayedSections = filteredSections.slice(
//     currentPage * pageSize,
//     (currentPage + 1) * pageSize
//   );
//   // handle allot subject close model
//   console.log("displayedSections", displayedSections);
//   return (
//     <>
//       {/* <ToastContainer /> */}
//       {/* <div className="md:mx-auto md:w-3/4 p-4 bg-white mt-4 "> */}
//       <div className="md:mx-auto md:w-[95%] p-4 bg-white mt-4 ">
//         <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
//           Manage Student
//         </h3>
//         <div
//           className=" relative  mb-8   h-1  mx-auto bg-red-700"
//           style={{
//             backgroundColor: "#C03078",
//           }}
//         ></div>
//         {/* <hr className="relative -top-3" /> */}

//         <div className="bg-white w-full md:w-[95%] mx-auto rounded-md ">
//           {/* <ManageSubjectsTab
//                classSection={classSection}
//                nameError={nameError}
//                handleChangeClassSection={handleChangeClassSection}
//                handleSearch={handleSearch}
//                classes={classes}
//                subjects={subjects}
//                displayedSections={displayedSections}
//                setSearchTerm={setSearchTerm}
//                handleEdit={handleEdit}
//                handleDelete={handleDelete}
//                pageCount={pageCount}
//                handlePageClick={handlePageClick}
//              /> */}
//           <div className="w-full  mx-auto">
//             <ToastContainer />
//             <div className="mb-4  ">
//               <div className="  w-[90%]  mx-auto ">
//                 <div className=" w-full flex justify-center flex-col md:flex-row gap-x-1 md:gap-x-8">
//                   <div className="w-full  gap-x-3 md:justify-start justify-between  my-1 md:my-4 flex  md:flex-row  ">
//                     <label
//                       htmlFor="classSection"
//                       className=" mr-2 pt-2 items-center text-center"
//                     >
//                       Class
//                     </label>
//                     <div className="w-[60%] md:w-[50%] ">
//                       <Select
//                         value={selectedClass}
//                         onChange={handleClassSelect}
//                         options={classOptions}
//                         placeholder="Select "
//                         isSearchable
//                         isClearable
//                         className="text-sm"
//                       />
//                       {/* {nameError && (
//                         <div className=" relative top-0.5 ml-1 text-danger text-xs">
//                           {nameError}
//                         </div>
//                       )} */}
//                     </div>
//                   </div>
//                   <div className="w-full  relative left-0 md:-left-[7%] justify-between  md:w-[90%] my-1 md:my-4 flex  md:flex-row  ">
//                     <label
//                       htmlFor="classSection"
//                       className="relative left-0 md:-left-3  md:text-nowrap pt-2 items-center text-center"
//                     >
//                       Student Name
//                     </label>
//                     <div className="w-[60%] md:w-[85%] ">
//                       <Select
//                         value={selectedStudent}
//                         onChange={handleStudentSelect}
//                         options={studentOptions}
//                         placeholder="Select "
//                         isSearchable
//                         isClearable
//                         className="text-sm"
//                         // isClearable={() => {
//                         //   setSelectedStudentId("");
//                         // }}
//                       />
//                       {nameError && (
//                         <div className=" relative top-0.5 md:top-[50%] ml-1 text-danger text-md">
//                           {nameError}
//                         </div>
//                       )}{" "}
//                     </div>
//                   </div>
//                   <div className=" relative w-full  justify-between  md:w-[45%] my-1 md:my-4 flex  md:flex-row  ">
//                     <label
//                       htmlFor="GRnumber"
//                       className=" mt-2 ml-0 md:ml-4 text-nowrap"
//                     >
//                       {" "}
//                       GR No.
//                     </label>
//                     <input
//                       type="text"
//                       maxLength={10}
//                       className="h-10 text-gray-600 p-1 border-1 border-gray-300 outline-blue-400 rounded-md w-[60%] md:w-[50%] "
//                       id="GRnumber"
//                       value={grNumber}
//                       onChange={handleGrChange}
//                     />
//                     {/* {nameError && (
//                       <div className=" absolute  top-10 ml-1 text-danger text-xs">
//                         {nameError}
//                       </div>
//                     )}{" "} */}
//                   </div>
//                   <button
//                     onClick={handleSearch}
//                     type="button"
//                     className=" my-1 md:my-4 btn h-10  w-18 md:w-auto btn-primary "
//                   >
//                     Search
//                   </button>
//                 </div>
//               </div>
//             </div>
//             {subjects.length > 0 && (
//               <div className="w-full  mt-4">
//                 <div className="card mx-auto lg:w-full shadow-lg">
//                   <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
//                     <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
//                       Student List
//                     </h3>
//                     <div className="w-1/2 md:w-fit mr-1 ">
//                       <input
//                         type="text"
//                         className="form-control"
//                         placeholder="Search "
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                       />
//                     </div>
//                   </div>
//                   <div
//                     className=" relative w-[97%]   mb-3 h-1  mx-auto bg-red-700"
//                     style={{
//                       backgroundColor: "#C03078",
//                     }}
//                   ></div>

//                   <div className="card-body w-full">
//                     <div className="h-96 lg:h-96 overflow-y-scroll lg:overflow-x-hidden">
//                       <table className="min-w-full leading-normal table-auto">
//                         <thead>
//                           <tr className="bg-gray-100">
//                             <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
//                               S.No
//                             </th>
//                             <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
//                               Roll No
//                             </th>
//                             <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
//                               Photo
//                             </th>
//                             <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
//                               Name
//                             </th>
//                             <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
//                               Class
//                             </th>
//                             {/* <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
//                               Division
//                             </th> */}
//                             <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
//                               UserId
//                             </th>
//                             <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
//                               Edit
//                             </th>
//                             <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
//                               Delete
//                             </th>
//                             <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
//                               Inactive
//                             </th>
//                             <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
//                               View
//                             </th>
//                             <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
//                               RC & Certificates
//                             </th>
//                             <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
//                               Reset Password
//                             </th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {displayedSections.map((subject, index) => (
//                             <tr
//                               key={subject.student_id}
//                               className="text-gray-700 text-sm font-light"
//                             >
//                               <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
//                                 {index + 1}
//                               </td>
//                               <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
//                                 {subject?.roll_no}
//                               </td>
//                               <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
//                                 {subject?.photo}
//                               </td>
//                               <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
//                                 {`${subject?.first_name} ${subject?.mid_name} ${subject?.last_name}`}
//                               </td>
//                               <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm text-nowrap">
//                                 {`${subject?.get_class?.name}${" "}${
//                                   subject?.get_division?.name
//                                 }`}
//                               </td>
//                               {/* <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
//                                 {subject?.get_division?.name}
//                               </td> */}
//                               <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
//                                 {subject?.parents?.user?.user_id}
//                               </td>

//                               <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
//                                 <button
//                                   onClick={() => handleEdit(subject)}
//                                   className="text-blue-600 hover:text-blue-800 hover:bg-transparent "
//                                 >
//                                   <FontAwesomeIcon icon={faEdit} />
//                                 </button>
//                               </td>
//                               <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
//                                 <button
//                                   onClick={() => handleDelete(subject)}
//                                   className="text-red-600 hover:text-red-800 hover:bg-transparent "
//                                 >
//                                   <FontAwesomeIcon icon={faTrash} />
//                                 </button>
//                               </td>
//                               {/* <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
//                                 <button
//                                   onClick={() =>
//                                     handleActiveAndInactive(subject)
//                                   }
//                                 >
//                                   {subject.isActive === "Y" ? (
//                                     <FontAwesomeIcon
//                                       icon={faXmark}
//                                       className="text-red-700 hover:text-red-900 font-bold text-xl hover:bg-transparent "
//                                     />
//                                   ) : (
//                                     <FaCheck className="text-green-600 hover:text-green-800 hover:bg-transparent" />
//                                   )}
//                                 </button>
//                               </td> */}
//                               <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm hover:bg-none">
//                                 <button
//                                   onClick={() =>
//                                     handleActiveAndInactive(subject)
//                                   }
//                                   className={`  font-bold hover:bg-none ${
//                                     subject.isActive === "Y"
//                                       ? "text-green-600 hover:text-green-800 hover:bg-transparent"
//                                       : "text-red-700 hover:text-red-900  hover:bg-transparent"
//                                   }`}
//                                 >
//                                   {subject.isActive === "Y" ? (
//                                     <FaCheck className="text-xl" />
//                                   ) : (
//                                     <FontAwesomeIcon
//                                       icon={faXmark}
//                                       className="text-xl"
//                                     />
//                                   )}
//                                 </button>
//                               </td>

//                               <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
//                                 <button
//                                   onClick={() => handleView(subject)}
//                                   className="text-blue-600 hover:text-blue-800 hover:bg-transparent "
//                                 >
//                                   <MdOutlineRemoveRedEye className="font-bold text-xl" />
//                                 </button>
//                               </td>
//                               <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
//                                 <button
//                                   onClick={() => handleCertificateView(subject)}
//                                   className="text-blue-600 hover:text-blue-800 hover:bg-transparent "
//                                 >
//                                   <TbFileCertificate className="font-bold text-xl" />
//                                 </button>
//                               </td>
//                               <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
//                                 <button
//                                   onClick={() => handleResetPassword(subject)}
//                                   className="text-blue-600 hover:text-blue-800 hover:bg-transparent "
//                                 >
//                                   <MdLockReset className="font-bold text-xl" />
//                                 </button>
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                     <div className=" flex justify-center pt-2 -mb-3">
//                       {/* <ReactPaginate
//                         previousLabel={"Previous"}
//                         nextLabel={"Next"}
//                         breakLabel={"..."}
//                         pageCount={pageCount}
//                         onPageChange={handlePageClick}
//                         marginPagesDisplayed={1}
//                         pageRangeDisplayed={1}
//                         containerClassName={"pagination"}
//                         pageClassName={"page-item"}
//                         pageLinkClassName={"page-link"}
//                         previousClassName={"page-item"}
//                         previousLinkClassName={"page-link"}
//                         nextClassName={"page-item"}
//                         nextLinkClassName={"page-link"}
//                         breakClassName={"page-item"}
//                         breakLinkClassName={"page-link"}
//                         activeClassName={"active"}
//                       /> */}
//                       <ReactPaginate
//                         previousLabel={"Previous"}
//                         nextLabel={"Next"}
//                         breakLabel={"..."}
//                         breakClassName={"page-item"}
//                         breakLinkClassName={"page-link"}
//                         pageCount={pageCount}
//                         marginPagesDisplayed={1}
//                         pageRangeDisplayed={1}
//                         onPageChange={handlePageClick}
//                         containerClassName={"pagination"}
//                         pageClassName={"page-item"}
//                         pageLinkClassName={"page-link"}
//                         previousClassName={"page-item"}
//                         previousLinkClassName={"page-link"}
//                         nextClassName={"page-item"}
//                         nextLinkClassName={"page-link"}
//                         activeClassName={"active"}
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Delete Modal */}
//       {showDeleteModal && (
//         <div className="fixed inset-0 z-50   flex items-center justify-center bg-black bg-opacity-50">
//           <div className="modal fade show" style={{ display: "block" }}>
//             <div className="modal-dialog modal-dialog-centered">
//               <div className="modal-content">
//                 <div className="flex justify-between p-3">
//                   <h5 className="modal-title">Confirm Delete</h5>
//                   <RxCross1
//                     className="float-end relative mt-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
//                     type="button"
//                     // className="btn-close text-red-600"
//                     onClick={handleCloseModal}
//                   />
//                   {console.log(
//                     "the currecnt section inside delete of the managesubjhect",
//                     currentSection
//                   )}
//                 </div>
//                 <div
//                   className=" relative  mb-3 h-1 w-[97%] mx-auto bg-red-700"
//                   style={{
//                     backgroundColor: "#C03078",
//                   }}
//                 ></div>
//                 <div className="modal-body">
//                   Are you sure you want to delete this student{" "}
//                   {` ${currestSubjectNameForDelete} `} ?
//                 </div>
//                 <div className=" flex justify-end p-3">
//                   <button
//                     type="button"
//                     className="btn btn-danger px-3 mb-2"
//                     onClick={handleSubmitDelete}
//                   >
//                     Delete
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//       {showDActiveModal && (
//         <div className="fixed inset-0 z-50   flex items-center justify-center bg-black bg-opacity-50">
//           <div className="modal fade show" style={{ display: "block" }}>
//             <div className="modal-dialog modal-dialog-centered">
//               <div className="modal-content">
//                 <div className="flex justify-between p-3">
//                   <h5 className="modal-title">
//                     Confirm Activate or Deactivate
//                   </h5>
//                   <RxCross1
//                     className="float-end relative mt-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
//                     type="button"
//                     // className="btn-close text-red-600"
//                     onClick={handleCloseModal}
//                   />
//                   {console.log(
//                     "the currecnt section inside delete of the managesubjhect",
//                     currentSection
//                   )}
//                 </div>
//                 <div
//                   className=" relative  mb-3 h-1 w-[97%] mx-auto bg-red-700"
//                   style={{
//                     backgroundColor: "#C03078",
//                   }}
//                 ></div>
//                 <div className="modal-body">
//                   Are you sure you want to Activate or Deactivate this student{" "}
//                   {` ${currestSubjectNameForDelete} `} ?
//                 </div>
//                 <div className=" flex justify-end p-3">
//                   <button
//                     type="button"
//                     className="btn btn-primary px-3 mb-2"
//                     onClick={handleActivateOrNot}
//                   >
//                     Active
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// export default ManageSubjectList;

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
import { useNavigate } from "react-router-dom";

function ManageSubjectList() {
  const API_URL = import.meta.env.VITE_API_URL; // URL for host
  // const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [classes, setClasses] = useState([]);
  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
  const [classesforsubjectallot, setclassesforsubjectallot] = useState([]);
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
  const [newSection, setnewSectionName] = useState("");
  const [newSubject, setnewSubjectnName] = useState("");
  const [newclassnames, setnewclassnames] = useState("");
  const [teacherIdIs, setteacherIdIs] = useState("");
  const [teacherNameIs, setTeacherNameIs] = useState("");
  // This is hold the allot subjet api response
  const [classIdForManage, setclassIdForManage] = useState("");
  //   This is for the subject id in the dropdown
  const [newDepartmentId, setNewDepartmentId] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  //   For the dropdown of Teachers name api
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  // validations state for unique name
  const [nameAvailable, setNameAvailable] = useState(true);
  const [grNumber, setGrNumber] = useState("");
  //   variable to store the respone of the allot subject tab

  const dropdownRef = useRef(null);

  //   for allot subject checkboxes

  const [error, setError] = useState(null);
  const [nameError, setNameError] = useState(null);
  const pageSize = 10;
  // errors messages for allot subject tab

  // for react-search of manage tab teacher Edit and select class
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  //   For students
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const navigate = useNavigate();
  // Custom styles for the close button
  const closeButtonStyle = {
    background: "transparent",
    border: "none",
    fontSize: "16px",
    cursor: "pointer",
    color: "red", // White color for the cross icon
    marginRight: "8px", // Adjust the position of the cross icon
  };

  const classOptions = useMemo(
    () =>
      classes.map((cls) => ({
        value: cls.section_id,
        label: `${cls?.get_class?.name} ${cls.name} (${cls.students_count})`,
      })),
    [classes]
  );

  const studentOptions = useMemo(
    () =>
      studentNameWithClassId.map((stu) => ({
        value: stu.student_id,
        label: `${stu?.first_name} ${stu?.mid_name} ${stu.last_name}`,
      })),
    [studentNameWithClassId]
  );

  const handleClassSelect = (selectedOption) => {
    setNameError("");
    setSelectedClass(selectedOption);
    setclassIdForManage(selectedOption.value); // Assuming value is the class ID
    fetchStudentNameWithClassId(selectedOption.value); // Fetch students for selected class
    setSectionIdForStudentList(selectedOption.value); //
  };

  const handleStudentSelect = (selectedOption) => {
    setNameError("");
    setSelectedStudent(selectedOption);
    setSelectedStudentId(selectedOption.value);
  };

  const handleGrChange = (e) => {
    const numericInput = e.target.value.replace(/[^0-9]/g, ""); // Remove non-numeric characters
    setGrNumber(numericInput);
  };

  // Fetch initial data (classes with student count) and display loader while loading
  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const classResponse = await axios.get(
        `${API_URL}/api/getallClassWithStudentCount`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setClasses(classResponse.data || []);
    } catch (error) {
      toast.error("Error fetching initial data.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch student list based on class ID
  const fetchStudentNameWithClassId = async (section_id = null) => {
    setLoading(true);
    try {
      const params = section_id ? { section_id } : {};
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/api/getStudentListBySection`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );
      setStudentNameWithClassId(response?.data?.students || []);
    } catch (error) {
      toast.error("Error fetching students.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!classIdForManage && !selectedStudentId && !grNumber) {
      setNameError("Please select at least one of them.");
      toast.error("Please select at least one of them!");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      let response;
      if (selectedStudentId) {
        response = await axios.get(
          `${API_URL}/api/students/${selectedStudentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else if (grNumber) {
        response = await axios.get(
          `${API_URL}/api/student_by_reg_no/${grNumber}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else if (selectedClass) {
        response = await axios.get(`${API_URL}/api/getStudentListBySection`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { section_id: selectedClass.value },
        });
      }

      const studentList = response?.data?.students || [];
      setSubjects(studentList);
      setPageCount(Math.ceil(studentList.length / pageSize)); // Set page count based on response size
    } catch (error) {
      toast.error("Error fetching student details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData(); // Fetch classes once when the component mounts
    fetchStudentNameWithClassId(classOptions.value);
  }, []);
  // Handle pagination
  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const handleEdit = (section) => {
    setCurrentSection(section);
    navigate(
      `/student/edit/${section.student_id}`,

      {
        state: { student: section },
      }
    );
    // console.log("the currecne t section", currentSection);
  };

  const handleDelete = (subject) => {
    console.log("inside delete of subjectallotmenbt____", subject);
    console.log("inside delete of subjectallotmenbt", subject.student_id);
    const sectionId = subject.student_id;
    const classToDelete = subjects.find((cls) => cls.student_id === sectionId);
    // setCurrentClass(classToDelete);
    setCurrentSection({ classToDelete });
    console.log("the currecne t section", currentSection);
    setCurrestSubjectNameForDelete(currentSection?.classToDelete?.student_name);
    console.log("cureendtsungjeg", currentSection?.classToDelete?.student_name);
    console.log("currestSubjectNameForDelete", currestSubjectNameForDelete);
    setShowDeleteModal(true);
  };
  const handleActiveAndInactive = (subjectIsPass) => {
    console.log("handleActiveAndInactive-->", subjectIsPass.student_id);
    const studentToActiveOrDeactive = subjects.find(
      (cls) => cls.student_id === subjectIsPass.student_id
    );
    setCurrentStudentDataForActivate({ studentToActiveOrDeactive });
    console.log("studentToActiveOrDeactive", studentToActiveOrDeactive);
    setShowDActiveModal(true);
  };

  const handleActivateOrNot = async () => {
    try {
      const token = localStorage.getItem("authToken");

      console.log(
        "the classes inside the delete",
        currentStudentDataForActivate?.studentToActiveOrDeactive?.student_id
      );

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
      console.error("Error activate or deactivate Student:", error);
    }
    setShowDActiveModal(false);
  };

  const handleView = (subjectIsPassForView) => {
    console.log("HandleView-->", subjectIsPassForView);
    setCurrentSection(subjectIsPassForView);
    navigate(
      `/student/view/${subjectIsPassForView.student_id}`,

      {
        state: { student: subjectIsPassForView },
      }
    );
  };
  const handleCertificateView = (subjectIsPass) => {
    console.log("handleCertificateView-->", subjectIsPass);
  };
  const handleResetPassword = (subjectIsPass) => {
    console.log("handleResetPassword-->", subjectIsPass);
  };

  const handleSubmitEdit = async () => {
    console.log(
      "inside the edit model of the subjectallotment",
      currentSection.subject_id
    );
  };

  const handleSubmitDelete = async () => {
    // Handle delete submission logic
    try {
      const token = localStorage.getItem("authToken");
      console.log(
        "the currecnt section inside the delte___",
        currentSection?.classToDelete?.student_id
      );
      console.log("the classes inside the delete", classes);
      console.log(
        "the current section insde the handlesbmitdelete",
        currentSection.classToDelete
      );
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
      console.error("Error deleting Student:", error);
      // setError(error.message);
    }
    setShowDeleteModal(false);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowDActiveModal(false);
  };

  const filteredSections = subjects.filter((section) => {
    // Convert the teacher's name and subject's name to lowercase for case-insensitive comparison
    const studentFullName =
      `${section?.first_name} ${section?.mid_name} ${section?.last_name}`?.toLowerCase() ||
      "";
    const UserId = section?.user?.user_id?.toLowerCase() || "";

    // Check if the search term is present in either the teacher's name or the subject's name
    return (
      studentFullName.includes(searchTerm.toLowerCase()) ||
      UserId.includes(searchTerm.toLowerCase())
    );
  });
  const displayedSections = filteredSections.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );
  // handle allot subject close model
  console.log("displayedSections", displayedSections);
  return (
    <>
      {/* <ToastContainer /> */}
      {/* <div className="md:mx-auto md:w-3/4 p-4 bg-white mt-4 "> */}
      <div className="md:mx-auto md:w-[95%] p-4 bg-white mt-4 ">
        <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
          Manage Student
        </h3>
        <div
          className=" relative  mb-8   h-1  mx-auto bg-red-700"
          style={{
            backgroundColor: "#C03078",
          }}
        ></div>
        {/* <hr className="relative -top-3" /> */}

        <div className="bg-white w-full md:w-[95%] mx-auto rounded-md ">
          {/* <ManageSubjectsTab
               classSection={classSection}
               nameError={nameError}
               handleChangeClassSection={handleChangeClassSection}
               handleSearch={handleSearch}
               classes={classes}
               subjects={subjects}
               displayedSections={displayedSections}
               setSearchTerm={setSearchTerm}
               handleEdit={handleEdit}
               handleDelete={handleDelete}
               pageCount={pageCount}
               handlePageClick={handlePageClick}
             /> */}
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
                        placeholder="Select "
                        isSearchable
                        isClearable
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
                      <Select
                        value={selectedStudent}
                        onChange={handleStudentSelect}
                        options={studentOptions}
                        placeholder="Select "
                        isSearchable
                        isClearable
                        className="text-sm"
                        // isClearable={() => {
                        //   setSelectedStudentId("");
                        // }}
                      />
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
                    className=" my-1 md:my-4 btn h-10  w-18 md:w-auto btn-primary "
                  >
                    Search
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
                              S.No
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Roll No
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
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Edit
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Delete
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Inactive
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              View
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              RC & Certificates
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Reset Password
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayedSections.map((subject, index) => (
                            <tr
                              key={subject.student_id}
                              className="text-gray-700 text-sm font-light"
                            >
                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                {index + 1}
                              </td>
                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                {subject?.roll_no}
                              </td>
                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                {subject?.photo}
                              </td>
                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                {`${subject?.first_name} ${subject?.mid_name} ${subject?.last_name}`}
                              </td>
                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm text-nowrap">
                                {`${subject?.get_class?.name}${" "}${
                                  subject?.get_division?.name
                                }`}
                              </td>
                              {/* dfsfg */}
                              {/* <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                {subject?.get_division?.name}
                              </td> */}
                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                {subject?.user_master?.user_id}
                              </td>

                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                <button
                                  onClick={() => handleEdit(subject)}
                                  className="text-blue-600 hover:text-blue-800 hover:bg-transparent "
                                >
                                  <FontAwesomeIcon icon={faEdit} />
                                </button>
                              </td>
                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                <button
                                  onClick={() => handleDelete(subject)}
                                  className="text-red-600 hover:text-red-800 hover:bg-transparent "
                                >
                                  <FontAwesomeIcon icon={faTrash} />
                                </button>
                              </td>
                              {/* <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                <button
                                  onClick={() =>
                                    handleActiveAndInactive(subject)
                                  }
                                >
                                  {subject.isActive === "Y" ? (
                                    <FontAwesomeIcon
                                      icon={faXmark}
                                      className="text-red-700 hover:text-red-900 font-bold text-xl hover:bg-transparent "
                                    />
                                  ) : (
                                    <FaCheck className="text-green-600 hover:text-green-800 hover:bg-transparent" />
                                  )}
                                </button>
                              </td> */}
                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm hover:bg-none">
                                <button
                                  onClick={() =>
                                    handleActiveAndInactive(subject)
                                  }
                                  className={`  font-bold hover:bg-none ${
                                    subject.isActive === "Y"
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

                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                <button
                                  onClick={() => handleView(subject)}
                                  className="text-blue-600 hover:text-blue-800 hover:bg-transparent "
                                >
                                  <MdOutlineRemoveRedEye className="font-bold text-xl" />
                                </button>
                              </td>
                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                <button
                                  onClick={() => handleCertificateView(subject)}
                                  className="text-blue-600 hover:text-blue-800 hover:bg-transparent "
                                >
                                  <TbFileCertificate className="font-bold text-xl" />
                                </button>
                              </td>
                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                <button
                                  onClick={() => handleResetPassword(subject)}
                                  className="text-blue-600 hover:text-blue-800 hover:bg-transparent "
                                >
                                  <MdLockReset className="font-bold text-xl" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className=" flex justify-center pt-2 -mb-3">
                      {/* <ReactPaginate
                        previousLabel={"Previous"}
                        nextLabel={"Next"}
                        breakLabel={"..."}
                        pageCount={pageCount}
                        onPageChange={handlePageClick}
                        marginPagesDisplayed={1}
                        pageRangeDisplayed={1}
                        containerClassName={"pagination"}
                        pageClassName={"page-item"}
                        pageLinkClassName={"page-link"}
                        previousClassName={"page-item"}
                        previousLinkClassName={"page-link"}
                        nextClassName={"page-item"}
                        nextLinkClassName={"page-link"}
                        breakClassName={"page-item"}
                        breakLinkClassName={"page-link"}
                        activeClassName={"active"}
                      /> */}
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
                  {console.log(
                    "the currecnt section inside delete of the managesubjhect",
                    currentSection
                  )}
                </div>
                <div
                  className=" relative  mb-3 h-1 w-[97%] mx-auto bg-red-700"
                  style={{
                    backgroundColor: "#C03078",
                  }}
                ></div>
                <div className="modal-body">
                  Are you sure you want to delete this student{" "}
                  {` ${currestSubjectNameForDelete} `} ?
                </div>
                <div className=" flex justify-end p-3">
                  <button
                    type="button"
                    className="btn btn-danger px-3 mb-2"
                    onClick={handleSubmitDelete}
                  >
                    Delete
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
                    Confirm Activate or Deactivate
                  </h5>
                  <RxCross1
                    className="float-end relative mt-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                    type="button"
                    // className="btn-close text-red-600"
                    onClick={handleCloseModal}
                  />
                  {console.log(
                    "the currecnt section inside delete of the managesubjhect",
                    currentSection
                  )}
                </div>
                <div
                  className=" relative  mb-3 h-1 w-[97%] mx-auto bg-red-700"
                  style={{
                    backgroundColor: "#C03078",
                  }}
                ></div>
                <div className="modal-body">
                  Are you sure you want to Activate or Deactivate this student{" "}
                  {` ${currestSubjectNameForDelete} `} ?
                </div>
                <div className=" flex justify-end p-3">
                  <button
                    type="button"
                    className="btn btn-primary px-3 mb-2"
                    onClick={handleActivateOrNot}
                  >
                    Active
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
