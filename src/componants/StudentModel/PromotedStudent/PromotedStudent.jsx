import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";

const PromotedStudent = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudentForStudent, setSelectedStudentForStudent] =
    useState(null);
  const [classesforForm, setClassesforForm] = useState([]);
  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
  const [
    studentNameWithClassIdForStudent,
    setStudentNameWithClassIdForStudent,
  ] = useState([]);

  const [classIdForSearch, setClassIdForSearch] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [classIdForSearchForStudent, setClassIdForSearchForStudent] =
    useState(null);
  const [selectedStudentIdForStudent, setSelectedStudentIdForStudent] =
    useState(null);
  const [nameError, setNameError] = useState("");
  const [nameErrorForClass, setNameErrorForClass] = useState("");
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedClassForStudent, setSelectedClassForStudent] = useState(null);
  const [parentInformation, setParentInformation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingForSearch, setLoadingForSearch] = useState(false);

  const navigate = useNavigate();

  // for form
  const [errors, setErrors] = useState({});
  const [backendErrors, setBackendErrors] = useState({});

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
      const [classResponse] = await Promise.all([
        axios.get(`${API_URL}/api/getClassList`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Set the fetched data
      setClassesforForm(classResponse.data || []);
      //   setStudentNameWithClassId(studentResponse?.data?.data || []);
    } catch (error) {
      toast.error("Error fetching Class data.");
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
        `${API_URL}/api/get_divisions/${section_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setStudentNameWithClassId(response?.data?.divisions || []);
    } catch (error) {
      toast.error("Error fetching Divisions.");
    } finally {
      setLoadingStudents(false);
    }
  };
  const fetchStudentNameWithClassIdForStudent = async (section_id = null) => {
    try {
      setLoadingStudents(true);

      const params = section_id ? { section_id } : {};
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/get_divisions/${section_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setStudentNameWithClassIdForStudent(response?.data?.divisions || []);
    } catch (error) {
      toast.error("Error fetching Divisions.");
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleClassSelect = (selectedOption) => {
    setNameErrorForClass("");
    setSelectedClass(selectedOption);
    setSelectedStudent(null);
    setSelectedStudentId(null);
    setClassIdForSearch(selectedOption?.value);
    fetchStudentNameWithClassId(selectedOption?.value);
  };
  const handleClassSelectForStudent = (selectedOption) => {
    setNameErrorForClass("");
    setSelectedClassForStudent(selectedOption);
    setSelectedStudentForStudent(null);
    setSelectedStudentIdForStudent(null);
    setClassIdForSearchForStudent(selectedOption?.value);
    fetchStudentNameWithClassIdForStudent(selectedOption?.value);
  };

  const handleStudentSelect = (selectedOption) => {
    setNameError(""); // Reset student error on selection
    setSelectedStudent(selectedOption);
    setSelectedStudentId(selectedOption?.value);
  };
  const handleStudentSelectForStudent = (selectedOption) => {
    setNameError(""); // Reset student error on selection
    setSelectedStudentForStudent(selectedOption);
    setSelectedStudentIdForStudent(selectedOption?.value);
  };

  // Dropdown options
  const classOptions = useMemo(
    () =>
      classesforForm.map((cls) => ({
        value: cls.class_id,
        label: `${cls.name}`,
        key: `${cls.class_id}`,
      })),
    [classesforForm]
  );

  const studentOptions = useMemo(
    () =>
      studentNameWithClassId.map((stu) => ({
        value: stu.section_id,
        label: `${stu?.name}`,
      })),
    [studentNameWithClassId]
  );
  const studentOptionsForStudent = useMemo(
    () =>
      studentNameWithClassIdForStudent.map((stu) => ({
        value: stu.section_id,
        label: `${stu?.name}`,
      })),
    [studentNameWithClassId]
  );

  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      // Select all students
      const allStudentIds = parentInformation.map(
        (student) => student.student_id
      );
      setSelectedStudents(allStudentIds);
    } else {
      // Deselect all students
      setSelectedStudents([]);
    }
  };

  const handleCheckboxChange = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const handleSearch = async () => {
    // Reset error messages
    setNameError("");
    setNameErrorForClass("");
    setErrors({}); // Clears all field-specific errors

    let hasError = false;
    if (!selectedClass) {
      setNameErrorForClass("Please select a class.");
      hasError = true;
    }
    if (!selectedStudent) {
      setNameError("Please select a division.");
      hasError = true;
    }

    // If there are validation errors, exit the function
    if (hasError) return;
    // Reset form data and selected values after successful submission

    try {
      setLoadingForSearch(true); // Start loading
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/api/getstudentlistbyclassdivision/${classIdForSearch}/${selectedStudentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Check if data was received and update the form state
      if (response?.data?.data) {
        const fetchedData = response?.data?.data; // Extract the data
        setParentInformation(response?.data?.data); // Assuming response data contains form data

        // Populate formData with the fetched data
      } else {
        console.log("reponse", response.data.status);

        toast.error("No data found for the selected class and divisoin.");
      }
    } catch (error) {
      console.log("error is", error);
      console.log("error is", error.response);
    } finally {
      setLoadingForSearch(false);
    }
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

      <div className="md:mx-auto md:w-3/4 p-4 bg-white mt-4 ">
        <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
          Promote Students
        </h3>
        <div
          className=" relative  mb-8   h-1  mx-auto bg-red-700"
          style={{
            backgroundColor: "#C03078",
          }}
        ></div>
        <div className="     w-full md:container mt-4">
          {/* Search Section */}
          <div className=" w-full md:w-[75%] border-1 flex justify-center flex-col md:flex-row gap-x-1  bg-white rounded-lg    mx-auto mt-1 p-2 ">
            <div className="w-full md:w-[99%] flex md:flex-row justify-between items-center">
              <div className="w-full  flex flex-col gap-y-2 md:gap-y-0 md:flex-row">
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
                    {nameErrorForClass && (
                      <div className="h-8 relative ml-1 text-danger text-xs">
                        {nameErrorForClass}
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-full gap-x-6 relative left-0 md:-left-[5%] justify-between md:w-[75%] my-1 md:my-4 flex md:flex-row">
                  <label
                    className="md:w-[40%] text-md mt-1.5"
                    htmlFor="studentSelect"
                  >
                    Division <span className="text-red-500">*</span>
                  </label>
                  <div className="w-full md:w-[80%]">
                    <Select
                      id="studentSelect"
                      value={selectedStudent}
                      onChange={handleStudentSelect}
                      options={studentOptions}
                      disabled={!selectedClass} // Disable division until class is selected
                      placeholder={
                        loadingStudents ? "Loading divisions..." : "Select"
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
            <div className="w-full md:container mx-auto py-4 px-4">
              <div className="card px-3 rounded-md">
                <div className="card-header mb-4 flex justify-between items-center">
                  <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
                    Student Information
                  </h5>
                </div>
                <div
                  className="relative w-full -top-6 h-1 mx-auto bg-red-700"
                  style={{ backgroundColor: "#C03078" }}
                ></div>
                <p className="text-[.9em] md:absolute md:right-5 md:top-[14%] text-gray-500">
                  <span className="text-red-500">*</span> indicates mandatory
                  information
                </p>
                <div className=" w-full md:w-[75%] border-1 flex justify-center flex-col md:flex-row gap-x-1  bg-white rounded-lg    mx-auto mt-1 p-2 ">
                  <div className="w-full md:w-[99%] flex md:flex-row justify-between items-center">
                    <div className="w-full  flex flex-col gap-y-2 md:gap-y-0 md:flex-row">
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
                            value={selectedClassForStudent}
                            onChange={handleClassSelectForStudent}
                            options={classOptions}
                            placeholder={
                              loadingClasses ? "Loading classes..." : "Select"
                            }
                            isSearchable
                            isClearable
                            className="text-sm"
                            isDisabled={loadingClasses}
                          />
                          {nameErrorForClass && (
                            <div className="h-8 relative ml-1 text-danger text-xs">
                              {nameErrorForClass}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="w-full gap-x-6 relative left-0 md:-left-[5%] justify-between md:w-[75%] my-1 md:my-4 flex md:flex-row">
                        <label
                          className="md:w-[40%] text-md mt-1.5"
                          htmlFor="studentSelect"
                        >
                          Division <span className="text-red-500">*</span>
                        </label>
                        <div className="w-full md:w-[80%]">
                          <Select
                            id="studentSelect"
                            value={selectedStudentForStudent}
                            onChange={handleStudentSelectForStudent}
                            options={studentOptionsForStudent}
                            disabled={!selectedClassForStudent} // Disable division until class is selected
                            isSearchable
                            isClearable
                            className="text-sm"
                            // isDisabled={loadingStudents}
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
                {/* Student Table */}
                <table className="w-full mt-4 border border-gray-300">
                  <thead>
                    <tr className="bg-gray-200 text-left">
                      <th className="px-4 py-2">Select</th>
                      <th className="px-4 py-2">Roll Number</th>
                      <th className="px-4 py-2">Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parentInformation.map((student) => (
                      <tr
                        key={student.student_id}
                        className="hover:bg-gray-100"
                      >
                        <td className="px-4 py-2">
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(
                              student.student_id
                            )}
                            onChange={() =>
                              handleCheckboxChange(student.student_id)
                            }
                          />
                        </td>
                        <td className="px-4 py-2">
                          {student.roll_no === 0 ? "0" : student.roll_no || ""}
                        </td>
                        <td className="px-4 py-2">
                          {student.first_name} {student.mid_name}{" "}
                          {student.last_name}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Selected Students */}
                {selectedStudents.length > 0 && (
                  <div className="mt-4">
                    <p className="text-gray-600">
                      Selected Students: {selectedStudents.length}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromotedStudent;
