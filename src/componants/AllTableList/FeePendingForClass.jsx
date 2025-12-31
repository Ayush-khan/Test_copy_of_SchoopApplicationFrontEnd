import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
// import Loader from "../common/LoaderFinal/LoaderStyle";
import { FiPrinter } from "react-icons/fi";
import { FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";

const FeePendingForClass = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [fromDate, setFromDate] = useState(null);
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
  const [leaveData, setLeaveData] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [teacher, setTeacher] = useState([]);

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [classError, setClassError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(null);

  const [roleId, setRoleId] = useState("");
  const [regId, setRegId] = useState("");
  const [classes, setClasses] = useState([]);
  const [selectedClassName, setSelectedClassName] = useState("");

  useEffect(() => {
    // fetchExams();
    fetchLeaveType();
  }, []);

  useEffect(() => {
    fetchDataRoleId();
  }, []);

  const fetchDataRoleId = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.error("No authentication token found");
      return;
    }

    try {
      const sessionResponse = await axios.get(`${API_URL}/api/sessionData`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const role_id = sessionResponse.data.user.role_id;
      const reg_id = sessionResponse.data.user.reg_id;

      setRoleId(role_id);
      setRegId(reg_id);

      console.log("roleIDis:", role_id); // use local variable
      console.log("reg id:", reg_id);

      return { roleId, regId };
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (!roleId || !regId) return;
    fetchExams(roleId, regId);
  }, [roleId, regId]);

  // const fetchExams = async () => {
  //   try {
  //     setLoadingExams(true);
  //     const token = localStorage.getItem("authToken");

  //     const response = await axios.get(`${API_URL}/api/get_allstaff`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     console.log("Class", response);
  //     setStudentNameWithClassId(response?.data?.data || []);
  //   } catch (error) {
  //     toast.error("Error fetching Classes");
  //     console.error("Error fetching Classes:", error);
  //   } finally {
  //     setLoadingExams(false);
  //   }
  // };

  const fetchExams = async (roleId, roleIdValue) => {
    try {
      setLoadingExams(true);

      const token = localStorage.getItem("authToken");

      const classApiUrl =
        roleId === "T"
          ? `${API_URL}/api/get_classes_of_classteacher?teacher_id=${roleIdValue}`
          : `${API_URL}/api/getallClassWithStudentCount`;

      //  get_teacherclasseswithclassteacher

      const [classResponse, studentResponse] = await Promise.all([
        axios.get(classApiUrl, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/getStudentListBySectionData`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const classData =
        roleId === "T"
          ? classResponse.data.data || []
          : classResponse.data || [];

      setClasses(classData);
      setStudentNameWithClassId(studentResponse?.data?.data || []);
    } catch (error) {
      toast.error("Error fetching data.");
    } finally {
      setLoadingExams(false);
    }
  };
  const fetchLeaveType = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      const response = await axios.get(`${API_URL}/api/get_allleavetype`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data.data || [];
      setLeaveData(data);
      console.log("datta", data);
      setPageCount(Math.ceil(data.length / pageSize));
    } catch (error) {
      toast.error(error.message || "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const fetchClass = async (teacherId) => {
    // if (!teacherId) {
    //   toast.error("Please select a teacher first.");
    //   return;
    // }

    try {
      setLoadingExams(true);
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/get_teacherclasstimetable?teacher_id=${teacherId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Teacher Timetable:", response?.data);

      const teacherClasses = Array.isArray(response?.data?.data)
        ? response.data.data
        : [];

      setTeacher(teacherClasses);
    } catch (error) {
      toast.error("Error fetching teacher timetable");
      console.error("Error fetching teacher timetable:", error);
    } finally {
      setLoadingExams(false);
    }
  };

  const studentOptions = useMemo(() => {
    return classes.map((cls) => {
      if (roleId === "T") {
        return {
          value: cls.section_id,
          label: `${cls.classname} ${cls.sectionname}`,
          class_id: cls.class_id,
          section_id: cls.section_id,
          classname: cls.classname,
        };
      } else {
        return {
          value: cls.section_id,
          label: `${cls?.get_class?.name} ${cls.name} (${cls.students_count})`,
          class_id: cls.class_id,
          section_id: cls.section_id,
          classname: cls?.get_class?.name,
        };
      }
    });
  }, [classes, roleId]);

  // const studentOptions = useMemo(() => {
  //   return classes.map((cls) => {
  //     if (roleId === "T") {
  //       return {
  //         value: cls.section_id,
  //         label: `${cls.classname} ${cls.sectionname}`,
  //         class_id: cls.class_id,
  //         section_id: cls.section_id,
  //         classname: cls.classname,
  //       };
  //     } else {
  //       return {
  //         value: cls.section_id,
  //         label: `${cls?.get_class?.name} ${cls.name} (${cls.students_count})`,
  //         class_id: cls.class_id,
  //         section_id: cls.section_id,
  //         classname: cls?.get_class?.name,
  //       };
  //     }
  //   });
  // }, [classes, roleId]);

  const statusOptions = [
    { value: "1", label: "Installment 1" },
    { value: "2", label: "Installment 2" },
    { value: "3", label: "Installment 3" },
    { value: "4", label: "CBSE Exam Fee" },
  ];

  const filteredStatusOptions = useMemo(() => {
    if (!selectedClassName) return statusOptions.slice(0, 3); // default first 3 only

    const classNum = parseInt(selectedClassName); // try converting to number
    if (!isNaN(classNum) && classNum > 9) {
      return statusOptions; // show all, including CBSE Exam Fee
    }

    return statusOptions.slice(0, 3); // only first 3 installments
  }, [selectedClassName]);

  const handleStudentSelect = (selectedOption) => {
    setStudentError("");
    setSelectedStudent(selectedOption);
    setSelectedStudentId(selectedOption?.value);

    // Store class name for filtering CBSE option
    setSelectedClassName(selectedOption?.classname || "");

    if (selectedOption?.value) {
      fetchClass(selectedOption.value); // ✅ use value directly
    }
  };

  const camelCase = (str) =>
    str
      ?.toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  // const handleSearch = async () => {
  //   setSearchTerm("");
  //   setStudentError("");
  //   setTimetable([]);
  //   setLeaveTypes([]);
  //   setPageCount(0);
  //   setIsSubmitting(true);
  //   setLoadingForSearch(false);

  //   try {
  //     const token = localStorage.getItem("authToken");
  //     if (!token) {
  //       toast.error("Authentication token missing!");
  //       setLoadingForSearch(false);
  //       setIsSubmitting(false);
  //       return;
  //     }

  //     if (!selectedStudentId) {
  //       setStudentError("Please select Teacher.");
  //       setLoadingForSearch(false);
  //       setIsSubmitting(false);
  //       return;
  //     }

  //     const params = {
  //       class_id: selectedStudentId,
  //     };

  //     if (selectedStudent?.value?.section_id) {
  //       params.section_id = selectedClass.value.section_id;
  //     }

  //     if (selectedStatus?.value) {
  //       params.status = selectedStatus.value;
  //     }

  //     const response = await axios.get(
  //       `${API_URL}/api/get_fee_pending_for_teachers_report`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //         params,
  //       }
  //     );

  //     console.log("Fee Pending for class Response:", response);

  //     const resultData = response?.data?.data || [];
  //     const leaveTypesFromApi = response?.data?.leave_types || [];

  //     if (resultData.length === 0) {
  //       toast.error("Fee Pending for class data not found.");
  //     }

  //     setTimetable(resultData);
  //     setLeaveTypes(leaveTypesFromApi);
  //     setPageCount(Math.ceil(resultData.length / pageSize));
  //   } catch (error) {
  //     console.error("Error fetching Fee Pending for class:", error);
  //     toast.error(
  //       error?.response?.data?.message ||
  //         "Error fetching Fee Pending for class. Please try again."
  //     );
  //   } finally {
  //     setIsSubmitting(false);
  //     setLoadingForSearch(false);
  //   }
  // };

  const handleSearch = async () => {
    setSearchTerm("");
    setStudentError("");
    setTimetable([]);
    setLeaveTypes([]);
    setPageCount(0);
    setIsSubmitting(true);
    setLoadingForSearch(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Authentication token missing!");
        setLoadingForSearch(true);
        setIsSubmitting(false);
        return;
      }

      if (!selectedStudent) {
        setStudentError("Please select a class.");
        setLoadingForSearch(true);
        setIsSubmitting(false);
        return;
      }

      // Extract IDs from selected student option
      const class_id = selectedStudent?.class_id;
      const section_id = selectedStudent?.section_id;
      const installment = selectedStatus?.value; // Installment (status) value

      if (!class_id || !section_id) {
        toast.error("Missing class or section ID.");
        setLoadingForSearch(true);
        setIsSubmitting(false);
        return;
      }

      // ✅ Construct params correctly
      const params = {
        class_id,
        section_id,
      };

      if (installment) {
        params.installment = installment;
      }

      // ✅ API call
      const response = await axios.get(
        `${API_URL}/api/get_fee_pending_for_teachers_report`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params,
        }
      );

      console.log("Fee Pending for Class Response:", response);

      const resultData = response?.data?.data || [];
      const leaveTypesFromApi = response?.data?.leave_types || [];

      if (resultData.length === 0) {
        toast.error("No fee pending data found for the selected class.");
      }

      setTimetable(resultData);
      setLeaveTypes(leaveTypesFromApi);
      setPageCount(Math.ceil(resultData.length / pageSize));
    } catch (error) {
      console.error("Error fetching Fee Pending for class:", error);
      toast.error(
        error?.response?.data?.message ||
        "Error fetching fee pending data. Please try again."
      );
    } finally {
      setIsSubmitting(false);
      setLoadingForSearch(false);
    }
  };

  const handlePrint = () => {
    const printTitle = `Fee Pending for class  ${selectedStudent?.label
        ? `List of ${camelCase(selectedStudent.label)}`
        : ": Complete List of All Teacher "
      }`;
    const printContent = `
    <div id="tableMain" class="flex items-center justify-center min-h-screen bg-white">
         <h5 id="tableHeading5"  class="text-lg font-semibold border-1 border-black">${printTitle}</h5>
    <div id="tableHeading" class="text-center w-3/4">
      <table class="min-w-full leading-normal table-auto border border-black mx-auto mt-2">
        <thead>
          <tr class="bg-gray-100">
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Sr.No</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Roll No.</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Student Name</th>
            
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Phone No.</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Installment No.</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Installment Amount</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Amount Paid</th> 
          </tr>
        </thead>
        <tbody>
          ${displayedSections
        .map(
          (subject, index) => `
              <tr class="text-sm">
                <td class="px-2 text-center py-2 border border-black">${index + 1
            }</td>
                 <td class="px-2 text-center py-2 border border-black">
                ${subject?.roll_no}
                </td>
                 <td class="px-2 text-center py-2 border border-black">
                ${camelCase(subject?.student_name)}
                </td>
               
                 <td class="px-2 text-center py-2 border border-black">${subject?.phone_no
            }</td>
                  <td class="px-2 text-center py-2 border border-black">${subject?.installment
            }</td>
                   <td class="px-2 text-center py-2 border border-black">${subject?.installment_fees
            }</td>
                    <td class="px-2 text-center py-2 border border-black">${subject?.paid_amount
            }</td>
              </tr>`
        )
        .join("")}
        </tbody>
      </table>
    </div>
  </div>`;

    const printWindow = window.open("", "_blank", "width=2000,height=1000");

    printWindow.document.write(`
    <html>
      <head>
        <title>${printTitle}</title>
        <style>
                   @page {
                size: A4 landscape; /* Wider format for better fit */
                margin: 10px;
            }

                      body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

                       /* Scrollable container */
            #printContainer {
                width: 100%;
                overflow-x: auto;  /* Enables horizontal scrolling */
                white-space: nowrap; /* Prevents text wrapping */
            }

                      #tableMain {
                width: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-start;
                padding: 0 10px;
                margin: 10px 10px ;
            }

                       table {
                border-spacing: 0;
                width: 100%;
                min-width: 1200px; /* Ensures table doesn't shrink */
                margin: auto;
                table-layout: fixed; /* Ensures even column spacing */
            }

                      th, td {
                border: 1px solid gray;
                padding: 8px;
                text-align: center;
                font-size: 12px;
                word-wrap: break-word; /* Ensures text breaks properly */
            }

            th {
                font-size: 0.8em;
                background-color: #f9f9f9;
            }


           /* Ensure scrolling is available in print mode */
            @media print {
                #printContainer {
                    overflow-x: auto;
                    display: block;
                    width: 100%;
                    height: auto;
                }
             table {
                    min-width: 100%;
                }
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

    // Ensure content is fully loaded before printing
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
    const headers = [
      "Sr No.",
      "Roll No.",
      "Student Name",
      // "Class",
      "Phone No.",
      "Installment No.",
      "Installment Amount",
      "Paid Fees",
    ];

    const data = displayedSections.map((student, index) => [
      index + 1,
      student?.roll_no,
      `  ${camelCase(student?.student_name)}`,
      // ` ${student?.class_section}`,
      student?.phone_no,
      student?.installment,
      student?.installment_fees,
      student?.paid_amount,
    ]);

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // Auto-adjust column widths
    worksheet["!cols"] = headers.map(() => ({ wch: 20 }));

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Fee Pending for class");

    // Generate file name and trigger download
    const fileName = `Fees_Pending_For_Class_${camelCase(selectedStudent?.label) || "All_Teacher"
      }.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  console.log("row", timetable);

  const filteredSections = timetable.filter((student) => {
    const searchLower = searchTerm.toLowerCase();

    const staffName = `${student?.class_section || ""} ]
    }`.toLowerCase();
    const studentName = student?.student_name?.toLowerCase().trim() || "";
    const phoneNo = student?.phone_no?.toLowerCase().toString().trim() || "";
    const installment = student?.installment?.toString().toLowerCase() || "";
    const installmentAmount = student?.installment_fees?.toLowerCase() || "";
    const paidFees = student?.paid_amount?.toLowerCase() || "";

    return (
      staffName.includes(searchLower) ||
      phoneNo.includes(searchLower) ||
      installment.includes(searchLower) ||
      studentName.includes(searchLower) ||
      installmentAmount.includes(searchLower) ||
      paidFees.includes(searchLower)
    );
  });

  const displayedSections = filteredSections.slice(currentPage * pageSize);
  console.log(displayedSections);

  return (
    <>
      {/* <div className="w-full md:w-[85%] mx-auto p-4 "> */}
      <div
        className={`mx-auto p-4 transition-all duration-700 ease-[cubic-bezier(0.4, 0, 0.2, 1)] transform ${timetable.length > 0
            ? "w-full md:w-[100%] scale-100"
            : "w-full md:w-[100%] scale-[0.98]"
          }`}
      >
        <ToastContainer />
        <div className="card rounded-md ">
          <div className=" card-header mb-4 flex justify-between items-center ">
            <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
              Fee Pending for Class
            </h5>
            <RxCross1
              className=" relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
              onClick={() => {
                navigate("/dashboard");
              }}
            />
          </div>
          <div
            className=" relative w-full md:w-[98%]  -top-6 h-1  mx-auto bg-red-700"
            style={{
              backgroundColor: "#C03078",
            }}
          ></div>

          <>
            {/* <div className=" w-full md:w-[95%]   flex justify-center flex-col md:flex-row gap-x-1     ml-0    p-2"> */}
            <div
              className={`  flex justify-between flex-col md:flex-row gap-x-1 ml-0 p-2  ${timetable.length > 0
                  ? "pb-0 w-full md:w-[99%]"
                  : "pb-4 w-full md:w-[99%]"
                }`}
            >
              <div className="w-full md:w-[80%] flex md:flex-row justify-between items-center mt-0 md:mt-4">
                {/* <div className="w-full  gap-x-0 md:gap-x-12 flex flex-col gap-y-2 md:gap-y-0 md:flex-row"> */}
                <div
                  className={`  w-full gap-x-0 md:gap-x-6  flex flex-col gap-y-2 md:gap-y-0 md:flex-row ${timetable.length > 0
                      ? "w-full md:w-[90%]  wrelative left-0"
                      : " w-full md:w-[70%] relative left-10"
                    }`}
                >
                  {/* Staff Dropdown */}
                  <div className="w-full  md:w-[50%] gap-x-2 justify-around my-1 md:my-4 flex md:flex-row">
                    <label
                      className="w-full md:w-[37%] text-md pl-0 md:pl-5 mt-1.5"
                      htmlFor="studentSelect"
                    >
                      Class <span className="text-sm text-red-500">*</span>
                    </label>
                    <div className="w-full md:w-[70%]">
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

                  {/* Class Dropdown */}
                  {/* <div className="w-full  md:w-[70%] gap-x-2 justify-around my-1 md:my-4 flex md:flex-row">
                    <label
                      className="w-full md:w-[25%] text-md pl-0 md:pl-5 mt-1.5"
                      htmlFor="classSelect"
                    >
                      Class
                    </label>
                    <div className="w-full md:w-[70%]">
                      <Select
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        id="classSelect"
                        value={selectedClass}
                        onChange={handleClassSelect}
                        options={classOptions}
                        placeholder={"Select"}
                        isSearchable
                        isClearable
                        className="text-sm"
                        // isDisabled={loadingExams}
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
                    </div>
                  </div> */}

                  {/* Status */}
                  <div className="w-full  md:w-[50%] gap-x-2 justify-between my-1 md:my-4 flex md:flex-row">
                    <label
                      className="ml-0 md:ml-4 w-full md:w-[20%] text-md mt-1.5"
                      htmlFor="status"
                    >
                      Status
                      {/* <span className="text-sm text-red-500">*</span> */}
                    </label>
                    <div className="w-full md:w-[70%]">
                      <Select
                        options={filteredStatusOptions}
                        value={selectedStatus}
                        onChange={setSelectedStatus}
                        placeholder="Select Status"
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
                          Browsing...
                        </span>
                      ) : (
                        "Browse"
                      )}
                    </button>
                  </div>
                </div>
              </div>
              {timetable.length > 0 && (
                <div className="p-2 px-3 w-[350px] bg-gray-100 border-none flex justify-between items-center">
                  <div className="w-full flex flex-row justify-between mr-0 md:mr-4 ">
                    <div className="w-1/2 md:w-[95%] mr-1 ">
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
                      className="relative bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded group"
                    >
                      <FaFileExcel />
                      <div className="absolute  bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex items-center justify-center bg-gray-700 text-white text-xs text-nowrap rounded-md py-1 px-2">
                        Export to Excel
                      </div>
                    </button>

                    <button
                      onClick={handlePrint}
                      className="relative bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded group flex items-center"
                    >
                      <FiPrinter />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex items-center justify-center bg-gray-700 text-white text-xs rounded-md py-1 px-2">
                        Print
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {timetable.length > 0 && (
              <>
                <div className="w-full px-4 mb-4 mt-4">
                  <div className="card mx-auto lg:w-full shadow-lg">
                    <div className="card-body w-full">
                      <div
                        className="h-96 lg:h-96 overflow-y-scroll overflow-x-scroll"
                        style={{
                          scrollbarWidth: "thin",
                          scrollbarColor: "#C03178 transparent",
                        }}
                      >
                        <table className="min-w-full leading-normal table-auto border-collapse">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider w-[7%]">
                                Sr No.
                              </th>
                              <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider w-[10%]">
                                Roll No.
                              </th>
                              <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider w-[20%]">
                                Student Name
                              </th>
                              {/* <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider w-[10%]">
                                Class
                              </th> */}
                              <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider w-[14%]">
                                Phone No.
                              </th>
                              <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider w-[12%]">
                                Installment No.
                              </th>
                              <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider w-[15%]">
                                Installment Amount
                              </th>
                              <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider w-[13%]">
                                Amount Paid
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {displayedSections.length > 0 ? (
                              displayedSections.map((student, index) => (
                                <tr
                                  key={student?.lesson_plan_id || index}
                                  className="border border-gray-300"
                                >
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {index + 1}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student?.roll_no || "-"}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {camelCase(student?.student_name || "")}
                                  </td>
                                  {/* <td className="px-2 py-2 text-center border border-gray-300">
                                    {student?.class_section || "-"}
                                  </td> */}
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student?.phone_no || "-"}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student?.installment || "-"}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student?.installment_fees || "-"}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student?.paid_amount || "-"}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan="8"
                                  className="text-center py-10 text-xl text-red-700"
                                >
                                  Oops! No data found..
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>

                        <div className="text-center font-semibold px-6 mt-2 text-pink-600">
                          Total Records : {timetable.length}
                        </div>
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

export default FeePendingForClass;
