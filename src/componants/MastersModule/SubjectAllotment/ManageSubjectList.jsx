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
import { useState, useEffect } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import axios from "axios";

function ManageSubjectList() {
  const API_URL = import.meta.env.VITE_API_URL; // URL for host
  const [error, setError] = useState(null);
  const [classSection, setClassSection] = useState("");
  const [activeTab, setActiveTab] = useState("manage");
  const [classes, setClasses] = useState([]);

  useEffect(() => {
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

    fetchClassNames();
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleChangeClassSection = (e) => {
    setClassSection(e.target.value);
  };

  return (
    <div className="md:mx-auto md:w-3/4 p-4 bg-white shadow-lg">
      <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
        Subject Allotment
      </h3>
      <hr className="relative -top-3" />

      <ul className="grid grid-cols-2 gap-x-4 relative -left-6 md:left-0 md:flex md:flex-row relative -top-4">
        <li
          className={`md:-ml-7 shadow-md ${
            activeTab === "manage" ? "text-blue-500 font-bold" : ""
          }`}
        >
          <button
            onClick={() => handleTabChange("manage")}
            className="px-2 md:px-4 py-1 hover:bg-gray-200 text-[1em] md:text-sm text-nowrap"
          >
            Manage
          </button>
        </li>
        <li
          className={`shadow-md ${
            activeTab === "allotSubject" ? "text-blue-500 font-bold" : ""
          }`}
        >
          <button
            onClick={() => handleTabChange("allotSubject")}
            className="px-2 md:px-4 py-1 hover:bg-gray-200 text-[1em] md:text-sm text-nowrap"
          >
            Allot Subject
          </button>
        </li>
        <li
          className={`shadow-md ${
            activeTab === "allotTeachersForClass"
              ? "text-blue-500 font-bold"
              : ""
          }`}
        >
          <button
            onClick={() => handleTabChange("allotTeachersForClass")}
            className="px-2 md:px-4 py-1 hover:bg-gray-200 text-[1em] md:text-sm text-nowrap"
          >
            Allot Teachers for a Class
          </button>
        </li>
        <li
          className={`shadow-md ${
            activeTab === "allotTeachers" ? "text-blue-500 font-bold" : ""
          }`}
        >
          <button
            onClick={() => handleTabChange("allotTeachers")}
            className="px-2 md:px-4 py-1 hover:bg-gray-200 text-[1em] md:text-sm text-nowrap"
          >
            Allot Teachers
          </button>
        </li>
      </ul>

      <div className="bg-white shadow-md rounded-md -mt-5">
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
              <div className="flex">
                <div className="form-group">
                  <label htmlFor="classSection">
                    Select Class <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="classSection"
                    // className="form-control"
                    className="border rounded-md px-3 py-2 w-full mr-2"
                    value={classSection}
                    onChange={handleChangeClassSection}
                  >
                    <option value="">Select Class </option>
                    {classes.length === 0 ? (
                      <option value="">No classes available</option>
                    ) : (
                      classes.map((cls) => (
                        <option
                          key={cls.section_id}
                          value={`${cls.get_class.name} - ${cls.name}`}
                        >
                          {`${cls.get_class.name} - ${cls.name}`}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                {/* <input
                  type="text"
                  className="border rounded-md px-3 py-2 w-full mr-2"
                  placeholder="*Select Class"
                /> */}
                <button className="bg-blue-500  text-white px-4 rounded-md hover:bg-blue-600">
                  {/* <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"> */}
                  Search
                </button>
              </div>
            </div>
            <button className="bg-cyan-500 text-white px-4 py-2 rounded-md hover:bg-cyan-600 w-full">
              Select a Class to See Subjects
            </button>
          </div>
        )}
        {activeTab === "allotSubject" && (
          <div>
            <p>Allot Subject Tab Content</p>
          </div>
        )}
        {activeTab === "allotTeachersForClass" && (
          <div>
            <p>Allot Teachers for a Class Tab Content</p>
          </div>
        )}
        {activeTab === "allotTeachers" && (
          <div>
            <p>Allot Teachers Tab Content</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageSubjectList;
