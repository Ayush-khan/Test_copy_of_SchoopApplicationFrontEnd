import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  faEdit,
  faTrash,
  faThumbsUp,
  faBookReader,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import { RxCross1 } from "react-icons/rx";
// import Select from "react-select";
import { IoMdSend } from "react-icons/io";

// import { PiCertificateBold } from "react-icons/pi";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { FaCheck, FaEye } from "react-icons/fa";
import { ImDownload } from "react-icons/im";
import { Navigate, useNavigate } from "react-router-dom";
import CreateTeacherNotes from "./CreateTeacherNotes";

function TeacherNotes() {
  const API_URL = import.meta.env.VITE_API_URL; // URL for host
  // const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendingSMS, setSendingSMS] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [activeTab, setActiveTab] = useState("Manage");
  const [classes, setClasses] = useState([]);
  const [classesforsubjectallot, setclassesforsubjectallot] = useState([]);
  const [isImageLoading, setIsImageLoading] = useState(false);
  // for allot subject tab
  const [showViewModal, setShowViewModal] = useState(false);
  const [showPublish, setShowPublishModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const [currestSubjectNameForDelete, setCurrestSubjectNameForDelete] =
    useState("");

  const [newSection, setnewSectionName] = useState("");
  const [newSubject, setnewSubjectnName] = useState("");
  const [newclassnames, setnewclassnames] = useState("");
  const [teacherIdIs, setteacherIdIs] = useState("");
  const [teacherNameIs, setTeacherNameIs] = useState("");

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
  const [status, setStatus] = useState("All"); // For status dropdown
  const [selectedDate, setSelectedDate] = useState(""); // For date picker
  const [notices, setNotices] = useState([]); // To store fetched notices
  const [subject, setSubject] = useState("");
  const [noticeDesc, setNoticeDesc] = useState("");
  const [subjectError, setSubjectError] = useState("");
  const [noticeDescError, setNoticeDescError] = useState("");
  const [selectedFile, setSelectedFile] = useState([]);
  const [open, setOpen] = useState(false);
  const [remarkData, setRemarkData] = useState({
    teacherName: "",
    remarkSubject: "",
    remarkDescription: "",
  });
  const [regId, setRegId] = useState(null);
  const [roleId, setRoleId] = useState(null);
  const [academicYr, setAcademicYr] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);

  // for react-search of manage tab teacher Edit and select class
  const pageSize = 10;
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");
        if (!token) {
          toast.error("Authentication token not found. Please login again.");
          navigate("/");
          return;
        }

        const sessionRes = await axios.get(`${API_URL}/api/sessionData`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const acdYr = sessionRes?.data?.custom_claims?.academic_year;
        const roleId = sessionRes?.data?.user?.role_id;
        const regId = sessionRes?.data?.user?.reg_id;
        if (!roleId || !regId || !acdYr) {
          toast.error("Invalid session data received");
          return;
        }
        setRoleId(roleId);
        setRegId(regId);
        setAcademicYr(acdYr);
      } catch (error) {
        console.error("Initialization error:", error);
        toast.error("Failed to get session data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);
  useEffect(() => {
    if (regId && academicYr) {
      handleSearch();
    }
  }, [regId, academicYr]);

  const handleSearch = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSearchTerm("");
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");

      // ✅ Use regId & academicYr directly from state
      const formData = {
        reg_id: regId,
        acd_yr: academicYr,
      };

      const response = await axios.post(
        `${API_URL}/api/get_daily_notes`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("response", response?.data);

      const dailyNotes = response?.data?.daily_notes || [];

      if (dailyNotes.length > 0) {
        // ✅ Map API fields to what your table expects
        const updatedNotices = dailyNotes.map((note) => ({
          t_remark_id: note.notes_id, // used in delete, send, etc.
          name: `${note.classname} ${note.sectionname}`, // shown under "Class"
          date: note.date, // ✅ include this line

          remark_type: "Daily Notes", // constant type name
          publish_date: note.publish_date, // shown in table
          remark_subject: note.subjectname || " ", // subject name
          description: note.description || " ", // shown in description column
          publish: note.publish, // used for buttons
          read_status: note.read_status || 0, // in case you show reader status
          failed_sms_count: note.failed_sms_count || 0, // for send status
          academic_yr: note.academic_yr || " ",
          class_id: note.class_id || " ",
          section_id: note.section_id || " ",
          subject_id: note.subject_id || " ",
          teacher_id: note.teacher_id || " ",
        }));

        setNotices(updatedNotices);
        setPageCount(Math.ceil(updatedNotices.length / pageSize));
      } else {
        setNotices([]);
        toast.error("No daily notes found.");
      }
    } catch (error) {
      console.error("Error fetching remarks:", error);
      toast.error("Error fetching daily notes. Please try again.");
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    if (tab === "Manage") {
      handleSearch(); // Call handleSearch only when "Manage" tab is selected
    }
    setActiveTab(tab); // Update active tab state
  };

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
    // Handle page change logic
  };

  // const handleView = async (subject) => {
  //   setRemarkData({
  //     t_remark_id: subject.notes_id,
  //     name: `${subject.name}`,
  //     date: subject.date ? subject.date.split("-").reverse().join("-") : "",
  //     publish_date: subject.publish_date
  //       ? subject.publish_date.split("-").reverse().join("-")
  //       : "",
  //     remark_subject: subject.remark_subject || "-",
  //     description: subject.description || "-",
  //     publish: subject.publish,
  //     academic_yr: subject.academic_yr || "",
  //     class_id: subject.class_id || "",
  //     section_id: subject.section_id || "",
  //     subject_id: subject.subject_id || "",
  //     teacher_id: subject.teacher_id || "",
  //   });

  //   setOpen(true);

  //   try {
  //     const token = localStorage.getItem("authToken");
  //     const formData = new FormData();
  //     formData.append("dailynote_date", subject.date);
  //     formData.append("note_id", subject.t_remark_id);

  //     const response = await axios.post(
  //       `${API_URL}/api/get_images_daily_notes`,
  //       formData,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     if (response.data?.status) {
  //       const { url, images } = response.data;
  //       const imageList = images.map((img) => `${url}/${img.image_name}`);
  //       setImageUrls(imageList); // ✅ store in state
  //     } else {
  //       setImageUrls([]);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching attachments:", error);
  //     setImageUrls([]);
  //   }
  // };
  const handleView = async (subject) => {
    setIsImageLoading(true);
    setImageUrls([]); // clear old images

    // set your remarkData (same as before)
    setRemarkData({
      t_remark_id: subject.notes_id,
      name: `${subject.name}`,
      date: subject.date ? subject.date.split("-").reverse().join("-") : "",
      publish_date: subject.publish_date
        ? subject.publish_date.split("-").reverse().join("-")
        : "",
      remark_subject: subject.remark_subject || "-",
      description: subject.description || "-",
      publish: subject.publish,
      academic_yr: subject.academic_yr || "",
      class_id: subject.class_id || "",
      section_id: subject.section_id || "",
      subject_id: subject.subject_id || "",
      teacher_id: subject.teacher_id || "",
    });

    setOpen(true);

    try {
      const token = localStorage.getItem("authToken");
      const formData = new FormData();
      formData.append("dailynote_date", subject?.date);
      formData.append("note_id", subject?.t_remark_id);

      const response = await axios.post(
        `${API_URL}/api/get_images_daily_notes`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data?.status && response.data.images?.length > 0) {
        const baseUrl = response.data.url;
        const urls = response.data.images.map(
          (img) => `${baseUrl}/${img.image_name}`
        );
        setImageUrls(urls);
      } else {
        setImageUrls([]);
      }
    } catch (err) {
      console.error("Error fetching images:", err);
      setImageUrls([]);
    } finally {
      setIsImageLoading(false);
    }
  };

  // Function to download files
  {
    imageUrls && imageUrls.length > 0 && (
      <div className="relative mb-3 flex flex-col mx-4 gap-y-2">
        <label className="mb-2 font-bold">Attachments:</label>
        {imageUrls.map((url, index) => {
          // Extract file name from the URL
          const fileName = url.substring(url.lastIndexOf("/") + 1);
          return (
            <div
              key={index}
              className="flex flex-row text-[.6em] items-center gap-x-2"
            >
              {/* Display file name */}
              <span>{fileName}</span>
              <button
                className="text-blue-600 hover:text-blue-800 hover:bg-transparent"
                onClick={
                  () => downloadFile(url, fileName) // Pass both URL and fileName
                }
              >
                <ImDownload />
              </button>
            </div>
          );
        })}
      </div>
    );
  }

  const downloadFile = (fileUrl, fileName) => {
    const baseUrl = "https://sms.evolvu.in/"; // Base URL
    const fullUrl = `${fileUrl}`; // Construct the full file URL

    // Create an anchor element
    const link = document.createElement("a");
    link.href = fullUrl; // Set the file URL
    link.target = "none"; // Open in a new tab (optional)
    link.download = fileName || "downloaded_file.pdf"; // Use the provided file name or a default name
    document.body.appendChild(link); // Append the link to the DOM

    // Trigger the click to download the file
    link.click();

    // Clean up the DOM
    document.body.removeChild(link); // Remove the link after the click
  };

  const handleDelete = (notesId) => {
    console.log("delete-->", notesId, notices);
    const classToDelete = notices.find((cls) => cls.t_remark_id === notesId);
    console.log("classToDelete---->", classToDelete);

    setCurrentSection(classToDelete); // no need to wrap in {}
    setCurrestSubjectNameForDelete(
      `${classToDelete?.name || ""}` || "this note"
    );
    setShowDeleteModal(true);
  };

  const [preselectedFiles, setPreselectedFiles] = useState([]); // Files fetched from API

  const handleEdit = (section) => {
    navigate(`/EditTeacherNotes/edit/${section.t_remark_id}`, {
      state: section,
    });
  };

  const handleSubmitEdit = async () => {
    if (isSubmitting) return; // Prevent re-submitting
    setIsSubmitting(true);
    let hasError = false;

    if (!subject.trim()) {
      setSubjectError("Subject is required.");
      hasError = true;
    } else {
      setSubjectError("");
    }

    if (!noticeDesc.trim()) {
      setNoticeDescError("Notice description is required.");
      hasError = true;
    } else {
      setNoticeDescError("");
    }
    if (hasError) {
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Authentication token is missing");

      const formData = new FormData();
      formData.append("subject", subject);
      formData.append("notice_desc", noticeDesc);
      // if (uploadedFiles) {
      //   uploadedFiles.forEach((file) => formData.append("userfile[]", file));
      // } else {
      //   preselectedFiles.forEach((fileUrl) =>
      //     formData.append("userfile[]", fileUrl)
      //   );
      // }
      // Append newly uploaded files
      uploadedFiles.forEach((file) => formData.append("userfile[]", file));
      console.log("filenottobedeleted[]", preselectedFiles);
      // Append preselected files (assuming preselectedFiles contains their URLs or identifiers)
      // preselectedFiles.forEach((fileUrl) =>
      //   formData.append("filenottobedeleted[]", fileUrl)
      // );
      // Append preselected files (extracting only the filename)
      preselectedFiles.forEach((fileUrl) => {
        const fileName = fileUrl.split("/").pop(); // Extracts only the file name
        formData.append("filenottobedeleted[]", fileName);
      });

      console.log("Formatted data of the edit SMS part", formData);
      console.log("Selected files", uploadedFiles);

      console.log("formated data of the edit sms part", formData);
      console.log("seletd files", uploadedFiles);
      await axios.post(
        `${API_URL}/api/update_smsnotice/${currentSection?.unq_id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      toast.success("Notice updated successfully!");
      handleSearch();
      handleCloseModal();
    } catch (error) {
      toast.error("Error updating notice. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false); // Re-enable the button after the operation
    }
  };
  const handlePublish = (section) => {
    setCurrentSection(section);
    setShowPublishModal(true);
  };

  const handleSubmitPublish = async () => {
    if (!currentSection?.t_remark_id) {
      toast.error("Invalid note data.");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");

      const formData = new FormData();
      const str_array_value = JSON.stringify([
        `${currentSection.class_id}^${currentSection.section_id}`,
      ]);

      formData.append("str_array", str_array_value);
      formData.append("login_type", roleId); // or "T"
      formData.append("subject_id", currentSection.subject_id || "");
      formData.append("teacher_id", currentSection.teacher_id || "");
      formData.append("description", currentSection.description || "");
      formData.append("dailynote_date", currentSection.date || "");
      formData.append("academic_yr", currentSection.academic_yr || "");
      formData.append("datafile", "");
      formData.append("random_no", "");
      formData.append("filename", "");
      formData.append("operation", "publish"); // << changed here
      formData.append("notes_id", currentSection.t_remark_id);
      formData.append("section_id", currentSection.section_id);
      formData.append("class_id", currentSection.class_id);
      formData.append("deleteimagelist", ""); // or empty

      const response = await axios.post(
        `${API_URL}/api/daily_notes`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data?.status) {
        toast.success(
          `Teacher's note for "${
            currentSection.name || "this note"
          }" published successfully!`
        );

        setShowPublishModal(false);
        handleSearch();
      } else {
        toast.error(response.data?.message || "Failed to publish note.");
      }
    } catch (error) {
      toast.error(
        `Error publishing ${currentSection.name || "note"}: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setIsSubmitting(false);
      setShowPublishModal(false);
    }
  };

  const handleSubmitDelete = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token || !currentSection?.t_remark_id) {
        throw new Error("Invalid note data");
      }

      const formData = new FormData();
      const str_array_value = JSON.stringify([
        `${currentSection.class_id}^${currentSection.section_id}`,
      ]);

      // phir formData mein append karo:
      formData.append("str_array", str_array_value);
      formData.append("login_type", roleId);
      formData.append("subject_id", currentSection.subject_id || "");
      formData.append("teacher_id", currentSection.teacher_id || "");
      formData.append("description", currentSection.description || "");
      formData.append("dailynote_date", currentSection.date || "");
      formData.append("academic_yr", currentSection.academic_yr || "");
      formData.append("datafile", "");
      formData.append("random_no", "");
      formData.append("filename", "");
      formData.append("operation", "delete");
      formData.append("notes_id", currentSection.t_remark_id);
      formData.append("section_id", currentSection.section_id);
      formData.append("class_id", currentSection.class_id);
      formData.append("deleteimagelist", "");

      const response = await axios.post(
        `${API_URL}/api/daily_notes`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data?.status) {
        toast.success(
          `Teacher's note for "${
            currentSection.name || "this note"
          }" deleted successfully!`
        );

        handleSearch();
      } else {
        toast.error(response.data?.message || "Failed to delete note.");
      }
    } catch (error) {
      toast.error(
        `Error deleting ${currestSubjectNameForDelete}: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setIsSubmitting(false);
      setShowDeleteModal(false);
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
        `${API_URL}/api/send_pendingsmsforteacherremark/${uniqueId}`,
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
        handleSearch();
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
  // const handleCloseModal = () => {
  //   setSubject("");
  //   setNoticeDesc("");
  //   setnewclassnames("");
  //   setPreselectedFiles([]);
  //   setUploadedFiles([]);
  //   // removeUploadedFile;
  //   setShowPublishModal(false);
  //   setShowViewModal(false);
  //   setShowEditModal(false);
  //   setShowDeleteModal(false);
  //   setOpen(false);
  // };
  const handleCloseModal = () => {
    setSubject("");
    setNoticeDesc("");
    setnewclassnames("");
    setPreselectedFiles([]);
    setUploadedFiles([]);
    setShowPublishModal(false);
    setShowViewModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setOpen(false);

    // 🧹 clear images and preview
    setImageUrls([]);
    setPreviewImage(null);
    setIsImageLoading(false);
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

  const filteredSections = notices.filter((section) => {
    const searchLower = searchTerm.toLowerCase();

    return (
      section.name?.toLowerCase().includes(searchLower) ||
      section.remark_subject?.toLowerCase().includes(searchLower) ||
      section.description?.toLowerCase().includes(searchLower) ||
      section.publish_date?.toLowerCase().includes(searchLower)
    );
  });

  const displayedSections = filteredSections.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFileUpload = (e) => {
    const newFiles = Array.from(e.target.files);
    setUploadedFiles([...uploadedFiles, ...newFiles]);
  };
  console.log("handleFileUpload", handleFileUpload);

  const removePreselectedFile = (index) => {
    const updatedFiles = preselectedFiles.filter((_, i) => i !== index);
    setPreselectedFiles(updatedFiles);
  };

  const removeUploadedFile = (index) => {
    const updatedFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(updatedFiles);
  };

  // This is tab
  const tabs = [
    { id: "Manage", label: "Manage" },
    { id: "CreateTeachersnote", label: "Create Teacher's Note" },
  ];

  return (
    <>
      {/* <ToastContainer /> */}
      <div className="md:mx-auto md:w-3/4 p-4 bg-white mt-4 ">
        <div className=" card-header  flex justify-between items-center  ">
          <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
            Teacher's Note{" "}
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
        {/* <hr className="relative -top-3" /> */}

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

              <div className="container mt-4">
                <div className="card mx-auto lg:w-full shadow-lg">
                  <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                    <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
                      Manage Teacher's Note
                    </h3>
                    <div className="w-1/2 md:w-fit mr-1 ">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search "
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div
                    className=" relative w-[97%]   mb-3 h-1  mx-auto bg-red-700"
                    style={{
                      backgroundColor: "#C03078",
                    }}
                  ></div>

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
                              Create Date
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Publish Date
                            </th>{" "}
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Subject
                            </th>{" "}
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Description{" "}
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Edit/View
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Delete
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Publish
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Viewed By
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
                              <tr key={subject.notice_id} className="text-sm ">
                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {currentPage * pageSize + index + 1}
                                </td>
                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {subject?.name}
                                </td>
                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {subject?.date &&
                                  subject.date !== "0000-00-00"
                                    ? subject.date
                                        .split("-")
                                        .reverse()
                                        .join("-") // → 29-10-2025
                                    : ""}
                                </td>

                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {subject?.publish_date &&
                                  subject.publish_date !== "0000-00-00"
                                    ? subject.publish_date
                                        .split("-")
                                        .reverse()
                                        .join("-") // 👉 "2025-10-29" → "29/10/2025"
                                    : ""}
                                </td>

                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {subject?.remark_subject}
                                </td>
                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {subject?.description}
                                </td>
                                <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                                  {subject.publish === "Y" ? (
                                    <button
                                      className="text-blue-600 hover:text-blue-800 hover:bg-transparent"
                                      onClick={() => handleView(subject)}
                                    >
                                      <MdOutlineRemoveRedEye className="font-bold text-xl" />
                                    </button>
                                  ) : (
                                    <button
                                      className="text-blue-600 hover:text-blue-800 hover:bg-transparent"
                                      onClick={() => handleEdit(subject)}
                                    >
                                      <FontAwesomeIcon icon={faEdit} />
                                    </button>
                                  )}
                                </td>
                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {subject.publish === "N" ? (
                                    <button
                                      onClick={() =>
                                        handleDelete(subject?.t_remark_id)
                                      }
                                      className="text-red-600 hover:text-red-800 hover:bg-transparent"
                                    >
                                      <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                  ) : (
                                    " "
                                  )}
                                </td>

                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {subject.publish === "N" ? (
                                    // Not published yet — show publish button
                                    <button
                                      onClick={() => handlePublish(subject)}
                                      className="text-green-600 hover:text-green-800 font-bold transition-colors duration-200 hover:bg-transparent"
                                      title="Publish"
                                    >
                                      <FaCheck className="text-lg md:text-xl" />
                                    </button>
                                  ) : null}
                                </td>

                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {subject.publish === "Y" && (
                                    <FontAwesomeIcon
                                      icon={faBookReader}
                                      style={{ color: "#C03078" }}
                                      className="text-base"
                                    />
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan="11"
                                className="text-center py-6 text-red-700 text-lg"
                              >
                                Oops! No data found..
                              </td>
                            </tr>
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

          {/* Other tabs content */}

          {activeTab === "CreateTeachersnote" && (
            <div>
              <CreateTeacherNotes />
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal show" style={{ display: "block" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="flex justify-between p-3">
                  <h5 className="modal-title">Edit Notice/SMS</h5>
                  <RxCross1
                    className="float-end relative mt-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                    type="button"
                    onClick={handleCloseModal}
                  />
                </div>
                <div
                  className="relative mb-3 h-1 w-[97%] mx-auto bg-red-700"
                  style={{ backgroundColor: "#C03078" }}
                ></div>
                <div className="modal-body">
                  <div className="relative mb-3 flex justify-center mx-4 gap-x-7">
                    <label htmlFor="className" className="w-1/2 mt-2">
                      Class:
                    </label>
                    <div
                      className="input-field block border w-full border-1 border-gray-900 rounded-md py-1 px-3 bg-gray-200 shadow-inner break-words"
                      style={{
                        maxWidth: "262px", // Set maximum width for text wrapping
                        height: "auto", // Allow height to grow dynamically
                        wordWrap: "break-word", // Ensure text wraps within the box
                      }}
                    >
                      {newclassnames}
                    </div>
                  </div>

                  <div className="relative mb-3 flex justify-center mx-4 gap-x-7">
                    <label htmlFor="subject" className="w-1/2 mt-2">
                      Subject:
                    </label>
                    <input
                      id="subject"
                      type="text"
                      maxLength={100}
                      className="form-control shadow-md mb-2 w-full"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                    {subjectError && (
                      <p className="text-red-500 text-sm h-3">{subjectError}</p>
                    )}
                  </div>

                  <div className="relative mb-3 flex justify-center mx-4 gap-x-7">
                    <label htmlFor="noticeDesc" className="w-1/2 mt-2">
                      Description:
                    </label>
                    <textarea
                      id="noticeDesc"
                      rows="2"
                      maxLength={1000}
                      className="form-control shadow-md mb-2 w-full"
                      value={noticeDesc}
                      onChange={(e) => setNoticeDesc(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault(); // Prevent the default behavior of Enter key
                          const cursorPos = e.target.selectionStart; // Current cursor position
                          const textBeforeCursor = noticeDesc.slice(
                            0,
                            cursorPos
                          ); // Text before the cursor is:

                          const textAfterCursor = noticeDesc.slice(cursorPos); // Text after the cursor
                          const updatedText = `${textBeforeCursor}\n• ${textAfterCursor}`;
                          setNoticeDesc(updatedText);
                          // Move the cursor to the position after the bullet point
                          setTimeout(() => {
                            e.target.selectionStart = e.target.selectionEnd =
                              cursorPos + 3;
                          }, 0);
                        }
                      }}
                    ></textarea>
                    {noticeDescError && (
                      <p className="h-3 relative -top-3 text-red-500 text-sm mt-2">
                        {noticeDescError}
                      </p>
                    )}
                  </div>

                  {currentSection?.notice_type === "Notice" && (
                    <>
                      {/* File Upload */}
                      <div className="modal-body">
                        {/* Attachments */}

                        <div className="  relative -top-5 w-full  flex flex-row justify-between gap-x-2 ">
                          <label className="px-2 mt-2 lg:px-3 py-2 ">
                            Upload Files
                          </label>
                          <input
                            className="mt-3 relative right-0 md:right-[11%] text-xs bg-gray-50 "
                            type="file"
                            multiple
                            onChange={handleFileUpload}
                          />
                        </div>
                        <label className="px-2 block  mb-2">Attachment:</label>
                        <div className="">
                          {uploadedFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-x-2"
                            >
                              <span className="bg-gray-100 border-1 text-[.8em] p-0.5 shadow-sm">
                                {file.name}
                              </span>
                              <div>
                                <RxCross1
                                  className="text-xl relative  w-4 h-4 text-red-600 hover:cursor-pointer hover:bg-red-100"
                                  type="button"
                                  onClick={() => removeUploadedFile(index)}
                                />
                              </div>
                            </div>
                          ))}

                          <div>
                            {preselectedFiles.map((url, index) => {
                              const fileName = url.substring(
                                url.lastIndexOf("/") + 1
                              );
                              return (
                                <div
                                  key={index}
                                  className="flex items-center gap-x-2"
                                >
                                  <span className="bg-gray-100 border-1 p-0.5 text-[.8em] shadow-sm">
                                    {fileName}
                                  </span>
                                  <RxCross1
                                    className=" text-xl relative - w-4 h-4 text-red-600 hover:cursor-pointer hover:bg-red-100"
                                    type="button"
                                    onClick={() => removePreselectedFile(index)}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Uploaded Files */}
                    </>
                  )}
                </div>

                <div className="flex justify-end p-3">
                  <button
                    type="button"
                    className="btn btn-primary px-3 mb-2"
                    onClick={handleSubmitEdit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Updating..." : "Update"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    "the currecnt section inside delete of the managesubjhect",
                    currentSection
                  )}
                </div>
                <div
                  className=" relative  mb-3 h-1 w-[97%] mx-auto bg-red-700"
                  style={{
                    backgroundColor: "#C03078",
                  }}
                ></div>
                <div className="modal-body">
                  Are you sure you want to delete this teacher's note for{" "}
                  {currestSubjectNameForDelete}?
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
                    currentSection
                  )}
                </div>
                <div
                  className=" relative  mb-3 h-1 w-[97%] mx-auto bg-red-700"
                  style={{
                    backgroundColor: "#C03078",
                  }}
                ></div>
                <div className="modal-body">
                  Are you sure you want to publish this teacher's note for{" "}
                  {` ${currentSection?.name} `} ?
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

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="flex justify-between p-3">
                  <h5 className="modal-title">View Teacher's Note</h5>
                  <RxCross1
                    className="float-end relative mt-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                    onClick={() => setOpen(false)}
                  />
                </div>

                <div
                  className="relative mb-3 h-1 w-[97%] mx-auto"
                  style={{ backgroundColor: "#C03078" }}
                ></div>

                <div className="px-4 mb-3 space-y-4">
                  {/* Teacher Name */}
                  <div className="flex items-center">
                    <label className="w-[30%] text-gray-700 font-medium">
                      Class Name:
                    </label>
                    <input
                      type="text"
                      value={remarkData.name}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-700"
                    />
                  </div>

                  {/* Remark Subject */}
                  <div className="flex items-center">
                    <label className="w-[30%] text-gray-700 font-medium">
                      Subject:
                    </label>
                    <input
                      type="text"
                      value={remarkData.remark_subject}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-700"
                    />
                  </div>
                  {/* Create data */}
                  <div className="flex items-center">
                    <label className="w-[30%] text-gray-700 font-medium">
                      Create Date:
                    </label>
                    <input
                      type="text"
                      value={remarkData.date}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-700"
                    />
                  </div>
                  {/* Published Date: */}
                  <div className="flex items-center">
                    <label className="w-[30%] text-gray-700 font-medium">
                      Published Date::
                    </label>
                    <input
                      type="text"
                      value={remarkData?.publish_date}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-700"
                    />
                  </div>
                  {/* Remark Description */}
                  <div className="flex items-start">
                    <label className="w-[30%] text-gray-700 font-medium pt-2">
                      Description:
                    </label>
                    <textarea
                      value={remarkData?.description}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-700"
                      rows={4}
                    />
                  </div>
                  {/* Attachments Section */}
                  {isImageLoading ? (
                    <div className="flex justify-center items-center py-4">
                      <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm ml-2 text-gray-600">
                        Loading attachments...
                      </span>
                    </div>
                  ) : imageUrls.length > 0 ? (
                    <div className="w-full flex flex-row">
                      <label className="mb-2">Attachments:</label>

                      <div className="relative mt-2 left-4 flex flex-col mx-4 gap-y-2">
                        {imageUrls.map((url, index) => {
                          const fileName = url.substring(
                            url.lastIndexOf("/") + 1
                          );
                          const isImage = /\.(jpg|jpeg|png|gif)$/i.test(
                            fileName
                          );

                          return (
                            <div
                              key={index}
                              className="font-semibold flex flex-row text-[.58em] items-center gap-x-2"
                            >
                              <span>{fileName}</span>

                              {isImage ? (
                                <button
                                  className="text-blue-600 hover:text-blue-800 hover:bg-transparent"
                                  onClick={() => setPreviewImage(url)}
                                >
                                  <FaEye className="font-2xl w-3 h-3" />
                                </button>
                              ) : (
                                <button
                                  className="text-green-600 hover:text-green-800 hover:bg-transparent"
                                  onClick={() => downloadFile(url, fileName)}
                                >
                                  <ImDownload className="font-2xl w-3 h-3" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 ml-4">
                      No attachments available
                    </p>
                  )}

                  {previewImage && (
                    <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-50">
                      <div className="bg-white border border-gray-300 shadow-2xl rounded-lg p-3 w-[260px] flex flex-col items-center animate-fadeIn">
                        {/* 🖼 Image */}
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="rounded-md w-[240px] h-[180px] object-contain mb-3 border border-gray-200"
                        />

                        {/* ✨ Subtle divider */}
                        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-3" />

                        {/* 🔘 Close Button */}
                        <button
                          onClick={() => setPreviewImage(null)}
                          className="px-4 py-1 bg-gradient-to-r from-pink-500 to-red-600 text-white text-sm rounded-md shadow hover:scale-105 transition-transform duration-200"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end p-3">
                  <button
                    type="button"
                    className="btn btn-danger px-3 mb-2"
                    onClick={() => setOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {imageModalOpen && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-50">
          <div className="relative bg-white border border-gray-300 shadow-lg rounded-md p-2 w-[140px]">
            {/* ❌ Close button */}
            <button
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
              onClick={() => setImageModalOpen(false)}
            >
              ✕
            </button>

            {/* 🖼 Image */}
            <img
              src={selectedImageUrl}
              alt="Attachment Preview"
              className="rounded object-contain w-[120px] h-[180px]"
            />
          </div>
        </div>
      )}
    </>
  );
}

export default TeacherNotes;
