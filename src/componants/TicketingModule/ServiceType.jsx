import { useEffect, useState, useRef } from "react";
import axios from "axios";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RxCross1 } from "react-icons/rx";

function ServiceType() {
  const API_URL = import.meta.env.VITE_API_URL; // URL for host
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const [nameAvailable, setNameAvailable] = useState(true);
  const [description, setnewDescription] = useState("");
  const [requiresAppointment, setRequiresAppointment] = useState("N");
  const [classes, setClasses] = useState([
    { label: "Admin", value: "A" },
    { label: "Finance", value: "F" },
    { label: "Librarian", value: "L" },
    { label: "Management", value: "M" },
    { label: "Teacher", value: "T" },
    { label: "AceVentura", value: "U" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");

  const pageSize = 10;

  const fetchSections = async () => {
    try {
      const token = localStorage.getItem("authToken");
      // const academicYr = localStorage.getItem("academicYear");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(`${API_URL}/api/get_servicetypeticket`, {
        headers: {
          Authorization: `Bearer ${token}`,
          // "X-Academic-Year": academicYr,
        },
        withCredentials: true,
      });
      console.log(
        "the data of service type ticket api inside the service type component",
        response.data.data
      );

      setSections(response.data.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

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

  const roleLabelMap = classes.reduce((acc, curr) => {
    acc[curr.value] = curr.label;
    return acc;
  }, {});

  // Filtering based on subject_type or name
  const searchLower = searchTerm.trim().toLowerCase();
  console.log("sections before filtered sections:", sections);
  const filteredSections = sections.filter((section) => {
    const serviceMatch = section?.service_name
      ?.toLowerCase()
      .includes(searchLower);
    const roleLabel = roleLabelMap[section?.role_id] || "";
    const roleMatch = roleLabel.toLowerCase().includes(searchLower);

    return serviceMatch || roleMatch;
  });

  // Update page count based on filtered results
  useEffect(() => {
    setPageCount(Math.ceil(filteredSections.length / pageSize));
  }, [filteredSections, pageSize]);

  // Paginate results
  const displayedSections = filteredSections.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  useEffect(() => {
    setPageCount(Math.ceil(filteredSections.length / pageSize));
  }, [filteredSections]);

  const validateSectionName = (name, departmentId) => {
    const errors = {};
    if (!name || name.trim() === "") {
      errors.name = "Please enter service type name.";
    } else if (name.length > 50) {
      errors.name = "The name field must not exceed 50 characters.";
    }
    if (!departmentId) {
      errors.role_id = "Please select role type.";
    }
    return errors;
  };

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const handleEdit = (section) => {
    setCurrentSection(section);
    console.log("this is edit ", section.service_name);
    console.log("sectionsID for subject", section.service_id);
    setNewSectionName(section.service_name);
    setClassName(section.service_name);
    setNewDepartmentId(section.role_id);
    setnewDescription(section.description);
    setRequiresAppointment(section.RequiresAppointment);
    setShowEditModal(true);
    console.log("Success in fetching the data");
  };

  const handleAdd = () => {
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setNewSectionName("");
    setNewDepartmentId("");
    setRequiresAppointment("N");
    setnewDescription("");
    setCurrentSection(null);
    setFieldErrors({});
    setNameError("");
  };

  const handleSubmitAdd = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const validationErrors = validateSectionName(
      newSectionName,
      newDepartmentId
    );
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No authentication token or academic year found");
      }

      await axios.post(
        `${API_URL}/api/save_servicetypeticket`,
        {
          servicename: newSectionName,
          role_id: newDepartmentId,
          description: description,
          requiresappointment: requiresAppointment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      fetchSections();
      handleCloseModal();
      toast.success("New service type created!");
    } catch (error) {
      console.error("Error adding subject:", error);
      if (error.response && error.response.data && error.response.data.errors) {
        Object.values(error.response.data.errors).forEach((err) =>
          toast.error(err)
        );
      } else {
        toast.error("Server error. Please try again later.");
      }
    } finally {
      setIsSubmitting(false); // Re-enable the button after the operation
    }
  };

  const handleSubmitEdit = async () => {
    if (isSubmitting) return; // Prevent re-submitting
    setIsSubmitting(true);
    const validationErrors = validateSectionName(
      newSectionName,
      newDepartmentId
    );
    if (Object.keys(validationErrors).length) {
      setFieldErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      // const academicYr = localStorage.getItem("academicYear");

      if (!token) {
        throw new Error("No authentication token or academic year found");
      }
      console.log("This is edit Form******");
      console.log("This is Edit data ID:", currentSection.sm_id);

      console.log("This is Edit data Name:", newSectionName);
      console.log("This is Edit data class_id:", newDepartmentId);

      console.log("current section", currentSection);
      await axios.put(
        `${API_URL}/api/update_servicetypeticket/${currentSection.service_id}`,
        {
          servicename: newSectionName,
          role_id: newDepartmentId,
          description: description,
          requiresappointment: requiresAppointment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // "X-Academic-Year": academicYr,
          },
          withCredentials: true,
        }
      );

      fetchSections();
      handleCloseModal();
      toast.success("Service type updated successfully!");
    } catch (error) {
      console.error("Error editing subject:", error);
      if (error.response && error.response.data.status === 422) {
        const errors = error.response.data.errors;
        console.log("error", errors);
        // Handle name field error
        if (errors.name) {
          setFieldErrors((prev) => ({
            ...prev,
            name: errors.name, // Show the first error message for the name field
          }));
          errors.name.forEach((err) => toast.error(err)); // Show all errors in toast
        }
      } else {
        toast.error("Server error. Please try again later.");
      }
    } finally {
      setIsSubmitting(false); // Re-enable the button after the operation
    }
  };

  const handleDelete = (id) => {
    console.log("the deleted subject id", id);
    const sectionToDelete = sections.find((sec) => sec.service_id === id);
    console.log("the deleted subject id for sectiontodelete", sectionToDelete);
    setCurrentSection(sectionToDelete);
    setShowDeleteModal(true);
  };

  const handleSubmitDelete = async () => {
    if (isSubmitting) return; // Prevent re-submitting
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");

      if (!token || !currentSection || !currentSection.service_id) {
        throw new Error("subject ID is missing");
      }
      console.log("delete this service_id", currentSection.service_id);
      const response = await axios.delete(
        `${API_URL}/api/delete_servicetypeticket/${currentSection.service_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      console.log(
        "The response of the delete api in the division module",
        response.data
      );
      if (response.data.success) {
        fetchSections();
        setShowDeleteModal(false);
        setCurrentSection(null);
        toast.success("Service type deleted!");
      } else {
        toast.error(response.data.message || "Failed to delete service type!");
      }
    } catch (error) {
      console.error("Error deleting Subject:", error);
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Server error. Please try again later.");
      }
    } finally {
      setIsSubmitting(false); // Re-enable the button after the operation
      setShowDeleteModal(false);
    }
  };

  const handleChangeSectionName = (e) => {
    const { value } = e.target;
    setNewSectionName(value);
    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      name: validateSectionName(value, newDepartmentId).name,
    }));
  };

  const handleChangeDepartmentId = (e) => {
    const { value } = e.target;
    console.log("Selected Department ID:", value);
    setNewDepartmentId(value);
    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      role_id: validateSectionName(newSectionName, value).role_id,
    }));
  };

  const handleChangeDescription = (e) => {
    const { value } = e.target;
    setClassName(value);
    console.log("Selected Department ID:", value);
    setnewDescription(value);
  };

  return (
    <>
      <ToastContainer />

      <div className="container mt-4">
        <div className="card mx-auto lg:w-3/4 shadow-lg">
          <div className="p-2 px-3 bg-gray-100 flex justify-between items-center">
            <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
              Service Type
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
            <div className="h-96 lg:h-96 w-full md:w-[80%] mx-auto w-overflow-y-scroll lg:overflow-x-hidden">
              <div className="bg-white rounded-lg shadow-xs">
                <table className="min-w-full leading-normal table-auto">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="px-2 w-full md:w-[10%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Sr.No
                      </th>
                      <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Name
                      </th>
                      <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Role
                      </th>
                      <th className="px-2 w-full md:w-[12%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Edit
                      </th>
                      <th className="px-2 w-full md:w-[12%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Delete
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
                      displayedSections.map((section, index) => (
                        <tr
                          key={section.section_id}
                          className={`${
                            index % 2 === 0 ? "bg-white" : "bg-gray-100"
                          } hover:bg-gray-50`}
                        >
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {currentPage * pageSize + index + 1}
                            </p>
                          </td>
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {section?.service_name}
                            </p>
                          </td>
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {section?.role_id === "A"
                                ? "Admin"
                                : section?.role_id === "F"
                                ? "Finance"
                                : section?.role_id === "M"
                                ? "Management"
                                : section?.role_id === "L"
                                ? "Librarian"
                                : section?.role_id === "T"
                                ? "Teacher"
                                : section?.role_id === "U"
                                ? "Ace Ventura"
                                : section?.role_id}
                            </p>
                          </td>
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <button
                              className="text-blue-600 hover:text-blue-800 hover:bg-transparent "
                              onClick={() => handleEdit(section)}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>{" "}
                          </td>
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <button
                              className="text-red-600 hover:text-red-800 hover:bg-transparent "
                              onClick={() => handleDelete(section.service_id)}
                            >
                              <FontAwesomeIcon icon={faTrash} />
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
            </div>
            <div className=" flex justify-center  pt-2 -mb-3">
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
                containerClassName={"pagination"}
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

        {/* Modal for adding a new section */}
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
                    <h5 className="modal-title">Create New Service</h5>
                    <RxCross1
                      className="float-end relative top-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
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
                    <div className=" relative mb-3 flex justify-center  mx-4">
                      <label htmlFor="sectionName" className="w-1/2 mt-2">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={30}
                        className="form-control shadow-md mb-2"
                        id="sectionName"
                        value={newSectionName}
                        onChange={handleChangeSectionName}
                      />{" "}
                      <div className="absolute top-9 left-1/3">
                        {!nameAvailable && (
                          <span className=" block text-danger text-xs">
                            {nameError}
                          </span>
                        )}
                        {fieldErrors.name && (
                          <small className="text-danger text-xs">
                            {fieldErrors.name}
                          </small>
                        )}
                      </div>
                    </div>
                    <div className=" relative mb-4 flex justify-center  mx-4">
                      <label htmlFor="departmentId" className="w-1/2 mt-2">
                        Role <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="departmentId"
                        className="form-control shadow-md"
                        value={newDepartmentId}
                        onChange={handleChangeDepartmentId}
                      >
                        <option value="">Select</option>
                        {classes.map((cls, index) => (
                          <option key={index} value={cls.value}>
                            {cls.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute top-9 left-1/3">
                        {fieldErrors.role_id && (
                          <span className="text-danger text-xs">
                            {fieldErrors.role_id}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className=" relative mb-4 flex justify-center  mx-4">
                      <label htmlFor="descriptionId" className="w-1/2 mt-2">
                        Description
                      </label>
                      <textarea
                        className="form-control shadow-md mb-2"
                        id="description"
                        maxLength={200}
                        value={description}
                        onChange={handleChangeDescription}
                      />{" "}
                    </div>

                    <div className="relative mb-4 mx-4 flex items-center">
                      <label
                        htmlFor="requiresAppointment"
                        className="w-70 text-right mr-4"
                      >
                        Requires Appointment
                      </label>
                      <input
                        id="requiresAppointment"
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-blue-600"
                        checked={requiresAppointment === "Y"}
                        onChange={(e) =>
                          setRequiresAppointment(e.target.checked ? "Y" : "N")
                        }
                      />
                    </div>
                  </div>
                  <div className=" flex justify-end p-3">
                    {/* <button type="button" className="btn btn-secondary me-2" onClick={handleCloseModal}>Cancel</button> */}
                    <button
                      type="button"
                      className="btn btn-primary px-3 mb-2"
                      style={{}}
                      onClick={handleSubmitAdd}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : "Add"}
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
                  <h5 className="modal-title">Edit Service Type</h5>
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
                  <div className=" relative mb-3 flex justify-center  mx-4">
                    <label htmlFor="editSectionName" className="w-1/2 mt-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={50}
                      className="form-control shadow-md mb-2"
                      id="editSectionName"
                      value={newSectionName}
                      onChange={handleChangeSectionName}
                    />
                    <div className="absolute top-9 left-1/3 ">
                      {!nameAvailable && (
                        <span className=" block text-danger text-xs">
                          {nameError}
                        </span>
                      )}
                      {fieldErrors.name && (
                        <span className="text-danger text-xs">
                          {fieldErrors.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className=" relative mb-4 flex justify-center  mx-4">
                    <label htmlFor="editDepartmentId" className="w-1/2 mt-2">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="editDepartmentId"
                      className="form-control shadow-md"
                      value={newDepartmentId}
                      onChange={handleChangeDepartmentId}
                    >
                      {console.log("the vlause of the class", className)}
                      <option value="">Select</option>
                      {classes.map((cls, index) => (
                        <option key={index} value={cls.value}>
                          {" "}
                          {cls.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute top-9 left-1/3">
                      {fieldErrors.role_id && (
                        <span className="text-danger text-xs">
                          {fieldErrors.role_id}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className=" relative mb-4 flex justify-center  mx-4">
                    <label htmlFor="descriptionId" className="w-1/2 mt-2">
                      Description
                    </label>
                    <textarea
                      className="form-control shadow-md mb-2"
                      id="description"
                      maxLength={200}
                      value={description}
                      onChange={handleChangeDescription}
                    />{" "}
                  </div>
                  <div className="relative mb-4 mx-4 flex items-center">
                    <label
                      htmlFor="requiresAppointment"
                      className="w-70 text-right mr-4"
                    >
                      Requires Appointment
                    </label>
                    <input
                      id="requiresAppointment"
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-blue-600"
                      checked={requiresAppointment === "Y"}
                      onChange={(e) =>
                        setRequiresAppointment(e.target.checked ? "Y" : "N")
                      }
                    />
                  </div>
                </div>

                <div className=" flex justify-end p-3">
                  <button
                    type="button"
                    className="btn btn-primary  px-3 mb-2"
                    style={{}}
                    onClick={handleSubmitEdit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Updating..." : "Update"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal for confirming deletion */}
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
                  <p>
                    Are you sure you want to delete Service type:{" "}
                    {currentSection?.service_name}?
                  </p>
                </div>
                <div className=" flex justify-end p-3">
                  {/* <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button> */}
                  <button
                    type="button"
                    className="btn btn-danger px-3 mb-2"
                    style={{}}
                    onClick={handleSubmitDelete}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Deleting..." : "Delete"}
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

export default ServiceType;
