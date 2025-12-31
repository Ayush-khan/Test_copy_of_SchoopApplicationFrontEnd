import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";

import LoaderStyle from "../../componants/common/LoaderFinal/LoaderStyle";
import Select from "react-select";

const CreateHomework = ({ handleSearch, onSaveSuccess }) => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [allClasses, setAllClasses] = useState([]);

  const [loading, setLoading] = useState(false); // Loader state

  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];

  const fileInputRef = useRef(null);

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
  const [submissionDate, setSubmissionDate] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);

  const [roleId, setRoleId] = useState("");
  const [regId, setRegId] = useState("");
  const [academicYr, setAcademicYr] = useState("");
  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);

  useEffect(() => {
    fetchDataRoleId();
  }, []);

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
      const academic_yr = sessionResponse.data.custom_claims.academic_year;

      setRoleId(role_id);
      setRegId(reg_id);
      setAcademicYr(academic_yr);

      console.log("roleIDis:", role_id); // use local variable
      console.log("reg id:", reg_id);

      return { roleId, regId };
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (!roleId || !regId) return; // guard against empty
    fetchStudents(roleId, regId);
  }, [roleId, regId]);

  const fetchStudents = async (roleId, roleIdValue) => {
    try {
      setLoadingClasses(true);

      const token = localStorage.getItem("authToken");

      const classApiUrl =
        roleId === "T"
          ? `${API_URL}/api/get_teacherclasseswithclassteacher?teacher_id=${roleIdValue}`
          : `${API_URL}/api/getallClassWithStudentCount`;

      const [classResponse, studentResponse] = await Promise.all([
        axios.get(classApiUrl, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/getStudentListBySectionData`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const classData =
        roleId === "T"
          ? classResponse.data.data || []
          : classResponse.data || [];

      setAllClasses(classData);
      console.log(classData);
      setStudentNameWithClassId(studentResponse?.data?.data || []);
    } catch (error) {
      toast.error("Error fetching data.");
    } finally {
      setLoadingClasses(false);
    }
  };

  const studentOptions = useMemo(() => {
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

  const subjectOptions = useMemo(() => {
    return (subjects || []).map((subj) => ({
      value: subj.sm_id,
      label: subj.name,
    }));
  }, [subjects]);

  const fetchSubjects = async (classId, sectionId) => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/get_subject_alloted_to_teacher_by_class/${classId}/${sectionId}`,
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

  const handleSubjectChange = (selectedOption) => {
    setSelectedSubject(selectedOption);

    if (selectedOption) {
      setErrors((prev) => ({ ...prev, subjectError: "" }));
    }
  };

  const handleClassSelect = (selectedOption) => {
    setSelectedClass(selectedOption);

    if (selectedOption?.class_id && selectedOption?.section_id) {
      fetchSubjects(selectedOption.class_id, selectedOption.section_id);
    }

    if (errors.classError) {
      setErrors((prev) => ({ ...prev, classError: "" }));
    }
  };

  const handleDateChange = (e) => {
    setSubmissionDate(e.target.value);
    if (errors.submissionError) {
      setErrors((prev) => ({ ...prev, submissionError: "" }));
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
    setSubmissionDate("");

    // Optional: reset classId and sectionId derived from selectedClass
    setClassIdForSubjectAPI("");
    setSectionIdForStudentList("");
    if (fileInputRef.current) {
      fileInputRef.current.value = null; // resets the input
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (
      !selectedClass ||
      !selectedClass.class_id ||
      !selectedClass.section_id
    ) {
      newErrors.classError = "Please select a class.";
    }

    if (!selectedSubject) {
      newErrors.subjectError = "Please select a subject.";
    }

    if (!submissionDate) {
      newErrors.submissionError = "Please select a submission date.";
    }

    if (!remarkDescription.trim()) {
      newErrors.remarkDescriptionError =
        "Please enter the homework description.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validateForm()) return;

    setIsSubmitting(true);

    const token = localStorage.getItem("authToken");
    const randomNo = Math.floor(Math.random() * 100000);
    const uploadDate = submissionDate;

    // MUST be array (even for one file)
    const savedFilenames = [];

    try {
      /* 🔹 STEP 1: Upload files ONE BY ONE */
      for (const file of attachedFiles) {
        // convert file -> base64
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            const result = reader.result;
            resolve(result.split(",")[1]);
          };
          reader.onerror = reject;
        });

        const uploadForm = new FormData();
        uploadForm.append("random_no", randomNo);
        uploadForm.append("doc_type_folder", "homework");
        uploadForm.append("filename", file.name); // original filename
        uploadForm.append("datafile", base64);
        uploadForm.append("upload_date", formattedDate);

        const uploadResp = await axios.post(
          `${API_URL}/api/upload_files`,
          uploadForm,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (uploadResp?.data?.status === true) {
          // Use filename returned by backend (important)
          const savedName =
            uploadResp.data.saved_filename ||
            uploadResp.data.filename ||
            file.name;

          savedFilenames.push(savedName);
        } else {
          toast.error(`Upload failed for ${file.name}`);
          throw new Error("File upload failed");
        }
      }

      /* 🔹 STEP 2: Create homework (send filename as JSON array string) */
      const homeworkForm = new FormData();
      homeworkForm.append("login_type", "T");
      homeworkForm.append("operation", "create");
      homeworkForm.append("random_no", randomNo);
      homeworkForm.append("class_id", selectedClass?.class_id);
      homeworkForm.append("section_id", selectedClass?.section_id);
      homeworkForm.append("teacher_id", regId);
      homeworkForm.append("sm_id", selectedSubject?.value);
      homeworkForm.append("academic_yr", academicYr);
      homeworkForm.append("start_date", formattedDate);
      homeworkForm.append("end_date", submissionDate);
      homeworkForm.append("description", remarkDescription);

      // ✅ ONLY ONE filename field
      // ✅ Always JSON array string
      homeworkForm.append("filename", JSON.stringify(savedFilenames));

      const hwResp = await axios.post(`${API_URL}/api/homework`, homeworkForm, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (hwResp?.data?.status === true) {
        toast.success("Homework created successfully!");
        resetForm();

        setTimeout(() => {
          onSaveSuccess && onSaveSuccess();
          handleSearch();
        }, 500);
      } else {
        toast.error(hwResp.data.message || "Failed to create homework");
      }
    } catch (error) {
      console.error("handleSubmit error:", error);
      toast.error("Something went wrong while saving homework.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (isSubmitting) return;
  //   if (!validateForm()) return;

  //   setIsSubmitting(true);
  //   const token = localStorage.getItem("authToken");
  //   const randomNo = Math.floor(Math.random() * 100000);
  //   const uploadDate = submissionDate;
  //   const savedFilenames = []; // filenames returned by server

  //   try {
  //     // 1) Upload each file individually (sequentially)
  //     for (const file of attachedFiles) {
  //       // convert file -> base64 (string without data:* prefix)
  //       const base64 = await new Promise((resolve, reject) => {
  //         const reader = new FileReader();
  //         reader.readAsDataURL(file);
  //         reader.onload = () => {
  //           const result = reader.result;
  //           const idx = result.indexOf(",");
  //           resolve(idx > -1 ? result.slice(idx + 1) : result);
  //         };
  //         reader.onerror = reject;
  //       });

  //       const uploadForm = new FormData();
  //       uploadForm.append("random_no", randomNo);
  //       uploadForm.append("doc_type_folder", "homework");
  //       uploadForm.append("filename", file.name); // original name (optional)
  //       uploadForm.append("datafile", base64); // base64 string
  //       uploadForm.append("upload_date", uploadDate);

  //       // call upload_files once PER file
  //       const uploadResp = await axios.post(
  //         `${API_URL}/api/upload_files`,
  //         uploadForm,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //             // NO special content-type required; browser will set multipart/form-data
  //           },
  //         }
  //       );

  //       // Expect server to return final saved filename (or at least status)
  //       if (uploadResp?.data?.status === true) {
  //         // Use server-provided filename if available (recommended)
  //         const savedName =
  //           uploadResp.data.saved_filename ||
  //           uploadResp.data.filename ||
  //           file.name;
  //         savedFilenames.push(savedName);
  //       } else {
  //         // upload failed for this file — decide: abort or continue?
  //         console.error("Upload failed for", file.name, uploadResp.data);
  //         toast.error(`Upload failed for ${file.name}`);
  //         // Option: throw here to abort overall process:
  //         // throw new Error(`Upload failed for ${file.name}`);
  //       }
  //     }

  //     // 2) After all uploads done, call homework create once
  //     const homeworkForm = new FormData();
  //     homeworkForm.append("login_type", "T");
  //     homeworkForm.append("operation", "create");
  //     homeworkForm.append("random_no", randomNo);
  //     homeworkForm.append("class_id", selectedClass?.class_id);
  //     homeworkForm.append("section_id", selectedClass?.section_id);
  //     homeworkForm.append("teacher_id", regId);
  //     homeworkForm.append("sm_id", selectedSubject?.value);
  //     homeworkForm.append("academic_yr", academicYr);
  //     homeworkForm.append("start_date", formattedDate);
  //     homeworkForm.append("end_date", submissionDate);
  //     homeworkForm.append("description", remarkDescription);

  //     savedFilenames.forEach((fn) => homeworkForm.append("filename", fn));

  //     // savedFilenames.forEach((file) => {
  //     //   homeworkForm.append("filename[]", file);
  //     // });

  //     const hwResp = await axios.post(`${API_URL}/api/homework`, homeworkForm, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     if (hwResp?.data?.status === true) {
  //       toast.success("Homework created successfully!");
  //       resetForm();
  //       setTimeout(() => {
  //         if (onSaveSuccess) {
  //           onSaveSuccess();
  //         }
  //       }, 500);
  //     } else {
  //       console.error("Homework create failed:", hwResp.data);
  //       toast.error(hwResp.data.message || "Failed to create homework.");
  //     }
  //   } catch (err) {
  //     console.error("Error in handleSubmit:", err);
  //     toast.error("Something went wrong while saving homework.");
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

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
                  Create Homework
                </h3>
              </div>
              <div
                className="relative mb-3 h-1 w-[97%] mx-auto"
                style={{ backgroundColor: "#C03078" }}
              ></div>

              <form onSubmit={handleSubmit}>
                <div className="card-body w-full ml-2">
                  {loading ? (
                    <div className="flex justify-center items-center h-64">
                      <LoaderStyle />
                    </div>
                  ) : (
                    <div className="card-body w-full ml-2">
                      <div className="space-y-4 mr-10">
                        {/* Select Class */}
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                          <label className="w-[28%] text-[1em] text-gray-700">
                            Select Class <span className="text-red-500">*</span>
                          </label>
                          <div className="flex-1">
                            <Select
                              key={
                                selectedClass ? selectedClass.value : "reset"
                              }
                              options={studentOptions}
                              value={studentOptions.find(
                                (option) =>
                                  option.value === selectedClass?.value
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

                        {/* Select Subject */}
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                          <label className="w-[28%] text-[1em] text-gray-700">
                            Select Subject{" "}
                            <span className="text-red-500">*</span>
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

                        {/* Submission Date */}
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                          <label className="w-[28%] text-[1em] text-gray-700">
                            Submission Date{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="flex-1">
                            <input
                              type="date"
                              className="w-[60%] px-2 py-2 border border-gray-700 rounded-md shadow-md"
                              value={submissionDate}
                              onChange={handleDateChange}
                            />
                            {errors.submissionError && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.submissionError}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Homework */}
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                          <label className="w-[28%] text-[1em] text-gray-700">
                            Homework <span className="text-red-500">*</span>
                          </label>
                          <div className="flex-1">
                            <textarea
                              rows="3"
                              className="w-[60%] px-2 py-1 border border-gray-700 rounded-md shadow-md"
                              value={remarkDescription}
                              onChange={handleRemarkDescriptionChange}
                              maxLength={350}
                            />
                            {errors.remarkDescriptionError && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.remarkDescriptionError}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Attachments */}
                        <div className="flex flex-col md:flex-row items-start md:items-start gap-3">
                          <label className="w-[28%] text-[1em] text-gray-700 pt-2">
                            Attachment
                          </label>
                          <div className="flex-1 space-y-2">
                            <input
                              type="file"
                              multiple
                              onChange={handleFileUpload}
                              className="text-sm"
                              ref={fileInputRef}
                            />
                            <p className="text-pink-500 text-xs">
                              (Each file must not exceed a maximum size of 2MB)
                            </p>

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
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Buttons */}
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

export default CreateHomework;
