import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
import { FiPrinter } from "react-icons/fi";
import { FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";
import Loader from "../../componants/common/LoaderFinal/LoaderStyle";

const BalanceleaveforTeachers = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [status, setStatus] = useState(null); // For status dropdown

  const [currentPage, setCurrentPage] = useState(0);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [loadingForSearch, setLoadingForSearch] = useState(false);

  const navigate = useNavigate();
  const [studentError, setStudentError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timetable, setTimetable] = useState([]);
  const pageSize = 10;
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [regId, setRegId] = useState(null);
  const [roleId, setRoleId] = useState(null);
  const [loading, setLoading] = useState(false);

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

  // 🔍 Updated handleSearch to accept reg_id
  const handleSearch = async (reg_id_param) => {
    try {
      setLoadingForSearch(true);
      setStudentError("");
      setSearchTerm("");
      setTimetable([]);

      const token = localStorage.getItem("authToken");
      const params = {};

      // 🧩 Include both staff_id and reg_id
      if (reg_id_param) params.staff_id = reg_id_param;

      const response = await axios.get(
        `${API_URL}/api/get_balanceleavereport`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      const data = response?.data?.data;
      if (!data || data.length === 0) {
        toast.error("Balance Leave data not found.");
        setTimetable([]);
      } else {
        setTimetable(data);
        setPageCount(Math.ceil(data.length / pageSize));
      }
    } catch (error) {
      console.error("Error fetching Balance Leave:", error);
      toast.error("Error fetching Balance Leave. Please try again.");
    } finally {
      setIsSubmitting(false);
      setLoadingForSearch(false);
    }
  };

  const handleDownloadEXL = () => {
    if (!displayedSections || displayedSections.length === 0) {
      toast.error("No data available to download the Excel sheet.");
      return;
    }

    // Define headers matching the print table
    const headers = ["Sr No.", "Staff Name", "Leave Type", "Balance Leave"];

    // Convert displayedSections data to array format for Excel
    const data = displayedSections.map((student, index) => [
      index + 1,
      student?.staffname || " ",
      student?.name || " ",
      student?.balance_leave || " ",
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
    const fileName = `Balance Leave Report ${
      selectedStudent?.label
        ? `List of ${selectedStudent.label}`
        : ": Complete List of All Staff"
    }.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const handlePrint = () => {
    const printTitle = `Balance Leave Report  ${
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
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Leave Type</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Balance Leave</th>
           
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
                  subject?.staffname || " "
                }</td>
                <td class="px-2 text-center py-2 border border-black">${
                  subject?.name || " "
                }</td>
                <td class="px-2 text-center py-2 border border-black">${
                  subject?.balance_leave || " "
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

  const filteredSections = timetable.filter((section) => {
    const searchLower = searchTerm.toLowerCase();

    // Extract relevant fields and convert them to lowercase for case-insensitive search
    const formId = section?.staffname?.toLowerCase() || "";
    const studentDOB = section?.name?.toLowerCase() || "";

    // const orderId = section?.balance_leave || "";

    // Check if the search term is present in any of the specified fields
    return (
      formId.includes(searchLower) || studentDOB.includes(searchLower)
      //   || orderId.includes(searchLower)
    );
  });

  const displayedSections = filteredSections.slice(currentPage * pageSize);
  return (
    <>
      <div className="w-full md:w-[70%] mx-auto p-4 ">
        <ToastContainer />
        <>
          <div className="w-full  ">
            <div className="card mx-auto lg:w-full shadow-lg">
              <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                <div className="w-full   flex flex-row justify-between mr-0 md:mr-4 ">
                  <h3 className="text-gray-800 text-[1.2em] lg:text-xl font-semibold tracking-wide">
                    Balance Leave For{" "}
                    <span className="text-pink-600">{roleId}</span>
                  </h3>
                  <div className="w-1/2 md:w-[23%] mr-1 ">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search "
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex  flex-col md:flex-row gap-x-1 justify-center md:justify-end">
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

              <div className="card-body w-full ">
                <div
                  className="h-96 lg:h-96 overflow-y-scroll overflow-x-scroll flex justify-center  "
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "#C03178 transparent",
                  }}
                >
                  {loading || loadingForSearch ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <Loader />
                    </div>
                  ) : (
                    // ✅ Table only when data is ready
                    <div className="w-full  ">
                      <table className="min-w-[70%] leading-normal table-auto border border-gray-300 mx-auto ">
                        <thead>
                          <tr className="bg-gray-100">
                            {["Sr No.", "Leave Type", "Balance Leave"].map(
                              (header, index) => {
                                let columnWidth = "min-w-[120px] px-2"; // default width
                                if (header === "Sr No.")
                                  columnWidth = "min-w-[50px]";
                                else if (header === "Balance Leave")
                                  columnWidth = "min-w-[50px]";

                                return (
                                  <th
                                    key={index}
                                    className={`text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider ${columnWidth}`}
                                  >
                                    {header}
                                  </th>
                                );
                              }
                            )}
                          </tr>
                        </thead>

                        <tbody>
                          {displayedSections.length ? (
                            displayedSections?.map((student, index) => (
                              <tr
                                key={student.adm_form_pk || index}
                                className="border border-gray-300"
                              >
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {index + 1}
                                </td>
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {student?.name || " "}
                                </td>
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {student?.balance_leave || " "}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4}>
                                <div className="w-full text-center text-xl text-red-700 py-6">
                                  Oops! No data found..
                                </div>
                              </td>
                            </tr>
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

export default BalanceleaveforTeachers;
