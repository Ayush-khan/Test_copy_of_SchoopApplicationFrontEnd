// import { useState, useEffect } from "react";
// import LoaderStyle from "../../componants/common/LoaderFinal/LoaderStyle";

// export default function CommonTable({
//   periods,
//   subjects,
//   loading,
//   selectedSubjects,
//   handleTableData,
//   activeTab,
//   tabs,
//   rowCounts, // Receive rowCounts from parent
// }) {
//   const [localSelectedSubjects, setLocalSelectedSubjects] = useState({});

//   // 🔹 Find active class & section based on activeTab
//   const activeTabData = tabs.find((tab) => tab.id === activeTab);
//   const classId = activeTabData?.class_id;
//   const sectionId = activeTabData?.section_id;
//   const key = `${classId}-${sectionId}`;

//   // 🔹 Sync `localSelectedSubjects` with `selectedSubjects` when activeTab changes
//   useEffect(() => {
//     if (selectedSubjects[key]) {
//       setLocalSelectedSubjects(selectedSubjects[key]); // ✅ Load only the active tab's data
//     } else {
//       setLocalSelectedSubjects({}); // Reset when switching to a new tab
//     }
//   }, [selectedSubjects, key]);

//   // 🔹 Handle Subject Change for a specific day & period
//   const handleSubjectChange = (day, period_no, selectedSubject) => {
//     if (!classId || !sectionId) return; // Ensure valid data

//     const updatedSubjects = {
//       ...localSelectedSubjects,
//       [day]: {
//         ...(localSelectedSubjects[day] || {}),
//         [period_no]: { id: selectedSubject.id, name: selectedSubject.name }, // ✅ Store subject ID & name
//       },
//     };

//     setLocalSelectedSubjects(updatedSubjects);
//     handleTableData(classId, sectionId, day, period_no, selectedSubject);
//   };

//   // 🔹 Render rows logic
//   const renderRows = (days) => {
//     const rows = [];
//     const maxRows = Math.max(rowCounts.mon_fri, rowCounts.sat); // Max rows based on either mon_fri or sat

//     // Render rows based on maxRows
//     for (let rowIndex = 0; rowIndex < maxRows; rowIndex++) {
//       rows.push(
//         <tr key={`row-${rowIndex}`}>
//           <td className="border p-2 text-center">{rowIndex + 1}</td>

//           {/* Loop through days (Monday to Friday) */}
//           {days.map((day) => {
//             // If we are in a Saturday row and there's no data for Saturday, show an empty cell
//             if (day === "Saturday" && rowIndex >= rowCounts.sat) {
//               return <td key={day} className="border p-2"></td>;
//             }

//             // For Monday to Friday and active Saturday rows, show the subject dropdown
//             const periodData = periods[rowIndex];
//             return (
//               <td key={day} className="border p-2">
//                 <select
//                   className="border p-1 w-full"
//                   value={localSelectedSubjects?.[day]?.[rowIndex + 1]?.id || ""}
//                   onChange={(e) =>
//                     handleSubjectChange(day, rowIndex + 1, {
//                       id: e.target.value,
//                       name:
//                         subjects.find((s) => s.id === e.target.value)
//                           ?.subjectname || "",
//                     })
//                   }
//                 >
//                   <option value="">Select</option>
//                   {subjects.map((subject) => (
//                     <option key={subject.subject_id} value={subject.subject_id}>
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

//   // 🔹 Determine which days to render based on rowCounts
//   const daysForTable = [
//     "Monday",
//     "Tuesday",
//     "Wednesday",
//     "Thursday",
//     "Friday",
//     ...(rowCounts.sat > 0 ? ["Saturday"] : []), // Only include Saturday if rowCounts.sat > 0
//   ];

//   // 🔹 Update rows based on `mon_fri` and `sat` values
//   const renderTable = () => {
//     // Ensure periods and rowCounts exist before rendering the table
//     if (
//       !periods ||
//       !periods.length ||
//       !subjects.length ||
//       !rowCounts ||
//       rowCounts.mon_fri === 0
//     ) {
//       return (
//         <div className="p-5 text-center text-gray-600">
//           <p>No data found</p>
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
//         <div className="flex justify-center items-center p-5">
//           <div className="flex justify-center items-center h-64">
//             <LoaderStyle />
//           </div>
//         </div>
//       ) : (
//         renderTable()
//       )}
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import LoaderStyle from "../../componants/common/LoaderFinal/LoaderStyle";

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
  showToast,
}) {
  const [localSelectedSubjects, setLocalSelectedSubjects] = useState({});

  const activeTabData = tabs.find((tab) => tab.id === activeTab);
  const classId = activeTabData?.class_id;
  const sectionId = activeTabData?.section_id;
  const key = `${classId}-${sectionId}`;

  console.log("Allocated Periods:", allocatedPeriods);
  console.log("Used Periods:", usedPeriods);
  console.log("Periods:", periods);
  console.log("Subjects:", subjects);
  console.log("Loading:", loading);
  console.log("Selected Subjects:", selectedSubjects);
  console.log("Handle Table Data Function:", handleTableData);
  console.log("Active Tab:", activeTab);
  console.log("Tabs:", tabs);
  console.log("Row Counts:", rowCounts);
  useEffect(() => {
    if (selectedSubjects[key]) {
      setLocalSelectedSubjects(selectedSubjects[key]);
    } else {
      setLocalSelectedSubjects({});
    }
  }, [selectedSubjects, key]);

  const handleSubjectChange = (day, period_no, selectedSubject) => {
    if (!classId || !sectionId) return;

    const currentSelectedSubject = localSelectedSubjects?.[day]?.[period_no];

    // Handle Deselection (when subject is cleared)
    if (!selectedSubject.id) {
      if (currentSelectedSubject) {
        // If a subject was previously selected, decrease the usedPeriods count
        setUsedPeriods((prev) => (prev > 0 ? prev - 1 : 0));
      }

      // Remove the selected subject (deselecting)
      const updatedSubjects = {
        ...localSelectedSubjects,
        [day]: {
          ...(localSelectedSubjects[day] || {}),
          [period_no]: null, // Set to null if subject is deselected
        },
      };
      setLocalSelectedSubjects(updatedSubjects);
      handleTableData(classId, sectionId, day, period_no, selectedSubject);
      return;
    }

    // Handle Subject Change (Switching between subjects without deselecting)
    if (
      currentSelectedSubject &&
      currentSelectedSubject.id !== selectedSubject.id
    ) {
      // Decrease usedPeriods for the old subject
      setUsedPeriods((prev) => (prev > 0 ? prev - 1 : 0));

      // If we haven't reached the allocated periods, increase usedPeriods for the new subject
      if (usedPeriods < allocatedPeriods) {
        setUsedPeriods((prev) => prev + 1);
      }
    }

    // Handle Selecting a Subject After Deselecting (new subject selection after clearing)
    if (!currentSelectedSubject || currentSelectedSubject.id === "") {
      // If the previous subject was deselected, we increase the usedPeriods by 1
      if (usedPeriods < allocatedPeriods) {
        setUsedPeriods((prev) => prev + 1);
      }
    }

    // Update the selected subject for the specific period
    const updatedSubjects = {
      ...localSelectedSubjects,
      [day]: {
        ...(localSelectedSubjects[day] || {}),
        [period_no]: { id: selectedSubject.id, name: selectedSubject.name },
      },
    };

    setLocalSelectedSubjects(updatedSubjects);
    handleTableData(classId, sectionId, day, period_no, selectedSubject);
  };

  const renderRows = (days) => {
    const rows = [];
    const maxRows = Math.max(rowCounts.mon_fri, rowCounts.sat);

    for (let rowIndex = 0; rowIndex < maxRows; rowIndex++) {
      rows.push(
        <tr key={`row-${rowIndex}`}>
          <td className="border p-2 text-center">{rowIndex + 1}</td>
          {days.map((day) => {
            if (day === "Saturday" && rowIndex >= rowCounts.sat) {
              return <td key={day} className="border p-2"></td>;
            }

            return (
              <td key={day} className="border p-2">
                <select
                  className="border p-1 w-full"
                  value={localSelectedSubjects?.[day]?.[rowIndex + 1]?.id || ""}
                  onChange={(e) => {
                    const selectedSub = {
                      id: e.target.value,
                      name:
                        subjects.find((s) => s.id === e.target.value)
                          ?.subjectname || "",
                    };
                    handleSubjectChange(day, rowIndex + 1, selectedSub);
                  }}
                  disabled={
                    usedPeriods >= allocatedPeriods &&
                    !localSelectedSubjects?.[day]?.[rowIndex + 1]?.id
                  }
                >
                  <option value="">Select</option>
                  {subjects.map((subject) => (
                    <option key={subject.subject_id} value={subject.subject_id}>
                      {subject.subjectname}
                    </option>
                  ))}
                </select>
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
      return <div className="p-5 text-center text-gray-600">No data found</div>;
    }
    return (
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200 text-gray-600">
            <th className="border p-2 text-center">Periods</th>
            {daysForTable.map((day, daykey) => (
              <th key={daykey} className="border p-2 text-center">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{renderRows(daysForTable)}</tbody>
      </table>
    );
  };

  return (
    <div className="overflow-x-auto">
      {loading ? (
        <div className="flex justify-center items-center p-5">
          <LoaderStyle />
        </div>
      ) : (
        renderTable()
      )}
    </div>
  );
}

// working expectly
// import { useState, useEffect } from "react";
// import LoaderStyle from "../../componants/common/LoaderFinal/LoaderStyle";

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
//   showToast,
// }) {
//   const [localSelectedSubjects, setLocalSelectedSubjects] = useState({});

//   const activeTabData = tabs.find((tab) => tab.id === activeTab);
//   const classId = activeTabData?.class_id;
//   const sectionId = activeTabData?.section_id;
//   const key = `${classId}-${sectionId}`;

//   console.log(
//     "Allocated Periods:",
//     allocatedPeriods,
//     "Used Periods:",
//     usedPeriods
//   );

//   useEffect(() => {
//     if (selectedSubjects[key]) {
//       setLocalSelectedSubjects(selectedSubjects[key]);
//     } else {
//       setLocalSelectedSubjects({});
//     }
//   }, [selectedSubjects, key]);

//   const handleSubjectChange = (day, period_no, selectedSubject) => {
//     if (!classId || !sectionId) return;

//     if (selectedSubject.id) {
//       // Subject is being selected
//       if (usedPeriods >= allocatedPeriods) {
//         showToast(
//           "Allocated periods reached. Cannot select more subjects.",
//           "error"
//         );
//         return;
//       }
//       setUsedPeriods((prev) => prev + 1); // Increment used periods
//     } else {
//       // Subject is being removed
//       setUsedPeriods((prev) => (prev > 0 ? prev - 1 : 0)); // Decrement used periods
//     }

//     const updatedSubjects = {
//       ...localSelectedSubjects,
//       [day]: {
//         ...(localSelectedSubjects[day] || {}),
//         [period_no]: selectedSubject.id
//           ? { id: selectedSubject.id, name: selectedSubject.name }
//           : null, // null if subject is removed
//       },
//     };

//     setLocalSelectedSubjects(updatedSubjects);
//     handleTableData(classId, sectionId, day, period_no, selectedSubject);
//   };

//   const renderRows = (days) => {
//     const rows = [];
//     const maxRows = Math.max(rowCounts.mon_fri, rowCounts.sat);

//     for (let rowIndex = 0; rowIndex < maxRows; rowIndex++) {
//       rows.push(
//         <tr key={`row-${rowIndex}`}>
//           <td className="border p-2 text-center">{rowIndex + 1}</td>
//           {days.map((day) => {
//             if (day === "Saturday" && rowIndex >= rowCounts.sat) {
//               return <td key={day} className="border p-2"></td>;
//             }

//             return (
//               <td key={day} className="border p-2">
//                 <select
//                   className="border p-1 w-full"
//                   value={localSelectedSubjects?.[day]?.[rowIndex + 1]?.id || ""}
//                   onChange={(e) => {
//                     const selectedSub = {
//                       id: e.target.value,
//                       name:
//                         subjects.find((s) => s.id === e.target.value)
//                           ?.subjectname || "",
//                     };
//                     handleSubjectChange(day, rowIndex + 1, selectedSub);
//                   }}
//                   disabled={usedPeriods >= allocatedPeriods}
//                 >
//                   <option value="">Select</option>
//                   {subjects.map((subject) => (
//                     <option key={subject.subject_id} value={subject.subject_id}>
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
//       return <div className="p-5 text-center text-gray-600">No data found</div>;
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
//         <div className="flex justify-center items-center p-5">
//           <LoaderStyle />
//         </div>
//       ) : (
//         renderTable()
//       )}
//     </div>
//   );
// }

// chose above one
// working properly
// import { useState, useEffect } from "react";
// export default function CommonTable({
//   periods,
//   subjects,
//   loading,
//   selectedSubjects,
//   handleTableData,
//   activeTab,
//   tabs,
//   rowCounts, // Receive rowCounts from parent
// }) {
//   const [localSelectedSubjects, setLocalSelectedSubjects] = useState({});

//   // 🔹 Find active class & section based on activeTab
//   const activeTabData = tabs.find((tab) => tab.id === activeTab);
//   const classId = activeTabData?.class_id;
//   const sectionId = activeTabData?.section_id;
//   const key = `${classId}-${sectionId}`;

//   // 🔹 Sync `localSelectedSubjects` with `selectedSubjects` when activeTab changes
//   useEffect(() => {
//     if (selectedSubjects[key]) {
//       setLocalSelectedSubjects(selectedSubjects[key]); // ✅ Load only the active tab's data
//     } else {
//       setLocalSelectedSubjects({}); // Reset when switching to a new tab
//     }
//   }, [selectedSubjects, key]);

//   // 🔹 Handle Subject Change for a specific day & period
//   const handleSubjectChange = (day, period_no, selectedSubject) => {
//     if (!classId || !sectionId) return; // Ensure valid data

//     const updatedSubjects = {
//       ...localSelectedSubjects,
//       [day]: {
//         ...(localSelectedSubjects[day] || {}),
//         [period_no]: { id: selectedSubject.id, name: selectedSubject.name }, // ✅ Store subject ID & name
//       },
//     };

//     setLocalSelectedSubjects(updatedSubjects);
//     handleTableData(classId, sectionId, day, period_no, selectedSubject);
//   };

//   // 🔹 Render rows logic
//   const renderRows = (days) => {
//     const rows = [];
//     const maxRows = Math.max(rowCounts.mon_fri, rowCounts.sat); // Max rows based on either mon_fri or sat

//     // Render rows based on maxRows
//     for (let rowIndex = 0; rowIndex < maxRows; rowIndex++) {
//       rows.push(
//         <tr key={`row-${rowIndex}`}>
//           <td className="border p-2 text-center">{rowIndex + 1}</td>

//           {/* Loop through days (Monday to Friday) */}
//           {days.map((day) => {
//             // If we are in a Saturday row and there's no data for Saturday, show an empty cell
//             if (day === "Saturday" && rowIndex >= rowCounts.sat) {
//               return <td key={day} className="border p-2"></td>;
//             }

//             // For Monday to Friday and active Saturday rows, show the subject dropdown
//             const periodData = periods[rowIndex];
//             return (
//               <td key={day} className="border p-2">
//                 <select
//                   className="border p-1 w-full"
//                   value={localSelectedSubjects?.[day]?.[rowIndex + 1]?.id || ""}
//                   onChange={(e) =>
//                     handleSubjectChange(day, rowIndex + 1, {
//                       id: e.target.value,
//                       name:
//                         subjects.find((s) => s.id === e.target.value)
//                           ?.subjectname || "",
//                     })
//                   }
//                 >
//                   <option value="">Select</option>
//                   {subjects.map((subject, i) => (
//                     <option key={i} value={subject.id}>
//                       {subject.subjectname} - {subject.teachers}
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

//   // 🔹 Determine which days to render based on rowCounts
//   const daysForTable = [
//     "Monday",
//     "Tuesday",
//     "Wednesday",
//     "Thursday",
//     "Friday",
//     ...(rowCounts.sat > 0 ? ["Saturday"] : []), // Only include Saturday if rowCounts.sat > 0
//   ];

//   // Update rows based on `mon_fri` and `sat` values
//   const renderTable = () => {
//     // Only render rows for Monday to Friday if mon_fri > 0
//     if (rowCounts.mon_fri > 0 || rowCounts.sat > 0) {
//       return (
//         <table className="table-auto w-full border-collapse border border-gray-300">
//           <thead>
//             <tr className="bg-gray-200 text-gray-600">
//               <th className="border p-2 text-center">Periods</th>
//               {daysForTable.map((day, daykey) => (
//                 <th key={daykey} className="border p-2 text-center">
//                   {day}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>{renderRows(daysForTable)}</tbody>
//         </table>
//       );
//     }
//     return null;
//   };

//   return (
//     <div className="overflow-x-auto">
//       {loading ? (
//         <div className="flex justify-center items-center p-5">
//           <span className="loader">Loading...</span>
//         </div>
//       ) : (
//         renderTable()
//       )}
//     </div>
//   );
// }
