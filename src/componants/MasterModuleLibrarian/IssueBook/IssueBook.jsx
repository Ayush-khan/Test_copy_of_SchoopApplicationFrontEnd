import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faTimes, faCheck } from "@fortawesome/free-solid-svg-icons";
import { FaInfoCircle } from "react-icons/fa";

const IssueBook = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [currentPage, setCurrentPage] = useState(0);

  const [loadingForSearch, setLoadingForSearch] = useState(false);

  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [classError, setClassError] = useState("");
  const [staffError, setStaffError] = useState("");

  const [timetable, setTimetable] = useState([]);

  const pageSize = 10;
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [showStudentReport, setShowStudentReport] = useState(false);

  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const [loadingExams, setLoadingExams] = useState(false);
  const [studentError, setStudentError] = useState("");

  const [roleId, setRoleId] = useState("");
  const [regId, setRegId] = useState("");

  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState(null);

  const [selectedType, setSelectedType] = useState("student");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [academicYear, setAcademicYear] = useState("");
  const [stafflist, setStafflist] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState(null);

  const [grn_no, setGrnNo] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const [issuedDate, setIssuedDate] = useState(today);
  const [selectedStaffname, setSelectedStaffName] = useState(null);

  const academicyrfrom = localStorage.getItem("academic_yr_from");
  const minDate = academicyrfrom
    ? new Date(academicyrfrom).toISOString().split("T")[0]
    : "";

  const [accessionNo, setAccessionNo] = useState("");
  const [bookDetails, setBookDetails] = useState(null); // call/category + title
  const [bookList, setBookList] = useState([]); // list for table rows
  const [bookError, setBookError] = useState("");
  const [bookPreview, setBookPreview] = useState(null);

  const [memberDetails, setMemberDetails] = useState("");

  const grnInputRef = useRef(null);

  useEffect(() => {
    grnInputRef.current?.focus();
  }, []);

  const camelCase = (str) =>
    str
      ?.toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

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
      value: `${cls.class_id}-${cls.section_id}`,
      class_id: cls.class_id,
      section_id: cls.section_id,
      classname: cls.classname,
      sectionname: cls.sectionname,
      label: `${cls.classname} ${cls.sectionname}`,
    }));
  }, [studentNameWithClassId, roleId]);

  const handleStudentSelect = (selectedOption) => {
    setStudentError("");
    setClassError("");
    setSelectedStudent(selectedOption);

    if (selectedOption) {
      setSelectedStudentId(selectedOption.class_id);
      setSelectedSectionId(selectedOption.section_id);

      // 🔥 ALWAYS RESET MEMBER WHEN CLASS CHANGES
      setSelectedStaff(null);
      setSelectedStaffId(null);
      setSelectedStaffName(null);
      setStafflist([]);
      setClassError("");
    } else {
      setSelectedStudentId(null);
      setSelectedSectionId(null);

      // 🔥 Also clear member data when nothing selected
      setSelectedStaff(null);
      setSelectedStaffId(null);
      setSelectedStaffName(null);
      setStafflist([]);
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

  const handleMemberSelect = (selectedOption) => {
    setSelectedStaff(selectedOption);

    if (selectedOption) {
      setSelectedStaffId(selectedOption.value);
      setSelectedStaffName(selectedOption.label);
      setStaffError("");
    } else {
      setSelectedStaffId(null);
      setSelectedStaffName(null);
    }
  };

  useEffect(() => {
    setSelectedStudent(null);
    setSelectedStudentId("");
    setSelectedSectionId("");

    setSelectedStaff(null);
    setSelectedStaffId(null);
    setSelectedStaffName(null);
    setStafflist([]);

    // Other resets
    setStudentError("");
    setTimetable([]);
    setShowStudentReport(false);
    setGrnNo("");
  }, [selectedType]);

  const handleSearch = async () => {
    setStudentError("");
    setStaffError("");
    setClassError("");
    setBookError("");
    setAccessionNo("");
    setBookList("");

    setTimetable([]);
    setShowStudentReport(false);
    setLoadingForSearch(true);

    let hasError = false;

    const isGrnEntered = grn_no && grn_no.trim() !== "";

    if (selectedType === "student") {
      //  If GRN exists → skip all dropdown validations
      if (!isGrnEntered) {
        if (!selectedStudentId) {
          setClassError("Please select a class.");
          hasError = true;
        }

        if (!selectedStaffId) {
          setStaffError("Please select a member.");
          hasError = true;
        }
      }
    }

    if (selectedType === "staff") {
      if (!selectedStaffId) {
        setStaffError("Please select a member.");
        hasError = true;
      }
    }

    if (hasError) {
      setLoadingForSearch(false);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");

      let params;

      if (selectedType === "student") {
        if (isGrnEntered) {
          //Search ONLY by GRN NO
          params = {
            mtype: "S",
            grn_no: grn_no,
            issuedate: issuedDate,
          };
        } else {
          // Search by class + section + member
          params = {
            mtype: "S",
            class_id: selectedStudentId || "",
            section_id: selectedSectionId || "",
            member_id: selectedStaffId || "",
            grn_no: "",
            issuedate: issuedDate,
          };
        }
      } else {
        //  STAFF MODE
        params = {
          mtype: "T",
          member_id: selectedStaffId || "",
          issuedate: issuedDate,
        };
      }

      // API CALL
      const response = await axios.post(
        `${API_URL}/api/library/issued_books`,
        params,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = response?.data ?? [];
      const memberData = response?.data?.member;

      setTimetable(data);
      setMemberDetails(memberData);
      // console.log("memberdata", memberData);
      setPageCount(Math.ceil(data.length / pageSize));
      setShowStudentReport(true);
    } catch (error) {
      console.error("API Error:", error?.response?.data || error.message);

      if (error.response) {
        const { status, data } = error.response;

        // Show backend message if available
        if (data?.message) {
          toast.error(data.message);
        } else {
          toast.error(`Request failed (${status})`);
        }
      } else {
        toast.error("Server not reachable. Please try again.");
      }
    } finally {
      setLoadingForSearch(false);
      setIsSubmitting(false);
    }
  };

  const classSection = useMemo(() => {
    if (!memberDetails || !studentOptions.length) return null;

    return studentOptions.find(
      (item) =>
        String(item.class_id) === String(memberDetails.class_id) &&
        String(item.section_id) === String(memberDetails.section_id),
    );
  }, [memberDetails, studentOptions]);
  // const fetchDueDate = async () => {
  //   try {
  //     const token = localStorage.getItem("authToken");

  //     const mtype = selectedType === "student" ? "S" : "T";
  //     const issueDate = issuedDate;

  //     const response = await axios.get(
  //       `${API_URL}/api/library/get_due_date/${mtype}/${issueDate}`,
  //       { headers: { Authorization: `Bearer ${token}` } },
  //     );

  //     console.log("Due Date Response:", response.data);

  //     if (response.data && response.data.due_date) {
  //       return response.data.due_date; // return due date
  //     }

  //     return null;
  //   } catch (error) {
  //     console.error("Due Date API Error:", error);
  //     return null;
  //   }
  // };

  const fetchDueDate = async () => {
    if (!selectedType || !issuedDate) {
      console.warn("Due date skipped: missing type or issue date");
      return null;
    }

    try {
      const token = localStorage.getItem("authToken");

      const mtype = selectedType === "student" ? "S" : "T";

      const response = await axios.get(
        `${API_URL}/api/library/get_due_date/${mtype}/${issuedDate}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // console.log("Due Date Response:", response.data);

      return response.data?.due_date ?? null;
    } catch (error) {
      console.error("Due Date API Error:", error);
      return null;
    }
  };

  useEffect(() => {
    if (!accessionNo.trim()) {
      setBookPreview(null);
      return;
    }

    const debounceTimer = setTimeout(() => {
      fetchBookPreview(accessionNo);
    }, 500); // 500ms delay

    return () => clearTimeout(debounceTimer);
  }, [accessionNo]);

  const fetchBookPreview = async (value) => {
    if (!value.trim()) {
      setBookPreview(null);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.get(`${API_URL}/api/books/search`, {
        params: { accession_no: value },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.data?.data?.length) {
        setBookPreview(null);
        return;
      }

      const book = response.data.data[0];

      //  fetch due date ONLY when possible
      const dueDate = selectedType && issuedDate ? await fetchDueDate() : null;

      setBookPreview({
        book_title: book.book_title,
        call_no: book.call_no,
        category_name: book.category_name,
        due_date: dueDate,
      });
    } catch (error) {
      console.error(error);
      setBookPreview(null);
    }
  };

  const handleIssueBook = async () => {
    if (!issuedDate) return toast("Please select Issue Date");
    if (!selectedType) return toast("Please select a member type");

    if (selectedType === "student" && !selectedStudent)
      return toast("Please select a student");

    if (selectedType === "staff" && !selectedStaff)
      return toast("Please select a staff member");

    if (bookList.length === 0) return alert("Please add at least one book");

    const copyIds = bookList.map((item) => String(item.copy_id));
    const bookIds = bookList.map((item) => String(item.book_id));

    const isGrnEntered = grn_no && grn_no.trim() !== "";

    // Build payload
    let requestData = {
      issueddate: issuedDate,
      copy_id: copyIds,
      book_id: bookIds,
    };

    // STUDENT MODE
    if (selectedType === "student") {
      requestData.member_type = "S";

      if (isGrnEntered) {
        // Search & issue by GRN only
        requestData.grn_no = grn_no;
      } else {
        // Issue by class + section + member_id
        requestData.class_id = selectedStudentId || "";
        requestData.section_id = selectedSectionId || "";
        requestData.member_id = selectedStaffId || ""; // student member ID
        requestData.grn_no = ""; // empty when not using GRN search
      }
    }

    // STAFF MODE
    if (selectedType === "staff") {
      requestData.member_type = "T";
      requestData.member_id = selectedStaffId || "";
    }

    // console.log("Final Payload:", requestData);

    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.post(
        `${API_URL}/api/issue_book`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.status === true) {
        toast.success("Book Issued Successfully!");
        setBookList([]);
        setBookDetails(null);
        // setAccessionNo("");
        // setSelectedStudentId("");
        // setGrnNo("");
        // setSelectedStaffId("");
        grnInputRef.current?.focus();
        handleSearch();
        const today = new Date().toISOString().slice(0, 10);
        setIssuedDate(today);
      } else {
        toast.error(response.data.message || "Failed to issue book");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  // console.log("row", timetable);

  const normalizedData = Array.isArray(timetable)
    ? timetable
    : Array.isArray(timetable?.data)
      ? timetable.data
      : [];

  const filteredSections = normalizedData.filter((student) => {
    const searchLower = searchTerm.toLowerCase().trim();
    const accessionNo = String(student?.copy_id || "").toLowerCase();

    return accessionNo.includes(searchLower);
  });

  const displayedSections = filteredSections.slice(currentPage * pageSize);

  // const handleAddBook = async () => {
  //   try {
  //     // Check if accessionNo is valid
  //     if (!accessionNo.trim()) {
  //       setBookError("Please enter a valid accession number");
  //       return;
  //     }

  //     //  Fetch book info if not in preview
  //     let book = bookPreview;
  //     if (!bookPreview || bookPreview.copy_id !== accessionNo) {
  //       const response = await axios.post(
  //         `${API_URL}/api/library/get_book_by_copy`,
  //         { copy_id: accessionNo },
  //         {
  //           headers: {
  //             Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  //           },
  //         },
  //       );

  //       if (!response.data || response.data.length === 0) {
  //         setBookError("No book found for this accession no.");
  //         return;
  //       }

  //       book = response.data[0];
  //     }

  //     // Fetch due date
  //     const dueDate = await fetchDueDate();

  //     // ✅ Student limit check
  //     const alreadyIssuedCount = Array.isArray(timetable)
  //       ? timetable.length
  //       : 0;
  //     const newBooksCount = bookList.length;
  //     const totalBooks = alreadyIssuedCount + newBooksCount + 1; // +1 for this new book

  //     const isStudent =
  //       selectedType === "student" || (grn_no && grn_no.trim() !== "");

  //     if (isStudent && totalBooks > 2) {
  //       toast.error("More than 2 books cannot be issued to a student");
  //       return;
  //     }

  //     //  Add book to list
  //     setBookList((prev) => [
  //       ...prev,
  //       {
  //         copy_id: book.copy_id || accessionNo,
  //         book_title: book.book_title || bookPreview?.book_title,
  //         call_no: book.call_no || bookPreview?.call_no,
  //         category_name: book.category_name || bookPreview?.category_name,
  //         due_date: dueDate ?? "-", // flatten due date
  //         book_id: book.book_id || bookPreview?.book_id,
  //       },
  //     ]);

  //     // reset input & preview
  //     setAccessionNo("");
  //     setBookPreview(null);
  //     setBookError("");
  //   } catch (error) {
  //     console.error("Error adding book:", error);
  //     setBookError("Failed to add book.");
  //   }
  // };

  // work correct for more than two book validation
  // const handleAddBook = async () => {
  //   try {
  //     if (
  //       selectedType === "student" &&
  //       filteredSections.length >= 2 &&
  //       filteredSections.return_date === "0000-00-00"
  //     ) {
  //       toast.error("First return the book, then issue another book.");
  //       return;
  //     }
  //     if (selectedType === "student" && bookList.length >= 2) {
  //       toast.error("More than two books not issued for student.");
  //       return;
  //     }

  //     if (!accessionNo.trim()) {
  //       setBookError("Please enter a valid accession number");
  //       return;
  //     }

  //     let book = bookPreview;
  //     if (!bookPreview || bookPreview.copy_id !== accessionNo) {
  //       const response = await axios.post(
  //         `${API_URL}/api/library/get_book_by_copy`,
  //         { copy_id: accessionNo },
  //         {
  //           headers: {
  //             Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  //           },
  //         },
  //       );

  //       if (!response.data || response.data.length === 0) {
  //         setBookError("No book found for this accession no.");
  //         return;
  //       }

  //       book = response.data[0];
  //     }

  //     const dueDate = await fetchDueDate();

  //     //  Student limit validation using filteredSection
  //     const isStudent =
  //       selectedType === "student" || (grn_no && grn_no.trim() !== "");

  //     if (isStudent && filteredSections.length >= 2) {
  //       toast.error("More than two books not issued for student.");
  //       return;
  //     }

  //     setBookList((prev) => [
  //       ...prev,
  //       {
  //         copy_id: book.copy_id || accessionNo,
  //         book_title: book.book_title || bookPreview?.book_title,
  //         call_no: book.call_no || bookPreview?.call_no,
  //         category_name: book.category_name || bookPreview?.category_name,
  //         due_date: dueDate ?? "-",
  //         book_id: book.book_id || bookPreview?.book_id,
  //       },
  //     ]);

  //     setAccessionNo("");
  //     setBookPreview(null);
  //     setBookError("");
  //   } catch (error) {
  //     console.error("Error adding book:", error);
  //     setBookError("Failed to add book.");
  //   }
  // };

  const handleAddBook = async () => {
    try {
      const isStudent = selectedType === "student";

      if (isStudent) {
        const issuedBooks = Array.isArray(filteredSections)
          ? filteredSections
          : [];

        // Check if ANY book not returned
        const hasActiveBook = issuedBooks.some((book) => {
          return (
            book.return_date === "0000-00-00" ||
            book.return_date === null ||
            book.return_date === "" ||
            book.return_date === undefined
          );
        });

        // If even 1 active book exists  block
        if (hasActiveBook) {
          toast.error(
            "Please return your current book before getting a new one.",
          );
          return;
        }

        // Same time more than 2 books
        if (bookList.length >= 2) {
          toast.error("More than 2 books cannot be issued.");
          return;
        }
      }

      if (!accessionNo.trim()) {
        setBookError("Please enter a valid accession number");
        return;
      }

      let book = bookPreview;

      if (!bookPreview || bookPreview.copy_id !== accessionNo) {
        const response = await axios.post(
          `${API_URL}/api/library/get_book_by_copy`,
          { copy_id: accessionNo },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          },
        );

        if (!response.data || response.data.length === 0) {
          setBookError("No book found for this accession no.");
          return;
        }

        book = response.data[0];

        // if (book.status !== "A") {
        //   toast.error("This book is already issued.");
        //   return;
        // }
        // if (book.status !== "L") {
        //   toast.error("This book is not available.");
        //   return;
        // }

        if (book.status !== "A") {
          let message = "This book is already issued.";

          if (book.status === "L") {
            message = "This book is not available.";
          } else if (book.status === "O") {
            message = "This book is not available.";
          } else if (book.status === "D") {
            message = "This book is not available.";
          }

          toast.error(message);
          return;
        }
      }

      const dueDate = await fetchDueDate();

      setBookList((prev) => [
        ...prev,
        {
          copy_id: book.copy_id || accessionNo,
          book_title: book.book_title || "",
          call_no: book.call_no || "",
          category_name: book.category_name || "",
          due_date: dueDate ?? "-",
          book_id: book.book_id || "",
        },
      ]);

      setAccessionNo("");
      setBookPreview(null);
      setBookError("");
    } catch (error) {
      console.error("Error adding book:", error);
      setBookError("Failed to add book.");
    }
  };

  return (
    <>
      <div
        className={`mx-auto p-4 transition-all duration-700 ease-[cubic-bezier(0.4, 0, 0.2, 1)] transform ${
          showStudentReport
            ? "w-full md:w-[100%] scale-100"
            : "w-full md:w-[100%] scale-[0.98]"
        }`}
      >
        <ToastContainer />
        <div className="card rounded-md ">
          {!showStudentReport && (
            <>
              <div className=" card-header mb-4 flex justify-between items-center ">
                <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
                  Issue Book
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
            </>
          )}

          {!showStudentReport && (
            <>
              {/* {timetable.length === 0 && !loadingForSearch && ( */}
              <div className="md:absolute md:right-2 md:top-[32%] mb-5 text-gray-500">
                <div className="mx-auto w-fit px-2 py-1 bg-blue-50 border border-blue-300 text-blue-800 text-sm rounded flex items-center gap-2">
                  <FaInfoCircle className="text-blue-800" />

                  <span>
                    Please select mandatory fields. Click on the <b>Browse</b>{" "}
                    button to issue books.
                  </span>
                </div>
              </div>
              {/* )} */}
            </>
          )}

          <>
            {!showStudentReport && (
              <div
                className="w-full px-6 py-4 "
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
              >
                <div className="w-full flex flex-col md:flex-row md:items-start gap-6">
                  {/* Member Type */}
                  <div className="flex flex-col w-full md:w-auto">
                    <label className="text-md mb-1">
                      Member Type <span className="text-red-500">*</span>
                    </label>

                    <div className="flex items-center border border-gray-300 rounded-md px-4 py-2 bg-white">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="userType"
                          value="student"
                          checked={selectedType === "student"}
                          onChange={() => setSelectedType("student")}
                          className="accent-pink-600"
                        />
                        <span>Student</span>
                      </label>

                      <label className="flex items-center gap-1 ml-4 cursor-pointer">
                        <input
                          type="radio"
                          name="userType"
                          value="staff"
                          checked={selectedType === "staff"}
                          onChange={() => setSelectedType("staff")}
                          className="accent-pink-600"
                        />
                        <span>Staff</span>
                      </label>
                    </div>
                  </div>

                  {/* STUDENT FIELDS */}
                  {selectedType === "student" && (
                    <>
                      {/* Select Class */}
                      <div className="flex flex-col w-full md:w-auto">
                        <label className="text-md mb-1">
                          Select Class <span className="text-red-500">*</span>
                        </label>

                        <div className="w-[160px]">
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

                        {classError && (
                          <p className="text-red-500 text-sm mt-1">
                            {classError}
                          </p>
                        )}
                      </div>

                      {/* Member Name */}
                      <div className="flex flex-col w-full md:w-auto">
                        <label className="text-md mb-1">
                          Member Name <span className="text-red-500">*</span>
                        </label>

                        <div className="w-[230px]">
                          <Select
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            value={selectedStaff}
                            onChange={handleMemberSelect}
                            options={staffOptions}
                            placeholder="Select"
                            isSearchable
                            isClearable
                          />
                        </div>

                        {staffError && (
                          <p className="text-red-500 text-sm mt-1">
                            {staffError}
                          </p>
                        )}
                      </div>

                      {/* Issue Date */}
                      <div className="flex flex-col w-full md:w-auto">
                        <label className="text-md mb-1">Issue Date</label>
                        <input
                          type="date"
                          value={issuedDate}
                          min={minDate}
                          max={today}
                          onChange={(e) => setIssuedDate(e.target.value)}
                          className="border border-gray-300 rounded px-3 py-2 w-[160px]"
                        />
                      </div>

                      {/* GRN Input */}
                      <div className="flex flex-col w-full md:w-auto">
                        <label className="text-md mb-1">
                          Enter/Scan GRN No.
                        </label>
                        <input
                          type="text"
                          ref={grnInputRef}
                          value={grn_no}
                          onChange={(e) => setGrnNo(e.target.value)}
                          placeholder="Enter"
                          className="border border-gray-300 rounded px-3 py-2 w-[160px]"
                          maxLength={8}
                        />
                      </div>
                    </>
                  )}

                  {/* STAFF FIELDS */}
                  {selectedType === "staff" && (
                    <>
                      <div className="flex flex-col w-full md:w-auto">
                        <label className="text-md mb-1">
                          Member Name <span className="text-red-500">*</span>
                        </label>

                        <div className="w-[250px]">
                          <Select
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            value={selectedStaff}
                            onChange={handleMemberSelect}
                            options={staffOptions}
                            placeholder="Select"
                            isSearchable
                            isClearable
                          />
                        </div>
                      </div>

                      <div className="flex flex-col w-full md:w-auto">
                        <label className="text-md mb-1">Issue Date</label>
                        <input
                          type="date"
                          value={issuedDate}
                          min={minDate}
                          max={today}
                          onChange={(e) => setIssuedDate(e.target.value)}
                          className="border border-gray-300 rounded px-3 py-2 w-[160px]"
                        />
                      </div>
                    </>
                  )}

                  {/* Browse Button (FIXED ALIGNMENT) */}
                  <div className="flex flex-col justify-end h-full mt-6 md:mt-6">
                    <button
                      type="button"
                      onClick={handleSearch}
                      className="h-10 px-6 text-white rounded font-semibold"
                      style={{ backgroundColor: "#2196F3" }}
                    >
                      {loadingForSearch ? "Browsing.." : "Browse"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showStudentReport && (
              <>
                <div className="w-full">
                  <div className="card mx-auto lg:w-full shadow-lg">
                    <div className="p-2 px-3 bg-gray-100 border-none">
                      <div className="w-full flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-2 w-full">
                          <h3 className="text-gray-700 text-[1.1em] lg:text-xl whitespace-nowrap">
                            Issue Book
                          </h3>

                          <div
                            className="flex flex-wrap items-center w-full gap-2 bg-blue-50 border-l-2 border-r-2 border-pink-500 rounded-md shadow-md px-3 py-2"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleSearch();
                              }
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <label className="text-sm whitespace-nowrap">
                                Member Type{" "}
                                <span className="text-red-500">*</span>
                              </label>

                              <div className="flex items-center border border-gray-300 rounded-md px-2 py-1 bg-white text-sm">
                                <label className="flex items-center gap-1 cursor-pointer">
                                  <input
                                    type="radio"
                                    name="userType"
                                    value="student"
                                    checked={selectedType === "student"}
                                    onChange={() => setSelectedType("student")}
                                    className="accent-pink-600"
                                  />
                                  <span>Student</span>
                                </label>

                                <label className="flex items-center gap-1 ml-3 cursor-pointer">
                                  <input
                                    type="radio"
                                    name="userType"
                                    value="staff"
                                    checked={selectedType === "staff"}
                                    onChange={() => setSelectedType("staff")}
                                    className="accent-pink-600"
                                  />
                                  <span>Staff</span>
                                </label>
                              </div>
                            </div>

                            {selectedType === "student" && (
                              <div className="flex items-center gap-2">
                                <label className="text-sm whitespace-nowrap">
                                  Class <span className="text-red-500">*</span>
                                </label>

                                <div className="w-full sm:w-[140px]">
                                  <Select
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    value={selectedStudent}
                                    onChange={handleStudentSelect}
                                    options={studentOptions}
                                    placeholder="Select"
                                    isClearable
                                    isSearchable
                                    className="text-sm"
                                  />
                                </div>
                              </div>
                            )}

                            <div className="flex items-center gap-2">
                              <label className="text-sm whitespace-nowrap">
                                Name <span className="text-red-500">*</span>
                              </label>

                              <div className="w-full ">
                                <Select
                                  menuPortalTarget={document.body}
                                  menuPosition="fixed"
                                  value={selectedStaff}
                                  onChange={handleMemberSelect}
                                  options={staffOptions}
                                  placeholder="Select"
                                  isClearable
                                  isSearchable
                                  className="text-sm"
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <label className="text-sm whitespace-nowrap">
                                Issue Date
                              </label>
                              <input
                                type="date"
                                value={issuedDate}
                                onChange={(e) => setIssuedDate(e.target.value)}
                                className="border border-gray-300 rounded px-2 py-1 text-sm w-full sm:w-[140px]"
                              />
                            </div>

                            {selectedType === "student" && (
                              <div className="flex items-center gap-2">
                                <label className="text-sm whitespace-nowrap">
                                  GRN No.
                                </label>
                                <input
                                  type="text"
                                  maxLength={8}
                                  value={grn_no}
                                  onChange={(e) => setGrnNo(e.target.value)}
                                  className="border border-gray-300 rounded px-2 py-1 text-sm w-full sm:w-[100px]"
                                  placeholder="Enter"
                                />
                              </div>
                            )}

                            {/* Button */}
                            <button
                              type="button"
                              onClick={handleSearch}
                              className="h-9 text-white px-4 rounded font-medium text-sm whitespace-nowrap"
                              style={{ backgroundColor: "#2196F3" }}
                            >
                              {loadingForSearch ? "Browsing..." : "Browse"}
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-end lg:justify-start">
                          <RxCross1
                            className="text-base text-red-600 cursor-pointer hover:bg-red-100 rounded"
                            onClick={() => {
                              setShowStudentReport(false);
                              setBookList([]);
                              setSelectedStaff("");
                              setSelectedStudent("");
                              setGrnNo("");
                              setTimeout(() => {
                                grnInputRef.current?.focus();
                              }, 0);
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div
                      className=" relative w-[97%] mb-2 h-1  mx-auto bg-red-700"
                      style={{
                        backgroundColor: "#C03078",
                      }}
                    ></div>
                    <div className="pl-2 pr-2 w-full">
                      {selectedType === "student" && memberDetails && (
                        <div className="flex justify-center mb-3">
                          <div className="bg-pink-50 rounded-lg px-4 py-2 flex gap-4 items-center shadow-sm">
                            <span className="font-semibold text-blue-800 text-sm md:text-base">
                              {[
                                memberDetails.first_name,
                                memberDetails.mid_name,
                                memberDetails.last_name,
                              ]
                                .filter(Boolean)
                                .map((name) => camelCase(name))
                                .join(" ")}
                            </span>
                            <span className="font-semibold text-blue-800 text-sm md:text-base">
                              |
                            </span>

                            <span className="font-semibold text-pink-800 text-sm md:text-base">
                              GRN No: {memberDetails.reg_no}
                            </span>
                            <span className="font-semibold text-blue-800 text-sm md:text-base">
                              |
                            </span>

                            <span className="font-semibold text-pink-800 text-sm md:text-base">
                              Class:{" "}
                              {classSection
                                ? `${classSection.classname} ${classSection.sectionname}`
                                : " "}
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="w-full leading-normal">
                        <h2 className="text-sm md:text-base font-medium text-center flex items-center justify-center gap-2 text-black">
                          <i
                            className="fa-solid fa-book-open"
                            style={{ color: "#C03078" }}
                          ></i>
                          View Issued Books
                        </h2>

                        <table className="min-w-full leading-normal table-auto mb-2">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                Sr No.
                              </th>
                              <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                Accession No.
                              </th>
                              <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                Book Title
                              </th>
                              <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                Author
                              </th>
                              <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                Category
                              </th>
                              <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                Issue Date
                              </th>
                              <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                Due Date
                              </th>
                            </tr>
                          </thead>

                          <tbody className="text-base">
                            {displayedSections.length > 0 ? (
                              displayedSections.map((item, index) => (
                                <tr key={item.id} className="border">
                                  <td className="px-2 py-1 text-center border">
                                    {index + 1}
                                  </td>
                                  <td className="px-2 py-1 text-center border">
                                    {item.copy_id}
                                  </td>
                                  <td className="px-2 py-1 text-center border">
                                    {item.book_title}
                                  </td>
                                  <td className="px-2 py-1 text-center border">
                                    {item.author}
                                  </td>
                                  <td className="px-2 py-1 text-center border">
                                    {item.category_name}
                                  </td>
                                  <td className="px-2 py-1 text-center border">
                                    {item.issue_date}
                                  </td>
                                  <td className="px-2 py-1 text-center border">
                                    {item.due_date}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan="7"
                                  className="text-center text-red-600 font-semibold py-3 border"
                                >
                                  No books issued
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>

                        <div className="w-full mb-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-sm border-l-4 border-r-4 border-pink-400 flex items-center justify-center">
                          <div className="flex items-center space-x-3">
                            <div className="bg-blue-600 text-white px-2 rounded-lg shadow-md">
                              <FontAwesomeIcon icon={faBook} size="sm" />
                            </div>

                            <h2 className="text-sm md:text-base font-semibold text-gray-800">
                              Select Book
                            </h2>
                          </div>
                        </div>

                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleSearch();
                          }}
                        >
                          <div className="flex flex-wrap gap-6 pl-4 pb-4 pt-2">
                            <div className="flex flex-col w-[21%] min-w-[100px]">
                              <label className="text-md whitespace-nowrap">
                                Accession No.
                              </label>

                              <input
                                type="text"
                                value={accessionNo}
                                onChange={(e) => {
                                  setAccessionNo(e.target.value);
                                  setBookError("");
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddBook();
                                  }
                                }}
                                placeholder="Enter"
                                className="border border-gray-300 rounded-md px-3 py-1 w-full"
                              />

                              {bookError && (
                                <p className="text-red-500 text-sm mt-1">
                                  {bookError}
                                </p>
                              )}
                            </div>

                            <div className="flex flex-row items-center gap-3 w-[30%] min-w-[250px]">
                              <label className="text-md whitespace-nowrap">
                                Call / Category
                              </label>
                              <input
                                type="text"
                                value={
                                  bookPreview
                                    ? `${bookPreview.call_no} / ${bookPreview.category_name}`
                                    : ""
                                }
                                readOnly
                                className="border border-gray-300 bg-gray-200 text-gray-600 rounded-md px-3 py-1 w-full cursor-not-allowed"
                              />
                            </div>

                            <div className="flex flex-row items-center gap-3 w-[30%] min-w-[260px]">
                              <label className="text-md whitespace-nowrap">
                                Book Title
                              </label>
                              <input
                                type="text"
                                value={bookPreview?.book_title || ""}
                                readOnly
                                className="border border-gray-300 bg-gray-200 text-gray-600 rounded-md px-3 py-1 w-full cursor-not-allowed"
                              />
                            </div>

                            <div className="flex items-center w-[12%] min-w-[120px]">
                              {/* <button
                                type="button"
                                onClick={handleAddBook}
                                style={{ backgroundColor: "#2196F3" }}
                                className={`h-8 px-6 rounded font-bold ${
                                  selectedType === "S" &&
                                  // grn_no?.trim() &&
                                  bookList.length >= 2
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-blue-500 text-white"
                                }`}
                              >
                                Add
                              </button> */}
                              <button
                                type="button"
                                onClick={handleAddBook}
                                disabled={
                                  selectedType === "S" && bookList.length >= 2
                                }
                                className={`h-8 px-6 rounded font-bold ${
                                  selectedType === "S" && bookList.length >= 2
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-blue-500 text-white"
                                }`}
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        </form>

                        {bookList.length > 0 && (
                          <>
                            <h2 className="text-sm md:text-base font-medium text-center flex items-center justify-center gap-2 text-black">
                              <i
                                className="fa-solid fa-book-open"
                                style={{ color: "#C03078" }}
                              ></i>
                              Selected Books
                            </h2>

                            <table className="min-w-full leading-normal table-auto mb-2">
                              <thead>
                                <tr className="bg-gray-100">
                                  <th className="px-2 py-2 border text-center">
                                    Sr No.
                                  </th>
                                  <th className="px-2 py-2 border text-center">
                                    Accession No.
                                  </th>
                                  <th className="px-2 py-2 border text-center">
                                    Book Title
                                  </th>
                                  <th className="px-2 py-2 border text-center">
                                    Due Date
                                  </th>
                                  <th className="px-2 py-2 border text-center">
                                    Remove Book
                                  </th>
                                </tr>
                              </thead>

                              <tbody>
                                {bookList.map((item, index) => (
                                  <tr key={index} className="border">
                                    <td className="px-2 py-1 text-center border">
                                      {index + 1}
                                    </td>
                                    <td className="px-2 py-1 text-center border">
                                      {item.copy_id}
                                    </td>
                                    <td className="px-2 py-1 text-center border">
                                      {item.book_title}
                                    </td>
                                    <td className="px-2 py-1 text-center border">
                                      {item.due_date || "-"}
                                    </td>

                                    <td className="px-2 py-1 text-center border">
                                      <button
                                        className="text-red-500"
                                        onClick={() => {
                                          setBookList((prev) =>
                                            prev.filter((_, i) => i !== index),
                                          );
                                          setAccessionNo("");
                                          setBookDetails(null);
                                        }}
                                      >
                                        <FontAwesomeIcon icon={faTimes} />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>

                            {/* Issue Book Button */}
                            {bookList.length > 0 && (
                              <div className="flex justify-end mt-4 mb-4">
                                <button
                                  type="button"
                                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded"
                                  onClick={handleIssueBook}
                                >
                                  Issue Book
                                </button>
                              </div>
                            )}
                          </>
                        )}
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

export default IssueBook;
