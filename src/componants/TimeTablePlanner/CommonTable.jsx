// Perfecty working this compoent
// import { useState, useEffect } from "react";

// export default function CommonTable({
//   periods,
//   subjects,
//   loading,
//   selectedSubjects,
//   handleTableData,
//   activeTab,
//   tabs, // ✅ Get tabs from parent
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

//   return (
//     <div className="overflow-x-auto">
//       {loading ? (
//         <div className="flex justify-center items-center p-5">
//           <span className="loader">Loading...</span>
//         </div>
//       ) : (
//         <table className="table-auto w-full border-collapse border border-gray-300">
//           <thead>
//             <tr className="bg-gray-200 text-gray-600">
//               <th className="border p-2 text-center">Periods</th>
//               <th className="border p-2 text-center">Monday</th>
//               <th className="border p-2 text-center">Tuesday</th>
//               <th className="border p-2 text-center">Wednesday</th>
//               <th className="border p-2 text-center">Thursday</th>
//               <th className="border p-2 text-center">Friday</th>
//               <th className="border p-2 text-center">Saturday</th>
//             </tr>
//           </thead>
//           <tbody>
//             {periods.map((period, i) => (
//               <tr key={i}>
//                 <td className="border p-2 text-center">{period.period_no}</td>
//                 {[
//                   "Monday",
//                   "Tuesday",
//                   "Wednesday",
//                   "Thursday",
//                   "Friday",
//                   "Saturday",
//                 ].map((day) => (
//                   <td key={day} className="border p-2">
//                     <select
//                       className="border p-1 w-full"
//                       value={
//                         localSelectedSubjects?.[day]?.[period.period_no]?.id ||
//                         ""
//                       }
//                       onChange={(e) =>
//                         handleSubjectChange(day, period.period_no, {
//                           id: e.target.value,
//                           name:
//                             subjects.find((s) => s.id === e.target.value)
//                               ?.subjectname || "",
//                         })
//                       }
//                     >
//                       <option value="">Select Subject</option>
//                       {subjects.map((subject, i) => (
//                         <option key={i} value={subject.id}>
//                           {subject.subjectname} - {subject.teachers}
//                         </option>
//                       ))}
//                     </select>
//                   </td>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// }
import { useState, useEffect } from "react";

export default function CommonTable({
  periods,
  subjects,
  loading,
  selectedSubjects,
  handleTableData,
  activeTab,
  tabs,
  rowCounts, // Receive rowCounts from parent
}) {
  const [localSelectedSubjects, setLocalSelectedSubjects] = useState({});

  // 🔹 Find active class & section based on activeTab
  const activeTabData = tabs.find((tab) => tab.id === activeTab);
  const classId = activeTabData?.class_id;
  const sectionId = activeTabData?.section_id;
  const key = `${classId}-${sectionId}`;

  // 🔹 Sync `localSelectedSubjects` with `selectedSubjects` when activeTab changes
  useEffect(() => {
    if (selectedSubjects[key]) {
      setLocalSelectedSubjects(selectedSubjects[key]); // ✅ Load only the active tab's data
    } else {
      setLocalSelectedSubjects({}); // Reset when switching to a new tab
    }
  }, [selectedSubjects, key]);

  // 🔹 Handle Subject Change for a specific day & period
  const handleSubjectChange = (day, period_no, selectedSubject) => {
    if (!classId || !sectionId) return; // Ensure valid data

    const updatedSubjects = {
      ...localSelectedSubjects,
      [day]: {
        ...(localSelectedSubjects[day] || {}),
        [period_no]: { id: selectedSubject.id, name: selectedSubject.name }, // ✅ Store subject ID & name
      },
    };

    setLocalSelectedSubjects(updatedSubjects);
    handleTableData(classId, sectionId, day, period_no, selectedSubject);
  };

  // 🔹 Render rows logic
  const renderRows = (days) => {
    const rows = [];
    const maxRows = Math.max(rowCounts.mon_fri, rowCounts.sat); // Max rows based on either mon_fri or sat

    // Render rows based on maxRows
    for (let rowIndex = 0; rowIndex < maxRows; rowIndex++) {
      rows.push(
        <tr key={`row-${rowIndex}`}>
          <td className="border p-2 text-center">{rowIndex + 1}</td>

          {/* Loop through days (Monday to Friday) */}
          {days.map((day) => {
            // If we are in a Saturday row and there's no data for Saturday, show an empty cell
            if (day === "Saturday" && rowIndex >= rowCounts.sat) {
              return <td key={day} className="border p-2"></td>;
            }

            // For Monday to Friday and active Saturday rows, show the subject dropdown
            const periodData = periods[rowIndex];
            return (
              <td key={day} className="border p-2">
                <select
                  className="border p-1 w-full"
                  value={localSelectedSubjects?.[day]?.[rowIndex + 1]?.id || ""}
                  onChange={(e) =>
                    handleSubjectChange(day, rowIndex + 1, {
                      id: e.target.value,
                      name:
                        subjects.find((s) => s.id === e.target.value)
                          ?.subjectname || "",
                    })
                  }
                >
                  <option value="">Select Subject</option>
                  {subjects.map((subject, i) => (
                    <option key={i} value={subject.id}>
                      {subject.subjectname} - {subject.teachers}
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

  // 🔹 Determine which days to render based on rowCounts
  const daysForTable = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    ...(rowCounts.sat > 0 ? ["Saturday"] : []), // Only include Saturday if rowCounts.sat > 0
  ];

  // Update rows based on `mon_fri` and `sat` values
  const renderTable = () => {
    // Only render rows for Monday to Friday if mon_fri > 0
    if (rowCounts.mon_fri > 0 || rowCounts.sat > 0) {
      return (
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200 text-gray-600">
              <th className="border p-2 text-center">Periods</th>
              {daysForTable.map((day) => (
                <th key={day} className="border p-2 text-center">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{renderRows(daysForTable)}</tbody>
        </table>
      );
    }
    return null;
  };

  return (
    <div className="overflow-x-auto">
      {loading ? (
        <div className="flex justify-center items-center p-5">
          <span className="loader">Loading...</span>
        </div>
      ) : (
        renderTable()
      )}
    </div>
  );
}

// import { useState, useEffect } from "react";

// export default function CommonTable({
//   periods,
//   subjects,
//   loading,
//   selectedSubjects,
//   handleTableData,
//   activeTab,
//   tabs,
//   rowCounts, // ✅ Receive rowCounts from parent
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

//   // Filter periods based on rowCounts
//   const filteredPeriods = periods.slice(0, rowCounts.mon_fri); // Get periods for Monday to Friday
//   const filteredSatPeriods = periods.slice(0, rowCounts.sat); // Get periods for Saturday

//   const renderRows = (days) => {
//     const rows = [];

//     // Loop through the days and render rows based on the periods
//     days.forEach((day) => {
//       // Determine which periods to display based on the day
//       let periodsForDay =
//         day === "Saturday" ? filteredSatPeriods : filteredPeriods;

//       periodsForDay.forEach((period) => {
//         rows.push(
//           <tr key={period.period_no}>
//             <td className="border p-2 text-center">{period.period_no}</td>
//             {days.map((day) => (
//               <td key={day} className="border p-2">
//                 <select
//                   className="border p-1 w-full"
//                   value={
//                     localSelectedSubjects?.[day]?.[period.period_no]?.id || ""
//                   }
//                   onChange={(e) =>
//                     handleSubjectChange(day, period.period_no, {
//                       id: e.target.value,
//                       name:
//                         subjects.find((s) => s.id === e.target.value)
//                           ?.subjectname || "",
//                     })
//                   }
//                 >
//                   <option value="">Select Subject</option>
//                   {subjects.map((subject, i) => (
//                     <option key={i} value={subject.id}>
//                       {subject.subjectname} - {subject.teachers}
//                     </option>
//                   ))}
//                 </select>
//               </td>
//             ))}
//           </tr>
//         );
//       });
//     });

//     return rows;
//   };

//   // Determine which days to render based on rowCounts
//   const daysForTable = [
//     "Monday",
//     "Tuesday",
//     "Wednesday",
//     "Thursday",
//     "Friday",
//     rowCounts.sat > 0 && "Saturday", // Only include Saturday if rowCounts.sat > 0
//   ].filter(Boolean); // Remove any falsy values (i.e., if `rowCounts.sat = 0`)

//   return (
//     <div className="overflow-x-auto">
//       {loading ? (
//         <div className="flex justify-center items-center p-5">
//           <span className="loader">Loading...</span>
//         </div>
//       ) : (
//         <table className="table-auto w-full border-collapse border border-gray-300">
//           <thead>
//             <tr className="bg-gray-200 text-gray-600">
//               <th className="border p-2 text-center">Periods</th>
//               {daysForTable.map((day) => (
//                 <th key={day} className="border p-2 text-center">
//                   {day}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>{renderRows(daysForTable)}</tbody>
//         </table>
//       )}
//     </div>
//   );
// }
