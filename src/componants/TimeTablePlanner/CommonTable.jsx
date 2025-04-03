// export default function CommonTable({ periods, subjects }) {
//   return (
//     <div className="overflow-x-auto">
//       <table className="table-auto w-full border-collapse border border-gray-300">
//         <thead>
//           <tr>
//             <th className="border p-2">Periods</th>
//             <th className="border p-2">Monday</th>
//             <th className="border p-2">Tuesday</th>
//             <th className="border p-2">Wednesday</th>
//             <th className="border p-2">Thursday</th>
//             <th className="border p-2">Friday</th>
//             <th className="border p-2">Saturday</th>
//           </tr>
//         </thead>
//         <tbody>
//           {Array.from({ length: periods }).map((_, idx) => (
//             <tr key={idx}>
//               <td className="border p-2">{idx + 1}</td>
//               {[
//                 "Monday",
//                 "Tuesday",
//                 "Wednesday",
//                 "Thursday",
//                 "Friday",
//                 "Saturday",
//               ].map((day) => (
//                 <td key={day} className="border p-2">
//                   <select className="border p-1 w-full">
//                     <option value="">Select Subject</option>
//                     {subjects.map((subject, i) => (
//                       <option key={i} value={subject}>
//                         {subject}
//                       </option>
//                     ))}
//                   </select>
//                 </td>
//               ))}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }
// export default function CommonTable({ periods, subjects, loading }) {
//   return (
//     <div className="overflow-x-auto">
//       {/* Loader: Display while loading data */}
//       {loading ? (
//         <div className="flex justify-center items-center p-5">
//           <span className="loader">Loading...</span>
//         </div>
//       ) : (
//         <table className="table-auto w-full border-collapse border border-gray-300">
//           <thead>
//             <tr>
//               <th className="border p-2">Periods</th>
//               <th className="border p-2">Monday</th>
//               <th className="border p-2">Tuesday</th>
//               <th className="border p-2">Wednesday</th>
//               <th className="border p-2">Thursday</th>
//               <th className="border p-2">Friday</th>
//               <th className="border p-2">Saturday</th>
//             </tr>
//           </thead>
//           <tbody>
//             {periods.map((period, idx) => (
//               <tr key={idx}>
//                 <td className="border p-2">{period.period_no}</td>
//                 {[
//                   "Monday",
//                   "Tuesday",
//                   "Wednesday",
//                   "Thursday",
//                   "Friday",
//                   "Saturday",
//                 ].map((day) => {
//                   // Check if there's a subject for the current day and period
//                   const subjectForDay = subjects.find(
//                     (subject) =>
//                       subject.day === day &&
//                       subject.period_no === period.period_no
//                   );

//                   return (
//                     <td key={day} className="border p-2">
//                       <select className="border p-1 w-full">
//                         <option value="">Select Subject</option>
//                         {subjects.map((subject, i) => (
//                           <option key={i} value={subject.subject}>
//                             {subject.subjectname}
//                           </option>
//                         ))}
//                       </select>
//                     </td>
//                   );
//                 })}
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
  tabs, // ✅ Get tabs from parent
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

  return (
    <div className="overflow-x-auto">
      {loading ? (
        <div className="flex justify-center items-center p-5">
          <span className="loader">Loading...</span>
        </div>
      ) : (
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200 text-gray-600">
              <th className="border p-2 text-center">Periods</th>
              <th className="border p-2 text-center">Monday</th>
              <th className="border p-2 text-center">Tuesday</th>
              <th className="border p-2 text-center">Wednesday</th>
              <th className="border p-2 text-center">Thursday</th>
              <th className="border p-2 text-center">Friday</th>
              <th className="border p-2 text-center">Saturday</th>
            </tr>
          </thead>
          <tbody>
            {periods.map((period, i) => (
              <tr key={i}>
                <td className="border p-2 text-center">{period.period_no}</td>
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                ].map((day) => (
                  <td key={day} className="border p-2">
                    <select
                      className="border p-1 w-full"
                      value={
                        localSelectedSubjects?.[day]?.[period.period_no]?.id ||
                        ""
                      }
                      onChange={(e) =>
                        handleSubjectChange(day, period.period_no, {
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
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// import { useState, useEffect } from "react";

// export default function CommonTable({
//   periods,
//   subjects,
//   loading,
//   handleTableData,
// }) {
//   const [selectedSubjects, setSelectedSubjects] = useState([]);

//   useEffect(() => {
//     // Initialize the selectedSubjects array based on the initial subjects passed from the parent
//     const initialSelectedSubjects = periods.map(() => ({
//       Monday: "",
//       Tuesday: "",
//       Wednesday: "",
//       Thursday: "",
//       Friday: "",
//       Saturday: "",
//     }));
//     setSelectedSubjects(initialSelectedSubjects);
//   }, [periods]);

//   const handleSubjectChange = (day, period_no, selectedSubject) => {
//     // Update the selectedSubjects state when a user selects a subject
//     const updatedSubjects = [...selectedSubjects];
//     updatedSubjects[period_no][day] = selectedSubject;

//     setSelectedSubjects(updatedSubjects);

//     // Send updated data to the parent component via handleTableData
//     handleTableData(updatedSubjects);
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
//             <tr>
//               <th className="border p-2">Periods</th>
//               <th className="border p-2">Monday</th>
//               <th className="border p-2">Tuesday</th>
//               <th className="border p-2">Wednesday</th>
//               <th className="border p-2">Thursday</th>
//               <th className="border p-2">Friday</th>
//               <th className="border p-2">Saturday</th>
//             </tr>
//           </thead>
//           <tbody>
//             {periods.map((period, idx) => (
//               <tr key={idx}>
//                 <td className="border p-2">{period.period_no}</td>

//                 {[
//                   "Monday",
//                   "Tuesday",
//                   "Wednesday",
//                   "Thursday",
//                   "Friday",
//                   "Saturday",
//                 ].map((day) => {
//                   const subjectForDay = subjects.find(
//                     (subject) =>
//                       subject.day === day &&
//                       subject.period_no === period.period_no
//                   );
//                   return (
//                     <td key={day} className="border p-2">
// <select
//   className="border p-1 w-full"
//   value={selectedSubjects[period.period_no]?.[day] || ""}
//   onChange={(e) =>
//     handleSubjectChange(
//       day,
//       period.period_no,
//       e.target.value
//     )
//   }
// >
//   <option value="">Select Subject</option>
//   {subjects.map((subject, i) => (
//     <option key={i} value={subject.subject}>
//       {subject.subjectname} - {subject.teachers}
//     </option>
//   ))}
// </select>
//                     </td>
//                   );
//                 })}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// }
