import { useEffect, useState, useRef } from "react";
import axios from "axios";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RxCross1 } from "react-icons/rx";

function BookRequisition() {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [session, setSession] = useState("");

  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");

  const pageSize = 10;

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
      console.log("session data", response.data);

      setSession(response.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(`${API_URL}/api/get_BookRequisition`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      console.log("Book Requsition data", response.data.data);

      setSections(response.data.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchsessionData();
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

  const statusMap = {
    A: "Apply",
    H: "Hold",
    P: "Approve",
    R: "Reject",
  };

  const filteredSections = (sections || []).filter((section) => {
    const searchLower = searchTerm.toLowerCase(); // assuming this is defined

    const serviceMatch = section?.title
      ?.trim()
      .toLowerCase()
      .includes(searchLower);

    const roleLabel = statusMap[section?.status] || "";
    const roleMatch = roleLabel.toLowerCase().includes(searchLower);

    const author = section?.author?.trim().toLowerCase().includes(searchLower);
    const publisher = section?.publisher
      ?.trim()
      .toLowerCase()
      .includes(searchLower);

    return serviceMatch || roleMatch || author || publisher;
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

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const handleEdit = (section) => {
    setCurrentSection(section);
    setNewSectionName(section.title);
    setClassName(section.title);
    setNewDepartmentId(section.author);
    setnewDescription(section.publisher);
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
    setnewDescription("");
    setCurrentSection(null);
    setFieldErrors({});
    setNameError("");
  };

  const handleSubmitAdd = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const validationErrors = validateSectionName(newSectionName);
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
        `${API_URL}/api/save_bookrequistion`,
        {
          title: newSectionName,
          author: newDepartmentId,
          publisher: description,
          status: "A",
          req_date: new Date().toISOString().split("T")[0],
          member_id: session.custom_claims.reg_id,
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
      toast.success("New Book Requistion made!");
    } catch (error) {
      console.error("Error adding book:", error);
      if (error.response && error.response.data && error.response.data.errors) {
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
    const validationErrors = validateSectionName(newSectionName);
    if (Object.keys(validationErrors).length) {
      setFieldErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No authentication token or academic year found");
      }

      console.log("current section", currentSection);
      await axios.put(
        `${API_URL}/api/update_book_requisition/${currentSection.book_req_id}`,
        {
          title: newSectionName,
          author: newDepartmentId,
          publisher: description,
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
      toast.success("Book Requistion Updated Successfully!");
    } catch (error) {
      console.error("Error editing book:", error);
      if (error.response && error.response.data.status === 422) {
        const errors = error.response.data.errors;
        console.log("error", errors);
        if (errors.title) {
          setFieldErrors((prev) => ({
            ...prev,
            title: errors.title,
          }));
          errors.title.forEach((err) => toast.error(err));
        }
      } else {
        toast.error("Server error. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    console.log("the deleted book id", id);
    const sectionToDelete = sections.find((sec) => sec.book_req_id === id);
    console.log("the deleted book for sectiontodelete", sectionToDelete);
    setCurrentSection(sectionToDelete);
    setShowDeleteModal(true);
  };

  const handleSubmitDelete = async () => {
    if (isSubmitting) return; // Prevent re-submitting
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");

      if (!token || !currentSection || !currentSection.book_req_id) {
        throw new Error("Book Requistion Id is missing");
      }
      console.log("delete this book", currentSection.book_req_id);
      const response = await axios.delete(
        `${API_URL}/api/delete_book_requisition/${currentSection.book_req_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      console.log("The response of the delete api in the book", response.data);
      if (response.data.success) {
        fetchSections();
        setShowDeleteModal(false);
        setCurrentSection(null);
        toast.success("Book Requsition deleted!");
      } else {
        toast.error(
          response.data.message || "Failed to delete book requsition!"
        );
      }
    } catch (error) {
      console.error("Error deleting book:", error);
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

  const validateSectionName = (title) => {
    const errors = {};
    if (!title || title.trim() === "") {
      errors.title = "Please enter Title.";
    }
    return errors;
  };

  const handleChangeSectionName = (e) => {
    let { value } = e.target;
    value = value.replace(/[^a-zA-Z ]/g, "");

    setNewSectionName(value);

    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      title: validateSectionName(value, newDepartmentId).title,
    }));
  };

  const handleChangeDepartmentId = (e) => {
    let { value } = e.target;
    value = value.replace(/[^a-zA-Z ]/g, "");
    setNewDepartmentId(value);
    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      author: validateSectionName(newSectionName, value).author,
    }));
  };

  const handleChangeDescription = (e) => {
    let { value } = e.target;
    value = value.replace(/[^a-zA-Z ]/g, "");
    setClassName(value);
    setnewDescription(value);
  };

  return (
    <>
      <ToastContainer />

      <div className="container mt-4">
        <div className="card mx-auto w-[85%] shadow-lg">
          <div className="p-2 px-3 bg-gray-100 flex justify-between items-center">
            <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
              Book Requistion
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
            <div className="h-96 lg:h-96 w-full md:w-[full%] mx-auto w-overflow-y-scroll lg:overflow-x-hidden">
              <div className="bg-white rounded-lg shadow-xs">
                <table className="min-w-full leading-normal table-auto">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="px-2 w-full md:w-[7%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Sr.No
                      </th>
                      <th className="px-2 w-full md:w-[15%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Title
                      </th>
                      <th className="px-2 w-full md:w-[15%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Author
                      </th>
                      <th className="px-2 w-full md:w-[15%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Publisher
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
                          key={section.book_req_id}
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
                              {section?.title}
                            </p>
                          </td>
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {section?.author}
                            </p>
                          </td>
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {section?.publisher}
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
                              onClick={() => handleDelete(section.book_req_id)}
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
                    <h5 className="modal-title">Create Book Requistion</h5>
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
                    <div className=" relative mb-3 flex justify-center  mx-4">
                      <label htmlFor="title" className="w-1/2 mt-2">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={100}
                        className="form-control shadow-md mb-2"
                        id="title"
                        value={newSectionName}
                        onChange={handleChangeSectionName}
                      />{" "}
                      <div className="absolute top-9 left-1/3">
                        {!nameAvailable && (
                          <span className=" block text-danger text-xs">
                            {nameError}
                          </span>
                        )}
                        {fieldErrors.title && (
                          <small className="text-danger text-xs">
                            {fieldErrors.title}
                          </small>
                        )}
                      </div>
                    </div>
                    <div className=" relative mb-3 flex justify-center  mx-4">
                      <label htmlFor="author" className="w-1/2 mt-2">
                        Author
                      </label>
                      <input
                        type="text"
                        maxLength={100}
                        className="form-control shadow-md mb-2"
                        id="author"
                        value={newDepartmentId}
                        onChange={handleChangeDepartmentId}
                      />{" "}
                    </div>
                    <div className=" relative mb-3 flex justify-center  mx-4">
                      <label htmlFor="publisher" className="w-1/2 mt-2">
                        Publisher
                      </label>
                      <input
                        type="text"
                        maxLength={100}
                        className="form-control shadow-md mb-2"
                        id="publisher"
                        value={description}
                        onChange={handleChangeDescription}
                      />{" "}
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
                  <h5 className="modal-title">Edit Book Requistion</h5>
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
                    <label htmlFor="title" className="w-1/2 mt-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={100}
                      className="form-control shadow-md mb-2"
                      id="title"
                      value={newSectionName}
                      onChange={handleChangeSectionName}
                    />{" "}
                    <div className="absolute top-9 left-1/3">
                      {!nameAvailable && (
                        <span className=" block text-danger text-xs">
                          {nameError}
                        </span>
                      )}
                      {fieldErrors.title && (
                        <small className="text-danger text-xs">
                          {fieldErrors.title}
                        </small>
                      )}
                    </div>
                  </div>
                  <div className=" relative mb-3 flex justify-center  mx-4">
                    <label htmlFor="author" className="w-1/2 mt-2">
                      Author
                    </label>
                    <input
                      type="text"
                      maxLength={100}
                      className="form-control shadow-md mb-2"
                      id="author"
                      value={newDepartmentId}
                      onChange={handleChangeDepartmentId}
                    />{" "}
                  </div>
                  <div className=" relative mb-3 flex justify-center  mx-4">
                    <label htmlFor="publisher" className="w-1/2 mt-2">
                      Publisher
                    </label>
                    <input
                      type="text"
                      maxLength={100}
                      className="form-control shadow-md mb-2"
                      id="publisher"
                      value={description}
                      onChange={handleChangeDescription}
                    />{" "}
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
                    Are you sure you want to delete Book :{" "}
                    {currentSection?.title}?
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

export default BookRequisition;
