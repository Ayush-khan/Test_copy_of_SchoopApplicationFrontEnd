import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLocation, useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
import LoaderStyle from "../common/LoaderFinal/LoaderStyle";
import { useParams } from "react-router-dom";

const UnmapDetails = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [classesforForm, setClassesforForm] = useState([]);
  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
  const [classesforFormForSecond, setClassesforFormForSecond] = useState([]);
  const [studentNameWithClassIdForSecond, setStudentNameWithClassIdForSecond] =
    useState([]);
  const [classIdForSearch, setClassIdForSearch] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [radioButtonError, setRadioButtonError] = useState("");
  const [nameError, setNameError] = useState("");
  const [nameErrorForClass, setNameErrorForClass] = useState("");
  const [selectedClass, setSelectedClass] = useState(null);
  const [parentInformation, setParentInformation] = useState(null);
  const [loadingForSearch, setLoadingForSearch] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [confirmedOption, setConfirmedOption] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [userIdOptionError, setUserIdOptionError] = useState("");
  const [error, setError] = useState("");

  const { id } = useParams();
  console.log("selected student is", id);

  const location = useLocation();

  const studentName = location.state?.studentName || "Name not provided";
  console.log("Student Nmme", studentName);

  const navigate = useNavigate();

  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      fontSize: "0.8rem",
      backgroundColor: state.isFocused ? "rgba(59, 130, 246, 0.1)" : "white",
      color: state.isSelected ? "blue" : "inherit", // Ensures selected value is black
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 50, // To ensure proper stacking
    }),
  };

  const [selectedParent, setSelectedParent] = useState("");

  const [formData, setFormData] = useState({
    stud_name: "",
    father_name: "",
    mother_name: "",
    father_email: "",
    father_phone: "",
    mother_email: "",
    mother_phone: "",
    user_id: "",
  });

  // const handleNewParentChange = (e) => {
  //   const { name, value } = e.target;

  //   let updatedValue = value;

  //   // Only allow alphabets and spaces for specific name fields
  //   if (["father_name", "mother_name"].includes(name)) {
  //     updatedValue = value.replace(/[^a-zA-Z\s]/g, "");
  //   }

  //   setNewParent((prev) => ({ ...prev, [name]: updatedValue }));
  // };

  // for form

  const handleNewParentChange = (e) => {
    const { name, value } = e.target;

    let updatedValue = value;

    // Only allow alphabets and spaces for name fields
    if (["father_name", "mother_name"].includes(name)) {
      updatedValue = value.replace(/[^a-zA-Z\s]/g, "");
    }

    // Clear error when user selects userIdOption
    if (name === "userIdOption") {
      setUserIdOptionError("");
    }

    setNewParent((prev) => ({ ...prev, [name]: updatedValue }));
  };

  const [errors, setErrors] = useState({});
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingClassesForSecond, setLoadingClassesForSecond] = useState(false);
  const [loadingStudentsForSecond, setLoadingStudentsForSecond] =
    useState(false);

  const [newParent, setNewParent] = useState({
    father_name: "",
    f_mobile: "",
    f_email: "",
    mother_name: "",
    m_mobile: "",
    m_email: "",
    userIdOption: "", // Optional
  });

  useEffect(() => {
    // Fetch both classes and student names on component mount
    fetchInitialDataAndStudents();
    fetchInitialDataAndStudentsForSecond();
  }, []);

  const fetchInitialDataAndStudents = async () => {
    try {
      setLoadingClasses(true);
      setLoadingStudents(true);

      const token = localStorage.getItem("authToken");

      // Fetch classes and students concurrently
      const [classResponse, studentResponse] = await Promise.all([
        axios.get(`${API_URL}/api/getallClassWithStudentCount`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/getStudentListBySectionData`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Set the fetched data
      setClassesforForm(classResponse.data || []);
      setStudentNameWithClassId(studentResponse?.data?.data || []);
    } catch (error) {
      toast.error("Error fetching data.");
    } finally {
      // Stop loading for both dropdowns
      setLoadingClasses(false);
      setLoadingStudents(false);
    }
  };

  const fetchStudentNameWithClassId = async (section_id = null) => {
    try {
      setLoadingStudents(true);

      const params = section_id ? { section_id } : {};
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/getStudentListBySectionData`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      setStudentNameWithClassId(response?.data?.data || []);
    } catch (error) {
      toast.error("Error fetching students.");
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchInitialDataAndStudentsForSecond = async () => {
    try {
      setLoadingClassesForSecond(true);
      setLoadingStudentsForSecond(true);

      const token = localStorage.getItem("authToken");

      // Fetch classes and students concurrently
      const [classResponse, studentResponse] = await Promise.all([
        axios.get(`${API_URL}/api/getallClassWithStudentCount`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/getStudentListBySectionData`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Set the fetched data
      setClassesforFormForSecond(classResponse.data || []);
      setStudentNameWithClassIdForSecond(studentResponse?.data?.data || []);
    } catch (error) {
      toast.error("Error fetching data.");
    } finally {
      // Stop loading for both dropdowns
      setLoadingClassesForSecond(false);
      setLoadingStudentsForSecond(false);
    }
  };

  const handleClassSelect = (selectedOption) => {
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
    handleSearch(selectedOption?.value);
  };

  // Dropdown options
  const classOptions = useMemo(
    () =>
      classesforForm.map((cls) => ({
        value: cls.section_id,
        label: `${cls?.get_class?.name || ""} ${cls?.name || ""} (${
          cls?.students_count || ""
        })`,
        key: `${cls.class_id}-${cls.section_id}`,
      })),
    [classesforForm]
  );

  const studentOptions = useMemo(
    () =>
      studentNameWithClassId.map((stu) => ({
        value: stu.student_id,
        label: `${stu?.first_name || ""} ${stu?.mid_name || ""} ${
          stu?.last_name || ""
        }`,
      })),
    [studentNameWithClassId]
  );

  const handleSearch = async (selectedStudent1) => {
    // Reset error messages
    setNameError("");
    setNameErrorForClass("");
    setRadioButtonError("");
    setSelectedParent("");
    setErrors({}); // Clears all field-specific errors

    if (!selectedStudent1) {
      setNameError("Please select Student Name.");
      toast.error("Please select Student Name.!");
      return;
    }

    // Reset form data and selected values after successful submission
    setParentInformation(null);
    setFormData({
      stud_name: "",
      parent_id: "",
      father_name: "",
      mother_name: "",
      father_email: "",
      father_phone: "",
      mother_email: "",
      mother_phone: "",
      user_id: "",
      siblings: [], // Reset siblings as well
    });

    try {
      setLoadingForSearch(true); // Start loading
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/api/get_studentwithSiblings`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { student_id: selectedStudent1 },
        }
      );

      console.log("Students data", response?.data?.students);

      if (response?.data?.students) {
        const fetchedData = response?.data?.students;
        setParentInformation(fetchedData);

        if (fetchedData && fetchedData.length > 0) {
          const student = fetchedData[0];

          // Populate all fields including siblings
          setFormData({
            stud_name: `${student?.first_name || ""} ${
              student?.mid_name || ""
            } ${student?.last_name || ""} (${student?.get_class?.name || ""}-${
              student?.get_division?.name || ""
            })`,
            father_name: student?.parents?.father_name || "",
            mother_name: student?.parents?.mother_name || "",
            father_email: student?.parents?.f_email || "",
            father_phone: student?.parents?.f_mobile || "",
            parent_id: student?.parents?.parent_id || "",
            mother_email: student?.parents?.m_emailid || "",
            mother_phone: student?.parents?.m_mobile || "",
            user_id: student?.user_master?.user_id || "",
            siblings: student?.siblings || [], //Add siblings to formData
          });

          console.log("fetchedData", fetchedData);
        } else {
          console.error("No students found in the response.");
        }
      } else {
        console.log("response", response.data.status);
      }
    } catch (error) {
      console.log("error", error.response?.data?.message);
      if (
        error.response?.data?.message ===
        "No student found matching the search criteria."
      ) {
        toast.error("Student information not found!");
      } else {
        toast.error(error.response?.data?.message || "Student not found!");
      }
    } finally {
      setLoadingForSearch(false);
    }
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      toast.error("Authentication token missing!");
      return;
    }

    try {
      setIsSaving(true);

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      let response;

      if (selectedOption === "mapWithOther") {
        const parentId = formData?.parent_id;

        if (!parentId) {
          toast.error("Please select Class and Student");
          return;
        }

        response = await axios.post(
          `${API_URL}/api/update_studentwithsibling/${id}`,
          {},
          {
            ...config,
            params: {
              parent_id: parentId,
            },
          }
        );
        // } else if (selectedOption === "newParent") {
        //   const parentData = {
        //     father_name: newParent.father_name,
        //     f_email: newParent.f_email,
        //     f_mobile: newParent.f_mobile,
        //     mother_name: newParent.mother_name,
        //     m_email: newParent.m_email,
        //     m_mobile: newParent.m_mobile,
        //     user_id:
        //       newParent.userIdOption === "mother"
        //         ? newParent.m_email
        //         : newParent.f_email,
        //   };

        //   response = await axios.post(
        //     `${API_URL}/api/update_studentwithsibling/${id}`,
        //     parentData,
        //     config
        //   );
      } else if (selectedOption === "newParent") {
        // Validate radio selection
        if (!newParent.userIdOption) {
          setUserIdOptionError("Please select any one User ID.");
          return;
        } else {
          setUserIdOptionError(""); // Clear error if selected
        }

        const parentData = {
          father_name: newParent.father_name,
          f_email: newParent.f_email,
          f_mobile: newParent.f_mobile,
          mother_name: newParent.mother_name,
          m_email: newParent.m_email,
          m_mobile: newParent.m_mobile,
          user_id:
            newParent.userIdOption === "mother"
              ? newParent.m_email
              : newParent.f_email,
        };

        response = await axios.post(
          `${API_URL}/api/update_studentwithsibling/${id}`,
          parentData,
          config
        );
      } else {
        toast.error("Please select a mapping option.");
        return;
      }

      if (response?.data?.status === "success") {
        toast.success("Students unmapped successfully.");
        handleResetNewParentForm();
        setTimeout(() => {
          navigate("/siblingUnmapping");
        }, 2000);
      } else {
        toast.error(response?.data?.message || "Update failed.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.response?.data?.message || "API error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetNewParentForm = () => {
    setNewParent({
      father_name: "",
      f_mobile: "",
      f_email: "",
      mother_name: "",
      m_mobile: "",
      m_email: "",
      userIdOption: "",
    });
  };

  const reset = () => {
    setSelectedClass(null);
    setSelectedStudent(null);
  };

  useEffect(() => {
    if (confirmedOption === "newParent") {
      setNewParent({
        father_name: "",
        f_mobile: "",
        f_email: "",
        mother_name: "",
        m_mobile: "",
        m_email: "",
        userIdOption: "",
      });
    }
  }, [confirmedOption]);

  const handleNavigation = () => {
    navigate("/siblingUnmapping");
  };

  const camelCase = (str) =>
    str
      ?.toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  return (
    <div>
      <ToastContainer />

      <div className=" w-full md:w-[65%] mt-4 mx-auto">
        <div className="card mx-auto lg:w-[100%] shadow-lg">
          <div className=" w-full  p-2 px-3 bg-gray-100 flex justify-between items-center ">
            <h3 className=" w-full text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
              Unmap Details
            </h3>
            {/* <div className="flex justify-between p-3"> */}
            <RxCross1
              className=" relative top-0.5  text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
              type="button"
              onClick={handleNavigation}
            />
            {/* </div> */}
            <div className="box-border flex md:gap-x-2 justify-end md:h-10"></div>
          </div>
          <div
            className=" relative w-[97%] h-1  mx-auto bg-red-700"
            style={{
              backgroundColor: "#C03078",
            }}
          ></div>
          <div className="w-full  flex flex-col md:flex-row">
            <div className="w-full md:container ">
              <div className="flex justify-center">
                <div className="border rounded-md p-4 m-6 bg-white shadow-md w-full max-w-[78%]">
                  <p className="text-lg font-semibold mb-4">
                    Student Name:{" "}
                    <span className="font-bold">{camelCase(studentName)}</span>
                  </p>

                  {/* Radio buttons + Go button in same row */}
                  {/* <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
                    <label className="flex items-center gap-2 text-gray-700">
                      <input
                        type="radio"
                        name="unmapOption"
                        value="mapWithOther"
                        checked={selectedOption === "mapWithOther"}
                        // onChange={(e) => setSelectedOption(e.target.value)}
                        onChange={(e) => {
                          setSelectedOption(e.target.value);
                          setConfirmedOption(""); // reset displayed UI
                        }}
                        className="accent-blue-600"
                      />
                      Map with other student
                    </label>

                    <label className="flex items-center gap-2 text-gray-700">
                      <input
                        type="radio"
                        name="unmapOption"
                        value="newParent"
                        checked={selectedOption === "newParent"}
                        // onChange={(e) => setSelectedOption(e.target.value)}
                        onChange={(e) => {
                          setSelectedOption(e.target.value);
                          setConfirmedOption(""); // reset displayed UI
                        }}
                        className="accent-blue-600"
                      />
                      Add new parent details
                    </label>

                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded"
                      onClick={() => setConfirmedOption(selectedOption)}
                    >
                      Go
                    </button>
                  </div> */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
                    {/* Option 1 */}
                    <label className="flex items-center gap-2 text-gray-700">
                      <input
                        type="radio"
                        name="unmapOption"
                        value="mapWithOther"
                        checked={selectedOption === "mapWithOther"}
                        onChange={(e) => {
                          setSelectedOption(e.target.value);
                          setConfirmedOption("");
                          setError(""); // clear error when selecting
                        }}
                        className="accent-blue-600"
                      />
                      Map with other student
                    </label>

                    {/* Option 2 */}
                    <label className="flex items-center gap-2 text-gray-700">
                      <input
                        type="radio"
                        name="unmapOption"
                        value="newParent"
                        checked={selectedOption === "newParent"}
                        onChange={(e) => {
                          setSelectedOption(e.target.value);
                          setConfirmedOption("");
                          setError(""); // clear error when selecting
                        }}
                        className="accent-blue-600"
                      />
                      Add new parent details
                    </label>

                    {/* Go Button */}
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded"
                      onClick={() => {
                        if (!selectedOption) {
                          setError("Please select at least one option.");
                          return;
                        }
                        setError("");
                        setConfirmedOption(selectedOption);
                      }}
                    >
                      Go
                    </button>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <p className="text-red-500 text-sm mt-1 ml-1">{error}</p>
                  )}
                </div>
              </div>

              {confirmedOption === "mapWithOther" && (
                <div className="card p-4 rounded-md ml-32 mr-32 mb-5 bg-white shadow-md">
                  <div className="w-full flex flex-col gap-y-2 md:gap-y-0 md:flex-row">
                    <div className="w-full gap-x-14 md:gap-x-6 md:justify-start my-1 md:my-4 flex md:flex-row">
                      <label
                        className="text-[.9em] mt-1.5 mr-1 md:mr-0"
                        htmlFor="classSelect"
                      >
                        Class
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
                          className="text-[.8em]"
                          styles={customStyles} // Apply custom styles
                          isDisabled={loadingClasses}
                        />
                      </div>
                    </div>

                    <div className=" w-full gap-x-6 relative left-0 md:-left-[5%] justify-between md:w-[98%] my-1 md:my-4 flex md:flex-row">
                      <label
                        className="md:w-[50%] text-[.9em] mt-1.5"
                        htmlFor="studentSelect"
                      >
                        Student Name
                      </label>
                      <div className="w-full md:w-[80%]">
                        <Select
                          id="studentSelect"
                          value={selectedStudent}
                          onChange={handleStudentSelect}
                          options={studentOptions}
                          placeholder={
                            loadingStudents ? "Loading..." : "Select"
                          }
                          isSearchable
                          isClearable
                          className="text-[.8em]"
                          styles={customStyles} // Apply custom styles
                          isDisabled={loadingStudents}
                        />
                        {nameError && (
                          <div className="h-8 relative ml-1 text-danger text-xs">
                            {nameError}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Loading Indicator */}
                  {loadingForSearch && (
                    <div className="flex justify-center items-center h-32 mt-4">
                      <LoaderStyle />
                    </div>
                  )}

                  {/* Result Section (Student Info) */}
                  {!loadingForSearch && parentInformation && (
                    <div className="mt-6 bg-gray-50 p-4 rounded-md">
                      <h6 className="font-semibold text-gray-800 text-md mb-4 border-b pb-2">
                        Student Information
                      </h6>

                      <div
                        className="relative w-[97%] -top-6 h-1 mx-auto"
                        style={{ backgroundColor: "#C03078" }}
                      ></div>

                      {[
                        ["Student Name", formData.stud_name],
                        ["Father's Name", formData.father_name],
                        ["Mother's Name", formData.mother_name],
                        ["Father's Email", formData.father_email],
                        ["Father's Phone", formData.father_phone],
                        ["Mother's Email", formData.mother_email],
                        ["Mother's Phone", formData.mother_phone],
                        ["User ID", formData.user_id],
                      ].map(([label, value], i) => (
                        <div
                          key={i}
                          className="flex flex-col md:flex-row md:items-center gap-y-2 gap-x-8 mb-2"
                        >
                          <label className="block font-semibold text-[1em] md:w-1/3 text-gray-700">
                            {label} :
                          </label>
                          <p className="text-gray-700 relative top-2 md:w-[60%]">
                            {value || "-"}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 flex justify-end gap-2">
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded"
                      onClick={handleSubmit}
                      disabled={isSaving} // Optional: disable during save
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </button>

                    <button
                      type="button"
                      onClick={reset}
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}

              {confirmedOption === "newParent" && (
                <form
                  className="border rounded-lg p-6 mt-4 w-full max-w-4xl mx-auto bg-white shadow mb-5"
                  onSubmit={(e) => {
                    e.preventDefault(); // prevent reload
                    handleSubmit();
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Father Name */}
                    <div>
                      <label className="block font-semibold text-black">
                        Father Name{" "}
                        <span className="text-sm text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="father_name"
                        value={newParent.father_name}
                        onChange={handleNewParentChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                        placeholder="Father Name"
                        required
                      />
                    </div>

                    {/* Mother Name */}
                    <div>
                      <label className="block font-semibold text-black">
                        Mother Name{" "}
                        <span className="text-sm text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="mother_name"
                        value={newParent.mother_name}
                        onChange={handleNewParentChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                        placeholder="Mother Name"
                        required
                      />
                    </div>

                    {/* Father Phone */}
                    <div>
                      <label className="block font-semibold text-black">
                        Father Phone{" "}
                        <span className="text-sm text-red-500">*</span>
                      </label>
                      <input
                        type="phone"
                        name="f_mobile"
                        maxLength={10}
                        value={newParent.f_mobile}
                        // onChange={handleNewParentChange}
                        onChange={(e) => {
                          const onlyDigits = e.target.value.replace(/\D/g, ""); // Remove non-digits
                          setNewParent((prev) => ({
                            ...prev,
                            f_mobile: onlyDigits,
                          }));
                        }}
                        className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                        placeholder="Father Phone"
                        required
                      />
                    </div>

                    {/* Mother Phone */}
                    <div>
                      <label className="block font-semibold text-black">
                        Mother Phone{" "}
                        <span className="text-sm text-red-500">*</span>
                      </label>
                      <input
                        type="phone"
                        name="m_mobile"
                        maxLength={10}
                        value={newParent.m_mobile}
                        onChange={handleNewParentChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                        placeholder="Mother Phone"
                        required
                      />
                    </div>

                    {/* Father Email */}
                    <div>
                      <label className="block font-semibold text-black">
                        Father Email{" "}
                        <span className="text-sm text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="f_email"
                        value={newParent.f_email}
                        onChange={handleNewParentChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                        placeholder="Father Email"
                        required
                      />
                    </div>

                    {/* Mother Email */}
                    <div>
                      <label className="block font-semibold text-black">
                        Mother Email{" "}
                        <span className="text-sm text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="m_email"
                        value={newParent.m_email}
                        onChange={handleNewParentChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                        placeholder="Mother Email"
                        required
                      />
                    </div>
                  </div>

                  {/* Set User ID Option */}
                  <div className="mt-6">
                    <label className="block font-medium mb-2">
                      Set this as UserID:
                    </label>
                    <label className="inline-flex items-center mr-6">
                      <input
                        type="radio"
                        name="userIdOption"
                        value="father"
                        checked={newParent.userIdOption === "father"}
                        onChange={handleNewParentChange}
                        className="mr-2"
                      />
                      Father Email Id
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="userIdOption"
                        value="mother"
                        checked={newParent.userIdOption === "mother"}
                        onChange={handleNewParentChange}
                        className="mr-2"
                      />
                      Mother Email Id
                    </label>
                    {userIdOptionError && (
                      <p className="text-red-500 text-sm mt-1">
                        {userIdOptionError}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex justify-end gap-2">
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded"
                      disabled={isSaving}
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setNewParent({
                          father_name: "",
                          f_mobile: "",
                          f_email: "",
                          mother_name: "",
                          m_mobile: "",
                          m_email: "",
                          userIdOption: "",
                        })
                      }
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded"
                    >
                      Reset
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnmapDetails;
