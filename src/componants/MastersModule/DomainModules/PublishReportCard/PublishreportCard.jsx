// import { useState, useEffect, useMemo } from "react";
// import axios from "axios";
// import Select from "react-select";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { useNavigate } from "react-router-dom";
// import { RxCross1 } from "react-icons/rx";

// const PublishReportCard = () => {
//   const API_URL = import.meta.env.VITE_API_URL;
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [toDate, setToDate] = useState(null);
//   const [sessionData, setSessionData] = useState({});
//   const [fromDate, setFromDate] = useState(null);
//   const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
//   const [selectedClassId, setSelectedClassId] = useState(null);
//   const [selectedSectionId, setSelectedSectionId] = useState(null);
//   const [loadingForSearch, setLoadingForSearch] = useState(false);
//   const [loadingExams, setLoadingExams] = useState(false);
//   const [loading, setLoading] = useState(false); // 👈 used for class change loader

//   const [terms, setTerms] = useState([]);
//   const [termIds, setTermIds] = useState([]);
//   const navigate = useNavigate();
//   const [studentError, setStudentError] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [timetable, setTimetable] = useState([]);
//   const [publishStatus, setPublishStatus] = useState({}); // { termId: "Y"/"N" }
//   const [isReadyToRender, setIsReadyToRender] = useState(false);
//   const [initialLoading, setInitialLoading] = useState(true); // NEW

//   const pageSize = 10;
//   const [pageCount, setPageCount] = useState(0);
//   const [searchTerm, setSearchTerm] = useState("");
//   <ToastContainer
//     position="top-right"
//     autoClose={3000}
//     hideProgressBar={false}
//     newestOnTop={false}
//     closeOnClick
//     rtl={false}
//     pauseOnFocusLoss
//     draggable
//     pauseOnHover
//     theme="colored"
//   />;
//   useEffect(() => {
//     const init = async () => {
//       try {
//         await fetchTerms();
//         const regId = await fetchData();
//         if (regId) {
//           await fetchClasses(regId);
//         }
//       } catch (err) {
//         console.error("Error in init:", err);
//       } finally {
//         setInitialLoading(false); // ✅ mark done when everything is fetched
//       }
//     };

//     init();
//   }, []);

//   useEffect(() => {
//     if (selectedClassId && selectedSectionId && termIds.length > 0) {
//       console.log("useEffect triggered fetchPublishStatus");
//       fetchPublishStatus(selectedClassId, selectedSectionId)
//         .then(() => {
//           setIsReadyToRender(true);
//         })
//         .catch((e) =>
//           console.error("Error in useEffect fetchPublishStatus", e)
//         );
//     }
//   }, [selectedClassId, selectedSectionId, termIds]);

//   const fetchTerms = async () => {
//     try {
//       setLoadingExams(true);
//       const token = localStorage.getItem("authToken");

//       const response = await axios.get(`${API_URL}/api/get_Term`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const termData = response?.data || [];

//       // Set terms (full objects)
//       setTerms(termData);

//       // Set termIds (array of IDs)
//       const ids = termData.map((term) => term.term_id);
//       setTermIds(ids);

//       console.log("Terms:", termData);
//       console.log("Term IDs:", ids);
//     } catch (error) {
//       toast.error("Error fetching Terms");
//       console.error("Error fetching Terms:", error);
//     } finally {
//       setLoadingExams(false);
//     }
//   };

//   const fetchData = async () => {
//     const token = localStorage.getItem("authToken");

//     if (!token) {
//       console.error("No authentication token found");
//       navigate("/");
//       return null;
//     }

//     try {
//       const sessionResponse = await axios.get(`${API_URL}/api/sessionData`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const errorMsg = sessionResponse?.data?.message;
//       if (errorMsg === "Token has expired") {
//         localStorage.removeItem("authToken");
//         navigate("/");
//         return null;
//       }

//       setSessionData(sessionResponse.data);

//       const regId = sessionResponse?.data?.user?.reg_id;
//       return regId; // 👈 Return reg_id from here
//     } catch (error) {
//       const errorMsg = error.response?.data?.message;
//       if (errorMsg === "Token has expired") {
//         localStorage.removeItem("authToken");
//         navigate("/");
//       }
//       console.error("Error fetching data:", error);
//       return null;
//     }
//   };

//   const fetchClasses = async (teacherId) => {
//     try {
//       setLoadingExams(true);
//       const token = localStorage.getItem("authToken");

//       const response = await axios.get(
//         `${API_URL}/api/get_classes_of_classteacher?teacher_id=${teacherId}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       const classes = response?.data?.data || [];
//       setStudentNameWithClassId(classes);

//       if (classes.length > 0) {
//         const firstClass = {
//           value: classes[0].class_id,
//           section_id: classes[0].section_id,
//           label: `${classes[0].classname} ${classes[0].sectionname}`,
//         };

//         setSelectedStudent(firstClass);
//         setSelectedClassId(firstClass.value);
//         setSelectedSectionId(firstClass.section_id);

//         // ✅ Only fetch publish status after terms are loaded
//         if (termIds.length > 0) {
//           await fetchPublishStatus(firstClass.value, firstClass.section_id);
//           setIsReadyToRender(true); // ✅ Mark ready to render
//         }
//       }
//     } catch (error) {
//       toast.error("Error fetching Classes");
//       console.error("Error fetching Classes:", error);
//     } finally {
//       setLoadingExams(false);
//     }
//   };

//   const fetchPublishStatus = async (classId, sectionId) => {
//     console.log(
//       "fetchPublishStatus called with:",
//       classId,
//       sectionId,
//       "termIds:",
//       termIds
//     );
//     if (!classId || !sectionId || !termIds?.length) {
//       console.warn(
//         "Skipping fetchPublishStatus because missing class, section, or termIds"
//       );
//       return;
//     }
//     setLoading(true);
//     try {
//       const token = localStorage.getItem("authToken");
//       const results = {};
//       for (const termId of termIds) {
//         console.log("Fetching for termId:", termId);
//         const requests = termIds.map((termId) =>
//           axios
//             .get(`${API_URL}/api/get_hpcreportcardpublishvalue`, {
//               headers: { Authorization: `Bearer ${token}` },
//               params: {
//                 class_id: classId,
//                 section_id: sectionId,
//                 term_id: termId,
//               },
//             })
//             .then((res) => ({ termId, status: res?.data?.data || "N" }))
//         );

//         const responses = await Promise.all(requests);
//         const results = {};
//         responses.forEach(({ termId, status }) => {
//           results[termId] = status;
//         });
//         setPublishStatus(results);
//       }
//     } catch (error) {
//       toast.error("Failed to load publish statuses");
//       console.error("Error in fetchPublishStatus:", error);
//     } finally {
//       setLoading(false);
//       console.log(
//         "fetchPublishStatus done, loading => false, publishStatus:",
//         publishStatus
//       );
//     }
//   };

//   const handleStudentSelect = async (selectedOption) => {
//     setStudentError("");
//     setSelectedStudent(selectedOption);
//     setSelectedClassId(selectedOption?.value);
//     setSelectedSectionId(selectedOption?.section_id);

//     if (
//       selectedOption?.value &&
//       selectedOption?.section_id &&
//       termIds.length > 0
//     ) {
//       await fetchPublishStatus(
//         selectedOption?.value,
//         selectedOption?.section_id
//       );
//       console.log("In handleStudentSelect, setting isReadyToRender = true");
//       setIsReadyToRender(true);
//     }
//   };

//   const studentOptions = useMemo(
//     () =>
//       studentNameWithClassId?.map((cls) => ({
//         value: cls?.class_id,
//         section_id: cls?.section_id,
//         label: `${cls?.classname} ${cls?.sectionname}`,
//       })) || [],
//     [studentNameWithClassId]
//   );

//   const handlePublishToggle = async (classId, sectionId, termId) => {
//     if (!classId || !sectionId || !termId) return;

//     const token = localStorage.getItem("authToken");
//     const currentStatus = publishStatus[termId];
//     const newStatus = currentStatus === "Y" ? "N" : "Y";

//     // Update button loading state for this term
//     setPublishStatus((prev) => ({
//       ...prev,
//       [`loading_${termId}`]: true,
//     }));

//     try {
//       const formData = new FormData();
//       formData.append("term_id", termId);
//       formData.append("publish", newStatus);
//       formData.append("class_id", classId);
//       formData.append("section_id", sectionId);

//       const response = await axios.post(
//         `${API_URL}/api/save_hpcreportcardpublishvalue`,
//         formData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (response?.data?.success) {
//         setPublishStatus((prev) => ({
//           ...prev,
//           [termId]: newStatus,
//         }));

//         if (newStatus === "Y") {
//           toast.success("Holistic report card Published successfully.");
//         } else {
//           toast.success("Holistic report card Unpublished successfully.");
//         }
//       } else {
//         toast.error("Failed to update status.");
//       }
//     } catch (err) {
//       toast.error("Error saving publish status.");
//       console.error(err);
//     } finally {
//       // Remove loading state for this button
//       setPublishStatus((prev) => {
//         const updated = { ...prev };
//         delete updated[`loading_${termId}`];
//         return updated;
//       });
//     }
//   };

//   return (
//     <>
//       <div className="w-full md:w-[80%] mx-auto p-4 ">
//         <ToastContainer />
//         <div className="card p-2 rounded-md ">
//           <div className=" card-header mb-4 flex justify-between items-center ">
//             <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
//               Publish Report Card
//             </h5>
//             <RxCross1
//               className=" relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
//               onClick={() => {
//                 navigate("/dashboard");
//               }}
//             />
//           </div>
//           <div
//             className=" relative w-full   -top-6 h-1  mx-auto bg-red-700"
//             style={{
//               backgroundColor: "#C03078",
//             }}
//           ></div>

//           <>
//             <div className="bg-white border border-blue-400 rounded-md shadow-md overflow-x-auto">
//               {/* Header Row */}
//               <div className="grid grid-cols-[220px_repeat(auto-fit,minmax(150px,1fr))] border-b border-gray-200 px-4 py-2 bg-blue-50 text-sm font-semibold text-gray-800">
//                 <div className="flex justify-center items-center text-center">
//                   Select Class
//                 </div>

//                 {terms.map((term) => (
//                   <div
//                     key={term.term_id}
//                     className="flex justify-center items-center text-center"
//                   >
//                     {term.name}
//                   </div>
//                 ))}
//               </div>

//               {/* Body Row */}
//               <div className="grid grid-cols-[220px_repeat(auto-fit,minmax(150px,1fr))] px-4 py-4 items-center bg-white text-sm">
//                 {/* Select Dropdown */}
//                 <div className="max-w-xs">
//                   {initialLoading ? (
//                     <div className="text-blue-600 text-sm flex items-center gap-2 py-3 px-2">
//                       <svg
//                         className="animate-spin h-5 w-5"
//                         xmlns="http://www.w3.org/2000/svg"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                       >
//                         <circle
//                           className="opacity-25"
//                           cx="12"
//                           cy="12"
//                           r="10"
//                           stroke="currentColor"
//                           strokeWidth="4"
//                         ></circle>
//                         <path
//                           className="opacity-75"
//                           fill="currentColor"
//                           d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
//                         ></path>
//                       </svg>
//                       Loading data, please wait...
//                     </div>
//                   ) : (
//                     <>
//                       <Select
//                         value={selectedStudent}
//                         onChange={handleStudentSelect}
//                         options={studentOptions}
//                         placeholder="Select"
//                         isSearchable
//                         isClearable
//                         isDisabled={loadingExams}
//                         menuPortalTarget={document.body}
//                         menuPosition="fixed"
//                         className="text-sm"
//                         styles={{
//                           control: (base) => ({
//                             ...base,
//                             fontSize: ".9em",
//                             minHeight: "36px",
//                           }),
//                           menu: (base) => ({
//                             ...base,
//                             zIndex: 9999,
//                             fontSize: ".9em",
//                           }),
//                         }}
//                       />
//                       {studentError && (
//                         <p className="text-xs text-red-500 mt-1">
//                           {studentError}
//                         </p>
//                       )}
//                     </>
//                   )}
//                 </div>

//                 {/* Term Buttons */}
//                 {!isReadyToRender || loading ? (
//                   <div className="flex justify-center items-center h-full py-6">
//                     <svg
//                       className="animate-spin h-6 w-6 text-indigo-500 mr-2"
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                     >
//                       <circle
//                         className="opacity-25"
//                         cx="12"
//                         cy="12"
//                         r="10"
//                         stroke="currentColor"
//                         strokeWidth="4"
//                       ></circle>
//                       <path
//                         className="opacity-75"
//                         fill="currentColor"
//                         d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
//                       ></path>
//                     </svg>
//                     <span className="text-gray-600 text-sm font-medium animate-pulse">
//                       Fetching report card status for selected class and
//                       section...
//                     </span>
//                   </div>
//                 ) : (
//                   terms.map((term) => {
//                     const isPublished = publishStatus[term.term_id] === "Y";
//                     const isLoading = publishStatus[`loading_${term.term_id}`];

//                     return (
//                       <div key={term.term_id} className="text-center">
//                         <button
//                           onClick={() =>
//                             handlePublishToggle(
//                               selectedClassId,
//                               selectedSectionId,
//                               term.term_id
//                             )
//                           }
//                           disabled={isLoading || loadingExams}
//                           className={`w-[100px] px-3 py-1.5 rounded font-semibold text-white text-sm transition duration-200
//                   ${
//                     isPublished
//                       ? "bg-red-500 hover:bg-red-600"
//                       : "bg-green-500 hover:bg-green-600"
//                   }
//                   ${
//                     isLoading || loadingExams
//                       ? "opacity-50 cursor-not-allowed"
//                       : ""
//                   }
//                 `}
//                         >
//                           {isLoading ? (
//                             <span className="flex justify-center items-center gap-1">
//                               <svg
//                                 className="animate-spin h-4 w-4 text-white"
//                                 xmlns="http://www.w3.org/2000/svg"
//                                 fill="none"
//                                 viewBox="0 0 24 24"
//                               >
//                                 <circle
//                                   className="opacity-25"
//                                   cx="12"
//                                   cy="12"
//                                   r="10"
//                                   stroke="currentColor"
//                                   strokeWidth="4"
//                                 ></circle>
//                                 <path
//                                   className="opacity-75"
//                                   fill="currentColor"
//                                   d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
//                                 ></path>
//                               </svg>
//                               ...
//                             </span>
//                           ) : isPublished ? (
//                             "Unpublish"
//                           ) : (
//                             "Publish"
//                           )}
//                         </button>
//                       </div>
//                     );
//                   })
//                 )}
//               </div>
//             </div>
//           </>
//         </div>
//       </div>
//     </>
//   );
// };

// export default PublishReportCard;
// --------------------- UPDATED COMPLETE CODE -----------------------

// --------------------- FINAL UPDATED CODE WITH TOKEN -----------------------

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

  const [exams, setExams] = useState([]);
  const [publishStatus, setPublishStatus] = useState({});
  const [reopenDates, setReopenDates] = useState({});

  const [initialLoading, setInitialLoading] = useState(true);
  const [isReadyToRender, setIsReadyToRender] = useState(false);

  // ============================================================
  // 1) SESSION + CLASSES ON MOUNT
  // ============================================================

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

  // ============================================================
  // GET SESSION DATA WITH TOKEN
  // ============================================================

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

      return res?.data?.user?.reg_id;
    } catch (e) {
      navigate("/");
      return null;
    }
  };

  // ============================================================
  // FETCH TEACHER CLASSES
  // ============================================================

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
      };

      setSelectedStudent(dataObj);
      setSelectedClassId(f.class_id);
      setSelectedSectionId(f.section_id);

      fetchExams(f.class_id, f.section_id);
    }
  };

  // ============================================================
  // 2) FETCH EXAMS
  // ============================================================

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

    if (sectionId) fetchPublishStatus(classId, sectionId, examList);
  };

  // ============================================================
  // 3) FETCH PUBLISH STATUS FOR EACH EXAM
  // ============================================================

  const fetchPublishStatus = async (classId, sectionId, examList) => {
    const token = localStorage.getItem("authToken");

    let pub = {};
    let dates = {};

    for (const exam of examList) {
      const res = await axios.get(
        `${API_URL}/api/get_reportcard_publish_value`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            class_id: classId,
            section_id: sectionId,
            term_id: exam.exam_id,
          },
        }
      );

      const d = res?.data?.data;

      pub[exam.exam_id] = d?.publish || "N";
      dates[exam.exam_id] = d?.reopen_date || "";
    }

    setPublishStatus(pub);
    setReopenDates(dates);
    setIsReadyToRender(true);
  };

  // ============================================================
  // ON CLASS SELECT
  // ============================================================

  const handleStudentSelect = (opt) => {
    setSelectedStudent(opt);
    setSelectedClassId(opt.value);
    setSelectedSectionId(opt.section_id);

    fetchExams(opt.value, opt.section_id);
  };

  // ============================================================
  // 4) PUBLISH/UNPUBLISH TOGGLE
  // ============================================================

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

  // ============================================================
  // 5) SAVE REOPEN DATE
  // ============================================================

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
        <div className="bg-white shadow-md rounded-xl p-4 border border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-lg font-semibold text-gray-800">
              Publish Report Card
            </h1>

            <RxCross1
              className="text-2xl text-red-500  rounded cursor-pointer hover:bg-red-100 transition"
              onClick={() => navigate("/dashboard")}
            />
          </div>

          <div className="w-full h-1 bg-gradient-to-r from-pink-500 to-purple-600  rounded-sm"></div>

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
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PublishReportCard;
