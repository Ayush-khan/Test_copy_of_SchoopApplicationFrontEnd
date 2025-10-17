import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  faEdit,
  faTrash,
  faThumbsUp,
  faBookReader,
  faDownload,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import { RxCross1 } from "react-icons/rx";
import CreateRemarkObservation from "./CreateRemarkObservation";
import CreateRemarkObservationStudent from "./CreateRemarkObservationStudent";
// import { PiCertificateBold } from "react-icons/pi";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { FaCheck, FaCheckCircle } from "react-icons/fa";
import { ImDownload } from "react-icons/im";
import { Navigate, useNavigate } from "react-router-dom";
import { IoMdSend } from "react-icons/io";

function RemarkObservationStudent() {
  const API_URL = import.meta.env.VITE_API_URL; // URL for host
  // const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Manage");
  // for allot subject tab
  const [showViewModal, setShowViewModal] = useState(false);
  const [showPublish, setShowPublishModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hiddenAttachments, setHiddenAttachments] = useState([]);
  const [openedAttachments, setOpenedAttachments] = useState([]);
  const [sendingSMS, setSendingSMS] = useState({});

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
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const openModal = (file) => {
    setSelectedFile(file);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedFile(null);
  };

  const [notices, setNotices] = useState([]); // To store fetched notices
  const [subject, setSubject] = useState("");
  const [noticeDesc, setNoticeDesc] = useState("");
  const [subjectError, setSubjectError] = useState("");
  const [noticeDescError, setNoticeDescError] = useState("");
  // const [showViewModal, setShowViewModal] = useState(false);
  const [remarkData, setRemarkData] = useState({
    teacherName: "",
    remarkSubject: "",
    remarkDescription: "",
    studentName: "",
    classDivision: "",
    attachments: [],
  });

  // for react-search of manage tab teacher Edit and select class
  const pageSize = 10;

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSearchTerm("");
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      const params = {};

      const response = await axios.get(
        `${API_URL}/api/get_remarklistforstudents`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      const remarkList = response?.data?.data || [];

      if (remarkList.length > 0) {
        const updatedNotices = remarkList.map((notice) => ({
          ...notice,
          showSendButton: notice.publish === "Y",
        }));

        console.log("remark list", updatedNotices);

        setNotices(updatedNotices);
        setPageCount(Math.ceil(updatedNotices.length / pageSize));
      } else {
        setNotices([]);
        toast.error("No remarks found.");
      }
    } catch (error) {
      console.error("Error fetching remarks:", error);
      toast.error("Error fetching remarks. Please try again.");
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    if (tab === "Manage") {
      handleSearch();
    }
    setActiveTab(tab);
  };

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
    // Handle page change logic
  };

  const handleView = (subject) => {
    setRemarkData({
      teacherName: subject.name || "",
      remarkSubject: subject.remark_subject || "",
      remarkDescription: subject.remark_desc || "",
      studentName: [subject.first_name, subject.mid_name, subject.last_name]
        .filter(Boolean) // removes null, undefined, ""
        .map(
          (name) => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
        ) // optional: capitalize
        .join(" "),
      classDivision: `${subject?.classname || ""} - ${
        subject?.sectionname || ""
      }`,
      attachments: subject.files || [],
    });
    setShowViewModal(true);
  };

  // Function to download files
  // {
  //   imageUrls && imageUrls.length > 0 && (
  //     <div className="relative mb-3 flex flex-col mx-4 gap-y-2">
  //       <label className="mb-2 font-bold">Attachments:</label>
  //       {imageUrls.map((url, index) => {
  //         // Extract file name from the URL
  //         const fileName = url.substring(url.lastIndexOf("/") + 1);
  //         return (
  //           <div
  //             key={index}
  //             className="flex flex-row text-[.6em] items-center gap-x-2"
  //           >
  //             {/* Display file name */}
  //             <span>{fileName}</span>
  //             <button
  //               className="text-blue-600 hover:text-blue-800 hover:bg-transparent"
  //               onClick={
  //                 () => downloadFile(url, fileName) // Pass both URL and fileName
  //               }
  //             >
  //               <ImDownload />
  //             </button>
  //           </div>
  //         );
  //       })}
  //     </div>
  //   );
  // }

  // const downloadFile = (fileUrl, fileName) => {
  //   const baseUrl = "https://sms.evolvu.in/"; // Base URL
  //   const fullUrl = `${fileUrl}`; // Construct the full file URL

  //   // Create an anchor element
  //   const link = document.createElement("a");
  //   link.href = fullUrl; // Set the file URL
  //   link.target = "none"; // Open in a new tab (optional)
  //   link.download = fileName || "downloaded_file.pdf"; // Use the provided file name or a default name
  //   document.body.appendChild(link); // Append the link to the DOM

  //   // Trigger the click to download the file
  //   link.click();

  //   // Clean up the DOM
  //   document.body.removeChild(link); // Remove the link after the click
  // };

  const handleDelete = (sectionId) => {
    const classToDelete = notices.find((cls) => cls.remark_id === sectionId);
    console.log("classToDelete", classToDelete);

    setCurrentSection({ classToDelete }); // set state for modal

    // Set teacher name immediately from classToDelete
    setCurrestSubjectNameForDelete(
      `${classToDelete?.first_name || ""} ${classToDelete?.mid_name || ""} ${
        classToDelete?.last_name || ""
      }`.trim()
    );
    setShowDeleteModal(true);
  };

  const [preselectedFiles, setPreselectedFiles] = useState([]); // Files fetched from API

  const handleEdit = (section) => {
    navigate(`/remObsStudent/edit/${section.remark_id}`, {
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
    // console.log("the currecne t section", currentSection);

    console.log("fdsfsdsd handleEdit", section);

    // It's used for the dropdown of the tachers
    setShowPublishModal(true);
  };

  const handleSubmitPublish = async () => {
    if (!currentSection?.remark_id) {
      toast.error("Invalid remark ID.");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.put(
        `${API_URL}/api/update_publishremarkforstudent/${currentSection.remark_id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Remark published successfully!");
        setShowPublishModal(false);
        handleSearch();
      } else {
        toast.error("Failed to publish remark.");
      }
    } catch (error) {
      console.error("Error publishing remark:", error);
      toast.error("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitDelete = async () => {
    if (isSubmitting) return; // Prevent re-submitting
    setIsSubmitting(true);
    // Handle delete submission logic
    try {
      const token = localStorage.getItem("authToken");
      if (
        !token ||
        !currentSection ||
        !currentSection?.classToDelete?.remark_id
      ) {
        throw new Error("Remark Id is missing");
      }

      await axios.delete(
        `${API_URL}/api/delete_remarkforstudent/${currentSection?.classToDelete?.remark_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      handleSearch();
      setShowDeleteModal(false);

      toast.success(
        `${currestSubjectNameForDelete} Remark Deleted successfully!`
      );
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(
          `Error In Deleting ${currestSubjectNameForDelete}: ${error.response.data.message}`
        );
      } else {
        toast.error(
          `Error In Deleting ${currestSubjectNameForDelete}: ${error.message}`
        );
      }
      console.error("Error In Deleting:", error);
    } finally {
      setIsSubmitting(false); // Re-enable the button after the operation
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
        `${API_URL}/api/send_pendingsmsforstudentremark/${uniqueId}`,
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
  const handleCloseModal = () => {
    setSubject("");
    setNoticeDesc("");
    setnewclassnames("");
    setPreselectedFiles([]);
    setUploadedFiles([]);
    // removeUploadedFile;
    setShowPublishModal(false);
    setShowViewModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowViewModal(false);
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

  const searchLower = searchTerm.toLowerCase().trim();

  const filteredSections = notices.filter((section) => {
    const remarkType = section?.remark_type?.toLowerCase() || "";
    const noticeDesc = section?.remark_subject?.toLowerCase() || "";
    const fullName = `${section?.first_name || ""} ${section?.mid_name || ""} ${
      section?.last_name || ""
    }`
      .toLowerCase()
      .trim();
    const publishDate = section?.publish_date?.toLowerCase().trim() || "";
    const subjectName = section?.subjectname?.toLowerCase() || "";

    return (
      remarkType.includes(searchLower) ||
      subjectName.includes(searchLower) ||
      noticeDesc.includes(searchLower) ||
      fullName.includes(searchLower) ||
      publishDate.includes(searchLower)
    );
  });

  const displayedSections = filteredSections.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  console.log("disply section", displayedSections);

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

  const handleDownload = async (fileUrl, fileName) => {
    try {
      const response = await fetch(fileUrl, {
        mode: "cors",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || "attachment";
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  // This is tab
  const tabs = [
    { id: "Manage", label: "Manage" },
    { id: "CreateRemarkObservation", label: "Create" },
    { id: "CreateRemarkObservationStudent", label: "Create for Student" },
  ];

  return (
    <>
      {/* <ToastContainer /> */}
      <div className="md:mx-auto md:w-[85%] p-4 bg-white mt-4 ">
        <div className=" card-header  flex justify-between items-center  ">
          <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
            Remark & Observation
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
                      Manage Remark & Observation
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
                              Student Name
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Type
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Publish Date
                            </th>{" "}
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Subject
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Subject of Remark
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
                              Acknowledge
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Viewed
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
                                  {`${subject?.first_name || ""} ${
                                    subject?.mid_name || ""
                                  } ${subject?.last_name || ""}`
                                    .split(" ")
                                    .map((word) =>
                                      word
                                        ? word.charAt(0).toUpperCase() +
                                          word.slice(1).toLowerCase()
                                        : ""
                                    )
                                    .join(" ")
                                    .trim()}{" "}
                                  {`(${subject?.classname} - ${subject?.sectionname})`}
                                </td>

                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {subject?.remark_type}
                                </td>
                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {subject?.publish_date &&
                                  subject.publish_date !== "0000-00-00"
                                    ? new Date(
                                        subject.publish_date
                                      ).toLocaleDateString("en-GB")
                                    : ""}
                                </td>
                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {subject?.subjectname}
                                </td>
                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {subject?.remark_subject}
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
                                        handleDelete(subject?.remark_id)
                                      }
                                      className="text-red-600 hover:text-red-800 hover:bg-transparent"
                                    >
                                      <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                  ) : (
                                    ""
                                  )}
                                </td>

                                {/* <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {subject.publish === "Y" &&
                                  subject?.failed_sms_count > 0 ? (
                                    <div className="flex flex-col gap-y-0.5 items-center">
                                      <span className="text-red-600 font-bold text-sm">
                                        {subject?.failed_sms_count}
                                      </span>
                                      <span className="text-blue-600 text-sm font-medium whitespace-nowrap">
                                        Messages Pending
                                      </span>

                                      <button
                                        disabled={sendingSMS[subject?.unq_id]}
                                        className={`flex flex-row items-center justify-center mt-1 px-3 py-1 gap-x-1 text-xs md:text-sm font-medium rounded-md ${
                                          sendingSMS[subject?.unq_id]
                                            ? "bg-blue-300 cursor-not-allowed"
                                            : "bg-blue-500 hover:bg-blue-600 text-white"
                                        }`}
                                        onClick={() =>
                                          handleSend(subject?.remark_id)
                                        }
                                      >
                                        {sendingSMS[subject?.unq_id] ? (
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
                                  ) : subject.remark_type === "Remark" &&
                                    subject.publish === "N" ? (
                                    <button
                                      onClick={() => handlePublish(subject)}
                                      // className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-xs md:text-sm font-medium"
                                      className={`  font-bold hover:bg-none text-green-600 hover:text-green-800 hover:bg-transparent
                                      }`}
                                    >
                                      <FaCheck className="text-lg md:text-xl" />
                                    </button>
                                  ) : null}
                                </td> */}
                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {/* Show Send button if published and failed_sms_count > 0 */}
                                  {subject.remark_type === "Remark" &&
                                  subject.publish === "Y" &&
                                  subject.failed_sms_count > 0 ? (
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-red-600 font-semibold text-sm">
                                        {subject.failed_sms_count}
                                      </span>
                                      <span className="text-blue-600 text-xs font-medium whitespace-nowrap">
                                        Messages Pending
                                      </span>

                                      <button
                                        disabled={
                                          sendingSMS[subject?.remark_id]
                                        }
                                        className={`flex items-center justify-center px-3 py-1 gap-1 text-xs md:text-sm font-medium rounded-md transition duration-200 ${
                                          sendingSMS[subject?.remark_id]
                                            ? "bg-blue-300 cursor-not-allowed"
                                            : "bg-blue-500 hover:bg-blue-600 text-white"
                                        }`}
                                        onClick={() =>
                                          handleSend(subject?.remark_id)
                                        }
                                      >
                                        {sendingSMS[subject?.remark_id] ? (
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
                                  ) : subject.remark_type === "Remark" &&
                                    subject.publish === "Y" &&
                                    subject.failed_sms_count === 0 ? (
                                    // Show "✔ Sent" when publish=Y and no failed SMS
                                    <div className="flex flex-col items-center">
                                      <div className="group relative flex items-center justify-center gap-1 text-green-600 font-semibold text-sm cursor-default">
                                        Sent{" "}
                                        <FaCheck className="text-green-600" />
                                        {/* Tooltip */}
                                      </div>
                                    </div>
                                  ) : subject.remark_type === "Remark" &&
                                    subject.publish === "N" ? (
                                    // Show Publish button
                                    <button
                                      onClick={() => handlePublish(subject)}
                                      className="text-green-600 hover:text-green-800 transition-colors"
                                      title="Publish"
                                    >
                                      <FaCheck className="text-lg md:text-xl" />
                                    </button>
                                  ) : null}
                                </td>

                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {subject.acknowledge == "Y" && (
                                    <FontAwesomeIcon
                                      icon={faThumbsUp}
                                      className="text-black text-base"
                                    />
                                  )}
                                </td>
                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {subject.read_status == 1 && (
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

          {activeTab === "CreateRemarkObservation" && (
            <div>{<CreateRemarkObservation />}</div>
          )}
          {activeTab === "CreateRemarkObservationStudent" && (
            <div>
              <CreateRemarkObservationStudent />{" "}
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
                  Are you sure you want to delete remark for{" "}
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
                  Are you sure you want to publish remark for{" "}
                  {` ${currentSection?.first_name} ${currentSection?.mid_name} ${currentSection?.last_name}`}{" "}
                  ?
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

      {showViewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="flex justify-between p-3">
                  <h5 className="modal-title">View Remark</h5>
                  <RxCross1
                    className="float-end relative mt-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                    onClick={() => setShowViewModal(false)}
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
                      Student Name:
                    </label>
                    <input
                      type="text"
                      value={remarkData.studentName}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-700"
                    />
                  </div>

                  {/* Remark Subject */}
                  <div className="flex items-center">
                    <label className="w-[30%] text-gray-700 font-medium">
                      Class/Division:
                    </label>
                    <input
                      type="text"
                      value={remarkData.classDivision}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-700"
                    />
                  </div>

                  {/* Remark Description */}
                  <div className="flex items-start">
                    <label className="w-[30%] text-gray-700 font-medium pt-2">
                      Remark Description:
                    </label>
                    <textarea
                      value={remarkData.remarkDescription}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-700"
                      rows={4}
                    />
                  </div>

                  <div className="flex items-start">
                    <label className="w-[30%] text-gray-700 font-medium pt-2">
                      Attachments:
                    </label>
                    {/* <div className="flex-1 space-y-2">
                      {remarkData.attachments &&
                      remarkData.attachments.length > 0 ? (
                        remarkData.attachments.map((file, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <button
                              onClick={() => openModal(file)}
                              className="text-blue-600 underline text-sm break-all text-left"
                            >
                              {file.image_name}
                            </button>

                            <button
                              onClick={() =>
                                handleDownload(file.file_url, file.image_name)
                              }
                              className="text-green-700 hover:text-blue-600"
                              title="Download"
                              target="_blank"
                            >
                              <FontAwesomeIcon icon={faDownload} size="sm" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">
                          No attachments available.
                        </p>
                      )}
                    </div> */}

                    <div className="flex-1 space-y-2">
                      {remarkData.attachments &&
                      remarkData.attachments.length > 0 ? (
                        remarkData.attachments.map((file, index) => {
                          const fileUrl = file.file_url;
                          const fileName =
                            file.image_name || fileUrl.split("/").pop();

                          // Files that should NOT be previewable (only download)
                          const isNonPreviewable =
                            /\.(pdf|csv|docx?|xlsx?|pptx?|txt|zip|json)$/i.test(
                              fileUrl
                            );

                          return (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              {isNonPreviewable ? (
                                // Show plain text (non-clickable) for non-previewable files
                                <span className="text-sm text-gray-800 break-all">
                                  {fileName}
                                </span>
                              ) : (
                                // Clickable for previewable files (like images)
                                <button
                                  onClick={() => openModal(file)}
                                  className="text-blue-600 underline text-sm break-all text-left"
                                >
                                  {fileName}
                                </button>
                              )}

                              {/* Always show download icon */}
                              <button
                                onClick={() =>
                                  handleDownload(fileUrl, fileName)
                                }
                                className="text-green-700 hover:text-blue-600"
                                title="Download"
                              >
                                <FontAwesomeIcon icon={faDownload} size="sm" />
                              </button>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-sm text-gray-500">
                          No attachments available.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Modal */}
                  {/* {showModal && selectedFile && (
                    <>
                      
                      <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={closeModal}
                      ></div>

                     
                      <div
                        className="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                          bg-white p-4 rounded-lg shadow-lg w-[90%] max-w-md"
                      >
                        
                        <button
                          onClick={closeModal}
                          className="absolute top-2 right-2 text-gray-600 text-xl hover:text-red-600"
                        >
                          &times;
                        </button>

                       
                        <img
                          src={selectedFile.file_url}
                          alt="Attachment"
                          className="max-w-full max-h-[70vh] mx-auto mt-6 rounded-md"
                        />
                      </div>
                    </>
                  )} */}

                  {showModal && selectedFile && (
                    <>
                      {/* Overlay */}
                      <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={closeModal}
                      ></div>

                      {/* Modal box */}
                      <div
                        className="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                        bg-white p-4 rounded-lg shadow-lg w-[90%] max-w-md"
                      >
                        {/* Close button */}
                        <button
                          onClick={closeModal}
                          className="absolute top-2 right-2 text-gray-600 text-xl hover:text-red-600"
                        >
                          &times;
                        </button>

                        {/* File Preview Logic */}
                        <div className="mt-6 text-center">
                          {(() => {
                            const fileUrl = selectedFile.file_url;
                            const fileName =
                              selectedFile.file_name ||
                              fileUrl.split("/").pop();
                            const isImage = /\.(jpe?g|png|gif|bmp|webp)$/i.test(
                              fileUrl
                            );
                            const isPDF = /\.pdf$/i.test(fileUrl);
                            const isDownloadOnly =
                              /\.(csv|docx?|xlsx?|zip|txt|pptx?|json)$/i.test(
                                fileUrl
                              );

                            if (isImage) {
                              return (
                                <img
                                  src={fileUrl}
                                  alt="Attachment"
                                  className="max-w-full max-h-[70vh] mx-auto rounded-md"
                                />
                              );
                            } else if (isPDF) {
                              window.open(fileUrl, "_blank");
                              closeModal();
                              return null;

                              //  else if (isPDF) {
                              //   return (
                              //     <iframe
                              //       src={fileUrl}
                              //       className="w-full h-[70vh] rounded-md"
                              //       title="PDF Preview"
                              //     />
                              //   );
                            } else if (isDownloadOnly) {
                              return (
                                <div className="flex flex-col items-center gap-3">
                                  <div className="text-5xl">📄</div>
                                  <p className="font-semibold">{fileName}</p>
                                  <a
                                    href={fileUrl}
                                    download
                                    target="_blank"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                  >
                                    Download
                                  </a>
                                </div>
                              );
                            } else {
                              return (
                                <div className="flex flex-col items-center gap-3">
                                  <div className="text-5xl">📎</div>
                                  <p className="font-semibold">{fileName}</p>
                                  <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                  >
                                    Open File
                                  </a>
                                </div>
                              );
                            }
                          })()}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex justify-end p-3">
                  <button
                    type="button"
                    className="btn btn-danger px-3 mb-2"
                    onClick={() => setShowViewModal(false)}
                  >
                    Close
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

export default RemarkObservationStudent;
