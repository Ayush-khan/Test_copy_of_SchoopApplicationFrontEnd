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

const TeacherRemarkReport = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const academicYrFrom = localStorage.getItem("academic_yr_from");
  const academicYrTo = localStorage.getItem("academic_yr_to");

  console.log("from year", academicYrFrom);
  console.log("to yaer", academicYrTo);

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

  useEffect(() => {
    fetchExams();
    fetchLeaveType();
    handleSearch();
  }, []);

  const fetchExams = async () => {
    try {
      setLoadingExams(true);
      const token = localStorage.getItem("authToken");

      const response = await axios.get(`${API_URL}/api/staff_list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Class", response);
      setStudentNameWithClassId(response?.data || []);
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

  const handleStudentSelect = (selectedOption) => {
    setStudentError(""); // Reset error if student is select.
    setSelectedStudent(selectedOption);
    setSelectedStudentId(selectedOption?.value);
  };

  const studentOptions = useMemo(
    () =>
      studentNameWithClassId.map((cls) => ({
        value: cls?.teacher_id,
        label: `${cls.name}`,
      })),
    [studentNameWithClassId]
  );
  const formatDateToDDMMYYYY = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleSearch = async () => {
    // Clear any previous error messages and search inputs
    setSearchTerm("");
    setStudentError("");
    setTimetable([]);
    setLeaveTypes([]);
    setPageCount(0);
    setIsSubmitting(true);
    setLoadingForSearch(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Authentication token missing!");
        setLoadingForSearch(false);
        setIsSubmitting(false);
        return;
      }

      // Prepare query params
      const params = {};
      if (selectedStudentId) params.staff_id = selectedStudentId;
      if (fromDate) params.date = formatDateToDDMMYYYY(fromDate);
      if (toDate) params.to_date = formatDateToDDMMYYYY(toDate);

      const response = await axios.get(
        `${API_URL}/api/getteacherremarkreport`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params,
        }
      );

      console.log("response", response);

      const resultData = response?.data?.data || [];
      const leaveTypesFromApi = response?.data?.leave_types || [];

      if (resultData.length === 0) {
        toast.error("Staff Remark Report data not found.");
      }

      setTimetable(resultData);
      setLeaveTypes(leaveTypesFromApi);
      setPageCount(Math.ceil(resultData.length / pageSize));
    } catch (error) {
      console.error("Error fetching Staff Remark Report:", error);
      toast.error(
        error?.response?.data?.message ||
          "Error fetching Staff Remark Report. Please try again."
      );
    } finally {
      setIsSubmitting(false);
      setLoadingForSearch(false);
    }
  };

  const capitalizeWords = (str) =>
    str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

  const handlePrint = () => {
    const printTitle = `Staff Remark Report  ${
      selectedStudent?.label
        ? `List of ${selectedStudent.label}`
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
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Date</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Staff Name</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Type</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Remark Subject</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Description</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Published</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Acknowledge</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Viewed</th>
           
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
                  subject?.remark_date
                    ? new Date(subject?.remark_date).toLocaleDateString("en-GB")
                    : ""
                }</td>
                 <td class="px-2 text-center py-2 border border-black">
                 ${capitalizeWords(subject?.name || "")}</td>
                  <td class="px-2 text-center py-2 border border-black">${
                    subject?.remark_type || ""
                  }</td>
                   <td class="px-2 text-center py-2 border border-black">${
                     subject?.remark_subject || "0"
                   }</td>
                    <td class="px-2 text-center py-2 border border-black">${
                      subject?.remark_desc || "0"
                    }</td>
               
                  <td class="px-2 text-center py-2 border border-black">${
                    subject?.published || "0"
                  }</td>
                   <td class="px-2 text-center py-2 border border-black">${
                     subject?.acknowledged || "0"
                   }</td>
                    <td class="px-2 text-center py-2 border border-black">${
                      subject?.viewed || "0"
                    }</td>
              </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>
  </div>`;

    const printWindow = window.open("", "_blank", "width=1500,height=800");

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

    // Define headers — separate each leave type
    const headers = [
      "Sr No.",
      "Date",
      "Teacher Name",
      "Type",
      "Remark Subject",
      "Description",
      "Published",
      "Ackonwledge",
      "Viewed",
    ];

    // Convert displayedSections to array-of-arrays format
    const data = displayedSections.map((student, index) => [
      index + 1,
      `${
        student?.remark_date
          ? new Date(student?.remark_date).toLocaleDateString("en-GB")
          : ""
      }`,
      `${capitalizeWords(student?.name || "")}`,
      student?.remark_type || "",
      student?.remark_subject || "",
      student?.remark_desc || "",
      student?.published || "",
      student?.acknowledged || "",
      student?.viewed || "",
    ]);

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // Auto-adjust column widths
    worksheet["!cols"] = headers.map(() => ({ wch: 20 }));

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Staff Remark Report");

    // Generate file name and trigger download
    const fileName = `Staff_Remark_Report_${
      selectedStudent?.label || "All_Teacher"
    }.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return ""; // invalid date
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  console.log("row", timetable);

  const filteredSections = timetable.filter((student) => {
    const searchLower = searchTerm.toLowerCase();

    // Staff name
    const staffName = student?.name?.toLowerCase() || "";
    const remarkType = student?.remark_type?.toLowerCase() || "";
    const remarkDesc = student?.remark_desc?.toLowerCase() || "";
    const remarkSubject = student?.remark_subject?.toLowerCase() || "";
    const remarkDate = student?.remark_date
      ? formatDate(student.remark_date)
      : "";

    // Check if search term is in name or any leave count
    return (
      staffName.includes(searchLower) ||
      remarkType.includes(searchLower) ||
      remarkDesc.includes(searchLower) ||
      remarkSubject.includes(searchLower) ||
      remarkDate.includes(searchLower)
    );
  });

  const displayedSections = filteredSections.slice(currentPage * pageSize);

  return (
    <>
      {/* <div className="w-full md:w-[90%] mx-auto p-4 "> */}
      <div
        className={`mx-auto p-4 transition-all duration-700 ease-[cubic-bezier(0.4, 0, 0.2, 1)] transform ${
          timetable.length > 0
            ? "w-full md:w-[90%] scale-100"
            : "w-full md:w-[80%] scale-[0.98]"
        }`}
      >
        <ToastContainer />
        <div className="card rounded-md ">
          <div className=" card-header mb-4 flex justify-between items-center ">
            <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
              Staff Remark Report
            </h5>
            <RxCross1
              className=" relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
              onClick={() => {
                navigate("/dashboard");
              }}
            />
          </div>
          <div
            className=" relative w-[98%]   -top-6 h-1  mx-auto bg-red-700"
            style={{
              backgroundColor: "#C03078",
            }}
          ></div>

          <>
            {/* <div className=" w-full md:w-[80%]   flex justify-center flex-col md:flex-row gap-x-1     ml-0    p-2" */}
            <div
              className={`  flex justify-between flex-col md:flex-row gap-x-1 ml-0 p-2  ${
                timetable.length > 0
                  ? "pb-0 w-full md:w-[99%]"
                  : "pb-4 w-full md:w-[80%]"
              }`}
            >
              <div className="w-full md:w-[80%] flex md:flex-row justify-between items-center mt-0 md:mt-4">
                {/* <div className="w-full  gap-x-0 md:gap-x-12 flex flex-col gap-y-2 md:gap-y-0 md:flex-row"> */}
                <div
                  className={`  w-full gap-x-0 md:gap-x-12  flex flex-col gap-y-2 md:gap-y-0 md:flex-row ${
                    timetable.length > 0
                      ? "w-full md:w-[75%]  wrelative left-0"
                      : " w-full md:w-[95%] relative left-10"
                  }`}
                >
                  {/* Class Dropdown */}
                  <div className="w-full  md:w-[50%] gap-x-2 justify-around my-1 md:my-4 flex md:flex-row">
                    <label
                      className="w-full md:w-[30%] text-md pl-0 md:pl-5 mt-1.5"
                      htmlFor="studentSelect"
                    >
                      Staff
                    </label>
                    <div className="w-full md:w-[80%]">
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
                            fontSize: ".9em", // Adjust font size for dropdown options
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
                  <div className="w-full   md:w-[50%] gap-x-4 justify-between my-1 md:my-4 flex md:flex-row">
                    <label
                      className="ml-0 md:ml-4 w-full md:w-[30%] text-md mt-1.5"
                      htmlFor="fromDate"
                    >
                      Date
                    </label>
                    <div className="w-full">
                      <input
                        type="date"
                        id="fromDate"
                        value={fromDate}
                        min={localStorage.getItem("academic_yr_from") || ""}
                        max={localStorage.getItem("academic_yr_to") || ""}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="text-sm w-full border border-gray-300 rounded px-2 py-2"
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
                <div className="w-full px-4 mb-4 mt-4">
                  <div className="card mx-auto lg:w-full shadow-lg">
                    {/* <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                      <div className="w-full   flex flex-row justify-between mr-0 md:mr-4 ">
                        <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
                          List of Staff Remark Report
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
                          scrollbarWidth: "thin", // Makes scrollbar thin in Firefox
                          scrollbarColor: "#C03178 transparent", // Sets track and thumb color in Firefox
                        }}
                      >
                        <table className="min-w-full leading-normal table-auto">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider w-10">
                                Sr No.
                              </th>
                              <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider w-14">
                                Date
                              </th>
                              <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider w-60">
                                Staff Name
                              </th>
                              <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider w-24">
                                Type
                              </th>
                              <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider w-48">
                                Remark Subject
                              </th>
                              <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider w-64">
                                Description
                              </th>
                              <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider w-20">
                                Published
                              </th>
                              <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider w-20">
                                Acknowledge
                              </th>
                              <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider w-20">
                                Viewed
                              </th>
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
                                    {student?.remark_date
                                      ? new Date(
                                          student?.remark_date
                                        ).toLocaleDateString("en-GB")
                                      : ""}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student?.name
                                      ? student.name
                                          .toLowerCase()
                                          .split(" ")
                                          .map((word) =>
                                            word
                                              .split("'")
                                              .map(
                                                (part) =>
                                                  part.charAt(0).toUpperCase() +
                                                  part.slice(1)
                                              )
                                              .join("'")
                                          )
                                          .join(" ")
                                      : " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student?.remark_type || ""}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student?.remark_subject || ""}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student?.remark_desc || ""}
                                  </td>
                                  {student?.published === "No" &&
                                  student?.acknowledged === "No" &&
                                  student?.viewed === "No" ? (
                                    <>
                                      <td className="px-2 py-2 text-center border border-gray-300"></td>
                                      <td className="px-2 py-2 text-center border border-gray-300"></td>
                                      <td className="px-2 py-2 text-center border border-gray-300"></td>
                                    </>
                                  ) : (
                                    <>
                                      <td className="px-2 py-2 text-center border border-gray-300">
                                        {student?.published || ""}
                                      </td>
                                      <td className="px-2 py-2 text-center border border-gray-300">
                                        {student?.acknowledged || ""}
                                      </td>
                                      <td className="px-2 py-2 text-center border border-gray-300">
                                        {student?.viewed || ""}
                                      </td>
                                    </>
                                  )}
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

export default TeacherRemarkReport;
