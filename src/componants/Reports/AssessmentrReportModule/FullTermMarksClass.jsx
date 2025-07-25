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
  const [marksData, setMarksData] = useState({ headings: [], data: [] });
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const capitalizeFirst = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";
  const toLowerCaseAll = (str) => (str ? str.toLowerCase() : "");

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

      const reportData = response?.data ?? [];
      if (response?.data) {
        setMarksData({
          headings: response.data.headings,
          data: response.data.data,
        });
      }
      if (
        response?.data?.headings?.length === 0 &&
        response?.data?.data?.length === 0
      ) {
        toast.error("No Classwise full term marks report data found.");
        setShowStudentReport(false);
        setTimetable([]);
        return; // ✅ Stop further execution
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

  // ✅ Generate multi-row table headers
  const { row1, row2, row3 } = useMemo(() => {
    const headings = timetable?.headings || [];
    const row1 = [
      { label: "Sr No", colspan: 1, rowspan: 3 },
      { label: "Roll No", colspan: 1, rowspan: 3 },
      { label: "Reg No", colspan: 1, rowspan: 3 },
      { label: "Student Name", colspan: 1, rowspan: 3 },
    ];
    const row2 = [];
    const row3 = [];

    headings.forEach((subject) => {
      const totalExamCols = subject.exams.reduce(
        (sum, exam) => sum + exam.mark_headings.length,
        0
      );

      row1.push({ label: subject.subject_name, colspan: totalExamCols });

      subject.exams.forEach((exam) => {
        row2.push({
          label: exam.exam_name,
          colspan: exam.mark_headings.length,
        });

        exam.mark_headings.forEach((markHeading) => {
          row3.push({
            label: `${markHeading.heading_name} (${markHeading.highest_marks})`,
          });
        });
      });
    });

    return { row1, row2, row3 };
  }, [timetable]);

  const generateMarksTableHTML = () => {
    const theadHTML = `
    <thead style="background: #e5e7eb; font-weight:bold;">
      <tr>
        <th style="border:1px solid #333; padding:6px;">Sr No</th>
        <th style="border:1px solid #333; padding:6px;">Roll No</th>
        <th style="border:1px solid #333; padding:6px;">Reg No</th>
        <th style="border:1px solid #333; padding:6px;">Student Name</th>
        ${marksData.headings
          .map((subject) =>
            subject.exams
              .map((exam) =>
                exam.mark_headings
                  .map(
                    (mh) =>
                      `<th style="border:1px solid #333; padding:6px;">
                          ${subject.subject_name} - ${exam.exam_name} (${mh.heading_name}‑${mh.highest_marks})
                        </th>`
                  )
                  .join("")
              )
              .join("")
          )
          .join("")}
      </tr>
    </thead>
  `;

    const tbodyHTML = `
    <tbody>
      ${marksData.data
        .map((student, idx) => {
          const cells = [];
          cells.push(
            `<td style="border:1px solid #333;padding:4px;">${idx + 1}</td>`
          );
          cells.push(
            `<td style="border:1px solid #333;padding:4px;">${student.roll_no}</td>`
          );
          cells.push(
            `<td style="border:1px solid #333;padding:4px;">${student.reg_no}</td>`
          );
          cells.push(`<td style="border:1px solid #333;padding:4px; text-align:left;">
                      ${student.name}</td>`);

          marksData.headings.forEach((subject) => {
            subject.exams.forEach((exam) => {
              exam.mark_headings.forEach((mh) => {
                const mark =
                  student.marks?.[subject.subject_id]?.[exam.exam_id]?.[
                    mh.marks_headings_id
                  ] ?? "-";
                cells.push(
                  `<td style="border:1px solid #333;padding:4px; text-align:center;">${mark}</td>`
                );
              });
            });
          });

          return `<tr>${cells.join("")}</tr>`;
        })
        .join("")}
    </tbody>
  `;

    return `<table style="width:100%;  font-size:12px;">${theadHTML}${tbodyHTML}</table>`;
  };

  const handlePrint = () => {
    const printTitle =
      `Full Term Marks Report for ${
        selectedStudent?.label || "the selected class"
      }` +
      (selectedExam?.label
        ? `, conducted during the ${selectedExam.label}`
        : "") +
      (selectedSubject?.label
        ? `, for the subject ${selectedSubject.label}`
        : "") +
      ".";

    const tableHTML = generateMarksTableHTML();
    const win = window.open("", "_blank", "width=1200,height=800");
    win.document.write(`
    <html><head>
              <title>${printTitle}</title>

    <style>
      table, th, td { border:1px solid #333;  }
      th, td { padding:6px; font-size:12px; }
      th { background:#e5e7eb; font-weight:bold; }
    </style>
    </head><body>
      ${tableHTML}
    </body></html>
  `);
    win.document.close();
    win.onload = () => {
      win.focus();
      win.print();
      win.close();
    };
  };

  const generateMarksExcelData = () => {
    const headerRow = [
      "Sr No",
      "Roll No",
      "Reg No",
      "Student Name",
      ...marksData.headings.flatMap((subject) =>
        subject.exams.flatMap((exam) =>
          exam.mark_headings.map(
            (mh) =>
              `${subject.subject_name} ‑ ${exam.exam_name} (${mh.heading_name}, max ${mh.highest_marks})`
          )
        )
      ),
    ];

    const dataRows = marksData.data.map((student, idx) => {
      const row = [idx + 1, student.roll_no, student.reg_no, student.name];
      marksData.headings.forEach((subject) => {
        subject.exams.forEach((exam) => {
          exam.mark_headings.forEach((mh) => {
            const mark =
              student.marks?.[subject.subject_id]?.[exam.exam_id]?.[
                mh.marks_headings_id
              ] ?? "-";
            row.push(mark);
          });
        });
      });
      return row;
    });

    return [headerRow, ...dataRows];
  };

  const handleDownloadEXL = () => {
    const aoa = generateMarksExcelData();
    if (!aoa || aoa.length <= 1) {
      toast.error("No marks data to export.");
      return;
    }
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = aoa[0].map(() => ({ wch: 25 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Marks Report");

    const headerHTML =
      `Full Term Marks Report for ${
        selectedStudent?.label || "the selected class"
      }` +
      (selectedExam?.label
        ? `, conducted during the ${selectedExam.label}`
        : "") +
      (selectedSubject?.label
        ? `, for the subject ${selectedSubject.label}`
        : "") +
      ".";

    const fname =
      `Full Term Marks Report for ${
        selectedStudent?.label || "the selected class"
      }` +
      (selectedExam?.label
        ? `, conducted during the ${selectedExam.label}`
        : "") +
      (selectedSubject?.label
        ? `, for the subject ${selectedSubject.label}`
        : "") +
      `.xlsx`;

    XLSX.writeFile(wb, fname);
  };

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
                {(timetable?.headings?.length > 0 ||
                  timetable?.data?.length > 0) && (
                  <>
                    <div className="   w-full  mx-auto transition-all duration-300">
                      <div className="card mx-auto shadow-lg">
                        {/* Header Section */}
                        <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                          <div className="w-full flex flex-row justify-between mr-0 md:mr-4">
                            <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
                              View Full Term Marks Of A Class
                            </h3>
                            <div className="bg-blue-50 border-l-2 border-r-2 px-4 text-[1em] border-pink-500 rounded-md shadow-md w-full md:w-auto">
                              <div className="flex flex-col md:flex-row md:items-center md:gap-6  mt-1 text-blue-800 font-medium">
                                <div className="flex items-center gap-1">
                                  <span className="text-blue-600">
                                    🏫 Class:
                                  </span>
                                  <span>
                                    {selectedStudent?.class || "--"}{" "}
                                    {selectedStudent?.section || "--"}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1">
                                  <span className="text-blue-600">
                                    📅 Exam:
                                  </span>
                                  <span>{selectedExam?.label || "--"}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-blue-600">
                                    📅 Subject:
                                  </span>
                                  <span>{selectedSubject?.label || "--"}</span>
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
                          <div
                            className="h-[600px] mt-1 overflow-x-auto overflow-y-auto border scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
                            style={{
                              zIndex: "5",
                              scrollbarWidth: "thin", // Firefox
                              WebkitOverflowScrolling: "touch",
                            }}
                          >
                            <table className="min-w-full  border text-center text-sm">
                              {/* <thead className="bg-gray-200">
                                <tr>
                                  {row1.map((col, i) => (
                                    <th
                                      key={i}
                                      colSpan={col.colspan}
                                      rowSpan={col.rowspan}
                                      className="border px-2 py-1 "
                                    >
                                      {col.label}
                                    </th>
                                  ))}
                                </tr>
                                <tr>
                                  {row2.map((col, i) => (
                                    <th
                                      key={i}
                                      colSpan={col.colspan}
                                      className="border px-2 py-1"
                                    >
                                      {col.label}
                                    </th>
                                  ))}
                                </tr>
                                <tr>
                                  {row3.map((col, i) => (
                                    <th key={i} className="border px-2 py-1">
                                      {col.label}
                                    </th>
                                  ))}
                                </tr>
                              </thead> */}
                              <thead
                                style={{
                                  zIndex: 5,
                                  scrollbarWidth: "thin",
                                  scrollbarColor: "#C03178 transparent",
                                }}
                                className="sticky top-0 text-sm font-semibold text-blue-900 shadow "
                              >
                                {/* 🔷 Row 1: SUBJECT HEADINGS */}
                                <tr className="bg-gradient-to-r from-gray-300 to-gray-200 border border-gray-800">
                                  {row1.map((col, i) => {
                                    const isSticky = i < 4;
                                    const leftOffsets = [0, 48, 112, 176]; // Adjust as per your column widths
                                    return (
                                      <th
                                        key={i}
                                        colSpan={col.colspan}
                                        rowSpan={col.rowspan}
                                        className={`px-3 py-2 text-center whitespace-nowrap border border-gray-800 ${
                                          isSticky ? "sticky bg-gray-300" : ""
                                        }`}
                                        style={
                                          isSticky
                                            ? {
                                                left: `${leftOffsets[i]}px`,
                                                zIndex: 5,
                                                background: "#e5e7eb", // gray-300 fallback for non-Tailwind CSS
                                              }
                                            : {}
                                        }
                                      >
                                        {col.label}
                                      </th>
                                    );
                                  })}
                                </tr>

                                {/* 🟣 Row 2: EXAMS */}
                                <tr className="bg-gradient-to-r from-gray-300 to-gray-200 text-blue-900 border border-gray-800">
                                  {row2.map((col, i) => (
                                    <th
                                      key={i}
                                      colSpan={col.colspan}
                                      className="px-3 py-2 text-center whitespace-nowrap border border-gray-800"
                                    >
                                      {col.label}
                                    </th>
                                  ))}
                                </tr>

                                {/* 🔵 Row 3: MARK HEADINGS */}
                                <tr className="bg-gradient-to-r from-blue-100 to-blue-50 text-blue-900 border border-gray-800">
                                  {row3.map((col, i) => (
                                    <th
                                      key={i}
                                      className="px-3 py-2 text-center whitespace-nowrap border border-gray-800"
                                    >
                                      {col.label}
                                    </th>
                                  ))}
                                </tr>
                              </thead>

                              {/* <thead
                                style={{
                                  zIndex: "5",
                                  scrollbarWidth: "thin", // Makes scrollbar thin in Firefox
                                  scrollbarColor: "#C03178 transparent", // Sets track and thumb color in Firefox
                                }}
                                className="sticky top-0  text-sm font-semibold text-blue-900 shadow bg-white"
                              >
                                <tr className="bg-gradient-to-r from-gray-300 to-gray-200">
                                  {row1.map((col, i) => {
                                    const isSticky = i < 4;
                                    const leftOffsets = [0, 48, 112, 176]; // Adjust if needed
                                    return (
                                      <th
                                        key={i}
                                        colSpan={col.colspan}
                                        rowSpan={col.rowspan}
                                        className={`px-1 py-2 text-center whitespace-nowrap border border-gray-900 ${
                                          isSticky ? "sticky bg-gray-300" : ""
                                        }`}
                                        style={
                                          isSticky
                                            ? {
                                                left: `${leftOffsets[i]}px`, // 👈 make sure leftOffsets is defined for each sticky column
                                                zIndex: 5,
                                                scrollbarWidth: "thin", // Firefox
                                                scrollbarColor:
                                                  "#C03178 transparent", // Firefox
                                              }
                                            : {}
                                        }
                                      >
                                        {col.label}
                                      </th>
                                    );
                                  })}
                                </tr>

                                <tr className="bg-gradient-to-r from-indigo-100 to-indigo-50 text-blue-900">
                                  {row2.map((col, i) => (
                                    <th
                                      key={i}
                                      colSpan={col.colspan}
                                      className={`px-2 py-2 text-center  border border-gray-900`}
                                    >
                                      {col.label}
                                    </th>
                                  ))}
                                </tr>

                                <tr className="bg-gradient-to-r from-blue-100 to-blue-50 text-blue-900">
                                  {row3.map((col, i) => (
                                    <th
                                      key={i}
                                      className={`px-3 py-2 text-center whitespace-nowrap border border-gray-300`}
                                    >
                                      {col.label}
                                    </th>
                                  ))}
                                </tr>
                              </thead> */}

                              <tbody>
                                {timetable.data?.map((student, index) => (
                                  <tr key={index}>
                                    {/* Sticky: Sr No */}
                                    <td
                                      className="sticky left-0 bg-white  border px-3 py-1 "
                                      style={{
                                        zIndex: 3,
                                        minWidth: "48px",
                                      }}
                                    >
                                      {index + 1}
                                    </td>

                                    {/* Sticky: Roll No */}
                                    <td
                                      className="sticky left-[48px] bg-white  border px-3 py-1 "
                                      style={{
                                        zIndex: 3,
                                        minWidth: "64px",
                                      }}
                                    >
                                      {student?.roll_no}
                                    </td>

                                    {/* Sticky: Reg No */}
                                    <td
                                      className="sticky left-[112px] bg-white border px-3 py-1 "
                                      style={{
                                        zIndex: 3,
                                        minWidth: "64px",
                                      }}
                                    >
                                      {student?.reg_no}
                                    </td>

                                    {/* Sticky: Student Name */}
                                    <td
                                      className="sticky left-[176px] bg-white  border   px-1 py-1 "
                                      style={{
                                        zIndex: 3,
                                        // minWidth: "154px",
                                      }}
                                    >
                                      {capitalizeFirst(student.name)}
                                    </td>

                                    {/* Marks Data */}
                                    {timetable.headings.map((subject) =>
                                      subject.exams.map((exam) =>
                                        exam.mark_headings.map(
                                          (markHeading, idx) => {
                                            const subjectMarks =
                                              student.marks?.[
                                                subject.subject_id
                                              ] || {};
                                            const examMarks =
                                              subjectMarks?.[exam.exam_id] ||
                                              {};
                                            const mark =
                                              examMarks?.[
                                                markHeading.marks_headings_id
                                              ] !== undefined
                                                ? examMarks[
                                                    markHeading
                                                      .marks_headings_id
                                                  ]
                                                : "-";

                                            return (
                                              <td
                                                key={`${student.roll_no}-${subject.subject_id}-${exam.exam_id}-${markHeading.marks_headings_id}-${idx}`}
                                                className="border px-3 py-1 text-center "
                                              >
                                                {mark}
                                              </td>
                                            );
                                          }
                                        )
                                      )
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
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
