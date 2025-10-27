import React from "react";
import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
import { FiPlus } from "react-icons/fi";

import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";
import { useLocation, useParams } from "react-router-dom";

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

  const [timetable, setTimetable] = useState([]);

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

  // useEffect(() => {
  //   const fetchTemplate = async () => {
  //     setLoading(true);

  //     try {
  //       const token = localStorage.getItem("authToken");
  //       const response = await axios.get(
  //         `${API_URL}/api/get_lesson_plan_by_unq_id/${id}`,

  //         {
  //           headers: { Authorization: `Bearer ${token}` },
  //         }
  //       );

  //       const data = response?.data?.data || [];
  //       const dataArray = Array.isArray(data) ? data : [data];

  //       setPublish(dataArray[0].publish);
  //       console.log("check pu", dataArray[0].publish);
  //       // Group details by heading for each template
  //       const timetableArray = dataArray.map((template) => {
  //         const grouped = {};
  //         (template.details || []).forEach((desc) => {
  //           if (!grouped[desc.lesson_plan_headings_id])
  //             grouped[desc.lesson_plan_headings_id] = [];
  //           grouped[desc.lesson_plan_headings_id].push(desc);
  //         });
  //         return {
  //           ...template,
  //           groupedDetails: grouped, // rename groupedDescriptions -> groupedDetails
  //         };
  //       });

  //       setTimetable(timetableArray);

  //       // Prepare studentRemarks: pick first description for each heading as default
  //       const remarks = {};
  //       timetableArray.forEach((template) => {
  //         Object.keys(template.groupedDetails).forEach((headingId) => {
  //           remarks[headingId] =
  //             template.groupedDetails[headingId][0].description || "";
  //         });
  //       });
  //       setStudentRemarks(remarks);

  //       console.log("row", timetableArray);
  //       console.log("studentRemarks", remarks);
  //     } catch (err) {
  //       toast.error("Error fetching lesson plan template");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchTemplate();
  // }, [id]);

  useEffect(() => {
    const fetchTemplate = async () => {
      setLoading(true);

      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          `${API_URL}/api/get_lesson_plan_by_unq_id/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = response?.data?.data || [];

        // Handle both single and array responses
        const dataArray = Array.isArray(data) ? data : [data];

        // Group data by unq_id (each lesson plan)
        const groupedByUnq = dataArray.reduce((acc, item) => {
          const key = item.unq_id;
          if (!acc[key]) acc[key] = [];
          acc[key].push(item);
          return acc;
        }, {});

        // Transform grouped data to timetable format
        const timetableArray = Object.entries(groupedByUnq).map(
          ([unq_id, items]) => {
            const grouped = {};
            items.forEach((desc) => {
              if (!grouped[desc.lesson_plan_headings_id])
                grouped[desc.lesson_plan_headings_id] = [];
              grouped[desc.lesson_plan_headings_id].push(desc);
            });
            return {
              unq_id,
              groupedDetails: grouped,
            };
          }
        );

        // ✅ Store final timetable
        setTimetable(timetableArray);

        // ✅ Prepare remarks for textareas
        const remarks = {};
        timetableArray.forEach((template) => {
          Object.keys(template.groupedDetails).forEach((headingId) => {
            const descriptions = template.groupedDetails[headingId];
            descriptions.forEach((desc, i) => {
              remarks[`${headingId}_${i}`] = desc.description || "";
            });
          });
        });

        setStudentRemarks(remarks);

        console.log("✅ Final Timetable:", timetableArray);
        console.log("✅ Student Remarks:", remarks);
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

  //   const handleUpdate = async () => {
  //     if (isSubmitting) return;
  //     setIsSubmitting(true);

  //     const token = localStorage.getItem("authToken");
  //     if (!token) {
  //       toast.error("Authentication token missing. Please login again.");
  //       setIsSubmitting(false);
  //       return;
  //     }

  //     // collect all filled descriptions
  //     const descriptions = {};
  //     heading.forEach((item, index) => {
  //       const value = studentRemarks[item.lesson_plan_headings_id]?.trim();
  //       if (value) {
  //         descriptions[`description_${index + 1}`] = value;
  //       }
  //     });

  //     if (Object.keys(descriptions).length === 0) {
  //       toast.error("Please enter at least one description before saving.");
  //       setIsSubmitting(false);
  //       return;
  //     }

  //     try {
  //       // 🔹 Same logic as handleSearch
  //       const classId = selectedStudent[0]?.class_id;
  //       const sectionIds = selectedStudent.map((s) => s.section_id).join(",");
  //       const classIdArray = selectedStudent.map(
  //         (s) => `${s.class_id}^${s.section_id}`
  //       );

  //       const payload = {
  //         // operation: "create",
  //         class_id: classId?.toString(),
  //         section_id: sectionIds,
  //         sm_id: selectedSubjectId?.toString(),
  //         chapter_id: selectedChapterId?.toString(),
  //         class_id_array: classIdArray, // include same field if backend expects it
  //         no_of_periods: timetable?.length?.toString() || "1",
  //         weeklyDatePicker: new Date().toISOString().split("T")[0],
  //         les_pln_temp_id: timetable?.[0]?.les_pln_temp_id || "new",
  //         approve: "Y",
  //         lph_dc_row: "1",
  //         start_date: [new Date().toISOString().split("T")[0]],
  //         ...descriptions,
  //       };

  //       const response = await axios.put(
  //         `${API_URL}/api/update_lesson_plan/${id}`,
  //         payload,
  //         {
  //           headers: { Authorization: `Bearer ${token}` },
  //         }
  //       );

  //       if (response.data.status === 200) {
  //         toast.success("Lesson plan saved successfully!");
  //         navigate("/lessonPlan");
  //         setStudentRemarks({});
  //         setTimetable([]);
  //       } else {
  //         toast.error(response.data.message || "Failed to save lesson plan.");
  //       }
  //     } catch (error) {
  //       console.error("❌ Error saving lesson plan:", error);
  //       toast.error("An error occurred while saving the lesson plan.");
  //     } finally {
  //       setIsSubmitting(false);
  //     }
  //   };

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

      // Normalize selectedStudent to always have class_id and section_id
      const studentsArray = Array.isArray(selectedStudent)
        ? selectedStudent.map((s) => ({
            class_id: s.value, // use only value
            section_id: s.section_id || "0",
          }))
        : selectedStudent
        ? [
            {
              class_id: selectedStudent.value,
              section_id: selectedStudent.section_id || "0",
            },
          ]
        : [];

      if (!studentsArray.length) {
        toast.error("Please select at least one student/class before saving.");
        setIsSubmitting(false);
        return;
      }

      // Validate class_id and section_id
      const invalidStudent = studentsArray.find(
        (s) => !s.class_id || s.section_id === undefined || s.section_id === ""
      );
      if (invalidStudent) {
        toast.error("Selected student has invalid class or section.");
        setIsSubmitting(false);
        return;
      }

      // Prepare class_id and section_id (section_id comma-separated)
      const classId = studentsArray[0].class_id?.toString() || "0";
      const sectionIds = studentsArray
        .map((s) => s.section_id?.toString() || "0")
        .join(",");
      const classIdArray = studentsArray.map(
        (s) => `${s.class_id}^${s.section_id}`
      );

      // Collect all filled descriptions
      const descriptions = {};
      heading.forEach((item) => {
        const headingId = item.lesson_plan_headings_id;
        const group = timetable?.[0]?.groupedDetails?.[headingId] || [];

        if (group.length > 0) {
          group.forEach((desc, i) => {
            const keyPrefix = item.isDaily ? "dc_description" : "description";
            descriptions[`${keyPrefix}_${headingId}_${i + 1}`] =
              studentRemarks[`${headingId}_${i}`] || desc.description || "";
          });
        } else {
          const keyPrefix = item.isDaily ? "dc_description" : "description";
          const value = studentRemarks[headingId] || "";
          if (value) descriptions[`${keyPrefix}_${headingId}_1`] = value;
        }
      });

      if (Object.keys(descriptions).length === 0) {
        toast.error("Please enter at least one description before saving.");
        setIsSubmitting(false);
        return;
      }

      // Build payload
      const payload = {
        class_id: classId,
        section_id: sectionIds,
        sm_id: selectedSubjectId?.toString() || "0",
        chapter_id: selectedChapterId?.toString() || "0",
        class_id_array: classIdArray,
        no_of_periods: timetable?.length?.toString() || "1",
        weeklyDatePicker: new Date().toISOString().split("T")[0],
        les_pln_temp_id: timetable?.[0]?.les_pln_temp_id || "new",
        approve: "Y",
        lph_dc_row: "1",
        start_date: [new Date().toISOString().split("T")[0]],
        ...descriptions,
      };

      // Optional: include existing lesson_plan_id & unq_id for edit mode
      if (timetable?.[0]?.lesson_plan_id)
        payload.lesson_plan_id = timetable[0].lesson_plan_id;
      if (timetable?.[0]?.unq_id) payload.unq_id = timetable[0].unq_id;

      // ✅ Log the final payload
      console.log("🚀 Payload being sent to API:", payload);

      // Send PUT request
      const response = await axios.put(
        `${API_URL}/api/update_lesson_plan/${id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.status === 200) {
        toast.success("Lesson plan updated successfully!");
        navigate("/lessonPlan");
        setStudentRemarks({});
        setTimetable([]);
      } else {
        toast.error(response.data.message || "Failed to update lesson plan.");
      }
    } catch (error) {
      console.error("Error saving lesson plan:", error);
      toast.error("An error occurred while saving the lesson plan.");
    } finally {
      setIsSubmitting(false);
    }
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

  //     // Ensure selectedStudent is always an array
  //     const studentsArray = Array.isArray(selectedStudent)
  //       ? selectedStudent
  //       : selectedStudent
  //       ? [selectedStudent]
  //       : [];

  //     if (!studentsArray.length) {
  //       toast.error("Please select at least one student/class before saving.");
  //       setIsSubmitting(false);
  //       return;
  //     }

  //     // Validate class_id and section_id
  //     const invalidStudent = studentsArray.find(
  //       (s) => !s.class_id || s.section_id === undefined || s.section_id === ""
  //     );
  //     if (invalidStudent) {
  //       toast.error("Selected student has invalid class or section.");
  //       setIsSubmitting(false);
  //       return;
  //     }

  //     // Collect all filled descriptions
  //     const descriptions = {};
  //     heading.forEach((item, index) => {
  //       const value = studentRemarks[item.lesson_plan_headings_id]?.trim();
  //       if (value) {
  //         descriptions[`description_${index + 1}`] = value;
  //       }
  //     });

  //     if (Object.keys(descriptions).length === 0) {
  //       toast.error("Please enter at least one description before saving.");
  //       setIsSubmitting(false);
  //       return;
  //     }

  //     // Prepare payload
  //     const classId = studentsArray[0].class_id?.toString();
  //     const sectionIds = studentsArray
  //       .map((s) => s.section_id?.toString())
  //       .join(",");
  //     const classIdArray = studentsArray.map(
  //       (s) =>
  //         `${s.class_id?.toString() || "0"}^${s.section_id?.toString() || "0"}`
  //     );

  //     const payload = {
  //       class_id: classId || "0",
  //       section_id: sectionIds || "0",
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

  //     // Send PUT request
  //     const response = await axios.put(
  //       `${API_URL}/api/update_lesson_plan/${id}`,
  //       payload,
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       }
  //     );

  //     if (response.data.status === 200) {
  //       toast.success("Lesson plan saved successfully!");
  //       navigate("/lessonPlan");
  //       setStudentRemarks({});
  //       setTimetable([]);
  //     } else {
  //       toast.error(response.data.message || "Failed to save lesson plan.");
  //     }
  //   } catch (error) {
  //     console.error(" Error saving lesson plan:", error);
  //     toast.error("An error occurred while saving the lesson plan.");
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

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
                                        {timetable.length > 0 ? (
                                          timetable.map(
                                            (template, rowIndex) => (
                                              <tr
                                                key={
                                                  template.les_pln_id ||
                                                  rowIndex
                                                }
                                                className="text-left text-sm text-gray-700"
                                                style={{ height: "250px" }}
                                              >
                                                {(heading || []).map(
                                                  (item, colIndex) => (
                                                    // <td
                                                    //   key={
                                                    //     item.lesson_plan_headings_id
                                                    //   }
                                                    //   className={`border-2 px-2 py-1 ${
                                                    //     colIndex === 0
                                                    //       ? "sticky left-0 bg-white"
                                                    //       : ""
                                                    //   }`}
                                                    //   style={{
                                                    //     width: "210px",
                                                    //     minHeight: "250px",
                                                    //   }}
                                                    // >
                                                    //   <textarea
                                                    //     value={
                                                    //       studentRemarks[
                                                    //         item
                                                    //           .lesson_plan_headings_id
                                                    //       ] ||
                                                    //       template[
                                                    //         item
                                                    //           .lesson_plan_headings_id
                                                    //       ] ||
                                                    //       ""
                                                    //     }
                                                    //     onChange={(e) =>
                                                    //       setStudentRemarks(
                                                    //         (prev) => ({
                                                    //           ...prev,
                                                    //           [item.lesson_plan_headings_id]:
                                                    //             e.target.value,
                                                    //         })
                                                    //       )
                                                    //     }
                                                    //     className="w-full h-full resize-none p-2 border border-gray-300 focus:outline-none"
                                                    //     style={{
                                                    //       minHeight: "250px",
                                                    //       height: "100%",
                                                    //       boxSizing:
                                                    //         "border-box",
                                                    //       lineHeight: "1.5em",
                                                    //     }}
                                                    //   />
                                                    // </td>

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
                                                      {(
                                                        template.groupedDetails[
                                                          item
                                                            .lesson_plan_headings_id
                                                        ] || []
                                                      ).map((desc, i) => (
                                                        <textarea
                                                          key={i}
                                                          value={
                                                            studentRemarks[
                                                              `${item.lesson_plan_headings_id}_${i}`
                                                            ] ??
                                                            desc.description ??
                                                            ""
                                                          }
                                                          onChange={(e) =>
                                                            setStudentRemarks(
                                                              (prev) => ({
                                                                ...prev,
                                                                [`${item.lesson_plan_headings_id}_${i}`]:
                                                                  e.target
                                                                    .value,
                                                              })
                                                            )
                                                          }
                                                          className="w-full h-full resize-none p-2 border border-gray-300 focus:outline-none"
                                                          style={{
                                                            minHeight: "250px",
                                                            height: "100%",
                                                            boxSizing:
                                                              "border-box",
                                                            lineHeight: "1.5em",
                                                          }}
                                                        />
                                                      ))}

                                                      {/* Handle if there’s no saved data yet */}
                                                      {(!template
                                                        .groupedDetails[
                                                        item
                                                          .lesson_plan_headings_id
                                                      ] ||
                                                        template.groupedDetails[
                                                          item
                                                            .lesson_plan_headings_id
                                                        ].length === 0) && (
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
                                                                  e.target
                                                                    .value,
                                                              })
                                                            )
                                                          }
                                                          className="w-full h-full resize-none p-2 border border-gray-300 focus:outline-none"
                                                          style={{
                                                            minHeight: "250px",
                                                            height: "100%",
                                                            boxSizing:
                                                              "border-box",
                                                            lineHeight: "1.5em",
                                                          }}
                                                        />
                                                      )}
                                                    </td>
                                                  )
                                                )}
                                              </tr>
                                            )
                                          )
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
                                    <div className="w-2/3 border p-3 rounded bg-gray-50">
                                      <table className="w-full table-auto border-collapse text-sm">
                                        <thead>
                                          <tr className="bg-gray-200 border-2 border-gray-400">
                                            <th className="border-2 px-4 py-2 text-left w-[19%] text-sm font-semibold text-gray-800">
                                              Start Date
                                            </th>
                                            <th className="border-2 px-4 py-2 text-left text-sm font-semibold text-gray-800">
                                              {(heading || [])
                                                .filter(
                                                  (item) =>
                                                    item.change_daily === "N"
                                                )
                                                .map((item, i) => (
                                                  <th
                                                    key={
                                                      item.lesson_plan_headings_id
                                                    }
                                                    className={`px-6 py-2 text-sm font-semibold text-center text-gray-800 ${
                                                      i === 0
                                                        ? "sticky left-0 bg-gray-200"
                                                        : ""
                                                    }`}
                                                    //  border-2
                                                    style={{ width: "210px" }}
                                                  >
                                                    {item.name}
                                                  </th>
                                                ))}
                                            </th>
                                            <th className="border-2 px-4 py-2 w-12">
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
                                          {rows.map((entry, idx) => (
                                            <tr
                                              key={idx}
                                              className="even:bg-white odd:bg-gray-50 border-2 border-gray-400 "
                                            >
                                              <td className="border-2 border-gray-400 px-4 py-2">
                                                <input
                                                  type="date"
                                                  value={entry.startDate}
                                                  onChange={(e) =>
                                                    handleChange(
                                                      idx,
                                                      "startDate",
                                                      e.target.value
                                                    )
                                                  }
                                                  className="w-full p-2 border border-gray-300 rounded"
                                                />
                                              </td>

                                              <td className="border-2 py-2 px-2">
                                                <textarea
                                                  value={entry.description}
                                                  onChange={(e) =>
                                                    handleChange(
                                                      idx,
                                                      "description",
                                                      e.target.value
                                                    )
                                                  }
                                                  className="w-full resize-none p-2 border border-gray-400 rounded focus:outline-none"
                                                  style={{
                                                    minHeight: "60px",
                                                    lineHeight: "1.5em",
                                                    marginBottom: "6px",
                                                  }}
                                                  placeholder="Enter description"
                                                />
                                              </td>
                                              <td className="border-2 px-2 py-2 text-center">
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    handleRemoveRow(idx)
                                                  }
                                                  className="text-red-500 hover:text-red-700"
                                                >
                                                  ✕
                                                </button>
                                              </td>
                                            </tr>
                                          ))}
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
