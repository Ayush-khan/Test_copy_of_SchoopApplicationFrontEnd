import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import { RxCross1 } from "react-icons/rx";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { ImDownload } from "react-icons/im";

function TeacherNoteForClass() {
  const API_URL = import.meta.env.VITE_API_URL; // URL for host
  const [loading, setLoading] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showPublish, setShowPublishModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const [newSection, setnewSectionName] = useState("");
  const [newSubject, setnewSubjectnName] = useState("");
  const [newStaffNames, setNewStaffNames] = useState("");
  const [teacherIdIs, setteacherIdIs] = useState("");
  const [teacherNameIs, setTeacherNameIs] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]); // To store fetched notices
  const [subject, setSubject] = useState("");
  const [noticeDesc, setNoticeDesc] = useState("");
  const [regId, setRegId] = useState(null);
  const [roleId, setRoleId] = useState(null);
  const [studentOptions, setStudentNameWithClassId] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loadingExams, setLoadingExams] = useState(false);
  const [studentError, setStudentError] = useState("");
  const [imageUrls, setImageUrls] = useState([]);
  const [preselectedFiles, setPreselectedFiles] = useState([]); // Files fetched from API

  // for react-search of manage tab teacher Edit and select class
  const pageSize = 10;
  const formatDate = (isoDate) => {
    if (!isoDate) return "-";
    // isoDate is in "YYYY-MM-DD"
    const [year, month, day] = isoDate.split("-");
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);

        // 1️⃣ Get session data
        const token = localStorage.getItem("authToken");
        if (!token) {
          toast.error("Authentication token not found. Please login again.");
          navigate("/");
          return;
        }

        const sessionRes = await axios.get(`${API_URL}/api/sessionData`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const roleId = sessionRes?.data?.user?.name;
        const regId = sessionRes?.data?.user?.reg_id;

        if (!roleId || !regId) {
          toast.error("Invalid session data received");
          return;
        }

        setRoleId(roleId);
        setRegId(regId);

        setLoadingExams(true);

        const responseForClass = await axios.get(
          `${API_URL}/api/get_classes_of_classteacher?teacher_id=${regId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const mappedData =
          responseForClass.data?.data?.map((item) => ({
            value: item.class_id,
            sectionId: item?.section_id,
            label: `${item?.classname} ${item?.sectionname}`,
          })) || [];

        setStudentNameWithClassId(mappedData);
      } catch (error) {
        console.error("Initialization error:", error);
        toast.error("Failed to get classes. Please try again.");
      } finally {
        setLoadingExams(false);
        setLoading(false);
      }
    };

    init();
  }, []);
  const handleClassSelect = (selectedOption) => {
    setSelectedStudent(selectedOption);
    setStudentError(""); // clear error when selected
  };

  const handleSearch = async () => {
    setStudentError("");
    setSearchTerm("");
    let hasError = false;

    if (!selectedStudent) {
      setStudentError("Please select a Class.");
      hasError = true;
    }

    if (hasError) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Authentication token not found.");
        setLoading(false);
        return;
      }

      // Build params for API call
      const params = {
        class_id: selectedStudent?.value,
        section_id: selectedStudent?.sectionId,
      };

      const response = await axios.get(
        `${API_URL}/api/get_daily_notes_class_teacherwise`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      const data = response.data?.data || [];

      if (data.length > 0) {
        setNotices(data);
        setPageCount(Math.ceil(data.length / pageSize));
        setShowTable(true);
        toast.success("Daily notes fetched successfully!");
      } else {
        setNotices([]);
        setShowTable(false);
        toast.info("No daily notes found for the selected class.");
      }
    } catch (error) {
      console.error("Error fetching daily notes:", error);
      toast.error("Failed to fetch daily notes. Please try again.");
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
    // Handle page change logic
  };

  // Function to fetch and display full note details when "View" is clicked
  const fetchViewNoteDetails = async (notesId) => {
    const token = localStorage.getItem("authToken");
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/get_view_daily_notes_class_teacherwise/${notesId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = response.data?.data || {};
      const note = data.notesdata?.[0] || {};
      const imageUrls = data.imageurl || [];

      setnewSectionName(note.date);
      setnewSubjectnName(note.subjectname);
      setTeacherNameIs(note.description);
      setImageUrls(imageUrls);
    } catch (error) {
      console.error("Error fetching note details:", error);
      toast.error("Failed to load note details.");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (section) => {
    setCurrentSection(section);
    setShowViewModal(true);
    fetchViewNoteDetails(section.notes_id);
  };

  // Function to download files
  const handleCloseModal = () => {
    setSubject("");
    setNoticeDesc("");
    setNewStaffNames("");
    setPreselectedFiles([]);
    setShowPublishModal(false);
    setShowViewModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
  };
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

  const filteredSections = notices.filter((note) => {
    const searchLower = searchTerm.toLowerCase();
    const className = note?.class_name?.toLowerCase() || "";
    const section = note?.sec_name?.toLowerCase() || "";
    const subject = note?.sub_name?.toLowerCase() || "";
    const date = note?.date?.toLowerCase() || "";
    const description = note?.description?.toLowerCase() || "";

    return (
      className.includes(searchLower) ||
      section.includes(searchLower) ||
      subject.includes(searchLower) ||
      date.includes(searchLower) ||
      description.includes(searchLower)
    );
  });

  const displayedSections = filteredSections.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );
  return (
    <>
      {/* <ToastContainer /> */}
      <div className="md:mx-auto md:w-3/4 p-4 bg-white mt-4 ">
        <div className=" card-header  flex justify-between items-center  ">
          <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
            View teacher's note for the class
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

        <div className="bg-white  rounded-md ">
          <ToastContainer />
          <div className="w-full  md:w-[78%]  gap-x-0 md:gap-x-12 mx-auto   flex flex-col gap-y-2 md:gap-y-0 md:flex-row  ">
            <div className="w-full  md:w-[40%] gap-x-14 md:gap-x-6 md:justify-start  flex md:flex-row">
              <label
                className="text-md mt-1.5 mr-1 md:mr-0 w-[40%] md:w-[29%]"
                htmlFor="classSelect"
              >
                {" "}
                Class <span className="text-red-500">*</span>
              </label>
              <div className="w-full md:w-[70%]">
                <Select
                  id="studentSelect"
                  value={selectedStudent}
                  onChange={handleClassSelect}
                  options={studentOptions}
                  placeholder={loadingExams ? "Loading..." : "Select Class"}
                  isSearchable
                  isClearable
                  isDisabled={loadingExams}
                  styles={{
                    control: (base) => ({
                      ...base,
                      fontSize: "0.9em",
                      minHeight: "42px",
                      borderRadius: "8px",
                      borderColor: "#d1d5db",
                      boxShadow: "none",
                      "&:hover": {
                        borderColor: "#3b82f6", // Tailwind blue-500
                      },
                    }),
                  }}
                />

                <p className="text-xs text-red-500 mt-1 h-4">
                  {studentError || "\u00A0"}
                </p>
              </div>
            </div>

            <div className="mt-1">
              <button
                onClick={handleSearch}
                type="button"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                {isSubmitting ? "Searching..." : "Search"}
              </button>
            </div>
          </div>{" "}
          {showTable && (
            <div className="w-full md:w-[80%] mx-auto">
              {/* Table Header with Search */}
              <div className="p-2 px-3 bg-gray-50 border-b  rounded-md flex justify-end items-center">
                <div className="w-full md:w-1/3 flex justify-end">
                  <input
                    type="text"
                    className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Search"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Table */}
              <div className="h-96 overflow-y-auto">
                <table className="min-w-full w-[80%]   border border-gray-300">
                  <thead className="bg-gray-200">
                    <tr>
                      {["Sr.No", "Create Date", "Subject", "View"].map(
                        (col) => (
                          <th
                            key={col}
                            className="px-3 py-2 border border-gray-300 text-center text-sm font-semibold text-gray-900"
                          >
                            {col}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center py-10 text-blue-700"
                        >
                          Please wait while data is loading...
                        </td>
                      </tr>
                    ) : displayedSections.length ? (
                      displayedSections.map((subject, index) => (
                        <tr
                          key={subject.notice_id}
                          className="text-sm hover:bg-gray-50"
                        >
                          <td className="px-3 py-2 border border-gray-300 text-center">
                            {currentPage * pageSize + index + 1}
                          </td>
                          <td className="px-3 py-2 border border-gray-300 text-center">
                            {formatDate(subject?.date)}
                          </td>
                          <td className="px-3 py-2 border border-gray-300 text-center">
                            {subject?.sub_name}
                          </td>

                          <td className="px-3 py-2 border border-gray-300 text-center">
                            <button
                              className="text-blue-600 hover:text-blue-800 hover:bg-transparent"
                              onClick={() => handleView(subject)}
                            >
                              <MdOutlineRemoveRedEye className="text-xl" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center py-10 text-red-700"
                        >
                          Oops! No data found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex justify-center pt-2">
                <ReactPaginate
                  previousLabel={"Previous"}
                  nextLabel={"Next"}
                  breakLabel={"..."}
                  pageCount={pageCount}
                  onPageChange={handlePageClick}
                  containerClassName={"pagination flex gap-2"}
                  pageClassName={"page-item"}
                  pageLinkClassName={"page-link px-3 py-1 border rounded"}
                  previousClassName={"page-item"}
                  previousLinkClassName={"page-link px-3 py-1 border rounded"}
                  nextClassName={"page-item"}
                  nextLinkClassName={"page-link px-3 py-1 border rounded"}
                  breakClassName={"page-item"}
                  breakLinkClassName={"page-link px-3 py-1 border rounded"}
                  activeClassName={"bg-blue-500 text-white"}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {showViewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal show" style={{ display: "block" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="flex justify-between p-3">
                  <h5 className="modal-title">
                    View teacher's note for the class
                  </h5>
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
                  {/* Class */}
                  <div className="relative mb-3 flex justify-center mx-4 gap-x-7">
                    <label htmlFor="newSectionName" className="w-1/2 mt-2">
                      Class:{" "}
                    </label>
                    <span className="input-field block border w-full border-gray-900 rounded-md py-1 px-3 bg-gray-200 shadow-inner">
                      {selectedStudent?.label}
                    </span>
                  </div>{" "}
                  {/* Subject */}
                  <div className="mb-3 relative flex justify-start mx-4 gap-x-7">
                    <label htmlFor="newSectionName" className="w-1/2 mt-2">
                      Subject:{" "}
                    </label>
                    <span className="input-field block border w-full border-gray-900 rounded-md py-1 px-3 bg-gray-200 shadow-inner">
                      {newSubject}
                    </span>
                  </div>
                  {/* Notice Date */}
                  <div className="relative mb-3 flex justify-center mx-4 gap-x-7">
                    <label htmlFor="newSectionName" className="w-1/2 mt-2">
                      Create Date:{" "}
                    </label>
                    <span className="input-field block border w-full border-gray-900 rounded-md py-1 px-3 bg-gray-200 shadow-inner">
                      {formatDate(newSection)}
                    </span>
                  </div>
                  {/* Description */}
                  <div className="relative mb-3 flex justify-center mx-4 gap-x-7">
                    <label htmlFor="noticeDesc" className="w-1/2 mt-2">
                      Description:
                    </label>
                    <textarea
                      id="noticeDesc"
                      rows="2"
                      maxLength={1000}
                      readOnly
                      className="input-field block border w-full border-gray-900 rounded-md py-1 px-3 bg-gray-200 shadow-inner"
                      value={teacherNameIs}
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showViewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-50">
          <div className="modal show" style={{ display: "block" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="flex justify-between p-3">
                  <h5 className="modal-title">View Notice/SMS</h5>
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
                  {/* Class */}

                  {/* Notice Date */}
                  <div className="relative mb-3 flex justify-center mx-4 gap-x-7">
                    <label htmlFor="newSectionName" className="w-1/2 mt-2">
                      Notice Date:{" "}
                    </label>
                    <span className="input-field block border w-full border-gray-900 rounded-md py-1 px-3 bg-gray-200 shadow-inner">
                      {newSection}
                    </span>
                  </div>
                  {/* Subject */}
                  <div className="mb-3 relative flex justify-start mx-4 gap-x-7">
                    <label htmlFor="newSectionName" className="w-1/2 mt-2">
                      Subject:{" "}
                    </label>
                    <span className="input-field block border w-full border-gray-900 rounded-md py-1 px-3 bg-gray-200 shadow-inner">
                      {newSubject}
                    </span>
                  </div>
                  {/* Description */}
                  <div className="relative mb-3 flex justify-center mx-4 gap-x-7">
                    <label htmlFor="noticeDesc" className="w-1/2 mt-2">
                      Description:
                    </label>
                    <textarea
                      id="noticeDesc"
                      rows="2"
                      maxLength={1000}
                      readOnly
                      className="input-field block border w-full border-gray-900 rounded-md py-1 px-3 bg-gray-200 shadow-inner"
                      value={teacherNameIs}
                    ></textarea>
                  </div>

                  {/* Download Links */}
                  {/* Download Links */}

                  {imageUrls && imageUrls.length > 0 && (
                    <div className="w-full  flex flex-row">
                      <label className=" px-4 mb-2 ">Attachments:</label>

                      <div className="relative mt-2 flex flex-col mx-4 gap-y-2">
                        {imageUrls.map((url, index) => {
                          // Extracting file name from the URL
                          const fileName = url.substring(
                            url.lastIndexOf("/") + 1
                          );
                          return (
                            <div
                              key={index}
                              className=" font-semibold flex flex-row text-[.58em]  items-center gap-x-2"
                            >
                              {/* Display file name */}
                              <span className=" ">{fileName}</span>
                              <button
                                className=" text-blue-600 hover:text-blue-800 hover:bg-transparent"
                                onClick={() => downloadFile(url, fileName)}
                              >
                                <ImDownload className="font-2xl w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TeacherNoteForClass;
