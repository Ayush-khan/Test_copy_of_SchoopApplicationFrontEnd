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
//         element={<PrivateRoute element={CreateStudent} />}
//       />
//       <Route
//         path="/student-list"
//         element={<PrivateRoute element={StudentList} />}
//       />
//       <Route
//         path="/student/:id/edit"
//         element={<PrivateRoute element={StudentEdit} />}
//       />
//       <Route
//         path="/student-demo-table"
//         element={<PrivateRoute element={DemoTable} />}
//       />
//       <Route path="/eventcard" element={<PrivateRoute element={EventCard} />} />
//       <Route
//         path="/dashboard"
//         element={<PrivateRoute element={AdminDashboard} />}
//       />

//       <Route path="/navbar" element={<PrivateRoute element={NavBar} />} />
//       <Route
//         path="/myprofile"
//         element={<PrivateRoute element={UserProfile} />}
//       />

//       {/* Nikhil bhai pages */}
//       <Route path="/classlist" element={<PrivateRoute element={ClassList} />} />
//       <Route path="/sections" element={<PrivateRoute element={Sections} />} />
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
//         element={<PrivateRoute element={TickitingCountList} />}
//       />
//       <Route
//         path="/feependinglist"
//         element={<PrivateRoute element={FeePendingList} />}
//       />
//       <Route
//         path="/staffbirthlist"
//         element={<PrivateRoute element={StaffBirthdayTabList} />}
//       />
//       {/* Page Not FOund Routes */}
//       <Route path="*" element={<PrivateRoute element={PageNotFounde} />} />
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
import DivisionList from "../componants/MastersModule/TableComponentsNikhilbhai/Division/DivisionLIst.jsx";
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
// import Menus from "../c";
function Index() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/notification" element={<NotificationPage />} />
      <Route path="/" element={<MainLayout />}>
        {/* Role Management */}
        <Route path="/menus" element={<PrivateRoute element={Menus} />} />
        <Route path="/roles" element={<PrivateRoute element={Roles} />} />
        <Route
          path="/show_roles"
          element={<PrivateRoute element={ShowRolesWithMenu} />}
        />
        <Route
          path="//manage-role-access/:roleId"
          element={<PrivateRoute element={ManageRoleAccess} />}
        />
        <Route
          path="/student-create"
          element={<PrivateRoute element={CreateStudent} />}
        />
        <Route
          path="/student-list"
          element={<PrivateRoute element={StudentList} />}
        />
        <Route
          path="/student/:id/edit"
          element={<PrivateRoute element={StudentEdit} />}
        />
        <Route
          path="/student-demo-table"
          element={<PrivateRoute element={DemoTable} />}
        />
        {/* Staff endPoints */}
        <Route
          path="/StaffList"
          element={<PrivateRoute element={StaffList} />}
        />
        <Route
          path="/CreateStaff"
          element={<PrivateRoute element={CreateStaff} />}
        />
        <Route
          path="/staff/edit/:id"
          element={<PrivateRoute element={EditStaff} />}
        />
        <Route
          path="/staff/view/:id"
          element={<PrivateRoute element={ViewStaff} />}
        />
        <Route
          path="/eventcard"
          element={<PrivateRoute element={EventCard} />}
        />
        <Route
          path="/dashboard"
          element={<PrivateRoute element={AdminDashboard} />}
        />
        <Route
          path="/myprofile"
          element={<PrivateRoute element={UserProfile} />}
        />
        <Route
          path="/classlist"
          element={<PrivateRoute element={ClassList} />}
        />

        {/* Division module */}
        <Route
          path="/divisionlist"
          element={<PrivateRoute element={DivisionList} />}
        />
        {/* Division module */}
        <Route
          path="/subjectlist"
          element={<PrivateRoute element={SubjectList} />}
        />
        {/* SubjectAllotment module */}
        <Route
          path="/managesubject"
          element={<PrivateRoute element={ManageSubjectList} />}
        />
        {/* SubjectForReportCard module */}
        <Route
          path="/subjectforReportcard"
          element={<PrivateRoute element={SubjectForRc} />}
        />
        {/* SubjectAllotmentForReportCard module */}
        <Route
          path="/managesubjectforreportcard"
          element={<PrivateRoute element={SubjectAllotmentForReportCard} />}
        />
        {/* Student module */}
        <Route
          path="/manageStudent"
          element={<PrivateRoute element={ManageStudent} />}
        />
        <Route
          path="/newStudentList"
          element={<PrivateRoute element={NewStudentList} />}
        />
        {/* <Route
          path="/student-create"
          element={<PrivateRoute element={CreateStudent} />}
        /> */}
        <Route
          path="/student/edit/:id"
          element={<PrivateRoute element={CreateStudent} />}
        />
        <Route
          path="/student/view/:id"
          element={<PrivateRoute element={ViewStudent} />}
        />
        <Route
          path="/newStudetEdit/edit/:id"
          element={<PrivateRoute element={EditOfNewStudentList} />}
        />
        {/* AllotClassTeacher */}
        <Route
          path="/allotClassTeacher"
          element={<PrivateRoute element={AllotClassTeacher} />}
        />
        {/* ExamMdule */}
        <Route path="/exams" element={<PrivateRoute element={Exam} />} />
        {/* Grade Module */}
        <Route path="/grades" element={<PrivateRoute element={Grade} />} />
        {/* MarksHeading Moudle */}

        <Route
          path="/marksHeading"
          element={<PrivateRoute element={MarksHeading} />}
        />
        {/* AllotMarksHeading module */}
        <Route
          path="/allotMarksHeading"
          element={<PrivateRoute element={AllotMarksHeading} />}
        />

        <Route path="/sections" element={<PrivateRoute element={Sections} />} />
        <Route path="/notification" element={<NotificationPage />} />
        <Route path="/changepassword" element={<ChangePassword />} />
        <Route
          path="/ticktinglist"
          element={<PrivateRoute element={TickitingCountList} />}
        />
        <Route
          path="/feependinglist"
          element={<PrivateRoute element={FeePendingList} />}
        />
        <Route
          path="/staffbirthlist"
          element={<PrivateRoute element={StaffBirthdayTabList} />}
        />
      </Route>
      {/* Page Not FOund Routes */}
      <Route path="*" element={<PrivateRoute element={PageNotFounde} />} />
    </Routes>
  );
}

export default Index;
