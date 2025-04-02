// // import React, { useEffect, useState } from "react";
// // import axios from "axios";
// // import { RxCross1 } from "react-icons/rx";
// // import { useNavigate } from "react-router-dom";
// // import { useLocation } from "react-router-dom";
// // import { ToastContainer, toast } from "react-toastify";
// // import "react-toastify/dist/ReactToastify.css";

// // const StudentSearchUsingGRN = () => {
// //   // const API_URL = import.meta.env.VITE_API_URL;
// //   const navigate = useNavigate();
// //   const location = useLocation();
// //   const student = location.state?.studentData || {};

// //   console.log("student", student);

// //   const message = location.state?.message;
// //   console.log(message);

// //   useEffect(() => {
// //     if (location.state?.message) {
// //       toast.success(location.state.message);
// //     }
// //   }, [location.state]);

// //   return (
// //     <>
// //       <ToastContainer />
// //       <div className="W-[95%] mx-auto p-4">
// //         <div className="card p-3 rounded-md">
// //           <div className="card-header mb-4 flex justify-between items-center">
// //             <h5 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
// //               Student Personal Profile
// //             </h5>
// //             <RxCross1
// //               className="float-end relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
// //               onClick={() => navigate("/dashboard")}
// //             />
// //           </div>
// //           <div
// //             className="relative w-full -top-6 h-1 mx-auto bg-red-700"
// //             style={{ backgroundColor: "#C03078" }}
// //           ></div>

// //           <div className="bg-white w-full  mx-2 rounded-md ">
// //             <div className="w-full mx-auto">
// //               <div className="">
// //                 {" "}
// //                 {/* mb-4 */}
// //                 <div className="w-full flex gap-4">
// //                   {/* Profile Image Card */}
// //                   <div className="card p-3 w-full md:w-[20%] shadow-md flex flex-col items-center h-auto min-h-full">
// //                     {/* Profile Image */}
// //                     <img
// //                       src=""
// //                       alt="Profile"
// //                       className="w-24 h-24 object-cover rounded-full border-2 border-gray-300 shadow-md"
// //                     />
// //                     {/* Student Name */}
// //                     <p className="mt-3 text-center text-gray-700 font-semibold">
// //                       {student.first_name}
// //                     </p>
// //                   </div>

// //                   {/* Student  and Prent Information Card */}
// //                   <div className="card p-3 w-full md:w-[80%] shadow-md flex flex-col h-auto min-h-full">
// //                     {/* Student Information */}
// //                     <div className="flex flex-col gap-y-3 p-2 flex-grow">
// //                       <h3 className="text-gray-700 mt-1 mb-0 text-[1em] lg:text-xl text-nowrap">
// //                         Student Information
// //                       </h3>
// //                       <div
// //                         className="relative w-full h-0.5 mx-auto bg-red-700"
// //                         style={{ backgroundColor: "#C03078" }}
// //                       ></div>

// //                       <div className=" text-sm grid grid-cols-3 gap-x-4 mt-3">
// //                         {[
// //                           {
// //                             label: "Student Name",
// //                             value: student.student_name || " ",
// //                           },
// //                           {
// //                             label: "Date of Birth",
// //                             value: student.dob || " ",
// //                           },
// //                           {
// //                             label: "Admission Date",
// //                             value: student.admission_date || " ",
// //                           },
// //                           { label: "GR No.", value: student.reg_no || " " },
// //                           {
// //                             label: "Student ID",
// //                             value: student.student_id || " ",
// //                           },
// //                           {
// //                             label: "Udise Pen No.",
// //                             value: student.udise_pen_no || " ",
// //                           },
// //                           {
// //                             label: "Aadhaar no.",
// //                             value: student.stu_aadhaar_no || " ",
// //                           },
// //                           {
// //                             label: "Class",
// //                             value: student.get_class?.name || " ",
// //                           },
// //                           {
// //                             label: "Division",
// //                             value: student.get_division?.name || " ",
// //                           },
// //                           {
// //                             label: "Roll No.",
// //                             value: student.roll_no || " ",
// //                           },
// //                           { label: "House", value: student.house || " " },
// //                           {
// //                             label: "Admitted In Class",
// //                             value: student.admission_class || " ",
// //                           },
// //                           { label: "Gender", value: student.gender || " " },
// //                           {
// //                             label: "Blood Group",
// //                             value: student.blood_group || " ",
// //                           },
// //                           {
// //                             label: "Permanant Address",
// //                             value: student.permant_add || " ",
// //                           },
// //                           { label: "City", value: student.city || " " },
// //                           { label: "State", value: student.state || " " },
// //                           { label: "Pincode", value: student.pincode || " " },
// //                           {
// //                             label: "Religion",
// //                             value: student.religion || " ",
// //                           },
// //                           { label: "Caste", value: student.caste || " " },
// //                           {
// //                             label: "Category",
// //                             value: student.category || " ",
// //                           },
// //                           {
// //                             label: "Nationality",
// //                             value: student.nationality || " ",
// //                           },
// //                           {
// //                             label: "Birth Place",
// //                             value: student.birth_place || " ",
// //                           },
// //                           {
// //                             label: "Mother Tongue",
// //                             value: student.mother_tongue || " ",
// //                           },
// //                           {
// //                             label: "Emergency Name",
// //                             value: student.emergency_name || " ",
// //                           },
// //                           {
// //                             label: "Emergency Contact",
// //                             value: student.emergency_contact || " ",
// //                           },
// //                           {
// //                             label: "Emergency Address",
// //                             value: student.emergency_add || " ",
// //                           },
// //                           {
// //                             label: "Transport Mode",
// //                             value: student.transport_mode || " ",
// //                           },
// //                           {
// //                             label: "Allergies",
// //                             value: student.allergies || " ",
// //                           },
// //                           { label: "Weight", value: student.weight || " " },
// //                           { label: "Height", value: student.height || " " },
// //                           {
// //                             label: "Has spectacles",
// //                             value: student.has_spec || " ",
// //                           },
// //                         ].map((item, index) => (
// //                           <div key={index} className="flex">
// //                             <p className="w-40 font-bold">{item.label}:</p>
// //                             <p className="flex-1">{item.value}</p>
// //                           </div>
// //                         ))}
// //                       </div>
// //                     </div>

// //                     {/* Parent Information */}
// //                     <div className="flex flex-col gap-y-3 p-2 flex-grow">
// //                       <h3 className="text-gray-700 mt-1 mb-0 text-[1em] lg:text-xl text-nowrap">
// //                         Parent Information
// //                       </h3>
// //                       <div
// //                         className="relative w-full h-0.5 mx-auto bg-red-700"
// //                         style={{ backgroundColor: "#C03078" }}
// //                       ></div>

// //                       <div className="text-sm grid grid-cols-3 gap-x-4 mt-3">
// //                         {[
// //                           {
// //                             label: "Father Name",
// //                             value: student.parents?.father_name || " ",
// //                           },
// //                           {
// //                             label: "Occupation",
// //                             value: student.parents?.father_occupation || " ",
// //                           },
// //                           {
// //                             label: "Office Address",
// //                             value: student.parents?.f_office_add || " ",
// //                           },
// //                           {
// //                             label: "Telephone",
// //                             value: student.parents?.f_office_tel || " ",
// //                           },
// //                           {
// //                             label: "Mobile Number",
// //                             value: student.parents?.f_mobile || " ",
// //                           },
// //                           {
// //                             label: "Email Id",
// //                             value: student.parents?.f_email || " ",
// //                           },
// //                           {
// //                             label: "Aadhaar no.",
// //                             value: student.parents?.f_aadhaar_no || " ",
// //                           },
// //                           {
// //                             label: "Date of Birth",
// //                             value: student.parents?.f_dob || " ",
// //                           },
// //                           {
// //                             label: "Blood Group",
// //                             value: student.parents?.f_blood_group || " ",
// //                           },
// //                           {
// //                             label: "User Id",
// //                             value: student.parents?.user?.user_id || " ",
// //                           },
// //                           {
// //                             label: "Mother Name",
// //                             value: student.parents?.mother_name || " ",
// //                           },
// //                           {
// //                             label: "Occupation",
// //                             value: student.parents?.mother_occupation || " ",
// //                           },
// //                           {
// //                             label: "Office Address",
// //                             value: student.parents?.m_office_add || " ",
// //                           },
// //                           {
// //                             label: "Telephone",
// //                             value: student.parents?.m_office_tel || " ",
// //                           },
// //                           {
// //                             label: "Mobile Number",
// //                             value: student.parents?.m_mobile || " ",
// //                           },
// //                           {
// //                             label: "Email Id",
// //                             value: student.parents?.m_email || " ",
// //                           },
// //                           {
// //                             label: "Aadhaar no.",
// //                             value: student.parents?.m_aadhaar_no || " ",
// //                           },
// //                           {
// //                             label: "Date of Birth",
// //                             value: student.parents?.m_dob || " ",
// //                           },
// //                           {
// //                             label: "Blood Group",
// //                             value: student.parents?.m_blood_group || " ",
// //                           },
// //                         ].map((item, index) => (
// //                           <div key={index} className="flex">
// //                             <p className="w-40 font-bold">{item.label}:</p>
// //                             <p className="flex-1">{item.value}</p>
// //                           </div>
// //                         ))}
// //                       </div>
// //                     </div>
// //                   </div>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </>
// //   );
// // };

// // export default StudentSearchUsingGRN;
// // import { useState } from "react";
// // import CommonTable from "./CommonTable";

// // const data = {
// //   tabs: [
// //     { id: "1-A", label: "1-A", periods: 4 },
// //     { id: "1-B", label: "1-B", periods: 5 },
// //     { id: "12-A", label: "12-A", periods: 6 },
// //     { id: "12-B", label: "12-B", periods: 4 },
// //   ],
// //   subjects: {
// //     "1-A": ["Math", "Science", "English", "History"],
// //     "1-B": ["Biology", "Chemistry", "Physics", "Geography"],
// //     "12-A": [
// //       "Economics",
// //       "Business Studies",
// //       "Accountancy",
// //       "Political Science",
// //     ],
// //     "12-B": [
// //       "Computer Science",
// //       "Art",
// //       "Physical Education",
// //       "Environmental Science",
// //     ],
// //   },
// // };

// // export default function TimetablePlanner() {
// //   const [activeTab, setActiveTab] = useState(data.tabs[0].id);

// //   return (
// //     <>
// //       {" "}
// //       <div className="flex">
// //         <div className="w-1/4 border-r">
// //           {data.tabs.map((tab) => (
// //             <button
// //               key={tab.id}
// //               className={`block p-2 w-full ${
// //                 activeTab === tab.id ? "bg-blue-500 text-white" : "bg-white"
// //               }`}
// //               onClick={() => setActiveTab(tab.id)}
// //             >
// //               {tab.label}
// //             </button>
// //           ))}
// //         </div>

// //         <div className="w-3/4 p-4">
// //           <h2 className="text-xl font-bold mb-4">Class - {activeTab}</h2>
// //           <CommonTable
// //             periods={data.tabs.find((tab) => tab.id === activeTab).periods}
// //             subjects={data.subjects[activeTab]}
// //           />
// //         </div>
// //       </div>
// //     </>
// //   );
// // }

// import { useState, useEffect, useMemo, useRef } from "react";
// import axios from "axios";
// import Select from "react-select";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { useNavigate } from "react-router-dom";
// import { RxCross1 } from "react-icons/rx";
// import Loader from "../common/LoaderFinal/LoaderStyle";
// import { FiPrinter } from "react-icons/fi";
// import { FaFileExcel, FaRegCalendarAlt } from "react-icons/fa";
// import * as XLSX from "xlsx";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import dayjs from "dayjs";
// import { format, startOfWeek, endOfWeek } from "date-fns";
// import CommonTable from "./CommonTable";

// const TimetablePlanner = () => {
//   const API_URL = import.meta.env.VITE_API_URL;
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [toDate, setToDate] = useState(null);
//   //   const [fromDate, setFromDate] = useState(null);
//   const [currentPage, setCurrentPage] = useState(0);
//   const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
//   const [selectedStudentId, setSelectedStudentId] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [loadingForSearch, setLoadingForSearch] = useState(false);

//   const navigate = useNavigate();
//   const [loadingExams, setLoadingExams] = useState(false);
//   const [studentError, setStudentError] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");

//   const [timetable, setTimetable] = useState([]);

//   const pageSize = 10;
//   const [tabs, setTabs] = useState([]);
//   const [activeTab, setActiveTab] = useState(null);

//   const data = {
//     tab: [
//       { id: "1-A", label: "1-A", periods: 4 },
//       { id: "1-B", label: "1-B", periods: 5 },
//       { id: "12-A", label: "12-A", periods: 6 },
//       { id: "12-B", label: "12-B", periods: 4 },
//     ],
//     subjects: {
//       "1-A": ["Math", "Science", "English", "History"],
//       "1-B": ["Biology", "Chemistry", "Physics", "Geography"],
//       "12-A": [
//         "Economics",
//         "Business Studies",
//         "Accountancy",
//         "Political Science",
//       ],
//       "12-B": [
//         "Computer Science",
//         "Art",
//         "Physical Education",
//         "Environmental Science",
//       ],
//     },
//   };

//   const handleSearch = async () => {
//     setLoadingForSearch(true);

//     if (!selectedStudentId) {
//       toast.error("Please select Staff Name.");
//       setLoadingForSearch(false);
//       return;
//     }

//     try {
//       const token = localStorage.getItem("authToken");
//       const params = { teacher_id: selectedStudentId };
//       const response = await axios.get(
//         `${API_URL}/api/get_teacherclasstimetable`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//           params,
//         }
//       );

//       if (!response?.data?.data || response.data.data.length === 0) {
//         toast.error("Substitution Weekly Hours Report not found.");
//         setTabs([]);
//         return;
//       }

//       const formattedTabs = response.data.data.map((item) => ({
//         id: `${item.classname}-${item.sectionname}`,
//         classname: item.classname,
//         sectionname: item.sectionname,
//         teachername: item.teachername,
//       }));
//       setTimetable(formattedTabs);
//       setTabs(formattedTabs);
//       setActiveTab(formattedTabs[0]?.id || null);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//       toast.error("Error fetching data. Please try again.");
//     } finally {
//       setLoadingForSearch(false);
//     }
//   };
//   useEffect(() => {
//     fetchExams();
//   }, []);

//   const fetchExams = async () => {
//     try {
//       setLoadingExams(true);
//       const token = localStorage.getItem("authToken");

//       const response = await axios.get(`${API_URL}/api/staff_list`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       console.log("Class", response);
//       setStudentNameWithClassId(response?.data || []);
//     } catch (error) {
//       toast.error("Error fetching Classes");
//       console.error("Error fetching Classes:", error);
//     } finally {
//       setLoadingExams(false);
//     }
//   };

//   const handleStudentSelect = (selectedOption) => {
//     setStudentError(""); // Reset error if student is select.
//     setSelectedStudent(selectedOption);
//     setSelectedStudentId(selectedOption?.value);
//   };

//   const studentOptions = useMemo(
//     () =>
//       studentNameWithClassId.map((cls) => ({
//         value: cls?.teacher_id,
//         label: `${cls.name}`,
//       })),
//     [studentNameWithClassId]
//   );

//   // Handle search and fetch parent information

//   //   const handleSearch = async () => {
//   //     setLoadingForSearch(true);
//   //     setTimetable([]);

//   //     if (!selectedStudentId) {
//   //       toast.error("Please select Staff Name.");
//   //       setLoadingForSearch(false);
//   //       return;
//   //     }

//   //     try {
//   //       const token = localStorage.getItem("authToken");
//   //       const params = { teacher_id: selectedStudentId };
//   //       const response = await axios.get(
//   //         `${API_URL}/api/get_teacherclasstimetable`,
//   //         {
//   //           headers: { Authorization: `Bearer ${token}` },
//   //           params,
//   //         }
//   //       );

//   //       if (!response?.data?.data || response.data.data.length === 0) {
//   //         toast.error("Substitution Weekly Hours Report not found.");
//   //         setTimetable([]);
//   //         return;
//   //       }

//   //       const formattedTabs = response.data.data.map((item) => ({
//   //         id: `${item.classname}-${item.sectionname}`,
//   //         classname: item.classname,
//   //         sectionname: item.sectionname,
//   //         teachername: item.teachername,
//   //       }));

//   //       // Sort tabs by class in ascending order
//   //       const sortedTabs = formattedTabs.sort(
//   //         (a, b) => parseInt(a.classname, 10) - parseInt(b.classname, 10)
//   //       );

//   //       setTabs(sortedTabs);
//   //       setTimetable(sortedTabs);
//   //       setActiveTab(sortedTabs[0]?.id || null); // Set first tab as default if available
//   //     } catch (error) {
//   //       console.error("Error fetching Substitution Weekly Hours Report:", error);
//   //       toast.error("Error fetching data. Please try again.");
//   //     } finally {
//   //       setIsSubmitting(false);
//   //       setLoadingForSearch(false);
//   //     }
//   //   };

//   console.log("row", timetable, "setTabs", tabs);
//   const filteredTabs = tabs.filter((tab) =>
//     tab.id.toLowerCase().includes(searchTerm.toLowerCase())
//   );
//   const filteredSections = timetable.filter((student) => {
//     const searchLower = searchTerm.toLowerCase();

//     // Extract relevant fields and convert them to lowercase for case-insensitive search
//     const teacherName = student?.teachername?.toLowerCase() || "";
//     const week = student?.week?.toLowerCase() || "";
//     const totalHours =
//       student?.time_difference_decimal?.toString().toLowerCase() || "";

//     // Check if the search term is present in any of the specified fields
//     return (
//       teacherName.includes(searchLower) ||
//       week.includes(searchLower) ||
//       totalHours.includes(searchLower)
//     );
//   });

//   const displayedSections = filteredSections.slice(currentPage * pageSize);

//   return (
//     <>
//       <div className="w-full md:w-[95%] mx-auto p-4 ">
//         <ToastContainer />
//         <div className="card p-4 rounded-md ">
//           <div className=" card-header mb-4 flex justify-between items-center ">
//             <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
//               Time Table Planner
//             </h5>
//             <RxCross1
//               className=" relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
//               onClick={() => {
//                 navigate("/dashboard");
//               }}
//             />
//           </div>
//           <div
//             className=" relative w-full   -top-6 h-1  mx-auto bg-red-700"
//             style={{
//               backgroundColor: "#C03078",
//             }}
//           ></div>

//           <>
//             <div className=" w-full md:w-[75%]   flex justify-center flex-col md:flex-row gap-x-1     ml-0    p-2">
//               <div className="w-full md:w-[99%] flex md:flex-row justify-between items-center mt-0 md:mt-4">
//                 <div className="w-full md:w-[90%] gap-x-0 md:gap-x-12 flex flex-col gap-y-2 md:gap-y-0 md:flex-row">
//                   {/* Class Dropdown */}
//                   <div className="w-full  md:w-[50%] gap-x-2 justify-around my-1 md:my-4 flex md:flex-row">
//                     <label
//                       className="w-full md:w-[25%] text-md pl-0 md:pl-5 mt-1.5"
//                       htmlFor="studentSelect"
//                     >
//                       Staff <span className="text-red-500">*</span>
//                     </label>
//                     <div className="w-full md:w-[65%]">
//                       <Select
//                         menuPortalTarget={document.body}
//                         menuPosition="fixed"
//                         id="studentSelect"
//                         value={selectedStudent}
//                         onChange={handleStudentSelect}
//                         options={studentOptions}
//                         placeholder={loadingExams ? "Loading..." : "Select"}
//                         isSearchable
//                         isClearable
//                         className="text-sm"
//                         isDisabled={loadingExams}
//                         styles={{
//                           control: (provided) => ({
//                             ...provided,
//                             fontSize: ".9em", // Adjust font size for selected value
//                             minHeight: "30px", // Reduce height
//                           }),
//                           menu: (provided) => ({
//                             ...provided,
//                             fontSize: "1em", // Adjust font size for dropdown options
//                           }),
//                           option: (provided) => ({
//                             ...provided,
//                             fontSize: ".9em", // Adjust font size for each option
//                           }),
//                         }}
//                       />
//                       {studentError && (
//                         <div className="h-8 relative ml-1 text-danger text-xs">
//                           {studentError}
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   {/* Browse Button */}
//                   <div className="mt-1">
//                     <button
//                       type="search"
//                       onClick={handleSearch}
//                       style={{ backgroundColor: "#2196F3" }}
//                       className={`btn h-10 w-18 md:w-auto btn-primary text-white font-bold py-1 border-1 border-blue-500 px-4 rounded ${
//                         loadingForSearch ? "opacity-50 cursor-not-allowed" : ""
//                       }`}
//                       disabled={loadingForSearch}
//                     >
//                       {loadingForSearch ? (
//                         <span className="flex items-center">
//                           <svg
//                             className="animate-spin h-4 w-4 mr-2 text-white"
//                             xmlns="http://www.w3.org/2000/svg"
//                             fill="none"
//                             viewBox="0 0 24 24"
//                           >
//                             <circle
//                               className="opacity-25"
//                               cx="12"
//                               cy="12"
//                               r="10"
//                               stroke="currentColor"
//                               strokeWidth="4"
//                             ></circle>
//                             <path
//                               className="opacity-75"
//                               fill="currentColor"
//                               d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
//                             ></path>
//                           </svg>
//                           Browsing...
//                         </span>
//                       ) : (
//                         "Browse"
//                       )}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {timetable.length > 0 && (
//               <>
//                 <div className="card-body bg-gray-100 border-none w-full flex">
//                   {/* Left Sidebar - Tabs */}
//                   <div className="w-[18%] border-r h-[400px] overflow-y-auto p-3 bg-white rounded-xl shadow-lg">
//                     <h3 className="text-lg font-semibold text-gray-700 mb-3 text-center">
//                       Select Class
//                     </h3>
//                     {tabs.map((tab) => (
//                       <button
//                         key={tab.id}
//                         className={`block w-full text-left p-3 my-2 text-lg font-medium rounded-lg transition-all duration-300
//               ${
//                 activeTab === tab.id
//                   ? "bg-indigo-600 text-white shadow-md transform scale-105"
//                   : "bg-gray-100 text-gray-700 hover:bg-indigo-200 hover:shadow-md"
//               }`}
//                         onClick={() => setActiveTab(tab.id)}
//                       >
//                         {tab.id}
//                       </button>
//                     ))}
//                   </div>

//                   {/* Right Table Section */}
//                   <div className="w-[85%] overflow-hidden bg-white rounded-lg shadow-md p-4">
//                     <h2 className="text-xl text-blue-500 font-bold mb-2 text-center">
//                       Class - {activeTab}
//                     </h2>

//                     {/* Scrollable Table Container */}
//                     <div className="overflow-y-auto h-[400px] border rounded-md p-2">
//                       <CommonTable
//                         periods={
//                           data.tab.find((tab) => tab.id === activeTab)
//                             ?.periods || []
//                         }
//                         subjects={data.subjects[activeTab] || []}
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </>
//             )}
//           </>
//         </div>
//       </div>
//     </>
//   );
// };

// export default TimetablePlanner;

// import { useState } from "react";
// import CommonTable from "./CommonTable";

// const data = {
//   tabs: [
//     { id: "1-A", label: "1-A", periods: 4 },
//     { id: "1-B", label: "1-B", periods: 5 },
//     { id: "12-A", label: "12-A", periods: 6 },
//     { id: "12-B", label: "12-B", periods: 4 },
//   ],
//   subjects: {
//     "1-A": ["Math", "Science", "English", "History"],
//     "1-B": ["Biology", "Chemistry", "Physics", "Geography"],
//     "12-A": [
//       "Economics",
//       "Business Studies",
//       "Accountancy",
//       "Political Science",
//     ],
//     "12-B": [
//       "Computer Science",
//       "Art",
//       "Physical Education",
//       "Environmental Science",
//     ],
//   },
// };

// export default function TimetablePlanner() {
//   const [activeTab, setActiveTab] = useState(data.tabs[0].id);

//   return (
//     <>
//       {" "}
//       <div className="flex">
//         <div className="w-1/4 border-r">
//           {data.tabs.map((tab) => (
//             <button
//               key={tab.id}
//               className={`block p-2 w-full ${
//                 activeTab === tab.id ? "bg-blue-500 text-white" : "bg-white"
//               }`}
//               onClick={() => setActiveTab(tab.id)}
//             >
//               {tab.label}
//             </button>
//           ))}
//         </div>

//         <div className="w-3/4 p-4">
//           <h2 className="text-xl font-bold mb-4">Class - {activeTab}</h2>
//           <CommonTable
//             periods={data.tabs.find((tab) => tab.id === activeTab).periods}
//             subjects={data.subjects[activeTab]}
//           />
//         </div>
//       </div>
//     </>
//   );
// }

import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
import Loader from "../common/LoaderFinal/LoaderStyle";
import { FiPrinter } from "react-icons/fi";
import { FaFileExcel, FaRegCalendarAlt } from "react-icons/fa";
import * as XLSX from "xlsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";
import { format, startOfWeek, endOfWeek } from "date-fns";
import CommonTable from "./CommonTable";

const TimetablePlanner = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [toDate, setToDate] = useState(null);
  //   const [fromDate, setFromDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingForSearch, setLoadingForSearch] = useState(false);

  const navigate = useNavigate();
  const [loadingExams, setLoadingExams] = useState(false);
  const [studentError, setStudentError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [timetable, setTimetable] = useState([]);

  const pageSize = 10;
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  //   const [timetableData, setTimetableData] = useState([]);
  const [timetableData, setTimetableData] = useState({
    periods: [],
    subjects: [],
  }); // To hold transformed data
  const [loadingForTabSwitch, setLoadingForTabSwitch] = useState(false); // Loading state

  const [storeWholeData, setStoreWholeData] = useState([]);
  const [weekRange, setWeekRange] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const datePickerRef = useRef(null);
  const [tabs, setTabs] = useState([]);

  //   const data = {
  //     tab: [
  //       { id: "1-A", label: "1-A", periods: 4 },
  //       { id: "1-B", label: "1-B", periods: 5 },
  //       { id: "12-A", label: "12-A", periods: 6 },
  //       { id: "12-B", label: "12-B", periods: 4 },
  //     ],
  //     subjects: {
  //       "1-A": ["Math", "Science", "English", "History"],
  //       "1-B": ["Biology", "Chemistry", "Physics", "Geography"],
  //       "12-A": [
  //         "Economics",
  //         "Business Studies",
  //         "Accountancy",
  //         "Political Science",
  //       ],
  //       "12-B": [
  //         "Computer Science",
  //         "Art",
  //         "Physical Education",
  //         "Environmental Science",
  //       ],
  //     },
  //   };
  // Original formate
  //   const data = {
  //     "1-A": {
  //       Monday: [
  //         {
  //           time_in: "08:30",
  //           period_no: 1,
  //           time_out: "09:10",
  //           subject: "Math",
  //           teacher: [{ t_name: "John Doe" }],
  //         },
  //         {
  //           time_in: "09:10",
  //           period_no: 2,
  //           time_out: "09:45",
  //           subject: "Science",
  //           teacher: [{ t_name: "Jane Smith" }],
  //         },
  //         // Add other periods for Monday here...
  //       ],
  //       Tuesday: [
  //         {
  //           time_in: "08:30",
  //           period_no: 1,
  //           time_out: "09:10",
  //           subject: "History",
  //           teacher: [{ t_name: "John Doe" }],
  //         },
  //         // Add other periods for Tuesday here...
  //       ],
  //       // Add Wednesday, Thursday, Friday, Saturday for 1-A
  //     },
  //     "1-B": {
  //       Monday: [
  //         {
  //           time_in: "08:30",
  //           period_no: 1,
  //           time_out: "09:10",
  //           subject: "Biology",
  //           teacher: [{ t_name: "Alice Cooper" }],
  //         },
  //         // Add other periods for Monday here...
  //       ],
  //       // Add Tuesday, Wednesday, Thursday, Friday, Saturday for 1-B
  //     },
  //     // Add other tabs for 12-A, 12-B with similar structure
  //   };
  const data = {
    tab: [
      { id: "1-A", label: "1-A", periods: 6 },
      { id: "1-B", label: "1-B", periods: 6 },
      { id: "12-A", label: "12-A", periods: 6 },
      { id: "12-B", label: "12-B", periods: 6 },
    ],
    "1-A": {
      Monday: [
        {
          time_in: "08:30",
          period_no: 1,
          time_out: "09:10",
          subject: "Math",
          teacher: [{ t_name: "John Doe" }],
        },
        {
          time_in: "09:10",
          period_no: 2,
          time_out: "09:45",
          subject: "Science",
          teacher: [{ t_name: "Jane Smith" }],
        },
      ],
      Tuesday: [
        {
          time_in: "08:30",
          period_no: 1,
          time_out: "09:10",
          subject: "History",
          teacher: [{ t_name: "John Doe" }],
        },
      ],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
    },
    "1-B": {
      Monday: [
        {
          time_in: "08:30",
          period_no: 1,
          time_out: "09:10",
          subject: "Biology",
          teacher: [{ t_name: "Alice Cooper" }],
        },
      ],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
    },
    "12-A": {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
    },
    "12-B": {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
    },
  };

  const [activeTab, setActiveTab] = useState(data.tab[0].id);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoadingExams(true);
      const token = localStorage.getItem("authToken");

      const response = await axios.get(`${API_URL}/api/staff_list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Class", response);
      setStudentNameWithClassId(response?.data || []);
    } catch (error) {
      toast.error("Error fetching Classes");
      console.error("Error fetching Classes:", error);
    } finally {
      setLoadingExams(false);
    }
  };

  const handleStudentSelect = (selectedOption) => {
    setStudentError(""); // Reset error if student is select.
    setSelectedStudent(selectedOption);
    setSelectedStudentId(selectedOption?.value);
  };

  const studentOptions = useMemo(
    () =>
      studentNameWithClassId.map((cls) => ({
        value: cls?.teacher_id,
        label: `${cls.name}`,
      })),
    [studentNameWithClassId]
  );

  // Handle search and fetch parent information

  const handleSearch = async () => {
    setLoadingForSearch(false);

    if (!selectedStudentId) {
      setStudentError("Please select Staff Name.");
      setLoadingForSearch(false);
      return;
    }

    setSearchTerm("");

    try {
      const formattedWeek = weekRange.replace(/\s/g, "").replace(/%20/g, ""); // Ensure no extra spaces or encoded symbols
      console.log("Formatted Week is: --->", formattedWeek);

      setLoadingForSearch(true); // Start loading
      setTimetable([]);

      const token = localStorage.getItem("authToken");

      const params = {
        teacher_id: selectedStudentId,
      };

      const response = await axios.get(
        `${API_URL}/api/get_teacherclasstimetable`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      if (!response?.data?.data || response?.data?.data?.length === 0) {
        toast.error("Substitution Weekly Hours Report not found.");
        setTimetable([]);
      } else {
        setTimetable(response?.data?.data);
        setPageCount(Math.ceil(response?.data?.data?.length / pageSize));
      }
      const formattedTabs = response.data.data.map((item) => ({
        id: `${item.classname}-${item.sectionname}`,
        classname: item.classname,
        sectionname: item.sectionname,
        teachername: item.teachername,
        class_id: item.class_id, // Store class_id
        section_id: item.section_id, // Store section_id
      }));

      // Now you have class_id and section_id stored for each tab

      // Sort tabs by class in ascending order
      const sortedTabs = formattedTabs.sort((a, b) => {
        const classA = parseInt(a.classname, 10);
        const classB = parseInt(b.classname, 10);
        return classA - classB;
      });

      setTabs(sortedTabs);
      //   setActiveTab(sortedTabs[0]?.id || ""); // Set default active tab
    } catch (error) {
      console.error("Error fetching Substitution Weekly Hours Report:", error);
      toast.error(
        "Error fetching Substitution Weekly Hours Report. Please try again."
      );
    } finally {
      setIsSubmitting(false);
      setLoadingForSearch(false);
    }
  };

  console.log("row", timetable);
  const filteredTabs = tabs.filter((tab) =>
    tab.id.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredSections = timetable.filter((student) => {
    const searchLower = searchTerm.toLowerCase();

    // Extract relevant fields and convert them to lowercase for case-insensitive search
    const teacherName = student?.teachername?.toLowerCase() || "";
    const week = student?.week?.toLowerCase() || "";
    const totalHours =
      student?.time_difference_decimal?.toString().toLowerCase() || "";

    // Check if the search term is present in any of the specified fields
    return (
      teacherName.includes(searchLower) ||
      week.includes(searchLower) ||
      totalHours.includes(searchLower)
    );
  });

  const displayedSections = filteredSections.slice(currentPage * pageSize);
  // Fetch the timetable data when the active tab changes
  const fetchTimetableData = async (class_id, section_id) => {
    setLoadingForTabSwitch(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Create the class_section_id based on class_id and section_id
      //  const classSectionId = `${class_id}-${section_id}`;

      const response = await axios.get(
        `${API_URL}/api/get_timetablebyclasssection/${class_id}/${section_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        }
      );

      if (response.data && response.data.data) {
        const transformedData = transformTimetableData(response.data.data); // Transform data
        setTimetableData(transformedData); // Store the transformed data (periods and subjects)

        // setTimetableData(response.data.data); // Store the response data
      } else {
        setTimetableData([]); // In case no data is returned
      }
    } catch (error) {
      console.error("Error fetching timetable data:", error);
      setTimetableData([]); // Handle error
    } finally {
      setLoadingForTabSwitch(false);
    }
  };

  // Callback function to handle the data returned from the child component
  const handleTableData = (data) => {
    // Store the data from the child component in the parent state
    console.log("Data from child component:", data);
    setStoreWholeData(data); // Store the data in state
    console.log("Store Data is ", storeWholeData);
  };

  // Call the fetchTimetableData function when the active tab changes
  //   useEffect(() => {
  //     fetchTimetableData(activeTab);
  //   }, [activeTab]);

  // Example of how to transform the timetable data for table display
  // Transform timetable data for table display
  const transformTimetableData = (data) => {
    const periods = [];
    const subjects = [];

    // Loop through each day of the week
    Object.keys(data).forEach((day) => {
      const dayData = data[day];

      dayData.forEach((period) => {
        periods.push({
          period_no: period.period_no,
          time_in: period.time_in,
          time_out: period.time_out,
          subject: period.subject,
        });

        // For each subject, we will need the list of teachers (if available)
        subjects.push({
          day,
          period_no: period.period_no,
          subject: period.subject,
          teachers: period.teacher.map((t) => t.t_name).join(", "), // Join teachers if multiple
        });
      });
    });

    return { periods, subjects };
  };

  useEffect(() => {
    // Find the active tab based on `activeTab`
    const activeTabData = tabs.find((tab) => tab.id === activeTab);

    // Call fetchTimetableData with class_id and section_id
    if (activeTabData) {
      setLoadingForTabSwitch(true);
      fetchTimetableData(activeTabData.class_id, activeTabData.section_id);
    }
  }, [activeTab]); // Fetch data whenever activeTab changes

  return (
    <>
      <div className="w-full md:w-[95%] mx-auto p-4 ">
        <ToastContainer />
        <div className="card p-4 rounded-md ">
          <div className=" card-header mb-4 flex justify-between items-center ">
            <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
              Time Table Planner
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
            <div className=" w-full md:w-[75%]   flex justify-center flex-col md:flex-row gap-x-1     ml-0    p-2">
              <div className="w-full md:w-[99%] flex md:flex-row justify-between items-center mt-0 md:mt-4">
                <div className="w-full md:w-[90%] gap-x-0 md:gap-x-12 flex flex-col gap-y-2 md:gap-y-0 md:flex-row">
                  {/* Class Dropdown */}
                  <div className="w-full  md:w-[50%] gap-x-2 justify-around my-1 md:my-4 flex md:flex-row">
                    <label
                      className="w-full md:w-[25%] text-md pl-0 md:pl-5 mt-1.5"
                      htmlFor="studentSelect"
                    >
                      Staff <span className="text-red-500">*</span>
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
                            fontSize: ".9em", // Adjust font size for selected value
                            minHeight: "30px", // Reduce height
                          }),
                          menu: (provided) => ({
                            ...provided,
                            fontSize: "1em", // Adjust font size for dropdown options
                          }),
                          option: (provided) => ({
                            ...provided,
                            fontSize: ".9em", // Adjust font size for each option
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

                  {/* Browse Button */}
                  <div className="mt-1">
                    <button
                      type="search"
                      onClick={handleSearch}
                      style={{ backgroundColor: "#2196F3" }}
                      className={`btn h-10 w-18 md:w-auto btn-primary text-white font-bold py-1 border-1 border-blue-500 px-4 rounded ${
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

            {timetable.length > 0 && (
              <>
                <div className="card mx-auto lg:w-full shadow-lg mt-3">
                  <div className="card-body bg-gray-100 border-none w-full border-3 border-black flex">
                    {/* Left Sidebar - Tabs */}
                    <div
                      className="w-[18%] border-r h-[400px] overflow-y-auto p-3 bg-white rounded-xl shadow-lg"
                      style={{
                        scrollbarWidth: "thin",
                        scrollbarColor: "#6366F1 #E5E7EB", // Custom scrollbar colors
                      }}
                    >
                      <h3 className="text-lg font-semibold text-gray-700 mb-3 text-center">
                        Select Class
                      </h3>

                      {tabs.map((tab) => (
                        <button
                          key={tab.id}
                          className={`block w-full text-left p-3 my-2 text-lg font-medium rounded-lg transition-all duration-300 
        ${
          activeTab === tab.id
            ? "bg-indigo-600 text-white shadow-md transform scale-105"
            : "bg-gray-100 text-gray-700 hover:bg-indigo-200 hover:shadow-md"
        }`}
                          onClick={() => {
                            setActiveTab(tab.id); // Set active tab
                            // fetchTimetableData(tab.class_id, tab.section_id); // Pass class_id and section_id to fetch data
                          }}
                        >
                          {tab.id}
                        </button>
                      ))}
                    </div>
                    {/* Right Table Section */}
                    <div className="w-[85%] overflow-hidden bg-white rounded-lg shadow-md">
                      {/* Header */}
                      <h2 className="text-xl text-blue-500 font-bold mb-2 text-center">
                        Class - {activeTab}
                      </h2>

                      {/* Scrollable Table Container */}
                      <div
                        className="overflow-y-auto h-[400px] border rounded-md p-2"
                        style={{
                          scrollbarWidth: "thin", // For Firefox
                          scrollbarColor: "#4F46E5 #E5E7EB", // Track and thumb color in Firefox
                        }}
                      >
                        <CommonTable
                          periods={timetableData?.periods || []} // Pass periods to CommonTable
                          subjects={timetableData?.subjects || []} // Pass subjects to CommonTable
                          loading={loadingForTabSwitch} // Show loading state if fetching data
                          //   handleTableData={() => {}} // Example, you can pass a function to handle table data if needed
                          handleTableData={handleTableData} // Callback function for handling table interactions
                        />
                        {/* <CommonTable
                          periods={data[activeTab].periods} // Get periods for the activeTab
                          subjects={data[activeTab]} // Get timetable data for the activeTab
                        /> */}
                        {/* <CommonTable
                          periods={
                            data.tab.find((tab) => tab.id === activeTab)
                              ?.periods || []
                          }
                          subjects={data.subjects[activeTab] || []}
                        /> */}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        </div>
      </div>
    </>
  );
};

export default TimetablePlanner;
