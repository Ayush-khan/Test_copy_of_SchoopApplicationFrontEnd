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

function News() {
  const API_URL = import.meta.env.VITE_API_URL; // URL for host
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
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
  const today = new Date().toISOString().split("T")[0];
  const academicYrTo = localStorage.getItem("academic_yr_to");
  console.log("acadmeic", academicYrTo);

  const [activeTillDate, setActiveTillDate] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageName, setSelectedImageName] = useState(""); // just name/url of previous or current image

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

      const response = await axios.get(`${API_URL}/api/get_allnews`, {
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
    console.log("image name", section.image_name);
    setCurrentSection(section);
    setNewSectionName(section.title || "");
    setnewDescription(section.description || "");
    setUrl(section.url || "");
    setActiveTillDate(section.active_till_date || "");

    setSelectedImage(section.image_name);
    // setSelectedImageName(section.image_name); // <-- Add this
    setSelectedImageName(section.image_name?.split("/").pop() || "");

    setFieldErrors({});
    setShowEditModal(true);
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
    setActiveTillDate("");
    setSelectedImage(null);
    setSelectedImageName(null);
    setShowPublishModal(false);
    setCurrentSection(null);
    setFieldErrors({});
    setNameError("");
  };

  const handleSubmitAdd = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const validationErrors = validateSectionName(newSectionName, description);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      const formData = new FormData();
      formData.append("title", newSectionName);
      formData.append("url", url);
      formData.append("description", description);
      formData.append("active_till_date", activeTillDate);

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      // Get response instead of letting Axios throw
      const response = await axios.post(`${API_URL}/api/save_news`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
        validateStatus: () => true, // <-- Prevent Axios from throwing on non-2xx
      });

      if (response.status === 200 && response.data.success) {
        toast.success(response.data.message || "News created!");
        fetchSections();
        handleCloseModal();
      } else {
        toast.error(response.data.message || "Failed to create news.");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      // toast.error("Server error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const validationErrors = validateSectionName(newSectionName, description);
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

      const formData = new FormData();
      formData.append("title", newSectionName.trim() || currentSection.title);
      formData.append("url", url);
      formData.append("description", description);
      formData.append("active_till_date", activeTillDate);

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      console.log("current section", currentSection);

      await axios.post(
        `${API_URL}/api/update_news/${currentSection.news_id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      fetchSections();
      handleCloseModal();
      toast.success("News updated successfully!");
    } catch (error) {
      console.error("Error editing link:", error);
      if (error.response && error.response.status === 422) {
        const errors = error.response.data.errors || {};
        setFieldErrors((prev) => ({
          ...prev,
          title: errors.title?.[0] || "",
          description: errors.description?.[0] || "",
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
    console.log("image_name", section.image_name);
    setNewSectionName(section.title);
    setUrl(section.url);
    setSelectedImage(section.image_name);
    setActiveTillDate(section.active_till_date);
    setnewDescription(section.description || "");
    setShowViewModal(true);
  };

  useEffect(() => {
    const storedDeleted = JSON.parse(localStorage.getItem("deletedNews")) || [];
    setDeletedHolidays(storedDeleted);
  }, []);

  const handleDelete = (id) => {
    console.log("the deleted news id", id);
    const sectionToDelete = sections.find((sec) => sec.news_id === id);
    console.log("the deleted news for sectiontodelete", sectionToDelete);
    setCurrentSection(sectionToDelete);
    setShowDeleteModal(true);
  };

  const handleSubmitDelete = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");

      if (!token || !currentSection || !currentSection.news_id) {
        throw new Error("News Id is missing");
      }

      console.log("delete this news", currentSection.news_id);

      const response = await axios.delete(
        `${API_URL}/api/delete_news/${currentSection.news_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      console.log("The response of the delete API", response.data);

      if (response.data.success) {
        // Track deleted news_id
        setDeletedHolidays((prev) => {
          const updatedDeleted = [...prev, currentSection.news_id];
          localStorage.setItem("deletedNews", JSON.stringify(updatedDeleted));
          return updatedDeleted;
        });

        fetchSections();
        setShowDeleteModal(false);
        setCurrentSection(null);
        toast.success("News deleted!");
      } else {
        toast.error(response.data.message || "Failed to delete News!");
      }
    } catch (error) {
      console.error("Error deleting news:", error);
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

  const handlePublish = (id) => {
    console.log("the deleted news id", id);
    const sectionToPublish = sections.find((sec) => sec.news_id === id);
    console.log("the deleted news for sectiontodelete", sectionToPublish);
    setCurrentSection(sectionToPublish);
    setShowPublishModal(true);
  };

  const handleSubmitPublish = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      if (!token || !currentSection || !currentSection.news_id) {
        throw new Error("News Id is missing");
      }

      console.log("delete this news", currentSection.news_id);

      const response = await axios.put(
        `${API_URL}/api/publish_news/${currentSection.news_id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success("News published successfully!");
        fetchSections();
        setShowPublishModal(false);
      } else {
        toast.error(response.data.message || "Failed to publish the news.");
      }
    } catch (error) {
      console.error("Error publishing news:", error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Server error. Please try again later.");
      }
    } finally {
      setShowPublishModal(false);
      setIsSubmitting(false);
    }
  };

  const validateSectionName = (title, description) => {
    const errors = {};
    if (!title || title.trim() === "") {
      errors.title = "Please enter Title.";
    }

    if (!description || description.trim() === "") {
      errors.description = "Please enter description.";
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

  const handleChangeDescription = (e) => {
    const value = e.target.value;
    setnewDescription(value);

    // If you have description validation:
    const errors = {};
    if (!value || value.trim() === "") {
      errors.description = "Please enter Description.";
    }

    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      description: errors.description,
    }));
  };

  // const handleChangeUrl = (e) => {
  //   const value = e.target.value;
  //   setUrl(value);

  //   const errors = validateSectionName(newSectionName, value, newDepartmentId);
  //   setFieldErrors((prevErrors) => ({
  //     ...prevErrors,
  //     url: errors.url,
  //   }));
  // };

  const validateUrl = (url) => {
    const urlPattern = new RegExp(
      "^(https?:\\/\\/)" + // must start with http:// or https://
        "((([a-zA-Z0-9-]+)\\.)+[a-zA-Z]{2,})" + // domain
        "(\\:\\d+)?(\\/.*)?$", // optional port & path
      "i"
    );

    if (!url || !urlPattern.test(url)) {
      return "Please enter a valid URL.";
    }
    return null;
  };

  const handleChangeUrl = (e) => {
    const value = e.target.value;
    setUrl(value);

    const errorMessage = validateUrl(value);
    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      url: errorMessage,
    }));
  };

  const handleChangeActiveTillDate = (e) => {
    setActiveTillDate(e.target.value);
  };

  const handleChangeImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setSelectedImageName(file.name);
    } else {
      setSelectedImage(null);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="container mt-4">
        <div className="card mx-auto w-[95%] shadow-lg">
          <div className="p-2 px-3 bg-gray-100 flex justify-between items-center">
            <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
              News
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
                      <th className="px-2 w-full md:w-[20%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Description
                      </th>
                      <th className="px-2 w-full md:w-[10%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Posted By
                      </th>
                      <th className="px-2 w-full md:w-[12%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Active Till Date
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
                          key={section.news_id}
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
                              {section?.date_posted === "0000-00-00"
                                ? ""
                                : formatDate(section?.date_posted)}
                            </p>
                          </td>

                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {section?.active_till_date === "0000-00-00"
                                ? ""
                                : formatDate(section?.active_till_date)}
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
                            {section.isDelete === "Y" ? (
                              <span className="text-red-600 font-semibold">
                                Deleted
                              </span>
                            ) : (
                              <button
                                onClick={() => handleDelete(section.news_id)}
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
                                onClick={() => handlePublish(section.news_id)}
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
                    <h5 className="modal-title">Create News</h5>
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

                    <div className=" relative mb-3 flex justify-center  mx-4">
                      <label htmlFor="publisher" className="w-1/2 mt-2">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        type="text"
                        maxLength={100}
                        className="form-control shadow-md mb-2"
                        id="publisher"
                        value={description}
                        onChange={handleChangeDescription}
                      />{" "}
                      <div className="absolute top-14 left-1/3">
                        {!nameAvailable && (
                          <span className=" block text-danger text-xs">
                            {nameError}
                          </span>
                        )}
                        {fieldErrors.description && (
                          <small className="text-danger text-xs">
                            {fieldErrors.description}
                          </small>
                        )}
                      </div>
                    </div>

                    <div className="relative mb-3 flex justify-center mx-4">
                      <label htmlFor="activeTill" className="w-[45%] mt-2">
                        Active Till Date
                      </label>
                      <input
                        type="date"
                        id="activeTill"
                        name="activeTill"
                        value={activeTillDate}
                        onChange={handleChangeActiveTillDate}
                        min={today}
                        max={academicYrTo}
                        className="form-control w-1/2 ml-4 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
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
                        onChange={handleChangeUrl}
                        placeholder="https://example.com"
                      />
                      <div className="absolute top-9 left-1/3">
                        {fieldErrors.url && (
                          <small className="text-danger text-xs">
                            {fieldErrors.url}
                          </small>
                        )}
                      </div>
                    </div>

                    <div className="relative mb-3 flex justify-center mx-4 items-center">
                      <label htmlFor="imageUpload" className="w-[50%] mt-2">
                        Add Image
                      </label>
                      <input
                        type="file"
                        id="imageUpload"
                        accept="image/*"
                        className="form-control shadow-md mb-2"
                        onChange={handleChangeImage}
                      />
                    </div>

                    {/* Display selected image name + cross */}
                    {selectedImageName && (
                      <div className="flex items-center justify-center mb-3">
                        <span className="mr-2">{selectedImageName}</span>
                        <button
                          onClick={() => {
                            setSelectedImage(null);
                            setSelectedImageName("");
                          }}
                          className="text-red-500 text-lg font-bold cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    )}
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
                  <h5 className="modal-title">Edit News</h5>
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

                  <div className=" relative mb-3 flex justify-center  mx-4">
                    <label htmlFor="publisher" className="w-1/2 mt-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      type="text"
                      maxLength={100}
                      className="form-control shadow-md mb-2"
                      id="publisher"
                      value={description}
                      onChange={handleChangeDescription}
                    />{" "}
                    <div className="absolute top-14 left-1/3">
                      {!nameAvailable && (
                        <span className=" block text-danger text-xs">
                          {nameError}
                        </span>
                      )}
                      {fieldErrors.description && (
                        <small className="text-danger text-xs">
                          {fieldErrors.description}
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="relative mb-3 flex justify-center mx-4">
                    <label htmlFor="activeTill" className="w-[45%] mt-2">
                      Active Till Date
                    </label>
                    <input
                      type="date"
                      id="activeTill"
                      name="activeTill"
                      value={activeTillDate}
                      onChange={handleChangeActiveTillDate}
                      min={today}
                      max={academicYrTo}
                      className="form-control w-1/2 ml-4 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
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
                      onChange={handleChangeUrl}
                      placeholder="https://example.com"
                    />
                    <div className="absolute top-9 left-1/3">
                      {fieldErrors.url && (
                        <small className="text-danger text-xs">
                          {fieldErrors.url}
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="relative mb-3 flex justify-center mx-4 items-center">
                    <label htmlFor="imageUpload" className="w-[50%] mt-2">
                      Add Image
                    </label>
                    <input
                      type="file"
                      id="imageUpload"
                      accept="image/*"
                      className="form-control shadow-md mb-2"
                      onChange={handleChangeImage}
                    />
                  </div>

                  {selectedImageName ? (
                    <div className="flex items-center justify-center mb-3">
                      <span className="mr-2">{selectedImageName}</span>
                      <button
                        onClick={() => {
                          setSelectedImage();
                          setSelectedImageName("");
                        }}
                        className="text-red-500 text-lg font-bold cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    ""
                  )}
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
                  <h5 className="modal-title">View News</h5>
                  <RxCross1
                    className="float-end relative mt-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                    type="button"
                    onClick={handleCloseModal}
                  />
                </div>

                <div
                  className="relative mb-3 h-1 w-[97%] mx-auto"
                  style={{
                    backgroundColor: "#C03078",
                  }}
                ></div>

                <div className="modal-body">
                  {/* Title */}
                  <div className="relative mb-3 flex justify-center mx-4">
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

                  {/* Description */}
                  <div className="relative mb-3 flex justify-center mx-4">
                    <label htmlFor="publisher" className="w-1/2 mt-2">
                      Description
                    </label>
                    <textarea
                      maxLength={100}
                      className="form-control shadow-md mb-2"
                      id="publisher"
                      value={description}
                      readOnly
                    />
                  </div>

                  {/* URL */}
                  <div className="relative mb-3 flex justify-center mx-4">
                    <label htmlFor="url" className="w-1/2 mt-2">
                      URL
                    </label>
                    <input
                      type="url"
                      className="form-control shadow-md mb-2 cursor-pointer underline"
                      id="url"
                      value={url}
                      readOnly
                      onClick={() => window.open(url, "_blank")}
                      style={{ color: "#2563eb" }} // Tailwind blue-600 hex
                    />
                  </div>

                  {/* Active Till Date */}
                  <div className="relative mb-3 flex justify-center mx-4">
                    <label className="w-1/2 mt-2">Active Till Date</label>
                    <input
                      type="text"
                      className="form-control shadow-md mb-2"
                      value={activeTillDate ? activeTillDate : "N/A"}
                      readOnly
                    />
                  </div>

                  {/* Image */}
                  {/* {selectedImage ? (
                    <div className="relative mb-3 flex justify-center mx-4 ">
                      <label htmlFor="imageUpload" className="w-[50%] mt-2">
                        Attachments
                      </label>
                      <img
                        src={selectedImage}
                        alt="News"
                        className="shadow-md mb-2 max-h-40 object-contain border p-1"
                      />
                    </div>
                  ) : (
                    ""
                  )} */}
                  {/* Image */}
                  {selectedImage ? (
                    <div className="relative mb-3 flex justify-center mx-4">
                      <label className="w-1/2 mt-2">Attachments</label>
                      <div className="form-control shadow-md mb-2 flex items-center justify-start">
                        <img
                          src={selectedImage}
                          alt="News"
                          className="max-h-40 object-contain border p-1"
                        />
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
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
                    Are you sure you want to delete News :{" "}
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

        {showPublishModal && (
          <div
            className="modal"
            style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="flex justify-between p-3">
                  <h5 className="modal-title">Confirm Publish</h5>
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
                    Are you sure you want to publish News :{" "}
                    {currentSection?.title}?
                  </p>
                </div>
                <div className=" flex justify-end p-3">
                  <button
                    type="button"
                    className="btn btn-danger px-3 mb-2"
                    style={{}}
                    onClick={handleSubmitPublish}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Publishing..." : "Publish"}
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

export default News;
