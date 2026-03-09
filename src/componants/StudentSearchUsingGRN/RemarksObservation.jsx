// import { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { useLocation, useNavigate } from "react-router-dom";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import ReactPaginate from "react-paginate";
// import "bootstrap/dist/css/bootstrap.min.css";
// import { RxCross1 } from "react-icons/rx";
// import { MdOutlineRemoveRedEye } from "react-icons/md";
// import LoaderStyle from "../common/LoaderFinal/LoaderStyle";
// function RemarksObservation() {
//   const API_URL = import.meta.env.VITE_API_URL; // URL for host
//   const [academicYr, setAcademicYr] = useState([]);
//   const [selectedAcademicYr, setSelectedAcademicYr] = useState(null);
//   const [remarkandObservation, setRemarkandObservation] = useState([]);
//   // for allot subject tab
//   const [showDownloadModal, setShowDownloadModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [currentSection, setCurrentSection] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(0);
//   const [pageCount, setPageCount] = useState(0);
//   const [error, setError] = useState(null);
//   const [nameError, setNameError] = useState(null);
//   const [leavingCertificate, setLeavingCertificate] = useState({
//     last_date: "",
//     slc_no: "",
//     slc_issue_date: "",
//     leaving_remark: "",
//   });
//   const navigate = useNavigate();
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const previousPageRef = useRef(0);
//   const prevSearchTermRef = useRef("");
//   const pageSize = 10;
//   const location = useLocation();
//   const student = location.state?.studentData || {};
//   useEffect(() => {
//     fetchAcademicYear();
//   }, []);
//   const fetchAcademicYear = async () => {
//     try {
//       const token = localStorage.getItem("authToken");
//       const response = await axios.get(
//         `${API_URL}/api/getacademicyrbysettings`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       if (Array.isArray(response.data.data)) {
//         setAcademicYr(response.data);
//         const activeYear = response.data.data.find(
//           (year) => year.active === "Y"
//         );
//         if (activeYear) {
//           setSelectedAcademicYr(activeYear.academic_yr);
//           handleSearch(activeYear.academic_yr);
//         }
//       } else {
//         setError("Unexpected data format");
//       }
//     } catch (error) {
//       console.error("Error fetching class and section names:", error);
//       setError("Error fetching class and section names");
//     }
//   };

//   // Listing tabs data for diffrente tabs
//   const handleSearch = async (academicYrParam) => {
//     if (isSubmitting) return;
//     setIsSubmitting(true);
//     setNameError("");
//     setSearchTerm("");

//     try {
//       const token = localStorage.getItem("authToken");
//       const params = {
//         student_id: student?.student_id,
//         academic_yr: academicYrParam,
//       };

//       const response = await axios.get(
//         `${API_URL}/api/getstudentremarkobservation`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//           params,
//         }
//       );

//       if (response?.data?.status === 200 && response?.data?.data?.length > 0) {
//         const studentData = response.data.data;
//         setRemarkandObservation(studentData);
//         setPageCount(Math.ceil(studentData.length / 10));
//       } else {
//         setRemarkandObservation([]);
//         toast.error("No remarks or observations found for this year.");
//       }
//     } catch (error) {
//       console.error("Error fetching student remark observation:", error);
//       setError("Error fetching data.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Handle division checkbox change
//   const handlePageClick = (data) => {
//     setCurrentPage(data.selected);
//     // Handle page change logic
//   };

//   const handleEdit = async (section) => {
//     setCurrentSection(section);
//     console.log("currentedit", section);

//     // Fetch Leaving Certificate Data using token
//     try {
//       const token = localStorage.getItem("authToken");
//       const response = await axios.get(
//         `${API_URL}/api/get_leavingcertificatedetailstudent/${section.student_id}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       // Assuming the response data structure remains the same
//       const data = response.data.data[0] || {}; // Extract the first item from the data array

//       // Set the leaving certificate details into state
//       setLeavingCertificate({
//         last_date: data.last_date || "",
//         slc_no: data.slc_no || "",
//         slc_issue_date: data.slc_issue_date || "",
//         leaving_remark: data.leaving_remark || "",
//       });
//     } catch (error) {
//       console.error("Error fetching leaving certificate details:", error);
//       setError("Error fetching leaving certificate details");
//     }

//     // Show the edit modal
//     setShowEditModal(true);
//   };
//   const handleCloseModal = () => {
//     setShowDownloadModal(false);
//     setShowEditModal(false);
//     setShowDeleteModal(false);
//   };
//   useEffect(() => {
//     const trimmedSearch = searchTerm.trim().toLowerCase();

//     if (trimmedSearch !== "" && prevSearchTermRef.current === "") {
//       previousPageRef.current = currentPage;
//       setCurrentPage(0);
//     }

//     if (trimmedSearch === "" && prevSearchTermRef.current !== "") {
//       setCurrentPage(previousPageRef.current);
//     }

//     prevSearchTermRef.current = trimmedSearch;
//   }, [searchTerm]);
//   const filteredSections = remarkandObservation.filter((section) => {
//     const subjectNameIs = section?.remark_subject?.toLowerCase() || "";
//     const teacherName = section?.teachername?.toLowerCase() || "";

//     const formattedDate = section?.remark_date
//       ? new Date(section?.remark_date)
//           .toLocaleDateString("en-GB") // gives DD/MM/YYYY
//           .replace(/\//g, "-") // convert to DD-MM-YYYY
//           .toLowerCase()
//       : "";

//     const searchTermLower = searchTerm.toLowerCase();

//     return (
//       subjectNameIs.includes(searchTermLower) ||
//       teacherName.includes(searchTermLower) ||
//       formattedDate.includes(searchTermLower)
//     );
//   });

//   useEffect(() => {
//     setPageCount(Math.ceil(filteredSections.length / pageSize));
//   }, [filteredSections, pageSize]);

//   const displayedSections = filteredSections.slice(
//     currentPage * pageSize,
//     (currentPage + 1) * pageSize
//   );

//   return (
//     <>
//       <ToastContainer />
//       <div className="md:mx-auto md:w-full rounded-md  bg-white  ">
//         <div className=" card-header  flex justify-between items-center  ">
//           <h3 className=" mt-1 text-[1.2em] lg:text-xl text-nowrap">
//             Remark & Observation
//           </h3>
//           <div className="flex flex-row space-x-2 justify-center items-center">
//             <div className="w-1/2 md:w-fit mr-1 ">
//               <input
//                 type="text"
//                 className="form-control"
//                 placeholder="Search "
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>
//             <RxCross1
//               className="float-end  text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
//               onClick={() => {
//                 navigate("/dashboard");
//               }}
//             />
//           </div>
//         </div>
//         <div
//           className=" relative  mb-8   h-1  mx-auto bg-red-700"
//           style={{
//             backgroundColor: "#C03078",
//           }}
//         ></div>

//         <div className="bg-white  rounded-md -mt-5">
//           <div className="mt-4 border-1 border-gray-50 ">
//             <div className="mb-4  ">
//               <div className="md:w-[90%] mx-auto">
//                 <div className="flex flex-wrap justify-center gap-4 mb-6">
//                   {academicYr?.data?.map((year) => {
//                     const isActive = selectedAcademicYr === year.academic_yr;

//                     return (
//                       <button
//                         key={year.academic_yr}
//                         onClick={() => {
//                           setSelectedAcademicYr(year.academic_yr);
//                           handleSearch(year.academic_yr);
//                         }}
//                         className={`relative px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 shadow-md
//         ${
//           isActive
//             ? "bg-gradient-to-r from-[#C03078] to-pink-500 text-white shadow-lg "
//             : "bg-white text-gray-800 border border-gray-300 hover:bg-[#fef3f7] hover:text-[#4f8fda] hover:border-[#C03078] hover:shadow-sm"
//         }`}
//                       >
//                         {year.academic_yr}
//                         {isActive && (
//                           <span className=" bg-pink-500 rounded-b-lg"></span>
//                         )}
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>
//             </div>
//             {isSubmitting ? (
//               <div className="flex justify-center items-center h-48">
//                 <div className="text-[#C03078] text-lg font-semibold">
//                   <LoaderStyle />
//                 </div>
//               </div>
//             ) : remarkandObservation.length > 0 ? (
//               <div className="container mt-4">
//                 <div className="card mx-auto lg:w-full shadow-lg">
//                   <div className="card-body w-full">
//                     <div className="h-96 lg:h-96 overflow-y-scroll lg:overflow-x-hidden">
//                       <table className="min-w-full leading-normal table-auto">
//                         <thead>
//                           <tr className="bg-gray-200">
//                             <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
//                               Sr.No
//                             </th>{" "}
//                             <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
//                               Type
//                             </th>
//                             <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
//                               Date
//                             </th>
//                             <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
//                               Subject
//                             </th>
//                             <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
//                               Subject of remark
//                             </th>
//                             <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
//                               Teacher Name
//                             </th>
//                             <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
//                               view
//                             </th>
//                             <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
//                               Acknowledge
//                             </th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {displayedSections.length ? (
//                             displayedSections.map((subject, index) => (
//                               <tr key={subject.remark_id} className="text-sm">
//                                 <td className="px-2 text-center py-2 border border-gray-950">
//                                   {currentPage * pageSize + index + 1}
//                                 </td>
//                                 <td className="px-2 text-center py-2 border border-gray-950">
//                                   {subject.remark_type || "-"}
//                                 </td>
//                                 <td className="px-2 text-center py-2 border border-gray-950">
//                                   {subject.remark_date
//                                     ? new Date(subject.remark_date)
//                                         .toLocaleDateString("en-GB")
//                                         .replace(/\//g, "-")
//                                     : "-"}
//                                 </td>
//                                 <td className="px-2 text-center py-2 border border-gray-950">
//                                   {subject.remark_subject || "-"}
//                                 </td>
//                                 <td className="px-2 text-center py-2 border border-gray-950">
//                                   {subject.remark_desc || "-"}
//                                 </td>
//                                 <td className="px-2 text-center py-2 border border-gray-950">
//                                   {subject.teachername || "-"}
//                                 </td>
//                                 <td className="px-2 text-center py-2 border border-gray-950">
//                                   <button
//                                     onClick={() => handleEdit(subject)}
//                                     className="text-blue-500 hover:text-blue-600"
//                                   >
//                                     <MdOutlineRemoveRedEye className="text-xl" />
//                                   </button>
//                                 </td>
//                                 <td className="px-2 text-center py-2 border border-gray-950">
//                                   {subject.acknowledge === "Y"
//                                     ? "Acknowledged"
//                                     : "Pending"}
//                                 </td>
//                               </tr>
//                             ))
//                           ) : (
//                             <tr>
//                               <td
//                                 colSpan="8"
//                                 className="text-center text-red-600 py-4"
//                               >
//                                 Oops! No data found.
//                               </td>
//                             </tr>
//                           )}
//                         </tbody>
//                       </table>
//                     </div>
//                     <div className=" flex justify-center pt-2 -mb-3">
//                       <ReactPaginate
//                         previousLabel={"Previous"}
//                         nextLabel={"Next"}
//                         breakLabel={"..."}
//                         pageCount={pageCount}
//                         onPageChange={handlePageClick}
//                         marginPagesDisplayed={1}
//                         pageRangeDisplayed={1}
//                         containerClassName={"pagination"}
//                         pageClassName={"page-item"}
//                         pageLinkClassName={"page-link"}
//                         previousClassName={"page-item"}
//                         previousLinkClassName={"page-link"}
//                         nextClassName={"page-item"}
//                         nextLinkClassName={"page-link"}
//                         breakClassName={"page-item"}
//                         breakLinkClassName={"page-link"}
//                         activeClassName={"active"}
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               selectedAcademicYr && (
//                 <div className="text-center text-red-600 font-medium py-4">
//                   No data found for selected year.
//                 </div>
//               )
//             )}
//           </div>
//         </div>
//       </div>

//       {showEditModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="w-[90%] md:w-[44%] max-w-3xl bg-white rounded-md shadow-lg border border-gray-300">
//             <div className="flex justify-between items-center px-3 bg-gray-50 border-b border-gray-300">
//               <h5 className="text-lg font-semibold pt-2">
//                 School Leaving Details
//               </h5>
//               <RxCross1
//                 className="text-lg h-5 w-5 text-red-600 hover:cursor-pointer hover:bg-red-100  rounded-full"
//                 onClick={handleCloseModal}
//               />
//             </div>
//             <div
//               className="relative h-1 w-[97%] mx-auto bg-red-700"
//               style={{ backgroundColor: "#C03078" }}
//             ></div>
//             <div className="p-5">
//               <div className="flex items-center gap-x-5 mb-4">
//                 <label htmlFor="newClassName" className="w-[90%]">
//                   Last Date Of School
//                 </label>
//                 <div className="w-full bg-gray-200 p-2 rounded-md shadow-sm">
//                   {leavingCertificate.last_date}
//                 </div>
//               </div>

//               <div className="flex items-center gap-x-5 mb-4">
//                 <label htmlFor="newSubjectName" className="w-[90%]">
//                   School Leaving Certificate No.
//                 </label>
//                 <div className="w-full bg-gray-200 p-2 rounded-md shadow-sm">
//                   {leavingCertificate.slc_no}
//                 </div>
//               </div>

//               <div className="flex items-center gap-x-5 mb-4">
//                 <label htmlFor="newExamName" className="w-[90%]">
//                   School Leaving Certificate Issue Date
//                 </label>
//                 <div className="w-full bg-gray-200 p-2 rounded-md shadow-sm">
//                   {leavingCertificate.slc_issue_date}
//                 </div>
//               </div>

//               <div className="flex items-center gap-x-5">
//                 <label htmlFor="newMarksHeading" className="w-[90%]">
//                   Leaving Remark
//                 </label>
//                 <div className="w-full bg-gray-200 p-2 rounded-md shadow-sm">
//                   {leavingCertificate.leaving_remark}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// export default RemarksObservation;

const RemarksObservation = () => {
  return <div>RemarksObservation</div>;
};

export default RemarksObservation;
