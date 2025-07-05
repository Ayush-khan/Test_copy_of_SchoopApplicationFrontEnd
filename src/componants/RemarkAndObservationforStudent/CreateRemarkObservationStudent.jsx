import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
// import LoaderStyle from "../../common/LoaderFinal/LoaderStyle";
import LoaderStyle from "../common/LoaderFinal/LoaderStyle";
import Select from "react-select";

const CreateRemarkObservationStudent = () => {
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

  const [sectionIdForStudentList, setSectionIdForStudentList] = useState(null);

  const [selectedStudents, setSelectedStudents] = useState([]);

  const [isObservation, setIsObservation] = useState(false);

  const [selectedClass, setSelectedClass] = useState(null);
  const [loadingClasses, setLoadingClasses] = useState(false);

  const [remarkDescription, setRemarkDescription] = useState("");
  const [remarkSubject, setRemarkSubject] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);

  const handleObservationToggle = (e) => {
    setIsObservation(e.target.checked);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (classId && sectionId) {
      fetchSubjects(classId, sectionId);
    }
  }, [classId, sectionId]);

  const fetchStudents = async () => {
    try {
      setLoadingClasses(true);

      const token = localStorage.getItem("authToken");

      const classResponse = await axios.get(
        `${API_URL}/api/getStudentListBySectionData`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Student Data", classResponse.data);
      setAllClasses(classResponse.data?.data || []);
    } catch (error) {
      toast.error("Error fetching data.");
    } finally {
      setLoadingClasses(false);
    }
  };

  const studentOptions = useMemo(() => {
    return Array.isArray(allClasses)
      ? allClasses.map((cls) => ({
          value: cls.student_id,
          label: `${cls?.first_name} ${cls.mid_name || ""} (${cls.last_name})`,
          class_id: cls.class_id,
          section_id: cls.section_id,
        }))
      : [];
  }, [allClasses]);

  const subjectOptions = useMemo(() => {
    return (subjects || []).map((subj) => ({
      value: subj.sm_id,
      label: subj.name,
    }));
  }, [subjects]);

  const handleSubjectChange = (selectedOption) => {
    setSelectedSubject(selectedOption);

    if (selectedOption) {
      setErrors((prev) => ({ ...prev, subjectError: "" }));
    }
  };

  const fetchSubjects = async (classId, sectionId) => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/get_subjectbyclasssection/${classId}/${sectionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSubjects(response.data.data);
      } else {
        toast.error("Failed to load subjects.");
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast.error("Error fetching subjects.");
    }
  };

  const handleClassSelect = (selectedOption) => {
    setSelectedClass(selectedOption);

    console.log("Selected Student ID:", selectedOption?.value);
    console.log("Class ID:", selectedOption?.class_id);
    console.log("Section ID:", selectedOption?.section_id);

    // Call the fetchSubjects API with class_id and section_id
    if (selectedOption?.class_id && selectedOption?.section_id) {
      fetchSubjects(selectedOption.class_id, selectedOption.section_id);
    }

    if (errors.classError) {
      setErrors((prev) => ({ ...prev, classError: "" }));
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
      newErrors.classError = "Please select a Student.";
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

    if (!validateForm()) return;

    if (publish) setIsPublishing(true);
    else setIsSubmitting(true);

    const formData = new FormData();

    formData.append("save_publish", publish ? "Y" : "N");

    if (isObservation) {
      formData.append("observation", "yes");
    }

    formData.append("remark_desc", remarkDescription || "");
    formData.append("remark_subject", remarkSubject || "");

    const selectedStudents = allClasses.find(
      (stu) => stu.student_id === selectedClass.value
    );

    console.log("selectedClass", selectedStudents);
    if (!selectedStudents) {
      toast.error("Please select a valid student.");
      return;
    }

    formData.append("student_id[]", selectedStudents.student_id);
    formData.append("class_id", selectedStudents.class_id);
    formData.append("section_id", selectedStudents.section_id);

    formData.append("subject_id", selectedSubject?.value || "0");

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
        <div className="w-[80%] mx-auto">
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
                        <label className="w-[28%] text-[1em] text-gray-700">
                          Select Student <span className="text-red-500">*</span>
                        </label>
                        <div className="flex-1">
                          <Select
                            key={selectedClass ? selectedClass.value : "reset"}
                            options={studentOptions}
                            value={studentOptions.find(
                              (option) => option.value === selectedClass?.value
                            )}
                            onChange={handleClassSelect}
                            className="w-[60%]"
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

                      {/* Subject Selection */}
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                        <label className="w-[28%] text-[1em] text-gray-700">
                          Subject
                        </label>
                        <div className="flex-1">
                          <Select
                            options={subjectOptions}
                            value={selectedSubject}
                            onChange={handleSubjectChange}
                            className="w-[60%]"
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
                        <label className="w-[28%] text-[1em] text-gray-700">
                          Subject of Remark{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="flex-1">
                          <input
                            type="text"
                            className="w-[60%] px-2 py-2 border border-gray-700 rounded-md shadow-md"
                            value={remarkSubject}
                            onChange={handleRemarkSubjectChange}
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
                        <label className="w-[28%] text-[1em] text-gray-700">
                          Remark <span className="text-red-500">*</span>
                        </label>
                        <div className="flex-1">
                          <textarea
                            rows="3"
                            className="w-[60%] px-2 py-1 border border-gray-700 rounded-md shadow-md"
                            value={remarkDescription}
                            onChange={handleRemarkDescriptionChange}
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
                          <label className="w-[28%] text-[1em] text-gray-700 pt-2">
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

export default CreateRemarkObservationStudent;
