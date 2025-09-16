// // All Routes protected code is here

// import { Route, Router, Routes } from "react-router-dom";
// import CreateStudent from "../componants/CreateStudent";
// import StudentList from "../componants/StudentList";
// import DemoTable from "../componants/DemoTable";
// import StudentEdit from "../componants/StudentEdit";
// import Login from "../componants/LoginForm";
// import NavBar from "../Layouts/NavBar";
// import UserProfile from "../componants/UserProfile";
// import LandingPage from "../componants/LandingPage";
// import AdminDashboard from "../componants/Dashbord/AdminDashboard";
// import EventCard from "../componants/Dashbord/EventCard";
// import NoticeBord from "../componants/Dashbord/NoticeBord";
// import StudentsChart from "../componants/Dashbord/Charts/StudentsChart";
// import PrivateRoute from "../utils/PrivateRoute";
// import ClassList from "../componants/TableComponentsNikhilbhai/ClassList";
// import Sections from "../componants/TableComponentsNikhilbhai/Sections";
// import NotificationPage from "../componants/NotificationPage";
// import StaffBirthdayTabList from "../componants/AllTableList/StaffBirthdayTabList";
// import TickitingCountList from "../componants/AllTableList/TickitingCountList";
// import FeePendingList from "../componants/AllTableList/FeePendingList.jsx";
// import ChangePassword from "../componants/ChangePassword.jsx";
// import PageNotFounde from "./PageNotFound.jsx";
// function Index() {
//   return (
//     <Routes>
//       <Route
//         path="/student-create"
//         element={<PrivateRoute element={<CreateStudent/>} />}
//       />
//       <Route
//         path="/student-list"
//         element={<PrivateRoute element={<StudentList/>} />}
//       />
//       <Route
//         path="/student/:id/edit"
//         element={<PrivateRoute element={<StudentEdit/>} />}
//       />
//       <Route
//         path="/student-demo-table"
//         element={<PrivateRoute element={<DemoTable/>} />}
//       />
//       <Route path="/eventcard" element={<PrivateRoute element={<EventCard/>} />} />
//       <Route
//         path="/dashboard"
//         element={<PrivateRoute element={<AdminDashboard/>} />}
//       />

//       <Route path="/navbar" element={<PrivateRoute element={<NavBar/>} />} />
//       <Route
//         path="/myprofile"
//         element={<PrivateRoute element={<UserProfile/>} />}
//       />

//       {/* Nikhil bhai pages */}
//       <Route path="/classlist" element={<PrivateRoute element={<ClassList/>} />} />
//       <Route path="/sections" element={<PrivateRoute element={<Sections/>} />} />
//       <Route path="/" element={<LandingPage />} />
//       <Route path="/login" element={<Login />} />
//       <Route path="/notification" element={<NotificationPage />} />
//       {/* <Route path="/notification" element={<NotificationPage />} /> */}
//       {/* ALlTableList EndPoints */}
//       {/* <StaffBirthdayTabList /> */}
//       {/* <TickitingCountList /> */}
//       {/* Routes for the listing cards */}
//       {/* changepassword route */}
//       <Route path="/changepassword" element={<ChangePassword />} />
//       <Route
//         path="/ticktinglist"
//         element={<PrivateRoute element={<TickitingCountList/>} />}
//       />
//       <Route
//         path="/feependinglist"
//         element={<PrivateRoute element={<FeePendingList/>} />}
//       />
//       <Route
//         path="/staffbirthlist"
//         element={<PrivateRoute element={<StaffBirthdayTabList/>} />}
//       />
//       {/* Page Not FOund Routes */}
//       <Route path="*" element={<PrivateRoute element={<PageNotFounde/>} />} />
//     </Routes>
//   );
// }

// export default Index;

// // second outlet used try

import { Route, Router, Routes } from "react-router-dom";
import CreateStudent from "../componants/StudentModel/CreateStudent.jsx";
import StudentList from "../componants/StudentList";
import DemoTable from "../componants/DemoTable";
import StudentEdit from "../componants/StudentEdit.jsx";
import Login from "../componants/LoginForm";
import NavBar from "../Layouts/NavBar";
import UserProfile from "../componants/UserProfile";
import LandingPage from "../componants/LandingPage";
import AdminDashboard from "../componants/Dashbord/AdminDashboard";
import EventCard from "../componants/Dashbord/EventCard";
import NoticeBord from "../componants/Dashbord/NoticeBord";

import StudentsChart from "../componants/Dashbord/Charts/StudentsChart";
import PrivateRoute from "../utils/PrivateRoute";
import ClassList from "../componants/MastersModule/ClassList/ClassList.jsx";
import Sections from "../componants/MastersModule/Section/Sections.jsx";
import NotificationPage from "../componants/NotificationPage";
import StaffBirthdayTabList from "../componants/AllTableList/StaffBirthdayTabList";
import TickitingCountList from "../componants/AllTableList/TickitingCountList";
import FeePendingList from "../componants/AllTableList/FeePendingList.jsx";
import ChangePassword from "../componants/ChangePassword.jsx";
import MainLayout from "../Layouts/MainLayout";
import PageNotFounde from "./PageNotFound.jsx";
import StaffList from "../componants/StaffComponents/StaffList.jsx";
import CreateStaff from "../componants/StaffComponents/CreateStaff.jsx";
import EditStaff from "../componants/StaffComponents/EditStaff.jsx";
import ViewStaff from "../componants/StaffComponents/ViewStaff.jsx";
import ShowRolesWithMenu from "../componants/RoleMangement/ShowRolesWithMenu.jsx";
import Roles from "../componants/RoleMangement/Roles.jsx";
import ManageRoleAccess from "../componants/RoleMangement/ManageRoleAccess.jsx";
import Menus from "../componants/RoleMangement/Menus.jsx";
import DivisionList from "../componants/MastersModule/Division/DivisionLIst.jsx";
import SubjectList from "../componants/MastersModule/Subject/SubjectList.jsx";
import ManageSubjectList from "../componants/MastersModule/SubjectAllotment/ManageSubjectList.jsx";
import ManageStudent from "../componants/StudentModel/ManageStudent.jsx";
import ViewStudent from "../componants/StudentModel/ViewStudent.jsx";
import SubjectAllotmentForReportCard from "../componants/SubjectAllotmentForReportCard.jsx/SubjectAllotmentForReportCard.jsx";
import SubjectForRc from "../componants/SubjectForRCard/SubjectForRc.jsx";
import NewStudentList from "../componants/StudentModel/NewStudentList.jsx";
import EditOfNewStudentList from "../componants/StudentModel/EditOfNewStudentList.jsx";
import AllotClassTeacher from "../componants/AllotClassTeacher/AllotClassTeacher.jsx";
import Exam from "../componants/Exam/Exam.jsx";
import Grade from "../componants/Grade/Grade.jsx";
import MarksHeading from "../componants/MarksHeading/MarksHeading.jsx";
import AllotMarksHeading from "../componants/AllotMarkHeading/AllotMaekHeading.jsx";
import CareTacker from "../componants/CareTacker/CareTacker.jsx";
import CreateCareTacker from "../componants/CareTacker/CreateCareTacker.jsx";
import EditCareTacker from "../componants/CareTacker/EditCareTacker.jsx";
import ViewCareTacker from "../componants/CareTacker/ViewCareTacker.jsx";
import BonafiedCertificates from "../componants/Certificates/BonafiedCertificate/BonafiedCertificates.jsx";
import SImpleBonafied from "../componants/Certificates/SimpleBonafied/SImpleBonafied.jsx";
import CastCertificate from "../componants/Certificates/CastCertificate/CastCertificate.jsx";
import CharacterCertificate from "../componants/Certificates/CharaterCertificates/CharacterCertificate.jsx";
import PercentageCertificate from "../componants/Certificates/PercentageCertificate/PercentageCertificate.jsx";
// import LeavingCertificate from "../componants/LeavingCertificate/LeavingCertificate.jsx";
import ManageLC from "../componants/LeavingCertificate/ManageLC.jsx";
import EditLeavingCertificate from "../componants/LeavingCertificate/EditLeavingCertificate.jsx";
import EditBonafied from "../componants/Certificates/BonafiedCertificate/EditBonafied.jsx";
import EditCastCertificate from "../componants/Certificates/CastCertificate/EditCastCertificate.jsx";
import EditCharacter from "../componants/Certificates/CharaterCertificates/EditCharacter.jsx";
import EditSimpleBonafied from "../componants/Certificates/SimpleBonafied/EditSimpleBonafied.jsx";
import EditPercentage from "../componants/Certificates/PercentageCertificate/EditPercentage.jsx";
import ManageLCStudent from "../componants/LCStudent/ManageLCStudent.jsx";
import ViewStudentLC from "../componants/LCStudent/ViewStudentLC.jsx";
import DeleteStudent from "../componants/DeleteStudent/DeleteStudent.jsx";
import ViewDeletedStudent from "../componants/DeleteStudent/ViewDeletedStudent.jsx";
import EditLCforDeleteStudent from "../componants/DeleteStudent/EditLCforDeleteStudent.jsx";
import LeavingCertificate from "../componants/LeavingCertificate/LeavingCertificate.jsx";
import NoticeAndSms from "../componants/NoticeAndSms/NoticeAndSms.jsx";
import ExamTImeTable from "../componants/MastersModule/ExamTimeTable/ExamTImeTable.jsx";
import CreateExamTimeTable from "../componants/MastersModule/ExamTimeTable/CreateExamTimeTable.jsx";
import EditExamTimeTable from "../componants/MastersModule/ExamTimeTable/EditExamTimeTable.jsx";
import ViewExamTimeTable from "../componants/MastersModule/ExamTimeTable/ViewExamTimeTable.jsx";
import SubstituteTeacher from "../componants/SubstituteTeacher/SubstituteTeacher.jsx";
import EditSubstituteTeacher from "../componants/SubstituteTeacher/EditSubstituteTeacher.jsx";
import SetLateTime from "../componants/SetLateTime/SetLateTime.jsx";
import PromotedStudent from "../componants/StudentModel/PromotedStudent/PromotedStudent.jsx";
import SendUserIdToParent from "../componants/SendUserIdToParent/SendUserIdToParent.jsx";
import LeaveAllocation from "../componants/Leave/LeaveAllocation.jsx";
import LeaveApplication from "../componants/LeaveApplications/LeaveApplication.jsx";
import CreateLeaveApplication from "../componants/LeaveApplications/CreateLeaveApplication.jsx";
import EditLeaveApplication from "../componants/LeaveApplications/EditLeaveApplication.jsx";
import ViewLeaveApplication from "../componants/LeaveApplications/ViewLeaveApplication.jsx";
import LeaveAllocationtoAllStaff from "../componants/LeaveApplications/LeaveAllocationtoAllStaff.jsx";
import SiblingMapping from "../componants/SiblingMapping/SiblingMapping.jsx";
import SubjectAllotmentHSC from "../componants/MastersModule/SubjectAllotmentForHSC/SubjectAllotmentHSC.jsx";
import LeaveType from "../componants/LeaveType/LeaveType.jsx";
import CategoryReligion from "../componants/CategoryReligion/CategoryReligion.jsx";
import AllotGRNumbers from "../componants/AllotGRNumber/AllotGRNumbers.jsx";
import UpdateStudentID from "../componants/UpdateStudentID/UpdateStudentID.jsx";
import StudentSearchUsingGRN from "../componants/StudentSearchUsingGRN/StudentSearchUsingGRN.jsx";
import HolidayList from "../componants/HolidayList/HolidayList.jsx";
import StudentIdCard from "../componants/IDCards/StudentIdCard.jsx";
import TeacherIdCard from "../componants/IDCards/TeacherIdCard.jsx";
import TimeTable from "../componants/TimeTableModule/TimeTable.jsx";
import CreateTimeTable from "../componants/TimeTableModule/CreateTimeTable.jsx";
import IDCardDetails from "../componants/IDCards/IDCardDetails.jsx";
import ListAdmFrmRep from "../componants/Reports/ListAdmFrmRep.jsx";
import Balanceleave from "../componants/Reports/Balanceleave.jsx";
import ConsolidatedLeave from "../componants/Reports/ConsolidatedLeave.jsx";
import StudentReport from "../componants/Reports/StudentReport.jsx";
import StudentContactDetailsReport from "../componants/Reports/StudentContactDetailsReport.jsx";
import PendingStudentId from "../componants/IDCards/PendingStudentId.jsx";
import CatWiseStudRepo from "../componants/Reports/CatWiseStudRepo.jsx";
import RelgWiseStudRepo from "../componants/Reports/RelgWiseStudRepo.jsx";
import GendrWiseStudRepo from "../componants/Reports/GendrWiseStudRepo.jsx";
import StudentRemarkReport from "../componants/Reports/StudentRemarkReport.jsx";
import GenWiseCatRepo from "../componants/Reports/GenWiseCatRepo.jsx";
import GenWiseRelignRepo from "../componants/Reports/GenWiseRelignRepo.jsx";
import NewStudentsRepo from "../componants/Reports/NewStudentsRepo.jsx";
import LeftStudentsRepo from "../componants/Reports/LeftStudentsRepo.jsx";
import FeesPaymentReport from "../componants/Reports/FeesPaymentReport.jsx";
import StaffReport from "../componants/Reports/StaffReport.jsx";
import HSCStudentsSubjectsReport from "../componants/Reports/HSCStudentsSubjectsReport.jsx";
import WorldlineFeePaymentReport from "../componants/Reports/WorldlineFeePaymentReport.jsx";
import RazorpayFeePaymentReport from "../componants/Reports/RazorpayFeePaymentReport.jsx";
import SubstituteTeacherMonthlyReport from "../componants/Reports/SubstituteTeacherMonthlyReport.jsx";
import SubstitutionWeeklyHoursReport from "../componants/Reports/SubstitutionWeeklyHoursReport.jsx";
import LeavingCertificateReport from "../componants/Reports/LeavingCertificateReport.jsx";
import PendingStudentIdCardReport from "../componants/Reports/PendingStudentIdCardReport.jsx";
// import TimetablePlanner from "../componants/TimeTablePlanner/CreateExamTimeTablePlanner/TimetablePlanner.jsx";
import TeacherPeriodAllocation from "../componants/TimeTablePlanner/CommonTableForAllTable/TeacherPeriodAllocation.jsx";
import CreateClassWisePeriodAllotment from "../componants/TimeTablePlanner/CommonTableForAllTable/CreateClassWisePeriodAllotment.jsx";
import ClassWisePeriodAllotment from "../componants/TimeTablePlanner/CommonTableForAllTable/ClassWisePeriodAllotment.jsx";
import EditTimetablePlanner from "../componants/TimeTablePlanner/EditTimeTablePlanner/EditTimetablePlanner.jsx";
import CreateTimetablePlanner from "../componants/TimeTablePlanner/CreateExamTimeTablePlanner/CreateTimetablePlanner.jsx";
// import TimetablePlanner from "../componants/TimeTablePlanner/TimetablePlanner.jsx";
import TimetablePlanner from "../componants/TimeTablePlanner/TimeTablePlanner.jsx";
import MonthlyAttendenceReport from "../componants/Reports/MonthlyAttendanceReport.jsx";
import ComingSoon from "../componants/common/CommingSoon/ComingSoon.jsx";
import ForgotPassword from "../Layouts/ForgotPassword.jsx";
import UpdateStudentIdCards from "../componants/IDCards/UpdateStudentIdCards.jsx";
import UploadStudentPhoto from "../componants/IDCards/UploadStudentPhoto.jsx";
import UploadParentPhoto from "../componants/IDCards/UploadParentPhoto.jsx";
import StudentAbsent from "../componants/AllTableList/StudentAbsent.jsx";
import NonTeachingStaff from "../componants/AllTableList/NonTeachingStaff.jsx";
import ApproveLessonP from "../componants/AllTableList/ApproveLessonP.jsx";
import ManageSubjectPrinciple from "../componants/MastersModule/SubjectAllotment/SubjectAllotmentForPrinciple/ManageSubjectPrinciple.jsx";
import NoticeAndSmsforStaff from "../componants/NoticeAndSms/NotiveAndSmsForStaff/NoticeAndSmsforStaff.jsx";
import DuplicatePaymentReport from "../componants/Reports/FinanceReport/DuplicatePaymentReport.jsx";
import DiscrepancyWorldlinePaymentReport from "../componants/Reports/FinanceReport/DiscrepancyWorldlinePaymentReport.jsx";
import ViewLeaveApplicationForPrinciple from "../componants/LeaveApplications/PrincipleLeaveApplication/ViewLeaveApplicationForPrinciple.jsx";
import LeaveApplicatonForPrinciple from "../componants/LeaveApplications/PrincipleLeaveApplication/LeaveApplicatonForPrinciple.jsx";
import EditLeaveApplicationForPrinciple from "../componants/LeaveApplications/PrincipleLeaveApplication/EditLeaveApplicationForPrinciple.jsx";
import CreateLeaveApplicationForPrinciple from "../componants/LeaveApplications/PrincipleLeaveApplication/CreateLeaveApplicationForPrinciple.jsx";
import StudentIdCardDetailedReport from "../componants/Reports/StudentReportPrinciple/StudentIdCardDetailedReport.jsx";
import TeacherAttendanceDailyReport from "../componants/Reports/TeacherAttendanceDailyReport.jsx";
import TeacherRemarkandObservation from "../componants/RemarkAndObserVationForPrinciple/RemarkandObservationforTeachers.jsx";
import EditTeacherRemarkandObservation from "../componants/RemarkAndObserVationForPrinciple/EditRemarkandObservationforTeachers.jsx";
import CreateRemarkandObservationTeacher from "../componants/RemarkAndObserVationForPrinciple/CreateRemarkandObservationforTeachers.jsx";
import ApproveLeave from "../componants/AllTableList/ApproveLeaveList.jsx";
import ApproveLeaveList from "../componants/AllTableList/ApproveLeaveList.jsx";
import LeaveApprove from "../componants/AllTableList/LeaveApproveForPrinciple/LeaveApprove (1).jsx";
import TeacherList from "../componants/AllTableList/TeacherList.jsx";
import EditLeaveApprove from "../componants/AllTableList/LeaveApproveForPrinciple/EditLeaveApprove (1).jsx";
import ViewTimeTablePlanner from "../componants/TimeTablePlanner/ViewExamTimeTablePlanner/ViewTimeTablePlanner.jsx";
import Stationery from "../componants/Stationery/Stationery.jsx";
import SiblingUnmapping from "../componants/SiblingUnmapping/SiblingUnmapping.jsx";
import UnmapDetails from "../componants/SiblingUnmapping/UnmapDetails.jsx";
import SubServiceType from "../componants/TicketingModule/SubServiceType.jsx";
import AppointmentWindow from "../componants/TicketingModule/ApponitmentWindow.jsx";
import CreateAppointmentWindow from "../componants/TicketingModule/CreateApponimentWindow.jsx";
import EditAppointmentWindow from "../componants/TicketingModule/EditApponitmentWindow.jsx";
import ServiceType from "../componants/TicketingModule/ServiceType.jsx";
import TicketList from "../componants/TicketingModule/TicketList.jsx";
import TicketReport from "../componants/TicketingModule/TicketReport.jsx";
import ViewTicket from "../componants/TicketingModule/ViewTicket.jsx";
import AllotSpecialRole from "../componants/MastersModule/AllotSpecialRole/AllotSpecialRole.jsx";
import RemarkObservationStudent from "../componants/RemarkAndObservationforStudent/RemarkObservationStudent.jsx";
import EditRemarkandObservation from "../componants/RemarkAndObservationforStudent/EditRemarkObservation.jsx";
import CreateRemarkObservationStudent from "../componants/RemarkAndObservationforStudent/CreateRemarkObservationStudent.jsx";
import CreateRemarkObservation from "../componants/RemarkAndObservationforStudent/CreateRemarkObservation.jsx";
import StaffMonthlyAttendanceRepo from "../componants/Reports/StaffMonthlyAttendanceRepo.jsx";
import FeesStructure from "../componants/Finance/FeesStructure.jsx";
import FeesCategoryStudentAllotment from "../componants/Finance/FeesCategoryStudentAllotment.jsx";
import FeesCategoryView from "../componants/Finance/FeesCategoryView.jsx";
import FeesOutStandingSendSms from "../componants/Finance/FeesOutStandingSendSms.jsx";
import SubstituteClassTeacher from "../componants/SubstituteClassTeacher/SubstituteClassTeacher.jsx";
import AttendanceMarkingStatusReport from "../componants/Reports/AttendanceReport/AttendanceMarkingStatusReport.jsx";
import StaffLeaveReport from "../componants/Reports/StaffReport/StaffLeaveReport.jsx";
import TeacherRemarkReport from "../componants/Reports/StaffReport/TeacherRemarkReport.jsx";
import AttendanceDetaileMontReport from "../componants/Reports/AttendanceReport/AttendanceDetaileMontReport.jsx";
import LessonPlanStatusReport from "../componants/Reports/LessonPlanReport/LessonPlanStatusReport.jsx";
import LessonPlanSummarisedReport from "../componants/Reports/LessonPlanReport/LessonPlanSummarisedReport.jsx";
import HomeworkStatusReport from "../componants/Reports/LessonPlanReport/HomeworkStatusReport.jsx";
import ClasswiseHomeworkDetailReport from "../componants/Reports/LessonPlanReport/ClasswiseHomeworkDetailReport.jsx";
import TeacherAttendanceMonthlyReport from "../componants/Reports/TeacherAttendanceMonthlyReport.jsx";
import FullTermMarksClass from "../componants/Reports/AssessmentrReportModule/FullTermMarksClass.jsx";
import LessonPlanDetailedView from "../componants/View/LessonPlanDetailedView.jsx";
import IciciFeePaymentReport from "../componants/Reports/IciciFeePaymentReport.jsx";
import ReportCardMarksClass from "../componants/Reports/AssessmentrReportModule/ReportCardMarksClass.jsx";
import Event from "../componants/Events/Event.jsx";
import CreateEvent from "../componants/Events/CreateEvent.jsx";
import EditEvent from "../componants/Events/EditEvent.jsx";
import MarkDropdownEditor from "../componants/Events/MarkDropdownEditor.jsx";
import ImportantLink from "../componants/ImportantLInks/ImportantLinks.jsx";
import SubjectMapping from "../componants/MastersModule/SubjectMapping/SubjectMapping.jsx";
import BookRequisition from "../componants/BookRequisition/BookRequisition.jsx";
import TeacherMonthlyAttendanceDetailedReport from "../componants/Reports/TeacherAttendanceMonthlyReport.jsx";
import BackgroundChanger from "../Layouts/BackgroundColorSelect/BackgroundChanger.jsx";
import HomeworkNotAssignReport from "../componants/Reports/CurriculumReport/HomewrokNotAssignReport.jsx";
import News from "../componants/NewsModule/News.jsx";
import RoleForEvent from "../componants/Events/RoleForEvent.jsx";
import EditApproveStationery from "../componants/Stationery/EditApproveStationery.jsx";
import ApproveStationery from "../componants/Stationery/ApproveStationery.jsx";
import ViewBookAvailability from "../componants/View/ViewBookAvailability.jsx";
import UpdateClasswiseStudentDetails from "../componants/StudentModel/UpdateClaswiseStudenDeails/UpdateClasswiseStudentDetails.jsx";
import HPCSubjectList from "../componants/MastersModule/HPCSubectModule/HPCSubjectList.jsx";
import HPCSubjectAllotment from "../componants/MastersModule/HPCSubectModule/HPCSubjectAllotment.jsx";
import Domain from "../componants/MastersModule/DomainModules/Domain.jsx";
import EditDomainDetails from "../componants/MastersModule/DomainModules/EditDomainDetails.jsx";
import CreateDomainDetails from "../componants/MastersModule/DomainModules/CreateDomainDetails.jsx";
import DomainDetails from "../componants/MastersModule/DomainModules/DomainDetails.jsx";
import DomainCompentencies from "../componants/MastersModule/DomainModules/DomainCompentencies.jsx";
import SelfAssessment from "../componants/MastersModule/DomainModules/SelfAssessment/SelfAssessment.jsx";
import SelfAssamentMaster from "../componants/MastersModule/DomainModules/SelfAssessment/SelfAssamentMaster.jsx";

// import Menus from "../c";
function Index() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/notification" element={<NotificationPage />} />
      <Route path="/forgotPassword" element={<ForgotPassword />} />
      <Route path="/" element={<MainLayout />}>
        {/* Role Management */}
        <Route
          path="/manageMenus"
          element={<PrivateRoute element={<Menus />} />}
        />
        {/* background changer component */}
        <Route
          path="/backgroundChanger"
          element={<PrivateRoute element={<BackgroundChanger />} />}
        />
        <Route
          path="/manageRoles"
          element={<PrivateRoute element={<Roles />} />}
        />
        <Route
          path="/manageRoleAccess"
          element={<PrivateRoute element={<ShowRolesWithMenu />} />}
        />
        {/* News Module */}
        <Route path="/news" element={<PrivateRoute element={<News />} />} />
        {/* Important links */}
        <Route
          path="/importantLinks"
          element={<PrivateRoute element={<ImportantLink />} />}
        />
        {/* Subjectmapping */}
        <Route
          path="/subjetMappinig"
          element={<PrivateRoute element={<SubjectMapping />} />}
        />
        {/* Book requisition */}
        <Route
          path="/bookRequisition"
          element={<PrivateRoute element={<BookRequisition />} />}
        />
        <Route
          path="/manageRoleAccess/:roleId"
          element={<PrivateRoute element={<ManageRoleAccess />} />}
        />
        {/* <Route
          path="/TestForAllfunctionlity"
          // path="#"
          element={<PrivateRoute element={<TestForAllfunctionlity/>} />}
        /> */}
        <Route
          path="/student-create"
          element={<PrivateRoute element={<CreateStudent />} />}
        />
        <Route
          path="/student-list"
          element={<PrivateRoute element={<StudentList />} />}
        />
        <Route
          path="/student/:id/edit"
          element={<PrivateRoute element={<StudentEdit />} />}
        />
        <Route
          path="/student-demo-table"
          element={<PrivateRoute element={<DemoTable />} />}
        />
        {/* comming soon file */}
        <Route
          path="/comingSoon"
          // path="#"
          element={<PrivateRoute element={<ComingSoon />} />}
        />
        {/* All Certificates  */}
        <Route
          path="/bonafiedCertificates"
          // path="#"
          element={<PrivateRoute element={<BonafiedCertificates />} />}
        />
        <Route
          path="/bonafied/edit/:id"
          // path="#"
          element={<PrivateRoute element={<EditBonafied />} />}
        />
        {/* Cast certificate fsd */}
        <Route
          path="/castCertificate"
          // path="#"
          element={<PrivateRoute element={<CastCertificate />} />}
        />
        <Route
          path="/studentCast/edit/:id"
          // path="#"
          element={<PrivateRoute element={<EditCastCertificate />} />}
        />
        <Route
          path="/percentageCertificate"
          // path="#"
          element={<PrivateRoute element={<PercentageCertificate />} />}
        />
        <Route
          path="/stud_Percent/edit/:id"
          // path="#"
          element={<PrivateRoute element={<EditPercentage />} />}
        />
        {/* CharacterCertifiacte */}
        <Route
          path="/characterCertificate"
          // path="#"
          element={<PrivateRoute element={<CharacterCertificate />} />}
        />
        <Route
          path="/stud_Char/edit/:id"
          // path="#"
          element={<PrivateRoute element={<EditCharacter />} />}
        />
        {/* Simple Bonafied */}
        <Route
          path="/simpleBonafied"
          // path="#"
          element={<PrivateRoute element={<SImpleBonafied />} />}
        />
        <Route
          path="/sm_Bonafied/edit/:id"
          // path="#"
          element={<PrivateRoute element={<EditSimpleBonafied />} />}
        />
        {/* LC Student */}
        <Route
          path="/leavingCertificate"
          // path="#"
          element={<PrivateRoute element={<ManageLC />} />}
        />
        <Route
          path="/studentLC/view/:id"
          // path="#"
          element={<PrivateRoute element={<ViewStudentLC />} />}
        />
        {/* Deleted Student Module */}
        {/* LC Student */}
        <Route
          path="/manageStudentLC"
          // path="#"
          element={<PrivateRoute element={<ManageLCStudent />} />}
        />
        {/* leaving_certificate */}
        <Route
          path="/deleteStudent"
          // path="#"
          element={<PrivateRoute element={<DeleteStudent />} />}
        />
        <Route
          path="/deletedStudent/view/:id"
          // path="#"
          element={<PrivateRoute element={<ViewDeletedStudent />} />}
        />
        <Route
          path="/deletedStudent/edit/:id"
          // path="#"
          element={<PrivateRoute element={<EditLCforDeleteStudent />} />}
        />
        {/* <Route
          path="/student/edit/:id"
          element={<PrivateRoute element={<CreateStudent/>} />}
        /> */}
        <Route
          path="/studentLC/edit/:id"
          // path="#"
          element={<PrivateRoute element={<EditLeavingCertificate />} />}
        />
        {/* Promote Student Module */}
        <Route
          path="/PromoteStudent"
          // path="#"
          element={<PrivateRoute element={<PromotedStudent />} />}
        />
        {/* SendUserIdToParent Module */}
        <Route
          path="/SendUserIdToParent"
          // path="#"

          element={<PrivateRoute element={<SendUserIdToParent />} />}
        />
        {/* Sibling Mapping Module */}
        <Route
          path="/SiblingMapping"
          element={<PrivateRoute element={<SiblingMapping />} />}
        />
        {/* Staff endPoints */}
        <Route
          path="/StaffList"
          element={<PrivateRoute element={<StaffList />} />}
        />
        <Route
          path="/CreateStaff"
          element={<PrivateRoute element={<CreateStaff />} />}
        />
        <Route
          path="/staff/edit/:id"
          element={<PrivateRoute element={<EditStaff />} />}
        />
        <Route
          path="/staff/view/:id"
          element={<PrivateRoute element={<ViewStaff />} />}
        />
        {/* Leave Type */}
        <Route
          path="/leavetype"
          element={<PrivateRoute element={<LeaveType />} />}
        />
        {/* LeaveAllocation */}
        <Route
          path="/LeaveAllocation"
          element={<PrivateRoute element={<LeaveAllocation />} />}
        />
        {/* Leave applications */}
        <Route
          path="/LeaveApplication"
          element={<PrivateRoute element={<LeaveApplication />} />}
        />
        <Route
          path="/createLeaveApplication"
          element={<PrivateRoute element={<CreateLeaveApplication />} />}
        />
        <Route
          path="/leaveApplication/edit/:id"
          element={<PrivateRoute element={<EditLeaveApplication />} />}
        />
        <Route
          path="/leaveApplication/view/:id"
          element={<PrivateRoute element={<ViewLeaveApplication />} />}
        />
        <Route
          path="/leaveAllocationtoAllStaff"
          element={<PrivateRoute element={<LeaveAllocationtoAllStaff />} />}
        />
        {/* Substitute class teacher module */}
        <Route
          path="/substituteClassTeacher"
          element={<PrivateRoute element={<SubstituteClassTeacher />} />}
        />
        {/* Substitute Teacher */}
        <Route
          path="/SubstituteTeacher"
          element={<PrivateRoute element={<SubstituteTeacher />} />}
        />
        <Route
          path="/substitute/edit/:id"
          element={<PrivateRoute element={<EditSubstituteTeacher />} />}
        />
        {/*  Notice And Sms Module */}
        <Route
          path="/noticeAndSms"
          element={<PrivateRoute element={<NoticeAndSms />} />}
        />
        {/* Holiday List module */}
        <Route
          path="/holidayList"
          element={<PrivateRoute element={<HolidayList />} />}
        />
        {/* CareTacker */}
        <Route
          path="/careTacker"
          element={<PrivateRoute element={<CareTacker />} />}
        />
        <Route
          path="/CreateCareTacker"
          element={<PrivateRoute element={<CreateCareTacker />} />}
        />
        <Route
          path="/CareTacker/edit/:id"
          element={<PrivateRoute element={<EditCareTacker />} />}
        />
        <Route
          path="/CareTacker/view/:id"
          element={<PrivateRoute element={<ViewCareTacker />} />}
        />
        {/* TimeTablePlanner module */}
        <Route
          path="/teacherPeriodAlloction"
          element={<PrivateRoute element={<TeacherPeriodAllocation />} />}
        />
        {/* CreateClassWisePeriodAllotment module */}
        <Route
          path="/createClassWisePAllot"
          element={
            <PrivateRoute element={<CreateClassWisePeriodAllotment />} />
          }
        />
        {/* ClassWisePeriodAllotment Module */}
        <Route
          path="/classWisePAllot"
          element={<PrivateRoute element={<ClassWisePeriodAllotment />} />}
        />
        {/* Set Late Time module */}
        <Route
          path="/SetLateTime"
          element={<PrivateRoute element={<SetLateTime />} />}
        />
        <Route
          path="/eventcard"
          element={<PrivateRoute element={<EventCard />} />}
        />
        <Route
          path="/dashboard"
          element={<PrivateRoute element={<AdminDashboard />} />}
        />
        <Route
          path="/myprofile"
          element={<PrivateRoute element={<UserProfile />} />}
        />
        {/* Allot special Role */}
        <Route
          path="/allotSpecialRole"
          element={<PrivateRoute element={<AllotSpecialRole />} />}
        />
        <Route
          path="/classes"
          element={<PrivateRoute element={<ClassList />} />}
        />
        {/* Division module */}
        <Route
          path="/division"
          element={<PrivateRoute element={<DivisionList />} />}
        />
        {/* Division module */}
        <Route
          path="/subjects"
          element={<PrivateRoute element={<SubjectList />} />}
        />
        {/* SubjectAllotment module */}
        <Route
          path="/subject_allotment"
          element={<PrivateRoute element={<ManageSubjectList />} />}
        />
        {/* Subject Allotment for HSC */}
        <Route
          path="/SubjectAllotmentHSC"
          element={<PrivateRoute element={<SubjectAllotmentHSC />} />}
        />
        {/* Domain and Domain Compentencies modules */}
        <Route
          path="/domainCompentencies"
          element={<PrivateRoute element={<DomainCompentencies />} />}
        />
        <Route
          path="/domainDetails"
          element={<PrivateRoute element={<DomainDetails />} />}
        />
        <Route
          path="/createDomainDetails"
          element={<PrivateRoute element={<CreateDomainDetails />} />}
        />
        <Route
          path="/editDomainDetails/:id"
          element={<PrivateRoute element={<EditDomainDetails />} />}
        />
        <Route path="/domain" element={<PrivateRoute element={<Domain />} />} />
        {/* HPCS subject list module */}
        <Route
          path="/hpcSubjectList"
          element={<PrivateRoute element={<HPCSubjectList />} />}
        />
        <Route
          path="/hpcSubjectAllotment"
          element={<PrivateRoute element={<HPCSubjectAllotment />} />}
        />
        {/*  */}
        <Route
          path="/selfAssessmentMaster"
          element={<PrivateRoute element={<SelfAssamentMaster />} />}
        />
        <Route
          path="/selfAssessment"
          element={<PrivateRoute element={<SelfAssessment />} />}
        />
        {/* SubjectForReportCard module */}
        <Route
          path="/subjectforReportcard"
          element={<PrivateRoute element={<SubjectForRc />} />}
        />
        {/* SubjectAllotmentForReportCard module */}
        <Route
          path="/managesubjectforreportcard"
          element={<PrivateRoute element={<SubjectAllotmentForReportCard />} />}
        />
        {/* Student module */}
        <Route
          path="/manageStudent"
          element={<PrivateRoute element={<ManageStudent />} />}
        />
        <Route
          path="/newStudentList"
          element={<PrivateRoute element={<NewStudentList />} />}
        />
        {/* <Route
          path="/student-create"
          element={<PrivateRoute element={<CreateStudent/>} />}
        /> */}
        <Route
          path="/student/edit/:id"
          element={<PrivateRoute element={<CreateStudent />} />}
        />
        <Route
          path="/student/view/:id"
          element={<PrivateRoute element={<ViewStudent />} />}
        />
        <Route
          path="/newStudetEdit/edit/:id"
          element={<PrivateRoute element={<EditOfNewStudentList />} />}
        />
        {/* AllotClassTeacher */}
        <Route
          path="/allotClassTeacher"
          element={<PrivateRoute element={<AllotClassTeacher />} />}
        />
        {/* Allot GR Number Module */}
        <Route
          path="/allotGRNumber"
          element={<PrivateRoute element={<AllotGRNumbers />} />}
        />
        {/* StudentSearchUsingGRN in the navbar */}
        <Route
          path="/StudentSearchUsingGRN"
          element={<PrivateRoute element={<StudentSearchUsingGRN />} />}
        />
        {/* UpdateStudentID Module */}
        <Route
          path="/updateStudentID"
          element={<PrivateRoute element={<UpdateStudentID />} />}
        />
        {/* Time Table Planner */}
        <Route
          path="/timetablePlanner"
          element={<PrivateRoute element={<TimetablePlanner />} />}
        />
        {/* EditTimetablePlanner module */}
        <Route
          path="/timetablePlanner/edit/:id"
          element={<PrivateRoute element={<EditTimetablePlanner />} />}
        />
        {/* Create TimeTable Module */}
        <Route
          path="/createTimetablePlanner"
          element={<PrivateRoute element={<CreateTimetablePlanner />} />}
        />
        {/* TimeTable Module */}
        <Route
          path="/timeTable"
          element={<PrivateRoute element={<TimeTable />} />}
        />
        {/* Create TimeTable Module */}
        <Route
          path="/createTimeTable"
          element={<PrivateRoute element={<CreateTimeTable />} />}
        />
        {/*Update CategoryReligion Module */}
        <Route
          path="/categoryReligion"
          element={<PrivateRoute element={<CategoryReligion />} />}
        />
        {/* ExamMdule */}
        <Route path="/exams" element={<PrivateRoute element={<Exam />} />} />
        {/* Grade Module */}
        <Route path="/grades" element={<PrivateRoute element={<Grade />} />} />
        {/* MarksHeading Moudle */}
        <Route
          path="/marksHeading"
          element={<PrivateRoute element={<MarksHeading />} />}
        />
        {/* AllotMarksHeading module */}
        <Route
          path="/allot_Marks_Heading"
          element={<PrivateRoute element={<AllotMarksHeading />} />}
        />
        {/* Exam Time Table */}
        <Route
          path="/exam_TImeTable"
          element={<PrivateRoute element={<ExamTImeTable />} />}
        />
        <Route
          path="/creaExamTimeTable"
          element={<PrivateRoute element={<CreateExamTimeTable />} />}
        />
        <Route
          path="/viewTimeTable/view/:id"
          element={<PrivateRoute element={<ViewTimeTablePlanner />} />}
        />
        <Route
          path="/examTimeTable/edit/:id"
          element={<PrivateRoute element={<EditExamTimeTable />} />}
        />
        <Route
          path="/examTimeTable/view/:id"
          element={<PrivateRoute element={<ViewExamTimeTable />} />}
        />
        <Route
          path="/sections"
          element={<PrivateRoute element={<Sections />} />}
        />
        {/* Event modules Card Module */}
        <Route path="/event" element={<PrivateRoute element={<Event />} />} />
        <Route
          path="/createEvent"
          element={<PrivateRoute element={<CreateEvent />} />}
        />
        <Route
          path="/editEvent/:id"
          element={<PrivateRoute element={<EditEvent />} />}
        />
        <Route
          path="/markDropdown"
          element={<PrivateRoute element={<MarkDropdownEditor />} />}
        />
        {/* Roles for events */}
        <Route
          path="/roleForEvent"
          element={<PrivateRoute element={<RoleForEvent />} />}
        />
        {/* Id Cards Module */}
        {/* Student Id Card Module */}
        <Route
          path="/studentIdCard"
          element={<PrivateRoute element={<StudentIdCard />} />}
        />
        {/* Teacher ID Card Module */}
        <Route
          path="/teacherIdCard"
          element={<PrivateRoute element={<TeacherIdCard />} />}
        />
        <Route
          path="/updateStudentIdCard"
          element={<PrivateRoute element={<UpdateStudentIdCards />} />}
        />
        {/* ID card Photo Upload */}
        <Route
          path="/uploadStudentPhoto/:id"
          element={<PrivateRoute element={<UploadStudentPhoto />} />}
        />
        <Route
          path="/uploadParentPhoto/:id"
          element={<PrivateRoute element={<UploadParentPhoto />} />}
        />
        {/* Pending StudentID Card Module */}
        <Route
          path="/pendingStudentId"
          element={<PrivateRoute element={<PendingStudentId />} />}
        />
        {/* Id Card Details */}
        <Route
          path="/iDCardDetails/:id"
          element={<PrivateRoute element={<IDCardDetails />} />}
        />
        {/* Remark and Observation for Student  */}
        <Route
          path="/remObsStudent"
          element={<PrivateRoute element={<RemarkObservationStudent />} />}
        />
        <Route
          path="/remObsStudent/edit/:id"
          element={<PrivateRoute element={<EditRemarkandObservation />} />}
        />
        <Route
          path="/createremObsStudent"
          element={
            <PrivateRoute element={<CreateRemarkObservationStudent />} />
          }
        />
        <Route
          path="createremObs"
          element={<PrivateRoute element={<CreateRemarkObservation />} />}
        />
        {/* Ticketing module start */}
        <Route
          path="/serviceType"
          element={<PrivateRoute element={<ServiceType />} />}
        />
        <Route
          path="/subServiceType"
          element={<PrivateRoute element={<SubServiceType />} />}
        />
        <Route
          path="/appointmentWindow"
          element={<PrivateRoute element={<AppointmentWindow />} />}
        />
        <Route
          path="/CreateAppWindow"
          element={<PrivateRoute element={<CreateAppointmentWindow />} />}
        />
        <Route
          path="/EditAppWindow/edit/:id"
          element={<PrivateRoute element={<EditAppointmentWindow />} />}
        />
        <Route
          path="/ticketList"
          element={<PrivateRoute element={<TicketList />} />}
        />
        <Route
          path="/ticketReport"
          element={<PrivateRoute element={<TicketReport />} />}
        />
        <Route
          path="/ticketList/view/:id"
          element={<PrivateRoute element={<ViewTicket />} />}
        />
        {/* Report start */}
        {/* List Of Admission Form Reports */}
        <Route
          path="/listAdmFrmRep"
          element={<PrivateRoute element={<ListAdmFrmRep />} />}
        />
        {/* Balance Leave Module */}
        <Route
          path="/balanceleave"
          element={<PrivateRoute element={<Balanceleave />} />}
        />
        {/* Consolidated Leave Report Module */}
        <Route
          path="/consolidatedLeave"
          element={<PrivateRoute element={<ConsolidatedLeave />} />}
        />
        {/* Student Report Module */}
        <Route
          path="/studentReport"
          element={<PrivateRoute element={<StudentReport />} />}
        />
        {/* Student Report Module */}
        <Route
          path="/studentContactDetailsReport"
          element={<PrivateRoute element={<StudentContactDetailsReport />} />}
        />
        {/* Student Categorywise  Report Module */}
        <Route
          path="/catWiseStudRepo"
          element={<PrivateRoute element={<CatWiseStudRepo />} />}
        />
        {/* Student Religion Wise  Report Module */}
        <Route
          path="/relgWiseStudRepo"
          element={<PrivateRoute element={<RelgWiseStudRepo />} />}
        />
        {/* Student GenWiseRelignRepo Report Module */}
        <Route
          path="/genWiseRelignRepo"
          element={<PrivateRoute element={<GenWiseRelignRepo />} />}
        />
        {/* Student Gender Wise  Report Module */}
        <Route
          path="/gendrWiseStudRepo"
          element={<PrivateRoute element={<GendrWiseStudRepo />} />}
        />
        {/* Student StudentRemarkReport  Module */}
        <Route
          path="/studentRemarkReport"
          element={<PrivateRoute element={<StudentRemarkReport />} />}
        />
        {/* Student Gender Wise  Report Module */}
        <Route
          path="/genWiseCatRepo"
          element={<PrivateRoute element={<GenWiseCatRepo />} />}
        />
        {/* Student Gender Wise  Report Module */}
        <Route
          path="/newStudentsRepo"
          element={<PrivateRoute element={<NewStudentsRepo />} />}
        />
        {/* Student Gender Wise  Report Module */}
        <Route
          path="/leftStudentsRepo"
          element={<PrivateRoute element={<LeftStudentsRepo />} />}
        />
        {/* Staff Report Module */}
        <Route
          path="/staffReport"
          element={<PrivateRoute element={<StaffReport />} />}
        />
        {/* Staff Leave report  */}
        <Route
          path="/staffLeaveReport"
          element={<PrivateRoute element={<StaffLeaveReport />} />}
        />
        {/* Teacher Remark Report */}
        {/* Staff Report Module */}
        <Route
          path="/teacherRemarkReport"
          element={<PrivateRoute element={<TeacherRemarkReport />} />}
        />
        <Route
          path="/AttendanceDetaileMontReport"
          element={<PrivateRoute element={<AttendanceDetaileMontReport />} />}
        />
        {/* Curriculum report  */}
        <Route
          path="/homeworkNotAssignReport"
          element={<PrivateRoute element={<HomeworkNotAssignReport />} />}
        />
        {/* Lesson plane report modules */}
        <Route
          path="/lessonPlanStatusReport"
          element={<PrivateRoute element={<LessonPlanStatusReport />} />}
        />
        <Route
          path="/lessonPlanSummarisedReport"
          element={<PrivateRoute element={<LessonPlanSummarisedReport />} />}
        />
        <Route
          path="/homeworkStatusReport"
          element={<PrivateRoute element={<HomeworkStatusReport />} />}
        />
        <Route
          path="/classwiseHomeworkDetailReport"
          element={<PrivateRoute element={<ClasswiseHomeworkDetailReport />} />}
        />
        {/* Staff Monthly Attendance Report */}
        <Route
          path="/staffMonthlyAttendanceRepo"
          element={
            <PrivateRoute element={<TeacherAttendanceMonthlyReport />} />
          }
        />
        {/* Teacher Monthly Attendance Detailed Report Monthly Attendance Report */}
        <Route
          path="/teacherAttendanceMonthlyReport"
          element={
            <PrivateRoute
              element={<TeacherMonthlyAttendanceDetailedReport />}
            />
          }
        />{" "}
        {/* UpdateClasswiseStudentDetails module */}
        <Route
          path="/updateClasswiseStudentDetails"
          element={<PrivateRoute element={<UpdateClasswiseStudentDetails />} />}
        />
        {/* Lesson plan Detailed Report */}
        <Route
          path="/lessonPlanDetailedView"
          element={<PrivateRoute element={<LessonPlanDetailedView />} />}
        />
        {/* View Book Availability module*/}
        <Route
          path="/viewBookAvailability"
          element={<PrivateRoute element={<ViewBookAvailability />} />}
        />
        {/* Attendance Marking Status Report */}
        <Route
          path="/attendanceMarkingStatusRepo"
          element={<PrivateRoute element={<AttendanceMarkingStatusReport />} />}
        />
        {/* monthlyAttendenceReport module */}
        <Route
          path="/monthlyAttendenceRepo"
          element={<PrivateRoute element={<MonthlyAttendenceReport />} />}
        />
        {/* Full Term Marks Of A Class repor */}
        <Route
          path="/fullTermMarksClass"
          element={<PrivateRoute element={<FullTermMarksClass />} />}
        />
        {/* Report Card Marks Of A Class repor */}
        <Route
          path="/reportCardMarksClass"
          element={<PrivateRoute element={<ReportCardMarksClass />} />}
        />
        {/* Student Gender Wise  Report Module */}
        <Route
          path="/hSCStudSubjectsRepo"
          element={<PrivateRoute element={<HSCStudentsSubjectsReport />} />}
        />
        {/* Fee payment report module */}
        <Route
          path="/feePaymentRepo"
          element={<PrivateRoute element={<FeesPaymentReport />} />}
        />
        {/* Worldline Fee Payment Report  module */}
        <Route
          path="/worldlinfeePayRepo"
          element={<PrivateRoute element={<WorldlineFeePaymentReport />} />}
        />
        {/* IciciFeePaymentReport Fee Payment Report  module */}
        <Route
          path="/IciciFeePaymentReport"
          element={<PrivateRoute element={<IciciFeePaymentReport />} />}
        />
        {/* Razorpay Fee Payment Reportmodule */}
        <Route
          path="/rozorpayfeePayRepo"
          element={<PrivateRoute element={<RazorpayFeePaymentReport />} />}
        />
        {/* Substitute Teacher Monthly Report Reportmodule */}
        <Route
          path="/SubsTeaMonthlyRepo"
          element={
            <PrivateRoute element={<SubstituteTeacherMonthlyReport />} />
          }
        />
        {/* Substitution Weekly Hours Report Report Reportmodule */}
        <Route
          path="/SubsWklyHrsRepo"
          element={<PrivateRoute element={<SubstitutionWeeklyHoursReport />} />}
        />
        {/* Leaving certificate Report Report Reportmodule */}
        <Route
          path="/LeavCertifRepo"
          element={<PrivateRoute element={<LeavingCertificateReport />} />}
        />
        {/* PendingStudentIdcard Report Reportmodule */}
        <Route
          path="/PndingStudIdCrdRepo"
          element={<PrivateRoute element={<PendingStudentIdCardReport />} />}
        />
        <Route path="/notification" element={<NotificationPage />} />
        <Route path="/changepassword" element={<ChangePassword />} />
        <Route
          path="/ticktinglist"
          element={<PrivateRoute element={<TickitingCountList />} />}
        />
        {/* Approve leave module card of dashboard */}
        <Route
          path="/approveLeavelist"
          element={<PrivateRoute element={<LeaveApprove />} />}
        />
        <Route
          path="/leaveApprove/edit/:id"
          element={<PrivateRoute element={<EditLeaveApprove />} />}
        />
        <Route
          path="/feependinglist"
          element={<PrivateRoute element={<FeePendingList />} />}
        />
        <Route
          path="/studentAbsent"
          element={<PrivateRoute element={<StudentAbsent />} />}
        />
        <Route
          path="/nonTeachingStaff"
          element={<PrivateRoute element={<NonTeachingStaff />} />}
        />
        <Route
          path="/approveLessonP"
          element={<PrivateRoute element={<ApproveLessonP />} />}
        />
        <Route
          path="/staffbirthlist"
          element={<PrivateRoute element={<StaffBirthdayTabList />} />}
        />
        <Route
          path="/teacherList"
          element={<PrivateRoute element={<TeacherList />} />}
        />
        {/* For Principle or management login routes RoleId is M */}
        <Route
          path="/manageSubjectP"
          element={<PrivateRoute element={<ManageSubjectPrinciple />} />}
        />
        {/* For notice and sms for staff */}
        <Route
          path="/staffNoticeAndSms"
          element={<PrivateRoute element={<NoticeAndSmsforStaff />} />}
        />
        {/* Finacne Report */}
        <Route
          path="/duplicatePaymentReport"
          element={<PrivateRoute element={<DuplicatePaymentReport />} />}
        />
        {/* Leave APplication for principle */}
        <Route
          path="/LeaveApplicationP"
          element={<PrivateRoute element={<LeaveApplicatonForPrinciple />} />}
        />
        <Route
          path="/createLeaveApplicationP"
          element={
            <PrivateRoute element={<CreateLeaveApplicationForPrinciple />} />
          }
        />
        <Route
          path="/leaveApplicationP/edit/:id"
          element={
            <PrivateRoute element={<EditLeaveApplicationForPrinciple />} />
          }
        />
        <Route
          path="/leaveApplicationP/view/:id"
          element={
            <PrivateRoute element={<ViewLeaveApplicationForPrinciple />} />
          }
        />
        {/* dw pay report */}
        <Route
          path="/dwPaymentReport"
          element={
            <PrivateRoute element={<DiscrepancyWorldlinePaymentReport />} />
          }
        />
        {/* StudenIdCard Detailed report */}
        <Route
          path="/studentIdcDReport"
          element={<PrivateRoute element={<StudentIdCardDetailedReport />} />}
        />
        {/* Stationary module*/}
        <Route
          path="/stationery"
          element={<PrivateRoute element={<Stationery />} />}
        />
        <Route
          path="/approveStationery/edit/:id"
          element={<PrivateRoute element={<EditApproveStationery />} />}
        />
        <Route
          path="/approveStationery"
          element={<PrivateRoute element={<ApproveStationery />} />}
        />
        {/* Siblings unMapping module*/}
        <Route
          path="/siblingUnmapping"
          element={<PrivateRoute element={<SiblingUnmapping />} />}
        />
        {/* Stationary module*/}
        <Route
          path="/unmapDetails/edit/:id"
          element={<PrivateRoute element={<UnmapDetails />} />}
        />
        {/* TeacherAttendance Daily Report  report */}
        <Route
          path="/TeacherADReport"
          element={<PrivateRoute element={<TeacherAttendanceDailyReport />} />}
        />
        {/* Remark and observation modules for principle */}
        <Route
          path="/remObsTeacher"
          element={<PrivateRoute element={<TeacherRemarkandObservation />} />}
        />
        <Route
          path="/remObsTeacher/edit/:id"
          element={
            <PrivateRoute element={<EditTeacherRemarkandObservation />} />
          }
        />
        {/* Finance */}
        <Route
          path="/feesStructure"
          element={<PrivateRoute element={<FeesStructure />} />}
        />
        <Route
          path="/feesCatStudAllot"
          element={<PrivateRoute element={<FeesCategoryStudentAllotment />} />}
        />
        <Route
          path="/feesCategoryView"
          element={<PrivateRoute element={<FeesCategoryView />} />}
        />
        <Route
          path="/feesOutStandingSendSms"
          element={<PrivateRoute element={<FeesOutStandingSendSms />} />}
        />
      </Route>

      {/* Page Not FOund Routes */}
      <Route path="*" element={<PrivateRoute element={<PageNotFounde />} />} />
    </Routes>
  );
}

export default Index;
