import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";

const CreeateCastCertificate = () => {
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

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    sr_no: "",
    generalRegisterNo: "",
    date: "",
    stud_name: "",
    student_id: "",
    student_UID: "",
    father_name: "",
    mother_name: "",
    class_division: "",
    religion: "",
    caste: "",
    subCaste: "",
    birthPlace: "",
    state: "",
    motherTongue: "",
    dob: "",
    dob_words: "",
    nationality: "",
    previousSchoolAndClass: "",
    dateOfAdmission: "",
    learningHistory: "",
    progressReport: "",
    behavior: "",
    reasonForLeaving: "",
    dateOfLeavingCertificate: "",
    phone: "",
    email: "",
    aadhar_card_no: "",
    teacher_image_name: null,
    purpose: " ",
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
  useEffect(() => {
    fetchInitialData(); // Fetch classes on component mount
    fetchStudentNameWithClassId();
  }, []);

  const fetchInitialData = async () => {
    // setLoading(true);
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
    }
    // finally {
    //   setLoading(false);
    // }
  };

  const fetchStudentNameWithClassId = async (section_id = null) => {
    // setLoading(true);
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
    }
    // finally {
    //   setLoading(false);
    // }
  };

  const classOptions = useMemo(
    () =>
      classesforForm.map((cls) => ({
        value: cls.section_id,
        label: `${cls?.get_class?.name} ${cls.name} (${cls.students_count})`,
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
      setLoadingForSearch(true); // Start loading
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/api/get_srnocastebonafide/${selectedStudentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Check if data was received and update the form state
      if (response?.data?.data) {
        const fetchedData = response.data.data; // Extract the data

        setParentInformation(fetchedData); // Assuming response data contains parent information

        // Populate formData with the fetched data
        setFormData({
          sr_no: fetchedData.sr_no || "",
          date: fetchedData.date || "", // Directly from the fetched data
          stud_name: `${fetchedData.studentinformation?.first_name || ""} ${
            fetchedData.studentinformation?.mid_name || ""
          } ${fetchedData.studentinformation?.last_name || ""}`,
          student_id: fetchedData.studentinformation.student_id || "",
          father_name: fetchedData.studentinformation.father_name || "",
          mother_name: fetchedData.studentinformation.mother_name || "",
          class_division:
            `${fetchedData.studentinformation.classname}-${fetchedData.studentinformation.sectionname}` ||
            "",
          religion: fetchedData.studentinformation.religion || "",
          caste: fetchedData.studentinformation.caste || "",
          subCaste: fetchedData.studentinformation.subcaste || "",
          birthPlace: fetchedData.studentinformation.birth_place || "", // Adjusted according to the fetched data
          state: fetchedData.studentinformation.state || "",
          motherTongue: fetchedData.studentinformation.mother_tongue || "",
          dob: fetchedData.studentinformation.dob || "",
          dob_words: fetchedData.dobinwords || "", // Directly from fetched data
          nationality: fetchedData.studentinformation.nationality || "",
          phone: fetchedData.studentinformation.f_mobile || "", // Adjusted according to the fetched data
          email: fetchedData.studentinformation.f_email || "",
          aadhar_card_no: fetchedData.studentinformation.stu_aadhaar_no || "",
          teacher_image_name:
            fetchedData.studentinformation.father_image_name || null, // Assuming this is for a teacher image
          purpose: fetchedData.purpose || " ",
        });
      } else {
        toast.error("No data found for the selected student.");
      }
    } catch (error) {
      console.log("error is", error);
      toast.error("Error fetching data for the selected student.");
    } finally {
      setLoadingForSearch(false);
    }
  };
  // For FOrm
  const validate = () => {
    const newErrors = {};

    // Validate Serial Number
    if (!formData.sr_no) newErrors.sr_no = "Serial number is required";

    // Validate General Register No
    if (!formData.generalRegisterNo)
      newErrors.generalRegisterNo = "General Register No is required";

    // Validate Date
    if (!formData.date) newErrors.date = "Date is required";

    // Validate Student Name
    if (!formData.studentName)
      newErrors.studentName = "Student Name is required";
    else if (!/^[^\d].*/.test(formData.studentName))
      newErrors.studentName = "Student Name should not start with a number";

    // Validate Student ID
    if (!formData.studentID) newErrors.studentID = "Student ID is required";

    // Validate Student UID
    if (!formData.studentUID) newErrors.studentUID = "Student UID is required";

    // Validate Father's Name
    if (!formData.fathersName)
      newErrors.fathersName = "Father's Name is required";
    else if (!/^[^\d].*/.test(formData.fathersName))
      newErrors.fathersName = "Father's Name should not start with a number";

    // Validate Mother's Name
    if (!formData.mothersName)
      newErrors.mothersName = "Mother's Name is required";

    // Validate Class and Division
    if (!formData.classDivision)
      newErrors.classDivision = "Class and Division is required";

    // Validate Birth Place
    if (!formData.birthPlace) newErrors.birthPlace = "Birth Place is required";

    // Validate State
    if (!formData.state) newErrors.state = "State is required";

    // Validate Mother Tongue
    if (!formData.motherTongue)
      newErrors.motherTongue = "Mother Tongue is required";

    // Validate Date of Birth
    if (!formData.birthDate) newErrors.birthDate = "Date of Birth is required";

    // Validate Birth Date in Words
    if (!formData.birthDateInWords)
      newErrors.birthDateInWords = "Birth date in words is required";

    // Validate Nationality
    if (!formData.nationality)
      newErrors.nationality = "Nationality is required";

    // Validate Previous School and Class
    if (!formData.previousSchoolAndClass)
      newErrors.previousSchoolAndClass =
        "Previous School and Class is required";

    // Validate Date of Admission
    if (!formData.dateOfAdmission)
      newErrors.dateOfAdmission = "Date of Admission is required";

    // Validate Learning History
    if (!formData.learningHistory)
      newErrors.learningHistory = "Learning History is required";

    // Validate Progress Report
    if (!formData.progressReport)
      newErrors.progressReport = "Progress Report is required";

    // Validate Behavior
    if (!formData.behavior) newErrors.behavior = "Behavior is required";

    // Validate Reason for Leaving
    if (!formData.reasonForLeaving)
      newErrors.reasonForLeaving = "Reason for Leaving is required";

    // Validate Date of Leaving Certificate
    if (!formData.dateOfLeavingCertificate)
      newErrors.dateOfLeavingCertificate =
        "Date of Leaving Certificate is required";

    // Validate Phone
    if (!formData.phone) newErrors.phone = "Phone number is required";

    // Validate Email
    if (!formData.email) newErrors.email = "Email is required";

    // Validate Aadhar Card Number
    if (!formData.aadhar_card_no)
      newErrors.aadhar_card_no = "Aadhar Card No is required";

    // Validate Teacher Image Name (if necessary)
    // if (!formData.teacher_image_name)
    //     newErrors.teacher_image_name = "Teacher Image is required";

    // Validate Purpose
    if (!formData.purpose || formData.purpose.trim() === "")
      newErrors.purpose = "Purpose is required";

    setErrors(newErrors);
    return newErrors;
  };

  // Handle change for form fields
  const handleChange = (event) => {
    const { name, value } = event.target;
    let newValue = value;

    if (name === "dob") {
      setFormData((prev) => ({
        ...prev,
        dob: value,
        dob_words: convertDateToWords(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    // Update formData for the field
    setFormData((prevData) => ({
      ...prevData,
      [name]: newValue,
    }));

    // Individual field validation
    let fieldErrors = {};

    // Perform individual field validations similar to the main validate function
    if (name === "generalRegisterNo" && !value) {
      fieldErrors.generalRegisterNo = "General Register No. is required";
    }

    if (name === "date" && !value) {
      fieldErrors.date = "Date is required";
    }

    if (name === "studentName" && !value) {
      fieldErrors.studentName = "Student Name is required";
    }

    if (name === "studentID" && !value) {
      fieldErrors.studentID = "Student ID is required";
    }

    if (name === "studentUID" && !value) {
      fieldErrors.studentUID = "Student UID is required";
    }

    if (name === "fathersName") {
      if (!value) {
        fieldErrors.fathersName = "Father's Name is required";
      } else if (/^\d/.test(value)) {
        fieldErrors.fathersName =
          "Father's Name should not start with a number";
      }
    }

    if (name === "mothersName") {
      if (!value) {
        fieldErrors.mothersName = "Mother's Name is required";
      } else if (/^\d/.test(value)) {
        fieldErrors.mothersName =
          "Mother's Name should not start with a number";
      }
    }

    if (name === "classDivision" && !value) {
      fieldErrors.classDivision = "Class and Division is required";
    }

    if (name === "birthPlace" && !value) {
      fieldErrors.birthPlace = "Birth Place is required";
    }

    if (name === "state" && !value) {
      fieldErrors.state = "State is required";
    }

    if (name === "motherTongue" && !value) {
      fieldErrors.motherTongue = "Mother Tongue is required";
    }

    if (name === "birthDate" && !value) {
      fieldErrors.birthDate = "Date of Birth is required";
    }

    if (name === "birthDateInWords" && !value) {
      fieldErrors.birthDateInWords = "Birth date in words is required";
    }

    if (name === "nationality" && !value) {
      fieldErrors.nationality = "Nationality is required";
    }

    if (name === "previousSchoolAndClass" && !value) {
      fieldErrors.previousSchoolAndClass =
        "Previous School and Class is required";
    }

    if (name === "dateOfAdmission" && !value) {
      fieldErrors.dateOfAdmission = "Date of Admission is required";
    }

    if (name === "learningHistory" && !value) {
      fieldErrors.learningHistory = "Learning History is required";
    }

    if (name === "progressReport" && !value) {
      fieldErrors.progressReport = "Progress Report is required";
    }

    if (name === "behavior" && !value) {
      fieldErrors.behavior = "Behavior is required";
    }

    if (name === "reasonForLeaving" && !value) {
      fieldErrors.reasonForLeaving = "Reason for Leaving is required";
    }

    if (name === "dateOfLeavingCertificate" && !value) {
      fieldErrors.dateOfLeavingCertificate =
        "Date of Leaving Certificate is required";
    }

    if (name === "phone" && !value) {
      fieldErrors.phone = "Phone number is required";
    }

    if (name === "email" && !value) {
      fieldErrors.email = "Email is required";
    }

    if (name === "aadhar_card_no" && !value) {
      fieldErrors.aadhar_card_no = "Aadhar Card No. is required";
    }

    if (name === "purpose" && !value) {
      fieldErrors.purpose = "Purpose is required";
    }

    // Update the errors state with the new field errors
    setErrors((prevErrors) => ({
      ...prevErrors,
      ...fieldErrors,
    }));
  };
  // const handleChange = (event) => {
  //   const { name, value } = event.target;
  // let newValue = value;

  // if (name === "dob") {
  //   setFormData((prev) => ({
  //     ...prev,
  //     dob: value,
  //     dob_words: convertDateToWords(value),
  //   }));
  // } else {
  //   setFormData((prev) => ({
  //     ...prev,
  //     [name]: value,
  //   }));
  // }
  // // Update formData for the field
  // setFormData((prevData) => ({
  //   ...prevData,
  //   [name]: newValue,
  // }));

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
        `${API_URL}/api/save_pdfcastebonafide`,
        formattedFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob", // Set response type to blob to handle PDF data
        }
      );

      if (response.status === 200) {
        toast.success("Cast Certificate updated successfully!");

        // Create a URL for the PDF blob and initiate download
        const pdfBlob = new Blob([response.data], { type: "application/pdf" });
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = pdfUrl;
        link.download = "BonafideCertificate.pdf"; // PDF file name
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Reset form data and selected values after successful submission
        // Reset form data and selected values after successful submission
        setFormData({
          sr_no: "",
          generalRegisterNo: "",
          date: "",
          stud_name: "",
          student_id: "",
          student_UID: "",
          father_name: "",
          mother_name: "",
          class_division: "",
          religion: "",
          caste: "",
          subCaste: "",
          birthPlace: "",
          state: "",
          motherTongue: "",
          dob: "",
          dob_words: "",
          nationality: "",
          previousSchoolAndClass: "",
          dateOfAdmission: "",
          learningHistory: "",
          progressReport: "",
          behavior: "",
          reasonForLeaving: "",
          dateOfLeavingCertificate: "",
          phone: "",
          email: "",
          aadhar_card_no: "",
          teacher_image_name: null,
          purpose: " ",
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
      toast.error("An error occurred while updating the Cast Certificate.");

      if (error.response && error.response) {
        setBackendErrors(error.response || {});
      } else {
        toast.error(error.response.sr_no);
      }
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // const handleSubmit = async (event) => {
  //   event.preventDefault();
  //   const validationErrors = validate();
  //   const errorsToCheck = validationErrors || {};

  //   if (Object.keys(errorsToCheck).length > 0) {
  //     setErrors(errorsToCheck);
  //     return;
  //   }

  //   const formattedFormData = {
  //     ...formData,
  //     dob: formatDateString(formData.dob),
  //     admission_date: formatDateString(formData.admission_date),
  //   };

  //   try {
  //     const token = localStorage.getItem("authToken");
  //     if (!token) {
  //       throw new Error("No authentication token is found");
  //     }

  //     // Make an API call with the "blob" response type to download the PDF
  //     const response = await axios.post(
  //       `${API_URL}/api/save_pdfbonafide`,
  //       formattedFormData,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //         responseType: "blob", // Set response type to blob to handle PDF data
  //       }
  //     );

  //     if (response.status === 200) {
  //       toast.success("Student information updated successfully!");

  //       // Create a URL for the PDF blob and initiate download
  //       const pdfBlob = new Blob([response.data], { type: "application/pdf" });
  //       const pdfUrl = URL.createObjectURL(pdfBlob);
  //       const link = document.createElement("a");
  //       link.href = pdfUrl;
  //       link.download = "BonafideCertificate.pdf"; // PDF file name
  //       document.body.appendChild(link);
  //       link.click();
  //       document.body.removeChild(link);

  //       // setTimeout(() => {
  //       //   navigate("/careTacker");
  //       // }, 3000);
  //     }
  //   } catch (error) {
  //     console.error("Error:", error.response.data, error.response.sr_no);
  //     toast.error("An error occurred while updating the Student information.");

  //     if (error.response && error.response) {
  //       setBackendErrors(error.response || {});
  //     } else {
  //       toast.error(error.response.sr_no);
  //     }
  //   }
  // };

  return (
    <div>
      <ToastContainer />
      <div className="container mt-4">
        {/* Search Section */}
        <div className="w-[95%] flex justify-center flex-col md:flex-row gap-x-1  bg-white rounded-lg border border-gray-400 shadow-md mx-auto mt-10 p-6">
          <div className="w-full md:w-[99%] flex md:flex-row justify-between items-center">
            <div className="w-full  flex flex-col gap-y-2 md:gap-y-0 md:flex-row ">
              <div className="w-full  gap-x-14 md:gap-x-6 md:justify-start  my-1 md:my-4 flex md:flex-row">
                <label
                  className="text-md mt-1.5 mr-1 md:mr-0 "
                  htmlFor="classSelect"
                >
                  Class <span className="text-red-500 ">*</span>
                </label>{" "}
                <div className="w-full md:w-[50%] ">
                  <Select
                    id="classSelect"
                    value={selectedClass}
                    onChange={handleClassSelect}
                    options={classOptions}
                    placeholder="Select"
                    isSearchable
                    isClearable
                    className="text-sm"
                  />
                  {nameErrorForClass && (
                    <span className="h-8  relative  ml-1 text-danger text-xs">
                      {nameErrorForClass}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full gap-x-6 relative left-0 md:-left-[5%] justify-between md:w-[98%] my-1 md:my-4 flex md:flex-row">
                <label
                  className=" md:w-[50%] text-md mt-1.5 "
                  htmlFor="studentSelect"
                >
                  Student Name <span className="text-red-500 ">*</span>
                </label>{" "}
                <div className="w-full md:w-[80%]">
                  <Select
                    id="studentSelect"
                    value={selectedStudent}
                    onChange={handleStudentSelect}
                    options={studentOptions}
                    placeholder="Select"
                    isSearchable
                    isClearable
                    className="text-sm"
                  />
                  {nameError && (
                    <span className="h-8  relative  ml-1 text-danger text-xs">
                      {nameError}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="search"
                onClick={handleSearch}
                style={{ backgroundColor: "#2196F3" }}
                className={` my-1 md:my-4 btn h-10 w-18 md:w-auto btn-primary   text-white font-bold py-1 border-1 border-blue-500 px-4 rounded ${
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

              {/* <button
                onClick={handleSearch}
                type="button"
                className="my-1 md:my-4 btn h-10 w-18 md:w-auto btn-primary"
              >
                Search
              </button> */}
            </div>
          </div>
        </div>

        {/* Form Section - Displayed when parentInformation is fetched */}
        {parentInformation && (
          <div className="container mx-auto p-4 ">
            <div className="card  px-3 rounded-md ">
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
              <p className=" text-[.9em] md:absolute md:right-6  md:top-[15%]   text-gray-500 ">
                <span className="text-red-500 ">*</span>indicates mandatory
                information
              </p>
              <form
                onSubmit={handleSubmit}
                className="  md:mx-5 overflow-x-hidden shadow-md p-2 bg-gray-50 mb-4"
              >
                Document Information
                <fieldset className="mb-4">
                  <legend className="font-bold">Document Information</legend>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label
                        htmlFor="sr_no"
                        className="block font-bold text-xs mb-2"
                      >
                        Sr No. <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="sr_no"
                        name="sr_no"
                        value={formData.sr_no}
                        readOnly
                        className="input-field block border w-full border-gray-300 rounded-md py-1 px-3 bg-gray-200 shadow-inner"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="generalRegisterNo"
                        className="block font-bold text-xs mb-2"
                      >
                        General Register No.{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="generalRegisterNo"
                        name="generalRegisterNo"
                        value={formData.generalRegisterNo}
                        onChange={handleChange}
                        className="input-field block border w-full border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="date"
                        className="block font-bold text-xs mb-2"
                      >
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="input-field block border w-full border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                      />
                    </div>
                  </div>
                </fieldset>
                {/* Student Identity */}
                <fieldset className="mb-4">
                  <legend className="font-bold">Student Identity</legend>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label
                        htmlFor="studentName"
                        className="block font-bold text-xs mb-2"
                      >
                        Student Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="studentName"
                        name="studentName"
                        value={formData.studentName}
                        onChange={handleChange}
                        className="input-field block border w-full border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="studentID"
                        className="block font-bold text-xs mb-2"
                      >
                        Student ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="studentID"
                        name="studentID"
                        value={formData.studentID}
                        onChange={handleChange}
                        className="input-field block border w-full border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="studentUID"
                        className="block font-bold text-xs mb-2"
                      >
                        Student UID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="studentUID"
                        name="studentUID"
                        value={formData.studentUID}
                        onChange={handleChange}
                        className="input-field block border w-full border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                      />
                    </div>
                  </div>
                </fieldset>
                {/* Parent Details */}
                <fieldset className="mb-4">
                  <legend className="font-bold">Parent Details</legend>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="fathersName"
                        className="block font-bold text-xs mb-2"
                      >
                        Father's Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="fathersName"
                        name="fathersName"
                        value={formData.fathersName}
                        onChange={handleChange}
                        className="input-field block border w-full border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="mothersName"
                        className="block font-bold text-xs mb-2"
                      >
                        Mother's Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="mothersName"
                        name="mothersName"
                        value={formData.mothersName}
                        onChange={handleChange}
                        className="input-field block border w-full border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                      />
                    </div>
                  </div>
                </fieldset>
                {/* Academic Details */}
                <fieldset className="mb-4">
                  <legend className="font-bold">Academic Details</legend>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label
                        htmlFor="classDivision"
                        className="block font-bold text-xs mb-2"
                      >
                        Class/Division <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="classDivision"
                        name="classDivision"
                        value={formData.classDivision}
                        onChange={handleChange}
                        className="input-field block border w-full border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="religion"
                        className="block font-bold text-xs mb-2"
                      >
                        Religion <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="religion"
                        name="religion"
                        value={formData.religion}
                        onChange={handleChange}
                        className="input-field block border w-full border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="caste"
                        className="block font-bold text-xs mb-2"
                      >
                        Caste <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="caste"
                        name="caste"
                        value={formData.caste}
                        onChange={handleChange}
                        className="input-field block border w-full border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="subCaste"
                        className="block font-bold text-xs mb-2"
                      >
                        Sub-Caste <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="subCaste"
                        name="subCaste"
                        value={formData.subCaste}
                        onChange={handleChange}
                        className="input-field block border w-full border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                      />
                    </div>
                  </div>
                </fieldset>
                {/* Personal Information */}
                <fieldset className="mb-4">
                  <legend className="font-bold">Personal Information</legend>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label
                        htmlFor="birthPlace"
                        className="block font-bold text-xs mb-2"
                      >
                        Birth Place <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="birthPlace"
                        name="birthPlace"
                        value={formData.birthPlace}
                        onChange={handleChange}
                        className="input-field block border w-full border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                      />
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
                        value={formData.state}
                        onChange={handleChange}
                        className="input-field block border w-full border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="motherTongue"
                        className="block font-bold text-xs mb-2"
                      >
                        Mother Tongue <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="motherTongue"
                        name="motherTongue"
                        value={formData.motherTongue}
                        onChange={handleChange}
                        className="input-field block border w-full border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="birthDate"
                        className="block font-bold text-xs mb-2"
                      >
                        Birth Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        id="birthDate"
                        name="birthDate"
                        value={formData.birthDate}
                        onChange={handleChange}
                        className="input-field block border w-full border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="birthDateInWords"
                        className="block font-bold text-xs mb-2"
                      >
                        Birth Date in Words{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="birthDateInWords"
                        name="birthDateInWords"
                        value={formData.birthDateInWords}
                        onChange={handleChange}
                        className="input-field block border w-full border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="nationality"
                        className="block font-bold text-xs mb-2"
                      >
                        Nationality <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="nationality"
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleChange}
                        className="input-field block border w-full border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                      />
                    </div>
                  </div>
                </fieldset>
                {/* Admission Details */}
                <fieldset className="mb-4">
                  <legend className="font-bold">Admission Details</legend>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label
                        htmlFor="previousSchoolAndClass"
                        className="block font-bold text-xs mb-2"
                      >
                        Previous School and Class{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="previousSchoolAndClass"
                        name="previousSchoolAndClass"
                        value={formData.previousSchoolAndClass}
                        onChange={handleChange}
                        className="input-field block border w-full border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="dateOfAdmission"
                        className="block font-bold text-xs mb-2"
                      >
                        Date of Admission{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        id="dateOfAdmission"
                        name="dateOfAdmission"
                        value={formData.dateOfAdmission}
                        onChange={handleChange}
                        className="input-field block border w-full border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="learningHistory"
                        className="block font-bold text-xs mb-2"
                      >
                        Learning History <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="learningHistory"
                        name="learningHistory"
                        value={formData.learningHistory}
                        onChange={handleChange}
                        className="input-field block border w-full border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="progressReport"
                        className="block font-bold text-xs mb-2"
                      >
                        Progress Report <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="progressReport"
                        name="progressReport"
                        value={formData.progressReport}
                        onChange={handleChange}
                        className="input-field block border w-full border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="behavior"
                        className="block font-bold text-xs mb-2"
                      >
                        Behavior <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="behavior"
                        name="behavior"
                        value={formData.behavior}
                        onChange={handleChange}
                        className="input-field block border w-full border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="reasonForLeaving"
                        className="block font-bold text-xs mb-2"
                      >
                        Reason for Leaving{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="reasonForLeaving"
                        name="reasonForLeaving"
                        value={formData.reasonForLeaving}
                        onChange={handleChange}
                        className="input-field block border w-full border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="dateOfLeavingCertificate"
                        className="block font-bold text-xs mb-2"
                      >
                        Date of Leaving Certificate{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        id="dateOfLeavingCertificate"
                        name="dateOfLeavingCertificate"
                        value={formData.dateOfLeavingCertificate}
                        onChange={handleChange}
                        className="input-field block border w-full border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                      />
                    </div>
                  </div>
                </fieldset>
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
                      name="sr_no"
                      readOnly
                      value={formData.sr_no}
                      onChange={handleChange}
                      className="block  border w-full border-gray-300 rounded-md py-1 px-3  bg-gray-200 outline-none shadow-inner"
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
                      value={formData.stud_name}
                      onChange={handleChange}
                      className="block  border w-full border-gray-300 rounded-md py-1 px-3  bg-white shadow-inner"
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
                      value={formData.father_name}
                      onChange={handleChange}
                      className="input-field bg-white block w-full border border-gray-300 rounded-md py-1 px-3  outline-none shadow-inner"
                    />
                    {errors.father_name && (
                      <div className="text-red-500 text-xs ml-2">
                        {errors.father_name}
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
                      min={MIN_DATE} // Set minimum date
                      max={MAX_DATE} // Set maximum date to today
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
                      value={formData.dob_words}
                      onChange={handleChange}
                      className="input-field resize block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                    />
                    {errors.dob_words && (
                      <div className="text-red-500 text-xs ml-2">
                        {errors.dob_words}
                      </div>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="date_of_joining"
                      className="block font-bold  text-xs mb-2"
                    >
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="date_of_joining"
                      // max={today}
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                    />
                    {errors.date && (
                      <span className="text-red-500 text-xs ml-2">
                        {errors.date}
                      </span>
                    )}
                  </div>
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
                      readOnly
                      name="class_division"
                      value={formData.class_division}
                      onChange={handleChange} // Using the handleChange function to update formData and validate
                      className="input-field block w-full outline-none border border-gray-300 rounded-md py-1 px-3 bg-gray-200 shadow-inner"
                    />
                    {errors.class_division && (
                      <span className="text-red-500 text-xs ml-2">
                        {errors.class_division}
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
                      maxLength={50}
                      id="employeeId"
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleChange}
                      className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                    />
                    {errors.purpose && (
                      <span className="text-red-500 text-xs ml-2">
                        {errors.purpose}
                      </span>
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
                      value={formData.nationality}
                      onChange={handleChange}
                      className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                    />
                    {errors.nationality && (
                      <span className="text-red-500 text-xs ml-2">
                        {errors.nationality}
                      </span>
                    )}
                  </div>

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

export default CreeateCastCertificate;
