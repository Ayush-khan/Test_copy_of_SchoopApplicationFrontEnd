import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import { RxCross1 } from "react-icons/rx";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";

const UpdateStudentIdCards = () => {
  const API_URL = import.meta.env.VITE_API_URL; // URL for host
  const [classes, setClasses] = useState([]);
  const [pendingstudents, setPendingstudents] = useState([]);
  const [classIdForManage, setclassIdForManage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  //   variable to store the respone of the allot pendingstudent tab
  const [nameError, setNameError] = useState(null);
  //   const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pageSize = 10;

  // for react-search of manage tab teacher Edit and select class
  const [selectedClass, setSelectedClass] = useState(null);
  const navigate = useNavigate();
  // State for form fields and validation errorsconst
  const [loading, setLoading] = useState(false); // For loader
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [parentsData, setParentsData] = useState([]);
  const [selectedFathers, setSelectedFathers] = useState([]);
  const [errors, setErrors] = useState({});

  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");

  // Custom styles for the close button
  const classOptions = useMemo(
    () =>
      classes.map((cls) => ({
        value: { class_id: cls.class_id, section_id: cls.section_id }, // Store both values
        label: `${cls?.get_class?.name} ${cls.name}`, // Display class name & section
      })),
    [classes]
  );

  const handleClassSelect = (selectedOption) => {
    setNameError("");
    setSelectedClass(selectedOption);
    setclassIdForManage(selectedOption ? selectedOption.value : null);
    setPendingstudents([]); // Clear student list when class is changed
  };

  // Fetch initial data (classes with student count) and display loader while loading
  const fetchClassNameswithSection = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const classResponse = await axios.get(
        `${API_URL}/api/getallClassWithStudentCount`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setClasses(classResponse.data || []);
    } catch (error) {
      toast.error("Error fetching initial data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (isSubmitting) return; // Prevent multiple submissions
    setIsSubmitting(true);

    // Reset selectedClass when search is triggered

    setNameError("");

    if (!classIdForManage) {
      setNameError("Please select a Class.");
      setIsSubmitting(false);
      return;
    }

    setLoading(true);
    setSearchTerm(""); // Reset search term before starting a new search

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Authentication token is missing. Please log in.");
        throw new Error("Authentication token is missing.");
      }

      const { class_id, section_id } = classIdForManage || {};
      if (!class_id || !section_id) {
        toast.error("Invalid class selection. Please try again.");
        throw new Error("Class ID or Section ID is missing.");
      }

      const response = await axios.get(
        `${API_URL}/api/get_update_idcard_data_by_teacher?section_id=${section_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const studentData = response.data?.data;
      if (!Array.isArray(studentData) || studentData.length === 0) {
        toast.error("No Update students found for this class.");
        setParentsData([]);
        setPendingstudents([]);
        return;
      }

      console.log("Extracted Update Student List:", studentData);

      setPendingstudents(studentData); // Update student data in state
      setParentsData(studentData); // Store parents data for editing
      setPageCount(Math.ceil(studentData.length / pageSize)); // Update pagination
      setCurrentPage(0);
    } catch (error) {
      console.error("Error fetching student details:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch student details. Please try again."
      );
    } finally {
      setLoading(false);
      setIsSubmitting(false); // Set submitting state back to false
    }
  };

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm]);

  // const handleInputChange = (e, field, index) => {
  //   const { value } = e.target;

  //   // Update validation errors
  //   setErrors((prev) => ({
  //     ...prev,
  //     [`${index}-${field}`]: value.trim() ? "" : `${field} is required`,
  //   }));

  //   // Update the pending student directly
  //   setPendingstudents((prev) =>
  //     prev.map((student, i) =>
  //       i === index
  //         ? {
  //             ...student,
  //             [field]: value, // 👈 Update top-level field here
  //           }
  //         : student
  //     )
  //   );
  // };

  const handleInputChange = (e, field, index) => {
    const { value, dataset } = e.target;
    const parent_id = dataset.parentId;

    console.log("parent_id", parent_id);

    // Update validation errors
    setErrors((prev) => ({
      ...prev,
      [`${index}-${field}`]: value.trim() ? "" : `${field} is required`,
    }));

    // Update the pending student directly
    setPendingstudents((prev) =>
      prev.map((student, i) =>
        i === index
          ? {
              ...student,
              [field]: value,
              parent_id: parent_id || student.parent_id, // ensure parent_id stays consistent
            }
          : student
      )
    );
  };

  const handleStudentPhotoClick = (subject) => {
    if (subject) {
      navigate(`/uploadStudentPhoto/${subject?.student_id}`, {
        state: { staff: subject },
      });
    }
  };

  const handleParentPhotoClick = (subject) => {
    if (subject) {
      navigate(`/uploadParentPhoto/${subject?.student_id}`, {
        state: { staff: subject },
      });
    }
  };

  useEffect(() => {
    fetchClassNameswithSection();
  }, []);

  useEffect(() => {
    if (Array.isArray(pendingstudents) && pendingstudents.length > 0) {
      const formattedParentsData = pendingstudents.map((student) => {
        return {
          parent_id: student.parent_id, // ✅ Important
          f_mobile: student.f_mobile || "", // ✅ Directly from top-level
          m_mobile: student.m_mobile || "",
          permant_add: student.permant_add || "",
          blood_group: student.blood_group || "",
          house: student.house || "",
          section_id: student.section_id || "",
        };
      });
      setParentsData(formattedParentsData);
    }
  }, [pendingstudents]);

  const handleSubmitEdit = async () => {
    setLoadingSave(true);
    if (!parentsData || parentsData.length === 0) {
      toast.error("Data is still loading. Please wait.");
      return;
    }

    const token = localStorage.getItem("authToken");
    const { class_id, section_id } = classIdForManage || {};

    if (!class_id || !section_id) {
      toast.error("Invalid class selection. Please try again.");
      return;
    }

    try {
      // Construct requestData for all students
      const requestData = {
        section_id: section_id,
      };

      parentsData.forEach((student) => {
        const pid = student.parent_id;
        if (!pid) return;

        requestData[`f_mobile_${pid}`] = student.f_mobile || "";
        requestData[`m_mobile_${pid}`] = student.m_mobile || "";
        requestData[`permant_add_${pid}`] = student.permant_add || "";
        requestData[`blood_group_${pid}`] = student.blood_group || "";
        requestData[`house_${pid}`] = student.house || "";
      });

      console.log("Submitting Request Data:", requestData);

      const response = await axios.put(
        `${API_URL}/api/update_idcarddata`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        toast.success("ID Card details saved successfully.");
        handleSearch(); // Reload updated data
      } else {
        toast.error("Failed to saved ID Card details.");
      }
    } catch (error) {
      console.error("Error saving student ID card:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoadingSave(false);
    }
  };

  const handleSubmitConfirm = async () => {
    setLoadingConfirm(true);
    if (!parentsData || parentsData.length === 0) {
      toast.error("Data is still loading. Please wait.");
      return;
    }

    const token = localStorage.getItem("authToken");
    const { class_id, section_id } = classIdForManage || {};

    if (!class_id || !section_id) {
      toast.error("Invalid class selection. Please try again.");
      return;
    }

    try {
      //Construct requestData for all students
      const requestData = {
        section_id: section_id,
      };

      parentsData.forEach((student) => {
        const pid = student.parent_id;
        if (!pid) return;

        requestData[`f_mobile_${pid}`] = student.f_mobile || "";
        requestData[`m_mobile_${pid}`] = student.m_mobile || "";
        requestData[`permant_add_${pid}`] = student.permant_add || "";
        requestData[`blood_group_${pid}`] = student.blood_group || "";
        requestData[`house_${pid}`] = student.house || "";
      });

      console.log("Submitting Request Data:", requestData);

      const response = await axios.put(
        `${API_URL}/api/update_idcarddataandconfirm`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        toast.success("ID Card details saved and confirmed successfully.");
        handleSearch(); // Reload updated data
      } else {
        toast.error("Failed to saved ID Card details.");
      }
    } catch (error) {
      console.error("Error updating student ID card:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoadingConfirm(false);
    }
  };

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  useEffect(() => {
    const trimmedSearch = searchTerm.trim().toLowerCase();

    if (trimmedSearch !== "" && prevSearchTermRef.current === "") {
      previousPageRef.current = currentPage; // Save current page before search
      setCurrentPage(0); // Jump to first page when searching
    }

    if (trimmedSearch === "" && prevSearchTermRef.current !== "") {
      setCurrentPage(previousPageRef.current); // Restore saved page when clearing search
    }

    prevSearchTermRef.current = trimmedSearch;
  }, [searchTerm]);

  const filteredSections = Array.isArray(pendingstudents)
    ? pendingstudents.filter((section) => {
        const searchLower = searchTerm.toLowerCase().trim();
        const parentName = `${section?.father_name ?? ""}`.toLowerCase();
        const studentName = `${section?.first_name ?? ""}${""}${
          section?.mid_name ?? ""
        }${" "}${section?.last_name ?? ""}`
          .toLowerCase()
          .trim();

        const address = `${section?.permant_add}`.toLowerCase();
        const bloodGroup = `${section?.blood_group}`.toLowerCase();
        const house = `${section?.house}`.toLowerCase();
        const motherMobile = `${section?.m_mobile}`.toLowerCase().toString();
        const fatherrMobile = `${section?.f_mobile}`.toLowerCase().toString();
        return (
          parentName.includes(searchLower) ||
          studentName.includes(searchLower) ||
          address.includes(searchLower) ||
          bloodGroup.includes(searchLower) ||
          house.includes(searchLower) ||
          motherMobile.includes(searchLower) ||
          fatherrMobile.includes(searchLower)
        );
      })
    : [];

  console.log("filteredsections", filteredSections);
  const displayedSections = filteredSections.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  console.log("displayedSections", displayedSections);

  return (
    <>
      <div className="md:mx-auto md:w-[95%] p-4 bg-white mt-4 ">
        <div className=" card-header flex justify-between items-center ">
          <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
            Update Student ID Card
          </h3>
          <RxCross1
            className=" relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
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
        <div className="bg-white w-full md:w-[100%] mx-auto rounded-md ">
          <div className="w-full  mx-auto">
            <ToastContainer />

            <div className="max-w-full bg-white  p-2">
              <div className=" w-full md:w-[49%]   flex  flex-col md:flex-row gap-x-1 md:gap-x-6 ">
                <div className="w-full md:w-[60%]   gap-x-3 md:justify-center justify-around  my-1 md:my-4 flex  md:flex-row  ">
                  <label
                    htmlFor="classSection"
                    className=" mr-2 pt-2 items-center text-center"
                  >
                    Class <span className="text-red-500">*</span>
                  </label>
                  <div className="w-[65%] md:w-[55%] ">
                    <Select
                      value={selectedClass}
                      onChange={handleClassSelect}
                      options={classOptions}
                      placeholder="Select "
                      isSearchable
                      isClearable
                      className="text-sm"
                    />
                    {nameError && (
                      <div className=" relative top-0.5 ml-1 text-danger text-xs">
                        {nameError}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleSearch}
                  type="button"
                  disabled={isSubmitting}
                  className="mr-0 md:mr-4 my-1 md:my-4 btn h-10  w-18 md:w-auto btn-primary "
                >
                  {isSubmitting ? "Searching..." : "Search"}
                </button>
              </div>
            </div>

            {pendingstudents.length > 0 && ( // selectedClass &&
              <div className="w-full  mt-4">
                <div className="card mx-auto lg:w-full shadow-lg">
                  <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                    <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
                      Update Student ID Card Data
                    </h3>
                    <div className="w-1/2 md:w-fit mr-1 ">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search "
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div
                    className=" relative w-[97%]   mb-3 h-1  mx-auto bg-red-700"
                    style={{
                      backgroundColor: "#C03078",
                    }}
                  ></div>

                  <div className="card-body w-full">
                    <div className="h-96 lg:h-96 overflow-y-scroll lg:overflow-x-hidden w-full  md:w-[100%] mx-auto">
                      <table className="min-w-full leading-normal table-auto">
                        <thead>
                          <tr className="bg-gray-200">
                            <th className="px-2 w-full md:w-[4%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Sr. No
                            </th>
                            <th className="px-2 w-full md:w-[5%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Roll No.
                            </th>
                            <th className="px-2 w-full md:w-[5%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Photo
                            </th>
                            <th className="px-2 w-full md:w-[9%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Student Name
                            </th>
                            <th className="px-2 w-full md:w-[10%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Address
                            </th>
                            <th className="px-2 w-full md:w-[9%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Blood Group
                            </th>
                            <th className="px-2 w-full md:w-[9%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              House
                            </th>
                            <th className="px-2 w-full md:w-[9%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Parent
                            </th>
                            <th className="px-2 w-full md:w-[9%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Father Mobile No.
                            </th>
                            <th className="px-2 w-full md:w-[9%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Mother Mobile No.
                            </th>
                            <th className="px-2 w-full md:w-[9%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Upload Photo
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayedSections.length ? (
                            displayedSections.map((pendingstudent, index) => (
                              <tr
                                key={pendingstudent.student_id}
                                className="text-sm"
                              >
                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  {currentPage * pageSize + index + 1}
                                </td>

                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  <div className="flex flex-col items-center">
                                    {pendingstudent?.roll_no}
                                  </div>
                                </td>

                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  <div className="flex flex-col items-center mb-3">
                                    <img
                                      src={
                                        pendingstudent?.image_name
                                          ? `${pendingstudent?.image_name}`
                                          : "https://via.placeholder.com/50"
                                      }
                                      alt={pendingstudent?.name}
                                      className="rounded-full w-8 h-8 lg:w-10 lg:h-10 object-cover"
                                    />
                                  </div>
                                  {pendingstudent?.idcard_confirm?.toLowerCase() ===
                                    "y" && (
                                    <span className="mt-3 text-green-600 text-sm font-semibold">
                                      Confirmed
                                    </span>
                                  )}
                                </td>

                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  <div className="flex flex-col items-center">
                                    {pendingstudent?.first_name || ""}{" "}
                                    {pendingstudent?.mid_name || ""}{" "}
                                    {pendingstudent?.last_name || ""}
                                  </div>
                                </td>

                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  <div className="flex flex-col items-center">
                                    <div className=" text-center  text-2xl">
                                      <textarea
                                        maxLength={200}
                                        rows="4"
                                        value={
                                          pendingstudent?.permant_add || ""
                                        }
                                        onChange={(e) =>
                                          handleInputChange(
                                            e,
                                            "permant_add",
                                            index
                                          )
                                        }
                                        data-parent-id={
                                          pendingstudent?.parent_id
                                        }
                                        className=" text-base bg-white border border-gray-400 rounded-md p-1 "
                                        required
                                      />
                                      {errors[`${index}-permant_add`] && (
                                        <span className="error text-xs text-red-500">
                                          Address is required!{" "}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  <div className="flex flex-col items-center">
                                    <select
                                      value={pendingstudent.blood_group || ""}
                                      onChange={(e) =>
                                        handleInputChange(
                                          e,
                                          "blood_group",
                                          index
                                        )
                                      }
                                      data-parent-id={pendingstudent?.parent_id}
                                      className="w-full border border-gray-400 rounded-md py-2 px-3 bg-white text-base"
                                      required
                                    >
                                      <option value="">Select</option>
                                      <option value="AB+">AB+</option>
                                      <option value="AB-">AB-</option>
                                      <option value="B+">B+</option>
                                      <option value="B-">B-</option>
                                      <option value="A+">A+</option>
                                      <option value="A-">A-</option>
                                      <option value="O+">O+</option>
                                      <option value="O-">O-</option>
                                    </select>
                                    {errors[`${index}-blood_group`] && (
                                      <span className="error text-xs text-red-500">
                                        Blood group is required!{" "}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  <div className="flex flex-col items-center">
                                    <select
                                      value={pendingstudent.house || ""}
                                      onChange={(e) =>
                                        handleInputChange(e, "house", index)
                                      }
                                      data-parent-id={pendingstudent?.parent_id}
                                      className="w-full border border-gray-400 rounded-md py-2 px-3 bg-white text-base"
                                      required
                                    >
                                      <option value="">Select</option>
                                      <option value="D">Diamond</option>
                                      <option value="R">Ruby</option>
                                      <option value="E">Emerald</option>
                                      <option value="S">Sapphire</option>
                                    </select>
                                    {errors[`${index}-house`] && (
                                      <span className="error text-xs text-red-500">
                                        House is required!{" "}
                                        {/* Custom error message */}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  <div className="flex flex-col items-center">
                                    {pendingstudent?.father_name}
                                  </div>
                                </td>

                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  <input
                                    type="text"
                                    className="text-center w-full px-2 py-1 border rounded outline-none focus:ring focus:ring-blue-300 text-base"
                                    value={pendingstudent.f_mobile || ""}
                                    onChange={(e) =>
                                      handleInputChange(e, "f_mobile", index)
                                    }
                                    data-parent-id={pendingstudent?.parent_id}
                                    maxLength={10}
                                  />
                                  <div>
                                    {errors[`${index}-f_mobile`] && (
                                      <span className="error text-xs text-red-500">
                                        Father No. is required!{" "}
                                        {/* Custom error message */}
                                      </span>
                                    )}
                                  </div>
                                </td>

                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  <input
                                    type="text"
                                    className="text-center w-full px-2 py-1 border rounded outline-none focus:ring focus:ring-blue-300 text-base"
                                    value={pendingstudent?.m_mobile || ""}
                                    onChange={(e) =>
                                      handleInputChange(e, "m_mobile", index)
                                    }
                                    data-parent-id={pendingstudent?.parent_id}
                                    maxLength={10}
                                  />
                                  <div>
                                    {errors[`${index}-m_mobile`] && (
                                      <span className="error text-xs text-red-500">
                                        Mother No. is required!{" "}
                                        {/* Custom error message */}
                                      </span>
                                    )}
                                  </div>
                                </td>

                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  <div className="flex flex-col items-center">
                                    <span
                                      onClick={() =>
                                        handleStudentPhotoClick(pendingstudent)
                                      }
                                      className="text-blue-600 hover:underline cursor-pointer text-base"
                                    >
                                      Student
                                    </span>
                                    <br />
                                    <span
                                      onClick={() =>
                                        handleParentPhotoClick(pendingstudent)
                                      }
                                      className="text-blue-600 hover:underline cursor-pointer text-base"
                                    >
                                      Parent
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan="10"
                                className="text-center text-red-700 py-4"
                              >
                                Oops! No data found..
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                      <div className="flex justify-end">
                        <button
                          className="text-white bg-yellow-500 hover:bg-yellow-500 px-4 py-2 rounded m-2"
                          onClick={handleSubmitConfirm}
                          disabled={loadingConfirm} // Disable button during loading
                        >
                          {loadingConfirm ? "Confirming..." : "Confirm"}
                        </button>
                        <button
                          className="text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded m-2"
                          onClick={handleSubmitEdit}
                          disabled={loadingSave}
                        >
                          {loadingSave ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </div>
                    <div className=" flex justify-center pt-2 -mb-3">
                      <ReactPaginate
                        previousLabel={"Previous"}
                        nextLabel={"Next"}
                        breakLabel={"..."}
                        breakClassName={"page-item"}
                        breakLinkClassName={"page-link"}
                        pageCount={pageCount}
                        marginPagesDisplayed={1}
                        pageRangeDisplayed={1}
                        onPageChange={handlePageClick}
                        containerClassName={"pagination"}
                        pageClassName={"page-item"}
                        pageLinkClassName={"page-link"}
                        previousClassName={"page-item"}
                        previousLinkClassName={"page-link"}
                        nextClassName={"page-item"}
                        nextLinkClassName={"page-link"}
                        activeClassName={"active"}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdateStudentIdCards;
