import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";

const StudentAbsent = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudentForStudent, setSelectedStudentForStudent] =
    useState(null);
  const [classesforForm, setClassesforForm] = useState([]);
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
  const [selectedTab, setSelectedTab] = useState("installment");
  const [message, setMessage] = useState("");

  const maxCharacters = 150;

  const navigate = useNavigate();

  // for form
  const [errors, setErrors] = useState({});
  const [backendErrors, setBackendErrors] = useState({});
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // format YYYY-MM-DD
  });

  const academicYrFrom = localStorage.getItem("academic_yr_from");
  const academicYrTo = localStorage.getItem("academic_yr_to");

  const toTitleCase = (str = "") => {
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  useEffect(() => {
    // Fetch both classes and student names on component mount
    fetchInitialDataAndStudents();
  }, []);

  const fetchInitialDataAndStudents = async () => {
    try {
      setLoadingClasses(true);
      setLoadingStudents(true);

      const token = localStorage.getItem("authToken");

      // Fetch classes and students concurrently
      const [classResponse] = await Promise.all([
        axios.get(`${API_URL}/api/sections `, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      console.log("data of names of class", classResponse.data);

      setClassesforForm(classResponse.data || []);
    } catch (error) {
      toast.error("Error fetching Class data.");
    } finally {
      // Stop loading for both dropdowns
      setLoadingClasses(false);
      setLoadingStudents(false);
    }
  };

  const handleClassSelect = (selectedOption) => {
    console.log("selectedoption", selectedOption?.key);
    setNameErrorForClass("");
    setSelectedClass(selectedOption);
    setSelectedStudent(null);
    setSelectedStudentId(null);
    setClassIdForSearch(selectedOption?.key);
  };

  // Dropdown options
  const classOptions = useMemo(
    () =>
      classesforForm.map((cls) => ({
        value: cls.department_id,
        label: `${cls.name}`,

        key: `${cls.department_id}`,
      })),
    [classesforForm]
  );

  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  console.log("seletedStudents[]", selectedStudents);

  // utility: generate percentage options
  // const getInstallmentOptions = () => {
  //   const options = [];
  //   for (let i = 60; i <= 100; i += 5) {
  //     options.push({ value: i, label: `${i}%` });
  //   }
  //   return options;
  // };

  const getInstallmentOptions = () =>
    Array.from({ length: 9 }, (_, i) => {
      const value = 60 + i * 5; // 60, 65, 70, ... 100
      return { value, label: `${value}%` };
    });

  // generate options once
  const installmentOptions = getInstallmentOptions();

  // set default value to 75% from the same list
  const [selectedInstallment, setSelectedInstallment] = useState(
    installmentOptions.find((opt) => opt.value === 75) || null
  );

  useEffect(() => {
    if (!selectedInstallment) {
      setSelectedInstallment(
        installmentOptions.find((opt) => opt.value === 75)
      );
    }
  }, [installmentOptions]);

  const handleSelectAll = () => {
    setSelectAll(!selectAll);

    if (!selectAll) {
      // Select only students with at least one parent email
      const validStudentIds = parentInformation
        .filter((student) => student?.student_id)
        .map((student) => student.student_id);

      setSelectedStudents(validStudentIds);
    } else {
      // Deselect all students
      setSelectedStudents([]);
    }
  };

  const handleCheckboxChange = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const handleSearch = async () => {
    setNameError("");
    setSearchTerm("");
    setNameErrorForClass("");
    setNameErrorForClassForStudent("");
    setNameErrorForStudent("");
    setErrors({});

    let hasError = false;
    if (!selectedClass) {
      setNameErrorForClass("Please select a section.");
      hasError = true;
    }

    if (!selectedDate) {
      setNameErrorForStudent("Please select a date.");
      hasError = true;
    }

    if (hasError) return;

    try {
      setParentInformation(null);
      setSelectedStudentForStudent(null);
      setSelectedStudentForStudent([]);
      setSelectedClassForStudent(null);
      setSelectedClassForStudent([]);
      setSelectedStudents([]);
      setSelectAll(false);
      setLoadingForSearch(true);

      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/get_studentslistattendance`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            department_id: classIdForSearch,
            threshold: selectedInstallment?.value || "%",
            end_date: selectedDate,
          },
        }
      );

      console.log("response of the student absent data", response.data);

      if (response?.data) {
        setParentInformation(response?.data?.data);
      } else {
        toast.error("No data found for the selected class.");
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
    if (selectedStudents.length === 0) {
      toast.error(
        "Please select at least one student to send message to the parents."
      );
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

      const postData = {
        student_id: selectedStudents,
        message: message,
      };

      // Make the API call
      const response = await axios.post(
        `${API_URL}/api/send_messageforattendance`,
        postData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Handle successful response
      if (response.status === 200) {
        toast.success("Message sended successfully!");
        setSelectedClass(null);
        setSelectedInstallment(null);
        setMessage("");

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
      toast.error("An error occurred while sending message.");

      if (error.response && error.response.data) {
        setBackendErrors(error.response.data || {});
      }
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const filteredParents = parentInformation
    ? parentInformation.filter((student) => {
        const searchLower = searchTerm.trim().toLowerCase();

        const fullName = `${student.first_name || ""} ${
          student.mid_name || ""
        } ${student.last_name || ""}`
          .toLowerCase()
          .trim();

        const className = `${student.classname || ""} ${
          student.sectionname || ""
        }`
          .toLowerCase()
          .trim();

        return (
          fullName.includes(searchLower) || className.includes(searchLower)
        );
      })
    : [];

  return (
    <div>
      <ToastContainer />

      <div className="md:mx-auto md:w-[90%] p-4 bg-white mt-4 ">
        <div className=" card-header  flex justify-between items-center  ">
          <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
            Student's Attendance Less than 75%
          </h3>
          <RxCross1
            className="float-end relative -top-1 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
            onClick={() => {
              navigate("/dashboard");
            }}
          />
        </div>
        <div
          className=" relative  mb-8   h-1  mx-auto bg-red-700"
          style={{
            backgroundColor: "#C03078",
          }}
        ></div>
        <div className="w-full md:container">
          {/* Search Section */}
          <div className="w-[90%] ml-6 flex md:flex-row justify-start items-center">
            <div className="w-full  flex flex-col gap-y-2 md:gap-y-0 md:flex-row">
              <div className="w-full gap-x-14 md:gap-x-6 md:justify-start my-1 md:my-4 flex md:flex-row">
                <label
                  className="text-md mt-1.5 mr-1 md:mr-0"
                  htmlFor="classSelect"
                >
                  Section<span className="text-red-500">*</span>
                </label>
                <div className="w-full md:w-[57%]">
                  <Select
                    id="classSelect"
                    value={selectedClass}
                    onChange={handleClassSelect}
                    options={classOptions}
                    placeholder={
                      loadingClasses ? "Loading section..." : "Select"
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
              </div>

              <div className="w-full gap-x-14 md:gap-x-6 md:justify-start my-1 md:my-4 flex md:flex-row">
                <label
                  className="text-md mt-1.5 mr-1 md:mr-0"
                  htmlFor="installmentSelect"
                >
                  Less Than
                </label>
                <div className="w-full md:w-[57%]">
                  <Select
                    id="installmentSelect"
                    value={selectedInstallment}
                    onChange={setSelectedInstallment}
                    options={installmentOptions}
                    placeholder="Select"
                    isSearchable
                    // isClearable
                    className="text-sm"
                    styles={{
                      menu: (provided) => ({
                        ...provided,
                        zIndex: 1050,
                      }),
                    }}
                  />
                </div>
              </div>

              <div className="w-full gap-x-14 md:gap-x-6 md:justify-start my-1 md:my-4 flex md:flex-row">
                <label
                  className="text-md mt-1.5 mr-1 md:mr-0"
                  htmlFor="dateSelect"
                >
                  By Date <span className="text-red-500">*</span>
                </label>
                <div className="w-full md:w-[57%]">
                  <input
                    type="date"
                    id="dateSelect"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      if (e.target.value) {
                        setNameErrorForStudent("");
                      }
                    }}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={academicYrFrom}
                    max={academicYrTo}
                  />
                  {nameErrorForStudent && (
                    <div className="h-8 relative ml-1 text-danger text-xs">
                      {nameErrorForStudent}
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

          {/* Form Section - Displayed when parentInformation is fetched */}
          {parentInformation && (
            <div className="w-full md:container mx-auto py-4 px-4 ">
              <div className="card mx-auto w-full shadow-lg">
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
                <div className="card-body w-full ">
                  <div className="h-96 lg:h-96 overflow-y-scroll lg:overflow-x-hidden w-full mx-auto">
                    <div className="bg-white rounded-lg shadow-xs">
                      <table className="min-w-full leading-normal table-auto">
                        <thead className=" ">
                          <tr className="bg-gray-200 ">
                            <th className="px-2 text-center w-full md:w-[4%] lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Sr. No
                            </th>
                            <th className="px-2 text-center w-full md:w-[4%]  lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              <input
                                type="checkbox"
                                checked={selectAll}
                                onChange={handleSelectAll}
                                className="cursor-pointer"
                              />{" "}
                              All
                            </th>

                            <th className="px-2 w-full md:w-[20%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Student Name
                            </th>
                            <th className="px-2 w-full md:w-[8%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Class
                            </th>
                            <th className="px-2 w-full md:w-[10%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Attendance
                            </th>
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
                                <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                                  <p className="text-gray-900 whitespace-no-wrap relative top-2">
                                    <input
                                      type="checkbox"
                                      checked={selectedStudents.includes(
                                        student.student_id
                                      )}
                                      onChange={() =>
                                        handleCheckboxChange(student.student_id)
                                      }
                                      className="cursor-pointer"
                                    />
                                  </p>
                                </td>

                                <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                                  <p className="text-gray-900 whitespace-no-wrap relative top-2">
                                    {toTitleCase(
                                      `${student.first_name || ""} ${
                                        student.mid_name || ""
                                      } ${student.last_name || ""}`
                                    )}
                                  </p>
                                </td>

                                <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                                  <p className="text-gray-900 whitespace-no-wrap relative top-2">
                                    {student.classname} {student.sectionname}
                                  </p>
                                </td>

                                <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                                  <p className="text-gray-900 whitespace-no-wrap relative top-2">
                                    {student?.attendance_percentage || ""}
                                    {" %"}
                                  </p>
                                </td>
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
                      {filteredParents.length > 0 && (
                        <div className="flex flex-col items-center mt-2">
                          <div className="w-full md:w-[50%]">
                            <label className="mb-1 font-normal block text-left">
                              Dear Parent ,
                            </label>

                            <div className="relative w-full">
                              <textarea
                                value={message}
                                onChange={(e) => {
                                  if (e.target.value.length <= maxCharacters) {
                                    setMessage(e.target.value);
                                  }
                                }}
                                className="w-full h-28 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-150 resize-none bg-transparent relative z-10 text-sm  text-black font-normal"
                                placeholder="Enter message"
                              ></textarea>

                              {message && (
                                <div className="pointer-events-none absolute top-0 left-0 w-full h-full p-3 text-gray-400 whitespace-pre-wrap break-words text-sm  font-normal ">
                                  {message + "  "}Login to school application
                                  for details - Evolvu
                                </div>
                              )}

                              <div className="absolute bottom-2 right-3 text-xs text-gray-500 pointer-events-none z-20">
                                {message.length} / {maxCharacters}
                              </div>
                            </div>
                          </div>

                          {/* <div className="w-full md:w-[50%]">
                            <label className="mb-1 font-normal block text-left">
                              Dear Parent ,
                            </label>

                            <div className="relative w-full">
                              <textarea
                                value={message}
                                onChange={(e) => {
                                  if (e.target.value.length <= maxCharacters) {
                                    setMessage(e.target.value);
                                  }
                                }}
                                className="w-full h-28 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-150 resize-none bg-transparent relative z-10 text-sm text-black font-normal"
                                placeholder="Enter message"
                              ></textarea>

                              <div className="absolute bottom-2 right-3 text-xs text-gray-500 pointer-events-none z-20">
                                {message.length} / {maxCharacters}
                              </div>
                            </div>

                            {message && (
                              <label className="text-gray-400 text-sm font-normal block text-left">
                                Login to school application for details - Evolvu
                              </label>
                            )}
                          </div> */}
                        </div>
                      )}
                    </div>
                  </div>{" "}
                  <div className="text-center">
                    <p className="text-blue-500 font-semibold mt-1">
                      Selected Students:{" "}
                      <h6 className=" inline text-pink-600">
                        {selectedStudents.length}
                      </h6>
                    </p>
                  </div>
                  <div className="col-span-3 mb-2  text-right">
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
                          Sending...
                        </span>
                      ) : (
                        "Send Message"
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

export default StudentAbsent;

{
  /* <div className="relative w-full">
                              <textarea
                                value={message}
                                onChange={(e) => {
                                  if (e.target.value.length <= maxCharacters) {
                                    setMessage(e.target.value);
                                  }
                                }}
                                className="w-full h-28 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-150 resize-none bg-transparent relative z-10 text-sm  text-black font-normal"
                                placeholder="Enter message"
                              ></textarea>

                              {message && (
                                <div className="pointer-events-none absolute top-0 left-0 w-full h-full p-3 text-gray-400 whitespace-pre-wrap break-words text-sm  font-normal ">
                                  {message + "  "}Login to school application
                                  for details - Evolvu
                                </div>
                              )}

                              <div className="absolute bottom-2 right-3 text-xs text-gray-500 pointer-events-none z-20">
                                {message.length} / {maxCharacters}
                              </div>
                            </div> */
}

// correct

{
  /* <div className="relative w-full">
                              <textarea
                                value={message}
                                onChange={(e) => {
                                  if (e.target.value.length <= maxCharacters) {
                                    setMessage(e.target.value);
                                  }
                                }}
                                className="w-full h-28 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-150 resize-none bg-transparent relative z-10 text-sm text-black font-normal"
                                placeholder="Enter message"
                              ></textarea>

                              {message && (
                                <div className="pointer-events-none absolute top-0 left-0 w-full h-full p-3 text-gray-400 whitespace-pre-wrap break-words text-sm font-normal z-0">
                                  {`${"      ".repeat(message.length)}`}Login to
                                  school application for details - Evolvu
                                </div>
                              )}

                              <div className="absolute bottom-2 right-3 text-xs text-gray-500 pointer-events-none z-20">
                                {message.length} / {maxCharacters}
                              </div>
                            </div> */
}
