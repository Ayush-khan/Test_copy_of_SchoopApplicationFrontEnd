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

const HomeworkStatusReport = () => {
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
  const [subjectsList, setSubjectsList] = useState([]);

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
      const response = await axios.get(`${API_URL}/api/classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Class", response);
      setClassNameWithClassId(response?.data || []);
    } catch (error) {
      toast.error("Error fetching Classes");
      console.error("Error fetching Classes:", error);
    } finally {
      setLoadingExams(false);
    }
  };

  const handleClassSelect = (selectedOption) => {
    setStudentError(""); // Reset error if student is select.
    setSelectedClass(selectedOption);
    setSelectedClassId(selectedOption?.value);
  };

  const classOptions = useMemo(
    () =>
      classNameWithClassId.map((cls) => ({
        value: cls?.class_id,
        label: `${cls.name}`,
      })),
    [classNameWithClassId]
  );

  const handleSearch = async () => {
    setSearchTerm("");

    if (!selectedClassId) {
      setStudentError("Please select class.");
      return;
    }

    setLoadingForSearch(true);

    try {
      setStudentRemarkList([]);
      setSubjectsList([]);
      const token = localStorage.getItem("authToken");

      const params = {
        class_id: String(selectedClassId),
      };

      if (toDate) {
        params.date = toDate;
      }

      console.log("API Request Params:", params);

      const response = await axios.get(
        `${API_URL}/api/get_homeworkstatusreport`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      console.log("API Response:", response);

      const nestedData = response?.data?.data?.data;
      const subjects = response?.data?.data?.subjects;

      if (Array.isArray(nestedData) && nestedData.length > 0) {
        console.log("Setting Homework Status List:", nestedData);
        setStudentRemarkList(nestedData);
        setSubjectsList(subjects || []);
        setPageCount(Math.ceil(nestedData.length / pageSize));
      } else {
        console.warn("No data found or data is not an array:", nestedData);
        toast.error("Homework Status Report data not found.");
        setStudentRemarkList([]);
        setSubjectsList([]);
      }
    } catch (error) {
      console.error("Error fetching Homework Status Report:", error);
      toast.error("Error fetching Homework Status Report. Please try again.");
    } finally {
      setLoadingForSearch(false);
    }
  };

  const handlePrint = () => {
    const printTitle = `Classwise Homework Details Report
     ${
       selectedClass?.label
         ? `List of Class ${selectedClass.label}`
         : ": For All Teacher "
     } 
    `;

    const printContent = `
  <div id="tableMain" class="flex items-center justify-center min-h-screen bg-white">
    <h5 id="tableHeading5" class="text-lg font-semibold border-1 border-black">${printTitle}</h5>
    <div id="tableHeading" class="text-center w-max overflow-x-auto">
      <table class="min-w-full leading-normal table-auto border border-black mx-auto mt-2">
        <thead>
          <tr class="bg-gray-100">
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Sr.No</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Class</th>
            ${subjectsList
              .map(
                (subject) => `
                  <th class="px-2 text-center py-2 border border-black text-sm font-semibold">
                    ${subject.name}
                  </th>`
              )
              .join("")}
          </tr>
        </thead>
        <tbody>
          ${displayedSections
            .map((section, index) => {
              return `
              <tr class="text-sm bg-white">
                <td class="px-2 text-center py-2 border border-black">${
                  index + 1
                }</td>
                <td class="px-2 text-center py-2 border border-black">${
                  section?.class_name || ""
                }</td>
                ${subjectsList
                  .map((subject) => {
                    const subjectData = section.subjects?.find(
                      (s) => s.subject_name === subject.name
                    );

                    if (subjectData) {
                      return `
                        <td class="px-2 py-2 text-center border border-black bg-white">
                          <div>
                            <span>${subjectData.status}</span>
                            <div class="text-xs mt-1">
                              <span style="color: ${subjectData.status_color};">
                                ${subjectData.teacher_name}
                              </span>
                            </div>
                          </div>
                        </td>`;
                    } else {
                      return `
                        <td class="px-2 py-2 text-center border border-black bg-white">-</td>`;
                    }
                  })
                  .join("")}
              </tr>`;
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

    const headers = ["Class", ...subjectsList.map((subject) => subject.name)];

    const data = [];

    displayedSections.forEach((section) => {
      const noHWRow = [
        section.class_name,
        ...subjectsList.map((subject) => {
          const sub = section.subjects?.find(
            (s) => s.subject_name === subject.name
          );
          return sub ? "No HW" : "";
        }),
      ];

      // Row 2: Teacher names (in parentheses) or blank
      const teacherRow = [
        "",
        ...subjectsList.map((subject) => {
          const sub = section.subjects?.find(
            (s) => s.subject_name === subject.name
          );
          return sub ? `(${sub.teacher_name})` : "";
        }),
      ];

      // Push both rows to data
      data.push(noHWRow, teacherRow);
    });

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // Optional: Set column widths
    const columnWidths = headers.map(() => ({ wch: 25 }));
    worksheet["!cols"] = columnWidths;

    // Create workbook and append
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Homework Status");

    const fileName = `Homework_Status_Report_${
      selectedClass?.label || "All"
    }.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  console.log("row", studentRemarkList);

  const filteredSections = Array.isArray(studentRemarkList)
    ? studentRemarkList.filter((item) => {
        const searchLower = searchTerm.toLowerCase();

        const className = item?.class_name?.toLowerCase() || "";

        const subjectNames = (item?.subjects || [])
          .map((sub) => sub?.subject_name?.toLowerCase() || "")
          .join(" ");

        const teacherNames = (item?.subjects || [])
          .map(
            (sub) => sub?.teacher_name?.replace(/[()]/g, "").toLowerCase() || ""
          )
          .join(" ");

        return (
          className.includes(searchLower) ||
          subjectNames.includes(searchLower) ||
          teacherNames.includes(searchLower)
        );
      })
    : [];

  const displayedSections = filteredSections.slice(currentPage * pageSize);

  return (
    <>
      <div className="w-full md:w-[100%] mx-auto p-4 ">
        <ToastContainer />
        <div className="card p-4 rounded-md ">
          <div className=" card-header mb-4 flex justify-between items-center ">
            <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
              Homework Status Report
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
            <div className=" w-full md:w-[95%]  flex justify-center flex-col md:flex-row gap-x-1 ml-0    p-2">
              <div className="w-full md:w-[80%] flex md:flex-row justify-between items-center mt-0 md:mt-4">
                <div className="w-full md:w-[90%] gap-x-0 md:gap-x-8  flex flex-col gap-y-2 md:gap-y-0 md:flex-row">
                  <div className="w-full md:w-[40%] gap-x-1 justify-around  my-1 md:my-4 flex md:flex-row ">
                    <label
                      className="md:w-[20%] text-md pl-0 md:pl-5 mt-1.5"
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
            </div>

            {studentRemarkList.length > 0 && (
              <>
                <div className="w-full  mt-4">
                  <div className="card mx-auto lg:w-full shadow-lg">
                    <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                      <div className="w-full   flex flex-row justify-between mr-0 md:mr-4 ">
                        <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
                          List of Homework Status Report
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

                    {/* <div className="card-body w-[full] ">
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
                              {["Sr No.", "Class"].map((header, index) => (
                                <th
                                  key={index}
                                  className="text-center py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider"
                                  style={{
                                    width: index === 0 ? "40px" : "70px",
                                  }}
                                >
                                  {header}
                                </th>
                              ))}

                              {subjectsList?.map((subject) => (
                                <th
                                  key={subject.sm_id}
                                  className="text-center py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider"
                                  style={{ width: "120px" }}
                                >
                                  {subject.name}
                                </th>
                              ))}
                            </tr>
                          </thead>

                          <tbody>
                            {displayedSections.length ? (
                              displayedSections.map((student, index) => (
                                <tr
                                  key={index}
                                  className="border border-gray-300"
                                >
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {index + 1}
                                  </td>

                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.class_name || " "}
                                  </td>

                                  {subjectsList.map((subject) => {
                                    const subjectData = student.subjects?.find(
                                      (s) => s.subject_name === subject.name
                                    );

                                    return (
                                      <td
                                        key={subject.sm_id}
                                        className="px-2 py-2 text-center border border-gray-300"
                                      >
                                        {subjectData ? (
                                          <div>
                                            <span>{subjectData.status}</span>
                                            <div className="text-xs text-gray-600 mt-1">
                                              <span
                                                className={`font-medium`}
                                                style={{
                                                  color:
                                                    subjectData.status_color,
                                                }}
                                              >
                                                {subjectData.teacher_name}
                                              </span>
                                            </div>
                                          </div>
                                        ) : (
                                          "-"
                                        )}
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={subjectsList.length + 2}>
                                  <div className="text-center text-xl text-red-700 py-4">
                                    Oops! No data found..
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div> */}

                    <div className="card-body w-full">
                      <div
                        className="h-96 lg:h-96 overflow-y-scroll overflow-x-auto"
                        style={{
                          scrollbarWidth: "thin",
                          scrollbarColor: "#C03178 transparent",
                        }}
                      >
                        <table className="min-w-full leading-normal table-auto relative">
                          <thead>
                            <tr className="bg-gray-100">
                              {/* Sticky Sr No. */}
                              <th
                                className="text-center py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider bg-gray-100 sticky left-0 z-20"
                                style={{
                                  width: "60px",
                                  minWidth: "60px",
                                  borderRight: "2px solid #4B5563", // gray-600 line
                                }}
                              >
                                Sr No.
                              </th>

                              {/* Sticky Class */}
                              <th
                                className="text-center py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider bg-gray-100 sticky left-[60px] z-10"
                                style={{
                                  width: "100px",
                                  minWidth: "100px",
                                }}
                              >
                                Class
                              </th>

                              {/* Scrollable Subject Headers */}
                              {subjectsList?.map((subject) => (
                                <th
                                  key={subject.sm_id}
                                  className="text-center py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider"
                                  style={{ minWidth: "200px" }}
                                >
                                  {subject.name}
                                </th>
                              ))}
                            </tr>
                          </thead>

                          <tbody>
                            {displayedSections.length ? (
                              displayedSections.map((student, index) => (
                                <tr
                                  key={index}
                                  className="border border-gray-300"
                                >
                                  {/* Sticky Sr No. */}
                                  <td
                                    className="px-2 py-2 text-center border border-gray-300 bg-white sticky left-0 z-10"
                                    style={{
                                      width: "60px",
                                      minWidth: "60px",
                                      borderRight: "2px solid #4B5563", // strong dividing line
                                    }}
                                  >
                                    {index + 1}
                                  </td>

                                  {/* Sticky Class */}
                                  <td
                                    className="px-2 py-2 text-center border border-gray-300 bg-white sticky left-[60px] z-0"
                                    style={{
                                      width: "100px",
                                      minWidth: "100px",
                                      borderRight: "2px solid #000", // Add this line
                                    }}
                                  >
                                    {student.class_name || " "}
                                  </td>

                                  {/* Scrollable Subject Columns */}
                                  {subjectsList.map((subject) => {
                                    const subjectData = student.subjects?.find(
                                      (s) => s.subject_name === subject.name
                                    );

                                    return (
                                      <td
                                        key={subject.sm_id}
                                        className="px-2 py-2 text-center border border-gray-300 bg-white"
                                        style={{ minWidth: "120px" }}
                                      >
                                        {subjectData ? (
                                          <div>
                                            <span>{subjectData.status}</span>
                                            <div className="text-xs text-gray-600 mt-1">
                                              <span
                                                className="font-medium"
                                                style={{
                                                  color:
                                                    subjectData.status_color,
                                                }}
                                              >
                                                {subjectData.teacher_name}
                                              </span>
                                            </div>
                                          </div>
                                        ) : (
                                          "-"
                                        )}
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={subjectsList.length + 2}>
                                  <div className="text-center text-xl text-red-700 py-4">
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

export default HomeworkStatusReport;
