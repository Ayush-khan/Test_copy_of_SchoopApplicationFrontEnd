import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";

const PublishReportCard = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);

  const [loadingPublish, setLoadingPublish] = useState({});
  const [loadingSave, setLoadingSave] = useState(false);

  const [selectedClassId, setSelectedClassId] = useState(null);
  const [selectedSectionId, setSelectedSectionId] = useState(null);

  const [terms, setTerms] = useState([]);
  const [termIds, setTermIds] = useState([]);

  const [exams, setExams] = useState([]);
  const [publishStatus, setPublishStatus] = useState({});
  const [reopenDates, setReopenDates] = useState({});
  const [academicyear, setAcademicyear] = useState(null);

  const [initialLoading, setInitialLoading] = useState(true);
  const [isReadyToRender, setIsReadyToRender] = useState(false);

  // 1) SESSION + CLASSES ON MOUNT

  useEffect(() => {
    const init = async () => {
      try {
        const regId = await fetchSession();
        if (regId) await fetchClasses(regId);
      } catch (err) {
        console.log(err);
      } finally {
        setInitialLoading(false);
      }
    };
    init();
  }, []);

  //  GET SESSION DATA WITH TOKEN

  const fetchSession = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      navigate("/");
      return null;
    }

    try {
      const res = await axios.get(`${API_URL}/api/sessionData`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const academic_yr = res?.data?.custom_claims?.academic_year;
      console.log("academic ye", academic_yr);
      setAcademicyear(academic_yr);
      console.log("academicyear state", academicyear);

      return res?.data?.user?.reg_id;
    } catch (e) {
      navigate("/");
      return null;
    }
  };

  // FETCH TEACHER CLASSES

  const fetchClasses = async (teacherId) => {
    const token = localStorage.getItem("authToken");

    const res = await axios.get(
      `${API_URL}/api/get_classes_of_classteacher?teacher_id=${teacherId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const classes = res?.data?.data || [];
    setStudentNameWithClassId(classes);

    if (classes.length > 0) {
      const f = classes[0];

      const dataObj = {
        value: f.class_id,
        section_id: f.section_id,
        label: `${f.classname} ${f.sectionname}`,
        classname: f.classname,
      };

      setSelectedStudent(dataObj);
      setSelectedClassId(f.class_id);
      setSelectedSectionId(f.section_id);

      if (["9", "10", "11", "12"].includes(f.classname)) {
        fetchExams(f.class_id, f.section_id);
      } else {
        fetchTerms(f.class_id, f.section_id);
      }
    }
  };

  const fetchExams = async (classId, sectionId) => {
    const token = localStorage.getItem("authToken");

    const res = await axios.get(
      `${API_URL}/api/get_exambyclassid?class_id=${classId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const examList = res?.data?.data || [];
    setExams(examList);

    if (sectionId) {
      fetchPublishStatus(classId, sectionId, examList);
    }
  };

  const fetchTerms = async (classId, sectionId) => {
    try {
      if (!classId || !sectionId) return;

      const token = localStorage.getItem("authToken");

      const response = await axios.get(`${API_URL}/api/get_Term`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const termData = response?.data || [];

      console.log("TERM DATA:", termData);
      console.log("classId:", classId, "sectionId:", sectionId);

      setTerms(termData);

      const ids = termData.map((t) => t.term_id);
      setTermIds(ids);

      if (termData.length > 0) {
        // ✅ PASS OBJECTS, NOT IDS
        fetchPublishStatus(classId, sectionId, termData);
      }
    } catch (error) {
      toast.error("Error fetching Terms");
      console.error("Error fetching Terms:", error);
    }
  };

  // 3) FETCH PUBLISH STATUS FOR EACH EXAM

  const fetchPublishStatus = async (classId, sectionId, list) => {
    const token = localStorage.getItem("authToken");

    let pub = {};
    let dates = {};

    for (const item of list) {
      const termId = item.exam_id ?? item.term_id;

      if (!termId) continue;

      console.log("Calling publish API with:", {
        classId,
        sectionId,
        termId,
      });

      const res = await axios.get(
        `${API_URL}/api/get_reportcard_publish_value`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            class_id: classId,
            section_id: sectionId,
            term_id: termId,
          },
        }
      );

      const d = res?.data?.data;

      pub[termId] = d?.publish || "N";
      dates[termId] = d?.reopen_date || "";
    }

    setPublishStatus(pub);
    setReopenDates(dates);
    setIsReadyToRender(true);
  };

  const handleStudentSelect = (opt) => {
    setSelectedStudent(opt);
    setSelectedClassId(opt.value);
    setSelectedSectionId(opt.section_id);

    if (["9", "10", "11", "12"].includes(opt.classname)) {
      fetchExams(opt.value, opt.section_id);
    } else {
      fetchTerms(opt.value, opt.section_id);
    }
  };

  //  4) PUBLISH/UNPUBLISH TOGGLE
  const togglePublish = async (examId) => {
    const token = localStorage.getItem("authToken");
    const newStatus = publishStatus[examId] === "Y" ? "N" : "Y";

    // Start Loader
    setLoadingPublish((prev) => ({ ...prev, [examId]: true }));

    try {
      const formData = new FormData();
      formData.append("class_id", selectedClassId);
      formData.append("section_id", selectedSectionId);
      formData.append("term_id", examId);
      formData.append("publish", newStatus);

      await axios.post(`${API_URL}/api/save_reportcardpublishvalue`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPublishStatus((prev) => ({ ...prev, [examId]: newStatus }));
      toast.success(newStatus === "Y" ? "Published" : "Unpublished");
    } finally {
      // Stop Loader
      setLoadingPublish((prev) => ({ ...prev, [examId]: false }));
    }
  };

  const saveReopenDate = async (examId) => {
    const token = localStorage.getItem("authToken");

    setLoadingSave(true); // start

    try {
      const formData = new FormData();
      formData.append("class_id", selectedClassId);
      formData.append("section_id", selectedSectionId);
      formData.append("reopen_date", reopenDates[examId]);

      await axios.post(`${API_URL}/api/save_reportcardreopendate`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Reopen date saved!");
    } finally {
      setLoadingSave(false); // stop
    }
  };

  const studentOptions = useMemo(
    () =>
      studentNameWithClassId.map((c) => ({
        value: c.class_id,
        section_id: c.section_id,
        label: `${c.classname} ${c.sectionname}`,
      })),
    [studentNameWithClassId]
  );

  return (
    <>
      <div className="w-full md:w-[80%] mx-auto p-4">
        <ToastContainer />

        {/* ---------- CARD HEADER ---------- */}
        <div className="border rounded-lg md:mx-auto md:w-[90%] p-4 bg-white mt-4 ">
          <div className=" card-header  flex justify-between items-center  ">
            <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
              Publish Report Card
            </h3>
            <RxCross1
              className="float-end relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
              onClick={() => {
                navigate("/dashboard");
              }}
            />
          </div>
          <div
            className=" relative  mb-8   h-1  mx-auto bg-red-700"
            style={{
              backgroundColor: "#C03078",
            }}
          ></div>

          {/* ---------- CLASS SELECT ---------- */}
          <div className="mt-4">
            <label className="text-gray-700 text-sm font-medium block text-center mb-1">
              Select Class <span className="text-red-500">*</span>
            </label>

            <div className="w-[20%] mx-auto">
              <Select
                value={selectedStudent}
                onChange={handleStudentSelect}
                options={studentOptions}
                placeholder="Select Class"
                className="shadow-sm"
              />
            </div>
          </div>

          {/* ---------- TABLE SECTION ---------- */}
          {isReadyToRender && (
            <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                    <th className="p-2 text-left">📘 Exam</th>
                    <th className="p-2 text-center">📢 Publish</th>
                    <th className="p-2 text-center">📅 Reopen</th>
                    <th className="p-2 text-center">💾 Save</th>
                  </tr>
                </thead>

                <tbody>
                  {exams.map((exam, index) => {
                    const isSecondExam = index === 1;

                    return (
                      <tr
                        key={exam.exam_id}
                        className={`transition-all duration-200 hover:bg-indigo-50 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        {/* Exam Name */}
                        <td className="p-3 font-medium text-gray-800">
                          <div className="flex items-center gap-2">
                            <span className="text-purple-500">📝</span>
                            {exam.name}
                          </div>
                        </td>

                        {/* Publish Button */}
                        <td className="p-3 text-center">
                          <button
                            disabled={loadingPublish[exam.exam_id]}
                            onClick={() => togglePublish(exam.exam_id)}
                            className={`
    px-4 py-1 rounded-md text-sm font-medium text-white
    transition-all shadow 
    ${
      publishStatus[exam.exam_id] === "Y"
        ? "bg-red-500 hover:bg-red-600"
        : "bg-green-600 hover:bg-green-700"
    }
    ${loadingPublish[exam.exam_id] ? "opacity-50 cursor-not-allowed" : ""}
  `}
                          >
                            {loadingPublish[exam.exam_id] ? (
                              <span className="flex items-center justify-center gap-1">
                                <svg
                                  className="animate-spin h-4 w-4 text-white"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                  ></path>
                                </svg>
                                Processing...
                              </span>
                            ) : publishStatus[exam.exam_id] === "Y" ? (
                              "Unpublish"
                            ) : (
                              "Publish"
                            )}
                          </button>
                        </td>

                        <td className="p-3 text-center">
                          {isSecondExam ? (
                            <div className="inline-block relative">
                              <input
                                type="date"
                                value={reopenDates[exam.exam_id]}
                                onChange={(e) =>
                                  setReopenDates((prev) => ({
                                    ...prev,
                                    [exam.exam_id]: e.target.value,
                                  }))
                                }
                                className="
          border border-gray-300 rounded-md px-3 py-1 
          text-xs w-36 bg-white
          focus:ring-2 focus:ring-purple-500 focus:border-purple-500 
          appearance-none
        "
                              />

                              {/* HIDE CLEAR BUTTON FOR ALL BROWSERS */}
                              <style>
                                {`
          input[type="date"]::-webkit-clear-button {
            display: none;
          }
          input[type="date"]::-webkit-inner-spin-button {
            display: none;
          }
          input[type="date"]::-webkit-calendar-picker-indicator {
            opacity: 1;
          }
        `}
                              </style>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>

                        {/* Save Button */}
                        <td className="p-3 text-center">
                          {isSecondExam ? (
                            <button
                              disabled={loadingSave}
                              onClick={() => saveReopenDate(exam.exam_id)}
                              className="
    bg-purple-600 hover:bg-purple-700 
    disabled:opacity-50 disabled:cursor-not-allowed
  
    px-4 py-1 rounded-md text-sm font-medium text-white
    transition-all shadow "
                            >
                              {loadingSave ? (
                                <span className="flex justify-center items-center gap-1">
                                  <svg
                                    className="animate-spin h-4 w-4 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                    ></path>
                                  </svg>
                                  Saving...
                                </span>
                              ) : (
                                "Save"
                              )}
                            </button>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                <tbody>
                  {terms.map((term, index) => {
                    const isSecondExam = index === 1;

                    return (
                      <tr
                        key={term.term_id}
                        className={`transition-all duration-200 hover:bg-indigo-50 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        {/* Exam Name */}
                        <td className="p-3 font-medium text-gray-800">
                          <div className="flex items-center gap-2">
                            <span className="text-purple-500">📝</span>
                            {term.name}
                          </div>
                        </td>

                        {/* Publish Button */}
                        <td className="p-3 text-center">
                          <button
                            disabled={loadingPublish[term.term_id]}
                            onClick={() => togglePublish(term.term_id)}
                            className={`
    px-4 py-1 rounded-md text-sm font-medium text-white
    transition-all shadow 
    ${
      publishStatus[term.term_id] === "Y"
        ? "bg-red-500 hover:bg-red-600"
        : "bg-green-600 hover:bg-green-700"
    }
    ${loadingPublish[term.term_id] ? "opacity-50 cursor-not-allowed" : ""}
  `}
                          >
                            {loadingPublish[term.term_id] ? (
                              <span className="flex items-center justify-center gap-1">
                                <svg
                                  className="animate-spin h-4 w-4 text-white"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                  ></path>
                                </svg>
                                Processing...
                              </span>
                            ) : publishStatus[term.term_id] === "Y" ? (
                              "Unpublish"
                            ) : (
                              "Publish"
                            )}
                          </button>
                        </td>

                        <td className="p-3 text-center">
                          {isSecondExam ? (
                            <div className="inline-block relative">
                              <input
                                type="date"
                                value={reopenDates[term.term_id]}
                                onChange={(e) =>
                                  setReopenDates((prev) => ({
                                    ...prev,
                                    [term.term_id]: e.target.value,
                                  }))
                                }
                                className="
          border border-gray-300 rounded-md px-3 py-1 
          text-xs w-36 bg-white
          focus:ring-2 focus:ring-purple-500 focus:border-purple-500 
          appearance-none
        "
                              />

                              {/* HIDE CLEAR BUTTON FOR ALL BROWSERS */}
                              <style>
                                {`
          input[type="date"]::-webkit-clear-button {
            display: none;
          }
          input[type="date"]::-webkit-inner-spin-button {
            display: none;
          }
          input[type="date"]::-webkit-calendar-picker-indicator {
            opacity: 1;
          }
        `}
                              </style>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>

                        {/* Save Button */}
                        <td className="p-3 text-center">
                          {isSecondExam ? (
                            <button
                              disabled={loadingSave}
                              onClick={() => saveReopenDate(term.term_id)}
                              className="
    bg-purple-600 hover:bg-purple-700 
    disabled:opacity-50 disabled:cursor-not-allowed
  
    px-4 py-1 rounded-md text-sm font-medium text-white
    transition-all shadow "
                            >
                              {loadingSave ? (
                                <span className="flex justify-center items-center gap-1">
                                  <svg
                                    className="animate-spin h-4 w-4 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                    ></path>
                                  </svg>
                                  Saving...
                                </span>
                              ) : (
                                "Save"
                              )}
                            </button>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PublishReportCard;
