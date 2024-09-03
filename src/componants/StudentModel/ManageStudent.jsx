import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";

import { RxCross1 } from "react-icons/rx";
import Select from "react-select";
function ManageSubjectList() {
  const API_URL = import.meta.env.VITE_API_URL; // URL for host
  // const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [classes, setClasses] = useState([]);
  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
  const [classesforsubjectallot, setclassesforsubjectallot] = useState([]);
  const [subjects, setSubjects] = useState([]);
  // for allot subject tab

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const [currestSubjectNameForDelete, setCurrestSubjectNameForDelete] =
    useState("");
  const [newSection, setnewSectionName] = useState("");
  const [newSubject, setnewSubjectnName] = useState("");
  const [newclassnames, setnewclassnames] = useState("");
  const [teacherIdIs, setteacherIdIs] = useState("");
  const [teacherNameIs, setTeacherNameIs] = useState("");
  // This is hold the allot subjet api response
  const [classIdForManage, setclassIdForManage] = useState("");
  //   This is for the subject id in the dropdown
  const [newDepartmentId, setNewDepartmentId] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  //   For the dropdown of Teachers name api
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  // validations state for unique name
  const [nameAvailable, setNameAvailable] = useState(true);
  //   variable to store the respone of the allot subject tab

  const dropdownRef = useRef(null);

  //   for allot subject checkboxes

  const [error, setError] = useState(null);
  const [nameError, setNameError] = useState(null);

  // errors messages for allot subject tab

  // for react-search of manage tab teacher Edit and select class
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  //   For students
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const handleTeacherSelect = (selectedOption) => {
    setSelectedTeacher(selectedOption);
    console.log("selectedTeacher", selectedTeacher);
    setNewDepartmentId(selectedOption.value); // Assuming value is the teacher's ID
    console.log("setNewDepartmentId", newDepartmentId);
  };

  const handleClassSelect = (selectedOption) => {
    setNameError("");
    setSelectedClass(selectedOption);
    setclassIdForManage(selectedOption.value); // Assuming value is the class ID
    // Set loading state for student dropdown
    // setLoading(false);
    fetchStudentNameWithClassId(selectedOption.value);
    // Fetch student list based on selected class and section
    // fetchStudentNameWithClassId(selectedOption.value).finally(() => {
    //   setLoading(true); // Stop loading once the API call is complete
    // });
  };
  const handleStudentSelect = (selectedOption) => {
    setNameError("");
    setSelectedStudent(selectedOption);
    setSelectedStudentId(selectedOption.value);
  };

  const teacherOptions = departments.map((dept) => ({
    value: dept.reg_id,
    label: dept.name,
  }));
  console.log("teacherOptions", teacherOptions);
  const classOptions = classes.map((cls) => ({
    value: cls.section_id,
    label: `${cls?.get_class?.name}  ${cls.name} (${cls.students_count})`,
  }));
  const studentOptions = studentNameWithClassId.map((stu) => ({
    value: stu.student_id,
    label: `${stu?.first_name}  ${stu?.mid_name} ${stu.last_name}`,
  }));

  //   Sorting logic state

  const pageSize = 10;

  //   FOr serial number
  // fetch className with division and student count
  const fetchClassNames = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/api/getallClassWithStudentCount`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (Array.isArray(response.data)) {
        setClasses(response.data);
        console.log("class with student count data", response.data);
      } else {
        setError("Unexpected data format");
      }
    } catch (error) {
      console.error(
        "Error fetching class, section with student count :",
        error
      );
      setError("Error fetching class, section with student count");
    }
  };
  const fetchStudentNameWithClassId = async (section_id = null) => {
    try {
      const token = localStorage.getItem("authToken");
      const params = section_id ? { section_id } : {};

      const response = await axios.get(
        `${API_URL}/api/getStudentListBySection`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params, // Pass section_id as a query parameter if available
        }
      );

      if (Array.isArray(response?.data?.students)) {
        setStudentNameWithClassId(response?.data?.students);
        console.log("Student data is", response?.data?.students);
      } else {
        setError("Unexpected data format");
      }
    } catch (error) {
      console.error("Error fetching class, section with student count:", error);
      setError("Error fetching class, section with student count");
    }
  };

  useEffect(() => {
    fetchClassNames();
    fetchStudentNameWithClassId(); // Initial call without section_id
    fetchDepartments();
    fetchClassNamesForAllotSubject();
  }, []);

  // Example usage within useEffect

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
  // THis is for the ALlotTeacherFOrACLaSS tAB FECTH class
  //   This is the api for get teacher list in the manage tab edit
  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(`${API_URL}/api/get_teacher_list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      setDepartments(response.data);
      console.log(
        "888888888888888888888888 this is the edit of get_teacher list in the subject allotement tab",
        response.data
      );
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchClassNames();
    fetchStudentNameWithClassId(classOptions.value);
    fetchDepartments();
    fetchClassNamesForAllotSubject();
  }, []);
  // Listing tabs data for diffrente tabs
  const handleSearch = async () => {
    if (!classIdForManage && !selectedStudentId) {
      setNameError("Please select atleast one of them.");
      return;
    }
    try {
      console.log(
        "for this sectiong id in seaching inside subjectallotment",
        selectedStudentId
      );
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/api/students/${selectedStudentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          //   params: { section_id: classSection },
          //   params: { studentId: selectedStudentId },
        }
      );
      console.log("the response of the stdent list is *******", response.data);
      // Convert the response object to an array of values
      const responseArray = Object.values(response.data);
      //   if (response.data.length > 0) {
      if (responseArray.length > 0) {
        console.log("inside this getStudentLIstpai");
        // setSubjects(response.data);
        setSubjects(responseArray);
        setPageCount(Math.ceil(response.data.length / 10)); // Example pagination logic
      } else {
        setSubjects([]);
        toast.error("No student found.");
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setError("Error fetching subjects");
    }
  };

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
    // Handle page change logic
  };

  const handleEdit = (section) => {
    setCurrentSection(section);
    // console.log("the currecne t section", currentSection);

    console.log("fdsfsdsd handleEdit", section);
    setnewclassnames(section?.get_class?.name);
    setnewSectionName(section?.get_division?.name);
    setnewSubjectnName(section?.get_subject?.name);
    setTeacherNameIs(section?.get_teacher?.name);
    setteacherIdIs(section?.get_teacher?.teacher_id);
    console.log("teacerId and name is", teacherIdIs, teacherNameIs);
    // It's used for the dropdown of the tachers
    // setnewTeacherAssign()
    const selectedOption = departments.find(
      (option) => option.value === section?.get_teacher?.teacher_id
    );
    setSelectedTeacher(selectedOption);
    setShowEditModal(true);
  };

  const handleDelete = (sectionId) => {
    console.log("inside delete of subjectallotmenbt____", sectionId);
    console.log("inside delete of subjectallotmenbt", classes);
    const classToDelete = subjects.find((cls) => cls.subject_id === sectionId);
    // setCurrentClass(classToDelete);
    setCurrentSection({ classToDelete });
    console.log("the currecne t section", currentSection);
    setCurrestSubjectNameForDelete(
      currentSection?.classToDelete?.get_subject?.name
    );
    console.log(
      "cureendtsungjeg",
      currentSection?.classToDelete?.get_subject?.name
    );
    console.log("currestSubjectNameForDelete", currestSubjectNameForDelete);
    setShowDeleteModal(true);
  };

  const handleSubmitEdit = async () => {
    console.log(
      "inside the edit model of the subjectallotment",
      currentSection.subject_id
    );
    console.log(
      "inside the edit model of the subjectallotment",
      currentSection
    );

    try {
      const token = localStorage.getItem("authToken");

      if (!token || !currentSection || !currentSection.subject_id) {
        throw new Error("Subject ID is missing");
      }
      if (!nameAvailable) {
        return;
      }

      console.log("the Subject ID***", currentSection.subject_id);
      console.log("the teacher ID***", selectedDepartment);

      await axios.put(
        `${API_URL}/api/update_subject_Alloted/${currentSection.subject_id}`,
        { teacher_id: newDepartmentId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      handleSearch();
      handleCloseModal();
      toast.success("Subject Record updated successfully!");

      // setSubjects([]);
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(
          `Error updating subject Record: ${error.response.data.message}`
        );
      } else {
        toast.error(`Error updating subject Record: ${error.message}`);
      }
      console.error("Error editing subject Record:", error);
    } finally {
      setShowEditModal(false);
    }
  };

  const handleSubmitDelete = async () => {
    // Handle delete submission logic
    try {
      const token = localStorage.getItem("authToken");
      console.log(
        "the currecnt section inside the delte___",
        currentSection?.classToDelete?.subject_id
      );
      console.log("the classes inside the delete", classes);
      console.log(
        "the current section insde the handlesbmitdelete",
        currentSection.classToDelete
      );
      if (
        !token ||
        !currentSection ||
        !currentSection?.classToDelete?.subject_id
      ) {
        throw new Error("Subject ID is missing");
      }

      await axios.delete(
        `${API_URL}/api/delete_subject_Alloted/${currentSection?.classToDelete?.subject_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      // fetchClassNames();
      handleSearch();

      setShowDeleteModal(false);
      // setSubjects([]);
      toast.success("subject deleted successfully!");
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(`Error deleting subject: ${error.response.data.message}`);
      } else {
        toast.error(`Error deleting subject: ${error.message}`);
      }
      console.error("Error deleting subject:", error);
      // setError(error.message);
    }
    setShowDeleteModal(false);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setShowDeleteModal(false);
  };

  const filteredSections = subjects.filter((section) => {
    // Convert the teacher's name and subject's name to lowercase for case-insensitive comparison
    const teacherName = section?.get_teacher?.name?.toLowerCase() || "";
    const subjectName = section?.get_subject?.name?.toLowerCase() || "";

    // Check if the search term is present in either the teacher's name or the subject's name
    return (
      teacherName.includes(searchTerm.toLowerCase()) ||
      subjectName.includes(searchTerm.toLowerCase())
    );
  });
  const displayedSections = filteredSections.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );
  // handle allot subject close model

  return (
    <>
      {/* <ToastContainer /> */}
      <div className="md:mx-auto md:w-3/4 p-4 bg-white mt-4 ">
        <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
          Student
        </h3>
        <div
          className=" relative  mb-8   h-1  mx-auto bg-red-700"
          style={{
            backgroundColor: "#C03078",
          }}
        ></div>
        {/* <hr className="relative -top-3" /> */}

        <div className="bg-white  rounded-md ">
          {subjects && (
            // <ManageSubjectsTab
            //   classSection={classSection}
            //   nameError={nameError}
            //   handleChangeClassSection={handleChangeClassSection}
            //   handleSearch={handleSearch}
            //   classes={classes}
            //   subjects={subjects}
            //   displayedSections={displayedSections}
            //   setSearchTerm={setSearchTerm}
            //   handleEdit={handleEdit}
            //   handleDelete={handleDelete}
            //   pageCount={pageCount}
            //   handlePageClick={handlePageClick}
            // />
            <div>
              <ToastContainer />
              <div className="mb-4 ">
                <div className="md:w-[90%] mx-auto ">
                  <div className=" w-full  flex justify-center flex-col md:flex-row gap-x-1 md:gap-x-8">
                    <div className="w-full  gap-x-3 md:justify-start justify-between md:w-1/2 my-1 md:my-4 flex  md:flex-row  ">
                      <label
                        htmlFor="classSection"
                        className=" mr-2 pt-2 items-center text-center"
                      >
                        Class <span className="text-red-500">*</span>
                      </label>
                      <div className="w-[60%] md:w-[65%] ">
                        <Select
                          value={selectedClass}
                          onChange={handleClassSelect}
                          options={classOptions}
                          placeholder="Select "
                          isSearchable
                        />
                        {nameError && (
                          <div className=" relative top-0.5 ml-1 text-danger text-xs">
                            {nameError}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="w-full  justify-between  md:w-1/2 my-1 md:my-4 flex  md:flex-row  ">
                      <label
                        htmlFor="classSection"
                        className="md:text-nowrap pt-2 items-center text-center"
                      >
                        Student Name <span className="text-red-500">*</span>
                      </label>
                      <div className="w-[60%] md:w-[65%] ">
                        <Select
                          value={selectedStudent}
                          onChange={handleStudentSelect}
                          options={studentOptions}
                          placeholder="Select "
                          isSearchable
                        />
                        {nameError && (
                          <div className=" relative top-0.5 ml-1 text-danger text-xs">
                            {nameError}
                          </div>
                        )}{" "}
                      </div>
                    </div>

                    <button
                      onClick={handleSearch}
                      type="button"
                      className=" my-1 md:my-4 btn h-10  w-18 md:w-auto btn-primary"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </div>
              {subjects.length > 0 && (
                <div className="container mt-4">
                  <div className="card mx-auto lg:w-full shadow-lg">
                    <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                      <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
                        Manage Student List
                      </h3>
                      <div className="w-1/2 md:w-fit mr-1 ">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search "
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    <div
                      className=" relative w-[97%]   mb-3 h-1  mx-auto bg-red-700"
                      style={{
                        backgroundColor: "#C03078",
                      }}
                    ></div>

                    <div className="card-body w-full">
                      <div className="h-96 lg:h-96 overflow-y-scroll lg:overflow-x-hidden">
                        <table className="min-w-full leading-normal table-auto">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                S.No
                              </th>
                              <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                Class
                              </th>
                              <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                Division
                              </th>
                              <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                Subject
                              </th>
                              <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                Teacher
                              </th>
                              <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                Edit
                              </th>
                              <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                Delete
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {displayedSections.map((subject, index) => (
                              <tr
                                key={subject.section_id}
                                className="text-gray-700 text-sm font-light"
                              >
                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {index + 1}
                                </td>
                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {subject?.get_class?.name}
                                </td>
                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {subject?.get_division?.name}
                                </td>
                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {subject?.get_subject?.name}
                                </td>
                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {subject?.get_teacher?.name}
                                </td>
                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  <button
                                    onClick={() => handleEdit(subject)}
                                    className="text-blue-600 hover:text-blue-800 hover:bg-transparent "
                                  >
                                    <FontAwesomeIcon icon={faEdit} />
                                  </button>
                                </td>
                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  <button
                                    onClick={() =>
                                      handleDelete(subject?.subject_id)
                                    }
                                    className="text-red-600 hover:text-red-800 hover:bg-transparent "
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
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
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50   flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal show " style={{ display: "block" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="flex justify-between p-3">
                  <h5 className="modal-title">Edit Allotment</h5>
                  <RxCross1
                    className="float-end relative  mt-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                    type="button"
                    // className="btn-close text-red-600"
                    onClick={handleCloseModal}
                  />
                </div>
                <div
                  className=" relative  mb-3 h-1 w-[97%] mx-auto bg-red-700"
                  style={{
                    backgroundColor: "#C03078",
                  }}
                ></div>
                <div className="modal-body">
                  {/* Modal content for editing */}
                  <div className=" relative mb-3 flex justify-center  mx-4 gap-x-7">
                    <label htmlFor="newSectionName" className="w-1/2 mt-2">
                      Class :{" "}
                    </label>
                    <div className="font-bold form-control  shadow-md  mb-2">
                      {newclassnames}
                    </div>
                  </div>
                  <div className=" relative mb-3 flex justify-center  mx-4 gap-x-7">
                    <label htmlFor="newSectionName" className="w-1/2 mt-2">
                      Section:{" "}
                    </label>
                    <span className="font-semibold form-control shadow-md mb-2">
                      {newSection}
                    </span>
                  </div>
                  <div className=" relative  flex justify-start  mx-4 gap-x-7">
                    <label htmlFor="newSectionName" className="w-1/2 mt-2 ">
                      Subject:{" "}
                    </label>{" "}
                    <span className="font-semibold form-control shadow-md mb-2 ">
                      {newSubject}
                    </span>
                  </div>
                  <div className=" modal-body">
                    <div
                      ref={dropdownRef}
                      className=" relative mb-3 flex justify-center mx-2 gap-4 "
                    >
                      <label
                        htmlFor="newDepartmentId"
                        className="w-1/2 mt-2 text-nowrap "
                      >
                        Teacher assigned <span className="text-red-500">*</span>
                      </label>
                      <Select
                        // className="border w-[50%] h-10 rounded-md px-3 py-2 md:w-full mr-2 shadow-md"
                        className="w-full shadow-md"
                        value={selectedTeacher}
                        onChange={handleTeacherSelect}
                        options={teacherOptions}
                        placeholder="Select "
                        isSearchable
                      />
                    </div>
                  </div>
                </div>
                <div className=" flex justify-end p-3">
                  <button
                    type="button"
                    className="btn btn-primary px-3 mb-2"
                    onClick={handleSubmitEdit}
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  Are you sure you want to delete this subject{" "}
                  {` ${currestSubjectNameForDelete} `} ?
                </div>
                <div className=" flex justify-end p-3">
                  <button
                    type="button"
                    className="btn btn-danger px-3 mb-2"
                    onClick={handleSubmitDelete}
                  >
                    Delete
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

export default ManageSubjectList;
