import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";

const SubjectAllotmentHSC = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudentForStudent, setSelectedStudentForStudent] =
    useState(null);
  const [classesforForm, setClassesforForm] = useState([]);

  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);

  const [classIdForSearch, setClassIdForSearch] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const [nameError, setNameError] = useState("");
  const [nameErrorForClass, setNameErrorForClass] = useState("");
  const [nameErrorForStudent, setNameErrorForStudent] = useState("");
  const [nameErrorForClassForStudent, setNameErrorForClassForStudent] =
    useState("");
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedClassForStudent, setSelectedClassForStudent] = useState(null);
  const [parentInformation, setParentInformation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingForSearch, setLoadingForSearch] = useState(false);

  const navigate = useNavigate();

  // for form
  const [errors, setErrors] = useState({});
  const [backendErrors, setBackendErrors] = useState({});

  // Get today's date in YYYY-MM-DD format
  // Calculate today's date
  const today = new Date().toISOString().split("T")[0];
  // State for loading indicators
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [studentsData, setStudentsData] = useState([]);
  const [subjectGroups, setSubjectGroups] = useState([]);
  const [optionalSubjects, setOptionalSubjects] = useState([]);
  const [subjectGroup, setSubjectGroup] = useState("");
  const [optionalSubject, setOptionalSubject] = useState("");
  useEffect(() => {
    // Fetch both classes and student names on component mount
    fetchInitialDataAndStudents();
    fetchSubjectGroups();
    fetchOptionalSubjects();
  }, []);
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
      setError("Error fetching subject groups");
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
      setError("Error fetching optional subjects");
    }
  };
  const fetchInitialDataAndStudents = async () => {
    try {
      setLoadingClasses(true);
      setLoadingStudents(true);

      const token = localStorage.getItem("authToken");

      // Fetch classes and students concurrently
      const [classResponse] = await Promise.all([
        axios.get(`${API_URL}/api/getClassList`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Set the fetched data
      setClassesforForm(classResponse.data || []);
      //   setStudentNameWithClassId(studentResponse?.data?.data || []);
    } catch (error) {
      toast.error("Error fetching Class data.");
    } finally {
      // Stop loading for both dropdowns
      setLoadingClasses(false);
      setLoadingStudents(false);
    }
  };

  const fetchStudentNameWithClassId = async (section_id = null) => {
    console.log("fetchStudentNameWithClassId is run");

    try {
      setLoadingStudents(true);

      const params = section_id ? { section_id } : {};
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/get_divisions/${section_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setStudentNameWithClassId(response?.data?.divisions || []);
      console.log(
        "Response of fetchStudentNameWithClassId is",
        response?.data?.divisions
      );
    } catch (error) {
      toast.error("Error fetching Divisions.");
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleClassSelect = (selectedOption) => {
    setNameErrorForClass("");
    setSelectedClass(selectedOption);
    setSelectedStudent(null);
    setSelectedStudentId(null);
    setClassIdForSearch(selectedOption?.value);
    fetchStudentNameWithClassId(selectedOption?.value);
  };

  const handleStudentSelect = (selectedOption) => {
    setNameError(""); // Reset student error on selection
    setSelectedStudent(selectedOption);
    setSelectedStudentId(selectedOption?.value);
  };

  // Dropdown options
  //   const classOptions = useMemo(
  //     () =>
  //       classesforForm.map((cls) => ({
  //         value: cls.class_id,
  //         label: `${cls.name}`,
  //         key: `${cls.class_id}`,
  //       })),
  //     [classesforForm]
  //   );
  const classOptions = useMemo(
    () =>
      classesforForm
        .filter(
          (cls) => cls.class_id > 125 || cls.name === "11" || cls.name === "12"
        )
        .map((cls) => ({
          value: cls.class_id,
          label: `${cls.name}`,
          key: `${cls.class_id}`,
        })),
    [classesforForm]
  );

  console.log("classOptions", classOptions);

  const studentOptions = useMemo(
    () =>
      studentNameWithClassId.map((stu) => ({
        value: stu.section_id,
        label: `${stu?.name}`,
      })),
    [studentNameWithClassId]
  );

  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  console.log("seletedStudents[]", selectedStudents);

  const handleSearch = async () => {
    // Reset error messages
    setNameError("");
    setNameErrorForClass("");
    setNameErrorForClassForStudent("");
    setNameErrorForStudent("");
    setErrors({}); // Clears all field-specific errors

    let hasError = false;
    if (!selectedClass) {
      setNameErrorForClass("Please select a class.");
      hasError = true;
    }
    if (!selectedStudent) {
      setNameError("Please select a division.");
      hasError = true;
    }

    // If there are validation errors, exit the function
    if (hasError) return;
    // Reset form data and selected values after successful submission

    try {
      setParentInformation(null);
      setSelectedStudentForStudent(null);
      setSelectedStudentForStudent([]);
      setSelectedClassForStudent(null);
      setSelectedClassForStudent([]);
      setSelectedStudents([]);
      setSelectAll(false);
      setLoadingForSearch(true); // Start loading
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/api/get_subjecthigherstudentwise/${classIdForSearch}/${selectedStudentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Check if data was received and update the form state
      if (response?.data?.data) {
        const fetchedData = response?.data?.data; // Extract the data
        setParentInformation(response?.data?.data); // Assuming response data contains form data
        setStudentsData(response?.data?.data);
        // Populate formData with the fetched data
      } else {
        console.log("reponse", response.data.status);

        toast.error("No data found for the selected class and divisoin.");
      }
    } catch (error) {
      console.log("error is", error);
      console.log("error is", error.response);
    } finally {
      setLoadingForSearch(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    let hasError = false;

    // Validate if `selectedStudents` array is empty

    // Validate if `selectedClassForStudent` or `selectedStudentForStudent` are missing
    if (!selectedClassForStudent.value) {
      setNameErrorForClassForStudent("Please select a class.");
      hasError = true;
    }
    if (!selectedStudentForStudent.value) {
      setNameErrorForStudent("Please select a student.");
      hasError = true;
    }
    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student to promote.");
      hasError = true;
    }
    // Exit if there are validation errors
    if (hasError) return;

    try {
      setLoading(true); // Start loading

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token is found");
      }

      // Prepare data for the API request
      const postData = {
        selector: selectedStudents,
        tclass_id: selectedClassForStudent.value, // Replace with actual target class ID
        tsection_id: selectedStudentForStudent.value, // Replace with actual target section ID
      };

      // Make the API call
      const response = await axios.post(
        `${API_URL}/api/promotestudents`,
        postData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Handle successful response
      if (response.status === 200) {
        toast.success("Students promoted successfully!");
        setSelectedClass(null); // Reset class selection
        // setSelectedClassForStudent(null);
        // selectedStudentForStudent(null);

        setSelectedStudent(null); // Reset student selection
        setSelectedStudents([]); // Clear selected students
        setErrors({});
        setSelectedStudentForStudent(null);
        setSelectedStudentForStudent([]);
        setSelectedClassForStudent(null);
        setSelectedClassForStudent([]);
        setNameErrorForClassForStudent("");
        setNameErrorForStudent("");
        setSelectAll(null);
        setBackendErrors({});
        setTimeout(() => {
          setParentInformation(null);
        }, 500);
      }
    } catch (error) {
      console.error("Error:", error.response?.data);

      // Display error message
      toast.error("An error occurred while promoting students.");

      if (error.response && error.response.data) {
        setBackendErrors(error.response.data || {});
      }
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleNavigation = () => {
    navigate("/dashboard");
  };
  //   const filteredParents = parentInformation
  //     ? parentInformation.filter((student) => {
  //         const searchLower = searchTerm.toLowerCase();

  //         return (
  //           (student.roll_no !== null &&
  //             student.roll_no.toString().toLowerCase().includes(searchLower)) || // Filter by roll number
  //           `${student.first_name || ""} ${student.mid_name || ""} ${
  //             student.last_name || ""
  //           }`
  //             .toLowerCase()
  //             .includes(searchLower) // Filter by full name
  //         );
  //       })
  //     : [];

  const handleApplySubjectGroup = () => {
    if (subjectGroup) {
      const updatedStudents = studentsData.map((student) => ({
        ...student,
        sub_group_id: subjectGroup,
      }));
      setStudentsData(updatedStudents);
    }
  };

  const handleRemoveSubjectGroup = () => {
    const updatedStudents = studentsData.map((student) => ({
      ...student,
      sub_group_id: null,
    }));
    setStudentsData(updatedStudents);
  };

  const handleApplyOptionalSubject = () => {
    if (optionalSubject) {
      const updatedStudents = studentsData.map((student) => ({
        ...student,
        opt_subject_id: optionalSubject,
      }));
      setStudentsData(updatedStudents);
    }
  };

  const handleRemoveOptionalSubject = () => {
    const updatedStudents = studentsData.map((student) => ({
      ...student,
      opt_subject_id: null,
    }));
    setStudentsData(updatedStudents);
  };

  const handleStudentDropdownChange = (id, field, value) => {
    const updatedStudents = studentsData.map((student) =>
      student.student_id === id ? { ...student, [field]: value } : student
    );
    setStudentsData(updatedStudents);
  };

  return (
    <div>
      <ToastContainer />

      <div className="md:mx-auto md:w-3/4 p-4 bg-white mt-4 ">
        <div className=" w-full    flex justify-between items-center ">
          <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
            Subjects For Higher Secondary Class
          </h3>
          <RxCross1
            className="   text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
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
        <div className="     w-full md:container mt-4">
          {/* Search Section */}
          <div className=" w-full md:w-[70%] border-1 flex justify-center flex-col md:flex-row gap-x-1  bg-white rounded-lg   relative md:left-6 left-0 mt-1 p-2 ">
            <div className="w-full   flex md:flex-row justify-between items-center">
              <div className="w-full  flex flex-col gap-y-2 md:gap-y-0 md:flex-row">
                <div className="w-full gap-x-14 md:gap-x-6 md:justify-start my-1 md:my-4 flex md:flex-row">
                  <label
                    className="text-md mt-1.5 mr-1 md:mr-0"
                    htmlFor="classSelect"
                  >
                    Class <span className="text-red-500">*</span>
                  </label>
                  <div className="w-full md:w-[50%]">
                    <Select
                      id="classSelect"
                      value={selectedClass}
                      onChange={handleClassSelect}
                      options={classOptions}
                      placeholder={loadingClasses ? "Loading..." : "Select"}
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
                </div>

                <div className="w-full gap-x-6 relative left-0 md:-left-[5%] justify-between md:w-[70%]  my-1 md:my-4 flex md:flex-row">
                  <label
                    className="md:w-[45%] text-md mt-1.5"
                    htmlFor="studentSelect"
                  >
                    Division <span className="text-red-500">*</span>
                  </label>
                  <div className="w-full md:w-[80%]">
                    <Select
                      id="studentSelect"
                      value={selectedStudent}
                      onChange={handleStudentSelect}
                      options={studentOptions}
                      disabled={!selectedClass} // Disable division until class is selected
                      placeholder={loadingStudents ? "Loading..." : "Select"}
                      isSearchable
                      isClearable
                      className="text-sm"
                      styles={{
                        menu: (provided) => ({
                          ...provided,
                          zIndex: 1050, // Set your desired z-index value
                        }),
                      }}
                      isDisabled={loadingStudents}
                    />
                    {nameError && (
                      <div className="h-8 relative ml-1 text-danger text-xs">
                        {nameError}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="search"
                  onClick={handleSearch}
                  style={{ backgroundColor: "#2196F3" }}
                  className={`my-1 md:my-4 btn h-10 w-18 md:w-auto btn-primary text-white font-bold py-1 border-1 border-blue-500 px-4 rounded ${
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

          {/* Form Section - Displayed when parentInformation is fetched */}
          {parentInformation && (
            <div className="w-full md:container mx-auto py-4 px-4">
              {/* Student Table */}
              <div className="  w-full  mt-4">
                <div className="card mx-auto lg:w-full shadow-lg">
                  <div className="p-1 px-3 bg-gray-100 flex justify-between items-center">
                    <h6 className="text-gray-700 mt-1   text-nowrap">
                      Select Students
                    </h6>
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
                  <div className="w-full mt-4">
                    <div className="card mx-auto lg:w-full shadow-lg">
                      <div className="p-1 px-3 bg-gray-100 flex justify-between items-center">
                        <h6 className="text-gray-700 mt-1 text-nowrap">
                          Select Students
                        </h6>
                      </div>

                      <div className="flex justify-between items-center mt-4 px-4">
                        {/* Subject Group Header Dropdown */}
                        <div>
                          <label className="block mb-2">Subject Group</label>
                          <select
                            className="px-2 py-1 border rounded-md"
                            value={subjectGroup}
                            onChange={(e) => setSubjectGroup(e.target.value)}
                          >
                            <option value="">Select</option>
                            {subjectGroups.map((group) => (
                              <option
                                key={group.sub_group_id}
                                value={group.sub_group_id}
                              >
                                {group.sub_group_name}
                              </option>
                            ))}
                          </select>
                          <button
                            className="bg-green-500 text-white px-2 py-1 ml-2 rounded-md"
                            onClick={handleApplySubjectGroup}
                          >
                            Apply
                          </button>
                          <button
                            className="bg-red-500 text-white px-2 py-1 ml-2 rounded-md"
                            onClick={handleRemoveSubjectGroup}
                          >
                            Remove
                          </button>
                        </div>

                        {/* Optional Subject Header Dropdown */}
                        <div>
                          <label className="block mb-2">Optional Subject</label>
                          <select
                            className="px-2 py-1 border rounded-md"
                            value={optionalSubject}
                            onChange={(e) => setOptionalSubject(e.target.value)}
                          >
                            <option value="">Select</option>
                            {optionalSubjects.map((subject) => (
                              <option key={subject.sm_id} value={subject.sm_id}>
                                {subject.name}
                              </option>
                            ))}
                          </select>
                          <button
                            className="bg-green-500 text-white px-2 py-1 ml-2 rounded-md"
                            onClick={handleApplyOptionalSubject}
                          >
                            Apply
                          </button>
                          <button
                            className="bg-red-500 text-white px-2 py-1 ml-2 rounded-md"
                            onClick={handleRemoveOptionalSubject}
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="card-body w-full">
                        <div className="h-96 lg:h-96 overflow-y-scroll lg:overflow-x-hidden w-full mx-auto">
                          <table className="min-w-full leading-normal table-auto">
                            <thead>
                              <tr className="bg-gray-200">
                                <th className="px-2 text-center lg:px-3 py-2 border text-sm font-semibold">
                                  Sr.No
                                </th>
                                <th className="px-2 text-center lg:px-3 py-2 border text-sm font-semibold">
                                  Student Name
                                </th>
                                <th className="px-2 text-center lg:px-3 py-2 border text-sm font-semibold">
                                  Subject Group
                                </th>
                                <th className="px-2 text-center lg:px-3 py-2 border text-sm font-semibold">
                                  Optional Subject
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {studentsData.map((student, index) => (
                                <tr
                                  key={student.student_id}
                                  className={
                                    index % 2 === 0 ? "bg-white" : "bg-gray-100"
                                  }
                                >
                                  <td className="text-center px-2 lg:px-3 border text-sm">
                                    {index + 1}
                                  </td>
                                  <td className="text-center px-2 lg:px-3 border text-sm">
                                    {`${student.first_name} ${
                                      student.mid_name || ""
                                    } ${student.last_name}`}
                                  </td>
                                  <td className="text-center px-2 lg:px-3 border text-sm">
                                    <select
                                      className="px-2 py-1 border rounded-md"
                                      value={student.sub_group_id || ""}
                                      onChange={(e) =>
                                        handleStudentDropdownChange(
                                          student.student_id,
                                          "sub_group_id",
                                          e.target.value
                                        )
                                      }
                                    >
                                      <option value="">Select</option>
                                      {subjectGroups.map((group) => (
                                        <option
                                          key={group.sub_group_id}
                                          value={group.sub_group_id}
                                        >
                                          {group.sub_group_name}
                                        </option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="text-center px-2 lg:px-3 border text-sm">
                                    <select
                                      className="px-2 py-1 border rounded-md"
                                      value={student.opt_subject_id || ""}
                                      onChange={(e) =>
                                        handleStudentDropdownChange(
                                          student.student_id,
                                          "opt_subject_id",
                                          e.target.value
                                        )
                                      }
                                    >
                                      <option value="">Select</option>
                                      {optionalSubjects.map((subject) => (
                                        <option
                                          key={subject.sm_id}
                                          value={subject.sm_id}
                                        >
                                          {subject.name}
                                        </option>
                                      ))}
                                    </select>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              ;{/* Selected Students */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubjectAllotmentHSC;
