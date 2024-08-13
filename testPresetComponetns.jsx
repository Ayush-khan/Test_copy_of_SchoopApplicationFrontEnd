import axios from "axios";
import ReactPaginate from "react-paginate";
import NavBar from "../../../Layouts/NavBar";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ClassList() {
  const API_URL = import.meta.env.VITE_API_URL;
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
  const [nameAvailable, setNameAvailable] = useState(true);
  const [nameError, setNameError] = useState("");

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const academicYr = localStorage.getItem("academicYear");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(`${API_URL}/api/classes`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Academic-Year": academicYr,
        },
        withCredentials: true,
      });

      setClasses(response.data);
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

      const response = await axios.get(`${API_URL}/api/sections`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Academic-Year": academicYr,
        },
        withCredentials: true,
      });

      setDepartments(response.data);
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
      errors.name = "The name field must not exceed 30 characters.";
    }
    if (!departmentId || isNaN(departmentId)) {
      errors.department_id = "The department ID is required.";
    }
    return errors;
  };

  const handleInputChange = (setter) => (e) => {
    const { value } = e.target;
    setter(value);
    const errors = validateClassData(newClassName, newDepartmentId);
    setValidationErrors(errors);
  };

  const handleBlur = async () => {
    try {
      const token = localStorage.getItem("authToken");
      console.log("the response of the namechack api____");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.post(
        `${API_URL}/api/check_class_name`,
        { name: newClassName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      console.log("the response of the namechack api", response.data);
      if (response.data?.exists === true) {
        setNameError("Name is already taken. Please select another name.");
        setNameAvailable(false);
      } else {
        setNameError("");
        setNameAvailable(true);
      }
    } catch (error) {
      console.error("Error checking class name:", error);
    }
  };

  const handleEdit = (classItem) => {
    setCurrentClass(classItem);
    setNewClassName(classItem.name);
    setNewDepartmentId(classItem.department_id);
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
    setNameError("");
  };

  const handleSubmitAdd = async () => {
    const errors = validateClassData(newClassName, newDepartmentId);
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0 || !nameAvailable) {
      return;
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

    if (Object.keys(errors).length > 0 || !nameAvailable) {
      return;
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
      <NavBar />
      <div className="container mt-4">
        <div className="d-flex justify-content-between mb-3">
          <h1>Class List</h1>
          <button className="btn btn-primary" onClick={handleAdd}>
            <FontAwesomeIcon icon={faPlus} /> Add Class
          </button>
        </div>

        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedClasses.length > 0 ? (
              displayedClasses.map((classItem) => (
                <tr key={classItem.class_id}>
                  <td>{classItem.name}</td>
                  <td>
                    {departments.find(
                      (dept) => dept.department_id === classItem.department_id
                    )?.name || "N/A"}
                  </td>
                  <td>
                    <button
                      className="btn btn-info btn-sm mx-1"
                      onClick={() => handleEdit(classItem)}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      className="btn btn-danger btn-sm mx-1"
                      onClick={() => handleDelete(classItem.class_id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No classes found</td>
              </tr>
            )}
          </tbody>
        </table>

        <ReactPaginate
          pageCount={pageCount}
          onPageChange={handlePageClick}
          containerClassName="pagination"
          pageClassName="page-item"
          pageLinkClassName="page-link"
          previousClassName="page-item"
          previousLinkClassName="page-link"
          nextClassName="page-item"
          nextLinkClassName="page-link"
          breakClassName="page-item"
          breakLinkClassName="page-link"
          activeClassName="active"
        />

        {/* Add Modal */}
        {showAddModal && (
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add Class</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseModal}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="className" className="form-label">
                      Class Name
                    </label>
                    <input
                      type="text"
                      id="className"
                      className="form-control"
                      value={newClassName}
                      onChange={handleInputChange(setNewClassName)}
                      onBlur={handleBlur}
                    />
                    {validationErrors.name && (
                      <div className="text-danger">{validationErrors.name}</div>
                    )}
                    {!nameAvailable && (
                      <div className="text-danger">{nameError}</div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="department" className="form-label">
                      Department
                    </label>
                    <select
                      id="department"
                      className="form-select"
                      value={newDepartmentId}
                      onChange={(e) => setNewDepartmentId(e.target.value)}
                    >
                      <option value="">Select a department</option>
                      {departments.map((dept) => (
                        <option
                          key={dept.department_id}
                          value={dept.department_id}
                        >
                          {dept.name}
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
                    className="btn btn-secondary"
                    onClick={handleCloseModal}
                  >
                    Close
                  </button>
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
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog">
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
                  <div className="mb-3">
                    <label htmlFor="className" className="form-label">
                      Class Name
                    </label>
                    <input
                      type="text"
                      id="className"
                      className="form-control"
                      value={newClassName}
                      onChange={handleInputChange(setNewClassName)}
                      onBlur={handleBlur}
                    />
                    {validationErrors.name && (
                      <div className="text-danger">{validationErrors.name}</div>
                    )}
                    {!nameAvailable && (
                      <div className="text-danger">{nameError}</div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="department" className="form-label">
                      Department
                    </label>
                    <select
                      id="department"
                      className="form-select"
                      value={newDepartmentId}
                      onChange={(e) => setNewDepartmentId(e.target.value)}
                    >
                      <option value="">Select a department</option>
                      {departments.map((dept) => (
                        <option
                          key={dept.department_id}
                          value={dept.department_id}
                        >
                          {dept.name}
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
                    className="btn btn-secondary"
                    onClick={handleCloseModal}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSubmitEdit}
                  >
                    Save changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Delete Class</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseModal}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>
                    Are you sure you want to delete the class "
                    {currentClass?.name}"?
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseModal}
                  >
                    Close
                  </button>
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
        )}

        <ToastContainer />
      </div>
    </>
  );
}

export default ClassList;
