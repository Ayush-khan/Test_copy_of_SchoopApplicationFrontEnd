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

const ApproveLessonP = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [selectedStudent, setSelectedStudent] = useState(null);
  const academicYrFrom = localStorage.getItem("academic_yr_from");
  const academicYrTo = localStorage.getItem("academic_yr_to");

  const minDate = academicYrFrom ? dayjs(academicYrFrom).toDate() : null;
  const maxDate = academicYrTo ? dayjs(academicYrTo).toDate() : null;

  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const [loadingForSearch, setLoadingForSearch] = useState(false);
  const [loading, setLoading] = useState(null);

  const navigate = useNavigate();
  const [loadingExams, setLoadingExams] = useState(false);
  const [studentError, setStudentError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [weekError, setWeekError] = useState(false);
  const [currentPage, setCurrentPage] = useState();

  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedMonthId, setSelectedMonthId] = useState("");
  const [timetable, setTimetable] = useState([]);

  const pageSize = 10;
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [teacher, setTeacher] = useState([]);

  const [selectedApprovals, setSelectedApprovals] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [studentRemarks, setStudentRemarks] = useState({});
  const [showStudentReport, setShowStudentReport] = useState(false);

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

      const response = await axios.get(
        `${API_URL}/api/get_lesson_plan_created_teachers`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Staff", response);
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
      // Find Monday of the week
      const monday = dayjs(date).startOf("week").add(1, "day"); // dayjs startOf('week') defaults to Sunday, so +1 day is Monday
      const sunday = monday.add(6, "day");

      const startDate = monday.format("DD-MM-YYYY");
      const endDate = sunday.format("DD-MM-YYYY");

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
    setWeekError("");
    setSelectedMonth(selectedOption);
    setSelectedMonthId(selectedOption?.value);
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
      toast.error("Error fetching teacher ");
      console.error("Error fetching teacher :", error);
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

  const camelCase = (str) =>
    str
      ?.toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const handleSearch = async () => {
    setLoadingForSearch(false);
    setLoading(true);

    if (!selectedStudentId) {
      setStudentError("Please select Teacher Name.");
      setLoadingForSearch(false);
      return;
    }

    //  New condition: Either weekRange OR selectedMonthId must be filled
    if (!weekRange && !selectedMonthId) {
      toast.error("Please select either Week or Month.");
      setWeekError("Please select either Week or Month.");
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
        month: selectedMonthId,
      };

      console.log(params);
      const response = await axios.get(
        `${API_URL}/api/get_approvelessonplandata`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      if (!response?.data?.data || response?.data?.data?.length === 0) {
        toast.error("Approve Lesson Plan not found.");
        setTimetable([]);
        // setShowStudentReport(false);
      } else {
        setTimetable(response?.data?.data);
        setPageCount(Math.ceil(response?.data?.data?.length / pageSize));
        setShowStudentReport(true);
      }
    } catch (error) {
      console.error("Error fetching Approve Lesson Plan:", error);
      toast.error("Error fetching Approve Lesson Plan. Please try again.");
    } finally {
      setIsSubmitting(false);
      setLoadingForSearch(false);
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedApprovals([]);
    } else {
      const allSelected = displayedSections.map((student) => ({
        lesson_plan_id: student.lesson_plan_id,
        unq_id: student.unq_id,
        remark: studentRemarks[student.lesson_plan_id] || "",
      }));
      setSelectedApprovals(allSelected);
    }
    setSelectAll(!selectAll);
  };

  const handleApprovalChange = (student) => {
    const exists = selectedApprovals.find(
      (item) => item.lesson_plan_id === student.lesson_plan_id
    );

    let updated;

    if (exists) {
      updated = selectedApprovals.filter(
        (item) => item.lesson_plan_id !== student.lesson_plan_id
      );
    } else {
      updated = [
        ...selectedApprovals,
        {
          lesson_plan_id: student.lesson_plan_id,
          unq_id: student.unq_id,
          remark: studentRemarks[student.lesson_plan_id] || "",
        },
      ];
    }

    setSelectedApprovals(updated);
    setSelectAll(updated.length === displayedSections.length);
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("authToken");
    const plansToSubmit = displayedSections
      .filter((student) =>
        selectedApprovals.some(
          (approval) => approval.lesson_plan_id === student.lesson_plan_id
        )
      )

      .map((student) => ({
        lesson_plan_id: student.lesson_plan_id,
        unq_id: student.unq_id,
        remark: studentRemarks[student.lesson_plan_id] || "",
      }));

    if (plansToSubmit.length === 0) {
      toast.error("Please select at least one lesson plan to approve.");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/update_approvelessonplanstatus`,
        {
          teacher_id: selectedStudentId,
          plans: plansToSubmit,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.status === 200) {
        toast.success("Lesson plans updated successfully.");
        setShowStudentReport(false);
      } else {
        toast.error("Failed to update lesson plans.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while submitting the data.");
    }
  };

  const handlePrint = () => {
    const printTitle = `Approve Lesson Plan  ${
      camelCase(selectedStudent?.label)
        ? `List of ${camelCase(selectedStudent.label)}`
        : ": Complete List of All Teacher "
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
                            <td style="border: 1px solid #ccc; padding: 6px;">${
                              entry.start_date
                            }</td>
                           <td style="border: 1px solid #ccc; padding: 6px;">
            ${entry.description.map((point) => point).join("<br>")}
          </td>
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
            entry.description ? entry.description.join("\n") : "-",
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

    const fileName = `Approve_Lesson_Plan_${
      camelCase(selectedStudent?.label) || "All_Teacher"
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

    const flatValues = [
      student?.teachername,
      student?.subname,
      student?.sub_subject,
      student?.no_of_periods?.toString(),
      student?.chapter_no?.toString(),
      student?.chaptername,
      student?.status,
      student?.approve,
      student?.remark,
      student?.week_date,
      classAndSection,
    ]
      .filter(Boolean)
      .map((val) => val.toString().trim().replace(/\s+/g, "").toLowerCase());

    // Handle week specially for format like 16-06-2025 / 22-06-2025
    if (student?.week_date) {
      const weekStr = student.week_date.toString().trim();
      flatValues.push(
        weekStr.replace(/\s+/g, "").toLowerCase() // 16-06-2025/22-06-2025
      );
      flatValues.push(
        weekStr.toLowerCase() // original spacing preserved (for partial match like "16-06-2025 / 22")
      );
    }

    // non_daily
    if (Array.isArray(student.non_daily)) {
      student.non_daily.forEach((item) => {
        if (item.heading)
          flatValues.push(
            item.heading.trim().replace(/\s+/g, "").toLowerCase()
          );
        if (Array.isArray(item.description)) {
          item.description.forEach((desc) =>
            flatValues.push(desc.trim().replace(/\s+/g, "").toLowerCase())
          );
        }
      });
    }

    // daily_changes
    if (Array.isArray(student.daily_changes)) {
      student.daily_changes.forEach((change) => {
        if (change.heading)
          flatValues.push(
            change.heading.trim().replace(/\s+/g, "").toLowerCase()
          );
        if (Array.isArray(change.entries)) {
          change.entries.forEach((entry) => {
            if (Array.isArray(entry.description)) {
              entry.description.forEach((desc) =>
                flatValues.push(desc.trim().replace(/\s+/g, "").toLowerCase())
              );
            }
            if (entry.start_date)
              flatValues.push(entry.start_date.trim().toLowerCase());
          });
        }
      });
    }

    return flatValues.some((val) => val.includes(searchLower));
  });

  const displayedSections = filteredSections.slice(currentPage * pageSize);
  return (
    <>
      <div
        className={` transition-all duration-500 w-[95%]  mx-auto p-4 ${
          showStudentReport ? "w-full " : "w-[90%] "
        }`}
      >
        <ToastContainer />
        <div className="card pb-4  rounded-md ">
          {!showStudentReport && (
            <>
              <div className=" card-header mb-4 flex justify-between items-center ">
                <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
                  Approve Lesson Plan
                </h5>
                <RxCross1
                  className=" relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                  onClick={() => setShowStudentReport(false)}
                />
              </div>
              <div
                className=" relative w-[97%]   -top-6 h-1  mx-auto bg-red-700"
                style={{
                  backgroundColor: "#C03078",
                }}
              ></div>
            </>
          )}
          <>
            {!showStudentReport && (
              <div className=" w-full md:w-[100%]   flex justify-center flex-col md:flex-row gap-x-1 ml-0 p-2">
                <div className="w-full md:w-[99%] flex md:flex-row justify-between items-center mt-0 md:mt-4">
                  <div className="w-full md:w-[99%]  gap-x-0 md:gap-x-12 flex flex-col gap-y-2 md:gap-y-0 md:flex-row">
                    {/* Teacher */}
                    <div className="w-full  md:w-[50%] gap-x-3 justify-around my-1 md:my-4 flex md:flex-row">
                      <label
                        className="w-full md:w-[35%] text-md pl-0 md:pl-5 mt-1.5"
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
                    {/* Month */}
                    <div className="w-full  md:w-[40%] gap-x-3 justify-around my-1 md:my-4 flex md:flex-row">
                      <label
                        className="w-full md:w-[35%] text-md pl-0 md:pl-5 mt-1.5"
                        htmlFor="studentSelect"
                      >
                        Month<span className="text-red-500">*</span>
                      </label>
                      <div className="w-full md:w-[65%]">
                        <Select
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          id="studentSelect"
                          value={selectedMonth}
                          onChange={handleMonthSelect}
                          options={monthOptions}
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
                        {/* {weekError && (
                                              <div className="relative ml-1 text-danger text-xs">
                                                {weekError}
                                              </div>
                                            )} */}
                      </div>
                    </div>
                    {/* OR */}
                    <div className="justify-around my-1 md:my-6 flex md:flex-row">
                      <span className="text-red-500 font-bold">OR</span>
                    </div>
                    {/* Week */}
                    <div className="w-full md:w-[60%] gap-x-4 justify-between my-1 md:my-4 flex md:flex-row">
                      <label
                        className="ml-0 md:ml-4 w-full md:w-[50%] text-md mt-1.5"
                        htmlFor="fromDate"
                      >
                        Select Week<span className="text-red-500">*</span>
                      </label>
                      <div className="w-full">
                        <div className="relative text-sm text-gray-700 mt-0.5 border border-gray-300 p-2 rounded flex items-center justify-between cursor-pointer">
                          <div
                            onClick={openDatePicker}
                            className="flex-1 flex items-center"
                          >
                            {weekRange ? (
                              <span>{weekRange}</span>
                            ) : (
                              <FaRegCalendarAlt className="text-pink-500" />
                            )}
                          </div>

                          {weekRange && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // prevent openDatePicker when clicking X
                                setFromDate(null);
                                setWeekRange("");
                              }}
                              className="text-gray-400 hover:text-red-500 ml-2"
                            >
                              <RxCross1 className="text-xs text-red-600 " />
                            </button>
                          )}
                        </div>

                        {/* {weekError && (
                                              <div className="relative ml-1 text-danger text-xs">
                                                {weekError}
                                              </div>
                                            )} */}

                        {/* Keep your DatePicker hidden but functional */}
                        <DatePicker
                          ref={datePickerRef}
                          selected={fromDate}
                          onChange={handleDateChange}
                          dateFormat="dd-MM-yyyy"
                          className="hidden"
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
            )}

            {showStudentReport && (
              <>
                {/* {timetable.length > 0 && ( */}
                <>
                  <div className="w-full  mx-auto transition-all duration-300">
                    <div className="card mx-auto shadow-lg">
                      <div className="p-2 px-3 bg-gray-100 border-none flex items-center justify-between">
                        <div className="w-full flex flex-row items-center justify-between mr-0 md:mr-4 gap-x-1">
                          <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap mr-6">
                            Approve Lesson Plan
                          </h3>
                          <div className="flex items-center w-full">
                            <div
                              className="bg-blue-50 border-l-2 border-r-2 text-[1em] border-pink-500 rounded-md shadow-md mx-auto px-6 py-2"
                              style={{
                                overflowX: "auto",
                                whiteSpace: "nowrap",
                              }}
                            >
                              <div
                                className="flex items-center gap-x-4 text-blue-800 font-medium"
                                style={{ flexWrap: "nowrap" }}
                              >
                                {/* Teacher */}
                                <div className="flex items-center gap-2">
                                  <label
                                    className="text-md whitespace-nowrap"
                                    htmlFor="studentSelect"
                                  >
                                    Teacher{" "}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <Select
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    id="studentSelect"
                                    value={selectedStudent}
                                    onChange={handleStudentSelect}
                                    options={studentOptions}
                                    placeholder={
                                      loadingExams ? "Loading..." : "Select"
                                    }
                                    isSearchable
                                    isClearable
                                    className="text-sm min-w-[180px]"
                                    isDisabled={loadingExams}
                                    styles={{
                                      control: (provided) => ({
                                        ...provided,
                                        fontSize: ".9em",
                                        minHeight: "30px",
                                      }),
                                      menu: (provided) => ({
                                        ...provided,
                                        fontSize: "1em",
                                      }),
                                      option: (provided) => ({
                                        ...provided,
                                        fontSize: ".9em",
                                      }),
                                    }}
                                  />
                                </div>

                                {/* Month */}
                                <div className="flex items-center gap-3">
                                  <label
                                    className="text-md whitespace-nowrap"
                                    htmlFor="monthSelect"
                                  >
                                    Month{" "}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <Select
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    id="monthSelect"
                                    value={selectedMonth}
                                    onChange={handleMonthSelect}
                                    options={monthOptions}
                                    placeholder={
                                      loadingExams ? "Loading..." : "Select"
                                    }
                                    isSearchable
                                    isClearable
                                    className="text-sm min-w-[180px]"
                                    isDisabled={loadingExams}
                                    styles={{
                                      control: (provided) => ({
                                        ...provided,
                                        fontSize: ".9em",
                                        minHeight: "30px",
                                      }),
                                      menu: (provided) => ({
                                        ...provided,
                                        fontSize: "1em",
                                      }),
                                      option: (provided) => ({
                                        ...provided,
                                        fontSize: ".9em",
                                      }),
                                    }}
                                  />
                                </div>

                                {/* Week */}
                                <div className="flex items-center gap-3">
                                  <label
                                    className="text-md whitespace-nowrap"
                                    htmlFor="fromDate"
                                  >
                                    Week <span className="text-red-500">*</span>
                                  </label>
                                  <div className="relative text-sm text-gray-700 border border-gray-300 p-2 rounded flex items-center justify-between cursor-pointer min-w-[160px]">
                                    <div
                                      onClick={openDatePicker}
                                      className="flex-1 flex items-center"
                                    >
                                      {weekRange ? (
                                        <span>{weekRange}</span>
                                      ) : (
                                        <FaRegCalendarAlt className="text-pink-500" />
                                      )}
                                    </div>
                                    {weekRange && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setFromDate(null);
                                          setWeekRange("");
                                        }}
                                        className="text-gray-400 hover:text-red-500 ml-2"
                                      >
                                        <RxCross1 className="text-xs text-red-600" />
                                      </button>
                                    )}
                                  </div>
                                  <DatePicker
                                    ref={datePickerRef}
                                    selected={fromDate}
                                    onChange={handleDateChange}
                                    dateFormat="dd-MM-yyyy"
                                    className="hidden"
                                  />
                                </div>
                                {/* Browse */}
                                <div>
                                  <button
                                    type="search"
                                    onClick={handleSearch}
                                    style={{ backgroundColor: "#2196F3" }}
                                    className={`btn h-8 w-auto btn-primary text-white font-bold py-1 border-1 border-blue-500 px-2 rounded ${
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
                        </div>

                        <div className="flex mb-1.5 flex-col md:flex-row gap-x-6 justify-center md:justify-end ">
                          <RxCross1
                            className="text-base text-red-600 cursor-pointer hover:bg-red-100 rounded"
                            onClick={() => setShowStudentReport(false)}
                          />
                        </div>
                      </div>
                      <div
                        className=" w-[97%] h-1 mx-auto"
                        style={{ backgroundColor: "#C03078" }}
                      ></div>

                      <div className="card-body w-full">
                        <div
                          className="h-96 lg:h-96 overflow-y-scroll overflow-x-scroll"
                          style={{
                            scrollbarWidth: "thin",
                            scrollbarColor: "#C03178 transparent",
                          }}
                        >
                          <div
                            className="flex flex-col md:flex-row justify-between items-center px-2 py-1 gap-2 
                                         sticky top-0 bg-white shadow"
                          >
                            {/* Select All */}
                            <label className="flex items-center gap-2 text-sm font-semibold text-indigo-600">
                              <input
                                type="checkbox"
                                checked={selectAll}
                                onChange={handleSelectAll}
                              />
                              Select All lesson plan for approve
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                className="form-control w-32 md:w-48 py-1"
                                placeholder="Search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                              />
                              <button
                                type="button"
                                onClick={handleDownloadEXL}
                                className="relative bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded group"
                              >
                                <FaFileExcel />
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex items-center justify-center bg-gray-700 text-white text-xs text-nowrap rounded-md py-1 px-2">
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

                          {loading ? (
                            <div className="absolute left-[4%] w-[100%] text-center flex justify-center items-center mt-14">
                              <div className="text-center text-xl text-blue-700">
                                Please wait while data is loading...
                              </div>
                            </div>
                          ) : Array.isArray(displayedSections) &&
                            displayedSections.length > 0 ? (
                            displayedSections.map((student, index) => (
                              <div
                                key={index}
                                className="mb-10 border rounded-lg shadow-md p-1"
                              >
                                {/* Heading: Lesson For [Classname Section] */}
                                <div className="relative">
                                  <span className="absolute left-0 top-3 -translate-y-1/2 bg-indigo-100 text-indigo-700 text-sm px-3 py-1 rounded-full shadow">
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

                                <div
                                  className="overflow-x-auto mb-4"
                                  style={{
                                    overflowX: "auto",
                                    scrollbarWidth: "none", // hides Firefox scrollbar
                                    msOverflowStyle: "none", // hides IE/Edge scrollbar
                                  }}
                                >
                                  <div
                                    className="min-w-max"
                                    style={{
                                      overflowX: "auto",
                                      scrollbarWidth: "none",
                                      msOverflowStyle: "none",
                                    }}
                                  >
                                    <table className="table-fixed border border-gray-500">
                                      <thead className="bg-gray-200">
                                        <tr>
                                          {student.non_daily?.map((item, i) => (
                                            <th
                                              key={i}
                                              className={`px-6 py-2 border text-sm font-semibold text-center text-gray-800 ${
                                                i ===
                                                student.non_daily.length - 1
                                                  ? "sticky left-0 bg-gray-200"
                                                  : ""
                                              }`}
                                              style={{ width: "210" }}
                                            >
                                              {item.heading}
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {Array.from({
                                          length: Math.max(
                                            ...student.non_daily.map(
                                              (item) =>
                                                item.description?.length || 0
                                            )
                                          ),
                                        }).map((_, rowIndex) => (
                                          <tr
                                            key={rowIndex}
                                            className="text-left text-sm text-gray-700"
                                          >
                                            {student.non_daily.map(
                                              (item, colIndex) => (
                                                <td
                                                  key={colIndex}
                                                  className={`border px-2 py-1 ${
                                                    colIndex ===
                                                    student.non_daily.length - 1
                                                      ? "sticky left-0 bg-white"
                                                      : ""
                                                  }`}
                                                  style={{ width: "210px" }}
                                                >
                                                  {item.description?.[
                                                    rowIndex
                                                  ] || ""}
                                                </td>
                                              )
                                            )}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                  {/* Hide Chrome/Safari scrollbar */}
                                  <style>
                                    {`
                                         .overflow-x-auto::-webkit-scrollbar {
                                           display: none;
                                           }
                                      `}
                                  </style>
                                </div>

                                {/* Table 3: Daily Teaching Points */}
                                {student.daily_changes?.length > 0 && (
                                  <div className="flex flex-row gap-4 mb-4">
                                    <div className="w-2/3 border p-3 rounded bg-gray-50">
                                      <table className="w-full table-auto border-collapse text-sm">
                                        <thead>
                                          <tr className="bg-gray-200">
                                            <th className="border px-4 py-2 text-left w-[19%] text-sm font-semibold text-gray-800">
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
                                                <td className="border py-2">
                                                  <ul className=" space-y-1 ">
                                                    {entry.description.map(
                                                      (point, i) => (
                                                        <li key={i}>{point}</li>
                                                      )
                                                    )}
                                                  </ul>
                                                </td>
                                              </tr>
                                            )
                                          )}
                                        </tbody>
                                      </table>
                                    </div>

                                    {/* Table 4: Status Section */}
                                    {displayedSections.length > 0 && (
                                      <div className="w-1/3 border p-3 rounded bg-gray-50">
                                        <table className="w-full table-auto border-collapse text-sm">
                                          <thead>
                                            <tr className="bg-gray-200">
                                              <th className="px-4 py-2 border text-sm font-semibold text-center text-gray-800">
                                                Status
                                              </th>
                                              <th className="px-4 py-2 border text-sm font-semibold text-center text-gray-800">
                                                Principal's Approval
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {/* Status + Approval Row */}
                                            <tr className="even:bg-white odd:bg-gray-50 text-center">
                                              {/* Status */}
                                              <td className="border px-2 py-3">
                                                {statusMap[student.status]}
                                              </td>

                                              {/* Principal's Approval */}
                                              <td className="border px-2 py-3">
                                                <div className="flex justify-center items-center gap-2">
                                                  <input
                                                    type="checkbox"
                                                    checked={selectedApprovals.some(
                                                      (item) =>
                                                        item.lesson_plan_id ===
                                                        student.lesson_plan_id
                                                    )}
                                                    onChange={() =>
                                                      handleApprovalChange(
                                                        student
                                                      )
                                                    }
                                                  />
                                                  <span>Approve</span>
                                                </div>
                                              </td>
                                            </tr>

                                            {/* Remark Label Row */}
                                            <tr className="bg-gray-200">
                                              <th
                                                colSpan={2}
                                                className="px-4 py-2 border text-sm font-semibold text-left text-gray-800"
                                              >
                                                Remark
                                              </th>
                                            </tr>

                                            {/* Remark Input Row */}
                                            <tr>
                                              <td
                                                colSpan={2}
                                                className="border px-2 py-2"
                                              >
                                                <textarea
                                                  rows={4}
                                                  className="border rounded px-2 py-3 w-full text-sm resize-y"
                                                  value={
                                                    studentRemarks[
                                                      student.lesson_plan_id
                                                    ] || ""
                                                  }
                                                  onChange={(e) => {
                                                    const remark =
                                                      e.target.value;
                                                    setStudentRemarks(
                                                      (prev) => ({
                                                        ...prev,
                                                        [student.lesson_plan_id]:
                                                          remark,
                                                      })
                                                    );

                                                    // Update remark in selectedApprovals if already selected
                                                    setSelectedApprovals(
                                                      (prev) =>
                                                        prev.map((item) =>
                                                          item.lesson_plan_id ===
                                                          student.lesson_plan_id
                                                            ? {
                                                                ...item,
                                                                remark,
                                                              }
                                                            : item
                                                        )
                                                    );
                                                  }}
                                                  placeholder="Enter remark"
                                                  maxLength={1000}
                                                />
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </div>
                                    )}
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
                          // onClick={() => navigate("/dashboard")}
                          onClick={() => setShowStudentReport(false)}
                          className="bg-yellow-300 hover:bg-yellow-400 text-white font-semibold px-4 py-2 rounded"
                        >
                          Back
                        </button>
                        <button
                          onClick={handleSubmit}
                          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded"
                        >
                          {loading ? "Saving" : "Save"}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
                {/* )} */}
              </>
            )}
          </>
        </div>
      </div>
    </>
  );
};

export default ApproveLessonP;
