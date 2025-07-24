import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { RxCross1 } from "react-icons/rx";
// import Loader from "../components/Loader"; // Add a Loader component or use an existing one.
// import LoaderStyle from "../../common/LoaderFinal/LoaderStyle";
import LoaderStyle from "../common/LoaderFinal/LoaderStyle";
// import Select from "react-select";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const EditRemarkandObservation = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [allClasses, setAllClasses] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [loading, setLoading] = useState(false); // Loader state
  // const [fetchingClasses, setFetchingClasses] = useState(false); // Loader for fetching classes
  const [errors, setErrors] = useState({
    subjectError: "",
    noticeDescError: "",
    classError: "",
  });

  const { id } = useParams();
  console.log("id", id);

  const location = useLocation();
  const selectedRemark = location.state;
  console.log("selectedRemark", selectedRemark);

  const [isObservation, setIsObservation] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [classIdForManage, setclassIdForManage] = useState("");
  const [selectedClass, setSelectedClass] = useState(null);
  const [sectionIdForStudentList, setSectionIdForStudentList] = useState("");
  const [nameError, setNameError] = useState(null);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    remark_subject: "",
    remark_desc: "",
    remark_type: "Remark",
    remark_id: "",
    filenotbedeleted: [], // existing uploaded files (to preview, not delete)
    userfile: [], // new files (if any, uploaded in edit)
  });

  useEffect(() => {
    if (location.state) {
      setFormData({
        remark_id: location.state.remark_id || "",
        name: location.state.first_name || location.state.name || "",
        remark_subject: location.state.remark_subject || "",
        remark_desc: location.state.remark || location.state.remark_desc || "",
        remark_type: location.state.remark_type || "Remark",
        filenotbedeleted: location.state.files || [], //
        userfile: [], // no new file uploads initially
        subjectname:
          location.state.subjectname || location.state.subjectname || "",
        fullname: `${location.state.first_name || ""} ${
          location.state.midname || ""
        } ${location.state.last_name || ""}`.trim(),
        classname: `${location.state.classname || ""} ${
          location.state.sectionname || ""
        }`.trim(),
      });

      setSelectedClasses(location.state.selected_class_ids || []);
      setIsObservation(location.state.remark_type === "Observation");
    }
  }, [location.state]);

  const handleObservationToggle = (e) => {
    setIsObservation(e.target.checked);
  };

  useEffect(() => {
    fetchInitialDataAndStudents();
  }, []);

  const classOptions = useMemo(() => {
    return allClasses.map((cls) => ({
      value: cls.section_id, // This is the section ID used for fetching students
      label: `${cls?.get_class?.name} ${cls.name} (${cls.students_count})`,
    }));
  }, [allClasses]);

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

  const handleClassSelect = (selectedOption) => {
    setNameError("");
    setSelectedClass(selectedOption);
    setSelectedStudent(null);
    setSelectedStudentId(null);

    const sectionId = selectedOption?.value || null;

    setclassIdForManage(sectionId);
    setSectionIdForStudentList(sectionId);

    if (sectionId) {
      fetchStudentNameWithClassId(sectionId);
    }
  };

  // const handleFileUpload = (event) => {
  //   const files = Array.from(event.target.files);
  //   setUploadedFiles((prevFiles) => [...prevFiles, ...files]);
  // };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      userfile: files,
    }));
  };

  const handleRemoveOldFile = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      filenotbedeleted: prev.filenotbedeleted.filter(
        (_, index) => index !== indexToRemove
      ),
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.remark_subject.trim()) {
      errors.remark_subject = "Subject of Remark is required.";
    }

    if (!formData.remark_desc.trim()) {
      errors.remark_desc = "Remark description is required.";
    }

    setErrors(errors); // assume you're tracking errors with a useState

    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      name: "",
      remark_subject: "",
      remark_desc: "",
      remark_type: "Remark",
      remark_id: "",
      filenotbedeleted: [],
      userfile: [],
      subjectname: "",
      fullname: "",
      classname: "",
    });

    setSelectedClasses([]);
    setIsObservation(false);
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    const formDataToSend = new FormData();

    // 1. Add basic text fields
    formDataToSend.append("remark_id", formData.remark_id);
    formDataToSend.append("remark_subject", formData.remark_subject);
    formDataToSend.append("remark_desc", formData.remark_desc);
    formDataToSend.append(
      "remark_type",
      isObservation ? "Observation" : "Remark"
    );

    // 2. Append new files (userfile[])
    formData.userfile.forEach((file) => {
      formDataToSend.append("userfile[]", file);
    });

    // 3. Append old files (filenotbedeleted[])
    // Assumes backend accepts file_url/image_name for retained files
    formData.filenotbedeleted.forEach((file, index) => {
      formDataToSend.append(
        `filenotbedeleted[${index}][file_url]`,
        file.file_url
      );
      formDataToSend.append(
        `filenotbedeleted[${index}][image_name]`,
        file.image_name
      );
    });

    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.post(
        `${API_URL}/api/update_remarkforstudent/${id}`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("Remark updated successfully!");
        navigate("/remObsStudent");
      } else {
        toast.error(response.data.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Error updating remark:", error);
      toast.error("Error updating remark");
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
                  Edit Remark & Observation
                </h3>
                <RxCross1
                  className="text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                  type="button"
                  onClick={() => navigate("/remObsStudent")}
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
                  <div className="card-body w-full ml-2">
                    <div className="space-y-5 mr-14">
                      {/* Class Selection */}
                      <div className="flex flex-col md:flex-row items-start md:items-center">
                        <label className="w-[40%] text-[1em] text-gray-700">
                          Class
                        </label>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={formData.classname}
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

                      {/* Student Selection */}
                      <div className="flex flex-col md:flex-row items-start md:items-center">
                        <label className="w-[40%] text-[1em] text-gray-700">
                          Student
                        </label>
                        <div className="flex-1">
                          <input
                            type="text"
                            readOnly
                            value={formData.fullname}
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
                          />
                          {errors.classError && (
                            <p className="text-red-500 mt-1">
                              {errors.classError}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Subject of Remark */}
                      <div className="flex flex-col md:flex-row items-start md:items-center">
                        <label className="w-[40%] text-[1em] text-gray-700">
                          Subject of Remark{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="flex-1">
                          <input
                            type="text"
                            className="w-full px-2 py-2 border border-gray-700 rounded-md shadow-md"
                            value={formData.remark_subject}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                remark_subject: e.target.value,
                              }))
                            }
                          />
                          {errors.remark_subject && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.remark_subject}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Remark */}
                      <div className="flex flex-col md:flex-row items-start md:items-center">
                        <label className="w-[40%] text-[1em] text-gray-700">
                          Remark <span className="text-red-500">*</span>
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
                        <div className="flex flex-col md:flex-row items-start md:items-center">
                          <label className="w-[40%] text-[1em] text-gray-700">
                            Attachment
                          </label>
                          <div className="flex-1">
                            {/* File upload input */}
                            <input
                              type="file"
                              multiple
                              onChange={handleFileUpload}
                              className="text-sm"
                            />
                            <p className="text-pink-500 text-xs mt-1">
                              (Each file must not exceed a maximum size of 2MB)
                            </p>
                            {formData.filenotbedeleted?.length > 0 && (
                              <div className="mt-2">
                                <label className="text-sm text-gray-700">
                                  Previously Uploaded Files:
                                </label>
                                <ul className="list-disc ml-5 text-blue-600 underline text-sm">
                                  {formData.filenotbedeleted.map(
                                    (file, index) => (
                                      <li
                                        key={index}
                                        className="flex items-center space-x-2"
                                      >
                                        <a
                                          href={file.file_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="hover:underline"
                                        >
                                          {file.image_name ||
                                            `File ${index + 1}`}
                                        </a>
                                        <span className="text-gray-500 text-xs">
                                          (
                                          {(
                                            Number(file.file_size) / 1024
                                          ).toFixed(2)}{" "}
                                          KB)
                                        </span>

                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleRemoveOldFile(index)
                                          }
                                          className="text-red-500 text-xs ml-2 hover:underline"
                                        >
                                          <i className="fas fa-times-circle"></i>
                                        </button>
                                      </li>
                                    )
                                  )}
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
              {!loading && (
                <div className="flex justify-end space-x-2 mb-2 mr-2">
                  <button
                    type="button"
                    onClick={handleSubmitEdit}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Update
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditRemarkandObservation;
