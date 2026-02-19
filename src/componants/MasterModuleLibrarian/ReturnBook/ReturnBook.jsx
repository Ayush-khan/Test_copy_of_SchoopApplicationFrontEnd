import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faTimes, faCheck } from "@fortawesome/free-solid-svg-icons";

const ReturnBook = () => {
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

  const [selectedCopies, setSelectedCopies] = useState([]);

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
  const [memberDetails, setMemberDetails] = useState([]);

  const academicyrfrom = localStorage.getItem("academic_yr_from");
  const minDate = academicyrfrom
    ? new Date(academicyrfrom).toISOString().split("T")[0]
    : "";

  const [accessionNo, setAccessionNo] = useState("");
  const [showMemberType, setShowMemberType] = useState("");

  const [missingStudentsData, setMissingStudentData] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [autoSelectedCopy, setAutoSelectedCopy] = useState(null);

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
    // setStudentError("");
    // setClassError("");
    setSelectedStudent(selectedOption);

    if (selectedOption) {
      setSelectedStudentId(selectedOption.class_id);
      setSelectedSectionId(selectedOption.section_id);

      setSelectedStaff(null);
      setSelectedStaffId(null);
      setSelectedStaffName(null);

      setStafflist([]);
      // setClassError("");
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
            type: "S",
            class_id: selectedStudentId,
            section_id: selectedSectionId,
          }
        : {
            type: "T",
          };

    try {
      const response = await axios.post(
        `${API_URL}/api/members/issued_books`,
        params,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

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
    // setStudentError("");
    // setClassError("");
    // setStaffError("");
    setTimetable([]);
    setShowStudentReport(false);
    setGrnNo("");
  }, [selectedType]);

  const handleSearch = async () => {
    setTimetable([]);
    setMissingStudentData([]);
    setShowStudentReport(false);
    setLoadingForSearch(true);

    try {
      const token = localStorage.getItem("authToken");
      let finalResults = [];

      const isAccessionEntered = accessionNo?.trim() !== "";
      const isMemberSelected =
        selectedStaffId !== "" && selectedStaffId !== null;
      const isGrnNo = grn_no?.trim() !== "";

      if (!isAccessionEntered && !isMemberSelected && !isGrnNo) {
        toast.error("Please enter at least one search criteria.");
        return;
      }

      /* ----------------------------------
       🔍 ACCESSION / GRN SEARCH
    ---------------------------------- */
      if (isAccessionEntered || isGrnNo) {
        const url = isAccessionEntered
          ? `${API_URL}/api/issue_book_details?type=accession&copy_id=${accessionNo}`
          : `${API_URL}/api/issue_book_details?type=grno&grn_no=${grn_no}&reg_no=${grn_no}`;

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const books = res.data?.data?.book || [];
        const member = res.data?.data?.member;

        // console.log("GRN BOOKS:", books);

        if (books.length === 0) {
          toast.error("No issued books found!");
          return;
        }

        finalResults = books;
        setMemberDetails(member);
        setShowMemberType(member?.member_type);
      } else if (selectedType && selectedStaffId) {
        /* ----------------------------------
       🔍 MEMBER SEARCH
    ---------------------------------- */
        const mType = selectedType === "student" ? "S" : "T";

        const issuedUrl = `${API_URL}/api/issue_book_details?type=records&member_id=${selectedStaffId}&m_type=${mType}`;

        const res = await axios.get(issuedUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const books = res.data?.data?.book || [];
        const member = res.data?.data?.member;

        // console.log("MEMBER BOOKS:", books);

        if (books.length === 0) {
          toast.error("No issued books found.");
          return;
        }

        finalResults = books;
        setMemberDetails(member);
        setShowMemberType(member?.member_type);
      }

      /* ----------------------------------
       ✅ FINAL SET
    ---------------------------------- */
      setTimetable(finalResults);
      setPageCount(Math.ceil(finalResults.length / pageSize));
      setShowStudentReport(true);

      // setAccessionNo("");
      // setGrnNo("");
    } catch (error) {
      console.error("Search error:", error);

      // Axios error with response (backend replied)
      if (error.response) {
        const { status, data } = error.response;

        // 404 from backend
        if (status === 404 && data?.message) {
          toast.error(data.message);
        } else {
          toast.error(data?.message || "Failed to fetch data.");
        }
      }
      // No response (network / server down)
      else {
        toast.error("Server not reachable. Please try again.");
      }
    } finally {
      setLoadingForSearch(false);
      setIsSubmitting(false);
    }
  };

  const filteredSections = (Array.isArray(timetable) ? timetable : []).filter(
    (student) => {
      const searchLower = searchTerm.toLowerCase();

      const accessionNo = student?.copy_id || "";

      return accessionNo.includes(searchLower);
    },
  );

  const displayedSections = filteredSections.slice(currentPage * pageSize);

  const handleCheckboxChange = (copy_id) => {
    setAutoSelectedCopy(null);
    setSelectedCopies((prev) => {
      if (prev.includes(copy_id)) {
        return prev.filter((x) => x !== copy_id); // unselect
      } else {
        return [...prev, copy_id]; // select
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedCopies.length === displayedSections.length) {
      setSelectedCopies([]); // unselect all
    } else {
      setSelectedCopies(displayedSections.map((item) => item.copy_id)); // select all
    }
  };

  const isAllSelected =
    displayedSections.length > 0 &&
    selectedCopies.length === displayedSections.length;

  // useEffect(() => {
  //   if (!accessionNo) return;

  //   const exists = displayedSections.some(
  //     (item) => item.copy_id === accessionNo,
  //   );

  //   if (!exists) return;

  //   setSelectedCopies((prev) => {
  //     // 🚨 THIS LINE STOPS INFINITE LOOP
  //     if (prev.length === 1 && prev[0] === accessionNo) {
  //       return prev; // no state update
  //     }
  //     return [accessionNo];
  //   });
  // }, [accessionNo, displayedSections]);

  useEffect(() => {
    if (!accessionNo) {
      // 🔥 clear ONLY auto-selection
      setAutoSelectedCopy(null);
      return;
    }

    const matched = displayedSections.find(
      (item) => String(item.copy_id) === String(accessionNo),
    );

    if (!matched) return;

    setAutoSelectedCopy(matched.copy_id);

    setSelectedCopies((prev) => {
      // prevent infinite loop & override
      if (prev.length === 1 && prev[0] === matched.copy_id) {
        return prev;
      }
      return [matched.copy_id];
    });
  }, [accessionNo, displayedSections]);

  const handleReturnBook = async ({
    selectedCopyIds,
    memberId,
    memberType,
    dateOfReturn,
  }) => {
    // validation
    if (!selectedCopyIds || selectedCopyIds.length === 0) {
      // console.log("NO BOOKS SELECTED");
      toast.error("Please select at least one book");
      return;
    }

    if (!memberId || !memberType) {
      // console.log("MEMBER MISSING");
      toast.error("Member information is missing");
      return;
    }

    if (!dateOfReturn) {
      // console.log("DATE MISSING");
      toast.error("Date of return is required");
      return;
    }

    // console.log("VALIDATION PASSED");

    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");

      const payload = {
        operation: "return",
        selector: selectedCopyIds,
        member_id: memberId,
        member_type: memberType, // "S" for student, "T" for teacher/staff
        dateofreturn: dateOfReturn,
      };

      const response = await axios.post(
        `${API_URL}/api/library/return_book`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // console.log("response", response);
      toast.success("Book Returned Successfully");
      setShowStudentReport(false);
      setSelectedCopies([]); // reset selections
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReissueBook = async ({
    selectedCopyIds,
    bookIds, // <-- new array
    memberId,
    memberType,
    dateOfReturn,
  }) => {
    if (!selectedCopyIds || selectedCopyIds.length === 0) {
      // console.log("NO BOOKS SELECTED");
      toast.error("Please select at least one book");
      return;
    }

    if (!bookIds || bookIds.length !== selectedCopyIds.length) {
      // console.log("BOOK IDS MISSING OR MISMATCHED");
      toast.error("Book IDs are missing or do not match selected copies");
      return;
    }

    if (!memberId || !memberType) {
      // console.log("MEMBER MISSING");
      toast.error("Member information is missing");
      return;
    }

    if (!dateOfReturn) {
      // console.log("DATE MISSING");
      toast.error("Date of return is required");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");

      const payload = {
        operation: "reissue",
        selector: selectedCopyIds,
        book_id: bookIds, // <-- send the book IDs array
        member_id: memberId,
        member_type: memberType,
        dateofreturn: dateOfReturn,
      };

      const response = await axios.post(
        `${API_URL}/api/library/reissue_book`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // console.log("API Response:", response.data);
      toast.success("Book Reissue Successfully..");

      setSelectedCopies([]);
      setShowStudentReport(false);
      return response.data;
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
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
                  Return Book
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

          <>
            {!showStudentReport && (
              <form
                onSubmit={(e) => {
                  e.preventDefault(); // prevent page reload
                  handleSearch();
                }}
                className="w-full px-6 py-2"
              >
                <div className="w-full flex flex-col md:flex-row md:items-start gap-6">
                  <div className="flex flex-col w-full md:w-auto">
                    <label className="text-md mb-1">Accession No.</label>
                    <input
                      type="text"
                      value={accessionNo}
                      onChange={(e) => setAccessionNo(e.target.value)}
                      placeholder="Enter"
                      className="border border-gray-300 rounded px-3 py-2 w-[160px]"
                      maxLength={8}
                    />
                  </div>
                  <div className="flex flex-col w-full md:w-auto">
                    <label className="text-red-500 font-semibold mt-4">
                      OR
                    </label>
                  </div>
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

                  {selectedType === "student" && (
                    <>
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
                      </div>

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
                      </div>

                      <div className="flex flex-col w-full md:w-auto">
                        <label className="text-md mb-1">
                          Enter/Scan GRN No.
                        </label>
                        <input
                          type="text"
                          value={grn_no}
                          onChange={(e) => setGrnNo(e.target.value)}
                          placeholder="Enter"
                          className="border border-gray-300 rounded px-3 py-2 w-[160px]"
                          maxLength={8}
                        />
                      </div>
                    </>
                  )}

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
                    </>
                  )}

                  <div className="flex flex-col justify-end h-full mt-6 md:mt-6">
                    <button
                      type="submit"
                      className="h-10 px-6 text-white rounded font-semibold"
                      style={{ backgroundColor: "#2196F3" }}
                    >
                      {loadingForSearch ? "Browsing.." : "Browse"}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {showStudentReport && (
              <>
                <div className="w-full">
                  <div className="card mx-auto lg:w-full shadow-lg">
                    <div className="p-2 px-3 bg-gray-100 border-none flex items-center justify-between">
                      <div className="w-full flex flex-row items-center justify-between ">
                        <h3 className="text-gray-700 mt-1 text-[1.1em] lg:text-xl text-nowrap mr-2">
                          Return Book
                        </h3>
                        <div
                          className="flex items-center w-full"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleSearch();
                            }
                          }}
                        >
                          <div
                            className="bg-blue-50 border-l-2 border-r-2 text-[0.9em] border-pink-500 rounded-md shadow-md mx-auto px-6 py-2"
                            style={{
                              overflowX: "auto",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <div
                              className="flex items-center gap-x-1 text-blue-800 font-medium"
                              style={{ flexWrap: "nowrap" }}
                            ></div>
                            <div className="flex items-center gap-x-4 flex-wrap">
                              <div className="flex items-center gap-x-1">
                                <label className="text-sm whitespace-nowrap">
                                  Accession No.
                                </label>
                                <input
                                  type="text"
                                  maxLength={8}
                                  value={accessionNo}
                                  onChange={(e) =>
                                    setAccessionNo(e.target.value)
                                  }
                                  className="border border-gray-300 rounded px-1 py-2 text-sm w-[80px]"
                                  placeholder="Enter"
                                />
                              </div>
                              <div className="flex flex-col w-full md:w-auto">
                                <label className="text-red-500 font-semibold mt-1">
                                  OR
                                </label>
                              </div>

                              <div className="flex items-center gap-x-1">
                                <label className="text-sm whitespace-nowrap">
                                  Member Type{" "}
                                  <span className="text-red-500">*</span>
                                </label>

                                <div className="flex items-center border border-gray-300 rounded-md px-2 py-2 bg-white text-sm">
                                  <label className="flex items-center gap-1 cursor-pointer">
                                    <input
                                      type="radio"
                                      name="userType"
                                      value="student"
                                      checked={selectedType === "student"}
                                      onChange={() =>
                                        setSelectedType("student")
                                      }
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
                                <>
                                  <div className="flex items-center gap-x-1">
                                    <label className="text-sm whitespace-nowrap">
                                      Class{" "}
                                      <span className="text-red-500">*</span>
                                    </label>

                                    <div className="w-[100px]">
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
                                </>
                              )}

                              <div className="flex items-center gap-x-1">
                                <label className="text-sm whitespace-nowrap">
                                  Name <span className="text-red-500">*</span>
                                </label>

                                <div className="w-[100px]">
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

                              {selectedType === "student" && (
                                <>
                                  <div className="flex items-center gap-x-1">
                                    <label className="text-sm whitespace-nowrap">
                                      GRN No.
                                    </label>
                                    <input
                                      type="text"
                                      maxLength={8}
                                      value={grn_no}
                                      onChange={(e) => setGrnNo(e.target.value)}
                                      className="border border-gray-300 rounded px-1 py-2 text-sm w-[80px]"
                                      placeholder="Enter"
                                    />
                                  </div>
                                </>
                              )}

                              <button
                                type="button"
                                onClick={handleSearch}
                                className="h-8 text-white px-1 rounded font-medium text-sm"
                                style={{ backgroundColor: "#2196F3" }}
                              >
                                {loadingForSearch ? "Browsing.." : "Browse"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex mb-1.5 flex-col md:flex-row gap-x-6 justify-center md:justify-end ml-2">
                        <RxCross1
                          className="text-base text-red-600 cursor-pointer hover:bg-red-100 rounded"
                          onClick={() => setShowStudentReport(false)}
                        />
                      </div>
                    </div>

                    <div
                      className=" relative w-[97%] mb-2 h-1  mx-auto bg-red-700"
                      style={{
                        backgroundColor: "#C03078",
                      }}
                    ></div>
                    <div className="pl-2 pr-2 w-full">
                      <div className="w-full leading-normal">
                        <h2 className="text-sm md:text-base font-medium text-center flex items-center justify-center gap-2 text-black">
                          <i
                            className="fa-solid fa-book-open"
                            style={{ color: "#C03078" }}
                          ></i>
                          View Members Details
                        </h2>

                        <table className="min-w-full leading-normal table-auto mb-2">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                Name
                              </th>
                              {showMemberType === "S" && (
                                <>
                                  <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                    Roll No.
                                  </th>
                                  <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                    GRN No.
                                  </th>
                                  <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                    Class
                                  </th>
                                </>
                              )}
                            </tr>
                          </thead>

                          <tbody className="text-base">
                            {memberDetails && (
                              <tr className="border">
                                <td className="px-2 py-1 text-center border">
                                  {camelCase(
                                    `${memberDetails.first_name || ""} ${
                                      memberDetails.mid_name || ""
                                    } ${memberDetails.last_name || ""} ${
                                      memberDetails.name || ""
                                    }`.trim(),
                                  )}
                                </td>

                                {showMemberType === "S" && (
                                  <>
                                    <td className="px-2 py-1 text-center border">
                                      {memberDetails.roll_no}
                                    </td>

                                    <td className="px-2 py-1 text-center border">
                                      {memberDetails.reg_no}
                                    </td>

                                    <td className="px-2 py-1 text-center border">
                                      {memberDetails.class_id}
                                    </td>
                                  </>
                                )}
                              </tr>
                            )}
                          </tbody>
                        </table>

                        <div className="w-full mb-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-sm border-l-4 border-r-4 border-pink-400 px-4 py-1">
                          <div className="flex items-center w-full">
                            <div className="w-1/3 flex justify-start">
                              <div className="text-sm md:text-base text-black font-medium flex items-center gap-2">
                                Return On:
                                <input
                                  type="date"
                                  value={issuedDate}
                                  onChange={(e) =>
                                    setIssuedDate(e.target.value)
                                  }
                                  min={minDate}
                                  max={today}
                                  className="border border-gray-300 rounded px-2 py-1"
                                />
                              </div>
                            </div>

                            <div className="w-1/3 flex justify-center">
                              <h2 className="text-sm md:text-base font-medium flex items-center gap-2 text-black">
                                <i
                                  className="fa-solid fa-book-open"
                                  style={{ color: "#C03078" }}
                                ></i>
                                Select Books
                              </h2>
                            </div>

                            <div className="w-1/3"></div>
                          </div>
                        </div>

                        <table className="min-w-full leading-normal table-auto mb-2">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="px-2 w-[7%] text-center lg:px-3 py-2 border text-sm font-semibold">
                                Sr No.
                              </th>

                              <th className="px-2 w-[7%] text-center lg:px-3 py-2 border text-sm font-semibold">
                                <input
                                  type="checkbox"
                                  checked={isAllSelected}
                                  onChange={handleSelectAll}
                                />{" "}
                                Select All
                              </th>

                              <th className="px-2 w-[7%] text-center lg:px-3 py-2 border text-sm font-semibold">
                                Accession No.
                              </th>
                              <th className="px-2 w-[25%]  text-center lg:px-3 py-2 border text-sm font-semibold">
                                Book Title
                              </th>
                              <th className="px-2 w-[8%] text-center lg:px-3 py-2 border text-sm font-semibold">
                                Issue Date
                              </th>
                              <th className="px-2 w-[8%] text-center lg:px-3 py-2 border text-sm font-semibold">
                                Due Date
                              </th>
                            </tr>
                          </thead>

                          <tbody className="text-base">
                            {displayedSections?.map((item, index) => (
                              <tr key={item.copy_id} className="border">
                                <td className="px-2 py-1 text-center border">
                                  {index + 1}
                                </td>

                                <td className="px-2 py-1 text-center border">
                                  <input
                                    type="checkbox"
                                    checked={selectedCopies.includes(
                                      item.copy_id,
                                    )}
                                    onChange={() =>
                                      handleCheckboxChange(item.copy_id)
                                    }
                                  />
                                </td>

                                <td className="px-2 py-1 text-center border">
                                  {item.copy_id}
                                </td>
                                <td className="px-2 py-1 text-center border">
                                  {item.book_title || "-"}
                                </td>
                                <td className="px-2 py-1 text-center border">
                                  {item.issue_date
                                    ? new Date(
                                        item.issue_date,
                                      ).toLocaleDateString("en-GB")
                                    : "-"}
                                </td>
                                <td className="px-2 py-1 text-center border">
                                  {item.due_date
                                    ? new Date(
                                        item.due_date,
                                      ).toLocaleDateString("en-GB")
                                    : "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        <div className="flex justify-end mt-4 mb-4">
                          <button
                            type="button"
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded mr-2"
                            onClick={() => {
                              // console.log("Return button clicked");
                              // console.log(
                              //   "selectedCopies state:",
                              //   selectedCopies,
                              // );
                              // console.log(
                              //   "selectedStaffId:",
                              //   memberDetails.member_id,
                              // );
                              // console.log("selectedType:", selectedType);
                              // console.log("issuedDate:", issuedDate);

                              handleReturnBook({
                                selectedCopyIds: selectedCopies,
                                memberId:
                                  selectedStaffId || memberDetails.member_id,
                                memberType:
                                  selectedType === "student" ? "S" : "T",
                                dateOfReturn: issuedDate,
                              });
                            }}
                          >
                            Return Book
                          </button>

                          <button
                            type="button"
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded mr-2"
                            onClick={() => {
                              // Map selected copy IDs to their corresponding book IDs
                              const selectedBookIds = displayedSections
                                .filter((item) =>
                                  selectedCopies.includes(item.copy_id),
                                )
                                .map((item) => item.book_id);

                              handleReissueBook({
                                selectedCopyIds: selectedCopies,
                                bookIds: selectedBookIds, // <-- send matching book IDs
                                memberId:
                                  selectedStaffId || memberDetails?.member_id,
                                memberType:
                                  selectedType === "student" ? "S" : "T",
                                dateOfReturn: issuedDate,
                              });
                            }}
                          >
                            Re-Issue Book
                          </button>
                        </div>
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

export default ReturnBook;
