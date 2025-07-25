// working  hover and onclick on navbar

import { NavDropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import "./AdminNavBar.css"; // Attach the CSS file
import { IoIosHelpCircleOutline } from "react-icons/io";
import { useState, useEffect, useRef } from "react";
import { Nav } from "react-bootstrap";

const AdminNavBar = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [clickedDropdown, setClickedDropdown] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // 🔹 Toggle Dropdown on Click
  const toggleDropdown = (dropdownName) => {
    if (clickedDropdown === dropdownName) {
      setOpenDropdown(null);
      setClickedDropdown(null);
    } else {
      setOpenDropdown(dropdownName);
      setClickedDropdown(dropdownName);
    }
  };

  // 🔹 Handle Hover
  const handleMouseEnter = (dropdownName) => {
    if (!clickedDropdown || clickedDropdown !== dropdownName) {
      setOpenDropdown(dropdownName);
      setClickedDropdown(null); // Reset clicked dropdown when another is hovered
    }
  };

  // 🔹 Close Dropdown on Mouse Leave
  const handleMouseLeave = () => {
    if (!clickedDropdown) {
      setOpenDropdown(null);
    }
  };

  // 🔹 Detect Outside Click & Reset State
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenDropdown(null);
        setClickedDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const handleTicketClick = () => {
    // Navigate to the "Coming Soon" page
    navigate("/comingSoon");
  };
  return (
    <>
      <Nav ref={menuRef}>
        {/* Role Dropdown now we have hide this*/}
        <NavDropdown
          title={<span className="nav-dropdown-title">Role</span>}
          className="custom-nav-dropdown"
        >
          <NavDropdown.Item as={Link} to="/manageRoles">
            Manage Role
          </NavDropdown.Item>
          <NavDropdown.Item as={Link} to="/manageMenus">
            Manage Menu
          </NavDropdown.Item>
          <NavDropdown.Item as={Link} to="/manageRoleAccess">
            Manage Access
          </NavDropdown.Item>
        </NavDropdown>

        {/* My Actions Dropdown */}
        <NavDropdown
          title={<span className="nav-dropdown-title">My Actions</span>}
          className="custom-nav-dropdown"
        >
          {/* Students Sub-dropdown */}
          <NavDropdown
            title={
              <span
                className="nav-dropdown-titleSubUnder"
                onClick={() => toggleDropdown("students")}
                onMouseEnter={() => handleMouseEnter("students")}
              >
                Students
              </span>
            }
            className="dropend custom-submenu"
            show={openDropdown === "students"}
            onMouseLeave={handleMouseLeave}
          >
            <NavDropdown.Item as={Link} to="/newStudentList">
              New Student List
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/manageStudent">
              Manage Students
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/manageStudentLC">
              LC Students
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/deleteStudent">
              Deleted Students Lists
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/PromoteStudent">
              Promote Students
            </NavDropdown.Item>

            <NavDropdown.Item as={Link} to="/SendUserIdToParent">
              Send User Id to Parents
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/SiblingMapping">
              Sibling Mapping
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/siblingUnmapping">
              Sibling Unmapping
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/myprofile">
              User Profile
            </NavDropdown.Item>
          </NavDropdown>

          {/* Certificate Sub-dropdown */}
          <NavDropdown
            title={
              <span
                className="nav-dropdown-titleSubUnder"
                onClick={() => toggleDropdown("certificate")}
                onMouseEnter={() => handleMouseEnter("certificate")}
              >
                Certificate
              </span>
            }
            show={openDropdown === "certificate"}
            onMouseLeave={handleMouseLeave}
            className="dropend custom-submenu"
          >
            <NavDropdown.Item as={Link} to="/bonafiedCertificates">
              Bonafide Certificate
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/castCertificate">
              Caste Certificate
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/characterCertificate">
              Character Certificate
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/percentageCertificate">
              Percentage Certificate
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/simpleBonafied">
              Simple Bonafide Certificate
            </NavDropdown.Item>
          </NavDropdown>

          {/* Staff Sub-dropdown */}
          <NavDropdown
            title={
              <span
                className="nav-dropdown-titleSubUnder"
                onClick={() => toggleDropdown("staff")}
                onMouseEnter={() => handleMouseEnter("staff")}
              >
                Staff
              </span>
            }
            className="dropend custom-submenu"
            show={openDropdown === "staff"}
            onMouseLeave={handleMouseLeave}
          >
            <NavDropdown.Item as={Link} to="/StaffList">
              Manage Staff
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/careTacker">
              Manage Caretaker
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/SubstituteTeacher">
              Substitute Teacher
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/SetLateTime">
              Set Late Time
            </NavDropdown.Item>
          </NavDropdown>

          {/* Leave Sub-dropdown */}
          <NavDropdown
            title={
              <span
                className="nav-dropdown-titleSubUnder"
                onClick={() => toggleDropdown("leave")}
                onMouseEnter={() => handleMouseEnter("leave")}
              >
                Leave
              </span>
            }
            className="dropend custom-submenu"
            show={openDropdown === "leave"}
            onMouseLeave={handleMouseLeave}
          >
            <NavDropdown.Item as={Link} to="/LeaveAllocation">
              Leave Allocation
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/leaveAllocationtoAllStaff">
              Leave Allocation to All Staff
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/LeaveApplication">
              Leave Application
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/LeaveApplicationP">
              Leave Application For Staff
            </NavDropdown.Item>
          </NavDropdown>
          {/* Time Table Planner */}
          {/* Leave Sub-dropdown */}
          <NavDropdown
            title={
              <span
                className="nav-dropdown-titleSubUnder"
                onClick={() => toggleDropdown("timetableplanner")}
                onMouseEnter={() => handleMouseEnter("timetableplanner")}
              >
                Time Table Planner
              </span>
            }
            className="dropend custom-submenu"
            show={openDropdown === "timetableplanner"}
            onMouseLeave={handleMouseLeave}
          >
            <NavDropdown.Item as={Link} to="/teacherPeriodAlloction">
              Teacher Period Allocation
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/classWisePAllot">
              Class Wise Period Allocation
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/timetablePlanner">
              Time Table Planner
            </NavDropdown.Item>
            {/* <NavDropdown.Item as={Link} to="#">
              
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/LeaveApplication">
              Leave Application
            </NavDropdown.Item> */}
          </NavDropdown>
          {/* Other Items */}
          <NavDropdown.Item as={Link} to="/leavingCertificate">
            Leaving Certificate
          </NavDropdown.Item>
          <NavDropdown.Item as={Link} to="/noticeAndSms">
            Notice/SMS
          </NavDropdown.Item>
          <NavDropdown.Item as={Link} to="/comingsoon">
            Event
          </NavDropdown.Item>
          <NavDropdown.Item as={Link} to="/holidayList">
            Holiday List
          </NavDropdown.Item>
          <NavDropdown.Item as={Link} to="/allotClassTeacher">
            Allot Class Teachers
          </NavDropdown.Item>
          <NavDropdown.Item as={Link} to="comingSoon">
            Allot Department Coordinator
          </NavDropdown.Item>
          <NavDropdown.Item as={Link} to="/allotGRNumber">
            Allot GR Number
          </NavDropdown.Item>
          <NavDropdown.Item as={Link} to="/categoryReligion">
            Update Category and Religion
          </NavDropdown.Item>
          <NavDropdown.Item as={Link} to="/updateStudentID">
            Update Student ID and Other Details
          </NavDropdown.Item>

          <NavDropdown.Item as={Link} to="/timeTable">
            Time Table
          </NavDropdown.Item>
        </NavDropdown>

        {/* ID Card Dropdown */}
        <NavDropdown
          title={<span className="nav-dropdown-title">ID Card</span>}
          // title=""
          className="custom-nav-dropdown"
          style={{ color: "black", fontWeight: "700" }}
        >
          <NavDropdown.Item
            as={Link}
            to="/studentIdCard"
            className="text-sm font-bold hover:text-black"
          >
            Student ID Card
          </NavDropdown.Item>
          <NavDropdown.Item
            as={Link}
            to="/teacherIdCard"
            className="text-sm font-bold hover:text-black"
          >
            Teacher ID Card
          </NavDropdown.Item>
          {/* <NavDropdown.Item
            as={Link}
            to="/pendingStudentId"
            className="text-sm font-bold hover:text-black"
          >
            Pending Student ID Card
          </NavDropdown.Item> */}
          <NavDropdown.Item
            as={Link}
            to="/updateStudentIdCard"
            className="text-sm font-bold hover:text-black"
          >
            Update student ID Card
          </NavDropdown.Item>
        </NavDropdown>

        {/* View Dropdown */}

        <NavDropdown
          title={<span className="nav-dropdown-title">View</span>}
          className="relative cursor-pointer"
          style={{ color: "black", fontWeight: "800" }}
          onClick={handleTicketClick} // Trigger navigation when clicked
        >
          {/* You can leave the dropdown empty or add other items if needed */}
        </NavDropdown>
        {/* Reports Dropdown */}
        <NavDropdown
          // title=""
          title={<span className="nav-dropdown-title">Reports</span>}
          className="custom-nav-dropdown"
          style={{ color: "black", fontWeight: "700" }}
        >
          <div
            style={{
              maxHeight: "400px",
              overflowY: "auto",
              scrollbarWidth: "thin", // For Firefox
              scrollbarColor: "#C03178 transparent", // For Firefox
              msOverflowStyle: "none", // Hide scrollbar in IE and Edge
            }}
          >
            <NavDropdown.Item
              as={Link}
              to="/listAdmFrmRep"
              className="text-sm font-bold hover:text-black"
            >
              List of Admission Forms Report
            </NavDropdown.Item>
            <NavDropdown.Item
              as={Link}
              to="/balanceleave"
              className="text-sm font-bold hover:text-black"
            >
              Balance Leave
            </NavDropdown.Item>
            <NavDropdown.Item
              as={Link}
              to="/consolidatedLeave"
              className="text-sm font-bold hover:text-black"
            >
              Consolidated Leave
            </NavDropdown.Item>
            <NavDropdown.Item
              as={Link}
              to="/studentReport"
              // to="#"
              className="text-sm font-bold hover:text-black"
            >
              Student Report
            </NavDropdown.Item>
            <NavDropdown.Item
              as={Link}
              to="/studentContactDetailsReport"
              className="text-sm font-bold hover:text-black"
            >
              Student Contact Details Report
            </NavDropdown.Item>
            <NavDropdown.Item
              as={Link}
              to="/studentRemarkReport"
              className="text-sm font-bold hover:text-black"
            >
              Student Remarks Report
            </NavDropdown.Item>
            <NavDropdown.Item
              as={Link}
              to="/catWiseStudRepo"
              className="text-sm font-bold hover:text-black"
            >
              Student - Category wise Report
            </NavDropdown.Item>
            <NavDropdown.Item
              as={Link}
              to="/relgWiseStudRepo"
              className="text-sm font-bold hover:text-black"
            >
              Student - Religion wise Report
            </NavDropdown.Item>
            <NavDropdown.Item
              as={Link}
              to="/gendrWiseStudRepo"
              // to="#"
              className="text-sm font-bold hover:text-black"
            >
              Student - Gender wise Report
            </NavDropdown.Item>
            <NavDropdown.Item
              as={Link}
              to="/genWiseRelignRepo"
              className="text-sm font-bold hover:text-black"
            >
              Student -Genderwise Religionwise Report
            </NavDropdown.Item>
            <NavDropdown.Item
              as={Link}
              to="/genWiseCatRepo"
              className="text-sm font-bold hover:text-black"
            >
              Student - Genderwise Categorywise Report
            </NavDropdown.Item>
            <NavDropdown.Item
              as={Link}
              to="/newStudentsRepo"
              className="text-sm font-bold hover:text-black"
            >
              New Students Report
            </NavDropdown.Item>
            <NavDropdown.Item
              as={Link}
              to="/leftStudentsRepo"
              className="text-sm font-bold hover:text-black"
            >
              Left Students Report
            </NavDropdown.Item>
            <NavDropdown.Item
              as={Link}
              to="/hSCStudSubjectsRepo"
              className="text-sm font-bold hover:text-black"
            >
              HSC Students Subjects Report
            </NavDropdown.Item>
            <NavDropdown.Item
              as={Link}
              to="/staffReport"
              className="text-sm font-bold hover:text-black"
            >
              Staff Report
            </NavDropdown.Item>
            <NavDropdown.Item
              as={Link}
              to="/monthlyAttendenceRepo"
              className="text-sm font-bold hover:text-black"
            >
              Monthly Attendance Report
            </NavDropdown.Item>
            <NavDropdown.Item
              as={Link}
              to="/feePaymentRepo"
              className="text-sm font-bold hover:text-black"
            >
              Fees Payment Report
            </NavDropdown.Item>
            <NavDropdown.Item
              as={Link}
              to="/worldlinfeePayRepo"
              className="text-sm font-bold hover:text-black"
            >
              Worldline Fee Payment Report{" "}
            </NavDropdown.Item>
            <NavDropdown.Item
              as={Link}
              to="/rozorpayfeePayRepo"
              className="text-sm font-bold hover:text-black"
            >
              Razorpay Fee Payment Report{" "}
            </NavDropdown.Item>
            <NavDropdown.Item
              as={Link}
              to="/PndingStudIdCrdRepo"
              className="text-sm font-bold hover:text-black"
            >
              Pending Student ID Card Report
            </NavDropdown.Item>
            <NavDropdown.Item
              as={Link}
              to="/SubsTeaMonthlyRepo"
              className="text-sm font-bold hover:text-black"
            >
              Substitute Teacher Monthly Report{" "}
            </NavDropdown.Item>
            <NavDropdown.Item
              as={Link}
              to="/SubsWklyHrsRepo"
              className="text-sm font-bold hover:text-black"
            >
              Substitution Weekly Hours Report{" "}
            </NavDropdown.Item>
            <NavDropdown.Item
              as={Link}
              to="/LeavCertifRepo"
              className="text-sm font-bold hover:text-black"
            >
              Leaving Certificate Report
            </NavDropdown.Item>
          </div>
        </NavDropdown>

        {/* Ticket Dropdown */}
        <NavDropdown
          title={<span className="nav-dropdown-title">Ticket</span>}
          className="custom-nav-dropdown"
          style={{ color: "black", fontWeight: "700" }}
          // onClick={handleTicketClick} // Trigger navigation when clicked
        >
          <NavDropdown.Item
            as={Link}
            to="/serviceType"
            className="text-sm font-bold hover:text-black"
          >
            Service Type
          </NavDropdown.Item>{" "}
          <NavDropdown.Item
            as={Link}
            to="/subServiceType"
            className="text-sm font-bold hover:text-black"
          >
            Sub Service Type
          </NavDropdown.Item>{" "}
          <NavDropdown.Item
            as={Link}
            to="/appointmentWindow"
            className="text-sm font-bold hover:text-black"
          >
            Appointment Window
          </NavDropdown.Item>{" "}
          <NavDropdown.Item
            as={Link}
            to="/ticketList"
            className="text-sm font-bold hover:text-black"
          >
            Ticket List
          </NavDropdown.Item>
          <NavDropdown.Item
            as={Link}
            to="/ticketReport"
            className="text-sm font-bold hover:text-black"
          >
            Ticket Report
          </NavDropdown.Item>
        </NavDropdown>

        {/* Masters Dropdown */}
        <NavDropdown
          // title=""
          title={<span className="nav-dropdown-title">Masters</span>}
          className="custom-nav-dropdown"
          style={{ color: "black", fontWeight: "700" }}
        >
          <NavDropdown.Item
            as={Link}
            to="/sections"
            className="text-sm font-bold hover:text-black"
          >
            Section
          </NavDropdown.Item>
          <NavDropdown.Item
            as={Link}
            to="/classes"
            className="text-sm font-bold hover:text-black"
          >
            Class
          </NavDropdown.Item>
          <NavDropdown.Item
            as={Link}
            to="/division"
            className="text-sm font-bold hover:text-black"
          >
            Division
          </NavDropdown.Item>
          <NavDropdown.Item
            as={Link}
            to="/subjects"
            className="text-sm font-bold hover:text-black"
          >
            Subjects
          </NavDropdown.Item>
          <NavDropdown.Item
            as={Link}
            to="/subject_allotment"
            className="text-sm font-bold hover:text-black"
          >
            Subjects Allotment
          </NavDropdown.Item>
          <NavDropdown.Item
            as={Link}
            to="/allotSpecialRole"
            className="text-sm font-bold hover:text-black"
          >
            Allot Special Role
          </NavDropdown.Item>
          <NavDropdown.Item
            as={Link}
            to="/SubjectAllotmentHSC"
            className="text-sm font-bold hover:text-black"
          >
            StudentWise Subject Allotment for HSC
          </NavDropdown.Item>
          <NavDropdown.Item
            as={Link}
            to="/subjectforReportcard"
            className="text-sm font-bold hover:text-black"
          >
            Subject for Report Card
          </NavDropdown.Item>
          <NavDropdown.Item
            as={Link}
            to="/managesubjectforreportcard"
            className="text-sm font-bold hover:text-black"
          >
            Subject allotment for report card
          </NavDropdown.Item>
          <NavDropdown.Item
            as={Link}
            to="/leavetype"
            className="text-sm font-bold hover:text-black"
          >
            Leave Type
          </NavDropdown.Item>
          <NavDropdown.Item
            as={Link}
            to="/Exams"
            className="text-sm font-bold hover:text-black"
          >
            Exams
          </NavDropdown.Item>
          <NavDropdown.Item
            as={Link}
            to="/grades"
            // to="#"
            className="text-sm font-bold hover:text-black"
          >
            Grades
          </NavDropdown.Item>
          <NavDropdown.Item
            as={Link}
            // to="/grades"
            to="/marksHeading"
            className="text-sm font-bold hover:text-black"
          >
            Marks heading
          </NavDropdown.Item>
          <NavDropdown.Item
            as={Link}
            to="/allot_Marks_Heading"
            // to="/allotMarksHeading"
            className="text-sm font-bold hover:text-black"
          >
            Allot Marks heading
          </NavDropdown.Item>
          <NavDropdown.Item
            as={Link}
            to="/exam_TimeTable"
            // to="/allotMarksHeading"
            className="text-sm font-bold hover:text-black"
          >
            Exam Timetable{" "}
          </NavDropdown.Item>
          {/* Stationery module */}
          <NavDropdown.Item
            as={Link}
            to="/stationery"
            // to="/allotMarksHeading"
            className="text-sm font-bold hover:text-black"
          >
            Stationery{" "}
          </NavDropdown.Item>
        </NavDropdown>

        {/* Help */}
        {/* <div
          onClick={() => {
            console.log("click hua hai Help pr")
          }}
          style={{ fontWeight: "700", fontSize: "1rem", color: "black" }}
          className="my-auto text-gray-600 cursor-pointer hover:text-gray-900 md:relative left-2"
        >
          <IoIosHelpCircleOutline className="inline mr-1 relative bottom-0.5 hover:text-black " />
          Help
        </div> */}
      </Nav>
    </>
  );
};

export default AdminNavBar;
