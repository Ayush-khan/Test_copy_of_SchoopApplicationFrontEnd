import React from "react";
import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import Select, { components } from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";
import { FiPlus, FiX } from "react-icons/fi";
import { FaRegCalendarAlt } from "react-icons/fa";

const CheckboxOption = (props) => {
  return (
    <components.Option {...props}>
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={props.isSelected}
          onChange={() => null}
          className="mr-2"
        />
        <label>{props.label}</label>
      </div>
    </components.Option>
  );
};

const CreateLessonPlan = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const academicYrFrom = localStorage.getItem("academic_yr_from");
  const academicYrTo = localStorage.getItem("academic_yr_to");

  const minDate = academicYrFrom ? dayjs(academicYrFrom).toDate() : null;
  const maxDate = academicYrTo ? dayjs(academicYrTo).toDate() : null;

  const [loading, setLoading] = useState(null);
  const [numPeriods, setNumPeriods] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("");

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

  const navigate = useNavigate();
  const [loadingExams, setLoadingExams] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [timetable, setTimetable] = useState([]);

  const pageSize = 10;
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const [studentRemarks, setStudentRemarks] = useState({});
  const [showStudentReport, setShowStudentReport] = useState(false);

  const [roleId, setRoleId] = useState("");
  const [roleIdValue, setRoleIdValue] = useState("");

  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [allSubject, setAllSubject] = useState([]);
  const [allChapter, setAllChapter] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedChapterId, setSelectedChapterId] = useState(null);

  const [loadingForSearch, setLoadingForSearch] = useState(false);

  const [studentError, setStudentError] = useState("");
  const [subjectError, setSubjectError] = useState("");
  const [chapterError, setChapterError] = useState("");
  const [heading, setHeadings] = useState([]); // for non-daily
  const [dailyHeading, setDailyHeadings] = useState([]);

  const [weekError, setWeekError] = useState(false);
  const [weekRange, setWeekRange] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
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

  useEffect(() => {
    fetchDataRoleId();
  }, []);

  useEffect(() => {
    if (!roleIdValue) return; // guard against empty
    fetchExams(roleIdValue);
  }, [roleIdValue]);

  const fetchDataRoleId = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      return {};
    }

    try {
      const sessionResponse = await axios.get(`${API_URL}/api/sessionData`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const roleId = sessionResponse?.data?.user?.role_id;
      const regId = sessionResponse?.data?.user?.reg_id;

      setRoleId(roleId);
      setRoleIdValue(regId);

      return { roleId, roleIdValue: regId };
    } catch (error) {
      return {};
    }
  };

  const fetchExams = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/get_teacherclasseswithclassteacher?teacher_id=${roleIdValue}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // console.log("Classes", response.data.data);
      setStudentNameWithClassId(response?.data?.data || []);
    } catch (error) {
      toast.error("Error fetching Classes");
      // console.error("Error fetching Classes:", error);
    }
  };

  const fetchSubjectNames = async (classId) => {
    if (!classId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/api/get_subjects_according_class?class_id=${classId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // console.log("✅ Subjects fetched:", response.data.data);
      setAllSubject(response.data.data || []);
    } catch (error) {
      console.error("❌ Error fetching subject names:", error);
      toast.error("Error fetching subject names");
    } finally {
      setLoading(false);
    }
  };

  const fetchChaptersNames = async (classId, subjectId) => {
    if (!classId || !subjectId) return;

    // console.log("📌 fetchChaptersNames called with:", {
    //   classId,
    //   subjectId,
    // }); // log the values

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/api/get_chapter_info_class_sub_id?class_id=${classId}&subject_id=${subjectId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // console.log("✅ fetch chapters response:", response.data.data);
      setAllChapter(response.data.data || []);
    } catch (error) {
      console.error("❌ Error fetching chapters names:", error);
      toast.error("Error fetching chapters names");
    } finally {
      setLoading(false);
    }
  };

  const chapterOptions = useMemo(
    () =>
      Array.isArray(allChapter)
        ? allChapter.map((chapter) => ({
            value: chapter.chapter_id,
            label: chapter.name,
          }))
        : [],
    [allChapter]
  );

  const subjectOptions = useMemo(
    () =>
      Array.isArray(allSubject)
        ? allSubject.map((cls) => ({
            value: cls?.sm_id,
            label: `${cls.name}`,
          }))
        : [],
    [allSubject]
  );

  const studentOptions = useMemo(
    () =>
      Array.isArray(studentNameWithClassId)
        ? studentNameWithClassId.map((cls) => ({
            value: `${cls.class_id}-${cls.section_id}`,
            label: `${cls.classname} ${cls.sectionname}`,
            class_id: cls.class_id,
            section_id: cls.section_id,
          }))
        : [],
    [studentNameWithClassId]
  );

  const Option = (props) => {
    return (
      <components.Option {...props}>
        <input
          type="checkbox"
          checked={props.isSelected}
          onChange={() => null}
          className="mr-2"
        />
        <label>{props.label}</label>
      </components.Option>
    );
  };
  const handleSelectChange = (selected) => {
    if (!selected || selected.length === 0) {
      setSelectedStudent([]);
      return;
    }

    // Extract all class_ids
    const classIds = selected.map((s) => s.class_id);
    const uniqueClassIds = [...new Set(classIds)];

    if (uniqueClassIds.length > 1) {
      toast.warn("Please select sections from the same class only!", {
        position: "top-center",
        autoClose: 2000,
      });
      return; // stop here
    }

    // ✅ Valid selection (same class)
    setSelectedStudent(selected);

    // 📘 Call subject API for this class only
    const classId = uniqueClassIds[0];
    // console.log("📘 Calling subject API with class_id:", classId);
    fetchSubjectNames(classId);
  };

  useEffect(() => {
    if (!selectedStudent || selectedStudent.length === 0 || !selectedSubject)
      return;

    const classId = selectedStudent[0].class_id; // pick the first one
    const subjectId = selectedSubject.value;

    // console.log("📌 useEffect trigger: classId & subjectId", {
    //   classId,
    //   subjectId,
    // });

    fetchChaptersNames(classId, subjectId);
  }, [selectedStudent, selectedSubject]);

  useEffect(() => {
    if (!selectedStudent) return;
    fetchSubjectNames(selectedStudent.value);
  }, [selectedStudent]);

  useEffect(() => {
    if (!selectedStudent || !selectedSubject) return;

    const classId = selectedStudent.value;
    const subjectId = selectedSubject.value;

    // console.log("📌 useEffect trigger: classId & subjectId", {
    //   classId,
    //   subjectId,
    // });

    fetchChaptersNames(classId, subjectId);
  }, [selectedStudent, selectedSubject]);

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
    fetchHeadings();
    fetchDailyHeadings();
  }, []);

  const camelCase = (str) =>
    str
      ?.toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const handleSearch = async () => {
    setStudentError("");
    setSubjectError("");
    setChapterError("");
    setSearchTerm("");
    setTimetable([]);
    setStudentRemarks({});
    setShowStudentReport(false);

    if (!selectedStudent || selectedStudent.length === 0) {
      setStudentError("Please select class.");
      return;
    }
    if (!selectedSubjectId) {
      setSubjectError("Please select subject.");
      return;
    }
    if (!selectedChapterId) {
      setChapterError("Please select chapter.");
      return;
    }

    setLoading(true);
    setLoadingForSearch(true);
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Authentication token missing. Please login again.");
        return;
      }

      const classId = selectedStudent[0].class_id;
      const sectionIds = selectedStudent.map((s) => s.section_id).join(",");
      const classIdArray = selectedStudent.map(
        (s) => `${s.class_id}^${s.section_id}`
      );

      const params = {
        class_id: classId,
        section_id: sectionIds,
        sm_id: selectedSubjectId,
        chapter_id: selectedChapterId,
        class_id_array: classIdArray,
      };

      const response = await axios.get(
        `${API_URL}/api/get_lesson_plan_details`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
          paramsSerializer: (params) =>
            Object.entries(params)
              .map(([key, value]) =>
                Array.isArray(value)
                  ? value
                      .map((v) => `${key}=${encodeURIComponent(v)}`)
                      .join("&")
                  : `${key}=${encodeURIComponent(value)}`
              )
              .join("&"),
        }
      );

      // ✅ Check body-level response status
      if (response?.data?.status === 400) {
        toast.error(
          response?.data?.message || "Lesson Plan Template is not created!!!"
        );
        setLoading(false);
        setLoadingForSearch(false);
        setIsSubmitting(false);
        return;
      }

      const apiData = response?.data?.data || {};
      const lessonPlanData = apiData.lesson_plan_info1 || [];
      const isPresent = apiData.present_data === true;
      const unqId = apiData.unq_id;

      console.log("✅ present_data:", isPresent ? "true" : "false");
      console.log("📘 handleSearch API data:", apiData);

      if (isPresent && unqId) {
        console.log("Existing lesson plan found. Navigating to Edit:", unqId);

        navigate(`/lessonPlan/edit/${unqId}`, {
          state: {
            headings: heading,
            selectedStudent,
            selectedSubject,
            selectedChapter,
            selectedStudentId,
            selectedSubjectId,
            selectedChapterId,
            unq_id: unqId,
          },
        });
        return;
      }

      if (lessonPlanData.length === 0) {
        setTimetable([{ unq_id: "new" }]);
        setPageCount(1);
        setShowStudentReport(true);
        return;
      }

      const grouped = {};
      lessonPlanData.forEach((item) => {
        const uniqId = item.unq_id;
        if (!grouped[uniqId]) grouped[uniqId] = { unq_id: uniqId };
        grouped[uniqId][item.lesson_plan_headings_id] = item.description || "";
      });

      const timetableForDisplay = Object.values(grouped);
      console.log("🧩 Grouped Timetable (new):", timetableForDisplay);

      const remarks = {};
      timetableForDisplay.forEach((template) => {
        Object.keys(template).forEach((key) => {
          if (key !== "unq_id") remarks[key] = template[key];
        });
      });

      setTimetable(timetableForDisplay);
      setStudentRemarks(remarks);
      setPageCount(Math.ceil(timetableForDisplay.length / pageSize));
      setShowStudentReport(true);
    } catch (error) {
      console.error("❌ Error fetching Lesson Plan:", error);
      toast.error("Error fetching Lesson Plan. Please try again.");
    } finally {
      setLoading(false);
      setLoadingForSearch(false);
      setIsSubmitting(false);
    }
  };

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

  const handleSubmit = async () => {
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
            class_id: s.class_id,
            section_id: s.section_id || "0",
          }))
        : selectedStudent
        ? [
            {
              class_id: selectedStudent.class_id,
              section_id: selectedStudent.section_id || "0",
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

      // 🔸 Prepare IDs
      const classId = studentsArray[0].class_id?.toString() || "0";
      const sectionIds = studentsArray
        .map((s) => s.section_id?.toString() || "0")
        .join(",");
      const classIdArray = studentsArray.map(
        (s) => `${s.class_id}^${s.section_id}`
      );

      // 🔸 Prepare description fields
      const descriptions = {};

      // ✅ Loop headings (normal)
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

      // ✅ Loop daily headings (from textarea)
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

      // 🔸 Validate if at least one description is filled
      const hasAnyDescription = Object.values(descriptions).some(
        (val) => val && val.trim() !== ""
      );
      if (!hasAnyDescription) {
        toast.error("Please enter at least one description before saving.");
        setIsSubmitting(false);
        return;
      }

      // 🔸 Validate teaching points (daily)
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

      // ✅ Build payload
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

      const response = await axios.post(
        `${API_URL}/api/save_lesson_plan`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === 200) {
        toast.success("Lesson plan saved successfully!");
        navigate("/lessonPlan");
        setStudentRemarks({});
        setTimetable([]);
        setWeekRange("");
        setNumPeriods("");
      } else {
        toast.error(response.data.message || "Failed to save lesson plan.");
      }
    } catch (error) {
      console.error("❌ Error saving lesson plan:", error);
      toast.error("An error occurred while saving the lesson plan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log("row", timetable);

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
          {!showStudentReport && (
            <>
              <div className=" card-header mb-4 flex justify-between items-center ">
                <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
                  Lesson Plan
                </h5>
                <RxCross1
                  className=" relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                  //   onClick={() => setShowStudentReport(false)}
                  onClick={() => navigate("/lessonPlan")}
                />
              </div>
              <div
                className=" relative w-[97%]   -top-6 h-1  mx-auto bg-red-700"
                style={{
                  backgroundColor: "#C03078",
                }}
              ></div>
            </>
          )}
          <>
            {!showStudentReport && (
              <div className=" w-full md:w-[100%]   flex justify-center flex-col md:flex-row gap-x-1 ml-0 p-2">
                <div className="w-full md:w-[99%] flex md:flex-row justify-between items-center mt-0 md:mt-4">
                  <div className="w-full md:w-[99%]  gap-x-0 md:gap-x-10 flex flex-col gap-y-2 md:gap-y-0 md:flex-row">
                    {/* Teacher */}
                    <div className="w-full  md:w-[50%] gap-x-3 justify-around my-1 md:my-4 flex md:flex-row">
                      <label
                        className="w-full md:w-[25%] text-md pl-0 md:pl-5 mt-1.5"
                        htmlFor="studentSelect"
                      >
                        Class <span className="text-red-500">*</span>
                      </label>
                      <div className="w-full md:w-[50%]">
                        <Select
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          id="studentSelect"
                          isMulti
                          closeMenuOnSelect={false}
                          hideSelectedOptions={false}
                          options={studentOptions}
                          value={selectedStudent}
                          onChange={handleSelectChange}
                          placeholder={loadingExams ? "Loading..." : "Select"}
                          isSearchable
                          isClearable
                          isDisabled={loadingExams}
                          className="text-sm"
                          components={{ Option }}
                          styles={{
                            control: (provided) => ({
                              ...provided,
                              fontSize: ".9em",
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
                    {/* Month */}
                    <div className="w-full  md:w-[50%] gap-x-3 justify-around my-1 md:my-4 flex md:flex-row">
                      <label
                        className="w-full md:w-[35%] text-md pl-0 md:pl-5 mt-1.5"
                        htmlFor="studentSelect"
                      >
                        Subject<span className="text-red-500">*</span>
                      </label>
                      <div className="w-full md:w-[65%]">
                        <Select
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          id="studentSelect"
                          options={subjectOptions}
                          value={
                            subjectOptions.find(
                              (opt) => opt.value === selectedSubject?.value
                            ) || selectedSubject
                          }
                          onChange={(selected) => {
                            setSelectedSubject(selected);
                            setSelectedSubjectId(
                              selected ? selected.value : null
                            );
                            if (selected) setSubjectError(""); // ✅ Clear error
                            else setSubjectError("Please select subject.");
                          }}
                          placeholder={loadingExams ? "Loading..." : "Select"}
                          isSearchable
                          isClearable
                          className="text-sm"
                          isDisabled={loadingExams}
                          styles={{
                            control: (provided) => ({
                              ...provided,
                              fontSize: ".9em", // Adjust font size for selected value
                              minHeight: "30px", // Reduce height
                            }),
                            menu: (provided) => ({
                              ...provided,
                              fontSize: "1em", // Adjust font size for dropdown options
                            }),
                            option: (provided) => ({
                              ...provided,
                              fontSize: ".9em", // Adjust font size for each option
                            }),
                          }}
                        />
                        {subjectError && (
                          <div className="h-8 relative ml-1 text-danger text-xs">
                            {subjectError}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="w-full  md:w-[60%] gap-x-3 justify-around my-1 md:my-4 flex md:flex-row">
                      <label
                        className="w-full md:w-[35%] text-md pl-0 md:pl-5 mt-1.5"
                        htmlFor="studentSelect"
                      >
                        Chapter<span className="text-red-500">*</span>
                      </label>
                      <div className="w-full md:w-[65%]">
                        <Select
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          id="studentSelect"
                          options={chapterOptions}
                          value={
                            chapterOptions.find(
                              (opt) => opt.value === selectedChapter?.value
                            ) || selectedChapter
                          }
                          onChange={(selected) => {
                            setSelectedChapter(selected);
                            setSelectedChapterId(
                              selected ? selected.value : null
                            );
                            if (selected) setChapterError("");
                            else setChapterError("Please select chapter.");
                          }}
                          placeholder={loadingExams ? "Loading..." : "Select"}
                          isSearchable
                          isClearable
                          className="text-sm"
                          isDisabled={loadingExams}
                          styles={{
                            control: (provided) => ({
                              ...provided,
                              fontSize: ".9em",
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
                        {chapterError && (
                          <div className="h-8 relative ml-1 text-danger text-xs">
                            {chapterError}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Browse Button */}
                    <div className="mt-1">
                      <button
                        type="search"
                        onClick={handleSearch}
                        style={{ backgroundColor: "#2196F3" }}
                        className={`btn h-10 w-18 md:w-auto btn-primary text-white font-bold py-1 border-1 border-blue-500 px-4 rounded ${
                          loadingForSearch
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
                  <div className="w-full  mx-auto transition-all duration-300">
                    <div className="card mx-auto shadow-lg">
                      <div className="p-2 px-3 bg-gray-100 border-none flex items-center justify-between">
                        <div className="w-full flex flex-row items-center justify-between mr-0 md:mr-4 gap-x-1">
                          <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap mr-6">
                            Lesson Plan
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
                                    Class{" "}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <Select
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    id="studentSelect"
                                    isMulti={true}
                                    options={studentOptions}
                                    value={selectedStudent}
                                    onChange={(selected) => {
                                      setSelectedStudent(selected || []);
                                      if (selected && selected.length > 0)
                                        setStudentError("");
                                      else
                                        setStudentError("Please select class.");
                                    }}
                                    placeholder={
                                      loadingExams ? "Loading..." : "Select"
                                    }
                                    isSearchable
                                    isClearable
                                    className="text-sm min-w-[180px]"
                                    isDisabled={loadingExams}
                                    closeMenuOnSelect={false}
                                    hideSelectedOptions={false}
                                    styles={{
                                      control: (provided) => ({
                                        ...provided,
                                        fontSize: ".9em",
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
                                    components={{ Option: CheckboxOption }}
                                  />
                                </div>

                                {/* Month */}
                                <div className="flex items-center gap-3">
                                  <label
                                    className="text-md whitespace-nowrap"
                                    htmlFor="monthSelect"
                                  >
                                    Subject{" "}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <Select
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    id="monthSelect"
                                    options={subjectOptions}
                                    value={
                                      subjectOptions.find(
                                        (opt) =>
                                          opt.value === selectedSubject?.value
                                      ) || selectedSubject
                                    }
                                    onChange={(selected) => {
                                      setSelectedSubject(selected);
                                      setSelectedSubjectId(
                                        selected ? selected.value : null
                                      );
                                      if (selected)
                                        setSubjectError(""); // ✅ Clear error
                                      else
                                        setSubjectError(
                                          "Please select subject."
                                        );
                                    }}
                                    placeholder={
                                      loadingExams ? "Loading..." : "Select"
                                    }
                                    isSearchable
                                    isClearable
                                    className="text-sm min-w-[180px]"
                                    isDisabled={loadingExams}
                                    styles={{
                                      control: (provided) => ({
                                        ...provided,
                                        fontSize: ".9em",
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
                                </div>

                                <div className="flex items-center gap-3">
                                  <label
                                    className="text-md whitespace-nowrap"
                                    htmlFor="chapterSelect"
                                  >
                                    Chpater{" "}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <Select
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    id="chapterSelect"
                                    options={chapterOptions}
                                    value={
                                      chapterOptions.find(
                                        (opt) =>
                                          opt.value === selectedChapter?.value
                                      ) || selectedChapter
                                    }
                                    onChange={(selected) =>
                                      setSelectedChapter(selected)
                                    }
                                    isLoading={loading}
                                    placeholder={
                                      loadingExams ? "Loading..." : "Select"
                                    }
                                    isSearchable
                                    isClearable
                                    className="text-sm min-w-[180px]"
                                    isDisabled={loadingExams}
                                    styles={{
                                      control: (provided) => ({
                                        ...provided,
                                        fontSize: ".9em",
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
                                </div>

                                {/* Browse */}
                                <div>
                                  <button
                                    type="search"
                                    onClick={handleSearch}
                                    style={{ backgroundColor: "#2196F3" }}
                                    className={`btn h-8 w-auto btn-primary text-white font-bold py-1 border-1 border-blue-500 px-2 rounded ${
                                      loadingForSearch
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
                        </div>

                        <div className="flex mb-1.5 flex-col md:flex-row gap-x-6 justify-center md:justify-end ">
                          <RxCross1
                            className="text-base text-red-600 cursor-pointer hover:bg-red-100 rounded"
                            onClick={() => setShowStudentReport(false)}
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
                            displayedSections.length > 0 ? (
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

                                {/* Table 2: Non Daily Sections */}
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
                                                          ] ||
                                                          template[
                                                            item
                                                              .lesson_plan_headings_id
                                                          ] ||
                                                          ""
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

                                                          // Handle Enter key for new bullets
                                                          if (
                                                            e.key === "Enter"
                                                          ) {
                                                            e.preventDefault();

                                                            const lineStart =
                                                              value.lastIndexOf(
                                                                "\n",
                                                                selectionStart -
                                                                  1
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
                                                            e.target.value =
                                                              newValue;

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

                                                          if (
                                                            e.key ===
                                                            "Backspace"
                                                          ) {
                                                            const lineStart =
                                                              value.lastIndexOf(
                                                                "\n",
                                                                selectionStart -
                                                                  1
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
                                                              line.trim() ===
                                                                "" ||
                                                              line.startsWith(
                                                                "• "
                                                              )
                                                                ? line
                                                                : "• " + line
                                                            );
                                                          const newValue =
                                                            updatedLines.join(
                                                              "\n"
                                                            );
                                                          if (
                                                            newValue !==
                                                            e.target.value
                                                          ) {
                                                            e.target.value =
                                                              newValue;
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
                                                          boxSizing:
                                                            "border-box",
                                                          lineHeight: "1.5em",
                                                        }}
                                                      />
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

                                {/* Table 3: Daily Teaching Points */}
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
                          onClick={handleSubmit}
                          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded"
                        >
                          {loading ? "Saving" : "Save"}
                        </button>

                        <button
                          onClick={() => setShowStudentReport(false)}
                          className="bg-yellow-300 hover:bg-yellow-400 text-white font-semibold px-4 py-2 rounded"
                        >
                          Back
                        </button>
                      </div>
                    </div>
                  </div>
                </>
                {/* )} */}
              </>
            )}
          </>
        </div>
      </div>
    </>
  );
};

export default CreateLessonPlan;
