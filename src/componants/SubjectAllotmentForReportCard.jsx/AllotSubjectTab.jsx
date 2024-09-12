// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import Select from "react-select";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { RxCross1 } from "react-icons/rx";

// const AllotSubjectTab = () => {
//   const API_URL = import.meta.env.VITE_API_URL;
//   const [classes, setClasses] = useState([]);
//   const [divisions, setDivisions] = useState([]);
//   const [subjects, setSubjects] = useState([]);
//   const [teachers, setTeachers] = useState([]);
//   const [selectedClass, setSelectedClass] = useState(null);
//   const [selectedDivision, setSelectedDivision] = useState(null);
//   const [selectedTeacher, setSelectedTeacher] = useState(null);
//   const [preSubjects, setPreSubjects] = useState([]);
//   const [selectedSubjectType, setSelectedSubjectType] = useState("");
//   const [subjectTypeError, setSubjectTypeError] = useState(null);

//   // Error state variables
//   const [classError, setClassError] = useState("");
//   const [divisionError, setDivisionError] = useState("");
//   const [teacherError, setTeacherError] = useState("");
//   const [subjectError, setSubjectError] = useState("");

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
//     } catch (error) {
//       toast.error("Error fetching teachers");
//     }
//   };

//   const fetchPreSubjectsForTeacher = async () => {
//     if (!selectedTeacher || !selectedClass || !selectedDivision) return;
//     try {
//       const token = localStorage.getItem("authToken");
//       const response = await axios.get(
//         `${API_URL}/api/get_presign_subject_by_teacher/${selectedClass.value}/${selectedDivision.value}/${selectedTeacher.value}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       const fetchedPreSubjects = response.data.subjects.map((subject) => ({
//         subject_id: subject.subject_id,
//         sm_id: subject.sm_id,
//         teacher_id: subject?.teacher_id,
//       }));

//       setPreSubjects(fetchedPreSubjects);
//     } catch (error) {
//       toast.error("Error fetching pre-subjects");
//     }
//   };

//   const handleClassChange = async (selectedOption) => {
//     setSelectedClass(selectedOption);
//     setSelectedDivision(null);
//     setSelectedTeacher(null); // Clear teacher when class changes
//     setTeacherError("");
//     setSubjectError("");
//     setDivisions([]);
//     setSubjects([]);
//     setPreSubjects([]);
//     setClassError(""); // Clear previous error message

//     try {
//       const token = localStorage.getItem("authToken");
//       const response = await axios.get(
//         `${API_URL}/api/get_divisions/${selectedOption.value}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       setDivisions(response.data.divisions);
//     } catch (error) {
//       toast.error("Error fetching divisions");
//     }
//   };
//   const handleSubjectTypeChange = (value) => {
//     setSelectedSubjectType(value);
//     if (subjectTypeError) {
//       setSubjectTypeError(""); // Clear error if any, when selection changes
//     }
//   };

//   const handleDivisionChange = async (selectedOption) => {
//     setSelectedDivision(selectedOption);
//     setSubjects([]);
//     setPreSubjects([]);
//     setDivisionError(""); // Clear previous error message

//     try {
//       const token = localStorage.getItem("authToken");
//       const response = await axios.get(
//         `${API_URL}/api/get_subjects/${selectedOption.value}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       setSubjects(response.data?.subjects);
//     } catch (error) {
//       toast.error("Error fetching subjects");
//     }
//   };

//   const handleSubjectChange = (subjectId) => {
//     setSubjectError("");
//     if (preSubjects.find((item) => item.sm_id === subjectId)) {
//       setPreSubjects(preSubjects.filter((item) => item.sm_id !== subjectId));
//     } else {
//       setPreSubjects([
//         ...preSubjects,
//         {
//           sm_id: subjectId,
//           subject_id: subjects.find((subject) => subject.sm_id === subjectId)
//             .subject_id,
//           teacher_id: selectedTeacher ? selectedTeacher.value : null,
//         },
//       ]);
//     }
//   };

//   const handleSave = async () => {
//     let hasError = false;

//     // Validate form fields
//     if (!selectedClass) {
//       setClassError("Please select a class.");
//       hasError = true;
//     }
//     if (!selectedSubjectType) {
//       setSubjectTypeError("Please select subject type.");
//       hasError = true;
//     }
//     if (!selectedTeacher) {
//       setTeacherError("Please select a teacher.");
//       hasError = true;
//     }
//     if (preSubjects.length === 0) {
//       setSubjectError("Please select at least one subject.");
//       hasError = true;
//     }

//     if (hasError) return; // If there are errors, don't proceed with the save.

//     try {
//       const token = localStorage.getItem("authToken");
//       await axios.post(
//         `${API_URL}/api/allot-teacher-for-subject/${selectedClass.value}/${selectedDivision.value}`,
//         { subjects: preSubjects },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       // Success message
//       toast.success("Teacher allotted successfully");

//       // Clear fields after successful submission
//       setTimeout(() => {
//         setSelectedClass(null);
//         setSelectedDivision(null);
//         setSelectedTeacher(null);
//         setClassError("");
//         setDivisionError("");
//         setTeacherError("");
//         setSubjectError("");
//         setSubjects([]);
//         setPreSubjects([]);
//       }, 3000);
//     } catch (error) {
//       toast.error("Error saving allotment");
//     }
//   };

//   return (
//     <div>
//       <ToastContainer />
//       <div className="container mt-4">
//         <div className="card mx-auto lg:w-full shadow-lg">
//           <div className="p-2 px-3 bg-gray-100 flex justify-between items-center">
//             <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
//               Allot Subject For Report Card
//             </h3>
//             {/* <RxCross1
//               className="float-end relative top-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
//               type="button"
//               // className="btn-close text-red-600"
//               onClick={handleCloseModalForAllotTeacher}
//             /> */}
//           </div>
//           <div
//             className=" relative -top-2 mb-3 h-1 w-[97%] mx-auto bg-red-700"
//             style={{
//               backgroundColor: "#C03078",
//             }}
//           ></div>
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
//                   className="w-full md:w-[50%]"
//                   // isClearable
//                 />
//                 {classError && (
//                   <p className=" absolute text-red-500 text-xs">{classError}</p>
//                 )}
//               </div>
//             </div>
//             <div className="form-group relative left-0 md:-left-4 flex justify-start mt-4">
//               <label className="w-1/4 pt-2 items-center text-center py-2 font-semibold text-[1em] text-gray-700">
//                 Subject Type <span className="text-red-500">*</span>
//               </label>
//               <div className="w-full md:w-[39%]">
//                 <select
//                   className="form-control"
//                   value={selectedSubjectType}
//                   onChange={(e) => handleSubjectTypeChange(e.target.value)} // Handle change
//                 >
//                   <option value="">Select</option>
//                   <option value="scholastic">Scholastic</option>
//                   <option value="co-scholastic">Co-Scholastic</option>
//                 </select>
//                 {subjectTypeError && (
//                   <p className="absolute text-red-500 text-xs">
//                     {subjectTypeError}
//                   </p>
//                 )}
//               </div>
//             </div>
//             <div className="form-group flex justify-center gap-x-1 md:gap-x-6 mt-4">
//               <label className="w-1/4 pt-2 items-center text-center px-2 lg:px-3 py-2 font-semibold text-[1em] text-gray-700 ">
//                 Select Subjects <span className="text-red-500">*</span>
//               </label>
//               <div className="w-full">
//                 <div className="relative gap-x-10 top-2   grid grid-cols-3  w-full">
//                   {subjects.map((subject) => (
//                     <label
//                       key={subject.sm_id}
//                       // className="flex items-center cursor-pointer"
//                     >
//                       <input
//                         type="checkbox"
//                         className="mr-0.5 shadow-lg"
//                         checked={preSubjects.some(
//                           (item) => item.sm_id === subject.sm_id
//                         )}
//                         onChange={() => handleSubjectChange(subject.sm_id)}
//                       />
//                       <span className="font-normal text-gray-600">
//                         {subject.name}
//                       </span>
//                     </label>
//                   ))}
//                 </div>
//                 {subjectError && (
//                   <p className="relative -top-5 text-red-500 text-xs ">
//                     {subjectError}
//                   </p>
//                 )}
//               </div>
//             </div>{" "}
//             <div className="form-group flex justify-end mt-4">
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

// export default AllotSubjectTab;

import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RxCross1 } from "react-icons/rx";

const AllotSubjectTab = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubjectType, setSelectedSubjectType] = useState("");
  const [subjectTypeError, setSubjectTypeError] = useState(null);
  const [subjects, setSubjects] = useState([]); // All subjects
  const [preCheckedSubjects, setPreCheckedSubjects] = useState([]); // Pre-selected subjects

  // Error state variables
  const [classError, setClassError] = useState("");
  const [subjectError, setSubjectError] = useState("");

  // Fetch class list on component mount
  useEffect(() => {
    fetchClassNames();
  }, []);

  // Fetch all subjects initially
  useEffect(() => {
    fetchAllSubjects();
  }, []);

  const fetchClassNames = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${API_URL}/api/getClassList`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(response.data);
    } catch (error) {
      toast.error("Error fetching class names");
    }
  };

  const fetchAllSubjects = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/api/get_subject_Alloted_for_report_card`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubjects(response?.data?.subjectAllotments);
    } catch (error) {
      toast.error("Error fetching subjects");
    }
  };

  // Fetch pre-selected subjects based on class and subject type
  const fetchPreSelectedSubjects = async (classId, subjectType) => {
    if (!classId || !subjectType) return;
    console.log("classId:", classId, "subjectType:", subjectType.value);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/api/get_sub_report_allotted/${classId}/${subjectType.value}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const fetchedPreCheckedSubjects = response.data.subjectAllotments.map(
        (subject) => subject.get_subjects_for_report_card.sub_rc_master_id
      );
      setPreCheckedSubjects(fetchedPreCheckedSubjects);
      console.log("setPreCheckedSubjects", response.data.subjectAllotments);
    } catch (error) {
      toast.error("Error fetching pre-selected subjects");
    }
  };

  const handleClassChange = (selectedOption) => {
    setSelectedClass(selectedOption);
    setClassError("");
    setSelectedSubjectType("");
    setPreCheckedSubjects([]);
  };

  const handleSubjectTypeChange = (value) => {
    setSelectedSubjectType(value);
    if (subjectTypeError) {
      setSubjectTypeError("");
    }

    // Fetch pre-selected subjects when both class and subject type are selected
    if (selectedClass && value) {
      fetchPreSelectedSubjects(selectedClass.value, value);
    }
  };

  const handleCheckboxChange = (subjectId) => {
    if (preCheckedSubjects.includes(subjectId)) {
      setPreCheckedSubjects(
        preCheckedSubjects.filter((id) => id !== subjectId)
      );
    } else {
      setPreCheckedSubjects([...preCheckedSubjects, subjectId]);
    }
  };

  const handleSave = async () => {
    let hasError = false;

    // Validate form fields
    if (!selectedClass) {
      setClassError("Please select a class.");
      hasError = true;
    }
    if (!selectedSubjectType) {
      setSubjectTypeError("Please select subject type.");
      hasError = true;
    }
    if (preCheckedSubjects.length === 0) {
      setSubjectError("Please select at least one subject.");
      hasError = true;
    }

    if (hasError) return; // If there are errors, don't proceed with the save.

    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        `${API_URL}/api/get_sub_report_allotted/${selectedClass.value}`,
        { subjects: preCheckedSubjects, subject_type: selectedSubjectType },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Subjects allotted successfully");

      // Clear fields after successful submission
      setSelectedClass(null);
      setSelectedSubjectType("");
      setPreCheckedSubjects([]);
    } catch (error) {
      toast.error("Error saving allotment");
    }
  };

  return (
    <div>
      <ToastContainer />
      <div className="container mt-4">
        <div className="card mx-auto lg:w-full shadow-lg">
          <div className="p-2 px-3 bg-gray-100 flex justify-between items-center">
            <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
              Allot Subject For Report Card
            </h3>
          </div>
          <div
            className=" relative -top-2 mb-3 h-1 w-[97%] mx-auto bg-red-700"
            style={{ backgroundColor: "#C03078" }}
          ></div>
          <div className="card-body w-full md:w-[85%] mx-auto">
            {/* Select Class */}
            <div className="form-group flex justify-center gap-x-1 md:gap-x-6">
              <label className="w-1/4 pt-2 items-center text-center px-2 lg:px-3 py-2 font-semibold text-[1em] text-gray-700">
                Select Class <span className="text-red-500">*</span>
              </label>
              <div className="w-full relative">
                <Select
                  value={selectedClass}
                  onChange={handleClassChange}
                  placeholder="Select"
                  className="w-full md:w-[50%] mb-3"
                  isClearable
                  options={classes.map((classObj) => ({
                    value: classObj.class_id,
                    label: classObj.name,
                  }))}
                />
                {classError && (
                  <p className="relative -top-4 -mb-3 text-red-500 text-sm">
                    {classError}
                  </p>
                )}
              </div>
            </div>

            {/* Select Subject Type */}
            <div className="form-group flex justify-center gap-x-1 md:gap-x-6">
              <label className="w-1/4 pt-2 text-center px-2 lg:px-3 py-2 font-semibold text-[1em] text-gray-700">
                Subject Type <span className="text-red-500">*</span>
              </label>
              <div className="w-full">
                <Select
                  value={selectedSubjectType}
                  onChange={handleSubjectTypeChange}
                  placeholder="Select"
                  className="w-full md:w-[50%]"
                  isClearable
                  isSearchable
                  options={[
                    { value: "Scholastic", label: "Scholastic" },
                    { value: "Co-Scholastic", label: "Co-Scholastic" },
                  ]}
                />
                {subjectTypeError && (
                  <p className="absolute text-red-500 text-sm">
                    {subjectTypeError}
                  </p>
                )}
              </div>
            </div>

            {/* Display subjects with checkboxes */}
            <div className="form-group flex justify-center gap-x-1 md:gap-x-6 mt-4">
              <label className="w-1/4 pt-2 items-center text-center px-2 lg:px-3 py-2 font-semibold text-[1em] text-gray-700 ">
                Select Subjects <span className="text-red-500">*</span>
              </label>
              <div className="w-full">
                <div className="relative gap-x-10 top-2   grid grid-cols-3  w-full"></div>
                {subjects.length > 0 ? (
                  subjects.map((subject) => (
                    <div key={subject.sub_reportcard_id}>
                      <label>
                        <input
                          type="checkbox"
                          checked={preCheckedSubjects.includes(
                            subject.get_subjects_for_report_card
                              .sub_rc_master_id
                          )}
                          onChange={() =>
                            handleCheckboxChange(
                              subject.get_subjects_for_report_card
                                .sub_rc_master_id
                            )
                          }
                        />
                        {subject.get_subjects_for_report_card.name}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="mt-2">No subjects available</p>
                )}
                {subjectError && (
                  <p className=" absolute text-red-500 text-sm">
                    {subjectError}
                  </p>
                )}
              </div>
            </div>

            {/* Save button */}

            <div className="form-group flex justify-end mt-4">
              <button
                type="button"
                onClick={handleSave}
                className="btn btn-primary"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllotSubjectTab;
