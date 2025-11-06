import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { RxCross1 } from "react-icons/rx";
import LoaderStyle from "../../componants/common/LoaderFinal/LoaderStyle";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ImDownload } from "react-icons/im";
import { FaEye, FaUserAltSlash, FaUserCheck } from "react-icons/fa";
import ReactPaginate from "react-paginate";
import { MdOutlineRemoveRedEye } from "react-icons/md";

const ViewedByTeacherNotes = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [loading, setLoading] = useState(false); // Loader state
  // const [fetchingClasses, setFetchingClasses] = useState(false); // Loader for fetching classes
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { id } = useParams();
  console.log("id", id);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const location = useLocation();
  const [isObservation, setIsObservation] = useState(false);
  const [roleId, setRoleId] = useState(null);
  const [regId, setRegId] = useState(null);
  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");
  const [academicYr, setAcademicYr] = useState(null);
  const [teacherRoleName, setTeacherRoleName] = useState(null);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const pageSize = 10;
  const [TeacherNotesData, setTeacherNotesData] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    remark_subject: "",
    remark_desc: "",
    remark_type: "",
    remark_id: "",
    subject_id: "",
    class_id: "",
    section_id: "",
    date: "",
    filenottobedeleted: [], // existing uploaded files (to preview, not delete)
    userfile: [], // new files (if any, uploaded in edit)
  });
  console.log("stateeee--->", location.state);
  const formatName = (first = "", mid = "", last = "") => {
    return `${first} ${mid} ${last}`
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("authToken");
        if (!token) {
          toast.error("Authentication token not found. Please login again.");
          navigate("/");
          return;
        }

        // 🧾 1️⃣ Get session data
        const sessionRes = await axios.get(`${API_URL}/api/sessionData`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const acdYr = sessionRes?.data?.custom_claims?.academic_year;
        const roleId = sessionRes?.data?.user?.name;
        const regId = sessionRes?.data?.user?.reg_id;
        const teacherRoleName = sessionRes?.data?.user?.role_id;

        if (!roleId || !regId || !acdYr) {
          toast.error("Invalid session data received");
          return;
        }

        // ✅ Set all session states
        setRoleId(roleId);
        setRegId(regId);
        setTeacherRoleName(teacherRoleName);
        setAcademicYr(acdYr);
      } catch (error) {
        console.error("Initialization error:", error);
        toast.error("Failed to get session data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (location.state) {
      // First, fetch and display images/attachment
      // Then set form data
      setFormData({
        remark_id: location.state.t_remark_id || "",
        name: location.state.first_name || location.state.name || "",
        remark_subject: location.state.remark_subject || "",
        remark_desc: location?.state?.description || "",
        remark_type: location.state.remark_type || "Remark",
        filenottobedeleted: location.state.files || [],
        userfile: [], // no new file uploads initially
        subjectname: `${location?.state?.remark_subject || ""}`.trim(),
        classname: `${location?.state?.name || ""}`.trim(),
        date: location?.state?.date || "",
        subject_id: location.state.subject_id || "",
        class_id: location.state.class_id || "",
        section_id: location.state.section_id || "",
      });

      setSelectedClasses(location.state.selected_class_ids || []);
      setIsObservation(location.state.remark_type === "Observation");
    }
  }, [location.state]);
  useEffect(() => {
    if (
      teacherRoleName &&
      academicYr &&
      formData?.remark_id &&
      formData?.class_id &&
      formData?.section_id
    ) {
      ViewdByTeacherNotes();
    }
  }, [teacherRoleName, academicYr, formData]);

  const ViewdByTeacherNotes = async () => {
    try {
      setIsSubmitting(true);

      const token = localStorage.getItem("authToken");

      // 🧾 Build form data
      const data = new FormData();
      data.append("login_type", teacherRoleName); // e.g., "T"
      data.append("acd_yr", academicYr || "");
      data.append("notes_id", formData.remark_id || "");
      data.append("class_id", formData?.class_id || "");
      data.append("section_id", formData?.section_id || "");
      // 🚀 API call
      const response = await axios.post(
        `${API_URL}/api/get_students_notes_viewed`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.status === true) {
        toast.success("Teacher's note data successfully!");
        setTeacherNotesData(response?.data?.student_list || []);
      } else {
        toast.error(response.data.message || "Failed to teacher's note data!");
        setTeacherNotesData([]);
      }
    } catch (error) {
      console.error("Error teacher's note data:", error);
      toast.error("Something went wrong!");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };
  useEffect(() => {
    const trimmedSearch = searchTerm.trim().toLowerCase();

    if (trimmedSearch !== "" && prevSearchTermRef.current === "") {
      previousPageRef.current = currentPage; // save page before search
      setCurrentPage(0); // jump to first page for search
    }

    if (trimmedSearch === "" && prevSearchTermRef.current !== "") {
      setCurrentPage(previousPageRef.current); // restore page after clearing search
    }

    prevSearchTermRef.current = trimmedSearch;
  }, [searchTerm]);

  // Filtering by class name or division name
  // Filtering students by name or roll number
  const searchLower = searchTerm.trim().toLowerCase();
  const filteredSections = TeacherNotesData.filter((student) => {
    const fullName =
      `${student.first_name} ${student.mid_name} ${student.last_name}`.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      (student.roll_no && student.roll_no.toString().includes(searchLower))
    );
  });

  useEffect(() => {
    setPageCount(Math.ceil(filteredSections.length / pageSize));
  }, [filteredSections, pageSize]);

  // Paginate filtered results
  const displayedSections = filteredSections.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );
  return (
    <div>
      <ToastContainer />
      <div className="container mb-4">
        <div className="card-header flex justify-between items-center"></div>
        <div className="w-[90%] mx-auto">
          <div className="container mt-4">
            <div className="card mx-auto lg:w-full shadow-lg">
              <div className="p-2 px-3 bg-gray-100 flex justify-between items-center">
                <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
                  Viewed By Teacher's note
                </h3>{" "}
                <div className="box-border flex md:gap-x-2 justify-end md:h-10">
                  <div className=" w-1/2 md:w-fit mr-1 flex flex-row ">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search "
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <RxCross1
                      className="relative top-2 ml-2 text-2xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                      type="button"
                      // className="btn-close text-red-600"
                      onClick={() => navigate("/TeacherNotes")}
                    />
                  </div>
                </div>
              </div>
              <div
                className="relative  h-1 w-[97%] mx-auto"
                style={{ backgroundColor: "#C03078" }}
              ></div>
              <div className="card-body w-full ml-2">
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    {/* <div className="spinner-border text-primary" role="status"> */}
                    <LoaderStyle />
                    {/* </div> */}
                  </div>
                ) : (
                  <div className="card-body w-full md:w-[90%] mx-auto ml-2">
                    <div className="space-y-5 mr-14">
                      {/* Class Selection */}
                      <div className="flex flex-col md:flex-row items-start md:items-center">
                        <div className="flex-1">
                          <textarea
                            value={formData?.remark_desc || ""}
                            readOnly
                            rows={1} // adjust height
                            className="w-full bg-gray-100 text-center  text-gray-700 p-3 rounded resize-none border border-gray-300 focus:outline-none"
                            placeholder="No description available"
                          />
                        </div>
                      </div>

                      <div className="card mx-auto lg:w-[100%] shadow-lg">
                        <div className="card-body w-full">
                          <div
                            className={`h-96 w-full md:w-[99%] lg:h-96 overflow-y-scroll lg:overflow-x-hidden mx-auto `}
                          >
                            <div className="bg-white  rounded-lg shadow-xs ">
                              <table className="min-w-full leading-normal table-auto ">
                                <thead>
                                  <tr className="bg-gray-200">
                                    <th className="px-2 w-full md:w-[12%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                      Sr.No
                                    </th>
                                    <th className=" -px-2  w-full md:w-[25%] text-center py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                      Roll no.
                                    </th>
                                    <th className="px-2 text-center lg:px-5 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                      Student name{" "}
                                    </th>
                                    <th className="px-2 text-center lg:px-5 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                      Viewed{" "}
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {isSubmitting ? (
                                    <tr>
                                      <td
                                        colSpan="4"
                                        className="text-center text-blue-700 text-lg py-10"
                                      >
                                        Please wait while data is loading...
                                      </td>
                                    </tr>
                                  ) : TeacherNotesData.length ? (
                                    displayedSections.map((student, index) => (
                                      <tr
                                        key={student.student_id}
                                        className={`${
                                          index % 2 === 0
                                            ? "bg-white"
                                            : "bg-gray-100"
                                        } hover:bg-gray-50 transition-all`}
                                      >
                                        <td className="text-center px-2 lg:px-3 border border-gray-300 text-sm">
                                          {currentPage * pageSize + index + 1}
                                        </td>
                                        <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                          {student.roll_no
                                            ? student.roll_no
                                            : "-"}
                                        </td>
                                        <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                          {formatName(
                                            student.first_name,
                                            student.mid_name,
                                            student.last_name
                                          )}
                                        </td>
                                        <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                          {student.read_status === 1 ? (
                                            <span className="inline-flex items-center text-green-600 font-semibold">
                                              <FaUserCheck className="text-lg mr-1" />{" "}
                                              Viewed
                                            </span>
                                          ) : (
                                            <span className="inline-flex items-center text-red-500 font-semibold">
                                              <FaUserAltSlash className="text-lg mr-1" />{" "}
                                              Not Viewed
                                            </span>
                                          )}
                                        </td>
                                      </tr>
                                    ))
                                  ) : (
                                    !isSubmitting && (
                                      <tr>
                                        <td
                                          colSpan="4"
                                          className="text-center text-red-600 text-lg py-10"
                                        >
                                          Oops! No student data found.
                                        </td>
                                      </tr>
                                    )
                                  )}
                                </tbody>
                              </table>
                            </div>
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

export default ViewedByTeacherNotes;
