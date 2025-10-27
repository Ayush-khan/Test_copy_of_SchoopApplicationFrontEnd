import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import { RxCross1 } from "react-icons/rx";
// import Select from "react-select";

import CreateLessonPlanTemplate from "./CreateLessonPlanTemplate";

import { useNavigate } from "react-router-dom";

function LessonPlanTemplate() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("Manage");

  const [classesforsubjectallot, setclassesforsubjectallot] = useState([]);

  // for allot subject tab

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const [currestSubjectNameForDelete, setCurrestSubjectNameForDelete] =
    useState("");

  const [newSection, setnewSectionName] = useState("");
  const [newSubject, setnewSubjectnName] = useState("");
  const [newclassnames, setnewclassnames] = useState("");
  const [teacherIdIs, setteacherIdIs] = useState("");
  const [teacherNameIs, setTeacherNameIs] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dropdownRef = useRef(null);

  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");
  //   for allot subject checkboxes
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  // errors messages for allot subject tab
  const [status, setStatus] = useState("All"); // For status dropdown
  const [selectedDate, setSelectedDate] = useState(""); // For date picker
  const [notices, setNotices] = useState([]); // To store fetched notices
  const [subject, setSubject] = useState("");
  const [noticeDesc, setNoticeDesc] = useState("");

  const [imageUrls, setImageUrls] = useState([]);

  // for react-search of manage tab teacher Edit and select class
  const pageSize = 10;

  useEffect(() => {
    handleSearch();
    fetchClassNamesForAllotSubject();
  }, []);

  const fetchClassNamesForAllotSubject = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${API_URL}/api/getClassList`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(response.data)) {
        setclassesforsubjectallot(response.data);
        console.log(
          "this is the dropdown of the allot subject tab for class",
          response.data
        );
      } else {
        setError("Unexpected data format");
      }
    } catch (error) {
      console.error("Error fetching class names:", error);
      setError("Error fetching class names");
    }
  };

  // const handleSearch = async () => {
  //   if (isSubmitting) return; // Prevent re-submitting
  //   setIsSubmitting(true);
  //   setSearchTerm("");
  //   try {
  //     setLoading(true);
  //     const token = localStorage.getItem("authToken");
  //     const params = {};
  //     if (selectedDate) params.notice_date = selectedDate;
  //     if (status) params.status = status;
  //     const response = await axios.get(
  //       `${API_URL}/api/get_lesson_plan_template_list`,
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //         params,
  //       }
  //     );

  //     if (response.data?.data?.length > 0) {
  //       const smscount = response.data["0"]?.smscount || {};

  //       const updatedNotices = response.data.data.map((notice) => {
  //         const count = smscount[notice.unq_id] || 0;
  //         return {
  //           ...notice,
  //           showSendButton: notice.publish === "Y" && count > 0,
  //           count,
  //         };
  //       });

  //       setNotices(updatedNotices); // Update the state with enriched data
  //       setPageCount(Math.ceil(updatedNotices.length / pageSize));
  //     } else {
  //       setNotices([]);
  //       toast.error("Lesson plan template not found.");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching lesson plan template:", error);
  //     toast.error("Error fetching lesson plan template . Please try again.");
  //   } finally {
  //     setIsSubmitting(false);
  //     setLoading(false);
  //   }
  // };

  const handleSearch = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSearchTerm("");

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const params = {};
      if (selectedDate) params.notice_date = selectedDate;
      if (status) params.status = status;

      const response = await axios.get(
        `${API_URL}/api/get_lesson_plan_template_list`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      const data = response.data?.data || [];
      if (data.length === 0) {
        setNotices([]);
        toast.error("Lesson plan template not found.");
        return;
      }

      // smscount
      const smscount = response.data["0"]?.smscount || {};

      // Enrich each row with count and showSendButton
      const enrichedData = data.map((notice) => ({
        ...notice,
        count: smscount[notice.unq_id] || 0,
        showSendButton:
          notice.publish === "Y" && (smscount[notice.unq_id] || 0) > 0,
      }));

      // Group by les_pln_temp_id
      const groupedTemplates = Object.values(
        enrichedData.reduce((acc, item) => {
          const id = item.les_pln_temp_id;
          if (!acc[id]) {
            acc[id] = {
              ...item,
              descriptions: [],
            };
          }
          acc[id].descriptions.push({
            lesson_plan_headings_id: item.lesson_plan_headings_id,
            name: item.name,
            description: item.description || "",
          });
          return acc;
        }, {})
      );

      setNotices(groupedTemplates); // now each notice has all its headings/descriptions
      setPageCount(Math.ceil(groupedTemplates.length / pageSize));
    } catch (error) {
      console.error("Error fetching lesson plan template:", error);
      toast.error("Error fetching lesson plan template. Please try again.");
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    if (tab === "Manage") {
      handleSearch();
      setActiveTab("Manage");
    } else if (tab === "CreateLessonPlanTemplate") {
      navigate("/createLessonPlanTemplate");
    } else {
      setActiveTab(tab);
    }
  };

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const fetchNoticeData = async (currentSection) => {
    const token = localStorage.getItem("authToken");

    if (!token) throw new Error("No authentication token found");

    try {
      const response = await axios.get(
        `${API_URL}/api/get_smsnoticedata/${currentSection?.unq_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const { imageurl } = response.data.data;
      console.log("imageURL", imageurl);
      setImageUrls(imageurl); // Store image URLs for download links
    } catch (error) {
      console.error("Error fetching notice data:", error);
    }
  };

  const handleDelete = (sectionId) => {
    const classToDelete = notices.find(
      (cls) => cls.les_pln_temp_id === sectionId
    );
    setCurrentSection({ classToDelete });
    setCurrestSubjectNameForDelete(currentSection?.classToDelete?.name);
    setShowDeleteModal(true);
  };

  // const handleEdit = async (section) => {
  //   setCurrentSection(section);
  //   setSubject(section?.subject || "");
  //   setNoticeDesc(section?.notice_desc || "");
  //   setnewclassnames(section?.classnames || "");
  // };

  const handleSubmitDelete = async () => {
    if (isSubmitting) return; // Prevent re-submitting
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");

      if (
        !token ||
        !currentSection ||
        !currentSection?.classToDelete?.les_pln_temp_id
      ) {
        throw new Error("Unique ID is missing");
      }

      const response = await axios.delete(
        `${API_URL}/api/delete_lesson_plan_template/${currentSection?.classToDelete?.les_pln_temp_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      console.log(response);

      // fetchClassNames();
      handleSearch();

      setShowDeleteModal(false);
      // setSubjects([]);
      // response.data.message ||
      toast.success(`Lesson plan template deleted successfully!`);
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(
          `Error In Deleting ${currestSubjectNameForDelete}: ${error.response.data.message}`
        );
      } else {
        toast.error(
          `Error In Deleting ${currestSubjectNameForDelete}: ${error.message}`
        );
      }
      console.error("Error In Deleting:", error);
    } finally {
      setIsSubmitting(false);
      setShowDeleteModal(false);
    }
  };

  const handleCloseModal = () => {
    setSubject("");
    setNoticeDesc("");
    setnewclassnames("");
    setShowDeleteModal(false);
  };

  useEffect(() => {
    const trimmedSearch = searchTerm.trim().toLowerCase();

    if (trimmedSearch !== "" && prevSearchTermRef.current === "") {
      previousPageRef.current = currentPage; // Save current page before search
      setCurrentPage(0); // Jump to first page when searching
    }

    if (trimmedSearch === "" && prevSearchTermRef.current !== "") {
      setCurrentPage(previousPageRef.current); // Restore saved page when clearing search
    }

    prevSearchTermRef.current = trimmedSearch;
  }, [searchTerm]);

  const searchLower = searchTerm.trim().toLowerCase();
  const filteredSections = notices.filter((section) => {
    const teacherName = section?.c_name?.toLowerCase() || "";
    const subjectName = section?.sub_name?.toLowerCase() || "";
    const noticeDesc = section?.name?.toLowerCase().trim() || "";

    return (
      teacherName.includes(searchLower) ||
      subjectName.includes(searchLower) ||
      noticeDesc.includes(searchLower)
    );
  });

  const displayedSections = filteredSections.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  //   This is tab
  const tabs = [
    { id: "Manage", label: "Manage" },
    { id: "CreateLessonPlanTemplate", label: "Template" },
  ];

  return (
    <>
      {/* <ToastContainer /> */}
      <div className="md:mx-auto md:w-[80%] p-4 bg-white mt-2 ">
        <div className=" card-header  flex justify-between items-center  ">
          <h3 className="text-gray-700  text-[1.2em] lg:text-xl text-nowrap">
            Lesson Plan Template
          </h3>
          <RxCross1
            className="float-end relative -top-1 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
            onClick={() => {
              navigate("/dashboard");
            }}
          />
        </div>
        <div
          className=" relative  mb-8   h-1  mx-auto bg-red-700"
          style={{
            backgroundColor: "#C03078",
          }}
        ></div>

        <ul className="grid grid-cols-2 gap-x-10 relative -left-6 md:left-0 md:flex md:flex-row justify-between items-center -top-4 w-full">
          <div className="flex md:flex-row flex-wrap gap-x-10">
            {tabs.map(({ id, label }) => (
              <li
                key={id}
                className={`md:-ml-7 shadow-md ${
                  activeTab === id ? "text-blue-500 font-bold" : ""
                }`}
              >
                <button
                  onClick={() => handleTabChange(id)}
                  className="px-2 md:px-4 py-1 hover:bg-gray-200 text-[1em] md:text-sm text-nowrap"
                  aria-current={activeTab === id ? "page" : undefined}
                >
                  {label}
                </button>
              </li>
            ))}
          </div>

          {notices.length > 0 && (
            <div className="flex justify-end ml-auto mr-3 bg-gray-100 py-2 px-3">
              <input
                type="text"
                className="form-control border border-gray-300 rounded px-2 py-1 text-sm"
                placeholder="Search"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
        </ul>

        <div className="bg-white  rounded-md -mt-5">
          {activeTab === "Manage" && (
            <div>
              <ToastContainer />
              <div className="container mt-4">
                <div className="card mx-auto lg:w-full shadow-lg">
                  <div className="card-body w-full">
                    <div className="h-96 lg:h-96 overflow-y-scroll lg:overflow-x-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full table-fixed border-collapse border border-gray-950">
                          <thead>
                            <tr className="bg-gray-200">
                              <th className="w-[60px] px-2 text-center py-2 border border-gray-950 text-sm font-semibold text-gray-900">
                                Sr.No
                              </th>
                              <th className="w-[80px] px-2 text-center py-2 border border-gray-950 text-sm font-semibold text-gray-900">
                                Class
                              </th>
                              <th className="w-[160px] px-2 text-center py-2 border border-gray-950 text-sm font-semibold text-gray-900">
                                Subject
                              </th>
                              <th className="w-[250px] px-2 text-center py-2 border border-gray-950 text-sm font-semibold text-gray-900">
                                Chapter
                              </th>
                              <th className="w-[80px] px-2 text-center py-2 border border-gray-950 text-sm font-semibold text-gray-900">
                                Edit
                              </th>
                              <th className="w-[80px] px-2 text-center py-2 border border-gray-950 text-sm font-semibold text-gray-900">
                                Delete
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {loading ? (
                              <tr>
                                <td
                                  colSpan="6"
                                  className="text-center py-6 text-blue-700 text-lg font-medium"
                                >
                                  Please wait while data is loading...
                                </td>
                              </tr>
                            ) : displayedSections.length ? (
                              displayedSections.map((subject, index) => (
                                <tr
                                  key={subject.les_pln_temp_id}
                                  className="text-sm"
                                >
                                  <td className="px-2 text-center py-2 border border-gray-950">
                                    {currentPage * pageSize + index + 1}
                                  </td>
                                  <td className="px-2 text-center py-2 border border-gray-950">
                                    {subject?.c_name}
                                  </td>
                                  <td className="px-2 text-center py-2 border border-gray-950">
                                    {subject?.sub_name}
                                  </td>
                                  <td className="px-2 text-center py-2 border border-gray-950">
                                    {subject?.name}
                                  </td>
                                  <td className="text-center px-2 py-2 border border-gray-950">
                                    {subject.publish === "N" && (
                                      // <button
                                      //   className="text-blue-600 hover:text-blue-800"
                                      //   onClick={() => handleEdit(subject)}
                                      // >
                                      //   <FontAwesomeIcon icon={faEdit} />
                                      // </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          navigate(
                                            `/lessonplantemplate/edit/${subject.les_pln_temp_id}`,
                                            {
                                              state: {
                                                // timetable: subject,
                                                selectedStudentId:
                                                  subject.class_id,
                                                selectedSubjectId:
                                                  subject.subject_id,
                                                selectedChapterId:
                                                  subject.chapter_id,
                                                selectedStudent: {
                                                  value: subject.class_id,
                                                  label: subject.c_name,
                                                },
                                                selectedSubject: {
                                                  value: subject.subject_id,
                                                  label: subject.sub_name,
                                                },
                                                selectedChapter: {
                                                  value: subject.chapter_id,
                                                  label: subject.name,
                                                },
                                              },
                                            }
                                          );
                                        }}
                                      >
                                        <FontAwesomeIcon icon={faEdit} />
                                      </button>
                                    )}
                                  </td>
                                  <td className="text-center px-2 py-2 border border-gray-950">
                                    {subject.publish === "N" && (
                                      <button
                                        onClick={() =>
                                          handleDelete(subject?.les_pln_temp_id)
                                        }
                                        className="text-red-600 hover:text-red-800"
                                      >
                                        <FontAwesomeIcon icon={faTrash} />
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan="6"
                                  className="text-center py-6 text-red-700 text-lg font-medium"
                                >
                                  Oops! No data found..
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className=" flex justify-center pt-2 -mb-3">
                      <ReactPaginate
                        previousLabel={"Previous"}
                        nextLabel={"Next"}
                        breakLabel={"..."}
                        pageCount={pageCount}
                        onPageChange={handlePageClick}
                        marginPagesDisplayed={1}
                        pageRangeDisplayed={1}
                        containerClassName={"pagination"}
                        pageClassName={"page-item"}
                        pageLinkClassName={"page-link"}
                        previousClassName={"page-item"}
                        previousLinkClassName={"page-link"}
                        nextClassName={"page-item"}
                        nextLinkClassName={"page-link"}
                        breakClassName={"page-item"}
                        breakLinkClassName={"page-link"}
                        activeClassName={"active"}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50   flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="flex justify-between p-3">
                  <h5 className="modal-title">Confirm Delete</h5>
                  <RxCross1
                    className="float-end relative mt-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                    type="button"
                    // className="btn-close text-red-600"
                    onClick={handleCloseModal}
                  />
                  {console.log(
                    "the currecnt section inside delete of the managesubjhect",
                    currentSection
                  )}
                </div>
                <div
                  className=" relative  mb-3 h-1 w-[97%] mx-auto bg-red-700"
                  style={{
                    backgroundColor: "#C03078",
                  }}
                ></div>
                <div className="modal-body">
                  Are you sure you want to delete the chapter{" "}
                  {` ${currentSection?.classToDelete?.name} for subject `}{" "}
                  {` ${currentSection?.classToDelete?.sub_name} in class `}
                  {` ${currentSection?.classToDelete?.c_name} `} ?
                </div>
                <div className=" flex justify-end p-3">
                  <button
                    type="button"
                    className="btn btn-danger px-3 mb-2"
                    onClick={handleSubmitDelete}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default LessonPlanTemplate;

{
  /* <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                    <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap"></h3>
                    <div className="w-1/2 md:w-fit mr-1 ">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search "
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div> */
}
{
  /* <div
                    className=" relative w-[97%]   mb-3 h-1  mx-auto bg-red-700"
                    style={{
                      backgroundColor: "#C03078",
                    }}
                  ></div> */
}
