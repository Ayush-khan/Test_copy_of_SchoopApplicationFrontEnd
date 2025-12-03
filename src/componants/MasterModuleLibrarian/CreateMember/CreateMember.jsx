import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";

const CreateMember = () => {
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

      console.log("roleIDis:", role_id);
      console.log("reg id:", reg_id);
      console.log("academic year", academicyr);

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
        }
      );

      console.log("response", response.data.data);

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
    setSearchTerm("");
    setTimetable([]);
    setSelectedStudentIds([]);
    setSelectedTeacherIds([]);
    setShowStudentReport(false);
    setLoadingForSearch(true);

    let hasError = false;

    if (selectedType === "student" && !selectedStudentId) {
      setStudentError("Please select Class.");
      hasError = true;
    }

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
              acd_yr: academicYear,
            }
          : {
              m_type: "T",
              acd_yr: academicYear,
            };

      const response = await axios.get(`${API_URL}/api/get-not-members`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      const data = response?.data ?? [];
      if (data.length === 0) {
        toast.error("No records found.");
        setLoadingForSearch(false);
        return;
      }

      console.log("Fetched Data:", data);

      // ✅ Prefill selected IDs based on type
      if (selectedType === "student") {
        setSelectedStudentIds(data.map((s) => s.student_id));
      } else if (selectedType === "staff") {
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

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Authentication token missing. Please login again.");
        setIsSubmitting(false);
        return;
      }

      if (!selectedType) {
        toast.error("Please select a member type.");
        setIsSubmitting(false);
        return;
      }

      const selector =
        selectedType === "student" ? selectedStudentIds : selectedTeacherIds;

      if (!selector || selector.length === 0) {
        toast.error("Please select at least one member.");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        selector,
        type: selectedType === "student" ? "Student" : "Teacher",
      };

      console.log("Final Payload:", payload);

      const response = await axios.post(
        `${API_URL}/api/create-member`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success(response.data.message || "Members created successfully!");
        setShowStudentReport(false);
      } else {
        toast.error(response.data.message || "Failed to create members.");
      }
    } catch (error) {
      console.error("Error creating members:", error);
      toast.error("Something went wrong while creating members.");
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
        className={` transition-all duration-500 w-[85%]  mx-auto p-4 ${
          showStudentReport ? "w-[85%] " : "w-[85%] "
        }`}
      >
        <ToastContainer />
        <div className="card  rounded-md ">
          {!showStudentReport && (
            <>
              <div className=" card-header mb-4 flex justify-between items-center ">
                <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
                  Create Member
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
              <div className=" w-full md:w-[100%] flex justify-center flex-col md:flex-row gap-x-1 ml-0 p-2">
                <div className="w-full md:w-[99%] flex md:flex-row justify-between items-center mt-0 md:mt-4">
                  <div className="w-full md:w-[99%]  gap-x-0 md:gap-x-4 flex flex-col gap-y-2 md:gap-y-0 md:flex-row">
                    <div className="w-full md:w-[50%] gap-x-2 justify-around my-1 md:my-4 flex md:flex-row">
                      <label className="w-full md:w-[60%] text-md pl-0 md:pl-5 mt-1.5">
                        Member Type <span className="text-red-500">*</span>
                      </label>

                      <div className="flex items-center w-full">
                        <div className="flex items-center justify-between w-full md:w-[230px] border border-gray-300 rounded-md px-4 py-2 bg-white focus-within:border-pink-500 transition">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="userType"
                              value="student"
                              className="accent-pink-600"
                              checked={selectedType === "student"}
                              onChange={() => setSelectedType("student")}
                            />
                            <span>Student</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="userType"
                              value="staff"
                              className="accent-pink-600"
                              checked={selectedType === "staff"}
                              onChange={() => setSelectedType("staff")}
                            />
                            <span>Staff</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {selectedType === "student" && (
                      <div className="w-full md:w-[60%] gap-x-2 justify-around my-1 md:my-4 flex md:flex-row">
                        <label
                          className="w-full md:w-[30%] text-md pl-0 md:pl-5 mt-1.5"
                          htmlFor="studentSelect"
                        >
                          Select Class <span className="text-red-500">*</span>
                        </label>
                        <div className="w-full md:w-[55%]">
                          <Select
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            id="studentSelect"
                            value={selectedStudent}
                            onChange={handleStudentSelect}
                            options={studentOptions}
                            placeholder={loadingExams ? "Loading..." : "Select"}
                            isSearchable
                            isClearable
                            className="text-sm"
                            isDisabled={loadingExams}
                            styles={{
                              control: (provided) => ({
                                ...provided,
                                fontSize: "1em",
                                minHeight: "30px",
                              }),
                              menu: (provided) => ({
                                ...provided,
                                fontSize: "1em",
                              }),
                              option: (provided) => ({
                                ...provided,
                                fontSize: ".9em",
                              }),
                            }}
                          />
                          {studentError && (
                            <div className="h-8 relative ml-1 text-danger text-xs">
                              {studentError}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-1">
                      <button
                        type="search"
                        onClick={handleSearch}
                        style={{ backgroundColor: "#2196F3" }}
                        className={`btn h-10 w-18 md:w-auto btn-primary text-white font-bold py-1 border-1 border-blue-500 px-4 rounded ${
                          loadingForSearch
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        disabled={loadingForSearch}
                      >
                        {loadingForSearch ? (
                          <span className="flex items-center">
                            <svg
                              className="animate-spin h-4 w-4 mr-2 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                              ></path>
                            </svg>
                            Browsing...
                          </span>
                        ) : (
                          "Browse"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
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
                            Create Member
                          </h3>
                          {/* <div className="flex items-center w-full">
                            <div className="flex flex-row flex-nowrap items-center gap-4 w-full overflow-x-auto bg-blue-50 border-l-2 border-r-2 border-pink-500 rounded-md shadow-md px-4 py-2">
                              <div className="flex items-center gap-2 flex-1 min-w-[100px]">
                                <label
                                  className="w-[30%] whitespace-nowrap text-md sm:text-md"
                                  htmlFor="studentSelect"
                                >
                                  Member Type{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center w-full">
                                  <div className="flex items-center justify-between w-full md:w-[230px] border border-gray-300 rounded-md px-4 py-2 bg-white focus-within:border-pink-500 transition">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        name="userType"
                                        value="student"
                                        className="accent-pink-600"
                                        checked={selectedType === "student"}
                                        onChange={() =>
                                          setSelectedType("student")
                                        }
                                        //   onChange={(e) => setSelectedType(e.target.value)}
                                      />
                                      <span>Student</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        name="userType"
                                        value="staff"
                                        className="accent-pink-600"
                                        checked={selectedType === "staff"}
                                        onChange={(e) =>
                                          setSelectedType(e.target.value)
                                        }
                                      />
                                      <span>Staff</span>
                                    </label>
                                  </div>
                                </div>
                              </div>

                              {selectedType === "student" && (
                                <div className="flex items-center gap-2 flex-1 min-w-[100px]">
                                  <label
                                    className="w-full md:w-[30%] text-md pl-0 md:pl-5 mt-1.5"
                                    htmlFor="studentSelect"
                                  >
                                    Select Class{" "}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <div className="w-full md:w-[55%]">
                                    <Select
                                      menuPortalTarget={document.body}
                                      menuPosition="fixed"
                                      id="studentSelect"
                                      value={selectedStudent}
                                      onChange={handleStudentSelect}
                                      options={studentOptions}
                                      placeholder={
                                        loadingExams ? "Loading..." : "Select"
                                      }
                                      isSearchable
                                      isClearable
                                      className="text-sm"
                                      isDisabled={loadingExams}
                                      styles={{
                                        control: (provided) => ({
                                          ...provided,
                                          fontSize: "1em",
                                          minHeight: "30px",
                                        }),
                                        menu: (provided) => ({
                                          ...provided,
                                          fontSize: "1em",
                                        }),
                                        option: (provided) => ({
                                          ...provided,
                                          fontSize: ".9em",
                                        }),
                                      }}
                                    />
                                    {studentError && (
                                      <div className="h-8 relative ml-1 text-danger text-xs">
                                        {studentError}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              <div className="flex items-center min-w-[90px]">
                                <button
                                  type="button"
                                  onClick={handleSearch}
                                  style={{ backgroundColor: "#2196F3" }}
                                  className={`btn h-9 w-full btn-primary text-white font-bold px-3 rounded ${
                                    loadingForSearch
                                      ? "opacity-50 cursor-not-allowed"
                                      : ""
                                  }`}
                                  disabled={loadingForSearch}
                                >
                                  {loadingForSearch ? "Browsing..." : "Browse"}
                                </button>
                              </div>
                            </div>
                          </div> */}
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

                                <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                  Select
                                </th>

                                {selectedType === "student" && (
                                  <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                    Roll No
                                  </th>
                                )}

                                <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                  Name
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

                                      <td className="px-2 py-2 text-center border border-gray-300">
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
                                      </td>

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
                                              } ${person?.last_name || ""}`
                                            )
                                          : camelCase(person?.name) || ""}
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
                          <button
                            type="button"
                            onClick={handleSubmit}
                            className={`bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-md`}
                          >
                            {isSubmitting ? "Creating" : "Create"}
                          </button>

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

export default CreateMember;
