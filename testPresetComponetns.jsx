// // Working code of the subjectAllotment component allot teacher for a class component.
// import { useState, useEffect, useCallback, useMemo } from "react";
// import axios from "axios";
// import Select from "react-select";
// import makeAnimated from "react-select/animated";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import Loader from "../../../componants/common/Loader"; // Add this dependency

// const animatedComponents = makeAnimated();

// const AllotTeachersForClass = () => {
//   const API_URL = import.meta.env.VITE_API_URL;
//   const [classes, setClasses] = useState([]);
//   const [classSection, setClassSection] = useState("");
//   const [sectionId, setSectionId] = useState("");
//   const [classId, setClassId] = useState("");
//   const [subjects, setSubjects] = useState([]);
//   const [error, setError] = useState(null);
//   const [departments, setDepartments] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const fetchDepartments = useCallback(async () => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem("authToken");
//       if (!token) throw new Error("No authentication token found");

//       const response = await axios.get(`${API_URL}/api/get_teacher_list`, {
//         headers: { Authorization: `Bearer ${token}` },
//         withCredentials: true,
//       });

//       const teacherOptions = response.data.map((teacher) => ({
//         value: teacher.reg_id,
//         label: teacher.name,
//       }));
//       setDepartments(teacherOptions);
//     } catch (error) {
//       setError(error.message);
//       toast.error("Error fetching teacher list");
//     } finally {
//       setLoading(false);
//     }
//   }, [API_URL]);

//   const fetchClassNames = useCallback(async () => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem("authToken");
//       const response = await axios.get(`${API_URL}/api/get_class_section`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (Array.isArray(response.data)) {
//         setClasses(response.data);
//       } else {
//         setError("Unexpected data format");
//         toast.error("Unexpected data format");
//       }
//     } catch (error) {
//       setError("Error fetching class and section names");
//       toast.error("Error fetching class and section names");
//     } finally {
//       setLoading(false);
//     }
//   }, [API_URL]);

//   const handleClassSectionChange = (e) => {
//     const [classSection, sectionId] = e.target.value.split(" ");
//     setClassSection(e.target.value);
//     setClassId(classSection);
//     setSectionId(sectionId);
//   };

//   const handleSearchForAllotTea = useCallback(async () => {
//     setLoading(true);
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
//             sm_id,
//             subject_name: subject.subject_name,
//             selectedTeachers: subject.details
//               .filter((detail) => detail.teacher_id)
//               .map((detail) => ({
//                 value: detail.teacher_id,
//                 label: detail.teacher?.name,
//               })),
//             details: subject.details.map((detail) => ({
//               subject_id: detail.subject_id,
//               teacher_id: detail.teacher_id || null,
//             })),
//           })
//         );
//         setSubjects(subjectData);
//       } else {
//         setError("Unexpected data format");
//         toast.error("Unexpected data format");
//       }
//     } catch (error) {
//       setError("Error fetching subjects");
//       toast.error("Error fetching subjects");
//     } finally {
//       setLoading(false);
//     }
//   }, [API_URL, classId]);

//   const handleTeacherSelect = (selectedOptions, subjectIndex) => {
//     const newSubjects = [...subjects];
//     newSubjects[subjectIndex].selectedTeachers = selectedOptions;
//     newSubjects[subjectIndex].details = selectedOptions.map((option) => ({
//       subject_id: newSubjects[subjectIndex].details[0].subject_id,
//       teacher_id: option.value || null,
//     }));
//     setSubjects(newSubjects);
//   };

//   const handleSubmitForAllotTeacherTab = useCallback(async () => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem("authToken");
//       const formattedData = {
//         subjects: subjects.reduce((acc, subject) => {
//           const updatedDetails = subject.selectedTeachers.map(
//             (selectedTeacher) => ({
//               subject_id: subject.sm_id,
//               teacher_id: selectedTeacher.value,
//             })
//           );
//           acc[subject.sm_id] = { details: updatedDetails };
//           return acc;
//         }, {}),
//       };

//       await axios.put(
//         `${API_URL}/api/subject-allotments/${sectionId}/${classId}`,
//         formattedData,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       toast.success("Teacher allotment updated successfully!");
//     } catch (error) {
//       setError("Error updating teacher allotment");
//       toast.error("Error updating teacher allotment");
//     } finally {
//       setLoading(false);
//     }
//   }, [API_URL, classId, sectionId, subjects]);

//   useEffect(() => {
//     fetchClassNames();
//     fetchDepartments();
//   }, [fetchClassNames, fetchDepartments]);

//   return (
//     <div>
//       <ToastContainer />
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
//               onChange={handleClassSectionChange}
//             >
//               <option value="">Select</option>
//               {classes.map((cls) => (
//                 <option
//                   key={cls.section_id}
//                   value={`${cls.section_id} ${cls.class_id}`}
//                 >
//                   {`${cls?.get_class?.name} ${cls?.name}`}
//                 </option>
//               ))}
//             </select>
//             <button
//               onClick={handleSearchForAllotTea}
//               type="button"
//               className="btn h-10 md:h-auto w-18 md:w-auto btn-primary"
//               disabled={loading}
//             >
//               Browse
//             </button>
//           </div>
//         </div>
//       </div>

//       {loading && (
//         <div className="flex justify-center items-center h-32">
//           <Loader />
//         </div>
//       )}

//       {subjects.length > 0 && !loading && (
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
//                     className="border-b border-gray-200 grid grid-cols-3 mx-10 gap-x-8"
//                   >
//                     <div className="relative mt-3 font-semibold text-gray-600">
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
//                       />
//                     </div>
//                   </div>
//                 ))}
//                 <div className="flex justify-end p-3 mr-5">
//                   <button
//                     onClick={handleSubmitForAllotTeacherTab}
//                     type="button"
//                     className="btn h-10 md:h-auto w-18 md:w-auto btn-primary"
//                     disabled={loading}
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

// // Allot teacher tab
// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import Select from "react-select";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const AllotTeachersTab = () => {
//   const API_URL = import.meta.env.VITE_API_URL;
//   const [classes, setClasses] = useState([]);
//   const [divisions, setDivisions] = useState([]);
//   const [subjects, setSubjects] = useState([]);
//   const [teachers, setTeachers] = useState([]);
//   const [selectedClass, setSelectedClass] = useState(null);
//   const [selectedDivision, setSelectedDivision] = useState(null);
//   const [selectedTeacher, setSelectedTeacher] = useState(null);
//   const [preSubjects, setPreSubjects] = useState([]);

//   useEffect(() => {
//     fetchClassNames();
//     fetchTeachers();
//   }, []);

//   useEffect(() => {
//     if (selectedTeacher) {
//       fetchPreSubjectsForTeacher();
//     } else {
//       setPreSubjects([]);
//     }
//   }, [selectedTeacher]);

//   const customSelectStyles = {
//     control: (provided) => ({
//       ...provided,
//       minHeight: "40px",
//     }),
//     valueContainer: (provided) => ({
//       ...provided,
//       height: "40px",
//       display: "flex",
//       alignItems: "center",
//     }),
//     input: (provided) => ({
//       ...provided,
//       height: "40px",
//     }),
//     dropdownIndicator: (provided) => ({
//       ...provided,
//       height: "40px",
//     }),
//   };

//   const fetchClassNames = async () => {
//     try {
//       const token = localStorage.getItem("authToken");
//       const response = await axios.get(`${API_URL}/api/getClassList`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setClasses(response.data);
//     } catch (error) {
//       toast.error("Error fetching class names");
//     }
//   };

//   const fetchTeachers = async () => {
//     try {
//       const token = localStorage.getItem("authToken");
//       const response = await axios.get(`${API_URL}/api/get_teacher_list`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setTeachers(
//         response.data.map((teacher) => ({
//           value: teacher.reg_id,
//           label: teacher.name,
//         }))
//       );
//       console.log("This is thhe fetchTeachers ", response.data);
//     } catch (error) {
//       toast.error("Error fetching teachers");
//     }
//   };

//   const fetchPreSubjectsForTeacher = async () => {
//     if (!selectedTeacher || !selectedClass || !selectedDivision) return;
//     console.log(
//       "The fectch pre_selected teacher list parameter",
//       selectedClass.value,
//       selectedDivision.value,
//       selectedTeacher.value
//     );
//     try {
//       const token = localStorage.getItem("authToken");
//       const response = await axios.get(
//         // `${API_URL}/api/get_presign_subject_by_teacher/${102}/${400}/${7}`,

//         `${API_URL}/api/get_presign_subject_by_teacher/${selectedClass.value}/${selectedDivision.value}/${selectedTeacher.value}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       // Map the fetched subjects to match the expected structure
//       const fetchedPreSubjects = response.data.subjects.map((subject) => ({
//         subject_id: subject.subject_id, // Use subject_id from the API response
//         sm_id: subject.sm_id,
//         teacher_id: subject?.teacher_id,
//       }));

//       setPreSubjects(fetchedPreSubjects);
//       console.log(
//         "This is thhe fetchPreSubjectsForTeacher ",
//         response.data.subjects
//       );
//     } catch (error) {
//       toast.error("Error fetching pre-subjects");
//     }
//   };

//   const handleClassChange = async (selectedOption) => {
//     setSelectedClass(selectedOption);
//     setSelectedDivision(null);
//     setDivisions([]);
//     setSubjects([]);
//     setPreSubjects([]);

//     try {
//       const token = localStorage.getItem("authToken");
//       const response = await axios.get(
//         `${API_URL}/api/get_divisions/${selectedOption.value}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       setDivisions(response.data.divisions);
//       console.log("This is thhe get_divisions ", response.data);
//     } catch (error) {
//       toast.error("Error fetching divisions");
//     }
//   };

//   const handleDivisionChange = async (selectedOption) => {
//     setSelectedDivision(selectedOption);
//     setSubjects([]);
//     setPreSubjects([]);

//     try {
//       const token = localStorage.getItem("authToken");
//       const response = await axios.get(
//         `${API_URL}/api/get_subjects/${selectedOption.value}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       setSubjects(response.data.subjects);
//       console.log("This is thhe get_subjects ", response.data.subjects);
//     } catch (error) {
//       toast.error("Error fetching subjects");
//     }
//   };

//   const handleSubjectChange = (subjectId, subjectName) => {
//     if (preSubjects.find((item) => item.sm_id === subjectId)) {
//       setPreSubjects(preSubjects.filter((item) => item.sm_id !== subjectId));
//     } else {
//       setPreSubjects([
//         ...preSubjects,
//         {
//           sm_id: subjectId, // sm_id from the subject table
//           subject_id: subjects.find((subject) => subject.sm_id === subjectId)
//             .subject_id, // Fetching subject_id from subjects array
//           teacher_id: selectedTeacher ? selectedTeacher.value : null,
//         },
//       ]);
//     }
//   };

//   const handleSave = async () => {
//     if (!selectedClass || !selectedDivision || !selectedTeacher) {
//       toast.error("Please fill all fields before saving");
//       return;
//     }
//     console.log("submitted form", preSubjects);
//     try {
//       const token = localStorage.getItem("authToken");
//       await axios.post(
//         `${API_URL}/api/allot-teacher-for-subject/${selectedClass.value}/${selectedDivision.value}`,
//         { subjects: preSubjects },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       toast.success("Teacher allotted successfully");
//     } catch (error) {
//       toast.error("Error saving allotment");
//     }
//   };

//   return (
//     <div>
//       <ToastContainer />
//       <div className="container mt-4">
//         <div className="card mx-auto lg:w-full shadow-lg">
//           <div className="card-header flex justify-between items-center">
//             <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
//               Allot Teachers
//             </h3>
//           </div>
//           <div className="card-body w-full md:w-[85%] mx-auto">
//             <div className="form-group flex justify-center gap-x-1 md:gap-x-6">
//               <label className="w-1/4 pt-2 items-center text-center px-2 lg:px-3 py-2 font-semibold text-[1em] text-gray-700">
//                 Select Class <span className="text-red-500">*</span>
//               </label>
//               <div className="w-full">
//                 <Select
//                   options={classes.map((cls) => ({
//                     value: cls.class_id,
//                     label: cls.name,
//                   }))}
//                   value={selectedClass}
//                   onChange={handleClassChange}
//                   placeholder="Select"
//                   styles={customSelectStyles}
//                 />
//               </div>
//             </div>
//             <div className="form-group flex justify-center gap-x-1 md:gap-x-6 mt-4">
//               <label className="w-1/4 pt-2 items-center text-center px-2 lg:px-3 py-2 font-semibold text-[1em] text-gray-700">
//                 Select Division <span className="text-red-500">*</span>
//               </label>
//               <div className="w-full">
//                 <select
//                   className="form-control"
//                   value={selectedDivision ? selectedDivision.value : ""}
//                   onChange={(e) =>
//                     handleDivisionChange({
//                       value: e.target.value,
//                       label: divisions.find(
//                         (div) => div.section_id == e.target.value
//                       )?.name,
//                     })
//                   }
//                   disabled={!selectedClass}
//                 >
//                   <option value="">Select</option>
//                   {divisions.map((div) => (
//                     <option key={div.section_id} value={div.section_id}>
//                       {div.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//             <div className="form-group flex justify-center gap-x-1 md:gap-x-6 mt-4">
//               <label className="w-1/4 pt-2 items-center text-center px-2 lg:px-3 py-2 font-semibold text-[1em] text-gray-700">
//                 Assign Teacher <span className="text-red-500">*</span>
//               </label>
//               <div className="w-full">
//                 <Select
//                   options={teachers}
//                   value={selectedTeacher}
//                   onChange={setSelectedTeacher}
//                   placeholder="Select"
//                   styles={customSelectStyles}
//                 />
//               </div>
//             </div>
//             <div className="form-group flex justify-center gap-x-1 md:gap-x-6 mt-4">
//               <label className="w-1/4 pt-2 items-center text-center px-2 lg:px-3 py-2 font-semibold text-[1em] text-gray-700">
//                 Select Subjects <span className="text-red-500">*</span>
//               </label>
//               <div className="w-full">
//                 <div className="flex flex-wrap gap-2">
//                   {subjects.length > 0 ? (
//                     subjects.map((subject) => (
//                       <div key={subject.sm_id} className="flex items-center">
//                         <input
//                           type="checkbox"
//                           id={`subject-${subject.sm_id}`}
//                           checked={preSubjects.some(
//                             (item) => item.sm_id === subject.sm_id
//                           )}
//                           onChange={() =>
//                             handleSubjectChange(subject.sm_id, subject.name)
//                           }
//                         />
//                         <label
//                           htmlFor={`subject-${subject.sm_id}`}
//                           className="ml-2"
//                         >
//                           {subject.name}
//                         </label>
//                       </div>
//                     ))
//                   ) : (
//                     <p>No subjects available</p>
//                   )}
//                 </div>
//               </div>
//             </div>
//             <div className="form-group flex justify-center mt-4">
//               <button
//                 type="button"
//                 onClick={handleSave}
//                 className="btn btn-primary"
//               >
//                 Save
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AllotTeachersTab;
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function AllotSubjectTab() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [divisions, setDivisions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState("");
  const [preAllottedSubjects, setPreAllottedSubjects] = useState([]);

  // Fetch divisions on component mount
  useEffect(() => {
    const fetchDivisions = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(`${API_URL}/api/getClassList`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDivisions(response.data);
      } catch (error) {
        console.error("Error fetching divisions:", error);
        toast.error("Error fetching divisions");
      }
    };

    fetchDivisions();
  }, []);

  // Fetch subjects for selected division
  useEffect(() => {
    if (selectedDivision) {
      const fetchSubjects = async () => {
        try {
          const token = localStorage.getItem("authToken");
          const response = await axios.get(
            `${API_URL}/api/get_divisions_and_subjects/${selectedDivision}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (Array.isArray(response.data.subjectAllotments)) {
            const allottedSubjectIds = response.data.subjectAllotments.map(
              (item) => item.sm_id
            );
            setPreAllottedSubjects(allottedSubjectIds);
            setSubjects(response.data.subjects); // Assuming `subjects` is the list of all subjects
          } else {
            setPreAllottedSubjects([]);
            toast.error("Unexpected data format");
          }
        } catch (error) {
          console.error("Error fetching subjects:", error);
          toast.error("Error fetching subjects");
        }
      };

      fetchSubjects();
    }
  }, [selectedDivision]);

  const handleDivisionChange = (e) => {
    setSelectedDivision(e.target.value);
  };

  const handleSubjectCheckboxChange = (subjectId) => {
    setPreAllottedSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        `${API_URL}/api/save_allotted_subjects`,
        {
          division_id: selectedDivision,
          subjects: preAllottedSubjects,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Subjects allotted successfully!");
    } catch (error) {
      console.error("Error saving subjects:", error);
      toast.error("Error saving subjects");
    }
  };

  return (
    <div>
      <h3>Allot Subjects to Division</h3>
      <div>
        <label>Select Division: </label>
        <select onChange={handleDivisionChange} value={selectedDivision}>
          <option value="">Select a Division</option>
          {divisions.map((division) => (
            <option key={division.id} value={division.id}>
              {division.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h4>Subjects</h4>
        {subjects.map((subject) => (
          <div key={subject.id}>
            <label>
              <input
                type="checkbox"
                checked={preAllottedSubjects.includes(subject.id)}
                onChange={() => handleSubjectCheckboxChange(subject.id)}
              />
              {subject.name}
            </label>
          </div>
        ))}
      </div>

      <button onClick={handleSave}>Save Allotments</button>
    </div>
  );
}

export default AllotSubjectTab;

