import { useState, useEffect, useMemo } from "react";
// import debounce from "lodash/debounce";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
// import { RxCross1 } from "react-icons/rx";

const CreatePercentageCertificate = () => {
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
  const [marks, setMarks] = useState({});

  const [total, setTotal] = useState(0);
  const [percentage, setPercentage] = useState(0);

  const maxInputLength = 3;
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    sr_no: "",
    roll_no: "",
    date: "",
    stud_name: "",
    stud_id: "",
    // student_UID: "",
    class_division: "",

    teacher_image_name: null,
  });

  // for form
  const [errors, setErrors] = useState({});
  const [backendErrors, setBackendErrors] = useState({});

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
      classesforForm
        .filter((cls) => cls?.get_class?.class_id > 108) // filter classes with class_id > 100
        .map((cls) => ({
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

  //   const handleMarksChange = (id, value) => {
  //     setMarks((prevMarks) => ({
  //       ...prevMarks,
  //       [id]: value,
  //     }));
  //   };

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
      roll_no: "",
      date: "",
      stud_name: "",
      stud_id: " ",
      // student_UID: "",
      class_division: "",

      // stu_aadhaar_no: "",
      teacher_image_name: null,
    });
    setMarks({});
    setTotal(0);
    setPercentage(0);

    try {
      setLoadingForSearch(true); // Start loading
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/api/get_srnopercentagebonafide/${selectedStudentId}`,
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
          classsubject: fetchedData.classsubject || "",
          sr_no: fetchedData.sr_no || "",
          roll_no: fetchedData.studentinformation.roll_no || "",
          date: today || "", // Directly from the fetched data
          stud_name: `${fetchedData.studentinformation?.first_name || ""} ${
            fetchedData.studentinformation?.mid_name || ""
          } ${fetchedData.studentinformation?.last_name || ""}`,
          stud_id: fetchedData.studentinformation.student_id || " ",
          class_division:
            `${fetchedData.studentinformation.classname}-${fetchedData.studentinformation.sectionname}` ||
            "",
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

  // Handle change for form fields
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    let fieldErrors = {};

    // Individual field validation logic
    if (name === "stud_name") {
      if (!value) {
        fieldErrors.stud_name = "Student name is required";
      } else if (/^\d/.test(value)) {
        fieldErrors.stud_name = "Student name should not start with a number";
      }
    }

    // Required fields list
    const requiredFields = [
      "roll_no",
      "date",
      //   "stud_name",
      "class_division",
      "roll_no",
    ];

    // Check if the field is required and empty
    if (!value && requiredFields.includes(name)) {
      fieldErrors[name] = `${name.replace(/_/g, " ")} is required`;
    }

    setErrors((prevErrors) => ({ ...prevErrors, [name]: fieldErrors[name] }));
  };

  const handleMarksChange = (id, value) => {
    // Update the errors state based on validation
    if (!value) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [id]: "Marks are required.",
      }));
    } else if (!/^\d+$/.test(value)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [id]: "Marks should be numeric.",
      }));
    } else if (value.length > 3) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [id]: "Marks cannot exceed 3 characters.",
      }));
    } else {
      // Remove the error if input is valid
      setErrors((prevErrors) => ({
        ...prevErrors,
        [id]: "",
      }));
    }

    // Convert value to an integer if valid
    const numericValue = parseInt(value, 10) || 0;
    setMarks((prevMarks) => {
      const updatedMarks = { ...prevMarks, [id]: numericValue };

      // Calculate total
      const totalMarks = Object.values(updatedMarks).reduce(
        (acc, mark) => acc + mark,
        0
      );
      setTotal(totalMarks);

      // Calculate percentage if there are subjects
      const subjectCount = formData.classsubject?.length || 0;
      const calculatedPercentage =
        subjectCount > 0 ? (totalMarks / (subjectCount * 100)) * 100 : 0;
      setPercentage(calculatedPercentage.toFixed(2));

      return updatedMarks;
    });
  };

  const prepareSubmissionData = () => {
    const formattedMarks = Object.entries(marks).map(([id, mark]) => ({
      c_sm_id: parseInt(id),
      marks: parseInt(mark),
    }));

    const submissionData = {
      roll_no: formData.roll_no,
      stud_name: formData.stud_name,
      class_division: formData.class_division,
      percentage,
      total,
      stud_id: formData.stud_id,
      class: formattedMarks,
      date: today,
    };

    return submissionData;
  };
  const validate = () => {
    const newErrors = {};

    // Required fields validation with error messages
    const requiredFields = [
      "roll_no",
      "date",
      "stud_name",
      "class_division",
      "roll_no",
      //   "stud_id",
    ];

    // Check for empty required fields
    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = `${field.replace(/_/g, " ")} is required.`;
      }
    });

    // Validate marks for each subject
    formData.classsubject?.forEach((subject) => {
      const markValue = marks[subject.c_sm_id];
      console.log("markds", markValue);
      if (markValue === undefined || markValue === "" || markValue === 0) {
        newErrors[subject.c_sm_id] = `${subject.name} marks are required.`;
      } else if (!/^\d+$/.test(markValue)) {
        newErrors[subject.c_sm_id] = `${subject.name} marks should be numeric.`;
      } else if (markValue.toString().length > 3) {
        newErrors[
          subject.c_sm_id
        ] = `${subject.name} marks cannot exceed 3 characters.`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    // const formattedFormData = {
    //   ...formData,
    //   date: formatDateString(formData.date),
    // };
    const dataToSubmit = prepareSubmissionData();
    console.log("dataTosubmkit", dataToSubmit);
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      const response = await axios.post(
        `${API_URL}/api/save_pdfpercentagebonafide`,
        dataToSubmit,
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
          roll_no: "",
          date: "",
          stud_name: "",
          stud_id: "",
          class_division: "",
        });
        setMarks({});
        setTotal(0);
        setPercentage(0);
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

  return (
    <div className="">
      <ToastContainer />
      <div className="     w-full md:container mt-4">
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
                    Student Details
                    {/* </legend> */}
                  </h5>
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
                        className="input-field block border w-full border-gray-900 rounded-md py-1 px-3 bg-gray-200 shadow-inner"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="roll_no"
                        className="block font-bold text-xs mb-2"
                      >
                        Roll No. <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="roll_no"
                        name="roll_no"
                        maxLength={10}
                        value={formData.roll_no}
                        onChange={handleChange}
                        className="input-field block border w-full border-gray-900 rounded-md py-1 px-3 bg-white shadow-inner"
                      />
                      {errors.roll_no && (
                        <span className="text-red-500 text-xs ml-2 h-1">
                          {errors.roll_no}
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
                        className="input-field block border w-full border-gray-900 rounded-md py-1 px-3 bg-white shadow-inner"
                      />
                      {errors.date && (
                        <span className="text-red-500 text-xs ml-2 h-1">
                          {errors.date}
                        </span>
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
                        className="block  border w-full border-gray-900 rounded-md py-1 px-3  bg-white shadow-inner"
                      />
                      {errors.stud_name && (
                        <div className="text-red-500 text-xs ml-2 ">
                          {errors.stud_name}
                        </div>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="class_division"
                        className="block font-bold text-xs mb-2"
                      >
                        Class/Division <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="class_division"
                        name="class_division"
                        value={formData.class_division}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            class_division: e.target.value,
                          })
                        }
                        readOnly
                        className="input-field block border w-full border-gray-900 rounded-md py-1 px-3 bg-gray-200 shadow-inner"
                      />
                      {errors.class_division && (
                        <span className="text-red-500 text-xs ml-2 h-1">
                          {errors.class_division}
                        </span>
                      )}
                    </div>
                  </div>
                </fieldset>
                {/* Student Identity */}

                {/* Parent Details */}

                <fieldset className="mb-4">
                  <h5 className="col-span-4 text-blue-400 py-2">
                    Academic Performance{" "}
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Dynamically generated input fields for subjects */}
                    {formData.classsubject?.map((subject) => (
                      <div key={subject.c_sm_id}>
                        <label
                          htmlFor={`subject-${subject.c_sm_id}`}
                          className="block font-bold text-xs mb-2"
                        >
                          {subject.name} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          id={`subject-${subject.c_sm_id}`}
                          name={`subject-${subject.c_sm_id}`}
                          //   placeholder="Enter marks"
                          value={marks[subject.c_sm_id] || ""}
                          onChange={(e) =>
                            handleMarksChange(subject.c_sm_id, e.target.value)
                          }
                          maxLength={3}
                          className="block  border w-full border-gray-900 rounded-md py-1 px-3  bg-white shadow-inner"
                        />
                        {errors[subject.c_sm_id] && (
                          <span className="text-red-500 text-xs ml-2">
                            {errors[subject.c_sm_id]}
                          </span>
                        )}
                      </div>
                    ))}

                    {/* Total and Percentage Fields */}
                    <div>
                      <label
                        htmlFor="total"
                        className="block font-bold text-xs mb-2"
                      >
                        Total
                      </label>
                      <input
                        type="number"
                        id="total"
                        name="total"
                        value={total}
                        readOnly
                        className="input-field block border w-full border-gray-900 rounded-md py-1 px-3 bg-gray-200 shadow-inner"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="percentage"
                        className="block font-bold text-xs mb-2"
                      >
                        Percentage
                      </label>
                      <input
                        type="number"
                        id="percentage"
                        name="percentage"
                        value={percentage}
                        readOnly
                        className="input-field block border w-full border-gray-900 rounded-md py-1 px-3 bg-gray-200 shadow-inner"
                      />
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
  );
};

export default CreatePercentageCertificate;
