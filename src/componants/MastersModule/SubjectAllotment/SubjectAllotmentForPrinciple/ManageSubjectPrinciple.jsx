// This is the 100% working
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import { RxCross1 } from "react-icons/rx";
import Select from "react-select";
// import Loader from "../../common/LoaderFinal/LoaderStyle.jsx";
function ManageSubjectPrinciple() {
  const API_URL = import.meta.env.VITE_API_URL; // URL for host
  const [classes, setClasses] = useState([]);
  const [classesforsubjectallot, setclassesforsubjectallot] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [subjectsForAllotSubject, setSubjectsForAllotSubject] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const [classId, setclassId] = useState("");
  const [classIdForManage, setclassIdForManage] = useState("");
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [roleId, setRoleId] = useState("");
  const [allotSubjectTabData, setAllotSubjectTabData] = useState([]); //
  const [error, setError] = useState(null);
  const [nameError, setNameError] = useState(null);
  const [division, setDivisions] = useState([]);
  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");
  // for react-search of manage tab teacher Edit and select class
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClassSelect = (selectedOption) => {
    setNameError("");
    setSelectedClass(selectedOption);
    setclassIdForManage(selectedOption ? selectedOption.value : null); // Assuming value is the class ID
  };

  const teacherOptions = departments.map((dept) => ({
    value: dept.reg_id,
    label: dept.name,
  }));
  console.log("teacherOptions", teacherOptions);
  const classOptions = classes.map((cls) => ({
    value: cls.section_id,
    label: `${cls?.get_class?.name}  ${cls.name}`,
  }));

  //   Sorting logic state

  const pageSize = 10;
  const fetchClassNames = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${API_URL}/api/get_class_section`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(response.data)) {
        setClasses(response.data);
        console.log("the name and section", response.data);
      } else {
        setError("Unexpected data format");
      }
    } catch (error) {
      console.error("Error fetching class and section names:", error);
      setError("Error fetching class and section names");
    }
  };
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
    fetchDepartments();
    fetchClassNamesForAllotSubject();
  }, []);
  // Listing tabs data for diffrente tabs
  const handleSearch = async () => {
    if (isSubmitting) return; // Prevent re-submitting
    setIsSubmitting(true);
    if (!classIdForManage) {
      setNameError("Please select the class.");
      setIsSubmitting(false);
      return;
    }
    setSearchTerm("");
    try {
      console.log(
        "for this section id in searching inside subject allotment",
        classIdForManage
      );

      const token = localStorage.getItem("authToken");
      setSubjects([]);
      const response = await axios.get(`${API_URL}/api/get_subject_Alloted`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { section_id: classIdForManage },
      });

      console.log("The response of the subject allotment is: ", response.data);

      if (response.data.length > 0) {
        setSubjects(response.data);
        console.log("Updated subjects data", response.data);

        setPageCount(Math.ceil(response.data.length / 10)); // Example pagination logic
      } else {
        setSubjects([]);
        toast.error("No subjects found for the selected class and division.");
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setError("Error fetching subjects");
    } finally {
      setIsSubmitting(false); // Re-enable the button after the operation
    }
  };

  const handleSearchForsubjectAllot = async () => {
    if (!classId) {
      return;
    }
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/api/get_divisions_and_subjects/${classId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data && response.data.divisions && response.data.subjects) {
        setDivisions(response.data.divisions);
        setSubjectsForAllotSubject(response.data.subjects);
        console.log(
          "this is get for api get_divisions_and_subjects ",
          subjectsForAllotSubject
        );
        const formattedAllotments = response.data.divisions.map((division) => ({
          section_id: division.section_id,
          name: division.name,
          subjects: response.data.subjects,
        }));
        setAllotSubjectTabData(formattedAllotments);
        console.log("formatted Allotments", formattedAllotments);
      } else {
        toast.error("Unexpected data format");
      }
    } catch (error) {
      toast.error(
        "Failed to fetch data for Allot Subjected tab. Please try again."
      );
    }
  };
  useEffect(() => {
    handleSearchForsubjectAllot();
  }, [classId]);

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };
  const handleCloseModal = () => {
    setSelectedTeacher(null);
    setCurrentSection(null);
    setShowEditModal(false);
    setShowDeleteModal(false);
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
  const filteredSections = subjects.filter((section) => {
    const teacherName = section?.get_teacher?.name?.toLowerCase() || "";
    const subjectName = section?.get_subject?.name?.toLowerCase() || "";
    return (
      teacherName.toLowerCase().includes(searchLower) ||
      subjectName.toLowerCase().includes(searchLower)
    );
  });

  useEffect(() => {
    setPageCount(Math.ceil(filteredSections.length / pageSize));
  }, [filteredSections, pageSize]);

  const displayedSections = filteredSections.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );
  return (
    <>
      {/* <ToastContainer /> */}
      <div className="md:mx-auto md:w-3/4 p-4 bg-white mt-4 ">
        <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
          Subject Allotment
        </h3>
        <div
          className=" relative  mb-8   h-1  mx-auto bg-red-700"
          style={{
            backgroundColor: "#C03078",
          }}
        ></div>
        {/* <hr className="relative -top-3" /> */}
        <div className="bg-white  rounded-md -mt-5">
          <div>
            <ToastContainer />
            <div className="mb-4">
              <div className="md:w-[80%] mx-auto">
                <div className="form-group mt-6 md:mt-16 w-full md:w-[80%] flex justify-start gap-x-1 md:gap-x-6">
                  <label
                    htmlFor="classSection"
                    className="w-1/4 pt-2 items-center text-center"
                  >
                    Select Class <span className="text-red-500">*</span>
                  </label>
                  <div className="w-full">
                    <Select
                      value={selectedClass}
                      onChange={handleClassSelect}
                      options={classOptions}
                      placeholder="Class"
                      isSearchable
                      isClearable
                      className=" text-sm w-full md:w-[60%] item-center relative left-0 md:left-4"
                    />
                    {nameError && (
                      <div className=" relative top-0.5 left-3  ml-1 text-danger text-xs">
                        {nameError}
                      </div>
                    )}{" "}
                  </div>
                  <button
                    onClick={handleSearch}
                    type="button"
                    className="btn h-10  w-18 md:w-auto relative  right-0 md:right-[15%] btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Searching..." : "Search"}
                  </button>
                </div>
              </div>
            </div>
            {subjects.length > 0 && (
              <div className="container mt-4">
                <div className="card mx-auto lg:w-full shadow-lg">
                  <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                    <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
                      Manage Subjects List
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
                          <tr className="bg-gray-200">
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Sr.No
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Class
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Subject
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Teacher
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {isSubmitting ? (
                            <div className=" absolute left-[4%] w-[100%]  text-center flex justify-center items-center mt-14">
                              <div className=" text-center text-xl text-blue-700">
                                Please wait while data is loading...
                              </div>
                            </div>
                          ) : displayedSections.length ? (
                            displayedSections.map((subject, index) => (
                              <tr
                                key={subject?.subject_id}
                                className=" text-sm "
                              >
                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {currentPage * pageSize + index + 1}
                                </td>
                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {`${subject?.get_class?.name} ${subject?.get_division?.name}`}
                                </td>

                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {subject?.get_subject?.name}
                                </td>
                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {subject?.get_teacher?.name}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <div className=" absolute left-[1%] w-[100%]  text-center flex justify-center items-center mt-14">
                              <div className=" text-center text-xl text-red-700">
                                Oops! No data found..
                              </div>
                            </div>
                          )}
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
        </div>
      </div>
    </>
  );
}

export default ManageSubjectPrinciple;
