import axios from "axios";
import { RxCross1 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import ReactPaginate from "react-paginate";
import { FiSearch } from "react-icons/fi";

function LessonPlanData() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("No. of Teachers");

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;
  const [pageCount, setPageCount] = useState(0);
  const [submittedTeachers, setSubmittedTeachers] = useState([]);
  const [submittedCount, setSubmittedCount] = useState(0);

  const [notSubmittedTeachers, setNotSubmittedTeachers] = useState([]);
  const [notSubmittedCount, setNotSubmittedCount] = useState(0);

  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");
  const [showSearch, setShowSearch] = useState(false);
  const [noOfTeachers, setNoOfTeachers] = useState([]);
  const [noOfTeacherCount, setNoOfTeachersCount] = useState(0);
  const [pendingApprovalLP, setPendingApprovalLP] = useState([]);
  const [pendingApprovalLPCount, setPendingApprovalApprovalLPCount] =
    useState(0);

  useEffect(() => {
    fetchTeacherList();
    fetchSubmittedList();
    fetchNotSubmittedList();
    fetchPendingApprovalList();
  }, []);

  const fetchPendingApprovalList = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        `${API_URL}/api/list/lessonplan/pending_for_approval`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // ✅ API returns lists directly
      const absentStaff = response.data.data || [];

      console.log("peing approval lesson plan", absentStaff);

      setPendingApprovalLP(absentStaff);

      setPendingApprovalApprovalLPCount(absentStaff.length);
    } catch (error) {
      setError(error.message || "Something went wrong while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmittedList = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        `${API_URL}/api/list/lessonplan/submitted`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // ✅ API returns lists directly
      const absentStaff = response.data.data || [];

      console.log("submitted lesson plan", absentStaff);

      setSubmittedTeachers(absentStaff);

      setSubmittedCount(absentStaff.length);
    } catch (error) {
      setError(error.message || "Something went wrong while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchNotSubmittedList = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        `${API_URL}/api/list/lessonplan/notsubmitted`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const absentStaff = response.data.data || [];

      console.log("not lesson plan submitted", absentStaff);

      setNotSubmittedTeachers(absentStaff);

      setNotSubmittedCount(absentStaff.length);
    } catch (error) {
      setError(error.message || "Something went wrong while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherList = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(`${API_URL}/api/total_teachers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // API returns lists directly
      const absentStaff = response.data.data;

      setNoOfTeachers(absentStaff);

      setNoOfTeachersCount(absentStaff.length);
    } catch (error) {
      setError(error.message || "Something went wrong while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab); // Update the active tab state
  };

  useEffect(() => {
    const trimmedSearch = searchTerm.trim().toLowerCase();

    if (trimmedSearch !== "" && prevSearchTermRef.current === "") {
      previousPageRef.current = currentPage;
      setCurrentPage(0);
    }

    if (trimmedSearch === "" && prevSearchTermRef.current !== "") {
      setCurrentPage(previousPageRef.current);
    }

    prevSearchTermRef.current = trimmedSearch;
  }, [searchTerm]);

  // filter list before rendering
  // Pending Approval
  const filteredPendingTeachers = (pendingApprovalLP || []).filter(
    (teacher) => {
      const searchLower = searchTerm.toLowerCase().trim();

      const fullName = (teacher.name || "").toLowerCase();
      const phone = (teacher.phone || "").toLowerCase();
      const pendingClasses = (teacher.pending_classes || "").toLowerCase();

      return (
        fullName.includes(searchLower) ||
        phone.includes(searchLower) ||
        pendingClasses.includes(searchLower)
      );
    }
  );

  const displayedPendingTeachers = filteredPendingTeachers.slice(
    currentPage * pageSize,
    currentPage * pageSize + pageSize
  );
  console.log("pending Approval teachers", displayedPendingTeachers);

  // Not Submitted
  const filteredNotSubmittedTeachers = (notSubmittedTeachers || []).filter(
    (teacher) => {
      const searchLower = searchTerm.toLowerCase().trim();

      const fullName = (teacher.name || "").toLowerCase();
      const phone = (teacher.phone || "").toLowerCase();
      const pendingClasses = (teacher.pending_classes || "").toLowerCase();

      return (
        fullName.includes(searchLower) ||
        phone.includes(searchLower) ||
        pendingClasses.includes(searchLower)
      );
    }
  );

  const displayedNotSubmittedTeachers = filteredNotSubmittedTeachers.slice(
    currentPage * pageSize,
    currentPage * pageSize + pageSize
  );
  console.log("not submitted teachers", displayedNotSubmittedTeachers);

  // Submitted
  const filteredSubmittedTeachers = (submittedTeachers || []).filter(
    (staff) => {
      const searchLower = searchTerm.toLowerCase().trim();

      const fullName = (staff?.name || "").toLowerCase();
      const phone = (staff?.phone || "").toLowerCase();
      const pendingClasses = (staff?.pending_classes || "").toLowerCase();
      const teacherId = String(staff?.teacher_id || "").toLowerCase();

      return (
        fullName.includes(searchLower) ||
        phone.includes(searchLower) ||
        pendingClasses.includes(searchLower) ||
        teacherId.includes(searchLower)
      );
    }
  );

  const displayedSubmittedTeachers = filteredSubmittedTeachers.slice(
    currentPage * pageSize,
    currentPage * pageSize + pageSize
  );
  console.log("Submitted teachers", displayedSubmittedTeachers);

  // No id teachers
  const filteredNoOfTeachers = (noOfTeachers || []).filter((staff) => {
    const searchLower = searchTerm.toLowerCase().trim();

    const fullName = (staff?.name || "").toLowerCase();
    const phone = (staff?.phone || "").toLowerCase();
    const pendingClasses = (staff?.pending_classes || "").toLowerCase();
    const teacherId = String(staff?.teacher_id || "").toLowerCase();

    return (
      fullName.includes(searchLower) ||
      phone.includes(searchLower) ||
      pendingClasses.includes(searchLower) ||
      teacherId.includes(searchLower)
    );
  });

  const displayedNoOfTeachers = filteredNoOfTeachers.slice(
    currentPage * pageSize,
    currentPage * pageSize + pageSize
  );
  console.log("no of teachers", displayedNoOfTeachers);

  // useEffect(() => {
  //   const total =
  //     activeTab === "No. of Teachers"
  //       ? filteredNoOfTeachers.length
  //       : filteredSubmittedTeachers.length;

  //   // Calculate the total pages
  //   const pages = Math.ceil(total / pageSize) || 1; // ensure at least 1 page
  //   setPageCount(pages);
  // }, [filteredNoOfTeachers, filteredSubmittedTeachers, activeTab, pageSize]);

  useEffect(() => {
    let total = 0;

    if (activeTab === "No. of Teachers") {
      total = filteredNoOfTeachers.length;
    } else if (activeTab === "Submitted Lesson Plan") {
      total = filteredSubmittedTeachers.length;
    } else if (activeTab === "Not Submitted Lesson Plan") {
      total = filteredNotSubmittedTeachers.length;
    } else if (activeTab === "Pending for Approval") {
      total = filteredPendingTeachers.length;
    }

    // Calculate the total pages
    const pages = Math.ceil(total / pageSize) || 1; // ensure at least 1 page
    setPageCount(pages);
  }, [
    filteredNoOfTeachers,
    filteredSubmittedTeachers,
    filteredNotSubmittedTeachers,
    filteredPendingTeachers,
    activeTab,
    pageSize,
  ]);

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  return (
    <>
      <ToastContainer />
      <div className="md:mx-auto md:w-[80%] p-3 bg-white mt-4">
        <div className="card-header flex justify-between items-center">
          <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
            Lesson Plan
          </h3>

          <div className="flex flex-row gap-3 items-center justify-end">
            {/* Search */}
            <div className="relative group">
              <button
                onClick={() => setShowSearch((prev) => !prev)}
                className="text-black hover:text-pink-500"
              >
                <FiSearch size={20} />
              </button>

              <span className="absolute bottom-5  right-4 hidden group-hover:block bg-blue-500 text-white text-xs px-2 py-1 rounded shadow">
                Search
              </span>
            </div>

            {/* Close */}
            <RxCross1
              className="text-red-600 cursor-pointer hover:bg-red-100 rounded text-xl"
              onClick={() => navigate("/dashboard")}
            />
          </div>
        </div>
        <div
          className="relative mb-8 h-1 mx-auto bg-red-700"
          style={{ backgroundColor: "#C03078" }}
        ></div>
        {/* Tab Navigation */}
        <ul className="grid grid-cols-2 gap-x-10 relative -left-6 md:left-0 md:flex md:flex-row -top-4">
          {[
            { label: "No. of Teachers" },
            { label: "Submitted Lesson Plan" },
            { label: "Not Submitted Lesson Plan" },
            { label: "Pending for Approval" },
          ].map((tab) => (
            <li
              key={tab.label}
              className={`md:-ml-7 shadow-md ${activeTab === tab.label ? "text-blue-500 font-bold" : ""
                }`}
            >
              <button
                onClick={() => handleTabChange(tab.label)}
                className="px-2 md:px-4 py-1 hover:bg-gray-200 text-[1em] md:text-sm text-nowrap"
              >
                {tab.label.replace(/([A-Z])/g, " $1")}{" "}
                {/* <span className="text-sm text-[#C03078] font-bold">
                  ({tab.count})
                </span> */}
              </button>
            </li>
          ))}
        </ul>

        {/* Tab Content */}
        <div className="w-full">
          <div className="card mx-auto lg:w-full shadow-lg">
            {showSearch && (
              <>
                <div className=" px-3 bg-gray-100 border-none flex justify-between items-center">
                  <div className="w-full flex flex-row justify-between mr-0 ">
                    <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
                      {/* {activeTab === "Teacher Attendance"
                    ? ` ${new Date().toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "long",
                      })}`
                    : `${new Date().toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "long",
                      })} `} */}
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
                {/* <div
              className=" relative w-[97%] h-1 mx-auto bg-red-700"
              style={{
                backgroundColor: "#C03078",
              }}
            ></div> */}
              </>
            )}

            <div className="bg-white rounded-md mt-3 mb-3 w-[90%] md:ml-16">
              {activeTab === "No. of Teachers" ? (
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

                        <th className="px-0.5 w-full md:w-[15%] mx-auto text-center lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          Teachers Name
                        </th>

                        <th className="px-0.5 text-center  md:w-[13%] lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          Mobile No.
                        </th>
                        <th className="px-0.5 text-center md:w-[20%] lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          {/* Class */}
                          Category
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
                      ) : displayedNoOfTeachers.length > 0 ? (
                        displayedNoOfTeachers.map((student, index) => (
                          <tr
                            key={student.student_id}
                            className={`${index % 2 === 0 ? "bg-white" : "bg-gray-100"
                              } hover:bg-gray-50`}
                          >
                            <td className="sm:px-0.5 text-center lg:px-1 border border-gray-950 text-sm">
                              <p
                                className={`whitespace-no-wrap relative top-2 ${student.late === "Y"
                                  ? "text-red-600"
                                  : "text-gray-900"
                                  }`}
                              >
                                {currentPage * pageSize + index + 1}
                              </p>
                            </td>

                            <td className="text-center px-2 lg:px-2 border border-gray-950 text-sm">
                              <p
                                className={`whitespace-no-wrap relative top-2 ${student.late === "Y"
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
                                className={`whitespace-no-wrap relative top-2 ${student.late === "Y"
                                  ? "text-red-600"
                                  : "text-gray-900"
                                  }`}
                              >
                                {student.phone || " "}
                              </p>
                            </td>
                            <td className="text-center px-2 lg:px-2 border border-gray-950 text-sm">
                              <p
                                className={`whitespace-no-wrap relative top-2 ${student.late === "Y"
                                  ? "text-red-600"
                                  : "text-gray-900"
                                  }`}
                              >
                                {student?.category_name
                                  ? student.category_name
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
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="9"
                            className="text-center py-6 text-red-700 text-xl"
                          >
                            Oops! No data found..
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : activeTab === "Submitted Lesson Plan" ? (
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

                        <th className="px-0.5 w-full md:w-[15%] mx-auto text-center lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          Teachers Name
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
                      ) : displayedSubmittedTeachers.length > 0 ? (
                        displayedSubmittedTeachers.map((student, index) => (
                          <tr
                            key={student.student_id}
                            className={`${index % 2 === 0 ? "bg-white" : "bg-gray-100"
                              } hover:bg-gray-50`}
                          >
                            <td className="sm:px-0.5 text-center lg:px-1 border border-gray-950 text-sm">
                              <p
                                className={`whitespace-no-wrap relative top-2 ${student.late === "Y"
                                  ? "text-red-600"
                                  : "text-gray-900"
                                  }`}
                              >
                                {currentPage * pageSize + index + 1}
                              </p>
                            </td>

                            <td className="text-center px-2 lg:px-2 border border-gray-950 text-sm">
                              <p
                                className={`whitespace-no-wrap relative top-2 ${student.late === "Y"
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
                                className={`whitespace-no-wrap relative top-2 ${student.late === "Y"
                                  ? "text-red-600"
                                  : "text-gray-900"
                                  }`}
                              >
                                {student.phone || " "}
                              </p>
                            </td>
                            <td className="text-center px-2 lg:px-2 border border-gray-950 text-sm">
                              <p
                                className={`whitespace-no-wrap relative top-2 ${student.late === "Y"
                                  ? "text-red-600"
                                  : "text-gray-900"
                                  }`}
                              >
                                <p
                                  className={`whitespace-no-wrap relative top-2 ${student.late === "Y"
                                    ? "text-red-600"
                                    : "text-gray-900"
                                    }`}
                                >
                                  {student.pending_classes || "-"}
                                </p>
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
                            Oops! No data found..
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : activeTab === "Not Submitted Lesson Plan" ? (
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

                        <th className="px-0.5 w-full md:w-[15%] mx-auto text-center lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          Teachers Name
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
                      ) : displayedNotSubmittedTeachers.length > 0 ? (
                        displayedNotSubmittedTeachers.map((student, index) => (
                          <tr
                            key={student.student_id}
                            className={`${index % 2 === 0 ? "bg-white" : "bg-gray-100"
                              } hover:bg-gray-50`}
                          >
                            <td className="sm:px-0.5 text-center lg:px-1 border border-gray-950 text-sm">
                              <p
                                className={`whitespace-no-wrap relative top-2 ${student.late === "Y"
                                  ? "text-red-600"
                                  : "text-gray-900"
                                  }`}
                              >
                                {currentPage * pageSize + index + 1}
                              </p>
                            </td>

                            <td className="text-center px-2 lg:px-2 border border-gray-950 text-sm">
                              <p
                                className={`whitespace-no-wrap relative top-2 ${student.late === "Y"
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
                                className={`whitespace-no-wrap relative top-2 ${student.late === "Y"
                                  ? "text-red-600"
                                  : "text-gray-900"
                                  }`}
                              >
                                {student.phone || " "}
                              </p>
                            </td>
                            <td className="text-center px-2 lg:px-2 border border-gray-950 text-sm">
                              <p
                                className={`whitespace-no-wrap relative top-2 ${student.late === "Y"
                                  ? "text-red-600"
                                  : "text-gray-900"
                                  }`}
                              >
                                <p
                                  className={`whitespace-no-wrap relative top-2 ${student.late === "Y"
                                    ? "text-red-600"
                                    : "text-gray-900"
                                    }`}
                                >
                                  {student.pending_classes || "-"}
                                </p>
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
                            Oops! No data found..
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : activeTab === "Pending for Approval" ? (
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

                        <th className="px-0.5 w-full md:w-[15%] mx-auto text-center lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          Teachers Name
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
                      ) : displayedPendingTeachers.length > 0 ? (
                        displayedPendingTeachers.map((student, index) => (
                          <tr
                            key={student.student_id}
                            className={`${index % 2 === 0 ? "bg-white" : "bg-gray-100"
                              } hover:bg-gray-50`}
                          >
                            <td className="sm:px-0.5 text-center lg:px-1 border border-gray-950 text-sm">
                              <p
                                className={`whitespace-no-wrap relative top-2 ${student.late === "Y"
                                  ? "text-red-600"
                                  : "text-gray-900"
                                  }`}
                              >
                                {currentPage * pageSize + index + 1}
                              </p>
                            </td>

                            <td className="text-center px-2 lg:px-2 border border-gray-950 text-sm">
                              <p
                                className={`whitespace-no-wrap relative top-2 ${student.late === "Y"
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
                                className={`whitespace-no-wrap relative top-2 ${student.late === "Y"
                                  ? "text-red-600"
                                  : "text-gray-900"
                                  }`}
                              >
                                {student.phone || " "}
                              </p>
                            </td>
                            <td className="text-center px-2 lg:px-2 border border-gray-950 text-sm">
                              <p
                                className={`whitespace-no-wrap relative top-2 ${student.late === "Y"
                                  ? "text-red-600"
                                  : "text-gray-900"
                                  }`}
                              >
                                <p
                                  className={`whitespace-no-wrap relative top-2 ${student.late === "Y"
                                    ? "text-red-600"
                                    : "text-gray-900"
                                    }`}
                                >
                                  {student.pending_classes || "-"}
                                </p>
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
                            Oops! No data found..
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                ""
              )}
            </div>
            <div className=" flex justify-center  pt-2 -mb-3">
              <ReactPaginate
                previousLabel={"Previous"}
                nextLabel={"Next"}
                breakLabel={"..."}
                breakClassName={"page-item"}
                breakLinkClassName={"page-link"}
                pageCount={pageCount}
                marginPagesDisplayed={1}
                pageRangeDisplayed={1}
                onPageChange={handlePageClick}
                containerClassName={"pagination"}
                pageClassName={"page-item"}
                pageLinkClassName={"page-link"}
                previousClassName={"page-item"}
                previousLinkClassName={"page-link"}
                nextClassName={"page-item"}
                nextLinkClassName={"page-link"}
                activeClassName={"active"}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LessonPlanData;
