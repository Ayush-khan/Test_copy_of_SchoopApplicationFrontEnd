import { useState, useEffect, useMemo } from "react";
import React from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
import LoaderStyle from "../common/LoaderFinal/LoaderStyle";
import { FiPrinter } from "react-icons/fi";
import { FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";

const days = Array.from({ length: 31 }, (_, i) => i + 1);

const StaffMonthlyAttendanceRepo = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingForSearch, setLoadingForSearch] = useState(false);
  // const [selectedMonth, setSelectedMonth] = useState(null);
  const navigate = useNavigate();
  const [loadingExams, setLoadingExams] = useState(false);
  const [studentError, setStudentError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [timetable, setTimetable] = useState([]);

  const pageSize = 10;
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  // useEffect(() => {
  //   // handleSearch();
  // }, []);

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
  ];

  const handleMonthSelect = (selectedOption) => {
    setStudentError(""); // Reset error if month is selected.
    setSelectedStudent(selectedOption);
    setSelectedStudentId(selectedOption?.value);
  };

  // Handle search and fetch parent information

  const handleSearch = async () => {
    setLoadingForSearch(false);
    if (!selectedStudentId) {
      setStudentError("Please select Month.");
      setLoadingForSearch(false);
      return;
    }
    setSearchTerm("");
    try {
      setLoadingForSearch(true); // Start loading
      setTimetable([]);
      const token = localStorage.getItem("authToken");
      const params = {};
      if (selectedStudentId) params.month = selectedStudentId;

      const response = await axios.get(
        `${API_URL}/api/get_teachermonthlyattendancereport/${selectedStudentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Response", response);

      if (!response?.data?.report || response?.data?.report?.length === 0) {
        toast.error("Staff Attendance Monthly Report data not found.");
        setTimetable([]);
      } else {
        setTimetable(response?.data?.report);
        setPageCount(Math.ceil(response?.data?.data?.length / pageSize)); // Set page count based on response size
      }
    } catch (error) {
      console.error("Error fetching Teacher Attendance Monthly Report:", error);
      toast.error(
        "Error fetching Teacher Attendance Monthly Report. Please try again."
      );
    } finally {
      setIsSubmitting(false); // Re-enable the button after the operation
      setLoadingForSearch(false);
    }
  };

  const handlePrint = () => {
    const printTitle = `Staff Attendance Monthly Report ${
      selectedStudent?.label
        ? `List of Month ${selectedStudent.label}`
        : ": For All Staff "
    }`;
    const printContent = `
  <div class="p-4 bg-white text-sm">
    <h5 class="text-lg font-semibold mb-4 text-center border-b border-black pb-2">${printTitle}</h5>
    <table class="min-w-full border border-black table-fixed border-collapse">
      <colgroup>
        <col style="width: 200px;" /> <!-- Teacher Name -->
        <col style="width: 80px;" /> <!-- Days/In/Out -->
        ${days.map(() => `<col style="width: 80px;" />`).join("")}
      </colgroup>
      <tbody>
        ${displayedSections
          .map((teacher, index) => {
            const attendanceMap = {};
            // teacher.days.forEach((day) => {
            //   attendanceMap[day.date] = { in: day.in, out: day.out };
            // });
            teacher.days.forEach((day) => {
              const dayNum = new Date(day.date).getDate(); // 1 to 31
              attendanceMap[dayNum] = {
                in: day.in,
                out: day.out,
              };
            });

            const dayHeaders = days
              .map(
                (d) =>
                  `<td class="border border-black px-1 py-1 text-center">
                  ${d}
                </td>`
              )
              .join("");

            const inRow = days
              .map(
                (d) =>
                  `<td class="border border-black px-1 py-1 text-center">${
                    attendanceMap[d]?.in || ""
                  }</td>`
              )
              .join("");

            const outRow = days
              .map(
                (d) =>
                  `<td class="border border-black px-1 py-1 text-center">${
                    attendanceMap[d]?.out || ""
                  }</td>`
              )
              .join("");

            return `
              <tr>
                <td rowspan="3" class="border border-black font-semibold px-2 py-2 align-top text-left">${
                  teacher.name
                }</td>
                <td class="border border-black font-semibold px-1 py-1 text-center">Days</td>
                ${dayHeaders}
              </tr>
              <tr>
                <td class="border border-black font-semibold px-1 py-1 text-center">In</td>
                ${inRow}
              </tr>
              <tr>
                <td class="border border-black font-semibold px-1 py-1 text-center">Out</td>
                ${outRow}
              </tr>
              <tr><td colspan="${days.length + 2}" class="h-2"></td></tr>
            `;
          })
          .join("")}
      </tbody>
    </table>
  </div>`;

    const printWindow = window.open("", "_blank", "width=2000,height=1000");
    printWindow.document.write(`
    <html>
      <head>
        <style>
            @page {
                 size: A3 landscape; /* 420mm × 297mm */
                 margin: 10mm;
            }
        /* Increase width */
        #tableMain {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
  
        h5 {
          width: 100%;
          text-align: center;
          font-size: 1em;
          font-weight: bold;
          margin-bottom: 10px;
        }
  
        #tableContainer {
          width: 100%;
          display: flex;
          justify-content: center;
        }
  
        table {
          width: 100%; /* Increase table width */
          border-spacing: 0;
           margin: auto;
        }
  
        th, td {
          border: 1px solid gray;
          padding: 12px;
          text-align: center;
          font-size: 7px; /* Increase font size */
        }
  
        th {
          background-color: #f9f9f9;
          font-size: 1.1em;
        }
        </style>
      </head>
         <body>
        <div id="printContainer">
            ${printContent}
        </div>
    </body>
    </html>
  `);

    printWindow.document.close();

    // Ensure content is fully loaded before printing
    printWindow.onload = function () {
      printWindow.focus();
      printWindow.print();
      printWindow.close(); // Optional: close after printing
    };
  };

  const handleDownloadEXL = () => {
    if (!displayedSections || displayedSections.length === 0) {
      toast.error("No data available to download the Excel sheet.");
      return;
    }

    // Create static days: 1 to 31
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    // Headers: Name + Days columns (In and Out for each day)
    const headers = [
      //   "Teacher Name",
      //   "Day Type",
      `Month : ${selectedStudent.label}`,
      //   ...days.map((d) => d.toString()),
    ];

    // Construct rows for each teacher
    const rows = [];

    displayedSections.forEach((teacher) => {
      const attendanceMap = {};
      teacher.days.forEach((day) => {
        const dateObj = new Date(day.date);
        const dayNumber = dateObj.getDate();
        attendanceMap[dayNumber] = {
          in: day.in || "",
          out: day.out || "",
        };
      });

      // Row 1: Days (just day numbers)
      const daysRow = ["", "Days", ...days.map((d) => d)];

      // Row 2: In times
      const inRow = [
        teacher.name,
        "In",
        ...days.map((d) => attendanceMap[d]?.in || ""),
      ];

      // Row 3: Out times
      const outRow = [
        "",
        "Out",
        ...days.map((d) => attendanceMap[d]?.out || ""),
      ];

      // Add to rows
      rows.push(daysRow, inRow, outRow, []); // Empty row as spacer
    });

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    worksheet["!cols"] = headers.map(() => ({ wch: 15 }));

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Staff Monthly Attendance Report"
    );

    const fileName = `Staff_Monthly_Attendance_Report_${
      selectedStudent?.label || "All"
    }.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  console.log("row", timetable);

  const filteredSections = timetable
    .map((teacher) => {
      const matchingDays = teacher.days.filter((day) => {
        const searchLower = searchTerm.toLowerCase();
        const date = day?.date?.toLowerCase() || "";
        const teacherName = teacher?.name?.toLowerCase() || "";

        return date.includes(searchLower) || teacherName.includes(searchLower);
      });

      if (matchingDays.length > 0) {
        return {
          ...teacher,
          days: matchingDays,
        };
      }
      return null;
    })
    .filter(Boolean);

  const displayedSections = filteredSections.slice(currentPage * pageSize);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  console.log("filtered section", displayedSections);

  return (
    <>
      <div className="w-full md:w-[95%] mx-auto p-4 ">
        <ToastContainer />
        <div className="card p-4 rounded-md ">
          <div className=" card-header mb-4 flex justify-between items-center ">
            <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
              Staff Monthly Attendance Report
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
                <div className="w-full md:w-[75%] gap-x-0 md:gap-x-12  flex flex-col gap-y-2 md:gap-y-0 md:flex-row">
                  <div className="w-full md:w-[50%] gap-x-2   justify-around  my-1 md:my-4 flex md:flex-row ">
                    <label
                      className="md:w-[25%] text-md pl-0 md:pl-5 mt-1.5"
                      htmlFor="studentSelect"
                    >
                      Month <span className="text-sm text-red-500">*</span>
                    </label>
                    <div className=" w-full md:w-[65%]">
                      <Select
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        id="monthSelect"
                        value={selectedStudent}
                        onChange={handleMonthSelect}
                        options={monthOptions}
                        placeholder="Select"
                        isSearchable
                        isClearable
                        className="text-sm"
                        isDisabled={loadingExams}
                      />
                      {studentError && (
                        <div className="h-8 relative ml-1 text-danger text-xs">
                          {studentError}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-1">
                    <button
                      type="search"
                      onClick={handleSearch}
                      style={{ backgroundColor: "#2196F3" }}
                      className={` btn h-10 w-18 md:w-auto btn-primary text-white font-bold py-1 border-1 border-blue-500 px-4 rounded ${
                        loadingForSearch ? "opacity-50 cursor-not-allowed" : ""
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
                          Searching...
                        </span>
                      ) : (
                        "Search"
                      )}
                    </button>
                  </div>
                </div>{" "}
              </div>
            </div>

            {timetable.length > 0 && (
              <>
                <div className="w-full  mt-4">
                  <div className="card mx-auto lg:w-full shadow-lg">
                    <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                      <div className="w-full   flex flex-row justify-between mr-0 md:mr-4 ">
                        <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
                          List of Staff Attendance Monthly Report
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
                          type="button"
                          onClick={handleDownloadEXL}
                          className="relative bg-blue-400 py-1 hover:bg-blue-500 text-white px-3 rounded group"
                        >
                          <FaFileExcel />

                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex items-center justify-center bg-gray-600  text-white text-[.7em] rounded-md py-1 px-2">
                            Exports to excel
                          </div>
                        </button>

                        <button
                          onClick={handlePrint}
                          className="relative flex flex-row justify-center align-middle items-center gap-x-1 bg-blue-400 hover:bg-blue-500 text-white px-3 rounded group"
                        >
                          <FiPrinter />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex items-center justify-center bg-gray-600  text-white text-[.7em] rounded-md py-1 px-2">
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

                    <div className="card-body w-full md:w-[100%] mx-auto">
                      <div
                        className="h-96 lg:h-96  overflow-y-scroll overflow-x-scroll"
                        style={{
                          scrollbarWidth: "thin",
                          scrollbarColor: "#C03178 transparent",
                        }}
                      >
                        <table className="min-w-[2000px] table-fixed border-collapse w-full text-sm text-center">
                          <colgroup>
                            <col className="w-64" /> {/* Teacher Name */}
                            <col className="w-20" /> {/* Days/In/Out label */}
                            {days.map((_, idx) => (
                              <col key={idx} className="w-24" />
                            ))}
                          </colgroup>
                          <tbody>
                            {displayedSections.length ? (
                              displayedSections.map((student, index) => {
                                const attendanceMap = {};
                                student.days.forEach((day) => {
                                  const dayNum = new Date(day.date).getDate(); // 1 to 31
                                  attendanceMap[dayNum] = {
                                    in: day.in,
                                    out: day.out,
                                  };
                                });

                                return (
                                  <React.Fragment key={index}>
                                    {/* Row 1: Day headers */}
                                    <tr>
                                      <td
                                        rowSpan="3"
                                        className="border border-gray-400 font-semibold text-lg px-2 py-4 text-left align-top"
                                      >
                                        {student.name}
                                      </td>
                                      <td className="border border-gray-400 font-semibold text-base px-1 py-2">
                                        Days
                                      </td>

                                      {days.map((dayNum) => (
                                        <td
                                          key={`day-${index}-${dayNum}`}
                                          className="border border-gray-400 px-1 py-1 font-semibold"
                                        >
                                          {dayNum}{" "}
                                        </td>
                                      ))}
                                    </tr>

                                    {/* Row 2: In times */}
                                    <tr>
                                      <td className="border border-gray-400 font-semibold text-base px-1 py-2">
                                        In
                                      </td>
                                      {days.map((day) => (
                                        <td
                                          key={`in-${index}-${day}`}
                                          className="border border-gray-400 px-1 py-1"
                                        >
                                          {attendanceMap[day]?.in || ""}
                                        </td>
                                      ))}
                                    </tr>

                                    {/* Row 3: Out times */}
                                    <tr>
                                      <td className="border border-gray-400 font-semibold text-base px-1 py-2">
                                        Out
                                      </td>
                                      {days.map((day) => (
                                        <td
                                          key={`out-${index}-${day}`}
                                          className="border border-gray-400 px-1 py-1"
                                        >
                                          {attendanceMap[day]?.out || ""}
                                        </td>
                                      ))}
                                    </tr>

                                    {/* Spacer row */}
                                    <tr>
                                      <td
                                        colSpan={days.length + 2}
                                        className="h-4"
                                      ></td>
                                    </tr>
                                  </React.Fragment>
                                );
                              })
                            ) : (
                              <div className=" absolute left-[1%] w-[100%]  text-center flex justify-center items-center mt-14">
                                <div className=" text-center text-xl text-red-700">
                                  Oops! No data found..
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

export default StaffMonthlyAttendanceRepo;
