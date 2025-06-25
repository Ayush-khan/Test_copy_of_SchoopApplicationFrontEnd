// import { useState, useEffect } from "react";
// import LoaderStyle from "../../common/LoaderFinal/LoaderStyle";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// export default function CommonTable({
//   periods,
//   subjects,
//   loading,
//   selectedSubjects,
//   handleTableData,
//   activeTab,
//   tabs,
//   rowCounts,
//   allocatedPeriods,
//   usedPeriods,
//   setUsedPeriods,
//   classSectionNames,
// }) {
//   const [localSelectedSubjects, setLocalSelectedSubjects] = useState({});
//   const [globalSubjectSelection, setGlobalSubjectSelection] = useState({});
//   // Mapping of class-section IDs to class-section names
//   // const classSectionMapping = {
//   //   455: "1-D",
//   //   458: "2-C",
//   //   462: "3-C",
//   //   465: "4-B",
//   //   471: "5-D",
//   //   473: "6-B",
//   //   474: "6-C",
//   //   476: "7-A",
//   //   479: "7-D",
//   //   482: "8-C",
//   //   483: "8-D",
//   //   485: "9-B",
//   //   488: "10-A",
//   //   490: "10-C",
//   //   492: "11-A",
//   //   452: "1-A",
//   //   453: "1-B",
//   //   454: "1-C",
//   //   456: "2-A",
//   //   457: "2-B",
//   //   459: "2-D",
//   //   460: "3-A",
//   //   461: "3-B",
//   //   463: "3-D",
//   //   464: "4-A",
//   //   466: "4-C",
//   //   467: "4-D",
//   //   468: "5-A",
//   //   469: "5-B",
//   //   470: "5-C",
//   //   472: "6-A",
//   //   475: "6-D",
//   //   477: "7-B",
//   //   478: "7-C",
//   //   480: "8-A",
//   //   487: "9-D",
//   //   484: "9-A",
//   //   489: "10-B",
//   //   491: "10-D",
//   //   493: "11-B",
//   //   494: "11-C",
//   //   495: "11-D",
//   //   496: "12-A",
//   //   497: "12-B",
//   //   498: "12-C",
//   //   499: "12-D",
//   // };
//   console.log("ClassSectionNames is---->", classSectionNames);
//   console.log("globalSubjectSelection", globalSubjectSelection);
//   const activeTabData = tabs.find((tab) => tab.id === activeTab);
//   const classId = activeTabData?.class_id;
//   const sectionId = activeTabData?.section_id;
//   console.log("activeTabData", activeTabData);
//   const key = `${classId}-${sectionId}`;

//   // Sync local selected subjects with global selected subjects when the active tab or selected subjects change
//   useEffect(() => {
//     if (selectedSubjects[key]) {
//       setLocalSelectedSubjects(selectedSubjects[key]);
//     } else {
//       setLocalSelectedSubjects({});
//     }
//   }, [selectedSubjects, key]);

//   // Update global subject selection when local selections change
//   useEffect(() => {
//     if (Object.keys(localSelectedSubjects).length) {
//       setGlobalSubjectSelection((prevState) => ({
//         ...prevState,
//         [key]: localSelectedSubjects,
//       }));
//     }
//   }, [localSelectedSubjects, key]);

//   // Check if a subject is already selected in another section for the same period and day
//   // Check if a subject is already selected in another section for the same period and day
//   const isAnySubjectAlreadySelectedInOtherSection = (day, period_no) => {
//     for (const sectionKey in globalSubjectSelection) {
//       if (sectionKey === key) continue; // Skip current section
//       const sectionData = globalSubjectSelection[sectionKey];
//       const selectedSubject = sectionData[day]?.[period_no];
//       // Allow changes only if the ID is not empty in the other section
//       if (selectedSubject?.id && selectedSubject.id !== "") {
//         return true; // Subject already selected in another section
//       }
//     }
//     return false;
//   };

//   // Handle subject selection or deselection
//   const handleSubjectChange = (day, period_no, selectedSubject) => {
//     if (!classId || !sectionId) return;
//     const currentSelectedSubject = localSelectedSubjects?.[day]?.[period_no];

//     // If subject is selected in another section, prevent selection
//     if (
//       selectedSubject.id &&
//       isAnySubjectAlreadySelectedInOtherSection(day, period_no)
//     ) {
//       // Find the class and section that already has the subject selected
//       let conflictingClassSection = "";
//       for (const sectionKey in globalSubjectSelection) {
//         if (sectionKey === key) continue; // Skip current section
//         const sectionData = globalSubjectSelection[sectionKey];
//         const selectedSubjectInOtherSection = sectionData[day]?.[period_no];
//         if (selectedSubjectInOtherSection?.id) {
//           // Extract class and section info from the sectionKey (formatted as "classId-sectionId")
//           const [conflictingClassId, conflictingSectionId] =
//             sectionKey.split("-");
//           const classSectionName = classSectionNames[conflictingSectionId]; // Map to class-section name
//           conflictingClassSection = `${classSectionName}`;
//           break;
//         }
//       }

//       // Show toast message with the conflicting class-section name
//       toast.error(
//         <div>
//           <span>
//             <strong style={{ color: "#e74c3c" }}>
//               Subject already selected in another section (
//               {conflictingClassSection})
//             </strong>
//           </span>
//           <br />
//           <span style={{ color: "#2980b9" }}>
//             for {day}, Period {period_no}.
//           </span>
//         </div>,
//         {
//           position: "top-right", // You can adjust the position here
//           autoClose: 5000, // Toast duration
//           hideProgressBar: true,
//           closeOnClick: true,
//           pauseOnHover: true,
//           draggable: true,
//           progress: undefined,
//         }
//       );

//       return; // Prevent the subject selection
//     }

//     // Handle subject change (select or swap subjects)
//     const updatedSubjects = {
//       ...localSelectedSubjects,
//       [day]: {
//         ...(localSelectedSubjects[day] || {}),
//         [period_no]: selectedSubject.id
//           ? { id: selectedSubject.id, name: selectedSubject.name }
//           : null, // Clear subject if deselected
//       },
//     };

//     // Update used periods count (when deselecting or selecting a subject)
//     if (selectedSubject.id) {
//       // New subject selected
//       if (!currentSelectedSubject || currentSelectedSubject.id === "") {
//         setUsedPeriods((prev) => (prev < allocatedPeriods ? prev + 1 : prev));
//       }
//     } else {
//       // Subject cleared
//       if (currentSelectedSubject) {
//         setUsedPeriods((prev) => (prev > 0 ? prev - 1 : 0));
//       }
//     }

//     // Update both local and global selections
//     setLocalSelectedSubjects(updatedSubjects);
//     setGlobalSubjectSelection((prevState) => ({
//       ...prevState,
//       [key]: updatedSubjects[day],
//     }));

//     // Call the handleTableData to persist the change
//     handleTableData(classId, sectionId, day, period_no, selectedSubject);
//   };

//   const renderRows = (days) => {
//     const rows = [];
//     const maxRows = Math.max(rowCounts.mon_fri, rowCounts.sat);

//     for (let rowIndex = 0; rowIndex < maxRows; rowIndex++) {
//       rows.push(
//         <tr key={`row-${rowIndex}`}>
//           {/* Periods Column */}
//           <td className="border p-2 text-center bg-gray-100 w-16">
//             {rowIndex + 1}
//           </td>

//           {days.map((day) => {
//             if (day === "Saturday" && rowIndex >= rowCounts.sat) {
//               return <td key={day} className="border p-2"></td>;
//             }

//             const selectedPeriod = localSelectedSubjects?.[day]?.[rowIndex + 1];
//             const periodData = periods.find(
//               (period) =>
//                 period.day === day && period.period_no === rowIndex + 1
//             );

//             const subjectName = periodData ? periodData.subject_id : " ";
//             const teacherName = periodData ? periodData.teachers : " ";

//             // Handle subject selection
//             const handleSubjectSelection = (e) => {
//               const selectedSub = {
//                 id: e.target.value,
//                 name:
//                   subjects.find((s) => s.id === e.target.value)?.subjectname ||
//                   "",
//               };

//               handleSubjectChange(day, rowIndex + 1, selectedSub);
//             };

//             // Determine if the background should be highlighted (for selected subjects in other class-sections)
//             const isSelectedInOtherSection =
//               isAnySubjectAlreadySelectedInOtherSection(day, rowIndex + 1);
//             const highlightClass =
//               selectedPeriod?.id === ""
//                 ? "" // No highlight if the ID is empty
//                 : isSelectedInOtherSection
//                 ? "bg-pink-100"
//                 : "";

//             return (
//               <td key={day} className="border p-2">
//                 <div className="flex text-center flex-col w-full text-sm text-gray-600">
//                   {subjectName && teacherName ? (
//                     <>
//                       <div className="mb-1">
//                         <span className="break-words text-xs font-medium">
//                           {subjectName}
//                         </span>
//                       </div>

//                       <div>
//                         <span className="break-words text-pink-600 font-medium text-xs">
//                           {teacherName}
//                         </span>
//                       </div>
//                     </>
//                   ) : null}
//                 </div>

//                 {/* Subject Dropdown */}
//                 <select
//                   className={`border p-1 w-full mt-2 ${highlightClass}`}
//                   value={selectedPeriod?.id || ""}
//                   onChange={handleSubjectSelection}
//                   disabled={
//                     usedPeriods >= allocatedPeriods && !selectedPeriod?.id
//                   } // Disable if used periods match allocated periods and subject is not already selected
//                 >
//                   <option value="">Select</option>
//                   {subjects.map((subject) => (
//                     <option key={subject.subject_id} value={subject.sm_id}>
//                       {subject.subjectname}
//                     </option>
//                   ))}
//                 </select>
//               </td>
//             );
//           })}
//         </tr>
//       );
//     }
//     return rows;
//   };

//   const daysForTable = [
//     "Monday",
//     "Tuesday",
//     "Wednesday",
//     "Thursday",
//     "Friday",
//     ...(rowCounts.sat > 0 ? ["Saturday"] : []),
//   ];

//   const renderTable = () => {
//     if (!periods?.length || !subjects.length || !rowCounts?.mon_fri) {
//       return (
//         <div className="flex w-[100%]  text-center  justify-center mt-14 flex-col items-center space-y-2">
//           <span className="text-4xl animate-bounce">⚠️</span>
//           <p className="text-xl font-medium text-red-700 tracking-wide drop-shadow-md">
//             Oops! No data found..
//           </p>
//         </div>
//       );
//     }
//     return (
//       <table className="table-auto w-full border-collapse border border-gray-300">
//         <thead>
//           <tr className="bg-gray-200 text-gray-600">
//             <th className="border p-2 text-center">Periods</th>
//             {daysForTable.map((day, daykey) => (
//               <th key={daykey} className="border p-2 text-center">
//                 {day}
//               </th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>{renderRows(daysForTable)}</tbody>
//       </table>
//     );
//   };

//   return (
//     <div className="overflow-x-auto">
//       {loading ? (
//         <div className="mt-24 border-1 border-white flex justify-center items-center p-5 ">
//           <LoaderStyle />
//         </div>
//       ) : (
//         renderTable()
//       )}
//       <ToastContainer />
//     </div>
//   );
// }
// dfs
// Test for pop up override or not
// This code working well but when user delect subject then pass subject_id and name null
// import { useState, useEffect } from "react";
// import LoaderStyle from "../../common/LoaderFinal/LoaderStyle";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// export default function CommonTable({
//   periods,
//   subjects,
//   loading,
//   selectedSubjects,
//   handleTableData,
//   activeTab,
//   tabs,
//   rowCounts,
//   allocatedPeriods,
//   usedPeriods,
//   setUsedPeriods,
//   classSectionNames,
//   onOverrideChange,
// }) {
//   const [localSelectedSubjects, setLocalSelectedSubjects] = useState({});
//   const [globalSubjectSelection, setGlobalSubjectSelection] = useState({});

//   const showOverrideConfirmToast = (day, period_no, selectedSub) => {
//     toast.info(
//       <div>
//         <p>
//           Subject already assigned for <b>{day}</b>, Period <b>{period_no}</b>.
//           Do you want to override?
//         </p>
//         <div style={{ marginTop: 10 }}>
//           <button
//             onClick={() => {
//               toast.dismiss();
//               onOverrideChange?.(day, period_no, "Y");
//               applySubjectChange(day, period_no, selectedSub);
//             }}
//             style={{
//               marginRight: 10,
//               backgroundColor: "green",
//               color: "white",
//               padding: "5px 10px",
//               border: "none",
//               borderRadius: 3,
//               cursor: "pointer",
//             }}
//           >
//             Override
//           </button>
//           <button
//             onClick={() => {
//               toast.dismiss();
//               onOverrideChange?.(day, period_no, "N");
//               applySubjectChange(day, period_no, selectedSub); // ✅ Select even on Cancel
//             }}
//             style={{
//               backgroundColor: "red",
//               color: "white",
//               padding: "5px 10px",
//               border: "none",
//               borderRadius: 3,
//               cursor: "pointer",
//             }}
//           >
//             Cancel
//           </button>
//         </div>
//       </div>,
//       {
//         position: "top-center",
//         autoClose: false,
//         closeOnClick: false,
//         closeButton: false,
//         draggable: false,
//         pauseOnHover: true,
//       }
//     );
//   };

//   const activeTabData = tabs.find((tab) => tab.id === activeTab);
//   const classId = activeTabData?.class_id;
//   const sectionId = activeTabData?.section_id;
//   const key = `${classId}-${sectionId}`;

//   // Sync local & global selections
//   useEffect(() => {
//     setLocalSelectedSubjects(selectedSubjects[key] || {});
//   }, [selectedSubjects, key]);

//   useEffect(() => {
//     if (Object.keys(localSelectedSubjects).length) {
//       setGlobalSubjectSelection((prev) => ({
//         ...prev,
//         [key]: localSelectedSubjects,
//       }));
//     }
//   }, [localSelectedSubjects, key]);

//   const applySubjectChange = (day, period_no, selectedSubject) => {
//     const cur = localSelectedSubjects?.[day]?.[period_no];

//     const updated = {
//       ...localSelectedSubjects,
//       [day]: {
//         ...localSelectedSubjects[day],
//         [period_no]: selectedSubject
//           ? { id: selectedSubject.id, name: selectedSubject.name }
//           : null,
//       },
//     };

//     // ✅ Used periods logic
//     setUsedPeriods((prev) =>
//       selectedSubject ? (cur ? prev : prev + 1) : cur ? prev - 1 : prev
//     );

//     setLocalSelectedSubjects(updated);
//     setGlobalSubjectSelection((prev) => ({ ...prev, [key]: updated[day] }));
//     handleTableData(classId, sectionId, day, period_no, selectedSubject);
//   };

//   const handleSubjectChange = (day, period_no, selectedSubject) => {
//     if (!classId || !sectionId) return;

//     const current = localSelectedSubjects?.[day]?.[period_no];

//     // ✅ Step 1: Deselect handling
//     if (!selectedSubject.id) {
//       onOverrideChange?.(day, period_no, "N");
//       applySubjectChange(day, period_no, null); // Clean removal
//       return;
//     }

//     // ✅ Step 2: Check other sections
//     const inOther = Object.entries(globalSubjectSelection).some(
//       ([sec, data]) => sec !== key && data?.[day]?.[period_no]?.id
//     );
//     if (selectedSubject.id && inOther) {
//       const conflictKey = Object.keys(globalSubjectSelection).find(
//         (sec) =>
//           sec !== key && globalSubjectSelection[sec]?.[day]?.[period_no]?.id
//       );
//       const confSecName = conflictKey
//         ? classSectionNames[conflictKey.split("-")[1]]
//         : "another section";

//       toast.error(
//         <div>
//           <strong style={{ color: "#e74c3c" }}>
//             Subject already selected in another section ({confSecName})
//           </strong>
//           <br />
//           <span style={{ color: "#2980b9" }}>
//             for {day}, Period {period_no}.
//           </span>
//         </div>,
//         { position: "top-right", autoClose: 5000 }
//       );
//       return;
//     }

//     // ✅ Step 3: Same-section override check
//     const assignedName =
//       periods.find((p) => p.day === day && p.period_no === period_no)
//         ?.subject_id || "";
//     const assignedTeacher =
//       periods.find((p) => p.day === day && p.period_no === period_no)
//         ?.teachers || "";

//     if (assignedName.trim() && assignedTeacher.trim() && selectedSubject.id) {
//       showOverrideConfirmToast(day, period_no, selectedSubject);
//       return;
//     }

//     // ✅ Step 4: Normal apply
//     onOverrideChange?.(day, period_no, selectedSubject.id ? "Y" : "N");
//     applySubjectChange(day, period_no, selectedSubject);
//   };

//   const renderRows = (days) => {
//     const rows = [];
//     const maxRows = Math.max(rowCounts.mon_fri, rowCounts.sat);
//     for (let r = 0; r < maxRows; r++) {
//       rows.push(
//         <tr key={r}>
//           <td className="border p-2 bg-gray-100 text-center w-16">{r + 1}</td>
//           {days.map((day) => {
//             const sel = localSelectedSubjects[day]?.[r + 1];
//             const periodData =
//               periods.find((p) => p.day === day && p.period_no === r + 1) || {};
//             const subjectName = periodData.subject_id || "";
//             const teacherName = periodData.teachers || "";

//             const onChange = (e) => {
//               const val = e.target.value;
//               const sub = {
//                 id: val,
//                 name: subjects.find((s) => s.sm_id === val)?.subjectname || "",
//               };
//               handleSubjectChange(day, r + 1, sub);
//             };

//             const highlight = (isAny) => (isAny ? "bg-pink-100" : "");
//             const inOther = Object.entries(globalSubjectSelection).some(
//               ([sec, data]) => sec !== key && data?.[day]?.[r + 1]?.id
//             );

//             return (
//               <td key={day} className="border p-2">
//                 <div className="text-center text-xs text-gray-600">
//                   {subjectName && teacherName && (
//                     <>
//                       <div className="font-medium">{subjectName}</div>
//                       <div className="text-pink-600">{teacherName}</div>
//                     </>
//                   )}
//                 </div>
//                 <select
//                   value={sel?.id || ""}
//                   onChange={onChange}
//                   className={`border p-1 w-full mt-2 ${highlight(inOther)}`}
//                   disabled={usedPeriods >= allocatedPeriods && !sel?.id}
//                 >
//                   <option value="">Select</option>
//                   {subjects.map((s) => (
//                     <option key={s.subject_id} value={s.sm_id}>
//                       {s.subjectname}
//                     </option>
//                   ))}
//                 </select>
//               </td>
//             );
//           })}
//         </tr>
//       );
//     }
//     return rows;
//   };

//   const daysForTable = [
//     "Monday",
//     "Tuesday",
//     "Wednesday",
//     "Thursday",
//     "Friday",
//     ...(rowCounts.sat ? ["Saturday"] : []),
//   ];

//   return (
//     <div className="overflow-x-auto">
//       {loading ? (
//         <div className="flex justify-center items-center p-5">
//           <LoaderStyle />
//         </div>
//       ) : (
//         <table className="w-full table-auto border-collapse border border-gray-300">
//           <thead>
//             <tr className="bg-gray-200 text-gray-600">
//               <th className="border p-2">Periods</th>
//               {daysForTable.map((d, i) => (
//                 <th key={i} className="border p-2">
//                   {d}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>{renderRows(daysForTable)}</tbody>
//         </table>
//       )}
//       <ToastContainer />
//     </div>
//   );
// }

// This code working well but when user delect subject then pass subject_id and name empty
// import { useState, useEffect } from "react";
// import LoaderStyle from "../../common/LoaderFinal/LoaderStyle";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// export default function CommonTable({
//   periods,
//   subjects,
//   loading,
//   selectedSubjects,
//   handleTableData,
//   activeTab,
//   tabs,
//   rowCounts,
//   allocatedPeriods,
//   usedPeriods,
//   setUsedPeriods,
//   classSectionNames,
//   onOverrideChange,
// }) {

//   const [localSelectedSubjects, setLocalSelectedSubjects] = useState({});
//   const [globalSubjectSelection, setGlobalSubjectSelection] = useState({});
//   // const showOverrideConfirmToast = (day, period_no, selectedSub) => {
//   //   toast.info(
//   //     <div>

//   //       <p>
//   //         <b>Subject is already allotted for this period.</b>
//   //         <br />
//   //         Do you want to:
//   //       </p>

//   //       <div style={{ marginTop: 10 }}>
//   //         <button
//   //           onClick={() => {
//   //             toast.dismiss();
//   //             onOverrideChange?.(day, period_no, "Y");
//   //             applySubjectChange(day, period_no, selectedSub);
//   //           }}
//   //           style={{
//   //             marginRight: 10,
//   //             backgroundColor: "green",
//   //             color: "white",
//   //             padding: "5px 10px",
//   //             border: "none",
//   //             borderRadius: 3,
//   //             cursor: "pointer",
//   //           }}
//   //         >
//   //           Add more subjects
//   //         </button>
//   //         <button
//   //           onClick={() => {
//   //             toast.dismiss();
//   //             onOverrideChange?.(day, period_no, "N");
//   //             applySubjectChange(day, period_no, selectedSub); // ✅ Select even on Cancel
//   //           }}
//   //           style={{
//   //             backgroundColor: "red",
//   //             color: "white",
//   //             padding: "5px 10px",
//   //             border: "none",
//   //             borderRadius: 3,
//   //             cursor: "pointer",
//   //           }}
//   //         >
//   //           Overwrite existing subject
//   //         </button>
//   //       </div>
//   //     </div>,
//   //     {
//   //       position: "top-center",
//   //       autoClose: false,
//   //       closeOnClick: false,
//   //       closeButton: false,
//   //       draggable: false,
//   //       pauseOnHover: true,
//   //     }
//   //   );
//   // };
//   const showOverrideConfirmToast = (day, period_no, selectedSub) => {
//     toast.info(
//       <div
//         style={{
//           maxWidth: "600px",
//           width: "100%",
//           padding: "20px",
//           fontFamily: "'Segoe UI', sans-serif",
//           borderRadius: "8px",
//           boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
//           backgroundColor: "#fff",
//           textAlign: "center",
//           margin: "0 auto",
//         }}
//       >
//         <p
//           style={{ fontSize: "0.95em", marginBottom: "16px", color: "#1f2937" }}
//         >
//           <strong>Subject is already allotted for this period.</strong>
//           <br />
//           What would you like to do?
//         </p>

//         <div
//           style={{
//             display: "flex",
//             justifyContent: "center",
//             gap: "8px",

//             flexWrap: "wrap",
//           }}
//         >
//           <button
//             onClick={() => {
//               toast.dismiss();
//               onOverrideChange?.(day, period_no, "Y");
//               applySubjectChange(day, period_no, selectedSub);
//             }}
//             style={{
//               backgroundColor: "#16a34a",
//               color: "#fff",
//               padding: "10px 16px",
//               fontSize: "0.8em",
//               fontWeight: 500,
//               border: "none",
//               borderRadius: "6px",
//               cursor: "pointer",
//               transition: "background 0.2s",
//             }}
//             onMouseOver={(e) => (e.target.style.backgroundColor = "#15803d")}
//             onMouseOut={(e) => (e.target.style.backgroundColor = "#16a34a")}
//           >
//             ➕ Add more subjects
//           </button>

//           <button
//             onClick={() => {
//               toast.dismiss();
//               onOverrideChange?.(day, period_no, "N");
//               applySubjectChange(day, period_no, selectedSub);
//             }}
//             style={{
//               backgroundColor: "#dc2626",
//               color: "#fff",
//               padding: "10px 16px",
//               fontSize: "0.8em",
//               fontWeight: 500,
//               border: "none",
//               borderRadius: "6px",
//               cursor: "pointer",
//               transition: "background 0.2s",
//             }}
//             onMouseOver={(e) => (e.target.style.backgroundColor = "#b91c1c")}
//             onMouseOut={(e) => (e.target.style.backgroundColor = "#dc2626")}
//           >
//             🗑 Overwrite existing subject
//           </button>
//         </div>
//       </div>,
//       {
//         position: "top-center",
//         autoClose: false,
//         closeOnClick: false,
//         closeButton: false,
//         draggable: false,
//         pauseOnHover: true,
//         style: {
//           background: "transparent", // ensures no box is added around
//           boxShadow: "none",
//         },
//       }
//     );
//   };

//   const activeTabData = tabs.find((tab) => tab.id === activeTab);
//   const classId = activeTabData?.class_id;
//   const sectionId = activeTabData?.section_id;
//   const key = `${classId}-${sectionId}`;

//   // Sync local & global selections
//   useEffect(() => {
//     setLocalSelectedSubjects(selectedSubjects[key] || {});
//   }, [selectedSubjects, key]);

//   useEffect(() => {
//     if (Object.keys(localSelectedSubjects).length) {
//       setGlobalSubjectSelection((prev) => ({
//         ...prev,
//         [key]: localSelectedSubjects,
//       }));
//     }
//   }, [localSelectedSubjects, key]);

//   const applySubjectChange = (day, period_no, selectedSubject) => {
//     const cur = localSelectedSubjects?.[day]?.[period_no];
//     const updated = {
//       ...localSelectedSubjects,
//       [day]: {
//         ...localSelectedSubjects[day],
//         [period_no]: selectedSubject.id
//           ? { id: selectedSubject.id, name: selectedSubject.name }
//           : null,
//       },
//     };

//     setUsedPeriods((prev) =>
//       selectedSubject.id ? (cur ? prev : prev + 1) : cur ? prev - 1 : prev
//     );

//     setLocalSelectedSubjects(updated);
//     setGlobalSubjectSelection((prev) => ({ ...prev, [key]: updated[day] }));
//     handleTableData(classId, sectionId, day, period_no, selectedSubject);
//   };

//   const handleSubjectChange = (day, period_no, selectedSubject) => {
//     if (!classId || !sectionId) return;

//     const current = localSelectedSubjects?.[day]?.[period_no];

//     // STEP 1: Check another section
//     const inOther = Object.entries(globalSubjectSelection).some(
//       ([sec, data]) => {
//         return sec !== key && data?.[day]?.[period_no]?.id;
//       }
//     );
//     if (selectedSubject.id && inOther) {
//       const conflictKey = Object.keys(globalSubjectSelection).find(
//         (sec) =>
//           sec !== key && globalSubjectSelection[sec]?.[day]?.[period_no]?.id
//       );
//       const confSecName = conflictKey
//         ? classSectionNames[conflictKey.split("-")[1]]
//         : "another section";
//       toast.error(
//         <div>
//           <strong style={{ color: "#e74c3c" }}>
//             Subject already selected in another section ({confSecName})
//           </strong>
//           <br />
//           <span style={{ color: "#2980b9" }}>
//             for {day}, Period {period_no}.
//           </span>
//         </div>,
//         { position: "top-right", autoClose: 5000 }
//       );
//       return; // Block here
//     }

//     // STEP 2: Same-section override logic
//     const assignedName =
//       periods.find((p) => p.day === day && p.period_no === period_no)
//         ?.subject_id || "";
//     const assignedTeacher =
//       periods.find((p) => p.day === day && p.period_no === period_no)
//         ?.teachers || "";
//     const rowHasAssignment = assignedName.trim() && assignedTeacher.trim();

//     if (rowHasAssignment && selectedSubject.id) {
//       showOverrideConfirmToast(day, period_no, selectedSubject);
//       return; // Wait for user decision
//     }

//     // STEP 3: Normal apply
//     onOverrideChange?.(day, period_no, selectedSubject.id ? "Y" : "N");
//     applySubjectChange(day, period_no, selectedSubject);
//   };

//   // const renderRows = (days) => {
//   //   const rows = [];
//   //   const maxRows = Math.max(rowCounts.mon_fri, rowCounts.sat);
//   //   for (let r = 0; r < maxRows; r++) {
//   //     rows.push(
//   //       <tr key={r}>
//   //         <td className="border p-2 bg-gray-100 text-center w-16">{r + 1}</td>
//   //         {days.map((day) => {
//   //           const sel = localSelectedSubjects[day]?.[r + 1];
//   //           const periodData =
//   //             periods.find((p) => p.day === day && p.period_no === r + 1) || {};
//   //           const subjectName = periodData.subject_id || "";
//   //           const teacherName = periodData.teachers || "";

//   //           const onChange = (e) => {
//   //             const val = e.target.value;
//   //             const sub = {
//   //               id: val,
//   //               name: subjects.find((s) => s.sm_id === val)?.subjectname || "",
//   //             };
//   //             handleSubjectChange(day, r + 1, sub);
//   //           };

//   //           const highlight = (isAny) => (isAny ? "bg-pink-100" : "");
//   //           const inOther = Object.entries(globalSubjectSelection).some(
//   //             ([sec, data]) => sec !== key && data?.[day]?.[r + 1]?.id
//   //           );

//   //           return (
//   //             <td key={day} className="border p-2">
//   //               {/* <div className="text-center text-[.6em] text-gray-600 text-wrap">
//   //                 {subjectName && teacherName && (
//   //                   <>
//   //                     <div className="font-medium">
//   //                       {subjectName}
//   //                     </div>
//   //                     <div className="text-pink-600">
//   //                       {teacherName}
//   //                     </div>
//   //                   </>
//   //                 )}
//   //               </div> */}
//   //               <div className="text-center text-[.6em] text-gray-600">
//   //                 <div className="font-medium">
//   //                   <span className="text-pink-600">Mr. Sharma</span>{" "}
//   //                   <span className="text-black">(Mathematics)</span>
//   //                 </div>
//   //                 <div className="font-medium">
//   //                   <span className="text-pink-600">Ms. Verma</span>{" "}
//   //                   <span className="text-black">(Science)</span>
//   //                 </div>
//   //                 <div className="font-medium">
//   //                   <span className="text-pink-600">Dr. Khan</span>{" "}
//   //                   <span className="text-black">(History)</span>
//   //                 </div>
//   //                 <div className="font-medium">
//   //                   <span className="text-pink-600">Mrs. D'Souza</span>{" "}
//   //                   <span className="text-black">(English)</span>
//   //                 </div>
//   //               </div>

//   //               <select
//   //                 value={sel?.id || ""}
//   //                 onChange={onChange}
//   //                 className={`border p-1 w-full mt-2 ${highlight(inOther)}`}
//   //                 disabled={usedPeriods >= allocatedPeriods && !sel?.id}
//   //               >
//   //                 <option value="">Select</option>
//   //                 {subjects.map((s) => (
//   //                   <option key={s.subject_id} value={s.sm_id}>
//   //                     {s.subjectname}
//   //                   </option>
//   //                 ))}
//   //               </select>
//   //             </td>
//   //           );
//   //         })}
//   //       </tr>
//   //     );
//   //   }
//   //   return rows;
//   // };

//   const renderRows = (days) => {
//     const rows = [];
//     const maxRows = Math.max(rowCounts.mon_fri, rowCounts.sat);

//     for (let r = 0; r < maxRows; r++) {
//       rows.push(
//         <tr key={r}>
//           <td className="border p-2 bg-gray-100 text-center w-16">{r + 1}</td>

//           {days.map((day) => {
//             // 👉 Skip rendering for Saturday if period exceeds allowed
//             if (day === "Saturday" && r >= rowCounts.sat) {
//               return <td key={day} className="border p-2 bg-gray-50"></td>;
//             }

//             // 👉 Skip rendering for Mon–Fri if period exceeds allowed
//             if (day !== "Saturday" && r >= rowCounts.mon_fri) {
//               return <td key={day} className="border p-2 bg-gray-50"></td>;
//             }

//             const sel = localSelectedSubjects[day]?.[r + 1];
//             const periodData =
//               periods.find((p) => p.day === day && p.period_no === r + 1) || {};
//             const subjectName = periodData.subject_id || "";
//             const teacherName = periodData.teachers || "";

//             const onChange = (e) => {
//               const val = e.target.value;
//               const sub = {
//                 id: val,
//                 name: subjects.find((s) => s.sm_id === val)?.subjectname || "",
//               };
//               handleSubjectChange(day, r + 1, sub);
//             };

//             const inOther = Object.entries(globalSubjectSelection).some(
//               ([sec, data]) => sec !== key && data?.[day]?.[r + 1]?.id
//             );

//             return (
//               <td key={day} className="border p-2">
//                 {subjectName && teacherName && (
//                   <div className="text-center text-[.7em] text-gray-600">
//                     <div className="font-medium">
//                       <span className="text-pink-600">Mathematics</span>{" "}
//                       <span className="text-black">(Mr. Sharma)</span>
//                     </div>
//                     <div className="font-medium">
//                       <span className="text-pink-600">Science</span>{" "}
//                       <span className="text-black">(Ms. Verma)</span>
//                     </div>
//                     <div className="font-medium">
//                       <span className="text-pink-600">History</span>{" "}
//                       <span className="text-black">(Dr. Khan)</span>
//                     </div>
//                     <div className="font-medium">
//                       <span className="text-pink-600">English</span>{" "}
//                       <span className="text-black">(Mrs. D'Souza)</span>
//                     </div>
//                   </div>
//                 )}
//                 <select
//                   value={sel?.id || ""}
//                   onChange={onChange}
//                   className={`border p-1 w-full mt-2 ${
//                     inOther ? "bg-pink-100" : ""
//                   }`}
//                   disabled={usedPeriods >= allocatedPeriods && !sel?.id}
//                 >
//                   <option value="">Select</option>
//                   {subjects.map((s) => (
//                     <option key={s.subject_id} value={s.sm_id}>
//                       {s.subjectname}
//                     </option>
//                   ))}
//                 </select>
//               </td>
//             );
//           })}
//         </tr>
//       );
//     }

//     return rows;
//   };

//   const daysForTable = [
//     "Monday",
//     "Tuesday",
//     "Wednesday",
//     "Thursday",
//     "Friday",
//     ...(rowCounts.sat ? ["Saturday"] : []),
//   ];

//   return (
//     <div className="overflow-x-auto">
//       {loading ? (
//         <div className="flex justify-center items-center  p-5 ">
//           <LoaderStyle />
//         </div>
//       ) : (
//         <table className="w-full table-auto border-collapse border border-gray-300">
//           <thead>
//             <tr className="bg-gray-200 text-gray-600">
//               <th className="border p-2">Periods</th>
//               {daysForTable.map((d, i) => (
//                 <th key={i} className="border p-2">
//                   {d}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>{renderRows(daysForTable)}</tbody>
//         </table>
//       )}
//       <ToastContainer />
//     </div>
//   );
// }

// upper bala working well kar rhaa hai but ismai apn ne subject name and teacher name show kia hai hover pr
import { useState, useEffect } from "react";
import LoaderStyle from "../../common/LoaderFinal/LoaderStyle";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CommonTable({
  periods,
  subjects,
  loading,
  selectedSubjects,
  handleTableData,
  activeTab,
  tabs,
  rowCounts,
  allocatedPeriods,
  usedPeriods,
  setUsedPeriods,
  classSectionNames,
  onOverrideChange,
}) {
  const [localSelectedSubjects, setLocalSelectedSubjects] = useState({});
  const [globalSubjectSelection, setGlobalSubjectSelection] = useState({});
  // This is test
  const [hoverInfo, setHoverInfo] = useState({
    show: false,
    x: 0,
    y: 0,
    items: [], // array of { subject, teacher }
  });

  const [modalInfo, setModalInfo] = useState({
    show: false,
    subject: "",
    teacher: "",
  });

  const showOverrideConfirmToast = (day, period_no, selectedSub) => {
    toast.info(
      <div
        style={{
          maxWidth: "600px",
          width: "100%",
          padding: "20px",
          fontFamily: "'Segoe UI', sans-serif",
          borderRadius: "8px",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
          backgroundColor: "#fff",
          textAlign: "center",
          margin: "0 auto",
        }}
      >
        <p
          style={{ fontSize: "0.95em", marginBottom: "16px", color: "#1f2937" }}
        >
          <strong>Subject is already allotted for this period.</strong>
          <br />
          What would you like to do?
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "8px",

            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => {
              toast.dismiss();
              onOverrideChange?.(day, period_no, "N");
              applySubjectChange(day, period_no, selectedSub);
            }}
            style={{
              backgroundColor: "#16a34a",
              color: "#fff",
              padding: "10px 16px",
              fontSize: "0.8em",
              fontWeight: 500,
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#15803d")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#16a34a")}
          >
            ➕ Add subject
          </button>

          <button
            onClick={() => {
              toast.dismiss();
              onOverrideChange?.(day, period_no, "Y");
              applySubjectChange(day, period_no, selectedSub);
            }}
            style={{
              backgroundColor: "#dc2626",
              color: "#fff",
              padding: "10px 16px",
              fontSize: "0.8em",
              fontWeight: 500,
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#b91c1c")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#dc2626")}
          >
            🗑 Overwrite subject(s)
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
        draggable: false,
        pauseOnHover: true,
        style: {
          background: "transparent", // ensures no box is added around
          boxShadow: "none",
        },
      }
    );
  };

  const activeTabData = tabs.find((tab) => tab.id === activeTab);
  const classId = activeTabData?.class_id;
  const sectionId = activeTabData?.section_id;
  const key = `${classId}-${sectionId}`;

  // Sync local & global selections
  useEffect(() => {
    setLocalSelectedSubjects(selectedSubjects[key] || {});
  }, [selectedSubjects, key]);

  useEffect(() => {
    if (Object.keys(localSelectedSubjects).length) {
      setGlobalSubjectSelection((prev) => ({
        ...prev,
        [key]: localSelectedSubjects,
      }));
    }
  }, [localSelectedSubjects, key]);

  const applySubjectChange = (day, period_no, selectedSubject) => {
    const cur = localSelectedSubjects?.[day]?.[period_no];
    const updated = {
      ...localSelectedSubjects,
      [day]: {
        ...localSelectedSubjects[day],
        [period_no]: selectedSubject.id
          ? { id: selectedSubject.id, name: selectedSubject.name }
          : null,
      },
    };

    setUsedPeriods((prev) =>
      selectedSubject.id ? (cur ? prev : prev + 1) : cur ? prev - 1 : prev
    );

    setLocalSelectedSubjects(updated);
    setGlobalSubjectSelection((prev) => ({ ...prev, [key]: updated[day] }));
    handleTableData(classId, sectionId, day, period_no, selectedSubject);
  };

  const handleSubjectChange = (day, period_no, selectedSubject) => {
    if (!classId || !sectionId) return;

    const current = localSelectedSubjects?.[day]?.[period_no];

    // STEP 1: Check another section
    const inOther = Object.entries(globalSubjectSelection).some(
      ([sec, data]) => {
        return sec !== key && data?.[day]?.[period_no]?.id;
      }
    );
    if (selectedSubject.id && inOther) {
      const conflictKey = Object.keys(globalSubjectSelection).find(
        (sec) =>
          sec !== key && globalSubjectSelection[sec]?.[day]?.[period_no]?.id
      );
      const confSecName = conflictKey
        ? classSectionNames[conflictKey.split("-")[1]]
        : "another section";
      toast.error(
        <div>
          <strong style={{ color: "#e74c3c" }}>
            Subject already selected in another section ({confSecName})
          </strong>
          <br />
          <span style={{ color: "#2980b9" }}>
            for {day}, Period {period_no}.
          </span>
        </div>,
        { position: "top-right", autoClose: 5000 }
      );
      return; // Block here
    }

    // STEP 2: Same-section override logic
    const assignedName =
      periods.find((p) => p.day === day && p.period_no === period_no)
        ?.subject_id || "";
    const assignedTeacher =
      periods.find((p) => p.day === day && p.period_no === period_no)
        ?.teachers || "";
    const rowHasAssignment = assignedName.trim() && assignedTeacher.trim();

    if (rowHasAssignment && selectedSubject.id) {
      showOverrideConfirmToast(day, period_no, selectedSubject);
      return; // Wait for user decision
    }

    // STEP 3: Normal apply
    onOverrideChange?.(day, period_no, selectedSubject.id ? "Y" : "N");
    applySubjectChange(day, period_no, selectedSubject);
  };
  // const handleSubjectChange = (day, period_no, selectedSubject) => {
  //   if (!classId || !sectionId) return;

  //   const current = localSelectedSubjects?.[day]?.[period_no];

  //   // STEP 0: Get period data for the current cell
  //   const periodData = periods.find(
  //     (p) => p.day === day && p.period_no === period_no
  //   );

  //   const assignedSubjects = (periodData?.subject_id || "")
  //     .split(",")
  //     .map((s) => s.trim().toLowerCase());

  //   const assignedTeachers = (periodData?.teachers || "")
  //     .split(",")
  //     .map((t) => t.trim().toLowerCase());

  //   // STEP 1: Get selected subject and teacher details
  //   const selectedSubData = subjects.find(
  //     (s) => s.sm_id === selectedSubject.id
  //   );

  //   const selectedTeacher = selectedSubData?.teacher_name?.toLowerCase() || "";
  //   const selectedSubName = selectedSubData?.subjectname?.toLowerCase() || "";

  //   // STEP 2: Check if same subject-teacher already assigned
  //   const duplicate = assignedSubjects.some((sub, idx) => {
  //     return (
  //       sub === selectedSubName && assignedTeachers[idx] === selectedTeacher
  //     );
  //   });

  //   if (duplicate) {
  //     toast.warn(
  //       <div>
  //         <strong style={{ color: "#eab308" }}>
  //           यह subject और teacher पहले से assign हैं।
  //         </strong>
  //         <br />
  //         <span>
  //           {selectedSubName} - {selectedTeacher}
  //           <br />
  //           (Day: <b>{day}</b>, Period: <b>{period_no}</b>)
  //         </span>
  //       </div>,
  //       { position: "top-right", autoClose: 4000 }
  //     );
  //     return; // block the selection
  //   }

  //   // STEP 1: Check another section
  //   const inOther = Object.entries(globalSubjectSelection).some(
  //     ([sec, data]) => {
  //       return sec !== key && data?.[day]?.[period_no]?.id;
  //     }
  //   );
  //   if (selectedSubject.id && inOther) {
  //     const conflictKey = Object.keys(globalSubjectSelection).find(
  //       (sec) =>
  //         sec !== key && globalSubjectSelection[sec]?.[day]?.[period_no]?.id
  //     );
  //     const confSecName = conflictKey
  //       ? classSectionNames[conflictKey.split("-")[1]]
  //       : "another section";
  //     toast.error(
  //       <div>
  //         <strong style={{ color: "#e74c3c" }}>
  //           Subject already selected in another section ({confSecName})
  //         </strong>
  //         <br />
  //         <span style={{ color: "#2980b9" }}>
  //           for {day}, Period {period_no}.
  //         </span>
  //       </div>,
  //       { position: "top-right", autoClose: 5000 }
  //     );
  //     return; // Block here
  //   }

  //   // STEP 2: Same-section override logic
  //   const rowHasAssignment = assignedName.trim() && assignedTeacher.trim();

  //   if (rowHasAssignment && selectedSubject.id) {
  //     showOverrideConfirmToast(day, period_no, selectedSubject);
  //     return; // Wait for user decision
  //   }

  //   // STEP 3: Normal apply
  //   onOverrideChange?.(day, period_no, selectedSubject.id ? "Y" : "N");
  //   applySubjectChange(day, period_no, selectedSubject);
  // };

  const renderRows = (days) => {
    const rows = [];
    const maxRows = Math.max(rowCounts.mon_fri, rowCounts.sat);

    for (let r = 0; r < maxRows; r++) {
      rows.push(
        <tr key={r}>
          <td className="border p-2 bg-gray-100 text-center w-16">{r + 1}</td>

          {days.map((day) => {
            // 👉 Skip rendering for Saturday if period exceeds allowed
            if (day === "Saturday" && r >= rowCounts.sat) {
              return <td key={day} className="border p-2 bg-gray-50"></td>;
            }

            // 👉 Skip rendering for Mon–Fri if period exceeds allowed
            if (day !== "Saturday" && r >= rowCounts.mon_fri) {
              return <td key={day} className="border p-2 bg-gray-50"></td>;
            }

            const sel = localSelectedSubjects[day]?.[r + 1];
            const periodData =
              periods.find((p) => p.day === day && p.period_no === r + 1) || {};
            const subjectName = periodData.subject_id || "";
            const teacherName = periodData.teachers || "";

            const onChange = (e) => {
              const val = e.target.value;
              const sub = {
                id: val,
                name: subjects.find((s) => s.sm_id === val)?.subjectname || "",
              };
              handleSubjectChange(day, r + 1, sub);
            };

            const inOther = Object.entries(globalSubjectSelection).some(
              ([sec, data]) => sec !== key && data?.[day]?.[r + 1]?.id
            );

            return (
              <td key={day} className="border p-2 text-center  relative">
                {subjectName && (
                  <div
                    className="text-pink-600 cursor-pointer text-[.75em]"
                    onMouseEnter={(e) => {
                      const subjectList = subjectName
                        .split(",")
                        .map((s) => s.trim());
                      const teacherList = teacherName
                        .split(",")
                        .map((t) => t.trim());
                      const items = subjectList.map((sub, idx) => ({
                        subject: sub,
                        teacher: teacherList[idx] || "",
                      }));
                      setHoverInfo({
                        show: true,
                        x: e.clientX,
                        y: e.clientY,
                        items,
                      });
                    }}
                    onMouseLeave={() =>
                      setHoverInfo((prev) => ({ ...prev, show: false }))
                    }
                  >
                    {subjectName.split(",").map((s, idx) => (
                      <div key={idx}>{s.trim()}</div>
                    ))}
                  </div>
                )}

                <select
                  value={sel?.id || ""}
                  onChange={onChange}
                  className={`border p-1 w-full mt-2 ${
                    inOther ? "bg-pink-100" : ""
                  }`}
                  disabled={usedPeriods >= allocatedPeriods && !sel?.id}
                >
                  <option value="">Select</option>
                  {subjects.map((s) => (
                    <option key={s.subject_id} value={s.sm_id}>
                      {s.subjectname}
                    </option>
                  ))}
                </select>
              </td>

              // <td key={day} className="border p-2">
              //   {subjectName && teacherName && (
              //     // <div className="text-center text-[.7em] text-gray-600">
              //     //   <div className="font-medium">
              //     //     <span className="text-pink-600">Mathematics</span>{" "}
              //     //     <span className="text-black">(Mr. Sharma)</span>
              //     //   </div>
              //     //   <div className="font-medium">
              //     //     <span className="text-pink-600">Science</span>{" "}
              //     //     <span className="text-black">(Ms. Verma)</span>
              //     //   </div>
              //     //   <div className="font-medium">
              //     //     <span className="text-pink-600">History</span>{" "}
              //     //     <span className="text-black">(Dr. Khan)</span>
              //     //   </div>
              //     //   <div className="font-medium">
              //     //     <span className="text-pink-600">English</span>{" "}
              //     //     <span className="text-black">(Mrs. D'Souza)</span>
              //     //   </div>
              //     // </div>

              //     <>
              //       <div className="font-medium">{subjectName}</div>
              //       <div className="text-pink-600">{teacherName}</div>
              //     </>
              //   )}
              //   <select
              //     value={sel?.id || ""}
              //     onChange={onChange}
              //     className={`border p-1 w-full mt-2 ${
              //       inOther ? "bg-pink-100" : ""
              //     }`}
              //     disabled={usedPeriods >= allocatedPeriods && !sel?.id}
              //   >
              //     <option value="">Select</option>
              //     {subjects.map((s) => (
              //       <option key={s.subject_id} value={s.sm_id}>
              //         {s.subjectname}
              //       </option>
              //     ))}
              //   </select>
              // </td>
            );
          })}
        </tr>
      );
    }

    return rows;
  };

  const daysForTable = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    ...(rowCounts.sat ? ["Saturday"] : []),
  ];

  return (
    <div className="overflow-x-auto">
      {loading ? (
        <div className="flex justify-center items-center  p-5 ">
          <LoaderStyle />
        </div>
      ) : (
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200 text-gray-600">
              <th className="border p-2">Periods</th>
              {daysForTable.map((d, i) => (
                <th key={i} className="border p-2">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{renderRows(daysForTable)}</tbody>
        </table>
      )}
      <ToastContainer />
      {hoverInfo.show && (
        <div
          className="fixed z-50 bg-white text-gray-700 shadow-lg rounded-lg p-2 border border-gray-300 text-[1em]"
          style={{
            top: hoverInfo.y + 10,
            left: hoverInfo.x + 10,
            pointerEvents: "none",
            whiteSpace: "pre-line",
          }}
        >
          {hoverInfo.items.map((item, i) => (
            <div key={i} className="font-medium">
              <span className="text-pink-600">{item.subject}</span>{" "}
              <span className="text-black">({item.teacher})</span>
            </div>
          ))}
        </div>
      )}

      {modalInfo.show && (
        <div className="fixed inset-0  bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[300px] text-center">
            <h2 className="text-xl font-semibold mb-2">Subject Details</h2>
            <p className="text-gray-700">
              <span className="text-pink-600">{modalInfo.subject}</span>{" "}
              <span className="text-black">({modalInfo.teacher})</span>
            </p>
            <button
              onClick={() => setModalInfo({ show: false })}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
