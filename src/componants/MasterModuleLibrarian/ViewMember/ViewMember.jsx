import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";

const ViewMember = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [showStudentReport, setShowStudentReport] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);

  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const [loadingForSearch, setLoadingForSearch] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState([]);

  const navigate = useNavigate();
  const [loadingExams, setLoadingExams] = useState(false);
  const [studentError, setStudentError] = useState("");

  const [roleId, setRoleId] = useState("");
  const [regId, setRegId] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState(null);

  const [timetable, setTimetable] = useState([]);

  const pageSize = 10;
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedType, setSelectedType] = useState("student");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [academicYear, setAcademicYear] = useState("");
  const [stafflist, setStafflist] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [name, setName] = useState("");
  const [grn_no, setGrnNo] = useState("");
  const [selectedStaffname, setSelectedStaffName] = useState(null);

  const camelCase = (str) =>
    str
      ?.toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  useEffect(() => {
    fetchDataRoleId();
  }, []);

  useEffect(() => {
    if (!roleId || !regId) return;
    fetchClasses(roleId, regId);
  }, [roleId, regId]);

  const fetchDataRoleId = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.error("No authentication token found");
      return;
    }

    try {
      const sessionResponse = await axios.get(`${API_URL}/api/sessionData`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const role_id = sessionResponse.data.user.role_id;
      const reg_id = sessionResponse.data.user.reg_id;
      const academicyr = sessionResponse.data.custom_claims.academic_year;

      setRoleId(role_id);
      setRegId(reg_id);
      setAcademicYear(academicyr);

      // console.log("roleIDis:", role_id);
      // console.log("reg id:", reg_id);
      // console.log("academic year", academicyr);

      return { roleId, regId };
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchClasses = async (roleId, regId) => {
    const token = localStorage.getItem("authToken");
    setLoadingExams(true);

    try {
      const response = await axios.get(
        `${API_URL}/api/get_teacherclasseswithclassteacher?teacher_id=${regId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // console.log("response", response.data.data);

      const mappedData = (response.data.data || [])
        .filter((item) => item.class_id && item.section_id)
        .map((cls) => ({
          value: cls.class_id,
          class_id: cls.class_id,
          section_id: cls.section_id,
          classname: cls.classname,
          sectionname: cls.sectionname,
          label: `${cls.classname} ${cls.sectionname}`,
        }));

      setStudentNameWithClassId(mappedData || []);
    } catch (error) {
      toast.error("Error fetching Classes");
      console.error("Error fetching Classes:", error);
    } finally {
      setLoadingExams(false);
    }
  };

  const studentOptions = useMemo(() => {
    if (!studentNameWithClassId) return [];

    return studentNameWithClassId.map((cls) => ({
      value: `${cls.class_id}-${cls.section_id}`, // ✅ unique value for dropdown
      class_id: cls.class_id, // real class_id for API
      section_id: cls.section_id, // real section_id for API
      classname: cls.classname,
      sectionname: cls.sectionname,
      label: `${cls.classname} ${cls.sectionname}`,
    }));
  }, [studentNameWithClassId, roleId]);

  const handleStudentSelect = (selectedOption) => {
    setStudentError("");
    setSelectedStudent(selectedOption);

    if (selectedOption) {
      setSelectedStudentId(selectedOption.class_id); // ✅ class_id only
      setSelectedSectionId(selectedOption.section_id); // ✅ section_id only
    } else {
      setSelectedStudentId(null);
      setSelectedSectionId(null);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    const token = localStorage.getItem("authToken");
    setLoadingExams(true);

    try {
      const response = await axios.get(`${API_URL}/api/staff_list `, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // console.log("response staff", response.data);

      setStafflist(response.data);
    } catch (error) {
      toast.error("Error fetching Classes");
      console.error("Error fetching Classes:", error);
    } finally {
      setLoadingExams(false);
    }
  };

  const staffOptions = useMemo(() => {
    if (!stafflist) return [];

    return stafflist.map((cls) => ({
      value: `${cls.teacher_id}`,
      label: `${cls.name}`,
    }));
  }, [stafflist]);

  const handleStaffSelect = (selectedOption) => {
    setSelectedStaff(selectedOption);

    if (selectedOption) {
      setSelectedStaffId(selectedOption.value); // teacher_id
      setSelectedStaffName(selectedOption.label);
    } else {
      setSelectedStaffId(null);
      setSelectedStaffName(null);
    }
  };

  useEffect(() => {
    if (selectedType === "student") {
      setSelectedTeacherIds([]);
      setSelectedStudent(null);
      setSelectedStudentId("");
      setSelectedSectionId("");
    } else if (selectedType === "staff") {
      setSelectedStudent(null);
      setSelectedStudentId("");
      setSelectedSectionId("");
      setSelectedStudentIds([]);
    }

    setStudentError("");
    setTimetable([]);
    setShowStudentReport(false);
  }, [selectedType]);

  const handleSearch = async () => {
    setStudentError("");
    setTimetable([]);
    setShowStudentReport(false);
    setLoadingForSearch(true);

    let hasError = false;

    if (hasError) {
      setLoadingForSearch(false);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");

      const params =
        selectedType === "student"
          ? {
              m_type: "S",
              class_id: selectedStudentId,
              section_id: selectedSectionId,
              name: name || "",
              grn_no: grn_no || "",
              academic_yr: academicYear,
            }
          : {
              m_type: "T",
              name: selectedStaffname,
              academic_yr: academicYear,
            };

      const response = await axios.get(`${API_URL}/api/library-members`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      const data = response?.data ?? [];

      if (!data || data.length === 0) {
        toast.error("No records found.");
        setLoadingForSearch(false);
        return;
      }

      // console.log("Fetched Data:", data);

      if (selectedType === "student") {
        setSelectedStudentIds(data.map((s) => s.student_id));
      } else {
        setSelectedTeacherIds(data.map((t) => t.teacher_id));
      }

      setTimetable(data);
      setPageCount(Math.ceil(data.length / pageSize));
      setShowStudentReport(true);
    } catch (error) {
      console.error("API Error:", error?.response?.data || error.message);
      toast.error("Failed to fetch data. Please try again.");
    } finally {
      setLoadingForSearch(false);
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (person) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Authentication token missing. Please login again.");
        setIsSubmitting(false);
        return;
      }

      const action = person?.status === "A" ? "Inactive" : "Active";
      const member_type = selectedType === "student" ? "S" : "T";
      const member_id =
        selectedType === "student" ? person?.student_id : person?.teacher_id;

      const payload = {
        action,
        member_id,
        member_type,
      };

      // console.log("Final Payload:", payload);

      const response = await axios.post(
        `${API_URL}/api/library-member/status`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 200 || response.status === 201) {
        toast.success(response.data.message || "Status updated successfully!");
        handleSearch();
      } else {
        toast.error(response.data.message || "Failed to update member.");
      }
    } catch (error) {
      console.error("Error updating member:", error);

      if (error?.response?.status === 400) {
        toast.error(error.response.data?.message || "Bad request.");
      } else {
        toast.error("Something went wrong while updating member.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSections = timetable.filter((record) => {
    const searchLower = searchTerm.toLowerCase();

    const classSection = record?.class_section?.toLowerCase() || "";
    const classTeacher = record?.class_teacher?.toLowerCase() || "";

    return (
      classSection.includes(searchLower) || classTeacher.includes(searchLower)
    );
  });

  const displayedSections = filteredSections.slice(currentPage * pageSize);

  return (
    <>
      <div
        className={` transition-all duration-500 w-[100%]  mx-auto p-4 ${
          showStudentReport ? "w-[100%] " : "w-[100%] "
        }`}
      >
        <ToastContainer />
        <div className="card  rounded-md ">
          {!showStudentReport && (
            <>
              <div className=" card-header mb-4 flex justify-between items-center ">
                <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
                  Members Listing
                </h5>
                <RxCross1
                  className="  relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                  onClick={() => {
                    navigate("/dashboard");
                  }}
                />
              </div>
              <div
                className=" relative w-[98%]   -top-6 h-1  mx-auto bg-red-700"
                style={{
                  backgroundColor: "#C03078",
                }}
              ></div>
            </>
          )}

          <>
            {!showStudentReport && (
              <div className="w-full flex flex-col md:flex-row items-center gap-4 p-2">
                {/* Member Type */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <label className="text-md whitespace-nowrap">
                    Member Type <span className="text-red-500">*</span>
                  </label>

                  <div className="flex items-center border border-gray-300 rounded-md px-4 py-2 bg-white">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="userType"
                        value="student"
                        checked={selectedType === "student"}
                        onChange={() => setSelectedType("student")}
                        className="accent-pink-600"
                      />
                      <span>Student</span>
                    </label>

                    <label className="flex items-center gap-1 ml-4 cursor-pointer">
                      <input
                        type="radio"
                        name="userType"
                        value="staff"
                        checked={selectedType === "staff"}
                        onChange={() => setSelectedType("staff")}
                        className="accent-pink-600"
                      />
                      <span>Staff</span>
                    </label>
                  </div>
                </div>

                {/* Student Fields */}
                {selectedType === "student" && (
                  <>
                    {/* Select Class */}
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <label className="text-md whitespace-nowrap">
                        Select Class
                      </label>
                      <div className="w-[150px]">
                        <Select
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          value={selectedStudent}
                          onChange={handleStudentSelect}
                          options={studentOptions}
                          placeholder="Select"
                          isClearable
                          isSearchable
                        />
                      </div>
                    </div>

                    {/* Name */}
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <label className="text-md whitespace-nowrap">Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter"
                        className="border border-gray-300 rounded px-2 py-2 w-[200px]"
                        maxLength={200}
                      />
                    </div>

                    {/* GRN NO */}
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <label className="text-md whitespace-nowrap">
                        GRN No.
                      </label>
                      <input
                        type="text"
                        value={grn_no}
                        onChange={(e) => setGrnNo(e.target.value)}
                        placeholder="Enter"
                        className="border border-gray-300 rounded px-2 py-2 w-[120px]"
                        maxLength={8}
                      />
                    </div>
                  </>
                )}

                {/* Staff Dropdown */}
                {selectedType === "staff" && (
                  <div className="flex items-center gap-4 w-full md:w-auto ml-10">
                    <label className="text-md whitespace-nowrap">
                      Select Staff <span className="text-red-500">*</span>
                    </label>
                    <div className="w-[250px]">
                      <Select
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        value={selectedStaff}
                        onChange={handleStaffSelect}
                        options={staffOptions}
                        placeholder="Select"
                        isSearchable
                        isClearable
                      />
                    </div>
                  </div>
                )}

                {/* Browse Button */}
                <button
                  type="button"
                  onClick={handleSearch}
                  style={{ backgroundColor: "#2196F3" }}
                  className="h-10 text-white px-4 rounded font-semibold"
                >
                  {loadingForSearch ? "Browsing.." : "Browse"}
                </button>
              </div>
            )}

            {showStudentReport && (
              <>
                <>
                  <div className="w-full ">
                    <div className="card mx-auto lg:w-full shadow-lg">
                      <div className="p-2 px-3 bg-gray-100 border-none flex items-center justify-between">
                        <div className="w-full flex flex-row items-center justify-between ">
                          <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap mr-6">
                            Members Listing
                          </h3>

                          {selectedType === "student" && selectedStudent && (
                            <div
                              className="bg-blue-50 border-l-2 border-r-2 text-[1em] border-pink-500 rounded-md shadow-md mx-auto px-6 py-2"
                              style={{
                                overflowX: "auto",
                                whiteSpace: "nowrap",
                              }}
                            >
                              <div
                                className="flex items-center gap-x-4 text-blue-800 font-medium"
                                style={{ flexWrap: "nowrap" }}
                              >
                                <div className="flex items-center gap-2">
                                  <label
                                    className="text-md whitespace-nowrap"
                                    htmlFor="studentSelect"
                                  >
                                    <span className="text-lg">🏫</span>
                                    Class :{" "}
                                  </label>
                                  <span>{selectedStudent.label}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex mb-1.5 flex-col md:flex-row gap-x-6 justify-center md:justify-end ml-2">
                          <RxCross1
                            className="text-base text-red-600 cursor-pointer hover:bg-red-100 rounded"
                            onClick={() => setShowStudentReport(false)}
                          />
                        </div>
                      </div>

                      <div
                        className=" relative w-[97%]   mb-3 h-1  mx-auto bg-red-700"
                        style={{
                          backgroundColor: "#C03078",
                        }}
                      ></div>

                      <div className="card-body w-full">
                        <div
                          className="h-96 lg:h-96 overflow-y-scroll overflow-x-scroll"
                          style={{
                            scrollbarWidth: "thin",
                            scrollbarColor: "#C03178 transparent",
                          }}
                        >
                          <table className="min-w-full leading-normal table-auto">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                  Sr No.
                                </th>

                                {selectedType === "student" && (
                                  <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                    Roll No
                                  </th>
                                )}
                                <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                  Name
                                </th>
                                {selectedType === "student" && (
                                  <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                    Class/Div
                                  </th>
                                )}

                                <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                  Type
                                </th>
                                <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                  Status
                                </th>
                                <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                  Change Status
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {displayedSections.length > 0 ? (
                                displayedSections.map((person, index) => {
                                  const personId =
                                    selectedType === "student"
                                      ? person.student_id
                                      : person.teacher_id;

                                  const isChecked =
                                    selectedType === "student"
                                      ? selectedStudentIds.includes(personId)
                                      : selectedTeacherIds.includes(personId);

                                  return (
                                    <tr
                                      key={personId}
                                      className="border border-gray-300"
                                    >
                                      <td className="px-2 py-2 text-center border border-gray-300">
                                        {index + 1}
                                      </td>

                                      {/* <td className="px-2 py-2 text-center border border-gray-300">
                                        <input
                                          type="checkbox"
                                          checked={
                                            selectedType === "student"
                                              ? selectedStudentIds.includes(
                                                  personId
                                                )
                                              : selectedTeacherIds.includes(
                                                  personId
                                                )
                                          }
                                          onChange={(e) => {
                                            const checked = e.target.checked;

                                            if (selectedType === "student") {
                                              setSelectedStudentIds(
                                                (prev) =>
                                                  checked
                                                    ? [...prev, personId] // add
                                                    : prev.filter(
                                                        (id) => id !== personId
                                                      ) // remove
                                              );
                                            } else if (
                                              selectedType === "staff"
                                            ) {
                                              setSelectedTeacherIds((prev) =>
                                                checked
                                                  ? [...prev, personId]
                                                  : prev.filter(
                                                      (id) => id !== personId
                                                    )
                                              );
                                            }
                                          }}
                                        />
                                      </td> */}

                                      {selectedType === "student" && (
                                        <td className="px-2 py-2 text-center border border-gray-300">
                                          {person?.roll_no || ""}
                                        </td>
                                      )}

                                      <td className="px-2 py-2 text-center border border-gray-300">
                                        {selectedType === "student"
                                          ? camelCase(
                                              `${person?.first_name || ""} ${
                                                person?.mid_name || ""
                                              } ${person?.last_name || ""}`,
                                            )
                                          : camelCase(person?.name) || ""}
                                      </td>

                                      {selectedType === "student" && (
                                        <td className="px-2 py-2 text-center border border-gray-300">
                                          {person?.class_name ||
                                            person?.classname ||
                                            ""}{" "}
                                          {person?.section_name ||
                                            person.sectionname ||
                                            ""}
                                        </td>
                                      )}

                                      <td className="px-2 py-2 text-center border border-gray-300">
                                        {person?.member_type === "T"
                                          ? "Teacher"
                                          : "Student"}
                                      </td>

                                      <td className="px-2 py-2 text-center border border-gray-300">
                                        {person?.status === "A"
                                          ? "Active"
                                          : "Inactive"}
                                      </td>

                                      <td className="px-2 py-2 text-center border border-gray-300">
                                        <button
                                          className={`px-3 py-1 text-white rounded 
                                          ${
                                            person?.status === "A"
                                              ? "bg-blue-500 hover:bg-blue-600"
                                              : "bg-green-500 hover:bg-green-600"
                                          }`}
                                          onClick={() => handleSubmit(person)}
                                        >
                                          {person?.status === "A"
                                            ? "Inactive"
                                            : "Active"}
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })
                              ) : (
                                <tr>
                                  <td colSpan={6} className="text-center py-14">
                                    {loadingForSearch ? (
                                      <span className="text-blue-600 text-xl font-normal">
                                        Please wait while data is loading...
                                      </span>
                                    ) : (
                                      <span className="text-red-600 text-xl font-normal">
                                        Oops! No data found.
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                        <div className="flex justify-end gap-3 mt-4 mr-4">
                          {/* <button
                            type="button"
                            onClick={handleSubmit}
                            className={`bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-md`}
                          >
                            {isSubmitting ? "Creating" : "Create"}
                          </button> */}

                          <button
                            type="button"
                            className="bg-yellow-300 hover:bg-yellow-400 text-white font-medium px-4 py-2 rounded-lg shadow-md"
                            onClick={() => setShowStudentReport(false)}
                          >
                            Back
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              </>
            )}
          </>
        </div>
      </div>
    </>
  );
};

export default ViewMember;
