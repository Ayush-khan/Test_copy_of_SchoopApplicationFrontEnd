import { useState, useEffect, useRef } from "react";
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

  const academicYrFrom = localStorage.getItem("academic_yr_from");
  const academicYrTo = localStorage.getItem("academic_yr_to");

  console.log("from year", academicYrFrom);
  console.log("to yaer", academicYrTo);

  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
  const [loadingForSearch, setLoadingForSearch] = useState(false);
  // const [selectedMonth, setSelectedMonth] = useState(null);
  const navigate = useNavigate();
  const [loadingExams, setLoadingExams] = useState(false);
  const [studentError, setStudentError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attendanceCount, setAttendanceCount] = useState("0/0");
  const [timetable, setTimetable] = useState([]);
  const [toDate, setToDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // returns 'YYYY-MM-DD'
  });
  // const [toDate, setToDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const presentRef = useRef(null);
  const lateRef = useRef(null);
  const absentRef = useRef(null);
  const rowRefs = useRef({});
  const outerScrollContainerRef = useRef(null);

  useEffect(() => {
    fetchExams();
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
        // setPageCount(Math.ceil(mergedData.length / pageSize));
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

  const capitalizeWords = (str) =>
    str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

  const handlePrint = () => {
    const printTitle = `Staff Daily Attendance Report ${
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
                  <td class="px-2 text-center py-2 border border-black">
                  ${capitalizeWords(student?.name || "")}</td>
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
    if (
      (!displayedPresent || displayedPresent.length === 0) &&
      (!displayedLate || displayedLate.length === 0) &&
      (!displayedAbsent || displayedAbsent.length === 0)
    ) {
      toast.error("No data available to download the Excel sheet.");
      return;
    }

    const capitalizeWords = (str) =>
      str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

    const workbook = XLSX.utils.book_new();

    const sections = [
      { title: "Present Staff", data: displayedPresent, type: "Present" },
      { title: "Late Staff", data: displayedLate, type: "Late" },
      { title: "Absent Staff", data: displayedAbsent, type: "Absent" },
    ];

    sections.forEach(({ title, data, type }) => {
      if (!data || data.length === 0) return;

      const showPunchData = type !== "Absent";

      // Headers
      const headers = ["Sr.No", "Name", "Employee ID"];
      if (showPunchData) {
        headers.push("Punch Date", "In Time", "Out Time");
      }

      // Rows
      const rows = data.map((student, index) => {
        const row = [
          index + 1,
          capitalizeWords(student?.name || ""),
          student?.employee_id || "",
        ];
        if (showPunchData) {
          row.push(
            student?.date_part
              ? new Date(student.date_part).toLocaleDateString("en-GB")
              : "",
            student?.punch_in_time || "",
            student?.punch_out_time || ""
          );
        }
        return row;
      });

      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      worksheet["!cols"] = headers.map(() => ({ wch: 20 }));
      XLSX.utils.book_append_sheet(workbook, worksheet, title);
    });

    const fileName = `Staff_Daily_Attendance_Report_${toDate}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  const filteredStaff = Array.isArray(timetable)
    ? timetable.filter((staff) => {
        const searchLower = searchTerm.toString().trim().toLowerCase();

        const staffName = staff?.name?.toString().toLowerCase() || "";
        const date = staff?.date_part?.toString().toLowerCase() || "";
        const inTime = staff?.punch_in_time?.toString().toLowerCase() || "";
        const outTime = staff?.punch_out_time?.toString().toLowerCase() || "";
        const lateTime = staff?.late_time?.toString().toLowerCase() || "";
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
  const filteredPresent = filteredStaff.filter((s) => s.status === "Present");
  const filteredLate = filteredStaff.filter((s) => s.status === "Late");
  const filteredAbsent = filteredStaff.filter((s) => s.status === "Absent");
  const displayedPresent = filteredPresent;
  const displayedLate = filteredLate;
  const displayedAbsent = filteredAbsent;
  useEffect(() => {
    if (!searchTerm.trim()) return;

    const searchLower = searchTerm.toLowerCase().trim();

    const allMatched = [...filteredPresent, ...filteredLate, ...filteredAbsent];
    const firstMatched = allMatched[0];

    if (!firstMatched || !outerScrollContainerRef.current) return;

    const container = outerScrollContainerRef.current;

    let targetRef = null;

    switch (firstMatched.status) {
      case "Present":
        targetRef = presentRef;
        break;
      case "Late":
        targetRef = lateRef;
        break;
      case "Absent":
        targetRef = absentRef;
        break;
      default:
        break;
    }

    if (targetRef?.current) {
      const offsetTop = targetRef.current.offsetTop - container.offsetTop;

      container.scrollTo({
        top: offsetTop - 20, // adjust if needed
        behavior: "smooth",
      });
    }
  }, [searchTerm, filteredPresent, filteredLate, filteredAbsent]);

  return (
    <>
      {/* <div className="w-full md:w-[80%] mx-auto p-4 "> */}
      <div
        className={`mx-auto p-4 transition-all duration-700 ease-[cubic-bezier(0.4, 0, 0.2, 1)] transform ${
          timetable.length > 0
            ? "w-full md:w-[90%] scale-100"
            : "w-full md:w-[80%] scale-[0.98]"
        }`}
      >
        <ToastContainer />
        <div className="card rounded-md ">
          <div className=" card-header mb-4 flex justify-between items-center ">
            <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
              Staff Daily Attendance Report
            </h5>
            <RxCross1
              className=" relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
              onClick={() => {
                navigate("/dashboard");
              }}
            />
          </div>
          <div
            className=" relative w-[98%]  -top-6 h-1  mx-auto bg-red-700"
            style={{
              backgroundColor: "#C03078",
            }}
          ></div>

          <>
            {/* <div className=" w-full md:w-[80%]  flex justify-center flex-col md:flex-row gap-x-1 ml-0 p-2"> */}
            <div
              className={`  flex justify-between flex-col md:flex-row gap-x-1 ml-0 p-2  ${
                timetable.length > 0
                  ? "pb-0 w-full md:w-[99%]"
                  : "pb-4 w-full md:w-[80%]"
              }`}
            >
              <div className="w-full md:w-[99%] flex md:flex-row justify-between items-center mt-0 md:mt-4">
                {/* <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-y-3 md:gap-y-0 mb-4"> */}
                <div
                  className={`  w-full gap-x-0 md:gap-x-12  flex flex-col gap-y-2 md:gap-y-0 md:flex-row ${
                    timetable.length > 0
                      ? "w-full md:w-[90%]  wrelative left-0"
                      : " w-full md:w-[95%] relative left-10"
                  }`}
                >
                  {/* Date Picker */}
                  <div className="flex mt-2 md:ml-4 items-center w-[50%]">
                    <label
                      htmlFor="dateSelect"
                      className="w-1/3 text-md pl-0 md:pl-5"
                    >
                      Date <span className="text-sm text-red-500">*</span>
                    </label>
                    <div className="w-2/3">
                      <input
                        type="date"
                        id="toDate"
                        value={toDate}
                        onChange={(e) => {
                          setToDate(e.target.value);
                          setStudentError("");
                        }}
                        min={localStorage.getItem("academic_yr_from") || ""}
                        max={localStorage.getItem("academic_yr_to") || ""}
                        className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loadingExams}
                      />
                      <div className=" absolute text-red-500 text-xs mt-1">
                        {studentError && <span>{studentError}</span>}
                      </div>
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
                    Staff Attendance : {/* &nbsp; | &nbsp; */}
                    {/* <span className="font-semibold">
                      Total Attendance: */}
                    {attendanceCount}
                    {/* </span> */}
                  </div>
                </div>
              </div>
              {timetable.length > 0 && (
                <div className="p-2 px-3 w-[500px] bg-gray-100 border-none flex justify-between items-center">
                  <div className="w-full   flex flex-row justify-between mr-0 md:mr-4 ">
                    <div className="w-1/2 md:w-[95%] mr-1 ">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search "
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-x-1 justify-center md:justify-end">
                    <button
                      type="button"
                      onClick={handleDownloadEXL}
                      className="relative bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded group"
                    >
                      <FaFileExcel />
                      <div className="absolute  bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex items-center justify-center bg-gray-700 text-white text-xs text-nowrap rounded-md py-1 px-2">
                        Export to Excel
                      </div>
                    </button>

                    <button
                      onClick={handlePrint}
                      className="relative bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded group flex items-center"
                    >
                      <FiPrinter />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex items-center justify-center bg-gray-700 text-white text-xs rounded-md py-1 px-2">
                        Print
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {timetable.length > 0 && (
              <>
                <div className="w-[full] px-4 mb-4 mt-4">
                  <div className="card mx-auto lg:w-full shadow-lg">
                    {/* <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                      <div className="w-full   flex flex-row justify-between mr-0 md:mr-4 ">
                        <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
                          List of Staff Attendance Daily Report
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
                    ></div> */}
                    <div
                      ref={outerScrollContainerRef}
                      className="h-[600px] overflow-y-scroll border border-gray-200 rounded-md p-2"
                    >
                      <div
                        ref={presentRef}
                        className=" card-body w-full md:w-[90%] mx-auto"
                      >
                        <h2 className="text-xl font-semibold text-center text-gray-800 mb-2">
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
                                    ref={(el) => {
                                      if (el)
                                        rowRefs.current[student.adm_form_pk] =
                                          el;
                                    }}
                                    className="border border-gray-300"
                                  >
                                    <td className="px-2 py-2 text-center border border-gray-300">
                                      {index + 1}
                                    </td>
                                    <td className="px-2 py-2 text-center border border-gray-300">
                                      {capitalizeWords(student.name || " ")}
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
                                <tr>
                                  <td
                                    colSpan={6}
                                    className="text-center py-6 text-lg text-red-700 "
                                  >
                                    Oops! No data found for Present Staff..
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div
                        ref={lateRef}
                        className="card-body w-full md:w-[90%] mx-auto"
                      >
                        <h2 className="text-xl font-semibold text-center text-gray-800 mb-2">
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
                                    ref={(el) => {
                                      if (el)
                                        rowRefs.current[student.adm_form_pk] =
                                          el;
                                    }}
                                    className="border border-gray-300"
                                  >
                                    <td className="px-2 py-2 text-center border border-gray-300">
                                      {index + 1}
                                    </td>
                                    <td className="px-2 py-2 text-center border border-gray-300">
                                      {capitalizeWords(student.name || " ")}
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
                                <tr>
                                  <td
                                    colSpan={7}
                                    className="text-center py-6 text-lg text-red-700 "
                                  >
                                    Oops! No data found for Late Staff..
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div
                        ref={absentRef}
                        className="card-body w-full md:w-[90%] mx-auto"
                      >
                        <h2 className="text-xl font-semibold text-center text-gray-800 mb-2">
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
                                    ref={(el) => {
                                      if (el)
                                        rowRefs.current[student.adm_form_pk] =
                                          el;
                                    }}
                                    className="border border-gray-300"
                                  >
                                    <td className="px-2 py-2 text-center border border-gray-300 text-red-500">
                                      {index + 1}
                                    </td>
                                    <td className="px-2 py-2 text-center border border-gray-300 text-red-500">
                                      {capitalizeWords(student.name || " ")}
                                    </td>
                                    <td className="px-2 py-2 text-center border border-gray-300 text-red-500">
                                      {student.employee_id || " "}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td
                                    colSpan={3}
                                    className="text-center py-6 text-lg text-red-700 "
                                  >
                                    Oops! No data found for Absent Staff..
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
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
