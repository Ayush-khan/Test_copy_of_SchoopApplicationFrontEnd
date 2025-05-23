import { PiBookOpenUserLight } from "react-icons/pi";
// import { PiBookOpenUserLight } from "react-icons/pi";
import { FaUserGroup, FaUsers, FaUsersLine } from "react-icons/fa6";
import { FiUsers } from "react-icons/fi";
import { MdOutlinePayment } from "react-icons/md";
// import Card from "../components/common/Card.jsx";
import Style from "../../CSS/DashbordCss/Card.module.css";
// import NewCard from "../components/common/NewCard.jsx";
import Card from "../common/Card.jsx";
import EventCard from "./EventCard.jsx";
import CardStuStaf from "../common/CardStuStaf.jsx";
import StudentsChart from "../Dashbord/Charts/StudentsChart.jsx";
import Footer from "../../Layouts/Footer.jsx";
import { FaBirthdayCake, FaClipboardCheck } from "react-icons/fa";
import { GiAchievement } from "react-icons/gi";
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
  const [pendingFee, setPendingFee] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [roleId, setRoleId] = useState("");
  const academicYr = localStorage.getItem("academicYear");

  useEffect(() => {
    fetchRoleId();
    fetchData();
  }, []);
  const fetchRoleId = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.error("No authentication token found");
      return;
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
      // const academicYr=localStorage.getItem("user");
      const academicYr = localStorage.getItem("academicYear");
      const roleId = localStorage.getItem("roleId");
      console.log("**** role ID******", roleId);

      if (!token) {
        throw new Error("No authentication token or academic year found");
      }

      // Fetch student data
      const studentResponse = await axios.get(`${API_URL}/api/studentss`, {
        headers: {
          Authorization: `Bearer ${token}`,

          "X-Academic-Year": academicYr,
        },
      });

      setStudentData({
        total: studentResponse.data.count,
        present: studentResponse.data.present,
      });

      // Fetch staff data
      const staffResponse = await axios.get(
        // "http://127.0.0.1:8000/api/staff",
        `${API_URL}/api/staff`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Academic-Year": academicYr,
          },
        }
      );
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
            "X-Academic-Year": academicYr,
            "Role-Id": roleId, // add roleId for different role
          },
        }
      );
      console.log(
        "***the roleiD count*******",
        responseTickingCount.data.count
      );
      setTicketCount(responseTickingCount.data.count);
      // Fetch Pending Fee Records counts
      const pendingFeeCount = await axios.get(`${API_URL}/api/feecollection`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Academic-Year": academicYr,
        },
      });
      setPendingFee(pendingFeeCount.data);
      console.log("pendingFee count is here******", pendingFeeCount.data);

      // Fetch birthday Count
      const Birthdaycount = await axios.get(
        `${API_URL}/api/staffbirthdaycount`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Academic-Year": academicYr,
          },
        }
      );
      console.log(
        "the birthday count and it's value is=",
        Birthdaycount.data.count
      );
      setStaffBirthday(Birthdaycount.data.count);
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
          <Link to="/studentAbsent" className="no-underline">
            <CardStuStaf
              title="Student"
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
          <Link to="/feependinglist" className="no-underline">
            <Card
              title="Fee-Collection "
              value={pendingFee}
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

          {/* <Link to="/staffbirthlist" className="no-underline">
            <Card
              title="Today's Birthdays"
              value={staffBirthday}
              // {loading ? <LoadingSpinner /> :   value={staffBirthday}}

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
          </Link> */}
          {roleId === "M" ? (
            // Approve Lesson Plan Card
            <Link to="/approveLessonP" className="no-underline">
              <Card
                title="Approve Lesson Plans"
                // value={pendingPlansCount} // Replace with your actual value
                value={0} // Replace with your actual value
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
          ) : (
            // Staff Birthday Card
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
            // position: "relative",
            // zIndex: "1",
          }}
        >
          <StudentsChart />
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
      {/* extra layout */}
      {/* this is extra layout */}
      <div className="flex flex-col-reverse lg:flex-row items-start justify-between w-full   gap-4 px-4 sm:flex-col-reverse mt-6">
        <div
          className="w-full lg:w-[29%]    bg-slate-50 rounded-lg  h-3/4"
          // className="w-full lg:w-2/3 gap-y-3 gap-x-3 h-full bg-slate-50 rounded-lg lg:h-full sm:h-1/2"
          style={{
            boxShadow:
              "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
            // position: "relative",
            // zIndex: "1",
          }}
        >
          {" "}
          {roleId !== "M" && <TableFeeCollect />}
          {/* <TableFeeCollect /> */}
          {/* <div className="flex justify-between bg-gray-200">
            <h5 className="text-gray-500 pl-2">Filter Fee </h5>
            <TableFeeCollect />
          </div> */}
        </div>
        {roleId !== "M" && (
          <div
            className=" w-full lg:w-[69%] border-2 border-solid  bg-slate-50 rounded-lg lg:h-full sm:h-3/4 "
            style={{
              boxShadow:
                "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
            }}
          >
            {/* <NoticeBord /> */}
            <HouseStudentChart />
          </div>
        )}
      </div>
      {/* <div className=" mt-6 ">
        <Footer />
      </div> */}
    </>
  );
};

export default DashboardContent;

// // second try first is working fine
// import { PiBookOpenUserLight } from "react-icons/pi";
// // import { PiBookOpenUserLight } from "react-icons/pi";
// import { FaUserGroup, FaUsers, FaUsersLine } from "react-icons/fa6";
// import { FiUsers } from "react-icons/fi";
// import { MdOutlinePayment } from "react-icons/md";
// // import Card from "../components/common/Card.jsx";
// import Style from "../../CSS/DashbordCss/Card.module.css";
// // import NewCard from "../components/common/NewCard.jsx";
// import Card from "../common/Card.jsx";
// import EventCard from "./EventCard.jsx";
// import CardStuStaf from "../common/CardStuStaf.jsx";
// import StudentsChart from "../Dashbord/Charts/StudentsChart.jsx";
// import Footer from "../../Layouts/Footer.jsx";
// import { FaBirthdayCake } from "react-icons/fa";
// import { GiAchievement } from "react-icons/gi";
// import { HiCollection } from "react-icons/hi";
// import { IoTicket } from "react-icons/io5";
// import NoticeBord from "./NoticeBord.jsx";
// import axios from "axios";
// import { useEffect, useState } from "react";
// import HouseStudentChart from "./Charts/HouseStudentChart.jsx";
// import TableFeeCollect from "./TableFeeCollect.jsx";
// import { Link, useNavigate } from "react-router-dom";
// import LoadingSpinner from "../common/LoadingSpinner.jsx";

// const DashboardContent = () => {
//   const API_URL = import.meta.env.VITE_API_URL;
//   const [studentData, setStudentData] = useState({
//     total: 0,
//     present: 0,
//   });
//   const [staffData, setStaffData] = useState({
//     teachingStaff: 0,
//     nonTeachingStaff: 0,
//   });
//   const [staffBirthday, setStaffBirthday] = useState(0);
//   const [ticketCount, setTicketCount] = useState(0);
//   const [pendingFee, setPendingFee] = useState(0);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true); // Initially set to true for loading spinner
//   const [academicYear, setAcademicYear] = useState(""); // State to hold academic year

//   useEffect(() => {
//     // Set initial academic year from localStorage
//     const academicYearFromLocalStorage = localStorage.getItem("academicYear");
//     setAcademicYear(academicYearFromLocalStorage);
//   }, []);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const token = localStorage.getItem("authToken");
//         const roleId = localStorage.getItem("roleId");

//         if (!token || !academicYear) {
//           throw new Error("No authentication token or academic year found");
//         }

//         setLoading(true);

//         // Fetch student data
//         const studentResponse = await axios.get(`${API_URL}/api/students`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "X-Academic-Year": academicYear,
//           },
//         });
//         setStudentData({
//           total: studentResponse.data.count,
//           present: studentResponse.data.present,
//         });

//         // Fetch staff data
//         const staffResponse = await axios.get(`${API_URL}/api/staff`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "X-Academic-Year": academicYear,
//           },
//         });
//         setStaffData({
//           teachingStaff: staffResponse.data.teachingStaff,
//           nonTeachingStaff: staffResponse.data.nonTeachingStaff,
//         });

//         // Fetch ticket count
//         const ticketResponse = await axios.get(`${API_URL}/api/ticketcount`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "X-Academic-Year": academicYear,
//             "Role-Id": roleId,
//           },
//         });
//         setTicketCount(ticketResponse.data.count);

//         // Fetch pending fee count
//         const pendingFeeResponse = await axios.get(
//           `${API_URL}/api/feecollection`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "X-Academic-Year": academicYear,
//             },
//           }
//         );
//         setPendingFee(pendingFeeResponse.data);

//         // Fetch staff birthday count
//         const birthdayResponse = await axios.get(
//           `${API_URL}/api/staffbirthdaycount`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "X-Academic-Year": academicYear,
//             },
//           }
//         );
//         setStaffBirthday(birthdayResponse.data.count);

//         setLoading(false);
//       } catch (error) {
//         setError(error.message);
//         setLoading(false);
//       }
//     };

//     if (academicYear) {
//       fetchData();
//     }
//   }, [academicYear]);

//   const handleAcademicYearChange = (event) => {
//     const selectedAcademicYear = event.target.value;
//     setAcademicYear(selectedAcademicYear);
//     localStorage.setItem("academicYear", selectedAcademicYear);
//   };

//   if (loading) {
//     return <LoadingSpinner />;
//   }

//   return (
//     <>
//       {error && <p>Error: {error}</p>}

//       <div className="flex flex-col lg:flex-row items-start justify-between w-full gap-4 p-6">
//         <div className="w-full lg:w-2/3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           <CardStuStaf
//             title="Student"
//             TotalValue={studentData.total}
//             presentValue={studentData.present}
//             color="#4CAF50"
//             icon={<FaUsersLine />}
//           />
//           <CardStuStaf
//             title="Teachers"
//             TotalValue={staffData.teachingStaff}
//             presentValue={"present"}
//             color="#2196F3"
//             icon={<FaUserGroup />}
//           />
//           <CardStuStaf
//             title="Staff"
//             TotalValue={staffData.nonTeachingStaff}
//             presentValue={"Present"}
//             color="#2196F3"
//             icon={<FaUserGroup />}
//           />
//           <Link to="/feependinglist" className="no-underline">
//             <Card
//               title="Pending Fee-Collection"
//               value={pendingFee}
//               color="#FF5733"
//               icon={<HiCollection />}
//             />
//           </Link>
//           <Link to="/ticktinglist" className="no-underline">
//             <Card
//               title="Ticketing Module"
//               value={ticketCount}
//               color="#FFC107"
//               icon={<IoTicket />}
//             />
//           </Link>
//           <Link to="/staffbirthlist" className="no-underline">
//             <Card
//               title="Birthday"
//               value={staffBirthday}
//               color="#2196F3"
//               icon={<FaBirthdayCake />}
//             />
//           </Link>
//         </div>

//         <div className="w-full lg:w-1/3 lg:h-full sm:h-3/4 mt-6 lg:mt-0 bg-slate-100 overflow-y-hidden rounded-lg shadow-md">
//           <EventCard />
//         </div>
//       </div>

//       <div className="flex flex-col-reverse lg:flex-row items-start justify-between w-full pr-6 gap-10 h-full lg:h-1/2 px-6 sm:flex-col-reverse">
//         <div
//           className="w-full gap-y-3 gap-x-3 h-full bg-slate-50 rounded-lg lg:h-full sm:h-3/4"
//           style={{
//             boxShadow:
//               "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
//           }}
//         >
//           <StudentsChart />
//         </div>
//         <div
//           className="w-full lg:w-1/3 border-2 border-solid bg-slate-50 rounded-lg h-3/4 lg:h-full"
//           style={{
//             boxShadow:
//               "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
//           }}
//         >
//           <NoticeBord />
//         </div>
//       </div>

//       <div className="flex flex-col-reverse lg:flex-row items-start justify-between w-full pr-6 gap-5 px-6 sm:flex-col-reverse mr-12 mt-6">
//         <div
//           className="w-full lg:w-1/4 gap-y-3 gap-x-3 bg-slate-50 rounded-lg h-3/4"
//           style={{
//             boxShadow:
//               "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
//           }}
//         >
//           <TableFeeCollect />
//         </div>
//         <div
//           className="w-full lg:w-[70%] border-2 border-solid bg-slate-50 rounded-lg lg:h-full sm:h-3/4"
//           style={{
//             boxShadow:
//               "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px",
//           }}
//         >
//           <HouseStudentChart />
//         </div>
//       </div>

//       <div className="mt-6">
//         <Footer />
//       </div>
//     </>
//   );
// };

// export default DashboardContent;
