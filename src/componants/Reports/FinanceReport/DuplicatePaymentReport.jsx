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
      const response = await axios.get(`${API_URL}/api/get_staff_report`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Duplicate Payment Report", response);
      if (!response?.data?.data || response?.data?.length === 0) {
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
                  <td class="border border-black">${subject?.name || ""}</td>
                  <td class="border border-black">${
                    subject?.birthday
                      ? new Date(subject.birthday).toLocaleDateString("en-GB")
                      : ""
                  }</td>
                  <td class="border border-black">${
                    subject?.date_of_joining
                      ? new Date(subject.date_of_joining).toLocaleDateString(
                          "en-GB"
                        )
                      : ""
                  }</td>
                  <td class="border border-black"> ${
                    subject.gender === "female"
                      ? "Female"
                      : subject.gender === "male"
                      ? "Male"
                      : " "
                  }</td>
                  <td class="border border-black">${
                    subject?.blood_group || ""
                  }</td>
                  <td class="border border-black">${
                    subject?.designation || ""
                  }</td>
                
               
                </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
    const printWindow = window.open("", "_blank", "width=1000,height=1000");

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
      student?.name || " ",
      student?.birthday
        ? new Date(student.birthday).toLocaleDateString("en-GB")
        : " ",
      student?.date_of_joining
        ? new Date(student.date_of_joining).toLocaleDateString("en-GB")
        : " ",
      student.sex === "female"
        ? "Female"
        : student.sex === "male"
        ? "Male"
        : " ",
      student?.blood_group || " ",
      student?.designation || " ",
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
    const fileName = `Staff_Report.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  console.log("row", timetable);

  const filteredSections = timetable.filter((student) => {
    const searchLower = searchTerm.toLowerCase();
    const formatDate = (dateString) => {
      if (!dateString) return "";
      const [year, month, day] = dateString.split("-");
      return `${day}/${month}/${year} || ${day}-${month}-${year}`;
    };

    // Extract relevant fields and convert them to lowercase for case-insensitive search

    const staffName = student?.name?.toLowerCase() || ""; // Convert entire name to lowercase
    const dateofBirth = formatDate(student?.birthday).toLowerCase();
    const dateofJoining = formatDate(student?.date_of_joining).toLowerCase();
    const gender = student?.sex?.toLowerCase() || "";
    const bloodGroup = student?.blood_group?.toLowerCase() || "";
    const designation = student?.designation?.toLowerCase() || "";
    const phoneNo = student?.phone?.toLowerCase() || "";
    const staffEmail = student?.email?.toLowerCase() || "";
    const address = student?.address?.toLowerCase() || "";
    const aadharCardNo = student?.aadhar_card_no?.toLowerCase() || "";
    const academicQual = student?.academic_qual?.toLowerCase() || "";
    const professionalQual = student?.professional_qual?.toLowerCase() || "";
    const trainingStatus = student?.trained?.toLowerCase() || "";
    const experienceStaff = student?.experience
      ? String(student.experience)
      : "";

    // Check if the search term is present in any of the specified fields
    return (
      staffName.includes(searchLower) ||
      dateofBirth.includes(searchLower) ||
      dateofJoining.includes(searchLower) ||
      gender.includes(searchLower) ||
      bloodGroup.includes(searchLower) ||
      designation.includes(searchLower) ||
      phoneNo.includes(searchLower) ||
      staffEmail.includes(searchLower) ||
      address.includes(searchLower) ||
      aadharCardNo.includes(searchLower) ||
      academicQual.includes(searchLower) ||
      professionalQual.includes(searchLower) ||
      trainingStatus.includes(searchLower) ||
      experienceStaff.includes(searchLower)
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
              {/* <div className="spinner-border text-primary" role="status"> */}
              <LoaderStyle />
              {/* </div> */}
            </div>
          ) : (
            timetable.length > 0 && (
              <>
                <div className="w-full">
                  <div className="card mx-auto lg:w-full shadow-lg">
                    <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                      <div className="w-full flex flex-row justify-between mr-0 md:mr-4 ">
                        <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
                          List of Duplicate Payment Report
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
                        className="h-[550px] lg:h-[550px] overflow-y-scroll overflow-x-scroll"
                        style={{
                          scrollbarWidth: "thin", // Makes scrollbar thin in Firefox
                          scrollbarColor: "#C03178 transparent", // Sets track and thumb color in Firefox
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
                                    {student?.name || " "}
                                  </td>

                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student?.birthday
                                      ? new Date(
                                          student.birthday
                                        ).toLocaleDateString("en-GB")
                                      : " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student?.date_of_joining
                                      ? new Date(
                                          student.date_of_joining
                                        ).toLocaleDateString("en-GB")
                                      : " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.sex === "female"
                                      ? "Female"
                                      : student.sex === "male"
                                      ? "Male"
                                      : " "}
                                  </td>
                                  <td className="px-2 py-2 text-nowrap text-center border border-gray-300">
                                    {student?.blood_group || " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student?.designation || " "}
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
            )
          )}
        </div>
      </div>
    </>
  );
};

export default DuplicatePaymentReport;
