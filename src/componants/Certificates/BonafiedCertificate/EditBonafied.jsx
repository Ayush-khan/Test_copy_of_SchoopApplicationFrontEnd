// Try UP
import { useState, useEffect, useMemo } from "react";
// import debounce from "lodash/debounce";
import LoaderStyle from "../../common/LoaderFinal/LoaderStyle";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useLocation } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
// import { RxCross1 } from "react-icons/rx";

const EditBonafied = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [nameError, setNameError] = useState("");
  const [selectedClass, setSelectedClass] = useState(null);
  const [parentInformation, setParentInformation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingForSearchAcy, setLoadingForSearchAcy] = useState(false);
  const getCookie = (name) => {
    const cookieValue = document.cookie
      .split("; ")
      .find((row) => row.startsWith(name + "="));
    return cookieValue ? cookieValue.split("=")[1] : null;
  };
  const sortNameCookie = getCookie("short_name");

  const navigate = useNavigate();
  const location = useLocation();
  const { student } = location.state || {};
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

  const section_id =
    location.state?.section_id || location.state?.student?.section_id || null;
  console.log("edit page bonafied student for back navigation:", section_id);

  // Fetch initial data on component load
  // useEffect(() => {
  //   const fetchInitialData = async () => {
  //     try {
  //       setLoading(true); // Start loading
  //       const token = localStorage.getItem("authToken");

  //       if (!token) throw new Error("No authentication token found");

  //       const response = await axios.get(
  //         `${API_URL}/api/get_databonafidestudent/${student?.sr_no}`,
  //         {
  //           headers: { Authorization: `Bearer ${token}` },
  //         }
  //       );

  //       if (response?.data?.data) {
  //         const fetchedData = response.data.data; // Extract the data

  //         setParentInformation(fetchedData); // Assuming response data contains form data

  //         // Populate formData with the fetched data
  //         setFormData({
  //           sr_no: fetchedData.sr_no || "",
  //           date: today || "", // Directly from the fetched data
  //           stud_name: fetchedData.stud_name || "",
  //           dob: fetchedData.dob || "",
  //           dob_words: fetchedData.dob_words || " ",
  //           issue_date_bonafide: fetchedData.issue_date_bonafide || "",
  //           father_name: fetchedData.father_name || "",
  //           class_division: fetchedData.class_division || "",
  //           academic_yr: fetchedData.academic_yr || "",
  //           IsGenerated: fetchedData.IsGenerated || "",
  //           IsDeleted: fetchedData.IsDeleted || "",
  //           IsIssued: fetchedData.IsIssued || "",
  //           stud_id: fetchedData.stud_id || "",
  //           purpose: fetchedData.purpose || " ",
  //           nationality: fetchedData.nationality || "",

  //           // Add other fields as needed
  //         });
  //       } else {
  //         toast.error("Failed to load data");
  //       }
  //     } catch (error) {
  //       console.error("Error fetching initial data:", error);
  //       toast.error("Error fetching initial data");
  //     } finally {
  //       setLoading(false); // Stop loading
  //     }
  //   };

  //   fetchInitialData();
  // }, []);
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");

        if (!token) throw new Error("No authentication token found");

        const response = await axios.get(
          `${API_URL}/api/get_databonafidestudent/${student?.sr_no}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response?.data?.data) {
          const data = response.data.data;

          setParentInformation(data); // optional but you may use it

          const baseFormData = {
            sr_no: data.sr_no || "",
            date: data.issue_date_bonafide || today,
            stud_name: data.stud_name || "",
            father_name: data.father_name || "",
            mother_name: "",
            dob: data.dob || "",
            dob_words: data.dob_words || "",
            class_division: data.class_division || "",
            purpose: data.purpose || "",
            nationality: data.nationality || "",
            reg_no: "",
            religion: "",
            caste: "",
            subcaste: "",
            birth_place: "",
            state: "",
            permant_add: "",
            stud_id: data.stud_id || "",
            academic_yr: data.academic_yr || "",
            IsGenerated: data.IsGenerated || "",
            IsDeleted: data.IsDeleted || "",
            IsIssued: data.IsIssued || "",
          };

          // For HSCS or SACS, fill additional fields
          if (["HSCS", "SACS"].includes(sortNameCookie)) {
            baseFormData.reg_no = data.reg_no || "";
            baseFormData.mother_name = data.mother_name || "";
            baseFormData.religion = data.religion || "";
            baseFormData.caste = data.caste || "";
            baseFormData.subcaste = data.subcaste || "";
            baseFormData.birth_place = data.birth_place || "";
            baseFormData.state = data.state || "";
            baseFormData.permant_add = data.permant_add || "";
          }

          setFormData(baseFormData);
        } else {
          toast.error("Failed to load data");
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast.error("Error fetching initial data");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

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

  // const validate = () => {
  //   const newErrors = {};

  //   // Validate name
  //   if (!formData.stud_name) newErrors.stud_name = "Name is required";
  //   else if (!/^[^\d].*/.test(formData.stud_name))
  //     newErrors.stud_name = "Name should not start with a number";

  //   // Validate name
  //   if (!formData.father_name) newErrors.father_name = "Name is required";
  //   else if (!/^[^\d].*/.test(formData.father_name))
  //     newErrors.father_name = "Name should not start with a number";
  //   // Validate academic qualifications (now a single text input)
  //   if (!formData.class_division)
  //     newErrors.class_division = "Class and Division is required";
  //   if (!formData.sr_no) newErrors.sr_no = "Serial number is required";

  //   // Validate dob
  //   if (!formData.dob) newErrors.dob = "Date of Birth is required";
  //   if (!formData.father_name)
  //     newErrors.father_name = "Father Name is required";

  //   // Validate date of joining
  //   if (!formData.date) newErrors.date = " Date is required";

  //   // Validate Employee Id
  //   if (!formData.purpose) newErrors.purpose = "purpose is required";
  //   // Validate address
  //   if (!formData.dob_words)
  //     newErrors.dob_words = "  Birth date in words is required";
  //   if (!formData.nationality)
  //     newErrors.nationality = "Nationality is required";

  //   setErrors(newErrors);
  //   return newErrors;
  // };

  // Handle change for form fields

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
  // ---------- Handle Change / On Field Update ----------
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
    if (!isHSCS && !formData.purpose) {
      errors.purpose = "This field is required";
    }
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

  // Inside your component
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
      const response = await axios.put(
        `${API_URL}/api/update_bonafidecertificate/${student?.sr_no}`,
        formattedFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob", // Set response type to blob to handle PDF data
        }
      );

      if (response.status === 200) {
        toast.success("Bonafide Certificate updated successfully!");

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
        setTimeout(() => setParentInformation(null), 3000);

        // Navigate to the desired route after successful update
        navigate("/bonafiedCertificates");
      }
    } catch (error) {
      console.error("Error:", error.response.data, error.response.sr_no);
      toast.error("An error occurred while updating the Bonafide Certificate.");

      if (error.response && error.response) {
        setBackendErrors(error.response || {});
      } else {
        toast.error(error.response.sr_no);
      }
    } finally {
      setLoading(false); // Stop loadings
    }
  };

  return (
    <div className=" w-full  md:w-[70%] mx-auto py-4 p-4 px-4  ">
      <ToastContainer />
      {loading && (
        <div className="fixed  inset-0 z-50   flex items-center justify-center bg-gray-700 bg-opacity-50">
          <LoaderStyle />
        </div>
      )}{" "}
      <div className="    card  px-3 rounded-md ">
        {/* <div className="card p-4 rounded-md "> */}
        <div className=" card-header mb-4 flex justify-between items-center  ">
          <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
            Edit Bonafied Certificate
          </h5>

          {/* <RxCross1
            className="float-end relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
            onClick={() => {
              setErrors({});
              navigate("/bonafiedCertificates", { state: { section_id } });
            }}
          /> */}
          <RxCross1
            className="float-end relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
            onClick={() => {
              setErrors({});
              if (section_id) {
                navigate("/bonafiedCertificates", { state: { section_id } });
              } else {
                navigate("/bonafiedCertificates"); // fallback
              }
            }}
          />
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
        {loadingForSearchAcy && (
          <div className="fixed  inset-0 z-50   flex items-center justify-center bg-gray-700 bg-opacity-50">
            <LoaderStyle />
          </div>
        )}{" "}
        <form
          onSubmit={handleSubmit}
          className="  border-1 overflow-x-hidden shadow-md p-2 bg-gray-100 mb-4"
        >
          <div className=" flex flex-col gap-4 md:grid  md:grid-cols-3 md:gap-x-14 md:mx-10 gap-y-1 pt-4 pb-4">
            <div className=" ">
              <label htmlFor="sr_no" className="block font-bold  text-xs mb-2">
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
                <div className="text-red-500 text-xs ml-2">{errors.sr_no}</div>
              )}
            </div>

            {sortNameCookie === "HSCS" && (
              // Purpose input field here
              <div>
                <label
                  htmlFor="reg_no"
                  className="block font-bold text-xs mb-2"
                >
                  General Register No. <span className="text-red-500">*</span>
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
                <span className="text-red-500 text-xs ml-2">{errors.date}</span>
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
              <label htmlFor="dob" className="block font-bold text-xs mb-2">
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
                <div className="text-red-500 text-xs ml-2">{errors.dob}</div>
              )}
            </div>

            <div>
              <label
                htmlFor="dob_words"
                className="block font-bold  text-xs mb-2"
              >
                Birth date in words <span className="text-red-500">*</span>
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
                  "Update"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBonafied;
