import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import { RxCross1 } from "react-icons/rx";
import LoaderStyle from "../../componants/common/LoaderFinal/LoaderStyle";
// import AllotSubjectTab from "./AllotMarksHeadingTab";
import Select from "react-select";
function StudentAbsent() {
  const API_URL = import.meta.env.VITE_API_URL; // URL for host
  const [activeTab, setActiveTab] = useState("Manage");
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classIdForManage, setclassIdForManage] = useState("");
  const [sectionIdForManage, setSectionIdForManage] = useState("");
  //   For the dropdown of Teachers name api
  const [countAbsentStudent, setCountAbsentStudents] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  //   for allot subject checkboxes
  const [error, setError] = useState(null);
  const [nameError, setNameError] = useState(null);
  // for react-search of manage tab teacher Edit and select class
  const [selectedClass, setSelectedClass] = useState(null);
  // for Edit model
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");

  const navigate = useNavigate();
  const pageSize = 10;
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
      setclassIdForManage(" ");
      setSectionIdForManage(" ");
    }
    console.log("setSelectedClass", selectedClass);
    console.log("setclassIdForManage", classIdForManage);
    console.log("setSectionIdForManage", sectionIdForManage);
  };

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

  const handleSearch = async () => {
    if (isSubmitting) return; // Prevent re-submitting
    setIsSubmitting(true);

    // if (!classIdForManage) {
    //   setNameError("Please select the class.");
    //   setIsSubmitting(false);
    //   return;
    // }
    setSearchTerm("");
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
          },
        }
      );
      console.log(
        "the response of the AllotMarksHeadingTab is *******",
        response.data
      );
      if (response?.data?.data.absent_student.length > 0) {
        setSubjects(response?.data?.data.absent_student);
        setPageCount(
          Math.ceil(response?.data?.data.absent_student.length / 10)
        ); // Example pagination logic
        setCountAbsentStudents(response?.data?.data?.count_absent_student);
      } else {
        setSubjects([]);
        setCountAbsentStudents("");
        toast.error(
          `Hooray! No students are absent today in ${selectedClass.label} `
        );
      }
    } catch (error) {
      console.error(
        "Error fetching Bonafied certificates Listing:",
        error.response.data.message
      );
      setError("Error fetching Bonafied certificates");
      toast.error(error.response.data.message);
    } finally {
      setIsSubmitting(false); // Re-enable the button after the operation
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

  //   const filteredSections = subjects.filter((section) => {
  //     // Convert the teacher's name and subject's name to lowercase for case-insensitive comparison
  //     const subjectNameIs = section?.stud_name.toLowerCase() || "";

  //     // Check if the search term is present in either the teacher's name or the subject's name
  //     return subjectNameIs.toLowerCase().includes(searchLower);
  //   });
  const displayedSections = filteredSections.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  return (
    <>
      {/* <ToastContainer /> */}
      <div className="md:mx-auto md:w-[65%] p-4 bg-white mt-4 ">
        <div className=" card-header  flex justify-between items-center  ">
          <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
            Today's Absent Students
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

        <div className="bg-white  rounded-md -mt-5">
          {activeTab === "Manage" && (
            <div>
              <ToastContainer />
              <div className="mb-4">
                <div className="   md:w-[85%] relative left-[5%]  md:mt-[7%] ">
                  <div className="form-group mt-4 w-full md:w-[80%] flex justify-start gap-x-1 md:gap-x-6">
                    <label
                      htmlFor="classSection"
                      className="w-1/4 pt-2 items-center text-center"
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
                        className=" text-sm w-full md:w-[60%] item-center relative left-0 md:left-4"
                      />
                      {nameError && (
                        <div className=" relative top-0.5 left-3 ml-1 text-danger text-xs">
                          {nameError}
                        </div>
                      )}{" "}
                    </div>
                    <button
                      onClick={handleSearch}
                      type="button"
                      disabled={isSubmitting}
                      className="btn h-10  w-18 md:w-auto relative  right-0 md:right-[15%] btn-primary"
                    >
                      {isSubmitting ? "Searching..." : "Search"}
                    </button>
                  </div>
                </div>
              </div>
              {subjects.length > 0 && (
                <div className="container mt-8">
                  <div className="card mx-auto lg:w-full shadow-lg">
                    <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                      <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
                        {/* List of Students Absent Today{" "} */}
                        Today's Absentee List{" "}
                        <span className="text-[.8em] pb-1 text-blue-500">
                          {selectedClass?.label
                            ? `(${selectedClass.label} | Absent: ${countAbsentStudent} Students)`
                            : `(Total Absent - ${countAbsentStudent})`}
                        </span>
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
                              <th className="px-2 text-center w-full md:w-[10%] lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                Sr.No
                              </th>
                              <th className="px-2 text-center   lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                Student Name
                              </th>
                              <th className="px-2  text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                Class
                              </th>
                              <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                Section
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {loading ? (
                              <tr>
                                <td
                                  colSpan="4"
                                  className="text-center py-6 text-blue-700"
                                >
                                  <div className="flex justify-center items-center h-64">
                                    <LoaderStyle />
                                  </div>{" "}
                                </td>
                              </tr>
                            ) : displayedSections.length ? (
                              displayedSections.map((classItem, index) => (
                                <tr
                                  key={index}
                                  className={`${
                                    index % 2 === 0 ? "bg-white" : "bg-gray-100"
                                  } hover:bg-gray-50`}
                                >
                                  <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap relative top-2">
                                      {currentPage * pageSize + index + 1}
                                    </p>
                                  </td>
                                  <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap relative top-2">
                                      {classItem.first_name}{" "}
                                      {classItem.mid_name || ""}{" "}
                                      {classItem.last_name}
                                    </p>
                                  </td>
                                  <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap relative top-2">
                                      {classItem.classname}
                                    </p>
                                  </td>
                                  <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap relative top-2">
                                      {classItem.sectionname}
                                    </p>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan="4"
                                  className="text-center py-6 text-red-700"
                                >
                                  Oops! No data found...
                                </td>
                              </tr>
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
          )}
        </div>
      </div>
    </>
  );
}

export default StudentAbsent;
