import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
const AllotRollNumberHouse = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [searchTerm, setSearchTerm] = useState("");
  const [classIdForSearch, setClassIdForSearch] = useState(null);
  const [nameError, setNameError] = useState("");
  const [nameErrorForClass, setNameErrorForClass] = useState("");
  const [nameErrorForDivision, setNameErrorForDivision] = useState("");
  const [nameErrorForStudent, setNameErrorForStudent] = useState("");
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedClassForStudent, setSelectedClassForStudent] = useState(null);
  const [studentInformation, setstudentInformation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingForSearch, setLoadingForSearch] = useState(false);
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [backendErrors, setBackendErrors] = useState({});
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [divisionforForm, setDivisionForForm] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [regId, setRegId] = useState(null);
  const [roleId, setRoleId] = useState(null);
  const studentRefs = useRef({});
  const [studentOptions, setStudentNameWithClassId] = useState([]);
  const [houseOptions, setHouseOptions] = useState([]);

  const token = localStorage.getItem("authToken");
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);

        // 1️⃣ Get session data
        const token = localStorage.getItem("authToken");
        if (!token) {
          toast.error("Authentication token not found. Please login again.");
          navigate("/");
          return;
        }

        const sessionRes = await axios.get(`${API_URL}/api/sessionData`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const roleId = sessionRes?.data?.user?.name;
        const regId = sessionRes?.data?.user?.reg_id;
        if (!roleId || !regId) {
          toast.error("Invalid session data received");
          return;
        }
        setRoleId(roleId);
        setRegId(regId);
        setLoadingClasses(true);
        const responseForClass = await axios.get(
          `${API_URL}/api/get_classes_of_classteacher?teacher_id=${regId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const mappedData =
          responseForClass.data?.data?.map((item) => ({
            value: item.class_id,
            sectionId: item?.section_id,
            label: `${item?.classname} ${item?.sectionname}`,
          })) || [];

        setStudentNameWithClassId(mappedData);
      } catch (error) {
        console.error("Initialization error:", error);
        toast.error("Failed to get classes. Please try again.");
      } finally {
        setLoadingClasses(false);
        setLoading(false);
      }
    };
    init();
    fetchHouses();
  }, []);

  const fetchHouses = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/get_houses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res?.data?.data) {
        setHouseOptions(res?.data?.data); // expected [{id:'D', name:'Diamond'}, ...]
      }
    } catch (err) {
      console.error("Error fetching houses:", err);
    }
  };
  const handleClassSelect = (selectedOption) => {
    setSelectedClass(selectedOption);
    setSelectedDivision(null); // Reset division dropdown
    setDivisionForForm([]); // Clear division options
    setClassIdForSearch(selectedOption?.value);
  };

  // 🔹 Handle search (already similar to your logic)
  const handleSearch = async () => {
    setNameError("");
    setSearchTerm("");
    setNameErrorForClass("");
    setNameErrorForDivision("");
    setNameErrorForStudent("");
    setErrors({}); // Clears all field-specific errors

    let hasError = false;
    if (!selectedClass) {
      setNameErrorForClass("Please select a class.");
      hasError = true;
    }

    if (hasError) return;
    try {
      setLoadingForSearch(true);
      const response = await axios.get(
        `${API_URL}/api/get_studentallotrollnohouse/${selectedClass?.value}/${selectedClass?.sectionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data?.data) {
        setstudentInformation(response.data.data);
      } else {
        toast.error("No data found for the selected class.");
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoadingForSearch(false);
    }
  };

  // 🔹 Handle change for Roll No or House
  const handleInputChange = (e, studentId, field) => {
    const { value } = e.target;

    // 1️⃣ Update studentInformation
    setstudentInformation((prev) =>
      prev.map((stu) =>
        stu.student_id === studentId ? { ...stu, [field]: value } : stu
      )
    );

    // 2️⃣ Remove error for that specific field if user fixes it
    setErrors((prevErrors) => {
      if (!prevErrors[studentId]) return prevErrors; // no errors for this student

      const newErrors = { ...prevErrors };
      const updatedStudentErrors = { ...newErrors[studentId] };

      delete updatedStudentErrors[field]; // remove only this field’s error

      // if no errors left for this student, remove their key
      if (Object.keys(updatedStudentErrors).length === 0) {
        delete newErrors[studentId];
      } else {
        newErrors[studentId] = updatedStudentErrors;
      }

      return newErrors;
    });
  };

  // 🔹 Submit updated student data
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};
    studentInformation.forEach((stu) => {
      if (!stu.roll_no || stu.roll_no === "") {
        newErrors[stu.student_id] = {
          ...(newErrors[stu.student_id] || {}),
          roll_no: "Please enter Roll Number",
        };
      }
      if (!stu.house || stu.house === "") {
        newErrors[stu.student_id] = {
          ...(newErrors[stu.student_id] || {}),
          house: "Please select House",
        };
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix validation errors before submitting.");
      return; // stop submit
    }

    // if validation passed, clear errors
    setErrors({});

    try {
      const payload = {
        students: studentInformation.map((s) => ({
          student_id: s.student_id,
          reg_no: s.reg_no,
          admission_date: s.admission_date,
          stu_aadhaar_no: s.stu_aadhaar_no,
          house: s.house,
          roll_no: s.roll_no,
        })),
      };

      const res = await axios.put(
        `${API_URL}/api/update_studentallotrollnohouse`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 200) {
        toast.success("Student details updated successfully!");
      }
    } catch (err) {
      console.error("Error saving students:", err.response);
      toast.error("Failed to update student details.");
    }
  };

  const filteredParents = useMemo(() => {
    if (!Array.isArray(studentInformation)) return [];

    return studentInformation.filter((student) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (student.roll_no !== null &&
          student.roll_no.toString().toLowerCase().includes(searchLower)) ||
        student.full_name.toLowerCase().includes(searchLower) ||
        student.reg_no.toString().toLowerCase().includes(searchLower)
      );
    });
    // .sort((a, b) => (a.roll_no || 0) - (b.roll_no || 0)); // Sort by roll_no
  }, [studentInformation, searchTerm]);

  const handleNavigation = () => {
    navigate("/dashboard");
  };

  return (
    <div>
      <ToastContainer />

      <div className="md:mx-auto md:w-[90%] p-4 bg-white mt-4 ">
        <div className=" w-full    flex justify-between items-center ">
          <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
            Allot Roll Number & House
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
        <div className="w-full md:container mt-4">
          {/* Search Section */}
          <div className="pt-2 md:pt-4"></div>
          <div className="pt-8 w-full md:w-[50%]  relative ml-0 md:ml-[4%]  border-1 flex justify-start flex-col md:flex-row gap-x-1  bg-white rounded-lg mt-2 md:mt-6 p-2 ">
            {/* <h6 className=" w-[20%] float-start text-nowrap text-blue-600 mt-2.5"></h6> */}

            <div className="w-full flex md:flex-row justify-start items-center">
              <div className="w-full  flex flex-col gap-y-2 md:gap-y-0 md:flex-row">
                <div className="w-full gap-x-1 md:gap-x-6 md:justify-start my-1 md:my-4 flex md:flex-row ">
                  <label
                    className="text-md mt-1.5 mr-1 md:mr-0 inline-flex"
                    htmlFor="classSelect"
                  >
                    Select a Class & Division{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <div className="w-full md:w-[40%]">
                    <Select
                      id="classSelect"
                      value={selectedClass}
                      onChange={handleClassSelect}
                      options={studentOptions}
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
          {/* Form Section - Displayed when studentInformation is fetched */}
          {studentInformation && (
            <div className="w-full md:container mx-auto py-4 px-4 ">
              <div className="card mx-auto w-full shadow-lg">
                <div className="p-1 px-3 bg-gray-100 flex justify-between items-center">
                  <h6 className="text-gray-700 mt-1   text-nowrap">
                    Select Students for allot GR & Aadhaar No.
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
                <div className="card-body w-full ">
                  <div className="h-96 lg:h-96 overflow-y-scroll lg:overflow-x-hidden w-full mx-auto">
                    <div className="bg-white rounded-lg shadow-xs">
                      <table className="min-w-full leading-normal table-auto border border-gray-800">
                        <thead className="bg-gray-200">
                          <tr>
                            <th className="border border-gray-950 p-2 text-center">
                              GRN No.
                            </th>
                            <th className="border border-gray-950 p-2 text-center">
                              Student Name
                            </th>
                            <th className="border border-gray-950 p-2 text-center">
                              <span className="text-red-500">*</span> Roll No
                            </th>
                            <th className="border border-gray-950 p-2 text-center">
                              <span className="text-red-500">*</span> House
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentInformation.length > 0 ? (
                            studentInformation.map((stu, index) => (
                              <tr
                                key={stu.student_id}
                                className={
                                  index % 2 === 0 ? "bg-white" : "bg-gray-100"
                                }
                              >
                                <td className="border border-gray-950 text-center p-2">
                                  {stu.reg_no}
                                </td>
                                <td className="border border-gray-950 text-center p-2">
                                  {stu.full_name}
                                </td>
                                <td className="border border-gray-950 text-center p-2">
                                  <input
                                    type="number"
                                    value={stu.roll_no || ""}
                                    className="w-full border rounded text-center"
                                    onChange={(e) =>
                                      handleInputChange(
                                        e,
                                        stu.student_id,
                                        "roll_no"
                                      )
                                    }
                                  />
                                  {errors[stu.student_id]?.roll_no && (
                                    <p className="text-red-600 text-xs mt-1">
                                      {errors[stu.student_id].roll_no}
                                    </p>
                                  )}
                                </td>
                                <td className="border border-gray-950 text-center p-2">
                                  <select
                                    value={stu.house || ""}
                                    onChange={(e) =>
                                      handleInputChange(
                                        e,
                                        stu.student_id,
                                        "house"
                                      )
                                    }
                                    className="w-full border rounded text-center"
                                  >
                                    <option value="">Select</option>
                                    {houseOptions.map((h) => (
                                      <option
                                        key={h.house_id}
                                        value={h.house_id}
                                      >
                                        {h.house_name}
                                      </option>
                                    ))}
                                  </select>
                                  {errors[stu.student_id]?.house && (
                                    <p className="text-red-600 text-xs mt-1">
                                      {errors[stu.student_id].house}
                                    </p>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan="4"
                                className="text-center text-red-700 p-4 font-semibold"
                              >
                                Oops! No data found..
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>{" "}
                  <div className="col-span-3 mb-2  text-right mt-2">
                    <button
                      type="submit"
                      onClick={handleSubmit}
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
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllotRollNumberHouse;
