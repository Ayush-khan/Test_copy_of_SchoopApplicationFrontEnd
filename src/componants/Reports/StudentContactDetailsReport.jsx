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

const StudentContactDetailsReport = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [selectedStudent, setSelectedStudent] = useState(null);
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

  const [roleId, setRoleId] = useState("");
  const [regId, setRegId] = useState("");
  const [classes, setClasses] = useState([]);

  const camelCase = (str) =>
    str
      ?.toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  useEffect(() => {
    fetchDataRoleId();
  }, []);

  const fetchDataRoleId = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.error("No authentication token found");
      return;
    }

    try {
      const sessionResponse = await axios.get(`${API_URL}/api/sessionData`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const role_id = sessionResponse.data.user.role_id;
      const reg_id = sessionResponse.data.user.reg_id;

      setRoleId(role_id);
      setRegId(reg_id);

      console.log("roleIDis:", role_id); // use local variable
      console.log("reg id:", reg_id);

      return { roleId, regId };
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    if (!roleId || !regId) return; // guard against empty
    fetchExams(roleId, regId);
  }, [roleId, regId]);

  const fetchExams = async (roleId, roleIdValue) => {
    try {
      setLoadingExams(true);

      const token = localStorage.getItem("authToken");

      const classApiUrl =
        roleId === "T"
          ? `${API_URL}/api/get_teacherclasseswithclassteacher?teacher_id=${roleIdValue}`
          : `${API_URL}/api/getallClassWithStudentCount`;

      const [classResponse, studentResponse] = await Promise.all([
        axios.get(classApiUrl, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/getStudentListBySectionData`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const classData =
        roleId === "T"
          ? classResponse.data.data || []
          : classResponse.data || [];

      setClasses(classData);
      setStudentNameWithClassId(studentResponse?.data?.data || []);
    } catch (error) {
      toast.error("Error fetching data.");
    } finally {
      setLoadingExams(false);
    }
  };

  const handleStudentSelect = (selectedOption) => {
    setStudentError(""); // Reset error if student is select.
    setSelectedStudent(selectedOption);
    setSelectedStudentId(selectedOption?.value);
  };

  // const studentOptions = useMemo(
  //   () =>
  //     studentNameWithClassId.map((cls) => ({
  //       value: cls?.section_id,
  //       label: `${cls.get_class.name} ${cls.name}`,
  //     })),
  //   [studentNameWithClassId]
  // );

  // Handle search and fetch parent information

  const studentOptions = useMemo(() => {
    return classes.map((cls) => {
      if (roleId === "T") {
        return {
          value: cls.section_id,
          label: `${cls.classname} ${cls.sectionname}`,
          class_id: cls.class_id,
          section_id: cls.section_id,
        };
      } else {
        return {
          value: cls.section_id,
          label: `${cls?.get_class?.name} ${cls.name} (${cls.students_count})`,
          class_id: cls.class_id,
          section_id: cls.section_id,
        };
      }
    });
  }, [classes, roleId]);
  const handleSearch = async () => {
    setLoadingForSearch(false);
    if (!selectedStudentId) {
      setStudentError("Please select Class.");
      setLoadingForSearch(false);
      return;
    }
    setSearchTerm("");
    try {
      setLoadingForSearch(true); // Start loading
      setTimetable([]);
      const token = localStorage.getItem("authToken");
      const params = {};
      if (selectedStudentId) params.section_id = selectedStudentId;

      const response = await axios.get(
        `${API_URL}/api/get_studentcontactdetailsreport`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      if (!response?.data?.data || response?.data?.data?.length === 0) {
        toast.error("Student Contact Details Report data not found.");
        setTimetable([]);
      } else {
        setTimetable(response?.data?.data);
        setPageCount(Math.ceil(response?.data?.data?.length / pageSize)); // Set page count based on response size
      }
    } catch (error) {
      console.error("Error fetching Student Contact Details Report:", error);
      toast.error(
        "Error fetching Student Contact Details Report. Please try again."
      );
    } finally {
      setIsSubmitting(false); // Re-enable the button after the operation
      setLoadingForSearch(false);
    }
  };

  const handlePrint = () => {
    const printTitle = `Student Contact Details Report ${
      selectedStudent?.label
        ? `List of Class ${selectedStudent.label}`
        : ": For All Students "
    }`;
    const printContent = `
  <div id="tableMain" class="flex items-center justify-center min-h-screen bg-white">
         <h5 id="tableHeading5"  class="text-lg font-semibold border-1 border-black">${printTitle}</h5>
 <div id="tableHeading" class="text-center w-3/4">
      <table class="min-w-full leading-normal table-auto border border-black mx-auto mt-2">
        <thead>
          <tr class="bg-gray-100">
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Sr.No</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Roll No.</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">GRN No.</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Class</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Student Full Name</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Father Name</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Father Mobile No.</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Father Email-Id</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Mother Name</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Mother Mobile No.</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Mother Email_-Id</th>
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
                  subject?.roll_no || " "
                }</td>
                <td class="px-2 text-center py-2 border border-black">${
                  subject?.reg_no || " "
                }</td>
                <td class="px-2 text-center py-2 border border-black">${
                  subject?.classname || " "
                } ${subject?.sectionname || " "}</td>
                <td class="px-2 text-center py-2 border border-black">${camelCase(
                  subject?.first_name || " "
                )}${camelCase(subject?.mid_name || " ")} ${camelCase(
                subject?.last_name || " "
              )} </td>
                 <td class="px-2 text-center py-2 border border-black">${camelCase(
                   subject?.father_name || " "
                 )}</td>
                  <td class="px-2 text-center py-2 border border-black">${
                    subject?.f_mobile || " "
                  }</td>
                   <td class="px-2 text-center py-2 border border-black">${
                     subject?.f_email || " "
                   }</td>
                    <td class="px-2 text-center py-2 border border-black">${camelCase(
                      subject?.mother_name || " "
                    )}</td>
                     <td class="px-2 text-center py-2 border border-black">${
                       subject?.m_mobile || " "
                     }</td>
                      <td class="px-2 text-center py-2 border border-black">${
                        subject?.m_emailid || " "
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
      "Roll No.",
      "GRN No.",
      "Class",
      "Student Full Name",
      "Father Name",
      "Father Mobile No.",
      "Father Email-Id",
      "Mother Name",
      "Mother Mobile No.",
      "Mother Email-Id",
    ];

    // Convert displayedSections data to array format for Excel
    const data = displayedSections.map((student, index) => [
      index + 1,
      student?.roll_no || " ",

      student?.reg_no || " ",
      `${student?.classname || " "} ${student?.sectionname || ""}}`,
      camelCase(
        `${student?.first_name || ""} ${student?.mid_name || ""} ${
          student?.last_name || ""
        }`
      ),
      camelCase(student?.father_name || " "),
      student?.f_mobile || " ",
      student?.f_email || " ",
      camelCase(student?.mother_name || " "),

      student?.m_mobile || " ",

      student?.m_emailid || " ",
    ]);
    // Create a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const columnWidths = headers.map(() => ({ wch: 20 })); // Approx. width of 20 characters per column
    worksheet["!cols"] = columnWidths;

    // Create a workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Admission Form Data");

    // Generate and download the Excel file
    const fileName = `Student_Contact_Details_Report_${
      selectedStudent?.label || "For ALL Students"
    }.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  console.log("row", timetable);

  const filteredSections = timetable.filter((student) => {
    const searchLower = searchTerm.toLowerCase();

    // Extract relevant fields and convert them to lowercase for case-insensitive search
    // const rollNo = student?.roll_no || "";
    const regNo = student?.reg_no?.toLowerCase() || "";
    const className = student?.classname?.toLowerCase() || "";
    const studentName =
      `${student?.first_name} ${student?.mid_name} ${student?.last_name}`
        .toLowerCase()
        .trim() || "";
    const fatherName = student?.father_name?.toLowerCase() || "";
    const fatherMobile = student?.f_mobile?.toLowerCase() || "";
    const fatherEmail = student?.f_email?.toLowerCase() || "";
    const motherName = student?.mother_name?.toLowerCase() || "";
    const motherMobile = student?.m_mobile?.toLowerCase() || "";
    const motherEmail = student?.m_emailid?.toLowerCase() || "";

    // Check if the search term is present in any of the specified fields
    return (
      // rollNo.includes(searchLower) ||
      regNo.includes(searchLower) ||
      className.includes(searchLower) ||
      studentName.includes(searchLower) ||
      fatherName.includes(searchLower) ||
      fatherMobile.includes(searchLower) ||
      fatherEmail.includes(searchLower) ||
      motherName.includes(searchLower) ||
      motherMobile.includes(searchLower) ||
      motherEmail.includes(searchLower)
    );
  });

  const displayedSections = filteredSections.slice(currentPage * pageSize);
  return (
    <>
      {/* <div className="w-full md:w-[100%] mx-auto p-4 "> */}
      <div
        className={`mx-auto p-4 transition-all duration-700 ease-[cubic-bezier(0.4, 0, 0.2, 1)] transform ${
          timetable.length > 0
            ? "w-full md:w-[100%] scale-100"
            : "w-full md:w-[90%] scale-[0.98]"
        }`}
      >
        <ToastContainer />
        <div className="card rounded-md ">
          <div className=" card-header mb-4 flex justify-between items-center ">
            <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
              Student Contact Details Report
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
            {/* <div className=" w-full md:w-[70%]  flex justify-center flex-col md:flex-row gap-x-1     ml-0    p-2">
              <div className="w-full md:w-[99%] flex md:flex-row justify-between items-center mt-0 md:mt-4">
                <div className="w-full md:w-[75%] gap-x-0 md:gap-x-12  flex flex-col gap-y-2 md:gap-y-0 md:flex-row"> */}
            <div
              className={`  flex justify-between flex-col md:flex-row gap-x-1 ml-0 p-2  ${
                timetable.length > 0
                  ? "pb-0 w-full md:w-[99%]"
                  : "pb-4 w-full md:w-[80%]"
              }`}
            >
              <div className="w-full md:w-[100%] flex md:flex-row justify-between items-center mt-0 md:mt-4">
                <div
                  className={`  w-full gap-x-0 md:gap-x-12  flex flex-col gap-y-2 md:gap-y-0 md:flex-row ${
                    timetable.length > 0
                      ? "w-full md:w-[80%]  wrelative left-0"
                      : " w-full md:w-[95%] relative left-10"
                  }`}
                >
                  <div className="w-full md:w-[50%] gap-x-2   justify-around  my-1 md:my-4 flex md:flex-row ">
                    <label
                      className="md:w-[25%] text-md pl-0 md:pl-5 mt-1.5"
                      htmlFor="studentSelect"
                    >
                      Class <span className="text-red-500">*</span>
                    </label>
                    <div className=" w-full md:w-[65%]">
                      <Select
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        id="studentSelect"
                        value={selectedStudent}
                        onChange={handleStudentSelect}
                        options={studentOptions}
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
                </div>
              </div>
              {timetable.length > 0 && (
                <div className="p-2 px-3  bg-gray-100 border-none flex justify-between items-center">
                  <div className="w-full   flex flex-row justify-between mr-0 md:mr-4 ">
                    <div className="w-1/2 md:w-[100%] mr-1 ">
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

            {timetable.length > 0 && (
              <>
                <div className="w-full px-4 mb-4 mt-4">
                  <div className="card mx-auto lg:w-full shadow-lg">
                    {/* <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                      <div className="w-full   flex flex-row justify-between mr-0 md:mr-4 ">
                        <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
                          List Of Student Contact Details Report
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
                        <table className="min-w-full leading-normal table-auto">
                          <thead>
                            <tr className="bg-gray-100">
                              {[
                                "Sr No.",
                                "Roll No.",
                                "GRN No.",
                                "Class",
                                "Student Full Name",
                                "Father Name",
                                "Father Mobile No.",
                                "Father Email-Id",
                                "Mother Name",
                                "Mother Mobile No.",
                                "Mother Email-Id",
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
                                    {student.roll_no || " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.reg_no || " "}
                                  </td>
                                  <td className="px-2 py-2 text-nowrap text-center border border-gray-300">
                                    {student.classname || " "}{" "}
                                    {student.sectionname || " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {camelCase(
                                      `${student?.first_name || ""} ${
                                        student?.mid_name || ""
                                      } ${student?.last_name || ""}`
                                    )}
                                  </td>

                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {camelCase(student.father_name || " ")}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.f_mobile || " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.f_email || " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {camelCase(student.mother_name || " ")}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.m_mobile || " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.m_emailid || " "}
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

export default StudentContactDetailsReport;
