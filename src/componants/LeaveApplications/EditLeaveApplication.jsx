// import React, { useEffect, useState } from "react";
// import { RxCross1 } from "react-icons/rx";
// import { useNavigate, useLocation } from "react-router-dom";
// import axios from "axios";
// import { ToastContainer, toast } from "react-toastify";

// const EditLeaveApplication = () => {
//   const location = useLocation();
//   const API_URL = import.meta.env.VITE_API_URL;
//   const [loading, setLoading] = useState(false);

//   const { staffleave } = location.state || {};
//   console.log("staff leave for editing", staffleave);

//   const [formData, setFormData] = useState({
//     staff_name: "",
//     staff_id: "",
//     leave_type_id: "",
//     leave_start_date: "",
//     leave_end_date: "",
//     status: "",
//     no_of_days: "",
//     reason: "",
//     reason_for_rejection: "",
//   });
//   // useEffect(() => {
//   //   if (staffleave) {
//   //     setFormData({
//   //       staff_name: staffleave.staff_name || "",
//   //       staff_id: staffleave.staff_id || "",
//   //       leave_type_id: staffleave.leave_type_id || "",
//   //       leave_start_date: staffleave.leave_start_date || "",
//   //       leave_end_date: staffleave.leave_end_date || "",
//   //       status: staffleave.status || "",
//   //       no_of_days: staffleave.no_of_days || "",
//   //       reason: staffleave.reason || "",
//   //       reason_for_rejection: staffleave.reason_for_rejection || "",
//   //     });
//   //   }
//   // }, [staffleave, API_URL]);
//   useEffect(() => {
//     if (staffleave) {
//       setFormData({
//         staff_name: staffleave.teachername || "",
//         staff_id: staffleave.staff_id || "",
//         leave_type_id: staffleave.leave_type_id || "",
//         leave_start_date: staffleave.leave_start_date || "",
//         leave_end_date: staffleave.leave_end_date || "",
//         status: staffleave.status || "",
//         no_of_days: staffleave.no_of_days || "",
//         reason: staffleave.reason || "",
//         reason_for_rejection: staffleave.reason_for_rejection || "",
//       });

//       // ✅ Fetch leave type if staff_id exists
//       if (staffleave.staff_id) {
//         fetchLeaveType(staffleave.staff_id);
//       }
//     }
//   }, [staffleave, API_URL]);

//   const [errors, setErrors] = useState({});
//   const [leaveType, setLeaveType] = useState([]);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();
//   const MAX_DATE = "2006-12-31";
//   const today = new Date().toISOString().split("T")[0];
//   const statusMap = {
//     R: "Rejected",
//     A: "Applied",
//     H: "Hold",
//     C: "Canceled",
//     P: "Approved",
//   };
//   const validateDays = (days) => {
//     if (!days) return "Number of days is required";
//     if (!/^\d{1,2}(\.\d{1,2})?$/.test(days)) {
//       return "Enter a valid number";
//     }
//     return null;
//   };

//   const validate = () => {
//     const newErrors = {};

//     if (!formData.staff_name) {
//       newErrors.staff_name = "Staff name is required";
//     } else if (!/^[^\d].*/.test(formData.staff_name)) {
//       newErrors.staff_name = "Staff name should not start with a number";
//     }

//     if (!formData.leave_type_id) {
//       newErrors.leave_type_id = "Leave type is required";
//     }

//     if (!formData.leave_start_date) {
//       newErrors.leave_start_date = "Leave start date is required";
//     }

//     if (!formData.leave_end_date) {
//       newErrors.leave_end_date = "Leave end date is required";
//     }

//     // if (!formData.reason) {
//     //   newErrors.reason = "Reason for leave is required";
//     // }

//     const daysError = validateDays(formData.no_of_days);
//     if (daysError) {
//       newErrors.no_of_days = daysError;
//     }

//     setErrors(newErrors);
//     return newErrors;
//   };

//   const fetchLeaveType = async (reg_id) => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem("authToken");

//       if (!token) {
//         throw new Error("No Authentication token found.");
//       }

//       const response = await axios.get(
//         `${API_URL}/api/get_leavetypedata/${reg_id}`,
//         {
//           // ${API_URL}/api/get_leavetype
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           withCredentials: true,
//         }
//       );

//       if (Array.isArray(response.data.data)) {
//         setLeaveType(response.data.data);
//       } else {
//         setError("Unexpected data format.");
//       }
//     } catch (error) {
//       setError(error.message);
//       toast.error("Error fetching leave type");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (event) => {
//     const { name, value } = event.target;

//     setFormData((prevData) => {
//       let updatedData = {
//         ...prevData,
//         [name]: value,
//       };

//       // Recalculate no_of_days only if the dates are changed, and no manual editing is done
//       if (
//         updatedData.leave_start_date &&
//         updatedData.leave_end_date &&
//         name !== "no_of_days"
//       ) {
//         const startDate = new Date(updatedData.leave_start_date);
//         const endDate = new Date(updatedData.leave_end_date);

//         // Calculate day difference as a decimal (including fractional days)
//         const timeDiff = endDate - startDate;
//         const dayDiff = timeDiff / (1000 * 60 * 60 * 24) + 1; // Including fractional days

//         // Set the calculated value
//         updatedData.no_of_days = dayDiff > 0 ? dayDiff.toFixed(0) : "";
//       }

//       return updatedData;
//     });

//     // When manually editing no_of_days field, accept decimals and validate
//     if (name === "no_of_days") {
//       // Allow decimal values (positive only)
//       const decimalPattern = /^\d+(\.\d+)?$/;
//       if (decimalPattern.test(value)) {
//         setErrors((prevErrors) => ({
//           ...prevErrors,
//           no_of_days: "", // Clear any existing errors
//         }));
//       } else {
//         setErrors((prevErrors) => ({
//           ...prevErrors,
//           no_of_days: "Please enter a valid positive number (e.g., 0.5).",
//         }));
//       }
//     }
//   };

//   const formatDateString = (dateString) => {
//     if (!dateString) return "";
//     const [year, month, day] = dateString.split("-");
//     return `${year}-${month}-${day}`;
//   };

//   const handleChangeLeaveType = (e) => {
//     const { value } = e.target;

//     setFormData((prevData) => ({
//       ...prevData,
//       leave_type_id: value,
//     }));

//     setErrors((prevErrors) => ({
//       ...prevErrors,
//       leave_type_id: value ? null : "Leave type is required",
//     }));
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     // Prevent double submissions
//     if (loading) return;

//     // Validate the form data
//     const validationErrors = validate();
//     if (validationErrors && Object.keys(validationErrors).length > 0) {
//       setErrors(validationErrors);
//       Object.values(validationErrors).forEach((error) => {
//         toast.error(error); // Display validation errors
//       });
//       return;
//     }

//     // Format form data for API
//     const formattedFormData = {
//       ...formData,
//       leave_start_date: formatDateString(formData.leave_start_date),
//       leave_end_date: formatDateString(formData.leave_end_date),
//       approvercomment: formData.reason_for_rejection,
//       // staff_id: formData.reg_id,
//       // staff_name: formData.staff_name
//     };

//     try {
//       setLoading(true); // Start loading state
//       const token = localStorage.getItem("authToken");
//       if (!token) {
//         throw new Error("No authentication token found");
//       }

//       console.log("Submitting data:", formattedFormData);
//       const response = await axios.put(
//         `${API_URL}/api/update_leaveapplicationdata/${staffleave.leave_app_id}`,
//         formattedFormData,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       // Handle successful response
//       if (response.status === 200) {
//         toast.success("Leave updated successfully!");
//         setTimeout(() => {
//           navigate("/leaveApplication");
//         }, 500);
//       }
//     } catch (error) {
//       console.error(
//         "Error updating leave:",
//         error.response?.data || error.message
//       );

//       // Handle backend errors
//       if (error.response && error.response.data) {
//         const { errors, message } = error.response.data;

//         // Show validation errors from the backend
//         if (errors) {
//           Object.entries(errors).forEach(([field, messages]) => {
//             messages.forEach((msg) => {
//               console.log(`${field}: ${msg}`); // Show field-specific error
//             });
//           });

//           // Set backend validation errors for specific fields
//           // setBackendErrors(errors);
//           // setEmployeeIdBackendError(errors?.leave_app_id_id?.[0] || ""); // Handle `employee_id` error
//         } else if (message) {
//           // Show generic backend error message
//           // toast.error(message);
//         }
//       } else {
//         toast.error("An unexpected error occurred.");
//       }
//     } finally {
//       setLoading(false); // End loading state
//     }
//   };

//   return (
//     <div className="container mx-auto min-h-screen flex items-center justify-center mt-3 ">
//       <ToastContainer />
//       <div className="card p-4 rounded-md w-[66%] ">
//         <div className=" card-header mb-4 flex justify-between items-center">
//           <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
//             Edit Leave Application
//           </h5>

//           <RxCross1
//             className="float-end relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
//             onClick={() => {
//               setErrors({});
//               navigate("/leaveApplication");
//             }}
//           />
//         </div>
//         <div
//           className=" relative w-full -top-6 h-1  mx-auto bg-red-700"
//           style={{
//             backgroundColor: "#C03078",
//           }}
//         ></div>
//         <p className="  md:absolute md:right-10  md:top-[11%]  text-gray-500  ">
//           <span className="text-red-500">*</span>indicates mandatory information
//         </p>

//         <form
//           // onSubmit={handleSubmit}
//           className="flex items-center justify-center overflow-x-hidden shadow-md p-3 bg-gray-50 space-y-2" //min-h-screen flex items-center justify-center overflow-x-hidden shadow-md p-4 bg-gray-50
//         >
//           <div className="modal-body">
//             <div className=" relative mb-3 flex justify-center  mx-4">
//               <label htmlFor="sectionName" className="w-1/2 mt-2">
//                 Staff Name <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 maxLength={100}
//                 id="staff_name"
//                 name="staff_name"
//                 pattern="^[^\d].*"
//                 title="Name should not start with a number"
//                 required
//                 value={formData.staff_name}
//                 disabled
//                 className="w-full form-control shadow-md mb-2"
//               />
//               <div className="absolute top-9 left-1/3">
//                 {errors.staff_name && (
//                   <span className="text-danger text-xs">
//                     {errors.staff_name}
//                   </span>
//                 )}
//               </div>
//             </div>
//             <div className="relative mb-3 flex justify-center mx-4">
//               <label htmlFor="departmentId" className="w-1/2 mt-2">
//                 Leave Type <span className="text-red-500">*</span>
//               </label>
//               <select
//                 id="leave_type"
//                 name="leave_type"
//                 value={formData.leave_type_id}
//                 onChange={handleChangeLeaveType}
//                 required
//                 className="form-control shadow-md"
//               >
//                 <option className="bg-gray-300" value="">
//                   Select Leave{" "}
//                 </option>
//                 {leaveType.length === 0 ? (
//                   <option>No Options</option>
//                 ) : (
//                   leaveType.map((leave) => (
//                     <option
//                       key={leave.leave_type_id}
//                       value={leave.leave_type_id}
//                       className="max-h-20 overflow-y-scroll"
//                     >
//                       {leave.name}
//                     </option>
//                   ))
//                 )}
//               </select>
//               <div className="absolute top-9 left-1/3">
//                 {errors.leave_type_id && (
//                   <span className="text-danger text-xs">
//                     {errors.leave_type_id}
//                   </span>
//                 )}
//               </div>
//             </div>

//             <div className="mt-4 relative mb-3 flex justify-center  mx-4">
//               <label htmlFor="startDate" className="w-1/2 mt-2">
//                 Leave Start Date <span className="text-red-500">*</span>
//               </label>

//               <input
//                 type="date"
//                 id="leave_start_date"
//                 // max={today}
//                 name="leave_start_date"
//                 value={formData.leave_start_date}
//                 onChange={handleChange}
//                 max={formData.leave_end_date || ""}
//                 required
//                 className="form-control shadow-md"
//               />
//               <div className="absolute top-9 left-1/3">
//                 {errors.leave_start_date && (
//                   <span className="text-danger text-xs">
//                     {errors.leave_start_date}
//                   </span>
//                 )}
//               </div>
//             </div>
//             <div className="mt-4 relative mb-3 flex justify-center  mx-4">
//               <label htmlFor="endDate" className="w-1/2 mt-2">
//                 Leave End Date <span className="text-red-500">*</span>
//               </label>

//               <input
//                 type="date"
//                 id="leave_end_date"
//                 // max={today}
//                 name="leave_end_date"
//                 value={formData.leave_end_date}
//                 onChange={handleChange}
//                 min={formData.leave_start_date || ""}
//                 required
//                 className="form-control shadow-md"
//               />
//               <div className="absolute top-9 left-1/3 ">
//                 {errors.leave_end_date && (
//                   <span className="text-danger text-xs">
//                     {errors.leave_end_date}
//                   </span>
//                 )}
//               </div>
//             </div>
//             <div className="mt-4 relative mb-3 flex justify-center  mx-4">
//               <label htmlFor="openDay" className="w-1/2 mt-2">
//                 No. of days<span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="number" // Change to "number" to support decimals
//                 id="no_of_days"
//                 name="no_of_days"
//                 value={formData.no_of_days}
//                 step="0.5" // Allows decimals (e.g., 0.5, 1.75)
//                 min="0.5" // Ensures that 0.01 or more is entered
//                 onChange={handleChange}
//                 className="form-control shadow-md mb-2"
//               />
//               <div className="absolute top-9 left-1/3 ">
//                 {errors.no_of_days && (
//                   <span className="text-danger text-xs">
//                     {errors.no_of_days}
//                   </span>
//                 )}
//               </div>
//             </div>

//             <div className="mt-4 relative mb-3 flex justify-center  mx-4">
//               <label htmlFor="openDay" className="w-1/2 mt-2">
//                 Status <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 maxLength={100}
//                 id="status"
//                 name="status"
//                 pattern="^[^\d].*"
//                 required
//                 value={statusMap[formData.status] || ""}
//                 className="block border w-full border-gray-300 rounded-md py-1 px-3 bg-gray-200 shadow-inner"
//                 readOnly
//               />
//             </div>
//             <div className=" relative mb-3 flex justify-center  mx-4">
//               <label htmlFor="comment" className="w-1/2 mt-2">
//                 Reason
//               </label>
//               <textarea
//                 type="text"
//                 maxLength={200}
//                 id="reason"
//                 name="reason"
//                 value={formData.reason}
//                 onChange={handleChange}
//                 rows="2"
//                 readOnly
//                 className="input-field  block w-full border border-gray-300 rounded-md py-1 px-3 bg-gray-200 shadow-inner"
//               />{" "}
//             </div>
//             <div className=" relative  mb-3 flex justify-center  mx-4">
//               <label htmlFor="comment" className="w-1/2 mt-2">
//                 Approver's Comment
//               </label>
//               <textarea
//                 type="text"
//                 maxLength={200}
//                 id="reason_for_rejection"
//                 name="reason_for_rejection"
//                 value={formData.reason_for_rejection}
//                 onChange={handleChange}
//                 className="form-control  shadow-md mb-2"
//                 rows="2"
//                 // className="form-control shadow-md mb-2 "
//               />{" "}
//             </div>
//             <div className="col-span-3 text-right mt-4">
//               <button
//                 className="mr-2 bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-700
//                disabled:bg-blue-300 disabled:cursor-not-allowed disabled:hover:bg-blue-300"
//                 onClick={handleSubmit}
//                 disabled={loading}
//               >
//                 {loading ? "Updating..." : "Update"}
//               </button>
//             </div>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default EditLeaveApplication;
import { useEffect, useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

const EditLeaveApplication = () => {
  const location = useLocation();
  const API_URL = import.meta.env.VITE_API_URL;
  const [loading, setLoading] = useState(false);

  const { staffleave } = location.state || {};
  console.log("staff leave for editing", staffleave);

  const [formData, setFormData] = useState({
    staff_name: "",
    staff_id: "",
    leave_type_id: "",
    leave_start_date: "",
    leave_end_date: "",
    status: "",
    no_of_days: "",
    reason: "",
    reason_for_rejection: "",
  });
  const statusOptions = [
    { value: "A", label: "Applied" },
    { value: "H", label: "Hold" },
    { value: "R", label: "Rejected" },
    { value: "P", label: "Approved" },
    { value: "C", label: "Canceled" },
  ];
  useEffect(() => {
    if (staffleave) {
      setFormData({
        staff_name: staffleave.teachername || "",
        staff_id: staffleave.staff_id || "",
        leave_type_id: staffleave.leave_type_id || "",
        leave_start_date: staffleave.leave_start_date || "",
        leave_end_date: staffleave.leave_end_date || "",
        status: staffleave.status || "",
        no_of_days: staffleave.no_of_days || "",
        reason: staffleave.reason || "",
        reason_for_rejection: staffleave.reason_for_rejection || "",
      });

      // ✅ Fetch leave type if staff_id exists
      if (staffleave.staff_id) {
        fetchLeaveType(staffleave.staff_id);
      }
    }
  }, [staffleave, API_URL]);

  const [errors, setErrors] = useState({});
  const [leaveType, setLeaveType] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const MAX_DATE = "2006-12-31";
  const today = new Date().toISOString().split("T")[0];
  const statusMap = {
    R: "Rejected",
    A: "Applied",
    H: "Hold",
    C: "Canceled",
    P: "Approved",
  };
  const validateDays = (days) => {
    if (!days) return "Number of days is required";
    if (!/^\d{1,2}(\.\d{1,2})?$/.test(days)) {
      return "Enter a valid number";
    }
    return null;
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.staff_name) {
      newErrors.staff_name = "Staff name is required";
    } else if (!/^[^\d].*/.test(formData.staff_name)) {
      newErrors.staff_name = "Staff name should not start with a number";
    }

    if (!formData.leave_type_id) {
      newErrors.leave_type_id = "Leave type is required";
    }

    if (!formData.leave_start_date) {
      newErrors.leave_start_date = "Leave start date is required";
    }

    if (!formData.leave_end_date) {
      newErrors.leave_end_date = "Leave end date is required";
    }

    // if (!formData.reason) {
    //   newErrors.reason = "Reason for leave is required";
    // }

    const daysError = validateDays(formData.no_of_days);
    if (daysError) {
      newErrors.no_of_days = daysError;
    }

    setErrors(newErrors);
    return newErrors;
  };

  const fetchLeaveType = async (reg_id) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No Authentication token found.");
      }

      const response = await axios.get(
        `${API_URL}/api/get_leavetypedata/${reg_id}`,
        {
          // ${API_URL}/api/get_leavetype
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (Array.isArray(response.data.data)) {
        setLeaveType(response.data.data);
      } else {
        setError("Unexpected data format.");
      }
    } catch (error) {
      setError(error.message);
      toast.error("Error fetching leave type");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prevData) => {
      let updatedData = {
        ...prevData,
        [name]: value,
      };

      // Recalculate no_of_days only if the dates are changed, and no manual editing is done
      if (
        updatedData.leave_start_date &&
        updatedData.leave_end_date &&
        name !== "no_of_days"
      ) {
        const startDate = new Date(updatedData.leave_start_date);
        const endDate = new Date(updatedData.leave_end_date);

        // Calculate day difference as a decimal (including fractional days)
        const timeDiff = endDate - startDate;
        const dayDiff = timeDiff / (1000 * 60 * 60 * 24) + 1; // Including fractional days

        // Set the calculated value
        updatedData.no_of_days = dayDiff > 0 ? dayDiff.toFixed(0) : "";
      }

      return updatedData;
    });

    // When manually editing no_of_days field, accept decimals and validate
    if (name === "no_of_days") {
      // Allow decimal values (positive only)
      const decimalPattern = /^\d+(\.\d+)?$/;
      if (decimalPattern.test(value)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          no_of_days: "", // Clear any existing errors
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          no_of_days: "Please enter a valid positive number (e.g., 0.5).",
        }));
      }
    }
  };

  const formatDateString = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${year}-${month}-${day}`;
  };

  const handleChangeLeaveType = (e) => {
    const { value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      leave_type_id: value,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      leave_type_id: value ? null : "Leave type is required",
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Prevent double submissions
    if (loading) return;

    // Validate the form data
    const validationErrors = validate();
    if (validationErrors && Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      Object.values(validationErrors).forEach((error) => {
        toast.error(error); // Display validation errors
      });
      return;
    }

    // Format form data for API
    const formattedFormData = {
      ...formData,
      leave_start_date: formatDateString(formData.leave_start_date),
      leave_end_date: formatDateString(formData.leave_end_date),
      approvercomment: formData.reason_for_rejection,
      // staff_id: formData.reg_id,
      // staff_name: formData.staff_name
    };

    try {
      setLoading(true); // Start loading state
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      console.log("Submitting data:", formattedFormData);
      const response = await axios.put(
        `${API_URL}/api/update_leaveapplicationdata/${staffleave.leave_app_id}`,
        formattedFormData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Handle successful response
      if (response.status === 200) {
        toast.success("Leave updated successfully!");
        setTimeout(() => {
          navigate("/leaveApplication");
        }, 500);
      }
    } catch (error) {
      console.error(
        "Error updating leave:",
        error.response?.data || error.message
      );

      // Handle backend errors
      if (error.response && error.response.data) {
        const { errors, message } = error.response.data;

        // Show validation errors from the backend
        if (errors) {
          Object.entries(errors).forEach(([field, messages]) => {
            messages.forEach((msg) => {
              console.log(`${field}: ${msg}`); // Show field-specific error
            });
          });

          // Set backend validation errors for specific fields
          // setBackendErrors(errors);
          // setEmployeeIdBackendError(errors?.leave_app_id_id?.[0] || ""); // Handle `employee_id` error
        } else if (message) {
          // Show generic backend error message
          // toast.error(message);
        }
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoading(false); // End loading state
    }
  };

  return (
    <div className="container mx-auto min-h-screen flex items-center justify-center mt-3 ">
      <ToastContainer />
      <div className="card p-4 rounded-md w-[80%]">
        <div className=" card-header mb-4 flex justify-between items-center">
          <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
            Edit Leave Application
          </h5>

          <RxCross1
            className="float-end relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
            onClick={() => {
              setErrors({});
              navigate("/leaveApplication");
            }}
          />
        </div>
        <div
          className=" relative w-full -top-6 h-1  mx-auto bg-red-700"
          style={{
            backgroundColor: "#C03078",
          }}
        ></div>
        <p className="  md:absolute md:right-6  md:top-[18%]  text-gray-500  ">
          <span className="text-red-500">*</span>indicates mandatory information
        </p>

        <form
          // onSubmit={handleSubmit}
          className="flex items-center justify-center overflow-x-hidden shadow-md p-3 bg-gray-50 space-y-2" //min-h-screen flex items-center justify-center overflow-x-hidden shadow-md p-4 bg-gray-50
        >
          <div className="modal-body grid grid-cols-3 gap-4 px-4">
            {/* Staff Name */}
            <div className="flex flex-col">
              <label htmlFor="staff_name" className="mb-1">
                Staff Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={100}
                id="staff_name"
                name="staff_name"
                pattern="^[^\d].*"
                title="Name should not start with a number"
                required
                value={formData.staff_name}
                disabled
                className="form-control shadow-md"
              />
              {errors.staff_name && (
                <span className="text-danger text-xs mt-1">
                  {errors.staff_name}
                </span>
              )}
            </div>

            {/* Leave Type */}
            <div className="flex flex-col">
              <label htmlFor="leave_type" className="mb-1">
                Leave Type <span className="text-red-500">*</span>
              </label>
              <select
                id="leave_type"
                name="leave_type"
                value={formData.leave_type_id}
                onChange={handleChangeLeaveType}
                required
                className="form-control shadow-md"
              >
                <option className="bg-gray-300" value="">
                  Select Leave
                </option>
                {leaveType.length === 0 ? (
                  <option>No Options</option>
                ) : (
                  leaveType.map((leave) => (
                    <option
                      key={leave.leave_type_id}
                      value={leave.leave_type_id}
                    >
                      {leave.name}
                    </option>
                  ))
                )}
              </select>
              {errors.leave_type_id && (
                <span className="text-danger text-xs mt-1">
                  {errors.leave_type_id}
                </span>
              )}
            </div>

            {/* Leave Start Date */}
            <div className="flex flex-col">
              <label htmlFor="leave_start_date" className="mb-1">
                Leave Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="leave_start_date"
                name="leave_start_date"
                value={formData.leave_start_date}
                onChange={handleChange}
                max={formData.leave_end_date || ""}
                required
                className="form-control shadow-md"
              />
              {errors.leave_start_date && (
                <span className="text-danger text-xs mt-1">
                  {errors.leave_start_date}
                </span>
              )}
            </div>

            {/* Leave End Date */}
            <div className="flex flex-col">
              <label htmlFor="leave_end_date" className="mb-1">
                Leave End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="leave_end_date"
                name="leave_end_date"
                value={formData.leave_end_date}
                onChange={handleChange}
                min={formData.leave_start_date || ""}
                required
                className="form-control shadow-md"
              />
              {errors.leave_end_date && (
                <span className="text-danger text-xs mt-1">
                  {errors.leave_end_date}
                </span>
              )}
            </div>

            {/* No of Days */}
            <div className="flex flex-col">
              <label htmlFor="no_of_days" className="mb-1">
                No. of Days <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="no_of_days"
                name="no_of_days"
                value={formData.no_of_days}
                step="0.5"
                min="0.5"
                onChange={handleChange}
                className="form-control shadow-md"
              />
              {errors.no_of_days && (
                <span className="text-danger text-xs mt-1">
                  {errors.no_of_days}
                </span>
              )}
            </div>

            {/* Status */}
            {/* <div className="flex flex-col">
              <label htmlFor="status" className="mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="status"
                name="status"
                value={statusMap[formData.status] || ""}
                readOnly
                className="form-control bg-gray-200 shadow-inner"
              />
            </div> */}
            <div className="flex flex-col">
              <label htmlFor="status" className="mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={formData.status || ""}
                onChange={handleChange} // make sure your handleChange updates formData.status
                required
                className="form-control shadow-md"
              >
                <option value="" disabled>
                  Select Status
                </option>
                {statusOptions.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-3 grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label htmlFor="reason" className="mb-1">
                  Reason
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  readOnly
                  rows="2"
                  className="form-control bg-gray-200 shadow-inner"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="reason_for_rejection" className="mb-1">
                  Approver's Comment
                </label>
                <textarea
                  id="reason_for_rejection"
                  name="reason_for_rejection"
                  value={formData.reason_for_rejection}
                  onChange={handleChange}
                  rows="2"
                  className="form-control shadow-md"
                />
              </div>
            </div>

            {/* Submit button spans full width */}
            <div className="col-span-3 text-right mt-4">
              <button
                className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLeaveApplication;
