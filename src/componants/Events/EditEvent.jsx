import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { RxCross1 } from "react-icons/rx";
import LoaderStyle from "../common/LoaderFinal/LoaderStyle";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Editor } from "@tinymce/tinymce-react";
import MarkDropdownEditor from "./MarkDropdownEditor";

const EditEvent = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const { state } = useLocation(); // get passed state
  const { id } = useParams(); // get event ID from URL
  console.log("id", id);

  const [allClasses, setAllClasses] = useState([]);

  const [noticeDesc, setNoticeDesc] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [errors, setErrors] = useState({
    subjectError: "",
    noticeDescError: "",
    classError: "",
  });

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [competition, setCompetition] = useState(false);
  const [notify, setNotify] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem("authToken");

        const response = await axios.get(`${API_URL}/api/get_eventdata/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = response.data.data[0];
        console.log("response", response);

        setSubject(data.title || ""); // Event Title
        setSelectedClasses(data.classes || []);

        setSelectedRoles(() => {
          const loginTypes = Array.isArray(data.login_type)
            ? data.login_type
            : typeof data.login_type === "string"
            ? data.login_type.split(",")
            : [];

          return loginTypes
            .map((id) => {
              if (id === "A") return "Admin"; // Static mapping for A
              const role = roles.find((r) => String(r.role_id) === String(id));
              return role?.name || id; // Show role name if found, or fallback to ID
            })
            .filter(Boolean); // Remove null/undefined
        });

        setStartDate(data.start_date || "");
        setEndDate(data.end_date || "");
        setStartTime(data.start_time || "");
        setEndTime(data.end_time || "");
        setDescription(data.event_desc || "");
        // setCompetition(data.competition === "Y");
        // setNotify(data.notify === "Y");
        setCompetition(String(data.competition).toUpperCase() === "Y");
        setNotify(String(data.notify).toUpperCase() === "Y");
      } catch (error) {
        console.error("Error fetching event:", error);
      }
    };

    fetchEvent();
  }, [id]);

  // const [formData, setFormData] = useState({
  //   title: state?.title || "",
  //   description: state?.event_desc || "",
  //   startDate: state?.start_date || "",
  //   endDate: state?.end_date || "",
  //   startTime: state?.start_time || "",
  //   endTime: state?.end_time || "",
  //   competition: state?.competition === "Y",
  //   notify: state?.notify === "Y",
  // });

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
      console.log("roles data", rolesData);
      setRoles(rolesData);
    } catch (error) {
      toast.error("Error fetching roles");
    } finally {
      setLoading(false);
    }
  };
  const resetForm = () => {
    setSubject("");
    setNoticeDesc("");
    setSelectedClasses([]);
    setUploadedFiles([]);
    setErrors({});
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const payload = {
        title: subject,
        description: description,
        start_date: startDate,
        end_date: endDate,
        start_time: startTime,
        end_time: endTime,
        competition: competition ? "Y" : "N",
        notify: notify ? "Y" : "N",
        classes: selectedClasses,
        login_type: selectedRoles.join(","),
      };

      console.log("Sending update payload:", payload);

      const response = await axios.put(
        `${API_URL}/api/update_eventbyunqid/${id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status) {
        toast.success("Event updated successfully");
        navigate("/event");
      } else {
        toast.error("Update failed");
      }
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("An error occurred while updating");
    }
  };

  return (
    <div>
      <ToastContainer />
      <div className="container mb-4">
        <div className="card-header flex justify-between items-center"></div>
        <div className="w-[80%] mx-auto">
          <div className="container mt-4">
            <div className="card mx-auto lg:w-full shadow-lg">
              <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl">
                  Edit Event
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
                      <form className="space-y-5">
                        {/* Event Title */}
                        <div className="flex items-center">
                          {/* Label */}
                          <label className="w-[145px] font-semibold">
                            Event Title{" "}
                            <span className="text-sm text-red-500">*</span>
                          </label>

                          {/* Input with specific spacing */}
                          <input
                            type="text"
                            className="w-full max-w-md px-2 py-1 border border-gray-400 rounded mr-8" // <- sets custom gap
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                          />

                          {/* Checkboxes with separate spacing */}
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={competition}
                                onChange={(e) =>
                                  setCompetition(e.target.checked)
                                }
                              />{" "}
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

                        {/* Select Classes */}
                        <div className="flex flex-col md:flex-row gap-9">
                          <label className="font-semibold">
                            Select Classes
                            <span className="text-sm text-red-500">*</span>
                          </label>
                          {Array.isArray(selectedClasses) && (
                            <input
                              type="text"
                              className="w-full max-w-md px-2 py-1 border border-gray-400 bg-gray-200 rounded"
                              value={selectedClasses
                                .map((c) => c.class_name)
                                .join(", ")}
                              readOnly
                            />
                          )}
                        </div>

                        {/* Login Type */}
                        <div className="flex flex-col md:flex-row gap-14">
                          <label className="font-semibold">
                            Login Type
                            <span className="text-sm text-red-500">*</span>
                          </label>

                          {Array.isArray(selectedRoles) && (
                            <input
                              type="text"
                              className="w-full max-w-md px-2 py-1 border border-gray-400 bg-gray-200 rounded"
                              value={selectedRoles
                                .map((type) => {
                                  const matched = roles.find(
                                    (r) => r.role_id === type.trim()
                                  );
                                  return matched ? matched.name : type;
                                })
                                .join(", ")}
                              readOnly
                            />
                          )}
                        </div>

                        {/* Dates and Times */}

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center">
                            <label className="w-[144px] font-semibold">
                              Start Date
                              <span className="text-sm text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              className="w-[50%] border px-2 py-1 rounded max-w-sm"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                            />
                          </div>
                          <div className="flex items-center ">
                            <label className="w-[100px] font-semibold">
                              End Date
                              {/* <span className="text-sm text-red-500">*</span> */}
                            </label>
                            <input
                              type="date"
                              className="w-[50%] border px-2 py-1 rounded max-w-sm"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                            />
                          </div>
                          <div className="flex items-center">
                            <label className="w-[144px] font-semibold">
                              Start Time
                              {/* <span className="text-sm text-red-500">*</span> */}
                            </label>
                            <input
                              type="time"
                              className="w-[50%] border px-2 py-1 rounded max-w-sm"
                              value={startTime}
                              onChange={(e) => setStartTime(e.target.value)}
                            />
                          </div>
                          <div className="flex items-center">
                            <label className="w-[100px] font-semibold">
                              End Time
                              {/* <span className="text-sm text-red-500">*</span> */}
                            </label>
                            <input
                              type="time"
                              className="w-[50%]  border px-2 py-1 rounded max-w-sm"
                              value={endTime}
                              onChange={(e) => setEndTime(e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Description */}
                        <div className="flex flex-col gap-2">
                          <label className="font-semibold">
                            Description{" "}
                            <span className="text-sm text-red-500">*</span>
                          </label>
                          <div className="max-w-4xl w-full">
                            {
                              <MarkDropdownEditor
                                value={description}
                                onChange={setDescription}
                              />
                            }
                          </div>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
                {!loading && (
                  <div className="flex space-x-2 justify-end m-4">
                    <button
                      onClick={handleUpdate}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-600 text-white rounded"
                    >
                      Update
                    </button>

                    <button
                      onClick={resetForm}
                      className="btn btn-danger bg-gray-500 text-white rounded-md hover:bg-gray-600"
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

      {}
    </div>
  );
};

export default EditEvent;
