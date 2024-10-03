// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import ReactPaginate from "react-paginate";
// // import NavBar from "../Header/NavBar";
// import "bootstrap/dist/css/bootstrap.min.css";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// function Sections() {
//   const [sections, setSections] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [currentSection, setCurrentSection] = useState(null);
//   const [newSectionName, setNewSectionName] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(0);
//   const [pageCount, setPageCount] = useState(0);
//   const pageSize = 20;

//   const fetchSections = async () => {
//     try {
//       const token = localStorage.getItem("authToken");
//       const academicYr = localStorage.getItem("academicYear");

//       if (!token) {
//         throw new Error("No authentication token or academic year found");
//       }

//       const response = await axios.get("http://127.0.0.1:8000/api/sections", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "X-Academic-Year": academicYr,
//         },
//         withCredentials: true,
//       });

//       setSections(response.data);
//       setPageCount(Math.ceil(response.data.length / pageSize));
//     } catch (error) {
//       setError(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchSections();
//   }, []);

//   const handlePageClick = (data) => {
//     setCurrentPage(data.selected);
//   };

//   const handleEdit = (section) => {
//     setCurrentSection(section);
//     setNewSectionName(section.name);
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
//     setCurrentSection(null);
//   };

//   const handleSubmitAdd = async () => {
//     try {
//       const token = localStorage.getItem("authToken");
//       const academicYr = localStorage.getItem("academicYear");

//       if (!token) {
//         throw new Error("No authentication token or academic year found");
//       }

//       await axios.post(
//         "http://127.0.0.1:8000/api/sections",
//         { name: newSectionName },
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
//     }
//   };

//   const handleSubmitEdit = async () => {
//     try {
//       const token = localStorage.getItem("authToken");
//       const academicYr = localStorage.getItem("academicYear");

//       if (!token) {
//         throw new Error("No authentication token or academic year found");
//       }

//       await axios.put(
//         `http://127.0.0.1:8000/api/sections/${currentSection.department_id}`,
//         { name: newSectionName },
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
//     } catch (error) {
//       console.error("Error editing section:", error);
//     }
//   };

//   const handleDelete = (id) => {
//     const sectionToDelete = sections.find((sec) => sec.department_id === id);
//     setCurrentSection(sectionToDelete);
//     setShowDeleteModal(true);
//   };

//   const handleSubmitDelete = async () => {
//     try {
//       const token = localStorage.getItem("authToken");
//       const academicYr = localStorage.getItem("academicYear");

//       if (
//         !token ||
//         // !academicYr ||
//         !currentSection ||
//         !currentSection.department_id
//       ) {
//         throw new Error("Section ID is missing");
//       }

//       await axios.delete(
//         `http://127.0.0.1:8000/api/sections/${currentSection.department_id}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "X-Academic-Year": academicYr,
//           },
//           withCredentials: true,
//         }
//       );

//       fetchSections();
//       setShowDeleteModal(false);
//       setCurrentSection(null);
//       toast.success("Section deleted successfully!");
//     } catch (error) {
//       console.error("Error deleting section:", error);
//       setError(error.message);
//     }
//   };

//   const filteredSections = sections.filter((section) =>
//     section.name.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const displayedSections = filteredSections.slice(
//     currentPage * pageSize,
//     (currentPage + 1) * pageSize
//   );

//   if (loading) return <p>Loading...</p>;
//   if (error) return <p>Error: {error}</p>;

//   return (
//     <>
//       {/* <NavBar /> */}
//       <ToastContainer />

//       <div className="container mt-4">
//         <div className="card" style={{ margin: "0 auto", width: "70%" }}>
//           <div className="card-header d-flex justify-content-between align-items-center">
//             <h3>Sections</h3>
//             <button
//               className="btn btn-primary btn-sm"
//               style={{ width: "80px" }}
//               onClick={handleAdd}
//             >
//               <FontAwesomeIcon icon={faPlus} style={{ marginRight: "5px" }} />
//               Add
//             </button>
//           </div>
//           <div className="card-body">
//             <div className="d-flex justify-content-end mb-3">
//               <input
//                 type="text"
//                 className="form-control w-50"
//                 placeholder="Search by name"
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>
//             <div className="table-responsive">
//               <table className="table table-bordered table-striped">
//                 <thead>
//                   <tr>
//                     <th>Name</th>
//                     <th>Edit</th>
//                     <th>Delete</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {displayedSections.map((section) => (
//                     <tr key={section.department_id}>
//                       <td>{section.name}</td>
//                       <td className="text-center">
//                         <FontAwesomeIcon
//                           icon={faEdit}
//                           className="text-warning"
//                           onClick={() => handleEdit(section)}
//                           style={{ cursor: "pointer", fontSize: "1.5em" }}
//                         />
//                       </td>
//                       <td className="text-center">
//                         <FontAwesomeIcon
//                           icon={faTrash}
//                           className="text-danger"
//                           onClick={() => handleDelete(section.department_id)}
//                           style={{ cursor: "pointer", fontSize: "1.5em" }}
//                         />
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//             <div className="d-flex justify-content-center mt-3">
//               <ReactPaginate
//                 previousLabel={"previous"}
//                 nextLabel={"next"}
//                 breakLabel={"..."}
//                 breakClassName={"page-item"}
//                 breakLinkClassName={"page-link"}
//                 pageCount={pageCount}
//                 marginPagesDisplayed={2}
//                 pageRangeDisplayed={5}
//                 onPageChange={handlePageClick}
//                 containerClassName={"pagination justify-content-center"}
//                 pageClassName={"page-item"}
//                 pageLinkClassName={"page-link"}
//                 previousClassName={"page-item"}
//                 previousLinkClassName={"page-link"}
//                 nextClassName={"page-item"}
//                 nextLinkClassName={"page-link"}
//                 activeClassName={"active"}
//               />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Modal for adding a new section */}
//       {showAddModal && (
//         <div
//           className="modal"
//           style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
//         >
//           <div className="modal-dialog modal-dialog-centered">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title">Add New Section</h5>
//                 <button
//                   type="button"
//                   className="btn-close"
//                   onClick={handleCloseModal}
//                 ></button>
//               </div>
//               <div className="modal-body">
//                 <div className="mb-3">
//                   <label htmlFor="sectionName" className="form-label">
//                     Section Name
//                   </label>
//                   <input
//                     type="text"
//                     className="form-control"
//                     id="sectionName"
//                     value={newSectionName}
//                     onChange={(e) => setNewSectionName(e.target.value)}
//                   />
//                 </div>
//               </div>
//               <div className="modal-footer d-flex justify-content-end">
//                 {/* <button type="button" className="btn btn-secondary me-2" onClick={handleCloseModal}>Cancel</button> */}
//                 <button
//                   type="button"
//                   className="btn btn-primary"
//                   style={{ marginRight: "40px" }}
//                   onClick={handleSubmitAdd}
//                 >
//                   Add
//                 </button>
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
//                     New Section Name
//                   </label>
//                   <input
//                     type="text"
//                     className="form-control"
//                     id="editSectionName"
//                     value={newSectionName}
//                     onChange={(e) => setNewSectionName(e.target.value)}
//                   />
//                 </div>
//               </div>
//               <div className="modal-footer">
//                 {/* <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button> */}
//                 <button
//                   type="button"
//                   className="btn btn-primary"
//                   style={{ marginRight: "40px" }}
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
//                   Are you sure you want to delete section:{" "}
//                   <strong>{currentSection.name}</strong>?
//                 </p>
//               </div>
//               <div className="modal-footer">
//                 {/* <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button> */}
//                 <button
//                   type="button"
//                   className="btn btn-danger"
//                   style={{ marginRight: "40px" }}
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
// export default Sections;

import { useEffect, useState } from "react";
import axios from "axios";
import ReactPaginate from "react-paginate";
// import NavBar from "../../../Layouts/NavBar";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RxCross1 } from "react-icons/rx";

function Sections() {
  const API_URL = import.meta.env.VITE_API_URL; // url for host
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const [newSectionName, setNewSectionName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [fieldErrors, setFieldErrors] = useState({}); // For field-specific errors
  // validations state for unique name
  const [nameAvailable, setNameAvailable] = useState(true);
  const [nameError, setNameError] = useState("");
  const [roleId, setRoleId] = useState("");
  const pageSize = 10;

  const fetchSections = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(`${API_URL}/api/sections`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      setSections(response.data);
      setPageCount(Math.ceil(response.data.length / pageSize));
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
    fetchDataRoleId();
  }, []);

  const validateSectionName = (name) => {
    const regex = /^[a-zA-Z]+$/;
    let errors = {};

    // Check if the name is empty
    if (!name) {
      errors.name = "Please enter the section name.";
    } else {
      // Additional validations if the name is not empty
      if (name.length > 255) {
        errors.name = "The name field must not exceed 255 characters.";
      } else if (!regex.test(name)) {
        errors.name = "Please enter alphabets without spaces.";
      }
    }

    return errors;
  };

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  // for role_id
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
      // setRoleId("A"); // Store role_id
      console.log("roleIDis:", roleId);
      // Fetch academic year data
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // // APi calling for check unique name
  // const handleBlur = async () => {
  //   try {
  //     const token = localStorage.getItem("authToken");
  //     console.log("the response of the namechack api____", newSectionName);

  //     if (!token) {
  //       throw new Error("No authentication token found");
  //     }

  //     const response = await axios.post(
  //       `${API_URL}/api/check_section_name`,
  //       { name: newSectionName },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //         withCredentials: true,
  //       }
  //     );
  //     console.log("the response of the namechack api", response.data);
  //     if (response.data?.exists === true) {
  //       setNameError("Name is already taken.");
  //       setNameAvailable(false);
  //     } else {
  //       setNameError("");
  //       setNameAvailable(true);
  //     }
  //   } catch (error) {
  //     console.error("Error checking class name:", error);
  //   }
  // };
  const handleEdit = (section) => {
    setCurrentSection(section);
    setNewSectionName(section.name);
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
    setCurrentSection(null);
    setFieldErrors({}); // Clear field-specific errors when closing the modal
    setNameError("");
  };

  const handleSubmitAdd = async () => {
    const validationErrors = validateSectionName(newSectionName);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No authentication token or academic year found");
      }
      console.log("Name is:", newSectionName);

      const checkNameResponse = await axios.post(
        `${API_URL}/api/check_section_name`,
        { name: newSectionName },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      if (checkNameResponse.data?.exists === true) {
        setNameError("Name is already taken.");
        setNameAvailable(false);
        return;
      } else {
        setNameError("");
        setNameAvailable(true);
      }
      await axios.post(
        `${API_URL}/api/sections`,
        { name: newSectionName },
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
    const validationErrors = validateSectionName(newSectionName);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No authentication token or academic year found");
      }
      const nameCheckResponse = await axios.post(
        `${API_URL}/api/check_section_name`,
        { name: newSectionName },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      if (nameCheckResponse.data?.exists === true) {
        setNameError("Name already taken.");
        setNameAvailable(false);
        return;
      } else {
        setNameError("");
        setNameAvailable(true);
      }
      await axios.put(
        `${API_URL}/api/sections/${currentSection.department_id}`,
        { name: newSectionName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      fetchSections();
      handleCloseModal();
      toast.success("Section Updated successfully!");
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
    const sectionToDelete = sections.find((sec) => sec.department_id === id);
    setCurrentSection(sectionToDelete);
    setShowDeleteModal(true);
  };

  const handleSubmitDelete = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token || !currentSection || !currentSection.department_id) {
        throw new Error("Section ID is missing");
      }

      const response = await axios.delete(
        `${API_URL}/api/sections/${currentSection.department_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      if (response.data.success) {
        fetchSections();
        setShowDeleteModal(false);
        setCurrentSection(null);
        toast.success("Section deleted successfully!");
      } else {
        toast.error(response.data.message || "Failed to delete section");
      }
    } catch (error) {
      console.error("Error deleting section:", error);
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
    const { value } = e.target;
    setNameError("");

    setNewSectionName(value);
    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      name: validateSectionName(value).name,
    }));
  };

  const filteredSections = sections.filter((section) =>
    section.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedSections = filteredSections.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  // if (loading) return <p>Loading...</p>;
  // if (error) return <p>Error: {error}</p>;

  return (
    <>
      {/* <NavBar /> */}
      <ToastContainer />

      <div className="container mt-4">
        <div className="card mx-auto lg:w-3/4 shadow-lg">
          <div className="p-2 px-3 bg-gray-100 flex justify-between items-center">
            <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
              Section
            </h3>
            <div className="box-border flex md:gap-x-2 justify-end md:h-10">
              <div className=" w-1/2 md:w-fit mr-1">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search "
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
          </div>{" "}
          <div
            className=" relative w-[97%]   mb-3 h-1  mx-auto bg-red-700"
            style={{
              backgroundColor: "#C03078",
            }}
          ></div>
          {/* <div className="card-header flex justify-between items-center">
            <h3 className="text-gray-700 mt-1 text-md lg:text-xl">
              Department
            </h3>
            <div className=" box-border flex gap-x-2  justify-end md:h-10 ">
              <div className="">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search "
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                className="btn btn-primary btn-sm h-9"
                // style={{ width: "80px" }}
                onClick={handleAdd}
              >
                <FontAwesomeIcon icon={faPlus} style={{ marginRight: "5px" }} />
                Add
              </button>
            </div>
          </div> */}
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
                        Section name
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
                          key={section.department_id}
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
                          {roleId === "M" ? (
                            <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                              <button
                                className="text-pink-600 hover:text-pink-800 hover:bg-transparent "
                                // onClick={() => handleEdit(section)}
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                            </td>
                          ) : (
                            <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                              <button
                                className="text-blue-600 hover:text-blue-800 hover:bg-transparent "
                                onClick={() => handleEdit(section)}
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                            </td>
                          )}
                          {roleId === "M" ? (
                            <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                              <button
                                className="text-green-600 hover:green-red-800 hover:bg-transparent "
                                // onClick={() =>
                                //   handleDelete(section.department_id)
                                // }
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </td>
                          ) : (
                            <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                              <button
                                className="text-red-600 hover:text-red-800 hover:bg-transparent "
                                onClick={() =>
                                  handleDelete(section.department_id)
                                }
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </td>
                          )}
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
                containerClassName={"pagination justify-content-center"}
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

      {/* Modal for adding a new section */}
      {showAddModal && (
        <div className="fixed inset-0 z-50   flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="modal"
            style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered ">
              <div className="modal-content">
                <div className="flex justify-between p-3">
                  <h5 className="modal-title">Create New Section</h5>
                  <RxCross1
                    className="float-end relative top-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
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
                    <label htmlFor="sectionName" className="w-1/2 mt-2">
                      Section Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={30}
                      className="form-control shadow-md mb-2"
                      id="sectionName"
                      value={newSectionName}
                      onChange={handleChangeSectionName}
                      // onChange={(e) => setNewSectionName(e.target.value)}
                      // onBlur={handleBlur}
                    />
                    <div className="absolute top-9 left-1/3">
                      {!nameAvailable && (
                        <small className=" block text-danger text-xs ">
                          {nameError}
                        </small>
                      )}
                      {fieldErrors.name && (
                        <small className="text-danger text-xs">
                          {fieldErrors.name}
                        </small>
                      )}
                    </div>
                  </div>
                </div>
                <div className=" flex justify-end p-3">
                  {/* <button type="button" className="btn btn-secondary me-2" onClick={handleCloseModal}>Cancel</button> */}
                  <button
                    type="button"
                    className="btn btn-primary  px-3 mb-2"
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
              <div className="flex justify-between p-3">
                <h5 className="modal-title">Edit Section</h5>
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
                <div className=" relative mb-3 flex justify-center  mx-4">
                  <label htmlFor="editSectionName" className="w-1/2 mt-2">
                    Section Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={30}
                    className="form-control shadow-md mb-2"
                    id="editSectionName"
                    value={newSectionName}
                    onChange={handleChangeSectionName}
                    // onChange={(e) => setNewSectionName(e.target.value)}
                    // onBlur={handleBlur}
                  />
                  <div className="absolute top-9 left-1/3 ">
                    {!nameAvailable && (
                      <small className=" block text-danger text-xs">
                        {nameError}
                      </small>
                    )}
                    {fieldErrors.name && (
                      <small className="text-danger text-xs">
                        {fieldErrors.name}
                      </small>
                    )}
                  </div>
                </div>
              </div>
              <div className=" flex justify-end p-3">
                {/* <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button> */}
                <button
                  type="button"
                  className="btn btn-primary px-3 mb-2 "
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
                  Are you sure you want to delete section: {currentSection.name}
                  ?
                </p>
              </div>
              <div className=" flex justify-end p-3">
                {/* <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button> */}
                <button
                  type="button"
                  className="btn btn-danger px-3 mb-2"
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
    </>
  );
}

export default Sections;
