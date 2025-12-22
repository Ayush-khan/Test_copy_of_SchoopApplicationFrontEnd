import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { RxCross1 } from "react-icons/rx";
import LoaderStyle from "../../componants/common/LoaderFinal/LoaderStyle";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

const CreateChapter = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const academicYrTo = localStorage.getItem("academic_yr_to");
  const academicYrFrom = localStorage.getItem("academic_yr_from");

  const [allClasses, setAllClasses] = useState([]);
  const [allSubject, setAllSubject] = useState([]);
  const [subject, setSubject] = useState("");

  const [loading, setLoading] = useState(false);

  const [selectedClasses, setSelectedClasses] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [lessonNo, setLessonNo] = useState("");
  const [name, setName] = useState("");
  const [subSubject, setSubSubject] = useState("");
  const [description, setDescription] = useState("");

  const [errors, setErrors] = useState({
    lessonNo: "",
    name: "",
    classError: "",
    subjectError: "",
  });

  const initialFormState = {
    description: "",
    lessonNo: "",
    name: "",
    subSubject: "",
    selectedSubject: [],
    selectedClasses: [],
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const [roleID, setRoleId] = useState(null);
  const [roleIdValue, setRoleIdValue] = useState(null);

  useEffect(() => {
    fetchDataRoleId();
  }, []);

  useEffect(() => {
    if (!roleIdValue) return; // guard against empty
    fetchClassNames(roleIdValue);
  }, [roleIdValue]);

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

      console.log("roleid", roleId);
      console.log("regid", regId);

      setRoleId(roleId); // optional for global use
      setRoleIdValue(regId); // optional for global use

      return { roleId, roleIdValue: regId }; // ✅ return both
    } catch (error) {
      return {};
    }
  };

  const fetchClassNames = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/api/get_only_classes_allotted_to_teacher?teacher_id=${roleIdValue}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAllClasses(response.data.data || []);
    } catch (error) {
      toast.error("Error fetching class names");
    } finally {
      setLoading(false); // Stop loader
    }
  };

  // Update fetchSubjectNames to accept a classId
  const fetchSubjectNames = async (classId) => {
    if (!classId) return; // no class selected, skip API
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/api/get_subjects_according_class?class_id=${classId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAllSubject(response.data.data || []);
    } catch (error) {
      toast.error("Error fetching subject names");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const classId = Array.isArray(selectedClasses)
      ? selectedClasses[0]
      : selectedClasses;

    fetchSubjectNames(classId);
  }, [selectedClasses]);

  useEffect(() => {
    const classId = Array.isArray(selectedClasses)
      ? selectedClasses[0]
      : selectedClasses;

    fetchSubjectNames(classId);
  }, [selectedClasses]);

  const resetForm = () => {
    setSelectedClasses(null);
    setSelectedSubject(null);
    setLessonNo("");
    setName("");
    setSubSubject("");
    setDescription("");
  };

  const handleClassChange = (selectedOption) => {
    setSelectedClasses(selectedOption ? selectedOption.value : null);
    if (selectedOption) {
      setErrors((prev) => ({ ...prev, classError: "" }));
    }
  };

  const handleSubjectChange = (selectedOption) => {
    setSelectedSubject(selectedOption ? selectedOption.value : null);
    if (selectedOption) {
      setErrors((prev) => ({ ...prev, subjectError: "" }));
    }
  };

  const handleLessonChange = (e) => {
    const value = e.target.value;

    // Allow only numbers
    if (/^\d*$/.test(value)) {
      setLessonNo(value);

      if (value.trim() !== "") {
        setErrors((prev) => ({ ...prev, lessonNo: "" }));
      }
    }
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    if (value.trim() !== "") {
      setErrors((prev) => ({ ...prev, name: "" }));
    }
  };

  const handleSubSubjectChange = (e) => {
    setSubSubject(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setDescription(value);
    if (value.trim() !== "") {
      setErrors((prev) => ({ ...prev, description: "" }));
    }
  };

  const handleSubmitAdd = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const newErrors = {};
    let formHasErrors = false;

    if (!selectedClasses) {
      newErrors.classError = "Please select a class.";
      formHasErrors = true;
    }
    if (!selectedSubject) {
      newErrors.subjectError = "Please select a subject.";
      formHasErrors = true;
    }
    if (!lessonNo.trim()) {
      newErrors.lessonNo = "Lesson number is required.";
      formHasErrors = true;
    } else if (!/^\d+$/.test(lessonNo)) {
      newErrors.lessonNo = "Only numbers are allowed.";
      formHasErrors = true;
    }

    if (!name.trim()) {
      newErrors.name = "Lesson name is required.";
      formHasErrors = true;
    }

    if (formHasErrors) {
      setErrors(newErrors);
      setIsSubmitting(false);
      toast.error("Please fill all required fields correctly.");
      return;
    }

    setErrors({});
    try {
      const token = localStorage.getItem("authToken");
      const payload = {
        class_id: selectedClasses,
        subject_id: selectedSubject,
        chapter_no: lessonNo,
        name,
        sub_subject: subSubject,
        description,
      };

      const response = await axios.post(
        `${API_URL}/api/save_chapters`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const { data } = response;

      if (data.success) {
        toast.success("Chapter saved successfully!");
        resetForm();
        navigate("/chapters");
      } else {
        toast.error(data.message || "Failed to save chapter.");
      }
    } catch (err) {
      console.error("Error saving chapter:", err);

      if (err.response && err.response.status === 409) {
        setErrors((prev) => ({
          ...prev,
          lessonNo:
            "Lesson number is already created,please enter unique number..",
        }));
      } else {
        toast.error("Server error. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAddPublish = async () => {
    if (isPublishing) return;
    setIsPublishing(true);

    const newErrors = {};
    let formHasErrors = false;

    if (!selectedClasses) {
      newErrors.classError = "Please select a class.";
      formHasErrors = true;
    }
    if (!selectedSubject) {
      newErrors.subjectError = "Please select a subject.";
      formHasErrors = true;
    }
    if (!lessonNo.trim()) {
      newErrors.lessonNo = "Lesson number is required.";
      formHasErrors = true;
    }
    if (!name.trim()) {
      newErrors.name = "Lesson name is required.";
      formHasErrors = true;
    }

    if (formHasErrors) {
      setErrors(newErrors);
      setIsPublishing(false);
      toast.error("Please fill all required fields correctly.");
      return;
    }

    setErrors({});
    try {
      const token = localStorage.getItem("authToken");
      const payload = {
        class_id: selectedClasses,
        subject_id: selectedSubject,
        chapter_no: lessonNo,
        name,
        sub_subject: subSubject,
        description,
      };

      const response = await axios.post(
        `${API_URL}/api/save_savenpublishchapters`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const { data } = response;

      if (data.success) {
        toast.success("Chapter saved & publish successfully!");
        resetForm();
        navigate("/chapters");
      } else {
        toast.error(data.message || "Failed to save and publish chapter.");
      }
    } catch (err) {
      console.error("Error saving chapter:", err);

      if (err.response && err.response.status === 409) {
        setErrors((prev) => ({
          ...prev,
          lessonNo:
            "Lesson number is already created,please enter unique number..",
        }));
      } else {
        toast.error("Server error. Please try again.");
      }
    } finally {
      setIsPublishing(false);
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
                  Create Chapter
                </h3>
                <RxCross1
                  className="text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                  type="button"
                  onClick={() => navigate("/chapters")}
                />
              </div>
              <div
                className="relative h-1 w-[97%] mx-auto"
                style={{ backgroundColor: "#C03078" }}
              ></div>
              <div className="">
                <div className="card-body w-full ml-2">
                  {loading ? (
                    <div className="flex justify-center items-center h-64">
                      <LoaderStyle />
                    </div>
                  ) : (
                    <div className="card-body w-full ml-2">
                      <form className="space-y-6">
                        <div className="flex flex-col lg:flex-row gap-3">
                          <label className="font-semibold lg:w-[147px]">
                            Select Class{" "}
                            <span className="text-sm text-red-500">*</span>
                          </label>

                          <div className="w-[65%]">
                            <Select
                              options={allClasses.map((cls) => ({
                                value: cls.class_id,
                                label: cls.class_name,
                              }))}
                              value={
                                allClasses
                                  .filter(
                                    (cls) => cls.class_id === selectedClasses
                                  )
                                  .map((cls) => ({
                                    value: cls.class_id,
                                    label: cls.class_name,
                                  }))[0] || null
                              }
                              onChange={handleClassChange}
                              placeholder="Select"
                              className="basic-single"
                              classNamePrefix="select"
                              isSearchable
                              isClearable
                            />
                            {errors.classError && (
                              <p className="text-red-500 mt-1">
                                {errors.classError}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-3">
                          <label className="font-semibold lg:w-[147px]">
                            Select Subject{" "}
                            <span className="text-sm text-red-500">*</span>
                          </label>

                          <div className="w-[65%]">
                            <Select
                              options={allSubject.map((cls) => ({
                                value: cls.sm_id,
                                label: cls.name,
                              }))}
                              value={
                                allSubject
                                  .filter(
                                    (cls) => cls.sm_id === selectedSubject
                                  )
                                  .map((cls) => ({
                                    value: cls.sm_id,
                                    label: cls.name,
                                  }))[0] || null
                              }
                              onChange={handleSubjectChange}
                              placeholder="Select"
                              className="basic-single"
                              classNamePrefix="select"
                              isSearchable
                              isClearable
                            />
                            {errors.subjectError && (
                              <p className="text-red-500 mt-1">
                                {errors.subjectError}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-3">
                          <label className="font-semibold lg:w-[147px]">
                            Lesson No{" "}
                            <span className="text-sm text-red-500">*</span>
                          </label>

                          <div className="w-[65%]">
                            <input
                              type="text"
                              className="w-full border border-gray-400 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                              placeholder="Enter lesson number"
                              value={lessonNo}
                              // onChange={(e) => setLessonNo(e.target.value)}
                              onChange={handleLessonChange}
                              maxLength={3}
                              inputMode="numeric"
                              pattern="[0-9]*"
                            />

                            {errors.lessonNo && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.lessonNo}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-3">
                          <label className="font-semibold lg:w-[147px]">
                            Name <span className="text-sm text-red-500">*</span>
                          </label>

                          <div className="w-[65%]">
                            <input
                              type="text"
                              className="w-full border border-gray-400 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                              placeholder="Enter name"
                              value={name}
                              // onChange={(e) => setName(e.target.value)}
                              onChange={handleNameChange}
                              maxLength={100}
                            />

                            {errors.name && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.name}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-3">
                          <label className="font-semibold lg:w-[147px]">
                            Sub-Subject{" "}
                          </label>

                          <div className="w-[65%]">
                            <input
                              type="text"
                              className="w-full border border-gray-400 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                              placeholder="Enter sub-subject"
                              value={subSubject}
                              // onChange={(e) => setSubSubject(e.target.value)}
                              onChange={handleSubSubjectChange}
                              maxLength={50}
                            />

                            {errors.subSubject && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.subSubject}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        <div className="flex flex-col lg:flex-row gap-3">
                          <label className="font-semibold lg:w-[147px]">
                            Description{" "}
                          </label>

                          <div className="w-[65%]">
                            <textarea
                              className="w-full border border-gray-400 rounded-lg p-2 h-28 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                              placeholder="Enter description here..."
                              value={description}
                              // onChange={(e) => setDescription(e.target.value)}
                              onChange={handleDescriptionChange}
                              maxLength={500}
                            ></textarea>
                          </div>
                        </div>
                      </form>
                    </div>
                  )}
                </div>

                {!loading && (
                  <div className="flex flex-wrap justify-end gap-2 mr-2 mb-2">
                    <button
                      onClick={() => handleSubmitAdd(false)}
                      className="btn btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => handleSubmitAddPublish(true)}
                      className="btn btn-primary"
                      disabled={isPublishing}
                    >
                      {isPublishing ? "Publishing..." : "Save & Publish"}
                    </button>
                    <button
                      onClick={resetForm}
                      className="btn btn-danger bg-gray-500 text-white rounded-md hover:bg-gray-600"
                    // disabled={isSubmitting}
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
    </div>
  );
};

export default CreateChapter;
