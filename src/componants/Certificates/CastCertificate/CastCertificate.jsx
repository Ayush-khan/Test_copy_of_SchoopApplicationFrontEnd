import { useState, useEffect, useRef } from "react";
import { ImCheckboxChecked } from "react-icons/im";
import axios from "axios";
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const [currestSubjectNameForDelete, setCurrestSubjectNameForDelete] =
    useState("");

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

  const pageSize = 10;
  useEffect(() => {
    fetchClassNames();
    fetchDepartments();
  }, []);
  const handleClassSelect = (selectedOption) => {
    setNameError("");
    setSelectedClass(selectedOption);
    setclassIdForManage(selectedOption.value); // Assuming value is the class ID
  };

  const teacherOptions = departments.map((dept) => ({
    value: dept.reg_id,
    label: dept.name,
  }));
  console.log("teacherOptions", teacherOptions);
  const classOptions = classes.map((cls) => ({
    value: `${cls?.get_class?.name} ${cls.name}`,
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
  const handleSearch = async () => {
    if (!classIdForManage) {
      setNameError("Please select the class.");
      return;
    }
    try {
      console.log(
        "for this sectiong id in seaching inside AllotMarksHeadingTab",
        classIdForManage
      );
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        // `${API_URL}/api/get_AllotMarkheadingslist`,

        `${API_URL}/api/get_castebonafidecertificatelist`,
        {
          headers: { Authorization: `Bearer ${token}` },
          // params: { q: selectedClass },
          params: { section_id: classIdForManage },
        }
      );
      console.log(
        "the response of the AllotMarksHeadingTab is *******",
        response.data
      );
      if (response?.data?.data.length > 0) {
        setSubjects(response?.data?.data);
        setPageCount(Math.ceil(response?.data?.data.length / 10)); // Example pagination logic
      } else {
        setSubjects([]);
        toast.error(
          "No Cast certificates Listing are found for the selected class."
        );
      }
    } catch (error) {
      console.error("Error fetching Cast certificates Listing:", error);
      setError("Error fetching Cast certificates");
    }
  };

  // Handle division checkbox change

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
    // Handle page change logic
  };

  const handleEdit = (section) => {
    setCurrentSection(section);
    console.log("currentedit", section);

    // // Set values for the edit modal
    // setNewClassName(section?.get_class?.name);
    // setNewSubjectName(section?.get_subject?.name);
    // setNewExamName(section?.get_exam?.name); // Assuming exam details are available
    // setNewMarksHeading(section?.get_marksheading?.name || ""); // Set marks heading if available

    // setHighestMarks(section?.highest_marks || ""); // Set highest marks or empty
    // setMarksError(""); // Reset the error message when opening the modal

    setShowEditModal(true);
  };
  // Handle the highest marks change with validation
  const handleMarksChange = (e) => {
    const value = e.target.value;

    // Check if the input is empty
    if (value === "") {
      setMarksError("Highest Marks is required."); // Set error for empty field
      setHighestMarks(""); // Clear the value in the state
    }
    // Allow only numbers
    else if (/^\d*$/.test(value)) {
      setHighestMarks(value);
      setMarksError(""); // Clear error if input is valid
    }
    // Handle invalid input (non-numeric)
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
    }
  };

  const handleSubmitDelete = async () => {
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
    }
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setShowDeleteModal(false);
  };

  const filteredSections = subjects.filter((section) => {
    // Convert the teacher's name and subject's name to lowercase for case-insensitive comparison
    const subjectNameIs = section?.stud_name.toLowerCase() || "";

    // Check if the search term is present in either the teacher's name or the subject's name
    return subjectNameIs.includes(searchTerm.toLowerCase());
  });
  const displayedSections = filteredSections.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  return (
    <>
      {/* <ToastContainer /> */}
      <div className="md:mx-auto md:w-3/4 p-4 bg-white mt-4 ">
        <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
          Caste Certificate
        </h3>
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
                    >
                      Search
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
                            <tr className="bg-gray-100">
                              <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                S.No
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

                              <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                Delete
                              </th>
                              <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                Issue
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {displayedSections.map((subject, index) => {
                              // Determine the status text and button visibility based on conditions
                              let statusText = "";
                              let showIssueButton = true;
                              let showDeleteButton = true;

                              if (subject.IsDeleted === "Y") {
                                statusText = "Deleted";
                                showIssueButton = false;
                                showDeleteButton = false;
                              } else if (subject.IsIssued === "Y") {
                                statusText = "Issued";
                                showIssueButton = false;
                                showDeleteButton = false;
                              } else if (subject.IsGenerated === "Y") {
                                statusText = "Generated";
                                showIssueButton = true;
                                showDeleteButton = true;
                              }

                              return (
                                <tr
                                  key={subject.sr_no}
                                  className="text-gray-700 text-sm font-light"
                                >
                                  <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                    {index + 1}
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
                            })}
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
                  Are you sure you want to issue this certificate?{" "}
                  {` ${currestSubjectNameForDelete} `} ?
                </div>
                <div className=" flex justify-end p-3">
                  <button
                    type="button"
                    style={{ backgroundColor: "#2196F3" }}
                    className="btn text-white px-3 mb-2"
                    onClick={handleSubmitEdit}
                  >
                    Issue
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
                  >
                    Delete
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
