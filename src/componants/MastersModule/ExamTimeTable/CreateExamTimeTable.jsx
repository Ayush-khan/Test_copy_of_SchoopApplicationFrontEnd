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
  const [selectedClass, setSelectedClass] = useState(null);
  const [parentInformation, setParentInformation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingForSearch, setLoadingForSearch] = useState(false);

  const navigate = useNavigate();

  // for form
  const [errors, setErrors] = useState({});
  const [backendErrors, setBackendErrors] = useState({});

  // State for loading indicators
  const [loadingClasses, setLoadingClasses] = useState(false);
  // const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingExams, setLoadingExams] = useState(false);
  const [classError, setClassError] = useState("");
  const [studentError, setStudentError] = useState("");

  const [dates, setDates] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [timetable, setTimetable] = useState([]);
  useEffect(() => {
    // Fetch both classes and exams when the component mounts
    fetchSubjects();
    fetchClasses();
    fetchExams();
  }, []);

  // Fetch subjects
  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/get_subjectsofallstudents/${classIdForSearch}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSubjects(response.data.data || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };
  const fetchClasses = async () => {
    try {
      setLoadingClasses(true);

      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${API_URL}/api/getClassList`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(response.data)) {
        setClassesforForm(response.data);
        console.log(
          "this is the dropdown of the allot subject tab for class",
          response.data
        );
      } else {
        toast.Error("Unexpected data format");
      }
    } catch (error) {
      toast.error("Error fetching classes.");
      console.error("Error fetching classes:", error);
    } finally {
      setLoadingClasses(false);
    }
  };

  const fetchExams = async () => {
    try {
      setLoadingExams(true);
      const token = localStorage.getItem("authToken");

      const response = await axios.get(`${API_URL}/api/get_Examslist`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStudentNameWithClassId(response.data || []);
    } catch (error) {
      toast.error("Error fetching exams.");
      console.error("Error fetching exams:", error);
    } finally {
      setLoadingExams(false);
    }
  };

  const handleClassSelect = (selectedOption) => {
    setSelectedClass(selectedOption);
    setClassError(""); // Reset error if class is selected

    setClassIdForSearch(selectedOption?.value);
    // fetchStudentNameWithClassId(selectedOption?.value);
  };

  const handleStudentSelect = (selectedOption) => {
    setStudentError(""); // Reset error if student is selected
    setSelectedStudent(selectedOption);
    setSelectedStudentId(selectedOption?.value);
  };

  // Dropdown options
  const classOptions = useMemo(
    () =>
      classesforForm.map((cls) => ({
        value: cls.class_id,
        label: `${cls?.name}`,
        key: `${cls.class_id}`,
      })),
    [classesforForm]
  );

  const studentOptions = useMemo(
    () =>
      studentNameWithClassId.map((stu) => ({
        value: stu.exam_id,
        label: `${stu?.name}`,
      })),
    [studentNameWithClassId]
  );

  // Generate dates from start_date to end_date
  const generateDates = (startDate, endDate) => {
    const start = moment(startDate);
    const end = moment(endDate);
    const dateArray = [];

    while (start <= end) {
      dateArray.push(start.format("YYYY-MM-DD"));
      start.add(1, "day");
    }
    return dateArray;
  };
  // Handle search and fetch parent information
  const handleSearch = async () => {
    let valid = true;

    // Check if selectedClass is empty and set the error message
    if (!selectedClass) {
      setClassError("Please select Class.");
      valid = false;
    } else {
      setClassError(""); // Reset error if class is selected
    }

    // Check if selectedStudent is empty and set the error message
    if (!selectedStudent) {
      setStudentError("Please select Exam.");
      valid = false;
    } else {
      setStudentError(""); // Reset error if student is selected
    }

    if (!valid) {
      setLoadingForSearch(false);

      return;
    } // Stop if any validation fails
    try {
      setLoadingForSearch(true); // Start loading

      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/api/exams/${selectedStudentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response?.data) {
        const { start_date, end_date } = response.data;
        setParentInformation(response.data);

        // Generate dates and initialize timetable rows
        const dateRange = generateDates(start_date, end_date);
        setDates(dateRange);
        setTimetable(
          dateRange.map((date) => ({
            date,
            subjects: Array(4).fill(""), // Initialize 4 empty subjects
            option: "Select",
            studyLeave: false,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching exam data:", error);
    } finally {
      setLoadingForSearch(false);
    }
  };

  // Update timetable on changes
  const updateTimetable = (index, field, value) => {
    const updatedTimetable = [...timetable];
    updatedTimetable[index][field] = value;

    // Clear subjects if studyLeave is checked
    if (field === "studyLeave" && value) {
      updatedTimetable[index].subjects = Array(4).fill("");
    }

    setTimetable(updatedTimetable);
  };

  // For FOrm
  const validate = () => {
    const newErrors = {};

    setErrors(newErrors);
    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validate();
    const errorsToCheck = validationErrors || {};

    if (Object.keys(errorsToCheck).length > 0) {
      setErrors(errorsToCheck);
      return;
    }

    try {
      setLoading(true); // Start loading

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token is found");
      }

      // Make an API call with the "blob" response type to download the PDF
      const response = await axios.post(
        `${API_URL}/api/save_pdfsimplebonafide`,
        formData,
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
                  Class <span className="text-red-500">*</span>
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
                  {classError && (
                    <div className="h-8 relative ml-1 text-danger text-xs">
                      {classError}
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full gap-x-2 relative left-0 md:-left-[7%] justify-around md:w-[85%] my-1 md:my-4 flex md:flex-row">
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
                    placeholder={loadingExams ? "Loading exams..." : "Select"}
                    isSearchable
                    isClearable
                    className="text-sm"
                    isDisabled={loadingExams}
                  />
                  {studentError && (
                    <div className="h-8 relative ml-1 text-danger text-xs">
                      {studentError}
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
          <>
            <table className="table-auto w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border p-2">Date</th>
                  <th className="border p-2">Subject 1</th>
                  <th className="border p-2">Subject 2</th>
                  <th className="border p-2">Subject 3</th>
                  <th className="border p-2">Subject 4</th>
                  <th className="border p-2">Option</th>
                  <th className="border p-2">Study Leave</th>
                </tr>
              </thead>
              <tbody>
                {timetable.map((row, index) => (
                  <tr key={index}>
                    <td className="border p-2">{row.date}</td>
                    {row.subjects.map((subject, subIndex) => (
                      <td className="border p-2" key={subIndex}>
                        <select
                          className="w-full border p-1"
                          value={subject}
                          onChange={(e) =>
                            updateTimetable(index, "subjects", [
                              ...row.subjects.slice(0, subIndex),
                              e.target.value,
                              ...row.subjects.slice(subIndex + 1),
                            ])
                          }
                          disabled={row.studyLeave}
                        >
                          <option value="">Select</option>
                          {subjects.map((sub) => (
                            <option key={sub.sub_rc_master_id} value={sub.name}>
                              {sub.name}
                            </option>
                          ))}
                        </select>
                      </td>
                    ))}
                    <td className="border p-2">
                      <select
                        className="w-full border p-1"
                        value={row.option}
                        onChange={(e) =>
                          updateTimetable(index, "option", e.target.value)
                        }
                      >
                        <option value="Select">Select</option>
                        <option value="OR">OR</option>
                        <option value="AND">AND</option>
                      </select>
                    </td>
                    <td className="border p-2 text-center">
                      <input
                        type="checkbox"
                        checked={row.studyLeave}
                        onChange={(e) =>
                          updateTimetable(index, "studyLeave", e.target.checked)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>{" "}
            <div className="w-full border-4 text-right">
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
          </>
        )}
      </div>
    </div>
  );
};

export default CreateExamTimeTable;
