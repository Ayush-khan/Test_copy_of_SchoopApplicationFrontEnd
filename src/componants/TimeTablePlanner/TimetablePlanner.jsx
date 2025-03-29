// import { useState } from "react";
// import CommonTable from "./CommonTable";

// const data = {
//   tabs: [
//     { id: "1-A", label: "1-A", periods: 4 },
//     { id: "1-B", label: "1-B", periods: 5 },
//     { id: "12-A", label: "12-A", periods: 6 },
//     { id: "12-B", label: "12-B", periods: 4 },
//   ],
//   subjects: {
//     "1-A": ["Math", "Science", "English", "History"],
//     "1-B": ["Biology", "Chemistry", "Physics", "Geography"],
//     "12-A": [
//       "Economics",
//       "Business Studies",
//       "Accountancy",
//       "Political Science",
//     ],
//     "12-B": [
//       "Computer Science",
//       "Art",
//       "Physical Education",
//       "Environmental Science",
//     ],
//   },
// };

// export default function TimetablePlanner() {
//   const [activeTab, setActiveTab] = useState(data.tabs[0].id);

//   return (
//     <>
//       {" "}
//       <div className="flex">
//         <div className="w-1/4 border-r">
//           {data.tabs.map((tab) => (
//             <button
//               key={tab.id}
//               className={`block p-2 w-full ${
//                 activeTab === tab.id ? "bg-blue-500 text-white" : "bg-white"
//               }`}
//               onClick={() => setActiveTab(tab.id)}
//             >
//               {tab.label}
//             </button>
//           ))}
//         </div>

//         <div className="w-3/4 p-4">
//           <h2 className="text-xl font-bold mb-4">Class - {activeTab}</h2>
//           <CommonTable
//             periods={data.tabs.find((tab) => tab.id === activeTab).periods}
//             subjects={data.subjects[activeTab]}
//           />
//         </div>
//       </div>
//     </>
//   );
// }

import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
import Loader from "../common/LoaderFinal/LoaderStyle";
import { FiPrinter } from "react-icons/fi";
import { FaFileExcel, FaRegCalendarAlt } from "react-icons/fa";
import * as XLSX from "xlsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";
import { format, startOfWeek, endOfWeek } from "date-fns";
import CommonTable from "./CommonTable";

const TimetablePlanner = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [toDate, setToDate] = useState(null);
  //   const [fromDate, setFromDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingForSearch, setLoadingForSearch] = useState(false);

  const navigate = useNavigate();
  const [loadingExams, setLoadingExams] = useState(false);
  const [studentError, setStudentError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [timetable, setTimetable] = useState([]);

  const pageSize = 10;
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const [weekRange, setWeekRange] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const datePickerRef = useRef(null);
  // const [tabs, setTabs] = useState([]);

  const data = {
    tabs: [
      { id: "1-A", label: "1-A", periods: 4 },
      { id: "1-B", label: "1-B", periods: 5 },
      { id: "12-A", label: "12-A", periods: 6 },
      { id: "12-B", label: "12-B", periods: 4 },
    ],
    subjects: {
      "1-A": ["Math", "Science", "English", "History"],
      "1-B": ["Biology", "Chemistry", "Physics", "Geography"],
      "12-A": [
        "Economics",
        "Business Studies",
        "Accountancy",
        "Political Science",
      ],
      "12-B": [
        "Computer Science",
        "Art",
        "Physical Education",
        "Environmental Science",
      ],
    },
  };
  const [activeTab, setActiveTab] = useState(data.tabs[0].id);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoadingExams(true);
      const token = localStorage.getItem("authToken");

      const response = await axios.get(`${API_URL}/api/staff_list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Class", response);
      setStudentNameWithClassId(response?.data || []);
    } catch (error) {
      toast.error("Error fetching Classes");
      console.error("Error fetching Classes:", error);
    } finally {
      setLoadingExams(false);
    }
  };

  const handleStudentSelect = (selectedOption) => {
    setStudentError(""); // Reset error if student is select.
    setSelectedStudent(selectedOption);
    setSelectedStudentId(selectedOption?.value);
  };

  const studentOptions = useMemo(
    () =>
      studentNameWithClassId.map((cls) => ({
        value: cls?.teacher_id,
        label: `${cls.name}`,
      })),
    [studentNameWithClassId]
  );

  // Handle search and fetch parent information

  const handleSearch = async () => {
    setLoadingForSearch(false);

    if (!selectedStudentId) {
      setStudentError("Please select Staff Name.");
      setLoadingForSearch(false);
      return;
    }

    setSearchTerm("");

    try {
      const formattedWeek = weekRange.replace(/\s/g, "").replace(/%20/g, ""); // Ensure no extra spaces or encoded symbols
      console.log("Formatted Week is: --->", formattedWeek);

      setLoadingForSearch(true); // Start loading
      setTimetable([]);

      const token = localStorage.getItem("authToken");

      const params = {
        teacher_id: selectedStudentId,
      };

      const response = await axios.get(
        `${API_URL}/api/get_teacherclasstimetable`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );
      // const formattedTabs = response.data.data.map((item) => ({
      //             id: `${item.classname}-${item.sectionname}`,
      //             classname: item.classname,
      //             sectionname: item.sectionname,
      //             teachername: item.teachername,
      //           }));

      //           // Sort tabs by class in ascending order
      //           const sortedTabs = formattedTabs.sort((a, b) => {
      //             const classA = parseInt(a.classname, 10);
      //             const classB = parseInt(b.classname, 10);
      //             return classA - classB;
      //           });

      //   setTabs(sortedTabs);
      //   setActiveTab(sortedTabs[0]?.id || ''); // Set default active tab
      // }

      if (!response?.data?.data || response?.data?.data?.length === 0) {
        toast.error("Substitution Weekly Hours Report not found.");
        setTimetable([]);
      } else {
        setTimetable(response?.data?.data);
        setPageCount(Math.ceil(response?.data?.data?.length / pageSize));
      }
    } catch (error) {
      console.error("Error fetching Substitution Weekly Hours Report:", error);
      toast.error(
        "Error fetching Substitution Weekly Hours Report. Please try again."
      );
    } finally {
      setIsSubmitting(false);
      setLoadingForSearch(false);
    }
  };

  console.log("row", timetable);
  // const filteredTabs = tabs.filter((tab) =>
  //   tab.id.toLowerCase().includes(searchTerm.toLowerCase())
  // );
  const filteredSections = timetable.filter((student) => {
    const searchLower = searchTerm.toLowerCase();

    // Extract relevant fields and convert them to lowercase for case-insensitive search
    const teacherName = student?.teachername?.toLowerCase() || "";
    const week = student?.week?.toLowerCase() || "";
    const totalHours =
      student?.time_difference_decimal?.toString().toLowerCase() || "";

    // Check if the search term is present in any of the specified fields
    return (
      teacherName.includes(searchLower) ||
      week.includes(searchLower) ||
      totalHours.includes(searchLower)
    );
  });

  const displayedSections = filteredSections.slice(currentPage * pageSize);

  return (
    <>
      <div className="w-full md:w-[85%] mx-auto p-4 ">
        <ToastContainer />
        <div className="card p-4 rounded-md ">
          <div className=" card-header mb-4 flex justify-between items-center ">
            <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
              Substitution Weekly Hours Report
            </h5>
            <RxCross1
              className=" relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
              onClick={() => {
                navigate("/dashboard");
              }}
            />
          </div>
          <div
            className=" relative w-full   -top-6 h-1  mx-auto bg-red-700"
            style={{
              backgroundColor: "#C03078",
            }}
          ></div>

          <>
            <div className=" w-full md:w-[85%]   flex justify-center flex-col md:flex-row gap-x-1     ml-0    p-2">
              <div className="w-full md:w-[99%] flex md:flex-row justify-between items-center mt-0 md:mt-4">
                <div className="w-full md:w-[90%] gap-x-0 md:gap-x-12 flex flex-col gap-y-2 md:gap-y-0 md:flex-row">
                  {/* Class Dropdown */}
                  <div className="w-full  md:w-[50%] gap-x-2 justify-around my-1 md:my-4 flex md:flex-row">
                    <label
                      className="w-full md:w-[25%] text-md pl-0 md:pl-5 mt-1.5"
                      htmlFor="studentSelect"
                    >
                      Staff <span className="text-red-500">*</span>
                    </label>
                    <div className="w-full md:w-[65%]">
                      <Select
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        id="studentSelect"
                        value={selectedStudent}
                        onChange={handleStudentSelect}
                        options={studentOptions}
                        placeholder={loadingExams ? "Loading..." : "Select"}
                        isSearchable
                        isClearable
                        className="text-sm"
                        isDisabled={loadingExams}
                        styles={{
                          control: (provided) => ({
                            ...provided,
                            fontSize: ".9em", // Adjust font size for selected value
                            minHeight: "30px", // Reduce height
                          }),
                          menu: (provided) => ({
                            ...provided,
                            fontSize: "1em", // Adjust font size for dropdown options
                          }),
                          option: (provided) => ({
                            ...provided,
                            fontSize: ".9em", // Adjust font size for each option
                          }),
                        }}
                      />
                      {studentError && (
                        <div className="h-8 relative ml-1 text-danger text-xs">
                          {studentError}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Browse Button */}
                  <div className="mt-1">
                    <button
                      type="search"
                      onClick={handleSearch}
                      style={{ backgroundColor: "#2196F3" }}
                      className={`btn h-10 w-18 md:w-auto btn-primary text-white font-bold py-1 border-1 border-blue-500 px-4 rounded ${
                        loadingForSearch ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      disabled={loadingForSearch}
                    >
                      {loadingForSearch ? (
                        <span className="flex items-center">
                          <svg
                            className="animate-spin h-4 w-4 mr-2 text-white"
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
                          Browsing...
                        </span>
                      ) : (
                        "Browse"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {timetable.length > 0 && (
              <>
                <div className="w-full  mt-4">
                  <div className="card mx-auto lg:w-full shadow-lg">
                    <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                      <div className="w-full   flex flex-row justify-between mr-0 md:mr-4 ">
                        <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
                          List Of Substitution Weekly Hours Report
                        </h3>
                        <div className="w-1/2 md:w-[18%] mr-1 ">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Search "
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    <div
                      className=" relative w-[97%]   mb-3 h-1  mx-auto bg-red-700"
                      style={{
                        backgroundColor: "#C03078",
                      }}
                    ></div>

                    <div className="card-body w-full">
                      <div
                        className="h-96 lg:h-96 overflow-y-scroll overflow-x-scroll"
                        style={{
                          scrollbarWidth: "thin", // Makes scrollbar thin in Firefox
                          scrollbarColor: "#C03178 transparent", // Sets track and thumb color in Firefox
                        }}
                      >
                        <table className="w-full md:w-[80%] mx-auto leading-normal table-auto">
                          <div className="flex">
                            <div className="w-1/4 border-r">
                              {data.tabs.map((tab) => (
                                <button
                                  key={tab.id}
                                  className={`block p-2 w-full ${
                                    activeTab === tab.id
                                      ? "bg-blue-500 text-white"
                                      : "bg-white"
                                  }`}
                                  onClick={() => setActiveTab(tab.id)}
                                >
                                  {tab.label}
                                </button>
                              ))}
                            </div>

                            <div className="w-3/4 p-4">
                              <h2 className="text-xl font-bold mb-4">
                                Class - {activeTab}
                              </h2>
                              <CommonTable
                                periods={
                                  data.tabs.find((tab) => tab.id === activeTab)
                                    .periods
                                }
                                subjects={data.subjects[activeTab]}
                              />
                            </div>
                          </div>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        </div>
      </div>
    </>
  );
};

export default TimetablePlanner;
