import React, { useEffect, useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

const ViewLeaveApplication = () => {
  const location = useLocation();
  const API_URL = import.meta.env.VITE_API_URL;
  const [loading, setLoading] = useState(false);

  const { staffleave } = location.state || {};
  console.log("staff leave for editing", staffleave);

  const [formData, setFormData] = useState({
    staff_name: "",
    staff_id: "",
    leave_type_id: "",
    leave_start_date: "",
    leave_end_date: "",
    status: "",
    no_of_days: "",
    reason: "",
    reason_for_rejection: "",
  });
  const statusOptions = [
    { value: "A", label: "Applied" },
    { value: "H", label: "Hold" },
    { value: "R", label: "Rejected" },
    { value: "P", label: "Approved" },
    { value: "C", label: "Canceled" },
  ];
  useEffect(() => {
    if (staffleave) {
      setFormData({
        staff_name: staffleave.teachername || "",
        staff_id: staffleave.staff_id || "",
        leave_type_id: staffleave.leave_type_id || "",
        leave_start_date: staffleave.leave_start_date || "",
        leave_end_date: staffleave.leave_end_date || "",
        status: staffleave.status || "",
        no_of_days: staffleave.no_of_days || "",
        reason: staffleave.reason || "",
        reason_for_rejection: staffleave.reason_for_rejection || "",
      });

      // ✅ Fetch leave type if staff_id exists
      if (staffleave.staff_id) {
        fetchLeaveType(staffleave.staff_id);
      }
    }
  }, [staffleave, API_URL]);

  const [errors, setErrors] = useState({});
  const [leaveType, setLeaveType] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const MAX_DATE = "2006-12-31";
  const today = new Date().toISOString().split("T")[0];
  const statusMap = {
    R: "Rejected",
    A: "Applied",
    H: "Hold",
    C: "Canceled",
    P: "Approved",
  };
  const validateDays = (days) => {
    if (!days) return "Number of days is required";
    if (!/^\d{1,2}(\.\d{1,2})?$/.test(days)) {
      return "Enter a valid number";
    }
    return null;
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.staff_name) {
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

    // if (!formData.reason) {
    //   newErrors.reason = "Reason for leave is required";
    // }

    const daysError = validateDays(formData.no_of_days);
    if (daysError) {
      newErrors.no_of_days = daysError;
    }

    setErrors(newErrors);
    return newErrors;
  };

  const fetchLeaveType = async (reg_id) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No Authentication token found.");
      }

      const response = await axios.get(
        `${API_URL}/api/get_leavetypedata/${reg_id}`,
        {
          // ${API_URL}/api/get_leavetype
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (Array.isArray(response.data.data)) {
        setLeaveType(response.data.data);
      } else {
        setError("Unexpected data format.");
      }
    } catch (error) {
      setError(error.message);
      toast.error("Error fetching leave type");
    } finally {
      setLoading(false);
    }
  };

  const formatDateString = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="container mx-auto min-h-screen flex items-center justify-center mt-3 ">
      <ToastContainer />
      <div className="card p-4 rounded-md w-[80%]">
        <div className=" card-header mb-4 flex justify-between items-center">
          <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
            View Leave Application
          </h5>

          <RxCross1
            className="float-end relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
            onClick={() => {
              setErrors({});
              navigate("/leaveApplication");
            }}
          />
        </div>
        <div
          className=" relative w-full -top-6 h-1  mx-auto bg-red-700"
          style={{
            backgroundColor: "#C03078",
          }}
        ></div>

        <form
          // onSubmit={handleSubmit}
          className="flex items-center justify-center overflow-x-hidden shadow-md p-3 bg-gray-50 space-y-2" //min-h-screen flex items-center justify-center overflow-x-hidden shadow-md p-4 bg-gray-50
        >
          <div className="modal-body grid grid-cols-3 gap-4 px-4">
            {/* Staff Name */}
            <div className="flex flex-col">
              <label htmlFor="staff_name" className="mb-1">
                Staff Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={100}
                id="staff_name"
                name="staff_name"
                pattern="^[^\d].*"
                title="Name should not start with a number"
                required
                value={formData.staff_name}
                disabled
                className="form-control shadow-md bg-gray-200"
              />
              {errors.staff_name && (
                <span className="text-danger text-xs mt-1">
                  {errors.staff_name}
                </span>
              )}
            </div>

            {/* Leave Type */}
            <div className="flex flex-col">
              <label htmlFor="leave_type" className="mb-1">
                Leave Type <span className="text-red-500">*</span>
              </label>
              <select
                id="leave_type"
                name="leave_type"
                value={formData.leave_type_id}
                disabled
                required
                className="form-control shadow-md bg-gray-200"
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
              {errors.leave_type_id && (
                <span className="text-danger text-xs mt-1">
                  {errors.leave_type_id}
                </span>
              )}
            </div>

            {/* Leave Start Date */}
            <div className="flex flex-col">
              <label htmlFor="leave_start_date" className="mb-1">
                Leave Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="leave_start_date"
                name="leave_start_date"
                value={formData.leave_start_date}
                disabled
                max={formData.leave_end_date || ""}
                required
                className="form-control shadow-md bg-gray-200"
              />
              {errors.leave_start_date && (
                <span className="text-danger text-xs mt-1">
                  {errors.leave_start_date}
                </span>
              )}
            </div>

            {/* Leave End Date */}
            <div className="flex flex-col">
              <label htmlFor="leave_end_date" className="mb-1">
                Leave End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="leave_end_date"
                name="leave_end_date"
                value={formData.leave_end_date}
                disabled
                min={formData.leave_start_date || ""}
                required
                className="form-control shadow-md bg-gray-200"
              />
              {errors.leave_end_date && (
                <span className="text-danger text-xs mt-1">
                  {errors.leave_end_date}
                </span>
              )}
            </div>

            {/* No of Days */}
            <div className="flex flex-col">
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
                disabled
                className="form-control shadow-md bg-gray-200"
              />
              {errors.no_of_days && (
                <span className="text-danger text-xs mt-1">
                  {errors.no_of_days}
                </span>
              )}
            </div>

            {/* Status */}
            <div className="flex flex-col">
              <label htmlFor="status" className="mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="status"
                name="status"
                value={statusMap[formData.status] || ""}
                readOnly
                disabled
                className=" bg-gray-200 p-2 rounded-md shadow-inner"
              />
            </div>

            {/* Reason and Approver's Comment */}
            <div className="col-span-3 grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label htmlFor="reason" className="mb-1">
                  Reason
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  readOnly
                  rows="2"
                  disabled
                  className=" bg-gray-200 p-2 rounded-md shadow-inner"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="reason_for_rejection" className="mb-1">
                  Approver's Comment
                </label>
                <textarea
                  id="reason_for_rejection"
                  name="reason_for_rejection"
                  value={formData.reason_for_rejection}
                  readOnly
                  rows="2"
                  disabled
                  className=" bg-gray-200 p-2 rounded-md shadow-inner"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ViewLeaveApplication;
