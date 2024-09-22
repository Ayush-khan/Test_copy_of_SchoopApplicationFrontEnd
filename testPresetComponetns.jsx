
// // // test componen for created by nikhil bhai createstudent form
// // // import { useState } from "react";
// // // import { Link, useNavigate } from "react-router-dom"; // Import Link component from react-router-dom
// // // import axios from "axios";
// // // import "../componants/studentstyle.css";
// // // // Base URL for your API
// // // function CreateStudent() {
// // //   const API_URL = import.meta.env.VITE_API_URL;
// // //   const [formData, setFormData] = useState({
// // //     first_name: "",
// // //     middle_name: "",
// // //     last_name: "",
// // //     house: "",
// // //     admitted_in_class: "",
// // //     gender: "",
// // //     blood_group: "",
// // //     nationality: "",
// // //     birth_place: "",
// // //     mother_tongue: "",
// // //     emergency_name: "",
// // //     date_of_birth: "",
// // //     date_of_admission: "",
// // //     grn_no: "",
// // //     student_id_no: "",
// // //     student_aadhaar_no: "",
// // //     class: "",
// // //     division: "",
// // //     address: "",
// // //     city: "",
// // //     state: "",
// // //     pincode: "",
// // //     religion: "",
// // //     caste: "",
// // //     emergency_address: "",
// // //     emergency_contact: "",
// // //     transport_mode: "",
// // //     vehicle_no: "",
// // //     allergies: "",
// // //     height: "",
// // //     roll_no: "",
// // //     category: "",
// // //     weight: "",
// // //     has_spectacles: "0",
// // //   });

// // //   const navigate = useNavigate();
// // //   // const token = localStorage.getItem("authToken");

// // //   const handleChange = (e) => {
// // //     const { name, value, type, checked } = e.target;
// // //     setFormData({
// // //       ...formData,
// // //       [name]: type === "checkbox" ? checked : value,
// // //     });
// // //   };

// // //   const handleSubmit = async (e) => {
// // //     e.preventDefault();
// // //     const token = localStorage.getItem("authToken");

// // //     try {
// // //       if (!token) {
// // //         throw new Error("No authentication token found");
// // //       }
// // //       const response = await axios.post(`${API_URL}/api/students`, formData, {
// // //         headers: {
// // //           Authorization: `Bearer ${token}`,
// // //         },
// // //       });
// // //       alert(response.data.message);
// // //       navigate("/student-list");
// // //     } catch (error) {
// // //       console.error("Error creating student:", error);
// // //       alert("There was an error creating the student.");
// // //     }
// // //   };

// // //   return (
// // //     <div className="container-fluid mt-4">
// // //       <div className="row">
// // //         <div className="row justify-content-center">
// // //           <div className="col-md-11">
// // //             <div className="card">
// // //               <div className="card-header">
// // //                 <h4 className="">Add Student</h4>
// // //                 <p>In this page you can add student information</p>
// // //               </div>
// // //               <div className="card-body ">
// // //                 {/* <form onSubmit={handleSubmit}>
// // //                                     <h4>Personal Information</h4>
// // //                                     <div className="form-group row">
// // //                                         <div className="col-md-3 mb-2">
// // //                                             <label htmlFor="first_name">First Name</label>
// // //                                             <input type="text" id="first_name" name="first_name" placeholder="eg. John" className="form-control mob" required onChange={handleChange} value={formData.first_name} />
// // //                                         </div>
// // //                                         <div className="col-md-3 mb-2">
// // //                                             <label htmlFor="middle_name">Middle Name</label>
// // //                                             <input type="text" id="middle_name" name="middle_name" placeholder="eg. A." className="form-control" onChange={handleChange} value={formData.middle_name} />
// // //                                         </div>
// // //                                         <div className="col-md-3 mb-2">
// // //                                             <label htmlFor="last_name">Last Name</label>
// // //                                             <input type="text" id="last_name" name="last_name" placeholder="eg. Doe" className="form-control" required onChange={handleChange} value={formData.last_name} />
// // //                                         </div>
// // //                                         <div className="col-md-3 mb-2">
// // //                                             <label htmlFor="gender">Gender</label>
// // //                                             <input type="text" id="gender" name="gender" placeholder="eg. Male" className="form-control" required onChange={handleChange} value={formData.gender} />
// // //                                         </div>

// // //                                         <div className="col-md-3 mb-2">
// // //                                             <label htmlFor="house">House</label>
// // //                                             <input type="text" id="house" name="house" placeholder="eg. Green House" className="form-control" onChange={handleChange} value={formData.house} />
// // //                                         </div>
// // //                                         <div className="col-md-3 mb-2">
// // //                                             <label htmlFor="nationality">Nationality</label>
// // //                                             <input type="text" id="nationality" name="nationality" placeholder="eg. Indian" className="form-control" onChange={handleChange} value={formData.nationality} />
// // //                                         </div>
// // //                                         <div className="col-md-3 mb-2">
// // //                                             <label htmlFor="birth_place">Birth Place</label>
// // //                                             <input type="text" id="birth_place" name="birth_place" placeholder="eg. Mumbai" className="form-control" onChange={handleChange} value={formData.birth_place} />
// // //                                         </div>

// // //                                         <div className="col-md-3 mb-2">
// // //                                             <label htmlFor="mother_tongue">Mother Tongue</label>
// // //                                             <input type="text" id="mother_tongue" name="mother_tongue" placeholder="eg. Hindi" className="form-control" onChange={handleChange} value={formData.mother_tongue} />
// // //                                         </div>

// // //                                         <div className="col-md-3 mb-2">
// // //                                             <label htmlFor="emergency_name">Emergency Name</label>
// // //                                             <input type="text" id="emergency_name" name="emergency_name" placeholder="eg. Jane Doe" className="form-control" onChange={handleChange} value={formData.emergency_name} />
// // //                                         </div>
// // //                                         <div className="col-md-3 mb-2">
// // //                                             <label htmlFor="date_of_birth">Date of Birth</label>
// // //                                             <input type="date" id="date_of_birth" name="date_of_birth" className="form-control" required onChange={handleChange} value={formData.date_of_birth} />
// // //                                         </div>
// // //                                         <div className="col-md-3 mb-2">
// // //                                             <label htmlFor="student_aadhaar_no">Student Aadhaar No</label>
// // //                                             <input type="text" id="student_aadhaar_no" name="student_aadhaar_no" placeholder="eg. 9876-5432-1234" className="form-control" onChange={handleChange} value={formData.student_aadhaar_no} />
// // //                                         </div>

// // //                                         <div className="col-md-3 mb-2">
// // //                                             <label htmlFor="religion">Religion</label>
// // //                                             <input type="text" id="religion" name="religion" placeholder="eg. Hinduism" className="form-control" onChange={handleChange} value={formData.religion} />
// // //                                         </div>
// // //                                         <div className="col-md-3 mb-2">
// // //                                             <label htmlFor="caste">Caste</label>
// // //                                             <input type="text" id="caste" name="caste" placeholder="eg. Brahmin" className="form-control" onChange={handleChange} value={formData.caste} />
// // //                                         </div>

// // //                                         <div className="col-md-3 mb-2">
// // //                                             <label htmlFor="category">Category</label>
// // //                                             <input type="text" id="category" name="category" placeholder="eg. General" className="form-control" onChange={handleChange} value={formData.category} />
// // //                                         </div>

// // //                                         <h4>Address Information</h4>

// // //                                         <div className="col-md-3 mb-2">
// // //                                             <label htmlFor="address">Address</label>
// // //                                             <input type="text" id="address" name="address" placeholder="eg. 123 Main St" className="form-control" onChange={handleChange} value={formData.address} />
// // //                                         </div>
// // //                                         <div className="col-md-3 mb-2">
// // //                                             <label htmlFor="city">City</label>
// // //                                             <input type="text" id="city" name="city" placeholder="eg. Mumbai" className="form-control" onChange={handleChange} value={formData.city} />
// // //                                         </div>
// // //                                         <div className="col-md-3 mb-2">
// // //                                             <label htmlFor="state">State</label>
// // //                                             <input type="text" id="state" name="state" placeholder="eg. Maharashtra" className="form-control" onChange={handleChange} value={formData.state} />
// // //                                         </div>
// // //                                         <div className="col-md-3 mb-2">
// // //                                             <label htmlFor="pincode">Pincode</label>
// // //                                             <input type="text" id="pincode" name="pincode" placeholder="eg. 400001" className="form-control" onChange={handleChange} value={formData.pincode} />
// // //                                         </div>

// // //                                         <h4>Other Information</h4>

// // //                                         <div className="col-md-3 mb-2">
// // //                                             <label htmlFor="allergies">Allergies</label>
// // //                                             <input type="text" id="allergies" name="allergies" placeholder="eg. Peanuts" className="form-control" onChange={handleChange} value={formData.allergies} />
// // //                                         </div>
// // //                                         <div className="col-md-3 mb-2">
// // //                                             <label htmlFor="has_spectacles">Has Spectacles?</label>
// // //                                             <input type="checkbox" id="has_spectacles" name="has_spectacles" className="form-check-input" onChange={handleChange} checked={formData.has_spectacles} />
// // //                                         </div>
// // //                                     </div>

// // //                                 </form> */}
// // //                 <form onSubmit={handleSubmit}>
// // //                   <h4>Personal Information</h4>
// // //                   <div className="form-group row">
// // //                     <div className="col-md-3 mb-2">
// // //                       <label htmlFor="first_name">First Name</label>
// // //                       <input
// // //                         type="text"
// // //                         id="first_name"
// // //                         name="first_name"
// // //                         placeholder="eg. John"
// // //                         className="form-control mob"
// // //                         required
// // //                         onChange={handleChange}
// // //                         value={formData.first_name}
// // //                       />
// // //                     </div>
// // //                     <div className="col-md-3 mb-2">
// // //                       <label htmlFor="middle_name">Middle Name</label>
// // //                       <input
// // //                         type="text"
// // //                         id="middle_name"
// // //                         name="middle_name"
// // //                         placeholder="eg. A."
// // //                         className="form-control"
// // //                         onChange={handleChange}
// // //                         value={formData.middle_name}
// // //                       />
// // //                     </div>
// // //                     <div className="col-md-3 mb-2">
// // //                       <label htmlFor="last_name">Last Name</label>
// // //                       <input
// // //                         type="text"
// // //                         id="last_name"
// // //                         name="last_name"
// // //                         placeholder="eg. Doe"
// // //                         className="form-control"
// // //                         required
// // //                         onChange={handleChange}
// // //                         value={formData.last_name}
// // //                       />
// // //                     </div>
// // //                     {/* <div className="col-md-3 mb-2">
// // //                                             <label htmlFor="gender">Gender</label>
// // //                                             <input type="text" id="gender" name="gender" placeholder="eg. Male" className="form-control" required onChange={handleChange} value={formData.gender} />
// // //                                         </div> */}
// // //                     <div className="col-md-3 mb-2">
// // //                       <label htmlFor="gender">Gender</label>
// // //                       <select
// // //                         id="gender"
// // //                         name="gender"
// // //                         className="form-control"
// // //                         required
// // //                         onChange={handleChange}
// // //                         value={formData.gender}
// // //                       >
// // //                         <option value="" selected disabled>
// // //                           Select Gender
// // //                         </option>
// // //                         <option value="Male">Male</option>
// // //                         <option value="Female">Female</option>
// // //                         <option value="Other">Other</option>
// // //                       </select>
// // //                     </div>

// // //                     <div className="col-md-3 mb-2">
// // //                       <label htmlFor="house">House</label>
// // //                       <input
// // //                         type="text"
// // //                         id="house"
// // //                         name="house"
// // //                         placeholder="eg. Green House"
// // //                         className="form-control"
// // //                         required
// // //                         onChange={handleChange}
// // //                         value={formData.house}
// // //                       />
// // //                     </div>
// // //                     <div className="col-md-3 mb-2">
// // //                       <label htmlFor="nationality">Nationality</label>
// // //                       <input
// // //                         type="text"
// // //                         id="nationality"
// // //                         name="nationality"
// // //                         placeholder="eg. Indian"
// // //                         className="form-control"
// // //                         required
// // //                         onChange={handleChange}
// // //                         value={formData.nationality}
// // //                       />
// // //                     </div>
// // //                     <div className="col-md-3 mb-2">
// // //                       <label htmlFor="birth_place">Birth Place</label>
// // //                       <input
// // //                         type="text"
// // //                         id="birth_place"
// // //                         name="birth_place"
// // //                         placeholder="eg. Mumbai"
// // //                         className="form-control"
// // //                         required
// // //                         onChange={handleChange}
// // //                         value={formData.birth_place}
// // //                       />
// // //                     </div>

// // //                     {/* <div className="col-md-3 mb-2">
// // //                                             <label htmlFor="mother_tongue">Mother Tongue</label>
// // //                                             <input type="text" id="mother_tongue" name="mother_tongue" placeholder="eg. Hindi" className="form-control" required onChange={handleChange} value={formData.mother_tongue} />
// // //                                         </div> */}

// // //                     <div className="col-md-3 mb-2">
// // //                       <label htmlFor="mother_tongue">Mother Tongue</label>
// // //                       <select
// // //                         id="mother_tongue"
// // //                         name="mother_tongue"
// // //                         className="form-control"
// // //                         required
// // //                         onChange={handleChange}
// // //                         value={formData.mother_tongue}
// // //                       >
// // //                         <option value="" selected disabled>
// // //                           Select Mother Tongue
// // //                         </option>
// // //                         <option value="Assamese">Assamese</option>
// // //                         <option value="Bengali">Bengali</option>
// // //                         <option value="Gujarati">Gujarati</option>
// // //                         <option value="Hindi">Hindi</option>
// // //                         <option value="Kannada">Kannada</option>
// // //                         <option value="Kashmiri">Kashmiri</option>
// // //                         <option value="Konkani">Konkani</option>
// // //                         <option value="Malayalam">Malayalam</option>
// // //                         <option value="Manipuri">Manipuri</option>
// // //                         <option value="Marathi">Marathi</option>
// // //                         <option value="Nepali">Nepali</option>
// // //                         <option value="Odia">Odia</option>
// // //                         <option value="Punjabi">Punjabi</option>
// // //                         <option value="Sanskrit">Sanskrit</option>
// // //                         <option value="Sindhi">Sindhi</option>
// // //                         <option value="Tamil">Tamil</option>
// // //                         <option value="Telugu">Telugu</option>
// // //                         <option value="Urdu">Urdu</option>
// // //                       </select>
// // //                     </div>

// // //                     <div className="col-md-3 mb-2">
// // //                       <label htmlFor="emergency_name">Emergency Name</label>
// // //                       <input
// // //                         type="text"
// // //                         id="emergency_name"
// // //                         name="emergency_name"
// // //                         placeholder="eg. Jane Doe"
// // //                         className="form-control"
// // //                         required
// // //                         onChange={handleChange}
// // //                         value={formData.emergency_name}
// // //                       />
// // //                     </div>
// // //                     <div className="col-md-3 mb-2">
// // //                       <label htmlFor="date_of_birth">Date of Birth</label>
// // //                       <input
// // //                         type="date"
// // //                         id="date_of_birth"
// // //                         name="date_of_birth"
// // //                         className="form-control"
// // //                         required
// // //                         onChange={handleChange}
// // //                         value={formData.date_of_birth}
// // //                       />
// // //                     </div>
// // //                     <div className="col-md-3 mb-2">
// // //                       <label htmlFor="student_aadhaar_no">
// // //                         Student Aadhaar No
// // //                       </label>
// // //                       <input
// // //                         type="text"
// // //                         id="student_aadhaar_no"
// // //                         name="student_aadhaar_no"
// // //                         placeholder="eg. 9876-5432-1234"
// // //                         required
// // //                         className="form-control"
// // //                         onChange={handleChange}
// // //                         value={formData.student_aadhaar_no}
// // //                       />
// // //                     </div>

// // //                     {/* <div className="col-md-3 mb-2">
// // //                                             <label htmlFor="religion">Religion</label>
// // //                                             <input type="text" id="religion" name="religion" placeholder="eg. Hinduism" className="form-control" required onChange={handleChange} value={formData.religion} />
// // //                                         </div> */}

// // //                     <div className="col-md-3 mb-2">
// // //                       <label htmlFor="religion">Religion</label>
// // //                       <select
// // //                         id="religion"
// // //                         name="religion"
// // //                         className="form-control"
// // //                         required
// // //                         onChange={handleChange}
// // //                         value={formData.religion}
// // //                       >
// // //                         <option value="" selected disabled>
// // //                           Select Religion
// // //                         </option>
// // //                         <option value="Hinduism">Hinduism</option>
// // //                         <option value="Islam">Islam</option>
// // //                         <option value="Christianity">Christianity</option>
// // //                         <option value="Christianity">Jain</option>
// // //                         <option value="Christianity">Buddhist</option>
// // //                       </select>
// // //                     </div>

// // //                     <div className="col-md-3 mb-2">
// // //                       <label htmlFor="caste">Caste</label>
// // //                       <input
// // //                         type="text"
// // //                         id="caste"
// // //                         name="caste"
// // //                         placeholder="eg. Brahmin"
// // //                         className="form-control"
// // //                         required
// // //                         onChange={handleChange}
// // //                         value={formData.caste}
// // //                       />
// // //                     </div>

// // //                     <div className="col-md-3 mb-2">
// // //                       <label htmlFor="category">Category</label>
// // //                       <input
// // //                         type="text"
// // //                         id="category"
// // //                         name="category"
// // //                         placeholder="eg. General"
// // //                         className="form-control"
// // //                         required
// // //                         onChange={handleChange}
// // //                         value={formData.category}
// // //                       />
// // //                     </div>

// // //                     <h4>Address Information</h4>

// // //                     <div className="col-md-3 mb-2">
// // //                       <label htmlFor="address">Address</label>
// // //                       <input
// // //                         type="text"
// // //                         id="address"
// // //                         name="address"
// // //                         placeholder="eg. 123 Main St"
// // //                         className="form-control"
// // //                         required
// // //                         onChange={handleChange}
// // //                         value={formData.address}
// // //                       />
// // //                     </div>
// // //                     <div className="col-md-3 mb-2">
// // //                       <label htmlFor="city">City</label>
// // //                       <input
// // //                         type="text"
// // //                         id="city"
// // //                         name="city"
// // //                         placeholder="eg. Mumbai"
// // //                         className="form-control"
// // //                         required
// // //                         onChange={handleChange}
// // //                         value={formData.city}
// // //                       />
// // //                     </div>
// // //                     <div className="col-md-3 mb-2">
// // //                       <label htmlFor="state">State</label>
// // //                       <input
// // //                         type="text"
// // //                         id="state"
// // //                         name="state"
// // //                         placeholder="eg. Maharashtra"
// // //                         className="form-control"
// // //                         required
// // //                         onChange={handleChange}
// // //                         value={formData.state}
// // //                       />
// // //                     </div>
// // //                     <div className="col-md-3 mb-2">
// // //                       <label htmlFor="pincode">Pincode</label>
// // //                       <input
// // //                         type="text"
// // //                         id="pincode"
// // //                         name="pincode"
// // //                         placeholder="eg. 400001"
// // //                         className="form-control"
// // //                         required
// // //                         onChange={handleChange}
// // //                         value={formData.pincode}
// // //                       />
// // //                     </div>

// // //                     <div className="col-md-3 mb-2">
// // //                       <label htmlFor="emergency_address">
// // //                         Emergency Address
// // //                       </label>
// // //                       <input
// // //                         type="text"
// // //                         id="emergency_address"
// // //                         name="emergency_address"
// // //                         placeholder="eg. 123 Emergency Street"
// // //                         required
// // //                         className="form-control"
// // //                         onChange={handleChange}
// // //                         value={formData.emergency_address}
// // //                       />
// // //                     </div>
// // //                     <div className="col-md-3 mb-2">
// // //                       <label htmlFor="emergency_contact">
// // //                         Emergency Contact
// // //                       </label>
// // //                       <input
// // //                         type="text"
// // //                         id="emergency_contact"
// // //                         name="emergency_contact"
// // //                         placeholder="eg. +1234567890"
// // //                         required
// // //                         className="form-control"
// // //                         onChange={handleChange}
// // //                         value={formData.emergency_contact}
// // //                       />
// // //                     </div>
// // //                     <div className="col-md-3 mb-2">
// // //                       <label htmlFor="transport_mode">Transport Mode</label>
// // //                       <input
// // //                         type="text"
// // //                         id="transport_mode"
// // //                         name="transport_mode"
// // //                         placeholder="eg. Bus"
// // //                         className="form-control"
// // //                         required
// // //                         onChange={handleChange}
// // //                         value={formData.transport_mode}
// // //                       />
// // //                     </div>
// // //                     <div className="col-md-3 mb-2">
// // //                       <label htmlFor="vehicle_no">Vehicle No</label>
// // //                       <input
// // //                         type="text"
// // //                         id="vehicle_no"
// // //                         name="vehicle_no"
// // //                         placeholder="eg. MH-01-AB-1234"
// // //                         className="form-control"
// // //                         required
// // //                         onChange={handleChange}
// // //                         value={formData.vehicle_no}
// // //                       />
// // //                     </div>

// // //                     <h4>Medical Information</h4>

// // //                     <div className="col-md-3 mb-2">
// // //                       <label htmlFor="weight">Weight</label>
// // //                       <input
// // //                         type="text"
// // //                         id="weight"
// // //                         name="weight"
// // //                         placeholder="eg. 70"
// // //                         className="form-control"
// // //                         required
// // //                         onChange={handleChange}
// // //                         value={formData.weight}
// // //                       />
// // //                     </div>

// // //                     <div className="col-md-3 mb-2">
// // //                       <label htmlFor="blood_group">Blood Group</label>
// // //                       <input
// // //                         type="text"
// // //                         id="blood_group"
// // //                         name="blood_group"
// // //                         placeholder="eg. A+"
// // //                         required
// // //                         className="form-control"
// // //                         onChange={handleChange}
// // //                         value={formData.blood_group}
// // //                       />
// // //                     </div>
// // //                     <div className="col-md-3 mb-2">
// // //                       <label htmlFor="allergies">Allergies</label>
// // //                       <input
// // //                         type="text"
// // //                         id="allergies"
// // //                         name="allergies"
// // //                         placeholder="eg. Pollen, Dust"
// // //                         required
// // //                         className="form-control"
// // //                         onChange={handleChange}
// // //                         value={formData.allergies}
// // //                       />
// // //                     </div>

// // //                     <div className="col-md-3 mb-2">
// // //                       <label>Has Spectacles</label>
// // //                       <div className="row">
// // //                         <div className="form-check mr-6">
// // //                           <input
// // //                             type="radio"
// // //                             id="has_spectacles_yes"
// // //                             name="has_spectacles"
// // //                             className="form-check-input"
// // //                             value="0"
// // //                             onChange={handleChange}
// // //                             checked={formData.has_spectacles == true}
// // //                           />
// // //                           <label
// // //                             htmlFor="has_spectacles_yes"
// // //                             className="form-check-label"
// // //                           >
// // //                             Yes
// // //                           </label>
// // //                         </div>
// // //                         <div className="form-check">
// // //                           <input
// // //                             type="radio"
// // //                             id="has_spectacles_no"
// // //                             name="has_spectacles"
// // //                             className="form-check-input"
// // //                             value="1"
// // //                             onChange={handleChange}
// // //                             checked={formData.has_spectacles == false}
// // //                           />
// // //                           <label
// // //                             htmlFor="has_spectacles_no"
// // //                             className="form-check-label"
// // //                           >
// // //                             No
// // //                           </label>
// // //                         </div>
// // //                       </div>
// // //                     </div>

// // //                     <h4>School Information</h4>

// // //                     <div className="col-md-3 mb-2">
// // //                       <label htmlFor="admitted_in_class">
// // //                         Admitted in Class
// // //                       </label>
// // //                       <input
// // //                         type="text"
// // //                         id="admitted_in_class"
// // //                         name="admitted_in_class"
// // //                         placeholder="eg. 5th"
// // //                         required
// // //                         className="form-control"
// // //                         onChange={handleChange}
// // //                         value={formData.admitted_in_class}
// // //                       />
// // //                     </div>

// // //                     <div className="col-md-3 mb-2">
// // //                       <label htmlFor="date_of_admission">
// // //                         Date of Admission
// // //                       </label>
// // //                       <input
// // //                         type="date"
// // //                         id="date_of_admission"
// // //                         name="date_of_admission"
// // //                         className="form-control"
// // //                         required
// // //                         onChange={handleChange}
// // //                         value={formData.date_of_admission}
// // //                       />
// // //                     </div>
// // //                     <div className="col-md-3 mb-2">
// // //                       <label htmlFor="grn_no">GRN No</label>
// // //                       <input
// // //                         type="text"
// // //                         id="grn_no"
// // //                         name="grn_no"
// // //                         placeholder="eg. 12345"
// // //                         className="form-control"
// // //                         required
// // //                         onChange={handleChange}
// // //                         value={formData.grn_no}
// // //                       />
// // //                     </div>
// // //                     <div className="col-md-3 mb-2">
// // //                       <label htmlFor="student_id_no">Student ID No</label>
// // //                       <input
// // //                         type="text"
// // //                         id="student_id_no"
// // //                         name="student_id_no"
// // //                         placeholder="eg. 67890"
// // //                         required
// // //                         className="form-control"
// // //                         onChange={handleChange}
// // //                         value={formData.student_id_no}
// // //                       />
// // //                     </div>

// // //                     {/* <div className="col-md-3 mb-2">
// // //                                             <label htmlFor="class">Class</label>
// // //                                             <input type="text" id="class" name="class" placeholder="eg. 5th" className="form-control" required onChange={handleChange} value={formData.class} />
// // //                                         </div>
// // //                                         <div className="col-md-3 mb-2">
// // //                                             <label htmlFor="division">Division</label>
// // //                                             <input type="text" id="division" name="division" placeholder="eg. A" className="form-control" required onChange={handleChange} value={formData.division} />
// // //                                         </div> */}

// // //                     <div className="col-md-3 mb-2">
// // //                       <label htmlFor="class">Class</label>
// // //                       <select
// // //                         id="class"
// // //                         name="class"
// // //                         className="form-control"
// // //                         required
// // //                         onChange={handleChange}
// // //                         value={formData.class}
// // //                       >
// // //                         <option value="" selected disabled>
// // //                           Select Class
// // //                         </option>
// // //                         <option value="Nursery">Nursery</option>
// // //                         <option value="KG">KG</option>
// // //                         <option value="1">1</option>
// // //                         <option value="2">2</option>
// // //                         <option value="3">3</option>
// // //                         <option value="4">4</option>
// // //                         <option value="5">5</option>
// // //                         <option value="6">6</option>
// // //                         <option value="7">7</option>
// // //                         <option value="8">8</option>
// // //                         <option value="9">9</option>
// // //                         <option value="10">10</option>
// // //                         <option value="11">11</option>
// // //                         <option value="12">12</option>
// // //                       </select>
// // //                     </div>

// // //                     <div className="col-md-3 mb-2">
// // //                       <label htmlFor="division">Division</label>
// // //                       <select
// // //                         id="division"
// // //                         name="division"
// // //                         className="form-control"
// // //                         required
// // //                         onChange={handleChange}
// // //                         value={formData.division}
// // //                       >
// // //                         <option value="" selected disabled>
// // //                           Select Division
// // //                         </option>
// // //                         <option value="A">A</option>
// // //                         <option value="B">B</option>
// // //                         <option value="C">C</option>
// // //                         <option value="D">D</option>
// // //                       </select>
// // //                     </div>

// // //                     <div className="col-md-3 mb-2">
// // //                       <label htmlFor="height">Height</label>
// // //                       <input
// // //                         type="text"
// // //                         id="height"
// // //                         name="height"
// // //                         placeholder="eg. 175"
// // //                         className="form-control"
// // //                         required
// // //                         onChange={handleChange}
// // //                         value={formData.height}
// // //                       />
// // //                     </div>
// // //                     <div className="col-md-3 mb-2">
// // //                       <label htmlFor="roll_no">Roll No</label>
// // //                       <input
// // //                         type="text"
// // //                         id="roll_no"
// // //                         name="roll_no"
// // //                         placeholder="eg. 101"
// // //                         className="form-control"
// // //                         required
// // //                         onChange={handleChange}
// // //                         value={formData.roll_no}
// // //                       />
// // //                     </div>

// // //                     <div className="col-3 mb-2"></div>
// // //                     <div className="col-3 mb-2"></div>
// // //                     <div className="col-3 mb-2"></div>
// // //                     <div className="col-3 mb-2"></div>
// // //                     <div className="col-3 mb-2"></div>
// // //                     <div className="col-2 mb-2"></div>

// // //                     <div className="col-md-3 mb-2">
// // //                       <button type="submit" className="btn btn-primary ml-2">
// // //                         Save Student
// // //                       </button>
// // //                       &nbsp;&nbsp;&nbsp;
// // //                       <Link to="/student-list">
// // //                         {" "}
// // //                         <button className="btn btn-danger ml-2">
// // //                           Back
// // //                         </button>{" "}
// // //                       </Link>
// // //                     </div>
// // //                   </div>
// // //                 </form>
// // //               </div>
// // //             </div>
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // // export default CreateStudent;


// // import React, { useState, useEffect } from "react";
// // import { FaUserCircle } from "react-icons/fa";
// // import { RxCross1 } from "react-icons/rx";
// // import { useNavigate, useLocation } from "react-router-dom";
// // import axios from "axios";
// // import { ToastContainer, toast } from "react-toastify";
// // import "react-toastify/dist/ReactToastify.css";
// // // import ImageCropper from "../common/ImageUploadAndCrop";
// // import ImageCropper from "../common/ImageUploadAndCrop";
// // function Form() {
// //   const API_URL = import.meta.env.VITE_API_URL;
// //   const navigate = useNavigate();
// //   const location = useLocation();
// //   const { student } = location.state || {};
// //   console.log("Staff is in edit form***", student);

// //   const [formData, setFormData] = useState({
// //     first_name: "",
// //     mid_name: "",
// //     last_name: "",
// //     house: "",
// //     student_name: "",
// //     dob: "",
// //     admission_date: "",
// //     stud_id_no: "",
// //     stu_aadhaar_no: "",
// //     gender: "",
// //     mother_tongue: "",
// //     birth_place: "",
// //     admission_class: " ",
// //     city: " ",
// //     state: "",
// //     roll_no: "",
// //     class_id: "",
// //     section_id: "",
// //     religion: "",
// //     caste: "",
// //     subcaste: "",
// //     vehicle_no: "",
// //     emergency_name: " ",
// //     emergency_contact: "",
// //     emergency_add: "",
// //     height: "",
// //     weight: "",
// //     allergies: "",
// //     nationality: "",
// //     pincode: "",
// //     image_name: "",
// //     // Parent information
// //     father_name: "  .",
// //     father_occupation: "",
// //     f_office_add: "  ",
// //     f_office_tel: "",
// //     f_mobile: "",
// //     f_email: "",
// //     father_adhar_card: "",
// //     mother_name: " ",
// //     mother_occupation: "",
// //     m_office_add: " ",
// //     m_office_tel: "",
// //     m_mobile: "",
// //     m_emailid: "",
// //     mother_adhar_card: "",

// //     // Preferences
// //     SetToReceiveSMS: "",
// //     SetEmailIDAsUsername: "",

// //     // Base64 Image (optional)
// //     student_image: "",
// //   });
// //   // console.log("the formdata set", formData);
// //   const [errors, setErrors] = useState({});
// //   const [photoPreview, setPhotoPreview] = useState(null);
// //   const [backendErrors, setBackendErrors] = useState({});
// //   // Maximum date for date_of_birth
// //   const MAX_DATE = "2006-12-31";
// //   // Get today's date in YYYY-MM-DD format
// //   const today = new Date().toISOString().split("T")[0];

// //   console.log("employeeID", student.employeeId);
// //   useEffect(() => {
// //     if (student) {
// //       setFormData({
// //         first_name: student.first_name || " ",
// //         mid_name: student.mid_name || "",
// //         last_name: student.last_name || "",
// //         house: student.house || "",
// //         student_name: student.student_name || "",
// //         dob: student.dob || "",
// //         admission_date: student.admission_date || "",
// //         stud_id_no: student.stud_id_no || "",
// //         stu_aadhaar_no: student.stu_aadhaar_no || "",
// //         gender: student.gender || "",
// //         mother_tongue: student.mother_tongue || "",
// //         birth_place: student.birth_place || "",
// //         admission_class: student.admission_class || " ",
// //         city: student.city || " ",
// //         state: student.state || "",
// //         roll_no: student.roll_no || "",
// //         class_id: student.class_id || "",
// //         section_id: student.section_id || "",
// //         religion: student.religion || "",
// //         caste: student.caste || "",
// //         subcaste: student.subcaste || "",
// //         vehicle_no: student.vehicle_no || "",
// //         emergency_name: student.emergency_name || " ",
// //         emergency_contact: student.emergency_contact || "",
// //         emergency_add: student.emergency_add || "",
// //         height: student.height || "",
// //         weight: student.weight || "",
// //         allergies: student.allergies || "",
// //         nationality: student.nationality || "",
// //         pincode: student.pincode || "",
// //         image_name: student.image_name || "",
// //         // Parent information
// //         father_name: student.father_name || " ",
// //         father_occupation: student.father_occupation || "",
// //         f_office_add: student.f_office_add || "  ",
// //         f_office_tel: student.f_office_tel || "",
// //         f_mobile: student.f_mobile || "",
// //         f_email: student.f_email || "",
// //         father_adhar_card: student.father_adhar_card || "",
// //         mother_name: student.mother_name || " ",
// //         mother_occupation: student.mother_occupation || "",
// //         m_office_add: student.m_office_add || " ",
// //         m_office_tel: student.m_office_tel || "",
// //         m_mobile: student.m_mobile || "",
// //         m_emailid: student.m_emailid || "",
// //         mother_adhar_card: student.mother_adhar_card || "",

// //         // Preferences
// //         SetToReceiveSMS: student.SetToReceiveSMS || "",
// //         SetEmailIDAsUsername: student.SetEmailIDAsUsername || "",

// //         // Base64 Image (optional)
// //         // student_image: student.student_image || "",
// //       });
// //       if (student.student_image) {
// //         setPhotoPreview(
// //           // `${API_URL}/path/to/images/${student.teacher_image_name}`
// //           `${student.student_image}`
// //         );
// //       }
// //     }
// //   }, [student, API_URL]);
// //   // Validation functions
// //   const validatePhone = (phone) => {
// //     if (!phone) return "Phone number is required";
// //     if (!/^\d{10}$/.test(phone)) return "Phone number must be 10 digits";
// //     return null;
// //   };

// //   const validateAadhar = (aadhar) => {
// //     if (!aadhar) return "Aadhar card number is required";
// //     if (!/^\d{12}$/.test(aadhar.replace(/\s+/g, "")))
// //       return "Aadhar card number must be 12 digits";
// //     return null;
// //   };

// //   const validateEmail = (email) => {
// //     if (!email) return "Email is required";
// //     if (!/\S+@\S+\.\S+/.test(email)) return "Email address is invalid";
// //     return null;
// //   };

// //   const validateExperience = (experience) => {
// //     if (!experience) return "Experience is required";
// //     if (!/^\d+$/.test(experience)) return "Experience must be a whole number";
// //     return null;
// //   };
// //   const validate = () => {
// //     const newErrors = {};
// //     // Validate name
// //     if (!formData.name) newErrors.name = "Name is required";
// //     else if (!/^[^\d].*/.test(formData.name))
// //       newErrors.name = "Name should not start with a number";
// //     if (!formData.birthday) newErrors.birthday = "Date of Birth is required";
// //     if (!formData.date_of_joining)
// //       newErrors.date_of_joining = "Date of Joining is required";
// //     if (!formData.sex) newErrors.sex = "Gender is required";
// //     if (!formData.address) newErrors.address = "Address is required";
// //     // / Validate phone number
// //     const phoneError = validatePhone(formData.phone);
// //     if (phoneError) newErrors.phone = phoneError;

// //     // Validate email
// //     const emailError = validateEmail(formData.email);
// //     if (emailError) newErrors.email = emailError;

// //     // Validate experience
// //     const experienceError = validateExperience(formData.experience);
// //     if (experienceError) newErrors.experience = experienceError;

// //     // Validate aadhar card number
// //     const aadharError = validateAadhar(formData.aadhar_card_no);
// //     if (aadharError) newErrors.aadhar_card_no = aadharError;

// //     if (!formData.designation)
// //       newErrors.designation = "Designation is required";
// //     if (!formData.employee_id)
// //       newErrors.employee_id = "Employee ID is required";
// //     if (formData.academic_qual.length === 0)
// //       newErrors.academic_qual =
// //         "Please select at least one academic qualification";
// //     return newErrors;
// //   };

// //   // const handleChange = (event) => {
// //   //   const { name, value, checked } = event.target;
// //   //   let newValue = value;

// //   //   if (name === "experience") {
// //   //     newValue = newValue.replace(/[^0-9]/g, "");
// //   //   } else if (name === "aadhar_card_no") {
// //   //     newValue = newValue.replace(/\s+/g, "");
// //   //   }
// //   //   if (name === "phone" || name === "aadhar_card_no") {
// //   //     newValue = newValue.replace(/[^\d]/g, "");
// //   //   }
// //   //   if (name === "academic_qual") {
// //   //     setFormData((prevData) => {
// //   //       const newAcademicQual = checked
// //   //         ? [...prevData.academic_qual, value]
// //   //         : prevData.academic_qual.filter(
// //   //             (qualification) => qualification !== value
// //   //           );
// //   //       return { ...prevData, academic_qual: newAcademicQual };
// //   //     });
// //   //   } else {
// //   //     setFormData((prevData) => ({
// //   //       ...prevData,
// //   //       [name]: newValue,
// //   //     }));
// //   //   }
// //   //   validate(); // Call validate on each change to show real-time errors
// //   // };
// //   const handleChange = (event) => {
// //     const { name, value, checked } = event.target;
// //     let newValue = value;

// //     if (name === "experience") {
// //       newValue = newValue.replace(/[^0-9]/g, "");
// //     } else if (name === "aadhar_card_no") {
// //       newValue = newValue.replace(/\s+/g, "");
// //     }
// //     if (name === "phone" || name === "aadhar_card_no") {
// //       newValue = newValue.replace(/[^\d]/g, "");
// //     }
// //     if (name === "academic_qual") {
// //       setFormData((prevData) => {
// //         const newAcademicQual = checked
// //           ? [...prevData.academic_qual, value]
// //           : prevData.academic_qual.filter(
// //               (qualification) => qualification !== value
// //             );
// //         return { ...prevData, academic_qual: newAcademicQual };
// //       });
// //     } else {
// //       setFormData((prevData) => ({
// //         ...prevData,
// //         [name]: newValue,
// //       }));
// //     }
// //     // Validate field based on name
// //     let fieldErrors = {};
// //     if (name === "phone") {
// //       fieldErrors.phone = validatePhone(newValue);
// //     } else if (name === "aadhar_card_no") {
// //       fieldErrors.aadhar_card_no = validateAadhar(newValue);
// //     } else if (name === "email") {
// //       fieldErrors.email = validateEmail(newValue);
// //     } else if (name === "experience") {
// //       fieldErrors.experience = validateExperience(newValue);
// //     }

// //     setErrors((prevErrors) => ({
// //       ...prevErrors,
// //       ...fieldErrors,
// //     }));
// //     // validate(); // Call validate on each change to show real-time errors
// //   };
// //   const handleFileChange = (event) => {
// //     const file = event.target.files[0];
// //     if (file) {
// //       setFormData((prevState) => ({
// //         ...prevState,
// //         teacher_image_name: file,
// //       }));
// //       setPhotoPreview(URL.createObjectURL(file));
// //     }
// //   };
// //   // const handleFileChange = (event) => {
// //   //   const file = event.target.files[0];
// //   //   setFormData((prevState) => ({
// //   //     ...prevState,
// //   //     teacher_image_name: file,
// //   //   }));
// //   //   setPhotoPreview(URL.createObjectURL(file));
// //   // };

// //   // Image Croping funtionlity
// //   const handleImageCropped = (croppedImageData) => {
// //     setFormData((prevData) => ({
// //       ...prevData,
// //       teacher_image_name: croppedImageData,
// //     }));
// //   };

// //   const handleSubmit = async (event) => {
// //     event.preventDefault();
// //     const validationErrors = validate();
// //     const errorsToCheck = validationErrors || {};
// //     // Check if there are any errors

// //     if (Object.keys(errorsToCheck).length > 0) {
// //       setErrors(errorsToCheck);
// //       Object.formData(errorsToCheck).forEach((error) => {
// //         toast.error(error);
// //       });
// //       return;
// //     }

// //     // Convert formData to the format expected by the API
// //     const formattedFormData = {
// //       ...formData,
// //       academic_qual: formData.academic_qual, // Ensure this is an array
// //       experience: String(formData.experience), // Ensure this is a string
// //       teacher_image_name: String(formData.teacher_image_name),
// //     };

// //     try {
// //       const token = localStorage.getItem("authToken");
// //       if (!token) {
// //         throw new Error("No authentication token is found");
// //       }
// //       console.log("the inseid edata of edit student", formattedFormData);
// //       const response = await axios.put(
// //         `${API_URL}/api/teachers/${student.teacher_id}`,
// //         formattedFormData,
// //         {
// //           headers: {
// //             "Content-Type": "application/json",
// //             Authorization: `Bearer ${token}`,
// //           },
// //         }
// //       );

// //       if (response.status === 200) {
// //         toast.success("Teacher updated successfully!");
// //         setTimeout(() => {
// //           navigate("/StaffList");
// //         }, 3000);
// //       }
// //     } catch (error) {
// //       toast.error("An error occurred while updating the teacher.");
// //       console.error("Error:", error.response?.data || error.message);
// //       if (error.response && error.response.data && error.response.data.errors) {
// //         // setErrors(error.response.data.errors);
// //         setBackendErrors(error.response.data.errors || {});
// //       } else {
// //         toast.error(error.message);
// //       }
// //     }
// //   };

// //   return (
// //     <div className="w-[95%] mx-auto p-4 ">
// //       <ToastContainer />
// //       <div className="card p-3 rounded-md ">
// //         <div className=" card-header mb-4 flex justify-between items-center ">
// //           <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
// //             Edit Student information
// //           </h5>

// //           <RxCross1
// //             className="float-end relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
// //             onClick={() => {
// //               navigate("/manageStudent");
// //             }}
// //           />
// //         </div>
// //         <div
// //           className=" relative w-full   -top-6 h-1  mx-auto bg-red-700"
// //           style={{
// //             backgroundColor: "#C03078",
// //           }}
// //         ></div>
// //         <p className="  md:absolute md:right-10  md:top-[10%]   text-gray-500 ">
// //           <span className="text-red-500">*</span>indicates mandatory information
// //         </p>
// //         <form
// //           onSubmit={handleSubmit}
// //           className="  md:mx-2 overflow-x-hidden shadow-md p-2 bg-gray-50"
// //         >
// //           <div className=" flex flex-col gap-4 md:grid  md:grid-cols-5 md:gap-x-14 md:mx-10 gap-y-1">
// //             <div className=" mx-auto   row-span-2   ">
// //               {/* {console.log("imagepreview",photoPreview)} */}
// //               <ImageCropper
// //                 photoPreview={photoPreview}
// //                 onImageCropped={handleImageCropped}
// //               />
// //             </div>
// //             {/* personal information */}

// //             {/* name */}
// //             <div className="">
// //               <label htmlFor="name" className="block font-bold  text-xs mb-2">
// //                 First Name <span className="text-red-500">*</span>
// //               </label>
// //               <input
// //                 type="text"
// //                 maxLength={60}
// //                 id="name"
// //                 name="name"
// //                 pattern="^[^\d].*"
// //                 title="Name should not start with a number"
// //                 required
// //                 value={formData.first_name}
// //                 onChange={handleChange}
// //                 className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
// //               />
// //               {errors.name && (
// //                 <span className="text-red-500 text-xs">{errors.name}</span>
// //               )}
// //             </div>

// //             {/* <div className="w-full sm:max-w-[30%]"> */}
// //             <div className="w-full px-4 relative">
// //               <label htmlFor="firstName" className="customLabelCss mandatory">
// //                 First Name
// //               </label>
// //               <input
// //                 type="text"
// //                 id="firstName"
// //                 name="firstName"
// //                 // value={formData.firstName}
// //                 value={formData.first_name}
// //                 className="customInputCss"
// //                 onChange={handleChange}
// //                 // onBlur={handleBlur}
// //               />
// //               {errors.firstName && touched.firstName ? (
// //                 <p className="text-[12px] text-red-500 mb-1">
// //                   {errors.firstName}
// //                 </p>
// //               ) : null}
// //             </div>

// //             <div className="w-full px-4">
// //               <label htmlFor="middleName" className="customLabelCss">
// //                 Middle Name
// //               </label>
// //               <input
// //                 type="text"
// //                 id="middleName"
// //                 name="middleName"
// //                 value={formData.mid_name}
// //                 className="customInputCss"
// //                 onChange={handleChange}
// //                 // onBlur={handleBlur}
// //               />
// //             </div>

// //             <div className="w-full px-4">
// //               <label htmlFor="lastName" className="customLabelCss">
// //                 Last Name
// //               </label>
// //               <input
// //                 type="text"
// //                 id="lastName"
// //                 name="lastName"
// //                 value={formData.last_name}
// //                 className="customInputCss"
// //                 onChange={handleChange}
// //                 // onBlur={handleBlur}
// //               />
// //             </div>

// //             <div className="w-full px-4">
// //               <label htmlFor="studentName" className="customLabelCss mandatory">
// //                 Student Name
// //               </label>
// //               <input
// //                 type="text"
// //                 id="studentName"
// //                 name="studentName"
// //                 value={formData.student_name}
// //                 className="customInputCss"
// //                 onChange={handleChange}
// //                 // onBlur={handleBlur}
// //               />
// //               {errors.studentName && touched.studentName ? (
// //                 <p className="text-[12px] text-red-500 mb-1">
// //                   {newErrors.studentName}
// //                 </p>
// //               ) : null}
// //             </div>

// //            <div className="w-full px-4">
// //               <label htmlFor="dateOfBirth" className="customLabelCss mandatory">
// //                 Date of Birth
// //               </label>
// //               <input
// //                 type="date"
// //                 id="dateOfBirth"
// //                 name="dateOfBirth"
// //                 value={formData.dob}
// //                 className="customInputCss"
// //                 onChange={handleChange}
// //                 // onBlur={handleBlur}
// //               />
// //               {errors.dateOfBirth && touched.dateOfBirth ? (
// //                 <p className="text-[12px] text-red-500 mb-1">
// //                   {errors.dateOfBirth}
// //                 </p>
// //               ) : null}
// //             </div> 

// //             <div className="w-full px-4">
// //               <label
// //                 htmlFor="dataOfAdmission"
// //                 className="customLabelCss mandatory"
// //               >
// //                 Date of Admission
// //               </label>
// //               <input
// //                 type="date"
// //                 id="dataOfAdmission"
// //                 name="dataOfAdmission"
// //                 value={formData.admission_date}
// //                 className="customInputCss"
// //                 onChange={handleChange}
// //                 // onBlur={handleBlur}
// //               />
// //               {errors.dataOfAdmission && touched.dataOfAdmission ? (
// //                 <p className="text-[12px] text-red-500 mb-1">
// //                   {errors.dataOfAdmission}
// //                 </p>
// //               ) : null}
// //             </div>

// //             <div className="w-full px-4">
// //               <label htmlFor="grnNumber" className="customLabelCss mandatory">
// //                 GRN No.
// //               </label>
// //               <input
// //                 type="text"
// //                 id="grnNumber"
// //                 name="grnNumber"
// //                 value={formData.grnNumber}
// //                 className="customInputCss"
// //                 onChange={handleChange}
// //                 // onBlur={handleBlur}
// //               />
// //               {errors.grnNumber && touched.grnNumber ? (
// //                 <p className="text-[12px] text-red-500 mb-1">
// //                   {errors.grnNumber}
// //                 </p>
// //               ) : null}
// //             </div>

// //             <div className="w-full px-4">
// //               <label htmlFor="studentIdNumber" className="customLabelCss">
// //                 Student ID No.
// //               </label>
// //               <input
// //                 type="text"
// //                 id="studentIdNumber"
// //                 name="studentIdNumber"
// //                 value={formData.stud_id_no}
// //                 className="customInputCss"
// //                 onChange={handleChange}
// //                 // onBlur={handleBlur}
// //               />
// //             </div>

// //             <div className="w-full px-4">
// //               <label
// //                 htmlFor="studentAadharNumber"
// //                 className="customLabelCss mandatory"
// //               >
// //                 Student Aadhar No.
// //               </label>
// //               <input
// //                 type="text"
// //                 id="studentAadharNumber"
// //                 name="studentAadharNumber"
// //                 value={formData.stu_aadhaar_no}
// //                 className="customInputCss"
// //                 onChange={handleChange}
// //                 // onBlur={handleBlur}
// //               />
// //               {errors.studentAadharNumber && touched.studentAadharNumber ? (
// //                 <p className="text-[12px] text-red-500 mb-1">
// //                   {errors.studentAadharNumber}
// //                 </p>
// //               ) : null}
// //             </div>

// //             <div className="w-full px-4">
// //               <label
// //                 htmlFor="studentClass"
// //                 className="customLabelCss mandatory"
// //               >
// //                 Class
// //               </label>
// //               <select
// //                 id="studentClass"
// //                 name="studentClass"
// //                 value={formData.class_id}
// //                 className="customInputCss"
// //                 onChange={handleChange}
// //                 // onBlur={handleBlur}
// //               >
// //                 <option>Select</option>
// //                 <option value="Nursery">Nursery</option>
// //                 <option value="LKG">LKG</option>
// //                 <option value="UKG">UKG</option>
// //                 <option value="1">1</option>
// //                 <option value="2">2</option>
// //                 <option value="3">3</option>
// //                 <option value="4">4</option>
// //                 <option value="5">5</option>
// //                 <option value="6">6</option>
// //                 <option value="7">7</option>
// //                 <option value="8">8</option>
// //                 <option value="9">9</option>
// //                 <option value="10">10</option>
// //                 <option value="11">11</option>
// //                 <option value="12">12</option>
// //               </select>
// //               {errors.studentClass && touched.studentClass ? (
// //                 <p className="text-[12px] text-red-500 mb-1">
// //                   {errors.studentClass}
// //                 </p>
// //               ) : null}
// //             </div>

// //             <div className="w-full px-4">
// //               <label htmlFor="division" className="customLabelCss mandatory">
// //                 Division
// //               </label>
// //               <select
// //                 id="division"
// //                 name="division"
// //                 value={formData.section_id}
// //                 className="customInputCss"
// //                 onChange={handleChange}
// //                 // onBlur={handleBlur}
// //               >
// //                 <option>Select</option>
// //                 <option value="A">A</option>
// //                 <option value="B">B</option>
// //                 <option value="C">C</option>
// //                 <option value="D">D</option>
// //               </select>
// //               {errors.division && touched.division ? (
// //                 <p className="text-[12px] text-red-500 mb-1">
// //                   {errors.division}
// //                 </p>
// //               ) : null}
// //             </div>

// //             <div className="w-full px-4">
// //               <label htmlFor="rollNumber" className="customLabelCss">
// //                 Roll No.
// //               </label>
// //               <input
// //                 type="text"
// //                 id="rollNumber"
// //                 name="rollNumber"
// //                 value={formData.roll_no}
// //                 className="customInputCss"
// //                 onChange={handleChange}
// //                 // onBlur={handleBlur}
// //               />
// //             </div>
// //             {/* </div> */}

// //             {/*  */}
// //             {/* <div className="w-full sm:max-w-[30%]"> */}
// //             <div className="w-full px-4">
// //               <label htmlFor="house" className="customLabelCss">
// //                 House
// //               </label>
// //               <select
// //                 id="house"
// //                 name="house"
// //                 value={formData.house}
// //                 className="customInputCss"
// //                 onChange={handleChange}
// //                 // onBlur={handleBlur}
// //               >
// //                 <option>Select</option>
// //                 <option value="Diamond">Diamond</option>
// //                 <option value="Emerald">Emerald</option>
// //                 <option value="Ruby">Ruby</option>
// //                 <option value="Sapphire">Sapphire</option>
// //               </select>
// //             </div>

// //             <div className="w-full px-4">
// //               <label
// //                 htmlFor="admittedInClass"
// //                 className="customLabelCss mandatory"
// //               >
// //                 Admitted In Class
// //               </label>
// //               <select
// //                 id="admittedInClass"
// //                 name="admittedInClass"
// //                 value={formData.admission_class}
// //                 className="customInputCss"
// //                 onChange={handleChange}
// //                 // onBlur={handleBlur}
// //               >
// //                 <option>Select</option>
// //                 <option value="Nursery">Nursery</option>
// //                 <option value="LKG">LKG</option>
// //                 <option value="UKG">UKG</option>
// //                 <option value="1">1</option>
// //                 <option value="2">2</option>
// //                 <option value="3">3</option>
// //                 <option value="4">4</option>
// //                 <option value="5">5</option>
// //                 <option value="6">6</option>
// //                 <option value="7">7</option>
// //                 <option value="8">8</option>
// //                 <option value="9">9</option>
// //                 <option value="10">10</option>
// //                 <option value="11">11</option>
// //                 <option value="12">12</option>
// //               </select>
// //               {errors.admittedInClass && touched.admittedInClass ? (
// //                 <p className="text-[12px] text-red-500 mb-1">
// //                   {errors.admittedInClass}
// //                 </p>
// //               ) : null}
// //             </div>

// //             <div className="w-full px-4">
// //               <label htmlFor="gender" className="customLabelCss mandatory">
// //                 Gender
// //               </label>
// //               <select
// //                 id="gender"
// //                 name="gender"
// //                 value={formData.gender}
// //                 className="customInputCss"
// //                 onChange={handleChange}
// //                 // onBlur={handleBlur}
// //               >
// //                 <option>Select</option>
// //                 <option defaultValue="Male">Male</option>
// //                 <option value="Female">Female</option>
// //               </select>
// //               {errors.gender && touched.gender ? (
// //                 <p className="text-[12px] text-red-500 mb-1">{errors.gender}</p>
// //               ) : null}
// //             </div>

// //             <div className="w-full px-4">
// //               <label htmlFor="bloodGroup" className="customLabelCss">
// //                 Blood Group
// //               </label>
// //               <select
// //                 id="bloodGroup"
// //                 name="bloodGroup"
// //                 value={formData.bloodGroup}
// //                 className="customInputCss"
// //                 onChange={handleChange}
// //                 // onBlur={handleBlur}
// //               >
// //                 <option>Select</option>
// //                 <option value="AB+">AB+</option>
// //                 <option value="AB-">AB-</option>
// //                 <option value="B+">B+</option>
// //                 <option value="B-">B-</option>
// //                 <option value="A+">A+</option>
// //                 <option value="A-">A-</option>
// //                 <option value="O+">O+</option>
// //                 <option value="O-">O-</option>
// //               </select>
// //             </div>

// //             <div className="w-full px-4">
// //               <label htmlFor="address" className="customLabelCss mandatory">
// //                 Address
// //               </label>
// //               <textarea
// //                 id="address"
// //                 name="address"
// //                 rows={2}
// //                 value={formData.address}
// //                 className="customInputCss"
// //                 onChange={handleChange}
// //                 // onBlur={handleBlur}
// //               />
// //               {errors.address && touched.address ? (
// //                 <p className="text-[12px] text-red-500 mb-1">
// //                   {errors.address}
// //                 </p>
// //               ) : null}
// //             </div>

// //             <div className="w-full px-4">
// //               <label htmlFor="city" className="customLabelCss mandatory">
// //                 City
// //               </label>
// //               <input
// //                 type="text"
// //                 id="city"
// //                 name="city"
// //                 value={formData.city}
// //                 className="customInputCss"
// //                 onChange={handleChange}
// //                 // onBlur={handleBlur}
// //               />
// //               {errors.city && touched.city ? (
// //                 <p className="text-[12px] text-red-500 mb-1">{errors.city}</p>
// //               ) : null}
// //             </div>

// //             <div className="w-full px-4">
// //               <label htmlFor="state" className="customLabelCss mandatory">
// //                 State
// //               </label>
// //               <input
// //                 type="text"
// //                 id="state"
// //                 name="state"
// //                 value={formData.state}
// //                 className="customInputCss"
// //                 onChange={handleChange}
// //                 // onBlur={handleBlur}
// //               />
// //               {errors.state && touched.state ? (
// //                 <p className="text-[12px] text-red-500 mb-1">{errors.state}</p>
// //               ) : null}
// //             </div>

// //             <div className="w-full px-4">
// //               <label htmlFor="pincode" className="customLabelCss">
// //                 Pincode
// //               </label>
// //               <input
// //                 type="text"
// //                 id="pincode"
// //                 name="pincode"
// //                 value={formData.pincode}
// //                 className="customInputCss"
// //                 onChange={handleChange}
// //                 // onBlur={handleBlur}
// //               />
// //             </div>

// //             <div className="w-full px-4">
// //               <label htmlFor="religion" className="customLabelCss mandatory">
// //                 Religion
// //               </label>
// //               <select
// //                 id="religion"
// //                 name="religion"
// //                 value={formData.religion}
// //                 className="customInputCss"
// //                 onChange={handleChange}
// //                 // onBlur={handleBlur}
// //               >
// //                 <option>Select</option>
// //                 <option value="Hindu">Hindu</option>
// //                 <option value="Christian">Christian</option>
// //                 <option value="Muslim">Muslim</option>
// //                 <option value="Sikh">Sikh</option>
// //                 <option value="Jain">Jain</option>
// //                 <option value="Buddhist">Buddhist</option>
// //               </select>
// //               {errors.religion && touched.religion ? (
// //                 <p className="text-[12px] text-red-500 mb-1">
// //                   {errors.religion}
// //                 </p>
// //               ) : null}
// //             </div>

// //             <div className="w-full px-4">
// //               <label htmlFor="caste" className="customLabelCss">
// //                 Caste
// //               </label>
// //               <input
// //                 type="text"
// //                 id="caste"
// //                 name="caste"
// //                 value={formData.caste}
// //                 className="customInputCss"
// //                 onChange={handleChange}
// //                 // onBlur={handleBlur}
// //               />
// //             </div>

// //             <div className="w-full px-4">
// //               <label htmlFor="category" className="customLabelCss mandatory">
// //                 Category
// //               </label>
// //               <select
// //                 id="category"
// //                 name="category"
// //                 value={formData.category}
// //                 className="customInputCss"
// //                 onChange={handleChange}
// //                 // onBlur={handleBlur}
// //               >
// //                 <option>Select</option>
// //                 <option value="General">General</option>
// //                 <option value="SC">SC</option>
// //                 <option value="ST">ST</option>
// //                 <option value="OBC">OBC</option>
// //                 <option value="SBC">SBC</option>
// //                 <option value="NT">NT</option>
// //                 <option value="VJNT">VJNT</option>
// //                 <option value="Minority">Minority</option>
// //               </select>
// //               {errors.category && touched.category ? (
// //                 <p className="text-[12px] text-red-500 mb-1">
// //                   {errors.category}
// //                 </p>
// //               ) : null}
// //             </div>
// //             {/* </div> */}

// //             {/*  */}
// //             {/* <div className="w-full sm:max-w-[30%]"> */}
// //             <div className="w-full px-4">
// //               <label htmlFor="nationality" className="customLabelCss mandatory">
// //                 Nationality
// //               </label>
// //               <input
// //                 type="text"
// //                 id="nationality"
// //                 name="nationality"
// //                 value={formData.nationality}
// //                 className="customInputCss"
// //                 onChange={handleChange}
// //                 // onBlur={handleBlur}
// //               />
// //               {errors.nationality && touched.nationality ? (
// //                 <p className="text-[12px] text-red-500 mb-1">
// //                   {errors.nationality}
// //                 </p>
// //               ) : null}
// //             </div>

// //             <div className="w-full px-4">
// //               <label htmlFor="birthPlace" className="customLabelCss">
// //                 Birth Place
// //               </label>
// //               <input
// //                 type="text"
// //                 id="birthPlace"
// //                 name="birthPlace"
// //                 value={formData.birthPlace}
// //                 className="customInputCss"
// //                 onChange={handleChange}
// //                 // onBlur={handleBlur}
// //               />
// //             </div>

// //             <div className="w-full px-4">
// //               <label
// //                 htmlFor="motherTongue"
// //                 className="customLabelCss mandatory"
// //               >
// //                 Mother Tongue
// //               </label>
// //               <input
// //                 type="text"
// //                 id="motherTongue"
// //                 name="motherTongue"
// //                 value={formData.motherTongue}
// //                 className="customInputCss"
// //                 onChange={handleChange}
// //                 // onBlur={handleBlur}
// //               />
// //               {errors.motherTongue && touched.motherTongue ? (
// //                 <p className="text-[12px] text-red-500 mb-1">
// //                   {errors.motherTongue}
// //                 </p>
// //               ) : null}
// //             </div>

// //             <div className="w-full px-4">
// //               <label htmlFor="emergencyName" className="customLabelCss">
// //                 Emergency Name
// //               </label>
// //               <input
// //                 type="text"
// //                 id="emergencyName"
// //                 name="emergencyName"
// //                 value={formData.emergencyName}
// //                 className="customInputCss"
// //                 onChange={handleChange}
// //                 // onBlur={handleBlur}
// //               />
// //             </div>

// //             <div className="w-full px-4">
// //               <label htmlFor="emergencyAddress" className="customLabelCss">
// //                 Emergency Address
// //               </label>
// //               <textarea
// //                 id="emergencyAddress"
// //                 name="emergencyAddress"
// //                 rows={2}
// //                 value={formData.emergencyAddress}
// //                 className="customInputCss"
// //                 onChange={handleChange}
// //                 // onBlur={handleBlur}
// //               />
// //               <div className="flex flex-row items-center gap-2 -mt-2 w-full">
// //                 <input
// //                   type="checkbox"
// //                   id="sameAs"
// //                   name="emergencyAddress"
// //                   rows={2}
// //                   className="border h-[26px] border-[#ccc] px-3 py-[6px] text-[14px] leading-4 outline-none"
// //                   onChange={(event) => {
// //                     if (event.target.checked) {
// //                       event.target.value = formData.address;
// //                       handleChange(event);
// //                     }
// //                   }}
// //                   // onBlur={handleBlur}
// //                 />
// //                 <label htmlFor="sameAs">Same as permanent address</label>
// //               </div>
// //             </div>

// //             <div className="w-full px-4">
// //               <label htmlFor="emergencyContact" className="customLabelCss">
// //                 Emergency Contact
// //               </label>
// //               <div className="w-full flex flex-row items-center">
// //                 <span className="w-[15%] h-[34px] text-[14px] text-[#555] text-center border border-[#ccc] border-r-0 flex items-center justify-center p-1">
// //                   +91
// //                 </span>
// //                 <input
// //                   type="text"
// //                   inputMode="numeric"
// //                   id="emergencyContact"
// //                   name="emergencyContact"
// //                   maxLength={10}
// //                   value={formData.emergencyContact}
// //                   className="customInputCss"
// //                   onChange={handleChange}
// //                   // onBlur={handleBlur}
// //                 />
// //               </div>
// //             </div>

// //             <div className="w-full px-4">
// //               <label htmlFor="transportMode" className="customLabelCss">
// //                 Transport Mode
// //               </label>
// //               <select
// //                 id="transportMode"
// //                 name="transportMode"
// //                 value={formData.transportMode}
// //                 className="customInputCss"
// //                 onChange={handleChange}
// //                 // onBlur={handleBlur}
// //               >
// //                 <option>Select</option>
// //                 <option value="School Bus">School Bus</option>
// //                 <option value="Private Van">Private Van</option>
// //                 <option value="Self">Self</option>
// //               </select>
// //               <input
// //                 type="text"
// //                 id="vehicleNumber"
// //                 name="vehicleNumber"
// //                 placeholder="Vehicle No."
// //                 value={formData.vehicleNumber}
// //                 className="customInputCss"
// //                 onChange={handleChange}
// //                 // onBlur={handleBlur}
// //               />
// //             </div>

// //             <div className="w-full px-4">
// //               <label htmlFor="allergies" className="customLabelCss">
// //                 Allergies(if any)
// //               </label>
// //               <input
// //                 type="text"
// //                 id="allergies"
// //                 name="allergies"
// //                 value={formData.allergies}
// //                 className="customInputCss"
// //                 onChange={handleChange}
// //                 // onBlur={handleBlur}
// //               />
// //             </div>

// //             <div className="w-full px-4">
// //               <label htmlFor="height" className="customLabelCss">
// //                 Height
// //               </label>
// //               <input
// //                 type="text"
// //                 id="height"
// //                 name="height"
// //                 value={formData.height}
// //                 className="customInputCss"
// //                 onChange={handleChange}
// //                 // onBlur={handleBlur}
// //               />
// //             </div>

// //             <div className="w-full px-4">
// //               <label htmlFor="weight" className="customLabelCss">
// //                 Weight
// //               </label>
// //               <input
// //                 type="text"
// //                 id="weight"
// //                 name="weight"
// //                 value={formData.weight}
// //                 className="customInputCss"
// //                 onChange={handleChange}
// //                 // onBlur={handleBlur}
// //               />
// //             </div>

// //             <div className="w-full px-4 flex gap-6 pt-[7px]">
// //               <div htmlFor="weight" className="text-left max-w-full font-[700]">
// //                 Has Spectacles
// //               </div>
// //               <div className="flex items-center gap-6">
// //                 <div className="flex items-center">
// //                   <input
// //                     type="radio"
// //                     id="yes"
// //                     name="hasSpectacles"
// //                     checked={formData.hasSpectacles === "Yes"}
// //                     value="Yes"
// //                     onChange={handleChange}
// //                     // onBlur={handleBlur}
// //                   />
// //                   <label htmlFor="yes" className="ml-1">
// //                     Yes
// //                   </label>
// //                 </div>
// //                 <div className="flex items-center">
// //                   <input
// //                     type="radio"
// //                     id="no"
// //                     name="hasSpectacles"
// //                     checked={formData.hasSpectacles === "No"}
// //                     value="No"
// //                     onChange={handleChange}
// //                     // onBlur={handleBlur}
// //                   />
// //                   <label htmlFor="no" className="ml-1">
// //                     No
// //                   </label>
// //                 </div>
// //               </div>
// //             </div>
// //             {/* </div> */}
// //           </div>
// //           <div className="col-span-3 md:mr-9 my-2 text-right">
// //             <button
// //               type="submit"
// //               style={{ backgroundColor: "#2196F3" }}
// //               className=" text-white font-bold py-1 border-1 border-blue-500 px-4 rounded"
// //             >
// //               Update
// //             </button>
// //           </div>
// //         </form>
// //       </div>
// //     </div>
// //   );
// // }

// // export default Form;








//  <div>
//     <label>First Name:</label>
//     <input type="text" value={formData.first_name} disabled />
//    {" "}
//  </div>;






{showDisplayUpload ? (
  <div className="max-w-4xl bg-white shadow-md rounded-lg border border-gray-300 mx-auto mt-10 p-6">
    <h2 className="text-center text-2xl font-semibold mb-8 text-blue-600">
      Upload Student Data from Excel Sheet
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
      {/* Download Student List Template */}
      <div className="flex flex-col items-center p-4 bg-gray-50 rounded-md">
        <h5 className="font-semibold mb-3 text-gray-800">Download Template</h5>
        <p className="text-sm text-gray-600 mb-4">
          # Please download the template by clicking below.
          <br />
          # Enter student details in the downloaded file.
          <br />
          # Do not add new students.
        </p>
        <button
          onClick={handleDownloadTemplate}
          className="bg-blue-600 text-white rounded-full px-6 py-3 hover:bg-blue-700 transition duration-200"
        >
          <i className="fas fa-download text-lg"></i> Download Template
        </button>
      </div>

      {/* File Upload */}
      <div className="flex flex-col items-center p-4 bg-gray-50 rounded-md">
        <h5 className="font-semibold mb-3 text-gray-800">Class: {classIdForManage}</h5>
        <p className="font-medium text-gray-800 mb-2">Select a file to upload</p>
        <p className="text-sm text-gray-600 mb-4">
          # Do not change the file name or contents of the first 4 columns.
          <br />
          # Please select the file downloaded in the previous step.
        </p>

        <label className="bg-blue-600 text-white rounded-full px-6 py-3 hover:bg-blue-700 cursor-pointer transition duration-200">
          <i className="fas fa-upload text-lg"></i> Choose File
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      {/* Register New Students */}
      <div className="flex flex-col items-center p-4 bg-gray-50 rounded-md">
        <h5 className="font-semibold mb-3 text-gray-800">Register New Students</h5>
        <p className="text-sm text-gray-600 mb-4">
          # Click upload to register students.
          <br />
          # Their details will be emailed after registration.
        </p>
        <button
          onClick={handleUpload}
          className="bg-blue-600 text-white rounded-full px-6 py-3 hover:bg-blue-700 transition duration-200"
        >
          <i className="fas fa-cloud-upload-alt text-lg"></i> Upload
        </button>
      </div>
    </div>
  </div>
)