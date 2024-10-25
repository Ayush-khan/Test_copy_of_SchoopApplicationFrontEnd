import { useState, useEffect } from "react";
import { RxCross1 } from "react-icons/rx";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

function EditCareTacker() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [formData, setFormData] = useState({
    sr_no: "",
    student_name: "",
    dob: "",
    date_of_joining: "",
    father_name: "",
    academic_qual: "",
    professional_qual: "",
    trained: "",
    experience: "",
    sex: "",
    blood_group: "",
    religion: "",
    address: "",
    phone: "",
    email: "",
    aadhar_card_no: "",
    teacher_id: "",
    employee_id: "",
    teacher_image_name: null,
    special_sub: "",
  });
  const [errors, setErrors] = useState({});
  const [backendErrors, setBackendErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const { staff } = location.state || {};
  // Maximum date for date_of_birth
  const MAX_DATE = "2006-12-31";
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (staff) {
      setFormData({
        employee_id: staff.employee_id || " ",
        student_name: staff.student_name || "",
        dob: staff.dob || "",
        date_of_joining: staff.date_of_joining || "",
        sex: staff.sex || "",
        religion: staff.religion || "",
        blood_group: staff.blood_group || "",
        address: staff.address || "",
        phone: staff.phone || "",
        father_name: staff.father_name || "",
        academic_qual: staff.academic_qual || "",
        teacher_id: staff.tc_id || "",
        aadhar_card_no: staff.aadhar_card_no || "",
        isDelete: staff.isDelete || "N",
      });
    }
  }, [staff, API_URL]);

  const [classes, setClasses] = useState([]);

  // Validation functions

  const fetchTeacherCategory = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(`${API_URL}/api/get_teachercategory`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      setClasses(response?.data?.data);
    } catch (error) {
      toast.error(error.message);
    }
  };
  useEffect(() => {
    fetchTeacherCategory();
  }, []);
  // Validation functions
  const validatePhone = (phone) => {
    if (!phone) return "Phone number is required";
    if (!/^\d{10}$/.test(phone)) return "Phone number must be 10 digits";
    return null;
  };

  const validateAadhar = (aadhar) => {
    // if (!aadhar) return "Aadhar card number is required";
    if (!/^\d{12}$/.test(aadhar.replace(/\s+/g, "")))
      return "Aadhar card number must be 12 digits";
    return null;
  };

  const validate = () => {
    const newErrors = {};

    // Validate name
    if (!formData.student_name) newErrors.student_name = "Name is required";
    else if (!/^[^\d].*/.test(formData.student_name))
      newErrors.student_name = "Name should not start with a number";
    // Validate academic qualifications (now a single text input)
    if (!formData.academic_qual)
      newErrors.academic_qual = "Academic qualification is required";

    // Validate dob
    if (!formData.dob) newErrors.dob = "Date of Birth is required";
    if (!formData.father_name)
      newErrors.father_name = "Father Name is required";

    // Validate teacher category
    if (!formData.teacher_id)
      newErrors.teacher_id = "Teacher Category is required";

    // Validate date of joining
    if (!formData.date_of_joining)
      newErrors.date_of_joining = "Date of Joining is required";

    // Validate sex
    if (!formData.sex) newErrors.sex = "Gender is required";

    // Validate Employee Id
    if (!formData.employee_id)
      newErrors.employee_id = "Employee Id is required";
    // Validate address
    if (!formData.address) newErrors.address = "Address is required";

    // Validate phone number
    const phoneError = validatePhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;

    const aadharError = validateAadhar(formData.aadhar_card_no);
    if (aadharError) newErrors.aadhar_card_no = aadharError;

    setErrors(newErrors);
    return newErrors;
  };
  const handleChange = (event) => {
    const { name, value } = event.target;
    let newValue = value;

    // Input sanitization for specific fields
    if (name === "experience") {
      newValue = newValue.replace(/[^0-9]/g, ""); // Only allow numbers in experience
    } else if (name === "aadhar_card_no") {
      newValue = newValue.replace(/\s+/g, ""); // Remove spaces from aadhar card number
    }
    if (name === "phone" || name === "aadhar_card_no") {
      newValue = newValue.replace(/[^\d]/g, ""); // Only allow digits for phone and aadhar card
    }

    // Update formData for the field
    setFormData((prevData) => ({
      ...prevData,
      [name]: newValue,
    }));

    // Field-specific validation
    let fieldErrors = {};

    // Name validation
    if (name === "student_name") {
      if (!newValue) fieldErrors.student_name = "Name is required";
      else if (/^\d/.test(newValue))
        fieldErrors.student_name = "Name should not start with a number";
    }

    // Academic Qualification validation
    if (name === "academic_qual") {
      if (!newValue)
        fieldErrors.academic_qual = "Academic qualification is required";
    }

    // Date of Birth validation
    if (name === "dob") {
      if (!newValue) fieldErrors.dob = "Date of Birth is required";
    }
    if (name === "father_name") {
      if (!newValue) fieldErrors.father_name = "Father Name is required";
    }

    // Teacher Category validation
    if (name === "teacher_id") {
      if (!newValue) fieldErrors.teacher_id = "Teacher Category is required";
    }

    // Date of Joining validation
    if (name === "date_of_joining") {
      if (!newValue)
        fieldErrors.date_of_joining = "Date of Joining is required";
    }

    // Gender validation
    if (name === "sex") {
      if (!newValue) fieldErrors.sex = "Gender is required";
    }

    // Employee ID validation
    if (name === "employee_id") {
      if (!newValue) fieldErrors.employee_id = "Employee ID is required";
    }

    // Address validation
    if (name === "address") {
      if (!newValue) fieldErrors.address = "Address is required";
    }

    // Phone validation
    if (name === "phone") {
      fieldErrors.phone = validatePhone(newValue);
    }

    // Aadhaar card validation
    if (name === "aadhar_card_no") {
      fieldErrors.aadhar_card_no = validateAadhar(newValue);
    }

    // Update the errors state with the new field errors
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: fieldErrors[name],
    }));
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
      //   Object.values(errorsToCheck).forEach((error) => {
      //     // toast.error(error);
      //   });
      return;
    }

    const formattedFormData = {
      ...formData,
      dob: formatDateString(formData.dob),
      date_of_joining: formatDateString(formData.date_of_joining),
      //   teacher_image_name: String(formData.teacher_image_name),
    };

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token is found");
      }
      const response = await axios.put(
        `${API_URL}/api/update_caretaker/${staff.teacher_id}`,

        // `${API_URL}/api/update_caretaker`,
        formattedFormData,
        {
          headers: {
            // "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        toast.success("Care tacker updated successfully!");
        setTimeout(() => {
          navigate("/careTacker");
        }, 3000);
      }
    } catch (error) {
      console.error("Error:", error.message);
      toast.error("An error occurred while updating the Care tacker.");

      if (error.response && error.response.data) {
        setBackendErrors(error.response.data || {});
      } else {
        toast.error(error.message);
      }
    }
  };

  return (
    <div className="container mx-auto p-4 ">
      <ToastContainer />
      <div className="card p-4 rounded-md ">
        <div className=" card-header mb-4 flex justify-between items-center ">
          <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
            Edit Caretaker
          </h5>

          <RxCross1
            className="float-end relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
            onClick={() => {
              setErrors({});
              navigate("/careTacker");
            }}
          />
        </div>
        <div
          className=" relative w-full   -top-6 h-1  mx-auto bg-red-700"
          style={{
            backgroundColor: "#C03078",
          }}
        ></div>
        <p className="  md:absolute md:right-10  md:top-[15%]   text-gray-500 ">
          <span className="text-red-500">*</span>indicates mandatory information
        </p>
        <form
          onSubmit={handleSubmit}
          className="  md:mx-5 overflow-x-hidden shadow-md p-2 bg-gray-50"
        >
          <div className=" flex flex-col gap-4 md:grid  md:grid-cols-3 md:gap-x-14 md:mx-10 gap-y-1">
            <div className=" ">
              <label
                htmlFor="staffName"
                className="block font-bold  text-xs mb-2"
              >
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={100}
                id="staffName"
                name="student_name"
                pattern="^[^\d].*"
                title="Name should not start with a number"
                value={formData.student_name}
                onChange={handleChange}
                placeholder="Name"
                className="block  border w-full border-gray-300 rounded-md py-1 px-3  bg-white shadow-inner"
              />
              {errors.student_name && (
                <div className="text-red-500 text-xs ml-2">
                  {errors.student_name}
                </div>
              )}
            </div>
            <div>
              <label htmlFor="dob" className="block font-bold text-xs mb-2">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="dob"
                max={MAX_DATE}
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="block border w-full border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
              />
              {errors.dob && (
                <div className="text-red-500 text-xs ml-2">{errors.dob}</div>
              )}
            </div>
            <div>
              <label
                htmlFor="date_of_joining"
                className="block font-bold  text-xs mb-2"
              >
                Bithday <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="date_of_joining"
                max={today}
                name="date_of_joining"
                value={formData.date_of_joining}
                onChange={handleChange}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
              />
              {errors.date_of_joining && (
                <span className="text-red-500 text-xs ml-2">
                  {errors.date_of_joining}
                </span>
              )}
            </div>
            <div>
              <label
                htmlFor="father_name"
                className="block font-bold  text-xs mb-2"
              >
                Father's Name
              </label>
              <input
                type="text"
                maxLength={30}
                id="father_name"
                readOnly
                name="father_name"
                value={formData.father_name}
                onChange={handleChange}
                className="input-field bg-gray-200 block w-full border border-gray-300 rounded-md py-1 px-3  outline-none shadow-inner"
              />
            </div>

            <div>
              <label
                htmlFor="academic_qual"
                className="block font-bold  text-xs mb-2"
              >
                Class/Divsion <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={12}
                id="academic_qual"
                name="academic_qual"
                value={formData.academic_qual}
                onChange={handleChange} // Using the handleChange function to update formData and validate
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
              />
              {errors.academic_qual && (
                <span className="text-red-500 text-xs ml-2">
                  {errors.academic_qual}
                </span>
              )}
            </div>

            <div>
              <label
                htmlFor="address"
                className="block font-bold  text-xs mb-2"
              >
                Birth date in words <span className="text-red-500">*</span>
              </label>
              <textarea
                type="text"
                maxLength={200}
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="input-field resize block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
              />
              {errors.address && (
                <div className="text-red-500 text-xs ml-2">
                  {errors.address}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="employeeId"
                className="block font-bold  text-xs mb-2"
              >
                Nationality <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                maxLength={5}
                id="employeeId"
                name="employee_id"
                value={formData.employee_id}
                onChange={handleChange}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
              />
              {errors.employee_id && (
                <span className="text-red-500 text-xs ml-2">
                  {errors.employee_id}
                </span>
              )}
            </div>
            <div>
              <label
                htmlFor="employeeId"
                className="block font-bold  text-xs mb-2"
              >
                Purpose <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                maxLength={5}
                id="employeeId"
                name="employee_id"
                value={formData.employee_id}
                onChange={handleChange}
                className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
              />
              {errors.employee_id && (
                <span className="text-red-500 text-xs ml-2">
                  {errors.employee_id}
                </span>
              )}
            </div>

            <div className="col-span-3  text-right">
              <button
                type="submit"
                style={{ backgroundColor: "#2196F3" }}
                className=" text-white font-bold py-1 border-1 border-blue-500 px-4 rounded"
              >
                Update
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditCareTacker;
