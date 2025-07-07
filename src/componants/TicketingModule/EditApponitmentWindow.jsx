import React, { useEffect, useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import Select from "react-select";

const EditAppointmentWindow = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allClasses, setAllClasses] = useState([]);

  const [staffNames, setStaffNames] = useState([
    { value: "A", label: "Admin" },
    { value: "F", label: "Finance" },
    { value: "L", label: "Librarian" },
    { value: "M", label: "Management" },
    { value: "T", label: "Teacher" },
    { value: "U", label: "AceVentura" },
  ]);

  useEffect(() => {
    fetchClassNames();
  }, []);

  const fetchClassNames = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${API_URL}/api/getClassList`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Fetched classes array:", response.data);

      // FIX: Map to value-label format for Select
      const classOptions = (response.data || []).map((cls) => ({
        value: cls.class_id,
        label: cls.name,
      }));

      setAllClasses(classOptions);
    } catch (error) {
      console.error("Error fetching class names", error);
    } finally {
      setLoading(false);
    }
  };

  const { id } = useParams();
  console.log("id", id);
  const location = useLocation();
  const appointmentData = location.state;

  console.log("Appointment Navigate", appointmentData);

  useEffect(() => {
    if (appointmentData) {
      setFormData({
        role_id: appointmentData.role_id || "",
        class_id: appointmentData.class_id || "",
        week: appointmentData.week || "",
        weekday: appointmentData.weekday
          ? appointmentData.weekday.split(",")
          : [],
        time_from: appointmentData.time_from || "",
        time_to: appointmentData.time_to || "",
      });
    }
  }, [appointmentData]);

  const [formData, setFormData] = useState({
    role_id: "",
    class_id: "",
    week: "",
    weekday: [],
    time_from: "",
    time_to: "",
  });

  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};

    // Role
    if (!formData.role_id) {
      newErrors.role_id = "Role is required";
    }

    // Class
    if (!formData.class_id) {
      newErrors.class_id = "Class is required";
    }

    // Week
    if (!formData.week) {
      newErrors.week = "Week is required";
    }

    // Weekday (multi-select array)
    if (!formData.weekday || formData.weekday.length === 0) {
      newErrors.weekday = "At least one weekday must be selected";
    }

    // Time From
    if (!formData.time_from) {
      newErrors.time_from = "Start time is required";
    }

    // Time To
    if (!formData.time_to) {
      newErrors.time_to = "End time is required";
    }

    // Optional: Check if end time is after start time
    if (formData.time_from && formData.time_to) {
      const from = new Date(`1970-01-01T${formData.time_from}`);
      const to = new Date(`1970-01-01T${formData.time_to}`);
      if (to <= from) {
        newErrors.time_to = "End time must be after start time";
      }
    }

    setErrors(newErrors);
    return newErrors;
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    const updatedFormData = {
      ...formData,
      [name]: value,
    };

    const minTime = new Date("1970-01-01T09:00");
    const maxTime = new Date("1970-01-01T18:00");

    const from = updatedFormData.time_from
      ? new Date(`1970-01-01T${updatedFormData.time_from}`)
      : null;
    const to = updatedFormData.time_to
      ? new Date(`1970-01-01T${updatedFormData.time_to}`)
      : null;

    const newErrors = { ...errors };

    if (name === "time_from") {
      if (!value) {
        newErrors.time_from = "Start time is required";
      } else if (from < minTime) {
        newErrors.time_from =
          "Please enter a value greater than or equal to 09:00 am";
      } else if (from > maxTime) {
        newErrors.time_from =
          "Please enter a value less than or equal to 18:00.";
      } else {
        delete newErrors.time_from;
      }

      // Also check relation with end time
      if (to && to <= from) {
        newErrors.time_to = "End time must be after start time";
      } else if (to) {
        delete newErrors.time_to;
      }
    }

    if (name === "time_to") {
      if (!value) {
        newErrors.time_to = "End time is required";
      } else if (to < minTime) {
        newErrors.time_to =
          "Please enter a value greater than or equal to 09:00 am";
      } else if (to > maxTime) {
        newErrors.time_to = "Please enter a value less than or equal to 18:00.";
      } else if (from && to <= from) {
        newErrors.time_to = "End time must be after start time";
      } else {
        delete newErrors.time_to;
      }
    }

    // Clear other non-time errors as usual
    if (name !== "time_from" && name !== "time_to" && errors[name]) {
      delete newErrors[name];
    }

    setErrors(newErrors);
  };

  const appointmentOptions = [
    { value: "First", label: "First" },
    { value: "Second", label: "Second" },
    { value: "Third", label: "Third" },
    { value: "Fourth", label: "Fourth" },
  ];

  const dayOptions = [
    { value: "Monday", label: "Monday" },
    { value: "Tuesday", label: "Tuesday" },
    { value: "Wednesday", label: "Wednesday" },
    { value: "Thursday", label: "Thursday" },
    { value: "Friday", label: "Friday" },
    { value: "Saturday", label: "Saturday" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      Object.values(validationErrors).forEach((error) => {
        console.log("errors: ", error);
        setIsSubmitting(false);
      });
      return;
    }

    const formattedFormData = {
      ...formData,
      role: formData.role_id,
      class: formData.class_id,
      week: formData.week,
      weekday: formData.weekday,
      time_from: formData.time_from,
      time_to: formData.time_to,
    };

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.put(
        `${API_URL}/api/update_appointmentwindow/${id}`,
        formattedFormData,
        {
          headers: {
            Authorization: ` Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;

      if (data.success) {
        toast.success("Appointment window updated successfully!");
        setTimeout(() => {
          navigate("/appointmentWindow");
        }, 500);
      } else {
        toast.error(data.message || "Failed to save appointment window.");
      }
    } catch (error) {
      console.error("API Error:", error);
      toast.error("An error occurred while saving. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center mt-4 ">
      <ToastContainer />
      <div className="card p-4 rounded-md w-[60%] ">
        <div className=" card-header mb-4 flex justify-between items-center">
          <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
            Edit Appointment Window
          </h5>

          <RxCross1
            className="float-end relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
            onClick={() => {
              setErrors({});
              navigate("/appointmentWindow");
            }}
          />
        </div>
        <div
          className=" relative w-full -top-6 h-1  mx-auto bg-red-700"
          style={{
            backgroundColor: "#C03078",
          }}
        ></div>
        <p className="absolute right-10 top-10 md:top-20 text-gray-500">
          <span className="text-red-500">*</span> indicates mandatory
          information
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex items-center justify-center overflow-x-hidden shadow-md p-3 bg-gray-50 space-y-2" //min-h-screen flex items-center justify-center overflow-x-hidden shadow-md p-4 bg-gray-50
        >
          <div className="modal-body">
            <div className="relative mb-4 flex justify-center mx-4">
              <label htmlFor="leave_type" className="w-1/2 mt-2">
                Role <span className="text-red-500">*</span>
              </label>
              <Select
                id="staffName"
                options={staffNames}
                value={staffNames.find(
                  (staff) => staff.value === formData.role_id
                )}
                onChange={(selectedOption) =>
                  handleChange(
                    "role_id",
                    selectedOption ? selectedOption.value : ""
                  )
                }
                placeholder="Select"
                className=" shadow-md w-full"
                isSearchable
                isClearable
              />
              <div className="absolute top-9 left-1/3">
                {errors.role_id && (
                  <span className="text-danger text-xs">{errors.role_id}</span>
                )}
              </div>
            </div>

            <div className="relative mb-4 flex justify-center mx-4">
              <label htmlFor="leave_type" className="w-1/2 mt-2">
                Class <span className="text-red-500">*</span>
              </label>
              <Select
                id="staffName"
                options={allClasses}
                value={allClasses.find(
                  (cls) => cls.value === formData.class_id
                )}
                onChange={(selectedOption) =>
                  handleChange(
                    "class_id",
                    selectedOption ? selectedOption.value : ""
                  )
                }
                placeholder="Select"
                className=" shadow-md w-full"
                isSearchable
                isClearable
              />
              <div className="absolute top-9 left-1/3">
                {errors.class_id && (
                  <span className="text-danger text-xs">{errors.class_id}</span>
                )}
              </div>
            </div>

            <div className="mt-4 mb-4 flex items-start justify-start mx-4 gap-5">
              {/* Label */}
              <label htmlFor="week" className="w-[26%] pt-1.5">
                Appointment Every <span className="text-red-500">*</span>
              </label>

              {/* Combined Selects */}
              <div className="flex gap-4 w-[67%]">
                {/* Appointment Every Select */}
                <div className="w-[50%] space-y-1">
                  <Select
                    id="week"
                    name="week"
                    options={appointmentOptions}
                    value={appointmentOptions.find(
                      (option) => option.value === formData.week
                    )}
                    onChange={(selectedOption) =>
                      handleChange(
                        "week",
                        selectedOption ? selectedOption.value : ""
                      )
                    }
                    placeholder="Select"
                    className="shadow-md w-full"
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 9999,
                        maxHeight: 150,
                        overflowY: "auto",
                      }),
                      menuList: (base) => ({
                        ...base,
                        maxHeight: 150,
                        overflowY: "auto",
                      }),
                    }}
                    isSearchable
                    isClearable
                  />
                  {errors.week && (
                    <span className="text-danger text-xs">{errors.week}</span>
                  )}
                </div>

                {/* Weekday Multi-Select */}
                <div className="w-[50%] space-y-1">
                  <Select
                    id="weekday"
                    name="weekday"
                    options={dayOptions}
                    value={dayOptions.filter((option) =>
                      formData.weekday?.includes(option.value)
                    )}
                    onChange={(selectedOptions) =>
                      handleChange(
                        "weekday",
                        selectedOptions
                          ? selectedOptions.map((opt) => opt.value)
                          : []
                      )
                    }
                    placeholder="Select Day"
                    isMulti
                    isSearchable
                    isClearable
                    className="shadow-md w-full"
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 9999,
                        maxHeight: 150,
                        overflowY: "auto",
                      }),
                      menuList: (base) => ({
                        ...base,
                        maxHeight: 150,
                        overflowY: "auto",
                      }),
                    }}
                    menuPortalTarget={document.body}
                  />
                  {errors.weekday && (
                    <span className="text-danger text-xs">
                      {errors.weekday}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 relative mb-4 flex justify-center mx-4">
              <label htmlFor="timeFrom" className="w-1/2 mt-2">
                Time From <span className="text-red-500">*</span>
              </label>

              <div className="w-full flex gap-2 items-start">
                {/* Time From */}
                <div className="w-1/2">
                  <input
                    type="time"
                    id="time_from"
                    name="time_from"
                    value={formData.time_from}
                    onChange={(e) => handleChange("time_from", e.target.value)}
                    required
                    className="form-control shadow-md w-full"
                  />
                  {errors.time_from && (
                    <span className="text-red-500 text-xs block mt-1">
                      {errors.time_from}
                    </span>
                  )}
                </div>

                {/* To label */}
                <span className="mt-3">To</span>

                {/* Time To */}
                <div className="w-1/2">
                  <input
                    type="time"
                    id="time_to"
                    name="time_to"
                    value={formData.time_to}
                    onChange={(e) => handleChange("time_to", e.target.value)}
                    required
                    className="form-control shadow-md w-full"
                  />
                  {errors.time_to && (
                    <span className="text-red-500 text-xs block mt-1">
                      {errors.time_to}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className=" flex justify-end p-3">
              <button
                type="button"
                className="btn btn-primary px-3 mb-2"
                style={{}}
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAppointmentWindow;
