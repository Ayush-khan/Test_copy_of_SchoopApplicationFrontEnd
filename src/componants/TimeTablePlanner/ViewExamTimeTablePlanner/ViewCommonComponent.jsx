// import { useState, useEffect } from "react";
// import LoaderStyle from "../../common/LoaderFinal/LoaderStyle";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// export default function ViewCommonComponent({
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
//   const activeTabData = tabs.find((tab) => tab.id === activeTab);
//   const classId = activeTabData?.class_id;
//   const sectionId = activeTabData?.section_id;
//   const key = `${classId}-${sectionId}`;

//   useEffect(() => {
//     if (!periods || !Array.isArray(periods)) return;

//     const updated = {};
//     const days = [
//       "Monday",
//       "Tuesday",
//       "Wednesday",
//       "Thursday",
//       "Friday",
//       "Saturday",
//     ];

//     days.forEach((day) => {
//       const dayPeriods = periods.filter((period) => period.day === day);
//       if (!updated[day]) updated[day] = {};

//       dayPeriods.forEach((period) => {
//         updated[day][period.period_no] = {
//           id: period.subject_id || "",
//           name: period.subject || "",
//         };
//       });
//     });

//     setLocalSelectedSubjects(updated);
//     setGlobalSubjectSelection((prev) => ({
//       ...prev,
//       [key]: updated,
//     }));
//   }, [periods]);

//   const isAnySubjectAlreadySelectedInOtherSection = (day, period_no) => {
//     for (const sectionKey in globalSubjectSelection) {
//       if (sectionKey === key) continue;
//       const sectionData = globalSubjectSelection[sectionKey];
//       const selectedSubject = sectionData[day]?.[period_no];
//       if (selectedSubject?.id && selectedSubject.id !== "") {
//         return true;
//       }
//     }
//     return false;
//   };

//   const handleSubjectChange = (day, period_no, selectedSubject) => {
//     if (!classId || !sectionId) return;
//     const currentSelectedSubject = localSelectedSubjects?.[day]?.[period_no];

//     if (
//       selectedSubject.id &&
//       isAnySubjectAlreadySelectedInOtherSection(day, period_no)
//     ) {
//       let conflictingClassSection = "";
//       for (const sectionKey in globalSubjectSelection) {
//         if (sectionKey === key) continue;
//         const sectionData = globalSubjectSelection[sectionKey];
//         const selectedSubjectInOtherSection = sectionData[day]?.[period_no];
//         if (selectedSubjectInOtherSection?.id) {
//           const [, conflictingSectionId] = sectionKey.split("-");
//           const classSectionName = classSectionNames[conflictingSectionId];
//           conflictingClassSection = `${classSectionName}`;
//           break;
//         }
//       }

//       toast.error(
//         <div>
//           <strong style={{ color: "#e74c3c" }}>
//             Subject already selected in another section (
//             {conflictingClassSection})
//           </strong>
//           <br />
//           <span style={{ color: "#2980b9" }}>
//             for {day}, Period {period_no}.
//           </span>
//         </div>,
//         {
//           position: "top-right",
//           autoClose: 5000,
//           hideProgressBar: true,
//           closeOnClick: true,
//           pauseOnHover: true,
//           draggable: true,
//         }
//       );

//       return;
//     }

//     const updatedSubjects = {
//       ...localSelectedSubjects,
//       [day]: {
//         ...(localSelectedSubjects[day] || {}),
//         [period_no]: selectedSubject.id
//           ? { id: selectedSubject.id, name: selectedSubject.name }
//           : null,
//       },
//     };

//     if (selectedSubject.id) {
//       if (!currentSelectedSubject || currentSelectedSubject.id === "") {
//         setUsedPeriods((prev) => (prev < allocatedPeriods ? prev + 1 : prev));
//       }
//     } else {
//       if (currentSelectedSubject) {
//         setUsedPeriods((prev) => (prev > 0 ? prev - 1 : 0));
//       }
//     }

//     setLocalSelectedSubjects(updatedSubjects);
//     setGlobalSubjectSelection((prevState) => ({
//       ...prevState,
//       [key]: updatedSubjects,
//     }));

//     handleTableData(classId, sectionId, day, period_no, selectedSubject);
//   };

//   const renderRows = (days) => {
//     const rows = [];
//     const maxRows = Math.max(rowCounts.mon_fri, rowCounts.sat);

//     for (let rowIndex = 0; rowIndex < maxRows; rowIndex++) {
//       rows.push(
//         <tr key={`row-${rowIndex}`}>
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

//             const subjectName = periodData ? periodData.subject : "";
//             const teacherName = periodData ? periodData.teachers : "";

//             const handleSubjectSelection = (e) => {
//               const selectedSub = {
//                 id: e.target.value,
//                 name:
//                   subjects.find((s) => s.sm_id === e.target.value)
//                     ?.subjectname || "",
//               };
//               handleSubjectChange(day, rowIndex + 1, selectedSub);
//             };

//             const isSelectedInOtherSection =
//               isAnySubjectAlreadySelectedInOtherSection(day, rowIndex + 1);
//             const highlightClass =
//               selectedPeriod?.id === ""
//                 ? ""
//                 : isSelectedInOtherSection
//                 ? "bg-pink-100"
//                 : "";

//             return (
//               <td key={day} className="border p-2">
//                 <div className="flex text-center flex-col w-full text-sm text-gray-600">
//                   {subjectName && teacherName && (
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
//                   )}
//                 </div>
//                 <select
//                   className={`border p-1 w-full mt-2 ${highlightClass}`}
//                   value={selectedPeriod?.id || ""}
//                   onChange={handleSubjectSelection}
//                   disabled={
//                     usedPeriods >= allocatedPeriods && !selectedPeriod?.id
//                   }
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
//       <div className="overflow-x-auto">
//         <table className="border-collapse w-full">
//           <thead>
//             <tr>
//               <th className="border p-2 bg-gray-200 w-16 text-center">
//                 Period
//               </th>
//               {daysForTable.map((day) => (
//                 <th key={day} className="border p-2 bg-gray-200 text-center">
//                   {day}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>{renderRows(daysForTable)}</tbody>
//         </table>
//         <ToastContainer />
//       </div>
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

// Above one is working well but this one is for view

import { useState, useEffect } from "react";
import LoaderStyle from "../../common/LoaderFinal/LoaderStyle";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ViewCommonComponent({
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

  const activeTabData = tabs.find((tab) => tab.id === activeTab);
  const classId = activeTabData?.class_id;
  const sectionId = activeTabData?.section_id;
  const key = `${classId}-${sectionId}`;

  useEffect(() => {
    if (!periods || !Array.isArray(periods)) return;

    const updated = {};
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    days.forEach((day) => {
      const dayPeriods = periods.filter((period) => period.day === day);
      if (!updated[day]) updated[day] = {};

      dayPeriods.forEach((period) => {
        updated[day][period.period_no] = {
          id: period.subject_id || "",
          name: period.subject || "",
        };
      });
    });

    setLocalSelectedSubjects(updated);
    setGlobalSubjectSelection((prev) => ({
      ...prev,
      [key]: updated,
    }));
  }, [periods]);

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

            // 👉 Skipp rendering for Mon–Fri if period exceeds allowed
            if (day !== "Saturday" && r >= rowCounts.mon_fri) {
              return <td key={day} className="border p-2 bg-gray-50"></td>;
            }

            const sel = localSelectedSubjects[day]?.[r + 1];
            const periodData =
              periods.find((p) => p.day === day && p.period_no === r + 1) || {};
            // const subjectName = periodData.subject_id || "";
            const subjectName = periodData.subject || "";
            const teacherName = periodData.teachers || "";

            return (
              <td key={day} className="border p-2 text-center  relative">
                {subjectName && (
                  <div
                    className="text-pink-600 cursor-pointer text-[.8em]"
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
                    {/* {subjectName.split(",").map((s, idx) => (
                      <div key={idx}>{s.trim()}</div>
                    ))} */}
                    {subjectName.split(",").map((sub, idx) => {
                      const teacher = teacherName.split(",")[idx]?.trim() || "";
                      return (
                        <div key={idx}>
                          {sub.trim()}{" "}
                          {teacher && (
                            <span className="text-gray-500">({teacher})</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </td>
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
    ...(rowCounts.sat > 0 ? ["Saturday"] : []),
  ];

  const renderTable = () => {
    if (!periods?.length || !subjects.length || !rowCounts?.mon_fri) {
      return (
        <div className="flex w-[100%]  text-center  justify-center mt-14 flex-col items-center space-y-2">
          <span className="text-4xl animate-bounce">⚠️</span>
          <p className="text-xl font-medium text-red-700 tracking-wide drop-shadow-md">
            Oops! No data found..
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="border-collapse w-full">
          <thead>
            <tr>
              <th className="border p-2 bg-gray-200 w-16 text-center">
                Period
              </th>
              {daysForTable.map((day) => (
                <th key={day} className="border p-2 bg-gray-200 text-center">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{renderRows(daysForTable)}</tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="overflow-x-auto">
      {loading ? (
        <div className="mt-24 border-1 border-white flex justify-center items-center p-5 ">
          <LoaderStyle />
        </div>
      ) : (
        renderTable()
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
