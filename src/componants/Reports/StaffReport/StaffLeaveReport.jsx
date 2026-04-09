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

const StaffLeaveReport = () => {
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

  const [category, setCategory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  useEffect(() => {
    // fetchExams();
    fetchLeaveType();
    handleSearch();
    fetchCategory();
  }, []);

  useEffect(() => {
    fetchExams();
  }, [selectedCategoryId]);
  // const fetchExams = async () => {
  //   try {
  //     setLoadingExams(true);
  //     const token = localStorage.getItem("authToken");

  //     const response = await axios.get(
  //       // API -> staff_list
  //       `${API_URL}/api/get_teaching_nonteaching_staff_list`,
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       },
  //     );
  //     console.log("Class", response);
  //     setStudentNameWithClassId(response?.data || []);
  //   } catch (error) {
  //     toast.error("Error fetching Classes");
  //     console.error("Error fetching Classes:", error);
  //   } finally {
  //     setLoadingExams(false);
  //   }
  // };

  const fetchExams = async () => {
    try {
      setLoadingExams(true);
      const token = localStorage.getItem("authToken");

      // ✅ Prepare params conditionally
      let params = {};

      if (selectedCategoryId) {
        params.tc_id = selectedCategoryId; // pass only when selected
      }

      const response = await axios.get(
        `${API_URL}/api/get_teaching_nonteaching_staff_list`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: params, // attach params here
        },
      );

      console.log("Staff List", response);
      setStudentNameWithClassId(response?.data || []);
    } catch (error) {
      toast.error("Error fetching Staff");
      console.error("Error fetching Staff:", error);
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

  const fetchCategory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      const response = await axios.get(`${API_URL}/api/get_teachercategory`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data.data || [];
      setCategory(data);
      console.log("category datta", data);
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
    [studentNameWithClassId],
  );

  const handleCategorySelect = (selectedOption) => {
    setSelectedStudent(null);
    setSelectedStudentId(null);
    setSelectedCategory(selectedOption);
    setSelectedCategoryId(selectedOption?.value);
  };

  const categoryOptions = useMemo(
    () =>
      category.map((cls) => ({
        value: cls?.tc_id,
        label: `${cls.name}`,
      })),
    [category],
  );

  const handleSearch = async () => {
    // Clear any previous error messages and search inputs
    setSearchTerm("");
    setStudentError(""); // if using any field-level error
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
      if (selectedCategoryId) params.tc_id = selectedCategoryId;
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;

      // Fetch staff leave report
      const response = await axios.get(`${API_URL}/api/getstaffleavereport`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      });

      // Log for debugging
      console.log("response", response);

      const resultData = response?.data?.data || [];
      const leaveTypesFromApi = response?.data?.leave_types || [];

      if (resultData.length === 0) {
        toast.error("Staff Leave Report data not found.");
      }

      setTimetable(resultData);
      setLeaveTypes(leaveTypesFromApi);
      setPageCount(Math.ceil(resultData.length / pageSize));
    } catch (error) {
      console.error("Error fetching Staff Leave Report:", error);
      toast.error(
        error?.response?.data?.message ||
          "Error fetching Staff Leave Report. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
      setLoadingForSearch(false);
    }
  };

  const capitalizeWords = (str) =>
    str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

  const handlePrint = () => {
    const printTitle = `Staff Leave Report  ${
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
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Staff Name</th>
            ${leaveTypes
              .map(
                (type) =>
                  `<th class="px-2 text-center py-2 border border-black text-sm font-semibold">${type}</th>`,
              )
              .join("")}
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Total</th>
           
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
                 ${capitalizeWords(subject.staff_name)}
              </td>
                ${leaveTypes
                  .map(
                    (type) =>
                      `<td class="px-2 text-center py-2 border border-black">${
                        subject.leaves?.[type] ?? 0
                      }</td>`,
                  )
                  .join("")}
                  <td class="px-2 text-center py-2 border border-black">${
                    subject?.total || "0"
                  }</td>
              </tr>`,
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

    // Define headers — separate each leave type
    const headers = [
      "Sr No.",
      "Staff Name",
      ...leaveTypes, // <-- spread each leave type as a separate column
      "Total",
    ];

    // Convert displayedSections to array-of-arrays format
    const data = displayedSections.map((student, index) => [
      index + 1,
      `${student.staff_name}`,
      ...leaveTypes.map((type) => student.leaves?.[type] ?? 0), // <-- spread leave values
      student?.total || "0",
    ]);

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // Auto-adjust column widths
    worksheet["!cols"] = headers.map(() => ({ wch: 20 }));

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Staff Leave Report");

    // Generate file name and trigger download
    const fileName = `Staff_Leave_Report_${
      selectedStudent?.label || "All_Staff"
    }.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  console.log("row", timetable);

  const filteredSections = timetable.filter((student) => {
    const searchLower = searchTerm.toLowerCase();

    // Staff name
    const staffName = student?.staff_name?.toLowerCase() || "";

    // Check if search term is in name or any leave count
    return staffName.includes(searchLower);
  });

  const displayedSections = filteredSections.slice(currentPage * pageSize);

  return (
    <>
      {/* <div className="w-full md:w-[90%] mx-auto p-4 "> */}
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
              Staff Leave Report
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
            {/* <div className=" w-full md:w-[95%] flex justify-center flex-col md:flex-row gap-x-1 ml-0 p-2"> */}
            <div
              className={`w-full flex flex-col md:flex-row md:items-end gap-4 p-2 ${
                timetable.length > 0 ? "md:w-[100%]" : "md:w-[95%]"
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
                  {/* <div className="w-full  md:w-[70%] gap-x-2 justify-around my-1 md:my-4 flex md:flex-row">
                    <label
                      className="w-full md:w-[27%] text-md pl-0 md:pl-5 mt-1.5"
                      htmlFor="studentSelect"
                    >
                      Staff
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

                  <div className="w-full  md:w-[70%] gap-x-2 justify-around my-1 md:my-4 flex md:flex-row">
                    <label
                      className="w-full md:w-[35%] text-md pl-0 md:pl-5 mt-1.5"
                      htmlFor="studentSelect"
                    >
                      Category
                    </label>
                    <div className="w-full md:w-[70%]">
                      <Select
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        id="studentSelect"
                        value={selectedCategory}
                        onChange={handleCategorySelect}
                        options={categoryOptions}
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

                  <div className="w-full   md:w-[70%] gap-x-2 justify-between my-1 md:my-4 flex md:flex-row">
                    <label
                      className="ml-0 md:ml-4 w-full md:w-[70%] text-md mt-1.5"
                      htmlFor="fromDate"
                    >
                      From Date
                    </label>
                    <div className="w-full">
                      <input
                        type="date"
                        id="fromDate"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="text-sm w-full border border-gray-300 rounded px-2 py-2"
                      />
                    </div>
                  </div>

                  <div className="w-full  md:w-[70%] gap-x-2 justify-between my-1 md:my-4 flex md:flex-row">
                    <label
                      className="ml-0 md:ml-4 w-full md:w-[50%] text-md mt-1.5"
                      htmlFor="toDate"
                    >
                      To Date
                    </label>
                    <div className="w-full">
                      <input
                        type="date"
                        id="toDate"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="text-sm w-full border border-gray-300 rounded px-2 py-2"
                      />
                    </div>
                  </div>

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
                  </div> */}
                  <div className="w-full flex flex-wrap items-end gap-4">
                    {/* Category */}
                    <div className="flex flex-col w-full md:w-[18%]">
                      <label className="text-sm mb-1">Category</label>
                      <Select
                        value={selectedCategory}
                        onChange={handleCategorySelect}
                        options={categoryOptions}
                        placeholder="Select"
                        isSearchable
                        isClearable
                        className="text-sm"
                      />
                    </div>

                    {/* Staff */}
                    <div className="flex flex-col w-full md:w-[18%]">
                      <label className="text-sm mb-1">Staff</label>
                      <Select
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        value={selectedStudent}
                        onChange={handleStudentSelect}
                        options={studentOptions}
                        placeholder={loadingExams ? "Loading..." : "Select"}
                        isSearchable
                        isClearable
                        isDisabled={loadingExams}
                        className="text-sm"
                      />
                      {studentError && (
                        <span className="text-xs text-red-500 mt-1">
                          {studentError}
                        </span>
                      )}
                    </div>

                    {/* From Date */}
                    <div className="flex flex-col w-full md:w-[18%]">
                      <label className="text-sm mb-1">From Date</label>
                      <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="h-[38px] border border-gray-300 rounded px-2 text-sm"
                      />
                    </div>

                    {/* To Date */}
                    <div className="flex flex-col w-full md:w-[18%]">
                      <label className="text-sm mb-1">To Date</label>
                      <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="h-[38px] border border-gray-300 rounded px-2 text-sm"
                      />
                    </div>

                    {/* Button */}
                    <div className="flex items-end w-full md:w-[15%]">
                      <button
                        type="button"
                        onClick={handleSearch}
                        disabled={loadingForSearch}
                        className={`w-full h-[38px] rounded text-white font-medium 
      bg-blue-500 hover:bg-blue-600 transition flex items-center justify-center
      ${loadingForSearch ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {loadingForSearch ? (
                          <>
                            <svg
                              className="animate-spin h-4 w-4 mr-2"
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
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                              />
                            </svg>
                            Browsing...
                          </>
                        ) : (
                          "Browse"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {timetable.length > 0 && (
                <div className="flex gap-2 items-end  bg-gray-100 p-2">
                  <input
                    type="text"
                    className="form-control border border-gray-300 rounded px-2 py-1 text-sm"
                    placeholder="Search"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleDownloadEXL}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    <FaFileExcel />
                  </button>
                  <button
                    onClick={handlePrint}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    <FiPrinter />
                  </button>
                </div>
              )}
            </div>

            {timetable.length > 0 && (
              <>
                <div className="w-full px-4 mt-4 mb-4">
                  <div className="card mx-auto lg:w-full shadow-lg">
                    {/* <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                      <div className="w-full   flex flex-row justify-between mr-0 md:mr-4 ">
                        <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
                          List of Staff Leave Report
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
                              <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                Sr No.
                              </th>
                              <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                Staff Name
                              </th>

                              {leaveData.map((leave, index) => (
                                <th
                                  key={index}
                                  className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider"
                                >
                                  {leave.name}
                                </th>
                              ))}

                              <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                Total
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
                                    {student?.staff_name
                                      ? student.staff_name
                                          .toLowerCase()
                                          .split(" ")
                                          .map((word) =>
                                            word
                                              .split("'")
                                              .map(
                                                (part) =>
                                                  part.charAt(0).toUpperCase() +
                                                  part.slice(1),
                                              )
                                              .join("'"),
                                          )
                                          .join(" ")
                                      : " "}
                                  </td>

                                  {leaveTypes.map((type) => (
                                    <td
                                      key={type}
                                      className="border px-2 py-2 text-center"
                                    >
                                      {student.leaves?.[type] ?? 0}
                                    </td>
                                  ))}
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student?.total || "0"}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <div className=" absolute left-[1%] w-[100%]  text-center flex justify-center items-center mt-14">
                                <div className=" text-center text-xl text-red-700">
                                  Result not found!
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

export default StaffLeaveReport;
