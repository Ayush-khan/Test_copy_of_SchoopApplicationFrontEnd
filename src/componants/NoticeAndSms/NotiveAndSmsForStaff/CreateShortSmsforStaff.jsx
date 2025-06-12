import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoaderStyle from "../../common/LoaderFinal/LoaderStyle";
import Select from "react-select";
import "bootstrap/dist/css/bootstrap.min.css";
import { RxCross1 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";

const CreateShortSMS = () => {
  const API_URL = import.meta.env.VITE_API_URL; // URL for host

  const [loading, setLoading] = useState(false); // Loader state
  const [divisionError, setDivisionError] = useState("");
  // const [allClasses, setAllClasses] = useState([]);
  const [subject, setSubject] = useState("");
  const [noticeDesc, setNoticeDesc] = useState("");
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [subjectError, setSubjectError] = useState("");
  const [depatmentError, setDepatmentError] = useState("");
  const [noticeDescError, setNoticeDescError] = useState("");
  const [classError, setClassError] = useState("");
  const [allDepartments, setAllDepartments] = useState([]); // API list
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [teachersByDepartment, setTeachersByDepartment] = useState({});
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [isTeachersLoading, setIsTeachersLoading] = useState(false);
  const navigate = useNavigate();
  // Handle division checkbox change
  useEffect(() => {
    fetchDepartmentNames();
  }, []);

  const fetchDepartmentNames = async () => {
    setLoading(true); // Start loader
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Token expired. Please login again.");

      setTimeout(() => {
        navigate("/");
      }, 2000);
    }
    try {
      const response = await axios.get(`${API_URL}/api/get_departmentlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(response.data.data)) {
        setAllDepartments(response?.data?.data);
      } else {
        setDivisionError("Unexpected data format");
      }
    } catch (error) {
      toast.error("Error in fatching Department Data");
      console.error("Error fetching class names:", error);
      setDivisionError("Error fetching class names");
    } finally {
      setLoading(false); // Stop loader
    }
  };

  const departmentOptions = [
    ...allDepartments.map((dept) => ({
      label: dept.name,
      value: dept.department_id,
    })),
    { label: "Non-teaching Staff", value: "S" },
  ];

  const handleDepartmentChange = async (selectedOption) => {
    if (!selectedOption) {
      setSelectedDepartment(null);
      setTeachersByDepartment({});
      setSelectedTeachers([]);
      return;
    }

    const deptId = selectedOption.value;
    setSelectedDepartment(selectedOption);
    setIsTeachersLoading(true);
    setSelectedTeachers([]);

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/api/get_teacherlistbydepartment?department_id=${deptId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.data) {
        setTeachersByDepartment({ [deptId]: response.data.data });
      }
    } catch (error) {
      toast.error("Failed to fetch teachers");
      console.error("Error fetching teachers:", error);
    } finally {
      setIsTeachersLoading(false);
    }
  };

  const handleTeacherToggle = (teacherId) => {
    let updated;
    if (selectedTeachers.includes(teacherId)) {
      updated = selectedTeachers.filter((id) => id !== teacherId);
    } else {
      updated = [...selectedTeachers, teacherId];
    }
    setSelectedTeachers(updated);
    if (updated.length > 0) setClassError("");
  };

  const handleSelectAll = () => {
    const currentDeptId = selectedDepartment?.value;
    const allTeachers = teachersByDepartment[currentDeptId] || [];

    if (selectedTeachers.length === allTeachers.length) {
      setSelectedTeachers([]); // Deselect all
    } else {
      setSelectedTeachers(allTeachers.map((teacher) => teacher.teacher_id)); // Select all
    }
  };

  // Reset form
  const resetForm = () => {
    setSubject("");
    setNoticeDesc("");
    setSelectedDepartment(null);
    setSelectedTeachers([]);
    setTeachersByDepartment([]);
    setSelectedDepartment([]);
    setSelectedClasses([]);
    setSubjectError("");
    setNoticeDescError("");
    setClassError("");
  };

  const handleSubmit = async (isPublish = false) => {
    let hasError = false;

    // Validate Subject
    if (!subject.trim()) {
      setSubjectError("Subject is required.");
      hasError = true;
    } else {
      setSubjectError("");
    }

    // Validate Description
    if (!noticeDesc.trim()) {
      setNoticeDescError("Short SMS description is required.");
      hasError = true;
    } else {
      setNoticeDescError("");
    }

    // Validate Department
    if (!selectedDepartment) {
      setDepatmentError("Please select a department.");
      hasError = true;
    } else {
      setDepatmentError("");
    }

    // Validate Teacher Selection
    const teacherList = teachersByDepartment[selectedDepartment?.value] || [];
    if (teacherList.length > 0 && selectedTeachers.length === 0) {
      setClassError("Please select at least one staff member.");
      hasError = true;
    } else {
      setClassError("");
    }

    if (hasError) return;

    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      const apiUrl = isPublish
        ? `${API_URL}/api/save_staffsavenpublishshortsms`
        : `${API_URL}/api/save_noticeforstaffsms`;

      const response = await axios.post(
        apiUrl,
        {
          department_id: selectedDepartment.value,
          subject: subject.trim(),
          notice_desc: noticeDesc.trim(),
          teacher_id: selectedTeachers,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success(
          isPublish
            ? "Short SMS saved and published successfully!"
            : "Short SMS saved as draft successfully!"
        );
        resetForm();
      } else {
        toast.error("Unexpected server response.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error while saving the Short SMS."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ToastContainer />

      <div className="container mb-4">
        <div className="card-header flex justify-between items-center"></div>
        <div className="w-full mx-auto">
          <div className="container mt-4">
            <div className="card mx-auto lg:w-full shadow-lg">
              <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl">
                  Create Short SMS
                </h3>
              </div>
              <div
                className="relative mb-3 h-1 w-[97%] mx-auto"
                style={{ backgroundColor: "#C03078" }}
              ></div>
              <div className="card-body w-full ml-2">
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <LoaderStyle />
                  </div>
                ) : (
                  <div className="lg:overflow-x-hidden">
                    <div className="card-body w-full ml-2">
                      {/* Common form row style */}
                      <div className="grid grid-cols-[180px_1fr] items-start gap-4 mb-2">
                        <h5 className="text-[1em] text-gray-700">
                          Select Department{" "}
                          <span className="text-red-500">*</span>
                        </h5>
                        <div>
                          <Select
                            value={selectedDepartment}
                            // onChange={handleDepartmentChange}
                            onChange={(value) => {
                              handleDepartmentChange(value);
                              if (value) setDepatmentError("");
                            }}
                            options={departmentOptions}
                            placeholder="Select "
                            isSearchable
                            isClearable
                            className="text-sm w-[40%]"
                          />
                          {depatmentError && (
                            <div className="min-h-[1.25rem]">
                              <p className="text-red-500 text-sm">
                                {depatmentError}
                              </p>
                            </div>
                          )}
                          {!depatmentError && (
                            <div className="min-h-[1.25rem]"></div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-[180px_1fr] items-start gap-4 mb-2">
                        <h5 className="text-[1em] text-gray-700">
                          Select Staff Name{" "}
                          <span className="text-red-500">*</span>
                        </h5>

                        {isTeachersLoading ? (
                          <div className="text-sm text-blue-600">
                            Loading teachers, please wait...
                          </div>
                        ) : selectedDepartment ? (
                          (() => {
                            const teacherList =
                              teachersByDepartment[selectedDepartment.value] ||
                              [];

                            if (teacherList.length === 0) {
                              return (
                                <div className="text-gray-500 text-sm">
                                  No staff found for the selected department.
                                </div>
                              );
                            }

                            return (
                              <div className="flex flex-col gap-2">
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                  {/* Individual Teachers */}
                                  {teacherList.map((teacher) => {
                                    const checkboxId = `teacher-${teacher.teacher_id}`;
                                    return (
                                      <div
                                        key={teacher.teacher_id}
                                        className="flex items-center gap-1 flex-nowrap"
                                        style={{ minWidth: 0 }}
                                      >
                                        <input
                                          type="checkbox"
                                          id={checkboxId}
                                          checked={selectedTeachers.includes(
                                            teacher.teacher_id
                                          )}
                                          onChange={() =>
                                            handleTeacherToggle(
                                              teacher.teacher_id
                                            )
                                          }
                                          className="cursor-pointer flex-shrink-0"
                                        />
                                        <label
                                          htmlFor={checkboxId}
                                          className="text-[.8em] text-gray-900 cursor-pointer select-none whitespace-nowrap overflow-hidden text-ellipsis"
                                          style={{ minWidth: 0 }}
                                        >
                                          {teacher.name}
                                        </label>
                                      </div>
                                    );
                                  })}
                                  {/* Select All */}
                                </div>{" "}
                                <label className="font-medium text-sm cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={
                                      (teachersByDepartment[
                                        selectedDepartment.value
                                      ]?.length || 0) > 0 &&
                                      selectedTeachers.length ===
                                        teachersByDepartment[
                                          selectedDepartment.value
                                        ]?.length
                                    }
                                    onChange={handleSelectAll}
                                    className="mr-2 cursor-pointer"
                                  />
                                  Select All
                                </label>
                                {classError && (
                                  <div className="min-h-[1.25rem]">
                                    <p className="text-red-500 text-sm">
                                      {classError}
                                    </p>
                                  </div>
                                )}
                                {!classError && (
                                  <div className="min-h-[1.25rem]"></div>
                                )}
                              </div>
                            );
                          })()
                        ) : (
                          <div className="text-gray-500 text-sm">
                            Please select a department to view available staff.
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-[180px_1fr] items-start gap-4 ">
                        <h5 className="text-[1em] text-gray-700">
                          Subject <span className="text-red-500">*</span>
                        </h5>
                        <div className="flex flex-col gap-1">
                          <input
                            type="text"
                            className="w-[40%] px-2 py-1 border border-gray-700 rounded-md shadow-md"
                            value={subject}
                            onChange={(e) => {
                              setSubject(e.target.value);
                              if (e.target.value.trim()) setSubjectError("");
                            }}
                          />
                          {subjectError && (
                            <div className="min-h-[1.25rem]">
                              <p className="text-red-500 text-sm">
                                {subjectError}
                              </p>
                            </div>
                          )}
                          {!subjectError && (
                            <div className="min-h-[1.25rem]"></div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-[180px_1fr] items-start gap-4 mb-3">
                        <h5 className="text-[1em] text-gray-700 mt-4">
                          Description <span className="text-red-500">*</span>
                        </h5>
                        <div className="flex flex-col">
                          <p className="font-light relative top-3">
                            Dear Staff,
                          </p>
                          <textarea
                            className="px-2 border border-gray-700 rounded-md shadow-md"
                            rows="3"
                            value={noticeDesc}
                            onChange={(e) => {
                              setNoticeDesc(e.target.value);
                              if (e.target.value.trim()) setNoticeDescError("");
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const cursorPos = e.target.selectionStart;
                                const textBeforeCursor = noticeDesc.slice(
                                  0,
                                  cursorPos
                                );
                                const textAfterCursor =
                                  noticeDesc.slice(cursorPos);
                                const updatedText = `${textBeforeCursor}\n• ${textAfterCursor}`;
                                setNoticeDesc(updatedText);
                                setTimeout(() => {
                                  e.target.selectionStart =
                                    e.target.selectionEnd = cursorPos + 3;
                                }, 0);
                              }
                            }}
                          />
                          {noticeDescError && (
                            <div className="min-h-[1.25rem]">
                              <p className="text-red-500 text-sm">
                                {noticeDescError}
                              </p>
                            </div>
                          )}
                          {!noticeDescError && (
                            <div className="min-h-[1.25rem]"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {!loading && (
                <div className="flex space-x-2 justify-end m-4">
                  <button
                    onClick={() => handleSubmit(false)}
                    className="btn btn-primary"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => handleSubmit(true)}
                    className="btn btn-primary"
                  >
                    Save & Publish
                  </button>
                  <button
                    onClick={resetForm}
                    className="btn btn-danger bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateShortSMS;
