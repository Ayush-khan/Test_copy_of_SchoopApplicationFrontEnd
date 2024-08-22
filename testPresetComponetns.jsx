// This is the component of the subject allotment and the logic for allot subject tab is working fine
import { useState, useEffect, useRef } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import { IoMdAdd } from "react-icons/io";
import { CgAddR } from "react-icons/cg";
import { FaRegSquarePlus } from "react-icons/fa6";

function ManageSubjectList() {
  const API_URL = import.meta.env.VITE_API_URL; // URL for host
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [classSection, setClassSection] = useState("");
  const [activeTab, setActiveTab] = useState("Manage");
  const [classes, setClasses] = useState([]);
  const [classesforsubjectallot, setclassesforsubjectallot] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const [newSectionName, setNewSectionName] = useState("");
  const [newClassName, setNewClassName] = useState("");
  const [newSection, setnewSectionName] = useState("");
  const [newSubject, setnewSubjectnName] = useState("");
  const [newclassnames, setnewclassnames] = useState("");
  const [newTeacherAssign, setnewTeacherAssign] = useState("");
  const [ClassNameDropdown, setClassNameDropdown] = useState("");
  const [classId, setclassId] = useState("");
  // This is hold the allot subjet api response
  //   This is for the subject id in the dropdown
  const [newDepartmentId, setNewDepartmentId] = useState("");
  //   For the dropdown of Teachers name api
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [fieldErrors, setFieldErrors] = useState({}); // For field-specific errors
  // validations state for unique name
  const [nameAvailable, setNameAvailable] = useState(true);
  //   variable to store the respone of the allot subject tab
  const [allotSubjectTabData, setAllotSubjectTabData] = useState([]); //
  const [nameError, setNameError] = useState("");
  //   for dropdown seletect
  //   const [newDepartmentId, setNewDepartmentId] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [countSN, setCountSN0] = useState(0);
  //   for allot subject checkboxes
  const [selectedDivisions, setSelectedDivisions] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  //   Sorting logic state

  const pageSize = 10;
  const handleInputChange = (e) => {
    setNewDepartmentId(e.target.value);
    setIsDropdownOpen(true); // Open the dropdown when typing
  };

  const handleOptionSelect = (value) => {
    setNewDepartmentId(value);
    setIsDropdownOpen(false); // Close the dropdown when an option is selected
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false); // Close the dropdown if clicked outside
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  //   FOr serial number
  const generateSerialNumbers = (data) => {
    const sortedData = [...data].sort((a, b) => a.section_id - b.section_id); // Optional: sort based on section_id or any other criteria
    return sortedData.map((item, index) => ({
      ...item,
      serialNumber: index + 1,
    }));
  };
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
        "this is the edit of get_teacher list in the subject allotement tab",
        response.data
      );
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchClassNames();
    fetchDepartments();
    fetchClassNamesForAllotSubject();
  }, []);

  const handleSearch = async () => {
    try {
      console.log(
        "for this sectiong id in seaching inside subjectallotment",
        classSection
      );
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${API_URL}/api/get_subject_Alloted`, {
        headers: { Authorization: `Bearer ${token}` },
        // params: { section_id: classSection },
        params: { section_id: classSection },
      });
      if (response.data.length > 0) {
        setSubjects(response.data);
        setPageCount(Math.ceil(response.data.length / 10)); // Example pagination logic
      } else {
        setSubjects([]);
        setError("No subjects found for the selected class and division.");
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setError("Error fetching subjects");
    }
  };
  const handleSearchForsubjectAllot = async () => {
    try {
      console.log(
        "for this sectiong id in seaching inside subjectallotment",
        classId
      );
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/api/get_divisions_and_subjects/${classId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          // params: { section_id: classSection },
        }
      );
      if (Array.isArray(response.data)) {
        setAllotSubjectTabData(response.data);
      } else {
        setError("Unexpected data format");
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setError("Error fetching subjects");
    }
  };
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  //   Logic for ALlot subject tab
  // Extract unique divisions
  const uniqueDivisions = Array.from(
    new Set(allotSubjectTabData.map((item) => item.get_division.name))
  );

  // Extract unique subjects
  const uniqueSubjects = Array.from(
    new Set(
      allotSubjectTabData
        .map((item) => item.get_subject)
        .filter((subject) => subject !== null)
        .map((subject) => subject.name)
    )
  );

  // Handle division checkbox change
  const handleDivisionChange = (event) => {
    const value = event.target.value;
    setSelectedDivisions((prevSelected) =>
      prevSelected.includes(value)
        ? prevSelected.filter((division) => division !== value)
        : [...prevSelected, value]
    );
  };

  // Handle subject checkbox change
  const handleSubjectChange = (event) => {
    const value = event.target.value;
    setSelectedSubjects((prevSelected) =>
      prevSelected.includes(value)
        ? prevSelected.filter((subject) => subject !== value)
        : [...prevSelected, value]
    );
  };

  const handleChangeClassSectionForAllotSubjectTab = (e) => {
    setClassNameDropdown(e.target.value);
    setclassId(e.target.value);
    handleSearchForsubjectAllot();
  };

  const handleChangeClassSection = (e) => {
    setClassSection(e.target.value);
    // handleSearchForsubjectAllot();
  };

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
    // Handle page change logic
  };

  const handleEdit = (section) => {
    setCurrentSection(section);
    console.log("fdsfsdsd handleEdit", section);
    setnewclassnames(section?.get_class?.name);
    setnewSectionName(section?.get_division?.name);
    setnewSubjectnName(section?.get_subject?.name);
    // It's used for the dropdown of the tachers
    // setnewTeacherAssign()
    setShowEditModal(true);
  };

  const handleDelete = (sectionId) => {
    console.log("inside delete of subjectallotmenbt", sectionId);
    const classToDelete = classes.find((cls) => cls.class_id === sectionId);
    // setCurrentClass(classToDelete);
    setCurrentSection({ classToDelete });
    setShowDeleteModal(true);
  };

  const handleSubmitEdit = async () => {
    // Handle edit submission logic
    console.log(
      "inside the edit model of the subjectallotment",
      currentSection
    );
    console.log(
      "inside the edit model of the subjectallotment",
      currentSection
    );
    try {
      const token = localStorage.getItem("authToken");

      if (!token || !currentSection || !currentSection.class_id) {
        throw new Error("Class ID is missing");
      }
      if (!nameAvailable) {
        return;
      }
      await axios.put(
        `${API_URL}/api/update_subject_Alloted/${currentSection.subject_id}`,
        { teacher_id: currentSection.teacher_id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      fetchClassNames();
      handleCloseModal();
      toast.success("Subject Record updated successfully!");
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(
          `Error updating subject Record: ${error.response.data.message}`
        );
      } else {
        toast.error(`Error updating subject Record: ${error.message}`);
      }
      console.error("Error editing subject Record:", error);
    }
    setShowEditModal(false);
  };

  const handleSubmitDelete = async () => {
    // Handle delete submission logic
    try {
      const token = localStorage.getItem("authToken");
      console.log("the currecnt section", currentSection);
      console.log("the classes inside the delete", classes?.subject_id);
      if (!token || !currentSection || !currentSection.subject_id) {
        throw new Error("Class ID is missing");
      }

      await axios.delete(
        `${API_URL}/api/delete_subject_Alloted/${currentSection.subject_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      fetchClassNames();
      setShowDeleteModal(false);
      setClasses(null);
      toast.success("subject deleted successfully!");
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(`Error deleting subject: ${error.response.data.message}`);
      } else {
        toast.error(`Error deleting subject: ${error.message}`);
      }
      console.error("Error deleting subject:", error);
      // setError(error.message);
    }
    setShowDeleteModal(false);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setShowDeleteModal(false);
  };
  console.log("the name", subjects);
  const filteredSections = subjects.filter((section) =>
    section?.get_subject?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const displayedSections = filteredSections.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  //   sorting logic
  const sortedSubjects = () => {
    const { key, direction } = sortConfig;
    const sortedData = [...subjects].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === "asc" ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === "asc" ? 1 : -1;
      }
      return 0;
    });
    return sortedData;
  };

  return (
    <>
      <ToastContainer />
      <div className="md:mx-auto md:w-3/4 p-4 bg-white ">
        <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
          Subject Allotment
        </h3>
        <hr className="relative -top-3" />

        <ul className="grid grid-cols-2 gap-x-10 relative -left-6 md:left-0 md:flex md:flex-row relative -top-4">
          {/* Tab Navigation */}
          {[
            "Manage",
            "AllotSubject",
            "AllotTeachersForClass",
            "AllotTeachers",
          ].map((tab) => (
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
              <div className="mb-4">
                {/* <h2
                  className="text-gray-400 mt-1 text-[1.2em] md:text-sm text-nowrap"
                  style={{ color: "#D22B73" }}
                >
                  <IoSettingsSharp className="inline mr-1 -mt-1" />
                  Manage Subjects
                </h2> */}
                <div className="md:w-[80%] mx-auto">
                  <div className="form-group flex justify-center gap-x-1 md:gap-x-6">
                    <label
                      htmlFor="classSection"
                      className="w-1/4 pt-2 items-center text-center"
                    >
                      Select Class <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="classSection"
                      className="border w-[50%] h-10 md:h-auto rounded-md px-3 py-2 md:w-full mr-2"
                      value={classSection}
                      onChange={handleChangeClassSection}
                    >
                      <option value="">Select Class</option>
                      {classes.length === 0 ? (
                        <option value="">No classes available</option>
                      ) : (
                        classes.map((cls) => (
                          <option key={cls.section_id} value={cls.section_id}>
                            {`${cls?.class_name} ${cls?.name}`}
                          </option>
                        ))
                      )}
                    </select>
                    <button
                      onClick={handleSearch}
                      type="button"
                      className="btn h-10 md:h-auto w-18 md:w-auto btn-primary"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </div>

              {
                subjects.length > 0 && (
                  <div className="container mt-4">
                    <div className="card mx-auto lg:w-full shadow-lg">
                      <div className="card-header flex justify-between items-center">
                        <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
                          Manage Subjects List
                        </h3>
                        <div className="w-1/2  md:w-fit mr-1 ">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Search "
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="card-body  w-full">
                        <div className="h-96 lg:h-96 overflow-y-scroll lg:overflow-x-hidden">
                          <table className="min-w-full leading-normal table-auto">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                  S.No
                                </th>
                                <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                  Class
                                </th>
                                <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                  Division
                                </th>
                                <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                  Subject
                                </th>
                                <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                  Teacher
                                </th>
                                <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                  Edit
                                </th>
                                <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                  Delete
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {displayedSections.map((subject, index) => (
                                <>
                                  <tr
                                    key={subject.section_id}
                                    className="text-gray-700 text-sm font-light"
                                  >
                                    <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                      {index + 1}
                                    </td>
                                    <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                      {subject?.get_class?.name}
                                    </td>
                                    <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                      {subject?.get_division?.name}
                                    </td>
                                    <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                      {subject?.get_subject?.name}
                                    </td>
                                    <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                      {subject?.get_teacher?.name}
                                    </td>

                                    <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                      <button
                                        onClick={() => handleEdit(subject)}
                                        className="text-blue-600 hover:text-blue-800 hover:bg-transparent "
                                      >
                                        <FontAwesomeIcon icon={faEdit} />
                                      </button>
                                    </td>
                                    <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                      <button
                                        onClick={() =>
                                          handleDelete(subject.section_id)
                                        }
                                        className="text-red-600 hover:text-red-800 hover:bg-transparent "
                                      >
                                        <FontAwesomeIcon icon={faTrash} />
                                      </button>
                                    </td>
                                  </tr>
                                </>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className=" flex justify-center  pt-2 -mb-3">
                          <ReactPaginate
                            previousLabel={"Previous"}
                            nextLabel={"Next"}
                            breakLabel={"..."}
                            pageCount={pageCount}
                            onPageChange={handlePageClick}
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
                )
                //   : (
                //     // <div className="p-4">No subjects found</div>
                //     <button className="bg-cyan-500 text-white px-4 py-2 rounded-md hover:bg-cyan-600 w-full">
                //       Select a Class to See Subjects
                //     </button>
                //   )
              }
            </div>
          )}

          {/* Other tabs content */}

          {activeTab === "AllotSubject" && (
            <div className="container mt-4">
              <div className="card mx-auto lg:w-full shadow-lg">
                <div className="card-header flex justify-between items-center">
                  <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
                    Allot Subject
                  </h3>
                </div>
                <div className="mb-4">
                  <h3>Divisions</h3>
                  {uniqueDivisions.map((division) => (
                    <div key={division}>
                      <label>
                        <input
                          type="checkbox"
                          value={division}
                          checked={selectedDivisions.includes(division)}
                          onChange={handleDivisionChange}
                        />
                        {division}
                      </label>
                    </div>
                  ))}
                </div>

                <div>
                  <h3>Subjects</h3>
                  {uniqueSubjects.map((subject) => (
                    <div key={subject}>
                      <label>
                        <input
                          type="checkbox"
                          value={subject}
                          checked={selectedSubjects.includes(subject)}
                          onChange={handleSubjectChange}
                        />
                        {subject}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "AllotSubject" && (
            <div>
              <div className="mb-4">
                <h2
                  className="text-gray-400 mt-1 text-[1.2em] md:text-sm text-nowrap"
                  style={{ color: "#D22B73" }}
                >
                  <FaRegSquarePlus className="inline mr-1 -mt-1 " />
                  Allot Subjects
                </h2>
                <div className="md:w-[80%] mx-auto">
                  <div className="form-group flex justify-center gap-x-1 md:gap-x-6">
                    <label
                      htmlFor="classSection"
                      className="w-1/4 pt-2 items-center text-center"
                    >
                      Select Class <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="classSection"
                      className="border w-[50%] h-10 md:h-auto rounded-md px-3 py-2 md:w-full mr-2"
                      value={ClassNameDropdown}
                      onChange={handleChangeClassSectionForAllotSubjectTab}
                    >
                      <option value="">Select Class</option>
                      {classesforsubjectallot.length === 0 ? (
                        <option value="">No classes available</option>
                      ) : (
                        classesforsubjectallot.map((cls) => (
                          <option key={cls.classId} value={cls.class_id}>
                            {` ${cls?.name}`}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>
              </div>
              {allotSubjectTabData.length > 0 && <h1> omsdof </h1>}
            </div>
          )}
          {activeTab === "AllotTeachersForClass" && (
            <div>Allot Teachers For Class Tab Content</div>
          )}
          {activeTab === "AllotTeachers" && (
            <div>Allot Teachers Tab Content</div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50   flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal show " style={{ display: "block" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Allotment</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseModal}
                  ></button>
                </div>
                <div className="modal-body">
                  {/* Modal content for editing */}
                  <div className="form-group mb-2">
                    <label htmlFor="newSectionName">
                      Class :{" "}
                      <span className="font-semibold ml-1">
                        {newclassnames}
                      </span>
                    </label>
                    {/* <input
                      type="text"
                      className="form-control"
                      id="newSectionName"
                      value={newClassName}
                      readOnly
                      onChange={(e) => setNewSectionName(e.target.value)}
                    /> */}
                  </div>
                  <div className="form-group mb-2">
                    <label htmlFor="newSectionName">
                      Section:{" "}
                      <span className="font-semibold ml-1">{newSection}</span>
                    </label>
                    {/* <input
                      type="text"
                      className="form-control"
                      id="newSectionName"
                      value={newSectionName}
                      readOnly
                      onChange={(e) => setNewSectionName(e.target.value)}
                    /> */}
                  </div>
                  <div className="form-group mb-2">
                    <label htmlFor="newSectionName">
                      Subject:{" "}
                      <span className="font-semibold ml-1">{newSubject}</span>
                    </label>
                    {/* <input
                      type="text"
                      className="form-control"
                      id="newSectionName"
                      value={newSectionName}
                      readOnly
                      onChange={(e) => setNewSectionName(e.target.value)}
                    /> */}
                  </div>
                  <div className="form-group">
                    <div ref={dropdownRef} className="relative w-full">
                      <label
                        htmlFor="newDepartmentId"
                        className="w-1/4 pt-2 items-center text-center"
                      >
                        Teacher assigned <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="newDepartmentId"
                        value={newDepartmentId}
                        onChange={handleInputChange}
                        onFocus={() => setIsDropdownOpen(true)} // Open dropdown on input focus
                        placeholder="Search or select"
                        className="border w-[50%] h-10 rounded-md px-3 py-2 md:w-full mr-2"
                      />
                      {isDropdownOpen && (
                        <select
                          size={5}
                          className="absolute top-full left-0 w-[50%] border rounded-md mt-1 bg-white z-10 max-h-48 overflow-auto"
                          onChange={(e) => handleOptionSelect(e.target.value)}
                          onBlur={() => setIsDropdownOpen(false)} // Close dropdown on blur
                          value={newDepartmentId}
                        >
                          {departments
                            .filter((department) =>
                              department.name
                                .toLowerCase()
                                .includes(newDepartmentId.toLowerCase())
                            )
                            .map((department) => (
                              <option
                                key={department.department_id}
                                value={department.department_id}
                              >
                                {department.name}
                              </option>
                            ))}
                        </select>
                      )}
                    </div>
                    {/* <label htmlFor="newDepartmentId">
                      Teacher assigned <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="form-control"
                      id="newDepartmentId"
                      value={newDepartmentId}
                      onChange={(e) => setNewDepartmentId(e.target.value)}
                    >
                      <option value="">Select </option>
                      {departments.map((department) => (
                        <option
                          key={department.department_id}
                          value={department.department_id}
                        >
                          {department.name}
                        </option>
                      ))}
                    </select> */}
                    {/* {validationErrors.department_id && (
                      <span className="text-danger text-xs">
                        {validationErrors.department_id}
                      </span>
                    )} */}
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-primary"
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

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal fade show" style={{ display: "block" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                Are you sure you want to delete this subject?
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleSubmitDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ManageSubjectList;
