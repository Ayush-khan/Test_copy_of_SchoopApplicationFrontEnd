import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";

const ReportCardRemark = () => {
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
  const [showPromotedColumn, setShowPromotedColumn] = useState(false);

  const [examOptions, setExamOptions] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
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

  const [promote, setPromote] = useState([]);
  const [selectedPromote, setSelectedPromote] = useState(null);

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
    term_id: null,
    exam_id: null,
    academic_yr: academic,
  });

  //   const [parameter, setParameter] = useState([]);

  useEffect(() => {
    fetchDataRoleId();
  }, []);

  useEffect(() => {
    if (!roleId || !regId) return; // guard against empty
    fetchClasses(roleId, regId);
  }, [roleId, regId]);

  useEffect(() => {
    if (!studentNameWithClassId || studentNameWithClassId.length === 0) return;

    // auto-fetch for first class only with class_id
    fetchtermsByClassId(studentNameWithClassId[0].class_id);
    fetchexamByClassId(studentNameWithClassId[0].class_id);
    fetchPromoteTo(studentNameWithClassId[0].class_id);
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

  const fetchPromoteTo = async (classId, termOrExamName) => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.get(
        `${API_URL}/api/get_promote_to_value?class_id=${classId}&term_name=${termOrExamName}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const mappedOptions = (response?.data?.options || []).map((opt) => ({
        value: String(opt), // ensure everything is a string
        label: opt,
      }));
      console.log("mapped ", mappedOptions);
      setPromote(mappedOptions);
    } catch (err) {
      console.error("Error fetching Promote To values:", err);
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

  const fetchexamByClassId = async (classId) => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.get(
        `${API_URL}/api/get_exambyclassid?class_id=${classId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const mappedExams =
        response?.data?.data?.map((exam) => ({
          label: exam.name,
          value: exam?.exam_id,
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

  //   const handleClassSelect = (selectedOption) => {
  //     setStudentError("");
  //     setSelectedStudent(selectedOption);

  //     setSelectedStudentId(selectedOption?.value); // class_id
  //     setSelectedSectionId(selectedOption?.section_id); // section_id

  //     console.log("selected class name", selectedOption.label);
  //     console.log("Selected class_id:", selectedOption?.value);
  //     console.log("Selected section_id:", selectedOption?.section_id);

  // const classNum = parseInt(
  //      //   selectedOption?.classname?.match(/\d+/)?.[0] || 0,
  //   10
  // );
  //   };

  const handleClassSelect = async (selectedOption) => {
    setStudentError("");
    setSelectedStudent(selectedOption);
    setSelectedStudentId(selectedOption?.value); // class_id
    setSelectedSectionId(selectedOption?.section_id); // section_id

    console.log("selected class name", selectedOption.label);
    console.log("Selected class_id:", selectedOption?.value);
    console.log("Selected section_id:", selectedOption?.section_id);

    // Extract numeric class name (e.g., "5", "9", "10", etc.)
    const classNum = parseInt(selectedOption?.classname, 10);

    // Reset previous term/exam options
    setTermsOptions([]);
    setSelectedTerms(null);
    setLoadingTermsData(true);

    // Use the selectedOption.value directly instead of waiting for state
    if (!isNaN(classNum) && classNum > 8) {
      console.log("Class above 8 → Fetch exams");
      await fetchexamByClassId(selectedOption.value);
    } else {
      console.log("Class 8 or below → Fetch terms");
      await fetchtermsByClassId();
    }
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

  const handleChange = (studentId, newValue) => {
    setSelectedRecords((prev) => {
      const existingIndex = prev.findIndex(
        (rec) => rec.student_id === studentId
      );

      console.log("student id", studentId);

      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex].value = newValue;
        return updated;
      } else {
        return [...prev, { student_id: studentId, value: newValue }];
      }
    });

    setPublishErrors((prev) => {
      if (prev[studentId] && newValue.trim() !== "") {
        const updatedErrors = { ...prev };
        delete updatedErrors[studentId];
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

  const [promotedValues, setPromotedValues] = useState([]);

  const handlePromoteChange = (studentId, promotedToValue) => {
    setPromotedValues((prev) => [
      ...prev,
      // [studentId]: String(promotedToValue),
      {
        value: promotedToValue,
        label: promotedToValue, // store as string
        student_id: studentId,
      },
    ]);

    console.log("fff", promotedValues);
  };

  const handleSearch = async () => {
    setLoadingForSearch(true);
    setStudentError("");
    setTermError("");

    // 🔹 Validation
    if (!selectedStudentId) {
      setStudentError("Please select class.");
      setLoadingForSearch(false);
      return;
    }
    if (!selectedSectionId) {
      setStudentError("Section is missing.");
      setLoadingForSearch(false);
      return;
    }
    if (!selectedTerms) {
      setTermError("Please select term.");
      setLoadingForSearch(false);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");

      // 🔹 Prepare filters
      const filters = {
        class_id: selectedStudentId,
        section_id: selectedSectionId,
        term_id: selectedTerms,
        academic_yr: academic,
      };

      setAppliedFilters(filters);
      setTimetable([]);

      // 🔹 Fetch report card remark data
      const response = await axios.get(
        `${API_URL}/api/get_reportcard_remark_value`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: filters,
        }
      );

      const data = response?.data?.data || [];

      if (!data.length) {
        toast.error("Report Card Remark data not found.");
        setTimetable([]);
        setSelectedRecords([]);
        setShowPromotedColumn(false);
      } else {
        console.log("Fetched remark data:", data);
        const checkPublish = response?.data?.publish || false;
        setCheckPublish(checkPublish);
        setTimetable(data);
        setPageCount(Math.ceil(data.length / pageSize));
        setShowStudentReport(true);

        // 🔹 Pre-select existing values
        const preSelected = [];
        data.forEach((student) => {
          if (student.value || student.remark) {
            preSelected.push({
              student_id: student.student_id,
              value: student.value || student.remark,
            });
          }
        });
        setSelectedRecords(preSelected);

        // 🔹 Check if last term/exam is selected
        const isLastTermSelected =
          termsOptions.length > 0 &&
          selectedTerms === termsOptions[termsOptions.length - 1].value;

        // 🔹 Show promoted column only if last term/exam
        setShowPromotedColumn(isLastTermSelected);

        // 🔹 Fetch "Promote To" values if last term selected
        if (isLastTermSelected) {
          const selectedTermName =
            termsOptions.find((t) => t.value === selectedTerms)?.label || "";

          await fetchPromoteTo(selectedStudentId, selectedTermName);
        }
      }
    } catch (error) {
      console.error("Error fetching Report Card Remark data:", error);
      toast.error("Error fetching Report Card Remark data. Please try again.");
      setShowPromotedColumn(false);
    } finally {
      setIsSubmitting(false);
      setLoadingForSearch(false);
    }
  };

  // const handleSubmit = async () => {
  //   if (isSaving) return;
  //   setIsSaving(true);

  //   try {
  //     if (!selectedRecords || selectedRecords.length === 0) {
  //       toast.error("Please select at least one student remark before saving.");
  //       setIsSaving(false);
  //       return;
  //     }
  //     // Use applied filters if user clicked Browse, else fallback to current selections
  //     const filtersToUse = appliedFilters || {
  //       term_id: selectedTerms,
  //       class_id: selectedStudentId,
  //       section_id: selectedSectionId,
  //       academic_yr: academic,
  //     };

  //     if (
  //       !filtersToUse.class_id ||
  //       !filtersToUse.section_id ||
  //       !filtersToUse.term_id
  //     ) {
  //       toast.error("Please select Class, Section, and Term before saving.");
  //       setIsSaving(false);
  //       return;
  //     }

  //     const payload = {
  //       ...filtersToUse,
  //       assessments: selectedRecords,
  //     };

  //     console.log("Submitting payload:", payload);

  //     const token = localStorage.getItem("authToken");
  //     const response = await axios.post(
  //       `${API_URL}/api/save_reportcardremark`,
  //       payload,
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );

  //     if (response?.data?.status === 200) {
  //       toast.success("Report Card Remark data saved successfully!");
  //       window.scrollTo({ top: 0, behavior: "smooth" });

  //       //  If save without Browse → still mark filters as applied
  //       if (!appliedFilters) {
  //         setAppliedFilters(filtersToUse);
  //       }

  //       setShowStudentReport(false);
  //     } else {
  //       toast.error(response?.data?.message || "Something went wrong");
  //     }
  //   } catch (error) {
  //     console.error("Error saving  Report Card Remark data", error);
  //     toast.error("Error saving data. Please try again.");
  //   } finally {
  //     setIsSaving(false);
  //   }
  // };

  const handleSubmit = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      if (!selectedRecords || selectedRecords.length === 0) {
        toast.error("Please enter remarks before saving.");
        setIsSaving(false);
        return;
      }

      // Use applied filters if user clicked Browse, else fallback to current selections
      const filtersToUse = appliedFilters || {
        term_id: selectedTerms,
        class_id: selectedStudentId,
        section_id: selectedSectionId,
        academic_yr: academic,
      };

      if (
        !filtersToUse.class_id ||
        !filtersToUse.section_id ||
        !filtersToUse.term_id
      ) {
        toast.error("Please select Class, Section, and Term before saving.");
        setIsSaving(false);
        return;
      }

      // 🔹 Prepare arrays for API
      const studentIds = [];
      const remarks = [];
      const promot = []; // If you handle promotedTo field

      selectedRecords.forEach((rec) => {
        studentIds.push(rec.student_id);
        remarks.push(rec.value || "");
        // If you store promoteTo separately, push here too
        promot.push(rec.promotedTo || ""); // keep empty if not applicable
      });

      // 🔹 Final payload
      const payload = {
        term_id: filtersToUse.term_id,
        class_id: filtersToUse.class_id,
        section_id: filtersToUse.section_id,
        student_id: studentIds,
        remark: remarks,
        promot,
      };

      console.log("Submitting payload:", payload);

      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        `${API_URL}/api/save_reportcardremark`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response?.data?.status === 200) {
        toast.success("Report Card Remark data saved successfully!");
        window.scrollTo({ top: 0, behavior: "smooth" });

        if (!appliedFilters) {
          setAppliedFilters(filtersToUse);
        }

        setShowStudentReport(false);
      } else {
        toast.error(response?.data?.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Error saving Report Card Remark data", error);
      toast.error("Error saving data. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // const handleSubmitPublish = async () => {
  //   if (isPublishing) return;

  //   // Make sure user has clicked Browse
  //   if (!appliedFilters) {
  //     toast.error(
  //       "Please select Class, Section, and Term and click Browse first."
  //     );
  //     return;
  //   }

  //   const newErrors = {};

  //   for (const student of timetable) {
  //     const record = selectedRecords.find(
  //       (rec) => rec.student_id === student.student_id
  //     );

  //     const value = record?.value?.trim() || "";

  //     if (!value) {
  //       newErrors[student.student_id] = "Remark is required.";

  //       setPublishErrors(newErrors);

  //       const firstErrorElement = document.querySelector(
  //         `[name="remark-${student.student_id}"]`
  //       );

  //       if (firstErrorElement) {
  //         firstErrorElement.scrollIntoView({
  //           behavior: "smooth",
  //           block: "center",
  //           inline: "center",
  //         });
  //         firstErrorElement.focus();
  //       }

  //       return; // stop after first missing remark
  //     }
  //   }

  //   //  No errors, proceed to publish
  //   setIsPublishing(true);
  //   try {
  //     const token = localStorage.getItem("authToken");

  //     const payload = {
  //       class_id: appliedFilters.class_id,
  //       section_id: appliedFilters.section_id,
  //       academic_yr: appliedFilters.academic_yr,
  //       assessments: selectedRecords,
  //     };

  //     const response = await axios.post(
  //       `${API_URL}/api/savenpublish_ReportCardRemark`,
  //       payload,
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );

  //     if (response?.data?.status === 200) {
  //       toast.success(
  //         "Report Card Remark data saved & published successfully!"
  //       );
  //       window.scrollTo({ top: 0, behavior: "smooth" });
  //       setShowStudentReport(false);
  //     }
  //   } catch (error) {
  //     console.error("Error saving Report Card Remark data:", error);
  //     toast.error("Error saving data. Please try again.");
  //   } finally {
  //     setIsPublishing(false);
  //   }
  // };

  // const handleSubmitUnPublish = async () => {
  //   if (isUnPublishing) return;

  //   // ✅ Check if user has browsed first
  //   if (!appliedFilters) {
  //     toast.error(
  //       "Please select Class, Section, and Term and click Browse first."
  //     );
  //     return;
  //   }

  //   setIsUnPublishing(true);
  //   setLoadingForSearch(true);

  //   try {
  //     setTimetable([]);
  //     const token = localStorage.getItem("authToken");

  //     const params = {
  //       class_id: appliedFilters.class_id,
  //       section_id: appliedFilters.section_id,
  //     };

  //     const response = await axios.get(
  //       `${API_URL}/api/unpublish_ReportCardRemark`,
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //         params,
  //       }
  //     );

  //     if (!response?.data?.data || response?.data?.data?.length === 0) {
  //       toast.success("Report Card Remark data unpublished successfully.");
  //       setShowStudentReport(false);
  //       setTimetable([]);
  //       setSelectedRecords([]);
  //       setCheckPublish("");
  //       // handleSearch(); // refresh with previous appliedFilters
  //     } else {
  //       const data = response.data.data;
  //       const checkPublish = response.data.publish;
  //       setCheckPublish(checkPublish);
  //       setTimetable(data);
  //       setPageCount(Math.ceil(data.length / pageSize));
  //       // setShowStudentReport(false);

  //       const preSelected = [];
  //       data.forEach((student) => {
  //         student.parameters.forEach((param) => {
  //           if (param.value) {
  //             preSelected.push({
  //               student_id: student.student_id,
  //               value: param.value,
  //             });
  //           }
  //         });
  //       });
  //       setSelectedRecords(preSelected);
  //     }
  //   } catch (error) {
  //     console.error("Error unpublishing Report Card Remark data:", error);
  //     toast.error("Error fetching Report Card Remark data. Please try again.");
  //   } finally {
  //     setIsUnPublishing(false);
  //     setLoadingForSearch(false);
  //   }
  // };

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
        className={` transition-all duration-500 w-[80%]  mx-auto p-4 ${showStudentReport ? "w-[80%] " : "w-[80%] "
          }`}
      >
        <ToastContainer />
        <div className="card rounded-md">
          {!showStudentReport && (
            <>
              <div className=" card-header mb-4 flex justify-between items-center ">
                <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
                  Report Card Remark
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
              <div className=" w-full md:w-[90%] flex justify-center flex-col md:flex-row gap-x-1 ml-0 p-2">
                <div className="w-full md:w-[99%] flex md:flex-row justify-between items-center mt-0 md:mt-4">
                  <div className="w-full md:w-[99%]  gap-x-0 md:gap-x-4 flex flex-col gap-y-2 md:gap-y-0 md:flex-row">
                    <div className="w-full md:w-[45%] gap-x-2   justify-around  my-1 md:my-4 flex md:flex-row ">
                      <label
                        className="md:w-[25%] text-md pl-0 md:pl-5 mt-1.5"
                        htmlFor="studentSelect"
                      >
                        Class <span className="text-sm text-red-500">*</span>
                      </label>
                      <div className=" w-full md:w-[60%]">
                        <Select
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          id="studentSelect"
                          value={selectedStudent}
                          onChange={handleClassSelect}
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

                    <div className="w-full  md:w-[40%] gap-x-2 justify-around my-1 md:my-4 flex md:flex-row">
                      <label className="w-full md:w-[35%] text-md pl-0 md:pl-5 mt-1.5">
                        Term <span className="text-sm text-red-500">*</span>
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
                        className={`btn h-10 w-18 md:w-auto btn-primary text-white font-bold py-1 border-1 border-blue-500 px-4 rounded ${loadingForSearch
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
                            Report Card Remark
                          </h3>
                          {/* <div className="flex items-center w-[60%] md:mr-36"> */}
                          <div className="flex items-center flex-1 max-w-3xl mx-auto">
                            <div className="flex flex-row flex-nowrap items-center gap-4 w-full overflow-x-auto bg-blue-50 border-l-2 border-r-2 border-pink-500 rounded-md shadow-md px-4 py-1">
                              {/* Class */}
                              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                                <label
                                  className="whitespace-nowrap text-sm sm:text-md"
                                  htmlFor="studentSelect"
                                >
                                  Class <span className="text-red-500">*</span>
                                </label>
                                <div className="flex-1 w-[60%]">
                                  <Select
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    id="studentSelect"
                                    value={selectedStudent}
                                    onChange={handleClassSelect}
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
                              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                                <label className="whitespace-nowrap text-sm sm:text-md">
                                  Term <span className="text-red-500">*</span>
                                </label>
                                <div className="flex-1 w-[40%]">
                                  <Select
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    styles={{
                                      control: (provided) => ({
                                        ...provided,
                                        minHeight: "28px",
                                        fontSize: ".9em",
                                      }),
                                      menuPortal: (provided) => ({
                                        ...provided,
                                        zIndex: 9999,
                                      }),
                                    }}
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
                                  className={`btn h-9 w-full btn-primary text-white font-bold px-3 rounded ${loadingForSearch
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

                      <div className="card-body w-[90%] ml-14">
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
                            // className="sticky top-0 bg-gray-200"
                            // style={{ zIndex: 10, position: "sticky" }}
                            >
                              <tr className="bg-gray-200">
                                <th className="w-[10%] px-2 py-2 text-center border border-gray-400 text-sm font-semibold text-gray-900">
                                  Sr No.
                                </th>

                                <th className="w-[10%] px-2 py-2 text-center border border-gray-400 text-sm font-semibold text-gray-900">
                                  Roll No.
                                </th>

                                <th className="w-[40%] px-3 py-2 text-center border border-gray-400 text-sm font-semibold text-gray-900">
                                  Student Name
                                </th>

                                <th className="w-[40%] px-3 py-2 text-center border border-gray-400 text-sm font-semibold text-gray-900">
                                  Remark
                                </th>

                                {/* <tr className="bg-gray-200">
                                {[
                                  "Sr No.",
                                  "Roll No.",
                                  "Student Name",
                                  "Remark",
                                ].map((header, index) => (
                                  <th
                                    key={index}
                                    className="px-2 text-center lg:px-3 py-2 border border-gray-400 text-sm font-semibold text-gray-900 tracking-wider"
                                  >
                                    {header}
                                  </th>
                                ))} */}

                                {/* {showPromotedColumn && (
                                  <th className="px-2 text-center lg:px-3 py-2 border border-gray-400 text-sm font-semibold text-gray-900 tracking-wider">
                                    Promoted To
                                  </th>
                                )} */}
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
                                timetable.map((student, index) => {
                                  const record = selectedRecords.find(
                                    (rec) =>
                                      rec.student_id === student.student_id
                                  );
                                  const selectedValue = record
                                    ? record.value
                                    : student.remark || "";

                                  return (
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
                                        {toCamelCase(
                                          student.student_name || ""
                                        )}
                                      </td>

                                      {/* Example editable field */}
                                      <td className="px-2 py-1 text-center border border-gray-400">
                                        <textarea
                                          type="textarea"
                                          name={`remark-${student.student_id}`}
                                          value={selectedValue}
                                          onChange={(e) =>
                                            handleChange(
                                              student.student_id,
                                              e.target.value
                                            )
                                          }
                                          className="w-full p-1 border rounded text-sm"
                                          maxLength={500}
                                          rows={2}
                                        />

                                        {publishErrors?.[
                                          student.student_id
                                        ] && (
                                            <span className="text-red-500 text-xs mt-1 block">
                                              {publishErrors[student.student_id]}
                                            </span>
                                          )}
                                      </td>

                                      {/* {showPromotedColumn && (
                                        <td className="px-2 py-1  border-gray-400">
                                          <div className="flex justify-center">
                                            <Select
                                              options={promote}
                                              value={
                                                promotedValues.find(
                                                  (opt) =>
                                                    opt.student_id ===
                                                    student.student_id
                                                ) || null
                                              }
                                              onChange={(option) =>
                                                handlePromoteChange(
                                                  student.student_id,
                                                  option?.value
                                                )
                                              }
                                              placeholder="Select class"
                                              isClearable
                                              className="text-sm"
                                              menuPortalTarget={document.body}
                                              menuPosition="fixed" // ← add this
                                              styles={{
                                                control: (provided) => ({
                                                  ...provided,
                                                  minHeight: "28px",
                                                  fontSize: ".9em",
                                                }),
                                                menuPortal: (provided) => ({
                                                  ...provided,
                                                  zIndex: 9999,
                                                }),
                                              }}
                                            />
                                          </div>
                                        </td>
                                      )} */}
                                    </tr>
                                  );
                                })
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

                              {/* {checkPublish === "Y" ? (
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
                              )} */}

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

export default ReportCardRemark;
