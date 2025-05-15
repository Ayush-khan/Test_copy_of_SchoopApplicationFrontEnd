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
import { useLocation } from "react-router-dom";

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
  const [fieldErrors, setFieldErrors] = useState({});
  const inputRefs = useRef({});
  const topRef = useRef(null);

  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");
  const location = useLocation();
  const { sectionID } = location.state || {};

  console.log("update id card section id", sectionID);
  const [classId, setClassId] = useState("");

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

  useEffect(() => {
    if (sectionID) {
      handleSearch(); // or your data-fetching logic
    }
  }, [sectionID]);

  const handleSearch = async () => {
    if (isSubmitting) return; // Prevent multiple submissions
    setIsSubmitting(true);
    setFieldErrors({}); // clear error message
    setNameError("");
    setLoading(true);
    setSearchTerm(""); // Reset search term before starting a new search

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Authentication token is missing. Please log in.");
        throw new Error("Authentication token is missing.");
      }

      let section_id;

      if (classIdForManage && classIdForManage.section_id) {
        section_id = classIdForManage.section_id;
      } else if (sectionID) {
        section_id = sectionID;
      } else {
        setNameError("Please select a Class.");
        // toast.error("Please select Class.");
        setIsSubmitting(false);
        setLoading(false);
        return;
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

      console.error(response.data);
      setPendingstudents(studentData);
      setParentsData(studentData);
      setPageCount(Math.ceil(studentData.length / pageSize));
      setCurrentPage(0);
    } catch (error) {
      console.error("Error fetching student details:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch student details. Please try again."
      );
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm]);

  // const handleInputChange = (e, field, index) => {
  //   const { value, dataset } = e.target;
  //   const parent_id = dataset.parentId;

  //   console.log("parent_id", parent_id);

  //   // Update validation errors
  //   setFieldErrors((prev) => ({
  //     ...prev,
  //     [`${index}-${field}`]: value.trim() ? "" : `${field} is required`,
  //   }));

  //   // Update the pending student directly
  //   setPendingstudents((prev) =>
  //     prev.map((student, i) =>
  //       i === index
  //         ? {
  //             ...student,
  //             [field]: value,
  //             parent_id: parent_id || student.parent_id, // ensure parent_id stays consistent
  //           }
  //         : student
  //     )
  //   );
  // };

  const fieldLabelMap = {
    f_mobile: "Father Mobile No.",
    m_mobile: "Mother Mobile No.",
    blood_group: "Blood Group",
    permanent_address: "Permanent Address",
    image_name: "Student Image",
  };

  const handleInputChange = (e, field, index) => {
    const { value, dataset } = e.target;
    const parent_id = dataset.parentId;

    const errorKey = `${field}_${parent_id}`;
    const label =
      fieldLabelMap[field] ||
      field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

    setFieldErrors((prev) => ({
      ...prev,
      [errorKey]: value.trim() ? "" : `${label} is required`,
    }));

    setPendingstudents((prev) =>
      prev.map((student, i) =>
        i === index
          ? {
              ...student,
              [field]: value,
              parent_id: parent_id || student.parent_id,
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
          parent_id: student.parent_id,
          f_mobile: student.f_mobile || "",
          m_mobile: student.m_mobile || "",
          permant_add: student.permant_add || "",
          blood_group: student.blood_group || "",
          house: student.house || "",
          image_name: student.image_name || "",
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
    // const { class_id, section_id } = classIdForManage || {};

    // if (!class_id || !section_id) {
    //   toast.error("Invalid class selection. Please try again.");
    //   return;
    // }

    let section_id;

    if (classIdForManage && classIdForManage.section_id) {
      section_id = classIdForManage.section_id;
    } else if (sectionID) {
      section_id = sectionID;
    } else {
      setNameError("Please select a Class.");
      toast.error("Class or section not selected.");
      setIsSubmitting(false);
      setLoading(false);
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
        topRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        window.scrollTo({ top: 0, behavior: "smooth" });
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

  // All errors fileds show at a time error messages
  // const handleSubmitConfirm = async () => {
  //   setLoadingConfirm(true);
  //   setFieldErrors({}); // Clear old errors

  //   if (!parentsData || parentsData.length === 0) {
  //     toast.error("Data is still loading. Please wait.");
  //     setLoadingConfirm(false);
  //     return;
  //   }

  //   const token = localStorage.getItem("authToken");

  //   let section_id;

  //   if (classIdForManage && classIdForManage.section_id) {
  //     section_id = classIdForManage.section_id;
  //   } else if (sectionID) {
  //     section_id = sectionID;
  //   } else {
  //     setNameError("Please select a Class.");
  //     toast.error("Class or section not selected.");
  //     setIsSubmitting(false);
  //     setLoading(false);
  //     return;
  //   }

  //   const errors = {};
  //   let firstErrorKey = null;

  //   parentsData.forEach((student, index) => {
  //     const pid = student.parent_id;
  //     if (!pid) return;

  //     const requiredFields = [
  //       {
  //         key: `f_mobile_${pid}`,
  //         label: "Father's Mobile No.",
  //         value: student.f_mobile,
  //       },
  //       {
  //         key: `m_mobile_${pid}`,
  //         label: "Mother's Mobile No.",
  //         value: student.m_mobile,
  //       },
  //       {
  //         key: `permant_add_${pid}`,
  //         label: "Permanent Address",
  //         value: student.permant_add,
  //       },
  //       {
  //         key: `blood_group_${pid}`,
  //         label: "Blood Group",
  //         value: student.blood_group,
  //       },
  //     ];

  //     requiredFields.forEach((field) => {
  //       if (!field.value) {
  //         errors[field.key] = `${field.label} is required`;
  //         if (!firstErrorKey) firstErrorKey = field.key;
  //       }
  //     });
  //   });

  //   if (Object.keys(errors).length > 0) {
  //     setFieldErrors(errors);

  //     // Wait for errors to render
  //     setTimeout(() => {
  //       requestAnimationFrame(() => {
  //         const input = inputRefs.current[firstErrorKey];
  //         if (input && typeof input.scrollIntoView === "function") {
  //           input.scrollIntoView({ behavior: "smooth", block: "center" });
  //           input.focus();
  //         }
  //       });
  //     }, 100); // enough delay for DOM to re-render

  //     setLoadingConfirm(false);
  //     return;
  //   }

  //   // Construct requestData
  //   const requestData = { section_id };
  //   parentsData.forEach((student) => {
  //     const pid = student.parent_id;
  //     if (!pid) return;

  //     requestData[`f_mobile_${pid}`] = student.f_mobile || "";
  //     requestData[`m_mobile_${pid}`] = student.m_mobile || "";
  //     requestData[`permant_add_${pid}`] = student.permant_add || "";
  //     requestData[`blood_group_${pid}`] = student.blood_group || "";
  //     requestData[`house_${pid}`] = student.house || "";
  //   });

  //   try {
  //     const response = await axios.put(
  //       `${API_URL}/api/update_idcarddataandconfirm`,
  //       requestData,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );

  //     if (response.status === 200) {
  //       toast.success("ID Card details saved and confirmed successfully.");
  //       handleSearch();
  //     } else {
  //       toast.error("Failed to save ID Card details.");
  //     }
  //   } catch (error) {
  //     console.error("Error updating student ID card:", error);
  //     toast.error("Something went wrong. Please try again.");
  //   } finally {
  //     setLoadingConfirm(false);
  //   }
  // };

  const handleSubmitConfirm = async () => {
    setLoadingConfirm(true);
    setFieldErrors({}); // Clear previous errors

    if (!parentsData || parentsData.length === 0) {
      toast.error("Data is still loading. Please wait.");
      setLoadingConfirm(false);
      return;
    }

    const token = localStorage.getItem("authToken");

    let section_id;

    if (classIdForManage && classIdForManage.section_id) {
      section_id = classIdForManage.section_id;
    } else if (sectionID) {
      section_id = sectionID;
    } else {
      setNameError("Please select a Class.");
      toast.error("Class or section not selected.");
      setIsSubmitting(false);
      setLoading(false);
      return;
    }

    const errors = {};
    let firstErrorKey = null;
    let stopValidation = false;

    for (let index = 0; index < parentsData.length; index++) {
      const student = parentsData[index];
      const pid = student.parent_id;
      if (!pid) continue;

      console.warn(parentsData[index]);
      console.log(`Student ${index + 1} Image Name:`, student.image_name);

      const requiredFields = [
        {
          key: `f_mobile_${pid}`,
          label: "Father Mobile No.",
          value: student.f_mobile,
        },
        {
          key: `m_mobile_${pid}`,
          label: "Mother Mobile No.",
          value: student.m_mobile,
        },
        {
          key: `permant_add_${pid}`,
          label: "Permanent Address",
          value: student.permant_add,
        },
        {
          key: `blood_group_${pid}`,
          label: "Blood Group",
          value: student.blood_group,
        },
        {
          key: `image_name_${pid}`,
          label: "Student Photo",
          value: student.image_name,
        },
      ];

      for (const field of requiredFields) {
        let isEmpty = false;

        // Check image differently
        if (field.key.startsWith("image_name_")) {
          isEmpty =
            !field.value ||
            typeof field.value !== "string" ||
            field.value.trim() === "" ||
            field.value === "null";
        } else {
          isEmpty =
            !field.value ||
            (typeof field.value === "string" && field.value.trim() === "");
        }

        if (isEmpty) {
          errors[field.key] = `${field.label} is required`;
          firstErrorKey = field.key;
          stopValidation = true;
          break;
        }
      }

      if (stopValidation) break;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);

      setTimeout(() => {
        requestAnimationFrame(() => {
          const input = inputRefs.current[firstErrorKey];
          if (input && typeof input.scrollIntoView === "function") {
            input.scrollIntoView({ behavior: "smooth", block: "center" });
            input.focus();
          }
        });
      }, 100);

      setLoadingConfirm(false);
      return;
    }

    // Construct requestData
    const requestData = { section_id };
    parentsData.forEach((student) => {
      const pid = student.parent_id;
      if (!pid) return;

      requestData[`f_mobile_${pid}`] = student.f_mobile || "";
      requestData[`m_mobile_${pid}`] = student.m_mobile || "";
      requestData[`permant_add_${pid}`] = student.permant_add || "";
      requestData[`blood_group_${pid}`] = student.blood_group || "";
      requestData[`house_${pid}`] = student.house || "";
    });

    try {
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
        handleSearch();
      } else {
        toast.error("Failed to save ID Card details.");
      }
    } catch (error) {
      console.error("Error updating student ID card:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoadingConfirm(false);
    }
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

  useEffect(() => {
    const savedClassId = localStorage.getItem("selectedClassId");
    if (savedClassId) {
      setClassId(savedClassId); // update the dropdown value
      handleSearch(savedClassId); // auto-trigger search
      localStorage.removeItem("selectedClassId"); // optional cleanup
    }
  }, []);

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
    currentPage * pageSize
    // , (currentPage + 1) * pageSize
  );

  console.log("displayedSections", displayedSections);

  useEffect(() => {
    const savedClassId = localStorage.getItem("selectedClassId");
    if (savedClassId) {
      setClassId(savedClassId); // update the dropdown value
      handleSearch(savedClassId); // auto-trigger search
      localStorage.removeItem("selectedClassId"); // optional cleanup
    }
  }, []);

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

            <div className="max-w-full  bg-white  p-2">
              <div className=" relative left-0 md:left-[5%] w-full md:w-[49%]   flex  flex-col md:flex-row gap-x-1 md:gap-x-6 ">
                <div className="w-full  md:w-[60%]   gap-x-3 md:justify-center justify-around  my-1 md:my-4 flex  md:flex-row  ">
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
                    <div
                      ref={topRef}
                      className="h-96 lg:h-96 overflow-y-scroll lg:overflow-x-hidden w-full  md:w-[100%] mx-auto"
                    >
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
                                        ref={(el) =>
                                          (inputRefs.current[
                                            `permant_add_${pendingstudent.parent_id}`
                                          ] = el)
                                        }
                                        data-parent-id={
                                          pendingstudent?.parent_id
                                        }
                                        className=" text-base bg-white border border-gray-400 rounded-md p-1 "
                                        required
                                      />
                                      {fieldErrors[
                                        `permant_add_${pendingstudent.parent_id}`
                                      ] && (
                                        <div className="error-message text-xs text-red-500">
                                          {
                                            fieldErrors[
                                              `permant_add_${pendingstudent.parent_id}`
                                            ]
                                          }
                                        </div>
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
                                      ref={(el) =>
                                        (inputRefs.current[
                                          `blood_group_${pendingstudent.parent_id}`
                                        ] = el)
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
                                    {fieldErrors[
                                      `blood_group_${pendingstudent.parent_id}`
                                    ] && (
                                      <div className="error-message text-xs text-red-500">
                                        {
                                          fieldErrors[
                                            `blood_group_${pendingstudent.parent_id}`
                                          ]
                                        }
                                      </div>
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
                                      ref={(el) =>
                                        (inputRefs.current[
                                          `house_${pendingstudent.parent_id}`
                                        ] = el)
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
                                    ref={(el) =>
                                      (inputRefs.current[
                                        `f_mobile_${pendingstudent.parent_id}`
                                      ] = el)
                                    }
                                    data-parent-id={pendingstudent?.parent_id}
                                    maxLength={10}
                                  />
                                  <div>
                                    {fieldErrors[
                                      `f_mobile_${pendingstudent.parent_id}`
                                    ] && (
                                      <div className="error-message text-xs text-red-500">
                                        {
                                          fieldErrors[
                                            `f_mobile_${pendingstudent.parent_id}`
                                          ]
                                        }
                                      </div>
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
                                    ref={(el) =>
                                      (inputRefs.current[
                                        `m_mobile_${pendingstudent.parent_id}`
                                      ] = el)
                                    }
                                    data-parent-id={pendingstudent?.parent_id}
                                    maxLength={10}
                                  />
                                  <div>
                                    {fieldErrors[
                                      `m_mobile_${pendingstudent.parent_id}`
                                    ] && (
                                      <div className="error-message text-xs text-red-500">
                                        {
                                          fieldErrors[
                                            `m_mobile_${pendingstudent.parent_id}`
                                          ]
                                        }
                                      </div>
                                    )}
                                  </div>
                                </td>

                                <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                  <div className="flex flex-col items-center">
                                    <span
                                      onClick={() =>
                                        handleStudentPhotoClick(pendingstudent)
                                      }
                                      ref={(el) =>
                                        (inputRefs.current[
                                          `image_name_${pendingstudent.parent_id}`
                                        ] = el)
                                      }
                                      className="text-blue-600 hover:underline cursor-pointer text-base"
                                    >
                                      Student
                                    </span>
                                    {fieldErrors[
                                      `image_name_${pendingstudent.parent_id}`
                                    ] && (
                                      <p className="text-red-500 text-sm mt-1">
                                        {
                                          fieldErrors[
                                            `image_name_${pendingstudent.parent_id}`
                                          ]
                                        }
                                      </p>
                                    )}

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
                          onClick={() => {
                            setPendingstudents([]);
                            setSelectedClass("");
                          }}
                        >
                          Back
                        </button>

                        <button
                          className="text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded m-2"
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
                    {/* <div className=" flex justify-center pt-2 -mb-3">
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
                    </div> */}
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
