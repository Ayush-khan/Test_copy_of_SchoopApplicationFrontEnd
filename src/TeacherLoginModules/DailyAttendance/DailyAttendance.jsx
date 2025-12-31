import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaCalendarAlt } from "react-icons/fa";

const DailyAttendance = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [formattedFromDate, setFormattedFromDate] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});

  const [attendanceExists, setAttendanceExists] = useState(false);

  // const firstLoadRef = useRef(true);
  // const userTouchedRef = useRef(false);
  const hasAttendanceRef = useRef(false);
  // const restoreAfterSubmitRef = useRef(false);
  // const originalTimetableRef = useRef([]);

  const [showStudentReport, setShowStudentReport] = useState(false);
  const [hasUserChangedSelection, setHasUserChangedSelection] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);

  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const [loadingForSearch, setLoadingForSearch] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState({});

  const navigate = useNavigate();
  const [loadingExams, setLoadingExams] = useState(false);
  const [studentError, setStudentError] = useState("");
  const [dateError, setDateError] = useState("");

  const [roleId, setRoleId] = useState("");
  const [regId, setRegId] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState(null);

  const [timetable, setTimetable] = useState([]);

  const pageSize = 10;
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const academicYrFrom = localStorage.getItem("academic_yr_from");
  const academicYrTo = localStorage.getItem("academic_yr_to");
  const [hideSelectAll, setHideSelectAll] = useState(false);
  const [hasAttendanceData, setHasAttendanceData] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteAttendanceId, setDeleteAttendanceId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeletePModal, setShowDeletePModal] = useState(false);
  const [loading, setLoading] = useState(false);

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
    if (!roleId || !regId) return; // guard against empty
    fetchClasses(roleId, regId);
  }, [roleId, regId]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("authToken");

    // Attendance
    const resAttendance = await axios.get(
      `${API_URL}/api/get_att_class_section_day`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          class_id: selectedStudentId,
          section_id: selectedSectionId,
          dateatt: fromDate,
        },
      }
    );

    const attendanceArray = Array.isArray(resAttendance.data)
      ? resAttendance.data
      : resAttendance.data?.data || [];

    // PHP array_key_exists equivalent
    const attendanceMap = {};
    attendanceArray.forEach((row) => {
      attendanceMap[row.student_id] = true;
    });

    // Students
    const resStudents = await axios.get(
      `${API_URL}/api/get_students_by_class_section`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          class_id: selectedStudentId,
          section_id: selectedSectionId,
        },
      }
    );

    const studentsArray = Array.isArray(resStudents.data)
      ? resStudents.data
      : resStudents.data?.data || [];

    const merged = studentsArray.map((s) => ({
      ...s,
      isAbsent: attendanceMap.hasOwnProperty(s.student_id),
    }));

    setStudents(merged);
  };

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

  const fetchClasses = async (roleId, regId) => {
    const token = localStorage.getItem("authToken");
    setLoadingExams(true);

    try {
      if (roleId === "T") {
        const response = await axios.get(
          `${API_URL}/api/get_classes_of_classteacher?teacher_id=${regId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const mappedData = (response.data.data || [])
          .filter((item) => item.is_class_teacher === 1)
          .map((cls) => ({
            value: cls.class_id,
            class_id: cls.class_id,
            section_id: cls.section_id,
            classname: cls.classname,
            sectionname: cls.sectionname,
            label: `${cls.classname} ${cls.sectionname}`,
          }));

        setStudentNameWithClassId(mappedData || []);

        setStudentNameWithClassId(mappedData || []);
      } else {
        const response = await axios.get(`${API_URL}/api/g`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setStudentNameWithClassId(response?.data || []);
      }
    } catch (error) {
      toast.error("Error fetching Classes");
      console.error("Error fetching Classes:", error);
    } finally {
      setLoadingExams(false);
    }
  };

  const studentOptions = useMemo(() => {
    if (!studentNameWithClassId) return [];

    return studentNameWithClassId.map((cls) => {
      if (roleId === "T") {
        return {
          value: cls.class_id,
          section_id: cls.section_id,
          classname: cls.classname,
          sectionname: cls.sectionname,
          label: `${cls.classname} ${cls.sectionname}`,
        };
      } else {
        return {
          value: cls.class_id,
          section_id: cls.section_id,
          classname: cls.get_class?.name,
          sectionname: cls.name,
          label: `${cls.get_class?.name} ${cls.name}`,
        };
      }
    });
  }, [studentNameWithClassId, roleId]);

  const handleStudentSelect = (selectedOption) => {
    setStudentError("");
    setSelectedStudent(selectedOption);

    const classId = selectedOption?.value ?? null;
    setSelectedStudentId(classId);
    setSelectedSectionId(selectedOption?.section_id ?? null);
    // setSelectdSection(selectedOption?.sectionname);
  };

  const handleSearch = async () => {
    setStudentError("");
    setDateError("");
    setSearchTerm("");
    setTimetable([]);
    setSelectedStudentIds([]);
    setShowStudentReport(false);
    setLoadingForSearch(true);
    setHasUserChangedSelection(false);

    let hasError = false;
    if (!selectedStudentId) {
      setStudentError("Please select Class.");
      hasError = true;
    }
    if (!fromDate) {
      setDateError("Please select a date.");
      hasError = true;
    }
    if (hasError) {
      setLoadingForSearch(false);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");

      /* FETCH ALL STUDENTS */
      const studentsResponse = await axios.get(
        `${API_URL}/api/get_students_by_class_section`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            class_id: selectedStudentId,
            section_id: selectedSectionId,
          },
        }
      );

      const studentsData = studentsResponse?.data?.data ?? [];
      if (!studentsData.length) {
        toast.error("No student data found.");
        return;
      }

      /* FETCH ATTENDANCE FOR DAY */
      const attendanceResponse = await axios.get(
        `${API_URL}/api/get_att_class_section_day`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            class_id: selectedStudentId,
            section_id: selectedSectionId,
            dateatt: fromDate,
          },
        }
      );

      const attendanceData = attendanceResponse?.data?.data ?? [];

      // 🔴 CI: $count = count($stu_attn_details)
      const hasAttendanceForDay = attendanceData.length > 0;
      hasAttendanceRef.current = hasAttendanceForDay;
      setHasAttendanceData(hasAttendanceForDay);

      /* 🔴 CI behavior:
       IF attendance exists → show select-all checkbox
       ELSE → show only text
    */
      setHideSelectAll(!hasAttendanceForDay); // 🔴 CHANGED

      if (hasAttendanceForDay) {
        toast.warning("Attendance is already marked for this date.");
      }

      /* --------------------------------------------------
       3️⃣ BUILD ATTENDANCE MAP (CI array)
    -------------------------------------------------- */
      const attendanceMap = {};
      attendanceData.forEach((att) => {
        attendanceMap[Number(att.student_id)] = {
          status: Number(att.attendance_status),
          attendance_id: att.attendance_id,
        };
      });

      /* --------------------------------------------------
       4️⃣ MERGE DATA (CI IF / ELSE)
    -------------------------------------------------- */

      // const mergedData = studentsData.map((student) => {
      //   const studentId = Number(student.student_id);
      //   const attendance = attendanceMap[studentId];

      //   // 🔹 ELSE (first time attendance)
      //   if (!hasAttendanceForDay) {
      //     return {
      //       ...student,
      //       isChecked: true, // CI default
      //       isAbsent: false,
      //       attendance_id: null,
      //     };
      //   }

      //   // 🔹 IF attendance exists (CI count != 0)
      //   return {
      //     ...student,
      //     isChecked: !!attendance, // ✔ selected only if exists
      //     isAbsent: attendance
      //       ? attendance.status === 1 // ✔ ABSENT = 1
      //       : false,
      //     attendance_id: attendance?.attendance_id || null,
      //   };
      // });
      const mergedData = studentsData.map((student) => {
        const studentId = Number(student.student_id);
        const attendance = attendanceMap[studentId];

        if (!hasAttendanceForDay) {
          return {
            ...student,
            isChecked: true,
            isAbsent: false, // UI checkbox
            backendAbsent: false, // 🔥 NEW
            attendance_id: null,
          };
        }

        const existingTimetableStudent = timetable.find(
          (s) => s.student_id === studentId
        );

        return {
          ...student,
          isChecked: existingTimetableStudent?.isChecked ?? !!attendance,
          isAbsent:
            existingTimetableStudent?.isAbsent ??
            (attendance ? attendance.status === 1 : false),
          backendAbsent: attendance ? attendance.status === 1 : false, // 🔥 SOURCE OF TRUTH
          attendance_id: attendance?.attendance_id || null,
        };
      });

      // const mergedData = studentsData.map((student) => {
      //   const studentId = Number(student.student_id);
      //   const attendance = attendanceMap[studentId];

      //   // If no attendance exists, default select all
      //   if (!hasAttendanceForDay) {
      //     return {
      //       ...student,
      //       isChecked: true,
      //       isAbsent: false,
      //       attendance_id: null,
      //     };
      //   }

      //   // If attendance exists, respect previous selection if possible
      //   const existingTimetableStudent = timetable.find(
      //     (s) => s.student_id === studentId
      //   );

      //   return {
      //     ...student,
      //     isChecked: existingTimetableStudent?.isChecked ?? !!attendance, // ✔ preserve local selection
      //     isAbsent:
      //       existingTimetableStudent?.isAbsent ??
      //       (attendance ? attendance.status === 1 : false), // ✔ preserve local absent mark
      //     attendance_id: attendance?.attendance_id || null,
      //   };
      // });

      /* --------------------------------------------------
       5️⃣ FINAL STATE UPDATES
    -------------------------------------------------- */
      setTimetable(mergedData);
      // originalTimetableRef.current = mergedData;
      setPageCount(Math.ceil(mergedData.length / pageSize));
      setShowStudentReport(true);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to fetch attendance data.");
    } finally {
      setLoadingForSearch(false);
      setIsSubmitting(false);
    }
  };

  const resetState = () => {
    setSelectedStudentIds([]);
    setSearchTerm("");
    setTimetable([]);
    setShowStudentReport(false);
    setStudentError("");
    setDateError("");
    setHasUserChangedSelection(false);
  };

  const handleCloseBack = () => {
    resetState();
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Authentication token missing.");
        return;
      }

      if (!selectedStudentId || !selectedSectionId || !fromDate) {
        toast.error("Class, Section, and Date are required.");
        return;
      }

      /* ----------------------------------------
       ONLY SELECTED STUDENTS (checkbox[])
    ---------------------------------------- */
      const checkedStudents = timetable.filter((student) => student.isChecked);

      if (!checkedStudents.length) {
        toast.error("Please select at least one student.");
        return;
      }

      /* ----------------------------------------
       FORMAT DATE (d-m-Y) – CI FORMAT
    ---------------------------------------- */
      const [year, month, day] = fromDate.split("-");
      const formattedDate = `${day}-${month}-${year}`;

      /* ----------------------------------------
        BUILD PAYLOAD (EXACT CI STRUCTURE)
    ---------------------------------------- */
      const payload = {
        countOfStudents: checkedStudents.length.toString(),
        class_id: selectedStudentId.toString(),
        section_id: selectedSectionId.toString(),
        dateatt: formattedDate,

        // checkbox[]
        checkbox: checkedStudents.map((s) => s.student_id.toString()),
      };

      // present_<student_id>
      // checkedStudents.forEach((s) => {
      //   payload[`present_${s.student_id}`] = s.isAbsent ? "1" : "0";
      // });
      checkedStudents.forEach((s) => {
        if (s.isAbsent) {
          payload[`present_${s.student_id}`] = "1"; // only mark absent students
        }
      });

      /* ----------------------------------------
        API CALL
    ---------------------------------------- */
      const response = await axios.post(
        `${API_URL}/api/save_markattendance`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // if (response.data.status === true || response.status === 200) {
      //   toast.success("Attendance saved successfully!");

      //   setShowStudentReport(false);
      //   setHasAttendanceData(true);
      // }
      if (response.data.status === true || response.status === 200) {
        toast.success("Attendance saved successfully!");
        setShowStudentReport(false);
        setHasAttendanceData(true);
        // handleSearch(); // 🔥 REFRESH FROM BACKEND
      } else {
        toast.error(response.data.message || "Failed to save attendance.");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Something went wrong while saving attendance.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    console.log("Opening delete modal"); // add this for debugging
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowDeleteModal(false);
  };

  const handleSubmitDelete = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Authentication token missing.");

      const response = await axios.delete(
        `${API_URL}/api/delete_markattendance`,
        {
          params: {
            class_id: selectedStudentId,
            section_id: selectedSectionId,
            only_date: fromDate,
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.status) {
        toast.success("Attendance deleted successfully!");
        handleSearch();
        setShowDeleteModal(false);
        setShowStudentReport(false);
      } else {
        toast.error(response.data.message || "Failed to delete attendance.");
      }
    } catch (error) {
      console.error("Delete API error:", error);
      toast.error("Something went wrong while deleting attendance.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSingle = (attendanceId) => {
    console.log("Delete button clicked ✅", attendanceId);
    if (!attendanceId) {
      console.error("No attendance ID found ❌");
      return;
    }
    setDeleteAttendanceId(attendanceId);
    setShowDeletePModal(true);
  };

  // const handleConfirmDelete = async () => {
  //   if (!deleteAttendanceId) return;

  //   setIsDeleting(true);

  //   try {
  //     const token = localStorage.getItem("authToken");

  //     const response = await axios.delete(
  //       `${API_URL}/api/delete_studentmarkattendance?attendance_id=${deleteAttendanceId}`,
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       }
  //     );

  //     if (response.data.status === 200) {
  //       toast.success("Student attendance deleted successfully.");

  //       // // 🔥 RESET user-selection intent
  //       // setHasUserChangedSelection(false);

  //       // 🔁 Refetch fresh data
  //       // await handleSearch();

  //       setShowDeletePModal(false);
  //       setShowStudentReport(false);
  //     } else {
  //       toast.error(response.data.message || "Failed to delete attendance.");
  //     }
  //   } catch (error) {
  //     toast.error("An error occurred while deleting attendance.");
  //   } finally {
  //     setIsDeleting(false);
  //     setDeleteAttendanceId(null);
  //   }
  // };

  const handleConfirmDelete = async () => {
    if (!deleteAttendanceId) return;

    setIsDeleting(true);

    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.delete(
        `${API_URL}/api/delete_studentmarkattendance?attendance_id=${deleteAttendanceId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.status === 200) {
        toast.success("Student attendance deleted successfully.");

        // 🔹 Only update the timetable: uncheck the isAbsent checkbox for this student
        setTimetable((prev) =>
          prev.map((s) =>
            s.attendance_id === deleteAttendanceId
              ? { ...s, isAbsent: false, attendance_id: null } // keep isChecked intact
              : s
          )
        );

        // 🔹 Close modal but keep table open
        setShowDeletePModal(false);
      } else {
        toast.error(response.data.message || "Failed to delete attendance.");
      }
    } catch (error) {
      toast.error("An error occurred while deleting attendance.");
    } finally {
      setIsDeleting(false);
      setDeleteAttendanceId(null);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeletePModal(false);
    setDeleteAttendanceId(null);
  };

  const filteredSections = timetable.filter((record) => {
    const searchLower = searchTerm.toLowerCase();

    const classSection = record?.class_section?.toLowerCase() || "";
    const classTeacher = record?.class_teacher?.toLowerCase() || "";
    const substituteTeacher = record?.substitute_teacher?.toLowerCase() || "";
    const attendanceMarkedBy =
      record?.attendance_marked_by?.toLowerCase() || "";
    const markedStatus =
      record?.marked?.toLowerCase() === "y" ? "marked" : "not marked";

    return (
      classSection.includes(searchLower) ||
      classTeacher.includes(searchLower) ||
      substituteTeacher.includes(searchLower) ||
      attendanceMarkedBy.includes(searchLower) ||
      markedStatus.includes(searchLower)
    );
  });

  const displayedSections = filteredSections.slice(currentPage * pageSize);

  return (
    <>
      {/* <div className="w-full md:w-[85%]  mx-auto p-4 "> */}
      <div
        className={` transition-all duration-500 w-[85%]  mx-auto p-4 ${showStudentReport ? "w-[80%] " : "w-[85%] "
          }`}
      >
        <ToastContainer />
        <div className="card  rounded-md ">
          {!showStudentReport && (
            <>
              <div className=" card-header mb-4 flex justify-between items-center ">
                <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
                  Daily Attendance
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
            </>
          )}

          <>
            {!showStudentReport && (
              <div className=" w-full md:w-[100%] flex justify-center flex-col md:flex-row gap-x-1 ml-0 p-2">
                <div className="w-full md:w-[99%] flex md:flex-row justify-between items-center mt-0 md:mt-4">
                  <div className="w-full md:w-[80%]  gap-x-0 md:gap-x-4 flex flex-col gap-y-2 md:gap-y-0 md:flex-row">
                    <div className="w-full md:w-[45%] gap-x-2   justify-around  my-1 md:my-4 flex md:flex-row ">
                      <label
                        className="w-full md:w-[35%] text-md pl-0 md:pl-5 mt-1.5"
                        htmlFor="studentSelect"
                      >
                        Select Class <span className="text-red-500">*</span>
                      </label>
                      <div className="w-full md:w-[55%]">
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
                          styles={{
                            control: (provided) => ({
                              ...provided,
                              fontSize: "1em",
                              minHeight: "30px",
                            }),
                            menu: (provided) => ({
                              ...provided,
                              fontSize: "1em",
                            }),
                            option: (provided) => ({
                              ...provided,
                              fontSize: ".9em",
                            }),
                          }}
                        />
                        {studentError && (
                          <div className="h-8 relative ml-1 text-danger text-xs">
                            {studentError}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="w-full md:w-[40%] gap-x-2   justify-around  my-1 md:my-4 flex md:flex-row ">
                      <label
                        className="ml-0 md:ml-4 w-full md:w-[40%] text-md mt-1.5"
                        htmlFor="fromDate"
                      >
                        Select Date <span className="text-red-500">*</span>
                      </label>
                      <div className="w-full md:w-[60%]">
                        <input
                          type="date"
                          id="fromDate"
                          min={academicYrFrom}
                          // max={academicYrTo}
                          max={today}
                          value={fromDate}
                          onChange={(e) => {
                            setDateError("");
                            const raw = e.target.value;
                            setFromDate(raw); // for input

                            const [year, month, day] = raw.split("-");
                            setFormattedFromDate(
                              `${day}-${month}-${year.slice(2)}`
                            );
                          }}
                          className="text-sm w-full border border-gray-300 rounded px-2 py-2"
                        />

                        {dateError && (
                          <div className="h-8 relative ml-1 text-danger text-xs">
                            {dateError}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-1">
                      <button
                        type="search"
                        onClick={handleSearch}
                        style={{ backgroundColor: "#2196F3" }}
                        className={`btn h-10 w-18 md:w-auto btn-primary text-white font-bold py-1 border-1 border-blue-500 px-4 rounded ${loadingForSearch
                            ? "opacity-50 cursor-not-allowed"
                            : ""
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
                  </div>
                </div>
              </div>
            )}

            {showStudentReport && (
              <>
                {/* {timetable.length > 0 && ( */}
                <>
                  <div className="w-full ">
                    <div className="card mx-auto lg:w-full shadow-lg">
                      <div className="p-2 px-3 bg-gray-100 border-none flex items-center justify-between">
                        <div className="w-full flex flex-row items-center justify-between ">
                          <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap mr-6">
                            Daily Attendance
                          </h3>
                          {/* <div className="flex items-center w-full">
                            <div className="flex flex-row flex-nowrap items-center gap-4 w-full overflow-x-auto bg-blue-50 border-l-2 border-r-2 border-pink-500 rounded-md shadow-md px-4 py-2">
                              <div className="flex items-center gap-2 flex-1 min-w-[100px]">
                                <label
                                  className="w-[30%] whitespace-nowrap text-md sm:text-md"
                                  htmlFor="studentSelect"
                                >
                                  Select Class{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <div className="flex-1">
                                  <Select
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    id="studentSelect"
                                    value={selectedStudent}
                                    onChange={handleStudentSelect}
                                    options={studentOptions}
                                    placeholder={
                                      loadingExams ? "Loading..." : "Select"
                                    }
                                    isSearchable
                                    isClearable
                                    className="text-sm"
                                    isDisabled={loadingExams}
                                  />
                                  {studentError && (
                                    <div className="text-danger text-xs mt-1">
                                      {studentError}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-1 min-w-[150px]">
                                <label
                                  className="ml-0 md:ml-4 w-full md:w-[50%] text-md mt-1.5"
                                  htmlFor="fromDate"
                                >
                                  Select Date{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <div className="w-full md:w-[85%]">
                                  <input
                                    type="date"
                                    id="fromDate"
                                    min={academicYrFrom}
                                    // max={academicYrTo}
                                    max={today}
                                    value={fromDate}
                                    onChange={(e) => {
                                      setDateError("");
                                      const raw = e.target.value;
                                      setFromDate(raw); // for input

                                      const [year, month, day] = raw.split("-");
                                      setFormattedFromDate(
                                        `${day}-${month}-${year.slice(2)}`
                                      );
                                    }}
                                    className="text-sm w-full border border-gray-300 rounded px-2 py-2"
                                  />

                                  {dateError && (
                                    <div className="h-8 relative ml-1 text-danger text-xs">
                                      {dateError}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center min-w-[90px]">
                                <button
                                  type="button"
                                  onClick={handleSearch}
                                  style={{ backgroundColor: "#2196F3" }}
                                  className={`btn h-9 w-full btn-primary text-white font-bold px-3 rounded ${
                                    loadingForSearch
                                      ? "opacity-50 cursor-not-allowed"
                                      : ""
                                  }`}
                                  disabled={loadingForSearch}
                                >
                                  {loadingForSearch ? "Browsing..." : "Browse"}
                                </button>
                              </div>
                            </div>
                          </div> */}
                          <div className="flex items-center w-full">
                            <div
                              className="bg-blue-50 border-l-2 border-r-2 text-[1em] border-pink-500 rounded-md shadow-md mx-auto px-6 py-2"
                              style={{
                                overflowX: "auto",
                                whiteSpace: "nowrap",
                              }}
                            >
                              <div
                                className="flex items-center gap-x-4 text-blue-800 font-medium"
                                style={{ flexWrap: "nowrap" }}
                              >
                                <div className="flex items-center gap-2">
                                  <label
                                    className="text-md whitespace-nowrap"
                                    htmlFor="studentSelect"
                                  >
                                    <span className="text-lg">🏫</span> Class :{" "}
                                  </label>
                                  <span>{selectedStudent.label}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <label
                                    className="text-md whitespace-nowrap"
                                    htmlFor="studentSelect"
                                  >
                                    <span className="text-lg">📆</span> Select
                                    Date :{" "}
                                  </label>
                                  <span>{formattedFromDate || "-"}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex mb-1.5 flex-col md:flex-row gap-x-6 justify-center md:justify-end ml-2">
                          <RxCross1
                            className="text-base text-red-600 cursor-pointer hover:bg-red-100 rounded"
                            onClick={() => handleCloseBack()}
                          />
                        </div>
                      </div>

                      <div
                        className=" relative w-[97%]   mb-3 h-1  mx-auto bg-red-700"
                        style={{
                          backgroundColor: "#C03078",
                        }}
                      ></div>

                      <div className="card-body w-[85%] ml-20">
                        <div
                          className="h-96 lg:h-96 overflow-y-scroll overflow-x-scroll"
                          style={{
                            scrollbarWidth: "thin",
                            scrollbarColor: "#C03178 transparent",
                          }}
                        >
                          <table className="min-w-full leading-normal table-auto">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                  Sr No.
                                </th>

                                {!hideSelectAll ? (
                                  <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold">
                                    <div className="flex items-center justify-center space-x-1">
                                      {/* <input
                                        type="checkbox"
                                        checked={
                                          timetable.length > 0 &&
                                          timetable.every((s) => s.isChecked)
                                        }
                                        onChange={(e) => {
                                          const checked = e.target.checked;

                                          if (checked) {
                                            // Check all only
                                            setTimetable((prev) =>
                                              prev.map((s) => ({
                                                ...s,
                                                isChecked: true,
                                              }))
                                            );
                                          } else {
                                            // 🔥 CI reload behavior
                                            setTimetable(
                                              originalTimetableRef.current
                                            );
                                          }
                                        }}
                                      /> */}
                                      <input
                                        type="checkbox"
                                        checked={
                                          timetable.length > 0 &&
                                          timetable.every((s) => s.isChecked)
                                        }
                                        onChange={(e) => {
                                          const checked = e.target.checked;

                                          if (checked) {
                                            // CI: select all students
                                            setTimetable((prev) =>
                                              prev.map((s) => ({
                                                ...s,
                                                isChecked: true,
                                              }))
                                            );
                                          } else {
                                            // CI: restore original DB state
                                            // setTimetable(
                                            //   originalTimetableRef.current
                                            // );
                                            (" ");
                                          }
                                        }}
                                      />

                                      <span>Select Students</span>
                                    </div>
                                  </th>
                                ) : (
                                  <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold">
                                    Select Students
                                  </th>
                                )}

                                <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                  Roll No
                                </th>

                                <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                  Student Name
                                </th>

                                <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                  Marked of Absentees
                                </th>

                                {hasAttendanceData && (
                                  <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                    Delete
                                  </th>
                                )}
                              </tr>
                            </thead>

                            <tbody>
                              {displayedSections.length > 0 ? (
                                displayedSections.map((student, index) => {
                                  return (
                                    <tr
                                      key={student.student_id}
                                      className="border border-gray-300"
                                    >
                                      <td className="px-2 py-2 text-center border border-gray-300">
                                        {index + 1}
                                      </td>

                                      <td className="px-2 py-2 text-center border border-gray-300">
                                        <input
                                          type="checkbox"
                                          checked={student.isChecked}
                                          onChange={(e) => {
                                            const checked = e.target.checked;

                                            setTimetable((prev) =>
                                              prev.map((s) =>
                                                s.student_id ===
                                                  student.student_id
                                                  ? {
                                                    ...s,
                                                    isChecked: checked,
                                                    // CI rule: unchecked student = no attendance
                                                    isAbsent: checked
                                                      ? s.isAbsent
                                                      : false,
                                                  }
                                                  : s
                                              )
                                            );
                                          }}
                                        />
                                        {/* <input
                                          type="checkbox"
                                          checked={student.isAbsent}
                                          disabled={!student.isChecked}
                                          onChange={(e) => {
                                            const checked = e.target.checked;

                                            setTimetable((prev) =>
                                              prev.map((s) =>
                                                s.student_id ===
                                                student.student_id
                                                  ? {
                                                      ...s,
                                                      isAbsent:
                                                        checked && s.isChecked, // UI only
                                                    }
                                                  : s
                                              )
                                            );
                                          }}
                                        /> */}
                                      </td>

                                      <td className="px-2 py-2 text-center border border-gray-300">
                                        {student?.roll_no || "-"}
                                      </td>

                                      <td className="px-2 py-2 text-center border border-gray-300">
                                        {camelCase(
                                          `${student?.first_name || ""} ${student?.mid_name || ""
                                          } ${student?.last_name || ""}`
                                        )}
                                      </td>

                                      <td className="px-2 py-2 text-center border border-gray-300">
                                        <input
                                          type="checkbox"
                                          checked={student.isAbsent}
                                          disabled={!student.isChecked} // CI behavior
                                          onChange={(e) => {
                                            const checked = e.target.checked;

                                            setTimetable((prev) =>
                                              prev.map((s) =>
                                                s.student_id ===
                                                  student.student_id
                                                  ? {
                                                    ...s,
                                                    // 🔥 CI rule: absent ONLY if student selected
                                                    isAbsent:
                                                      checked && s.isChecked,
                                                  }
                                                  : s
                                              )
                                            );
                                          }}
                                        />
                                      </td>

                                      {/* {hasAttendanceData && (
                                        <td className="px-2 py-2 text-center border border-gray-300">
                                          {student.attendance_id &&
                                            student.isAbsent && (
                                              <button
                                                onClick={() =>
                                                  handleDeleteSingle(
                                                    student.attendance_id
                                                  )
                                                }
                                                className="text-red-600 hover:text-red-800"
                                              >
                                                <FontAwesomeIcon
                                                  icon={faTrash}
                                                />
                                              </button>
                                            )}
                                        </td>
                                      )} */}

                                      {hasAttendanceData && (
                                        <td className="px-2 py-2 text-center border border-gray-300">
                                          {student.attendance_id &&
                                            student.backendAbsent && (
                                              <button
                                                onClick={() =>
                                                  handleDeleteSingle(
                                                    student.attendance_id
                                                  )
                                                }
                                                className="text-red-600 hover:text-red-800"
                                              >
                                                <FontAwesomeIcon
                                                  icon={faTrash}
                                                />
                                              </button>
                                            )}
                                        </td>
                                      )}

                                      {/* {hasAttendanceData && (
                                        <td className="px-2 py-2 text-center border border-gray-300">
                                          
                                          {student.attendance_id &&
                                            student.isAbsent && (
                                              <button
                                                onClick={() =>
                                                  handleDeleteSingle(
                                                    student.attendance_id
                                                  )
                                                }
                                                className="text-red-600 hover:text-red-800"
                                              >
                                                <FontAwesomeIcon
                                                  icon={faTrash}
                                                />
                                              </button>
                                            )}
                                        </td>
                                      )} */}
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
                            </tbody>
                          </table>
                        </div>
                        <div className="flex justify-end gap-3 mt-4 mr-4">
                          <button
                            type="button"
                            onClick={handleSubmit}
                            className={`bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-md`}
                          >
                            {isSubmitting ? "Updating..." : "Update Attendance"}
                          </button>

                          {hasAttendanceData && (
                            <button
                              type="button"
                              onClick={() => {
                                console.log("Delete button clicked");
                                handleDelete();
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg shadow-md"
                            >
                              Delete
                            </button>
                          )}

                          <button
                            type="button"
                            className="bg-yellow-300 hover:bg-yellow-400 text-white font-medium px-4 py-2 rounded-lg shadow-md"
                            onClick={() => handleCloseBack()}
                          >
                            Back
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
                {/* )} */}
              </>
            )}

            {showDeleteModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="modal fade show" style={{ display: "block" }}>
                  <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                      {/* Header */}
                      <div className="flex justify-between p-3">
                        <h5 className="modal-title">Confirm Delete</h5>
                        <RxCross1
                          className="float-end relative mt-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                          onClick={handleCloseModal}
                        />
                      </div>

                      {/* Divider */}
                      <div
                        className="relative mb-3 h-1 w-[97%] mx-auto"
                        style={{ backgroundColor: "#C03078" }}
                      ></div>

                      {/* Body */}
                      <div className="modal-body">
                        Are you sure to delete attendance marked on {fromDate}{" "}
                        for the entire class?
                      </div>

                      {/* Footer */}
                      <div className="flex justify-end p-3">
                        <button
                          type="button"
                          className="btn btn-danger px-3 mb-2"
                          onClick={handleSubmitDelete}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showDeletePModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="modal fade show" style={{ display: "block" }}>
                  <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                      <div className="flex justify-between p-3">
                        <h5 className="modal-title">Confirm Delete</h5>
                        <RxCross1
                          className="float-end relative mt-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                          onClick={handleCloseDeleteModal}
                        />
                      </div>

                      <div
                        className="relative mb-3 h-1 w-[97%] mx-auto"
                        style={{ backgroundColor: "#C03078" }}
                      ></div>

                      <div className="modal-body">
                        Are you sure to delete attendance marked ?
                      </div>

                      <div className="flex justify-end p-3">
                        <button
                          type="button"
                          className="btn btn-danger px-3 mb-2"
                          onClick={handleConfirmDelete}
                          disabled={isDeleting}
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        </div>
      </div>
    </>
  );
};

export default DailyAttendance;
