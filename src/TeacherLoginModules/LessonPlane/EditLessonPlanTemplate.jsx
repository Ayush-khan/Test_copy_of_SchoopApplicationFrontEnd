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
  const [loadingExams, setLoadingExams] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const [publish, setPublish] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [studentRemarks, setStudentRemarks] = useState({});
  const [showStudentReport, setShowStudentReport] = useState(false);
  const [heading, setHeadings] = useState([]);

  const [timetable, setTimetable] = useState([]);

  const { id } = useParams();
  const { state } = useLocation();

  // console.log("Editing lesson plan ID:", id);
  // console.log("Passed data:", state);

  // const {
  //   headings = [],
  //   timetable = [],
  //   selectedStudentId,
  //   selectedSubjectId,
  //   selectedChapterId,
  //   selectedChapter,
  //   selectedSubject,
  //   selectedStudent,
  // } = state || {};

  // useEffect(() => {
  //   console.log("Editing Lesson Plan:", timetable, headings);
  // }, [state]);

  // useEffect(() => {
  //   if (timetable?.length > 0 && heading?.length > 0) {
  //     const initialRemarks = {};
  //     timetable.forEach((template) => {
  //       heading.forEach((h) => {
  //         const key = h.lesson_plan_headings_id;
  //         if (!initialRemarks[key]) {
  //           initialRemarks[key] = template[key] || "";
  //         }
  //       });
  //     });
  //     setStudentRemarks(initialRemarks);
  //   }
  // }, [timetable, heading]);

  // useEffect(() => {
  //   if (location.state?.timetable) {
  //     const template = location.state.timetable;

  //     // headings: from descriptions
  //     const headingsArray =
  //       template.descriptions?.map((desc) => ({
  //         lesson_plan_headings_id: desc.lesson_plan_headings_id,
  //         name: desc.name,
  //       })) || [];

  //     setHeadings(headingsArray);

  //     // timetable: single object with heading_id -> description
  //     const timetableObj = {};
  //     template.descriptions?.forEach((desc) => {
  //       timetableObj[desc.lesson_plan_headings_id] = desc.description || "";
  //     });

  //     setStudentRemarks(timetableObj);
  //   }
  // }, [location.state]);

  const {
    headings: passedHeadings = [],
    timetable: passedTimetable = [],
    selectedStudentId,
    selectedSubjectId,
    selectedChapterId,
    selectedChapter,
    selectedSubject,
    selectedStudent,
    les_pln_temp_id,
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

  useEffect(() => {
    const fetchTemplate = async () => {
      if (!selectedStudentId || !selectedSubjectId || !selectedChapterId || !id)
        return;

      setLoading(true);

      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          `${API_URL}/api/get_lesson_plan_template_id`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              class_id: selectedStudentId,
              subject_id: selectedSubjectId,
              chapter_id: selectedChapterId,
              les_pln_temp_id: id,
            },
          }
        );

        const data = response?.data?.data || [];
        const dataArray = Array.isArray(data) ? data : [data];

        setPublish(dataArray[0].publish);
        console.log("check pu", dataArray[0].publish);
        // Group details by heading for each template
        const timetableArray = dataArray.map((template) => {
          const grouped = {};
          (template.details || []).forEach((desc) => {
            if (!grouped[desc.lesson_plan_headings_id])
              grouped[desc.lesson_plan_headings_id] = [];
            grouped[desc.lesson_plan_headings_id].push(desc);
          });
          return {
            ...template,
            groupedDetails: grouped, // rename groupedDescriptions -> groupedDetails
          };
        });

        setTimetable(timetableArray);

        // Prepare studentRemarks: pick first description for each heading as default
        const remarks = {};
        timetableArray.forEach((template) => {
          Object.keys(template.groupedDetails).forEach((headingId) => {
            remarks[headingId] =
              template.groupedDetails[headingId][0].description || "";
          });
        });
        setStudentRemarks(remarks);

        console.log("row", timetableArray);
        console.log("studentRemarks", remarks);
      } catch (err) {
        toast.error("Error fetching lesson plan template");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [selectedStudentId, selectedSubjectId, selectedChapterId, id]);

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

      if (!heading || heading.length === 0) {
        toast.error("No headings available to update.");
        setIsSubmitting(false);
        return;
      }

      const descriptions = (heading || []).map((item) => {
        const key = item.lesson_plan_headings_id;
        return {
          lesson_plan_headings_id: key,
          description: studentRemarks[key]?.trim() || "",
        };
      });

      // ⭐ CHECK IF ALL description fields are empty
      const allEmpty = descriptions.every((d) => d.description === "");

      if (allEmpty) {
        toast.error("Please enter at least one description before saving.");
        setIsSubmitting(false);
        return;
      }

      const response = await axios.put(
        `${API_URL}/api/update_lessonplan_template/${id}`,
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
        toast.success("Lesson plan template updated successfully!");
        setTimeout(() => {
          navigate("/lessonPlanTemplate");
        }, 1000);

        setStudentRemarks({}); // clear the local state
      } else {
        toast.error(
          response.data.message || "Failed to update lesson plan template."
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while updating the data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePublish = async () => {
    console.log("mahima");
    if (isPublishing) return;
    setIsPublishing(true);
    console.log("mahima");

    const token = localStorage.getItem("authToken");
    if (!token) {
      console.log("mahima");
      toast.error("Authentication token missing. Please login again.");
      setIsPublishing(false);
      return;
    }
    console.log("mahima");

    // Prepare descriptions
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
    console.log("mahima");

    try {
      console.log("mahima");
      const response = await axios.put(
        `${API_URL}/api/updatepublish_lessonplan_template/${id}`,
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

      console.log("mahima");

      if (response.data.status === 200) {
        toast.success("Lesson plan template update & published successfully.");
        navigate("/lessonPlanTemplate");
        setStudentRemarks({});
        setTimetable([]);
      } else {
        toast.error("Failed to publish lesson plan template.");
      }
    } catch (error) {
      console.log("mahima");
      console.error(error);
      toast.error("An error occurred while submitting the data.");
    } finally {
      console.log("mahima");
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
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

    // const allFilled = descriptions.every((d) => d.description !== "");
    // if (!allFilled) {
    //   toast.error(
    //     "Please fill description for all headings before publishing."
    //   );
    //   setIsPublishing(false);
    //   return;
    // }

    try {
      const response = await axios.post(
        `${API_URL}/api/unpublish_lessonplan_template`,
        {
          les_pln_temp_id: id,
          class_id: selectedStudentId,
          subject_id: selectedSubjectId,
          chapter_id: selectedChapterId,
          // descriptions,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.status === 200) {
        toast.success("Lesson plan template unpublished successfully.");
        navigate("/lessonPlanTemplate");
        setStudentRemarks({});
        setTimetable([]);
      } else {
        toast.error("Failed to unpublish lesson plan template.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while submitting the data.");
    } finally {
      setIsPublishing(false);
    }
  };

  // const reset = () => {
  //   const cleared = {};
  //   (heading || []).forEach((item) => {
  //     cleared[item.lesson_plan_headings_id] = "";
  //   });
  //   setStudentRemarks(cleared);
  // };

  // console.log("row", timetable);

  const filteredSections = timetable.filter((student) => {
    const searchLower = searchTerm.replace(/\s+/g, "").toLowerCase();
    const flatValues = [];

    // Only consider non_daily & daily_changes for search
    if (Array.isArray(student.non_daily)) {
      student.non_daily.forEach((item) => {
        if (item.headings)
          flatValues.push(
            item.headings.trim().replace(/\s+/g, "").toLowerCase()
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
        if (change.headings)
          flatValues.push(
            change.headings.trim().replace(/\s+/g, "").toLowerCase()
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
                            Edit Lesson Plan Template
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
                                    {/* <span className="text-red-500">*</span> */}
                                  </label>
                                  <span>{selectedStudent.label}</span>
                                  {/* <Select
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    id="studentSelect"
                                    value={selectedStudent}
                                    isSearchable
                                    isClearable
                                    className="text-sm min-w-[150px]"
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

                                {/* Month */}
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
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex mb-1.5 flex-col md:flex-row gap-x-6 justify-center md:justify-end ">
                          <RxCross1
                            className="text-base text-red-600 cursor-pointer hover:bg-red-100 rounded"
                            onClick={() => navigate("/lessonPlanTemplate")}
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
                                        {timetable.map((template, rowIndex) => (
                                          <tr
                                            key={
                                              template.les_pln_temp_id ||
                                              rowIndex
                                            }
                                            className="text-left text-sm text-gray-700"
                                            style={{ height: "250px" }}
                                          >
                                            {heading.map((item, colIndex) => {
                                              const headingId =
                                                item.lesson_plan_headings_id;

                                              // Get all details for this heading
                                              const descArray =
                                                template.groupedDetails?.[
                                                  headingId
                                                ] || [];

                                              // Show first detail for simplicity
                                              const descObj = descArray[0];

                                              return (
                                                <td
                                                  key={headingId}
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
                                                        headingId
                                                      ] ??
                                                      descObj?.description ??
                                                      ""
                                                    }
                                                    // onChange={(e) => {
                                                    //   const value =
                                                    //     e.target.value;
                                                    //   setStudentRemarks(
                                                    //     (prev) => ({
                                                    //       ...prev,
                                                    //       [headingId]: value,
                                                    //     })
                                                    //   );
                                                    // }}
                                                    readOnly={publish === "Y"} // ⬅️ MAKE TEXTAREA READONLY
                                                    onChange={(e) => {
                                                      if (publish === "Y")
                                                        return; // ⬅️ PREVENT UPDATING STATE
                                                      const value =
                                                        e.target.value;
                                                      setStudentRemarks(
                                                        (prev) => ({
                                                          ...prev,
                                                          [headingId]: value,
                                                        })
                                                      );
                                                    }}
                                                    className={`w-full h-full resize-none p-2 border border-gray-300 focus:outline-none ${
                                                      publish === "Y"
                                                        ? "bg-gray-50"
                                                        : ""
                                                    }`}
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
                                                    // className="w-full h-full resize-none p-2 border border-gray-300 focus:outline-none"
                                                    style={{
                                                      minHeight: "250px",
                                                      height: "100%",
                                                      boxSizing: "border-box",
                                                      lineHeight: "1.5em",
                                                    }}
                                                  />
                                                </td>
                                              );
                                            })}
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
                        {publish === "N" ? (
                          <>
                            <button
                              onClick={handleUpdate}
                              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded mr-2"
                            >
                              {loading ? "Updating" : "Update"}
                            </button>
                            <button
                              onClick={handleUpdatePublish}
                              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded"
                            >
                              {loading ? "Publishing" : "Update & Publish"}
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={handleUnpublish}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded"
                          >
                            {loading ? "Unpublishing" : "Unpublish"}
                          </button>
                        )}

                        {/* <button
                          onClick={() => reset()}
                          className="btn btn-danger text-white font-semibold px-4 py-2 rounded"
                        >
                          Reset
                        </button> */}
                        <button
                          onClick={() => navigate("/lessonPlanTemplate")}
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
