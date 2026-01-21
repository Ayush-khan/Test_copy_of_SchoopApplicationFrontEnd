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
import { FaCheck, FaUserAlt } from "react-icons/fa";

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
  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");
  const navigate = useNavigate();
  const pageSize = 10;
  const maxCharacters = 150;
  const [roleId, setRoleId] = useState(null);
  const [regId, setRegId] = useState(null);

  const capitalizeFirstLetter = (str) => {
    return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";
  };

  useEffect(() => {
    fetchRoleId();
    // fetchClassNames();
    // handleSearch();
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
        setPageCount(Math.ceil(absentStudents.length / 10));
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

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
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

  const displayedSections = filteredSections.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize,
  );

  return (
    <>
      <ToastContainer />
      <div className="md:mx-auto md:w-[75%] p-4 bg-white">
        <div className="bg-white rounded-md">
          {activeTab === "Manage" && (
            <div>
              {/* Table Section */}
              {subjects.length > 0 && (
                <div className="card mx-auto lg:w-full shadow-lg">
                  <div className="p-2 px-3 bg-gray-100 flex justify-between items-center">
                    <h3 className="text-gray-700 text-lg font-semibold">
                      Today's Attendance not mark Classes{" "}
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
                        <table className="min-w-full leading-normal table-auto border-collapse rounded-lg overflow-hidden shadow-md">
                          <thead>
                            <tr className="bg-gray-200 text-gray-900">
                              <th className="px-2 w-[20%] text-center py-2 border border-gray-300 text-sm font-semibold">
                                Sr. No
                              </th>

                              <th className="px-2 w-[25%] text-center py-2 border border-gray-300 text-sm font-semibold">
                                Class
                              </th>
                              <th className="px-2 w-[40%] text-center py-2 border border-gray-300 text-sm font-semibold">
                                Class Teacher Name
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
                                >
                                  {/* Sr.No */}
                                  <td className="text-center px-2 py-2 border border-gray-200 text-sm">
                                    {currentPage * pageSize + index + 1}
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
                      )}
                    </div>

                    {/* Pagination is */}
                    <div className="flex justify-center pt-2 -mb-3">
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
                        containerClassName={"pagination justify-content-center"}
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
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default NotMarkAbsentees;
