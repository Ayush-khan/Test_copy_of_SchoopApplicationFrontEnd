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
  const [loading, setLoading] = useState(false);
  const [classIdForSearch, setClassIdForSearch] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [nameError, setNameError] = useState("");
  const [nameErrorForClass, setNameErrorForClass] = useState("");
  const [selectedClass, setSelectedClass] = useState(null);
  const [parentInformation, setParentInformation] = useState(null);

  const navigate = useNavigate();
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

  // for form
  const [errors, setErrors] = useState({});
  const [backendErrors, setBackendErrors] = useState({});

  // Maximum date for date_of_birth
  const MAX_DATE = "2006-12-31";
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchInitialData(); // Fetch classes on component mount
    fetchStudentNameWithClassId();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const classResponse = await axios.get(
        `${API_URL}/api/getallClassWithStudentCount`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setClassesforForm(classResponse.data || []);
    } catch (error) {
      toast.error("Error fetching initial data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentNameWithClassId = async (section_id = null) => {
    setLoading(true);
    try {
      const params = section_id ? { section_id } : {};
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/api/getStudentListBySection`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );
      setStudentNameWithClassId(response?.data?.students || []);
    } catch (error) {
      toast.error("Error fetching students.");
    } finally {
      setLoading(false);
    }
  };

  const classOptions = useMemo(
    () =>
      classesforForm.map((cls) => ({
        value: cls.section_id,
        label: `${cls?.get_class?.name} ${cls.name}`,
        key: `${cls.class_id}-${cls.section_id}`,
      })),
    [classesforForm]
  );

  const studentOptions = useMemo(
    () =>
      studentNameWithClassId.map((stu) => ({
        value: stu.student_id,
        label: `${stu?.first_name} ${stu?.mid_name} ${stu.last_name}`,
      })),
    [studentNameWithClassId]
  );

  const handleClassSelect = (selectedOption) => {
    setNameErrorForClass(""); // Reset class error on selection
    setSelectedClass(selectedOption);
    setSelectedStudent(null);
    setSelectedStudentId(null);
    setClassIdForSearch(selectedOption.value);
    fetchStudentNameWithClassId(selectedOption.value);
  };

  const handleStudentSelect = (selectedOption) => {
    setNameError(""); // Reset student error on selection
    setSelectedStudent(selectedOption);
    setSelectedStudentId(selectedOption.value);
  };

  const handleSearch = async () => {
    // Reset error messages
    setNameError("");
    setNameErrorForClass("");

    // Validate if class and student are selected
    let hasError = false;

    if (!selectedClass) {
      setNameErrorForClass("Please select a class.");
      hasError = true;
    }
    if (!selectedStudent) {
      setNameError("Please select a student.");
      hasError = true;
    }

    // If there are validation errors, exit the function
    if (hasError) return;

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/api/get_srnobonafide/${selectedStudentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Check if data was received and update the form state
      if (response?.data?.data) {
        const fetchedData = response?.data?.data; // Extract the data
        setParentInformation(response?.data?.data); // Assuming response data contains form data

        // Populate formData with the fetched data
        setFormData({
          sr_no: fetchedData.sr_no || "",
          student_name: fetchedData.student_name || "",
          dob: fetchedData.dob || "",
          date_of_joining: fetchedData.date_of_joining || "",
          father_name: fetchedData.father_name || "",
          academic_qual: fetchedData.academic_qual || "",
          professional_qual: fetchedData.professional_qual || "",
          trained: fetchedData.trained || "",
          experience: fetchedData.experience || "",
          sex: fetchedData.sex || "",
          blood_group: fetchedData.blood_group || "",
          religion: fetchedData.religion || "",
          address: fetchedData.address || "",
          phone: fetchedData.phone || "",
          email: fetchedData.email || "",
          aadhar_card_no: fetchedData.aadhar_card_no || "",
          teacher_id: fetchedData.teacher_id || "",
          employee_id: fetchedData.employee_id || "",
          teacher_image_name: fetchedData.teacher_image_name || null,
          special_sub: fetchedData.special_sub || "",
        });
      } else {
        toast.error("No data found for the selected student.");
      }
    } catch (error) {
      toast.error("Error fetching data for the selected student.");
    }
  };
  // For FOrm
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
        `${API_URL}/api//${selectedStudentId}`,

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
    <div>
      <ToastContainer />
      <div className="container mt-4">
        {/* Search Section */}
        <div className="w-full col-span-4 flex justify-center flex-col md:flex-row gap-x-1 md:gap-x-8 bg-white rounded-lg border border-gray-300 mx-auto mt-10 p-6">
          <div className="w-full md:w-[80%] flex md:flex-row justify-between items-center">
            <div className="w-full md:w[80%] flex flex-col gap-y-2 md:gap-y-0 md:flex-row ml-0 md:ml-10">
              <div className="w-full gap-x-3 md:justify-start justify-between my-1 md:my-4 flex md:flex-row">
                <div className="w-full md:w-[60%]">
                  <Select
                    value={selectedClass}
                    onChange={handleClassSelect}
                    options={classOptions}
                    placeholder="Class"
                    isSearchable
                    isClearable
                    className="text-sm"
                  />
                  {nameErrorForClass && (
                    <div className="relative top-0.5 ml-1 text-danger text-xs">
                      {nameErrorForClass}
                    </div>
                  )}
                </div>
              </div>
              <div className="w-full relative left-0 md:-left-[7%] justify-between md:w-[90%] my-1 md:my-4 flex md:flex-row">
                <div className="w-full md:w-[80%]">
                  <Select
                    value={selectedStudent}
                    onChange={handleStudentSelect}
                    options={studentOptions}
                    placeholder="Student Name"
                    isSearchable
                    isClearable
                    className="text-sm"
                  />
                  {nameError && (
                    <span className="relative top-0.5 md:absolute md:top-[95%] ml-1 text-danger text-xs">
                      {nameError}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={handleSearch}
                type="button"
                className="my-1 md:my-4 btn h-10 w-18 md:w-auto btn-primary"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Form Section - Displayed when parentInformation is fetched */}
        {parentInformation && (
          <div className=" w-full md:w-[80%]  mx-auto p-4 ">
            <div className="card mx-auto lg:w-full shadow-md">
              {/* <div className="card p-4 rounded-md "> */}
              <div className=" card-header mb-4 flex justify-between items-center ">
                <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
                  Student Information
                </h5>
                {/* 
                <RxCross1
                  className="float-end relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                  onClick={() => {
                    setErrors({});
                    navigate("/careTacker");
                  }}
                /> */}
              </div>
              <div
                className=" relative w-full   -top-6 h-1  mx-auto bg-red-700"
                style={{
                  backgroundColor: "#C03078",
                }}
              ></div>
              <p className="  md:absolute md:right-10  md:top-[15%]   text-gray-500 ">
                <span className="text-red-500">*</span>indicates mandatory
                information
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
                    <label
                      htmlFor="dob"
                      className="block font-bold text-xs mb-2"
                    >
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
                      <div className="text-red-500 text-xs ml-2">
                        {errors.dob}
                      </div>
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
                      Birth date in words{" "}
                      <span className="text-red-500">*</span>
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
        )}
      </div>
    </div>
  );
};

export default CreateCreateBonafide;
