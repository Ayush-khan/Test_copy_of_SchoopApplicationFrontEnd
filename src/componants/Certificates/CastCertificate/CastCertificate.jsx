import { useState, useEffect, useRef } from "react";
import { ImCheckboxChecked, ImDownload } from "react-icons/im";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import { RxCross1 } from "react-icons/rx";
// import AllotSubjectTab from "./AllotMarksHeadingTab";
import Select from "react-select";
import CreeateCastCertificate from "./CreeateCastCertificate";
function CastCertificate() {
  const API_URL = import.meta.env.VITE_API_URL; // URL for host
  const [activeTab, setActiveTab] = useState("Manage");
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  // for allot subject tab
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const [currestSubjectNameForDelete, setCurrestSubjectNameForDelete] =
    useState("");

  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");

  // This is hold the allot subjet api response
  const [classIdForManage, setclassIdForManage] = useState("");
  //   For the dropdown of Teachers name api
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  //   for allot subject checkboxes
  const [error, setError] = useState(null);
  const [nameError, setNameError] = useState(null);
  // for react-search of manage tab teacher Edit and select class
  const [selectedClass, setSelectedClass] = useState(null);
  // for Edit model
  const [newClassName, setNewClassName] = useState("");
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newExamName, setNewExamName] = useState("");
  const [newMarksHeading, setNewMarksHeading] = useState("");
  const [highestMarks, setHighestMarks] = useState("");
  const [marksError, setMarksError] = useState(""); // Error for validation
  const [isSubmitting, setIsSubmitting] = useState(false);

  const location = useLocation();
  const section_id = location.state?.section_id || null;
  console.log("cast section id", section_id);

  const navigate = useNavigate();

  const pageSize = 10;
  useEffect(() => {
    fetchClassNames();
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (location.state?.section_id) {
      setclassIdForManage(location.state.section_id);

      handleSearch(location.state.section_id);

      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleClassSelect = (selectedOption) => {
    setNameError("");
    setSelectedClass(selectedOption);
    setclassIdForManage(selectedOption ? selectedOption.value : null); // Set to null if cleared
  };

  const teacherOptions = departments.map((dept) => ({
    value: dept.reg_id,
    label: dept.name,
  }));
  console.log("teacherOptions", teacherOptions);
  const classOptions = classes.map((cls) => ({
    value: `${cls?.get_class?.name}-${cls.name}`,
    label: `${cls?.get_class?.name} ${cls.name}`,
  }));

  const fetchClassNames = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${API_URL}/api/get_class_section`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(response.data)) {
        setClasses(response.data);
        console.log("the name and section", response.data);
      } else {
        setError("Unexpected data format");
      }
    } catch (error) {
      console.error("Error fetching class and section names:", error);
      setError("Error fetching class and section names");
    }
  };

  //   This is the api for get teacher list in the manage tab edit
  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(`${API_URL}/api/get_teacher_list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      setDepartments(response.data);
      console.log(
        "888888888888888888888888 this is the edit of get_teacher list in the subject allotement tab",
        response.data
      );
    } catch (error) {
      setError(error.message);
    }
  };

  // Listing tabs data for diffrente tabs
  // const handleSearch = async () => {
  //   if (isSubmitting) return; // Prevent re-submitting
  //   setIsSubmitting(true);
  //   if (!classIdForManage) {
  //     setNameError("Please select the class.");
  //     setIsSubmitting(false);

  //     return;
  //   }
  //   setSearchTerm("");
  //   try {
  //     console.log(
  //       "for this sectiong id in seaching inside AllotMarksHeadingTab",
  //       classIdForManage
  //     );
  //     const token = localStorage.getItem("authToken");
  //     const response = await axios.get(
  //       // `${API_URL}/api/get_AllotMarkheadingslist`,

  //       `${API_URL}/api/get_castebonafidecertificatelist`,
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //         // params: { q: selectedClass },
  //         params: { q: classIdForManage },
  //       }
  //     );
  //     console.log(
  //       "the response of the AllotMarksHeadingTab is *******",
  //       response.data
  //     );
  //     if (response?.data?.data.length > 0) {
  //       setSubjects(response?.data?.data);
  //       setPageCount(Math.ceil(response?.data?.data.length / 10)); // Example pagination logic
  //     } else {
  //       setSubjects([]);
  //       toast.error(
  //         "No Cast certificates Listing are found for the selected class."
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Error fetching Cast certificates Listing:", error);
  //     setError("Error fetching Cast certificates");
  //   } finally {
  //     setIsSubmitting(false); // Re-enable the button after the operation
  //   }
  // };

  const handleSearch = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setNameError(""); // Clear any error
    setSearchTerm("");

    // Priority: classIdForManage > location.state?.section_id
    const sectionIdToUse = classIdForManage || location.state?.section_id;

    if (!sectionIdToUse) {
      setNameError("Please select the class.");
      setIsSubmitting(false);
      return;
    }

    try {
      console.log("Searching with section ID:", sectionIdToUse);
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/get_castebonafidecertificatelist`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { q: sectionIdToUse },
        }
      );

      console.log("Cast Certificate List Response:", response.data);

      if (response?.data?.data?.length > 0) {
        setSubjects(response.data.data);
        setPageCount(Math.ceil(response.data.data.length / 10));
      } else {
        setSubjects([]);
        toast.error("No Cast certificates found for the selected class.");
      }
    } catch (error) {
      console.error("Error fetching Cast certificates:", error);
      setError("Error fetching Cast certificates");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle division checkbox change

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
    // Handle page change logic
  };

  const handleDownload = (section) => {
    setCurrentSection(section);
    console.log("currentedit", section);
    setShowDownloadModal(true);
  };

  // const handleEditForm = (section) => {
  //   setCurrentSection(section);
  //   navigate(
  //     `/studentCast/edit/${section?.sr_no}`,

  //     {
  //       state: { student: section },
  //     }
  //   );
  //   // console.log("the currecne t section", currentSection);
  // };

  const handleEditForm = (section) => {
    setCurrentSection(section);

    const sectionId = section.class_division; // or section.section_id if it exists

    console.log("Navigating to edit with section_id:", sectionId);

    navigate(`/studentCast/edit/${section?.sr_no}`, {
      state: {
        student: section,
        section_id: sectionId, // ✅ Add this line
      },
    });
  };

  const handleDownloadSumbit = async () => {
    if (isSubmitting) return; // Prevent re-submitting
    setIsSubmitting(true);
    try {
      //  setLoading(true); // Show loading indicator if you have one
      const token = localStorage.getItem("authToken");
      console.log("the sr for download", currentSection.sr_no);
      if (!token || !currentSection || !currentSection.sr_no) {
        throw new Error("Token or Serial Number is missing");
      }

      const response = await axios.get(
        `${API_URL}/api/get_casteisDownload/${currentSection.sr_no}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob", // Important for downloading files
        }
      );

      if (response.status === 200) {
        toast.success("Cast certificate downloaded successfully!");

        // Extract filename from Content-Disposition header if available
        const contentDisposition = response.headers["content-disposition"];
        let filename = "DownloadedCertificate.pdf"; // Default name if not specified

        if (contentDisposition) {
          const match = contentDisposition.match(/filename="(.+?)"/);
          if (match && match[1]) {
            filename = match[1];
          }
        }

        // Create a blob URL for the PDF file
        const pdfBlob = new Blob([response.data], {
          type: "application/pdf",
        });
        const pdfUrl = URL.createObjectURL(pdfBlob);

        // Create a link to initiate the download
        const link = document.createElement("a");
        link.href = pdfUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(pdfUrl); // Clean up the object URL
        handleSearch(); // Optionally refresh your data
        handleCloseModal(); // Optionally close modal if applicable
      } else {
        throw new Error("Failed to download the file");
      }
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(
          `Error in Downloading Cast Certificate: ${error.response.data.error}`
        );
      } else {
        toast.error(`Error in Downloading Cast Certificate: ${error.message}`);
      }
      console.error("Error in Downloading Cast Certificate:", error);
    } finally {
      setIsSubmitting(false); // Re-enable the button after the operation
    }
    //    finally {
    //      setLoading(false); // Stop loading indicator
    //    }
  };

  const handleEdit = (section) => {
    setCurrentSection(section);
    console.log("currentedit", section);
    setShowEditModal(true);
  };

  const handleDelete = (sectionId) => {
    const classToDelete = subjects.find((cls) => cls.sr_no === sectionId);
    console.log("classsToDelete", classToDelete);
    // Set the current section and subject name for deletion
    if (classToDelete) {
      setCurrentSection(classToDelete); // Set the current section directly
      setCurrestSubjectNameForDelete(classToDelete?.stud_name); // Set subject name for display
      setShowDeleteModal(true); // Show the delete modal
    } else {
      console.error("Cast certificate not found for deletion");
    }
  };

  const handleSubmitEdit = async () => {
    if (isSubmitting) return; // Prevent re-submitting
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");

      if (!token || !currentSection || !currentSection.sr_no) {
        throw new Error("Token or Serial Number is missing");
      }

      setMarksError("");
      console.log(
        "class_name:",
        newClassName,
        "subject_name:",
        newSubjectName,
        "exam_name:",
        newExamName,
        "marks_heading:",
        newMarksHeading,
        "highest_marks:",
        highestMarks
      );

      await axios.put(
        `${API_URL}/api/update_casteisIssued/${currentSection.sr_no}`,
        {}, // Pass empty object for no payload
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      handleSearch(); // Refresh the list or data
      toast.success("Cast certificate issue status updated successfully!");
      handleCloseModal(); // Close the modal
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(
          `Error updating Cast Certificate issue status: ${error.response.data.error}`
        );
      } else {
        toast.error(
          `Error updating Cast Certificate issue status: ${error.message}`
        );
      }
      console.error("Error Cast Certificate issue status:", error);
    } finally {
      setIsSubmitting(false); // Re-enable the button after the operation
    }
  };

  const handleSubmitDelete = async () => {
    if (isSubmitting) return; // Prevent re-submitting
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");
      const subReportCardId = currentSection?.sr_no; // Get the correct ID

      if (!token || !subReportCardId) {
        throw new Error("Token or Serial Number is missing");
      }

      // Send the delete request to the backend
      await axios.delete(
        `${API_URL}/api/delete_casteisDeleted/${subReportCardId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      handleSearch(); // Refresh the data (this seems like the method to refetch data)
      setShowDeleteModal(false); // Close the modal
      toast.success("Cast Certificate deleted successfully!");
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(
          `Error deleting Cast Certificate: ${error.response.data.message}`
        );
      } else {
        toast.error(`Error deleting Cast Certificate: ${error.message}`);
      }
      console.error("Error deleting Cast Certificate:", error);
    } finally {
      setIsSubmitting(false); // Re-enable the button after the operation
      setShowDeleteModal(false); // Close the modal
    }
  };

  const handleCloseModal = () => {
    setShowDownloadModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
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

  const searchLower = searchTerm.trim().toLowerCase();

  const filteredSections = subjects.filter((section) => {
    // Convert the teacher's name and subject's name to lowercase for case-insensitive comparison
    const subjectNameIs = section?.stud_name.toLowerCase() || "";

    // Check if the search term is present in either the teacher's name or the subject's name
    return subjectNameIs.toLowerCase().includes(searchLower);
  });

  useEffect(() => {
    setPageCount(Math.ceil(filteredSections.length / pageSize));
  }, [filteredSections, pageSize]);

  const displayedSections = filteredSections.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "Manage") {
      handleSearch();
    }
  };
  return (
    <>
      {/* <ToastContainer /> */}
      <div className="md:mx-auto md:w-3/4 p-4 bg-white mt-4 ">
        <div className=" card-header  flex justify-between items-center  ">
          <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
            Caste Certificate
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
        <ul className="grid grid-cols-2 gap-x-10 relative -left-6 md:left-0 md:flex md:flex-row relative -top-4">
          {/* Tab Navigation */}
          {["Manage", "CreateCasteCertificate"].map((tab) => (
            <li
              key={tab}
              className={`md:-ml-7 shadow-md ${
                activeTab === tab ? "text-blue-500 font-bold" : ""
              }`}
            >
              <button
                onClick={() => handleTabChange(tab)}
                className="px-2 md:px-4 py-1 hover:bg-gray-200 text-[1em] md:text-sm text-nowrap"
              >
                {tab.replace(/([A-Z])/g, " $1")}
              </button>
            </li>
          ))}
        </ul>

        <div className="bg-white  rounded-md -mt-5">
          {activeTab === "Manage" && (
            <div>
              <ToastContainer />
              <div className="mb-4">
                <div className="md:w-[80%] mx-auto">
                  <div className="form-group mt-4 w-full md:w-[80%] flex justify-start gap-x-1 md:gap-x-6">
                    <label
                      htmlFor="classSection"
                      className="w-1/4 pt-2 items-center text-center"
                    >
                      Select Class <span className="text-red-500">*</span>
                    </label>
                    <div className="w-full">
                      <Select
                        value={selectedClass}
                        onChange={handleClassSelect}
                        options={classOptions}
                        placeholder="Select Class"
                        isSearchable
                        isClearable
                        className=" text-sm w-full md:w-[60%] item-center relative left-0 md:left-4"
                      />
                      {nameError && (
                        <div className=" relative top-0.5 left-3 ml-1 text-danger text-xs">
                          {nameError}
                        </div>
                      )}{" "}
                    </div>
                    <button
                      onClick={handleSearch}
                      type="button"
                      className="btn h-10  w-18 md:w-auto relative  right-0 md:right-[15%] btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
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
                        </span>
                      ) : (
                        "Search"
                      )}
                    </button>
                  </div>
                </div>
              </div>
              {subjects.length > 0 && (
                <div className="container mt-4">
                  <div className="card mx-auto lg:w-full shadow-lg">
                    <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                      <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
                        Manage Caste Certificate
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
                                Class/Division
                              </th>
                              <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                Status
                              </th>
                              <th className="px-2 w-full md:w-[8%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                Download
                              </th>
                              <th className="px-2 w-full md:w-[8%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                Edit
                              </th>

                              <th className="px-2 w-full md:w-[8%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                Delete
                              </th>
                              <th className="px-2 w-full md:w-[8%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                Issue
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {displayedSections.length ? (
                              displayedSections.map((subject, index) => {
                                // Determine the status text and button visibility based on conditions
                                let statusText = "";
                                let showIssueButton = false;
                                let showDeleteButton = false;
                                let showEditButton = false;
                                let showDownloadButton = false;

                                if (subject.IsDeleted === "Y") {
                                  statusText = "Deleted";
                                } else if (subject.IsIssued === "Y") {
                                  statusText = "Issued";
                                  showEditButton = true;
                                  showDownloadButton = true;
                                } else if (subject.IsGenerated === "Y") {
                                  statusText = "Generated";
                                  showIssueButton = true;
                                  showDeleteButton = true;
                                  showEditButton = true;
                                  showDownloadButton = true;
                                }

                                return (
                                  <tr key={subject.sr_no} className=" text-sm ">
                                    <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                      {currentPage * pageSize + index + 1}
                                    </td>
                                    <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                      {subject?.stud_name}
                                    </td>
                                    <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                      {subject?.class_division}
                                    </td>

                                    {/* Status column */}
                                    <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                      {statusText}
                                    </td>
                                    {/* Download button */}
                                    <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                      {showDownloadButton && (
                                        <button
                                          onClick={() =>
                                            handleDownload(subject)
                                          }
                                          className="text-blue-600 hover:text-blue-800 hover:bg-transparent"
                                        >
                                          <ImDownload />
                                        </button>
                                      )}
                                    </td>

                                    {/* Edit button */}
                                    <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                      {showEditButton && (
                                        <button
                                          onClick={() =>
                                            handleEditForm(subject)
                                          }
                                          className="text-blue-600 hover:text-blue-800 hover:bg-transparent"
                                        >
                                          <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                      )}
                                    </td>

                                    {/* Delete button */}
                                    <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                      {showDeleteButton && (
                                        <button
                                          onClick={() =>
                                            handleDelete(subject?.sr_no)
                                          }
                                          className="text-red-600 hover:text-red-800 hover:bg-transparent"
                                        >
                                          <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                      )}
                                    </td>

                                    {/* Issue button */}
                                    <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                      {showIssueButton && (
                                        <button
                                          onClick={() => handleEdit(subject)}
                                          className="text-green-600 hover:text-green-800 hover:bg-transparent"
                                        >
                                          <ImCheckboxChecked />
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })
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
              )}
            </div>
          )}
          {activeTab === "CreateCasteCertificate" && (
            <div>
              <CreeateCastCertificate />
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50   flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="flex justify-between p-3">
                  <h5 className="modal-title">Confirm Issue</h5>
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
                  Are you sure you want to issue this certificate{" "}
                  {` ${currentSection?.stud_name} `} ?
                </div>
                <div className=" flex justify-end p-3">
                  <button
                    type="button"
                    style={{ backgroundColor: "#2196F3" }}
                    className="btn text-white px-3 mb-2"
                    onClick={handleSubmitEdit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Issuing..." : "Issue"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50   flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="flex justify-between p-3">
                  <h5 className="modal-title">Confirm Download</h5>
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
                  Are you sure you want to Download this certificate{" "}
                  {` ${currentSection?.stud_name} `} ?
                </div>
                <div className=" flex justify-end p-3">
                  <button
                    type="button"
                    style={{ backgroundColor: "#2196F3" }}
                    className="btn text-white px-3 mb-2"
                    onClick={handleDownloadSumbit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Downloading..." : "Download"}
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
                  Are you sure you want to delete this certificate of{" "}
                  {` ${currestSubjectNameForDelete} `} ?
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
    </>
  );
}

export default CastCertificate;
