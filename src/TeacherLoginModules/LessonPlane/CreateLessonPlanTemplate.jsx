import React from "react";
import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";

import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";

const CreateLessonPlanTemplate = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [selectedStudent, setSelectedStudent] = useState(null);
  const academicYrFrom = localStorage.getItem("academic_yr_from");
  const academicYrTo = localStorage.getItem("academic_yr_to");

  const minDate = academicYrFrom ? dayjs(academicYrFrom).toDate() : null;
  const maxDate = academicYrTo ? dayjs(academicYrTo).toDate() : null;

  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedChapterId, setSelectedChapterId] = useState(null);

  const [loadingForSearch, setLoadingForSearch] = useState(false);
  const [loading, setLoading] = useState(null);

  const navigate = useNavigate();
  const [loadingExams, setLoadingExams] = useState(false);
  const [studentError, setStudentError] = useState("");
  const [subjectError, setSubjectError] = useState("");
  const [chapterError, setChapterError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const [timetable, setTimetable] = useState([]);

  const pageSize = 10;
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const [studentRemarks, setStudentRemarks] = useState({});
  const [showStudentReport, setShowStudentReport] = useState(false);

  const [roleID, setRoleId] = useState(null);
  const [roleIdValue, setRoleIdValue] = useState(null);

  const [allSubject, setAllSubject] = useState([]);
  const [allChapter, setAllChapter] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [heading, setHeadings] = useState([]);

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
      // console.error("No authentication token found");
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

      // console.log("roleid", roleId);
      // console.log("regid", regId);

      setRoleId(roleId);
      setRoleIdValue(regId);

      return { roleId, roleIdValue: regId };
    } catch (error) {
      return {};
    }
  };

  const fetchExams = async () => {
    try {
      setLoadingExams(true);
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/get_only_classes_allotted_to_teacher?teacher_id=${roleIdValue}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // console.log("Classes", response.data.data);
      setStudentNameWithClassId(response?.data?.data || []);
    } catch (error) {
      toast.error("Error fetching Classes");
      // console.error("Error fetching Classes:", error);
    } finally {
      setLoadingExams(false);
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
      // console.log("fetch subjects", response.data.data);
      setAllSubject(response.data.data || []);
    } catch (error) {
      toast.error("Error fetching subject names");
    } finally {
      setLoading(false);
    }
  };

  const fetchChaptersNames = async (classId, SubjectId) => {
    if (!classId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/api/get_chapter_info_class_sub_id?class_id=${classId}&subject_id=${SubjectId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // console.log("fetch chapters", response.data.data);
      setAllChapter(response.data.data || []);
    } catch (error) {
      toast.error("Error fetching chapters names");
    } finally {
      setLoading(false);
    }
  };

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
          value: cls?.class_id,
          label: `${cls.class_name}`,
        }))
        : [],
    [studentNameWithClassId]
  );

  const chapterOptions = useMemo(
    () =>
      Array.isArray(allChapter)
        ? allChapter.map((cls) => ({
          value: cls?.chapter_id,
          label: `${cls.name}`,
        }))
        : [],
    [allChapter]
  );

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

  // const handleSearch = async () => {
  //   setStudentError("");
  //   setSubjectError("");
  //   setChapterError("");

  //   let hasError = false;
  //   if (!selectedStudentId) {
  //     setStudentError("Please select class.");
  //     hasError = true;
  //   }
  //   if (!selectedSubjectId) {
  //     setSubjectError("Please select subject.");
  //     hasError = true;
  //   }
  //   if (!selectedChapterId) {
  //     setChapterError("Please select chapter.");
  //     hasError = true;
  //   }
  //   if (hasError) return;

  //   setLoadingForSearch(true);
  //   setLoading(true);

  //   try {
  //     const token = localStorage.getItem("authToken");
  //     if (!token) {
  //       toast.error("Authentication token missing. Please login again.");
  //       return;
  //     }

  //     const params = {
  //       class_id: selectedStudentId,
  //       subject_id: selectedSubjectId,
  //       chapter_id: selectedChapterId,
  //       reg_id: roleIdValue,
  //     };

  //     const response = await axios.get(
  //       `${API_URL}/api/get_lesson_plan_template`,
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //         params,
  //       }
  //     );

  //     const data = response?.data?.data || [];

  //     // Group by template ID
  //     const groupedData = {};
  //     if (data.length > 0) {
  //       data.forEach((item) => {
  //         const tempId = item.les_pln_temp_id;
  //         if (!groupedData[tempId]) {
  //           groupedData[tempId] = { les_pln_temp_id: tempId };
  //         }
  //         groupedData[tempId][item.lesson_plan_headings_id] = item.description;
  //       });
  //     }

  //     const timetableForDisplay =
  //       Object.values(groupedData).length > 0
  //         ? Object.values(groupedData)
  //         : [{ les_pln_temp_id: "new" }];

  //     await fetchHeadings();

  //     if (data.length > 0) {
  //       const firstTemplateId = data[0].les_pln_temp_id; // <-- extract from response

  //       navigate(`/lessonPlanTemplate/edit/${firstTemplateId}`, {
  //         state: {
  //           headings: heading,
  //           timetable: timetableForDisplay,
  //           selectedStudentId,
  //           selectedSubjectId,
  //           selectedChapterId,
  //           selectedStudent,
  //           selectedChapter,
  //           selectedSubject,
  //           les_pln_temp_id: firstTemplateId,
  //         },
  //       });
  //     } else {
  //       setStudentRemarks({});
  //       setTimetable(timetableForDisplay);
  //       setPageCount(Math.ceil(timetableForDisplay.length / pageSize));
  //       setShowStudentReport(true);
  //     }
  //   } catch (error) {
  //     toast.error("Error fetching Lesson Plan. Please try again.");
  //   } finally {
  //     setLoading(false);
  //     setLoadingForSearch(false);
  //   }
  // };

  const handleSearch = async () => {
    setStudentError("");
    setSubjectError("");
    setChapterError("");

    let hasError = false;
    if (!selectedStudentId) {
      setStudentError("Please select class.");
      hasError = true;
    }
    if (!selectedSubjectId) {
      setSubjectError("Please select subject.");
      hasError = true;
    }
    if (!selectedChapterId) {
      setChapterError("Please select chapter.");
      hasError = true;
    }
    if (hasError) return;

    setLoadingForSearch(true);
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Authentication token missing. Please login again.");
        return;
      }

      const params = {
        class_id: selectedStudentId,
        subject_id: selectedSubjectId,
        chapter_id: selectedChapterId,
        reg_id: roleIdValue,
      };

      const response = await axios.get(
        `${API_URL}/api/get_lesson_plan_template`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      // ⭐⭐⭐ ADD THIS CHECK HERE ⭐⭐⭐
      if (
        response?.data?.status === 200 &&
        response?.data?.isCreatedByRequestedUser === false
      ) {
        toast.error(response?.data?.message || "Template already created!");
        setLoading(false);
        setLoadingForSearch(false);
        return; // stop further execution
      }

      const data = response?.data?.data || [];

      // Group by template ID
      const groupedData = {};
      if (data.length > 0) {
        data.forEach((item) => {
          const tempId = item.les_pln_temp_id;
          if (!groupedData[tempId]) {
            groupedData[tempId] = { les_pln_temp_id: tempId };
          }
          groupedData[tempId][item.lesson_plan_headings_id] = item.description;
        });
      }

      const timetableForDisplay =
        Object.values(groupedData).length > 0
          ? Object.values(groupedData)
          : [{ les_pln_temp_id: "new" }];

      await fetchHeadings();

      if (data.length > 0) {
        const firstTemplateId = data[0].les_pln_temp_id;

        navigate(`/lessonPlanTemplate/edit/${firstTemplateId}`, {
          state: {
            headings: heading,
            timetable: timetableForDisplay,
            selectedStudentId,
            selectedSubjectId,
            selectedChapterId,
            selectedStudent,
            selectedChapter,
            selectedSubject,
            les_pln_temp_id: firstTemplateId,
          },
        });
      } else {
        setStudentRemarks({});
        setTimetable(timetableForDisplay);
        setPageCount(Math.ceil(timetableForDisplay.length / pageSize));
        setShowStudentReport(true);
      }
    } catch (error) {
      toast.error("Error fetching Lesson Plan. Please try again.");
    } finally {
      setLoading(false);
      setLoadingForSearch(false);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Authentication token missing. Please login again.");
      setIsSubmitting(false);
      return;
    }

    // ✅ Only include headings where user entered something (either edited or existing)
    const descriptions = heading
      .map((item) => {
        const userValue = studentRemarks[item.lesson_plan_headings_id]?.trim();
        const existingValue =
          timetable[0]?.[item.lesson_plan_headings_id]?.trim() || "";

        // ✅ Use user input if available, otherwise skip empty fields
        if (userValue) {
          return {
            lesson_plan_headings_id: item.lesson_plan_headings_id,
            description: userValue,
          };
        }

        return null; // Skip empty ones
      })
      .filter((d) => d !== null);

    // ✅ Check if at least one field was filled
    if (descriptions.length === 0) {
      toast.error("Please enter at least one description before saving.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/save_lessonplantemplate`,
        {
          class_id: selectedStudentId,
          subject_id: selectedSubjectId,
          chapter_id: selectedChapterId,
          descriptions,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.status === 200) {
        toast.success("Lesson plan template created successfully!");
        setTimeout(() => {
          navigate("/lessonPlanTemplate");
        }, 1000);

        setStudentRemarks({});
        setTimetable([]);
      } else {
        toast.error("Failed to create lesson plan template.");
      }
    } catch (error) {
      toast.error("An error occurred while submitting the data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitPublish = async () => {
    if (isPublishing) return;
    setIsPublishing(true);

    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Authentication token missing. Please login again.");
      setIsPublishing(false);
      return;
    }

    // Prepare descriptions
    // const descriptions = heading.map((item) => ({
    //   lesson_plan_headings_id: item.lesson_plan_headings_id,
    //   description:
    //     studentRemarks[item.lesson_plan_headings_id]?.trim() ||
    //     timetable[0]?.[item.lesson_plan_headings_id]?.trim() ||
    //     "", // fallback to empty
    // }));

    // //  Check if all headings have a description
    // const allFilled = descriptions.every((d) => d.description !== "");
    // if (!allFilled) {
    //   toast.error(
    //     "Please fill description for all headings before publishing."
    //   );
    //   setIsPublishing(false);
    //   return;
    // }

    const descriptions = heading.map((item) => ({
      lesson_plan_headings_id: item.lesson_plan_headings_id,
      description:
        studentRemarks[item.lesson_plan_headings_id]?.trim() ||
        timetable[0]?.[item.lesson_plan_headings_id]?.trim() ||
        "", // fallback to empty
    }));

    // Check if AT LEAST ONE description is filled
    const atLeastOneFilled = descriptions.some((d) => d.description !== "");

    if (!atLeastOneFilled) {
      toast.error("Please fill at least one description before publishing.");
      setIsPublishing(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/savenpublish_lessonplantemplate`,
        {
          class_id: selectedStudentId,
          subject_id: selectedSubjectId,
          chapter_id: selectedChapterId,
          descriptions,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.status === 200) {
        toast.success("Lesson plan template saved & published successfully.");
        setTimeout(() => {
          setShowStudentReport(false);
        }, 1000);

        setStudentRemarks({});
        setTimetable([]);
      } else {
        toast.error("Failed to publish lesson plan template.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while submitting the data.");
    } finally {
      setIsPublishing(false);
    }
  };

  console.log("row", timetable);

  useEffect(() => {
    if (!selectedStudent) return;
    fetchSubjectNames(selectedStudent.value);
  }, [selectedStudent]);

  useEffect(() => {
    if (!selectedStudent || !selectedSubject) return;
    fetchChaptersNames(selectedStudent.value, selectedSubject.value);
  }, [selectedStudent, selectedSubject]);

  const reset = () => {
    setStudentRemarks({});
  };

  const filteredSections = timetable.filter((student) => {
    const searchLower = searchTerm.replace(/\s+/g, "").toLowerCase();
    const flatValues = [];

    // Only consider non_daily & daily_changes for search
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

    // If no search term, include all sections
    if (!searchTerm) return true;

    return flatValues.some((val) => val.includes(searchLower));
  });

  const displayedSections =
    filteredSections.length > 0 ? filteredSections : [{}]; // Always render at least one template row

  const existingData = {};
  displayedSections.forEach((student) => {
    if (student.lesson_plan_headings_id && student.description) {
      existingData[student.lesson_plan_headings_id] = student.description;
    }
  });

  return (
    <>
      <div
        className={` transition-all duration-500 w-[95%]  mx-auto p-4 ${showStudentReport ? "w-full " : "w-[90%] "
          }`}
      >
        <ToastContainer />
        <div className="card pb-4  rounded-md ">
          {!showStudentReport && (
            <>
              <div className=" card-header mb-4 flex justify-between items-center ">
                <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
                  Lesson Plan Template
                </h5>
                <RxCross1
                  className=" relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                  // onClick={() => setShowStudentReport(false)}
                  onClick={() => navigate("/lessonPlanTemplate")}
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
                    <div className="w-full  md:w-[45%] gap-x-1 justify-around my-1 md:my-4 flex md:flex-row">
                      <label
                        className="w-full md:w-[30%] text-md pl-0 md:pl-5 mt-1.5"
                        htmlFor="studentSelect"
                      >
                        Class <span className="text-red-500">*</span>
                      </label>
                      <div className="w-full md:w-[55%]">
                        <Select
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          id="studentSelect"
                          options={studentOptions}
                          value={
                            studentOptions.find(
                              (opt) => opt.value === selectedStudent?.value
                            ) || selectedStudent
                          }
                          onChange={(selected) => {
                            setSelectedStudent(selected);
                            setSelectedStudentId(
                              selected ? selected.value : null
                            );
                            if (selected) setStudentError("");
                            // ✅ Clear error when class selected
                            else setStudentError("Please select class."); // optional: if cleared again
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
                        {studentError && (
                          <div className="h-8 relative ml-1 text-red-500 text-xs">
                            {studentError}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="w-full  md:w-[50%] gap-x-3 justify-around my-1 md:my-4 flex md:flex-row">
                      <label
                        className="w-full md:w-[35%] text-md pl-0 md:pl-5 mt-1.5"
                        htmlFor="studentSelect"
                      >
                        Subject<span className="text-red-500">*</span>
                      </label>
                      <div className="w-full md:w-[60%]">
                        <Select
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          id="subjectSelect"
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
                            if (selected) setSubjectError(""); //  Clear error
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
                        {subjectError && (
                          <div className="h-8 relative ml-1 text-red-500 text-xs">
                            {subjectError}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="w-full  md:w-[50%] gap-x-3 justify-around my-1 md:my-4 flex md:flex-row">
                      <label
                        className="w-full md:w-[35%] text-md pl-0 md:pl-5 mt-1.5"
                        htmlFor="studentSelect"
                      >
                        Chapter<span className="text-red-500">*</span>
                      </label>
                      <div className="w-full md:w-[60%]">
                        <Select
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          id="chapterSelect"
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
                            if (selected) setChapterError(""); // ✅ Clear error
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
                          <div className="h-8 relative ml-1 text-red-500 text-xs">
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
                <>
                  <div className="w-full  mx-auto transition-all duration-300">
                    <div className="card mx-auto shadow-lg">
                      <div className="p-2 px-3 bg-gray-100 border-none flex items-center justify-between">
                        <div className="w-full flex flex-row items-center justify-between mr-0 md:mr-4 gap-x-1">
                          <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap mr-6">
                            Create Lesson Plan Template
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
                                <div className="flex items-center gap-2">
                                  <label
                                    className="text-md whitespace-nowrap"
                                    htmlFor="studentSelect"
                                  >
                                    <span className="text-lg">🏫</span>
                                    Class :{" "}
                                  </label>
                                  <span>{selectedStudent.label}</span>
                                  {/* <Select
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    id="studentSelect"
                                    // options={studentOptions}
                                    // value={
                                    //   studentOptions.find(
                                    //     (opt) =>
                                    //       opt.value === selectedStudent?.value
                                    //   ) || selectedStudent
                                    // }
                                    // onChange={(selected) => {
                                    //   setSelectedStudent(selected);
                                    // }}
                                    value={selectedStudent}
                                    placeholder={
                                      loadingExams ? "Loading..." : "Select"
                                    }
                                    // isSearchable
                                    // isClearable
                                    className="text-sm min-w-[160px]"
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
                                  /> */}
                                </div>

                                <div className="flex items-center gap-3">
                                  <label
                                    className="text-md whitespace-nowrap"
                                    htmlFor="monthSelect"
                                  >
                                    <span className="text-lg">📚</span>
                                    Subject :{" "}
                                    {/* <span className="text-red-500">*</span> */}
                                  </label>
                                  <span>{selectedSubject.label}</span>
                                  {/* <Select
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    id="monthSelect"
                                    // options={subjectOptions}
                                    // value={
                                    //   subjectOptions.find(
                                    //     (opt) =>
                                    //       opt.value === selectedSubject?.value
                                    //   ) || selectedSubject
                                    // }
                                    // onChange={(selected) => {
                                    //   setSelectedSubject(selected);
                                    // }}
                                    value={selectedSubject}
                                    placeholder={
                                      loadingExams ? "Loading..." : "Select"
                                    }
                                    // isSearchable
                                    // isClearable
                                    className="text-sm min-w-[160px]"
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
                                  /> */}
                                </div>

                                <div className="flex items-center gap-3">
                                  <label
                                    className="text-md whitespace-nowrap"
                                    htmlFor="monthSelect"
                                  >
                                    <span className="text-lg">📝</span>
                                    Chapter :{" "}
                                    {/* <span className="text-red-500">*</span> */}
                                  </label>
                                  <span>{selectedChapter.label}</span>
                                  {/* <Select
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    id="monthSelect"
                                    // options={chapterOptions}
                                    // value={
                                    //   chapterOptions.find(
                                    //     (opt) =>
                                    //       opt.value === selectedChapter?.value
                                    //   ) || selectedChapter
                                    // }
                                    // onChange={(selected) => {
                                    //   setSelectedChapter(selected);
                                    // }}
                                    value={selectedChapter}
                                    // placeholder={
                                    //   loadingExams ? "Loading..." : "Select"
                                    // }
                                    // isSearchable
                                    // isClearable
                                    className="text-sm min-w-[160px]"
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
                                  /> */}
                                </div>

                                {/* <div>
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
                                </div> */}
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
                                              className={`px-6 py-2 border-2 text-sm font-semibold text-center text-gray-800 ${i === 0
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
                                        {timetable.map((template, rowIndex) => (
                                          <tr
                                            key={
                                              template.les_pln_temp_id ||
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
                                                  className={`border-2 px-2 py-1 ${colIndex === 0
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
                                                        e.key === "Backspace"
                                                      ) {
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
                                                      boxSizing: "border-box",
                                                      lineHeight: "1.5em",
                                                    }}
                                                  />
                                                </td>
                                              )
                                            )}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
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
                          {isSubmitting ? "Saving" : "Save"}
                        </button>
                        <button
                          onClick={handleSubmitPublish}
                          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded"
                        >
                          {isPublishing ? "Publishing" : "Save & Publish"}
                        </button>
                        <button
                          onClick={() => reset()}
                          className="btn btn-danger text-white font-semibold px-4 py-2 rounded"
                        >
                          Reset
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
              </>
            )}
          </>
        </div>
      </div>
    </>
  );
};

export default CreateLessonPlanTemplate;
