import axios from "axios";
import { RxCross1 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function TeacherList() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [staffBirthday, setStaffBirthday] = useState([]);
  const [studentBirthday, setStudentBirthday] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Teacher Attendance");
  const [loadingForSearch, setLoadingForSearch] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;
  const [absentTeachers, setAbsentTeachers] = useState([]);
  const [leaveCount, setLeaveCount] = useState(0);

  const [presentTeachers, setPresentTeachers] = useState([]);
  const [prsentCount, setPrsentCount] = useState(0);

  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  const maxCharacters = 900;

  useEffect(() => {
    // fetchBirthdayList();
    fetchAbsentTeacherList();

    // handleSearch();
  }, []);

  const getTodayInDDMMYYYY = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const fetchAbsentTeacherList = async () => {
    const today = new Date().toISOString().split("T")[0]; // e.g., "2025-06-17"

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        `${API_URL}/api/get_absentteacherfortoday`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            date: today, // passing date as query param
          },
        }
      );

      const absentStaff = response.data?.data?.absent_staff || [];
      console.log("Absent staff", absentStaff);

      const presentStaff = response.data?.data?.present_late || [];
      console.log("Present staff", presentStaff);

      setAbsentTeachers(absentStaff);
      setPresentTeachers(presentStaff);
      setPrsentCount(presentStaff.length);
      setLeaveCount(absentStaff.length);
    } catch (error) {
      setError(error.message || "Something went wrong while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab); // Update the active tab state
  };

  const filteredStudentBirthday = studentBirthday.filter((student) => {
    const searchLower = searchTerm.toLocaleLowerCase().trim();
    const fullName = `${student.first_name || ""} ${student.mid_name || ""} ${
      student.last_name || ""
    }`.toLowerCase();
    const className = `${student.classname || ""} ${
      student.sectionname || ""
    }`.toLowerCase();
    const mobile = `${student.phone_no || ""}`.toLowerCase();
    const email = `${student.email_id || ""} ${
      student.email_id || ""
    }`.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      className.includes(searchLower) ||
      mobile.includes(searchLower) ||
      email.includes(searchLower)
    );
  });

  const displayedStudentBirthdays = filteredStudentBirthday.slice(
    currentPage * pageSize
  );

  const filteredStaffBirthday = staffBirthday.filter((staff) => {
    const searchLower = searchTerm.toLowerCase().trim();
    const fullName = `${staff.name || ""}`.toLowerCase();
    const mobile = `${staff.phone || ""}`.toLowerCase();
    const email = `${staff.email || ""}`.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      mobile.includes(searchLower) ||
      email.includes(searchLower)
    );
  });

  const displayedStaffBirthdays = filteredStaffBirthday.slice(
    currentPage * pageSize
  );

  const [selectedIds, setSelectedIds] = useState([]);

  const isAllSelected =
    presentTeachers.filter((t) => t.late === "Y").length > 0 &&
    selectedIds.length === presentTeachers.filter((t) => t.late === "Y").length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      const lateTeacherIds = presentTeachers
        .filter((teacher) => teacher.late === "Y")
        .map((teacher) => teacher.teacher_id);

      setSelectedIds(lateTeacherIds);
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleSend = async () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one teacher.");
      return;
    }

    if (!message.trim()) {
      toast.error("Please enter a message to send.");
      return;
    }

    const token = localStorage.getItem("authToken");

    const formData = new FormData();
    selectedIds.forEach((id) => {
      formData.append("teacher_id[]", id);
    });
    formData.append("message", message);

    try {
      const response = await axios.post(
        `${API_URL}/api/send_whatsapplatecoming`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        console.log("success");
        toast.success("Messages sent successfully!");
        setMessage("");
        setSelectedIds([]);
      } else {
        toast.error("Failed to send messages.");
        console.error("Server response:", response.data);
      }
    } catch (error) {
      console.error("Sending Error:", error);
      toast.error("An error occurred while sending messages.");
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="md:mx-auto md:w-[80%] p-3 bg-white mt-2">
        <div className="card-header flex justify-between items-center">
          <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
            Today's Attendance
          </h3>
          <RxCross1
            className="float-end relative  -top-1 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
            onClick={() => {
              navigate("/dashboard");
            }}
          />
        </div>
        <div
          className="relative mb-8 h-1 mx-auto bg-red-700"
          style={{ backgroundColor: "#C03078" }}
        ></div>
        {/* Tab Navigation */}
        <ul className="grid grid-cols-2 gap-x-10 relative -left-6 md:left-0 md:flex md:flex-row -top-4">
          {[
            { label: "Teacher Attendance", count: prsentCount }, // count: latecount
            { label: "Teachers on leave", count: leaveCount }, // count: leavecount
          ].map((tab) => (
            <li
              key={tab.label}
              className={`md:-ml-7 shadow-md ${
                activeTab === tab.label ? "text-blue-500 font-bold" : ""
              }`}
            >
              <button
                onClick={() => handleTabChange(tab.label)}
                className="px-2 md:px-4 py-1 hover:bg-gray-200 text-[1em] md:text-sm text-nowrap"
              >
                {tab.label.replace(/([A-Z])/g, " $1")}{" "}
                <span className="text-sm text-[#C03078] font-bold">
                  ({tab.count})
                </span>
              </button>
            </li>
          ))}
        </ul>
        {/* Tab Content */}
        <div className="w-full">
          <div className="card mx-auto lg:w-full shadow-lg">
            <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
              <div className="w-full flex flex-row justify-between mr-0 md:mr-4">
                <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
                  {activeTab === "Teacher Attendance"
                    ? ` ${new Date().toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "long",
                      })}`
                    : `${new Date().toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "long",
                      })} `}
                </h3>
              </div>
            </div>
            <div
              className=" relative w-[97%]   mb-3 h-1 mx-auto bg-red-700"
              style={{
                backgroundColor: "#C03078",
              }}
            ></div>
            <div className="bg-white rounded-md mt-3 mb-3 w-[90%] md:ml-16">
              {loading ? (
                <div className="text-center text-xl py-10 text-blue-700">
                  Please wait while data is loading...
                </div>
              ) : activeTab === "Teacher Attendance" ? (
                <div
                  className="h-96 lg:h-96 overflow-y-scroll"
                  //   className="h-auto lg:h-96 overflow-y-scroll"
                  style={{
                    scrollbarWidth: "thin", // Firefox
                    scrollbarColor: "#C03178 transparent", // Firefox
                  }}
                >
                  <table className="min-w-full leading-normal table-auto">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-0.5 w-full md:w-[7%] mx-auto text-center lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          Sr.No
                        </th>
                        <th className="px-0.5 w-full md:w-[7%] mx-auto text-center lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          Select All
                          <br />
                          <input
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={toggleSelectAll}
                          />{" "}
                        </th>
                        <th className="px-0.5 w-full md:w-[25%] mx-auto text-center lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          Teachers name
                        </th>
                        <th className="px-0.5 text-center md:w-[20%] lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          Class
                        </th>
                        <th className="px-0.5 text-center md:w-[10%] lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          Punch In
                        </th>
                        <th className="px-0.5 text-center md:w-[10%] lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          Punch Out
                        </th>
                        <th className="px-0.5 text-center md:w-[10%] lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          Delay Time
                        </th>
                        <th className="px-0.5 text-center  md:w-[35%] lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          Mobile No.
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {presentTeachers.length > 0 ? (
                        presentTeachers.map((student, index) => (
                          <tr
                            key={student.student_id}
                            className={`${
                              index % 2 === 0 ? "bg-white" : "bg-gray-100"
                            } hover:bg-gray-50`}
                          >
                            <td className="sm:px-0.5 text-center lg:px-1 border border-gray-950 text-sm">
                              <p
                                className={`whitespace-no-wrap relative top-2 ${
                                  student.late === "Y"
                                    ? "text-red-600"
                                    : "text-gray-900"
                                }`}
                              >
                                {index + 1}
                              </p>
                            </td>
                            <td className="sm:px-0.5 text-center lg:px-1 border border-gray-950 text-sm">
                              {student.late === "Y" && (
                                <input
                                  type="checkbox"
                                  checked={selectedIds.includes(
                                    student.teacher_id
                                  )}
                                  onChange={() =>
                                    toggleSelectOne(student.teacher_id)
                                  }
                                />
                              )}
                            </td>
                            <td className="text-center px-2 lg:px-2 border border-gray-950 text-sm">
                              <p
                                className={`whitespace-no-wrap relative top-2 ${
                                  student.late === "Y"
                                    ? "text-red-600"
                                    : "text-gray-900"
                                }`}
                              >
                                {student.name}
                              </p>
                            </td>
                            <td className="text-center px-2 lg:px-2 border border-gray-950 text-sm">
                              <p
                                className={`whitespace-no-wrap relative top-2 ${
                                  student.late === "Y"
                                    ? "text-red-600"
                                    : "text-gray-900"
                                }`}
                              >
                                {student.class_section || "-"}
                              </p>
                            </td>
                            <td className="text-center px-2 lg:px-2 border border-gray-950 text-sm">
                              <p
                                className={`whitespace-no-wrap relative top-2 ${
                                  student.late === "Y"
                                    ? "text-red-600"
                                    : "text-gray-900"
                                }`}
                              >
                                {student.punch_in || "-"}
                              </p>
                            </td>
                            <td className="text-center px-2 lg:px-2 border border-gray-950 text-sm">
                              <p
                                className={`whitespace-no-wrap relative top-2 ${
                                  student.late === "Y"
                                    ? "text-red-600"
                                    : "text-gray-900"
                                }`}
                              >
                                {student.punch_out || "-"}
                              </p>
                            </td>
                            <td className="text-center px-2 lg:px-2 border border-gray-950 text-sm">
                              <p
                                className={`whitespace-no-wrap relative top-2 ${
                                  student.late === "Y"
                                    ? "text-red-600"
                                    : "text-gray-900"
                                }`}
                              >
                                {/* {student.late_time || "-"} */}
                                {student.late === "Y" &&
                                student.punch_in &&
                                student.late_time
                                  ? (() => {
                                      const punchIn = new Date(
                                        `1970-01-01T${student.punch_in}`
                                      );
                                      const lateTime = new Date(
                                        `1970-01-01T${student.late_time}`
                                      );
                                      const diffMinutes = Math.max(
                                        Math.floor(
                                          (punchIn - lateTime) / 60000
                                        ),
                                        0
                                      );
                                      return `${diffMinutes} mins late`;
                                    })()
                                  : ""}
                              </p>
                            </td>
                            <td className="text-center px-2 lg:px-2 border border-gray-950 text-sm">
                              <p
                                className={`whitespace-no-wrap relative top-2 ${
                                  student.late === "Y"
                                    ? "text-red-600"
                                    : "text-gray-900"
                                }`}
                              >
                                {student.phone || " "}
                              </p>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="8"
                            className="text-center text-xl py-5 text-red-700 border border-gray-950"
                          >
                            No Teachers are Late Today.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div
                  className="h-96 lg:h-96 overflow-y-scroll"
                  style={{
                    scrollbarWidth: "thin", // Firefox
                    scrollbarColor: "#C03178 transparent", // Firefox
                  }}
                >
                  <table className="min-w-full leading-normal table-auto">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-1 w-full md:w-[10%] mx-auto py-2 border border-gray-950 text-sm font-semibold text-center text-gray-900">
                          S.No
                        </th>
                        <th className=" px-0.5 w-full md:w-[30%] mx-auto text-center lg:px-1 py-2  border border-gray-950 text-sm font-semibold text-gray-900  tracking-wider">
                          Teachers name
                        </th>
                        <th className=" px-0.5 w-full md:w-[30%] mx-auto text-center lg:px-1 py-2  border border-gray-950 text-sm font-semibold text-gray-900  tracking-wider">
                          Class
                        </th>
                        <th className=" px-0.5 md:w-[33%] text-center lg:px-1 py-2  border border-gray-950 text-sm font-semibold text-gray-900  tracking-wider">
                          Mobile No.
                        </th>
                      </tr>
                    </thead>
                    {absentTeachers.length > 0 ? (
                      absentTeachers.map((staff, index) => (
                        <tr
                          key={staff.teacher_id}
                          className={`${
                            index % 2 === 0 ? "bg-white" : "bg-gray-100"
                          } hover:bg-gray-50`}
                        >
                          <td className="text-center border border-gray-950 text-sm">
                            <p className="text-gray-900">{index + 1}</p>
                          </td>
                          <td className="text-center border border-gray-950 text-sm">
                            <p className="text-gray-900">
                              {staff?.name || " "}
                            </p>
                          </td>
                          <td className="text-center border border-gray-950 text-sm">
                            <p className="text-gray-900">
                              {staff?.class_section || " - "}
                            </p>
                          </td>
                          <td className="text-center border border-gray-950 text-sm">
                            <p className="text-gray-900">
                              {staff?.phone || " "}
                            </p>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="text-center text-xl py-5 text-red-700"
                        >
                          No Teachers are on Leave Today.
                        </td>
                      </tr>
                    )}
                  </table>
                </div>
              )}
            </div>
            {activeTab === "Teacher Attendance" &&
              presentTeachers.length > 0 && (
                <div className="bg-white rounded-md mt-3 mb-5 w-[90%] md:ml-16 p-4 shadow">
                  <p className="text-sm text-gray-600 mb-2">
                    Select the teachers above and enter the message below to
                    send to those who arrived late.
                  </p>
                  <div className="flex flex-row items-end gap-3 w-full">
                    <div className="w-full md:w-[80%] relative">
                      {/* <textarea
                        value={description}
                        onChange={(e) => {
                          if (e.target.value.length <= maxCharacters) {
                            setDescription(e.target.value);
                          }
                        }}
                        className="w-full h-28 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-150 resize-none"
                        placeholder="Enter message"
                      ></textarea> */}

                      <textarea
                        value={message}
                        onChange={(e) => {
                          if (e.target.value.length <= maxCharacters) {
                            setMessage(e.target.value);
                          }
                        }}
                        className="w-full h-28 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-150 resize-none"
                        placeholder="Enter message"
                      ></textarea>

                      {/* Character count inside the textarea box */}
                      <div className="absolute bottom-2 right-3 text-xs text-gray-500 pointer-events-none">
                        {description.length} / {maxCharacters}
                      </div>
                    </div>

                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md transition duration-200"
                      onClick={handleSend}
                      disabled={loading}
                    >
                      {loading ? "Sending" : "Send"}
                    </button>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </>
  );
}

export default TeacherList;
