// import { useEffect, useState, useRef } from "react";
// import axios from "axios";
// import ReactPaginate from "react-paginate";
// import "bootstrap/dist/css/bootstrap.min.css";

// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { RxCross1 } from "react-icons/rx";
// import { useNavigate } from "react-router-dom";
// import { FaFileExcel } from "react-icons/fa";
// import { FiPrinter, FiSearch } from "react-icons/fi";
// import * as XLSX from "xlsx";

// function BookReturnPending() {
//   const API_URL = import.meta.env.VITE_API_URL; // URL for host
//   const navigate = useNavigate();
//   const [sections, setSections] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const [searchTerm, setSearchTerm] = useState("");
//   const [showSearch, setShowSearch] = useState(false);

//   const [currentPage, setCurrentPage] = useState(0);
//   const [pageCount, setPageCount] = useState(0);

//   const previousPageRef = useRef(0);
//   const prevSearchTermRef = useRef("");

//   const pageSize = 10;

//   const fetchSections = async () => {
//     try {
//       const token = localStorage.getItem("authToken");

//       if (!token) {
//         throw new Error("No authentication token found");
//       }

//       const response = await axios.get(`${API_URL}/api/book_return_pending`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         withCredentials: true,
//       });

//       setSections(response.data.data);
//       showSearch(true);
//     } catch (error) {
//       setError(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchSections();
//   }, []);

//   const formatDate = (dateStr) =>
//     dateStr
//       ? new Date(dateStr).toLocaleDateString("en-GB", {
//           day: "2-digit",
//           month: "2-digit",
//           year: "2-digit",
//         })
//       : "";

//   useEffect(() => {
//     const trimmedSearch = searchTerm.trim().toLowerCase();

//     if (trimmedSearch !== "" && prevSearchTermRef.current === "") {
//       previousPageRef.current = currentPage;
//       setCurrentPage(0);
//     }

//     if (trimmedSearch === "" && prevSearchTermRef.current !== "") {
//       setCurrentPage(previousPageRef.current);
//     }

//     prevSearchTermRef.current = trimmedSearch;
//   }, [searchTerm]);

//   const filteredSections = sections.filter((student) => {
//     const searchLower = searchTerm.trim().replace(/\s+/g, " ").toLowerCase();

//     const normalize = (value) =>
//       value?.toString().trim().replace(/\s+/g, " ").toLowerCase() || "";

//     const studentName = normalize(student?.book_title);
//     const accessionNo = normalize(student?.accession_no);
//     const locationBook = normalize(student?.location_of_book);
//     const status = normalize(student?.Status_code);
//     const amount = normalize(student?.copy_id);
//     const author = normalize(student?.author);
//     const publisher = normalize(student?.publisher);
//     const addedDate = formatDate(normalize(student.issue_date));
//     const dueDate = formatDate(normalize(student.due_date));
//     const returnDate = formatDate(normalize(student.return_date));
//     const pulicationYear = normalize(student?.year);
//     const editionNo = normalize(student?.edition);
//     const price = normalize(student?.price);
//     const isbnNo = normalize(student?.isbn);
//     const combined = normalize(
//       `${student?.call_no || ""} / ${student?.category_name || ""}`,
//     );

//     const fullName = normalize(
//       `${student?.first_name || ""}  ${student?.mid_name || ""} ${student?.last_name || ""}`,
//     );

//     const staffName = normalize(`${student?.name}`);

//     return (
//       studentName.includes(searchLower) ||
//       accessionNo.includes(searchLower) ||
//       locationBook.includes(searchLower) ||
//       status.includes(searchLower) ||
//       amount.includes(searchLower) ||
//       author.includes(searchLower) ||
//       combined.includes(searchLower) ||
//       publisher.includes(searchLower) ||
//       addedDate.includes(searchLower) ||
//       pulicationYear.includes(searchLower) ||
//       editionNo.includes(searchLower) ||
//       price.includes(searchLower) ||
//       isbnNo.includes(searchLower) ||
//       fullName.includes(searchLower) ||
//       dueDate.includes(searchLower) ||
//       returnDate.includes(searchLower) ||
//       staffName.includes(searchLower)
//     );
//   });

//   useEffect(() => {
//     setPageCount(Math.ceil(filteredSections.length / pageSize));
//   }, [filteredSections, pageSize]);

//   const displayedSections = filteredSections.slice(
//     currentPage * pageSize,
//     (currentPage + 1) * pageSize,
//   );

//   useEffect(() => {
//     setPageCount(Math.ceil(filteredSections.length / pageSize));
//   }, [filteredSections]);

//   const handlePageClick = (data) => {
//     setCurrentPage(data.selected);
//   };
//   const handlePrint = () => {
//     const printTitle = `Books Non Return Report`;
//     const printContent = `
//     <div id="tableMain" class="flex items-center justify-center min-h-screen bg-white">
//          <h5 id="tableHeading5"  class="text-lg font-semibold border-1 border-black">${printTitle}</h5>
//     <div id="tableHeading" class="text-center w-3/4">
//       <table class="min-w-full leading-normal table-auto border border-black mx-auto mt-2">
//         <thead>
//         <table class="leading-normal table-auto border border-black mx-auto mt-2">
//   <colgroup>
//     <col style="width:7%">
//     <col style="width:10%">
//     <col style="width:40%">
//     <col style="width:20%">
//     <col style="width:11%">
//     <col style="width:12%">
//   </colgroup>
//           <tr class="bg-gray-100">
//             <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Sr.No</th>
//             <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Accession No.</th>
//             <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Book Title</th>
//             <th class="px-2  text-center py-2 border border-black text-sm font-semibold">Name</th>
//             <th class="px-2  text-center py-2 border border-black text-sm font-semibold">Issue Date</th>
//             <th class="px-2  text-center py-2 border border-black text-sm font-semibold">Due Date</th>

//           </tr>
//         </thead>
//      <tbody>
//       ${sections
//         .map((student, index) => {
//           return `
//           <tr style="background-color: ${
//             index % 2 === 0 ? "#fff" : "#f9fafb"
//           };">
//             <td style="border: 1px solid #ccc; padding: 6px;">${index + 1}</td>
//             <td style="border: 1px solid #ccc; padding: 6px;">${
//               student.copy_id || ""
//             }</td>
//             <td style="border: 1px solid #ccc; padding: 6px;">${
//               student.book_title || ""
//             }</td>
//             <td style="border: 1px solid #ccc; padding: 6px;">
//              ${student?.first_name || ""}  ${student?.mid_name || ""}  ${student?.last_name || ""}
//             </td>
//             <td style="border: 1px solid #ccc; padding: 6px;">${formatDate(
//               student.issue_date || "",
//             )}</td>

//              <td style="border: 1px solid #ccc; padding: 6px;">${formatDate(
//                student.due_date || "",
//              )}</td>

//           </tr>
//         `;
//         })
//         .join("")}
//     </tbody>

//       </table>
//     </div>
//   </div>`;

//     const printWindow = window.open("", "_blank", "width=2000,height=1000");

//     printWindow.document.write(`
//     <html>
//       <head>
//         <title>${printTitle}</title>
//         <style>
//                    @page {
//                 size: A4 landscape; /* Wider format for better fit */
//                 margin: 10px;
//             }

//                       body {
//                 font-family: Arial, sans-serif;
//                 margin: 0;
//                 padding: 0;
//                 box-sizing: border-box;
//             }

//                        /* Scrollable container */
//             #printContainer {
//                 width: 100%;
//                 overflow-x: auto;  /* Enables horizontal scrolling */
//                 white-space: nowrap; /* Prevents text wrapping */
//             }

//                       #tableMain {
//                 width: 100%;
//                 display: flex;
//                 flex-direction: column;
//                 align-items: center;
//                 justify-content: flex-center;
//                 padding: 0 10px;
//             }

//                        table {
//                 border-spacing: 0;
//                 width: 100%;
//                 min-width: 1200px; /* Ensures table doesn't shrink */
//                 margin: auto;
//                 table-layout: fixed; /* Ensures even column spacing */
//             }

//                       th, td {
//                 border: 1px solid gray;
//                 padding: 8px;
//                 text-align: center;
//                 font-size: 12px;
//                 word-wrap: break-word; /* Ensures text breaks properly */
//             }

//             th {
//                 font-size: 0.8em;
//                 background-color: #f9f9f9;
//             }

//            /* Ensure scrolling is available in print mode */
//             @media print {
//                 #printContainer {
//                     overflow-x: auto;
//                     display: block;
//                     width: 100%;
//                     height: auto;
//                 }
//              table {
//                     min-width: 100%;
//                 }
// }

//         </style>
//       </head>
//          <body>
//         <div id="printContainer">
//             ${printContent}
//         </div>
//     </body>
//     </html>
//   `);

//     printWindow.document.close();

//     //  Ensure content is fully loaded before printing
//     printWindow.onload = function () {
//       printWindow.focus();
//       printWindow.print();
//       printWindow.close(); // Optional: close after printing
//     };
//   };

//   const handleDownloadEXL = () => {
//     if (!displayedSections || displayedSections.length === 0) {
//       toast.error("No data available to download the Excel sheet.");
//       return;
//     }

//     // Define headers matching the print table
//     const headers = [
//       "Sr No.",
//       "Accession No.",
//       "Book Title",
//       "Borrower",
//       "Issue Date",
//       "Due Date",
//     ];
//     // Convert displayedSections data to array format for Excel
//     const data = filteredSections.map((student, index) => [
//       index + 1,
//       student?.copy_id || " ",
//       student?.book_title || " ",
//       `${student?.first_name || " "} ${student?.mid_name || " "} ${student?.last_name || " "}`,
//       formatDate(student?.issue_date || " "),
//       formatDate(student?.due_date || " "),
//     ]);

//     // Create a worksheet
//     const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

//     // Auto-adjust column width
//     const columnWidths = headers.map(() => ({ wch: 20 })); // Approx. width of 20 characters per column
//     worksheet["!cols"] = columnWidths;

//     // Create a workbook and append the worksheet
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Books Return pending");

//     // Generate and download the Excel file
//     const fileName = `Books Return pending Report.xlsx`;
//     XLSX.writeFile(workbook, fileName);
//   };

//   const camelCase = (str) =>
//     str
//       ?.toLowerCase()
//       .split(" ")
//       .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//       .join(" ");

//   return (
//     <>
//       <div className="w-full md:w-[95%] mx-auto p-4 ">
//         <ToastContainer />

//         <div className="card rounded-md ">
//           <div className="p-1 px-3 bg-gray-100 flex justify-between items-center">
//             <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
//               Books Return Pending
//             </h3>{" "}
//             <div className="box-border flex md:gap-x-2 justify-end md:h-10">
//               {filteredSections.length > 0 && (
//                 <div className="md:absolute md:right-10 mb-5 text-gray-500">
//                   <div className="mx-auto w-fit px-2 py-1 bg-blue-50 border border-blue-300 text-blue-800 text-sm rounded text-center">
//                     <div className="flex flex-col md:flex-row gap-x-1 justify-center md:justify-end">
//                       <button
//                         type="button"
//                         onClick={() => setShowSearch((prev) => !prev)}
//                         className="relative bg-blue-400 py-1 hover:bg-blue-500 text-white px-3 rounded group"
//                       >
//                         <FiSearch size={15} />

//                         <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex items-center justify-center bg-gray-600  text-white text-[.7em] rounded-md py-1 px-2">
//                           Search
//                         </div>
//                       </button>

//                       <button
//                         type="button"
//                         onClick={handleDownloadEXL}
//                         className="relative bg-blue-400 py-1 hover:bg-blue-500 text-white px-3 rounded group"
//                       >
//                         <FaFileExcel />

//                         <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex items-center justify-center bg-gray-600  text-white text-[.7em] rounded-md py-1 px-2">
//                           Exports to excel
//                         </div>
//                       </button>

//                       <button
//                         onClick={handlePrint}
//                         className="relative flex flex-row justify-center align-middle items-center gap-x-1 bg-blue-400 hover:bg-blue-500 text-white px-3 rounded group"
//                       >
//                         <FiPrinter />
//                         <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex items-center justify-center bg-gray-600  text-white text-[.7em] rounded-md py-1 px-2">
//                           Print{" "}
//                         </div>
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}
//               <RxCross1
//                 className="text-red-600 cursor-pointer hover:bg-red-100 rounded text-xl mt-1.5"
//                 onClick={() => navigate("/dashboard")}
//               />
//             </div>
//           </div>
//           <div
//             className=" relative w-[97%]   mb-3 h-1  mx-auto bg-red-700"
//             style={{
//               backgroundColor: "#C03078",
//             }}
//           ></div>

//           <div className="card-body w-full">
//             {showSearch && (
//               <>
//                 <div className="p-1 px-3 mb-1 bg-gray-100 border-none">
//                   <div className="w-full flex justify-end mr-0 md:mr-4">
//                     <div className="w-1/2 md:w-[25%] mr-1">
//                       <input
//                         type="text"
//                         className="form-control"
//                         placeholder="Search"
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </>
//             )}
//             <div
//               className="lg:h-96 overflow-y-scroll lg:overflow-x-scroll"
//               style={{
//                 scrollbarWidth: "thin",
//                 scrollbarColor: "#C03178 transparent",
//               }}
//             >
//               <div className="bg-white rounded-lg shadow-xs">
//                 <table className="min-w-full leading-normal table-auto">
//                   <thead>
//                     <tr className="bg-gray-200">
//                       <th className="px-2 w-full md:w-[5%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
//                         Sr. No
//                       </th>
//                       <th className="px-2 w-full md:w-[10%] md:text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
//                         Accession No.
//                       </th>
//                       <th className="px-2 w-full md:w-[50%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
//                         Book Title
//                       </th>
//                       <th className="px-2 w-full md:w-[15%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
//                         Borrower
//                       </th>
//                       <th className="px-2 w-full md:w-[8%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
//                         Issue Date
//                       </th>
//                       <th className="px-2 w-full md:w-[7%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
//                         Due Date
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {loading ? (
//                       <tr>
//                         <td colSpan={11} className="py-20">
//                           <div className="flex justify-center items-center text-blue-700 text-base sm:text-lg">
//                             Please wait while data is loading...
//                           </div>
//                         </td>
//                       </tr>
//                     ) : displayedSections.length > 0 ? (
//                       displayedSections.map((section, index) => (
//                         <tr
//                           key={section.periodical_id}
//                           className={`${index % 2 === 0 ? "bg-white" : "bg-gray-100"} hover:bg-gray-50`}
//                         >
//                           <td className="text-center px-2 py-2 border border-gray-950 text-sm">
//                             {currentPage * pageSize + index + 1}
//                           </td>

//                           <td className="text-center px-2 py-2 border border-gray-950 text-sm">
//                             {section?.copy_id}
//                           </td>

//                           <td className="text-center px-2 py-2 border border-gray-950 text-sm">
//                             {section?.book_title}
//                           </td>

//                           <td className="text-center px-2 py-2 border border-gray-950 text-sm">
//                             {camelCase(
//                               `${section?.first_name || ""} ${section?.mid_name || ""} ${section?.last_name || ""}`,
//                             )}
//                           </td>
//                           <td className="text-center px-2 py-2 border border-gray-950 text-sm">
//                             {formatDate(section?.issue_date)}
//                           </td>

//                           <td className="text-center px-2 py-2 border border-gray-950 text-sm">
//                             {formatDate(section?.due_date)}
//                           </td>
//                         </tr>
//                       ))
//                     ) : sections.length === 0 ? (
//                       <tr>
//                         <td colSpan={10} className="py-20">
//                           <div className="text-center text-red-700 text-base sm:text-lg">
//                             No data availble.
//                           </div>
//                         </td>
//                       </tr>
//                     ) : (
//                       <tr>
//                         <td colSpan={10} className="py-20">
//                           <div className="text-center text-red-700 text-base sm:text-lg">
//                             Result not found!
//                           </div>
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//             <div className=" flex justify-center  pt-2 -mb-3">
//               <ReactPaginate
//                 previousLabel={"Previous"}
//                 nextLabel={"Next"}
//                 breakLabel={"..."}
//                 breakClassName={"page-item"}
//                 breakLinkClassName={"page-link"}
//                 pageCount={pageCount}
//                 marginPagesDisplayed={1}
//                 pageRangeDisplayed={1}
//                 onPageChange={handlePageClick}
//                 containerClassName={"pagination"}
//                 pageClassName={"page-item"}
//                 pageLinkClassName={"page-link"}
//                 previousClassName={"page-item"}
//                 previousLinkClassName={"page-link"}
//                 nextClassName={"page-item"}
//                 nextLinkClassName={"page-link"}
//                 activeClassName={"active"}
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

// export default BookReturnPending;

import axios from "axios";
import { RxCross1 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactPaginate from "react-paginate";
import { FiSearch } from "react-icons/fi";

function BookReturnPending() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Student");

  const [searchTerm, setSearchTerm] = useState("");

  const [absentTeachers, setAbsentTeachers] = useState([]);
  const [leaveCount, setLeaveCount] = useState(0);

  const [presentTeachers, setPresentTeachers] = useState([]);
  const [prsentCount, setPrsentCount] = useState(0);

  const [currentPage, setCurrentPage] = useState(0);
  const [showSearch, setShowSearch] = useState(false);

  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");

  const [backendErrors, setBackendErrors] = useState("");
  const [selectedIds, setSelectedIds] = useState("");
  const [message, setMessage] = useState("");
  const maxCharacters = 150;

  const pageSize = 10;

  useEffect(() => {
    fetchAbsentNonTeachingStaff();
    handleSearch();
  }, []);

  const fetchAbsentNonTeachingStaff = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        `${API_URL}/api/book_return_pending_seperate`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const students = response.data?.data?.students || [];
      const staff = response.data?.data?.staff || [];

      // console.log("Students", students);
      // console.log("Staff", staff);

      setAbsentTeachers(students);
      setPresentTeachers(staff);
      setPrsentCount(students.length);
      setLeaveCount(staff.length);
    } catch (error) {
      setError(error.message || "Something went wrong while fetching data.");
    } finally {
      setLoading(false);
    }
  };
  const handleSearch = async () => {
    setLoading(true);
    setError("");
    // setShowSearch(true);
    await fetchAbsentNonTeachingStaff();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab); // Update the active tab state
  };

  const camelCase = (str) =>
    str
      ?.toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        })
      : "";

  const filteredPresentTeachers = presentTeachers.filter((student) => {
    const searchLower = searchTerm.toLowerCase().trim();

    const fullName = `${student.name || ""}`.toLowerCase();
    const category = `${student.teachercategoryname || ""}`.toLowerCase();
    const phone = `${student.phone || ""}`.toLowerCase();
    const classSection = `${student.class_section || ""}`.toLowerCase();
    const punchIn = `${student.punch_in || ""}`.toLowerCase();
    const punchOut = `${student.punch_out || ""}`.toLowerCase();

    return (
      fullName.includes(searchLower) ||
      category.includes(searchLower) ||
      phone.includes(searchLower) ||
      classSection.includes(searchLower) ||
      punchIn.includes(searchLower) ||
      punchOut.includes(searchLower)
    );
  });

  // console.log(filteredPresentTeachers);

  const filteredAbsentTeachers = absentTeachers.filter((student) => {
    const searchLower = searchTerm.trim().replace(/\s+/g, " ").toLowerCase();

    const normalize = (value) =>
      value?.toString().trim().replace(/\s+/g, " ").toLowerCase() || "";

    const studentName = normalize(student?.book_title);
    const accessionNo = normalize(student?.accession_no);
    const locationBook = normalize(student?.location_of_book);
    const status = normalize(student?.Status_code);
    const amount = normalize(student?.copy_id);
    const author = normalize(student?.author);
    const publisher = normalize(student?.publisher);
    const addedDate = formatDate(normalize(student.issue_date));
    const dueDate = formatDate(normalize(student.due_date));
    const returnDate = formatDate(normalize(student.return_date));
    const pulicationYear = normalize(student?.year);
    const editionNo = normalize(student?.edition);
    const price = normalize(student?.price);
    const isbnNo = normalize(student?.isbn);
    const combined = normalize(
      `${student?.call_no || ""} / ${student?.category_name || ""}`,
    );

    const fullName = normalize(
      `${student?.first_name || ""}  ${student?.mid_name || ""} ${student?.last_name || ""}`,
    );

    const staffName = normalize(`${student?.name}`);

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
      pulicationYear.includes(searchLower) ||
      editionNo.includes(searchLower) ||
      price.includes(searchLower) ||
      isbnNo.includes(searchLower) ||
      fullName.includes(searchLower) ||
      dueDate.includes(searchLower) ||
      returnDate.includes(searchLower) ||
      staffName.includes(searchLower)
    );
  });

  // console.log(filteredAbsentTeachers);

  const activeData =
    activeTab === "Student" ? filteredAbsentTeachers : filteredPresentTeachers;

  useEffect(() => {
    setCurrentPage(0);
  }, [activeTab, searchTerm]);

  const pageCount = Math.ceil(activeData.length / pageSize);

  const displayedData = activeData.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize,
  );

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

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const selectedCount =
    activeTab === "Student"
      ? filteredAbsentTeachers.filter((t) => selectedIds.includes(t.member_id))
          .length
      : filteredPresentTeachers.filter((t) => selectedIds.includes(t.member_id))
          .length;

  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = (e, list) => {
    if (e.target.checked) {
      const allIds = list.map((item) => item.member_id);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    let hasError = false;
    if (selectedIds.length === 0) {
      toast.error("Please select at least one member to send message.");
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
        member_id: selectedIds,
        message: message,
      };

      // Make the API call
      const response = await axios.post(
        `${API_URL}/api/book_return_pending_wp_message`,
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
      <ToastContainer />
      <div className="md:mx-auto md:w-[90%] p-3 bg-white mt-2">
        <div className="card-header flex justify-between items-center">
          <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
            Book Return Pending
          </h3>
          {/* <RxCross1
            className="float-end relative  -top-1 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
            onClick={() => {
              navigate("/dashboard");
            }}
          /> */}
          <div className="flex flex-row gap-3 items-center justify-end">
            {/* Search */}
            <div className="relative group">
              <button
                onClick={() => setShowSearch((prev) => !prev)}
                className="text-black hover:text-pink-500"
              >
                <FiSearch size={20} />
              </button>

              <span className="absolute bottom-full mt-1 right-0 hidden group-hover:block bg-blue-500 text-white text-xs px-2 py-1 rounded shadow">
                Search
              </span>
            </div>

            {/* Close */}
            <RxCross1
              className="text-red-600 cursor-pointer hover:bg-red-100 rounded text-lg"
              onClick={() => navigate("/dashboard")}
            />
          </div>
        </div>
        <div
          className="relative mb-8 h-1 mx-auto bg-red-700"
          style={{ backgroundColor: "#C03078" }}
        ></div>

        <ul className="grid grid-cols-2 gap-x-10 relative -left-6 md:left-0 md:flex md:flex-row -top-4">
          {[
            { label: "Student", count: prsentCount },
            { label: "Staff", count: leaveCount },
          ].map((tab) => (
            <li
              key={tab.label}
              className={`md:-ml-7 shadow-md ${
                activeTab === tab.label ? "text-blue-500 font-bold" : ""
              }`}
            >
              <button
                onClick={() => handleTabChange(tab.label)}
                className="px-2 md:px-4 py-1 hover:bg-gray-200 text-[1em] md:text-sm text-nowrap"
              >
                {tab.label.replace(/([A-Z])/g, " $1")}{" "}
                <span className="text-sm text-[#C03078] font-bold">
                  ({tab.count})
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div className="w-full">
          <div className="bg-white rounded-md">
            {showSearch && (
              <div className="py-1 px-3 bg-gray-100 border-none rounded-t-md mb-1">
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
            )}
            {loading ? (
              <div className="text-center text-xl py-10 text-blue-700">
                Please wait while data is loading...
              </div>
            ) : activeTab === "Student" ? (
              <div
                className="lg:h-96 overflow-y-scroll"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#C03178 transparent",
                }}
              >
                <table className="min-w-full leading-normal table-auto">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-0.5  mx-auto text-center lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Sr.No
                      </th>
                      <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        <div className="flex flex-col items-center">
                          <span>Select All</span>
                          <input
                            type="checkbox"
                            onChange={(e) => handleSelectAll(e, absentTeachers)}
                            checked={
                              absentTeachers.length > 0 &&
                              absentTeachers.every((item) =>
                                selectedIds.includes(item.member_id),
                              )
                            }
                          />
                        </div>
                      </th>
                      <th className="px-0.5  mx-auto text-center lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Acession No.
                      </th>
                      <th className="px-0.5  mx-auto text-center lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Book Title
                      </th>
                      <th className="px-0.5 text-center  lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Borrower
                      </th>
                      <th className="px-0.5 text-center  lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Phone No.
                      </th>
                      <th className="px-0.5 text-center  lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Issue Date
                      </th>
                      <th className="px-0.5 text-center  lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Due Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedData.length > 0 ? (
                      displayedData.map((student, index) => (
                        <tr
                          key={student.student_id}
                          className={`${
                            index % 2 === 0 ? "bg-white" : "bg-gray-100"
                          } hover:bg-gray-50`}
                        >
                          <td className="sm:px-0.5 text-center lg:px-1 border border-gray-950 text-sm">
                            {currentPage * pageSize + index + 1}
                          </td>
                          <td className="text-center px-2 py-2 border border-gray-950 text-sm">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(student.member_id)}
                              onChange={() =>
                                handleCheckboxChange(student.member_id)
                              }
                              // className="w-4 h-4 cursor-pointer accent-blue-500"
                            />
                          </td>
                          <td className="px-2 text-center lg:px-2 py-2 border border-gray-950 text-sm">
                            {student?.copy_id}
                          </td>

                          <td className="text-center px-2 lg:px-2 border border-gray-950 text-sm">
                            {student?.book_title}
                          </td>

                          <td className="text-center px-2 lg:px-2 border border-gray-950 text-sm">
                            {camelCase(
                              `${student.first_name || ""} ${student?.mid_name || ""} ${student?.last_name || ""}`,
                            )}
                          </td>
                          <td className="text-center px-2 lg:px-2 border border-gray-950 text-sm">
                            {student?.phone_no}
                          </td>
                          <td className="text-center px-2 lg:px-2 border border-gray-950 text-sm">
                            {formatDate(student?.issue_date)}
                          </td>
                          <td className="text-center px-2 lg:px-2 border border-gray-950 text-sm">
                            {formatDate(student?.due_date)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="9"
                          className="text-center text-xl py-5 text-red-700 border border-gray-950"
                        >
                          No data available of book return pending for student.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div
                className="h-96 lg:h-96 overflow-y-scroll"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#C03178 transparent",
                }}
              >
                <table className="min-w-full leading-normal table-auto">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-0.5 mx-auto text-center lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Sr.No
                      </th>
                      <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        <div className="flex flex-col items-center">
                          <span>Select All</span>
                          <input
                            type="checkbox"
                            onChange={(e) =>
                              handleSelectAll(e, presentTeachers)
                            }
                            checked={
                              presentTeachers.length > 0 &&
                              presentTeachers.every((item) =>
                                selectedIds.includes(item.member_id),
                              )
                            }
                          />
                        </div>
                      </th>
                      <th className="px-0.5 first-line:mx-auto text-center lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Accession No.
                      </th>
                      <th className="px-0.5  mx-auto text-center lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Book Title
                      </th>
                      <th className="px-0.5 text-center  lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Borrower
                      </th>
                      <th className="px-0.5 text-center  lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Phone No.
                      </th>
                      <th className="px-0.5 text-center  lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Issue Date
                      </th>
                      <th className="px-0.5 text-center  lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Due Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedData.length > 0 ? (
                      displayedData.map((student, index) => (
                        <tr
                          key={student.student_id}
                          className={`${
                            index % 2 === 0 ? "bg-white" : "bg-gray-100"
                          } hover:bg-gray-50`}
                        >
                          <td className="sm:px-0.5 text-center lg:px-1 border border-gray-950 text-sm">
                            {currentPage * pageSize + index + 1}
                          </td>
                          <td className="text-center px-2 py-2 border border-gray-950 text-sm">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(student.member_id)}
                              onChange={() =>
                                handleCheckboxChange(student.member_id)
                              }
                              // className="w-4 h-4 cursor-pointer accent-blue-500"
                            />
                          </td>
                          <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                            {student?.copy_id}
                          </td>

                          <td className="text-center px-2 lg:px-2 py-2 border border-gray-950 text-sm">
                            {student?.book_title}
                          </td>

                          <td className="text-center px-2 lg:px-2 border border-gray-950 text-sm">
                            {camelCase(
                              `${student.first_name || ""} ${student?.mid_name || ""} ${student?.last_name || ""}`,
                            )}
                          </td>
                          <td className="text-center px-2 lg:px-2 py-2 border border-gray-950 text-sm">
                            {student?.phone_no}
                          </td>
                          <td className="text-center px-2 lg:px-2 border border-gray-950 text-sm">
                            {formatDate(student?.issue_date)}
                          </td>
                          <td className="text-center px-2 lg:px-2 border border-gray-950 text-sm">
                            {formatDate(student?.due_date)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="9"
                          className="text-center text-xl py-5 text-red-700 border border-gray-950"
                        >
                          No data available of book return pending for staff.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {loading ? (
            ""
          ) : (
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
          )}

          {loading ? (
            <span>{""}</span>
          ) : (
            ((activeTab === "Student" && filteredAbsentTeachers.length > 0) ||
              (activeTab !== "Student" &&
                filteredPresentTeachers.length > 0)) && (
              <div className="flex flex-col items-center mt-2">
                <div className="w-full md:w-[70%]">
                  <label className="mb-1 font-normal block text-left">
                    {activeTab === "Student"
                      ? "Dear Student ,"
                      : "Dear Staff ,"}
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

          {loading && selectedCount > 0 && (
            <div className="text-center mt-2">
              <p className="text-blue-500 font-semibold">
                Selected Member:{" "}
                <span className="text-pink-600">{selectedCount}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default BookReturnPending;
