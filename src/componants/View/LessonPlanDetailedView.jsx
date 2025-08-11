import React from "react";
import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
import { FiPrinter } from "react-icons/fi";
import { FaFileExcel, FaRegCalendarAlt } from "react-icons/fa";
import * as XLSX from "xlsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";

const LessonPlanDetailedView = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [selectedStudent, setSelectedStudent] = useState(null);
  const academicYrFrom = localStorage.getItem("academic_yr_from");
  const academicYrTo = localStorage.getItem("academic_yr_to");

  const minDate = academicYrFrom ? dayjs(academicYrFrom).toDate() : null;
  const maxDate = academicYrTo ? dayjs(academicYrTo).toDate() : null;

  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const [loadingForSearch, setLoadingForSearch] = useState(false);

  const navigate = useNavigate();
  const [loadingExams, setLoadingExams] = useState(false);
  const [studentError, setStudentError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [weekError, setWeekError] = useState(false);
  const [currentPage, setCurrentPage] = useState();

  const [timetable, setTimetable] = useState([]);

  const pageSize = 10;
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [teacher, setTeacher] = useState([]);

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [classError, setClassError] = useState("");

  const [weekRange, setWeekRange] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const datePickerRef = useRef(null);
  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoadingExams(true);
      const token = localStorage.getItem("authToken");

      const response = await axios.get(`${API_URL}/api/get_allstaff`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Staff", response);
      // setStudentNameWithClassId(response?.data || []);
      setStudentNameWithClassId(response?.data?.data || []);
    } catch (error) {
      toast.error("Error fetching Classes");
      console.error("Error fetching Classes:", error);
    } finally {
      setLoadingExams(false);
    }
  };

  const handleDateChange = (date) => {
    setFromDate(date);
    setWeekError("");

    if (date) {
      const startDate = dayjs(date).format("DD-MM-YYYY");
      const endDate = dayjs(date).add(6, "day").format("DD-MM-YYYY");
      setWeekRange(`${startDate} / ${endDate}`);
    } else {
      setWeekRange("");
    }
  };

  const openDatePicker = () => {
    if (datePickerRef.current) {
      datePickerRef.current.setOpen(true);
    }
  };

  const fetchClass = async (teacherId) => {
    try {
      setLoadingExams(true);
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/get_teacherallsubjects?teacher_id=${teacherId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Teacher Timetable:", response?.data);

      const teacherClasses = Array.isArray(response?.data?.data)
        ? response.data.data
        : [];

      setTeacher(teacherClasses);
    } catch (error) {
      toast.error("Error fetching teacher timetable");
      console.error("Error fetching teacher timetable:", error);
    } finally {
      setLoadingExams(false);
    }
  };

  const handleStudentSelect = (selectedOption) => {
    setStudentError("");
    setSelectedStudent(selectedOption);
    setSelectedStudentId(selectedOption?.value);

    if (selectedOption?.value) {
      fetchClass(selectedOption.value);
    }
  };

  const handleClassSelect = (selectedOption) => {
    setClassError(""); // Clear any previous error if any
    setSelectedClass(selectedOption);
    setSelectedClassId(selectedOption?.value); // assuming class ID is stored in `value`
  };

  const studentOptions = useMemo(
    () =>
      Array.isArray(studentNameWithClassId)
        ? studentNameWithClassId.map((cls) => ({
            value: cls?.teacher_id,
            label: `${cls.name}`,
          }))
        : [],
    [studentNameWithClassId]
  );

  const statusMap = {
    I: "Incomplete",
    C: "Complete",
    Y: "Approve",
  };

  const handleSearch = async () => {
    setLoadingForSearch(false);

    if (!selectedStudentId) {
      setStudentError("Please select Teacher Name.");
      setLoadingForSearch(false);
      return;
    }

    setSearchTerm("");

    try {
      const formattedWeek = weekRange;

      console.log("Formatted Week is: --->", formattedWeek);

      setLoadingForSearch(true);
      setTimetable([]);

      const token = localStorage.getItem("authToken");

      const params = {
        staff_id: selectedStudentId,
        week: weekRange,
      };

      console.log(params);
      const response = await axios.get(
        `${API_URL}/api/get_lesson_plan_detailed_report`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      if (!response?.data?.data || response?.data?.data?.length === 0) {
        toast.error("Lesson Plan in Detailed not found.");
        setTimetable([]);
      } else {
        setTimetable(response?.data?.data);
        setPageCount(Math.ceil(response?.data?.data?.length / pageSize));
      }
    } catch (error) {
      console.error("Error fetching Lesson Plan in Detailed:", error);
      toast.error("Error fetching Lesson Plan in Detailed. Please try again.");
    } finally {
      setIsSubmitting(false);
      setLoadingForSearch(false);
    }
  };

  const handlePrint = () => {
    const printTitle = `Lesson Plan in Detailed  ${
      selectedStudent?.label
        ? `List of ${selectedStudent.label}`
        : ": Complete List of All Staff "
    }`;
    const printContent = `
  <div style="font-family: sans-serif; font-size: 12px; padding: 20px;">
    <h2 style="text-align: center; font-weight: bold; font-size: 18px; margin-bottom: 20px;">${printTitle}</h2>

    ${displayedSections
      .map(
        (student, index) => `
        <div style="border: 1px solid #ccc; margin-bottom: 40px; padding: 16px; page-break-inside: avoid;">
          <div style="position: relative; margin-bottom: 10px;">
            <span style="position: absolute; left: 0; top: 50%; transform: translateY(-50%); background: #E0E7FF; color: #3730A3; font-weight: bold; padding: 4px 12px; border-radius: 999px;">${
              index + 1
            }</span>
            <h3 style="text-align: center; color: #C03078; font-size: 16px; font-weight: bold;">Lesson For Class ${
              student.classname
            } ${student.secname}</h3>
          </div>

          <table style="width: 100%;  margin-bottom: 10px;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                ${[
                  "Week",
                  "Class",
                  "Subject",
                  "Sub-Subject",
                  "Period No.",
                  "Lesson",
                  "Name of the Lesson",
                ]
                  .map(
                    (header) =>
                      `<th style="border: 1px solid #ccc; padding: 6px; text-align: center;">${header}</th>`
                  )
                  .join("")}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${
                  student.week_date || ""
                }</td>
                <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${
                  student.classname
                } ${student.secname}</td>
                <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${
                  student.subname
                }</td>
                <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${
                  student.sub_subject || "-"
                }</td>
                <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${
                  student.no_of_periods
                }</td>
                <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${
                  student.chapter_no
                }</td>
                <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${
                  student.chaptername
                }</td>
              </tr>
            </tbody>
          </table>

          <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 10px;">
            ${
              student.non_daily?.length > 0
                ? student.non_daily
                    .map(
                      (item) => `
                <div style="flex: 0 0 200px; min-width: 200px; border: 1px solid #ccc; padding: 8px;">
                  <p style="font-weight: bold; color: #2563EB;">${
                    item.heading
                  }</p>
                  <ul style="padding-left: 16px; margin-top: 4px;">
                    ${item.description
                      .map((desc) => `<li>${desc.trim()}</li>`)
                      .join("")}
                  </ul>
                </div>`
                    )
                    .join("")
                : ""
            }
          </div>

          ${
            student.daily_changes?.length > 0
              ? `
            <div style="display: flex; gap: 16px; margin-bottom: 10px;">
              <div style="flex: 2; border: 1px solid #ccc; padding: 10px;">
                <table style="width: 100%; ">
                  <thead>
                    <tr style="background-color: #f3f4f6;">
                      <th style="border: 1px solid #ccc; padding: 6px; text-align: left;">Start Date</th>
                      <th style="border: 1px solid #ccc; padding: 6px; text-align: left;">${
                        student.daily_changes[0]?.heading || "Teaching Points"
                      }</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${student.daily_changes[0].entries
                      .map(
                        (entry) => `
                        <tr>
                          <td style="border: 1px solid #ccc; padding: 6px;">${entry.start_date}</td>
                          <td style="border: 1px solid #ccc; padding: 6px;">${entry.description[0]}</td>
                        </tr>`
                      )
                      .join("")}
                  </tbody>
                </table>
              </div>
              <div style="flex: 1; border: 1px solid #ccc; padding: 10px;">
                <table style="width: 100%; ">
                  <thead>
                    <tr style="background-color: #f3f4f6;">
                      <th style="border: 1px solid #ccc; padding: 6px; text-align: center;">Status</th>
                      <th style="border: 1px solid #ccc; padding: 6px; text-align: center;">Principal's Approval</th>
                      <th style="border: 1px solid #ccc; padding: 6px; text-align: center;">Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${
                        statusMap[student.status] || "-"
                      }</td>
                      <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${
                        statusMap[student.approve] || "-"
                      }</td>
                      <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${
                        student.remark || "-"
                      }</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>`
              : ""
          }
        </div>
      `
      )
      .join("")}
  </div>
`;

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

    const workbook = XLSX.utils.book_new();

    displayedSections.forEach((student, index) => {
      const classSection = `${student?.classname || ""} ${
        student?.secname || ""
      }`;
      const subject = student?.subname || "-";
      const subSubject = student?.sub_subject || "-";
      const period = student?.no_of_periods || "-";
      const lessonNo = student?.chapter_no || "-";
      const lessonName = student?.chaptername || "-";
      const week = student?.week_date || "-";
      const status = statusMap[student?.status] || "-";
      const approval = statusMap[student?.approve] || "-";
      const remark = student?.remark || "-";

      let sheetData = [];

      // === Table 1: General Info ===
      sheetData.push([
        "Week",
        "Class",
        "Subject",
        "Sub-Subject",
        "Period No.",
        "Lesson",
        "Name of the Lesson",
      ]);
      sheetData.push([
        week,
        classSection,
        subject,
        subSubject,
        period,
        lessonNo,
        lessonName,
      ]);

      // Spacer row
      sheetData.push([]);

      // === Table 2: Non-Daily Points ===
      sheetData.push(["Non-Daily Heading", "Description"]);
      if (student.non_daily?.length > 0) {
        student.non_daily.forEach((item) => {
          const desc = item.description?.join("; ") || "-";
          sheetData.push([item.heading, desc]);
        });
      } else {
        sheetData.push(["-", "-"]);
      }

      sheetData.push([]);

      // === Table 3: Daily Teaching Points ===
      const dailyHeading =
        student.daily_changes?.[0]?.heading || "Teaching Points";
      sheetData.push(["Start Date", dailyHeading]);
      if (student.daily_changes?.[0]?.entries?.length > 0) {
        student.daily_changes[0].entries.forEach((entry) => {
          sheetData.push([
            entry.start_date || "-",
            entry.description?.[0] || "-",
          ]);
        });
      } else {
        sheetData.push(["-", "-"]);
      }

      sheetData.push([]);

      // === Table 4: Status Info ===
      sheetData.push(["Status", "Principal's Approval", "Remark"]);
      sheetData.push([status, approval, remark]);

      const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

      // Set column widths
      const maxCols = Math.max(...sheetData.map((row) => row.length));
      const columnWidths = new Array(maxCols).fill({ wch: 30 });
      worksheet["!cols"] = columnWidths;

      // Add to workbook
      const sheetName = `Lesson_${index + 1}_${classSection.trim()}`.slice(
        0,
        31
      ); // Excel max sheet name = 31 chars
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    const fileName = `Lesson_Plan_Detailed_Report_${
      selectedStudent?.label || "All_Teacher"
    }.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  console.log("row", timetable);

  const filteredSections = timetable.filter((student) => {
    const searchLower = searchTerm.replace(/\s+/g, "").toLowerCase();

    const classAndSection = (
      (student?.classname || "") + (student?.secname || "")
    )
      .replace(/\s+/g, "")
      .toLowerCase();

    // Flattened values
    const flatValues = [
      student?.teachername,
      student?.week,
      student?.subname,
      student?.sub_subject,
      student?.no_of_periods?.toString(),
      student?.chapter_no?.toString(),
      student?.chaptername,
      student?.status,
      student?.approve,
      student?.remark,
      classAndSection,
    ]
      .filter(Boolean)
      .map((val) => val.toString().toLowerCase());

    // Add values from non_daily (heading + description)
    if (Array.isArray(student.non_daily)) {
      student.non_daily.forEach((item) => {
        if (item.heading) flatValues.push(item.heading.toLowerCase());
        if (Array.isArray(item.description)) {
          item.description.forEach((desc) =>
            flatValues.push(desc.toLowerCase())
          );
        }
      });
    }

    // Add values from daily_changes (heading + description)
    if (Array.isArray(student.daily_changes)) {
      student.daily_changes.forEach((change) => {
        if (change.heading) flatValues.push(change.heading.toLowerCase());
        if (Array.isArray(change.entries)) {
          change.entries.forEach((entry) => {
            if (Array.isArray(entry.description)) {
              entry.description.forEach((desc) =>
                flatValues.push(desc.toLowerCase())
              );
            }
            if (entry.start_date)
              flatValues.push(entry.start_date.toLowerCase());
          });
        }
      });
    }

    // Return if any value contains the search term
    return flatValues.some((val) => val.includes(searchLower));
  });

  const displayedSections = filteredSections.slice(currentPage * pageSize);
  return (
    <>
      {/* <div className="w-full md:w-[100%] mx-auto p-4 "> */}
      <div
        className={`mx-auto p-4 transition-all duration-700 ease-[cubic-bezier(0.4, 0, 0.2, 1)] transform ${
          timetable.length > 0
            ? "w-full md:w-[100%] scale-100"
            : "w-full md:w-[80%] scale-[0.98]"
        }`}
      >
        <ToastContainer />
        <div className="card p-1 rounded-md ">
          <div className=" card-header mb-4 flex justify-between items-center ">
            <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
              Lesson Plan In Detailed
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
            {/* <div className=" w-full md:w-[95%]   flex justify-center flex-col md:flex-row gap-x-1     ml-0    p-2"> */}
            <div
              className={`  flex justify-between flex-col md:flex-row gap-x-1 ml-0 p-2  ${
                timetable.length > 0
                  ? "pb-0 w-full md:w-[99%]"
                  : "pb-4 w-full md:w-[80%]"
              }`}
            >
              <div className="w-full md:w-[100%] flex md:flex-row justify-between items-center mt-0 md:mt-4">
                <div className="w-full md:w-[90%] gap-x-0 md:gap-x-12 flex flex-col gap-y-2 md:gap-y-0 md:flex-row">
                  {/* Staff Dropdown */}
                  <div className="w-full  md:w-[50%] gap-x-2 justify-around my-1 md:my-4 flex md:flex-row">
                    <label
                      className="w-full md:w-[30%] text-md pl-0 md:pl-5 mt-1.5"
                      htmlFor="studentSelect"
                    >
                      Teacher <span className="text-red-500">*</span>
                    </label>
                    <div className="w-full md:w-[65%]">
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
                            fontSize: ".9em", // Adjust font size for selected value
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

                  <div className="w-full md:w-[50%] gap-x-4 justify-between my-1 md:my-4 flex md:flex-row">
                    <label
                      className="ml-0 md:ml-4 w-full md:w-[50%] text-md mt-1.5"
                      htmlFor="fromDate"
                    >
                      Select Week{" "}
                      {/* <span className="text-sm text-red-500">*</span> */}
                    </label>
                    <div className="w-full">
                      <div
                        className="text-sm text-gray-700 mt-0.5 border border-gray-300 p-2 rounded cursor-pointer"
                        onClick={openDatePicker}
                      >
                        {weekRange || (
                          <FaRegCalendarAlt className="text-pink-500" />
                        )}
                      </div>

                      {weekError && (
                        <div className="relative ml-1 text-danger text-xs">
                          {weekError}
                        </div>
                      )}

                      <DatePicker
                        ref={datePickerRef}
                        selected={fromDate}
                        onChange={handleDateChange}
                        dateFormat="dd-MM-yyyy"
                        minDate={minDate}
                        maxDate={maxDate}
                        className="outline-none relative -top-10 text-sm w-[1px] h-[1px] bg-white"
                      />
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
              {timetable.length > 0 && (
                <div className="p-2 px-3  bg-gray-100 border-none flex justify-between items-center">
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
                <div className="w-full mt-3">
                  <div className="card mx-auto lg:w-full shadow-lg">
                    <div className="card-body w-full">
                      <div
                        className="h-96 lg:h-96 overflow-y-scroll overflow-x-scroll"
                        style={{
                          scrollbarWidth: "thin",
                          scrollbarColor: "#C03178 transparent",
                        }}
                      >
                        <div className="flex justify-end items-center px-2">
                          <label className="flex items-center gap-2 text-sm font-semibold text-indigo-600">
                            Total Lesson Plans: {displayedSections.length || 0}
                          </label>
                        </div>

                        {Array.isArray(displayedSections) &&
                        displayedSections.length > 0 ? (
                          displayedSections.map((student, index) => (
                            <div
                              key={index}
                              className="mb-3 border rounded-lg shadow-md p-2"
                            >
                              {/* Heading: Lesson For [Classname Section] */}
                              <div className="relative mb-3">
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 bg-indigo-100 text-indigo-700 text-sm px-3 py-1 rounded-full shadow">
                                  {index + 1}
                                </span>
                                <h2 className="text-lg font-semibold text-center text-[#C03078]">
                                  Lesson For Class {student.classname}{" "}
                                  {student.secname}
                                </h2>
                              </div>

                              {/* Table 1: General Info */}
                              <table className="w-full table-auto border border-gray-500 mb-4">
                                <thead className="bg-gray-200">
                                  <tr>
                                    {[
                                      "Week",
                                      "Subject",
                                      "Sub-Subject",
                                      "Period No.",
                                      "Lesson",
                                      "Name of the Lesson",
                                    ].map((header, i) => (
                                      <th
                                        key={i}
                                        className="px-4 py-2 border text-sm font-semibold text-center text-gray-800"
                                      >
                                        {header}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="text-center text-sm text-gray-700">
                                    <td className="border px-4 py-2">
                                      {student.week_date}
                                    </td>
                                    <td className="border px-4 py-2">
                                      {student.subname}
                                    </td>
                                    <td className="border px-4 py-2">
                                      {student.sub_subject || "-"}
                                    </td>
                                    <td className="border px-4 py-2">
                                      {student.no_of_periods}
                                    </td>
                                    <td className="border px-4 py-2">
                                      {student.chapter_no}
                                    </td>
                                    <td className="border px-4 py-2">
                                      {student.chaptername}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>

                              {/* Table 2: Non Daily Sections */}
                              <div className="flex flex-row gap-4 overflow-x-auto mb-4">
                                {student.non_daily?.map((item, i) => (
                                  <div
                                    key={i}
                                    className="w-[200px] min-w-[200px] border p-3 rounded shadow-sm bg-white flex-shrink-0"
                                  >
                                    <p className="font-semibold text-blue-700">
                                      {item.heading}
                                    </p>
                                    <ul className="text-sm mt-1 text-gray-800 space-y-1">
                                      {item.description?.map((desc, j) => (
                                        <li key={j}>{desc.trim()}</li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>

                              {/* Table 3: Daily Teaching Points */}
                              {student.daily_changes?.length > 0 && (
                                <div className="flex flex-row gap-4 mb-4">
                                  <div className="w-2/3 border p-3 rounded bg-gray-50">
                                    <table className="w-full table-auto  text-sm">
                                      <thead>
                                        <tr className="bg-gray-200">
                                          <th className="border px-4 py-2 text-left w-1/3 text-sm font-semibold text-gray-800">
                                            Start Date
                                          </th>
                                          <th className="border px-4 py-2 text-left text-sm font-semibold text-gray-800">
                                            {student.daily_changes[0]
                                              ?.heading || "Teaching Points"}
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {student.daily_changes[0]?.entries.map(
                                          (entry, idx) => (
                                            <tr
                                              key={idx}
                                              className="even:bg-white odd:bg-gray-50"
                                            >
                                              <td className="border px-4 py-2">
                                                {entry.start_date}
                                              </td>
                                              <td className="border px-4 py-2">
                                                {entry.description[0]}
                                              </td>
                                            </tr>
                                          )
                                        )}
                                      </tbody>
                                    </table>
                                  </div>

                                  {/* Table 4: Status Section */}
                                  <div className="w-1/3 border p-3 rounded bg-gray-50">
                                    <table className="w-full table-auto  text-sm">
                                      <thead>
                                        <tr className="bg-gray-200">
                                          <th className="px-4 py-2 border text-sm font-semibold text-center text-gray-800">
                                            Status
                                          </th>
                                          <th className="px-4 py-2 border text-sm font-semibold text-center text-gray-800">
                                            Principal's Approval
                                          </th>
                                          <th className="px-4 py-2 border text-sm font-semibold text-center text-gray-800">
                                            Remark
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        <tr className="even:bg-white odd:bg-gray-50 text-center">
                                          <td className="border px-2 py-2">
                                            {statusMap[student.status]}
                                          </td>
                                          <td className="border px-2 py-2">
                                            {statusMap[student.approve]}
                                          </td>
                                          <td className="border px-2 py-2">
                                            {student.remark || "-"}
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="absolute left-[1%] w-[100%] text-center flex justify-center items-center mt-14">
                            <div className="text-center text-xl text-red-700">
                              Oops! No data found..
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end gap-4 pr-3 mb-4 mr-10">
                      <button
                        onClick={() => navigate("/dashboard")}
                        className="bg-yellow-300 hover:bg-yellow-400 text-white font-semibold px-4 py-2 rounded"
                      >
                        Back
                      </button>
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

export default LessonPlanDetailedView;
