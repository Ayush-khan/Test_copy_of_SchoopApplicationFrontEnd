import React, { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import { RxCross1 } from "react-icons/rx";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ImageCropper from "../common/ImageUploadAndCrop";
import { FaUserGroup } from "react-icons/fa6";

function ViewStudent() {
  const API_URL = import.meta.env.VITE_API_URL;
  // for unique user name
  const [usernameError, setUsernameError] = useState(""); // To store the error message

  const navigate = useNavigate();
  const location = useLocation();
  const { student } = location.state || {};
  const [classes, setClasses] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [classError, setClassError] = useState("");
  const [divisionError, setDivisionError] = useState("");

  // Fetch class names
  useEffect(() => {
    const fetchClassNames = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(`${API_URL}/api/getClassList`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClasses(response.data);
        console.log("claases are", classes);
      } catch (error) {
        toast.error("Error fetching class names");
      }
    };

    fetchClassNames();
  }, [API_URL]);

  // Handle class change and fetch divisions
  const handleClassChange = async (e) => {
    const selectedClassId = e.target.value;
    setSelectedClass(selectedClassId);
    setFormData((prev) => ({
      ...prev,
      class_id: selectedClassId,
      section_id: "",
    }));
    setSelectedDivision(""); // Clear division when class changes

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/api/get_divisions/${selectedClassId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDivisions(response.data.divisions); // Update divisions based on selected class
    } catch (error) {
      toast.error("Error fetching divisions");
    }
  };

  // Handle division change
  const handleDivisionChange = (e) => {
    const selectedDivisionId = e.target.value;
    setSelectedDivision(selectedDivisionId);
    setFormData((prev) => ({ ...prev, section_id: selectedDivisionId }));
  };

  // const [formData, setFormData] = useState({
  //   first_name: "",
  //   mid_name: "",
  //   last_name: "",
  //   house: "",
  //   student_name: "",
  //   dob: "",
  //   admission_date: "",
  //   stud_id_no: "",
  //   stu_aadhaar_no: "",
  //   gender: "",
  //   mother_tongue: "",
  //   birth_place: "",
  //   admission_class: " ",
  //   city: " ",
  //   state: "",
  //   roll_no: "",
  //   class_id: "",
  //   section_id: "",
  //   religion: "",
  //   caste: "",
  //   subcaste: "",
  //   vehicle_no: "",
  //   emergency_name: " ",
  //   emergency_contact: "",
  //   emergency_add: "",
  //   height: "",
  //   weight: "",
  //   allergies: "",
  //   nationality: "",
  //   pincode: "",
  //   image_name: "",
  //   // Parent information
  //   father_name: "  .",
  //   father_occupation: "",
  //   f_office_add: "  ",
  //   f_office_tel: "",
  //   f_mobile: "",
  //   f_email: "",
  //   father_adhar_card: "",
  //   mother_name: " ",
  //   mother_occupation: "",
  //   m_office_add: " ",
  //   m_office_tel: "",
  //   m_mobile: "",
  //   m_emailid: "",
  //   mother_adhar_card: "",

  //   // Preferences
  //   SetToReceiveSMS: "",
  //   SetEmailIDAsUsername: "",

  //   // Base64 Image (optional)
  //   student_image: "",
  // });
  const [formData, setFormData] = useState({
    // Student fields
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
    category: " ",
    blood_group: " ",
    mother_tongue: "",
    permant_add: " ",
    birth_place: "",
    admission_class: "",
    city: "",
    state: "",
    roll_no: "",
    class_id: "",
    section_id: "",
    religion: "",
    caste: "",
    subcaste: "",
    vehicle_no: "",
    emergency_name: "",
    emergency_contact: "",
    emergency_add: "",
    transport_mode: " ",
    height: "",
    weight: "",
    allergies: "",
    nationality: "",
    pincode: "",
    image_name: "",
    student_id: "",
    reg_id: " ",
    // Parent fields
    father_name: "",
    father_occupation: "",
    f_office_add: "",
    f_office_tel: "",
    f_mobile: "",
    f_email: "",
    father_adhar_card: "",
    mother_name: "",
    mother_occupation: "",
    m_office_add: "",
    m_office_tel: "",
    m_mobile: "",
    m_emailid: "",
    mother_adhar_card: "",
    udise_pen_no: "",
    // Preferences
    SetToReceiveSMS: "",
    SetEmailIDAsUsername: "",
  });
  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);
  const [backendErrors, setBackendErrors] = useState({});

  console.log("employeeID", student.employeeId);

  // State for father's mobile selection
  const [fatherMobileSelected, setFatherMobileSelected] = useState({
    setUsername: false, // If father's mobile is set as username
    receiveSms: false, // If SMS is received on father's mobile
  });

  // State for mother's mobile selection
  const [motherMobileSelected, setMotherMobileSelected] = useState({
    setUsername: false, // If mother's mobile is set as username
    receiveSms: false, // If SMS is received on mother's mobile
  });

  // State for father's email selection
  const [fatherEmailSelected, setFatherEmailSelected] = useState({
    setUsername: false, // If father's email is set as username
  });

  // State for mother's email selection
  const [motherEmailSelected, setMotherEmailSelected] = useState({
    setUsername: false, // If mother's email is set as username
  });
  console.log("student", student);
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
        permant_add: student.permant_add || " ",
        mother_tongue: student.mother_tongue || "",
        birth_place: student.birth_place || "",
        admission_class: student.admission_class || " ",
        city: student.city || " ",
        state: student.state || "",
        roll_no: student.roll_no || "",
        student_id: student.student_id || " ",
        reg_id: student.reg_id || " ",
        blood_group: student.blood_group || " ",
        category: student.category || " ",
        class_id: student.class_id || "",
        section_id: student.section_id || "",
        religion: student.religion || "",
        caste: student.caste || "",
        subcaste: student.subcaste || "",
        transport_mode: student.transport_mode || " ",
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
        father_name: student?.parents?.father_name || " ",
        father_occupation: student?.parents?.father_occupation || "",
        f_office_add: student?.parents?.f_office_add || "  ",
        f_office_tel: student?.parents?.f_office_tel || "",
        f_mobile: student?.parents?.f_mobile || "",
        f_email: student?.parents?.f_email || "",
        father_adhar_card: student?.parents?.father_adhar_card || "",
        mother_name: student?.parents?.mother_name || " ",
        mother_occupation: student?.parents?.mother_occupation || "",
        m_office_add: student?.parents?.m_office_add || " ",
        m_office_tel: student?.parents?.m_office_tel || "",
        m_mobile: student?.parents?.m_mobile || "",
        m_emailid: student?.parents?.m_emailid || "",
        mother_adhar_card: student?.parents?.mother_adhar_card || "",
        udise_pen_no: student.udise_pen_no || " ",
        // Preferences
        SetToReceiveSMS: student.SetToReceiveSMS || "",
        SetEmailIDAsUsername: student.SetEmailIDAsUsername || "",

        // Base64 Image (optional)
        // student_image: student.student_image || "",
      });

      // Set the initial state for father's and mother's mobile preferences based on prefilled data
      // Update the state for username and SMS based on the prefilled data
      setFatherMobileSelected({
        setUsername: student.SetEmailIDAsUsername === "FatherMob",
        receiveSms: student.SetToReceiveSMS === "FatherMob",
      });
      setMotherMobileSelected({
        setUsername: student.SetEmailIDAsUsername === "MotherMob",
        receiveSms: student.SetToReceiveSMS === "MotherMob",
      });
      setFatherEmailSelected({
        setUsername: student.SetEmailIDAsUsername === "Father",
      });
      setMotherEmailSelected({
        setUsername: student.SetEmailIDAsUsername === "Mother",
      });

      setSelectedClass(student.class_id || ""); // Set the selected class
      setSelectedDivision(student.section_id || ""); // Set the selected division

      if (student.student_image) {
        setPhotoPreview(
          // `${API_URL}/path/to/images/${student.teacher_image_name}`
          `${student.student_image}`
        );
      }
    }
  }, [student, API_URL]);
  // Fetch divisions when the class is already selected (for pre-filled data)
  useEffect(() => {
    if (selectedClass) {
      const fetchDivisions = async () => {
        try {
          const token = localStorage.getItem("authToken");
          const response = await axios.get(
            `${API_URL}/api/get_divisions/${selectedClass}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setDivisions(response.data.divisions); // Update divisions
        } catch (error) {
          toast.error("Error fetching divisions");
        }
      };

      fetchDivisions();
    }
  }, [selectedClass, API_URL]);

  // Function to check username uniqueness
  // Function to check username uniqueness
  // const studentId=student.student_id
  // console.log("studentId",studentId)
  const checkUserId = async (studentId, userId) => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/check-user-id/${studentId}/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data; // API returns true or false
    } catch (error) {
      console.error("Error checking username uniqueness:", error);
      return false;
    }
  };
  const handleSetUsernameSelection = async (value, userId) => {
    const isUnique = await checkUserId(student.student_id, userId); // Check if username is unique

    if (!isUnique) {
      setUsernameError(`Username "${userId}" is already taken.`);
    } else {
      setUsernameError(""); // Clear error if the username is unique
      setFormData((prevData) => ({
        ...prevData,
        SetEmailIDAsUsername: value, // Set the selected username in formData
      }));
    }
  };

  // Father's Mobile Selection for Username
  const handleFatherMobileSelection = async () => {
    await handleSetUsernameSelection("FatherMob", formData.f_mobile); // Father's mobile
    if (!usernameError) {
      setFatherMobileSelected({ setUsername: true });
      setMotherMobileSelected({ setUsername: false });
    }
  };

  // Mother's Mobile Selection for Username
  const handleMotherMobileSelection = async () => {
    await handleSetUsernameSelection("MotherMob", formData.m_mobile); // Mother's mobile
    if (!usernameError) {
      setMotherMobileSelected({ setUsername: true });
      setFatherMobileSelected({ setUsername: false });
    }
  };

  // Father's Email Selection for Username
  const handleFatherEmailSelection = async () => {
    await handleSetUsernameSelection("Father", formData.f_email); // Father's email
    if (!usernameError) {
      setFatherMobileSelected({ setUsername: false });
      setMotherMobileSelected({ setUsername: false });
    }
  };

  // Mother's Email Selection for Username
  const handleMotherEmailSelection = async () => {
    await handleSetUsernameSelection("Mother", formData.m_emailid); // Mother's email
    if (!usernameError) {
      setFatherMobileSelected({ setUsername: false });
      setMotherMobileSelected({ setUsername: false });
    }
  };

  // for togle radio button and logic

  // Handle selection for "Receive SMS"
  const handleReceiveSmsSelection = (value) => {
    setFormData((prevData) => ({
      ...prevData,
      SetToReceiveSMS: value, // One of 'FatherMob', 'MotherMob'
    }));

    // Reset SMS selections and set the selected one
    setFatherMobileSelected((prev) => ({
      ...prev,
      receiveSms: value === "FatherMob",
    }));
    setMotherMobileSelected((prev) => ({
      ...prev,
      receiveSms: value === "MotherMob",
    }));
  };

  // Validation Functions
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

    // Validate required fields
    if (!formData.first_name) newErrors.first_name = "First name is required";
    if (!formData.gender) newErrors.gender = "Gender selection is required";
    if (!formData.dob) newErrors.dob = "Date of Birth is required";

    // Phone, Aadhar and Email validations
    const phoneError = validatePhone(formData.f_mobile);
    if (phoneError) newErrors.f_mobile = phoneError;

    const aadharError = validateAadhar(formData.father_adhar_card);
    if (aadharError) newErrors.father_adhar_card = aadharError;

    const emailErrorFather = validateEmail(formData.f_email);
    if (emailErrorFather) newErrors.f_email = emailErrorFather;

    const emailErrorMother = validateEmail(formData.m_emailid);
    if (emailErrorMother) newErrors.m_emailid = emailErrorMother;
    // Validate required fields
    if (!formData.father_name.trim())
      newErrors.father_name = "Father Name is required";
    if (!formData.father_adhar_card.trim())
      newErrors.father_adhar_card = "Father Aadhaar Card No. is required";
    if (!formData.mother_name.trim())
      newErrors.mother_name = "Mother Name is required";
    if (!formData.mother_adhar_card.trim())
      newErrors.mother_adhar_card = "Mother Aadhaar Card No. is required";
    // Add more validations as needed

    return newErrors;
  };

  // Handle change and field-level validation
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
    if (name === "f_mobile") {
      fieldErrors.f_mobile = validatePhone(newValue);
    } else if (name === "father_adhar_card") {
      fieldErrors.father_adhar_card = validateAadhar(newValue);
    } else if (name === "f_email" || name === "m_emailid") {
      fieldErrors[name] = validateEmail(newValue);
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      ...fieldErrors,
    }));
  };

  // const validatePhone = (phone) => {
  //   if (!phone) return "Phone number is required";
  //   if (!/^\d{10}$/.test(phone)) return "Phone number must be 10 digits";
  //   return null;
  // };

  // const validateAadhar = (aadhar) => {
  //   if (!aadhar) return "Aadhar card number is required";
  //   if (!/^\d{12}$/.test(aadhar.replace(/\s+/g, "")))
  //     return "Aadhar card number must be 12 digits";
  //   return null;
  // };

  // const validateEmail = (email) => {
  //   if (!email) return "Email is required";
  //   if (!/\S+@\S+\.\S+/.test(email)) return "Email address is invalid";
  //   return null;
  // };

  // const validate = () => {
  //   const newErrors = {};
  //   if (!formData.first_name) newErrors.first_name = "First name is required";
  //   // Add other field validations
  //   const phoneError = validatePhone(formData.phone);
  //   if (phoneError) newErrors.phone = phoneError;
  //   const aadharError = validateAadhar(formData.aadhar_card_no);
  //   if (aadharError) newErrors.aadhar_card_no = aadharError;
  //   const emailError = validateEmail(formData.email);
  //   if (emailError) newErrors.email = emailError;
  //   return newErrors;
  // };

  // const handleChange = (event) => {
  //   const { name, value, checked, type } = event.target;
  //   let newValue = value;

  //   if (type === "checkbox") {
  //     newValue = checked;
  //   }

  //   setFormData((prevData) => ({
  //     ...prevData,
  //     [name]: newValue,
  //   }));

  //   // Validate field on change
  //   let fieldErrors = {};
  //   if (name === "phone") {
  //     fieldErrors.phone = validatePhone(newValue);
  //   } else if (name === "aadhar_card_no") {
  //     fieldErrors.aadhar_card_no = validateAadhar(newValue);
  //   } else if (name === "email") {
  //     fieldErrors.email = validateEmail(newValue);
  //   }

  //   setErrors((prevErrors) => ({
  //     ...prevErrors,
  //     ...fieldErrors,
  //   }));
  // };

  // const handleFileChange = (event) => {
  //   const file = event.target.files[0];
  //   if (file) {
  //     setFormData((prevState) => ({
  //       ...prevState,
  //       student_image: file,
  //     }));
  //     setPhotoPreview(URL.createObjectURL(file));
  //   }
  // };

  const handleImageCropped = (croppedImageData) => {
    setFormData((prevData) => ({
      ...prevData,
      student_image: croppedImageData,
    }));
  };

  // const handleSubmit = async (event) => {
  //   event.preventDefault();
  //   const validationErrors = validate();

  //   if (Object.keys(validationErrors).length > 0) {
  //     setErrors(validationErrors);
  //     Object.values(validationErrors).forEach((error) => {
  //       toast.error(error);
  //     });
  //     return;
  //   }

  //   // Prepare the data for API submission
  //   const formattedFormData = new FormData();
  //   Object.keys(formData).forEach((key) => {
  //     if (formData[key] instanceof File) {
  //       formattedFormData.append(key, formData[key]);
  //     } else {
  //       formattedFormData.append(key, formData[key]);
  //     }
  //   });
  //   console.log(" formattedFormData is,", formData);

  //   try {
  //     const token = localStorage.getItem("authToken");
  //     if (!token) {
  //       throw new Error("No authentication token is found");
  //     }
  //     console.log(" formattedFormData,", formattedFormData);
  //     const response = await axios.put(
  //       `${API_URL}/api/students/${student.student_id}`,
  //       formData,
  //       {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     if (response.status === 200) {
  //       toast.success("Student updated successfully!");
  //       setTimeout(() => {
  //         navigate("/StudentList");
  //       }, 3000);
  //     }
  //   } catch (error) {
  //     toast.error("An error occurred while updating the student.");
  //     console.error("Error:", error.response?.data || error.message);
  //     if (error.response && error.response.data && error.response.data.errors) {
  //       setBackendErrors(error.response.data.errors || {});
  //     } else {
  //       toast.error(error.message);
  //     }
  //   }
  // };
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

    // Create FormData object
    const formattedFormData = new FormData();
    Object.keys(formData).forEach((key) => {
      formattedFormData.append(key, formData[key]);
    });

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }
      console.log("formattedFormData", formattedFormData);
      console.log("formData", formData);
      const response = await axios.put(
        `${API_URL}/api/students/${student.student_id}`,
        formData, // Send the FormData object
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

  // Fetch class names when component loads

  return (
    <div className=" w-[95%] mx-auto p-4">
      <ToastContainer />
      <div className="card p-3  rounded-md">
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
        <p className=" md:absolute md:right-8 md:top-[5%] text-gray-500">
          <span className="text-red-500">*</span> indicates mandatory
          information
        </p>
        <form
          onSubmit={handleSubmit}
          className="md:mx-2 overflow-x-hidden shadow-md py-1 bg-gray-50"
        >
          <div className="flex flex-col gap-y-3 p-2 md:grid md:grid-cols-4 md:gap-x-14 md:mx-10 ">
            <h5 className="col-span-4 text-blue-400  relative top-2">
              {" "}
              Personal Information
            </h5>
            <div className=" row-span-2  ">
              <ImageCropper
                photoPreview={photoPreview}
                onImageCropped={handleImageCropped}
              />
            </div>
            <div className="mt-2">
              <label
                htmlFor="first_name"
                className="block font-bold text-xs mb-0.5"
              >
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                maxLength={100}
                // required
                value={formData.first_name}
                onChange={handleChange}
                className=" input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
              />
              {errors.first_name && (
                <span className="text-red-500 text-xs">
                  {errors.first_name}
                </span>
              )}
            </div>
            {/* Add other form fields similarly */}
            <div className="mt-2">
              <label
                htmlFor="mid_name"
                className="block font-bold text-xs mb-0.5"
              >
                Middle Name
              </label>
              <input
                type="text"
                id="mid_name"
                name="mid_name"
                maxLength={100}
                value={formData.mid_name}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
            </div>
            <div className="mt-2">
              <label
                htmlFor="lastName"
                className="block font-bold text-xs mb-0.5"
              >
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="last_name"
                maxLength={100}
                value={formData.last_name}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
            </div>
            <div className="mt-2">
              <label
                htmlFor="dateOfBirth"
                className="block font-bold text-xs mb-0.5"
              >
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="dateOfBirth"
                name="dob"
                value={formData.dob}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
              {errors.dateOfBirth && (
                <p className="text-[12px] text-red-500 mb-1">
                  {errors.dateOfBirth}
                </p>
              )}
            </div>
            <div className="mt-2">
              <label
                htmlFor="gender"
                className="block font-bold text-xs mb-0.5"
              >
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              >
                <option>Select</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
              {errors.gender && (
                <p className="text-[12px] text-red-500 mb-1">{errors.gender}</p>
              )}
            </div>
            <div className="mt-2">
              <label
                htmlFor="bloodGroup"
                className="block font-bold text-xs mb-0.5"
              >
                Blood group
              </label>
              <select
                id="bloodGroup"
                name="blood_group"
                value={formData.blood_group}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
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
            <div className="mt-2">
              <label
                htmlFor="religion"
                className="block font-bold text-xs mb-0.5"
              >
                Religion <span className="text-red-500">*</span>
              </label>
              <select
                id="religion"
                name="religion"
                value={formData.religion}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
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
              {errors.religion && (
                <p className="text-[12px] text-red-500 mb-1">
                  {errors.religion}
                </p>
              )}
            </div>
            <div className="mt-2">
              <label htmlFor="caste" className="block font-bold text-xs mb-0.5">
                Caste
              </label>
              <input
                type="text"
                id="caste"
                maxLength={100}
                name="caste"
                value={formData.caste}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
            </div>
            <div className="mt-2">
              <label
                htmlFor="category"
                className="block font-bold text-xs mb-0.5"
              >
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
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
              {errors.category && (
                <p className="text-[12px] text-red-500 mb-1">
                  {errors.category}
                </p>
              )}
            </div>
            <div className="mt-2">
              <label
                htmlFor="birthPlace"
                className="block font-bold text-xs mb-0.5"
              >
                Birth Place
              </label>
              <input
                type="text"
                id="birthPlace"
                name="birth_place"
                maxLength={50}
                value={formData.birth_place}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
            </div>
            <div className="mt-2">
              <label
                htmlFor="nationality"
                className="block font-bold text-xs mb-0.5"
              >
                Nationality <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nationality"
                maxLength={100}
                name="nationality"
                value={formData.nationality}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
              {errors.nationality && (
                <p className="text-[12px] text-red-500 mb-1">
                  {errors.nationality}
                </p>
              )}
            </div>
            <div className="mt-2">
              <label
                htmlFor="motherTongue"
                className="block font-bold text-xs mb-0.5"
              >
                Mother Tongue <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="motherTongue"
                name="mother_tongue"
                maxLength={20}
                value={formData.mother_tongue}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
              {errors.motherTongue && (
                <p className="text-[12px] text-red-500 mb-1">
                  {errors.motherTongue}
                </p>
              )}
            </div>
            {/* Student Details */}
            {/* <div className="w-[120%] mx-auto h-2 bg-white col-span-4"></div> */}
            <h5 className="col-span-4 text-blue-400 mt-2 relative top-4">
              {" "}
              Student Details
            </h5>
            <div className="mt-2">
              <label
                htmlFor="studentName"
                className="block font-bold text-xs mb-0.5"
              >
                Student Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="studentName"
                maxLength={100}
                name="student_name"
                value={formData.student_name}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
              {errors.student_name && (
                <p className="text-[12px] text-red-500 mb-1">
                  {errors.student_name}
                </p>
              )}
            </div>
            <div className="mt-2">
              <label
                htmlFor="studentClass"
                className="block font-bold text-xs mb-0.5"
              >
                Class <span className="text-red-500">*</span>
              </label>
              <select
                id="studentClass"
                name="class_id"
                value={selectedClass}
                onChange={handleClassChange}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
              >
                <option value="">Select</option>
                {classes.map((cls) => (
                  <option key={cls.class_id} value={cls.class_id}>
                    {cls.name}
                  </option>
                ))}
              </select>
              {errors.studentClass && (
                <p className="text-[12px] text-red-500 mb-1">
                  {errors.studentClass}
                </p>
              )}
            </div>
            {/* Division Dropdown */}
            <div className="mt-2">
              <label
                htmlFor="division"
                className="block font-bold text-xs mb-0.5"
              >
                Division <span className="text-red-500">*</span>
              </label>
              <select
                id="division"
                name="section_id"
                value={selectedDivision}
                onChange={handleDivisionChange}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
                disabled={!selectedClass} // Disable division until class is selected
              >
                <option value="">Select</option>
                {divisions.map((div) => (
                  <option key={div.section_id} value={div.section_id}>
                    {div.name}
                  </option>
                ))}
              </select>
              {errors.division && (
                <p className="text-[12px] text-red-500 mb-1">
                  {errors.division}
                </p>
              )}
            </div>
            <div className="mt-2">
              <label
                htmlFor="rollNumber"
                className="block font-bold text-xs mb-0.5"
              >
                Roll No.
              </label>
              <input
                type="text"
                id="rollNumber"
                maxLength={11}
                name="roll_no"
                value={formData.roll_no}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
            </div>
            <div className="mt-2">
              <label
                htmlFor="grnNumber"
                className="block font-bold text-xs mb-0.5"
              >
                GRN No. <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="grnNumber"
                name="reg_id"
                maxLength={10}
                value={formData.reg_id}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
              {errors.grnNumber && (
                <p className="text-[12px] text-red-500 mb-1">
                  {errors.grnNumber}
                </p>
              )}
            </div>{" "}
            <div className="mt-2">
              <label htmlFor="house" className="block font-bold text-xs mb-0.5">
                House
              </label>
              <select
                id="house"
                name="house"
                value={formData.house}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
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
            <div className="mt-2">
              <label
                htmlFor="admittedInClass"
                className="block font-bold text-xs mb-0.5"
              >
                Admitted In Class <span className="text-red-500">*</span>
              </label>
              <select
                id="admittedInClass"
                name="admittedInClass"
                value={formData.admission_class}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
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
              {errors.admittedInClass && (
                <p className="text-[12px] text-red-500 mb-1">
                  {errors.admittedInClass}
                </p>
              )}
            </div>
            <div className="mt-2">
              <label
                htmlFor="dataOfAdmission"
                className="block font-bold text-xs mb-0.5"
              >
                Date of Admission <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="dataOfAdmission"
                name="admission_date"
                value={formData.admission_date}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
              {errors.dataOfAdmission && (
                <p className="text-[12px] text-red-500 mb-1">
                  {errors.dataOfAdmission}
                </p>
              )}
            </div>
            <div className="mt-2">
              <label
                htmlFor="studentIdNumber"
                className="block font-bold text-xs mb-0.5"
              >
                Student ID No.
              </label>
              <input
                type="text"
                id="studentIdNumber"
                name="student_id"
                maxLength={25}
                value={formData.student_id}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
            </div>
            <div className="mt-2">
              <label
                htmlFor="studentAadharNumber"
                className="block font-bold text-xs mb-0.5"
              >
                Student Aadhar No. <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="studentAadharNumber"
                name="stu_aadhaar_no"
                maxLength={14}
                value={formData.stu_aadhaar_no}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
              {errors.studentAadharNumber && (
                <p className="text-[12px] text-red-500 mb-1">
                  {errors.studentAadharNumber}
                </p>
              )}
            </div>{" "}
            {selectedClass > 99 && (
              <div className="mt-2">
                <label
                  htmlFor="studentAadharNumber"
                  className="block font-bold text-xs mb-0.5"
                >
                  Udise Pen No.
                </label>
                <input
                  type="text"
                  id="Udise_no"
                  name="udise_pen_no"
                  maxLength={14}
                  value={formData.udise_pen_no}
                  className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
                  onChange={handleChange}
                  // onBlur={handleBlur}
                />
              </div>
            )}
            {/* Address Information */}
            <h5 className="col-span-4 text-blue-400 mt-2 relative top-4">
              {" "}
              Address Information
            </h5>
            <div className="mt-2">
              <label
                htmlFor="address"
                className="block font-bold text-xs mb-0.5"
              >
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                id="address"
                name="permant_add"
                maxLength={200}
                rows={2}
                value={formData.permant_add}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
              {errors.address && (
                <p className="text-[12px] text-red-500 mb-1">
                  {errors.address}
                </p>
              )}
            </div>
            <div className="mt-2">
              <label htmlFor="city" className="block font-bold text-xs mb-0.5">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="city"
                name="city"
                maxLength={100}
                value={formData.city}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
              {errors.city && (
                <p className="text-[12px] text-red-500 mb-1">{errors.city}</p>
              )}
            </div>
            <div className="mt-2">
              <label htmlFor="state" className="block font-bold text-xs mb-0.5">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="state"
                maxLength={100}
                name="state"
                value={formData.state}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
              {errors.state && (
                <p className="text-[12px] text-red-500 mb-1">{errors.state}</p>
              )}
            </div>
            <div className="mt-2">
              <label
                htmlFor="pincode"
                className="block font-bold text-xs mb-0.5"
              >
                Pincode
              </label>
              <input
                type="text"
                id="pincode"
                maxLength={11}
                name="pincode"
                value={formData.pincode}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
            </div>
            {/* </div> */}
            {/*  */}
            {/* <div className="w-full sm:max-w-[30%]"> */}
            {/* Emergency Contact */}
            <h5 className="col-span-4 text-blue-400 mt-2 relative top-4">
              {" "}
              Emergency Contact
            </h5>
            <div className="mt-2">
              <label
                htmlFor="emergencyName"
                className="block font-bold text-xs mb-0.5"
              >
                Emergency Name
              </label>
              <input
                type="text"
                id="emergencyName"
                maxLength={100}
                name="emergency_name"
                value={formData.emergency_name}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
            </div>
            <div className="mt-2">
              <label
                htmlFor="emergencyAddress"
                className="block font-bold text-xs mb-0.5"
              >
                Emergency Address
              </label>
              <textarea
                id="emergencyAddress"
                name="emergency_add"
                rows={2}
                maxLength={200}
                value={formData.emergency_add}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
              <div className="flex flex-row items-center gap-2 -mt-1 w-full">
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
                <label htmlFor="sameAs" className="text-xs">
                  Same as permanent address
                </label>
              </div>
            </div>
            <div className="mt-2">
              <label
                htmlFor="emergencyContact"
                className="block font-bold text-xs mb-0.5"
              >
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
                  name="emergency_contact"
                  maxLength={10}
                  value={formData.emergency_contact}
                  className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
                  onChange={handleChange}
                  // onBlur={handleBlur}
                />
              </div>
            </div>
            {/* Transport Information */}
            {/* <h5 className="col-span-4 text-gray-500 mt-2 relative top-2"> Transport Information</h5> */}
            <div className="mt-2">
              <label
                htmlFor="transportMode"
                className="block font-bold text-xs mb-0.5"
              >
                Transport Mode
              </label>
              <select
                id="transportMode"
                name="transport_mode"
                value={formData.transport_mode}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
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
                name="vehicle_no"
                maxLength={13}
                placeholder="Vehicle No."
                value={formData.vehicle_no}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
            </div>
            {/* Health Information */}
            <h5 className="col-span-4 text-blue-400 mt-2 relative top-4">
              {" "}
              Health Information
            </h5>
            <div className="mt-2">
              <label
                htmlFor="allergies"
                className="block font-bold text-xs mb-0.5"
              >
                Allergies(if any)
              </label>
              <input
                type="text"
                id="allergies"
                name="allergies"
                maxLength={200}
                value={formData.allergies}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
            </div>
            <div className="mt-2">
              <label
                htmlFor="height"
                className="block font-bold text-xs mb-0.5"
              >
                Height
              </label>
              <input
                type="text"
                id="height"
                maxLength={4.1}
                name="height"
                value={formData.height}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
            </div>
            <div className="mt-2">
              <label
                htmlFor="weight"
                className="block font-bold text-xs mb-0.5"
              >
                Weight
              </label>
              <input
                type="text"
                id="weight"
                name="weight"
                maxLength={4.1}
                value={formData.weight}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
            </div>
            <div className="  flex gap-4 pt-[7px]">
              <div
                htmlFor="weight"
                className="block font-bold text-[.9em] mt-4 "
              >
                Has Spectacles
              </div>
              <div className="flex items-center gap-6 mt-3">
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
            {/* Add other form fields similarly */}
            {/* ... */}
            <div className="w-full col-span-4 relative top-4">
              <div className="w-full mx-auto">
                <h3 className="text-blue-500 w-full mx-auto text-center  md:text-[1.2em] text-nowrap font-bold">
                  {" "}
                  <FaUserGroup className="text-[1.4em] text-blue-700 inline" />{" "}
                  Parent's Information :{" "}
                </h3>
              </div>
            </div>
            <h5 className="col-span-4 text-blue-400 mt-2 relative top-4">
              {" "}
              Father Details
            </h5>
            <div className="mt-2">
              <label htmlFor="email" className="block font-bold text-xs mb-0.5">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="email"
                name="father_name"
                maxLength={100}
                value={formData.father_name}
                onChange={handleChange}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
              />
              {errors.father_name && (
                <span className="text-red-500 text-xs">
                  {errors.father_name}
                </span>
              )}
            </div>
            <div className="mt-2">
              <label htmlFor="email" className="block font-bold text-xs mb-0.5">
                Occupation
              </label>
              <input
                type="text"
                id="email"
                maxLength={100}
                name="father_occupation"
                value={formData.father_occupation}
                onChange={handleChange}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
              />
            </div>
            <div className="mt-2">
              <label
                htmlFor="bloodGroup"
                className="block font-bold text-xs mb-0.5"
              >
                Blood group
              </label>
              <select
                id="bloodGroup"
                name="blood_group"
                value={formData.blood_group}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
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
            <div className="mt-2">
              <label htmlFor="email" className="block font-bold text-xs mb-0.5">
                Father Aadhaar Card No. <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="email"
                name="father_adhar_card"
                maxLength={12}
                value={formData.father_adhar_card}
                onChange={handleChange}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
              />
              {errors.father_adhar_card && (
                <span className="text-red-500 text-xs">
                  {errors.father_adhar_card}
                </span>
              )}
            </div>
            <div className="mt-2">
              <label htmlFor="email" className="block font-bold text-xs mb-0.5">
                Office Address
              </label>
              <textarea
                id="email"
                rows={2}
                maxLength={200}
                name="f_office_add"
                value={formData.f_office_add}
                onChange={handleChange}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
              />
            </div>
            <div className="mt-2">
              <label htmlFor="email" className="block font-bold text-xs mb-0.5">
                Telephone
              </label>
              <input
                type="text"
                maxLength={11}
                id="email"
                name="f_office_tel"
                value={formData.f_office_tel}
                onChange={handleChange}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
              />
            </div>
            <div>
              <label
                htmlFor="phone"
                className="block font-bold  text-xs mb-0.5"
              >
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="flex ">
                <span className="w-[15%] h-[34px] text-[14px] text-[#555] text-center border border-[#ccc] border-r-0 flex items-center justify-center p-1">
                  +91
                </span>
                <input
                  type="tel"
                  id="phone"
                  name="f_mobile"
                  pattern="\d{10}"
                  maxLength="10"
                  title="Please enter only 10 digit number "
                  value={formData.f_mobile}
                  onChange={handleChange}
                  className="input-field block w-full border-1 border-gray-400 outline-none  rounded-r-md py-1 px-3 bg-white shadow-inner "
                  required
                />
              </div>
              {backendErrors.phone && (
                <span className="error">{backendErrors.phone[0]}</span>
              )}
              {errors.phone && (
                <span className="text-red-500 text-xs">{errors.phone}</span>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="setusernameFatherMob"
                  name="setUsernameFatherMob"
                  onChange={handleFatherMobileSelection} // Call the function on selection
                  checked={fatherMobileSelected.setUsername}
                />
                <label htmlFor="setusernameFatherMob">
                  Set this as username
                </label>
                {usernameError &&
                  formData.SetEmailIDAsUsername === "FatherMob" && (
                    <span className="error">{usernameError}</span>
                  )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="receiveSms"
                  value="FatherMob"
                  id="receiveSmsmob"
                  checked={formData.SetToReceiveSMS === "FatherMob"}
                  onChange={() => handleReceiveSmsSelection("FatherMob")}
                />
                <label htmlFor="receiveSmsmob">
                  {" "}
                  Set to receive sms at this no.
                </label>
              </div>
              {/* <div className="flex items-center">
                <input
                  type="radio"
                  id="yes"
                  name="hasRecievedSms"
                  checked={formData.hasRecievedSms === "Yes"}
                  value="Yes"
                  onChange={handleChange}
                  // onBlur={handleBlur}
                />
                <label htmlFor="yes" className="ml-1 text-xs">
                  Set to receive sms at this no.
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="yes"
                  name="hasUserName"
                  checked={formData.hasUserName === "Yes"}
                  value="Yes"
                  onChange={handleChange}
                  // onBlur={handleBlur}
                />
                <label htmlFor="yes" className="ml-1 text-xs">
                  Set this as username.
                </label>
              </div> */}
            </div>
            <div className="mt-2">
              <label htmlFor="email" className="block font-bold text-xs mb-0.5">
                Email Id <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="f_email"
                maxLength={50}
                value={formData.f_email}
                onChange={handleChange}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
              />
              {errors.email && (
                <span className="text-red-500 text-xs">{errors.email}</span>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="setUserNameFather"
                  name="setUsernameFatherEmail"
                  onChange={handleFatherEmailSelection}
                  checked={formData.SetEmailIDAsUsername === "Father"}
                />
                <label htmlFor="setUserNameFather">Set this as username</label>
                {usernameError &&
                  formData.SetEmailIDAsUsername === "Father" && (
                    <span className="error">{usernameError}</span>
                  )}
              </div>
            </div>
            <div className="mt-2">
              <label
                htmlFor="dataOfAdmission"
                className="block font-bold text-xs mb-0.5"
              >
                Father Date Of Birth
              </label>
              <input
                type="date"
                id="dataOfAdmission"
                name="f_dob"
                value={formData.f_dob}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
            </div>
            {/* Mother information */}
            <h5 className="col-span-4 text-blue-400 mt-2 relative top-4">
              {" "}
              Mother Details
            </h5>
            <div className="mt-2">
              <label htmlFor="email" className="block font-bold text-xs mb-0.5">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="email"
                maxLength={100}
                name="mother_name"
                value={formData.mother_name}
                onChange={handleChange}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
              />
              {errors.mother_name && (
                <span className="text-red-500 text-xs">
                  {errors.mother_name}
                </span>
              )}
            </div>
            <div className="mt-2">
              <label htmlFor="email" className="block font-bold text-xs mb-0.5">
                Occupation
              </label>
              <input
                type="text"
                id="email"
                maxLength={100}
                name="mother_occupation"
                value={formData.mother_occupation}
                onChange={handleChange}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
              />
            </div>
            <div className="mt-2">
              <label
                htmlFor="bloodGroup"
                className="block font-bold text-xs mb-0.5"
              >
                Blood group
              </label>
              <select
                id="bloodGroup"
                name="m_blood"
                value={formData.m_blood}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
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
            <div className="mt-2">
              <label htmlFor="email" className="block font-bold text-xs mb-0.5">
                Mother Aadhaar Card No. <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="email"
                name="mother_adhar_card"
                maxLength={12}
                value={formData.mother_adhar_card}
                onChange={handleChange}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
              />
              {errors.mother_adhar_card && (
                <span className="text-red-500 text-xs">
                  {errors.mother_adhar_card}
                </span>
              )}
            </div>
            <div className="mt-2">
              <label htmlFor="email" className="block font-bold text-xs mb-0.5">
                Office Address
              </label>
              <textarea
                id="email"
                rows={2}
                maxLength={200}
                name="m_office_add"
                value={formData.m_office_add}
                onChange={handleChange}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
              />
            </div>
            <div className="mt-2">
              <label htmlFor="email" className="block font-bold text-xs mb-0.5">
                Telephone
              </label>
              <input
                type="text"
                maxLength={11}
                id="email"
                name="m_office_tel"
                value={formData.m_office_tel}
                onChange={handleChange}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
              />
            </div>
            <div>
              <label
                htmlFor="phone"
                className="block font-bold  text-xs mb-0.5"
              >
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="flex ">
                <span className="w-[15%] h-[34px] text-[14px] text-[#555] text-center border border-[#ccc] border-r-0 flex items-center justify-center p-1">
                  +91
                </span>
                <input
                  type="tel"
                  id="phone"
                  name="m_mobile"
                  pattern="\d{10}"
                  maxLength="10"
                  title="Please enter only 10 digit number "
                  value={formData.m_mobile}
                  onChange={handleChange}
                  className="input-field block w-full border-1 border-gray-400 outline-none  rounded-r-md py-1 px-3 bg-white shadow-inner "
                  required
                />
              </div>
              {backendErrors.phone && (
                <span className="error">{backendErrors.phone[0]}</span>
              )}
              {errors.phone && (
                <span className="text-red-500 text-xs">{errors.phone}</span>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="setUsernameMotherMob"
                  name="setUsernameMotherMob"
                  onChange={handleMotherMobileSelection}
                  checked={motherMobileSelected.setUsername}
                />
                <label htmlFor="setUsernameMotherMob">
                  {" "}
                  Set this as username
                </label>
                {usernameError &&
                  formData.SetEmailIDAsUsername === "MotherMob" && (
                    <span className="error">{usernameError}</span>
                  )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="receiveSms"
                  id="receiveSms"
                  value="MotherMob"
                  checked={formData.SetToReceiveSMS === "MotherMob"}
                  onChange={() => handleReceiveSmsSelection("MotherMob")}
                />{" "}
                <label htmlFor="receiveSms">
                  Set to receive sms at this no.
                </label>
              </div>
              {/* <div className="flex items-center">
                <input
                  type="radio"
                  id="yes"
                  name="hasRecievedSmsForMother"
                  checked={formData.hasRecievedSmsForMother === "Yes"}
                  value="Yes"
                  onChange={handleChange}
                  // onBlur={handleBlur}
                />
                <label htmlFor="yes" className="ml-1 text-xs">
                  Set to receive sms at this no.
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="yes"
                  name="hasUserNameForMother"
                  checked={formData.hasUserNameForMother === "Yes"}
                  value="Yes"
                  onChange={handleChange}
                  // onBlur={handleBlur}
                />
                <label htmlFor="yes" className="ml-1 text-xs">
                  Set this as username.
                </label>
              </div> */}
            </div>
            <div className="mt-2">
              <label htmlFor="email" className="block font-bold text-xs mb-0.5">
                Email Id <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="m_emailid"
                maxLength={50}
                value={formData.m_emailid}
                onChange={handleChange}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
              />
              {errors.email && (
                <span className="text-red-500 text-xs">{errors.email}</span>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="emailuser"
                  name="setUsernameMotherEmail"
                  onChange={handleMotherEmailSelection}
                  checked={formData.SetEmailIDAsUsername === "Mother"}
                />
                <label htmlFor="emailuser">Set this as username</label>
                {usernameError &&
                  formData.SetEmailIDAsUsername === "Mother" && (
                    <span className="error">{usernameError}</span>
                  )}
              </div>
              {/* <div className="flex items-center">
                <input
                  type="radio"
                  id="yes"
                  name="SetEmailIDAsUsername"
                  checked={formData.SetEmailIDAsUsername === "Yes"}
                  value="Yes"
                  onChange={handleChange}
                  // onBlur={handleBlur}
                />
                <label htmlFor="yes" className="ml-1 text-xs">
                  Set this as username.
                </label>
              </div> */}
            </div>
            <div className="mt-2">
              <label
                htmlFor="dataOfAdmission"
                className="block font-bold text-xs mb-0.5"
              >
                Mother Date Of Birth
              </label>
              <input
                type="date"
                id="dataOfAdmission"
                name="m_dob"
                value={formData.f_dob}
                className="input-field block w-full border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
                onChange={handleChange}
                // onBlur={handleBlur}
              />
            </div>
            {/*  */}
            {/* added father feilds here */}
            <div className="col-span-3 md:mr-9 my-2 text-right">
              <button
                type="submit"
                style={{ backgroundColor: "#2196F3" }}
                className=" text-white font-bold py-1 border-1 border-blue-500 px-4 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ViewStudent;
