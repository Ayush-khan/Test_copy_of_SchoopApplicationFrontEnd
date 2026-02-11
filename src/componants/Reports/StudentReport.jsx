import { useState, useEffect, useMemo, useRef } from "react";
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
import zIndex from "@mui/material/styles/zIndex";

const StudentReport = () => {
  const pdfRef = useRef();
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

      console.log("roleIDis:", role_id);
      console.log("reg id:", reg_id);

      return { roleId, regId };
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  // useEffect(() => {
  //   if (!roleId || !regId) return; // guard against empty
  //   fetchClasses(roleId, regId);
  // }, [roleId, regId]);

  useEffect(() => {
    if (!roleId) return;

    fetchClasses(roleId, regId);
  }, [roleId, regId]);

  const fetchClasses = async (roleId, roleIdValue) => {
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

  const capitalizeFirst = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";
  const toLowerCaseAll = (str) => (str ? str.toLowerCase() : "");

  // const fetchClasses = async () => {
  //   try {
  //     setLoadingExams(true);
  //     const token = localStorage.getItem("authToken");

  //     const response = await axios.get(`${API_URL}/api/get_class_section`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     console.log("Class", response);
  //     setStudentNameWithClassId(response?.data || []);
  //   } catch (error) {
  //     toast.error("Error fetching Classes");
  //     console.error("Error fetching Classes:", error);
  //   } finally {
  //     setLoadingExams(false);
  //   }
  // };

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

      const response = await axios.get(`${API_URL}/api/get_studentreport`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      if (!response?.data?.data || response?.data?.data?.length === 0) {
        toast.error("Student Report data not found.");
        setTimetable([]);
      } else {
        setTimetable(response?.data?.data);
        setPageCount(Math.ceil(response?.data?.data?.length / pageSize)); // Set page count based on response size
      }
    } catch (error) {
      console.error("Error fetching Student Report:", error);
      toast.error("Error fetching Student Report. Please try again.");
    } finally {
      setIsSubmitting(false); // Re-enable the button after the operation
      setLoadingForSearch(false);
    }
  };

  const generateStudentDetailsTableHTML = (students = []) => {
    const capitalize = (str) =>
      str?.charAt(0).toUpperCase() + str?.slice(1).toLowerCase();

    const formatDate = (dateStr) =>
      dateStr
        ? new Date(dateStr).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          })
        : "";

    const headers = [
      "Sr No.",
      "Roll No.",
      "GRN No.",
      // "Class",
      "Student Full Name",
      "DOB",
      "DOA",
      "Address",
      "City",
      "State",
      "Pincode",
      "Nationality",
      "Mother Tongue",
      "Gender",
      "Blood Group",
      "Religion",
      "Caste",
      "Category",
      "Emergency name",
      "Emergency Address",
      "Emergency Contact",
      "Student Aadhaar No.",
      "Student Id No.",
      "Apaar Id",
      "Father Name",
      "Father Mobile No.",
      "Father Email-Id",
      "Mother Name",
      "Mother Mobile No.",
      "Mother Email-Id",
      "Parent's Aadhaar No.",
      "Last year %",
      "Last year attendance",
    ];

    const thead = `
    <thead style="background-color: #e5e7eb; font-weight: bold;">
      <tr>
        ${headers
          .map(
            (h) =>
              `<th style="border: 1px solid #ccc; padding: 6px;">${h}</th>`,
          )
          .join("")}
      </tr>
    </thead>
  `;

    const tbody = `
    <tbody>
      ${timetable
        .map((student, index) => {
          const fullName = `${capitalize(student.first_name)} ${
            student.mid_name ? capitalize(student.mid_name) : ""
          } ${capitalize(student.last_name)}`;
          const gender =
            student.gender === "M"
              ? "Male"
              : student.gender === "F"
                ? "Female"
                : student.gender;

          return `
          <tr style="background-color: ${
            index % 2 === 0 ? "#fff" : "#f9fafb"
          };">
            <td style="border: 1px solid #ccc; padding: 6px;">${index + 1}</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${
              student.roll_no || ""
            }</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${
              student.reg_no || ""
            }</td>
           
            <td style="border: 1px solid #ccc; padding: 6px;">${fullName}</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${formatDate(
              student.dob,
            )}</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${formatDate(
              student.admission_date,
            )}</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${capitalize(
              student.permant_add,
            )}</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${capitalize(
              student.city,
            )}</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${capitalize(
              student.state,
            )}</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${
              student.pincode || ""
            }</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${capitalize(
              student.nationality,
            )}</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${capitalize(
              student.mother_tongue,
            )}</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${gender}</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${
              student.blood_group || ""
            }</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${capitalize(
              student.religion,
            )}</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${capitalize(
              student.caste,
            )}</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${
              student.category || ""
            }</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${capitalize(
              student.emergency_name,
            )}</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${capitalize(
              student.emergency_add,
            )}</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${
              student.emergency_contact || ""
            }</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${
              student.stu_aadhaar_no || ""
            }</td>
             <td style="border: 1px solid #ccc; padding: 6px;">${
               student.student_id || ""
             }</td>
             <td style="border: 1px solid #ccc; padding: 6px;">${
               student.apaar_id || ""
             }</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${capitalize(
              student.father_name,
            )}</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${
              student.f_mobile || ""
            }</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${
              student.f_email || ""
            }</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${capitalize(
              student.mother_name,
            )}</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${
              student.m_mobile || ""
            }</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${
              student.m_emailid || ""
            }</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${
              student.parent_adhar_no || ""
            }</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${
              student.total_percent || ""
            }</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${
              student.total_attendance || ""
            }</td>
          </tr>
        `;
        })
        .join("")}
    </tbody>
  `;

    return `<table style="width: 100%;  font-size: 12px;">${thead}${tbody}</table>`;
  };

  const handleStudentPrint = (studentsList) => {
    const title = `Student Report of class ${selectedStudent.label}`;
    const tableHTML = generateStudentDetailsTableHTML(studentsList);

    const printWindow = window.open("", "_blank", "width=1000,height=800");

    printWindow.document.write(`
    <html>
      <head>
      <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { width: 100%;  font-size: 12px; }
          th, td { border: 1px solid #333; padding: 6px; text-align: center; }
          th { background: #f3f4f6; }
        </style>
      </head>
      <body>
        ${tableHTML}
      </body>
    </html>
  `);

    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  //   printWindow.document.write(`
  // <html>
  //   <head>
  //     <title>${title}</title>
  //     <style>
  //       @page {
  //         size: A4 landscape;
  //         margin: 10mm;
  //       }

  //       body {
  //         font-family: Arial, sans-serif;
  //       }

  //       table {
  //         width: 100%;
  //         table-layout: fixed;
  //       }

  //       th, td {
  //         border: 1px solid #333;
  //         padding: 4px;
  //         font-size: 9px;
  //         text-align: center;
  //         word-break: break-word;
  //       }

  //       th {
  //         background: #f3f4f6;
  //       }

  //       @media print {
  //         body {
  //           zoom: 0.8;
  //         }
  //       }
  //     </style>
  //   </head>
  //   <body>
  //     ${tableHTML}
  //   </body>
  // </html>
  // `);

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
      // "Class",
      "Student Full Name",
      "DOB",
      "DOA",
      "Address",
      "City",
      "State",
      "Pincode",
      "Nationality",
      "Mother Tongue",
      "Gender",
      "Blood Group",
      "Religion",
      "Caste",
      "Category",
      "Emergency name",
      "Emergency Address",
      "Emergency Contact",
      "Student Aadhaar No.",
      "Student Id No.",
      "Apaar Id",
      "Father Name",
      "Father Mobile No.",
      "Father Email-Id",
      "Mother Name",
      "Mother Mobile No.",
      "Mother Email-Id",
      "Parent's Aadhaar No.",
      "Last year %",
      "Last year attendance",
    ];

    // Convert displayedSections data to array format for Excel
    const data = displayedSections.map((student, index) => [
      index + 1,
      student?.roll_no || " ",
      student?.reg_no || " ",
      // student?.admission_class || " ",

      `${capitalizeFirst(student.first_name)} ${
        student.mid_name?.trim() ? toLowerCaseAll(student.mid_name) : ""
      } ${toLowerCaseAll(student.last_name)}`,
      student?.dob
        ? new Date(student.dob).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          })
        : " ",

      student?.admission_date
        ? new Date(student.admission_date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          })
        : "",

      capitalizeFirst(student?.permant_add) || " ",
      capitalizeFirst(student?.city) || " ",
      capitalizeFirst(student?.state) || " ",
      student?.pincode || " ",
      capitalizeFirst(student?.nationality) || " ",
      capitalizeFirst(student?.mother_tongue) || " ",
      student?.gender === "M"
        ? "Male"
        : student?.gender === "F"
          ? "Female"
          : student?.gender || " ",
      student?.blood_group || " ",
      capitalizeFirst(student?.religion) || " ",
      capitalizeFirst(student?.caste) || " ",
      student?.category || " ",
      capitalizeFirst(student?.emergency_name) || " ",
      capitalizeFirst(student?.emergency_add) || " ",
      student?.emergency_contact || " ",
      student?.stu_aadhaar_no || " ",
      student?.student_id || " ",
      student?.apaar_id || " ",
      capitalizeFirst(student?.father_name) || " ",
      student?.f_mobile || " ",
      student?.f_email || " ",
      capitalizeFirst(student?.mother_name) || " ",
      student?.m_mobile || " ",
      student?.m_emailid || " ",
      student?.parent_adhar_no || " ",
      student?.total_percent || " ",
      student?.total_attendance || " ",
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const columnWidths = headers.map(() => ({ wch: 20 })); // Approx. width of 20 characters per column
    worksheet["!cols"] = columnWidths;

    // Create a workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Student Report Data");

    // Generate and download the Excel file
    const fileName = `Student_Report_${selectedStudent?.label || "ALL"}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  console.log("row", timetable);

  const filteredSections = timetable.filter((section) => {
    const searchLower = searchTerm.toLowerCase();

    // Extract relevant fields and convert them to lowercase for case-insensitive search

    const regNo = section?.reg_no?.toLowerCase() || "";
    const admissionClass = section?.admission_class?.toLowerCase() || "";
    const studentName = `${section?.first_name || ""} ${
      section?.mid_name?.trim() || ""
    } ${section?.last_name || ""}`
      .toLowerCase()
      .trim();
    const studentDOB = section?.dob?.toLowerCase() || "";
    const admissionDate = section?.admission_date?.toLowerCase() || "";
    const permanentAddress = section?.permant_add?.toLowerCase() || "";
    const studentCity = section?.city?.toLowerCase() || "";
    const studentState = section?.state?.toLowerCase() || "";
    const studentPincode = section?.pincode?.toString().toLowerCase() || "";
    const studentNationality = section?.nationality?.toLowerCase() || "";
    const studentMotherTongue = section?.mother_tongue?.toLowerCase() || "";
    const studentGender =
      section?.gender === "M"
        ? "male"
        : section?.gender === "F"
          ? "female"
          : section?.gender?.toLowerCase() || "";
    const studentBloodGroup = section?.blood_group?.toLowerCase() || "";
    const studentReligion = section?.religion?.toLowerCase() || "";
    const studentCaste = section?.caste?.toLowerCase() || "";
    const studentCategory = section?.category?.toLowerCase() || "";
    const emergencyName = section?.emergency_name?.toLowerCase() || "";
    const emergencyAddress = section?.emergency_add?.toLowerCase() || "";
    const emergencyContact = section?.emergency_contact?.toLowerCase() || "";
    const studentAadhaar = section?.stu_aadhaar_no?.toLowerCase() || "";
    const fatherName = section?.father_name?.toLowerCase() || "";
    const fatherMobile = section?.f_mobile?.toLowerCase() || "";
    const fatherEmail = section?.f_email?.toLowerCase() || "";
    const motherName = section?.mother_name?.toLowerCase() || "";
    const motherMobile = section?.m_mobile?.toLowerCase() || "";
    const motherEmail = section?.m_emailid?.toLowerCase() || "";
    const parentAadhaar = section?.parent_adhar_no?.toLowerCase() || "";
    const totalPercent = section?.total_percent?.toLowerCase() || "";
    const totalAttendance = section?.total_attendance?.toLowerCase() || "";

    // Check if the search term is present in any of the specified fields
    return (
      regNo.includes(searchLower) ||
      admissionClass.includes(searchLower) ||
      studentName.includes(searchLower) ||
      studentDOB.includes(searchLower) ||
      admissionDate.includes(searchLower) ||
      permanentAddress.includes(searchLower) ||
      studentCity.includes(searchLower) ||
      studentState.includes(searchLower) ||
      studentPincode.includes(searchLower) ||
      studentNationality.includes(searchLower) ||
      studentMotherTongue.includes(searchLower) ||
      studentGender.includes(searchLower) ||
      studentBloodGroup.includes(searchLower) ||
      studentReligion.includes(searchLower) ||
      studentCaste.includes(searchLower) ||
      studentCategory.includes(searchLower) ||
      emergencyName.includes(searchLower) ||
      emergencyAddress.includes(searchLower) ||
      emergencyContact.includes(searchLower) ||
      studentAadhaar.includes(searchLower) ||
      fatherName.includes(searchLower) ||
      fatherMobile.includes(searchLower) ||
      fatherEmail.includes(searchLower) ||
      motherName.includes(searchLower) ||
      motherMobile.includes(searchLower) ||
      motherEmail.includes(searchLower) ||
      parentAadhaar.includes(searchLower) ||
      totalPercent.includes(searchLower) ||
      totalAttendance.includes(searchLower)
    );
  });

  const displayedSections = filteredSections.slice(currentPage * pageSize);
  return (
    <>
      <div
        className={`mx-auto p-4 transition-all duration-700 ease-[cubic-bezier(0.4, 0, 0.2, 1)] transform ${
          timetable.length > 0
            ? "w-full md:w-[100%] scale-100"
            : "w-full md:w-[90%] scale-[0.98]"
        }`}
      >
        <ToastContainer />
        <div className="card  rounded-md ">
          <div className=" card-header mb-4 flex justify-between items-center ">
            <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
              Student Report
            </h5>
            <RxCross1
              className="  relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
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
                  <div className="w-full md:w-[50%] gap-x-2   justify-around  my-1 md:my-4 flex md:flex-row ">
                    <label
                      className="md:w-[30%] text-md pl-0 md:pl-5 mt-1.5"
                      htmlFor="studentSelect"
                    >
                      Class <span className="text-sm text-red-500">*</span>
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
                      onClick={handleStudentPrint}
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
                <div className="w-full px-4 mt-4 mb-4 ">
                  <div className="card mx-auto lg:w-full shadow-lg">
                    <div className="card-body w-full">
                      <div
                        className="h-96 lg:h-96 overflow-y-scroll overflow-x-scroll"
                        style={{
                          scrollbarWidth: "thin", // Makes scrollbar thin in Firefox
                          scrollbarColor: "#C03178 transparent", // Sets track and thumb color in Firefox
                        }}
                      >
                        <table className="min-w-full leading-normal table-auto ">
                          <thead
                            className="sticky top-0  bg-gray-200"
                            style={{ zIndex: "1px" }}
                          >
                            <tr className="bg-gray-200">
                              {[
                                "Sr No.",
                                "Roll No.",
                                "GRN No.",
                                "Student Full Name",
                                "DOB (DD/MM/YY)",
                                "DOA (DD/MM/YY)",
                                "Address",
                                "City",
                                "State",
                                "Pincode",
                                "Nationality",
                                "Mother Tongue",
                                "Gender",
                                "Blood Group",
                                "Religion",
                                "Caste",
                                "Category",
                                "Emergency name",
                                "Emergency Address",
                                "Emergency Contact",
                                "Student Aadhaar No.",
                                "Student Id No.",
                                "Apaar Id",
                                "Father Name",
                                "Father Mobile No.",
                                "Father Email-Id",
                                "Mother Name",
                                "Mother Mobile No.",
                                "Mother Email-Id",
                                "Parent's Aadhaar No.",
                                "Last year %",
                                "Last year attendance",
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
                                  key={student.student_id}
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

                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {`${capitalizeFirst(student.first_name)} ${
                                      student.mid_name?.trim()
                                        ? toLowerCaseAll(student.mid_name)
                                        : ""
                                    } ${toLowerCaseAll(student.last_name)}`}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student?.dob
                                      ? new Date(
                                          student.dob,
                                        ).toLocaleDateString("en-GB", {
                                          day: "2-digit",
                                          month: "2-digit",
                                          year: "2-digit",
                                        })
                                      : ""}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student?.admission_date
                                      ? new Date(
                                          student.admission_date,
                                        ).toLocaleDateString("en-GB", {
                                          day: "2-digit",
                                          month: "2-digit",
                                          year: "2-digit",
                                        })
                                      : ""}
                                  </td>
                                  <td className="px-2 w-[20%] py-2 text-center border border-gray-300">
                                    {capitalizeFirst(student.permant_add) ||
                                      " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {capitalizeFirst(student.city) || " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {capitalizeFirst(student.state) || " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.pincode || " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {capitalizeFirst(student.nationality) ||
                                      " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {capitalizeFirst(student.mother_tongue) ||
                                      " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.gender === "M"
                                      ? "Male"
                                      : student.gender === "F"
                                        ? "Female"
                                        : student.gender}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.blood_group || " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {capitalizeFirst(student.religion) || " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {capitalizeFirst(student.caste) || " "}
                                  </td>

                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.category || " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {capitalizeFirst(student.emergency_name) ||
                                      " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {capitalizeFirst(student.emergency_add) ||
                                      " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.emergency_contact || " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.stu_aadhaar_no || " "}
                                  </td>
                                  <td className="px-2 py-2 text-center text-nowrap border border-gray-300">
                                    {student.student_id || " "}
                                  </td>
                                  <td className="px-2 py-2 text-center text-nowrap border border-gray-300">
                                    {student.apaar_id || " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {capitalizeFirst(student.father_name)}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.f_mobile || " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.f_email || " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {capitalizeFirst(student.mother_name)}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.m_mobile || " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.m_emailid || " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.parent_adhar_no || " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.total_percent || " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student.total_attendance || " "}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <div className="absolute left-[1%] w-[100%] text-center flex justify-center items-center mt-14">
                                <div className="text-center text-xl text-red-700">
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

export default StudentReport;
