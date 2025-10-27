import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import { RxCross1 } from "react-icons/rx";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { ImDownload } from "react-icons/im";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

function TeacherNoteForClass() {
  const API_URL = import.meta.env.VITE_API_URL; // URL for host
  // const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  // for allot subject tab
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
  //   for allot subject checkboxes
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  // errors messages for allot subject tab
  const [selectedDate, setSelectedDate] = useState(""); // For date picker
  const [notices, setNotices] = useState([]); // To store fetched notices
  const [subject, setSubject] = useState("");
  const [noticeDesc, setNoticeDesc] = useState("");

  const [imageUrls, setImageUrls] = useState([]);
  const [studentOptions, setStudentNameWithClassId] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loadingExams, setLoadingExams] = useState(false);
  const [studentError, setStudentError] = useState("");

  // for react-search of manage tab teacher Edit and select class
  const pageSize = 10;

  useEffect(() => {
    fetchClass();
  }, []);

  const fetchClass = async () => {
    const token = localStorage.getItem("authToken");
    setLoadingExams(true);

    try {
      const response = await axios.get(
        `${API_URL}/api/get_only_classes_allotted_to_teacher`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const mappedData =
        response.data?.data?.map((item) => ({
          value: item.class_id,
          label: item.class_name,
        })) || [];

      setStudentNameWithClassId(mappedData);
    } catch (error) {
      toast.error("Error fetching Classes");
      console.error("Error fetching Classes:", error);
    } finally {
      setLoadingExams(false);
    }
  };
  const handleClassSelect = (selectedOption) => {
    setSelectedStudent(selectedOption);
    setStudentError(""); // clear error when selected
  };

  const handleSearch = async () => {
    setSearchTerm("");
    setStudentError("");
    let hasError = false;

    if (!selectedStudent) {
      setStudentError("Please select a Class.");
      hasError = true;
    }

    if (hasError) {
      return;
    }
    if (isSubmitting) return; // Prevent re-submitting
    setIsSubmitting(true);
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const params = {};
      if (selectedDate) params.notice_date = selectedDate;

      const response = await axios.get(`${API_URL}/api/get_viewstaffnotices`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      if (response.data?.data?.length > 0) {
        const smscount = response.data["0"]?.smscount || {};

        const updatedNotices = response.data.data.map((notice) => {
          const count = smscount[notice.unq_id] || 0;
          return {
            ...notice,
            showSendButton: notice.publish === "Y" && count > 0,
            count,
          };
        });

        setNotices(updatedNotices); // Update the state with enriched data
        setPageCount(Math.ceil(updatedNotices.length / pageSize));
        setShowTable(true);
      } else {
        setNotices([]);
        setShowTable(false);
        toast.error("No notices found for the selected criteria.");
      }
    } catch (error) {
      console.error("Error fetching SMS notices:", error);
      toast.error("Error fetching SMS notices. Please try again.");
    } finally {
      setIsSubmitting(false); // Re-enable the button after the operation
      setLoading(false);
    }
  };

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
    // Handle page change logic
  };

  const fetchNoticeData = async (currentSection) => {
    const token = localStorage.getItem("authToken");

    if (!token) throw new Error("No authentication token found");

    try {
      const response = await axios.get(
        `${API_URL}/api/get_staffnoticedata/${currentSection?.unq_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const { imageurl } = response.data.data;
      console.log("imageURL", imageurl);
      setImageUrls(imageurl); // Store image URLs for download links
    } catch (error) {
      console.error("Error fetching notice data:", error);
    }
  };

  const handleView = (section) => {
    console.log("view data", section);
    setCurrentSection(section);
    setNewStaffNames(section?.teacher_names);
    setnewSectionName(section?.notice_date);
    setnewSubjectnName(section?.subject);
    setTeacherNameIs(section?.notice_desc);
    setteacherIdIs(section?.get_teacher?.teacher_id);
    setShowViewModal(true);

    if (section.notice_type === "Notice") {
      fetchNoticeData(section); // Pass the current section directly
    } else {
      setImageUrls([]); // Clear image URLs if not a notice
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

  const [preselectedFiles, setPreselectedFiles] = useState([]); // Files fetched from API

  const handleCloseModal = () => {
    setSubject("");
    setNoticeDesc("");
    setNewStaffNames("");
    setPreselectedFiles([]);
    setUploadedFiles([]);
    // removeUploadedFile;
    setShowPublishModal(false);
    setShowViewModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
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

  const searchLower = searchTerm.toLowerCase();

  const filteredSections = notices.filter((notice) => {
    const subject = notice?.subject?.toLowerCase() || "";
    const department = notice?.dept_name?.toLowerCase() || "";
    const type = notice?.notice_type?.toLowerCase() || "";
    const noticeDate = notice?.notice_date?.toLowerCase() || "";
    const createdBy = notice?.name?.toLowerCase() || "";

    return (
      subject.includes(searchLower) ||
      department.includes(searchLower) ||
      type.includes(searchLower) ||
      noticeDate.includes(searchLower) ||
      createdBy.includes(searchLower)
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
            <>
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
                <table className="min-w-full table-auto border-collapse border border-gray-300">
                  <thead className="bg-gray-200">
                    <tr>
                      {[
                        "Sr.No",
                        "ID",
                        "Date",
                        "Remark Subject",
                        "Acknowledge",
                        "View",
                      ].map((col) => (
                        <th
                          key={col}
                          className="px-3 py-2 border border-gray-300 text-center text-sm font-semibold text-gray-900"
                        >
                          {col}
                        </th>
                      ))}
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
                            {subject?.subject}
                          </td>
                          <td className="px-3 py-2 border border-gray-300 text-center">
                            {subject?.notice_type}
                          </td>
                          <td className="px-3 py-2 border border-gray-300 text-center">
                            {subject?.notice_date}
                          </td>
                          <td className="px-3 py-2 border border-gray-300 text-center">
                            {subject?.created_by_name}
                          </td>
                          <td className="px-3 py-2 border border-gray-300 text-center">
                            <button
                              className="text-blue-600 hover:text-blue-800"
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
            </>
          )}
        </div>
      </div>

      {showViewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
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
