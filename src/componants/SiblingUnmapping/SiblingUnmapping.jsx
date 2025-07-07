import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
import LoaderStyle from "../common/LoaderFinal/LoaderStyle";

const SiblingUnmapping = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudentForSecond, setSelectedStudentForSecond] =
    useState(null);
  const [classesforForm, setClassesforForm] = useState([]);
  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
  const [classesforFormForSecond, setClassesforFormForSecond] = useState([]);
  const [studentNameWithClassIdForSecond, setStudentNameWithClassIdForSecond] =
    useState([]);
  const [classIdForSearch, setClassIdForSearch] = useState(null);

  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedStudentIdForSecond, setSelectedStudentIdForSecond] =
    useState(null);
  const [radioButtonError, setRadioButtonError] = useState("");
  const [nameError, setNameError] = useState("");
  const [nameErrorForClass, setNameErrorForClass] = useState("");
  const [nameErrorForSecond, setNameErrorForSecond] = useState("");
  const [nameErrorForClassForSecond, setNameErrorForClassForSecond] =
    useState("");
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedClassForSecond, setSelectedClassForSecond] = useState(null);

  const [parentInformation, setParentInformation] = useState(null);
  const [parentInformationForSecond, setParentInformationForSecond] =
    useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingForSearch, setLoadingForSearch] = useState(false);
  const [loadingForSearchForSecond, setLoadingForSearchForSecond] =
    useState(false);

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
    stud_name: "", // Combined name with class and division
    father_name: "",
    mother_name: "", // Added mother's name
    father_email: "",
    father_phone: "",
    mother_email: "",
    mother_phone: "",
    user_id: "", // User ID set as Parent (Father Phone here)
  });

  const [formDataForSecond, setFormDataForSecond] = useState({
    stud_name: "", // Combined name with class and division
    father_name: "",
    mother_name: "", // Added mother's name
    father_email: "",
    father_phone: "",
    mother_email: "",
    mother_phone: "",
    user_id: "", // User ID set as Parent (Father Phone here)
  });

  const [errors, setErrors] = useState({});
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingClassesForSecond, setLoadingClassesForSecond] = useState(false);
  const [loadingStudentsForSecond, setLoadingStudentsForSecond] =
    useState(false);

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
      siblings: [], //  Reset siblings as well
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    let hasError = false;

    if (!selectedStudentId) {
      setNameError("Please select a student.");
      hasError = true;
    }
    if (!selectedStudentIdForSecond) {
      setNameErrorForSecond("Please select a student.");
      hasError = true;
    }
    if (!selectedParent) {
      setRadioButtonError(
        "Please select any one of 'Set this as parent' option."
      );
      hasError = true;
    }
    if (hasError) {
      return;
    }
    // Validation checks
    if (selectedStudentId === selectedStudentIdForSecond) {
      toast.error(
        " Both students cannot be the same. Please select different students!",
        {
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
      return;
    }
    // Prepare the data format as per requirement
    const requestData = {
      operation: "create",
      set_as_parent: selectedParent, // Example: "2" if parent 2 is selected
      student_id1: selectedStudentId,
      student_id2: selectedStudentIdForSecond,
      parent_id1: formData?.parent_id || " ", // Ensure these are set properly
      parent_id2: formDataForSecond?.parent_id || " ",
    };

    console.log("Request Data:", requestData);

    try {
      setLoading(true);

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token is found");
      }

      const response = await axios.post(
        `${API_URL}/api/save_siblingmapping`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Student Mapping successfully!");

        // Reset form data and selections
        setSelectedStudent(null);
        setSelectedStudentForSecond(null);
        setSelectedClass(null);
        setSelectedClassForSecond(null);
        setSelectedParent("");
        setParentInformation(null);
        setParentInformationForSecond(null);
        setNameError("");
        setNameErrorForSecond("");
        setRadioButtonError("");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "An error occurred!");
      console.error("Error:", error.response || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = () => {
    navigate("/dashboard");
  };

  return (
    <div>
      <ToastContainer />

      <div className=" w-full md:w-[80%] mt-4 mx-auto">
        <div className="card mx-auto lg:w-[100%] shadow-lg">
          <div className=" w-full  p-2 px-3 bg-gray-100 flex justify-between items-center ">
            <h3 className=" w-full text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
              Sibling Unmapping
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
              {/* Search Section */}
              <div className=" w-[70%] border-1  flex justify-left flex-col md:flex-row gap-x-1  bg-white rounded-lg  border-gray-300 shadow-md  mx-auto mt-6 p-6 mb-4 ">
                <div className="w-[99%] flex md:flex-row justify-between items-center ">
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
                </div>
              </div>

              {/* Form Section - Displayed when parentInformation is fetched */}

              {loadingForSearch ? (
                <div className="flex justify-center items-center h-44">
                  <LoaderStyle />
                </div>
              ) : (
                parentInformation && (
                  <div className="card p-4 rounded-md m-5">
                    {/* Two-column layout */}
                    <div className="flex flex-col md:flex-row bg-gray-50 shadow-md p-4 pt-0 mb-4 gap-6">
                      {/* Student Information */}
                      <form
                        onSubmit={handleSubmit}
                        className="w-full md:w-1/2 px-2"
                      >
                        <h6 className="font-semibold text-gray-800 mt-3 text-md mb-4 border-b pb-2">
                          Student Information
                        </h6>

                        <div
                          className=" relative w-[97%] -top-6 h-1  mx-auto bg-red-700"
                          style={{
                            backgroundColor: "#C03078",
                          }}
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
                              {value || ""}
                            </p>
                          </div>
                        ))}
                      </form>

                      {/* Sibling Information */}
                      <div className="w-full md:w-1/2 px-2">
                        <h6 className="font-semibold text-gray-800 mt-3 text-md mb-4 border-b pb-2">
                          Sibling Information
                        </h6>

                        <div
                          className="relative w-[97%] -top-6 h-1 mx-auto bg-red-700"
                          style={{
                            backgroundColor: "#C03078",
                          }}
                        ></div>

                        {formData?.siblings?.length > 0 ? (
                          formData.siblings.map((sibling, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center mb-2"
                              // flex justify-between items-center border p-4 rounded-md mb-2 bg-blue-50
                            >
                              {/* Left: Sibling Label + Info */}
                              <div className="flex flex-col">
                                <span className="text-gray-700">
                                  {`${sibling.first_name || ""} ${
                                    sibling.mid_name || ""
                                  } ${sibling.last_name || ""}`.trim() ||
                                    "Name not available"}{" "}
                                  (
                                  {sibling.get_class?.name ||
                                    "Class not available"}{" "}
                                  -{" "}
                                  {sibling.get_division?.name ||
                                    "Section not available"}
                                  )
                                </span>
                              </div>

                              {/* Right: Unmap Button */}
                              <button
                                type="button"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                                onClick={() =>
                                  navigate(
                                    `/unmapdetails/edit/${sibling.student_id}`,
                                    {
                                      state: {
                                        studentName: `${
                                          sibling.first_name || ""
                                        } ${sibling.mid_name || ""} ${
                                          sibling.last_name || ""
                                        }`.trim(),
                                      },
                                    }
                                  )
                                }
                              >
                                UnMap
                              </button>
                            </div>
                          ))
                        ) : (
                          <div>
                            {/* <h3>Siblings</h3> */}
                            <p className="text-gray-600">
                              No siblings available.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiblingUnmapping;
