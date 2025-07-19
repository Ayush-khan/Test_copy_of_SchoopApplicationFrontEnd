import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
import { FiPrinter } from "react-icons/fi";
import { FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";

const AttendanceDetaileMontReport = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedMonthId, setSelectedMonthId] = useState(null);
  const [students, setStudents] = useState([]);
  const [showStudentReport, setShowStudentReport] = useState(false);

  const [fromDate, setFromDate] = useState(null);
  const [formattedFromDate, setFormattedFromDate] = useState("");

  const [currentPage, setCurrentPage] = useState(0);
  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingForSearch, setLoadingForSearch] = useState(false);

  const navigate = useNavigate();
  const [loadingExams, setLoadingExams] = useState(false);
  const [studentError, setStudentError] = useState("");
  const [dateError, setDateError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [timetable, setTimetable] = useState([]);

  const pageSize = 10;
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const handleStudentSelect = (selectedOption) => {
    setStudentError(""); // Reset error if student is select.
    setSelectedStudent(selectedOption);
    setSelectedStudentId(selectedOption?.value);
  };
  const handleMonthSelect = (selectedOption) => {
    setDateError(""); // Reset error if month is selected.
    setSelectedMonth(selectedOption);
    setSelectedMonthId(selectedOption?.value);
  };
  useEffect(() => {
    fetchClass();
  }, []);

  const fetchClass = async () => {
    try {
      setLoadingExams(true);
      const token = localStorage.getItem("authToken");

      const response = await axios.get(`${API_URL}/api/get_class_section`, {
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

  const studentOptions = useMemo(
    () =>
      studentNameWithClassId.map((cls) => ({
        value: cls?.section_id,
        valueclass: cls?.class_id,
        class: cls?.get_class?.name,
        section: cls.name,
        label: `${cls?.get_class?.name} ${cls.name}`,
      })),
    [studentNameWithClassId]
  );

  // Get the year from localStorage and extract just the year
  const academicYrFrom = localStorage.getItem("academic_yr_from"); // e.g. "2025-03-31"
  const academicYear = academicYrFrom
    ? new Date(academicYrFrom).getFullYear()
    : new Date().getFullYear();

  // Create the dropdown options with format like "5-2025"
  const monthOptions = [
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
  ].map((month) => ({
    value: `${month.value}-${academicYear}`,
    label: month.label,
  }));

  // Handle search and fetch parent information

  const handleSearch = async () => {
    setLoadingForSearch(false);

    let hasError = false;

    if (!selectedStudentId) {
      setStudentError("Please select Class.");
      hasError = true;
    }

    if (!selectedMonthId) {
      setDateError("Please select month.");
      hasError = true;
    }

    if (hasError) return;

    console.log("Calling API with:", {
      section: selectedStudentId,
      month_year: selectedMonthId,
    });

    setSearchTerm("");
    setLoadingForSearch(true);
    setTimetable([]);

    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/get_studentdailyattendancemonthwise`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            class_id: selectedStudent.valueclass,
            section_id: selectedStudentId, // 'PrePrimary' or 'all'
            month_year: selectedMonthId, // e.g. '2025-07-01'
          },
        }
      );

      const reportData = response?.data?.data ?? [];

      if (reportData.length === 0) {
        toast.error("No detailed monthly attendance report data found.");
        setTimetable([]);
        setShowStudentReport(false); // Don't show report view if empty
      } else {
        setTimetable(reportData);

        setPageCount(Math.ceil(reportData.length / pageSize));
        setShowStudentReport(true); // ✅ Show report view
      }
    } catch (error) {
      console.error("API Error:", error?.response?.data || error.message);
      toast.error("Failed to fetch attendance data. Please try again.");
    } finally {
      setIsSubmitting(false);
      setLoadingForSearch(false);
    }
  };
  useEffect(() => {
    if (timetable?.students?.length > 0 && timetable?.date_range?.length > 0) {
      const formattedStudents = timetable.students.map((student) => {
        const attendanceMap = {};
        student.daily_attendance.forEach((entry) => {
          attendanceMap[entry.date] = entry.status || "";
        });

        const attendance = timetable.date_range.map((dateObj) => {
          return attendanceMap[dateObj.date] || "";
        });

        return {
          name: student.name,
          rollNo: student.roll_no || "", // ✅ Use the real roll number
          attendance,
          present_days: student.present_days,
          absent_days: student.absent_days,
          working_days: student.working_days,
          prev_attendance: student.prev_attendance,
          total_attendance: student.total_attendance,
          total_working_days_till_month: student.total_working_days_till_month,
          cumulative_absent_days: student.cumulative_absent_days,
        };
      });

      setStudents(formattedStudents);
    }
  }, [timetable]);

  const generateAttendanceTableHTML = () => {
    const thead = `
      <thead class="bg-gray-200">
        <tr>
          <th class="border p-1">Roll No</th>
          <th class="border p-1">Student Name</th>
          ${timetable.date_range
            .map(
              (date) =>
                `<th class="border p-1">${date.formatted_date}<br/>${date.day}</th>`
            )
            .join("")}
          <th class="border p-1">Present Days</th>
          <th class="border p-1">Absent Days</th>
          <th class="border p-1">Working Days</th>
          <th class="border p-1">Prev. Attendance</th>
          <th class="border p-1">Total Attendance</th>
          <th class="border p-1">Working Days Till Month</th>
          <th class="border p-1">Cumulative Absent Days</th>
        </tr>
      </thead>`;

    const tbody = `
      <tbody>
        ${students
          .filter((s) =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map(
            (student) => `
            <tr>
              <td class="border p-1">${student.rollNo}</td>
              <td class="border p-1">${student.name}</td>
              ${student.attendance
                .map(
                  (val) =>
                    `<td class="border p-1 ${
                      val === "A" ? "text-red-600 font-bold" : ""
                    }">${val}</td>`
                )
                .join("")}
              <td class="border p-1">${student.present_days}</td>
              <td class="border p-1 text-red-600">${student.absent_days}</td>
              <td class="border p-1">${student.working_days}</td>
              <td class="border p-1">${student.prev_attendance}</td>
              <td class="border p-1">${student.total_attendance}</td>
              <td class="border p-1">${
                student.total_working_days_till_month
              }</td>
              <td class="border p-1 text-red-600">${
                student.cumulative_absent_days
              }</td>
            </tr>`
          )
          .join("")}
      </tbody>`;

    const tfoot = `
      <tfoot class="bg-yellow-100 font-semibold">
        <tr>
          <td class="border p-1" colspan="2">Present</td>
          ${timetable?.totals?.daily_present
            .map((val) => `<td class="border p-1">${val}</td>`)
            .join("")}
          <td class="border p-1">${timetable.totals?.total_present_days}</td>
          <td class="border p-1 text-red-600">–</td>
          <td class="border p-1">${
            timetable.totals?.total_working_days_for_this_month
          }</td>
          <td class="border p-1">${timetable.totals?.total_prev_attendance}</td>
          <td class="border p-1">${timetable.totals?.total_attendance}</td>
          <td class="border p-1">${
            timetable.totals?.total_working_days_till_month
          }</td>
          <td class="border p-1 text-red-600">${
            timetable.totals?.total_cumulative_absent_days
          }</td>
        </tr>
        <tr>
          <td class="border p-1" colspan="2">Absent</td>
          ${timetable?.totals?.daily_absent
            .map((val) => `<td class="border p-1 text-red-600">${val}</td>`)
            .join("")}
          <td class="border p-1 text-red-600">${
            timetable.totals?.total_absent_days
          }</td>
          <td class="border p-1">–</td>
          <td class="border p-1">–</td>
          <td class="border p-1">–</td>
          <td class="border p-1">–</td>
          <td class="border p-1">–</td>
          <td class="border p-1">–</td>
        </tr>
        <tr>
          <td class="border p-1" colspan="2">Total</td>
          ${timetable?.totals?.daily_total
            .map((val) => `<td class="border p-1 font-bold">${val}</td>`)
            .join("")}
          <td class="border p-1 font-bold">${
            timetable.totals?.total_present_absent_days
          }</td>
          <td class="border p-1">–</td>
          <td class="border p-1">–</td>
          <td class="border p-1 font-bold">${
            timetable.totals?.total_previous_attendance
          }</td>
          <td class="border p-1 font-bold">${
            timetable.totals?.grand_total_attendance
          }</td>
          <td class="border p-1">–</td>
          <td class="border p-1 font-bold text-red-600">${
            timetable.totals?.grand_total_absent_attendance
          }</td>
        </tr>
      </tfoot>`;

    return `<table class="table-auto border border-black text-xs text-center w-full">${thead}${tbody}${tfoot}</table>`;
  };

  const handlePrint = () => {
    const printTitle = `Detailed monthly attendance report of ${selectedStudent?.label} (${selectedMonth?.label})`;
    const tableHTML = generateAttendanceTableHTML();

    const headerTable = `
      <table style="width: 100%; margin-bottom: 10px; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="border: 1px solid #ccc; padding: 6px; text-align: center;"><strong>Class:</strong> ${
            selectedStudent?.class || ""
          }</td>
          <td style="border: 1px solid #ccc; padding: 6px; text-align: center;"><strong>Division:</strong> ${
            selectedStudent?.section || ""
          }</td>
          <td style="border: 1px solid #ccc; padding: 6px; text-align: center;"><strong>Month:</strong> ${
            selectedMonth?.label
          }</td>
        </tr>
      </table>
    `;

    const printWindow = window.open("", "_blank", "width=1000,height=800");

    printWindow.document.write(`
      <html>
        <head>
          <title>${printTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; font-size: 12px; border-collapse: collapse; }
            th, td { border: 1px solid #333; padding: 4px; text-align: center; }
            th { background: #eee; }
          </style>
        </head>
        <body>
          <h3 style="text-align:center; margin-bottom: 10px;">${printTitle}</h3>
          ${headerTable}
          ${tableHTML}
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

  const generateAttendanceExcelData = () => {
    const headerRow = [
      "Roll No",
      "Student Name",
      ...timetable.date_range.map((d) => `${d.formatted_date} (${d.day})`),
      "Present Days",
      "Absent Days",
      "Working Days",
      "Prev. Attendance",
      "Total Attendance",
      "Working Days Till Month",
      "Cumulative Absent Days",
    ];

    const dataRows = students
      .filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .map((student) => [
        student.rollNo,
        student.name,
        ...student.attendance,
        student.present_days,
        student.absent_days,
        student.working_days,
        student.prev_attendance,
        student.total_attendance,
        student.total_working_days_till_month,
        student.cumulative_absent_days,
      ]);

    const footerRows = [
      [
        "Present",
        "",
        ...timetable.totals?.daily_present,
        timetable.totals?.total_present_days,
        "–",
        timetable.totals?.total_working_days_for_this_month,
        timetable.totals?.total_prev_attendance,
        timetable.totals?.total_attendance,
        timetable.totals?.total_working_days_till_month,
        timetable.totals?.total_cumulative_absent_days,
      ],
      [
        "Absent",
        "",
        ...timetable.totals?.daily_absent,
        timetable.totals?.total_absent_days,
        "–",
        "–",
        "–",
        "–",
        "–",
        "–",
      ],
      [
        "Total",
        "",
        ...timetable.totals?.daily_total,
        timetable.totals?.total_present_absent_days,
        "–",
        "–",
        timetable.totals?.total_previous_attendance,
        timetable.totals?.grand_total_attendance,
        "–",
        timetable.totals?.grand_total_absent_attendance,
      ],
    ];

    return [headerRow, ...dataRows, ...footerRows];
  };

  const handleDownloadEXL = () => {
    const data = generateAttendanceExcelData();

    if (data.length <= 1) {
      toast.error("No attendance data available.");
      return;
    }

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    worksheet["!cols"] = data[0].map(() => ({ wch: 20 }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Report");

    const fileName = `Detailed monthly attendance report of ${selectedStudent?.label}(${selectedMonth?.label}).xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const filteredSections = students.filter((record) => {
    const searchLower = searchTerm.toLowerCase();

    const classSection = record?.class_section?.toLowerCase() || "";
    const classTeacher = record?.class_teacher?.toLowerCase() || "";
    const substituteTeacher = record?.substitute_teacher?.toLowerCase() || "";
    const attendanceMarkedBy =
      record?.attendance_marked_by?.toLowerCase() || "";
    const markedStatus =
      record?.marked?.toLowerCase() === "y" ? "marked" : "not marked";

    return (
      classSection.includes(searchLower) ||
      classTeacher.includes(searchLower) ||
      substituteTeacher.includes(searchLower) ||
      attendanceMarkedBy.includes(searchLower) ||
      markedStatus.includes(searchLower)
    );
  });

  const displayedSections = filteredSections.slice(currentPage * pageSize);
  return (
    <>
      <div
        className={` transition-all duration-500 w-[85%]  mx-auto p-4 ${
          showStudentReport ? "w-full " : "w-[85%] "
        }`}
        // className="w-full md:w-[85%]  mx-auto p-4 "
      >
        <ToastContainer />
        <div className="card pb-4  rounded-md ">
          {!showStudentReport && (
            <>
              <div className=" card-header mb-4 flex justify-between items-center ">
                <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
                  Detailed Monthly Attendance Report
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
            </>
          )}
          <>
            {!showStudentReport && (
              <>
                <div className=" w-full md:w-[85%]   flex justify-center flex-col md:flex-row gap-x-1     ml-0    p-2">
                  <div className="w-full md:w-[99%] flex md:flex-row justify-between items-center mt-0 md:mt-4">
                    <div className="w-full md:w-[98%]  gap-x-0 md:gap-x-12 flex flex-col gap-y-2 md:gap-y-0 md:flex-row">
                      {/* Class Dropdown */}
                      <div className="w-full  md:w-[40%] gap-x-2 justify-around my-1 md:my-4 flex md:flex-row">
                        <label
                          className="w-full md:w-[35%] text-md pl-0 md:pl-5 mt-1.5"
                          htmlFor="studentSelect"
                        >
                          Select Class <span className="text-red-500">*</span>
                          {/* Staff */}
                        </label>
                        <div className="w-full md:w-[55%]">
                          <Select
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            id="studentSelect"
                            value={selectedStudent}
                            onChange={handleStudentSelect}
                            options={studentOptions}
                            placeholder={loadingExams ? "Loading..." : "Select"}
                            isSearchable
                            isClearable
                            className="text-sm"
                            isDisabled={loadingExams}
                            styles={{
                              control: (provided) => ({
                                ...provided,
                                fontSize: "1em", // Adjust font size for selected value
                                minHeight: "30px", // Reduce height
                              }),
                              menu: (provided) => ({
                                ...provided,
                                fontSize: "1em", // Adjust font size for dropdown options
                              }),
                              option: (provided) => ({
                                ...provided,
                                fontSize: ".9em", // Adjust font size for each option
                              }),
                            }}
                          />
                          {studentError && (
                            <div className="h-8 relative ml-1 text-danger text-xs">
                              {studentError}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* From Date Dropdown */}
                      <div className="w-full   md:w-[35%] gap-x-4 justify-between my-1 md:my-4 flex md:flex-row">
                        <label
                          className="ml-0 md:ml-4 w-full md:w-[50%] text-md mt-1.5"
                          htmlFor="fromDate"
                        >
                          Month <span className="text-red-500">*</span>
                        </label>
                        <div className="w-full md:w-[85%]">
                          <Select
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            id="monthSelect"
                            value={selectedMonth}
                            onChange={handleMonthSelect}
                            options={monthOptions}
                            placeholder="Select"
                            isSearchable
                            isClearable
                            className="text-sm"
                            isDisabled={loadingExams}
                          />

                          {dateError && (
                            <div className="h-8 relative ml-1 text-danger text-xs">
                              {dateError}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Browse Button */}
                      <div className="mt-1">
                        <button
                          type="search"
                          onClick={handleSearch}
                          style={{ backgroundColor: "#2196F3" }}
                          className={`btn h-10 w-18 md:w-auto btn-primary text-white font-bold py-1 border-1 border-blue-500 px-4 rounded ${
                            loadingForSearch
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          disabled={loadingForSearch}
                        >
                          {loadingForSearch ? (
                            <span className="flex items-center">
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
                              Browsing...
                            </span>
                          ) : (
                            "Browse"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            {showStudentReport && (
              <>
                {students.length > 0 && (
                  <>
                    <div className="   w-full  mx-auto transition-all duration-300">
                      <div className="card mx-auto shadow-lg">
                        {/* Header Section */}
                        <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                          <div className="w-full flex flex-row justify-between mr-0 md:mr-4">
                            <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
                              Student Attendance Report
                            </h3>
                            <div className="w-1/2 md:w-[18%] mr-1">
                              <input
                                type="text"
                                className="form-control border px-2 py-1 rounded"
                                placeholder="Search"
                                onChange={(e) => setSearchTerm(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="flex flex-col md:flex-row gap-x-1 justify-center md:justify-end">
                            <button
                              type="button"
                              onClick={handleDownloadEXL}
                              className="relative bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded group"
                            >
                              <FaFileExcel />
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex items-center justify-center bg-gray-700 text-white text-xs rounded-md py-1 px-2">
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
                            <RxCross1
                              className="text-xl text-red-600 cursor-pointer hover:bg-red-100 rounded "
                              onClick={() => setShowStudentReport(false)} // ✅ Reset state
                            />
                          </div>
                        </div>

                        <div
                          className="relative w-[97%] mb-3 h-1 mx-auto"
                          style={{ backgroundColor: "#C03078" }}
                        ></div>

                        {/* Table */}
                        <div className="card-body w-full">
                          <div className="h-[600px] overflow-x-auto overflow-y-scroll border">
                            <table className="min-w-[1600px] table-auto text-sm text-center border border-gray-300">
                              <thead className="bg-gray-200 sticky top-0 z-5">
                                <tr>
                                  <th className="border p-1">Roll No</th>
                                  <th className="border p-1">Student Name</th>
                                  {timetable.date_range.map((date, i) => (
                                    <th
                                      key={i}
                                      className="border p-1 whitespace-nowrap"
                                    >
                                      {date.formatted_date}
                                      <br />
                                      {date.day}
                                    </th>
                                  ))}
                                  <th className="border p-1">Present Days</th>
                                  <th className="border p-1">Absent Days</th>
                                  <th className="border p-1">Working Days</th>
                                  <th className="border p-1">
                                    Prev. Attendance
                                  </th>
                                  <th className="border p-1">
                                    Total Attendance
                                  </th>
                                  <th className="border p-1">
                                    Working Days Till Month
                                  </th>
                                  <th className="border p-1">
                                    Cumulative Absent Days
                                  </th>
                                </tr>
                              </thead>

                              <tbody>
                                {students
                                  .filter((student) =>
                                    student.name
                                      .toLowerCase()
                                      .includes(searchTerm.toLowerCase())
                                  )
                                  .map((student, i) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                      <td className="border p-1">
                                        {student.rollNo}
                                      </td>
                                      <td className="border p-1">
                                        {student.name}
                                      </td>
                                      {student.attendance.map((val, idx) => (
                                        <td
                                          key={idx}
                                          className={`border p-1 ${
                                            val === "A"
                                              ? "text-red-600 font-bold"
                                              : ""
                                          }`}
                                        >
                                          {val}
                                        </td>
                                      ))}
                                      <td className="border p-1">
                                        {student.present_days}
                                      </td>
                                      <td className="border p-1 text-red-600">
                                        {student.absent_days}
                                      </td>
                                      <td className="border p-1">
                                        {student.working_days}
                                      </td>
                                      <td className="border p-1">
                                        {student.prev_attendance}
                                      </td>
                                      <td className="border p-1">
                                        {student.total_attendance}
                                      </td>
                                      <td className="border p-1">
                                        {student.total_working_days_till_month}
                                      </td>
                                      <td className="border p-1 text-red-600">
                                        {student.cumulative_absent_days}
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>

                              <tfoot className="bg-yellow-100 font-semibold">
                                <tr>
                                  <td className="border p-1" colSpan={2}>
                                    Present
                                  </td>
                                  {timetable?.totals?.daily_present.map(
                                    (val, i) => (
                                      <td
                                        key={`present-${i}`}
                                        className="border p-1"
                                      >
                                        {val}
                                      </td>
                                    )
                                  )}
                                  <td className="border p-1">
                                    {timetable.totals?.total_present_days}
                                  </td>
                                  <td className="border p-1 text-red-600">–</td>
                                  <td className="border p-1">
                                    {
                                      timetable.totals
                                        ?.total_working_days_for_this_month
                                    }
                                  </td>
                                  <td className="border p-1">
                                    {timetable.totals?.total_prev_attendance}
                                  </td>
                                  <td className="border p-1">
                                    {timetable.totals?.total_attendance}
                                  </td>
                                  <td className="border p-1">
                                    {
                                      timetable.totals
                                        ?.total_working_days_till_month
                                    }
                                  </td>
                                  <td className="border p-1 text-red-600">
                                    {
                                      timetable.totals
                                        ?.total_cumulative_absent_days
                                    }
                                  </td>
                                </tr>

                                <tr>
                                  <td className="border p-1" colSpan={2}>
                                    Absent
                                  </td>
                                  {timetable?.totals?.daily_absent.map(
                                    (val, i) => (
                                      <td
                                        key={`absent-${i}`}
                                        className="border p-1 text-red-600"
                                      >
                                        {val}
                                      </td>
                                    )
                                  )}
                                  <td className="border p-1 text-red-600">
                                    {timetable.totals?.total_absent_days}
                                  </td>
                                  <td className="border p-1">–</td>
                                  <td className="border p-1">–</td>
                                  <td className="border p-1">–</td>
                                  <td className="border p-1">–</td>
                                  <td className="border p-1">–</td>
                                  <td className="border p-1">–</td>
                                </tr>

                                <tr>
                                  <td className="border p-1" colSpan={2}>
                                    Total
                                  </td>
                                  {timetable?.totals?.daily_total.map(
                                    (val, i) => (
                                      <td
                                        key={`total-${i}`}
                                        className="border p-1 font-bold"
                                      >
                                        {val}
                                      </td>
                                    )
                                  )}
                                  <td className="border p-1 font-bold">
                                    {
                                      timetable.totals
                                        ?.total_present_absent_days
                                    }
                                  </td>
                                  <td className="border p-1">–</td>
                                  <td className="border p-1">–</td>
                                  <td className="border p-1 font-bold">
                                    {
                                      timetable.totals
                                        ?.total_previous_attendance
                                    }
                                  </td>
                                  <td className="border p-1 font-bold">
                                    {timetable.totals?.grand_total_attendance}
                                  </td>
                                  <td className="border p-1">–</td>
                                  <td className="border p-1 font-bold text-red-600">
                                    {
                                      timetable.totals
                                        ?.grand_total_absent_attendance
                                    }
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>
                      </div>
                      <div className="w-[10%] mt-2 mx-auto">
                        <button
                          onClick={() => setShowStudentReport(false)} // ✅ Reset state
                          className="relative  bg-yellow-400 hover:bg-yellow-600 text-white px-3 py-1 rounded group flex items-center font-bold"
                        >
                          Back
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </>
        </div>
      </div>
    </>
  );
};

export default AttendanceDetaileMontReport;
