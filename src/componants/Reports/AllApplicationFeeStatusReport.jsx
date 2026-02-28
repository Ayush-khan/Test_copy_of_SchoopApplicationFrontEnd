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

const AllApplicationFeeStatusReport = () => {
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

  const [shortName, setShortName] = useState("");
  const academicYear = localStorage.getItem("academicYr");

  useEffect(() => {
    fetchExams();
    handleSearch();
    fetchsessionData();
  }, []);

  const fetchsessionData = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.error("No authentication token found");
      return;
    }

    try {
      const sessionResponse = await axios.get(`${API_URL}/api/sessionData`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const shortname = sessionResponse?.data?.custom_claims?.short_name;
      setShortName(shortname);

      console.log("short name:", shortname);

      return { shortName };
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchExams = async () => {
    try {
      setLoadingExams(true);
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/get_classofnewadmission`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
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
    console.log("selected class", selectedOption);
    setSelectedStudentId(selectedOption?.value);
  };

  // Dropdown options
  const statusOptions = [
    { value: "S", label: "Paid" },
    { value: "NULL", label: "Unpaid" },
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
    [studentNameWithClassId],
  );

  const handleSearch = async () => {
    setLoadingForSearch(false);

    setSearchTerm("");
    try {
      setLoadingForSearch(true);
      setTimetable([]);
      const token = localStorage.getItem("authToken");
      const params = {};

      if (academicYear) params.academic_yr = academicYear;
      if (selectedStudentId) params.class_id = selectedStudentId;
      // if (status) params.status = status;
      if (status !== undefined) {
        params.status = status === "" ? "NULL" : status;
      }

      console.log(params);

      const response = await axios.get(
        `${API_URL}/api/get_all_admission_form_report`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        },
      );

      if (!response?.data?.data || response?.data?.data?.length === 0) {
        toast.error("Application fee status report data not found.");
        setTimetable([]);
      } else {
        setTimetable(response?.data?.data);
        setPageCount(Math.ceil(response?.data?.data?.length / pageSize)); // Set page count based on response size
      }
    } catch (error) {
      console.error("Error fetching Application fee status report:", error);
      toast.error(
        "Error fetching Application fee status report. Please try again.",
      );
    } finally {
      setIsSubmitting(false); // Re-enable the button after the operation
      setLoadingForSearch(false);
    }
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
      "Application Fee Status",
      "Form Status",
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
      "Interview Scheduling",
    ];

    // Convert displayedSections data to array format for Excel
    const data = displayedSections.map((student, index) => [
      index + 1,
      student?.form_id || " ",
      camelCase(
        `${student?.first_name || ""} ${student?.mid_name || ""} ${
          student?.last_name || ""
        }`,
      ),
      student?.class_name || " ",
      `${formatDate(student?.application_date || "")}`,
      student?.status === "S"
        ? "Paid"
        : student?.status === null
          ? "Unpaid"
          : " ",
      student?.admission_form_status || " ",
      `${formatDate(student?.dob || "")}`,
      camelCase(student?.birth_place || " "),
      camelCase(student?.locality || " "),
      `${camelCase(student?.city || "")}, ${student?.state || ""}, ${
        student?.pincode || ""
      }`,
      camelCase(student?.perm_address || " "),
      student?.gender === "M"
        ? "Male"
        : student?.gender === "F"
          ? "Female"
          : student?.gender || " ",
      camelCase(student?.religion || " "),
      student?.caste || " ",
      student?.subcaste || " ",
      camelCase(student?.nationality || " "),
      camelCase(student?.mother_tongue || " "),
      student?.category || " ",
      student?.blood_group || " ",
      student?.stud_aadhar || " ",
      camelCase(student?.sibling_student_info || " "),
      camelCase(student?.father_name || " "),
      camelCase(student?.father_occupation || " "),
      student?.f_mobile || " ",
      student?.f_email || " ",
      student?.f_aadhar_no || " ",
      student?.f_qualification || " ",
      camelCase(student?.mother_name || " "),
      camelCase(student?.mother_occupation || " "),
      student?.m_mobile || " ",
      student?.m_emailid || " ",
      student?.m_aadhar_no || " ",
      student?.m_qualification || " ",
      camelCase(student?.area_in_which_parent_can_contribute || " "),
      student?.OrderId || " ",
      student.interview_date
        ? `${formatDate(student.interview_date)}   ${
            student.interview_time_from || ""
          } - ${student.interview_time_to || ""}`
        : "",
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
      "Application fee status Data",
    );

    // Generate and download the Excel file
    const fileName = `Application_fee_status_Report_${
      selectedStudent?.label || "ALL"
    }.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  console.log("row", timetable);

  // const handlePrint = () => {
  //   const printTitle = `List of Application fee status Report for ${
  //     selectedStudent?.label ? `Class ${selectedStudent.label}` : "All Students"
  //   }`;

  //   const printContent = `
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
  //             "Application Fee Status",
  //             "Form Status",
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
  //             "Interview Scheduling",
  //           ]
  //             .map(
  //               (header) =>
  //                 `<th class="px-1 py-1 text-sm font-semibold border border-black">${header}</th>`,
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
  //               <td>${camelCase(
  //                 [student.first_name, student.mid_name, student.last_name]
  //                   .filter(Boolean)
  //                   .join(" "),
  //               )}</td>
  //               <td>${student.class_name}</td>
  //               <td>${formatDate(student.application_date)}</td>

  //               <td>${student.status === "S" ? "Paid" : student.status === null ? "Unpaid" : " "}</td>
  //               <td>${student.admission_form_status}</td>
  //               <td>${formatDate(student.dob)}</td>
  //               <td>${camelCase(student.birth_place)}</td>
  //               <td>${camelCase(student.locality)}</td>
  //               <td>${camelCase(student.city)}, ${student.state}, ${student.pincode}</td>
  //               <td>${camelCase(student.perm_address)}</td>
  //               <td>${
  //                 student.gender === "M"
  //                   ? "Male"
  //                   : student.gender === "F"
  //                     ? "Female"
  //                     : student.gender
  //               }</td>
  //               <td>${camelCase(student.religion)}</td>
  //               <td>${student.caste}</td>
  //               <td>${student.subcaste}</td>
  //               <td>${camelCase(student.nationality)}</td>
  //               <td>${camelCase(student.mother_tongue)}</td>
  //               <td>${student.category}</td>
  //               <td>${student.blood_group}</td>
  //               <td>${student.stud_aadhar}</td>
  //               <td>${camelCase(student.sibling_student_info)}</td>
  //               <td>${camelCase(student.father_name)}</td>
  //               <td>${camelCase(student.father_occupation)}</td>
  //               <td>${student.f_mobile}</td>
  //               <td>${student.f_email}</td>
  //               <td>${student.f_aadhar_no}</td>
  //               <td>${student.f_qualification}</td>
  //               <td>${camelCase(student.mother_name)}</td>
  //               <td>${camelCase(student.mother_occupation)}</td>
  //               <td>${student.m_mobile}</td>
  //               <td>${student.m_emailid}</td>
  //               <td>${student.m_aadhar_no}</td>
  //               <td>${student.m_qualification}</td>
  //               <td>${camelCase(student.area_in_which_parent_can_contribute)}</td>
  //               <td>${student.OrderId}</td>
  //               <td>${formatDate(student.interview_date)} <br/> ${student.interview_time_from} - ${student.interview_time_to} </td>
  //             </tr>
  //           `,
  //           )
  //           .join("")}
  //       </tbody>
  //     </table>
  //   </div>
  //   `;

  //   const newWindow = window.open("", "_blank");
  //   newWindow.document.write(printContent);
  //   newWindow.document.close();
  //   newWindow.print();
  // };

  const handlePrint = () => {
    const printTitle = `List of Application fee status Report for ${
      selectedStudent?.label ? `Class ${selectedStudent.label}` : "All Students"
    }`;

    const printContent = `
    <html>
      <head>
        <title>${printTitle}</title>
        <style>
          @page { margin: 4px; padding: 4px; box-sizing: border-box; }

          body {
            font-family: Arial, sans-serif;
            font-size: 10px;
            padding: 10px;
          }

          .table-container {
            width: 98%;
            margin: auto;
          }

          table {
            width: 100%;
          }

          th, td {
            border: 1px solid black;
            padding: 4px;
            text-align: center;
            word-wrap: break-word;
          }

          th {
            background: #f3f4f6;
            font-weight: bold;
          }

          h2 {
            text-align: center;
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <div class="table-container">
          <h2>${printTitle}</h2>
          <table>
            <thead>
              <tr>
                ${[
                  "Sr No.",
                  "Form Id.",
                  "Student Name",
                  "Class",
                  "Application Date",
                  "Application Fee Status",
                  "Form Status",
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
                  "Interview Scheduling",
                ]
                  .map((header) => `<th>${header}</th>`)
                  .join("")}
              </tr>
            </thead>
            <tbody>
              ${displayedSections
                .map((student, index) => {
                  const fullName = camelCase(
                    [student.first_name, student.mid_name, student.last_name]
                      .filter(Boolean)
                      .join(" "),
                  );

                  const gender =
                    student.gender === "M"
                      ? "Male"
                      : student.gender === "F"
                        ? "Female"
                        : student.gender || "";

                  const feeStatus =
                    student.status === "S"
                      ? "Paid"
                      : student.status === null
                        ? "Unpaid"
                        : "";

                  const interviewValue = student.interview_date
                    ? `${formatDate(student.interview_date)} ${
                        student.interview_time_from || ""
                      } - ${student.interview_time_to || ""}`
                    : "";

                  return `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${student.form_id || ""}</td>
                      <td>${fullName}</td>
                      <td>${student.class_name || ""}</td>
                      <td>${formatDate(student.application_date)}</td>
                      <td>${feeStatus}</td>
                      <td>${student.admission_form_status || ""}</td>
                      <td>${formatDate(student.dob)}</td>
                      <td>${camelCase(student.birth_place || "")}</td>
                      <td>${camelCase(student.locality || "")}</td>
                      <td>${camelCase(student.city || "")}, ${student.state || ""}, ${student.pincode || ""}</td>
                      <td>${camelCase(student.perm_address || "")}</td>
                      <td>${gender}</td>
                      <td>${camelCase(student.religion || "")}</td>
                      <td>${student.caste || ""}</td>
                      <td>${student.subcaste || ""}</td>
                      <td>${camelCase(student.nationality || "")}</td>
                      <td>${camelCase(student.mother_tongue || "")}</td>
                      <td>${student.category || ""}</td>
                      <td>${student.blood_group || ""}</td>
                      <td>${student.stud_aadhar || ""}</td>
                      <td>${camelCase(student.sibling_student_info || "")}</td>
                      <td>${camelCase(student.father_name || "")}</td>
                      <td>${camelCase(student.father_occupation || "")}</td>
                      <td>${student.f_mobile || ""}</td>
                      <td>${student.f_email || ""}</td>
                      <td>${student.f_aadhar_no || ""}</td>
                      <td>${student.f_qualification || ""}</td>
                      <td>${camelCase(student.mother_name || "")}</td>
                      <td>${camelCase(student.mother_occupation || "")}</td>
                      <td>${student.m_mobile || ""}</td>
                      <td>${student.m_emailid || ""}</td>
                      <td>${student.m_aadhar_no || ""}</td>
                      <td>${student.m_qualification || ""}</td>
                      <td>${camelCase(student.area_in_which_parent_can_contribute || "")}</td>
                      <td>${student.OrderId || ""}</td>
                      <td>${interviewValue}</td>
                    </tr>
                  `;
                })
                .join("")}
            </tbody>
          </table>
        </div>
      </body>
    </html>
  `;

    const printWindow = window.open("", "_blank", "width=1200,height=800");

    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };
  const filteredSections = timetable.filter((section) => {
    const searchLower = searchTerm.toLowerCase();

    // Extract relevant fields and convert them to lowercase for case-insensitive search
    const formId = section?.form_id?.toLowerCase() || "";
    const academicYear = section?.academic_yr?.toLowerCase() || "";
    const studentName = camelCase(
      `${section?.first_name} ${section?.mid_name} ${section?.last_name}`,
    );
    const studentDOB = formatDate(section?.dob?.toLowerCase()) || "";
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
        <div className="card p-2 rounded-md ">
          <div className=" card-header mb-4 flex justify-between items-center ">
            <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
              Admission Form With Application Fee Status Report
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
            <div
              className={`  flex justify-between flex-col md:flex-row gap-x-1 ml-0 p-2  ${
                timetable.length > 0
                  ? "pb-0 w-full md:w-[99%]"
                  : "pb-4 w-full md:w-[90%]"
              }`}
            >
              <div className="w-full md:w-[70%] flex md:flex-row justify-between items-center mt-0 md:mt-4">
                <div
                  className={`  w-full gap-x-0 md:gap-x-12  flex flex-col gap-y-2 md:gap-y-0 md:flex-row ${
                    timetable.length > 0
                      ? "w-full md:w-[75%]  wrelative left-0"
                      : " w-full md:w-[95%] relative left-10"
                  }`}
                >
                  <div className="w-full md:w-[60%] gap-x-2   justify-around  my-1 md:my-4 flex md:flex-row ">
                    <label
                      className="md:w-[30%] text-md pl-0 md:pl-5 mt-1.5"
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

                  <div className="w-full md:w-[50%]  gap-x-4  justify-between  my-1 md:my-4 flex md:flex-row">
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
                            (option) => option.value === status,
                          ) || null
                        }
                        onChange={(selectedOption) =>
                          setStatus(
                            selectedOption ? selectedOption.value : null,
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
              {timetable.length > 0 && (
                <div className="p-2 px-3  bg-gray-100 border-none flex justify-between items-center">
                  <div className="w-full flex flex-row justify-between mr-0 md:mr-4 ">
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

            {timetable.length > 0 && (
              <>
                <div className="w-full  mt-4">
                  <div className="card mx-auto lg:w-full shadow-lg">
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
                                { label: "Sr No.", width: "min-w-[20px]" },
                                {
                                  label: "Form Id.",
                                  width: "min-w-[100px]",
                                },
                                {
                                  label: "Student Name",
                                  width: "min-w-[130px]",
                                  style: "whitespace-nowrap",
                                },
                                { label: "Class", width: "min-w-[80px]" },
                                {
                                  label: "Application Date",
                                  width: "min-w-[100px]",
                                },
                                {
                                  label: "Application Fee Status",
                                  width: "min-w-[100px]",
                                },
                                {
                                  label: "Form Status",
                                  width: "min-w-[100px]",
                                },
                                { label: "DOB", width: "min-w-[100px]" },
                                {
                                  label: "Birth Place",
                                  width: "min-w-[100px]",
                                },
                                {
                                  label: "Present Address",
                                  width: "min-w-[180px]",
                                  style: "whitespace-nowrap",
                                },
                                {
                                  label: "City, State, Pincode",
                                  width: "min-w-[100px]",
                                },
                                {
                                  label: "Permanent Address",
                                  width: "min-w-[180px]",
                                  style: "whitespace-nowrap",
                                },
                                { label: "Gender", width: "min-w-[90px]" },
                                { label: "Religion", width: "min-w-[90px]" },
                                { label: "Caste", width: "min-w-[90px]" },
                                { label: "Subcaste", width: "min-w-[90px]" },
                                {
                                  label: "Nationality",
                                  width: "min-w-[90px]",
                                },
                                {
                                  label: "Mother Tongue",
                                  width: "min-w-[90px]",
                                },
                                { label: "Category", width: "min-w-[90px]" },
                                {
                                  label: "Blood Group",
                                  width: "min-w-[100px]",
                                },
                                {
                                  label: "Aadhaar No.",
                                  width: "min-w-[160px]",
                                },
                                { label: "Sibling", width: "min-w-[100px]" },
                                {
                                  label: "Father Name",
                                  width: "min-w-[160px]",
                                },
                                { label: "Occupation", width: "min-w-[140px]" },
                                { label: "Mobile No.", width: "min-w-[140px]" },
                                { label: "Email Id", width: "min-w-[200px]" },
                                {
                                  label: "Father Aadhaar No.",
                                  width: "min-w-[170px]",
                                },
                                {
                                  label: "Qualification",
                                  width: "min-w-[140px]",
                                },
                                {
                                  label: "Mother Name",
                                  width: "min-w-[160px]",
                                },
                                { label: "Occupation", width: "min-w-[140px]" },
                                { label: "Mobile No.", width: "min-w-[140px]" },
                                { label: "Email Id", width: "min-w-[200px]" },
                                {
                                  label: "Mother Aadhaar No.",
                                  width: "min-w-[170px]",
                                },
                                {
                                  label: "Qualification",
                                  width: "min-w-[140px]",
                                },
                                {
                                  label: "Areas of Interest",
                                  width: "min-w-[180px]",
                                },
                                { label: "Order Id", width: "min-w-[140px]" },
                                {
                                  label: "Interview Schedule",
                                  width: "min-w-[120px]",
                                },
                              ].map((column, index) => (
                                <th
                                  key={index}
                                  className={`text-center px-2 lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider ${column.width}`}
                                >
                                  {column.label}
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
                                  <td className="px-2 py-2 text-center border border-gray-300 whitespace-nowrap">
                                    {student.form_id}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300 ">
                                    {camelCase(`${student.first_name} ${student.mid_name}
                                    ${student.last_name}`)}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300 whitespace-nowrap">
                                    {student.class_name}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300 whitespace-nowrap">
                                    {formatDate(student.application_date)}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.status === "S"
                                      ? "Paid"
                                      : student.status === null
                                        ? "Unpaid"
                                        : " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.admission_form_status}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {formatDate(student.dob)}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {camelCase(student.birth_place)}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {camelCase(student.locality)}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {camelCase(student.city)}, {student.state},{" "}
                                    {student.pincode}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {camelCase(student.perm_address)}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.gender === "M"
                                      ? "Male"
                                      : student.gender === "F"
                                        ? "Female"
                                        : student.gender}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {camelCase(student.religion)}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.caste}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.subcaste}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {camelCase(student.nationality)}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {camelCase(student.mother_tongue)}
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
                                    {camelCase(student.sibling_student_info)}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {camelCase(student.father_name)}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {camelCase(student.father_occupation)}
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
                                    {camelCase(student.mother_name)}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {camelCase(student.mother_occupation)}
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
                                    {camelCase(
                                      student.area_in_which_parent_can_contribute,
                                    )}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.OrderId}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {formatDate(student.interview_date)}
                                    <br />
                                    {student.interview_time_from}{" "}
                                    {student.interview_time_from ? "-" : ""}{" "}
                                    {student.interview_time_to}
                                  </td>
                                  {/* {shortName === "HSCS" && (
                                    <td className="px-2 py-2 text-center border border-gray-300">
                                      {student.Trnx_ref_no}
                                    </td>
                                  )}
                                  {shortName === "SACS" && (
                                    <>
                                      <td className="px-2 py-2 text-center border border-gray-300">
                                        {
                                          student.academic_details
                                            .sub_group_name
                                        }
                                      </td>
                                      <td className="px-2 py-2 text-center border border-gray-300">
                                        {
                                          student.academic_details
                                            .selected_subjects
                                        }
                                      </td>
                                      <td className="px-2 py-2 text-center border border-gray-300">
                                        {student.academic_details["9marks"]}
                                      </td>
                                      <td className="px-2 py-2 text-center border border-gray-300">
                                        {student.academic_details["10preboard"]}
                                      </td>
                                      <td className="px-2 py-2 text-center border border-gray-300">
                                        {student.academic_details["10final"]}
                                      </td>
                                    </>
                                  )} */}
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

export default AllApplicationFeeStatusReport;
