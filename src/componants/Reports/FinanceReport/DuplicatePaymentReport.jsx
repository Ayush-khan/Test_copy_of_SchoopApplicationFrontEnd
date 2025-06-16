import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1, RxPadding } from "react-icons/rx";
import { FiPrinter } from "react-icons/fi";
import { FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";
import LoaderStyle from "../../common/LoaderFinal/LoaderStyle";

const DuplicatePaymentReport = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  const [loadingForSearch, setLoadingForSearch] = useState(false);

  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [timetable, setTimetable] = useState([]);

  const pageSize = 10;
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    handleSearch();
  }, []);

  // Handle search and fetch parent information
  const handleSearch = async () => {
    setLoadingForSearch(false);
    setSearchTerm("");
    try {
      setLoadingForSearch(true); // Start loading
      setTimetable([]);
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/api/get_duplicatepaymentreportFinance`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Duplicate Payment Report", response);
      if (!response?.data?.data) {
        toast.error("Duplicate Payment Report data not found.");
        setTimetable([]);
      } else {
        setTimetable(response?.data?.data);
        setPageCount(Math.ceil(response?.data?.data?.length / pageSize)); // Set page count based on response size
      }
    } catch (error) {
      console.error("Error fetching Duplicate Payment Report", error);
      toast.error("Error fetching Duplicate Payment Report. Please try again.");
    } finally {
      setIsSubmitting(false); // Re-enable the button after the operation
      setLoadingForSearch(false);
    }
  };

  const capitalize = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const handlePrint = () => {
    const printTitle = `Duplicate Payment Report`;

    const printContent = `
    <div id="tableMain" class="flex items-center justify-center min-h-screen bg-white">
      <h5 id="tableHeading5" class="text-lg font-semibold border-1 border-black">${printTitle}</h5>
      <div id="tableHeading" class="text-center w-3/4">
        <table class="min-w-full leading-normal table-auto border border-black mx-auto mt-2">
          <thead>
            <tr class="bg-gray-100">
              <th class="px-2 py-2 border border-black">Sr.No</th>
              <th class="px-2 py-2 border border-black">Student Name</th>
              <th class="px-2 py-2 border border-black">Payment Date</th>
              <th class="px-2 py-2 border border-black">Class</th>
              <th class="px-2 py-2 border border-black">Installment</th>
              <th class="px-2 py-2 border border-black">Installment Amount</th>
              <th class="px-2 py-2 border border-black">Receipt No.</th>
            </tr>
          </thead>
          <tbody>
            ${displayedSections
              .map(
                (subject, index) => `
                <tr>
                  <td class="border border-black">${index + 1}</td>
                  <td class="border border-black">${
                    subject?.student_name || ""
                  }</td>
                  <td class="border border-black">${subject?.payment_date}</td>
                  <td class="border border-black">${subject?.class}</td>
                  <td class="border border-black"> ${subject.installment}</td>
                  <td class="border border-black">${subject?.amount || ""}</td>
                  <td class="border border-black">${
                    subject?.receipt_no || ""
                  }</td>
                
               
                </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
    const printWindow = window.open("", "_blank", "width=800,height=1000");

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
                width: 90%;
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

    // Define headers matching the print table
    const headers = [
      "Sr No.",
      "Student Name",
      "Payment Date",
      "Class",
      "Installment",
      "Installment Amount",
      "Receipt No.",
    ];

    // Convert displayedSections data to array format for Excel
    const data = displayedSections.map((student, index) => [
      index + 1,
      student?.student_name || " ",
      student?.payment_date || " ",
      student?.class || " ",
      student.installment,
      student?.amount || " ",
      student?.receipt_no || " ",
    ]);

    // Create a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // Auto-adjust column width
    const columnWidths = headers.map(() => ({ wch: 20 })); // Approx. width of 20 characters per column
    worksheet["!cols"] = columnWidths;

    // Create a workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Duplicate Payment Report"
    );

    // Generate and download the Excel file
    const fileName = `Duplicate_Payment_Report.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  console.log("row", timetable);

  const filteredSections = timetable.filter((student) => {
    const searchLower = searchTerm.trim().replace(/\s+/g, " ").toLowerCase();
    const formatDate = (dateString) => {
      if (!dateString) return "";
      const [year, month, day] = dateString.split("-");
      return `${day}/${month}/${year} || ${day}-${month}-${year}`;
    };

    const normalize = (value) =>
      value?.toString().trim().replace(/\s+/g, " ").toLowerCase() || "";

    // Extract relevant fields and convert them to lowercase for case-insensitive search

    const staffName = normalize(student?.student_name); // Convert entire name to lowercase
    const paymentDate = normalize(student?.payment_date);
    const sectionClass = normalize(student?.class);
    const installmentAmount = normalize(student?.amount);
    const installment = normalize(student?.installment);
    const receiptNo = normalize(student?.receipt_no);

    // Check if the search term is present in any of the specified fields
    return (
      staffName.includes(searchLower) ||
      paymentDate.includes(searchLower) ||
      sectionClass.includes(searchLower) ||
      installmentAmount.includes(searchLower) ||
      installment.includes(searchLower) ||
      receiptNo.includes(searchLower)
    );
  });

  const displayedSections = filteredSections.slice(currentPage * pageSize);
  return (
    <>
      <div className="w-full md:w-[100%] mx-auto p-4 ">
        <ToastContainer />
        <div className="card rounded-md ">
          {loadingForSearch ? (
            <div className="flex justify-center items-center h-64">
              <LoaderStyle />
            </div>
          ) : timetable.length > 0 ? (
            <div className="w-full">
              <div className="card mx-auto lg:w-full shadow-lg">
                <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                  <div className="w-full flex flex-row justify-between mr-0 md:mr-4">
                    <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
                      List of Duplicate Payment Report
                    </h3>
                    <div className="w-1/2 md:w-[18%] mr-1">
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
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex items-center justify-center bg-gray-600 text-white text-[.7em] rounded-md py-1 px-2">
                        Exports to excel
                      </div>
                    </button>

                    <button
                      onClick={handlePrint}
                      className="relative flex flex-row justify-center align-middle items-center gap-x-1 bg-blue-400 hover:bg-blue-500 text-white px-3 rounded group"
                    >
                      <FiPrinter />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex items-center justify-center bg-gray-600 text-white text-[.7em] rounded-md py-1 px-2">
                        Print
                      </div>
                    </button>
                  </div>
                </div>

                <div
                  className="relative w-[97%] mb-3 h-1 mx-auto bg-red-700"
                  style={{ backgroundColor: "#C03078" }}
                ></div>

                <div className="card-body w-full">
                  <div
                    className="h-[550px] lg:h-[550px] overflow-y-scroll overflow-x-scroll"
                    style={{
                      scrollbarWidth: "thin",
                      scrollbarColor: "#C03178 transparent",
                    }}
                  >
                    <table className="min-w-full w-[1500px] leading-normal table-auto">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="w-12 px-2 py-2 text-center border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                            Sr No.
                          </th>
                          <th className="w-44 px-3 py-2 text-center border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                            Student Name
                          </th>
                          <th className="w-28 px-3 py-2 text-center border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                            Payment Date
                          </th>
                          <th className="w-28 px-3 py-2 text-center border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                            Class
                          </th>
                          <th className="w-20 px-2 py-2 text-center border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                            Installment
                          </th>
                          <th className="w-24 px-2 py-2 text-center border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                            Installment Amount
                          </th>
                          <th className="w-36 px-3 py-2 text-center border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                            Receipt No.
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayedSections.length > 0 ? (
                          displayedSections.map((student, index) => (
                            <tr
                              key={student.adm_form_pk}
                              className="border border-gray-300"
                            >
                              <td className="px-2 py-2 text-center border border-gray-300">
                                {index + 1}
                              </td>
                              <td className="px-2 py-2 text-center border border-gray-300">
                                {student?.student_name || " "}
                              </td>
                              <td className="px-2 py-2 text-center border border-gray-300">
                                {student?.payment_date}
                              </td>
                              <td className="px-2 py-2 text-center border border-gray-300">
                                {student?.class}
                              </td>
                              <td className="px-2 py-2 text-center border border-gray-300">
                                {student?.installment}
                              </td>
                              <td className="px-2 py-2 text-nowrap text-center border border-gray-300">
                                {student?.amount || " "}
                              </td>
                              <td className="px-2 py-2 text-center border border-gray-300">
                                {student?.receipt_no || " "}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="7"
                              className="text-center text-red-700 py-6 text-lg"
                            >
                              Oops! No data found..
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-48">
              <div className="text-red-700 text-2xl font-semibold">
                Oops! No data found..
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DuplicatePaymentReport;
