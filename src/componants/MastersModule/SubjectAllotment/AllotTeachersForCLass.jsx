// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";

// const AllotTeachersForCLass = () => {
//   const API_URL = import.meta.env.VITE_API_URL; // URL for host
//   const [classes, setClasses] = useState([]);
//   const [classSection, setClassSection] = useState("");
//   const [subjects, setSubjects] = useState([]);
//   const [error, setError] = useState(null);
//   const [departments, setDepartments] = useState([]);
//   const [isDropdownOpen, setIsDropdownOpen] = useState([]);
//   const dropdownRefs = useRef([]);

//   // Fetch teacher list for dropdown
//   const fetchDepartments = async () => {
//     try {
//       const token = localStorage.getItem("authToken");

//       if (!token) {
//         throw new Error("No authentication token found");
//       }

//       const response = await axios.get(`${API_URL}/api/get_teacher_list`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         withCredentials: true,
//       });

//       setDepartments(response.data);
//       console.log("Fetched teacher list:", response.data);
//     } catch (error) {
//       setError(error.message);
//     }
//   };

//   const fetchClassNames = async () => {
//     try {
//       const token = localStorage.getItem("authToken");
//       const response = await axios.get(`${API_URL}/api/get_class_section`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (Array.isArray(response.data)) {
//         setClasses(response.data);
//         console.log("Class and section data:", response.data);
//       } else {
//         setError("Unexpected data format");
//       }
//     } catch (error) {
//       console.error("Error fetching class and section names:", error);
//       setError("Error fetching class and section names");
//     }
//   };

//   useEffect(() => {
//     fetchClassNames();
//     fetchDepartments();
//   }, []);

//   const handleInputChange = (e, subjectIndex) => {
//     const newSubjects = [...subjects];
//     newSubjects[subjectIndex].newDepartmentId = e.target.value;
//     setSubjects(newSubjects);

//     const newDropdownOpen = isDropdownOpen.map((item, index) =>
//       index === subjectIndex ? true : item
//     );
//     setIsDropdownOpen(newDropdownOpen);
//   };

//   const handleOptionSelect = (regId, subjectIndex) => {
//     const selectedDept = departments.find((dept) => dept.reg_id === regId);
//     if (selectedDept) {
//       const newSubjects = [...subjects];
//       newSubjects[subjectIndex].newDepartmentId = selectedDept.name;
//       newSubjects[subjectIndex].teacher_id = regId;
//       setSubjects(newSubjects);
//     }

//     const newDropdownOpen = isDropdownOpen.map((item, index) =>
//       index === subjectIndex ? false : item
//     );
//     setIsDropdownOpen(newDropdownOpen);
//   };

//   const handleClickOutside = (event) => {
//     dropdownRefs.current.forEach((ref, index) => {
//       if (ref && !ref.contains(event.target)) {
//         const newDropdownOpen = isDropdownOpen.map((item, idx) =>
//           idx === index ? false : item
//         );
//         setIsDropdownOpen(newDropdownOpen);
//       }
//     });
//   };

//   useEffect(() => {
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [isDropdownOpen]);

//   const filteredDepartments = (subjectIndex) => {
//     return departments.filter((department) =>
//       department.name
//         .toLowerCase()
//         .includes(subjects[subjectIndex]?.newDepartmentId?.toLowerCase() || "")
//     );
//   };

//   const handleChangeClassSection = (e) => {
//     setClassSection(e.target.value);
//   };

//   const handleSearchForAllotTea = async () => {
//     try {
//       const token = localStorage.getItem("authToken");
//       const response = await axios.get(
//         `${API_URL}/api/subject-allotment/section/${classSection}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       if (response.data.status === "success" && response.data.data) {
//         setSubjects(Object.values(response.data.data));
//         setIsDropdownOpen(
//           Array(Object.values(response.data.data).length).fill(false)
//         );
//       } else {
//         setError("Unexpected data format");
//       }
//       console.log("Subjects data:", response.data.data);
//     } catch (error) {
//       console.error("Error fetching subjects:", error);
//       setError("Error fetching subjects");
//     }
//   };

//   return (
//     <div>
//       <div className="mb-4">
//         <div className="md:w-[80%] mx-auto">
//           <div className="form-group flex justify-center gap-x-1 md:gap-x-6">
//             <label
//               htmlFor="classSection"
//               className="w-1/4 pt-2 items-center text-center"
//             >
//               Select Class <span className="text-red-500">*</span>
//             </label>
//             <select
//               id="classSection"
//               className="border w-[50%] h-10 md:h-auto rounded-md px-3 py-2 md:w-full mr-2"
//               value={classSection}
//               onChange={handleChangeClassSection}
//             >
//               <option value="">Select </option>
//               {classes.map((cls) => (
//                 <option key={cls.section_id} value={cls.section_id}>
//                   {`${cls?.get_class?.name} ${cls?.name}`}
//                 </option>
//               ))}
//             </select>
//             <button
//               onClick={handleSearchForAllotTea}
//               type="button"
//               className="btn h-10 md:h-auto w-18 md:w-auto btn-primary"
//             >
//               Browse
//             </button>
//           </div>
//         </div>
//       </div>

//       {subjects.length > 0 && (
//         <div className="container mt-4">
//           <div className="card mx-auto lg:w-full shadow-lg">
//             <div className="card-header flex justify-between items-center">
//               <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
//                 Manage Subjects List
//               </h3>
//             </div>

//             <div className="card-body w-full">
//               <div className="h-96 lg:h-96 overflow-y-scroll lg:overflow-x-hidden">
//                 {subjects.map((subject, index) => (
//                   <div
//                     key={index}
//                     className="p-2 border-b border-gray-200 flex justify-between items-center"
//                     ref={(el) => (dropdownRefs.current[index] = el)}
//                   >
//                     <div>{subject.subject_name}</div>
//                     <div className="relative w-1/2">
//                       <input
//                         type="text"
//                         value={subject.newDepartmentId || ""}
//                         onChange={(e) => handleInputChange(e, index)}
//                         onFocus={() => {
//                           const newDropdownOpen = isDropdownOpen.map(
//                             (item, idx) => (idx === index ? true : item)
//                           );
//                           setIsDropdownOpen(newDropdownOpen);
//                         }}
//                         className="form-control shadow-md"
//                       />
//                       {isDropdownOpen[index] && (
//                         <div className="absolute top-10 left-0 w-full border rounded-md mt-1 bg-white z-10 max-h-48 overflow-auto">
//                           {filteredDepartments(index).length === 0 ? (
//                             <div className="p-2 text-gray-500">
//                               No teachers found
//                             </div>
//                           ) : (
//                             filteredDepartments(index).map((department) => (
//                               <div
//                                 key={department.reg_id}
//                                 className="p-2 cursor-pointer hover:bg-blue-600 hover:text-white"
//                                 onClick={() =>
//                                   handleOptionSelect(department.reg_id, index)
//                                 }
//                               >
//                                 {department.name}
//                               </div>
//                             ))
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AllotTeachersForCLass;
// for multiseleted drop down
// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import Select from "react-select";
// import makeAnimated from "react-select/animated";

// const animatedComponents = makeAnimated();

// const AllotTeachersForClass = () => {
//   const API_URL = import.meta.env.VITE_API_URL; // URL for host
//   const [classes, setClasses] = useState([]);
//   const [classSection, setClassSection] = useState("");
//   const [subjects, setSubjects] = useState([]);
//   const [error, setError] = useState(null);
//   const [departments, setDepartments] = useState([]);

//   useEffect(() => {
//     fetchClassNames();
//     fetchDepartments();
//   }, []);

//   // Fetch teacher list for dropdown
//   const fetchDepartments = async () => {
//     try {
//       const token = localStorage.getItem("authToken");

//       if (!token) {
//         throw new Error("No authentication token found");
//       }

//       const response = await axios.get(`${API_URL}/api/get_teacher_list`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         withCredentials: true,
//       });

//       const teacherOptions = response.data.map((teacher) => ({
//         value: teacher.reg_id,
//         label: teacher.name,
//       }));

//       setDepartments(teacherOptions);
//       console.log("Fetched teacher list:", response.data);
//     } catch (error) {
//       setError(error.message);
//     }
//   };

//   const fetchClassNames = async () => {
//     try {
//       const token = localStorage.getItem("authToken");
//       const response = await axios.get(`${API_URL}/api/get_class_section`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (Array.isArray(response.data)) {
//         setClasses(response.data);
//         console.log("Class and section data:", response.data);
//       } else {
//         setError("Unexpected data format");
//       }
//     } catch (error) {
//       console.error("Error fetching class and section names:", error);
//       setError("Error fetching class and section names");
//     }
//   };

//   const handleClassSectionChange = (e) => {
//     setClassSection(e.target.value);
//   };

//   const handleSearchForAllotTea = async () => {
//     try {
//       const token = localStorage.getItem("authToken");
//       const response = await axios.get(
//         `${API_URL}/api/subject-allotment/section/${classSection}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       if (response.data.status === "success" && response.data.data) {
//         const subjectData = Object.values(response.data.data).map(
//           (subject) => ({
//             ...subject,
//             selectedTeachers: [],
//           })
//         );
//         setSubjects(subjectData);
//       } else {
//         setError("Unexpected data format");
//       }
//       console.log("Subjects data:", response.data.data);
//     } catch (error) {
//       console.error("Error fetching subjects:", error);
//       setError("Error fetching subjects");
//     }
//   };

//   const handleTeacherSelect = (selectedOptions, subjectIndex) => {
//     const newSubjects = [...subjects];
//     newSubjects[subjectIndex].selectedTeachers = selectedOptions;
//     setSubjects(newSubjects);
//   };

//   return (
//     <div>
//       <div className="mb-4 ">
//         <div className="md:w-[80%] mx-auto">
//           <div className="form-group flex justify-center gap-x-1 md:gap-x-6">
//             <label
//               htmlFor="classSection"
//               className="w-1/4 pt-2 items-center text-center"
//             >
//               Select Class <span className="text-red-500">*</span>
//             </label>
//             <select
//               id="classSection"
//               className="border w-[50%] h-10 md:h-auto rounded-md px-3 py-2 md:w-full mr-2"
//               value={classSection}
//               onChange={handleClassSectionChange}
//             >
//               <option value="">Select </option>
//               {classes.map((cls) => (
//                 <option key={cls.section_id} value={cls.section_id}>
//                   {`${cls?.get_class?.name} ${cls?.name}`}
//                 </option>
//               ))}
//             </select>
//             <button
//               onClick={handleSearchForAllotTea}
//               type="button"
//               className="btn h-10 md:h-auto w-18 md:w-auto btn-primary"
//             >
//               Browse
//             </button>
//           </div>
//         </div>
//       </div>

//       {subjects.length > 0 && (
//         <div className="container mt-4">
//           <div className="card mx-auto lg:w-full shadow-lg">
//             <div className="card-header flex justify-between items-center">
//               <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
//                 Manage Subjects List
//               </h3>
//             </div>

//             <div className="card-body w-full md:w-[85%] mx-auto ">
//               <div className="h-96 lg:h-96 overflow-y-scroll lg:overflow-x-hidden">
//                 {subjects.map((subject, index) => (
//                   <div
//                     key={index}
//                     className=" border-b border-gray-200 grid grid-cols-3 mx-10 -gap-x-8"
//                   >
//                     <div className="relative mt-3 font-semibold text-gray-600 ">
//                       {" "}
//                       {subject.subject_name}
//                     </div>
//                     <div className="relative mt-2 col-span-2 text-[.9em]">
//                       <Select
//                         closeMenuOnSelect={false}
//                         components={animatedComponents}
//                         isMulti
//                         options={departments}
//                         value={subject.selectedTeachers}
//                         onChange={(selectedOptions) =>
//                           handleTeacherSelect(selectedOptions, index)
//                         }
//                         // className="mt-2"
//                       />
//                     </div>
//                   </div>
//                 ))}
//                 <div className=" flex justify-end p-3 mr-5">
//                   <button
//                     onClick={handleSubmitForAllotTeacherTab}
//                     type="button"
//                     className="btn h-10 md:h-auto w-18 md:w-auto btn-primary"
//                   >
//                     Save
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AllotTeachersForClass;

import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import makeAnimated from "react-select/animated";

const animatedComponents = makeAnimated();

const AllotTeachersForClass = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [classes, setClasses] = useState([]);
  const [classSection, setClassSection] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [classId, setClassId] = useState("");

  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState(null);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchClassNames();
    fetchDepartments();
  }, []);

  // Fetch teacher list for dropdown
  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(`${API_URL}/api/get_teacher_list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      const teacherOptions = response.data.map((teacher) => ({
        value: teacher.reg_id,
        label: teacher.name,
      }));

      setDepartments(teacherOptions);
      console.log("Fetched teacher list:", response.data);
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchClassNames = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${API_URL}/api/get_class_section`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(response.data)) {
        setClasses(response.data);
        console.log("Class and section data:", response.data);
      } else {
        setError("Unexpected data format");
      }
    } catch (error) {
      console.error("Error fetching class and section names:", error);
      setError("Error fetching class and section names");
    }
  };

  const handleClassSectionChange = (e) => {
    const [classSection, sectionId] = e.target.value.split(" "); // Split the value by space
    setClassSection(e.target.value);
    setClassId(classSection); // Store the first value in setClassSection

    setSectionId(sectionId); // Store the second value in setSectionId
    console.log("The class_id", classId);
    console.log("The sectionId ", sectionId);

    // console.log("The sectionId and class_id", e.target.value);
  };
  // heavy code take time more
  const handleSearchForAllotTea = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/api/subject-allotment/section/${classId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.status === "success" && response.data.data) {
        const subjectData = Object.entries(response.data.data).map(
          ([sm_id, subject]) => ({
            sm_id, // Store the sm_id for PUT request later
            subject_name: subject.subject_name,
            selectedTeachers: subject.details
              .filter((detail) => detail.teacher_id) // Only include non-null teacher IDs
              .map((detail) => ({
                value: detail.teacher_id,
                label: detail.teacher?.name,
              })),
            details: subject.details.map((detail) => ({
              subject_id: detail.subject_id,
              teacher_id: detail.teacher_id || null, // Store the teacher_id or null if not selected
            })), // Store original details for later reference
          })
        );
        setSubjects(subjectData);
      } else {
        setError("Unexpected data format");
      }
      console.log("Subjects data from GET API by classId:", subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setError("Error fetching subjects");
    }
  };

  //  Light code
  //   const handleSearchForAllotTea = async () => {
  //     try {
  //       const token = localStorage.getItem("authToken");
  //       const response = await axios.get(
  //         `${API_URL}/api/subject-allotment/section/${classId}`,
  //         {
  //           headers: { Authorization: `Bearer ${token}` },
  //         }
  //       );

  //       if (response.data.status === "success" && response.data.data) {
  //         const subjectData = Object.entries(response.data.data).map(
  //           ([sm_id, subject]) => ({
  //             sm_id, // Store the sm_id for PUT request later
  //             subject_name: subject.subject_name,
  //             selectedTeachers: subject.details
  //               .filter((detail) => detail.teacher_id) // Only include non-null teacher IDs
  //               .map((detail) => ({
  //                 value: detail.teacher_id,
  //                 label: detail.teacher?.name,
  //               })),
  //             details: subject.details.map((detail) => ({
  //               subject_id: detail.subject_id,
  //               teacher_id: detail.teacher_id || null, // Store the teacher_id or null if not selected
  //             })), // Store original details for later reference
  //           })
  //         );
  //         setSubjects(subjectData);
  //       } else {
  //         setError("Unexpected data format");
  //       }
  //       console.log("Subjects data from GET API by classId:", subjects);
  //     } catch (error) {
  //       console.error("Error fetching subjects:", error);
  //       setError("Error fetching subjects");
  //     }
  //   };

  const handleTeacherSelect = (selectedOptions, subjectIndex) => {
    const newSubjects = [...subjects];
    newSubjects[subjectIndex].selectedTeachers = selectedOptions;

    // Update the details array with the selected teachers
    newSubjects[subjectIndex].details = selectedOptions.map((option) => ({
      subject_id: newSubjects[subjectIndex].details[0].subject_id, // Assuming the same subject_id for all selected teachers
      teacher_id: option.value || null, // Assign teacher_id or null if unselected
    }));

    setSubjects(newSubjects);
  };
  console.log("The setSubject if teacher id is unselected", subjects);
  // heavy code here
  const handleSubmitForAllotTeacherTab = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const formattedData = {
        subjects: subjects.reduce((acc, subject) => {
          const existingTeacherIds = new Set(
            subject.details.map((detail) => detail.teacher_id)
          );

          // Combine existing teachers and selected teachers, handling additions and removals
          const updatedDetails = subject.selectedTeachers.map(
            (selectedTeacher) => {
              return {
                subject_id: subject.sm_id,
                teacher_id: selectedTeacher.value,
              };
            }
          );

          // Handle removals: if a teacher is no longer selected, set their teacher_id to null
          //   subject.details.forEach((detail) => {
          //     if (
          //       detail.teacher_id &&
          //       !subject.selectedTeachers.some(
          //         (t) => t.value === detail.teacher_id
          //       )
          //     ) {
          //       updatedDetails.push({
          //         subject_id: detail.subject_id,
          //         teacher_id: null,
          //       });
          //     }
          //   });

          acc[subject.sm_id] = {
            details: updatedDetails,
          };

          return acc;
        }, {}),
      };

      console.log("Final subject data for PUT request:", subjects);
      console.log("Formatted data for PUT request:", formattedData);

      const response = await axios.put(
        `${API_URL}/api/subject-allotments/${sectionId}/${classId}`, // Replace with actual classId and sectionId
        formattedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Update response:", response.data);
      alert("Teacher allotment updated successfully!");
    } catch (error) {
      console.error("Error updating teacher allotment:", error);
      setError("Error updating teacher allotment");
    }
  };
  // light code is here
  //   const handleSubmitForAllotTeacherTab = async () => {
  //     try {
  //       const token = localStorage.getItem("authToken");

  //       const formattedData = {
  //         subjects: subjects.reduce((acc, subject) => {
  //           acc[subject.sm_id] = {
  //             details: subject.details.map((detail) => ({
  //               subject_id: detail.subject_id || null,
  //               teacher_id: detail.teacher_id || null,
  //             })),
  //           };
  //           return acc;
  //         }, {}),
  //       };

  //       console.log("Final subject data for PUT request:", subjects);
  //       console.log("Formatted data for PUT request:", formattedData);

  //       const response = await axios.put(
  //         `${API_URL}/api/subject-allotments/${sectionId}/${classId}`, // Replace with actual classId and sectionId
  //         formattedData,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         }
  //       );

  //       console.log("Update response:", response.data);
  //       alert("Teacher allotment updated successfully!");
  //     } catch (error) {
  //       console.error("Error updating teacher allotment:", error);
  //       setError("Error updating teacher allotment");
  //     }
  //   };

  return (
    <div>
      <div className="mb-4">
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
              onChange={handleClassSectionChange}
            >
              <option value="">Select</option>
              {classes.map((cls) => (
                <option
                  key={cls.section_id}
                  value={`${cls.section_id} ${cls.class_id}`}
                >
                  {`${cls?.get_class?.name} ${cls?.name}`}
                </option>
              ))}
            </select>
            <button
              onClick={handleSearchForAllotTea}
              type="button"
              className="btn h-10 md:h-auto w-18 md:w-auto btn-primary"
            >
              Browse
            </button>
          </div>
        </div>
      </div>

      {subjects.length > 0 && (
        <div className="container mt-4">
          <div className="card mx-auto lg:w-full shadow-lg">
            <div className="card-header flex justify-between items-center">
              <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
                Manage Subjects List
              </h3>
            </div>

            <div className="card-body w-full md:w-[85%] mx-auto ">
              <div className="h-96 lg:h-96 overflow-y-scroll lg:overflow-x-hidden">
                {subjects.map((subject, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-200 grid grid-cols-3 mx-10 gap-x-8"
                  >
                    <div className="relative mt-3 font-semibold text-gray-600">
                      {subject.subject_name}
                    </div>
                    <div className="relative mt-2 col-span-2 text-[.9em]">
                      <Select
                        closeMenuOnSelect={false}
                        components={animatedComponents}
                        isMulti
                        options={departments}
                        value={subject.selectedTeachers}
                        onChange={(selectedOptions) =>
                          handleTeacherSelect(selectedOptions, index)
                        }
                      />
                    </div>
                  </div>
                ))}
                <div className="flex justify-end p-3 mr-5">
                  <button
                    onClick={handleSubmitForAllotTeacherTab}
                    type="button"
                    className="btn h-10 md:h-auto w-18 md:w-auto btn-primary"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllotTeachersForClass;
