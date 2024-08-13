// // import { useEffect, useState } from "react";
// // import axios from "axios";
// // import ReactPaginate from "react-paginate";
// // import "bootstrap/dist/css/bootstrap.min.css";
// // import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// // import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
// // import { ToastContainer, toast } from "react-toastify";
// // import "react-toastify/dist/ReactToastify.css";

// // function DivisionList() {
// //   const API_URL = import.meta.env.VITE_API_URL; // url for host
// //   const [sections, setSections] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState(null);
// //   const [showAddModal, setShowAddModal] = useState(false);
// //   const [showEditModal, setShowEditModal] = useState(false);
// //   const [showDeleteModal, setShowDeleteModal] = useState(false);
// //   const [currentSection, setCurrentSection] = useState(null);
// //   const [newSectionName, setNewSectionName] = useState("");
// //   const [searchTerm, setSearchTerm] = useState("");
// //   const [className, setClassName] = useState("");
// //   const [currentPage, setCurrentPage] = useState(0);
// //   const [pageCount, setPageCount] = useState(0);
// //   const [newDepartmentId, setNewDepartmentId] = useState("");
// //   const [fieldErrors, setFieldErrors] = useState({}); // For field-specific errors
// //   const [classes, setClasses] = useState([
// //     "Nursery",
// //     "1",
// //     "2",
// //     "3",
// //     "4",
// //     "5",
// //     "6",
// //     "7",
// //     "8",
// //     "9",
// //     "10",
// //     "11",
// //     "12",
// //   ]);

// //   const pageSize = 10;

// //   const fetchSections = async () => {
// //     try {
// //       const token = localStorage.getItem("authToken");
// //       const academicYr = localStorage.getItem("academicYear");

// //       if (!token) {
// //         throw new Error("No authentication token found");
// //       }

// //       const response = await axios.get(`${API_URL}/api/getDivision`, {
// //         headers: {
// //           Authorization: `Bearer ${token}`,
// //           "X-Academic-Year": academicYr,
// //         },
// //         withCredentials: true,
// //       });

// //       setSections(response.data);
// //     } catch (error) {
// //       setError(error.message);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchSections();
// //   }, []);

// //   // Filter and paginate sections
// //   const filteredSections = sections.filter((section) =>
// //     section.name.toLowerCase().includes(searchTerm.toLowerCase())
// //   );

// //   const displayedSections = filteredSections.slice(
// //     currentPage * pageSize,
// //     (currentPage + 1) * pageSize
// //   );
// //   useEffect(() => {
// //     setPageCount(Math.ceil(filteredSections.length / pageSize));
// //   }, [filteredSections]);

// //   const validateSectionName = (name, departmentId) => {
// //     const errors = {};
// //     if (!name || name.trim() === "") {
// //       errors.name = "The name field is required.";
// //     } else if (name.length > 255) {
// //       errors.name = "The name field must not exceed 255 characters.";
// //     }
// //     if (!departmentId) {
// //       errors.department_id = "The class is required.";
// //     }
// //     return errors;
// //   };

// //   const handlePageClick = (data) => {
// //     setCurrentPage(data.selected);
// //   };

// //   const handleEdit = (section) => {
// //     setCurrentSection(section);
// //     setNewSectionName(section.name);
// //     setClassName(section.get_class.name);
// //     setNewDepartmentId(section.section_id);
// //     setShowEditModal(true);
// //   };
// //   //   console.log("class list balue", className);
// //   const handleAdd = () => {
// //     setShowAddModal(true);
// //   };

// //   const handleCloseModal = () => {
// //     setShowAddModal(false);
// //     setShowEditModal(false);
// //     setShowDeleteModal(false);
// //     setNewSectionName("");
// //     setNewDepartmentId("");
// //     setCurrentSection(null);
// //     setFieldErrors({});
// //   };

// //   const handleSubmitAdd = async () => {
// //     const validationErrors = validateSectionName(
// //       newSectionName,
// //       newDepartmentId
// //     );
// //     if (Object.keys(validationErrors).length) {
// //       setFieldErrors(validationErrors);
// //       return;
// //     }
// //     try {
// //       const token = localStorage.getItem("authToken");
// //       const academicYr = localStorage.getItem("academicYear");

// //       if (!token) {
// //         throw new Error("No authentication token or academic year found");
// //       }
// //       console.log(
// //         "the post checkup methos in the division",
// //         newSectionName,
// //         newDepartmentId
// //       );
// //       await axios.post(
// //         `${API_URL}/api/store_division`,
// //         { name: newSectionName, class_id: newDepartmentId },
// //         {
// //           headers: {
// //             Authorization: `Bearer ${token}`,
// //             "X-Academic-Year": academicYr,
// //           },
// //           withCredentials: true,
// //         }
// //       );

// //       fetchSections();
// //       handleCloseModal();
// //       toast.success("Section added successfully!");
// //     } catch (error) {
// //       console.error("Error adding section:", error);
// //       if (error.response && error.response.data && error.response.data.errors) {
// //         Object.values(error.response.data.errors).forEach((err) =>
// //           toast.error(err)
// //         );
// //       } else {
// //         toast.error("Server error. Please try again later.");
// //       }
// //     }
// //   };

// //   const handleSubmitEdit = async () => {
// //     const validationErrors = validateSectionName(
// //       newSectionName,
// //       newDepartmentId
// //     );
// //     if (Object.keys(validationErrors).length) {
// //       setFieldErrors(validationErrors);
// //       return;
// //     }

// //     try {
// //       const token = localStorage.getItem("authToken");
// //       const academicYr = localStorage.getItem("academicYear");

// //       if (!token) {
// //         throw new Error("No authentication token or academic year found");
// //       }
// //       console.log(
// //         "the department id is inside division module",
// //         currentSection.section_id
// //       );
// //       console.log(
// //         "the department in get method id is inside division module",
// //         newSectionName,
// //         newDepartmentId,
// //         currentSection
// //       );
// //       await axios.put(
// //         `${API_URL}/api/getDivision/${newDepartmentId}`,
// //         { name: newSectionName, class_id: currentSection.class_id },
// //         {
// //           headers: {
// //             Authorization: `Bearer ${token}`,
// //             "X-Academic-Year": academicYr,
// //           },
// //           withCredentials: true,
// //         }
// //       );

// //       fetchSections();
// //       handleCloseModal();
// //       toast.success("Section Updated successfully!");
// //     } catch (error) {
// //       console.error("Error editing section:", error);
// //       if (error.response && error.response.data && error.response.data.errors) {
// //         Object.values(error.response.data.errors).forEach((err) =>
// //           toast.error(err)
// //         );
// //       } else {
// //         toast.error("Server error. Please try again later.");
// //       }
// //     }
// //   };

// //   const handleDelete = (id) => {
// //     const sectionToDelete = sections.find((sec) => sec.section_id === id);
// //     setCurrentSection(sectionToDelete);
// //     setShowDeleteModal(true);
// //   };

// //   const handleSubmitDelete = async () => {
// //     try {
// //       const token = localStorage.getItem("authToken");
// //       const academicYr = localStorage.getItem("academicYear");

// //       if (!token || !currentSection || !currentSection.section_id) {
// //         throw new Error("Section ID is missing");
// //       }

// //       const response = await axios.delete(
// //         `${API_URL}/api/getDivision/${currentSection.section_id}`,
// //         {
// //           headers: {
// //             Authorization: `Bearer ${token}`,
// //             "X-Academic-Year": academicYr,
// //           },
// //           withCredentials: true,
// //         }
// //       );
// //       if (response.data.success) {
// //         fetchSections();
// //         setShowDeleteModal(false);
// //         setCurrentSection(null);
// //         toast.success("Divison deleted successfully!");
// //       } else {
// //         toast.error(response.data.message || "Failed to delete Division");
// //       }
// //     } catch (error) {
// //       console.error("Error deleting Division:", error);
// //       if (
// //         error.response &&
// //         error.response.data &&
// //         error.response.data.message
// //       ) {
// //         toast.error(error.response.data.message);
// //       } else {
// //         toast.error("Server error. Please try again later.");
// //       }
// //     }
// //   };

// //   const handleChangeSectionName = (e) => {
// //     const { value } = e.target;
// //     setNewSectionName(value);
// //     setFieldErrors((prevErrors) => ({
// //       ...prevErrors,
// //       name: validateSectionName(value, newDepartmentId).name,
// //     }));
// //   };

// //   const handleChangeDepartmentId = (e) => {
// //     const { value } = e.target;
// //     setClassName(value);
// //     setNewDepartmentId(value);
// //     setFieldErrors((prevErrors) => ({
// //       ...prevErrors,
// //       department_id: validateSectionName(newSectionName, value).department_id,
// //     }));
// //   };

// //   if (loading) return <p>Loading...</p>;
// //   if (error) return <p>Error: {error}</p>;

// //   return (
// //     <>
// //       <ToastContainer />

// //       <div className="container mt-4">
// //         <div className="card mx-auto lg:w-3/4 shadow-lg">
// //           <div className="card-header flex justify-between items-center">
// //             <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
// //               Division
// //             </h3>
// //             <div className="box-border flex md:gap-x-2 justify-end md:h-10">
// //               <div className=" w-1/2 md:w-fit mr-1">
// //                 <input
// //                   type="text"
// //                   className="form-control"
// //                   placeholder="Search "
// //                   value={searchTerm}
// //                   onChange={(e) => setSearchTerm(e.target.value)}
// //                 />
// //               </div>
// //               <button
// //                 className="btn btn-primary btn-sm md:h-9 text-xs md:text-sm"
// //                 onClick={handleAdd}
// //               >
// //                 <FontAwesomeIcon icon={faPlus} style={{ marginRight: "5px" }} />
// //                 Add
// //               </button>
// //             </div>
// //           </div>
// //           {/* <div className="card-header flex justify-between items-center">
// //             <h3 className="text-gray-700 mt-1 text-md lg:text-xl">
// //               Department
// //             </h3>
// //             <div className=" box-border flex gap-x-2  justify-end md:h-10 ">
// //               <div className="">
// //                 <input
// //                   type="text"
// //                   className="form-control"
// //                   placeholder="Search "
// //                   onChange={(e) => setSearchTerm(e.target.value)}
// //                 />
// //               </div>
// //               <button
// //                 className="btn btn-primary btn-sm h-9"
// //                 // style={{ width: "80px" }}
// //                 onClick={handleAdd}
// //               >
// //                 <FontAwesomeIcon icon={faPlus} style={{ marginRight: "5px" }} />
// //                 Add
// //               </button>
// //             </div>
// //           </div> */}

// //           <div className="card-body w-full">
// //             <div className="h-96 lg:h-96 overflow-y-scroll lg:overflow-x-hidden">
// //               <div className="bg-white rounded-lg shadow-xs">
// //                 <table className="min-w-full leading-normal table-auto">
// //                   <thead>
// //                     <tr className="bg-gray-100">
// //                       <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
// //                         S.No
// //                       </th>
// //                       <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
// //                         Divisions
// //                       </th>
// //                       <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
// //                         Class
// //                       </th>
// //                       <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
// //                         Edit
// //                       </th>
// //                       <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
// //                         Delete
// //                       </th>
// //                     </tr>
// //                   </thead>
// //                   <tbody>
// //                     {sections.map((section, index) => (
// //                       <tr
// //                         key={section.section_id}
// //                         className={`${
// //                           index % 2 === 0 ? "bg-white" : "bg-gray-100"
// //                         } hover:bg-gray-50`}
// //                       >
// //                         <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
// //                           <p className="text-gray-900 whitespace-no-wrap relative top-2">
// //                             {index + 1}
// //                           </p>
// //                         </td>
// //                         <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
// //                           <p className="text-gray-900 whitespace-no-wrap relative top-2">
// //                             {section.name}
// //                           </p>
// //                         </td>
// //                         <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
// //                           <p className="text-gray-900 whitespace-no-wrap relative top-2">
// //                             {section?.get_class?.name}
// //                           </p>
// //                         </td>

// //                         <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
// //                           <button
// //                             className="text-blue-600 hover:text-blue-800 hover:bg-transparent "
// //                             onClick={() => handleEdit(section)}
// //                           >
// //                             <FontAwesomeIcon icon={faEdit} />
// //                           </button>
// //                         </td>

// //                         <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
// //                           <button
// //                             className="text-red-600 hover:text-red-800 hover:bg-transparent "
// //                             onClick={() => handleDelete(section.section_id)}
// //                           >
// //                             <FontAwesomeIcon icon={faTrash} />
// //                           </button>
// //                         </td>
// //                       </tr>
// //                     ))}
// //                   </tbody>
// //                 </table>
// //               </div>
// //             </div>
// //             <div className=" flex justify-center  pt-2 -mb-3">
// //               <ReactPaginate
// //                 previousLabel={"Previous"}
// //                 nextLabel={"Next"}
// //                 breakLabel={"..."}
// //                 pageCount={pageCount}
// //                 marginPagesDisplayed={2}
// //                 pageRangeDisplayed={5}
// //                 onPageChange={handlePageClick}
// //                 containerClassName={"pagination"}
// //                 pageClassName={"page-item"}
// //                 pageLinkClassName={"page-link"}
// //                 previousClassName={"page-item"}
// //                 previousLinkClassName={"page-link"}
// //                 nextClassName={"page-item"}
// //                 nextLinkClassName={"page-link"}
// //                 breakClassName={"page-item"}
// //                 breakLinkClassName={"page-link"}
// //                 activeClassName={"active"}
// //               />
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Modal for adding a new section */}
// //       {showAddModal && (
// //         <div className="fixed inset-0 z-50   flex items-center justify-center bg-black bg-opacity-50">
// //           <div
// //             className="modal"
// //             style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
// //           >
// //             <div className="modal-dialog modal-dialog-centered ">
// //               <div className="modal-content">
// //                 <div className="modal-header">
// //                   <h5 className="modal-title">Create New Section</h5>
// //                   <button
// //                     type="button"
// //                     className="btn-close"
// //                     onClick={handleCloseModal}
// //                   ></button>
// //                 </div>
// //                 <div className="modal-body">
// //                   <div className="mb-3">
// //                     <label htmlFor="sectionName" className="form-label">
// //                       Section Name <span className="text-red-500">*</span>
// //                     </label>
// //                     <input
// //                       type="text"
// //                       className="form-control"
// //                       id="sectionName"
// //                       value={newSectionName}
// //                       placeholder="e.g A, B, C, D"
// //                       onChange={handleChangeSectionName}
// //                     />
// //                     {fieldErrors.name && (
// //                       <small className="text-danger">{fieldErrors.name}</small>
// //                     )}
// //                   </div>
// //                   <div className="form-group">
// //                     <label htmlFor="departmentId">Class</label>
// //                     <select
// //                       id="departmentId"
// //                       className="form-control"
// //                       value={newDepartmentId}
// //                       onChange={handleChangeDepartmentId}
// //                     >
// //                       <option value="">Select Class</option>
// //                       {classes.map((cls, index) => (
// //                         <option key={index} value={cls}>
// //                           {cls}
// //                         </option>
// //                       ))}
// //                     </select>
// //                     {fieldErrors.department_id && (
// //                       <div className="text-danger">
// //                         {fieldErrors.department_id}
// //                       </div>
// //                     )}
// //                   </div>
// //                 </div>
// //                 <div className="modal-footer d-flex justify-content-end">
// //                   {/* <button type="button" className="btn btn-secondary me-2" onClick={handleCloseModal}>Cancel</button> */}
// //                   <button
// //                     type="button"
// //                     className="btn btn-primary"
// //                     style={{}}
// //                     onClick={handleSubmitAdd}
// //                   >
// //                     Add
// //                   </button>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {/* Modal for editing a section */}
// //       {showEditModal && (
// //         <div
// //           className="modal"
// //           style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
// //         >
// //           <div className="modal-dialog modal-dialog-centered">
// //             <div className="modal-content">
// //               <div className="modal-header">
// //                 <h5 className="modal-title">Edit Section</h5>
// //                 <button
// //                   type="button"
// //                   className="btn-close"
// //                   onClick={handleCloseModal}
// //                 ></button>
// //               </div>
// //               <div className="modal-body">
// //                 <div className="mb-3">
// //                   <label htmlFor="editSectionName" className="form-label">
// //                     Division Name <span className="text-red-500">*</span>
// //                   </label>
// //                   <input
// //                     type="text"
// //                     className="form-control"
// //                     id="editSectionName"
// //                     placeholder="e.g A, B, C, D"
// //                     value={newSectionName}
// //                     onChange={handleChangeSectionName}
// //                   />
// //                   {fieldErrors.name && (
// //                     <small className="text-danger">{fieldErrors.name}</small>
// //                   )}
// //                 </div>
// //                 <div className="form-group">
// //                   <label htmlFor="editDepartmentId">
// //                     Class <span className="text-red-500">*</span>
// //                   </label>
// //                   <select
// //                     id="editDepartmentId"
// //                     className="form-control"
// //                     value={className}
// //                     onChange={handleChangeDepartmentId}
// //                   >
// //                     <option value="">Select Class</option>
// //                     {classes.map((cls, index) => (
// //                       <option key={index} value={cls}>
// //                         {cls}
// //                       </option>
// //                     ))}
// //                   </select>
// //                   {fieldErrors.department_id && (
// //                     <span className="text-danger">
// //                       {fieldErrors.department_id}
// //                     </span>
// //                   )}
// //                 </div>
// //               </div>
// //               <div className="modal-footer">
// //                 {/* <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button> */}
// //                 <button
// //                   type="button"
// //                   className="btn btn-primary"
// //                   style={{}}
// //                   onClick={handleSubmitEdit}
// //                 >
// //                   Update
// //                 </button>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {/* Modal for confirming deletion */}
// //       {showDeleteModal && (
// //         <div
// //           className="modal"
// //           style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
// //         >
// //           <div className="modal-dialog modal-dialog-centered">
// //             <div className="modal-content">
// //               <div className="modal-header">
// //                 <h5 className="modal-title">Confirm Deletion</h5>
// //                 <button
// //                   type="button"
// //                   className="btn-close"
// //                   onClick={handleCloseModal}
// //                 ></button>
// //               </div>
// //               <div className="modal-body">
// //                 <p>
// //                   Are you sure you want to delete Division:{" "}
// //                   <strong>{currentSection.name}</strong>?
// //                 </p>
// //               </div>
// //               <div className="modal-footer">
// //                 {/* <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button> */}
// //                 <button
// //                   type="button"
// //                   className="btn btn-danger"
// //                   style={{}}
// //                   onClick={handleSubmitDelete}
// //                 >
// //                   Delete
// //                 </button>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </>
// //   );
// // }

// // export default DivisionList;


// // This is the createstaff component having the onchange validations
// import React, { useState } from "react";
// // import { FaUserCircle } from "react-icons/fa";
// import { RxCross1 } from "react-icons/rx";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { ToastContainer, toast } from "react-toastify";
// import ImageUploadAndCrop from "../common/ImageUploadAndCrop.jsx";
// import ImageCropper from "../common/ImageUploadAndCrop.jsx";
// function CreateStaff() {
//   const API_URL = import.meta.env.VITE_API_URL;
//   const [formData, setFormData] = useState({
//     name: "",
//     birthday: "",
//     date_of_joining: "",
//     designation: "",
//     academic_qual: [],
//     professional_qual: "",
//     trained: "",
//     experience: "",
//     sex: "",
//     blood_group: "",
//     religion: "",
//     address: "",
//     phone: "",
//     email: "",
//     aadhar_card_no: "",
//     role: "",
//     employeeId: "",
//     teacher_image_name: null,

//     special_sub: "",
//   });
//   const [errors, setErrors] = useState({});
//   const [photoPreview, setPhotoPreview] = useState(null);
//   const navigate = useNavigate();

//   // const validate = () => {
//   //   const newErrors = {};
//   //   if (!formData.name) newErrors.name = "Name is required";
//   //   if (!formData.birthday) newErrors.birthday = "Date of Birth is required";
//   //   if (!formData.date_of_joining)
//   //     newErrors.date_of_joining = "Date of Joining is required";
//   //   if (!formData.sex) newErrors.sex = "sex is required";
//   //   if (!formData.address) newErrors.address = "Address is required";
//   //   if (!formData.phone) newErrors.phone = "Phone number is required";
//   //   if (!/^\d{10}$/.test(formData.phone))
//   //     newErrors.phone = "Phone number must be 10 digits";
//   //   if (!formData.email) newErrors.email = "Email is required";
//   //   if (!/\S+@\S+\.\S+/.test(formData.email))
//   //     newErrors.email = "Email address is invalid";
//   //   if (!formData.role) newErrors.role = "Role is required";
//   //   if (!formData.employeeId) newErrors.employeeId = "Employee ID is required";
//   //   if (formData.academic_qual.length === 0)
//   //     newErrors.academic_qual =
//   //       "Please select at least one academic qualification";
//   //   return newErrors;
//   // };

//   const validate = (name, value) => {
//     const newErrors = { ...errors };

//     switch (name) {
//       case "name":
//         if (!value) newErrors.name = "Name is required";
//         else delete newErrors.name;
//         break;
//       case "birthday":
//         if (!value) newErrors.birthday = "Date of Birth is required";
//         else delete newErrors.birthday;
//         break;
//       case "date_of_joining":
//         if (!value) newErrors.date_of_joining = "Date of Joining is required";
//         else delete newErrors.date_of_joining;
//         break;
//       case "sex":
//         if (!value) newErrors.sex = "Sex is required";
//         else delete newErrors.sex;
//         break;
//       case "address":
//         if (!value) newErrors.address = "Address is required";
//         else delete newErrors.address;
//         break;
//       case "phone":
//         if (!value) newErrors.phone = "Phone number is required";
//         else if (!/^\d{10}$/.test(value))
//           newErrors.phone = "Phone number must be 10 digits";
//         else delete newErrors.phone;
//         break;
//       case "email":
//         if (!value) newErrors.email = "Email is required";
//         else if (!/\S+@\S+\.\S+/.test(value))
//           newErrors.email = "Email address is invalid";
//         else delete newErrors.email;
//         break;
//       case "role":
//         if (!value) newErrors.role = "Role is required";
//         else delete newErrors.role;
//         break;
//       case "employeeId":
//         if (!value) newErrors.employeeId = "Employee ID is required";
//         else delete newErrors.employeeId;
//         break;
//       case "experience":
//         if (!value) newErrors.experience = "Experience is required";
//         else if (!/^\d+$/.test(value))
//           newErrors.experience = "Experience must be a whole number";
//         else delete newErrors.experience;
//         break;
//       case "aadhar_card_no":
//         if (!value) newErrors.aadhar_card_no = "Aadhar card number is required";
//         else if (!/^\d{14}$/.test(value.replace(/\s+/g, "")))
//           newErrors.aadhar_card_no = "Aadhar card number must be 12 digits";
//         else delete newErrors.aadhar_card_no;
//         break;
//       case "academic_qual":
//       //   if (formData.academic_qual.length === 0)
//       //     newErrors.academic_qual =
//       //       "Please select at least one academic qualification";
//       //   else delete newErrors.academic_qual;
//       //   break;
//       default:
//         break;
//     }

//     setErrors(newErrors);
//   };

//   const handleChange = (event) => {
//     const { name, value, checked } = event.target;
//     let newValue = value;
//     if (name === "experience") {
//       newValue = newValue.replace(/[^0-9]/g, "");
//     } else if (name === "aadhar_card_no") {
//       newValue = newValue.replace(/\s+/g, "");
//     }
//     if (name === "phone" || name === "aadhar_card_no") {
//       newValue = newValue.replace(/[^\d]/g, "");
//     }
//     if (name === "academic_qual") {
//       setFormData((prevData) => {
//         const newAcademicQual = checked
//           ? [...prevData.academic_qual, value]
//           : prevData.academic_qual.filter(
//               (qualification) => qualification !== value
//             );
//         validate(name, newAcademicQual);
//         return { ...prevData, academic_qual: newAcademicQual };
//       });
//     } else {
//       setFormData((prevData) => {
//         validate(name, newValue);
//         return { ...prevData, [name]: newValue };
//       });
//     }
//   };

//   const handleFileChange = (event) => {
//     const file = event.target.files[0];
//     setFormData((prevState) => ({
//       ...prevState,
//       teacher_image_name: file,
//     }));
//     setPhotoPreview(URL.createObjectURL(file));
//   };

//   const formatDateString = (dateString) => {
//     if (!dateString) return "";
//     const [year, month, day] = dateString.split("-");
//     return `${year}-${month}-${day}`;
//   };

//   // Image Croping funtionlity
//   const handleImageCropped = (croppedImageData) => {
//     setFormData((prevData) => ({
//       ...prevData,
//       teacher_image_name: croppedImageData,
//     }));
//   };

//   // const handleSubmit = async (event) => {
//   //   event.preventDefault();
//   //   const validationErrors = validate();
//   //   if (Object.keys(validationErrors).length > 0) {
//   //     setErrors(validationErrors);
//   //     Object.values(validationErrors).forEach((error) => {
//   //       toast.error(error);
//   //     });
//   //     return;
//   //   }
//   //   const formattedFormData = {
//   //     ...formData,
//   //     birthday: formatDateString(formData.birthday),
//   //     date_of_joining: formatDateString(formData.date_of_joining),
//   //   };
//   //   // api calling
//   //   try {
//   //     const token = localStorage.getItem("authToken");
//   //     if (!token) {
//   //       throw new Error("No authentication token is found");
//   //     }
//   //     console.log("formata", formattedFormData);
//   //     const response = await axios.post(
//   //       `${API_URL}/api/store_staff`,
//   //       formattedFormData,
//   //       {
//   //         headers: {
//   //           "Content-Type": "multipart/form-data",
//   //           Authorization: `Bearer ${token}`,
//   //         },
//   //       }
//   //     );

//   //     console.log("Response:", response.data);

//   //     if (response.status === 201) {
//   //       toast.success("Teacher created successfully!");
//   //       setTimeout(() => {
//   //         navigate("/StaffList");
//   //       }, 3000); // 3000 milliseconds = 3 seconds
//   //       // navigate("/StaffList");
//   //     }
//   //   } catch (error) {
//   //     console.error("Error:", error.message);
//   //     toast.error("An error occurred while creating the teacher.");
//   //     console.log("the erro", error.response.data);
//   //     toast.error(error.response?.data || error.message);
//   //   }
//   //   // // Format dates before submitting
//   //   // const formattedFormData = {
//   //   //   ...formData,
//   //   //   birthday: formatDateString(formData.birthday),
//   //   //   date_of_joining: formatDateString(formData.date_of_joining),
//   //   // };
//   //   // console.log(formattedFormData);
//   // };
//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     const validationErrors = validate();
//     const errorsToCheck = validationErrors || {};
//     // Check if there are any errors

//     if (Object.keys(errorsToCheck).length > 0) {
//       setErrors(errorsToCheck);
//       Object.values(errorsToCheck).forEach((error) => {
//         toast.error(error);
//       });
//       return;
//     }

//     const formattedFormData = {
//       ...formData,
//       birthday: formatDateString(formData.birthday),
//       date_of_joining: formatDateString(formData.date_of_joining),
//     };
//     console.log("Response of create staff form:", formattedFormData);

//     try {
//       const token = localStorage.getItem("authToken");
//       if (!token) {
//         throw new Error("No authentication token is found");
//       }
//       console.log("form data", formattedFormData);
//       const response = await axios.post(
//         `${API_URL}/api/store_staff`,
//         formattedFormData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       console.log("Response of create staff form:", formattedFormData);

//       if (response.status === 201) {
//         toast.success("Teacher created successfully!");
//         setTimeout(() => {
//           navigate("/StaffList");
//         }, 3000);
//       }
//     } catch (error) {
//       console.error("Error:", error.message);
//       toast.error("An error occurred while creating the teacher.");

//       if (error.response && error.response.data && error.response.data.errors) {
//         // setErrors(error.response.data.errors);
//         setErrors(error.response.data.errors || {});
//       } else {
//         toast.error(error.message);
//       }
//     }
//   };

//   return (
//     <div className="container mx-auto p-4 ">
//       <ToastContainer />
//       <div className="card p-4 rounded-md ">
//         <div className=" card-header mb-4 flex justify-between items-center ">
//           <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
//             Create a New Staff
//           </h5>

//           <RxCross1
//             className="float-end relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
//             onClick={() => {
//               setErrors({});
//               navigate("/StaffList");
//             }}
//           />
//         </div>
//         <p className="  md:absolute md:right-10  md:top-[10%]   text-gray-500 ">
//           <span className="text-red-500">*</span>indicates mandatory information
//         </p>
//         <form
//           onSubmit={handleSubmit}
//           className="  md:mx-5 overflow-x-hidden shadow-md p-2 bg-gray-50"
//         >
//           <div className=" flex flex-col gap-4 md:grid  md:grid-cols-3 md:gap-x-14 md:mx-10 gap-y-1">
//             <div className=" mx-auto      ">
//               <ImageCropper onImageCropped={handleImageCropped} />

//               {/* <label htmlFor="photo" className="block font-bold  text-xs mb-2">
//                 Photo
//                 {photoPreview ? (
//                   <img
//                     src={photoPreview}
//                     alt="Photo Preview"
//                     className="   h-20 w-20 rounded-[50%] mx-auto border-1  border-black object-cover"
//                   />
//                 ) : (
//                   <FaUserCircle className="mt-2 h-20 w-20 object-cover mx-auto text-gray-300" />
//                 )}
//                 <ImageCropper onImageCropped={handleImageCropped} />
//               </label> */}
//               {/* <input
//                 type="file"
//                 id="photo"
//                 name="photo"
//                 accept="image/*"
//                 onChange={handleFileChange}
//                 className="input-field text-xs box-border mt-2 bg-black text-white  "
//               /> */}
//             </div>
//             <div className="col-span-1">
//               <label
//                 htmlFor="academic_qual"
//                 className="block font-bold  text-xs mb-2"
//               >
//                 Academic Qualification <span className="text-red-500">*</span>
//               </label>
//               <div className="flex flex-wrap ">
//                 {[
//                   "Hsc",
//                   "DCE",
//                   "B.A",
//                   "B.Com",
//                   "B.Sc",
//                   "BCS",
//                   "BCA",
//                   "B.LIS",
//                   "BPharm",
//                   "BE",
//                   "B.Music n Dance",
//                   "M.A",
//                   "MSE",
//                   "M.Com",
//                   "M.Sc",
//                   "MCA",
//                   "M.LIS",
//                   "M.Phil",
//                   "MBA",
//                   "PGDBM",
//                 ].map((qualification) => (
//                   <label
//                     key={qualification}
//                     className="flex items-center mr-4 text-sm font-md"
//                   >
//                     <input
//                       type="checkbox"
//                       name="academic_qual"
//                       value={qualification}
//                       checked={formData.academic_qual.includes(qualification)}
//                       onChange={handleChange}
//                       className="mr-1 "
//                     />
//                     {qualification}
//                   </label>
//                 ))}
//               </div>
//               {errors.academic_qual && (
//                 <span className="text-red-500 text-xs">
//                   {errors.academic_qual}
//                 </span>
//               )}
//             </div>

//             <div>
//               <label
//                 htmlFor="address"
//                 className="block font-bold  text-xs mb-2"
//               >
//                 Address <span className="text-red-500">*</span>
//               </label>
//               <textarea
//                 type="text"
//                 maxLength={200}
//                 id="address"
//                 name="address"
//                 value={formData.address}
//                 onChange={handleChange}
//                 className="input-field resize block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//                 rows="4"
//                 required
//               />
//             </div>

//             <div className=" ">
//               <label
//                 htmlFor="staffName"
//                 className="block font-bold  text-xs mb-2"
//               >
//                 Staff Name <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 maxLength={100}
//                 id="staffName"
//                 name="name"
//                 pattern="^[^\d].*"
//                 title="Name should not start with a number"
//                 required
//                 value={formData.name}
//                 onChange={handleChange}
//                 placeholder="Name"
//                 className="block  border w-full border-gray-300 rounded-md py-1 px-3  bg-white shadow-inner"
//               />
//             </div>

//             <div>
//               <label
//                 htmlFor="trained"
//                 className="block font-bold  text-xs mb-2"
//               >
//                 Training Status <span className="text-red-500">*</span>
//               </label>
//               <select
//                 id="trained"
//                 name="trained"
//                 value={formData.trained}
//                 onChange={handleChange}
//                 required
//                 title="Please enter Training Status "
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//               >
//                 <option className="bg-gray-300" value="">
//                   Select
//                 </option>{" "}
//                 <option value="trained-PGT">trained-PGT</option>
//                 <option value="trained-TGT">trained-TGT</option>{" "}
//                 <option value="trained-PRT">trained-PRT</option>
//                 <option value="NTT">NTT</option>
//                 <option value="ECCE">ECCE</option>
//                 <option value="Untrained">Untrained</option>
//                 <option value="NA">NA</option>
//                 {/* Add training status options here */}
//               </select>
//             </div>
//             <div>
//               <label htmlFor="phone" className="block font-bold  text-xs mb-2">
//                 Phone <span className="text-red-500">*</span>
//               </label>
//               <div className="flex ">
//                 <span className=" rounded-l-md pt-1 bg-gray-200 text-black font-bold px-2 pointer-events-none ml-1">
//                   +91
//                 </span>
//                 <input
//                   type="tel"
//                   id="phone"
//                   name="phone"
//                   pattern="\d{10}"
//                   maxLength="12"
//                   title="Please enter only 10 digit number "
//                   value={formData.phone}
//                   onChange={handleChange}
//                   className="input-field block w-full border border-gray-300 outline-none  rounded-r-md py-1 px-3 bg-white shadow-inner "
//                   required
//                 />
//               </div>
//               {errors.phone && (
//                 <span className="error text-red-500 text-xs">
//                   {errors.phone[0]}
//                 </span>
//               )}
//               {errors.phone && (
//                 <span className="text-red-500 text-xs">{errors.phone}</span>
//               )}
//             </div>

//             <div>
//               <label
//                 htmlFor="birthday"
//                 className="block font-bold text-xs mb-2"
//               >
//                 Date of Birth <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="date"
//                 id="birthday"
//                 name="birthday"
//                 value={formData.birthday}
//                 onChange={handleChange}
//                 className="block border w-full border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//                 required
//               />
//               {errors.birthday && (
//                 <div className="text-red-500 text-xs mt-1">
//                   {errors.birthday}
//                 </div>
//               )}
//             </div>

//             {/* <div>
//               <label
//                 htmlFor=" birthday"
//                 className="block font-bold  text-xs mb-2"
//               >
//                 Date Of Birth <span className="text-red-500">*</span>
//               </label>
//               <input
//                 // type="date"
//                 type="date"
//                 id=" birthday"
//                 name=" birthday"
//                 value={formData.birthday}
//                 // placeholder="dd/MM/yyyy"
//                 onChange={handleChange}
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//                 // required
//               />
//               {errors.birthday && (
//                 <span className="text-red-500 text-xs">{errors.birthday}</span>
//               )}
//             </div> */}
//             <div>
//               <label
//                 htmlFor="experience"
//                 className="block font-bold  text-xs mb-2"
//               >
//                 experience <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="number"
//                 maxLength={2}
//                 id="experience"
//                 name="experience"
//                 value={formData.experience}
//                 placeholder="In year"
//                 onChange={handleChange}
//                 required
//                 title="Only enter digits in year like 1 or 5"
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//               />
//             </div>
//             <div>
//               <label htmlFor="email" className="block font-bold  text-xs mb-2">
//                 Email <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="email"
//                 maxLength={51}
//                 id="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//                 required
//                 placeholder="example@email.com"
//                 title="Please enter a valid email address that ends with @gmail.com"
//               />

//               {errors.email && (
//                 <span className="error text-red-500 text-xs">
//                   {errors.email[0]}
//                 </span>
//               )}
//             </div>
//             <div>
//               <label
//                 htmlFor="date_of_joining"
//                 className="block font-bold  text-xs mb-2"
//               >
//                 Date Of Joining <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="date"
//                 id="date_of_joining"
//                 name="date_of_joining"
//                 value={formData.date_of_joining}
//                 onChange={handleChange}
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//                 required
//               />
//               {errors.date_of_joining && (
//                 <span className="text-red-500 text-xs">
//                   {errors.date_of_joining}
//                 </span>
//               )}
//             </div>
//             <div className="">
//               <label htmlFor="sex" className="block font-bold  text-xs mb-2">
//                 Gender <span className="text-red-500">*</span>
//               </label>
//               <select
//                 id="sex"
//                 name="sex"
//                 // maxLength="6"
//                 value={formData.sex}
//                 onChange={handleChange}
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//                 required
//               >
//                 <option className=" bg-gray-300" value="">
//                   Select
//                 </option>
//                 <option value="male">Male</option>
//                 <option value="female">Female</option>
//                 <option value="other">Other</option>
//               </select>
//               {errors.sex && (
//                 <span className="text-red-500 text-xs">{errors.sex}</span>
//               )}
//             </div>
//             <div>
//               <label
//                 htmlFor="aadhar_card_no"
//                 className="block font-bold  text-xs mb-2"
//               >
//                 Aadhaar Card No.
//               </label>
//               <input
//                 type="tel"
//                 maxLength={12}
//                 id="aadhar_card_no"
//                 name="aadhar_card_no"
//                 value={formData.aadhar_card_no}
//                 pattern="\d{12}"
//                 title="Aadhaar Card Number must be exactly 12 digits Number"
//                 onChange={handleChange}
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//               />{" "}
//               {errors.aadhar_card_no && (
//                 <span className="text-red-500 text-xs">
//                   {errors.aadhar_card_no[0]}
//                 </span>
//               )}
//             </div>

//             <div>
//               <label
//                 htmlFor="designation"
//                 className="block font-bold  text-xs mb-2"
//               >
//                 designation
//               </label>
//               <input
//                 type="text"
//                 maxLength={30}
//                 id="designation"
//                 name="designation"
//                 value={formData.designation}
//                 onChange={handleChange}
//                 // required
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//               />
//             </div>
//             <div>
//               <label
//                 htmlFor="blood_group"
//                 className="block font-bold  text-xs mb-2"
//               >
//                 Blood Group
//               </label>
//               <select
//                 id="blood_group"
//                 name="blood_group"
//                 value={formData.blood_group}
//                 onChange={handleChange}
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//               >
//                 <option className="bg-gray-300" value="">
//                   Select
//                 </option>
//                 <option value="A+">A+</option>
//                 <option value="A-">A-</option>
//                 <option value="B+">B+</option>
//                 <option value="B-">B-</option>
//                 <option value="O+">O+</option>
//                 <option value="O-">O-</option>
//                 <option value="AB+">AB+</option>
//                 <option value="AB-">AB-</option>
//               </select>
//             </div>
//             <div>
//               <label htmlFor="role" className="block font-bold  text-xs mb-2">
//                 Role <span className="text-red-500">*</span>
//               </label>
//               <select
//                 id="role"
//                 name="role"
//                 value={formData.role}
//                 onChange={handleChange}
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//                 required
//               >
//                 <option className="bg-gray-300" value="">
//                   Select
//                 </option>
//                 <option value="A">Admin</option>
//                 <option value="B">Bus</option>
//                 <option value="E">Data Entry</option>
//                 <option value="F">Finance</option>
//                 <option value="L">Librarian</option>
//                 <option value="M">Management</option>
//                 <option value="N">Printer</option>
//                 <option value="O">owner</option>
//                 <option value="R">Support</option>
//                 <option value="T">Teacher</option>
//                 <option value="X">Support Staff</option>
//                 <option value="Y">Security</option>
//               </select>
//               {errors.role && (
//                 <span className="text-red-500 text-xs">{errors.role}</span>
//               )}
//             </div>
//             <div>
//               <div>
//                 <label
//                   htmlFor="professional_qual"
//                   className="block font-bold  text-xs mb-2"
//                 >
//                   Professional Qualification
//                 </label>
//                 <select
//                   id="professional_qual"
//                   name="professional_qual"
//                   value={formData.professional_qual}
//                   onChange={handleChange}
//                   className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//                 >
//                   <option className="bg-gray-300" value="">
//                     Select
//                   </option>
//                   <option value="D.Ed">D.Ed</option>
//                   <option value="B.Ed">B.Ed</option>
//                   <option value="B.P.Ed">B.P.Ed</option>
//                   <option value="M.P.Ed">M.P.Ed</option>
//                   <option value="M.Ed">M.Ed</option>
//                   <option value="NA">NA</option>
//                   {/* Add professional qualification options here */}
//                 </select>
//               </div>
//             </div>

//             <div>
//               <label
//                 htmlFor="religion"
//                 className="block font-bold  text-xs mb-2"
//               >
//                 Religion
//               </label>
//               <select
//                 id="religion"
//                 name="religion"
//                 value={formData.religion}
//                 onChange={handleChange}
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//               >
//                 <option className="bg-gray-300" value="">
//                   Select
//                 </option>{" "}
//                 <option value="Hindu">Hindu</option>
//                 <option value="Christian">Christian</option>{" "}
//                 <option value="Muslim">Muslim</option>
//                 <option value="Sikh">Sikh</option>
//                 <option value="Jain">Jain</option>
//                 <option value="Buddhist">Buddhist</option>
//                 <option value="NA">NA</option>
//                 {/* Add training status options here */}
//               </select>
//             </div>
//             {/* <div>
//               <label
//                 htmlFor="religion"
//                 className="block font-bold  text-xs mb-2"
//               >
//                 Religion
//               </label>
//               <input
//                 type="text"
//                 id="religion"
//                 name="religion"
//                 pattern="^[^\d].*"
//                 title="Religion should not start with a number"
//                 // required
//                 placeholder="Christian"
//                 value={formData.religion}
//                 onChange={handleChange}
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//               />
//             </div> */}
//             <div>
//               <label
//                 htmlFor="employeeId"
//                 className="block font-bold  text-xs mb-2"
//               >
//                 Employee ID <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="tel"
//                 maxLength={5}
//                 id="employeeId"
//                 name="employeeId"
//                 value={formData.employeeId}
//                 onChange={handleChange}
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//                 required
//               />
//               {errors.employeeId && (
//                 <span className="text-red-500 text-xs">
//                   {errors.employeeId}
//                 </span>
//               )}
//             </div>

//             <div>
//               <label
//                 htmlFor="special_sub"
//                 className="block font-bold  text-xs mb-2"
//               >
//                 Special Subject
//               </label>
//               <input
//                 type="text"
//                 maxLength={30}
//                 id="special_sub"
//                 name="special_sub"
//                 value={formData.special_sub}
//                 onChange={handleChange}
//                 placeholder="Special Subject for D.Ed/B.Ed"
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//               />
//             </div>

//             <div className="col-span-3  text-right">
//               <button
//                 type="submit"
//                 style={{ backgroundColor: "#2196F3" }}
//                 className=" text-white font-bold py-1 border-1 border-blue-500 px-4 rounded"
//               >
//                 Create Staff
//               </button>
//             </div>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default CreateStaff;




import React, { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { RxCross1 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import ImageCropper from "../common/ImageUploadAndCrop.jsx";

function CreateStaff() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [formData, setFormData] = useState({
    name: "",
    birthday: "",
    date_of_joining: "",
    designation: "",
    academic_qual: [],
    professional_qual: "",
    trained: "",
    experience: "",
    sex: "",
    blood_group: "",
    religion: "",
    address: "",
    phone: "",
    email: "",
    aadhar_card_no: "",
    role: "",
    employeeId: "",
    teacher_image_name: null,
    special_sub: "",
  });
  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);
  const [academicError, setAcademicError] = useState("");
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};

    // Validate name
    if (!formData.name) newErrors.name = "Name is required";
    else if (!/^[^\d].*/.test(formData.name))
      newErrors.name = "Name should not start with a number";

    // Validate birthday
    if (!formData.birthday) newErrors.birthday = "Date of Birth is required";

    // Validate date of joining
    if (!formData.date_of_joining)
      newErrors.date_of_joining = "Date of Joining is required";

    // Validate sex
    if (!formData.sex) newErrors.sex = "Sex is required";

    // Validate address
    if (!formData.address) newErrors.address = "Address is required";

    // Validate phone number
    if (!formData.phone) newErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.phone))
      newErrors.phone = "Phone number must be 10 digits";

    // Validate email
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email address is invalid";

    // Validate role
    if (!formData.role) newErrors.role = "Role is required";

    // Validate employee ID
    if (!formData.employeeId) newErrors.employeeId = "Employee ID is required";

    // Validate experience
    if (!formData.experience) newErrors.experience = "Experience is required";
    else if (!/^\d+$/.test(formData.experience))
      newErrors.experience = "Experience must be a whole number";

    // Validate aadhar card number
    if (!formData.aadhar_card_no)
      newErrors.aadhar_card_no = "Aadhar card number is required";
    else if (!/^\d{12}$/.test(formData.aadhar_card_no.replace(/\s+/g, "")))
      newErrors.aadhar_card_no = "Aadhar card number must be 12 digits";

    // Validate academic qualifications
    if (!formData.academic_qual.length)
      newErrors.academic_qual =
        "Please select at least one academic qualification";

    setErrors(newErrors);

    return newErrors;
  };

  const handleChange = (event) => {
    const { name, value, checked } = event.target;
    let newValue = value;

    if (name === "experience") {
      newValue = newValue.replace(/[^0-9]/g, "");
    } else if (name === "aadhar_card_no") {
      newValue = newValue.replace(/\s+/g, "");
    }
    if (name === "phone" || name === "aadhar_card_no") {
      newValue = newValue.replace(/[^\d]/g, "");
    }
    if (name === "academic_qual") {
      setFormData((prevData) => {
        const newAcademicQual = checked
          ? [...prevData.academic_qual, value]
          : prevData.academic_qual.filter(
              (qualification) => qualification !== value
            );
        return { ...prevData, academic_qual: newAcademicQual };
      });
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: newValue,
      }));
    }
    validate(); // Call validate on each change to show real-time errors
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFormData((prevState) => ({
      ...prevState,
      teacher_image_name: file,
    }));
    setPhotoPreview(URL.createObjectURL(file));
  };

  const formatDateString = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${year}-${month}-${day}`;
  };

  const handleImageCropped = (croppedImageData) => {
    setFormData((prevData) => ({
      ...prevData,
      teacher_image_name: croppedImageData,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validate();
    const errorsToCheck = validationErrors || {};
    // Check if there are any errors

    if (Object.keys(errorsToCheck).length > 0) {
      setErrors(errorsToCheck);
      Object.values(errorsToCheck).forEach((error) => {
        toast.error(error);
      });
      return;
    }

    const formattedFormData = {
      ...formData,
      birthday: formatDateString(formData.birthday),
      date_of_joining: formatDateString(formData.date_of_joining),
    };

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token is found");
      }
      const response = await axios.post(
        `${API_URL}/api/store_staff`,
        formattedFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        toast.success("Teacher created successfully!");
        setTimeout(() => {
          navigate("/StaffList");
        }, 3000);
      }
    } catch (error) {
      console.error("Error:", error.message);
      toast.error("An error occurred while creating the teacher.");
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors || {});
      } else {
        toast.error(error.message);
      }
    }
  };
  return (
    <div className="container mx-auto p-4 ">
      <ToastContainer />
      <div className="card p-4 rounded-md ">
        <div className=" card-header mb-4 flex justify-between items-center ">
          <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
            Create a New Staff
          </h5>

          <RxCross1
            className="float-end relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
            onClick={() => {
              setErrors({});
              navigate("/StaffList");
            }}
          />
        </div>
        <p className="  md:absolute md:right-10  md:top-[10%]   text-gray-500 ">
          <span className="text-red-500">*</span>indicates mandatory information
        </p>
        <form
          onSubmit={handleSubmit}
          className="  md:mx-5 overflow-x-hidden shadow-md p-2 bg-gray-50"
        >
          <div className=" flex flex-col gap-4 md:grid  md:grid-cols-3 md:gap-x-14 md:mx-10 gap-y-1">
            <div className=" mx-auto      ">
              <ImageCropper onImageCropped={handleImageCropped} />

              {/* <label htmlFor="photo" className="block font-bold  text-xs mb-2">
                Photo
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Photo Preview"
                    className="   h-20 w-20 rounded-[50%] mx-auto border-1  border-black object-cover"
                  />
                ) : (
                  <FaUserCircle className="mt-2 h-20 w-20 object-cover mx-auto text-gray-300" />
                )}
                <ImageCropper onImageCropped={handleImageCropped} />
              </label> */}
              {/* <input
                type="file"
                id="photo"
                name="photo"
                accept="image/*"
                onChange={handleFileChange}
                className="input-field text-xs box-border mt-2 bg-black text-white  "
              /> */}
            </div>
            <div className="col-span-1">
              <label
                htmlFor="academic_qual"
                className="block font-bold  text-xs mb-2"
              >
                Academic Qualification <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap ">
                {[
                  "Hsc",
                  "DCE",
                  "B.A",
                  "B.Com",
                  "B.Sc",
                  "BCS",
                  "BCA",
                  "B.LIS",
                  "BPharm",
                  "BE",
                  "B.Music n Dance",
                  "M.A",
                  "MSE",
                  "M.Com",
                  "M.Sc",
                  "MCA",
                  "M.LIS",
                  "M.Phil",
                  "MBA",
                  "PGDBM",
                ].map((qualification) => (
                  <label
                    key={qualification}
                    className="flex items-center mr-4 text-sm font-md"
                  >
                    <input
                      type="checkbox"
                      name="academic_qual"
                      value={qualification}
                      checked={formData.academic_qual.includes(qualification)}
                      onChange={handleChange}
                      className="mr-1 "
                    />
                    {qualification}
                  </label>
                ))}
              </div>
              {errors.academic_qual && (
                <span className="text-red-500 text-xs">
                  {errors.academic_qual}
                </span>
              )}
            </div>

            <div>
              <label
                htmlFor="address"
                className="block font-bold  text-xs mb-2"
              >
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                type="text"
                maxLength={200}
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="input-field resize block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                rows="4"
                required
              />
            </div>

            <div className=" ">
              <label
                htmlFor="staffName"
                className="block font-bold  text-xs mb-2"
              >
                Staff Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={100}
                id="staffName"
                name="name"
                pattern="^[^\d].*"
                title="Name should not start with a number"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
                className="block  border w-full border-gray-300 rounded-md py-1 px-3  bg-white shadow-inner"
              />
            </div>

            <div>
              <label
                htmlFor="trained"
                className="block font-bold  text-xs mb-2"
              >
                Training Status <span className="text-red-500">*</span>
              </label>
              <select
                id="trained"
                name="trained"
                value={formData.trained}
                onChange={handleChange}
                required
                title="Please enter Training Status "
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
              >
                <option className="bg-gray-300" value="">
                  Select
                </option>{" "}
                <option value="trained-PGT">trained-PGT</option>
                <option value="trained-TGT">trained-TGT</option>{" "}
                <option value="trained-PRT">trained-PRT</option>
                <option value="NTT">NTT</option>
                <option value="ECCE">ECCE</option>
                <option value="Untrained">Untrained</option>
                <option value="NA">NA</option>
                {/* Add training status options here */}
              </select>
            </div>
            <div>
              <label htmlFor="phone" className="block font-bold  text-xs mb-2">
                Phone <span className="text-red-500">*</span>
              </label>
              <div className="flex ">
                <span className=" rounded-l-md pt-1 bg-gray-200 text-black font-bold px-2 pointer-events-none ml-1">
                  +91
                </span>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  pattern="\d{10}"
                  maxLength="10"
                  title="Please enter only 10 digit number "
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field block w-full border border-gray-300 outline-none  rounded-r-md py-1 px-3 bg-white shadow-inner "
                  required
                />
              </div>{" "}
              {errors.phone && (
                <span className="text-red-500 text-xs">{errors.phone[0]}</span>
              )}
              {errors.phone && (
                <span className="text-red-500 text-xs">{errors.phone}</span>
              )}
            </div>

            <div>
              <label
                htmlFor="birthday"
                className="block font-bold text-xs mb-2"
              >
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="birthday"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
                className="block border w-full border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                required
              />
              {errors.birthday && (
                <div className="text-red-500 text-xs mt-1">
                  {errors.birthday}
                </div>
              )}
            </div>

            {/* <div>
              <label
                htmlFor=" birthday"
                className="block font-bold  text-xs mb-2"
              >
                Date Of Birth <span className="text-red-500">*</span>
              </label>
              <input
                // type="date"
                type="date"
                id=" birthday"
                name=" birthday"
                value={formData.birthday}
                // placeholder="dd/MM/yyyy"
                onChange={handleChange}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                // required
              />
              {errors.birthday && (
                <span className="text-red-500 text-xs">{errors.birthday}</span>
              )}
            </div> */}
            <div>
              <label
                htmlFor="experience"
                className="block font-bold  text-xs mb-2"
              >
                experience <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={2}
                id="experience"
                name="experience"
                value={formData.experience}
                placeholder="In year"
                onChange={handleChange}
                required
                title="Only enter digits in year like 1 or 5"
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
              />
            </div>
            <div>
              <label htmlFor="email" className="block font-bold  text-xs mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                maxLength={51}
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                required
                placeholder="example@email.com"
                title="Please enter a valid email address that ends with @gmail.com"
              />

              {errors.email && (
                <span className="error text-red-500 text-xs">
                  {errors.email[0]}
                </span>
              )}
            </div>
            <div>
              <label
                htmlFor="date_of_joining"
                className="block font-bold  text-xs mb-2"
              >
                Date Of Joining <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="date_of_joining"
                name="date_of_joining"
                value={formData.date_of_joining}
                onChange={handleChange}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                required
              />
              {errors.date_of_joining && (
                <span className="text-red-500 text-xs">
                  {errors.date_of_joining}
                </span>
              )}
            </div>
            <div className="">
              <label htmlFor="sex" className="block font-bold  text-xs mb-2">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                id="sex"
                name="sex"
                // maxLength="6"
                value={formData.sex}
                onChange={handleChange}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                required
              >
                <option className=" bg-gray-300" value="">
                  Select
                </option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.sex && (
                <span className="text-red-500 text-xs">{errors.sex}</span>
              )}
            </div>
            <div>
              <label
                htmlFor="aadhar_card_no"
                className="block font-bold  text-xs mb-2"
              >
                Aadhaar Card No.
              </label>
              <input
                type="tel"
                maxLength={12}
                id="aadhar_card_no"
                name="aadhar_card_no"
                value={formData.aadhar_card_no}
                pattern="\d{12}"
                title="Aadhaar Card Number must be exactly 12 digits Number"
                onChange={handleChange}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
              />{" "}
              {errors.aadhar_card_no && (
                <span className="text-red-500 text-xs">
                  {errors.aadhar_card_no}
                </span>
              )}
            </div>

            <div>
              <label
                htmlFor="designation"
                className="block font-bold  text-xs mb-2"
              >
                designation
              </label>
              <input
                type="text"
                maxLength={30}
                id="designation"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                // required
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
              />
            </div>
            <div>
              <label
                htmlFor="blood_group"
                className="block font-bold  text-xs mb-2"
              >
                Blood Group
              </label>
              <select
                id="blood_group"
                name="blood_group"
                value={formData.blood_group}
                onChange={handleChange}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
              >
                <option className="bg-gray-300" value="">
                  Select
                </option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
            <div>
              <label htmlFor="role" className="block font-bold  text-xs mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                required
              >
                <option className="bg-gray-300" value="">
                  Select
                </option>
                <option value="A">Admin</option>
                <option value="B">Bus</option>
                <option value="E">Data Entry</option>
                <option value="F">Finance</option>
                <option value="L">Librarian</option>
                <option value="M">Management</option>
                <option value="N">Printer</option>
                <option value="O">owner</option>
                <option value="R">Support</option>
                <option value="T">Teacher</option>
                <option value="X">Support Staff</option>
                <option value="Y">Security</option>
              </select>
              {errors.role && (
                <span className="text-red-500 text-xs">{errors.role}</span>
              )}
            </div>
            <div>
              <div>
                <label
                  htmlFor="professional_qual"
                  className="block font-bold  text-xs mb-2"
                >
                  Professional Qualification
                </label>
                <select
                  id="professional_qual"
                  name="professional_qual"
                  value={formData.professional_qual}
                  onChange={handleChange}
                  className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                >
                  <option className="bg-gray-300" value="">
                    Select
                  </option>
                  <option value="D.Ed">D.Ed</option>
                  <option value="B.Ed">B.Ed</option>
                  <option value="B.P.Ed">B.P.Ed</option>
                  <option value="M.P.Ed">M.P.Ed</option>
                  <option value="M.Ed">M.Ed</option>
                  <option value="NA">NA</option>
                  {/* Add professional qualification options here */}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="religion"
                className="block font-bold  text-xs mb-2"
              >
                Religion
              </label>
              <select
                id="religion"
                name="religion"
                value={formData.religion}
                onChange={handleChange}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
              >
                <option className="bg-gray-300" value="">
                  Select
                </option>{" "}
                <option value="Hindu">Hindu</option>
                <option value="Christian">Christian</option>{" "}
                <option value="Muslim">Muslim</option>
                <option value="Sikh">Sikh</option>
                <option value="Jain">Jain</option>
                <option value="Buddhist">Buddhist</option>
                <option value="NA">NA</option>
                {/* Add training status options here */}
              </select>
            </div>
            {/* <div>
              <label
                htmlFor="religion"
                className="block font-bold  text-xs mb-2"
              >
                Religion
              </label>
              <input
                type="text"
                id="religion"
                name="religion"
                pattern="^[^\d].*"
                title="Religion should not start with a number"
                // required
                placeholder="Christian"
                value={formData.religion}
                onChange={handleChange}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
              />
            </div> */}
            <div>
              <label
                htmlFor="employeeId"
                className="block font-bold  text-xs mb-2"
              >
                Employee ID <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                maxLength={5}
                id="employeeId"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                required
              />
              {errors.employeeId && (
                <span className="text-red-500 text-xs">
                  {errors.employeeId}
                </span>
              )}
            </div>

            <div>
              <label
                htmlFor="special_sub"
                className="block font-bold  text-xs mb-2"
              >
                Special Subject
              </label>
              <input
                type="text"
                maxLength={30}
                id="special_sub"
                name="special_sub"
                value={formData.special_sub}
                onChange={handleChange}
                placeholder="Special Subject for D.Ed/B.Ed"
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
              />
            </div>

            <div className="col-span-3  text-right">
              <button
                type="submit"
                style={{ backgroundColor: "#2196F3" }}
                className=" text-white font-bold py-1 border-1 border-blue-500 px-4 rounded"
              >
                Create Staff
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateStaff;