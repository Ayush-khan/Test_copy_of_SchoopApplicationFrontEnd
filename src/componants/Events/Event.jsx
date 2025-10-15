import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import { RxCross1 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Select from "react-select";
import LoaderStyle from "../common/LoaderFinal/LoaderStyle";
import MarkDropdownEditor from "./MarkDropdownEditor";
import { IoMdSend } from "react-icons/io";
import { FaCheck } from "react-icons/fa";

function Event() {
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
  const [isSubmittingandPublishing, setIsSubmittingandPublishing] =
    useState(false);
  const [sendingSMS, setSendingSMS] = useState({});

  const [filteredSections, setFilteredSections] = useState([]);
  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");

  const [classSectionList, setClassSectionList] = useState([]);
  const [selectedClassSection, setSelectedClassSection] = useState(null);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [loadingClassSection, setLoadingClassSection] = useState(false);

  const [monthError, setMonthError] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedMonthId, setSelectedMonthId] = useState(null);

  const [loadingForSearch, setLoadingForSearch] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState(null);

  const pageSize = 10;
  const navigate = useNavigate();
  // State for form fields and validation errors
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(""); // For success message
  const [errorMessage, setErrorMessage] = useState(""); // For error message
  const [errorMessageUrl, setErrorMessageUrl] = useState(""); // For error message
  const [loading, setLoading] = useState(false); // For loader
  const [showDisplayUpload, setShowDisplayUpload] = useState(false);
  const [isDataPosted, setIsDataPosted] = useState(false); // Flag for tracking successful post
  const [userName, setUserName] = useState("");
  const [holidays, setHolidays] = useState([]);
  const [selectedHolidays, setSelectedHolidays] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [currentHoliday, setCurrentHoliday] = useState("");
  const [currentHolidayNameForDelete, setCurrentHolidayNameForDelete] =
    useState("");
  const [publishedHolidays, setPublishedHolidays] = useState([]);
  const [deletedHolidays, setDeletedHolidays] = useState([]);
  const [dateLimits, setDateLimits] = useState({ min: "", max: "" });
  // const [formData, setFormData] = useState({ holiday_date: "" });
  const [allClasses, setAllClasses] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState("");
  const [errors, setErrors] = useState({});
  const [showUploadSection, setShowUploadSection] = useState(false);
  const [eventData, setEventData] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loadingEvent, setLoadingEvent] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    holiday_date: "",
    to_date: "",
  });

  useEffect(() => {
    fetchClassNames();
    fetchClassSectionList();
    fetchRoles();
  }, []);

  const capitalizeWords = (str) =>
    str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

  const fetchClassNames = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${API_URL}/api/getClassList`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Fetched Class List:", response.data); // 🔍 Check exact structure

      //  Adjust based on the actual structure
      if (Array.isArray(response.data.classes)) {
        setAllClasses(response.data.classes); // if response.data.classes is the correct array
      } else {
        setAllClasses(response.data); // fallback if it's directly an array
      }
    } catch (error) {
      toast.error("Error fetching class names");
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (classId) => {
    if (selectedClasses.includes(classId)) {
      setSelectedClasses(selectedClasses.filter((id) => id !== classId));
    } else {
      setSelectedClasses([...selectedClasses, classId]);
    }
  };

  const handleSelectAllClasses = () => {
    if (selectedClasses.length === allClasses.length) {
      setSelectedClasses([]);
    } else {
      setSelectedClasses(allClasses.map((cls) => cls.class_id));
    }
  };

  // Fetch Class + Section + Student Count
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

  // Handle Selection from Dropdown
  const handleClassSectionSelect = (selectedOption) => {
    setSelectedClassSection(selectedOption);
    setSelectedSectionId(selectedOption?.value); // Store section_id
  };

  // Convert to Dropdown Options
  const classSectionOptions = useMemo(
    () =>
      classSectionList.map((item) => ({
        value: item?.class_id,
        label: `${item.name}`,
      })),
    [classSectionList]
  );

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

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${API_URL}/api/get_rolesforevent`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      //  Use only the actual array
      const rolesData = response.data?.data || [];
      setRoles(rolesData);
    } catch (error) {
      toast.error("Error fetching roles");
    } finally {
      setLoading(false);
    }
  };

  const academicYrTo = localStorage.getItem("academic_yr_to");
  const academicYrFrom = localStorage.getItem("academic_yr_from"); // e.g. "2025-03-31"
  const academicYear = academicYrFrom
    ? new Date(academicYrFrom).getFullYear()
    : new Date().getFullYear();

  //Fetch Month
  const monthMap = [
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
  ];

  const monthOptions = useMemo(
    () =>
      monthMap.map((month) => ({
        value: `${month.value}-${academicYear}`,
        label: month.label,
      })),
    []
  );

  const handleMonthSelect = (selectedOption) => {
    setSelectedMonth(selectedOption);
    setSelectedMonthId(selectedOption ? selectedOption?.value : null);
  };

  const getDateLimits = (academicYear) => {
    if (!academicYear) return {};

    const [startYear, endYear] = academicYear.split("-").map(Number);

    return {
      min: `${startYear}-04-01`, // Start of academic year (April 1st)
      max: `${endYear}-03-31`, // End of academic year (March 31st)
    };
  };

  const fetchEvents = async () => {
    setLoadingEvent(true);
    setLoadingForSearch(true);
    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.get(`${API_URL}/api/get_eventlist`, {
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
        setDateLimits(getDateLimits(academicYear));
      }

      console.log("events", response.data.data);
      setHolidays(response.data.data || []);
      setPageCount(Math.ceil((response.data.data?.length || 0) / pageSize));
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Error fetching events data.");
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

  // Handle pagination
  const handlePageClick = (data) => {
    console.log("Page clicked:", data.selected);
    setCurrentPage(data.selected);
  };

  const handleAdd = () => {
    // setShowAddModal(true);
    navigate("/createEvent");
  };

  const handleEdit = (holiday) => {
    navigate(`/editEvent/${holiday.unq_id}`, { state: { holiday } });
  };

  const handleView = (holiday) => {
    console.log("inside view", holiday);

    setShowViewModal(true);
    setSelectedHoliday(holiday);
  };

  // const handleSelectAll = () => {
  //   setSelectAll(!selectAll);
  //   if (!selectAll) {
  //     // Select all students
  //     const allHolidayIds = holidays.map((holiday) => holiday.unq_id);
  //     setSelectedHolidays(allHolidayIds);
  //     console.log("allEvents", allHolidayIds);
  //   } else {
  //     // Deselect all students
  //     setSelectedHolidays([]);
  //   }
  // };

  const handleSelectAll = () => {
    if (!holidays || holidays.length === 0) {
      toast.warning("No events available to select.");
      return;
    }

    // Find all unpublished events only
    const unpublishedHolidayIds = holidays
      .filter((holiday) => holiday.publish === "N")
      .map((holiday) => holiday.unq_id);

    if (unpublishedHolidayIds.length === 0) {
      toast.warning("No unpublished events available for publish.");
      setSelectAll(false); // ✅ make sure checkbox stays unchecked
      setSelectedHolidays([]);
      return;
    }

    setSelectAll((prev) => {
      const newSelectAll = !prev;

      if (newSelectAll) {
        // ✅ Only unpublished IDs will be selected
        setSelectedHolidays(unpublishedHolidayIds);
        console.log("allUnpublishedEvents", unpublishedHolidayIds);
      } else {
        // Deselect all
        setSelectedHolidays([]);
      }

      return newSelectAll;
    });
  };

  // const handleSelectAll = () => {
  //   if (!holidays || holidays.length === 0) {
  //     toast.warning("No events available to select.");
  //     return;
  //   }

  //   setSelectAll((prev) => {
  //     const newSelectAll = !prev;

  //     if (newSelectAll) {
  //       // Only select events that are not yet published
  //       const unpublishedHolidayIds = holidays
  //         .filter((holiday) => holiday.publish === "N")
  //         .map((holiday) => holiday.unq_id);

  //       if (unpublishedHolidayIds.length === 0) {
  //         toast.warning("No events available for publish.");
  //       }

  //       setSelectedHolidays(unpublishedHolidayIds);
  //       console.log("allUnpublishedEvents", unpublishedHolidayIds);
  //     } else {
  //       // Deselect all events
  //       setSelectedHolidays([]);
  //     }

  //     return newSelectAll;
  //   });
  // };

  const handleCheckboxChange = (holidayId) => {
    if (selectedHolidays.includes(holidayId)) {
      setSelectedHolidays(selectedHolidays.filter((id) => id !== holidayId));
    } else {
      setSelectedHolidays([...selectedHolidays, holidayId]);
    }
  };

  // const handlePublish = async () => {
  //   if (selectedHolidays.length === 0) {
  //     toast.warning("Please select at least one Event to publish.");
  //     return;
  //   }

  //   setIsSubmitting(true);
  //   const token = localStorage.getItem("authToken");

  //   if (!token) {
  //     alert("Authentication required. Please log in.");
  //     setIsSubmitting(false);
  //     return;
  //   }

  //   try {
  //     const formData = new FormData();
  //     selectedHolidays.forEach((id) => {
  //       formData.append("checkbxuniqid[]", id);
  //     });

  //     const response = await axios.post(
  //       `${API_URL}/api/update_publishevent`,
  //       formData,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     const data = response.data;

  //     if (data.success) {
  //       toast.success(data.message || "Event published successfully!");
  //       setHolidays((prev) =>
  //         prev.map((holiday) =>
  //           selectedHolidays.includes(holiday.unq_id)
  //             ? { ...holiday, publish: "Y" }
  //             : holiday
  //         )
  //       );
  //       setSelectedHolidays([]);
  //     } else {
  //       toast.error(data.message || "Failed to publish events.");
  //     }
  //   } catch (error) {
  //     console.error("Error publishing events:", error);
  //     toast.error("An error occurred while publishing events.");
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const handlePublish = async () => {
    // 1️⃣ Check if there are any events at all
    if (!holidays || holidays.length === 0) {
      toast.warning("No events available for publish.");
      return;
    }

    // 2️⃣ Check if the user selected any events
    if (!selectedHolidays || selectedHolidays.length === 0) {
      toast.warning("Please select at least one event to publish.");
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
      selectedHolidays.forEach((id) => formData.append("checkbxuniqid[]", id));
      console.log("selectedHolidys", selectedHolidays);

      const response = await axios.post(
        `${API_URL}/api/update_publishevent`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = response.data;

      if (data.success) {
        toast.success(data.message || "Event published successfully!");
        setHolidays((prev) =>
          prev.map((holiday) =>
            selectedHolidays.includes(holiday.unq_id)
              ? { ...holiday, publish: "Y" }
              : holiday
          )
        );
        setSelectedHolidays([]);
        setSelectAll(false);
      } else {
        toast.error(data.message || "Failed to publish events.");
      }
    } catch (error) {
      console.error("Error publishing events:", error);
      toast.error("An error occurred while publishing events.");
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
    setCurrentHoliday(holiday.unq_id);
    setCurrentHolidayNameForDelete(holiday.title);

    console.log("Event to delete:", holiday);
    console.log("Current Event name for delete:", holiday.title);

    // Show confirmation modal for all holidays (published & unpublished)
    setShowDeleteModal(true);
  };

  const handleSubmitDelete = async (holidayId) => {
    if (!holidayId) {
      toast.error("Invalid Event selected.");
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

      console.log("Deleting Event with ID:", holidayId);

      // Call API to delete holiday
      const response = await axios.delete(
        `${API_URL}/api/delete_eventbyunqid/${holidayId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { data } = response;

      if (!data.success) {
        toast.error("Failed to delete the event.");
        setIsSubmitting(false);
        return;
      }

      //Remove holiday from UI (both published & unpublished)
      setHolidays((prevHolidays) =>
        prevHolidays.filter((h) => h.unq_id !== holidayId)
      );

      // Track deleted holidays if they were published
      setDeletedHolidays((prev) => {
        const updatedDeletedHolidays = [...prev, holidayId];
        localStorage.setItem(
          "deletedEvents",
          JSON.stringify(updatedDeletedHolidays)
        );
        return updatedDeletedHolidays;
      });

      toast.success("Event deleted successfully!");
      setShowDeleteModal(false); // Close modal after delete
      fetchEvents(); // Refresh list
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Server error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setFormData({ title: "", holiday_date: "", to_date: "" }); // Clear the form data when closing
    setFieldErrors({ message: "" }); // Reset any errors
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowDActiveModal(false);
    setShowViewModal(false);
  };

  const handleDownloadTemplate = async () => {
    if (selectedClasses.length === 0) {
      // setErrors((prev) => ({
      //   ...prev,
      //   classError:
      //     "Please select at least one class to download the template.",
      // }));
      toast.error("Please select at least one class to download the template.");
      return; // Stop function execution
    }

    const token = localStorage.getItem("authToken");

    try {
      const response = await axios.get(
        `${API_URL}/api/get_template_csv_event`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      let filename = "event_template.csv"; // Default fallback

      if (selectedClasses.length === allClasses.length) {
        filename = "all_event.csv";
      } else if (selectedClasses.length > 0) {
        const selectedClassNames = allClasses
          .filter((cls) => selectedClasses.includes(cls.class_id))
          .map((cls) => cls.name.replace(/\s+/g, "_"));

        filename = `${selectedClassNames.join("_")}_event.csv`;
      }

      triggerFileDownload(response.data, filename);
    } catch (error) {
      console.error("Error downloading template:", error);
    }
  };

  // Helper function to trigger file download
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
    if (!selectedFile) {
      setErrorMessage("Please select a file first.");
      return;
    }

    setErrorMessage("");
    setErrorMessageUrl("");
    setUploadStatus("");

    const fileName = selectedFile.name.trim();

    // Accept if filename ends with "_event.csv" or "_rejected_template.csv" (+ optional numbered suffix like (1), (2))
    const validPattern = /_(event|rejected_template)(\s?\(\d+\))?\.csv$/i;
    const validPatternone = /(event|rejected_template)(\s?\(\d+\))?\.csv$/i;

    if (!validPattern.test(fileName) && !validPatternone.test(fileName)) {
      toast.warning("Please check if correct file is selected for upload.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.post(
        `${API_URL}/api/import_event_csv`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Events Data posted successfully!");
        setIsDataPosted(true);
        setSelectedFile(null);
        fetchEvents();
      }

      setTimeout(() => {
        handleReset();
      }, 2000);
    } catch (error) {
      setLoading(false);

      const showErrorForUploading = error?.response?.data?.message;
      const showErrorForUploadingUrl = error?.response?.data?.invalid_rows;

      setErrorMessage(
        !showErrorForUploading
          ? "Failed to upload file. Please try again..."
          : `Error: ${showErrorForUploading}.`
      );

      setErrorMessageUrl(`${showErrorForUploadingUrl}`);

      toast.error(
        !showErrorForUploading
          ? "Error uploading file."
          : error?.response?.data?.message
      );
    }
  };
  const handleSend = async (uniqueId) => {
    try {
      setSendingSMS((prev) => ({ ...prev, [uniqueId]: true }));

      // Get auth token from localStorage
      const token = localStorage.getItem("authToken");

      if (!token) {
        toast.error("Authentication token not found. Please log in again.");
        return;
      }

      // Construct the API URL with the unique ID as a query parameter
      // const apiUrl = `http://103.159.85.174:8500/api/save_sendsms/${uniqueId}`;

      // Make the POST request
      const response = await axios.post(
        `${API_URL}/api/send_pendingsmsforevent/${uniqueId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Handle success response
      if (response.status === 200 && response.data.success) {
        toast.success(
          response?.data?.message ||
            `Message sent successfully for Unique ID: ${uniqueId}`
        );
        fetchEvents();
      } else {
        toast.error("Failed to send SMS. Please try again.");
      }
    } catch (error) {
      console.error("Error sending SMS:", error);
      toast.error("An error occurred while sending SMS. Please try again.");
    } finally {
      setSendingSMS((prev) => ({ ...prev, [uniqueId]: false }));
    }
  };
  // const handleUpload = async () => {
  //   if (!selectedFile) {
  //     setErrorMessage("Please select a file first.");
  //     return;
  //   }

  //   setLoading(true); // Show loader
  //   const formData = new FormData();
  //   formData.append("file", selectedFile);

  //   try {
  //     const token = localStorage.getItem("authToken");
  //     if (!token) {
  //       throw new Error("No authentication token found");
  //     }

  //     console.log("File is valid CSV", formData);

  //     const response = await axios.post(
  //       `${API_URL}/api/import_event_csv`,
  //       formData,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     console.log("Response of bulk upload:", response);

  //     if (response.status === 200) {
  //       toast.success("Events Data posted successfully!");
  //       setIsDataPosted(true);
  //       setSelectedFile(null);
  //       fetchEvents();
  //     }
  //     setTimeout(() => {
  //       handleReset();
  //     }, 2000);
  //   } catch (error) {
  //     setLoading(false); // Hide loader

  //     const showErrorForUploading = error?.response?.data?.message;
  //     const showErrorForUploadingUrl = error?.response?.data?.invalid_rows;
  //     console.log("Error from API:", showErrorForUploading);

  //     setErrorMessage(
  //       !showErrorForUploading
  //         ? "Failed to upload file. Please try again..."
  //         : `Error: ${showErrorForUploading}.`
  //     );

  //     const fullErrorMessageUrl = `${showErrorForUploadingUrl}`;
  //     setErrorMessageUrl(fullErrorMessageUrl);
  //     console.log("Full error message URL:", errorMessageUrl);

  //     toast.error(
  //       !showErrorForUploading
  //         ? "Error uploading file."
  //         : error?.response?.data?.message
  //     );

  //     console.error("Error uploading file:", showErrorForUploading);
  //   }
  // };

  const formatDate = (dateString) => {
    if (!dateString) return " ";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-4); // Last 2 digits of the year
    return `${day}-${month}-${year}`;
  };

  const handleReset = () => {
    setShowUploadSection(false);
    setSelectedClasses([]);
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

  // useEffect(() => {
  //   const filtered = (Array.isArray(holidays) ? holidays : [])
  //     .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
  //     .filter((holiday) => {
  //       if (!searchTerm) return true;

  //       const searchLower = searchTerm.toLowerCase().trim();
  //       const holidayName = holiday?.title?.toLowerCase().trim() || "";
  //       const holidayStartDate =
  //         holiday?.start_date?.toLowerCase().trim() || "";
  //       const createdBy = holiday?.created_by_name?.toLowerCase().trim() || "";

  //       return (
  //         holidayName.includes(searchLower) ||
  //         holidayStartDate.includes(searchLower) ||
  //         createdBy.includes(searchLower)
  //       );
  //     });

  //   setFilteredSections(filtered);
  // }, [holidays, searchTerm]);

  useEffect(() => {
    const filtered = (Array.isArray(holidays) ? holidays : []).filter(
      (holiday) => {
        if (!searchTerm) return true;

        const searchLower = searchTerm.toLowerCase().trim();
        const holidayName = holiday?.title?.toLowerCase().trim() || "";
        const holidayStartDate =
          holiday?.start_date?.toLowerCase().trim() || "";
        const createdBy = holiday?.created_by_name?.toLowerCase().trim() || "";

        return (
          holidayName.includes(searchLower) ||
          holidayStartDate.includes(searchLower) ||
          createdBy.includes(searchLower)
        );
      }
    );

    setFilteredSections(filtered);
  }, [holidays, searchTerm]);

  console.log("filtered events", filteredSections);
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
            Event
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

            <div className="mb-10 ml-5">
              <div className="w-full flex flex-col md:flex-row flex-wrap md:items-end md:gap-x-7 gap-y-3 mb-4">
                {/* Class Dropdown */}
                <div className="flex flex-col md:flex-row md:items-center md:w-1/4">
                  <label className="md:w-[30%] text-md" htmlFor="studentSelect">
                    Class
                  </label>
                  <div className="w-full md:w-[70%]">
                    <Select
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      id="studentSelect"
                      value={selectedClassSection}
                      onChange={handleClassSectionSelect}
                      options={classSectionOptions}
                      placeholder={
                        loadingClassSection ? "Loading..." : "Select"
                      }
                      isSearchable
                      isClearable
                      className="text-sm"
                      isDisabled={loadingClassSection}
                    />
                  </div>
                </div>

                {/* Month Dropdown */}
                <div className="flex flex-col md:flex-row md:items-center md:w-1/4">
                  <label
                    className="md:w-[30%] text-md"
                    htmlFor="divisionSelect"
                  >
                    Month
                  </label>
                  <div className="w-full md:w-[70%]">
                    <Select
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      id="divisionSelect"
                      value={selectedMonth}
                      onChange={handleMonthSelect}
                      options={monthOptions}
                      placeholder={loading ? "Loading..." : "Select"}
                      isSearchable
                      isClearable
                      className="text-sm"
                      isDisabled={loading}
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

                {/* Search Button */}
                <div>
                  <button
                    type="button"
                    onClick={fetchEvents}
                    style={{ backgroundColor: "#2196F3" }}
                    className={`h-10 w-24 text-white text-sm rounded flex items-center justify-center transition duration-200 ${
                      loadingForSearch ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={loadingForSearch}
                  >
                    {loadingForSearch ? (
                      <>
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
                        Searching...
                      </>
                    ) : (
                      "Search"
                    )}
                  </button>
                </div>

                {/* Spacer */}
                <div className="flex-grow"></div>

                {/* Upload Button aligned to right */}
                <div>
                  <button
                    onClick={() => setShowUploadSection(true)}
                    className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-200"
                  >
                    Upload Event Data from Excel Sheet
                  </button>
                </div>
              </div>
            </div>

            {showUploadSection && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white w-full max-w-6xl mx-4 rounded-lg shadow-lg p-6 overflow-y-auto max-h-[90vh] relative">
                  <RxCross1
                    className=" absolute top-3 right-4 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                    // onClick={() => {
                    //   setShowUploadSection(false);
                    // }}
                    onClick={() => handleReset()}
                  />

                  <h2 className="text-center text-2xl font-semibold text-blue-600 mb-4">
                    Upload Event Data from Excel Sheet
                  </h2>

                  {/* Class Selection */}
                  <div className="mb-6 flex flex-col md:flex-row gap-x-4">
                    <h5 className="px-2 lg:px-3 py-2 text-[1em] text-gray-700">
                      Select Classes <span className="text-red-500">*</span>
                    </h5>
                    <div className="w-full md:w-[66%] grid grid-cols-4 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-2">
                      {allClasses.map((cls) => (
                        <div
                          key={cls.class_id}
                          className="flex items-center space-x-2 cursor-pointer"
                          onClick={() => handleClassChange(cls.class_id)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedClasses.includes(cls.class_id)}
                            onChange={() => handleClassChange(cls.class_id)}
                          />
                          <label>{cls.name}</label>
                        </div>
                      ))}
                      <div className="flex items-center space-x-2">
                        <label className="cursor-pointer flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={
                              selectedClasses.length === allClasses.length
                            }
                            onChange={handleSelectAllClasses}
                          />
                          <span>Select All</span>
                        </label>
                      </div>
                    </div>
                    {errors.classError && (
                      <p className="col-span-3 text-red-500">
                        {errors.classError}
                      </p>
                    )}
                  </div>

                  {/* Three Card Upload Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    {/* Template Download */}
                    <div className="flex flex-col items-center p-4 bg-gray-100 rounded-md">
                      <h5 className="font-semibold mb-3 text-gray-800">
                        Download Template
                      </h5>
                      <p className="text-sm text-gray-600 mb-4">
                        # Please download the template by clicking below.
                        <br /># Enter Event details in the downloaded file.
                      </p>
                      <button
                        onClick={handleDownloadTemplate}
                        className="mt-5 bg-blue-600 text-white text-xs rounded-full px-6 py-3 hover:bg-blue-700"
                      >
                        <i className="fas fa-download text-lg"></i> Download
                        Template
                      </button>
                    </div>

                    {/* File Upload */}
                    <div className="flex flex-col items-center p-4 bg-gray-100 rounded-md">
                      <h5 className="font-semibold mb-3 text-gray-800">
                        Select a file to upload
                      </h5>
                      <p className="text-sm text-gray-600 mb-4">
                        # Do not change the name of the file.
                        <br /># Click the button below to select the file
                        downloaded earlier.
                      </p>
                      <label className="mt-4 bg-blue-600 md:w-[45%] text-white rounded-full text-xs px-6 py-3 hover:bg-blue-700 cursor-pointer whitespace-nowrap overflow-hidden">
                        <i className="fas fa-upload text-lg"></i>{" "}
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
                    <div className="flex flex-col items-center p-4 bg-gray-100 rounded-md">
                      <h5 className="font-semibold mb-3 text-gray-800">
                        Enter New Event List
                      </h5>
                      <p className="text-sm text-gray-600 mb-4">
                        # Click the upload button to upload the file.
                        <br /># Event will be entered in the application.
                      </p>
                      <div className="text-xs flex flex-col justify-around">
                        {errorMessage && (
                          <p className="text-red-500">{errorMessage}</p>
                        )}
                        {/* {errorMessageUrl && (
                          <a
                            href="#"
                            className="underline text-blue-500 hover:text-blue-800"
                            onClick={(e) => {
                              e.preventDefault();
                              downloadCsv(errorMessageUrl);
                            }}
                          >
                            Download CSV to see errors.
                          </a>
                        )} */}
                        {errorMessageUrl && errorMessageUrl !== "undefined" && (
                          <a
                            href="#"
                            className="underline text-blue-500 hover:text-blue-800"
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
                        className="mt-12 bg-blue-600 text-white text-xs rounded-full px-6 py-3 hover:bg-blue-700 transition"
                        disabled={loading}
                      >
                        <i className="fas fa-cloud-upload-alt text-lg"></i>{" "}
                        {loading ? "Uploading..." : "Upload"}
                      </button>
                      {uploadStatus && (
                        <p className="text-green-600">{uploadStatus}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* {holidays.length > 0 && ( */}
            <div className="w-full  mt-4">
              <div className="card mx-auto lg:w-full shadow-lg">
                <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                  <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
                    Event List
                  </h3>
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
                  className=" relative w-[97%]   mb-3 h-1  mx-auto bg-red-700"
                  style={{
                    backgroundColor: "#C03078",
                  }}
                ></div>

                <div className="card-body w-full">
                  <div className="h-96 lg:h-96 overflow-y-scroll lg:overflow-x-hidden w-full  md:w-[100%] mx-auto">
                    <table className="min-w-full leading-normal table-fixed">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="px-2 w-full md:w-[6%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                            Sr.No
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
                          <th className="px-2 w-[20%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                            Event Title
                          </th>

                          <th className="px-2 w-full md:w-[15%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                            Class
                          </th>
                          <th className="px-2 w-full md:w-[10%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                            Start Date
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
                          <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                            Publish
                          </th>
                          <th className="px-2 w-full md:w-[6%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                            View
                          </th>
                        </tr>
                      </thead>
                      {/* <tbody>
                        {displayedSections.length ? (
                          displayedSections.map((holiday, index) => (
                            <tr
                              key={holiday.unq_id}
                              className=" text-sm "
                              
                            >
                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                {currentPage * pageSize + index + 1}
                              </td>

                              <td className="px-2 text-center lg:px-3 border border-gray-950 text-sm">
                                {" "}
                                
                                <p className="text-gray-900 whitespace-no-wrap relative top-2">
                                  {holiday.publish === "N" && (
                                    <input
                                      type="checkbox"
                                      checked={selectedHolidays.includes(
                                        holiday.unq_id
                                      )}
                                      onChange={(e) => {
                                        e.stopPropagation(); // Prevents row click from triggering publish
                                        handleCheckboxChange(holiday.unq_id);
                                      }}
                                    />
                                  )}
                                </p>
                              </td>

                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm text-nowrap">
                                {holiday.title}
                              </td>

                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                {holiday.classes && holiday.classes.length > 0
                                  ? holiday.classes
                                      .map((cls) => cls.class_name)
                                      .join(", ")
                                  : "-"}
                              </td>

                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                {holiday.start_date == "0000-00-00"
                                  ? " "
                                  : formatDate(holiday.start_date)}
                              </td>

                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                {capitalizeWords(holiday.created_by_name)}
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

                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                {deletedHolidays.includes(holiday.unq_id) ? (
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
                              <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                                <button
                                  type="button"
                                  className="text-blue-600 hover:text-blue-800 hover:bg-transparent "
                                  onClick={() => handleView(holiday)}
                                >
                                  <MdOutlineRemoveRedEye className="font-bold text-xl" />
                                </button>
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
                      </tbody> */}
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
                                        holiday.unq_id
                                      )}
                                      onChange={(e) => {
                                        e.stopPropagation(); // Prevents row click from triggering publish
                                        handleCheckboxChange(holiday.unq_id);
                                      }}
                                    />
                                  )}
                                </p>
                              </td>

                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm text-nowrap">
                                {holiday.title}
                              </td>

                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                {holiday.classes && holiday.classes.length > 0
                                  ? holiday.classes
                                      .map((cls) => cls.class_name)
                                      .join(", ")
                                  : "-"}
                              </td>

                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                {holiday.start_date === "0000-00-00"
                                  ? " "
                                  : formatDate(holiday.start_date)}
                              </td>

                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                {capitalizeWords(holiday.created_by_name)}
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

                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                {deletedHolidays.includes(holiday.unq_id) ? (
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
                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                {holiday.publish === "Y" &&
                                holiday?.failed_sms_count > 0 ? (
                                  <div className="flex flex-col gap-y-0.5 items-center">
                                    <span className="text-red-600 font-bold text-sm">
                                      {holiday?.failed_sms_count}
                                    </span>
                                    <span className="text-blue-600 text-sm font-medium whitespace-nowrap">
                                      Messages Pending
                                    </span>

                                    <button
                                      disabled={sendingSMS[holiday?.unq_id]}
                                      className={`flex flex-row items-center justify-center mt-1 px-3 py-1 gap-x-1 text-xs md:text-sm font-medium rounded-md ${
                                        sendingSMS[holiday?.unq_id]
                                          ? "bg-blue-300 cursor-not-allowed"
                                          : "bg-blue-500 hover:bg-blue-600 text-white"
                                      }`}
                                      onClick={() =>
                                        handleSend(holiday?.remark_id)
                                      }
                                    >
                                      {sendingSMS[holiday?.unq_id] ? (
                                        <span className="flex items-center gap-1 text-white text-xs">
                                          <svg
                                            className="animate-spin h-4 w-4 text-white"
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
                                          Sending...
                                        </span>
                                      ) : (
                                        <>
                                          Send <IoMdSend />
                                        </>
                                      )}
                                    </button>
                                  </div>
                                ) : holiday.publish === "N" ? (
                                  <button
                                    onClick={() => handlePublish(holiday)}
                                    // className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-xs md:text-sm font-medium"
                                    className={`  font-bold hover:bg-none text-green-600 hover:text-green-800 hover:bg-transparent
                                                                      }`}
                                  >
                                    <FaCheck className="text-lg md:text-xl" />
                                  </button>
                                ) : null}
                              </td>

                              <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                                <button
                                  type="button"
                                  className="text-blue-600 hover:text-blue-800 hover:bg-transparent"
                                  onClick={() => handleView(holiday)}
                                >
                                  <MdOutlineRemoveRedEye className="font-bold text-xl" />
                                </button>
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
            {/* )} */}
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
                    // className="btn-close text-red-600"
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
                  Are you sure you want to delete this holiday{" "}
                  {` ${currentHolidayNameForDelete} `} ?
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

      {/* View Modal */}
      {showViewModal && selectedHoliday && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="modal"
            style={{
              display: "block",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                {/* Modal Header */}
                <div className="flex justify-between p-3">
                  <h5 className="modal-title">View Event</h5>
                  <RxCross1
                    className="float-end relative top-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                    type="button"
                    onClick={handleCloseModal}
                  />
                </div>

                {/* Colored Separator */}
                <div
                  className="relative mb-3 h-1 w-[97%] mx-auto"
                  style={{ backgroundColor: "#C03078" }}
                ></div>

                {/* Modal Body */}
                <div className="modal-body px-4 pb-4">
                  <form className="space-y-4">
                    {/* Event Title */}
                    <div className="flex flex-row">
                      <label className="w-[150px] font-semibold">
                        Event Title
                        {/* <span className="text-sm text-red-500">*</span> */}
                      </label>
                      <input
                        type="text"
                        className="form-control bg-gray-200"
                        value={selectedHoliday?.title || ""}
                        readOnly
                      />
                    </div>

                    {/* Select Class */}
                    <div className="flex flex-row">
                      <label className="w-[150px] font-semibold">
                        Select Classes
                        {/* <span className="text-sm text-red-500">*</span> */}
                      </label>
                      <input
                        type="text"
                        className="form-control bg-gray-200"
                        value={
                          selectedHoliday?.classes
                            ?.map((cls) => cls.class_name)
                            .join(", ") || ""
                        }
                        readOnly
                      />
                    </div>

                    {/* Login Type */}
                    <div className="flex flex-row">
                      <label className="w-[150px] font-semibold">
                        Login Type
                        {/* <span className="text-sm text-red-500">*</span> */}
                      </label>
                      {/* <input
                        type="text"
                        className="form-control bg-gray-200"
                        value={
                          selectedHoliday?.login_type
                            ?.split(",")
                            .map((id) => {
                              const role = roles.find(
                                (role) => role.role_id === id
                              );
                              if (!role) {
                                console.warn("Missing role for ID:", id); // <- Debug missing role
                              }
                              return role?.name;
                            })
                            .filter(Boolean)
                            .join(", ") || ""
                        }
                        readOnly
                      /> */}
                      <input
                        type="text"
                        className="form-control bg-gray-200"
                        value={
                          selectedHoliday?.login_type
                            ?.split(",")
                            .map((id) => {
                              if (id === "A") return "Admin"; // static fallback
                              const role = roles.find(
                                (role) => role.role_id === id
                              );
                              if (!role) {
                                console.warn("Missing role for ID:", id);
                              }
                              return role?.name;
                            })
                            .filter(Boolean)
                            .join(", ") || ""
                        }
                        readOnly
                      />
                    </div>

                    {/* Dates and Times (keep this as you already have it) */}
                    <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                      <div className="flex items-center">
                        <label className="w-[110px] font-semibold">
                          Competition
                          {/* <span className="text-sm text-red-500">*</span> */}
                        </label>
                        <input
                          type="text"
                          className="w-[51%] max-w-md px-2 py-1 border border-gray-400 rounded"
                          value={
                            selectedHoliday?.competition === "Y" ? "Yes" : "No"
                          }
                          readOnly
                        />
                      </div>
                      <div className="flex items-center">
                        <label className="w-[100px] font-semibold">
                          Notify
                        </label>
                        <input
                          type="text"
                          className="w-[51%] max-w-md px-2 py-1 border border-gray-400 rounded"
                          value={selectedHoliday?.notify === "Y" ? "Yes" : "No"}
                          readOnly
                        />
                      </div>
                      <div className="flex items-center">
                        <label className="w-[110px] font-semibold">
                          Start Date
                          {/* <span className="text-sm text-red-500">*</span> */}
                        </label>
                        <input
                          type="text"
                          className="w-[51%] max-w-md px-2 py-1 border border-gray-400 rounded"
                          value={formatDate(selectedHoliday?.start_date || "")}
                          readOnly
                        />
                      </div>
                      <div className="flex items-center">
                        <label className="w-[100px] font-semibold">
                          End Date
                        </label>
                        <input
                          type="text"
                          className="w-[51%] max-w-md px-2 py-1 border border-gray-400 rounded"
                          value={formatDate(selectedHoliday?.end_date || "")}
                          readOnly
                        />
                      </div>
                      <div className="flex items-center">
                        <label className="w-[110px] font-semibold">
                          Start Time
                        </label>
                        <input
                          type="text"
                          className="w-[51%] max-w-md px-2 py-1 border border-gray-400 rounded"
                          value={selectedHoliday?.start_time || ""}
                          readOnly
                        />
                      </div>
                      <div className="flex items-center">
                        <label className="w-[100px] font-semibold">
                          End Time
                        </label>
                        <input
                          type="text"
                          className="w-[51%] max-w-md px-2 py-1 border border-gray-400 rounded"
                          value={selectedHoliday?.end_time || ""}
                          readOnly
                        />
                      </div>
                    </div>

                    {/* Description */}
                    {/* <div className="flex flex-row">
                      <label className="w-[150px] font-semibold">
                        Description
                        
                      </label>
                      <textarea
                        className="form-control bg-gray-200"
                        rows={3}
                        value={selectedHoliday?.event_desc || ""}
                        readOnly
                      />
                    </div> */}
                    <div className="flex flex-col gap-2">
                      <label className="font-semibold">Description</label>
                      <div className="max-w-4xl w-full">
                        <MarkDropdownEditor
                          value={selectedHoliday?.event_desc || ""}
                          readOnly
                          disabled
                        />
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Event;
