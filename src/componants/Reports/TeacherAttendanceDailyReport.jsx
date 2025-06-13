import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
// import Loader from "../common/LoaderFinal/LoaderStyle";
import { FiPrinter } from "react-icons/fi";
import { FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";

const TeacherAttendanceDailyReport = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingForSearch, setLoadingForSearch] = useState(false);
  // const [selectedMonth, setSelectedMonth] = useState(null);
  const navigate = useNavigate();
  const [loadingExams, setLoadingExams] = useState(false);
  const [studentError, setStudentError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attendanceCount, setAttendanceCount] = useState("0/0");

  const [timetable, setTimetable] = useState([]);
  const [toDate, setToDate] = useState(null);

  const pageSize = 10;
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchExams();
    // handleSearch();
  }, []);

  const fetchExams = async () => {
    try {
      setLoadingExams(true);
      const token = localStorage.getItem("authToken");

      const response = await axios.get(`${API_URL}/api/classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Class", response);
      setStudentNameWithClassId(response?.data || []);
    } catch (error) {
      toast.error("Error fetching Classes");
      console.error("Error fetching Classes:", error);
    } finally {
      setLoadingExams(false);
    }
  };

  // Handle search and fetch parent information

  // const handleSearch = async () => {
  //   setLoadingForSearch(false);
  //   if (!toDate) {
  //     setStudentError("Please select Date.");
  //     setLoadingForSearch(false);
  //     return;
  //   }
  //   setSearchTerm("");
  //   try {
  //     setLoadingForSearch(true); // Start loading
  //     setTimetable([]);
  //     const token = localStorage.getItem("authToken");
  //     const params = {};
  //     if (toDate) params.date = toDate;
  //     // if (selectedStudentId) params.month = selectedStudentId;

  //     const response = await axios.get(
  //       `${API_URL}/api/get_staffdailyattendancereport`,
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //         params,
  //       }
  //     );

  //     if (
  //       !response?.data?.data ||
  //       (!response.data.data.absent_staff?.length &&
  //         !response.data.data.late_staff?.length &&
  //         !response.data.data.present_staff?.length)
  //     ) {
  //       toast.error("Teacher Attendance Daily Report data not found.");
  //       setTimetable([]);
  //     } else {
  //       const {
  //         absent_staff = [],
  //         late_staff = [],
  //         present_staff = [],
  //       } = response.data.data;

  //       const mergedData = [...absent_staff, ...late_staff, ...present_staff];

  //       setTimetable(mergedData);
  //       setPageCount(Math.ceil(mergedData.length / pageSize));
  //     }
  //   } catch (error) {
  //     console.error("Error fetching Teacher  Attendance Daily Report:", error);
  //     toast.error(
  //       "Error fetching Teacher Attendance Daily Report. Please try again."
  //     );
  //   } finally {
  //     setIsSubmitting(false); // Re-enable the button after the operation
  //     setLoadingForSearch(false);
  //   }
  // };

  const handleSearch = async () => {
    setLoadingForSearch(false);

    if (!toDate) {
      setStudentError("Please select Date.");
      setLoadingForSearch(false);
      return;
    }

    setSearchTerm("");

    try {
      setLoadingForSearch(true); // Start loading
      setTimetable([]);
      const token = localStorage.getItem("authToken");
      const params = {};
      if (toDate) params.date = toDate;

      const response = await axios.get(
        `${API_URL}/api/get_staffdailyattendancereport`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      const data = response?.data?.data;

      if (
        !data ||
        (!data.present_staff?.length &&
          !data.absent_staff?.length &&
          !data.late_staff?.length)
      ) {
        toast.error("Teacher Attendance Daily Report data not found.");
        setTimetable([]);
        setAttendanceCount("0/0"); // Reset total attendance if no data
      } else {
        // Destructure all from data
        const {
          present_staff = [],
          late_staff = [],
          absent_staff = [],
          total_attendance = "0/0", // default in case missing
        } = data;

        const presentWithStatus = present_staff.map((s) => ({
          ...s,
          status: "Present",
        }));
        const lateWithStatus = late_staff.map((s) => ({
          ...s,
          status: "Late",
        }));
        const absentWithStatus = absent_staff.map((s) => ({
          ...s,
          status: "Absent",
        }));

        const mergedData = [
          ...presentWithStatus,
          ...lateWithStatus,
          ...absentWithStatus,
        ];

        setTimetable(mergedData);
        setAttendanceCount(total_attendance); //  set string like "24/119"
        setPageCount(Math.ceil(mergedData.length / pageSize));
      }
      console.log("total attendance", setAttendanceCount);
    } catch (error) {
      console.error("Error fetching Teacher Attendance Daily Report:", error);
      toast.error(
        "Error fetching Teacher Attendance Daily Report. Please try again."
      );
    } finally {
      setIsSubmitting(false);
      setLoadingForSearch(false);
    }
  };

  // const handlePrint = () => {
  //   const printTitle = `Teacher Attendance Daily Report ${
  //     toDate ? `List of  ${toDate}` : ": For All Satff "
  //   }`;
  //   const printContent = `
  //   <div id="tableMain" class="flex items-center justify-center min-h-screen bg-white">
  //        <h5 id="tableHeading5"  class="text-lg font-semibold border-1 border-black">${printTitle}</h5>
  //   <div id="tableHeading" class="text-center w-3/4">
  //     <table class="min-w-full leading-normal table-auto border border-black mx-auto mt-2">
  //       <thead>
  //         <tr class="bg-gray-100">
  //           <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Sr.No</th>
  //           <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Name</th>
  //           <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Employee Id</th>
  //           <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Punch Date</th>
  //           <th class="px-2 text-center py-2 border border-black text-sm font-semibold">In Time</th>
  //           <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Out Time</th>
  //         </tr>
  //       </thead>
  //       <tbody>
  //         ${displayedPresent
  //           .map(
  //             (student, index) => `
  //       <tr class="text-sm">
  //         <td class="px-2 text-center py-2 border border-black">
  //           ${index + 1}
  //         </td>
  //         <td class="px-2 text-center py-2 border border-black">
  //           ${student?.name || " "}
  //         </td>
  //          <td class="px-2 text-center py-2 border border-black">
  //           ${student?.employee_id || " "}
  //         </td>
  //         <td class="px-2 text-center py-2 border border-black">
  //           ${student?.date_part || " "}
  //         </td>
  //         <td class="px-2 text-center py-2 border border-black">
  //           ${student?.punch_in_time || " "}
  //         </td>
  //         <td class="px-2 text-center py-2 border border-black">
  //         ${student?.punch_out_time || " "}
  //         </td>
  //       </tr>`
  //           )
  //           .join("")}
  //       </tbody>
  //     </table>
  //   </div>
  // </div>`;

  //   const printWindow = window.open("", "_blank", "width=1000,height=800");

  //   printWindow.document.write(`
  //   <html>
  //     <head>
  //       <title>${printTitle}</title>
  //       <style>
  //               @page { margin: 0; }
  //       body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }

  //       /* Increase width */
  //       #tableMain {
  //         width: 100%;
  //         display: flex;
  //         flex-direction: column;
  //         align-items: center;
  //       }

  //       h5 {
  //         width: 100%;
  //         text-align: center;
  //         font-size: 1.5em;
  //         font-weight: bold;
  //         margin-bottom: 10px;
  //       }

  //       #tableContainer {
  //         width: 100%;
  //         display: flex;
  //         justify-content: center;
  //       }

  //       table {
  //         width: 80%; /* Increase table width */
  //         border-spacing: 0;
  //          margin: auto;
  //       }

  //       th, td {
  //         border: 1px solid gray;
  //         padding: 12px;
  //         text-align: center;
  //         font-size: 16px; /* Increase font size */
  //       }

  //       th {
  //         background-color: #f9f9f9;
  //         font-size: 1.1em;
  //       }
  //       </style>
  //     </head>
  //        <body>
  //       <div id="printContainer">
  //           ${printContent}
  //       </div>
  //   </body>
  //   </html>
  // `);

  //   printWindow.document.close();

  //   // Ensure content is fully loaded before printing
  //   printWindow.onload = function () {
  //     printWindow.focus();
  //     printWindow.print();
  //     printWindow.close(); // Optional: close after printing
  //   };
  // };

  const handlePrint = () => {
    const printTitle = `Teacher Attendance Daily Report ${
      toDate ? `for ${toDate}` : "for All Staff"
    }`;

    const generateTable = (title, data, type) => {
      const showPunchData = type !== "Absent";

      return `
        <div style="margin-bottom: 30px;">
          <h5 style="text-align:center; font-size:18px; font-weight:bold; margin-bottom: 10px;">${title}</h5>
          <table class="min-w-full leading-normal table-auto border border-black mx-auto mt-2">
            <thead>
              <tr class="bg-gray-100">
                <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Sr.No</th>
                <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Name</th>
                <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Employee ID</th>
                ${
                  showPunchData
                    ? `
                <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Punch Date</th>
                <th class="px-2 text-center py-2 border border-black text-sm font-semibold">In Time</th>
                <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Out Time</th>
                `
                    : ""
                }
              </tr>
            </thead>
            <tbody>
              ${data
                .map(
                  (student, index) => `
                <tr class="text-sm">
                  <td class="px-2 text-center py-2 border border-black">${
                    index + 1
                  }</td>
                  <td class="px-2 text-center py-2 border border-black">${
                    student?.name || ""
                  }</td>
                  <td class="px-2 text-center py-2 border border-black">${
                    student?.employee_id || ""
                  }</td>
                  ${
                    showPunchData
                      ? `
                  <td class="px-2 text-center py-2 border border-black">
                  ${
                    student?.date_part
                      ? new Date(student?.date_part).toLocaleDateString("en-GB")
                      : ""
                  }
                  </td>
                  <td class="px-2 text-center py-2 border border-black">${
                    student?.punch_in_time || ""
                  }</td>
                  <td class="px-2 text-center py-2 border border-black">${
                    student?.punch_out_time || ""
                  }</td>
                  `
                      : ""
                  }
                </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </div>
      `;
    };

    const printContent = `
      <div id="tableMain" class="flex flex-col items-center justify-center bg-white">
        <h2 style="text-align:center; font-size:22px; font-weight:bold;">${printTitle}</h2>
        ${generateTable("Present Staff", displayedPresent, "Present")}
        ${generateTable("Late Staff", displayedLate, "Late")}
        ${generateTable("Absent Staff", displayedAbsent, "Absent")}
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
              margin: 20px;
              font-family: Arial, sans-serif;
            }
            h2 {
              text-align: center;
              font-size: 24px;
              margin-bottom: 20px;
            }
            table {
              width: 90%;
              margin: auto;
              
              font-size: 14px;
            }
            th, td {
              border: 1px solid #000;
              padding: 8px;
              text-align: center;
            }
            th {
              background-color: #f1f1f1;
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);

    printWindow.document.close();

    printWindow.onload = function () {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  const handleDownloadEXL = () => {
    if (!displayedPresent || displayedPresent.length === 0) {
      toast.error("No data available to download the Excel sheet.");
      return;
    }

    // Define headers matching the print table
    const headers = [
      "Sr No.",
      "Name",
      "Employee Id",
      "Punch Date",
      "In Time",
      "Out Time",
    ];

    // Convert displayedPresent data to array format for Excel
    const data = displayedPresent.map((student, index) => [
      index + 1,
      student?.period || " ",
      student?.date || " ",
      student?.teachername || " ",
      `${student?.classname || " "} ${student?.sectionname || " "} (${
        student?.name || " "
      })`,
      student?.substitutename || " ",
    ]);

    // Create a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const columnWidths = headers.map(() => ({ wch: 20 })); // Approx. width of 20 characters per column
    worksheet["!cols"] = columnWidths;

    // Create a workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Teacher Monthly Attendance Details Report"
    );

    // Generate and download the Excel file

    const fileName = `Teacher_Attendance_Monthly_Detailed_Report ${
      selectedStudent?.label
        ? `List of Month ${selectedStudent.label}`
        : ": For All Teacher "
    }.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  console.log("row", timetable);

  // const filteredSections = timetable.filter((student) => {
  //   const searchLower = searchTerm.toLowerCase();

  //   // Convert period to string before calling `.toLowerCase()`
  //   const period = student?.period?.toString().toLowerCase() || "";
  //   const date = student?.date?.toLowerCase() || "";
  //   const teacherName = student?.teachername?.toLowerCase() || "";
  //   const classInfo = `${student?.classname || ""} ${
  //     student?.sectionname || ""
  //   } (${student?.name || ""})`.toLowerCase();
  //   const substituteName = student?.substitutename?.toLowerCase() || "";

  //   return (
  //     period.includes(searchLower) ||
  //     date.includes(searchLower) ||
  //     teacherName.includes(searchLower) ||
  //     classInfo.includes(searchLower) ||
  //     substituteName.includes(searchLower)
  //   );
  // });

  const filterStaffByStatus = (status) =>
    Array.isArray(timetable)
      ? timetable.filter((staff) => {
          if (staff.status !== status) return false;

          const searchLower = searchTerm.toString().trim().toLowerCase();
          const staffName = staff?.name?.toString().toLowerCase() || "";
          const date = staff?.date_part?.toString().toLowerCase() || "";
          const inTime = staff?.punch_in_time?.toString().toLowerCase() || "";
          const outTime = staff?.punch_out_time?.toString().toLowerCase() || "";
          const lateTime = staff?.lateTime?.toString().toLowerCase() || "";
          const employeeId = staff?.employee_id?.toString().toLowerCase() || "";

          return (
            staffName.includes(searchLower) ||
            date.includes(searchLower) ||
            inTime.includes(searchLower) ||
            outTime.includes(searchLower) ||
            lateTime.includes(searchLower) ||
            employeeId.includes(searchLower)
          );
        })
      : [];

  const filteredAbsent = filterStaffByStatus("Absent");
  const filteredLate = filterStaffByStatus("Late");
  const filteredPresent = filterStaffByStatus("Present");

  const displayedPresent = filteredPresent.slice(currentPage * pageSize);
  const displayedAbsent = filteredAbsent.slice(currentPage * pageSize);
  const displayedLate = filteredLate.slice(currentPage * pageSize);

  return (
    <>
      <div className="w-full md:w-[80%] mx-auto p-4 ">
        <ToastContainer />
        <div className="card p-4 rounded-md ">
          <div className=" card-header mb-4 flex justify-between items-center ">
            <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
              Satff Attendance Daily Report
            </h5>
            <RxCross1
              className=" relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
              onClick={() => {
                navigate("/dashboard");
              }}
            />
          </div>
          <div
            className=" relative w-full   -top-6 h-1  mx-auto bg-red-700"
            style={{
              backgroundColor: "#C03078",
            }}
          ></div>

          <>
            <div className=" w-full md:w-[80%]  flex justify-center flex-col md:flex-row gap-x-1     ml-0    p-2">
              <div className="w-full md:w-[99%] flex md:flex-row justify-between items-center mt-0 md:mt-4">
                <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-y-3 md:gap-y-0 mb-4">
                  {/* Date Picker */}
                  <div className="flex items-center w-full md:w-1/3">
                    <label
                      htmlFor="dateSelect"
                      className="w-1/3 text-md pl-0 md:pl-5"
                    >
                      Date<span className="text-sm text-red-500">*</span>
                    </label>
                    <div className="w-2/3">
                      <input
                        type="date"
                        id="toDate"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loadingExams}
                      />
                    </div>
                  </div>

                  {/* Search Button */}
                  <div className="flex justify-center md:justify-start w-full md:w-1/4 mt-2 md:mt-0">
                    <button
                      type="search"
                      onClick={handleSearch}
                      style={{ backgroundColor: "#2196F3" }}
                      className={`btn h-10 w-full md:w-auto btn-primary text-white font-bold py-1 border-1 border-blue-500 px-4 rounded ${
                        loadingForSearch ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      disabled={loadingForSearch}
                    >
                      {loadingForSearch ? (
                        <span className="flex items-center justify-center">
                          <svg
                            className="animate-spin h-4 w-4 mr-2 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            ></path>
                          </svg>
                          Searching...
                        </span>
                      ) : (
                        "Search"
                      )}
                    </button>
                  </div>

                  {/* Staff Attendance */}
                  <div className="w-full md:w-[35%] text-md font-medium text-gray-800 text-center md:text-right mt-2 md:mt-0 pr-2">
                    Staff Attendance &nbsp; | &nbsp;
                    <span className="font-semibold">
                      Total Attendance: {attendanceCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {timetable.length > 0 && (
              <>
                <div className="w-full  mt-4">
                  <div className="card mx-auto lg:w-full shadow-lg">
                    <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                      <div className="w-full   flex flex-row justify-between mr-0 md:mr-4 ">
                        <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
                          List Of Teacher Attendance Daily Report
                        </h3>
                        <div className="w-1/2 md:w-[18%] mr-1 ">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Search "
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col md:flex-row gap-x-1 justify-center md:justify-end">
                        {/* <button
                          type="button"
                          onClick={handleDownloadEXL}
                          className="relative bg-blue-400 py-1 hover:bg-blue-500 text-white px-3 rounded group"
                        >
                          <FaFileExcel />

                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex items-center justify-center bg-gray-600  text-white text-[.7em] rounded-md py-1 px-2">
                            Exports to excel
                          </div>
                        </button> */}

                        <button
                          onClick={handlePrint}
                          className="relative flex flex-row justify-center align-middle items-center  bg-blue-400 hover:bg-blue-500 text-white px-3 py-1 rounded group"
                        >
                          <FiPrinter />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex items-center justify-center bg-gray-600  text-white text-[.7em] rounded-md py-2 px-2">
                            Print{" "}
                          </div>
                        </button>
                      </div>
                    </div>
                    <div
                      className=" relative w-[97%]   mb-3 h-1  mx-auto bg-red-700"
                      style={{
                        backgroundColor: "#C03078",
                      }}
                    ></div>

                    <div className="card-body w-full md:w-[90%] mx-auto">
                      <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">
                        Present Staff
                      </h2>
                      <div
                        className="h-96 lg:h-96  overflow-y-scroll overflow-x-scroll"
                        style={{
                          scrollbarWidth: "thin", // Makes scrollbar thin in Firefox
                          scrollbarColor: "#C03178 transparent", // Sets track and thumb color in Firefox
                        }}
                      >
                        <table className="min-w-full leading-normal table-auto">
                          <thead>
                            <tr className="bg-gray-100">
                              {[
                                "Sr No.",
                                "Name",
                                "Employee Id",
                                "Punch Date",
                                "In Time",
                                "Out Time",
                              ].map((header, index) => (
                                <th
                                  key={index}
                                  className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider"
                                >
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {displayedPresent.length ? (
                              displayedPresent?.map((student, index) => (
                                <tr
                                  key={student.adm_form_pk}
                                  className="border border-gray-300"
                                >
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {index + 1}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.name || " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.employee_id}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.date_part
                                      ? new Date(
                                          student.date_part
                                        ).toLocaleDateString("en-GB")
                                      : " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.punch_in_time || " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.punch_out_time || " "}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <div className=" absolute left-[1%] w-[100%]  text-center flex justify-center items-center mt-14">
                                <div className=" text-center text-xl text-red-700">
                                  Oops! No data found for Prsent Staff..
                                </div>
                              </div>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="card-body w-full md:w-[90%] mx-auto">
                      <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">
                        Late Staff
                      </h2>
                      <div
                        className="h-96 lg:h-96  overflow-y-scroll overflow-x-scroll"
                        style={{
                          scrollbarWidth: "thin", // Makes scrollbar thin in Firefox
                          scrollbarColor: "#C03178 transparent", // Sets track and thumb color in Firefox
                        }}
                      >
                        <table className="min-w-full leading-normal table-auto">
                          <thead>
                            <tr className="bg-gray-100">
                              {[
                                "Sr No.",
                                "Name",
                                "Employee Id",
                                "Punch Date",
                                "In Time",
                                "Out Time",
                                "Late Time",
                              ].map((header, index) => (
                                <th
                                  key={index}
                                  className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider"
                                >
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {displayedLate.length ? (
                              displayedLate?.map((student, index) => (
                                <tr
                                  key={student.adm_form_pk}
                                  className="border border-gray-300"
                                >
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {index + 1}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.name || " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.employee_id}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student?.date_part
                                      ? new Date(
                                          student?.date_part
                                        ).toLocaleDateString("en-GB")
                                      : ""}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.punch_in_time || " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.punch_out_time || " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.late_time || " "}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <div className=" absolute left-[1%] w-[100%]  text-center flex justify-center items-center mt-14">
                                <div className=" text-center text-xl text-red-700">
                                  Oops! No data found for Late Staff..
                                </div>
                              </div>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="card-body w-full md:w-[90%] mx-auto">
                      <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">
                        Absent Staff
                      </h2>
                      <div
                        className="h-96 lg:h-96  overflow-y-scroll overflow-x-scroll"
                        style={{
                          scrollbarWidth: "thin", // Makes scrollbar thin in Firefox
                          scrollbarColor: "#C03178 transparent", // Sets track and thumb color in Firefox
                        }}
                      >
                        <table className="min-w-full leading-normal table-auto">
                          <thead>
                            <tr className="bg-gray-100">
                              {["Sr No.", "Name", "Employee Id"].map(
                                (header, index) => (
                                  <th
                                    key={index}
                                    className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider"
                                  >
                                    {header}
                                  </th>
                                )
                              )}
                            </tr>
                          </thead>

                          <tbody>
                            {displayedAbsent.length ? (
                              displayedAbsent?.map((student, index) => (
                                <tr
                                  key={student.adm_form_pk}
                                  className="border border-gray-300"
                                >
                                  <td className="px-2 py-2 text-center border border-gray-300 text-red-500">
                                    {index + 1}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300 text-red-500">
                                    {student.name || " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300 text-red-500">
                                    {student.employee_id || " "}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <div className=" absolute left-[1%] w-[100%]  text-center flex justify-center items-center mt-14">
                                <div className=" text-center text-xl text-red-700">
                                  Oops! No data found for Absent Staff..
                                </div>
                              </div>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        </div>
      </div>
    </>
  );
};

export default TeacherAttendanceDailyReport;
