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

function NoticeAndSmsForStaff() {
  const API_URL = import.meta.env.VITE_API_URL; // URL for host
  // const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [classesforsubjectallot, setclassesforsubjectallot] = useState([]);
  // for allot subject tab
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
  const today = new Date().toISOString().split("T")[0];

  const [imageUrls, setImageUrls] = useState([]);

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

  const handleSearch = async () => {
    if (isSubmitting) return; // Prevent re-submitting
    setIsSubmitting(true);
    setSearchTerm("");
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
      } else {
        setNotices([]);
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
            Notice/SMS For Staff
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

        <div className="bg-white  rounded-md -mt-5">
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
                      max={today}
                    />
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
            </div>

            <div className="container mt-4">
              <div className="card mx-auto lg:w-full shadow-lg">
                <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                  <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
                    Notice/SMS List{" "}
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
                            Subject
                          </th>{" "}
                          <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                            Type
                          </th>{" "}
                          <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                            Notice Date
                          </th>{" "}
                          <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                            Created by
                          </th>
                          <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                            View
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
                                {subject?.subject}
                              </td>
                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                {subject?.notice_type}
                              </td>
                              {/* CLass Column */}
                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                {subject?.notice_date}
                              </td>

                              <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                {subject?.created_by_name}
                              </td>

                              <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                                <button
                                  className="text-blue-600 hover:text-blue-800 hover:bg-transparent"
                                  onClick={() => handleView(subject)}
                                >
                                  <MdOutlineRemoveRedEye className="font-bold text-xl" />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <div className=" absolute left-[1%] w-[100%]  text-center flex justify-center items-center mt-14">
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

                      <div className="relative  left-3 mt-2 flex flex-col mx-4 gap-y-2">
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

export default NoticeAndSmsForStaff;
