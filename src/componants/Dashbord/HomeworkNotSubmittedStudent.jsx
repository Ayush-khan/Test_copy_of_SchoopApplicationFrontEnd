import { useEffect, useState, useRef } from "react";
import axios from "axios";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RxCross1 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

function HomeworkNotSubmittedStudent() {
  const API_URL = import.meta.env.VITE_API_URL; // URL for host
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  const [roleId, setRoleId] = useState("");
  const [regId, setRegId] = useState("");

  const [classes, setClasses] = useState([]);
  const [classIdForManage, setclassIdForManage] = useState("");
  const [sectionIdForManage, setSectionIdForManage] = useState("");

  const [nameError, setNameError] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");

  const pageSize = 10;

  useEffect(() => {
    fetchRoleId();
  }, []);

  useEffect(() => {
    if (!roleId) return;

    fetchClassNames();
  }, [roleId]);

  const fetchRoleId = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      toast.error("Authentication token not found Please login again");
      navigate("/");
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/api/sessionData`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const roleId = response?.data?.user?.role_id;
      console.log("role id", response?.data?.user?.role_id);

      const regId = response?.data?.user?.reg_id;
      console.log("reg id", response?.data?.user?.reg_id);
      setRegId(regId);

      if (roleId) {
        setRoleId(roleId);
      } else {
        console.warn("role_id not found in sessionData response");
      }
    } catch (error) {
      console.error("Failed to fetch session data:", error);
    }
  };

  const fetchClassNames = async () => {
    try {
      const token = localStorage.getItem("authToken");

      // 🔹 If Teacher
      if (roleId === "T") {
        const responseForClass = await axios.get(
          `${API_URL}/api/get_teacherclasseswithclassteacher?teacher_id=${regId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const mappedData =
          responseForClass.data?.data?.map((item) => ({
            value: `${item.class_id}-${item.section_id}`,
            label: `${item.classname} ${item.sectionname}`,
            class_id: item.class_id,
            section_id: item.section_id,
          })) || [];

        setClasses(mappedData); // 👈 reuse same state
      }
      // 🔹 Admin / Other roles
      else {
        const response = await axios.get(`${API_URL}/api/get_class_section`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (Array.isArray(response.data)) {
          setClasses(response.data);
        } else {
          setError("Unexpected data format");
        }
      }
    } catch (error) {
      console.error("Error fetching class and section names:", error);
      setError("Error fetching class and section names");
    }
  };

  const classOptions = classes.map((cls) => ({
    value: cls.value || `${cls?.get_class?.name}-${cls.name}`,
    label: cls.label || `${cls?.get_class?.name} ${cls.name}`,
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

  // const fetchSections = async () => {
  //   if (!classIdForManage) {
  //     setNameError("Please select a class first");
  //     toast.error("Please select a class first");
  //     return;
  //   }

  //   if (isSubmitting) return; // ⛔ prevent double click

  //   setIsSubmitting(true);
  //   setLoading(true);
  //   setNameError("");

  //   try {
  //     const token = localStorage.getItem("authToken");
  //     if (!token) throw new Error("No authentication token found");

  //     const response = await axios.get(
  //       `${API_URL}/api/homeworks/pending/today`,
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //         params: {
  //           class_id: classIdForManage,
  //           section_id: sectionIdForManage,
  //         },
  //       }
  //     );

  //     const data = response.data.data || [];
  //     console.log("data", data);

  //     if (data.length > 0) {
  //       setSections(data);
  //       setPageCount(Math.ceil(data.length / pageSize));
  //     } else {
  //       toast.error("No data found.");
  //     }
  //   } catch (error) {
  //     toast.error("No data found.");
  //   } finally {
  //     setLoading(false);
  //     setIsSubmitting(false);
  //   }
  // };

  const fetchSections = async () => {
    if (!classIdForManage) {
      setNameError("Please select a class first");
      toast.error("Please select a class first");
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    setLoading(true);
    setNameError("");
    setSections([]);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      const response = await axios.get(
        `${API_URL}/api/homeworks/pending/today`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            class_id: classIdForManage,
            section_id: sectionIdForManage,
          },
        }
      );

      const data = response.data.data || [];
      console.log("data", data);

      if (data.length > 0) {
        setSections(data);
        setPageCount(Math.ceil(data.length / pageSize));
      } else {
        // Clear data if no results
        setSections([]);
        setPageCount(0);
        toast.error("No data found.");
      }
    } catch (error) {
      // Clear data on error too
      setSections([]);
      setPageCount(0);
      toast.error("No data found.");
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
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

  const filteredSections = sections.filter((leave) => {
    const searchLower = searchTerm.trim().toLowerCase();
    const fullName = `${leave.first_name || ""} ${leave.mid_name || ""} ${leave.last_name || ""
      }`.toLowerCase();
    return (
      leave.roll_no.toString().includes(searchLower) ||
      leave.subject_name.toLowerCase().includes(searchLower) ||
      fullName.includes(searchLower)
    );
  });

  useEffect(() => {
    setPageCount(Math.ceil(filteredSections.length / pageSize));
  }, [filteredSections, pageSize]);

  const displayedSections = filteredSections.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const camelCase = (str) =>
    str
      ?.toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  return (
    <>
      <ToastContainer />

      <div className="container  mt-4">
        <div className="card mx-auto lg:w-[70%] shadow-lg">
          <div className="p-2 px-3 bg-gray-100 flex justify-between items-center">
            <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
              Today's homework not submitted student ist
            </h3>{" "}
            <div className="box-border flex md:gap-x-2 justify-end md:h-10">
              <div className=" w-1/2 md:w-fit mr-1">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search "
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <RxCross1
                className="float-end relative right-2 top-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                onClick={() => {
                  navigate("/Dashboard");
                }}
              />
            </div>
          </div>
          <div
            className=" relative w-[97%]   mb-3 h-1  mx-auto bg-red-700"
            style={{
              backgroundColor: "#C03078",
            }}
          ></div>

          <div className="md:w-full relative left-[10%] m-2 ">
            <div className="form-group w-full md:w-[70%] flex justify-start gap-x-1 ">
              <label
                htmlFor="classSection"
                className="w-[30%] pt-2 text-center"
              >
                Select Class <span className="text-red-500">*</span>
              </label>
              <div className="w-[40%] mr-4">
                <Select
                  value={selectedClass}
                  onChange={handleClassSelect}
                  options={classOptions}
                  placeholder="Class"
                  isSearchable
                  isClearable
                />
                {nameError && (
                  <div className="text-danger text-xs mt-1">{nameError}</div>
                )}
              </div>
              <button
                onClick={fetchSections}
                type="button"
                disabled={isSubmitting}
                className="btn h-10 w-18 md:w-auto btn-primary"
              >
                {isSubmitting ? "Searching..." : "Search"}
              </button>
            </div>
          </div>

          {displayedSections.length > 0 && (
            <>
              <div className="card-body w-full mt-2">
                <div className="h-96 lg:h-96 w-full md:w-[80%] mx-auto  overflow-y-scroll lg:overflow-x-hidden ">
                  <div className="bg-white  rounded-lg shadow-xs ">
                    <table className="min-w-full leading-normal table-auto ">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="px-2 w-full md:w-[12%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                            Sr. No.
                          </th>
                          <th className="px-2 w-full md:w-[12%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                            Roll No.
                          </th>
                          <th className=" -px-2  w-full md:w-[25%] text-center py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                            Student Name
                          </th>
                          <th className=" -px-2  w-full md:w-[25%] text-center py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                            Subject Name
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td
                              colSpan="6"
                              className="text-center text-blue-700 text-xl py-10"
                            >
                              Please wait while data is loading...
                            </td>
                          </tr>
                        ) : displayedSections.length ? (
                          displayedSections.map((leave, index) => (
                            <tr
                              key={leave.section_id}
                              className={`${index % 2 === 0 ? "bg-white" : "bg-gray-100"
                                } hover:bg-gray-50`}
                            >
                              <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                                <p className="text-gray-900 whitespace-no-wrap relative top-2">
                                  {currentPage * pageSize + index + 1}
                                </p>
                              </td>
                              <td className="text-center px-2  border border-gray-950 text-sm">
                                <p className="text-gray-900 whitespace-no-wrap relative top-2">
                                  {leave.roll_no}
                                </p>
                              </td>
                              <td className="text-center px-2  border border-gray-950 text-sm">
                                <p className="text-gray-900 whitespace-no-wrap relative top-2">
                                  {camelCase(leave.first_name)}{" "}
                                  {camelCase(leave.mid_name)}{" "}
                                  {camelCase(leave.last_name)}
                                </p>
                              </td>
                              <td className="text-center px-2  border border-gray-950 text-sm">
                                <p className="text-gray-900 whitespace-no-wrap relative top-2">
                                  {leave.subject_name}
                                </p>
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
                </div>

                <div className=" flex justify-center pt-2 -mb-3">
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
                    containerClassName={"pagination"}
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
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default HomeworkNotSubmittedStudent;
