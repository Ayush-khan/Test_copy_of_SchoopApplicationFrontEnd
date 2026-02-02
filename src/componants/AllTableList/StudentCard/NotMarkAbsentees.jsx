import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import LoaderStyle from "../../common/LoaderFinal/LoaderStyle";
import Select from "react-select";
import { IoMdSend } from "react-icons/io";
import { FaCheck, FaCheckDouble, FaUserAlt } from "react-icons/fa";

function NotMarkAbsentees() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [activeTab, setActiveTab] = useState("Manage");
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classIdForManage, setclassIdForManage] = useState("");
  const [sectionIdForManage, setSectionIdForManage] = useState("");
  const [countAbsentStudent, setCountAbsentStudents] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [error, setError] = useState(null);
  const [nameError, setNameError] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [sendingSMS, setSendingSMS] = useState({});

  const [selectedTeacherIds, setSelectedTeacherIds] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [sending, setSending] = useState(false);

  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");
  const navigate = useNavigate();
  const pageSize = 10;
  const maxCharacters = 150;
  const [roleId, setRoleId] = useState(null);
  const [regId, setRegId] = useState(null);
  const renderWhatsAppStatus = (status) => {
    if (!status) return <span className="text-gray-500">-</span>;

    switch (status) {
      case "sent":
        return (
          <span className="flex items-center justify-center gap-1 text-blue-600 font-medium">
            <FaCheck className="text-blue-600" />
            Sent
          </span>
        );

      case "delivered":
        return (
          <span className="flex items-center justify-center gap-1 text-gray-800 font-semibold">
            <FaCheckDouble className="text-gray-700" />
            Delivered
          </span>
        );

      case "read":
        return (
          <span className="flex items-center justify-center gap-1 text-blue-800 font-semibold">
            <FaCheckDouble className="text-blue-600" />
            Read
          </span>
        );



      default:
        return <span className="text-gray-500"></span>;
    }
  };
  const capitalizeFirstLetter = (str) => {
    return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";
  };


  useEffect(() => {
    fetchRoleId();
  }, []);

  useEffect(() => {
    if (!roleId) return; // ⛔ wait until roleId is available
    handleSearch();
  }, [roleId]);

  const fetchRoleId = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      toast.error("Authentication token not found Please login again");
      navigate("/");
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/api/sessionData`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const roleId = response?.data?.user?.role_id;
      console.log("role id", response?.data?.user?.role_id);

      const regId = response?.data?.user?.reg_id;
      console.log("reg id", response?.data?.user?.reg_id);
      setRegId(regId);

      if (roleId) {
        setRoleId(roleId);
      } else {
        console.warn("role_id not found in sessionData response");
      }
    } catch (error) {
      console.error("Failed to fetch session data:", error);
    }
  };

  const handleSearch = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSearchTerm("");

    const today = new Date().toISOString().split("T")[0];

    try {
      const token = localStorage.getItem("authToken");
      setLoading(true);

      // 🔹 Role-based API URL
      const apiUrl = `${API_URL}/api/attendance/notmarked/list`;

      const response = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          class_id: classIdForManage,
          section_id: sectionIdForManage,
          date: today,
        },
      });

      const absentStudents = response?.data?.AttendanceNotMarkedList || [];

      console.log("mark absentees", absentStudents);

      if (absentStudents.length > 0) {
        const studentsWithIds = absentStudents.map((s) => ({
          ...s,
          student_id: `${s?.student_id}`,
        }));

        setSubjects(studentsWithIds);
        setCountAbsentStudents(response.data.data.count_absent_student);
      } else {
        setSubjects([]);
        setCountAbsentStudents("");
        toast.error(
          `Hooray! No students are absent today in ${selectedClass?.label || ""
          }`,
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      //   toast.error("Error fetching absent students");
    } finally {
      setIsSubmitting(false);
      setLoading(false);
      setSelectedStudents([]);
      setSelectAll(false);
    }
  };

  const camelCase = (str) =>
    str
      ?.toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");



  const searchLower = searchTerm.trim().toLowerCase();
  const filteredSections = subjects.filter((student) => {
    const fullName = `${student.teacher_name} `.toLowerCase();
    const className = student.class_name?.toString().toLowerCase() || "";
    const sectionName = student.section_name?.toString().toLowerCase() || "";
    const fullClassName =
      `${student.class_name} ${student.section_name} `.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      className.includes(searchLower) ||
      sectionName.includes(searchLower) ||
      fullClassName.includes(searchLower)
    );
  });

  const displayedSections = filteredSections;

  const allTeachers = displayedSections || [];
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedTeacherIds([]);
    } else {
      const ids = allTeachers.map(t => t.teacher_id);
      setSelectedTeacherIds(ids);
    }
    setIsAllSelected(!isAllSelected);
  };

  const toggleSelectOne = (id) => {
    setSelectedTeacherIds(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };
  useEffect(() => {
    if (allTeachers.length > 0) {
      setIsAllSelected(
        selectedTeacherIds.length === allTeachers.length
      );
    }
  }, [selectedTeacherIds, allTeachers]);

  const handleSendMessage = async () => {
    if (selectedTeacherIds.length === 0) {
      toast.error("Please select at least one teacher");
      return;
    }

    if (!message.trim()) {
      toast.error("Please enter message");
      return;
    }

    try {
      setSending(true);
      const token = localStorage.getItem("authToken");

      const payload = {
        teacher_ids: selectedTeacherIds,
        message: message,
        message_type: "attendance_not_marked",
      };

      const res = await axios.post(
        `${API_URL}/api/send_messagesforteacher`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 200) {
        toast.success("Message sent successfully");
        setMessage("");
        setSelectedTeacherIds([]);
        setIsAllSelected(false);
        handleSearch(); // refresh list
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="md:mx-auto md:w-[85%] p-4 bg-white">
        <div className="bg-white rounded-md">
          {activeTab === "Manage" && (
            <div>
              {/* Table Section */}
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <LoaderStyle />
                </div>
              ) : (
                subjects.length > 0 && (
                  <div className="card mx-auto lg:w-full shadow-lg">
                    <div className="p-2 px-3 bg-gray-100 flex justify-between items-center">
                      <h3 className="text-gray-700 text-lg font-semibold">
                        Today's Attendance not mark classes{" "}
                        {/* <span className="text-blue-500 text-sm">
                          ({countAbsentStudent} Students)
                        </span> */}
                      </h3>
                      <div className="w-1/2 md:w-fit mr-1">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search"
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    <div
                      className="relative w-[97%] h-1 mx-auto bg-red-700"
                      style={{ backgroundColor: "#C03078" }}
                    ></div>

                    <div className="card-body w-full">
                      <div className="h-96 overflow-y-scroll">
                        {loading ? (
                          <div className="flex justify-center items-center h-64">
                            <LoaderStyle />
                          </div>
                        ) : (
                          <div
                            className="max-h-96 overflow-y-auto relative"
                          >
                            <table className="min-w-full table-fixed ">
                              <thead className="sticky top-0  bg-gray-200" style={{ zIndex: 2 }}>
                                <tr>
                                  <th className="px-2 py-2 text-center border border-gray-300 text-sm font-semibold">
                                    Sr. No
                                  </th>

                                  <th className="px-2 py-2 text-center border border-gray-300 text-sm font-semibold">
                                    Select All <br />
                                    <input
                                      type="checkbox"
                                      checked={isAllSelected}
                                      onChange={toggleSelectAll}
                                    />
                                  </th>

                                  <th className="px-2 py-2 text-center  border border-gray-300 text-sm font-semibold">
                                    Class
                                  </th>

                                  <th className="px-2 py-2 text-center  border border-gray-300 text-sm font-semibold">
                                    Class Teacher Name
                                  </th>

                                  <th className="px-2 py-2 text-center  border border-gray-300 text-sm font-semibold">
                                    Message Status
                                  </th>

                                  <th className="px-2 py-2 text-center  border border-gray-300 text-sm font-semibold">
                                    WhatsApp Status
                                  </th>
                                </tr>
                              </thead>


                              <tbody>
                                {displayedSections.length ? (
                                  displayedSections.map((student, index) => (
                                    <tr
                                      key={student.student_id}
                                      className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                        } hover:bg-gray-50 transition-colors duration-150`}
                                    > {/* Sr.No */}
                                      <td className="text-center px-2 py-2 border border-gray-200 text-sm">
                                        {index + 1}

                                      </td>
                                      <td className="text-center px-2 py-2 border border-gray-200">
                                        <input
                                          type="checkbox"
                                          checked={selectedTeacherIds.includes(student.teacher_id)}
                                          onChange={() => toggleSelectOne(student.teacher_id)}
                                        />
                                      </td>



                                      {/* Class */}
                                      <td className="text-center px-2 py-2 border border-gray-200 text-sm">
                                        {student?.class_name}{" "}
                                        {student?.section_name}
                                      </td>

                                      {/* Student Name */}
                                      <td className="text-center px-2 py-2 border border-gray-200 text-sm">
                                        {`${camelCase(student.teacher_name)} `}
                                      </td>
                                      <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                        {/* Show Send button if published and messages pending */}
                                        {
                                          student.sms_sent === "Y" &&
                                            student?.whatsapp_status === "failed" ? (
                                            <div className="flex flex-col items-center gap-1">
                                              <span className="text-green-600 font-semibold text-sm">
                                                Message sent
                                              </span>
                                            </div>
                                          ) : student?.sms_sent === "Y" &&
                                            (student?.whatsapp_status === "sent" ||
                                              student?.whatsapp_status === "read" ||
                                              student?.whatsapp_status === "delivered") ? (
                                            // Show 'S' when published and no pending messages
                                            <div className="flex flex-col items-center">
                                              <div className="group relative flex items-center justify-center gap-1 text-green-600 font-semibold text-sm cursor-default">
                                                Whatsapp Sent {/* Tooltip */}
                                              </div>
                                            </div>
                                          ) : student.sms_sent === "N" ? null : null // Show Publish button when not published
                                        }
                                      </td>
                                      <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                        {renderWhatsAppStatus(student?.whatsapp_status)}
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td
                                      colSpan="8"
                                      className="text-center py-6 text-red-700 font-medium bg-gray-50"
                                    >
                                      Oops! No data found...
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                      {subjects.length > 0 && (
                        <div className="bg-white rounded-md mt-4 p-4 shadow">
                          <p className="text-sm text-gray-600 mb-2">
                            Select teachers and send message for attendance not marked
                          </p>

                          <div className="flex gap-x-3 items-end">
                            <div className="w-full relative">
                              <span className="font-light">Dear Staff,</span>
                              <textarea
                                value={message}
                                onChange={(e) =>
                                  e.target.value.length <= maxCharacters &&
                                  setMessage(e.target.value)
                                }
                                className="w-full h-28 p-3 border rounded-md resize-none"
                                placeholder="Enter message"
                              />
                              <div className="absolute bottom-2 right-3 text-xs text-gray-500">
                                {message.length}/{maxCharacters}
                              </div>
                            </div>

                            <button
                              disabled={sending}
                              onClick={handleSendMessage}
                              className={`px-6 py-2 rounded-md text-white font-semibold ${sending
                                ? "bg-blue-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700"
                                }`}
                            >
                              {sending ? "Sending..." : "Send"}
                            </button>
                          </div>
                        </div>
                      )}


                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default NotMarkAbsentees;
