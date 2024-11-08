// Try UP
import { useState, useEffect, useMemo } from "react";
// import debounce from "lodash/debounce";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
// import { RxCross1 } from "react-icons/rx";

const LeavingCertificate = () => {
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
  const [selectedActivities, setSelectedActivities] = useState([]);

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    sr_no: "",
    reg_no: "",
    date: "",
    first_name: "",
    mid_name: "",
    last_name: "",
    udise_pen_no: "",
    stud_id_no: "",
    promoted_to: " ",
    School_Board: "",
    stud_id: "",
    // student_UID: "",
    father_name: "",
    mother_name: "",
    religion: "",
    caste: "",
    subcaste: "",
    birth_place: "",
    state: "",
    mother_tongue: "",
    dob: "",
    dob_words: "",
    nationality: "",
    prev_school_class: "",
    admission_date: "",
    class_when_learning: "",

    subjects: [],
    leaving_reason: "",
    lc_date_n_no: "",
    lc_date_n_school: "",
    prev_class: "",
    dobProof: "",

    stu_aadhaar_no: "",
    teacher_image_name: null,
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

  // for student and class dropdown

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
        `${API_URL}/api/getStudentListBySectionData`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );
      setStudentNameWithClassId(response?.data?.data || []);
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
    console.log(
      "classIdForSearch",
      classIdForSearch,
      "setSelectedClass",
      selectedClass
    );
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
    setErrors({}); // Clears all field-specific errors

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
    setFormData({
      sr_no: "",
      reg_no: "",
      date: "",
      first_name: "",

      mid_name: "",
      last_name: "",
      udise_pen_no: "",
      stud_id_no: "",
      promoted_to: " ",
      School_Board: "",
      stud_id: " ",
      // student_UID: "",
      stu_aadhaar_no: "",
      father_name: "",
      mother_name: "",
      religion: "",
      caste: "",
      subcaste: "",
      birth_place: "",
      state: "",
      mother_tongue: "",
      dob: "",
      dob_words: "",
      nationality: "",
      prev_school_class: "",
      admission_date: "",
      class_when_learning: "",

      subjects: [],
      leaving_reason: "",
      lc_date_n_no: "",
      lc_date_n_school: "",
      prev_class: "",
      dobProof: "",
      // stu_aadhaar_no: "",
      teacher_image_name: null,
    });

    try {
      setLoadingForSearch(true); // Start loading
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/api/get_srnoleavingcertificatedata/${selectedStudentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Check if data was received and update the form state
      if (response?.data?.data) {
        const fetchedData = response.data.data; // Extract the data

        setParentInformation(fetchedData); // Assuming response data contains parent information
        // Extract all subject names for initial selected state
        const allSubjectNames = (fetchedData.classsubject || []).map(
          (subject) => subject.name
        );
        // Populate formData with the fetched data
        setFormData({
          sr_no: fetchedData.sr_no || "",
          reg_no: fetchedData.studentinformation.reg_no || "",
          date: today || "", // Directly from the fetched data
          subjects: fetchedData.classsubject || [],
          selectedSubjects: allSubjectNames, // Initialize with all subjects checked
          // first_name: `${fetchedData.studentinformation?.first_name || ""} ${
          //   fetchedData.studentinformation?.mid_name || ""
          // } ${fetchedData.studentinformation?.last_name || ""}`,
          stud_id_no: fetchedData.studentinformation.stud_id_no || "",
          first_name: fetchedData.studentinformation.first_name || "",
          mid_name: fetchedData.studentinformation.mid_name || "",
          last_name: fetchedData.studentinformation.last_name || "",
          udise_pen_no: fetchedData.studentinformation.udise_pen_no || "",
          promoted_to: fetchedData.studentinformation.promoted_to || "",
          School_Board: fetchedData.studentinformation.School_Board || "",

          stud_id: fetchedData.studentinformation.student_id || " ",
          father_name: fetchedData.studentinformation.father_name || "",
          mother_name: fetchedData.studentinformation.mother_name || "",

          admission_date: fetchedData.studentinformation.admission_date || "",
          religion: fetchedData.studentinformation.religion || "",
          caste: fetchedData.studentinformation.caste || "",
          subcaste: fetchedData.studentinformation.subcaste || "",
          birth_place: fetchedData.studentinformation.birth_place || "", // Adjusted according to the fetched data
          state: fetchedData.studentinformation.state || "",
          mother_tongue: fetchedData.studentinformation.mother_tongue || "",
          dob: fetchedData.studentinformation.dob || "",
          dob_words: fetchedData.dobinwords || "", // Directly from fetched data
          nationality: fetchedData.studentinformation.nationality || "",
          stu_aadhaar_no: fetchedData.studentinformation.stu_aadhaar_no || "",
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
  // const validate = () => {
  //   const newErrors = {};

  //   // Validate General Register No
  //   if (!formData.reg_no) newErrors.reg_no = "General Register No is required";

  //   // Validate Date
  //   if (!formData.date) newErrors.date = "Date is required";

  //   // Validate Student Name
  //   if (!formData.first_name) newErrors.first_name = "Student Name is required";
  //   else if (!/^[^\d].*/.test(formData.first_name))
  //     newErrors.first_name = "Student Name should not start with a number";

  //   // Validate Student ID
  //   if (!formData.stud_id_no) newErrors.stud_id_no = "Student ID is required";

  //   // Validate Father's Name
  //   if (!formData.father_name)
  //     newErrors.father_name = "Father's Name is required";
  //   else if (!/^[^\d].*/.test(formData.father_name))
  //     newErrors.father_name = "Father's Name should not start with a number";

  //   // Validate Mother's Name
  //   if (!formData.mother_name)
  //     newErrors.mother_name = "Mother's Name is required";

  //   // Validate Class and Division
  //   if (!formData.class_division)
  //     newErrors.class_division = "Class and Division is required";

  //   // Validate Birth Place
  //   if (!formData.birthPlace) newErrors.birthPlace = "Birth Place is required";

  //   // Validate State
  //   if (!formData.state) newErrors.state = "State is required";

  //   // Validate Mother Tongue
  //   if (!formData.mother_tongue)
  //     newErrors.mother_tongue = "Mother Tongue is required";

  //   // Validate Date of Birth
  //   if (!formData.dob) newErrors.dob = "Date of Birth is required";

  //   // Validate Birth Date in Words
  //   if (!formData.dob_words)
  //     newErrors.dob_words = "Birth date in words is required";

  //   // Validate Nationality
  //   if (!formData.nationality)
  //     newErrors.nationality = "Nationality is required";

  //   // Validate Previous School and Class
  //   if (!formData.prev_school_class)
  //     newErrors.prev_school_class =
  //       "Previous School and Class is required";

  //   // Validate Date of Admission
  //   if (!formData.admission_date)
  //     newErrors.admission_date = "Date of Admission is required";

  //   // Validate Learning History
  //   if (!formData.class_when_learning)
  //     newErrors.class_when_learning = "Learning History is required";

  //   // Validate Progress Report
  //   if (!formData.progress)
  //     newErrors.progress = "Progress Report is required";

  //   // Validate Behavior
  //   if (!formData.behaviour) newErrors.behaviour = "Behavior is required";

  //   // Validate Reason for Leaving
  //   if (!formData.leaving_reason)
  //     newErrors.leaving_reason = "Reason for Leaving is required";

  //   // Validate Date of Leaving Certificate
  //   if (!formData.lc_date_n_no)
  //     newErrors.lc_date_n_no =
  //       "Date of Leaving Certificate is required";

  //   // Validate Aadhar Card Number
  //   if (!formData.stu_aadhaar_no)
  //     newErrors.stu_aadhaar_no = "Aadhar Card No is required";

  //   // Validate Purpose
  //   if (!formData.purpose || formData.purpose.trim() === "")
  //     newErrors.purpose = "Purpose is required";

  //   setErrors(newErrors);

  //   // Return true if no errors, false if errors exist
  //   return Object.keys(newErrors).length === 0;
  // };
  const validate = () => {
    const newErrors = {};

    // Mandatory fields validations
    const requiredFields = [
      "reg_no",
      "date",
      "first_name",
      "udise_pen_no",
      "stud_id_no",
      "promoted_to",
      "School_Board",
      "father_name",
      "mother_name",
      "birth_place",
      "state",
      "mother_tongue",
      "dob",
      "dob_words",
      "nationality",
      "prev_school_class",
      "admission_date",
      "class_when_learning",
      "leaving_reason",
      "lc_date_n_no",
      "lc_date_n_school",
      "prev_class",
      "dobProof",
      "academicYear",
      "stu_aadhaar_no",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = `${field.replace(/_/g, " ")} is required`;
      }
    });

    // Additional validations for specific fields
    if (formData.first_name && /^\d/.test(formData.first_name)) {
      newErrors.first_name = "Student Name should not start with a number";
    }

    if (formData.father_name && /^\d/.test(formData.father_name)) {
      newErrors.father_name = "Father's Name should not start with a number";
    }

    if (formData.mother_name && /^\d/.test(formData.mother_name)) {
      newErrors.mother_name = "Mother's Name should not start with a number";
    }

    setErrors(newErrors);

    // Return true if no errors, false if errors exist
    return Object.keys(newErrors).length === 0;
  };

  // Handle change for form fields
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "dob" && { dob_words: convertDateToWords(value) }),
    }));

    let fieldErrors = {};

    // Individual field validation logic
    if (name === "first_name" && /^\d/.test(value)) {
      fieldErrors.first_name = "Student Name should not start with a number";
    }

    if (name === "father_name" && /^\d/.test(value)) {
      fieldErrors.father_name = "Father's Name should not start with a number";
    }

    if (name === "mother_name" && /^\d/.test(value)) {
      fieldErrors.mother_name = "Mother's Name should not start with a number";
    }

    // if (!value && requiredFields.includes(name)) {
    //   fieldErrors[name] = `${name.replace(/_/g, " ")} is required`;
    // }

    setErrors((prevErrors) => ({ ...prevErrors, [name]: fieldErrors[name] }));
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
  //   if (name === "first_name") {
  //     if (!newValue) fieldErrors.first_name = "Name is required";
  //     else if (/^\d/.test(newValue))
  //       fieldErrors.first_name = "Name should not start with a number";
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

  // Inside your component
  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("Submit process started");

    // Clear previous errors
    setErrors({});
    setBackendErrors({});

    // Check validation
    if (!validate()) {
      console.log("Validation failed, stopping submission");
      return;
    }

    console.log("Validation passed, proceeding with submission");

    // Format date fields and handle API submission
    const formattedFormData = {
      ...formData,
      dob: formatDateString(formData.dob),
      date: formatDateString(formData.date),
    };

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      const response = await axios.post(
        `${API_URL}/api/save_pdfcastebonafide`,
        formattedFormData,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      if (response.status === 200) {
        toast.success("Cast Certificate updated successfully!");

        // Download PDF
        const pdfBlob = new Blob([response.data], { type: "application/pdf" });
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = pdfUrl;
        link.download = "BonafideCertificate.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Reset form data
        setFormData({
          sr_no: "",
          reg_no: "",
          date: "",
          first_name: "",
          mid_name: "",
          last_name: "",
          udise_pen_no: "",
          promoted_to: "",
          School_Board: "",
          stud_id_no: "",
          stud_id: "",
          father_name: "",
          mother_name: "",
          religion: "",
          caste: "",
          subcaste: "",
          birth_place: "",
          state: "",
          mother_tongue: "",
          dob: "",
          dob_words: "",
          nationality: "",
          prev_school_class: "",
          admission_date: "",
          class_when_learning: "",
          leaving_reason: "",
          lc_date_n_no: "",
          lc_date_n_school: "",
          prev_class: "",
          stu_aadhaar_no: "",
        });
        setSelectedClass(null);
        setSelectedStudent(null);

        setTimeout(() => setParentInformation(null), 3000);
      }
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      toast.error("An error occurred while updating the Cast Certificate.");

      if (error.response && error.response.data) {
        setBackendErrors(error.response.data);
      } else {
        toast.error("Unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
    if (checked) {
      // Add the activity if checked
      setSelectedActivities((prev) => [...prev, value]);
    } else {
      // Remove the activity if unchecked
      setSelectedActivities((prev) =>
        prev.filter((activity) => activity !== value)
      );
    }
  };

  // Log or save selectedActivities when needed
  console.log(selectedActivities);
  // Handle selection of each subject
  const handleSubjectSelection = (e, subjectName) => {
    setFormData((prevData) => {
      const updatedSelectedSubjects = e.target.checked
        ? [...prevData.selectedSubjects, subjectName] // add subject if checked
        : prevData.selectedSubjects.filter((name) => name !== subjectName); // remove subject if unchecked

      return {
        ...prevData,
        selectedSubjects: updatedSelectedSubjects,
      };
    });
  };
  console.log("handleSubjectSelection", formData.selectedSubjects);

  return (
    <div className="mx-auto w-[95%] p-4 bg-white mt-4 ">
      <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
        Leaving Certificate
      </h3>
      <div
        className=" relative  mb-8   h-1  mx-auto bg-red-700"
        style={{
          backgroundColor: "#C03078",
        }}
      ></div>
      <div className="">
        <ToastContainer />
        <div className="     w-full md:container mt-4">
          {/* Search Section */}
          <div className="w-[95%] flex justify-center flex-col md:flex-row gap-x-1  bg-white rounded-lg border border-gray-900 shadow-md mx-auto mt-10 p-6">
            <div className="w-full md:w-[99%] flex md:flex-row justify-between items-center">
              <div className="w-full md:w-[90%] gap-x-0 md:gap-x-12 mx-auto   flex flex-col gap-y-2 md:gap-y-0 md:flex-row ">
                <div className="w-full md:w-[40%]   gap-x-14 md:gap-x-6 md:justify-start  my-1 md:my-4 flex md:flex-row">
                  <label
                    className="text-md mt-1.5 mr-1 md:mr-0 "
                    htmlFor="classSelect"
                  >
                    Class <span className="text-red-500 ">*</span>
                  </label>{" "}
                  <div className="w-full md:w-[55%] ">
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
                <div className="w-full md:w-[50%] gap-x-4  justify-between  my-1 md:my-4 flex md:flex-row">
                  <label
                    className=" ml-0 md:ml-4 md:w-[30%]  text-md mt-1.5 "
                    htmlFor="studentSelect"
                  >
                    Student Name <span className="text-red-500 ">*</span>
                  </label>{" "}
                  <div className="w-full md:w-[60%]">
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
            <div className=" w-full  md:container mx-auto py-4 p-4 px-4  ">
              <div className="    card  px-3 rounded-md ">
                {/* <div className="card p-4 rounded-md "> */}

                <div className=" card-header mb-4 flex justify-between items-center  ">
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
                <p className=" text-[.9em] md:absolute md:right-8  md:top-[5%]   text-gray-500 ">
                  <span className="text-red-500 ">*</span>indicates mandatory
                  information
                </p>

                <form
                  onSubmit={handleSubmit}
                  className=" w-full gap-x-1 md:gap-x-14  gap-y-1   overflow-x-hidden shadow-md p-4  bg-gray-50 mb-4"
                >
                  {/* Document Information */}
                  <fieldset className="mb-4">
                    <h5 className="col-span-4 text-blue-400 pb-2">
                      {/* <legend className="font-semibold text-[1.2em]"> */}
                      Document Information
                      {/* </legend> */}
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label
                          htmlFor="sr_no"
                          className="block font-bold text-xs mb-2"
                        >
                          LC No. <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="sr_no"
                          name="sr_no"
                          value={formData.sr_no}
                          readOnly
                          className="input-field block border w-full border-1 border-gray-900 rounded-md py-1 px-3 bg-gray-200 shadow-inner"
                        />
                      </div>
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
                          maxLength={10}
                          value={formData.reg_no}
                          onChange={handleChange}
                          className="input-field block border w-full border-1 border-gray-900 rounded-md py-1 px-3 bg-white shadow-inner"
                        />
                        {errors.reg_no && (
                          <span className="text-red-500 text-xs ml-2 h-1">
                            {errors.reg_no}
                          </span>
                        )}
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
                          className="input-field block border w-full border-1 border-gray-900 rounded-md py-1 px-3 bg-white shadow-inner"
                        />
                        {errors.date && (
                          <span className="text-red-500 text-xs ml-2 h-1">
                            {errors.date}
                          </span>
                        )}
                      </div>
                    </div>
                  </fieldset>
                  {/* Student Identity */}
                  <fieldset className="mb-4">
                    {/* <legend className="font-bold"> */}
                    <h5 className="col-span-4 text-blue-400 py-2">
                      Student Identity
                    </h5>
                    {/* </legend> */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleChange}
                          className="block  border w-full border-1 border-gray-900 rounded-md py-1 px-3  bg-white shadow-inner"
                        />
                        {errors.first_name && (
                          <div className="text-red-500 text-xs ml-2 ">
                            {errors.first_name}
                          </div>
                        )}
                      </div>
                      <div className=" ">
                        <label
                          htmlFor="staffMidName"
                          className="block font-bold  text-xs mb-2"
                        >
                          Mid Name
                        </label>
                        <input
                          type="text"
                          maxLength={200}
                          id="staffMidName"
                          name="mid_name"
                          value={formData.mid_name}
                          onChange={handleChange}
                          className="block  border w-full border-1 border-gray-900 rounded-md py-1 px-3  bg-white shadow-inner"
                        />
                      </div>
                      <div className=" ">
                        <label
                          htmlFor="staffLastName"
                          className="block font-bold  text-xs mb-2"
                        >
                          Surname
                        </label>
                        <input
                          type="text"
                          maxLength={200}
                          id="staffLastName"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleChange}
                          className="block  border w-full border-1 border-gray-900 rounded-md py-1 px-3  bg-white shadow-inner"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="stud_id_no"
                          className="block font-bold text-xs mb-2"
                        >
                          STUDENT ID NO <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="stud_id_no"
                          name="stud_id_no"
                          maxLength={25}
                          value={formData.stud_id_no}
                          onChange={handleChange}
                          className="input-field block border w-full border-1 border-gray-900 rounded-md py-1 px-3 bg-white shadow-inner"
                        />
                        {errors.stud_id_no && (
                          <span className="text-red-500 text-xs ml-2 h-1">
                            {errors.stud_id_no}
                          </span>
                        )}
                      </div>

                      {classIdForSearch > 427 && (
                        <div className="mt-2">
                          <label
                            htmlFor="studentAadharNumber"
                            className="block font-bold text-xs mb-0.5"
                          >
                            Udise Pen No.{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="Udise_no"
                            name="udise_pen_no"
                            maxLength={14}
                            value={formData.udise_pen_no}
                            // className="input-field block w-full  border-1 border-gray-900 rounded-md py-1 px-3 bg-white shadow-inner"
                            className="input-field block border w-full border-1 border-gray-900 rounded-md py-1 px-3 bg-white shadow-inner"
                            onChange={handleChange}
                            // onBlur={handleBlur}
                          />{" "}
                          {errors.udise_pen_no && (
                            <span className="text-red-500 text-xs ml-2 h-1">
                              {errors.udise_pen_no}
                            </span>
                          )}
                        </div>
                      )}
                      <div>
                        <label
                          htmlFor="stu_aadhaar_no"
                          className="block font-bold text-xs mb-2"
                        >
                          UDI NO.(Aadhar Card No.){" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="stu_aadhaar_no"
                          name="stu_aadhaar_no"
                          maxLength={12}
                          value={formData.stu_aadhaar_no}
                          onChange={handleChange}
                          className="input-field block border w-full border-1 border-gray-900 rounded-md py-1 px-3 bg-white shadow-inner"
                        />
                        {errors.stu_aadhaar_no && (
                          <span className="text-red-500 text-xs ml-2 h-1">
                            {errors.stu_aadhaar_no}
                          </span>
                        )}
                      </div>
                    </div>
                  </fieldset>
                  {/* Parent Details */}
                  <fieldset className="mb-4">
                    {/* <legend className="font-bold"> */}
                    <h5 className="col-span-4 text-blue-400 py-2">
                      Parent Details
                    </h5>
                    {/* </legend> */}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          className="input-field bg-white block w-full border border-1 border-gray-900 rounded-md py-1 px-3  outline-none shadow-inner"
                        />
                        {errors.father_name && (
                          <div className="text-red-500 text-xs ml-2 ">
                            {errors.father_name}
                          </div>
                        )}
                      </div>
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
                          maxLength={50}
                          value={formData.mother_name}
                          onChange={handleChange}
                          className="input-field block border w-full border-1 border-gray-900 rounded-md py-1 px-3 bg-white shadow-inner"
                        />
                        {errors.mother_name && (
                          <span className="text-red-500 text-xs ml-2 h-1">
                            {errors.mother_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </fieldset>
                  {/* Academic Details */}
                  <fieldset className="mb-4">
                    {/* <legend className="font-bold"> */}
                    <h5 className="col-span-4 text-blue-400 py-2">
                      Academic Details
                    </h5>
                    {/* </legend> */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                          maxLength={20}
                          value={formData.religion}
                          onChange={handleChange}
                          className="input-field block border w-full border-1 border-gray-900 rounded-md py-1 px-3 bg-white shadow-inner"
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
                          maxLength={20}
                          value={formData.caste}
                          onChange={handleChange}
                          className="input-field block border w-full border-1 border-gray-900 rounded-md py-1 px-3 bg-white shadow-inner"
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
                          maxLength={100}
                          value={formData.subcaste}
                          onChange={handleChange}
                          className="input-field block border w-full border-1 border-gray-900 rounded-md py-1 px-3 bg-white shadow-inner"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="subjects"
                          className="block font-bold text-xs mb-2"
                        >
                          Subjects Studied{" "}
                          <span className="text-red-500">*</span>
                        </label>

                        {/* Render checkboxes for each subject */}
                        {formData.subjects && formData.subjects.length > 0 ? (
                          formData.subjects.map((subject, index) => (
                            <div key={index} className="mb-2">
                              <label className="inline-flex items-center">
                                <input
                                  type="checkbox"
                                  name="subjects"
                                  value={subject.name}
                                  checked={formData.selectedSubjects.includes(
                                    subject.name
                                  )}
                                  onChange={(e) =>
                                    handleSubjectSelection(e, subject.name)
                                  }
                                  className="form-checkbox h-4 w-4 text-blue-600"
                                />
                                <span className="ml-2 text-sm">
                                  {subject.name}
                                </span>
                              </label>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">
                            No subjects available
                          </p>
                        )}

                        {/* Conditional extra subject for class 100 */}
                        {formData.class === 100 && (
                          <div className="mb-2">
                            <label className="inline-flex items-center">
                              <input
                                type="checkbox"
                                name="subjects"
                                value="Basic Mathematics"
                                checked={formData.selectedSubjects.includes(
                                  "Basic Mathematics"
                                )}
                                onChange={(e) =>
                                  handleSubjectSelection(e, "Basic Mathematics")
                                }
                                className="form-checkbox h-4 w-4 text-blue-600"
                              />
                              <span className="ml-2 text-sm">
                                Basic Mathematics
                              </span>
                            </label>
                          </div>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="PromotedTo"
                          className="block font-bold text-xs mb-2"
                        >
                          Promoted to <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="PromotedTo"
                          name="promoted_to"
                          maxLength={100}
                          value={formData.promoted_to}
                          onChange={handleChange}
                          className="input-field block border w-full border-1 border-gray-900 rounded-md py-1 px-3 bg-white shadow-inner"
                        />
                        {errors.promoted_to && (
                          <span className="text-red-500 text-xs ml-2 h-1">
                            {errors.promoted_to}
                          </span>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="School/Board"
                          className="block font-bold text-xs mb-2"
                        >
                          School/Board Annual Exam Last Taken with Result{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="School/Board"
                          name="School_Board"
                          maxLength={100}
                          value={formData.School_Board}
                          onChange={handleChange}
                          className="input-field block border w-full border-1 border-gray-900 rounded-md py-1 px-3 bg-white shadow-inner"
                        />
                        {errors.School_Board && (
                          <span className="text-red-500 text-xs ml-2 h-1">
                            {errors.School_Board}
                          </span>
                        )}
                      </div>
                    </div>
                  </fieldset>
                  {/* Personal Information */}
                  <fieldset className="mb-4">
                    {/* <legend className="font-bold"> */}
                    <h5 className="col-span-4 text-blue-400 py-2">
                      Personal Information
                    </h5>
                    {/* </legend> */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                          maxLength={20}
                          name="birth_place"
                          value={formData.birth_place}
                          onChange={handleChange}
                          className="input-field block border w-full border-1 border-gray-900 rounded-md py-1 px-3 bg-white shadow-inner"
                        />
                        {errors.birth_place && (
                          <span className="text-red-500 text-xs ml-2 h-1">
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
                          maxLength={50}
                          value={formData.state}
                          onChange={handleChange}
                          className="input-field block border w-full border-1 border-gray-900 rounded-md py-1 px-3 bg-white shadow-inner"
                        />
                        {errors.state && (
                          <span className="text-red-500 text-xs ml-2 h-1">
                            {errors.state}
                          </span>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="mother_tongue"
                          className="block font-bold text-xs mb-2"
                        >
                          Mother Tongue <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="mother_tongue"
                          name="mother_tongue"
                          maxLength={50}
                          value={formData.mother_tongue}
                          onChange={handleChange}
                          className="input-field block border w-full border-1 border-gray-900 rounded-md py-1 px-3 bg-white shadow-inner"
                        />
                        {errors.mother_tongue && (
                          <span className="text-red-500 text-xs ml-2 h-1">
                            {errors.mother_tongue}
                          </span>
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
                          className="block border w-full border-1 border-gray-900 rounded-md py-1 px-3 bg-white shadow-inner"
                        />
                        {errors.dob && (
                          <div className="text-red-500 text-xs ml-2 ">
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
                          className="input-field resize block w-full border border-1 border-gray-900 rounded-md py-1 px-3 bg-white shadow-inner"
                        />
                        {errors.dob_words && (
                          <div className="text-red-500 text-xs ml-2 ">
                            {errors.dob_words}
                          </div>
                        )}
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
                          maxLength={100}
                          value={formData.nationality}
                          onChange={handleChange}
                          className="input-field block border w-full border-1 border-gray-900 rounded-md py-1 px-3 bg-white shadow-inner"
                        />
                        {errors.nationality && (
                          <span className="text-red-500 text-xs ml-2 h-1">
                            {errors.nationality}
                          </span>
                        )}
                      </div>
                    </div>
                  </fieldset>
                  {/* Admission Details */}
                  <fieldset className="mb-4">
                    {/* <legend className="font-bold"> */}
                    <h5 className="col-span-4 text-blue-400 py-2">
                      Admission Details
                    </h5>
                    {/* </legend> */}

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label
                          htmlFor="prev_school_class"
                          className="block font-bold text-xs mb-2"
                        >
                          Previous School Attended{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="prev_school_class"
                          maxLength={100}
                          name="prev_school_class"
                          value={formData.prev_school_class}
                          onChange={handleChange}
                          className="input-field block border w-full border-1 border-gray-900 rounded-md py-1 px-3 bg-white shadow-inner"
                        />
                        {errors.prev_school_class && (
                          <span className="text-red-500 text-xs ml-2 h-1">
                            {errors.prev_school_class}
                          </span>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="admission_date"
                          className="block font-bold text-xs mb-2"
                        >
                          Date of Admission{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          id="admission_date"
                          name="admission_date"
                          value={formData.admission_date}
                          onChange={handleChange}
                          className="input-field block border w-full border-1 border-gray-900 rounded-md py-1 px-3 bg-white shadow-inner"
                        />
                        {errors.admission_date && (
                          <span className="text-red-500 text-xs ml-2 h-1">
                            {errors.admission_date}
                          </span>
                        )}
                      </div>
                      <div className=" ">
                        <label
                          htmlFor="class_when_learning"
                          className="block font-bold text-xs mb-2 "
                        >
                          Admitted in Class
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="class_when_learning"
                          maxLength={100}
                          name="class_when_learning"
                          value={formData.class_when_learning}
                          onChange={handleChange}
                          className="input-field block border w-full border-1 border-gray-900 rounded-md py-1 px-3 bg-white shadow-inner"
                        />
                        {errors.class_when_learning && (
                          <span className="text-red-500 text-xs ml-2 h-1">
                            {errors.class_when_learning}
                          </span>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="Date_of_Leaving_School"
                          className="block font-bold text-xs mb-2"
                        >
                          Date of Leaving School
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          id="Date_of_Leaving_School"
                          name="lc_date_n_school"
                          value={formData.lc_date_n_school}
                          onChange={handleChange}
                          className="input-field block border w-full border-1 border-gray-900 rounded-md py-1 px-3 bg-white shadow-inner"
                        />
                        {errors.lc_date_n_school && (
                          <span className="text-red-500 text-xs ml-2 h-1">
                            {errors.lc_date_n_school}
                          </span>
                        )}
                      </div>{" "}
                      {/* Dropdown for Proof of DOB submitted */}
                      <div className="mb-4">
                        <label
                          htmlFor="dobProof"
                          className="block font-bold text-xs mb-2"
                        >
                          Proof of DOB Submitted at the Time of Admission
                          <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="dobProof"
                          name="dobProof"
                          value={formData.dobProof}
                          onChange={handleChange}
                          className="block w-full border border-gray-900 rounded-md py-1 px-3 bg-white shadow-inner"
                        >
                          <option value="">Select an option</option>
                          <option value="Birth Certificate">
                            Birth Certificate
                          </option>
                          <option value="School Leaving Certificate">
                            School Leaving Certificate
                          </option>
                          <option value="Aadhar Card">Aadhar Card</option>
                          <option value="Passport">Passport</option>
                        </select>
                        {errors.dobProof && (
                          <span className="text-red-500 text-xs ml-2 h-1">
                            {errors.dobProof}
                          </span>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="prev_class"
                          className="block font-bold text-xs mb-2"
                        >
                          Class in Which Last Studied in
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          id="prev_class"
                          name="prev_class"
                          value={formData.prev_class}
                          onChange={handleChange}
                          className="input-field block border w-full border-1 border-gray-900 rounded-md py-1 px-3 bg-white shadow-inner"
                        />
                        {errors.prev_class && (
                          <span className="text-red-500 text-xs ml-2 h-1">
                            {errors.prev_class}
                          </span>
                        )}
                      </div>{" "}
                      <div>
                        <label
                          htmlFor="leaving_reason"
                          className="block font-bold text-xs mb-2"
                        >
                          Reason for Leaving{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="leaving_reason"
                          name="leaving_reason"
                          maxLength={100}
                          value={formData.leaving_reason}
                          onChange={handleChange}
                          className="input-field block border w-full border-1 border-gray-900 rounded-md py-1 px-3 bg-white shadow-inner"
                        />
                        {errors.leaving_reason && (
                          <span className="text-red-500 text-xs ml-2 h-1">
                            {errors.leaving_reason}
                          </span>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="lc_date_n_no"
                          className="block font-bold text-xs mb-2"
                        >
                          Date of Leaving Certificate{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          id="lc_date_n_no"
                          name="lc_date_n_no"
                          value={formData.lc_date_n_no}
                          onChange={handleChange}
                          className="input-field block border w-full border-1 border-gray-900 rounded-md py-1 px-3 bg-white shadow-inner"
                        />
                        {errors.lc_date_n_no && (
                          <span className="text-red-500 text-xs ml-2 h-1">
                            {errors.lc_date_n_no}
                          </span>
                        )}
                      </div>
                    </div>
                  </fieldset>
                  {/* School Records */}
                  <fieldset className="mb-4">
                    <h5 className="col-span-4 text-blue-400 py-2">
                      School Records
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label
                          htmlFor="attendance"
                          className="block font-bold text-xs mb-2"
                        >
                          Attendance <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="attendance"
                          name="attendance"
                          value={formData.attendance}
                          onChange={handleChange}
                          className="input-field block border w-full border-1 border-gray-900 rounded-md py-1 px-3 bg-white shadow-inner"
                        />
                        {errors.attendance && (
                          <span className="text-red-500 text-xs ml-2 h-1">
                            {errors.attendance}
                          </span>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="paid_month"
                          className="block font-bold text-xs mb-2"
                        >
                          Month Up to Which School Fees are Paid{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="paid_month"
                          name="paid_month"
                          value={formData.paid_month}
                          onChange={handleChange}
                          className="input-field block border w-full border-1 border-gray-900 rounded-md py-1 px-3 bg-white shadow-inner"
                        />
                        {errors.paid_month && (
                          <span className="text-red-500 text-xs ml-2 h-1">
                            {errors.paid_month}
                          </span>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="conduct"
                          className="block font-bold text-xs mb-2"
                        >
                          Conduct <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="conduct"
                          name="conduct"
                          value={formData.conduct}
                          onChange={handleChange}
                          className="input-field block border w-full border-1 border-gray-900 rounded-md py-1 px-3 bg-white shadow-inner"
                        />
                        {errors.conduct && (
                          <span className="text-red-500 text-xs ml-2 h-1">
                            {errors.conduct}
                          </span>
                        )}
                      </div>
                      <div className="mb-4">
                        <label
                          htmlFor="group"
                          className="block font-bold text-xs mb-2"
                        >
                          Whether Part of (NCC Cadet, Boy Scout, Girl Guide)
                          <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="group"
                          value={formData.group}
                          onChange={handleChange}
                          className="block w-full border border-gray-900 rounded-md py-1 px-3 bg-white shadow-inner"
                        >
                          <option value="">Select an option</option>
                          <option value="NCC Cadet">NCC Cadet</option>
                          <option value="Boy Scout">Boy Scout</option>
                          <option value="Girl Guide">Girl Guide</option>
                          <option value="N.A">N.A</option>
                        </select>
                      </div>

                      {/* Display selected value for reference */}

                      <div>
                        <label
                          htmlFor="activities"
                          className="block font-bold text-xs mb-2"
                        >
                          Extra-Curricular Activities{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        {/* <input
                          type="text"
                          id="activities"
                          name="activities"
                          value={formData.activities}
                          onChange={handleChange}
                          className="input-field block border w-full border-1 border-gray-900 rounded-md py-1 px-3 bg-white shadow-inner"
                        /> */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {[
                            "Football",
                            "Basketball",
                            "Volleyball",
                            "Tennis",
                            "Kho Kho",
                            "Table Tennis",
                            "Kabaddi",
                            "Cricket",
                            "Athletics",
                            "Dodgeball",
                            "Throwball",
                            "Handball",
                            "Tug of War",
                            "Gymnastics",
                            "Skating",
                            "Martial Arts",
                            "Badminton",
                            "Chess",
                            "Carrom",
                          ].map((activity) => (
                            <div key={activity} className="flex items-center">
                              <input
                                type="checkbox"
                                id={activity}
                                value={activity}
                                onChange={handleCheckboxChange}
                                className="mr-2"
                              />
                              <label htmlFor={activity} className="text-sm">
                                {activity}
                              </label>
                            </div>
                          ))}
                        </div>
                        {errors.activities && (
                          <span className="text-red-500 text-xs ml-2 h-1">
                            {errors.activities}
                          </span>
                        )}
                      </div>
                    </div>
                  </fieldset>

                  {/* Certificate Information */}
                  <fieldset className="mb-4">
                    <h5 className="col-span-4 text-blue-400 py-2">
                      Certificate Information
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label
                          htmlFor="application_date"
                          className="block font-bold text-xs mb-2"
                        >
                          Date of Application for Certificate{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          id="application_date"
                          name="application_date"
                          value={formData.application_date}
                          onChange={handleChange}
                          className="input-field block border w-full border-1 border-gray-900 rounded-md py-1 px-3 bg-white shadow-inner"
                        />
                        {errors.application_date && (
                          <span className="text-red-500 text-xs ml-2 h-1">
                            {errors.application_date}
                          </span>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="remarks"
                          className="block font-bold text-xs mb-2"
                        >
                          Any Other Remarks{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="remarks"
                          name="remarks"
                          value={formData.remarks}
                          onChange={handleChange}
                          className="input-field block border w-full border-1 border-gray-900 rounded-md py-1 px-3 bg-white shadow-inner"
                        />
                        {errors.remarks && (
                          <span className="text-red-500 text-xs ml-2 h-1">
                            {errors.remarks}
                          </span>
                        )}
                      </div>

                      {/* <div>
                        <label
                          htmlFor="academic_year"
                          className="block font-bold text-xs mb-2"
                        >
                          Academic Year <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="academic_year"
                          name="academic_year"
                          value={formData.academic_year}
                          onChange={handleChange}
                          className="input-field block border w-full border-1 border-gray-900 rounded-md py-1 px-3 bg-white shadow-inner"
                        />
                        {errors.academic_year && (
                          <span className="text-red-500 text-xs ml-2 h-1">
                            {errors.academic_year}
                          </span>
                        )}
                      </div> */}
                      {/* Dropdown for Academic Year */}
                      <div className="mb-4">
                        <label
                          htmlFor="academicYear"
                          className="block font-bold text-xs mb-2"
                        >
                          Academic Year <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="academicYear"
                          name="academicYear"
                          value={formData.academicYear}
                          onChange={handleChange}
                          className="block w-full border border-gray-900 rounded-md py-1 px-3 bg-white shadow-inner"
                        >
                          <option value="">Select an academic year</option>
                          <option value="2022-2023">2022-2023</option>
                          <option value="2023-2024">2023-2024</option>
                          <option value="2024-2025">2024-2025</option>
                        </select>
                        {errors.academicYear && (
                          <span className="text-red-500 text-xs ml-2 h-1">
                            {errors.academicYear}
                          </span>
                        )}
                      </div>
                    </div>
                  </fieldset>

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
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeavingCertificate;
