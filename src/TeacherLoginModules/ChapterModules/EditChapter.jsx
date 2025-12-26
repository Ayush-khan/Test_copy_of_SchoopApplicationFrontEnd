import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { RxCross1 } from "react-icons/rx";
// import LoaderStyle from "../../../../common/LoaderFinal/LoaderStyle";
// import LoaderStyle from "../../componants/common/LoaderFinal/LoaderStyle.jsx";
import LoaderStyle from "../../componants/common/LoaderFinal/LoaderStyle";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const EditChapter = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const { state } = useLocation();
  const { id } = useParams();
  console.log("id", id);
  console.log("state", state);

  const [allClasses, setAllClasses] = useState([]);

  const [noticeDesc, setNoticeDesc] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
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

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);

  const [lessonNo, setLessonNo] = useState("");
  const [name, setName] = useState("");
  const [subSubject, setSubSubject] = useState("");
  const [selectedClasses, setSelectedClasses] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [allSubject, setAllSubject] = useState([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const token = localStorage.getItem("authToken");

        // 1️⃣ Fetch classes
        const classResp = await axios.get(`${API_URL}/api/getClassList`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const classes = classResp.data || [];
        setAllClasses(classes);

        // 2️⃣ Fetch chapter
        const chapterResp = await axios.get(
          `${API_URL}/api/get_chapter?chapter_id=${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = chapterResp.data.data[0];

        // Set selected class and subject IDs
        setSelectedClasses(data.class_id);
        setSelectedSubject(data.sm_id);
        // setSelectedClasses(data.class_name);
        // setSelectedSubject(data.sub_name);

        setLessonNo(data.chapter_no);
        setName(data.name || "");
        setDescription(data.description || "");
        setSubSubject(data.sub_subject);

        // 3️⃣ Fetch subjects for that class
        if (data.class_id) {
          const subjectResp = await axios.get(
            `${API_URL}/api/get_subjects_according_class?class_id=${data.class_id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setAllSubject(subjectResp.data.data || []);

          console.log("Subjects fetched:", subjectResp.data.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error fetching data");
      }
    };

    fetchAllData();
  }, [id]);

  useEffect(() => {
    fetchClassNames();
  }, []);

  const fetchClassNames = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${API_URL}/api/getClassList`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllClasses(response.data || []);
    } catch (error) {
      toast.error("Error fetching class names");
    } finally {
      setLoading(false); // Stop loader
    }
  };

  const getClassName = (id) => {
    if (!allClasses || allClasses.length === 0) return "";
    const cls = allClasses.find((c) => c.class_id === id);
    if (!cls) return ""; // safety
    // console.log("cls", cls); // log full object to check
    return cls.name; // use the correct property name
  };

  const getSubjectName = (id) => {
    if (!allSubject || allSubject.length === 0) return "";
    const sub = allSubject.find((c) => c.sm_id === id);
    if (!sub) return "";
    console.log("subject found", sub); // now it should log
    return sub.name; // make sure field name matches API
  };

  // const handleLessonChange = (e) => {
  //   const value = e.target.value;

  //   // Allow only numbers
  //   if (/^\d*$/.test(value)) {
  //     setLessonNo(value);

  //     if (value.trim() !== "") {
  //       setErrors((prev) => ({ ...prev, lessonNo: "" }));
  //     }
  //   }
  // };

  const handleLessonChange = (e) => {
    const value = e.target.value;

    if (/^\d*$/.test(value)) {
      setLessonNo(value); // keep string
      setErrors((prev) => ({ ...prev, lessonNo: "" }));
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

  const resetForm = () => {
    setLessonNo("");
    setName("");
    setSubSubject("");
    setDescription("");
  };

  const handleUpdate = async () => {
    const newErrors = {};
    let formHasErrors = false;

    if (!String(lessonNo).trim()) {
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
        `${API_URL}/api/update_chapters/${id}`,
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
        toast.success("Chapter updated successfully!");
        setTimeout(() => {
          resetForm();
          navigate("/chapters");
        }, 1000);
      } else {
        toast.error(data.message || "Failed to update chapter.");
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
                  Edit Chapter
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
                            <input
                              type="text"
                              value={getClassName(selectedClasses)}
                              readOnly
                              className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
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
                            <input
                              type="text"
                              value={getSubjectName(selectedSubject)}
                              readOnly
                              className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
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
                  <div className="flex space-x-2 justify-end mb-2 mr-2">
                    <button
                      onClick={handleUpdate}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-600 text-white rounded"
                    >
                      Update
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

      { }
    </div>
  );
};

export default EditChapter;
