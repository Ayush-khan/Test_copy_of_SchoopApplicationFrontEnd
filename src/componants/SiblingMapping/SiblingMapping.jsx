import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
import LoaderStyle from "../../componants/common/LoaderFinal/LoaderStyle";

const SiblingMapping = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudentForSecond, setSelectedStudentForSecond] =
    useState(null);
  const [classesforForm, setClassesforForm] = useState([]);
  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
  const [classesforFormForSecond, setClassesforFormForSecond] = useState([]);
  const [studentNameWithClassIdForSecond, setStudentNameWithClassIdForSecond] =
    useState([]);
  const [classIdForSearch, setClassIdForSearch] = useState(null);
  const [classIdForSearchForSecond, setClassIdForSearchForSecond] =
    useState(null);

  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedStudentIdForSecond, setSelectedStudentIdForSecond] =
    useState(null);

  const [nameError, setNameError] = useState("");
  const [nameErrorForClass, setNameErrorForClass] = useState("");
  const [nameErrorForSecond, setNameErrorForSecond] = useState("");
  const [nameErrorForClassForSecond, setNameErrorForClassForSecond] =
    useState("");
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedClassForSecond, setSelectedClassForSecond] = useState(null);

  const [parentInformation, setParentInformation] = useState(null);
  const [parentInformationForSecond, setParentInformationForSecond] =
    useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingForSearch, setLoadingForSearch] = useState(false);
  const [loadingForSearchForSecond, setLoadingForSearchForSecond] =
    useState(false);

  const navigate = useNavigate();
  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      fontSize: "0.8rem",
      backgroundColor: state.isFocused ? "rgba(59, 130, 246, 0.1)" : "white",
      color: state.isSelected ? "blue" : "inherit", // Ensures selected value is black
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 50, // To ensure proper stacking
    }),
  };

  const [formData, setFormData] = useState({
    stud_name: "", // Combined name with class and division
    father_name: "",
    mother_name: "", // Added mother's name
    father_email: "",
    father_phone: "",
    mother_email: "",
    mother_phone: "",
    user_id: "", // User ID set as Parent (Father Phone here)
  });
  const [formDataForSecond, setFormDataForSecond] = useState({
    stud_name: "", // Combined name with class and division
    father_name: "",
    mother_name: "", // Added mother's name
    father_email: "",
    father_phone: "",
    mother_email: "",
    mother_phone: "",
    user_id: "", // User ID set as Parent (Father Phone here)
  });

  // for form
  const [errors, setErrors] = useState({});
  const [backendErrors, setBackendErrors] = useState({});

  // Get today's date in YYYY-MM-DD format
  // Calculate today's date
  const today = new Date().toISOString().split("T")[0];
  // State for loading indicators
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingClassesForSecond, setLoadingClassesForSecond] = useState(false);
  const [loadingStudentsForSecond, setLoadingStudentsForSecond] =
    useState(false);

  useEffect(() => {
    // Fetch both classes and student names on component mount
    fetchInitialDataAndStudents();
    fetchInitialDataAndStudentsForSecond();
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

  const fetchInitialDataAndStudentsForSecond = async () => {
    try {
      setLoadingClassesForSecond(true);
      setLoadingStudentsForSecond(true);

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
      setClassesforFormForSecond(classResponse.data || []);
      setStudentNameWithClassIdForSecond(studentResponse?.data?.data || []);
    } catch (error) {
      toast.error("Error fetching data.");
    } finally {
      // Stop loading for both dropdowns
      setLoadingClassesForSecond(false);
      setLoadingStudentsForSecond(false);
    }
  };

  const fetchStudentNameWithClassIdForSecond = async (section_id = null) => {
    try {
      setLoadingStudentsForSecond(true);

      const params = section_id ? { section_id } : {};
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/getStudentListBySectionData`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      setStudentNameWithClassIdForSecond(response?.data?.data || []);
    } catch (error) {
      toast.error("Error fetching students.");
    } finally {
      setLoadingStudentsForSecond(false);
    }
  };

  const handleClassSelect = (selectedOption) => {
    setSelectedClass(selectedOption);
    setSelectedStudent(null);
    setSelectedStudentId(null);
    setClassIdForSearch(selectedOption?.value);
    fetchStudentNameWithClassId(selectedOption?.value);
  };
  const handleClassSelectForSecond = (selectedOption) => {
    setSelectedClassForSecond(selectedOption);
    setSelectedStudentForSecond(null);
    setSelectedStudentIdForSecond(null);
    setClassIdForSearchForSecond(selectedOption?.value);
    fetchStudentNameWithClassIdForSecond(selectedOption?.value);
  };

  const handleStudentSelect = (selectedOption) => {
    setNameError(""); // Reset student error on selection
    setSelectedStudent(selectedOption);
    setSelectedStudentId(selectedOption?.value);
    handleSearch(selectedOption?.value);
  };
  const handleStudentSelectForSecond = (selectedOption) => {
    setNameErrorForSecond(""); // Reset student error on selection
    setSelectedStudentForSecond(selectedOption);
    setSelectedStudentIdForSecond(selectedOption?.value);
    handleSearchForSecond(selectedOption?.value);
  };

  // Dropdown options
  const classOptions = useMemo(
    () =>
      classesforForm.map((cls) => ({
        value: cls.section_id,
        label: `${cls?.get_class?.name || ""} ${cls?.name || ""} (${
          cls?.students_count || ""
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
  // Dropdown options
  const classOptionsForSecond = useMemo(
    () =>
      classesforFormForSecond.map((cls) => ({
        value: cls.section_id,
        label: `${cls?.get_class?.name || ""} ${cls.name || ""} (${
          cls.students_count || ""
        })`,
        key: `${cls.class_id}-${cls.section_id}`,
      })),
    [classesforFormForSecond]
  );

  const studentOptionsForSecond = useMemo(
    () =>
      studentNameWithClassIdForSecond.map((stu) => ({
        value: stu.student_id,
        label: `${stu?.first_name || ""} ${stu?.mid_name || ""} ${
          stu?.last_name || ""
        }`,
      })),
    [studentNameWithClassIdForSecond]
  );
  const handleSearch = async (selectedStudent1) => {
    // Reset error messages
    setNameError("");
    setNameErrorForClass("");
    setErrors({}); // Clears all field-specific errors

    if (!selectedStudent1) {
      setNameError("Please select Student Name.");
      toast.error("Please select Student Name.!");
      return;
    }
    // Validate if class and student are selected
    // let hasError = false;
    // if (!selectedClass) {
    //   setNameErrorForClass("Please select a class.");
    //   hasError = true;
    // }
    // if (!selectedStudent) {
    //   setNameError("Please select a student.");
    //   hasError = true;
    // }

    // If there are validation errors, exit the function
    // if (hasError) return;
    // Reset form data and selected values after successful submission
    setParentInformation(null);
    setFormData({
      stud_name: "", // Combined name with class and division
      father_name: "",
      mother_name: "", // Added mother's name
      father_email: "",
      father_phone: "",
      mother_email: "",
      mother_phone: "",
      user_id: "", // User ID set as Parent (Father Phone here)
    });
    try {
      setLoadingForSearch(true); // Start loading
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${API_URL}/api/get_students`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { student_id: selectedStudent1 }, // Pass query parameters here
      });

      // Check if data was received and update the form state
      if (response?.data?.students) {
        const fetchedData = response?.data?.students; // Extract the data
        setParentInformation(fetchedData); // Assuming response data contains form data
        console.log("fetchedData", fetchedData);

        // Check if the fetchedData array is not empty
        if (fetchedData && fetchedData.length > 0) {
          const student = fetchedData[0]; // Access the first student in the array (or handle multiple students if needed)

          // Populate formData with the fetched student data
          setFormData({
            stud_name: `${student?.first_name || ""} ${
              student?.mid_name || ""
            } ${student?.last_name || ""} (${student?.get_class?.name || ""}-${
              student?.get_division?.name || ""
            })`, // Combined name with class and division
            father_name: student?.parents?.father_name || "",
            mother_name: student?.parents?.mother_name || "", // Mother's name
            father_email: student?.parents?.f_email || "",
            father_phone: student?.parents?.f_mobile || "",
            mother_email: student?.parents?.m_emailid || "",
            mother_phone: student?.parents?.m_mobile || "",
            user_id: student?.user_master?.user_id || "", // User ID set as Parent (Father Email here)
          });
        } else {
          console.error("No students found in the response.");
        }

        console.log("setFormData", formData);
      } else {
        console.log("reponse", response.data.status);
        if (response.data && response.data.status === 403) {
          toast.error(
            "Bonafide Certificate Already Generated. Please go to manage to download the Bonafide Certificate."
          );
        } else {
          // Show a generic error message if the error is not a 403
          toast.error("No data found for the selected student.");
        }
        // toast.error("No data found for the selected student.");
      }
    } catch (error) {
      console.log("error is", error);
      // toast.error(error.message);
      // Check if response has a 403 status and the specific error message
      console.log("error is", error.response);
    } finally {
      setLoadingForSearch(false);
    }
  };
  const handleSearchForSecond = async (selectedStudent1) => {
    // Reset error messages
    setNameErrorForSecond("");
    setNameErrorForClassForSecond("");
    setErrors({}); // Clears all field-specific errors

    if (!selectedStudent1) {
      setNameErrorForSecond("Please select Student Name.");
      toast.error("Please select Student Name.!");
      return;
    }
    setParentInformationForSecond(null); // Assuming response data contains form data

    setFormDataForSecond({
      stud_name: "", // Combined name with class and division
      father_name: "",
      mother_name: "", // Added mother's name
      father_email: "",
      father_phone: "",
      mother_email: "",
      mother_phone: "",
      user_id: "", // User ID set as Parent (Father Phone here)
    });
    try {
      setLoadingForSearchForSecond(true); // Start loading
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${API_URL}/api/get_students`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { student_id: selectedStudent1 }, // Pass query parameters here
      });

      // Check if data was received and update the form state
      if (response?.data?.students) {
        const fetchedData = response?.data?.students; // Extract the data
        setParentInformationForSecond(fetchedData); // Assuming response data contains form data
        console.log("fetchedData", fetchedData);

        // Check if the fetchedData array is not empty
        if (fetchedData && fetchedData.length > 0) {
          const student = fetchedData[0]; // Access the first student in the array (or handle multiple students if needed)

          // Populate formData with the fetched student data
          setFormDataForSecond({
            stud_name: `${student?.first_name || ""} ${
              student?.mid_name || ""
            } ${student?.last_name || ""} (${student?.get_class?.name || ""}-${
              student?.get_division?.name || ""
            })`, // Combined name with class and division
            father_name: student?.parents?.father_name || "",
            mother_name: student?.parents?.mother_name || "", // Mother's name
            father_email: student?.parents?.f_email || "",
            father_phone: student?.parents?.f_mobile || "",
            mother_email: student?.parents?.m_emailid || "",
            mother_phone: student?.parents?.m_mobile || "",
            user_id: student?.user_master?.user_id || "", // User ID set as Parent (Father Email here)
          });
        } else {
          console.error("No students found in the response.");
        }
      } else {
        console.log("reponse", response.data.status);
        if (response.data && response.data.status === 403) {
          toast.error(
            "Bonafide Certificate Already Generated. Please go to manage to download the Bonafide Certificate."
          );
        } else {
          // Show a generic error message if the error is not a 403
          toast.error("No data found for the selected student.");
        }
        // toast.error("No data found for the selected student.");
      }
    } catch (error) {
      console.log("error is", error);
      // toast.error(error.message);
      // Check if response has a 403 status and the specific error message
      console.log("error is", error.response);
    } finally {
      setLoadingForSearchForSecond(false);
    }
  };
  // For FOrm
  const validate = () => {
    const newErrors = {};

    // Validate name
    if (!formData.stud_name) newErrors.stud_name = "This field is required";
    else if (!/^[^\d].*/.test(formData.stud_name))
      newErrors.stud_name = "Name should not start with a number";

    // Validate name
    if (!formData.father_name) newErrors.father_name = "This field is required";
    else if (!/^[^\d].*/.test(formData.father_name))
      newErrors.father_name = "Name should not start with a number";
    // Validate academic qualifications (now a single text input)
    if (!formData.class_division)
      newErrors.class_division = "This field is required";
    if (!formData.sr_no) newErrors.sr_no = "This field is required";

    // Validate dob
    if (!formData.dob) newErrors.dob = "This field is required";
    if (!formData.father_name) newErrors.father_name = "This field is required";

    // Validate date of joining
    if (!formData.date) newErrors.date = "This field is required";

    // Validate Employee Id
    if (!formData.purpose) newErrors.purpose = "This field is required";
    // Validate address
    if (!formData.dob_words) newErrors.dob_words = "This field is required";
    if (!formData.nationality) newErrors.nationality = "This field is required";

    setErrors(newErrors);
    return newErrors;
  };
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

    // Field-specific validation
    let fieldErrors = {};

    // Name validation
    if (name === "stud_name") {
      if (!newValue) fieldErrors.stud_name = "Name is required";
      else if (/^\d/.test(newValue))
        fieldErrors.stud_name = "Name should not start with a number";
    }
    if (name === "father_name") {
      if (!newValue) fieldErrors.father_name = "Name is required";
      else if (/^\d/.test(newValue))
        fieldErrors.father_name = "Name should not start with a number";
    }

    // Academic Qualification validation
    if (name === "class_division") {
      if (!newValue)
        fieldErrors.class_division = "Class and Division is required";
    }

    // Date of Birth validation
    if (name === "dob") {
      if (!newValue) fieldErrors.dob = "Date of Birth is required";
    }
    // serial number

    if (name === "sr_no") {
      if (!newValue) fieldErrors.sr_no = "Serial number is required";
    }
    if (name === "father_name") {
      if (!newValue) fieldErrors.father_name = "Father Name is required";
    }

    // Date of Joining validation
    if (name === "date") {
      if (!newValue) fieldErrors.date = " Date is required";
    }

    // Employee ID validation
    if (name === "purpose") {
      if (!newValue) fieldErrors.purpose = "Purpose  is required";
    }

    // Address validation
    if (name === "dob_words") {
      if (!newValue)
        fieldErrors.dob_words = "  Birth date in words is required";
    }
    if (name === "nationality") {
      if (!newValue) fieldErrors.nationality = "Nationality is required";
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
        setSelectedClassForSecond(null); // Reset class selection
        setSelectedStudentForSecond(null); // Reset student selection
        setErrors({});
        setBackendErrors({});
        setTimeout(() => {
          setParentInformation(null);
          setParentInformationForSecond(null);
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

      <div className=" w-full md:w-[95%] mt-4 mx-auto">
        <div className="card mx-auto lg:w-[100%] shadow-lg">
          <div className="p-2 px-3 bg-gray-100 flex justify-between items-center">
            <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
              Sibling Mapping
            </h3>
            <div className="box-border flex md:gap-x-2 justify-end md:h-10"></div>
          </div>
          <div
            className=" relative w-[97%]    h-1  mx-auto bg-red-700"
            style={{
              backgroundColor: "#C03078",
            }}
          ></div>
          <div className="w-full  flex flex-col md:flex-row">
            <div className="     w-full md:container ">
              {/* Search Section */}
              <div className=" w-[95%] border-1  flex justify-center flex-col md:flex-row gap-x-1  bg-white rounded-lg  border-gray-300 shadow-md  mx-auto mt-6 p-6 mb-4 ">
                <div className="w-[99%] flex md:flex-row justify-between items-center ">
                  <div className="w-full flex flex-col gap-y-2 md:gap-y-0 md:flex-row">
                    <div className="w-full gap-x-14 md:gap-x-6 md:justify-start my-1 md:my-4 flex md:flex-row">
                      <label
                        className="text-[.9em] mt-1.5 mr-1 md:mr-0"
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
                          className="text-[.8em]"
                          styles={customStyles} // Apply custom styles
                          isDisabled={loadingClasses}
                        />
                      </div>
                    </div>

                    <div className=" w-full gap-x-6 relative left-0 md:-left-[5%] justify-between md:w-[98%] my-1 md:my-4 flex md:flex-row">
                      <label
                        className="md:w-[50%] text-[.9em] mt-1.5"
                        htmlFor="studentSelect"
                      >
                        Student Name
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
                          className="text-[.8em]"
                          styles={customStyles} // Apply custom styles
                          isDisabled={loadingStudents}
                        />
                        {nameError && (
                          <div className="h-8 relative ml-1 text-danger text-xs">
                            {nameError}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Section - Displayed when parentInformation is fetched */}

              {loadingForSearch ? (
                <div className="flex justify-center items-center h-44">
                  <LoaderStyle />
                </div>
              ) : (
                parentInformation && (
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

                      <form
                        onSubmit={handleSubmit}
                        className="flex flex-col justify-center items-center overflow-x-hidden shadow-md p-2 bg-gray-50 mb-4"
                      >
                        <div className="flex  flex-col w-full   md:mx-10 pt-6 pb-6  px-6">
                          {/* Student Name */}
                          <div className="flex   flex-col md:flex-row md:items-center gap-y-2 gap-x-8">
                            <label
                              htmlFor="stud_name"
                              className="block font-semibold text-[1em] md:w-1/3 text-gray-700"
                            >
                              Student Name :
                            </label>
                            <p className="text-gray-700  relative top-2 md:w-[60%] ">
                              {formData.stud_name || ""}
                            </p>
                          </div>

                          {/* Father's Name */}
                          <div className="flex flex-col md:flex-row md:items-center gap-y-2 gap-x-8">
                            <label
                              htmlFor="father_name"
                              className="block font-semibold text-[1em] md:w-1/3 text-gray-700"
                            >
                              Father's Name :
                            </label>
                            <p className="text-gray-700 relative top-2  md:w-[60%] ">
                              {formData.father_name || ""}
                            </p>
                          </div>

                          {/* Mother's Name */}
                          <div className="flex flex-col md:flex-row md:items-center gap-y-2 gap-x-8">
                            <label
                              htmlFor="mother_name"
                              className="block font-semibold text-[1em] md:w-1/3 text-gray-700"
                            >
                              Mother's Name :
                            </label>
                            <p className="text-gray-700 relative top-2  md:w-[60%] ">
                              {formData.mother_name || ""}
                            </p>
                          </div>

                          {/* Father's Email */}
                          <div className="flex flex-col md:flex-row md:items-center gap-y-2 gap-x-8">
                            <label
                              htmlFor="father_email"
                              className="block font-semibold text-[1em] md:w-1/3 text-gray-700"
                            >
                              Father's Email :
                            </label>
                            <p className="text-gray-700 relative top-2  md:w-[60%] ">
                              {formData.father_email || ""}
                            </p>
                          </div>

                          {/* Father's Phone */}
                          <div className="flex flex-col md:flex-row md:items-center gap-y-2 gap-x-8">
                            <label
                              htmlFor="father_phone"
                              className="block font-semibold text-[1em] md:w-1/3 text-gray-700"
                            >
                              Father's Phone :
                            </label>
                            <p className="text-gray-700 relative top-2  md:w-[60%] ">
                              {formData.father_phone || ""}
                            </p>
                          </div>

                          {/* Mother's Email */}
                          <div className="flex flex-col md:flex-row md:items-center gap-y-2 gap-x-8">
                            <label
                              htmlFor="mother_email"
                              className="block font-semibold text-[1em] md:w-1/3 text-gray-700"
                            >
                              Mother's Email :
                            </label>
                            <p className="text-gray-700 relative top-2  md:w-[60%] ">
                              {formData.mother_email || ""}
                            </p>
                          </div>

                          {/* Mother's Phone */}
                          <div className="flex flex-col md:flex-row md:items-center gap-y-2 gap-x-8">
                            <label
                              htmlFor="mother_phone"
                              className="block font-semibold text-[1em] md:w-1/3 text-gray-700"
                            >
                              Mother's Phone :
                            </label>
                            <p className="text-gray-700 relative top-2  md:w-[60%] ">
                              {formData.mother_phone || ""}
                            </p>
                          </div>

                          {/* User ID */}
                          <div className="flex flex-col md:flex-row md:items-center gap-y-2 gap-x-8">
                            <label
                              htmlFor="user_id"
                              className="block font-semibold text-[1em] md:w-1/3 text-gray-700"
                            >
                              User ID :
                            </label>
                            <p className="text-gray-700 relative top-2  md:w-[60%] ">
                              {formData.user_id || ""}
                            </p>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                )
              )}
            </div>
            <div className="     w-full md:container ">
              <div className=" w-[95%] border-1  flex justify-center flex-col md:flex-row gap-x-1  bg-white rounded-lg  border-gray-300 shadow-md  mx-auto mt-6 p-6 mb-4 ">
                {" "}
                <div className="w-[99%] flex md:flex-row justify-between items-center">
                  <div className="w-full flex flex-col gap-y-2 md:gap-y-0 md:flex-row">
                    <div className="w-full gap-x-14 md:gap-x-6 md:justify-start my-1 md:my-4 flex md:flex-row">
                      <label
                        className="text-[.9em] mt-1.5 mr-1 md:mr-0"
                        htmlFor="classSelect"
                      >
                        Class
                      </label>
                      <div className="w-full md:w-[50%]">
                        <Select
                          id="classSelect"
                          value={selectedClassForSecond}
                          onChange={handleClassSelectForSecond}
                          options={classOptionsForSecond}
                          placeholder={
                            loadingClassesForSecond
                              ? "Loading classes..."
                              : "Select"
                          }
                          isSearchable
                          isClearable
                          className="text-[.8em]"
                          styles={customStyles} // Apply custom styles
                          isDisabled={loadingClassesForSecond}
                        />
                      </div>
                    </div>

                    <div className="w-full gap-x-6 relative left-0 md:-left-[5%] justify-between md:w-[98%] my-1 md:my-4 flex md:flex-row">
                      <label
                        className="md:w-[50%] text-[.9em] mt-1.5"
                        htmlFor="studentSelect"
                      >
                        Student Name
                      </label>
                      <div className="w-full md:w-[80%]">
                        <Select
                          id="studentSelect"
                          value={selectedStudentForSecond}
                          onChange={handleStudentSelectForSecond}
                          options={studentOptionsForSecond}
                          placeholder={
                            loadingStudentsForSecond
                              ? "Loading students..."
                              : "Select"
                          }
                          isSearchable
                          isClearable
                          className="text-[.8em]"
                          styles={customStyles} // Apply custom styles
                          isDisabled={loadingStudentsForSecond}
                        />
                        {nameErrorForSecond && (
                          <div className="h-8 relative ml-1 text-danger text-xs">
                            {nameErrorForSecond}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Section - Displayed when parentInformation is fetched */}

              {loadingForSearchForSecond ? (
                <div className="flex justify-center items-center h-44">
                  <LoaderStyle />
                </div>
              ) : (
                parentInformationForSecond && (
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

                      <form
                        onSubmit={handleSubmit}
                        className="flex flex-col justify-center items-center overflow-x-hidden shadow-md p-2 bg-gray-50 mb-4"
                      >
                        <div className="flex  flex-col w-full   md:mx-10 pt-6 pb-6  px-6">
                          {/* Student Name */}
                          <div className="flex   flex-col md:flex-row md:items-center gap-y-2 gap-x-8">
                            <label
                              htmlFor="stud_name"
                              className="block font-semibold text-[1em] md:w-1/3 text-gray-700"
                            >
                              Student Name :
                            </label>
                            <p className="text-gray-700  relative top-2 md:w-[60%] ">
                              {formDataForSecond.stud_name || ""}
                            </p>
                          </div>

                          {/* Father's Name */}
                          <div className="flex flex-col md:flex-row md:items-center gap-y-2 gap-x-8">
                            <label
                              htmlFor="father_name"
                              className="block font-semibold text-[1em] md:w-1/3 text-gray-700"
                            >
                              Father's Name :
                            </label>
                            <p className="text-gray-700 relative top-2  md:w-[60%] ">
                              {formDataForSecond.father_name || ""}
                            </p>
                          </div>

                          {/* Mother's Name */}
                          <div className="flex flex-col md:flex-row md:items-center gap-y-2 gap-x-8">
                            <label
                              htmlFor="mother_name"
                              className="block font-semibold text-[1em] md:w-1/3 text-gray-700"
                            >
                              Mother's Name :
                            </label>
                            <p className="text-gray-700 relative top-2  md:w-[60%] ">
                              {formDataForSecond.mother_name || ""}
                            </p>
                          </div>

                          {/* Father's Email */}
                          <div className="flex flex-col md:flex-row md:items-center gap-y-2 gap-x-8">
                            <label
                              htmlFor="father_email"
                              className="block font-semibold text-[1em] md:w-1/3 text-gray-700"
                            >
                              Father's Email :
                            </label>
                            <p className="text-gray-700 relative top-2  md:w-[60%] ">
                              {formDataForSecond.father_email || ""}
                            </p>
                          </div>

                          {/* Father's Phone */}
                          <div className="flex flex-col md:flex-row md:items-center gap-y-2 gap-x-8">
                            <label
                              htmlFor="father_phone"
                              className="block font-semibold text-[1em] md:w-1/3 text-gray-700"
                            >
                              Father's Phone :
                            </label>
                            <p className="text-gray-700 relative top-2  md:w-[60%] ">
                              {formDataForSecond.father_phone || ""}
                            </p>
                          </div>

                          {/* Mother's Email */}
                          <div className="flex flex-col md:flex-row md:items-center gap-y-2 gap-x-8">
                            <label
                              htmlFor="mother_email"
                              className="block font-semibold text-[1em] md:w-1/3 text-gray-700"
                            >
                              Mother's Email :
                            </label>
                            <p className="text-gray-700 relative top-2  md:w-[60%] ">
                              {formDataForSecond.mother_email || ""}
                            </p>
                          </div>

                          {/* Mother's Phone */}
                          <div className="flex flex-col md:flex-row md:items-center gap-y-2 gap-x-8">
                            <label
                              htmlFor="mother_phone"
                              className="block font-semibold text-[1em] md:w-1/3 text-gray-700"
                            >
                              Mother's Phone :
                            </label>
                            <p className="text-gray-700 relative top-2  md:w-[60%] ">
                              {formDataForSecond.mother_phone || ""}
                            </p>
                          </div>

                          {/* User ID */}
                          <div className="flex flex-col md:flex-row md:items-center gap-y-2 gap-x-8">
                            <label
                              htmlFor="user_id"
                              className="block font-semibold text-[1em] md:w-1/3 text-gray-700"
                            >
                              User ID :
                            </label>
                            <p className="text-gray-700 relative top-2  md:w-[60%] ">
                              {formDataForSecond.user_id || ""}
                            </p>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiblingMapping;
