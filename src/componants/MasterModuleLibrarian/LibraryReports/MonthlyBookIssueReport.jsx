import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
import { FiPrinter, FiSearch } from "react-icons/fi";
import { FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";
import ReactPaginate from "react-paginate";

const MonthlyBookIssueReport = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [currentPage, setCurrentPage] = useState(0);
  const [showSearch, setShowSearch] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingForSearch, setLoadingForSearch] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedMonthId, setSelectedMonthId] = useState("");

  const navigate = useNavigate();
  const [loadingExams, setLoadingExams] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [timetable, setTimetable] = useState([]);

  const pageSize = 10;
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");
  const isClearingRef = useRef(false);

  useEffect(() => {
    handleSearch();
  }, []);

  useEffect(() => {
    if (isClearingRef.current) {
      isClearingRef.current = false;
      return;
    }

    if (selectedMonth) {
      handleSearch();
    }
  }, [selectedMonth]);

  const academicYrFrom = localStorage.getItem("academic_yr_from");

  const startYear = academicYrFrom
    ? new Date(academicYrFrom).getFullYear()
    : new Date().getFullYear();

  const endYear = startYear + 1;

  const monthOptions = [
    { month: 4, label: "April", year: startYear },
    { month: 5, label: "May", year: startYear },
    { month: 6, label: "June", year: startYear },
    { month: 7, label: "July", year: startYear },
    { month: 8, label: "August", year: startYear },
    { month: 9, label: "September", year: startYear },
    { month: 10, label: "October", year: startYear },
    { month: 11, label: "November", year: startYear },
    { month: 12, label: "December", year: startYear },
    { month: 1, label: "January", year: endYear },
    { month: 2, label: "February", year: endYear },
    { month: 3, label: "March", year: endYear },
  ].map((m) => ({
    value: `${m.year}-${String(m.month).padStart(2, "0")}`,
    label: `${m.label}-${m.year}`,
  }));

  const handleMonthSelect = (selectedOption) => {
    setSelectedMonth(selectedOption);
    setSelectedMonthId(selectedOption?.value);
    // console.log("Selected month_year:", selectedOption?.value);
  };

  const handleSearch = async ({ clearAll = false } = {}) => {
    if (!clearAll && !selectedMonth) {
      toast.error("Please select month to view report.");
      return;
    }
    setLoadingForSearch(true);
    setIsSubmitting(true);
    setLoading(true);
    setShowSearch(false);

    try {
      const token = localStorage.getItem("authToken");

      let params = {};

      if (!clearAll) {
        if (selectedMonth) params.month_year = selectedMonth.value;
      }

      // console.log("Search Params:", params);

      const response = await axios.get(
        `${API_URL}/api/library/book_issued_monthly_report`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
          paramsSerializer: (params) => new URLSearchParams(params).toString(),
        },
      );

      if (!response?.data?.data || response?.data?.data?.length === 0) {
        setTimetable([]);
        setPageCount(0);
        setCurrentPage(0);
        toast.error("No records found for selected criteria.");
      } else {
        setTimetable(response?.data?.data);
        setPageCount(Math.ceil((response?.data?.data?.length || 0) / pageSize));
        setCurrentPage(0);
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      toast.error("Error fetching data. Please try again.");
    } finally {
      setIsSubmitting(false);
      setLoadingForSearch(false);
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printTitle = `Monthly Book Issued Report`;
    const printContent = `
    <div id="tableMain" class="flex items-center justify-center min-h-screen bg-white">
         <h5 id="tableHeading5"  class="text-lg font-semibold border-1 border-black">${printTitle}</h5>
    <div id="tableHeading" class="text-center w-3/4">
      <table class="min-w-full leading-normal table-auto border border-black mx-auto mt-2">
        <thead>
          <tr class="bg-gray-100">
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Sr.No</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Accession No.</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Book Title</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Issue Type</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Borrower</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Issue Date</th>
          </tr>
        </thead>
     <tbody>
      ${timetable
        .map((student, index) => {
          return `
          <tr style="background-color: ${
            index % 2 === 0 ? "#fff" : "#f9fafb"
          };">
            <td style="border: 1px solid #ccc; padding: 6px;">${index + 1}</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${
              student.copy_id || ""
            }</td>
          
            <td style="border: 1px solid #ccc; padding: 6px;">${
              student.book_title || ""
            }</td>

            <td style="border: 1px solid #ccc; padding: 6px;">${
              student.member_type === "S" ? "Student" : "Teacher"
            }</td>
           
            <td style="border: 1px solid #ccc; padding: 6px;">
               ${student?.first_name || "-"}  ${student?.mid_name || "-"}  ${student?.last_name || "-"} 
            </td>
             
             <td style="border: 1px solid #ccc; padding: 6px;">${formatDate(
               student.issue_date || "",
             )}</td>
           
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
      "Accession No.",
      "Book Title",
      "Issue Type",
      "Borrower",
      "Issue Date",
    ];
    // Convert displayedSections data to array format for Excel
    const data = filteredSections.map((student, index) => [
      index + 1,
      student?.copy_id || " ",
      student?.book_title || " ",
      student?.member_type === "S" ? "Student" : "Teacher",
      `${student?.first_name || " "} ${student?.mid_name} ${student?.last_name}`,
      formatDate(student?.issue_date || " "),
    ]);

    // Create a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // Auto-adjust column width
    const columnWidths = headers.map(() => ({ wch: 20 })); // Approx. width of 20 characters per column
    worksheet["!cols"] = columnWidths;

    // Create a workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Books Available Data");

    // Generate and download the Excel file
    const fileName = `Monthly Book Issued Report.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // console.log("row", timetable);

  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        })
      : "";

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

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

  const filteredSections = timetable.filter((student) => {
    const searchLower = searchTerm.trim().toLowerCase();

    const normalize = (value) =>
      value?.toString().trim().replace(/\s+/g, " ").toLowerCase() || "";

    const isTeacherSearch = "teacher".startsWith(searchLower);
    const isStudentSearch = "student".startsWith(searchLower);

    if (isTeacherSearch && searchLower.length >= 2) {
      return student?.member_type === "T";
    }

    if (isStudentSearch && searchLower.length >= 2) {
      return student?.member_type === "S";
    }

    const studentName = normalize(student?.book_title);
    const accessionNo = normalize(student?.accession_no);
    const locationBook = normalize(student?.location_of_book);
    const status = normalize(student?.Status_code);
    const amount = normalize(student?.copy_id);
    const author = normalize(student?.author);
    const publisher = normalize(student?.publisher);
    const addedDate = normalize(formatDate(student?.added_date));
    const publicationYear = normalize(student?.year);
    const editionNo = normalize(student?.edition);
    const price = normalize(student?.price);
    const isbnNo = normalize(student?.isbn);

    const combined = normalize(
      `${student?.call_no || ""} / ${student?.category_name || ""}`,
    );

    const fullName = normalize(
      `${student?.first_name || ""} ${student?.mid_name || ""} ${student?.last_name || ""}`,
    );

    const staffName = normalize(student?.name);

    return (
      studentName.includes(searchLower) ||
      accessionNo.includes(searchLower) ||
      locationBook.includes(searchLower) ||
      status.includes(searchLower) ||
      amount.includes(searchLower) ||
      author.includes(searchLower) ||
      combined.includes(searchLower) ||
      publisher.includes(searchLower) ||
      addedDate.includes(searchLower) ||
      publicationYear.includes(searchLower) ||
      editionNo.includes(searchLower) ||
      price.includes(searchLower) ||
      isbnNo.includes(searchLower) ||
      fullName.includes(searchLower) ||
      staffName.includes(searchLower)
    );
  });

  useEffect(() => {
    setPageCount(Math.ceil(filteredSections.length / pageSize));
  }, [filteredSections, pageSize]);

  const displayedSections = filteredSections.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize,
  );

  const camelCase = (str) =>
    str
      ?.toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  return (
    <>
      <div className="w-full md:w-[100%] mx-auto p-4 ">
        <ToastContainer />
        <div className="card rounded-md ">
          <div className=" card-header mb-4 flex justify-between items-center ">
            <h5 className="text-gray-700 text-md lg:text-lg">
              Monthly Book Issued Report
            </h5>
            <RxCross1
              className=" relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
              onClick={() => {
                navigate("/dashboard");
              }}
            />
          </div>
          <div
            className=" relative w-[98%] -top-6 h-1  mx-auto bg-red-700 "
            style={{
              backgroundColor: "#C03078",
            }}
          ></div>
          {filteredSections.length > 0 && (
            <div className="md:absolute md:right-7 md:top-[10%] mb-5 text-gray-500">
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

          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-7 px-4 lg:ml-10">
              {/* Month */}
              <div className="flex items-center gap-2">
                <label className="text-md w-20">
                  Month <span className="text-red-500 text-sm">*</span>
                </label>

                <Select
                  value={selectedMonth}
                  onChange={handleMonthSelect}
                  options={monthOptions}
                  placeholder={loadingExams ? "Loading..." : "Select"}
                  isSearchable
                  isClearable
                  isDisabled={loadingExams}
                  className="text-sm w-[40%]"
                />
              </div>
            </div>

            <>
              <div className="w-full  p-2">
                {timetable.length > 0 && (
                  <div className="card mx-auto lg:w-full shadow-lg">
                    {showSearch && (
                      <>
                        <div className="p-1 px-3 bg-gray-100 border-none">
                          <div className="w-full flex justify-end mr-0 md:mr-4">
                            <div className="w-1/2 md:w-[18%] mr-1">
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
                        <div
                          className=" relative w-[97%]   mb-3 h-0.5  mx-auto bg-red-700"
                          style={{
                            backgroundColor: "#C03078",
                          }}
                        ></div>
                      </>
                    )}

                    <div className="card-body w-full">
                      <div
                        className="h-96 lg:h-96 overflow-y-scroll overflow-x-scroll"
                        style={{
                          scrollbarWidth: "thin",
                          scrollbarColor: "#C03178 transparent",
                        }}
                      >
                        <table className="min-w-full leading-normal table-auto">
                          {/* <thead>
                            <tr className="bg-gray-100">
                              <th
                                style={{ width: "10px" }}
                                className="px-1 py-1 text-center border border-gray-950 text-sm font-semibold"
                              >
                                Sr No.
                              </th>
                              <th
                                style={{ width: "20px" }}
                                className="px-1 py-1 text-center border border-gray-950 text-sm font-semibold"
                              >
                                Accession No.
                              </th>

                              <th
                                style={{ width: "250px" }}
                                className="px-1 py-1 text-center border border-gray-950 text-sm font-semibold whitespace-nowrap"
                              >
                                Book Title
                              </th>

                              <th
                                style={{ width: "20px" }}
                                className="px-1 py-1 text-center border border-gray-950 text-sm font-semibold"
                              >
                                Issue Type
                              </th>
                              <th
                                style={{ width: "150px" }}
                                className="px-1 py-1 text-center border border-gray-950 text-sm font-semibold whitespace-nowrap"
                              >
                                Borrower
                              </th>
                              <th
                                style={{ width: "20px" }}
                                className="px-1 py-1 text-center border border-gray-950 text-sm font-semibold"
                              >
                                Issue Date
                              </th>
                            </tr>
                          </thead> */}

                          <thead>
                            <tr className="bg-gray-100">
                              <th className="px-1 py-1 text-center border border-gray-950 text-sm font-semibold whitespace-nowrap">
                                Sr No.
                              </th>

                              <th className="px-1 py-1 text-center border border-gray-950 text-sm font-semibold whitespace-nowrap">
                                Accession No.
                              </th>

                              <th className="px-1 py-1 text-center border border-gray-950 text-sm font-semibold whitespace-nowrap">
                                Book Title
                              </th>

                              <th className="px-1 py-1 text-center border border-gray-950 text-sm font-semibold whitespace-nowrap">
                                Issue Type
                              </th>

                              <th className="px-1 py-1 text-center border border-gray-950 text-sm font-semibold whitespace-nowrap">
                                Borrower
                              </th>

                              <th className="px-1 py-1 text-center border border-gray-950 text-sm font-semibold whitespace-nowrap">
                                Issue Date
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {/* LOADING */}
                            {loading && (
                              <div className="absolute inset-0 flex justify-center items-center bg-white/70 z-10">
                                <div className="text-xl text-blue-700 ">
                                  Please wait while data is loading...
                                </div>
                              </div>
                            )}

                            {/* DATA ROWS */}
                            {!loading &&
                              displayedSections.length > 0 &&
                              displayedSections.map((student, index) => (
                                <tr
                                  key={`${student.copy_id}-${index}`}
                                  className="border border-gray-300"
                                >
                                  <td className="px-2 py-2 text-center border">
                                    {currentPage * pageSize + index + 1}
                                  </td>
                                  <td className="px-2 py-2 text-center border">
                                    {student?.copy_id || " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border">
                                    {student?.book_title || " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border">
                                    {student?.member_type === "S"
                                      ? "Student"
                                      : "Teacher"}
                                  </td>

                                  <td className="px-2 py-2 text-center border">
                                    {camelCase(
                                      `${student?.first_name || ""} ${student?.mid_name || ""} ${student?.last_name || ""}`,
                                    )}
                                  </td>
                                  <td className="px-2 py-2 text-center border">
                                    {formatDate(student?.issue_date || " ")}
                                  </td>
                                </tr>
                              ))}

                            {/* NO DATA */}
                            {!loading && timetable.length === 0 && (
                              <div className="absolute inset-0 flex justify-center items-center">
                                <div className="text-xl text-red-700">
                                  No data available.
                                </div>
                              </div>
                            )}

                            {/* DATA FOUND (but maybe filtered empty) */}
                            {!loading &&
                              timetable.length > 0 &&
                              displayedSections.length === 0 && (
                                <div className="absolute inset-0 flex justify-center items-center">
                                  <div className="text-xl text-red-700">
                                    Result data found!
                                  </div>
                                </div>
                              )}

                            {/* TOTAL COUNT ROW */}
                            {!loading && filteredSections.length > 0 && (
                              <div className="absolute bottom-2 left-4 z-10">
                                <div className="px-4 py-2 bg-gray-100 border rounded shadow text-sm">
                                  <span className="text-blue-800 font-semibold">
                                    Total books issued in{" "}
                                    {selectedMonth?.label?.split("-")[0]} are
                                    :{" "}
                                  </span>

                                  <span className="text-pink-600 ml-2 font-semibold">
                                    {filteredSections.length}
                                  </span>
                                </div>
                              </div>
                            )}
                          </tbody>
                        </table>
                      </div>
                      <div className=" flex justify-center pt-2 -mb-3">
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
                    </div>
                  </div>
                )}
              </div>
            </>
          </>
        </div>
      </div>
    </>
  );
};

export default MonthlyBookIssueReport;
