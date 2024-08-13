import axios from "axios";
import ReactPaginate from "react-paginate";
import NavBar from "../../../Layouts/NavBar";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Divisions() {
  const API_URL = import.meta.env.VITE_API_URL; // url for host
  const [classes, setClasses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentClass, setCurrentClass] = useState(null);
  const [newClassName, setNewClassName] = useState("");
  const [newDepartmentId, setNewDepartmentId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const pageSize = 10;
  const [validationErrors, setValidationErrors] = useState({});

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const academicYr = localStorage.getItem("academicYear");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(`${API_URL}/api/getDivision`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Academic-Year": academicYr,
        },
        withCredentials: true,
      });

      setClasses(response.data);
      console.log(
        "This is the response of the getDivision api inside the division component",
        response.data
      );
      setPageCount(Math.ceil(response.data.length / pageSize));
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const academicYr = localStorage.getItem("academicYear");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        `${API_URL}/api/get_class_for_division`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Academic-Year": academicYr,
          },
          withCredentials: true,
        }
      );

      setDepartments(response.data);
      console.log(
        "The data of the get_class_for_divisions inside the division components",
        response.data
      );
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchDepartments();
  }, []);

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const validateClassData = (name, departmentId) => {
    const errors = {};
    if (!name || name.trim() === "") {
      errors.name = "The name field is required.";
    } else if (name.length > 30) {
      errors.name = "The name field must not exceed 255 characters.";
    }
    if (!departmentId || isNaN(departmentId)) {
      errors.department_id = "The department ID is required.";
    }
    return errors;
  };

  const handleInputChange = (setter, validator) => (e) => {
    const { value } = e.target;
    setter(value);
    const errors = validateClassData(newClassName, newDepartmentId);
    setValidationErrors(errors);
  };

  const handleEdit = (classItem) => {
    setCurrentClass(classItem);
    setNewClassName(classItem.name);
    setNewDepartmentId(classItem.department_id);
    console.log(
      "the department id is insidet the division component is ",
      newDepartmentId
    );
    setShowEditModal(true);
  };

  const handleAdd = () => {
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setNewClassName("");
    setNewDepartmentId("");
    setCurrentClass(null);
    setValidationErrors({});
  };

  const handleSubmitAdd = async () => {
    const errors = validateClassData(newClassName, newDepartmentId);
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      return; // Don't submit if there are validation errors
    }

    try {
      const token = localStorage.getItem("authToken");
      const academicYr = localStorage.getItem("academicYear");

      if (!token) {
        throw new Error("No authentication token found");
      }

      await axios.post(
        `${API_URL}/api/classes`,
        { name: newClassName, department_id: newDepartmentId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Academic-Year": academicYr,
          },
          withCredentials: true,
        }
      );

      fetchClasses();
      handleCloseModal();
      toast.success("Class added successfully!");
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(`Error adding class: ${error.response.data.message}`);
      } else {
        toast.error(`Error adding class: ${error.message}`);
      }
      console.error("Error adding class:", error);
    }
  };

  const handleSubmitEdit = async () => {
    const errors = validateClassData(newClassName, newDepartmentId);
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) {
      return; // Don't submit if there are validation errors
    }

    try {
      const token = localStorage.getItem("authToken");
      const academicYr = localStorage.getItem("academicYear");

      if (!token || !currentClass || !currentClass.class_id) {
        throw new Error("Class ID is missing");
      }

      await axios.put(
        `${API_URL}/api/classes/${currentClass.class_id}`,
        { name: newClassName, department_id: newDepartmentId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Academic-Year": academicYr,
          },
          withCredentials: true,
        }
      );

      fetchClasses();
      handleCloseModal();
      toast.success("Class updated successfully!");
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(`Error updating class: ${error.response.data.message}`);
      } else {
        toast.error(`Error updating class: ${error.message}`);
      }
      console.error("Error editing class:", error);
    }
  };

  const handleDelete = (id) => {
    const classToDelete = classes.find((cls) => cls.class_id === id);
    setCurrentClass(classToDelete);
    setShowDeleteModal(true);
  };

  const handleSubmitDelete = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const academicYr = localStorage.getItem("academicYear");

      if (!token || !currentClass || !currentClass.class_id) {
        throw new Error("Class ID is missing");
      }

      await axios.delete(`${API_URL}/api/classes/${currentClass.class_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Academic-Year": academicYr,
        },
        withCredentials: true,
      });

      fetchClasses();
      setShowDeleteModal(false);
      setCurrentClass(null);
      toast.success("Class deleted successfully!");
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(`Error deleting class: ${error.response.data.message}`);
      } else {
        toast.error(`Error deleting class: ${error.message}`);
      }
      console.error("Error deleting class:", error);
      // setError(error.message);
    }
  };

  const filteredClasses = classes.filter((cls) =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedClasses = filteredClasses.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      {/* <NavBar /> */}
      <ToastContainer />
      <div className="container mt-4">
        <div className="card mx-auto lg:w-3/4 shadow-lg">
          {/* <div className="card-header flex justify-between items-center">
            <h3 className="text-gray-700 mt-1 text-md lg:text-xl">Classes</h3>
            <div className=" box-border flex gap-x-2  justify-end md:h-10 ">
              <div className=" ">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                className="btn btn-primary btn-sm h-9"
                onClick={handleAdd}
              >
                <FontAwesomeIcon icon={faPlus} style={{ marginRight: "5px" }} />
                Add
              </button>
            </div>
          </div> */}
          <div className="card-header flex justify-between items-center">
            <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
              Division
            </h3>
            <div className="box-border flex md:gap-x-2 justify-end md:h-10">
              <div className=" w-1/2 md:w-fit mr-1">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                className="btn btn-primary btn-sm md:h-9 text-xs md:text-sm"
                onClick={handleAdd}
                // onClick={() => navigate("/CreateStaff")}
              >
                <FontAwesomeIcon icon={faPlus} style={{ marginRight: "5px" }} />
                Add
              </button>
            </div>
          </div>
          <div className="card-body w-full">
            <div className="h-96 lg:h-96 overflow-y-scroll lg:overflow-x-hidden">
              <div className="bg-white rounded-lg shadow-xs">
                <table className="min-w-full leading-normal table-auto">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        S.No
                      </th>
                      <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Divisions
                      </th>
                      <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        class
                      </th>
                      {/* <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Section
                      </th> */}
                      <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Edit
                      </th>
                      <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Delete
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {console.log("classLIst module api", displayedClasses)}
                    {displayedClasses.map((classItem, index) => (
                      <tr
                        key={classItem.class_id}
                        className={`${
                          index % 2 === 0 ? "bg-white" : "bg-gray-100"
                        } hover:bg-gray-50`}
                      >
                        <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                          <p className="text-gray-900 whitespace-no-wrap relative top-2">
                            {index + 1}
                          </p>
                        </td>
                        <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                          <p className="text-gray-900 whitespace-no-wrap relative top-2">
                            {classItem.name}
                          </p>
                        </td>
                        <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                          <p className="text-gray-900 whitespace-no-wrap relative top-2">
                            {classItem?.get_class?.name}
                          </p>
                        </td>
                        {/* <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                          <p className="text-gray-900 whitespace-no-wrap relative top-2">
                            {
                              departments.find(
                                (dep) =>
                                  dep.department_id === classItem.department_id
                              )?.name
                            }
                          </p>
                        </td> */}
                        <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                          <button
                            className="text-blue-600 hover:text-blue-800 hover:bg-transparent "
                            onClick={() => handleEdit(classItem)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                        </td>
                        <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                          <button
                            className="text-red-600 hover:text-red-800 hover:bg-transparent "
                            onClick={() => handleDelete(classItem.class_id)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </td>
                      </tr>
                    ))}
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
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
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
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50   flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal show" style={{ display: "block" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Create New Class</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseModal}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label htmlFor="newClassName">
                      Division Name <span className="text-red-500">*</span>{" "}
                    </label>
                    <input
                      type="text"
                      maxLength={30}
                      className="form-control"
                      placeholder="e.g 1,2"
                      id="newClassName"
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                    />{" "}
                    {validationErrors.name && (
                      <div className="text-danger">{validationErrors.name}</div>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="newDepartmentId">
                      Class <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="form-control"
                      id="newDepartmentId"
                      value={newDepartmentId}
                      onChange={(e) => setNewDepartmentId(e.target.value)}
                    >
                      <option value="">Select</option>
                      {departments.map((department) => (
                        <option
                          key={department.department_id}
                          value={department.department_id}
                        >
                          {department.name}
                        </option>
                      ))}
                    </select>
                    {validationErrors.department_id && (
                      <div className="text-danger">
                        {validationErrors.department_id}
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSubmitAdd}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50   flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal show " style={{ display: "block" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Class</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseModal}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label htmlFor="newClassName">
                      Class Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={30}
                      className="form-control"
                      id="newClassName"
                      value={newClassName}
                      placeholder="e.g 1,2"
                      onChange={(e) => setNewClassName(e.target.value)}
                    />
                    {validationErrors.name && (
                      <div className="text-danger">{validationErrors.name}</div>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="newDepartmentId">
                      Section <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="form-control"
                      id="newDepartmentId"
                      value={newDepartmentId}
                      onChange={(e) => setNewDepartmentId(e.target.value)}
                    >
                      <option value="">Select </option>
                      {departments.map((department) => (
                        <option
                          key={department.department_id}
                          value={department.department_id}
                        >
                          {department.name}
                        </option>
                      ))}
                    </select>
                    {validationErrors.department_id && (
                      <div className="text-danger">
                        {validationErrors.department_id}
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  {/* <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseModal}
                  >
                    Close
                  </button> */}
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSubmitEdit}
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50   flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal show " style={{ display: "block" }}>
            <div className="modal-dialog  modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Delete Class</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowDeleteModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete this class?</p>
                  <p>
                    <strong>{currentClass?.name}</strong>
                  </p>
                </div>
                <div className="modal-footer">
                  {/* <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button> */}
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleSubmitDelete}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Divisions;
