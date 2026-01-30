import { Link } from "react-router-dom";
import { FaUsersLine } from "react-icons/fa6";
import { HiCollection, HiOutlineDocumentText } from "react-icons/hi";
import { TfiWrite } from "react-icons/tfi";
import { MdAssessment } from "react-icons/md";
import { FaBirthdayCake } from "react-icons/fa";
import Card from "../../common/Card";
import CardStuStaf from "../../common/CardStuStaf";
import EventCard from "../EventCard";
import TimeTableForTeacherDashbord from "../TimeTableForTeacherDashbord";
import TodoListandRemainders from "../TodoListandRemainders";
import TicketForDashboard from "../TicketForDashboard";
import ClassWiseAcademicPerformance from "../ClassWiseAcademicPerformance";

const TeacherDashboard = ({ dashboard }) => {
    const data = dashboard?.data || {};

    // 🔥 API BASED MAPPING (VERY IMPORTANT)
    const student = {
        total: data.studentCard?.totalStudents ?? 0,
        present: data.studentCard?.totalStudentsPresentToday ?? 0,
    };

    const birthdayCount =
        data.birthDayCard?.countOfBirthdaysToday ?? 0;

    const homeworkCount =
        data.homeworkCard?.countOfHomeworksDueToday ?? 0;

    const defaulter = {
        count: data.defaulterCount?.totalNumberOfDefaulters ?? 0,
        pendingAmount: data.defaulterCount?.totalPendingAmount ?? 0,
    };

    const substituteCount = data.substituteCount ?? 0;

    return (
        <>
            {/* ================= SECTION 1 : TOP CARDS ================= */}
            <section className="w-full px-4 md:px-6 py-3">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

                    {/* CARDS */}
                    <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                        {/* STUDENTS */}
                        <Link to="/studentAbsent" className="no-underline">
                            <CardStuStaf
                                title="Students"
                                TotalValue={student.total}
                                presentValue={student.present}
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

                        {/* SUBSTITUTE */}
                        <Link to="/substituteClassTeacher" className="no-underline">
                            <Card
                                title="Substitution Class"
                                value={substituteCount}
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

                        {/* HOMEWORK */}
                        <Link to="/homeworkNotSubmitedStudent" className="no-underline">
                            <Card
                                title="Homework Due"
                                value={homeworkCount}
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

                        {/* DEFAULTER */}
                        <Link to="/defaulterStudentList" className="no-underline">
                            <Card
                                title="Defaulter List"
                                value={defaulter.count}
                                valuePendingFee={defaulter.pendingAmount}
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

                        {/* ASSESSMENT (COMING SOON) */}
                        <Card
                            title="Assessment"
                            value="Coming Soon"
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

                        {/* BIRTHDAY */}
                        <Link to="/todayStudentBirthday" className="no-underline">
                            <Card
                                title="Birthdays"
                                value={birthdayCount}
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

                    {/* EVENT CARD */}
                    <div className="lg:col-span-4">
                        <div className="bg-slate-100 rounded-lg shadow-md h-full">
                            <EventCard />
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= SECTION 2 ================= */}
            <section className="w-full px-4 md:px-6 py-3">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-8 bg-slate-50 rounded-lg shadow-md">
                        <TimeTableForTeacherDashbord />
                    </div>
                    <div className="lg:col-span-4 bg-slate-50 rounded-lg shadow-md">
                        <TodoListandRemainders />
                    </div>
                </div>
            </section>

            {/* ================= SECTION 3 ================= */}
            <section className="w-full px-4 md:px-6 py-3">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-4 bg-slate-50 rounded-lg shadow-md">
                        <TicketForDashboard />
                    </div>
                    <div className="lg:col-span-8 bg-slate-50 rounded-lg shadow-md">
                        <ClassWiseAcademicPerformance />
                    </div>
                </div>
            </section>
        </>
    );
};

export default TeacherDashboard;
