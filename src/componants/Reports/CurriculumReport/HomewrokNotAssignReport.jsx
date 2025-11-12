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

import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const HomeworkNotAssignReport = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const [loadingForSearch, setLoadingForSearch] = useState(false);

  const academicYrFrom = localStorage.getItem("academic_yr_from");
  const academicYrTo = localStorage.getItem("academic_yr_to");

  console.log("acadmic yr from", academicYrFrom);

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

  const datePickerRef = useRef(null);

  const today = new Date();
  const formattedToday = format(today, "yyyy-MM-dd");

  const [fromDate, setFromDate] = useState(formattedToday);
  const [toDate, setToDate] = useState(formattedToday);
  const [weekRange, setWeekRange] = useState(
    `${formattedToday} / ${formattedToday}`
  );

  // const [dateRange, setDateRange] = useState([
  //   { startDate: today, endDate: today, key: "selection" },
  // ]);
  // const [tempDateRange, setTempDateRange] = useState(dateRange);
  // const [showPicker, setShowPicker] = useState(false);

  // const formatDate = (date) => format(date, "MMMM d, yyyy");

  // const handleApply = () => {
  //   const from = format(tempDateRange[0].startDate, "yyyy-MM-dd");
  //   const to = format(tempDateRange[0].endDate, "yyyy-MM-dd");

  //   setDateRange(tempDateRange);
  //   setFromDate(from);
  //   setToDate(to);
  //   setWeekRange(`${from} / ${to}`);
  //   setShowPicker(false);

  //   // Call search with the new range
  //   handleSearch(`${from} / ${to}`);
  // };

  // const handleSearch = async (manualRange = null) => {
  //   setLoadingForSearch(true);
  //   setStudentError("");

  //   if (!selectedStudentId) {
  //     setStudentError("Please select Class.");
  //     setLoadingForSearch(false);
  //     return;
  //   }

  //   const selectedOption = studentOptions.find(
  //     (option) => option.value === selectedStudentId
  //   );

  //   const section_id = selectedOption?.section_id || selectedOption?.value;
  //   const class_id = selectedOption?.class_id;

  //   const rangeToUse = manualRange || weekRange;

  //   const rangeStr = typeof rangeToUse === "string" ? rangeToUse : "";
  //   const isTodayRange = rangeStr === `${formattedToday} / ${formattedToday}`;

  //   if (!rangeStr.includes("/") && !isTodayRange) {
  //     toast.error("Please select a valid date range.");
  //     setLoadingForSearch(false);
  //     return;
  //   }

  //   try {
  //     setTimetable([]);
  //     const token = localStorage.getItem("authToken");

  //     const params = {
  //       class_id,
  //       section_id,
  //       teacher_id: selectedClassId || "",
  //       daterange: rangeStr,
  //     };

  //     const response = await axios.get(
  //       `${API_URL}/api/get_homeworknotassignedreport`,
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //         params,
  //       }
  //     );

  //     const data = response?.data?.data || [];
  //     if (data.length === 0) {
  //       toast.error("Homework Not Assign Report not found.");
  //       setTimetable([]);
  //       setPageCount(0);
  //     } else {
  //       setTimetable(data);
  //       setPageCount(Math.ceil(data.length / pageSize));
  //     }
  //   } catch (error) {
  //     console.error("Error fetching Homework Not Assign Report:", error);
  //     toast.error(
  //       "Error fetching Homework Not Assign Report. Please try again."
  //     );
  //   } finally {
  //     setIsSubmitting(false);
  //     setLoadingForSearch(false);
  //   }
  // };

  const [dateRange, setDateRange] = useState([
    { startDate: today, endDate: today, key: "selection" },
  ]);
  const [tempDateRange, setTempDateRange] = useState(dateRange);
  const [showPicker, setShowPicker] = useState(false);

  const formatDate = (date) => format(date, "MMMM d, yyyy");

  // ✅ Removed handleApply — not needed anymore

  const handleSearch = async () => {
    setLoadingForSearch(true);
    setStudentError("");
    setShowPicker(false);

    if (!selectedStudentId) {
      setStudentError("Please select Class.");
      setLoadingForSearch(false);
      return;
    }

    // Extract the actual start and end dates from state
    const from = format(tempDateRange[0].startDate, "yyyy-MM-dd");
    const to = format(tempDateRange[0].endDate, "yyyy-MM-dd");

    // Basic validation — if invalid or missing
    if (!from || !to) {
      toast.error("Please select a valid date range.");
      setLoadingForSearch(false);
      return;
    }

    // Combine for API param
    const rangeStr = `${from} / ${to}`;

    const selectedOption = studentOptions.find(
      (option) => option.value === selectedStudentId
    );

    const section_id = selectedOption?.section_id || selectedOption?.value;
    const class_id = selectedOption?.class_id;

    try {
      setTimetable([]);
      const token = localStorage.getItem("authToken");

      const params = {
        class_id,
        section_id,
        teacher_id: selectedClassId || "",
        daterange: rangeStr,
      };

      const response = await axios.get(
        `${API_URL}/api/get_homeworknotassignedreport`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      const data = response?.data?.data || [];
      if (data.length === 0) {
        toast.error("Homework Not Assign Report not found.");
        setTimetable([]);
        setPageCount(0);
      } else {
        setTimetable(data);
        setPageCount(Math.ceil(data.length / pageSize));
      }
    } catch (error) {
      console.error("Error fetching Homework Not Assign Report:", error);
      toast.error(
        "Error fetching Homework Not Assign Report. Please try again."
      );
    } finally {
      setIsSubmitting(false);
      setLoadingForSearch(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoadingExams(true);
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/getallClassWithStudentCount`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Staff", response);
      setStudentNameWithClassId(response?.data || []);
    } catch (error) {
      toast.error("Error fetching Classes");
      console.error("Error fetching Classes:", error);
    } finally {
      setLoadingExams(false);
    }
  };

  const fetchClass = async (class_id, section_id) => {
    try {
      setLoadingExams(true);
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/get_teachersbyclassidsectionid`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            class_id: class_id,
            section_id: section_id,
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

  const handleClassSelect = (selectedOption) => {
    setClassError("");
    setSelectedClass(selectedOption);
    setSelectedClassId(selectedOption?.value);
  };

  const handleStudentSelect = (selectedOption) => {
    setStudentError("");
    setSelectedStudent(selectedOption);
    setSelectedStudentId(selectedOption?.value || null);

    // If cleared
    if (!selectedOption) {
      setSelectedClass(null); // Clear dropdown visually
      setSelectedClassId(null);
      return;
    }

    const section_id = selectedOption?.value;
    const class_id = selectedOption?.class_id;

    if (section_id && class_id) {
      fetchClass(class_id, section_id);
    }
  };

  const studentOptions = useMemo(
    () =>
      studentNameWithClassId.map((cls) => ({
        value: cls?.section_id,
        label: `${cls.get_class.name} ${cls.name} (${cls.students_count})`,
        class_id: cls?.class_id,
      })),
    [studentNameWithClassId]
  );

  const classOptions = useMemo(() => {
    if (!Array.isArray(teacher)) return [];

    return teacher.map((cls) => ({
      value: cls?.teacher_id,
      label: `${cls.teachername}`,
    }));
  }, [teacher]);

  // const handleSearch = async () => {
  //   setLoadingForSearch(false);

  //   if (!selectedStudentId) {
  //     setStudentError("Please select Class.");
  //     return;
  //   }

  //   const selectedOption = studentOptions.find(
  //     (option) => option.value === selectedStudentId
  //   );

  //   const section_id = selectedOption?.value;
  //   const class_id = selectedOption?.class_id;

  //   // if (!weekRange || !weekRange.includes("/")) {
  //   //   toast.error("Please select a valid date range.");
  //   //   return;
  //   // }
  //   const rangeToUse = weekRange;

  //   if (!rangeToUse || !rangeToUse.includes("/")) {
  //     toast.error("Please select a valid date range.");
  //     return;
  //   }

  //   try {
  //     setLoadingForSearch(true);
  //     setTimetable([]);

  //     const token = localStorage.getItem("authToken");

  //     const params = {
  //       class_id,
  //       section_id,
  //       teacher_id: selectedClassId || "",
  //       // daterange: weekRange,
  //       daterange: rangeToUse,
  //     };

  //     const response = await axios.get(
  //       `${API_URL}/api/get_homeworknotassignedreport`,
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //         params,
  //       }
  //     );

  //     if (!response?.data?.data || response?.data?.data?.length === 0) {
  //       toast.error("Homework Not Assign Report not found.");
  //       setTimetable([]);
  //     } else {
  //       setTimetable(response.data.data);
  //       setPageCount(Math.ceil(response.data.data.length / pageSize));
  //     }
  //   } catch (error) {
  //     console.error("Error fetching Homework Not Assign Report:", error);
  //     toast.error(
  //       "Error fetching Homework Not Assign Report. Please try again."
  //     );
  //   } finally {
  //     setIsSubmitting(false);
  //     setLoadingForSearch(false);
  //   }
  // };

  const handlePrint = () => {
    const printTitle = `Homework Not Assign Report  ${
      selectedStudent?.label
        ? `List of ${selectedStudent.label}`
        : ": Complete List of All Teacher "
    }`;
    const printContent = `
  <div id="tableMain" class="flex items-center justify-center min-h-screen bg-white">
    <h5 id="tableHeading5" class="text-lg font-semibold border-1 border-black">${printTitle}</h5>
    <div id="tableHeading" class="text-center w-3/4">
      <table class="min-w-full leading-normal table-auto border border-black mx-auto mt-2">
        <thead>
          <tr class="bg-gray-100">
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Sr.No</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Subject</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Dates</th>
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
                    subject?.subject || " "
                  }</td>
                  <td class="px-2 text-center py-2 border border-black">
                    ${
                      subject?.dates?.length > 0
                        ? subject.dates.join("<br>")
                        : " "
                    }
                  </td>
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

          table { border-spacing: 0; width: 100%; margin: auto;   }
          th { font-size: 0.8em; background-color: #f9f9f9; }
          td { font-size: 12px;}
          th, td { border: 1px solid gray; padding: 8px; text-align: center; min-width: 150px }

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

    const headers = ["Sr No.", "Subject", "Dates"];
    const data = displayedSections.map((student, index) => [
      index + 1,
      student?.subject || " ",
      Array.isArray(student?.dates) ? student.dates.join(", ") : " ",
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // Auto column width
    const columnWidths = headers.map(() => ({ wch: 30 }));
    worksheet["!cols"] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Homework Not Assign Report"
    );

    const fileName = `Homework_Not_Assign_Report_${
      selectedStudent?.label || "All_Staff"
    }.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  console.log("row", timetable);

  const filteredSections = timetable.filter((student) => {
    const searchLower = searchTerm.toLowerCase();

    // Extract relevant fields and convert them to lowercase for case-insensitive search
    const subject = student?.subject?.toLowerCase() || "";
    const week = student?.week?.toLowerCase() || "";

    // Check if the search term is present in any of the specified fields
    return subject.includes(searchLower) || week.includes(searchLower);
  });

  const displayedSections = filteredSections.slice(currentPage * pageSize);
  return (
    <>
      {/* <div className="w-full md:w-[100%] mx-auto p-4 "> */}
      <div
        className={`mx-auto p-4 transition-all duration-700 ease-[cubic-bezier(0.4, 0, 0.2, 1)] transform ${
          timetable.length > 0
            ? "w-full md:w-[100%] scale-100"
            : "w-full md:w-[95%] scale-[0.98]"
        }`}
      >
        <ToastContainer />
        <div className="card rounded-md ">
          <div className=" card-header mb-4 flex justify-between items-center ">
            <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
              Homework Not Assign Report
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
              className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-2 w-full ml-2 ${
                timetable.length > 0 ? "pb-0 md:w-[100%]" : "pb-4 md:w-[100%]"
              }`}
            >
              <div className="w-full flex flex-col md:flex-row items-center gap-4">
                {/* Class Select */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <label className="text-md w-[50px]">
                    Class<span className="text-red-500">*</span>
                  </label>
                  <div className="w-36">
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
                      inputProps={{ autoComplete: "off" }}
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          fontSize: ".9em",
                          minHeight: "30px",
                        }),
                        menu: (provided) => ({ ...provided, fontSize: "1em" }),
                        option: (provided) => ({
                          ...provided,
                          fontSize: ".9em",
                        }),
                      }}
                    />
                    <div className="h-0 ">
                      {studentError && (
                        <span className="text-danger text-xs">
                          {studentError}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Teacher Select */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <label className="text-md w-[70px]">Teacher</label>
                  <div className="w-48">
                    <Select
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      id="teacherSelect"
                      value={selectedClass}
                      onChange={handleClassSelect}
                      options={classOptions}
                      placeholder={loadingExams ? "Loading..." : "Select"}
                      isSearchable
                      isClearable
                      className="text-sm"
                      // isDisabled={loadingExams}
                      isDisabled={!selectedStudent || loadingExams}
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          fontSize: ".9em",
                          minHeight: "30px",
                        }),
                        menu: (provided) => ({ ...provided, fontSize: "1em" }),
                        option: (provided) => ({
                          ...provided,
                          fontSize: ".9em",
                        }),
                      }}
                    />
                  </div>
                </div>

                {/* Date Range Picker */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <label className="text-md w-[130px]">
                    Date Range<span className="text-red-500">*</span>
                  </label>
                  <div className="relative ">
                    <div
                      className="border border-gray-300 rounded-lg px-2 py-1 cursor-pointer shadow-md bg-white flex items-center gap-2 hover:ring-2 hover:ring-blue-500 transition-all duration-200 w-fit"
                      onClick={() => setShowPicker(!showPicker)}
                    >
                      📅
                      <span className="text-gray-800 text-sm">
                        {`${formatDate(dateRange[0]?.startDate)} - ${formatDate(
                          dateRange[0]?.endDate
                        )}`}
                      </span>
                    </div>

                    {showPicker && (
                      <div className="absolute z-10 top-12 left-0 bg-white border border-gray-200 rounded-xl shadow-xl max-w-sm">
                        <div className="p-2">
                          <DateRange
                            // onChange={(item) =>
                            //   setTempDateRange([item.selection])
                            // }
                            onChange={(item) => {
                              setTempDateRange([item.selection]);
                              setDateRange([item.selection]); // ✅ update immediately in UI
                            }}
                            ranges={tempDateRange}
                            moveRangeOnFirstSelection={false}
                            editableDateInputs={false}
                            showSelectionPreview={true}
                            months={1}
                            direction="vertical"
                            scroll={{ enabled: false }}
                            rangeColors={["#3b82f6"]}
                            className="compact-date-range"
                            minDate={new Date(academicYrFrom)}
                            maxDate={new Date(academicYrTo)}
                          />
                        </div>

                        {/* <div className="flex justify-between p-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                          <button
                            className="bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                            onClick={handleApply}
                          >
                            Apply
                          </button>
                          <button
                            className="bg-gray-500 text-white px-3 py-1.5 rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                            onClick={() => setShowPicker(false)}
                          >
                            Cancel
                          </button>
                        </div> */}
                      </div>
                    )}
                  </div>
                </div>

                {/* Browse Button */}
                <div className="flex items-center mt-2 md:mt-0">
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

              {/* Optional: Search & Export Buttons if timetable has data */}
              {timetable.length > 0 && (
                <div className="ml-3 mr-3 mt-2 md:mt-0 p-2 px-3 bg-gray-100 flex flex-col md:flex-row items-center gap-2">
                  <div className="w-full md:w-auto">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search"
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-row gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadEXL}
                      className="relative bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded group"
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
                  </div>
                </div>
              )}
            </div>

            {timetable.length > 0 && (
              <>
                <div className="w-full mt-4 px-4 mb-4 ">
                  <div className="card mx-auto lg:w-[80%] shadow-lg">
                    <div className="card-body w-[full]">
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
                              {["Sr No.", "Subject", "Dates"].map(
                                (header, index) => (
                                  <th
                                    key={index}
                                    className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider"
                                  >
                                    {header}
                                  </th>
                                )
                              )}
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
                                    {student?.subject}
                                  </td>

                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student?.dates?.length > 0
                                      ? student.dates.map((date, index) => (
                                          <div key={index}>{date}</div>
                                        ))
                                      : " "}
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

export default HomeworkNotAssignReport;
