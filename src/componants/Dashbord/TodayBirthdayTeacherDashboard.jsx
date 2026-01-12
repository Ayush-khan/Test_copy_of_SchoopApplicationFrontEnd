// import axios from "axios";
// import { RxCross1 } from "react-icons/rx";
// import { useNavigate } from "react-router-dom";
// import { useState, useEffect } from "react";
// function TodayBirthdayTeacherDashboard() {
//   const API_URL = import.meta.env.VITE_API_URL;

//   const [todayBirthday, setTodayBirthday] = useState([]);
//   const [previousBirthday, setPreviousBirthday] = useState([]);
//   const [tomorrowBirthday, setTomorrowBirthday] = useState([]);

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState("Today's Birthday");

//   useEffect(() => {
//     fetchBirthdayList();
//   }, []);

//   // const fetchBirthdayList = async () => {
//   //   try {
//   //     const token = localStorage.getItem("authToken");

//   //     if (!token) {
//   //       throw new Error("No authentication token found");
//   //     }

//   //     const response = await axios.get(`${API_URL}/api/students/birthdays`, {
//   //       headers: {
//   //         Authorization: `Bearer ${token}`,
//   //       },
//   //     });

//   //     console.log("Birthday list response:", response.data);

//   //     const { yesterday, today, tomorrow } = response.data;
//   //     setStaffBirthday(Array.isArray(tomorrow) ? tomorrow : []);
//   //     setStudentBirthday(Array.isArray(today) ? today : []);
//   //     setPreviousBirthday(Array.isArray(yesterday) ? yesterday : []);
//   //   } catch (error) {
//   //     setError(error.message || "Something went wrong");
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   const fetchBirthdayList = async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem("authToken");

//       if (!token) {
//         throw new Error("No authentication token found");
//       }

//       const response = await axios.get(`${API_URL}/api/students/birthdays`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const { yesterday, today, tomorrow } = response.data;

//       setPreviousBirthday(Array.isArray(yesterday) ? yesterday : []);
//       setTodayBirthday(Array.isArray(today) ? today : []);
//       setTomorrowBirthday(Array.isArray(tomorrow) ? tomorrow : []);
//     } catch (error) {
//       setError(error.message || "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleTabChange = (tab) => {
//     setActiveTab(tab); // Update the active tab state
//   };

//   const getBirthdayDataByTab = () => {
//     if (activeTab === "Today's Birthday") return todayBirthday;
//     if (activeTab === "Previous Birthday") return previousBirthday;
//     if (activeTab === "Tomorrow Birthday") return tomorrowBirthday;
//     return [];
//   };

//   const birthdayData = getBirthdayDataByTab();

//   return (
//     <>
//       <div className="md:mx-auto md:w-[70%] p-4 bg-white mt-4 ">
//         <div className="card-header flex justify-between items-center">
//           <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
//             Today's Birthday List
//           </h3>
//           <RxCross1
//             className="float-end relative  -top-1 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
//             onClick={() => {
//               navigate("/dashboard");
//             }}
//           />
//         </div>
//         <div
//           className="relative mb-8 h-1 mx-auto bg-red-700"
//           style={{ backgroundColor: "#C03078" }}
//         ></div>

//         <ul className="grid grid-cols-2 gap-x-10 relative -left-6 md:left-0 md:flex md:flex-row  -top-4">
//           {["Previous Birthday", "Today's Birthday", "Tomorrow Birthday"].map(
//             (tab) => (
//               <li
//                 key={tab}
//                 className={`md:-ml-7 shadow-md ${
//                   activeTab === tab ? "text-blue-500 font-bold" : ""
//                 }`}
//               >
//                 <button
//                   onClick={() => handleTabChange(tab)}
//                   className="px-2 md:px-4 py-1 hover:bg-gray-200 text-[1em] md:text-sm text-nowrap"
//                 >
//                   {tab.replace(/([A-Z])/g, " $1")}
//                 </button>
//               </li>
//             )
//           )}
//         </ul>

//         <div className="bg-white rounded-md -mt-5">
//           {loading ? (
//             <div className="text-center text-xl py-10 text-blue-700">
//               Please wait while data is loading...
//             </div>
//           ) : (
//             <>
//               <table className="min-w-full leading-normal table-auto">
//                 <thead>
//                   <tr className="bg-gray-100">
//                     <th className="px-1 py-2 border border-gray-950 text-sm">
//                       S.No
//                     </th>
//                     <th className="px-1 py-2 border border-gray-950 text-sm">
//                       Student's Name
//                     </th>
//                     <th className="px-1 py-2 border border-gray-950 text-sm">
//                       Class
//                     </th>
//                     <th className="px-1 py-2 border border-gray-950 text-sm">
//                       Mobile
//                     </th>
//                     <th className="px-1 py-2 border border-gray-950 text-sm">
//                       Email
//                     </th>
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {birthdayData.length > 0 ? (
//                     birthdayData.map((student, index) => (
//                       <tr
//                         key={student.student_id}
//                         className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
//                       >
//                         <td className="border text-center">{index + 1}</td>

//                         <td className="border text-center">
//                           {`${student.first_name || ""} ${
//                             student.mid_name || ""
//                           } ${student.last_name || ""}`.trim()}
//                         </td>

//                         <td className="border text-center">
//                           {student.classname} {student.sectionname}
//                         </td>

//                         <td className="border text-center">
//                           {student.guardian_mobile ||
//                             student.emergency_contact ||
//                             "-"}
//                         </td>

//                         <td className="border text-center">
//                           {student.email_id || student.m_emailid || "-"}
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td
//                         colSpan="5"
//                         className="text-center text-xl py-5 text-red-700"
//                       >
//                         No birthday found.
//                         {/* {activeTab.toLowerCase()}. */}
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>

//               {birthdayData.length > 0 && (
//                 <div className="text-blue-500 text-center text-lg font-medium mt-3">
//                   Total Students: {birthdayData.length}
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </div>
//     </>
//   );
// }

// export default TodayBirthdayTeacherDashboard;

import axios from "axios";
import { RxCross1 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FiPrinter } from "react-icons/fi";
import { FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function TodayBirthdayTeacherDashboard() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [staffBirthday, setStaffBirthday] = useState([]);
  const [studentBirthday, setStudentBirthday] = useState([]);
  const [studentCount, setStudentCount] = useState(0);
  const [teacherCount, setTeacherCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Students Birthday");
  const [activeSubTab, setActiveSubTab] = useState("today");

  useEffect(() => {
    fetchBirthdayList();
  }, []);

  // const fetchBirthdayList = async () => {
  //   try {
  //     const token = localStorage.getItem("authToken");

  //     if (!token) {
  //       throw new Error("No authentication token found");
  //     }

  //     const response = await axios.get(`${API_URL}/api/students/birthdays`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     console.log("Full Birthday API Response:", response.data);

  //     const { studentBirthDays, staffBirthDays } = response.data.data;

  //     // 🔹 Console for verification
  //     console.log("Students Yesterday:", studentBirthDays.yesterday);
  //     console.log("Students Today:", studentBirthDays.today);
  //     console.log("Students Tomorrow:", studentBirthDays.tomorrow);

  //     console.log("Staff Yesterday:", staffBirthDays.yesterday);
  //     console.log("Staff Today:", staffBirthDays.today);
  //     console.log("Staff Tomorrow:", staffBirthDays.tomorrow);

  //     // 🔹 Store full structured data (recommended)
  //     setStudentBirthday(studentBirthDays);
  //     setStaffBirthday(staffBirthDays);

  //     // 🔹 Optional counts (example: today's count)
  //     setStudentCount(studentBirthDays.today.count || 0);
  //     setTeacherCount(staffBirthDays.today.count || 0);
  //   } catch (error) {
  //     setError(error.message || "Something went wrong");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchBirthdayList = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(`${API_URL}/api/students/birthdays`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Full Birthday API Response:", response.data);

      const { studentBirthDays, staffBirthDays } = response.data.data;

      // 🔹 Normalize API response to match UI structure
      const normalizeBirthdayData = (data) => ({
        yesterday: {
          list: data?.yesterday || [],
          count: data?.yesterday?.length || 0,
        },
        today: {
          list: data?.today || [],
          count: data?.today?.length || 0,
        },
        tomorrow: {
          list: data?.tomorrow || [],
          count: data?.tomorrow?.length || 0,
        },
      });

      const normalizedStudents = normalizeBirthdayData(studentBirthDays);
      const normalizedStaff = normalizeBirthdayData(staffBirthDays);

      // 🔹 Debug logs
      console.log("Students Today:", normalizedStudents.today.list);
      console.log("Staff Today:", normalizedStaff.today.list);

      // 🔹 Update state
      setStudentBirthday(normalizedStudents);
      setStaffBirthday(normalizedStaff);

      // 🔹 Optional default counts (Today)
      setStudentCount(normalizedStudents.today.count);
      setTeacherCount(normalizedStaff.today.count);
    } catch (error) {
      console.error("Birthday fetch error:", error);
      setError(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const activeKey =
    activeSubTab === "previous"
      ? "yesterday"
      : activeSubTab === "today"
      ? "today"
      : "tomorrow";

  const activeStudentList = studentBirthday?.[activeKey]?.list || [];
  const activeStaffList = staffBirthday?.[activeKey]?.list || [];

  const activeStudentCount = activeStudentList.length;
  const activeStaffCount = activeStaffList.length;

  const handleTabChange = (tab) => {
    setActiveTab(tab); // Update the active tab state
  };

  const camelCase = (str) =>
    str
      ?.toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  return (
    <>
      <ToastContainer />
      <div className="md:mx-auto md:w-[70%] p-3 bg-white mt-4 ">
        <div className="card-header flex justify-between items-center">
          <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
            Today's Birthday List
          </h3>
          <RxCross1
            className="float-end relative  -top-1 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
            onClick={() => {
              navigate("/dashboard");
            }}
          />
        </div>
        <div
          className="relative mb-3 h-1 mx-auto bg-red-700"
          style={{ backgroundColor: "#C03078" }}
        ></div>

        {/* correct work for both  */}
        <div className="w-full flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <ul className="flex flex-wrap items-center gap-3 md:gap-6">
            {["Students Birthday", "Staff Birthday"].map((tab) => (
              <li
                key={tab}
                className={`shadow-md rounded ${
                  activeTab === tab ? "text-blue-500 font-bold" : ""
                }`}
              >
                <button
                  onClick={() => {
                    setActiveTab(tab);
                    setActiveSubTab("today");
                  }}
                  className="px-3 py-1 hover:bg-gray-200 text-sm md:text-base whitespace-nowrap"
                >
                  {tab}
                </button>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-2 justify-start md:justify-end">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { label: "Yesterday", value: "previous" },
                { label: "Today", value: "today" },
                { label: "Tomorrow", value: "tomorrow" },
              ].map((sub) => (
                <button
                  key={sub.value}
                  onClick={() => setActiveSubTab(sub.value)}
                  className={`px-3 py-1 text-sm rounded-full whitespace-nowrap transition
            ${
              activeSubTab === sub.value
                ? "bg-blue-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-md mt-3">
          {loading ? (
            <div className="text-center text-xl py-10 text-blue-700">
              Please wait while data is loading...
            </div>
          ) : activeTab === "Students Birthday" ? (
            <>
              <table className="min-w-full leading-normal table-auto">
                <thead>
                  <tr className="bg-gray-100">
                    <th className=" px-0.5 w-full md:w-[8%] mx-auto text-center lg:px-1 py-2  border border-gray-950 text-sm font-semibold text-gray-900  tracking-wider">
                      S.No
                    </th>
                    <th className=" px-0.5 w-full md:w-[30%] mx-auto text-center lg:px-1 py-2  border border-gray-950 text-sm font-semibold text-gray-900  tracking-wider">
                      Student's name
                    </th>
                    <th className=" px-0.5 text-center lg:px-1 py-2  border border-gray-950 text-sm font-semibold text-gray-900  tracking-wider">
                      Class
                    </th>
                    <th className=" px-0.5 text-center lg:px-1 py-2  border border-gray-950 text-sm font-semibold text-gray-900  tracking-wider">
                      Mobile
                    </th>
                    <th className="px-2  py-2 border border-gray-950 text-sm font-semibold text-center text-gray-900">
                      Email
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {activeStudentList.length > 0 ? (
                    activeStudentList.map((student, index) => (
                      <tr
                        key={student.student_id}
                        className={`${
                          index % 2 === 0 ? "bg-white" : "bg-gray-100"
                        } hover:bg-gray-50`}
                      >
                        <td className="text-center border border-gray-950 text-sm py-2">
                          {index + 1}
                        </td>

                        <td className="text-center border border-gray-950 text-sm py-2">
                          {camelCase(
                            `${student.first_name || ""} ${
                              student.mid_name || ""
                            } ${student.last_name || ""}`
                          )}
                        </td>

                        <td className="text-center border border-gray-950 text-sm py-2">
                          {student?.class_name || ""}{" "}
                          {student?.section_name || ""}
                        </td>

                        <td className="text-center border border-gray-950 text-sm py-2">
                          {student.phone_no || student.emergency_contact || ""}
                        </td>

                        <td className="text-center border border-gray-950 text-sm py-2">
                          {student?.email_id || student?.m_emailid || ""}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center text-xl py-5 text-red-700"
                      >
                        No student birthday {activeSubTab}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>{" "}
              {activeStudentList.length > 0 && (
                <div className="text-blue-500 mt-3 text-[1.1em] font-medium text-center">
                  Total Students Birthday: {activeStudentCount}
                </div>
              )}
            </>
          ) : (
            <>
              {" "}
              <table className="min-w-full leading-normal table-auto">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-1 w-full md:w-[8%] mx-auto py-2 border border-gray-950 text-sm font-semibold text-center text-gray-900">
                      S.No
                    </th>
                    <th className=" px-0.5 w-full md:w-[30%] mx-auto text-center lg:px-1 py-2  border border-gray-950 text-sm font-semibold text-gray-900  tracking-wider">
                      Staff name
                    </th>

                    <th className=" px-0.5 text-center lg:px-1 py-2  border border-gray-950 text-sm font-semibold text-gray-900  tracking-wider">
                      Mobile
                    </th>
                    <th className="px-2 py-2 border border-gray-950 text-sm font-semibold text-center text-gray-900">
                      Email
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {activeStaffList.length > 0 ? (
                    activeStaffList.map((staff, index) => (
                      <tr
                        key={staff.teacher_id}
                        className={`${
                          index % 2 === 0 ? "bg-white" : "bg-gray-100"
                        } hover:bg-gray-50`}
                      >
                        <td className="text-center border border-gray-950 text-sm py-2">
                          {index + 1}
                        </td>

                        <td className="text-center border border-gray-950 text-sm py-2">
                          {camelCase(staff?.name || "")}
                        </td>

                        <td className="text-center border border-gray-950 text-sm py-2">
                          {staff?.phone || ""}
                        </td>

                        <td className="text-center border border-gray-950 text-sm py-2">
                          {staff?.email || ""}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="text-center text-xl py-5 text-red-700"
                      >
                        No staff birthday {activeSubTab}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {activeStaffList.length > 0 && (
                <div className="text-blue-500 mt-3 text-[1.1em] font-medium text-center">
                  Total Staff Birthday: {activeStaffCount}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default TodayBirthdayTeacherDashboard;
