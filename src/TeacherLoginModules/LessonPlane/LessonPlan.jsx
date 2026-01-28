import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import { RxCross1 } from "react-icons/rx";
import Select from "react-select";

import CreateLessonPlan from "./CreateLessonPlan";

import { useNavigate } from "react-router-dom";

function LessonPlan() {
  const API_URL = import.meta.env.VITE_API_URL; // URL for host
  // const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("Manage");
  const [classes, setClasses] = useState([]);

  // for allot subject tab
  const [showViewModal, setShowViewModal] = useState(false);
  const [showPublish, setShowPublishModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const [currestSubjectNameForDelete, setCurrestSubjectNameForDelete] =
    useState("");

  const [newclassnames, setnewclassnames] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dropdownRef = useRef(null);

  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");
  //   for allot subject checkboxes
  const navigate = useNavigate();

  // errors messages for allot subject tab
  // const [status, setStatus] = useState("All"); // For status dropdown
  const [selectedDate, setSelectedDate] = useState(""); // For date picker
  const [notices, setNotices] = useState([]); // To store fetched notices
  const [subject, setSubject] = useState("");
  const [noticeDesc, setNoticeDesc] = useState("");
  const [noticeDescError, setNoticeDescError] = useState("");

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
  const [unqId, setUnqId] = useState([]);
  const [unqIdClass, setUnqIdClass] = useState("");
  const [unqIdDetails, setUnqIdDetails] = useState({});

  const pageSize = 10;

  useEffect(() => {
    handleSearch();
  }, []);

  useEffect(() => {
    fetchDataRoleId();
  }, []);

  useEffect(() => {
    if (!roleIdValue) return; // guard against empty
    fetchClasses(roleIdValue);
  }, [roleIdValue]);

  const handleStatusChange = async (lessonPlanId, newStatus) => {
    setNotices((prev) =>
      prev.map((item) =>
        item.unq_id === lessonPlanId ? { ...item, status: newStatus } : item,
      ),
    );

    try {
      const token = localStorage.getItem("authToken");

      // Prepare FormData
      const formData = new FormData();
      formData.append("status", newStatus);

      // Send API request with lessonPlanId as URL param
      await axios.post(
        `${API_URL}/api/update_statusoflessonplan/${lessonPlanId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      toast.success("Status updated successfully");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

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

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/get_teacherclasseswithclassteacher?teacher_id=${roleIdValue}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setStudentNameWithClassId(response?.data?.data || []);
    } catch (error) {
      toast.error("Error fetching Classes");
      // console.error("Error fetching Classes:", error);
    }
  };

  // const fetchSubjectNames = async (classId) => {
  //   if (!classId) return;
  //   setLoading(true);
  //   try {
  //     const token = localStorage.getItem("authToken");
  //     const response = await axios.get(
  //       `${API_URL}/api/get_subjects_according_class_multiple?class_id=${classId}`,

  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       }
  //     );

  //     setAllSubject(response.data.data || []);
  //   } catch (error) {
  //     toast.error("Error fetching subject names");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchSubjectNames = async (classId, sectionIds = []) => {
    if (!classId || sectionIds.length === 0) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");

      // Build section_ids[]=...&section_ids[]=...
      const sectionQuery = sectionIds
        .map((id) => `section_ids[]=${id}`)
        .join("&");

      const url = `${API_URL}/api/get_subjects_according_class_multiple?class_id=${classId}&${sectionQuery}`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAllSubject(response.data.data || []);
    } catch (error) {
      toast.error("Error fetching subject names");
    } finally {
      setLoading(false);
    }
  };

  // const fetchChaptersNames = async (classId, SubjectId) => {
  //   if (!classId) return;
  //   setLoading(true);
  //   try {
  //     const token = localStorage.getItem("authToken");
  //     const response = await axios.get(
  //       `${API_URL}/api/get_subsubject_by_class_sub?class_id=${classId}&subject_id=${SubjectId}`,
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       }
  //     );
  //     console.log("fetch chapters", response.data.data);
  //     setAllChapter(response.data.data || []);
  //   } catch (error) {
  //     toast.error("Error fetching chapters names");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchChaptersNames = async (classId, subjectId) => {
    if (!classId || !subjectId) return; // ✅ correct guard

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/get_subsubject_by_class_sub?class_id=${classId}&subject_id=${subjectId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      console.log("fetch chapters", response?.data?.data);
      setAllChapter(response?.data?.data || []);
    } catch (error) {
      toast.error("Error fetching chapters names");
    } finally {
      setLoading(false);
    }
  };

  const studentOptions = useMemo(
    () =>
      Array.isArray(studentNameWithClassId)
        ? studentNameWithClassId.map((cls) => ({
            value: `${cls.class_id}_${cls.section_id}`, // combined value
            label: `${cls.classname} ${cls.sectionname}`,
          }))
        : [],
    [studentNameWithClassId],
  );

  const subjectOptions = useMemo(
    () =>
      Array.isArray(allSubject)
        ? allSubject.map((cls) => ({
            value: cls?.sm_id,
            label: `${cls.name}`,
          }))
        : [],
    [allSubject],
  );

  const chapterOptions = useMemo(
    () =>
      Array.isArray(allChapter)
        ? allChapter.map((cls) => ({
            value: cls?.sub_subject,
            label: `${cls.sub_subject}`,
          }))
        : [],
    [allChapter],
  );

  useEffect(() => {
    if (!selectedStudent?.value) return;

    const [classId, sectionId] = selectedStudent.value.split("_");

    fetchSubjectNames(classId, [sectionId]);
  }, [selectedStudent]);

  useEffect(() => {
    if (!selectedSubjectId || !selectedStudentId) return;

    const [classId] = selectedStudentId.split("_"); // ✅ extract classId

    console.log("Fetching chapters:", {
      classId,
      subjectId: selectedSubjectId,
    });

    fetchChaptersNames(classId, selectedSubjectId);
  }, [selectedSubjectId, selectedStudentId]);

  // useEffect(() => {
  //   if (!selectedSubjectId || !selectedStudentId) return;

  //   console.log("Fetching chapters:", {
  //     classId: selectedStudentId,
  //     subjectId: selectedSubjectId,
  //   });

  //   fetchChaptersNames(selectedStudentId, selectedSubjectId);
  // }, [selectedSubjectId, selectedStudentId]);

  // useEffect(() => {
  //   if (!selectedStudent || !selectedSubject) return;
  //   fetchChaptersNames(selectedStudent.value, selectedSubject.value);
  // }, [selectedStudent, selectedSubject]);

  const fetchLessonPlanUniId = async (ids) => {
    const token = localStorage.getItem("authToken");
    if (!token || !ids?.length) return;

    try {
      const results = {};

      for (const id of ids) {
        const response = await axios.get(
          `${API_URL}/api/get_lp_classes_by_unq_id?unq_id=${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const apiData = response?.data?.data || [];

        // Collect all class-section pairs for the same unq_id
        const pairs = apiData.map(
          (item) => `${item.class_name} ${item.sec_name}`,
        );

        results[id] = pairs; // store array for each unq_id
      }

      console.log("Fetched unq_id details:", results);
      setUnqIdDetails(results);
    } catch (error) {
      console.error("Error fetching class/section by unq_id:", error);
    }
  };

  useEffect(() => {
    if (!unqId) return;
    fetchLessonPlanUniId(unqId);
  }, [unqId]);

  // const handleSearch = async () => {
  //   if (isSubmitting) return;
  //   setIsSubmitting(true);
  //   setSearchTerm("");
  //   setLoadingForSearch(true);

  //   try {
  //     setLoading(true);
  //     const token = localStorage.getItem("authToken");

  //     let classId = null;
  //     let sectionId = null;

  //     if (selectedStudent?.value) {
  //       [classId, sectionId] = selectedStudent.value.split("_");
  //     }

  //     const subjectId = selectedSubject?.value;
  //     const chapterId = selectedChapter?.value;

  //     const params = {};
  //     if (classId) params.class_id = classId;
  //     if (sectionId) params.section_id = sectionId;
  //     if (subjectId) params.subject_id = subjectId;
  //     if (chapterId) params.chapter_id = chapterId;

  //     console.log("Searching lesson plan with:", params);

  //     const response = await axios.get(`${API_URL}/api/get_lesson_plan`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //       params: Object.keys(params).length > 0 ? params : {},
  //     });

  //     console.log("response lesson plan", response.data);

  //     const apiData = response?.data?.data || [];

  //     if (apiData.length > 0) {
  //       const updatedNotices = apiData.map((notice) => ({
  //         ...notice,
  //       }));

  //       const uniqueIds = apiData.map((item) => item.unq_id);
  //       console.log("All unq_ids:", uniqueIds);

  //       setUnqId(uniqueIds);

  //       fetchLessonPlanUniId(uniqueIds);

  //       setNotices(updatedNotices);
  //       setPageCount(Math.ceil(updatedNotices.length / pageSize));
  //     } else {
  //       setNotices([]);
  //       toast.error("No lesson plan found for the selected criteria.");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching lesson plan:", error);
  //     toast.error("Error fetching lesson plan. Please try again.");
  //   } finally {
  //     setIsSubmitting(false);
  //     setLoading(false);
  //     setLoadingForSearch(false);
  //   }
  // };

  const handleSearch = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSearchTerm("");
    setLoadingForSearch(true);

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      let classId = null;
      let sectionId = null;

      if (selectedStudent?.value) {
        [classId, sectionId] = selectedStudent.value.split("_");
      }

      const subjectId = selectedSubject?.value;
      const chapterId = selectedChapter?.value;

      const params = {};
      if (classId) params.class_id = classId;
      if (sectionId) params.section_id = sectionId;
      if (subjectId) params.subject_id = subjectId;
      if (chapterId) params.chapter_id = chapterId;

      console.log("Searching lesson plan with:", params);

      const response = await axios.get(`${API_URL}/api/get_lesson_plan`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      console.log("response lesson plan", response.data);

      /* 🔥 FIX STARTS HERE */
      const rawData = response?.data;

      const apiData = Array.isArray(rawData)
        ? rawData
        : rawData?.data
          ? Array.isArray(rawData.data)
            ? rawData.data
            : [rawData.data]
          : rawData
            ? [rawData]
            : [];

      if (apiData.length > 0) {
        const updatedNotices = apiData.map((notice) => ({
          ...notice,
        }));

        const uniqueIds = apiData.map((item) => item.unq_id);
        console.log("All unq_ids:", uniqueIds);

        setUnqId(uniqueIds);
        fetchLessonPlanUniId(uniqueIds);

        setNotices(updatedNotices);
        setPageCount(Math.ceil(updatedNotices.length / pageSize));
      } else {
        setNotices([]);
        // if (notices.length !== 0) {
        toast.error("No lesson plan found for the selected criteria.");
        // }
      }
    } catch (error) {
      console.error("Error fetching lesson plan:", error);
      toast.error("Error fetching lesson plan. Please try again.");
    } finally {
      setIsSubmitting(false);
      setLoading(false);
      setLoadingForSearch(false);
    }
  };

  const handleTabChange = (tab) => {
    if (tab === "Manage") {
      handleSearch();
      setActiveTab("Manage");
    } else if (tab === "CreateLessonPlan") {
      navigate("/createLessonPlan");
    } else {
      setActiveTab(tab);
    }
  };

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
    // Handle page change logic
  };

  const handleDelete = (sectionId) => {
    const classToDelete = notices.find((cls) => cls.unq_id === sectionId);
    setCurrentSection({ classToDelete });
    setCurrestSubjectNameForDelete(currentSection?.classToDelete?.name);
    setShowDeleteModal(true);
  };

  const handleEdit = async (section) => {
    setCurrentSection(section);
    setSubject(section?.subject || "");
    setNoticeDesc(section?.notice_desc || "");
    setnewclassnames(section?.classnames || "");
    console.log("enter notice", section);
    if (section?.notice_type === "Notice") {
      console.log("enter notice-->start");

      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No authentication token found");
        }
        const response = await axios.get(
          `${API_URL}/api/get_smsnoticedata/${section.unq_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        console.log("responsedata of notice edit", response);
        if (response.data.success) {
          const noticedata = response.data.data.noticedata[0];
          const imageUrls = response.data.data.imageurl || [];

          setSubject(noticedata.subject || "");
          setNoticeDesc(noticedata.notice_desc || "");
          setnewclassnames(noticedata.classnames || "");
          setPreselectedFiles(imageUrls); // Set preselected files
        }
      } catch (error) {
        console.error("Error fetching notice data:", error);
        // toast.error("Failed to fetch notice data.");
      }
    } else {
      setPreselectedFiles([]); // Clear preselected files for non-NOTICE types
    }

    setShowEditModal(true);
  };

  const handleSubmitPublish = async () => {
    if (isSubmitting) return; // Prevent re-submitting
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");
      console.log(
        "the currecnt section inside the delte___",
        currentSection?.classToDelete?.subject_id,
      );
      console.log("the classes inside the delete", classes);
      console.log(
        "the current section insde the handlesbmitdelete",
        currentSection.classToDelete,
      );
      if (!token || !currentSection || !currentSection?.unq_id) {
        throw new Error("Unique ID is missing");
      }

      const response = await axios.put(
        `${API_URL}/api/update_publishsmsnotice/${currentSection?.unq_id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        },
      );

      // fetchClassNames();
      await handleSearch();

      // setShowPublishModal(false);
      // setSubjects([]);
      toast.success(
        response.data.message ||
          `${currestSubjectNameForDelete} Publish successfully!`,
      );
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(
          `Error In Publishing ${currestSubjectNameForDelete}: ${error.response.data.message}`,
        );
      } else {
        toast.error(
          `Error In Publishing ${currestSubjectNameForDelete}: ${error.message}`,
        );
      }
      console.error("Error In Publishing:", error);
      // setError(error.message);
    } finally {
      setShowPublishModal(false);
      setIsSubmitting(false); // Re-enable the button after the operation
    }
  };

  const handleSubmitDelete = async () => {
    if (isSubmitting) return; // Prevent re-submitting
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");

      if (!token || !currentSection || !currentSection?.classToDelete?.unq_id) {
        throw new Error("Unique ID is missing");
      }

      const response = await axios.delete(
        `${API_URL}/api/delete_lesson_plan/${currentSection?.classToDelete?.unq_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        },
      );

      // fetchClassNames();
      handleSearch();

      setShowDeleteModal(false);
      // setSubjects([]);
      toast.success(
        response.data.message ||
          `${currestSubjectNameForDelete} Deleted successfully!`,
      );
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(
          `Error In Deleting ${currestSubjectNameForDelete}: ${error.response.data.message}`,
        );
      } else {
        toast.error(
          `Error In Deleting ${currestSubjectNameForDelete}: ${error.message}`,
        );
      }
    } finally {
      setIsSubmitting(false); // Re-enable the button after the operation
      setShowDeleteModal(false);
    }
  };

  const handleCloseModal = () => {
    setSubject("");
    setNoticeDesc("");
    setnewclassnames("");
    setShowPublishModal(false);
    setShowViewModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
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

  const searchLower = searchTerm.trim().toLowerCase();

  const filteredSections = notices.filter((section) => {
    const teacherName = section?.classnames?.toLowerCase() || "";
    const subjectName = section?.subject?.toLowerCase() || "";
    const noticeDesc = section?.notice_type?.toLowerCase() || "";
    const teacher = section?.name?.toLowerCase() || "";
    const noticeDate = section?.week_date.toLowerCase() || ""; // e.g. "2025-05-29"

    return (
      teacherName.includes(searchLower) ||
      subjectName.includes(searchLower) ||
      noticeDesc.includes(searchLower) ||
      teacher.includes(searchLower) ||
      noticeDate.includes(searchLower)
    );
  });

  const displayedSections = filteredSections.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize,
  );

  const tabs = [
    { id: "Manage", label: "Manage" },
    { id: "CreateLessonPlan", label: "Plan" },
  ];

  return (
    <>
      <div className="md:mx-auto md:w-[95%] p-4 bg-white mt-4 ">
        <div className=" card-header  flex justify-between items-center  ">
          <h3 className="text-gray-700  text-[1.2em] lg:text-xl text-nowrap">
            Lesson Plan
          </h3>
          <RxCross1
            className="float-end relative -top-1 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
            onClick={() => {
              navigate("/dashboard");
            }}
          />
        </div>
        <div
          className=" relative  mb-8   h-1  mx-auto bg-red-700"
          style={{
            backgroundColor: "#C03078",
          }}
        ></div>

        <ul className="grid grid-cols-2 gap-x-10 relative -left-6 md:left-0 md:flex md:flex-row -top-4">
          {tabs.map(({ id, label }) => (
            <li
              key={id}
              className={`md:-ml-7 shadow-md ${
                activeTab === id ? "text-blue-500 font-bold" : ""
              }`}
            >
              <button
                onClick={() => handleTabChange(id)}
                className="px-2 md:px-4 py-1 hover:bg-gray-200 text-[1em] md:text-sm text-nowrap"
                aria-current={activeTab === id ? "page" : undefined}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>

        <div className="bg-white  rounded-md -mt-5">
          {activeTab === "Manage" && (
            <div>
              <ToastContainer />
              <div className="container">
                <div className="w-full md:w-[100%] flex justify-center flex-col md:flex-row gap-x-1 ml-0 p-2 border border-gray-300 rounded-md shadow-sm mb-2">
                  <div className="w-full md:w-[99%] flex md:flex-row justify-between items-center mt-0 md:mt-4">
                    <div className="w-full md:w-[99%] gap-x-0 md:gap-x-10 flex flex-col gap-y-2 md:gap-y-0 md:flex-row">
                      {/* Class */}
                      <div className="w-full  md:w-[50%] gap-x-3 justify-around my-1 md:my-4 flex md:flex-row">
                        <label
                          className="w-full md:w-[35%] text-md pl-0 md:pl-5 mt-1.5"
                          htmlFor="studentSelect"
                        >
                          Class
                        </label>
                        <div className="w-full md:w-[65%]">
                          <Select
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            id="studentSelect"
                            options={studentOptions}
                            value={
                              studentOptions.find(
                                (opt) => opt.value === selectedStudent?.value,
                              ) || selectedStudent
                            }
                            onChange={(selected) => {
                              setSelectedStudent(selected);
                              setSelectedStudentId(
                                selected ? selected.value : null,
                              );
                              if (!selected) {
                                // 🔥 CLEAR SUBJECT
                                setSelectedSubject(null);
                                setSelectedSubjectId(null);
                                setAllSubject([]);
                                setSubjectError("");

                                // 🔥 CLEAR CHAPTER
                                setSelectedChapter(null);
                                setSelectedChapterId(null);
                                setAllChapter([]);
                                setChapterError("");

                                setStudentError("Please select class.");
                              } else {
                                setStudentError("");
                              }
                            }}
                            isSearchable
                            isClearable
                            className="text-sm"
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
                      </div>

                      {/* Subject */}
                      <div className="w-full md:w-[50%] gap-x-3 justify-around my-1 md:my-4 flex md:flex-row">
                        <label
                          className="w-full md:w-[35%] text-md pl-0 md:pl-5 mt-1.5"
                          htmlFor="studentSelect"
                        >
                          Subject
                        </label>
                        <div className="w-full md:w-[65%]">
                          <Select
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            id="studentSelect"
                            options={subjectOptions}
                            // value={
                            //   subjectOptions.find(
                            //     (opt) => opt.value === selectedSubject?.value
                            //   ) || selectedSubject
                            // }
                            value={selectedSubject}
                            onChange={(selected) => {
                              setSelectedSubject(selected);
                              setSelectedSubjectId(
                                selected ? selected.value : null,
                              );

                              if (!selected) {
                                // 🔥 CLEAR CHAPTER WHEN SUBJECT CLEARED
                                setSelectedChapter(null);
                                setSelectedChapterId(null);
                                setAllChapter([]);
                                setChapterError("");

                                setSubjectError("Please select subject.");
                              } else {
                                setSubjectError("");
                              }
                            }}
                            isSearchable
                            isClearable
                            className="text-sm"
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
                      </div>

                      {/* Chapter */}
                      <div className="w-full md:w-[60%] gap-x-3 justify-around my-1 md:my-4 flex md:flex-row">
                        <label
                          className="w-full md:w-[35%] text-md pl-0 md:pl-5 mt-1.5"
                          htmlFor="studentSelect"
                        >
                          Sub-Subject
                        </label>
                        <div className="w-full md:w-[65%]">
                          <Select
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            id="studentSelect"
                            options={chapterOptions}
                            value={
                              chapterOptions.find(
                                (opt) => opt.value === selectedChapter?.value,
                              ) || selectedChapter
                            }
                            onChange={(selected) => {
                              setSelectedChapter(selected);
                              setSelectedChapterId(
                                selected ? selected.value : null,
                              );
                              if (selected)
                                setChapterError(""); // ✅ Clear error
                              else setChapterError("Please select chapter.");
                            }}
                            isSearchable
                            isClearable
                            className="text-sm"
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

                <div className="card mx-auto lg:w-full shadow-lg">
                  <div className="card-body w-full">
                    <div className="h-96 lg:h-96 overflow-y-scroll lg:overflow-x-hidden">
                      <table className="min-w-full leading-normal table-auto">
                        <thead>
                          <tr className="bg-gray-200">
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Sr.No
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Class
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Subject
                            </th>{" "}
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Chapter{" "}
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Week{" "}
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Status{" "}
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Edit
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Delete
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {loading ? (
                            <div className=" absolute left-[4%] w-[100%]  text-center flex justify-center items-center mt-14">
                              <div className=" text-center text-xl text-blue-700">
                                Please wait while data is loading...
                              </div>
                            </div>
                          ) : displayedSections.length ? (
                            displayedSections.map((subject, index) => (
                              <tr key={subject.unq_id} className="text-sm ">
                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {currentPage * pageSize + index + 1}
                                </td>
                                {/* <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {unqIdDetails[subject.lesson_plan_id]
                                    ? `${
                                        unqIdDetails[subject.lesson_plan_id]
                                          .class_name
                                      } ${
                                        unqIdDetails[subject.lesson_plan_id]
                                          .sec_name
                                      }`
                                    : subject?.c_name
                                    ? `${subject.c_name} ${
                                        subject.sec_name || ""
                                      }`
                                    : "-"}
                                </td> */}
                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {unqIdDetails[subject.unq_id]?.length
                                    ? unqIdDetails[subject.unq_id].join(", ")
                                    : subject?.c_name
                                      ? `${subject.c_name} ${
                                          subject.sec_name || ""
                                        }`
                                      : "-"}
                                </td>
                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {subject?.sub_name}
                                </td>
                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {subject?.name}
                                </td>
                                {/* CLass Column */}
                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  <div className=" w-17  overflow-x-auto ">
                                    {subject?.week_date}
                                  </div>
                                </td>
                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  <select
                                    value={subject?.status || ""}
                                    onChange={(e) =>
                                      handleStatusChange(
                                        subject.unq_id,
                                        e.target.value,
                                      )
                                    }
                                    className="border border-gray-400 rounded px-1 py-1 text-sm bg-white"
                                  >
                                    <option value="">Select</option>
                                    <option value="I">Incomplete</option>
                                    <option value="C">Complete</option>
                                  </select>
                                </td>

                                <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                                  {subject.publish === "Y" ? (
                                    " "
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigate(
                                          `/lessonPlan/edit/${subject.unq_id}`,
                                          {
                                            state: {
                                              // timetable: subject,
                                              selectedStudentId:
                                                subject.class_id,
                                              selectedSubjectId:
                                                subject.subject_id,
                                              selectedChapterId:
                                                subject.chapter_id,
                                              selectedStudent: {
                                                value: subject.class_id,
                                                label: subject.c_name,
                                              },
                                              selectedSubject: {
                                                value: subject.subject_id,
                                                label: subject.sub_name,
                                              },
                                              selectedChapter: {
                                                value: subject.chapter_id,
                                                label: subject.name,
                                              },
                                              section_id: subject.section_id,
                                            },
                                          },
                                        );
                                      }}
                                    >
                                      <FontAwesomeIcon icon={faEdit} />
                                    </button>
                                  )}
                                </td>

                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  <button
                                    onClick={() =>
                                      handleDelete(subject?.unq_id)
                                    }
                                    className="text-red-600 hover:text-red-800 hover:bg-transparent "
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <div className=" absolute left-[1%] w-[100%]  text-center flex justify-center items-center mt-14">
                              <div className=" text-center text-xl text-red-700">
                                {/* Oops! No data found.. */}
                                Please create lesson plan to view.
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
                        pageCount={pageCount}
                        onPageChange={handlePageClick}
                        marginPagesDisplayed={1}
                        pageRangeDisplayed={1}
                        containerClassName={"pagination"}
                        pageClassName={"page-item"}
                        pageLinkClassName={"page-link"}
                        previousClassName={"page-item"}
                        previousLinkClassName={"page-link"}
                        nextClassName={"page-item"}
                        nextLinkClassName={"page-link"}
                        breakClassName={"page-item"}
                        breakLinkClassName={"page-link"}
                        activeClassName={"active"}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50   flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="flex justify-between p-3">
                  <h5 className="modal-title">Confirm Delete</h5>
                  <RxCross1
                    className="float-end relative mt-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                    type="button"
                    onClick={handleCloseModal}
                  />
                </div>
                <div
                  className=" relative  mb-3 h-1 w-[97%] mx-auto bg-red-700"
                  style={{
                    backgroundColor: "#C03078",
                  }}
                ></div>
                <div className="modal-body">
                  Are you sure you want to delete this chapter
                  {` ${currentSection?.classToDelete?.name} for subject ${currentSection?.classToDelete?.sub_name}`}{" "}
                  ?
                </div>
                <div className=" flex justify-end p-3">
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

      {/* Delete Modal */}
      {showPublish && (
        <div className="fixed inset-0 z-50   flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="flex justify-between p-3">
                  <h5 className="modal-title">Confirm Publish</h5>
                  <RxCross1
                    className="float-end relative mt-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                    type="button"
                    // className="btn-close text-red-600"
                    onClick={handleCloseModal}
                  />
                  {console.log(
                    "the currecnt section inside delete of the managesubjhect",
                    currentSection,
                  )}
                </div>
                <div
                  className=" relative  mb-3 h-1 w-[97%] mx-auto bg-red-700"
                  style={{
                    backgroundColor: "#C03078",
                  }}
                ></div>
                <div className="modal-body">
                  Are you sure you want to Publish this{" "}
                  {` ${currentSection?.notice_type} `} ?
                </div>
                <div className=" flex justify-end p-3">
                  <button
                    type="button"
                    className="btn btn-primary px-3 mb-2"
                    onClick={handleSubmitPublish}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Publishing..." : "Publish"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default LessonPlan;
