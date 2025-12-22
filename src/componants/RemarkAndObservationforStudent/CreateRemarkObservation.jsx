import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import LoaderStyle from "../common/LoaderFinal/LoaderStyle";

import Select from "react-select";

const CreateRemarkObservation = ({ onSaveSuccess }) => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [allClasses, setAllClasses] = useState([]);
  const [loading, setLoading] = useState(false); // Loader state
  const [errors, setErrors] = useState({
    subjectError: "",
    noticeDescError: "",
    classError: "",
  });

  const [subjects, setSubjects] = useState([]);
  const [classIdForSubjectAPI, setClassIdForSubjectAPI] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [sectionIdForStudentList, setSectionIdForStudentList] = useState(null);
  const [students, setStudents] = useState([]);
  const [isStudentsLoading, setIsStudentsLoading] = useState(false);
  const [studentError, setStudentError] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);

  const [isObservation, setIsObservation] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loadingClasses, setLoadingClasses] = useState(false);

  const [remarkDescription, setRemarkDescription] = useState("");
  const [remarkSubject, setRemarkSubject] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [roleId, setRoleId] = useState("");
  const [roleIdValue, setRoleIdValue] = useState("");

  const handleObservationToggle = (e) => {
    setIsObservation(e.target.checked);
  };

  const fetchDataRoleId = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      // console.error("No authentication token found");
      return {};
    }

    try {
      const sessionResponse = await axios.get(`${API_URL}/api/sessionData`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const roleId = sessionResponse?.data?.user?.role_id;
      const regId = sessionResponse?.data?.user?.reg_id;

      setRoleId(roleId); // optional for global use
      setRoleIdValue(regId); // optional for global use

      return { roleId, roleIdValue: regId }; // ✅ return both
    } catch (error) {
      // console.error("Error fetching role data:", error);
      return {};
    }
  };
  // useEffect(() => {
  //   fetchClasses();
  // }, []);

  useEffect(() => {
    const fetchData = async () => {
      const { roleId, roleIdValue } = await fetchDataRoleId(); // 🔁 returns both values
      await fetchClasses(roleId, roleIdValue); // ✅ pass them as args
    };

    fetchData();
  }, []);

  // useEffect(() => {
  //   if (classIdForSubjectAPI) {
  //     fetchSubjects(classIdForSubjectAPI);
  //   }
  // }, [classIdForSubjectAPI]);

  // working before the  19-12- 2025
  useEffect(() => {
    if (classIdForSubjectAPI && sectionIdForStudentList) {
      fetchSubjects(classIdForSubjectAPI, sectionIdForStudentList);
    }
  }, [classIdForSubjectAPI, sectionIdForStudentList]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!sectionIdForStudentList) return;
      setIsStudentsLoading(true);

      try {
        const token = localStorage.getItem("authToken");
        const res = await axios.get(
          `${API_URL}/api/getStudentListBySectionData?section_id=${sectionIdForStudentList}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
          setStudents(res.data.data);
        } else {
          setStudents([]);
          setStudentError("No students found.");
        }
      } catch (err) {
        console.error(err);
        setStudentError("Error fetching students.");
      } finally {
        setIsStudentsLoading(false);
      }
    };

    fetchStudents();
  }, [sectionIdForStudentList]);

  const fetchSubjects = async (classId, sectionId) => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/get_subjectbyclasssection/${classId}/${sectionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Handle the subject data here
      console.log("Subjects:", response.data);
      setSubjects(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch subjects", error);
      // toast.error("Failed to fetch subjects.");
    }
  };

  const fetchClasses = async (roleId, roleIdValue) => {
    try {
      setLoadingClasses(true);
      setLoadingStudents(true);

      const token = localStorage.getItem("authToken");

      const classApiUrl =
        roleId === "T"
          ? `${API_URL}/api/get_teacherclasseswithclassteacher?teacher_id=${roleIdValue}`
          : `${API_URL}/api/getallClassWithStudentCount`;

      const [classResponse] = await Promise.all([
        axios.get(classApiUrl, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const classData =
        roleId === "T"
          ? classResponse.data.data || []
          : classResponse.data || [];

      setAllClasses(classData);
    } catch (error) {
      toast.error("Error fetching data.");
    } finally {
      setLoadingClasses(false);
      setLoadingStudents(false);
    }
  };

  const classOptions = useMemo(() => {
    return allClasses.map((cls) => {
      if (roleId === "T") {
        return {
          value: cls.section_id,
          label: `${cls.classname} ${cls.sectionname}`,
          class_id: cls.class_id,
          section_id: cls.section_id,
        };
      } else {
        return {
          value: cls.section_id,
          label: `${cls?.get_class?.name} ${cls.name} (${cls.students_count})`,
          class_id: cls.class_id,
          section_id: cls.section_id,
        };
      }
    });
  }, [allClasses, roleId]);

  // const fetchClasses = async () => {
  //   try {
  //     setLoadingClasses(true);
  //     setLoadingStudents(true);

  //     const token = localStorage.getItem("authToken");

  //     const classResponse = await axios.get(
  //       `${API_URL}/api/getallClassWithStudentCount`,
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       }
  //     );

  //     console.log("Class Data", classResponse.data);
  //     setAllClasses(classResponse.data || []);
  //   } catch (error) {
  //     toast.error("Error fetching data.");
  //   } finally {
  //     setLoadingClasses(false);
  //     setLoadingStudents(false);
  //   }
  // };

  // const classOptions = useMemo(() => {
  //   return allClasses.map((cls) => ({
  //     value: cls.section_id,
  //     label: `${cls?.get_class?.name} ${cls.name} (${cls.students_count})`,
  //   }));
  // }, [allClasses]);

  const subjectOptions = useMemo(() => {
    return (subjects || []).map((subj) => ({
      value: subj.sm_id,
      label: subj.name,
    }));
  }, [subjects]);

  const handleSubjectChange = (selectedOption) => {
    setSelectedSubject(selectedOption);

    // Clear any previous error if subject is selected
    if (selectedOption) {
      setErrors((prev) => ({ ...prev, subjectError: "" }));
    }
  };

  // const handleClassSelect = (selectedOption) => {
  //   setSelectedClass(selectedOption);
  //   setSelectedStudent(null);
  //   setSelectedStudentId(null);

  //   if (errors.classError) {
  //     setErrors((prev) => ({ ...prev, classError: "" }));
  //   }

  //   const sectionId = selectedOption?.value;
  //   if (!sectionId) return;

  //   setSectionIdForStudentList(sectionId);

  //   const fullClassObj = allClasses.find((cls) => cls.section_id === sectionId);
  //   const classId = fullClassObj?.get_class?.class_id;

  //   if (classId) {
  //     setClassIdForSubjectAPI(classId);
  //     // Fetch subjects directly here after both values are available
  //     fetchSubjects(classId, sectionId);
  //   }
  // };

  const handleClassSelect = (selectedOption) => {
    setSelectedClass(selectedOption);
    setSelectedStudent(null);
    setSelectedStudentId(null);

    if (errors.classError) {
      setErrors((prev) => ({ ...prev, classError: "" }));
    }

    if (!selectedOption) return;

    setSectionIdForStudentList(selectedOption.section_id);
    setClassIdForSubjectAPI(selectedOption.class_id);
  };

  const handleStudentToggle = (studentId) => {
    setSelectedStudents((prev) => {
      const updated = prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId];

      // Clear student error if at least one selected
      if (updated.length > 0 && errors.studentError) {
        setErrors((prev) => ({ ...prev, studentError: "" }));
      }

      return updated;
    });
  };

  const handleSelectAllStudents = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map((s) => s.student_id));
    }
  };

  const handleRemarkSubjectChange = (e) => {
    setRemarkSubject(e.target.value);
    if (errors.remarkSubjectError) {
      setErrors((prev) => ({ ...prev, remarkSubjectError: "" }));
    }
  };

  const handleRemarkDescriptionChange = (e) => {
    setRemarkDescription(e.target.value);
    if (errors.remarkDescriptionError) {
      setErrors((prev) => ({ ...prev, remarkDescriptionError: "" }));
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter((file) => file.size <= 2 * 1024 * 1024); // 2MB

    if (validFiles.length < files.length) {
      toast.error("Some files exceed the 2MB limit and were not added.");
    }

    setAttachedFiles((prevFiles) => [...prevFiles, ...validFiles]);
  };

  const handleRemoveFile = (indexToRemove) => {
    setAttachedFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove)
    );
  };

  const resetForm = () => {
    setSelectedClass(null);
    setSelectedSubject(null);
    setSelectedStudents([]);
    setRemarkSubject("");
    setRemarkDescription("");
    setAttachedFiles([]);
    setIsObservation(false);
    setErrors({});

    // Optional: reset classId and sectionId derived from selectedClass
    setClassIdForSubjectAPI("");
    setSectionIdForStudentList("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedClass) {
      newErrors.classError = "Please select a class.";
    }

    if (!selectedStudents || selectedStudents.length === 0) {
      newErrors.studentError = "Please select at least one student.";
    }

    if (!remarkSubject.trim()) {
      newErrors.remarkSubjectError = "Remark subject is required.";
    }

    if (!remarkDescription.trim()) {
      newErrors.remarkDescriptionError = "Remark description is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // true if no errors
  };

  const handleSubmit = async (e, publish = false) => {
    e.preventDefault();

    if (!validateForm()) {
      return; // stop if validation fails
    }

    if (publish) {
      setIsPublishing(true);
    } else {
      setIsSubmitting(true);
    }

    const formData = new FormData();

    formData.append("save_publish", publish ? "Y" : "N");

    if (isObservation) {
      formData.append("observation", "yes");
    }

    formData.append("remark_desc", remarkDescription || "");
    formData.append("remark_subject", remarkSubject || "");

    const sectionId = selectedClass?.value || "";
    formData.append("section_id", sectionId);

    const fullClassObj = allClasses.find((cls) => cls.section_id === sectionId);
    const classId = fullClassObj?.get_class?.class_id || "";
    formData.append("class_id", classId);

    formData.append("subject_id", selectedSubject?.value || "0");

    selectedStudents.forEach((studentId) => {
      formData.append("student_id[]", studentId);
    });

    attachedFiles.forEach((file) => {
      formData.append("userfile[]", file);
    });

    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.post(
        `${API_URL}/api/save_remarkobservationforstudents`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success(
          publish
            ? "Remark Saved & published successfully!"
            : "Remark saved successfully!"
        );
        resetForm();
        if (onSaveSuccess) {
          onSaveSuccess();
        }
      } else {
        toast.error("Failed to save remark.");
      }
    } catch (error) {
      console.error("Error submitting remark:", error);
      toast.error("Something went wrong while saving.");
    } finally {
      setIsSubmitting(false);
      setIsPublishing(false);
    }
  };

  return (
    <div>
      <ToastContainer />
      <div className="container mb-4">
        <div className="card-header flex justify-between items-center"></div>
        <div className="w-[95%] mx-auto">
          <div className="container mt-4">
            <div className="card mx-auto lg:w-full shadow-lg">
              <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl">
                  Create Remark & Observation
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
                  <div className="card-body w-full ml-2">
                    <div className="space-y-4 mr-10">
                      {/* Class Selection */}
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                        <label className="w-[19%] text-[1em] text-gray-700">
                          Select Class <span className="text-red-500">*</span>
                        </label>
                        <div className="flex-1">
                          <Select
                            key={selectedClass ? selectedClass.value : "reset"}
                            options={classOptions}
                            value={classOptions.find(
                              (option) => option.value === selectedClass?.value
                            )}
                            onChange={handleClassSelect}
                            className="w-[40%]"
                            placeholder="Select"
                            isClearable
                          />
                          {errors.classError && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.classError}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-[180px_1fr] items-start gap-4 mb-2">
                        <label className="text-[1em] text-gray-700">
                          Select Student <span className="text-red-500">*</span>
                        </label>

                        {isStudentsLoading ? (
                          <div className="text-sm text-blue-600">
                            Loading students, please wait...
                          </div>
                        ) : selectedClass ? (
                          students.length === 0 ? (
                            <div className="text-gray-500 text-sm">
                              No students found for the selected class.
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2">
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                {students.map((student) => {
                                  const checkboxId = `student-${student.student_id}`;
                                  return (
                                    <div
                                      key={student.student_id}
                                      className="flex items-center gap-1 flex-nowrap"
                                      style={{ minWidth: 0 }}
                                    >
                                      <input
                                        type="checkbox"
                                        id={checkboxId}
                                        checked={selectedStudents.includes(
                                          student.student_id
                                        )}
                                        onChange={() =>
                                          handleStudentToggle(
                                            student.student_id
                                          )
                                        }
                                        className="cursor-pointer flex-shrink-0"
                                      />
                                      <label
                                        htmlFor={checkboxId}
                                        className="text-[.8em] text-gray-900 cursor-pointer select-none whitespace-nowrap overflow-hidden text-ellipsis"
                                        style={{ minWidth: 0 }}
                                      >
                                        {student.first_name} {student.mid_name}{" "}
                                        {student.last_name}
                                      </label>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Select All */}
                              <label className="font-medium text-sm cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={
                                    students.length > 0 &&
                                    selectedStudents.length === students.length
                                  }
                                  onChange={handleSelectAllStudents}
                                  className="mr-2 cursor-pointer"
                                />
                                Select All
                              </label>

                              {/* Error message for validation */}
                              {errors.studentError && (
                                <p className="text-red-500 text-sm mt-1">
                                  {errors.studentError}
                                </p>
                              )}
                            </div>
                          )
                        ) : (
                          <div className="text-gray-500 text-sm">
                            Please select a class to view students.
                          </div>
                        )}
                      </div>

                      {/* Subject Selection */}
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                        <label className="w-[19%] text-[1em] text-gray-700">
                          Subject
                        </label>
                        <div className="flex-1">
                          <Select
                            options={subjectOptions}
                            value={selectedSubject}
                            onChange={handleSubjectChange}
                            className="w-[40%]"
                            placeholder="Select"
                            isClearable
                          />
                          {errors.subjectError && (
                            <p className="text-red-500 mt-1">
                              {errors.subjectError}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Subject of Remark */}
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                        <label className="w-[19%] text-[1em] text-gray-700">
                          Subject of Remark{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="flex-1">
                          <input
                            type="text"
                            className="w-[40%] px-2 py-2 border border-gray-700 rounded-md shadow-md"
                            value={remarkSubject}
                            onChange={handleRemarkSubjectChange}
                            maxLength={100}
                          />
                          {errors.remarkSubjectError && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.remarkSubjectError}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Remark */}
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                        <label className="w-[19%] text-[1em] text-gray-700">
                          Remark <span className="text-red-500">*</span>
                        </label>
                        <div className="flex-1">
                          <textarea
                            rows="3"
                            className="w-[40%] px-2 py-1 border border-gray-700 rounded-md shadow-md"
                            value={remarkDescription}
                            onChange={handleRemarkDescriptionChange}
                            maxLength={350}
                          />
                          {errors.remarkDescriptionError && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.remarkDescriptionError}
                            </p>
                          )}

                          {/* Observation just below input field */}
                          <div className="mt-2">
                            <label className="inline-flex flex-col text-sm text-gray-700">
                              <span className="flex items-center">
                                <input
                                  type="checkbox"
                                  className="mr-2"
                                  checked={isObservation}
                                  onChange={handleObservationToggle}
                                />
                                Observation
                              </span>
                              <span className="text-xs text-gray-500 ml-6">
                                (Observation will not be shown to parents!)
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* File Upload */}
                      {!isObservation && (
                        <div className="flex flex-col md:flex-row items-start md:items-start gap-3">
                          {/* Label on the left */}
                          <label className="w-[18%] text-[1em] text-gray-700 pt-2">
                            Attachment
                          </label>

                          {/* Input and file list on the right */}
                          <div className="flex-1 space-y-2">
                            <input
                              type="file"
                              multiple
                              onChange={handleFileUpload}
                              className="text-sm"
                            />
                            <p className="text-pink-500 text-xs">
                              (Each file must not exceed a maximum size of 2MB)
                            </p>

                            {/* Boxed file list */}
                            {attachedFiles.length > 0 && (
                              <div className="border border-gray-300 bg-gray-50 rounded p-3 text-sm text-gray-700">
                                <ul className="space-y-1">
                                  {attachedFiles.map((file, index) => (
                                    <li
                                      key={index}
                                      className="flex items-center justify-between hover:bg-gray-100 px-2 py-1 rounded"
                                    >
                                      <span>
                                        {file.name} (
                                        {(file.size / 1024).toFixed(1)} KB)
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveFile(index)}
                                        className="text-red-500 hover:text-red-700 ml-3"
                                        title="Remove file"
                                      >
                                        <i className="fas fa-times-circle"></i>
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={(e) => handleSubmit(e, false)}>
                {!loading && (
                  <div className="flex space-x-2 justify-end mb-2 mr-2">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : "Save"}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleSubmit(e, true)}
                      className="btn btn-primary"
                      disabled={isPublishing || isObservation}
                    >
                      {isPublishing ? "Saving & Publishing" : "Save & Publish"}
                    </button>

                    <button
                      type="button"
                      onClick={resetForm}
                      className="btn btn-danger bg-gray-500 text-white rounded-md hover:bg-gray-600"
                      disabled={isSubmitting}
                    >
                      Reset
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRemarkObservation;
