// import { useState, useEffect, useRef, useMemo } from "react";
// // import html2pdf from "html2pdf.js";
// import axios from "axios";
// import React from "react";
// // import { useReactToPrint } from "react-to-print";
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { useLocation, useNavigate, useParams } from "react-router-dom";
// import { RxCross1 } from "react-icons/rx";
// import bgImageNursery from "../../../../assets/HPC/SACS/Nur HPC COVER.jpg";
// import bgImageLKG from "../../../../assets/HPC/SACS/LKG HPC COVER.jpg";
// import bgImageUKG from "../../../../assets/HPC/SACS/UKG HPC COVER.jpg";
// import bgImageFirst from "../../../../assets/HPC/SACS/STD 1 HPC COVER.jpg";
// import bgImageSecond from "../../../../assets/HPC/SACS/STD 2 HPC COVER.jpg";
// import AllAboutMe from "../../../../assets/HPC/SACS/HPC_Cover/All about me.jpg";
// import AboutMyself from "../../../../assets/HPC/SACS/HPC_Cover/About myself.jpg";
// // import Language from "../../../../assets/HPC/SACS/HPC_Cover/Language_3.jpg";
// import Language from "../../../../assets/HPC/SACS/HPC_Cover/Domains.jpg";
// // import LearnerPeer from "../../../../assets/HPC/SACS/HPC_Cover/learner feedback and peer feedback_7.jpg";
// import LearnerPeer from "../../../../assets/HPC/SACS/HPC_Cover/Learner peer feedback.jpg";
// import TeacherParent from "../../../../assets/HPC/SACS/HPC_Cover/Teacher and parent feedback.jpg";
// import BackCover from "../../../../assets/HPC/SACS/HPC_Cover/BACK COVER_10.jpg";
// import BeginnerImg from "../../../../assets/HPC/SACS/images/Beginner - symbol seed.png";
// import ProgressingImg from "../../../../assets/HPC/SACS/images/Progressing - symbol plant.png";
// import ProficientImg from "../../../../assets/HPC/SACS/images/Proficient- symbol tree.png";

// // const PAGE_HEIGHT = 998; // adjust based on px per A4

// // const estimateSubjectHeight = (subj) => {
// //   // Estimate subject table height
// //   const baseHeight = 200; // heading + header rows
// //   const rowHeight = 45; // each competency/detail row
// //   return (
// //     baseHeight +
// //     subj.competencies.reduce(
// //       (sum, comp) => sum + comp.details.length * rowHeight,
// //       0
// //     )
// //   );
// // };

// // const paginateSubjects = (subjects) => {
// //   const pages = [];
// //   let currentPage = [];
// //   let currentHeight = 0;

// //   subjects.forEach((subj) => {
// //     const subjHeight = estimateSubjectHeight(subj);

// //     // 🔑 if subject won't fit → push current page & start new one
// //     if (currentHeight + subjHeight > PAGE_HEIGHT) {
// //       if (currentPage.length > 0) {
// //         pages.push(currentPage);
// //       }
// //       currentPage = [subj];
// //       currentHeight = subjHeight;
// //     } else {
// //       currentPage.push(subj);
// //       currentHeight += subjHeight;
// //     }
// //   });

// //   if (currentPage.length > 0) {
// //     pages.push(currentPage);
// //   }

// //   return pages;
// // };

// const PAGE_HEIGHT = 800; // height per page in px

// // Estimate height of one subject block
// const estimateSubjectHeight = (subject) => {
//   const baseHeight = 200; // subject header + table header
//   const rowHeight = 45; // each learning outcome row
//   return (
//     baseHeight +
//     subject.competencies.reduce(
//       (sum, comp) => sum + comp.details.length * rowHeight,
//       0
//     )
//   );
// };

// // Paginate subjects
// const paginateSubjects = (subjects) => {
//   let pages = [];
//   let currentPage = [];
//   let remainingHeight = PAGE_HEIGHT;

//   subjects.forEach((subj) => {
//     const subjectHeight = estimateSubjectHeight(subj);

//     if (subjectHeight > remainingHeight) {
//       // 🚨 Not enough space, push current page and start new one
//       if (currentPage.length > 0) {
//         pages.push(currentPage);
//         currentPage = [];
//         remainingHeight = PAGE_HEIGHT;
//       }
//     }

//     // Now add the subject to new/current page
//     currentPage.push(subj);
//     remainingHeight -= subjectHeight;
//   });

//   // Push last page if it has data
//   if (currentPage.length > 0) {
//     pages.push(currentPage);
//   }

//   return pages;
// };

// const SubjectTable = ({ subj, terms, domainColors, levelImages, sIndex }) => (
//   <div className="mb-6 rounded-lg border border-gray-300 overflow-hidden">
//     <table className="w-full text-left">
//       <tbody>
//         <tr>
//           <td
//             rowSpan={
//               3 +
//               subj.competencies.reduce(
//                 (sum, comp) => sum + comp.details.length,
//                 0
//               )
//             }
//             className="domain-cell border border-gray-300 p-2 text-center font-bold align-middle"
//             style={{
//               whiteSpace: "nowrap",
//               backgroundColor: domainColors[sIndex % domainColors.length],
//             }}
//           >
//             <div className="vertical-text">{subj.domainname}</div>
//           </td>

//           <td
//             colSpan={4}
//             className="border border-gray-300 p-3 bg-gray-300 font-bold"
//           >
//             {subj.subjectname}
//           </td>
//         </tr>

//         <tr>
//           <td colSpan={4} className="border border-gray-300 p-2">
//             <span className="font-bold">Curriculum goal:</span>{" "}
//             <span className="italic text-sm">{subj.curriculum_goal}</span>
//           </td>
//         </tr>

//         <tr className="bg-gray-100">
//           <td className="border border-gray-300 p-2 font-bold">Competency</td>
//           <td className="border border-gray-300 p-2 font-bold">
//             Learning Outcomes
//           </td>
//           {terms.map((term) => (
//             <td
//               key={term.term_id}
//               className="border border-gray-300 p-2 font-bold whitespace-nowrap"
//             >
//               {term.name}
//             </td>
//           ))}
//         </tr>

//         {subj.competencies.map((comp, cIndex) =>
//           comp.details.map((detail, dIndex) => (
//             <tr key={`${cIndex}-${dIndex}`}>
//               {dIndex === 0 && (
//                 <td
//                   rowSpan={comp.details.length}
//                   className="border border-gray-300 p-2 align-top font-semibold"
//                 >
//                   {comp.competency || ""}
//                 </td>
//               )}
//               <td className="border border-gray-300 p-2">
//                 {detail.learning_outcomes}
//               </td>
//               <td className="border border-gray-300 p-2">
//                 {detail.parameter_value?.[1] ? (
//                   <img
//                     src={levelImages[detail.parameter_value[1]]}
//                     alt={detail.parameter_value[1]}
//                     className="h-8 mx-auto"
//                   />
//                 ) : (
//                   ""
//                 )}
//               </td>
//               <td className="border border-gray-300 p-2">
//                 {detail.parameter_value?.[2] ? (
//                   <img
//                     src={levelImages[detail.parameter_value[2]]}
//                     alt={detail.parameter_value[2]}
//                     className="h-8 mx-auto"
//                   />
//                 ) : (
//                   ""
//                 )}
//               </td>
//             </tr>
//           ))
//         )}
//       </tbody>
//     </table>
//   </div>
// );

// const HPCReportCard = () => {
//   const API_URL = import.meta.env.VITE_API_URL;
//   const location = useLocation();
//   const { student, class_id, section_id } = location.state || {};
//   console.log("student", student);
//   const classID = student?.get_class?.class_id || null;
//   const class_Name = student?.get_class?.name || null;
//   console.log("className", class_Name);
//   const { id } = useParams();

//   const levelImages = {
//     Beginner: BeginnerImg,
//     Progressing: ProgressingImg,
//     Proficient: ProficientImg,
//   };

//   const navigate = useNavigate();
//   const [data, setData] = useState([]);
//   const [allstudent, setAllStudent] = useState("");
//   const [attendance, setAttendance] = useState([]);
//   const [learner, setLearner] = useState([]);
//   const [peerFeedback, setPeerFeedback] = useState([]);
//   const [parentFeedback, setParentFeedback] = useState([]);
//   const [classTeacher, setClassTeacher] = useState([]);
//   const [terms, setTerms] = useState([]);

//   const [subject, setSubject] = useState([]);

//   const [academic, setAcademic] = useState("");

//   const [roleId, setRoleId] = useState("");
//   const [regId, setRegId] = useState("");
//   const [pdfMode, setPdfMode] = useState(false);

//   const classConfig = {
//     Nursery: {
//       bg: bgImageNursery,
//       span: {
//         screen: {
//           text: academic,
//           style: {
//             top: "55.5%",
//             left: "58%",
//             transform: "translate(-50%, -50%)",
//           },
//         },
//         pdf: {
//           text: academic,
//           style: {
//             top: "54.5%",
//             left: "58%",
//             transform: "translate(-50%, -50%)",
//           },
//         },
//       },
//     },
//     LKG: {
//       bg: bgImageLKG,
//       span: {
//         screen: {
//           text: academic,
//           style: {
//             top: "63%",
//             left: "59.5%",
//             transform: "translate(-50%, -50%)",
//           },
//         },
//         pdf: {
//           text: academic,
//           style: {
//             top: "62%",
//             left: "58.5%",
//             transform: "translate(-50%, -50%)",
//           },
//         },
//       },
//     },
//     UKG: {
//       bg: bgImageUKG,
//       span: {
//         screen: {
//           text: academic,
//           style: {
//             top: "60.5%",
//             left: "59.5%",
//             transform: "translate(-50%, -50%)",
//           },
//         },
//         pdf: {
//           text: academic,
//           style: {
//             top: "60%",
//             left: "58.5%",
//             transform: "translate(-50%, -50%)",
//           },
//         },
//       },
//     },
//     1: {
//       bg: bgImageFirst,
//       span: {
//         screen: {
//           text: academic,
//           style: {
//             top: "61.5%",
//             left: "62%",
//             transform: "translate(-50%, -50%)",
//           },
//         },
//         pdf: {
//           text: academic,
//           style: {
//             top: "61%",
//             left: "61%",
//             transform: "translate(-50%, -50%)",
//           },
//         },
//       },
//     },
//     2: {
//       bg: bgImageSecond,
//       span: {
//         screen: {
//           text: academic,
//           style: {
//             top: "58.5%",
//             left: "59.5%",
//             transform: "translate(-50%, -50%)",
//           },
//         },
//         pdf: {
//           text: academic,
//           style: {
//             top: "58%",
//             left: "59%",
//             transform: "translate(-50%, -50%)",
//           },
//         },
//       },
//     },
//   };

//   const currentConfig = classConfig[class_Name];

//   const pdfRef = useRef();

//   //   const handlePrint = useReactToPrint({
//   //     contentRef: pdfRef,
//   //     documentTitle: "HPC Report Card",
//   //   });

//   // const handleDownload = async () => {
//   //   const element = document.querySelector(".print-container");

//   //   // Add PDF-safe overrides
//   //   setPdfMode(true);
//   //   console.log("PDF Mode (after enabling):", true);
//   //   element.classList.add("pdf-mode");

//   //   const opt = {
//   //     margin: [0, 0], // keep margins inside CSS instead
//   //     filename: `HPC_Report_Card_${id}.pdf`,
//   //     image: { type: "jpeg", quality: 0.98 },
//   //     html2canvas: { scale: 2, useCORS: true },
//   //     jsPDF: { unit: "mm", format: [250, 296], orientation: "portrait" }, // custom size
//   //   };

//   //   try {
//   //     await html2pdf().set(opt).from(element).save();
//   //   } finally {
//   //     element.classList.remove("pdf-mode");
//   //     setPdfMode(false);
//   //     console.log("PDF Mode (after disabling):", false);
//   //   }
//   // };

//   //   const handleDownload = async () => {
//   //     const element = document.querySelector(".print-container");

//   //     // Add PDF-safe overrides
//   //     setPdfMode(true);
//   //     element.classList.add("pdf-mode");

//   //     const opt = {
//   //       margin: [0, 0],
//   //       filename: `HPC_Report_Card_${id}.pdf`,
//   //       image: { type: "jpeg", quality: 0.98 },
//   //       html2canvas: { scale: 2, useCORS: true },
//   //       jsPDF: { unit: "mm", format: [250, 296], orientation: "portrait" },
//   //     };

//   //     try {
//   //       await html2pdf()
//   //         .set(opt)
//   //         .from(element)
//   //         .toPdf()
//   //         .get("pdf")
//   //         .then((pdf) => {
//   //           const totalPages = pdf.internal.getNumberOfPages();

//   //           if (totalPages > 1) {
//   //             pdf.deletePage(totalPages); // remove last page
//   //           }

//   //           pdf.save(`HPC_Report_Card_${id}.pdf`);
//   //         });
//   //     } finally {
//   //       element.classList.remove("pdf-mode");
//   //       setPdfMode(false);
//   //     }
//   //   };

//   useEffect(() => {
//     fetchDataRoleId();
//     fetchTerms();
//     fetchAllAboutMe();
//     fetchSubjects();
//     fetchLearnerFeedback();
//     fetchPeerFeedback();
//     fetchParentFeedback();
//     fetchClassTeacherRemark();
//   }, []);

//   const fetchTerms = async () => {
//     const token = localStorage.getItem("authToken");
//     try {
//       const response = await axios.get(`${API_URL}/api/get_Term`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       setTerms(response.data);
//     } catch (err) {
//       console.error("Error fetching exams:", err);
//     }
//   };

//   const fetchAllAboutMe = async () => {
//     const token = localStorage.getItem("authToken");
//     try {
//       const response = await axios.get(
//         `${API_URL}/api/get_allaboutmebystudentid?student_id=${id}&class_id=${classID}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       setData(response.data.data.allAboutMe);
//       setAllStudent(response.data.data.student);
//       setAttendance(response.data.data.attendance);
//     } catch (err) {
//       console.error("Error fetching exams:", err);
//     }
//   };

//   const fetchSubjects = async () => {
//     const token = localStorage.getItem("authToken");
//     try {
//       const response = await axios.get(
//         `${API_URL}/api/get_domaindetailsbystudentid?student_id=${id}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       // console.log("student", response.data.data);
//       setSubject(response.data.data);
//     } catch (err) {
//       console.error("Error fetching exams:", err);
//     }
//   };

//   const pages = useMemo(() => paginateSubjects(subject), [subject]);

//   const fetchLearnerFeedback = async () => {
//     const token = localStorage.getItem("authToken");
//     try {
//       const response = await axios.get(
//         `${API_URL}/api/get_selfassessmentbystudentid?student_id=${id}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       // console.log("learner", response.data.data);
//       setLearner(response.data.data);
//     } catch (err) {
//       console.error("Error fetching exams:", err);
//     }
//   };

//   const fetchPeerFeedback = async () => {
//     const token = localStorage.getItem("authToken");
//     try {
//       const response = await axios.get(
//         `${API_URL}/api/get_peerfeedbackbystudentid?student_id=${id}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       // console.log("peer", response.data.data);
//       setPeerFeedback(response.data.data);
//     } catch (err) {
//       console.error("Error fetching exams:", err);
//     }
//   };

//   const fetchParentFeedback = async () => {
//     const token = localStorage.getItem("authToken");
//     try {
//       const response = await axios.get(
//         `${API_URL}/api/get_parentfeedbackbystudentid?student_id=${id}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       // console.log("parents", response.data.data);
//       setParentFeedback(response.data.data);
//     } catch (err) {
//       console.error("Error fetching exams:", err);
//     }
//   };

//   const fetchClassTeacherRemark = async () => {
//     const token = localStorage.getItem("authToken");
//     try {
//       const response = await axios.get(
//         `${API_URL}/api/get_classteacherremarkbystudentid?student_id=${id}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       // console.log("classteacher", response.data.data);
//       setClassTeacher(response.data.data);
//     } catch (err) {
//       console.error("Error fetching exams:", err);
//     }
//   };

//   const fetchDataRoleId = async () => {
//     const token = localStorage.getItem("authToken");

//     if (!token) {
//       console.error("No authentication token found");
//       return;
//     }

//     try {
//       const sessionResponse = await axios.get(`${API_URL}/api/sessionData`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const role_id = sessionResponse.data.user.role_id;
//       const reg_id = sessionResponse.data.user.reg_id;
//       const academic_yr = sessionResponse.data.custom_claims.academic_year;

//       setRoleId(role_id);
//       setRegId(reg_id);
//       setAcademic(academic_yr);

//       // console.log("roleIDis:", role_id);
//       // console.log("reg id:", reg_id);

//       return { roleId, regId };
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };

//   const toCamelCase = (str) => {
//     if (!str) return "";
//     return str
//       .toLowerCase()
//       .split(" ")
//       .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//       .join(" ");
//   };

//   const domainColors = [
//     "#ADD8E6", // Light Blue
//     "#FFCCE5", // Lighter Pink (pastel pink)
//     "#FFFACD", // Lemon Chiffon (slightly darker light yellow)
//     "#C1E1C1", // Pastel Green (lighter than #90EE90)
//     "#FFDAB9", // Peach Puff (lighter orange shade)
//     "lavender", // Soft Purple
//   ];

//   return (
//     <>
//       <div className="transition-all duration-500 w-full max-w-[900px] mx-auto p-4">
//         <ToastContainer />

//         <div className="card rounded-md">
//           <>
//             <div className="card-header mb-4 flex justify-between items-center ">
//               <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
//                 Report Card
//               </h5>
//               {/* <button
//                 onClick={handleDownload}
//                 className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
//               >
//                 Download PDF
//               </button> */}

//               <RxCross1
//                 className="  relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
//                 onClick={() => {
//                   navigate("/dashboard");
//                 }}
//               />
//             </div>
//             <div
//               className=" relative w-[98%]   -top-6 h-1  mx-auto bg-red-700"
//               style={{
//                 backgroundColor: "#C03078",
//               }}
//             ></div>
//           </>

//           <style>
//             {`
//    .print-container {
//    counter-reset: page;
//                 }

//     .print-page {
//     position: relative;
//        counter-increment: page;
//       }

// .print-page::after {
//   content:counter(page);
//   position: absolute;
//   bottom: 35px;
//   right: 30px;
//   font-size: 20px;
//  color: #fff;
//   z-index: 50;
//   font-family: "Comic Sans MS", cursive, sans-serif;
// }

// /* Default: UI (screen) */
// .domain-cell .vertical-text {
//   writing-mode: vertical-rl;
//   text-orientation: mixed;
//   transform: rotate(180deg);   /* keep your UI look */
//   white-space: nowrap;
//   display: inline-block;
//   line-height: 1;
//   padding: 8px 4px;
//   margin: 0;
// }

// /* Only during PDF export */

// .pdf-mode .domain-cell {
//   position: relative;
//   vertical-align: middle;
//   text-align: center;
//   width:45px;
// }

// .pdf-mode .domain-cell .vertical-text {
//   writing-mode: initial;
//   transform: rotate(-90deg);
//   transform-origin: center center;
//   // width:25px;

//   position: absolute;
//   top: 50%;
//   left: 40%;
//   transform: translate(-50%, -50%) rotate(-90deg);

//   display: inline-block;
//   white-space: nowrap;
//   line-height: 1.2;
// }

// .all-about-container {
//   margin-bottom: 0rem;
// }

// .attendance-section {
//   margin-top: 2rem;
//   margin-right: 1rem;
// }

// .aboutme-value {
//   display: inline-block;
//   min-width: 120px;
//   text-align: center;
//   position: relative;        /* needed for ::after */
//   padding-bottom: 0;         /* we will draw the underline separately */
//   line-height: normal !important;
// }

// /* the underline drawn below the text; adjust inset and gap as needed */
// .aboutme-value::after {
//   content: "";
//   position: absolute;
//   left: 8%;                  /* shorten line a bit from sides */
//   right: 8%;
//   height: 1px;               /* thickness of underline */
//   background-color: #1e3a8a; /* Tailwind blue-900 */
//   bottom: -6px;              /* distance (gap) between text baseline and the line */
//   border-radius: 1px;
// }

//  .attendance-gap {
//     margin-bottom: 1rem;
//   }

// @media print {

//   @page {
//   size: 250mm 296mm; /* width height */
//   margin: 15mm 15mm; /* top/bottom left/right */
// }

//   .print-page {
//     width: 240mm;
//     height: 296mm;
//     page-break-before: always;
//     page-break-after: always;
//     position: relative;
//     overflow: hidden;
//   }

//     .all-about-container {
//     position: relative !important;
//     width: 100% !important;
//     height: auto !important;
//     padding: 2rem !important;
//     margin-bottom: 10rem !important; /* extra gap before attendance */
//   }

//   .attendance-section {
//     margin-top: 3rem !important;  /* small gap only */
//   }

//    .aboutme-value::after {
//     bottom: -8px;            /* slightly larger gap in PDF */
//     height: 2px;
//   }
// }
// `}
//           </style>

//           <div ref={pdfRef} className="print-container">
//             {/* First Page */}
//             {currentConfig && (
//               <div className="md:ml-7 md:mr-7 flex justify-center mb-2 print-page">
//                 <div
//                   className="w-full md:w-[1000px] lg:w-[1000px] aspect-[8/10] rounded-md shadow-lg overflow-hidden relative"
//                   style={{
//                     backgroundImage: `url(${currentConfig.bg})`,
//                     backgroundSize: "cover",
//                     backgroundPosition: "center",
//                   }}
//                 >
//                   <span
//                     className="absolute font-bold text-blue-900 p-1 text-xl sm:text-2xl"
//                     style={
//                       pdfMode
//                         ? currentConfig.span.pdf.style
//                         : currentConfig.span.screen.style
//                     }
//                   >
//                     {academic}
//                   </span>
//                 </div>
//               </div>
//             )}
//             {/* All about Me */}
//             <div className="md:ml-7 md:mr-7 flex justify-center mb-2  print-page">
//               <div
//                 className="w-full md:w-[1000px] lg:w-[1000px] aspect-[8/10] rounded-md shadow-lg overflow-hidden relative"
//                 style={{
//                   backgroundImage: `url(${AllAboutMe})`,
//                   backgroundSize: "cover",
//                   backgroundPosition: "center",
//                 }}
//               >
//                 <div
//                   className="absolute top-[12%] left-[10%] w-[80%] h-[65%] flex flex-col  p-6 ms-3 text-lg"
//                   style={{ fontFamily: '"Comic Sans MS", cursive, sans-serif' }}
//                 >
//                   <div className="all-about-container">
//                     {/* All Questions + Favourite section */}
//                     <h2 className="font-bold text-blue-900 text-2xl mb-10 mr-10 text-center">
//                       ALL ABOUT ME
//                     </h2>
//                     {/* Q1 - My name is */}
//                     <div className="flex justify-between items-center w-full md:mb-10">
//                       <span className="font-bold text-blue-900 w-1/2">
//                         My name is
//                       </span>
//                       {/* <span className="text-gray-900 w-1/2 border-b text-center border-blue-900 mr-9 aboutme-value "> */}
//                       <span className="text-gray-900 w-1/2 text-center mr-8 aboutme-value">
//                         {allstudent
//                           ? `${toCamelCase(
//                               allstudent.first_name
//                             )} ${toCamelCase(
//                               allstudent.mid_name
//                             )} ${toCamelCase(allstudent.last_name)}`
//                           : ""}
//                       </span>
//                     </div>

//                     {/* Q2 - I am in class */}
//                     <div className="flex justify-between items-center w-full md:mb-10">
//                       <span className="font-bold text-blue-900 w-1/2">
//                         I am in class
//                       </span>
//                       {/* <span className="text-gray-900 w-1/2 border-b text-center border-blue-900 mr-9 aboutme-value "> */}
//                       <span className="text-gray-900 w-1/2 text-center mr-8 aboutme-value">
//                         {allstudent
//                           ? `${allstudent.classname} ${allstudent.sectionname}`
//                           : ""}
//                       </span>
//                     </div>

//                     {/* Q3 - My birthday is on */}
//                     <div className="flex justify-between items-center w-full md:mb-10">
//                       <span className="font-bold text-blue-900 w-1/2">
//                         My birthday is on
//                       </span>
//                       {/* <span className="text-gray-900 w-1/2 border-b text-center border-blue-900 mr-9 aboutme-value "> */}
//                       <span className="text-gray-900 w-1/2 text-center mr-8 aboutme-value">
//                         {allstudent?.dob
//                           ? allstudent.dob.split("-").reverse().join("-")
//                           : ""}
//                       </span>
//                     </div>

//                     {/* Render the remaining questions dynamically */}
//                     {Array.isArray(data) && (
//                       <>
//                         {(() => {
//                           // Separate My Favourite items
//                           const favouriteItems = data.filter(
//                             (item) =>
//                               item.name.startsWith("My favourite") ||
//                               item.name.startsWith("My Favourite") ||
//                               item.name.startsWith("MY FAVOURITE")
//                           );

//                           const otherItems = data.filter(
//                             (item) =>
//                               item.name !== "My name is" &&
//                               item.name !== "I am in class" &&
//                               item.name !== "My birthday is on" &&
//                               !item.name.startsWith("My favourite") &&
//                               !item.name.startsWith("My Favourite") &&
//                               !item.name.startsWith("MY FAVOURITE")
//                           );

//                           return (
//                             <>
//                               {/* Show all non-favourite items first */}
//                               {otherItems.map((item) => (
//                                 <div
//                                   key={item.am_id}
//                                   className="flex justify-between items-center w-full md:mb-10"
//                                 >
//                                   <span className="font-bold text-blue-900 w-1/2">
//                                     {toCamelCase(item.name)}
//                                   </span>
//                                   {/* <span className="text-gray-900 w-1/2 border-b text-center border-blue-900 mr-9 aboutme-value "> */}
//                                   <span className="text-gray-900 w-1/2 text-center mr-8 aboutme-value">
//                                     {item.aboutme_value}
//                                   </span>
//                                 </div>
//                               ))}

//                               {/* Show My Favourite group at the end */}
//                               {favouriteItems.length > 0 && (
//                                 <div className="flex flex-col w-full">
//                                   {/* Main heading on the left */}
//                                   <div className="w-full md:mb-7">
//                                     <span className="font-bold text-blue-900 text-left text-lg">
//                                       My Favourite
//                                     </span>
//                                   </div>

//                                   {/* Favourite items stacked vertically */}
//                                   <div className="flex flex-col gap-7">
//                                     {favouriteItems.map((fav) => {
//                                       const shortLabel = fav.name
//                                         .replace(/My favourite\s*/i, "")
//                                         .trim();

//                                       return (
//                                         <div
//                                           key={fav.am_id}
//                                           className="flex justify-between items-center w-full"
//                                         >
//                                           {/* Left side = label (Animal, Books, Games...) */}
//                                           <div className=" w-1/2 ">
//                                             <span className="font-bold text-blue-900 ms-28">
//                                               {toCamelCase(shortLabel)}
//                                             </span>
//                                           </div>

//                                           {/* Right side = answer with underline only */}
//                                           {/* <span className="aboutme-value text-gray-900 w-1/2 border-b text-center border-blue-900 mr-9 aboutme-value "> */}
//                                           <span className="text-gray-900 w-1/2 text-center mr-8 aboutme-value">
//                                             {fav.aboutme_value}
//                                           </span>
//                                         </div>
//                                       );
//                                     })}
//                                   </div>
//                                 </div>
//                               )}
//                             </>
//                           );
//                         })()}
//                       </>
//                     )}
//                   </div>

//                   <div
//                     className="attendance-section"
//                     style={
//                       pdfMode ? { marginTop: "10px" } : { marginTop: "0px" }
//                     }
//                   >
//                     <div className="attendance-section">
//                       {/* Attendance Table */}
//                       <h2 className="text-blue-900 font-bold text-xl attendance-gap ">
//                         Attendance
//                       </h2>
//                       <div className="rounded-lg border border-gray-300 overflow-hidden">
//                         <table className="w-full text-center">
//                           <thead>
//                             <tr className="bg-gray-100">
//                               {terms.map((att, index) => (
//                                 <th
//                                   key={index}
//                                   className="border border-gray-300 p-2"
//                                 >
//                                   {att.name}
//                                 </th>
//                               ))}
//                             </tr>
//                           </thead>
//                           <tbody>
//                             <tr>
//                               {attendance.map((att, index) => (
//                                 <td
//                                   key={index}
//                                   className="border border-gray-300 p-2"
//                                 >
//                                   {att.present} / {att.working}
//                                 </td>
//                               ))}
//                             </tr>
//                           </tbody>
//                         </table>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//             {/* Image Uploading */}
//             <div className="md:ml-7 md:mr-7 flex justify-center mb-2 print-page">
//               <div
//                 className="w-full md:w-[1000px] lg:w-[1000px] aspect-[8/10] rounded-md shadow-lg overflow-hidden relative"
//                 style={{
//                   backgroundImage: `url(${AboutMyself})`,
//                   backgroundSize: "cover",
//                   backgroundPosition: "center",
//                 }}
//               >
//                 {/* Student Image */}
//                 {allstudent?.studentimage && (
//                   <div
//                     className="absolute w-[40%] h-[250px] rounded-md shadow-lg overflow-hidden"
//                     style={{
//                       backgroundImage: `url(${allstudent.studentimage})`,
//                       backgroundSize: "cover",
//                       backgroundPosition: "center",
//                       top: "18%",
//                       left: "30%",
//                     }}
//                   ></div>
//                 )}

//                 {/* Family Image */}
//                 {allstudent?.familyimage && (
//                   <div
//                     className="absolute w-[40%] h-[250px] rounded-md shadow-lg overflow-hidden"
//                     style={{
//                       backgroundImage: `url(${allstudent.familyimage})`,
//                       backgroundSize: "cover",
//                       backgroundPosition: "center",
//                       top: "58%",
//                       left: "30%",
//                     }}
//                   ></div>
//                 )}
//               </div>
//             </div>
//             {/* Domain :- Subject Language for workiing correct */}
//             <div className="md:ml-7 md:mr-7 flex flex-col items-center gap-2 mb-2">
//               {subject.map((subj, sIndex) => (
//                 <div
//                   key={sIndex}
//                   className="print-page w-full aspect-[8/10] rounded-md shadow-lg overflow-hidden relative"
//                   style={{
//                     backgroundImage: `url(${Language})`,
//                     backgroundSize: "cover",
//                     backgroundPosition: "center",
//                     padding: "15mm",
//                   }}
//                 >
//                   <div className="relative w-full h-full"></div>
//                   <div
//                     className="absolute top-[14%] left-[10%] w-[75%] ml-5"
//                     style={{
//                       fontFamily: '"Comic Sans MS", cursive, sans-serif',
//                     }}
//                   >
//                     <div className="mb-6 rounded-lg border border-gray-300 overflow-hidden">
//                       <table className="w-full text-left">
//                         <tbody>
//                           <tr>
//                             <td
//                               rowSpan={
//                                 3 +
//                                 subj.competencies.reduce(
//                                   (sum, comp) => sum + comp.details.length,
//                                   0
//                                 )
//                               }
//                               className="domain-cell border border-gray-300 p-2 text-center font-bold align-middle"
//                               style={{
//                                 // writingMode: "vertical-rl",
//                                 // transform: "rotate(180deg)",
//                                 whiteSpace: "nowrap",
//                                 backgroundColor:
//                                   domainColors[sIndex % domainColors.length],
//                               }}
//                             >
//                               <div className="vertical-text">
//                                 {subj.domainname}
//                               </div>
//                             </td>

//                             <td
//                               colSpan={4}
//                               className="border border-gray-300 p-3 bg-gray-300 font-bold"
//                             >
//                               {subj.subjectname}
//                             </td>
//                           </tr>

//                           <tr>
//                             <td
//                               colSpan={4}
//                               className="border border-gray-300 p-2 "
//                             >
//                               <span className="font-bold">
//                                 Curriculum goal:
//                               </span>{" "}
//                               <span className="italic text-sm">
//                                 {subj.curriculum_goal}
//                               </span>
//                             </td>
//                           </tr>

//                           <tr className="bg-gray-100">
//                             <td className="border border-gray-300 p-2 font-bold">
//                               Competency
//                             </td>
//                             <td className="border border-gray-300 p-2 font-bold">
//                               Learning Outcomes
//                             </td>

//                             {terms.map((term) => (
//                               <td
//                                 key={term.term_id}
//                                 className="border border-gray-300 p-2 font-bold whitespace-nowrap"
//                               >
//                                 {term.name}
//                               </td>
//                             ))}
//                           </tr>

//                           {subj.competencies.map((comp, cIndex) =>
//                             comp.details.map((detail, dIndex) => (
//                               <tr key={`${cIndex}-${dIndex}`}>
//                                 {dIndex === 0 && (
//                                   <td
//                                     rowSpan={comp.details.length}
//                                     className="border border-gray-300 p-2 align-top font-semibold"
//                                   >
//                                     {comp.competency || ""}
//                                   </td>
//                                 )}
//                                 <td className="border border-gray-300 p-2">
//                                   {detail.learning_outcomes}
//                                 </td>
//                                 <td className="border border-gray-300 p-2">
//                                   {detail.parameter_value?.[1] ? (
//                                     <img
//                                       src={
//                                         levelImages[detail.parameter_value[1]]
//                                       }
//                                       alt={detail.parameter_value[1]}
//                                       className="h-8 mx-auto"
//                                     />
//                                   ) : (
//                                     ""
//                                   )}
//                                 </td>

//                                 <td className="border border-gray-300 p-2">
//                                   {detail.parameter_value?.[2] ? (
//                                     <img
//                                       src={
//                                         levelImages[detail.parameter_value[2]]
//                                       }
//                                       alt={detail.parameter_value[2]}
//                                       className="h-8 mx-auto"
//                                     />
//                                   ) : (
//                                     ""
//                                   )}
//                                 </td>
//                               </tr>
//                             ))
//                           )}
//                         </tbody>
//                       </table>
//                     </div>

//                     {sIndex === subject.length - 1 && (
//                       <div className="mt-6 rounded-lg border border-gray-300 overflow-hidden">
//                         <table className="w-full text-center ">
//                           <thead>
//                             <tr className="bg-gray-100">
//                               <th className="border border-gray-300 p-2">
//                                 Performance Level
//                               </th>
//                               <th className="border border-gray-300 p-2">
//                                 Symbol
//                               </th>
//                               <th className="border border-gray-300 p-2">
//                                 Interpretation
//                               </th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             <tr>
//                               <td className="border border-gray-300 p-2">
//                                 Beginner
//                               </td>
//                               <td className="border border-gray-300 p-2">
//                                 <img
//                                   src={BeginnerImg}
//                                   alt="Beginner"
//                                   className="h-8 mx-auto"
//                                 />
//                               </td>
//                               <td className="border border-gray-300 p-2">
//                                 Tries to achieve the competency and associated
//                                 learning outcome with a lot of support from
//                                 teachers.
//                               </td>
//                             </tr>
//                             <tr>
//                               <td className="border border-gray-300 p-2">
//                                 Progressing
//                               </td>
//                               <td className="border border-gray-300 p-2">
//                                 <img
//                                   src={ProgressingImg}
//                                   alt="Progressing"
//                                   className="h-8 mx-auto"
//                                 />
//                               </td>
//                               <td className="border border-gray-300 p-2">
//                                 Achieves the competency and associated learning
//                                 outcomes with occasional/some support from
//                                 teachers.
//                               </td>
//                             </tr>
//                             <tr>
//                               <td className="border border-gray-300 p-2">
//                                 Proficient
//                               </td>
//                               <td className="border border-gray-300 p-2">
//                                 <img
//                                   src={ProficientImg}
//                                   alt="Proficient"
//                                   className="h-8 mx-auto"
//                                 />
//                               </td>
//                               <td className="border border-gray-300 p-2">
//                                 Achieves the competency and associated learning
//                                 outcomes on his/her own.
//                               </td>
//                             </tr>
//                           </tbody>
//                         </table>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               ))}
//               {/* {pages.map((pageSubjects, pageIndex) => (
//                 <div
//                   key={pageIndex}
//                   className="print-page w-full aspect-[8/10] rounded-md shadow-lg overflow-hidden relative"
//                   style={{
//                     backgroundImage: `url(${Language})`,
//                     backgroundSize: "cover",
//                     backgroundPosition: "center",
//                     padding: "15mm",
//                   }}
//                 >
//                   <div
//                     className="absolute top-[14%] left-[10%] w-[75%] ml-5"
//                     style={{
//                       fontFamily: '"Comic Sans MS", cursive, sans-serif',
//                     }}
//                   >
//                     {pageSubjects.map((subj, sIndex) => (
//                       <SubjectTable
//                         key={sIndex}
//                         subj={subj}
//                         terms={terms}
//                         domainColors={domainColors}
//                         levelImages={levelImages}
//                         sIndex={sIndex}
//                       />
//                     ))}
//                   </div>
//                 </div>
//               ))} */}
//             </div>

//             {/* Learners and Peer Feedback */}
//             <div className="md:ml-7 md:mr-7 flex justify-center mb-2 print-page">
//               <div
//                 className="w-full md:w-[1000px] lg:w-[1000px] aspect-[8/10] rounded-md shadow-lg overflow-hidden relative"
//                 style={{
//                   backgroundImage: `url(${LearnerPeer})`,
//                   backgroundSize: "cover",
//                   backgroundPosition: "center",
//                 }}
//               >
//                 <div
//                   className="absolute top-[13%] left-[10%] w-[80%] p-2 "
//                   style={{ fontFamily: '"Comic Sans MS", cursive, sans-serif' }}
//                 >
//                   {/* Learner's Feedback */}
//                   <div className="m-3 pb-10">
//                     <h2 className="text-blue-900 font-bold text-xl mb-6">
//                       Learner's Feedback
//                     </h2>

//                     {learner.map((item, index) => (
//                       <div
//                         key={index}
//                         className="border border-gray-400 rounded-lg overflow-hidden mb-6"
//                       >
//                         <div className="border-b bg-gray-100 border-gray-400 p-2 font-semibold text-left">
//                           {item.parameter}
//                         </div>

//                         {terms.map((term, tIndex) => (
//                           <div
//                             key={term.term_id}
//                             className="flex border-b border-gray-300 last:border-b-0"
//                           >
//                             <div className="w-1/4 border-r bg-gray-100 font-semibold border-gray-300 p-2">
//                               {term.name}
//                             </div>

//                             {/* <div className="w-3/4 flex flex-wrap items-center gap-x-6 gap-y-2 p-2">
//                               {Array.isArray(item?.options) &&
//                                 item.options.map((opt, i) => (
//                                   <label
//                                     key={i}
//                                     className="flex items-center gap-1 whitespace-nowrap"
//                                   >
//                                     <input
//                                       type="checkbox"
//                                       checked={
//                                         item.parameter_values?.[
//                                           term.term_id
//                                         ] === opt.value
//                                       }
//                                       readOnly
//                                     />
//                                     {opt.option}
//                                   </label>
//                                 ))}
//                             </div> */}
//                             <div
//                               className={`w-3/4 p-2 flex flex-wrap items-center gap-x-6 gap-y-2`}
//                             >
//                               {Array.isArray(item?.options) &&
//                                 item.options.map((opt, i) => {
//                                   const checked =
//                                     item.parameter_values?.[term.term_id] ===
//                                     opt.value;
//                                   return pdfMode ? (
//                                     // PDF-safe inline version (wrap allowed)
//                                     <span
//                                       key={i}
//                                       style={{
//                                         display: "inline-flex",
//                                         alignItems: "center",
//                                         marginRight: "12px",
//                                         fontSize: "14px",
//                                         lineHeight: "20px",
//                                       }}
//                                     >
//                                       <span
//                                         style={{
//                                           display: "inline-block",
//                                           width: "18px",
//                                           textAlign: "center",
//                                           marginRight: "6px",
//                                           fontSize: "16px",
//                                           lineHeight: "16px",
//                                         }}
//                                         aria-hidden="true"
//                                       >
//                                         {checked ? "☑" : "☐"}
//                                       </span>
//                                       <span>{opt.option}</span>
//                                     </span>
//                                   ) : (
//                                     // Normal UI checkbox
//                                     <label
//                                       key={i}
//                                       className="flex items-center gap-1 whitespace-nowrap"
//                                     >
//                                       <input
//                                         type="checkbox"
//                                         checked={checked}
//                                         readOnly
//                                         style={{ marginRight: 6 }}
//                                       />
//                                       {opt.option}
//                                     </label>
//                                   );
//                                 })}
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     ))}
//                   </div>

//                   {/* Peer Feedback */}
//                   <div className="m-3">
//                     <h2 className="text-blue-900 font-bold text-xl mb-6">
//                       Peer Feedback
//                     </h2>

//                     <div className="grid grid-cols-2 gap-4">
//                       {terms.map((term) => (
//                         <div
//                           key={term.term_id}
//                           className="border border-gray-400 rounded-lg overflow-hidden"
//                         >
//                           {/* Term Header */}
//                           <div className="border-b bg-gray-100 border-gray-400 p-2 font-semibold text-center">
//                             {term.name}
//                           </div>

//                           {/* Parameters for this term */}
//                           <div className="p-2 flex flex-col items-center gap-2">
//                             {peerFeedback.map((item, index) => {
//                               const value =
//                                 item.parameter_values?.[term.term_id];
//                               return value === "Yes" ? (
//                                 <div key={index} className="text-gray-800">
//                                   {item.parameter}
//                                 </div>
//                               ) : null;
//                             })}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//             {/* Parents Feedback */}
//             <div className="md:ml-7 md:mr-7 flex justify-center mb-2 print-page">
//               <div
//                 className=" w-full md:w-[1000px] lg:w-[1000px] aspect-[8/10] rounded-md shadow-lg overflow-hidden relative"
//                 style={{
//                   backgroundImage: `url(${TeacherParent})`,
//                   backgroundSize: "cover",
//                   backgroundPosition: "center",
//                 }}
//               >
//                 <div
//                   className="absolute top-[13%] left-[10%] w-[80%] space-y-8"
//                   style={{ fontFamily: '"Comic Sans MS", cursive, sans-serif' }}
//                 >
//                   {/* Parent Feedback */}
//                   <div className="">
//                     <h2 className="text-blue-900 font-bold text-xl mt-20">
//                       Parent's Observation
//                     </h2>

//                     {/* Table for NON-checkbox (radio/text) */}
//                     <div className="rounded-lg border border-gray-300 overflow-hidden mb-6">
//                       <table className="w-full text-center">
//                         <thead>
//                           <tr className="bg-gray-100">
//                             <th className="border border-gray-300 p-2">
//                               Observations
//                             </th>
//                             {terms.map((term) => (
//                               <td
//                                 key={term.term_id}
//                                 className="border border-gray-300 p-2 font-bold whitespace-nowrap"
//                               >
//                                 {term.name}
//                               </td>
//                             ))}
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {parentFeedback
//                             .filter((item) => item.control_type !== "checkbox")
//                             .map((item, index) => (
//                               <tr key={index}>
//                                 <td className="border border-gray-300 p-2 text-left font-medium">
//                                   {item.parameter}
//                                 </td>
//                                 {["1", "2"].map((term) => (
//                                   <td
//                                     key={term}
//                                     className="border border-gray-300 p-2"
//                                   >
//                                     {item.parameter_values?.[term] || ""}
//                                   </td>
//                                 ))}
//                               </tr>
//                             ))}
//                         </tbody>
//                       </table>
//                     </div>

//                     {/* Separate Table for checkbox type */}
//                     {parentFeedback.some(
//                       (item) => item.control_type === "checkbox"
//                     ) && (
//                       <div className="rounded-lg border border-gray-400 overflow-hidden">
//                         <table className="w-full ">
//                           <tbody>
//                             {parentFeedback
//                               .filter(
//                                 (item) => item.control_type === "checkbox"
//                               )
//                               .map((item, i) => (
//                                 <React.Fragment key={i}>
//                                   {/* Parameter Name Row */}
//                                   <tr>
//                                     <td
//                                       colSpan={2}
//                                       className="bg-gray-100 border text-left border-gray-400 p-2 font-semibold "
//                                     >
//                                       {item.parameter}
//                                     </td>
//                                   </tr>

//                                   {/* Term Headings Row */}
//                                   <tr className="bg-gray-50">
//                                     {terms.map((term) => (
//                                       <td
//                                         key={term.term_id}
//                                         className="border border-gray-300 p-2 text-center font-bold whitespace-nowrap"
//                                       >
//                                         {term.name}
//                                       </td>
//                                     ))}
//                                   </tr>

//                                   {/* Term Values Row */}
//                                   <tr>
//                                     {/* Term 1 */}
//                                     {/* <td className="align-top border border-gray-400 p-2 w-1/2">
//                                       <div className="flex flex-col gap-2 text-left">
//                                         {item.options.map((opt, j) => {
//                                           const values = Array.isArray(
//                                             item.parameter_values?.["1"]
//                                           )
//                                             ? item.parameter_values["1"]
//                                             : [item.parameter_values?.["1"]];

//                                           return (
//                                             <label
//                                               key={`t1-${i}-${j}`}
//                                               className="flex items-center gap-2"
//                                             >
//                                               <input
//                                                 type="checkbox"
//                                                 checked={values.includes(
//                                                   opt.value
//                                                 )}
//                                                 readOnly
//                                               />
//                                               {opt.option}
//                                             </label>
//                                           );
//                                         })}
//                                       </div>
//                                     </td> */}
//                                     <td className="align-top border border-gray-400 p-2 w-1/2">
//                                       <div
//                                         className={`flex flex-col gap-2 text-left ${
//                                           pdfMode ? "pdf-checkbox" : ""
//                                         }`}
//                                       >
//                                         {item.options.map((opt, j) => {
//                                           const values = Array.isArray(
//                                             item.parameter_values?.["1"]
//                                           )
//                                             ? item.parameter_values["1"]
//                                             : [item.parameter_values?.["1"]];

//                                           const checked = values.includes(
//                                             opt.value
//                                           );

//                                           return pdfMode ? (
//                                             // PDF safe rendering → symbols instead of <input>
//                                             <div
//                                               key={`t1-${i}-${j}`}
//                                               style={{
//                                                 display: "flex",
//                                                 alignItems: "center",
//                                                 gap: "6px",
//                                               }}
//                                             >
//                                               <span
//                                                 style={{ fontSize: "16px" }}
//                                               >
//                                                 {checked ? "☑" : "☐"}
//                                               </span>
//                                               <span>{opt.option}</span>
//                                             </div>
//                                           ) : (
//                                             // Normal UI rendering
//                                             <label
//                                               key={`t1-${i}-${j}`}
//                                               className="flex items-center gap-2"
//                                             >
//                                               <input
//                                                 type="checkbox"
//                                                 checked={checked}
//                                                 readOnly
//                                               />
//                                               {opt.option}
//                                             </label>
//                                           );
//                                         })}
//                                       </div>
//                                     </td>

//                                     {/* Term 2 */}
//                                     <td className="align-top border border-gray-400 p-2 w-1/2">
//                                       <div className="flex flex-col gap-2 text-left">
//                                         {item.options.map((opt, j) => {
//                                           const values = Array.isArray(
//                                             item.parameter_values?.["2"]
//                                           )
//                                             ? item.parameter_values["2"]
//                                             : [item.parameter_values?.["2"]];

//                                           const checked = values.includes(
//                                             opt.value
//                                           );

//                                           return pdfMode ? (
//                                             // PDF-safe with blue tick
//                                             <div
//                                               key={`t2-${i}-${j}`}
//                                               style={{
//                                                 display: "flex",
//                                                 alignItems: "center",
//                                                 gap: "6px",
//                                               }}
//                                             >
//                                               <span
//                                                 style={{
//                                                   fontSize: "16px",
//                                                   backgroundcolor: checked
//                                                     ? "blue"
//                                                     : "black",
//                                                 }}
//                                               >
//                                                 {checked ? "☑" : "☐"}
//                                               </span>
//                                               <span>{opt.option}</span>
//                                             </div>
//                                           ) : (
//                                             // UI with normal checkbox
//                                             <label
//                                               key={`t2-${i}-${j}`}
//                                               className="flex items-center gap-2"
//                                             >
//                                               <input
//                                                 type="checkbox"
//                                                 checked={checked}
//                                                 readOnly
//                                                 className="accent-blue-600" // Tailwind: makes tick blue
//                                               />
//                                               {opt.option}
//                                             </label>
//                                           );
//                                         })}
//                                       </div>
//                                     </td>
//                                   </tr>
//                                 </React.Fragment>
//                               ))}
//                           </tbody>
//                         </table>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//             {/* Class Teacher Remark */}
//             <div className="md:ml-7 md:mr-7 flex justify-center mb-2 print-page">
//               <div
//                 className=" w-full md:w-[1000px] lg:w-[1000px] aspect-[8/10] rounded-md shadow-lg overflow-hidden relative"
//                 style={{
//                   backgroundImage: `url(${TeacherParent})`,
//                   backgroundSize: "cover",
//                   backgroundPosition: "center",
//                 }}
//               >
//                 <div
//                   className="absolute top-[13%] left-[10%] w-[80%]  space-y-8"
//                   style={{ fontFamily: '"Comic Sans MS", cursive, sans-serif' }}
//                 >
//                   {/* Class teacher remark */}
//                   <div className="">
//                     <h2 className="text-blue-900 font-bold text-xl mb-2 mt-20">
//                       Class Teacher's Remark
//                     </h2>

//                     <div className="rounded-lg border border-gray-400 overflow-hidden">
//                       {terms.map((term) => (
//                         <div
//                           key={term.term_id}
//                           className="border border-gray-400 last:border-b-0"
//                         >
//                           {/* Term Heading */}
//                           <div className="bg-gray-100 border border-gray-400 p-2 font-semibold">
//                             {term.name}
//                           </div>

//                           <table className="w-full">
//                             <tbody>
//                               {classTeacher.map((item, index) => (
//                                 <tr
//                                   key={index}
//                                   className="border border-gray-300 last:border-b-0"
//                                 >
//                                   {/* Parameter Name from API */}
//                                   <td className="border border-gray-400 p-2 w-1/3 font-medium">
//                                     {toCamelCase(item.parameter)}
//                                   </td>

//                                   {/* Parameter Value for this term */}
//                                   <td className="p-2">
//                                     {item.parameter_values?.[term.term_id] ||
//                                       ""}
//                                   </td>
//                                 </tr>
//                               ))}
//                             </tbody>
//                           </table>
//                         </div>
//                       ))}
//                     </div>
//                   </div>

//                   <div className="space-y-6 mt-10 ml-2">
//                     <div className="flex justify-between">
//                       <span className="text-blue-900 font-bold text-base">
//                         Date:
//                       </span>
//                     </div>
//                     <div className="flex justify-between ">
//                       <span className="text-blue-900 font-bold text-base">
//                         Signature of Class Teacher:
//                       </span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-blue-900 font-bold text-base">
//                         Signature of Principal:
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//             {/* Back Cover */}
//             <div className="md:ml-7 md:mr-7 flex justify-center mb-2 print-page">
//               <div
//                 className="w-full md:w-[1000px] lg:w-[1000px] aspect-[8/10] rounded-md shadow-lg overflow-hidden relative"
//                 style={{
//                   backgroundImage: `url(${BackCover})`,
//                   backgroundSize: "cover",
//                   backgroundPosition: "center",
//                 }}
//               ></div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default HPCReportCard;
import React from "react";

const HPCReportCard = () => {
  return <div>HPCReportCard</div>;
};

export default HPCReportCard;
