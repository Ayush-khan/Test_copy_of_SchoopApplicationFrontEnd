import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
// import Loader from "../common/LoaderFinal/LoaderStyle";
import { FiPrinter } from "react-icons/fi";
import { FaFileExcel, FaRegCalendarAlt } from "react-icons/fa";
import * as XLSX from "xlsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";
import { format, startOfWeek, endOfWeek } from "date-fns";

const LessonPlanSummarisedReport = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [toDate, setToDate] = useState(null);
  //   const [fromDate, setFromDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingForSearch, setLoadingForSearch] = useState(false);

  const navigate = useNavigate();
  const [loadingExams, setLoadingExams] = useState(false);
  const [studentError, setStudentError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [weekError, setWeekError] = useState(false);

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

  const [roleId, setRoleId] = useState([]);
  const [regId, setRegId] = useState("");

  useEffect(() => {
    const init = async () => {
      const sessionData = await fetchRoleId();

      if (sessionData) {
        await fetchExams(sessionData.roleId, sessionData.regId);
      }
    };

    init();
  }, []);

  const fetchRoleId = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      toast.error("Authentication token not found. Please login again.");
      navigate("/");
      return null;
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
        return { roleId, regId };
      } else {
        console.warn("role_id not found in sessionData response");
        return null;
      }
    } catch (error) {
      console.error("Failed to fetch session data:", error);
      return null;
    }
  };

  const fetchExams = async (roleId, regId) => {
    try {
      setLoadingExams(true);
      const token = localStorage.getItem("authToken");

      let apiUrl = "";
      let normalizedData = [];

      if (roleId === "T") {
        apiUrl = `${API_URL}/api/teachers/${regId}`;

        const response = await axios.get(apiUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Normalize SINGLE teacher → ARRAY
        const teacher = response?.data?.data || response?.data?.teacher;

        normalizedData = teacher ? [teacher] : [];
      } else {
        apiUrl = `${API_URL}/api/get_allstaff`;

        const response = await axios.get(apiUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Already an array
        normalizedData = response?.data?.data || [];
      }

      console.log("Normalized Staff:", normalizedData);
      setStudentNameWithClassId(normalizedData);
    } catch (error) {
      toast.error("Error fetching data");
      console.error("Error fetching data:", error);
    } finally {
      setLoadingExams(false);
    }
  };

  // const fetchExams = async () => {
  //   try {
  //     setLoadingExams(true);
  //     const token = localStorage.getItem("authToken");

  //     const response = await axios.get(`${API_URL}/api/get_allstaff`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     console.log("Staff", response);
  //     // setStudentNameWithClassId(response?.data || []);
  //     setStudentNameWithClassId(response?.data?.data || []);
  //   } catch (error) {
  //     toast.error("Error fetching Classes");
  //     console.error("Error fetching Classes:", error);
  //   } finally {
  //     setLoadingExams(false);
  //   }
  // };

  const handleDateChange = (date) => {
    setFromDate(date);
    setWeekError("");

    if (date) {
      const selectedDate = dayjs(date);

      // Adjust to Monday
      const monday = selectedDate.startOf("week").add(1, "day"); // Monday is day 1 (Sunday is 0)
      const sunday = monday.add(6, "day"); // Sunday of the same week

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
      studentNameWithClassId.map((cls) => ({
        value: cls?.teacher_id,
        label: `${cls.name}`,
      })),
    [studentNameWithClassId]
  );

  const classOptions = useMemo(() => {
    if (!Array.isArray(teacher)) return [];

    return teacher.map((cls) => ({
      value: cls?.sm_id,
      label: `${cls.subjectname}`,
    }));
  }, [teacher]);

  const statusMap = {
    I: "Incomplete",
    C: "Complete",
    Y: "Approve",
  };

  const handleSearch = async () => {
    setLoadingForSearch(false);

    if (!selectedStudentId) {
      setStudentError("Please select staff Name.");
      setLoadingForSearch(false);
      return;
    }

    if (!weekRange) {
      setWeekError("Please select week.");
      setLoadingForSearch(false);
      return;
    }

    setSearchTerm("");

    try {
      //   const formattedWeek = weekRange.replace(/\s/g, "").replace(/%20/g, "");
      const formattedWeek = weekRange;

      console.log("Formatted Week is: --->", formattedWeek);

      setLoadingForSearch(true);
      setTimetable([]);

      const token = localStorage.getItem("authToken");

      const params = {
        teacher_id: selectedStudentId,
        week: formattedWeek,
        subject_id: selectedClassId,
      };

      const response = await axios.get(
        `${API_URL}/api/get_lesson_plan_summarised_report`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      if (!response?.data?.data || response?.data?.data?.length === 0) {
        toast.error("Lesson Plan Summarised Report not found.");
        setTimetable([]);
      } else {
        setTimetable(response?.data?.data);
        setPageCount(Math.ceil(response?.data?.data?.length / pageSize));
      }
    } catch (error) {
      console.error("Error fetching Lesson Plan Summarised Report:", error);
      toast.error(
        "Error fetching Lesson Plan Summarised Report. Please try again."
      );
    } finally {
      setIsSubmitting(false);
      setLoadingForSearch(false);
    }
  };

  const camelCase = (str) =>
    str
      ?.toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const handlePrint = () => {
    const printTitle = `Lesson Plan Summarised Report  ${selectedStudent?.label
        ? `List of ${camelCase(selectedStudent.label)}`
        : ": Complete List of All Staff "
      }`;
    const printContent = `
    <div id="tableMain" class="flex items-center justify-center min-h-screen bg-white">
         <h5 id="tableHeading5"  class="text-lg font-semibold border-1 border-black">${printTitle}</h5>
    <div id="tableHeading" class="text-center w-3/4">
      <table class="min-w-full leading-normal table-auto border border-black mx-auto mt-2">
        <thead>
          <tr class="bg-gray-100">
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Sr.No</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Class</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Subject</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Sub-Subject</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Period No.</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Lesson</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Name of the Lesson</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Status</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Principal's Approval</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Remark</th>
           
          </tr>
        </thead>
        <tbody>
          ${displayedSections
        .map(
          (subject, index) => `
              <tr class="text-sm">
                <td class="px-2 text-center py-2 border border-black">${index + 1
            }</td>
                <td class="px-2 text-center py-2 border border-black">${subject?.classname || " "
            }</td>
                <td class="px-2 text-center py-2 border border-black">${subject?.subname || " "
            }</td>
                <td class="px-2 text-center py-2 border border-black">${subject?.sub_subject || " "
            }</td>
                <td class="px-2 text-center py-2 border border-black">${subject?.no_of_periods || " "
            }</td>
                <td class="px-2 text-center py-2 border border-black">${subject?.chapter_no || " "
            }</td>
                <td class="px-2 text-center py-2 border border-black">${subject?.chaptername || " "
            }</td>
                <td class="px-2 text-center py-2 border border-black">
                ${statusMap[subject?.status || " "]}</td>
                <td class="px-2 text-center py-2 border border-black">${statusMap[subject?.approve || " "]
            }</td>
                <td class="px-2 text-center py-2 border border-black">${subject?.remark || " "
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

    // Define headers matching the print table
    const headers = [
      "Sr No.",
      "Class",
      "Subject",
      "Sub-Subject",
      "Period",
      "Lesson",
      "Name of the Lesson",
      "Status",
      "Principal's Approval",
      "Remark",
    ];
    // Convert displayedSections data to array format for Excel
    const data = displayedSections.map((student, index) => [
      index + 1,
      `${student?.classname} ${student?.secname}`,
      student?.subname || " ",
      student?.sub_subject || " ",
      student?.no_of_periods || " ",
      student?.chapter_no || " ",
      student?.chaptername || " ",
      statusMap[student?.status || " "],
      statusMap[student?.approve || " "],
      student?.remark || " ",
    ]);

    // Create a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // Auto-adjust column width
    const columnWidths = headers.map(() => ({ wch: 20 })); // Approx. width of 20 characters per column
    worksheet["!cols"] = columnWidths;

    // Create a workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Lesson Plan Summarised Report"
    );

    // Generate and download the Excel file
    const fileName = `Lesson_Plan_Summarised_Report
    ${camelCase(selectedStudent?.label) || "For All Staff"}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  console.log("row", timetable);

  const filteredSections = timetable.filter((student) => {
    const searchLower = searchTerm.toLowerCase().trim();

    // Extract relevant fields and convert them to lowercase for case-insensitive search
    const subSubject = (student?.sub_subject || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");
    const week = student?.week?.toLowerCase() || "";
    const totalHours =
      student?.time_difference_decimal?.toString().toLowerCase() || "";
    const nameLesson = (student?.chaptername || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");
    const subject = (student?.subname || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");

    const status = (statusMap[student?.status] || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");

    const remark = (student?.remark || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");

    const periodNo = student?.no_of_periods?.toString().toLowerCase() || "";
    const chapterNo = student?.chapter_no?.toString().toLowerCase() || "";

    // Check if the search term is present in any of the specified fields
    return (
      subSubject.includes(searchLower) ||
      week.includes(searchLower) ||
      totalHours.includes(searchLower) ||
      nameLesson.includes(searchLower) ||
      subject.includes(searchLower) ||
      periodNo.includes(searchLower) ||
      chapterNo.includes(searchLower) ||
      status.includes(searchLower) ||
      remark.includes(searchLower)
    );
  });

  const displayedSections = filteredSections.slice(currentPage * pageSize);
  return (
    <>
      {/* <div className="w-full md:w-[85%] mx-auto p-4 "> */}
      <div
        className={`mx-auto p-4 transition-all duration-700 ease-[cubic-bezier(0.4, 0, 0.2, 1)] transform ${timetable.length > 0
            ? "w-full md:w-[100%] scale-100"
            : "w-full md:w-[95%] scale-[0.98]"
          }`}
      >
        <ToastContainer />
        <div className="card rounded-md ">
          <div className=" card-header mb-4 flex justify-between items-center ">
            <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
              Lesson Plan Summarised Report
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
            <div
              className={`  flex justify-between flex-col md:flex-row gap-x-1 ml-0 p-2  ${timetable.length > 0
                  ? "pb-0 w-full md:w-[99%]"
                  : "pb-4 w-full md:w-[85%]"
                }`}
            >
              <div className="w-full md:w-[100%] flex md:flex-row justify-between items-center mt-0 md:mt-4">
                <div
                  className={`  w-full gap-x-0 md:gap-x-3  flex flex-col gap-y-2 md:gap-y-0 md:flex-row ${timetable.length > 0
                      ? "w-full md:w-[100%]  wrelative left-0"
                      : " w-full md:w-[100%] relative left-10"
                    }`}
                >
                  {/* Staff Dropdown */}
                  <div className="w-full  md:w-[50%] gap-x-2 justify-around my-1 md:my-4 flex md:flex-row">
                    <label
                      className="w-full md:w-[43%] text-md pl-0 md:pl-5 mt-1.5"
                      htmlFor="studentSelect"
                    >
                      Teacher <span className="text-red-500">*</span>
                    </label>
                    <div className="w-full md:w-[60%]">
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

                  <div className="w-full md:w-[80%] gap-x-4 justify-between my-1 md:my-4 flex md:flex-row">
                    <label
                      className="ml-0 md:ml-4 w-full md:w-[50%] text-md mt-1.5"
                      htmlFor="fromDate"
                    >
                      Select Week
                      <span className="text-sm text-red-500">*</span>
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

                      {weekError && (
                        <div className="relative ml-1 text-danger text-xs">
                          {weekError}
                        </div>
                      )}

                      {/* Keep your DatePicker hidden but functional */}
                      <DatePicker
                        ref={datePickerRef}
                        selected={fromDate}
                        onChange={handleDateChange}
                        dateFormat="dd-MM-yyyy"
                        className="hidden" // clean way instead of 1px trick
                      />
                    </div>
                  </div>

                  <div className="w-full  md:w-[50%] gap-x-2 justify-around my-1 md:my-4 flex md:flex-row">
                    <label
                      className="w-full md:w-[35%] text-md pl-0 md:pl-5 mt-1.5"
                      htmlFor="studentSelect"
                    >
                      Subject
                    </label>
                    <div className="w-full md:w-[65%]">
                      <Select
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        id="studentSelect"
                        value={selectedClass}
                        onChange={handleClassSelect}
                        options={classOptions}
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
                    </div>
                  </div>
                  <div className="mt-1">
                    <button
                      type="search"
                      onClick={handleSearch}
                      style={{ backgroundColor: "#2196F3" }}
                      className={`btn h-10 w-18 md:w-auto btn-primary text-white font-bold py-1 border-1 border-blue-500 px-4 rounded ${loadingForSearch ? "opacity-50 cursor-not-allowed" : ""
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
                {timetable.length > 0 && (
                  <div className="ml-3 mr-3 mt-0 p-2 px-3 w-[360px] bg-gray-100 border-none flex justify-between items-center">
                    <div className="w-full flex flex-row justify-between mr-0 md:mr-3 ">
                      <div className="w-1/2 md:w-[98%] mr-1 ">
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
            </div>

            {timetable.length > 0 && (
              <>
                <div className="w-full  px-4 mb-4">
                  <div className="card mx-auto lg:w-full shadow-lg">
                    <div className="card-body w-full">
                      <div
                        className="h-96 lg:h-96 overflow-y-scroll overflow-x-scroll"
                        style={{
                          scrollbarWidth: "thin", // Makes scrollbar thin in Firefox
                          scrollbarColor: "#C03178 transparent", // Sets track and thumb color in Firefox
                        }}
                      >
                        <table className="w-full md:w-[100%] mx-auto leading-normal table-auto">
                          <thead>
                            <tr className="bg-gray-100">
                              {[
                                "Sr No.",
                                "Class",
                                "Subject",
                                "Sub-Subject",
                                "Period No.",
                                "Lesson",
                                "Name of the Lesson",
                                "Status",
                                "Principal's Approval",
                                "Remark",
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
                                    {student?.classname} {student?.secname}
                                  </td>

                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student?.subname || " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student?.sub_subject || " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student?.no_of_periods || " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student?.chapter_no || " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student?.chaptername || " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {statusMap[student?.status || " "]}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {statusMap[student?.approve || " "]}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student?.remark || " "}
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

export default LessonPlanSummarisedReport;
