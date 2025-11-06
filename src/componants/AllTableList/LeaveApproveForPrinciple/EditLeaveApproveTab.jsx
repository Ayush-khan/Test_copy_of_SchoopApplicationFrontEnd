import React, { useEffect, useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import Select from "react-select";

const EditLeaveApproveTab = () => {
  const location = useLocation();
  const API_URL = import.meta.env.VITE_API_URL;
  const [loading, setLoading] = useState(false);

  const { staffleave } = location.state || {};
  console.log("staff leave for editing", staffleave);

  const statusOptions = [
    { value: "P", label: "Approve" },
    { value: "H", label: "Hold" },
    { value: "R", label: "Rejected" },
  ];

  const [formData, setFormData] = useState({
    teachername: "",
    leave_type_id: "",
    leave_start_date: "",
    leave_end_date: "",
    status: { value: "Approve", label: "Approve" },
    no_of_days: "",
    reason: "",
    reason_for_rejection: "",
    approverscomment: "",
  });

  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [staffs, setStaffs] = useState([]);

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

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        `${API_URL}/api/get_listforleaveapprove`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      console.log("approve leave data", response.data.data);
      setStaffs(response.data.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      status: selectedOption,
    }));
  };

  const formatDateString = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (staffleave) {
      setFormData({
        teachername: staffleave.teachername || "",
        leavetypename: staffleave.leavetypename || "",
        leave_type_id: staffleave.leave_type_id || "",
        leave_start_date: staffleave.leave_start_date || "",
        leave_end_date: staffleave.leave_end_date || "",
        status:
          statusOptions.find((opt) => opt.value === staffleave.status) ||
          statusOptions[0],
        no_of_days: staffleave.no_of_days || "",
        reason: staffleave.reason || "",
        reason_for_rejection: staffleave.reason_for_rejection || "",
      });
    }
  }, [staffleave, API_URL]);

  // const handleSubmit = async () => {
  //   console.log(formData.status);
  //   console.log(formData.reason_for_rejection);
  //   try {
  //     setLoading(true);
  //     const token = localStorage.getItem("authToken");

  //     const payload = {
  //       status: formData.status?.value || "Approve",
  //       approverscomment: formData.reason_for_rejection,
  //     };

  //     console.log("Submitting update:", payload);

  //     const response = await axios.post(
  //       `${API_URL}/api/update_leaveapprovestatus/${staffleave.leave_app_id}`,
  //       payload,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     if (response.status === 200) {
  //       toast.success("Leave updated successfully!");
  //       navigate("/leaveApprove");
  //     } else {
  //       toast.error("Failed to update leave.");
  //     }
  //   } catch (error) {
  //     console.error("Error updating leave:", error);
  //     toast.error("Something went wrong.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async () => {
    if (!staffleave?.leave_app_id) {
      toast.error("Invalid leave application ID.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      const form = new FormData();
      form.append("status", formData.status?.value || "A");
      form.append("approverscomment", formData.reason_for_rejection || "");

      const response = await axios.post(
        `${API_URL}/api/update_leaveapprovestatus/${staffleave.leave_app_id}`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data", // crucial for FormData
          },
        }
      );

      if (response.status === 200) {
        toast.success("Leave updated successfully!");
        fetchLeaves();
        // navigate("/approveLeavelist");
        handleBack();
      } else {
        toast.error("Failed to update leave.");
      }
    } catch (error) {
      console.error("Error updating leave:", error);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };
  const handleBack = () => {
    navigate("/approveLeavelist", {
      state: { activeTab: "CreateTeachersnote" },
    });
  };
  return (
    <div className="container mx-auto min-h-screen flex items-center justify-center mt-3 ">
      <ToastContainer />
      <div className="card p-4 rounded-md w-[66%] ">
        <div className=" card-header mb-4 flex justify-between items-center">
          <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
            Edit Leave Approve
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
        <p className="  md:absolute md:right-10  md:top-[11%]  text-gray-500  ">
          <span className="text-red-500">*</span>indicates mandatory information
        </p>

        <form
          // onSubmit={handleSubmit}
          className="flex items-center justify-center overflow-x-hidden shadow-md p-3 bg-gray-50 space-y-2" //min-h-screen flex items-center justify-center overflow-x-hidden shadow-md p-4 bg-gray-50
        >
          <div className="modal-body">
            <div className=" relative mb-3 flex justify-center  mx-4">
              <label htmlFor="sectionName" className="w-1/2 mt-2">
                Staff Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={100}
                id="teacher"
                name="teacher"
                pattern="^[^\d].*"
                title="Name should not start with a number"
                required
                value={formData.teachername}
                disabled
                className="w-full form-control shadow-md mb-2"
              />
              <div className="absolute top-9 left-1/3">
                {errors.teacher && (
                  <span className="text-danger text-xs">{errors.teacher}</span>
                )}
              </div>
            </div>

            <div className="relative mb-3 flex justify-center mx-4">
              <label htmlFor="leaveType" className="w-1/2 mt-2">
                Leave Type <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="leaveType"
                name="leaveType"
                value={formData.leavetypename}
                disabled
                className="w-full form-control shadow-md mb-2"
              />
              <div className="absolute top-9 left-1/3">
                {errors.leave_type_id && (
                  <span className="text-danger text-xs">
                    {errors.leave_type_id}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 relative mb-3 flex justify-center mx-4">
              <label htmlFor="startDate" className="w-1/2 mt-2">
                Leave Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="leave_start_date"
                name="leave_start_date"
                value={formData.leave_start_date}
                disabled
                className="w-full form-control shadow-md mb-2"
              />
              <div className="absolute top-9 left-1/3">
                {errors.leave_start_date && (
                  <span className="text-danger text-xs">
                    {errors.leave_start_date}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 relative mb-3 flex justify-center mx-4">
              <label htmlFor="endDate" className="w-1/2 mt-2">
                Leave End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="leave_end_date"
                name="leave_end_date"
                value={formData.leave_end_date}
                disabled
                className="w-full form-control shadow-md mb-2"
              />
              <div className="absolute top-9 left-1/3">
                {errors.leave_end_date && (
                  <span className="text-danger text-xs">
                    {errors.leave_end_date}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 relative mb-3 flex justify-center mx-4">
              <label htmlFor="no_of_days" className="w-1/2 mt-2">
                No. of days <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="no_of_days"
                name="no_of_days"
                value={formData.no_of_days}
                disabled
                className="w-full form-control shadow-md mb-2"
              />
              <div className="absolute top-9 left-1/3">
                {errors.no_of_days && (
                  <span className="text-danger text-xs">
                    {errors.no_of_days}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 relative mb-3 flex justify-center mx-4">
              <label htmlFor="status" className="w-1/2 mt-2">
                Status <span className="text-red-500">*</span>
              </label>
              <div className="w-full">
                <Select
                  id="status"
                  name="status"
                  options={statusOptions}
                  value={formData.status}
                  onChange={handleStatusChange}
                  className="shadow-inner"
                  classNamePrefix="react-select"
                  placeholder="Select"
                  isClearable
                />
              </div>
            </div>

            <div className=" relative mb-3 flex justify-center  mx-4">
              <label htmlFor="comment" className="w-1/2 mt-2">
                Reason
              </label>
              <textarea
                type="text"
                maxLength={200}
                id="reason"
                name="reason"
                value={formData.reason}
                // onChange={handleChange}
                rows="2"
                className="input-field resize block w-full border border-gray-300 rounded-md py-1 px-3 shadow-inner bg-gray-200"
                readOnly
              />{" "}
            </div>
            <div className=" relative mb-3 flex justify-center  mx-4">
              <label htmlFor="comment" className="w-1/2 mt-2">
                Approver's Comment
              </label>
              <textarea
                type="text"
                maxLength={200}
                id="reason_for_rejection"
                name="reason_for_rejection"
                value={formData.reason_for_rejection}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    reason_for_rejection: e.target.value,
                  })
                }
                className="input-field resize block w-full border border-gray-300 rounded-md py-1 px-3 shadow-inner"
                rows="2"
              />{" "}
            </div>
            <div className="col-span-3 text-right mt-4">
              <button
                className="mr-2 bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-700 
               disabled:bg-blue-300 disabled:cursor-not-allowed disabled:hover:bg-blue-300"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLeaveApproveTab;
