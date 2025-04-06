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

// console.log("Allocated Periods:", allocatedPeriods);
// console.log("Used Periods:", usedPeriods);
// console.log("Periods:", periods);
// console.log("Subjects:", subjects);
// console.log("Loading:", loading);
// console.log("Selected Subjects:", selectedSubjects);
// console.log("Handle Table Data Function:", handleTableData);
// console.log("Active Tab:", activeTab);
// console.log("Tabs:", tabs);
// console.log("Row Counts:", rowCounts);
//   useEffect(() => {
//     if (selectedSubjects[key]) {
//       setLocalSelectedSubjects(selectedSubjects[key]);
//     } else {
//       setLocalSelectedSubjects({});
//     }
//   }, [selectedSubjects, key]);

//   const handleSubjectChange = (day, period_no, selectedSubject) => {
//     if (!classId || !sectionId) return;

//     const currentSelectedSubject = localSelectedSubjects?.[day]?.[period_no];

//     // Handle Deselection (when subject is cleared)
//     if (!selectedSubject.id) {
//       if (currentSelectedSubject) {
//         // If a subject was previously selected, decrease the usedPeriods count
//         setUsedPeriods((prev) => (prev > 0 ? prev - 1 : 0));
//       }

//       // Remove the selected subject (deselecting)
//       const updatedSubjects = {
//         ...localSelectedSubjects,
//         [day]: {
//           ...(localSelectedSubjects[day] || {}),
//           [period_no]: null, // Set to null if subject is deselected
//         },
//       };
//       setLocalSelectedSubjects(updatedSubjects);
//       handleTableData(classId, sectionId, day, period_no, selectedSubject);
//       return;
//     }

//     // Handle Subject Change (Switching between subjects without deselecting)
//     if (
//       currentSelectedSubject &&
//       currentSelectedSubject.id !== selectedSubject.id
//     ) {
//       // Decrease usedPeriods for the old subject
//       setUsedPeriods((prev) => (prev > 0 ? prev - 1 : 0));

//       // If we haven't reached the allocated periods, increase usedPeriods for the new subject
//       if (usedPeriods < allocatedPeriods) {
//         setUsedPeriods((prev) => prev + 1);
//       }
//     }

//     // Handle Selecting a Subject After Deselecting (new subject selection after clearing)
//     if (!currentSelectedSubject || currentSelectedSubject.id === "") {
//       // If the previous subject was deselected, we increase the usedPeriods by 1
//       if (usedPeriods < allocatedPeriods) {
//         setUsedPeriods((prev) => prev + 1);
//       }
//     }

//     // Update the selected subject for the specific period
//     const updatedSubjects = {
//       ...localSelectedSubjects,
//       [day]: {
//         ...(localSelectedSubjects[day] || {}),
//         [period_no]: { id: selectedSubject.id, name: selectedSubject.name },
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
//                   disabled={
//                     usedPeriods >= allocatedPeriods &&
//                     !localSelectedSubjects?.[day]?.[rowIndex + 1]?.id
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
// above one working well

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

    if (!selectedSubject.id) {
      if (currentSelectedSubject) {
        setUsedPeriods((prev) => (prev > 0 ? prev - 1 : 0));
      }

      const updatedSubjects = {
        ...localSelectedSubjects,
        [day]: {
          ...(localSelectedSubjects[day] || {}),
          [period_no]: null,
        },
      };
      setLocalSelectedSubjects(updatedSubjects);
      handleTableData(classId, sectionId, day, period_no, selectedSubject);
      return;
    }

    if (
      currentSelectedSubject &&
      currentSelectedSubject.id !== selectedSubject.id
    ) {
      setUsedPeriods((prev) => (prev > 0 ? prev - 1 : 0));

      if (usedPeriods < allocatedPeriods) {
        setUsedPeriods((prev) => prev + 1);
      }
    }

    if (!currentSelectedSubject || currentSelectedSubject.id === "") {
      if (usedPeriods < allocatedPeriods) {
        setUsedPeriods((prev) => prev + 1);
      }
    }

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

  // const renderRows = (days) => {
  //   const rows = [];
  //   const maxRows = Math.max(rowCounts.mon_fri, rowCounts.sat);

  //   for (let rowIndex = 0; rowIndex < maxRows; rowIndex++) {
  //     rows.push(
  //       <tr key={`row-${rowIndex}`}>
  //         <td className="border p-2 text-center">{rowIndex + 1}</td>
  //         {days.map((day) => {
  //           if (day === "Saturday" && rowIndex >= rowCounts.sat) {
  //             return <td key={day} className="border p-2"></td>;
  //           }

  //           const selectedPeriod = localSelectedSubjects?.[day]?.[rowIndex + 1];

  //           // const periodData = periods.find(
  //           //   (period) =>
  //           //     period.subject === subjectName &&
  //           //     period.period_no === rowIndex + 1
  //           // );

  //           const periodData = periods.find(
  //             (period) => period.period_no === rowIndex + 1
  //           );

  //           const subjectName = periodData ? periodData.subject_id : " ";
  //           const teacherName = periodData ? periodData.teachers : " ";

  //           return (
  //             <td key={day} className="border p-2">
  //               {/* Subject Name */}
  //               <div className="flex flex-col">
  //                 <span className="w-full border-2 border-black text-gray-600 font-medium text-sm">
  //                   Subject:
  //                 </span>{" "}
  //                 <span className="text-xs ">{subjectName || " "}</span>
  //                 {/* Teacher Name */}
  //                 <span className="text-gray-600 font-medium text-sm">
  //                   Teacher:
  //                 </span>{" "}
  //                 <span className="text-xs ">{teacherName || " "}</span>
  //               </div>

  //               {/* Subject Dropdown */}
  //               <select
  //                 className="border p-1 w-full mt-2"
  //                 value={selectedPeriod?.id || ""}
  //                 onChange={(e) => {
  //                   const selectedSub = {
  //                     id: e.target.value,
  //                     name:
  //                       subjects.find((s) => s.id === e.target.value)
  //                         ?.subjectname || "",
  //                   };
  //                   handleSubjectChange(day, rowIndex + 1, selectedSub);
  //                 }}
  //                 disabled={
  //                   usedPeriods >= allocatedPeriods && !selectedPeriod?.id
  //                 }
  //               >
  //                 <option value="">Select</option>
  //                 {subjects.map((subject) => (
  //                   <option key={subject.subject_id} value={subject.subject_id}>
  //                     {subject.subjectname}
  //                   </option>
  //                 ))}
  //               </select>
  //             </td>
  //           );
  //         })}
  //       </tr>
  //     );
  //   }
  //   return rows;
  // };
  const renderRows = (days) => {
    const rows = [];
    const maxRows = Math.max(rowCounts.mon_fri, rowCounts.sat);

    for (let rowIndex = 0; rowIndex < maxRows; rowIndex++) {
      rows.push(
        <tr key={`row-${rowIndex}`}>
          {/* Periods Column */}
          <td className="border p-2 text-center bg-gray-100 w-16">
            {rowIndex + 1}
          </td>

          {days.map((day) => {
            if (day === "Saturday" && rowIndex >= rowCounts.sat) {
              return <td key={day} className="border p-2"></td>;
            }

            const selectedPeriod = localSelectedSubjects?.[day]?.[rowIndex + 1];

            const periodData = periods.find(
              (period) => period.period_no === rowIndex + 1
            );

            const subjectName = periodData ? periodData.subject_id : " ";
            const teacherName = periodData ? periodData.teachers : " ";

            return (
              <td key={day} className="border p-2">
                {/* Subject and Teacher Info */}
                <div className="flex flex-col w-full text-sm text-gray-600">
                  <div className="mb-1">
                    <span className="font-medium">Subject: </span>
                    <span className="break-words text-xs">
                      {subjectName || " "}
                    </span>
                  </div>

                  <div>
                    <span className="font-medium">Teacher: </span>
                    <span className="break-words text-xs">
                      {teacherName || " "}
                    </span>
                  </div>
                </div>

                {/* Subject Dropdown */}
                <select
                  className="border p-1 w-full mt-2"
                  value={selectedPeriod?.id || ""}
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
                    usedPeriods >= allocatedPeriods && !selectedPeriod?.id
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
