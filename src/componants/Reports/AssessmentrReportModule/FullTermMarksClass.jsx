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

const FullTermMarksClass = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedMonthId, setSelectedMonthId] = useState(null);
  const [students, setStudents] = useState([]);
  const [showStudentReport, setShowStudentReport] = useState(false);
  const [roleId, setRoleId] = useState(null);
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
  const [regId, setRegId] = useState(null);
  const pageSize = 10;
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [examOptions, setExamOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [loadingExamsData, setLoadingExamsData] = useState(false);
  const [loadingSubjectsData, setLoadingSubjectsData] = useState(false);

  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  useEffect(() => {
    const init = async () => {
      const sessionData = await fetchRoleId();

      if (sessionData) {
        await fetchClass(sessionData.roleId, sessionData.regId);
      }
    };

    init();
  }, []);
  const fetchRoleId = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      toast.error("Authentication token not found. Please login again.");
      navigate("/");
      return null; // ⛔ Prevent execution if no token
    }

    try {
      const response = await axios.get(`${API_URL}/api/sessionData`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const roleId = response?.data?.user?.role_id;
      const regId = response?.data?.user?.reg_id;

      if (roleId) {
        setRoleId(roleId); // Optional: still store in state
        setRegId(regId);
        return { roleId, regId }; // ✅ return both
      } else {
        console.warn("role_id not found in sessionData response");
        return null;
      }
    } catch (error) {
      console.error("Failed to fetch session data:", error);
      return null;
    }
  };

  const fetchClass = async (roleId, regId) => {
    const token = localStorage.getItem("authToken");
    setLoadingExams(true);

    try {
      if (roleId === "T") {
        const response = await axios.get(
          `${API_URL}/api/get_teacherclasstimetable?teacher_id=${regId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const mappedData = response.data.data.map((item) => ({
          section_id: item.section_id,
          class_id: item.class_id,
          get_class: { name: item.classname }, // mimic original structure
          name: item.sectionname,
        }));

        setStudentNameWithClassId(mappedData || []);
      } else {
        const response = await axios.get(`${API_URL}/api/get_class_section`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setStudentNameWithClassId(response?.data || []);
      }
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
  const handleClassSelect = async (selectedOption) => {
    setStudentError("");
    setSelectedStudent(selectedOption);
    setSelectedStudentId(selectedOption?.value);

    // Clear previous selections and show loading
    setExamOptions([]);
    setSubjectOptions([]);
    setSelectedExam(null);
    setSelectedSubject(null);

    if (!selectedOption) return;

    const class_id = selectedOption?.valueclass;
    const section_id = selectedOption?.value;

    setLoadingExamsData(true);
    setLoadingSubjectsData(true);

    await Promise.all([
      fetchExamsByClassId(class_id),
      fetchSubjectsByClassAndSection(class_id, section_id),
    ]);

    setLoadingExamsData(false);
    setLoadingSubjectsData(false);
  };

  const fetchExamsByClassId = async (classId) => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.get(
        `${API_URL}/api/get_exambyclassid?class_id=${classId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const mappedExams =
        response?.data?.data?.map((exam) => ({
          label: exam.name,
          value: exam?.exam_id,
        })) || [];

      setExamOptions(mappedExams);
    } catch (err) {
      console.error("Error fetching exams:", err);
    }
  };

  const fetchSubjectsByClassAndSection = async (classId, sectionId) => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.get(
        `${API_URL}/api/get_reportsubjectbyclasssection?class_id=${classId}&section_id=${sectionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const mappedSubjects =
        response?.data?.data?.map((subject) => ({
          label: subject.name,
          value: subject.sub_rc_master_id,
        })) || [];

      setSubjectOptions(mappedSubjects);
    } catch (err) {
      console.error("Error fetching subjects:", err);
    }
  };

  // Handle search and fetch parent information

  const handleSearch = async () => {
    setLoadingForSearch(false);
    let hasError = false;

    if (!selectedStudentId) {
      setStudentError("Please select Class.");
      hasError = true;
    }

    if (hasError) return;

    setSearchTerm("");
    setLoadingForSearch(true);
    setTimetable([]);

    try {
      const token = localStorage.getItem("authToken");

      const params = {
        class_id: selectedStudent.valueclass,
        section_id: selectedStudentId,
      };

      if (selectedExam?.value) {
        params.examination_id = selectedExam.value;
      }

      if (selectedSubject?.value) {
        params.subject_id = selectedSubject.value;
      }

      const response = await axios.get(
        `${API_URL}/api/get_classwisemarksreport`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params,
        }
      );

      const reportData = response?.data?.data ?? [];

      if (reportData.length === 0) {
        toast.error("No marks report data found.");
        setShowStudentReport(false);
        setTimetable([]);
      } else {
        setTimetable(reportData);
        setPageCount(Math.ceil(reportData.length / pageSize));
        setShowStudentReport(true);
      }
    } catch (error) {
      console.error(
        "Error fetching marks report:",
        error?.response?.data || error.message
      );
      toast.error("Failed to fetch marks report. Please try again.");
    } finally {
      setLoadingForSearch(false);
    }
  };

  useEffect(() => {
    if (timetable?.students?.length > 0 && timetable?.date_range?.length > 0) {
      const formattedStudents = timetable.students.map((student) => {
        const attendanceMap = {};
        student.daily_attendance.forEach((entry) => {
          attendanceMap[entry.date] = {
            status: entry.status || "",
            duplicate: entry.duplicate || false,
          };
        });

        const attendance = timetable.date_range.map((dateObj) => {
          const entry = attendanceMap[dateObj.date];
          return entry
            ? { status: entry.status, duplicate: entry.duplicate }
            : { status: "", duplicate: false };
        });

        return {
          name: student.name,
          rollNo: student.roll_no || "",
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
    const zebraStyle = (index) =>
      `background-color: ${index % 2 === 0 ? "#ffffff" : "#f9fafb"};`;

    const thead = `
    <thead style="background-color: #e5e7eb; font-weight: bold;">
      <tr>
        <th style="border: 1px solid #ccc; padding: 6px;">Roll No</th>
        <th style="border: 1px solid #ccc; padding: 6px;">Student Name</th>
        ${timetable.date_range
          .map(
            (date) => `
            <th style="border: 1px solid #ccc; padding: 6px;">
              <span style="color: #db2777; font-weight: 600;">
                ${date.formatted_date.split("-")[0]}
              </span><br/>
              <span style="color: #4b5563;">${date.day}</span>
            </th>`
          )
          .join("")}
        <th style="border: 1px solid #ccc; padding: 6px;">Present Days</th>
        <th style="border: 1px solid #ccc; padding: 6px;">Absent Days</th>
        <th style="border: 1px solid #ccc; padding: 6px;">Prev. Attendance</th>
        <th style="border: 1px solid #ccc; padding: 6px;">Total Attendance</th>
        <th style="border: 1px solid #ccc; padding: 6px;">Cumulative Absent Days</th>
        <th style="border: 1px solid #ccc; padding: 6px;">Working Days</th>
        <th style="border: 1px solid #ccc; padding: 6px;">Total Working Days</th>
      </tr>
    </thead>
  `;

    const tbody = `
    <tbody>
      ${students
        .filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .map(
          (student, i) => `
          <tr style="${zebraStyle(i)}">
            <td style="border: 1px solid #ccc; padding: 6px;">${
              student.rollNo
            }</td>
            <td style="border: 1px solid #ccc; padding: 6px; text-align: left;">
              ${student.name
                ?.toLowerCase()
                .split(" ")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ")}
            </td>
            ${student.attendance
              .map(
                (val) => `
                <td style="border: 1px solid #ccc; padding: 6px; ${
                  val.status === "A" ? "color: #dc2626; font-weight: bold;" : ""
                }">
                  ${val.status}${val.duplicate ? "<sup>*</sup>" : ""}
                </td>
              `
              )
              .join("")}
            <td style="border: 1px solid #ccc; padding: 6px; color: #16a34a; font-weight: 600;">
              ${student.present_days}
            </td>
            <td style="border: 1px solid #ccc; padding: 6px; color: #dc2626; font-weight: 600;">
              ${student.absent_days}
            </td>
            <td style="border: 1px solid #ccc; padding: 6px;">
              ${student.prev_attendance}
            </td>
            <td style="border: 1px solid #ccc; padding: 6px; color: #2563eb; font-weight: 600;">
              ${student.total_attendance}
            </td>
            <td style="border: 1px solid #ccc; padding: 6px; color: #ef4444; font-weight: 600;">
              ${student.cumulative_absent_days}
            </td>
            <td style="border: 1px solid #ccc; padding: 6px;">
              ${student.working_days}
            </td>
            <td style="border: 1px solid #ccc; padding: 6px;">
              ${student.total_working_days_till_month}
            </td>
          </tr>
        `
        )
        .join("")}
    </tbody>
  `;

    const tfoot = `
    <tfoot style="background-color: #fefce8;">
      <tr style="color: #16a34a; font-weight: 600;">
        <td style="border: 1px solid #ccc; padding: 6px;" colspan="2">✅ Present</td>
        ${timetable.totals.daily_present
          .map(
            (val) =>
              `<td style="border: 1px solid #ccc; padding: 6px;">${val}</td>`
          )
          .join("")}
        <td style="border: 1px solid #ccc; padding: 6px;">${
          timetable.totals.total_present_days
        }</td>
        <td style="border: 1px solid #ccc; padding: 6px;">–</td>
        <td style="border: 1px solid #ccc; padding: 6px;">${
          timetable.totals.total_prev_attendance
        }</td>
        <td style="border: 1px solid #ccc; padding: 6px;">${
          timetable.totals.total_attendance
        }</td>
        <td style="border: 1px solid #ccc; padding: 6px;">–</td>
        <td style="border: 1px solid #ccc; padding: 6px;">–</td>
        <td style="border: 1px solid #ccc; padding: 6px;">–</td>
      </tr>
      <tr style="color: #dc2626; font-weight: 600;">
        <td style="border: 1px solid #ccc; padding: 6px;" colspan="2">❌ Absent</td>
        ${timetable.totals.daily_absent
          .map(
            (val) =>
              `<td style="border: 1px solid #ccc; padding: 6px;">${val}</td>`
          )
          .join("")}
        <td style="border: 1px solid #ccc; padding: 6px;">${
          timetable.totals.total_absent_days
        }</td>
        <td colspan="6" style="border: 1px solid #ccc; padding: 6px;">–</td>
      </tr>
      <tr style="color: #1e3a8a; font-weight: bold;">
        <td style="border: 1px solid #ccc; padding: 6px;" colspan="2">📊 Total</td>
        ${timetable.totals.daily_total
          .map(
            (val) =>
              `<td style="border: 1px solid #ccc; padding: 6px;">${val}</td>`
          )
          .join("")}
        <td style="border: 1px solid #ccc; padding: 6px;">${
          timetable.totals.total_present_absent_days
        }</td>
        <td style="border: 1px solid #ccc; padding: 6px;">–</td>
        <td style="border: 1px solid #ccc; padding: 6px;">${
          timetable.totals.total_previous_attendance
        }</td>
        <td style="border: 1px solid #ccc; padding: 6px;">${
          timetable.totals.grand_total_attendance
        }</td>
        <td style="border: 1px solid #ccc; padding: 6px;">–</td>
        <td colspan="2" style="border: 1px solid #ccc; padding: 6px; color: #dc2626;">${
          timetable.totals.grand_total_absent_attendance
        }</td>
      </tr>
    </tfoot>
  `;

    return `<table style=" width: 100%; font-size: 12px;">${thead}${tbody}${tfoot}</table>`;
  };

  const handlePrint = () => {
    const printTitle = `Detailed monthly attendance report of ${selectedStudent?.label} (${selectedMonth?.label})`;
    const tableHTML = generateAttendanceTableHTML();

    const headerTable = `
      <table style="width: 100%; margin-bottom: 10px;  font-size: 14px;">
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
            table { width: 100%; font-size: 12px;  }
            th, td { border: 1px solid #333; padding: 4px; text-align: center; }
            th { background: #eee; }
          </style>
        </head>
        <body>
          ${headerTable}
          ${tableHTML}
            <p style="margin-top: 10px; font-size: 12px;"><sup>*</sup> indicates multiple entry for this
date.</p>

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
    if (!timetable || !timetable.date_range || students.length === 0) {
      return [];
    }

    const headerRow = [
      "Roll No",
      "Student Name",
      ...timetable.date_range.map(
        (d) => `${d.formatted_date.split("-")[0]} (${d.day})`
      ),
      "Present Days",
      "Absent Days",
      "Prev. Attendance",
      "Total Attendance",
      "Cumulative Absent Days",
      "Working Days",
      "Total Working Days",
    ];

    const dataRows = students
      .filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .map((student) => [
        student.rollNo,
        student.name
          ?.toLowerCase()
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" "),
        ...student.attendance.map((a) => a.status + (a.duplicate ? "*" : "")),
        student.present_days,
        student.absent_days,
        student.prev_attendance,
        student.total_attendance,
        student.cumulative_absent_days,
        student.working_days,
        student.total_working_days_till_month,
      ]);

    const footerRows = [
      [
        "✅ Present",
        "",
        ...(timetable.totals?.daily_present ?? []),
        timetable.totals?.total_present_days ?? "",
        "–",
        timetable.totals?.total_prev_attendance ?? "",
        timetable.totals?.total_attendance ?? "",
        "–",
        "–",
        "–",
      ],
      [
        "❌ Absent",
        "",
        ...(timetable.totals?.daily_absent ?? []),
        timetable.totals?.total_absent_days ?? "",
        "–",
        "–",
        "–",
        "–",
        "–",
        "–",
      ],
      [
        "📊 Total",
        "",
        ...(timetable.totals?.daily_total ?? []),
        timetable.totals?.total_present_absent_days ?? "",
        "–",
        timetable.totals?.total_previous_attendance ?? "",
        timetable.totals?.grand_total_attendance ?? "",
        "–",
        "–",
        timetable.totals?.grand_total_absent_attendance ?? "",
      ],
    ];

    return [headerRow, ...dataRows, ...footerRows];
  };

  const handleDownloadEXL = () => {
    const data = generateAttendanceExcelData();

    if (!data || data.length <= 1) {
      toast.error("No attendance data available.");
      return;
    }

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    worksheet["!cols"] = data[0].map(() => ({ wch: 20 }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Report");

    const fileName = `Detailed monthly attendance report of ${selectedStudent?.label} (${selectedMonth?.label}).xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const filteredStudents = students.filter((student) => {
    const search = searchTerm.toLowerCase();

    return (
      student.rollNo?.toString().toLowerCase().includes(search) ||
      student.name?.toLowerCase().includes(search) ||
      student.present_days?.toString().includes(search) ||
      student.absent_days?.toString().includes(search) ||
      student.working_days?.toString().includes(search) ||
      student.prev_attendance?.toString().includes(search) ||
      student.total_attendance?.toString().includes(search) ||
      student.total_working_days_till_month?.toString().includes(search) ||
      student.cumulative_absent_days?.toString().includes(search)
    );
  });

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
                  Full Term Marks Of A Class Report
                </h5>
                <RxCross1
                  className=" relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                  onClick={() => {
                    navigate("/dashboard");
                  }}
                />
              </div>
              <div
                className={` relative    -top-6 h-1  mx-auto bg-red-700 ${
                  showStudentReport ? "w-full " : "w-[98%] "
                }`}
                style={{
                  backgroundColor: "#C03078",
                }}
              ></div>
            </>
          )}
          <>
            {!showStudentReport && (
              <>
                <div className=" w-full md:w-[98%]   flex justify-center flex-col md:flex-row gap-x-1     ml-0    p-2">
                  <div className="w-full md:w-[99%] flex md:flex-row justify-between items-center mt-0 md:mt-4">
                    <div className="w-full md:w-[98%]  gap-x-0 md:gap-x-12 flex flex-col gap-y-2 md:gap-y-0 md:flex-row">
                      {/* Class Dropdown */}
                      <div className="w-full  md:w-[45%] gap-x-2 justify-around my-1 md:my-4 flex md:flex-row">
                        <label
                          className="w-full md:w-[35%] text-md pl-0 md:pl-5 mt-1.5"
                          htmlFor="studentSelect"
                        >
                          Class <span className="text-red-500">*</span>
                          {/* Staff */}
                        </label>
                        <div className="w-full md:w-[85%]">
                          <Select
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            id="studentSelect"
                            value={selectedStudent}
                            onChange={handleClassSelect}
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
                      {/* Exam Dropdown */}
                      <div className="w-full  md:w-[50%] gap-x-2 justify-around my-1 md:my-4 flex md:flex-row">
                        <label className="w-full md:w-[35%] text-md pl-0 md:pl-5 mt-1.5">
                          Exam
                        </label>
                        <div className="w-full md:w-[85%]">
                          <Select
                            value={selectedExam}
                            onChange={(option) => setSelectedExam(option)}
                            options={examOptions}
                            placeholder={
                              loadingExamsData ? "Loading..." : "Select..."
                            }
                            isSearchable
                            isClearable
                            isDisabled={loadingExamsData}
                            className="text-sm"
                            styles={{
                              control: (provided) => ({
                                ...provided,
                                fontSize: "1em",
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
                      </div>

                      {/* Subject Dropdown */}
                      <div className="w-full  md:w-[50%] gap-x-2 justify-around my-1 md:my-4 flex md:flex-row">
                        <label className="w-full md:w-[35%] text-md pl-0 md:pl-5 mt-1.5">
                          Subject
                        </label>
                        <div className="w-full md:w-[85%]">
                          <Select
                            value={selectedSubject}
                            onChange={(option) => setSelectedSubject(option)}
                            options={subjectOptions}
                            placeholder={
                              loadingSubjectsData ? "Loading..." : "Select..."
                            }
                            isSearchable
                            isClearable
                            isDisabled={loadingSubjectsData}
                            className="text-sm"
                            styles={{
                              control: (provided) => ({
                                ...provided,
                                fontSize: "1em",
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
                              View Students Attendance
                            </h3>
                            <div className="bg-blue-50 border-l-2 border-r-2 px-4 text-[1em] border-pink-500 rounded-md shadow-md w-full md:w-auto">
                              <div className="flex flex-col md:flex-row md:items-center md:gap-6  mt-1 text-blue-800 font-medium">
                                <div className="flex items-center gap-1">
                                  <span className="text-blue-600">
                                    🏫 Class:
                                  </span>
                                  <span>{selectedStudent?.class || "--"}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-blue-600">
                                    🎓 Section:
                                  </span>
                                  <span>
                                    {selectedStudent?.section || "--"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-blue-600">
                                    📅 Month:
                                  </span>
                                  <span>{selectedMonth?.label || "--"}</span>
                                </div>
                              </div>
                            </div>

                            <div className="w-1/2 md:w-[18%] mr-1">
                              <input
                                type="text"
                                className="form-control border px-2 py-1 rounded"
                                placeholder="Search"
                                onChange={(e) => setSearchTerm(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="flex mb-1.5 flex-col md:flex-row gap-x-1 justify-center md:justify-end">
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
                            <RxCross1
                              className=" mt-0.5 text-xl bg-gray-50 text-red-600 hover:cursor-pointer hover:bg-red-100"
                              onClick={() => setShowStudentReport(false)} // ✅ Reset state
                            />
                          </div>
                        </div>

                        <div
                          className=" w-[97%] h-1 mx-auto"
                          style={{ backgroundColor: "#C03078" }}
                        ></div>

                        {/* Table */}
                        <div className="card-body w-full">
                          <p className="  md:absolute md:right-6 text-[.8em] font-bold  md:top-[8%] mt-1   text-gray-500 ">
                            <span className="text-red-500">*</span> indicates
                            multiple entry for this date
                          </p>
                          <div
                            className="h-[600px] mt-1 overflow-x-auto overflow-y-auto border scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
                            style={{
                              zIndex: "5",
                              scrollbarWidth: "thin", // Firefox
                              WebkitOverflowScrolling: "touch",
                            }}
                          >
                            <table className="min-w-[1600px] table-auto text-sm text-center border border-gray-300 rounded shadow-md">
                              <thead
                                className="bg-gray-200 sticky top-0  text-gray-700 text-sm"
                                style={{
                                  zIndex: "5",

                                  scrollbarWidth: "thin", // Makes scrollbar thin in Firefox
                                  scrollbarColor: "#C03178 transparent", // Sets track and thumb color in Firefox
                                }}
                              >
                                <tr>
                                  <th className="border p-2 sticky left-[0px] bg-gray-200  ">
                                    Roll No
                                  </th>
                                  <th className="border p-2 sticky left-[40px] bg-gray-200  ">
                                    Student Name
                                  </th>

                                  {timetable.date_range.map((date, i) => (
                                    <th
                                      key={i}
                                      className="border p-2 whitespace-nowrap"
                                    >
                                      <span className="text-pink-500 font-medium">
                                        {date.formatted_date.split("-")[0]}
                                      </span>
                                      <br />
                                      <span className="text-gray-600">
                                        {date.day}
                                      </span>
                                    </th>
                                  ))}

                                  <th className="border p-2">Present Days</th>
                                  <th className="border p-2">Absent Days</th>
                                  <th className="border p-2">
                                    Prev. Attendance
                                  </th>
                                  <th className="border p-2">
                                    Total Attendance
                                  </th>
                                  <th className="border p-2">
                                    Cumulative Absent Days
                                  </th>
                                  <th className="border p-2">Working Days</th>
                                  <th className="border p-2">
                                    Total Working Days
                                  </th>
                                </tr>
                              </thead>

                              <tbody className=" divide-gray-200">
                                {filteredStudents.length === 0 ? (
                                  <tr>
                                    <td
                                      colSpan={11 + timetable.date_range.length}
                                      className="text-center py-6 text-red-700 text-lg bg-white"
                                    >
                                      Oops! No data found.
                                    </td>
                                  </tr>
                                ) : (
                                  filteredStudents.map((student, i) => (
                                    <tr
                                      key={i}
                                      className="hover:bg-gray-50 even:bg-gray-50 odd:bg-white"
                                    >
                                      <td className="border p-2 sticky left-[0px] bg-white ">
                                        {student.rollNo}
                                      </td>
                                      <td className="border p-2 sticky left-[40px] bg-white  text-center ">
                                        {student.name
                                          ?.toLowerCase()
                                          .split(" ")
                                          .map(
                                            (word) =>
                                              word.charAt(0).toUpperCase() +
                                              word.slice(1)
                                          )
                                          .join(" ")}
                                      </td>

                                      {student.attendance.map((val, idx) => (
                                        <td
                                          key={idx}
                                          className={`border p-2 ${
                                            val.status === "A"
                                              ? "text-red-600 font-bold"
                                              : ""
                                          }`}
                                        >
                                          {val.status}
                                          {val.duplicate ? (
                                            <span className="text-red-600 font-bold">
                                              *
                                            </span>
                                          ) : (
                                            ""
                                          )}
                                        </td>
                                      ))}

                                      <td className="border p-2 text-green-700 font-semibold">
                                        {student.present_days}
                                      </td>
                                      <td className="border p-2 text-red-600 font-semibold">
                                        {student.absent_days}
                                      </td>
                                      <td className="border p-2">
                                        {student.prev_attendance}
                                      </td>
                                      <td className="border p-2 text-blue-700 font-semibold">
                                        {student.total_attendance}
                                      </td>
                                      <td className="border p-2 text-red-500 font-semibold">
                                        {student.cumulative_absent_days}
                                      </td>
                                      <td className="border p-2">
                                        {student.working_days}
                                      </td>
                                      <td className="border p-2">
                                        {student.total_working_days_till_month}
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>

                              {/* Keep your existing <tfoot> as-is */}
                              {filteredStudents.length > 0 && (
                                <tfoot className="bg-gradient-to-t from-yellow-100 to-yellow-50 border-t-2 border-gray-300 text-sm">
                                  {/* Present Row */}
                                  <tr className="font-medium text-green-700">
                                    <td
                                      className="border p-2 text-left sticky left-[0px] bg-gradient-to-t from-yellow-100 to-yellow-50"
                                      colSpan={2}
                                    >
                                      ✅ Present
                                    </td>
                                    {timetable?.totals?.daily_present.map(
                                      (val, i) => (
                                        <td
                                          key={`present-${i}`}
                                          className="border p-2"
                                        >
                                          {val}
                                        </td>
                                      )
                                    )}
                                    <td className="border p-2">
                                      {timetable.totals?.total_present_days}
                                    </td>
                                    <td className="border p-2">–</td>
                                    <td className="border p-2">
                                      {
                                        timetable.totals
                                          ?.total_working_days_for_this_month
                                      }
                                    </td>
                                    <td className="border p-2">
                                      {timetable.totals?.total_prev_attendance}
                                    </td>
                                    <td className="border p-2">
                                      {timetable.totals?.total_attendance}
                                    </td>
                                    <td className="border p-2">–</td>
                                    <td className="border p-2">–</td>
                                  </tr>

                                  {/* Absent Row */}
                                  <tr className="font-medium text-red-600">
                                    <td
                                      className="border p-2 text-left sticky left-[0px] bg-gradient-to-t from-yellow-100 to-yellow-50"
                                      colSpan={2}
                                    >
                                      ❌ Absent
                                    </td>
                                    {timetable?.totals?.daily_absent.map(
                                      (val, i) => (
                                        <td
                                          key={`absent-${i}`}
                                          className="border p-2"
                                        >
                                          {val}
                                        </td>
                                      )
                                    )}
                                    <td className="border p-2">
                                      {timetable.totals?.total_absent_days}
                                    </td>
                                    <td className="border p-2">–</td>
                                    <td className="border p-2">–</td>
                                    <td className="border p-2">–</td>
                                    <td className="border p-2">–</td>
                                    <td className="border p-2">–</td>
                                    <td className="border p-2">–</td>
                                  </tr>

                                  {/* Total Row */}
                                  <tr className="font-bold text-blue-900 border-t border-gray-400">
                                    <td
                                      className="border p-2 text-left sticky left-[0px] bg-gradient-to-t from-yellow-100 to-yellow-50"
                                      colSpan={2}
                                    >
                                      📊 Total
                                    </td>
                                    {timetable?.totals?.daily_total.map(
                                      (val, i) => (
                                        <td
                                          key={`total-${i}`}
                                          className="border p-2"
                                        >
                                          {val}
                                        </td>
                                      )
                                    )}
                                    <td className="border p-2">
                                      {
                                        timetable.totals
                                          ?.total_present_absent_days
                                      }
                                    </td>
                                    <td className="border p-2">–</td>
                                    <td className="border p-2">–</td>
                                    <td className="border p-2">
                                      {
                                        timetable.totals
                                          ?.total_previous_attendance
                                      }
                                    </td>
                                    <td className="border p-2">
                                      {timetable.totals?.grand_total_attendance}
                                    </td>
                                    <td className="border p-2">–</td>
                                    <td className="border p-2 text-red-600">
                                      {
                                        timetable.totals
                                          ?.grand_total_absent_attendance
                                      }
                                    </td>
                                  </tr>
                                </tfoot>
                              )}
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

export default FullTermMarksClass;
