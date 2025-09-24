import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";

const AllAboutMe = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingForSearch, setLoadingForSearch] = useState(false);

  const navigate = useNavigate();
  const [loadingExams, setLoadingExams] = useState(false);
  const [studentError, setStudentError] = useState("");
  const [termError, setTermError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [termsOptions, setTermsOptions] = useState([]);
  const [selectedTerms, setSelectedTerms] = useState(null);
  const [loadingTermsData, setLoadingTermsData] = useState(false);
  const [publishErrors, setPublishErrors] = useState({});
  const [browsedRecords, setBrowsedRecords] = useState([]);

  const [timetable, setTimetable] = useState([]);

  const pageSize = 10;
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [academic, setAcademic] = useState("");

  const [roleId, setRoleId] = useState("");
  const [regId, setRegId] = useState("");

  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUnPublishing, setIsUnPublishing] = useState(false);
  const [showStudentReport, setShowStudentReport] = useState(false);
  const [checkPublish, setCheckPublish] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    class_id: null,
    section_id: null,
    am_id: null,
    academic_yr: academic,
  });

  const [parameter, setParameter] = useState([]);

  useEffect(() => {
    fetchDataRoleId();
  }, []);

  useEffect(() => {
    if (!roleId || !regId) return; // guard against empty
    fetchClasses(roleId, regId);
  }, [roleId, regId]);

  useEffect(() => {
    if (!studentNameWithClassId || studentNameWithClassId.length === 0) return;

    // ✅ auto-fetch for first class only with class_id
    fetchtermsByClassId(studentNameWithClassId[0].class_id);
  }, [studentNameWithClassId]);
  const fetchClasses = async (roleId, regId) => {
    const token = localStorage.getItem("authToken");
    setLoadingExams(true);

    try {
      if (roleId === "T") {
        const response = await axios.get(
          `${API_URL}/api/get_classes_of_classteacher?teacher_id=${regId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const mappedData = (response.data.data || [])
          .filter((item) => item.is_class_teacher === 1)
          .map((cls) => ({
            value: cls.class_id,
            class_id: cls.class_id,
            section_id: cls.section_id,
            classname: cls.classname,
            sectionname: cls.sectionname,
            label: `${cls.classname} ${cls.sectionname}`,
          }));

        setStudentNameWithClassId(mappedData || []);

        setStudentNameWithClassId(mappedData || []);
      } else {
        const response = await axios.get(`${API_URL}/api/get_class_section`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setStudentNameWithClassId(response?.data || []);
      }
    } catch (error) {
      toast.error("Error fetching Classes");
      console.error("Error fetching Classes:", error);
    } finally {
      setLoadingExams(false);
    }
  };

  const fetchtermsByClassId = async (classId) => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.get(
        `${API_URL}/api/get_allaboutmemasterbyclassid?class_id=${classId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const mappedExams =
        response?.data?.data?.map((exam) => ({
          label: exam.name,
          value: exam?.am_id,
        })) || [];

      setTermsOptions(mappedExams);
    } catch (err) {
      console.error("Error fetching exams:", err);
    } finally {
      setLoadingTermsData(false);
    }
  };

  const studentOptions = useMemo(() => {
    if (!studentNameWithClassId) return [];

    return studentNameWithClassId.map((cls) => {
      if (roleId === "T") {
        return {
          value: cls.class_id, // ✅ class_id
          section_id: cls.section_id, // ✅ section_id
          classname: cls.classname,
          sectionname: cls.sectionname,
          label: `${cls.classname} ${cls.sectionname}`,
        };
      } else {
        return {
          value: cls.class_id,
          section_id: cls.section_id,
          classname: cls.get_class?.name,
          sectionname: cls.name,
          label: `${cls.get_class?.name} ${cls.name}`,
        };
      }
    });
  }, [studentNameWithClassId, roleId]);

  const handleStudentSelect = (selectedOption) => {
    setStudentError("");
    setSelectedStudent(selectedOption);

    setSelectedStudentId(selectedOption?.value); // class_id
    setSelectedSectionId(selectedOption?.section_id); // section_id

    console.log("Selected class_id:", selectedOption?.value);
    console.log("Selected section_id:", selectedOption?.section_id);
  };

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
      const academic_yr = sessionResponse.data.custom_claims.academic_year;

      setRoleId(role_id);
      setRegId(reg_id);
      setAcademic(academic_yr);

      console.log("roleIDis:", role_id);
      console.log("reg id:", reg_id);

      return { roleId, regId };
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleChange = (studentId, samId, newValue) => {
    // Update the selected records
    setSelectedRecords((prev) => {
      const existingIndex = prev.findIndex(
        (rec) => rec.student_id === studentId && rec.am_id === samId
      );

      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex].value = newValue;
        return updated;
      } else {
        return [
          ...prev,
          { student_id: studentId, am_id: samId, value: newValue },
        ];
      }
    });

    // Remove the error for this field if it exists and value is not empty
    setPublishErrors((prev) => {
      const key = `${studentId}-${samId}`;
      if (prev[key] && newValue.trim() !== "") {
        const updatedErrors = { ...prev };
        delete updatedErrors[key];
        return updatedErrors;
      }
      return prev;
    });
  };

  const toCamelCase = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const handleSearch = async () => {
    setLoadingForSearch(true);
    setStudentError("");
    setTermError("");

    if (!selectedStudentId) {
      setStudentError("Please select Class.");
      setLoadingForSearch(false);
      return;
    }
    if (!selectedSectionId) {
      setStudentError("Section is missing.");
      setLoadingForSearch(false);
      return;
    }
    if (!selectedTerms) {
      setTermError("Please select parameter.");
      setLoadingForSearch(false);
      return;
    }

    try {
      // ✅ Freeze current dropdown values into applied filters
      const filters = {
        class_id: selectedStudentId,
        section_id: selectedSectionId,
        am_id: selectedTerms,
        academic_yr: academic,
      };
      setAppliedFilters(filters);

      setTimetable([]);
      const token = localStorage.getItem("authToken");

      const response = await axios.get(`${API_URL}/api/get_allaboutme`, {
        headers: { Authorization: `Bearer ${token}` },
        params: filters,
      });

      console.log("response", response.data.students);
      setParameter(response.data.parameters);

      if (!response?.data?.students || response?.data?.students.length === 0) {
        toast.error(" All About Me data not found.");
        setTimetable([]);
        setSelectedRecords([]);
      } else {
        const data = response.data.students;
        const checkPublish = response.data.publish;
        setCheckPublish(checkPublish);
        setTimetable(data);
        setPageCount(Math.ceil(data.length / pageSize));
        setShowStudentReport(true);

        // ✅ Pre-select existing values
        const preSelected = [];
        data.forEach((student) => {
          if (student.assessments && Array.isArray(student.assessments)) {
            student.assessments.forEach((assessment) => {
              if (assessment.value) {
                preSelected.push({
                  student_id: student.student_id,
                  am_id: assessment.am_id,
                  value: assessment.value,
                });
              }
            });
          }
        });
        setSelectedRecords(preSelected);
      }
    } catch (error) {
      console.error("Error fetching All About Me data:", error);
      toast.error("Error fetching  All About Me data. Please try again.");
    } finally {
      setIsSubmitting(false);
      setLoadingForSearch(false);
    }
  };

  const handleSubmit = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      // ✅ Use applied filters if user clicked Browse, else fallback to current selections
      const filtersToUse = appliedFilters || {
        am_id: selectedTerms,
        class_id: selectedStudentId,
        section_id: selectedSectionId,
        academic_yr: academic,
      };

      if (
        !filtersToUse.class_id ||
        !filtersToUse.section_id ||
        !filtersToUse.am_id
      ) {
        toast.error("Please select Class, Section, and Term before saving.");
        setIsSaving(false);
        return;
      }

      const payload = {
        ...filtersToUse,
        assessments: selectedRecords,
      };

      console.log("Submitting payload:", payload);

      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        `${API_URL}/api/save_allaboutme`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response?.data?.status === 200) {
        toast.success("All About Me data saved successfully!");
        window.scrollTo({ top: 0, behavior: "smooth" });

        // ✅ If save without Browse → still mark filters as applied
        if (!appliedFilters) {
          setAppliedFilters(filtersToUse);
        }

        setShowStudentReport(false);
      } else {
        toast.error(response?.data?.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Error saving  All About Me data", error);
      toast.error("Error saving data. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitPublish = async () => {
    if (isPublishing) return;

    // ✅ Make sure user has clicked Browse
    if (!appliedFilters) {
      toast.error(
        "Please select Class, Section, and Term and click Browse first."
      );
      return;
    }

    let firstErrorElement = null;
    const newErrors = {};
    for (const student of timetable) {
      for (const param of parameter || []) {
        const record = selectedRecords.find(
          (rec) =>
            rec.student_id === student.student_id && rec.am_id === param.am_id
        );

        // ✅ Use only selectedRecords, do not fallback to old assessment values
        const value = record?.value || "";

        if (!value.trim()) {
          const key = `${student.student_id}-${param.am_id}`;
          newErrors[key] = "All fields required.";

          setPublishErrors(newErrors);

          const firstErrorElement = document.querySelector(
            `[name="param-${student.student_id}-${param.am_id}"]`
          );
          if (firstErrorElement) {
            firstErrorElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
            firstErrorElement.focus();
          }

          return; // stop validation at first empty field
        }
      }
    }

    // ✅ No errors, proceed to publish
    setIsPublishing(true);
    try {
      const token = localStorage.getItem("authToken");

      // ✅ Use appliedFilters instead of live dropdowns
      const payload = {
        am_id: appliedFilters.am_id,
        class_id: appliedFilters.class_id,
        section_id: appliedFilters.section_id,
        academic_yr: appliedFilters.academic_yr,
        assessments: selectedRecords,
      };

      const response = await axios.post(
        `${API_URL}/api/savenpublish_allaboutme`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response?.data?.status === 200) {
        toast.success("All About Me data saved & published successfully!");
        window.scrollTo({ top: 0, behavior: "smooth" });
        setShowStudentReport(false);
      }
    } catch (error) {
      console.error("Error saving All About Me data:", error);
      toast.error("Error saving data. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSubmitUnPublish = async () => {
    if (isUnPublishing) return;

    // ✅ Check if user has browsed first
    if (!appliedFilters) {
      toast.error(
        "Please select Class, Section, and Term and click Browse first."
      );
      return;
    }

    setIsUnPublishing(true);
    setLoadingForSearch(true);

    try {
      setTimetable([]);
      const token = localStorage.getItem("authToken");

      const params = {
        class_id: appliedFilters.class_id,
        section_id: appliedFilters.section_id,
        am_id: appliedFilters.am_id,
      };

      const response = await axios.get(`${API_URL}/api/unpublish_allaboutme`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      if (!response?.data?.data || response?.data?.data?.length === 0) {
        toast.success("All About Me data unpublished successfully.");
        setShowStudentReport(false);
        setTimetable([]);
        setSelectedRecords([]);
        setCheckPublish("");
        // handleSearch(); // refresh with previous appliedFilters
      } else {
        const data = response.data.data;
        const checkPublish = response.data.publish;
        setCheckPublish(checkPublish);
        setTimetable(data);
        setPageCount(Math.ceil(data.length / pageSize));
        // setShowStudentReport(false);

        // Populate selectedRecords with previously saved values
        const preSelected = [];
        data.forEach((student) => {
          student.parameters.forEach((param) => {
            if (param.value) {
              preSelected.push({
                student_id: student.student_id,
                am_id: param.am_id,
                value: param.value,
              });
            }
          });
        });
        setSelectedRecords(preSelected);
      }
    } catch (error) {
      console.error("Error unpublishing All About Me data:", error);
      toast.error("Error fetching All About Me data. Please try again.");
    } finally {
      setIsUnPublishing(false);
      setLoadingForSearch(false);
    }
  };

  const filteredSections = timetable.filter((section) => {
    const searchLower = searchTerm.toLowerCase();

    const regNo = section?.reg_no?.toLowerCase() || "";
    const admissionClass = section?.admission_class?.toLowerCase() || "";
    const studentName = section?.student_name.toLowerCase().trim() || "";

    const name = section?.name?.toLowerCase().trim() || "";

    return (
      regNo.includes(searchLower) ||
      admissionClass.includes(searchLower) ||
      studentName.includes(searchLower) ||
      name.includes(searchLower)
    );
  });

  const displayedSections = filteredSections.slice(currentPage * pageSize);
  console.log("display section", displayedSections);

  return (
    <>
      <div
        className={` transition-all duration-500 w-[100%]  mx-auto p-4 ${
          showStudentReport ? "w-full " : "w-[100%] "
        }`}
      >
        <ToastContainer />
        <div className="card rounded-md">
          {!showStudentReport && (
            <>
              <div className=" card-header mb-4 flex justify-between items-center ">
                <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
                  All About Me
                </h5>
                <RxCross1
                  className="  relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                  onClick={() => {
                    navigate("/dashboard");
                  }}
                />
              </div>
              <div
                className=" relative w-[98%]   -top-6 h-1  mx-auto bg-red-700"
                style={{
                  backgroundColor: "#C03078",
                }}
              ></div>
            </>
          )}

          <>
            {!showStudentReport && (
              <div className=" w-full md:w-[70%] flex justify-center flex-col md:flex-row gap-x-1 ml-0 p-2">
                <div className="w-full md:w-[99%] flex md:flex-row justify-between items-center mt-0 md:mt-4">
                  <div className="w-full md:w-[99%]  gap-x-0 md:gap-x-4 flex flex-col gap-y-2 md:gap-y-0 md:flex-row">
                    <div className="w-full md:w-[45%] gap-x-2   justify-around  my-1 md:my-4 flex md:flex-row ">
                      <label
                        className="md:w-[35%] text-md pl-0 md:pl-5 mt-1.5"
                        htmlFor="studentSelect"
                      >
                        Class <span className="text-sm text-red-500">*</span>
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

                    <div className="w-full  md:w-[60%] gap-x-2 justify-around my-1 md:my-4 flex md:flex-row">
                      <label className="w-full md:w-[35%] text-md pl-0 md:pl-5 mt-1.5">
                        Parameter{" "}
                        <span className="text-sm text-red-500">*</span>
                      </label>
                      <div className="w-full md:w-[70%]">
                        <Select
                          value={
                            termsOptions.find(
                              (opt) => opt.value === selectedTerms
                            ) || null
                          }
                          onChange={(option) => {
                            setSelectedTerms(option ? option.value : null);
                            if (termError) setTermError(""); // Clear error when user selects
                          }}
                          options={termsOptions}
                          placeholder={
                            loadingTermsData ? "Loading..." : "Select..."
                          }
                          isSearchable
                          isClearable
                          isDisabled={loadingTermsData}
                          className="text-sm"
                          styles={{
                            control: (provided) => ({
                              ...provided,
                              fontSize: "1em",
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
                        {termError && (
                          <div className="h-8 relative ml-1 text-danger text-xs">
                            {termError}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-1">
                      <button
                        type="search"
                        onClick={handleSearch}
                        style={{ backgroundColor: "#2196F3" }}
                        className={`btn h-10 w-18 md:w-auto btn-primary text-white font-bold py-1 border-1 border-blue-500 px-4 rounded ${
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
                  </div>
                </div>
              </div>
            )}

            {showStudentReport && (
              <>
                <>
                  <div className="w-full">
                    <div className="card mx-auto lg:w-full shadow-lg">
                      <div className="p-2 px-3 bg-gray-100 border-none flex items-center justify-between">
                        <div className="w-full flex flex-row items-center justify-between ">
                          <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap mr-6">
                            All About Me
                          </h3>
                          {/* <div className="flex items-center w-[60%] md:mr-36"> */}
                          <div className="flex items-center flex-1 max-w-3xl mx-auto">
                            <div className="flex flex-row flex-nowrap items-center gap-4 w-full overflow-x-auto bg-blue-50 border-l-2 border-r-2 border-pink-500 rounded-md shadow-md px-4 py-1">
                              {/* Class */}
                              <div className="flex items-center gap-2 flex-1 min-w-[100px]">
                                <label
                                  className="whitespace-nowrap text-sm sm:text-md"
                                  htmlFor="studentSelect"
                                >
                                  Class <span className="text-red-500">*</span>
                                </label>
                                <div className="flex-1 w-[30%]">
                                  <Select
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    id="studentSelect"
                                    value={selectedStudent}
                                    onChange={handleStudentSelect}
                                    options={studentOptions}
                                    placeholder={
                                      loadingExams ? "Loading..." : "Select"
                                    }
                                    isSearchable
                                    isClearable
                                    className="text-sm"
                                    isDisabled={loadingExams}
                                  />
                                  {studentError && (
                                    <div className="text-danger text-xs mt-1">
                                      {studentError}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Terms */}
                              <div className="flex items-center gap-2 flex-1 min-w-[320px]">
                                <label className="whitespace-nowrap text-sm sm:text-md">
                                  Parameter{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <div className="flex-1 w-[50%]">
                                  <Select
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    value={
                                      termsOptions.find(
                                        (opt) => opt.value === selectedTerms
                                      ) || null
                                    }
                                    onChange={(option) => {
                                      setSelectedTerms(
                                        option ? option.value : null
                                      );
                                      if (termError) setTermError("");
                                    }}
                                    options={termsOptions}
                                    placeholder={
                                      loadingTermsData
                                        ? "Loading..."
                                        : "Select..."
                                    }
                                    isSearchable
                                    isClearable
                                    isDisabled={loadingTermsData}
                                    className="text-sm"
                                  />
                                  {termError && (
                                    <div className="text-danger text-xs mt-1">
                                      {termError}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Browse button */}
                              <div className="flex items-center min-w-[120px]">
                                <button
                                  type="button"
                                  onClick={handleSearch}
                                  style={{ backgroundColor: "#2196F3" }}
                                  className={`btn h-9 w-full btn-primary text-white font-bold px-3 rounded ${
                                    loadingForSearch
                                      ? "opacity-50 cursor-not-allowed"
                                      : ""
                                  }`}
                                  disabled={loadingForSearch}
                                >
                                  {loadingForSearch ? "Browsing..." : "Browse"}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex mb-1.5 flex-col md:flex-row gap-x-6 justify-center md:justify-end ml-2 mr-2">
                          <RxCross1
                            className="text-base text-red-600 cursor-pointer hover:bg-red-100 rounded"
                            onClick={() => setShowStudentReport(false)}
                          />
                        </div>
                      </div>

                      <div className="w-[97%] mx-auto text-center">
                        {/* Top colored line */}
                        <div
                          className="h-1"
                          style={{ backgroundColor: "#C03078" }}
                        ></div>
                      </div>

                      <div className="card-body w-full">
                        <div
                          className="h-[550px] lg:h-[550px] overflow-y-scroll overflow-x-scroll"
                          style={{
                            // maxHeight: "calc(100vh - 220px)", // adjusts automatically with screen height
                            scrollbarWidth: "thin",
                            scrollbarColor: "#C03178 transparent",
                          }}
                        >
                          <table className="min-w-full leading-normal table-auto ">
                            <thead
                              className="sticky top-0  bg-gray-200"
                              style={{ zIndex: "1px" }}
                            >
                              <tr className="bg-gray-200">
                                {[
                                  "Sr No.",
                                  "Roll No.",
                                  "Student Name",
                                  "Value",
                                ].map((header, index) => (
                                  <th
                                    key={index}
                                    className="px-2 text-center lg:px-3 py-2 border border-gray-400 text-sm font-semibold text-gray-900 tracking-wider"
                                  >
                                    {header}
                                  </th>
                                ))}

                                {/* {parameter?.map((param, pIndex) => (
                                  <th
                                    key={pIndex}
                                    className="px-2 text-center lg:px-3 py-2 border border-gray-400 text-sm font-semibold text-gray-900 tracking-wider w-[25%]"
                                  >
                                    {param.parameter}
                                  </th>
                                ))} */}
                              </tr>
                            </thead>

                            <tbody>
                              {loadingForSearch ? (
                                <div className=" absolute left-[4%] w-[100%]  text-center flex justify-center items-center mt-14">
                                  <div className=" text-center text-xl text-blue-700">
                                    Please wait while data is loading...
                                  </div>
                                </div>
                              ) : timetable.length > 0 ? (
                                timetable.map((student, index) => (
                                  <tr
                                    key={student.student_id}
                                    className="border border-gray-300"
                                  >
                                    <td className="px-2 py-1 text-center border border-gray-400">
                                      {index + 1}
                                    </td>

                                    <td className="px-2 py-1 text-center border border-gray-400">
                                      {student.roll_no || ""}
                                    </td>

                                    <td className="px-2 py-1 text-center border border-gray-400">
                                      {toCamelCase(student.student_name || "")}
                                    </td>

                                    {parameter?.map((param, pIndex) => {
                                      const assessment =
                                        student.assessments.find(
                                          (a) => a.am_id === param.am_id
                                        );

                                      const record = selectedRecords.find(
                                        (rec) =>
                                          rec.student_id ===
                                            student.student_id &&
                                          rec.am_id === param.am_id
                                      );

                                      const selectedValue =
                                        record !== undefined
                                          ? record.value
                                          : assessment?.value || "";

                                      return (
                                        <td
                                          key={pIndex}
                                          className="px-2 py-1 text-center border border-gray-400"
                                        >
                                          {/* 🔹 Replace radio buttons with text input */}
                                          <input
                                            type="text"
                                            name={`param-${student.student_id}-${param.am_id}`}
                                            value={selectedValue}
                                            onChange={(e) =>
                                              handleChange(
                                                student.student_id,
                                                param.am_id,
                                                e.target.value
                                              )
                                            }
                                            className="w-full p-1 border rounded text-sm"
                                            maxLength={500}
                                          />

                                          {publishErrors?.[
                                            `${student.student_id}-${param.am_id}`
                                          ] && (
                                            <span className="text-red-500 text-xs mt-1 block">
                                              {
                                                publishErrors[
                                                  `${student.student_id}-${param.am_id}`
                                                ]
                                              }
                                            </span>
                                          )}
                                        </td>
                                      );
                                    })}
                                  </tr>
                                ))
                              ) : (
                                <div className=" absolute left-[4%] w-[100%]  text-center flex justify-center items-center mt-14">
                                  <div className=" text-center text-xl text-red-500">
                                    Oops! No data found..
                                  </div>
                                </div>
                              )}
                            </tbody>
                          </table>

                          {loadingForSearch ? (
                            ""
                          ) : (
                            <div className="flex justify-end gap-3 mt-4 mr-4">
                              <button
                                type="button"
                                onClick={handleSubmit}
                                className={`bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-md`}
                                disabled={isSaving}
                              >
                                {isSaving ? "Saving..." : "Save"}
                              </button>

                              {checkPublish === "Y" ? (
                                <button
                                  type="button"
                                  onClick={handleSubmitUnPublish}
                                  className={`bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-md`}
                                  disabled={isUnPublishing}
                                >
                                  {isUnPublishing
                                    ? "Unpublishing..."
                                    : "Unpublish"}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={handleSubmitPublish}
                                  className={`bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-md`}
                                  disabled={isPublishing}
                                >
                                  {isPublishing
                                    ? "Publishing..."
                                    : "Save & Publish"}
                                </button>
                              )}

                              <button
                                type="button"
                                className="bg-yellow-300 hover:bg-yellow-400 text-white font-medium px-4 py-2 rounded-lg shadow-md"
                                onClick={() => setShowStudentReport(false)}
                              >
                                Back
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              </>
            )}
          </>
        </div>
      </div>
    </>
  );
};

export default AllAboutMe;
