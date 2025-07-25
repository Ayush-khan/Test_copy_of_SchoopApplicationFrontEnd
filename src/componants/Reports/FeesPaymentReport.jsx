// import { useState, useEffect, useMemo } from "react";
// import axios from "axios";
// import Select from "react-select";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { useNavigate } from "react-router-dom";
// import { RxCross1 } from "react-icons/rx";
// import Loader from "../common/LoaderFinal/LoaderStyle";
// import { FiPrinter } from "react-icons/fi";
// import { FaFileExcel } from "react-icons/fa";
// import * as XLSX from "xlsx";
// import DateRangePickerComponent from "../common/DateRangePicker/DateRangePickerComponent";

// const FeesPaymentReport = () => {
//   const API_URL = import.meta.env.VITE_API_URL;
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [status, setStatus] = useState(null); // For status dropdown

//   const [currentPage, setCurrentPage] = useState(0);
//   const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
//   const [selectedStudentId, setSelectedStudentId] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [loadingForSearch, setLoadingForSearch] = useState(false);

//   const navigate = useNavigate();
//   const [loadingExams, setLoadingExams] = useState(false);
//   const [studentError, setStudentError] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const [timetable, setTimetable] = useState([]);

//   const pageSize = 10;
//   const [pageCount, setPageCount] = useState(0);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [searchFrom, setSearchFrom] = useState("");
//   const [searchTo, setSearchTo] = useState("");

//   const handleDateChange = (from, to) => {
//     console.log("Updated Dates:", { searchFrom: from, searchTo: to });
//     setSearchFrom(from);
//     setSearchTo(to);
//   };

//   useEffect(() => {
//     if (searchFrom && searchTo) {
//       handleSearch();
//     }
//   }, [searchFrom, searchTo]);
//   // Handle search and fetch parent information

//   const handleSearch = async () => {
//     setLoadingForSearch(false);

//     setSearchTerm("");
//     try {
//       setLoadingForSearch(true); // Start loading
//       setTimetable([]);
//       const token = localStorage.getItem("authToken");
//       const params = {};
//       if (searchFrom) params.searchFrom = searchFrom;
//       if (searchTo) params.searchTo = searchTo;
//       const response = await axios.get(
//         `${API_URL}/api/getfeepaymentrecordreport`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//           params,
//         }
//       );

//       if (!response?.data?.data || response?.data?.data?.length === 0) {
//         toast.error("Fee Payment Record Report data not found.");
//         setTimetable([]);
//       } else {
//         setTimetable(response?.data?.data);
//         setPageCount(Math.ceil(response?.data?.data?.length / pageSize)); // Set page count based on response size
//       }
//     } catch (error) {
//       console.error("Error fetching Fee Payment Record Report:", error);
//       toast.error(
//         "Error fetching Fee Payment Record Report. Please try again."
//       );
//     } finally {
//       setIsSubmitting(false); // Re-enable the button after the operation
//       setLoadingForSearch(false);
//     }
//   };
//   const handleDownloadEXL = () => {
//     if (!displayedSections || displayedSections.length === 0) {
//       toast.error("No data available to download the Excel sheet.");
//       return;
//     }

//     // Define headers matching the print table
//     const headers = [
//       "Sr No.",
//       "Receipt No.",
//       "Student Name",
//       "Payment date",
//       "Amount",
//       "Payment mode",
//     ];

//     // Convert displayedSections data to array format for Excel
//     const data = displayedSections.map((student, index) => [
//       index + 1,
//       student?.receipt_no || " ",
//       `${student?.first_name || ""} ${student?.mid_name || ""} ${
//         student?.last_name || ""
//       }`,
//       student?.payment_date || " ",
//       student?.payment_amount || " ",
//       student?.payment_mode || " ",
//     ]);

//     // Create a worksheet
//     const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

//     // Auto-adjust column width
//     const columnWidths = headers.map(() => ({ wch: 20 })); // Approx. width of 20 characters per column
//     worksheet["!cols"] = columnWidths;

//     // Create a workbook and append the worksheet
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Admission Form Data");

//     // Generate and download the Excel file
//     const fileName = `Fee Payment Record Report (From ${searchFrom} to ${searchTo}).xlsx`;
//     XLSX.writeFile(workbook, fileName);
//   };

//   console.log("row", timetable);

//   const handlePrint = () => {
//     const printTitle = `Fee Payment Record Report (From ${searchFrom} to ${searchTo})`;
//     const printContent = `
//   <div id="tableMain" class="flex items-center justify-center min-h-screen bg-white">
//          <h5 id="tableHeading5"  class="text-lg font-semibold border-1 border-black">${printTitle}</h5>
//  <div id="tableHeading" class="text-center w-3/4">
//       <table class="min-w-full leading-normal table-auto border border-black mx-auto mt-2">
//         <thead>
//           <tr class="bg-gray-100">
//             <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Sr.No</th>
//             <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Receipt No.</th>
//             <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Student Name</th>
//             <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Payment date</th>
//                        <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Amount</th>
//                                    <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Payment mode</th>

//           </tr>
//         </thead>
//         <tbody>
//           ${displayedSections
//             .map(
//               (subject, index) => `
//               <tr class="text-sm">
//                 <td class="px-2 text-center py-2 border border-black">${
//                   index + 1
//                 }</td>
//                 <td class="px-2 text-center py-2 border border-black">${
//                   subject?.receipt_no || " "
//                 }</td>
//            <td className="px-2 text-center py-2 border border-black">
//              ${subject?.first_name && `${subject.first_name} `}
//              ${subject?.mid_name && `${subject.mid_name} `}
//              ${subject?.last_name && `${subject.last_name} `}
//            </td>

//                 <td class="px-2 text-center py-2 border border-black">${
//                   subject?.payment_date || " "
//                 }</td>
//                  <td class="px-2 text-center py-2 border border-black">${
//                    subject?.payment_amount || " "
//                  }</td>
//                   <td class="px-2 text-center py-2 border border-black">${
//                     subject?.payment_mode || " "
//                   }</td>
//               </tr>`
//             )
//             .join("")}
//         </tbody>
//       </table>
//     </div>
//   </div>`;

//     const printWindow = window.open("", "_blank", "width=1000,height=800");

//     printWindow.document.write(`
//     <html>
//       <head>
//         <title>${printTitle}</title>
//         <style>
//                 @page { margin: 0; }
//         body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }

//         /* Increase width */
//         #tableMain {
//           width: 100%;
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//         }

//         h5 {
//           width: 100%;
//           text-align: center;
//           font-size: 1.5em;
//           font-weight: bold;
//           margin-bottom: 10px;
//         }

//         #tableContainer {
//           width: 100%;
//           display: flex;
//           justify-content: center;
//         }

//         table {
//           width: 80%; /* Increase table width */
//           border-spacing: 0;
//            margin: auto;
//         }

//         th, td {
//           border: 1px solid gray;
//           padding: 12px;
//           text-align: center;
//           font-size: 16px; /* Increase font size */
//         }

//         th {
//           background-color: #f9f9f9;
//           font-size: 1.1em;
//         }
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

//     // ✅ Ensure content is fully loaded before printing
//     printWindow.onload = function () {
//       printWindow.focus();
//       printWindow.print();
//       printWindow.close(); // Optional: close after printing
//     };
//   };

//   const filteredSections = timetable.filter((section) => {
//     const searchLower = searchTerm.toLowerCase();

//     // Extract relevant fields and convert them to lowercase for case-insensitive search
//     const receiptNo = section?.receipt_no?.toLowerCase() || "";
//     const studentName = `${section?.first_name || ""} ${
//       section?.mid_name || ""
//     } ${section?.last_name || ""}`
//       .toLowerCase()
//       .trim();
//     const paymentDate = section?.payment_date?.toLowerCase() || "";
//     const amount = section?.amount?.toLowerCase() || "";
//     const paymentMode = section?.payment_mode?.toLowerCase() || "";

//     // Check if the search term is present in any of the specified fields
//     return (
//       receiptNo.includes(searchLower) ||
//       studentName.includes(searchLower) ||
//       paymentDate.includes(searchLower) ||
//       amount.includes(searchLower) ||
//       paymentMode.includes(searchLower)
//     );
//   });

//   const displayedSections = filteredSections.slice(currentPage * pageSize);
//   return (
//     <>
//       <div className="w-full md:w-[90%] mx-auto p-4 ">
//         <ToastContainer />
//         <div className="card p-4 rounded-md ">
//           <div className=" card-header mb-4 flex justify-between items-center ">
//             <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
//               Fees payment report
//             </h5>
//             <RxCross1
//               className=" relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
//               onClick={() => {
//                 navigate("/dashboard");
//               }}
//             />
//           </div>
//           <div
//             className=" relative w-full   -top-6 h-1  mx-auto bg-red-700"
//             style={{
//               backgroundColor: "#C03078",
//             }}
//           ></div>

//           <>
//             <div className=" w-full md:w-[85%]   flex justify-center flex-col md:flex-row gap-x-1     ml-0    p-2">
//               <div className="w-full md:w-[99%] flex md:flex-row justify-between items-center mt-0 md:mt-4">
//                 <div className="w-full md:w-[75%]  gap-x-0 md:gap-x-12  flex flex-col gap-y-2 md:gap-y-0 md:flex-row">
//                   <div className="w-full  md:w-[70%] gap-x-2   justify-around  my-1 md:my-4 flex md:flex-row ">
//                     <label
//                       className="w-full md:w-[15%] text-md  mt-1.5"
//                       htmlFor="studentSelect"
//                     >
//                       <span className=" text-nowrap text-gray-500 font-medium">
//                         Payment Date
//                       </span>
//                       {/* Staff Name <span className="text-red-500">*</span> */}
//                     </label>
//                     <div className=" text-sm w-full md:w-[65%]">
//                       <DateRangePickerComponent
//                         onDateChange={handleDateChange}
//                       />

//                       {studentError && (
//                         <div className="h-8 relative ml-1 text-danger text-xs">
//                           {studentError}
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   <div className="mt-1">
//                     <button
//                       type="search"
//                       onClick={handleSearch}
//                       style={{ backgroundColor: "#2196F3" }}
//                       className={` btn h-10 w-18 md:w-auto btn-primary text-white font-bold py-1 border-1 border-blue-500 px-4 rounded ${
//                         loadingForSearch ? "opacity-50 cursor-not-allowed" : ""
//                       }`}
//                       disabled={loadingForSearch}
//                     >
//                       {loadingForSearch ? (
//                         <span className="flex items-center">
//                           <svg
//                             className="animate-spin h-4 w-4 mr-2 text-white"
//                             xmlns="http://www.w3.org/2000/svg"
//                             fill="none"
//                             viewBox="0 0 24 24"
//                           >
//                             <circle
//                               className="opacity-25"
//                               cx="12"
//                               cy="12"
//                               r="10"
//                               stroke="currentColor"
//                               strokeWidth="4"
//                             ></circle>
//                             <path
//                               className="opacity-75"
//                               fill="currentColor"
//                               d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
//                             ></path>
//                           </svg>
//                           Browsing...
//                         </span>
//                       ) : (
//                         "Browse"
//                       )}
//                     </button>
//                   </div>
//                 </div>{" "}
//               </div>
//             </div>

//             {timetable.length > 0 && (
//               <>
//                 <div className="w-full  mt-4">
//                   <div className="card mx-auto lg:w-full shadow-lg">
//                     <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
//                       <div className="w-full   flex flex-row justify-between mr-0 md:mr-4 ">
//                         <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
//                           Fees payment report List
//                         </h3>
//                         <div className="w-1/2 md:w-[18%] mr-1 ">
//                           <input
//                             type="text"
//                             className="form-control"
//                             placeholder="Search "
//                             onChange={(e) => setSearchTerm(e.target.value)}
//                           />
//                         </div>
//                       </div>
//                       <div className="flex flex-col md:flex-row gap-x-1 justify-center md:justify-end">
//                         <button
//                           type="button"
//                           onClick={handleDownloadEXL}
//                           className="relative bg-blue-400 py-1 hover:bg-blue-500 text-white px-3 rounded group"
//                         >
//                           <FaFileExcel />

//                           <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex items-center justify-center bg-gray-600  text-white text-[.7em] rounded-md py-1 px-2">
//                             Exports to excel
//                           </div>
//                         </button>

//                         <button
//                           onClick={handlePrint}
//                           className="relative flex flex-row justify-center align-middle items-center gap-x-1 bg-blue-400 hover:bg-blue-500 text-white px-3 rounded group"
//                         >
//                           <FiPrinter />
//                           <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex items-center justify-center bg-gray-600  text-white text-[.7em] rounded-md py-1 px-2">
//                             Print{" "}
//                           </div>
//                         </button>
//                       </div>
//                     </div>
//                     <div
//                       className=" relative w-[97%]   mb-3 h-1  mx-auto bg-red-700"
//                       style={{
//                         backgroundColor: "#C03078",
//                       }}
//                     ></div>

//                     <div className="card-body w-full">
//                       <div
//                         className="h-96 lg:h-96 overflow-y-scroll overflow-x-scroll"
//                         style={{
//                           scrollbarWidth: "thin", // Makes scrollbar thin in Firefox
//                           scrollbarColor: "#C03178 transparent", // Sets track and thumb color in Firefox
//                         }}
//                       >
//                         <table className="min-w-full leading-normal table-auto">
//                           <thead>
//                             <tr className="bg-gray-100">
//                               {[
//                                 "Sr No.",
//                                 "Receipt No.",
//                                 "Student Name",
//                                 "Payment date",
//                                 "Amount",
//                                 "Payment mode",
//                               ].map((header, index) => (
//                                 <th
//                                   key={index}
//                                   className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider"
//                                 >
//                                   {header}
//                                 </th>
//                               ))}
//                             </tr>
//                           </thead>

//                           <tbody>
//                             {displayedSections.length ? (
//                               displayedSections?.map((student, index) => (
//                                 <tr
//                                   key={student.adm_form_pk}
//                                   className="border border-gray-300"
//                                 >
//                                   <td className="px-2 py-2 text-center border border-gray-300">
//                                     {index + 1}
//                                   </td>
//                                   <td className="px-2 py-2 text-center border border-gray-300">
//                                     {student?.receipt_no || " "}
//                                   </td>
//                                   <td className="px-2 py-2 text-center border border-gray-300">
//                                     {student?.first_name
//                                       ? `${student.first_name} `
//                                       : ""}
//                                     {student?.mid_name
//                                       ? `${student.mid_name} `
//                                       : ""}
//                                     {student?.last_name
//                                       ? `${student.last_name} `
//                                       : ""}
//                                   </td>

//                                   <td className="px-2 py-2 text-center border border-gray-300">
//                                     {student?.date || " "}
//                                   </td>
//                                   <td className="px-2 py-2 text-center border border-gray-300">
//                                     {student?.payment_amount || " "}
//                                   </td>
//                                   <td className="px-2 py-2 text-center border border-gray-300">
//                                     {student?.payment_mode || " "}
//                                   </td>
//                                 </tr>
//                               ))
//                             ) : (
//                               <div className=" absolute left-[1%] w-[100%]  text-center flex justify-center items-center mt-14">
//                                 <div className=" text-center text-xl text-red-700">
//                                   Oops! No data found..
//                                 </div>
//                               </div>
//                             )}
//                           </tbody>
//                         </table>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </>
//             )}
//           </>
//         </div>
//       </div>
//     </>
//   );
// };

// export default FeesPaymentReport;

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
import Loader from "../common/LoaderFinal/LoaderStyle";
import { FiPrinter } from "react-icons/fi";
import { FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";
import DateRangePickerComponent from "../common/DateRangePicker/DateRangePickerComponent";

const FeesPaymentReport = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [status, setStatus] = useState(null); // For status dropdown

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
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");

  const handleDateChange = (from, to) => {
    console.log("Updated Dates:", { searchFrom: from, searchTo: to });
    setSearchFrom(from);
    setSearchTo(to);
  };

  useEffect(() => {
    if (searchFrom && searchTo) {
      handleSearch();
    }
  }, [searchFrom, searchTo]);
  // Handle search and fetch parent information

  const handleSearch = async () => {
    setLoadingForSearch(false);

    setSearchTerm("");
    try {
      setLoadingForSearch(true); // Start loading
      setTimetable([]);
      const token = localStorage.getItem("authToken");
      const params = {};
      if (searchFrom) params.searchFrom = searchFrom;
      if (searchTo) params.searchTo = searchTo;
      const response = await axios.get(
        `${API_URL}/api/getfeepaymentrecordreport`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      if (!response?.data?.data || response?.data?.data?.length === 0) {
        toast.error("Fee Payment Record Report data not found.");
        setTimetable([]);
      } else {
        setTimetable(response?.data?.data);
        setPageCount(Math.ceil(response?.data?.data?.length / pageSize)); // Set page count based on response size
      }
    } catch (error) {
      console.error("Error fetching Fee Payment Record Report:", error);
      toast.error(
        "Error fetching Fee Payment Record Report. Please try again."
      );
    } finally {
      setIsSubmitting(false); // Re-enable the button after the operation
      setLoadingForSearch(false);
    }
  };
  const handleDownloadEXL = () => {
    if (!displayedSections || displayedSections.length === 0) {
      toast.error("No data available to download the Excel sheet.");
      return;
    }

    // Define headers matching the print table
    const headers = [
      "Sr No.",
      "Receipt No.",
      "Student Name",
      "Payment date",
      "Amount",
      "Payment mode",
    ];

    // Convert displayedSections data to array format for Excel
    const data = displayedSections.map((student, index) => [
      index + 1,
      student?.receipt_no || " ",
      `${student?.first_name || ""} ${student?.mid_name || ""} ${
        student?.last_name || ""
      }`,
      student?.payment_date || " ",
      student?.payment_amount || " ",
      student?.payment_mode || " ",
    ]);

    // Create a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // Auto-adjust column width
    const columnWidths = headers.map(() => ({ wch: 20 })); // Approx. width of 20 characters per column
    worksheet["!cols"] = columnWidths;

    // Create a workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Admission Form Data");

    // Generate and download the Excel file
    const fileName = `Fee Payment Record Report (From ${searchFrom} to ${searchTo}).xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  console.log("row", timetable);

  const handlePrint = () => {
    const printTitle = `Fee Payment Record Report (From ${searchFrom} to ${searchTo})`;
    const printContent = `
  <div id="tableMain" class="flex items-center justify-center min-h-screen bg-white">
         <h5 id="tableHeading5"  class="text-lg font-semibold border-1 border-black">${printTitle}</h5>
 <div id="tableHeading" class="text-center w-3/4">
      <table class="min-w-full leading-normal table-auto border border-black mx-auto mt-2">
        <thead>
          <tr class="bg-gray-100">
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Sr.No</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Receipt No.</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Student Name</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Payment date</th>
                       <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Amount</th>
                                   <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Payment mode</th>

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
                  subject?.receipt_no || " "
                }</td>
           <td className="px-2 text-center py-2 border border-black">
             ${subject?.first_name && `${subject.first_name} `}
             ${subject?.mid_name && `${subject.mid_name} `}
             ${subject?.last_name && `${subject.last_name} `}
           </td>

                <td class="px-2 text-center py-2 border border-black">${
                  subject?.payment_date || " "
                }</td>
                 <td class="px-2 text-center py-2 border border-black">${
                   subject?.payment_amount || " "
                 }</td>
                  <td class="px-2 text-center py-2 border border-black">${
                    subject?.payment_mode || " "
                  }</td>
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
                @page { margin: 0; }
        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
  
        /* Increase width */
        #tableMain {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
  
        h5 {
          width: 100%;
          text-align: center;
          font-size: 1.5em;
          font-weight: bold;
          margin-bottom: 10px;
        }
  
        #tableContainer {
          width: 100%;
          display: flex;
          justify-content: center;
        }
  
        table {
          width: 80%; /* Increase table width */
          border-spacing: 0;
           margin: auto;
        }
  
        th, td {
          border: 1px solid gray;
          padding: 12px;
          text-align: center;
          font-size: 16px; /* Increase font size */
        }
  
        th {
          background-color: #f9f9f9;
          font-size: 1.1em;
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

    // ✅ Ensure content is fully loaded before printing
    printWindow.onload = function () {
      printWindow.focus();
      printWindow.print();
      printWindow.close(); // Optional: close after printing
    };
  };

  const filteredSections = timetable.filter((section) => {
    const searchLower = searchTerm.toLowerCase();

    // Extract relevant fields and convert them to lowercase for case-insensitive search
    const receiptNo = section?.receipt_no?.toLowerCase() || "";
    const studentName = `${section?.first_name || ""} ${
      section?.mid_name || ""
    } ${section?.last_name || ""}`
      .toLowerCase()
      .trim();
    const paymentDate = section?.payment_date?.toLowerCase() || "";
    const amount = section?.amount?.toLowerCase() || "";
    const paymentMode = section?.payment_mode?.toLowerCase() || "";

    // Check if the search term is present in any of the specified fields
    return (
      receiptNo.includes(searchLower) ||
      studentName.includes(searchLower) ||
      paymentDate.includes(searchLower) ||
      amount.includes(searchLower) ||
      paymentMode.includes(searchLower)
    );
  });

  const displayedSections = filteredSections.slice(currentPage * pageSize);
  return (
    <>
      <div className="w-full md:w-[90%] mx-auto p-4 ">
        <ToastContainer />
        <div className="card p-4 rounded-md ">
          <div className=" card-header mb-4 flex justify-between items-center ">
            <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
              Fees payment report
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
            <div className=" w-full md:w-[85%]   flex justify-center flex-col md:flex-row gap-x-1     ml-0    p-2">
              <div className="w-full md:w-[99%] flex md:flex-row justify-between items-center mt-0 md:mt-4">
                <div className="w-full md:w-[75%]  gap-x-0 md:gap-x-12  flex flex-col gap-y-2 md:gap-y-0 md:flex-row">
                  <div className="w-full  md:w-[70%] gap-x-2   justify-around  my-1 md:my-4 flex md:flex-row ">
                    <label
                      className="w-full md:w-[15%] text-md  mt-1.5"
                      htmlFor="studentSelect"
                    >
                      <span className=" text-nowrap text-gray-500 font-medium">
                        Payment Date
                      </span>
                      {/* Staff Name <span className="text-red-500">*</span> */}
                    </label>
                    <div className=" text-sm w-full md:w-[65%]">
                      <DateRangePickerComponent
                        onDateChange={handleDateChange}
                      />

                      {studentError && (
                        <div className="h-8 relative ml-1 text-danger text-xs">
                          {studentError}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-1">
                    <button
                      type="search"
                      onClick={handleSearch}
                      style={{ backgroundColor: "#2196F3" }}
                      className={` btn h-10 w-18 md:w-auto btn-primary text-white font-bold py-1 border-1 border-blue-500 px-4 rounded ${
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
                </div>{" "}
              </div>
            </div>

            {timetable.length > 0 && (
              <>
                <div className="w-full  mt-4">
                  <div className="card mx-auto lg:w-full shadow-lg">
                    <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                      <div className="w-full   flex flex-row justify-between mr-0 md:mr-4 ">
                        <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
                          Fees payment report List
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
                                "Receipt No.",
                                "Student Name",
                                "Payment date",
                                "Amount",
                                "Payment mode",
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
                                    {student?.receipt_no || " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student?.first_name
                                      ? `${student.first_name} `
                                      : ""}
                                    {student?.mid_name
                                      ? `${student.mid_name} `
                                      : ""}
                                    {student?.last_name
                                      ? `${student.last_name} `
                                      : ""}
                                  </td>

                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student?.date || " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student?.payment_amount || " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student?.payment_mode || " "}
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

export default FeesPaymentReport;
