import React from "react";
import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
import { FiPlus } from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";
import { useLocation, useParams } from "react-router-dom";
import { FaRegCalendarAlt } from "react-icons/fa";

const EditLessonPlanTemplate = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  // const [selectedStudent, setSelectedStudent] = useState(null);
  const academicYrFrom = localStorage.getItem("academic_yr_from");
  const academicYrTo = localStorage.getItem("academic_yr_to");

  const minDate = academicYrFrom ? dayjs(academicYrFrom).toDate() : null;
  const maxDate = academicYrTo ? dayjs(academicYrTo).toDate() : null;

  const [loading, setLoading] = useState(null);

  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [publish, setPublish] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [studentRemarks, setStudentRemarks] = useState({});
  const [showStudentReport, setShowStudentReport] = useState(false);
  const [heading, setHeadings] = useState([]);
  const [dailyHeading, setDailyHeadings] = useState([]);

  const [timetable, setTimetable] = useState([]);
  const [weekError, setWeekError] = useState(false);
  const [weekRange, setWeekRange] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [numPeriods, setNumPeriods] = useState("");
  const datePickerRef = useRef(null);

  const handleDateChange = (date) => {
    setFromDate(date);
    setWeekError("");

    if (date) {
      const selectedDate = dayjs(date);

      // Monday as start of week
      const monday = selectedDate.startOf("week").add(1, "day");
      const sunday = monday.add(6, "day");

      // Readable week range
      const startDateFormatted = monday.format("DD-MM-YYYY");
      const endDateFormatted = sunday.format("DD-MM-YYYY");
      setWeekRange(`${startDateFormatted} / ${endDateFormatted}`);

      // Raw values for input[type="date"]
      setFromDate(monday.format("YYYY-MM-DD"));
      setToDate(sunday.format("YYYY-MM-DD"));
    } else {
      setWeekRange("");
      setFromDate(null);
      setToDate(null);
    }
  };

  const openDatePicker = () => {
    if (datePickerRef.current) {
      datePickerRef.current.setOpen(true);
    }
  };

  const student = {
    daily_changes: [
      {
        heading: "Teaching Points",
        entries: [
          {
            start_date: "2025-10-10",
            description: ["• First point", "• Second point"],
          },
        ],
      },
    ],
  };

  const { id } = useParams();
  console.log("id", id);
  const { state } = useLocation();
  console.log("state", state);

  const sectionId = state.section_id;
  console.log("section", sectionId);

  const {
    headings: passedHeadings = [],
    timetable: passedTimetable = [],
    selectedStudentId,
    selectedSubjectId,
    selectedChapterId,
    selectedChapter,
    selectedSubject,
    selectedStudent,
    unq_id,
    section_id,
  } = state || {};

  useEffect(() => {
    fetchHeadings();
  }, []);

  const fetchHeadings = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/get_lesson_plan_heading_non_daily`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = response?.data?.data || [];
      data.sort((a, b) => a.sequence - b.sequence); // optional sorting
      setHeadings(data);
    } catch (error) {
      toast.error("Error fetching Lesson plan headings");
    }
  };

  const fetchDailyHeadings = async () => {
    console.log("jkhgf");
    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/get_lesson_plan_heading_daily`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = response?.data?.data || [];
      console.log("data daily", data);
      data.sort((a, b) => a.sequence - b.sequence);
      setDailyHeadings(data);
    } catch (error) {
      console.error("Error fetching Lesson plan headings:", error);
      toast.error("Error fetching Lesson plan headings");
    }
  };

  useEffect(() => {
    console.log("useEffect triggered");
    fetchDailyHeadings();
  }, []);

  useEffect(() => {
    const fetchTemplate = async () => {
      setLoading(true);

      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          `${API_URL}/api/get_lesson_plan_by_unq_id/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const details = response?.data?.data?.details || [];
        const lessonPlan = response?.data?.data?.lesson_plan || {};

        // ✅ Create a mapping of heading_id → description
        const remarks = {};
        details.forEach((item, index) => {
          remarks[item.lesson_plan_headings_id] = item.description || "";
        });

        setTimetable([lessonPlan]); // store one plan for display reference if needed
        setStudentRemarks(remarks);

        console.log("✅ Lesson Plan Details:", details);
        console.log("✅ Mapped Remarks:", remarks);
      } catch (err) {
        toast.error("Error fetching lesson plan template");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [id]);

  const [rows, setRows] = useState(
    student.daily_changes?.map((item) => ({
      startDate: item.startDate || "",
      description: item.description || "",
    })) || []
  );

  const handleAddRow = () => {
    setRows([...rows, { startDate: "", description: "" }]);
  };

  const handleRemoveRow = (index) => {
    const updatedRows = rows.filter((_, i) => i !== index);
    setRows(updatedRows);
  };

  const handleChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  // const handleUpdate = async () => {
  //   if (isSubmitting) return;
  //   setIsSubmitting(true);

  //   try {
  //     const token = localStorage.getItem("authToken");
  //     if (!token) {
  //       toast.error("Authentication token missing. Please login again.");
  //       setIsSubmitting(false);
  //       return;
  //     }

  //     // ✅ Correct handling for class_id and section_id
  //     const studentsArray = Array.isArray(selectedStudent)
  //       ? selectedStudent.map((s) => ({
  //           class_id: s.value,
  //           section_id: s.section_id || sectionId || "0", // ✅ uses state fallback
  //         }))
  //       : selectedStudent
  //       ? [
  //           {
  //             class_id: selectedStudent.value,
  //             section_id: selectedStudent.section_id || sectionId || "0", // ✅ corrected property name
  //           },
  //         ]
  //       : [];

  //     if (!studentsArray.length) {
  //       toast.error("Please select at least one student/class before saving.");
  //       setIsSubmitting(false);
  //       return;
  //     }

  //     const invalidStudent = studentsArray.find(
  //       (s) => !s.class_id || s.section_id === undefined || s.section_id === ""
  //     );
  //     if (invalidStudent) {
  //       toast.error("Selected student has invalid class or section.");
  //       setIsSubmitting(false);
  //       return;
  //     }

  //     const classId = studentsArray[0].class_id?.toString() || "0";
  //     const sectionIds = studentsArray
  //       .map((s) => s.section_id?.toString() || "0")
  //       .join(",");
  //     const classIdArray = studentsArray.map(
  //       (s) => `${s.class_id}^${s.section_id}`
  //     );

  //     const descriptions = {};
  //     heading.forEach((item) => {
  //       const headingId = item.lesson_plan_headings_id;
  //       const group = timetable?.[0]?.groupedDetails?.[headingId] || [];

  //       if (group.length > 0) {
  //         group.forEach((desc, i) => {
  //           const keyPrefix = item.isDaily ? "dc_description" : "description";
  //           descriptions[`${keyPrefix}_${headingId}_${i + 1}`] =
  //             studentRemarks[`${headingId}_${i}`] || desc.description || "";
  //         });
  //       } else {
  //         const keyPrefix = item.isDaily ? "dc_description" : "description";
  //         const value = studentRemarks[headingId] || "";
  //         if (value) descriptions[`${keyPrefix}_${headingId}_1`] = value;
  //       }
  //     });

  //     if (Object.keys(descriptions).length === 0) {
  //       toast.error("Please enter at least one description before saving.");
  //       setIsSubmitting(false);
  //       return;
  //     }

  //     // ✅ Build payload
  //     const payload = {
  //       class_id: classId,
  //       section_id: sectionIds,
  //       sm_id: selectedSubjectId?.toString() || "0",
  //       chapter_id: selectedChapterId?.toString() || "0",
  //       class_id_array: classIdArray,
  //       no_of_periods: timetable?.length?.toString() || "1",
  //       weeklyDatePicker: new Date().toISOString().split("T")[0],
  //       les_pln_temp_id: timetable?.[0]?.les_pln_temp_id || "new",
  //       approve: "Y",
  //       lph_dc_row: "1",
  //       start_date: [new Date().toISOString().split("T")[0]],
  //       ...descriptions,
  //     };

  //     if (timetable?.[0]?.lesson_plan_id)
  //       payload.lesson_plan_id = timetable[0].lesson_plan_id;
  //     if (timetable?.[0]?.unq_id) payload.unq_id = timetable[0].unq_id;

  //     console.log("🚀 Payload being sent to API:", payload);

  //     const response = await axios.put(
  //       `${API_URL}/api/update_lesson_plan/${id}`,
  //       payload,
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       }
  //     );

  //     if (response.data.status === 200) {
  //       toast.success("Lesson plan updated successfully!");
  //       navigate("/lessonPlan");
  //       setStudentRemarks({});
  //       setTimetable([]);
  //     } else {
  //       toast.error(response.data.message || "Failed to update lesson plan.");
  //     }
  //   } catch (error) {
  //     console.error("Error saving lesson plan:", error);
  //     toast.error("An error occurred while saving the lesson plan.");
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const handleUpdate = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Authentication token missing. Please login again.");
        setIsSubmitting(false);
        return;
      }

      // 🔸 Validate No. of Periods
      if (!numPeriods || parseInt(numPeriods) <= 0) {
        toast.error("Please select number of periods before saving.");
        setIsSubmitting(false);
        return;
      }

      // 🔸 Validate Week selection
      if (!fromDate || !toDate || !weekRange) {
        toast.error("Please select week before saving.");
        setWeekError("Please select week before saving.");
        setIsSubmitting(false);
        return;
      }

      // 🔸 Validate class/section selection
      const studentsArray = Array.isArray(selectedStudent)
        ? selectedStudent.map((s) => ({
            class_id: s.value,
            section_id: s.section_id || sectionId || "0", // ✅ uses state fallback
          }))
        : selectedStudent
        ? [
            {
              class_id: selectedStudent.value,
              section_id: selectedStudent.section_id || sectionId || "0", // ✅ corrected property name
            },
          ]
        : [];

      if (!studentsArray.length) {
        toast.error("Please select at least one class before saving.");
        setIsSubmitting(false);
        return;
      }

      const invalidStudent = studentsArray.find(
        (s) => !s.class_id || s.section_id === undefined || s.section_id === ""
      );
      if (invalidStudent) {
        toast.error("Selected class has invalid class or section.");
        setIsSubmitting(false);
        return;
      }

      const classId = studentsArray[0].class_id?.toString() || "0";
      const sectionIds = studentsArray
        .map((s) => s.section_id?.toString() || "0")
        .join(",");
      const classIdArray = studentsArray.map(
        (s) => `${s.class_id}^${s.section_id}`
      );

      const descriptions = {};

      (heading || []).forEach((item) => {
        const headingId = item.lesson_plan_headings_id;
        const descValue =
          studentRemarks[headingId] || timetable?.[0]?.[headingId] || "";

        const formattedValue = descValue
          .split("\n")
          .map((line) => {
            const trimmed = line.trim();
            if (trimmed === "") return "";
            return trimmed.startsWith("• ") ? trimmed : "• " + trimmed;
          })
          .join("\n")
          .trim();

        descriptions[`description_${headingId}_1`] = formattedValue;
      });

      (dailyHeading || []).forEach((item) => {
        const headingId = item.lesson_plan_headings_id;
        const descValue =
          studentRemarks[`${headingId}_0`] ||
          timetable?.[0]?.[`description_${headingId}_1`] ||
          "";

        const formattedValue = descValue
          .split("\n")
          .map((line) => {
            const trimmed = line.trim();
            if (trimmed === "") return "";
            return trimmed.startsWith("• ") ? trimmed : "• " + trimmed;
          })
          .join("\n")
          .trim();

        descriptions[`description_${headingId}_1`] = formattedValue;
      });

      const hasAnyDescription = Object.values(descriptions).some(
        (val) => val && val.trim() !== ""
      );
      if (!hasAnyDescription) {
        toast.error("Please enter at least one description before saving.");
        setIsSubmitting(false);
        return;
      }

      const hasTeachingPoints = (dailyHeading || []).some((item) => {
        const val =
          descriptions[`description_${item.lesson_plan_headings_id}_1`] || "";
        return val.trim() !== "";
      });
      if (!hasTeachingPoints) {
        toast.error("Please add teaching points before saving.");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        class_id: classId,
        section_id: sectionIds,
        sm_id: selectedSubjectId?.toString() || "0",
        chapter_id: selectedChapterId?.toString() || "0",
        class_id_array: classIdArray,
        no_of_periods: numPeriods?.toString() || "1",
        weeklyDatePicker: new Date().toISOString().split("T")[0],
        les_pln_temp_id: timetable?.[0]?.les_pln_temp_id || "new",
        approve: "Y",
        lph_dc_row: "1",
        start_date: [fromDate, toDate],
        ...descriptions,
      };

      if (timetable?.[0]?.lesson_plan_id)
        payload.lesson_plan_id = timetable[0].lesson_plan_id;
      if (timetable?.[0]?.unq_id) payload.unq_id = timetable[0].unq_id;

      console.log("🚀 Final Payload:", payload);

      const response = await axios.put(
        `${API_URL}/api/update_lesson_plan/${id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === 200) {
        toast.success("Lesson plan updated successfully!");
        navigate("/lessonPlan");
        setStudentRemarks({});
        setTimetable([]);
        setWeekRange("");
        setNumPeriods("");
      } else {
        toast.error(response.data.message || "Failed to update lesson plan.");
      }
    } catch (error) {
      console.error(" Error updating lesson plan:", error);
      toast.error("An error occurred while saving the lesson plan.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const filteredSections = timetable.filter((student) => {
    if (!searchTerm) return true; // show all when no search
    const searchLower = searchTerm.replace(/\s+/g, "").toLowerCase();
    const flatValues = [];

    // Collect searchable text from non_daily
    if (Array.isArray(student.non_daily)) {
      student.non_daily.forEach((item) => {
        if (item.heading)
          flatValues.push(
            item.heading.trim().replace(/\s+/g, "").toLowerCase()
          );
        if (Array.isArray(item.description)) {
          item.description.forEach((desc) =>
            flatValues.push(desc.trim().replace(/\s+/g, "").toLowerCase())
          );
        }
      });
    }

    // Collect searchable text from daily_changes
    if (Array.isArray(student.daily_changes)) {
      student.daily_changes.forEach((change) => {
        if (change.heading)
          flatValues.push(
            change.heading.trim().replace(/\s+/g, "").toLowerCase()
          );
        if (Array.isArray(change.entries)) {
          change.entries.forEach((entry) => {
            if (Array.isArray(entry.description)) {
              entry.description.forEach((desc) =>
                flatValues.push(desc.trim().replace(/\s+/g, "").toLowerCase())
              );
            }
          });
        }
      });
    }

    // Return true if any text matches the search term
    return flatValues.some((val) => val.includes(searchLower));
  });

  const displayedSections =
    filteredSections.length > 0
      ? filteredSections
      : timetable.length === 0
      ? [{}]
      : [];

  const existingData = {};
  displayedSections.forEach((student) => {
    if (student.lesson_plan_headings_id && student.description) {
      existingData[student.lesson_plan_headings_id] = student.description;
    }
  });

  return (
    <>
      <div
        className={` transition-all duration-500 w-[95%]  mx-auto p-4 ${
          showStudentReport ? "w-full " : "w-[90%] "
        }`}
      >
        <ToastContainer />
        <div className="card pb-4  rounded-md ">
          <>
            {!showStudentReport && (
              <>
                <>
                  <div className="w-full  mx-auto transition-all duration-300">
                    <div className="card mx-auto shadow-lg">
                      <div className="p-2 px-3 bg-gray-100 border-none flex items-center justify-between">
                        <div className="w-full flex flex-row items-center justify-between mr-0 md:mr-4 gap-x-1">
                          <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap mr-6">
                            Edit Lesson Plan
                          </h3>
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
                                {/* Teacher */}
                                <div className="flex items-center gap-2">
                                  <label
                                    className="text-md whitespace-nowrap"
                                    htmlFor="studentSelect"
                                  >
                                    <span className="text-lg">🏫</span>
                                    Class :{" "}
                                  </label>
                                  <span>{selectedStudent.label}</span>
                                </div>

                                {/* Month */}
                                <div className="flex items-center gap-3">
                                  <label
                                    className="text-md whitespace-nowrap"
                                    htmlFor="monthSelect"
                                  >
                                    <span className="text-lg">📚</span>
                                    Subject :{" "}
                                  </label>
                                  <span>{selectedSubject.label}</span>
                                </div>

                                <div className="flex items-center gap-3">
                                  <label
                                    className="text-md whitespace-nowrap"
                                    htmlFor="monthSelect"
                                  >
                                    <span className="text-lg">📝</span>
                                    Chapter :{" "}
                                  </label>
                                  <span>{selectedChapter.label}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex mb-1.5 flex-col md:flex-row gap-x-6 justify-center md:justify-end ">
                          <RxCross1
                            className="text-base text-red-600 cursor-pointer hover:bg-red-100 rounded"
                            onClick={() => navigate("/lessonPlan")}
                          />
                        </div>
                      </div>
                      <div
                        className=" w-[97%] h-1 mx-auto"
                        style={{ backgroundColor: "#C03078" }}
                      ></div>

                      <div className="card-body w-full">
                        <div
                          className="h-96 lg:h-96 overflow-y-scroll overflow-x-scroll"
                          style={{
                            scrollbarWidth: "thin",
                            scrollbarColor: "#C03178 transparent",
                          }}
                        >
                          {loading ? (
                            <div className="absolute left-[4%] w-[100%] text-center flex justify-center items-center mt-14">
                              <div className="text-center text-xl text-blue-700">
                                Please wait while data is loading...
                              </div>
                            </div>
                          ) : Array.isArray(displayedSections) &&
                            displayedSections.length >= 0 ? (
                            displayedSections.map((student, index) => (
                              <div
                                key={index}
                                className="mb-10 border rounded-lg shadow-md p-1"
                              >
                                <div className="flex items-center justify-end gap-10 mr-10 mb-2 flex-wrap md:flex-nowrap">
                                  {/* No. of Periods */}
                                  <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                      No. of Periods{" "}
                                      <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                      type="number"
                                      min="1"
                                      placeholder="Enter periods"
                                      className="w-32 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
                                      value={numPeriods}
                                      onChange={(e) =>
                                        setNumPeriods(e.target.value)
                                      }
                                      required
                                    />
                                  </div>

                                  {/* Date (Week Picker) */}
                                  <div className="flex items-center gap-2 mr-10">
                                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                      Date{" "}
                                      <span className="text-red-500">*</span>
                                    </label>

                                    {/* <div className="relative w-[230px] md:w-[280px]"> */}
                                    <div
                                      className="text-sm text-gray-700 border border-gray-300 p-2.5 rounded-lg 
                                                  flex items-center justify-between cursor-pointer bg-white 
                                                  shadow-sm hover:border-gray-400 transition"
                                      onClick={openDatePicker}
                                    >
                                      <div className="flex-1 flex items-center">
                                        {weekRange ? (
                                          <span className="truncate text-gray-800">
                                            {weekRange}
                                          </span>
                                        ) : (
                                          <span className="flex items-center text-gray-400">
                                            <FaRegCalendarAlt className="mr-2 text-pink-500" />
                                            Select Week
                                          </span>
                                        )}
                                      </div>

                                      {weekRange && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setFromDate(null);
                                            setWeekRange("");
                                          }}
                                          className="text-gray-400 hover:text-red-500 ml-2 "
                                        >
                                          <RxCross1 className="text-xs text-red-600" />
                                        </button>
                                      )}
                                    </div>

                                    <DatePicker
                                      ref={datePickerRef}
                                      selected={fromDate}
                                      onChange={handleDateChange}
                                      dateFormat="dd-MM-yyyy"
                                      className="hidden"
                                      maxDate={maxDate}
                                      minDate={minDate}
                                    />
                                  </div>
                                </div>
                                <div
                                  className="overflow-x-auto mb-4"
                                  style={{
                                    overflowX: "auto",
                                    scrollbarWidth: "none",
                                    msOverflowStyle: "none",
                                  }}
                                >
                                  <div
                                    className="min-w-max"
                                    style={{
                                      overflowX: "auto",
                                      scrollbarWidth: "none",
                                      msOverflowStyle: "none",
                                    }}
                                  >
                                    <table className="table-fixed border-2 border-gray-400">
                                      <thead className="bg-gray-200">
                                        <tr>
                                          {(heading || []).map((item, i) => (
                                            <th
                                              key={item.lesson_plan_headings_id}
                                              className={`px-6 py-2 border-2 text-sm font-semibold text-center text-gray-800 ${
                                                i === 0
                                                  ? "sticky left-0 bg-gray-200"
                                                  : ""
                                              }`}
                                              style={{ width: "210px" }}
                                            >
                                              {item.name}
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>

                                      <tbody>
                                        {heading && heading.length > 0 ? (
                                          <tr style={{ height: "250px" }}>
                                            {heading.map((item, colIndex) => (
                                              <td
                                                key={
                                                  item.lesson_plan_headings_id
                                                }
                                                className={`border-2 px-2 py-1 ${
                                                  colIndex === 0
                                                    ? "sticky left-0 bg-white"
                                                    : ""
                                                }`}
                                                style={{
                                                  width: "210px",
                                                  minHeight: "250px",
                                                }}
                                              >
                                                <textarea
                                                  value={
                                                    studentRemarks[
                                                      item
                                                        .lesson_plan_headings_id
                                                    ] || ""
                                                  }
                                                  onChange={(e) =>
                                                    setStudentRemarks(
                                                      (prev) => ({
                                                        ...prev,
                                                        [item.lesson_plan_headings_id]:
                                                          e.target.value,
                                                      })
                                                    )
                                                  }
                                                  onKeyDown={(e) => {
                                                    const {
                                                      value,
                                                      selectionStart,
                                                      selectionEnd,
                                                    } = e.target;

                                                    if (e.key === "Enter") {
                                                      e.preventDefault();

                                                      const lineStart =
                                                        value.lastIndexOf(
                                                          "\n",
                                                          selectionStart - 1
                                                        ) + 1;
                                                      const currentLine =
                                                        value.substring(
                                                          lineStart,
                                                          selectionStart
                                                        );

                                                      const before =
                                                        value.substring(
                                                          0,
                                                          selectionStart
                                                        );
                                                      const after =
                                                        value.substring(
                                                          selectionEnd
                                                        );

                                                      const newBullet =
                                                        currentLine.startsWith(
                                                          "• "
                                                        )
                                                          ? "• "
                                                          : "";

                                                      const newValue =
                                                        before +
                                                        "\n" +
                                                        newBullet +
                                                        after;
                                                      e.target.value = newValue;

                                                      const cursorPos =
                                                        selectionStart +
                                                        1 +
                                                        newBullet.length;
                                                      setTimeout(() => {
                                                        e.target.selectionStart =
                                                          e.target.selectionEnd =
                                                            cursorPos;
                                                      }, 0);
                                                    }

                                                    if (e.key === "Backspace") {
                                                      const lineStart =
                                                        value.lastIndexOf(
                                                          "\n",
                                                          selectionStart - 1
                                                        ) + 1;
                                                      const currentLine =
                                                        value.substring(
                                                          lineStart,
                                                          selectionStart
                                                        );

                                                      if (
                                                        currentLine.startsWith(
                                                          "• "
                                                        ) &&
                                                        selectionStart ===
                                                          lineStart + 2
                                                      ) {
                                                        e.preventDefault();
                                                        const newValue =
                                                          value.substring(
                                                            0,
                                                            lineStart
                                                          ) +
                                                          value.substring(
                                                            lineStart + 2
                                                          );
                                                        e.target.value =
                                                          newValue;

                                                        setTimeout(() => {
                                                          e.target.selectionStart =
                                                            e.target.selectionEnd =
                                                              lineStart;
                                                        }, 0);
                                                      }
                                                    }
                                                  }}
                                                  onInput={(e) => {
                                                    const lines =
                                                      e.target.value.split(
                                                        "\n"
                                                      );
                                                    const updatedLines =
                                                      lines.map((line) =>
                                                        line.trim() === "" ||
                                                        line.startsWith("• ")
                                                          ? line
                                                          : "• " + line
                                                      );
                                                    const newValue =
                                                      updatedLines.join("\n");
                                                    if (
                                                      newValue !==
                                                      e.target.value
                                                    ) {
                                                      e.target.value = newValue;
                                                      e.target.selectionStart =
                                                        e.target.selectionEnd =
                                                          newValue.length;
                                                    }
                                                  }}
                                                  onBlur={(e) => {
                                                    console.log(
                                                      "Updated value:",
                                                      e.target.value,
                                                      "at row",
                                                      rowIndex,
                                                      "col",
                                                      colIndex
                                                    );
                                                  }}
                                                  className="w-full h-full resize-none p-2 border border-gray-300 focus:outline-none"
                                                  style={{
                                                    minHeight: "250px",
                                                    height: "100%",
                                                    boxSizing: "border-box",
                                                    lineHeight: "1.5em",
                                                  }}
                                                />
                                              </td>
                                            ))}
                                          </tr>
                                        ) : (
                                          <tr>
                                            <td
                                              colSpan={heading.length || 1}
                                              className="text-center text-gray-500 py-4"
                                            >
                                              No lesson plan data found.
                                            </td>
                                          </tr>
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                  <style>
                                    {`
                                      .overflow-x-auto::-webkit-scrollbar {
                                        display: none;
                                      }
                                    `}
                                  </style>
                                </div>
                                {timetable?.length > 0 && (
                                  <div className="flex flex-row gap-4 mb-4">
                                    <div className="w-full border p-3 rounded bg-gray-50 overflow-x-auto">
                                      <table className="min-w-max border border-gray-400 table-fixed text-sm">
                                        <thead>
                                          <tr className="bg-gray-200 border-2 border-gray-400">
                                            {/* Start Date Header */}
                                            <th
                                              className="border-2 px-4 py-2 text-left text-sm font-semibold text-gray-800 sticky left-0 bg-gray-200"
                                              style={{
                                                width: "180px",
                                                minWidth: "180px",
                                              }}
                                            >
                                              Start Date
                                            </th>

                                            {/* Dynamic Headings */}
                                            {(dailyHeading || []).map(
                                              (item) => (
                                                <th
                                                  key={
                                                    item.lesson_plan_headings_id
                                                  }
                                                  className="border-2 px-4 py-2 text-center text-sm font-semibold text-gray-800"
                                                  style={{
                                                    width: "220px",
                                                    minWidth: "220px",
                                                    wordWrap: "break-word",
                                                  }}
                                                >
                                                  {item.name}
                                                </th>
                                              )
                                            )}

                                            {/* Add Button Header */}
                                            <th
                                              className="border-2 px-4 py-2 text-center w-12 font-semibold text-gray-800"
                                              style={{ minWidth: "60px" }}
                                            >
                                              <button
                                                type="button"
                                                onClick={handleAddRow}
                                                className="text-green-500 hover:text-green-700"
                                              >
                                                <FiPlus size={20} />
                                              </button>
                                            </th>
                                          </tr>
                                        </thead>

                                        <tbody>
                                          <tr className="even:bg-white odd:bg-gray-50 border-2 border-gray-400">
                                            {/* Start Date Cell */}
                                            <td
                                              className="border-2 border-gray-400 px-4 py-2 sticky left-0 bg-white"
                                              style={{
                                                width: "180px",
                                                minWidth: "180px",
                                              }}
                                            >
                                              <input
                                                type="date"
                                                value={rows[0]?.startDate || ""}
                                                min={fromDate || ""}
                                                max={toDate || ""}
                                                onChange={(e) =>
                                                  handleChange(
                                                    0,
                                                    "startDate",
                                                    e.target.value
                                                  )
                                                }
                                                className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-pink-400"
                                              />
                                            </td>

                                            {/* Daily Headings (Textareas for each heading) */}
                                            {(dailyHeading || []).map(
                                              (item, colIndex) => (
                                                <td
                                                  key={
                                                    item.lesson_plan_headings_id
                                                  }
                                                  className={`border-2 px-2 py-1 align-top ${
                                                    colIndex === 0
                                                      ? "sticky left-[180px] bg-white"
                                                      : ""
                                                  }`}
                                                  style={{
                                                    width: "220px",
                                                    minWidth: "220px",
                                                  }}
                                                >
                                                  <textarea
                                                    value={
                                                      studentRemarks[
                                                        `${item.lesson_plan_headings_id}_0`
                                                      ] ??
                                                      timetable[0]?.[
                                                        `description_${item.lesson_plan_headings_id}_1`
                                                      ] ??
                                                      ""
                                                    }
                                                    onChange={(e) =>
                                                      setStudentRemarks(
                                                        (prev) => ({
                                                          ...prev,
                                                          [`${item.lesson_plan_headings_id}_0`]:
                                                            e.target.value,
                                                        })
                                                      )
                                                    }
                                                    className="w-full resize-none p-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-pink-400 rounded"
                                                    style={{
                                                      minHeight: "100px",
                                                      lineHeight: "1.5em",
                                                      boxSizing: "border-box",
                                                    }}
                                                    rows={2}
                                                  />
                                                </td>
                                              )
                                            )}

                                            {/* Delete Button */}
                                            <td
                                              className="border-2 px-2 py-2 text-center"
                                              style={{ minWidth: "60px" }}
                                            >
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  handleRemoveRow(0)
                                                }
                                                className="text-red-500 hover:text-red-700"
                                              >
                                                ✕
                                              </button>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="absolute left-[1%] w-[100%] text-center flex justify-center items-center mt-14">
                              <div className="text-center text-xl text-red-700">
                                Oops! No data found..
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pr-3 mb-4 mr-10">
                        <button
                          onClick={handleUpdate}
                          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded mr-2"
                        >
                          {loading ? "Updating" : "Update"}
                        </button>
                        <button
                          onClick={() => navigate("/lessonPlan")}
                          className="bg-yellow-300 hover:bg-yellow-400 text-white font-semibold px-4 py-2 rounded"
                        >
                          Back
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              </>
            )}
          </>
        </div>
      </div>
    </>
  );
};

export default EditLessonPlanTemplate;
