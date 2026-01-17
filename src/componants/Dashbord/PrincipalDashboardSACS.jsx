import {
  FaSchool,
  FaUserGroup,
  FaUserShield,
  FaUsersLine,
} from "react-icons/fa6";
import Card from "../common/Card.jsx";
// import EventCard from "./EventCard.js";
import EventCard from "./EventCard.jsx"
import CardStuStaf from "../common/CardStuStaf.jsx";
import StudentsChart from "./Charts/StudentsChart.jsx";
import {
  FaBirthdayCake,
  FaCalendarAlt,
  FaChalkboardTeacher,
  FaClipboardCheck,
} from "react-icons/fa";
import { HiCollection } from "react-icons/hi";
// import { IoTicket } from "react-icons/io5";
// import NoticeBord from "./NoticeBord.js";
import axios from "axios";
import { useEffect, useState } from "react";
// import HouseStudentChart from "./Charts/HouseStudentChart.js";
// import TableFeeCollect from "./TableFeeCollect.js";
import { Link, useNavigate } from "react-router-dom";
// import LoadingSpinner from "../common/LoadingSpinner.jsx";
import { ToastContainer, toast } from "react-toastify";
import { RiPassValidFill } from "react-icons/ri";
import { GiTeacher } from "react-icons/gi";
// import { TfiWrite } from "react-icons/tfi";
// import { MdAssessment, MdGroup } from "react-icons/md";
// import ClassWiseAcademicPerformance from "./ClassWiseAcademicPerformance.js";
// import TimeTableForTeacherDashbord from "./TimeTableForTeacherDashbord.js";
// import TicketForDashboard from "./TicketForDashboard.js";
import StudentAttendanceChart from "./Charts/StudentAttendanceChart.jsx"
// import { MdOutlinePayments } from "react-icons/md";
// import { MdOutlineWarningAmber } from "react-icons/md";
// import { HiOutlineDocumentText } from "react-icons/hi";
// import { MdOutlineAssignment } from "react-icons/md";
// import TodoListandRemainders from "./TodoListandRemainders.js";
// import StudentAttendanceChart from "./charts/StudentAttendanceChart.jsx"
// import StudentAttendanceSACS from "./Charts/StudentAttendanceSACS.js";

const PrincipalDashboardSACS = () => {
  const API_URL = import.meta.env.VITE_API_URL; // url for host
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState({
    total: 0,
    present: 0,
  });
  const [sortNameCookie, setSortNameCookie] = useState("");
  // console.log("school name", sortNameCookie);
  const [staffData, setStaffData] = useState({
    teachingStaff: "",
    nonTeachingStaff: "",
  });
  const [staffBirthday, setStaffBirthday] = useState("");
  const [ticketCount, setTicketCount] = useState("");
  const [approveLeaveCount, setApproveLeaveCount] = useState("");
  const [pendingFee, setPendingFee] = useState("");
  const [collectedFee, setCollectedFee] = useState("");
  const [approvedLessonPlaneCount, setApprovedLessonPlaneCount] = useState("");
  const [notSubmittedLessonPlanCount, setNotSubmittedLessonPlanCount] =
    useState("");
  const [pendingApprovalLP, setPendingApprovealLP] = useState("");
  const [noOfTeachers, setNoOfTeachers] = useState("");
  const [error, setError] = useState(null);
  const [roleId, setRoleId] = useState(null);
  const [regId, setRegId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [attendanceCountStaff, setAttendanceCountStaff] = useState({});
  const [prePrimary, setPrePrimary] = useState({});
  const [primary, setPrimary] = useState({});
  const [secondary, setSecondary] = useState({});
  const [higherSecondary, setHigherSecondary] = useState({});
  const [caretaker, setCaretaker] = useState({});

  useEffect(() => {
    fetchRoleId();
  }, []);

  useEffect(() => {
    if (!roleId) return;

    fetchData();
  }, [roleId]);

  const fetchRoleId = async () => {
    setLoading(true);
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Authentication token not found. Please login again");
      navigate("/");
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/api/sessionData`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const roleId = response?.data?.user?.role_id;
      const regId = response?.data?.user?.reg_id;

      setRegId(regId);
      setSortNameCookie(response?.data?.custom_claims?.short_name);
      if (roleId) setRoleId(roleId);
    } catch (error) {
      // console.error("Failed to fetch session data:", error);
      (" ");
    } finally {
      setLoading(false); // stop loading after API
    }
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const roleId = localStorage.getItem("roleId");
      // console.log("**** role ID******", roleId);

      if (!token) {
        toast.error("Authentication token not found Please login again");
        navigate("/");
        return;
      }

      // Fetch student data
      const studentResponse = await axios.get(`${API_URL}/api/studentss`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStudentData({
        total: studentResponse.data.count,
        present: studentResponse.data.present,
      });

      // Fetch staff data
      const staffResponse = await axios.get(`${API_URL}/api/staff`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // console.log("reponse of the staffAPI", staffResponse);
      const totalStaff =
        (staffResponse?.data?.teachingStaff || 0) +
        (staffResponse?.data?.non_teachingStaff || 0);
      const totalAttendance =
        (staffResponse?.data?.attendanceteachingstaff || 0) +
        (staffResponse?.data?.attendancenonteachingstaff || 0);

      setStaffData({
        teachingStaff: totalStaff, // combined total staff
        attendanceteachingstaff: totalAttendance, // combined attendance
        // If you still want to keep them separate, you can also add them:
        nonTeachingStaff: staffResponse?.data?.non_teachingStaff,
        attendancenonteachingstaff:
          staffResponse?.data?.attendancenonteachingstaff,
      });
      // Fetch Tickiting count values

      const responseTickingCount = await axios.get(
        `${API_URL}/api/ticketcount`,
        {
          headers: {
            Authorization: `Bearer ${token}`,

            "Role-Id": roleId, // add roleId for different role
          },
        }
      );
      // console.log(
      //   "***the roleiD count*******",
      //   responseTickingCount.data.count
      // );
      setTicketCount(responseTickingCount.data.count);
      // Fetch the data of approveLeave count
      const responseApproveLeaveCount = await axios.get(
        `${API_URL}/api/get_count_of_approveleave`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setApproveLeaveCount(responseApproveLeaveCount?.data?.data);

      // Fetch Pending Fee Records counts
      const pendingFeeCount = await axios.get(`${API_URL}/api/feecollection`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // setPendingFee(pendingFeeCount.data.pendingFee);
      setCollectedFee(pendingFeeCount.data["Collected Fees"]);
      setPendingFee(pendingFeeCount.data["Pending Fees"]);
      // console.log("pendingFee count is here******", pendingFeeCount.data);

      // Fetch birthday Count
      const Birthdaycount = await axios.get(
        `${API_URL}/api/staffbirthdaycount`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log(
      //   "the birthday count and it's value is=",
      //   Birthdaycount.data.count
      // );
      setStaffBirthday(Birthdaycount.data.count);

      // fetch Approved lesson plane count
      const ApprovedLessonPlane = await axios.get(
        `${API_URL}/api/lessonplan/summary`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("lesson plan summary", ApprovedLessonPlane);
      setApprovedLessonPlaneCount(ApprovedLessonPlane.data.lessonPlanSubmitted);
      setNotSubmittedLessonPlanCount(
        ApprovedLessonPlane.data.lessonPlanNotSubmitted
      );
      setPendingApprovealLP(ApprovedLessonPlane.data.pendingForApproval);
      setNoOfTeachers(ApprovedLessonPlane.data.totalNumberOfTeachers);
      // console.log("approve lesson plan data", ApprovedLessonPlane.data);

      // Fetch Pre-Primary, Primary , School, and caretaker cards count
      const AttendanceCountStaff = await axios.get(
        `${API_URL}/api/attendance/summary/category`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const dataAttendace = AttendanceCountStaff.data.data;
      setAttendanceCountStaff(dataAttendace);
      const getDept = (key) =>
        dataAttendace[key] || { present: 0, absent: 0, total: 0 };
      setPrePrimary(getDept("Nursery teachers"));
      setPrimary(getDept("KG teachers"));
      setSecondary(getDept("SACS teachers"));
      setHigherSecondary(getDept("Higher Secondary"));
      setCaretaker(getDept("Caretakers"));
      // console.log("preprimary", getDept("PrePrimary"));
      // console.log("Attendancecount staff", AttendanceCountStaff.data.data);
    } catch (error) {
      setError(error.message);
      // console.error("Error fetching data:", error);
    }
  };

  return (
    <>
      <>
        <ToastContainer />
        <div className="flex flex-col lg:flex-row items-start justify-between w-full gap-4 p-6 ">
          <div className="w-full lg:w-full  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Link to="/studentAbsent" className="no-underline">
              <CardStuStaf
                title="Student"
                roleId={roleId}
                TotalValue={studentData?.total}
                presentValue={studentData?.present}
                color="#4CAF50"
                icon={
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      backgroundColor: "white",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FaUsersLine style={{ color: "violet", fontSize: 30 }} />
                  </div>
                }
              />
            </Link>

            {roleId === null ? (
              <div className="flex justify-between animate-pulse bg-white rounded shadow-md p-4 w-full h-[114px] border border-gray-200">
                <div className="relative -top-2 h-20 bg-gray-300 rounded w-1/2"></div>
                <div className="relative top-3 h-10 bg-gray-300 rounded w-1/3"></div>
              </div>
            ) : (
              <>
                <button
                  disabled={sortNameCookie === "HSCS"}
                  style={{
                    border: "none",
                    background: "transparent",
                    padding: 0,
                    width: "100%",
                    cursor:
                      sortNameCookie === "HSCS" ? "not-allowed" : "pointer",
                  }}
                >
                  <Link
                    to={sortNameCookie === "HSCS" ? "#" : "/teacherList"}
                    className="no-underline"
                    style={
                      sortNameCookie === "HSCS" ? { pointerEvents: "none" } : {}
                    }
                  >
                    <CardStuStaf
                      title="Staff"
                      TotalValue={staffData.teachingStaff}
                      presentValue={staffData?.attendanceteachingstaff}
                      color="#2196F3"
                      icon={
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            backgroundColor: "white",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <FaUserGroup
                            style={{ color: "#00FFFF", fontSize: 30 }}
                          />
                        </div>
                      }
                      disableLoader={sortNameCookie === "HSCS"}
                    />
                  </Link>
                </button>
              </>
            )}

            {roleId === null ? (
              // Skeleton card
              <div className="flex justify-between animate-pulse bg-white rounded shadow-md p-4 w-full h-[114px] border border-gray-200">
                <div className="relative -top-2 h-20 bg-gray-300 rounded w-1/2"></div>
                <div className="relative top-3 h-10 bg-gray-300 rounded w-1/3"></div>
              </div>
            ) : (
              <>
                <button
                  disabled={sortNameCookie === "HSCS"}
                  style={{
                    border: "none",
                    background: "transparent",
                    padding: 0,
                    width: "100%",
                    cursor:
                      sortNameCookie === "HSCS" ? "not-allowed" : "pointer",
                  }}
                >
                  <Link to="/staffbirthlist" className="no-underline">
                    <Card
                      title=" Birthdays"
                      value={staffBirthday}
                      color="#2196F3"
                      icon={
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            backgroundColor: "white",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <FaBirthdayCake
                            style={{ color: "#FF69B4", fontSize: 30 }}
                          />
                        </div>
                      }
                    />
                  </Link>
                </button>
              </>
            )}

            {/* For fee pending */}
            {roleId === null ? (
              <div className="flex justify-between animate-pulse bg-white rounded shadow-md p-4 w-full h-[114px] border border-gray-200">
                <div className="relative -top-2 h-20 bg-gray-300 rounded w-1/2"></div>
                <div className="relative top-3 h-10 bg-gray-300 rounded w-1/3"></div>
              </div>
            ) : (
              <Link to="/feependinglist" className="no-underline">
                <Card
                  title="Fee"
                  value={collectedFee}
                  valuePendingFee={pendingFee}
                  color="#FF5733"
                  icon={
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        backgroundColor: "white",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <HiCollection style={{ color: "green", fontSize: 30 }} />
                    </div>
                  }
                />
              </Link>
            )}

            {/* Ticketling list, assessment, Approve lesson plane */}
            {roleId === null ? (
              // Skeleton card
              <div className="flex justify-between animate-pulse bg-white rounded shadow-md p-4 w-full h-[114px] border border-gray-200">
                <div className="relative -top-2 h-20 bg-gray-300 rounded w-1/2"></div>
                <div className="relative top-3 h-10 bg-gray-300 rounded w-1/3"></div>
              </div>
            ) : (
              // Approve Leave card for roleId "M"
              <Link to="/approveLeavelist" className="no-underline">
                <Card
                  // title="Approve Leave"
                  title={
                    <span style={{ fontSize: "12px" }}>Approve Leave</span>
                  }
                  value={approveLeaveCount}
                  color="#FFC107"
                  icon={
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        backgroundColor: "white",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <RiPassValidFill
                        style={{ color: "#C03078", fontSize: 30 }}
                      />
                    </div>
                  }
                />
              </Link>
            )}

            {/* Approve lesson plane, Birthday, Leave */}
            {roleId === null ? (
              // Skeleton card
              <div className="flex justify-between animate-pulse bg-white rounded shadow-md p-4 w-full h-[114px] border border-gray-200">
                <div className="relative -top-2 h-20 bg-gray-300 rounded w-1/2"></div>
                <div className="relative top-3 h-10 bg-gray-300 rounded w-1/3"></div>
              </div>
            ) : (
              <Link to="/lessonPlanData" className="no-underline">
                <Card
                  title="Lesson Plans"
                  // value={approvedLessonPlaneCount}
                  value={noOfTeachers}
                  valuePendingFee={approvedLessonPlaneCount}
                  valueAbsent={notSubmittedLessonPlanCount}
                  valueTeacher={pendingApprovalLP}
                  color="#4CAF50"
                  icon={
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        backgroundColor: "white",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FaClipboardCheck
                        style={{ color: "green", fontSize: 24 }}
                      />
                    </div>
                  }
                />
              </Link>
            )}

            {/* Requirents Sttaff */}
            {/* Pre-primary */}
            <Link to="#" className="no-underline">
              <Card
                title="Nursery"
                value={prePrimary.present}
                valuePendingFee={prePrimary.absent}
                valueAbsent={prePrimary.total}
                color="#4CAF50"
                icon={
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      backgroundColor: "white",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <GiTeacher style={{ color: "#8B5CF6", fontSize: 30 }} />
                  </div>
                }
              />
            </Link>

            {/* primary */}
            <Link to="#" className="no-underline">
              <Card
                title="KG"
                value={primary.present}
                valuePendingFee={primary.absent}
                valueAbsent={primary.total}
                color="#4CAF50"
                icon={
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      backgroundColor: "white",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <GiTeacher style={{ color: "#8B5CF6", fontSize: 30 }} />
                  </div>
                }
              />
            </Link>

            {/* School*/}
            <Link to="#" className="no-underline">
              <Card
                title="School"
                value={secondary.present}
                valuePendingFee={secondary.absent}
                valueAbsent={secondary.total}
                color="#4CAF50"
                icon={
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      backgroundColor: "white",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <GiTeacher style={{ color: "#8B5CF6", fontSize: 30 }} />
                  </div>
                }
              />
            </Link>

            {/* Caretaker */}
            <Link to="#" className="no-underline">
              <Card
                title="Caretaker"
                value={caretaker.present}
                valuePendingFee={caretaker.absent}
                valueAbsent={caretaker.total}
                color="#4CAF50"
                icon={
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      backgroundColor: "white",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FaUserShield style={{ color: "#8B5CF6", fontSize: 30 }} />
                  </div>
                }
              />
            </Link>
          </div>
        </div>

        <div className="flex flex-col-reverse lg:flex-row items-start w-full gap-4 px-4 h-[400px]">
          {/* LEFT SECTION – 79% */}
          <div
            className="w-full lg:w-[100%] h-full bg-slate-50 rounded-lg"
            style={{
              boxShadow:
                "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
            }}
          >
            {roleId === null ? (
              <div className="animate-pulse bg-white rounded shadow-md p-4 w-full h-[200px] border border-gray-200">
                <div className="h-6 bg-gray-300 rounded mb-4 w-1/3"></div>
                <div className="h-32 bg-gray-300 rounded"></div>
              </div>
            ) : (
              // <StudentsChart />
              <StudentAttendanceChart />
              // <StudentAttendanceSACS />
            )}
          </div>
        </div>

        <div
          style={{
            width: "calc(100% - 50px)",
            height: "350px",
            // padding: "16px",
            overflowY: "auto",
            borderRadius: "12px",
            backgroundColor: "#ffffff",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.08)",
            margin: "25px 25px 0 25px",
            boxSizing: "border-box",
          }}
        >
          <EventCard />
        </div>
      </>
    </>
  );
};

export default PrincipalDashboardSACS;
