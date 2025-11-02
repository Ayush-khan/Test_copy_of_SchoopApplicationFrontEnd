import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import LoaderStyle from "../../componants/common/LoaderFinal/LoaderStyle";
import Select from "react-select";

const CreateTeacherNotes = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [loading, setLoading] = useState(false); // Loader state
  const [errors, setErrors] = useState({
    subjectError: "",
    noticeDescError: "",
    classError: "",
  });
  const [currentDate, setCurrentDate] = useState("");
  const navigate = useNavigate();
  const [classIdForSubjectAPI, setClassIdForSubjectAPI] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [sectionIdForStudentList, setSectionIdForStudentList] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isObservation, setIsObservation] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [remarkDescription, setRemarkDescription] = useState("");
  const [remarkSubject, setRemarkSubject] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [regId, setRegId] = useState(null);
  const [academicYr, setAcademicYr] = useState(null);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [roleId, setRoleId] = useState(null);
  const [teacherRoleName, setTeacherRoleName] = useState(null);
  const [classes, setClasses] = useState([]); // API से आने वाले सभी classes
  const [uploading, setUploading] = useState(false);
  useEffect(() => {
    // YYYY-MM-DD format
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    setCurrentDate(formattedDate);
  }, []);
  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file); // reads file as data URL (base64 encoded)
      reader.onload = () => {
        // Remove the "data:*/*;base64," prefix
        const base64String = reader.result.split(",")[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);

        // 1️⃣ Get session data
        const token = localStorage.getItem("authToken");
        if (!token) {
          toast.error("Authentication token not found. Please login again.");
          navigate("/");
          return;
        }

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
        setRoleId(roleId);
        setRegId(regId);
        setTeacherRoleName(teacherRoleName);
        fetchTeacherClasses(regId);
        setAcademicYr(acdYr);
      } catch (error) {
        console.error("Initialization error:", error);
        toast.error("Failed to get classes. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const fetchTeacherClasses = async (teacherId) => {
    try {
      setLoadingClasses(true);
      const token = localStorage.getItem("authToken");

      const res = await axios.get(
        `${API_URL}/api/get_teacherclasseswithclassteacher?teacher_id=${teacherId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        setClasses(res.data.data || []);
      } else {
        toast.error("Failed to load teacher classes");
      }
    } catch (err) {
      console.error("Error fetching teacher classes:", err);
      toast.error("Error fetching teacher classes");
    } finally {
      setLoadingClasses(false);
    }
  };

  // 🔹 Handle single class checkbox select/deselect
  const handleClassCheckboxChange = (cls) => {
    let updated;

    const alreadySelected = selectedClasses.some(
      (selected) =>
        selected.class_id === cls.class_id &&
        selected.section_id === cls.section_id
    );

    if (alreadySelected) {
      updated = selectedClasses.filter(
        (selected) =>
          !(
            selected.class_id === cls.class_id &&
            selected.section_id === cls.section_id
          )
      );
    } else {
      updated = [...selectedClasses, cls];
    }

    setSelectedClasses(updated);

    // Remove class selection error if any
    if (updated.length > 0) {
      setErrors((prev) => ({ ...prev, classError: "" }));
    }

    // Fetch subjects dynamically
    if (updated.length > 0) {
      fetchSubjectsForMultipleClasses(updated);
    } else {
      setSubjects([]);
    }
  };

  // 🔹 Select / Deselect All Classes
  const handleSelectAll = () => {
    if (selectedClasses.length === classes.length) {
      setSelectedClasses([]);
      setSubjects([]);
      setErrors((prev) => ({
        ...prev,
        classError: "Please select at least one class.",
      }));
    } else {
      setSelectedClasses(classes);
      fetchSubjectsForMultipleClasses(classes);
      setErrors((prev) => ({ ...prev, classError: "" }));
    }
  };

  // 🔹 Fetch subjects for multiple selected classes
  const fetchSubjectsForMultipleClasses = async (classList) => {
    try {
      setLoadingSubjects(true);
      const token = localStorage.getItem("authToken");

      // 🧩 Prepare FormData
      const formData = new FormData();
      formData.append("reg_id", regId);
      formData.append("academic_yr", academicYr);

      // 🧠 Build array of all class_id^section_id pairs
      const strArray = classList.map(
        (cls) => `${cls.class_id}^${cls.section_id}`
      );

      // 👇 Convert to JSON string and append
      formData.append("str_array", JSON.stringify(strArray));

      // 🛰 API call
      const response = await axios.post(
        `${API_URL}/api/get_subject_alloted_to_teacher_by_multiple_class`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // ✅ Extract subject data correctly from response
      const subjectsData = response.data?.subject_name || [];

      // 🗃 Store directly in state
      setSubjects(subjectsData);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast.error("Error fetching subjects for selected classes.");
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handleRemarkDescriptionChange = (e) => {
    setRemarkDescription(e.target.value);
    if (errors.remarkDescriptionError) {
      setErrors((prev) => ({ ...prev, remarkDescriptionError: "" }));
    }
  };

  // Handle file selection → auto upload each file
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter((file) => file.size <= 2 * 1024 * 1024); // max 2MB

    if (validFiles.length < files.length) {
      toast.error("Some files exceed the 2MB limit and were not added.");
    }

    for (const file of validFiles) {
      await uploadFile(file);
    }

    // Reset file input so same file can be reselected
    event.target.value = "";
  };

  // Upload single file automatically
  //   const uploadFile = async (file) => {
  //     setUploading(true);

  //     try {
  //       const token = localStorage.getItem("authToken");

  //       const random_no = Math.floor(Math.random() * 1000) + 1;

  //       // Date in DD-MM-YYYY
  //       const today = new Date();
  //       const formattedDate =
  //         String(today.getDate()).padStart(2, "0") +
  //         "-" +
  //         String(today.getMonth() + 1).padStart(2, "0") +
  //         "-" +
  //         today.getFullYear();

  //       const base64Data = await getBase64(file);

  //       const formData = new FormData();
  //       formData.append("random_no", random_no);
  //       formData.append("doc_type_folder", "daily_notes");
  //       formData.append("filename", file.name);
  //       formData.append("datafile", base64Data);
  //       formData.append("upload_date", formattedDate);

  //       await axios.post(`${API_URL}/api/upload_files`, formData, {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });

  //       // Add uploaded file to state list
  //       setAttachedFiles((prev) => [
  //         ...prev,
  //         {
  //           name: file.name,
  //           size: file.size,
  //           random_no,
  //           upload_date: formattedDate,
  //         },
  //       ]);

  //       toast.success(`${file.name} uploaded successfully`);
  //     } catch (error) {
  //       console.error("Upload failed:", error);
  //       toast.error(`Upload failed for ${file.name}`);
  //     } finally {
  //       setUploading(false);
  //     }
  //   };
  // Upload single file automatically
  const uploadFile = async (file) => {
    setUploading(true);

    try {
      const token = localStorage.getItem("authToken");
      const random_no = Math.floor(Math.random() * 1000) + 1;

      // Date in DD-MM-YYYY
      const today = new Date();
      const formattedDate =
        String(today.getDate()).padStart(2, "0") +
        "-" +
        String(today.getMonth() + 1).padStart(2, "0") +
        "-" +
        today.getFullYear();

      // Convert file → base64
      const base64Data = await getBase64(file);

      // Create FormData for upload_files API
      const formData = new FormData();
      formData.append("random_no", random_no);
      formData.append("doc_type_folder", "daily_notes");
      formData.append("filename", file.name);
      formData.append("datafile", base64Data);
      formData.append("upload_date", formattedDate);

      // Send to API
      await axios.post(`${API_URL}/api/upload_files`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      // ✅ Save file info + base64 in state
      setAttachedFiles((prev) => [
        ...prev,
        {
          name: file.name,
          size: file.size,
          random_no,
          upload_date: formattedDate,
          datafile: base64Data, // ✅ important: store Base64 string
        },
      ]);

      toast.success(`${file.name} uploaded successfully`);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(`Upload failed for ${file.name}`);
    } finally {
      setUploading(false);
    }
  };

  // Remove file → call delete API and remove from list
  const handleRemoveFile = async (index) => {
    const fileToRemove = attachedFiles[index];
    if (!fileToRemove) return;
    const token = localStorage.getItem("authToken");

    try {
      const formData = new FormData();
      formData.append("upload_date", fileToRemove.upload_date);
      formData.append("filename", fileToRemove.name);
      formData.append("doc_type_folder", "daily_notes");
      formData.append("random_no", fileToRemove.random_no);

      await axios.post(`${API_URL}/api/delete_uploaded_files`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
      toast.info(`${fileToRemove.name} deleted successfully`);
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error(`Failed to delete ${fileToRemove.name}`);
    }
  };

  // Upload all files
  const uploadAllFiles = async () => {
    if (attachedFiles.length === 0) {
      toast.error("No files to upload.");
      return;
    }

    setUploading(true);

    try {
      const token = localStorage.getItem("authToken");

      for (const file of attachedFiles) {
        const random_no = Math.floor(Math.random() * 1000) + 1;

        const today = new Date();
        const formattedDate =
          String(today.getDate()).padStart(2, "0") +
          "-" +
          String(today.getMonth() + 1).padStart(2, "0") +
          "-" +
          today.getFullYear();

        // Convert file to Base64 string
        const base64Data = await getBase64(file);

        // Prepare FormData (note: datafile is Base64 string now)
        const formData = new FormData();
        formData.append("random_no", random_no.toString());
        formData.append("doc_type_folder", "daily_notes");
        formData.append("filename", file.name);
        formData.append("datafile", base64Data);
        formData.append("upload_date", formattedDate);

        // Call API
        await axios.post(`${API_URL}/api/upload_files`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
      }

      toast.success("All files uploaded successfully!");
      setAttachedFiles([]);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
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
    setSelectedClasses([]); // Uncheck all classes
    setSelectedSubject(""); // Clear selected subject
    setRemarkDescription(""); // Clear description
    setAttachedFiles([]); // Clear uploaded files
    setErrors({}); // Clear error messages
    setIsObservation(false); // Reset observation if used
    // Optional: reset classId and sectionId derived from selectedClass
    setClassIdForSubjectAPI("");
    setSectionIdForStudentList("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let hasError = false;

    // ✅ Validate class selection
    if (selectedClasses.length === 0) {
      setErrors((prev) => ({
        ...prev,
        classError: "Please select at least one class.",
      }));
      hasError = true;
    }

    // ✅ Validate description
    if (!remarkDescription.trim()) {
      setErrors((prev) => ({
        ...prev,
        remarkDescriptionError: "Description is required.",
      }));
      hasError = true;
    }

    // ❌ Stop if any validation failed
    if (hasError) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");
      const today = new Date();
      const dailynote_date = today.toISOString().split("T")[0]; // YYYY-MM-DD

      const formData = new FormData();
      formData.append("login_type", teacherRoleName);
      formData.append("teacher_id", regId);
      formData.append("academic_yr", academicYr);
      formData.append("operation", "create");
      formData.append("description", remarkDescription || "");
      formData.append("subject_id", selectedSubject || " ");
      formData.append("dailynote_date", dailynote_date);

      // 👇 prepare str_array (classes)
      const strArray = selectedClasses.map(
        (cls) => `${cls.class_id}^${cls.section_id}`
      );
      formData.append("str_array", JSON.stringify(strArray));

      // 👇 attach all uploaded base64 files
      attachedFiles.forEach((file) => {
        formData.append("filename", file.name);
        formData.append("random_no", file.random_no);
        formData.append("datafile", file.datafile); // ✅ already base64
      });

      const response = await axios.post(
        `${API_URL}/api/daily_notes`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.status) {
        toast.success("Daily Note saved successfully!");
        resetForm();
      } else {
        toast.error("Failed to save Daily Note.");
      }
    } catch (error) {
      console.error("Error submitting:", error);
      toast.error("Something went wrong while saving.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <ToastContainer />
      <div className="container mb-4">
        <div className="card-header flex justify-between items-center"></div>
        <div className="w-[98%] mx-auto">
          <div className="container mt-4">
            <div className="card mx-auto lg:w-full shadow-lg">
              <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl">
                  Create Teacher's Note
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

                      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mt-4">
                        <label className="w-[28%] text-[1em] text-gray-700">
                          Select Subject
                        </label>

                        <div className="flex-1">
                          {loadingClasses ? (
                            <div className="flex justify-center py-6">
                              <div className="w-5 h-5 border-4 border-pink-500 border-dashed rounded-full animate-spin"></div>
                            </div>
                          ) : (
                            <>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 mt-2">
                                {classes.map((cls) => {
                                  const isChecked = selectedClasses.some(
                                    (selected) =>
                                      selected.class_id === cls.class_id &&
                                      selected.section_id === cls.section_id
                                  );

                                  return (
                                    <label
                                      key={`${cls.class_id}-${cls.section_id}`}
                                      className="flex items-center gap-2 cursor-pointer"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() =>
                                          handleClassCheckboxChange(cls)
                                        }
                                        className="accent-pink-600 w-4 h-4"
                                      />
                                      <span className="text-sm font-medium">
                                        {cls.classname} - {cls.sectionname}
                                        {cls.is_class_teacher === 1 && (
                                          <span className="text-[0.7em] text-pink-600 font-semibold ml-1">
                                            (CT)
                                          </span>
                                        )}
                                      </span>
                                    </label>
                                  );
                                })}

                                {/* Select All Checkbox */}
                                {classes.length > 0 && (
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={
                                        selectedClasses.length ===
                                        classes.length
                                      }
                                      onChange={handleSelectAll}
                                      className="accent-pink-600 w-4 h-4"
                                    />
                                    <span className="text-sm font-medium">
                                      Select All
                                    </span>
                                  </label>
                                )}

                                {errors.classError && (
                                  <p className="text-red-500 text-sm mt-1 col-span-full">
                                    {errors.classError}
                                  </p>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mt-3">
                        <label className="w-[28%] text-[1em] text-gray-700">
                          Select Subject
                        </label>

                        <div className="flex-1 w-[60%]">
                          <Select
                            value={
                              subjects
                                .map((s) => ({ value: s.sm_id, label: s.name }))
                                .find(
                                  (option) => option.value === selectedSubject
                                ) || null
                            }
                            onChange={(selectedOption) =>
                              setSelectedSubject(
                                selectedOption ? selectedOption.value : ""
                              )
                            }
                            options={subjects.map((s) => ({
                              value: s.sm_id,
                              label: s.name,
                            }))}
                            placeholder={
                              loadingSubjects
                                ? "⏳ Loading subjects..."
                                : "Select"
                            }
                            isDisabled={loadingSubjects}
                            isLoading={loadingSubjects}
                            isClearable
                            className="w-[60%]"
                            classNamePrefix="react-select"
                            styles={{
                              control: (base) => ({
                                ...base,
                                borderColor: "#d1d5db",
                                boxShadow: "none",
                                "&:hover": { borderColor: "#c03078" },
                              }),
                              option: (base, state) => ({
                                ...base,
                                backgroundColor: state.isFocused
                                  ? "#fbeaf3"
                                  : "white",
                                color: state.isFocused ? "#c03078" : "black",
                              }),
                            }}
                          />
                        </div>
                      </div>

                      {/* Subject of Remark */}
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                        <label className="w-[28%] text-[1em] text-gray-700">
                          Date <span className="text-red-500">*</span>
                        </label>
                        <div className="flex-1">
                          <input
                            type="text"
                            className="w-[60%] px-2 py-2 border border-gray-700 rounded-md shadow-md bg-gray-200 outline-none"
                            value={currentDate} // अब यहाँ remarkSubject की बजाय currentDate
                            readOnly // अगर यूज़र को बदलने की अनुमति नहीं चाहिए
                          />
                        </div>
                      </div>

                      {/* Remark */}
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                        <label className="w-[28%] text-[1em] text-gray-700">
                          Description <span className="text-red-500">*</span>
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
                      {/* File Upload */}
                      {!isObservation && (
                        <div className="flex flex-col md:flex-row items-start md:items-start gap-3">
                          <label className="w-[28%] text-[1em] text-gray-700 pt-2">
                            Add Notes
                          </label>

                          <div className="flex-1 space-y-2 mt-2">
                            {/* File Input */}
                            <input
                              type="file"
                              multiple
                              onChange={handleFileUpload}
                              className="text-sm"
                            />

                            {/* Loader */}
                            {uploading && (
                              <div className="text-sm text-gray-500 py-2 flex items-center gap-2">
                                <div className="w-4 h-4 border-4 border-pink-500 border-dashed rounded-full animate-spin"></div>
                                Uploading...
                              </div>
                            )}

                            {/* Uploaded file list */}
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

              <form onSubmit={handleSubmit}>
                {!loading && (
                  <div className="flex space-x-2 justify-end mb-2 mr-2">
                    <button
                      type="submit"
                      name="publish"
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

export default CreateTeacherNotes;
