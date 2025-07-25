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

const ListAdmFrmRep = () => {
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

  useEffect(() => {
    fetchExams();
    handleSearch();
  }, []);

  const fetchExams = async () => {
    try {
      setLoadingExams(true);
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/get_classofnewadmission`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Class", response);
      setStudentNameWithClassId(response?.data?.data || []);
    } catch (error) {
      toast.error("Error fetching Classes");
      console.error("Error fetching Classes:", error);
    } finally {
      setLoadingExams(false);
    }
  };

  const handleStudentSelect = (selectedOption) => {
    setStudentError(""); // Reset error if student is select.
    setSelectedStudent(selectedOption);
    setSelectedStudentId(selectedOption?.value);
  };

  // Dropdown options
  const statusOptions = [
    { value: "Applied", label: "Applied" },
    { value: "Scheduled", label: "Scheduled" },
    { value: "Verified", label: "Verified" },
    { value: "Approved", label: "Approved" },
    { value: "Hold", label: "Hold" },
    { value: "Rejected", label: "Rejected" },
  ];

  const customStyles = {
    control: (base, { isFocused }) => ({
      ...base,
      borderColor: isFocused ? "#6366F1" : "#d1d5db", // Indigo focus ring
    }),
    singleValue: (base, { data }) => ({
      ...base,
      color: data.value === "" ? "#9CA3AF" : "#000", // Gray for "Select", black for others
    }),
  };

  const studentOptions = useMemo(
    () =>
      studentNameWithClassId.map((cls) => ({
        value: cls?.class_id,
        label: `${cls.name}`,
      })),
    [studentNameWithClassId]
  );

  // Handle search and fetch parent information

  const handleSearch = async () => {
    setLoadingForSearch(false);

    setSearchTerm("");
    try {
      setLoadingForSearch(true); // Start loading
      setTimetable([]);
      const token = localStorage.getItem("authToken");
      const params = {};
      if (selectedStudentId) params.class_id = selectedStudentId;
      if (status) params.status = status;

      const response = await axios.get(
        `${API_URL}/api/get_reportofnewadmission`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      if (!response?.data?.data || response?.data?.data?.length === 0) {
        toast.error("Admission forms report data not found.");
        setTimetable([]);
      } else {
        setTimetable(response?.data?.data);
        setPageCount(Math.ceil(response?.data?.data?.length / pageSize)); // Set page count based on response size
      }
    } catch (error) {
      console.error("Error fetching Admission forms report:", error);
      toast.error("Error fetching Admission forms report. Please try again.");
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
      "Form Id.",
      "Student Name",
      "Class",
      "Application Date",
      "Status",
      "DOB",
      "Birth Place",
      "Present Address",
      "City, State, Pincode",
      "Permanent Address",
      "Gender",
      "Religion",
      "Caste",
      "Subcaste",
      "Nationality",
      "Mother Tongue",
      "Category",
      "Blood Group",
      "Aadhaar No.",
      "Sibling",
      "Father Name",
      "Occupation",
      "Mobile No.",
      "Email Id",
      "Father Aadhaar No.",
      "Qualification",
      "Mother Name",
      "Occupation",
      "Mobile No.",
      "Email Id",
      "Mother Aadhaar No.",
      "Qualification",
      "Areas of Interest",
      "Order Id",
    ];

    // Convert displayedSections data to array format for Excel
    const data = displayedSections.map((student, index) => [
      index + 1,
      student?.form_id || " ",
      `${student?.first_name || ""} ${student?.mid_name || ""} ${
        student?.last_name || ""
      }`,
      student?.classname || " ",
      `${
        student?.application_date
          ? new Date(student?.application_date).toLocaleDateString("en-GB")
          : ""
      }`,
      student?.admission_form_status || " ",
      `${
        student?.dob ? new Date(student?.dob).toLocaleDateString("en-GB") : ""
      }`,
      student?.birth_place || " ",
      student?.locality || " ",
      `${student?.city || ""}, ${student?.state || ""}, ${
        student?.pincode || ""
      }`,
      student?.perm_address || " ",
      student?.gender === "M"
        ? "Male"
        : student?.gender === "F"
        ? "Female"
        : student?.gender || " ",
      student?.religion || " ",
      student?.caste || " ",
      student?.subcaste || " ",
      student?.nationality || " ",
      student?.mother_tongue || " ",
      student?.category || " ",
      student?.blood_group || " ",
      student?.stud_aadhar || " ",
      student?.sibling_student_info || " ",
      student?.father_name || " ",
      student?.father_occupation || " ",
      student?.f_mobile || " ",
      student?.f_email || " ",
      student?.f_aadhar_no || " ",
      student?.f_qualification || " ",
      student?.mother_name || " ",
      student?.mother_occupation || " ",
      student?.m_mobile || " ",
      student?.m_emailid || " ",
      student?.m_aadhar_no || " ",
      student?.m_qualification || " ",
      student?.area_in_which_parent_can_contribute || " ",
      student?.OrderId || " ",
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
    const fileName = `Admission_Forms_Report_${
      selectedStudent?.label || "ALL"
    }.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  console.log("row", timetable);

  //   const handlePrint = () => {
  //   const printTitle = `List of Admission Forms Report for ${
  //     selectedStudent?.label ? `Class ${selectedStudent.label}` : "All Students"
  //   }`;

  //     const printContent = `
  //     <title>${printTitle}</title>
  //   <style>
  //     @page { margin: 4px; padding:4px; box-sizing:border-box;   ;
  // }
  //     @media print {
  //       body {
  //         font-size: 10px;
  //       }
  //       .table-container {
  //         width: 98%;

  //         transform: scale(0.99); /* Scale down to 39% */
  //         transform-origin: top center;
  //       }
  //       table {
  //         width: 100%;
  //          border-spacing: 0;

  //       }
  //       th, td {
  //         border: 1px solid black;
  //         padding: 2px;
  //         text-align: center;
  //         word-wrap: break-word;
  //       }
  //     }
  //       # HeadingForTitleIs{
  //       width:100%;
  //       margin:auto;
  //       border: 2px solid black;

  //       }
  //       h2 {
  //   width: 100%;
  //   text-align: center;

  //   margin: 0;  /* Remove any default margins */
  //   padding: 5px 0;  /* Adjust padding if needed */
  // }
  //   h2 + * { /* Targets the element after h5 */
  //   margin-top: 0; /* Ensures no extra space after h5 */
  // }

  //   </style>

  //   <div class="table-container">
  // <h2 id="tableHeading5"  class="text-lg font-semibold border-1 border-black">${printTitle}</h2>
  //   <table class="min-w-full leading-normal table-auto border border-black">
  //       <thead>
  //         <tr class="bg-gray-100">
  //           ${[
  //             "Sr No.",
  //             "Form Id.",
  //             "Student Name",
  //             "Class",
  //             "Application Date",
  //             "Status",
  //             "DOB",
  //             "Birth Place",
  //             "Present Address",
  //             "City, State, Pincode",
  //             "Permanent Address",
  //             "Gender",
  //             "Religion",
  //             "Caste",
  //             "Subcaste",
  //             "Nationality",
  //             "Mother Tongue",
  //             "Category",
  //             "Blood Group",
  //             "Aadhaar No.",
  //             "Sibling",
  //             "Father Name",
  //             "Occupation",
  //             "Mobile No.",
  //             "Email Id",
  //             "Father Aadhaar No.",
  //             "Qualification",
  //             "Mother Name",
  //             "Occupation",
  //             "Mobile No.",
  //             "Email Id",
  //             "Mother Aadhaar No.",
  //             "Qualification",
  //             "Areas of Interest",
  //             "Order Id",
  //           ]
  //             .map(
  //               (header) =>
  //                 `<th class="px-1 py-1 text-sm font-semibold border border-black">${header}</th>`
  //             )
  //             .join("")}
  //         </tr>
  //       </thead>
  //       <tbody>
  //         ${displayedSections
  //           .map(
  //             (student, index) => `
  //             <tr>
  //               <td>${index + 1}</td>
  //               <td>${student.form_id}</td>
  //               <td>${student.first_name} ${student.mid_name} ${
  //               student.last_name
  //             }</td>
  //               <td>${student.classname}</td>
  //               <td>${student.application_date}</td>
  //               <td>${student.admission_form_status}</td>
  //               <td>${student.dob}</td>
  //               <td>${student.birth_place}</td>
  //               <td>${student.locality}</td>
  //               <td>${student.city}, ${student.state}, ${student.pincode}</td>
  //               <td>${student.perm_address}</td>
  //               <td>${
  //                 student.gender === "M"
  //                   ? "Male"
  //                   : student.gender === "F"
  //                   ? "Female"
  //                   : student.gender
  //               }</td>
  //               <td>${student.religion}</td>
  //               <td>${student.caste}</td>
  //               <td>${student.subcaste}</td>
  //               <td>${student.nationality}</td>
  //               <td>${student.mother_tongue}</td>
  //               <td>${student.category}</td>
  //               <td>${student.blood_group}</td>
  //               <td>${student.stud_aadhar}</td>
  //               <td>${student.sibling_student_info}</td>
  //               <td>${student.father_name}</td>
  //               <td>${student.father_occupation}</td>
  //               <td>${student.f_mobile}</td>
  //               <td>${student.f_email}</td>
  //               <td>${student.f_aadhar_no}</td>
  //               <td>${student.f_qualification}</td>
  //               <td>${student.mother_name}</td>
  //               <td>${student.mother_occupation}</td>
  //               <td>${student.m_mobile}</td>
  //               <td>${student.m_emailid}</td>
  //               <td>${student.m_aadhar_no}</td>
  //               <td>${student.m_qualification}</td>
  //               <td>${student.area_in_which_parent_can_contribute}</td>
  //               <td>${student.OrderId}</td>
  //             </tr>
  //           `
  //           )
  //           .join("")}
  //       </tbody>
  //     </table>
  //   </div>
  //   `;

  //     const newWindow = window.open("", "_blank");
  //     newWindow.document.write(printContent);
  //     newWindow.document.close();
  //     newWindow.print();
  //   };

  const filteredSections = timetable.filter((section) => {
    const searchLower = searchTerm.toLowerCase();

    // Extract relevant fields and convert them to lowercase for case-insensitive search
    const formId = section?.form_id?.toLowerCase() || "";
    const academicYear = section?.academic_yr?.toLowerCase() || "";
    const studentName =
      `${section?.first_name} ${section?.mid_name} ${section?.last_name}`
        .toLowerCase()
        .trim() || "";
    const studentDOB = section?.dob?.toLowerCase() || "";
    const studentGender = section?.gender?.toLowerCase() || "";
    const applicationDate = section?.application_date?.toLowerCase() || "";
    const studentReligion = section?.religion?.toLowerCase() || "";
    const studentCaste = section?.caste?.toLowerCase() || "";
    const studentSubcaste = section?.subcaste?.toLowerCase() || "";
    const studentNationality = section?.nationality?.toLowerCase() || "";
    const studentMotherTongue = section?.mother_tongue?.toLowerCase() || "";
    const studentCategory = section?.category?.toLowerCase() || "";
    const studentLocality = section?.locality?.toLowerCase() || "";
    const studentCity = section?.city?.toLowerCase() || "";
    const studentState = section?.state?.toLowerCase() || "";
    const studentPincode = section?.pincode?.toString().toLowerCase() || "";
    const permanentAddress = section?.perm_address?.toLowerCase() || "";
    const fatherName = section?.father_name?.toLowerCase() || "";
    const fatherMobile = section?.f_mobile?.toLowerCase() || "";
    const fatherEmail = section?.f_email?.toLowerCase() || "";
    const motherName = section?.mother_name?.toLowerCase() || "";
    const motherMobile = section?.m_mobile?.toLowerCase() || "";
    const motherEmail = section?.m_emailid?.toLowerCase() || "";
    const studentBloodGroup = section?.blood_group?.toLowerCase() || "";
    const admissionStatus = section?.admission_form_status?.toLowerCase() || "";
    const className = section?.classname?.toLowerCase() || "";
    const orderId = section?.OrderId?.toLowerCase() || "";

    // Check if the search term is present in any of the specified fields
    return (
      formId.includes(searchLower) ||
      academicYear.includes(searchLower) ||
      studentName.includes(searchLower) ||
      studentDOB.includes(searchLower) ||
      studentGender.includes(searchLower) ||
      applicationDate.includes(searchLower) ||
      studentReligion.includes(searchLower) ||
      studentCaste.includes(searchLower) ||
      studentSubcaste.includes(searchLower) ||
      studentNationality.includes(searchLower) ||
      studentMotherTongue.includes(searchLower) ||
      studentCategory.includes(searchLower) ||
      studentLocality.includes(searchLower) ||
      studentCity.includes(searchLower) ||
      studentState.includes(searchLower) ||
      studentPincode.includes(searchLower) ||
      permanentAddress.includes(searchLower) ||
      fatherName.includes(searchLower) ||
      fatherMobile.includes(searchLower) ||
      fatherEmail.includes(searchLower) ||
      motherName.includes(searchLower) ||
      motherMobile.includes(searchLower) ||
      motherEmail.includes(searchLower) ||
      studentBloodGroup.includes(searchLower) ||
      admissionStatus.includes(searchLower) ||
      className.includes(searchLower) ||
      orderId.includes(searchLower)
    );
  });

  const displayedSections = filteredSections.slice(currentPage * pageSize);
  return (
    <>
      <div className="w-full md:w-[100%] mx-auto p-4 ">
        <ToastContainer />
        <div className="card p-4 rounded-md ">
          <div className=" card-header mb-4 flex justify-between items-center ">
            <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
              Admission Forms Report
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
                <div className="w-full md:w-[75%] gap-x-0 md:gap-x-12  flex flex-col gap-y-2 md:gap-y-0 md:flex-row">
                  <div className="w-full md:w-[50%] gap-x-2   justify-around  my-1 md:my-4 flex md:flex-row ">
                    <label
                      className="md:w-[25%] text-md pl-0 md:pl-5 mt-1.5"
                      htmlFor="studentSelect"
                    >
                      Class
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
                  <div className="w-full md:w-[45%]  gap-x-4  justify-between  my-1 md:my-4 flex md:flex-row">
                    <label
                      className=" ml-0 md:ml-4 w-full md:w-[30%]  text-md mt-1.5 "
                      htmlFor="studentSelect"
                    >
                      Status
                    </label>{" "}
                    <div className="w-full">
                      <Select
                        id="status"
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        options={statusOptions}
                        value={
                          statusOptions.find(
                            (option) => option.value === status
                          ) || null
                        }
                        onChange={(selectedOption) =>
                          setStatus(
                            selectedOption ? selectedOption.value : null
                          )
                        }
                        isSearchable
                        isClearable
                        className="text-sm"
                        styles={customStyles}
                        placeholder="Select"
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
                          List Of Admission Forms Report
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

                        {/* <button
                          onClick={handlePrint}
                          className="relative flex flex-row justify-center align-middle items-center gap-x-1 bg-blue-400 hover:bg-blue-500 text-white px-3 rounded group"
                        >
                          <FiPrinter />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex items-center justify-center bg-gray-600  text-white text-[.7em] rounded-md py-1 px-2">
                            Print{" "}
                          </div>
                        </button> */}
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
                                "Form Id.",
                                "Student Name",
                                "Class",
                                "Application Date",
                                "Status",
                                "DOB",
                                "Birth Place",
                                "Present Address",
                                "City, State, Pincode",
                                "Permanent Address",
                                "Gender",
                                "Religion",
                                "Caste",
                                "Subcaste",
                                "Nationality",
                                "Mother Tongue",
                                "Category",
                                "Blood Group",
                                "Aadhaar No.",
                                "Sibling",
                                "Father Name",
                                "Occupation",
                                "Mobile No.",
                                "Email Id",
                                "Father Aadhaar No.",
                                "Qualification",
                                "Mother Name",
                                "Occupation",
                                "Mobile No.",
                                "Email Id",
                                "Mother Aadhaar No.",
                                "Qualification",
                                "Areas of Interest",
                                "Order Id",
                              ].map((header, index) => {
                                let columnWidth = "min-w-[150px] px-2"; // default width

                                if (header === "Sr No.")
                                  columnWidth = "min-w-[50px]";
                                else if (header === "Present Address")
                                  columnWidth = "min-w-[200px]";

                                return (
                                  <th
                                    key={index}
                                    className={`text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider ${columnWidth}`}
                                  >
                                    {header}
                                  </th>
                                );
                              })}
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
                                    {student.form_id}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.first_name} {student.mid_name}{" "}
                                    {student.last_name}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.classname}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.application_date
                                      ? new Date(
                                          student.application_date
                                        ).toLocaleDateString("en-GB")
                                      : ""}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.admission_form_status}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.dob
                                      ? new Date(
                                          student.dob
                                        ).toLocaleDateString("en-GB")
                                      : ""}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.birth_place}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.locality}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.city}, {student.state},{" "}
                                    {student.pincode}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.perm_address}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {/* {student.gender} */}
                                    {student.gender === "M"
                                      ? "Male"
                                      : student.gender === "F"
                                      ? "Female"
                                      : student.gender}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.religion}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.caste}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.subcaste}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.nationality}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.mother_tongue}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.category}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.blood_group}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.stud_aadhar}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.sibling_student_info}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.father_name}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.father_occupation}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.f_mobile}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.f_email}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.f_aadhar_no}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.f_qualification}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.mother_name}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.mother_occupation}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.m_mobile}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.m_emailid}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.m_aadhar_no}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.m_qualification}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {
                                      student.area_in_which_parent_can_contribute
                                    }
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.OrderId}
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

export default ListAdmFrmRep;
