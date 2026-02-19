import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
import { FiPrinter, FiSearch } from "react-icons/fi";
import { FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";
import ReactPaginate from "react-paginate";
import DateRangePickerLibrary from "../../common/DateRangePicker/DateRangePickerLibrary";

const BookIssuedReport = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [currentPage, setCurrentPage] = useState(0);
  const [showSearch, setShowSearch] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingForSearch, setLoadingForSearch] = useState(false);

  const navigate = useNavigate();
  const [loadingExams, setLoadingExams] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [timetable, setTimetable] = useState([]);

  const [selectedType, setSelectedType] = useState("student");

  const pageSize = 10;
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");
  const isClearingRef = useRef(false);

  const [debouncedSearchTrigger, setDebouncedSearchTrigger] = useState({});

  const [showStudentReport, setShowStudentReport] = useState(false);

  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState([]);

  const [studentError, setStudentError] = useState("");

  const [roleId, setRoleId] = useState("");
  const [regId, setRegId] = useState("");

  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState(null);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [academicYear, setAcademicYear] = useState("");
  const [stafflist, setStafflist] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [name, setName] = useState("");
  const [grn_no, setGrnNo] = useState("");
  const [selectedStaffname, setSelectedStaffName] = useState(null);

  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTrigger(Date.now());
    }, 500);

    return () => clearTimeout(timer);
  }, [
    selectedSectionId,
    selectedStudentId,
    selectedStaffId,
    searchFrom,
    searchTo,
    grn_no,
  ]);

  useEffect(() => {
    if (isClearingRef.current) {
      isClearingRef.current = false;
      return;
    }

    const hasAnyFilter =
      selectedStudentId ||
      selectedSectionId ||
      selectedStaffId ||
      grn_no ||
      searchFrom ||
      searchTo;

    if (hasAnyFilter) {
      handleSearch();
    }
  }, [debouncedSearchTrigger]);

  useEffect(() => {
    fetchDataRoleId();
  }, []);

  useEffect(() => {
    if (!roleId || !regId) return;
    fetchClasses(roleId, regId);
  }, [roleId, regId]);

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
      const academicyr = sessionResponse.data.custom_claims.academic_year;

      setRoleId(role_id);
      setRegId(reg_id);
      setAcademicYear(academicyr);

      // console.log("roleIDis:", role_id);
      // console.log("reg id:", reg_id);
      // console.log("academic year", academicyr);

      return { roleId, regId };
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchClasses = async (roleId, regId) => {
    const token = localStorage.getItem("authToken");
    setLoadingExams(true);

    try {
      const response = await axios.get(
        `${API_URL}/api/get_teacherclasseswithclassteacher?teacher_id=${regId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // console.log("response", response.data.data);

      const mappedData = (response.data.data || [])
        .filter((item) => item.class_id && item.section_id)
        .map((cls) => ({
          value: cls.class_id,
          class_id: cls.class_id,
          section_id: cls.section_id,
          classname: cls.classname,
          sectionname: cls.sectionname,
          label: `${cls.classname} ${cls.sectionname}`,
        }));

      setStudentNameWithClassId(mappedData || []);
    } catch (error) {
      toast.error("Error fetching Classes");
      console.error("Error fetching Classes:", error);
    } finally {
      setLoadingExams(false);
    }
  };

  const studentOptions = useMemo(() => {
    if (!studentNameWithClassId) return [];

    return studentNameWithClassId.map((cls) => ({
      value: `${cls.class_id}-${cls.section_id}`, // unique value for dropdown
      class_id: cls.class_id, // real class_id for API
      section_id: cls.section_id, // real section_id for API
      classname: cls.classname,
      sectionname: cls.sectionname,
      label: `${cls.classname} ${cls.sectionname}`,
    }));
  }, [studentNameWithClassId, roleId]);

  const handleStudentSelect = (selectedOption) => {
    setStudentError("");
    setSelectedStudent(selectedOption);

    if (selectedOption) {
      setSelectedStudentId(selectedOption.class_id);
      setSelectedSectionId(selectedOption.section_id);
    } else {
      setSelectedStudentId(null);
      setSelectedSectionId(null);
    }
  };

  useEffect(() => {
    if (!selectedType) return;

    if (selectedType === "student") {
      if (!selectedStudentId || !selectedSectionId) return;
    }

    fetchMember();
  }, [selectedType, selectedStudentId, selectedSectionId]);

  const fetchMember = async () => {
    const token = localStorage.getItem("authToken");
    setLoadingExams(true);

    const params =
      selectedType === "student"
        ? {
          mtype: "S",
          class_id: selectedStudentId,
          section_id: selectedSectionId,
        }
        : {
          mtype: "T",
        };

    try {
      const response = await axios.post(
        `${API_URL}/api/get_library_members`,
        params,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // console.log("response library members", response.data);
      setStafflist(response.data);
    } catch (error) {
      toast.error("Error fetching library members");
      console.error("Error fetching library members:", error);
    } finally {
      setLoadingExams(false);
    }
  };

  const staffOptions = useMemo(() => {
    if (!stafflist) return [];

    return stafflist.map((cls) => ({
      value: `${cls.value}`,
      label: `${cls.label}`,
    }));
  }, [stafflist]);

  const handleStaffSelect = (selectedOption) => {
    setSelectedStaff(selectedOption);

    if (selectedOption) {
      setSelectedStaffId(selectedOption.value);
      setSelectedStaffName(selectedOption.label);
    } else {
      setSelectedStaffId(null);
      setSelectedStaffName(null);
    }
  };

  useEffect(() => {
    if (selectedType === "student") {
      setSelectedTeacherIds([]);
      setSelectedStudent(null);
      setSelectedStudentId("");
      setSelectedSectionId("");
    } else if (selectedType === "staff") {
      setSelectedStudent(null);
      setSelectedStudentId("");
      setSelectedSectionId("");
      setSelectedStudentIds([]);
    }

    setStudentError("");
    setTimetable([]);
    setShowStudentReport(false);
  }, [selectedType]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setSearchFrom(today);
    setSearchTo(today);
  }, []);
  const handleDateChange = (from, to) => {
    setSearchFrom(from);
    setSearchTo(to);

    // handleSearch();
  };

  //   const handleSearch = async ({ clearAll = false } = {}) => {
  //     setLoadingForSearch(true);
  //     setIsSubmitting(true);
  //     setLoading(true);
  //     setShowSearch(false);

  //     try {
  //       const token = localStorage.getItem("authToken");
  //       const type = selectedType === "student" ? "S" : "T";

  //       let params = {};

  //       if (!clearAll) {
  //         if (type) params.m_type = type;
  //         if (grn_no) params.grn_no = grn_no;
  //         if (selectedStudentId) params.class_id = selectedStudentId;
  //         if (selectedSectionId) params.section_id = selectedSectionId;
  //         if (selectedStaffId) params.member_id = selectedStaffId;
  //         if (searchFrom) params.search_from = searchFrom;
  //         if (searchTo) params.search_to = searchTo;
  //       }

  //       console.log("Search Params:", params);

  //       const response = await axios.get(
  //         `${API_URL}/api/library/book_issued_report`,
  //         {
  //           headers: { Authorization: `Bearer ${token}` },
  //           params,
  //           paramsSerializer: (params) => new URLSearchParams(params).toString(),
  //         },
  //       );

  //       const data = response?.data?.data || [];

  //       if (data.length === 0) {
  //         setTimetable([]);
  //         setPageCount(0);
  //         setCurrentPage(0);
  //         toast.error("No records found for selected criteria.");
  //       } else {
  //         setTimetable(data);
  //         setPageCount(Math.ceil(data.length / pageSize));
  //         setCurrentPage(0);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching report:", error);
  //       toast.error("Error fetching data. Please try again.");
  //     } finally {
  //       setIsSubmitting(false);
  //       setLoadingForSearch(false);
  //       setLoading(false);
  //     }
  //   };

  const handleSearch = async ({ clearAll = false } = {}) => {
    // STUDENT VALIDATION
    if (!clearAll && selectedType === "student") {
      if (!selectedStudentId || !selectedSectionId) {
        toast.error("Please select a class for the student.");
        return;
      }
    }

    setLoadingForSearch(true);
    setIsSubmitting(true);
    setLoading(true);
    setShowSearch(false);

    try {
      const token = localStorage.getItem("authToken");
      const type = selectedType === "student" ? "S" : "T";

      let params = {};

      if (!clearAll) {
        if (type) params.m_type = type;
        if (grn_no) params.grn_no = grn_no;
        if (selectedStudentId) params.class_id = selectedStudentId;
        if (selectedSectionId) params.section_id = selectedSectionId;
        if (selectedStaffId) params.member_id = selectedStaffId;
        if (searchFrom) params.search_from = searchFrom;
        if (searchTo) params.search_to = searchTo;
      }

      // console.log("Search Params:", params);

      const response = await axios.get(
        `${API_URL}/api/library/book_issued_report`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
          paramsSerializer: (params) => new URLSearchParams(params).toString(),
        },
      );

      const data = response?.data?.data || [];

      if (data.length === 0) {
        setTimetable([]);
        setPageCount(0);
        setCurrentPage(0);
        toast.error("No records found for selected criteria.");
      } else {
        setTimetable(data);
        setPageCount(Math.ceil(data.length / pageSize));
        setCurrentPage(0);
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      toast.error("Error fetching data. Please try again.");
    } finally {
      setIsSubmitting(false);
      setLoadingForSearch(false);
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printTitle = `Books Issued Report`;
    const printContent = `
    <div id="tableMain" class="flex items-center justify-center min-h-screen bg-white">
         <h5 id="tableHeading5"  class="text-lg font-semibold border-1 border-black">${printTitle}</h5>
    <div id="tableHeading" class="text-center w-3/4">
      <table class="min-w-full leading-normal table-auto border border-black mx-auto mt-2">
        <thead>
          <tr class="bg-gray-100">
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Sr.No</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Accession No.</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Book Title</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Name</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Issue Date</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Due Date</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Return Date</th>
          
          </tr>
        </thead>
     <tbody>
      ${timetable
        .map((student, index) => {
          return `
          <tr style="background-color: ${index % 2 === 0 ? "#fff" : "#f9fafb"
            };">
            <td style="border: 1px solid #ccc; padding: 6px;">${index + 1}</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${student.copy_id || ""
            }</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${student.book_title || ""
            }</td>
            <td style="border: 1px solid #ccc; padding: 6px;">
             ${student?.first_name || "-"}  ${student?.mid_name || "-"}  ${student?.last_name || "-"}  ${student?.name || "-"}
            </td>
            <td style="border: 1px solid #ccc; padding: 6px;">${formatDate(
              student.issue_date || "",
            )}</td>
             
             <td style="border: 1px solid #ccc; padding: 6px;">${formatDate(
              student.due_date || "",
            )}</td>
             <td style="border: 1px solid #ccc; padding: 6px;">${formatDate(
              student.return_date || "",
            )}</td>
          </tr>
        `;
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
                justify-content: flex-center;
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

    //  Ensure content is fully loaded before printing
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
      "Accession No.",
      "Book Title",
      "Name",
      "Issue Date",
      "Due Date",
      "Return Date",
    ];
    // Convert displayedSections data to array format for Excel
    const data = filteredSections.map((student, index) => [
      index + 1,
      student?.copy_id || " ",
      student?.book_title || " ",
      `${student?.first_name || " "} ${student?.mid_name} ${student?.last_name}`,
      formatDate(student?.issue_date || " "),
      formatDate(student?.due_date || " "),
      formatDate(student?.return_date || " "),
    ]);

    // Create a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // Auto-adjust column width
    const columnWidths = headers.map(() => ({ wch: 20 })); // Approx. width of 20 characters per column
    worksheet["!cols"] = columnWidths;

    // Create a workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Books Available Data");

    // Generate and download the Excel file
    const fileName = `Books Issued Report.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const camelCase = (str) =>
    str
      ?.toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  // console.log("row", timetable);

  const formatDate = (dateStr) => {
    if (
      !dateStr ||
      dateStr === "0000-00-00" ||
      dateStr === "0000-00-00 00:00:00"
    ) {
      return "";
    }

    const date = new Date(dateStr);
    return isNaN(date.getTime())
      ? ""
      : date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      });
  };
  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  useEffect(() => {
    const trimmedSearch = searchTerm.trim().toLowerCase();

    if (trimmedSearch !== "" && prevSearchTermRef.current === "") {
      previousPageRef.current = currentPage;
      setCurrentPage(0);
    }

    if (trimmedSearch === "" && prevSearchTermRef.current !== "") {
      setCurrentPage(previousPageRef.current);
    }

    prevSearchTermRef.current = trimmedSearch;
  }, [searchTerm]);

  const filteredSections = timetable.filter((student) => {
    const searchLower = searchTerm.trim().replace(/\s+/g, " ").toLowerCase();

    const normalize = (value) =>
      value?.toString().trim().replace(/\s+/g, " ").toLowerCase() || "";

    const studentName = normalize(student?.book_title);
    const accessionNo = normalize(student?.accession_no);
    const locationBook = normalize(student?.location_of_book);
    const status = normalize(student?.Status_code);
    const amount = normalize(student?.copy_id);
    const author = normalize(student?.author);
    const publisher = normalize(student?.publisher);
    const addedDate = formatDate(normalize(student.issue_date));
    const dueDate = formatDate(normalize(student.due_date));
    const returnDate = formatDate(normalize(student.return_date));
    const pulicationYear = normalize(student?.year);
    const editionNo = normalize(student?.edition);
    const price = normalize(student?.price);
    const isbnNo = normalize(student?.isbn);
    const combined = normalize(
      `${student?.call_no || ""} / ${student?.category_name || ""}`,
    );

    const fullName = normalize(
      `${student?.first_name || ""}  ${student?.mid_name || ""} ${student?.last_name || ""}`,
    );

    const staffName = normalize(`${student?.name}`);

    return (
      studentName.includes(searchLower) ||
      accessionNo.includes(searchLower) ||
      locationBook.includes(searchLower) ||
      status.includes(searchLower) ||
      amount.includes(searchLower) ||
      author.includes(searchLower) ||
      combined.includes(searchLower) ||
      publisher.includes(searchLower) ||
      addedDate.includes(searchLower) ||
      pulicationYear.includes(searchLower) ||
      editionNo.includes(searchLower) ||
      price.includes(searchLower) ||
      isbnNo.includes(searchLower) ||
      fullName.includes(searchLower) ||
      dueDate.includes(searchLower) ||
      returnDate.includes(searchLower) ||
      staffName.includes(searchLower)
    );
  });

  useEffect(() => {
    setPageCount(Math.ceil(filteredSections.length / pageSize));
  }, [filteredSections, pageSize]);

  const displayedSections = filteredSections.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize,
  );

  return (
    <>
      <div className="w-full md:w-[100%] mx-auto p-4 ">
        <ToastContainer />
        <div className="card rounded-md ">
          <div className=" card-header mb-4 flex justify-between items-center ">
            <h5 className="text-gray-700 text-md lg:text-lg">
              Books Issued Report
            </h5>
            <RxCross1
              className=" relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
              onClick={() => {
                navigate("/dashboard");
              }}
            />
          </div>
          <div
            className=" relative w-[98%] -top-6 h-1  mx-auto bg-red-700 "
            style={{
              backgroundColor: "#C03078",
            }}
          ></div>
          {filteredSections.length > 0 && (
            <div className="md:absolute md:right-3 md:top-[9%] mb-5 text-gray-500">
              <div className="mx-auto w-fit px-2 py-1 bg-blue-50 border border-blue-300 text-blue-800 text-sm rounded text-center">
                <div className="flex flex-col md:flex-row gap-x-1 justify-center md:justify-end">
                  <button
                    type="button"
                    onClick={() => setShowSearch((prev) => !prev)}
                    className="relative bg-blue-400 py-1 hover:bg-blue-500 text-white px-3 rounded group"
                  >
                    <FiSearch size={15} />

                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex items-center justify-center bg-gray-600  text-white text-[.7em] rounded-md py-1 px-2">
                      Search
                    </div>
                  </button>

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
            </div>
          )}

          <>
            <div className="w-full flex flex-col md:flex-row flex-wrap gap-4 p-2 mt-2">
              {/* Member Type */}
              <div className="flex flex-col gap-1 w-full md:w-auto">
                <label className="text-md">
                  Member Type <span className="text-red-500">*</span>
                </label>

                <div className="flex items-center border border-gray-300 rounded-md px-4 py-2 bg-white gap-4">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="userType"
                      value="student"
                      checked={selectedType === "student"}
                      onChange={() => setSelectedType("student")}
                      className="accent-pink-600"
                    />
                    Student
                  </label>

                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="userType"
                      value="staff"
                      checked={selectedType === "staff"}
                      onChange={() => setSelectedType("staff")}
                      className="accent-pink-600"
                    />
                    Staff
                  </label>
                </div>
              </div>

              {/* STUDENT */}
              {selectedType === "student" && (
                <>
                  <div className="flex flex-col gap-1 w-[150px]">
                    <label className="text-md">
                      Class
                      <span className="text-red-500 text-sm">*</span>
                    </label>
                    <Select
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      value={selectedStudent}
                      onChange={handleStudentSelect}
                      options={studentOptions}
                      placeholder="Select"
                      isClearable
                      isSearchable
                    />
                  </div>

                  <div className="flex flex-col gap-1 w-[250px]">
                    <label className="text-md">Student</label>
                    <Select
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      value={selectedStaff}
                      onChange={handleStaffSelect}
                      options={staffOptions}
                      placeholder="Select"
                      isSearchable
                      isClearable
                    />
                  </div>

                  <div className="flex flex-col gap-1 w-[350px]">
                    <label className="text-md">Date</label>
                    {/* <DateRangePickerComponent onDateChange={handleDateChange} /> */}
                    <DateRangePickerLibrary onDateChange={handleDateChange} />
                  </div>

                  <div className="flex flex-col gap-1 w-[150px]">
                    <label className="text-md">GRN No.</label>
                    <input
                      type="text"
                      value={grn_no}
                      onChange={(e) => setGrnNo(e.target.value)}
                      placeholder="Enter"
                      className="border border-gray-300 rounded px-2 py-2"
                      maxLength={8}
                    />
                  </div>
                </>
              )}

              {/* STAFF */}
              {selectedType === "staff" && (
                <>
                  <div className="flex flex-col gap-1 w-[250px]">
                    <label className="text-md">Staff</label>
                    <Select
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      value={selectedStaff}
                      onChange={handleStaffSelect}
                      options={staffOptions}
                      placeholder="Select"
                      isSearchable
                      isClearable
                    />
                  </div>

                  <div className="flex flex-col gap-1 w-[400px]">
                    <label className="text-md">Date</label>
                    <DateRangePickerLibrary onDateChange={handleDateChange} />
                  </div>
                </>
              )}
            </div>

            <>
              <div className="w-full  p-2">
                {timetable.length > 0 && (
                  <>
                    <div className="card mx-auto lg:w-full shadow-lg">
                      {showSearch && (
                        <>
                          <div className="p-1 px-3 bg-gray-100 border-none">
                            <div className="w-full flex justify-end mr-0 md:mr-4">
                              <div className="w-1/2 md:w-[18%] mr-1">
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Search"
                                  value={searchTerm}
                                  onChange={(e) =>
                                    setSearchTerm(e.target.value)
                                  }
                                />
                              </div>
                            </div>
                          </div>
                          <div
                            className=" relative w-[97%]   mb-3 h-0.5  mx-auto bg-red-700"
                            style={{
                              backgroundColor: "#C03078",
                            }}
                          ></div>
                        </>
                      )}

                      <div className="card-body w-full">
                        <div
                          className="h-96 lg:h-96 overflow-y-scroll overflow-x-scroll"
                          style={{
                            scrollbarWidth: "thin",
                            scrollbarColor: "#C03178 transparent",
                          }}
                        >
                          <table className="min-w-full leading-normal table-auto">
                            {/* <thead>
                              <tr className="bg-gray-100">
                                <th
                                  style={{ width: "10px" }}
                                  className="px-1 py-1 text-center border border-gray-950 text-sm font-semibold"
                                >
                                  Sr No.
                                </th>
                                <th
                                  style={{ width: "50px" }}
                                  className="px-1 py-1 text-center border border-gray-950 text-sm font-semibold"
                                >
                                  Accession No.
                                </th>

                                <th
                                  style={{ width: "180px" }}
                                  className="px-1 py-1 text-center border border-gray-950 text-sm font-semibold"
                                >
                                  Book Title
                                </th>
                                <th
                                  style={{ width: "150px" }}
                                  className="px-1 py-1 text-center border border-gray-950 text-sm font-semibold"
                                >
                                  Name
                                </th>

                                <th
                                  style={{ width: "30px" }}
                                  className="px-1 py-1 text-center border border-gray-950 text-sm font-semibold"
                                >
                                  Issue Date
                                </th>

                                <th
                                  style={{ width: "30px" }}
                                  className="px-1 py-1 text-center border border-gray-950 text-sm font-semibold"
                                >
                                  Due Date
                                </th>
                                <th
                                  style={{ width: "30px" }}
                                  className="px-1 py-1 text-center border border-gray-950 text-sm font-semibold"
                                >
                                  Return Date
                                </th>
                              </tr>
                            </thead> */}
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="px-2 py-1 text-center border border-gray-950 text-sm font-semibold whitespace-nowrap">
                                  Sr No.
                                </th>

                                <th className="px-2 py-1 text-center border border-gray-950 text-sm font-semibold whitespace-nowrap">
                                  Accession No.
                                </th>

                                <th className="px-2 py-1 text-center border border-gray-950 text-sm font-semibold">
                                  Book Title
                                </th>

                                <th className="px-2 py-1 text-center border border-gray-950 text-sm font-semibold">
                                  Name
                                </th>

                                <th className="px-2 py-1 text-center border border-gray-950 text-sm font-semibold whitespace-nowrap">
                                  Issue Date
                                </th>

                                <th className="px-2 py-1 text-center border border-gray-950 text-sm font-semibold whitespace-nowrap">
                                  Due Date
                                </th>

                                <th className="px-2 py-1 text-center border border-gray-950 text-sm font-semibold whitespace-nowrap">
                                  Return Date
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {/* LOADING */}
                              {loading && (
                                <div className="absolute inset-0 flex justify-center items-center bg-white/70 z-10">
                                  <div className="text-xl text-blue-700 ">
                                    Please wait while data is loading...
                                  </div>
                                </div>
                              )}

                              {/* DATA ROWS */}
                              {!loading &&
                                displayedSections.length > 0 &&
                                displayedSections.map((student, index) => (
                                  <tr
                                    key={`${student.adm_form_pk}-${index}`}
                                    className="border border-gray-300"
                                  >
                                    <td className="px-2 py-2 text-center border">
                                      {currentPage * pageSize + index + 1}
                                    </td>
                                    <td className="px-2 py-2 text-center border">
                                      {student?.copy_id || ""}
                                    </td>

                                    <td className="px-2 py-2 text-center border">
                                      {student?.book_title || ""}
                                    </td>

                                    {selectedType === "student" ? (
                                      <>
                                        <td className="px-2 py-2 text-center border">
                                          {camelCase(
                                            `${student?.first_name || ""} ${student?.mid_name || ""} ${student?.last_name || ""}`,
                                          )}
                                        </td>
                                      </>
                                    ) : (
                                      <td className="px-2 py-2 text-center border">
                                        {camelCase(`${student?.name || ""} `)}
                                      </td>
                                    )}

                                    <td className="px-2 py-2 text-center border">
                                      {formatDate(student?.issue_date || "")}
                                    </td>
                                    <td className="px-2 py-2 text-center border">
                                      {formatDate(student?.due_date || "")}
                                    </td>
                                    <td className="px-2 py-2 text-center border">
                                      {formatDate(student?.return_date || "")}
                                    </td>
                                  </tr>
                                ))}

                              {/* NO DATA */}
                              {!loading && timetable.length === 0 && (
                                <div className="absolute inset-0 flex justify-center items-center">
                                  <div className="text-xl text-red-700">
                                    No data available.
                                  </div>
                                </div>
                              )}

                              {/* DATA FOUND (but maybe filtered empty) */}
                              {!loading &&
                                timetable.length > 0 &&
                                displayedSections.length === 0 && (
                                  <div className="absolute inset-0 flex justify-center items-center">
                                    <div className="text-xl text-red-700">
                                      Result data found!
                                    </div>
                                  </div>
                                )}

                              {/* TOTAL COUNT ROW */}
                              {!loading && filteredSections.length > 0 && (
                                <div className="absolute bottom-2 left-4 z-10">
                                  <div className="px-4 py-2 bg-gray-100 border rounded shadow text-sm">
                                    <span className="text-blue-800 font-semibold">
                                      Total books are :
                                    </span>
                                    <span className="text-pink-600 ml-2 font-semibold">
                                      {filteredSections.length}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </tbody>
                          </table>
                        </div>
                        <div className=" flex justify-center pt-2 -mb-3">
                          <ReactPaginate
                            previousLabel={"Previous"}
                            nextLabel={"Next"}
                            breakLabel={"..."}
                            breakClassName={"page-item"}
                            breakLinkClassName={"page-link"}
                            pageCount={pageCount}
                            marginPagesDisplayed={1}
                            pageRangeDisplayed={1}
                            onPageChange={handlePageClick}
                            containerClassName={"pagination"}
                            pageClassName={"page-item"}
                            pageLinkClassName={"page-link"}
                            previousClassName={"page-item"}
                            previousLinkClassName={"page-link"}
                            nextClassName={"page-item"}
                            nextLinkClassName={"page-link"}
                            activeClassName={"active"}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          </>
        </div>
      </div>
    </>
  );
};

export default BookIssuedReport;
