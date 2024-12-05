// 100% workking but not supporting
// import { useEffect, useState } from "react";
// import axios from "axios";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { useNavigate, useLocation } from "react-router-dom";
// import { RxCross1 } from "react-icons/rx";
// import Loader from "../../common/LoaderFinal/LoaderStyle";
// import { FiPrinter } from "react-icons/fi";

// const ViewExamTimeTable = () => {
//   const API_URL = import.meta.env.VITE_API_URL; // API base URL
//   const location = useLocation();
//   const { staff } = location.state || {};
//   const [loading, setLoading] = useState(false);
//   const [timetable, setTimetable] = useState([]);
//   const [examDetails, setExamDetails] = useState({
//     examname: "",
//     classname: "",
//   });
//   const [description, setDescription] = useState("");

//   const navigate = useNavigate();

//   // Fetch timetable data on component mount
//   useEffect(() => {
//     const fetchTimetableData = async () => {
//       try {
//         const token = localStorage.getItem("authToken");

//         setLoading(true);
//         const response = await axios.get(
//           `${API_URL}/api/get_viewtimetable?exam_id=${staff?.exam_tt_id}`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );
//         const data = response.data;
//         if (data?.success) {
//           setTimetable(data.exam_timetable_details || []);
//           setExamDetails(data.classterm || {});
//         } else {
//           toast.error("Failed to fetch timetable data.");
//         }
//       } catch (error) {
//         console.error("Error fetching timetable:", error);
//         toast.error("An error occurred while fetching timetable data.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTimetableData();
//   }, [API_URL, staff?.exam_tt_id]);

//   // Print page functionality
//   const handlePrint = () => {
//     const headerContent = `
//       <div style="font-size: 18px; text-align: center;">
//         <p><strong>Timetable of ${examDetails.examname}</strong></p>
//         <p><strong>Class ${examDetails.classname}</strong></p>
//       </div>
//     `;

//     const descriptionContent = `
//       <div style="margin-top: 20px; font-size: 16px;">
//         <strong>Description:</strong>
//         <p>${description || "No description provided."}</p>
//       </div>
//     `;

//     const timetableContent = `
//       <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
//         <thead>
//           <tr>
//             <th style="border: 1px solid #ddd; padding: 8px; text-align: center; background-color: #f4f4f4;">Date</th>
//             <th style="border: 1px solid #ddd; padding: 8px; text-align: center; background-color: #f4f4f4;">Subjects</th>
//           </tr>
//         </thead>
//         <tbody>
//           ${timetable
//             .map(
//               (row, index) => `
//             <tr>
//               <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${
//                 row.date
//               }</td>
//               <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">
//                 ${
//                   row.study_leave
//                     ? `<span style="color: red;">${row.study_leave}</span>`
//                     : row.subjects || "-"
//                 }
//               </td>
//             </tr>
//           `
//             )
//             .join("")}
//         </tbody>
//       </table>
//     `;

//     const printWindow = window.open("", "", "height=500,width=800");
//     printWindow.document.write(`
//       <html>
//         <head>
//           <title>Print Timetable</title>
//           <style>
//             body { font-family: Arial, sans-serif; margin: 20px; }
//             table { border-collapse: collapse; width: 100%; }
//             th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
//             th { background-color: #f4f4f4; }
//             p { font-size: 16px; }
//           </style>
//         </head>
//         <body>
//           ${headerContent}
//           ${timetableContent}
//           ${descriptionContent}
//         </body>
//       </html>
//     `);
//     printWindow.document.close();
//     printWindow.print();
//   };

//   return (
//     <div className="w-full md:w-[80%] mx-auto p-4">
//       <ToastContainer />
//       <div className="card p-4 rounded-md">
//         <div className="card-header mb-4 flex justify-between items-center">
//           <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
//             View Exam Timetable
//           </h5>
//           <RxCross1
//             className="float-end relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
//             onClick={() => navigate("/examTimeTable")}
//           />
//         </div>
//         <div
//           className="relative w-full -top-6 h-1 mx-auto bg-red-700"
//           style={{ backgroundColor: "#C03078" }}
//         ></div>
//         <div className="w-full text-sm md:text-[1.4em] text-opacity-90 font-semibold text-blue-700 flex flex-row justify-center items-center">
//           Timetable of{" "}
//           <span className="px-1 md:px-2">{examDetails.examname}</span> (Class{" "}
//           <span className="text-pink-500 px-1 md:px-2">
//             {examDetails.classname}
//           </span>
//           )
//         </div>
//         <div id="printable-area" className="w-full mx-auto py-4 px-1 md:px-4">
//           <div className="card bg-gray-100 py-2 px-3 rounded-md">
//             <div className="overflow-x-auto">
//               <table className="table-auto mt-4 w-full border-collapse border bg-gray-50 border-gray-300">
//                 <thead>
//                   <tr className="bg-gray-100">
//                     <th className="border p-2 font-semibold text-center">
//                       Date
//                     </th>
//                     <th className="border p-2 font-semibold text-center">
//                       Subjects
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {loading ? (
//                     <tr>
//                       <td colSpan={2} className="text-center p-4">
//                         <Loader />
//                       </td>
//                     </tr>
//                   ) : (
//                     timetable.map((row, index) => (
//                       <tr key={index}>
//                         <td className="border p-2 text-center">{row.date}</td>
//                         <td
//                           className={`border p-2 text-center ${
//                             row.study_leave ? "text-red-500 font-semibold" : ""
//                           }`}
//                         >
//                           {row.study_leave
//                             ? row.study_leave
//                             : row.subjects || "-"}
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>
//             <div className="mt-4 ml-0 md:ml-5">
//               <label
//                 htmlFor="description"
//                 className="block font-semibold text-[1em] mb-2 text-gray-700"
//               >
//                 Description:
//               </label>
//               <textarea
//                 type="text"
//                 id="description"
//                 maxLength={500}
//                 value={description}
//                 onChange={(e) => setDescription(e.target.value)}
//                 className="border border-gray-300 p-2 w-full shadow-md mb-2"
//               />
//             </div>
//           </div>
//         </div>
//         <div className="mt-4 flex justify-end">
//           <button
//             onClick={handlePrint}
//             className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//           >
//             <FiPrinter />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ViewExamTimeTable;
