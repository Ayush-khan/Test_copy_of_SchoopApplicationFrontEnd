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

function PeriodicalsReminder() {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  const [selectedIds, setSelectedIds] = useState([]);
  const [message, setMessage] = useState("");
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

      const response = await axios.get(`${API_URL}/api/periodicals/reminder`, {
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

  const filteredSections = Array.isArray(sections)
    ? sections.filter((section) => {
        const searchLower = searchTerm.toLowerCase();

        const title = `${section?.title || ""}`.trim().toString().toLowerCase();
        const date = formatDate(section?.receive_by_date?.toLowerCase() || "");
        const subcriptionNo = section?.subscription_no?.toLowerCase() || "";
        const frequency = section?.frequency?.toLowerCase() || "";
        const volume = section?.volume?.toLowerCase() || "";
        const issue = section?.issue?.toString().toLowerCase() || "";

        return (
          title.includes(searchLower) ||
          date.includes(searchLower) ||
          subcriptionNo.includes(searchLower) ||
          frequency.includes(searchLower) ||
          volume.includes(searchLower) ||
          issue.includes(searchLower)
        );
      })
    : [];

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

  const generateStudentDetailsTableHTML = (students = []) => {
    const formatDate = (dateStr) =>
      dateStr
        ? new Date(dateStr).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          })
        : "";

    const headers = [
      "Sr No.",
      "Title",
      "Subscription No.",
      "Receiving Date",
      "Type",
      "Volume",
      "Issue",
    ];

    const thead = `
    <thead style="background-color: #e5e7eb; font-weight: bold;">
      <tr>
        ${headers
          .map((h) => `<th style="border: 1px  #ccc; padding: 6px;">${h}</th>`)
          .join("")}
      </tr>
    </thead>
  `;

    const tbody = `
    <tbody>
      ${sections
        .map((student, index) => {
          return `
          <tr style="background-color: ${
            index % 2 === 0 ? "#fff" : "#f9fafb"
          };">
            <td style="border: 1px solid #ccc; padding: 6px;">${index + 1}</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${
              student.title || ""
            }</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${
              student.subscription_no || ""
            }</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${formatDate(
              student.receive_by_date || "",
            )}</td>
             <td style="border: 1px solid #ccc; padding: 6px;">${
               student.frequency || ""
             }</td>
             <td style="border: 1px solid #ccc; padding: 6px;">${
               student.volume || ""
             }</td>
             <td style="border: 1px solid #ccc; padding: 6px;">${
               student.issue || ""
             }</td>
          
          </tr>
        `;
        })
        .join("")}
    </tbody>
  `;

    return `<table style="width: 100%;  font-size: 12px;">${thead}${tbody}</table>`;
  };

  const handlePrint = (studentsList) => {
    const title = `Periodicals Reminder Report`;
    const tableHTML = generateStudentDetailsTableHTML(studentsList);

    const printWindow = window.open("", "_blank", "width=1000,height=800");

    printWindow.document.write(`
    <html>
      <head>
      <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { width: 100%;  font-size: 12px; }
          th, td {
  border: 1px solid #333;
}

          th { background: #f3f4f6; }
        </style>
      </head>
      <body>
        ${tableHTML}
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

  const handleDownloadEXL = () => {
    if (!displayedSections || displayedSections.length === 0) {
      toast.error("No data available to download the Excel sheet.");
      return;
    }

    // Define headers matching the print table
    const headers = [
      "Sr No.",
      "Title",
      "Subscription No.",
      "Receiving Date",
      "Type",
      "Volume",
      "Issue",
    ];

    // Convert displayedSections data to array format for Excel
    const data = filteredSections.map((student, index) => [
      index + 1,

      `${student.title}`.trim(),
      student?.subscription_no || " ",
      student?.receive_by_date ? formatDate(student.receive_by_date) : " ",
      student?.frequency || " ",
      student?.volume || " ",
      student?.issue || " ",
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const columnWidths = headers.map(() => ({ wch: 20 }));
    worksheet["!cols"] = columnWidths;

    // Create a workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Periodicals Reminder");

    // Generate and download the Excel file
    const fileName = `Periodicals Reminder Report.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = sections.map((item) => item.subscription_issue_id);
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
        "Please select at least one periodicals to send message to the team.",
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
        periodicalId: selectedIds,
        message: message,
      };

      // Make the API call
      const response = await axios.post(
        `${API_URL}/api/periodicals/reminder/mail`,
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
      <div className="w-full md:w-[80%] mx-auto p-4 ">
        <ToastContainer />

        <div className="card rounded-md ">
          <div className="p-1 px-3 bg-gray-100 flex justify-between items-center">
            <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
              Periodicals Reminders
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
                        Email
                      </th>
                      <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Receiving Date
                      </th>

                      <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Type
                      </th>
                      <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Volume
                      </th>
                      <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Issue
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
                    ) : displayedSections.length ? (
                      displayedSections?.map((student, index) => (
                        <tr
                          key={student.student_id}
                          className="border border-gray-300"
                        >
                          <td className="px-2 py-2 text-center border border-gray-300">
                            {currentPage * pageSize + index + 1}
                          </td>
                          <td className="text-center px-2 py-2 border border-gray-950 text-sm">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(
                                student.subscription_issue_id,
                              )}
                              onChange={() =>
                                handleCheckboxChange(
                                  student.subscription_issue_id,
                                )
                              }
                            />
                          </td>
                          <td className="px-2 py-2 text-center border border-gray-300">
                            {student.title || ""}
                          </td>
                          <td className="px-2 py-2 text-center border border-gray-300">
                            {student.subscription_no || ""}
                          </td>
                          <td className="px-2 py-2 text-center border border-gray-300">
                            {student.email_ids || ""}
                          </td>
                          <td className="px-2 py-2 text-center border border-gray-300">
                            {formatDate(student.receive_by_date || "")}
                          </td>

                          <td className="px-2 py-2 text-center border border-gray-300">
                            {student.frequency || ""}
                          </td>

                          <td className="px-2 py-2 text-center border border-gray-300">
                            {student.volume || ""}
                          </td>
                          <td className="px-2 py-2 text-center border border-gray-300">
                            {student.issue || ""}
                          </td>
                        </tr>
                      ))
                    ) : sections.length === 0 ? (
                      <div className="absolute left-[1%] w-[100%] text-center flex justify-center items-center mt-14">
                        <div className="text-center text-xl text-red-700">
                          No data available.
                        </div>
                      </div>
                    ) : (
                      <div className="absolute left-[1%] w-[100%] text-center flex justify-center items-center mt-14">
                        <div className="text-center text-xl text-red-700">
                          Result not found!
                        </div>
                      </div>
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
                        className={`text-white font-bold py-2 px-4 rounded whitespace-nowrap ${
                          loading ? "opacity-50 cursor-not-allowed" : ""
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
                Selected Periodicals:{" "}
                <span className="text-pink-600">{selectedIds.length}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PeriodicalsReminder;
