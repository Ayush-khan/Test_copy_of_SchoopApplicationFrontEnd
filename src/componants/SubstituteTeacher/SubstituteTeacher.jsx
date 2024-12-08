import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
import Loader from "../common/LoaderFinal/LoaderStyle";
import { FiPrinter } from "react-icons/fi";

const SubstituteTeacher = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // Format as yyyy-MM-dd
  });
  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
  const [classIdForSearch, setClassIdForSearch] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingForSearch, setLoadingForSearch] = useState(false);
  const [description, setDescription] = useState("");
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  // State for loading indicators
  // const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingExams, setLoadingExams] = useState(false);
  const [studentError, setStudentError] = useState("");
  const [dates, setDates] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [subjects, setSubjects] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [schedule, setSchedule] = useState(
    timetable.map((row) => ({
      ...row,
      errors: { noSubject: false, missingOption: false }, // Initialize error state for each row
    }))
  );
  console.log("scheduleerror", schedule);
  const updatedErrors = [...schedule]; // Clone the schedule to track errors
  updatedErrors.forEach((row) => {
    row.errors = row.errors || { noSubject: false, missingOption: false };
  });
  console.log("updatedErrors", updatedErrors);
  useEffect(() => {
    // Fetch both classes and exams when the component mounts

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

  const fetchExams = async () => {
    try {
      setLoadingExams(true);
      const token = localStorage.getItem("authToken");

      const response = await axios.get(`${API_URL}/api/get_teacher_list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("teacher", response);
      setStudentNameWithClassId(response.data || []);
    } catch (error) {
      toast.error("Error fetching teachers");
      console.error("Error fetching teachers:", error);
    } finally {
      setLoadingExams(false);
    }
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    const currentYear = new Date().getFullYear();
    const selectedYear = new Date(newDate).getFullYear();

    // Allow only dates within the previous, current, and next years
    if (selectedYear >= currentYear - 1 && selectedYear <= currentYear + 1) {
      setSelectedDate(newDate);
    } else {
      alert("Please select a date within the allowed range.");
    }
  };

  const handleStudentSelect = (selectedOption) => {
    setStudentError(""); // Reset error if student is selected
    setSelectedStudent(selectedOption);
    setSelectedStudentId(selectedOption?.value);
  };

  // Dropdown options

  const studentOptions = useMemo(
    () =>
      studentNameWithClassId.map((teacher) => ({
        value: teacher.reg_id,
        label: teacher.name,
      })),
    [studentNameWithClassId]
  );

  // Handle search and fetch parent information
  const handleSearch = async () => {
    let valid = true;

    // Check if selectedStudent is empty and set the error message
    if (!selectedStudent) {
      setStudentError("Please select teacher.");
      valid = false;
    } else {
      setStudentError(""); // Reset error if teacher is selected
    }

    if (!valid) {
      setLoadingForSearch(false);
      return;
    } // Stop if any validation fails

    try {
      setLoadingForSearch(true); // Start loading

      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/api/get_substituteteacherdata/${selectedStudentId}/${selectedDate}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response?.data?.success && response.data?.data?.length > 0) {
        const substitutionData = response.data.data;

        // Map response data into a usable structure for rendering
        const timetableData = substitutionData.map((item) => ({
          date: item.date,
          period: item.period,
          subjectName: item.sname,
          subTeacher: item.sub_teacher,
          className: item.c_name,
          sectionName: item.s_name,
          academicYear: item.academic_yr,
        }));

        setDates([...new Set(substitutionData.map((item) => item.date))]); // Unique dates
        setTimetable(timetableData);

        toast.success("Substitution data fetched successfully!");
      } else {
        toast.error(
          "No substitution data available for the selected teacher and date."
        );
        setDates([]);
        setTimetable([]); // Reset timetable to avoid incorrect rendering
      }
    } catch (error) {
      console.error("Error fetching substitution data:", error);
      toast.error("An error occurred while fetching substitution data.");
    } finally {
      setLoadingForSearch(false);
    }
  };

  // Function to reset the table
  const resetTimetable = () => {
    setTimetable(
      timetable.map((row) => ({
        ...row,
        subjects: Array(4).fill(""),
        option: "Select",
        studyLeave: false,
      }))
    );
    setDescription("");
  };
  // Function to update timetable rows
  const updateTimetable = (index, field, value, subIndex = null) => {
    const updatedTimetable = [...timetable];

    if (field === "subjects" && subIndex !== null) {
      // Update the subject value
      updatedTimetable[index].subjects[subIndex] = value;

      // Uncheck study leave if any subject dropdown is selected
      if (value !== "") {
        updatedTimetable[index].studyLeave = false;
      }
    } else if (field === "studyLeave") {
      // Update study leave checkbox
      updatedTimetable[index].studyLeave = value;

      // Clear subjects and options if study leave is checked
      if (value) {
        updatedTimetable[index].subjects = Array(4).fill("");
        updatedTimetable[index].option = "Select";
      }
    } else {
      // Update other fields like option
      updatedTimetable[index][field] = value;
    }

    setTimetable(updatedTimetable);
  };
  const prepareData = () => {
    const preparedData = {};

    timetable.forEach((row, rowIndex) => {
      row.subjects.forEach((subject, subIndex) => {
        const key = `subject_id${rowIndex + 1}${subIndex + 1}`; // Generate key
        if (/^\d+$/.test(subject)) {
          // If value is numeric
          preparedData[key] = subject;
        } else {
          // If value is not numeric, set it as an empty string
          preparedData[key] = "";
        }
      });

      // Handle study leave checkbox value
      const studyLeaveKey = `study_leave${rowIndex + 1}`;
      preparedData[studyLeaveKey] = row.studyLeave ? "1" : "0";

      // Add options value
      const optionKey = `option${rowIndex + 1}`;
      preparedData[optionKey] = row.option || "Select";
    });

    // Add description field at the end
    preparedData.description = description; // Assuming `description` is the state variable for the input field

    return preparedData;
  };
  const handleSubmit = async () => {
    const preparedData = prepareData(); // Prepare data for validation
    let hasError = false;
    let warningRows = [];
    let errorMessage = "";
    let anySubjectSelected = false;

    // Clone the schedule errors state
    const updatedErrors = timetable.map((row) => ({
      noSubject: false,
      missingOption: false,
    }));

    timetable.forEach((row, rowIndex) => {
      const studyLeaveKey = `study_leave${rowIndex + 1}`;
      const optionKey = `option${rowIndex + 1}`;
      const hasStudyLeave = preparedData[studyLeaveKey] === "1";
      const hasSubjects = Object.keys(preparedData).some(
        (key) =>
          key.startsWith(`subject_id${rowIndex + 1}`) &&
          preparedData[key] !== ""
      );
      const hasMultipleSubjects =
        Object.keys(preparedData).filter(
          (key) =>
            key.startsWith(`subject_id${rowIndex + 1}`) &&
            preparedData[key] !== ""
        ).length > 1;
      const hasOptionSelected = preparedData[optionKey] !== "Select";

      // Track if any subject is selected across rows
      if (hasSubjects) {
        anySubjectSelected = true;
      }

      // Validation 2: Multiple subjects selected but no option chosen
      if (hasMultipleSubjects && !hasOptionSelected) {
        updatedErrors[rowIndex].missingOption = true;
        errorMessage = `Please select an option for multiple subjects on ${row.date}.`;
        hasError = true;
      }

      // Track warning rows: No data for a row
      if (!hasSubjects && !hasStudyLeave && !hasOptionSelected) {
        warningRows.push(row.date);
      }
    });

    // Validation 1: No subject selected across all rows
    if (!anySubjectSelected) {
      errorMessage = `Please select at least one subject for any date.`;
      hasError = true;
    }

    // Update the state to reflect field-level errors
    setSchedule(
      schedule.map((row, index) => ({
        ...row,
        errors: updatedErrors[index],
      }))
    );

    // Display error messages
    if (hasError) {
      toast.error(
        <div>
          <strong className="text-red-600">Error:</strong> {errorMessage}
          <div className="text-right mt-2">
            <button
              className="bg-blue-500 text-[.9em] text-white px-3 py-1 rounded hover:bg-blue-700"
              onClick={() => toast.dismiss()}
            >
              OK
            </button>
          </div>
        </div>
      );
      return;
    }

    // Display warning message
    if (warningRows.length > 0) {
      const remainingRows = warningRows.length;
      // Disable the Submit button when warning is shown
      setIsSubmitDisabled(true);

      // Show a modal-like toast for confirmation
      toast(
        <div>
          <strong className="text-pink-500">Warning:</strong> Data for{" "}
          <strong className="">{remainingRows}</strong> days are not selected.
          Do you still want to save data?
          <div className="flex justify-end gap-2 mt-2 ">
            <button
              className="bg-red-500 text-[.9em] text-white px-2 py-1 rounded hover:bg-red-700"
              onClick={() => {
                toast.dismiss(); // Dismiss the toast
                setIsSubmitDisabled(false); // Enable the Submit button
              }}
            >
              Cancel
            </button>
            <button
              className="bg-green-500 text-[.9em] text-white px-2 py-1 rounded hover:bg-green-700"
              onClick={() => {
                toast.dismiss(); // Dismiss the toast
                setIsSubmitDisabled(false); // Re-enable the Submit button after submission

                submitData(preparedData); // Call the function to submit data
              }}
            >
              Confirm
            </button>
          </div>
        </div>,
        {
          autoClose: false, // Prevent auto-dismiss
          closeButton: false, // Remove the cross button
          onClose: () => {
            // Ensure `setIsSubmitDisabled(false)` runs if the toast is closed manually
            setIsSubmitDisabled(false);
          },
        }
      );
      return;
    }

    // If no errors or warnings, submit data
    submitData(preparedData);
  };

  // Separate function to handle data submission
  const submitData = async (preparedData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        `${API_URL}/api/save_timetable/${selectedStudentId}/${classIdForSearch}`,
        preparedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Exam Time Table created successfully!");
      setLoading(false);

      // Navigate to /examTimeTable after a slight delay
      setTimeout(() => {
        navigate("/examTimeTable");
      }, 500);
    } catch (error) {
      toast.error("Error creating Exam Time Table.");
      console.error(error);
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };
  const handleSubmitDelete = async () => {
    if (isSubmitting) return; // Prevent re-submitting
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No authentication token found.");
      }

      const response = await axios.delete(
        `${API_URL}/api/delete_subsituteteacher/${selectedStudentId}/${selectedDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      // Handle successful deletion
      if (response.data && response.data.status === 400) {
        const errorMessage = response.data.message || "Delete failed.";
        toast.error(errorMessage);
      } else {
        toast.success("Substitution Teacher Timetable deleted successfully!");
        setTimetable([]); // Reset timetable to avoid incorrect rendering

        // fetchClasses(); // Refresh the classes list
      }

      setShowDeleteModal(false); // Close the modal
    } catch (error) {
      console.error("Error deleting Substitution Teacher Timetable:", error);

      // Handle error responses
      if (error.response && error.response.status === 400) {
        const errorMessage = error.response.data.message || "Delete failed.";
        toast.error(errorMessage);
      } else {
        toast.error("Server error. Please try again later.");
      }
    } finally {
      setIsSubmitting(false); // Re-enable the button after the operation
      setShowDeleteModal(false);
    }
  };
  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
  };
  return (
    <>
      <div className="w-full md:w-[80%] mx-auto p-4 ">
        <ToastContainer />
        <div className="card p-4 rounded-md ">
          <div className=" card-header mb-4 flex justify-between items-center ">
            <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
              Substitution Teacher
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
          <div className=" w-full md:w-[79%] border-1 drop-shadow-sm  flex justify-center flex-col md:flex-row gap-x-1  bg-white rounded-lg  mt-3 ml-0 md:ml-[2%]   p-2">
            <div className="w-[99%] flex md:flex-row justify-between items-center">
              <div className="w-full flex flex-col gap-y-2 md:gap-y-0 md:flex-row">
                <div className="w-full gap-x-2   justify-around md:w-[95%] my-1 md:my-4 flex md:flex-row">
                  <label
                    className="md:w-[25%] text-md pl-0 md:pl-3 mt-1.5"
                    htmlFor="studentSelect"
                  >
                    Teacher <span className="text-red-500">*</span>
                  </label>
                  <div className=" w-full md:w-[70%]">
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
                <div className="w-full gap-x-14 md:gap-x-6 md:justify-center my-1 md:my-4 flex md:flex-row">
                  <label
                    className="text-md mt-1.5 mr-1 md:mr-0"
                    htmlFor="classSelect"
                  >
                    Date
                  </label>
                  <div className="w-full md:w-[50%]">
                    <input
                      id="dateInput"
                      type="date"
                      value={selectedDate} // Default to current date
                      onChange={handleDateChange}
                      onKeyDown={(e) => e.preventDefault()} // Prevent clearing the field
                      min={`${new Date().getFullYear() - 1}-01-01`} // Min date: Jan 1 of previous year
                      max={`${new Date().getFullYear() + 1}-12-31`} // Max date: Dec 31 of next year
                      className=" w-full border-1 rounded px-2 py-2 border-gray-300"
                      required
                    />
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
          {/* // Render the table */}

          {timetable.length > 0 && (
            <>
              <div className="my-4 pt-3 flex flex-col md:flex-row gap-1 justify-center md:justify-end">
                <button
                  onClick={resetTimetable}
                  className="bg-blue-500 hover:bg-blue-600 text-white  py-1 px-3 rounded"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete()}
                  className={`bg-red-500 text-white py-1 px-3 rounded hover:bg-red-700 ${
                    isSubmitDisabled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={isSubmitDisabled}
                >
                  Delete
                </button>
                <button
                  onClick={resetTimetable}
                  className=" flex  flex-row justify-center align-middle items-center gap-x-1 bg-blue-500 hover:bg-blue-600 text-white  py-1 px-3 rounded"
                >
                  <FiPrinter /> Print
                </button>
              </div>
              <div className=" md:w-[80%] w-full mx-auto pb-4 pt-2 px-1 md:px-4">
                <div className="card bg-gray-100 py-2 px-3 rounded-md">
                  {/* Responsive Table Wrapper */}{" "}
                  <h5 className="text-center text-blue-600">{`Timetable for `}</h5>
                  <div className="overflow-x-auto">
                    <table className="table-auto  w-full border-collapse border bg-gray-50 border-gray-300">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="border p-2 font-semibold text-center">
                            Date
                          </th>
                          <th className="border p-2 font-semibold text-center">
                            Period
                          </th>
                          <th className="border p-2 font-semibold text-center">
                            Subject
                          </th>
                          <th className="border p-2 font-semibold text-center">
                            Subject Teacher
                          </th>
                          <th className="border p-2 font-semibold text-center">
                            Substitute Teacher
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan="5" className="text-center py-4">
                              <Loader /> {/* Replace with your loader */}
                            </td>
                          </tr>
                        ) : (
                          timetable.map((row, index) => (
                            <tr key={index}>
                              <td className="border p-2 text-center">
                                {row.date}
                              </td>
                              <td className="border p-2 text-center">
                                {row.period}
                              </td>
                              <td className="border p-2 text-center">
                                {row.subjectName}
                              </td>
                              <td className="border p-2 text-center">
                                {row.subTeacher}
                              </td>
                              <td className="border p-2 text-center">
                                {row.subTeacher}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  {/* Action Buttons */}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {showDeleteModal && (
        <div className="fixed inset-0 z-50   flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal show " style={{ display: "block" }}>
            <div className="modal-dialog  modal-dialog-centered">
              <div className="modal-content">
                <div className="flex justify-between p-3">
                  <h5 className="modal-title">Delete Timetable</h5>
                  <RxCross1
                    className="float-end relative mt-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                    type="button"
                    // className="btn-close text-red-600"
                    onClick={handleCloseModal}
                  />
                </div>
                <div
                  className=" relative  mb-3 h-1 w-[100%] mx-auto bg-red-700"
                  style={{
                    backgroundColor: "#C03078",
                  }}
                ></div>
                <div className="modal-body">
                  <p>
                    Are you sure you want to delete substitution of
                    {` ${selectedStudent?.label}?`}
                    {/* {currentClass?.name}? */}
                  </p>
                </div>
                <div className=" flex justify-end p-3">
                  {/* <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button> */}
                  <button
                    type="button"
                    className="btn btn-danger px-3 mb-2"
                    onClick={handleSubmitDelete}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SubstituteTeacher;
