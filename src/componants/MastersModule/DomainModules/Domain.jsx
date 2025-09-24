import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";

const Domain = () => {
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
  const [domainError, setDomainError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [termsOptions, setTermsOptions] = useState([]);
  const [selectedTerms, setSelectedTerms] = useState(null);
  const [loadingTermsData, setLoadingTermsData] = useState(false);
  const [publishErrors, setPublishErrors] = useState({});

  const [timetable, setTimetable] = useState([]);

  const pageSize = 10;
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const [roleId, setRoleId] = useState("");
  const [regId, setRegId] = useState("");

  const [domain, setDomain] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [selectedDomainId, setSelectedDomainId] = useState(null);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUnPublishing, setIsUnPublishing] = useState(false);
  const [showStudentReport, setShowStudentReport] = useState(false);
  const [checkPublish, setCheckPublish] = useState("");

  const [subject, setSubject] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [subjectIdForManage, setSubjectIdForManage] = useState(null);
  const [subjectError, setSubjectError] = useState("");

  const [hasShownError, setHasShownError] = useState(false);

  const [appliedFilters, setAppliedFilters] = useState({
    class_id: null,
    section_id: null,
    term_id: null,
    dm_id: null,
    subject_id: null,
  });

  useEffect(() => {
    fetchDataRoleId();
    fetchtermsByClassId();
  }, []);

  useEffect(() => {
    if (!roleId || !regId) return; // guard against empty
    fetchClasses(roleId, regId);
  }, [roleId, regId]);

  useEffect(() => {
    if (selectedStudentId && subjectIdForManage) {
      console.log(
        "Triggering fetchDomain with class_id:",
        selectedStudentId,
        "and subject_id:",
        subjectIdForManage
      );

      fetchDomain(selectedStudentId, subjectIdForManage);
    }

    if (selectedStudentId) {
      fetchSubject(selectedStudentId);
    }
  }, [selectedStudentId, subjectIdForManage]);

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
        const response = await axios.get(`${API_URL}/api/g`, {
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

  const fetchtermsByClassId = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.get(`${API_URL}/api/get_Term`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const mappedExams =
        response?.data?.map((exam) => ({
          label: exam.name,
          value: exam?.term_id,
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

  // const handleStudentSelect = (selectedOption) => {
  //   setStudentError("");
  //   setSelectedStudent(selectedOption);

  //   setSelectedStudentId(selectedOption?.value);
  //   setSelectedSectionId(selectedOption?.section_id);

  //   setSelectedSubject("");
  //   setSubjectIdForManage("");
  //   setSelectedDomain("");
  //   setSelectedTerms("");
  // };

  const handleStudentSelect = (selectedOption) => {
    setStudentError("");
    setSelectedStudent(selectedOption);

    const classId = selectedOption?.value ?? null;
    setSelectedStudentId(classId);
    setSelectedSectionId(selectedOption?.section_id ?? null);

    // reset everything downstream
    setSelectedSubject(null);
    setSubjectIdForManage(null);
    setSelectedDomain(null);
    setSelectedTerms(null);

    // clear subject options if no class
    if (!classId) {
      setSubject([]); // important: empty options closes the menu
    } else {
      fetchSubject(classId); // pass classId explicitly (don't rely on state immediately)
    }
  };

  const fetchDomain = async (classId, subjectId) => {
    if (!classId || !subjectId) {
      setDomain([]);
      setPageCount(0);
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      // ✅ Build URL with both classId and subjectId
      const response = await axios.get(
        `${API_URL}/api/get_domains/${classId}?subject_id=${subjectId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      console.log("Domain data:", response.data.data);

      setDomain(response.data.data);
      setPageCount(Math.ceil((response.data?.data?.length || 0) / pageSize));
    } catch (error) {
      console.log("fetchDomain error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const domainOptions = domain.map((cls) => ({
    value: cls.dm_id,
    label: `${cls?.domainname}  `,
  }));

  const handleDomainSelect = (selectedOption) => {
    setDomainError("");
    setSelectedDomain(selectedOption);
    setSelectedDomainId(selectedOption?.value);
    console.log("Selected domain_id:", selectedOption?.value);
  };

  const fetchSubject = async (classId) => {
    if (!classId) {
      setSubject(null);
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/api/get_hpc_subject_Alloted_for_report_card/${classId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const rolesData = response.data.subjectAllotments || [];
      setSubject(rolesData);
    } catch (error) {
      toast.error("Error fetching subjects");
    } finally {
      setLoading(false);
    }
  };

  const subjectOptions = subject.map((dept) => ({
    value: dept.hpc_sm_id,
    label: dept.subject_name,
  }));

  // const handleSubjectSelect = (selectedOption) => {
  //   setSubjectError("");
  //   setSelectedSubject(selectedOption);
  //   setSubjectIdForManage(selectedOption ? selectedOption.value : null);
  //   setSelectedDomain("");
  //   setSelectedTerms("");
  // };

  const handleSubjectSelect = (selectedOption) => {
    setSubjectError("");
    setSelectedSubject(selectedOption);
    setSubjectIdForManage(selectedOption ? selectedOption.value : null);

    //  Reset Terms & Domain when subject changes/clears
    setSelectedTerms(null);
    // setTermsOptions([]); // clear old terms

    setSelectedDomain(null);
    setDomain([]); // clear old domains
    setPageCount(0);
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

      setRoleId(role_id);
      setRegId(reg_id);

      console.log("roleIDis:", role_id); // use local variable
      console.log("reg id:", reg_id);

      return { roleId, regId };
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const toCamelCase = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const handleSearch = async () => {
    setLoadingForSearch(false);

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
    if (!subjectIdForManage) {
      setSubjectError("Please select Subject.");
      setLoadingForSearch(false);
      return;
    }
    if (!selectedTerms) {
      setTermError("Please select Term.");
      setLoadingForSearch(false);
      return;
    }
    if (!selectedDomainId) {
      setDomainError("Please select Domain.");
      setLoadingForSearch(false);
      return;
    }

    try {
      setLoadingForSearch(true);
      setTimetable([]);
      const token = localStorage.getItem("authToken");

      // const params = {
      //   class_id: selectedStudentId,
      //   section_id: selectedSectionId,
      //   subject_id: subjectIdForManage,
      //   dm_id: selectedDomainId,
      //   term_id: selectedTerms,
      // };

      // ✅ Freeze current dropdown values into applied filters
      const filters = {
        class_id: selectedStudentId,
        section_id: selectedSectionId,
        term_id: selectedTerms,
        subject_id: subjectIdForManage,
        dm_id: selectedDomainId,
      };
      setAppliedFilters(filters);

      const response = await axios.get(
        `${API_URL}/api/get_studentparametervalue`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: filters,
        }
      );

      if (!response?.data?.data || response?.data?.data?.length === 0) {
        toast.error("Student Domain data not found.");
        setTimetable([]);
        setSelectedRecords([]); // clear previous selections
      } else {
        const data = response.data.data;
        const checkPublish = response.data.publish;
        console.log("handleSearch", checkPublish);
        setCheckPublish(checkPublish);
        setTimetable(data);
        setPageCount(Math.ceil(data.length / pageSize));
        setShowStudentReport(true);

        // Populate selectedRecords with previously saved values
        const preSelected = [];
        data.forEach((student) => {
          student.parameters.forEach((param) => {
            if (param.value) {
              // check if API returned a saved value
              preSelected.push({
                student_id: student.student_id,
                parameter_id: param.parameter_id,
                value: param.value,
              });
            }
          });
        });

        setSelectedRecords(preSelected);
      }
    } catch (error) {
      console.error("Error fetching Student Domain:", error);
      toast.error("Error fetching Student Domain. Please try again.");
    } finally {
      setIsSubmitting(false);
      setLoadingForSearch(false);
    }
  };

  const handleSelectParameter = (studentId, parameterId, value) => {
    setSelectedRecords((prev) => {
      // Check if record already exists
      const exists = prev.find(
        (rec) =>
          rec.student_id === studentId && rec.parameter_id === parameterId
      );

      if (exists) {
        // Update existing record
        return prev.map((rec) =>
          rec.student_id === studentId && rec.parameter_id === parameterId
            ? { ...rec, value }
            : rec
        );
      } else {
        // Add new record
        return [
          ...prev,
          { student_id: studentId, parameter_id: parameterId, value },
        ];
      }
    });
  };

  const handleSubmit = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const token = localStorage.getItem("authToken");

      console.log("✅ Selected Records before submit:", selectedRecords);

      const filtersToUse = appliedFilters || {
        term_id: selectedTerms,
        class_id: selectedStudentId,
        section_id: selectedSectionId,
        subject_id: subjectIdForManage,
        dm_id: selectedDomainId,
      };

      if (
        !filtersToUse.class_id ||
        !filtersToUse.section_id ||
        !filtersToUse.term_id ||
        !filtersToUse.subject_id ||
        !filtersToUse.dm_id
      ) {
        toast.error("Please select Class, Section, and Term before saving.");
        setIsSaving(false);
        return;
      }

      const payload = {
        // term_id: selectedTerms,
        // class_id: selectedStudentId,
        // subject_id: subjectIdForManage,
        // section_id: selectedSectionId,
        // dm_id: selectedDomainId,
        ...filtersToUse,
        records: selectedRecords, // use only the edited state
      };

      const response = await axios.post(
        `${API_URL}/api/save_domainparametervalue`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response?.data?.status === 200) {
        toast.success("Student Domain data saved successfully!");
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (!appliedFilters) {
          setAppliedFilters(filtersToUse);
        }
        setShowStudentReport(false);
      }
    } catch (error) {
      console.error(" Error saving student domain:", error);
      toast.error("Error saving data. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitPublish = async () => {
    if (isPublishing) return;

    if (!appliedFilters) {
      toast.error(
        "Please select Class, Section, and Term and click Browse first."
      );
      return;
    }

    const newErrors = {};
    let firstErrorElement = null;
    let foundError = false;

    for (const student of displayedSections) {
      for (const param of student.parameters || []) {
        const selectedValue = selectedRecords.find(
          (rec) =>
            rec.student_id === student.student_id &&
            rec.parameter_id === param.parameter_id
        )?.value;

        if (!selectedValue) {
          const key = `${student.student_id}-${param.parameter_id}`;
          newErrors[key] = "Please select a level";

          // scroll to first error
          firstErrorElement = document.querySelector(
            `[name="param-${student.student_id}-${param.parameter_id}"]`
          );

          foundError = true;
          break; // stop checking other params for this student
        }
      }
      if (foundError) break; // stop checking other students
    }

    if (foundError) {
      setPublishErrors(newErrors);
      toast.error("Please fill all student domain values before publishing");
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        firstErrorElement.focus();
      }
      return;
    }

    // ✅ No validation errors → continue API call
    setIsPublishing(true);
    try {
      const token = localStorage.getItem("authToken");

      // const payload = {
      //   term_id: selectedTerms,
      //   class_id: selectedStudentId,
      //   section_id: selectedSectionId,
      //   subject_id: subjectIdForManage,
      //   dm_id: selectedDomainId,
      //   records: selectedRecords,
      // };
      const payload = {
        term_id: appliedFilters.term_id,
        class_id: appliedFilters.class_id,
        section_id: appliedFilters.section_id,
        subject_id: appliedFilters.subject_id,
        dm_id: appliedFilters.dm_id,
        records: selectedRecords,
      };

      const response = await axios.post(
        `${API_URL}/api/savenpublish_domainparametervalue`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response?.data?.status === 200) {
        toast.success("Student Domain data saved & published successfully!");
        window.scrollTo({ top: 0, behavior: "smooth" });
        setShowStudentReport(false);
      }
    } catch (error) {
      console.error("Error saving student domain:", error);
      toast.error("Error saving data. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSubmitUnPublish = async () => {
    if (isUnPublishing) return;
    setIsUnPublishing(true);
    setLoadingForSearch(false);

    if (!appliedFilters) {
      toast.error(
        "Please select Class, Section, and Term and click Browse first."
      );
      return;
    }

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
      setTermError("Please select Term.");
      setLoadingForSearch(false);
      return;
    }
    if (!selectedDomainId) {
      setDomainError("Please select Domain.");
      setLoadingForSearch(false);
      return;
    }

    try {
      setLoadingForSearch(true);
      setTimetable([]);
      const token = localStorage.getItem("authToken");

      // const params = {
      //   class_id: selectedStudentId,
      //   section_id: selectedSectionId,
      //   subject_id: subjectIdForManage,
      //   dm_id: selectedDomainId,
      //   term_id: selectedTerms,
      // };

      const params = {
        class_id: appliedFilters.class_id,
        section_id: appliedFilters.section_id,
        term_id: appliedFilters.term_id,
        subject_id: appliedFilters.subject_id,
        dm_id: appliedFilters.dm_id,
      };

      const response = await axios.get(
        `${API_URL}/api/unpublish_domainparametervalue`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      if (!response?.data?.data || response?.data?.data?.length === 0) {
        toast.success("Student Domain data Unpubluish successfully.");
        setTimetable([]);
        setSelectedRecords([]); // clear previous selections
        setCheckPublish("");
        handleSearch();
      } else {
        const data = response.data.data;
        const checkPublish = response.data.publish;
        console.log("handleSearch", checkPublish);
        setCheckPublish(checkPublish);
        setTimetable(data);
        setPageCount(Math.ceil(data.length / pageSize));
        setShowStudentReport(false);

        // Populate selectedRecords with previously saved values
        const preSelected = [];
        data.forEach((student) => {
          student.parameters.forEach((param) => {
            if (param.value) {
              // check if API returned a saved value
              preSelected.push({
                student_id: student.student_id,
                parameter_id: param.parameter_id,
                value: param.value,
              });
            }
          });
        });

        setSelectedRecords(preSelected);
      }
    } catch (error) {
      console.error("Error fetching Student Domain:", error);
      toast.error("Error fetching Student Domain. Please try again.");
    } finally {
      setIsUnPublishing(false);
      setLoadingForSearch(false);
    }
  };

  const filteredSections = timetable.filter((section) => {
    const searchLower = searchTerm.toLowerCase();

    const regNo = section?.reg_no?.toLowerCase() || "";
    const admissionClass = section?.admission_class?.toLowerCase() || "";
    const studentName = `${section?.first_name || ""} ${
      section?.mid_name?.trim() || ""
    } ${section?.last_name || ""}`
      .toLowerCase()
      .trim();

    const name = section?.name?.toLowerCase().trim() || "";

    return (
      regNo.includes(searchLower) ||
      admissionClass.includes(searchLower) ||
      studentName.includes(searchLower) ||
      name.includes(searchLower)
    );
  });

  const displayedSections = filteredSections.slice(currentPage * pageSize);

  return (
    <>
      <div
        className={` transition-all duration-500 w-[100%]  mx-auto p-4 ${
          showStudentReport ? "w-full " : "w-[100%] "
        }`}
      >
        <ToastContainer />
        <div className="card  rounded-md ">
          {!showStudentReport && (
            <>
              <div className=" card-header mb-4 flex justify-between items-center ">
                <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
                  Domain
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
              <div className=" w-full md:w-[100%] flex justify-center flex-col md:flex-row gap-x-1 ml-0 p-2">
                <div className="w-full md:w-[99%] flex md:flex-row justify-between items-center mt-0 md:mt-4">
                  <div className="w-full md:w-[99%]  gap-x-0 md:gap-x-4 flex flex-col gap-y-2 md:gap-y-0 md:flex-row">
                    <div className="w-full md:w-[45%] gap-x-2   justify-around  my-1 md:my-4 flex md:flex-row ">
                      <label
                        className="md:w-[40%] text-md pl-0 md:pl-5 mt-1.5"
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

                    <div className="w-full md:w-[58%] gap-x-2   justify-around  my-1 md:my-4 flex md:flex-row ">
                      <label
                        className="md:w-[35%] text-md pl-0 md:pl-5 mt-1.5"
                        htmlFor="studentSelect"
                      >
                        Subject <span className="text-sm text-red-500">*</span>
                      </label>
                      <div className=" w-full md:w-[65%]">
                        <Select
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          id="subjectSelect"
                          value={selectedSubject}
                          onChange={handleSubjectSelect}
                          options={subjectOptions}
                          placeholder={loadingExams ? "Loading..." : "Select"}
                          isSearchable
                          isClearable
                          className="text-sm"
                          isDisabled={loadingExams}
                        />
                        {subjectError && (
                          <div className="h-8 relative ml-1 text-danger text-xs">
                            {subjectError}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="w-full  md:w-[50%] gap-x-2 justify-around my-1 md:my-4 flex md:flex-row">
                      <label className="w-full md:w-[40%] text-md pl-0 md:pl-5 mt-1.5">
                        Terms <span className="text-sm text-red-500">*</span>
                      </label>
                      <div className="w-full md:w-[85%]">
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

                    <div className="w-full  md:w-[58%] gap-x-2 justify-around my-1 md:my-4 flex md:flex-row">
                      <label className="w-full md:w-[40%] text-md pl-0 md:pl-5 mt-1.5">
                        Domain <span className="text-sm text-red-500">*</span>
                      </label>
                      <div className="w-full md:w-[85%]">
                        <Select
                          value={selectedDomain}
                          onChange={handleDomainSelect}
                          options={domainOptions}
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
                        {domainError && (
                          <div className="h-8 relative ml-1 text-danger text-xs">
                            {domainError}
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
                {/* {timetable.length > 0 && ( */}
                <>
                  <div className="w-full">
                    <div className="card mx-auto lg:w-full shadow-lg">
                      <div className="p-2 px-3 bg-gray-100 border-none flex items-center justify-between">
                        <div className="w-full flex flex-row items-center justify-between ">
                          <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap mr-6">
                            Domain
                          </h3>
                          <div className="flex items-center w-full">
                            <div className="flex flex-row flex-nowrap items-center gap-4 w-full overflow-x-auto bg-blue-50 border-l-2 border-r-2 border-pink-500 rounded-md shadow-md px-4 py-2">
                              <div className="flex items-center gap-2 flex-1 min-w-[150px]">
                                <label
                                  className="whitespace-nowrap text-sm sm:text-md"
                                  htmlFor="studentSelect"
                                >
                                  Class <span className="text-red-500">*</span>
                                </label>
                                <div className="flex-1">
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

                              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                                <label className="whitespace-nowrap text-sm sm:text-md">
                                  Subject{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <div className="flex-1">
                                  <Select
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    value={selectedSubject}
                                    onChange={handleSubjectSelect}
                                    options={subjectOptions}
                                    placeholder={
                                      loadingExams ? "Loading..." : "Select"
                                    }
                                    isSearchable
                                    isClearable
                                    className="text-sm"
                                    isDisabled={loadingExams}
                                  />
                                  {subjectError && (
                                    <div className="text-danger text-xs mt-1">
                                      {subjectError}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-1 min-w-[180px]">
                                <label className="whitespace-nowrap text-sm sm:text-md">
                                  Terms <span className="text-red-500">*</span>
                                </label>
                                <div className="flex-1">
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

                              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                                <label className="whitespace-nowrap text-sm sm:text-md">
                                  Domain <span className="text-red-500">*</span>
                                </label>
                                <div className="flex-1">
                                  <Select
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    value={selectedDomain}
                                    onChange={handleDomainSelect}
                                    options={domainOptions}
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
                                  {domainError && (
                                    <div className="text-danger text-xs mt-1">
                                      {domainError}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center min-w-[90px]">
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

                        <div className="flex mb-1.5 flex-col md:flex-row gap-x-6 justify-center md:justify-end ml-2">
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

                        {/* Subject + Domain centered below */}
                        <div
                          className="font-semibold text-center"
                          style={{ color: "#C03078" }}
                        >
                          {selectedSubject?.label} {" : "}{" "}
                          {selectedDomain?.label}
                        </div>
                      </div>

                      <div className="card-body w-full pt-0">
                        <div
                          className="h-96 overflow-y-auto"
                          style={{
                            // maxHeight: "calc(100vh - 220px)", // adjusts automatically with screen height
                            scrollbarWidth: "thin",
                            scrollbarColor: "#C03178 transparent",
                          }}
                        >
                          <table className="min-w-full  leading-normal table-auto ">
                            <thead
                              className="sticky top-0  bg-gray-200"
                              style={{ zIndex: "1px" }}
                            >
                              <tr className="bg-gray-200">
                                <th className="px-2 lg:px-3 py-2 border-2 border-gray-400 text-center text-sm font-semibold text-gray-900 tracking-wider">
                                  Sr No.
                                </th>
                                <th className="px-2 lg:px-3 py-2 border-2 border-gray-400 text-center text-sm font-semibold text-gray-900 tracking-wider">
                                  Roll No.
                                </th>
                                <th className="px-2 lg:px-3 py-2 border-2 border-gray-400 text-center text-sm font-semibold text-gray-900 tracking-wider w-[15%]">
                                  Student Name
                                </th>
                                <th className="px-2 lg:px-3 py-2 border-2 border-gray-400 text-center text-sm font-semibold text-gray-900 tracking-wider w-[45%]">
                                  Parameters
                                </th>
                                <th className="px-2 lg:px-3 py-2 border-2 border-gray-400 text-center text-sm font-semibold text-gray-900 tracking-wider w-[25%]">
                                  Options
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {loadingForSearch ? (
                                <div className=" absolute left-[4%] w-[100%]  text-center flex justify-center items-center mt-14">
                                  <div className=" text-center text-xl text-blue-700">
                                    Please wait while data is loading...
                                  </div>
                                </div>
                              ) : displayedSections.length ? (
                                displayedSections.map((student, index) => {
                                  const parameters = student.parameters || []; // assume array of parameters
                                  return parameters.map((param, pIndex) => (
                                    <tr
                                      key={`${student.student_id}-${pIndex}`}
                                      className="border border-gray-300"
                                    >
                                      {pIndex === 0 && (
                                        <>
                                          <td
                                            rowSpan={parameters.length}
                                            className="px-2 py-1 text-center  border-2 border-gray-400"
                                          >
                                            {index + 1}
                                          </td>
                                          <td
                                            rowSpan={parameters.length}
                                            className="px-2 py-1 text-center border-2 border-gray-400"
                                          >
                                            {student.roll_no || ""}
                                          </td>
                                          <td
                                            rowSpan={parameters.length}
                                            className="px-2 py-1 text-center border-2 border-gray-400"
                                          >
                                            {toCamelCase(student.name || "")}
                                          </td>
                                        </>
                                      )}

                                      {pIndex === parameters.length - 1 ? (
                                        //Last parameter row
                                        <>
                                          <td className="px-2 py-2 border-b-2 text-sm border-r-2 border-gray-400">
                                            {param.parameter}
                                          </td>
                                          <td className="px-2 py-2 text-center text-sm border-b-2 border-r-2 border-gray-400">
                                            {[
                                              "Beginner",
                                              "Progressing",
                                              "Proficient",
                                            ].map((level) => {
                                              const selectedValue =
                                                selectedRecords.find(
                                                  (rec) =>
                                                    rec.student_id ===
                                                      student.student_id &&
                                                    rec.parameter_id ===
                                                      param.parameter_id
                                                )?.value;

                                              return (
                                                <label
                                                  key={level}
                                                  className="mr-4"
                                                >
                                                  <input
                                                    type="radio"
                                                    name={`param-${student.student_id}-${param.parameter_id}`}
                                                    value={level}
                                                    checked={
                                                      selectedValue === level
                                                    }
                                                    onChange={() =>
                                                      handleSelectParameter(
                                                        student.student_id,
                                                        param.parameter_id,
                                                        level
                                                      )
                                                    }
                                                  />
                                                  {level}
                                                </label>
                                              );
                                            })}
                                          </td>
                                        </>
                                      ) : pIndex === 0 ? (
                                        // First parameter row
                                        <>
                                          <td className="px-2 py-2 text-sm border-r-2 border-gray-400">
                                            {param.parameter}
                                          </td>
                                          <td className="px-2 py-2 text-center text-sm  border-r-2 border-gray-400">
                                            {[
                                              "Beginner",
                                              "Progressing",
                                              "Proficient",
                                            ].map((level) => {
                                              const selectedValue =
                                                selectedRecords.find(
                                                  (rec) =>
                                                    rec.student_id ===
                                                      student.student_id &&
                                                    rec.parameter_id ===
                                                      param.parameter_id
                                                )?.value;

                                              return (
                                                <label
                                                  key={level}
                                                  className="mr-4"
                                                >
                                                  <input
                                                    type="radio"
                                                    name={`param-${student.student_id}-${param.parameter_id}`}
                                                    value={level}
                                                    checked={
                                                      selectedValue === level
                                                    }
                                                    onChange={() =>
                                                      handleSelectParameter(
                                                        student.student_id,
                                                        param.parameter_id,
                                                        level
                                                      )
                                                    }
                                                  />
                                                  {level}
                                                </label>
                                              );
                                            })}
                                          </td>
                                        </>
                                      ) : (
                                        //Middle parameter rows
                                        <>
                                          <td className="px-2 py-2  text-sm border-r-2 border-gray-400">
                                            {param.parameter}
                                          </td>
                                          <td className="px-2 py-2 text-center text-sm  border-r-2 border-gray-400">
                                            {[
                                              "Beginner",
                                              "Progressing",
                                              "Proficient",
                                            ].map((level) => {
                                              const selectedValue =
                                                selectedRecords.find(
                                                  (rec) =>
                                                    rec.student_id ===
                                                      student.student_id &&
                                                    rec.parameter_id ===
                                                      param.parameter_id
                                                )?.value;

                                              return (
                                                <label
                                                  key={level}
                                                  className="mr-4"
                                                >
                                                  <input
                                                    type="radio"
                                                    name={`param-${student.student_id}-${param.parameter_id}`}
                                                    value={level}
                                                    checked={
                                                      selectedValue === level
                                                    }
                                                    onChange={() =>
                                                      handleSelectParameter(
                                                        student.student_id,
                                                        param.parameter_id,
                                                        level
                                                      )
                                                    }
                                                  />
                                                  {level}
                                                </label>
                                              );
                                            })}

                                            {/* Uncomment if you want inline validation error */}
                                            {/* {publishErrors[`${student.student_id}-${param.parameter_id}`] && (
        <p className="text-red-500 text-xs mt-1">
          {publishErrors[`${student.student_id}-${param.parameter_id}`]}
        </p>
      )} */}
                                          </td>
                                        </>
                                      )}
                                    </tr>
                                  ));
                                })
                              ) : (
                                <tr>
                                  <td
                                    colSpan={5}
                                    className="text-center text-xl text-red-700 py-4"
                                  >
                                    Oops! No data found..
                                  </td>
                                </tr>
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
                {/* )} */}
              </>
            )}
          </>
        </div>
      </div>
    </>
  );
};

export default Domain;
