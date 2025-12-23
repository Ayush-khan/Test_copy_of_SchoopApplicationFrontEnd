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

import CreateHomework from "./CreateHomework";

import { MdOutlineRemoveRedEye } from "react-icons/md";
import { FaCheck } from "react-icons/fa";

import { useNavigate } from "react-router-dom";

function Homework() {
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
  const [roleId, setRoleId] = useState("");
  const [regId, setRegId] = useState("");
  const [academicYr, setAcademicYr] = useState("");
  const pageSize = 10;

  useEffect(() => {
    fetchDataRoleId();
  }, []);

  const fetchDataRoleId = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.error("No authentication token found");
      return;
    }

    try {
      const sessionResponse = await axios.get(`${API_URL}/api/sessionData`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("session", sessionResponse);
      const role_id = sessionResponse.data.user.role_id;
      const reg_id = sessionResponse.data.user.reg_id;
      const academic_yr = sessionResponse.data.custom_claims.academic_year;

      setRoleId(role_id);
      setRegId(reg_id);
      setAcademicYr(academic_yr);

      console.log("roleIDis:", role_id); // use local variable
      console.log("reg id:", reg_id);
      console.log("academmic yr", academic_yr);

      return { roleId, regId };
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

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

      const formData = new FormData();
      formData.append("reg_id", regId);
      formData.append("acd_yr", academicYr);

      const response = await axios.post(
        `${API_URL}/api/get_homework`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const remarkList = response?.data?.homework_details || [];

      if (remarkList.length > 0) {
        console.log("homeworks list", remarkList);
        setNotices(remarkList);
        setPageCount(Math.ceil(remarkList.length / pageSize));
      } else {
        setNotices([]);
        toast.error("No homeworks found.");
      }
    } catch (error) {
      console.error("Error fetching homeworks:", error);
      toast.error("Error fetching homeworks. Please try again.");
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
  };

  // const handleView = (subject) => {
  //   setRemarkData({
  //     teacherName: subject.name || "",
  //     remarkSubject: subject.remark_subject || "",
  //     remarkDescription: subject.remark_desc || "",
  //     studentName: `${subject.first_name || ""} ${subject.mid_name} ${
  //       subject.last_name
  //     }`,
  //     classDivision: `${subject?.classname || ""} - ${
  //       subject?.sectionname || ""
  //     }`,
  //     attachments: subject.files || [],
  //   });
  //   setShowViewModal(true);
  // };

  const handleDelete = (sectionId) => {
    const classToDelete = notices.find((cls) => cls.homework_id === sectionId);
    console.log("classToDelete", classToDelete);

    setCurrentSection({ classToDelete });

    setCurrestSubjectNameForDelete(
      `${classToDelete?.cls_name || ""} ${classToDelete?.sec_name || ""}`.trim()
    );
    setShowDeleteModal(true);
  };

  const [preselectedFiles, setPreselectedFiles] = useState([]);

  const handleEdit = (section) => {
    navigate(`/homework/edit/${section.homework_id}`, {
      state: section,
    });
  };

  const handleViewBy = (section) => {
    navigate(`/homework/viewBy/${section.homework_id}`, {
      state: {
        class_id: section.class_id,
        section_id: section.section_id,
        homework_id: section.homework_id,
        acd_yr: academicYr,
        cls_name: section.cls_name,
        sec_name: section.sec_name,
      },
    });
  };

  const handleView = (section) => {
    navigate(`/homework/view/${section.homework_id}`, {
      state: {
        class_id: section.class_id,
        section_id: section.section_id,
        homework_id: section.homework_id,
        acd_yr: academicYr,
        cls_name: section.cls_name,
        sec_name: section.sec_name,
        start_date: section.start_date,
        description: section.description,
      },
    });
  };

  const handlePublish = (section) => {
    setCurrentSection(section);

    console.log("fdsfsdsd handleEdit", section);
    setShowPublishModal(true);
  };

  const handleSubmitPublish = async () => {
    if (!currentSection?.homework_id) {
      toast.error("Invalid Homework ID.");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");

      const formData = new FormData();
      formData.append("homework_id", currentSection.homework_id);
      formData.append("class_id", currentSection.class_id);
      formData.append("section_id", currentSection.section_id);
      formData.append("operation", "publish");
      formData.append("login_type", "T");

      const response = await axios.post(`${API_URL}/api/homework`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        toast.success("Homework published successfully!");
        setShowPublishModal(false);
        handleSearch(); // Refresh list
      } else {
        toast.error("Failed to publish homework.");
      }
    } catch (error) {
      console.error("Error publishing homework:", error);
      toast.error("Something went wrong while publishing.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitDelete = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");
      const homeworkId = currentSection?.classToDelete?.homework_id;

      if (!token || !homeworkId) {
        throw new Error("Homework ID is missing");
      }

      const formData = new FormData();
      formData.append("homework_id", homeworkId);
      formData.append("operation", "delete");
      formData.append("login_type", "T");

      await axios.post(`${API_URL}/api/homework`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      handleSearch();
      setShowDeleteModal(false);

      toast.success(
        `${currestSubjectNameForDelete} Homework deleted successfully!`
      );
    } catch (error) {
      console.error("Error deleting homework:", error);

      if (error.response?.data) {
        toast.error(
          `Error deleting ${currestSubjectNameForDelete}: ${error.response.data.message}`
        );
      } else {
        toast.error(
          `Error deleting ${currestSubjectNameForDelete}: ${error.message}`
        );
      }
    } finally {
      setIsSubmitting(false);
      setShowDeleteModal(false);
    }
  };

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
    setShowViewModal(false);
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

  const searchLower = searchTerm.toLowerCase().trim();

  const filteredSections = notices.filter((section) => {
    const remarkType = section?.remark_type?.toLowerCase() || "";
    const noticeDesc = section?.remark_subject?.toLowerCase() || "";
    const fullName = `${section?.first_name || ""} ${section?.mid_name || ""} ${section?.last_name || ""
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

  const tabs = [
    { id: "Manage", label: "Manage" },
    { id: "CreateHomework", label: "Create" },
  ];

  return (
    <>
      {/* <ToastContainer /> */}
      <div className="md:mx-auto md:w-[85%] p-4 bg-white mt-4 ">
        <div className=" card-header  flex justify-between items-center  ">
          <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
            Homework
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
              className={`md:-ml-7 shadow-md ${activeTab === id ? "text-blue-500 font-bold" : ""
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
                      Manage Homework List
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
                              Subject
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Assign Date
                            </th>{" "}
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Submission Date
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Publish Date
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
                                  {`${subject?.cls_name}  (${subject?.sec_name})`}
                                </td>

                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {subject?.sub_name}
                                </td>
                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {subject?.start_date &&
                                    subject.start_date !== "0000-00-00"
                                    ? new Date(
                                      subject.start_date
                                    ).toLocaleDateString("en-GB")
                                    : ""}
                                </td>
                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {subject?.end_date &&
                                    subject.end_date !== "0000-00-00"
                                    ? new Date(
                                      subject.end_date
                                    ).toLocaleDateString("en-GB")
                                    : ""}
                                </td>
                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {subject?.publish_date &&
                                    subject.publish_date !== "0000-00-00"
                                    ? new Date(
                                      subject.publish_date
                                    ).toLocaleDateString("en-GB")
                                    : ""}
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
                                        handleDelete(subject?.homework_id)
                                      }
                                      className="text-red-600 hover:text-red-800 hover:bg-transparent"
                                    >
                                      <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                  ) : (
                                    ""
                                  )}
                                </td>
                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {subject.publish === "N" &&
                                    subject.remark_type !== "Observation" ? (
                                    <button
                                      onClick={() => handlePublish(subject)}
                                      className="text-green-500 hover:text-green-700 hover:bg-transparent"
                                    >
                                      <FaCheck className="text-base md:text-base" />
                                    </button>
                                  ) : (
                                    ""
                                  )}
                                </td>

                                {/* <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {subject.publish === "Y" && (
                                    <FontAwesomeIcon
                                      icon={faBookReader}
                                      style={{ color: "#C03078" }}
                                      className="text-base"
                                    />
                                  )}
                                </td> */}
                                <td
                                  className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm cursor-pointer"
                                  onClick={() => handleViewBy(subject)}
                                >
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

          {activeTab === "CreateHomework" && (
            <div>
              <CreateHomework
                handleSearch={handleSearch}
                onSaveSuccess={() => setActiveTab("Manage")}
              />
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
                  Are you sure you want to delete homework for{" "}
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

      {/* Publish Modal */}
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
                </div>
                <div
                  className=" relative  mb-3 h-1 w-[97%] mx-auto bg-red-700"
                  style={{
                    backgroundColor: "#C03078",
                  }}
                ></div>
                <div className="modal-body">
                  Are you sure you want to publish homework for{" "}
                  {` ${currentSection?.cls_name} ${currentSection?.sec_name}`} ?
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

export default Homework;
