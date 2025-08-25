import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";

const UpdateClasswiseStudentDetails = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [searchTerm, setSearchTerm] = useState("");

  const [classesforForm, setClassesforForm] = useState([]);

  const [classIdForSearch, setClassIdForSearch] = useState(null);

  const [nameError, setNameError] = useState("");
  const [nameErrorForClass, setNameErrorForClass] = useState("");
  const [nameErrorForDivision, setNameErrorForDivision] = useState("");
  const [nameErrorForField, setNameErrorForField] = useState("");
  const [nameErrorForStudent, setNameErrorForStudent] = useState("");

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedClassForStudent, setSelectedClassForStudent] = useState(null);
  const [studentInformation, setstudentInformation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingForSearch, setLoadingForSearch] = useState(false);

  const navigate = useNavigate();

  // for form
  const [errors, setErrors] = useState({});
  const [backendErrors, setBackendErrors] = useState({});

  const [loadingClasses, setLoadingClasses] = useState(false);

  const [loadingDivision, setLoadingDivision] = useState(false);
  const [divisionforForm, setDivisionForForm] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState(null);

  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState("");
  const [selectedFieldId, setSelectedFieldId] = useState("");
  const [selectedFieldData, setSelectedFieldData] = useState("");

  const [pendingChanges, setPendingChanges] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFieldData, setActiveFieldData] = useState(null);

  const studentRefs = useRef({});

  const fetchClasses = async () => {
    try {
      setLoadingClasses(true);
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${API_URL}/api/getClassList`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(response.data)) {
        setClassesforForm(response.data);
      } else {
        toast.error("Unexpected Data Format");
      }
    } catch (error) {
      toast.error("Error fetching classes");
      console.error("Error fetching classes", error);
    } finally {
      setLoadingClasses(false);
    }
  };

  const classOptions = useMemo(
    () =>
      classesforForm.map((cls) => ({
        value: cls.class_id,
        label: cls.name,
      })),
    [classesforForm]
  );

  const fetchDivisions = async (classId) => {
    try {
      setLoadingDivision(true);
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/api/get_divisions/${classId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Divisions API Response:", response.data); // Debug log

      // Check if the 'divisions' key exists and contains an array
      if (Array.isArray(response.data.divisions)) {
        setDivisionForForm(response.data.divisions); // Set divisions if valid
      } else {
        toast.error("Unexpected Data Format.");
        setDivisionForForm([]); // Fallback to empty array
      }
    } catch (error) {
      toast.error("Error fetching divisions");
      console.error("Error fetching divisions", error);
    } finally {
      setLoadingDivision(false);
    }
  };

  const divisionOptions = useMemo(() => {
    if (!Array.isArray(divisionforForm)) return [];
    return divisionforForm.map((div) => ({
      value: div.section_id, // Using 'section_id' as the value
      label: div.name, // Using 'name' as the label
    }));
  }, [divisionforForm]);

  const handleClassSelect = (selectedOption) => {
    setSelectedClass(selectedOption);
    setNameErrorForClass("");

    setSelectedDivision(null); // Reset division dropdown
    setDivisionForForm([]); // Clear division options
    setClassIdForSearch(selectedOption?.value);

    if (selectedOption) {
      fetchDivisions(selectedOption.value); // Fetch divisions for the selected class
    }
  };

  const handleDivisionSelect = (selectedOption) => {
    setSelectedDivision(selectedOption); // Ensure correct value is set
    setNameErrorForDivision("");
  };

  const fetchFields = async () => {
    try {
      setLoadingClasses(true);
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/api/get_studenttablefieldsforUpdate`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.data) {
        setFields(response.data.data);
        console.log("fileds data", response.data.data);
      } else {
        toast.error("Unexpected Data Format");
      }
    } catch (error) {
      toast.error("Error fetching fileds");
      console.error("Error fetching fields", error);
    } finally {
      setLoadingClasses(false);
    }
  };

  const fieldOptions = useMemo(
    () =>
      fields.map((cls) => ({
        value: cls.column_name, // used by react-select or dropdown
        label: cls.label,
        fullData: cls, // keep full field object
      })),
    [fields]
  );

  // const handleFieldSelect = (selectedOption) => {
  //   setSelectedField(selectedOption); // full option with fullData
  //   setNameErrorForField("");
  //   setSelectedFieldId(selectedOption?.value); // just column_name
  //   setSelectedFieldData(selectedOption?.fullData || null); // store full field details
  // };

  const handleFieldSelect = (selectedOption) => {
    setSelectedField(selectedOption);
    setNameErrorForField("");

    setSelectedFieldId(selectedOption?.value);
    setSelectedFieldData(selectedOption?.fullData || null);
  };
  const handleSearch = async () => {
    setNameError("");
    setSearchTerm("");
    setNameErrorForClass("");
    setNameErrorForDivision("");
    setNameErrorForField("");

    setNameErrorForStudent("");
    setErrors({});

    let hasError = false;
    if (!selectedClass) {
      setNameErrorForClass("Please select a class.");
      hasError = true;
    }

    if (!selectedDivision) {
      setNameErrorForDivision("Please select a division.");
      hasError = true;
    }

    if (!selectedField) {
      setNameErrorForField("Please select a field.");
      hasError = true;
    }
    setActiveFieldData(selectedFieldData);

    if (hasError) return;

    try {
      setstudentInformation(null);
      setSelectedClassForStudent(null);
      setSelectedClassForStudent([]);
      setSelectedStudents([]);
      setSelectAll(false);
      setLoadingForSearch(true);
      const token = localStorage.getItem("authToken");

      const sectionId = selectedDivision?.value;
      console.log("Section ID:", sectionId);

      const fieldId = selectedFieldId;
      console.log("fileds id", fieldId);

      const fieldData = selectedFieldData;
      console.log("fileds data", fieldData);

      if (!sectionId) {
        toast.error("Invalid division selection.");
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/get_studentdatawithfielddata/${sectionId}/${fieldId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response?.data) {
        const fetchedData = response?.data;
        console.log("fetched data", fetchedData);
        setstudentInformation(response?.data?.data);
        setPendingChanges([]);
      } else {
        toast.error("No data found for the selected class.");
      }
    } catch (error) {
      console.log("Error:", error);
      console.log("Error Response:", error.response);
    } finally {
      setLoadingForSearch(false);
    }
  };

  const validateStudents = () => {
    let firstInvalidField = null;
    const errors = {};

    const updatedStudentInformation = studentInformation.map((student) => {
      let studentHasError = false;
      const field = selectedFieldData;
      const pending = pendingChanges.find(
        (s) => s.student_id === student.student_id
      );
      const fieldValue =
        pending?.[field.column_name] ?? student[field.column_name];
      const fieldKey = `${student.student_id}-${field.column_name}`;

      // Required check
      if (
        !field.nullable &&
        (!fieldValue || fieldValue.toString().trim() === "")
      ) {
        studentHasError = true;
        errors[fieldKey] = `${field.label} is required`;
      }

      // Max length check
      if (
        field.max_length &&
        fieldValue &&
        fieldValue.length > field.max_length
      ) {
        studentHasError = true;
        errors[
          fieldKey
        ] = `${field.label} must not exceed ${field.max_length} characters`;
      }

      // Data type validation
      if (
        field.data_type === "int" &&
        fieldValue &&
        isNaN(Number(fieldValue))
      ) {
        studentHasError = true;
        errors[fieldKey] = `${field.label} must be a number`;
      }

      if (field.data_type === "date" && fieldValue) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(fieldValue)) {
          studentHasError = true;
          errors[fieldKey] = `${field.label} must be in YYYY-MM-DD format`;
        }
      }

      if (
        (field.input_type === "radio" || field.input_type === "dropdown") &&
        field.options
      ) {
        const options = JSON.parse(field.options || "[]");
        const allowedValues = options.map((o) => o.option);

        if (fieldValue && !allowedValues.includes(fieldValue)) {
          studentHasError = true;
          errors[
            fieldKey
          ] = `${field.label} must be one of the allowed options`;
        }
      }

      if (field.input_type === "select" && field.options) {
        try {
          const options = JSON.parse(field.options || "[]");
          // IMPORTANT: Use `o.value` for validation (this is usually what gets submitted)
          const allowedValues = options.map((o) => o.value);

          if (fieldValue && !allowedValues.includes(fieldValue)) {
            studentHasError = true;
            errors[
              fieldKey
            ] = `${field.label} must be one of the allowed options`;
          }
        } catch (err) {
          console.error("Invalid options JSON for select:", field.options);
        }
      }

      return { ...student, hasError: studentHasError };
    });

    const firstInvalidStudent = updatedStudentInformation.find(
      (s) => s.hasError
    );

    if (firstInvalidStudent) {
      console.log("Validation errors found:", errors);

      Object.keys(errors).forEach((key) => {
        const fieldElement = studentRefs.current[key];
        if (fieldElement) {
          fieldElement.classList.add("border-red-500", "ring-red-300");
          if (!firstInvalidField) firstInvalidField = fieldElement;
        }
      });

      const firstErrorMessage = Object.values(errors)[0];
      toast.error(firstErrorMessage || "Please fix the highlighted errors.");

      if (firstInvalidField) {
        firstInvalidField.focus();
        firstInvalidField.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }

      return false;
    }

    return true;
  };

  const getDisplayValue = (fieldData, rawValue) => {
    if (!fieldData) return rawValue ?? "—";

    if (
      (fieldData.input_type === "select" ||
        fieldData.input_type === "radio" ||
        fieldData.input_type === "dropdown") &&
      fieldData.options
    ) {
      try {
        const options = JSON.parse(fieldData.options || "[]");
        const match = options.find((o) => o.option === rawValue);
        return match ? match.value : rawValue || "—"; // show label if found
      } catch (err) {
        console.error("Invalid options JSON", err);
      }
    }

    return rawValue ?? "—";
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const payload = {
        students: pendingChanges.map((change) => ({
          student_id: change.student_id,
          [selectedFieldData.column_name]:
            change[selectedFieldData.column_name] || null,
        })),
      };

      const response = await axios.put(
        `${API_URL}/api/update_studentdatawithfielddata`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        toast.success("Student details updated successfully!");
        setPendingChanges([]);
        setIsModalOpen(false);
        handleSearch();
      } else {
        toast.error(
          `Failed to update student details. Status: ${response.status}`
        );
      }
    } catch (error) {
      console.error("Full API Error Response:", error.response);
      toast.error(`${error.response?.data?.message || error.message}`);
    }
  };

  const handleInputChange = (e, studentId, fieldName) => {
    const { value } = e.target;

    setPendingChanges((prev) => {
      const updated = prev.some((s) => s.student_id === studentId)
        ? prev.map((s) =>
            s.student_id === studentId
              ? { ...s, [fieldName]: value, hasChanged: true }
              : s
          )
        : [
            { student_id: studentId, [fieldName]: value, hasChanged: true },
            ...prev,
          ];

      return updated;
    });
    let error = "";

    const fieldArray = Array.isArray(selectedFieldData)
      ? selectedFieldData
      : [selectedFieldData];

    const fieldMeta = fieldArray.find(
      (field) => field.column_name === fieldName
    );

    if (fieldMeta) {
      if (!fieldMeta.nullable && (!value || value.toString().trim() === "")) {
        error = `${fieldMeta.label || fieldName} is required.`;
      } else if (
        fieldMeta.max_length &&
        value &&
        value.length > fieldMeta.max_length
      ) {
        error = `${fieldMeta.label || fieldName} must not exceed ${
          fieldMeta.max_length
        } characters.`;
      } else if (
        fieldMeta.data_type === "int" &&
        value &&
        isNaN(Number(value))
      ) {
        error = `${fieldMeta.label || fieldName} must be a number.`;
      } else if (fieldMeta.data_type === "date" && value) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(value)) {
          error = `${
            fieldMeta.label || fieldName
          } must be in YYYY-MM-DD format.`;
        }
      } else if (
        (fieldMeta.input_type === "radio" ||
          fieldMeta.input_type === "dropdown") &&
        fieldMeta.options
      ) {
        try {
          const options = JSON.parse(fieldMeta.options || "[]");
          if (value && !options.includes(value)) {
            error = `${
              fieldMeta.label || fieldName
            } must be one of the allowed options.`;
          }
        } catch {
          console.warn(
            "Invalid JSON in field options for",
            fieldMeta.column_name
          );
        }
      }
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [studentId]: {
        ...prevErrors[studentId],
        [fieldName]: error,
      },
    }));

    setBackendErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      if (newErrors[studentId] && newErrors[studentId][fieldName]) {
        delete newErrors[studentId][fieldName];
        if (Object.keys(newErrors[studentId]).length === 0) {
          delete newErrors[studentId];
        }
      }
      return newErrors;
    });
  };

  const formatFullName = (first, middle, last) => {
    return [first, middle, last]
      .filter(Boolean) // remove null/undefined/empty
      .map((name) => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase())
      .join(" ");
  };

  //   const filteredParents = useMemo(() => {
  //     if (!Array.isArray(studentInformation)) return [];

  //     // if no search term entered, return all
  //     if (!searchTerm) return studentInformation;

  //     const searchLower = searchTerm.toLowerCase();

  //     return studentInformation.filter((student) => {
  //       // if a field is selected → search by that column_name
  //       if (selectedFieldData?.column_name) {
  //         const fieldValue = student[selectedFieldData.column_name];
  //         return (
  //           fieldValue !== null &&
  //           fieldValue.toString().toLowerCase().includes(searchLower)
  //         );
  //       }
  //     });
  //   }, [studentInformation, searchTerm, selectedFieldData]);

  // helper to build formatted full name

  // ✅ helper function to format full name

  const formatName = (student) =>
    `${student.first_name || ""} ${student.mid_name || ""} ${
      student.last_name || ""
    }`
      .replace(/\s+/g, " ")
      .trim();

  const filteredParents = useMemo(() => {
    if (!Array.isArray(studentInformation)) return [];

    if (!searchTerm) return studentInformation;

    const searchLower = searchTerm.trim().toLowerCase();

    return studentInformation.filter((student) => {
      const fullName = formatName(student).toLowerCase();
      return fullName.includes(searchLower);
    });
  }, [studentInformation, searchTerm]);

  console.log("Filtered Students:", filteredParents);

  useEffect(() => {
    fetchClasses();
    fetchFields();
  }, [classIdForSearch]);

  const handleNavigation = () => {
    navigate("/dashboard");
  };

  return (
    <div>
      <ToastContainer />

      <div className="md:mx-auto md:w-[90%] p-4 bg-white mt-4 ">
        <div className=" w-full flex justify-between items-center ">
          <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
            Update Classwise Student Details
          </h3>
          <RxCross1
            className="text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
            type="button"
            onClick={handleNavigation}
          />
        </div>
        <div
          className=" relative  mb-8   h-1  mx-auto bg-red-700"
          style={{
            backgroundColor: "#C03078",
          }}
        ></div>
        <div className="w-full md:container mt-1">
          {/* Search Section */}
          {/* <div className="pt-2 md:pt-4"></div> */}
          <div className="pt-8 w-full md:w-[85%]  relative ml-0 md:ml-[10%]  border-1 flex  flex-col md:flex-row gap-x-1  bg-white rounded-lg mt-2 md:mt-6 p-2 ">
            <div className="w-full flex md:flex-row  items-center">
              <div className="w-full  flex flex-col gap-y-2 md:gap-y-0 md:flex-row">
                <div className="w-full gap-x-1 md:gap-x-6  my-1 md:my-4 flex md:flex-row ">
                  <label
                    className="text-md mt-1.5 mr-1 md:mr-0 inline-flex"
                    htmlFor="classSelect"
                  >
                    Class <span className="text-red-500">*</span>
                  </label>

                  <div className="w-full md:w-[28%]">
                    <Select
                      id="classSelect"
                      value={selectedClass}
                      onChange={handleClassSelect}
                      options={classOptions}
                      placeholder={
                        loadingClasses ? "Loading classes..." : "Select"
                      }
                      isSearchable
                      isClearable
                      className="text-sm"
                      styles={{
                        menu: (provided) => ({
                          ...provided,
                          zIndex: 1050, // Set your desired z-index value
                        }),
                      }}
                      isDisabled={loadingClasses}
                    />
                    {nameErrorForClass && (
                      <div className="h-8 relative ml-1 text-danger text-xs">
                        {nameErrorForClass}
                      </div>
                    )}
                  </div>

                  <label
                    className="text-md mt-1.5 mr-1 md:mr-0 inline-flex"
                    htmlFor="divisionSelect"
                  >
                    Division <span className="text-red-500">*</span>
                  </label>

                  <div className="w-full md:w-[28%]">
                    <Select
                      id="divisionSelect"
                      value={selectedDivision}
                      onChange={handleDivisionSelect}
                      options={divisionOptions}
                      placeholder={
                        loadingClasses ? "Loading divisions..." : "Select"
                      }
                      isSearchable
                      isClearable
                      className="text-sm"
                      styles={{
                        menu: (provided) => ({
                          ...provided,
                          zIndex: 1050, // Set your desired z-index value
                        }),
                      }}
                      isDisabled={loadingDivision}
                    />
                    {nameErrorForDivision && (
                      <div className="h-8 relative ml-1 text-danger text-xs">
                        {nameErrorForDivision}
                      </div>
                    )}
                  </div>

                  <label
                    className="text-md mt-1.5 mr-3 md:mr-0 inline-flex"
                    htmlFor="divisionSelect"
                  >
                    Fields <span className="text-red-500">*</span>
                  </label>

                  <div className="w-full md:w-[38%]">
                    <Select
                      id="divisionSelect"
                      value={selectedField}
                      onChange={handleFieldSelect}
                      options={fieldOptions}
                      placeholder={
                        loadingClasses ? "Loading Fields..." : "Select"
                      }
                      isSearchable
                      isClearable
                      className="text-sm"
                      styles={{
                        menu: (provided) => ({
                          ...provided,
                          zIndex: 1050, // Set your desired z-index value
                        }),
                      }}
                      isDisabled={loadingDivision}
                    />
                    {nameErrorForField && (
                      <div className="h-8 relative ml-1 text-danger text-xs">
                        {nameErrorForField}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="search"
                  onClick={handleSearch}
                  style={{ backgroundColor: "#2196F3" }}
                  className={`my-1 md:my-4 ml-3 btn h-10 w-18 md:w-auto btn-primary text-white font-bold py-1 border-1 border-blue-500 px-4 rounded ${
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
                      Loading...
                    </span>
                  ) : (
                    "Browse"
                  )}
                </button>
              </div>
            </div>
          </div>
          {/* Form Section - Displayed when studentInformation is fetched */}
          {studentInformation && (
            <div className="w-full md:container mx-auto py-4 px-4 ">
              <div className="card mx-auto w-full shadow-lg">
                <div className="p-1 px-3 bg-gray-100 flex justify-between items-center">
                  <h6 className="text-gray-700 mt-1 text-lg ">Student List</h6>
                  <div className="box-border flex md:gap-x-2  ">
                    <div className=" w-1/2 md:w-fit mr-1">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search"
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div
                  className=" relative w-[97%] h-1  mx-auto bg-red-700"
                  style={{
                    backgroundColor: "#C03078",
                  }}
                ></div>
                <div className="card-body w-full ">
                  <div className="h-96 lg:h-96 overflow-y-scroll lg:overflow-x-hidden w-full mx-auto">
                    <div className="bg-white rounded-lg shadow-xs">
                      <table className="min-w-full leading-normal table-auto">
                        <thead className=" ">
                          <tr className="bg-gray-200 ">
                            <th className="px-2 w-full md:w-[7%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Sr. No.
                            </th>
                            <th className="px-2 w-full md:w-[8%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Roll No
                            </th>
                            <th className="px-2 w-full md:w-[40%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Student Name
                            </th>
                            {/* {selectedFieldData && (
                              <th className="px-2 w-full md:w-[20%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                {selectedFieldData.label ||
                                  selectedFieldData.column_name}
                              </th>
                            )} */}
                            {activeFieldData && (
                              <th className="px-2 w-full md:w-[20%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold">
                                {activeFieldData.label ||
                                  activeFieldData.column_name}
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredParents.length ? (
                            filteredParents.map((student, index) => (
                              <tr
                                key={student.student_id}
                                className={`${
                                  index % 2 === 0 ? "bg-white" : "bg-gray-100"
                                } hover:bg-gray-50`}
                              >
                                <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                                  <p className="text-gray-900 whitespace-no-wrap relative top-2">
                                    {index + 1}
                                  </p>
                                </td>

                                <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm p-1">
                                  <p className="text-gray-900 whitespace-no-wrap relative top-2">
                                    {student.roll_no === 0
                                      ? "0"
                                      : student.roll_no || ""}
                                  </p>
                                </td>
                                <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                                  <p className="text-gray-900 whitespace-no-wrap relative top-2">
                                    {formatFullName(
                                      student.first_name,
                                      student.mid_name,
                                      student.last_name
                                    )}
                                  </p>
                                </td>

                                {/* {selectedFieldData && (
                                  <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                                    {(() => {
                                      const colName =
                                        selectedFieldData.column_name;
                                      const value = student[colName] || "";

                                      switch (selectedFieldData.input_type) {
                                        case "text":
                                          return (
                                            <input
                                              type="text"
                                              value={
                                                pendingChanges.find(
                                                  (s) =>
                                                    s.student_id ===
                                                    student.student_id
                                                )?.[colName] ??
                                                student[colName] ??
                                                ""
                                              }
                                              onChange={(e) =>
                                                handleInputChange(
                                                  e,
                                                  student.student_id,
                                                  colName
                                                )
                                              }
                                              maxLength={
                                                selectedFieldData.max_length ||
                                                undefined
                                              }
                                              ref={(el) => {
                                                if (el) {
                                                  studentRefs.current[
                                                    `${student.student_id}-${colName}`
                                                  ] = el;
                                                }
                                              }}
                                              className={`border rounded px-2 py-1 text-sm w-full ${
                                                errors[student.student_id]?.[
                                                  colName
                                                ]
                                                  ? "border-red-500"
                                                  : ""
                                              }`}
                                            />
                                          );

                                        case "number":
                                          return (
                                            <input
                                              type="text"
                                              inputMode="numeric"
                                              pattern="[0-9]*"
                                              maxLength={
                                                selectedFieldData.max_length ||
                                                undefined
                                              }
                                              value={
                                                pendingChanges.find(
                                                  (s) =>
                                                    s.student_id ===
                                                    student.student_id
                                                )?.[colName] ??
                                                student[colName] ??
                                                ""
                                              }
                                              className={`border rounded px-2 py-1 text-sm w-full ${
                                                errors[student.student_id]?.[
                                                  colName
                                                ]
                                                  ? "border-red-500"
                                                  : ""
                                              }`}
                                              placeholder={
                                                selectedFieldData.label
                                              }
                                              required={
                                                selectedFieldData.nullable === 0
                                              }
                                              onChange={(e) =>
                                                handleInputChange(
                                                  e,
                                                  student.student_id,
                                                  colName
                                                )
                                              }
                                              ref={(el) => {
                                                if (el) {
                                                  studentRefs.current[
                                                    `${student.student_id}-${colName}`
                                                  ] = el;
                                                }
                                              }}
                                            />
                                          );

                                        case "date":
                                          return (
                                            <input
                                              type="date"
                                              value={
                                                pendingChanges.find(
                                                  (s) =>
                                                    s.student_id ===
                                                    student.student_id
                                                )?.[colName] ??
                                                (student[colName]
                                                  ? student[colName].split(
                                                      "T"
                                                    )[0]
                                                  : "")
                                              }
                                              className={`border rounded px-2 py-1 text-sm w-full ${
                                                errors[student.student_id]?.[
                                                  colName
                                                ]
                                                  ? "border-red-500"
                                                  : ""
                                              }`}
                                              required={
                                                selectedFieldData.nullable === 0
                                              }
                                              onChange={(e) =>
                                                handleInputChange(
                                                  e,
                                                  student.student_id,
                                                  colName
                                                )
                                              }
                                              maxLength={
                                                selectedFieldData.max_length ||
                                                undefined
                                              }
                                              ref={(el) => {
                                                if (el) {
                                                  studentRefs.current[
                                                    `${student.student_id}-${colName}`
                                                  ] = el;
                                                }
                                              }}
                                            />
                                          );

                                        // case "select":
                                        //   if (selectedFieldData.options) {
                                        //     const options = JSON.parse(
                                        //       selectedFieldData.options
                                        //     );
                                        //     const selectedValue =
                                        //       pendingChanges.find(
                                        //         (s) =>
                                        //           s.student_id ===
                                        //           student.student_id
                                        //       )?.[colName] ??
                                        //       student[colName] ??
                                        //       "";
                                        //     return (
                                        //       <select
                                        //         value={selectedValue}
                                        //         className={`border rounded px-2 py-1 text-sm w-full ${
                                        //           errors[student.student_id]?.[
                                        //             colName
                                        //           ]
                                        //             ? "border-red-500"
                                        //             : ""
                                        //         }`}
                                        //         required={
                                        //           selectedFieldData.nullable ===
                                        //           0
                                        //         }
                                        //         onChange={(e) =>
                                        //           handleInputChange(
                                        //             e,
                                        //             student.student_id,
                                        //             colName
                                        //           )
                                        //         }
                                        //         maxLength={
                                        //           selectedFieldData.max_length ||
                                        //           undefined
                                        //         }
                                        //         ref={(el) => {
                                        //           if (el) {
                                        //             studentRefs.current[
                                        //               `${student.student_id}-${colName}`
                                        //             ] = el;
                                        //           }
                                        //         }}
                                        //       >
                                        //         <option value="">
                                        //           -- Select --
                                        //         </option>
                                        //         {options.map((opt, i) => (
                                        //           <option
                                        //             key={i}
                                        //             value={opt.option || opt}
                                        //           >
                                        //             {opt.value || opt}
                                        //           </option>
                                        //         ))}
                                        //       </select>
                                        //     );
                                        //   }
                                        //   // return <span>{value}</span>;
                                        //   return (
                                        //     <span>{student[colName]}</span>
                                        //   );

                                        case "select":
                                          if (selectedFieldData.options) {
                                            const options = JSON.parse(
                                              selectedFieldData.options || "[]"
                                            );
                                            const selectedValue =
                                              pendingChanges.find(
                                                (s) =>
                                                  s.student_id ===
                                                  student.student_id
                                              )?.[colName] ??
                                              student[colName] ??
                                              "";

                                            return (
                                              <select
                                                value={selectedValue}
                                                className={`border rounded px-2 py-1 text-sm w-full ${
                                                  errors[student.student_id]?.[
                                                    colName
                                                  ]
                                                    ? "border-red-500"
                                                    : ""
                                                }`}
                                                required={
                                                  selectedFieldData.nullable ===
                                                  0
                                                }
                                                onChange={(e) =>
                                                  handleInputChange(
                                                    e,
                                                    student.student_id,
                                                    colName
                                                  )
                                                }
                                                maxLength={
                                                  selectedFieldData.max_length ||
                                                  undefined
                                                }
                                                ref={(el) => {
                                                  if (el) {
                                                    studentRefs.current[
                                                      `${student.student_id}-${colName}`
                                                    ] = el;
                                                  }
                                                }}
                                              >
                                                <option value="">
                                                  -- Select --
                                                </option>
                                                {options.map((opt, i) => (
                                                  <option
                                                    key={i}
                                                    value={opt.value}
                                                  >
                                                    {opt.option}
                                                  </option>
                                                ))}
                                              </select>
                                            );
                                          }
                                          return (
                                            <span>{student[colName]}</span>
                                          );

                                        case "radio": {
                                          const radioValue =
                                            pendingChanges.find(
                                              (s) =>
                                                s.student_id ===
                                                student.student_id
                                            )?.[colName] ??
                                            student[colName] ??
                                            "";

                                          return (
                                            <div className="flex items-center justify-center gap-2">
                                              {JSON.parse(
                                                selectedFieldData.options ||
                                                  "[]"
                                              ).map((opt, i) => (
                                                <label
                                                  key={i}
                                                  className="flex items-center gap-1 text-sm"
                                                >
                                                  <input
                                                    type="radio"
                                                    name={`radio-${student.student_id}-${colName}`} // unique per row
                                                    value={opt.option}
                                                    checked={
                                                      radioValue === opt.option
                                                    }
                                                    required={
                                                      selectedFieldData.nullable ===
                                                      0
                                                    }
                                                    onChange={(e) =>
                                                      handleInputChange(
                                                        e,
                                                        student.student_id,
                                                        colName
                                                      )
                                                    }
                                                    maxLength={
                                                      selectedFieldData.max_length ||
                                                      undefined
                                                    }
                                                    ref={(el) => {
                                                      if (el) {
                                                        studentRefs.current[
                                                          `${student.student_id}-${colName}`
                                                        ] = el;
                                                      }
                                                    }}
                                                  />
                                                  {opt.value}
                                                </label>
                                              ))}
                                            </div>
                                          );
                                        }

                                        case "textarea": {
                                          const textareaValue =
                                            pendingChanges.find(
                                              (s) =>
                                                s.student_id ===
                                                student.student_id
                                            )?.[colName] ??
                                            student[colName] ??
                                            "";
                                          return (
                                            <textarea
                                              value={textareaValue}
                                              maxLength={
                                                selectedFieldData.max_length ||
                                                undefined
                                              }
                                              className={`border rounded px-2 py-1 text-sm w-full m-1 ${
                                                errors[student.student_id]?.[
                                                  colName
                                                ]
                                                  ? "border-red-500"
                                                  : ""
                                              }`}
                                              placeholder={
                                                selectedFieldData.label
                                              }
                                              required={
                                                selectedFieldData.nullable === 0
                                              }
                                              onChange={(e) =>
                                                handleInputChange(
                                                  e,
                                                  student.student_id,
                                                  colName
                                                )
                                              }
                                              ref={(el) => {
                                                if (el) {
                                                  studentRefs.current[
                                                    `${student.student_id}-${colName}`
                                                  ] = el;
                                                }
                                              }}
                                              rows={3}
                                            />
                                          );
                                        }

                                        default:
                                          return <span>{value}</span>;
                                      }
                                    })()}
                                  </td>
                                )} */}

                                {activeFieldData && (
                                  <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                                    {(() => {
                                      const colName =
                                        activeFieldData.column_name;
                                      const value = student[colName] || "";

                                      switch (activeFieldData.input_type) {
                                        case "text":
                                          return (
                                            <input
                                              type="text"
                                              value={
                                                pendingChanges.find(
                                                  (s) =>
                                                    s.student_id ===
                                                    student.student_id
                                                )?.[colName] ??
                                                student[colName] ??
                                                ""
                                              }
                                              onChange={(e) =>
                                                handleInputChange(
                                                  e,
                                                  student.student_id,
                                                  colName
                                                )
                                              }
                                              maxLength={
                                                activeFieldData.max_length ||
                                                undefined
                                              }
                                              ref={(el) => {
                                                if (el) {
                                                  studentRefs.current[
                                                    `${student.student_id}-${colName}`
                                                  ] = el;
                                                }
                                              }}
                                              className={`border rounded px-2 py-1 text-sm w-full ${
                                                errors[student.student_id]?.[
                                                  colName
                                                ]
                                                  ? "border-red-500"
                                                  : ""
                                              }`}
                                            />
                                          );

                                        case "number":
                                          return (
                                            <input
                                              type="text"
                                              inputMode="numeric"
                                              pattern="[0-9]*"
                                              maxLength={
                                                activeFieldData.max_length ||
                                                undefined
                                              }
                                              value={
                                                pendingChanges.find(
                                                  (s) =>
                                                    s.student_id ===
                                                    student.student_id
                                                )?.[colName] ??
                                                student[colName] ??
                                                ""
                                              }
                                              className={`border rounded px-2 py-1 text-sm w-full ${
                                                errors[student.student_id]?.[
                                                  colName
                                                ]
                                                  ? "border-red-500"
                                                  : ""
                                              }`}
                                              placeholder={
                                                activeFieldData.label
                                              }
                                              required={
                                                activeFieldData.nullable === 0
                                              }
                                              onChange={(e) =>
                                                handleInputChange(
                                                  e,
                                                  student.student_id,
                                                  colName
                                                )
                                              }
                                              ref={(el) => {
                                                if (el) {
                                                  studentRefs.current[
                                                    `${student.student_id}-${colName}`
                                                  ] = el;
                                                }
                                              }}
                                            />
                                          );

                                        case "date":
                                          return (
                                            <input
                                              type="date"
                                              value={
                                                pendingChanges.find(
                                                  (s) =>
                                                    s.student_id ===
                                                    student.student_id
                                                )?.[colName] ??
                                                (student[colName]
                                                  ? student[colName].split(
                                                      "T"
                                                    )[0]
                                                  : "")
                                              }
                                              className={`border rounded px-2 py-1 text-sm w-full ${
                                                errors[student.student_id]?.[
                                                  colName
                                                ]
                                                  ? "border-red-500"
                                                  : ""
                                              }`}
                                              required={
                                                activeFieldData.nullable === 0
                                              }
                                              onChange={(e) =>
                                                handleInputChange(
                                                  e,
                                                  student.student_id,
                                                  colName
                                                )
                                              }
                                              maxLength={
                                                activeFieldData.max_length ||
                                                undefined
                                              }
                                              ref={(el) => {
                                                if (el) {
                                                  studentRefs.current[
                                                    `${student.student_id}-${colName}`
                                                  ] = el;
                                                }
                                              }}
                                            />
                                          );

                                        case "select":
                                          if (activeFieldData.options) {
                                            const options = JSON.parse(
                                              activeFieldData.options || "[]"
                                            );
                                            const selectedValue =
                                              pendingChanges.find(
                                                (s) =>
                                                  s.student_id ===
                                                  student.student_id
                                              )?.[colName] ??
                                              student[colName] ??
                                              "";

                                            return (
                                              <select
                                                value={selectedValue}
                                                className={`border rounded px-2 py-1 text-sm w-full ${
                                                  errors[student.student_id]?.[
                                                    colName
                                                  ]
                                                    ? "border-red-500"
                                                    : ""
                                                }`}
                                                required={
                                                  activeFieldData.nullable === 0
                                                }
                                                onChange={(e) =>
                                                  handleInputChange(
                                                    e,
                                                    student.student_id,
                                                    colName
                                                  )
                                                }
                                                maxLength={
                                                  activeFieldData.max_length ||
                                                  undefined
                                                }
                                                ref={(el) => {
                                                  if (el) {
                                                    studentRefs.current[
                                                      `${student.student_id}-${colName}`
                                                    ] = el;
                                                  }
                                                }}
                                              >
                                                <option value="">
                                                  -- Select --
                                                </option>
                                                {options.map((opt, i) => (
                                                  <option
                                                    key={i}
                                                    value={opt.value}
                                                  >
                                                    {opt.option}
                                                  </option>
                                                ))}
                                              </select>
                                            );
                                          }
                                          return (
                                            <span>{student[colName]}</span>
                                          );

                                        case "radio": {
                                          const radioValue =
                                            pendingChanges.find(
                                              (s) =>
                                                s.student_id ===
                                                student.student_id
                                            )?.[colName] ??
                                            student[colName] ??
                                            "";

                                          return (
                                            <div className="flex items-center justify-center gap-2">
                                              {JSON.parse(
                                                activeFieldData.options || "[]"
                                              ).map((opt, i) => (
                                                <label
                                                  key={i}
                                                  className="flex items-center gap-1 text-sm"
                                                >
                                                  <input
                                                    type="radio"
                                                    name={`radio-${student.student_id}-${colName}`} // unique per row
                                                    value={opt.option}
                                                    checked={
                                                      radioValue === opt.option
                                                    }
                                                    required={
                                                      activeFieldData.nullable ===
                                                      0
                                                    }
                                                    onChange={(e) =>
                                                      handleInputChange(
                                                        e,
                                                        student.student_id,
                                                        colName
                                                      )
                                                    }
                                                    maxLength={
                                                      activeFieldData.max_length ||
                                                      undefined
                                                    }
                                                    ref={(el) => {
                                                      if (el) {
                                                        studentRefs.current[
                                                          `${student.student_id}-${colName}`
                                                        ] = el;
                                                      }
                                                    }}
                                                  />
                                                  {opt.value}
                                                </label>
                                              ))}
                                            </div>
                                          );
                                        }

                                        case "textarea": {
                                          const textareaValue =
                                            pendingChanges.find(
                                              (s) =>
                                                s.student_id ===
                                                student.student_id
                                            )?.[colName] ??
                                            student[colName] ??
                                            "";
                                          return (
                                            <textarea
                                              value={textareaValue}
                                              maxLength={
                                                activeFieldData.max_length ||
                                                undefined
                                              }
                                              className={`border rounded px-2 py-1 text-sm w-full m-1 ${
                                                errors[student.student_id]?.[
                                                  colName
                                                ]
                                                  ? "border-red-500"
                                                  : ""
                                              }`}
                                              placeholder={
                                                activeFieldData.label
                                              }
                                              required={
                                                activeFieldData.nullable === 0
                                              }
                                              onChange={(e) =>
                                                handleInputChange(
                                                  e,
                                                  student.student_id,
                                                  colName
                                                )
                                              }
                                              ref={(el) => {
                                                if (el) {
                                                  studentRefs.current[
                                                    `${student.student_id}-${colName}`
                                                  ] = el;
                                                }
                                              }}
                                              rows={3}
                                            />
                                          );
                                        }

                                        default:
                                          return <span>{value}</span>;
                                      }
                                    })()}
                                  </td>
                                )}
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
                  </div>{" "}
                  <div className="col-span-3 mb-2  text-right mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const valid = validateStudents();
                        if (valid) setIsModalOpen(true);
                      }}
                      style={{ backgroundColor: "#2196F3" }}
                      className={`text-white font-bold py-1 border-1 border-blue-500 px-4 rounded ${
                        loading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      disabled={loading}
                    >
                      {loading ? (
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
                          Updating...
                        </span>
                      ) : (
                        "Update"
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/dashboard")}
                      disabled={loading}
                      className={`ml-2 bg-yellow-400 hover:bg-yellow-400 text-white font-bold py-1 px-4 rounded 
    ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      Back
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
              <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl">
                <div className="flex justify-between p-3">
                  <h5 className="modal-title">Confirm Update</h5>
                  <RxCross1
                    className="float-end relative mt-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                  />
                </div>

                <div
                  className=" relative  mb-3 h-1 w-[97%] mx-auto bg-red-700"
                  style={{ backgroundColor: "#C03078" }}
                ></div>

                <div className="p-2 max-h-96 overflow-y-auto">
                  <p className="text-gray-700">
                    The following changes will be updated:{" "}
                    <span
                      className="font-semibold"
                      style={{ color: "#C03078" }}
                    >
                      {selectedFieldData?.label ||
                        selectedFieldData?.column_name}
                    </span>
                  </p>

                  <table className="w-full text-sm border border-gray-300 rounded-lg overflow-hidden">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="w-[7%] text-center p-2 lg:px-3 border border-gray-950 text-sm">
                          Sr. No.
                        </th>
                        <th className="w-[10%] text-center p-2 lg:px-3 border border-gray-950 text-sm">
                          Roll No
                        </th>
                        <th className="w-[25%] text-center p-2 lg:px-3 border border-gray-950 text-sm">
                          Student Name
                        </th>
                        <th className="w-[20%] text-center p-2 lg:px-3 border border-gray-950 text-sm">
                          Old Value
                        </th>
                        <th className="w-[20%] text-center p-2 lg:px-3 border border-gray-950 text-sm">
                          New Value
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {pendingChanges.length > 0 ? (
                        pendingChanges.map((change, index) => {
                          const student = studentInformation.find(
                            (s) => s.student_id === change.student_id
                          );
                          const colName = selectedFieldData?.column_name;

                          return (
                            <tr
                              key={change.student_id}
                              className="hover:bg-gray-50"
                            >
                              {/* Sr No */}
                              <td className="p-2 border text-center">
                                {index + 1}
                              </td>

                              {/* Roll No */}
                              <td className="p-2 border text-center">
                                {student?.roll_no || ""}
                              </td>

                              {/* Student Name */}
                              <td className="p-2 border text-center">
                                {formatFullName(
                                  student?.first_name,
                                  student?.mid_name,
                                  student?.last_name
                                )}
                              </td>

                              {/* Old Value */}
                              {/* <td className="p-2 border text-center">
                                {student?.[colName] ?? "—"}
                              </td> */}

                              {/* New Value */}
                              {/* <td className="p-2 border text-center">
                                {change?.[colName] ?? "—"}
                              </td> */}

                              {/* Old Value */}
                              <td className="p-2 border text-center">
                                {getDisplayValue(
                                  activeFieldData,
                                  student?.[colName]
                                )}
                              </td>

                              {/* New Value */}
                              <td className="p-2 border text-center">
                                {getDisplayValue(
                                  activeFieldData,
                                  change?.[colName]
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="text-center p-2">
                            No changes made
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end gap-3 p-4 border-t">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {loading ? "Updating" : "Update"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateClasswiseStudentDetails;
