import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLocation, useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { FiSearch } from "react-icons/fi";
import ReactPaginate from "react-paginate";

const CompleteStudentListForAdmission = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [formId, setFormId] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingForSearch, setLoadingForSearch] = useState(false);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [pendingFormId, setPendingFormId] = useState(null);
  const [isApprovedMessage, setIsApprovedMessage] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const [loadingExams, setLoadingExams] = useState(false);
  const [studentError, setStudentError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [timetable, setTimetable] = useState([]);

  const pageSize = 20;
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const [shortName, setShortName] = useState("");
  const [showStudentReport, setShowStudentReport] = useState(false);

  const classIdFromState = location.state?.class_id;
  console.log(
    "class id from navigate view addmisision form ",
    classIdFromState,
  );

  const [isFromNavigation, setIsFromNavigation] = useState(false);

  useEffect(() => {
    if (classIdFromState) {
      setIsFromNavigation(true);
      setSelectedStudentId(classIdFromState);
    }
  }, [classIdFromState]);

  useEffect(() => {
    fetchExams();
    // handleSearch();
    fetchsessionData();
  }, []);

  const fetchsessionData = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.error("No authentication token found");
      return;
    }

    try {
      const sessionResponse = await axios.get(`${API_URL}/api/sessionData`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const shortname = sessionResponse?.data?.custom_claims?.short_name;
      setShortName(shortname);

      console.log("short name:", shortname);

      return { shortName };
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchExams = async () => {
    try {
      setLoadingExams(true);
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/admin/admission-classes`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      // console.log("Class", response);
      setStudentNameWithClassId(response?.data?.data || []);
    } catch (error) {
      toast.error("Error fetching Classes");
      console.error("Error fetching Classes:", error);
    } finally {
      setLoadingExams(false);
    }
  };

  const handleStudentSelect = (selectedOption) => {
    setStudentError("");
    setSelectedStudent(selectedOption);
    console.log("selected class", selectedOption);
    setSelectedStudentId(selectedOption?.value);
  };

  const studentOptions = useMemo(
    () =>
      studentNameWithClassId.map((cls) => ({
        value: cls?.class_id,
        label: `${cls.class_name}`,
      })),
    [studentNameWithClassId],
  );

  // useEffect(() => {
  //   if (!classIdFromState || studentOptions.length === 0) return;

  //   const matchedClass = studentOptions.find(
  //     (opt) => opt.value === classIdFromState,
  //   );

  //   if (matchedClass) {
  //     setSelectedStudent(matchedClass);
  //     console.log("matched class from navigation:", matchedClass);
  //     setSelectedStudentId(matchedClass.value);
  //     setIsFromNavigation(true);
  //   }
  // }, [classIdFromState, studentOptions]);

  useEffect(() => {
    if (!classIdFromState || studentOptions.length === 0) return;

    const matchedClass = studentOptions.find(
      (opt) => String(opt.value) === String(classIdFromState),
    );

    if (matchedClass) {
      setSelectedStudent(matchedClass);
      setSelectedStudentId(matchedClass.value);
      setIsFromNavigation(true);
      console.log("matched class from navigation:", matchedClass);
    } else {
      console.log("No matched class found");
    }
  }, [classIdFromState, studentOptions]);

  // useEffect(() => {
  //   if (isFromNavigation && selectedStudentId) {
  //     handleSearch(selectedStudentId);
  //   }
  // }, [isFromNavigation, selectedStudentId]);

  useEffect(() => {
    if (isFromNavigation && selectedStudentId) {
      handleSearch();
      setIsFromNavigation(false);
    }
  }, [isFromNavigation]);

  const handleSearch = async () => {
    // if (!selectedStudentId) {
    //   setStudentError("Please select class.");
    //   return;
    // }
    const finalClassId = selectedStudentId || classIdFromState;

    if (!finalClassId) {
      setStudentError("Please select class.");
      return;
    }

    setLoadingForSearch(true);
    setLoading(true);
    setTimetable([]);

    const token = localStorage.getItem("authToken");

    const selectedClassId = finalClassId;
    const enteredFormId = formId;

    setSearchTerm("");
    // setFormId("");
    setShowSearch(false);

    try {
      const params = {
        class_id: selectedClassId,
      };

      if (enteredFormId) {
        params.form_id = enteredFormId;
      }

      const response = await axios.get(
        `${API_URL}/api/admin/applications/payments/successful`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        },
      );

      if (!response?.data?.data?.length) {
        toast.error("Admission forms data not found.");
        setTimetable([]);
      } else {
        // setTimetable(response.data.data);
        const uniqueData = Array.from(
          new Map(
            response.data.data.map((item) => [item.adm_form_pk, item]),
          ).values(),
        );

        setTimetable(uniqueData);
        // setPageCount(Math.ceil(response.data.data.length / pageSize));
        setShowStudentReport(true);
      }
    } catch (error) {
      console.error("Error fetching Admission forms:", error);
      toast.error("Error fetching Admission forms. Please try again.");
    } finally {
      setLoadingForSearch(false);
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  // const handleStatus = (student, newStatus) => {
  //   setPendingFormId(student.form_id);
  //   setPendingStatus(newStatus);
  //   setShowStatusModal(true);
  // };
  // const handleStatus = (student, newStatus) => {
  //   setPendingFormId(student.form_id);
  //   setPendingStatus(newStatus);

  //   if (student.admission_form_status === "Approved") {
  //     setIsApprovedMessage(true);
  //   } else {
  //     setIsApprovedMessage(false);
  //   }

  //   setShowStatusModal(true);
  // };

  const handleStatus = (student, newStatus) => {
    setPendingFormId(student.form_id);
    setPendingStatus(newStatus);

    // Show warning ONLY for Approved ➜ Applied
    if (
      student.admission_form_status === "Approved" &&
      newStatus === "Applied"
    ) {
      setIsApprovedMessage(true);
    } else {
      setIsApprovedMessage(false);
    }

    setShowStatusModal(true);
  };

  const handleStatusChange = async (formId, newStatus) => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      toast.error("Authentication token missing");
      return;
    }

    try {
      // Optimistic UI update (optional but recommended)
      setTimetable((prev) =>
        prev.map((item) =>
          item.form_id === formId ? { ...item, status: newStatus } : item,
        ),
      );

      await axios.patch(
        `${API_URL}/api/admin/applications/${formId}/status`,
        {
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Status updated successfully");
      handleSearch();
    } catch (error) {
      console.error("Status update failed:", error);
      toast.error("Failed to update status");

      handleSearch();
    }
  };

  const statusOptions = [
    { value: "Applied", label: "Applied" },
    { value: "Hold", label: "Hold" },
    { value: "Rejected", label: "Rejected" },

    // { value: "Scheduled", label: "Scheduled" },
    // { value: "Verified", label: "Verified" },
    // { value: "Approved", label: "Approved" },
  ];

  const handleView = (student) => {
    console.log("HandleView -->", student);

    navigate(
      `/viewAdmissionForm/${student.form_id}?class_id=${selectedStudentId}`,
      {
        state: { from: "listofAdmissionSuccessfulPayment" },
      },
    );
  };

  const camelCase = (str) =>
    str
      ?.toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        })
      : "";

  // const filteredSections = timetable.filter((section) => {
  //   const searchLower = searchTerm.toLowerCase();
  //   const formId = section?.form_id?.toLowerCase() || "";
  //   const studentName =
  //     `${section?.first_name} ${section?.mid_name} ${section?.last_name}`
  //       .toLowerCase()
  //       .trim() || "";

  //   const applicationDate = section?.application_date?.toLowerCase() || "";
  //   const fatherName = section?.father_name?.toLowerCase() || "";
  //   const fatherMobile = section?.f_mobile?.toLowerCase() || "";
  //   const fatherEmail = section?.f_email?.toLowerCase() || "";
  //   const admissionStatus = section?.admission_form_status?.toLowerCase() || "";
  //   const className = section?.class_name?.toLowerCase() || "";

  //   return (
  //     formId.includes(searchLower) ||
  //     studentName.includes(searchLower) ||
  //     applicationDate.includes(searchLower) ||
  //     fatherName.includes(searchLower) ||
  //     fatherMobile.includes(searchLower) ||
  //     fatherEmail.includes(searchLower) ||
  //     admissionStatus.includes(searchLower) ||
  //     className.includes(searchLower)
  //   );
  // });

  const filteredSections = useMemo(() => {
    if (!searchTerm.trim()) return timetable;

    const searchLower = searchTerm.toLowerCase();

    return timetable.filter((section) => {
      const formId = String(section?.form_id || "").toLowerCase();

      const studentName =
        `${section?.first_name || ""} ${section?.mid_name || ""} ${section?.last_name || ""}`
          .toLowerCase()
          .trim();

      const applicationDate = String(
        section?.application_date || "",
      ).toLowerCase();
      const fatherName = String(section?.father_name || "").toLowerCase();
      const fatherMobile = String(section?.f_mobile || "").toLowerCase();
      const fatherEmail = String(section?.f_email || "").toLowerCase();
      const admissionStatus = String(
        section?.admission_form_status || "",
      ).toLowerCase();
      const className = String(section?.class_name || "").toLowerCase();

      return (
        formId.includes(searchLower) ||
        studentName.includes(searchLower) ||
        applicationDate.includes(searchLower) ||
        fatherName.includes(searchLower) ||
        fatherMobile.includes(searchLower) ||
        fatherEmail.includes(searchLower) ||
        admissionStatus.includes(searchLower) ||
        className.includes(searchLower)
      );
    });
  }, [timetable, searchTerm]);

  useEffect(() => {
    setPageCount(Math.ceil(filteredSections.length / pageSize));
  }, [filteredSections, pageSize]);

  const displayedSections = filteredSections.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize,
  );

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, timetable]);

  // const displayedSections = filteredSections.slice(currentPage * pageSize);

  return (
    <>
      <div
        className={` transition-all duration-500 w-[80%]  mx-auto p-4 ${
          showStudentReport ? "w-full " : "w-[80%] "
        }`}
      >
        <ToastContainer />
        <div className="card rounded-md ">
          {!showStudentReport && (
            <>
              <div className=" card-header mb-4 flex justify-between items-center ">
                <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
                  Complete List of Students for Admission
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
              <div className=" w-full md:w-[85%]   flex justify-center flex-col md:flex-row gap-x-1     ml-0    p-2">
                <div className="w-full md:w-[99%] flex md:flex-row justify-between items-center mt-0 md:mt-4">
                  <div className="w-full md:w-[100%] gap-x-0 md:gap-x-12  flex flex-col gap-y-2 md:gap-y-0 md:flex-row">
                    <div className="w-full md:w-[50%] gap-x-2   justify-around  my-1 md:my-4 flex md:flex-row ">
                      <label
                        className="md:w-[25%] text-md pl-0 md:pl-5 mt-1.5"
                        htmlFor="studentSelect"
                      >
                        Class <span className="text-red-500">*</span>
                      </label>
                      <div className=" w-full md:w-[65%]">
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
                        />
                        {studentError && (
                          <div className="h-8 relative ml-1 text-danger text-xs">
                            {studentError}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="w-full md:w-[45%]  gap-x-4  justify-between  my-1 md:my-4 flex md:flex-row">
                      <label
                        className=" ml-0 md:ml-4 w-full md:w-[30%]  text-md mt-1.5 "
                        htmlFor="studentSelect"
                      >
                        Form Id
                      </label>{" "}
                      <div className="w-full md:w-[65%]">
                        <input
                          type="text"
                          id="formId"
                          className=" w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm "
                          onChange={(e) => setFormId(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="mt-1">
                      <button
                        type="search"
                        onClick={handleSearch}
                        style={{ backgroundColor: "#2196F3" }}
                        className={` btn h-10 w-18 md:w-auto btn-primary text-white font-bold py-1 border-1 border-blue-500 px-4 rounded ${
                          loadingForSearch
                            ? "opacity-50 cursor-not-allowed"
                            : ""
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
                  </div>{" "}
                </div>
              </div>
            </>
          )}

          <>
            {showStudentReport && (
              <>
                <div className="w-full  mx-auto transition-all duration-300">
                  <div className="card mx-auto shadow-lg">
                    <div className="p-2 px-3 bg-gray-100 flex flex-col lg:flex-row gap-3 justify-between">
                      {/* LEFT SECTION */}
                      <div className="w-full flex flex-col lg:flex-row gap-3 items-start lg:items-center">
                        <h3 className="text-gray-700 text-[1.1em] lg:text-xl whitespace-normal lg:whitespace-nowrap">
                          Complete List of Students for Admission
                        </h3>

                        {/* FILTER CONTAINER */}
                        <div className="w-full overflow-x-auto">
                          <div className="bg-blue-50 border-l-2 border-r-2 border-pink-500 rounded-md shadow-md px-4 py-2">
                            <div className="flex flex-col sm:flex-row flex-wrap gap-4 text-blue-800 font-medium">
                              {/* Class */}
                              <div className="flex items-center gap-2">
                                <label className="whitespace-nowrap">
                                  Class <span className="text-red-500">*</span>
                                </label>

                                <Select
                                  menuPortalTarget={document.body}
                                  menuPosition="fixed"
                                  value={selectedStudent}
                                  onChange={handleStudentSelect}
                                  options={studentOptions}
                                  isSearchable
                                  isDisabled={loadingExams}
                                  placeholder={
                                    loadingExams ? "Loading..." : "Select"
                                  }
                                  className="min-w-[160px]"
                                />
                              </div>

                              {/* Form ID */}
                              <div className="flex items-center gap-2">
                                <label className="whitespace-nowrap">
                                  Form Id
                                </label>
                                <input
                                  type="text"
                                  className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md w-full sm:w-[160px]"
                                  onChange={(e) => setFormId(e.target.value)}
                                />
                              </div>

                              {/* Browse */}
                              <button
                                onClick={handleSearch}
                                disabled={loadingForSearch}
                                className={`h-8 px-4 rounded text-white font-bold ${
                                  loadingForSearch
                                    ? "bg-blue-300 cursor-not-allowed"
                                    : "bg-blue-500 hover:bg-blue-600"
                                }`}
                              >
                                {loadingForSearch ? "Browsing..." : "Browse"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* RIGHT ICONS */}
                      <div className="flex flex-row gap-3 items-center justify-end">
                        {/* Search */}
                        <div className="relative group">
                          <button
                            onClick={() => setShowSearch((prev) => !prev)}
                            className="text-black hover:text-pink-500"
                          >
                            <FiSearch size={20} />
                          </button>

                          <span className="absolute top-full mt-1 right-0 hidden group-hover:block bg-blue-500 text-white text-xs px-2 py-1 rounded shadow">
                            Search
                          </span>
                        </div>

                        {/* Close */}
                        <RxCross1
                          size={20}
                          className="text-red-600 cursor-pointer hover:bg-red-100 rounded"
                          onClick={() => setShowStudentReport(false)}
                        />
                      </div>
                    </div>

                    <div
                      className=" w-[97%] h-1 mx-auto"
                      style={{ backgroundColor: "#C03078" }}
                    ></div>

                    <>
                      <div className="w-full p-3">
                        <div className="card mx-auto lg:w-full shadow-lg">
                          {showSearch && (
                            <div className="p-2 px-3 bg-gray-100 border-none">
                              <div className="w-full flex justify-end mr-0 md:mr-4">
                                <div className="w-1/2 md:w-[18%] mr-1">
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search"
                                    value={searchTerm}
                                    onChange={(e) =>
                                      setSearchTerm(e.target.value)
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="card-body">
                            <div
                              className="relative h-96 overflow-auto"
                              style={{
                                scrollbarWidth: "thin",
                                scrollbarColor: "#C03178 transparent",
                              }}
                            >
                              <table className="min-w-full leading-normal table-auto">
                                <thead>
                                  <tr className="bg-gray-100">
                                    <th className="text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold whitespace-nowrap">
                                      Sr <br /> No.
                                    </th>

                                    <th className=" text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold whitespace-nowrap">
                                      Form Id.
                                    </th>

                                    <th className="text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold whitespace-nowrap">
                                      Student Name
                                    </th>

                                    <th className=" text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold whitespace-nowrap">
                                      Parent Name
                                    </th>

                                    <th className="text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold whitespace-nowrap">
                                      Phone No.
                                    </th>

                                    <th className=" text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold whitespace-nowrap">
                                      Email Id
                                    </th>

                                    <th className=" text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold whitespace-nowrap">
                                      Application Date <br />
                                      (DD-MM-YY)
                                    </th>

                                    <th className=" text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold whitespace-nowrap">
                                      Actual Status
                                    </th>

                                    <th className=" text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold whitespace-nowrap">
                                      Change Status
                                    </th>

                                    <th className=" text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold whitespace-nowrap">
                                      View
                                    </th>
                                  </tr>
                                </thead>

                                <tbody>
                                  {loading ? (
                                    <div className="absolute inset-0 flex items-center justify-center  z-10">
                                      <div className="text-xl text-blue-700">
                                        Please wait while data is loading...
                                      </div>
                                    </div>
                                  ) : displayedSections.length ? (
                                    displayedSections?.map((student, index) => (
                                      <tr
                                        key={student.adm_form_pk}
                                        className="border border-gray-300"
                                      >
                                        <td className="px-2 py-2 text-center border border-gray-300">
                                          {/* {index + 1} */}
                                          {currentPage * pageSize + index + 1}
                                        </td>
                                        <td className="px-2 py-2 text-center border border-gray-300 whitespace-nowrap">
                                          {student.form_id}
                                        </td>
                                        <td className="px-2 py-2 text-center border border-gray-300 whitespace-nowrap">
                                          {camelCase(
                                            `${student.first_name} ${student.mid_name} ${student.last_name}`,
                                          )}
                                        </td>

                                        <td className="px-2 py-2 text-center border border-gray-300 whitespace-nowrap">
                                          {camelCase(student.father_name)}
                                        </td>

                                        <td className="px-2 py-2 text-center border border-gray-300">
                                          {student.f_mobile}
                                        </td>
                                        <td className="px-2 py-2 text-center border border-gray-300">
                                          {student.f_email}
                                        </td>
                                        <td className="px-2 py-2 text-center border border-gray-300">
                                          {formatDate(student.application_date)}
                                        </td>
                                        <td className="px-2 py-2 text-center border border-gray-300">
                                          {student.admission_form_status}
                                        </td>
                                        <td className="px-2 py-2 text-center border border-gray-300">
                                          <Select
                                            options={statusOptions}
                                            value={statusOptions.find(
                                              (opt) =>
                                                opt.value === student.status,
                                            )}
                                            onChange={(selected) =>
                                              handleStatus(
                                                student,
                                                selected.value,
                                              )
                                            }
                                            isSearchable={false}
                                            className="text-sm"
                                            classNamePrefix="react-select"
                                            menuPortalTarget={document.body}
                                            menuPosition="fixed"
                                            styles={{
                                              container: (base) => ({
                                                ...base,
                                                minWidth: 140,
                                              }),
                                              control: (base) => ({
                                                ...base,
                                                minHeight: "32px",
                                                height: "32px",
                                                borderRadius: "6px",
                                              }),
                                            }}
                                          />
                                        </td>

                                        <td className="px-2 py-2 text-center border border-gray-300">
                                          <button
                                            onClick={() => handleView(student)}
                                            className="text-blue-600 hover:text-blue-800 hover:bg-transparent "
                                          >
                                            <MdOutlineRemoveRedEye className="font-bold text-xl" />
                                          </button>
                                        </td>
                                      </tr>
                                    ))
                                  ) : (
                                    <div className="absolute inset-0 flex items-center justify-center z-10">
                                      <div className="text-xl text-red-700 text-center">
                                        No data available.
                                      </div>
                                    </div>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                          <div className=" flex justify-center  pt-2 -mb-3">
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
                      </div>
                    </>

                    <div className="flex justify-end gap-4 pr-3 mb-4 mr-10">
                      <button
                        onClick={() => setShowStudentReport(false)}
                        className="bg-yellow-300 hover:bg-yellow-400 text-white font-semibold px-4 py-2 rounded"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
            {showStatusModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="modal show" style={{ display: "block" }}>
                  <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                      {/* Header */}
                      <div className="flex justify-between p-2">
                        <h5 className="modal-title">Change Status</h5>

                        <RxCross1
                          className="mt-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                          onClick={() => setShowStatusModal(false)}
                        />
                      </div>

                      {/* Divider */}
                      <div
                        className=" h-1 w-[97%] mx-auto"
                        style={{ backgroundColor: "#C03078" }}
                      />

                      {/* Body */}
                      {/* <div className="modal-body">
                        <p>
                          Are you sure you want to change the status to
                          <strong className="mx-1">{pendingStatus}</strong>
                          ?
                        </p>
                      </div> */}
                      <div className="modal-body">
                        {isApprovedMessage ? (
                          <p className="text-red-600 font-semibold">
                            This student is already in System delete first.
                          </p>
                        ) : (
                          <p>Are you sure you want to change the status</p>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex justify-end gap-2 p-3">
                        <button
                          className="btn btn-secondary"
                          onClick={() => setShowStatusModal(false)}
                        >
                          Cancel
                        </button>

                        <button
                          className="btn btn-primary"
                          onClick={() => {
                            handleStatusChange(pendingFormId, pendingStatus);
                            setShowStatusModal(false);
                          }}
                        >
                          OK
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        </div>
      </div>
    </>
  );
};

export default CompleteStudentListForAdmission;
