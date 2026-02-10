import { useEffect, useState, useRef } from "react";
import axios from "axios";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RxCross1 } from "react-icons/rx";

function CategoryGroup() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [className, setClassName] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  const [fieldErrors, setFieldErrors] = useState({});
  const [nameError, setNameError] = useState("");
  const [nameAvailable, setNameAvailable] = useState(true);
  const [roleId, setRoleId] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newLeaveType, setNewLeaveType] = useState("");

  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");

  const pageSize = 10;

  const fetchSections = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      const response = await axios.get(`${API_URL}/api/category-group`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data || [];
      setSections(data);
      // console.log("section", sections);
      setPageCount(Math.ceil(data.length / pageSize));
    } catch (error) {
      setError(error.message || "Error fetching data");
      toast.error(error.message || "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

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
      previousPageRef.current = currentPage;
      setCurrentPage(0);
    }

    if (trimmedSearch === "" && prevSearchTermRef.current !== "") {
      setCurrentPage(previousPageRef.current);
    }

    prevSearchTermRef.current = trimmedSearch;
  }, [searchTerm]);

  const filteredSections = Array.isArray(sections)
    ? sections.filter((leave) => {
        const searchLower = searchTerm.trim().toLowerCase();
        return leave.category_group_name?.toLowerCase().includes(searchLower);
      })
    : [];

  useEffect(() => {
    setPageCount(Math.ceil(filteredSections.length / pageSize));
  }, [filteredSections, pageSize]);

  const displayedSections = filteredSections.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize,
  );

  const validateSectionName = (name) => {
    const errors = {};

    if (!name || name.trim() === "") {
      errors.name = "Please enter category group name.";
    }

    return errors;
  };

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const handleEdit = (leave) => {
    setCurrentSection(leave);
    // console.log("category_group_id", leave);
    setNewLeaveType(leave.category_group_name);
    setShowEditModal(true);
  };

  const handleAdd = () => {
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setClassName("");

    setNewLeaveType("");
    setCurrentSection(null);
    setFieldErrors({});
    setNameError("");
  };

  const handleSubmitAdd = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const validationErrors = validateSectionName(newLeaveType);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      const response = await axios.post(
        `${API_URL}/api/category-group`,
        { name: newLeaveType },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        },
      );

      console.log("response", response);

      toast.success("Category Group added successfully!");
      setNameError("");
      setNameAvailable(true);

      fetchSections();
      handleCloseModal();
    } catch (error) {
      console.error("Error adding Category Group:", error);

      if (error.response && error.response.status === 422) {
        const errorMessage = "This Category group name already exist.";
        // error.response.data?.errors?.name?.[0] ||
        // "The Name field must contain a unique value.";
        toast.error(errorMessage);
        setFieldErrors((prev) => ({ ...prev, name: errorMessage }));
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

    const validationErrors = validateSectionName(newLeaveType);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");

      if (!token || !currentSection) {
        throw new Error("No authentication token or Category Group ID found.");
      }

      const response = await axios.put(
        `${API_URL}/api/category-group/${currentSection.category_group_id}`,
        { name: newLeaveType },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        },
      );

      console.log("response", response);

      toast.success("Category Group updated successfully!");
      setNameError("");
      fetchSections();
      handleCloseModal();
    } catch (error) {
      console.error("Error updating Category Group:", error);

      if (error.response) {
        const { status, data } = error.response;

        if (status === 422) {
          const errorMessage = "The Category group already exist.";
          // data?.errors?.name?.[0] ||
          // "The Name field must contain a unique value.";

          toast.error(errorMessage);
          setFieldErrors((prev) => ({ ...prev, name: errorMessage }));
        } else if (status === 400 && data?.message) {
          toast.error(data.message);
          setFieldErrors((prev) => ({ ...prev, name: data.message }));
        } else {
          toast.error("Server error. Please try again later.");
        }
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    // console.log("id", id);
    setCurrentSection("");
    const sectionToDelete = sections.find(
      (leave) => leave.category_group_id === id,
    );

    setCurrentSection(sectionToDelete);
    setShowDeleteModal(true);
  };

  const handleSubmitDelete = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");
      const academicYr = localStorage.getItem("academicYear");

      if (!token || !currentSection || !currentSection.category_group_id) {
        throw new Error("Category Group is missing");
      }

      const response = await axios.delete(
        `${API_URL}/api/category-group/${currentSection.category_group_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        },
      );
      fetchSections();
      if (response.status === 200) {
        setShowDeleteModal(false);
        setCurrentSection(null);
        toast.success("Category Group deleted successfully!");
      } else {
        toast.error(response.data.message || "Failed to delete Category Group");
      }
    } catch (error) {
      console.error("Error deleting Category Group:", error);
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

  const handleChangeSectionName = (e) => {
    // console.log(setNewLeaveType);
    const { value } = e.target;

    setNewLeaveType(value);
    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      name: validateSectionName(value).name,
    }));
  };

  const reset = () => {
    setNewLeaveType("");
  };

  return (
    <>
      <ToastContainer />

      <div className="container  mt-4">
        <div className="card mx-auto lg:w-[70%] shadow-lg">
          <div className="p-2 px-3 bg-gray-100 flex justify-between items-center">
            <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
              Category Group
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
            <div className="h-96 lg:h-96 w-full md:w-[80%] mx-auto  overflow-y-scroll lg:overflow-x-hidden ">
              <div className="bg-white  rounded-lg shadow-xs ">
                <table className="min-w-full leading-normal table-auto ">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="px-2 w-full md:w-[12%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Sr.No
                      </th>
                      <th className=" -px-2  w-full md:w-[25%] text-center py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Category Group
                      </th>
                      <th className="px-2 w-full md:w-[14%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Edit
                      </th>
                      <th className="px-2 w-full md:w-[14%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Delete
                      </th>
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
                      displayedSections.map((leave, index) => (
                        <tr
                          key={leave.category_group_id}
                          className={`${
                            index % 2 === 0 ? "bg-white" : "bg-gray-100"
                          } hover:bg-gray-50`}
                        >
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {currentPage * pageSize + index + 1}
                            </p>
                          </td>
                          <td className="text-center px-2  border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {leave.category_group_name}
                            </p>
                          </td>
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <button
                              className="text-blue-600 hover:text-blue-800 hover:bg-transparent "
                              onClick={() => handleEdit(leave)}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>{" "}
                          </td>
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <button
                              className="text-red-600 hover:text-red-800 hover:bg-transparent "
                              onClick={() =>
                                handleDelete(leave.category_group_id)
                              }
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

            <div className=" flex justify-center pt-2 -mb-3">
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
                    <h5 className="modal-title">Create Category Group Name</h5>

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
                    {" "}
                    <div className=" relative mb-2 flex justify-center  ">
                      <label htmlFor="sectionName" className="w-3/4 mt-2">
                        Category Group Name
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={30}
                        className="form-control shadow-md mb-2"
                        id="sectionName"
                        value={newLeaveType}
                        onChange={handleChangeSectionName}
                      />
                      <div className="absolute top-9 left-[42%]">
                        {fieldErrors.name && (
                          <span className="text-danger text-xs">
                            {fieldErrors.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className=" flex justify-end">
                    <button
                      type="button"
                      className="btn btn-primary px-3 mb-2 mr-2 "
                      style={{}}
                      onClick={handleSubmitAdd}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : "Add"}
                    </button>

                    <button
                      type="button"
                      className="btn btn-danger px-3 mb-2 mr-2"
                      style={{}}
                      onClick={() => reset()}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showEditModal && (
          <div
            className="modal"
            style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="flex justify-between p-3">
                  <h5 className="modal-title">Edit Category Group Name</h5>
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
                  <div className=" relative mb-2 flex justify-center ">
                    <label htmlFor="editSectionName" className="w-3/4 mt-2">
                      Category Group Name<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={30}
                      className="form-control shadow-md mb-2"
                      id="editSectionName"
                      value={newLeaveType}
                      onChange={handleChangeSectionName}
                    />
                    <div className="absolute top-9 left-[42%] ">
                      {fieldErrors.name && (
                        <span className="text-danger text-xs">
                          {fieldErrors.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className=" flex justify-end ">
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
                    className="btn btn-danger px-3 mb-2 mr-2"
                    style={{}}
                    onClick={() => reset()}
                  >
                    Reset
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
                    Are you sure you want to delete Category Group:{" "}
                    {/* {console.log(currentSection.name)} */}
                    {currentSection.category_group_name}?
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

export default CategoryGroup;
