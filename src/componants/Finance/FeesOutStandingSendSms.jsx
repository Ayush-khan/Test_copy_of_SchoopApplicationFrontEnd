import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";

const FeesOutStandingSendSms = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [smsSentDates, setSmsSentDates] = useState([]);

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
  const [message, setMessage] = useState(
    "Your child's fees payment is due. Please make the payment at the earliest. If already paid please send details to school admin"
  );
  const messageRef = useRef(null);

  const maxCharacters = 900;

  const navigate = useNavigate();

  // for form
  const [errors, setErrors] = useState({});
  const [backendErrors, setBackendErrors] = useState({});
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

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
        axios.get(`${API_URL}/api/classes `, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      console.log("data of names of class", classResponse.data);

      // Set the fetched data
      //   setClassesforForm(classResponse.data || []);
      setClassesforForm(classResponse.data || []);
      // setStudentNameWithClassId(studentResponse?.data?.data || []);
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
        value: cls.class_id,
        label: `${cls.name}`,

        key: `${cls.class_id}`,
      })),
    [classesforForm]
  );

  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  console.log("seletedStudents[]", selectedStudents);
  useEffect(() => {
    if (selectedTab === "select") {
      setSelectedInstallment({ value: "%", label: "%" });
    } else {
      setSelectedInstallment(null); // clear on switching to installment tab
    }
  }, [selectedTab]);

  const handleSelectAll = () => {
    setSelectAll(!selectAll);

    if (!selectAll) {
      // Select only students with at least one parent email
      const validStudentIds = parentInformation
        .filter((student) => student?.student_installment)
        .map((student) => student.student_installment);

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
    // Reset error messages
    console.log("classId For Search", classIdForSearch);
    console.log("installment ", selectedInstallment?.value || "%");
    setNameError("");
    setSearchTerm("");
    setNameErrorForClass("");
    setNameErrorForClassForStudent("");
    setNameErrorForStudent("");
    setErrors({});

    let hasError = false;
    if (!selectedClass) {
      setNameErrorForClass("Please select a class.");
      hasError = true;
    }

    // If there are validation errors, exit the function
    if (hasError) return;

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
      // console.log(`${API_URL}/api/get_sendsmsforfeespendingdata/${classIdForSearch}/${selectedInstallment?.value || "%"}`)
      const response = await axios.get(
        `${API_URL}/api/get_sendsmsforfeespendingdata/${classIdForSearch}/${
          selectedInstallment?.value || "%"
        }`,
        {
          headers: { Authorization: `Bearer ${token}` }, // Pass query parameters here
        }
      );
      console.log("response of the fees pending data", response.data);

      // Check if data was received and update the form state
      if (response?.data) {
        const fetchedData = response?.data; // Extract the data
        setParentInformation(response?.data?.data); // Assuming response data contains form data

        // Populate formData with the fetched data
      } else {
        console.log("reponse", response.data.status);

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
        "Please select at least one student to send their User ID to the parents."
      );
      hasError = true;
    }
    if (message.length === 0) {
      setErrors("Message is required.");
      toast.error("Message is required.");
      messageRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      messageRef.current?.focus();
      hasError = true;
    } else {
      setErrors(""); // clear error if valid
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
        studentid_installment: selectedStudents,
        message: message,
        // tclass_id: selectedClassForStudent.value, // Replace with actual target class ID
        // tsection_id: selectedStudentForStudent.value, // Replace with actual target section ID
      };

      // Make the API call
      const response = await axios.post(
        `${API_URL}/api/send_sendsmsforfeespending`,
        postData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Handle successful response
      if (response.status === 200) {
        toast.success("Send message for pending fees successfully!");
        setSelectedClass(null);
        setSelectedInstallment(null);
        setMessage(
          "Your child's fees payment is due. Please make the payment at the earliest. If already paid please send details to school admin"
        );

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
      toast.error("An error occurred while sending fees pending.");

      if (error.response && error.response.data) {
        setBackendErrors(error.response.data || {});
      }
    } finally {
      setLoading(false); // Stop loading
    }
  };
  const handleOpenSmsModal = (dates) => {
    setSmsSentDates(dates);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setSmsSentDates([]);
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
  const getInstallmentOptions = () => {
    if (selectedTab === "select") {
      return [{ value: "%", label: "%" }];
    }

    let options = [
      { value: "1", label: "Installment 1" },
      { value: "2", label: "Installment 2" },
      { value: "3", label: "Installment 3" },
    ];

    // Add Installment 4 if class name is "10"
    if (selectedClass?.label === "10") {
      options.push({ value: "4", label: "CBSE Exam Fee" });
    }

    return options;
  };
  const filteredParents = parentInformation
    ? parentInformation.filter((student) => {
        const searchLower = searchTerm.toLowerCase();
        console.log(student);

        return (
          // Filter by roll number
          (student.roll_no !== null &&
            student.roll_no.toString().toLowerCase().includes(searchLower)) ||
          // Filter by full name
          `${student.first_name || ""} ${student.mid_name || ""} ${
            student.last_name || ""
          }`
            .toLowerCase()
            .includes(searchLower)
        );
      })
    : [];
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year.slice(-2)}`;
  };

  return (
    <div>
      <ToastContainer />

      <div className="md:mx-auto md:w-[95%] p-4 bg-white mt-4 ">
        <div className=" card-header  flex justify-between items-center  ">
          <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
            Send SMS for outstanding fee
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
        <div className="     w-full md:container mt-4">
          {/* Search Section */}
          <div className="pt-2 md:pt-4"></div>
          <div className="pt-8 w-full md:w-[80%]  relative ml-0 md:ml-[10%]  border-1 flex justify-start flex-col md:flex-row gap-x-1  bg-white rounded-lg    mt-2 md:mt-6 p-2 ">
            <h6 className=" w-[20%] float-start text-nowrap text-blue-600 mt-2.5"></h6>

            <div className="w-full    flex md:flex-row justify-start items-center">
              <div className="w-full  flex flex-col gap-y-2 md:gap-y-0 md:flex-row">
                <div className="w-full gap-x-14 md:gap-x-6 md:justify-start my-1 md:my-4 flex md:flex-row">
                  <label
                    className="text-md mt-1.5 mr-1 md:mr-0"
                    htmlFor="classSelect"
                  >
                    Class <span className="text-red-500">*</span>
                  </label>
                  <div className="w-full md:w-[57%]">
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
                </div>
                <div className="w-full gap-x-14 md:gap-x-6 md:justify-start my-1 md:my-4 flex md:flex-row">
                  <label
                    className="text-md mt-1.5 mr-1 md:mr-0"
                    htmlFor="installmentSelect"
                  >
                    Installment
                  </label>
                  <div className="w-full md:w-[57%]">
                    <Select
                      id="installmentSelect"
                      value={selectedInstallment}
                      onChange={(option) => setSelectedInstallment(option)}
                      options={getInstallmentOptions()}
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
                            <th className="px-2 w-full md:w-[5%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Roll No
                            </th>
                            <th className="px-2 w-full md:w-[20%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Student Name
                            </th>
                            <th className="px-2 w-full md:w-[8%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Class
                            </th>
                            <th className="px-2 w-full md:w-[10%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Phone no.
                            </th>
                            <th className="px-2 w-full md:w-[8%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Fees category
                            </th>
                            <th className="px-2 w-full md:w-[7%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Installment no.
                            </th>
                            <th className="px-2 w-full md:w-[10%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Installment amount
                            </th>
                            <th className="px-2 w-full md:w-[9%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Amount Paid
                            </th>
                            <th className="px-2 w-full md:w-[7%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              No. of SMS Sent
                            </th>
                            <th className="px-2 w-full md:w-[20%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              SMS Sent on
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
                                {/* <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
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
                                </td> */}
                                <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                                  <p className="text-gray-900 whitespace-no-wrap relative top-2">
                                    <input
                                      type="checkbox"
                                      checked={selectedStudents.includes(
                                        student.student_installment
                                      )}
                                      onChange={() =>
                                        handleCheckboxChange(
                                          student.student_installment
                                        )
                                      }
                                      className="cursor-pointer"
                                    />
                                  </p>
                                </td>

                                <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                                  <p className="text-gray-900 whitespace-no-wrap relative top-2">
                                    {student.roll_no === 0
                                      ? "0"
                                      : student.roll_no || ""}
                                  </p>
                                </td>
                                <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                                  <p className="text-gray-900 whitespace-no-wrap relative top-2">
                                    {student.first_name || ""}{" "}
                                    {student.mid_name || ""}{" "}
                                    {student.last_name || ""}{" "}
                                  </p>
                                </td>
                                <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                                  <p className="text-gray-900 whitespace-no-wrap relative top-2">
                                    {student.classname}
                                  </p>
                                </td>
                                <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                                  <p className="text-gray-900 whitespace-no-wrap relative top-2">
                                    {student?.phone_no || ""}
                                  </p>
                                </td>
                                <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                                  <p className="text-gray-900 whitespace-no-wrap relative top-2">
                                    {student?.fees_category_name || ""}
                                  </p>
                                </td>
                                <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                                  <p className="text-gray-900 whitespace-no-wrap relative top-2">
                                    {student?.installment || ""}
                                  </p>
                                </td>
                                <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                                  <p className="text-gray-900 whitespace-no-wrap relative top-2">
                                    {student?.actualinstallmentamt || ""}
                                  </p>
                                </td>
                                <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                                  <p className="text-gray-900 whitespace-no-wrap relative top-2">
                                    {student?.paid_amount || ""}
                                  </p>
                                </td>
                                {/* <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                                  <p className="text-gray-900 whitespace-no-wrap relative top-2">
                                    {student?.smscount || ""}
                                  </p>
                                </td> */}
                                <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                                  {student?.smscount > 0 ? (
                                    <button
                                      title="View SMS History"
                                      className="flex items-center gap-1 mx-auto bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium py-1 px-3 rounded-full shadow-md hover:shadow-lg transition-all duration-200 ease-in-out text-sm"
                                      onClick={() =>
                                        handleOpenSmsModal(
                                          student?.smssentdates || []
                                        )
                                      }
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8-1.95 0-3.743-.57-5.172-1.537L3 21l1.768-4.424C4.29 15.436 4 13.758 4 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                        />
                                      </svg>
                                      {student?.smscount}
                                    </button>
                                  ) : null}
                                </td>

                                <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                                  <p className="text-gray-900 whitespace-no-wrap relative top-2">
                                    {student?.lastsmsdate || ""}
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
                        <div className="flex justify-center mt-2">
                          <div className="w-full md:w-[50%] relative">
                            <textarea
                              ref={messageRef}
                              value={message}
                              onChange={(e) => {
                                if (e.target.value.length <= maxCharacters) {
                                  setMessage(e.target.value);
                                }
                              }}
                              className="w-full h-28 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-150 resize-none"
                              placeholder="Enter message"
                            ></textarea>
                            {errors && (
                              <p className="text-red-600 text-sm mt-1">
                                {errors.message}
                              </p>
                            )}
                            <div className="absolute bottom-2 right-3 text-xs text-gray-500 pointer-events-none">
                              {message.length} / {maxCharacters}
                            </div>
                          </div>
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
                        "Send SMS"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-2 py-2 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8-1.95 0-3.743-.57-5.172-1.537L3 21l1.768-4.424C4.29 15.436 4 13.758 4 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <h2 className="text-lg font-semibold text-gray-700">
                  SMS Sent History
                </h2>
              </div>
              <RxCross1
                className="text-3xl  text-red-600 cursor-pointer hover:bg-transparent p-1 rounded-full"
                onClick={handleCloseModal}
              />
            </div>

            {/* Divider */}
            <div className="w-[95%] h-[2px] mx-auto bg-gradient-to-r from-pink-500 to-pink-900 mb-2"></div>

            {/* Modal Content */}
            <div className="px-6 pb-2">
              {smsSentDates?.length > 0 ? (
                <div className="space-y-3">
                  {smsSentDates.map((sms, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md px-4 py-2 shadow-sm hover:shadow-md transition"
                    >
                      <span className="text-sm text-gray-500">{index + 1}</span>
                      <span className="text-gray-800 font-medium">
                        {formatDate(sms?.date_sms_sent)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic text-center mt-4">
                  No SMS records found for this student.
                </p>
              )}
            </div>
            {/* Footer Button */}
            <div className="flex justify-end items-end mr-5 py-2 ">
              <button
                onClick={handleCloseModal}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-6 py-1 rounded-md shadow-md transition-all"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeesOutStandingSendSms;
