// // import axios from "axios";
// // import ReactPaginate from "react-paginate";
// // import NavBar from "../../../Layouts/NavBar";
// // import "bootstrap/dist/css/bootstrap.min.css";
// // import { useState, useEffect } from "react";
// // import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// // import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
// // import { ToastContainer, toast } from "react-toastify";
// // import "react-toastify/dist/ReactToastify.css";

// // function ClassList() {
// //   const API_URL = import.meta.env.VITE_API_URL;
// //   const [classes, setClasses] = useState([]);
// //   const [departments, setDepartments] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState(null);
// //   const [showAddModal, setShowAddModal] = useState(false);
// //   const [showEditModal, setShowEditModal] = useState(false);
// //   const [showDeleteModal, setShowDeleteModal] = useState(false);
// //   const [currentClass, setCurrentClass] = useState(null);
// //   const [newClassName, setNewClassName] = useState("");
// //   const [newDepartmentId, setNewDepartmentId] = useState("");
// //   const [searchTerm, setSearchTerm] = useState("");
// //   const [currentPage, setCurrentPage] = useState(0);
// //   const [pageCount, setPageCount] = useState(0);
// //   const pageSize = 10;
// //   const [validationErrors, setValidationErrors] = useState({});
// //   const [nameAvailable, setNameAvailable] = useState(true);
// //   const [nameError, setNameError] = useState("");

// //   const fetchClasses = async () => {
// //     try {
// //       const token = localStorage.getItem("authToken");
// //       const academicYr = localStorage.getItem("academicYear");

// //       if (!token) {
// //         throw new Error("No authentication token found");
// //       }

// //       const response = await axios.get(`${API_URL}/api/classes`, {
// //         headers: {
// //           Authorization: `Bearer ${token}`,
// //           "X-Academic-Year": academicYr,
// //         },
// //         withCredentials: true,
// //       });

// //       setClasses(response.data);
// //       setPageCount(Math.ceil(response.data.length / pageSize));
// //     } catch (error) {
// //       setError(error.message);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const fetchDepartments = async () => {
// //     try {
// //       const token = localStorage.getItem("authToken");
// //       const academicYr = localStorage.getItem("academicYear");

// //       if (!token) {
// //         throw new Error("No authentication token found");
// //       }

// //       const response = await axios.get(`${API_URL}/api/sections`, {
// //         headers: {
// //           Authorization: `Bearer ${token}`,
// //           "X-Academic-Year": academicYr,
// //         },
// //         withCredentials: true,
// //       });

// //       setDepartments(response.data);
// //     } catch (error) {
// //       setError(error.message);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchClasses();
// //     fetchDepartments();
// //   }, []);

// //   const handlePageClick = (data) => {
// //     setCurrentPage(data.selected);
// //   };

// //   const validateClassData = (name, departmentId) => {
// //     const errors = {};
// //     if (!name || name.trim() === "") {
// //       errors.name = "The name field is required.";
// //     } else if (name.length > 30) {
// //       errors.name = "The name field must not exceed 30 characters.";
// //     }
// //     if (!departmentId || isNaN(departmentId)) {
// //       errors.department_id = "The department ID is required.";
// //     }
// //     return errors;
// //   };

// //   const handleInputChange = (setter) => (e) => {
// //     const { value } = e.target;
// //     setter(value);
// //     const errors = validateClassData(newClassName, newDepartmentId);
// //     setValidationErrors(errors);
// //   };

// //   const handleBlur = async () => {
// //     try {
// //       const token = localStorage.getItem("authToken");
// //       console.log("the response of the namechack api____");

// //       if (!token) {
// //         throw new Error("No authentication token found");
// //       }

// //       const response = await axios.post(
// //         `${API_URL}/api/check_class_name`,
// //         { name: newClassName },
// //         {
// //           headers: {
// //             Authorization: `Bearer ${token}`,
// //           },
// //           withCredentials: true,
// //         }
// //       );
// //       console.log("the response of the namechack api", response.data);
// //       if (response.data?.exists === true) {
// //         setNameError("Name is already taken. Please select another name.");
// //         setNameAvailable(false);
// //       } else {
// //         setNameError("");
// //         setNameAvailable(true);
// //       }
// //     } catch (error) {
// //       console.error("Error checking class name:", error);
// //     }
// //   };

// //   const handleEdit = (classItem) => {
// //     setCurrentClass(classItem);
// //     setNewClassName(classItem.name);
// //     setNewDepartmentId(classItem.department_id);
// //     setShowEditModal(true);
// //   };

// //   const handleAdd = () => {
// //     setShowAddModal(true);
// //   };

// //   const handleCloseModal = () => {
// //     setShowAddModal(false);
// //     setShowEditModal(false);
// //     setShowDeleteModal(false);
// //     setNewClassName("");
// //     setNewDepartmentId("");
// //     setCurrentClass(null);
// //     setValidationErrors({});
// //     setNameError("");
// //   };

// //   const handleSubmitAdd = async () => {
// //     const errors = validateClassData(newClassName, newDepartmentId);
// //     setValidationErrors(errors);

// //     if (Object.keys(errors).length > 0 || !nameAvailable) {
// //       return;
// //     }

// //     try {
// //       const token = localStorage.getItem("authToken");
// //       const academicYr = localStorage.getItem("academicYear");

// //       if (!token) {
// //         throw new Error("No authentication token found");
// //       }

// //       await axios.post(
// //         `${API_URL}/api/classes`,
// //         { name: newClassName, department_id: newDepartmentId },
// //         {
// //           headers: {
// //             Authorization: `Bearer ${token}`,

// //           },
// //           withCredentials: true,
// //         }
// //       );

// //       fetchClasses();
// //       handleCloseModal();
// //       toast.success("Class added successfully!");
// //     } catch (error) {
// //       if (error.response && error.response.data) {
// //         toast.error(`Error adding class: ${error.response.data.message}`);
// //       } else {
// //         toast.error(`Error adding class: ${error.message}`);
// //       }
// //       console.error("Error adding class:", error);
// //     }
// //   };

// //   const handleSubmitEdit = async () => {
// //     const errors = validateClassData(newClassName, newDepartmentId);
// //     setValidationErrors(errors);

// //     if (Object.keys(errors).length > 0 || !nameAvailable) {
// //       return;
// //     }

// //     try {
// //       const token = localStorage.getItem("authToken");
// //       const academicYr = localStorage.getItem("academicYear");

// //       if (!token || !currentClass || !currentClass.class_id) {
// //         throw new Error("Class ID is missing");
// //       }

// //       await axios.put(
// //         `${API_URL}/api/classes/${currentClass.class_id}`,
// //         { name: newClassName, department_id: newDepartmentId },
// //         {
// //           headers: {
// //             Authorization: `Bearer ${token}`,

// //           },
// //           withCredentials: true,
// //         }
// //       );

// //       fetchClasses();
// //       handleCloseModal();
// //       toast.success("Class updated successfully!");
// //     } catch (error) {
// //       if (error.response && error.response.data) {
// //         toast.error(`Error updating class: ${error.response.data.message}`);
// //       } else {
// //         toast.error(`Error updating class: ${error.message}`);
// //       }
// //       console.error("Error editing class:", error);
// //     }
// //   };

// //   const handleDelete = (id) => {
// //     const classToDelete = classes.find((cls) => cls.class_id === id);
// //     setCurrentClass(classToDelete);
// //     setShowDeleteModal(true);
// //   };

// //   const handleSubmitDelete = async () => {
// //     try {
// //       const token = localStorage.getItem("authToken");
// //       const academicYr = localStorage.getItem("academicYear");

// //       if (!token || !currentClass || !currentClass.class_id) {
// //         throw new Error("Class ID is missing");
// //       }

// //       await axios.delete(`${API_URL}/api/classes/${currentClass.class_id}`, {
// //         headers: {
// //           Authorization: `Bearer ${token}`,
// //           "X-Academic-Year": academicYr,
// //         },
// //         withCredentials: true,
// //       });

// //       fetchClasses();
// //       setShowDeleteModal(false);
// //       setCurrentClass(null);
// //       toast.success("Class deleted successfully!");
// //     } catch (error) {
// //       if (error.response && error.response.data) {
// //         toast.error(`Error deleting class: ${error.response.data.message}`);
// //       } else {
// //         toast.error(`Error deleting class: ${error.message}`);
// //       }
// //       console.error("Error deleting class:", error);
// //     }
// //   };

// //   const filteredClasses = classes.filter((cls) =>
// //     cls.name.toLowerCase().includes(searchTerm.toLowerCase())
// //   );

// //   const displayedClasses = filteredClasses.slice(
// //     currentPage * pageSize,
// //     (currentPage + 1) * pageSize
// //   );

// //   if (loading) return <p>Loading...</p>;
// //   if (error) return <p>Error: {error}</p>;

// //   return (
// //     <>
// //       <NavBar />
// //       <div className="container mt-4">
// //         <div className="d-flex justify-content-between mb-3">
// //           <h1>Class List</h1>
// //           <button className="btn btn-primary" onClick={handleAdd}>
// //             <FontAwesomeIcon icon={faPlus} /> Add Class
// //           </button>
// //         </div>

// //         <div className="mb-3">
// //           <input
// //             type="text"
// //             className="form-control"
// //             placeholder="Search..."
// //             value={searchTerm}
// //             onChange={(e) => setSearchTerm(e.target.value)}
// //           />
// //         </div>

// //         <table className="table">
// //           <thead>
// //             <tr>
// //               <th>Name</th>
// //               <th>Department</th>
// //               <th>Actions</th>
// //             </tr>
// //           </thead>
// //           <tbody>
// //             {displayedClasses.length > 0 ? (
// //               displayedClasses.map((classItem) => (
// //                 <tr key={classItem.class_id}>
// //                   <td>{classItem.name}</td>
// //                   <td>
// //                     {departments.find(
// //                       (dept) => dept.department_id === classItem.department_id
// //                     )?.name || "N/A"}
// //                   </td>
// //                   <td>
// //                     <button
// //                       className="btn btn-info btn-sm mx-1"
// //                       onClick={() => handleEdit(classItem)}
// //                     >
// //                       <FontAwesomeIcon icon={faEdit} />
// //                     </button>
// //                     <button
// //                       className="btn btn-danger btn-sm mx-1"
// //                       onClick={() => handleDelete(classItem.class_id)}
// //                     >
// //                       <FontAwesomeIcon icon={faTrash} />
// //                     </button>
// //                   </td>
// //                 </tr>
// //               ))
// //             ) : (
// //               <tr>
// //                 <td colSpan="3">No classes found</td>
// //               </tr>
// //             )}
// //           </tbody>
// //         </table>

// //         <ReactPaginate
// //           pageCount={pageCount}
// //           onPageChange={handlePageClick}
// //           containerClassName="pagination"
// //           pageClassName="page-item"
// //           pageLinkClassName="page-link"
// //           previousClassName="page-item"
// //           previousLinkClassName="page-link"
// //           nextClassName="page-item"
// //           nextLinkClassName="page-link"
// //           breakClassName="page-item"
// //           breakLinkClassName="page-link"
// //           activeClassName="active"
// //         />

// //         {/* Add Modal */}
// //         {showAddModal && (
// //           <div className="modal fade show d-block" tabIndex="-1">
// //             <div className="modal-dialog">
// //               <div className="modal-content">
// //                 <div className="modal-header">
// //                   <h5 className="modal-title">Add Class</h5>
// //                   <button
// //                     type="button"
// //                     className="btn-close"
// //                     onClick={handleCloseModal}
// //                   ></button>
// //                 </div>
// //                 <div className="modal-body">
// //                   <div className="mb-3">
// //                     <label htmlFor="className" className="form-label">
// //                       Class Name
// //                     </label>
// //                     <input
// //                       type="text"
// //                       id="className"
// //                       className="form-control"
// //                       value={newClassName}
// //                       onChange={handleInputChange(setNewClassName)}
// //                       onBlur={handleBlur}
// //                     />
// //                     {validationErrors.name && (
// //                       <div className="text-danger">{validationErrors.name}</div>
// //                     )}
// //                     {!nameAvailable && (
// //                       <div className="text-danger">{nameError}</div>
// //                     )}
// //                   </div>
// //                   <div className="mb-3">
// //                     <label htmlFor="department" className="form-label">
// //                       Department
// //                     </label>
// //                     <select
// //                       id="department"
// //                       className="form-select"
// //                       value={newDepartmentId}
// //                       onChange={(e) => setNewDepartmentId(e.target.value)}
// //                     >
// //                       <option value="">Select a department</option>
// //                       {departments.map((dept) => (
// //                         <option
// //                           key={dept.department_id}
// //                           value={dept.department_id}
// //                         >
// //                           {dept.name}
// //                         </option>
// //                       ))}
// //                     </select>
// //                     {validationErrors.department_id && (
// //                       <div className="text-danger">
// //                         {validationErrors.department_id}
// //                       </div>
// //                     )}
// //                   </div>
// //                 </div>
// //                 <div className="modal-footer">
// //                   <button
// //                     type="button"
// //                     className="btn btn-secondary"
// //                     onClick={handleCloseModal}
// //                   >
// //                     Close
// //                   </button>
// //                   <button
// //                     type="button"
// //                     className="btn btn-primary"
// //                     onClick={handleSubmitAdd}
// //                   >
// //                     Save
// //                   </button>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         )}

// //         {/* Edit Modal */}
// //         {showEditModal && (
// //           <div className="modal fade show d-block" tabIndex="-1">
// //             <div className="modal-dialog">
// //               <div className="modal-content">
// //                 <div className="modal-header">
// //                   <h5 className="modal-title">Edit Class</h5>
// //                   <button
// //                     type="button"
// //                     className="btn-close"
// //                     onClick={handleCloseModal}
// //                   ></button>
// //                 </div>
// //                 <div className="modal-body">
// //                   <div className="mb-3">
// //                     <label htmlFor="className" className="form-label">
// //                       Class Name
// //                     </label>
// //                     <input
// //                       type="text"
// //                       id="className"
// //                       className="form-control"
// //                       value={newClassName}
// //                       onChange={handleInputChange(setNewClassName)}
// //                       onBlur={handleBlur}
// //                     />
// //                     {validationErrors.name && (
// //                       <div className="text-danger">{validationErrors.name}</div>
// //                     )}
// //                     {!nameAvailable && (
// //                       <div className="text-danger">{nameError}</div>
// //                     )}
// //                   </div>
// //                   <div className="mb-3">
// //                     <label htmlFor="department" className="form-label">
// //                       Department
// //                     </label>
// //                     <select
// //                       id="department"
// //                       className="form-select"
// //                       value={newDepartmentId}
// //                       onChange={(e) => setNewDepartmentId(e.target.value)}
// //                     >
// //                       <option value="">Select a department</option>
// //                       {departments.map((dept) => (
// //                         <option
// //                           key={dept.department_id}
// //                           value={dept.department_id}
// //                         >
// //                           {dept.name}
// //                         </option>
// //                       ))}
// //                     </select>
// //                     {validationErrors.department_id && (
// //                       <div className="text-danger">
// //                         {validationErrors.department_id}
// //                       </div>
// //                     )}
// //                   </div>
// //                 </div>
// //                 <div className="modal-footer">
// //                   <button
// //                     type="button"
// //                     className="btn btn-secondary"
// //                     onClick={handleCloseModal}
// //                   >
// //                     Close
// //                   </button>
// //                   <button
// //                     type="button"
// //                     className="btn btn-primary"
// //                     onClick={handleSubmitEdit}
// //                   >
// //                     Save changes
// //                   </button>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         )}

// //         {/* Delete Modal */}
// //         {showDeleteModal && (
// //           <div className="modal fade show d-block" tabIndex="-1">
// //             <div className="modal-dialog">
// //               <div className="modal-content">
// //                 <div className="modal-header">
// //                   <h5 className="modal-title">Delete Class</h5>
// //                   <button
// //                     type="button"
// //                     className="btn-close"
// //                     onClick={handleCloseModal}
// //                   ></button>
// //                 </div>
// //                 <div className="modal-body">
// //                   <p>
// //                     Are you sure you want to delete the class "
// //                     {currentClass?.name}"?
// //                   </p>
// //                 </div>
// //                 <div className="modal-footer">
// //                   <button
// //                     type="button"
// //                     className="btn btn-secondary"
// //                     onClick={handleCloseModal}
// //                   >
// //                     Close
// //                   </button>
// //                   <button
// //                     type="button"
// //                     className="btn btn-danger"
// //                     onClick={handleSubmitDelete}
// //                   >
// //                     Delete
// //                   </button>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         )}

// //         <ToastContainer />
// //       </div>
// //     </>
// //   );
// // }

// // export default ClassList;

// import { useEffect, useState } from "react";
// import axios from "axios";
// import ReactPaginate from "react-paginate";
// import "bootstrap/dist/css/bootstrap.min.css";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// // The is the divisionlist module
// function DivisionList() {
//   const API_URL = import.meta.env.VITE_API_URL; // URL for host
//   const [sections, setSections] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [currentSection, setCurrentSection] = useState(null);
//   const [newSectionName, setNewSectionName] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [className, setClassName] = useState("");
//   const [currentPage, setCurrentPage] = useState(0);
//   const [pageCount, setPageCount] = useState(0);
//   const [newDepartmentId, setNewDepartmentId] = useState("");
//   const [fieldErrors, setFieldErrors] = useState({}); // For field-specific errors
//   // validations state for unique name
//   const [nameAvailable, setNameAvailable] = useState(true);
//   const [nameError, setNameError] = useState("");

//   const [classes, setClasses] = useState([]);
//   const [classOptions, setClassOptions] = useState([]);

//   useEffect(() => {
//     const fetchClassNames = async () => {
//       try {
//         const token = localStorage.getItem("authToken");
//         const response = await axios.get(
//           `${API_URL}/api/get_class_for_division`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );
//         const classData = response.data;
//         if (Array.isArray(response.data)) {
//           setClasses(response.data);
//         } else {
//           setError("Unexpected data format");
//         }
//       } catch (error) {
//         console.error("Error fetching class names:", error);
//       }
//     };

//     fetchClassNames();
//   }, []);

//   const pageSize = 10;

//   const fetchSections = async () => {
//     try {
//       const token = localStorage.getItem("authToken");
//       const academicYr = localStorage.getItem("academicYear");

//       if (!token) {
//         throw new Error("No authentication token found");
//       }

//       const response = await axios.get(`${API_URL}/api/getDivision`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "X-Academic-Year": academicYr,
//         },
//         withCredentials: true,
//       });

//       setSections(response.data);
//     } catch (error) {
//       setError(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchSections();
//   }, []);

//   // Filter and paginate sections
//   const filteredSections = sections.filter((section) =>
//     section.name.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const displayedSections = filteredSections.slice(
//     currentPage * pageSize,
//     (currentPage + 1) * pageSize
//   );

//   useEffect(() => {
//     setPageCount(Math.ceil(filteredSections.length / pageSize));
//   }, [filteredSections]);

//   const validateSectionName = (name, departmentId) => {
//     const errors = {};
//     if (!name || name.trim() === "") {
//       errors.name = "The name field is required.";
//     } else if (name.length > 1) {
//       errors.name = "The name field must not exceed 1 characters.";
//     }
//     if (!departmentId) {
//       errors.department_id = "The class is required.";
//     }
//     return errors;
//   };

//   const handlePageClick = (data) => {
//     setCurrentPage(data.selected);
//   };

//   // APi calling for check unique name
//   const checkNameAvailability = async (name, departmentId) => {
//     try {
//       const token = localStorage.getItem("authToken");
//       if (!token) {
//         throw new Error("No authentication token found");
//       }

//       const response = await axios.post(
//         `${API_URL}/api/check_division_name`,
//         { name, class_id: departmentId },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           withCredentials: true,
//         }
//       );

//       if (response.data?.exists === true) {
//         return {
//           available: false,
//           error: "Name is already taken. Please select another name.",
//         };
//       } else {
//         return { available: true, error: "" };
//       }
//     } catch (error) {
//       console.error("Error checking class name:", error);
//       return {
//         available: false,
//         error: "Error checking name availability. Please try again.",
//       };
//     }
//   };

//   const handleEdit = (section) => {
//     setCurrentSection(section);
//     setNewSectionName(section.name);
//     setClassName(section.get_class.class_id);
//     setNewDepartmentId(section.get_class.class_id);
//     setShowEditModal(true);
//   };

//   const handleAdd = () => {
//     setShowAddModal(true);
//   };

//   const handleCloseModal = () => {
//     setShowAddModal(false);
//     setShowEditModal(false);
//     setShowDeleteModal(false);
//     setNewSectionName("");
//     setNewDepartmentId("");
//     setCurrentSection(null);
//     setFieldErrors({});
//     setNameError("");
//   };

//   const handleSubmitAdd = async () => {
//     const validationErrors = validateSectionName(
//       newSectionName,
//       newDepartmentId
//     );
//     if (Object.keys(validationErrors).length > 0) {
//       setFieldErrors(validationErrors);
//       return;
//     }

//     const { available, error } = await checkNameAvailability(
//       newSectionName,
//       newDepartmentId
//     );
//     if (!available) {
//       setFieldErrors((prevErrors) => ({ ...prevErrors, name: error }));
//       return;
//     }

//     try {
//       const token = localStorage.getItem("authToken");
//       if (!token) {
//         throw new Error("No authentication token or academic year found");
//       }

//       await axios.post(
//         `${API_URL}/api/store_division`,
//         { name: newSectionName, class_id: newDepartmentId },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           withCredentials: true,
//         }
//       );

//       fetchSections();
//       handleCloseModal();
//       toast.success("Section added successfully!");
//     } catch (error) {
//       console.error("Error adding section:", error);
//       if (error.response && error.response.data && error.response.data.errors) {
//         Object.values(error.response.data.errors).forEach((err) =>
//           toast.error(err)
//         );
//       } else {
//         toast.error("Server error. Please try again later.");
//       }
//     }
//   };

//   const handleSubmitEdit = async () => {
//     const validationErrors = validateSectionName(
//       newSectionName,
//       newDepartmentId
//     );
//     if (Object.keys(validationErrors).length > 0) {
//       setFieldErrors(validationErrors);
//       return;
//     }

//     const { available, error } = await checkNameAvailability(
//       newSectionName,
//       newDepartmentId
//     );
//     if (!available) {
//       setFieldErrors((prevErrors) => ({ ...prevErrors, name: error }));
//       return;
//     }

//     try {
//       const token = localStorage.getItem("authToken");
//       const academicYr = localStorage.getItem("academicYear");
//       if (!token || !currentSection || !currentSection.section_id) {
//         throw new Error("No authentication token or section ID found");
//       }

//       await axios.put(
//         `${API_URL}/api/getDivision/${currentSection.section_id}`,
//         { name: newSectionName, class_id: newDepartmentId },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "X-Academic-Year": academicYr,
//           },
//           withCredentials: true,
//         }
//       );

//       fetchSections();
//       handleCloseModal();
//       toast.success("Section updated successfully!");
//     } catch (error) {
//       console.error("Error editing section:", error);
//       if (error.response && error.response.data && error.response.data.errors) {
//         Object.values(error.response.data.errors).forEach((err) =>
//           toast.error(err)
//         );
//       } else {
//         toast.error("Server error. Please try again later.");
//       }
//     }
//   };

//   const handleDelete = (id) => {
//     const sectionToDelete = sections.find((sec) => sec.section_id === id);
//     setCurrentSection(sectionToDelete);
//     setShowDeleteModal(true);
//   };

//   const handleConfirmDelete = async () => {
//     try {
//       const token = localStorage.getItem("authToken");
//       if (!token || !currentSection || !currentSection.section_id) {
//         throw new Error("No authentication token or section ID found");
//       }

//       await axios.delete(
//         `${API_URL}/api/getDivision/${currentSection.section_id}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           withCredentials: true,
//         }
//       );

//       fetchSections();
//       handleCloseModal();
//       toast.success("Section deleted successfully!");
//     } catch (error) {
//       console.error("Error deleting section:", error);
//       toast.error("Server error. Please try again later.");
//     }
//   };

//   return (
//     <div className="container mt-4">
//       <h1 className="mb-4">Division List</h1>

//       {/* Add Section Modal */}
//       {showAddModal && (
//         <div className="modal fade show d-block" tabIndex="-1" role="dialog">
//           <div className="modal-dialog" role="document">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title">Add Section</h5>
//                 <button
//                   type="button"
//                   className="close"
//                   onClick={handleCloseModal}
//                 >
//                   <span aria-hidden="true">&times;</span>
//                 </button>
//               </div>
//               <div className="modal-body">
//                 <div className="form-group">
//                   <label htmlFor="sectionName">Section Name</label>
//                   <input
//                     type="text"
//                     className={`form-control ${
//                       fieldErrors.name ? "is-invalid" : ""
//                     }`}
//                     id="sectionName"
//                     value={newSectionName}
//                     onChange={(e) => {
//                       setNewSectionName(e.target.value);
//                       setFieldErrors((prevErrors) => ({
//                         ...prevErrors,
//                         name: "",
//                       }));
//                     }}
//                   />
//                   {fieldErrors.name && (
//                     <div className="invalid-feedback">{fieldErrors.name}</div>
//                   )}
//                 </div>
//                 <div className="form-group">
//                   <label htmlFor="classSelect">Class</label>
//                   <select
//                     id="classSelect"
//                     className={`form-control ${
//                       fieldErrors.department_id ? "is-invalid" : ""
//                     }`}
//                     value={newDepartmentId}
//                     onChange={(e) => {
//                       setNewDepartmentId(e.target.value);
//                       setFieldErrors((prevErrors) => ({
//                         ...prevErrors,
//                         department_id: "",
//                       }));
//                     }}
//                   >
//                     <option value="">Select Class</option>
//                     {classes.map((cls) => (
//                       <option key={cls.class_id} value={cls.class_id}>
//                         {cls.class_name}
//                       </option>
//                     ))}
//                   </select>
//                   {fieldErrors.department_id && (
//                     <div className="invalid-feedback">
//                       {fieldErrors.department_id}
//                     </div>
//                   )}
//                 </div>
//               </div>
//               <div className="modal-footer">
//                 <button
//                   type="button"
//                   className="btn btn-secondary"
//                   onClick={handleCloseModal}
//                 >
//                   Close
//                 </button>
//                 <button
//                   type="button"
//                   className="btn btn-primary"
//                   onClick={handleSubmitAdd}
//                 >
//                   Add Section
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Edit Section Modal */}
//       {showEditModal && currentSection && (
//         <div className="modal fade show d-block" tabIndex="-1" role="dialog">
//           <div className="modal-dialog" role="document">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title">Edit Section</h5>
//                 <button
//                   type="button"
//                   className="close"
//                   onClick={handleCloseModal}
//                 >
//                   <span aria-hidden="true">&times;</span>
//                 </button>
//               </div>
//               <div className="modal-body">
//                 <div className="form-group">
//                   <label htmlFor="sectionNameEdit">Section Name</label>
//                   <input
//                     type="text"
//                     className={`form-control ${
//                       fieldErrors.name ? "is-invalid" : ""
//                     }`}
//                     id="sectionNameEdit"
//                     value={newSectionName}
//                     onChange={(e) => {
//                       setNewSectionName(e.target.value);
//                       setFieldErrors((prevErrors) => ({
//                         ...prevErrors,
//                         name: "",
//                       }));
//                     }}
//                   />
//                   {fieldErrors.name && (
//                     <div className="invalid-feedback">{fieldErrors.name}</div>
//                   )}
//                 </div>
//                 <div className="form-group">
//                   <label htmlFor="classSelectEdit">Class</label>
//                   <select
//                     id="classSelectEdit"
//                     className={`form-control ${
//                       fieldErrors.department_id ? "is-invalid" : ""
//                     }`}
//                     value={newDepartmentId}
//                     onChange={(e) => {
//                       setNewDepartmentId(e.target.value);
//                       setFieldErrors((prevErrors) => ({
//                         ...prevErrors,
//                         department_id: "",
//                       }));
//                     }}
//                   >
//                     <option value="">Select Class</option>
//                     {classes.map((cls) => (
//                       <option key={cls.class_id} value={cls.class_id}>
//                         {cls.class_name}
//                       </option>
//                     ))}
//                   </select>
//                   {fieldErrors.department_id && (
//                     <div className="invalid-feedback">
//                       {fieldErrors.department_id}
//                     </div>
//                   )}
//                 </div>
//               </div>
//               <div className="modal-footer">
//                 <button
//                   type="button"
//                   className="btn btn-secondary"
//                   onClick={handleCloseModal}
//                 >
//                   Close
//                 </button>
//                 <button
//                   type="button"
//                   className="btn btn-primary"
//                   onClick={handleSubmitEdit}
//                 >
//                   Save changes
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete Section Modal */}
//       {showDeleteModal && currentSection && (
//         <div className="modal fade show d-block" tabIndex="-1" role="dialog">
//           <div className="modal-dialog" role="document">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title">Delete Section</h5>
//                 <button
//                   type="button"
//                   className="close"
//                   onClick={handleCloseModal}
//                 >
//                   <span aria-hidden="true">&times;</span>
//                 </button>
//               </div>
//               <div className="modal-body">
//                 <p>
//                   Are you sure you want to delete the section "
//                   {currentSection.name}"?
//                 </p>
//               </div>
//               <div className="modal-footer">
//                 <button
//                   type="button"
//                   className="btn btn-secondary"
//                   onClick={handleCloseModal}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="button"
//                   className="btn btn-danger"
//                   onClick={handleConfirmDelete}
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="mb-3">
//         <button className="btn btn-primary" onClick={handleAdd}>
//           <FontAwesomeIcon icon={faPlus} /> Add Section
//         </button>
//         <input
//           type="text"
//           className="form-control mt-3"
//           placeholder="Search..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//       </div>

//       {loading ? (
//         <p>Loading...</p>
//       ) : error ? (
//         <p>Error: {error}</p>
//       ) : (
//         <div>
//           <ul className="list-group">
//             {displayedSections.map((section) => (
//               <li key={section.section_id} className="list-group-item">
//                 {section.name}
//                 <div className="float-right">
//                   <button
//                     className="btn btn-warning btn-sm mx-1"
//                     onClick={() => handleEdit(section)}
//                   >
//                     <FontAwesomeIcon icon={faEdit} />
//                   </button>
//                   <button
//                     className="btn btn-danger btn-sm mx-1"
//                     onClick={() => handleDelete(section.section_id)}
//                   >
//                     <FontAwesomeIcon icon={faTrash} />
//                   </button>
//                 </div>
//               </li>
//             ))}
//           </ul>

//           <ReactPaginate
//             pageCount={pageCount}
//             onPageChange={handlePageClick}
//             containerClassName="pagination"
//             pageClassName="page-item"
//             pageLinkClassName="page-link"
//             activeClassName="active"
//             previousLabel="Previous"
//             nextLabel="Next"
//           />
//         </div>
//       )}

//       <ToastContainer />
//     </div>
//   );
// }

// export default DivisionList;

import { useEffect, useState } from "react";
import axios from "axios";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// The is the divisionlist module
function DivisionList() {
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
  // validations state for unique name
  const [nameAvailable, setNameAvailable] = useState(true);
  const [nameError, setNameError] = useState("");

  // const [classes, setClasses] = useState([
  //   "Nursery",
  //   "LKG",
  //   "UKG",
  //   "1",
  //   "2",
  //   "3",
  //   "4",
  //   "5",
  //   "6",
  //   "7",
  //   "8",
  //   "9",
  //   "10",
  //   "11",
  //   "12",
  // ]);
  const [classes, setClasses] = useState([]);
  const [classOptions, setClassOptions] = useState([]);

  useEffect(() => {
    const fetchClassNames = async () => {
      try {
        const token = localStorage.getItem("authToken");

        const response = await axios.get(
          `${API_URL}/api/get_class_for_division`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const classData = response.data;

        // Extract class names from the response
        // const classes = classData.map((item) => ({
        //   id: item.class_id,
        //   name: item.name,
        // }));
        if (Array.isArray(response.data)) {
          setClasses(response.data);
        } else {
          setError("Unexpected data format");
        }
        // setClasses(classData.name);
        console.log("the classresponse*********************", classData);
      } catch (error) {
        console.error("Error fetching class names:", error);
      }
    };

    fetchClassNames();
  }, []);

  const pageSize = 10;

  const fetchSections = async () => {
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

      setSections(response.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  // Filter and paginate sections
  const filteredSections = sections.filter((section) =>
    section.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedSections = filteredSections.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  useEffect(() => {
    setPageCount(Math.ceil(filteredSections.length / pageSize));
  }, [filteredSections]);

  const validateSectionName = (name, departmentId) => {
    const errors = {};
    if (!name || name.trim() === "") {
      errors.name = "The name field is required.";
    } else if (name.length > 1) {
      errors.name = "The name field must not exceed 1 characters.";
    }
    if (!departmentId) {
      errors.department_id = "The class is required.";
    }
    return errors;
  };

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  // APi calling for check unique name
  const handleBlur = async () => {
    try {
      const token = localStorage.getItem("authToken");
      console.log("the response of the namechack api____", newSectionName);

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.post(
        `${API_URL}/api/check_division_name`,
        { name: newSectionName, class_id: className },

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

  const handleEdit = (section) => {
    setCurrentSection(section);
    setNewSectionName(section.name);
    setClassName(section.get_class.class_id); // Assuming section.get_class.class_id contains the ID
    // setClassName(section.get_class.name);
    setNewDepartmentId(section.get_class.class_id); // Set department ID correctly
    // setNewDepartmentId(section.section_id);
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
    setCurrentSection(null);
    setFieldErrors({});
    setNameError("");
  };

  // const handleSubmitAdd = async () => {
  //   const validationErrors = validateSectionName(
  //     newSectionName,
  //     newDepartmentId
  //   );
  //   if (Object.keys(validationErrors).length > 0 || !nameAvailable) {
  //     setFieldErrors(validationErrors);
  //     return;
  //   }
  //   try {
  //     const token = localStorage.getItem("authToken");
  //     // const academicYr = localStorage.getItem("academicYear");

  //     if (!token) {
  //       throw new Error("No authentication token or academic year found");
  //     }
  //     console.log("This is post Form");
  //     console.log("This is post data Name:", newSectionName);
  //     console.log("This is post data class_id:", newDepartmentId);
  //     await axios.post(
  //       `${API_URL}/api/store_division`,
  //       { name: newSectionName, class_id: newDepartmentId },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //         withCredentials: true,
  //       }
  //     );

  //     fetchSections();
  //     handleCloseModal();
  //     toast.success("Section added successfully!");
  //   } catch (error) {
  //     console.error("Error adding section:", error);
  //     if (error.response && error.response.data && error.response.data.errors) {
  //       Object.values(error.response.data.errors).forEach((err) =>
  //         toast.error(err)
  //       );
  //     } else {
  //       toast.error("Server error. Please try again later.");
  //     }
  //   }
  // };

  // const handleSubmitEdit = async () => {
  //   const validationErrors = validateSectionName(
  //     newSectionName,
  //     newDepartmentId
  //   );

  //   if (Object.keys(validationErrors).length > 0 || !nameAvailable) {
  //     setFieldErrors(validationErrors);
  //     return;
  //   }

  //   try {
  //     const token = localStorage.getItem("authToken");
  //     if (!token || !currentSection || !currentSection.section_id) {
  //       throw new Error("No authentication token or section ID found");
  //     }
  //     console.log("This is edit Form");
  //     console.log("This is post data Name:", currentSection.section_id);

  //     console.log("This is Edit data Name:", newSectionName);
  //     console.log("This is Edit data class_id:", newDepartmentId);
  //     await axios.put(
  //       `${API_URL}/api/getDivision/${currentSection.section_id}`,
  //       { name: newSectionName, class_id: newDepartmentId },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,

  //         },
  //         withCredentials: true,
  //       }
  //     );

  //     fetchSections();
  //     handleCloseModal();
  //     toast.success("Section updated successfully!");
  //   } catch (error) {
  //     console.error("Error editing section:", error);
  //     if (error.response && error.response.data && error.response.data.errors) {
  //       Object.values(error.response.data.errors).forEach((err) =>
  //         toast.error(err)
  //       );
  //     } else {
  //       toast.error("Server error. Please try again later.");
  //     }
  //   }
  // };
  const handleSubmitAdd = async () => {
    const validationErrors = validateSectionName(
      newSectionName,
      newDepartmentId
    );
    if (Object.keys(validationErrors).length > 0 || !nameAvailable) {
      setFieldErrors(validationErrors);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No authentication token found");
      }

      // Check if the name is unique
      const checkNameResponse = await axios.post(
        `${API_URL}/api/check_division_name`,
        { name: newSectionName, class_id: newDepartmentId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (checkNameResponse.data.exists) {
        setNameError("Name is already taken. Please select another name.");
        setNameAvailable(false);
        return;
      }

      // Proceed with adding the section if the name is unique
      await axios.post(
        `${API_URL}/api/store_division`,
        { name: newSectionName, class_id: newDepartmentId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      fetchSections();
      handleCloseModal();
      toast.success("Section added successfully!");
    } catch (error) {
      console.error("Error adding section:", error);
      if (error.response && error.response.data && error.response.data.errors) {
        Object.values(error.response.data.errors).forEach((err) =>
          toast.error(err)
        );
      } else {
        toast.error("Server error. Please try again later.");
      }
    }
  };

  const handleSubmitEdit = async () => {
    // Validate section name and class
    const validationErrors = validateSectionName(
      newSectionName,
      newDepartmentId
    );
    if (Object.keys(validationErrors).length > 0 || !nameAvailable) {
      setFieldErrors(validationErrors);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token || !currentSection || !currentSection.section_id) {
        throw new Error("No authentication token or section ID found");
      }

      // Check if the division name is unique before making the update
      const nameCheckResponse = await axios.post(
        `${API_URL}/api/check_division_name`,
        { name: newSectionName, class_id: newDepartmentId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (nameCheckResponse.data?.exists) {
        setNameError("Name is already taken. Please select another name.");
        setNameAvailable(false);
        return; // Exit if name is not available
      }

      // Update section if name is available
      await axios.put(
        `${API_URL}/api/getDivision/${currentSection.section_id}`,
        { name: newSectionName, class_id: newDepartmentId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      fetchSections();
      handleCloseModal();
      toast.success("Section updated successfully!");
    } catch (error) {
      console.error("Error editing section:", error);
      if (error.response && error.response.data && error.response.data.errors) {
        Object.values(error.response.data.errors).forEach((err) =>
          toast.error(err)
        );
      } else {
        toast.error("Server error. Please try again later.");
      }
    }
  };

  const handleDelete = (id) => {
    const sectionToDelete = sections.find((sec) => sec.section_id === id);
    setCurrentSection(sectionToDelete);
    setShowDeleteModal(true);
  };

  const handleSubmitDelete = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const academicYr = localStorage.getItem("academicYear");

      if (!token || !currentSection || !currentSection.section_id) {
        throw new Error("Section ID is missing");
      }

      const response = await axios.delete(
        `${API_URL}/api/getDivision/${currentSection.section_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Academic-Year": academicYr,
          },
          withCredentials: true,
        }
      );
      console.log(
        "The response of the delete api in the division module",
        response.data
      );
      if (response.data.success) {
        fetchSections();
        setShowDeleteModal(false);
        setCurrentSection(null);
        toast.success("Division deleted successfully!");
      } else {
        toast.error(response.data.message || "Failed to delete Division");
      }
    } catch (error) {
      console.error("Error deleting Division:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Server error. Please try again later.");
      }
    }
  };

  const handleChangeSectionName = (e) => {
    // handleBlur();
    const { value } = e.target;

    setNewSectionName(value);

    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      name: validateSectionName(value, newDepartmentId).name,
    }));
  };

  const handleChangeDepartmentId = (e) => {
    const { value } = e.target;
    setClassName(value);
    setNewDepartmentId(value);
    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      department_id: validateSectionName(newSectionName, value).department_id,
    }));
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      <ToastContainer />

      <div className="container mt-4">
        <div className="card mx-auto lg:w-3/4 shadow-lg">
          <div className="card-header flex justify-between items-center">
            <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
              Division
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
                        Class
                      </th>
                      <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Edit
                      </th>
                      <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Delete
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedSections.length ? (
                      displayedSections.map((section, index) => (
                        <tr
                          key={section.section_id}
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
                              {section.name}
                            </p>
                          </td>
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {section?.get_class?.name}
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
                              onClick={() => handleDelete(section.section_id)}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">
                          No sections found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {filteredSections.length > pageSize && (
              <ReactPaginate
                previousLabel={"previous"}
                nextLabel={"next"}
                breakLabel={"..."}
                pageCount={pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
                onPageChange={handlePageClick}
                containerClassName={"pagination justify-content-center"}
                pageClassName={"page-item"}
                pageLinkClassName={"page-link"}
                previousClassName={"page-item"}
                previousLinkClassName={"page-link"}
                nextClassName={"page-item"}
                nextLinkClassName={"page-link"}
                breakClassName={"page-item"}
                breakLinkClassName={"page-link"}
                activeClassName={"active"}
              />
            )}
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
                  <div className="modal-header">
                    <h5 className="modal-title">Create New Section</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={handleCloseModal}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label htmlFor="sectionName" className="form-label">
                        Section Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={1}
                        className="form-control"
                        id="sectionName"
                        value={newSectionName}
                        placeholder="e.g A, B, C, D"
                        onChange={handleChangeSectionName}
                        // onChange={}
                        onBlur={handleBlur}
                      />
                      {!nameAvailable && (
                        <span className=" block text-red-500 text-xs">
                          {nameError}
                        </span>
                      )}
                      {fieldErrors.name && (
                        <span className="text-danger text-xs">
                          {fieldErrors.name}
                        </span>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor="departmentId">
                        Class <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="departmentId"
                        className="form-control"
                        value={newDepartmentId}
                        onChange={handleChangeDepartmentId}
                      >
                        <option value="">Select Class</option>
                        {/* {classes.map((cls, index) => (
                          <option key={index} value={cls}>
                            {cls}
                          </option>
                        ))} */}
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
                      {fieldErrors.department_id && (
                        <span className="text-danger text-xs">
                          {fieldErrors.department_id}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="modal-footer d-flex justify-content-end">
                    {/* <button type="button" className="btn btn-secondary me-2" onClick={handleCloseModal}>Cancel</button> */}
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{}}
                      onClick={handleSubmitAdd}
                    >
                      Add
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
                <div className="modal-header">
                  <h5 className="modal-title">Edit Section</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseModal}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="editSectionName" className="form-label">
                      Division Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={1}
                      className="form-control"
                      id="editSectionName"
                      placeholder="e.g A, B, C, D"
                      value={newSectionName}
                      onChange={handleChangeSectionName}
                      // onBlur={handleBlur}
                    />
                    {!nameAvailable && (
                      <span className=" block text-red-500 text-xs">
                        {nameError}
                      </span>
                    )}

                    {fieldErrors.name && (
                      <span className="text-danger text-xs">
                        {fieldErrors.name}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="editDepartmentId">
                      Class <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="editDepartmentId"
                      className="form-control"
                      value={className}
                      onChange={handleChangeDepartmentId}
                    >
                      <option value="">Select Class</option>
                      {/* {classes.map((cls, index) => (
                        <option key={index} value={cls}>
                          {cls}
                        </option>
                      ))} */}
                      {/* <option value="">--Please choose a class--</option> */}
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
                    {fieldErrors.department_id && (
                      <span className="text-danger text-xs">
                        {fieldErrors.department_id}
                      </span>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  {/* <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button> */}
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{}}
                    onClick={handleSubmitEdit}
                  >
                    Update
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
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Deletion</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseModal}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>
                    Are you sure you want to delete Division:{" "}
                    <strong>{currentSection.name}</strong>?
                  </p>
                </div>
                <div className="modal-footer">
                  {/* <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button> */}
                  <button
                    type="button"
                    className="btn btn-danger"
                    style={{}}
                    onClick={handleSubmitDelete}
                  >
                    Delete
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

export default DivisionList;
