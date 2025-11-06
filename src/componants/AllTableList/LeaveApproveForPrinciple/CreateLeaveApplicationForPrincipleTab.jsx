import { useEffect, useState, useMemo, useRef } from "react";
import { RxCross1 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import Select from "react-select";

const CreateLeaveApplicationForPrincipleTab = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    staff_id: "",
    leave_type_id: "",
    leave_start_date: "",
    leave_end_date: "",
    no_of_days: "",
    reason: "",
    approverscomment: "",
  });
  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
  const [errors, setErrors] = useState({});
  const [leaveType, setLeaveType] = useState([]);
  const [newLeaveType, setNewLeaveType] = useState("");
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loadingExams, setLoadingExams] = useState(false);
  const [loadingForLT, setLoadingForLT] = useState(false);

  const [studentError, setStudentError] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // const [regId, setRegId] = useState(null);

  const navigate = useNavigate();
  const MAX_DATE = "2006-12-31";
  const today = new Date().toISOString().split("T")[0];

  const validateDays = (days) => {
    if (!days) return "Number of days is required";
    if (!/^\d{1,2}(\.\d{1,2})?$/.test(days)) {
      return "Enter a valid number";
    }
    return null;
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.selectedStudent) {
      newErrors.staff_name = "Staff name is required";
    } else if (!/^[^\d].*/.test(formData.staff_name)) {
      newErrors.staff_name = "Staff name should not start with a number";
    }

    if (!formData.leave_type_id) {
      newErrors.leave_type_id = "Leave type is required";
    }

    if (!formData.leave_start_date) {
      newErrors.leave_start_date = "Leave start date is required";
    }

    if (!formData.leave_end_date) {
      newErrors.leave_end_date = "Leave end date is required";
    }

    const daysError = validateDays(formData.no_of_days);
    if (daysError) {
      newErrors.no_of_days = daysError;
    }

    setErrors(newErrors);
    return newErrors;
  };

  useEffect(() => {
    fetchExams();
    fetchLeaveType();
  }, []);

  const fetchLeaveType = async (reg_id) => {
    setLoadingForLT(true);
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No Authentication token found.");
      }
      // console.log("regid", reg_id)
      const response = await axios.get(
        `${API_URL}/api/get_leavetypedata/${reg_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      // Process response
      if (Array.isArray(response.data.data)) {
        setLeaveType(response.data.data); // Set leave types
      } else {
        setError("Unexpected data format.");
      }
    } catch (error) {
      setError(error.message);
      toast.error("Error fetching leave type");
    } finally {
      setLoadingForLT(false);
    }
  };

  const fetchExams = async () => {
    try {
      setLoadingExams(true);
      const token = localStorage.getItem("authToken");

      const response = await axios.get(`${API_URL}/api/get_allstaff`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Class", response);
      setStudentNameWithClassId(response?.data?.data || []);
    } catch (error) {
      toast.error("Error fetching Staff");
      console.error("Error fetching Staff:", error);
    } finally {
      setLoadingExams(false);
    }
  };

  // const handleStudentSelect = (selectedOption) => {
  //   setSelectedStudent(selectedOption);
  //   setSelectedStudentId(selectedOption?.value);
  //   fetchLeaveType(selectedOption?.value);
  //   // ✅ Update form data
  //   setFormData((prev) => ({
  //     ...prev,
  //     staff_name: selectedOption?.label || "",
  //     selectedStudent: selectedOption,
  //   }));

  //   // ✅ Remove error message for 'staff_name' when valid selection is made
  //   setErrors((prev) => {
  //     const newErrors = { ...prev };
  //     delete newErrors.staff_name;
  //     return newErrors;
  //   });
  // };

  const handleStudentSelect = (selectedOption) => {
    setSelectedStudent(selectedOption);
    setSelectedStudentId(selectedOption?.value);

    if (selectedOption?.value) {
      fetchLeaveType(selectedOption.value);
    }

    // Update form data
    setFormData((prev) => ({
      ...prev,
      staff_name: selectedOption?.label || "",
      selectedStudent: selectedOption,
      leave_type_id: "", // Reset leave type if student is removed
    }));

    //Handle errors
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (selectedOption?.value) {
        delete newErrors.staff_name;
      } else {
        newErrors.staff_name = "Staff is required";
      }
      newErrors.leave_type_id = "Leave type is required"; // Show again if cleared
      return newErrors;
    });
  };

  const studentOptions = useMemo(
    () =>
      studentNameWithClassId.map((cls) => ({
        value: cls?.teacher_id,
        label: `${cls.name}`,
      })),
    [studentNameWithClassId]
  );

  // const handleChange = (event) => {
  //   const { name, value } = event.target;

  //   setFormData((prevData) => {
  //     let updatedData = {
  //       ...prevData,
  //       [name]: value,
  //     };

  //     // Recalculate no_of_days only if the dates are changed, and no manual editing is done
  //     if (
  //       updatedData.leave_start_date &&
  //       updatedData.leave_end_date &&
  //       name !== "no_of_days"
  //     ) {
  //       const startDate = new Date(updatedData.leave_start_date);
  //       const endDate = new Date(updatedData.leave_end_date);

  //       // Calculate day difference as a decimal (including fractional days)
  //       const timeDiff = endDate - startDate;
  //       const dayDiff = timeDiff / (1000 * 60 * 60 * 24) + 1; // Including fractional days

  //       // Set the calculated value
  //       updatedData.no_of_days = dayDiff > 0 ? dayDiff.toFixed(0) : "";
  //     }

  //     return updatedData;
  //   });

  //   // When manually editing no_of_days field, accept decimals and validate
  //   if (name === "no_of_days") {
  //     // Allow decimal values (positive only)
  //     const decimalPattern = /^\d+(\.\d+)?$/;
  //     if (decimalPattern.test(value)) {
  //       setErrors((prevErrors) => ({
  //         ...prevErrors,
  //         no_of_days: "", // Clear any existing errors
  //       }));
  //     } else {
  //       setErrors((prevErrors) => ({
  //         ...prevErrors,
  //         no_of_days: "Please enter a valid positive number (e.g., 0.5).",
  //       }));
  //     }
  //   }
  // };

  const manuallyEditedNoOfDaysRef = useRef(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    // If user edits no_of_days manually, mark it
    if (name === "no_of_days") {
      manuallyEditedNoOfDaysRef.current = true;
    }

    // If user changes the start or end date, allow auto-calc again
    if (name === "leave_start_date" || name === "leave_end_date") {
      manuallyEditedNoOfDaysRef.current = false;
    }

    setFormData((prevData) => {
      let updatedData = {
        ...prevData,
        [name]: value,
      };

      // Recalculate no_of_days if dates are changed and not manually edited
      if (
        updatedData.leave_start_date &&
        updatedData.leave_end_date &&
        !manuallyEditedNoOfDaysRef.current
      ) {
        const startDate = new Date(updatedData.leave_start_date);
        const endDate = new Date(updatedData.leave_end_date);

        const timeDiff = endDate - startDate;
        const dayDiff = timeDiff / (1000 * 60 * 60 * 24) + 1;

        updatedData.no_of_days = dayDiff > 0 ? dayDiff.toFixed(1) : "";
      }

      return updatedData;
    });

    // Validate manual no_of_days input
    if (name === "no_of_days") {
      const decimalPattern = /^\d+(\.\d+)?$/;
      if (decimalPattern.test(value)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          no_of_days: "",
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          no_of_days: "Please enter a valid positive number (e.g., 0.5).",
        }));
      }
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

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      Object.values(validationErrors).forEach((error) => {
        // toast.error(error);
        console.log("errors: ", error);
      });
      return;
    }

    const formattedFormData = {
      ...formData,
      leave_start_date: formatDateString(formData.leave_start_date),
      leave_end_date: formatDateString(formData.leave_end_date),
      staff_id: selectedStudentId,
      staff_name: formData.staff_name,
    };

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }
      const response = await axios.post(
        `${API_URL}/api/save_leaveapplicatstaffprincipal`,
        formattedFormData,
        {
          headers: {
            "Content-Type": "application/json", // Use JSON as content type
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const { data } = response;
      if (data.success) {
        toast.success("Leave Application Created Successfully!");
        setTimeout(() => {
          handleBack();
          // navigate("/approveLeavelist");
        }, 500);
      } else {
        toast.error(
          "You have Applied for the leave more than the balance leave."
        );
      }
    } catch (error) {
      toast.error("Error submitting leave application");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeLeaveType = (e) => {
    const { value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      leave_type_id: value,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      leave_type_id: value ? null : "Leave type is required",
    }));
  };
  const handleBack = () => {
    navigate("/approveLeavelist", {
      state: { activeTab: "CreateTeachersnote" },
    });
  };
  return (
    <div className="container mx-auto mt-4 flex items-center justify-center  ">
      <ToastContainer />
      <div className="card p-4 rounded-md w-[80%] ">
        <div className=" card-header mb-4 flex justify-between items-center">
          <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
            Create Leave Application For Staff
          </h5>

          <RxCross1
            className="float-end relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
            onClick={() => {
              setErrors({});
              // navigate("/approveLeavelist");
              handleBack();
            }}
          />
        </div>
        <div
          className=" relative w-full -top-6 h-1  mx-auto bg-red-700"
          style={{
            backgroundColor: "#C03078",
          }}
        ></div>
        <p className="  md:absolute md:right-6  md:top-[16%]  text-gray-500  ">
          <span className="text-red-500">*</span>indicates mandatory information
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex items-center justify-center overflow-x-hidden shadow-md p-3 bg-gray-50 space-y-2" //min-h-screen flex items-center justify-center overflow-x-hidden shadow-md p-4 bg-gray-50
        >
          <div className="modal-body px-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Staff Name */}
              <div className="flex flex-col">
                <label htmlFor="sectionName" className="mb-1">
                  Staff Name <span className="text-red-500">*</span>
                </label>
                <Select
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  id="studentSelect"
                  value={selectedStudent}
                  onChange={handleStudentSelect}
                  options={studentOptions}
                  placeholder={loadingExams ? "Loading..." : "Select"}
                  isSearchable
                  isClearable
                  isDisabled={loadingExams}
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      fontSize: ".9em",
                      minHeight: "30px",
                    }),
                    menu: (provided) => ({
                      ...provided,
                      fontSize: "1em",
                    }),
                    option: (provided) => ({
                      ...provided,
                      fontSize: ".9em",
                    }),
                  }}
                />
                {studentError && (
                  <span className="text-danger text-xs mt-1">
                    {studentError}
                  </span>
                )}
                {errors.staff_name && (
                  <span className="text-danger text-xs mt-1">
                    {errors.staff_name}
                  </span>
                )}
              </div>

              {/* Leave Type */}
              <div className="flex flex-col relative">
                <label htmlFor="leave_type" className="mb-1">
                  Leave Type <span className="text-red-500">*</span>
                </label>

                {loadingForLT ? (
                  <div className="flex items-center gap-2">
                    <div className=" relative top-2 w-4 h-4  border-2 border-t-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                    <span className=" relative top-2 text-sm text-gray-500">
                      Loading leave types...
                    </span>
                  </div>
                ) : (
                  <select
                    id="leave_type"
                    name="leave_type"
                    value={formData.leave_type_id}
                    onChange={handleChangeLeaveType}
                    required
                    className="form-control shadow-md"
                  >
                    <option className="bg-gray-300" value="">
                      Select Leave
                    </option>
                    {leaveType.length === 0 ? (
                      <option>No Options</option>
                    ) : (
                      leaveType.map((leave) => (
                        <option
                          key={leave.leave_type_id}
                          value={leave.leave_type_id}
                        >
                          {leave.name}
                        </option>
                      ))
                    )}
                  </select>
                )}

                {errors.leave_type_id && (
                  <span className="text-danger text-xs mt-1">
                    {errors.leave_type_id}
                  </span>
                )}
              </div>

              {/* Start Date */}
              <div className="flex flex-col">
                <label htmlFor="leave_start_date" className="mb-1">
                  Leave Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="leave_start_date"
                  min={today}
                  name="leave_start_date"
                  value={formData.leave_start_date}
                  onChange={handleChange}
                  className="form-control shadow-md"
                />
                {errors.leave_start_date && (
                  <span className="text-danger text-xs mt-1">
                    {errors.leave_start_date}
                  </span>
                )}
              </div>

              {/* End Date */}
              <div className="flex flex-col">
                <label htmlFor="leave_end_date" className="mb-1">
                  Leave End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="leave_end_date"
                  min={today}
                  name="leave_end_date"
                  value={formData.leave_end_date}
                  onChange={handleChange}
                  className="form-control shadow-md"
                />
                {errors.leave_end_date && (
                  <span className="text-danger text-xs mt-1">
                    {errors.leave_end_date}
                  </span>
                )}
              </div>

              {/* No. of Days */}
              {/* <div className="flex flex-col">
                <label htmlFor="no_of_days" className="mb-1">
                  No. of Days <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="no_of_days"
                  name="no_of_days"
                  value={formData.no_of_days}
                  step="0.5"
                  min="0.5"
                  onChange={handleChange}
                  className="form-control shadow-md"
                />
                {errors.no_of_days && (
                  <span className="text-danger text-xs mt-1">
                    {errors.no_of_days}
                  </span>
                )}
              </div> */}
              <div className="flex flex-col">
                <label htmlFor="no_of_days" className="mb-1">
                  No. of Days <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="no_of_days"
                  name="no_of_days"
                  maxLength={5}
                  value={formData.no_of_days}
                  step="0.5"
                  min="0.5"
                  onChange={handleChange}
                  onBlur={() => {
                    // Optionally mark manual editing complete
                    if (formData.no_of_days) {
                      manuallyEditedNoOfDaysRef.current = true;
                    }
                  }}
                  className="form-control shadow-md"
                />
                {errors.no_of_days && (
                  <span className="text-danger text-xs mt-1">
                    {errors.no_of_days}
                  </span>
                )}
              </div>

              {/* Reason */}
              <div className="flex flex-col">
                <label htmlFor="reason" className="mb-1">
                  Reason
                </label>
                <textarea
                  maxLength={500}
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  rows="2"
                  className="form-control shadow-md"
                />
              </div>
            </div>

            {/* Reason and Approver's Comments in One Grid Row */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mt-6">
              {/* Approver's Comments */}
              <div className="flex flex-col">
                <label htmlFor="approverscomment" className="mb-1">
                  Approver's Comments
                </label>
                <textarea
                  maxLength={500}
                  id="approverscomment"
                  name="approverscomment"
                  value={formData.approverscomment}
                  onChange={handleChange}
                  rows="2"
                  className="form-control shadow-md"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-right mt-6">
              <button
                className="bg-blue-500 text-white py-1 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLeaveApplicationForPrincipleTab;
