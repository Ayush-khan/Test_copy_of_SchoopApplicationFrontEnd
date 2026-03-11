import { Link } from "react-router-dom";
import Card from "../common/Card";
import CardStuStaf from "../common/CardStuStaf";
import EventCard from "./EventCard";
import NoticeBord from "./NoticeBord";
import TimeTableForTeacherDashbord from "./TimeTableForTeacherDashbord";
import TodoListandRemainders from "./TodoListandRemainders";
import TicketForDashboard from "./TicketForDashboard";
import ClassWiseAcademicPerformance from "./ClassWiseAcademicPerformance";
import StudentsChart from "./Charts/StudentsChart";
import StudentAttendanceChart from "./Charts/StudentAttendanceChart";
import { FaUsersLine, FaUserGroup, FaUserShield } from "react-icons/fa6";
import { FaBirthdayCake, FaClipboardCheck } from "react-icons/fa";
import { HiCollection } from "react-icons/hi";
import { RiPassValidFill } from "react-icons/ri";
import { GiTeacher } from "react-icons/gi";

const iconWrap = (icon) => (
  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
    {icon}
  </div>
);

const getData = (dashboardData) => dashboardData?.data || {};

const withLink = (to, node) =>
  to ? (
    <Link to={to} className="no-underline block h-full">
      {node}
    </Link>
  ) : (
    node
  );

const StudentsCardWidget = ({ dashboardData, roleId, sortName }) => {
  const d = getData(dashboardData);
  return withLink(
    "/studentAbsent",
    <CardStuStaf
      title="Students"
      TotalValue={d.student?.total ?? 0}
      presentValue={d.student?.present ?? 0}
      badge={d.student?.attendanceNotMarked?.notMarked ?? 0}
      roleId={roleId}
      sortName={sortName}
      icon={iconWrap(<FaUsersLine className="text-violet-600 text-4xl" />)}
    />
  );
};

const StaffCardWidget = ({ dashboardData, roleId, sortName }) => {
  const d = getData(dashboardData);
  return withLink(
    "/todayStaffList",
    <CardStuStaf
      title="Staff"
      TotalValue={
        (d.staff?.teachingStaff ?? 0) + (d.staff?.non_teachingStaff ?? 0)
      }
      presentValue={
        (d.staff?.attendanceteachingstaff ?? 0) +
        (d.staff?.attendancenonteachingstaff ?? 0)
      }
      roleId={roleId}
      sortName={sortName}
      icon={iconWrap(<FaUserGroup className="text-cyan-500 text-4xl" />)}
    />
  );
};

const BirthdaysCardWidget = ({ dashboardData, roleId, sortName }) => {
  const d = getData(dashboardData);
  return withLink(
    "/staffbirthlist",
    <Card
      title="Birthdays"
      value={d.staff_student_bday_count?.count ?? d.birthday_count ?? 0}
      roleId={roleId}
      sortName={sortName}
      icon={iconWrap(<FaBirthdayCake className="text-pink-500 text-4xl" />)}
    />
  );
};

const FeeCardWidget = ({ dashboardData, roleId, sortName }) => {
  const d = getData(dashboardData);
  return withLink(
    "/feependinglist",
    <Card
      title="Fee"
      value={d.fees_collection?.["Collected Fees"] ?? 0}
      valuePendingFee={d.fees_collection?.["Pending Fees"] ?? 0}
      roleId={roleId}
      sortName={sortName}
      icon={iconWrap(<HiCollection className="text-green-600 text-4xl" />)}
    />
  );
};

const ApproveLeaveCardWidget = ({ dashboardData, roleId, sortName }) => {
  const d = getData(dashboardData);
  return withLink(
    "/approveLeavelist",
    <Card
      title="Approve Leave"
      value={d.approve_leave?.count ?? 0}
      roleId={roleId}
      sortName={sortName}
      icon={iconWrap(<RiPassValidFill className="text-rose-600 text-4xl" />)}
    />
  );
};

const LessonPlansCardWidget = ({ dashboardData, roleId, sortName }) => {
  const d = getData(dashboardData);
  return withLink(
    "/lessonPlanData",
    <Card
      title="Lesson Plans"
      value={d.lesson_plan_summary?.totalNumberOfTeachers ?? 0}
      valuePendingFee={d.lesson_plan_summary?.lessonPlanSubmitted ?? 0}
      valueAbsent={d.lesson_plan_summary?.lessonPlanNotSubmitted ?? 0}
      valueTeacher={d.lesson_plan_summary?.pendingForApproval ?? 0}
      roleId={roleId}
      sortName={sortName}
      icon={iconWrap(<FaClipboardCheck className="text-green-600 text-4xl" />)}
    />
  );
};

const StaffAttendanceCardWidget = ({
  title,
  dataKey,
  dashboardData,
  roleId,
  sortName,
}) => {
  const d = getData(dashboardData);
  const card = d[dataKey] || {};
  return (
    <Card
      title={title}
      value={card.present ?? 0}
      valueAbsent={card.absent ?? 0}
      valuePendingFee={card.total ?? 0}
      roleId={roleId}
      sortName={sortName}
      icon={iconWrap(
        dataKey === "Caretakers" ? (
          <FaUserShield className="text-purple-500 text-4xl" />
        ) : (
          <GiTeacher className="text-purple-500 text-4xl" />
        )
      )}
    />
  );
};

const NurseryCardWidget = (props) => (
  <StaffAttendanceCardWidget
    title="Nursery"
    dataKey="Nursery teachers"
    {...props}
  />
);

const KgCardWidget = (props) => (
  <StaffAttendanceCardWidget title="KG" dataKey="KG teachers" {...props} />
);

const SchoolCardWidget = (props) => (
  <StaffAttendanceCardWidget
    title="School"
    dataKey="SACS teachers"
    {...props}
  />
);

const CaretakerCardWidget = (props) => (
  <StaffAttendanceCardWidget
    title="Caretaker"
    dataKey="Caretakers"
    {...props}
  />
);

export const widgetRegistry = {
  // New dynamic keys from backend structure API
  students: StudentsCardWidget,
  staff: StaffCardWidget,
  birthdays: BirthdaysCardWidget,
  fee: FeeCardWidget,
  approve_leave: ApproveLeaveCardWidget,
  lesson_plans: LessonPlansCardWidget,
  nursery: NurseryCardWidget,
  kg: KgCardWidget,
  school: SchoolCardWidget,
  caretaker: CaretakerCardWidget,
  attendance_distribution_chart: StudentAttendanceChart,
  events_list: EventCard,

  // Existing keys kept for compatibility
  student_card: CardStuStaf,
  students_chart: StudentsChart,
  notice_board: NoticeBord,
  event_card: EventCard,
  timetable: TimeTableForTeacherDashbord,
  todo_list: TodoListandRemainders,
  ticket: TicketForDashboard,
  performance: ClassWiseAcademicPerformance,
};

const normalizeWidgetKey = (key) =>
  String(key || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");

const widgetAliases = {
  approveleave: "approve_leave",
  approve_leave_card: "approve_leave",
  attendance_distribution: "attendance_distribution_chart",
  attendance_distribution_graph: "attendance_distribution_chart",
  student_attendance_distribution: "attendance_distribution_chart",
  event_list: "events_list",
  events: "events_list",
};

export const resolveWidgetComponent = (key) => {
  const normalized = normalizeWidgetKey(key);
  const aliasKey = widgetAliases[normalized] || normalized;
  return widgetRegistry[aliasKey] || null;
};
