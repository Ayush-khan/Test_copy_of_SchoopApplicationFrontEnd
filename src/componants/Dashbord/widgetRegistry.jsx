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
import { FaBell, FaBookOpen, FaRegNewspaper, FaUserFriends } from "react-icons/fa";
import { FaBook, FaBookOpenReader, FaClipboardList } from "react-icons/fa6";
import { FaUsersLine, FaUserGroup, FaUserShield } from "react-icons/fa6";
import { FaBirthdayCake, FaClipboardCheck } from "react-icons/fa";
import { HiCollection, HiOutlineDocumentText } from "react-icons/hi";
import { RiPassValidFill } from "react-icons/ri";
import { GiTeacher } from "react-icons/gi";
import { IoTicket } from "react-icons/io5";
import { TfiWrite } from "react-icons/tfi";
import { MdAssessment } from "react-icons/md";

const iconWrap = (icon) => (
  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
    {icon}
  </div>
);

const getData = (dashboardData) =>
  dashboardData?.data || dashboardData?.counts || dashboardData || {};
const getType = (widget) => {
  const raw = String(widget?.widget_type || "").trim().toLowerCase();
  if (raw === "1") return "card";
  if (raw === "2") return "chart";
  if (raw === "3") return "table";
  return raw;
};

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

const getByPath = (obj, path) =>
  String(path || "")
    .split(".")
    .reduce((acc, key) => (acc && key in acc ? acc[key] : null), obj);

const pickNumberFromPaths = (obj, paths) => {
  for (const path of paths) {
    const value = Array.isArray(path)
      ? path.reduce((acc, key) => (acc && key in acc ? acc[key] : null), obj)
      : getByPath(obj, path);
    const numeric = numericFromUnknown(value);
    if (numeric !== null) return numeric;
  }
  return 0;
};

const LibraryStatCard = ({
  title,
  icon,
  primaryValue,
  secondaryLines = [],
  link,
}) =>
  withLink(
    link,
    <div className="w-full bg-white rounded-lg shadow-card h-28 flex items-center justify-around">
      <div className="flex flex-col items-center justify-between w-1/2">
        <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
          {icon}
        </div>
        <div className="text-sm text-gray-600 font-medium text-center">
          {title}
        </div>
      </div>
      <div className="w-1 h-10 border-l" />
      <div className="flex flex-col items-end text-sm font-semibold text-gray-700 w-1/2 pr-4">
        <div className="text-[1.3em] text-gray-800">{primaryValue}</div>
        {secondaryLines.map((line, index) => (
          <div key={index} className={line.className || "text-xs text-gray-500"}>
            {line.label}: {line.value}
          </div>
        ))}
      </div>
    </div>,
  );

const LibrarySubscriptionReminderCard = ({ dashboardData }) => {
  const d = getData(dashboardData);
  const value = pickNumberFromPaths(d, [
    "subscription_expiry",
    "counts.subscription_expiry",
    "subscription_reminder",
    "subscriptionReminder",
    "subscription_reminder_count",
    "subscription_count",
  ]);
  return (
    <LibraryStatCard
      title="Subscription Reminder"
      icon={<FaBell className="text-orange-500 text-xl" />}
      primaryValue={value}
      link="/subscriptionReminder"
    />
  );
};

const LibraryPeriodicalsReminderCard = ({ dashboardData }) => {
  const d = getData(dashboardData);
  const value = pickNumberFromPaths(d, [
    "periodical_not_received",
    "counts.periodical_not_received",
    "periodicals_reminder",
    "periodicalsReminder",
    "periodicals_reminder_count",
  ]);
  return (
    <LibraryStatCard
      title="Periodicals Reminder"
      icon={<FaRegNewspaper className="text-purple-500 text-xl" />}
      primaryValue={value}
      link="/periodicalsReminder"
    />
  );
};

const LibraryBookReturnPendingCard = ({ dashboardData }) => {
  const d = getData(dashboardData);
  const students = pickNumberFromPaths(d, [
    "student_book_return_pending",
    "counts.student_book_return_pending",
    "book_return_pending.students",
    "book_return_pending.student",
    "book_return_pending_students",
    "book_return_pending_student",
    "book_return_pending_student_count",
    "book_return_pending_students_count",
  ]);
  const staff = pickNumberFromPaths(d, [
    "staff_book_return_pending",
    "counts.staff_book_return_pending",
    "book_return_pending.staff",
    "book_return_pending_staff",
    "book_return_pending_staff_count",
  ]);
  return (
    <LibraryStatCard
      title="Book Return Pending"
      icon={<FaClipboardList className="text-rose-500 text-xl" />}
      primaryValue=""
      secondaryLines={[
        { label: "Students", value: students, className: "text-xs text-pink-600" },
        { label: "Staff", value: staff, className: "text-xs text-indigo-600" },
      ]}
      link="/bookReturnPending"
    />
  );
};

const LibraryBooksAvailabilityCard = ({ dashboardData }) => {
  const d = getData(dashboardData);
  const total = pickNumberFromPaths(d, [
    "total_books",
    "counts.total_books",
    "books_availability.total",
    "books_availability.total_books",
    "books_availability.totalBooks",
    "books_total",
    "total_books",
  ]);
  const available = pickNumberFromPaths(d, [
    "available_books",
    "counts.available_books",
    "books_availability.available",
    "books_availability.available_books",
    "available_books",
    "books_available",
  ]);
  return (
    <LibraryStatCard
      title="Books Availability"
      icon={<FaBookOpen className="text-green-600 text-xl" />}
      primaryValue=""
      secondaryLines={[
        { label: "Total Books", value: total, className: "text-xs text-gray-700" },
        { label: "Available", value: available, className: "text-xs text-green-600" },
      ]}
      link="/viewBookAvailability"
    />
  );
};

const LibraryPeriodicalsCard = ({ dashboardData }) => {
  const d = getData(dashboardData);
  const value = pickNumberFromPaths(d, [
    "periodicals",
    "counts.periodicals",
    "periodicals",
    "periodicals_count",
    "periodicals.total",
  ]);
  return (
    <LibraryStatCard
      title="Periodicals"
      icon={<FaBook className="text-purple-500 text-xl" />}
      primaryValue={value}
      link="/periodic_details"
    />
  );
};

const LibraryViewMembersCard = ({ dashboardData }) => {
  const d = getData(dashboardData);
  const students = pickNumberFromPaths(d, [
    "student_members",
    "counts.student_members",
    "view_members.students",
    "members.students",
    "member_students",
    "students_count",
    "student_count",
  ]);
  const staff = pickNumberFromPaths(d, [
    "teacher_members",
    "counts.teacher_members",
    "view_members.staff",
    "members.staff",
    "member_staff",
    "staff_count",
  ]);
  return (
    <LibraryStatCard
      title="View Members"
      icon={<FaUserFriends className="text-blue-500 text-xl" />}
      primaryValue=""
      secondaryLines={[
        { label: "Students", value: students, className: "text-xs text-pink-600" },
        { label: "Staff", value: staff, className: "text-xs text-indigo-600" },
      ]}
      link="/viewMembers"
    />
  );
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

const TeacherStudentsCardWidget = ({ dashboardData, roleId, sortName }) => {
  const d = getData(dashboardData);
  return withLink(
    "/studentAbsent",
    <CardStuStaf
      title="Students"
      TotalValue={d.studentCard?.totalStudents ?? d.student?.total ?? 0}
      presentValue={
        d.studentCard?.totalStudentsPresentToday ?? d.student?.present ?? 0
      }
      roleId={roleId}
      sortName={sortName}
      icon={iconWrap(<FaUsersLine className="text-violet-600 text-4xl" />)}
    />,
  );
};

const TeacherSubstituteClassCardWidget = ({ dashboardData, roleId, sortName, widget }) => {
  const d = getData(dashboardData);
  const value = numericFromUnknown(d.substituteCount) ?? 0;
  return withLink(
    "/substituteClassTeacher",
    <Card
      title={widget?.widget_name || "Class Teacher Substitution"}
      value={value}
      roleId={roleId}
      sortName={sortName}
      icon={iconWrap(<HiOutlineDocumentText className="text-rose-500 text-3xl" />)}
    />,
  );
};

const TeacherHomeworkCardWidget = ({ dashboardData, roleId, sortName, widget }) => {
  const d = getData(dashboardData);
  const value =
    numericFromUnknown(d.homeworkCard?.countOfHomeworksDueToday) ??
    numericFromUnknown(d.homeworkCard) ??
    0;
  return withLink(
    "/homeworkNotSubmitedStudent",
    <Card
      title={widget?.widget_name || "Homework"}
      value={value}
      roleId={roleId}
      sortName={sortName}
      icon={iconWrap(<TfiWrite className="text-sky-500 text-3xl" />)}
    />,
  );
};

const TeacherDefaulterCardWidget = ({ dashboardData, roleId, sortName, widget }) => {
  const d = getData(dashboardData);
  const count =
    numericFromUnknown(d.defaulterCount?.totalNumberOfDefaulters) ??
    numericFromUnknown(d.defaulterCount?.count) ??
    numericFromUnknown(d.defaulter_count) ??
    0;
  const pending =
    numericFromUnknown(d.defaulterCount?.totalPendingAmount) ??
    numericFromUnknown(d.defaulterCount?.pendingAmount) ??
    numericFromUnknown(d.defaulter_pending) ??
    0;
  return withLink(
    "/defaulterStudentList",
    <Card
      title={widget?.widget_name || "Defaulter List"}
      value={count}
      valuePendingFee={pending}
      roleId={roleId}
      sortName={sortName}
      icon={iconWrap(<HiCollection className="text-green-600 text-3xl" />)}
    />,
  );
};

const TeacherAssessmentCardWidget = ({ roleId, sortName, widget }) => (
  <Card
    title={widget?.widget_name || "Assessment"}
    value="Coming Soon"
    roleId={roleId}
    sortName={sortName}
    icon={iconWrap(<MdAssessment className="text-pink-600 text-3xl" />)}
  />
);

const TeacherBirthdayCardWidget = ({ dashboardData, roleId, sortName, widget }) => {
  const d = getData(dashboardData);
  const value =
    numericFromUnknown(d.birthDayCard?.countOfBirthdaysToday) ??
    numericFromUnknown(d.birthday_count) ??
    numericFromUnknown(d.staff_student_bday_count?.count) ??
    0;
  return withLink(
    "/todayStudentBirthday",
    <Card
      title={widget?.widget_name || "Birthdays"}
      value={value}
      roleId={roleId}
      sortName={sortName}
      icon={iconWrap(<FaBirthdayCake className="text-cyan-500 text-3xl" />)}
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
  studentabsent: TeacherStudentsCardWidget,
  substituteclassteacher: TeacherSubstituteClassCardWidget,
  homeworknotsubmitedstudent: TeacherHomeworkCardWidget,
  defaulterstudentlist: TeacherDefaulterCardWidget,
  todaystudentbirthday: TeacherBirthdayCardWidget,
  coming_soon: TeacherAssessmentCardWidget,
  timetableforteacherdashbord: TimeTableForTeacherDashbord,
  todolistandremainders: TodoListandRemainders,
  ticketfordashboard: TicketForDashboard,
  classwiseacademicperformance: ClassWiseAcademicPerformance,
  subscription_reminder: LibrarySubscriptionReminderCard,
  periodicals_reminder: LibraryPeriodicalsReminderCard,
  book_return_pending: LibraryBookReturnPendingCard,
  books_availability: LibraryBooksAvailabilityCard,
  periodicals: LibraryPeriodicalsCard,
  periodicals_count: LibraryPeriodicalsCard,
  periodicals_total: LibraryPeriodicalsCard,
  periodical: LibraryPeriodicalsCard,
  view_members: LibraryViewMembersCard,

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
  student_absent: "studentabsent",
  substitute_class_teacher: "substituteclassteacher",
  homework_not_submited_student: "homeworknotsubmitedstudent",
  homework_not_submitted_student: "homeworknotsubmitedstudent",
  defaulter_student_list: "defaulterstudentlist",
  today_student_birthday: "todaystudentbirthday",
  comingsoon: "coming_soon",
  coming_soon_card: "coming_soon",
  timetable_for_teacher_dashbord: "timetableforteacherdashbord",
  todo_list_and_remainders: "todolistandremainders",
  todo_list_and_reminders: "todolistandremainders",
  ticket_for_dashboard: "ticketfordashboard",
  class_wise_academic_performance: "classwiseacademicperformance",
  subscriptionreminder: "subscription_reminder",
  subscription_reminder_list: "subscription_reminder",
  periodicalsreminder: "periodicals_reminder",
  periodicals_reminder_list: "periodicals_reminder",
  bookreturnpending: "book_return_pending",
  book_return_pending_list: "book_return_pending",
  booksavailability: "books_availability",
  books_available: "books_availability",
  viewmembers: "view_members",
  members_list: "view_members",
  periodical: "periodicals",
  periodicals_list: "periodicals",
  periodicals_card: "periodicals",
  periodicals_count: "periodicals",
  periodicals_total: "periodicals",
  periodical_count: "periodicals",
  periodical_total: "periodicals",
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
  {
    test: (normalized, type) =>
      (type === "table" || type === "list") &&
      normalized.includes("subscription") &&
      normalized.includes("reminder"),
    component: LibrarySubscriptionReminderCard,
  },
  {
    test: (normalized, type) =>
      (type === "table" || type === "list") &&
      normalized.includes("periodical") &&
      normalized.includes("reminder"),
    component: LibraryPeriodicalsReminderCard,
  },
  {
    test: (normalized, type) =>
      (type === "table" || type === "list") &&
      normalized.includes("book") &&
      normalized.includes("return"),
    component: LibraryBookReturnPendingCard,
  },
  {
    test: (normalized, type) =>
      type === "card" && normalized.includes("book") && normalized.includes("availability"),
    component: LibraryBooksAvailabilityCard,
  },
  {
    test: (normalized, type) =>
      type === "card" && normalized.includes("member"),
    component: LibraryViewMembersCard,
  },
  {
    test: (normalized, type) =>
      type === "card" && normalized.includes("periodical"),
    component: LibraryPeriodicalsCard,
  },
  {
    test: (normalized) =>
      normalized.includes("periodical") && !normalized.includes("reminder"),
    component: LibraryPeriodicalsCard,
  },
];

export const resolveWidgetComponent = (widget) => {
  const keyNormalized = normalizeWidgetKey(widget?.widget_key);
  const nameNormalized = normalizeWidgetKey(widget?.widget_name);
  const normalized = keyNormalized || nameNormalized;
  const type = getType(widget);

  const variants = [
    normalized,
    nameNormalized,
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
