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

import { MdOutlinePayments } from "react-icons/md";
import { MdOutlineWarningAmber } from "react-icons/md";
import { HiOutlineDocumentText } from "react-icons/hi";
import { MdOutlineAssignment } from "react-icons/md";
import TodoListandRemainders from "./TodoListandRemainders.jsx";

const DashboardContent = () => {
  const API_URL = import.meta.env.VITE_API_URL; // url for host
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState({
    total: 0,
    present: 0,
  });
  const [sortNameCookie, setSortNameCookie] = useState("");
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
  const [regId, setRegId] = useState(null);
  const [teacherCardsData, setTeachersCardsData] = useState([]);
  const [birthdayCardT, setBirthdayCardT] = useState("");
  const [homeworkCardT, setHomeworkCardT] = useState("");
  // const [studentCardT, setStudentCardT] = useState("");
  const [studentCardT, setStudentCardT] = useState({
    total: 0,
    present: 0,
  });
  const [pendingStudentFeeT, setPendingStudentFeeT] = useState("");
  const [pendingStudentCount, setPendingStudentCount] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoleId();
  }, []);

  useEffect(() => {
    if (!roleId) return;

    if (roleId === "T") {
      fetchTeachersCardData();
    } else {
      fetchData();
    }
  }, [roleId]);

  // const fetchRoleId = async () => {
  //   const token = localStorage.getItem("authToken");

  //   if (!token) {
  //     toast.error("Authentication token not found Please login again");
  //     navigate("/");
  //     return;
  //   }

  //   try {
  //     const response = await axios.get(`${API_URL}/api/sessionData`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     const roleId = response?.data?.user?.role_id;
  //     console.log("role id", response?.data?.user?.role_id);

  //     const regId = response?.data?.user?.reg_id;
  //     console.log("reg id", response?.data?.user?.reg_id);
  //     setRegId(regId);
  //     setSortNameCookie(response?.data?.custom_claims?.short_name);
  //     console.log("short name..", response?.data?.custom_claims?.short_name);
  //     if (roleId) {
  //       setRoleId(roleId);
  //     } else {
  //       console.warn("role_id not found in sessionData response");
  //     }
  //   } catch (error) {
  //     console.error("Failed to fetch session data:", error);
  //   }
  // };

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
      console.error("Failed to fetch session data:", error);
    } finally {
      setLoading(false); // stop loading after API
    }
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const roleId = localStorage.getItem("roleId");
      console.log("**** role ID******", roleId);

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

  const fetchTeachersCardData = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      toast.error("Authentication token not found Please login again");
      navigate("/");
      return;
    }

    try {
      const response = await axios.get(
        `${API_URL}/api/teachers/${regId}/dashboard/summary`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const teacherCards = response?.data?.data;
      console.log("Teacher card api..", teacherCards);
      setTeachersCardsData(teacherCards);

      const studentCard = response?.data?.data?.studentCard;
      console.log("student T card api..", studentCard);
      setStudentCardT({
        total: studentCard?.totalStudents ?? 0,
        present: studentCard?.totalStudentsPresentToday ?? 0,
      });

      const homeworkCard = response?.data?.data?.homeworkCard;
      console.log("homework T card api..", homeworkCard);
      setHomeworkCardT({
        submissiondate: homeworkCard?.countOfHomeworksDueToday ?? 0,
      });

      const birthdayCard = response?.data?.data?.birthDayCard;
      console.log("birthday T card api..", birthdayCard);
      setBirthdayCardT({
        birthdaycount: birthdayCard?.countOfBirthdaysToday ?? 0,
      });

      const defaulterCard = response.data?.data?.defaulterCount;
      console.log("defaulter T card api..", defaulterCard);
      setPendingStudentCount(defaulterCard?.totalNumberOfDefaulters);
      setPendingStudentFeeT(defaulterCard?.totalPendingAmount);
    } catch (error) {
      console.error("Failed to fetch session data:", error);
    }
  };

  return (
    <>
      {["A", "P", "M"].includes(roleId) && (
        <>
          {/* {error && <div className="error-message">{error}</div>} */}
          <ToastContainer />
          <div className="flex flex-col lg:flex-row items-start justify-between w-full gap-4 p-6 ">
            <div className="w-full lg:w-2/3  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* {console.log("totalstudent", studentData.total)} */}
              {/* ayush */}
              {/* <Link
            to={roleId === "T" ? "/studentAbsent" : "/studentAbsent"}
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
          </Link> */}

              {/* mahima */}
              <Link to="/studentAbsent" className="no-underline">
                <CardStuStaf
                  title="Student"
                  roleId={roleId}
                  TotalValue={
                    roleId === "T" ? studentCardT?.total : studentData?.total
                  }
                  presentValue={
                    roleId === "T"
                      ? studentCardT?.present
                      : studentData?.present
                  }
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
                    title="Substitution Class"
                    roleId={roleId} // Pass the roleId here
                    value={" "}
                    color="#2196F3"
                    // icon={
                    //   <GiTeacher
                    //     style={{
                    //       color: "#987FE4",
                    //       backgroundColor: "white",
                    //       padding: "11px",
                    //     }}
                    //   />
                    // }
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
                  {/* MdOutlineWarningAmber */}
                  {/* import {HiOutlineDocumentText} from "react-icons/hi"; */}
                </Link>
              ) : (
                // Ticketing Module card for all other roles
                // <Link to="/teacherList" className="no-underline">
                //   <CardStuStaf
                //     title="Teachers"
                //     TotalValue={staffData.teachingStaff}
                //     // presentValue={staffData.teachingStaff}
                //     presentValue={staffData?.attendanceteachingstaff}
                //     color="#2196F3"
                //     icon={
                //       <FaUserGroup
                //         style={{
                //           color: "#00FFFF",
                //           backgroundColor: "white",
                //           padding: "10px",
                //           borderRadius: "50%",
                //         }}
                //       />
                //     }
                //   />
                // </Link>
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
                        sortNameCookie === "HSCS"
                          ? { pointerEvents: "none" } // No opacity (as you requested)
                          : {}
                      }
                    >
                      <CardStuStaf
                        title="Teachers"
                        TotalValue={staffData.teachingStaff}
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
                        disableLoader={sortNameCookie === "HSCS"} // 👈 ADD THIS
                      />
                    </Link>
                  </button>
                </>
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
                <Link to="/homeworkNotSubmitedStudent" className="no-underline">
                  <Card
                    title="Homework"
                    value={homeworkCardT.submissiondate}
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
                  // MdOutlineAssignment
                  />
                </Link>
              ) : (
                // Ticketing Module card for all other roles
                // <Link to="/nonTeachingStaff" className="no-underline">
                //   <CardStuStaf
                //     title="Non-Teaching Staff"
                //     TotalValue={staffData.nonTeachingStaff}
                //     // presentValue={staffData.nonTeachingStaff}
                //     presentValue={staffData?.attendancenonteachingstaff}
                //     color="#2196F3"
                //     icon={
                //       <FaUserGroup
                //         style={{
                //           color: "#A287F3",
                //           backgroundColor: "white",
                //           padding: "10px",
                //           borderRadius: "50%",
                //         }}
                //       />
                //     }
                //   />
                // </Link>
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
                      to={sortNameCookie === "HSCS" ? "#" : "/nonTeachingStaff"}
                      className="no-underline"
                      style={
                        sortNameCookie === "HSCS"
                          ? { pointerEvents: "none" }
                          : {}
                      }
                    >
                      <CardStuStaf
                        title="Non-Teaching Staff"
                        TotalValue={staffData.nonTeachingStaff}
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
                        disableLoader={sortNameCookie === "HSCS"} // 👈 ADD THIS
                      />
                    </Link>
                  </button>
                </>
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
                <Link to="/defaulterStudentList" className="no-underline">
                  <Card
                    title="Defaulter List"
                    value={pendingStudentCount}
                    valuePendingFee={pendingStudentFeeT}
                    color="#FF5733"
                    icon={
                      <HiCollection
                        style={{
                          color: "green",
                          backgroundColor: "white",
                          padding: "10px",
                          borderRadius: "50%",
                          // width: "80%",
                          // height: "80%",
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
                <Link to="/ticketList" className="no-underline">
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
                <Link to="#" className="no-underline">
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
                // <Link to="#" className="no-underline">
                //   <Card
                //     title="Leave"
                //     value={" "}
                //     color="#FFC107"
                //     icon={
                //       <FaCalendarAlt
                //         style={{
                //           color: "#00FFFF",
                //           backgroundColor: "white",
                //           padding: "10px",
                //         }}
                //       />
                //     }
                //   />
                // </Link>
                <Link to="/todayStudentBirthday" className="no-underline">
                  <Card
                    title="Birthdays"
                    value={birthdayCardT.birthdaycount}
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
              ) : (
                <Link to="/staffbirthlist" className="no-underline">
                  <Card
                    title="Birthdays"
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
                <div className="animate-pulse bg-white rounded shadow-md p-4 w-full h-[200px] border border-gray-200">
                  <div className="h-6 bg-gray-300 rounded mb-4 w-1/3"></div>
                  <div className="h-32 bg-gray-300 rounded"></div>
                </div>
              ) : roleId === "T" ? (
                <TimeTableForTeacherDashbord />
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
              {roleId === "T" ? <TodoListandRemainders /> : <NoticeBord />}
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
                {/* <TimeTableForTeacherDashbord /> */}
                <ClassWiseAcademicPerformance />
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
      )}

      {roleId === "T" && (
        <>
          <ToastContainer />

          {/*  SECTION 1 */}
          <section className="w-full px-4 md:px-6 py-3">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Cards */}
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link to="/studentAbsent" className="no-underline">
                  <CardStuStaf
                    title="Student"
                    roleId={roleId}
                    TotalValue={
                      roleId === "T" ? studentCardT?.total : studentData?.total
                    }
                    presentValue={
                      roleId === "T"
                        ? studentCardT?.present
                        : studentData?.present
                    }
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

                <Link to="#" className="no-underline">
                  <Card
                    title="Substitution Class"
                    value=" "
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

                <Link to="/homeworkNotSubmitedStudent" className="no-underline">
                  <Card
                    title="Homework"
                    value={homeworkCardT.submissiondate}
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

                <Link to="/defaulterStudentList" className="no-underline">
                  <Card
                    title="Defaulter List"
                    value={pendingStudentCount}
                    valuePendingFee={pendingStudentFeeT}
                    color="#FF5733"
                    icon={
                      <HiCollection
                        style={{
                          color: "green",
                          backgroundColor: "white",
                          padding: "10px",
                          borderRadius: "50%",
                          // width: "80%",
                          // height: "80%",
                        }}
                      />
                    }
                  />
                </Link>

                <Link to="#" className="no-underline">
                  <Card
                    title="Assessment"
                    value=" "
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

                <Link to="/todayStudentBirthday" className="no-underline">
                  <Card
                    title=" Birthdays"
                    value={birthdayCardT.birthdaycount}
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

              {/* Event Card */}
              <div className="lg:col-span-4">
                {/* <div className="bg-slate-100 rounded-lg shadow-md h-full">
                  <EventCard />
                </div> */}
                <div className="w-full  lg:w-full lg:h-full sm:h-3/4  bg-slate-100 overflow-y-hidden rounded-lg shadow-md ">
                  <EventCard />
                </div>
              </div>
            </div>
          </section>

          {/*  SECTION 2 */}
          {/* <section className="w-full px-4 md:px-6 py-3">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-8 bg-slate-50 rounded-lg shadow-md">
                <TimeTableForTeacherDashbord />
              </div>

              <div className="lg:col-span-4 bg-slate-50 rounded-lg shadow-md">
                <TodoListandRemainders />
              </div>
            </div>
          </section> */}

          <section className="w-full px-4 md:px-6 py-3">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Timetable */}
              <div className="lg:col-span-8 bg-slate-50 rounded-lg shadow-md h-[380px] flex flex-col">
                <TimeTableForTeacherDashbord />
              </div>

              {/* Todo */}
              <div className="lg:col-span-4 bg-slate-50 rounded-lg shadow-md h-[380px] flex flex-col">
                <TodoListandRemainders />
              </div>
            </div>
          </section>

          {/*  SECTION 3*/}
          <section className="w-full px-4 md:px-6 py-3">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Ticket */}
              <div className="lg:col-span-4 bg-slate-50 rounded-lg shadow-md">
                <TicketForDashboard />
              </div>

              {/* Performance */}
              <div className="lg:col-span-8 bg-slate-50 rounded-lg shadow-md">
                <ClassWiseAcademicPerformance />
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
};

export default DashboardContent;

//  {
//    ["T"].includes(roleId) && (
//      <>
//        <ToastContainer />
//        <div className="flex flex-col lg:flex-row items-start justify-between w-full gap-4 p-6 ">
//          <div className="w-full lg:w-2/3  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//            {/* mahima */}
//            <Link to="/studentAbsent" className="no-underline">
//              <CardStuStaf
//                title="Student"
//                roleId={roleId}
//                TotalValue={studentCardT?.total}
//                presentValue={studentCardT?.present}
//                color="#4CAF50"
//                icon={
//                  <FaUsersLine
//                    style={{
//                      color: "violet",
//                      backgroundColor: "white",
//                      padding: "10px",
//                      borderRadius: "50%",
//                    }}
//                  />
//                }
//              />
//            </Link>

//            {roleId === null ? (
//              // Skeleton card
//              <div className="flex justify-between animate-pulse bg-white rounded shadow-md p-4 w-full h-[114px] border border-gray-200">
//                <div className="relative -top-2 h-20 bg-gray-300 rounded w-1/2"></div>
//                <div className="relative top-3 h-10 bg-gray-300 rounded w-1/3"></div>
//              </div>
//            ) : (
//              // Approve Leave card for roleId "M"
//              <Link to="#" className="no-underline">
//                <Card
//                  title="Substitution Class"
//                  roleId={roleId} // Pass the roleId here
//                  value={" "}
//                  color="#2196F3"
//                  // icon={
//                  //   <GiTeacher
//                  //     style={{
//                  //       color: "#987FE4",
//                  //       backgroundColor: "white",
//                  //       padding: "11px",
//                  //     }}
//                  //   />
//                  // }
//                  icon={
//                    <HiOutlineDocumentText
//                      style={{
//                        color: "#FF6B6B",
//                        backgroundColor: "white",
//                        padding: "11px",
//                      }}
//                    />
//                  }
//                />
//                {/* MdOutlineWarningAmber */}
//                {/* import {HiOutlineDocumentText} from "react-icons/hi"; */}
//              </Link>
//            )}

//            {/* for non teaching staff and home work */}
//            {roleId === null ? (
//              // Skeleton card
//              <div className="flex justify-between animate-pulse bg-white rounded shadow-md p-4 w-full h-[114px] border border-gray-200">
//                <div className="relative -top-2 h-20 bg-gray-300 rounded w-1/2"></div>
//                <div className="relative top-3 h-10 bg-gray-300 rounded w-1/3"></div>
//              </div>
//            ) : (
//              // Approve Leave card for roleId "M"
//              <Link to="/homeworkNotSubmitedStudent" className="no-underline">
//                <Card
//                  title="Homework"
//                  value={homeworkCardT.submissiondate}
//                  color="#FF9800"
//                  icon={
//                    <TfiWrite
//                      style={{
//                        color: "#2196F3",
//                        backgroundColor: "white",
//                        padding: "13px",
//                      }}
//                    />
//                  }
//                  // MdOutlineAssignment
//                />
//              </Link>
//            )}

//            {/* For fee pending */}
//            {roleId === null ? (
//              // Skeleton card
//              <div className="flex justify-between animate-pulse bg-white rounded shadow-md p-4 w-full h-[114px] border border-gray-200">
//                <div className="relative -top-2 h-20 bg-gray-300 rounded w-1/2"></div>
//                <div className="relative top-3 h-10 bg-gray-300 rounded w-1/3"></div>
//              </div>
//            ) : (
//              <Link to="/defaulterStudentList" className="no-underline">
//                <Card
//                  title="Defaulter List"
//                  value={pendingStudentCount}
//                  valuePendingFee={pendingStudentFeeT}
//                  color="#FF5733"
//                  icon={
//                    <HiCollection
//                      style={{
//                        color: "green",
//                        backgroundColor: "white",
//                        padding: "10px",
//                        borderRadius: "50%",
//                        // width: "80%",
//                        // height: "80%",
//                      }}
//                    />
//                  }
//                />
//              </Link>
//            )}

//            {roleId === null ? (
//              // Skeleton card
//              <div className="flex justify-between animate-pulse bg-white rounded shadow-md p-4 w-full h-[114px] border border-gray-200">
//                <div className="relative -top-2 h-20 bg-gray-300 rounded w-1/2"></div>
//                <div className="relative top-3 h-10 bg-gray-300 rounded w-1/3"></div>
//              </div>
//            ) : (
//              // Assessment card for roleId "T"
//              <Link to="#" className="no-underline">
//                <Card
//                  title="Assessment"
//                  value={" "}
//                  color="#4CAF50"
//                  icon={
//                    <MdAssessment
//                      style={{
//                        color: "#C03078",
//                        backgroundColor: "white",
//                        padding: "10px",
//                      }}
//                    />
//                  }
//                />
//              </Link>
//            )}

//            {/* Approve lesson plane, Birthday, Leave */}
//            {roleId === null ? (
//              // Skeleton card
//              <div className="flex justify-between animate-pulse bg-white rounded shadow-md p-4 w-full h-[114px] border border-gray-200">
//                <div className="relative -top-2 h-20 bg-gray-300 rounded w-1/2"></div>
//                <div className="relative top-3 h-10 bg-gray-300 rounded w-1/3"></div>
//              </div>
//            ) : (
//              <Link to="/todayStudentBirthday" className="no-underline">
//                <Card
//                  title="Today's Birthdays"
//                  value={birthdayCardT.birthdaycount}
//                  color="#2196F3"
//                  icon={
//                    <FaBirthdayCake
//                      style={{
//                        color: "cyan",
//                        backgroundColor: "white",
//                        padding: "10px",
//                        borderRadius: "50%",
//                      }}
//                    />
//                  }
//                />
//              </Link>
//            )}
//          </div>

//          <div className="w-full  lg:w-[33%] lg:h-full sm:h-3/4  bg-slate-100 overflow-y-hidden rounded-lg shadow-md ">
//            <EventCard />
//          </div>
//        </div>

//        <div className="flex flex-col-reverse lg:flex-row items-start justify-between w-full  gap-4  h-full lg:h-1/2  px-4 sm:flex-col-reverse ">
//          <div
//            className="w-full lg:w-[79%]  gap-y-3 gap-x-3 h-full bg-slate-50 rounded-lg lg:h-full sm:h-3/4"
//            style={{
//              boxShadow:
//                "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
//            }}
//          >
//            {roleId === null ? (
//              <div className="animate-pulse bg-white rounded shadow-md p-4 w-full h-[200px] border border-gray-200">
//                <div className="h-6 bg-gray-300 rounded mb-4 w-1/3"></div>
//                <div className="h-32 bg-gray-300 rounded"></div>
//              </div>
//            ) : (
//              <TimeTableForTeacherDashbord />
//            )}
//          </div>
//          <div
//            className="w-full lg:w-[39%] border-2 border-solid   bg-slate-50 rounded-lg  h-3/4 lg:h-full  "
//            style={{
//              boxShadow:
//                "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
//            }}
//          >
//            <TodoListandRemainders />
//          </div>
//        </div>

//        {/* this is extra layout */}
//        <div className="flex flex-col-reverse lg:flex-row items-start justify-between w-full   gap-4 px-4 sm:flex-col-reverse mt-6">
//          <div
//            className="w-full lg:w-[29%] bg-slate-50 rounded-lg h-3/4"
//            style={{
//              boxShadow:
//                "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
//            }}
//          >
//            {roleId === null ? (
//              // Skeleton card
//              <div className="flex justify-between animate-pulse bg-white rounded shadow-md p-4 w-full h-[114px] border border-gray-200">
//                <div className="relative -top-2 h-20 bg-gray-300 rounded w-1/2"></div>
//                <div className="relative top-3 h-10 bg-gray-300 rounded w-1/3"></div>
//              </div>
//            ) : (
//              // Show Ticket component for Teacher
//              <TicketForDashboard />
//            )}
//          </div>

//          {/* Student house chart and time table and none */}
//          {roleId === null ? (
//            // Skeleton card
//            <div
//              className="w-full lg:w-[69%] border-2 border-solid bg-slate-50 rounded-lg lg:h-full sm:h-3/4"
//              style={{
//                boxShadow:
//                  "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
//              }}
//            >
//              <div className="flex justify-between animate-pulse bg-white rounded shadow-md p-4 w-full h-[114px] border border-gray-200">
//                <div className="relative -top-2 h-20 bg-gray-300 rounded w-1/2"></div>
//                <div className="relative top-3 h-10 bg-gray-300 rounded w-1/3"></div>
//              </div>
//            </div>
//          ) : (
//            <div
//              className="w-full lg:w-[69%] border-2 border-solid bg-slate-50 rounded-lg lg:h-full sm:h-3/4"
//              style={{
//                boxShadow:
//                  "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
//              }}
//            >
//              <ClassWiseAcademicPerformance />
//            </div>
//          )}
//        </div>
//      </>
//    );
//  }
