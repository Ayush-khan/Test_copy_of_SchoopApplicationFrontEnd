import { useEffect, useState, useRef } from "react";
import axios from "axios";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RxCross1 } from "react-icons/rx";

function StationeryRequisition() {
  const API_URL = import.meta.env.VITE_API_URL; // URL for host
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const [newSectionName, setNewSectionName] = useState("");
  const [description, setDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [className, setClassName] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [newDepartmentId, setNewDepartmentId] = useState("");
  const [fieldErrors, setFieldErrors] = useState({}); // For field-specific errors
  const [nameError, setNameError] = useState("");
  const [nameAvailable, setNameAvailable] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [session, setSession] = useState("");
  const [regId, setRegId] = useState(null);
  const [roleId, setRoleId] = useState(null);
  const [stationeryType, setStationeryType] = useState([]);

  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");

  const pageSize = 10;

  useEffect(() => {
    fetchsessionData();
  }, []);

  useEffect(() => {
    if (regId && roleId) {
      fetchSections();
    }
  }, [regId, roleId]);

  const fetchsessionData = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(`${API_URL}/api/sessionData`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      //   console.log("session data", response.data);
      setRegId(response?.data?.user?.reg_id);
      setRoleId(response?.data?.user?.role_id);

      //   console.log("response?.data?.user?.reg_id", response?.data?.user?.reg_id);
      setSession(response.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        `${API_URL}/api/get_stationery_req?staff_id=${regId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        },
      );

      //   console.log("Stationery Requisition data", response.data.data);
      setSections(response.data.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStationeryType();
  }, []);

  const fetchStationeryType = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) throw new Error("No authentication token found");

      const response = await axios.get(`${API_URL}/api/get_stationery`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      //   console.log("response", response.data);

      setStationeryType(response.data.data || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStationeryName = (id) => {
    const item = stationeryType.find((s) => s.stationery_id === id);
    return item ? item.name : "";
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

  const statusMap = {
    A: "Apply",
    H: "Hold",
    P: "Approve",
    R: "Reject",
  };

  // const filteredSections = (sections || []).filter((section) => {
  //   const searchLower = searchTerm.toLowerCase(); // assuming this is defined

  //   const serviceMatch = section?.title
  //     ?.trim()
  //     .toLowerCase()
  //     .includes(searchLower);

  //   const roleLabel = statusMap[section?.status] || "";
  //   const roleMatch = roleLabel.toLowerCase().includes(searchLower);
  //   const startdate = section?.date
  //     ?.toString()
  //     .toLowerCase()
  //     .includes(searchLower);

  //   const quantity = section?.quantity
  //     ?.toString()
  //     .toLowerCase()
  //     .includes(searchLower);

  //   const author = section?.author?.trim().toLowerCase().includes(searchLower);
  //   const publisher = section?.publisher
  //     ?.trim()
  //     .toLowerCase()
  //     .includes(searchLower);

  //   return (
  //     serviceMatch || roleMatch || author || publisher || startdate || quantity
  //   );
  // });

  // Update page count based on filtered results

  const stationeryMatchesSearch = (stationeryId, searchLower) => {
    const item = stationeryType.find(
      (s) => s.stationery_id?.toString() === stationeryId?.toString(),
    );

    if (!item) return false;

    return (
      item.stationery_id?.toString().toLowerCase().includes(searchLower) ||
      item.name?.toString().toLowerCase().includes(searchLower)
    );
  };

  const filteredSections = (sections || []).filter((section) => {
    const searchLower = searchTerm.toLowerCase();

    const serviceMatch = section?.title
      ?.trim()
      .toLowerCase()
      .includes(searchLower);

    const roleLabel = statusMap[section?.status] || "";
    const roleMatch = roleLabel.toLowerCase().includes(searchLower);

    const startdate = section?.date
      ?.toString()
      .toLowerCase()
      .includes(searchLower);

    const quantity = section?.quantity
      ?.toString()
      .toLowerCase()
      .includes(searchLower);

    const author = section?.description
      ?.trim()
      .toLowerCase()
      .includes(searchLower);

    const publisher = section?.publisher
      ?.trim()
      .toLowerCase()
      .includes(searchLower);

    const stationeryMatch = stationeryMatchesSearch(
      section?.stationery_id,
      searchLower,
    );

    return (
      serviceMatch ||
      roleMatch ||
      author ||
      publisher ||
      startdate ||
      quantity ||
      stationeryMatch
    );
  });

  useEffect(() => {
    setPageCount(Math.ceil(filteredSections.length / pageSize));
  }, [filteredSections, pageSize]);

  // Paginate results
  const displayedSections = filteredSections.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize,
  );

  useEffect(() => {
    setPageCount(Math.ceil(filteredSections.length / pageSize));
  }, [filteredSections]);

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const handleEdit = (section) => {
    setCurrentSection(section);

    setNewSectionName(section.stationery_id);
    setNewDepartmentId(section.quantity);
    setDescription(section.description || "");

    // Reset field errors
    setFieldErrors({});
    setShowEditModal(true);

    // console.log("Editing stationery requisition:", section);
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
    setDescription("");
    setCurrentSection(null);
    setFieldErrors({});
    setNameError("");
  };

  const handleSubmitAdd = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const validationErrors = validateStationeryForm(
      newSectionName,
      newDepartmentId,
    );
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      await axios.post(
        `${API_URL}/api/create_stationery_req`,
        {
          stationery_id: newSectionName,
          quantity: newDepartmentId,
          description,
          staff_id: regId,
          status: "A",
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      fetchSections();
      handleCloseModal();
      toast.success("New Stationery Requisition made!");
    } catch (error) {
      console.error("Error adding stationery requisition:", error);
      toast.error("Server error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const validationErrors = validateStationeryForm(
      newSectionName,
      newDepartmentId,
    );
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      await axios.put(
        `${API_URL}/api/update_stationery_req/${currentSection.requisition_id}`,
        {
          stationery_id: newSectionName,
          quantity: newDepartmentId,
          description,
          staff_id: regId,
          status: currentSection.status,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      fetchSections();
      handleCloseModal();
      toast.success("Stationery Requisition updated successfully!");
    } catch (error) {
      console.error("Error editing requisition:", error);
      toast.error("Server error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    const sectionToDelete = sections.find((sec) => sec.requisition_id === id);

    if (sectionToDelete) {
      const stationery = stationeryType.find(
        (s) => s.stationery_id === sectionToDelete.stationery_id,
      );

      // Add the stationery name
      const sectionWithName = {
        ...sectionToDelete,
        stationery_name: stationery ? stationery.name : "",
      };

      setCurrentSection(sectionWithName);
      setShowDeleteModal(true);
    }
  };

  const handleSubmitDelete = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");

      if (!token || !currentSection || !currentSection.requisition_id) {
        throw new Error("Stationery Requistion Id is missing");
      }
      //   console.log("delete this stationery", currentSection.requisition_id);
      const response = await axios.delete(
        `${API_URL}/api/delete_stationery_req/${currentSection.requisition_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        },
      );
      //   console.log(
      //     "The response of the delete api in the stationery",
      //     response.data
      //   );
      if (response.data.success) {
        fetchSections();
        setShowDeleteModal(false);
        setCurrentSection(null);
        toast.success("Stationery Requsition deleted!");
      } else {
        toast.error(
          response.data.message || "Failed to delete stationery requsition!",
        );
      }
    } catch (error) {
      console.error("Error deleting stationery:", error);
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Server error. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
      setShowDeleteModal(false);
    }
  };

  const validateStationeryForm = (stationery_id, quantity) => {
    const errors = {};

    if (!stationery_id || stationery_id === "") {
      errors.stationery_id = "Please select a stationery type.";
    }

    if (!quantity || quantity === "") {
      errors.quantity = "Please enter quantity.";
    } else if (isNaN(quantity) || parseInt(quantity) <= 0) {
      errors.quantity = "Please enter a valid number greater than 0.";
    }

    return errors;
  };

  const handleChangeSectionName = (e) => {
    const value = e.target.value;
    setNewSectionName(value);

    // live field validation
    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      stationery_id: validateStationeryForm(value, newDepartmentId)
        .stationery_id,
    }));
  };

  const handleChangeDepartmentId = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, ""); // only digits allowed
    setNewDepartmentId(value);

    // live field validation
    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      quantity: validateStationeryForm(newSectionName, value).quantity,
    }));
  };

  const handleChangeDescription = (e) => {
    let value = e.target.value;
    // allow letters, numbers, punctuation and spaces
    value = value.replace(/[^a-zA-Z0-9.,'()\-\s]/g, "");
    setDescription(value);
  };

  return (
    <>
      <ToastContainer />

      <div className="container mt-4">
        <div className="card mx-auto w-[90%] shadow-lg">
          <div className="p-2 px-3 bg-gray-100 flex justify-between items-center">
            <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
              Stationery Requistion
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
            <div className="h-96 lg:h-96  overflow-y-scroll lg:overflow-x-hidden">
              <div className="bg-white rounded-lg shadow-xs">
                <table className="min-w-full leading-normal table-auto">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="px-2 w-full md:w-[7%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Sr.No
                      </th>
                      <th className="px-2 w-full md:w-[15%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Stationery Type
                      </th>
                      <th className="px-2 w-full md:w-[10%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Quantity
                      </th>
                      <th className="px-2 w-full md:w-[25%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Description
                      </th>
                      <th className="px-2 w-full md:w-[15%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Comment
                      </th>
                      <th className="px-2 w-full md:w-[10%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Date
                      </th>
                      <th className="px-2 w-full md:w-[9%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Status
                      </th>
                      <th className="px-2 w-full md:w-[7%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Edit
                      </th>
                      <th className="px-2 w-full md:w-[7%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
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
                          key={section.requisition_id}
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
                              {getStationeryName(section?.stationery_id)}
                            </p>
                          </td>
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {section?.quantity}
                            </p>
                          </td>
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {section?.description}
                            </p>
                          </td>
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {section?.comments}
                            </p>
                          </td>
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {section?.date
                                ? new Date(section.date)
                                  .toLocaleDateString("en-GB")
                                  .replace(/\//g, "-")
                                : ""}
                            </p>
                          </td>
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {section?.status === "A"
                                ? "Apply"
                                : section?.status === "H"
                                  ? "Hold"
                                  : section?.status === "R"
                                    ? "Reject"
                                    : section?.status === "P"
                                      ? "Approve"
                                      : section?.status}
                            </p>
                          </td>

                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            {section.status === "A" ||
                              section.status === "H" ? (
                              <button
                                className="text-blue-600 hover:text-blue-800 hover:bg-transparent"
                                onClick={() => handleEdit(section)}
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                            ) : (
                              " "
                            )}
                          </td>

                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            {section.status === "A" ||
                              section.status === "H" ? (
                              <button
                                className="text-red-600 hover:text-red-800 hover:bg-transparent"
                                onClick={() =>
                                  handleDelete(section.requisition_id)
                                }
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            ) : (
                              " "
                            )}
                          </td>
                        </tr>
                      ))
                    ) : sections.length === 0 ? (
                      <div className=" absolute left-[1%] w-[100%]  text-center flex justify-center items-center mt-14">
                        <div className=" text-center text-xl text-red-700">
                          Create stationery requisition to view.
                        </div>
                      </div>
                    ) : (
                      <div className=" absolute left-[1%] w-[100%]  text-center flex justify-center items-center mt-14">
                        <div className=" text-center text-xl text-red-700">
                          Result not found!
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
                    <h5 className="modal-title">
                      Create Stationery Requistion
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
                    {/* Stationery Type */}
                    <div className="relative mb-3 flex justify-center mx-4">
                      <label htmlFor="stationeryType" className="w-1/2 mt-2">
                        Stationery Type <span className="text-red-500">*</span>
                      </label>

                      <select
                        id="stationeryType"
                        className="form-control shadow-md mb-2"
                        value={newSectionName}
                        onChange={handleChangeSectionName}
                      >
                        <option value="">Select</option>
                        {Array.isArray(stationeryType) &&
                          stationeryType.map((item) => (
                            <option
                              key={item.stationery_id}
                              value={item.stationery_id}
                            >
                              {item.name}
                            </option>
                          ))}
                      </select>

                      <div className="absolute top-9 left-1/3">
                        {fieldErrors.stationery_id && (
                          <small className="text-danger text-xs">
                            {fieldErrors.stationery_id}
                          </small>
                        )}
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="relative mb-3 flex justify-center mx-4">
                      <label htmlFor="quantity" className="w-1/2 mt-2">
                        Quantity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        className="form-control shadow-md mb-2"
                        id="quantity"
                        value={newDepartmentId}
                        onChange={handleChangeDepartmentId}
                      />
                      <div className="absolute top-9 left-1/3">
                        {fieldErrors.quantity && (
                          <small className="text-danger text-xs">
                            {fieldErrors.quantity}
                          </small>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="relative mb-3 flex justify-center mx-4">
                      <label htmlFor="description" className="w-1/2 mt-2">
                        Description
                      </label>
                      <textarea
                        maxLength={500}
                        className="form-control shadow-md mb-2"
                        id="description"
                        value={description}
                        onChange={handleChangeDescription}
                      />
                    </div>
                  </div>

                  <div className=" flex justify-end p-3">
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
                  <h5 className="modal-title">Edit Stationery Requistion</h5>
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
                  {/* Stationery Type */}
                  <div className="relative mb-3 flex justify-center mx-4">
                    <label htmlFor="stationeryType" className="w-1/2 mt-2">
                      Stationery Type <span className="text-red-500">*</span>
                    </label>

                    <select
                      id="stationeryType"
                      className="form-control shadow-md mb-2"
                      value={newSectionName}
                      onChange={handleChangeSectionName}
                    >
                      <option value="">Select</option>
                      {Array.isArray(stationeryType) &&
                        stationeryType.map((item) => (
                          <option
                            key={item.stationery_id}
                            value={item.stationery_id}
                          >
                            {item.name}
                          </option>
                        ))}
                    </select>

                    {fieldErrors.stationery_id && (
                      <small className="text-danger absolute top-10 left-1/3 text-xs">
                        {fieldErrors.stationery_id}
                      </small>
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="relative mb-3 flex justify-center mx-4">
                    <label htmlFor="quantity" className="w-1/2 mt-2">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      className="form-control shadow-md mb-2"
                      id="quantity"
                      value={newDepartmentId}
                      onChange={handleChangeDepartmentId}
                    />
                    {fieldErrors.quantity && (
                      <small className="text-danger absolute top-10 left-1/3 text-xs">
                        {fieldErrors.quantity}
                      </small>
                    )}
                  </div>

                  {/* Description */}
                  <div className="relative mb-3 flex justify-center mx-4">
                    <label htmlFor="description" className="w-1/2 mt-2">
                      Description
                    </label>
                    <textarea
                      id="description"
                      maxLength={500}
                      className="form-control shadow-md mb-2"
                      value={description}
                      onChange={handleChangeDescription}
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
                    Are you sure you want to delete stationery requistion :{" "}
                    {currentSection?.stationery_name}?
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

export default StationeryRequisition;
