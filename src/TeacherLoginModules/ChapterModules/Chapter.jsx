import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import { RxCross1 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Select from "react-select";

function Chapter() {
  const API_URL = import.meta.env.VITE_API_URL; // URL for host
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDActiveModal, setShowDActiveModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  //   variable to store the respone of the allot subject tab
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [filteredSections, setFilteredSections] = useState([]);
  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");

  const [classSectionList, setClassSectionList] = useState([]);

  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [loadingClassSection, setLoadingClassSection] = useState(false);

  const [selectedMonthId, setSelectedMonthId] = useState(null);

  const [loadingForSearch, setLoadingForSearch] = useState(false);

  const pageSize = 10;
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(""); // For success message
  const [errorMessage, setErrorMessage] = useState(""); // For error message
  const [errorMessageUrl, setErrorMessageUrl] = useState(""); // For error message
  const [loading, setLoading] = useState(false); // For loader
  const [isDataPosted, setIsDataPosted] = useState(false); // Flag for tracking successful post

  const [holidays, setHolidays] = useState([]);
  const [selectedHolidays, setSelectedHolidays] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const [currentHoliday, setCurrentHoliday] = useState("");
  const [currentHolidayNameForDelete, setCurrentHolidayNameForDelete] =
    useState("");

  const [deletedHolidays, setDeletedHolidays] = useState([]);

  const [allClasses, setAllClasses] = useState([]);
  const [allSubject, setAllSubject] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState([]);

  const [showUploadSection, setShowUploadSection] = useState(false);
  const [userName, setUserName] = useState("");

  const [loadingEvent, setLoadingEvent] = useState(false);
  const [roleID, setRoleId] = useState(null);
  const [roleIdValue, setRoleIdValue] = useState(null);
  const [classError, setClassError] = useState("");
  const [subjectError, setSubjectError] = useState("");

  useEffect(() => {
    fetchClassSectionList();
  }, []);

  useEffect(() => {
    if (!roleIdValue) return; // guard against empty
    fetchClassNames(roleIdValue);
  }, [roleIdValue]);

  function capitalizeWords(str) {
    if (!str || typeof str !== "string") return "";
    return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  }

  const fetchClassNames = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/api/get_only_classes_allotted_to_teacher?teacher_id=${roleIdValue}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Fetched Class List:", response.data.data);

      if (Array.isArray(response.data.data)) {
        setAllClasses(response.data.data);
      } else {
        setAllClasses(response.data.data || []);
      }
    } catch (error) {
      toast.error("Error fetching class names");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjectNames = async (classId) => {
    if (!classId) return; // no class selected, skip API
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/api/get_subjects_according_class?class_id=${classId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAllSubject(response.data.data || []);
    } catch (error) {
      toast.error("Error fetching subject names");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If multiple classes can be selected, pick the first one or handle as needed
    const classId = Array.isArray(selectedClasses)
      ? selectedClasses[0]
      : selectedClasses;

    fetchSubjectNames(classId);
  }, [selectedClasses]);

  useEffect(() => {
    const classId = Array.isArray(selectedClasses)
      ? selectedClasses[0]
      : selectedClasses;

    fetchSubjectNames(classId);
  }, [selectedClasses]);

  // const handleClassChange = (selectedOption) => {
  //   if (selectedOption) {
  //     setSelectedClasses(selectedOption.value); // store only class_id
  //   } else {
  //     setSelectedClasses(null); // clear selection when user clears
  //   }
  // };

  // const handleSubjectChange = (selectedOption) => {
  //   setSelectedSubject(selectedOption ? selectedOption.value : null);
  //   if (selectedOption) {
  //     setErrors((prev) => ({ ...prev, subjectError: "" }));
  //   }
  // };

  // ✅ Handle class selection
  const handleClassChange = (selectedOption) => {
    if (selectedOption) {
      setSelectedClasses(selectedOption.value); // store class_id
      setClassError(""); // clear class error when a valid class is selected
    } else {
      setSelectedClasses(null); // clear selection
      // setClassError("Please select a class"); // optional: show error if cleared
    }
  };

  const handleSubjectChange = (selectedOption) => {
    if (selectedOption) {
      setSelectedSubject(selectedOption.value); // store sm_id
      setSubjectError(""); // clear subject error when a valid subject is selected
    } else {
      setSelectedSubject(null); // clear selection
      // setSubjectError("Please select a subject"); // optional: show error if cleared
    }
  };

  const fetchClassSectionList = async () => {
    try {
      setLoadingClassSection(true);
      const token = localStorage.getItem("authToken");

      const response = await axios.get(`${API_URL}/api/getClassList`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Class Section List", response);
      setClassSectionList(response?.data || []);
    } catch (error) {
      toast.error("Error fetching class-section list");
      console.error("Error fetching class-section list:", error);
    } finally {
      setLoadingClassSection(false);
    }
  };

  const fetchSessionData = async () => {
    const token = localStorage.getItem("authToken");

    try {
      const response = await axios.get(`${API_URL}/api/sessionData`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      console.log("response session data", response.data);

      const roleId = response?.data?.user?.role_id;
      const regId = response?.data?.user?.reg_id;

      console.log("roleid", roleId);
      console.log("regid", regId);

      setRoleId(roleId); // optional for global use
      setRoleIdValue(regId);

      if (response.data && response.data.user) {
        const { name } = response.data.user;
        setUserName(name); // Set user name in state
      } else {
        console.error("User data not found in the response");
      }
    } catch (error) {
      console.error("Error fetching session data:", error);
    }
  };

  const fetchEvents = async () => {
    setLoadingEvent(true);
    setLoadingForSearch(true);
    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.get(`${API_URL}/api/get_chapters`, {
        params: {
          class_id: selectedSectionId,
          month_year: selectedMonthId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.data?.length) {
        const academicYear = response.data.data[0].academic_yr;
        // setDateLimits(getDateLimits(academicYear));
        console.log(academicYear);
      }

      console.log("chapters", response.data.data);
      setHolidays(response.data.data || []);
      setPageCount(Math.ceil((response.data.data?.length || 0) / pageSize));
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Error fetching chapters data.");
    } finally {
      setLoadingEvent(false);
      setLoadingForSearch(false);
    }
  };

  useEffect(() => {
    fetchSessionData();
    console.log("session.data", fetchSessionData);

    fetchEvents();

    // If data is posted successfully, reset the flag and refetch
    if (isDataPosted) {
      setIsDataPosted(false); // Reset the flag after refresh
    }
  }, [isDataPosted]);

  const handlePageClick = (data) => {
    console.log("Page clicked:", data.selected);
    setCurrentPage(data.selected);
  };

  const handleAdd = () => {
    navigate("/createChapter");
  };

  const handleEdit = (chapter) => {
    navigate(`/editChapter/${chapter.chapter_id}`, { state: { chapter } });
  };

  const handleSelectAll = () => {
    if (!holidays || holidays.length === 0) {
      toast.warning("No chapters available to select.");
      return;
    }

    // Find all unpublished events only
    const unpublishedHolidayIds = holidays
      .filter((holiday) => holiday.publish === "N")
      .map((holiday) => holiday.chapter_id);

    if (unpublishedHolidayIds.length === 0) {
      toast.warning("No unpublished chapter available for publish.");
      setSelectAll(false); // ✅ make sure checkbox stays unchecked
      setSelectedHolidays([]);
      return;
    }

    setSelectAll((prev) => {
      const newSelectAll = !prev;

      if (newSelectAll) {
        // ✅ Only unpublished IDs will be selected
        setSelectedHolidays(unpublishedHolidayIds);
        console.log("allUnpublishedchapters", unpublishedHolidayIds);
      } else {
        // Deselect all
        setSelectedHolidays([]);
      }

      return newSelectAll;
    });
  };

  const handleCheckboxChange = (holidayId) => {
    if (selectedHolidays.includes(holidayId)) {
      setSelectedHolidays(selectedHolidays.filter((id) => id !== holidayId));
    } else {
      setSelectedHolidays([...selectedHolidays, holidayId]);
    }
  };

  const handlePublish = async () => {
    if (!holidays || holidays.length === 0) {
      toast.warning("No chapter available for publish.");
      return;
    }

    if (!selectedHolidays || selectedHolidays.length === 0) {
      toast.warning("Please select at least one chapter to publish.");
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem("authToken");

    if (!token) {
      alert("Authentication required. Please log in.");
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      selectedHolidays.forEach((id) => formData.append("chapter_ids[]", id));
      console.log("selectedHolidys", selectedHolidays);

      const response = await axios.post(
        `${API_URL}/api/update_publishchapters`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = response.data;

      if (data.success) {
        toast.success(data.message || "Chapter published successfully!");
        setHolidays((prev) =>
          prev.map((holiday) =>
            selectedHolidays.includes(holiday.chapter_id)
              ? { ...holiday, publish: "Y" }
              : holiday
          )
        );
        setSelectedHolidays([]);
        setSelectAll(false);
      } else {
        toast.error(data.message || "Failed to publish chapter.");
      }
    } catch (error) {
      console.error("Error publishing chapter:", error);
      toast.error("An error occurred while publishing chapter.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const storedDeletedHolidays =
      JSON.parse(localStorage.getItem("deletedHolidays")) || [];
    setDeletedHolidays(storedDeletedHolidays);
  }, []);

  const handleDelete = (holiday) => {
    setCurrentHoliday(holiday.chapter_id);
    setCurrentHolidayNameForDelete(holiday.sub_name);

    // Show confirmation modal for all holidays (published & unpublished)
    setShowDeleteModal(true);
  };

  const handleSubmitDelete = async (holidayId) => {
    if (!holidayId) {
      toast.error("Invalid Chapter selected.");
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("No authentication token found. Please log in again.");
        setIsSubmitting(false);
        return;
      }

      console.log("Deleting Chapter with ID:", holidayId);

      // Call API to delete holiday
      const response = await axios.delete(
        `${API_URL}/api/delete_chapters/${holidayId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { data } = response;

      if (!data.success) {
        toast.error("Failed to delete the chapter.");
        setIsSubmitting(false);
        return;
      }

      setHolidays((prevHolidays) =>
        prevHolidays.filter((h) => h.chapter_id !== holidayId)
      );

      setDeletedHolidays((prev) => {
        const updatedDeletedHolidays = [...prev, holidayId];
        localStorage.setItem(
          "deletedChapters",
          JSON.stringify(updatedDeletedHolidays)
        );
        return updatedDeletedHolidays;
      });

      toast.success("Chapter deleted successfully!");
      setShowDeleteModal(false);
      fetchEvents();
    } catch (error) {
      console.error("Error deleting chapters:", error);
      toast.error("Server error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setFieldErrors({ message: "" });
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowDActiveModal(false);
    setShowViewModal(false);
  };

  const handleDownloadTemplate = async () => {
    if (!selectedClasses || selectedClasses.length === 0) {
      // setClassError("Please select a class.");
      toast.error("Please select class & subject to download the template.");
      return;
    }

    if (!selectedSubject) {
      // setSubjectError("Please select a subject.");
      toast.error("Please select class & subject to download the template.");
      return;
    }

    const token = localStorage.getItem("authToken");

    try {
      const response = await axios.get(
        `${API_URL}/api/get_generate_csv_file_for_chapters?class_id=${selectedClasses}&sm_id=${selectedSubject}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      let filename = "chapter.csv";

      const selectedClassArray = Array.isArray(selectedClasses)
        ? selectedClasses
        : [selectedClasses];

      const selectedClassNames = allClasses
        .filter((cls) => selectedClassArray.includes(cls.class_id))
        .map((cls) =>
          (cls.name || cls.classname || cls.class_name || "Class").replace(
            /\s+/g,
            "_"
          )
        );

      const selectedSubjectName =
        allSubject
          ?.find((sub) => sub.sm_id === selectedSubject)
          ?.name?.replace(/\s+/g, "_") || "Subject";

      if (selectedClassNames.length > 0 && selectedSubjectName) {
        filename = `Chapters_${selectedClassNames.join(
          "_"
        )}_${selectedSubjectName}.csv`;
      } else if (selectedClassNames.length > 0) {
        filename = `${selectedClassNames.join("_")}.csv`;
      } else if (selectedSubjectName) {
        filename = `${selectedSubjectName}.csv`;
      }

      triggerFileDownload(response.data, filename);
    } catch (error) {
      console.error("Error downloading template:", error);
      toast.error("Failed to download template. Please try again.");
    }
  };

  const triggerFileDownload = (blobData, fileName) => {
    const url = window.URL.createObjectURL(new Blob([blobData]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName); // Set the file name
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); // Cleanup after download
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);

      setErrorMessage("");
      setErrorMessageUrl("");
      setUploadStatus("");
    }

    e.target.value = null;
  };

  const downloadCsv = async (fileUrl) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        `${API_URL}/api/download_csv_rejected/${fileUrl}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob", //Correct placement
        }
      );

      //  Build dynamic filename based on selected classes
      let filename = "rejected_template.csv"; // fallback
      if (selectedClasses.length > 0 && allClasses.length > 0) {
        const selectedClassNames = allClasses
          .filter((cls) => selectedClasses.includes(cls.class_id))
          .map((cls) => cls.name.replace(/\s+/g, "_"));
        filename = `${selectedClassNames.join("_")}.rejected.template.csv`;
      }

      triggerFileDownload(response.data, filename);
    } catch (error) {
      console.error("Error downloading template:", error);
      toast.error("Failed to download the file.");
    }
  };

  const handleUpload = async () => {
    // 1️⃣ Check if file is selected
    if (!selectedFile) {
      setErrorMessage("Please select a file first.");
      toast.warning("Please select a file first.");
      return;
    }

    // 2️⃣ Check if file is empty (0 bytes)
    if (selectedFile.size === 0) {
      setErrorMessage("Selected file is empty. Please choose a valid file.");
      toast.error("Selected file is empty. Please choose a valid file.");
      return;
    }

    // 3️⃣ Check CSV content (ignore empty headers)
    const checkEmptyCSV = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target.result;
          const lines = text.trim().split("\n").filter(Boolean);
          if (lines.length <= 1) {
            reject("Empty file cannot be uploaded. Please fill chapters data.");
          } else {
            resolve(true);
          }
        };
        reader.onerror = () => reject("Failed to read file.");
        reader.readAsText(file);
      });

    try {
      await checkEmptyCSV(selectedFile);
    } catch (err) {
      setErrorMessage(err);
      toast.error(err);
      return;
    }

    // 4️⃣ Check if class and subject are selected
    if (!selectedClasses || !selectedSubject) {
      toast.warning("Please select Class and Subject before uploading.");
      return;
    }

    setErrorMessage("");
    setErrorMessageUrl("");
    setUploadStatus("");

    const fileName = selectedFile.name.trim();

    // 5️⃣ Prepare class and subject names
    const selectedClassArray = Array.isArray(selectedClasses)
      ? selectedClasses
      : [selectedClasses];

    const selectedClassNameArr = allClasses
      .filter((cls) => selectedClassArray.includes(cls.class_id))
      .map((cls) =>
        (cls.name || cls.classname || cls.class_name || "Class").replace(
          /\s+/g,
          "_"
        )
      );

    const selectedClassNameStr = selectedClassNameArr[0];

    const selectedSubjectName =
      allSubject
        ?.find((sub) => sub.sm_id === selectedSubject)
        ?.name?.replace(/\s+/g, "_") || "Subject";

    // 6️⃣ Validate file name
    const classPattern = selectedClassNameStr.replace(
      /[-\/\\^$*+?.()|[\]{}]/g,
      "\\$&"
    );
    const subjectPattern = selectedSubjectName.replace(
      /[-\/\\^$*+?.()|[\]{}]/g,
      "\\$&"
    );

    const validPattern = new RegExp(
      `^Chapters_${classPattern}_${subjectPattern}(\\s?\\(\\d+\\))?\\.csv$`,
      "i"
    );

    if (!validPattern.test(fileName)) {
      toast.warning(
        `Invalid file name. Please upload file in format: Chapters_${selectedClassNameStr}_${selectedSubjectName}.csv`
      );
      return;
    }

    setLoading(true);

    // 7️⃣ Prepare FormData
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("class_id", selectedClasses);
    formData.append("sm_id", selectedSubject);

    // 8️⃣ Upload file via Axios
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      const response = await axios.post(
        `${API_URL}/api/upload_chapters_through_excelsheet`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ Check if backend returned 422 inside body
      if (response.data?.status === 422) {
        const backendMessage = response.data?.message || "Invalid data in file";
        const invalidRows = response.data?.invalid_rows || "";

        setErrorMessage(backendMessage);
        setErrorMessageUrl(`${invalidRows}`);
        toast.error(backendMessage);
        return; // stop further processing
      }

      // Success case
      toast.success("Chapter Data posted successfully!");
      setIsDataPosted(true);
      setSelectedFile(null);
      fetchEvents();
    } catch (error) {
      // Handle actual HTTP errors (like 402, 500, network issues)
      setLoading(false);

      if (error.response) {
        const status = error.response.status;
        const backendMessage = error.response.data?.message || "Unknown error";
        const invalidRows = error.response.data?.invalid_rows || "";

        setErrorMessage(backendMessage);
        setErrorMessageUrl(`${invalidRows}`);
        toast.error(`Error ${status}: ${backendMessage}`);
        return;
      }

      // Network or unknown errors
      setErrorMessage("Something went wrong. Please try again.");
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setTimeout(() => handleReset(), 2000);
    }
  };

  const handleReset = () => {
    setSelectedClasses(null);
    setSelectedSubject(null);
    setShowUploadSection(false);
    setSelectedFile(null);
    setErrorMessage("");
    setErrorMessageUrl("");
    setUploadStatus("");
    setIsDataPosted(false);
  };

  useEffect(() => {
    const trimmedSearch = searchTerm.trim().toLowerCase();

    if (trimmedSearch !== "" && prevSearchTermRef.current === "") {
      previousPageRef.current = currentPage; // Save current page before search
      setCurrentPage(0); // Jump to first page when searching
    }

    if (trimmedSearch === "" && prevSearchTermRef.current !== "") {
      setCurrentPage(previousPageRef.current); // Restore saved page when clearing search
    }

    prevSearchTermRef.current = trimmedSearch;
  }, [searchTerm]);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setShowUploadSection(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    const filtered = (Array.isArray(holidays) ? holidays : []).filter(
      (holiday) => {
        if (!searchTerm) return true;

        const searchLower = searchTerm.toLowerCase().trim();
        const subjectName = holiday?.sub_name?.toLowerCase().trim() || "";
        const subSubjectName = holiday?.sub_subject?.toLowerCase().trim() || "";
        const className = holiday?.class_name || "";
        const createdBy = holiday?.tec_name?.toLowerCase().trim() || "";
        const lessonNo =
          holiday?.chapter_no != null ? String(holiday.chapter_no) : "";

        return (
          subjectName.includes(searchLower) ||
          subSubjectName.includes(searchLower) ||
          createdBy.includes(searchLower) ||
          className.includes(searchLower) ||
          lessonNo.includes(searchLower)
        );
      }
    );

    setFilteredSections(filtered);
  }, [holidays, searchTerm]);

  console.log("filtered Chapter", filteredSections);
  useEffect(() => {
    setPageCount(Math.ceil(filteredSections.length / pageSize));
  }, [filteredSections, pageSize]);

  const displayedSections = filteredSections.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  console.log("displayted sections", displayedSections);

  return (
    <>
      <div className="md:mx-auto md:w-[90%] p-4 bg-white mt-4 ">
        <div className="w-full  flex flex-row justify-between">
          <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
            Chapters
          </h3>
          <RxCross1
            className=" relative  mt-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
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

        <div className="bg-white w-full md:w-[97%] mx-auto rounded-md ">
          <div className="w-full  mx-auto">
            <ToastContainer />

            {showUploadSection && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white w-full max-w-6xl mx-4 rounded-lg shadow-lg p-6 overflow-y-auto max-h-[90vh] relative">
                  <RxCross1
                    className=" absolute top-3 right-4 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                    onClick={() => handleReset()}
                  />

                  <h2 className="text-center text-xl font-semibold text-blue-600 mb-4 flex items-center justify-center gap-2">
                    📂 Upload Chapter Data from Excel Sheet
                  </h2>

                  <div className="mb-6">
                    {/* Card container */}
                    <div className="bg-white shadow-md rounded-2xl p-3 flex flex-col md:flex-row items-center gap-6 border border-gray-200">
                      {/* --- CLASS SECTION --- */}
                      <div className="flex items-center w-full md:w-1/2 gap-3">
                        <label className="font-semibold text-gray-700 whitespace-nowrap">
                          Select Class <span className="text-red-500">*</span>
                        </label>
                        <div className="w-[60%]">
                          <Select
                            options={allClasses.map((cls) => ({
                              value: cls.class_id,
                              label: cls.class_name,
                            }))}
                            value={
                              allClasses
                                .map((cls) => ({
                                  value: cls.class_id,
                                  label: cls.class_name,
                                }))
                                .find(
                                  (option) => option.value === selectedClasses
                                ) || null
                            }
                            onChange={handleClassChange}
                            placeholder="Select"
                            className="basic-single"
                            classNamePrefix="select"
                            isSearchable
                            isClearable
                            styles={{
                              control: (provided, state) => ({
                                ...provided,
                                borderRadius: "0.5rem",
                                borderColor: state.isFocused
                                  ? "#3b82f6"
                                  : "#d1d5db",
                                boxShadow: state.isFocused
                                  ? "0 0 0 1px #3b82f6"
                                  : "none",
                                minHeight: "40px",
                              }),
                              menu: (provided) => ({
                                ...provided,
                                borderRadius: "0.5rem",
                              }),
                            }}
                          />

                          {classError && (
                            <p className="text-red-600 text-sm">{classError}</p>
                          )}
                        </div>
                      </div>

                      {/* --- SUBJECT SECTION --- */}
                      <div className="flex items-center w-full md:w-1/2 gap-3">
                        <label className="font-semibold text-gray-700 whitespace-nowrap">
                          Select Subject <span className="text-red-500">*</span>
                        </label>
                        <div className="w-full">
                          <Select
                            options={allSubject.map((cls) => ({
                              value: cls.sm_id,
                              label: cls.name,
                            }))}
                            value={
                              allSubject
                                .filter((cls) => cls.sm_id === selectedSubject)
                                .map((cls) => ({
                                  value: cls.sm_id,
                                  label: cls.name,
                                }))[0] || null
                            }
                            onChange={handleSubjectChange}
                            placeholder="Select"
                            className="basic-single"
                            classNamePrefix="select"
                            isSearchable
                            isClearable
                            styles={{
                              control: (provided, state) => ({
                                ...provided,
                                borderRadius: "0.5rem", // Rounded border
                                borderColor: state.isFocused
                                  ? "#3b82f6"
                                  : "#d1d5db", // Blue when focused, gray otherwise
                                boxShadow: state.isFocused
                                  ? "0 0 0 1px #3b82f6"
                                  : "none",
                                minHeight: "40px",
                              }),
                              menu: (provided) => ({
                                ...provided,
                                borderRadius: "0.5rem", // Rounded dropdown menu
                              }),
                            }}
                          />
                          {subjectError && (
                            <p className="text-red-600 text-sm">
                              {subjectError}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Three Card Upload Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    {/* Template Download */}
                    <div className="flex flex-col items-center p-6 bg-gradient-to-br from-blue-100 via-white to-blue-50 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
                      <h5 className="font-semibold mb-3 text-black text-lg">
                        Download Template
                      </h5>

                      <div className="text-sm text-gray-700 leading-relaxed space-y-4 mb-4 text-left">
                        <div className="flex items-start gap-3">
                          <strong className="w-12 flex-shrink-0">
                            Step 1:
                          </strong>
                          <p className="flex-1">
                            Please select class &amp; subject
                          </p>
                        </div>

                        <div className="flex items-start gap-3">
                          <strong className="w-12 flex-shrink-0">
                            Step 2:
                          </strong>
                          <p className="flex-1">
                            Please download the chapter template by clicking
                            below
                            <strong> "Download Template"</strong> button below.
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={handleDownloadTemplate}
                        className="mt-5 bg-blue-600 text-white text-sm rounded-full px-6 py-3 hover:bg-blue-700 transition"
                      >
                        <i className="fas fa-download text-base"></i> Download
                        Template
                      </button>
                    </div>

                    {/* File Upload */}
                    <div className="flex flex-col items-center p-6 bg-gradient-to-br  from-blue-100 via-white to-blue-50 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
                      <h5 className="font-semibold mb-3 text-black text-lg">
                        Select a File to Upload
                      </h5>
                      <div className="text-sm text-gray-700 leading-relaxed space-y-4  text-left">
                        <div className="flex items-start gap-3">
                          <strong className="w-12 flex-shrink-0">
                            Step 3:
                          </strong>
                          <p className="flex-1">
                            Enter data in the downloaded file.
                          </p>
                        </div>
                      </div>

                      <div className="text-sm text-blue-900 bg-blue-50 p-2 rounded-md border border-blue-200 text-left space-y-1">
                        <strong className="block text-blue-700">PS:</strong>
                        <ul className="list-disc list-outside pl-6 ">
                          <li>Do not change the name of the file.</li>
                          <li>
                            Do not change the contents of first 4 columns in the
                            downloaded excelsheet.
                          </li>
                          <li>
                            Please click on the button below to select the file
                            which was downloaded in the previous step.
                          </li>
                        </ul>
                      </div>

                      <label className="mt-4 bg-blue-600 text-white md:w-[45%] rounded-full text-sm px-6 py-3 hover:bg-blue-700 cursor-pointer whitespace-nowrap overflow-hidden">
                        <i className="fas fa-upload text-base"></i>{" "}
                        {selectedFile
                          ? selectedFile.name.length > 20
                            ? `${selectedFile.name.substring(0, 10)}...`
                            : selectedFile.name
                          : "Choose File"}
                        <input
                          type="file"
                          accept=".csv"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Upload Submit */}
                    <div className="flex flex-col items-center p-6 bg-gradient-to-br  from-blue-100 via-white to-blue-50 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
                      <h5 className="font-semibold mb-3 text-black text-lg">
                        Enter New Chapter List
                      </h5>
                      <div className="text-sm text-gray-700 leading-relaxed space-y-4 mb-4 text-left">
                        <div className="flex items-start gap-3">
                          <strong className="w-12 flex-shrink-0">
                            Step 4:
                          </strong>
                          <p className="flex-1">
                            Please click on the
                            <strong> "Upload"</strong> button to upload the
                            file.
                          </p>
                        </div>

                        <div className="flex items-start gap-3">
                          <strong className="w-12 flex-shrink-0">
                            Step 5:
                          </strong>
                          <p className="flex-1">
                            Chapter will be entered in the application
                          </p>
                        </div>
                      </div>

                      <div className="text-xs flex flex-col justify-around">
                        {errorMessage && (
                          <p className="text-red-500">{errorMessage}</p>
                        )}

                        {errorMessageUrl && errorMessageUrl !== "undefined" && (
                          <a
                            href="#"
                            className="underline text-blue-600 hover:text-blue-800"
                            onClick={(e) => {
                              e.preventDefault();
                              downloadCsv(errorMessageUrl);
                            }}
                          >
                            Download CSV to see errors.
                          </a>
                        )}
                      </div>
                      <button
                        onClick={handleUpload}
                        className="mt-5 bg-blue-600 text-white text-sm rounded-full px-6 py-3 hover:bg-blue-700 transition"
                        disabled={loading}
                      >
                        <i className="fas fa-cloud-upload-alt text-base"></i>{" "}
                        {loading ? "Uploading..." : "Upload"}
                      </button>
                      {uploadStatus && (
                        <p className="text-green-600 mt-2">{uploadStatus}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="w-full  mt-4">
              <div className="card mx-auto lg:w-full shadow-lg">
                <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                  <div>
                    <button
                      onClick={() => setShowUploadSection(true)}
                      className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition duration-200"
                    >
                      Upload Chapter Data from Excel Sheet
                    </button>
                  </div>
                  <div className="box-border flex md:gap-x-2 justify-end md:h-10">
                    <div className=" w-1/2 md:w-fit mr-1">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search"
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <button
                      className="btn btn-primary btn-sm md:h-9 text-xs md:text-sm"
                      onClick={handleAdd}
                    >
                      <FontAwesomeIcon
                        icon={faPlus}
                        style={{ marginRight: "5px" }}
                      />
                      Add
                    </button>

                    <button
                      // type="submit"
                      className="btn btn-primary btn-sm md:h-9 text-xs md:text-sm"
                      onClick={handlePublish}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Publishing..." : "Publish"}
                    </button>
                  </div>
                </div>
                <div
                  className=" relative w-[97%]   mb-3 h-0.5  mx-auto bg-red-700"
                  style={{
                    backgroundColor: "#C03078",
                  }}
                ></div>

                <div className="card-body w-full">
                  <div className="h-96 lg:h-96 overflow-y-scroll lg:overflow-x-hidden w-full  md:w-[100%] mx-auto">
                    <table className="min-w-full leading-normal table-fixed">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="px-2 w-full md:w-[4%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                            Sr. No
                          </th>
                          <th className="px-2 w-full md:w-[6%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                            <input
                              type="checkbox"
                              checked={selectAll}
                              onChange={handleSelectAll}
                              className="cursor-pointer"
                            />{" "}
                            All
                          </th>
                          <th className="px-2 w-full md:w-[6%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                            Class
                          </th>
                          <th className="px-2 w-full md:w-[15%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                            Subject
                          </th>
                          <th className="px-2 w-full md:w-[7%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                            Lesson No.
                          </th>
                          <th className="px-2 w-full md:w-[15%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                            Name
                          </th>
                          <th className="px-2 w-full md:w-[15%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider ">
                            Sub-Subject
                          </th>
                          <th className="px-2 w-full md:w-[15%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                            Created By
                          </th>
                          <th className="px-2 w-full md:w-[6%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                            Edit
                          </th>
                          <th className="px-2 w-full md:w-[6%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                            Delete
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {loadingEvent ? (
                          <div className="absolute left-[1%] w-[100%]  text-center flex justify-center items-center mt-14">
                            <div className=" text-center text-xl text-blue-700">
                              Please Wait While Data is Loading...
                            </div>
                          </div>
                        ) : displayedSections.length ? (
                          displayedSections.map((holiday, index) => (
                            <tr
                              key={holiday.latest_event_id}
                              className="text-sm"
                            >
                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                {currentPage * pageSize + index + 1}
                              </td>

                              <td className="px-2 text-center lg:px-3 border border-gray-950 text-sm">
                                <p className="text-gray-900 whitespace-no-wrap relative top-2">
                                  {holiday.publish === "N" && (
                                    <input
                                      type="checkbox"
                                      checked={selectedHolidays.includes(
                                        holiday.chapter_id
                                      )}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        handleCheckboxChange(
                                          holiday.chapter_id
                                        );
                                      }}
                                    />
                                  )}
                                </p>
                              </td>

                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                {holiday.class_name}
                              </td>

                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm break-words">
                                {holiday.sub_name}
                              </td>

                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm text-nowrap">
                                {holiday.chapter_no}
                              </td>

                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm break-words">
                                {holiday.name}
                              </td>

                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                {holiday.sub_subject}
                              </td>

                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                {capitalizeWords(holiday.tec_name)}
                              </td>

                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                {holiday.publish === "N" && (
                                  <button
                                    className="text-blue-600 hover:text-blue-800 hover:bg-transparent"
                                    onClick={() => handleEdit(holiday)}
                                  >
                                    <FontAwesomeIcon icon={faEdit} />
                                  </button>
                                )}
                              </td>

                              {/* <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                {deletedHolidays.includes(
                                  holiday.chapter_id
                                ) ? (
                                  <span className="text-red-600 font-semibold">
                                    Deleted
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleDelete(holiday)}
                                    className="text-red-600 hover:text-red-800 hover:bg-transparent"
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </button>
                                ) }
                              </td> */}

                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                {holiday.isDelete === "Y" ||
                                deletedHolidays.includes(holiday.chapter_id) ? (
                                  <span className="text-red-600 font-semibold">
                                    Deleted
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleDelete(holiday)}
                                    className="text-red-600 hover:text-red-800 hover:bg-transparent"
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <div className="absolute left-[1%] w-[100%]  text-center flex justify-center items-center mt-14">
                            <div className=" text-center text-xl text-red-700">
                              Oops! No data found..
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
                      breakClassName={"page-item"}
                      breakLinkClassName={"page-link"}
                      pageCount={pageCount}
                      marginPagesDisplayed={1}
                      pageRangeDisplayed={1}
                      onPageChange={handlePageClick}
                      containerClassName={"pagination"}
                      pageClassName={"page-item"}
                      pageLinkClassName={"page-link"}
                      previousClassName={"page-item"}
                      previousLinkClassName={"page-link"}
                      nextClassName={"page-item"}
                      nextLinkClassName={"page-link"}
                      activeClassName={"active"}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
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
                  {console.log(
                    "the currecnt section inside delete of the Holiday",
                    currentHoliday
                  )}
                </div>
                <div
                  className=" relative  mb-3 h-1 w-[97%] mx-auto bg-red-700"
                  style={{
                    backgroundColor: "#C03078",
                  }}
                ></div>
                <div className="modal-body">
                  Are you sure you want to delete this chapter for this subject
                  ?{` ${currentHolidayNameForDelete} `}
                </div>
                <div className=" flex justify-end p-3">
                  <button
                    type="button"
                    className="btn btn-danger px-3 mb-2"
                    onClick={() => handleSubmitDelete(currentHoliday)}
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
    </>
  );
}

export default Chapter;
