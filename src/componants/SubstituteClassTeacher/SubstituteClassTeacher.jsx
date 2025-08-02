import { useEffect, useState, useRef } from "react";
import axios from "axios";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RxCross1 } from "react-icons/rx";
import Select from "react-select";

function SubstituteClassTeacher() {
  const today = new Date().toISOString().split("T")[0];
  const API_URL = import.meta.env.VITE_API_URL; // URL for host
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const [newSectionName, setNewSectionName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [className, setClassName] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [newDepartmentId, setNewDepartmentId] = useState("");
  const [fieldErrors, setFieldErrors] = useState({}); // For field-specific errors
  const [nameError, setNameError] = useState("");
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [teacherId, setTeacherId] = useState(""); // State for selected teacher
  const [roleId, setRoleId] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const pageSize = 10;

  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");

  useEffect(() => {
    fetchClassTeacher();
    fetchTeachers();
    fetchClassNames();
    fetchDataRoleId();
  }, []);
  // for role_id
  const fetchDataRoleId = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.error("No authentication token found");
      return;
    }

    try {
      // Fetch session data
      const sessionResponse = await axios.get(`${API_URL}/api/sessionData`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRoleId(sessionResponse?.data?.user.role_id); // Store role_id
      // setRoleId("A"); // Store role_id
      setAcademicYear(sessionResponse?.data?.custom_claims?.academic_yr);
      // Fetch academic year data
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchClassNames = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${API_URL}/api/get_classteachers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(
        response.data.data.map((classItem) => ({
          value: {
            teacher_id: classItem?.teacher_id,
          },
          label: `${classItem?.name}`,
        }))
      );
    } catch (error) {
      toast.error("Error fetching class names");
    }
  };

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${API_URL}/api/get_nonclassteachers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeachers(
        response.data.data.map((teacher) => ({
          value: teacher.teacher_id,
          label: teacher.name,
        }))
      );
    } catch (error) {
      toast.error("Error fetching teachers");
    }
  };

  const fetchClassTeacher = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/api/get_substitute_classteacherlist`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // setPageCount(Math.ceil(response.data.data.length / pageSize));
      setSections(response.data.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const validateFields = (departmentId, teacherId) => {
    const errors = {};

    if (!startDate) {
      errors.start_date = "Please select a start date.";
    }

    if (!className) {
      errors.class_teacher_id = "Please select a class teacher.";
    }

    if (!departmentId) {
      errors.department_id = "Please select a class teacher."; // Error message for class dropdown
    }

    if (!teacherId) {
      errors.teacher_id = "Please select a subsitute class teacher."; // Error message for teacher dropdown
    }

    return errors;
  };

  const handleAdd = () => {
    setShowAddModal(true);
    setFieldErrors({});
    setNewSectionName("");
    setNewDepartmentId("");
  };
  const handleDelete = (id) => {
    const sectionToDelete = sections.find(
      (sec) => sec.class_substitute_id === id
    );
    if (sectionToDelete) {
      setCurrentSection(sectionToDelete); // Set the section to delete in state
      setShowDeleteModal(true); // Show the delete modal
    } else {
    }
  };

  const handleEdit = (section) => {
    setCurrentSection(section);
    setNewSectionName(section?.section_id);
    setNewDepartmentId(section?.teacher_id);
    setTeacherId(section?.teacher_id);
    setStartDate(section.start_date);
    setEndDate(section.end_date);

    if (section?.teacher_id && section?.substitute_teacher_name) {
      setSelectedTeacher({
        value: section?.teacher_id,
        label: section?.substitute_teacher_name,
      });
    } else {
      setSelectedTeacher(null); // Handle cases where teacher is not assigned
    }

    if (section?.class_teacher_id && section?.class_teacher_name) {
      setClassName({
        value: section?.class_teacher_id,
        label: section?.class_teacher_name,
      });
    } else {
      setClassName(null); // Handle cases where teacher is not assigned
    }
    setShowEditModal(true);
    setFieldErrors({});
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setNewSectionName("");
    setNewDepartmentId("");
    setCurrentSection(null);
    setFieldErrors({});
    setTeacherId("");
    setNameError("");
    setStartDate(today);
    setEndDate(today);
    setIsUpdating(false);
    setIsSubmitting(false);
  };

  const handleSubmitAdd = async () => {
    const validationErrors = validateFields(newDepartmentId, teacherId);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("authToken");
      await axios.post(
        `${API_URL}/api/save_classteachersubstitute`,
        {
          start_date: startDate,
          end_date: endDate, // Pass class ID
          class_teacher_id: newDepartmentId.teacher_id,
          sub_teacher_id: teacherId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchClassTeacher();
      handleCloseModal();
      toast.success("Substitute Class Teacher added successfully!");
      setIsSubmitting(false);
      setStartDate(today);
      setEndDate(today);
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message);
    }
  };

  const handleSubmitEdit = async () => {
    const validationErrors = validateFields(className, teacherId);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }
    if (!teacherId) {
      setFieldErrors({ teacher_id: "Please select a teacher." });
      return;
    }
    try {
      setIsUpdating(true);
      const token = localStorage.getItem("authToken");
      const response = await axios.put(
        `${API_URL}/api/update_classteachersubstitute/${currentSection.class_substitute_id}`,
        {
          class_teacher_id:
            className?.value?.teacher_id || className?.value || "",
          start_date: startDate, // Pass class ID
          sub_teacher_id: teacherId,
          end_date: endDate,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response?.data?.status === 200) {
        toast.success(response.data.message);
      }
      fetchClassTeacher();
      setTeacherId("");
      handleCloseModal();
      setIsUpdating(false);
      setStartDate(today);
      setEndDate(today);
    } catch (error) {
      toast.error("Error updating Class teacher. Please try again.");
    }
  };

  const handleSubmitDelete = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const academicYr = localStorage.getItem("academicYear");

      if (!token || !currentSection || !currentSection.section_id) {
        throw new Error("Class Teacher ID is missing");
      }

      setIsDeleting(true);
      const response = await axios.delete(
        `${API_URL}/api/delete_substituteclassteacher/${currentSection.class_substitute_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Academic-Year": academicYr,
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        fetchClassTeacher();
        setShowDeleteModal(false);
        setCurrentSection(null);
        setIsDeleting(false);
        toast.success("Substitute Class Teacher deleted successfully!");
      } else {
        toast.error(
          response.data.message || "Failed to delete Substitute Class Teacher"
        );
      }
    } catch (error) {
      console.error("Error deleting Substitute Class Teacher:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Server error. Please try again later.");
      }
    }
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

  const filteredSections = sections.filter((section) => {
    const searchLower = searchTerm.trim().toLowerCase();
    return (
      section.class_teacher_name.toLowerCase().includes(searchLower) ||
      section.substitute_teacher_name.toLowerCase().includes(searchLower) ||
      section.classname.toLowerCase().includes(searchLower)
    );
  });

  useEffect(() => {
    setPageCount(Math.ceil(filteredSections.length / pageSize));
  }, [filteredSections.length]);

  // Get the sections for the current page
  const displayedSections = filteredSections.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  // Handle page change
  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const handleClassChange = (selectedOption) => {
    setClassName(selectedOption);
    setNewDepartmentId(selectedOption ? selectedOption.value : "");
    // Clear class error if it was previously set
    setFieldErrors((prevErrors) => ({ ...prevErrors, department_id: "" }));
  };

  const handleTeacherChange = (selectedOption) => {
    if (selectedOption) {
      setSelectedTeacher({
        value: selectedOption.value,
        label: selectedOption.label,
      });
    } else {
      setSelectedTeacher(null); // Clear the selection if no option is selected
    }
    setTeacherId(selectedOption ? selectedOption.value : "");
    // Clear teacher error if it was previously set
    setFieldErrors((prevErrors) => ({ ...prevErrors, teacher_id: "" }));
  };

  const formatDMY = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleStartDateChange = (e) => {
    const newStart = e.target.value;

    setStartDate((prevStartDate) => {
      if (!endDate || endDate === prevStartDate) {
        setEndDate(newStart); // sync endDate if not manually changed
      } else if (newStart > endDate) {
        setEndDate(newStart);
      }
      return newStart;
    });
  };

  const handleEndDateChange = (e) => {
    const newEnd = e.target.value;

    if (newEnd < startDate) {
    } else {
      setFieldErrors({ ...fieldErrors, end_date: null });
      setEndDate(newEnd);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="container  mt-4">
        <div className="card mx-auto lg:w-[95%] shadow-lg">
          <div className="p-2 px-3 bg-gray-100 flex justify-between items-center">
            <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
              Substitute Class Teacher
            </h3>{" "}
            <div className="box-border flex md:gap-x-2 justify-end md:h-10">
              <div className=" w-1/2 md:w-fit mr-1">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search "
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                className="btn btn-primary btn-sm md:h-9 text-xs md:text-sm"
                onClick={handleAdd}
              >
                <FontAwesomeIcon icon={faPlus} style={{ marginRight: "5px" }} />
                Add
              </button>
            </div>
          </div>
          <div
            className=" relative w-[97%]   mb-3 h-1  mx-auto bg-red-700"
            style={{
              backgroundColor: "#C03078",
            }}
          ></div>

          <div className="card-body w-full">
            <div className="h-96 lg:h-96 overflow-y-scroll lg:overflow-x-hidden ">
              <div className="bg-white rounded-lg shadow-xs ">
                <table className="min-w-full leading-normal table-auto ">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Sr.No
                      </th>
                      <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Start date
                      </th>
                      <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        End date
                      </th>
                      <th className=" -px-2  text-center py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Class
                      </th>
                      <th className="px-2 text-center lg:px-5 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Class Teacher
                      </th>
                      <th className="px-2 text-center lg:px-5 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Substitute Teacher
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
                    {loading ? (
                      <tr>
                        <td colSpan="8" className="text-center py-6">
                          <p className="text-blue-700 text-xl">
                            Please wait while data is loading...
                          </p>
                        </td>
                      </tr>
                    ) : displayedSections.length ? (
                      displayedSections.map((section, index) => (
                        <tr
                          key={`${section.section_id}-${index}`}
                          className={`${
                            index % 2 === 0 ? "bg-white" : "bg-gray-100"
                          } hover:bg-gray-50`}
                        >
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {currentPage * pageSize + index + 1}
                            </p>
                          </td>
                          <td className="text-center px-2 border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {formatDMY(section?.start_date)}
                            </p>
                          </td>
                          <td className="text-center px-2 border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {formatDMY(section?.end_date)}
                            </p>
                          </td>
                          <td className="text-center px-2 lg:px-5 border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {section?.classname} {section?.sectionname}
                            </p>
                          </td>
                          <td className="text-center px-2 lg:px-5 border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {section?.class_teacher_name || ""}
                            </p>
                          </td>
                          <td className="text-center px-2 lg:px-5 border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {section?.substitute_teacher_name || ""}
                            </p>
                          </td>

                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <button
                              className="text-blue-600 hover:text-blue-800 hover:bg-transparent "
                              onClick={() => handleEdit(section)}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                          </td>

                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <button
                              className="text-red-600 hover:text-red-800 hover:bg-transparent "
                              onClick={() =>
                                handleDelete(section.class_substitute_id)
                              }
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center py-6">
                          <p className="text-red-700 text-xl">
                            Oops! No data found..
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className=" flex justify-center  pt-2 -mb-3  box-border  overflow-hidden">
              <ReactPaginate
                previousLabel={"Previous"}
                nextLabel={"Next"}
                breakLabel={"..."}
                breakClassName={"page-item"}
                breakLinkClassName={"page-link"}
                pageCount={pageCount}
                marginPagesDisplayed={1}
                pageRangeDisplayed={1}
                onPageChange={handlePageClick}
                containerClassName={"pagination justify-content-center"}
                pageClassName={"page-item"}
                pageLinkClassName={"page-link"}
                previousClassName={"page-item"}
                previousLinkClassName={"page-link"}
                nextClassName={"page-item"}
                nextLinkClassName={"page-link"}
                activeClassName={"active"}
              />
            </div>
          </div>
        </div>

        {showAddModal && (
          <div className="fixed inset-0 z-50   flex items-center justify-center bg-black bg-opacity-50">
            <div
              className="modal"
              style={{
                display: "block",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
              }}
            >
              <div className="modal-dialog modal-dialog-centered ">
                <div className="modal-content">
                  <div className="flex justify-between p-3">
                    <h5 className="modal-title">
                      Create Substitute Class Teacher
                    </h5>

                    <RxCross1
                      className="float-end relative top-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                      type="button"
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
                    <div className="relative mb-3 flex justify-center mx-4">
                      <label htmlFor="startDate" className="w-1/2 mt-2">
                        Start Date <span className="text-red-500">*</span>
                      </label>

                      <div className="w-[80%]">
                        <input
                          type="date"
                          id="startDate"
                          className="w-full text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded px-2 py-2"
                          value={startDate}
                          onChange={handleStartDateChange}
                        />
                        {fieldErrors.start_date && (
                          <div className="absolute top-8 left-1/3">
                            <span className="text-danger text-xs ml-6">
                              {fieldErrors.start_date}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="relative mb-3 flex justify-center mx-4">
                      <label htmlFor="endDate" className="w-1/2 mt-2">
                        End Date
                      </label>

                      <div className="w-[80%]">
                        <input
                          type="date"
                          id="endDate"
                          className="w-full h-[38px] text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded px-2 py-2"
                          value={endDate}
                          onChange={handleEndDateChange}
                        />
                        {fieldErrors.end_date && (
                          <div className="text-danger text-xs mt-1">
                            {fieldErrors.end_date}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="relative mb-3 flex justify-center mx-4">
                      <label htmlFor="sectionName" className="w-1/2 mt-2">
                        Class Teacher <span className="text-red-500">*</span>
                      </label>
                      <Select
                        className="w-[80%] text-sm"
                        options={classes}
                        isClearable
                        value={classes.find(
                          (option) => option.value === newDepartmentId
                        )}
                        onChange={handleClassChange}
                      />
                      <div className="absolute top-8 left-1/3">
                        {fieldErrors.department_id && (
                          <span className="text-danger text-xs ml-6">
                            {fieldErrors.department_id}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="relative mb-3 flex justify-center mx-4 mt-2">
                      <label htmlFor="departmentId" className="w-1/2 mt-2 ">
                        Substitute Teacher{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <Select
                        className="w-[80%] text-sm"
                        options={teachers}
                        isClearable
                        onChange={handleTeacherChange}
                      />
                      <div className="absolute top-9 left-1/3">
                        {fieldErrors.teacher_id && (
                          <span className="text-danger text-xs ml-6">
                            {fieldErrors.teacher_id}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className=" flex justify-end p-3">
                    <button
                      type="button"
                      className={`btn btn-primary px-3 mb-2 ${
                        isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      onClick={handleSubmitAdd}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Adding..." : "Add"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal for editing a section */}

        {showEditModal && (
          <div
            className="modal"
            style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="flex justify-between p-3">
                  <h5 className="modal-title">Edit Substitute Class Teacher</h5>
                  <RxCross1
                    className="float-end relative  mt-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                    type="button"
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
                  <div className="relative mb-3 flex justify-center mx-4">
                    <label htmlFor="startDate" className="w-1/2 mt-2">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <div className="w-[80%]">
                      <input
                        type="date"
                        id="startDate"
                        className="w-full h-[38px] text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={startDate}
                        onChange={handleStartDateChange}
                      />
                      {/* Error message */}
                      {fieldErrors.start_date && (
                        <div className="absolute top-8 left-1/3">
                          <span className="text-danger text-xs ml-6">
                            {fieldErrors.start_date}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="relative mb-3 flex justify-center mx-4">
                    <label htmlFor="endDate" className="w-1/2 mt-2">
                      End Date
                    </label>
                    <div className="w-[80%]">
                      <input
                        type="date"
                        id="endDate"
                        className="w-full h-[38px] text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={endDate}
                        onChange={handleEndDateChange}
                      />
                    </div>
                  </div>
                  <div className=" relative mb-3 flex justify-center  mx-4">
                    <label htmlFor="editSectionName" className="w-1/2 mt-2">
                      Class Teacher <span className="text-red-500">*</span>
                    </label>
                    <Select
                      className="w-[80%] text-sm"
                      options={classes}
                      value={className}
                      isClearable
                      onChange={handleClassChange}
                    />
                    <div className="absolute top-8 left-1/3">
                      {fieldErrors.class_teacher_id && (
                        <span className="text-danger text-xs ml-6">
                          {fieldErrors.class_teacher_id}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="relative mb-3 flex justify-center mx-4 mt-2">
                    <label htmlFor="departmentId" className="w-1/2 mt-2">
                      Substitute Teacher <span className="text-red-500">*</span>
                    </label>

                    <Select
                      className="w-[80%] text-sm"
                      options={teachers}
                      value={selectedTeacher} // Pre-fill with the selected teacher
                      isClearable
                      onChange={handleTeacherChange}
                    />

                    <div className="absolute top-9 left-1/3">
                      {fieldErrors.teacher_id && (
                        <span className="text-danger text-xs ml-6">
                          {fieldErrors.teacher_id}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className=" flex justify-end p-3">
                  {/* <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button> */}
                  <button
                    type="button"
                    className={`btn btn-primary px-3 mb-2 ${
                      isUpdating ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={handleSubmitEdit}
                    disabled={isUpdating}
                  >
                    {isUpdating ? "Updating..." : "Update"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showDeleteModal && (
          <div
            className="modal"
            style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="flex justify-between p-3">
                  <h5 className="modal-title">Confirm Deletion</h5>
                  <RxCross1
                    className="float-end relative mt-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                    type="button"
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
                  <p>
                    Are you sure you want to delete Substitute Class Teacher:{" "}
                    {currentSection?.class_teacher_name}?
                  </p>
                </div>
                <div className=" flex justify-end p-3">
                  <button
                    type="button"
                    className="btn btn-danger px-3 mb-2"
                    disabled={isDeleting}
                    onClick={handleSubmitDelete}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default SubstituteClassTeacher;
