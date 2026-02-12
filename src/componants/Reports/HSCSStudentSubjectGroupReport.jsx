import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
import Loader from "../common/LoaderFinal/LoaderStyle";
import { FiPrinter } from "react-icons/fi";
import { FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";

const HSCSStudentSubjectGroupReport = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const [selectedClass, setSelectedClass] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [classNameWithClassId, setClassNameWithClassId] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState(null);
    const [loadingForSearch, setLoadingForSearch] = useState(false);
    const [selectedDivision, setSelectedDivision] = useState(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [classError, setClassError] = useState("");
    const [timetable, setTimetable] = useState([]);
    const [subjectGroups, setSubjectGroups] = useState([]);
    const [optionalSubjects, setOptionalSubjects] = useState([]);
    const [subjectGroup, setSubjectGroup] = useState("");
    const [optionalSubject, setOptionalSubject] = useState("");
    const [subjectGroupError, setSubjectGroupError] = useState("");
    const [optionalSubjectError, setOptionalSubjectError] = useState("");
    const pageSize = 10;
    const [pageCount, setPageCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchClasses();
        fetchSubjectGroups();
        fetchOptionalSubjects();

    }, []);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("authToken");

            const response = await axios.get(`${API_URL}/api/get_hsc_classes_of_a_department`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("Class", response);
            setClassNameWithClassId(response?.data?.data || []);
        } catch (error) {
            toast.error("Error fetching Classes");
            console.error("Error fetching Classes:", error);
        } finally {
            setLoading(false);
        }
    };
    const fetchSubjectGroups = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            const response = await axios.get(`${API_URL}/api/get_subject_group`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setSubjectGroups(response.data.data || []);
        } catch (err) {
            toast.error("Error fetching subject groups");
        } finally {
            setLoading(false);
        }
    };

    const fetchOptionalSubjects = async () => {
        try {
            const token = localStorage.getItem("authToken");
            const response = await axios.get(`${API_URL}/api/get_optional_subject`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setOptionalSubjects(response.data.data || []);
        } catch (err) {
            toast.error("Error fetching optional subjects");
        }
    };


    const handleClassSelect = (selectedOption) => {
        setClassError(""); // Reset error if student is select.
        setSelectedClass(selectedOption);
        setSelectedClassId(selectedOption?.value);


    };



    const classOptions = useMemo(
        () =>
            classNameWithClassId.map((cls) => ({
                value: cls.class_id,
                label: `${cls.name}`,
                key: `${cls.class_id}`,
            })),
        [classNameWithClassId]
    );
    const subjectGroupOptions = useMemo(
        () =>
            subjectGroups.map((group) => ({
                value: group.sub_group_id, // check your API key (id / subject_group_id)
                label: group.sub_group_name, // check API key
            })),
        [subjectGroups]
    );

    const optionalSubjectOptions = useMemo(
        () =>
            optionalSubjects.map((subject) => ({
                value: subject.sm_id, // check your API key
                label: subject.name,
            })),
        [optionalSubjects]
    );
    const handleSubjectGroupSelect = (selectedOption) => {
        setSubjectGroup(selectedOption);
        setSubjectGroupError(""); // remove error when selected
    };

    const handleOptionalSubjectSelect = (selectedOption) => {
        setOptionalSubject(selectedOption);
        // setOptionalSubjectError(""); // remove error when selected
    };


    // Handle search and fetch parent information
    const handleSearch = async () => {
        let isValid = true;

        if (!selectedClassId) {
            setClassError("Please select class.");
            isValid = false;
        }

        if (!subjectGroup) {
            setSubjectGroupError("Please select subject group");
            isValid = false;
        }

        // if (!optionalSubject) {
        //     setOptionalSubjectError("Please select optional subject");
        //     isValid = false;
        // }

        if (!isValid) return;

        try {
            setLoadingForSearch(true);
            setTimetable([]);
            const token = localStorage.getItem("authToken");

            const response = await axios.get(
                `${API_URL}/api/get_subjectshscsubjectgroupwisereport`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    params: {
                        class_id: selectedClassId,
                        subject_group_id: subjectGroup?.value,
                        optional_subject_id: optionalSubject?.value,
                    },
                }
            );

            if (!response?.data?.data?.length) {
                toast.error("Data not found.");
                setTimetable([]);
            } else {
                setTimetable(response.data.data);
                setPageCount(Math.ceil(response.data.data.length / pageSize));
            }
        } catch (error) {
            toast.error("Error fetching report.");
        } finally {
            setLoadingForSearch(false);
        }
    };


    const capitalize = (str) =>
        str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

    const handlePrint = () => {
        const printTitle = `${buildReportFileName()}`;
        const printContent = `
    <div id="tableMain">
      <h5>${printTitle}</h5>
      <div id="tableContainer">
        <table>
          <thead>
            <tr>
             <th>Sr No.</th>
<th>Roll No.</th>
<th>Name</th>
<th>Subject Group</th>
<th>Optional Subject</th>

            </tr>
          </thead>
          <tbody>
            ${displayedSections
                .map(
                    (subject, index) => `
                <tr>
                  <td>${index + 1}</td>
                 <td>${subject?.roll_no || "-"}</td>

<td>
${[subject?.first_name, subject?.mid_name, subject?.last_name]
                            .filter(Boolean)
                            .join(" ")}
</td>

<td>
${subject?.subjects?.map(s => s.subject_name).join(", ") || "-"}
</td>

<td>
${subject?.optional_subjects?.map(s => s.subject_name).join(", ") || "-"}
</td>

                </tr>`
                )
                .join("")}
          </tbody>
        </table>
      </div>
    </div>`;

        const printWindow = window.open("", "_blank", "width=1000,height=800");

        printWindow.document.write(`
    <html>
      <head>
        <title>${printTitle}</title>
        <style>
                @page { margin: 0; }
        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
  
        /* Increase width */
        #tableMain {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
  
        h5 {
          width: 100%;
          text-align: center;
          font-size: 1.5em;
          font-weight: bold;
          margin-bottom: 10px;
        }
  
        #tableContainer {
          width: 100%;
          display: flex;
          justify-content: center;
        }
  
        table {
          width: 80%; /* Increase table width */
          border-spacing: 0;
           margin: auto;
        }
  
        th, td {
          border: 1px solid gray;
          padding: 12px;
          text-align: center;
          font-size: 16px; /* Increase font size */
        }
  
        th {
          background-color: #f9f9f9;
          font-size: 1.1em;
        }
        </style>
      </head>
         <body>
        <div id="printContainer">
            ${printContent}
        </div>
    </body>
    </html>
  `);

        printWindow.document.close();

        // ✅ Ensure content is fully loaded before printing
        printWindow.onload = function () {
            printWindow.focus();
            printWindow.print();
            printWindow.close(); // Optional: close after printing
        };
    };

    const handleDownloadEXL = () => {
        if (!displayedSections || displayedSections.length === 0) {
            toast.error("No data available to download the Excel sheet.");
            return;
        }

        // Define headers matching the print table
        const headers = [
            "Sr No.",
            "Roll No.",
            "Name",
            "Subject Group",
            "Optional Subject"
        ]
            ;
        // Convert displayedSections data to array format for Excel
        const data = displayedSections.map((student, index) => [
            index + 1,
            student?.roll_no || "-",
            `${student?.first_name || ""} ${student?.mid_name || ""} ${student?.last_name || ""}`,
            student?.subjects?.map(sub => sub.subject_name).join(", ") || "-",
            student?.optional_subjects?.map(sub => sub.subject_name).join(", ") || "-",
        ]);

        // Create a worksheet
        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

        // Auto-adjust column width
        const columnWidths = headers.map(() => ({ wch: 20 })); // Approx. width of 20 characters per column
        worksheet["!cols"] = columnWidths;

        // Create a workbook and append the worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Admission Form Data");

        // Generate and download the Excel file

        const fileName = `${buildReportFileName()}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };


    const filteredSections = timetable.filter((student) => {
        const searchLower = searchTerm.toLowerCase();

        const rollNo = student?.roll_no ? String(student.roll_no) : "";

        const studentName = [
            student?.first_name,
            student?.mid_name,
            student?.last_name,
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        const subjectGroup =
            student?.subjects
                ?.map(sub => sub.subject_name)
                .join(", ")
                .toLowerCase() || "";

        const optionalSubject =
            student?.optional_subjects
                ?.map(sub => sub.subject_name)
                .join(", ")
                .toLowerCase() || "";

        return (
            rollNo.includes(searchLower) ||
            studentName.includes(searchLower) ||
            subjectGroup.includes(searchLower) ||
            optionalSubject.includes(searchLower)
        );
    });


    const buildReportFileName = () => {
        const parts = [
            "HSC_Subject_Group_Report_",
            selectedClass?.label && `Class: ${selectedClass.label}`,
            subjectGroup?.label && `Subject Group: ${subjectGroup.label}`,
            optionalSubject?.label && `Optional Subject: ${optionalSubject.label}`
        ].filter(Boolean);

        return parts;
    };

    const displayedSections = filteredSections.slice(currentPage * pageSize);
    return (
        <>
            <div className="w-full md:w-[95%] mx-auto mt-4 ">
                <ToastContainer />
                <div className="card  rounded-md ">
                    <div className=" card-header  flex justify-between items-center ">
                        <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
                            HSC Students Subjects Group Report
                        </h5>
                        <RxCross1
                            className=" relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                            onClick={() => {
                                navigate("/dashboard");
                            }}
                        />
                    </div>
                    <div
                        className=" w-[99%]   mb-3 h-1  mx-auto bg-red-700"
                        style={{
                            backgroundColor: "#C03078",
                        }}
                    ></div>

                    <>
                        <div className=" w-full md:w-[98%] flex justify-center flex-col md:flex-row gap-x-1     ml-0    p-2">
                            <div className="w-full md:w-full flex md:flex-row justify-between items-center mt-0 md:mt-2">
                                <div className="w-full  md:w-full gap-x-0  md:gap-x-12 flex flex-col gap-y-2 md:gap-y-0 md:flex-row">
                                    {/* Class Dropdown */}
                                    <div className="w-full md:w-[80%] gap-x-2 justify-around my-1 md:my-4 flex md:flex-row">
                                        <label
                                            className="w-full md:w-[25%] text-md pl-0 md:pl-5 mt-1.5"
                                            htmlFor="classSelect"
                                        >
                                            Class <span className="text-sm text-red-500">*</span>
                                        </label>
                                        <div className="w-full md:w-[65%]">
                                            <Select
                                                menuPortalTarget={document.body}
                                                menuPosition="fixed"
                                                id="classSelect"
                                                value={selectedClass}
                                                onChange={handleClassSelect}
                                                options={classOptions}
                                                placeholder={loading ? "Loading..." : "Select"}
                                                isSearchable
                                                isClearable
                                                className="text-sm"
                                                isDisabled={loading}
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
                                            {classError && (
                                                <div className="h-8 relative ml-1 text-danger text-xs">
                                                    {classError}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Subject Group Dropdown */}
                                    <div className="w-full md:w-full gap-x-2 justify-around my-1 md:my-4 flex md:flex-row">
                                        <label
                                            className="w-full md:w-[50%] text-md pl-0 md:pl-5 mt-1.5"
                                        >
                                            Subject Group <span className="text-sm text-red-500">*</span>
                                        </label>
                                        <div className="w-full md:w-[70%]">
                                            <Select
                                                menuPortalTarget={document.body}
                                                menuPosition="fixed"
                                                value={subjectGroup}
                                                onChange={handleSubjectGroupSelect}
                                                options={subjectGroupOptions}
                                                placeholder="Select"
                                                isSearchable
                                                isClearable
                                                className="text-sm"
                                                styles={{
                                                    control: (provided) => ({
                                                        ...provided,
                                                        fontSize: ".9em",
                                                        minHeight: "30px",
                                                    }),
                                                    menu: (provided) => ({
                                                        ...provided,
                                                        fontSize: "1em",
                                                    }),
                                                    option: (provided) => ({
                                                        ...provided,
                                                        fontSize: ".9em",
                                                    }),
                                                }}
                                            />
                                            {subjectGroupError && (
                                                <div className="text-red-500 text-xs mt-1">
                                                    {subjectGroupError}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {/* Optional Subject Dropdown */}
                                    <div className="w-full md:w-full gap-x-2 justify-around my-1 md:my-4 flex md:flex-row">
                                        <label
                                            className="w-full md:w-[60%] text-md pl-0 md:pl-5 mt-1.5"
                                        >
                                            Optional Subject
                                        </label>
                                        <div className="w-full md:w-[70%]">
                                            <Select
                                                menuPortalTarget={document.body}
                                                menuPosition="fixed"
                                                value={optionalSubject}
                                                onChange={handleOptionalSubjectSelect}
                                                options={optionalSubjectOptions}
                                                placeholder="Select"
                                                isSearchable
                                                isClearable
                                                className="text-sm"
                                                styles={{
                                                    control: (provided) => ({
                                                        ...provided,
                                                        fontSize: ".9em",
                                                        minHeight: "30px",
                                                    }),
                                                    menu: (provided) => ({
                                                        ...provided,
                                                        fontSize: "1em",
                                                    }),
                                                    option: (provided) => ({
                                                        ...provided,
                                                        fontSize: ".9em",
                                                    }),
                                                }}
                                            />
                                            {/* {optionalSubjectError && (
                                                <div className="text-red-500 text-xs mt-1">
                                                    {optionalSubjectError}
                                                </div>
                                            )} */}
                                        </div>
                                    </div>

                                    {/* Browse Button */}
                                    <div className="mt-1">
                                        <button
                                            type="search"
                                            onClick={handleSearch}
                                            style={{ backgroundColor: "#2196F3" }}
                                            className={`btn h-10 w-18 md:w-auto btn-primary text-white font-bold py-1 border-1 border-blue-500 px-4 rounded ${loadingForSearch ? "opacity-50 cursor-not-allowed" : ""
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
                                                    Searching...
                                                </span>
                                            ) : (
                                                "Search"
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {timetable.length > 0 && (
                            <>
                                <div className="w-full md:w-[98%] mx-auto mt-2 ">
                                    <div className="card mx-auto lg:w-full shadow-lg">
                                        <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                                            <div className="w-full flex flex-row justify-between mr-0 md:mr-4 ">
                                                <h3 className="text-gray-700 text-lg font-semibold">
                                                    Total Students:
                                                    <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-bold">
                                                        {filteredSections.length}
                                                    </span>
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
                                            <div className="flex flex-col md:flex-row gap-x-1 justify-center md:justify-end">
                                                <button
                                                    type="button"
                                                    onClick={handleDownloadEXL}
                                                    className="relative bg-blue-400 py-1 hover:bg-blue-500 text-white px-3 rounded group"
                                                >
                                                    <FaFileExcel />

                                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex items-center justify-center bg-gray-600  text-white text-[.7em] rounded-md py-1 px-2">
                                                        Exports to excel
                                                    </div>
                                                </button>

                                                <button
                                                    onClick={handlePrint}
                                                    className="relative flex flex-row justify-center align-middle items-center gap-x-1 bg-blue-400 hover:bg-blue-500 text-white px-3 rounded group"
                                                >
                                                    <FiPrinter />
                                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex items-center justify-center bg-gray-600  text-white text-[.7em] rounded-md py-1 px-2">
                                                        Print{" "}
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                        <div
                                            className=" relative w-[97%]    h-1  mx-auto bg-red-700"
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
                                                <table className="min-w-full leading-normal table-auto">
                                                    <thead>
                                                        <tr className="bg-gray-100">
                                                            {[
                                                                "Sr No.",
                                                                "Roll No.",
                                                                "Name",
                                                                "Subject Group",
                                                                "Optional Subject"
                                                            ]
                                                                .map((header, index) => (
                                                                    <th
                                                                        key={index}
                                                                        className=" sticky top-0 px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider bg-gray-200"
                                                                        style={{ zIndex: 5, }}>
                                                                        {header}
                                                                    </th>
                                                                ))}
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        {displayedSections.length ? (
                                                            displayedSections.map((student, index) => (
                                                                <tr key={student.student_id} className="border border-gray-300">
                                                                    <td className="px-2 py-2 text-center border border-gray-300">{index + 1}</td>

                                                                    <td className="px-2 py-2 text-center border border-gray-300">
                                                                        {student?.roll_no || "-"}
                                                                    </td>

                                                                    <td className="px-2 py-2 text-center border border-gray-300">
                                                                        {[student.first_name, student.mid_name, student.last_name]
                                                                            .filter(Boolean)
                                                                            .map(word =>
                                                                                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                                                                            )
                                                                            .join(" ")}
                                                                    </td>

                                                                    {/* Subject Group */}
                                                                    <td className="px-2 py-2 text-center border border-gray-300">
                                                                        {student?.subjects
                                                                            ?.map(sub => sub.subject_name)
                                                                            .join(", ") || "-"}
                                                                    </td>

                                                                    {/* Optional Subject */}
                                                                    <td className="px-2 py-2 text-center border border-gray-300">
                                                                        {student?.optional_subjects
                                                                            ?.map(sub => sub.subject_name)
                                                                            .join(", ") || "-"}
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="5" className="text-center text-red-600 py-5">
                                                                    Oops! No data found..
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>

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

export default HSCSStudentSubjectGroupReport;
