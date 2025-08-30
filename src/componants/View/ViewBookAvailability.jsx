import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
import { FiPrinter } from "react-icons/fi";
import { FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";
import ReactPaginate from "react-paginate";

const ViewBookAvailability = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategoryGroup, setSelectedCategoryGroup] = useState(null);

  const [currentPage, setCurrentPage] = useState(0);

  const [categoryGroup, setCategoryGroup] = useState([]);
  const [categoryName, setCategoryName] = useState([]);

  const [selectedCategoryGroupId, setSelectedCategoryGroupId] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingForSearch, setLoadingForSearch] = useState(false);

  const [author, setAuthor] = useState("");
  const [title, setTitle] = useState("");
  const [assessionNo, setAssessionNo] = useState("");

  const navigate = useNavigate();
  const [loadingExams, setLoadingExams] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [timetable, setTimetable] = useState([]);
  const [isNewArrival, setIsNewArrival] = useState(false);

  const pageSize = 10;
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");

  useEffect(() => {
    fetchCategoryGroup();
    fetchCategoryName();
    // handleSearch();
  }, []);

  const fetchCategoryGroup = async () => {
    try {
      setLoadingExams(true);
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/get_category_group_name`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("group name:", response.data);

      // Ensure response is an array before setting state
      if (Array.isArray(response.data)) {
        setCategoryGroup(response.data);
      } else {
        setCategoryGroup([]); // Default to empty array
        console.error("Unexpected API response format:", response.data);
      }
    } catch (error) {
      toast.error("Error fetching Students");
      console.error("Error fetching Students:", error);
    } finally {
      setLoadingExams(false);
    }
  };

  const handleCategoryGroupSelect = (selectedOption) => {
    setSelectedCategoryGroup(selectedOption);
    setSelectedCategoryGroupId(selectedOption?.value);
  };

  const categoryGroupOptions = useMemo(() => {
    if (!Array.isArray(categoryGroup)) return []; // Prevent crash
    return categoryGroup.map((cls) => ({
      value: cls?.value,
      label: cls?.label,
    }));
  }, [categoryGroup]);

  const fetchCategoryName = async () => {
    try {
      setLoadingExams(true);
      const token = localStorage.getItem("authToken");

      const response = await axios.get(`${API_URL}/api/get_allcategoryname`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("all category name:", response.data.data);

      // Ensure response is an array before setting state
      if (Array.isArray(response.data.data)) {
        setCategoryName(response.data.data);
      } else {
        setCategoryName([]); // Default to empty array
        console.error("Unexpected API response format:", response.data);
      }
    } catch (error) {
      toast.error("Error fetching Students");
      console.error("Error fetching Students:", error);
    } finally {
      setLoadingExams(false);
    }
  };

  const handleCategorySelect = (selectedOption) => {
    setSelectedCategory(selectedOption);
    setSelectedCategoryId(selectedOption?.value);
  };

  const categoryOptions = useMemo(() => {
    if (!Array.isArray(categoryName)) return []; // Prevent crash
    return categoryName.map((cls) => ({
      value: cls?.category_id,
      label: `${cls?.call_no} / ${cls?.category_name}`,
    }));
  }, [categoryName]);

  const statusMap = {
    A: "Available",
    I: "Issued",
    R: "Reserved",
    L: "Lost",
  };

  // const handleSearch = async () => {
  //   setLoadingForSearch(true);
  //   setIsSubmitting(true);

  //   try {
  //     const token = localStorage.getItem("authToken");

  //     // Build params only if field has value
  //     let params = {};
  //     if (assessionNo) params.accession_no = assessionNo;
  //     if (title) params.title = title;
  //     if (author) params.author = author;
  //     if (selectedCategoryGroup)
  //       params.category_group_id = selectedCategoryGroup.value;
  //     if (selectedCategory) params.category_id = selectedCategory.value;

  //     console.log("Search Params:", params);

  //     const response = await axios.get(`${API_URL}/api/get_all_books`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //       params,
  //       paramsSerializer: (params) => {
  //         return new URLSearchParams(params).toString();
  //       },
  //     });

  //     console.log("API Response:", response?.data);

  //     if (!response?.data?.data || response?.data?.data?.length === 0) {
  //       setTimetable([]);
  //       toast.error("No records found for selected criteria.");
  //     } else {
  //       setTimetable(response?.data?.data);
  //       setPageCount(Math.ceil(response?.data?.data?.length / pageSize));
  //     }
  //   } catch (error) {
  //     console.error("Error fetching report:", error);
  //     toast.error("Error fetching data. Please try again.");
  //   } finally {
  //     setIsSubmitting(false);
  //     setLoadingForSearch(false);
  //   }
  // };

  const handleSearch = async () => {
    setLoadingForSearch(true);
    setIsSubmitting(true);
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");

      // Build params only if field has value
      let params = {};
      if (assessionNo) params.accession_no = assessionNo;
      if (title) params.title = title;
      if (author) params.author = author;
      if (selectedCategoryGroup)
        params.category_group_id = selectedCategoryGroup.value;
      if (selectedCategory) params.category_id = selectedCategory.value;

      if (isNewArrival) params.is_new = true;

      console.log("Search Params:", params);

      const response = await axios.get(`${API_URL}/api/get_all_books`, {
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
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printTitle = `Razorpay Fee Payment Report ${
      selectedAccount?.label || ""
    }`;
    const printContent = `
    <div id="tableMain" class="flex items-center justify-center min-h-screen bg-white">
         <h5 id="tableHeading5"  class="text-lg font-semibold border-1 border-black">${printTitle}</h5>
    <div id="tableHeading" class="text-center w-3/4">
      <table class="min-w-full leading-normal table-auto border border-black mx-auto mt-2">
        <thead>
          <tr class="bg-gray-100">
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Sr.No</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Order ID</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Student Name</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Class</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Date</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Installment No.</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Receipt No.</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Payment ID.</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Status</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Amount</th>
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
                  subject?.OrderId || " "
                }</td>
                <td class="px-2 text-center py-2 border border-black">${
                  subject?.student_name || " "
                }</td>
                <td class="px-2 text-center py-2 border border-black">${
                  subject?.class_name || " "
                }</td>
                <td class="px-2 text-center py-2 border border-black">${
                  subject?.Trnx_date
                    ? new Date(subject.Trnx_date).toLocaleDateString("en-GB")
                    : " "
                }</td>
                 <td class="px-2 text-center py-2 border border-black">${
                   subject?.installment_no || " "
                 }</td>
                  <td class="px-2 text-center py-2 border border-black">${
                    subject?.receipt_no || " "
                  }</td>
                <td class="px-2 text-center py-2 border border-black">${
                  subject?.razorpay_payment_id || " "
                }</td>
                <td class="px-2 text-center py-2 border border-black">${
                  subject?.Status || " "
                }</td>
                 <td class="px-2 text-center py-2 border border-black">${
                   subject?.Amount || " "
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
      "Order ID",
      "Student Name",
      "Class",
      "Date",
      "Installment No.",
      "Receipt No.",
      "Payment ID.",
      "Status",
      "Amount",
    ];
    // Convert displayedSections data to array format for Excel
    const data = displayedSections.map((student, index) => [
      index + 1,
      student?.OrderId || " ",
      student?.student_name || " ",
      student?.installment_no || " ",
      student?.receipt_no || " ",
      student?.razorpay_payment_id || " ",
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
    const fileName = `Razorpay_Fee_Payment_Report.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  console.log("row", timetable);

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  useEffect(() => {
    const trimmedSearch = searchTerm.trim().toLowerCase();

    if (trimmedSearch !== "" && prevSearchTermRef.current === "") {
      previousPageRef.current = currentPage; // Save current page before search
      setCurrentPage(0); // Jump to first page when searching
    }

    if (trimmedSearch === "" && prevSearchTermRef.current !== "") {
      setCurrentPage(previousPageRef.current); // Restore saved page when clearing search
    }

    prevSearchTermRef.current = trimmedSearch;
  }, [searchTerm]);

  const filteredSections = timetable.filter((student) => {
    const searchLower = searchTerm.trim().replace(/\s+/g, " ").toLowerCase();

    const normalize = (value) =>
      value?.toString().trim().replace(/\s+/g, " ").toLowerCase() || "";

    // Normalize all relevant fields for search
    const studentName = normalize(student?.book_title);
    const accessionNo = normalize(student?.accession_no);
    const className = normalize(student?.author);
    const status = normalize(student?.Status_code);
    const amount = normalize(student?.copy_id);
    const receiptNo = normalize(student?.location_of_book);
    const combined = normalize(
      `${student?.call_no || ""} / ${student?.category_name || ""}`
    );

    // Check if the search term is present in any of the specified fields
    return (
      studentName.includes(searchLower) ||
      accessionNo.includes(searchLower) ||
      className.includes(searchLower) ||
      status.includes(searchLower) ||
      amount.includes(searchLower) ||
      receiptNo.includes(searchLower) ||
      combined.includes(searchLower)
    );
  });

  useEffect(() => {
    setPageCount(Math.ceil(filteredSections.length / pageSize));
  }, [filteredSections, pageSize]);

  const displayedSections = filteredSections.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  return (
    <>
      <div className="w-full md:w-[100%] mx-auto p-4 ">
        <ToastContainer />
        <div className="card rounded-md ">
          <div className=" card-header mb-4 flex justify-between items-center ">
            <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
              Book Availability
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

          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 p-4">
              {/* Enter/Scan Accession No. */}
              <div className="flex flex-col">
                <label className="text-md mb-1">Enter/Scan AccessionNo.</label>
                <input
                  type="text"
                  placeholder="Accession No."
                  value={assessionNo}
                  onChange={(e) => setAssessionNo(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                />
              </div>

              {/* Category group name */}
              <div className="flex flex-col">
                <label className="text-md mb-1">Category group name</label>
                <Select
                  value={selectedCategoryGroup}
                  onChange={handleCategoryGroupSelect}
                  options={categoryGroupOptions}
                  placeholder={loadingExams ? "Loading..." : "Select"}
                  isSearchable
                  isClearable
                  isDisabled={loadingExams}
                  className="text-sm w-full"
                />
              </div>

              {/* Call No. / Category */}
              <div className="flex flex-col">
                <label className="text-md mb-1">Call No. / Category</label>
                <Select
                  value={selectedCategory}
                  onChange={handleCategorySelect}
                  options={categoryOptions}
                  placeholder={loadingExams ? "Loading..." : "Select"}
                  isSearchable
                  isClearable
                  isDisabled={loadingExams}
                  className="text-sm w-full"
                />
              </div>

              {/* Book Title */}
              <div className="flex flex-col">
                <label className="text-md mb-1">Book Title</label>
                <input
                  type="text"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                />
              </div>

              {/* Author */}
              <div className="flex flex-col">
                <label className="text-md mb-1">Author</label>
                <input
                  type="text"
                  placeholder="Author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                />
              </div>

              {/* New Arrival + Search button in same row */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-blue-600 accent-blue-600"
                    checked={isNewArrival}
                    onChange={(e) => setIsNewArrival(e.target.checked)}
                  />
                  <label className="text-md">New Arrival</label>
                </div>

                <button
                  type="search"
                  onClick={handleSearch}
                  style={{ backgroundColor: "#2196F3" }}
                  className={`h-10 text-white font-bold py-1 px-6 rounded ${
                    loadingForSearch ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={loadingForSearch}
                >
                  {loadingForSearch ? "Searching..." : "Search"}
                </button>
              </div>
            </div>

            {/* {timetable.length > 0 && ( */}
            <>
              <div className="w-full  p-2">
                <div className="card mx-auto lg:w-full shadow-lg">
                  <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                    <div className="w-full flex flex-row justify-between mr-0 md:mr-4 ">
                      <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
                        List of Books
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
                    {/* <div className="flex flex-col md:flex-row gap-x-1 justify-center md:justify-end">
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
                      </div> */}
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
                            <th
                              style={{ width: "10px" }}
                              className="px-2 text-center py-2 border border-gray-950 text-sm font-semibold"
                            >
                              Sr No.
                            </th>
                            <th
                              style={{ width: "30px" }}
                              className="px-2 text-center py-2 border border-gray-950 text-sm font-semibold"
                            >
                              Accession No.
                            </th>
                            <th
                              style={{ width: "200px" }}
                              className="px-2 text-center py-2 border border-gray-950 text-sm font-semibold"
                            >
                              Book Title
                            </th>
                            <th
                              style={{ width: "150px" }}
                              className="px-2 text-center py-2 border border-gray-950 text-sm font-semibold"
                            >
                              Author
                            </th>
                            <th
                              style={{ width: "150px" }}
                              className="px-2 text-center py-2 border border-gray-950 text-sm font-semibold"
                            >
                              Call No./Category
                            </th>
                            <th
                              style={{ width: "200px" }}
                              className="px-2 text-center py-2 border border-gray-950 text-sm font-semibold"
                            >
                              Location
                            </th>
                            <th
                              style={{ width: "100px" }}
                              className="px-2 text-center py-2 border border-gray-950 text-sm font-semibold"
                            >
                              Status
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {loading ? (
                            <div className=" absolute left-[4%] w-[100%]  text-center flex justify-center items-center mt-14">
                              <div className=" text-center text-xl text-blue-700">
                                Please wait while data is loading...
                              </div>
                            </div>
                          ) : displayedSections.length ? (
                            displayedSections?.map((student, index) => (
                              <tr
                                key={student.adm_form_pk}
                                className="border border-gray-300"
                              >
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {index + 1}
                                </td>
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {student?.copy_id || " "}
                                </td>
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {student?.book_title || " "}
                                </td>
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {student?.author
                                    ? student.author
                                        .toLowerCase()
                                        .split(" ")
                                        .map(
                                          (word) =>
                                            word.charAt(0).toUpperCase() +
                                            word.slice(1)
                                        )
                                        .join(" ")
                                    : " "}
                                </td>
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {student?.call_no || ""} /{" "}
                                  {student?.category_name || ""}
                                </td>
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {student?.location_of_book || " "}
                                </td>
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {statusMap[student?.status || " "]}
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
                  <div className=" flex justify-center  pt-2 -mb-1  box-border  overflow-hidden">
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
                      containerClassName={"pagination justify-content-center"}
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
            </>
            {/* )} */}
          </>
        </div>
      </div>
    </>
  );
};

export default ViewBookAvailability;
