import { useEffect, useState, useRef } from "react";
import axios from "axios";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faPlus,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RxCross1 } from "react-icons/rx";

function PeerFeedbackMaster() {
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
  const [controlType, setControlType] = useState("");

  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");

  const [options, setOptions] = useState([""]); // start with one option

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);

    if (fieldErrors.options) {
      setFieldErrors((prev) => ({ ...prev, options: undefined }));
    }
  };

  const handleAddOption = () => {
    setOptions((prev) => [...prev, ""]);
    if (fieldErrors.options)
      setFieldErrors((prev) => ({ ...prev, options: undefined }));
  };

  const handleRemoveOption = (index) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
    if (fieldErrors.options)
      setFieldErrors((prev) => ({ ...prev, options: undefined }));
  };

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
        `${API_URL}/api/get_peerfeedbackmaster`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      console.log("Peer Feedback", response.data.data);
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

  const searchLower = searchTerm.trim().toLowerCase();
  const filteredSections = sections.filter((section) => {
    const className = section?.classname?.toString().toLowerCase() || "";
    const parameterName = section?.parameter?.toLowerCase() || "";

    return (
      className.includes(searchLower) ||
      parameterName.includes(searchLower) ||
      parameterName
        .replace(/\s+/g, "")
        .includes(searchLower.replace(/\s+/g, ""))
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

  const reset = () => {
    setNewDepartmentId("");
    setNewSectionName("");
    setControlType(null);
    setSearchTerm(""); // ✅ clear search term
  };

  const validateSectionName = (
    parameter,
    classId,
    control_type,
    options = []
  ) => {
    const errors = {};

    if (!parameter || parameter.trim() === "") {
      errors.parameter = "Please enter parameter.";
    } else if (parameter.length > 500) {
      errors.parameter = "The name field must not exceed 500 characters.";
    }

    if (!classId) {
      errors.class_id = "Please select class.";
    }

    if (!control_type || control_type.trim() === "") {
      errors.control_type = "Please enter type.";
    }

    // ✅ Require at least one non-empty option for radio/checkbox
    if (control_type === "radio" || control_type === "checkbox") {
      const hasValidOption =
        Array.isArray(options) && options.some((o) => o && o.trim() !== "");
      if (!hasValidOption) {
        errors.options = "Please add option.";
      }
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
    setControlType(section.control_type);

    if (section.options) {
      try {
        const parsedOptions = JSON.parse(section.options); // because you saved it as JSON string
        const optionValues = parsedOptions.map((opt) => opt.value);
        setOptions(optionValues);
      } catch (e) {
        console.error("Error parsing options:", e);
        setOptions([]); // fallback
      }
    } else {
      setOptions([]);
    }

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
    setControlType("");
    setOptions([""]);
    setCurrentSection(null);
    setFieldErrors({});
    setNameError("");
  };

  const handleSubmitAdd = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const validationErrors = validateSectionName(
      newSectionName,
      newDepartmentId,
      controlType,
      options
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

      // 🔹 Prepare options array in required format
      const formattedOptions =
        (controlType === "radio" ||
          controlType === "checkbox" ||
          controlType === "rating") &&
        options.length > 0
          ? options.map((opt, idx) => ({
              option: opt.trim().replace(/\s+/g, ""), // short code (e.g., "1")
              value: opt.trim(), // full text (e.g., "1" or "Sports")
            }))
          : [];

      // 🔹 Final payload
      const payload = {
        parameter: newSectionName,
        class_id: Number(newDepartmentId),
        control_type: controlType,
        options: formattedOptions,
      };

      await axios.post(`${API_URL}/api/save_peerfeedbackmaster`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      fetchSections();
      handleCloseModal();
      toast.success("Peer Feedback Parameter added successfully!");
      reset();
    } catch (error) {
      console.error("Error adding parameter:", error);
      if (error.response?.data?.errors) {
        Object.values(error.response.data.errors).forEach((err) =>
          toast.error(err)
        );
      } else {
        toast.error("Server error. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (isSubmitting) return; // Prevent re-submitting
    setIsSubmitting(true);

    const validationErrors = validateSectionName(
      newSectionName,
      newDepartmentId,
      controlType,
      options
    );

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token || !currentSection || !currentSection.pfm_id) {
        throw new Error("No authentication token or section ID found");
      }

      const formattedOptions =
        (controlType === "radio" ||
          controlType === "checkbox" ||
          controlType === "rating") &&
        options.length > 0
          ? options.map((opt, idx) => ({
              option: opt.trim().replace(/\s+/g, ""), // short code (e.g., "1")
              value: opt.trim(), // full text (e.g., "1" or "Sports")
            }))
          : [];

      await axios.put(
        `${API_URL}/api/update_peerfeedbackmaster/${currentSection.pfm_id}`,
        {
          parameter: newSectionName,
          class_id: newDepartmentId,
          control_type: controlType,
          options: formattedOptions,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      fetchSections();
      handleCloseModal();
      toast.success("Peer Feedback Parameter updated successfully!");
    } catch (error) {
      console.error("Error editing parameter:", error);
      console.log("erroris", error.response);
      if (error.response && error.response.data.status === 422) {
        const errors = error.response.data.errors;
        if (errors.parameter) {
          setFieldErrors((prev) => ({
            ...prev,
            parameter: errors.parameter,
          }));
          errors.parameter.forEach((err) => toast.error(err));
        }
      } else {
        toast.error("Server error. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    const sectionToDelete = sections.find((sec) => sec.pfm_id === id);
    setCurrentSection(sectionToDelete);
    setShowDeleteModal(true);
  };

  const handleSubmitDelete = async () => {
    if (isSubmitting) return; // Prevent re-submitting
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");
      const academicYr = localStorage.getItem("academicYear");

      if (!token || !currentSection || !currentSection.pfm_id) {
        throw new Error("Division ID is missing");
      }

      const response = await axios.delete(
        `${API_URL}/api/delete_peerfeedbackmaster/${currentSection.pfm_id}`,
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
        toast.success("Peer Feedback Parameter deleted successfully!");
      } else {
        toast.error(response.data.message || "Failed to delete parameter");
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        toast.error(
          "Cannot Delete. This peer feedback paramter already use in peer feedback."
        );
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

    const errors = validateSectionName(value, newDepartmentId);
    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      parameter: errors.parameter,
    }));
  };

  const handleChangeDepartmentId = (e) => {
    const { value } = e.target;
    setClassName(value);
    setNewDepartmentId(value);

    const errors = validateSectionName(newSectionName, value);
    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      class_id: errors.class_id,
    }));
  };

  const handleChangeControlType = (e) => {
    const { value } = e.target;
    setNameError("");
    setControlType(value);

    // ✅ if new control type requires options, but options are empty, initialize
    if (
      (value === "radio" || value === "checkbox" || value === "rating") &&
      options.length === 0
    ) {
      setOptions([""]); // at least one empty option
    }

    // ✅ validate using the latest state + new control type value
    const errors = validateSectionName(newSectionName, newDepartmentId, value);

    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      control_type: errors.control_type || "", // clear error if valid
    }));
  };
  const controlOptions = [
    { value: "radio", label: "Radio Button" },
    { value: "checkbox", label: "Checkbox" },
    { value: "text", label: "Text Box" },
    { value: "textarea", label: "Text Area" },
    { value: "rating", label: "Rating" },
  ];

  return (
    <>
      <ToastContainer />

      <div className="container  mt-4">
        <div className="card mx-auto lg:w-[70%] shadow-lg">
          <div className="p-2 px-3 bg-gray-100 flex justify-between items-center">
            <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
              Peer Feedback Parameter
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
                            key={section.pfm_id}
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
                            <td className="text-center px-2 border border-gray-950 text-sm">
                              <p className="text-gray-900 whitespace-no-wrap relative top-2">
                                {section.parameter}
                              </p>
                            </td>

                            {roleId !== "M" && (
                              <>
                                <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                                  <button
                                    className="text-blue-600 hover:text-blue-800 hover:bg-transparent"
                                    onClick={() => handleEdit(section)}
                                  >
                                    <FontAwesomeIcon icon={faEdit} />
                                  </button>
                                </td>

                                <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                                  <button
                                    className="text-red-600 hover:text-red-800 hover:bg-transparent"
                                    onClick={() => handleDelete(section.pfm_id)}
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </button>
                                </td>
                              </>
                            )}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="6"
                            className="text-center text-xl text-red-700 py-10"
                          >
                            Oops! No data found..
                          </td>
                        </tr>
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
                      Create Peer Feedback Parameter
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
                    {/* Class Selection */}
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

                    {/* Parameter */}
                    <div className=" relative mb-3 flex justify-center  mx-4">
                      <label htmlFor="sectionName" className="w-1/2 mt-2">
                        Parameter <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={500}
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

                    {/* Control Type */}
                    <div className=" relative mb-3 flex justify-center  mx-4">
                      <label htmlFor="controlType" className="w-1/2 mt-2">
                        Control Type <span className="text-red-500">*</span>
                      </label>

                      <select
                        id="controlType"
                        className="form-control shadow-md"
                        value={controlType}
                        onChange={handleChangeControlType}
                      >
                        <option value="">Select</option>
                        {controlOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>

                      <div className="absolute top-9 left-1/3">
                        {fieldErrors.control_type && (
                          <span className="text-danger text-xs">
                            {fieldErrors.control_type}
                          </span>
                        )}
                      </div>
                    </div>

                    {(controlType === "radio" ||
                      controlType === "checkbox" ||
                      controlType === "rating") && (
                      <div className="relative mb-3 flex justify-center mx-4">
                        <label className="w-1/2 mt-2">
                          Options <span className="text-red-500">*</span>
                        </label>

                        <div className="flex flex-col w-full">
                          {options.map((opt, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 mb-2"
                            >
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) =>
                                  handleOptionChange(index, e.target.value)
                                }
                                className="form-control shadow-md flex-1"
                                placeholder={`Option ${index + 1}`}
                              />

                              <button
                                type="button"
                                className="text-green-600 font-bold text-lg"
                                onClick={handleAddOption}
                              >
                                <FontAwesomeIcon icon={faPlus} />
                              </button>

                              {options.length > 1 && (
                                <button
                                  type="button"
                                  className="text-red-600 font-bold text-lg"
                                  onClick={() => handleRemoveOption(index)}
                                >
                                  <FontAwesomeIcon icon={faXmark} />
                                </button>
                              )}
                            </div>
                          ))}

                          {/* <-- show error always (even if options = []) */}
                          {fieldErrors.options && (
                            <span className="text-danger text-xs mt-1">
                              {fieldErrors.options}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className=" flex justify-end p-3">
                    <button
                      type="button"
                      className="btn btn-primary px-3 mb-2 mr-2"
                      style={{}}
                      onClick={handleSubmitAdd}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger px-3 mb-2 mr-2"
                      style={{}}
                      onClick={reset}
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      className="btn btn-warning px-3 mb-2 text-white "
                      style={{}}
                      onClick={handleCloseModal}
                    >
                      Back
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
                  <h5 className="modal-title">Edit Peer Feedback Parameter</h5>
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
                  {/* Class Selection */}
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

                  {/* Parameter */}
                  <div className=" relative mb-3 flex justify-center  mx-4">
                    <label htmlFor="sectionName" className="w-1/2 mt-2">
                      Parameter <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={500}
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

                  {/* Control Type */}
                  <div className=" relative mb-3 flex justify-center  mx-4">
                    <label htmlFor="controlType" className="w-1/2 mt-2">
                      Control Type <span className="text-red-500">*</span>
                    </label>

                    <select
                      id="controlType"
                      className="form-control shadow-md"
                      value={controlType}
                      onChange={handleChangeControlType}
                    >
                      <option value="">Select</option>
                      {controlOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>

                    <div className="absolute top-9 left-1/3">
                      {fieldErrors.control_type && (
                        <span className="text-danger text-xs">
                          {fieldErrors.control_type}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* {(controlType === "radio" || controlType === "checkbox") && (
                    <div className="relative mb-3 flex justify-center mx-4">
                      <label className="w-1/2 mt-2">
                        Options <span className="text-red-500">*</span>
                      </label>

                      <div className="flex flex-col w-full">
                        {options.map((opt, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 mb-2"
                          >
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) =>
                                handleOptionChange(index, e.target.value)
                              }
                              className="form-control shadow-md flex-1"
                              placeholder={`Option ${index + 1}`}
                            />

                            <button
                              type="button"
                              className="text-green-600 font-bold text-lg"
                              onClick={handleAddOption}
                            >
                              <FontAwesomeIcon icon={faPlus} />
                            </button>

                            {options.length > 1 && (
                              <button
                                type="button"
                                className="text-red-600 font-bold text-lg"
                                onClick={() => handleRemoveOption(index)}
                              >
                                <FontAwesomeIcon icon={faXmark} />
                              </button>
                            )}
                          </div>
                        ))}

                        {fieldErrors.options && (
                          <span className="text-danger text-xs mt-1">
                            {fieldErrors.options}
                          </span>
                        )}
                      </div>
                    </div>
                  )} */}
                  {(controlType === "radio" ||
                    controlType === "checkbox" ||
                    controlType === "rating") && (
                    <div className="relative mb-3 flex justify-center mx-4">
                      <label className="w-1/2 mt-2">
                        Options <span className="text-red-500">*</span>
                      </label>

                      <div className="flex flex-col w-full">
                        {options.map((opt, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 mb-2"
                          >
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) =>
                                handleOptionChange(index, e.target.value)
                              }
                              className="form-control shadow-md flex-1"
                              placeholder={`Option ${index + 1}`}
                            />

                            <button
                              type="button"
                              className="text-green-600 font-bold text-lg"
                              onClick={handleAddOption}
                            >
                              <FontAwesomeIcon icon={faPlus} />
                            </button>

                            {options.length > 1 && (
                              <button
                                type="button"
                                className="text-red-600 font-bold text-lg"
                                onClick={() => handleRemoveOption(index)}
                              >
                                <FontAwesomeIcon icon={faXmark} />
                              </button>
                            )}
                          </div>
                        ))}

                        {fieldErrors.options && (
                          <span className="text-danger text-xs mt-1">
                            {fieldErrors.options}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className=" flex justify-end p-3">
                  <button
                    type="button"
                    className="btn btn-primary px-3 mb-2 mr-2"
                    style={{}}
                    onClick={handleSubmitEdit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Updating..." : "Update"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-warning px-3 mb-2 text-white "
                    style={{}}
                    onClick={handleCloseModal}
                  >
                    Back
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
                    Are you sure you want to delete Peer Feedback Parameter for{" "}
                    {currentSection.classname} : {currentSection.parameter} ?
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

export default PeerFeedbackMaster;
