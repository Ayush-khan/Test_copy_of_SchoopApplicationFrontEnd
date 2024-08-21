// import { useState, useEffect } from "react";
// import { IoSettingsSharp } from "react-icons/io5";
// import axios from "axios";

// function ManageSubjectList() {
//   const API_URL = import.meta.env.VITE_API_URL; // URL for host
//   const [error, setError] = useState(null);

//   const [activeTab, setActiveTab] = useState("manage");
//   const [classes, setClasses] = useState([]);

//   useEffect(() => {
//     const fetchClassNames = async () => {
//       try {
//         const token = localStorage.getItem("authToken");
//         const response = await axios.get(`${API_URL}/api/get_class_section`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
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

//   const handleTabChange = (tab) => {
//     setActiveTab(tab);
//   };

//   return (
//     <div className="container mx-auto p-4 bg-white">
//       <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
//         Subject Allotment
//       </h3>
//       <hr className="relative -top-3" />

//       <ul className="flex justify-start items-start align-middle relative -top-4 ">
//         <li
//           className={` -ml-7 shadow-md  ${
//             activeTab === "manage" ? "text-blue-500 font-bold" : ""
//           }`}
//         >
//           <button
//             onClick={() => handleTabChange("manage")}
//             className=" px-2 md:px-4 py-1  hover:bg-gray-200  text-[1.2em] lg:text-sm text-nowrap"
//           >
//             Manage
//           </button>
//         </li>
//         <li
//           className={` shadow-md ${
//             activeTab === "allotSubject" ? "text-blue-500 font-bold" : ""
//           }`}
//         >
//           <button
//             onClick={() => handleTabChange("allotSubject")}
//             // className="px-4 py-2 rounded-md hover:bg-gray-200 "
//             className=" px-2 md:px-4 py-1  hover:bg-gray-200  text-[1.2em] lg:text-sm text-nowrap"
//           >
//             Allot Subject
//           </button>
//         </li>
//         <li
//           className={`shadow-md  ${
//             activeTab === "allotTeachersForClass"
//               ? "text-blue-500 font-bold"
//               : ""
//           }`}
//         >
//           <button
//             onClick={() => handleTabChange("allotTeachersForClass")}
//             // className="px-4 py-2 rounded-md hover:bg-gray-200"
//             className="px-2 md:px-4 py-1  hover:bg-gray-200  text-[1.2em] lg:text-sm text-nowrap"
//           >
//             Allot Teachers for a Class
//           </button>
//         </li>
//         <li
//           className={`shadow-md  ${
//             activeTab === "allotTeachers" ? "text-blue-500 font-bold" : ""
//           }`}
//         >
//           <button
//             onClick={() => handleTabChange("allotTeachers")}
//             // className="px-4 py-2 rounded-md hover:bg-gray-200 "
//             className="px-2 md:px-4 py-1  hover:bg-gray-200  text-[1.2em] lg:text-sm text-nowrap"
//           >
//             Allot Teachers
//           </button>
//         </li>
//       </ul>

//       <div className="bg-white shadow-md rounded-md  -mt-5">
//         {activeTab === "manage" && (
//           <div>
//             {/* Manage Subjects Content */}
//             <div className="mb-4">
//               <h2
//                 className="text-gray-400 mt-1 text-[1.2em] lg:text-sm text-nowrap"
//                 style={{ color: "#D22B73" }}
//               >
//                 <IoSettingsSharp className=" inline mr-1 -mt-1" />
//                 Manage Subjects
//               </h2>
//               <div className="flex">
//                 <input
//                   type="text"
//                   className="border rounded-md px-3 py-2 w-full mr-2"
//                   placeholder="*Select Class"
//                 />
//                 <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
//                   Search
//                 </button>
//               </div>
//             </div>
//             <button className="bg-cyan-500 text-white px-4 py-2 rounded-md hover:bg-cyan-600 w-full">
//               Select a Class to See Subjects
//             </button>
//           </div>
//         )}
//         {activeTab === "allotSubject" && (
//           <div>
//             {/* Allot Subject Content */}
//             <p>Allot Subject Tab Content</p>
//           </div>
//         )}
//         {activeTab === "allotTeachersForClass" && (
//           <div>
//             {/* Allot Teachers for a Class Content */}
//             <p>Allot Teachers for a Class Tab Content</p>
//           </div>
//         )}
//         {activeTab === "allotTeachers" && (
//           <div>
//             {/* Allot Teachers Content */}
//             <p>Allot Teachers Tab Content</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default ManageSubjectList;

// import { useState, useEffect } from "react";
// import { IoSettingsSharp } from "react-icons/io5";
// import axios from "axios";
// // import { Label } from "recharts";

// function ManageSubjectList() {
//   const API_URL = import.meta.env.VITE_API_URL; // URL for host
//   const [error, setError] = useState(null);

//   const [className, setClassName] = useState("");
//   const [activeTab, setActiveTab] = useState("manage");
//   const [classes, setClasses] = useState([]);

//   useEffect(() => {
//     const fetchClassNames = async () => {
//       try {
//         const token = localStorage.getItem("authToken");
//         const response = await axios.get(`${API_URL}/api/get_class_section`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
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

//   const handleTabChange = (tab) => {
//     setActiveTab(tab);
//   };
//   const handleChangeDepartmentId = (e) => {
//     const { value } = e.target;
//     setClassName(value);
//     setNewDepartmentId(value);
//     setFieldErrors((prevErrors) => ({
//       ...prevErrors,
//       department_id: validateSectionName(newSectionName, e.target.value)
//         .department_id,
//     }));
//   };

//   return (
//     <div className="  md:mx-auto md:w-3/4  p-4 bg-white shadow-lg">
//       {/* <div className="card mx-auto lg:w-3/4 shadow-lg"> */}
//       <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
//         Subject Allotment
//       </h3>
//       <hr className="relative -top-3" />

//       <ul className="grid grid-cols-2 gap-x-4 relative -left-6 md:left-0 md:flex md:flex-row  relative -top-4 ">
//         <li
//           className={`  md:-ml-7 shadow-md  ${
//             activeTab === "manage" ? "text-blue-500 font-bold" : ""
//           }`}
//         >
//           <button
//             onClick={() => handleTabChange("manage")}
//             className=" px-2 md:px-4 py-1  hover:bg-gray-200  text-[1em] md:text-sm text-nowrap"
//           >
//             Manage
//           </button>
//         </li>
//         <li
//           className={` shadow-md ${
//             activeTab === "allotSubject" ? "text-blue-500 font-bold" : ""
//           }`}
//         >
//           <button
//             onClick={() => handleTabChange("allotSubject")}
//             // className="px-4 py-2 rounded-md hover:bg-gray-200 "
//             className=" px-2 md:px-4 py-1  hover:bg-gray-200  text-[1em] md:text-sm text-nowrap"
//           >
//             Allot Subject
//           </button>
//         </li>
//         <li
//           className={`shadow-md  ${
//             activeTab === "allotTeachersForClass"
//               ? "text-blue-500 font-bold"
//               : ""
//           }`}
//         >
//           <button
//             onClick={() => handleTabChange("allotTeachersForClass")}
//             // className="px-4 py-2 rounded-md hover:bg-gray-200"
//             className="px-2 md:px-4 py-1  hover:bg-gray-200  text-[1em] md:text-sm text-nowrap"
//           >
//             Allot Teachers for a Class
//           </button>
//         </li>
//         <li
//           className={`shadow-md  ${
//             activeTab === "allotTeachers" ? "text-blue-500 font-bold" : ""
//           }`}
//         >
//           <button
//             onClick={() => handleTabChange("allotTeachers")}
//             // className="px-4 py-2 rounded-md hover:bg-gray-200 "
//             className="px-2 md:px-4 py-1  hover:bg-gray-200  text-[1em] md:text-sm text-nowrap"
//           >
//             Allot Teachers
//           </button>
//         </li>
//       </ul>

//       <div className="bg-white shadow-md rounded-md  -mt-5">
//         {activeTab === "manage" && (
//           <div>
//             {/* Manage Subjects Content */}
//             <div className="mb-4">
//               <h2
//                 className="text-gray-400 mt-1 text-[1.2em] md:text-sm text-nowrap"
//                 style={{ color: "#D22B73" }}
//               >
//                 <IoSettingsSharp className=" inline mr-1 -mt-1" />
//                 Manage Subjects
//               </h2>
//               <div className="flex">
//                 {/* <Label> Select class</Label> */}
//                 <div className="form-group">
//                   <label htmlFor="departmentId">
//                     Class <span className="text-red-500">*</span>
//                   </label>
//                   <select
//                     id="departmentId"
//                     className="form-control"
//                     value={newDepartmentId}
//                     onChange={handleChangeDepartmentId}
//                   >
//                     <option value="">Select Class</option>
//                     {/* {classes.map((cls, index) => (
//                           <option key={index} value={cls}>
//                             {cls}
//                           </option>
//                         ))} */}
//                     {classes.length === 0 ? (
//                       <option value="">No classes available</option>
//                     ) : (
//                       classes.map((cls) => (
//                         <option key={cls.class_id} value={cls.class_id}>
//                           {cls.name}
//                         </option>
//                       ))
//                     )}
//                   </select>
//                   {fieldErrors.department_id && (
//                     <span className="text-danger text-xs">
//                       {fieldErrors.department_id}
//                     </span>
//                   )}
//                 </div>
//                 <input
//                   type="text"
//                   className="border rounded-md px-3 py-2 w-full mr-2"
//                   placeholder="*Select Class"
//                 />
//                 <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
//                   Search
//                 </button>
//               </div>
//             </div>
//             <button className="bg-cyan-500 text-white px-4 py-2 rounded-md hover:bg-cyan-600 w-full">
//               Select a Class to See Subjects
//             </button>
//           </div>
//         )}
//         {activeTab === "allotSubject" && (
//           <div>
//             {/* Allot Subject Content */}
//             <p>Allot Subject Tab Content</p>
//           </div>
//         )}
//         {activeTab === "allotTeachersForClass" && (
//           <div>
//             {/* Allot Teachers for a Class Content */}
//             <p>Allot Teachers for a Class Tab Content</p>
//           </div>
//         )}
//         {activeTab === "allotTeachers" && (
//           <div>
//             {/* Allot Teachers Content */}
//             <p>Allot Teachers Tab Content</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default ManageSubjectList;

// working model
// import { useState, useEffect } from "react";
// import { IoSettingsSharp } from "react-icons/io5";
// import axios from "axios";
// import { ToastContainer, toast } from "react-toastify";
// import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import ReactPaginate from "react-paginate";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "react-toastify/dist/ReactToastify.css";

// function ManageSubjectList() {
//   const API_URL = import.meta.env.VITE_API_URL; // URL for host
//   const [error, setError] = useState(null);
//   const [classSection, setClassSection] = useState("");
//   const [activeTab, setActiveTab] = useState("manage");
//   const [classes, setClasses] = useState([]);
//   const [subjects, setSubjects] = useState([]);

//   useEffect(() => {
//     const fetchClassNames = async () => {
//       try {
//         const token = localStorage.getItem("authToken");
//         const response = await axios.get(`${API_URL}/api/get_class_section`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         if (Array.isArray(response.data)) {
//           setClasses(response.data);
//         } else {
//           setError("Unexpected data format");
//         }
//       } catch (error) {
//         console.error("Error fetching class names:", error);
//         setError("Error fetching class names");
//       }
//     };

//     fetchClassNames();
//   }, []);

//   const handleSearch = async () => {
//     try {
//       console.log("the classid", classSection);
//       const token = localStorage.getItem("authToken");
//       const response = await axios.get(`${API_URL}/api/get_subject_Alloted`, {
//         headers: { Authorization: `Bearer ${token}` },
//         params: { section_id: 400 },
//         // params: { section_id: classSection },
//       });
//       if (response.data.length > 0) {
//         setSubjects(response.data);
//       } else {
//         setSubjects([]); // Clear the subjects if no data is returned
//         setError("No subjects found for the selected class and division.");
//       }
//     } catch (error) {
//       console.error("Error fetching subjects:", error);
//       setError("Error fetching subjects");
//     }
//   };

//   const handleTabChange = (tab) => {
//     setActiveTab(tab);
//   };

//   const handleChangeClassSection = (e) => {
//     setClassSection(e.target.value);
//   };

//   return (
//     <>
//       <ToastContainer />
//       <div className="md:mx-auto md:w-3/4 p-4 bg-white shadow-lg">
//         <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
//           Subject Allotment
//         </h3>
//         <hr className="relative -top-3" />

//         <ul className="grid grid-cols-2 gap-x-10 relative -left-6 md:left-0 md:flex md:flex-row relative -top-4">
//           <li
//             className={`md:-ml-7 shadow-md ${
//               activeTab === "manage" ? "text-blue-500 font-bold" : ""
//             }`}
//           >
//             <button
//               onClick={() => handleTabChange("manage")}
//               className="px-2 md:px-4 py-1 hover:bg-gray-200 text-[1em] md:text-sm text-nowrap"
//             >
//               Manage
//             </button>
//           </li>
//           <li
//             className={`shadow-md ${
//               activeTab === "allotSubject" ? "text-blue-500 font-bold" : ""
//             }`}
//           >
//             <button
//               onClick={() => handleTabChange("allotSubject")}
//               className="px-2 md:px-4 py-1 hover:bg-gray-200 text-[1em] md:text-sm text-nowrap"
//             >
//               Allot Subject
//             </button>
//           </li>
//           <li
//             className={`shadow-md ${
//               activeTab === "allotTeachersForClass"
//                 ? "text-blue-500 font-bold"
//                 : ""
//             }`}
//           >
//             <button
//               onClick={() => handleTabChange("allotTeachersForClass")}
//               className="px-2 md:px-4 py-1 hover:bg-gray-200 text-[1em] md:text-sm text-nowrap"
//             >
//               Allot Teachers for a Class
//             </button>
//           </li>
//           <li
//             className={`shadow-md ${
//               activeTab === "allotTeachers" ? "text-blue-500 font-bold" : ""
//             }`}
//           >
//             <button
//               onClick={() => handleTabChange("allotTeachers")}
//               className="px-2 md:px-4 py-1 hover:bg-gray-200 text-[1em] md:text-sm text-nowrap"
//             >
//               Allot Teachers
//             </button>
//           </li>
//         </ul>

//         <div className="bg-white shadow-md rounded-md -mt-5">
//           {activeTab === "manage" && (
//             <div>
//               <div className="mb-4">
//                 <h2
//                   className="text-gray-400 mt-1 text-[1.2em] md:text-sm text-nowrap"
//                   style={{ color: "#D22B73" }}
//                 >
//                   <IoSettingsSharp className="inline mr-1 -mt-1" />
//                   Manage Subjects
//                 </h2>
//                 <div className="md:w-[80%] mx-auto">
//                   <div className="form-group flex  justify-center gap-x-1 md:gap-x-6">
//                     {" "}
//                     <label
//                       htmlFor="classSection"
//                       className="w-1/4 pt-2  items-center text-center "
//                     >
//                       Select Class <span className="text-red-500">*</span>
//                     </label>
//                     <select
//                       id="classSection"
//                       // className="form-control"
//                       className="border  w-[50%] h-10 md:h-auto rounded-md px-3 py-2 md:w-full mr-2 "
//                       value={classSection}
//                       onChange={handleChangeClassSection}
//                     >
//                       <option
//                         className=""
//                         value=""
//                         style={{
//                           overflowY: "auto", // Enables scrolling if content exceeds maxHeight
//                           maxHeight: "100px", // Set the maximum height for the dropdown
//                         }}
//                       >
//                         Select Class
//                       </option>
//                       {classes.length === 0 ? (
//                         <option value="">No classes available</option>
//                       ) : (
//                         classes.map((cls) => (
//                           <option key={cls.section_id} value={cls.section_id}>
//                             {`${cls.get_class.name}  ${cls.name}`}
//                           </option>
//                         ))
//                       )}
//                     </select>
//                     <button
//                       onClick={handleSearch}
//                       type="button"
//                       className="btn  h-10 md:h-auto w-18 md:w-auto btn-primary"
//                       // className="bg-blue-500  text-white px-4 rounded-md hover:bg-blue-600"
//                     >
//                       {/* <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"> */}
//                       Search
//                     </button>
//                   </div>
//                   {/* <input
//                   type="text"
//                   className="border rounded-md px-3 py-2 w-full mr-2"
//                   placeholder="*Select Class"
//                 /> */}
//                 </div>
//               </div>
//               <div>
//                 {subjects.length > 0 ?

//                 (
//                   <table className="min-w-full leading-normal table-auto">
//                     <thead>
//                       <tr>
//                         <th className="py-2">Class</th>
//                         <th className="py-2">Division</th>
//                         <th className="py-2">Subject</th>
//                         <th className="py-2">Teacher</th>
//                         <th className="py-2">Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {subjects.map((subject) => (
//                         <tr key={subject.subject_id}>
//                           <td className="border px-4 py-2">
//                             {subject.class_id}
//                           </td>
//                           <td className="border px-4 py-2">
//                             {subject.section_id}
//                           </td>
//                           <td className="border px-4 py-2">
//                             {subject.get_subject
//                               ? subject.get_subject.name
//                               : "N/A"}
//                           </td>
//                           <td className="border px-4 py-2">
//                             {subject.teacher_id ? subject.teacher_id : "N/A"}
//                           </td>
//                           <td className="border px-4 py-2">
//                             <button className="text-blue-500 hover:underline">
//                               Edit
//                             </button>
//                             <button className="text-red-500 hover:underline ml-2">
//                               Delete
//                             </button>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 ) : (
//                   <p>No subjects found for the selected class and division.</p>
//                 )}
//               </div>

//               {error && <p className="text-red-500">{error}</p>}

//               <button className="bg-cyan-500 text-white px-4 py-2 rounded-md hover:bg-cyan-600 w-full">
//                 Select a Class to See Subjects
//               </button>
//             </div>
//           )}
//           {activeTab === "allotSubject" && (
//             <div>
//               <p>Allot Subject Tab Content</p>
//             </div>
//           )}
//           {activeTab === "allotTeachersForClass" && (
//             <div>
//               <p>Allot Teachers for a Class Tab Content</p>
//             </div>
//           )}
//           {activeTab === "allotTeachers" && (
//             <div>
//               <p>Allot Teachers Tab Content</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// }

// export default ManageSubjectList;

import { useState, useEffect } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";

function ManageSubjectList() {
  const API_URL = import.meta.env.VITE_API_URL; // URL for host
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [classSection, setClassSection] = useState("");
  const [activeTab, setActiveTab] = useState("manage");
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
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
  const pageSize = 10;

  const fetchClassNames = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${API_URL}/api/get_class_section`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(response.data)) {
        setClasses(response.data);
      } else {
        setError("Unexpected data format");
      }
    } catch (error) {
      console.error("Error fetching class names:", error);
      setError("Error fetching class names");
    }
  };
  useEffect(() => {
    fetchClassNames();
  }, []);

  const handleSearch = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${API_URL}/api/get_subject_Alloted`, {
        headers: { Authorization: `Bearer ${token}` },
        // params: { section_id: classSection },
        params: { section_id: 400 },
      });
      if (response.data.length > 0) {
        setSubjects(response.data);
        setPageCount(Math.ceil(response.data.length / 10)); // Example pagination logic
      } else {
        setSubjects([]);
        setError("No subjects found for the selected class and division.");
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setError("Error fetching subjects");
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleChangeClassSection = (e) => {
    setClassSection(e.target.value);
  };

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
    // Handle page change logic
  };

  const handleEdit = (section) => {
    setCurrentSection(section);
    setShowEditModal(true);
  };

  const handleDelete = (sectionId) => {
    console.log("inside delete of subjectallotmenbt", sectionId);
    const classToDelete = classes.find((cls) => cls.class_id === sectionId);
    // setCurrentClass(classToDelete);
    setCurrentSection({ classToDelete });
    setShowDeleteModal(true);
  };

  const handleSubmitEdit = () => {
    // Handle edit submission logic
    setShowEditModal(false);
  };

  const handleSubmitDelete = async () => {
    // Handle delete submission logic
    try {
      const token = localStorage.getItem("authToken");

      if (!token || !classes || !classes.class_id) {
        throw new Error("Class ID is missing");
      }

      await axios.delete(
        `${API_URL}/api/delete_subject_Alloted/${classes.class_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      fetchClassNames();
      setShowDeleteModal(false);
      setClasses(null);
      toast.success("subject deleted successfully!");
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(`Error deleting subject: ${error.response.data.message}`);
      } else {
        toast.error(`Error deleting subject: ${error.message}`);
      }
      console.error("Error deleting subject:", error);
      // setError(error.message);
    }
    setShowDeleteModal(false);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setShowDeleteModal(false);
  };
  console.log("the name", subjects);
  const filteredSections = subjects.filter((section) =>
    section?.get_subject?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const displayedSections = filteredSections.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );
  return (
    <>
      <ToastContainer />
      <div className="md:mx-auto md:w-3/4 p-4 bg-white ">
        <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
          Subject Allotment
        </h3>
        <hr className="relative -top-3" />

        <ul className="grid grid-cols-2 gap-x-10 relative -left-6 md:left-0 md:flex md:flex-row relative -top-4">
          {/* Tab Navigation */}
          {[
            "manage",
            "allotSubject",
            "allotTeachersForClass",
            "allotTeachers",
          ].map((tab) => (
            <li
              key={tab}
              className={`md:-ml-7 shadow-md ${
                activeTab === tab ? "text-blue-500 font-bold" : ""
              }`}
            >
              <button
                onClick={() => handleTabChange(tab)}
                className="px-2 md:px-4 py-1 hover:bg-gray-200 text-[1em] md:text-sm text-nowrap"
              >
                {tab.replace(/([A-Z])/g, " $1").toUpperCase()}
              </button>
            </li>
          ))}
        </ul>

        <div className="bg-white  rounded-md -mt-5">
          {activeTab === "manage" && (
            <div>
              <div className="mb-4">
                <h2
                  className="text-gray-400 mt-1 text-[1.2em] md:text-sm text-nowrap"
                  style={{ color: "#D22B73" }}
                >
                  <IoSettingsSharp className="inline mr-1 -mt-1" />
                  Manage Subjects
                </h2>
                <div className="md:w-[80%] mx-auto">
                  <div className="form-group flex justify-center gap-x-1 md:gap-x-6">
                    <label
                      htmlFor="classSection"
                      className="w-1/4 pt-2 items-center text-center"
                    >
                      Select Class <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="classSection"
                      className="border w-[50%] h-10 md:h-auto rounded-md px-3 py-2 md:w-full mr-2"
                      value={classSection}
                      onChange={handleChangeClassSection}
                    >
                      <option value="">Select Class</option>
                      {classes.length === 0 ? (
                        <option value="">No classes available</option>
                      ) : (
                        classes.map((cls) => (
                          <option key={cls.section_id} value={cls.section_id}>
                            {`${cls.get_class.name} ${cls.name}`}
                          </option>
                        ))
                      )}
                    </select>
                    <button
                      onClick={handleSearch}
                      type="button"
                      className="btn h-10 md:h-auto w-18 md:w-auto btn-primary"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </div>

              {subjects.length > 0 ? (
                <div className="container mt-4">
                  <div className="card mx-auto lg:w-full shadow-lg">
                    <div className="card-header flex justify-between items-center">
                      <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
                        Manage Subjects List
                      </h3>
                      <div className="w-1/2  md:w-fit mr-1 ">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search "
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="card-body  w-full">
                      <div className="h-96 lg:h-96 overflow-y-scroll lg:overflow-x-hidden">
                        <table className="min-w-full leading-normal table-auto">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                S.No
                              </th>
                              <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                Class
                              </th>
                              <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                Division
                              </th>
                              <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                Subject
                              </th>
                              <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                Teacher
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
                            {displayedSections.map((subject, index) => (
                              <tr
                                key={subject.section_id}
                                className="text-gray-700 text-sm font-light"
                              >
                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {index + 1}
                                </td>
                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {subject?.get_class?.name}
                                </td>
                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {subject?.get_division?.name}
                                </td>
                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {subject?.get_subject
                                    ? subject?.get_subject?.name
                                    : "N/A"}
                                </td>
                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {subject?.get_teacher
                                    ? subject?.get_teacher?.name
                                    : "N/A"}
                                </td>

                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  <button
                                    onClick={() => handleEdit(subject)}
                                    className="text-blue-600 hover:text-blue-800 hover:bg-transparent "
                                  >
                                    <FontAwesomeIcon icon={faEdit} />
                                  </button>
                                </td>
                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  <button
                                    onClick={() =>
                                      handleDelete(subject.section_id)
                                    }
                                    className="text-red-600 hover:text-red-800 hover:bg-transparent "
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className=" flex justify-center  pt-2 -mb-3">
                        <ReactPaginate
                          previousLabel={"Previous"}
                          nextLabel={"Next"}
                          breakLabel={"..."}
                          pageCount={pageCount}
                          onPageChange={handlePageClick}
                          containerClassName={"pagination"}
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
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // <div className="p-4">No subjects found</div>
                <button className="bg-cyan-500 text-white px-4 py-2 rounded-md hover:bg-cyan-600 w-full">
                  Select a Class to See Subjects
                </button>
              )}
            </div>
          )}

          {/* Other tabs content */}
          {activeTab === "allotSubject" && <div>Allot Subject Tab Content</div>}
          {activeTab === "allotTeachersForClass" && (
            <div>Allot Teachers For Class Tab Content</div>
          )}
          {activeTab === "allotTeachers" && (
            <div>Allot Teachers Tab Content</div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal fade show" style={{ display: "block" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Subject</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                {/* Modal content for editing */}
                <form>
                  <div className="mb-3">
                    <label htmlFor="newSectionName" className="form-label">
                      Section Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="newSectionName"
                      value={newSectionName}
                      onChange={(e) => setNewSectionName(e.target.value)}
                    />
                  </div>
                </form>
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
        <div className="modal fade show" style={{ display: "block" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                Are you sure you want to delete this subject?
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                >
                  Cancel
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
    </>
  );
}

export default ManageSubjectList;
