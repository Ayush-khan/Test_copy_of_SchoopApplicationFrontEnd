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
import HouseStudentChart from "./Charts/HouseStudentChart";
import TableFeeCollect from "./TableFeeCollect";
import { FaUsersLine, FaUserGroup, FaUserShield } from "react-icons/fa6";
import { FaBirthdayCake, FaClipboardCheck } from "react-icons/fa";
import { HiCollection } from "react-icons/hi";
import { RiPassValidFill } from "react-icons/ri";
import { GiTeacher } from "react-icons/gi";
import { IoTicket } from "react-icons/io5";

const iconWrap = (icon) => (
  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
    {icon}
  </div>
);

const getData = (dashboardData) => dashboardData?.data || {};
const getType = (widget) => String(widget?.widget_type || "").trim().toLowerCase();

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

const TeachingStaffCardWidget = ({ dashboardData, roleId, sortName }) => {
  const d = getData(dashboardData);
  return withLink(
    "/teacherList",
    <CardStuStaf
      title="Teaching Staff"
      TotalValue={d.staff?.teachingStaff ?? 0}
      presentValue={d.staff?.attendanceteachingstaff ?? 0}
      roleId={roleId}
      sortName={sortName}
      icon={iconWrap(<GiTeacher className="text-cyan-500 text-4xl" />)}
    />
  );
};

const NonTeachingStaffCardWidget = ({ dashboardData, roleId, sortName }) => {
  const d = getData(dashboardData);
  return withLink(
    "/nonTeachingStaff",
    <CardStuStaf
      title="Non Teaching Staff"
      TotalValue={d.staff?.non_teachingStaff ?? 0}
      presentValue={d.staff?.attendancenonteachingstaff ?? 0}
      roleId={roleId}
      sortName={sortName}
      icon={iconWrap(<FaUserShield className="text-cyan-500 text-4xl" />)}
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

const toTitle = (raw) =>
  String(raw || "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const removeKnownSuffixes = (value) =>
  String(value || "")
    .replace(/(_card|_chart|_table|_list)$/g, "")
    .replace(/s$/g, "");

const numericFromUnknown = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(String(value).replace(/,/g, ""));
    if (Number.isFinite(parsed)) return parsed;
  }
  if (Array.isArray(value)) return value.length;
  if (value && typeof value === "object") {
    const preferredKeys = [
      "count",
      "total",
      "value",
      "amount",
      "present",
      "pending",
      "size",
      "length",
    ];
    for (const key of preferredKeys) {
      const candidate = numericFromUnknown(value[key]);
      if (candidate !== null) return candidate;
    }
    for (const candidate of Object.values(value)) {
      const numeric = numericFromUnknown(candidate);
      if (numeric !== null) return numeric;
    }
  }
  return null;
};

const GenericCardWidget = ({ widget, dashboardData, roleId, sortName }) => {
  const d = getData(dashboardData);
  const key = normalizeWidgetKey(widget?.widget_key);
  const candidates = [
    key,
    removeKnownSuffixes(key),
    key.replace(/s$/g, ""),
    key.replace(/_/g, ""),
  ];

  let source = null;
  for (const candidate of candidates) {
    if (candidate in d) {
      source = d[candidate];
      break;
    }
  }

  if (!source && d[key.replace(/s$/g, "")]) {
    source = d[key.replace(/s$/g, "")];
  }

  const value = numericFromUnknown(source) ?? 0;
  return (
    <Card
      title={widget?.widget_name || toTitle(widget?.widget_key)}
      value={value}
      roleId={roleId}
      sortName={sortName}
      icon={iconWrap(<FaUsersLine className="text-indigo-500 text-4xl" />)}
    />
  );
};

const GenericChartWidget = ({ widget }) => (
  <div className="h-full rounded-lg border border-gray-200 bg-white p-3">
    <p className="mb-1 text-sm font-semibold text-gray-700">
      {widget?.widget_name || toTitle(widget?.widget_key)}
    </p>
    <p className="mb-0 text-xs text-gray-500">
      Chart widget mapped. Dedicated chart component not configured yet.
    </p>
  </div>
);

const GenericTableWidget = ({ widget }) => (
  <div className="h-full rounded-lg border border-gray-200 bg-white p-3">
    <p className="mb-1 text-sm font-semibold text-gray-700">
      {widget?.widget_name || toTitle(widget?.widget_key)}
    </p>
    <p className="mb-0 text-xs text-gray-500">
      Table widget mapped. Dedicated table component not configured yet.
    </p>
  </div>
);

const TicketsCardWidget = ({ dashboardData, roleId, sortName }) => {
  const d = getData(dashboardData);
  const ticketsCount =
    d.ticket_count ?? d.ticket?.count ?? d.tickets?.count ?? d.tickets_count ?? 0;

  return withLink(
    "/ticktinglist",
    <Card
      title="Tickets"
      value={ticketsCount}
      roleId={roleId}
      sortName={sortName}
      icon={iconWrap(<IoTicket className="text-orange-500 text-4xl" />)}
    />,
  );
};

export const widgetRegistry = {
  // New dynamic keys from backend structure API
  students: StudentsCardWidget,
  staff: StaffCardWidget,
  teaching_staff: TeachingStaffCardWidget,
  non_teaching_staff: NonTeachingStaffCardWidget,
  birthdays: BirthdaysCardWidget,
  fee: FeeCardWidget,
  tickets: TicketsCardWidget,
  approve_leave: ApproveLeaveCardWidget,
  lesson_plans: LessonPlansCardWidget,
  nursery: NurseryCardWidget,
  kg: KgCardWidget,
  school: SchoolCardWidget,
  caretaker: CaretakerCardWidget,
  attendance_distribution_chart: StudentAttendanceChart,
  classwise_student_distribution: StudentsChart,
  fee_collection: TableFeeCollect,
  house_chart: HouseStudentChart,
  events_list: EventCard,
  notice: NoticeBord,

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
  class_wise_student_distribution: "classwise_student_distribution",
  classwise_distribution: "classwise_student_distribution",
  classwise_student_chart: "classwise_student_distribution",
  fee_collection_table: "fee_collection",
  tickets_card: "tickets",
  staff_teaching: "teaching_staff",
  staff_non_teaching: "non_teaching_staff",
  event_list: "events_list",
  events: "events_list",
  notice_board: "notice",
  notice_list: "notice",
  notices: "notice",
};

const keywordResolvers = [
  {
    test: (normalized, type) =>
      type === "card" && (normalized.includes("teaching_staff") || normalized.includes("teacher")),
    component: TeachingStaffCardWidget,
  },
  {
    test: (normalized, type) =>
      type === "card" && normalized.includes("non_teaching_staff"),
    component: NonTeachingStaffCardWidget,
  },
  {
    test: (normalized, type) =>
      type === "card" && normalized.includes("ticket"),
    component: TicketsCardWidget,
  },
  {
    test: (normalized, type) =>
      type === "table" && normalized.includes("event"),
    component: EventCard,
  },
  {
    test: (normalized, type) =>
      (type === "table" || type === "list") && normalized.includes("notice"),
    component: NoticeBord,
  },
  {
    test: (normalized, type) =>
      type === "table" && normalized.includes("fee"),
    component: TableFeeCollect,
  },
  {
    test: (normalized, type) =>
      type === "chart" && normalized.includes("attendance"),
    component: StudentAttendanceChart,
  },
  {
    test: (normalized, type) =>
      type === "chart" &&
      (normalized.includes("classwise_student_distribution") ||
        normalized.includes("student_distribution") ||
        normalized.includes("classwise")),
    component: StudentsChart,
  },
  {
    test: (normalized, type) =>
      type === "chart" && normalized.includes("house"),
    component: HouseStudentChart,
  },
];

export const resolveWidgetComponent = (widget) => {
  const normalized = normalizeWidgetKey(widget?.widget_key);
  const type = getType(widget);

  const variants = [
    normalized,
    widgetAliases[normalized],
    removeKnownSuffixes(normalized),
    widgetAliases[removeKnownSuffixes(normalized)],
  ].filter(Boolean);

  for (const variant of variants) {
    if (widgetRegistry[variant]) return widgetRegistry[variant];
  }

  for (const resolver of keywordResolvers) {
    if (resolver.test(normalized, type)) return resolver.component;
  }

  if (type === "card") return GenericCardWidget;
  if (type === "chart") return GenericChartWidget;
  if (type === "table") return GenericTableWidget;
  return null;
};
