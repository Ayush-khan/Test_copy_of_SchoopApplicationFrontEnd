// import { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import ReactPaginate from "react-paginate";
// import "bootstrap/dist/css/bootstrap.min.css";
// import { RxCross1 } from "react-icons/rx";
// import LoaderStyle from "../../common/LoaderFinal/LoaderStyle";
// // import AllotSubjectTab from "./AllotMarksHeadingTab";
// import Select from "react-select";
// function IndividualStudentTab() {
//   const API_URL = import.meta.env.VITE_API_URL; // URL for host
//   const [activeTab, setActiveTab] = useState("Manage");
//   const [classes, setClasses] = useState([]);
//   const [subjects, setSubjects] = useState([]);
//   const [classIdForManage, setclassIdForManage] = useState("");
//   const [sectionIdForManage, setSectionIdForManage] = useState("");
//   //   For the dropdown of Teachers name api
//   const [countAbsentStudent, setCountAbsentStudents] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(0);
//   const [pageCount, setPageCount] = useState(0);

//   //   for allot subject checkboxes
//   const [error, setError] = useState(null);
//   const [nameError, setNameError] = useState(null);
//   // for react-search of manage tab teacher Edit and select class
//   const [selectedClass, setSelectedClass] = useState(null);
//   // for Edit model
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const previousPageRef = useRef(0);
//   const prevSearchTermRef = useRef("");
//   const capitalizeFirstLetter = (str) => {
//     return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";
//   };

//   const navigate = useNavigate();
//   const pageSize = 10;
//   useEffect(() => {
//     fetchClassNames();
//     handleSearch();
//   }, []);
//   const classOptions = classes.map((cls) => ({
//     value: `${cls?.get_class?.name}-${cls.name}`,
//     label: `${cls?.get_class?.name} ${cls.name}`,
//     class_id: cls.class_id,
//     section_id: cls.section_id,
//   }));

//   const handleClassSelect = (selectedOption) => {
//     setNameError("");
//     setSelectedClass(selectedOption);

//     if (selectedOption) {
//       setclassIdForManage(selectedOption.class_id);
//       setSectionIdForManage(selectedOption.section_id);
//     } else {
//       setclassIdForManage(" ");
//       setSectionIdForManage(" ");
//     }
//     console.log("setSelectedClass", selectedClass);
//     console.log("setclassIdForManage", classIdForManage);
//     console.log("setSectionIdForManage", sectionIdForManage);
//   };

//   const fetchClassNames = async () => {
//     try {
//       const token = localStorage.getItem("authToken");
//       const response = await axios.get(`${API_URL}/api/get_class_section`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (Array.isArray(response.data)) {
//         setClasses(response.data);
//         console.log("the name and section", response.data);
//       } else {
//         setError("Unexpected data format");
//       }
//     } catch (error) {
//       console.error("Error fetching class and section names:", error);
//       setError("Error fetching class and section names");
//     }
//   };

//   const handleSearch = async () => {
//     if (isSubmitting) return; // Prevent re-submitting
//     setIsSubmitting(true);

//     // if (!classIdForManage) {
//     //   setNameError("Please select the class.");
//     //   setIsSubmitting(false);
//     //   return;
//     // }
//     setSearchTerm("");
//     const today = new Date().toISOString().split("T")[0]; // format: YYYY-MM-DD

//     try {
//       const token = localStorage.getItem("authToken");
//       setLoading(true);
//       const response = await axios.get(
//         `${API_URL}/api/get_absentstudentfortoday`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//           params: {
//             class_id: classIdForManage,
//             section_id: sectionIdForManage,
//             date: today, // 👈 sending today's date here
//           },
//         }
//       );
//       console.log(
//         "the response of the AllotMarksHeadingTab is *******",
//         response.data
//       );
//       if (response?.data?.data.absent_student.length > 0) {
//         setSubjects(response?.data?.data.absent_student);
//         setPageCount(
//           Math.ceil(response?.data?.data.absent_student.length / 10)
//         ); // Example pagination logic
//         setCountAbsentStudents(response?.data?.data?.count_absent_student);
//       } else {
//         setSubjects([]);
//         setCountAbsentStudents("");
//         toast.error(
//           `Hooray! No students are absent today in ${selectedClass.label} `
//         );
//       }
//     } catch (error) {
//       console.error(
//         "Error fetching Bonafied certificates Listing:",
//         error.response.data.message
//       );
//       setError("Error fetching Bonafied certificates");
//       toast.error(error.response.data.message);
//     } finally {
//       setIsSubmitting(false); // Re-enable the button after the operation
//       setLoading(false);
//     }
//   };

//   const handlePageClick = (data) => {
//     setCurrentPage(data.selected);
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

//   const searchLower = searchTerm.trim().toLowerCase();
//   const filteredSections = subjects.filter((student) => {
//     const fullName = `${student.first_name} ${student.mid_name || ""} ${
//       student.last_name
//     }`.toLowerCase();
//     const className = student.classname?.toString().toLowerCase() || "";
//     const sectionName = student.sectionname?.toString().toLowerCase() || "";

//     return (
//       fullName.includes(searchLower) ||
//       className.includes(searchLower) ||
//       sectionName.includes(searchLower)
//     );
//   });

//   //   const filteredSections = subjects.filter((section) => {
//   //     // Convert the teacher's name and subject's name to lowercase for case-insensitive comparison
//   //     const subjectNameIs = section?.stud_name.toLowerCase() || "";

//   //     // Check if the search term is present in either the teacher's name or the subject's name
//   //     return subjectNameIs.toLowerCase().includes(searchLower);
//   //   });
//   const displayedSections = filteredSections.slice(
//     currentPage * pageSize,
//     (currentPage + 1) * pageSize
//   );

//   return (
//     <>
//       {/* <ToastContainer /> */}
//       <div className="md:mx-auto md:w-full p-4 bg-white  ">
//         <div className="bg-white  rounded-md ">
//           {activeTab === "Manage" && (
//             <div>
//               <ToastContainer />
//               <div className="">
//                 <div className="   md:w-full relative left-[5%]  ] ">
//                   <div className="form-group  w-full md:w-[55%] flex justify-start gap-x-1 md:gap-x-6">
//                     <label
//                       htmlFor="classSection"
//                       className="w-1/4 pt-2 items-center text-center"
//                     >
//                       Select Class
//                     </label>
//                     <div className="w-full">
//                       <Select
//                         value={selectedClass}
//                         onChange={handleClassSelect}
//                         options={classOptions}
//                         placeholder="Class"
//                         isSearchable
//                         isClearable
//                         className=" text-sm w-full md:w-[60%] item-center relative left-0 md:left-4"
//                       />
//                       {nameError && (
//                         <div className=" relative top-0.5 left-3 ml-1 text-danger text-xs">
//                           {nameError}
//                         </div>
//                       )}{" "}
//                     </div>
//                     <button
//                       onClick={handleSearch}
//                       type="button"
//                       disabled={isSubmitting}
//                       className="btn h-10  w-18 md:w-auto relative  right-0 md:right-[15%] btn-primary"
//                     >
//                       {isSubmitting ? "Searching..." : "Search"}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//               {subjects.length > 0 && (
//                 <div className="container mt-4">
//                   <div className="card mx-auto lg:w-full shadow-lg">
//                     <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
//                       <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
//                         {/* List of Students Absent Today{" "} */}
//                         Today's Absentee List{" "}
//                         <span className="text-[.8em] pb-1 text-blue-500">
//                           {selectedClass?.label
//                             ? `(${selectedClass.label} | Absent: ${countAbsentStudent} Students)`
//                             : `(Total Absent - ${countAbsentStudent})`}
//                         </span>
//                       </h3>
//                       <div className="w-1/2 md:w-fit mr-1 ">
//                         <input
//                           type="text"
//                           className="form-control"
//                           placeholder="Search "
//                           onChange={(e) => setSearchTerm(e.target.value)}
//                         />
//                       </div>
//                     </div>
//                     <div
//                       className=" relative w-[97%]   mb-3 h-1  mx-auto bg-red-700"
//                       style={{
//                         backgroundColor: "#C03078",
//                       }}
//                     ></div>

//                     <div className="card-body w-full">
//                       <div className="h-96 lg:h-96 overflow-y-scroll lg:overflow-x-hidden">
//                         <table className="min-w-full leading-normal table-auto">
//                           <thead>
//                             <tr className="bg-gray-200">
//                               <th className="px-2 text-center w-full md:w-[10%] lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
//                                 Sr.No
//                               </th>
//                               <th className="px-2 text-center   lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
//                                 Student Name
//                               </th>
//                               <th className="px-2  text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
//                                 Class
//                               </th>
//                               <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
//                                 Section
//                               </th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {loading ? (
//                               <tr>
//                                 <td
//                                   colSpan="4"
//                                   className="text-center py-6 text-blue-700"
//                                 >
//                                   <div className="flex justify-center items-center h-64">
//                                     <LoaderStyle />
//                                   </div>{" "}
//                                 </td>
//                               </tr>
//                             ) : displayedSections.length ? (
//                               displayedSections.map((classItem, index) => (
//                                 <tr
//                                   key={index}
//                                   className={`${
//                                     index % 2 === 0 ? "bg-white" : "bg-gray-100"
//                                   } hover:bg-gray-50`}
//                                 >
//                                   <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
//                                     <p className="text-gray-900 whitespace-no-wrap relative top-2">
//                                       {currentPage * pageSize + index + 1}
//                                     </p>
//                                   </td>
//                                   <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
//                                     <p className="text-gray-900 whitespace-no-wrap relative top-2">
//                                       {capitalizeFirstLetter(
//                                         classItem.first_name
//                                       )}{" "}
//                                       {capitalizeFirstLetter(
//                                         classItem.mid_name
//                                       )}{" "}
//                                       {capitalizeFirstLetter(
//                                         classItem.last_name
//                                       )}
//                                     </p>
//                                   </td>

//                                   <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
//                                     <p className="text-gray-900 whitespace-no-wrap relative top-2">
//                                       {classItem.classname}
//                                     </p>
//                                   </td>
//                                   <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
//                                     <p className="text-gray-900 whitespace-no-wrap relative top-2">
//                                       {classItem.sectionname}
//                                     </p>
//                                   </td>
//                                 </tr>
//                               ))
//                             ) : (
//                               <tr>
//                                 <td
//                                   colSpan="4"
//                                   className="text-center py-6 text-red-700"
//                                 >
//                                   Oops! No data found...
//                                 </td>
//                               </tr>
//                             )}
//                           </tbody>
//                         </table>
//                       </div>
//                       <div className=" flex justify-center pt-2 -mb-3">
//                         <ReactPaginate
//                           previousLabel={"Previous"}
//                           nextLabel={"Next"}
//                           breakLabel={"..."}
//                           pageCount={pageCount}
//                           onPageChange={handlePageClick}
//                           marginPagesDisplayed={1}
//                           pageRangeDisplayed={1}
//                           containerClassName={"pagination"}
//                           pageClassName={"page-item"}
//                           pageLinkClassName={"page-link"}
//                           previousClassName={"page-item"}
//                           previousLinkClassName={"page-link"}
//                           nextClassName={"page-item"}
//                           nextLinkClassName={"page-link"}
//                           breakClassName={"page-item"}
//                           breakLinkClassName={"page-link"}
//                           activeClassName={"active"}
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// }

// export default IndividualStudentTab;
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import LoaderStyle from "../../common/LoaderFinal/LoaderStyle";
import Select from "react-select";
import { IoMdSend } from "react-icons/io";
import { FaCheck, FaUserAlt } from "react-icons/fa";

function IndividualStudentTab() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [activeTab, setActiveTab] = useState("Manage");
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classIdForManage, setclassIdForManage] = useState("");
  const [sectionIdForManage, setSectionIdForManage] = useState("");
  const [countAbsentStudent, setCountAbsentStudents] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [error, setError] = useState(null);
  const [nameError, setNameError] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [sendingSMS, setSendingSMS] = useState({});
  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");
  const navigate = useNavigate();
  const pageSize = 10;
  const maxCharacters = 150;

  const capitalizeFirstLetter = (str) => {
    return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";
  };

  useEffect(() => {
    fetchClassNames();
    handleSearch();
  }, []);

  const classOptions = classes.map((cls) => ({
    value: `${cls?.get_class?.name}-${cls.name}`,
    label: `${cls?.get_class?.name} ${cls.name}`,
    class_id: cls.class_id,
    section_id: cls.section_id,
  }));

  const handleClassSelect = (selectedOption) => {
    setNameError("");
    setSelectedClass(selectedOption);

    if (selectedOption) {
      setclassIdForManage(selectedOption.class_id);
      setSectionIdForManage(selectedOption.section_id);
    } else {
      setclassIdForManage("");
      setSectionIdForManage("");
    }
  };

  const fetchClassNames = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${API_URL}/api/get_class_section`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(response.data)) {
        setClasses(response.data);
      } else {
        setError("Unexpected data format");
      }
    } catch (error) {
      console.error("Error fetching class and section names:", error);
      setError("Error fetching class and section names");
    }
  };

  const handleSearch = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSearchTerm("");
    const today = new Date().toISOString().split("T")[0];

    try {
      const token = localStorage.getItem("authToken");
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/get_absentstudentfortoday`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            class_id: classIdForManage,
            section_id: sectionIdForManage,
            date: today,
            // date: "2025-11-03",
          },
        }
      );
      if (response?.data?.data.absent_student.length > 0) {
        // Add a unique ID to each student (if missing)
        const studentsWithIds = response.data.data.absent_student.map(
          (s, index) => ({
            ...s,
            student_id: `${s?.student_id}`, // unique id
          })
        );

        setSubjects(studentsWithIds);
        setPageCount(Math.ceil(response.data.data.absent_student.length / 10));
        setCountAbsentStudents(response.data.data.count_absent_student);
      }
      // if (response?.data?.data.absent_student.length > 0) {
      //   setSubjects(response.data.data.absent_student);
      //   setPageCount(Math.ceil(response.data.data.absent_student.length / 10));
      //   setCountAbsentStudents(response.data.data.count_absent_student);
      // }
      else {
        setSubjects([]);
        setCountAbsentStudents("");
        toast.error(
          `Hooray! No students are absent today in ${
            selectedClass?.label || ""
          }`
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error fetching absent students");
    } finally {
      setIsSubmitting(false);
      setLoading(false);
      setSelectedStudents([]);
      setSelectAll(false);
    }
  };

  // Checkbox state handlers
  // Handle individual checkbox toggle
  const handleCheckboxChange = (studentId) => {
    setSelectedStudents((prevSelected) => {
      if (prevSelected.includes(studentId)) {
        const updated = prevSelected.filter((id) => id !== studentId);
        setSelectAll(false); // uncheck Select All if any unchecked
        return updated;
      } else {
        const updated = [...prevSelected, studentId];
        if (updated.length === subjects.length) setSelectAll(true);
        return updated;
      }
    });
  };

  // Handle header "Select All" checkbox
  // Select All / Deselect All across ALL pages
  const handleSelectAll = () => {
    if (selectAll) {
      // Unselect all
      setSelectedStudents([]);
      setSelectAll(false);
    } else {
      // Select all across all pages
      const allIds = subjects.map((s) => s.student_id);
      setSelectedStudents(allIds);
      setSelectAll(true);
    }
  };

  const handleSubmit = async () => {
    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student.");
      return;
    }
    if (!message.trim()) {
      toast.error("Please enter a message.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const postData = {
        student_id: selectedStudents,
        message,
      };

      const response = await axios.post(
        `${API_URL}/api/send_messageforattendance`,
        postData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        toast.success("Message sent successfully!");
        setMessage("");
        setSelectedStudents([]);
        setSelectAll(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error sending message.");
    } finally {
      setLoading(false);
    }
  };

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  useEffect(() => {
    const trimmedSearch = searchTerm.trim().toLowerCase();
    if (trimmedSearch !== "" && prevSearchTermRef.current === "") {
      previousPageRef.current = currentPage;
      setCurrentPage(0);
    }
    if (trimmedSearch === "" && prevSearchTermRef.current !== "") {
      setCurrentPage(previousPageRef.current);
    }
    prevSearchTermRef.current = trimmedSearch;
  }, [searchTerm]);

  const searchLower = searchTerm.trim().toLowerCase();
  const filteredSections = subjects.filter((student) => {
    const fullName = `${student.first_name} ${student.mid_name || ""} ${
      student.last_name
    }`.toLowerCase();
    const className = student.classname?.toString().toLowerCase() || "";
    const sectionName = student.sectionname?.toString().toLowerCase() || "";
    return (
      fullName.includes(searchLower) ||
      className.includes(searchLower) ||
      sectionName.includes(searchLower)
    );
  });

  const displayedSections = filteredSections.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );
  const handleSend = async (student_id) => {
    try {
      // Set loading state for that student
      setSendingSMS((prev) => ({ ...prev, [student_id]: true }));

      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Authentication token not found. Please log in again.");
        return;
      }

      // 🔹 Step 1: First API call — get the message
      const firstResponse = await axios.post(
        `${API_URL}/api/send_pendingsmsfordailyattendancestudent/${student_id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (
        firstResponse.status === 200 &&
        firstResponse.data &&
        firstResponse.data.success
      ) {
        const { message } = firstResponse.data; // ✅ message from API

        // 🔹 Step 2: Prepare FormData for second API
        const formData = new FormData();
        formData.append("message", message);
        formData.append("student_id[]", student_id);

        // 🔹 Step 3: Second API call — send the message
        const secondResponse = await axios.post(
          `${API_URL}/api/send_messagefordailyattendance`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        // 🔹 Step 4: Handle success toast
        if (secondResponse.status === 200 && secondResponse.data.success) {
          toast.success(
            secondResponse.data.message ||
              `Message sent successfully to student ID: ${student_id}`
          );
          handleSearch(); // optional — to refresh UI data
        } else {
          toast.error(
            secondResponse.data?.message || "Failed to send final message."
          );
        }
      } else {
        toast.error(
          firstResponse.data?.message || "Failed to get message data."
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("An unexpected error occurred while sending the message.");
    } finally {
      // Reset loading state
      setSendingSMS((prev) => ({ ...prev, [student_id]: false }));
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="md:mx-auto md:w-full p-4 bg-white">
        <div className="bg-white rounded-md">
          {activeTab === "Manage" && (
            <div>
              {/* Top Search Section */}
              <div className="md:w-full relative left-[5%]">
                <div className="form-group w-full md:w-[55%] flex justify-start gap-x-1 md:gap-x-6">
                  <label
                    htmlFor="classSection"
                    className="w-1/4 pt-2 text-center"
                  >
                    Select Class
                  </label>
                  <div className="w-full">
                    <Select
                      value={selectedClass}
                      onChange={handleClassSelect}
                      options={classOptions}
                      placeholder="Class"
                      isSearchable
                      isClearable
                      className="text-sm w-full md:w-[60%] item-center"
                    />
                    {nameError && (
                      <div className="text-danger text-xs mt-1">
                        {nameError}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleSearch}
                    type="button"
                    disabled={isSubmitting}
                    className="btn h-10 w-18 md:w-auto btn-primary"
                  >
                    {isSubmitting ? "Searching..." : "Search"}
                  </button>
                </div>
              </div>

              {/* Table Section */}
              {subjects.length > 0 && (
                <div className="container mt-4">
                  <div className="card mx-auto lg:w-full shadow-lg">
                    <div className="p-2 px-3 bg-gray-100 flex justify-between items-center">
                      <h3 className="text-gray-700 text-lg font-semibold">
                        Today's Absentees{" "}
                        <span className="text-blue-500 text-sm">
                          ({countAbsentStudent} Students)
                        </span>
                      </h3>
                      <div className="w-1/2 md:w-fit mr-1">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search"
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    <div
                      className="relative w-[97%] h-1 mx-auto bg-red-700"
                      style={{ backgroundColor: "#C03078" }}
                    ></div>

                    <div className="card-body w-full">
                      <div className="h-96 overflow-y-scroll">
                        {loading ? (
                          <div className="flex justify-center items-center h-64">
                            {/* <div className="spinner-border text-primary" role="status"> */}
                            <LoaderStyle />
                            {/* </div> */}
                          </div>
                        ) : (
                          <table className="min-w-full leading-normal table-auto border-collapse rounded-lg overflow-hidden shadow-md">
                            <thead>
                              <tr className="bg-gray-200 text-gray-900">
                                <th className="px-2 text-center py-2 border border-gray-300 text-sm font-semibold">
                                  Sr.No
                                </th>
                                <th className="px-2 text-center py-2 border border-gray-300 text-sm font-semibold">
                                  <input
                                    type="checkbox"
                                    checked={selectAll}
                                    onChange={handleSelectAll}
                                    className="cursor-pointer accent-red-600"
                                  />{" "}
                                  All
                                </th>
                                <th className="px-2 text-center py-2 border border-gray-300 text-sm font-semibold">
                                  Student Name
                                </th>
                                <th className="px-2 text-center py-2 border border-gray-300 text-sm font-semibold">
                                  Class
                                </th>

                                <th className="px-2 text-center py-2 border border-gray-300 text-sm font-semibold">
                                  Messages Count
                                </th>
                                <th className="px-2 text-center py-2 border border-gray-300 text-sm font-semibold">
                                  Last Message Time
                                </th>
                                <th className="px-2 text-center py-2 border border-gray-300 text-sm font-semibold">
                                  Message Sent
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {displayedSections.length ? (
                                displayedSections.map((student, index) => (
                                  <tr
                                    key={student.student_id}
                                    className={`${
                                      index % 2 === 0
                                        ? "bg-white"
                                        : "bg-gray-50"
                                    } hover:bg-red-50 transition-colors duration-150`}
                                  >
                                    {/* Sr.No */}
                                    <td className="text-center px-2 py-2 border border-gray-200 text-sm">
                                      {currentPage * pageSize + index + 1}
                                    </td>

                                    {/* Checkbox */}
                                    <td className="text-center px-2 py-2 border border-gray-200 text-sm">
                                      <input
                                        type="checkbox"
                                        checked={selectedStudents.includes(
                                          student.student_id
                                        )}
                                        onChange={() =>
                                          handleCheckboxChange(
                                            student.student_id
                                          )
                                        }
                                        className="cursor-pointer accent-red-600"
                                      />
                                    </td>

                                    {/* Student Name */}
                                    <td className="text-center px-2 py-2 border border-gray-200 text-sm">
                                      {`${capitalizeFirstLetter(
                                        student.first_name
                                      )} ${
                                        capitalizeFirstLetter(
                                          student.mid_name
                                        ) || ""
                                      } ${capitalizeFirstLetter(
                                        student.last_name
                                      )}`}
                                    </td>

                                    {/* Class */}
                                    <td className="text-center px-2 py-2 border border-gray-200 text-sm">
                                      {student?.classname}{" "}
                                      {student?.sectionname}
                                    </td>

                                    {/* Messages Sent Count */}
                                    <td className="text-center px-2 py-2 border border-gray-200 text-sm">
                                      <span
                                        className={`px-2 py-1 rounded text-xs font-semibold ${
                                          student.messages_sent_count > 0
                                            ? "bg-green-100 text-green-800"
                                            : "bg-gray-100 text-gray-600"
                                        }`}
                                      >
                                        {student.messages_sent_count}
                                      </span>
                                    </td>

                                    {/* Last Message Time */}
                                    <td className="text-center px-2 py-2 border border-gray-200 text-sm text-gray-700">
                                      {student.last_message_sent_at ? (
                                        new Date(
                                          student.last_message_sent_at
                                        ).toLocaleString("en-IN", {
                                          day: "2-digit",
                                          month: "short",
                                          year: "2-digit",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })
                                      ) : (
                                        <span className="text-gray-400 italic">
                                          {/* Not Sent */}
                                        </span>
                                      )}
                                    </td>

                                    {/* ✅ New Message Column */}
                                    {/* ✅ New Message Column (based on sms_sent_status) */}
                                    <td className="text-center px-2 py-2 border border-gray-200 text-sm">
                                      {student.sms_sent_status === "Y" ? (
                                        // ✅ Message Sent
                                        <div className="flex flex-col items-center justify-center gap-1 text-green-600">
                                          <span className="font-semibold text-sm flex items-center gap-1">
                                            Sent{" "}
                                            <FaCheck className="text-green-600 text-base" />
                                          </span>
                                        </div>
                                      ) : student.sms_sent_status ===
                                        "not_try" ? (
                                        // ⚠️ Please Select Student
                                        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-r-4 py-1 border-yellow-400 text-yellow-700 px-1 rounded-md shadow-sm flex items-center justify-center gap-2 text-sm font-medium">
                                          <FaUserAlt className="text-yellow-500 text-base" />
                                          <span>Please select student </span>
                                        </div>
                                      ) : student.sms_sent_status === "N" ? (
                                        <button
                                          disabled={
                                            sendingSMS[student?.student_id]
                                          }
                                          onClick={() =>
                                            handleSend(student?.student_id)
                                          }
                                          className={`flex items-center justify-center mx-auto px-3 py-1 gap-1 text-xs md:text-sm font-medium rounded-md transition-all duration-200 ${
                                            sendingSMS[student?.student_id]
                                              ? "bg-blue-300 cursor-not-allowed"
                                              : "bg-blue-500 hover:bg-blue-600 text-white"
                                          }`}
                                        >
                                          {sendingSMS[student?.student_id] ? (
                                            <>
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
                                              Sending...
                                            </>
                                          ) : (
                                            <>
                                              Send{" "}
                                              <IoMdSend className="text-lg" />
                                            </>
                                          )}
                                        </button>
                                      ) : null}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td
                                    colSpan="8"
                                    className="text-center py-6 text-red-700 font-medium bg-gray-50"
                                  >
                                    Oops! No data found...
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        )}
                      </div>

                      {displayedSections.length > 0 && (
                        <div className="flex flex-col items-center mt-2">
                          <div className="w-full md:w-[50%]">
                            <label className="mb-1 font-normal block text-left">
                              Dear Parent ,
                            </label>

                            <div className="relative w-full">
                              <textarea
                                value={message}
                                onChange={(e) => {
                                  if (e.target.value.length <= maxCharacters) {
                                    setMessage(e.target.value);
                                  }
                                }}
                                className="w-full h-28 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-150 resize-none bg-transparent relative z-10 text-sm  text-black font-normal"
                                placeholder="Enter message"
                              ></textarea>

                              {message && (
                                <div className="pointer-events-none absolute top-0 left-0 w-full h-full p-3 text-gray-400 whitespace-pre-wrap break-words text-sm  font-normal ">
                                  {message + "  "}Login to school application
                                  for details - Evolvu
                                </div>
                              )}

                              <div className="absolute bottom-2 right-3 text-xs text-gray-500 pointer-events-none z-20">
                                {message.length} / {maxCharacters}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="text-center ">
                        <p className="text-blue-600 font-semibold">
                          Selected Students:{" "}
                          <span className="text-pink-600">
                            {selectedStudents.length}
                          </span>
                        </p>
                      </div>
                      <div className="text-right mt-3 mb-2">
                        <button
                          onClick={handleSubmit}
                          disabled={loading}
                          className={`text-white px-4 py-1 rounded font-bold transition-colors duration-200 ${
                            loading
                              ? "bg-blue-400 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700"
                          }`}
                        >
                          {loading ? "Sending..." : "Send Message"}
                        </button>
                      </div>

                      {/* Pagination */}
                      <div className="flex justify-center pt-2 -mb-3">
                        <ReactPaginate
                          previousLabel={"Previous"}
                          nextLabel={"Next"}
                          breakLabel={"..."}
                          breakClassName={"page-item"}
                          breakLinkClassName={"page-link"}
                          pageCount={pageCount}
                          marginPagesDisplayed={1}
                          pageRangeDisplayed={1}
                          onPageChange={handlePageClick}
                          containerClassName={
                            "pagination justify-content-center"
                          }
                          pageClassName={"page-item"}
                          pageLinkClassName={"page-link"}
                          previousClassName={"page-item"}
                          previousLinkClassName={"page-link"}
                          nextClassName={"page-item"}
                          nextLinkClassName={"page-link"}
                          activeClassName={"active"}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default IndividualStudentTab;
