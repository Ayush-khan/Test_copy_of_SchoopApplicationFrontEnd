// old make by mahima
// import {
//   FaUserGroup,
//   FaUserShield,
//   FaUsersLine,
// } from "react-icons/fa6";
// import Card from "../common/Card.jsx";
// import EventCard from "./EventCard.jsx";
// import CardStuStaf from "../common/CardStuStaf.jsx";
// import {
//   FaBirthdayCake,
//   FaClipboardCheck,
// } from "react-icons/fa";
// import { HiCollection } from "react-icons/hi";
// import axios from "axios";
// import { useEffect, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { ToastContainer, toast } from "react-toastify";
// import { RiPassValidFill } from "react-icons/ri";
// import { GiTeacher } from "react-icons/gi";
// import StudentAttendanceChart from "./Charts/StudentAttendanceChart.jsx";


// const PrincipalDashboardSACS = () => {
//   const API_URL = import.meta.env.VITE_API_URL; // url for host
//   const navigate = useNavigate();
//   const [studentData, setStudentData] = useState({
//     total: 0,
//     present: 0,
//   });
//   const [sortNameCookie, setSortNameCookie] = useState("");
//   // console.log("school name", sortNameCookie);
//   const [staffData, setStaffData] = useState({
//     teachingStaff: "",
//     nonTeachingStaff: "",
//   });
//   const [staffBirthday, setStaffBirthday] = useState("");
//   const [ticketCount, setTicketCount] = useState("");
//   const [approveLeaveCount, setApproveLeaveCount] = useState("");
//   const [pendingFee, setPendingFee] = useState("");
//   const [collectedFee, setCollectedFee] = useState("");
//   const [approvedLessonPlaneCount, setApprovedLessonPlaneCount] = useState("");
//   const [notSubmittedLessonPlanCount, setNotSubmittedLessonPlanCount] =
//     useState("");
//   const [pendingApprovalLP, setPendingApprovealLP] = useState("");
//   const [noOfTeachers, setNoOfTeachers] = useState("");
//   const [error, setError] = useState(null);
//   const [roleId, setRoleId] = useState(null);
//   const [regId, setRegId] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const [attendanceCountStaff, setAttendanceCountStaff] = useState({});
//   const [prePrimary, setPrePrimary] = useState({});
//   const [primary, setPrimary] = useState({});
//   const [secondary, setSecondary] = useState({});
//   const [higherSecondary, setHigherSecondary] = useState({});
//   const [caretaker, setCaretaker] = useState({});

//   const [markAbsentees, setMarkAbsentees] = useState("");

//   useEffect(() => {
//     fetchRoleId();
//   }, []);

//   useEffect(() => {
//     if (!roleId) return;

//     fetchData();
//   }, [roleId]);

//   const fetchRoleId = async () => {
//     setLoading(true);
//     const token = localStorage.getItem("authToken");
//     if (!token) {
//       toast.error("Authentication token not found. Please login again");
//       navigate("/");
//       return;
//     }

//     try {
//       const response = await axios.get(`${API_URL}/api/sessionData`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const roleId = response?.data?.user?.role_id;
//       const regId = response?.data?.user?.reg_id;

//       setRegId(regId);
//       setSortNameCookie(response?.data?.custom_claims?.short_name);
//       if (roleId) setRoleId(roleId);
//     } catch (error) {
//       // console.error("Failed to fetch session data:", error);
//       (" ");
//     } finally {
//       setLoading(false); // stop loading after API
//     }
//   };

//   const fetchData = async () => {
//     try {
//       const token = localStorage.getItem("authToken");
//       const roleId = localStorage.getItem("roleId");
//       // console.log("**** role ID******", roleId);

//       if (!token) {
//         toast.error("Authentication token not found Please login again");
//         navigate("/");
//         return;
//       }

//       // Fetch student data
//       const studentResponse = await axios.get(`${API_URL}/api/studentss`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       setStudentData({
//         total: studentResponse.data.count,
//         present: studentResponse.data.present,
//       });

//       // Fetch staff data
//       const staffResponse = await axios.get(`${API_URL}/api/staff`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       // console.log("reponse of the staffAPI", staffResponse);
//       const totalStaff =
//         (staffResponse?.data?.teachingStaff || 0) +
//         (staffResponse?.data?.non_teachingStaff || 0);
//       const totalAttendance =
//         (staffResponse?.data?.attendanceteachingstaff || 0) +
//         (staffResponse?.data?.attendancenonteachingstaff || 0);

//       setStaffData({
//         teachingStaff: totalStaff, // combined total staff
//         attendanceteachingstaff: totalAttendance, // combined attendance
//         // If you still want to keep them separate, you can also add them:
//         nonTeachingStaff: staffResponse?.data?.non_teachingStaff,
//         attendancenonteachingstaff:
//           staffResponse?.data?.attendancenonteachingstaff,
//       });
//       // Fetch Tickiting count values

//       const responseTickingCount = await axios.get(
//         `${API_URL}/api/ticketcount`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,

//             "Role-Id": roleId, // add roleId for different role
//           },
//         },
//       );
//       // console.log(
//       //   "***the roleiD count*******",
//       //   responseTickingCount.data.count
//       // );
//       setTicketCount(responseTickingCount.data.count);
//       // Fetch the data of approveLeave count
//       const responseApproveLeaveCount = await axios.get(
//         `${API_URL}/api/get_count_of_approveleave`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         },
//       );
//       setApproveLeaveCount(responseApproveLeaveCount?.data?.data);

//       // Fetch Pending Fee Records counts
//       const pendingFeeCount = await axios.get(`${API_URL}/api/feecollection`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       // setPendingFee(pendingFeeCount.data.pendingFee);
//       setCollectedFee(pendingFeeCount.data["Collected Fees"]);
//       setPendingFee(pendingFeeCount.data["Pending Fees"]);
//       // console.log("pendingFee count is here******", pendingFeeCount.data);

//       // Fetch birthday Count
//       const Birthdaycount = await axios.get(
//         `${API_URL}/api/staffbirthdaycount`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         },
//       );
//       // console.log(
//       //   "the birthday count and it's value is=",
//       //   Birthdaycount.data.count
//       // );
//       setStaffBirthday(Birthdaycount.data.count);

//       // fetch Approved lesson plane count
//       const ApprovedLessonPlane = await axios.get(
//         `${API_URL}/api/lessonplan/summary`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         },
//       );
//       console.log("lesson plan summary", ApprovedLessonPlane);
//       setApprovedLessonPlaneCount(ApprovedLessonPlane.data.lessonPlanSubmitted);
//       setNotSubmittedLessonPlanCount(
//         ApprovedLessonPlane.data.lessonPlanNotSubmitted,
//       );
//       setPendingApprovealLP(ApprovedLessonPlane.data.pendingForApproval);
//       setNoOfTeachers(ApprovedLessonPlane.data.totalNumberOfTeachers);
//       // console.log("approve lesson plan data", ApprovedLessonPlane.data);

//       // Fetch Pre-Primary, Primary , School, and caretaker cards count
//       const AttendanceCountStaff = await axios.get(
//         `${API_URL}/api/attendance/summary/category`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         },
//       );

//       const dataAttendace = AttendanceCountStaff.data.data;
//       setAttendanceCountStaff(dataAttendace);
//       const getDept = (key) =>
//         dataAttendace[key] || { present: 0, absent: 0, total: 0 };
//       setPrePrimary(getDept("Nursery teachers"));
//       setPrimary(getDept("KG teachers"));
//       setSecondary(getDept("SACS teachers"));
//       setHigherSecondary(getDept("Higher Secondary"));
//       setCaretaker(getDept("Caretakers"));
//       console.log("nursery", getDept("Nursery teachers"));
//       console.log("KG ", getDept("KG teachers"));

//       // console.log("Attendancecount staff", AttendanceCountStaff.data.data);

//       const markAbsenttesCount = await axios.get(
//         `${API_URL}/api/attendance/notmarked/count`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         },
//       );
//       const markAbsenteesData =
//         markAbsenttesCount?.data?.AttendanceNotMarkedCount;

//       console.log("mark absettes", markAbsenteesData);
//       setMarkAbsentees(markAbsenteesData);
//     } catch (error) {
//       setError(error.message);
//       // console.error("Error fetching data:", error);
//     }
//   };

//   return (
//     <>
//       <>
//         <ToastContainer />
//         <div className="flex flex-col lg:flex-row items-start justify-between w-full gap-4 p-6 ">
//           <div className="w-full lg:w-full  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
//             <Link to="/studentAbsent" className="no-underline">
//               <CardStuStaf
//                 title="Student"
//                 roleId={roleId}
//                 TotalValue={studentData?.total}
//                 presentValue={studentData?.present}
//                 color="#4CAF50"
//                 badge={markAbsentees} // 👈 badge value
//                 icon={
//                   <div
//                     style={{
//                       width: 40,
//                       height: 40,
//                       backgroundColor: "white",
//                       borderRadius: "50%",
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                     }}
//                   >
//                     <FaUsersLine style={{ color: "violet", fontSize: 30 }} />
//                   </div>
//                 }
//               />
//             </Link>

//             {roleId === null ? (
//               <div className="flex justify-between animate-pulse bg-white rounded shadow-md p-4 w-full h-[114px] border border-gray-200">
//                 <div className="relative -top-2 h-20 bg-gray-300 rounded w-1/2"></div>
//                 <div className="relative top-3 h-10 bg-gray-300 rounded w-1/3"></div>
//               </div>
//             ) : (
//               <>
//                 <button
//                   disabled={sortNameCookie === "HSCS"}
//                   style={{
//                     border: "none",
//                     background: "transparent",
//                     padding: 0,
//                     width: "100%",
//                     cursor:
//                       sortNameCookie === "HSCS" ? "not-allowed" : "pointer",
//                   }}
//                 >
//                   <Link
//                     to={sortNameCookie === "HSCS" ? "#" : "/todayStaffList"}
//                     className="no-underline"
//                     style={
//                       sortNameCookie === "HSCS" ? { pointerEvents: "none" } : {}
//                     }
//                   >
//                     <CardStuStaf
//                       title="Staff"
//                       TotalValue={staffData.teachingStaff}
//                       presentValue={staffData?.attendanceteachingstaff}
//                       color="#2196F3"
//                       icon={
//                         <div
//                           style={{
//                             width: 40,
//                             height: 40,
//                             backgroundColor: "white",
//                             borderRadius: "50%",
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                           }}
//                         >
//                           <FaUserGroup
//                             style={{ color: "#00FFFF", fontSize: 30 }}
//                           />
//                         </div>
//                       }
//                       disableLoader={sortNameCookie === "HSCS"}
//                     />
//                   </Link>
//                 </button>
//               </>
//             )}

//             {roleId === null ? (
//               // Skeleton card
//               <div className="flex justify-between animate-pulse bg-white rounded shadow-md p-4 w-full h-[114px] border border-gray-200">
//                 <div className="relative -top-2 h-20 bg-gray-300 rounded w-1/2"></div>
//                 <div className="relative top-3 h-10 bg-gray-300 rounded w-1/3"></div>
//               </div>
//             ) : (
//               <>
//                 <button
//                   disabled={sortNameCookie === "HSCS"}
//                   style={{
//                     border: "none",
//                     background: "transparent",
//                     padding: 0,
//                     width: "100%",
//                     cursor:
//                       sortNameCookie === "HSCS" ? "not-allowed" : "pointer",
//                   }}
//                 >
//                   <Link to="/staffbirthlist" className="no-underline">
//                     <Card
//                       title=" Birthdays"
//                       value={staffBirthday}
//                       color="#2196F3"
//                       icon={
//                         <div
//                           style={{
//                             width: 40,
//                             height: 40,
//                             backgroundColor: "white",
//                             borderRadius: "50%",
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                           }}
//                         >
//                           <FaBirthdayCake
//                             style={{ color: "#FF69B4", fontSize: 30 }}
//                           />
//                         </div>
//                       }
//                     />
//                   </Link>
//                 </button>
//               </>
//             )}

//             {/* For fee pending */}
//             {roleId === null ? (
//               <div className="flex justify-between animate-pulse bg-white rounded shadow-md p-4 w-full h-[114px] border border-gray-200">
//                 <div className="relative -top-2 h-20 bg-gray-300 rounded w-1/2"></div>
//                 <div className="relative top-3 h-10 bg-gray-300 rounded w-1/3"></div>
//               </div>
//             ) : (
//               <Link to="/feependinglist" className="no-underline">
//                 <Card
//                   title="Fee"
//                   value={collectedFee}
//                   valuePendingFee={pendingFee}
//                   color="#FF5733"
//                   icon={
//                     <div
//                       style={{
//                         width: 40,
//                         height: 40,
//                         backgroundColor: "white",
//                         borderRadius: "50%",
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                       }}
//                     >
//                       <HiCollection style={{ color: "green", fontSize: 30 }} />
//                     </div>
//                   }
//                 />
//               </Link>
//             )}

//             {/* Ticketling list, assessment, Approve lesson plane */}
//             {roleId === null ? (
//               // Skeleton card
//               <div className="flex justify-between animate-pulse bg-white rounded shadow-md p-4 w-full h-[114px] border border-gray-200">
//                 <div className="relative -top-2 h-20 bg-gray-300 rounded w-1/2"></div>
//                 <div className="relative top-3 h-10 bg-gray-300 rounded w-1/3"></div>
//               </div>
//             ) : (
//               // Approve Leave card for roleId "M"
//               <Link to="/approveLeavelist" className="no-underline">
//                 <Card
//                   // title="Approve Leave"
//                   title={
//                     <span style={{ fontSize: "12px" }}>Approve Leave</span>
//                   }
//                   value={approveLeaveCount}
//                   color="#FFC107"
//                   icon={
//                     <div
//                       style={{
//                         width: 40,
//                         height: 40,
//                         backgroundColor: "white",
//                         borderRadius: "50%",
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                       }}
//                     >
//                       <RiPassValidFill
//                         style={{ color: "#C03078", fontSize: 30 }}
//                       />
//                     </div>
//                   }
//                 />
//               </Link>
//             )}

//             {/* Approve lesson plane, Birthday, Leave */}
//             {roleId === null ? (
//               // Skeleton card
//               <div className="flex justify-between animate-pulse bg-white rounded shadow-md p-4 w-full h-[114px] border border-gray-200">
//                 <div className="relative -top-2 h-20 bg-gray-300 rounded w-1/2"></div>
//                 <div className="relative top-3 h-10 bg-gray-300 rounded w-1/3"></div>
//               </div>
//             ) : (
//               <Link to="/lessonPlanData" className="no-underline">
//                 <Card
//                   title="Lesson Plans"
//                   // value={approvedLessonPlaneCount}
//                   value={noOfTeachers}
//                   valuePendingFee={approvedLessonPlaneCount}
//                   valueAbsent={notSubmittedLessonPlanCount}
//                   valueTeacher={pendingApprovalLP}
//                   color="#4CAF50"
//                   icon={
//                     <div
//                       style={{
//                         width: 40,
//                         height: 40,
//                         backgroundColor: "white",
//                         borderRadius: "50%",
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                       }}
//                     >
//                       <FaClipboardCheck
//                         style={{ color: "green", fontSize: 24 }}
//                       />
//                     </div>
//                   }
//                 />
//               </Link>
//             )}

//             {/* Requirents Sttaff */}
//             {/* Pre-primary */}
//             <Link to="#" className="no-underline">
//               <Card
//                 title="Nursery"
//                 value={prePrimary.present}
//                 valueAbsent={prePrimary.absent}
//                 valuePendingFee={prePrimary.total}
//                 color="#4CAF50"
//                 icon={
//                   <div
//                     style={{
//                       width: 40,
//                       height: 40,
//                       backgroundColor: "white",
//                       borderRadius: "50%",
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                     }}
//                   >
//                     <GiTeacher style={{ color: "#8B5CF6", fontSize: 30 }} />
//                   </div>
//                 }
//               />
//             </Link>

//             {/* primary */}
//             <Link to="#" className="no-underline">
//               <Card
//                 title="KG"
//                 value={primary.present}
//                 valueAbsent={primary.absent}
//                 valuePendingFee={primary.total}
//                 color="#4CAF50"
//                 icon={
//                   <div
//                     style={{
//                       width: 40,
//                       height: 40,
//                       backgroundColor: "white",
//                       borderRadius: "50%",
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                     }}
//                   >
//                     <GiTeacher style={{ color: "#8B5CF6", fontSize: 30 }} />
//                   </div>
//                 }
//               />
//             </Link>

//             {/* School*/}
//             <Link to="#" className="no-underline">
//               <Card
//                 title="School"
//                 value={secondary.present}
//                 valueAbsent={secondary.absent}
//                 valuePendingFee={secondary.total}
//                 color="#4CAF50"
//                 icon={
//                   <div
//                     style={{
//                       width: 40,
//                       height: 40,
//                       backgroundColor: "white",
//                       borderRadius: "50%",
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                     }}
//                   >
//                     <GiTeacher style={{ color: "#8B5CF6", fontSize: 30 }} />
//                   </div>
//                 }
//               />
//             </Link>

//             {/* Caretaker */}
//             <Link to="#" className="no-underline">
//               <Card
//                 title="Caretaker"
//                 value={caretaker.present}
//                 valueAbsent={caretaker.absent}
//                 valuePendingFee={caretaker.total}
//                 color="#4CAF50"
//                 icon={
//                   <div
//                     style={{
//                       width: 40,
//                       height: 40,
//                       backgroundColor: "white",
//                       borderRadius: "50%",
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                     }}
//                   >
//                     <FaUserShield style={{ color: "#8B5CF6", fontSize: 30 }} />
//                   </div>
//                 }
//               />
//             </Link>
//           </div>
//         </div>

//         <div className="flex flex-col-reverse lg:flex-row items-start w-full gap-4 px-4 h-[400px]">
//           {/* LEFT SECTION – 79% */}
//           <div
//             className="w-full lg:w-[100%] h-full bg-slate-50 rounded-lg"
//             style={{
//               boxShadow:
//                 "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
//             }}
//           >
//             {roleId === null ? (
//               <div className="animate-pulse bg-white rounded shadow-md p-4 w-full h-[200px] border border-gray-200">
//                 <div className="h-6 bg-gray-300 rounded mb-4 w-1/3"></div>
//                 <div className="h-32 bg-gray-300 rounded"></div>
//               </div>
//             ) : (
//               // <StudentsChart />
//               <StudentAttendanceChart />
//               // <StudentAttendanceSACS />
//             )}
//           </div>
//         </div>

//         <div
//           style={{
//             width: "calc(100% - 50px)",
//             height: "350px",
//             // padding: "16px",
//             overflowY: "auto",
//             borderRadius: "12px",
//             backgroundColor: "#ffffff",
//             boxShadow: "0 4px 10px rgba(0, 0, 0, 0.08)",
//             margin: "25px 25px 0 25px",
//             boxSizing: "border-box",
//           }}
//         >
//           <EventCard />
//         </div>
//       </>
//     </>
//   );
// };

// export default PrincipalDashboardSACS;
// this is test apan ne commonapi  se kar dia hailekin fast nahi  hai

// import React, { Suspense } from "react";
// import { Link } from "react-router-dom";
// import {
//   FaUsersLine,
//   FaUserGroup,
//   FaUserShield,
// } from "react-icons/fa6";
// import {
//   FaBirthdayCake,
//   FaClipboardCheck,
// } from "react-icons/fa";
// import { HiCollection } from "react-icons/hi";
// import { RiPassValidFill } from "react-icons/ri";
// import { GiTeacher } from "react-icons/gi";

// import Card from "../common/Card.jsx";
// import CardStuStaf from "../common/CardStuStaf.jsx";
// import EventCard from "./EventCard.jsx";
// import StudentAttendanceChart from "./Charts/StudentAttendanceChart.jsx";

// const PrincipalDashboardSACS = ({ dashboard }) => {
//   /* ================= DEFAULT SAFE DATA ================= */
//   const defaultData = {
//     student: {
//       total: 0,
//       present: 0,
//       attendanceNotMarked: { notMarked: 0 },
//     },
//     staff: {
//       teachingStaff: 0,
//       non_teachingStaff: 0,
//       attendanceteachingstaff: 0,
//       attendancenonteachingstaff: 0,
//     },
//     staff_student_bday_count: { count: 0 },
//     fees_collection: {
//       "Collected Fees": 0,
//       "Pending Fees": 0,
//     },
//     approve_leave: { count: 0 },
//     lesson_plan_summary: {
//       totalNumberOfTeachers: 0,
//       lessonPlanSubmitted: 0,
//       lessonPlanNotSubmitted: 0,
//       pendingForApproval: 0,
//     },
//     "Nursery teachers": { total: 0, present: 0, absent: 0 },
//     "KG teachers": { total: 0, present: 0, absent: 0 },
//     "SACS teachers": { total: 0, present: 0, absent: 0 },
//     Caretakers: { total: 0, present: 0, absent: 0 },
//   };

//   const data = { ...defaultData, ...(dashboard?.data || {}) };

//   /* ================= ICON WRAPPER ================= */
//   const iconWrap = (icon) => (
//     <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
//       {icon}
//     </div>
//   );

//   return (
//     <>
//       {/* ================= TOP CARDS ================= */}
//       <div className="flex flex-col lg:flex-row gap-4 p-6">
//         <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

//           {/* STUDENTS */}
//           <Link to="/studentAbsent" className="no-underline block">
//             <CardStuStaf
//               title="Students"
//               TotalValue={data.student.total}
//               presentValue={data.student.present}
//               badge={data.student.attendanceNotMarked?.notMarked}
//               color="#4CAF50"
//               icon={iconWrap(<FaUsersLine className="text-violet-600 text-4xl" />)}
//             />
//           </Link>

//           {/* STAFF */}
//           <Link to="/todayStaffList" className="no-underline block">
//             <CardStuStaf
//               title="Staff"
//               TotalValue={
//                 data.staff.teachingStaff + data.staff.non_teachingStaff
//               }
//               presentValue={
//                 data.staff.attendanceteachingstaff +
//                 data.staff.attendancenonteachingstaff
//               }
//               color="#2196F3"
//               icon={iconWrap(<FaUserGroup className="text-cyan-500 text-4xl" />)}
//             />
//           </Link>

//           {/* BIRTHDAY */}
//           <Link to="/staffbirthlist" className="no-underline block">
//             <Card
//               title="Birthdays"
//               value={data.staff_student_bday_count.count}
//               color="#2196F3"
//               icon={iconWrap(<FaBirthdayCake className="text-pink-500 text-4xl" />)}
//             />
//           </Link>

//           {/* FEES */}
//           <Link to="/feependinglist" className="no-underline block">
//             <Card
//               title="Fee"
//               value={data.fees_collection["Collected Fees"]}
//               valuePendingFee={data.fees_collection["Pending Fees"]}
//               color="#FF5722"
//               icon={iconWrap(<HiCollection className="text-green-600 text-4xl" />)}
//             />
//           </Link>

//           {/* APPROVE LEAVE */}
//           <Link to="/approveLeavelist" className="no-underline block">
//             <Card
//               title="Approve Leave"
//               value={data.approve_leave.count}
//               color="#FFC107"
//               icon={iconWrap(
//                 <RiPassValidFill className="text-rose-600 text-4xl" />,
//               )}
//             />
//           </Link>

//           {/* LESSON PLAN */}
//           <Link to="/lessonPlanData" className="no-underline block">
//             <Card
//               title="Lesson Plans"
//               value={data.lesson_plan_summary.totalNumberOfTeachers}
//               valuePendingFee={data.lesson_plan_summary.lessonPlanSubmitted}
//               valueAbsent={data.lesson_plan_summary.lessonPlanNotSubmitted}
//               valueTeacher={data.lesson_plan_summary.pendingForApproval}
//               color="#4CAF50"
//               icon={iconWrap(
//                 <FaClipboardCheck className="text-green-600 text-4xl" />,
//               )}
//             />
//           </Link>

//           {/* NURSERY */}
//           <Card
//             title="Nursery"
//             value={data["Nursery teachers"].present}
//             valueAbsent={data["Nursery teachers"].absent}
//             valuePendingFee={data["Nursery teachers"].total}
//             color="#4CAF50"
//             icon={iconWrap(<GiTeacher className="text-purple-500 text-4xl" />)}
//           />

//           {/* KG */}
//           <Card
//             title="KG"
//             value={data["KG teachers"].present}
//             valueAbsent={data["KG teachers"].absent}
//             valuePendingFee={data["KG teachers"].total}
//             color="#4CAF50"
//             icon={iconWrap(<GiTeacher className="text-purple-500 text-4xl" />)}
//           />

//           {/* SCHOOL */}
//           <Card
//             title="School"
//             value={data["SACS teachers"].present}
//             valueAbsent={data["SACS teachers"].absent}
//             valuePendingFee={data["SACS teachers"].total}
//             color="#4CAF50"
//             icon={iconWrap(<GiTeacher className="text-purple-500 text-4xl" />)}
//           />

//           {/* CARETAKER */}
//           <Card
//             title="Caretaker"
//             value={data.Caretakers.present}
//             valueAbsent={data.Caretakers.absent}
//             valuePendingFee={data.Caretakers.total}
//             color="#4CAF50"
//             icon={iconWrap(
//               <FaUserShield className="text-purple-500 text-4xl" />,
//             )}
//           />
//         </div>
//       </div>
//       <div className="h-80 flex flex-col-reverse lg:flex-row gap-4 px-4">
//         <div className="w-full lg:w-2/3 bg-slate-50 rounded-lg shadow-md">
//           <Suspense fallback={<div className="p-6">Loading chart...</div>}>
//             <StudentAttendanceChart />
//           </Suspense>
//         </div>

//         <div className=" w-full lg:w-1/3 bg-slate-50  overflow-y-auto rounded-lg shadow-md">
//           <EventCard />
//         </div>
//       </div>
//       {/* ================= CHART ================= */}
//       {/* <div className="mx-6 h-[400px] bg-slate-50 rounded-lg shadow">

//         <StudentAttendanceChart />

//       </div>

//       <div className="m-6 bg-white rounded-lg shadow-md h-[350px] overflow-y-auto">
//         <EventCard />
//       </div> */}
//     </>
//   );
// };

// export default PrincipalDashboardSACS;

// try new oneimport React, { Suspense, useMemo, lazy } from "react";
import React, { Suspense, useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";

import {
  FaUsersLine,
  FaUserGroup,
  FaUserShield,
} from "react-icons/fa6";
import { FaBirthdayCake, FaClipboardCheck } from "react-icons/fa";
import { HiCollection } from "react-icons/hi";
import { RiPassValidFill } from "react-icons/ri";
import { GiTeacher } from "react-icons/gi";

import Card from "../common/Card.jsx";
import CardStuStaf from "../common/CardStuStaf.jsx";
import EventCard from "./EventCard.jsx";
import StudentAttendanceChart from "./Charts/StudentAttendanceChart.jsx";
import SkeletonDashboard from "./ProperDashbord/SkeletonDashboard.jsx";

/* ================= RENDER GATE ================= */
const RenderGate = ({ ready, children }) => {
  return (
    <div style={{ visibility: ready ? "visible" : "hidden" }}>
      {children}
    </div>
  );
};

/* ================= STATIC ICONS ================= */
const ICONS = {
  students: <FaUsersLine className="text-violet-600 text-4xl" />,
  staff: <FaUserGroup className="text-cyan-500 text-4xl" />,
  birthday: <FaBirthdayCake className="text-pink-500 text-4xl" />,
  fee: <HiCollection className="text-green-600 text-4xl" />,
  leave: <RiPassValidFill className="text-rose-600 text-4xl" />,
  lesson: <FaClipboardCheck className="text-green-600 text-4xl" />,
  teacher: <GiTeacher className="text-purple-500 text-4xl" />,
  caretaker: <FaUserShield className="text-purple-500 text-4xl" />,
};

const IconWrap = React.memo(({ icon }) => (
  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
    {icon}
  </div>
));

/* ================= MAIN COMPONENT ================= */
const PrincipalDashboardSACS = ({ dashboard, roleId, sortName }) => {
  const [ready, setReady] = useState(false);

  /* 🛑 Skeleton ONLY */
  if (!dashboard) {
    return <SkeletonDashboard />;
  }

  /* 🧠 Wait till browser finishes full layout */
  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setReady(true);
      });
    });
  }, []);

  const d = dashboard.data || {};

  /* ================= ALL CARDS (ATOMIC BUILD) ================= */
  const cards = useMemo(() => [
    {
      link: "/studentAbsent",
      node: (
        <CardStuStaf
          title="Students"
          TotalValue={d.student?.total || 0}
          presentValue={d.student?.present || 0}
          roleId={roleId}
          sortName={sortName}
          badge={d.student?.attendanceNotMarked?.notMarked || 0}
          icon={<IconWrap icon={ICONS.students} />}
        />
      ),
    },
    {
      link: "/todayStaffList",
      node: (
        <CardStuStaf
          title="Staff"
          TotalValue={(d.staff?.teachingStaff || 0) + (d.staff?.non_teachingStaff || 0)}
          presentValue={(d.staff?.attendanceteachingstaff || 0) + (d.staff?.attendancenonteachingstaff || 0)}
          roleId={roleId}
          sortName={sortName}
          icon={<IconWrap icon={ICONS.staff} />}
        />
      ),
    },
    {
      link: "/staffbirthlist",
      node: (
        <Card
          title="Birthdays"
          value={d.staff_student_bday_count?.count || 0}
          roleId={roleId}
          sortName={sortName}
          icon={<IconWrap icon={ICONS.birthday} />}
        />
      ),
    },
    {
      link: "/feependinglist",
      node: (
        <Card
          title="Fee"
          value={d.fees_collection?.["Collected Fees"] || 0}
          valuePendingFee={d.fees_collection?.["Pending Fees"] || 0}
          roleId={roleId}
          sortName={sortName}
          icon={<IconWrap icon={ICONS.fee} />}
        />
      ),
    },
    {
      link: "/approveLeavelist",
      node: (
        <Card
          title="Approve Leave"
          value={d.approve_leave?.count || 0}
          roleId={roleId}
          sortName={sortName}
          icon={<IconWrap icon={ICONS.leave} />}
        />
      ),
    },
    {
      link: "/lessonPlanData",
      node: (
        <Card
          title="Lesson Plans"
          value={d.lesson_plan_summary?.totalNumberOfTeachers || 0}
          valuePendingFee={d.lesson_plan_summary?.lessonPlanSubmitted || 0}
          valueAbsent={d.lesson_plan_summary?.lessonPlanNotSubmitted || 0}
          valueTeacher={d.lesson_plan_summary?.pendingForApproval || 0}
          roleId={roleId}
          sortName={sortName}
          icon={<IconWrap icon={ICONS.lesson} />}
        />
      ),
    },
    {
      node: (
        <Card
          title="Nursery"
          value={d["Nursery teachers"]?.present || 0}
          valueAbsent={d["Nursery teachers"]?.absent || 0}
          valuePendingFee={d["Nursery teachers"]?.total || 0}
          roleId={roleId}
          sortName={sortName}
          icon={<IconWrap icon={ICONS.teacher} />}
        />
      ),
    },
    {
      node: (
        <Card
          title="KG"
          value={d["KG teachers"]?.present || 0}
          valueAbsent={d["KG teachers"]?.absent || 0}
          valuePendingFee={d["KG teachers"]?.total || 0}
          roleId={roleId}
          sortName={sortName}
          icon={<IconWrap icon={ICONS.teacher} />}
        />
      ),
    },
    {
      node: (
        <Card
          title="School"
          value={d["SACS teachers"]?.present || 0}
          valueAbsent={d["SACS teachers"]?.absent || 0}
          valuePendingFee={d["SACS teachers"]?.total || 0}
          roleId={roleId}
          sortName={sortName}
          icon={<IconWrap icon={ICONS.teacher} />}
        />
      ),
    },
    {
      node: (
        <Card
          title="Caretaker"
          value={d.Caretakers?.present || 0}
          valueAbsent={d.Caretakers?.absent || 0}
          valuePendingFee={d.Caretakers?.total || 0}
          roleId={roleId}
          sortName={sortName}
          icon={<IconWrap icon={ICONS.caretaker} />}
        />
      ),
    },
  ], [dashboard]);

  /* ================= RENDER ================= */
  return (
    <RenderGate ready={ready}>
      {/* ===== CARDS ===== */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {cards.map((item, i) =>
            item.link ? (
              <Link key={i} to={item.link} className="no-underline block">
                {item.node}
              </Link>
            ) : (
              <div key={i}>{item.node}</div>
            )
          )}
        </div>
      </div>

      {/* ===== CHART + EVENTS ===== */}
      <div className="h-80 flex flex-col-reverse lg:flex-row gap-4 px-4">
        <div className="w-full lg:w-2/3 bg-slate-50 rounded-lg shadow-md">
          <Suspense fallback={<div className="h-full bg-gray-200 animate-pulse" />}>
            <StudentAttendanceChart />
          </Suspense>
        </div>

        <div className="w-full lg:w-1/3 bg-slate-50 overflow-y-auto rounded-lg shadow-md">
          <EventCard />
        </div>
      </div>
    </RenderGate>
  );
};

export default PrincipalDashboardSACS;
