// import { FaUserGroup, FaUsersLine } from "react-icons/fa6";
// import Card from "../common/Card.jsx";
// import EventCard from "./EventCard.jsx";
// import CardStuStaf from "../common/CardStuStaf.jsx";
// import StudentsChart from "../Dashbord/Charts/StudentsChart.jsx";
// import {
//     FaBirthdayCake,
//     FaCalendarAlt,
//     FaClipboardCheck,
// } from "react-icons/fa";
// import { HiCollection } from "react-icons/hi";
// import { IoTicket } from "react-icons/io5";
// import NoticeBord from "./NoticeBord.jsx";
// import axios from "axios";
// import { useEffect, useState } from "react";
// import HouseStudentChart from "./Charts/HouseStudentChart.jsx";
// import TableFeeCollect from "./TableFeeCollect.jsx";
// import { Link, useNavigate } from "react-router-dom";
// import LoadingSpinner from "../common/LoadingSpinner.jsx";
// import { ToastContainer, toast } from "react-toastify";
// import { RiPassValidFill } from "react-icons/ri";
// import { GiTeacher } from "react-icons/gi";
// import { TfiWrite } from "react-icons/tfi";
// import { MdAssessment } from "react-icons/md";
// import ClassWiseAcademicPerformance from "./ClassWiseAcademicPerformance.jsx";
// import TimeTableForTeacherDashbord from "./TimeTableForTeacherDashbord.jsx";
// import TicketForDashboard from "./TicketForDashboard.jsx";
// import PrincipalDashboardSACS from "./PrincipalDashboardSACS.jsx";

// import { MdOutlinePayments } from "react-icons/md";
// import { MdOutlineWarningAmber } from "react-icons/md";
// import { HiOutlineDocumentText } from "react-icons/hi";
// import { MdOutlineAssignment } from "react-icons/md";
// import TodoListandRemainders from "./TodoListandRemainders.jsx";

// const DashboardContent = () => {
//     const API_URL = import.meta.env.VITE_API_URL; // url for host

//     const LMS_URL = "https://ednova.evolvu.in";
//     const navigate = useNavigate();
//     const [studentData, setStudentData] = useState({
//         total: 0,
//         present: 0,
//     });
//     const [sortNameCookie, setSortNameCookie] = useState("");

//     const tokenToLMS = localStorage.getItem("authToken");
//     console.log("TOken to lms", tokenToLMS);


//     const goToLMS = async () => {
//         try {
//             const schoolToken = localStorage.getItem("authToken");

//             if (!schoolToken) {
//                 alert("Please login first");
//                 return;
//             }

//             console.log("🔐 Initiating SSO login...");

//             const response = await axios.post(
//                 `${LMS_URL}/sso/api/school/lms-sso`,
//                 {},
//                 {
//                     headers: {
//                         Authorization: `Bearer ${schoolToken}`, // ✅ FIXED
//                         "Content-Type": "application/json",
//                     },
//                     withCredentials: true,
//                 },
//             );

//             console.log("✅ SSO Response:", response.data);

//             if (response.data?.success && response.data?.lms_url) {
//                 console.log("🚀 Redirecting to LMS...");
//                 window.location.href = response.data.lms_url; // ✅ BEST
//             } else {
//                 alert("Login failed. Invalid response from LMS.");
//             }
//         } catch (error) {
//             console.error("❌ SSO failed:", error.response?.data || error.message);

//             if (error.response?.status === 403) {
//                 alert("Authentication failed. Please login again.");
//             } else {
//                 alert("Connection error. Please try again later.");
//             }
//         }
//     };

//     const [staffData, setStaffData] = useState({
//         teachingStaff: "",
//         nonTeachingStaff: "",
//     });
//     const [staffBirthday, setStaffBirthday] = useState("");
//     const [ticketCount, setTicketCount] = useState("");
//     const [approveLeaveCount, setApproveLeaveCount] = useState("");
//     const [pendingFee, setPendingFee] = useState("");
//     const [collectedFee, setCollectedFee] = useState("");
//     const [approvedLessonPlaneCount, setApprovedLessonPlaneCount] = useState("");
//     const [error, setError] = useState(null);
//     const [roleId, setRoleId] = useState(null);
//     const [regId, setRegId] = useState(null);
//     const [teacherCardsData, setTeachersCardsData] = useState([]);
//     const [birthdayCardT, setBirthdayCardT] = useState("");
//     const [homeworkCardT, setHomeworkCardT] = useState("");
//     // const [studentCardT, setStudentCardT] = useState("");
//     const [studentCardT, setStudentCardT] = useState({
//         total: 0,
//         present: 0,
//     });
//     const [pendingStudentFeeT, setPendingStudentFeeT] = useState("");
//     const [pendingStudentCount, setPendingStudentCount] = useState("");

//     const [markAbsentees, setMarkAbsentees] = useState("");
//     const [classTeacher, setClassTeacher] = useState([]);
//     const [isClassTeacher, setIsClassTeacher] = useState("");
//     const [substituteCT, setSubstituteCT] = useState("");
//     const [loading, setLoading] = useState(true);
//     const comingSoonValue = "Coming Soon";

//     useEffect(() => {
//         fetchRoleId();
//     }, []);

//     useEffect(() => {
//         if (!roleId || !sortNameCookie || !regId) return;

//         if (regId) {
//             fetchClassTeacherData();
//         }

//         if (roleId === "T") {
//             fetchTeachersCardData();
//         } else {
//             fetchData();
//         }
//     }, [roleId, sortNameCookie, regId]);

//     const isSACSManagerDashboard = sortNameCookie === "SACS" && roleId === "M";

//     const fetchRoleId = async () => {
//         setLoading(true);
//         const token = localStorage.getItem("authToken");
//         if (!token) {
//             toast.error("Authentication token not found. Please login again");
//             navigate("/");
//             return;
//         }

//         try {
//             const response = await axios.get(`${API_URL}/api/sessionData`, {
//                 headers: { Authorization: `Bearer ${token}` },
//             });

//             const roleId = response?.data?.user?.role_id;
//             const regId = response?.data?.user?.reg_id;

//             setRegId(regId);
//             setSortNameCookie(response?.data?.custom_claims?.short_name);
//             if (roleId) setRoleId(roleId);
//         } catch (error) {
//             console.error("Failed to fetch session data:", error);
//         } finally {
//             setLoading(false); // stop loading after API
//         }
//     };

//     const fetchData = async () => {
//         try {
//             const token = localStorage.getItem("authToken");
//             const roleId = localStorage.getItem("roleId");
//             // console.log("**** role ID******", roleId);

//             if (!token) {
//                 toast.error("Authentication token not found Please login again");
//                 navigate("/");
//                 return;
//             }

//             // Fetch student data
//             const studentResponse = await axios.get(`${API_URL}/api/studentss`, {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//             });

//             setStudentData({
//                 total: studentResponse.data.count,
//                 present: studentResponse.data.present,
//             });

//             // Fetch staff data
//             const staffResponse = await axios.get(`${API_URL}/api/staff`, {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//             });
//             // console.log("reponse of the staffAPI", staffResponse);
//             setStaffData({
//                 teachingStaff: staffResponse?.data?.teachingStaff,
//                 attendanceteachingstaff: staffResponse?.data?.attendanceteachingstaff,
//                 nonTeachingStaff: staffResponse?.data?.non_teachingStaff,
//                 attendancenonteachingstaff:
//                     staffResponse?.data?.attendancenonteachingstaff,
//             });
//             // Fetch Tickiting count values

//             const responseTickingCount = await axios.get(
//                 `${API_URL}/api/ticketcount`,
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`,

//                         "Role-Id": roleId, // add roleId for different role
//                     },
//                 },
//             );
//             setTicketCount(responseTickingCount.data.count);
//             // Fetch the data of approveLeave count
//             const responseApproveLeaveCount = await axios.get(
//                 `${API_URL}/api/get_count_of_approveleave`,
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                     },
//                 },
//             );
//             setApproveLeaveCount(responseApproveLeaveCount?.data?.data);
//             // Fetch Pending Fee Records counts
//             const pendingFeeCount = await axios.get(`${API_URL}/api/feecollection`, {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//             });
//             // setPendingFee(pendingFeeCount.data.pendingFee);
//             setCollectedFee(pendingFeeCount.data["Collected Fees"]);
//             setPendingFee(pendingFeeCount.data["Pending Fees"]);
//             // console.log("pendingFee count is here******", pendingFeeCount.data);
//             // Fetch birthday Count
//             const Birthdaycount = await axios.get(
//                 `${API_URL}/api/staffbirthdaycount`,
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                     },
//                 },
//             );
//             // console.log(
//             //   "the birthday count and it's value is=",
//             //   Birthdaycount.data.count,
//             // );
//             setStaffBirthday(Birthdaycount.data.count);

//             // fetch Approved lesson plane count
//             const ApprovedLessonPlane = await axios.get(
//                 `${API_URL}/api/get_count_non_approved_lesson_plan`,
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                     },
//                 },
//             );
//             setApprovedLessonPlaneCount(ApprovedLessonPlane.data.data);
//             // console.log("pendingFee count is here******", pendingFeeCount.data.data);

//             const markAbsenttesCount = await axios.get(
//                 `${API_URL}/api/attendance/notmarked/count`,
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                     },
//                 },
//             );
//             const markAbsenteesData =
//                 markAbsenttesCount?.data?.AttendanceNotMarkedCount;

//             console.log("mark absettes", markAbsenteesData);
//             setMarkAbsentees(markAbsenteesData);
//         } catch (error) {
//             setError(error.message);
//             console.error("Error fetching data:", error);
//         }
//     };

//     const fetchClassTeacherData = async () => {
//         setLoading(true);
//         const token = localStorage.getItem("authToken");

//         try {
//             const response = await axios.get(
//                 `${API_URL}/api/get_classes_of_classteacher?teacher_id=${regId}`,
//                 {
//                     headers: { Authorization: `Bearer ${token}` },
//                 },
//             );

//             const classData = response.data.data;
//             console.log("class teacher", classData);

//             setClassTeacher(classData);

//             // Check if the teacher is a class teacher
//             const isClassTeacherFlag = classData.some(
//                 (cls) => cls.is_class_teacher === 1,
//             )
//                 ? 1
//                 : 0; // store as 1 or 0
//             setIsClassTeacher(isClassTeacherFlag);

//             setLoading(false);
//         } catch (err) {
//             console.error("Error fetching class teacher data:", err);
//             setLoading(false);
//         }
//     };

//     const fetchTeachersCardData = async () => {
//         const token = localStorage.getItem("authToken");

//         if (!token) {
//             toast.error("Authentication token not found Please login again");
//             navigate("/");
//             return;
//         }

//         try {
//             const response = await axios.get(
//                 `${API_URL}/api/teachers/${regId}/dashboard/summary`,
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                     },
//                 },
//             );

//             const teacherCards = response?.data?.data;
//             // console.log("Teacher card api..", teacherCards);
//             setTeachersCardsData(teacherCards);

//             const studentCard = response?.data?.data?.studentCard;
//             // console.log("student T card api..", studentCard);
//             setStudentCardT({
//                 total: studentCard?.totalStudents ?? 0,
//                 present: studentCard?.totalStudentsPresentToday ?? 0,
//             });

//             const homeworkCard = response?.data?.data?.homeworkCard;
//             // console.log("homework T card api..", homeworkCard);
//             setHomeworkCardT({
//                 submissiondate: homeworkCard?.countOfHomeworksDueToday ?? 0,
//             });

//             const birthdayCard = response?.data?.data?.birthDayCard;
//             // console.log("birthday T card api..", birthdayCard);
//             setBirthdayCardT({
//                 birthdaycount: birthdayCard?.countOfBirthdaysToday ?? 0,
//             });

//             const defaulterCard = response.data?.data?.defaulterCount;
//             // console.log("defaulter T card api..", defaulterCard);
//             setPendingStudentCount(defaulterCard?.totalNumberOfDefaulters);
//             setPendingStudentFeeT(defaulterCard?.totalPendingAmount);

//             const substituteClassTeacher = response?.data?.data?.substituteCount;
//             setSubstituteCT(substituteClassTeacher);
//         } catch (error) {
//             console.error("Failed to fetch session data:", error);
//         }
//     };

//     return (
//         <>
//             {roleId === "M" && sortNameCookie === "SACS" && (
//                 <PrincipalDashboardSACS />
//             )}

//             {["A", "P", "M"].includes(roleId) &&
//                 !(roleId === "M" && sortNameCookie === "SACS") && (
//                     <>
//                         <ToastContainer />
//                         <div className="flex flex-col lg:flex-row items-start justify-between w-full gap-4 p-6 ">
//                             <div className="w-full lg:w-2/3  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                                 {/* <Link to="/studentAbsent" className="no-underline">
//                     <CardStuStaf
//                       title="Student"
//                       roleId={roleId}
//                       TotalValue={
//                         roleId === "T" ? studentCardT?.total : studentData?.total
//                       }
//                       presentValue={
//                         roleId === "T"
//                           ? studentCardT?.present
//                           : studentData?.present
//                       }
//                       color="#4CAF50"
//                       icon={
//                         <FaUsersLine
//                           style={{
//                             color: "violet",
//                             backgroundColor: "white",
//                             padding: "10px",
//                             borderRadius: "50%",
//                           }}
//                         />
//                       }
//                     />
//                   </Link> */}
//                                 <Link to="/studentAbsent" className="no-underline">
//                                     <CardStuStaf
//                                         title="Student"
//                                         roleId={roleId}
//                                         TotalValue={
//                                             roleId === "T" ? studentCardT?.total : studentData?.total
//                                         }
//                                         presentValue={
//                                             roleId === "T"
//                                                 ? studentCardT?.present
//                                                 : studentData?.present
//                                         }
//                                         badge={markAbsentees} // 👈 badge value
//                                         color="#4CAF50"
//                                         icon={
//                                             <FaUsersLine
//                                                 style={{
//                                                     color: "violet",
//                                                     backgroundColor: "white",
//                                                     padding: "10px",
//                                                     borderRadius: "50%",
//                                                 }}
//                                             />
//                                         }
//                                     />
//                                 </Link>

//                                 {roleId === null ? (
//                                     // Skeleton card
//                                     <div className="flex justify-between animate-pulse bg-white rounded shadow-md p-4 w-full h-[114px] border border-gray-200">
//                                         <div className="relative -top-2 h-20 bg-gray-300 rounded w-1/2"></div>
//                                         <div className="relative top-3 h-10 bg-gray-300 rounded w-1/3"></div>
//                                     </div>
//                                 ) : roleId === "T" ? (
//                                     // Approve Leave card for roleId "M"
//                                     <Link to="#" className="no-underline">
//                                         <Card
//                                             title="Substitution Class"
//                                             roleId={roleId} // Pass the roleId here
//                                             value={" "}
//                                             color="#2196F3"
//                                             icon={
//                                                 <HiOutlineDocumentText
//                                                     style={{
//                                                         color: "#FF6B6B",
//                                                         backgroundColor: "white",
//                                                         padding: "11px",
//                                                     }}
//                                                 />
//                                             }
//                                         />
//                                     </Link>
//                                 ) : (
//                                     <>
//                                         <button
//                                             disabled={sortNameCookie === "HSCS"}
//                                             style={{
//                                                 border: "none",
//                                                 background: "transparent",
//                                                 padding: 0,
//                                                 width: "100%",
//                                                 cursor:
//                                                     sortNameCookie === "HSCS" ? "not-allowed" : "pointer",
//                                             }}
//                                         >
//                                             <Link
//                                                 to={sortNameCookie === "HSCS" ? "#" : "/teacherList"}
//                                                 className="no-underline"
//                                                 style={
//                                                     sortNameCookie === "HSCS"
//                                                         ? { pointerEvents: "none" } // No opacity (as you requested)
//                                                         : {}
//                                                 }
//                                             >
//                                                 <CardStuStaf
//                                                     title="Teachers"
//                                                     TotalValue={staffData.teachingStaff}
//                                                     presentValue={staffData?.attendanceteachingstaff}
//                                                     color="#2196F3"
//                                                     icon={
//                                                         <FaUserGroup
//                                                             style={{
//                                                                 color: "#00FFFF",
//                                                                 backgroundColor: "white",
//                                                                 padding: "10px",
//                                                                 borderRadius: "50%",
//                                                             }}
//                                                         />
//                                                     }
//                                                     disableLoader={sortNameCookie === "HSCS"} // 👈 ADD THIS
//                                                 />
//                                             </Link>
//                                         </button>
//                                     </>
//                                 )}

//                                 {/* for non teaching staff and home work */}
//                                 {roleId === null ? (
//                                     // Skeleton card
//                                     <div className="flex justify-between animate-pulse bg-white rounded shadow-md p-4 w-full h-[114px] border border-gray-200">
//                                         <div className="relative -top-2 h-20 bg-gray-300 rounded w-1/2"></div>
//                                         <div className="relative top-3 h-10 bg-gray-300 rounded w-1/3"></div>
//                                     </div>
//                                 ) : roleId === "T" ? (
//                                     // Approve Leave card for roleId "M"
//                                     <Link
//                                         to="/homeworkNotSubmitedStudent"
//                                         className="no-underline"
//                                     >
//                                         <Card
//                                             title="Homework"
//                                             value={homeworkCardT.submissiondate}
//                                             color="#FF9800"
//                                             icon={
//                                                 <TfiWrite
//                                                     style={{
//                                                         color: "#2196F3",
//                                                         backgroundColor: "white",
//                                                         padding: "13px",
//                                                     }}
//                                                 />
//                                             }
//                                         />
//                                     </Link>
//                                 ) : (
//                                     <>
//                                         <button
//                                             disabled={sortNameCookie === "HSCS"}
//                                             style={{
//                                                 border: "none",
//                                                 background: "transparent",
//                                                 padding: 0,
//                                                 width: "100%",
//                                                 cursor:
//                                                     sortNameCookie === "HSCS" ? "not-allowed" : "pointer",
//                                             }}
//                                         >
//                                             <Link
//                                                 to={
//                                                     sortNameCookie === "HSCS" ? "#" : "/nonTeachingStaff"
//                                                 }
//                                                 className="no-underline"
//                                                 style={
//                                                     sortNameCookie === "HSCS"
//                                                         ? { pointerEvents: "none" }
//                                                         : {}
//                                                 }
//                                             >
//                                                 <CardStuStaf
//                                                     title="Non-Teaching Staff"
//                                                     TotalValue={staffData.nonTeachingStaff}
//                                                     presentValue={staffData?.attendancenonteachingstaff}
//                                                     color="#2196F3"
//                                                     icon={
//                                                         <FaUserGroup
//                                                             style={{
//                                                                 color: "#A287F3",
//                                                                 backgroundColor: "white",
//                                                                 padding: "10px",
//                                                                 borderRadius: "50%",
//                                                             }}
//                                                         />
//                                                     }
//                                                     disableLoader={sortNameCookie === "HSCS"} // 👈 ADD THIS
//                                                 />
//                                             </Link>
//                                         </button>
//                                     </>
//                                 )}

//                                 {/* For fee pending */}
//                                 {roleId === null ? (
//                                     // Skeleton card
//                                     <div className="flex justify-between animate-pulse bg-white rounded shadow-md p-4 w-full h-[114px] border border-gray-200">
//                                         <div className="relative -top-2 h-20 bg-gray-300 rounded w-1/2"></div>
//                                         <div className="relative top-3 h-10 bg-gray-300 rounded w-1/3"></div>
//                                     </div>
//                                 ) : roleId === "T" ? (
//                                     // Approve Leave card for roleId "M"
//                                     <Link to="/defaulterStudentList" className="no-underline">
//                                         <Card
//                                             title="Defaulter List"
//                                             value={pendingStudentCount}
//                                             valuePendingFee={pendingStudentFeeT}
//                                             color="#FF5733"
//                                             icon={
//                                                 <HiCollection
//                                                     style={{
//                                                         color: "green",
//                                                         backgroundColor: "white",
//                                                         padding: "10px",
//                                                         borderRadius: "50%",
//                                                         // width: "80%",
//                                                         // height: "80%",
//                                                     }}
//                                                 />
//                                             }
//                                         />
//                                     </Link>
//                                 ) : (
//                                     <Link to="/feependinglist" className="no-underline">
//                                         <Card
//                                             title="Fee"
//                                             value={collectedFee}
//                                             valuePendingFee={pendingFee}
//                                             color="#FF5733"
//                                             icon={
//                                                 <HiCollection
//                                                     style={{
//                                                         color: "green",
//                                                         backgroundColor: "white",
//                                                         padding: "10px",
//                                                         borderRadius: "50%",
//                                                     }}
//                                                 />
//                                             }
//                                         />
//                                     </Link>
//                                 )}
//                                 {/* Ticketling list, assessment, Approve lesson plane */}
//                                 {roleId === null ? (
//                                     // Skeleton card
//                                     <div className="flex justify-between animate-pulse bg-white rounded shadow-md p-4 w-full h-[114px] border border-gray-200">
//                                         <div className="relative -top-2 h-20 bg-gray-300 rounded w-1/2"></div>
//                                         <div className="relative top-3 h-10 bg-gray-300 rounded w-1/3"></div>
//                                     </div>
//                                 ) : roleId === "M" ? (
//                                     // Approve Leave card for roleId "M"
//                                     <Link to="/approveLeavelist" className="no-underline">
//                                         <Card
//                                             title="Approve Leave"
//                                             value={approveLeaveCount}
//                                             color="#FFC107"
//                                             icon={
//                                                 <RiPassValidFill
//                                                     style={{
//                                                         color: "#C03078",
//                                                         backgroundColor: "white",
//                                                         padding: "10px",
//                                                         borderRadius: "50%",
//                                                     }}
//                                                 />
//                                             }
//                                         />
//                                     </Link>
//                                 ) : roleId === "T" ? (
//                                     // Assessment card for roleId "T"
//                                     <Link to="#" className="no-underline">
//                                         <Card
//                                             title="Assessment"
//                                             value=" "
//                                             color="#4CAF50"
//                                             icon={
//                                                 <MdAssessment
//                                                     style={{
//                                                         color: "#C03078",
//                                                         backgroundColor: "white",
//                                                         padding: "10px",
//                                                     }}
//                                                 />
//                                             }
//                                         />
//                                     </Link>
//                                 ) : (
//                                     // Ticketing Module card for all other roles
//                                     <Link to="/ticketList" className="no-underline">
//                                         <Card
//                                             title="Ticketing Module"
//                                             value={ticketCount}
//                                             color="#FFC107"
//                                             icon={
//                                                 <IoTicket
//                                                     style={{
//                                                         color: "#30C790",
//                                                         backgroundColor: "white",
//                                                         padding: "10px",
//                                                         borderRadius: "50%",
//                                                     }}
//                                                 />
//                                             }
//                                         />
//                                     </Link>
//                                 )}

//                                 {/* Approve lesson plane, Birthday, Leave */}
//                                 {roleId === null ? (
//                                     // Skeleton card
//                                     <div className="flex justify-between animate-pulse bg-white rounded shadow-md p-4 w-full h-[114px] border border-gray-200">
//                                         <div className="relative -top-2 h-20 bg-gray-300 rounded w-1/2"></div>
//                                         <div className="relative top-3 h-10 bg-gray-300 rounded w-1/3"></div>
//                                     </div>
//                                 ) : roleId === "M" ? (
//                                     <Link to="#" className="no-underline">
//                                         <Card
//                                             title="Approve Lesson Plans"
//                                             value={approvedLessonPlaneCount}
//                                             spanLabel="Pending"
//                                             color="#4CAF50"
//                                             icon={
//                                                 <FaClipboardCheck
//                                                     style={{
//                                                         color: "green",
//                                                         backgroundColor: "white",
//                                                         padding: "10px",
//                                                         borderRadius: "50%",
//                                                     }}
//                                                 />
//                                             }
//                                         />
//                                     </Link>
//                                 ) : roleId === "T" ? (
//                                     <Link to="/todayStudentBirthday" className="no-underline">
//                                         <Card
//                                             title="Birthdays"
//                                             value={birthdayCardT.birthdaycount}
//                                             color="#2196F3"
//                                             icon={
//                                                 <FaBirthdayCake
//                                                     style={{
//                                                         color: "cyan",
//                                                         backgroundColor: "white",
//                                                         padding: "10px",
//                                                         borderRadius: "50%",
//                                                     }}
//                                                 />
//                                             }
//                                         />
//                                     </Link>
//                                 ) : (
//                                     <Link to="/staffbirthlist" className="no-underline">
//                                         <Card
//                                             title="Birthdays"
//                                             value={staffBirthday}
//                                             color="#2196F3"
//                                             icon={
//                                                 <FaBirthdayCake
//                                                     style={{
//                                                         color: "cyan",
//                                                         backgroundColor: "white",
//                                                         padding: "10px",
//                                                         borderRadius: "50%",
//                                                     }}
//                                                 />
//                                             }
//                                         />
//                                     </Link>
//                                 )}
//                             </div>

//                             <div className="w-full  lg:w-[33%] lg:h-full sm:h-3/4  bg-slate-100 overflow-y-hidden rounded-lg shadow-md ">
//                                 <EventCard />
//                             </div>
//                         </div>

//                         <div className="flex flex-col-reverse lg:flex-row items-start justify-between w-full  gap-4  h-full lg:h-1/2  px-4 sm:flex-col-reverse ">
//                             <div
//                                 className="w-full lg:w-[79%]  gap-y-3 gap-x-3 h-full bg-slate-50 rounded-lg lg:h-full sm:h-3/4"
//                                 // className="w-full lg:w-2/3 gap-y-3 gap-x-3 h-full bg-slate-50 rounded-lg lg:h-full sm:h-1/2"
//                                 style={{
//                                     boxShadow:
//                                         "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
//                                 }}
//                             >
//                                 {roleId === null ? (
//                                     <div className="animate-pulse bg-white rounded shadow-md p-4 w-full h-[200px] border border-gray-200">
//                                         <div className="h-6 bg-gray-300 rounded mb-4 w-1/3"></div>
//                                         <div className="h-32 bg-gray-300 rounded"></div>
//                                     </div>
//                                 ) : roleId === "T" ? (
//                                     <TimeTableForTeacherDashbord />
//                                 ) : (
//                                     <StudentsChart />
//                                 )}
//                             </div>
//                             <div
//                                 className="w-full lg:w-[39%] border-2 border-solid   bg-slate-50 rounded-lg  h-3/4 lg:h-full  "
//                                 style={{
//                                     boxShadow:
//                                         "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
//                                 }}
//                             >
//                                 {roleId === "T" ? <TodoListandRemainders /> : <NoticeBord />}
//                             </div>
//                         </div>

//                         {/* this is extra layout */}
//                         <div className="flex flex-col-reverse lg:flex-row items-start justify-between w-full   gap-4 px-4 sm:flex-col-reverse mt-6">
//                             <div
//                                 className="w-full lg:w-[29%] bg-slate-50 rounded-lg h-3/4"
//                                 style={{
//                                     boxShadow:
//                                         "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
//                                 }}
//                             >
//                                 {roleId === null ? (
//                                     // Skeleton card
//                                     <div className="flex justify-between animate-pulse bg-white rounded shadow-md p-4 w-full h-[114px] border border-gray-200">
//                                         <div className="relative -top-2 h-20 bg-gray-300 rounded w-1/2"></div>
//                                         <div className="relative top-3 h-10 bg-gray-300 rounded w-1/3"></div>
//                                     </div>
//                                 ) : roleId === "T" ? (
//                                     // Show Ticket component for Teacher
//                                     <TicketForDashboard />
//                                 ) : roleId !== "M" ? (
//                                     // Show TableFeeCollect for non-"M" and non-"T"
//                                     <TableFeeCollect />
//                                 ) : null}
//                             </div>

//                             {/* Student house chart and time table and none */}
//                             {roleId === null ? (
//                                 // Skeleton card
//                                 <div
//                                     className="w-full lg:w-[69%] border-2 border-solid bg-slate-50 rounded-lg lg:h-full sm:h-3/4"
//                                     style={{
//                                         boxShadow:
//                                             "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
//                                     }}
//                                 >
//                                     <div className="flex justify-between animate-pulse bg-white rounded shadow-md p-4 w-full h-[114px] border border-gray-200">
//                                         <div className="relative -top-2 h-20 bg-gray-300 rounded w-1/2"></div>
//                                         <div className="relative top-3 h-10 bg-gray-300 rounded w-1/3"></div>
//                                     </div>
//                                 </div>
//                             ) : roleId === "T" ? (
//                                 // Show Timetable for Teacher
//                                 <div
//                                     className="w-full lg:w-[69%] border-2 border-solid bg-slate-50 rounded-lg lg:h-full sm:h-3/4"
//                                     style={{
//                                         boxShadow:
//                                             "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
//                                     }}
//                                 >
//                                     {/* <TimeTableForTeacherDashbord /> */}
//                                     <ClassWiseAcademicPerformance />
//                                 </div>
//                             ) : roleId !== "M" ? (
//                                 // Show HouseStudentChart for non-"M" roles
//                                 <div
//                                     className="w-full lg:w-[69%] border-2 border-solid bg-slate-50 rounded-lg lg:h-full sm:h-3/4"
//                                     style={{
//                                         boxShadow:
//                                             "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
//                                     }}
//                                 >
//                                     <HouseStudentChart />
//                                 </div>
//                             ) : null}
//                         </div>
//                     </>
//                 )}

//             {roleId === "T" && (
//                 <>
//                     <ToastContainer />

//                     {/*  SECTION 1 */}
//                     <section className="w-full px-4 md:px-6 py-3">
//                         <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
//                             {/* Cards */}
//                             <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                                 <Link to="/studentAbsent" className="no-underline">
//                                     <CardStuStaf
//                                         title="Student"
//                                         roleId={roleId}
//                                         TotalValue={
//                                             roleId === "T" ? studentCardT?.total : studentData?.total
//                                         }
//                                         presentValue={
//                                             roleId === "T"
//                                                 ? studentCardT?.present
//                                                 : studentData?.present
//                                         }
//                                         color="#4CAF50"
//                                         icon={
//                                             <FaUsersLine
//                                                 style={{
//                                                     color: "violet",
//                                                     backgroundColor: "white",
//                                                     padding: "10px",
//                                                     borderRadius: "50%",
//                                                 }}
//                                             />
//                                         }
//                                     />
//                                 </Link>
//                                 {/* {isClassTeacher === 1 ? (
//                     <Link to="/studentAbsent" className="no-underline">
//                       <CardStuStaf
//                         title="Student"
//                         roleId={roleId}
//                         TotalValue={
//                           roleId === "T"
//                             ? studentCardT?.total
//                             : studentData?.total
//                         }
//                         presentValue={
//                           roleId === "T"
//                             ? studentCardT?.present
//                             : studentData?.present
//                         }
//                         color="#4CAF50"
//                         icon={
//                           <FaUsersLine
//                             style={{
//                               color: "violet",
//                               backgroundColor: "white",
//                               padding: "10px",
//                               borderRadius: "50%",
//                             }}
//                           />
//                         }
//                       />
//                     </Link>
//                   ) : (
//                     <Link to="#" className="no-underline">
//                       <CardStuStaf
//                         title="Student"
//                         roleId={roleId}
//                         TotalValue={
//                           isClassTeacher === 1 ? studentCardT?.total : " "
//                         }
//                         presentValue={
//                           isClassTeacher === 1 ? studentCardT?.present : " "
//                         }
//                         color="#4CAF50"
//                         icon={
//                           <FaUsersLine
//                             style={{
//                               color: "violet",
//                               backgroundColor: "white",
//                               padding: "10px",
//                               borderRadius: "50%",
//                             }}
//                           />
//                         }
//                         className={
//                           isClassTeacher !== 1
//                             ? "cursor-not-allowed opacity-60"
//                             : "cursor-pointer"
//                         }
//                       />
//                     </Link>
//                   )} */}

//                                 <Link to="/substituteClassTeacher" className="no-underline">
//                                     <Card
//                                         // title="Class Teacher Substitution"
//                                         title={
//                                             <p className="truncate text-xs max-w-full ml-5 mb-0">
//                                                 Class Teacher Substitution
//                                             </p>
//                                         }
//                                         value={substituteCT}
//                                         color="#2196F3"
//                                         icon={
//                                             <HiOutlineDocumentText
//                                                 style={{
//                                                     color: "#FF6B6B",
//                                                     backgroundColor: "white",
//                                                     padding: "11px",
//                                                 }}
//                                             />
//                                         }
//                                     />
//                                 </Link>

//                                 <Link to="/homeworkNotSubmitedStudent" className="no-underline">
//                                     <Card
//                                         title="Homework"
//                                         value={homeworkCardT.submissiondate}
//                                         color="#FF9800"
//                                         icon={
//                                             <TfiWrite
//                                                 style={{
//                                                     color: "#2196F3",
//                                                     backgroundColor: "white",
//                                                     padding: "13px",
//                                                 }}
//                                             />
//                                         }
//                                     />
//                                 </Link>

//                                 <Link to="/defaulterStudentList" className="no-underline">
//                                     <Card
//                                         title="Defaulter List"
//                                         value={pendingStudentCount}
//                                         valuePendingFee={pendingStudentFeeT}
//                                         color="#FF5733"
//                                         icon={
//                                             <HiCollection
//                                                 style={{
//                                                     color: "green",
//                                                     backgroundColor: "white",
//                                                     padding: "10px",
//                                                     borderRadius: "50%",
//                                                     // width: "80%",
//                                                     // height: "80%",
//                                                 }}
//                                             />
//                                         }
//                                     />
//                                 </Link>

//                                 <Link to="#" className="no-underline">
//                                     <Card
//                                         title="Assessment"
//                                         value={comingSoonValue}
//                                         color="#4CAF50"
//                                         icon={
//                                             <MdAssessment
//                                                 style={{
//                                                     color: "#C03078",
//                                                     backgroundColor: "white",
//                                                     padding: "10px",
//                                                 }}
//                                             />
//                                         }
//                                     />
//                                 </Link>

//                                 <Link to="/todayStudentBirthday" className="no-underline">
//                                     <Card
//                                         title=" Birthdays"
//                                         value={birthdayCardT.birthdaycount}
//                                         color="#2196F3"
//                                         icon={
//                                             <FaBirthdayCake
//                                                 style={{
//                                                     color: "cyan",
//                                                     backgroundColor: "white",
//                                                     padding: "10px",
//                                                     borderRadius: "50%",
//                                                 }}
//                                             />
//                                         }
//                                     />
//                                 </Link>
//                             </div>

//                             {/* Event Card */}
//                             <div className="lg:col-span-4">
//                                 {/* <div className="bg-slate-100 rounded-lg shadow-md h-full">
//                     <EventCard />
//                   </div> */}
//                                 <div className="w-full  lg:w-full lg:h-full sm:h-3/4  bg-slate-100 overflow-y-hidden rounded-lg shadow-md ">
//                                     <EventCard />
//                                 </div>
//                             </div>
//                         </div>
//                     </section>

//                     {/*  SECTION 2 */}
//                     <section className="w-full px-4 md:px-6 py-3">
//                         <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
//                             {/* Timetable */}
//                             <div className="lg:col-span-8 bg-slate-50 rounded-lg shadow-md h-[380px] flex flex-col">
//                                 <TimeTableForTeacherDashbord />
//                             </div>

//                             {/* Todo */}
//                             <div className="lg:col-span-4 bg-slate-50 rounded-lg shadow-md h-[380px] flex flex-col">
//                                 <TodoListandRemainders />
//                             </div>
//                         </div>
//                     </section>

//                     {/*  SECTION 3*/}
//                     <section className="w-full px-4 md:px-6 py-3">
//                         <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
//                             {/* Ticket */}
//                             <div className="lg:col-span-4 bg-slate-50 rounded-lg shadow-md">
//                                 <TicketForDashboard />
//                             </div>

//                             {/* Performance */}
//                             <div className="lg:col-span-8 bg-slate-50 rounded-lg shadow-md">
//                                 <ClassWiseAcademicPerformance />
//                             </div>
//                         </div>
//                     </section>
//                     {/* Go to LMS */}
//                     {/* <section className="w-full px-4 md:px-6 py-3">
//               <div className="flex justify-end">
//                 <button
//                   onClick={goToLMS}
//                   className="flex items-center gap-2 bg-pink-700 text-white
//                  px-5 py-3 rounded-lg shadow-md hover:bg-pink-800
//                  transition-all duration-200 font-semibold"
//                 >
//                   Go to LMS →
//                 </button>
//               </div>
//             </section> */}
//                 </>
//             )}
//         </>
//     );
// };

// export default DashboardContent;

import React, { Suspense } from "react";
import { FaUserGroup, FaUsersLine } from "react-icons/fa6";
import Card from "../common/Card.jsx";
import EventCard from "./EventCard.jsx";
import CardStuStaf from "../common/CardStuStaf.jsx";
// import StudentsChart from "../Dashbord/Charts/StudentsChart.jsx";

const StudentsChart = React.lazy(() => import("./Charts/StudentsChart"));
import {
    FaBirthdayCake,
    FaCalendarAlt,
    FaClipboardCheck,
} from "react-icons/fa";
import { HiCollection } from "react-icons/hi";
import { IoTicket } from "react-icons/io5";
import NoticeBord from "./NoticeBord.jsx";
import axios from "axios";
import { useEffect, useState } from "react";
import HouseStudentChart from "./Charts/HouseStudentChart.jsx";
import TableFeeCollect from "./TableFeeCollect.jsx";
import { Link, useNavigate } from "react-router-dom";
import LoadingSpinner from "../common/LoadingSpinner.jsx";
import { ToastContainer, toast } from "react-toastify";
import { RiPassValidFill } from "react-icons/ri";
import { GiTeacher } from "react-icons/gi";
import { TfiWrite } from "react-icons/tfi";
import { MdAssessment } from "react-icons/md";
import ClassWiseAcademicPerformance from "./ClassWiseAcademicPerformance.jsx";
import TimeTableForTeacherDashbord from "./TimeTableForTeacherDashbord.jsx";
import TicketForDashboard from "./TicketForDashboard.jsx";
import PrincipalDashboardSACS from "./PrincipalDashboardSACS.jsx";
import api from "./api.js"
import { MdOutlinePayments } from "react-icons/md";
import { MdOutlineWarningAmber } from "react-icons/md";
import { HiOutlineDocumentText } from "react-icons/hi";
import { MdOutlineAssignment } from "react-icons/md";
import TodoListandRemainders from "./TodoListandRemainders.jsx";

const DashboardContent = () => {
    const API_URL = import.meta.env.VITE_API_URL; // url for host
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const LMS_URL = "https://ednova.evolvu.in";
    const navigate = useNavigate();
    const [studentData, setStudentData] = useState({
        total: 0,
        present: 0,
    });
    const [sortNameCookie, setSortNameCookie] = useState("");

    const tokenToLMS = localStorage.getItem("authToken");
    console.log("TOken to lms", tokenToLMS);


    const goToLMS = async () => {
        try {
            const schoolToken = localStorage.getItem("authToken");

            if (!schoolToken) {
                alert("Please login first");
                return;
            }

            console.log("🔐 Initiating SSO login...");

            const response = await axios.post(
                `${LMS_URL}/sso/api/school/lms-sso`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${schoolToken}`, // ✅ FIXED
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                },
            );

            console.log("✅ SSO Response:", response.data);

            if (response.data?.success && response.data?.lms_url) {
                console.log("🚀 Redirecting to LMS...");
                window.location.href = response.data.lms_url; // ✅ BEST
            } else {
                alert("Login failed. Invalid response from LMS.");
            }
        } catch (error) {
            console.error("❌ SSO failed:", error.response?.data || error.message);

            if (error.response?.status === 403) {
                alert("Authentication failed. Please login again.");
            } else {
                alert("Connection error. Please try again later.");
            }
        }
    };

    const [staffData, setStaffData] = useState({
        teachingStaff: "",
        nonTeachingStaff: "",
    });
    const [staffBirthday, setStaffBirthday] = useState("");
    const [ticketCount, setTicketCount] = useState("");
    const [approveLeaveCount, setApproveLeaveCount] = useState("");
    const [pendingFee, setPendingFee] = useState("");
    const [collectedFee, setCollectedFee] = useState("");
    const [approvedLessonPlaneCount, setApprovedLessonPlaneCount] = useState("");
    const [error, setError] = useState(null);
    const [roleId, setRoleId] = useState(null);
    const [regId, setRegId] = useState(null);
    const [teacherCardsData, setTeachersCardsData] = useState([]);
    const [birthdayCardT, setBirthdayCardT] = useState("");
    const [homeworkCardT, setHomeworkCardT] = useState("");
    // const [studentCardT, setStudentCardT] = useState("");
    const [studentCardT, setStudentCardT] = useState({
        total: 0,
        present: 0,
    });
    const [pendingStudentFeeT, setPendingStudentFeeT] = useState("");
    const [pendingStudentCount, setPendingStudentCount] = useState("");

    const [markAbsentees, setMarkAbsentees] = useState("");
    const [classTeacher, setClassTeacher] = useState([]);
    const [isClassTeacher, setIsClassTeacher] = useState("");
    const [substituteCT, setSubstituteCT] = useState("");
    const comingSoonValue = "Coming Soon";




    useEffect(() => {
        initDashboard();
    }, []);

    const initDashboard = async () => {
        setLoading(true);
        try {
            const session = await fetchSession();
            await loadDashboard(session);
        } finally {
            setLoading(false);
        }
    };

    const fetchSession = async () => {
        const res = await api.get("/api/sessionData");

        const session = {
            roleId: res.data.user.role_id,
            regId: res.data.user.reg_id,
            sortName: res.data.custom_claims.short_name,
        };

        setRoleId(session.roleId);
        setRegId(session.regId);
        setSortNameCookie(session.sortName);

        return session;
    };


    const loadDashboard = async ({ roleId, sortName }) => {
        // 🔥 fire & forget
        fetchClassTeacherData(regId);

        try {
            setLoading(true);

            let res;

            // Single API call based on role
            if (sortName === "SACS" && roleId === "M") {
                // Principal
                res = await api.get("/api/principal/dashboard/summary");
            } else {
                // Admin
                res = await api.get("/api/admin/dashboard/summary");
            }

            const data = res.data.data;
            mapDashboardData(data);

        } catch (err) {
            console.error("Failed to load dashboard:", err);
        } finally {
            setLoading(false);
        }
    };

    const mapDashboardData = (data) => {
        // Student
        setStudentData({
            total: data.student?.total ?? 0,
            present: data.student?.present ?? 0,
        });

        setMarkAbsentees(data.student?.attendanceNotMarked?.notMarked ?? 0);

        // Staff mapping
        if (data.staff) {
            // Principal format
            setStaffData({
                teachingStaff: data.staff.teachingStaff ?? 0,
                attendanceteachingstaff: data.staff.attendanceteachingstaff ?? 0,
                nonTeachingStaff: data.staff.non_teachingStaff ?? 0,
                attendancenonteachingstaff: data.staff.attendancenonteachingstaff ?? 0,
            });
        } else {
            // Admin format
            setStaffData({
                teachingStaff: data.teachingStaff?.total ?? 0,
                attendanceteachingstaff: data.teachingStaff?.count ?? 0,
                nonTeachingStaff: data.non_teachingStaff?.total ?? 0,
                attendancenonteachingstaff: data.non_teachingStaff?.count ?? 0,
            });
        }

        // Birthday
        setStaffBirthday(data.staff_student_bday_count?.count ?? 0);

        // Fees
        setCollectedFee(data.fees_collection?.["Collected Fees"] ?? 0);
        setPendingFee(data.fees_collection?.["Pending Fees"] ?? 0);

        // Leaves
        setApproveLeaveCount(data.approve_leave?.count ?? 0);

        // Lesson Plans
        setApprovedLessonPlaneCount(data.lesson_plan_summary?.pendingForApproval ?? 0);

        // Principal-specific teacher cards
        if (data["Nursery teachers"]) {
            setTeachersCardsData([
                { title: "Nursery", total: data["Nursery teachers"].total, present: data["Nursery teachers"].present },
                { title: "KG", total: data["KG teachers"].total, present: data["KG teachers"].present },
                { title: "SACS", total: data["SACS teachers"].total, present: data["SACS teachers"].present },
                { title: "Caretakers", total: data["Caretakers"].total, present: data["Caretakers"].present },
            ]);
        } else {
            setTeachersCardsData([]); // Admin may not have these
        }
    };





    const fetchClassTeacherData = async (regId) => {
        const res = await api.get(
            `/api/get_classes_of_classteacher?teacher_id=${regId}`
        );

        setClassTeacher(res.data.data);
        setIsClassTeacher(
            res.data.data.some(c => c.is_class_teacher === 1) ? 1 : 0
        );
    };

    const fetchTeacherDashboard = async (regId) => {
        const res = await api.get(
            `/api/teachers/${regId}/dashboard/summary`
        );

        const d = res.data.data;

        setTeachersCardsData(d);
        setStudentCardT({
            total: d.studentCard.totalStudents,
            present: d.studentCard.totalStudentsPresentToday,
        });
    };

    useEffect(() => {
        if (!loading) console.log("Dashboard Ready");
    }, [loading]);



    return (
        <>
            {roleId === "M" && sortNameCookie === "SACS" && (
                <PrincipalDashboardSACS />
            )}

            {["A", "P", "M"].includes(roleId) &&
                !(roleId === "M" && sortNameCookie === "SACS") && (
                    <>
                        <ToastContainer />
                        <div className="flex flex-col lg:flex-row items-start justify-between w-full gap-4 p-6 ">
                            <div className="w-full lg:w-2/3  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* <Link to="/studentAbsent" className="no-underline">
                    <CardStuStaf
                      title="Student"
                      roleId={roleId}
                      TotalValue={
                        roleId === "T" ? studentCardT?.total : studentData?.total
                      }
                      presentValue={
                        roleId === "T"
                          ? studentCardT?.present
                          : studentData?.present
                      }
                      color="#4CAF50"
                      icon={
                        <FaUsersLine
                          style={{
                            color: "violet",
                            backgroundColor: "white",
                            padding: "10px",
                            borderRadius: "50%",
                          }}
                        />
                      }
                    />
                  </Link> */}
                                <Link to="/studentAbsent" className="no-underline">
                                    <CardStuStaf
                                        title="Student"
                                        roleId={roleId}
                                        TotalValue={
                                            roleId === "T" ? studentCardT?.total : studentData?.total
                                        }
                                        presentValue={
                                            roleId === "T"
                                                ? studentCardT?.present
                                                : studentData?.present
                                        }
                                        badge={markAbsentees} // 👈 badge value
                                        color="#4CAF50"
                                        icon={
                                            <FaUsersLine
                                                style={{
                                                    color: "violet",
                                                    backgroundColor: "white",
                                                    padding: "10px",
                                                    borderRadius: "50%",
                                                }}
                                            />
                                        }
                                    />
                                </Link>

                                {roleId === null ? (
                                    // Skeleton card
                                    <div className="flex justify-between animate-pulse bg-white rounded shadow-md p-4 w-full h-[114px] border border-gray-200">
                                        <div className="relative -top-2 h-20 bg-gray-300 rounded w-1/2"></div>
                                        <div className="relative top-3 h-10 bg-gray-300 rounded w-1/3"></div>
                                    </div>
                                ) : roleId === "T" ? (
                                    // Approve Leave card for roleId "M"
                                    <Link to="#" className="no-underline">
                                        <Card
                                            title="Substitution Class"
                                            roleId={roleId} // Pass the roleId here
                                            value={" "}
                                            color="#2196F3"
                                            icon={
                                                <HiOutlineDocumentText
                                                    style={{
                                                        color: "#FF6B6B",
                                                        backgroundColor: "white",
                                                        padding: "11px",
                                                    }}
                                                />
                                            }
                                        />
                                    </Link>
                                ) : (
                                    <>
                                        <button
                                            disabled={sortNameCookie === "HSCS"}
                                            style={{
                                                border: "none",
                                                background: "transparent",
                                                padding: 0,
                                                width: "100%",
                                                cursor:
                                                    sortNameCookie === "HSCS" ? "not-allowed" : "pointer",
                                            }}
                                        >
                                            <Link
                                                to={sortNameCookie === "HSCS" ? "#" : "/teacherList"}
                                                className="no-underline"
                                                style={
                                                    sortNameCookie === "HSCS"
                                                        ? { pointerEvents: "none" } // No opacity (as you requested)
                                                        : {}
                                                }
                                            >
                                                <CardStuStaf
                                                    title="Teachers"
                                                    TotalValue={staffData.teachingStaff}
                                                    presentValue={staffData?.attendanceteachingstaff}
                                                    color="#2196F3"
                                                    icon={
                                                        <FaUserGroup
                                                            style={{
                                                                color: "#00FFFF",
                                                                backgroundColor: "white",
                                                                padding: "10px",
                                                                borderRadius: "50%",
                                                            }}
                                                        />
                                                    }
                                                    disableLoader={sortNameCookie === "HSCS"} // 👈 ADD THIS
                                                />
                                            </Link>
                                        </button>
                                    </>
                                )}

                                {/* for non teaching staff and home work */}
                                {roleId === null ? (
                                    // Skeleton card
                                    <div className="flex justify-between animate-pulse bg-white rounded shadow-md p-4 w-full h-[114px] border border-gray-200">
                                        <div className="relative -top-2 h-20 bg-gray-300 rounded w-1/2"></div>
                                        <div className="relative top-3 h-10 bg-gray-300 rounded w-1/3"></div>
                                    </div>
                                ) : roleId === "T" ? (
                                    // Approve Leave card for roleId "M"
                                    <Link
                                        to="/homeworkNotSubmitedStudent"
                                        className="no-underline"
                                    >
                                        <Card
                                            title="Homework"
                                            value={homeworkCardT.submissiondate}
                                            color="#FF9800"
                                            icon={
                                                <TfiWrite
                                                    style={{
                                                        color: "#2196F3",
                                                        backgroundColor: "white",
                                                        padding: "13px",
                                                    }}
                                                />
                                            }
                                        />
                                    </Link>
                                ) : (
                                    <>
                                        <button
                                            disabled={sortNameCookie === "HSCS"}
                                            style={{
                                                border: "none",
                                                background: "transparent",
                                                padding: 0,
                                                width: "100%",
                                                cursor:
                                                    sortNameCookie === "HSCS" ? "not-allowed" : "pointer",
                                            }}
                                        >
                                            <Link
                                                to={
                                                    sortNameCookie === "HSCS" ? "#" : "/nonTeachingStaff"
                                                }
                                                className="no-underline"
                                                style={
                                                    sortNameCookie === "HSCS"
                                                        ? { pointerEvents: "none" }
                                                        : {}
                                                }
                                            >
                                                <CardStuStaf
                                                    title="Non-Teaching Staff"
                                                    TotalValue={staffData.nonTeachingStaff}
                                                    presentValue={staffData?.attendancenonteachingstaff}
                                                    color="#2196F3"
                                                    icon={
                                                        <FaUserGroup
                                                            style={{
                                                                color: "#A287F3",
                                                                backgroundColor: "white",
                                                                padding: "10px",
                                                                borderRadius: "50%",
                                                            }}
                                                        />
                                                    }
                                                    disableLoader={sortNameCookie === "HSCS"} // 👈 ADD THIS
                                                />
                                            </Link>
                                        </button>
                                    </>
                                )}

                                {/* For fee pending */}
                                {roleId === null ? (
                                    // Skeleton card
                                    <div className="flex justify-between animate-pulse bg-white rounded shadow-md p-4 w-full h-[114px] border border-gray-200">
                                        <div className="relative -top-2 h-20 bg-gray-300 rounded w-1/2"></div>
                                        <div className="relative top-3 h-10 bg-gray-300 rounded w-1/3"></div>
                                    </div>
                                ) : roleId === "T" ? (
                                    // Approve Leave card for roleId "M"
                                    <Link to="/defaulterStudentList" className="no-underline">
                                        <Card
                                            title="Defaulter List"
                                            value={pendingStudentCount}
                                            valuePendingFee={pendingStudentFeeT}
                                            color="#FF5733"
                                            icon={
                                                <HiCollection
                                                    style={{
                                                        color: "green",
                                                        backgroundColor: "white",
                                                        padding: "10px",
                                                        borderRadius: "50%",
                                                        // width: "80%",
                                                        // height: "80%",
                                                    }}
                                                />
                                            }
                                        />
                                    </Link>
                                ) : (
                                    <Link to="/feependinglist" className="no-underline">
                                        <Card
                                            title="Fee"
                                            value={collectedFee}
                                            valuePendingFee={pendingFee}
                                            color="#FF5733"
                                            icon={
                                                <HiCollection
                                                    style={{
                                                        color: "green",
                                                        backgroundColor: "white",
                                                        padding: "10px",
                                                        borderRadius: "50%",
                                                    }}
                                                />
                                            }
                                        />
                                    </Link>
                                )}
                                {/* Ticketling list, assessment, Approve lesson plane */}
                                {roleId === null ? (
                                    // Skeleton card
                                    <div className="flex justify-between animate-pulse bg-white rounded shadow-md p-4 w-full h-[114px] border border-gray-200">
                                        <div className="relative -top-2 h-20 bg-gray-300 rounded w-1/2"></div>
                                        <div className="relative top-3 h-10 bg-gray-300 rounded w-1/3"></div>
                                    </div>
                                ) : roleId === "M" ? (
                                    // Approve Leave card for roleId "M"
                                    <Link to="/approveLeavelist" className="no-underline">
                                        <Card
                                            title="Approve Leave"
                                            value={approveLeaveCount}
                                            color="#FFC107"
                                            icon={
                                                <RiPassValidFill
                                                    style={{
                                                        color: "#C03078",
                                                        backgroundColor: "white",
                                                        padding: "10px",
                                                        borderRadius: "50%",
                                                    }}
                                                />
                                            }
                                        />
                                    </Link>
                                ) : roleId === "T" ? (
                                    // Assessment card for roleId "T"
                                    <Link to="#" className="no-underline">
                                        <Card
                                            title="Assessment"
                                            value=" "
                                            color="#4CAF50"
                                            icon={
                                                <MdAssessment
                                                    style={{
                                                        color: "#C03078",
                                                        backgroundColor: "white",
                                                        padding: "10px",
                                                    }}
                                                />
                                            }
                                        />
                                    </Link>
                                ) : (
                                    // Ticketing Module card for all other roles
                                    <Link to="/ticketList" className="no-underline">
                                        <Card
                                            title="Ticketing Module"
                                            value={ticketCount}
                                            color="#FFC107"
                                            icon={
                                                <IoTicket
                                                    style={{
                                                        color: "#30C790",
                                                        backgroundColor: "white",
                                                        padding: "10px",
                                                        borderRadius: "50%",
                                                    }}
                                                />
                                            }
                                        />
                                    </Link>
                                )}

                                {/* Approve lesson plane, Birthday, Leave */}
                                {roleId === null ? (
                                    // Skeleton card
                                    <div className="flex justify-between animate-pulse bg-white rounded shadow-md p-4 w-full h-[114px] border border-gray-200">
                                        <div className="relative -top-2 h-20 bg-gray-300 rounded w-1/2"></div>
                                        <div className="relative top-3 h-10 bg-gray-300 rounded w-1/3"></div>
                                    </div>
                                ) : roleId === "M" ? (
                                    <Link to="#" className="no-underline">
                                        <Card
                                            title="Approve Lesson Plans"
                                            value={approvedLessonPlaneCount}
                                            spanLabel="Pending"
                                            color="#4CAF50"
                                            icon={
                                                <FaClipboardCheck
                                                    style={{
                                                        color: "green",
                                                        backgroundColor: "white",
                                                        padding: "10px",
                                                        borderRadius: "50%",
                                                    }}
                                                />
                                            }
                                        />
                                    </Link>
                                ) : roleId === "T" ? (
                                    <Link to="/todayStudentBirthday" className="no-underline">
                                        <Card
                                            title="Birthdays"
                                            value={birthdayCardT.birthdaycount}
                                            color="#2196F3"
                                            icon={
                                                <FaBirthdayCake
                                                    style={{
                                                        color: "cyan",
                                                        backgroundColor: "white",
                                                        padding: "10px",
                                                        borderRadius: "50%",
                                                    }}
                                                />
                                            }
                                        />
                                    </Link>
                                ) : (
                                    <Link to="/staffbirthlist" className="no-underline">
                                        <Card
                                            title="Birthdays"
                                            value={staffBirthday}
                                            color="#2196F3"
                                            icon={
                                                <FaBirthdayCake
                                                    style={{
                                                        color: "cyan",
                                                        backgroundColor: "white",
                                                        padding: "10px",
                                                        borderRadius: "50%",
                                                    }}
                                                />
                                            }
                                        />
                                    </Link>
                                )}
                            </div>

                            <div className="w-full  lg:w-[33%] lg:h-full sm:h-3/4  bg-slate-100 overflow-y-hidden rounded-lg shadow-md ">
                                <EventCard />
                            </div>
                        </div>

                        <div className="flex flex-col-reverse lg:flex-row items-start justify-between w-full  gap-4  h-full lg:h-1/2  px-4 sm:flex-col-reverse ">
                            <div
                                className="w-full lg:w-[79%]  gap-y-3 gap-x-3 h-full bg-slate-50 rounded-lg lg:h-full sm:h-3/4"
                                // className="w-full lg:w-2/3 gap-y-3 gap-x-3 h-full bg-slate-50 rounded-lg lg:h-full sm:h-1/2"
                                style={{
                                    boxShadow:
                                        "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
                                }}
                            >
                                {roleId === null ? (
                                    <div className="animate-pulse bg-white rounded shadow-md p-4 w-full h-[200px] border border-gray-200">
                                        <div className="h-6 bg-gray-300 rounded mb-4 w-1/3"></div>
                                        <div className="h-32 bg-gray-300 rounded"></div>
                                    </div>
                                ) : roleId === "T" ? (
                                    <TimeTableForTeacherDashbord />
                                ) : (
                                    <StudentsChart />
                                )}
                            </div>
                            <div
                                className="w-full lg:w-[39%] border-2 border-solid   bg-slate-50 rounded-lg  h-3/4 lg:h-full  "
                                style={{
                                    boxShadow:
                                        "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
                                }}
                            >
                                {roleId === "T" ? <TodoListandRemainders /> : <NoticeBord />}
                            </div>
                        </div>

                        {/* this is extra layout */}
                        <div className="flex flex-col-reverse lg:flex-row items-start justify-between w-full   gap-4 px-4 sm:flex-col-reverse mt-6">
                            <div
                                className="w-full lg:w-[29%] bg-slate-50 rounded-lg h-3/4"
                                style={{
                                    boxShadow:
                                        "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
                                }}
                            >
                                {roleId === null ? (
                                    // Skeleton card
                                    <div className="flex justify-between animate-pulse bg-white rounded shadow-md p-4 w-full h-[114px] border border-gray-200">
                                        <div className="relative -top-2 h-20 bg-gray-300 rounded w-1/2"></div>
                                        <div className="relative top-3 h-10 bg-gray-300 rounded w-1/3"></div>
                                    </div>
                                ) : roleId === "T" ? (
                                    // Show Ticket component for Teacher
                                    <TicketForDashboard />
                                ) : roleId !== "M" ? (
                                    // Show TableFeeCollect for non-"M" and non-"T"
                                    <TableFeeCollect />
                                ) : null}
                            </div>

                            {/* Student house chart and time table and none */}
                            {roleId === null ? (
                                // Skeleton card
                                <div
                                    className="w-full lg:w-[69%] border-2 border-solid bg-slate-50 rounded-lg lg:h-full sm:h-3/4"
                                    style={{
                                        boxShadow:
                                            "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
                                    }}
                                >
                                    <div className="flex justify-between animate-pulse bg-white rounded shadow-md p-4 w-full h-[114px] border border-gray-200">
                                        <div className="relative -top-2 h-20 bg-gray-300 rounded w-1/2"></div>
                                        <div className="relative top-3 h-10 bg-gray-300 rounded w-1/3"></div>
                                    </div>
                                </div>
                            ) : roleId === "T" ? (
                                // Show Timetable for Teacher
                                <div
                                    className="w-full lg:w-[69%] border-2 border-solid bg-slate-50 rounded-lg lg:h-full sm:h-3/4"
                                    style={{
                                        boxShadow:
                                            "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
                                    }}
                                >
                                    {/* <TimeTableForTeacherDashbord /> */}
                                    <ClassWiseAcademicPerformance />
                                </div>
                            ) : roleId !== "M" ? (
                                // Show HouseStudentChart for non-"M" roles
                                <div
                                    className="w-full lg:w-[69%] border-2 border-solid bg-slate-50 rounded-lg lg:h-full sm:h-3/4"
                                    style={{
                                        boxShadow:
                                            "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
                                    }}
                                >
                                    <HouseStudentChart />
                                </div>
                            ) : null}
                        </div>
                    </>
                )}

            {roleId === "T" && (
                <>
                    <ToastContainer />

                    {/*  SECTION 1 */}
                    <section className="w-full px-4 md:px-6 py-3">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                            {/* Cards */}
                            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <Link to="/studentAbsent" className="no-underline">
                                    <CardStuStaf
                                        title="Student"
                                        roleId={roleId}
                                        TotalValue={
                                            roleId === "T" ? studentCardT?.total : studentData?.total
                                        }
                                        presentValue={
                                            roleId === "T"
                                                ? studentCardT?.present
                                                : studentData?.present
                                        }
                                        color="#4CAF50"
                                        icon={
                                            <FaUsersLine
                                                style={{
                                                    color: "violet",
                                                    backgroundColor: "white",
                                                    padding: "10px",
                                                    borderRadius: "50%",
                                                }}
                                            />
                                        }
                                    />
                                </Link>
                                {/* {isClassTeacher === 1 ? (
                    <Link to="/studentAbsent" className="no-underline">
                      <CardStuStaf
                        title="Student"
                        roleId={roleId}
                        TotalValue={
                          roleId === "T"
                            ? studentCardT?.total
                            : studentData?.total
                        }
                        presentValue={
                          roleId === "T"
                            ? studentCardT?.present
                            : studentData?.present
                        }
                        color="#4CAF50"
                        icon={
                          <FaUsersLine
                            style={{
                              color: "violet",
                              backgroundColor: "white",
                              padding: "10px",
                              borderRadius: "50%",
                            }}
                          />
                        }
                      />
                    </Link>
                  ) : (
                    <Link to="#" className="no-underline">
                      <CardStuStaf
                        title="Student"
                        roleId={roleId}
                        TotalValue={
                          isClassTeacher === 1 ? studentCardT?.total : " "
                        }
                        presentValue={
                          isClassTeacher === 1 ? studentCardT?.present : " "
                        }
                        color="#4CAF50"
                        icon={
                          <FaUsersLine
                            style={{
                              color: "violet",
                              backgroundColor: "white",
                              padding: "10px",
                              borderRadius: "50%",
                            }}
                          />
                        }
                        className={
                          isClassTeacher !== 1
                            ? "cursor-not-allowed opacity-60"
                            : "cursor-pointer"
                        }
                      />
                    </Link>
                  )} */}

                                <Link to="/substituteClassTeacher" className="no-underline">
                                    <Card
                                        // title="Class Teacher Substitution"
                                        title={
                                            <p className="truncate text-xs max-w-full ml-5 mb-0">
                                                Class Teacher Substitution
                                            </p>
                                        }
                                        value={substituteCT}
                                        color="#2196F3"
                                        icon={
                                            <HiOutlineDocumentText
                                                style={{
                                                    color: "#FF6B6B",
                                                    backgroundColor: "white",
                                                    padding: "11px",
                                                }}
                                            />
                                        }
                                    />
                                </Link>

                                <Link to="/homeworkNotSubmitedStudent" className="no-underline">
                                    <Card
                                        title="Homework"
                                        value={homeworkCardT.submissiondate}
                                        color="#FF9800"
                                        icon={
                                            <TfiWrite
                                                style={{
                                                    color: "#2196F3",
                                                    backgroundColor: "white",
                                                    padding: "13px",
                                                }}
                                            />
                                        }
                                    />
                                </Link>

                                <Link to="/defaulterStudentList" className="no-underline">
                                    <Card
                                        title="Defaulter List"
                                        value={pendingStudentCount}
                                        valuePendingFee={pendingStudentFeeT}
                                        color="#FF5733"
                                        icon={
                                            <HiCollection
                                                style={{
                                                    color: "green",
                                                    backgroundColor: "white",
                                                    padding: "10px",
                                                    borderRadius: "50%",
                                                    // width: "80%",
                                                    // height: "80%",
                                                }}
                                            />
                                        }
                                    />
                                </Link>

                                <Link to="#" className="no-underline">
                                    <Card
                                        title="Assessment"
                                        value={comingSoonValue}
                                        color="#4CAF50"
                                        icon={
                                            <MdAssessment
                                                style={{
                                                    color: "#C03078",
                                                    backgroundColor: "white",
                                                    padding: "10px",
                                                }}
                                            />
                                        }
                                    />
                                </Link>

                                <Link to="/todayStudentBirthday" className="no-underline">
                                    <Card
                                        title=" Birthdays"
                                        value={birthdayCardT.birthdaycount}
                                        color="#2196F3"
                                        icon={
                                            <FaBirthdayCake
                                                style={{
                                                    color: "cyan",
                                                    backgroundColor: "white",
                                                    padding: "10px",
                                                    borderRadius: "50%",
                                                }}
                                            />
                                        }
                                    />
                                </Link>
                            </div>

                            {/* Event Card */}
                            <div className="lg:col-span-4">
                                {/* <div className="bg-slate-100 rounded-lg shadow-md h-full">
                    <EventCard />
                  </div> */}
                                <div className="w-full  lg:w-full lg:h-full sm:h-3/4  bg-slate-100 overflow-y-hidden rounded-lg shadow-md ">
                                    <EventCard />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/*  SECTION 2 */}
                    <section className="w-full px-4 md:px-6 py-3">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                            {/* Timetable */}
                            <div className="lg:col-span-8 bg-slate-50 rounded-lg shadow-md h-[380px] flex flex-col">
                                <TimeTableForTeacherDashbord />
                            </div>

                            {/* Todo */}
                            <div className="lg:col-span-4 bg-slate-50 rounded-lg shadow-md h-[380px] flex flex-col">
                                <TodoListandRemainders />
                            </div>
                        </div>
                    </section>

                    {/*  SECTION 3*/}
                    <section className="w-full px-4 md:px-6 py-3">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                            {/* Ticket */}
                            <div className="lg:col-span-4 bg-slate-50 rounded-lg shadow-md">
                                <TicketForDashboard />
                            </div>

                            {/* Performance */}
                            <div className="lg:col-span-8 bg-slate-50 rounded-lg shadow-md">
                                <ClassWiseAcademicPerformance />
                            </div>
                        </div>
                    </section>
                    {/* Go to LMS */}
                    {/* <section className="w-full px-4 md:px-6 py-3">
              <div className="flex justify-end">
                <button
                  onClick={goToLMS}
                  className="flex items-center gap-2 bg-pink-700 text-white
                 px-5 py-3 rounded-lg shadow-md hover:bg-pink-800
                 transition-all duration-200 font-semibold"
                >
                  Go to LMS →
                </button>
              </div>
            </section> */}
                </>
            )}
        </>
    );
};

export default DashboardContent;

