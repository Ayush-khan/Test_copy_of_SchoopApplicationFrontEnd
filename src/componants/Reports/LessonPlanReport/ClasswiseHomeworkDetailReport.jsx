import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
import { FiPrinter } from "react-icons/fi";
import { FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";

const ClasswiseHomeworkDetailReport = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [selectedClass, setSelectedClass] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [classNameWithClassId, setClassNameWithClassId] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [toDate, setToDate] = useState(null);

  const [loadingForSearch, setLoadingForSearch] = useState(false);

  const navigate = useNavigate();
  const [loadingExams, setLoadingExams] = useState(false);
  const [studentError, setStudentError] = useState("");

  const [studentRemarkList, setStudentRemarkList] = useState([]);

  const pageSize = 10;
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchClassesWithSection();
  }, []);

  // Fetch session info
  const fetchClassesWithSection = async () => {
    try {
      setLoadingExams(true);
      const token = localStorage.getItem("authToken");
      //  get_class_section;
      const response = await axios.get(
        `${API_URL}/api/getallClassWithStudentCount`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Class", response);
      setClassNameWithClassId(response?.data || []);
    } catch (error) {
      toast.error("Error fetching Classes");
      console.error("Error fetching Classes:", error);
    } finally {
      setLoadingExams(false);
    }
  };

  const capitalizeWords = (str) =>
    str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

  const handleClassSelect = (selectedOption) => {
    setStudentError(""); // Reset error if student is select.
    setSelectedClass(selectedOption);
    setSelectedClassId(selectedOption?.value);
  };

  const classOptions = useMemo(
    () =>
      classNameWithClassId.map((cls) => ({
        value: cls?.section_id,
        label: `${cls.get_class.name} ${cls.name} (${cls.students_count})`,
      })),
    [classNameWithClassId]
  );

  // Handle search and fetch parent information

  const handleSearch = async () => {
    setSearchTerm("");

    if (!selectedClassId) {
      setStudentError("Pleasee select class.");
      return;
    }
    setLoadingForSearch(true);

    try {
      setStudentRemarkList([]);
      const token = localStorage.getItem("authToken");

      // Dynamically build params
      const params = {};
      if (toDate) params.date = toDate;
      if (selectedClassId) params.section_id = String(selectedClassId);

      // Log params before API call
      // console.log(" API Request Params:", params);

      const response = await axios.get(
        `${API_URL}/api/getclasswisehomeworkreport`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      // console.log("API Response:", response);

      if (!response?.data?.data || response?.data?.data?.length === 0) {
        // console.warn("No data found for given params:", params);
        toast.error("Classwise Homework Details Report data not found.");
        setStudentRemarkList([]);
      } else {
        console.log(
          "Setting Classwise Homework Details List:",
          response.data.data
        );
        setStudentRemarkList(response?.data?.data);
        setPageCount(Math.ceil(response?.data?.data?.length / pageSize));
      }
    } catch (error) {
      // console.error(" Error fetching Classwise Homework Details Report:", error);
      toast.error(
        "Error fetching Classwise Homework Details Report. Please try again."
      );
    } finally {
      setLoadingForSearch(false);
    }
  };

  const handlePrint = () => {
    const printTitle = `Classwise Homework Details Report
     ${
       selectedClass?.label
         ? `List of Class ${selectedClass.label}`
         : ": For All Students "
     } 
    `;

    const printContent = `
    <div id="tableMain" class="flex items-center justify-center min-h-screen bg-white">
         <h5 id="tableHeading5"  class="text-lg font-semibold border-1 border-black">${printTitle}</h5>
    <div id="tableHeading" class="text-center w-3/4">
      <table class="min-w-full leading-normal table-auto border border-black mx-auto mt-2">
        <thead>
          <tr class="bg-gray-100">
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Sr.No</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Subject</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Description</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Date</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Teacher</th>
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
                <td class="px-2 text-center py-2 border border-black">
                  ${subject?.sub_name || ""}
                </td>
                 <td class="px-2 text-center py-2 border border-black">
                  ${subject?.description}
                </td>
                <td class="px-2 text-center py-2 border border-black">
                  ${
                    subject?.publish_date
                      ? new Date(subject.publish_date).toLocaleDateString(
                          "en-GB"
                        )
                      : ""
                  }
                </td>
                <td class="px-2 text-center py-2 border border-black">
                ${capitalizeWords(subject?.tec_name || " ")} ${" "}
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
      "Subject",
      "Description",
      "Date",
      "Teacher Name",
    ];

    // Convert displayedSections data to array format for Excel
    const data = displayedSections.map((student, index) => [
      index + 1,
      `${student?.sub_name || " "}`,
      student?.description || " ",
      student?.publish_date
        ? new Date(student.publish_date).toLocaleDateString("en-GB")
        : "",
      `${capitalizeWords(student?.tec_name || "")}`,
    ]);

    // Create a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const columnWidths = headers.map(() => ({ wch: 20 }));
    worksheet["!cols"] = columnWidths;

    // Create a workbook and append the worksheet
    const workbook = XLSX.utils.book_new();

    // Sanitize and trim sheet name to 31 characters
    const rawSheetName = "Classwise Homework Detail Report";
    const sheetName = rawSheetName
      .replace(/[:\\/?*\[\]]/g, "")
      .substring(0, 31);

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate and download the Excel file
    const fileName = `Classwise_Homework_Details_Report_${
      selectedClass?.label || "For_ALL_Students"
    }.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  console.log("row", studentRemarkList);
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return ""; // invalid date
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const filteredSections = studentRemarkList.filter((student) => {
    const searchLower = searchTerm.toLowerCase();

    const subject = student?.sub_name?.toLowerCase() || "";
    const className = student?.classname?.toLowerCase() || "";
    const teacherName = `${student?.tec_name} `.toLowerCase().trim() || "";
    const description = student?.description?.toLowerCase() || "";
    const date = student?.publish_date ? formatDate(student.publish_date) : "";

    // Check if the search term is present in any of the specified fields
    return (
      subject.includes(searchLower) ||
      className.includes(searchLower) ||
      teacherName.includes(searchLower) ||
      description.includes(searchLower) ||
      date.includes(searchLower)
    );
  });

  const displayedSections = filteredSections.slice(currentPage * pageSize);

  return (
    <>
      {/* <div className="w-full md:w-[80%] mx-auto p-4 "> */}
      <div
        className={`mx-auto p-4 transition-all duration-700 ease-[cubic-bezier(0.4, 0, 0.2, 1)] transform ${
          studentRemarkList.length > 0
            ? "w-full md:w-[90%] scale-100"
            : "w-full md:w-[80%] scale-[0.98]"
        }`}
      >
        <ToastContainer />
        <div className="card rounded-md ">
          <div className=" card-header mb-4 flex justify-between items-center ">
            <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
              Classwise Homework Details Report
            </h5>
            <RxCross1
              className=" relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
              onClick={() => {
                navigate("/dashboard");
              }}
            />
          </div>
          <div
            className=" relative w-[98%]   -top-6 h-1  mx-auto bg-red-700"
            style={{
              backgroundColor: "#C03078",
            }}
          ></div>

          <>
            {/* <div className=" w-full md:w-[95%]  flex justify-center flex-col md:flex-row gap-x-1     ml-0    p-2"> */}
            <div
              className={`  flex justify-between flex-col md:flex-row gap-x-1 ml-0 p-2  ${
                studentRemarkList.length > 0
                  ? "pb-0 w-full md:w-[99%]"
                  : "pb-4 w-full md:w-[80%]"
              }`}
            >
              <div className="w-full md:w-[100%] flex md:flex-row justify-between items-center mt-0 md:mt-4">
                <div
                  className={`  w-full gap-x-0 md:gap-x-12  flex flex-col gap-y-2 md:gap-y-0 md:flex-row ${
                    studentRemarkList.length > 0
                      ? "w-full md:w-[75%]  wrelative left-0"
                      : " w-full md:w-[95%] relative left-10"
                  }`}
                >
                  {/* <div className="w-full md:w-[90%] gap-x-0 md:gap-x-8  flex flex-col gap-y-2 md:gap-y-0 md:flex-row"> */}
                  <div className="w-full md:w-[50%] gap-x-1 justify-around  my-1 md:my-4 flex md:flex-row ">
                    <label
                      className="md:w-[25%] text-md pl-0 md:pl-5 mt-1.5"
                      htmlFor="studentSelect"
                    >
                      Class <span className="text-red-500">*</span>
                    </label>
                    <div className="w-full md:w-[60%]">
                      <Select
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        id="studentSelect"
                        value={selectedClass}
                        onChange={handleClassSelect}
                        options={classOptions}
                        placeholder={loadingExams ? "Loading..." : "Select"}
                        isSearchable
                        isClearable
                        className="text-sm"
                        isDisabled={loadingExams}
                      />
                      {studentError && (
                        <div className="h-8 relative ml-1 text-danger text-xs">
                          {studentError}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="w-full md:w-[40%] gap-x-1 justify-between my-1 md:my-4 flex md:flex-row">
                    <label
                      className="ml-0 md:ml-7 w-full md:w-[20%] text-md mt-1.5"
                      htmlFor="toDate"
                    >
                      Date
                    </label>
                    <div className="w-full md:w-[70%]">
                      <input
                        type="date"
                        id="toDate"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="text-sm w-full border border-gray-300 rounded px-2 py-2"
                      />
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
                          Searching...
                        </span>
                      ) : (
                        "Search"
                      )}
                    </button>
                  </div>
                </div>{" "}
              </div>
              {studentRemarkList.length > 0 && (
                <div className="p-2 px-3 w-[400px] bg-gray-100 border-none flex justify-between items-center">
                  <div className="w-full   flex flex-row justify-between mr-0 md:mr-4 ">
                    <div className="w-1/2 md:w-[95%] mr-1 ">
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
                      className="relative bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded group"
                    >
                      <FaFileExcel />
                      <div className="absolute  bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex items-center justify-center bg-gray-700 text-white text-xs text-nowrap rounded-md py-1 px-2">
                        Export to Excel
                      </div>
                    </button>

                    <button
                      onClick={handlePrint}
                      className="relative bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded group flex items-center"
                    >
                      <FiPrinter />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex items-center justify-center bg-gray-700 text-white text-xs rounded-md py-1 px-2">
                        Print
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {studentRemarkList.length > 0 && (
              <>
                <div className="w-full px-4 mb-4 mt-4">
                  <div className="card mx-auto lg:w-full shadow-lg">
                    {/* <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                      <div className="w-full   flex flex-row justify-between mr-0 md:mr-4 ">
                        <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
                          List of Classwise Homework Details Report
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
                    ></div> */}

                    <div className="card-body w-full">
                      <div
                        className="h-96 lg:h-96 overflow-y-scroll overflow-x-scroll"
                        style={{
                          scrollbarWidth: "thin", // Makes scrollbar thin in Firefox
                          scrollbarColor: "#C03178 transparent", // Sets track and thumb color in Firefox
                        }}
                      >
                        <table className="table-fixed w-full leading-normal border border-black">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="w-[7%] px-2 py-2 border text-center text-sm font-semibold text-gray-900">
                                Sr No.
                              </th>
                              <th className="w-[20%] px-2 py-2 border text-center text-sm font-semibold text-gray-900">
                                Subject
                              </th>
                              <th className="w-[40%] px-2 py-2 border text-center text-sm font-semibold text-gray-900">
                                Description
                              </th>
                              <th className="w-[25%] px-2 py-2 border text-center text-sm font-semibold text-gray-900">
                                Date
                              </th>
                              <th className="w-[20%] px-2 py-2 border text-center text-sm font-semibold text-gray-900">
                                Teacher Name
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {displayedSections.length ? (
                              displayedSections.map((student, index) => (
                                <tr
                                  key={student.adm_form_pk}
                                  className="border border-gray-300"
                                >
                                  <td className="w-[20%] px-2 py-2 text-center border border-gray-300">
                                    {index + 1}
                                  </td>
                                  <td className="w-[30%] px-2 py-2 text-center border border-gray-300">
                                    {student.sub_name || " "}
                                  </td>
                                  <td className="w-[35%] px-2 py-2 text-center border border-gray-300 whitespace-pre-wrap break-words">
                                    {student.description || " "}
                                  </td>
                                  <td className="w-[25%] px-2 py-2 text-center border border-gray-300">
                                    {student.publish_date
                                      ? new Date(
                                          student.publish_date
                                        ).toLocaleDateString("en-GB")
                                      : " "}
                                  </td>
                                  <td className="w-[40%] px-2 py-2 text-center border border-gray-300">
                                    {capitalizeWords(student.tec_name || " ")}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="5">
                                  <div className="text-center text-xl text-red-700 mt-4">
                                    Oops! No data found..
                                  </div>
                                </td>
                              </tr>
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

export default ClasswiseHomeworkDetailReport;
