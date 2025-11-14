import axios from "axios";
import { RxCross1 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";

function TeacherList() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Teacher Attendance");
  const [loadingForSend, setLoadingForSend] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;
  const [absentTeachers, setAbsentTeachers] = useState([]);
  const [leaveCount, setLeaveCount] = useState(0);
  const [categories, setCategories] = useState([]);

  const [presentTeachers, setPresentTeachers] = useState([]);
  const [prsentCount, setPrsentCount] = useState(0);

  const [message, setMessage] = useState("");
  const [selectedTeacherCategory, setSelectedTeacherCategory] = useState(null);
  const [teacherCategoryId, setTeacherCategoryId] = useState(null);
  const [teacherCategoryError, setTeacherCategoryError] = useState("");
  const [loadingClasses, setLoadingClasses] = useState(false);

  const maxCharacters = 900;

  useEffect(() => {
    fetchTeacherCategory();
    fetchAbsentTeacherList();
  }, []);

  useEffect(() => {
    if (presentTeachers.length > 0) {
      console.log("Updated present teachers:", presentTeachers);
    }
  }, [presentTeachers]);

  const fetchAbsentTeacherList = async () => {
    setLoading(true);
    const today = new Date().toISOString().split("T")[0]; // e.g., "2025-09-02"

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
            date: today,
            category: selectedTeacherCategory?.label,
          },
        }
      );

      const absentStaff = response.data?.data?.absent_staff || [];
      const presentStaff = response.data?.data?.present_late || [];

      setAbsentTeachers(absentStaff);
      setPresentTeachers(presentStaff);
      setPrsentCount(presentStaff.length);
      const totalAbsentCount = absentStaff.reduce((total, group) => {
        return total + (group.teachers?.length || 0); // sum staff per category
      }, 0);

      setLeaveCount(totalAbsentCount);
      // setLeaveCount(absentStaff.length);
    } catch (error) {
      setError(error.message || "Something went wrong while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true); // show loader while fetching
    setError(""); // reset previous error
    await fetchAbsentTeacherList(); // call your API
  };

  const fetchTeacherCategory = async () => {
    // setLoading(true);
    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.get(`${API_URL}/api/get_teachercategory_teaching`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.data) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching teacher category:", error);
    } finally {
      // setLoading(false);
    }
  };

  const handleTeacherCategory = (selectedOption) => {
    console.log("Selected Teacher Category:", selectedOption?.value);
    setTeacherCategoryError("");
    setSelectedTeacherCategory(selectedOption);
    setTeacherCategoryId(selectedOption?.value);
  };

  const teacherCategoryOptions = useMemo(
    () =>
      categories.map((cat) => ({
        value: cat.tc_id,
        label: cat.name,
      })),
    [categories]
  );

  const handleTabChange = (tab) => {
    setActiveTab(tab); // Update the active tab state
  };

  // filter list before rendering
  const filteredPresentTeachers = presentTeachers.filter((student) => {
    const searchLower = searchTerm.toLowerCase().trim();

    const fullName = `${student.name || ""}`.toLowerCase();
    const category = `${student.teachercategoryname || ""}`.toLowerCase();
    const phone = `${student.phone || ""}`.toLowerCase();
    const classSection = `${student.class_section || ""}`.toLowerCase();
    const punchIn = `${student.punch_in || ""}`.toLowerCase();
    const punchOut = `${student.punch_out || ""}`.toLowerCase();

    return (
      fullName.includes(searchLower) ||
      category.includes(searchLower) ||
      phone.includes(searchLower) ||
      classSection.includes(searchLower) ||
      punchIn.includes(searchLower) ||
      punchOut.includes(searchLower)
    );
  });

  const displayedPresentTeachers = filteredPresentTeachers.slice(
    currentPage * pageSize
  );

  console.log("prsent teachers", displayedPresentTeachers);

  // const filteredAbsentTeachers = absentTeachers
  //   .map((group) => ({
  //     category_name: group.category_name,
  //     teachers: group.teachers.filter((staff) => {
  //       const searchLower = searchTerm.toLowerCase().trim();

  //       const fullName = `${staff.name || ""}`.toLowerCase();
  //       const mobile = `${staff.phone || ""}`.toLowerCase();
  //       const category = `${group.category_name || ""}`.toLowerCase(); // ✅ from parent
  //       const leaveStatus = `${staff.leave_status || ""}`.toLowerCase();
  //       const classSection = `${staff.class_section || ""}`.toLowerCase();

  //       return (
  //         fullName.includes(searchLower) ||
  //         mobile.includes(searchLower) ||
  //         category.includes(searchLower) ||
  //         leaveStatus.includes(searchLower) ||
  //         classSection.includes(searchLower)
  //       );
  //     }),
  //   }))

  //   .filter((group) => group.teachers.length > 0);
  const filteredAbsentTeachers = (absentTeachers || [])
    .map((group) => {
      const teachers = Array.isArray(group.teachers) ? group.teachers : [];
      const searchLower = searchTerm.toLowerCase().trim();

      const filteredTeachers = teachers.filter((staff) => {
        const fullName = `${staff?.name || ""}`.toLowerCase();
        const mobile = `${staff?.phone || ""}`.toLowerCase();
        const category = `${group?.category_name || ""}`.toLowerCase();
        const leaveStatus = `${staff?.leave_status || ""}`.toLowerCase();
        const classSection = `${staff?.class_section || ""}`.toLowerCase();

        return (
          fullName.includes(searchLower) ||
          mobile.includes(searchLower) ||
          category.includes(searchLower) ||
          leaveStatus.includes(searchLower) ||
          classSection.includes(searchLower)
        );
      });

      return {
        category_name: group?.category_name || "Unknown",
        teachers: filteredTeachers,
      };
    })

    .filter((group) => group.teachers.length > 0);

  const displayedAbsentTeachers = filteredAbsentTeachers.slice(
    currentPage * pageSize
  );
  console.log(displayedAbsentTeachers);

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
      setLoadingForSend(true);
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
    } finally {
      setLoadingForSend(false);
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
        {activeTab === "Teachers on leave" && (
          <div className="mb-2 mt-0">
            <div className="w-full md:w-[78%] gap-x-0 mx-auto flex flex-col  md:gap-y-0 md:flex-row">
              <div className="w-full md:w-[50%] gap-x-14 md:gap-x-6 md:justify-start my-1 md:my-4 flex md:flex-row">
                <label
                  className="text-md mt-1.5 mr-1 md:mr-0"
                  htmlFor="classSelect"
                >
                  Teacher Category
                </label>
                <div className="w-full md:w-[57%]">
                  <Select
                    id="classSelect"
                    value={selectedTeacherCategory}
                    onChange={handleTeacherCategory}
                    options={teacherCategoryOptions}
                    placeholder={
                      loadingClasses ? "Loading section..." : "Select"
                    }
                    isSearchable
                    isClearable
                    className="text-sm"
                    styles={{
                      menu: (provided) => ({
                        ...provided,
                        zIndex: 1050,
                      }),
                    }}
                    isDisabled={loadingClasses}
                  />
                </div>
              </div>
              <div className="mt-1">
                <button
                  onClick={handleSearch} // ✅ added here
                  type="button"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  {loading ? "Searching..." : "Search"}
                </button>
              </div>
            </div>
          </div>
        )}

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
                <div className="box-border flex md:gap-x-2 justify-end md:h-10 ml-2">
                  <div className=" w-1/2 md:w-fit mr-1">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search"
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div
              className=" relative w-[97%] h-1 mx-auto bg-red-700"
              style={{
                backgroundColor: "#C03078",
              }}
            ></div>

            <div className="bg-white rounded-md mt-3 mb-3 w-[90%] md:ml-16">
              {activeTab === "Teacher Attendance" ? (
                <div
                  className="h-96 lg:h-96 overflow-y-scroll"
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "#C03178 transparent",
                  }}
                >
                  <table className="min-w-full leading-normal table-auto">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-0.5 w-full md:w-[5%] mx-auto text-center lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          Sr.No
                        </th>
                        <th className="px-0.5 w-full md:w-[6%] mx-auto text-center lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          Select All
                          <br />
                          <input
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={toggleSelectAll}
                          />
                        </th>
                        <th className="px-0.5 w-full md:w-[15%] mx-auto text-center lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          Teachers Name
                        </th>
                        <th className="px-0.5 w-full md:w-[13%] mx-auto text-center lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          Teachers Category
                        </th>
                        <th className="px-0.5 text-center md:w-[8%] lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          Punch In
                        </th>
                        <th className="px-0.5 text-center md:w-[8%] lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          Punch Out
                        </th>
                        <th className="px-0.5 text-center md:w-[10%] lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          Delay Time
                        </th>
                        <th className="px-0.5 text-center  md:w-[13%] lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          Mobile No.
                        </th>
                        <th className="px-0.5 text-center md:w-[20%] lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          Class
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td
                            colSpan="9"
                            className="text-center py-6 text-blue-600 text-xl"
                          >
                            Please wait while data is loading...
                          </td>
                        </tr>
                      ) : filteredPresentTeachers.length > 0 ? (
                        filteredPresentTeachers.map((student, index) => (
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
                                {student?.name
                                  ? student.name
                                      .toLowerCase()
                                      .split(" ")
                                      .map((word) =>
                                        word
                                          .split("'")
                                          .map(
                                            (part) =>
                                              part.charAt(0).toUpperCase() +
                                              part.slice(1)
                                          )
                                          .join("'")
                                      )
                                      .join(" ")
                                  : " "}
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
                                {student.teachercategoryname}
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
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="9"
                            className="text-center py-6 text-red-700 text-xl"
                          >
                            No staff is on leave today.
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
                    scrollbarWidth: "thin",
                    scrollbarColor: "#C03178 transparent",
                  }}
                >
                  {loading ? (
                    <div className="text-center py-6 text-blue-600 text-xl">
                      Please wait while data is loading...
                    </div>
                  ) : filteredAbsentTeachers.length > 0 ? (
                    filteredAbsentTeachers.map((group, groupIndex) => (
                      <div key={group.category_name} className="mb-2">
                        <h2
                          className="text-lg font-bold text-center"
                          style={{ color: "#C03178" }}
                        >
                          {group.category_name}
                        </h2>
                        <table className="min-w-full leading-normal table-auto border-collapse border border-gray-950">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="px-1 w-[7%]  mx-auto lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-center text-gray-900 tracking-wider">
                                Sr. No
                              </th>
                              <th className="px-1 w-[25%] mx-auto lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-center text-gray-900">
                                Teacher Name
                              </th>
                              <th className="px-1 w-[12%] mx-auto lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-center text-gray-900">
                                Mobile No.
                              </th>
                              <th className="px-1 w-[15%]  mx-auto lg:px-1py-2 border border-gray-950 text-sm font-semibold text-center text-gray-900">
                                Leave Status
                              </th>
                              <th className="px-1 w-[30%] mx-auto lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-center text-gray-900">
                                Class
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.teachers && group.teachers.length > 0 ? (
                              group.teachers.map((staff, index) => (
                                <tr
                                  key={staff.teacher_id}
                                  className={`${
                                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                  } hover:bg-gray-100`}
                                >
                                  <td className="text-center border border-gray-950 text-sm">
                                    <p className="text-gray-900 relative top-2">
                                      {index + 1}
                                    </p>
                                  </td>
                                  <td className="text-center border border-gray-950 text-sm">
                                    <p className="text-gray-900 relative top-2">
                                      {staff?.name
                                        ? staff.name
                                            .toLowerCase()
                                            .split(" ")
                                            .map((word) =>
                                              word
                                                .split("'")
                                                .map(
                                                  (part) =>
                                                    part
                                                      .charAt(0)
                                                      .toUpperCase() +
                                                    part.slice(1)
                                                )
                                                .join("'")
                                            )
                                            .join(" ")
                                        : " "}
                                    </p>
                                  </td>

                                  <td className="text-center border border-gray-950 text-sm">
                                    <p className="text-gray-900 relative top-2">
                                      {staff?.phone || " "}
                                    </p>
                                  </td>
                                  <td className="text-center border border-gray-950 text-sm">
                                    <p className="text-gray-900 relative top-2">
                                      {staff?.leave_status || "-"}
                                    </p>
                                  </td>
                                  <td className="text-center border border-gray-950 text-sm">
                                    <p className="text-gray-900 relative top-2">
                                      {staff?.class_section || "-"}
                                    </p>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan="5"
                                  className="text-center py-6 text-red-700 text-xl"
                                >
                                  No Teachers are Leave Today..
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-red-700 text-xl">
                      No staff is on leave today.
                    </div>
                  )}
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
                        {/* {description.length} / {maxCharacters} */}
                        {message.length} / {maxCharacters}
                      </div>
                    </div>

                    <button
                      className={`text-white font-semibold py-2 px-6 rounded-md transition duration-200 ${
                        loadingForSend
                          ? "bg-blue-500 opacity-50 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                      onClick={handleSend}
                      disabled={loadingForSend}
                    >
                      {loadingForSend ? "Sending" : "Send"}
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
