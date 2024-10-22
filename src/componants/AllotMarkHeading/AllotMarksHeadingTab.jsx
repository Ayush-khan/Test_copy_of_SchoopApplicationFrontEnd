// change the code of allot subject tab to allotmarkheading
// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import Select from "react-select";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { RxCross1 } from "react-icons/rx";

// const AllotMarksHeadingTab = () => {
//   const API_URL = import.meta.env.VITE_API_URL;
//   const [classes, setClasses] = useState([]);
//   const [selectedClass, setSelectedClass] = useState(null);
//   const [selectedSubjectType, setSelectedSubjectType] = useState("");
//   const [subjectTypeError, setSubjectTypeError] = useState(null);
//   const [subjectsIs, setSubjectsIs] = useState([]); // All subjects
//   const [initialsubjectsIs, setInitialSubjectsIs] = useState([]); // All subjects

//   const [preCheckedSubjects, setPreCheckedSubjects] = useState([]); // Pre-selected subjects

//   // Error state variables
//   const [classError, setClassError] = useState("");
//   const [subjectError, setSubjectError] = useState("");

//   // Fetch class list on component mount

//   useEffect(() => {
//     fetchClassNames();
//     fetchAllSubjects();
//   }, []);

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

//   const fetchAllSubjects = async () => {
//     try {
//       const token = localStorage.getItem("authToken");
//       const response = await axios.get(
//         `${API_URL}/api/subject_for_reportcard`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       // Assuming response.data.subjects is the correct structure
//       const subjects = response?.data?.subjects;

//       setSubjectsIs(subjects);
//       setInitialSubjectsIs(subjects);

//       console.log("setSubjectsIs", subjects);
//       console.log("setInitialSubjectsIs", subjects);
//     } catch (error) {
//       toast.error("Error fetching subjects");
//     }
//   };

//   // Fetch pre-selected subjects based on class and subject type
//   const fetchPreSelectedSubjects = async (classId, subjectType) => {
//     if (!classId || !subjectType) return;
//     console.log("classId:", classId, "subjectType:", subjectType.value);
//     try {
//       const token = localStorage.getItem("authToken");
//       const response = await axios.get(
//         `${API_URL}/api/get_sub_report_allotted/${classId}/${subjectType.value}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       console.log(
//         "without maching preselected subject come form api",
//         response?.data?.subjectAllotments
//       );
//       const fetchedPreCheckedSubjects = response?.data?.subjectAllotments.map(
//         (subject) => subject.get_subjects_for_report_card.sub_rc_master_id
//       );

//       setPreCheckedSubjects(fetchedPreCheckedSubjects);
//       console.log("setPreCheckedSubjects", response?.data?.subjectAllotments);
//     } catch (error) {
//       toast.error(error?.response?.data?.error);
//       console.log("error", error);
//     }
//   };

//   const handleClassChange = (selectedOption) => {
//     setSelectedClass(selectedOption);
//     setClassError("");
//     setSelectedSubjectType("");
//     setPreCheckedSubjects([]);
//   };

//   const handleSubjectTypeChange = (value) => {
//     setSelectedSubjectType(value);
//     if (subjectTypeError) {
//       setSubjectTypeError("");
//     }

//     // Fetch pre-selected subjects when both class and subject type are selected
//     if (selectedClass && value) {
//       fetchPreSelectedSubjects(selectedClass.value, value);
//     }
//   };

//   const handleCheckboxChange = (subjectId) => {
//     setSubjectError("");
//     if (preCheckedSubjects.includes(subjectId)) {
//       setPreCheckedSubjects(
//         preCheckedSubjects.filter((id) => id !== subjectId)
//       );
//     } else {
//       setPreCheckedSubjects([...preCheckedSubjects, subjectId]);
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
//       setSubjectTypeError("Please select a subject type.");
//       hasError = true;
//     }
//     if (preCheckedSubjects.length === 0) {
//       setSubjectError("Please select at least one subject.");
//       hasError = true;
//     }

//     if (hasError) return; // If there are errors, don't proceed with the save.

//     try {
//       const token = localStorage.getItem("authToken");
//       console.log(
//         "subjects",
//         preCheckedSubjects,
//         "subject_type",
//         selectedSubjectType.value
//       );

//       // Make the API request to save the subject allotment
//       const response = await axios.post(
//         `${API_URL}/api/subject-allotments-reportcard/${selectedClass.value}`,
//         {
//           subject_ids: preCheckedSubjects, // Array of subject IDs (like [1, 2, 3])
//           subject_type: selectedSubjectType.value, // e.g., 'core' or 'optional'
//         },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       // Handle the response from the backend
//       if (response.status === 200) {
//         toast.success("Subjects allotted successfully");
//         console.log("API Response:", response.data); // Log the response for debugging

//         // Clear fields after successful submission
//         setSelectedClass(null);
//         setSelectedSubjectType("");
//         setPreCheckedSubjects([]);
//       } else {
//         toast.error("Unexpected response status from the server.");
//         console.error("Response status:", response.status);
//       }
//     } catch (error) {
//       if (error.response) {
//         // If the server responded with a status other than 200 range
//         console.error(
//           "Error response from server:",
//           error?.response?.data?.message
//         );
//         toast.error(error?.response?.data?.message);
//       } else {
//         // If there was a problem with the request (e.g., network error)
//         console.error("Error with request:", error.message);
//         toast.error("Error saving allotment");
//       }
//     }
//   };

//   return (
//     <div>
//       <ToastContainer />
//       <div className="container mt-4">
//         <div className="card mx-auto lg:w-full shadow-lg">
//           <div className="p-2 px-3 bg-gray-100 flex justify-between items-center">
//             <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
//               Allot Mark Headings
//             </h3>
//           </div>
//           <div
//             className=" relative -top-2 mb-3 h-1 w-[97%] mx-auto bg-red-700"
//             style={{ backgroundColor: "#C03078" }}
//           ></div>
//           <div className="card-body w-full md:w-[85%] mx-auto">
//             {/* Select Class */}
//             <div className="form-group flex justify-center gap-x-1 md:gap-x-6">
//               <label className="w-1/4 pt-2 items-center text-center px-2 lg:px-3 py-2 font-semibold text-[1em] text-gray-700">
//                 Select Class <span className="text-red-500">*</span>
//               </label>
//               <div className="w-full relative">
//                 <Select
//                   value={selectedClass}
//                   onChange={handleClassChange}
//                   placeholder="Select"
//                   className="w-full md:w-[50%] mb-3"
//                   isClearable
//                   options={classes.map((classObj) => ({
//                     value: classObj.class_id,
//                     label: classObj.name,
//                   }))}
//                 />
//                 {classError && (
//                   <p className="relative -top-4 -mb-3 text-red-500 text-sm">
//                     {classError}
//                   </p>
//                 )}
//               </div>
//             </div>

//             {/* Select Subject Type */}
//             <div className="form-group flex justify-center gap-x-1 md:gap-x-6">
//               <label className="w-1/4 pt-2 text-center px-2 lg:px-3 py-2 font-semibold text-[1em] text-gray-700">
//                 Subject Type <span className="text-red-500">*</span>
//               </label>
//               <div className="w-full">
//                 <Select
//                   value={selectedSubjectType}
//                   onChange={handleSubjectTypeChange}
//                   placeholder="Select"
//                   className="w-full md:w-[50%]"
//                   isClearable
//                   isSearchable
//                   options={[
//                     { value: "Scholastic", label: "Scholastic" },
//                     { value: "Co-Scholastic", label: "Co-Scholastic" },
//                   ]}
//                 />
//                 {subjectTypeError && (
//                   <p className="absolute text-red-500 text-sm">
//                     {subjectTypeError}
//                   </p>
//                 )}
//               </div>
//             </div>

//             {/* Display subjects with checkboxes */}
//             <div className="form-group flex justify-center gap-x-1 md:gap-x-6 mt-4">
//               <label className="w-1/4 pt-2 items-center text-center px-2 lg:px-3 py-2 font-semibold text-[1em] text-gray-700 ">
//                 Select Subjects <span className="text-red-500">*</span>
//               </label>
//               <div className="w-full">
//                 <div className="relative gap-x-10 top-2 grid grid-cols-3 w-full">
//                   {subjectsIs.length > 0 ? (
//                     subjectsIs.map((subject) => (
//                       <div
//                         key={subject.sub_rc_master_id}
//                         className="flex items-center gap-x-2"
//                       >
//                         <label>
//                           <input
//                             type="checkbox"
//                             checked={preCheckedSubjects.includes(
//                               subject.sub_rc_master_id
//                             )}
//                             onChange={() =>
//                               handleCheckboxChange(subject.sub_rc_master_id)
//                             }
//                             className="mr-2"
//                           />
//                           {subject.name}
//                         </label>
//                       </div>
//                     ))
//                   ) : (
//                     <p className="mt-2">No subjects available</p>
//                   )}
//                 </div>
//                 {subjectError && (
//                   <p className="absolute text-red-500 text-sm">
//                     {subjectError}
//                   </p>
//                 )}
//               </div>
//             </div>

//             {/* Save button */}

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

// export default AllotMarksHeadingTab;

// Code working with dummy data.

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import Select from "react-select";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const AllotMarksHeadingTab = () => {
//   const API_URL = import.meta.env.VITE_API_URL;

//   const [classes, setClasses] = useState([]);
//   const [exams, setExams] = useState([]);
//   const [subjects, setSubjects] = useState([]);

//   const [selectedClass, setSelectedClass] = useState(null);
//   const [selectedExam, setSelectedExam] = useState(null);
//   const [selectedSubject, setSelectedSubject] = useState(null);

//   // Prepopulate with dummy data for marks headings and highest marks
//   const [marksHeadingsData, setMarksHeadingsData] = useState([
//     {
//       marks_headings_id: 1,
//       name: "Theory",
//       highest_marks: "",
//       selected: false,
//     },
//     {
//       marks_headings_id: 2,
//       name: "Practical",
//       highest_marks: "",
//       selected: false,
//     },
//     {
//       marks_headings_id: 3,
//       name: "Internal Assessment",
//       highest_marks: "",
//       selected: false,
//     },
//     { marks_headings_id: 4, name: "Viva", highest_marks: "", selected: false },
//   ]);

//   const [classError, setClassError] = useState("");
//   const [examError, setExamError] = useState("");
//   const [subjectError, setSubjectError] = useState("");
//   const [marksHeadingError, setMarksHeadingError] = useState("");
//   const [highestMarksError, setHighestMarksError] = useState([]);

//   // Fetch class list on component mount
//   useEffect(() => {
//     fetchClassNames();
//     fetchExams(); // Fetch exams on page load
//   }, []);

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

//   const fetchExams = async () => {
//     try {
//       const token = localStorage.getItem("authToken");
//       const response = await axios.get(`${API_URL}/api/getExamsList`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setExams(response.data); // Assuming the exam list structure
//     } catch (error) {
//       toast.error("Error fetching exams");
//     }
//   };

//   const fetchSubjects = async (classId) => {
//     try {
//       const token = localStorage.getItem("authToken");
//       const response = await axios.get(
//         `${API_URL}/api/getSubjects/${classId}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       setSubjects(response.data.subjects); // Adjust based on actual API response structure
//     } catch (error) {
//       toast.error("Error fetching subjects");
//     }
//   };

//   const handleClassChange = (selectedOption) => {
//     setSelectedClass(selectedOption);
//     setClassError("");
//     setSelectedSubject(null); // Reset subject
//     fetchSubjects(selectedOption.value);
//   };

//   const handleExamChange = (selectedOption) => {
//     setSelectedExam(selectedOption);
//     setExamError("");
//   };

//   const handleSubjectChange = (selectedOption) => {
//     setSelectedSubject(selectedOption);
//     setSubjectError("");
//   };

//   const handleMarksHeadingChange = (index) => {
//     const updatedMarksHeadings = [...marksHeadingsData];
//     updatedMarksHeadings[index].selected =
//       !updatedMarksHeadings[index].selected;
//     setMarksHeadingsData(updatedMarksHeadings);
//     setMarksHeadingError("");
//   };

//   const handleHighestMarksChange = (index, newMarks) => {
//     const updatedMarksHeadings = [...marksHeadingsData];
//     updatedMarksHeadings[index].highest_marks = newMarks;
//     setMarksHeadingsData(updatedMarksHeadings);

//     const updatedMarksErrors = [...highestMarksError];
//     updatedMarksErrors[index] = ""; // Clear any existing error when input is provided
//     setHighestMarksError(updatedMarksErrors);
//   };

//   const handleSave = async () => {
//     let hasError = false;

//     // Validate form fields
//     if (!selectedClass) {
//       setClassError("Please select a class.");
//       hasError = true;
//     }
//     if (!selectedExam) {
//       setExamError("Please select an exam.");
//       hasError = true;
//     }
//     if (!selectedSubject) {
//       setSubjectError("Please select a subject.");
//       hasError = true;
//     }

//     // Validate marks headings
//     const selectedHeadings = marksHeadingsData.filter(
//       (heading) => heading.selected
//     );
//     if (selectedHeadings.length === 0) {
//       setMarksHeadingError("Please select at least one marks heading.");
//       hasError = true;
//     }

//     // Validate highest marks for selected headings
//     const marksErrors = [];
//     selectedHeadings.forEach((heading, index) => {
//       if (!heading.highest_marks) {
//         marksErrors[index] = "Highest marks is required.";
//         hasError = true;
//       }
//     });
//     setHighestMarksError(marksErrors);

//     if (hasError) return;

//     // Handle the save logic (API call to save marks headings)
//     // You can send marksHeadingsData to the API here.
//     console.log("Form submitted successfully");
//   };

//   return (
//     <div>
//       <ToastContainer />
//       <div className="container mt-4">
//         <div className="card mx-auto lg:w-full shadow-lg">
//           <div className="p-2 px-3 bg-gray-100 flex justify-between items-center">
//             <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
//               Allot Mark Headings
//             </h3>
//           </div>
//           <div
//             className="relative -top-2 mb-3 h-1 w-[97%] mx-auto"
//             style={{ backgroundColor: "#C03078" }}
//           ></div>
//           <div className="card-body w-full md:w-[85%] mx-auto">
//             {/* Select Class */}
//             <div className="form-group flex justify-center gap-x-1 md:gap-x-6">
//               <label className="w-1/4 pt-2 text-center font-semibold text-gray-700">
//                 Select Class
//               </label>
//               <div className="w-full">
//                 <Select
//                   value={selectedClass}
//                   onChange={handleClassChange}
//                   placeholder="Select"
//                   options={classes.map((classObj) => ({
//                     value: classObj.class_id,
//                     label: classObj.name,
//                   }))}
//                 />
//                 {classError && <p className="text-red-500">{classError}</p>}
//               </div>
//             </div>

//             {/* Select Exam */}
//             <div className="form-group flex justify-center gap-x-1 md:gap-x-6 mt-4">
//               <label className="w-1/4 pt-2 text-center font-semibold text-gray-700">
//                 Select Exam
//               </label>
//               <div className="w-full">
//                 <Select
//                   value={selectedExam}
//                   onChange={handleExamChange}
//                   placeholder="Select"
//                   options={exams.map((exam) => ({
//                     value: exam.exam_id,
//                     label: exam.name,
//                   }))}
//                 />
//                 {examError && <p className="text-red-500">{examError}</p>}
//               </div>
//             </div>

//             {/* Select Subject */}
//             <div className="form-group flex justify-center gap-x-1 md:gap-x-6 mt-4">
//               <label className="w-1/4 pt-2 text-center font-semibold text-gray-700">
//                 Select Subject
//               </label>
//               <div className="w-full">
//                 <Select
//                   value={selectedSubject}
//                   onChange={handleSubjectChange}
//                   placeholder="Select"
//                   options={subjects.map((subject) => ({
//                     value: subject.subject_id,
//                     label: subject.name,
//                   }))}
//                 />
//                 {subjectError && <p className="text-red-500">{subjectError}</p>}
//               </div>
//             </div>

//             {/* Marks Heading Checkboxes with Highest Marks */}
//             <div className="mt-6">
//               {marksHeadingsData.length > 0 ? (
//                 marksHeadingsData.map((heading, index) => (
//                   <div
//                     key={heading.marks_headings_id}
//                     className="flex items-center mb-4"
//                   >
//                     <input
//                       type="checkbox"
//                       checked={heading.selected}
//                       onChange={() => handleMarksHeadingChange(index)}
//                       className="mr-2"
//                     />
//                     <label className="mr-4">{heading.name}</label>
//                     <input
//                       type="text"
//                       value={heading.highest_marks}
//                       maxLength={3}
//                       onChange={(e) =>
//                         handleHighestMarksChange(index, e.target.value)
//                       }
//                       className="border p-1 w-20"
//                       disabled={!heading.selected}
//                       placeholder="Highest marks"
//                     />
//                     {highestMarksError[index] && (
//                       <p className="text-red-500 ml-4">
//                         {highestMarksError[index]}
//                       </p>
//                     )}
//                   </div>
//                 ))
//               ) : (
//                 <p>No marks headings available</p>
//               )}
//               {marksHeadingError && (
//                 <p className="text-red-500">{marksHeadingError}</p>
//               )}
//             </div>

//             {/* Save Button */}
//             <div className="flex justify-center mt-6">
//               <button
//                 onClick={handleSave}
//                 className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
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

// export default AllotMarksHeadingTab;

import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AllotMarksHeadingTab = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [marksHeadingsData, setMarksHeadingsData] = useState([]);

  const [classError, setClassError] = useState("");
  const [examError, setExamError] = useState("");
  const [subjectError, setSubjectError] = useState("");
  const [marksHeadingError, setMarksHeadingError] = useState("");
  const [highestMarksError, setHighestMarksError] = useState([]);

  // Fetch class list and exams on component mount
  useEffect(() => {
    fetchClassNames();
    fetchExams();
    fetchMarksHeadings(); // Fetch marks headings on component mount
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

  const fetchExams = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${API_URL}/api/get_Examslist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExams(response?.data); // Assuming the exam list structure
    } catch (error) {
      toast.error("Error fetching exams");
    }
  };

  const fetchMarksHeadings = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${API_URL}/api/get_Markheadingslist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Assuming the response contains marks headings data in the desired format
      const formattedData = response.data.map((heading) => ({
        marks_headings_id: heading.marks_headings_id,
        name: heading.name,
        highest_marks: "",
        selected: false,
      }));
      setMarksHeadingsData(formattedData);
    } catch (error) {
      toast.error("Error fetching marks headings");
    }
  };

  const fetchSubjects = async (classId) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/api/get_subject_Alloted_for_report_card/${classId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSubjects(response?.data?.subjectAllotments); // Adjust based on actual API response structure
    } catch (error) {
      toast.error("Error fetching subjects");
    }
  };

  const handleClassChange = (selectedOption) => {
    setSelectedClass(selectedOption);
    setClassError("");
    setSelectedSubject(null); // Reset subject
    fetchSubjects(selectedOption.value);
  };

  const handleExamChange = (selectedOption) => {
    setSelectedExam(selectedOption);
    setExamError("");
  };

  const handleSubjectChange = (selectedOption) => {
    setSelectedSubject(selectedOption);
    setSubjectError("");
  };

  const handleMarksHeadingChange = (index) => {
    const updatedMarksHeadings = [...marksHeadingsData];
    updatedMarksHeadings[index].selected =
      !updatedMarksHeadings[index].selected;
    setMarksHeadingsData(updatedMarksHeadings);
    setMarksHeadingError("");
  };

  const handleHighestMarksChange = (index, newMarks) => {
    const updatedMarksHeadings = [...marksHeadingsData];
    updatedMarksHeadings[index].highest_marks = newMarks;
    setMarksHeadingsData(updatedMarksHeadings);

    const updatedMarksErrors = [...highestMarksError];
    updatedMarksErrors[index] = ""; // Clear any existing error when input is provided
    setHighestMarksError(updatedMarksErrors);
  };

  const handleSave = async () => {
    let hasError = false;

    // Validate form fields
    if (!selectedClass) {
      setClassError("Please select a class.");
      hasError = true;
    }
    if (!selectedExam) {
      setExamError("Please select an exam.");
      hasError = true;
    }
    if (!selectedSubject) {
      setSubjectError("Please select a subject.");
      hasError = true;
    }

    // Validate marks headings
    const selectedHeadings = marksHeadingsData.filter(
      (heading) => heading.selected
    );
    if (selectedHeadings.length === 0) {
      setMarksHeadingError("Please select at least one marks heading.");
      hasError = true;
    }

    // Validate highest marks for selected headings
    const marksErrors = [];
    selectedHeadings.forEach((heading, index) => {
      if (!heading.highest_marks) {
        marksErrors[index] = "Highest marks is required.";
        hasError = true;
      }
    });
    setHighestMarksError(marksErrors);

    if (hasError) return;

    // Prepare data to send to API
    const marksData = selectedHeadings.map((heading) => ({
      marks_heading_id: heading.marks_headings_id,
      highest_marks: heading.highest_marks,
    }));

    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        `${API_URL}/api/saveMarksHeadings`,
        {
          class_id: selectedClass.value,
          exam_id: selectedExam.value,
          subject_id: selectedSubject.value,
          marks: marksData,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Marks headings saved successfully");
      // Reset the form
      setSelectedClass(null);
      setSelectedExam(null);
      setSelectedSubject(null);
      setMarksHeadingsData(
        marksHeadingsData.map((heading) => ({
          ...heading,
          selected: false,
          highest_marks: "",
        }))
      );
    } catch (error) {
      toast.error("Error saving marks headings");
    }
  };

  return (
    <div>
      <ToastContainer />
      <div className="container mt-4">
        <div className="card mx-auto lg:w-full shadow-lg">
          <div className="p-2 px-3 bg-gray-100 flex justify-between items-center">
            <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
              Allot Mark Headings
            </h3>
          </div>
          <div
            className="relative -top-2 mb-3 h-1 w-[97%] mx-auto"
            style={{ backgroundColor: "#C03078" }}
          ></div>
          <div className="card-body w-full md:w-[85%] mx-auto">
            {/* Select Class */}
            <div className="form-group flex justify-center gap-x-1 md:gap-x-6">
              <label className="w-1/4 pt-2 text-center font-semibold text-gray-700">
                Select Class <span className="text-red-500">*</span>
              </label>
              <div className="w-full relative">
                <Select
                  value={selectedClass}
                  onChange={handleClassChange}
                  placeholder="Select"
                  className="w-full md:w-[50%]  "
                  isClearable
                  options={classes.map((classObj) => ({
                    value: classObj.class_id,
                    label: classObj.name,
                  }))}
                />
                {classError && (
                  <p className="relative  -mb-3 text-red-500 text-sm">
                    {classError}
                  </p>
                )}
              </div>
            </div>
            {/* Select Subject */}
            <div className="form-group flex justify-center gap-x-1 md:gap-x-6 mt-4">
              <label className="w-1/4 pt-2 text-center font-semibold text-gray-700">
                Select Subject <span className="text-red-500">*</span>
              </label>
              <div className="w-full relative">
                <Select
                  value={selectedSubject}
                  onChange={handleSubjectChange}
                  placeholder="Select"
                  className="w-full md:w-[50%] "
                  isClearable
                  options={subjects.map((subject) => ({
                    value: subject?.sub_rc_master_id,
                    label: subject?.get_subjects_for_report_card?.name,
                  }))}
                />
                {subjectError && (
                  <p className="relative  -mb-3 text-red-500 text-sm">
                    {subjectError}
                  </p>
                )}
              </div>
            </div>
            {/* Select Exam */}
            <div className="form-group flex justify-center gap-x-1 md:gap-x-6 mt-4">
              <label className="w-1/4 pt-2 text-center font-semibold text-gray-700">
                Select Exam <span className="text-red-500">*</span>
              </label>
              <div className="w-full relative">
                <Select
                  value={selectedExam}
                  onChange={handleExamChange}
                  placeholder="Select"
                  className="w-full md:w-[50%] "
                  isClearable
                  options={exams.map((exam) => ({
                    value: exam.exam_id,
                    label: exam.name,
                  }))}
                />
                {examError && (
                  <p className="relative  -mb-3 text-red-500 text-sm">
                    {examError}
                  </p>
                )}
              </div>
            </div>

            {/* Marks Headings */}
            <div className="mt-4 shadow-md  w-full md:w-[70%] ml-0 md:ml-4">
              <div className="w-full overflow-x-auto">
                {/* Sticky Header */}
                <div className="w-full sticky top-0 bg-white  ">
                  <div className="grid grid-cols-2 text-start ">
                    <h6 className="text-gray-700 font-semibold py-2  pl-2">
                      Marks Headings <span className="text-red-500">*</span>
                    </h6>
                    <h6 className="text-gray-700 font-semibold py-2 text-center pr-4">
                      Highest Marks <span className="text-red-500">*</span>
                    </h6>
                  </div>
                </div>

                {/* Scrollable Content */}
                {marksHeadingsData.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto">
                    {marksHeadingsData.map((heading, index) => (
                      <div
                        key={heading.marks_headings_id}
                        className="grid grid-cols-2 w-full  text-center py-2"
                      >
                        <div className="flex items-center justify-start px-2">
                          {/* Checkbox with consistent alignment */}
                          <input
                            type="checkbox"
                            checked={heading.selected}
                            onChange={() => handleMarksHeadingChange(index)}
                            className="mr-2"
                          />
                          {/* Toggle checkbox when clicking on the label */}
                          <label
                            onClick={() => handleMarksHeadingChange(index)}
                            className="cursor-pointer"
                          >
                            {heading.name}
                          </label>
                        </div>

                        <div>
                          <input
                            type="text"
                            maxLength={3}
                            value={heading.highest_marks}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Allow only positive integers
                              if (/^\d*$/.test(value)) {
                                handleHighestMarksChange(index, value);
                              }
                            }}
                            disabled={!heading.selected}
                            placeholder="Highest marks"
                            className={`border p-1 bg-gray-100 shadow-md rounded w-full md:w-1/2 text-start ${
                              highestMarksError[index] ? "border-red-500" : ""
                            }`}
                          />
                          {/* Individual error message for each input */}
                          {highestMarksError[index] && (
                            <p className="h-1 text-red-500 text-xs ">
                              {highestMarksError[index]}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-blue-600">
                    No marks headings available
                  </p>
                )}

                {marksHeadingError && (
                  <p className=" text-center text-red-500 text-xs">
                    {marksHeadingError}
                  </p>
                )}
              </div>
            </div>

            {/* Save Button  is that fed edf */}
            <div className="flex justify-center mt-6">
              <button
                onClick={handleSave}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
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

export default AllotMarksHeadingTab;
