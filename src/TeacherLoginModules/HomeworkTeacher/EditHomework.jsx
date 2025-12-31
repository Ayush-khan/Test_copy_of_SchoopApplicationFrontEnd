import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { RxCross1 } from "react-icons/rx";
import LoaderStyle from "../../componants/common/LoaderFinal/LoaderStyle";

// import Select from "react-select";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const EditHomework = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [allClasses, setAllClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    subjectError: "",
    noticeDescError: "",
    classError: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { id } = useParams();
  console.log("id", id);

  const location = useLocation();
  const selectedHomework = location.state;
  console.log("selectedHomework", selectedHomework);

  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];

  const fileInputRef = useRef(null);

  const [attachedFiles, setAttachedFiles] = useState([]);

  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
  const [removedFiles, setRemovedFiles] = useState([]);

  const [loadingClasses, setLoadingClasses] = useState(false);
  const [homeworkImage, setHomeworkImage] = useState([]);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    homework_id: "",
    classname: "",
    subjectname: "",
    start_date: "",
    end_date: "",
    description: "",
    filenottobedeleted: [],
    filename: [],
  });

  useEffect(() => {
    if (selectedHomework) {
      setFormData({
        homework_id: selectedHomework.homework_id || "",
        classname: `${selectedHomework.cls_name || ""} ${
          selectedHomework.sec_name || ""
        }`,
        subjectname: selectedHomework.sub_name || "",
        start_date: selectedHomework.start_date?.split(" ")[0] || "",
        end_date: selectedHomework.end_date?.split(" ")[0] || "",
        remark_desc: selectedHomework.description || "",
        deleteimagelist: selectedHomework.files || [],
        filename: [],
      });
    }
  }, [selectedHomework]);

  useEffect(() => {
    fetchInitialDataAndStudents();
  }, []);

  const fetchInitialDataAndStudents = async () => {
    try {
      setLoadingClasses(true);
      setLoadingStudents(true);

      const token = localStorage.getItem("authToken");

      // Fetch classes and students concurrently
      const [classResponse, studentResponse] = await Promise.all([
        axios.get(`${API_URL}/api/getallClassWithStudentCount`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/getStudentListBySectionData`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Set the fetched data
      console.log("Class Data", classResponse.data);
      setAllClasses(classResponse.data || []);
      setStudentNameWithClassId(studentResponse?.data?.data || []);
    } catch (error) {
      toast.error("Error fetching data.");
    } finally {
      // Stop loading for both dropdowns
      setLoadingClasses(false);
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (selectedHomework?.homework_id && selectedHomework?.start_date) {
      fetchImageforhomework();
    }
  }, [selectedHomework]);

  const fetchImageforhomework = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.post(
        `${API_URL}/api/get_images_homework`,
        {
          homework_id: selectedHomework?.homework_id,
          homework_date: selectedHomework?.start_date?.split(" ")[0],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (
        response?.data?.status === true &&
        Array.isArray(response.data.images)
      ) {
        setHomeworkImage(response.data.images);
      } else {
        setHomeworkImage([]);
      }
    } catch (error) {
      console.error("Error fetching homework images:", error);
      toast.error("Error fetching homework images.");
    }
  };

  // const handleFileUpload = (e) => {
  //   const newFiles = Array.from(e.target.files || []);
  //   setFormData((prev) => ({
  //     ...prev,
  //     filename: [...(prev.filename || []), ...newFiles],
  //   }));
  // };

  // const handleRemoveOldFile = (indexToRemove) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     filenottobedeleted: prev.filenottobedeleted.filter(
  //       (_, index) => index !== indexToRemove
  //     ),
  //   }));
  // };

  // ✅ File upload handler
  const handleFileUpload = (e) => {
    const newFiles = Array.from(e.target.files || []);
    setFormData((prev) => ({
      ...prev,
      filename: [...(prev.filename || []), ...newFiles],
    }));
  };

  // ✅ Remove newly attached file
  const handleRemoveFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      filename: prev.filename.filter((_, i) => i !== index),
    }));
  };

  const handleRemoveOldFile = (index) => {
    const fileToRemove = homeworkImage[index];
    if (!fileToRemove) return;

    // Move file to removed list (for API submission later)
    setRemovedFiles((prev) => [...prev, fileToRemove]);

    // Remove from current UI
    setHomeworkImage((prev) => prev.filter((_, i) => i !== index));

    toast.info(`${fileToRemove.name || "File"} marked for removal`);
  };

  // ✅ Remove previously uploaded file
  // const handleRemoveOldFile = (index) => {
  //   setHomeworkImage((prev) => prev.filter((_, i) => i !== index));
  // };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate class
    if (!formData.classname || formData.classname.trim() === "") {
      newErrors.classError = "Please select a class.";
    }

    // Validate subject
    if (!formData.subjectname || formData.subjectname.trim() === "") {
      newErrors.subjectError = "Please select a subject.";
    }

    // Validate start and end dates (optional but recommended)
    if (!formData.start_date) {
      newErrors.startDateError = "Please select a start date.";
    }

    if (!formData.end_date) {
      newErrors.endDateError = "Please select a submission date.";
    }

    // Validate description
    if (!formData.remark_desc || formData.remark_desc.trim() === "") {
      newErrors.remarkDescriptionError =
        "Please enter the homework description.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // const resetForm = () => {
  //   console.log("inside reset");
  //   setFormData({
  //     homework_id: selectedHomework?.homework_id || "",
  //     classname: `${selectedHomework?.cls_name || ""} ${
  //       selectedHomework?.sec_name || ""
  //     }`.trim(),
  //     subjectname: selectedHomework?.sub_name || "",
  //     start_date: selectedHomework?.start_date?.split(" ")[0] || "",
  //     end_date: selectedHomework?.end_date?.split(" ")[0] || "",
  //     description: selectedHomework?.description || "",
  //     filenottobedeleted: selectedHomework?.files || [],
  //     filename: [],
  //   });
  //   setAttachedFiles([]);
  // };

  // const resetForm = () => {
  //   console.log("Resetting form...");

  //   setFormData({
  //     end_date: selectedHomework?.end_date?.split(" ")[0] || "",
  //     remark_desc: selectedHomework?.description || "", // matches textarea
  //     filename: [], // newly attached files
  //     deleteimagelist: selectedHomework?.files || [], // optional
  //   });

  //   // Reset old uploaded files if using separate state
  //   setHomeworkImage(selectedHomework?.files || []);

  //   // Reset attachedFiles if you have this separate state
  //   setAttachedFiles([]);
  // };

  const resetForm = () => {
    setFormData({
      end_date: "",
      remark_desc: "",
      filename: [],
      deleteimagelist: [],
    });

    setHomeworkImage(selectedHomework?.files || []);
    setAttachedFiles([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = null; // resets the input
    }
  };

  // const handleSubmitEdit = async (e) => {
  //   e.preventDefault();

  //   if (!validateForm()) return;
  //   if (isSubmitting) return;

  //   setIsSubmitting(true);

  //   try {
  //     const token = localStorage.getItem("authToken");
  //     if (!token) throw new Error("Authentication token missing.");

  //     const randomNo = Math.floor(Math.random() * 100000);
  //     const uploadDate = new Date().toISOString().split("T")[0];
  //     const uploadedFileNames = [];

  //     // ✅ 1) Upload each file individually (like handleSubmit)
  //     if (formData?.filename && formData.filename.length > 0) {
  //       for (const file of formData.filename) {
  //         const base64String = await new Promise((resolve, reject) => {
  //           const reader = new FileReader();
  //           reader.readAsDataURL(file);
  //           reader.onload = () => {
  //             const result = reader.result;
  //             const idx = result.indexOf(",");
  //             resolve(idx > -1 ? result.slice(idx + 1) : result);
  //           };
  //           reader.onerror = reject;
  //         });

  //         const uploadForm = new FormData();
  //         uploadForm.append("random_no", randomNo);
  //         uploadForm.append("doc_type_folder", "homework");
  //         uploadForm.append("filename", file.name);
  //         uploadForm.append("datafile", base64String);
  //         uploadForm.append("upload_date", uploadDate);

  //         // 🔁 Upload each file separately
  //         const uploadResp = await axios.post(
  //           `${API_URL}/api/upload_files`,
  //           uploadForm,
  //           {
  //             headers: {
  //               Authorization: `Bearer ${token}`,
  //             },
  //           }
  //         );

  //         if (uploadResp?.data?.status === true) {
  //           const savedName =
  //             uploadResp.data.saved_filename ||
  //             uploadResp.data.filename ||
  //             file.name;
  //           uploadedFileNames.push(savedName);
  //           console.log(`✅ Uploaded ${file.name}`);
  //         } else {
  //           console.error("❌ Upload failed for", file.name, uploadResp.data);
  //           toast.error(`Upload failed for ${file.name}`);
  //         }
  //       }
  //     } else {
  //       console.log("No new files to upload.");
  //     }

  //     // ✅ 2) Prepare Edit Homework Payload
  //     const editFormData = new FormData();
  //     editFormData.append("login_type", "T");
  //     editFormData.append("operation", "edit");
  //     editFormData.append(
  //       "teacher_id",
  //       formData.teacher_id || selectedHomework.teacher_id
  //     );
  //     editFormData.append(
  //       "class_id",
  //       formData.class_id || selectedHomework.class_id
  //     );
  //     editFormData.append(
  //       "section_id",
  //       formData.section_id || selectedHomework.section_id
  //     );
  //     editFormData.append("sm_id", formData.sm_id || selectedHomework.sm_id);
  //     editFormData.append("academic_yr", selectedHomework.academic_yr);
  //     editFormData.append("homework_id", selectedHomework.homework_id);
  //     editFormData.append("description", formData.remark_desc);
  //     editFormData.append("start_date", formattedDate);
  //     editFormData.append("end_date", formData.end_date);

  //     // ✅ add filenames returned by upload_files API
  //     uploadedFileNames.forEach((fname) =>
  //       editFormData.append("filename", fname)
  //     );

  //     // ✅ handle deleteimagelist / filenottobedeleted
  //     if (formData.filenottobedeleted?.length > 0) {
  //       const notToDelete = formData.filenottobedeleted.map(
  //         (f) => f.image_name || f.file_url?.split("/").pop()
  //       );
  //       editFormData.append("deleteimagelist", notToDelete.join(","));
  //     } else if (formData.deleteimagelist?.length > 0) {
  //       const deleteList = formData.deleteimagelist.map(
  //         (f) => f.image_name || f.file_url?.split("/").pop()
  //       );
  //       editFormData.append("deleteimagelist", deleteList.join(","));
  //     }

  //     console.log(
  //       "🧾 Final Edit Homework Payload:",
  //       Object.fromEntries(editFormData)
  //     );

  //     // ✅ 3) Update Homework after all uploads
  //     const response = await axios.post(
  //       `${API_URL}/api/homework`,
  //       editFormData,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     console.log("Edit Homework API Response:", response.data);

  //     if (response.data.status === true) {
  //       toast.success(
  //         response.data.success_msg || "Homework updated successfully!"
  //       );
  //       setTimeout(() => navigate("/homework"), 2000);
  //     } else {
  //       toast.error(response.data.message || "Something went wrong");
  //     }
  //   } catch (error) {
  //     console.error("❌ Error in handleSubmitEdit:", error);
  //     toast.error("Error updating homework. Please try again.");
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Authentication token missing.");

      const randomNo = Math.floor(Math.random() * 100000);
      const uploadDate = new Date().toISOString().split("T")[0];

      // MUST be array
      const uploadedFileNames = [];

      /* 🔹 1) Upload new files (if any) */
      if (formData?.filename && formData.filename.length > 0) {
        for (const file of formData.filename) {
          const base64String = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(",")[1]);
            reader.onerror = reject;
          });

          const uploadForm = new FormData();
          uploadForm.append("random_no", randomNo);
          uploadForm.append("doc_type_folder", "homework");
          uploadForm.append("filename", file.name);
          uploadForm.append("datafile", base64String);
          uploadForm.append("upload_date", formattedDate);

          const uploadResp = await axios.post(
            `${API_URL}/api/upload_files`,
            uploadForm,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (uploadResp?.data?.status === true) {
            const savedName =
              uploadResp.data.saved_filename ||
              uploadResp.data.filename ||
              file.name;

            uploadedFileNames.push(savedName);
          } else {
            toast.error(`Upload failed for ${file.name}`);
            throw new Error("File upload failed");
          }
        }
      }

      /* 🔹 2) Prepare Edit Homework payload */
      const editFormData = new FormData();
      editFormData.append("login_type", "T");
      editFormData.append("operation", "edit");
      editFormData.append(
        "teacher_id",
        formData.teacher_id || selectedHomework.teacher_id
      );
      editFormData.append(
        "class_id",
        formData.class_id || selectedHomework.class_id
      );
      editFormData.append(
        "section_id",
        formData.section_id || selectedHomework.section_id
      );
      editFormData.append("sm_id", formData.sm_id || selectedHomework.sm_id);
      editFormData.append("academic_yr", selectedHomework.academic_yr);
      editFormData.append("homework_id", selectedHomework.homework_id);
      editFormData.append("description", formData.remark_desc);
      editFormData.append("start_date", formattedDate);
      editFormData.append("end_date", formData.end_date);

      // editFormData.append("filename", JSON.stringify(uploadedFileNames));
      editFormData.append(
        "filename",
        uploadedFileNames && uploadedFileNames.length > 0
          ? JSON.stringify(uploadedFileNames)
          : ""
      );

      /* 🔹 3) deleteimagelist handling (unchanged) */
      // if (formData.filenottobedeleted?.length > 0) {
      //   const notToDelete = formData.filenottobedeleted.map(
      //     (f) => f.image_name || f.file_url?.split("/").pop()
      //   );
      //   editFormData.append("deleteimagelist", notToDelete.join(","));
      // } else if (formData.deleteimagelist?.length > 0) {
      //   const deleteList = formData.deleteimagelist.map(
      //     (f) => f.image_name || f.file_url?.split("/").pop()
      //   );
      //   editFormData.append("deleteimagelist", deleteList.join(","));
      // }

      /* ---------------- Deleted files ---------------- */
      if (removedFiles.length > 0) {
        const deleteList = [];

        removedFiles.forEach((file, index) => {
          const filename =
            file.image_name ||
            file.name ||
            (typeof file === "string"
              ? file.substring(file.lastIndexOf("/") + 1)
              : `deleted_file_${index}`);

          deleteList.push(filename);
        });

        editFormData.append("deleteimagelist", JSON.stringify(deleteList));
      } else {
        editFormData.append("deleteimagelist", "");
      }

      /* 🔹 4) Call edit API */
      const response = await axios.post(
        `${API_URL}/api/homework`,
        editFormData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.status === true) {
        toast.success(
          response.data.success_msg || "Homework updated successfully!"
        );
        setTimeout(() => navigate("/homework"), 2000);
      } else {
        toast.error(response.data.message || "Something went wrong");
      }
    } catch (error) {
      console.error("❌ Error in handleSubmitEdit:", error);
      toast.error("Error updating homework. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <ToastContainer />
      <div className="container mb-4">
        <div className="card-header flex justify-between items-center"></div>
        <div className="w-[70%] mx-auto">
          <div className="container mt-4">
            <div className="card mx-auto lg:w-full shadow-lg">
              <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl">
                  Edit Homework
                </h3>
                <RxCross1
                  className="text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                  type="button"
                  onClick={() => navigate("/homework")}
                />
              </div>
              <div
                className="relative mb-3 h-1 w-[97%] mx-auto"
                style={{ backgroundColor: "#C03078" }}
              ></div>

              <form onSubmit={handleSubmitEdit}>
                <div className="card-body w-full ml-2">
                  {loading ? (
                    <div className="flex justify-center items-center h-64">
                      <LoaderStyle />
                    </div>
                  ) : (
                    <div className="card-body w-full ml-2">
                      <div className="space-y-4 mr-10">
                        {/* Class */}
                        <div className="flex flex-col md:flex-row items-start md:items-center">
                          <label className="w-[35%] text-[1em] text-gray-700">
                            Class
                          </label>
                          <div className="flex-1">
                            <input
                              type="text"
                              value={formData.classname}
                              readOnly
                              className="w-full bg-gray-200 text-gray-700 p-2 rounded"
                            />
                          </div>
                        </div>

                        {/* Subject */}
                        <div className="flex flex-col md:flex-row items-start md:items-center">
                          <label className="w-[35%] text-[1em] text-gray-700">
                            Subject
                          </label>
                          <div className="flex-1">
                            <input
                              type="text"
                              value={formData.subjectname}
                              readOnly
                              className="w-full bg-gray-200 text-gray-700 p-2 rounded"
                            />
                          </div>
                        </div>

                        {/* End Date */}
                        <div className="flex flex-col md:flex-row items-start md:items-center">
                          <label className="w-[35%] text-[1em] text-gray-700">
                            Submission Date{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="flex-1">
                            <input
                              type="date"
                              value={formData.end_date}
                              onChange={(e) =>
                                handleChange("end_date", e.target.value)
                              }
                              className="w-full px-2 py-2 border border-gray-700 rounded-md shadow-md"
                            />
                          </div>
                        </div>

                        {/* Homework Description */}
                        <div className="flex flex-col md:flex-row items-start md:items-center">
                          <label className="w-[35%] text-[1em] text-gray-700">
                            Homework<span className="text-red-500">*</span>
                          </label>
                          <div className="flex-1">
                            <textarea
                              rows="3"
                              className="w-full px-2 py-1 border border-gray-700 rounded-md shadow-md"
                              value={formData.remark_desc}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  remark_desc: e.target.value,
                                }))
                              }
                            />
                            {errors.remark_desc && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.remark_desc}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-start md:items-start gap-3">
                          <label className="w-[33%] text-[1em] text-gray-700 pt-2">
                            Attachment
                          </label>

                          <div className="flex-1 space-y-2">
                            {/* File input */}
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

                            {/* ✅ Newly Attached Files */}
                            {formData.filename?.length > 0 && (
                              <div className="border border-gray-300 bg-gray-50 rounded p-3 text-sm text-gray-700">
                                <label className="text-gray-800 font-semibold mb-1 block">
                                  Newly Attached Files:
                                </label>
                                <ul className="space-y-1">
                                  {formData.filename.map((file, index) => (
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

                            {/* ✅ Previously Uploaded Files */}
                            {homeworkImage?.length > 0 && (
                              <div className="border border-gray-300 bg-gray-50 rounded p-3 text-sm text-gray-700">
                                <label className="text-gray-800 font-semibold mb-1 block">
                                  Previously Uploaded Files:
                                </label>
                                <ul className="space-y-1">
                                  {homeworkImage.map((file, index) => (
                                    <li
                                      key={index}
                                      className="flex items-center justify-between hover:bg-gray-100 px-2 py-1 rounded"
                                    >
                                      <a
                                        href={file.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                      >
                                        {file.image_name || `File ${index + 1}`}{" "}
                                        (
                                        {(
                                          Number(file.file_size) / 1024
                                        ).toFixed(1)}{" "}
                                        KB)
                                      </a>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleRemoveOldFile(index)
                                        }
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
                      {isSubmitting ? "Updating..." : "Update"}
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

export default EditHomework;
