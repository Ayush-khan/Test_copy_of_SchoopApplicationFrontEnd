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
import { useNavigate } from "react-router-dom";

function Periodicals() {
  const API_URL = import.meta.env.VITE_API_URL; // URL for host
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [currentSection, setCurrentSection] = useState(null);
  const [newSectionName, setNewSectionName] = useState("");
  const [frequency, setFrequency] = useState("");
  const [subscriptionNo, setSubscriptionNo] = useState("");
  const [email, setEmail] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  const [fieldErrors, setFieldErrors] = useState({});
  const [nameError, setNameError] = useState("");
  const [nameAvailable, setNameAvailable] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [session, setSession] = useState("");

  const [url, setUrl] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const academicYrTo = localStorage.getItem("academic_yr_to");
  // console.log("acadmeic", academicYrTo);

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
      // console.log("session data", response.data);

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

      const response = await axios.get(`${API_URL}/api/library/periodicals`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      // console.log("Periodicals data", response.data.data);

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
    const searchLower = searchTerm.trim().replace(/\s+/g, " ").toLowerCase();

    const serviceMatch = section?.title
      ?.trim()
      .toLowerCase()
      .includes(searchLower);

    const subscriptionNO = section?.subscription_no
      ?.trim()
      .toLowerCase()
      .includes(searchLower);

    const frequency = section?.frequency
      ?.trim()
      .toLowerCase()
      .includes(searchLower);

    const emailId = section?.email_ids
      ?.trim()
      .toLowerCase()
      .includes(searchLower);

    const createDate = formatDate(section?.create_date).includes(searchLower);

    return serviceMatch || subscriptionNO || frequency || emailId || createDate;
  });

  // Update page count based on filtered results
  useEffect(() => {
    setPageCount(Math.ceil(filteredSections.length / pageSize));
  }, [filteredSections, pageSize]);

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
    setNewSectionName(section.title || "");
    setSubscriptionNo(section.subscription_no || "");
    let freq = "";
    if (section.frequency === "Weekly") freq = "Weekly";
    else if (section.frequency === "Bimonthly") freq = "Bimonthly";
    else if (section.frequency === "Monthly") freq = "Monthly";

    setFrequency(freq);
    setEmail(section.email_ids || "");
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

    setNewSectionName("");
    setSubscriptionNo("");
    setFrequency("");
    setEmail("");

    setCurrentSection(null);
    setFieldErrors({});
    setNameError("");
  };

  const handleDelete = (id) => {
    // console.log("the deleted periodicals id", id);
    const sectionToDelete = sections.find((sec) => sec.periodical_id === id);
    // console.log("the deleted ", sectionToDelete);
    setCurrentSection(sectionToDelete);
    setShowDeleteModal(true);
  };

  const handleSubmitDelete = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");

      if (!token || !currentSection?.periodical_id) {
        throw new Error("Periodicals Id is missing");
      }

      const response = await axios.delete(
        `${API_URL}/api/library/periodicals/${currentSection.periodical_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        },
      );

      // console.log("Delete API response:", response.data);

      if (response.data.status === true) {
        fetchSections();
        toast.success(
          response.data.message || "Periodical deleted successfully.",
        );

        setShowDeleteModal(false);
        setCurrentSection(null);
      } else {
        toast.error(response.data.message || "Failed to delete periodical.");
      }
    } catch (error) {
      console.error("Error deleting periodical:", error);

      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Server error. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeSectionName = (e) => {
    const value = e.target.value;
    setNewSectionName(value);

    // Example validation
    if (!value.trim()) {
      setFieldErrors((prev) => ({ ...prev, title: "Please enter title" }));
    } else {
      setFieldErrors((prev) => ({ ...prev, title: "" }));
    }
  };

  const handleChangeSubscription = (e) => {
    const value = e.target.value;
    setSubscriptionNo(value);

    if (!value.trim()) {
      setFieldErrors((prev) => ({
        ...prev,
        subscriptionNo: "Please enter subscription no.",
      }));
    } else {
      setFieldErrors((prev) => ({ ...prev, subscriptionNo: "" }));
    }
  };

  const handleChangeFrequency = (e) => {
    setFrequency(e.target.value);
    if (!e.target.value) {
      setFieldErrors((prev) => ({
        ...prev,
        frequency: "Please selct frequency.",
      }));
    } else {
      setFieldErrors((prev) => ({ ...prev, frequency: "" }));
    }
  };

  const handleChangeEmail = (e) => {
    setEmail(e.target.value);
    // Optional: simple email validation
    // const emailRegex =
    //   /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;
    // if (email && !email.split(",").every((em) => emailRegex.test(em.trim())))
    if (email) {
      setFieldErrors((prev) => ({
        ...prev,
        email: "Please enter email.",
      }));
    } else {
      setFieldErrors((prev) => ({ ...prev, email: "" }));
    }
  };

  const handleSubmitAdd = async () => {
    if (!newSectionName || !subscriptionNo || !frequency) {
      toast.error("Please fill all required fields");
      return;
    }

    const payload = {
      title: newSectionName,
      subscription_no: subscriptionNo,
      frequency: frequency,
      email_ids: email,
    };

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        `${API_URL}/api/library/periodicals`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.status) {
        toast.success("Periodical added successfully.");
        setNewSectionName("");
        setSubscriptionNo("");
        setFrequency("");
        setEmail("");
        setFieldErrors({});
        handleCloseModal();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to add periodical");
    }
  };

  const handleSubmitEdit = async () => {
    if (!newSectionName || !subscriptionNo || !frequency) {
      toast.error("Please fill all required fields");
      return;
    }

    const payload = {
      title: newSectionName,
      subscription_no: subscriptionNo,
      frequency: frequency,
      email_ids: email,
    };

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.put(
        `${API_URL}/api/library/periodicals/${currentSection.periodical_id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.status) {
        toast.success("Periodical updated successfully.");
        fetchSections();
        setNewSectionName("");
        setSubscriptionNo("");
        setFrequency("");
        setEmail("");
        setFieldErrors({});
        handleCloseModal();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to add periodical");
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="container mt-4">
        <div className="card mx-auto w-full shadow-lg">
          <div className="p-2 px-3 bg-gray-100 flex justify-between items-center">
            <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
              Periodicals
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
              <RxCross1
                className="text-red-600 cursor-pointer hover:bg-red-100 rounded text-xl mt-1.5"
                onClick={() => navigate("/dashboard")}
              />
            </div>
          </div>
          <div
            className=" relative w-[97%]   mb-3 h-1  mx-auto bg-red-700"
            style={{
              backgroundColor: "#C03078",
            }}
          ></div>
          <div className="card-body w-full">
            <div className="lg:h-96 overflow-y-scroll lg:overflow-x-hidden">
              <div className="bg-white rounded-lg shadow-xs">
                <table className="min-w-full leading-normal table-auto">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="px-2 w-full md:w-[7%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Sr. No
                      </th>
                      <th className="px-2 w-full md:w-[20%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Magazine Title
                      </th>
                      <th className="px-2 w-full md:w-[20%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Subscription No.
                      </th>
                      <th className="px-2 w-full md:w-[10%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Frequency
                      </th>
                      <th className="px-2 w-full md:w-[20%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Email Id
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
                      <tr>
                        <td colSpan={7} className="py-20">
                          <div className="flex justify-center items-center text-blue-700 text-base sm:text-lg">
                            Please wait while data is loading...
                          </div>
                        </td>
                      </tr>
                    ) : displayedSections.length > 0 ? (
                      displayedSections.map((section, index) => (
                        <tr
                          key={section.periodical_id}
                          className={`${index % 2 === 0 ? "bg-white" : "bg-gray-100"} hover:bg-gray-50`}
                        >
                          <td className="text-center px-2 py-2 border border-gray-950 text-sm">
                            {currentPage * pageSize + index + 1}
                          </td>

                          <td className="text-center px-2 py-2 border border-gray-950 text-sm">
                            {section?.title}
                          </td>

                          <td className="text-center px-2 py-2 border border-gray-950 text-sm">
                            {section?.subscription_no}
                          </td>

                          <td className="text-center px-2 py-2 border border-gray-950 text-sm">
                            {section?.frequency}
                          </td>

                          <td className="text-center px-2 py-2 border border-gray-950 text-sm">
                            {section?.email_ids}
                          </td>

                          <td className="text-center px-2 py-2 border border-gray-950 text-sm">
                            <button
                              className="text-blue-600"
                              onClick={() => handleEdit(section)}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                          </td>

                          <td className="text-center px-2 py-2 border border-gray-950 text-sm">
                            {section.isDelete === "Y" ? (
                              <span className="text-red-600 font-semibold">
                                Deleted
                              </span>
                            ) : (
                              <button
                                onClick={() =>
                                  handleDelete(section.periodical_id)
                                }
                                className="text-red-600"
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : sections.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-20">
                          <div className="text-center text-red-700 text-base sm:text-lg">
                            Create periodicals to view.
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-20">
                          <div className="text-center text-red-700 text-base sm:text-lg">
                            Result not found!
                          </div>
                        </td>
                      </tr>
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
                    <h5 className="modal-title">Create Periodicals</h5>
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
                  <div className="modal-body space-y-4 p-4">
                    {/* Title */}
                    <div className="flex items-center gap-4">
                      <label htmlFor="title" className="w-1/3 ">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <div className="w-2/3">
                        <input
                          type="text"
                          maxLength={30}
                          id="title"
                          value={newSectionName}
                          onChange={handleChangeSectionName}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                        {(!nameAvailable || fieldErrors.title) && (
                          <small className="text-danger text-xs">
                            {nameError || fieldErrors.title}
                          </small>
                        )}
                      </div>
                    </div>

                    {/* Subscription No */}
                    <div className="flex items-center gap-4">
                      <label htmlFor="subscriptionno" className="w-1/3 ">
                        Subscription No <span className="text-red-500">*</span>
                      </label>
                      <div className="w-2/3">
                        <input
                          type="text"
                          maxLength={30}
                          id="subscriptionno"
                          value={subscriptionNo}
                          onChange={handleChangeSubscription}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                        {fieldErrors.subscriptionNo && (
                          <small className="text-danger text-xs">
                            {fieldErrors.subscriptionNo}
                          </small>
                        )}
                      </div>
                    </div>

                    {/* Frequency */}
                    <div className="flex items-center gap-4">
                      <label htmlFor="frequency" className="w-1/3 ">
                        Frequency <span className="text-red-500">*</span>
                      </label>
                      <div className="w-2/3">
                        <select
                          id="frequency"
                          name="frequency"
                          value={frequency}
                          onChange={handleChangeFrequency}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                        >
                          <option value="">Select</option>
                          <option value="Weekly">Weekly</option>
                          <option value="Bimonthly">Bi-Monthly</option>
                          <option value="Monthly">Monthly</option>
                        </select>
                        {fieldErrors.frequency && (
                          <small className="text-danger text-xs">
                            {fieldErrors.frequency}
                          </small>
                        )}
                      </div>
                    </div>

                    {/* Email IDs */}
                    <div className="flex items-center gap-4">
                      <label htmlFor="email" className="w-1/3">
                        Email Ids
                      </label>
                      <div className="w-2/3">
                        <input
                          type="email"
                          id="email"
                          value={email}
                          onChange={handleChangeEmail}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                          maxLength={30}
                        />
                      </div>
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
                  <h5 className="modal-title">Edit Periodicals</h5>
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
                <div className="modal-body space-y-4 p-4">
                  {/* Title */}
                  <div className="flex items-center gap-4">
                    <label htmlFor="title" className="w-1/3 ">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <div className="w-2/3">
                      <input
                        type="text"
                        maxLength={30}
                        id="title"
                        value={newSectionName}
                        onChange={handleChangeSectionName}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                      />
                      {(!nameAvailable || fieldErrors.title) && (
                        <small className="text-danger text-xs">
                          {nameError || fieldErrors.title}
                        </small>
                      )}
                    </div>
                  </div>

                  {/* Subscription No */}
                  <div className="flex items-center gap-4">
                    <label htmlFor="subscriptionno" className="w-1/3 ">
                      Subscription No <span className="text-red-500">*</span>
                    </label>
                    <div className="w-2/3">
                      <input
                        type="text"
                        maxLength={30}
                        id="subscriptionno"
                        value={subscriptionNo}
                        onChange={handleChangeSubscription}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                      />
                      {fieldErrors.subscriptionNo && (
                        <small className="text-danger text-xs">
                          {fieldErrors.subscriptionNo}
                        </small>
                      )}
                    </div>
                  </div>

                  {/* Frequency */}
                  <div className="flex items-center gap-4">
                    <label htmlFor="frequency" className="w-1/3 ">
                      Frequency <span className="text-red-500">*</span>
                    </label>
                    <div className="w-2/3">
                      <select
                        id="frequency"
                        name="frequency"
                        value={frequency}
                        onChange={handleChangeFrequency}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                      >
                        <option value="">Select</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Bimonthly">Bi-Monthly</option>
                        <option value="Monthly">Monthly</option>
                      </select>
                      {fieldErrors.frequency && (
                        <small className="text-danger text-xs">
                          {fieldErrors.frequency}
                        </small>
                      )}
                    </div>
                  </div>

                  {/* Email IDs */}
                  <div className="flex items-center gap-4">
                    <label htmlFor="email" className="w-1/3">
                      Email Ids
                    </label>
                    <div className="w-2/3">
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={handleChangeEmail}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                        maxLength={30}
                      />
                    </div>
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
                    Are you sure you want to delete Periodicals :{" "}
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

export default Periodicals;
