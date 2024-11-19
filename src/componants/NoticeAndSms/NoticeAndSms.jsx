import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import { RxCross1 } from "react-icons/rx";
import Select from "react-select";

import CreateShortSMS from "./CreateShortSms";
import CreateNotice from "./CreateNotice";
import { PiCertificateBold } from "react-icons/pi";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { FaCheck } from "react-icons/fa";

function NoticeAndSms() {
  const API_URL = import.meta.env.VITE_API_URL; // URL for host
  // const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("Manage");
  const [classes, setClasses] = useState([]);
  const [classesforsubjectallot, setclassesforsubjectallot] = useState([]);

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

  const dropdownRef = useRef(null);
  //   for allot subject checkboxes

  const [error, setError] = useState(null);

  // errors messages for allot subject tab
  const [status, setStatus] = useState("All"); // For status dropdown
  const [selectedDate, setSelectedDate] = useState(""); // For date picker
  const [notices, setNotices] = useState([]); // To store fetched notices
  const [subject, setSubject] = useState("");
  const [noticeDesc, setNoticeDesc] = useState("");
  const [subjectError, setSubjectError] = useState("");
  const [noticeDescError, setNoticeDescError] = useState("");
  // for react-search of manage tab teacher Edit and select class
  const pageSize = 10;

  useEffect(() => {
    handleSearch();
    fetchClassNamesForAllotSubject();
  }, []);

  const fetchClassNamesForAllotSubject = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${API_URL}/api/getClassList`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(response.data)) {
        setclassesforsubjectallot(response.data);
        console.log(
          "this is the dropdown of the allot subject tab for class",
          response.data
        );
      } else {
        setError("Unexpected data format");
      }
    } catch (error) {
      console.error("Error fetching class names:", error);
      setError("Error fetching class names");
    }
  };

  // Listing tabs data for diffrente tabs
  const handleSearch = async () => {
    try {
      // Get token from local storage
      const token = localStorage.getItem("authToken");

      // Prepare query parameters
      const params = {};
      if (status) params.status = status; // Include status if selected
      if (selectedDate) params.notice_date = selectedDate; // Include date if selected

      // Make API request
      const response = await axios.get(`${API_URL}/api/get_smsnoticelist`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      // Handle response data
      if (response.data?.data?.length > 0) {
        setNotices(response.data.data); // Update notice list with response data
        setPageCount(Math.ceil(response.data.data.length / pageSize));
      } else {
        setNotices([]); // Clear notices if no data
        toast.error("No notices found for the selected criteria.");
      }
    } catch (error) {
      console.error("Error fetching SMS notices:", error);
      toast.error("Error fetching SMS notices. Please try again.");
    }
  };

  // Handle tab change with explicit logic for "Manage"
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
  const handleView = (section) => {
    setCurrentSection(section);
    // console.log("the currecne t section", currentSection);

    console.log("fdsfsdsd handleView", section);
    setnewclassnames(section?.classnames);
    setnewSectionName(section?.notice_date);
    setnewSubjectnName(section?.subject);
    setTeacherNameIs(section?.notice_desc);
    setteacherIdIs(section?.get_teacher?.teacher_id);
    console.log("teacerId and name is", teacherIdIs, teacherNameIs);
    // It's used for the dropdown of the tachers
    setShowViewModal(true);
  };

  const handleDelete = (sectionId) => {
    console.log("inside delete of subjectallotmenbt____", sectionId);
    console.log("inside delete of subjectallotmenbt", classes);
    const classToDelete = notices.find((cls) => cls.unq_id === sectionId);
    // setCurrentClass(classToDelete);
    setCurrentSection({ classToDelete });
    console.log("the currecne t section", currentSection);
    setCurrestSubjectNameForDelete(currentSection?.classToDelete?.notice_type);
    console.log("cureendtsungjeg", currentSection?.classToDelete?.notice_type);
    console.log("currestSubjectNameForDelete", currestSubjectNameForDelete);
    setShowDeleteModal(true);
  };
  const handleEdit = (section) => {
    setCurrentSection(section);
    setSubject(section?.subject || ""); // Pre-fill subject
    setNoticeDesc(section?.notice_desc || ""); // Pre-fill notice description
    setnewclassnames(section?.classnames);
    setShowEditModal(true);
  };

  const handleSubmitEdit = async () => {
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
    if (hasError) return;

    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("Authentication token is missing");
      }

      await axios.put(
        `${API_URL}/api/update_smsnotice/${currentSection?.unq_id}`,
        { subject, notice_desc: noticeDesc },
        {
          headers: {
            Authorization: `Bearer ${token}`,
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
    // Handle delete submission logic
    try {
      const token = localStorage.getItem("authToken");
      console.log(
        "the currecnt section inside the delte___",
        currentSection?.classToDelete?.subject_id
      );
      console.log("the classes inside the delete", classes);
      console.log(
        "the current section insde the handlesbmitdelete",
        currentSection.classToDelete
      );
      if (!token || !currentSection || !currentSection?.unq_id) {
        throw new Error("Unique ID is missing");
      }

      await axios.put(
        `${API_URL}/api/update_publishsmsnotice/${currentSection?.unq_id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      // fetchClassNames();
      handleSearch();

      setShowPublishModal(false);
      // setSubjects([]);
      toast.success(`${currestSubjectNameForDelete} Publish successfully!`);
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(
          `Error In Publishing ${currestSubjectNameForDelete}: ${error.response.data.message}`
        );
      } else {
        toast.error(
          `Error In Publishing ${currestSubjectNameForDelete}: ${error.message}`
        );
      }
      console.error("Error In Publishing:", error);
      // setError(error.message);
    }
    setShowPublishModal(false);
  };
  const handleSubmitDelete = async () => {
    // Handle delete submission logic
    try {
      const token = localStorage.getItem("authToken");
      console.log(
        "the currecnt section inside the delte___",
        currentSection?.classToDelete?.subject_id
      );
      console.log("the classes inside the delete", classes);
      console.log(
        "the current section insde the handlesbmitdelete",
        currentSection.classToDelete
      );
      if (!token || !currentSection || !currentSection?.classToDelete?.unq_id) {
        throw new Error("Unique ID is missing");
      }

      await axios.delete(
        `${API_URL}/api/delete_smsnotice/${currentSection?.classToDelete?.unq_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      // fetchClassNames();
      handleSearch();

      setShowDeleteModal(false);
      // setSubjects([]);
      toast.success(`${currestSubjectNameForDelete} Deleted successfully!`);
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
      // setError(error.message);
    }
    setShowDeleteModal(false);
  };

  const handleCloseModal = () => {
    setShowPublishModal(false);
    setShowViewModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
  };

  const filteredSections = notices.filter((section) => {
    // Convert the fields to lowercase for case-insensitive comparison
    const teacherName = section?.classnames?.toLowerCase() || "";
    const subjectName = section?.subject?.toLowerCase() || "";
    const noticeDesc = section?.notice_type?.toLowerCase() || ""; // New field to filter
    const teacher = section?.name?.toLowerCase() || ""; // Example for teacher's name, update as needed

    // Check if the search term is present in any of the specified fields
    return (
      teacherName.includes(searchTerm.toLowerCase()) ||
      subjectName.includes(searchTerm.toLowerCase()) ||
      noticeDesc.includes(searchTerm.toLowerCase()) || // Check notice description
      teacher.includes(searchTerm.toLowerCase()) // Check teacher name
    );
  });

  const displayedSections = filteredSections.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );
  // handle allot subject close model
  //   useEffect(() => {
  //     if (activeTab === "Manage") {
  //       handleSearch();
  //     }
  //   }, [activeTab]); // Dependency array ensures it runs when activeTab changes
  //   This is tab
  const tabs = [
    { id: "Manage", label: "Manage" },
    { id: "CreateShortSMS", label: "Create Short SMS" },
    { id: "CreateNotice", label: "Create Notice" },
  ];

  return (
    <>
      {/* <ToastContainer /> */}
      <div className="md:mx-auto md:w-3/4 p-4 bg-white mt-4 ">
        <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
          Notice/SMS For Parents
        </h3>
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
              <div className="mb-4">
                <div className="w-full  md:w-[78%] mt-8  gap-x-0 md:gap-x-12 mx-auto   flex flex-col gap-y-2 md:gap-y-0 md:flex-row  ">
                  <div className="w-full md:w-[50%] gap-x-14 md:gap-x-6 md:justify-start my-1 md:my-4 flex md:flex-row">
                    <label
                      className="text-md mt-1.5 mr-1 md:mr-0 w-[40%] md:w-[29%]"
                      htmlFor="classSelect"
                    >
                      Select Date
                    </label>{" "}
                    <div className="w-full md:w-[60%]">
                      <input
                        type="date"
                        id="date"
                        className="border border-gray-300 rounded-md py-2 px-3 w-full focus:outline-none focus:ring focus:ring-indigo-200"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="w-full md:w-[45%]  gap-x-4  justify-between  my-1 md:my-4 flex md:flex-row">
                    <label
                      className=" ml-0 md:ml-4 w-full md:w-[30%]  text-md mt-1.5 "
                      htmlFor="studentSelect"
                    >
                      Status
                    </label>{" "}
                    <div className="w-full">
                      <select
                        id="status"
                        className="border border-gray-300 rounded-md py-2 px-3 w-full focus:outline-none focus:ring focus:ring-indigo-200"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                      >
                        <option value="All">All</option>
                        <option value="Publish">Publish</option>
                        <option value="Unpublish">Unpublish</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-1">
                    <button
                      onClick={handleSearch}
                      type="button"
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Search
                    </button>
                  </div>
                </div>{" "}
              </div>

              <div className="container mt-4">
                <div className="card mx-auto lg:w-full shadow-lg">
                  <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                    <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
                      Manage Notice/SMS{" "}
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
                          <tr className="bg-gray-100">
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              S.No
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Type
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Notice Date
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Subject
                            </th>{" "}
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Class{" "}
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Created by
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
                          </tr>
                        </thead>
                        <tbody>
                          {displayedSections.map((subject, index) => (
                            <tr
                              key={subject.notice_id}
                              className="text-gray-700 text-sm font-light"
                            >
                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                {index + 1}
                              </td>
                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                {subject?.notice_type}
                              </td>
                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                {subject?.notice_date}
                              </td>
                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                {subject?.subject}
                              </td>
                              {/* CLass Column */}
                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                <div className=" w-17  overflow-x-auto ">
                                  {subject?.classnames
                                    ?.split(",")
                                    .map((classname, idx) => (
                                      <span key={idx}>
                                        {classname.trim()}
                                        {idx <
                                          subject.classnames.split(",").length -
                                            1 && ", "}
                                      </span>
                                    ))}
                                </div>
                              </td>

                              {/* <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {subject?.get_division?.name}
                                </td> */}
                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                {subject?.name}
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
                                      handleDelete(subject?.unq_id)
                                    }
                                    className="text-red-600 hover:text-red-800 hover:bg-transparent "
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </button>
                                ) : (
                                  ""
                                )}
                              </td>
                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                {subject.publish === "N" ? (
                                  <button
                                    onClick={() => handlePublish(subject)}
                                    className="text-green-500 hover:text-green-700 hover:bg-transparent"
                                  >
                                    <FaCheck icon={faTrash} />
                                  </button>
                                ) : (
                                  ""
                                )}
                              </td>
                            </tr>
                          ))}
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

          {activeTab === "CreateShortSMS" && (
            <div>
              <CreateShortSMS />
            </div>
          )}

          {activeTab === "CreateNotice" && (
            <div>
              <CreateNotice />{" "}
            </div>
          )}
          {/* {activeTab === "AllotTeachers" && (
            <div>
              <CreateShortNotice />
            </div>
          )} */}
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
                    <div className="input-field block border w-full border-1 border-gray-900 rounded-md py-1 px-3 bg-gray-200 shadow-inner">
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
                      rows="4"
                      maxLength={1000}
                      className="form-control shadow-md mb-2 w-full"
                      value={noticeDesc}
                      onChange={(e) => setNoticeDesc(e.target.value)}
                    ></textarea>
                    {noticeDescError && (
                      <p className="h-3 relative -top-3 text-red-500 text-sm mt-2">
                        {noticeDescError}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end p-3">
                  <button
                    type="button"
                    className="btn btn-primary px-3 mb-2"
                    onClick={handleSubmitEdit}
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showViewModal && (
        <div className="fixed inset-0 z-50   flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal show " style={{ display: "block" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="flex justify-between p-3">
                  <h5 className="modal-title">View Notice/SMS</h5>
                  <RxCross1
                    className="float-end relative  mt-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
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
                  {/* Modal content for editing */}
                  <div className=" relative mb-3 flex justify-center  mx-4 gap-x-7">
                    <label htmlFor="newSectionName" className="w-1/2 mt-2">
                      Class :{" "}
                    </label>
                    <div className="input-field block border w-full border-1 border-gray-900 rounded-md py-1 px-3 bg-gray-200 shadow-inner">
                      {newclassnames}
                    </div>
                  </div>

                  <div className=" relative mb-3 flex justify-center  mx-4 gap-x-7">
                    <label htmlFor="newSectionName" className="w-1/2 mt-2">
                      Notice Date:{" "}
                    </label>
                    <span className="input-field block border w-full border-1 border-gray-900 rounded-md py-1 px-3 bg-gray-200 shadow-inner">
                      {newSection}
                    </span>
                  </div>
                  <div className=" mb-3 relative  flex justify-start  mx-4 gap-x-7">
                    <label htmlFor="newSectionName" className="w-1/2 mt-2 ">
                      Subject:{" "}
                    </label>{" "}
                    <span className="input-field block border w-full border-1 border-gray-900 rounded-md py-1 px-3 bg-gray-200 shadow-inner">
                      {newSubject}
                    </span>
                  </div>
                  {/* <div className=" relative  flex justify-start  mx-4 gap-x-7">
                    <label htmlFor="newSectionName" className="w-1/2 mt-2 ">
                      Description:{" "}
                    </label>{" "}
                    <span className="input-field block border w-full border-1 border-gray-900 rounded-md py-1 px-3 bg-gray-200 shadow-inner">
                      {teacherNameIs}
                    </span>
                  </div> */}
                  <div className="relative mb-3 flex justify-center mx-4 gap-x-7">
                    <label htmlFor="noticeDesc" className="w-1/2 mt-2">
                      Description:
                    </label>
                    <textarea
                      id="noticeDesc"
                      rows="4"
                      maxLength={1000}
                      readOnly
                      className="input-field block border w-full border-1 border-gray-900 rounded-md py-1 px-3 bg-gray-200 shadow-inner"
                      value={noticeDesc}
                      onChange={(e) => setNoticeDesc(e.target.value)}
                    ></textarea>
                    {noticeDescError && (
                      <p className="h-3 relative -top-3 text-red-500 text-sm mt-2">
                        {noticeDescError}
                      </p>
                    )}
                  </div>
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
                  Are you sure you want to delete this{" "}
                  {` ${currestSubjectNameForDelete} `} ?
                </div>
                <div className=" flex justify-end p-3">
                  <button
                    type="button"
                    className="btn btn-danger px-3 mb-2"
                    onClick={handleSubmitDelete}
                  >
                    Delete
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
                  Are you sure you want to Publish this{" "}
                  {` ${currestSubjectNameForDelete} `} ?
                </div>
                <div className=" flex justify-end p-3">
                  <button
                    type="button"
                    className="btn btn-primary px-3 mb-2"
                    onClick={handleSubmitPublish}
                  >
                    Publish
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

export default NoticeAndSms;
