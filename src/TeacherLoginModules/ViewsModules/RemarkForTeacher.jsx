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
import Loader from "../../componants/common/LoaderFinal/LoaderStyle";
import { FaThumbsUp } from "react-icons/fa";

function RemarkForTeacher() {
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
  const [regId, setRegId] = useState(null);
  const [roleId, setRoleId] = useState(null);
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

        // 2️⃣ Fetch classes for that teacher
        const classRes = await axios.get(
          `${API_URL}/api/get_only_classes_allotted_to_teacher`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const classOptions =
          classRes.data?.data?.map((cls) => ({
            value: cls.class_id,
            label: cls.class_name,
          })) || [];

        setStudentNameWithClassId(classOptions);

        // 3️⃣ Finally, fetch teacher remarks
        const remarkRes = await axios.get(
          `${API_URL}/api/get_remark_of_teacher`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = remarkRes.data?.data || [];

        if (data.length > 0) {
          setNotices(data);
          setPageCount(Math.ceil(data.length / pageSize));
          setShowTable(true);
        } else {
          setNotices([]);
          setShowTable(false);
          toast.info("No remarks found for this teacher.");
        }
      } catch (error) {
        console.error("Initialization error:", error);
        toast.error("Failed to load teacher data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

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
    const searchLower = searchTerm.toLowerCase();
    const subject = notice?.remark_subject?.toLowerCase() || "";
    const type = notice?.remark_type?.toLowerCase() || "";
    const date = notice?.remark_date?.toLowerCase() || "";
    const ack = notice?.acknowledge?.toLowerCase() || "";

    return (
      subject.includes(searchLower) ||
      type.includes(searchLower) ||
      date.includes(searchLower) ||
      ack.includes(searchLower)
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
            Teacher Remark
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
          <div className="w-full bg-gray-50 p-4 rounded-lg shadow-sm mb-6">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
              {/* Teacher Name Label + Input */}
              <div className="flex items-center w-full md:w-1/2">
                <label
                  htmlFor="teacherName"
                  className="text-sm font-semibold text-gray-700 whitespace-nowrap mr-3"
                >
                  Teacher Name:
                </label>
                <input
                  id="teacherName"
                  type="text"
                  value={roleId || "—"}
                  readOnly
                  className="flex-grow bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-gray-700 font-medium shadow-inner focus:outline-none cursor-not-allowed"
                />
              </div>

              {/* Search Box */}
              <div className="flex items-center w-full md:w-1/2">
                <div className="flex w-full">
                  <input
                    id="searchInput"
                    type="text"
                    placeholder="Type to search for teacher remark..."
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow border border-gray-300 rounded-l-md px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Loader Overlay */}
          {loading && (
            <div className=" flex items-center justify-center bg-gray-50  z-10 py-8">
              <Loader /> {/* Replace this with your loader component */}
            </div>
          )}

          {/* Show table only when data is fetched and showTable is true */}
          {showTable && !loading && (
            <div className="h-96 lg:h-96 overflow-y-scroll lg:overflow-x-hidden">
              <div className="h-96 lg:h-96 overflow-y-scroll lg:overflow-x-hidden">
                <table className="min-w-full leading-normal table-auto">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="px-2 text-center py-2 border border-gray-950 text-sm font-semibold text-gray-900">
                        Sr.No
                      </th>
                      <th className="px-2 text-center py-2 border border-gray-950 text-sm font-semibold text-gray-900">
                        ID
                      </th>
                      <th className="px-2 text-center py-2 border border-gray-950 text-sm font-semibold text-gray-900">
                        Date
                      </th>
                      <th className="px-2 text-center py-2 border border-gray-950 text-sm font-semibold text-gray-900">
                        Remark Subject
                      </th>
                      <th className="px-2 text-center py-2 border border-gray-950 text-sm font-semibold text-gray-900">
                        Acknowledge
                      </th>
                      <th className="px-2 text-center py-2 border border-gray-950 text-sm font-semibold text-gray-900">
                        View
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {displayedSections.length ? (
                      displayedSections.map((item, index) => (
                        <tr
                          key={item.t_remark_id}
                          className="text-sm hover:bg-gray-50 transition"
                        >
                          <td className="px-3 py-2 border border-gray-300 text-center">
                            {currentPage * pageSize + index + 1}
                          </td>
                          <td className="px-3 py-2 border border-gray-300 text-center">
                            {item.t_remark_id}
                          </td>
                          <td className="px-3 py-2 border border-gray-300 text-center">
                            {item.remark_date}
                          </td>
                          <td className="px-3 py-2 border border-gray-300 text-center">
                            {item.remark_subject}
                          </td>
                          <td className="px-3 py-2 border border-gray-300 text-center flex justify-center ">
                            {item.acknowledge === "Y" ? (
                              <span className="text-green-600 font-semibold text-center">
                                <FaThumbsUp className="text-xl" />
                              </span>
                            ) : (
                              <span className="text-red-600 font-semibold"></span>
                            )}
                          </td>
                          <td className="px-3 py-2 border border-gray-300 text-center">
                            <button
                              className="text-[#C03078] hover:text-[#a12565]"
                              onClick={() => handleView(item)}
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

export default RemarkForTeacher;
