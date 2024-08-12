// import { useEffect, useState } from "react";
// import axios from "axios";
// import ReactPaginate from "react-paginate";
// import "bootstrap/dist/css/bootstrap.min.css";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// function DivisionList() {
//   const API_URL = import.meta.env.VITE_API_URL; // url for host
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
//   const [classes, setClasses] = useState([
//     "Nursery",
//     "1",
//     "2",
//     "3",
//     "4",
//     "5",
//     "6",
//     "7",
//     "8",
//     "9",
//     "10",
//     "11",
//     "12",
//   ]);

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
//     } else if (name.length > 255) {
//       errors.name = "The name field must not exceed 255 characters.";
//     }
//     if (!departmentId) {
//       errors.department_id = "The class is required.";
//     }
//     return errors;
//   };

//   const handlePageClick = (data) => {
//     setCurrentPage(data.selected);
//   };

//   const handleEdit = (section) => {
//     setCurrentSection(section);
//     setNewSectionName(section.name);
//     setClassName(section.get_class.name);
//     setNewDepartmentId(section.section_id);
//     setShowEditModal(true);
//   };
//   //   console.log("class list balue", className);
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
//   };

//   const handleSubmitAdd = async () => {
//     const validationErrors = validateSectionName(
//       newSectionName,
//       newDepartmentId
//     );
//     if (Object.keys(validationErrors).length) {
//       setFieldErrors(validationErrors);
//       return;
//     }
//     try {
//       const token = localStorage.getItem("authToken");
//       const academicYr = localStorage.getItem("academicYear");

//       if (!token) {
//         throw new Error("No authentication token or academic year found");
//       }
//       console.log(
//         "the post checkup methos in the division",
//         newSectionName,
//         newDepartmentId
//       );
//       await axios.post(
//         `${API_URL}/api/store_division`,
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
//     if (Object.keys(validationErrors).length) {
//       setFieldErrors(validationErrors);
//       return;
//     }

//     try {
//       const token = localStorage.getItem("authToken");
//       const academicYr = localStorage.getItem("academicYear");

//       if (!token) {
//         throw new Error("No authentication token or academic year found");
//       }
//       console.log(
//         "the department id is inside division module",
//         currentSection.section_id
//       );
//       console.log(
//         "the department in get method id is inside division module",
//         newSectionName,
//         newDepartmentId,
//         currentSection
//       );
//       await axios.put(
//         `${API_URL}/api/getDivision/${newDepartmentId}`,
//         { name: newSectionName, class_id: currentSection.class_id },
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
//       toast.success("Section Updated successfully!");
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

//   const handleSubmitDelete = async () => {
//     try {
//       const token = localStorage.getItem("authToken");
//       const academicYr = localStorage.getItem("academicYear");

//       if (!token || !currentSection || !currentSection.section_id) {
//         throw new Error("Section ID is missing");
//       }

//       const response = await axios.delete(
//         `${API_URL}/api/getDivision/${currentSection.section_id}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "X-Academic-Year": academicYr,
//           },
//           withCredentials: true,
//         }
//       );
//       if (response.data.success) {
//         fetchSections();
//         setShowDeleteModal(false);
//         setCurrentSection(null);
//         toast.success("Divison deleted successfully!");
//       } else {
//         toast.error(response.data.message || "Failed to delete Division");
//       }
//     } catch (error) {
//       console.error("Error deleting Division:", error);
//       if (
//         error.response &&
//         error.response.data &&
//         error.response.data.message
//       ) {
//         toast.error(error.response.data.message);
//       } else {
//         toast.error("Server error. Please try again later.");
//       }
//     }
//   };

//   const handleChangeSectionName = (e) => {
//     const { value } = e.target;
//     setNewSectionName(value);
//     setFieldErrors((prevErrors) => ({
//       ...prevErrors,
//       name: validateSectionName(value, newDepartmentId).name,
//     }));
//   };

//   const handleChangeDepartmentId = (e) => {
//     const { value } = e.target;
//     setClassName(value);
//     setNewDepartmentId(value);
//     setFieldErrors((prevErrors) => ({
//       ...prevErrors,
//       department_id: validateSectionName(newSectionName, value).department_id,
//     }));
//   };

//   if (loading) return <p>Loading...</p>;
//   if (error) return <p>Error: {error}</p>;

//   return (
//     <>
//       <ToastContainer />

//       <div className="container mt-4">
//         <div className="card mx-auto lg:w-3/4 shadow-lg">
//           <div className="card-header flex justify-between items-center">
//             <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
//               Division
//             </h3>
//             <div className="box-border flex md:gap-x-2 justify-end md:h-10">
//               <div className=" w-1/2 md:w-fit mr-1">
//                 <input
//                   type="text"
//                   className="form-control"
//                   placeholder="Search "
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//               </div>
//               <button
//                 className="btn btn-primary btn-sm md:h-9 text-xs md:text-sm"
//                 onClick={handleAdd}
//               >
//                 <FontAwesomeIcon icon={faPlus} style={{ marginRight: "5px" }} />
//                 Add
//               </button>
//             </div>
//           </div>
//           {/* <div className="card-header flex justify-between items-center">
//             <h3 className="text-gray-700 mt-1 text-md lg:text-xl">
//               Department
//             </h3>
//             <div className=" box-border flex gap-x-2  justify-end md:h-10 ">
//               <div className="">
//                 <input
//                   type="text"
//                   className="form-control"
//                   placeholder="Search "
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//               </div>
//               <button
//                 className="btn btn-primary btn-sm h-9"
//                 // style={{ width: "80px" }}
//                 onClick={handleAdd}
//               >
//                 <FontAwesomeIcon icon={faPlus} style={{ marginRight: "5px" }} />
//                 Add
//               </button>
//             </div>
//           </div> */}

//           <div className="card-body w-full">
//             <div className="h-96 lg:h-96 overflow-y-scroll lg:overflow-x-hidden">
//               <div className="bg-white rounded-lg shadow-xs">
//                 <table className="min-w-full leading-normal table-auto">
//                   <thead>
//                     <tr className="bg-gray-100">
//                       <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
//                         S.No
//                       </th>
//                       <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
//                         Divisions
//                       </th>
//                       <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
//                         Class
//                       </th>
//                       <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
//                         Edit
//                       </th>
//                       <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
//                         Delete
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {sections.map((section, index) => (
//                       <tr
//                         key={section.section_id}
//                         className={`${
//                           index % 2 === 0 ? "bg-white" : "bg-gray-100"
//                         } hover:bg-gray-50`}
//                       >
//                         <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
//                           <p className="text-gray-900 whitespace-no-wrap relative top-2">
//                             {index + 1}
//                           </p>
//                         </td>
//                         <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
//                           <p className="text-gray-900 whitespace-no-wrap relative top-2">
//                             {section.name}
//                           </p>
//                         </td>
//                         <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
//                           <p className="text-gray-900 whitespace-no-wrap relative top-2">
//                             {section?.get_class?.name}
//                           </p>
//                         </td>

//                         <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
//                           <button
//                             className="text-blue-600 hover:text-blue-800 hover:bg-transparent "
//                             onClick={() => handleEdit(section)}
//                           >
//                             <FontAwesomeIcon icon={faEdit} />
//                           </button>
//                         </td>

//                         <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
//                           <button
//                             className="text-red-600 hover:text-red-800 hover:bg-transparent "
//                             onClick={() => handleDelete(section.section_id)}
//                           >
//                             <FontAwesomeIcon icon={faTrash} />
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//             <div className=" flex justify-center  pt-2 -mb-3">
//               <ReactPaginate
//                 previousLabel={"Previous"}
//                 nextLabel={"Next"}
//                 breakLabel={"..."}
//                 pageCount={pageCount}
//                 marginPagesDisplayed={2}
//                 pageRangeDisplayed={5}
//                 onPageChange={handlePageClick}
//                 containerClassName={"pagination"}
//                 pageClassName={"page-item"}
//                 pageLinkClassName={"page-link"}
//                 previousClassName={"page-item"}
//                 previousLinkClassName={"page-link"}
//                 nextClassName={"page-item"}
//                 nextLinkClassName={"page-link"}
//                 breakClassName={"page-item"}
//                 breakLinkClassName={"page-link"}
//                 activeClassName={"active"}
//               />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Modal for adding a new section */}
//       {showAddModal && (
//         <div className="fixed inset-0 z-50   flex items-center justify-center bg-black bg-opacity-50">
//           <div
//             className="modal"
//             style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
//           >
//             <div className="modal-dialog modal-dialog-centered ">
//               <div className="modal-content">
//                 <div className="modal-header">
//                   <h5 className="modal-title">Create New Section</h5>
//                   <button
//                     type="button"
//                     className="btn-close"
//                     onClick={handleCloseModal}
//                   ></button>
//                 </div>
//                 <div className="modal-body">
//                   <div className="mb-3">
//                     <label htmlFor="sectionName" className="form-label">
//                       Section Name <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       className="form-control"
//                       id="sectionName"
//                       value={newSectionName}
//                       placeholder="e.g A, B, C, D"
//                       onChange={handleChangeSectionName}
//                     />
//                     {fieldErrors.name && (
//                       <small className="text-danger">{fieldErrors.name}</small>
//                     )}
//                   </div>
//                   <div className="form-group">
//                     <label htmlFor="departmentId">Class</label>
//                     <select
//                       id="departmentId"
//                       className="form-control"
//                       value={newDepartmentId}
//                       onChange={handleChangeDepartmentId}
//                     >
//                       <option value="">Select Class</option>
//                       {classes.map((cls, index) => (
//                         <option key={index} value={cls}>
//                           {cls}
//                         </option>
//                       ))}
//                     </select>
//                     {fieldErrors.department_id && (
//                       <div className="text-danger">
//                         {fieldErrors.department_id}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//                 <div className="modal-footer d-flex justify-content-end">
//                   {/* <button type="button" className="btn btn-secondary me-2" onClick={handleCloseModal}>Cancel</button> */}
//                   <button
//                     type="button"
//                     className="btn btn-primary"
//                     style={{}}
//                     onClick={handleSubmitAdd}
//                   >
//                     Add
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Modal for editing a section */}
//       {showEditModal && (
//         <div
//           className="modal"
//           style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
//         >
//           <div className="modal-dialog modal-dialog-centered">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title">Edit Section</h5>
//                 <button
//                   type="button"
//                   className="btn-close"
//                   onClick={handleCloseModal}
//                 ></button>
//               </div>
//               <div className="modal-body">
//                 <div className="mb-3">
//                   <label htmlFor="editSectionName" className="form-label">
//                     Division Name <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     className="form-control"
//                     id="editSectionName"
//                     placeholder="e.g A, B, C, D"
//                     value={newSectionName}
//                     onChange={handleChangeSectionName}
//                   />
//                   {fieldErrors.name && (
//                     <small className="text-danger">{fieldErrors.name}</small>
//                   )}
//                 </div>
//                 <div className="form-group">
//                   <label htmlFor="editDepartmentId">
//                     Class <span className="text-red-500">*</span>
//                   </label>
//                   <select
//                     id="editDepartmentId"
//                     className="form-control"
//                     value={className}
//                     onChange={handleChangeDepartmentId}
//                   >
//                     <option value="">Select Class</option>
//                     {classes.map((cls, index) => (
//                       <option key={index} value={cls}>
//                         {cls}
//                       </option>
//                     ))}
//                   </select>
//                   {fieldErrors.department_id && (
//                     <span className="text-danger">
//                       {fieldErrors.department_id}
//                     </span>
//                   )}
//                 </div>
//               </div>
//               <div className="modal-footer">
//                 {/* <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button> */}
//                 <button
//                   type="button"
//                   className="btn btn-primary"
//                   style={{}}
//                   onClick={handleSubmitEdit}
//                 >
//                   Update
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Modal for confirming deletion */}
//       {showDeleteModal && (
//         <div
//           className="modal"
//           style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
//         >
//           <div className="modal-dialog modal-dialog-centered">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title">Confirm Deletion</h5>
//                 <button
//                   type="button"
//                   className="btn-close"
//                   onClick={handleCloseModal}
//                 ></button>
//               </div>
//               <div className="modal-body">
//                 <p>
//                   Are you sure you want to delete Division:{" "}
//                   <strong>{currentSection.name}</strong>?
//                 </p>
//               </div>
//               <div className="modal-footer">
//                 {/* <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button> */}
//                 <button
//                   type="button"
//                   className="btn btn-danger"
//                   style={{}}
//                   onClick={handleSubmitDelete}
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// export default DivisionList;
