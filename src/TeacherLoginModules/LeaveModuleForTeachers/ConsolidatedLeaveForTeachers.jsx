import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
import Loader from "../../componants/common/LoaderFinal/LoaderStyle";
import { FiPrinter } from "react-icons/fi";
import { FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";

const ConsolidatedLeaveForTeachers = () => {
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

  const [regId, setRegId] = useState(null);
  const [roleId, setRoleId] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);

        // 1️⃣ Get session data
        const token = localStorage.getItem("authToken");
        if (!token) {
          toast.error("Authentication token not found. Please login again.");
          navigate("/");
          return;
        }

        const sessionRes = await axios.get(`${API_URL}/api/sessionData`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const roleId = sessionRes?.data?.user?.name;
        const regId = sessionRes?.data?.user?.reg_id;

        if (!roleId || !regId) {
          toast.error("Invalid session data received");
          return;
        }

        setRoleId(roleId);
        setRegId(regId);

        // 2️⃣ Once session data is fetched, immediately trigger handleSearch with reg_id
        await handleSearch(regId);
      } catch (error) {
        console.error("Initialization error:", error);
        toast.error("Failed to get session data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const statusMap = {
    P: "Approve",
    A: "Apply",
    R: "Reject",
    H: "Hold",
    S: "Scheduled",
    V: "Verified",
    C: "Cancelled",
  };

  const handleSearch = async (reg_id_param) => {
    setLoadingForSearch(false);

    setSearchTerm("");
    try {
      setLoadingForSearch(true); // Start loading
      setTimetable([]);
      const token = localStorage.getItem("authToken");
      const params = {};
      if (reg_id_param) params.staff_id = reg_id_param;
      const response = await axios.get(
        `${API_URL}/api/get_consolidatedleavereport`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      if (!response?.data?.data || response?.data?.data?.length === 0) {
        toast.error("Consolidated Leave data not found.");
        setTimetable([]);
      } else {
        setTimetable(response?.data?.data);
        setPageCount(Math.ceil(response?.data?.data?.length / pageSize)); // Set page count based on response size
      }
    } catch (error) {
      console.error("Error fetching Consolidated Leave:", error);
      toast.error("Error fetching Consolidated Leave. Please try again.");
    } finally {
      setIsSubmitting(false); // Re-enable the button after the operation
      setLoadingForSearch(false);
    }
  };

  const handlePrint = () => {
    const printTitle = `Consolidate Leave Report  ${
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
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Phone No.</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Leave Type</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Start Date</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">End Date</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">No. of days</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Status</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Approved By</th>
           
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
                  subject?.StaffName || " "
                }</td>
                <td class="px-2 text-center py-2 border border-black">${
                  subject?.phone || " "
                }</td>
                <td class="px-2 text-center py-2 border border-black">${
                  subject?.LeaveType || " "
                }</td>
                <td class="px-2 text-center py-2 border border-black">
                ${
                  subject?.leave_start_date
                    ? new Date(subject?.leave_start_date).toLocaleDateString(
                        "en-GB"
                      )
                    : ""
                }</td>
                 <td class="px-2 text-center py-2 border border-black">
                 ${
                   subject?.leave_start_date
                     ? new Date(subject?.leave_start_date).toLocaleDateString(
                         "en-GB"
                       )
                     : ""
                 }</td>
                  <td class="px-2 text-center py-2 border border-black">${
                    subject?.no_of_days || " "
                  }</td>
                   <td class="px-2 text-center py-2 border border-black">${
                     statusMap[subject?.status] || " "
                   }</td>
                    <td class="px-2 text-center py-2 border border-black">${
                      subject?.ApprovedBy || " "
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

    // ✅ Ensure content is fully loaded before printing
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
      "Staff Name",
      "Phone No.",
      "Leave Type",
      "Start Date",
      "End Date",
      "No. of days",
      "Status",
      "Approved By",
    ];
    // Convert displayedSections data to array format for Excel
    const data = displayedSections.map((student, index) => [
      index + 1,
      student?.StaffName || " ",
      student?.phone || " ",
      student?.LeaveType || " ",
      `${
        student?.leave_start_date
          ? new Date(student?.leave_start_date).toLocaleDateString("en-GB")
          : ""
      }`,
      `${
        student?.leave_end_date
          ? new Date(student?.leave_end_date).toLocaleDateString("en-GB")
          : ""
      }`,
      student?.no_of_days || " ",
      statusMap[student?.status] || " ",
      student?.ApprovedBy || " ",
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
    const fileName = `Consolidate_Leave_Report_${
      selectedStudent?.label || "For All Staff"
    }.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  console.log("row", timetable);

  const filteredSections = timetable.filter((student) => {
    const searchLower = searchTerm.toLowerCase();

    // Extract relevant fields and convert them to lowercase for case-insensitive search
    const staffName = student?.StaffName?.toLowerCase() || "";
    const phone = student?.phone?.toLowerCase() || "";
    const leaveType = student?.LeaveType?.toLowerCase() || "";
    const leaveStartDate = student?.leave_start_date?.toLowerCase() || "";
    const leaveEndDate = student?.leave_end_date?.toLowerCase() || "";
    const noOfDays = student?.no_of_days?.toString().toLowerCase() || "";
    const status = statusMap[student?.status]?.toLowerCase() || "";
    const approvedBy = student?.ApprovedBy?.toLowerCase() || "";

    // Check if the search term is present in any of the specified fields
    return (
      staffName.includes(searchLower) ||
      phone.includes(searchLower) ||
      leaveType.includes(searchLower) ||
      leaveStartDate.includes(searchLower) ||
      leaveEndDate.includes(searchLower) ||
      noOfDays.includes(searchLower) ||
      status.includes(searchLower) ||
      approvedBy.includes(searchLower)
    );
  });

  const displayedSections = filteredSections.slice(currentPage * pageSize);
  return (
    <>
      <div className="w-full md:w-[100%] mx-auto p-4 ">
        <ToastContainer />

        <>
          <div className="w-full ">
            <div className="card mx-auto lg:w-full shadow-lg">
              <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                <div className="w-full   flex flex-row justify-between mr-0 md:mr-4 ">
                  <h3 className="text-gray-800 text-[1.2em] lg:text-xl font-semibold tracking-wide">
                    Consolidated Leave For{" "}
                    <span className="text-pink-600">{roleId}</span>
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
                  <RxCross1
                    className=" mt-0.5 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                    onClick={() => {
                      navigate("/dashboard");
                    }}
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
                <div
                  className="h-96 lg:h-96 overflow-y-scroll overflow-x-scroll flex justify-center  "
                  style={{
                    scrollbarWidth: "thin", // Makes scrollbar thin in Firefox
                    scrollbarColor: "#C03178 transparent", // Sets track and thumb color in Firefox
                  }}
                >
                  {loading || loadingForSearch ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <Loader />
                    </div>
                  ) : (
                    <div className="w-full  ">
                      <table className="min-w-full leading-normal table-auto">
                        <thead>
                          <tr className="bg-gray-100">
                            {[
                              "Sr No.",
                              "Staff Name",
                              "Phone No.",
                              "Leave Type",
                              "Start Date",
                              "End Date",
                              "No. of days",
                              "Status",
                              "Approved By",
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
                                  {student?.StaffName || " "}
                                </td>

                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {student?.phone || " "}
                                </td>
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {student?.LeaveType || " "}
                                </td>
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {student?.leave_start_date
                                    ? new Date(
                                        student?.leave_start_date
                                      ).toLocaleDateString("en-GB")
                                    : ""}
                                </td>

                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {student?.leave_end_date
                                    ? new Date(
                                        student?.leave_end_date
                                      ).toLocaleDateString("en-GB")
                                    : ""}
                                </td>

                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {student?.no_of_days || " "}
                                </td>
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {statusMap[student?.status] || " "}
                                </td>
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {student?.ApprovedBy || " "}
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
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      </div>
    </>
  );
};

export default ConsolidatedLeaveForTeachers;
