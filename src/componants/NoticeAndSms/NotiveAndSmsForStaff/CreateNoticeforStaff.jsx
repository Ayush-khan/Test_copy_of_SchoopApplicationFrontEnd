import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import LoaderStyle from "../../componants/common/LoaderFinal/LoaderStyle";
import LoaderStyle from "../../common/LoaderFinal/LoaderStyle";
import Select from "react-select";
import "bootstrap/dist/css/bootstrap.min.css";
import { RxCross1 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
const CreateShortSMS = () => {
  const API_URL = import.meta.env.VITE_API_URL; // URL for host
  const [loading, setLoading] = useState(false); // Loader state
  const [divisionError, setDivisionError] = useState("");
  const [allClasses, setAllClasses] = useState([]);
  const [subject, setSubject] = useState("");
  const [noticeDesc, setNoticeDesc] = useState("");
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [subjectError, setSubjectError] = useState("");
  const [noticeDescError, setNoticeDescError] = useState("");
  const [classError, setClassError] = useState("");
  const navigate = useNavigate();

  const [depatmentError, setDepatmentError] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const [allDepartments, setAllDepartments] = useState([]); // API list
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [teachersByDepartment, setTeachersByDepartment] = useState({});
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [isTeachersLoading, setIsTeachersLoading] = useState(false);

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
  const departmentOptions = allDepartments.map((dept) => ({
    label: dept.name,
    value: dept.department_id,
  }));
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
    setSelectedClasses([]);
    setUploadedFiles([]);
    setSubjectError("");
    setNoticeDescError("");
    setClassError("");
    setSelectedDepartment(null);
    setSelectedTeachers([]);
    setTeachersByDepartment([]);
    setSelectedDepartment([]);
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setUploadedFiles((prevFiles) => [...prevFiles, ...files]);
  };

  const removeFile = (index) => {
    setUploadedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };
  // Handle form submission
  // const handleSubmit = async (isPublish = false) => {
  //   let hasError = false;
  //   if (!subject.trim()) {
  //     setSubjectError("Subject is required.");
  //     hasError = true;
  //   } else {
  //     setSubjectError("");
  //   }
  //   // Validate Description
  //   if (!noticeDesc.trim()) {
  //     setNoticeDescError("SMS description is required.");
  //     hasError = true;
  //   } else {
  //     setNoticeDescError("");
  //   }
  //   // Validate Department
  //   if (!selectedDepartment) {
  //     setDepatmentError("Please select a department.");
  //     hasError = true;
  //   } else {
  //     setDepatmentError("");
  //   }
  //   // Validate Teacher Selection
  //   const teacherList = teachersByDepartment[selectedDepartment?.value] || [];
  //   if (teacherList.length > 0 && selectedTeachers.length === 0) {
  //     setClassError("Please select at least one staff member.");
  //     hasError = true;
  //   } else {
  //     setClassError("");
  //   }
  //   if (hasError) return;

  //   const formData = new FormData();
  //   formData.append("subject", subject);
  //   formData.append("notice_desc", noticeDesc);
  //   selectedClasses.forEach((classId) =>
  //     formData.append("checkbxevent[]", classId)
  //   );
  //   uploadedFiles.forEach((file) => formData.append("userfile[]", file));
  //   const apiEndpoint = isPublish
  //     ? "save_staffsavenpublishnotice"
  //     : "save_staffsavenotice";
  //   setLoading(true); // Start loader
  //   try {
  //     const token = localStorage.getItem("authToken");
  //     if (!token) throw new Error("No authentication token found");
  //     const response = await axios.post(
  //       `${API_URL}/api/${apiEndpoint}`,
  //       {
  //         subject,
  //         notice_desc: noticeDesc,
  //         checkbxevent: selectedClasses,
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );
  //     if (response.status === 200) {
  //       toast.success(
  //         isPublish
  //           ? "Notice saved and published!"
  //           : "Notice saved successfully!"
  //       );
  //       resetForm();
  //     } else {
  //       toast.error("Unexpected server response.");
  //     }
  //   } catch (error) {
  //     toast.error(
  //       error.response?.data?.message || "Error while saving the notice."
  //     );
  //   } finally {
  //     setLoading(false); // Stop loader
  //   }
  // };
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
      setNoticeDescError("Notice description is required.");
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

    const formData = new FormData();
    formData.append("department_id", selectedDepartment.value); // assuming it's an object
    formData.append("subject", subject);
    formData.append("notice_desc", noticeDesc);

    selectedTeachers.forEach((id) =>
      formData.append("teacher_checkboxname[]", id)
    );

    uploadedFiles.forEach((file) => formData.append("userfile[]", file));

    const apiEndpoint = isPublish
      ? "save_staffsavenpublishnotice"
      : "save_staffsavenotice";

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      const response = await axios.post(
        `${API_URL}/api/${apiEndpoint}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        toast.success(
          isPublish
            ? "Notice saved and published successfully!"
            : "Notice saved successfully!"
        );
        resetForm();
      } else {
        toast.error("Unexpected server response.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error while saving the notice."
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
                  Create Notice
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
                          <p className="font-light relative top-3"></p>
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
                      {/* File Upload */}
                      <div className="w-full relative -top-5   flex flex-row justify-start gap-x-4 space-x-2 md:space-x-20 ">
                        <h5 className="px-2  lg:px-3 py-2 text-[1em] text-nowrap text-gray-700">
                          Upload Files
                        </h5>
                        <input
                          className="mt-3 text-xs "
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                        />{" "}
                        <span className="relative right-[7%] top-5 text-pink-500 text-[.7em]">
                          (Each file must not exceed a maximum size of 2MB)
                        </span>
                      </div>
                      <h5 className="relative -top-4 text-[1em] text-gray-700 px-2">
                        Attachment:
                      </h5>
                      <div className="  -top-10 w-full md:w-[57%] mx-auto relative right-0 md:left-4">
                        <div className=" text-xs flex flex-col">
                          {uploadedFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2 space-y-3"
                            >
                              <span className="bg-gray-100 border-1 p-0.5 shadow-sm">
                                {file.name}
                              </span>
                              <RxCross1
                                className="text-xl relative -top-1 w-4 h-4 text-red-600 hover:cursor-pointer hover:bg-red-100"
                                type="button"
                                onClick={() => removeFile(index)}
                              />
                            </div>
                          ))}
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
