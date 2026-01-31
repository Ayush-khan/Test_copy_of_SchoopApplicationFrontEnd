
// const PrincipalDashboard = () => {
//     return (
//         <div className="p-4">
//             <h1 className="text-2xl font-bold mb-4">Coming Soon: Principal Dashboard</h1>
//             <p>Welcome to the Principal Dashboard. Here you can manage school activities and monitor performance.</p>
//             {/* Add more dashboard components and features as needed */}
//         </div>
//     );
// };

// export default PrincipalDashboard;
import React from "react";
import { Link } from "react-router-dom";
import { FaUsersLine, FaUserGroup } from "react-icons/fa6";
import { HiCollection } from "react-icons/hi";
import { RiPassValidFill } from "react-icons/ri";
import { FaClipboardCheck } from "react-icons/fa";

import Card from "../../common/Card.jsx";
import CardStuStaf from "../../common/CardStuStaf.jsx";
import EventCard from "../EventCard.jsx";
import StudentsChart from "../Charts/StudentsChart.jsx";
import NoticeBord from "../NoticeBord.jsx";

const PrincipalDashboard = ({ dashboard }) => {
    // 🔹 Default data to make dashboard static
    const defaultData = {
        student: { total: 0, present: 0, attendanceNotMarked: { notMarked: 0 } },
        staff: { teachingStaff: 0, attendanceteachingstaff: 0, non_teachingStaff: 0, attendancenonteachingstaff: 0 },
        fees_collection: { "Collected Fees": 0, "Pending Fees": 0 },
        approve_leave: { count: 0 },
        lesson_plan_summary: { pendingForApproval: 0 },
        staff_student_bday_count: { count: 0 },
    };

    // 🔹 Merge API data with default to avoid undefined
    const data = { ...defaultData, ...(dashboard?.data || {}) };

    const iconStyle = (color) => ({
        color,
        backgroundColor: "white",
        padding: "10px",
        borderRadius: "50%",
    });

    // 🔹 Cards data array
    const cards = [
        {
            title: "Students",
            link: "/studentAbsent",
            component: (
                <CardStuStaf
                    title="Students"
                    TotalValue={data.student.total}
                    presentValue={data.student.present}
                    badge={data.student.attendanceNotMarked?.notMarked || 0}
                    color="#4CAF50"
                    icon={<FaUsersLine style={iconStyle("violet")} />}
                />
            ),
        },
        {
            title: "Teachers",
            link: "/teacherList",
            component: (
                <CardStuStaf
                    title="Teachers"
                    TotalValue={data.staff.teachingStaff}
                    presentValue={data.staff.attendanceteachingstaff}
                    color="#2196F3"
                    icon={<FaUserGroup style={iconStyle("#00FFFF")} />}
                />
            ),
        },
        {
            title: "Non-Teaching Staff",
            link: "/nonTeachingStaff",
            component: (
                <CardStuStaf
                    title="Non-Teaching Staff"
                    TotalValue={data.staff.non_teachingStaff}
                    presentValue={data.staff.attendancenonteachingstaff}
                    color="#673AB7"
                    icon={<FaUserGroup style={iconStyle("#A287F3")} />}
                />
            ),
        },
        {
            title: "Fee Collection",
            link: "/feependinglist",
            component: (
                <Card
                    title="Fee"
                    value={data.fees_collection["Collected Fees"] || 0}
                    valuePendingFee={data.fees_collection["Pending Fees"] || 0}
                    color="#FF5722"
                    icon={<HiCollection style={iconStyle("green")} />}
                />
            ),
        },
        {
            title: "Approve Leave",
            link: "/approveLeavelist",
            component: (
                <Card
                    title="Approve Leave"
                    value={data.approve_leave.count || 0}
                    color="#FFC107"
                    icon={<RiPassValidFill style={iconStyle("#C03078")} />}
                />
            ),
        },
        {
            title: "Approve Lesson Plan",
            link: "#",
            component: (
                <Card
                    title="Approve Lesson Plan"
                    value={data.lesson_plan_summary.pendingForApproval || 0}
                    spanLabel="Pending"
                    color="#4CAF50"
                    icon={<FaClipboardCheck style={iconStyle("green")} />}
                />
            ),
        },
    ];

    return (
        <>
            {/* ================= TOP + BOTTOM CARDS ================= */}
            <div className="flex flex-col lg:flex-row gap-4 p-6">
                <div className="w-full lg:w-2/3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cards.map((c) => (
                        <Link
                            key={c.title}
                            to={c.link}
                            className="no-underline"
                            style={c.link === "#" ? { pointerEvents: "none" } : {}}
                        >
                            {c.component}
                        </Link>
                    ))}
                </div>

                {/* RIGHT EVENT CARD */}
                <div className="w-full lg:w-1/3 bg-slate-100 rounded-lg shadow-md">
                    <EventCard />
                </div>
            </div>

            {/* ================= CHART + NOTICE ================= */}
            <div className="flex flex-col-reverse lg:flex-row gap-4 px-4 max-h-80">
                <div className="w-full lg:w-2/3 bg-slate-50 rounded-lg shadow-md">
                    <StudentsChart />
                </div>

                <div className="w-full lg:w-1/3 bg-slate-50 rounded-lg shadow-md">
                    <NoticeBord />
                </div>
            </div>
        </>
    );
};

export default PrincipalDashboard;





