import axios from "axios";
import { RxCross1 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FiPrinter } from "react-icons/fi";
import { FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function StaffBirthdayTabList() {
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

  //     const response = await axios.get(`${API_URL}/api/staffbirthdaylist`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     console.log("Birthday list response:", response.data);

  //     const { staffBirthday, studentBirthday, studentcount, teachercount } =
  //       response.data;
  //     setStaffBirthday(Array.isArray(staffBirthday) ? staffBirthday : []);
  //     setStudentBirthday(Array.isArray(studentBirthday) ? studentBirthday : []);
  //     setStudentCount(studentcount || 0);
  //     setTeacherCount(teachercount || 0);
  //   } catch (error) {
  //     setError(error.message || "Something went wrong");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchBirthdayList = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(`${API_URL}/api/staffbirthdaylist`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Full Birthday API Response:", response.data);

      const { students, staff } = response.data.data;

      // 🔹 Console for verification
      console.log("Students Yesterday:", students.yesterday);
      console.log("Students Today:", students.today);
      console.log("Students Tomorrow:", students.tomorrow);

      console.log("Staff Yesterday:", staff.yesterday);
      console.log("Staff Today:", staff.today);
      console.log("Staff Tomorrow:", staff.tomorrow);

      // 🔹 Store full structured data (recommended)
      setStudentBirthday(students);
      setStaffBirthday(staff);

      // 🔹 Optional counts (example: today's count)
      setStudentCount(students.today.count || 0);
      setTeacherCount(staff.today.count || 0);
    } catch (error) {
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

  const activeStudentCount = studentBirthday?.[activeKey]?.count || 0;

  const activeStaffCount = staffBirthday?.[activeKey]?.count || 0;

  const handleTabChange = (tab) => {
    setActiveTab(tab); // Update the active tab state
  };

  const camelCase = (str) =>
    str
      ?.toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const handlePrintBirthday = () => {
    const dayKeyMap = {
      previous: "yesterday",
      today: "today",
      tomorrow: "tomorrow",
    };

    const isStudent = activeTab === "Students Birthday";
    const dayKey = dayKeyMap[activeSubTab];

    const dayData = isStudent
      ? studentBirthday?.[dayKey]
      : staffBirthday?.[dayKey];

    const list = dayData?.list || [];
    const count = dayData?.count || 0;

    const dayLabel =
      activeSubTab === "previous"
        ? "Previous Day"
        : activeSubTab === "today"
          ? "Today"
          : "Tomorrow";

    const printTitle = `${isStudent ? "Students" : "Staff"
      } Birthday : ${dayLabel}_Birthday(${count})`;

    const printContent = `
  <div id="tableMain">
    <h5>${printTitle}</h5>

    <div id="tableHeading">
      <table>
        <thead>
          <tr>
            <th>Sr.No</th>
            <th>${isStudent ? "Student Name" : "Staff Name"}</th>
            ${isStudent
        ? `
                  <th>Class</th>
                  <th>Mobile</th>
                  <th>Email</th>
                `
        : `
                  <th>Mobile</th>
                  <th>Email</th>
                `
      }
          </tr>
        </thead>

        <tbody>
          ${list.length > 0
        ? list
          .map(
            (item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${isStudent
                ? camelCase(
                  `${item.first_name || ""} ${item.mid_name || ""} ${item.last_name || ""
                  }`
                )
                : item.name || ""
              }</td>

              ${isStudent
                ? `
                    <td>${item?.classname || ""} ${item?.sectionname || ""}</td>
                    <td>${item.guardian_mobile || item.emergency_contact || ""
                }</td>
                    <td>${item?.email_id || item?.m_emailid || ""}</td>
                  `
                : `
                    <td>${item?.phone || ""}</td>
                    <td>${item?.email || ""}</td>
                  `
              }
            </tr>`
          )
          .join("")
        : `<tr><td colspan="${isStudent ? 5 : 4
        }">No birthdays today</td></tr>`
      }
        </tbody>
      </table>
    </div>
  </div>
  `;

    const printWindow = window.open("", "_blank", "width=1000,height=800");

    printWindow.document.write(`
    <html>
      <head>
        <title>${printTitle}</title>
        <style>
          @page { margin: 0; }
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
          }

          #tableMain {
            width: 100%;
            padding: 0 8em;
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          h5 {
            text-align: center;
            margin: 10px 0;
          }

          table { border-spacing: 0; width: 100%; margin: auto;   }
          th { font-size: 0.8em; background-color: #f9f9f9; }
          td { font-size: 12px; }
          th, td { border: 1px solid gray; padding: 8px; text-align: center; }
         

          th {
            background: #f2f2f2;
            font-size: 0.85em;
          }

          td {
            font-size: 12px;
          }

          th, td {
            border: 1px solid #444;
            padding: 6px;
            text-align: center;
          }
        </style>
      </head>

      <body>
        ${printContent}
      </body>
    </html>
  `);

    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  const handleDownloadBirthdayEXL = () => {
    const dayKeyMap = {
      previous: "yesterday",
      today: "today",
      tomorrow: "tomorrow",
    };

    const dayLabelMap = {
      previous: "Previous",
      today: "Today",
      tomorrow: "Tomorrow",
    };

    const isStudent = activeTab === "Students Birthday";
    const dayKey = dayKeyMap[activeSubTab];

    const dayData = isStudent
      ? studentBirthday?.[dayKey]
      : staffBirthday?.[dayKey];

    const list = dayData?.list || [];

    if (!list.length) {
      toast.error("No birthday data available to download.");
      return;
    }

    // 🔹 HEADERS
    const headers = isStudent
      ? ["Sr No", "Student Name", "Class", "Mobile", "Email"]
      : ["Sr No", "Staff Name", "Mobile", "Email"];

    // 🔹 DATA ROWS
    const data = list.map((item, index) =>
      isStudent
        ? [
          index + 1,
          `${camelCase(item.first_name || "")} ${camelCase(
            item.mid_name || ""
          )} ${camelCase(item.last_name || "")}`.trim(),
          `${item?.classname || ""} ${item?.sectionname || ""}`,
          item.guardian_mobile || item.emergency_contact || "",
          item?.email_id || item?.m_emailid || "",
        ]
        : [index + 1, item?.name || "", item?.phone || "", item?.email || ""]
    );

    // 🔹 CREATE WORKSHEET
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // 🔹 AUTO COLUMN WIDTH
    worksheet["!cols"] = headers.map(() => ({ wch: 25 }));

    // 🔹 CREATE WORKBOOK
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      `${dayLabelMap[activeSubTab]} Birthday`
    );

    // 🔹 FILE NAME
    const fileName = `${isStudent ? "Students" : "Staff"}_${dayLabelMap[activeSubTab]
      }_Birthday_List.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

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

        {/* Tab Navigation */}
        {/* <ul className="grid grid-cols-2 gap-x-10 relative -left-6 md:left-0 md:flex md:flex-row  -top-4">   
          {["Students Birthday", "Staff Birthday"].map((tab) => (
            <li
              key={tab}
              className={`md:-ml-7 shadow-md ${
                activeTab === tab ? "text-blue-500 font-bold" : ""
              }`}
            >
              <button
                onClick={() => handleTabChange(tab)}
                className="px-2 md:px-4 py-1 hover:bg-gray-200 text-[1em] md:text-sm text-nowrap"
              >
                {tab.replace(/([A-Z])/g, " $1")}
              </button>
            </li>
          ))}
        </ul> */}

        {/* correct work for dektop single row */}
        <div className="flex items-center justify-between w-full gap-6">
          <ul className="flex items-center gap-10">
            {["Students Birthday", "Staff Birthday"].map((tab) => (
              <li
                key={tab}
                className={`mt-0 md:-ml-7 shadow-md ${activeTab === tab ? "text-blue-500 font-bold" : ""
                  }`}
              >
                <button
                  onClick={() => {
                    setActiveTab(tab);
                    setActiveSubTab("today");
                  }}
                  className="px-2 md:px-4 py-1 hover:bg-gray-200 text-[1em] md:text-sm text-nowrap"
                >
                  {tab}
                </button>
              </li>
            ))}
          </ul>

          {/* <div className="flex items-center gap-3">
            {[
              { label: "Previous", value: "previous" },
              { label: "Today ", value: "today" },
              { label: "Tomorrow ", value: "tomorrow" },
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
          </div> */}
          <div className="flex items-center gap-2 ">
            {/* Sub Tabs */}
            <div className="flex items-center gap-3">
              {[
                { label: "Yesterday", value: "previous" },
                { label: "Today", value: "today" },
                { label: "Tomorrow", value: "tomorrow" },
              ].map((sub) => (
                <button
                  key={sub.value}
                  onClick={() => setActiveSubTab(sub.value)}
                  className={`px-3 py-1 text-sm rounded-full whitespace-nowrap transition
          ${activeSubTab === sub.value
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                    }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {/* Print Icon */}
            <button
              onClick={handlePrintBirthday}
              title="Print Today's Birthday"
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
            >
              <FiPrinter />
            </button>

            <button
              onClick={handleDownloadBirthdayEXL}
              title="Print Today's Birthday"
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
            >
              <FaFileExcel />
            </button>
          </div>
        </div>

        {/* correct work for both  */}
        {/* <div className="w-full flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          
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
                { label: "Previous", value: "previous" },
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

            
            <button
              onClick={handlePrintBirthday}
              title="Print Birthday List"
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded flex items-center"
            >
              <FiPrinter />
            </button>

          
            <button
              onClick={handleDownloadBirthdayEXL}
              title="Download Excel"
              className="bg-green-600 hover:bg-green-700 text-white p-2 rounded flex items-center"
            >
              <FaFileExcel />
            </button>
          </div>
        </div> */}

        {/* <ul className="grid grid-cols-2 gap-x-10 relative -left-6 md:left-0 md:flex md:flex-row -top-4">
          {["Students Birthday", "Staff Birthday"].map((tab) => (
            <li
              key={tab}
              className={`md:-ml-7 shadow-md ${
                activeTab === tab ? "text-blue-500 font-bold" : ""
              }`}
            >
              <button
                onClick={() => {
                  setActiveTab(tab);
                  setActiveSubTab("today");
                }}
                className="px-2 md:px-4 py-1 hover:bg-gray-200 text-[1em] md:text-sm text-nowrap"
              >
                {tab}
              </button>
            </li>
          ))}
        </ul>
        <div className=" flex gap-4 justify-center">
          {[
            { label: "Previous Birthday", value: "previous" },
            { label: "Today Birthday", value: "today" },
            { label: "Tomorrow Birthday", value: "tomorrow" },
          ].map((sub) => (
            <button
              key={sub.value}
              onClick={() => setActiveSubTab(sub.value)}
              className={`px-4 py-1 shadow-sm text-sm font-medium transition ${
                activeSubTab === sub.value
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div> */}

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
                        className={`${index % 2 === 0 ? "bg-white" : "bg-gray-100"
                          } hover:bg-gray-50`}
                      >
                        <td className="text-center border border-gray-950 text-sm py-2">
                          {index + 1}
                        </td>

                        <td className="text-center border border-gray-950 text-sm py-2">
                          {camelCase(
                            `${student.first_name || ""} ${student.mid_name || ""
                            } ${student.last_name || ""}`
                          )}
                        </td>

                        <td className="text-center border border-gray-950 text-sm py-2">
                          {student?.classname || ""}{" "}
                          {student?.sectionname || ""}
                        </td>

                        <td className="text-center border border-gray-950 text-sm py-2">
                          {student.guardian_mobile ||
                            student.emergency_contact ||
                            ""}
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
                        className={`${index % 2 === 0 ? "bg-white" : "bg-gray-100"
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

export default StaffBirthdayTabList;
