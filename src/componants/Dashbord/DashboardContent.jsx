import { FaUserGroup, FaUsersLine } from "react-icons/fa6";
import Card from "../common/Card.jsx";
import CardStuStaf from "../common/CardStuStaf.jsx";
import EventCard from "./EventCard.jsx";
import StudentsChart from "../Dashbord/Charts/StudentsChart.jsx";
import NoticeBord from "./NoticeBord.jsx";
import { HiCollection } from "react-icons/hi";
import { RiPassValidFill } from "react-icons/ri";
import PrincipalDashboardSACS from "./PrincipalDashboardSACS.jsx";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

const DashboardContent = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();

    const [roleId, setRoleId] = useState(null);
    const [sortNameCookie, setSortNameCookie] = useState("");
    const [dashboardData, setDashboardData] = useState({
        studentData: { total: 0, present: 0 },
        staffData: { teachingStaff: 0, attendanceteachingstaff: 0, nonTeachingStaff: 0, attendancenonteachingstaff: 0 },
        ticketCount: 0,
        approveLeaveCount: 0,
        collectedFee: 0,
        pendingFee: 0,
        approvedLessonPlanCount: 0,
        markAbsentees: 0,
    });
    const [loadingCritical, setLoadingCritical] = useState(true);

    const token = localStorage.getItem("authToken");

    // fetch session
    useEffect(() => {
        if (!token) {
            toast.error("Please login again");
            navigate("/");
            return;
        }
        axios.get(`${API_URL}/api/sessionData`, { headers: { Authorization: `Bearer ${token}` } })
            .then(({ data }) => {
                setRoleId(data?.user?.role_id);
                setSortNameCookie(data?.custom_claims?.short_name);
            })
            .catch(() => toast.error("Failed to fetch session"));
    }, []);

    // fetch critical data (students + staff) first
    useEffect(() => {
        if (!roleId) return;
        setLoadingCritical(true);
        Promise.all([
            axios.get(`${API_URL}/api/studentss`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${API_URL}/api/staff`, { headers: { Authorization: `Bearer ${token}` } })
        ])
            .then(([studentRes, staffRes]) => {
                setDashboardData(prev => ({
                    ...prev,
                    studentData: { total: studentRes.data.count, present: studentRes.data.present },
                    staffData: {
                        teachingStaff: staffRes.data.teachingStaff,
                        attendanceteachingstaff: staffRes.data.attendanceteachingstaff,
                        nonTeachingStaff: staffRes.data.non_teachingStaff,
                        attendancenonteachingstaff: staffRes.data.attendancenonteachingstaff
                    }
                }));
            })
            .catch(err => console.error(err))
            .finally(() => setLoadingCritical(false));
    }, [roleId]);

    // fetch secondary data (tickets, fees, leaves...) after critical is done
    useEffect(() => {
        if (!roleId) return;
        Promise.all([
            axios.get(`${API_URL}/api/ticketcount`, { headers: { Authorization: `Bearer ${token}`, "Role-Id": roleId } }),
            axios.get(`${API_URL}/api/get_count_of_approveleave`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${API_URL}/api/feecollection`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${API_URL}/api/get_count_non_approved_lesson_plan`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${API_URL}/api/attendance/notmarked/count`, { headers: { Authorization: `Bearer ${token}` } }),
        ])
            .then(([ticketRes, approveLeaveRes, feeRes, lessonPlanRes, markAbsentRes]) => {
                setDashboardData(prev => ({
                    ...prev,
                    ticketCount: ticketRes.data.count,
                    approveLeaveCount: approveLeaveRes.data.data,
                    collectedFee: feeRes.data["Collected Fees"],
                    pendingFee: feeRes.data["Pending Fees"],
                    approvedLessonPlanCount: lessonPlanRes.data.data,
                    markAbsentees: markAbsentRes.data.AttendanceNotMarkedCount
                }));
            })
            .catch(err => console.error(err));
    }, [roleId]);

    if (!["A", "M"].includes(roleId)) return <div>Unauthorized</div>;
    if (roleId === "M" && sortNameCookie === "SACS") return <PrincipalDashboardSACS />;

    const { studentData, staffData, collectedFee, pendingFee, approveLeaveCount, approvedLessonPlanCount, markAbsentees } = dashboardData;

    return (
        <>
            <ToastContainer />
            <div className="flex flex-col lg:flex-row items-start justify-between w-full gap-4 p-6">
                {/* Left Cards */}
                <div className="w-full lg:w-2/3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Link to="/studentAbsent" className="no-underline">
                        <CardStuStaf
                            title="Student"
                            TotalValue={studentData.total}
                            presentValue={studentData.present}
                            badge={markAbsentees || 0}
                            color="#4CAF50"
                            icon={<FaUsersLine style={{ color: "violet", backgroundColor: "white", padding: 10, borderRadius: "50%" }} />}
                        />
                    </Link>
                    <Link to="/teacherList" className="no-underline">
                        <CardStuStaf
                            title="Teachers"
                            TotalValue={staffData.teachingStaff}
                            presentValue={staffData.attendanceteachingstaff}
                            color="#2196F3"
                            icon={<FaUserGroup style={{ color: "#00FFFF", backgroundColor: "white", padding: 10, borderRadius: "50%" }} />}
                        />
                    </Link>
                    <Link to="/nonTeachingStaff" className="no-underline">
                        <CardStuStaf
                            title="Non-Teaching Staff"
                            TotalValue={staffData.nonTeachingStaff}
                            presentValue={staffData.attendancenonteachingstaff}
                            color="#2196F3"
                            icon={<FaUserGroup style={{ color: "#A287F3", backgroundColor: "white", padding: 10, borderRadius: "50%" }} />}
                        />
                    </Link>
                    <Link to="/feependinglist" className="no-underline">
                        <Card
                            title="Fee"
                            value={collectedFee}
                            valuePendingFee={pendingFee}
                            color="#FF5733"
                            icon={<HiCollection style={{ color: "green", backgroundColor: "white", padding: 10, borderRadius: "50%" }} />}
                        />
                    </Link>
                    <Link to="/approveLeavelist" className="no-underline">
                        <Card title="Approve Leave" value={approveLeaveCount} color="#FFC107" icon={<RiPassValidFill style={{ color: "#C03078", backgroundColor: "white", padding: 10, borderRadius: "50%" }} />} />
                    </Link>
                    <Link to="#" className="no-underline">
                        <Card title="Approve Lesson Plans" value={approvedLessonPlanCount} spanLabel="Pending" color="#4CAF50" icon={<RiPassValidFill style={{ color: "green", backgroundColor: "white", padding: 10, borderRadius: "50%" }} />} />
                    </Link>
                </div>

                {/* Right Event Card */}
                <div className="w-full lg:w-[33%] lg:h-full sm:h-3/4 bg-slate-100 overflow-y-hidden rounded-lg shadow-md">
                    <EventCard />
                </div>
            </div>

            {/* Bottom Charts */}
            <div className="flex flex-col-reverse lg:flex-row items-start justify-between w-full gap-4 h-full lg:h-1/2 px-4 sm:flex-col-reverse mt-6">
                <div className="w-full lg:w-[79%] gap-y-3 gap-x-3 h-full bg-slate-50 rounded-lg lg:h-full sm:h-3/4" style={{ boxShadow: "rgba(0,0,0,0.12) 0 1px 3px, rgba(0,0,0,0.24) 0 1px 2px" }}>
                    <StudentsChart />
                </div>
                <div className="w-full lg:w-[39%] border-2 border-solid bg-slate-50 rounded-lg h-3/4 lg:h-full" style={{ boxShadow: "rgba(0,0,0,0.12) 0 1px 3px, rgba(0,0,0,0.24) 0 1px 2px" }}>
                    <NoticeBord />
                </div>
            </div>
        </>
    );
};

export default DashboardContent;
