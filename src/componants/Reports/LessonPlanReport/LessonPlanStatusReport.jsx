import { useState, useEffect, useMemo } from "react";
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

const LessonPlanStatusReport = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingForSearch, setLoadingForSearch] = useState(false);

  const navigate = useNavigate();
  const [loadingExams, setLoadingExams] = useState(false);
  const [studentError, setStudentError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [timetable, setTimetable] = useState([]);

  const pageSize = 10;
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [leaveData, setLeaveData] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [teacher, setTeacher] = useState([]);

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [classError, setClassError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(null);

  useEffect(() => {
    fetchExams();
    fetchLeaveType();
  }, []);

  const fetchExams = async () => {
    try {
      setLoadingExams(true);
      const token = localStorage.getItem("authToken");

      const response = await axios.get(`${API_URL}/api/get_allstaff`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Class", response);
      setStudentNameWithClassId(response?.data?.data || []);
    } catch (error) {
      toast.error("Error fetching Classes");
      console.error("Error fetching Classes:", error);
    } finally {
      setLoadingExams(false);
    }
  };

  const fetchLeaveType = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      const response = await axios.get(`${API_URL}/api/get_allleavetype`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data.data || [];
      setLeaveData(data);
      console.log("datta", data);
      setPageCount(Math.ceil(data.length / pageSize));
    } catch (error) {
      toast.error(error.message || "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const fetchClass = async (teacherId) => {
    // if (!teacherId) {
    //   toast.error("Please select a teacher first.");
    //   return;
    // }

    try {
      setLoadingExams(true);
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/get_teacherclasstimetable?teacher_id=${teacherId}`,
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
      fetchClass(selectedOption.value); // ✅ use value directly
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
      value: {
        class_id: cls?.class_id,
        section_id: cls?.section_id,
      },
      label: `${cls.classname} ${cls.sectionname}`,
    }));
  }, [teacher]);

  const statusOptions = [
    { value: "I", label: "Incomplete" },
    { value: "C", label: "Complete" },
  ];

  const handleSearch = async () => {
    setSearchTerm("");
    setStudentError("");
    setTimetable([]);
    setLeaveTypes([]);
    setPageCount(0);
    setIsSubmitting(true);
    setLoadingForSearch(false);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Authentication token missing!");
        setLoadingForSearch(false);
        setIsSubmitting(false);
        return;
      }

      if (!selectedStudentId) {
        setStudentError("Please select Teacher.");
        setLoadingForSearch(false);
        setIsSubmitting(false);
        return;
      }

      // Prepare query params
      const params = {
        teacher_id: selectedStudentId,
      };

      if (selectedClass?.value?.class_id) {
        params.class_id = selectedClass.value.class_id;
      }

      if (selectedClass?.value?.section_id) {
        params.section_id = selectedClass.value.section_id;
      }

      if (selectedStatus?.value) {
        params.status = selectedStatus.value;
      }

      const response = await axios.get(
        `${API_URL}/api/get_lesson_plan_status_report`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params,
        }
      );

      console.log("Lesson Plan Status Report Response:", response);

      const resultData = response?.data?.data || [];
      const leaveTypesFromApi = response?.data?.leave_types || [];

      if (resultData.length === 0) {
        toast.error("Lesson Plan Status Report data not found.");
      }

      setTimetable(resultData);
      setLeaveTypes(leaveTypesFromApi);
      setPageCount(Math.ceil(resultData.length / pageSize));
    } catch (error) {
      console.error("Error fetching Lesson Plan Status Report:", error);
      toast.error(
        error?.response?.data?.message ||
          "Error fetching Lesson Plan Status Report. Please try again."
      );
    } finally {
      setIsSubmitting(false);
      setLoadingForSearch(false);
    }
  };

  const handlePrint = () => {
    const printTitle = `Lesson Plan Status Report  ${
      selectedStudent?.label
        ? `List of ${selectedStudent.label}`
        : ": Complete List of All Teacher "
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
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Chapter</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Date</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Status</th>
           
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
                <td class="px-2 text-center py-2 border border-black">
                ${subject?.classname} ${subject?.secname}
                </td>
                 <td class="px-2 text-center py-2 border border-black">${
                   subject?.subname
                 }</td>
                  <td class="px-2 text-center py-2 border border-black">${
                    subject?.chaptername
                  }</td>
                   <td class="px-2 text-center py-2 border border-black">${
                     subject?.week_date
                   }</td>
                  <td class="px-2 text-center py-2 border border-black">
                  ${
                    statusOptions.find(
                      (option) => option.value === subject?.status
                    )?.label
                  }
                  </td>
              </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>
  </div>`;

    const printWindow = window.open("", "_blank", "width=2000,height=1000");

    printWindow.document.write(`
    <html>
      <head>
        <title>${printTitle}</title>
        <style>
                   @page {
                size: A4 landscape; /* Wider format for better fit */
                margin: 10px;
            }

                      body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

                       /* Scrollable container */
            #printContainer {
                width: 100%;
                overflow-x: auto;  /* Enables horizontal scrolling */
                white-space: nowrap; /* Prevents text wrapping */
            }

                      #tableMain {
                width: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-start;
                padding: 0 10px;
                margin: 10px 10px ;
            }

                       table {
                border-spacing: 0;
                width: 100%;
                min-width: 1200px; /* Ensures table doesn't shrink */
                margin: auto;
                table-layout: fixed; /* Ensures even column spacing */
            }

                      th, td {
                border: 1px solid gray;
                padding: 8px;
                text-align: center;
                font-size: 12px;
                word-wrap: break-word; /* Ensures text breaks properly */
            }

            th {
                font-size: 0.8em;
                background-color: #f9f9f9;
            }


           /* Ensure scrolling is available in print mode */
            @media print {
                #printContainer {
                    overflow-x: auto;
                    display: block;
                    width: 100%;
                    height: auto;
                }
             table {
                    min-width: 100%;
                }
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

    // Define headers — separate each leave type
    const headers = ["Sr No.", "Class", "Subject", "Chapter", "Date", "Status"];

    // Convert displayedSections to array-of-arrays format
    const data = displayedSections.map((student, index) => [
      index + 1,
      ` ${student?.classname} ${student?.secname}`,
      student?.subname,
      student?.chaptername,
      student?.week_date,
      ` ${
        statusOptions.find((option) => option.value === student?.status)?.label
      }`,
    ]);

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // Auto-adjust column widths
    worksheet["!cols"] = headers.map(() => ({ wch: 20 }));

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Lesson Plan Status Report"
    );

    // Generate file name and trigger download
    const fileName = `Lesson_Plan_Status_Report_${
      selectedStudent?.label || "All_Teacher"
    }.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  console.log("row", timetable);

  const statusMap = {
    I: "Incomplete",
    C: "Complete",
  };

  const filteredSections = timetable.filter((student) => {
    const searchLower = searchTerm.toLowerCase();

    const staffName = `${student?.classname || ""} ${
      student?.secname || ""
    }`.toLowerCase();
    const subject = student?.subname?.toLowerCase() || "";
    const chapter = student?.chaptername?.toLowerCase() || "";
    const date = student?.week_date?.toString().toLowerCase() || "";

    // Safely map status (e.g., I → Incomplete)
    const statusLabel =
      statusMap[student?.status?.toUpperCase()]?.toLowerCase() || "";

    return (
      staffName.includes(searchLower) ||
      subject.includes(searchLower) ||
      chapter.includes(searchLower) ||
      date.includes(searchLower) ||
      statusLabel.includes(searchLower)
    );
  });

  const displayedSections = filteredSections.slice(currentPage * pageSize);
  console.log(displayedSections);

  return (
    <>
      {/* <div className="w-full md:w-[85%] mx-auto p-4 "> */}
      <div
        className={`mx-auto p-4 transition-all duration-700 ease-[cubic-bezier(0.4, 0, 0.2, 1)] transform ${
          timetable.length > 0
            ? "w-full md:w-[98%] scale-100"
            : "w-full md:w-[95%] scale-[0.98]"
        }`}
      >
        <ToastContainer />
        <div className="card rounded-md ">
          <div className=" card-header mb-4 flex justify-between items-center ">
            <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
              Lesson Plan Status Report
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
                {/* <div className="w-full  gap-x-0 md:gap-x-12 flex flex-col gap-y-2 md:gap-y-0 md:flex-row"> */}
                <div
                  className={`  w-full gap-x-0 md:gap-x-8  flex flex-col gap-y-2 md:gap-y-0 md:flex-row ${
                    timetable.length > 0
                      ? "w-full md:w-[100%]  wrelative left-0"
                      : " w-full md:w-[95%] relative left-10"
                  }`}
                >
                  {/* Staff Dropdown */}
                  <div className="w-full  md:w-[70%] gap-x-2 justify-around my-1 md:my-4 flex md:flex-row">
                    <label
                      className="w-full md:w-[35%] text-md pl-0 md:pl-5 mt-1.5"
                      htmlFor="studentSelect"
                    >
                      Teacher <span className="text-sm text-red-500">*</span>
                    </label>
                    <div className="w-full md:w-[70%]">
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

                  {/* Class Dropdown */}
                  <div className="w-full  md:w-[70%] gap-x-2 justify-around my-1 md:my-4 flex md:flex-row">
                    <label
                      className="w-full md:w-[25%] text-md pl-0 md:pl-5 mt-1.5"
                      htmlFor="classSelect"
                    >
                      Class
                    </label>
                    <div className="w-full md:w-[70%]">
                      <Select
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        id="classSelect"
                        value={selectedClass}
                        onChange={handleClassSelect}
                        options={classOptions}
                        placeholder={"Select"}
                        isSearchable
                        isClearable
                        className="text-sm"
                        // isDisabled={loadingExams}
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

                  {/* Status */}
                  <div className="w-full  md:w-[70%] gap-x-2 justify-between my-1 md:my-4 flex md:flex-row">
                    <label
                      className="ml-0 md:ml-4 w-full md:w-[20%] text-md mt-1.5"
                      htmlFor="status"
                    >
                      Status
                    </label>
                    <div className="w-full md:w-[70%]">
                      <Select
                        options={statusOptions}
                        value={selectedStatus}
                        onChange={setSelectedStatus}
                        placeholder="Select Status"
                        isSearchable
                        isClearable
                        className="text-sm"
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
                <div className="p-2 px-3 w-[400px] bg-gray-100 border-none flex justify-between items-center">
                  <div className="w-full flex flex-row justify-between mr-0 md:mr-4 ">
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

            {/* {timetable.length > 0 && ( */}
            <>
              <div className="w-full px-4 mb-4 mt-4">
                <div className="card mx-auto lg:w-full shadow-lg">
                  {/* <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                    <div className="w-full   flex flex-row justify-between mr-0 md:mr-4 ">
                      <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
                        List of Lesson Plan Status Report
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
                  ></div> */}

                  <div className="card-body w-full">
                    <div
                      className="h-96 lg:h-96 overflow-y-scroll overflow-x-scroll"
                      style={{
                        scrollbarWidth: "thin",
                        scrollbarColor: "#C03178 transparent",
                      }}
                    >
                      <table className="min-w-full leading-normal table-auto">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider w-[7%]">
                              Sr No.
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider w-[10%]">
                              Class
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider w-[10%]">
                              Subject
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider w-[25%]">
                              Chapter
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider w-[20%]">
                              Date
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider w-[15%]">
                              Status
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {displayedSections.length ? (
                            displayedSections?.map((student, index) => (
                              <tr
                                key={student.lesson_plan_id}
                                className="border border-gray-300"
                              >
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {index + 1}
                                </td>
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {student?.classname} {student?.secname}
                                </td>
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {student?.subname}
                                </td>
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {student?.chaptername}
                                </td>
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {student?.week_date}
                                </td>
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {
                                    statusOptions.find(
                                      (option) =>
                                        option.value === student?.status
                                    )?.label
                                  }
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
            {/* )} */}
          </>
        </div>
      </div>
    </>
  );
};

export default LessonPlanStatusReport;
