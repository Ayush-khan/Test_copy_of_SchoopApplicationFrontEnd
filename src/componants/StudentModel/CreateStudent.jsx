// import React, { useState, useEffect } from "react";
// import { FaUserCircle } from "react-icons/fa";
// import { RxCross1 } from "react-icons/rx";
// import { useNavigate, useLocation } from "react-router-dom";
// import axios from "axios";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// // import ImageCropper from "../common/ImageUploadAndCrop";
// import ImageCropper from "../common/ImageUploadAndCrop";
// function Form() {
//   const API_URL = import.meta.env.VITE_API_URL;
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { student } = location.state || {};
//   console.log("Staff is in edit form***", student);

//   const [formData, setFormData] = useState({
//     first_name: "",
//     mid_name: "",
//     last_name: "",
//     house: "",
//     student_name: "",
//     dob: "",
//     admission_date: "",
//     stud_id_no: "",
//     stu_aadhaar_no: "",
//     gender: "",
//     mother_tongue: "",
//     birth_place: "",
//     admission_class: " ",
//     city: " ",
//     state: "",
//     roll_no: "",
//     class_id: "",
//     section_id: "",
//     religion: "",
//     caste: "",
//     subcaste: "",
//     vehicle_no: "",
//     emergency_name: " ",
//     emergency_contact: "",
//     emergency_add: "",
//     height: "",
//     weight: "",
//     allergies: "",
//     nationality: "",
//     pincode: "",
//     image_name: "",
//     // Parent information
//     father_name: "  .",
//     father_occupation: "",
//     f_office_add: "  ",
//     f_office_tel: "",
//     f_mobile: "",
//     f_email: "",
//     father_adhar_card: "",
//     mother_name: " ",
//     mother_occupation: "",
//     m_office_add: " ",
//     m_office_tel: "",
//     m_mobile: "",
//     m_emailid: "",
//     mother_adhar_card: "",

//     // Preferences
//     SetToReceiveSMS: "",
//     SetEmailIDAsUsername: "",

//     // Base64 Image (optional)
//     student_image: "",
//   });
//   // console.log("the formdata set", formData);
//   const [errors, setErrors] = useState({});
//   const [photoPreview, setPhotoPreview] = useState(null);
//   const [backendErrors, setBackendErrors] = useState({});
//   // Maximum date for date_of_birth
//   const MAX_DATE = "2006-12-31";
//   // Get today's date in YYYY-MM-DD format
//   const today = new Date().toISOString().split("T")[0];

//   console.log("employeeID", student.employeeId);
//   useEffect(() => {
//     if (student) {
//       setFormData({
//         first_name: student.first_name || " ",
//         mid_name: student.mid_name || "",
//         last_name: student.last_name || "",
//         house: student.house || "",
//         student_name: student.student_name || "",
//         dob: student.dob || "",
//         admission_date: student.admission_date || "",
//         stud_id_no: student.stud_id_no || "",
//         stu_aadhaar_no: student.stu_aadhaar_no || "",
//         gender: student.gender || "",
//         mother_tongue: student.mother_tongue || "",
//         birth_place: student.birth_place || "",
//         admission_class: student.admission_class || " ",
//         city: student.city || " ",
//         state: student.state || "",
//         roll_no: student.roll_no || "",
//         class_id: student.class_id || "",
//         section_id: student.section_id || "",
//         religion: student.religion || "",
//         caste: student.caste || "",
//         subcaste: student.subcaste || "",
//         vehicle_no: student.vehicle_no || "",
//         emergency_name: student.emergency_name || " ",
//         emergency_contact: student.emergency_contact || "",
//         emergency_add: student.emergency_add || "",
//         height: student.height || "",
//         weight: student.weight || "",
//         allergies: student.allergies || "",
//         nationality: student.nationality || "",
//         pincode: student.pincode || "",
//         image_name: student.image_name || "",
//         // Parent information
//         father_name: student.father_name || " ",
//         father_occupation: student.father_occupation || "",
//         f_office_add: student.f_office_add || "  ",
//         f_office_tel: student.f_office_tel || "",
//         f_mobile: student.f_mobile || "",
//         f_email: student.f_email || "",
//         father_adhar_card: student.father_adhar_card || "",
//         mother_name: student.mother_name || " ",
//         mother_occupation: student.mother_occupation || "",
//         m_office_add: student.m_office_add || " ",
//         m_office_tel: student.m_office_tel || "",
//         m_mobile: student.m_mobile || "",
//         m_emailid: student.m_emailid || "",
//         mother_adhar_card: student.mother_adhar_card || "",

//         // Preferences
//         SetToReceiveSMS: student.SetToReceiveSMS || "",
//         SetEmailIDAsUsername: student.SetEmailIDAsUsername || "",

//         // Base64 Image (optional)
//         // student_image: student.student_image || "",
//       });
//       if (student.student_image) {
//         setPhotoPreview(
//           // `${API_URL}/path/to/images/${student.teacher_image_name}`
//           `${student.student_image}`
//         );
//       }
//     }
//   }, [student, API_URL]);
//   // Validation functions
//   const validatePhone = (phone) => {
//     if (!phone) return "Phone number is required";
//     if (!/^\d{10}$/.test(phone)) return "Phone number must be 10 digits";
//     return null;
//   };

//   const validateAadhar = (aadhar) => {
//     if (!aadhar) return "Aadhar card number is required";
//     if (!/^\d{12}$/.test(aadhar.replace(/\s+/g, "")))
//       return "Aadhar card number must be 12 digits";
//     return null;
//   };

//   const validateEmail = (email) => {
//     if (!email) return "Email is required";
//     if (!/\S+@\S+\.\S+/.test(email)) return "Email address is invalid";
//     return null;
//   };

//   const validateExperience = (experience) => {
//     if (!experience) return "Experience is required";
//     if (!/^\d+$/.test(experience)) return "Experience must be a whole number";
//     return null;
//   };
//   const validate = () => {
//     const newErrors = {};
//     // Validate name
//     if (!formData.name) newErrors.name = "Name is required";
//     else if (!/^[^\d].*/.test(formData.name))
//       newErrors.name = "Name should not start with a number";
//     if (!formData.birthday) newErrors.birthday = "Date of Birth is required";
//     if (!formData.date_of_joining)
//       newErrors.date_of_joining = "Date of Joining is required";
//     if (!formData.sex) newErrors.sex = "Gender is required";
//     if (!formData.address) newErrors.address = "Address is required";
//     // / Validate phone number
//     const phoneError = validatePhone(formData.phone);
//     if (phoneError) newErrors.phone = phoneError;

//     // Validate email
//     const emailError = validateEmail(formData.email);
//     if (emailError) newErrors.email = emailError;

//     // Validate experience
//     const experienceError = validateExperience(formData.experience);
//     if (experienceError) newErrors.experience = experienceError;

//     // Validate aadhar card number
//     const aadharError = validateAadhar(formData.aadhar_card_no);
//     if (aadharError) newErrors.aadhar_card_no = aadharError;

//     if (!formData.designation)
//       newErrors.designation = "Designation is required";
//     if (!formData.employee_id)
//       newErrors.employee_id = "Employee ID is required";
//     if (formData.academic_qual.length === 0)
//       newErrors.academic_qual =
//         "Please select at least one academic qualification";
//     return newErrors;
//   };

//   // const handleChange = (event) => {
//   //   const { name, value, checked } = event.target;
//   //   let newValue = value;

//   //   if (name === "experience") {
//   //     newValue = newValue.replace(/[^0-9]/g, "");
//   //   } else if (name === "aadhar_card_no") {
//   //     newValue = newValue.replace(/\s+/g, "");
//   //   }
//   //   if (name === "phone" || name === "aadhar_card_no") {
//   //     newValue = newValue.replace(/[^\d]/g, "");
//   //   }
//   //   if (name === "academic_qual") {
//   //     setFormData((prevData) => {
//   //       const newAcademicQual = checked
//   //         ? [...prevData.academic_qual, value]
//   //         : prevData.academic_qual.filter(
//   //             (qualification) => qualification !== value
//   //           );
//   //       return { ...prevData, academic_qual: newAcademicQual };
//   //     });
//   //   } else {
//   //     setFormData((prevData) => ({
//   //       ...prevData,
//   //       [name]: newValue,
//   //     }));
//   //   }
//   //   validate(); // Call validate on each change to show real-time errors
//   // };
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
//         return { ...prevData, academic_qual: newAcademicQual };
//       });
//     } else {
//       setFormData((prevData) => ({
//         ...prevData,
//         [name]: newValue,
//       }));
//     }
//     // Validate field based on name
//     let fieldErrors = {};
//     if (name === "phone") {
//       fieldErrors.phone = validatePhone(newValue);
//     } else if (name === "aadhar_card_no") {
//       fieldErrors.aadhar_card_no = validateAadhar(newValue);
//     } else if (name === "email") {
//       fieldErrors.email = validateEmail(newValue);
//     } else if (name === "experience") {
//       fieldErrors.experience = validateExperience(newValue);
//     }

//     setErrors((prevErrors) => ({
//       ...prevErrors,
//       ...fieldErrors,
//     }));
//     // validate(); // Call validate on each change to show real-time errors
//   };
//   const handleFileChange = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       setFormData((prevState) => ({
//         ...prevState,
//         teacher_image_name: file,
//       }));
//       setPhotoPreview(URL.createObjectURL(file));
//     }
//   };
//   // const handleFileChange = (event) => {
//   //   const file = event.target.files[0];
//   //   setFormData((prevState) => ({
//   //     ...prevState,
//   //     teacher_image_name: file,
//   //   }));
//   //   setPhotoPreview(URL.createObjectURL(file));
//   // };

//   // Image Croping funtionlity
//   const handleImageCropped = (croppedImageData) => {
//     setFormData((prevData) => ({
//       ...prevData,
//       teacher_image_name: croppedImageData,
//     }));
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     const validationErrors = validate();
//     const errorsToCheck = validationErrors || {};
//     // Check if there are any errors

//     if (Object.keys(errorsToCheck).length > 0) {
//       setErrors(errorsToCheck);
//       Object.formData(errorsToCheck).forEach((error) => {
//         toast.error(error);
//       });
//       return;
//     }

//     // Convert formData to the format expected by the API
//     const formattedFormData = {
//       ...formData,
//       academic_qual: formData.academic_qual, // Ensure this is an array
//       experience: String(formData.experience), // Ensure this is a string
//       teacher_image_name: String(formData.teacher_image_name),
//     };

//     try {
//       const token = localStorage.getItem("authToken");
//       if (!token) {
//         throw new Error("No authentication token is found");
//       }
//       console.log("the inseid edata of edit student", formattedFormData);
//       const response = await axios.put(
//         `${API_URL}/api/teachers/${student.teacher_id}`,
//         formattedFormData,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (response.status === 200) {
//         toast.success("Teacher updated successfully!");
//         setTimeout(() => {
//           navigate("/StaffList");
//         }, 3000);
//       }
//     } catch (error) {
//       toast.error("An error occurred while updating the teacher.");
//       console.error("Error:", error.response?.data || error.message);
//       if (error.response && error.response.data && error.response.data.errors) {
//         // setErrors(error.response.data.errors);
//         setBackendErrors(error.response.data.errors || {});
//       } else {
//         toast.error(error.message);
//       }
//     }
//   };

//   return (
//     <div className="w-[95%] mx-auto p-4 ">
//       <ToastContainer />
//       <div className="card p-3 rounded-md ">
//         <div className=" card-header mb-4 flex justify-between items-center ">
//           <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
//             Edit Student information
//           </h5>

//           <RxCross1
//             className="float-end relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
//             onClick={() => {
//               navigate("/manageStudent");
//             }}
//           />
//         </div>
//         <div
//           className=" relative w-full   -top-6 h-1  mx-auto bg-red-700"
//           style={{
//             backgroundColor: "#C03078",
//           }}
//         ></div>
//         <p className="  md:absolute md:right-10  md:top-[10%]   text-gray-500 ">
//           <span className="text-red-500">*</span>indicates mandatory information
//         </p>
//         <form
//           onSubmit={handleSubmit}
//           className="  md:mx-2 overflow-x-hidden shadow-md p-2 bg-gray-50"
//         >
//           <div className=" flex flex-col gap-4 md:grid  md:grid-cols-5 md:gap-x-14 md:mx-10 gap-y-1">
//             <div className=" mx-auto   row-span-2   ">
//               {/* {console.log("imagepreview",photoPreview)} */}
//               <ImageCropper
//                 photoPreview={photoPreview}
//                 onImageCropped={handleImageCropped}
//               />
//             </div>
//             {/* personal information */}

//             {/* name */}
//             <div className="">
//               <label htmlFor="name" className="block font-bold  text-xs mb-2">
//                 First Name <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 maxLength={60}
//                 id="name"
//                 name="name"
//                 pattern="^[^\d].*"
//                 title="Name should not start with a number"
//                 required
//                 value={formData.first_name}
//                 onChange={handleChange}
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//               />
//               {errors.name && (
//                 <span className="text-red-500 text-xs">{errors.name}</span>
//               )}
//             </div>

//             {/* <div className="w-full sm:max-w-[30%]"> */}
//             <div className=" relative">
//               <label htmlFor="firstName" className="customLabelCss mandatory">
//                 First Name
//               </label>
//               <input
//                 type="text"
//                 id="firstName"
//                 name="firstName"
//                 // value={formData.firstName}
//                 value={formData.first_name}
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//                 onChange={handleChange}
//                 // onBlur={handleBlur}
//               />
//               {errors.firstName && touched.firstName ? (
//                 <p className="text-[12px] text-red-500 mb-1">
//                   {errors.firstName}
//                 </p>
//               ) : null}
//             </div>

//             <div className="">
//               <label htmlFor="middleName" className="customLabelCss">
//                 Middle Name
//               </label>
//               <input
//                 type="text"
//                 id="middleName"
//                 name="middleName"
//                 value={formData.mid_name}
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//                 onChange={handleChange}
//                 // onBlur={handleBlur}
//               />
//             </div>

//             <div className="">
//               <label htmlFor="lastName" className="customLabelCss">
//                 Last Name
//               </label>
//               <input
//                 type="text"
//                 id="lastName"
//                 name="lastName"
//                 value={formData.last_name}
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//                 onChange={handleChange}
//                 // onBlur={handleBlur}
//               />
//             </div>

//             <div className="">
//               <label htmlFor="studentName" className="customLabelCss mandatory">
//                 Student Name
//               </label>
//               <input
//                 type="text"
//                 id="studentName"
//                 name="studentName"
//                 value={formData.student_name}
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//                 onChange={handleChange}
//                 // onBlur={handleBlur}
//               />
//               {errors.studentName && touched.studentName ? (
//                 <p className="text-[12px] text-red-500 mb-1">
//                   {newErrors.studentName}
//                 </p>
//               ) : null}
//             </div>

//             <div className="">
//               <label htmlFor="dateOfBirth" className="customLabelCss mandatory">
//                 Date of Birth
//               </label>
//               <input
//                 type="date"
//                 id="dateOfBirth"
//                 name="dateOfBirth"
//                 value={formData.dob}
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//                 onChange={handleChange}
//                 // onBlur={handleBlur}
//               />
//               {errors.dateOfBirth && touched.dateOfBirth ? (
//                 <p className="text-[12px] text-red-500 mb-1">
//                   {errors.dateOfBirth}
//                 </p>
//               ) : null}
//             </div>

//             <div className="">
//               <label
//                 htmlFor="dataOfAdmission"
//                 className="block font-bold text-xs mb-2"
//               >
//                 Date of Admission
//               </label>
//               <input
//                 type="date"
//                 id="dataOfAdmission"
//                 name="dataOfAdmission"
//                 value={formData.admission_date}
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//                 onChange={handleChange}
//                 // onBlur={handleBlur}
//               />
//               {errors.dataOfAdmission && touched.dataOfAdmission ? (
//                 <p className="text-[12px] text-red-500 mb-1">
//                   {errors.dataOfAdmission}
//                 </p>
//               ) : null}
//             </div>

//             <div className="">
//               <label htmlFor="grnNumber" className="customLabelCss mandatory">
//                 GRN No.
//               </label>
//               <input
//                 type="text"
//                 id="grnNumber"
//                 name="grnNumber"
//                 value={formData.grnNumber}
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//                 onChange={handleChange}
//                 // onBlur={handleBlur}
//               />
//               {errors.grnNumber && touched.grnNumber ? (
//                 <p className="text-[12px] text-red-500 mb-1">
//                   {errors.grnNumber}
//                 </p>
//               ) : null}
//             </div>

//             <div className="">
//               <label htmlFor="studentIdNumber" className="customLabelCss">
//                 Student ID No.
//               </label>
//               <input
//                 type="text"
//                 id="studentIdNumber"
//                 name="studentIdNumber"
//                 value={formData.stud_id_no}
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//                 onChange={handleChange}
//                 // onBlur={handleBlur}
//               />
//             </div>

//             <div className="">
//               <label
//                 htmlFor="studentAadharNumber"
//                 className="block font-bold text-xs mb-2"
//               >
//                 Student Aadhar No.
//               </label>
//               <input
//                 type="text"
//                 id="studentAadharNumber"
//                 name="studentAadharNumber"
//                 value={formData.stu_aadhaar_no}
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//                 onChange={handleChange}
//                 // onBlur={handleBlur}
//               />
//               {errors.studentAadharNumber && touched.studentAadharNumber ? (
//                 <p className="text-[12px] text-red-500 mb-1">
//                   {errors.studentAadharNumber}
//                 </p>
//               ) : null}
//             </div>

//             <div className="">
//               <label
//                 htmlFor="studentClass"
//                 className="block font-bold text-xs mb-2"
//               >
//                 Class
//               </label>
//               <select
//                 id="studentClass"
//                 name="studentClass"
//                 value={formData.class_id}
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//                 onChange={handleChange}
//                 // onBlur={handleBlur}
//               >
//                 <option>Select</option>
//                 <option value="Nursery">Nursery</option>
//                 <option value="LKG">LKG</option>
//                 <option value="UKG">UKG</option>
//                 <option value="1">1</option>
//                 <option value="2">2</option>
//                 <option value="3">3</option>
//                 <option value="4">4</option>
//                 <option value="5">5</option>
//                 <option value="6">6</option>
//                 <option value="7">7</option>
//                 <option value="8">8</option>
//                 <option value="9">9</option>
//                 <option value="10">10</option>
//                 <option value="11">11</option>
//                 <option value="12">12</option>
//               </select>
//               {errors.studentClass && touched.studentClass ? (
//                 <p className="text-[12px] text-red-500 mb-1">
//                   {errors.studentClass}
//                 </p>
//               ) : null}
//             </div>

//             <div className="">
//               <label htmlFor="division" className="customLabelCss mandatory">
//                 Division
//               </label>
//               <select
//                 id="division"
//                 name="division"
//                 value={formData.section_id}
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//                 onChange={handleChange}
//                 // onBlur={handleBlur}
//               >
//                 <option>Select</option>
//                 <option value="A">A</option>
//                 <option value="B">B</option>
//                 <option value="C">C</option>
//                 <option value="D">D</option>
//               </select>
//               {errors.division && touched.division ? (
//                 <p className="text-[12px] text-red-500 mb-1">
//                   {errors.division}
//                 </p>
//               ) : null}
//             </div>

//             <div className="">
//               <label htmlFor="rollNumber" className="customLabelCss">
//                 Roll No.
//               </label>
//               <input
//                 type="text"
//                 id="rollNumber"
//                 name="rollNumber"
//                 value={formData.roll_no}
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//                 onChange={handleChange}
//                 // onBlur={handleBlur}
//               />
//             </div>
//             {/* </div> */}

//             {/*  */}
//             {/* <div className="w-full sm:max-w-[30%]"> */}
//             <div className="">
//               <label htmlFor="house" className="customLabelCss">
//                 House
//               </label>
//               <select
//                 id="house"
//                 name="house"
//                 value={formData.house}
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//                 onChange={handleChange}
//                 // onBlur={handleBlur}
//               >
//                 <option>Select</option>
//                 <option value="Diamond">Diamond</option>
//                 <option value="Emerald">Emerald</option>
//                 <option value="Ruby">Ruby</option>
//                 <option value="Sapphire">Sapphire</option>
//               </select>
//             </div>

//             <div className="">
//               <label
//                 htmlFor="admittedInClass"
//                 className="block font-bold text-xs mb-2"
//               >
//                 Admitted In Class
//               </label>
//               <select
//                 id="admittedInClass"
//                 name="admittedInClass"
//                 value={formData.admission_class}
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//                 onChange={handleChange}
//                 // onBlur={handleBlur}
//               >
//                 <option>Select</option>
//                 <option value="Nursery">Nursery</option>
//                 <option value="LKG">LKG</option>
//                 <option value="UKG">UKG</option>
//                 <option value="1">1</option>
//                 <option value="2">2</option>
//                 <option value="3">3</option>
//                 <option value="4">4</option>
//                 <option value="5">5</option>
//                 <option value="6">6</option>
//                 <option value="7">7</option>
//                 <option value="8">8</option>
//                 <option value="9">9</option>
//                 <option value="10">10</option>
//                 <option value="11">11</option>
//                 <option value="12">12</option>
//               </select>
//               {errors.admittedInClass && touched.admittedInClass ? (
//                 <p className="text-[12px] text-red-500 mb-1">
//                   {errors.admittedInClass}
//                 </p>
//               ) : null}
//             </div>

//             <div className="">
//               <label htmlFor="gender" className="customLabelCss mandatory">
//                 Gender
//               </label>
//               <select
//                 id="gender"
//                 name="gender"
//                 value={formData.gender}
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//                 onChange={handleChange}
//                 // onBlur={handleBlur}
//               >
//                 <option>Select</option>
//                 <option defaultValue="Male">Male</option>
//                 <option value="Female">Female</option>
//               </select>
//               {errors.gender && touched.gender ? (
//                 <p className="text-[12px] text-red-500 mb-1">{errors.gender}</p>
//               ) : null}
//             </div>

//             <div className="">
//               <label htmlFor="bloodGroup" className="customLabelCss">
//                 Blood Group
//               </label>
//               <select
//                 id="bloodGroup"
//                 name="bloodGroup"
//                 value={formData.bloodGroup}
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//                 onChange={handleChange}
//                 // onBlur={handleBlur}
//               >
//                 <option>Select</option>
//                 <option value="AB+">AB+</option>
//                 <option value="AB-">AB-</option>
//                 <option value="B+">B+</option>
//                 <option value="B-">B-</option>
//                 <option value="A+">A+</option>
//                 <option value="A-">A-</option>
//                 <option value="O+">O+</option>
//                 <option value="O-">O-</option>
//               </select>
//             </div>

//             <div className="">
//               <label htmlFor="address" className="customLabelCss mandatory">
//                 Address
//               </label>
//               <textarea
//                 id="address"
//                 name="address"
//                 rows={2}
//                 value={formData.address}
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//                 onChange={handleChange}
//                 // onBlur={handleBlur}
//               />
//               {errors.address && touched.address ? (
//                 <p className="text-[12px] text-red-500 mb-1">
//                   {errors.address}
//                 </p>
//               ) : null}
//             </div>

//             <div className="">
//               <label htmlFor="city" className="customLabelCss mandatory">
//                 City
//               </label>
//               <input
//                 type="text"
//                 id="city"
//                 name="city"
//                 value={formData.city}
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//                 onChange={handleChange}
//                 // onBlur={handleBlur}
//               />
//               {errors.city && touched.city ? (
//                 <p className="text-[12px] text-red-500 mb-1">{errors.city}</p>
//               ) : null}
//             </div>

//             <div className="">
//               <label htmlFor="state" className="customLabelCss mandatory">
//                 State
//               </label>
//               <input
//                 type="text"
//                 id="state"
//                 name="state"
//                 value={formData.state}
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//                 onChange={handleChange}
//                 // onBlur={handleBlur}
//               />
//               {errors.state && touched.state ? (
//                 <p className="text-[12px] text-red-500 mb-1">{errors.state}</p>
//               ) : null}
//             </div>

//             <div className="">
//               <label htmlFor="pincode" className="customLabelCss">
//                 Pincode
//               </label>
//               <input
//                 type="text"
//                 id="pincode"
//                 name="pincode"
//                 value={formData.pincode}
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//                 onChange={handleChange}
//                 // onBlur={handleBlur}
//               />
//             </div>

//             <div className="">
//               <label htmlFor="religion" className="customLabelCss mandatory">
//                 Religion
//               </label>
//               <select
//                 id="religion"
//                 name="religion"
//                 value={formData.religion}
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//                 onChange={handleChange}
//                 // onBlur={handleBlur}
//               >
//                 <option>Select</option>
//                 <option value="Hindu">Hindu</option>
//                 <option value="Christian">Christian</option>
//                 <option value="Muslim">Muslim</option>
//                 <option value="Sikh">Sikh</option>
//                 <option value="Jain">Jain</option>
//                 <option value="Buddhist">Buddhist</option>
//               </select>
//               {errors.religion && touched.religion ? (
//                 <p className="text-[12px] text-red-500 mb-1">
//                   {errors.religion}
//                 </p>
//               ) : null}
//             </div>

//             <div className="">
//               <label htmlFor="caste" className="customLabelCss">
//                 Caste
//               </label>
//               <input
//                 type="text"
//                 id="caste"
//                 name="caste"
//                 value={formData.caste}
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//                 onChange={handleChange}
//                 // onBlur={handleBlur}
//               />
//             </div>

//             <div className="">
//               <label htmlFor="category" className="customLabelCss mandatory">
//                 Category
//               </label>
//               <select
//                 id="category"
//                 name="category"
//                 value={formData.category}
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//                 onChange={handleChange}
//                 // onBlur={handleBlur}
//               >
//                 <option>Select</option>
//                 <option value="General">General</option>
//                 <option value="SC">SC</option>
//                 <option value="ST">ST</option>
//                 <option value="OBC">OBC</option>
//                 <option value="SBC">SBC</option>
//                 <option value="NT">NT</option>
//                 <option value="VJNT">VJNT</option>
//                 <option value="Minority">Minority</option>
//               </select>
//               {errors.category && touched.category ? (
//                 <p className="text-[12px] text-red-500 mb-1">
//                   {errors.category}
//                 </p>
//               ) : null}
//             </div>
//             {/* </div> */}

//             {/*  */}
//             {/* <div className="w-full sm:max-w-[30%]"> */}
//             <div className="">
//               <label htmlFor="nationality" className="customLabelCss mandatory">
//                 Nationality
//               </label>
//               <input
//                 type="text"
//                 id="nationality"
//                 name="nationality"
//                 value={formData.nationality}
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//                 onChange={handleChange}
//                 // onBlur={handleBlur}
//               />
//               {errors.nationality && touched.nationality ? (
//                 <p className="text-[12px] text-red-500 mb-1">
//                   {errors.nationality}
//                 </p>
//               ) : null}
//             </div>

//             <div className="">
//               <label htmlFor="birthPlace" className="customLabelCss">
//                 Birth Place
//               </label>
//               <input
//                 type="text"
//                 id="birthPlace"
//                 name="birthPlace"
//                 value={formData.birthPlace}
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//                 onChange={handleChange}
//                 // onBlur={handleBlur}
//               />
//             </div>

//             <div className="">
//               <label
//                 htmlFor="motherTongue"
//                 className="block font-bold text-xs mb-2"
//               >
//                 Mother Tongue
//               </label>
//               <input
//                 type="text"
//                 id="motherTongue"
//                 name="motherTongue"
//                 value={formData.motherTongue}
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//                 onChange={handleChange}
//                 // onBlur={handleBlur}
//               />
//               {errors.motherTongue && touched.motherTongue ? (
//                 <p className="text-[12px] text-red-500 mb-1">
//                   {errors.motherTongue}
//                 </p>
//               ) : null}
//             </div>

//             <div className="">
//               <label htmlFor="emergencyName" className="customLabelCss">
//                 Emergency Name
//               </label>
//               <input
//                 type="text"
//                 id="emergencyName"
//                 name="emergencyName"
//                 value={formData.emergencyName}
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//                 onChange={handleChange}
//                 // onBlur={handleBlur}
//               />
//             </div>

//             <div className="">
//               <label htmlFor="emergencyAddress" className="customLabelCss">
//                 Emergency Address
//               </label>
//               <textarea
//                 id="emergencyAddress"
//                 name="emergencyAddress"
//                 rows={2}
//                 value={formData.emergencyAddress}
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//                 onChange={handleChange}
//                 // onBlur={handleBlur}
//               />
//               <div className="flex flex-row items-center gap-2 -mt-2 w-full">
//                 <input
//                   type="checkbox"
//                   id="sameAs"
//                   name="emergencyAddress"
//                   rows={2}
//                   className="border h-[26px] border-[#ccc] px-3 py-[6px] text-[14px] leading-4 outline-none"
//                   onChange={(event) => {
//                     if (event.target.checked) {
//                       event.target.value = formData.address;
//                       handleChange(event);
//                     }
//                   }}
//                   // onBlur={handleBlur}
//                 />
//                 <label htmlFor="sameAs">Same as permanent address</label>
//               </div>
//             </div>

//             <div className="">
//               <label htmlFor="emergencyContact" className="customLabelCss">
//                 Emergency Contact
//               </label>
//               <div className="w-full flex flex-row items-center">
//                 <span className="w-[15%] h-[34px] text-[14px] text-[#555] text-center border border-[#ccc] border-r-0 flex items-center justify-center p-1">
//                   +91
//                 </span>
//                 <input
//                   type="text"
//                   inputMode="numeric"
//                   id="emergencyContact"
//                   name="emergencyContact"
//                   maxLength={10}
//                   value={formData.emergencyContact}
//                   className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//                   onChange={handleChange}
//                   // onBlur={handleBlur}
//                 />
//               </div>
//             </div>

//             <div className="">
//               <label htmlFor="transportMode" className="customLabelCss">
//                 Transport Mode
//               </label>
//               <select
//                 id="transportMode"
//                 name="transportMode"
//                 value={formData.transportMode}
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//                 onChange={handleChange}
//                 // onBlur={handleBlur}
//               >
//                 <option>Select</option>
//                 <option value="School Bus">School Bus</option>
//                 <option value="Private Van">Private Van</option>
//                 <option value="Self">Self</option>
//               </select>
//               <input
//                 type="text"
//                 id="vehicleNumber"
//                 name="vehicleNumber"
//                 placeholder="Vehicle No."
//                 value={formData.vehicleNumber}
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//                 onChange={handleChange}
//                 // onBlur={handleBlur}
//               />
//             </div>

//             <div className="">
//               <label htmlFor="allergies" className="customLabelCss">
//                 Allergies(if any)
//               </label>
//               <input
//                 type="text"
//                 id="allergies"
//                 name="allergies"
//                 value={formData.allergies}
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//                 onChange={handleChange}
//                 // onBlur={handleBlur}
//               />
//             </div>

//             <div className="">
//               <label htmlFor="height" className="customLabelCss">
//                 Height
//               </label>
//               <input
//                 type="text"
//                 id="height"
//                 name="height"
//                 value={formData.height}
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//                 onChange={handleChange}
//                 // onBlur={handleBlur}
//               />
//             </div>

//             <div className="">
//               <label htmlFor="weight" className="customLabelCss">
//                 Weight
//               </label>
//               <input
//                 type="text"
//                 id="weight"
//                 name="weight"
//                 value={formData.weight}
//                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
//                 onChange={handleChange}
//                 // onBlur={handleBlur}
//               />
//             </div>

//             <div className=" flex gap-6 pt-[7px]">
//               <div htmlFor="weight" className="text-left max-w-full font-[700]">
//                 Has Spectacles
//               </div>
//               <div className="flex items-center gap-6">
//                 <div className="flex items-center">
//                   <input
//                     type="radio"
//                     id="yes"
//                     name="hasSpectacles"
//                     checked={formData.hasSpectacles === "Yes"}
//                     value="Yes"
//                     onChange={handleChange}
//                     // onBlur={handleBlur}
//                   />
//                   <label htmlFor="yes" className="ml-1">
//                     Yes
//                   </label>
//                 </div>
//                 <div className="flex items-center">
//                   <input
//                     type="radio"
//                     id="no"
//                     name="hasSpectacles"
//                     checked={formData.hasSpectacles === "No"}
//                     value="No"
//                     onChange={handleChange}
//                     // onBlur={handleBlur}
//                   />
//                   <label htmlFor="no" className="ml-1">
//                     No
//                   </label>
//                 </div>
//               </div>
//             </div>
//             {/* </div> */}
//           </div>
//           <div className="col-span-3 md:mr-9 my-2 text-right">
//             <button
//               type="submit"
//               style={{ backgroundColor: "#2196F3" }}
//               className=" text-white font-bold py-1 border-1 border-blue-500 px-4 rounded"
//             >
//               Update
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default Form;

import React, { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import { RxCross1 } from "react-icons/rx";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ImageCropper from "../common/ImageUploadAndCrop";

function Form() {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const location = useLocation();
  const { student } = location.state || {};

  const [formData, setFormData] = useState({
    first_name: "",
    mid_name: "",
    last_name: "",
    house: "",
    student_name: "",
    dob: "",
    admission_date: "",
    stud_id_no: "",
    stu_aadhaar_no: "",
    gender: "",
    mother_tongue: "",
    birth_place: "",
    admission_class: " ",
    city: " ",
    state: "",
    roll_no: "",
    class_id: "",
    section_id: "",
    religion: "",
    caste: "",
    subcaste: "",
    vehicle_no: "",
    emergency_name: " ",
    emergency_contact: "",
    emergency_add: "",
    height: "",
    weight: "",
    allergies: "",
    nationality: "",
    pincode: "",
    image_name: "",
    // Parent information
    father_name: "  .",
    father_occupation: "",
    f_office_add: "  ",
    f_office_tel: "",
    f_mobile: "",
    f_email: "",
    father_adhar_card: "",
    mother_name: " ",
    mother_occupation: "",
    m_office_add: " ",
    m_office_tel: "",
    m_mobile: "",
    m_emailid: "",
    mother_adhar_card: "",

    // Preferences
    SetToReceiveSMS: "",
    SetEmailIDAsUsername: "",

    // Base64 Image (optional)
    student_image: "",
  });

  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);
  const [backendErrors, setBackendErrors] = useState({});

  console.log("employeeID", student.employeeId);
  useEffect(() => {
    if (student) {
      setFormData({
        first_name: student.first_name || " ",
        mid_name: student.mid_name || "",
        last_name: student.last_name || "",
        house: student.house || "",
        student_name: student.student_name || "",
        dob: student.dob || "",
        admission_date: student.admission_date || "",
        stud_id_no: student.stud_id_no || "",
        stu_aadhaar_no: student.stu_aadhaar_no || "",
        gender: student.gender || "",
        mother_tongue: student.mother_tongue || "",
        birth_place: student.birth_place || "",
        admission_class: student.admission_class || " ",
        city: student.city || " ",
        state: student.state || "",
        roll_no: student.roll_no || "",
        class_id: student.class_id || "",
        section_id: student.section_id || "",
        religion: student.religion || "",
        caste: student.caste || "",
        subcaste: student.subcaste || "",
        vehicle_no: student.vehicle_no || "",
        emergency_name: student.emergency_name || " ",
        emergency_contact: student.emergency_contact || "",
        emergency_add: student.emergency_add || "",
        height: student.height || "",
        weight: student.weight || "",
        allergies: student.allergies || "",
        nationality: student.nationality || "",
        pincode: student.pincode || "",
        image_name: student.image_name || "",
        // Parent information
        father_name: student.father_name || " ",
        father_occupation: student.father_occupation || "",
        f_office_add: student.f_office_add || "  ",
        f_office_tel: student.f_office_tel || "",
        f_mobile: student.f_mobile || "",
        f_email: student.f_email || "",
        father_adhar_card: student.father_adhar_card || "",
        mother_name: student.mother_name || " ",
        mother_occupation: student.mother_occupation || "",
        m_office_add: student.m_office_add || " ",
        m_office_tel: student.m_office_tel || "",
        m_mobile: student.m_mobile || "",
        m_emailid: student.m_emailid || "",
        mother_adhar_card: student.mother_adhar_card || "",

        // Preferences
        SetToReceiveSMS: student.SetToReceiveSMS || "",
        SetEmailIDAsUsername: student.SetEmailIDAsUsername || "",

        // Base64 Image (optional)
        // student_image: student.student_image || "",
      });
      if (student.student_image) {
        setPhotoPreview(
          // `${API_URL}/path/to/images/${student.teacher_image_name}`
          `${student.student_image}`
        );
      }
    }
  }, [student, API_URL]);

  const validatePhone = (phone) => {
    if (!phone) return "Phone number is required";
    if (!/^\d{10}$/.test(phone)) return "Phone number must be 10 digits";
    return null;
  };

  const validateAadhar = (aadhar) => {
    if (!aadhar) return "Aadhar card number is required";
    if (!/^\d{12}$/.test(aadhar.replace(/\s+/g, "")))
      return "Aadhar card number must be 12 digits";
    return null;
  };

  const validateEmail = (email) => {
    if (!email) return "Email is required";
    if (!/\S+@\S+\.\S+/.test(email)) return "Email address is invalid";
    return null;
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.first_name) newErrors.first_name = "First name is required";
    // Add other field validations
    const phoneError = validatePhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;
    const aadharError = validateAadhar(formData.aadhar_card_no);
    if (aadharError) newErrors.aadhar_card_no = aadharError;
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    return newErrors;
  };

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;
    let newValue = value;

    if (type === "checkbox") {
      newValue = checked;
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: newValue,
    }));

    // Validate field on change
    let fieldErrors = {};
    if (name === "phone") {
      fieldErrors.phone = validatePhone(newValue);
    } else if (name === "aadhar_card_no") {
      fieldErrors.aadhar_card_no = validateAadhar(newValue);
    } else if (name === "email") {
      fieldErrors.email = validateEmail(newValue);
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      ...fieldErrors,
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData((prevState) => ({
        ...prevState,
        student_image: file,
      }));
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleImageCropped = (croppedImageData) => {
    setFormData((prevData) => ({
      ...prevData,
      student_image: croppedImageData,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      Object.values(validationErrors).forEach((error) => {
        toast.error(error);
      });
      return;
    }

    // Prepare the data for API submission
    const formattedFormData = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] instanceof File) {
        formattedFormData.append(key, formData[key]);
      } else {
        formattedFormData.append(key, formData[key]);
      }
    });
    console.log(" formattedFormData,", formattedFormData);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token is found");
      }
      console.log(" formattedFormData,", formattedFormData);
      const response = await axios.put(
        `${API_URL}/api/students/${student.student_id}`,
        formattedFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Student updated successfully!");
        setTimeout(() => {
          navigate("/StudentList");
        }, 3000);
      }
    } catch (error) {
      toast.error("An error occurred while updating the student.");
      console.error("Error:", error.response?.data || error.message);
      if (error.response && error.response.data && error.response.data.errors) {
        setBackendErrors(error.response.data.errors || {});
      } else {
        toast.error(error.message);
      }
    }
  };

  return (
    <div className="w-[95%] mx-auto p-4">
      <ToastContainer />
      <div className="card p-3 rounded-md">
        <div className="card-header mb-4 flex justify-between items-center">
          <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
            Edit Student Information
          </h5>
          <RxCross1
            className="float-end relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
            onClick={() => navigate("/manageStudent")}
          />
        </div>
        <div
          className="relative w-full -top-6 h-1 mx-auto bg-red-700"
          style={{ backgroundColor: "#C03078" }}
        ></div>
        <p className="md:absolute md:right-10 md:top-[10%] text-gray-500">
          <span className="text-red-500">*</span> indicates mandatory
          information
        </p>
        <form
          onSubmit={handleSubmit}
          className="md:mx-2 overflow-x-hidden shadow-md p-2 bg-gray-50"
        >
          <div className="flex flex-col gap-4 md:grid md:grid-cols-5 md:gap-x-14 md:mx-10 gap-y-1">
            <div className="mx-auto row-span-2">
              <ImageCropper
                photoPreview={photoPreview}
                onImageCropped={handleImageCropped}
              />
            </div>
            <div>
              <label
                htmlFor="first_name"
                className="block font-bold text-xs mb-2"
              >
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                maxLength={60}
                // required
                value={formData.first_name}
                onChange={handleChange}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
              />
              {errors.first_name && (
                <span className="text-red-500 text-xs">
                  {errors.first_name}
                </span>
              )}
            </div>
            {/* Add other form fields similarly */}
            <div className="">
              <label
                htmlFor="mid_name"
                className="block font-bold text-xs mb-2"
              >
                Middle Name
              </label>
              <input
                type="text"
                id="mid_name"
                name="mid_name"
                value={formData.mid_name}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
            </div>
            <div className="">
              <label
                htmlFor="lastName"
                className="block font-bold text-xs mb-2"
              >
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="last_name"
                value={formData.last_name}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
            </div>
            <div className="">
              <label
                htmlFor="studentName"
                className="block font-bold text-xs mb-2"
              >
                Student Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="studentName"
                name="student_name"
                value={formData.student_name}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
              {errors.student_name && (
                <p className="text-[12px] text-red-500 mb-1">
                  {errors.student_name}
                </p>
              )}
            </div>
            <div className="">
              <label
                htmlFor="dateOfBirth"
                className="block font-bold text-xs mb-2"
              >
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="dateOfBirth"
                name="dob"
                value={formData.dob}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
              {errors.dateOfBirth && (
                <p className="text-[12px] text-red-500 mb-1">
                  {errors.dateOfBirth}
                </p>
              )}
            </div>
            <div className="">
              <label
                htmlFor="dataOfAdmission"
                className="block font-bold text-xs mb-2"
              >
                Date of Admission <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="dataOfAdmission"
                name="admission_date"
                value={formData.admission_date}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
              {errors.dataOfAdmission && (
                <p className="text-[12px] text-red-500 mb-1">
                  {errors.dataOfAdmission}
                </p>
              )}
            </div>
            <div className="">
              <label
                htmlFor="grnNumber"
                className="block font-bold text-xs mb-2"
              >
                GRN No. <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="grnNumber"
                name="gr_no"
                value={formData.gr_no}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
              {errors.grnNumber && (
                <p className="text-[12px] text-red-500 mb-1">
                  {errors.grnNumber}
                </p>
              )}
            </div>
            <div className="">
              <label
                htmlFor="studentIdNumber"
                className="block font-bold text-xs mb-2"
              >
                Student ID No.
              </label>
              <input
                type="text"
                id="studentIdNumber"
                name="stud_id_no"
                value={formData.stud_id_no}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
                // dfgs fdge fbgdg fgdhreth gnfyh
              />
            </div>
            <div className="">
              <label
                htmlFor="studentAadharNumber"
                className="block font-bold text-xs mb-2"
              >
                Student Aadhar No. <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="studentAadharNumber"
                name="stu_aadhaar_no"
                value={formData.stu_aadhaar_no}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
              {errors.studentAadharNumber && (
                <p className="text-[12px] text-red-500 mb-1">
                  {errors.studentAadharNumber}
                </p>
              )}
            </div>
            <div className="">
              <label
                htmlFor="studentClass"
                className="block font-bold text-xs mb-2"
              >
                Class <span className="text-red-500">*</span>
              </label>
              <select
                id="studentClass"
                name="class_id"
                value={formData.class_id}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              >
                <option>Select</option>
                <option value="Nursery">Nursery</option>
                <option value="LKG">LKG</option>
                <option value="UKG">UKG</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
                <option value="11">11</option>
                <option value="12">12</option>
              </select>
              {errors.studentClass && (
                <p className="text-[12px] text-red-500 mb-1">
                  {errors.studentClass}
                </p>
              )}
            </div>
            <div className="">
              <label
                htmlFor="division"
                className="block font-bold text-xs mb-2"
              >
                Division <span className="text-red-500">*</span>
              </label>
              <select
                id="division"
                name="section_id"
                value={formData.section_id}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              >
                <option>Select</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
              {errors.division && (
                <p className="text-[12px] text-red-500 mb-1">
                  {errors.division}
                </p>
              )}
            </div>

            <div className="">
              <label
                htmlFor="rollNumber"
                className="block font-bold text-xs mb-2"
              >
                Roll No.
              </label>
              <input
                type="text"
                id="rollNumber"
                name="roll_no"
                value={formData.roll_no}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
            </div>
            <div className="">
              <label htmlFor="house" className="customLabelCss">
                House
              </label>
              <select
                id="house"
                name="house"
                value={formData.house}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              >
                <option>Select</option>
                <option value="Diamond">Diamond</option>
                <option value="Emerald">Emerald</option>
                <option value="Ruby">Ruby</option>
                <option value="Sapphire">Sapphire</option>
              </select>
            </div>
            <div className="">
              <label
                htmlFor="admittedInClass"
                className="block font-bold text-xs mb-2"
              >
                Admitted In Class
              </label>
              <select
                id="admittedInClass"
                name="admittedInClass"
                value={formData.admission_class}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              >
                <option>Select</option>
                <option value="Nursery">Nursery</option>
                <option value="LKG">LKG</option>
                <option value="UKG">UKG</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
                <option value="11">11</option>
                <option value="12">12</option>
              </select>
              {errors.admittedInClass && touched.admittedInClass ? (
                <p className="text-[12px] text-red-500 mb-1">
                  {errors.admittedInClass}
                </p>
              ) : null}
            </div>
            <div className="">
              <label htmlFor="gender" className="block font-bold text-xs mb-2">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              >
                <option>Select</option>
                <option defaultValue="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {errors.gender && touched.gender ? (
                <p className="text-[12px] text-red-500 mb-1">{errors.gender}</p>
              ) : null}
            </div>
            <div className="">
              <label htmlFor="bloodGroup" className="customLabelCss">
                Blood Group
              </label>
              <select
                id="bloodGroup"
                name="bloodGroup"
                value={formData.bloodGroup}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              >
                <option>Select</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div className="">
              <label htmlFor="address" className="block font-bold text-xs mb-2">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                rows={2}
                value={formData.address}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
              {errors.address && touched.address ? (
                <p className="text-[12px] text-red-500 mb-1">
                  {errors.address}
                </p>
              ) : null}
            </div>

            <div className="">
              <label htmlFor="city" className="block font-bold text-xs mb-2">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
              {errors.city && touched.city ? (
                <p className="text-[12px] text-red-500 mb-1">{errors.city}</p>
              ) : null}
            </div>

            <div className="">
              <label htmlFor="state" className="block font-bold text-xs mb-2">
                State
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
              {errors.state && touched.state ? (
                <p className="text-[12px] text-red-500 mb-1">{errors.state}</p>
              ) : null}
            </div>

            <div className="">
              <label htmlFor="pincode" className="customLabelCss">
                Pincode
              </label>
              <input
                type="text"
                id="pincode"
                name="pincode"
                value={formData.pincode}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
            </div>

            <div className="">
              <label
                htmlFor="religion"
                className="block font-bold text-xs mb-2"
              >
                Religion
              </label>
              <select
                id="religion"
                name="religion"
                value={formData.religion}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              >
                <option>Select</option>
                <option value="Hindu">Hindu</option>
                <option value="Christian">Christian</option>
                <option value="Muslim">Muslim</option>
                <option value="Sikh">Sikh</option>
                <option value="Jain">Jain</option>
                <option value="Buddhist">Buddhist</option>
              </select>
              {errors.religion && touched.religion ? (
                <p className="text-[12px] text-red-500 mb-1">
                  {errors.religion}
                </p>
              ) : null}
            </div>

            <div className="">
              <label htmlFor="caste" className="customLabelCss">
                Caste
              </label>
              <input
                type="text"
                id="caste"
                name="caste"
                value={formData.caste}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
            </div>

            <div className="">
              <label
                htmlFor="category"
                className="block font-bold text-xs mb-2"
              >
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              >
                <option>Select</option>
                <option value="General">General</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="OBC">OBC</option>
                <option value="SBC">SBC</option>
                <option value="NT">NT</option>
                <option value="VJNT">VJNT</option>
                <option value="Minority">Minority</option>
              </select>
              {errors.category && touched.category ? (
                <p className="text-[12px] text-red-500 mb-1">
                  {errors.category}
                </p>
              ) : null}
            </div>
            {/* </div> */}

            {/*  */}
            {/* <div className="w-full sm:max-w-[30%]"> */}
            <div className="">
              <label
                htmlFor="nationality"
                className="block font-bold text-xs mb-2"
              >
                Nationality
              </label>
              <input
                type="text"
                id="nationality"
                name="nationality"
                value={formData.nationality}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
              {errors.nationality && touched.nationality ? (
                <p className="text-[12px] text-red-500 mb-1">
                  {errors.nationality}
                </p>
              ) : null}
            </div>

            <div className="">
              <label htmlFor="birthPlace" className="customLabelCss">
                Birth Place
              </label>
              <input
                type="text"
                id="birthPlace"
                name="birthPlace"
                value={formData.birthPlace}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
            </div>

            <div className="">
              <label
                htmlFor="motherTongue"
                className="block font-bold text-xs mb-2"
              >
                Mother Tongue
              </label>
              <input
                type="text"
                id="motherTongue"
                name="motherTongue"
                value={formData.motherTongue}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
              {errors.motherTongue && touched.motherTongue ? (
                <p className="text-[12px] text-red-500 mb-1">
                  {errors.motherTongue}
                </p>
              ) : null}
            </div>

            <div className="">
              <label
                htmlFor="emergencyName"
                className="block font-bold text-xs mb-2"
              >
                Emergency Name
              </label>
              <input
                type="text"
                id="emergencyName"
                name="emergencyName"
                value={formData.emergencyName}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
            </div>

            <div className="">
              <label htmlFor="emergencyAddress" className="customLabelCss">
                Emergency Address
              </label>
              <textarea
                id="emergencyAddress"
                name="emergencyAddress"
                rows={2}
                value={formData.emergencyAddress}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
              <div className="flex flex-row items-center gap-2 -mt-2 w-full">
                <input
                  type="checkbox"
                  id="sameAs"
                  name="emergencyAddress"
                  rows={2}
                  className="border h-[26px] border-[#ccc] px-3 py-[6px] text-[14px] leading-4 outline-none"
                  onChange={(event) => {
                    if (event.target.checked) {
                      event.target.value = formData.address;
                      handleChange(event);
                    }
                  }}
                  // onBlur={handleBlur}
                />
                <label htmlFor="sameAs">Same as permanent address</label>
              </div>
            </div>

            <div className="">
              <label htmlFor="emergencyContact" className="customLabelCss">
                Emergency Contact
              </label>
              <div className="w-full flex flex-row items-center">
                <span className="w-[15%] h-[34px] text-[14px] text-[#555] text-center border border-[#ccc] border-r-0 flex items-center justify-center p-1">
                  +91
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  id="emergencyContact"
                  name="emergencyContact"
                  maxLength={10}
                  value={formData.emergencyContact}
                  className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                  onChange={handleChange}
                  // onBlur={handleBlur}
                />
              </div>
            </div>

            <div className="">
              <label htmlFor="transportMode" className="customLabelCss">
                Transport Mode
              </label>
              <select
                id="transportMode"
                name="transportMode"
                value={formData.transportMode}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              >
                <option>Select</option>
                <option value="School Bus">School Bus</option>
                <option value="Private Van">Private Van</option>
                <option value="Self">Self</option>
              </select>
              <input
                type="text"
                id="vehicleNumber"
                name="vehicleNumber"
                placeholder="Vehicle No."
                value={formData.vehicleNumber}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
            </div>

            <div className="">
              <label htmlFor="allergies" className="customLabelCss">
                Allergies(if any)
              </label>
              <input
                type="text"
                id="allergies"
                name="allergies"
                value={formData.allergies}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
            </div>

            <div className="">
              <label htmlFor="height" className="customLabelCss">
                Height
              </label>
              <input
                type="text"
                id="height"
                name="height"
                value={formData.height}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
            </div>

            <div className="">
              <label htmlFor="weight" className="customLabelCss">
                Weight
              </label>
              <input
                type="text"
                id="weight"
                name="weight"
                value={formData.weight}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
            </div>
            <div className=" flex gap-6 pt-[7px]">
              <div htmlFor="weight" className="text-left max-w-full font-[700]">
                Has Spectacles
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="yes"
                    name="hasSpectacles"
                    checked={formData.hasSpectacles === "Yes"}
                    value="Yes"
                    onChange={handleChange}
                    // onBlur={handleBlur}
                  />
                  <label htmlFor="yes" className="ml-1">
                    Yes
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="no"
                    name="hasSpectacles"
                    checked={formData.hasSpectacles === "No"}
                    value="No"
                    onChange={handleChange}
                    // onBlur={handleBlur}
                  />
                  <label htmlFor="no" className="ml-1">
                    No
                  </label>
                </div>
              </div>
            </div>
            {/* ... */}
            <div className="">
              <label htmlFor="email" className="block font-bold text-xs mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
              />
              {errors.email && (
                <span className="text-red-500 text-xs">{errors.email}</span>
              )}
            </div>
            {/* Add other form fields similarly */}
            {/* ... */}
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Form;
