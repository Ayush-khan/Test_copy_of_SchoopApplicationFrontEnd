import { useEffect, useState, useRef } from "react";
import axios from "axios";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RxCross1 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import { FaFileExcel } from "react-icons/fa";
import { FiPrinter, FiSearch } from "react-icons/fi";
import * as XLSX from "xlsx";

function SubscriptionReminder() {
  const API_URL = import.meta.env.VITE_API_URL; // URL for host
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const [selectedIds, setSelectedIds] = useState([]);
  const [message, setMessage] = useState("");

  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [backendErrors, setBackendErrors] = useState("");

  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");

  const pageSize = 10;
  const maxCharacters = 150;

  const fetchSections = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(`${API_URL}/api/subscription/reminder`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      setSections(response.data.data);
      showSearch(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })
      : "";

  useEffect(() => {
    const trimmedSearch = searchTerm.trim().toLowerCase();

    if (trimmedSearch !== "" && prevSearchTermRef.current === "") {
      previousPageRef.current = currentPage;
      setCurrentPage(0);
    }

    if (trimmedSearch === "" && prevSearchTermRef.current !== "") {
      setCurrentPage(previousPageRef.current);
    }

    prevSearchTermRef.current = trimmedSearch;
  }, [searchTerm]);

  const filteredSections = (sections || []).filter((section) => {
    const searchLower = searchTerm.trim().replace(/\s+/g, " ").toLowerCase();

    const serviceMatch = section?.title
      ?.trim()
      .toLowerCase()
      .includes(searchLower);

    const subscriptionNO = section?.subscription_no
      ?.trim()
      .toLowerCase()
      .includes(searchLower);

    const frequency = section?.frequency
      ?.trim()
      .toLowerCase()
      .includes(searchLower);

    const emailId = section?.email_ids
      ?.trim()
      .toLowerCase()
      .includes(searchLower);

    const fromDate = formatDate(section?.from_date).includes(searchLower);

    const toDate = formatDate(section?.to_date).includes(searchLower);

    return (
      serviceMatch ||
      subscriptionNO ||
      frequency ||
      emailId ||
      fromDate ||
      toDate
    );
  });

  useEffect(() => {
    setPageCount(Math.ceil(filteredSections.length / pageSize));
  }, [filteredSections, pageSize]);

  const displayedSections = filteredSections.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize,
  );

  useEffect(() => {
    setPageCount(Math.ceil(filteredSections.length / pageSize));
  }, [filteredSections]);

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const handlePrint = () => {
    const printTitle = `Subscription Reminder Report`;
    const printContent = `
    <div id="tableMain" class="flex items-center justify-center min-h-screen bg-white">
         <h5 id="tableHeading5"  class="text-lg font-semibold border-1 border-black">${printTitle}</h5>
    <div id="tableHeading" class="text-center w-3/4">
      <table class="min-w-full leading-normal table-auto border border-black mx-auto mt-2">
        <thead>
          <tr class="bg-gray-100">
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Sr.No</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Title</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Subscription No.</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">From Date</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">To Date</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Email Id</th>
          </tr>
        </thead>
     <tbody>
      ${sections
        .map((student, index) => {
          return `
          <tr style="background-color: ${index % 2 === 0 ? "#fff" : "#f9fafb"
            };">
            <td style="border: 1px solid #ccc; padding: 6px;">${index + 1}</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${student.title || ""
            }</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${student.subscription_no || ""
            }</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${formatDate(
              student.from_date || "",
            )}</td>
              <td style="border: 1px solid #ccc; padding: 6px;">${formatDate(
              student.to_date || "",
            )}</td>
             <td style="border: 1px solid #ccc; padding: 6px;">${student.email_ids || ""
            }</td>
          </tr>
        `;
        })
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

    printWindow.onload = function () {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  const handleDownloadEXL = () => {
    if (!displayedSections || displayedSections.length === 0) {
      toast.error("No data available to download the Excel sheet.");
      return;
    }

    const headers = [
      "Sr No.",
      "Title",
      "Subscription No.",
      "From Date",
      "To Date",
      "Email Id",
    ];

    const data = filteredSections.map((student, index) => [
      index + 1,
      student?.title || " ",
      student?.subscription_no || " ",
      formatDate(student?.from_date || " "),
      formatDate(student?.to_date || " "),
      student?.email_ids || " ",
    ]);

    // Create a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // Auto-adjust column width
    const columnWidths = headers.map(() => ({ wch: 20 })); // Approx. width of 20 characters per column
    worksheet["!cols"] = columnWidths;

    // Create a workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Subscription Reminder");

    // Generate and download the Excel file
    const fileName = `Subscription Reminder Report.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = sections.map((item) => item.subscription_id);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    let hasError = false;
    if (selectedIds.length === 0) {
      toast.error(
        "Please select at least one subscription to send message to the team.",
      );
      hasError = true;
    }
    // Exit if there are validation errors
    if (hasError) return;

    try {
      setLoading(true); // Start loading

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token is found");
      }

      // console.log("selectedIds", selectedIds);
      // console.log("message", message);

      const postData = {
        subscriptionId: selectedIds,
        message: message,
      };

      // Make the API call
      const response = await axios.post(
        `${API_URL}/api/subscription/reminder/mail`,
        postData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Handle successful response
      if (response.status === 200) {
        toast.success("Message sent successfully!");

        setMessage("");

        setSelectedIds([]);
      }
    } catch (error) {
      console.error("Error:", error.response?.data);

      // Display error message
      toast.error("An error occurred while sending message.");

      if (error.response && error.response.data) {
        setBackendErrors(error.response.data || {});
      }
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <>
      <div className="w-full md:w-[95%] mx-auto p-4 ">
        <ToastContainer />

        <div className="card rounded-md ">
          <div className="p-1 px-3 bg-gray-100 flex justify-between items-center">
            <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
              Subscription Reminder
            </h3>{" "}
            <div className="box-border flex md:gap-x-2 justify-end md:h-10">
              {filteredSections.length > 0 && (
                <div className="md:absolute md:right-10 mb-5 text-gray-500">
                  <div className="mx-auto w-fit px-2 py-1 bg-blue-50 border border-blue-300 text-blue-800 text-sm rounded text-center">
                    <div className="flex flex-col md:flex-row gap-x-1 justify-center md:justify-end">
                      <button
                        type="button"
                        onClick={() => setShowSearch((prev) => !prev)}
                        className="relative bg-blue-400 py-1 hover:bg-blue-500 text-white px-3 rounded group"
                      >
                        <FiSearch size={15} />

                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex items-center justify-center bg-gray-600  text-white text-[.7em] rounded-md py-1 px-2">
                          Search
                        </div>
                      </button>

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
                </div>
              )}
              <RxCross1
                className="text-red-600 cursor-pointer hover:bg-red-100 rounded text-xl mt-1.5"
                onClick={() => navigate("/dashboard")}
              />
            </div>
          </div>
          <div
            className=" relative w-[97%]   mb-3 h-1  mx-auto bg-red-700"
            style={{
              backgroundColor: "#C03078",
            }}
          ></div>

          <div className="card-body w-full">
            {showSearch && (
              <>
                <div className="p-1 px-3 mb-1 bg-gray-100 border-none">
                  <div className="w-full flex justify-end mr-0 md:mr-4">
                    <div className="w-1/2 md:w-[25%] mr-1">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
            <div
              className="lg:h-96 overflow-y-scroll lg:overflow-x-scroll"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#C03178 transparent",
              }}
            >
              <div className="bg-white rounded-lg shadow-xs">
                <table className="min-w-full leading-normal table-auto">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Sr. No
                      </th>
                      <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        <div className="flex flex-col items-center">
                          <span>Select All</span>
                          <input
                            type="checkbox"
                            onChange={handleSelectAll}
                            checked={
                              sections.length > 0 &&
                              selectedIds.length === sections.length
                            }
                          />
                        </div>
                      </th>
                      <th className="px-2  md:text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Title
                      </th>
                      <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Subscription No.
                      </th>
                      <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        From Date
                      </th>
                      <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        To Date
                      </th>
                      <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Email Id
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={11} className="py-20">
                          <div className="flex justify-center items-center text-blue-700 text-base sm:text-lg">
                            Please wait while data is loading...
                          </div>
                        </td>
                      </tr>
                    ) : displayedSections.length > 0 ? (
                      displayedSections.map((section, index) => (
                        <tr
                          key={section.subscription_id}
                          className={`${index % 2 === 0 ? "bg-white" : "bg-gray-100"} hover:bg-gray-50`}
                        >
                          <td className="text-center px-2 py-2 border border-gray-950 text-sm">
                            {currentPage * pageSize + index + 1}
                          </td>

                          <td className="text-center px-2 py-2 border border-gray-950 text-sm">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(
                                section.subscription_id,
                              )}
                              onChange={() =>
                                handleCheckboxChange(section.subscription_id)
                              }
                            // className="w-4 h-4 cursor-pointer accent-blue-500"
                            />
                          </td>

                          <td className="text-center px-2 py-2 border border-gray-950 text-sm">
                            {section?.title}
                          </td>

                          <td className="text-center px-2 py-2 border border-gray-950 text-sm">
                            {section?.subscription_no}
                          </td>

                          <td className="text-center px-2 py-2 border border-gray-950 text-sm">
                            {formatDate(section?.from_date)}
                          </td>
                          <td className="text-center px-2 py-2 border border-gray-950 text-sm">
                            {formatDate(section?.to_date)}
                          </td>

                          <td className="text-center px-2 py-2 border border-gray-950 text-sm">
                            {section?.email_ids}
                          </td>
                        </tr>
                      ))
                    ) : sections.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-20">
                          <div className="text-center text-red-700 text-base sm:text-lg">
                            No data availble.
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td colSpan={10} className="py-20">
                          <div className="text-center text-red-700 text-base sm:text-lg">
                            Result not found!
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className=" flex justify-center  pt-2 -mb-3">
              <ReactPaginate
                previousLabel={"Previous"}
                nextLabel={"Next"}
                breakLabel={"..."}
                breakClassName={"page-item"}
                breakLinkClassName={"page-link"}
                pageCount={pageCount}
                marginPagesDisplayed={1}
                pageRangeDisplayed={1}
                onPageChange={handlePageClick}
                containerClassName={"pagination"}
                pageClassName={"page-item"}
                pageLinkClassName={"page-link"}
                previousClassName={"page-item"}
                previousLinkClassName={"page-link"}
                nextClassName={"page-item"}
                nextLinkClassName={"page-link"}
                activeClassName={"active"}
              />
            </div>
            {loading ? (
              <span>{""}</span>
            ) : (
              filteredSections.length > 0 && (
                <div className="flex flex-col items-center mt-2">
                  <div className="w-full md:w-[70%]">
                    <label className="mb-1 font-normal block text-left">
                      Dear Team,
                    </label>

                    {/* Row Container */}
                    <div className="flex flex-col md:flex-row items-end gap-3 w-full">
                      {/* Textarea */}
                      <div className="relative w-full">
                        <textarea
                          value={message}
                          onChange={(e) => {
                            if (e.target.value.length <= maxCharacters) {
                              setMessage(e.target.value);
                            }
                          }}
                          className="w-full h-28 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-150 resize-none bg-transparent text-sm text-black font-normal"
                          placeholder="Enter message"
                        ></textarea>

                        <div className="absolute bottom-2 right-3 text-xs text-gray-500 pointer-events-none">
                          {message.length} / {maxCharacters}
                        </div>
                      </div>

                      {/* Button */}
                      <button
                        type="submit"
                        onClick={handleSubmit}
                        style={{ backgroundColor: "#2196F3" }}
                        className={`text-white font-bold py-2 px-4 rounded whitespace-nowrap ${loading ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        disabled={loading}
                      >
                        {loading ? (
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
                            Sending...
                          </span>
                        ) : (
                          "Send Message"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}

            {/* Selected Subscription */}
            <div className="text-center mt-2">
              <p className="text-blue-500 font-semibold">
                Selected Subscription:{" "}
                <span className="text-pink-600">{selectedIds.length}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SubscriptionReminder;
