import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
// import Loader from "../../common/LoaderFinal/LoaderStyle";
import { FiPrinter } from "react-icons/fi";
import { FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";

const TicketReport = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [loadingForSearch, setLoadingForSearch] = useState(false);

  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedAccountId, setSelectedAccountId] = useState(null);

  const [orderId, setOrderId] = useState("");

  const navigate = useNavigate();
  const [loadingExams, setLoadingExams] = useState(false);
  const [formDateError, setFormDateError] = useState("");
  const [toDateError, setToDateError] = useState("");
  const [accountError, setAccountError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusOptions, setStatusOptions] = useState([]);

  const [timetable, setTimetable] = useState([]);

  const pageSize = 10;
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (selectedAccount) {
      setSelectedAccountId(selectedAccount.value);
    }
  }, [selectedAccount]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr)
      .toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
      .replace(",", " ,")
      .toLowerCase();
  };

  useEffect(() => {
    const fetchStatusOptions = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          `${API_URL}/api/get_statusesforticketlist`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data?.data) {
          const transformedOptions = response.data.data.map((item) => ({
            value: item.status,
            label: item.status,
          }));
          setStatusOptions(transformedOptions);
        }
      } catch (error) {
        console.error("Failed to fetch status options", error);
      }
    };

    fetchStatusOptions();
  }, []);

  const handleAccountSelect = (selectedOption) => {
    setSelectedAccount(selectedOption);

    // Store only the value separately, ensuring "All" is stored as an empty string
    setSelectedAccountId(
      selectedOption.value === "" ? "" : selectedOption.value
    );

    // Clear error if a valid option is selected
    if (selectedOption) {
      setAccountError("");
    }
  };

  const handleChangeDate = (event, field) => {
    const { value } = event.target;

    if (field === "fromDate") {
      setFromDate(value);
      setFormDateError(""); // Remove error when user selects a date

      // Ensure 'To Date' is not earlier than 'From Date'
      //   if (toDate && value > toDate) {
      //     setToDate(value);
      //   }
    } else if (field === "toDate") {
      // Prevent selecting 'To Date' earlier than 'From Date'
      //   if (value >= fromDate) {
      setToDate(value);
      setToDateError(""); // Remove error when user selects a valid date
      //   }
    }
  };

  const handleSearch = async () => {
    setLoadingForSearch(false);

    if (!selectedAccount) {
      setAccountError("Please select Status.");
      return;
    }

    setAccountError("");
    setFormDateError("");
    setToDateError("");
    setSearchTerm("");

    try {
      setLoadingForSearch(true);
      setTimetable([]);
      const token = localStorage.getItem("authToken");

      let params = {
        status: selectedAccount.value === "" ? "" : selectedAccount.label,
      };

      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;

      console.log("API Params:", params); // Debug

      const response = await axios.get(`${API_URL}/api/get_ticketreport`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
        paramsSerializer: (params) => {
          return new URLSearchParams(params).toString();
        },
      });

      console.log("API Response:", response?.data);

      if (!response?.data?.data || response?.data?.data?.length === 0) {
        setTimetable([]);
        toast.error("No records found for selected criteria.");
      } else {
        setTimetable(response?.data?.data);
        setPageCount(Math.ceil(response?.data?.data?.length / pageSize));
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      toast.error("Error fetching data. Please try again.");
    } finally {
      setIsSubmitting(false);
      setLoadingForSearch(false);
    }
  };

  const handlePrint = () => {
    const printTitle = ` Ticket Report ${selectedAccount?.label || ""}`;
    const printContent = `
    <div id="tableMain" class="flex items-center justify-center min-h-screen bg-white">
         <h5 id="tableHeading5"  class="text-lg font-semibold border-1 border-black">${printTitle}</h5>
    <div id="tableHeading" class="text-center w-3/4">
      <table class="min-w-full leading-normal table-auto border border-black mx-auto mt-2">
        <thead>
          <tr class="bg-gray-100">
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Sr.No</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Status</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Raised On</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Service Name</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Created By</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Student Name</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Class</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Division</th>
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
                  subject?.status || " "
                }</td>
                <td class="px-2 text-center py-2 border border-black">
                ${formatDate(subject?.raised_on || " ")}</td>
                <td class="px-2 text-center py-2 border border-black">${
                  subject?.service_name || ""
                }</td>
                 <td class="px-2 text-center py-2 border border-black">${
                   subject?.createdby || ""
                 }</td>
                  <td class="px-2 text-center py-2 border border-black">
                  ${`${subject?.first_name} ${subject?.mid_name} ${subject?.last_name}`}
                  </td>
                <td class="px-2 text-center py-2 border border-black">${
                  subject?.classname || " "
                }</td>
                <td class="px-2 text-center py-2 border border-black">${
                  subject?.sectionname || " "
                }</td>
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

    //  Ensure content is fully loaded before printing
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
      "Status",
      "Raised On",
      "Service Name",
      "Created By",
      "Student Name",
      "Class",
      "Division",
    ];

    const formatDateSheet = (dateStr) => {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      if (isNaN(date)) return "";

      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();

      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      const ampm = hours >= 12 ? "pm" : "am";
      hours = hours % 12 || 12;
      const hourStr = String(hours).padStart(2, "0");

      return `${day}/${month}/${year} , ${hourStr}:${minutes}:${seconds} ${ampm}`;
    };
    // Convert displayedSections data to array format for Excel
    const data = displayedSections.map((student, index) => [
      index + 1,
      student?.status || " ",
      `${formatDateSheet(student?.raised_on || " ")}`,
      student?.service_name || " ",
      student?.createdby || " ",
      `${student?.first_name} ${student?.mid_name} ${student?.last_name}`,
      student?.classname || " ",
      student?.sectionname || " ",
    ]);

    // Create a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // Auto-adjust column width
    const columnWidths = headers.map(() => ({ wch: 20 })); // Approx. width of 20 characters per column
    worksheet["!cols"] = columnWidths;

    // Create a workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ticket Report Data");

    // Generate and download the Excel file
    const fileName = `Ticket_Report.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  console.log("row", timetable);

  const filteredSections = timetable.filter((student) => {
    // Normalize search term: trim spaces and replace multiple spaces with a single space
    const searchLower = searchTerm.trim().replace(/\s+/g, " ").toLowerCase();

    // Extract relevant fields and normalize them for search
    const normalize = (value) =>
      value?.toString().trim().replace(/\s+/g, " ").toLowerCase() || "";

    const studentName = normalize(
      `${student?.first_name || ""} ${student?.mid_name || ""} ${
        student?.last_name || ""
      }`.trim()
    );
    const createdBy = normalize(student?.createdby);
    const raisedOn = formatDate(student?.raised_on);
    const className = normalize(student?.class_name);
    const serviceName = normalize(student?.service_name);
    const sectionName = normalize(student?.sectionname);

    // Check if the search term is present in any of the specified fields
    return (
      studentName.includes(searchLower) ||
      createdBy.includes(searchLower) ||
      raisedOn.includes(searchLower) ||
      className.includes(searchLower) ||
      serviceName.includes(searchLower) ||
      sectionName.includes(searchLower)
    );
  });

  const displayedSections = filteredSections.slice(currentPage * pageSize);

  return (
    <>
      <div className="w-full md:w-[96%] mx-auto p-4 ">
        <ToastContainer />
        <div className="card p-4 rounded-md ">
          <div className=" card-header mb-4 flex justify-between items-center ">
            <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
              Ticket Report
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
            <div className="container mx-auto px-4">
              <div className="w-full md:w-[110%] relative right-0  mx-auto flex flex-wrap items-start gap-10 p-2">
                {/* Status*/}
                <div className="flex flex-col h-[80px]">
                  <label className="text-md mb-1" htmlFor="status">
                    Status <span className="text-sm text-red-500">*</span>
                  </label>
                  <Select
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    id="status"
                    value={selectedAccount}
                    onChange={handleAccountSelect}
                    options={statusOptions}
                    placeholder="Select"
                    isSearchable
                    isClearable={false}
                    className="text-sm w-[180px]"
                  />
                  <div className="h-[16px] text-red-500 text-xs mt-1">
                    {accountError && <span>{accountError}</span>}
                  </div>
                </div>

                {/* From Date */}
                <div className="flex flex-col h-[80px]">
                  <label className="text-md mb-1" htmlFor="fromDate">
                    From Date
                    {/* <span className="text-sm text-red-500">*</span> */}
                  </label>
                  <input
                    type="date"
                    id="fromDate"
                    value={fromDate}
                    onChange={(e) => handleChangeDate(e, "fromDate")}
                    className="text-sm border border-gray-300 rounded px-2 py-2 w-[180px]"
                  />
                  <div className="h-[16px] text-red-500 text-xs mt-1">
                    {formDateError && <span>{formDateError}</span>}
                  </div>
                </div>

                {/* To Date */}
                <div className="flex flex-col h-[80px]">
                  <label className="text-md mb-1" htmlFor="toDate">
                    To Date
                    {/* <span className="text-sm text-red-500">*</span> */}
                  </label>
                  <input
                    type="date"
                    id="toDate"
                    value={toDate}
                    onChange={(e) => handleChangeDate(e, "toDate")}
                    className="text-sm border border-gray-300 rounded px-2 py-2 w-[180px]"
                    min={fromDate}
                    max={new Date().toISOString().split("T")[0]}
                  />
                  <div className="h-[16px] text-red-500 text-xs mt-1">
                    {toDateError && <span>{toDateError}</span>}
                  </div>
                </div>

                {/* Search Button */}
                <div className="flex items-end mt-4">
                  <button
                    type="search"
                    onClick={handleSearch}
                    style={{ backgroundColor: "#2196F3" }}
                    className={`btn h-10 btn-primary text-white font-bold py-1 px-6 rounded ${
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
                        Searching...
                      </span>
                    ) : (
                      "Search"
                    )}
                  </button>
                </div>
              </div>
            </div>

            {timetable.length > 0 && (
              <>
                <div className="w-full  mt-4">
                  <div className="card mx-auto lg:w-full shadow-lg">
                    <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                      <div className="w-full flex flex-row justify-between mr-0 md:mr-4 ">
                        <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
                          List of Ticket Report
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
                    ></div>

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
                              {[
                                "Sr No.",
                                "Status",
                                "Raised On",
                                "Service Name",
                                "Created By",
                                "Student Name",
                                "Class",
                                "Division",
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
                                    {student?.status || " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student?.raised_on
                                      ? formatDate(student?.raised_on)
                                      : ""}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student?.service_name || " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student?.createdby || ""}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student?.first_name} {student?.mid_name}{" "}
                                    {student?.last_name}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student?.classname || " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student?.sectionname || " "}
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

export default TicketReport;
