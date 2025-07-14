import React, { useEffect, useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

const ViewTicket = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [comments, setComments] = useState("");
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(""); // Add status state
  const [ticket, setTicket] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [commentList, setCommentList] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [statusOptions, setStatusOptions] = useState([]);
  const [appointmentTimes, setAppointmentTimes] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [initialData, setInitialData] = useState({});
  const [requiresAppointment, setRequiresAppointment] = useState("");

  const navigate = useNavigate();

  const { id } = useParams();

  console.log("id", id);

  useEffect(() => {
    fetchTicketDetails();
  }, [id]);

  useEffect(() => {
    if (ticket) {
      setInitialData({
        status: ticket.status,
        comment: ticket.comment,
        appointment_date_time: ticket.appointment_date_time,
        files: [], // assuming no default files
      });

      // Also set them in the form state if not already done
      setStatus(ticket.status);
      setComments(ticket.comment);
      setSelectedAppointment(ticket.appointment_date_time);
    }
  }, [ticket]);

  const fetchTicketDetails = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/api/get_ticketinformation/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.data) {
        const ticketData = response.data.data || [];
        setTicket(ticketData);
        console.log("require", ticketData[0]?.RequiresAppointment);
        setRequiresAppointment(ticketData[0]?.RequiresAppointment);

        // Get class_id from the first ticket item (adjust if needed)
        const classId = ticketData[0]?.class_id;
        if (classId) {
          fetchAppointmentTimes(classId);
        }
      }
    } catch (error) {
      console.error("Failed to fetch ticket details:", error);
    }
  };

  const fetchAppointmentTimes = async (classId) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/api/get_appointmenttimelist/${classId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.data) {
        setAppointmentTimes(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch appointment times:", error);
    }
  };

  useEffect(() => {
    const fetchStatusOptions = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          `${API_URL}/api/get_statusesforticketlist`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data?.data) {
          const transformedOptions = response.data.data.map((item) => ({
            value: item.status,
            label: item.status,
          }));
          setStatusOptions(transformedOptions);
        }
      } catch (error) {
        console.error("Failed to fetch status options", error);
      }
    };

    fetchStatusOptions();
  }, []);

  const handleViewComments = async () => {
    setIsModalOpen(true);
    setLoadingComments(true);

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/api/get_commentticketlist/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response?.data?.data) {
        setCommentList(response.data.data);
      } else {
        setCommentList([]);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      toast.error("Failed to load comments.");
    } finally {
      setLoadingComments(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    console.log("Status changed to:", e.target.value);
  };

  const handleRadioChange = (value) => {
    if (status === "Approved") {
      setSelectedAppointment(value);
    } else {
      toast.error("Please select status as Approved first!!");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    // Check for changes
    const isUnchanged =
      status === initialData.status &&
      comments === initialData.comment &&
      (selectedAppointment || "") ===
        (initialData.appointment_date_time || "") &&
      selectedFiles.length === 0;

    if (isUnchanged) {
      toast.error(
        "No changes detected. Please modify a field before submitting."
      );
      setIsSaving(false);
      return;
    }

    if (
      status === "Approved" &&
      requiresAppointment === "Y" &&
      appointmentTimes.length === 0
    ) {
      toast.error("Please Create Appointment window first for date & time.");
      setIsSaving(false);
      return;
    } else if (
      status === "Approved" &&
      requiresAppointment === "Y" &&
      !selectedAppointment
    ) {
      toast.error("Please select Date and Time for Approved status.");
      setIsSaving(false);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const formData = new FormData();

      formData.append("status", status);
      formData.append("comment", comments || "");
      formData.append(
        "appointment_date_time",
        selectedAppointment || ticket?.appointment_date_time || ""
      );

      selectedFiles.forEach((file) => {
        formData.append("fileupload", file);
      });

      const response = await axios.post(
        `${API_URL}/api/save_ticketinformation/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      console.log("save api response", response);

      if (response.data.status === 200) {
        toast.success("Ticked Status Update Successfully!");
        setTimeout(() => {
          navigate("/ticketList");
        }, 2000);
      } else {
        toast.error(response.data.message || "Save failed.");
      }
    } catch (error) {
      console.error("Error saving ticket:", error);
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
      setIsSaving(false);
    }
  };

  const handleDownload = async (ticketId, commentId, fileName) => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token || !ticketId || !commentId || !fileName) {
        throw new Error("Missing required information for download.");
      }

      console.log(token);
      console.log(ticketId);
      console.log(commentId);
      console.log(fileName);

      const response = await axios.get(
        `${API_URL}/api/downloadticketfiles/${ticketId}/${commentId}/${fileName}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      if (response.status === 200) {
        const contentDisposition = response.headers["content-disposition"];
        let filename = fileName;

        if (contentDisposition) {
          const match = contentDisposition.match(/filename="?(.+?)"?$/);
          if (match && match[1]) {
            filename = match[1];
          }
        }

        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success("File downloaded successfully!");
      } else {
        throw new Error("Failed to download file");
      }
    } catch (error) {
      console.error("Download Error:", error);
      toast.error("An error occurred during file download");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr)
      .toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
      .replace(",", " ,")
      .toLowerCase();
  };

  const filteredSections = Array.isArray(ticket)
    ? ticket.filter((t) => {
        if (!searchTerm.trim()) return true;

        const searchLower = searchTerm.toLowerCase();
        const studentName = t?.first_name?.toLowerCase() || "";
        const serviceName = t?.service_name?.toLowerCase() || "";
        const ticketId = t?.ticket_id?.toString().toLowerCase() || "";
        const title = t?.title?.toLowerCase() || "";
        const status = t?.status?.toLowerCase() || "";

        return (
          studentName.includes(searchLower) ||
          serviceName.includes(searchLower) ||
          ticketId.includes(searchLower) ||
          title.includes(searchLower) ||
          status.includes(searchLower)
        );
      })
    : [];

  console.log("Filtered Sections", filteredSections);

  useEffect(() => {
    if (Array.isArray(ticket) && ticket.length > 0) {
      setStatus(ticket[0]?.status || "New");
    }
  }, [ticket]);

  return (
    <div className="w-full px-4 md:px-8 mt-3">
      <div className="card p-4 rounded-md w-full md:w-[80%] mx-auto">
        <ToastContainer />
        <div className=" card-header mb-4 flex justify-between items-center">
          <h5 className="text-gray-700 mt-1 text-md lg:text-lg">View Ticket</h5>

          <RxCross1
            className="float-end relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
            onClick={() => {
              setErrors({});
              navigate("/ticketList");
            }}
          />
        </div>
        <div
          className=" relative w-full -top-6 h-1  mx-auto bg-red-700"
          style={{
            backgroundColor: "#C03078",
          }}
        ></div>

        {/* Main Content */}
        {filteredSections.map((ticket, index) => (
          <div key={index} className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Student Details Card */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2">
                <div className="flex items-center space-x-4">
                  <div className="pl-3">
                    <i className="fas fa-user-graduate text-lg text-white"></i>
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    Student Details
                  </h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-user text-purple-500"></i>
                    <span className="text-gray-600 font-medium">
                      Student Name
                    </span>
                  </div>
                  <span className="text-gray-800 font-semibold">
                    {ticket.first_name} {ticket.mid_name} {ticket.last_name}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-school text-purple-500"></i>
                    <span className="text-gray-600 font-medium">
                      Class & Division
                    </span>
                  </div>
                  <span className="text-gray-800 font-semibold">
                    {ticket.classname} ({ticket.sectionname})
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-id-card text-purple-500"></i>
                    <span className="text-gray-600 font-medium">Roll No</span>
                  </div>
                  <span className="text-gray-800 font-semibold">
                    {ticket.roll_no}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-barcode text-purple-500"></i>
                    <span className="text-gray-600 font-medium">GRN No</span>
                  </div>
                  <span className="text-gray-800 font-semibold">
                    {ticket.reg_no}
                  </span>
                </div>
              </div>
            </div>

            {/* Ticket Details Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2">
                <div className="flex items-center space-x-4">
                  <div className="pl-3">
                    <i className="fas fa-clipboard-list text-lg text-white"></i>
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    Ticket Details ({ticket.ticket_id})
                  </h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {/* Status Dropdown */}
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-600 font-medium">Status</span>
                  </div>
                  <div className="relative">
                    <select
                      value={status}
                      onChange={handleStatusChange}
                      className="rounded-full px-4 py-2 shadow-sm border border-gray-300 font-semibold appearance-none pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <i className="fas fa-chevron-down text-xs text-gray-600"></i>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-calendar-plus text-blue-500"></i>
                    <span className="text-gray-600 font-medium">Raised on</span>
                  </div>
                  <span className="text-gray-800 font-semibold">
                    {ticket.raised_on ? formatDate(ticket.raised_on) : ""}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-cogs text-blue-500"></i>
                    <span className="text-gray-600 font-medium">
                      Service Name
                    </span>
                  </div>
                  <span className="text-gray-800 font-semibold">
                    {ticket.service_name}
                  </span>
                </div>
                {ticket.document && ticket.document.trim() !== "" && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <i className="fas fa-cogs text-blue-500"></i>
                      <span className="text-gray-600 font-medium">
                        Sub service Name
                      </span>
                    </div>
                    <span className="text-gray-800 font-semibold">
                      {ticket.document}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-heading text-blue-500"></i>
                    <span className="text-gray-600 font-medium">Title</span>
                  </div>
                  <span className="text-gray-800 font-semibold">
                    {ticket.title}
                  </span>
                </div>
                <div className="py-3 border-b border-gray-100">
                  <div className="flex items-start space-x-3">
                    <div className="flex items-center space-x-2 min-w-[120px]">
                      <i className="fas fa-align-left text-blue-500"></i>
                      <span className="text-gray-600 font-medium">
                        Description
                      </span>
                    </div>
                    <p className="text-gray-900 bg-gray-50 p-2 rounded-lg w-full">
                      {ticket.description}
                    </p>
                  </div>
                </div>
                {ticket.RequiresAppointment === "Y" && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    {/* Label with icon */}
                    <div className="flex items-center space-x-3">
                      <i className="fas fa-clock text-blue-500"></i>
                      <span className="text-gray-600 font-medium">
                        Date & Time
                      </span>
                    </div>

                    {/* Selected appointment time OR radio buttons */}
                    <div className="text-right">
                      {appointmentTimes.length > 0 ? (
                        <div className="space-y-2">
                          {appointmentTimes.map((timeSlot, index) => (
                            <label
                              key={index}
                              className="flex items-center space-x-2 justify-end"
                            >
                              <input
                                type="radio"
                                name={`appointment-time-${ticket.ticket_id}`} // to make it unique per ticket
                                value={timeSlot.value}
                                checked={selectedAppointment === timeSlot.value}
                                onChange={() =>
                                  handleRadioChange(timeSlot.value)
                                }
                                className="text-blue-800 focus:ring-blue-800"
                              />
                              <span className="text-gray-800 text-sm">
                                {timeSlot.display}
                              </span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-800 font-semibold">
                          Not Available
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Actions Section */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attachment Section */}
          <div className="bg-white rounded-2xl shadow-xl p-3">
            <div className="flex items-center space-x-3 mb-4">
              <i className="fas fa-paperclip text-2xl text-green-500"></i>
              <h3 className="text-xl font-bold text-gray-800">Attachments</h3>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400">
              <i className="fas fa-cloud-upload-alt text-2xl text-gray-400 mb-2"></i>
              <p className="text-gray-600 mb-2">Upload supporting documents</p>

              <input
                type="file"
                id="file-upload"
                multiple
                className="hidden"
                onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
              />

              <label
                htmlFor="file-upload"
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg cursor-pointer transition-colors duration-300 inline-flex items-center space-x-2"
              >
                <span>Choose Files</span>
              </label>

              {/* Display selected file names */}
              {selectedFiles?.length > 0 && (
                <div className="mt-4 text-left">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Selected File:
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {selectedFiles.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <i className="fas fa-comments text-2xl text-pink-500"></i>
              <h3 className="text-xl font-bold text-gray-800">Comments</h3>
            </div>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows="2"
              className="w-full border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              placeholder="Add your comments here..."
            ></textarea>
            <div className="flex justify-end mt-3">
              <button
                onClick={handleViewComments}
                type="button"
                className="flex-2 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg  justify-center space-x-2"
              >
                {/* <i className="fas fa-history"></i> */}
                <span>View Comment</span>
              </button>
            </div>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="mt-8 flex justify-end space-x-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className={`bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl ${
              isSaving ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <span className="font-semibold">
              {isSaving ? "Saving..." : "Save"}
            </span>
          </button>
        </div>

        {/* Comments History Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-6xl shadow-2xl transform scale-100 transition-all duration-300">
              {/* Modal Header */}
              <div className="bg-gradient-to-r  from-purple-600 to-pink-600 p-3 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-history text-base text-white"></i>
                    <h2 className="text-2xl font-bold text-white">
                      Comments History
                    </h2>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors duration-300"
                  >
                    <i className="fas fa-times text-white"></i>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 max-h-96 overflow-y-auto">
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="p-2 text-center text-sm font-semibold text-gray-600 border border-gray-300">
                          Date
                        </th>
                        <th className="p-2 text-center text-sm font-semibold text-gray-600 border border-gray-300">
                          Status
                        </th>
                        <th className="p-2 text-center text-sm font-semibold text-gray-600 border border-gray-300">
                          Comments
                        </th>
                        <th className="p-2 text-center text-sm font-semibold text-gray-600 border border-gray-300">
                          User
                        </th>
                        <th className="p-2 text-center text-sm font-semibold text-gray-600 border border-gray-300">
                          Attachment
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingComments ? (
                        <tr>
                          <td
                            colSpan="6"
                            className="text-center py-6 text-blue-600 font-semibold border border-gray-300"
                          >
                            Loading comments...
                          </td>
                        </tr>
                      ) : commentList.length === 0 ? (
                        <tr>
                          <td
                            colSpan="6"
                            className="text-center text-gray-500 py-6 border border-gray-300"
                          >
                            <div className="flex flex-col items-center space-y-2">
                              <i className="fas fa-inbox text-4xl text-gray-300"></i>
                              <p className="text-lg">No comments available</p>
                              <p className="text-sm">
                                Comments will appear here when added
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        commentList.map((comment, index) => (
                          <tr
                            key={index}
                            className="hover:bg-gray-50 text-center"
                          >
                            <td className="p-2 text-sm text-gray-700 border border-gray-300">
                              {comment.date
                                ? comment.date
                                    .split(" ")[0]
                                    .split("-")
                                    .reverse()
                                    .join("/")
                                : ""}
                            </td>

                            <td className="p-2 text-sm text-gray-700 border border-gray-300">
                              {comment.status || ""}
                            </td>
                            <td className="p-2 text-sm text-gray-700 border border-gray-300">
                              {comment.comment || ""}
                            </td>
                            <td className="p-2 text-sm text-gray-700 border border-gray-300">
                              {comment.login_type || ""} {comment.name || ""}
                            </td>
                            <td className="p-2 text-sm text-gray-700 border border-gray-300">
                              {comment.image_url ? (
                                <div className="flex items-center space-x-2">
                                  <a
                                    // href={comment.image_url}
                                    // target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 underline"
                                  >
                                    {comment.image_url.split("/").pop()}
                                  </a>
                                  {/* <a
                                    href={comment.image_url}
                                    download
                                    className="text-green-600 hover:text-green-800"
                                    title="Download File"
                                  >
                                    <i className="fas fa-download"></i>
                                  </a> */}

                                  {console.log(
                                    "Ticket comment",
                                    comment.ticket_comment_id
                                  )}
                                  {console.log("Ticket id", comment.ticket_id)}
                                  {console.log("name", comment.image_name)}

                                  <button
                                    onClick={() =>
                                      handleDownload(
                                        comment.ticket_id,
                                        comment.ticket_comment_id,
                                        comment.image_name
                                      )
                                    }
                                    className="text-green-600 hover:text-green-800"
                                    title="Download File"
                                  >
                                    <i className="fas fa-download"></i>
                                  </button>
                                </div>
                              ) : (
                                ""
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 p-2 rounded-b-2xl flex justify-end">
                <button
                  onClick={handleCloseModal}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors duration-300 flex items-center space-x-2"
                >
                  <span>Close</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewTicket;
