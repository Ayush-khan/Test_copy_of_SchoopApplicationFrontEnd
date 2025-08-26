import { FaUserGroup, FaUsersLine } from "react-icons/fa6";
import Card from "../common/Card.jsx";
import EventCard from "./EventCard.jsx";
import CardStuStaf from "../common/CardStuStaf.jsx";
import StudentsChart from "../Dashbord/Charts/StudentsChart.jsx";
import {
  FaBirthdayCake,
  FaCalendarAlt,
  FaClipboardCheck,
} from "react-icons/fa";
import { HiCollection } from "react-icons/hi";
import { IoTicket } from "react-icons/io5";
import NoticeBord from "./NoticeBord.jsx";
import axios from "axios";
import { useEffect, useState } from "react";
import HouseStudentChart from "./Charts/HouseStudentChart.jsx";
import TableFeeCollect from "./TableFeeCollect.jsx";
import { Link, useNavigate } from "react-router-dom";
import LoadingSpinner from "../common/LoadingSpinner.jsx";
import { ToastContainer, toast } from "react-toastify";
import { RiPassValidFill } from "react-icons/ri";
import { GiTeacher } from "react-icons/gi";
import { TfiWrite } from "react-icons/tfi";
import { MdAssessment } from "react-icons/md";
import ClassWiseAcademicPerformance from "./ClassWiseAcademicPerformance.jsx";
import TimeTableForTeacherDashbord from "./TimeTableForTeacherDashbord.jsx";
import TicketForDashboard from "./TicketForDashboard.jsx";
import { useLocation } from "react-router-dom";

const DashboardContent = () => {
  const API_URL = import.meta.env.VITE_API_URL; // url for host
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState({
    total: 0,
    present: 0,
  });

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
  const [error, setError] = useState(null);
  const [roleId, setRoleId] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("reload") === "true") {
      // Remove ?reload=true from URL
      window.history.replaceState(null, "", location.pathname);

      // Then reload
      window.location.reload();
    }
  }, [location]);

  useEffect(() => {
    fetchRoleId();
    fetchData();
  }, []);
  const fetchRoleId = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      toast.error("Authentication token not found Please login again");
      navigate("/"); // 👈 Redirect to login
      return; // 👈 Prevent further execution
    }

    try {
      const response = await axios.get(`${API_URL}/api/sessionData`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const roleId = response?.data?.user?.role_id;

      if (roleId) {
        setRoleId(roleId); // ✅ Save only roleId to state
      } else {
        console.warn("role_id not found in sessionData response");
      }
    } catch (error) {
      console.error("Failed to fetch session data:", error);
    }
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const roleId = localStorage.getItem("roleId");
      console.log("**** role ID******", roleId);

      if (!token) {
        toast.error("Authentication token not found Please login again");
        navigate("/"); // 👈 Redirect to login
        return; // 👈 Prevent further execution
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
      console.log("reponse of the staffAPI", staffResponse);
      setStaffData({
        teachingStaff: staffResponse?.data?.teachingStaff,
        attendanceteachingstaff: staffResponse?.data?.attendanceteachingstaff,
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
      console.log(
        "***the roleiD count*******",
        responseTickingCount.data.count
      );
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
      console.log("pendingFee count is here******", pendingFeeCount.data);

      // Fetch birthday Count
      const Birthdaycount = await axios.get(
        `${API_URL}/api/staffbirthdaycount`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(
        "the birthday count and it's value is=",
        Birthdaycount.data.count
      );
      setStaffBirthday(Birthdaycount.data.count);

      // fetch Approved lesson plane count
      const ApprovedLessonPlane = await axios.get(
        `${API_URL}/api/get_count_non_approved_lesson_plan`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setApprovedLessonPlaneCount(ApprovedLessonPlane.data.data);
      console.log("pendingFee count is here******", pendingFeeCount.data.data);
    } catch (error) {
      setError(error.message);
      console.error("Error fetching data:", error);
    }
  };
  return (
    <>
      {/* {error && <div className="error-message">{error}</div>} */}
      <ToastContainer />
      <div className="flex flex-col lg:flex-row items-start justify-between w-full gap-4 p-6 ">
        <div className="w-full lg:w-2/3  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* {console.log("totalstudent", studentData.total)} */}
          <Link
            to={roleId === "T" ? "#" : "/studentAbsent"}
            className="no-underline"
          >
            <CardStuStaf
              title="Student"
              roleId={roleId} // Pass the roleId here
              TotalValue={studentData.total}
              presentValue={studentData.present}
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
          {roleId === null ? (
            // Skeleton card
            <div className="flex justify-between animate-pulse bg-white rounded shadow-md p-4 w-full h-[114px] border border-gray-200">
              <div className="relative -top-2 h-20 bg-gray-300 rounded w-1/2"></div>
              <div className="relative top-3 h-10 bg-gray-300 rounded w-1/3"></div>
            </div>
          ) : roleId === "T" ? (
            // Approve Leave card for roleId "M"
            <Link to="#" className="no-underline">
              <Card
                title="Lesson Plan"
                roleId={roleId} // Pass the roleId here
                value={" "}
                color="#2196F3"
                icon={
                  <GiTeacher
                    style={{
                      color: "#987FE4",
                      backgroundColor: "white",
                      padding: "11px",
                    }}
                  />
                }
              />
            </Link>
          ) : (
            // Ticketing Module card for all other roles
            <Link to="/teacherList" className="no-underline">
              <CardStuStaf
                title="Teachers"
                TotalValue={staffData.teachingStaff}
                // presentValue={staffData.teachingStaff}
                presentValue={staffData?.attendanceteachingstaff}
                color="#2196F3"
                icon={
                  <FaUserGroup
                    style={{
                      color: "#00FFFF",
                      backgroundColor: "white",
                      padding: "10px",
                      borderRadius: "50%",
                    }}
                  />
                }
              />
            </Link>
          )}
          {/* for non teaching staff and home work */}
          {roleId === null ? (
            // Skeleton card
            <div className="flex justify-between animate-pulse bg-white rounded shadow-md p-4 w-full h-[114px] border border-gray-200">
              <div className="relative -top-2 h-20 bg-gray-300 rounded w-1/2"></div>
              <div className="relative top-3 h-10 bg-gray-300 rounded w-1/3"></div>
            </div>
          ) : roleId === "T" ? (
            // Approve Leave card for roleId "M"
            <Link to="#" className="no-underline">
              <Card
                title="Homework"
                value={" "}
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
          ) : (
            // Ticketing Module card for all other roles
            <Link to="/nonTeachingStaff" className="no-underline">
              <CardStuStaf
                title="Non-Teaching Staff"
                TotalValue={staffData.nonTeachingStaff}
                // presentValue={staffData.nonTeachingStaff}
                presentValue={staffData?.attendancenonteachingstaff}
                color="#2196F3"
                icon={
                  <FaUserGroup
                    style={{
                      color: "#A287F3",
                      backgroundColor: "white",
                      padding: "10px",
                      borderRadius: "50%",
                    }}
                  />
                }
              />
            </Link>
          )}
          {/* For fee pending */}
          {roleId === null ? (
            // Skeleton card
            <div className="flex justify-between animate-pulse bg-white rounded shadow-md p-4 w-full h-[114px] border border-gray-200">
              <div className="relative -top-2 h-20 bg-gray-300 rounded w-1/2"></div>
              <div className="relative top-3 h-10 bg-gray-300 rounded w-1/3"></div>
            </div>
          ) : roleId === "T" ? (
            // Approve Leave card for roleId "M"
            <Link to="#" className="no-underline">
              <Card
                title="Fee Pending"
                value={collectedFee}
                valuePendingFee={pendingFee}
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
          ) : (
            <Link to="/feependinglist" className="no-underline">
              <Card
                title="Fee"
                value={collectedFee}
                valuePendingFee={pendingFee}
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
          )}
          {/* Ticketling list, assessment, Approve lesson plane */}
          {roleId === null ? (
            // Skeleton card
            <div className="flex justify-between animate-pulse bg-white rounded shadow-md p-4 w-full h-[114px] border border-gray-200">
              <div className="relative -top-2 h-20 bg-gray-300 rounded w-1/2"></div>
              <div className="relative top-3 h-10 bg-gray-300 rounded w-1/3"></div>
            </div>
          ) : roleId === "M" ? (
            // Approve Leave card for roleId "M"
            <Link to="/approveLeavelist" className="no-underline">
              <Card
                title="Approve Leave"
                value={approveLeaveCount}
                color="#FFC107"
                icon={
                  <RiPassValidFill
                    style={{
                      color: "#C03078",
                      backgroundColor: "white",
                      padding: "10px",
                      borderRadius: "50%",
                    }}
                  />
                }
              />
            </Link>
          ) : roleId === "T" ? (
            // Assessment card for roleId "T"
            <Link to="#" className="no-underline">
              <Card
                title="Assessment"
                value={" "}
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
            </Link>
          ) : (
            // Ticketing Module card for all other roles
            <Link to="/ticktinglist" className="no-underline">
              <Card
                title="Ticketing Module"
                value={ticketCount}
                color="#FFC107"
                icon={
                  <IoTicket
                    style={{
                      color: "#30C790",
                      backgroundColor: "white",
                      padding: "10px",
                      borderRadius: "50%",
                    }}
                  />
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
          ) : roleId === "M" ? (
            <Link to="/approveLessonP" className="no-underline">
              <Card
                title="Approve Lesson Plans"
                value={approvedLessonPlaneCount}
                spanLabel="Pending"
                color="#4CAF50"
                icon={
                  <FaClipboardCheck
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
          ) : roleId === "T" ? (
            // Leave card for roleId "T"
            <Link to="#" className="no-underline">
              <Card
                title="Leave"
                value={" "}
                color="#FFC107"
                icon={
                  <FaCalendarAlt
                    style={{
                      color: "#00FFFF",
                      backgroundColor: "white",
                      padding: "10px",
                    }}
                  />
                }
              />
            </Link>
          ) : (
            <Link to="/staffbirthlist" className="no-underline">
              <Card
                title="Today's Birthdays"
                value={staffBirthday}
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
          )}

          {/* you can add more cards here just add on */}
        </div>

        <div className="w-full  lg:w-[33%] lg:h-full sm:h-3/4  bg-slate-100 overflow-y-hidden rounded-lg shadow-md ">
          <EventCard />
        </div>
      </div>

      <div className="flex flex-col-reverse lg:flex-row items-start justify-between w-full  gap-4  h-full lg:h-1/2  px-4 sm:flex-col-reverse ">
        <div
          className="w-full lg:w-[79%]  gap-y-3 gap-x-3 h-full bg-slate-50 rounded-lg lg:h-full sm:h-3/4"
          // className="w-full lg:w-2/3 gap-y-3 gap-x-3 h-full bg-slate-50 rounded-lg lg:h-full sm:h-1/2"
          style={{
            boxShadow:
              "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
          }}
        >
          {roleId === null ? (
            // Skeleton loader (adjust styling as needed)
            <div className="animate-pulse bg-white rounded shadow-md p-4 w-full h-[200px] border border-gray-200">
              <div className="h-6 bg-gray-300 rounded mb-4 w-1/3"></div>
              <div className="h-32 bg-gray-300 rounded"></div>
            </div>
          ) : roleId === "T" ? (
            <ClassWiseAcademicPerformance />
          ) : (
            <StudentsChart />
          )}
        </div>
        <div
          className="w-full lg:w-[39%] border-2 border-solid   bg-slate-50 rounded-lg  h-3/4 lg:h-full  "
          style={{
            boxShadow:
              "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
          }}
        >
          <NoticeBord />
        </div>
      </div>

      {/* this is extra layout */}
      <div className="flex flex-col-reverse lg:flex-row items-start justify-between w-full   gap-4 px-4 sm:flex-col-reverse mt-6">
        <div
          className="w-full lg:w-[29%] bg-slate-50 rounded-lg h-3/4"
          style={{
            boxShadow:
              "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
          }}
        >
          {roleId === null ? (
            // Skeleton card
            <div className="flex justify-between animate-pulse bg-white rounded shadow-md p-4 w-full h-[114px] border border-gray-200">
              <div className="relative -top-2 h-20 bg-gray-300 rounded w-1/2"></div>
              <div className="relative top-3 h-10 bg-gray-300 rounded w-1/3"></div>
            </div>
          ) : roleId === "T" ? (
            // Show Ticket component for Teacher
            <TicketForDashboard />
          ) : roleId !== "M" ? (
            // Show TableFeeCollect for non-"M" and non-"T"
            <TableFeeCollect />
          ) : null}
        </div>

        {/* Student house chart and time table and none */}
        {roleId === null ? (
          // Skeleton card
          <div
            className="w-full lg:w-[69%] border-2 border-solid bg-slate-50 rounded-lg lg:h-full sm:h-3/4"
            style={{
              boxShadow:
                "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
            }}
          >
            <div className="flex justify-between animate-pulse bg-white rounded shadow-md p-4 w-full h-[114px] border border-gray-200">
              <div className="relative -top-2 h-20 bg-gray-300 rounded w-1/2"></div>
              <div className="relative top-3 h-10 bg-gray-300 rounded w-1/3"></div>
            </div>
          </div>
        ) : roleId === "T" ? (
          // Show Timetable for Teacher
          <div
            className="w-full lg:w-[69%] border-2 border-solid bg-slate-50 rounded-lg lg:h-full sm:h-3/4"
            style={{
              boxShadow:
                "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
            }}
          >
            <TimeTableForTeacherDashbord />
          </div>
        ) : roleId !== "M" ? (
          // Show HouseStudentChart for non-"M" roles
          <div
            className="w-full lg:w-[69%] border-2 border-solid bg-slate-50 rounded-lg lg:h-full sm:h-3/4"
            style={{
              boxShadow:
                "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
            }}
          >
            <HouseStudentChart />
          </div>
        ) : null}
      </div>
    </>
  );
};

export default DashboardContent;
