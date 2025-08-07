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

const ReportCardMarksClass = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentReport, setShowStudentReport] = useState(false);
  const [roleId, setRoleId] = useState(null);
  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [loadingForSearch, setLoadingForSearch] = useState(false);
  const navigate = useNavigate();
  const [loadingExams, setLoadingExams] = useState(false);
  const [studentError, setStudentError] = useState("");
  const [timetable, setTimetable] = useState([]);
  const [regId, setRegId] = useState(null);
  const pageSize = 10;
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [examOptions, setExamOptions] = useState([]);
  const [termsOptions, setTermsOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [loadingExamsData, setLoadingExamsData] = useState(false);
  const [loadingTermsData, setLoadingTermsData] = useState(false);
  const [loadingSubjectsData, setLoadingSubjectsData] = useState(false);
  const [marksData, setMarksData] = useState({ headings: [], data: [] });
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedTerms, setSelectedTerms] = useState(null);
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
    fetchtermsByClassId();
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
  const fetchtermsByClassId = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.get(`${API_URL}/api/get_Term`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const mappedExams =
        response?.data?.map((exam) => ({
          label: exam.name,
          value: exam?.term_id,
        })) || [];

      setTermsOptions(mappedExams);
    } catch (err) {
      console.error("Error fetching exams:", err);
    }
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
      if (selectedTerms?.value) {
        params.term_id = selectedTerms.value;
      }
      const response = await axios.get(
        `${API_URL}/api/get_classwisereportcardmarksreport`,
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
  // const { row1, row2, row3, subjectExamHeadingMap } = useMemo(() => {
  //   const headings = marksData?.headings || {};

  //   const row1 = [
  //     { label: "Roll No", rowspan: 3 },
  //     { label: "Reg No", rowspan: 3 },
  //     { label: "Student Name", rowspan: 3 },
  //   ];

  //   const row2 = [];
  //   const row3 = [];
  //   const subjectExamHeadingMap = [];

  //   Object.entries(headings).forEach(([termId, subjects]) => {
  //     Object.entries(subjects).forEach(([subjectId, subject]) => {
  //       let totalColSpan = 0;

  //       subject.exams.forEach((exam) => {
  //         row2.push({
  //           label: exam.exam_name,
  //           colspan: exam.headings.length,
  //         });

  //         exam.headings.forEach((heading) => {
  //           row3.push({
  //             label: `${heading.heading_name}\n${heading.highest_marks}`,
  //           });

  //           subjectExamHeadingMap.push({
  //             termId,
  //             subjectId,
  //             examId: exam.exam_id,
  //             headingName: heading.heading_name,
  //             isSubjectTotal: false,
  //           });

  //           totalColSpan += 1;
  //         });
  //       });

  //       // Add "Total" column for the subject
  //       row2.push({ label: "", colspan: 1 });
  //       row3.push({ label: `Total\n${subject.total_max_all}` });

  //       // Find the exam which includes "Total"
  //       const examWithTotal = subject.exams.find((exam) =>
  //         exam.headings.some((heading) => heading.heading_name === "Total")
  //       );

  //       subjectExamHeadingMap.push({
  //         termId,
  //         subjectId,
  //         examId: examWithTotal?.exam_id ?? null,
  //         headingName: "Total",
  //         isSubjectTotal: true,
  //       });

  //       row1.push({
  //         label: `${subject.subject_name}\n (Term ${termId})`,
  //         colspan: totalColSpan + 1,
  //       });
  //     });
  //   });

  //   return { row1, row2, row3, subjectExamHeadingMap };
  // }, [marksData.headings]);
  const { row1, row2, row3, subjectExamHeadingMap } = useMemo(() => {
    const headings = timetable?.headings || {}; // ✅ use correct source
    const row1 = [
      { label: "Roll No", rowspan: 3 },
      { label: "Reg No", rowspan: 3 },
      { label: "Student Name", rowspan: 3 },
    ];

    const row2 = [];
    const row3 = [];
    const subjectExamHeadingMap = [];

    Object.entries(headings).forEach(([termId, subjects]) => {
      Object.entries(subjects).forEach(([subjectId, subject]) => {
        const examSpan = subject.exams.reduce(
          (acc, exam) => acc + exam.headings.length,
          0
        );

        row1.push({
          label: `${subject.subject_name}\n (Term ${termId})`,
          colspan: examSpan,
        });

        subject.exams.forEach((exam) => {
          row2.push({
            label: exam.exam_name,
            colspan: exam.headings.length,
          });

          exam.headings.forEach((heading) => {
            row3.push({
              label: `${heading.heading_name}\n${heading.highest_marks}`,
            });

            subjectExamHeadingMap.push({
              termId,
              subjectId,
              examId: exam.exam_id,
              headingName: heading.heading_name,
              marksHeadingId: heading.marks_headings_id,
              isSubjectTotal: false,
            });
          });
        });
      });
    });

    return { row1, row2, row3, subjectExamHeadingMap };
  }, [timetable?.headings]);

  const generateMarksTableHTML = () => {
    const row1 = ["Sr No", "Roll No", "Reg No", "Student Name"];
    const row2 = [];
    const row3 = [];
    const columnKeys = [];

    Object.entries(marksData.headings).forEach(([termId, subjects]) => {
      Object.entries(subjects).forEach(([subjectId, subject]) => {
        const totalExamHeadings = subject.exams.reduce(
          (acc, exam) => acc + exam.headings.length,
          0
        );

        const totalColSpan = totalExamHeadings + 1; // +1 for "Total" column
        row1.push({ label: subject.subject_name, colspan: totalColSpan });

        subject.exams.forEach((exam) => {
          row2.push({ label: exam.exam_name, colspan: exam.headings.length });

          exam.headings.forEach((heading) => {
            row3.push({
              label: `${heading.heading_name}\n${heading.highest_marks}`,
            });

            columnKeys.push({
              termId,
              subjectId,
              examId: exam.exam_id,
              headingName: heading.heading_name,
              maxMarks: heading.highest_marks,
              isTotal: false,
            });
          });
        });

        // Compute total max marks for subject
        const totalMarks = subject.exams.reduce((total, exam) => {
          return (
            total +
            exam.headings.reduce(
              (acc, heading) => acc + Number(heading.highest_marks || 0),
              0
            )
          );
        }, 0);

        // Add total column for this subject
        row2.push({ label: "", colspan: 1 });
        row3.push({ label: `Total\n${totalMarks}` }); // 💡 This is the key change

        columnKeys.push({
          termId,
          subjectId,
          isSubjectTotal: true,
          maxMarks: totalMarks,
        });
      });
    });

    const theadHTML = `
      <thead>
        <tr style="background:#d1d5db; font-weight:bold;">
          ${row1
            .map((cell) =>
              typeof cell === "string"
                ? `<th rowspan="3" style="border:1px solid #333;padding:6px;">${cell}</th>`
                : `<th colspan="${cell.colspan}" style="border:1px solid #333;padding:6px;">${cell.label}</th>`
            )
            .join("")}
        </tr>
        <tr style="background:#d1d5db; font-weight:bold;">
          ${row2
            .map(
              (cell) =>
                `<th colspan="${cell.colspan}" style="border:1px solid #333;padding:6px;">${cell.label}</th>`
            )
            .join("")}
        </tr>
        <tr style="background:#e0f2fe; font-weight:bold;">
          ${row3
            .map(
              (cell) =>
                `<th style="border:1px solid #333;padding:6px; white-space:pre-line;">${cell.label.replace(
                  /\n/g,
                  "<br/>"
                )}</th>`
            )
            .join("")}
        </tr>
      </thead>`;

    const tbodyHTML = `
      <tbody>
        ${marksData.data
          .map((student, idx) => {
            const fullName = `${capitalizeFirst(student.first_name) || ""} ${
              toLowerCaseAll(student.mid_name) || ""
            } ${toLowerCaseAll(student.last_name) || ""}`.trim();

            const cells = [
              `<td style="border:1px solid #333;padding:4px;">${idx + 1}</td>`,
              `<td style="border:1px solid #333;padding:4px;">${student.roll_no}</td>`,
              `<td style="border:1px solid #333;padding:4px;">${student.reg_no}</td>`,
              `<td style="border:1px solid #333;padding:4px; text-align:left;">${fullName}</td>`,
            ];

            let subjectTotal = 0;

            columnKeys.forEach(
              ({ termId, subjectId, examId, headingName, isSubjectTotal }) => {
                if (isSubjectTotal) {
                  // Show total of previously accumulated subject
                  cells.push(
                    `<td style="border:1px solid #333;padding:4px; text-align:center; font-weight:bold;">${subjectTotal}</td>`
                  );
                  subjectTotal = 0; // Reset for next subject
                  return;
                }

                const mark =
                  student.marks?.[termId]?.[subjectId]?.[examId]?.[headingName];
                const value =
                  mark !== undefined && mark !== null ? Number(mark) : "-";

                if (value !== "-" && !isNaN(value)) {
                  subjectTotal += Number(value);
                }

                cells.push(
                  `<td style="border:1px solid #333;padding:4px; text-align:center;">${value}</td>`
                );
              }
            );

            return `<tr>${cells.join("")}</tr>`;
          })
          .join("")}
      </tbody>`;

    return `<table style="width:100%; font-size:12px;text-align:center;">${theadHTML}${tbodyHTML}</table>`;
  };

  const handlePrint = () => {
    const printTitle =
      `Report Card Marks for ${
        selectedStudent?.label || "the selected class"
      }` +
      (selectedTerms?.label ? `, of terms ${selectedTerms.label}` : "") +
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
        th { font-weight:bold; }
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
    const aoa = [];
    const merges = [];

    const level1 = [];
    const level2 = [];
    const level3 = [];
    const level4 = []; // <-- NEW

    const stickyHeaders = [
      { label: "Roll No" },
      { label: "Reg No" },
      { label: "Student Name" },
    ];

    stickyHeaders.forEach((header, index) => {
      level1.push({ v: header.label });
      level2.push({ v: "" });
      level3.push({ v: "" });
      level4.push({ v: "" }); // <== Also empty for sticky headers
      merges.push({ s: { r: 0, c: index }, e: { r: 3, c: index } }); // rowspan = 4
    });

    let colIndex = stickyHeaders.length;

    // Row 1
    row1.slice(3).forEach((cell) => {
      const colspan = cell.colspan || 1;
      level1.push({ v: cell.label });
      for (let i = 1; i < colspan; i++) level1.push({ v: "" });

      merges.push({
        s: { r: 0, c: colIndex },
        e: { r: 0, c: colIndex + colspan - 1 },
      });

      colIndex += colspan;
    });

    // Row 2
    colIndex = stickyHeaders.length;
    row2.forEach((cell) => {
      const colspan = cell.colspan || 1;
      level2.push({ v: cell.label });
      for (let i = 1; i < colspan; i++) level2.push({ v: "" });

      merges.push({
        s: { r: 1, c: colIndex },
        e: { r: 1, c: colIndex + colspan - 1 },
      });

      colIndex += colspan;
    });

    // Row 3 - Exam Headings
    row3.forEach((cell) => {
      const label = cell.label || "";

      // Case 1: Match "Exam Name (40)" format
      const match = label.match(/^(.*?)\s*\((\d+)\)$/);

      if (match) {
        const examName = match[1].trim(); // e.g. "Periodic Test"
        const maxMark = match[2]; // e.g. "40"

        level3.push({ v: examName });
        level4.push({ v: maxMark });
      }
      // Case 2: Match "Term\n100" format
      else if (label.includes("\n")) {
        const [examName, maxMark] = label.split("\n");

        level3.push({ v: examName.trim() });
        level4.push({ v: maxMark.trim() });
      }
      // Fallback if format doesn't match
      else {
        level3.push({ v: label });
        level4.push({ v: "" });
      }
    });

    aoa.push(level1, level2, level3, level4); // Add level4 now

    const dataRows = filteredData.map((student) => {
      const fullName = `${capitalizeFirst(student.first_name) || ""} ${
        toLowerCaseAll(student.mid_name) || ""
      } ${toLowerCaseAll(student.last_name) || ""}`.trim();

      const row = [
        student.roll_no,
        student.reg_no,
        fullName,
        ...subjectExamHeadingMap.map(
          ({ termId, subjectId, examId, headingName, isSubjectTotal }) => {
            if (isSubjectTotal) {
              const subjectExams = student.marks?.[termId]?.[subjectId] || {};
              for (const examKey in subjectExams) {
                if (subjectExams[examKey]?.Total !== undefined) {
                  return subjectExams[examKey].Total;
                }
              }
              return "-";
            } else {
              return (
                student.marks?.[termId]?.[subjectId]?.[examId]?.[headingName] ??
                "-"
              );
            }
          }
        ),
      ];

      return row;
    });

    return { aoa: [...aoa, ...dataRows], merges };
  };

  const handleDownloadEXL = () => {
    const { aoa, merges } = generateMarksExcelData();

    if (!aoa || aoa.length <= 3) {
      toast.error("No marks data to export.");
      return;
    }

    const ws = XLSX.utils.aoa_to_sheet(aoa);

    const borderStyle = {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } },
    };

    const headerFill = { patternType: "solid", fgColor: { rgb: "D9E1F2" } };

    // Apply styles to each cell
    for (let R = 0; R < aoa.length; ++R) {
      for (let C = 0; C < aoa[R].length; ++C) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = ws[cellRef];
        if (!cell) continue;

        const isHeader = R <= 2;
        const isTotal =
          aoa[2]?.[C]?.toLowerCase?.()?.includes("total") && R > 2;

        cell.s = {
          font: { bold: isHeader || isTotal },
          alignment: {
            vertical: "center",
            horizontal: "center",
            wrapText: true,
          },
          border: borderStyle,
          fill: isHeader ? headerFill : undefined,
        };
      }
    }

    ws["!merges"] = merges;

    // Auto column widths
    ws["!cols"] = aoa[0].map((col, i) => ({
      wch: aoa.reduce((max, row) => {
        const len = String(row[i] || "").length;
        return Math.max(max, len + 2);
      }, 10),
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Marks Report");

    const fileName =
      `Report Card Marks for ${
        selectedStudent?.label || "the selected class"
      }` +
      (selectedTerms?.label ? `, of terms ${selectedTerms.label}` : "") +
      (selectedExam?.label
        ? `, conducted during the ${selectedExam.label}`
        : "") +
      (selectedSubject?.label
        ? `, for the subject ${selectedSubject.label}`
        : "") +
      `.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const filteredData =
    timetable?.data?.filter((student) => {
      const fullName = `${student.first_name} ${student.mid_name || ""} ${
        student.last_name || ""
      }`
        .toLowerCase()
        .trim();

      const rollNo = (student.roll_no || "").toString().toLowerCase();
      const regNo = (student.reg_no || "").toString().toLowerCase();
      const marks = JSON.stringify(student.marks || "").toLowerCase();
      const search = searchTerm.toLowerCase().trim();

      return (
        fullName.includes(search) ||
        rollNo.includes(search) ||
        regNo.includes(search) ||
        marks.includes(search)
      );
    }) || []; // fallback to empty array if undefined

  return (
    <>
      <div
        className={` transition-all duration-500 w-[90%]  mx-auto p-4 ${
          showStudentReport ? "w-full " : "w-[90%] "
        }`}
        // className="w-full md:w-[85%]  mx-auto p-4 "
      >
        <ToastContainer />
        <div className="card pb-4  rounded-md ">
          {!showStudentReport && (
            <>
              <div className=" card-header mb-4 flex justify-between items-center ">
                <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
                  Report Card Marks Of A Class
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
                    <div className="w-full md:w-[98%]  gap-x-0 md:gap-x-6 flex flex-col gap-y-2 md:gap-y-0 md:flex-row">
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
                      <div className="w-full  md:w-[50%] gap-x-2 justify-around my-1 md:my-4 flex md:flex-row">
                        <label className="w-full md:w-[35%] text-md pl-0 md:pl-5 mt-1.5">
                          Terms
                        </label>
                        <div className="w-full md:w-[85%]">
                          <Select
                            value={selectedTerms}
                            onChange={(option) => setSelectedTerms(option)}
                            options={termsOptions}
                            placeholder={
                              loadingTermsData ? "Loading..." : "Select..."
                            }
                            isSearchable
                            isClearable
                            isDisabled={loadingTermsData}
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
                              View Report Card Marks
                            </h3>
                            <div className="bg-blue-50 border-l-2 border-r-2 px-4 text-[1em] border-pink-500 rounded-md shadow-md w-full md:w-auto">
                              <div className="flex flex-col md:flex-row md:items-center md:gap-3 mt-1 text-blue-800 font-medium space-y-1 md:space-y-0">
                                <div className="flex items-center gap-1">
                                  <span className="text-lg">🏫</span>
                                  <span className="text-blue-600">Class:</span>
                                  <span>
                                    {selectedStudent?.class || "--"}{" "}
                                    {selectedStudent?.section || "--"}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1">
                                  <span className="text-lg">📚</span>
                                  <span className="text-blue-600">Term:</span>
                                  <span>{selectedTerms?.label || "--"}</span>
                                </div>

                                <div className="flex items-center gap-1">
                                  <span className="text-lg">📝</span>
                                  <span className="text-blue-600">Exam:</span>
                                  <span>{selectedExam?.label || "--"}</span>
                                </div>

                                <div className="flex items-center gap-1">
                                  <span className="text-lg">📖</span>
                                  <span className="text-blue-600">
                                    Subject:
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
                            {/* Adjust width as needed */}
                            <table className="min-w-full border text-sm text-center">
                              <thead
                                style={{
                                  zIndex: 5,
                                  scrollbarWidth: "thin",
                                  scrollbarColor: "#C03178 transparent",
                                }}
                                className="sticky top-0 text-sm font-semibold text-blue-900 shadow "
                              >
                                {" "}
                                {/* Row 1 */}
                                <tr className="bg-gradient-to-r from-gray-300 to-gray-200 border-2 border-gray-400">
                                  {row1.map((cell, i) => {
                                    const isSticky = i < 3;
                                    const leftOffsets = [0, 80, 160]; // Customize widths here
                                    return (
                                      <th
                                        key={`r1-${i}`}
                                        rowSpan={cell.rowspan || undefined}
                                        colSpan={cell.colspan || undefined}
                                        className={`px-3 py-2 text-center whitespace-nowrap border-2 border-gray-400 ${
                                          isSticky ? "sticky bg-gray-300" : ""
                                        }`}
                                        style={
                                          isSticky
                                            ? {
                                                left: `${leftOffsets[i]}px`,
                                                zIndex: 5,
                                                background: "#e5e7eb",
                                              }
                                            : {}
                                        }
                                      >
                                        {cell.label}
                                      </th>
                                    );
                                  })}
                                </tr>
                                {/* Row 2 */}
                                <tr className="bg-gradient-to-r from-gray-300 to-gray-200 text-blue-900 border-2 border-gray-400">
                                  {row2.map((cell, i) => (
                                    <th
                                      key={`r2-${i}`}
                                      colSpan={cell.colspan}
                                      className="px-3 py-2 text-center whitespace-nowrap border-2 border-gray-400"
                                    >
                                      {cell.label}
                                    </th>
                                  ))}
                                </tr>
                                {/* Row 3 */}
                                <tr className="bg-gradient-to-r from-blue-100 to-blue-50 text-blue-900 border-2 border-gray-400">
                                  {row3.map((cell, i) => (
                                    <th
                                      key={`r3-${i}`}
                                      className="px-3 py-2 text-center whitespace-nowrap border-2 border-gray-400"
                                    >
                                      {cell.label.split("\n").map((line, i) => (
                                        <div key={i}>{line}</div>
                                      ))}
                                    </th>
                                  ))}
                                </tr>
                              </thead>

                              <tbody>
                                {filteredData.length
                                  ? filteredData.map((student, rowIndex) => (
                                      <tr key={student.student_id}>
                                        {/* Sticky: Roll No */}
                                        <td
                                          className="sticky left-0 bg-white border-2 border-gray-400 px-3 py-1 whitespace-nowrap"
                                          style={{
                                            zIndex: 3,
                                            minWidth: "80px",
                                          }}
                                        >
                                          {student.roll_no}
                                        </td>

                                        {/* Sticky: Reg No */}
                                        <td
                                          className="sticky left-[80px] bg-white border-2 border-gray-400 px-3 py-1 whitespace-nowrap"
                                          style={{
                                            zIndex: 3,
                                            minWidth: "80px",
                                          }}
                                        >
                                          {student.reg_no}
                                        </td>

                                        {/* Sticky: Student Name */}
                                        <td
                                          className="sticky left-[160px] bg-white  border-2 border-gray-400 px-3 py-1 "
                                          style={{
                                            zIndex: 3,
                                            minWidth: "160px",
                                          }}
                                        >
                                          {`${
                                            capitalizeFirst(
                                              student.first_name
                                            ) || ""
                                          } ${
                                            toLowerCaseAll(student.mid_name) ||
                                            ""
                                          } ${
                                            toLowerCaseAll(student.last_name) ||
                                            ""
                                          }`.trim()}
                                        </td>

                                        {/* Scrollable Mark Columns */}
                                        {subjectExamHeadingMap.map(
                                          (
                                            {
                                              termId,
                                              subjectId,
                                              examId,
                                              headingName,
                                              isSubjectTotal,
                                            },
                                            index
                                          ) => {
                                            let value = "";

                                            if (isSubjectTotal) {
                                              const subjectExams =
                                                student.marks?.[termId]?.[
                                                  subjectId
                                                ] || {};
                                              for (const examKey in subjectExams) {
                                                const exam =
                                                  subjectExams[examKey];
                                                if (exam?.Total !== undefined) {
                                                  value = exam.Total;
                                                  break;
                                                }
                                              }
                                            } else {
                                              value =
                                                student.marks?.[termId]?.[
                                                  subjectId
                                                ]?.[examId]?.[headingName] ??
                                                "";
                                            }

                                            return (
                                              <td
                                                key={index}
                                                className="border-2 border-gray-400 px-3 py-1 text-center whitespace-nowrap"
                                              >
                                                {value}
                                              </td>
                                            );
                                          }
                                        )}
                                      </tr>
                                    ))
                                  : filteredData.length === 0 && (
                                      <div
                                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                        style={{
                                          zIndex: 5,
                                        }}
                                      >
                                        <p className="text-red-700 text-xl font-semibold">
                                          Oops! No data found..
                                        </p>
                                      </div>
                                    )}
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

export default ReportCardMarksClass;
