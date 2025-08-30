import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { RxCross1 } from "react-icons/rx";
import LoaderStyle from "../common/LoaderFinal/LoaderStyle";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Editor } from "@tinymce/tinymce-react";
import MarkDropdownEditor from "./MarkDropdownEditor";

const CreateEvent = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const academicYrTo = localStorage.getItem("academic_yr_to");
  const academicYrFrom = localStorage.getItem("academic_yr_from");

  const [allClasses, setAllClasses] = useState([]);
  const [subject, setSubject] = useState("");
  const [noticeDesc, setNoticeDesc] = useState("");
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [loading, setLoading] = useState(false); // Loader state

  const [errors, setErrors] = useState({
    title: "",
    description: "",
    startDate: "",
    classError: "",
    roleError: "",
  });

  const initialFormState = {
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    start_time: "",
    end_time: "",
    competition: false,
    notify: false,
    selectedRoles: [],
    selectedClasses: [],
  };

  const [value, setValue] = useState("");
  const [roles, setRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);

  const [formData, setFormData] = useState(initialFormState);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const [description, setDescription] = useState(""); // if separate
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [competition, setCompetition] = useState(false);
  const [notify, setNotify] = useState(false);

  useEffect(() => {
    fetchClassNames();
    fetchRoles();
  }, []);

  const fetchClassNames = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${API_URL}/api/getClassList`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllClasses(response.data || []);
    } catch (error) {
      toast.error("Error fetching class names");
    } finally {
      setLoading(false); // Stop loader
    }
  };

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${API_URL}/api/get_rolesforevent`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      //  Use only the actual array
      const rolesData = response.data?.data || [];
      setRoles(rolesData);
    } catch (error) {
      toast.error("Error fetching roles");
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (classId) => {
    let updatedClasses;
    if (selectedClasses.includes(classId)) {
      updatedClasses = selectedClasses.filter((id) => id !== classId);
    } else {
      updatedClasses = [...selectedClasses, classId];
    }

    setSelectedClasses(updatedClasses);

    // Clear classError if user selects any class
    if (updatedClasses.length > 0) {
      setErrors((prevErrors) => ({ ...prevErrors, classError: "" }));
    }
  };

  const handleSelectAllClasses = () => {
    let updatedClasses;
    if (selectedClasses.length === allClasses.length) {
      updatedClasses = [];
    } else {
      updatedClasses = allClasses.map((cls) => cls.class_id);
    }

    setSelectedClasses(updatedClasses);

    // Clear classError if user selects any class
    if (updatedClasses.length > 0) {
      setErrors((prevErrors) => ({ ...prevErrors, classError: "" }));
    }
  };

  const handleRoleChange = (roleId) => {
    let updatedRoles;
    if (selectedRoles.includes(roleId)) {
      updatedRoles = selectedRoles.filter((id) => id !== roleId);
    } else {
      updatedRoles = [...selectedRoles, roleId];
    }

    setSelectedRoles(updatedRoles);

    // Clear roleError if user selects any role
    if (updatedRoles.length > 0) {
      setErrors((prevErrors) => ({ ...prevErrors, roleError: "" }));
    }
  };

  const handleSelectAllRoles = () => {
    let updatedRoles;
    if (selectedRoles.length === roles.length) {
      updatedRoles = [];
    } else {
      updatedRoles = roles.map((role) => role.role_id);
    }

    setSelectedRoles(updatedRoles);

    if (updatedRoles.length > 0) {
      setErrors((prevErrors) => ({ ...prevErrors, roleError: "" }));
    }
  };

  const resetForm = () => {
    setSubject("");
    setNoticeDesc("");
    setSelectedClasses([]);
    setSelectedRoles([]);
    setStartDate("");
    setEndDate("");
    setStartTime("");
    setEndTime("");
    setCompetition(false);
    setNotify(false);
    setErrors({});
  };

  const handleSubmitAdd = async (shouldPublish = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const title = subject?.trim();
    const classList = selectedClasses;
    const roleList = selectedRoles;

    let formHasErrors = false;
    let errorMessages = {};

    // Validations
    if (!title) {
      formHasErrors = true;
      errorMessages.title = "Event title is required.";
      console.log("⚠️ Missing title");
    }

    if (!description?.trim()) {
      formHasErrors = true;
      errorMessages.description = "Description is required.";
      console.log("⚠️ Missing description");
    }

    if (!startDate) {
      formHasErrors = true;
      errorMessages.startDate = "Start date is required.";
      console.log("⚠️ Missing start date");
    }

    if (!classList || classList.length === 0) {
      formHasErrors = true;
      errorMessages.classError = "Please select at least one class.";
      console.log("⚠️ No class selected");
    }

    if (!roleList || roleList.length === 0) {
      formHasErrors = true;
      errorMessages.roleError = "Please select at least one role.";
      console.log("⚠️ No role selected");
    }

    if (formHasErrors) {
      setErrors(errorMessages);
      setIsSubmitting(false);
      toast.dismiss();
      // toast.error("Please fill all required fields.");
      return;
    }
    setErrors((prev) => ({
      ...prev,
      ...errorMessages, // only updates classError and roleError
    }));

    // Proceed with form submission...
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("No authentication token found. Please log in again.");
        setIsSubmitting(false);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("title", title);
      formDataToSend.append("description", description);
      formDataToSend.append("start_date", startDate);
      formDataToSend.append("end_date", endDate || "");
      formDataToSend.append("start_time", startTime || "00:00:00");
      formDataToSend.append("end_time", endTime || "00:00:00");
      formDataToSend.append("competition", competition ? "Y" : "N");
      formDataToSend.append("notify", notify ? "Y" : "N");
      formDataToSend.append("publish", shouldPublish ? "true" : "false");

      classList.forEach((cls) => formDataToSend.append("checkbxclass[]", cls));
      roleList.forEach((role) =>
        formDataToSend.append("checkbxlogintype[]", role)
      );

      const response = await axios.post(
        `${API_URL}/api/save_event`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const { data } = response;
      if (data.success) {
        toast.success("Event saved successfully!");
        resetForm();
        setErrors({});
        navigate("/event");
      } else {
        toast.error(data.message || "Event already exists or failed to save.");
      }
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error("Server error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAddPublish = async (shouldPublish = true) => {
    if (isPublishing) return;
    setIsPublishing(true);

    const title = subject?.trim();
    const classList = selectedClasses;
    const roleList = selectedRoles;

    let formHasErrors = false;
    let errorMessages = {};

    // Validations
    if (!title) {
      formHasErrors = true;
      errorMessages.title = "Event title is required.";
      console.log("⚠️ Missing title");
    }

    if (!description?.trim()) {
      formHasErrors = true;
      errorMessages.description = "Description is required.";
      console.log("⚠️ Missing description");
    }

    if (!startDate) {
      formHasErrors = true;
      errorMessages.startDate = "Start date is required.";
      console.log("⚠️ Missing start date");
    }

    if (!classList || classList.length === 0) {
      formHasErrors = true;
      errorMessages.classError = "Please select at least one class.";
      console.log("⚠️ No class selected");
    }

    if (!roleList || roleList.length === 0) {
      formHasErrors = true;
      errorMessages.roleError = "Please select at least one role.";
      console.log("⚠️ No role selected");
    }

    if (formHasErrors) {
      setErrors(errorMessages);
      setIsPublishing(false);
      toast.dismiss();
      // toast.error("Please fill all required fields.");
      return;
    }

    // Proceed with form submission...
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("No authentication token found. Please log in again.");
        setIsPublishing(false);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("title", title);
      formDataToSend.append("description", description);
      formDataToSend.append("start_date", startDate);
      formDataToSend.append("end_date", endDate || "");
      formDataToSend.append("start_time", startTime || "00:00:00");
      formDataToSend.append("end_time", endTime || "00:00:00");
      formDataToSend.append("competition", competition ? "Y" : "N");
      formDataToSend.append("notify", notify ? "Y" : "N");
      formDataToSend.append("publish", shouldPublish ? "true" : "false");

      classList.forEach((cls) => formDataToSend.append("checkbxclass[]", cls));
      roleList.forEach((role) =>
        formDataToSend.append("checkbxlogintype[]", role)
      );

      const response = await axios.post(
        `${API_URL}/api/save_savepublishevent`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const { data } = response;
      if (data.success) {
        toast.success("Event saved & Publish successfully!");
        resetForm();
        setErrors({});
        navigate("/event");
      } else {
        toast.error(
          data.message || "Event already exists or failed to save & publish."
        );
      }
    } catch (error) {
      console.error("Error saving & publishing event:", error);
      toast.error("Server error. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div>
      <ToastContainer />
      <div className="container mb-4">
        <div className="card-header flex justify-between items-center"></div>
        <div className="w-[75%] mx-auto">
          <div className="container mt-4">
            <div className="card mx-auto lg:w-full shadow-lg">
              <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl">
                  Create New Event
                </h3>
                <RxCross1
                  className="text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                  type="button"
                  onClick={() => navigate("/event")}
                />
              </div>
              <div
                className="relative h-1 w-[97%] mx-auto"
                style={{ backgroundColor: "#C03078" }}
              ></div>
              <div className="">
                <div className="card-body w-full ml-2">
                  {loading ? (
                    <div className="flex justify-center items-center h-64">
                      <LoaderStyle />
                    </div>
                  ) : (
                    <div className="card-body w-full ml-2">
                      <form className="space-y-6">
                        {/* Event Title */}
                        {/* <div className="flex flex-col gap-1">
                          <div className="flex flex-col lg:flex-row lg:items-center gap-2">
                            <label className="lg:w-[130px] font-semibold">
                              Event Title{" "}
                              <span className="text-sm text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              className="w-full lg:max-w-md px-2 py-1 border border-gray-400 rounded"
                              value={subject}
                              onChange={(e) => {
                                setSubject(e.target.value);
                                setErrors((prev) => ({ ...prev, title: "" }));
                              }}
                            />
                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={competition}
                                  onChange={(e) =>
                                    setCompetition(e.target.checked)
                                  }
                                />
                                <span>Competition</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={notify}
                                  onChange={(e) => setNotify(e.target.checked)}
                                />
                                <span>Notify</span>
                              </label>
                            </div>
                          </div>
                          {errors.title && (
                            <p className="text-red-500 text-sm lg:ml-[147px]">
                              {errors.title}
                            </p>
                          )}
                        </div> */}

                        <div className="flex flex-col gap-1">
                          <div className="flex flex-col lg:flex-row lg:items-center gap-2">
                            <label className="lg:w-[130px] font-semibold">
                              Event Title{" "}
                              <span className="text-sm text-red-500">*</span>
                            </label>

                            <input
                              type="text"
                              className="w-full lg:w-[400px] px-2 py-1 border-1 border-gray-400 rounded"
                              value={subject}
                              onChange={(e) => {
                                setSubject(e.target.value);
                                setErrors((prev) => ({ ...prev, title: "" }));
                              }}
                            />

                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={competition}
                                  onChange={(e) =>
                                    setCompetition(e.target.checked)
                                  }
                                />
                                <span>Competition</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={notify}
                                  onChange={(e) => setNotify(e.target.checked)}
                                />
                                <span>Notify</span>
                              </label>
                            </div>
                          </div>

                          {errors.title && (
                            <p className="text-red-500 text-sm lg:ml-[147px]">
                              {errors.title}
                            </p>
                          )}
                        </div>

                        {/* Select Classes */}
                        <div className="flex flex-col lg:flex-row gap-3">
                          <label className="font-semibold lg:w-[147px]">
                            Select Classes{" "}
                            <span className="text-sm text-red-500">*</span>
                          </label>
                          <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                            {allClasses.map((cls) => (
                              <div
                                key={cls.class_id}
                                className="flex items-center space-x-2 hover:cursor-pointer"
                                onClick={() => handleClassChange(cls.class_id)}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedClasses.includes(
                                    cls.class_id
                                  )}
                                  onChange={() =>
                                    handleClassChange(cls.class_id)
                                  }
                                  className="cursor-pointer"
                                />
                                <label className="cursor-pointer">
                                  {cls.name}
                                </label>
                              </div>
                            ))}
                            <div className="flex items-center space-x-2">
                              <label className="cursor-pointer flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={
                                    selectedClasses.length === allClasses.length
                                  }
                                  onChange={handleSelectAllClasses}
                                  className="cursor-pointer"
                                />
                                <span>Select All</span>
                              </label>
                            </div>
                            {errors.classError && (
                              <p className="col-span-full text-red-500 text-sm">
                                {errors.classError}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Login Type */}
                        <div className="flex flex-col lg:flex-row gap-3">
                          <label className="font-semibold lg:w-[147px]">
                            Login Type{" "}
                            <span className="text-sm text-red-500">*</span>
                          </label>
                          <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                            {roles.map((cls) => (
                              <div
                                key={cls.role_id}
                                className="flex items-center space-x-2 hover:cursor-pointer"
                                onClick={() => handleRoleChange(cls.role_id)}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedRoles.includes(cls.role_id)}
                                  onChange={() => handleRoleChange(cls.role_id)}
                                  className="cursor-pointer"
                                />
                                <label className="cursor-pointer">
                                  {cls.name}
                                </label>
                              </div>
                            ))}
                            <div className="flex items-center space-x-2">
                              <label className="cursor-pointer flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={
                                    selectedRoles.length === roles.length
                                  }
                                  onChange={handleSelectAllRoles}
                                  className="cursor-pointer"
                                />
                                <span>Select All</span>
                              </label>
                            </div>
                            {errors.roleError && (
                              <p className="col-span-full text-red-500 text-sm">
                                {errors.roleError}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Dates and Times */}
                        <div className="grid md:grid-cols-2 gap-2">
                          {/* Start Date */}
                          <div className="flex flex-col">
                            <div className="flex flex-col lg:flex-row lg:items-center">
                              <label className="lg:w-[140px] font-semibold">
                                Start Date{" "}
                                <span className="text-sm text-red-500">*</span>
                              </label>
                              <input
                                type="date"
                                className="w-full lg:w-[55%] border px-2 py-1 rounded max-w-sm"
                                value={startDate}
                                onChange={(e) => {
                                  setStartDate(e.target.value);
                                  setErrors((prev) => ({
                                    ...prev,
                                    startDate: "",
                                  }));
                                }}
                                min={academicYrFrom}
                                max={academicYrTo}
                              />
                            </div>
                            <div className="min-h-[22px] lg:ml-[150px] mt-1">
                              {errors.startDate && (
                                <p className="text-red-500 text-sm">
                                  {errors.startDate}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* End Date */}
                          <div className="flex flex-col">
                            <div className="flex flex-col lg:flex-row lg:items-center">
                              <label className="lg:w-[100px] font-semibold">
                                End Date
                              </label>
                              <input
                                type="date"
                                className="w-full lg:w-[55%] border px-2 py-1 rounded max-w-sm"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={academicYrFrom}
                                max={academicYrTo}
                              />
                            </div>
                          </div>

                          {/* Start Time */}
                          <div className="flex flex-col">
                            <div className="flex flex-col lg:flex-row lg:items-center">
                              <label className="lg:w-[140px] font-semibold">
                                Start Time
                              </label>
                              <input
                                type="time"
                                className="w-full lg:w-[55%] border px-2 py-1 rounded max-w-sm"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                              />
                            </div>
                            <div className="min-h-[22px] lg:ml-[150px] mt-1">
                              {errors.startTime && (
                                <p className="text-red-500 text-sm">
                                  {errors.startTime}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* End Time */}
                          <div className="flex flex-col">
                            <div className="flex flex-col lg:flex-row lg:items-center">
                              <label className="lg:w-[100px] font-semibold">
                                End Time
                              </label>
                              <input
                                type="time"
                                className="w-full lg:w-[55%] border px-2 py-1 rounded max-w-sm"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="flex flex-col">
                          <label className="font-semibold">
                            Description{" "}
                            <span className="text-sm text-red-500">*</span>
                          </label>
                          <div className="max-w-4xl w-full">
                            <MarkDropdownEditor
                              value={description}
                              onChange={(val) => {
                                setDescription(val);
                                setErrors((prev) => ({
                                  ...prev,
                                  description: "",
                                }));
                              }}
                            />
                            {errors.description && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </form>
                    </div>
                  )}
                </div>

                {!loading && (
                  <div className="flex flex-wrap justify-end gap-2 m-4">
                    <button
                      onClick={() => handleSubmitAdd(false)}
                      className="btn btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => handleSubmitAddPublish(true)}
                      className="btn btn-primary"
                      disabled={isPublishing}
                    >
                      {isPublishing ? "Publishing..." : "Save & Publish"}
                    </button>
                    <button
                      onClick={resetForm}
                      className="btn btn-danger bg-gray-500 text-white rounded-md hover:bg-gray-600"
                      disabled={isSubmitting}
                    >
                      Reset
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
