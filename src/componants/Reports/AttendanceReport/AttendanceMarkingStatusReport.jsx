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

const AttendanceMarkingStatusReport = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [selectedStudent, setSelectedStudent] = useState(null);
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
  const academicYrFrom = localStorage.getItem("academic_yr_from");
  const academicYrTo = localStorage.getItem("academic_yr_to");
  const handleStudentSelect = (selectedOption) => {
    setStudentError(""); // Reset error if student is select.
    setSelectedStudent(selectedOption);
    setSelectedStudentId(selectedOption?.value);
  };

  const studentOptions = [
    { label: "Pre-Primary", value: "PrePrimary" },
    { label: "1-10", value: "all" },
  ];

  // Handle search and fetch parent information

  const handleSearch = async () => {
    setLoadingForSearch(false);

    let hasError = false;

    if (!selectedStudentId) {
      setStudentError("Please select Class.");
      hasError = true;
    }

    if (!fromDate) {
      setDateError("Please select a date.");
      hasError = true;
    }

    if (hasError) return;

    console.log("Calling API with:", {
      section: selectedStudentId,
      date: fromDate,
    });

    setSearchTerm("");
    setLoadingForSearch(true);
    setTimetable([]);

    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/get_attendancemarkingstatus`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            section: selectedStudentId, // 'PrePrimary' or 'all'
            date: fromDate, // e.g. '2025-07-01'
          },
        }
      );

      const reportData = response?.data?.report ?? [];

      if (reportData.length === 0) {
        toast.error("No attendance marking data found.");
        setTimetable([]);
      } else {
        setTimetable(reportData);
        setPageCount(Math.ceil(reportData.length / pageSize));
      }
    } catch (error) {
      console.error("API Error:", error?.response?.data || error.message);
      toast.error("Failed to fetch attendance data. Please try again.");
    } finally {
      setIsSubmitting(false);
      setLoadingForSearch(false);
    }
  };

  const handlePrint = () => {
    const printTitle = `Attendance Marking Status Report for ${selectedStudent?.label} on ${formattedFromDate}`;
    const printContent = `
    <div id="tableMain" class="flex items-center justify-center min-h-screen bg-white">
         <h5 id="tableHeading5"  class="text-lg font-semibold border-1 border-black">${printTitle}</h5>
    <div id="tableHeading" class="text-center w-3/4">
      <table class="min-w-full leading-normal table-auto border border-black mx-auto mt-2">
        <thead>
          <tr class="bg-gray-100">
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Sr.No</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Class</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Class Teacher</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Substitute Teacher</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Attendance Marked By</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Marked Attendance</th>
            
          </tr>
        </thead>
        <tbody>
          ${displayedSections
            .map(
              (subject, index) => `
              <tr class="text-sm">
                <td class="px-2 text-center py-2 border border-black">${
                  index + 1
                }</td>
                <td class="px-2 text-center py-2 border border-black">${
                  subject?.class_section || " "
                }</td>
                <td class="px-2 text-center py-2 border border-black">${
                  subject?.class_teacher || " "
                }</td>
                <td class="px-2 text-center py-2 border border-black">${
                  subject?.substitute_teacher || " "
                }</td>
               <td class="px-2 text-center py-2 border border-black">${
                 subject?.attendance_marked_by || " "
               }</td>
                  <td class="px-2 text-center py-2 border border-black">${
                    subject?.marked || " "
                  }</td>
                   
              </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>
  </div>`;

    const printWindow = window.open("", "_blank", "width=1000,height=800");

    printWindow.document.write(`
      <html>
        <head>
          <title>${printTitle}</title>
          <style>
          @page { margin: 0; padding:0; box-sizing:border-box;   ;
    }
          body { margin: 0; padding: 0; box-sizing:border-box; font-family: Arial, sans-serif; }
          #tableHeading {
      width: 100%;
      margin: auto; /* Centers the div horizontally */
      display: flex;
      justify-content: center;
    }

    #tableHeading table {
      width: 100%; /* Ensures the table fills its container */
      margin:auto;
      padding:0 10em 0 10em;
    }

    #tableContainer {
      display: flex;
      justify-content: center; /* Centers the table horizontally */
      width: 80%;

    }

    h5 {
      width: 100%;
      text-align: center;
      margin: 0;  /* Remove any default margins */
      padding: 5px 0;  /* Adjust padding if needed */
    }

    #tableMain {
    width:100%;
    margin:auto;
    box-sizing:border-box;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start; /* Prevent unnecessary space */
    padding:0 10em 0 10em;
    }

    h5 + * { /* Targets the element after h5 */
      margin-top: 0; /* Ensures no extra space after h5 */
    }

          table { border-spacing: 0; width: 70%; margin: auto;   }
          th { font-size: 0.8em; background-color: #f9f9f9; }
          td { font-size: 12px; }
          th, td { border: 1px solid gray; padding: 8px; text-align: center; }
          .student-photo {
            width: 30px !important;
            height: 30px !important;
            object-fit: cover;
            border-radius: 50%;
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

    // ✅ Ensure content is fully loaded before printing
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

    // Define headers matching the print table
    const headers = [
      "Sr No.",
      "Class",
      "Class Teacher",
      "Substitute Teacher",
      "Attendance Marked By",
      "Marked Attendance",
    ];
    // Convert displayedSections data to array format for Excel
    const data = displayedSections.map((student, index) => [
      index + 1,
      student?.class_section || " ",
      student?.class_teacher || " ",
      student?.substitute_teacher || " ",
      student?.attendance_marked_by || " ",
      student?.marked || " ",
    ]);

    // Create a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // Auto-adjust column width
    const columnWidths = headers.map(() => ({ wch: 20 })); // Approx. width of 20 characters per column
    worksheet["!cols"] = columnWidths;

    // Create a workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Admission Form Data");

    // Generate and download the Excel file
    const fileName = `Attendance Marking Status Report for ${selectedStudent?.label} on ${formattedFromDate}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const filteredSections = timetable.filter((record) => {
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
      <div className="w-full md:w-[85%]  mx-auto p-4 ">
        <ToastContainer />
        <div className="card p-4 rounded-md ">
          <div className=" card-header mb-4 flex justify-between items-center ">
            <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
              Attendance Marking Status Report
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
                      Select Date <span className="text-red-500">*</span>
                    </label>
                    <div className="w-full md:w-[85%]">
                      <input
                        type="date"
                        id="fromDate"
                        min={academicYrFrom}
                        max={academicYrTo}
                        value={fromDate}
                        onChange={(e) => {
                          setDateError("");
                          const raw = e.target.value;
                          setFromDate(raw); // for input

                          // Format for display
                          const [year, month, day] = raw.split("-");
                          setFormattedFromDate(
                            `${day}-${month}-${year.slice(2)}`
                          );
                        }}
                        className="text-sm w-full border border-gray-300 rounded px-2 py-2"
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

            {timetable.length > 0 && (
              <>
                <div className="w-full  mt-4">
                  <div className="card mx-auto lg:w-full shadow-lg">
                    <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                      <div className="w-full   flex flex-row justify-between mr-0 md:mr-4 ">
                        <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
                          List of Attendance Marking Status Report
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

                    <div className="card-body w-full">
                      <div
                        className="h-96 lg:h-96 overflow-y-scroll overflow-x-scroll"
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
                                "Class",
                                "Class Teacher",
                                "Substitute Teacher",
                                "Attendance Marked By",
                                "Marked Attendance",
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
                            {displayedSections.length ? (
                              displayedSections?.map((student, index) => (
                                <tr
                                  key={student.adm_form_pk}
                                  className="border border-gray-300"
                                >
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {index + 1}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student?.class_section || " "}
                                  </td>

                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student?.class_teacher || " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student?.substitute_teacher || " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student?.attendance_marked_by || " "}
                                  </td>

                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student?.marked || " "}
                                  </td>
                                </tr>
                              ))
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

export default AttendanceMarkingStatusReport;
