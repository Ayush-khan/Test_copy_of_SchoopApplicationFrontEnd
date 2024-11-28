import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";

const CreateExamTimeTable = () => {
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
    stud_name: "",
    dob: "",
    date: "",
    father_name: "",
    class_division: "",
    professional_qual: "",
    trained: "",
    experience: "",

    religion: "",
    dob_words: "",
    stud_id: "",

    // purpose: " ",
    teacher_image_name: null,
  });

  // for form
  const [errors, setErrors] = useState({});
  const [backendErrors, setBackendErrors] = useState({});

  // Maximum date for date_of_birth
  const MAX_DATE = "2030-12-31";
  const MIN_DATE = "1996-01-01";
  // Get today's date in YYYY-MM-DD format
  // Calculate today's date
  const today = new Date().toISOString().split("T")[0];
  // State for loading indicators
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    // Fetch both classes and student names on component mount
    fetchInitialDataAndStudents();
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

  const handleClassSelect = (selectedOption) => {
    setSelectedClass(selectedOption);
    setSelectedStudent(null);
    setSelectedStudentId(null);
    setClassIdForSearch(selectedOption?.value);
    fetchStudentNameWithClassId(selectedOption?.value);
  };

  const handleStudentSelect = (selectedOption) => {
    setNameError(""); // Reset student error on selection
    setSelectedStudent(selectedOption);
    setSelectedStudentId(selectedOption?.value);
  };

  // Dropdown options
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
        label: `${stu?.first_name} ${stu?.mid_name} ${stu?.last_name}`,
      })),
    [studentNameWithClassId]
  );

  const handleSearch = async () => {
    // Reset error messages
    setNameError("");
    setNameErrorForClass("");
    setErrors({}); // Clears all field-specific errors

    if (!selectedStudent) {
      setNameError("Please select Student Name.");
      toast.error("Please select Student Name.!");
      return;
    }

    setFormData({
      sr_no: "",
      stud_name: "",
      father_name: "",
      dob: "",
      dob_words: "",
      date: "",
      class_division: "",

      // Add other fields here if needed
    });
    try {
      setLoadingForSearch(true); // Start loading
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/api/get_srnosimplebonafide/${selectedStudentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("outsie ");
      // Check if data was received and update the form state
      if (response?.data?.data) {
        const fetchedData = response.data.data;
        setParentInformation(fetchedData);
        console.log("this is isnse");
        // Populate formData with the fetched data
        setFormData({
          sr_no: fetchedData.sr_no || "",
          stud_name: `${fetchedData?.studentinformation?.first_name || ""} ${
            fetchedData?.studentinformation?.mid_name || ""
          } ${fetchedData?.studentinformation?.last_name || ""}`,
          dob: fetchedData.studentinformation.dob || "",
          dob_words: fetchedData.dobinwords || " ",

          // dob_words: convertDateToWords(fetchedData.studentinformation.dob),

          date: today || "",
          father_name: fetchedData.studentinformation.father_name || "",
          class_division:
            `${fetchedData.studentinformation.classname}-${fetchedData.studentinformation.sectionname}` ||
            "",
          professional_qual:
            fetchedData.studentinformation.professional_qual || "",

          religion: fetchedData.religion || "",

          stud_id: fetchedData.studentinformation.student_id || "",
          teacher_image_name:
            fetchedData.studentinformation.teacher_image_name || null,
          // special_sub: fetchedData.studentinformation.special_sub || "",
        });
      } else {
        if (response.data && response.data.status === 403) {
          toast.error(
            "Simple Bonafide Certificate Already Generated. Please go to manage to download the Simple Bonafide Certificate."
          );
        } else {
          // Show a generic error message if the error is not a 403
          toast.error("No data found for the selected student.");
        }
      }
    } catch (error) {
      console.log("error", error);
      toast.error("Error fetching data for the selected student.");
    } finally {
      setLoadingForSearch(false);
    }
  };
  // For FOrm
  const validate = () => {
    const newErrors = {};

    // Validate name
    if (!formData.stud_name) newErrors.stud_name = "Thid field is required";
    else if (!/^[^\d].*/.test(formData.stud_name))
      newErrors.stud_name = "Name should not start with a number";

    // Validate name
    if (!formData.father_name) newErrors.father_name = "Thid field is required";
    else if (!/^[^\d].*/.test(formData.father_name))
      newErrors.father_name = "Name should not start with a number";
    // Validate academic qualifications (now a single text input)
    if (!formData.class_division)
      newErrors.class_division = "Thid field is required";
    if (!formData.sr_no) newErrors.sr_no = "Thid field is required";

    // Validate dob
    if (!formData.dob) newErrors.dob = "Thid field is required";
    if (!formData.father_name) newErrors.father_name = "Thid field is required";

    // Validate date of joining
    if (!formData.date) newErrors.date = "Thid field is required";

    // Validate Employee Id
    // if (!formData.purpose) newErrors.purpose = "purpose is required";
    // Validate address
    if (!formData.dob_words) newErrors.dob_words = "Thid field is required";

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
      if (!newValue) fieldErrors.stud_name = "Thid field is required";
      else if (/^\d/.test(newValue))
        fieldErrors.stud_name = "Name should not start with a number";
    }
    if (name === "father_name") {
      if (!newValue) fieldErrors.father_name = "Thid field is required";
      else if (/^\d/.test(newValue))
        fieldErrors.father_name = "Name should not start with a number";
    }

    // Academic Qualification validation
    if (name === "class_division") {
      if (!newValue) fieldErrors.class_division = "Thid field is required";
    }

    // Date of Birth validation
    if (name === "dob") {
      if (!newValue) fieldErrors.dob = "Thid field is required";
    }
    // serial number

    if (name === "sr_no") {
      if (!newValue) fieldErrors.sr_no = "Thid field is required";
    }
    if (name === "father_name") {
      if (!newValue) fieldErrors.father_name = "Thid field is required";
    }

    // Date of Joining validation
    if (name === "date") {
      if (!newValue) fieldErrors.date = "Thid field is required";
    }

    // Address validation
    if (name === "dob_words") {
      if (!newValue) fieldErrors.dob_words = "Thid field is required";
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
        `${API_URL}/api/save_pdfsimplebonafide`,
        formattedFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob", // Set response type to blob to handle PDF data
        }
      );

      if (response.status === 200) {
        toast.success("Simple Bonafide Certificate Created successfully!");

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
          // purpose: "",

          // Add other fields here if needed
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
      toast.error(
        "An error occurred while Creating the Simple Bonafide Certificate."
      );

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
    <div className="w-[90%] mx-auto p-4 ">
      <ToastContainer />
      <div className="card p-4 rounded-md ">
        <div className=" card-header mb-4 flex justify-between items-center ">
          <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
            Create Exam Timetable
          </h5>

          <RxCross1
            className="float-end relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
            onClick={() => {
              setErrors({});
              navigate("/examTImeTable");
            }}
          />
        </div>
        <div
          className=" relative w-full   -top-6 h-1  mx-auto bg-red-700"
          style={{
            backgroundColor: "#C03078",
          }}
        ></div>

        {/* Search Section */}
        <div className=" w-full md:w-[70%] border-1 drop-shadow-sm  flex justify-center flex-col md:flex-row gap-x-1  bg-white rounded-lg  mt-3 ml-0 md:ml-[2%]   p-2">
          <div className="w-[99%] flex md:flex-row justify-between items-center">
            <div className="w-full flex flex-col gap-y-2 md:gap-y-0 md:flex-row">
              <div className="w-full gap-x-14 md:gap-x-6 md:justify-start my-1 md:my-4 flex md:flex-row">
                <label
                  className="text-md mt-1.5 mr-1 md:mr-0"
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
                    className="text-sm"
                    isDisabled={loadingClasses}
                  />
                </div>
              </div>

              <div className="w-full gap-x-2 relative left-0 md:-left-[7%] justify-around md:w-[85%]  my-1 md:my-4 flex md:flex-row">
                <label
                  className="md:w-[20%] text-md pl-0 md:pl-3 mt-1.5"
                  htmlFor="studentSelect"
                >
                  Exam <span className="text-red-500">*</span>
                </label>
                <div className="w-full md:w-[60%]">
                  <Select
                    id="studentSelect"
                    value={selectedStudent}
                    onChange={handleStudentSelect}
                    options={studentOptions}
                    placeholder={
                      loadingStudents ? "Loading exams..." : "Select"
                    }
                    isSearchable
                    isClearable
                    className="text-sm"
                    isDisabled={loadingStudents}
                  />
                  {nameError && (
                    <div className="h-8 relative ml-1 text-danger text-xs">
                      {nameError}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="search"
                onClick={handleSearch}
                style={{ backgroundColor: "#2196F3" }}
                className={`my-1 md:my-4 btn h-10 w-18 md:w-auto btn-primary text-white font-bold py-1 border-1 border-blue-500 px-4 rounded ${
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
            </div>
          </div>
        </div>

        {/* Form Section - Displayed when parentInformation is fetched */}
        {parentInformation && (
          // <div className="container mx-auto p-4 ">
          <div className=" w-full  md:container mx-auto py-4 p-4 px-4  ">
            <div className="card  px-3 rounded-md ">
              {/* <div className="card p-4 rounded-md "> */}

              <form
                onSubmit={handleSubmit}
                className="   overflow-x-hidden shadow-md  bg-gray-50 my-4"
              >
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
                      className="block  border w-full border-gray-900 rounded-md py-1 px-3  bg-gray-200 outline-none shadow-inner"
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
                      <span className="text-red-500 text-xs ml-2">
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
                      readOnly
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
                      value={formData.father_name}
                      onChange={handleChange}
                      readOnly
                      className="block  border w-full border-gray-900 rounded-md py-1 px-3  bg-gray-200 outline-none shadow-inner"
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
                      readOnly
                      className="block  border w-full border-gray-900 rounded-md py-1 px-3  bg-gray-200 outline-none shadow-inner"
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
                      readOnly
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
                      className="input-field block w-full outline-none border border-gray-900 rounded-md py-1 px-3 bg-gray-200 shadow-inner"
                    />
                    {errors.class_division && (
                      <span className="text-red-500 text-xs ml-2">
                        {errors.class_division}
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

export default CreateExamTimeTable;
