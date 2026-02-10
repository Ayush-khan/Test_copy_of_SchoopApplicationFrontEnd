import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faTimes, faCheck } from "@fortawesome/free-solid-svg-icons";

const IssueBook = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [toDate, setToDate] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  const [loadingForSearch, setLoadingForSearch] = useState(false);

  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [timetable, setTimetable] = useState([]);

  const pageSize = 10;
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [showStudentReport, setShowStudentReport] = useState(false);

  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState([]);

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
  const [name, setName] = useState("");
  const [grn_no, setGrnNo] = useState("");
  const [selectedStaffname, setSelectedStaffName] = useState(null);

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

      console.log("roleIDis:", role_id);
      console.log("reg id:", reg_id);
      console.log("academic year", academicyr);

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
        }
      );

      console.log("response", response.data.data);

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
      value: `${cls.class_id}-${cls.section_id}`, // ✅ unique value for dropdown
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
      setSelectedStudentId(selectedOption.class_id); // ✅ class_id only
      setSelectedSectionId(selectedOption.section_id); // ✅ section_id only
    } else {
      setSelectedStudentId(null);
      setSelectedSectionId(null);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    const token = localStorage.getItem("authToken");
    setLoadingExams(true);

    try {
      const response = await axios.get(`${API_URL}/api/staff_list `, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("response staff", response.data);

      setStafflist(response.data);
    } catch (error) {
      toast.error("Error fetching Classes");
      console.error("Error fetching Classes:", error);
    } finally {
      setLoadingExams(false);
    }
  };

  const staffOptions = useMemo(() => {
    if (!stafflist) return [];

    return stafflist.map((cls) => ({
      value: `${cls.teacher_id}`,
      label: `${cls.name}`,
    }));
  }, [stafflist]);

  const handleStaffSelect = (selectedOption) => {
    setSelectedStaff(selectedOption);

    if (selectedOption) {
      setSelectedStaffId(selectedOption.value); // teacher_id
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

  const handleSearch = async () => {
    setStudentError("");
    setTimetable([]);
    setShowStudentReport(false);
    setLoadingForSearch(true);

    let hasError = false;

    if (hasError) {
      setLoadingForSearch(false);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");

      const params =
        selectedType === "student"
          ? {
            m_type: "S",
            class_id: selectedStudentId,
            section_id: selectedSectionId,
            name: name || "",
            grn_no: grn_no || "",
            academic_yr: academicYear,
          }
          : {
            m_type: "T",
            name: selectedStaffname,
            academic_yr: academicYear,
          };

      const response = await axios.get(`${API_URL}/api/library-members`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      const data = response?.data ?? [];

      if (!data || data.length === 0) {
        toast.error("No records found.");
        setLoadingForSearch(false);
        return;
      }

      console.log("Fetched Data:", data);

      if (selectedType === "student") {
        setSelectedStudentIds(data.map((s) => s.student_id));
      } else {
        setSelectedTeacherIds(data.map((t) => t.teacher_id));
      }

      setTimetable(data);
      setPageCount(Math.ceil(data.length / pageSize));
      setShowStudentReport(true);
    } catch (error) {
      console.error("API Error:", error?.response?.data || error.message);
      toast.error("Failed to fetch data. Please try again.");
    } finally {
      setLoadingForSearch(false);
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (person) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Authentication token missing. Please login again.");
        setIsSubmitting(false);
        return;
      }

      const action = person?.status === "A" ? "Inactive" : "Active";
      const member_type = selectedType === "student" ? "S" : "T";
      const member_id =
        selectedType === "student" ? person?.student_id : person?.teacher_id;

      const payload = {
        action,
        member_id,
        member_type,
      };

      console.log("Final Payload:", payload);

      const response = await axios.post(
        `${API_URL}/api/library-member/status`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success(response.data.message || "Status updated successfully!");
        handleSearch();
      } else {
        toast.error(response.data.message || "Failed to update member.");
      }
    } catch (error) {
      console.error("Error updating member:", error);

      if (error?.response?.status === 400) {
        toast.error(error.response.data?.message || "Bad request.");
      } else {
        toast.error("Something went wrong while updating member.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  //   const handleSearch = async () => {
  //     setSearchTerm("");
  //     setTimetable([]);
  //     setPageCount(0);
  //     setIsSubmitting(true);
  //     setLoadingForSearch(true);
  //     setFromError("");
  //     setToError("");

  //     try {
  //       const token = localStorage.getItem("authToken");
  //       if (!token) {
  //         toast.error("Authentication token missing!");
  //         setLoadingForSearch(false);
  //         setIsSubmitting(false);
  //         return;
  //       }

  //       if (!fromDate && !toDate) {
  //         setFromError("Please enter Accession No. From");
  //         setToError("Please enter Accession No. To");
  //         setLoadingForSearch(false);
  //         setIsSubmitting(false);
  //         return;
  //       }

  //       const handleResult = (data) => {
  //         if (!data || data.length === 0) {
  //           toast.error("Accession No. not found");
  //         }
  //         setTimetable(data || []);
  //       };

  //       if (!fromDate && toDate) {
  //         const params = { copy_id_to: toDate };
  //         const response = await axios.post(
  //           `${API_URL}/api/generate_barcode`,
  //           params,
  //           { headers: { Authorization: `Bearer ${token}` } }
  //         );

  //         console.log("testing");
  //         handleResult(response.data.data);
  //         return;
  //       }

  //       if (fromDate && !toDate) {
  //         const params = { copy_id_from: fromDate };

  //         const response = await axios.post(
  //           `${API_URL}/api/generate_barcode`,
  //           params,
  //           { headers: { Authorization: `Bearer ${token}` } }
  //         );

  //         handleResult(response.data.data);
  //         return;
  //       }

  //       if (fromDate && toDate) {
  //         if (Number(fromDate) > Number(toDate)) {
  //           toast.error(
  //             "Accession No. To must be greater than Accession No. From"
  //           );
  //           setLoadingForSearch(false);
  //           setIsSubmitting(false);
  //           return;
  //         }
  //       }

  //       const params = {
  //         copy_id_from: fromDate,
  //         copy_id_to: toDate,
  //       };

  //       const response = await axios.post(
  //         `${API_URL}/api/generate_barcode`,
  //         params,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         }
  //       );

  //       handleResult(response.data.data);
  //     } catch (error) {
  //       console.error("Error fetching Accession no.:", error);
  //       toast.error(
  //         error?.response?.data?.message ||
  //           "Error fetching accession no. Please try again."
  //       );
  //     } finally {
  //       setIsSubmitting(false);
  //       setLoadingForSearch(false);
  //     }
  //   };

  const IssueBookBase64 = (value) => {
    const canvas = document.createElement("canvas");
    JsBarcode(canvas, value, { format: "CODE128" });
    return canvas.toDataURL("image/png");
  };

  console.log("row", timetable);

  const filteredSections = (Array.isArray(timetable) ? timetable : []).filter(
    (student) => {
      const searchLower = searchTerm.toLowerCase();

      const accessionNo = student?.copy_id || "";

      return accessionNo.includes(searchLower);
    }
  );

  //   const displayedSections = filteredSections.slice(currentPage * pageSize);

  const displayedSections = [
    {
      id: 1,
      accession_no: "A-1001",
      title: "Mathematics – Class 8",
      due_date: "2025-01-12",
    },
    {
      id: 2,
      accession_no: "A-1023",
      title: "English Grammar – Level 2",
      due_date: "2025-01-15",
    },
    {
      id: 3,
      accession_no: "A-1058",
      title: "Physics Fundamentals",
      due_date: "2025-01-18",
    },
  ];

  return (
    <>
      <div
        className={`mx-auto p-4 transition-all duration-700 ease-[cubic-bezier(0.4, 0, 0.2, 1)] transform ${timetable.length > 0
            ? "w-full md:w-[100%] scale-100"
            : "w-full md:w-[100%] scale-[0.98]"
          }`}
      >
        <ToastContainer />
        <div className="card rounded-md ">
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

          <>
            <div
              className={`w-full flex flex-col md:flex-row md:items-end gap-4 pl-4 pr-4 ${timetable.length > 0 ? "md:w-[100%]" : "md:w-[100%]"
                }`}
            >
              {/* <div className="w-full  flex md:flex-row justify-between items-center mt-0 md:mt-4 md:mb-4">
                <div
                  className={`  w-full gap-x-0 md:gap-x-8  flex flex-col gap-y-2 md:gap-y-0 md:flex-row ${
                    timetable.length > 0
                      ? "w-full md:w-[90%]  wrelative left-0"
                      : " w-full md:w-[90%] relative left-10"
                  }`}
                >
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <label className="text-md whitespace-nowrap">
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
                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <label className="text-md whitespace-nowrap">
                          Select Class
                        </label>
                        <div className="w-[150px]">
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

                      <div className="flex items-center gap-4 w-full md:w-auto ml-10">
                        <label className="text-md whitespace-nowrap">
                          Member Name <span className="text-red-500">*</span>
                        </label>
                        <div className="w-[250px]">
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
                      </div>

                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <label className="text-md whitespace-nowrap">
                          GRN No.
                        </label>
                        <input
                          type="text"
                          value={grn_no}
                          onChange={(e) => setGrnNo(e.target.value)}
                          placeholder="Enter"
                          className="border border-gray-300 rounded px-2 py-2 w-[120px]"
                          maxLength={8}
                        />
                      </div>
                    </>
                  )}

                  {selectedType === "staff" && (
                    <div className="flex items-center gap-4 w-full md:w-auto ml-10">
                      <label className="text-md whitespace-nowrap">
                        Select Staff <span className="text-red-500">*</span>
                      </label>
                      <div className="w-[250px]">
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
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSearch}
                    style={{ backgroundColor: "#2196F3" }}
                    className="h-10 text-white px-4 rounded font-semibold"
                  >
                    {loadingForSearch ? "Browsing.." : "Browse"}
                  </button>
                </div>
              </div> */}

              <div className="w-full flex flex-col md:flex-row justify-between items-start mt-0 md:mt-4 md:mb-4">
                <div
                  className={`w-full md:w-[90%] flex flex-col md:flex-row gap-y-4 md:gap-x-8 ${timetable.length > 0 ? "left-0" : "relative left-10"
                    }`}
                >
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

                  {/* Student Fields */}
                  {selectedType === "student" && (
                    <>
                      {/* Select Class */}
                      <div className="flex flex-col w-full md:w-auto">
                        <label className="text-md mb-1">
                          Select Class<span className="text-red-500">*</span>
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
                            onChange={handleStaffSelect}
                            options={staffOptions}
                            placeholder="Select"
                            isSearchable
                            isClearable
                          />
                        </div>
                      </div>

                      {/* <div className="flex flex-col w-full md:w-auto">
                        <label className="text-md mb-1">Issue Date</label>
                        <input
                          type="date"
                            value={issueddate}
                          onChange={(e) => setGrnNo(e.target.value)}
                          className="border border-gray-300 rounded px-2 py-2"
                        />
                      </div> */}
                      <div className="flex flex-col w-full md:w-auto">
                        <label className="text-md mb-1">Issue Date</label>
                        <input
                          type="date"
                          //   value={issueddate}
                          value={grn_no}
                          onChange={(e) => setGrnNo(e.target.value)}
                          //   onChange={(e) => setIssueddate(e.target.value)}
                          className="border border-gray-300 rounded px-2 py-2"
                        />
                      </div>

                      {/* GRN No */}
                      <div className="flex flex-col w-full md:w-auto">
                        <label className="text-md mb-1">
                          Enter/Scan GRN No.
                        </label>

                        <input
                          type="text"
                          value={grn_no}
                          onChange={(e) => setGrnNo(e.target.value)}
                          placeholder="Enter"
                          className="border border-gray-300 rounded px-2 py-2 w-[150px]"
                          maxLength={8}
                        />
                      </div>
                    </>
                  )}

                  {/* Staff Dropdown */}
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
                            onChange={handleStaffSelect}
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
                          //   value={issueddate}
                          value={grn_no}
                          onChange={(e) => setGrnNo(e.target.value)}
                          //   onChange={(e) => setIssueddate(e.target.value)}
                          className="border border-gray-300 rounded px-2 py-2"
                        />
                      </div>
                    </>
                  )}

                  {/* Browse Button */}
                  <div className="flex flex-col justify-end">
                    <button
                      type="button"
                      onClick={handleSearch}
                      style={{ backgroundColor: "#2196F3" }}
                      className="h-10 text-white px-4 rounded font-semibold"
                    >
                      {loadingForSearch ? "Browsing.." : "Browse"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {timetable.length > 0 && (
              <>
                <div className="w-full px-4 mt-4 mb-4">
                  <div className="card mx-auto lg:w-full shadow-lg">
                    <div className="card-body w-full">
                      <div className="w-full leading-normal">
                        {/* Header */}
                        <div className="flex items-center justify-center mb-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-sm border-l-4 border-r-4 border-pink-400 py-1">
                          <h2 className="text-sm md:text-base font-bold text-gray-800 text-center">
                            View Issued Books
                          </h2>
                        </div>

                        <div className="card-body w-full">
                          <table className="min-w-full leading-normal table-auto">
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

                            {/* <tbody>
                              {displayedSections.length > 0 ? (
                                displayedSections.map((person, index) => {
                                  const personId =
                                    selectedType === "student"
                                      ? person.student_id
                                      : person.teacher_id;

                                  const isChecked =
                                    selectedType === "student"
                                      ? selectedStudentIds.includes(personId)
                                      : selectedTeacherIds.includes(personId);

                                  return (
                                    <tr
                                      key={personId}
                                      className="border border-gray-300"
                                    >
                                      <td className="px-2 py-2 text-center border border-gray-300">
                                        {index + 1}
                                      </td>

                                      <td className="px-2 py-2 text-center border border-gray-300">
                                        {person?.roll_no || ""}
                                      </td>

                                      <td className="px-2 py-2 text-center border border-gray-300">
                                        {camelCase(
                                          `${person?.first_name || ""} ${
                                            person?.mid_name || ""
                                          } ${person?.last_name || ""}`
                                        )}
                                      </td>

                                      <td className="px-2 py-2 text-center border border-gray-300">
                                        {person?.classname || ""}{" "}
                                        {person?.sectionname || ""}
                                      </td>

                                      <td className="px-2 py-2 text-center border border-gray-300">
                                        {person?.member_type === "T"
                                          ? "Teacher"
                                          : "Student"}
                                      </td>

                                      <td className="px-2 py-2 text-center border border-gray-300">
                                        {person?.status === "A"
                                          ? "Active"
                                          : "Inactive"}
                                      </td>

                                      <td className="px-2 py-2 text-center border border-gray-300">
                                        <button
                                          className={`px-3 py-1 text-white rounded 
                                          ${
                                            person?.status === "A"
                                              ? "bg-blue-500 hover:bg-blue-600"
                                              : "bg-green-500 hover:bg-green-600"
                                          }`}
                                          onClick={() => handleSubmit(person)}
                                        >
                                          {person?.status === "A"
                                            ? "Inactive"
                                            : "Active"}
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })
                              ) : (
                                <tr>
                                  <td colSpan={6} className="text-center py-14">
                                    {loadingForSearch ? (
                                      <span className="text-blue-600 text-xl font-normal">
                                        Please wait while data is loading...
                                      </span>
                                    ) : (
                                      <span className="text-red-600 text-xl font-normal">
                                        Oops! No data found.
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              )}
                            </tbody> */}

                            <tbody>
                              {displayedSections.map((item, index) => (
                                <tr key={item.id} className="border">
                                  <td className="px-2 py-2 text-center border">
                                    {index + 1}
                                  </td>
                                  <td className="px-2 py-2 text-center border">
                                    {item.accession_no}
                                  </td>
                                  <td className="px-2 py-2 text-center border">
                                    {item.title}
                                  </td>
                                  <td className="px-2 py-2 text-center border">
                                    {item.due_date}
                                  </td>

                                  <td className="px-2 py-2 text-center border">
                                    {item.due_date}
                                  </td>
                                  <td className="px-2 py-2 text-center border">
                                    {item.due_date}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="flex items-center justify-between mb-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-sm border-l-4 border-r-4 border-pink-400">
                          <div className="flex items-center space-x-3">
                            <div className="bg-blue-600 text-white pt-0 pb-0 pr-2 pl-2 rounded-lg shadow-md ml-3">
                              <FontAwesomeIcon icon={faBook} size="sm" />
                            </div>
                            <h2 className="text-sm md:text-base font-bold text-gray-800">
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
                            <div className="flex flex-row items-center gap-3 w-[21%] min-w-[100px]">
                              <label className="text-md whitespace-nowrap">
                                Accession No.
                              </label>
                              <input
                                type="text"
                                placeholder="Enter"
                                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                              />
                            </div>

                            <div className="flex flex-row items-center gap-3 w-[30%] min-w-[250px]">
                              <label className="text-md whitespace-nowrap">
                                Call / Category
                              </label>
                              <input
                                type="text"
                                placeholder="Call / Category"
                                readOnly
                                className="border border-gray-300 bg-gray-200 text-gray-600 rounded-md px-3 py-2 w-full cursor-not-allowed"
                              />
                            </div>

                            <div className="flex flex-row items-center gap-3 w-[30%] min-w-[260px]">
                              <label className="text-md whitespace-nowrap">
                                Book Title
                              </label>
                              <input
                                type="text"
                                placeholder="Title"
                                readOnly
                                className="border border-gray-300 bg-gray-200 text-gray-600 rounded-md px-3 py-2 w-full cursor-not-allowed"
                              />
                            </div>

                            {/* Add Button – small width */}
                            <div className="flex items-center w-[12%] min-w-[120px]">
                              <button
                                type="submit"
                                style={{ backgroundColor: "#2196F3" }}
                                className={`h-10 text-white font-bold px-6 rounded ${loadingForSearch
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                  }`}
                                disabled={loadingForSearch}
                              >
                                {loadingForSearch ? "Adding" : "Add"}
                              </button>
                            </div>
                          </div>
                        </form>
                        <div className="flex items-center justify-center mb-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-sm border-l-4 border-r-4 border-pink-400 py-1">
                          <h2 className="text-sm md:text-base font-bold text-gray-800 text-center">
                            Selected Books
                          </h2>
                        </div>
                        <div className="card-body w-full">
                          <table className="min-w-full leading-normal table-auto">
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
                                  Due Date
                                </th>
                                <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                  Remove Book
                                </th>
                              </tr>
                            </thead>

                            {/* <tbody>
                              {displayedSections.length > 0 ? (
                                displayedSections.map((person, index) => {
                                  const personId =
                                    selectedType === "student"
                                      ? person.student_id
                                      : person.teacher_id;

                                  const isChecked =
                                    selectedType === "student"
                                      ? selectedStudentIds.includes(personId)
                                      : selectedTeacherIds.includes(personId);

                                  return (
                                    <tr
                                      key={personId}
                                      className="border border-gray-300"
                                    >
                                      <td className="px-2 py-2 text-center border border-gray-300">
                                        {index + 1}
                                      </td>

                                      <td className="px-2 py-2 text-center border border-gray-300">
                                        {person?.roll_no || ""}
                                      </td>

                                      <td className="px-2 py-2 text-center border border-gray-300">
                                        {selectedType === "student"
                                          ? camelCase(
                                              `${person?.first_name || ""} ${
                                                person?.mid_name || ""
                                              } ${person?.last_name || ""}`
                                            )
                                          : camelCase(person?.name) || ""}
                                      </td>

                                      <td className="px-2 py-2 text-center border border-gray-300">
                                        {person?.member_type === "T"
                                          ? "Teacher"
                                          : "Student"}
                                      </td>

                                      <td className="px-2 py-2 text-center border border-gray-300">
                                        <button
                                          className={`p-2 rounded text-white flex items-center justify-center
      ${
        person?.status === "A"
          ? "bg-blue-500 hover:bg-blue-600"
          : "bg-green-500 hover:bg-green-600"
      }`}
                                          onClick={() => handleSubmit(person)}
                                        >
                                          {person?.status === "A" ? (
                                            <FontAwesomeIcon icon={faTimes} />
                                          ) : (
                                            <FontAwesomeIcon icon={faCheck} />
                                          )}
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })
                              ) : (
                                <tr>
                                  <td colSpan={6} className="text-center py-14">
                                    {loadingForSearch ? (
                                      <span className="text-blue-600 text-xl font-normal">
                                        Please wait while data is loading...
                                      </span>
                                    ) : (
                                      <span className="text-red-600 text-xl font-normal">
                                        Oops! No data found.
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              )}
                            </tbody> */}
                            <tbody>
                              <tr className="border">
                                <td className="px-2 py-2 text-center border">
                                  1
                                </td>
                                <td className="px-2 py-2 text-center border">
                                  A-1001
                                </td>
                                <td className="px-2 py-2 text-center border">
                                  Mathematics – Class 8
                                </td>
                                <td className="px-2 py-2 text-center border">
                                  2025-01-12
                                </td>

                                {/* Remove icon only */}
                                <td className="px-1 py-1 text-center border">
                                  <button className="p-1 bg-red-500 hover:bg-red-600 text-white rounded">
                                    <FontAwesomeIcon icon={faTimes} />
                                  </button>
                                </td>
                              </tr>
                            </tbody>
                          </table>
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

export default IssueBook;
