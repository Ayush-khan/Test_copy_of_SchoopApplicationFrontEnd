import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { RxCross1 } from "react-icons/rx";
import LoaderStyle from "../../componants/common/LoaderFinal/LoaderStyle";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ImDownload } from "react-icons/im";
import { FaEye } from "react-icons/fa";

const EditTeacherNotes = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [previewImage, setPreviewImage] = useState(null);
  const [allClasses, setAllClasses] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [loading, setLoading] = useState(false); // Loader state
  // const [fetchingClasses, setFetchingClasses] = useState(false); // Loader for fetching classes
  const [errors, setErrors] = useState({
    subjectError: "",
    noticeDescError: "",
    classError: "",
  });
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { id } = useParams();
  console.log("id", id);
  const location = useLocation();
  const [isObservation, setIsObservation] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [open, setOpen] = useState(false);
  const [roleId, setRoleId] = useState(null);
  const [regId, setRegId] = useState(null);
  const [academicYr, setAcademicYr] = useState(null);

  const [teacherRoleName, setTeacherRoleName] = useState(null);

  const [isImageLoading, setIsImageLoading] = useState(false);
  // ✅ Add these states
  const [removedFiles, setRemovedFiles] = useState([]); // deleted files (to send in edit API)

  const navigate = useNavigate();
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
  const formatDate = (apiDate) => {
    if (!apiDate) return "";

    // apiDate "YYYY-MM-DD" format me aati hai
    const [year, month, day] = apiDate.split("-");
    const shortYear = year.slice(-2); // last 2 digits

    return `${day}-${month}-${shortYear}`;
  };
  const [formData, setFormData] = useState({
    name: "",
    remark_subject: "",
    remark_desc: "",
    remark_type: "",
    remark_id: "",
    subject_id: "",
    class_id: "",
    section_id: "",
    date: "",
    filenottobedeleted: [], // existing uploaded files (to preview, not delete)
    userfile: [], // new files (if any, uploaded in edit)
  });
  console.log("stateeee--->", location.state);
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
  useEffect(() => {
    if (location.state) {
      // First, fetch and display images/attachments
      handleView(location.state);

      // Then set form data
      setFormData({
        remark_id: location.state.t_remark_id || "",
        name: location.state.first_name || location.state.name || "",
        remark_subject: location.state.remark_subject || "",
        remark_desc: location?.state?.description || "",
        remark_type: location.state.remark_type || "Remark",
        filenottobedeleted: location.state.files || [],
        userfile: [], // no new file uploads initially
        subjectname: `${location?.state?.remark_subject || ""}`.trim(),
        classname: `${location?.state?.name || ""}`.trim(),
        date: location?.state?.date || "",
        subject_id: location.state.subject_id || "",
        class_id: location.state.class_id || "",
        section_id: location.state.section_id || "",
      });

      setSelectedClasses(location.state.selected_class_ids || []);
      setIsObservation(location.state.remark_type === "Observation");
    }
  }, [location.state]);

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

  const editRandomNoRef = useRef(Math.floor(Math.random() * 100000));
  // const uploadFile = async (file) => {
  //   setUploading(true);

  //   try {
  //     const token = localStorage.getItem("authToken");
  //     const random_no = Math.floor(Math.random() * 1000) + 1;

  //     // Date in DD-MM-YYYY
  //     const today = new Date();
  //     const formattedDate =
  //       String(today.getDate()).padStart(2, "0") +
  //       "-" +
  //       String(today.getMonth() + 1).padStart(2, "0") +
  //       "-" +
  //       today.getFullYear();

  //     // Convert file → base64
  //     const base64Data = await getBase64(file);

  //     // Create FormData for upload_files API
  //     const formData = new FormData();
  //     formData.append("random_no", random_no);
  //     formData.append("doc_type_folder", "daily_notes");
  //     formData.append("filename", file.name);
  //     formData.append("datafile", base64Data);
  //     formData.append("upload_date", formattedDate);

  //     // Send to API
  //     await axios.post(`${API_URL}/api/upload_files`, formData, {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     // ✅ Save file info + base64 in state
  //     setAttachedFiles((prev) => [
  //       ...prev,
  //       {
  //         name: file.name,
  //         size: file.size,
  //         random_no,
  //         upload_date: formattedDate,
  //         datafile: base64Data, // ✅ important: store Base64 string
  //       },
  //     ]);

  //     toast.success(`${file.name} uploaded successfully`);
  //   } catch (error) {
  //     console.error("Upload failed:", error);
  //     toast.error(`Upload failed for ${file.name}`);
  //   } finally {
  //     setUploading(false);
  //   }
  // };

  const uploadFile = async (file) => {
    setUploading(true);

    try {
      const token = localStorage.getItem("authToken");
      const random_no = editRandomNoRef.current;

      const today = new Date();
      const formattedDate =
        String(today.getDate()).padStart(2, "0") +
        "-" +
        String(today.getMonth() + 1).padStart(2, "0") +
        "-" +
        today.getFullYear();

      const base64Data = await getBase64(file);

      const formData = new FormData();
      formData.append("random_no", random_no);
      formData.append("doc_type_folder", "daily_notes");
      formData.append("filename", file.name);
      formData.append("datafile", base64Data);
      formData.append("upload_date", formattedDate);

      await axios.post(`${API_URL}/api/upload_files`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setAttachedFiles((prev) => [
        ...prev,
        {
          name: file.name,
          size: file.size,
          random_no, // ✅ SAME stored
          upload_date: formattedDate,
          datafile: base64Data,
        },
      ]);

      toast.success(`${file.name} uploaded successfully`);
    } catch (error) {
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

  // const handleRemoveExistingImage = async (index) => {
  //   const fileUrl = imageUrls[index];
  //   const fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
  //   const token = localStorage.getItem("authToken");

  //   try {
  //     const formDataForDeleteFile = new FormData();
  //     formDataForDeleteFile.append("filename", fileName);
  //     console.log("---->>>formData.date", formData);
  //     formDataForDeleteFile.append("doc_type_folder", "daily_notes"); // same folder you used when uploading
  //     formDataForDeleteFile.append("upload_date", formData.date); // date from the remark

  //     await axios.post(
  //       `${API_URL}/api/delete_uploaded_files`,
  //       formDataForDeleteFile,
  //       {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     // Remove from UI
  //     setImageUrls((prev) => prev.filter((_, i) => i !== index));
  //     toast.info(`${fileName} removed successfully!`);
  //   } catch (error) {
  //     console.error("Error removing image:", error);
  //     toast.error(`Failed to remove ${fileName}`);
  //   }
  // };
  // ✅ New version - does NOT call API
  // ✅ Handles both images and non-image files
  const handleRemoveExistingFile = (index) => {
    const fileToRemove = imageUrls[index];
    if (!fileToRemove) return;

    // Move file to removed list (for API submission later)
    setRemovedFiles((prev) => [...prev, fileToRemove]);

    // Remove from current UI
    setImageUrls((prev) => prev.filter((_, i) => i !== index));

    toast.info(`${fileToRemove.name || "File"} marked for removal`);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      remark_subject: "",
      remark_desc: "",
      remark_type: "Remark",
      remark_id: "",
      filenottobedeleted: [],
      userfile: [],
    });

    setIsObservation(false);
  };
  const handleView = async (subject) => {
    setIsImageLoading(true);
    setImageUrls([]); // clear old images
    // set your remarkData (same as before)
    setOpen(true);

    try {
      const token = localStorage.getItem("authToken");
      const formData = new FormData();
      formData.append("dailynote_date", subject?.date);
      formData.append("note_id", subject?.t_remark_id);

      const response = await axios.post(
        `${API_URL}/api/get_images_daily_notes`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data?.status && response.data.images?.length > 0) {
        const baseUrl = response.data.url;
        const urls = response.data.images.map(
          (img) => `${baseUrl}/${img.image_name}`
        );
        setImageUrls(urls);
      } else {
        setImageUrls([]);
      }
    } catch (err) {
      console.error("Error fetching images:", err);
      setImageUrls([]);
    } finally {
      setIsImageLoading(false);
      setIsLoading(false);
    }
  };

  // Function to download files
  {
    imageUrls && imageUrls.length > 0 && (
      <div className="relative mb-3 flex flex-col mx-4 gap-y-2">
        <label className="mb-2 font-bold">Attachments:</label>
        {imageUrls.map((url, index) => {
          // Extract file name from the URL
          const fileName = url.substring(url.lastIndexOf("/") + 1);
          return (
            <div
              key={index}
              className="flex flex-row text-[.6em] items-center gap-x-2"
            >
              {/* Display file name */}
              <span>{fileName}</span>
              <button
                className="text-blue-600 hover:text-blue-800 hover:bg-transparent"
                onClick={
                  () => downloadFile(url, fileName) // Pass both URL and fileName
                }
              >
                <ImDownload />
              </button>
            </div>
          );
        })}
      </div>
    );
  }

  const downloadFile = (fileUrl, fileName) => {
    const baseUrl = "https://sms.evolvu.in/"; // Base URL
    const fullUrl = `${fileUrl}`; // Construct the full file URL

    // Create an anchor element
    const link = document.createElement("a");
    link.href = fullUrl; // Set the file URL
    link.target = "none"; // Open in a new tab (optional)
    link.download = fileName || "downloaded_file.pdf"; // Use the provided file name or a default name
    document.body.appendChild(link); // Append the link to the DOM

    // Trigger the click to download the file
    link.click();

    // Clean up the DOM
    document.body.removeChild(link); // Remove the link after the click
  };

  // const handleSubmitEdit = async () => {
  //   try {
  //     setIsSubmitting(true);

  //     const token = localStorage.getItem("authToken");

  //     //  Build form data
  //     const data = new FormData();
  //     // --- Deleted files (images or PDFs) ---
  //     if (removedFiles.length > 0) {
  //       const deleteList = [];

  //       removedFiles.forEach((file, index) => {
  //         // Get filename (from object or URL)
  //         const filename =
  //           file.image_name ||
  //           file.name ||
  //           (typeof file === "string"
  //             ? file.substring(file.lastIndexOf("/") + 1)
  //             : `deleted_file_${index}`);

  //         deleteList.push(filename);

  //         // ✅ If it's a File object (like from input), append it too
  //         if (file instanceof File) {
  //           data.append("deletefile_" + index, file);
  //         } else if (file.image_url) {
  //           // Optionally append the image URL if your backend handles URLs
  //           data.append("deletefileurl_" + index, file.image_url);
  //         }
  //       });

  //       // Attach delete list as JSON
  //       data.append("deleteimagelist", JSON.stringify(deleteList));
  //     } else {
  //       data.append("deleteimagelist", "[]");
  //     }

  //     // --- Basic required fields ---
  //     data.append("login_type", teacherRoleName); // e.g., "T"
  //     data.append("teacher_id", regId || ""); // Logged-in teacher id
  //     data.append("academic_yr", academicYr || "2025-2026");
  //     data.append("operation", "edit"); // always edit
  //     data.append("notes_id", formData.remark_id || "");
  //     data.append("subject_id", formData.subject_id || "");
  //     data.append("description", formData.remark_desc || "");
  //     data.append("dailynote_date", formData.date || "");
  //     data.append("class_id", formData?.class_id || "");
  //     data.append("section_id", formData?.section_id || "");

  //     // --- Class-section string array like ["135^535"] ---
  //     // ✅ Build class-section array based on formData values
  //     const strArray = [`${formData?.class_id}^${formData?.section_id}`];
  //     data.append("str_array", JSON.stringify(strArray));

  //     // --- Random number for file uniqueness ---
  //     const randomNo = Math.floor(Math.random() * 1000);
  //     data.append("random_no", randomNo);
  //     attachedFiles.forEach((file) => {
  //       data.append("filename", file.name);
  //       data.append("datafile", file.datafile); // ✅ already base64
  //     });
  //     // --- File upload (only one file allowed) ---
  //     // if (attachedFiles.length > 0) {
  //     //   const file = attachedFiles[0];
  //     //   data.append("filename", file.name);
  //     //   data.append("datafile", file); // direct file object
  //     // } else {
  //     //   data.append("filename", "");
  //     //   data.append("datafile", "");
  //     // }

  //     // --- Deleted files (images or PDFs) ---
  //     if (removedFiles.length > 0) {
  //       const deleteList = removedFiles.map(
  //         (file) => file.image_name || file.name
  //       );
  //       data.append("deleteimagelist", JSON.stringify(deleteList));
  //     } else {
  //       data.append("deleteimagelist", "[]");
  //     }

  //     console.log("Submitting FormData ->");
  //     for (const pair of data.entries()) {
  //       console.log(`${pair[0]}:`, pair[1]);
  //     }

  //     // 🚀 API call
  //     const response = await axios.post(`${API_URL}/api/daily_notes`, data, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         "Content-Type": "multipart/form-data",
  //       },
  //     });

  //     if (response.data.status === true) {
  //       toast.success("Note updated successfully!");
  //       navigate("/TeacherNotes");
  //     } else {
  //       toast.error(response.data.message || "Failed to update note!");
  //     }
  //   } catch (error) {
  //     console.error("Error updating note:", error);
  //     toast.error("Something went wrong!");
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const handleSubmitEdit = async () => {
    try {
      setIsSubmitting(true);

      const token = localStorage.getItem("authToken");
      const data = new FormData();

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

        data.append("deleteimagelist", JSON.stringify(deleteList));
      } else {
        data.append("deleteimagelist", "");
      }

      /* ---------------- Required fields ---------------- */
      data.append("login_type", teacherRoleName);
      data.append("teacher_id", regId || "");
      data.append("academic_yr", academicYr || "2025-2026");
      data.append("operation", "edit");
      data.append("notes_id", formData.remark_id || "");
      data.append("subject_id", formData.subject_id || "");
      data.append("description", formData.remark_desc || "");
      data.append("dailynote_date", formData.date || "");
      data.append("class_id", formData?.class_id || "");
      data.append("section_id", formData?.section_id || "");

      const strArray = [`${formData?.class_id}^${formData?.section_id}`];
      data.append("str_array", JSON.stringify(strArray));

      /* ---------------- SAME random number ---------------- */
      const randomNo = editRandomNoRef.current;
      data.append("random_no", randomNo);

      /* ---------------- Files ---------------- */
      // const filenames = attachedFiles.map((file) => file.name);
      // data.append("filename", JSON.stringify(filenames));
      // data.append("datafile", JSON.stringify(filenames));
      const filenames = attachedFiles.map((file) => file.name);

      data.append(
        "filename",
        filenames.length > 0 ? JSON.stringify(filenames) : ""
      );

      data.append(
        "datafile",
        filenames.length > 0 ? JSON.stringify(filenames) : ""
      );

      /* ---------------- Debug log ---------------- */
      for (const pair of data.entries()) {
        console.log(`${pair[0]}:`, pair[1]);
      }

      /* ---------------- API call ---------------- */
      const response = await axios.post(`${API_URL}/api/daily_notes`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.status === true) {
        toast.success("Note updated successfully!");

        // 🔁 Reset random number for next edit
        editRandomNoRef.current = Math.floor(Math.random() * 100000);

        navigate("/TeacherNotes");
      } else {
        toast.error(response.data.message || "Failed to update note!");
      }
    } catch (error) {
      console.error("Error updating note:", error);
      toast.error("Something went wrong!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <ToastContainer />
      <div className="container mb-4">
        <div className="card-header flex justify-between items-center"></div>
        <div className="w-[60%] mx-auto">
          <div className="container mt-4">
            <div className="card mx-auto lg:w-full shadow-lg">
              <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl">
                  Edit Teacher's note
                </h3>
                <RxCross1
                  className="text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                  type="button"
                  onClick={() => navigate("/TeacherNotes")}
                />
              </div>
              <div
                className="relative mb-3 h-1 w-[97%] mx-auto"
                style={{ backgroundColor: "#C03078" }}
              ></div>
              <div className="card-body w-full ml-2">
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    {/* <div className="spinner-border text-primary" role="status"> */}
                    <LoaderStyle />
                    {/* </div> */}
                  </div>
                ) : (
                  <div className="card-body w-full md:w-[90%] mx-auto ml-2">
                    <div className="space-y-5 mr-14">
                      {/* Class Selection */}
                      <div className="flex flex-col md:flex-row items-start md:items-center">
                        <label className="w-[40%] text-[1em] text-gray-700">
                          Class
                        </label>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={formData?.classname}
                            readOnly
                            className="w-full bg-gray-200 text-gray-700 p-2 rounded"
                          />
                          {errors.classError && (
                            <p className="text-red-500 mt-1">
                              {errors.classError}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Subject Selection */}
                      <div className="flex flex-col md:flex-row items-start md:items-center">
                        <label className="w-[40%] text-[1em] text-gray-700">
                          Subject
                        </label>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={formData.subjectname}
                            readOnly
                            className="w-full bg-gray-200 text-gray-700 p-2 rounded"
                            maxLength={350}
                          />
                          {errors.classError && (
                            <p className="text-red-500 mt-1">
                              {errors.classError}
                            </p>
                          )}
                        </div>
                      </div>
                      {/* Date */}
                      <div className="flex flex-col md:flex-row items-start md:items-center">
                        <label className="w-[40%] text-[1em] text-gray-700">
                          Date
                        </label>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={formatDate(formData?.date)}
                            readOnly
                            className="w-full bg-gray-200 text-gray-700 p-2 rounded"
                          />
                        </div>
                      </div>

                      {/* Remark */}
                      <div className="flex flex-col md:flex-row items-start md:items-center">
                        <label className="w-[40%] text-[1em] text-gray-700">
                          Description <span className="text-red-500">*</span>
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
                      {!isObservation && (
                        <div className="flex flex-col md:flex-row items-start md:items-start gap-3">
                          <label className="w-[28%] text-[1em] text-gray-700 pt-2">
                            Add Notes
                          </label>

                          <div className="flex-1 space-y-2 relative left-10 mt-2">
                            {/* File Input */}
                            <input
                              type="file"
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
                      {/* File Upload */}
                      {/* Attachments Section */}
                      {isImageLoading ? (
                        <div className="flex justify-center items-center py-4">
                          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm ml-2 text-blue-500">
                            Loading attachments...
                          </span>
                        </div>
                      ) : imageUrls.length > 0 ? (
                        <div className="w-full flex flex-row">
                          <label className="mb-2">Attachments:</label>

                          {/* <div className="relative mt-2 left-[15%] flex flex-col mx-4 gap-y-2">
                            {imageUrls.map((url, index) => {
                              const fileName =
                                typeof url === "string"
                                  ? url.substring(url.lastIndexOf("/") + 1)
                                  : url.image_name || url.name;

                              const isImage = /\.(jpg|jpeg|png|gif)$/i.test(
                                fileName
                              );

                              return (
                                <div
                                  key={index}
                                  className="font-semibold flex flex-row text-[.7em] items-center gap-x-3"
                                >
                                  <span className="truncate w-40">
                                    {fileName}
                                  </span>

                                  {isImage ? (
                                    <button
                                      className="text-blue-600 hover:text-blue-800"
                                      title="View Image"
                                      onClick={() => setPreviewImage(url)}
                                    >
                                      <FaEye className="w-3 h-3" />
                                    </button>
                                  ) : (
                                    <button
                                      className="text-green-600 hover:text-green-800"
                                      title="Download File"
                                      onClick={() =>
                                        downloadFile(url, fileName)
                                      }
                                    >
                                      <ImDownload className="w-3 h-3" />
                                    </button>
                                  )}

                                  <button
                                    className="text-red-500 hover:text-red-700"
                                    title="Remove File"
                                    onClick={() =>
                                      handleRemoveExistingFile(index)
                                    }
                                  >
                                    <RxCross1 className="w-3 h-3" />
                                  </button>
                                </div>
                              );
                            })}
                          </div> */}
                          <div className="relative mt-2 left-[15%] flex flex-col mx-4 gap-y-2">
                            {/* 🔄 Loader */}
                            {isLoading && (
                              <div className="flex justify-center items-center py-4">
                                <span className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></span>
                              </div>
                            )}

                            {/* 📂 File list */}
                            {!isLoading &&
                              imageUrls?.length > 0 &&
                              imageUrls.map((url, index) => {
                                const fileName =
                                  typeof url === "string"
                                    ? url.substring(url.lastIndexOf("/") + 1)
                                    : url?.image_name || url?.name;

                                const isImage = /\.(jpg|jpeg|png|gif)$/i.test(
                                  fileName
                                );

                                return (
                                  <div
                                    key={index}
                                    className="font-semibold flex flex-row text-[.7em] items-center gap-x-3"
                                  >
                                    <span className="truncate w-40">
                                      {fileName}
                                    </span>

                                    {/* 👁 View or Download */}
                                    {isImage ? (
                                      <button
                                        className="text-blue-600 hover:text-blue-800"
                                        title="View Image"
                                        onClick={() => setPreviewImage(url)}
                                      >
                                        <FaEye className="w-3 h-3" />
                                      </button>
                                    ) : (
                                      <button
                                        className="text-green-600 hover:text-green-800"
                                        title="Download File"
                                        onClick={() =>
                                          downloadFile(url, fileName)
                                        }
                                      >
                                        <ImDownload className="w-3 h-3" />
                                      </button>
                                    )}

                                    {/* ❌ Remove */}
                                    <button
                                      className="text-red-500 hover:text-red-700"
                                      title="Remove File"
                                      onClick={() =>
                                        handleRemoveExistingFile(index)
                                      }
                                    >
                                      <RxCross1 className="w-3 h-3" />
                                    </button>
                                  </div>
                                );
                              })}

                            {/* 🚫 No data found */}
                            {!isLoading &&
                              (!imageUrls || imageUrls.length === 0) && (
                                <div className="text-center text-gray-500 text-sm py-4">
                                  No data found
                                </div>
                              )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm relative left-[35%]  text-gray-400 italic ml-4 mt-2 flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828L18 9.828m0 0V5a2 2 0 00-2-2h-4.172a2 2 0 00-1.414.586l-6.828 6.828a4 4 0 105.656 5.656L18 9.828z"
                            />
                          </svg>
                          No attachments available
                        </p>
                      )}

                      {previewImage && (
                        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-50">
                          <div className="bg-white border border-gray-300 shadow-2xl rounded-lg p-3 w-[260px] flex flex-col items-center animate-fadeIn">
                            {/* 🖼 Image */}
                            <img
                              src={previewImage}
                              alt="Preview"
                              className="rounded-md w-[240px] h-[180px] object-contain mb-3 border border-gray-200"
                            />

                            {/* ✨ Subtle divider */}
                            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-3" />

                            {/* 🔘 Close Button */}
                            <button
                              onClick={() => setPreviewImage(null)}
                              className="px-4 py-1 bg-gradient-to-r from-pink-500 to-red-600 text-white text-sm rounded-md shadow hover:scale-105 transition-transform duration-200"
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {!loading && (
                <div className="flex justify-end space-x-2 mb-2 mr-2">
                  <button
                    type="button"
                    onClick={handleSubmitEdit}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Updaing..." : "Update"}
                  </button>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>
            {imageModalOpen && (
              <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-50">
                <div className="relative bg-white border border-gray-300 shadow-lg rounded-md p-2 w-[140px]">
                  {/* ❌ Close button */}
                  <button
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                    onClick={() => setImageModalOpen(false)}
                  >
                    ✕
                  </button>

                  {/* 🖼 Image */}
                  <img
                    src={selectedImageUrl}
                    alt="Attachment Preview"
                    className="rounded object-contain w-[120px] h-[180px]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTeacherNotes;
