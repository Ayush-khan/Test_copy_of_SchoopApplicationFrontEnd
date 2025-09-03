import React, { useEffect, useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import Select from "react-select";

const EditApproveStationery = () => {
  const location = useLocation();
  const API_URL = import.meta.env.VITE_API_URL;
  const [loading, setLoading] = useState(false);

  let { allstationery } = location.state || {};

  console.log("all stationery for editing", allstationery);

  const statusOptions = [
    { value: "P", label: "Approve" },
    { value: "H", label: "Hold" },
    { value: "R", label: "Rejected" },
  ];

  const [formData, setFormData] = useState({
    teacher_name: "",
    stationery_name: "",
    requisition_id: "",
    approved_date: "",
    approved_by: "",
    status: { value: "Approve", label: "Approve" },
    quantity: "",
    description: "",
    comments: "",
    approverscomment: "",
  });

  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [staffs, setStaffs] = useState([]);
  const [sesstion, setSession] = useState("");
  const [regId, setRegId] = useState(null);

  const navigate = useNavigate();
  const MAX_DATE = "2006-12-31";
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchLeaves();
    fetchSession();
  }, []);

  const fetchSession = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(`${API_URL}/api/sessionData`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      console.log("session data", response.data);
      setSession(response.data);

      const reg_id = response.data.user?.reg_id;
      console.log("reg_id", reg_id);
      setRegId(reg_id); // save in state
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        `${API_URL}/api/get_approvestationerylist`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      console.log("approve stationery data", response.data.data);
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

  const toTitleCase = (str = "") => {
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  useEffect(() => {
    if (allstationery) {
      setFormData({
        teacher_name: allstationery.teacher_name
          ? toTitleCase(allstationery.teacher_name)
          : "",
        stationery_name: allstationery.stationery_name || "",
        requisition_id: allstationery.requisition_id || "",
        approved_date: allstationery.approved_date || "",
        date: allstationery.date || "",
        status:
          statusOptions.find((opt) => opt.value === allstationery.status) ||
          statusOptions[0],
        quantity: allstationery.quantity || "",
        description: allstationery.description || "",
        comments: allstationery.comments || "",
      });
    }
  }, [allstationery, API_URL]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2); // Last 2 digits of the year
    return `${day}-${month}-${year}`;
  };

  const handleSubmit = async () => {
    if (!allstationery?.requisition_id) {
      toast.error("Invalid leave application ID.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      const form = new FormData();
      form.append("status", formData.status?.value || "A");
      form.append("comments", formData.comments || "");
      form.append("approved_by", regId);

      const response = await axios.post(
        `${API_URL}/api/update_approvestationerylist/${allstationery.requisition_id}`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data", // crucial for FormData
          },
        }
      );

      if (response.status === 200) {
        toast.success("Stationery status updated successfully!");
        fetchLeaves();
        navigate("/approveStationery");
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

  return (
    <div className="container mx-auto min-h-screen flex items-center justify-center mt-3 ">
      <ToastContainer />
      <div className="card rounded-md w-[55%] ">
        <div className=" card-header mb-4 flex justify-between items-center">
          <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
            Edit Approve Stationery
          </h5>

          <RxCross1
            className="float-end relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
            onClick={() => {
              setErrors({});
              navigate("/approveStationery");
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
                Requisition Id <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={100}
                id="teacher"
                name="teacher"
                pattern="^[^\d].*"
                title="Name should not start with a number"
                required
                value={formData.requisition_id}
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
                Stationery Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="leaveType"
                name="leaveType"
                value={formData.stationery_name}
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
                Raised By<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="leave_start_date"
                name="leave_start_date"
                value={formData.teacher_name}
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
                Raised On <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="leave_end_date"
                name="leave_end_date"
                value={formatDate(formData.date)}
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
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="no_of_days"
                name="no_of_days"
                value={formData.quantity}
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

            <div className=" relative mb-3 flex justify-center  mx-4">
              <label htmlFor="comment" className="w-1/2 mt-2">
                Description
              </label>
              <textarea
                type="text"
                maxLength={200}
                id="reason"
                name="reason"
                value={formData.description}
                // onChange={handleChange}
                rows="2"
                className="input-field resize block w-full border border-gray-300 rounded-md py-1 px-3 shadow-inner bg-gray-200"
                readOnly
              />{" "}
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
              <label htmlFor="comments" className="w-1/2 mt-2">
                Approver's Comment
              </label>
              <textarea
                type="text"
                maxLength={200}
                id="comments"
                name="comments"
                value={formData.comments}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    comments: e.target.value,
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

export default EditApproveStationery;
