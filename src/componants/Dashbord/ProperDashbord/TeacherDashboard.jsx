
// import { Link } from "react-router-dom";
// import React, { useMemo } from "react";

// import { FaUsersLine } from "react-icons/fa6";
// import { HiCollection, HiOutlineDocumentText } from "react-icons/hi";
// import { TfiWrite } from "react-icons/tfi";
// import { MdAssessment } from "react-icons/md";
// import { FaBirthdayCake } from "react-icons/fa";

// import Card from "../../common/Card";
// import CardStuStaf from "../../common/CardStuStaf";
// import EventCard from "../EventCard";
// import TimeTableForTeacherDashbord from "../TimeTableForTeacherDashbord";
// import TodoListandRemainders from "../TodoListandRemainders";
// import TicketForDashboard from "../TicketForDashboard";
// import ClassWiseAcademicPerformance from "../ClassWiseAcademicPerformance";
// import SkeletonDashboard from "../ProperDashbord/SkeletonDashboard";

// /* ================= RENDER GATE ================= */
// const RenderGate = ({ ready, fallback, children }) => {
//     if (!ready) return fallback;
//     return children;
// };

// const TeacherDashboard = ({ dashboard, roleId, sortName }) => {
//     /* ================= READY CHECK ================= */
//     const isReady = Boolean(dashboard && dashboard.data);
//     const data = isReady ? dashboard.data : null;

//     /* ================= DATA MAPPING ================= */
//     const mapped = useMemo(() => {
//         if (!data) return null;

//         return {
//             student: {
//                 total: data.studentCard?.totalStudents ?? 0,
//                 present: data.studentCard?.totalStudentsPresentToday ?? 0,
//             },
//             birthdayCount:
//                 data.birthDayCard?.countOfBirthdaysToday ?? 0,
//             homeworkCount:
//                 data.homeworkCard?.countOfHomeworksDueToday ?? 0,
//             defaulter: {
//                 count: data.defaulterCount?.totalNumberOfDefaulters ?? 0,
//                 pendingAmount: data.defaulterCount?.totalPendingAmount ?? 0,
//             },
//             substituteCount: data.substituteCount ?? 0,
//         };
//     }, [data]);

//     return (
//         <RenderGate ready={isReady} fallback={<SkeletonDashboard />}>
//             <>
//                 {/* ================= SECTION 1 : TOP CARDS ================= */}
//                 <section className="w-full px-4 md:px-6 py-3">
//                     <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

//                         {/* CARDS */}
//                         <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

//                             <Link to="/studentAbsent" className="no-underline">
//                                 <CardStuStaf
//                                     title="Students"
//                                     TotalValue={mapped.student.total}
//                                     presentValue={mapped.student.present}
//                                     color="#4CAF50"
//                                     roleId={roleId}
//                                     sortName={sortName}
//                                     icon={
//                                         <FaUsersLine
//                                             style={{
//                                                 color: "violet",
//                                                 backgroundColor: "white",
//                                                 padding: "10px",
//                                                 borderRadius: "50%",
//                                             }}
//                                         />
//                                     }
//                                 />
//                             </Link>

//                             <Link to="/substituteClassTeacher" className="no-underline">
//                                 <Card
//                                     title="Substitution Class"
//                                     value={mapped.substituteCount}
//                                     color="#2196F3"
//                                     roleId={roleId}
//                                     sortName={sortName}
//                                     icon={
//                                         <HiOutlineDocumentText
//                                             style={{
//                                                 color: "#FF6B6B",
//                                                 backgroundColor: "white",
//                                                 padding: "11px",
//                                             }}
//                                         />
//                                     }
//                                 />
//                             </Link>

//                             <Link to="/homeworkNotSubmitedStudent" className="no-underline">
//                                 <Card
//                                     title="Homework Due"
//                                     value={mapped.homeworkCount}
//                                     color="#FF9800"
//                                     roleId={roleId}
//                                     sortName={sortName}
//                                     icon={
//                                         <TfiWrite
//                                             style={{
//                                                 color: "#2196F3",
//                                                 backgroundColor: "white",
//                                                 padding: "13px",
//                                             }}
//                                         />
//                                     }
//                                 />
//                             </Link>

//                             <Link to="/defaulterStudentList" className="no-underline">
//                                 <Card
//                                     title="Defaulter List"
//                                     value={mapped.defaulter.count}
//                                     valuePendingFee={mapped.defaulter.pendingAmount}
//                                     color="#FF5733"
//                                     roleId={roleId}
//                                     sortName={sortName}
//                                     icon={
//                                         <HiCollection
//                                             style={{
//                                                 color: "green",
//                                                 backgroundColor: "white",
//                                                 padding: "10px",
//                                                 borderRadius: "50%",
//                                             }}
//                                         />
//                                     }
//                                 />
//                             </Link>

//                             <Card
//                                 title="Assessment"
//                                 value="Coming Soon"
//                                 color="#4CAF50"
//                                 roleId={roleId}
//                                 sortName={sortName}
//                                 icon={
//                                     <MdAssessment
//                                         style={{
//                                             color: "#C03078",
//                                             backgroundColor: "white",
//                                             padding: "10px",
//                                         }}
//                                     />
//                                 }
//                             />

//                             <Link to="/todayStudentBirthday" className="no-underline">
//                                 <Card
//                                     title="Birthdays"
//                                     value={mapped.birthdayCount}
//                                     color="#2196F3"
//                                     roleId={roleId}
//                                     sortName={sortName}
//                                     icon={
//                                         <FaBirthdayCake
//                                             style={{
//                                                 color: "cyan",
//                                                 backgroundColor: "white",
//                                                 padding: "10px",
//                                                 borderRadius: "50%",
//                                             }}
//                                         />
//                                     }
//                                 />
//                             </Link>
//                         </div>

//                         {/* EVENT CARD */}
//                         <div className="lg:col-span-4 h-64">
//                             <div className="bg-slate-100 overflow-y-auto rounded-lg shadow-md h-full">
//                                 <EventCard />
//                             </div>
//                         </div>
//                     </div>
//                 </section>

//                 {/* ================= SECTION 2 ================= */}
//                 <section className="w-full px-4 md:px-6 py-3">
//                     <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
//                         <div className="lg:col-span-8 bg-slate-50 rounded-lg shadow-md">
//                             <TimeTableForTeacherDashbord />
//                         </div>
//                         <div className="lg:col-span-4 bg-slate-50 rounded-lg shadow-md">
//                             <TodoListandRemainders />
//                         </div>
//                     </div>
//                 </section>

//                 {/* ================= SECTION 3 ================= */}
//                 <section className="w-full px-4 md:px-6 py-3">
//                     <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
//                         <div className="lg:col-span-4 bg-slate-50 rounded-lg shadow-md">
//                             <TicketForDashboard />
//                         </div>
//                         <div className="lg:col-span-8 bg-slate-50 rounded-lg shadow-md">
//                             <ClassWiseAcademicPerformance />
//                         </div>
//                     </div>
//                 </section>
//             </>
//         </RenderGate>
//     );
// };

// export default TeacherDashboard;

// Working well but  need to make more obtimisation
import React from 'react'

const TeacherDashboard = () => {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center  text-yellow-100">

            {/* Animated Title */}
            <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fadeInUp">
                Teacher Dashboard
            </h1>

            {/* Animated Subtitle */}
            <p className="text-lg text-gray-300 mb-6 animate-fadeInUp delay-200">
                Coming Soon...
            </p>

            {/* Loader / Animation */}
            <div className="flex space-x-2 animate-pulse">
                <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
                <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
                <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
            </div>
        </div>
    );

}

export default TeacherDashboard