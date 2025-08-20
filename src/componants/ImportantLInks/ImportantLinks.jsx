import { useEffect, useState, useRef } from "react";
import axios from "axios";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faPlus,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RxCross1 } from "react-icons/rx";

function ImportantLink() {
  const API_URL = import.meta.env.VITE_API_URL; // URL for host
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
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
  const [deletedHolidays, setDeletedHolidays] = useState([]);
  const [url, setUrl] = useState("");

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

      const response = await axios.get(`${API_URL}/api/get_importantlink`, {
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

  const formatDate = (dateString) => {
    if (!dateString) return " ";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-4); // Last 2 digits of the year
    return `${day}-${month}-${year}`;
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

  const filteredSections = (sections || []).filter((section) => {
    const searchLower = searchTerm.toLowerCase(); // assuming this is defined

    const serviceMatch = section?.title
      ?.trim()
      .toLowerCase()
      .includes(searchLower);

    const author = section?.description
      ?.trim()
      .toLowerCase()
      .includes(searchLower);
    const publisher = section?.type_link
      ?.trim()
      .toLowerCase()
      .includes(searchLower);

    const createDate = formatDate(section?.create_date).includes(searchLower);

    return serviceMatch || author || publisher || createDate;
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
    setNewDepartmentId(section.type_link);
    setnewDescription(section.description);
    setUrl(section.url);
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
    setShowViewModal(false);
    setNewSectionName("");
    setNewDepartmentId("");
    setnewDescription("");
    setUrl("");
    setCurrentSection(null);
    setFieldErrors({});
    setNameError("");
  };

  const handleSubmitAdd = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Validate all fields
    const validationErrors = validateSectionName(
      newSectionName,
      url,
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
        `${API_URL}/api/save_importantlink`,
        {
          title: newSectionName,
          url: url,
          type_link: newDepartmentId,
          description: description,
          publish: "N",
          isDelete: "N",
          posted_by: session.custom_claims.reg_id,
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
      toast.success("New Important Link created!");
    } catch (error) {
      console.error("Error adding link:", error);
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
    if (isSubmitting) return;
    setIsSubmitting(true);

    const validationErrors = validateSectionName(
      newSectionName,
      url,
      newDepartmentId
    );
    if (Object.keys(validationErrors).length) {
      setFieldErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No authentication token found");
      }

      console.log("current section", currentSection);

      // Ensure payload keys match what the backend expects
      await axios.put(
        `${API_URL}/api/update_importantlink/${currentSection.link_id}`,
        {
          title: newSectionName,
          type_link: newDepartmentId,
          url: url,
          description: description,
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
      toast.success("Important Link updated successfully!");
    } catch (error) {
      console.error("Error editing link:", error);
      if (error.response && error.response.status === 422) {
        const errors = error.response.data.errors || {};
        setFieldErrors((prev) => ({
          ...prev,
          title: errors.title?.[0] || "",
          url: errors.url?.[0] || "",
          type_link: errors.type_link?.[0] || "",
        }));

        Object.values(errors).forEach((errArr) =>
          errArr.forEach((err) => toast.error(err))
        );
      } else {
        toast.error("Server error. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleView = (section) => {
    setNewSectionName(section.title);
    setUrl(section.url);
    setNewDepartmentId(section.type_link);
    console.log(section.type_link);
    setnewDescription(section.description || "");
    setShowViewModal(true);
  };

  useEffect(() => {
    const storedDeleted =
      JSON.parse(localStorage.getItem("deletedLinks")) || [];
    setDeletedHolidays(storedDeleted);
  }, []);

  const handleDelete = (id) => {
    console.log("the deleted link id", id);
    const sectionToDelete = sections.find((sec) => sec.link_id === id);
    console.log(
      "the deleted inporatant link for sectiontodelete",
      sectionToDelete
    );
    setCurrentSection(sectionToDelete);
    setShowDeleteModal(true);
  };

  const handleSubmitDelete = async () => {
    if (isSubmitting) return; // Prevent re-submitting
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");

      if (!token || !currentSection || !currentSection.link_id) {
        throw new Error("Link Id is missing");
      }

      console.log("delete this link", currentSection.link_id);

      const response = await axios.delete(
        `${API_URL}/api/delete_importantlink/${currentSection.link_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      console.log("The response of the delete API", response.data);

      if (response.data.success) {
        // Track deleted link_id
        setDeletedHolidays((prev) => {
          const updatedDeleted = [...prev, currentSection.link_id];
          localStorage.setItem("deletedLinks", JSON.stringify(updatedDeleted));
          return updatedDeleted;
        });

        fetchSections();
        setShowDeleteModal(false);
        setCurrentSection(null);
        toast.success("Important Link deleted!");
      } else {
        toast.error(
          response.data.message || "Failed to delete important link!"
        );
      }
    } catch (error) {
      console.error("Error deleting link:", error);
      if (error.response && error.response.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Server error. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
      setShowDeleteModal(false);
    }
  };

  const handlePublish = async (linkId) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.put(
        `${API_URL}/api/publish_importantlink/${linkId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success("Link published successfully!");
        fetchSections(); // Refresh the list to reflect publish status
      } else {
        toast.error(response.data.message || "Failed to publish the link.");
      }
    } catch (error) {
      console.error("Error publishing link:", error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Server error. Please try again later.");
      }
    }
  };

  // const validateSectionName = (title, url, type_link) => {
  //   const errors = {};
  //   if (!title || title.trim() === "") {
  //     errors.title = "Please enter Title.";
  //   }
  //   if (!url || url === "") {
  //     errors.url = "Please enter URL.";
  //   }
  //   if (!type_link || type_link === "") {
  //     errors.type_link = "Please select link type.";
  //   }
  //   return errors;
  // };

  const validateSectionName = (title, url, type_link) => {
    const errors = {};

    if (!title || title.trim() === "") {
      errors.title = "Please enter Title.";
    }

    if (!url || url.trim() === "") {
      errors.url = "Please enter URL.";
    } else {
      // URL validation using regex
      const urlPattern = new RegExp(
        "^(https?:\\/\\/)" + // protocol
          "((([a-z\\d]([a-z\\d-]*[a-z\\d])*))\\.)+" + // domain name
          "[a-z]{2,}" + // extension
          "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
          "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
          "(\\#[-a-z\\d_]*)?$",
        "i"
      );

      if (!urlPattern.test(url)) {
        errors.url = "Please enter a valid URL.";
      }
    }

    if (!type_link || type_link === "") {
      errors.type_link = "Please select link type.";
    }

    return errors;
  };

  const handleChangeSectionName = (e) => {
    const value = e.target.value;
    setNewSectionName(value);

    const errors = validateSectionName(value, url, newDepartmentId);
    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      title: errors.title,
    }));
  };

  const handleChangeDepartmentId = (e) => {
    const value = e.target.value;
    setNewDepartmentId(value);

    const errors = validateSectionName(newSectionName, url, value);
    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      type_link: errors.type_link,
    }));
  };

  const handleChangeDescription = (e) => {
    let { value } = e.target;
    setClassName(value);
    setnewDescription(value);
  };

  const handleChangeUrl = (e) => {
    const value = e.target.value;
    setUrl(value);

    const errors = validateSectionName(newSectionName, value, newDepartmentId);
    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      url: errors.url,
    }));
  };

  return (
    <>
      <ToastContainer />

      <div className="container mt-4">
        <div className="card mx-auto w-[85%] shadow-lg">
          <div className="p-2 px-3 bg-gray-100 flex justify-between items-center">
            <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
              Important Links
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
            <div className="h-96 lg:h-96 overflow-y-scroll lg:overflow-x-hidden">
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
                        Description
                      </th>
                      <th className="px-2 w-full md:w-[15%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Create Date
                      </th>
                      <th className="px-2 w-full md:w-[9%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Type Link
                      </th>
                      <th className="px-2 w-full md:w-[7%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Edit/View
                      </th>
                      <th className="px-2 w-full md:w-[7%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Delete
                      </th>
                      <th className="px-2 w-full md:w-[7%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Publish
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
                          key={section.link_id}
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
                              {section?.description}
                            </p>
                          </td>
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {formatDate(section?.create_date)}
                            </p>
                          </td>
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {section?.type_link}
                            </p>
                          </td>
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            {section.publish === "N" ? (
                              <button
                                className="text-blue-600 hover:text-blue-800 hover:bg-transparent "
                                onClick={() => handleEdit(section)}
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                            ) : (
                              <button
                                className="text-blue-600 hover:text-blue-800 hover:bg-transparent "
                                onClick={() => handleView(section)}
                              >
                                {/* <FontAwesomeIcon icon={faView} /> */}
                                <MdOutlineRemoveRedEye className="font-bold text-xl" />
                              </button>
                            )}
                          </td>
                          <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                            {deletedHolidays.includes(section.link_id) ? (
                              <span className="text-red-600 font-semibold">
                                Deleted
                              </span>
                            ) : (
                              <button
                                onClick={() => handleDelete(section.link_id)}
                                className="text-red-600 hover:text-red-800 hover:bg-transparent"
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            )}
                          </td>
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-base">
                            {section.publish === "N" ? (
                              <button
                                className="text-green-600 hover:text-green-800 hover:bg-transparent "
                                onClick={() => handlePublish(section.link_id)}
                              >
                                <FontAwesomeIcon icon={faCheck} />
                              </button>
                            ) : (
                              ""
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
                    <h5 className="modal-title">Create Important Link</h5>
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
                        maxLength={20}
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

                    <div className="relative mb-3 flex justify-center mx-4">
                      <label htmlFor="url" className="w-1/2 mt-2">
                        URL <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="url"
                        className="form-control shadow-md mb-2"
                        id="url"
                        value={url}
                        onChange={handleChangeUrl}
                        placeholder="https://example.com"
                      />
                      <div className="absolute top-9 left-1/3">
                        {!nameAvailable && (
                          <span className=" block text-danger text-xs">
                            {nameError}
                          </span>
                        )}
                        {fieldErrors.url && (
                          <small className="text-danger text-xs">
                            {fieldErrors.url}
                          </small>
                        )}
                      </div>
                    </div>

                    <div className="relative mb-3 flex justify-center mx-4">
                      <label htmlFor="linktype" className="w-1/2 mt-2">
                        Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="linktype"
                        className="form-control shadow-md mb-2"
                        value={newDepartmentId}
                        onChange={handleChangeDepartmentId}
                      >
                        <option value=""> Select Type </option>
                        <option value="private">Private</option>
                        <option value="public">Public</option>
                      </select>
                      <div className="absolute top-9 left-1/3">
                        {!nameAvailable && (
                          <span className=" block text-danger text-xs">
                            {nameError}
                          </span>
                        )}
                        {fieldErrors.type_link && (
                          <small className="text-danger text-xs">
                            {fieldErrors.type_link}
                          </small>
                        )}
                      </div>
                    </div>

                    <div className=" relative mb-3 flex justify-center  mx-4">
                      <label htmlFor="publisher" className="w-1/2 mt-2">
                        Description
                      </label>
                      <textarea
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
                  <h5 className="modal-title">Edit Important Link</h5>
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
                      maxLength={20}
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

                  <div className="relative mb-3 flex justify-center mx-4">
                    <label htmlFor="url" className="w-1/2 mt-2">
                      URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      className="form-control shadow-md mb-2"
                      id="url"
                      value={url}
                      onChange={handleChangeUrl}
                      placeholder="https://example.com"
                    />
                    <div className="absolute top-9 left-1/3">
                      {!nameAvailable && (
                        <span className=" block text-danger text-xs">
                          {nameError}
                        </span>
                      )}
                      {fieldErrors.url && (
                        <small className="text-danger text-xs">
                          {fieldErrors.url}
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="relative mb-3 flex justify-center mx-4">
                    <label htmlFor="linktype" className="w-1/2 mt-2">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="linktype"
                      className="form-control shadow-md mb-2"
                      value={newDepartmentId}
                      onChange={handleChangeDepartmentId}
                    >
                      <option value=""> Select Type </option>
                      <option value="private">Private</option>
                      <option value="public">Public</option>
                    </select>
                    <div className="absolute top-9 left-1/3">
                      {!nameAvailable && (
                        <span className=" block text-danger text-xs">
                          {nameError}
                        </span>
                      )}
                      {fieldErrors.type_link && (
                        <small className="text-danger text-xs">
                          {fieldErrors.type_link}
                        </small>
                      )}
                    </div>
                  </div>

                  <div className=" relative mb-3 flex justify-center  mx-4">
                    <label htmlFor="publisher" className="w-1/2 mt-2">
                      Description
                    </label>
                    <textarea
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

        {showViewModal && (
          <div
            className="modal"
            style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="flex justify-between p-3">
                  <h5 className="modal-title">View Important Link</h5>
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
                      Title
                    </label>
                    <input
                      type="text"
                      className="form-control shadow-md mb-2"
                      id="title"
                      value={newSectionName}
                      readOnly
                    />
                  </div>

                  <div className="relative mb-3 flex justify-center mx-4">
                    <label htmlFor="url" className="w-1/2 mt-2">
                      URL
                    </label>
                    <input
                      type="url"
                      className="form-control shadow-md mb-2"
                      id="url"
                      value={url}
                    />
                  </div>

                  <div className="relative mb-3 flex justify-center mx-4">
                    <label htmlFor="linktype" className="w-1/2 mt-2">
                      Type
                    </label>
                    <input
                      type="text"
                      className="form-control shadow-md mb-2"
                      value={newDepartmentId}
                      readOnly
                    />
                  </div>

                  <div className=" relative mb-3 flex justify-center  mx-4">
                    <label htmlFor="publisher" className="w-1/2 mt-2">
                      Description
                    </label>
                    <textarea
                      type="text"
                      maxLength={100}
                      className="form-control shadow-md mb-2"
                      id="publisher"
                      value={description}
                      readOnly
                    />{" "}
                  </div>
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
                    Are you sure you want to delete Important Link :{" "}
                    {currentSection?.title}?
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

export default ImportantLink;
