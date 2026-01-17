import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { FiSearch } from "react-icons/fi";

const StudentListForAdmissionSubmission = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [formId, setFormId] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingForSearch, setLoadingForSearch] = useState(false);

  const navigate = useNavigate();
  const [loadingExams, setLoadingExams] = useState(false);
  const [studentError, setStudentError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [timetable, setTimetable] = useState([]);

  const pageSize = 10;
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const [shortName, setShortName] = useState("");
  // const [showStudentReport, setShowStudentReport] = useState(false);

  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    fetchExams();
    handleSearch();
    fetchsessionData();
  }, []);

  const fetchsessionData = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.error("No authentication token found");
      return;
    }

    try {
      const sessionResponse = await axios.get(`${API_URL}/api/sessionData`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const shortname = sessionResponse?.data?.custom_claims?.short_name;
      setShortName(shortname);

      console.log("short name:", shortname);

      return { shortName };
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchExams = async () => {
    try {
      setLoadingExams(true);
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/admin/admission-classes`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Class", response);
      setStudentNameWithClassId(response?.data?.data || []);
    } catch (error) {
      toast.error("Error fetching Classes");
      console.error("Error fetching Classes:", error);
    } finally {
      setLoadingExams(false);
    }
  };

  const handleSearch = async () => {
    // if (!selectedStudentId) {
    //   setStudentError("Please select class.");
    //   return;
    // }

    setLoadingForSearch(true);
    setLoading(true);
    setTimetable([]);

    const token = localStorage.getItem("authToken");

    //  Now reset UI fields
    setSearchTerm("");
    setFormId("");
    setShowSearch(false);

    try {
      const response = await axios.get(
        `${API_URL}/api/admin/applications/document-submission`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response?.data?.data?.length) {
        toast.error("Admission forms data not found.");
        setTimetable([]);
      } else {
        setTimetable(response.data.data);
        setPageCount(Math.ceil(response.data.data.length / pageSize));
        // setShowStudentReport(true);
      }
    } catch (error) {
      console.error("Error fetching Admission forms:", error);
      toast.error("Error fetching Admission forms. Please try again.");
    } finally {
      setLoadingForSearch(false);
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  // const handleView = (student) => {
  //   console.log("HandleView -->", student);

  //   navigate(
  //     `/viewAdmissionForm/${student.form_id}?class_id=${selectedStudentId}`
  //   );
  // };

  const handleView = (student) => {
    console.log("HandleView -->", student);

    navigate(
      `/viewAdmissionForm/${student.form_id}?class_id=${selectedStudentId}`,
      {
        state: { from: "  listOfStudentsForDocumentSubmission" },
      }
    );
  };
  const camelCase = (str) =>
    str
      ?.toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })
      : "";

  const filteredSections = timetable.filter((section) => {
    const searchLower = searchTerm.toLowerCase();
    const formId = section?.form_id?.toLowerCase() || "";
    const studentName =
      `${section?.first_name} ${section?.mid_name} ${section?.last_name}`
        .toLowerCase()
        .trim() || "";

    const applicationDate = section?.application_date?.toLowerCase() || "";
    const fatherName = section?.father_name?.toLowerCase() || "";
    const fatherMobile = section?.f_mobile?.toLowerCase() || "";
    const fatherEmail = section?.f_email?.toLowerCase() || "";
    const admissionStatus = section?.admission_form_status?.toLowerCase() || "";
    const className = section?.class_name?.toLowerCase() || "";

    return (
      formId.includes(searchLower) ||
      studentName.includes(searchLower) ||
      applicationDate.includes(searchLower) ||
      fatherName.includes(searchLower) ||
      fatherMobile.includes(searchLower) ||
      fatherEmail.includes(searchLower) ||
      admissionStatus.includes(searchLower) ||
      className.includes(searchLower)
    );
  });

  const displayedSections = filteredSections.slice(currentPage * pageSize);
  // const startIndex = currentPage * pageSize;
  // const endIndex = startIndex + pageSize;

  // const displayedSections = filteredSections.slice(startIndex, endIndex);

  const allSelected =
    displayedSections.length > 0 &&
    displayedSections.every((row) => selectedRows.includes(row.form_id));

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(displayedSections.map((row) => row.form_id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleRowSelect = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (selectedRows.length === 0) {
      toast.error("Please select at least one form for document submit.");
      return;
    }

    const token = localStorage.getItem("authToken");
    setLoading(true);

    try {
      const formData = new FormData();

      selectedRows.forEach((id) => {
        formData.append("form_ids[]", id);
      });

      await axios.post(
        `${API_URL}/api/admin/applications/document-submission`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Documents submitted successfully.");
      // setSelectedRows([]);
      handleSearch();
    } catch (error) {
      console.error(error);
      toast.error("Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className={` transition-all duration-500 w-[100%]  mx-auto p-4 
          `}
      >
        <ToastContainer />
        <div className="card rounded-md ">
          <>
            <div className="card-header  flex justify-between items-center">
              <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
                Student List For Document Submission
              </h5>

              {displayedSections?.length > 0 && (
                <div className="bg-blue-50 border-l-2 border-r-2 border-pink-500 rounded-md shadow-md px-4 py-1 mx-auto">
                  <div className="flex items-center justify-center gap-2 text-blue-800 font-medium">
                    <span className="text-blue-800 font-medium whitespace-nowrap">
                      Admission Form Status:
                    </span>

                    <span className="text-pink-600 font-semibold">
                      {displayedSections[0]?.admission_form_status}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex flex-row gap-3 items-center">
                <div className="relative group">
                  <button
                    onClick={() => setShowSearch((prev) => !prev)}
                    className="text-black hover:text-pink-500"
                  >
                    <FiSearch size={20} />
                  </button>

                  <span className="absolute top-full mt-1 right-0 hidden group-hover:block bg-blue-500 text-white text-xs px-2 py-1 rounded shadow whitespace-nowrap">
                    Search
                  </span>
                </div>

                <RxCross1
                  className="text-red-600 cursor-pointer hover:bg-red-100 rounded text-xl"
                  onClick={() => navigate("/dashboard")}
                />
              </div>
            </div>

            {/* Divider */}
            <div
              className="w-full h-1 mb-4"
              style={{ backgroundColor: "#C03078" }}
            />
          </>

          <>
            <div className="w-full mx-auto transition-all duration-300">
              <>
                <div className="w-full pl-2 pb-2 pr-2">
                  <div className="card mx-auto lg:w-full shadow-lg">
                    {showSearch && (
                      <div className="p-2 px-3 bg-gray-100 border-none">
                        <div className="w-full flex justify-end mr-0 md:mr-4">
                          <div className="w-1/2 md:w-[18%] mr-1">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Search"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="card-body w-full">
                      <div
                        className=" h-96 lg:h-96  overflow-y-scroll overflow-x-scroll"
                        style={{
                          scrollbarWidth: "thin",
                          scrollbarColor: "#C03178 transparent",
                        }}
                      >
                        <table className="min-w-full leading-normal table-auto">
                          <thead className="">
                            {/* bg-gray-100 sticky top-0 z-10 */}
                            <tr className="bg-gray-100">
                              <th className="min-w-[20px] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold">
                                Sr No.
                              </th>

                              <th className="min-w-[20px] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold">
                                <span className="mr-2 whitespace-nowrap">
                                  Select All
                                </span>
                                <input
                                  type="checkbox"
                                  checked={allSelected}
                                  onChange={handleSelectAll}
                                  className="w-3 h-3 cursor-pointer accent-blue-500"
                                  title="Select All"
                                />
                              </th>

                              <th className="min-w-[200px] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold whitespace-nowrap">
                                Form Id.
                              </th>

                              <th className="min-w-[230px] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold whitespace-nowrap">
                                Student Name
                              </th>

                              <th className="min-w-[200px] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold whitespace-nowrap">
                                Parent Name
                              </th>

                              <th className="min-w-[80px] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold">
                                Class
                              </th>

                              <th className="min-w-[100px] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold">
                                Phone No.
                              </th>

                              <th className="min-w-[180px] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold">
                                Email Id
                              </th>

                              <th className="min-w-[140px] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold">
                                Application Date (DD-MM-YY)
                              </th>

                              {/* <th className="min-w-[80px] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold whitespace-nowrap">
                                Status
                              </th> */}

                              <th className="min-w-[50px] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold">
                                View
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {loading ? (
                              <tr>
                                <td
                                  colSpan={10}
                                  className="text-center py-6 text-blue-700 text-lg"
                                >
                                  Please wait while data is loading...
                                </td>
                              </tr>
                            ) : displayedSections.length ? (
                              <>
                                {displayedSections.map((student, index) => (
                                  <tr
                                    key={student.adm_form_pk}
                                    className="border border-gray-300"
                                  >
                                    <td className="px-2 py-2 text-center border border-gray-300">
                                      {index + 1}
                                    </td>

                                    <td className="px-2 py-2 text-center border border-gray-300">
                                      <input
                                        type="checkbox"
                                        checked={selectedRows.includes(
                                          student.form_id
                                        )}
                                        onChange={() =>
                                          handleRowSelect(student.form_id)
                                        }
                                        className="w-3 h-3 cursor-pointer accent-blue-500"
                                      />
                                    </td>

                                    <td className="px-2 py-2 text-center border border-gray-300">
                                      {student.form_id}
                                    </td>

                                    <td className="px-2 py-2 text-center border border-gray-300">
                                      {camelCase(
                                        `${student.first_name} ${student.mid_name} ${student.last_name}`
                                      )}
                                    </td>

                                    <td className="px-2 py-2 text-center border border-gray-300">
                                      {camelCase(student.father_name)}
                                    </td>

                                    <td className="px-2 py-2 text-center border border-gray-300">
                                      {student.class_name}
                                    </td>

                                    <td className="px-2 py-2 text-center border border-gray-300">
                                      {student.f_mobile}
                                    </td>

                                    <td className="px-2 py-2 text-center border border-gray-300">
                                      {student.f_email}
                                    </td>

                                    <td className="px-2 py-2 text-center border border-gray-300">
                                      {formatDate(student.application_date)}
                                    </td>

                                    <td className="px-2 py-2 text-center border border-gray-300">
                                      <button
                                        onClick={() => handleView(student)}
                                        className="text-blue-600 hover:text-blue-800"
                                      >
                                        <MdOutlineRemoveRedEye className="text-xl" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}

                                {/* ✅ SUMMARY ROW */}
                                <tr className="bg-gray-100 font-semibold">
                                  <td
                                    colSpan={10}
                                    className="border border-gray-950"
                                  >
                                    <div className="flex justify-center items-center gap-2 px-4 py-2">
                                      <span>
                                        <span className="text-blue-800 ml-1">
                                          Total Count :{" "}
                                        </span>

                                        <span className="text-pink-600 ml-1">
                                          {displayedSections.length}
                                        </span>
                                      </span>
                                    </div>
                                  </td>
                                </tr>
                              </>
                            ) : (
                              <tr>
                                <td
                                  colSpan={10}
                                  className="text-center py-6 text-red-700 text-lg"
                                >
                                  Oops! No data found..
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex justify-end gap-4 pr-3 mt-2 mr-10">
                        <button
                          onClick={handleSubmit}
                          className="bg-blue-500 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded"
                        >
                          Document Submitted
                        </button>
                        <button
                          onClick={() => navigate("/dashboard")}
                          className="bg-yellow-300 hover:bg-yellow-400 text-white font-semibold px-4 py-2 rounded"
                        >
                          Back
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            </div>
          </>
        </div>
      </div>
    </>
  );
};

export default StudentListForAdmissionSubmission;
