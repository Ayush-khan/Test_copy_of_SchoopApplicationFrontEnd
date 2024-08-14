// // import React, { useEffect, useState } from "react";
// // import { Navbar, Nav, NavDropdown, NavItem } from "react-bootstrap";
// // import { Link, useNavigate } from "react-router-dom";
// // import axios from "axios";
// // import { FaHome, FaUserCircle } from "react-icons/fa";
// // import { CiUser, CiLogout } from "react-icons/ci";
// // import { LiaEdit } from "react-icons/lia";
// // import "./NabarstyleBootstrap.css";
// // import authManage from "../utils/PrivateRoute";
// // import styles from "../CSS/Navbar.module.css";
// // import { LuSchool } from "react-icons/lu";
// // import { RxHamburgerMenu } from "react-icons/rx";
// // import Sidebar from "./Sidebar";
// // import { Translate } from "react-bootstrap-icons";
// // import { IoIosHelpCircleOutline } from "react-icons/io";
// // function NavBar() {
// //   const API_URL = import.meta.env.VITE_API_URL; //thsis is test url
// //   const navigate = useNavigate();
// //   const [isSidebar, setIsSidebar] = useState();
// //   const [instituteName, setInstituteName] = useState("");
// //   const [academicYear, setAcademicYear] = useState([]);
// //   const [dropdownOpen, setDropdownOpen] = useState(false);
// //   const [menuDropdownOpen, setMenuDropdownOpen] = useState({});
// //   const [inputValueGR, setInputValueGR] = useState("");
// //   const [selectedYear, setSelectedYear] = useState("");
// //   const [sessionData, setsessionData] = useState({});
// //   function getCurrentDate() {
// //     const months = [
// //       "January",
// //       "February",
// //       "March",
// //       "April",
// //       "May",
// //       "June",
// //       "July",
// //       "August",
// //       "September",
// //       "October",
// //       "November",
// //       "December",
// //     ];
// //     const today = new Date();
// //     const day = String(today.getDate()).padStart(2, "0");
// //     const monthIndex = today.getMonth();
// //     const year = String(today.getFullYear()).slice();
// //     const monthName = months[monthIndex];
// //     return `${day} ${monthName} ${year}`;
// //   }
// //   // const handleSelect = (eventKey) => {
// //   //   setSelectedYear(eventKey);
// //   //   localStorage.setItem("academicYear", eventKey);
// //   //   const academicYear = localStorage.getItem("academicYear");
// //   //   console.log("this is selected academicYear", academicYear);
// //   // };
// //   // const handleSelect = async (eventKey) => {
// //   //   setSelectedYear(eventKey);
// //   //   localStorage.setItem("academicYear", eventKey);
// //   //   const academic_yr = localStorage.getItem("academicYear");
// //   //   try {
// //   //     const token = localStorage.getItem("authToken");
// //   //     if (!token || !academic_yr) {
// //   //       throw new Error("No authentication token or academic year found");
// //   //     }
// //   //     console.log("api claing");
// //   //     const response = await axios.put(
// //   //       `${API_URL}/api/updateAcademicYear`,
// //   //       {
// //   //         academic_yr: eventKey,
// //   //       },
// //   //       {
// //   //         headers: {
// //   //           Authorization: `Bearer ${token}`,
// //   //           "Content-Type": "application/json",
// //   //         },
// //   //       }
// //   //     );
// //   //     console.log("the response data", response.data.success);
// //   //     if (response.data.success) {
// //   //       console.log("Academic year updated successfully");
// //   //       window.location.reload();
// //   //     }
// //   //   } catch (error) {
// //   //     console.log("error aa rhi hai ");
// //   //     console.error("Error updating academic year:", error);
// //   //   }
// //   // };
// //   async function SeesionDatacallfun() {
// //     const token = localStorage.getItem("authToken");
// //     if (!token) {
// //       console.error("No authentication token found");
// //       return;
// //     }
// //     try {
// //       const response = await axios.get(`${API_URL}/api/sessionData`, {
// //         headers: {
// //           Authorization: `Bearer ${localStorage.getItem("authToken")}`,
// //         },
// //       });
// //       setsessionData(response.data);
// //       console.log("sessiond data", response.data);
// //     } catch (error) {
// //       console.error("Error fetching session data:", error);
// //     }
// //   }
// //   const handleSelect = async (eventKey) => {
// //     setSelectedYear(eventKey);
// //     const token = localStorage.getItem("authToken");
// //     if (!token) {
// //       console.error("No authentication token found");
// //       return;
// //     }
// //     try {
// //       const response = await axios.post(
// //         `${API_URL}/api/update_academic_year`,
// //         {
// //           academic_year: eventKey,
// //         },
// //         {
// //           headers: {
// //             Authorization: `Bearer ${token}`,
// //           },
// //         }
// //       );
// //       localStorage.setItem("authToken", response.data.token);
// //       // Refresh the page after updating the token
// //       window.location.reload();
// //     } catch (error) {
// //       console.error("Error updating academic year:", error);
// //     }
// //   };
// //   useEffect(() => {
// //     const sessionData = JSON.parse(sessionStorage.getItem("sessionData"));
// //     if (
// //       sessionData &&
// //       sessionData.settings &&
// //       sessionData.settings.length > 0
// //     ) {
// //       setInstituteName(sessionData.settings[0].institute_name);
// //       setAcademicYear(sessionData.settings[0].academic_yr);
// //     }
// //     // Fetch the data of academic year
// //     const token = localStorage.getItem("authToken");
// //     const fetchAcademicYear = async () => {
// //       try {
// //         const acdemicyearres = await axios.get(
// //           `${API_URL}/api/getAcademicYear`,
// //           {
// //             headers: {
// //               Authorization: `Bearer ${token}`,
// //             },
// //           }
// //         );
// //         setAcademicYear(acdemicyearres.data.academic_years);
// //         console.log(
// //           "academic year data is",
// //           acdemicyearres.data.academic_years
// //         );
// //       } catch (error) {
// //         console.error("Error fetching academic year data:", error);
// //       }
// //     };
// //     SeesionDatacallfun();
// //     fetchAcademicYear();
// //   }, []);
// //   const handleLogout = async () => {
// //     try {
// //       const token = localStorage.getItem("authToken");
// //       // Logout API
// //       await axios.post(
// //         `${API_URL}/api/logout`,
// //         {},
// //         {
// //           headers: {
// //             Authorization: `Bearer ${token}`,
// //           },
// //         }
// //       );
// //       localStorage.removeItem("authToken");
// //       localStorage.removeItem("academicYear");
// //       localStorage.removeItem("user");
// //       localStorage.removeItem("settings");
// //       sessionStorage.removeItem("sessionData");
// //       navigate("/");
// //     } catch (error) {
// //       console.error("Logout error:", error);
// //     }
// //   };
// //   const handleInputChange = (event) => {
// //     setInputValueGR(event.target.value);
// //   };
// //   const toggleMenuDropdown = (menu) => {
// //     setMenuDropdownOpen((prev) => ({
// //       ...prev,
// //       [menu]: !prev[menu],
// //     }));
// //   };
// //   return (
// //     <>
// //       <NavDropdown
// //         title="Role"
// //         style={{
// //           color: "black",
// //           fontWeight: "700",
// //         }}
// //         className="pr-0 mr-0 w-fit"
// //       >
// //         <NavDropdown.Item as={Link} to="/roles">
// //           Manage Role
// //         </NavDropdown.Item>
// //         <NavDropdown.Item as={Link} to="/show_roles">
// //           Manage Access
// //         </NavDropdown.Item>
// //       </NavDropdown>
// //       <NavDropdown
// //         title="My Actions"
// //         style={{
// //           color: "black",
// //           fontWeight: "700",
// //         }}
// //         className="pr-0 mr-0 w-fit"
// //       >
// //         {/* Student sub dropdown */}
// //         <NavDropdown
// //           className="dropend   "
// //           id="sub-view-dropdown"
// //           title="Students"
// //           style={{
// //             color: "black",
// //             fontWeight: "700",
// //           }}
// //           // className="pr-0 mr-0 w-fit"
// //         >
// //           <NavDropdown.Item
// //             className="text-[.9em] font-bold hover:text-black"
// //             as={Link}
// //             to="/student-create"
// //           >
// //             Add Student
// //           </NavDropdown.Item>
// //           <NavDropdown.Item
// //             className="text-[.9em] font-bold hover:text-black"
// //             as={Link}
// //             to="/student-list"
// //           >
// //             New Student List
// //           </NavDropdown.Item>
// //           <NavDropdown.Item
// //             className="text-[.9em] font-bold hover:text-black"
// //             as={Link}
// //             to="#"
// //           >
// //             Manage Students
// //           </NavDropdown.Item>
// //           <NavDropdown.Item
// //             className="text-[.9em] font-bold hover:text-black"
// //             as={Link}
// //             to="#"
// //           >
// //             LC Students
// //           </NavDropdown.Item>
// //           <NavDropdown.Item
// //             className="text-[.9em] font-bold hover:text-black"
// //             as={Link}
// //             to="#"
// //           >
// //             Deleted Student Lists
// //           </NavDropdown.Item>
// //           <NavDropdown.Item
// //             className="text-[.9em] font-bold hover:text-black"
// //             as={Link}
// //             to="#"
// //           >
// //             Promote Students
// //           </NavDropdown.Item>
// //           <NavDropdown.Item
// //             className="text-[.9em] font-bold hover:text-black"
// //             as={Link}
// //             to="#"
// //           >
// //             Send User Id to Parents
// //           </NavDropdown.Item>
// //           <NavDropdown.Item
// //             className="text-[.9em] font-bold hover:text-black"
// //             as={Link}
// //             to="#"
// //           >
// //             Sibling Mapping
// //           </NavDropdown.Item>
// //           <NavDropdown.Item>Edit Student</NavDropdown.Item>
// //           <NavDropdown.Item>Delete Student</NavDropdown.Item>
// //           <NavDropdown.Item
// //             className="text-[.9em] font-bold hover:text-black"
// //             as={Link}
// //             to="/myprofile"
// //           >
// //             User Profile
// //           </NavDropdown.Item>
// //         </NavDropdown>
// //         {/* Certificate  sub drop down */}
// //         <NavDropdown
// //           className="dropend pr-0 mr-0  "
// //           id="sub-view-dropdown"
// //           title="Certificate"
// //           style={{
// //             color: "black",
// //             fontWeight: "700",
// //           }}
// //         >
// //           <NavDropdown.Item as={Link} to="#" className="text-[.9em] font-bold">
// //             Bonafide Certificate
// //           </NavDropdown.Item>
// //           <NavDropdown.Item
// //             className="text-[.9em] font-bold hover:text-black"
// //             as={Link}
// //             to="#"
// //           >
// //             Caste Certificate
// //           </NavDropdown.Item>
// //           <NavDropdown.Item
// //             className="text-[.9em] font-bold hover:text-black"
// //             as={Link}
// //             to="#"
// //           >
// //             Character Certificate
// //           </NavDropdown.Item>
// //           <NavDropdown.Item
// //             className="text-[.9em] font-bold hover:text-black"
// //             as={Link}
// //             to="#"
// //           >
// //             Percentage Certificate
// //           </NavDropdown.Item>
// //           <NavDropdown.Item
// //             className="text-[.9em] font-bold hover:text-black"
// //             as={Link}
// //             to="#"
// //           >
// //             Simple Bonafide Certificate
// //           </NavDropdown.Item>
// //         </NavDropdown>
// //         {/* Staff sub drop down */}
// //         <NavDropdown
// //           className=" dropend pr-0 mr-0  "
// //           id="sub-view-dropdown"
// //           title="Staff"
// //           style={{
// //             color: "black",
// //             fontWeight: "700",
// //           }}
// //         >
// //           <NavDropdown.Item
// //             as={Link}
// //             to="/StaffList"
// //             className="text-[.9em] font-bold"
// //           >
// //             Staff List
// //           </NavDropdown.Item>
// //           <NavDropdown.Item
// //             className="text-[.9em] font-bold hover:text-black"
// //             as={Link}
// //             to="#"
// //           >
// //             Manage Caretaker
// //           </NavDropdown.Item>
// //           <NavDropdown.Item
// //             className="text-[.9em] font-bold hover:text-black"
// //             as={Link}
// //             to="#"
// //           >
// //             Substitute Teacher
// //           </NavDropdown.Item>
// //         </NavDropdown>
// //         {/* Leaving certificate sub drop down */}
// //         <NavDropdown
// //           className=" dropend pr-0 mr-0  "
// //           id="sub-view-dropdown"
// //           title="Leaving Certificate"
// //           style={{
// //             color: "black",
// //             fontWeight: "700",
// //           }}
// //         >
// //           <NavDropdown.Item as={Link} to="#" className="text-[.9em] font-bold">
// //             Generate LC
// //           </NavDropdown.Item>
// //           <NavDropdown.Item
// //             className="text-[.9em] font-bold hover:text-black"
// //             as={Link}
// //             to="#"
// //           >
// //             Manage LC
// //           </NavDropdown.Item>
// //         </NavDropdown>
// //         {/* Leave sub drop down*/}
// //         <NavDropdown
// //           className=" dropend pr-0 mr-0  "
// //           id="sub-view-dropdown"
// //           title="Leave"
// //           style={{
// //             color: "black",
// //             fontWeight: "700",
// //           }}
// //         >
// //           <NavDropdown.Item as={Link} to="#" className="text-[.9em] font-bold">
// //             Leave Allocation
// //           </NavDropdown.Item>
// //           <NavDropdown.Item
// //             className="text-[.9em] font-bold hover:text-black"
// //             as={Link}
// //             to="#"
// //           >
// //             Leave Allocation to All Staff
// //           </NavDropdown.Item>
// //           <NavDropdown.Item
// //             className="text-[.9em] font-bold hover:text-black"
// //             as={Link}
// //             to="#"
// //           >
// //             Leave Application
// //           </NavDropdown.Item>
// //         </NavDropdown>
// //         <NavDropdown.Item
// //           className="text-[.9em] font-bold hover:text-black"
// //           as={Link}
// //           to="#"
// //         >
// //           Notice/SMS
// //         </NavDropdown.Item>
// //         <NavDropdown.Item
// //           className="text-[.9em] font-bold hover:text-black"
// //           as={Link}
// //           to="#"
// //         >
// //           Event
// //         </NavDropdown.Item>
// //         <NavDropdown.Item
// //           className="text-[.9em] font-bold hover:text-black"
// //           as={Link}
// //           to="#"
// //         >
// //           Holiday List
// //         </NavDropdown.Item>
// //         <NavDropdown.Item
// //           className="text-[.9em] font-bold hover:text-black"
// //           as={Link}
// //           to="#"
// //         >
// //           Allot Class teachers
// //         </NavDropdown.Item>
// //         <NavDropdown.Item
// //           className="text-[.9em] font-bold hover:text-black"
// //           as={Link}
// //           to="#"
// //         >
// //           Allote Department cordinator
// //         </NavDropdown.Item>
// //       </NavDropdown>
// //       <NavDropdown
// //         title="ID Card"
// //         style={{ color: "black", fontWeight: "700" }}
// //       >
// //         <NavDropdown.Item
// //           className="text-[.9em] font-bold hover:text-black"
// //           as={Link}
// //           to="#"
// //         >
// //           Student ID Card
// //         </NavDropdown.Item>
// //         <NavDropdown.Item
// //           className="text-[.9em] font-bold hover:text-black"
// //           as={Link}
// //           to="#"
// //         >
// //           Teacher ID Card
// //         </NavDropdown.Item>
// //         <NavDropdown.Item
// //           className="text-[.9em] font-bold hover:text-black"
// //           as={Link}
// //           to="#"
// //         >
// //           Pending Student ID Card
// //         </NavDropdown.Item>
// //       </NavDropdown>
// //       <NavDropdown title="View" style={{ color: "black", fontWeight: "700" }}>
// //         <NavDropdown.Item
// //           className="text-[.9em] font-bold hover:text-black"
// //           as={Link}
// //           to="#"
// //         >
// //           Leaving Certificate
// //         </NavDropdown.Item>
// //         <NavDropdown.Item
// //           className="text-[.9em] font-bold hover:text-black"
// //           as={Link}
// //           to="#"
// //         >
// //           Notices/SMS for staff
// //         </NavDropdown.Item>
// //         <NavDropdown.Item
// //           className="text-[.9em] font-bold hover:text-black"
// //           as={Link}
// //           to="#"
// //         >
// //           Book Availablity
// //         </NavDropdown.Item>
// //       </NavDropdown>
// //       <NavDropdown
// //         title="Reports"
// //         style={{ color: "black", fontWeight: "700" }}
// //       >
// //         <NavDropdown.Item
// //           className="text-[.9em] font-bold hover:text-black"
// //           as={Link}
// //           to="#"
// //         >
// //           Balance Leave
// //         </NavDropdown.Item>
// //         <NavDropdown.Item
// //           className="text-[.9em] font-bold hover:text-black"
// //           as={Link}
// //           to="#"
// //         >
// //           Consolidated Leave
// //         </NavDropdown.Item>
// //         <NavDropdown.Item
// //           className="text-[.9em] font-bold hover:text-black"
// //           as={Link}
// //           to="#"
// //         >
// //           Student Report
// //         </NavDropdown.Item>
// //         <NavDropdown.Item
// //           className="text-[.9em] font-bold hover:text-black"
// //           as={Link}
// //           to="#"
// //         >
// //           Student Contact Details Report
// //         </NavDropdown.Item>
// //       </NavDropdown>
// //       <NavDropdown title="Ticket" style={{ color: "black", fontWeight: "700" }}>
// //         <NavDropdown.Item
// //           className="text-[.9em] font-bold hover:text-black"
// //           as={Link}
// //           to="#"
// //         >
// //           T1
// //         </NavDropdown.Item>
// //         <NavDropdown.Item
// //           className="text-[.9em] font-bold hover:text-black"
// //           as={Link}
// //           to="#"
// //         >
// //           T2
// //         </NavDropdown.Item>
// //         <NavDropdown.Item
// //           className="text-[.9em] font-bold hover:text-black"
// //           as={Link}
// //           to="#"
// //         >
// //           T3
// //         </NavDropdown.Item>
// //         <NavDropdown.Item
// //           className="text-[.9em] font-bold hover:text-black"
// //           as={Link}
// //           to="#"
// //         >
// //           T4
// //         </NavDropdown.Item>
// //       </NavDropdown>
// //       <NavDropdown
// //         title="Masters"
// //         style={{ color: "black", fontWeight: "700" }}
// //       >
// //         <NavDropdown.Item
// //           className="text-[.9em] font-bold hover:text-black"
// //           as={Link}
// //           to="/sections"
// //         >
// //           Section
// //         </NavDropdown.Item>
// //         <NavDropdown.Item
// //           className="text-[.9em] font-bold hover:text-black"
// //           as={Link}
// //           to="/classlist"
// //         >
// //           Class
// //         </NavDropdown.Item>
// //         <NavDropdown.Item
// //           className="text-[.9em] font-bold hover:text-black"
// //           as={Link}
// //           to="#"
// //         >
// //           Division
// //         </NavDropdown.Item>
// //         <NavDropdown.Item
// //           className="text-[.9em] font-bold hover:text-black"
// //           as={Link}
// //           to="#"
// //         >
// //           Subjects
// //         </NavDropdown.Item>
// //         <NavDropdown.Item
// //           className="text-[.9em] font-bold hover:text-black"
// //           as={Link}
// //           to="#"
// //         >
// //           Subjects Allotment
// //         </NavDropdown.Item>
// //         <NavDropdown.Item
// //           className="text-[.9em] font-bold hover:text-black"
// //           as={Link}
// //           to="#"
// //         >
// //           StudentWise Subject Allotement for HSC
// //         </NavDropdown.Item>
// //         <NavDropdown.Item
// //           className="text-[.9em] font-bold hover:text-black"
// //           as={Link}
// //           to="#"
// //         >
// //           Subject for report Card
// //         </NavDropdown.Item>
// //       </NavDropdown>
// //       {/* Help */}
// //       <div
// //         onClick={() => {
// //           // navigate("");
// //         }}
// //         style={{ fontWeight: "700" }}
// //         className="my-auto  text-gray-600 cursor-pointer hover:text-gray-900  md:relative left-2 "
// //       >
// //         <IoIosHelpCircleOutline className="inline mr-1 relative bottom-0.5  hover:text-black" />
// //         {/* <FaHome className="inline mr-1 relative bottom-0.5  hover:text-black" /> */}
// //         Help
// //       </div>

// //       <Sidebar isSidebar={isSidebar} setIsSidebar={setIsSidebar} />
// //     </>
// //   );
// // }
// // export default NavBar;

// import React from "react";
// import { NavDropdown, Nav } from "react-bootstrap";
// import { Link } from "react-router-dom";
// import { IoIosHelpCircleOutline } from "react-icons/io";

// const AdminNavBar = () => {
//   return (
//     <>
//       {/* Role Dropdown */}
//       <NavDropdown
//         title="Role"
//         style={{ color: "black", fontWeight: "700" }}
//         className="pr-0 mr-0 w-fit"
//       >
//         <NavDropdown.Item as={Link} to="/roles">
//           Manage Role
//         </NavDropdown.Item>
//         <NavDropdown.Item as={Link} to="/menus">
//           Manage Menu
//         </NavDropdown.Item>
//         <NavDropdown.Item as={Link} to="/show_roles">
//           Manage Access
//         </NavDropdown.Item>
//       </NavDropdown>

//       {/* My Actions Dropdown */}
//       <NavDropdown
//         title="My Actions"
//         style={{ color: "black", fontWeight: "700" }}
//         className="pr-0 mr-0 w-fit"
//       >
//         {/* Students Sub-dropdown */}
//         <NavDropdown
//           className="dropend"
//           id="students-dropdown"
//           title="Students"
//           style={{ color: "black", fontWeight: "700" }}
//         >
//           <NavDropdown.Item
//             as={Link}
//             to="/student-create"
//             className="text-[.9em] font-bold hover:text-black"
//           >
//             Add Student
//           </NavDropdown.Item>
//           <NavDropdown.Item
//             as={Link}
//             to="/student-list"
//             className="text-[.9em] font-bold hover:text-black"
//           >
//             New Student List
//           </NavDropdown.Item>
//           <NavDropdown.Item
//             className="text-[.9em] font-bold hover:text-black"
//             as={Link}
//             to="#"
//           >
//             Manage Students
//           </NavDropdown.Item>
//           <NavDropdown.Item
//             className="text-[.9em] font-bold hover:text-black"
//             as={Link}
//             to="#"
//           >
//             LC Students
//           </NavDropdown.Item>
//           <NavDropdown.Item
//             className="text-[.9em] font-bold hover:text-black"
//             as={Link}
//             to="#"
//           >
//             Deleted Student Lists
//           </NavDropdown.Item>
//           <NavDropdown.Item
//             className="text-[.9em] font-bold hover:text-black"
//             as={Link}
//             to="#"
//           >
//             Promote Students
//           </NavDropdown.Item>
//           <NavDropdown.Item
//             className="text-[.9em] font-bold hover:text-black"
//             as={Link}
//             to="#"
//           >
//             Send User Id to Parents
//           </NavDropdown.Item>
//           <NavDropdown.Item
//             className="text-[.9em] font-bold hover:text-black"
//             as={Link}
//             to="#"
//           >
//             Sibling Mapping
//           </NavDropdown.Item>
//           <NavDropdown.Item>Edit Student</NavDropdown.Item>
//           <NavDropdown.Item>Delete Student</NavDropdown.Item>
//           <NavDropdown.Item
//             as={Link}
//             to="/myprofile"
//             className="text-[.9em] font-bold hover:text-black"
//           >
//             User Profile
//           </NavDropdown.Item>
//         </NavDropdown>

//         {/* Certificate Sub-dropdown */}
//         <NavDropdown
//           className="dropend pr-0 mr-0"
//           id="certificate-dropdown"
//           title="Certificate"
//           style={{ color: "black", fontWeight: "700" }}
//         >
//           <NavDropdown.Item as={Link} to="#" className="text-[.9em] font-bold">
//             Bonafide Certificate
//           </NavDropdown.Item>
//           <NavDropdown.Item
//             as={Link}
//             to="#"
//             className="text-[.9em] font-bold hover:text-black"
//           >
//             Caste Certificate
//           </NavDropdown.Item>
//           <NavDropdown.Item
//             as={Link}
//             to="#"
//             className="text-[.9em] font-bold hover:text-black"
//           >
//             Character Certificate
//           </NavDropdown.Item>
//           <NavDropdown.Item
//             as={Link}
//             to="#"
//             className="text-[.9em] font-bold hover:text-black"
//           >
//             Percentage Certificate
//           </NavDropdown.Item>
//           <NavDropdown.Item
//             as={Link}
//             to="#"
//             className="text-[.9em] font-bold hover:text-black"
//           >
//             Simple Bonafide Certificate
//           </NavDropdown.Item>
//         </NavDropdown>

//         {/* Staff Sub-dropdown */}
//         <NavDropdown
//           className="dropend pr-0 mr-0"
//           id="staff-dropdown"
//           title="Staff"
//           style={{ color: "black", fontWeight: "700" }}
//         >
//           <NavDropdown.Item
//             as={Link}
//             to="/StaffList"
//             className="text-[.9em] font-bold"
//           >
//             Staff List
//           </NavDropdown.Item>
//           <NavDropdown.Item
//             as={Link}
//             to="#"
//             className="text-[.9em] font-bold hover:text-black"
//           >
//             Manage Caretaker
//           </NavDropdown.Item>
//           <NavDropdown.Item
//             as={Link}
//             to="#"
//             className="text-[.9em] font-bold hover:text-black"
//           >
//             Substitute Teacher
//           </NavDropdown.Item>
//         </NavDropdown>

//         {/* Leaving Certificate Sub-dropdown */}
//         <NavDropdown
//           className="dropend pr-0 mr-0"
//           id="leaving-certificate-dropdown"
//           title="Leaving Certificate"
//           style={{ color: "black", fontWeight: "700" }}
//         >
//           <NavDropdown.Item as={Link} to="#" className="text-[.9em] font-bold">
//             Generate LC
//           </NavDropdown.Item>
//           <NavDropdown.Item
//             as={Link}
//             to="#"
//             className="text-[.9em] font-bold hover:text-black"
//           >
//             Manage LC
//           </NavDropdown.Item>
//         </NavDropdown>

//         {/* Leave Sub-dropdown */}
//         <NavDropdown
//           className="dropend pr-0 mr-0"
//           id="leave-dropdown"
//           title="Leave"
//           style={{ color: "black", fontWeight: "700" }}
//         >
//           <NavDropdown.Item as={Link} to="#" className="text-[.9em] font-bold">
//             Leave Allocation
//           </NavDropdown.Item>
//           <NavDropdown.Item
//             as={Link}
//             to="#"
//             className="text-[.9em] font-bold hover:text-black"
//           >
//             Leave Allocation to All Staff
//           </NavDropdown.Item>
//           <NavDropdown.Item
//             as={Link}
//             to="#"
//             className="text-[.9em] font-bold hover:text-black"
//           >
//             Leave Application
//           </NavDropdown.Item>
//         </NavDropdown>

//         {/* Other Items */}
//         <NavDropdown.Item
//           as={Link}
//           to="#"
//           className="text-[.9em] font-bold hover:text-black"
//         >
//           Notice/SMS
//         </NavDropdown.Item>
//         <NavDropdown.Item
//           as={Link}
//           to="#"
//           className="text-[.9em] font-bold hover:text-black"
//         >
//           Event
//         </NavDropdown.Item>
//         <NavDropdown.Item
//           as={Link}
//           to="#"
//           className="text-[.9em] font-bold hover:text-black"
//         >
//           Holiday List
//         </NavDropdown.Item>
//         <NavDropdown.Item
//           as={Link}
//           to="#"
//           className="text-[.9em] font-bold hover:text-black"
//         >
//           Allot Class Teachers
//         </NavDropdown.Item>
//         <NavDropdown.Item
//           as={Link}
//           to="#"
//           className="text-[.9em] font-bold hover:text-black"
//         >
//           Allot Department Coordinator
//         </NavDropdown.Item>
//       </NavDropdown>

//       {/* ID Card Dropdown */}
//       <NavDropdown
//         title="ID Card"
//         style={{ color: "black", fontWeight: "700" }}
//       >
//         <NavDropdown.Item
//           as={Link}
//           to="#"
//           className="text-[.9em] font-bold hover:text-black"
//         >
//           Student ID Card
//         </NavDropdown.Item>
//         <NavDropdown.Item
//           as={Link}
//           to="#"
//           className="text-[.9em] font-bold hover:text-black"
//         >
//           Teacher ID Card
//         </NavDropdown.Item>
//         <NavDropdown.Item
//           as={Link}
//           to="#"
//           className="text-[.9em] font-bold hover:text-black"
//         >
//           Pending Student ID Card
//         </NavDropdown.Item>
//       </NavDropdown>

//       {/* View Dropdown */}
//       <NavDropdown title="View" style={{ color: "black", fontWeight: "700" }}>
//         <NavDropdown.Item
//           as={Link}
//           to="#"
//           className="text-[.9em] font-bold hover:text-black"
//         >
//           Leaving Certificate
//         </NavDropdown.Item>
//         <NavDropdown.Item
//           as={Link}
//           to="#"
//           className="text-[.9em] font-bold hover:text-black"
//         >
//           Notices/SMS for Staff
//         </NavDropdown.Item>
//         <NavDropdown.Item
//           as={Link}
//           to="#"
//           className="text-[.9em] font-bold hover:text-black"
//         >
//           Book Availability
//         </NavDropdown.Item>
//       </NavDropdown>

//       {/* Reports Dropdown */}
//       <NavDropdown
//         title="Reports"
//         style={{ color: "black", fontWeight: "700" }}
//       >
//         <NavDropdown.Item
//           as={Link}
//           to="#"
//           className="text-[.9em] font-bold hover:text-black"
//         >
//           Balance Leave
//         </NavDropdown.Item>
//         <NavDropdown.Item
//           as={Link}
//           to="#"
//           className="text-[.9em] font-bold hover:text-black"
//         >
//           Consolidated Leave
//         </NavDropdown.Item>
//         <NavDropdown.Item
//           as={Link}
//           to="#"
//           className="text-[.9em] font-bold hover:text-black"
//         >
//           Student Report
//         </NavDropdown.Item>
//         <NavDropdown.Item
//           as={Link}
//           to="#"
//           className="text-[.9em] font-bold hover:text-black"
//         >
//           Student Contact Details Report
//         </NavDropdown.Item>
//       </NavDropdown>

//       {/* Ticket Dropdown */}
//       <NavDropdown title="Ticket" style={{ color: "black", fontWeight: "700" }}>
//         <NavDropdown.Item
//           as={Link}
//           to="#"
//           className="text-[.9em] font-bold hover:text-black"
//         >
//           T1
//         </NavDropdown.Item>
//         <NavDropdown.Item
//           as={Link}
//           to="#"
//           className="text-[.9em] font-bold hover:text-black"
//         >
//           T2
//         </NavDropdown.Item>
//         <NavDropdown.Item
//           as={Link}
//           to="#"
//           className="text-[.9em] font-bold hover:text-black"
//         >
//           T3
//         </NavDropdown.Item>
//         <NavDropdown.Item
//           as={Link}
//           to="#"
//           className="text-[.9em] font-bold hover:text-black"
//         >
//           T4
//         </NavDropdown.Item>
//       </NavDropdown>

//       {/* Masters Dropdown */}
//       <NavDropdown
//         title="Masters"
//         style={{ color: "black", fontWeight: "700" }}
//       >
//         <NavDropdown.Item
//           as={Link}
//           to="/sections"
//           className="text-[.9em] font-bold hover:text-black"
//         >
//           Section
//         </NavDropdown.Item>
//         <NavDropdown.Item
//           as={Link}
//           to="/classlist"
//           className="text-[.9em] font-bold hover:text-black"
//         >
//           Class
//         </NavDropdown.Item>
//         <NavDropdown.Item
//           as={Link}
//           to="/divisionlist"
//           className="text-[.9em] font-bold hover:text-black"
//         >
//           Division
//         </NavDropdown.Item>
//         <NavDropdown.Item
//           as={Link}
//           to="/subjectlist"
//           className="text-[.9em] font-bold hover:text-black"
//         >
//           Subjects
//         </NavDropdown.Item>
//         <NavDropdown.Item
//           as={Link}
//           to="#"
//           className="text-[.9em] font-bold hover:text-black"
//         >
//           Subjects Allotment
//         </NavDropdown.Item>
//         <NavDropdown.Item
//           as={Link}
//           to="#"
//           className="text-[.9em] font-bold hover:text-black"
//         >
//           StudentWise Subject Allotment for HSC
//         </NavDropdown.Item>
//         <NavDropdown.Item
//           as={Link}
//           to="#"
//           className="text-[.9em] font-bold hover:text-black"
//         >
//           Subject for Report Card
//         </NavDropdown.Item>
//       </NavDropdown>

//       {/* Help */}
//       <div
//         onClick={() => {
//           /* navigate(""); */
//         }}
//         style={{ fontWeight: "700" }}
//         className="my-auto text-gray-600 cursor-pointer hover:text-gray-900 md:relative left-2"
//       >
//         <IoIosHelpCircleOutline className="inline mr-1 relative bottom-0.5 hover:text-black" />
//         Help
//       </div>
//     </>
//   );
// };

// export default AdminNavBar;
