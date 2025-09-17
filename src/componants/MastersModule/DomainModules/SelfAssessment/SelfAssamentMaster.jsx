import { useEffect, useState, useRef } from "react";
import axios from "axios";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RxCross1 } from "react-icons/rx";

// The is the divisionlist module
function SelfAssessmentMaster() {
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
  const [nameAvailable, setNameAvailable] = useState(true);
  const [roleId, setRoleId] = useState("");
  const [classes, setClasses] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");

  useEffect(() => {
    const fetchClassNames = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          `${API_URL}/api/get_class_for_division`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (Array.isArray(response.data)) {
          setClasses(response.data);
        } else {
          setError("Unexpected data format");
        }
      } catch (error) {
        console.error("Error fetching class names:", error);
      }
    };

    fetchClassNames();
  }, []);

  const pageSize = 10;

  const fetchSections = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        `${API_URL}/api/get_selfassessmentmaster`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      console.log("self assessment", response.data.data);
      setSections(response.data.data);
      setPageCount(Math.ceil(response.data.length / pageSize));
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

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
      console.log("roleIDis:", roleId);
      // Fetch academic year data
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchSections();
    fetchDataRoleId();
  }, []);

  useEffect(() => {
    const trimmedSearch = searchTerm.trim().toLowerCase();

    if (trimmedSearch !== "" && prevSearchTermRef.current === "") {
      previousPageRef.current = currentPage; // save page before search
      setCurrentPage(0); // jump to first page for search
    }

    if (trimmedSearch === "" && prevSearchTermRef.current !== "") {
      setCurrentPage(previousPageRef.current); // restore page after clearing search
    }

    prevSearchTermRef.current = trimmedSearch;
  }, [searchTerm]);

  // Filtering by class name or division name
  const searchLower = searchTerm.trim().toLowerCase();
  const filteredSections = sections.filter((section) => {
    const className = section?.classname || "";
    const parameter = section?.paramter || ""; // typo? maybe "parameter"?

    return (
      className.toLowerCase().includes(searchLower) ||
      parameter.toLowerCase().includes(searchLower)
    );
  });

  console.log("filtered scetions", filteredSections);

  useEffect(() => {
    setPageCount(Math.ceil(filteredSections.length / pageSize));
  }, [filteredSections, pageSize]);

  // Paginate filtered results
  const displayedSections = filteredSections.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  console.log("displayed sections", displayedSections);

  const validateSectionName = (parameter, classId) => {
    const errors = {};

    console.log("parameter", parameter);

    if (!parameter || parameter.trim() === "") {
      errors.parameter = "Please enter parameter.";
    }
    // else if (parameter.length > 30) {
    //   errors.parameter = "The name field must not exceed 30 character.";
    // }

    if (!classId) {
      errors.class_id = "Please select class.";
    }

    return errors;
  };

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const handleEdit = (section) => {
    setCurrentSection(section);
    setNewSectionName(section.parameter);
    setClassName(section.class_id);
    setNewDepartmentId(section.class_id);
    setShowEditModal(true);
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
        throw new Error("No authentication token found");
      }

      const formData = new FormData();
      formData.append("parameter", newSectionName);
      formData.append("class_id", newDepartmentId);

      await axios.post(`${API_URL}/api/save_selfassessmentmaster`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      fetchSections();
      handleCloseModal();
      toast.success("Self Assesssment Parameter added successfully!");
    } catch (error) {
      console.error("Error adding parameter:", error);
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
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token || !currentSection || !currentSection.sam_id) {
        throw new Error("No authentication token or section ID found");
      }

      await axios.put(
        `${API_URL}/api/update_selfassessmentmaster/${currentSection.sam_id}`,
        { parameter: newSectionName, class_id: newDepartmentId },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      fetchSections();
      handleCloseModal();
      toast.success("Self Assessment Parameter updated successfully!");
    } catch (error) {
      console.error("Error editing parametr:", error);
      console.log("erroris", error.response);
      if (error.response && error.response.data.status === 422) {
        const errors = error.response.data.errors;
        console.log("error", errors);
        // Handle name field error
        if (errors.parameter) {
          setFieldErrors((prev) => ({
            ...prev,
            parameter: errors.parameter, // Show the first error message for the name field
          }));
          errors.parameter.forEach((err) => toast.error(err)); // Show all errors in toast
        }
      } else {
        // Handle other errors
        toast.error("Server error. Please try again later.");
      }
    } finally {
      setIsSubmitting(false); // Re-enable the button after the operation
    }
  };

  const handleDelete = (id) => {
    const sectionToDelete = sections.find((sec) => sec.sam_id === id);
    setCurrentSection(sectionToDelete);
    setShowDeleteModal(true);
  };

  const handleSubmitDelete = async () => {
    if (isSubmitting) return; // Prevent re-submitting
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");
      const academicYr = localStorage.getItem("academicYear");

      if (!token || !currentSection || !currentSection.sam_id) {
        throw new Error("Division ID is missing");
      }

      const response = await axios.delete(
        `${API_URL}/api/delete_selfassessmentmaster/${currentSection.sam_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Academic-Year": academicYr,
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        fetchSections();
        setShowDeleteModal(false);
        setCurrentSection(null);
        toast.success("Self Assessment Parameter deleted successfully!");
      } else {
        toast.error(response.data.message || "Failed to delete parameter");
      }
    } catch (error) {
      if (error.response && error.response.status === 422) {
        toast.error("This parameter is used in self-assessment");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
      setShowDeleteModal(false);
    }
  };

  const handleChangeSectionName = (e) => {
    const { value } = e.target;
    setNameError("");
    setNewSectionName(value);
    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      parameter: validateSectionName(value, newDepartmentId).parameter,
    }));
  };

  const handleChangeDepartmentId = (e) => {
    const { value } = e.target;
    setClassName(value);
    setNewDepartmentId(value);
    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      class_id: validateSectionName(newSectionName, e.target.value).class_id,
    }));
  };

  return (
    <>
      <ToastContainer />

      <div className="container  mt-4">
        <div className="card mx-auto lg:w-[70%] shadow-lg">
          <div className="p-2 px-3 bg-gray-100 flex justify-between items-center">
            <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
              Self Assessment Parameters
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

              {roleId !== "M" ? (
                loading ? ( // Replace isLoading with your actual loading flag
                  <div className="h-9 w-20 bg-gray-300 animate-pulse rounded-sm"></div>
                ) : (
                  <button
                    className="btn btn-primary btn-sm md:h-9 text-xs md:text-sm"
                    onClick={handleAdd}
                  >
                    <FontAwesomeIcon
                      icon={faPlus}
                      style={{ marginRight: "5px" }}
                    />
                    Add
                  </button>
                )
              ) : null}
            </div>
          </div>
          <div
            className=" relative w-[97%]   mb-3 h-1  mx-auto bg-red-700"
            style={{
              backgroundColor: "#C03078",
            }}
          ></div>

          <div className="card-body w-full">
            <div
              className={`h-96 lg:h-96 overflow-y-scroll lg:overflow-x-hidden mx-auto ${
                roleId === "M" ? "w-full md:w-[55%]" : "w-full md:w-[84%]"
              }`}
            >
              <div className="bg-white  rounded-lg shadow-xs ">
                {!roleId ? (
                  <div className="flex justify-center items-center w-full h-[50vh]">
                    <div className="text-xl text-blue-700 text-center">
                      Please wait while data is loading...
                    </div>
                  </div>
                ) : loading ? (
                  <div className="flex justify-center items-center w-full h-[50vh]">
                    <div className="text-xl text-blue-700 text-center">
                      Please wait while data is loading...
                    </div>
                  </div>
                ) : (
                  <table className="min-w-full leading-normal table-auto ">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="px-2 w-full md:w-[12%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          Sr.No
                        </th>
                        <th className=" -px-2  w-full md:w-[25%] text-center py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          Class
                        </th>
                        <th className="px-2 text-center lg:px-5 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          Parameter
                        </th>
                        {roleId !== "M" && (
                          <>
                            <th className="px-2 w-full md:w-[10%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Edit
                            </th>
                            <th className="px-2 w-full md:w-[10%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Delete
                            </th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td
                            colSpan="6"
                            className="text-center text-blue-700 text-xl py-10"
                          >
                            Please wait while data is loading...
                          </td>
                        </tr>
                      ) : displayedSections.length ? (
                        displayedSections.map((section, index) => (
                          <tr
                            key={section.sam_id}
                            className={`${
                              index % 2 === 0 ? "bg-white" : "bg-gray-100"
                            } hover:bg-gray-50`}
                          >
                            <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                              <p className="text-gray-900 whitespace-no-wrap relative top-2">
                                {currentPage * pageSize + index + 1}
                              </p>
                            </td>
                            <td className="text-center px-2 lg:px-5 border border-gray-950 text-sm">
                              <p className="text-gray-900 whitespace-no-wrap relative top-2">
                                {section?.classname}
                              </p>
                            </td>
                            <td className="text-center px-2  border border-gray-950 text-sm">
                              <p className="text-gray-900 whitespace-no-wrap relative top-2">
                                {section.parameter}
                              </p>
                            </td>
                            {roleId !== "M" && (
                              <>
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
                                    onClick={() => handleDelete(section.sam_id)}
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </button>
                                </td>
                              </>
                            )}
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
                )}
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
                    <h5 className="modal-title">
                      Create Self Assessment Parameter
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
                    <div className=" relative mb-4 flex justify-center  mx-4">
                      <label htmlFor="departmentId" className="w-1/2 mt-2">
                        Class <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="departmentId"
                        className="form-control shadow-md"
                        value={newDepartmentId}
                        onChange={handleChangeDepartmentId}
                      >
                        <option value="">Select </option>

                        {classes.length === 0 ? (
                          <option value="">No classes available</option>
                        ) : (
                          classes.map((cls) => (
                            <option
                              key={cls.class_id}
                              value={cls.class_id}
                              className="max-h-20 overflow-y-scroll "
                            >
                              {cls.name}
                            </option>
                          ))
                        )}
                      </select>
                      <div className="absolute top-9 left-1/3">
                        {fieldErrors.class_id && (
                          <span className="text-danger text-xs">
                            {fieldErrors.class_id}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className=" relative mb-3 flex justify-center  mx-4">
                      <label htmlFor="sectionName" className="w-1/2 mt-2">
                        Parameter <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={100}
                        className="form-control shadow-md mb-2"
                        id="sectionName"
                        value={newSectionName}
                        onChange={handleChangeSectionName}
                      />
                      <div className="absolute top-9 left-1/3">
                        {!nameAvailable && (
                          <span className=" block text-danger text-xs">
                            {nameError}
                          </span>
                        )}
                        {fieldErrors.parameter && (
                          <span className="text-danger text-xs">
                            {fieldErrors.parameter}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className=" flex justify-end p-3">
                    <button
                      type="button"
                      className="btn btn-primary px-3 mb-2 "
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
                  <h5 className="modal-title">
                    Edit Self Assessment Parameter
                  </h5>
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
                  <div className=" relative mb-4 flex justify-center  mx-4">
                    <label htmlFor="editDepartmentId" className="w-1/2 mt-2">
                      Class <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="editDepartmentId"
                      className="form-control shadow-md"
                      value={className}
                      onChange={handleChangeDepartmentId}
                    >
                      <option value="">Select</option>
                      {console.log("the classes", classes)}
                      {classes.length === 0 ? (
                        <option value="">No classes available</option>
                      ) : (
                        classes.map((cls) => (
                          <option key={cls.class_id} value={cls.class_id}>
                            {cls.name}
                          </option>
                        ))
                      )}
                    </select>
                    <div className="absolute top-9 left-1/3">
                      {fieldErrors.class_id && (
                        <span className="text-danger text-xs">
                          {fieldErrors.class_id}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className=" relative mb-3 flex justify-center  mx-4">
                    <label htmlFor="editSectionName" className="w-1/2 mt-2">
                      Parameter <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={100}
                      className="form-control shadow-md mb-2"
                      id="editSectionName"
                      value={newSectionName}
                      onChange={handleChangeSectionName}
                      // onBlur={handleBlur}
                    />
                    <div className="absolute top-9 left-1/3 ">
                      {!nameAvailable && (
                        <span className=" block text-red-500 text-xs">
                          {nameError}
                        </span>
                      )}

                      {fieldErrors.parameter && (
                        <span className="text-danger text-xs">
                          {fieldErrors.parameter}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className=" flex justify-end p-3">
                  <button
                    type="button"
                    className="btn btn-primary px-3 mb-2 "
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
                    Are you sure you want to delete Self Assesssment Parameter
                    for {currentSection.classname} : {currentSection.parameter}{" "}
                    ?
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

export default SelfAssessmentMaster;
