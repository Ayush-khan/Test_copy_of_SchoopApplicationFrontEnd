import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const PublishProficiencyCertificate = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [showStudentReport, setShowStudentReport] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);

  const [loadingForSearch, setLoadingForSearch] = useState(false);

  const navigate = useNavigate();

  const [roleId, setRoleId] = useState("");
  const [regId, setRegId] = useState("");

  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [selectedClassName, setSelectedClassName] = useState("");
  const [selectedTerms, setSelectedTerms] = useState([]);

  const [timetable, setTimetable] = useState([]);

  const pageSize = 10;

  const [searchTerm, setSearchTerm] = useState("");
  const academicYrFrom = localStorage.getItem("academic_yr_from");
  const academicYrTo = localStorage.getItem("academic_yr_to");
  const [termsOptions, setTermsOptions] = useState([]);

  const camelCase = (str) =>
    str
      ?.toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  useEffect(() => {
    const initData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          toast.error("No authentication token found.");
          return;
        }

        const sessionResponse = await axios.get(`${API_URL}/api/sessionData`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const fetchedRoleId = sessionResponse.data.user.role_id;
        const fetchedRegId = sessionResponse.data.user.reg_id;

        setRoleId(fetchedRoleId);
        setRegId(fetchedRegId);

        console.log("Fetched Role ID:", fetchedRoleId, "Reg ID:", fetchedRegId);

        const classResponse = await axios.get(
          `${API_URL}/api/get_classes_of_classteacher?teacher_id=${fetchedRegId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const mappedClasses = (classResponse.data.data || [])
          .filter((item) => item.is_class_teacher === 1)
          .map((cls) => ({
            value: cls.class_id,
            class_id: cls.class_id,
            section_id: cls.section_id,
            classname: cls.classname,
            sectionname: cls.sectionname,
            label: `${cls.classname} ${cls.sectionname}`,
          }));

        if (mappedClasses.length === 0) {
          toast.error("No class assigned to this teacher.");
          return;
        }

        setStudentNameWithClassId(mappedClasses);

        const { class_id, section_id, classname } = mappedClasses[0];

        const termResponse = await axios.get(`${API_URL}/api/get_Term`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const mappedTerms =
          termResponse?.data?.map((exam) => ({
            label: exam.name,
            value: exam?.term_id,
          })) || [];

        if (mappedTerms.length === 0) {
          toast.error("No terms found.");
          return;
        }

        setTermsOptions(mappedTerms);

        await handleSearch(class_id, section_id, mappedTerms, classname);
      } catch (err) {
        console.error("Initialization failed:", err);
        toast.error("Failed to initialize data.");
      } finally {
        setLoadingForSearch(false);
      }
    };

    initData();
  }, []);

  const handleSearch = async (class_id, section_id, terms, classname) => {
    setSelectedClassId(class_id);
    setSelectedSectionId(section_id);
    setSelectedClassName(classname);
    setSelectedTerms(terms);

    setTimetable([]);
    setLoadingForSearch(true);
    setShowStudentReport(false);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Auth token missing");

      const maxMarksResponse = await axios.get(
        `${API_URL}/api/get_max_highest_marks_per_term`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            class_id,
            section_id,
            term_id: terms[0].value,
          },
        }
      );

      const maxHighestMarks = maxMarksResponse?.data?.data || 0;
      console.log("Max highest marks:", maxHighestMarks);

      // Step 2️⃣ Define ranges (no labels used for API calls)
      const certificateRanges = [
        { from: 95, to: 100, label: "Gold Certificate" },
        { from: 93, to: 94.99, label: "Silver Certificate" },
        { from: 90, to: 92.99, label: "Bronze Certificate" },
      ];

      let allData = [];

      for (const term of terms) {
        for (const range of certificateRanges) {
          let apiUrl;

          if (classname === "9" || classname === 9) {
            apiUrl = `${API_URL}/api/show_listing_of_proficiency_students_class9`;
          } else if (classname === "11" || classname === 11) {
            apiUrl = `${API_URL}/api/show_listing_of_proficiency_students_class11`;
          } else {
            apiUrl = `${API_URL}/api/show_listing_of_proficiency_students`;
          }

          const response = await axios.get(apiUrl, {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              class_id,
              section_id,
              term_id: term.value,
              from: range.from,
              to: range.to,
              max_highest_marks: maxHighestMarks,
            },
          });

          const termData = response?.data?.data || [];

          if (termData.length > 0) {
            const enrichedData = await Promise.all(
              termData.map(async (student) => {
                try {
                  const publishResponse = await axios.get(
                    `${API_URL}/api/get_proficiency_certificate_publish_value`,
                    {
                      headers: { Authorization: `Bearer ${token}` },
                      params: {
                        student_id: student.student_id,
                        term_id: term.value,
                      },
                    }
                  );

                  const publishValue = publishResponse?.data?.data || "N";
                  return {
                    ...student,
                    term_name: term.label,
                    term_id: term.value,
                    max_highest_marks: maxHighestMarks,
                    publish_value: publishValue,
                    certificate_type: range.label, // 🟡 Now label added *after* getting data
                  };
                } catch (err) {
                  console.error(
                    `Error fetching publish value for student ${student.student_id}:`,
                    err
                  );
                  return {
                    ...student,
                    term_name: term.label,
                    term_id: term.value,
                    max_highest_marks: maxHighestMarks,
                    publish_value: "N",
                    certificate_type: range.label,
                  };
                }
              })
            );

            allData.push(...enrichedData);
          }
        }
      }

      // Step 6️⃣ Final output
      if (allData.length === 0) {
        toast.error("No proficiency data found for this class.");
      } else {
        setTimetable(allData);
        console.log(
          "✅ Combined Data (with range and certificate type):",
          allData
        );
      }
    } catch (error) {
      console.error("Error in handleSearch:", error);
      toast.error("Failed to fetch data. Please try again.");
    } finally {
      setLoadingForSearch(false);
    }
  };

  const goldStudents = timetable.filter(
    (student) => student.percentage >= 95 && student.percentage <= 100
  );
  const silverStudents = timetable.filter(
    (student) => student.percentage >= 93 && student.percentage <= 94.99
  );
  const bronzeStudents = timetable.filter(
    (student) => student.percentage >= 90 && student.percentage <= 92.99
  );

  const handlePublish = async (student, type) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Authentication token missing.");

      const formData = new FormData();
      formData.append("action", "publish");
      formData.append("student_id", student.student_id);
      formData.append("term_id", student.term_id);
      formData.append("type", type);

      const response = await axios.post(
        `${API_URL}/api/publish_proficiency_certificate`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.status === 200) {
        toast.success("Certificate published successfully!");
        setLoadingForSearch(true);
        setTimeout(() => {
          handleSearch(
            selectedClassId,
            selectedSectionId,
            selectedTerms,
            selectedClassName
          );
        }, 500);
      } else {
        toast.error(response.data?.message || "Failed to publish certificate.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while publishing.");
    }
  };

  //   const handlePublish = async (student, type) => {
  //     try {
  //       const token = localStorage.getItem("authToken");
  //       if (!token) throw new Error("Authentication token missing.");

  //       const formData = new FormData();
  //       formData.append("action", "publish");
  //       formData.append("student_id", student.student_id);
  //       formData.append("term_id", student.term_id);
  //       formData.append("type", type);

  //       const response = await axios.post(
  //         `${API_URL}/api/publish_proficiency_certificate`,
  //         formData,
  //         {
  //           headers: { Authorization: `Bearer ${token}` },
  //         }
  //       );

  //       console.log("Publish API response:", response.data);

  //       // ✅ Check actual backend success indicator
  //       if (response.data?.status === 200 || response.data?.status === true) {
  //         toast.success("Certificate published successfully!");

  //         // 🟢 Refresh the table immediately after success
  //         await handleSearch(
  //           selectedClassId, // the class_id of the selected class
  //           selectedSectionId, // the section_id
  //           selectedTerms, // your terms array
  //           selectedClassName // classname
  //         );
  //       } else {
  //         toast.error(response.data?.message || "Failed to publish certificate.");
  //       }
  //     } catch (error) {
  //       console.error(error);
  //       toast.error("Something went wrong while publishing.");
  //     }
  //   };

  const handleUnPublish = async (student, type) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Authentication token missing.");

      const formData = new FormData();
      formData.append("action", "unpublish");
      formData.append("student_id", student.student_id);
      formData.append("term_id", student.term_id);
      formData.append("type", type);

      const response = await axios.post(
        `${API_URL}/api/publish_proficiency_certificate`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.status === 200) {
        toast.success("Certificate unpublished successfully!");
        setLoadingForSearch(true);
        setTimeout(() => {
          handleSearch(
            selectedClassId,
            selectedSectionId,
            selectedTerms,
            selectedClassName
          );
        }, 500);
      } else {
        toast.error(response.data?.message || "Failed to publish certificate.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while publishing.");
    }
  };

  const handleDownload = async (student) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Authentication token missing.");

      let type = "";
      if (student.percentage >= 95 && student.percentage <= 100) {
        type = "Gold";
      } else if (student.percentage >= 93 && student.percentage <= 94.99) {
        type = "Silver";
      } else if (student.percentage >= 90 && student.percentage <= 92.99) {
        type = "Bronze";
      } else {
        toast.error("Invalid percentage range for certificate.");
        return;
      }

      const url = `${API_URL}/api/download_proficiency_certificate/${student.student_id}/${student.term_id}/${type}`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      // Create a downloadable link
      const blob = new Blob([response.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `${
        student.first_name || "student"
      }_${type}_Certificate.pdf`;
      link.click();

      toast.success(`${type} Certificate downloaded successfully!`);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download certificate.");
    }
  };

  const filteredSections = timetable.filter((record) => {
    const searchLower = searchTerm.toLowerCase();

    const classSection = record?.class_section?.toLowerCase() || "";
    const classTeacher = record?.class_teacher?.toLowerCase() || "";
    const substituteTeacher = record?.substitute_teacher?.toLowerCase() || "";
    const attendanceMarkedBy =
      record?.attendance_marked_by?.toLowerCase() || "";
    const markedStatus =
      record?.marked?.toLowerCase() === "y" ? "marked" : "not marked";

    return (
      classSection.includes(searchLower) ||
      classTeacher.includes(searchLower) ||
      substituteTeacher.includes(searchLower) ||
      attendanceMarkedBy.includes(searchLower) ||
      markedStatus.includes(searchLower)
    );
  });

  const displayedSections = filteredSections.slice(currentPage * pageSize);

  return (
    <>
      <div className="w-full md:w-[100%]  mx-auto p-4 ">
        <ToastContainer />
        <div className="card  rounded-md ">
          <>
            <>
              <div className="w-full ">
                <div className="card mx-auto lg:w-full shadow-lg">
                  <div className="p-2 px-3 bg-gray-100 border-none flex items-center justify-between">
                    <div className="w-full flex flex-row items-center justify-between ">
                      <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap mr-6">
                        Publish Proficiency Certificate
                      </h3>
                    </div>

                    <div className="flex mb-1.5 flex-col md:flex-row gap-x-6 justify-center md:justify-end ml-2">
                      <RxCross1
                        className="text-base text-red-600 cursor-pointer hover:bg-red-100 rounded"
                        onClick={() => navigate("/dashboard")}
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
                      className="h-96 lg:h-96 overflow-y-scroll overflow-x-scroll"
                      style={{
                        scrollbarWidth: "thin",
                        scrollbarColor: "#C03178 transparent",
                      }}
                    >
                      <table className="min-w-full leading-normal table-auto mb-3">
                        <thead>
                          <tr>
                            <th
                              colSpan="7"
                              className="bg-yellow-100 text-yellow-800 text-lg font-bold text-center py-1 border border-gray-950"
                            >
                              🥇 Gold Certificate
                            </th>
                          </tr>

                          <tr className="bg-gray-100">
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Sr No.
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Student Name
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Term
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Percentage
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Publish
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Unpublish
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Download
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {goldStudents.length > 0 ? (
                            goldStudents.map((student, index) => (
                              <tr
                                key={student.student_id}
                                className="border border-gray-300"
                              >
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {index + 1}
                                </td>
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {`${student.first_name || ""} ${
                                    student.mid_name || ""
                                  } ${student.last_name || ""}`}
                                </td>
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {student.term_id || ""}
                                </td>
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {student.percentage || ""}
                                </td>

                                {/* Publish / Unpublish */}
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {student.publish_value === "N" && (
                                    <button
                                      onClick={() => handlePublish(student)}
                                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                    >
                                      Publish
                                    </button>
                                  )}
                                </td>
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {student.publish_value === "Y" && (
                                    <button
                                      onClick={() =>
                                        handlePublish(student, "g")
                                      }
                                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                    >
                                      Publish
                                    </button>
                                  )}
                                </td>
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {student.publish_value === "Y" ? (
                                    <button
                                      onClick={() =>
                                        handlePublish(student, "s")
                                      }
                                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                    >
                                      Publish
                                    </button>
                                  ) : (
                                    <span className="text-gray-400"></span>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="text-center py-3">
                                {loadingForSearch ? (
                                  <span className="text-blue-600 text-lg font-medium">
                                    Please wait while data is loading...
                                  </span>
                                ) : (
                                  <span className="text-red-600 text-lg font-medium">
                                    Oops! No data found.
                                  </span>
                                )}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>

                      <table className="min-w-full leading-normal table-auto mb-3">
                        <thead>
                          <tr>
                            <th
                              colSpan="7"
                              className="bg-gray-300 text-gray-700 text-lg font-bold text-center py-1 border border-gray-950"
                            >
                              🥈 Silver Certificate
                            </th>
                          </tr>

                          <tr className="bg-gray-100">
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Sr No.
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Student Name
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Term
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Percentage
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Publish
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Unpublish
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Download
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {silverStudents.length > 0 ? (
                            silverStudents.map((student, index) => (
                              <tr
                                key={student.student_id}
                                className="border border-gray-300"
                              >
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {index + 1}
                                </td>
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {`${student.first_name || ""} ${
                                    student.mid_name || ""
                                  } ${student.last_name || ""}`}
                                </td>
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {student.term_id || ""}
                                </td>
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {student.percentage || ""}
                                </td>

                                {/* Publish / Unpublish */}
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {student.publish_value === "N" && (
                                    <button
                                      onClick={() => handlePublish(student)}
                                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                    >
                                      Publish
                                    </button>
                                  )}
                                </td>
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {student.publish_value === "Y" && (
                                    <button
                                      onClick={() =>
                                        handlePublish(student, "b")
                                      }
                                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                    >
                                      Publish
                                    </button>
                                  )}
                                </td>
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {student.publish_value === "Y" ? (
                                    <button
                                      onClick={() => handleDownload(student)}
                                      className="text-blue-600 hover:text-blue-800"
                                      title="Download Certificate"
                                    >
                                      <i className="fas fa-download"></i>
                                    </button>
                                  ) : (
                                    <span className="text-gray-400"></span>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="text-center py-3">
                                {loadingForSearch ? (
                                  <span className="text-blue-600 text-lg font-medium">
                                    Please wait while data is loading...
                                  </span>
                                ) : (
                                  <span className="text-red-600 text-lg font-medium">
                                    Oops! No data found.
                                  </span>
                                )}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>

                      <table className="min-w-full leading-normal table-auto">
                        <thead>
                          <tr>
                            <th
                              colSpan="7"
                              className="bg-orange-100 text-orange-800 text-lg font-bold text-center py-1 border border-gray-950"
                            >
                              🥉 Bronze Certificate
                            </th>
                          </tr>

                          <tr className="bg-gray-100">
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Sr No.
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Student Name
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Term
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Percentage
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Publish
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Unpublish
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Download
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {bronzeStudents.length > 0 ? (
                            bronzeStudents.map((student, index) => (
                              <tr
                                key={student.student_id}
                                className="border border-gray-300"
                              >
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {index + 1}
                                </td>
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {`${student.first_name || ""} ${
                                    student.mid_name || ""
                                  } ${student.last_name || ""}`}
                                </td>
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {student.term_id || ""}
                                </td>
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {student.percentage || ""}
                                </td>

                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {student.publish_value === "N" && (
                                    <button
                                      onClick={() =>
                                        handlePublish(student, "b")
                                      }
                                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                    >
                                      Publish
                                    </button>
                                  )}
                                </td>
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {student.publish_value === "Y" && (
                                    <button
                                      onClick={() =>
                                        handleUnPublish(student, " b")
                                      }
                                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                    >
                                      Unpublish
                                    </button>
                                  )}
                                </td>
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {student.publish_value === "Y" ? (
                                    <button
                                      onClick={() => handleDownload(student)}
                                      className="text-blue-600 hover:text-blue-800"
                                      title="Download Certificate"
                                    >
                                      <i className="fas fa-download"></i>
                                    </button>
                                  ) : (
                                    <span className="text-gray-400"></span>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="text-center py-3">
                                {loadingForSearch ? (
                                  <span className="text-blue-600 text-lg font-medium">
                                    Please wait while data is loading...
                                  </span>
                                ) : (
                                  <span className="text-red-600 text-lg font-medium">
                                    Oops! No data found.
                                  </span>
                                )}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </>
          </>
        </div>
      </div>
    </>
  );
};

export default PublishProficiencyCertificate;
