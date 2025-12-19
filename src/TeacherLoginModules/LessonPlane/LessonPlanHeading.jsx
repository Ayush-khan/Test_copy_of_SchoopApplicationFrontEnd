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
  const [newSequenceName, setNewSequenceName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [newDepartmentId, setNewDepartmentId] = useState("");
  const [fieldErrors, setFieldErrors] = useState({}); // For field-specific errors
  const [nameError, setNameError] = useState("");
  const [nameAvailable, setNameAvailable] = useState(true);
  const [requiresAppointment, setRequiresAppointment] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");

  const pageSize = 10;

  const fetchSections = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        `${API_URL}/api/get_lesson_plan_heading`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      console.log("reaponse", response.data.data);
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

  useEffect(() => {
    if (currentSection) {
      setNewSectionName(currentSection.name || "");
      setNewSequenceName(currentSection.sequence || "");

      const dailyValue =
        currentSection.change_daily || currentSection.change_daily || "";

      setRequiresAppointment(dailyValue === "Y" ? "Y" : "");

      console.log("Fetched section:", currentSection);
    }
  }, [currentSection]);

  // Filtering based on subject_type or name
  const searchLower = searchTerm.trim().toLowerCase();

  const filteredSections = sections.filter((section) => {
    const serviceMatch = section?.name?.toLowerCase().includes(searchLower);

    return serviceMatch;
  });

  // const filteredSections = [sections].filter((section) => {
  //   const serviceMatch = section?.service_name
  //     ?.toLowerCase()
  //     .includes(searchLower);
  //   const roleLabel = roleLabelMap[section?.role_id] || "";
  //   const roleMatch = roleLabel.toLowerCase().includes(searchLower);

  //   return serviceMatch || roleMatch;
  // });

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

  const validateSectionName = (name, sequence) => {
    const errors = {};
    if (!name || name.trim() === "") {
      errors.name = "Please enter lesson plan heading name.";
    }
    // else if (name.length > 50) {
    //   errors.name = "The name field must not exceed 50 characters.";
    // }
    if (!sequence) {
      errors.sequence = "Please enter sequence.";
    } else if (!/^\d+$/.test(sequence)) {
      errors.sequence = "Sequence must contain numbers only.";
    }
    return errors;
  };

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const handleEdit = (section) => {
    setCurrentSection(section);
    console.log("this is edit ", section.name);
    console.log("sectionsID for subject", section.lesson_plan_headings_id);
    setNewSectionName(section.name);
    setNewSequenceName(section.sequence);
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
    setRequiresAppointment("");
    setCurrentSection(null);
    setFieldErrors({});
    setNameError("");
    setNewSequenceName("");
  };

  const handleSubmitAdd = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const validationErrors = validateSectionName(
      newSectionName,
      newSequenceName
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

      const formData = new FormData();
      formData.append("name", newSectionName);
      formData.append("sequence", newSequenceName); // check backend spelling if 'squence'
      formData.append("change_daily", requiresAppointment);

      const response = await axios.post(
        `${API_URL}/api/save_lessonplanheading`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (response.data?.status === 400) {
        toast.error(response.data.message || "Something went wrong!");
        setIsSubmitting(false);
        return; // stop further execution
      }

      fetchSections();
      handleCloseModal();
      toast.success("Lesson Plan Heading created successfully!");
    } catch (error) {
      console.error("Error adding lesson plan heading:", error);
      toast.error("Server error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (isSubmitting) return; // Prevent re-submitting
    setIsSubmitting(true);

    // Validate before submitting
    const validationErrors = validateSectionName(
      newSectionName,
      newSequenceName
    );
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      // Send JSON body
      const response = await axios.put(
        `${API_URL}/api/update_lesson_plan_heading/${currentSection.lesson_plan_headings_id}`,
        {
          name: newSectionName,
          sequence: newSequenceName,
          change_daily: requiresAppointment, // match backend field
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      // Check for custom 400 in response body
      if (response.data?.status === 400) {
        toast.error(
          response.data.message || "Lesson plan heading already exists!"
        );
        setIsSubmitting(false);
        return;
      }

      // Success
      toast.success("Lesson Plan Heading updated successfully!");
      fetchSections();
      handleCloseModal();
    } catch (error) {
      console.error("Error updating lesson plan heading:", error);

      // Handle 422 validation errors
      if (error.response?.status === 422 && error.response.data.errors) {
        const errors = error.response.data.errors;
        Object.values(errors).forEach((err) => toast.error(err));
        if (errors.name) {
          setFieldErrors((prev) => ({ ...prev, name: errors.name }));
        }
        if (errors.sequence) {
          setFieldErrors((prev) => ({ ...prev, sequence: errors.sequence }));
        }
      }
      // Handle backend 400 inside response body
      else if (error.response?.data?.status === 400) {
        toast.error(
          error.response.data.message || "Lesson plan heading already exists!"
        );
      } else {
        toast.error("Server error. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    console.log("the deleted lesson plan heading id", id);
    const sectionToDelete = sections.find(
      (sec) => sec.lesson_plan_headings_id === id
    );
    console.log("the deleted lesson plan heading id", sectionToDelete);
    setCurrentSection(sectionToDelete);
    setShowDeleteModal(true);
  };

  const handleSubmitDelete = async () => {
    if (isSubmitting) return; // Prevent re-submitting
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");

      if (
        !token ||
        !currentSection ||
        !currentSection.lesson_plan_headings_id
      ) {
        throw new Error("lesson plan heading is missing");
      }
      console.log(
        "delete this service_id",
        currentSection.lesson_plan_headings_id
      );
      const response = await axios.delete(
        `${API_URL}/api/delete_lesson_plan_heading/${currentSection.lesson_plan_headings_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      if (response.data.success) {
        fetchSections();
        setShowDeleteModal(false);
        setCurrentSection(null);
        toast.success("Lesson Plan Heading deleted!");
      } else {
        toast.error(
          response.data.message || "Failed to delete lesson plan heading!"
        );
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

  const handleReset = () => {
    // Clear input fields
    setNewSectionName("");
    setNewSequenceName("");
    setRequiresAppointment("N"); // reset checkbox to unchecked

    // Clear validation errors
    setFieldErrors({});
  };

  const handleChangeSectionName = (e) => {
    let { value } = e.target;

    value = value.replace(/[^a-zA-Z ]/g, "");

    setNewSectionName(value);

    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      name: validateSectionName(value, newDepartmentId).name,
    }));
  };

  const handleSequenceChange = (e) => {
    const { value } = e.target;
    console.log("Selected Department ID:", value);
    setNewSequenceName(value);
    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      sequence: validateSectionName(newSectionName, value).sequence,
    }));
  };

  return (
    <>
      <ToastContainer />

      <div className="container mt-4">
        <div className="card mx-auto lg:w-3/4 shadow-lg">
          <div className="p-2 px-3 bg-gray-100 flex justify-between items-center">
            <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
              Lesson Plan Headings
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
                        Sequence
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
                          key={section.lesson_plan_headings_id}
                          className={`${index % 2 === 0 ? "bg-white" : "bg-gray-100"
                            } hover:bg-gray-50`}
                        >
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {currentPage * pageSize + index + 1}
                            </p>
                          </td>
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {section?.name}
                            </p>
                          </td>
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {section.sequence}
                            </p>
                          </td>
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            {section.edit === "Y" && (
                              <button
                                className="text-blue-600 hover:text-blue-800 hover:bg-transparent "
                                onClick={() => handleEdit(section)}
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                            )}
                          </td>
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            {section.delete === "Y" && (
                              <button
                                className="text-red-600 hover:text-red-800 hover:bg-transparent "
                                onClick={() =>
                                  handleDelete(section.lesson_plan_headings_id)
                                }
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            )}
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
            <div className=" flex justify-center  pt-2 md:-mb-3">
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
                    <h5 className="modal-title">Create Lesson Plan Heading</h5>
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
                    <div className=" relative mb-3 flex justify-center  mx-2">
                      <label htmlFor="sectionName" className="w-[70%] mt-2">
                        Lesson Plan Heading
                        <span className="text-red-500">*</span>
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
                          <small className="text-danger text-xs ml-7">
                            {fieldErrors.name}
                          </small>
                        )}
                      </div>
                    </div>
                    <div className=" relative mb-4 flex justify-center  mx-2">
                      <label htmlFor="sequenceName" className="w-[70%] mt-2">
                        Sequence <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={2}
                        inputMode="numeric"
                        className="form-control shadow-md mb-2"
                        id="sequenceName"
                        value={newSequenceName}
                        onChange={handleSequenceChange}
                      />{" "}
                      <div className="absolute top-9 left-1/3">
                        {!nameAvailable && (
                          <span className=" block text-danger text-xs">
                            {nameError}
                          </span>
                        )}
                        {fieldErrors.sequence && (
                          <small className="text-danger text-xs ml-7">
                            {fieldErrors.sequence}
                          </small>
                        )}
                      </div>
                    </div>

                    <div className="relative mx-2 flex items-center">
                      <label
                        htmlFor="requiresAppointment"
                        className="w-70 text-right mr-20"
                      >
                        Daily Changes
                      </label>
                      <input
                        id="requiresAppointment"
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-blue-600"
                        checked={requiresAppointment === "Y"}
                        onChange={(e) =>
                          setRequiresAppointment(e.target.checked ? "Y" : "")
                        }
                      />
                    </div>
                  </div>
                  <div className=" flex justify-end p-3">
                    <button
                      type="button"
                      className="btn btn-primary px-3 mb-2 mr-2"
                      style={{}}
                      onClick={handleSubmitAdd}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : "Add"}
                    </button>

                    <button
                      type="button"
                      className="btn btn-danger  px-3 mb-2"
                      style={{}}
                      onClick={() => handleReset()}
                    >
                      Reset
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
                  <h5 className="modal-title">Edit Lesson Plan Heading</h5>
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
                  <div className=" relative mb-3 flex justify-center  mx-2">
                    <label htmlFor="sectionName" className="w-[70%] mt-2">
                      Lesson Plan Heading
                      <span className="text-red-500">*</span>
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
                        <small className="text-danger text-xs ml-7">
                          {fieldErrors.name}
                        </small>
                      )}
                    </div>
                  </div>
                  <div className=" relative mb-4 flex justify-center  mx-2">
                    <label htmlFor="sequenceName" className="w-[70%] mt-2">
                      Sequence <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={2}
                      className="form-control shadow-md mb-2"
                      id="sequenceName"
                      value={newSequenceName}
                      onChange={handleSequenceChange}
                    />{" "}
                    <div className="absolute top-9 left-1/3">
                      {!nameAvailable && (
                        <span className=" block text-danger text-xs ml-7">
                          {nameError}
                        </span>
                      )}
                      {fieldErrors.sequence && (
                        <small className="text-danger text-xs ml-7">
                          {fieldErrors.sequence}
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="relative mx-2 flex items-center">
                    <label
                      htmlFor="requiresAppointment"
                      className="w-70 text-right mr-20"
                    >
                      Daily Changes
                    </label>
                    <input
                      id="requiresAppointment"
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-blue-600"
                      checked={requiresAppointment === "Y"}
                      onChange={(e) =>
                        setRequiresAppointment(e.target.checked ? "Y" : "")
                      }
                    />
                  </div>
                </div>

                <div className=" flex justify-end p-3">
                  <button
                    type="button"
                    className="btn btn-primary  px-3 mb-2 mr-2"
                    style={{}}
                    onClick={handleSubmitEdit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Updating..." : "Update"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger  px-3 mb-2"
                    style={{}}
                    onClick={() => handleReset()}
                  >
                    Reset
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
                    Are you sure you want to delete Lesson Plan Heading:{" "}
                    {currentSection?.name}?
                  </p>
                </div>
                <div className=" flex justify-end p-3">
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
