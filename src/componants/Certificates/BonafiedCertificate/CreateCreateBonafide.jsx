// import { useState, useEffect, useMemo } from "react";
// import axios from "axios";
// import Select from "react-select";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { useNavigate } from "react-router-dom";
// import { RxCross1 } from "react-icons/rx";

// const CreateCreateBonafide = () => {
//   const API_URL = import.meta.env.VITE_API_URL;
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [classesforForm, setClassesforForm] = useState([]);
//   const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
//   const [classIdForSearch, setClassIdForSearch] = useState(null);
//   const [selectedStudentId, setSelectedStudentId] = useState(null);
//   const [nameError, setNameError] = useState("");
//   const [nameErrorForClass, setNameErrorForClass] = useState("");
//   const [selectedClass, setSelectedClass] = useState(null);
//   const [parentInformation, setParentInformation] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [loadingForSearch, setLoadingForSearch] = useState(false);

//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     sr_no: "",
//     stud_name: "",
//     dob: "",
//     date: "",
//     father_name: "",
//     class_division: "",
//     professional_qual: "",
//     trained: "",
//     experience: "",
//     sex: "",
//     blood_group: "",
//     religion: "",
//     dob_words: "",
//     nationality: "",
//     phone: "",
//     email: "",
//     aadhar_card_no: "",
//     stud_id: "",

//     purpose: " ",
//     teacher_image_name: null,
//   });

//   const getYearInWords = (year) => {
//     if (year < 1000 || year > 9999) return "Year Out of Range"; // Optional range limit

//     const thousands = [
//       "",
//       "One Thousand",
//       "Two Thousand",
//       "Three Thousand",
//       "Four Thousand",
//       "Five Thousand",
//       "Six Thousand",
//       "Seven Thousand",
//       "Eight Thousand",
//       "Nine Thousand",
//     ];
//     const hundreds = [
//       "",
//       "One Hundred",
//       "Two Hundred",
//       "Three Hundred",
//       "Four Hundred",
//       "Five Hundred",
//       "Six Hundred",
//       "Seven Hundred",
//       "Eight Hundred",
//       "Nine Hundred",
//     ];
//     const units = [
//       "",
//       "One",
//       "Two",
//       "Three",
//       "Four",
//       "Five",
//       "Six",
//       "Seven",
//       "Eight",
//       "Nine",
//     ];
//     const teens = [
//       "Ten",
//       "Eleven",
//       "Twelve",
//       "Thirteen",
//       "Fourteen",
//       "Fifteen",
//       "Sixteen",
//       "Seventeen",
//       "Eighteen",
//       "Nineteen",
//     ];
//     const tens = [
//       "",
//       "",
//       "Twenty",
//       "Thirty",
//       "Forty",
//       "Fifty",
//       "Sixty",
//       "Seventy",
//       "Eighty",
//       "Ninety",
//     ];

//     const thousandDigit = Math.floor(year / 1000);
//     const hundredDigit = Math.floor((year % 1000) / 100);
//     const lastTwoDigits = year % 100;

//     const thousandsPart = thousands[thousandDigit];
//     const hundredsPart = hundreds[hundredDigit];

//     let lastTwoWords;
//     if (lastTwoDigits < 10) {
//       lastTwoWords = units[lastTwoDigits];
//     } else if (lastTwoDigits < 20) {
//       lastTwoWords = teens[lastTwoDigits - 10];
//     } else {
//       lastTwoWords = `${tens[Math.floor(lastTwoDigits / 10)]} ${
//         units[lastTwoDigits % 10]
//       }`;
//     }

//     return `${thousandsPart} ${hundredsPart} ${lastTwoWords}`.trim();
//   };

//   const getDayInWords = (day) => {
//     const dayWords = [
//       "First",
//       "Second",
//       "Third",
//       "Fourth",
//       "Fifth",
//       "Sixth",
//       "Seventh",
//       "Eighth",
//       "Ninth",
//       "Tenth",
//       "Eleventh",
//       "Twelfth",
//       "Thirteenth",
//       "Fourteenth",
//       "Fifteenth",
//       "Sixteenth",
//       "Seventeenth",
//       "Eighteenth",
//       "Nineteenth",
//       "Twentieth",
//       "Twenty-First",
//       "Twenty-Second",
//       "Twenty-Third",
//       "Twenty-Fourth",
//       "Twenty-Fifth",
//       "Twenty-Sixth",
//       "Twenty-Seventh",
//       "Twenty-Eighth",
//       "Twenty-Ninth",
//       "Thirtieth",
//       "Thirty-First",
//     ];
//     return dayWords[day];
//   };

//   const convertDateToWords = (dateString) => {
//     if (!dateString) return "";

//     const date = new Date(dateString);
//     const day = date.getDate();
//     const month = date.toLocaleString("en-US", { month: "long" });
//     const year = date.getFullYear();

//     return `${getDayInWords(day)} ${month} ${getYearInWords(year)}`;
//   };

//   // for form
//   const [errors, setErrors] = useState({});
//   const [backendErrors, setBackendErrors] = useState({});

//   // Maximum date for date_of_birth
//   const MAX_DATE = "2030-12-31";
//   const MIN_DATE = "1996-01-01";
//   // Get today's date in YYYY-MM-DD format
//   // Calculate today's date
//   const today = new Date().toISOString().split("T")[0];
//   // State for loading indicators
//   const [loadingClasses, setLoadingClasses] = useState(false);
//   const [loadingStudents, setLoadingStudents] = useState(false);

//   useEffect(() => {
//     // Fetch both classes and student names on component mount
//     fetchInitialDataAndStudents();
//   }, []);

//   const fetchInitialDataAndStudents = async () => {
//     try {
//       setLoadingClasses(true);
//       setLoadingStudents(true);

//       const token = localStorage.getItem("authToken");

//       // Fetch classes and students concurrently
//       const [classResponse, studentResponse] = await Promise.all([
//         axios.get(`${API_URL}/api/getallClassWithStudentCount`, {
//           headers: { Authorization: `Bearer ${token}` },
//         }),
//         axios.get(`${API_URL}/api/getStudentListBySectionData`, {
//           headers: { Authorization: `Bearer ${token}` },
//         }),
//       ]);

//       // Set the fetched data
//       setClassesforForm(classResponse.data || []);
//       setStudentNameWithClassId(studentResponse?.data?.data || []);
//     } catch (error) {
//       toast.error("Error fetching data.");
//     } finally {
//       // Stop loading for both dropdowns
//       setLoadingClasses(false);
//       setLoadingStudents(false);
//     }
//   };

//   const fetchStudentNameWithClassId = async (section_id = null) => {
//     try {
//       setLoadingStudents(true);

//       const params = section_id ? { section_id } : {};
//       const token = localStorage.getItem("authToken");

//       const response = await axios.get(
//         `${API_URL}/api/getStudentListBySectionData`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//           params,
//         }
//       );

//       setStudentNameWithClassId(response?.data?.data || []);
//     } catch (error) {
//       toast.error("Error fetching students.");
//     } finally {
//       setLoadingStudents(false);
//     }
//   };

//   const handleClassSelect = (selectedOption) => {
//     setSelectedClass(selectedOption);
//     setSelectedStudent(null);
//     setSelectedStudentId(null);
//     setClassIdForSearch(selectedOption?.value);
//     fetchStudentNameWithClassId(selectedOption?.value);
//   };

//   const handleStudentSelect = (selectedOption) => {
//     setNameError(""); // Reset student error on selection
//     setSelectedStudent(selectedOption);
//     setSelectedStudentId(selectedOption?.value);
//   };

//   // Dropdown options
//   const classOptions = useMemo(
//     () =>
//       classesforForm.map((cls) => ({
//         value: cls.section_id,
//         label: `${cls?.get_class?.name || ""} ${cls.name || ""} (${
//           cls.students_count || ""
//         })`,
//         key: `${cls.class_id}-${cls.section_id}`,
//       })),
//     [classesforForm]
//   );

//   const studentOptions = useMemo(
//     () =>
//       studentNameWithClassId.map((stu) => ({
//         value: stu.student_id,
//         label: `${stu?.first_name || ""} ${stu?.mid_name || ""} ${
//           stu?.last_name || ""
//         }`,
//       })),
//     [studentNameWithClassId]
//   );

//   const handleSearch = async () => {
//     // Reset error messages
//     setNameError("");
//     setNameErrorForClass("");
//     setErrors({}); // Clears all field-specific errors

//     if (!selectedStudent) {
//       setNameError("Please select Student Name.");
//       toast.error("Please select Student Name.!");
//       return;
//     }
//     // Validate if class and student are selected
//     // let hasError = false;
//     // if (!selectedClass) {
//     //   setNameErrorForClass("Please select a class.");
//     //   hasError = true;
//     // }
//     // if (!selectedStudent) {
//     //   setNameError("Please select a student.");
//     //   hasError = true;
//     // }

//     // If there are validation errors, exit the function
//     // if (hasError) return;
//     // Reset form data and selected values after successful submission
//     setFormData({
//       sr_no: "",
//       stud_name: "",
//       father_name: "",
//       dob: "",
//       dob_words: "",
//       date: "",
//       class_division: "",
//       purpose: "",
//       nationality: "",

//       // Add other fields here if needed
//     });
//     try {
//       setLoadingForSearch(true); // Start loading
//       const token = localStorage.getItem("authToken");
//       const response = await axios.get(
//         `${API_URL}/api/get_srnobonafide/${selectedStudentId}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       // Check if data was received and update the form state
//       if (response?.data?.data) {
//         const fetchedData = response?.data?.data; // Extract the data
//         setParentInformation(response?.data?.data); // Assuming response data contains form data

//         // Populate formData with the fetched data
//         setFormData({
//           sr_no: fetchedData.sr_no || "",
//           stud_name: `${fetchedData?.studentinformation?.first_name || ""} ${
//             fetchedData?.studentinformation?.mid_name || ""
//           } ${fetchedData?.studentinformation?.last_name || ""}`,
//           dob: fetchedData.studentinformation.dob || "",
//           dob_words: fetchedData.dobinwords || " ",

//           date: today || "",
//           father_name: fetchedData.parentinformation.father_name || "",
//           class_division:
//             `${fetchedData.classname.name}-${fetchedData.sectionname.name}` ||
//             "",
//           professional_qual: fetchedData.professional_qual || "",
//           trained: fetchedData.trained || "",
//           experience: fetchedData.experience || "",
//           sex: fetchedData.sex || "",
//           blood_group: fetchedData.blood_group || "",
//           religion: fetchedData.religion || "",
//           // address: fetchedData.studentinformation.address || "",
//           nationality: fetchedData.studentinformation.nationality || "",
//           phone: fetchedData.phone || "",
//           email: fetchedData.email || "",
//           aadhar_card_no: fetchedData.aadhar_card_no || "",
//           stud_id: fetchedData.studentinformation.student_id || "",
//           teacher_image_name: fetchedData.teacher_image_name || null,
//           special_sub: fetchedData.special_sub || "",
//         });
//       } else {
//         console.log("reponse", response.data.status);
//         if (response.data && response.data.status === 403) {
//           toast.error(
//             "Bonafide Certificate Already Generated. Please go to manage to download the Bonafide Certificate."
//           );
//         } else {
//           // Show a generic error message if the error is not a 403
//           toast.error("No data found for the selected student.");
//         }
//         // toast.error("No data found for the selected student.");
//       }
//     } catch (error) {
//       console.log("error is", error);
//       // toast.error(error.message);
//       // Check if response has a 403 status and the specific error message
//       console.log("error is", error.response);
//     } finally {
//       setLoadingForSearch(false);
//     }
//   };
//   // For FOrm
//   const validate = () => {
//     const newErrors = {};

//     // Validate name
//     if (!formData.stud_name) newErrors.stud_name = "This field is required";
//     else if (!/^[^\d].*/.test(formData.stud_name))
//       newErrors.stud_name = "Name should not start with a number";

//     // Validate name
//     if (!formData.father_name) newErrors.father_name = "This field is required";
//     else if (!/^[^\d].*/.test(formData.father_name))
//       newErrors.father_name = "Name should not start with a number";
//     // Validate academic qualifications (now a single text input)
//     if (!formData.class_division)
//       newErrors.class_division = "This field is required";
//     if (!formData.sr_no) newErrors.sr_no = "This field is required";

//     // Validate dob
//     if (!formData.dob) newErrors.dob = "This field is required";
//     if (!formData.father_name) newErrors.father_name = "This field is required";

//     // Validate date of joining
//     if (!formData.date) newErrors.date = "This field is required";

//     // Validate Employee Id
//     if (!formData.purpose) newErrors.purpose = "This field is required";
//     // Validate address
//     if (!formData.dob_words) newErrors.dob_words = "This field is required";
//     if (!formData.nationality) newErrors.nationality = "This field is required";

//     setErrors(newErrors);
//     return newErrors;
//   };
//   const handleChange = (event) => {
//     const { name, value } = event.target;
//     let newValue = value;

//     if (name === "dob") {
//       setFormData((prev) => ({
//         ...prev,
//         dob: value,
//         dob_words: convertDateToWords(value),
//       }));
//     } else {
//       setFormData((prev) => ({
//         ...prev,
//         [name]: value,
//       }));
//     }
//     // Update formData for the field
//     setFormData((prevData) => ({
//       ...prevData,
//       [name]: newValue,
//     }));

//     // Field-specific validation
//     let fieldErrors = {};

//     // Name validation
//     if (name === "stud_name") {
//       if (!newValue) fieldErrors.stud_name = "Name is required";
//       else if (/^\d/.test(newValue))
//         fieldErrors.stud_name = "Name should not start with a number";
//     }
//     if (name === "father_name") {
//       if (!newValue) fieldErrors.father_name = "Name is required";
//       else if (/^\d/.test(newValue))
//         fieldErrors.father_name = "Name should not start with a number";
//     }

//     // Academic Qualification validation
//     if (name === "class_division") {
//       if (!newValue)
//         fieldErrors.class_division = "Class and Division is required";
//     }

//     // Date of Birth validation
//     if (name === "dob") {
//       if (!newValue) fieldErrors.dob = "Date of Birth is required";
//     }
//     // serial number

//     if (name === "sr_no") {
//       if (!newValue) fieldErrors.sr_no = "Serial number is required";
//     }
//     if (name === "father_name") {
//       if (!newValue) fieldErrors.father_name = "Father Name is required";
//     }

//     // Date of Joining validation
//     if (name === "date") {
//       if (!newValue) fieldErrors.date = " Date is required";
//     }

//     // Employee ID validation
//     if (name === "purpose") {
//       if (!newValue) fieldErrors.purpose = "Purpose  is required";
//     }

//     // Address validation
//     if (name === "dob_words") {
//       if (!newValue)
//         fieldErrors.dob_words = "  Birth date in words is required";
//     }
//     if (name === "nationality") {
//       if (!newValue) fieldErrors.nationality = "Nationality is required";
//     }

//     // Update the errors state with the new field errors
//     setErrors((prevErrors) => ({
//       ...prevErrors,
//       [name]: fieldErrors[name],
//     }));
//   };

//   const formatDateString = (dateString) => {
//     if (!dateString) return "";
//     const [year, month, day] = dateString.split("-");
//     return `${year}-${month}-${day}`;
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     const validationErrors = validate();
//     const errorsToCheck = validationErrors || {};

//     if (Object.keys(errorsToCheck).length > 0) {
//       setErrors(errorsToCheck);
//       return;
//     }

//     const formattedFormData = {
//       ...formData,
//       dob: formatDateString(formData.dob),
//       date: formatDateString(formData.date),
//     };

//     try {
//       setLoading(true); // Start loading

//       const token = localStorage.getItem("authToken");
//       if (!token) {
//         throw new Error("No authentication token is found");
//       }

//       // Make an API call with the "blob" response type to download the PDF
//       const response = await axios.post(
//         `${API_URL}/api/save_pdfbonafide`,
//         formattedFormData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           responseType: "blob", // Set response type to blob to handle PDF data
//         }
//       );

//       if (response.status === 200) {
//         toast.success("Bonafide Certificate Created successfully!");

//         // Extract filename from Content-Disposition header
//         const contentDisposition = response.headers["content-disposition"];
//         let filename = "DownloadedFile.pdf"; // Fallback name

//         if (contentDisposition) {
//           const match = contentDisposition.match(/filename="(.+?)"/);
//           if (match && match[1]) {
//             filename = match[1];
//           }
//         }

//         // Create a URL for the PDF blob and initiate download
//         const pdfBlob = new Blob([response.data], { type: "application/pdf" });
//         const pdfUrl = URL.createObjectURL(pdfBlob);
//         const link = document.createElement("a");
//         link.href = pdfUrl;
//         link.download = filename;
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);

//         // Reset form data and selected values after successful submission
//         setFormData({
//           sr_no: "",
//           stud_name: "",
//           father_name: "",
//           dob: "",
//           dob_words: "",
//           date: "",
//           class_division: "",
//           purpose: "",
//           nationality: "",

//           // Add other fields here if needed
//         });
//         setSelectedClass(null); // Reset class selection
//         setSelectedStudent(null); // Reset student selection
//         setErrors({});
//         setBackendErrors({});
//         setTimeout(() => {
//           setParentInformation(null);
//         }, 3000);
//       }
//     } catch (error) {
//       console.error("Error:", error.response.data, error.response.sr_no);
//       toast.error("An error occurred while Creating the Bonafide Certificate.");

//       if (error.response && error.response) {
//         setBackendErrors(error.response || {});
//       } else {
//         toast.error(error.response.sr_no);
//       }
//     } finally {
//       setLoading(false); // Stop loading
//     }
//   };

//   // const handleSubmit = async (event) => {
//   //   event.preventDefault();
//   //   const validationErrors = validate();
//   //   const errorsToCheck = validationErrors || {};

//   //   if (Object.keys(errorsToCheck).length > 0) {
//   //     setErrors(errorsToCheck);
//   //     return;
//   //   }

//   //   const formattedFormData = {
//   //     ...formData,
//   //     dob: formatDateString(formData.dob),
//   //     admission_date: formatDateString(formData.admission_date),
//   //   };

//   //   try {
//   //     const token = localStorage.getItem("authToken");
//   //     if (!token) {
//   //       throw new Error("No authentication token is found");
//   //     }

//   //     // Make an API call with the "blob" response type to download the PDF
//   //     const response = await axios.post(
//   //       `${API_URL}/api/save_pdfbonafide`,
//   //       formattedFormData,
//   //       {
//   //         headers: {
//   //           Authorization: `Bearer ${token}`,
//   //         },
//   //         responseType: "blob", // Set response type to blob to handle PDF data
//   //       }
//   //     );

//   //     if (response.status === 200) {
//   //       toast.success("Student information updated successfully!");

//   //       // Create a URL for the PDF blob and initiate download
//   //       const pdfBlob = new Blob([response.data], { type: "application/pdf" });
//   //       const pdfUrl = URL.createObjectURL(pdfBlob);
//   //       const link = document.createElement("a");
//   //       link.href = pdfUrl;
//   //       link.download = "BonafideCertificate.pdf"; // PDF file name
//   //       document.body.appendChild(link);
//   //       link.click();
//   //       document.body.removeChild(link);

//   //       // setTimeout(() => {
//   //       //   navigate("/careTacker");
//   //       // }, 3000);
//   //     }
//   //   } catch (error) {
//   //     console.error("Error:", error.response.data, error.response.sr_no);
//   //     toast.error("An error occurred while updating the Student information.");

//   //     if (error.response && error.response) {
//   //       setBackendErrors(error.response || {});
//   //     } else {
//   //       toast.error(error.response.sr_no);
//   //     }
//   //   }
//   // };

//   return (
//     <div>
//       <ToastContainer />
//       <div className="     w-full md:container mt-4">
//         {/* Search Section */}
//         <div className=" w-[95%] border-3  flex justify-center flex-col md:flex-row gap-x-1  bg-white rounded-lg border border-gray-400 shadow-md mx-auto mt-10 p-6 ">
//           <div className="w-[99%] flex md:flex-row justify-between items-center">
//             <div className="w-full flex flex-col gap-y-2 md:gap-y-0 md:flex-row">
//               <div className="w-full gap-x-14 md:gap-x-6 md:justify-start my-1 md:my-4 flex md:flex-row">
//                 <label
//                   className="text-md mt-1.5 mr-1 md:mr-0"
//                   htmlFor="classSelect"
//                 >
//                   Class
//                 </label>
//                 <div className="w-full md:w-[50%]">
//                   <Select
//                     id="classSelect"
//                     value={selectedClass}
//                     onChange={handleClassSelect}
//                     options={classOptions}
//                     placeholder={
//                       loadingClasses ? "Loading classes..." : "Select"
//                     }
//                     isSearchable
//                     isClearable
//                     className="text-sm"
//                     isDisabled={loadingClasses}
//                   />
//                 </div>
//               </div>

//               <div className="w-full gap-x-6 relative left-0 md:-left-[5%] justify-between md:w-[98%] my-1 md:my-4 flex md:flex-row">
//                 <label
//                   className="md:w-[50%] text-md mt-1.5"
//                   htmlFor="studentSelect"
//                 >
//                   Student Name <span className="text-red-500">*</span>
//                 </label>
//                 <div className="w-full md:w-[80%]">
//                   <Select
//                     id="studentSelect"
//                     value={selectedStudent}
//                     onChange={handleStudentSelect}
//                     options={studentOptions}
//                     placeholder={
//                       loadingStudents ? "Loading students..." : "Select"
//                     }
//                     isSearchable
//                     isClearable
//                     className="text-sm"
//                     isDisabled={loadingStudents}
//                   />
//                   {nameError && (
//                     <div className="h-8 relative ml-1 text-danger text-xs">
//                       {nameError}
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <button
//                 type="search"
//                 onClick={handleSearch}
//                 style={{ backgroundColor: "#2196F3" }}
//                 className={`my-1 md:my-4 btn h-10 w-18 md:w-auto btn-primary text-white font-bold py-1 border-1 border-blue-500 px-4 rounded ${
//                   loadingForSearch ? "opacity-50 cursor-not-allowed" : ""
//                 }`}
//                 disabled={loadingForSearch}
//               >
//                 {loadingForSearch ? (
//                   <span className="flex items-center">
//                     <svg
//                       className="animate-spin h-4 w-4 mr-2 text-white"
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                     >
//                       <circle
//                         className="opacity-25"
//                         cx="12"
//                         cy="12"
//                         r="10"
//                         stroke="currentColor"
//                         strokeWidth="4"
//                       ></circle>
//                       <path
//                         className="opacity-75"
//                         fill="currentColor"
//                         d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
//                       ></path>
//                     </svg>
//                     Loading...
//                   </span>
//                 ) : (
//                   "Search"
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Form Section - Displayed when parentInformation is fetched */}
//         {parentInformation && (
//           // <div className="container mx-auto p-4 ">
//           <div className=" w-full  md:container mx-auto py-4 p-4 px-4  ">
//             <div className="card  px-3 rounded-md ">
//               {/* <div className="card p-4 rounded-md "> */}
//               <div className=" card-header mb-4 flex justify-between items-center ">
//                 <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
//                   Student Information
//                 </h5>
//               </div>
//               <div
//                 className=" relative w-full   -top-6 h-1  mx-auto bg-red-700"
//                 style={{
//                   backgroundColor: "#C03078",
//                 }}
//               ></div>
//               <p className=" text-[.9em] md:absolute md:right-5  md:top-[14%]   text-gray-500 ">
//                 <span className="text-red-500 ">*</span>indicates mandatory
//                 information
//               </p>
//               <form
//                 onSubmit={handleSubmit}
//                 className="  border-1 overflow-x-hidden shadow-md p-2 bg-gray-100 mb-4"
//               >
//                 <div className=" flex flex-col gap-4 md:grid  md:grid-cols-3 md:gap-x-14 md:mx-10 gap-y-1 pt-4 pb-4">
//                   <div className=" ">
//                     <label
//                       htmlFor="sr_no"
//                       className="block font-bold  text-xs mb-2"
//                     >
//                       Sr No. <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       maxLength={100}
//                       id="sr_no"
//                       name="sr_no"
//
//                       value={formData.sr_no}
//                       onChange={handleChange}
//                       className="block  border w-full border-gray-900 rounded-md py-1 px-3  bg-gray-200 outline-none shadow-inner"
//                     />
//                     {backendErrors.sr_no && (
//                       <span className="text-red-500 text-xs ml-2">
//                         {backendErrors.sr_no}
//                       </span>
//                     )}
//                     {errors.sr_no && (
//                       <div className="text-red-500 text-xs ml-2">
//                         {errors.sr_no}
//                       </div>
//                     )}
//                   </div>
//                   <div>
//                     <label
//                       htmlFor="date_of_joining"
//                       className="block font-bold  text-xs mb-2"
//                     >
//                       Issue Date <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="date"
//                       id="date_of_joining"
//                       // max={today}
//                       name="date"
//                       value={formData.date}
//                       onChange={handleChange}
//                       className="input-field block w-full border border-gray-900 rounded-md py-1 px-3 bg-white shadow-inner"
//                     />
//                     {errors.date && (
//                       <span className="text-red-500 text-xs ml-2">
//                         {errors.date}
//                       </span>
//                     )}
//                   </div>
//                   <div className=" ">
//                     <label
//                       htmlFor="staffName"
//                       className="block font-bold  text-xs mb-2"
//                     >
//                       Student Name <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       maxLength={200}
//                       id="staffName"
//                       name="stud_name"
//                       value={formData.stud_name}
//                       onChange={handleChange}
//
//                       className="block  border w-full border-gray-900 rounded-md py-1 px-3  bg-gray-200 outline-none shadow-inner"
//                     />
//                     {errors.stud_name && (
//                       <div className="text-red-500 text-xs ml-2">
//                         {errors.stud_name}
//                       </div>
//                     )}
//                   </div>

//                   <div>
//                     <label
//                       htmlFor="father_name"
//                       className="block font-bold  text-xs mb-2"
//                     >
//                       Father's Name <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       maxLength={50}
//                       id="father_name"
//                       name="father_name"
//                       value={formData.father_name}
//                       onChange={handleChange}
//
//                       className="block  border w-full border-gray-900 rounded-md py-1 px-3  bg-gray-200 outline-none shadow-inner"
//                     />
//                     {errors.father_name && (
//                       <div className="text-red-500 text-xs ml-2">
//                         {errors.father_name}
//                       </div>
//                     )}
//                   </div>
//                   <div>
//                     <label
//                       htmlFor="dob"
//                       className="block font-bold text-xs mb-2"
//                     >
//                       Date of Birth <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="date"
//                       id="dob"
//                       min={MIN_DATE} // Set minimum date
//                       max={MAX_DATE} // Set maximum date to today
//                       name="dob"
//
//                       value={formData.dob}
//                       onChange={handleChange}
//                       className="block  border w-full border-gray-900 rounded-md py-1 px-3  bg-gray-200 outline-none shadow-inner"
//                     />
//                     {errors.dob && (
//                       <div className="text-red-500 text-xs ml-2">
//                         {errors.dob}
//                       </div>
//                     )}
//                   </div>

//                   <div>
//                     <label
//                       htmlFor="dob_words"
//                       className="block font-bold  text-xs mb-2"
//                     >
//                       Birth date in words{" "}
//                       <span className="text-red-500">*</span>
//                     </label>
//                     <textarea
//                       type="text"
//                       maxLength={100}
//                       id="dob_words"
//                       name="dob_words"
//
//                       value={formData.dob_words}
//                       onChange={handleChange}
//                       className="block  border w-full border-gray-900 rounded-md py-1 px-3  bg-gray-200 outline-none shadow-inner"
//                     />
//                     {errors.dob_words && (
//                       <div className="text-red-500 text-xs ml-2">
//                         {errors.dob_words}
//                       </div>
//                     )}
//                   </div>

//                   <div>
//                     <label
//                       htmlFor="class_division"
//                       className="block font-bold  text-xs mb-2"
//                     >
//                       Class/Divsion <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       // maxLength={12}
//                       id="class_division"
//
//                       name="class_division"
//                       value={formData.class_division}
//                       onChange={handleChange} // Using the handleChange function to update formData and validate
//                       className="input-field block w-full outline-none border border-gray-900 rounded-md py-1 px-3 bg-gray-200 shadow-inner"
//                     />
//                     {errors.class_division && (
//                       <span className="text-red-500 text-xs ml-2">
//                         {errors.class_division}
//                       </span>
//                     )}
//                   </div>

//                   <div>
//                     <label
//                       htmlFor="employeeId"
//                       className="block font-bold  text-xs mb-2"
//                     >
//                       Purpose <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="tel"
//                       maxLength={50}
//                       id="employeeId"
//                       name="purpose"
//                       value={formData.purpose}
//                       onChange={handleChange}
//                       className="input-field block w-full border border-gray-900 rounded-md py-1 px-3 bg-white shadow-inner"
//                     />
//                     {errors.purpose && (
//                       <span className="text-red-500 text-xs ml-2">
//                         {errors.purpose}
//                       </span>
//                     )}
//                   </div>
//                   <div>
//                     <label
//                       htmlFor="Nationality"
//                       className="block font-bold  text-xs mb-2"
//                     >
//                       Nationality <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="tel"
//                       maxLength={20}
//                       id="Nationality"
//                       name="nationality"
//                       value={formData.nationality}
//                       onChange={handleChange}
//
//                       className="block  border w-full border-gray-900 rounded-md py-1 px-3  bg-gray-200 outline-none shadow-inner"
//                     />
//                     {errors.nationality && (
//                       <span className="text-red-500 text-xs ml-2">
//                         {errors.nationality}
//                       </span>
//                     )}
//                   </div>

//                   <div className="col-span-3 text-right">
//                     <button
//                       type="submit"
//                       onClick={handleSubmit}
//                       style={{ backgroundColor: "#2196F3" }}
//                       className={`text-white font-bold py-1 border-1 border-blue-500 px-4 rounded ${
//                         loading ? "opacity-50 cursor-not-allowed" : ""
//                       }`}
//                       disabled={loading}
//                     >
//                       {loading ? (
//                         <span className="flex items-center">
//                           <svg
//                             className="animate-spin h-4 w-4 mr-2 text-white"
//                             xmlns="http://www.w3.org/2000/svg"
//                             fill="none"
//                             viewBox="0 0 24 24"
//                           >
//                             <circle
//                               className="opacity-25"
//                               cx="12"
//                               cy="12"
//                               r="10"
//                               stroke="currentColor"
//                               strokeWidth="4"
//                             ></circle>
//                             <path
//                               className="opacity-75"
//                               fill="currentColor"
//                               d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
//                             ></path>
//                           </svg>
//                           Loading...
//                         </span>
//                       ) : (
//                         "Generate PDF"
//                       )}
//                     </button>
//                   </div>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CreateCreateBonafide;
// for Hscs and sacs mai dono ke liye
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";

const CreateCreateBonafide = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [classesforForm, setClassesforForm] = useState([]);
  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
  const [classIdForSearch, setClassIdForSearch] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [nameError, setNameError] = useState("");
  const [nameErrorForClass, setNameErrorForClass] = useState("");
  const [selectedClass, setSelectedClass] = useState(null);
  const [parentInformation, setParentInformation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingForSearch, setLoadingForSearch] = useState(false);
  const getCookie = (name) => {
    const cookieValue = document.cookie
      .split("; ")
      .find((row) => row.startsWith(name + "="));
    return cookieValue ? cookieValue.split("=")[1] : null;
  };
  const sortNameCookie = getCookie("short_name");

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    sr_no: "",
    stud_name: "",
    dob: "",
    date: "",
    father_name: "",
    class_division: "",
    professional_qual: "",
    trained: "",
    experience: "",
    sex: "",
    blood_group: "",
    religion: "",
    dob_words: "",
    nationality: "",
    phone: "",
    email: "",
    aadhar_card_no: "",
    stud_id: "",

    purpose: " ",
    teacher_image_name: null,
    reg_no: "",
    caste: "",
    subcaste: "",
    birth_place: "",
    state: "",
  });

  const getYearInWords = (year) => {
    if (year < 1000 || year > 9999) return "Year Out of Range"; // Optional range limit

    const thousands = [
      "",
      "One Thousand",
      "Two Thousand",
      "Three Thousand",
      "Four Thousand",
      "Five Thousand",
      "Six Thousand",
      "Seven Thousand",
      "Eight Thousand",
      "Nine Thousand",
    ];
    const hundreds = [
      "",
      "One Hundred",
      "Two Hundred",
      "Three Hundred",
      "Four Hundred",
      "Five Hundred",
      "Six Hundred",
      "Seven Hundred",
      "Eight Hundred",
      "Nine Hundred",
    ];
    const units = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    const thousandDigit = Math.floor(year / 1000);
    const hundredDigit = Math.floor((year % 1000) / 100);
    const lastTwoDigits = year % 100;

    const thousandsPart = thousands[thousandDigit];
    const hundredsPart = hundreds[hundredDigit];

    let lastTwoWords;
    if (lastTwoDigits < 10) {
      lastTwoWords = units[lastTwoDigits];
    } else if (lastTwoDigits < 20) {
      lastTwoWords = teens[lastTwoDigits - 10];
    } else {
      lastTwoWords = `${tens[Math.floor(lastTwoDigits / 10)]} ${
        units[lastTwoDigits % 10]
      }`;
    }

    return `${thousandsPart} ${hundredsPart} ${lastTwoWords}`.trim();
  };

  const getDayInWords = (day) => {
    const dayWords = [
      "First",
      "Second",
      "Third",
      "Fourth",
      "Fifth",
      "Sixth",
      "Seventh",
      "Eighth",
      "Ninth",
      "Tenth",
      "Eleventh",
      "Twelfth",
      "Thirteenth",
      "Fourteenth",
      "Fifteenth",
      "Sixteenth",
      "Seventeenth",
      "Eighteenth",
      "Nineteenth",
      "Twentieth",
      "Twenty-First",
      "Twenty-Second",
      "Twenty-Third",
      "Twenty-Fourth",
      "Twenty-Fifth",
      "Twenty-Sixth",
      "Twenty-Seventh",
      "Twenty-Eighth",
      "Twenty-Ninth",
      "Thirtieth",
      "Thirty-First",
    ];
    return dayWords[day];
  };

  const convertDateToWords = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();

    return `${getDayInWords(day)} ${month} ${getYearInWords(year)}`;
  };

  // for form
  const [errors, setErrors] = useState({});
  const [backendErrors, setBackendErrors] = useState({});

  // Maximum date for date_of_birth
  const MAX_DATE = "2030-12-31";
  const MIN_DATE = "1996-01-01";
  // Get today's date in YYYY-MM-DD format
  // Calculate today's date
  const today = new Date().toISOString().split("T")[0];
  // State for loading indicators
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    // Fetch both classes and student names on component mount
    fetchInitialDataAndStudents();
  }, []);

  const fetchInitialDataAndStudents = async () => {
    try {
      setLoadingClasses(true);
      setLoadingStudents(true);

      const token = localStorage.getItem("authToken");

      // Fetch classes and students concurrently
      const [classResponse, studentResponse] = await Promise.all([
        axios.get(`${API_URL}/api/getallClassWithStudentCount`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/getStudentListBySectionData`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Set the fetched data
      setClassesforForm(classResponse.data || []);
      setStudentNameWithClassId(studentResponse?.data?.data || []);
    } catch (error) {
      toast.error("Error fetching data.");
    } finally {
      // Stop loading for both dropdowns
      setLoadingClasses(false);
      setLoadingStudents(false);
    }
  };

  const fetchStudentNameWithClassId = async (section_id = null) => {
    try {
      setLoadingStudents(true);

      const params = section_id ? { section_id } : {};
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/getStudentListBySectionData`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      setStudentNameWithClassId(response?.data?.data || []);
    } catch (error) {
      toast.error("Error fetching students.");
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleClassSelect = (selectedOption) => {
    setSelectedClass(selectedOption);
    setSelectedStudent(null);
    setSelectedStudentId(null);
    setClassIdForSearch(selectedOption?.value);
    fetchStudentNameWithClassId(selectedOption?.value);
  };

  const handleStudentSelect = (selectedOption) => {
    setNameError(""); // Reset student error on selection
    setSelectedStudent(selectedOption);
    setSelectedStudentId(selectedOption?.value);
  };

  // Dropdown options
  const classOptions = useMemo(
    () =>
      classesforForm.map((cls) => ({
        value: cls.section_id,
        label: `${cls?.get_class?.name || ""} ${cls.name || ""} (${
          cls.students_count || ""
        })`,
        key: `${cls.class_id}-${cls.section_id}`,
      })),
    [classesforForm]
  );

  const studentOptions = useMemo(
    () =>
      studentNameWithClassId.map((stu) => ({
        value: stu.student_id,
        label: `${stu?.first_name || ""} ${stu?.mid_name || ""} ${
          stu?.last_name || ""
        }`,
      })),
    [studentNameWithClassId]
  );

  // const handleSearch = async () => {
  //   // Reset error messages
  //   setNameError("");
  //   setNameErrorForClass("");
  //   setErrors({}); // Clears all field-specific errors
  //   console.log("sortname in the bonafide certificate", sortNameCookie);
  //   if (!selectedStudent) {
  //     setNameError("Please select Student Name.");
  //     toast.error("Please select Student Name.!");
  //     return;
  //   }
  //   // Validate if class and student are selected
  //   // let hasError = false;
  //   // if (!selectedClass) {
  //   //   setNameErrorForClass("Please select a class.");
  //   //   hasError = true;
  //   // }
  //   // if (!selectedStudent) {
  //   //   setNameError("Please select a student.");
  //   //   hasError = true;
  //   // }

  //   // If there are validation errors, exit the function
  //   // if (hasError) return;
  //   // Reset form data and selected values after successful submission
  //   setFormData({
  //     sr_no: "",
  //     stud_name: "",
  //     father_name: "",
  //     dob: "",
  //     dob_words: "",
  //     date: "",
  //     class_division: "",
  //     purpose: "",
  //     nationality: "",
  //     reg_no: "",
  //     religion: "",
  //     caste: "",
  //     subcaste: "",
  //     birth_place: "",
  //     state: "",
  //     permant_add: "",
  //     // Add other fields here if needed
  //   });
  //   try {
  //     setLoadingForSearch(true); // Start loading
  //     const token = localStorage.getItem("authToken");
  //     const response = await axios.get(
  //       `${API_URL}/api/get_srnobonafide/${selectedStudentId}`,
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       }
  //     );

  //     // Check if data was received and update the form state
  //     if (response?.data?.data) {
  //       const fetchedData = response?.data?.data; // Extract the data
  //       setParentInformation(response?.data?.data); // Assuming response data contains form data

  //       // Populate formData with the fetched data
  //       setFormData({
  //         sr_no: fetchedData.sr_no || "",
  //         stud_name: `${fetchedData?.studentinformation?.first_name || ""} ${
  //           fetchedData?.studentinformation?.mid_name || ""
  //         } ${fetchedData?.studentinformation?.last_name || ""}`,
  //         dob: fetchedData.studentinformation.dob || "",
  //         dob_words: fetchedData.dobinwords || " ",

  //         date: today || "",
  //         father_name: fetchedData.parentinformation.father_name || "",
  //         class_division:
  //           `${fetchedData.classname.name}-${fetchedData.sectionname.name}` ||
  //           "",
  //         professional_qual: fetchedData.professional_qual || "",
  //         trained: fetchedData.trained || "",
  //         experience: fetchedData.experience || "",
  //         sex: fetchedData.sex || "",
  //         blood_group: fetchedData.blood_group || "",
  //         religion: fetchedData.religion || "",
  //         // address: fetchedData.studentinformation.address || "",
  //         nationality: fetchedData.studentinformation.nationality || "",
  //         phone: fetchedData.phone || "",
  //         email: fetchedData.email || "",
  //         aadhar_card_no: fetchedData.aadhar_card_no || "",
  //         stud_id: fetchedData.studentinformation.student_id || "",
  //         teacher_image_name: fetchedData.teacher_image_name || null,
  //         special_sub: fetchedData.special_sub || "",
  //       });
  //     } else {
  //       console.log("reponse", response.data.status);
  //       if (response.data && response.data.status === 403) {
  //         toast.error(
  //           "Bonafide Certificate Already Generated. Please go to manage to download the Bonafide Certificate."
  //         );
  //       } else {
  //         // Show a generic error message if the error is not a 403
  //         toast.error("No data found for the selected student.");
  //       }
  //       // toast.error("No data found for the selected student.");
  //     }
  //   } catch (error) {
  //     console.log("error is", error);
  //     // toast.error(error.message);
  //     // Check if response has a 403 status and the specific error message
  //     console.log("error is", error.response);
  //   } finally {
  //     setLoadingForSearch(false);
  //   }
  // };
  // For FOrm

  const handleSearch = async () => {
    setNameError("");
    setNameErrorForClass("");
    setErrors({});

    if (!selectedStudent) {
      setNameError("Please select Student Name.");
      toast.error("Please select Student Name.!");
      return;
    }

    // Reset form data
    setFormData({
      sr_no: "",
      stud_name: "",
      father_name: "",
      dob: "",
      dob_words: "",
      date: "",
      class_division: "",
      purpose: "",
      nationality: "",
      reg_no: "",
      religion: "",
      caste: "",
      subcaste: "",
      birth_place: "",
      state: "",
      permant_add: "",
      mother_name: "",
      stud_id: "",
    });

    try {
      setLoadingForSearch(true);
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/api/get_srnobonafide/${selectedStudentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response?.data?.data) {
        const data = response.data.data;
        const student = data.studentinformation;
        const parent = data.parentinformation;
        const className = data.classname?.name || "";
        const sectionName = data.sectionname?.name || "";
        const fullName = `${student?.first_name || ""} ${
          student?.mid_name || ""
        } ${student?.last_name || ""}`.trim();

        // Update parent info state if needed
        setParentInformation(data);

        const baseFormData = {
          sr_no: data.sr_no || "",
          date: data.date || today,
          stud_name: fullName,
          father_name: parent?.father_name || "",
          mother_name: "",
          dob: student?.dob || "",
          dob_words: data?.dobinwords || "",
          class_division: `${className}-${sectionName}`,
          purpose: "",
          nationality: student?.nationality || "",
          reg_no: "",
          religion: "",
          caste: "",
          subcaste: "",
          birth_place: "",
          state: "",
          permant_add: "",
          stud_id: student?.student_id || "",
        };

        // Conditional fields for HSCS / SACS
        if (["HSCS", "SACS"].includes(sortNameCookie)) {
          baseFormData.reg_no = student?.reg_no || "";
          baseFormData.mother_name = parent?.mother_name || "";
          baseFormData.religion = student?.religion || "";
          baseFormData.caste = student?.caste || "";
          baseFormData.subcaste = student?.subcaste || "";
          baseFormData.birth_place = student?.birth_place || "";
          baseFormData.state = student?.state || "";
          baseFormData.permant_add = student?.permant_add || "";
        }

        setFormData(baseFormData);
      } else {
        if (response.data?.status === 403) {
          toast.error(
            "Bonafide Certificate Already Generated. Please go to manage to download the Bonafide Certificate."
          );
        } else {
          toast.error("No data found for the selected student.");
        }
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("An error occurred while fetching student data.");
    } finally {
      setLoadingForSearch(false);
    }
  };

  // const validate = () => {
  //   const newErrors = {};

  //   // Validate name
  //   if (!formData.stud_name) newErrors.stud_name = "This field is required";
  //   else if (!/^[^\d].*/.test(formData.stud_name))
  //     newErrors.stud_name = "Name should not start with a number";

  //   // Validate name
  //   if (!formData.father_name) newErrors.father_name = "This field is required";
  //   else if (!/^[^\d].*/.test(formData.father_name))
  //     newErrors.father_name = "Name should not start with a number";
  //   // Validate academic qualifications (now a single text input)
  //   if (!formData.class_division)
  //     newErrors.class_division = "This field is required";
  //   if (!formData.sr_no) newErrors.sr_no = "This field is required";

  //   // Validate dob
  //   if (!formData.dob) newErrors.dob = "This field is required";
  //   if (!formData.father_name) newErrors.father_name = "This field is required";

  //   // Validate date of joining
  //   if (!formData.date) newErrors.date = "This field is required";

  //   // Validate Employee Id
  //   if (!formData.purpose) newErrors.purpose = "This field is required";
  //   // Validate address
  //   if (!formData.dob_words) newErrors.dob_words = "This field is required";
  //   if (!formData.nationality) newErrors.nationality = "This field is required";
  //   if (sortNameCookie === "HSCS") {
  //     if (!formData.reg_no) errors.reg_no = "Required";
  //     if (!formData.mother_name) errors.mother_name = "Required";
  //     if (!formData.religion) errors.religion = "Required";
  //     if (!formData.caste) errors.caste = "Required";
  //     if (!formData.subcaste) errors.subcaste = "Required";
  //     if (!formData.birth_place) errors.birth_place = "Required";
  //     if (!formData.state) errors.state = "Required";
  //     if (!formData.permant_add) errors.permant_add = "Required";
  //   }

  //   setErrors(newErrors);
  //   return newErrors;
  // };

  // const handleChange = (event) => {
  //   const { name, value } = event.target;
  //   let newValue = value;

  //   if (name === "dob") {
  //     setFormData((prev) => ({
  //       ...prev,
  //       dob: value,
  //       dob_words: convertDateToWords(value),
  //     }));
  //   } else {
  //     setFormData((prev) => ({
  //       ...prev,
  //       [name]: value,
  //     }));
  //   }
  //   // Update formData for the field
  //   setFormData((prevData) => ({
  //     ...prevData,
  //     [name]: newValue,
  //   }));

  //   // Field-specific validation
  //   let fieldErrors = {};

  //   // Name validation
  //   if (name === "stud_name") {
  //     if (!newValue) fieldErrors.stud_name = "Name is required";
  //     else if (/^\d/.test(newValue))
  //       fieldErrors.stud_name = "Name should not start with a number";
  //   }
  //   if (name === "father_name") {
  //     if (!newValue) fieldErrors.father_name = "Name is required";
  //     else if (/^\d/.test(newValue))
  //       fieldErrors.father_name = "Name should not start with a number";
  //   }

  //   // Academic Qualification validation
  //   if (name === "class_division") {
  //     if (!newValue)
  //       fieldErrors.class_division = "Class and Division is required";
  //   }

  //   // Date of Birth validation
  //   if (name === "dob") {
  //     if (!newValue) fieldErrors.dob = "Date of Birth is required";
  //   }
  //   // serial number

  //   if (name === "sr_no") {
  //     if (!newValue) fieldErrors.sr_no = "Serial number is required";
  //   }
  //   if (name === "father_name") {
  //     if (!newValue) fieldErrors.father_name = "Father Name is required";
  //   }

  //   // Date of Joining validation
  //   if (name === "date") {
  //     if (!newValue) fieldErrors.date = " Date is required";
  //   }

  //   // Employee ID validation
  //   if (name === "purpose") {
  //     if (!newValue) fieldErrors.purpose = "Purpose  is required";
  //   }

  //   // Address validation
  //   if (name === "dob_words") {
  //     if (!newValue)
  //       fieldErrors.dob_words = "  Birth date in words is required";
  //   }
  //   if (name === "nationality") {
  //     if (!newValue) fieldErrors.nationality = "Nationality is required";
  //   }

  //   // Update the errors state with the new field errors
  //   setErrors((prevErrors) => ({
  //     ...prevErrors,
  //     [name]: fieldErrors[name],
  //   }));
  // };
  // ---------- Validation Function ----------
  const validate = () => {
    const errors = {};
    const isHSCS = sortNameCookie === "HSCS";

    // Basic validations (always required)
    if (!formData.sr_no) errors.sr_no = "This field is required";
    if (!formData.stud_name) errors.stud_name = "This field is required";
    if (!formData.father_name) errors.father_name = "This field is required";
    if (!formData.date) errors.date = "This field is required";
    if (!formData.dob) errors.dob = "This field is required";
    if (!formData.dob_words) errors.dob_words = "This field is required";
    if (!formData.class_division)
      errors.class_division = "This field is required";
    if (!formData.purpose) errors.purpose = "This field is required";
    if (!formData.nationality) errors.nationality = "This field is required";

    // Extra validations for HSCS
    if (isHSCS) {
      if (!formData.reg_no) errors.reg_no = "This field is required";
      if (!formData.mother_name) errors.mother_name = "This field is required";
      if (!formData.birth_place) errors.birth_place = "This field is required";
      if (!formData.state) errors.state = "This field is required";
      if (!formData.permant_add) errors.permant_add = "This field is required";
      // religion, caste, subcaste are optional
    }

    // Additional field-specific checks
    if (formData.stud_name && /^\d/.test(formData.stud_name)) {
      errors.stud_name = "Name should not start with a number";
    }
    if (formData.father_name && /^\d/.test(formData.father_name)) {
      errors.father_name = "Name should not start with a number";
    }

    return errors;
  };

  // ---------- Handle Change / On Field Update ----------
  const handleChange = (event) => {
    const { name, value } = event.target;
    const isHSCS = sortNameCookie === "HSCS";

    // Update form data
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // If updating dob, also compute dob_words
      ...(name === "dob" ? { dob_words: convertDateToWords(value) } : {}),
    }));

    // Validate this single field
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };

      // Clear the error for this field if value is ok
      const trimmed = (value || "").trim();

      switch (name) {
        case "stud_name":
          if (!trimmed) newErrors.stud_name = "This field is required";
          else if (/^\d/.test(trimmed))
            newErrors.stud_name = "Name should not start with a number";
          else delete newErrors.stud_name;
          break;

        case "father_name":
          if (!trimmed) newErrors.father_name = "This field is required";
          else if (/^\d/.test(trimmed))
            newErrors.father_name = "Name should not start with a number";
          else delete newErrors.father_name;
          break;

        case "class_division":
          if (!trimmed) newErrors.class_division = "This field is required";
          else delete newErrors.class_division;
          break;

        case "sr_no":
          if (!trimmed) newErrors.sr_no = "This field is required";
          else delete newErrors.sr_no;
          break;

        case "dob":
          if (!trimmed) newErrors.dob = "This field is required";
          else delete newErrors.dob;
          break;

        case "date":
          if (!trimmed) newErrors.date = "This field is required";
          else delete newErrors.date;
          break;

        case "dob_words":
          if (!trimmed) newErrors.dob_words = "This field is required";
          else delete newErrors.dob_words;
          break;

        case "nationality":
          if (!trimmed) newErrors.nationality = "This field is required";
          else delete newErrors.nationality;
          break;

        case "purpose":
          if (!isHSCS) {
            if (!trimmed) newErrors.purpose = "This field is required";
            else delete newErrors.purpose;
          } else {
            // If HSCS, clear any existing purpose error
            delete newErrors.purpose;
          }
          break;

        // HSCS fields
        case "reg_no":
          if (isHSCS) {
            if (!trimmed) newErrors.reg_no = "This field is required";
            else delete newErrors.reg_no;
          }
          break;

        case "mother_name":
          if (isHSCS) {
            if (!trimmed) newErrors.mother_name = "This field is required";
            else delete newErrors.mother_name;
          }
          break;

        case "birth_place":
          if (isHSCS) {
            if (!trimmed) newErrors.birth_place = "This field is required";
            else delete newErrors.birth_place;
          }
          break;

        case "state":
          if (isHSCS) {
            if (!trimmed) newErrors.state = "This field is required";
            else delete newErrors.state;
          }
          break;

        case "permant_add":
          if (isHSCS) {
            if (!trimmed) newErrors.permant_add = "This field is required";
            else delete newErrors.permant_add;
          }
          break;

        default:
          // No specific validation for other optional fields
          break;
      }

      return newErrors;
    });
  };

  const formatDateString = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validate();
    const errorsToCheck = validationErrors || {};

    if (Object.keys(errorsToCheck).length > 0) {
      setErrors(errorsToCheck);
      return;
    }

    const formattedFormData = {
      ...formData,
      dob: formatDateString(formData.dob),
      date: formatDateString(formData.date),
    };

    try {
      setLoading(true); // Start loading

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token is found");
      }

      // Make an API call with the "blob" response type to download the PDF
      const response = await axios.post(
        `${API_URL}/api/save_pdfbonafide`,
        formattedFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob", // Set response type to blob to handle PDF data
        }
      );

      if (response.status === 200) {
        toast.success("Bonafide Certificate Created successfully!");

        // Extract filename from Content-Disposition header
        const contentDisposition = response.headers["content-disposition"];
        let filename = "DownloadedFile.pdf"; // Fallback name

        if (contentDisposition) {
          const match = contentDisposition.match(/filename="(.+?)"/);
          if (match && match[1]) {
            filename = match[1];
          }
        }

        // Create a URL for the PDF blob and initiate download
        const pdfBlob = new Blob([response.data], { type: "application/pdf" });
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = pdfUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Reset form data and selected values after successful submission
        setFormData({
          sr_no: "",
          stud_name: "",
          father_name: "",
          dob: "",
          dob_words: "",
          date: "",
          class_division: "",
          purpose: "",
          nationality: "",

          // Add other fields here if needed
        });
        setSelectedClass(null); // Reset class selection
        setSelectedStudent(null); // Reset student selection
        setErrors({});
        setBackendErrors({});
        setTimeout(() => {
          setParentInformation(null);
        }, 3000);
      }
    } catch (error) {
      console.error("Error:", error.response.data, error.response.sr_no);
      toast.error("An error occurred while Creating the Bonafide Certificate.");

      if (error.response && error.response) {
        setBackendErrors(error.response || {});
      } else {
        toast.error(error.response.sr_no);
      }
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div>
      <ToastContainer />
      <div className="     w-full md:container mt-4">
        {/* Search Section */}
        <div className=" w-[95%] border-3  flex justify-center flex-col md:flex-row gap-x-1  bg-white rounded-lg border border-gray-400 shadow-md mx-auto mt-10 p-6 ">
          <div className="w-[99%] flex md:flex-row justify-between items-center">
            <div className="w-full flex flex-col gap-y-2 md:gap-y-0 md:flex-row">
              <div className="w-full gap-x-14 md:gap-x-6 md:justify-start my-1 md:my-4 flex md:flex-row">
                <label
                  className="text-md mt-1.5 mr-1 md:mr-0"
                  htmlFor="classSelect"
                >
                  Class
                </label>
                <div className="w-full md:w-[50%]">
                  <Select
                    id="classSelect"
                    value={selectedClass}
                    onChange={handleClassSelect}
                    options={classOptions}
                    placeholder={
                      loadingClasses ? "Loading classes..." : "Select"
                    }
                    isSearchable
                    isClearable
                    className="text-sm"
                    isDisabled={loadingClasses}
                  />
                </div>
              </div>

              <div className="w-full gap-x-6 relative left-0 md:-left-[5%] justify-between md:w-[98%] my-1 md:my-4 flex md:flex-row">
                <label
                  className="md:w-[50%] text-md mt-1.5"
                  htmlFor="studentSelect"
                >
                  Student Name <span className="text-red-500">*</span>
                </label>
                <div className="w-full md:w-[80%]">
                  <Select
                    id="studentSelect"
                    value={selectedStudent}
                    onChange={handleStudentSelect}
                    options={studentOptions}
                    placeholder={
                      loadingStudents ? "Loading students..." : "Select"
                    }
                    isSearchable
                    isClearable
                    className="text-sm"
                    isDisabled={loadingStudents}
                  />
                  {nameError && (
                    <div className="h-8 relative ml-1 text-danger text-xs">
                      {nameError}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="search"
                onClick={handleSearch}
                style={{ backgroundColor: "#2196F3" }}
                className={`my-1 md:my-4 btn h-10 w-18 md:w-auto btn-primary text-white font-bold py-1 border-1 border-blue-500 px-4 rounded ${
                  loadingForSearch ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loadingForSearch}
              >
                {loadingForSearch ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin h-4 w-4 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      ></path>
                    </svg>
                    Loading...
                  </span>
                ) : (
                  "Search"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Form Section - Displayed when parentInformation is fetched */}
        {parentInformation && (
          // <div className="container mx-auto p-4 ">
          <div className=" w-full  md:container mx-auto py-4 p-4 px-4  ">
            <div className="card  px-3 rounded-md ">
              {/* <div className="card p-4 rounded-md "> */}
              <div className=" card-header mb-4 flex justify-between items-center ">
                <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
                  Student Information
                </h5>
              </div>
              <div
                className=" relative w-full   -top-6 h-1  mx-auto bg-red-700"
                style={{
                  backgroundColor: "#C03078",
                }}
              ></div>
              <p
                className={`text-[.9em] text-gray-500 ${
                  sortNameCookie === "HSCS"
                    ? "md:absolute md:right-5 md:top-[7.5%]"
                    : "md:absolute md:right-5 md:top-[13%]"
                }`}
              >
                <span className="text-red-500">*</span> indicates mandatory
                information
              </p>

              <form
                onSubmit={handleSubmit}
                className="  border-1 overflow-x-hidden shadow-md p-2 bg-gray-100 mb-4"
              >
                <div className=" flex flex-col gap-4 md:grid  md:grid-cols-3 md:gap-x-14 md:mx-10 gap-y-1 pt-4 pb-4">
                  <div className=" ">
                    <label
                      htmlFor="sr_no"
                      className="block font-bold  text-xs mb-2"
                    >
                      Sr No. <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={100}
                      id="sr_no"
                      readOnly
                      name="sr_no"
                      value={formData.sr_no}
                      onChange={handleChange}
                      className="block  border w-full border-gray-900 rounded-md py-1 px-3  bg-gray-200 outline-none shadow-inner"
                    />
                    {backendErrors.sr_no && (
                      <span className="text-red-500 text-xs ml-2">
                        {backendErrors.sr_no}
                      </span>
                    )}
                    {errors.sr_no && (
                      <div className="text-red-500 text-xs ml-2">
                        {errors.sr_no}
                      </div>
                    )}
                  </div>

                  {sortNameCookie === "HSCS" && (
                    // Purpose input field here
                    <div>
                      <label
                        htmlFor="reg_no"
                        className="block font-bold text-xs mb-2"
                      >
                        General Register No.{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="reg_no"
                        name="reg_no"
                        readOnly
                        value={formData.reg_no}
                        onChange={handleChange}
                        className="block w-full border border-gray-900 rounded-md py-1 px-3 bg-gray-200 outline-none shadow-inner"
                      />
                      {errors.reg_no && (
                        <span className="text-red-500 text-xs ml-2">
                          {errors.reg_no}
                        </span>
                      )}
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="date_of_joining"
                      className="block font-bold  text-xs mb-2"
                    >
                      Issue Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="date_of_joining"
                      // max={today}
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="input-field block w-full border border-gray-900 rounded-md py-1 px-3 bg-white shadow-inner"
                    />
                    {errors.date && (
                      <span className="text-red-500 text-xs ml-2">
                        {errors.date}
                      </span>
                    )}
                  </div>
                  <div className=" ">
                    <label
                      htmlFor="staffName"
                      className="block font-bold  text-xs mb-2"
                    >
                      Student Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={200}
                      id="staffName"
                      name="stud_name"
                      readOnly
                      value={formData.stud_name}
                      onChange={handleChange}
                      className="block  border w-full border-gray-900 rounded-md py-1 px-3  bg-gray-200 outline-none shadow-inner"
                    />
                    {errors.stud_name && (
                      <div className="text-red-500 text-xs ml-2">
                        {errors.stud_name}
                      </div>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="father_name"
                      className="block font-bold  text-xs mb-2"
                    >
                      Father's Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={50}
                      id="father_name"
                      name="father_name"
                      readOnly
                      value={formData.father_name}
                      onChange={handleChange}
                      className="block  border w-full border-gray-900 rounded-md py-1 px-3  bg-gray-200 outline-none shadow-inner"
                    />
                    {errors.father_name && (
                      <div className="text-red-500 text-xs ml-2">
                        {errors.father_name}
                      </div>
                    )}
                  </div>
                  {sortNameCookie === "HSCS" && (
                    // Purpose input field here
                    <div>
                      <label
                        htmlFor="mother_name"
                        className="block font-bold text-xs mb-2"
                      >
                        Mother's Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="mother_name"
                        name="mother_name"
                        readOnly
                        value={formData.mother_name}
                        onChange={handleChange}
                        className="block w-full border border-gray-900 rounded-md py-1 px-3 bg-gray-200 outline-none shadow-inner"
                      />
                      {errors.mother_name && (
                        <span className="text-red-500 text-xs ml-2">
                          {errors.mother_name}
                        </span>
                      )}
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="class_division"
                      className="block font-bold  text-xs mb-2"
                    >
                      Class/Divsion <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      // maxLength={12}
                      id="class_division"
                      name="class_division"
                      readOnly
                      value={formData.class_division}
                      onChange={handleChange} // Using the handleChange function to update formData and validate
                      className="input-field block w-full outline-none border border-gray-900 rounded-md py-1 px-3 bg-gray-200 shadow-inner"
                    />
                    {errors.class_division && (
                      <span className="text-red-500 text-xs ml-2">
                        {errors.class_division}
                      </span>
                    )}
                  </div>

                  {sortNameCookie !== "HSCS" && (
                    <div>
                      <label
                        htmlFor="employeeId"
                        className="block font-bold  text-xs mb-2"
                      >
                        Purpose <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        maxLength={50}
                        id="employeeId"
                        name="purpose"
                        value={formData.purpose}
                        onChange={handleChange}
                        className="input-field block w-full border border-gray-900 rounded-md py-1 px-3 bg-white shadow-inner"
                      />
                      {errors.purpose && (
                        <span className="text-red-500 text-xs ml-2">
                          {errors.purpose}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Additional fields for HSCS */}
                  {sortNameCookie === "HSCS" && (
                    <>
                      <div>
                        <label
                          htmlFor="religion"
                          className="block font-bold text-xs mb-2"
                        >
                          Religion
                        </label>
                        <input
                          type="text"
                          id="religion"
                          name="religion"
                          value={formData.religion}
                          onChange={handleChange}
                          className="input-field block w-full border border-gray-900 rounded-md py-1 px-3 bg-white shadow-inner"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="caste"
                          className="block font-bold text-xs mb-2"
                        >
                          Caste
                        </label>
                        <input
                          type="text"
                          id="caste"
                          name="caste"
                          value={formData.caste}
                          onChange={handleChange}
                          className="input-field block w-full border border-gray-900 rounded-md py-1 px-3 bg-white shadow-inner"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="subcaste"
                          className="block font-bold text-xs mb-2"
                        >
                          Sub-Caste
                        </label>
                        <input
                          type="text"
                          id="subcaste"
                          name="subcaste"
                          value={formData.subcaste || ""}
                          onChange={handleChange}
                          className="input-field block w-full border border-gray-900 rounded-md py-1 px-3 bg-white shadow-inner"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="birth_place"
                          className="block font-bold text-xs mb-2"
                        >
                          Birth Place <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="birth_place"
                          name="birth_place"
                          readOnly
                          value={formData.birth_place}
                          onChange={handleChange}
                          className="block w-full border border-gray-900 rounded-md py-1 px-3 bg-gray-200 outline-none shadow-inner"
                        />
                        {errors.birth_place && (
                          <span className="text-red-500 text-xs ml-2">
                            {errors.birth_place}
                          </span>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="state"
                          className="block font-bold text-xs mb-2"
                        >
                          State <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="state"
                          name="state"
                          readOnly
                          value={formData.state}
                          onChange={handleChange}
                          className="block w-full border border-gray-900 rounded-md py-1 px-3 bg-gray-200 outline-none shadow-inner"
                        />
                        {errors.state && (
                          <span className="text-red-500 text-xs ml-2">
                            {errors.state}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                  <div>
                    <label
                      htmlFor="dob"
                      className="block font-bold text-xs mb-2"
                    >
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="dob"
                      min={MIN_DATE} // Set minimum date
                      max={MAX_DATE} // Set maximum date to today
                      name="dob"
                      readOnly
                      value={formData.dob}
                      onChange={handleChange}
                      className="block  border w-full border-gray-900 rounded-md py-1 px-3  bg-gray-200 outline-none shadow-inner"
                    />
                    {errors.dob && (
                      <div className="text-red-500 text-xs ml-2">
                        {errors.dob}
                      </div>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="dob_words"
                      className="block font-bold  text-xs mb-2"
                    >
                      Birth date in words{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      type="text"
                      maxLength={100}
                      id="dob_words"
                      name="dob_words"
                      readOnly
                      value={formData.dob_words}
                      onChange={handleChange}
                      className="block  border w-full border-gray-900 rounded-md py-1 px-3  bg-gray-200 outline-none shadow-inner"
                    />
                    {errors.dob_words && (
                      <div className="text-red-500 text-xs ml-2">
                        {errors.dob_words}
                      </div>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="Nationality"
                      className="block font-bold  text-xs mb-2"
                    >
                      Nationality <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      maxLength={20}
                      id="Nationality"
                      name="nationality"
                      readOnly
                      value={formData.nationality}
                      onChange={handleChange}
                      className="block  border w-full border-gray-900 rounded-md py-1 px-3  bg-gray-200 outline-none shadow-inner"
                    />
                    {errors.nationality && (
                      <span className="text-red-500 text-xs ml-2">
                        {errors.nationality}
                      </span>
                    )}
                  </div>

                  {sortNameCookie === "HSCS" && (
                    // Purpose input field here
                    <div className="col-span-3">
                      <label
                        htmlFor="permant_add"
                        className="block font-bold text-xs mb-2"
                      >
                        Address <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="permant_add"
                        name="permant_add"
                        readOnly
                        value={formData.permant_add}
                        onChange={handleChange}
                        className="block w-full border border-gray-900 rounded-md py-1 px-3 bg-gray-200 outline-none shadow-inner"
                      />
                      {errors.permant_add && (
                        <span className="text-red-500 text-xs ml-2">
                          {errors.permant_add}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="col-span-3 text-right">
                    <button
                      type="submit"
                      onClick={handleSubmit}
                      style={{ backgroundColor: "#2196F3" }}
                      className={`text-white font-bold py-1 border-1 border-blue-500 px-4 rounded ${
                        loading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <svg
                            className="animate-spin h-4 w-4 mr-2 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            ></path>
                          </svg>
                          Loading...
                        </span>
                      ) : (
                        "Generate PDF"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateCreateBonafide;
