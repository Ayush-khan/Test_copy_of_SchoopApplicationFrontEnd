import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLocation, useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { FiSearch } from "react-icons/fi";

const SendRemainderRemark = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [formId, setFormId] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const [classNameWithClassId, setClassNameWithClassId] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingForSearch, setLoadingForSearch] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const [loadingExams, setLoadingExams] = useState(false);
  const [classError, setClassError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [timetable, setTimetable] = useState([]);

  const pageSize = 10;
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const [shortName, setShortName] = useState("");
  // const [showStudentReport, setShowStudentReport] = useState(false);

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [selectedSectionId, setSelectedSectionId] = useState(null);

  const [regId, setRegId] = useState("");

  const [todayReturn, setTodayReturn] = useState(true);

  const [remark, setRemark] = useState("");
  // const DEFAULT_REMARK = "Your child has not returned the library book.";

  // const [remark, setRemark] = useState(DEFAULT_REMARK);
  const [isRemarkApplied, setIsRemarkApplied] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  const [userName, setUserName] = useState("");

  const [remarkError, setRemarkError] = useState("");

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewStudent, setViewStudent] = useState(null);

  useEffect(() => {
    fetchSessionAndExams();
  }, []);

  const fetchSessionAndExams = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.error("No authentication token found");
      return;
    }

    try {
      const sessionResponse = await axios.get(`${API_URL}/api/sessionData`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const shortname = sessionResponse?.data?.custom_claims?.short_name;
      const regId = sessionResponse?.data?.custom_claims?.reg_id;
      const loginUserName = sessionResponse?.data?.user?.name;

      setShortName(shortname);
      setRegId(regId);
      setUserName(loginUserName);

      // console.log("short name:", shortname);
      // console.log("regId:", regId);

      if (regId) {
        fetchExams(regId);
      }
    } catch (error) {
      console.error("Error fetching session data:", error);
    }
  };

  const fetchExams = async (regId) => {
    try {
      setLoadingExams(true);
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/get_teacherclasseswithclassteacher?teacher_id=${regId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // console.log("Classes:", response);
      setClassNameWithClassId(response?.data?.data || []);
    } catch (error) {
      toast.error("Error fetching Classes");
      console.error("Error fetching Classes:", error);
    } finally {
      setLoadingExams(false);
    }
  };

  const handleClassSelect = (selectedOption) => {
    setClassError("");
    setSelectedClass(selectedOption);

    setSelectedClassId(selectedOption?.class_id);
    setSelectedSectionId(selectedOption?.section_id);
  };

  const classOptions = useMemo(
    () =>
      classNameWithClassId.map((cls) => ({
        value: `${cls.class_id}-${cls.section_id}`, // ✅ UNIQUE
        class_id: cls.class_id,
        section_id: cls.section_id,
        label: `${cls.classname} ${cls.sectionname}`,
      })),
    [classNameWithClassId],
  );

  const handleSearch = async () => {
    setLoadingForSearch(true);
    setLoading(true);
    setTimetable([]);

    const token = localStorage.getItem("authToken");

    try {
      const params = {};

      if (selectedClassId && selectedSectionId) {
        params.class_id = selectedClassId;
        params.section_id = selectedSectionId;
      }

      if (todayReturn) {
        params.date = new Date().toISOString().split("T")[0];
      }

      const response = await axios.get(
        `${API_URL}/api/library/reminder/search`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        },
      );

      if (!response?.data?.data?.length) {
        toast.error("No data found.");
        setTimetable([]);
      } else {
        setTimetable(response.data.data);
        // setPageCount(Math.ceil(response.data.data.length / pageSize));
      }
    } catch (error) {
      console.error("Error fetching:", error);
      toast.error("Error fetching send reminder list. Please try again.");
    } finally {
      setLoadingForSearch(false);
      setLoading(false);
    }
  };

  const camelCase = (str) =>
    str
      ?.toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        })
      : "";

  const filteredSections = useMemo(() => {
    if (!searchTerm.trim()) return timetable;

    const searchLower = searchTerm.trim().replace(/\s+/g, " ").toLowerCase();

    return timetable.filter((section) => {
      const studentName =
        `${section?.first_name ?? ""} ${section?.mid_name ?? ""} ${section?.last_name ?? ""}`
          .toLowerCase()
          .trim();
      const fullclassname =
        `${section?.class_name ?? ""} ${section?.section_name}`
          .toLowerCase()
          .trim();
      const issueDate = `${formatDate(section.issue_date ?? "")}`;
      const dueDate = `${formatDate(section.due_date ?? "")}`;

      return (
        studentName.includes(searchLower) ||
        fullclassname.includes(searchLower) ||
        issueDate.includes(searchLower) ||
        dueDate.includes(searchLower) ||
        section?.application_date?.toLowerCase()?.includes(searchLower) ||
        section?.book_title?.toLowerCase()?.includes(searchLower) ||
        section?.copy_id?.toLowerCase()?.includes(searchLower) ||
        section?.f_email?.toLowerCase()?.includes(searchLower) ||
        section?.admission_form_status?.toLowerCase()?.includes(searchLower) ||
        section?.class_name?.toLowerCase()?.includes(searchLower) ||
        section?.count?.toString().includes(searchLower)
      );
    });
  }, [searchTerm, timetable]);

  // const displayedSections = useMemo(() => {
  //   const start = currentPage * pageSize;
  //   return filteredSections.slice(start, start + pageSize);
  // }, [filteredSections, currentPage, pageSize]);
  // const displayedSections = filteredSections.slice(
  //   currentPage * pageSize,
  //   (currentPage + 1) * pageSize,
  // );

  const displayedSections = filteredSections.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize,
  );

  const allSelected =
    displayedSections.length > 0 &&
    displayedSections.every((row) => selectedRows.includes(row.member_id));

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(displayedSections.map((row) => row.copy_id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleRowSelect = (copyId) => {
    setSelectedRows((prev) =>
      prev.includes(copyId)
        ? prev.filter((id) => id !== copyId)
        : [...prev, copyId],
    );
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   const validSelectedRows = selectedRows.filter(
  //     (id) => id !== undefined && id !== null && id !== "",
  //   );

  //   console.log("selected rows (raw):", selectedRows);
  //   console.log("selected rows (valid):", validSelectedRows);

  //   if (validSelectedRows.length === 0) {
  //     toast.error("Please select at least one Student.");
  //     return;
  //   }

  //   const token = localStorage.getItem("authToken");
  //   if (!token) {
  //     toast.error("Authentication token missing.");
  //     return;
  //   }

  //   setLoading(true);
  //   setIsSubmitting(true);

  //   try {
  //     const formData = new FormData();

  //     let i = 1; // backend-friendly counter

  //     validSelectedRows.forEach((copyId) => {
  //       const row = displayedSections.find((item) => item.copy_id === copyId);

  //       if (!row) return;

  //       formData.append(`checkbox${i}`, row.member_id);
  //       formData.append(`book_id${i}`, row.book_id);
  //       formData.append(`due_date${i}`, row.due_date);
  //       formData.append(`class_id${i}`, row.class_id);
  //       formData.append(`section_id${i}`, row.section_id);
  //       formData.append(`remark_subject${i}`, "Library Book Not Returned");
  //       formData.append(
  //         `remark_desc${i}`,
  //         isRemarkApplied
  //           ? remark
  //           : "Your child has not returned the library book.",
  //       );

  //       i++; // increment only for valid rows
  //     });

  //     // 🛑 Safety check
  //     if (i === 1) {
  //       toast.error("No valid records found to submit.");
  //       return;
  //     }

  //     await axios.post(`${API_URL}/api/library/reminder/send`, formData, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     setSelectedRows([]);
  //     setRemark("");
  //     setIsRemarkApplied(false);
  //     toast.success("Remark sent successfully.");

  //     setTimeout(() => {
  //       handleSearch();
  //     }, 500);
  //   } catch (error) {
  //     console.error(error);
  //     toast.error("Failed to send remark.");
  //   } finally {
  //     setLoading(false);
  //     setIsSubmitting(false);
  //   }
  // };

  //   const handleSubmit = async (e) => {
  //     e.preventDefault();

  //     const validSelectedRows = selectedRows.filter(Boolean);

  //     if (validSelectedRows.length === 0) {
  //       toast.error("Please select at least one Student.");
  //       return;
  //     }

  //     if (!remark.trim()) {
  //       setRemarkError("Please enter remark.");
  //       return;
  //     }

  //     const token = localStorage.getItem("authToken");
  //     if (!token) {
  //       toast.error("Authentication token missing.");
  //       return;
  //     }

  //     setLoading(true);
  //     setIsSubmitting(true);

  //     try {
  //       const formData = new FormData();
  //       let i = 1;

  //       // validSelectedRows.forEach((copyId) => {
  //       //   const row = displayedSections.find((item) => item.copy_id === copyId);

  //       //   if (!row) return;

  //       //   formData.append(`checkbox${i}`, row.member_id);
  //       //   formData.append(`book_id${i}`, row.book_id);
  //       //   formData.append(`due_date${i}`, row.due_date);
  //       //   formData.append(`class_id${i}`, row.class_id);
  //       //   formData.append(`section_id${i}`, row.section_id);
  //       //   formData.append(`remark_subject${i}`, "Library Book Not Returned");
  //       //   formData.append(`remark_desc${i}`, remark.trim());

  //       //   i++;
  //       // });
  //       validSelectedRows.forEach((copyId) => {
  //         const row = displayedSections.find((item) => item.copy_id === copyId);
  //         if (!row) return;

  //         const formattedDate = new Date(row.due_date).toLocaleDateString(
  //           "en-GB",
  //         );

  //         const remarkDesc = `This is to inform you that, the student ${row.first_name} has not submitted the issued book ${row.book_title} to the Library on the due date ${formattedDate}. Students are not allowed to keep any book issued from Library. The book should be returned to the library tomorrow during short break.
  // Regards
  // Soniya Chauhan
  // Library`;

  //         formData.append(`checkbox${i}`, row.member_id);
  //         formData.append(`book_id${i}`, row.book_id);
  //         formData.append(`due_date${i}`, row.due_date);
  //         formData.append(`class_id${i}`, row.class_id);
  //         formData.append(`section_id${i}`, row.section_id);
  //         formData.append(`remark_subject${i}`, "Library Book Not Returned");
  //         formData.append(`remark_desc${i}`, remarkDesc);

  //         i++;
  //       });

  //       if (i === 1) {
  //         toast.error("No valid records found.");
  //         return;
  //       }

  //       await axios.post(`${API_URL}/api/library/reminder/send`, formData, {
  //         headers: { Authorization: `Bearer ${token}` },
  //       });

  //       toast.success("Remark sent successfully.");
  //       setSelectedRows([]);
  //       setRemark();

  //       handleSearch();
  //     } catch (error) {
  //       console.error(error);
  //       toast.error("Failed to send remark.");
  //     } finally {
  //       setLoading(false);
  //       setIsSubmitting(false);
  //     }
  //   };

  const handleView = (student) => {
    setViewStudent(student);
    setShowViewModal(true);
  };

  const getFinalRemarkDesc = (row) => {
    const formattedDate = new Date(row.due_date).toLocaleDateString("en-GB");

    const systemRemark = `This is to inform you that, the student ${
      row.first_name
    } has not submitted the issued book ${
      row.book_title
    } to the Library on the due date ${formattedDate}. Students are not allowed to keep any book issued from Library. The book should be returned to the library tomorrow during short break.
Regards
${camelCase(userName)}
Library`;

    return remark && remark.trim() !== "" ? remark.trim() : systemRemark;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validSelectedRows = selectedRows.filter(Boolean);

    if (validSelectedRows.length === 0) {
      toast.error("Please select at least one Student.");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Authentication token missing.");
      return;
    }

    setLoading(true);
    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("kvalue", validSelectedRows.length);

      let k = 1;

      validSelectedRows.forEach((copyId) => {
        const row = displayedSections.find((item) => item.copy_id === copyId);
        if (!row) return;

        const formattedDate = new Date(row.due_date).toLocaleDateString(
          "en-GB",
        );

        const systemRemark = `This is to inform you that, the student ${
          row.first_name
        } has not submitted the issued book ${
          row.book_title
        } to the Library on the due date ${formattedDate}. Students are not allowed to keep any book issued from Library. The book should be returned to the library tomorrow during short break.
Regards
${camelCase(userName)}
Library`;

        const finalRemarkDesc =
          remark && remark.trim() !== "" ? remark.trim() : systemRemark;

        formData.append(`checkbox${k}`, row.member_id);
        formData.append(`book_id${k}`, row.book_id);
        formData.append(`due_date${k}`, row.due_date);
        formData.append(`class_id${k}`, row.class_id);
        formData.append(`section_id${k}`, row.section_id);
        formData.append(`remark_subject${k}`, "Library Book Pending");
        formData.append(`remark_desc${k}`, finalRemarkDesc);

        k++;
      });

      if (k === 1) {
        toast.error("No valid records found.");
        return;
      }

      await axios.post(`${API_URL}/api/library/reminder/send`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Remark sent successfully.");
      setSelectedRows([]);
      setRemark("");
      handleSearch();
    } catch (error) {
      console.error(error);
      toast.error("Failed to send remark.");
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowViewModal(false);
  };

  return (
    <>
      <div
        className={` transition-all duration-500 w-[100%]  mx-auto p-4 
          `}
      >
        <ToastContainer />
        <div className="card rounded-md ">
          <>
            <div className="card-header  flex justify-between items-center">
              <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
                Send Reminder Remark for Non Returned Book
              </h5>

              <div className="flex flex-row gap-3 items-center">
                <div className="relative group">
                  <button
                    onClick={() => setShowSearch((prev) => !prev)}
                    className="text-black hover:text-pink-500"
                  >
                    <FiSearch size={20} />
                  </button>

                  <span className="absolute top-full mt-1 right-0 hidden group-hover:block bg-blue-500 text-white text-xs px-2 py-1 rounded shadow whitespace-nowrap">
                    Search
                  </span>
                </div>

                <RxCross1
                  className="text-red-600 cursor-pointer hover:bg-red-100 rounded text-xl"
                  onClick={() => navigate("/dashboard")}
                />
              </div>
            </div>

            <div
              className="w-full h-1 mb-4"
              style={{ backgroundColor: "#C03078" }}
            />
          </>
          <div className="w-full px-2 md:px-4 mb-3">
            <div className="flex flex-col md:flex-row md:flex-wrap md:items-center gap-6 md:gap-8 md:ml-4">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="religionSelect"
                  className="text-base whitespace-nowrap w-16"
                >
                  Class
                </label>

                <div className="w-48">
                  <Select
                    id="religionSelect"
                    options={classOptions}
                    value={selectedClass}
                    onChange={handleClassSelect}
                    placeholder="Select"
                    isSearchable
                    isClearable
                    className="text-sm"
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label
                  htmlFor="todayReturn"
                  className="text-base whitespace-nowrap"
                >
                  Today Return
                </label>

                <input
                  id="todayReturn"
                  type="checkbox"
                  checked={todayReturn}
                  onChange={(e) => setTodayReturn(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="flex items-center">
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={loadingForSearch}
                  className={`h-10 px-6 rounded-md text-white font-semibold transition
          ${
            loadingForSearch
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
                >
                  {loadingForSearch ? "Browsing..." : "Browse"}
                </button>
              </div>
            </div>
          </div>

          <>
            {timetable.length > 0 && (
              <div className="w-full mx-auto transition-all duration-300">
                <>
                  <div className="w-full pl-2 pb-2 pr-2">
                    <div className="card mx-auto lg:w-full shadow-lg">
                      <div
                        className={`p-2 px-3 bg-gray-100 border-none ${
                          showSearch ? "block" : "hidden"
                        }`}
                      >
                        <div className="w-full flex justify-end mr-0 md:mr-4">
                          <div className="w-1/2 md:w-[18%] mr-1">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Search"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="card-body w-full">
                        <div
                          className=" overflow-y-scroll overflow-x-auto"
                          // h-96 lg:h-96
                          style={{
                            //   scrollbarWidth: "thin",
                            scrollbarColor: "#C03178 transparent",

                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                          }}
                        >
                          <table className="min-w-full leading-normal table-auto">
                            <thead className="">
                              <tr className="bg-gray-100">
                                <th className="min-w-[25px] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold">
                                  Sr No.
                                </th>

                                <th className="min-w-[30px] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold">
                                  <span className="mr-2 whitespace-nowrap">
                                    Select All
                                  </span>
                                  <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={handleSelectAll}
                                    className="w-3 h-3 cursor-pointer accent-blue-500"
                                    title="Select All"
                                  />
                                </th>

                                <th className="min-w-[60px] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold whitespace-nowrap">
                                  Accession No.
                                </th>

                                <th className="min-w-[200px] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold whitespace-nowrap">
                                  Book Title
                                </th>

                                <th className="min-w-[200px] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold whitespace-nowrap">
                                  Name
                                </th>

                                <th className="min-w-[80px] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold">
                                  Class
                                </th>

                                <th className="min-w-[100px] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold">
                                  Issue Date
                                </th>

                                <th className="min-w-[100px] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold">
                                  Due Date
                                </th>

                                <th className="min-w-[30px] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold">
                                  Count
                                </th>

                                {selectedRows.length > 0 && (
                                  <th className="min-w-[30px] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold">
                                    View
                                  </th>
                                )}
                              </tr>
                            </thead>

                            <tbody>
                              {loading ? (
                                <tr>
                                  <td
                                    colSpan={10}
                                    className="text-center py-6 text-blue-700 text-lg"
                                  >
                                    Please wait while data is loading...
                                  </td>
                                </tr>
                              ) : filteredSections.length ? (
                                <>
                                  {filteredSections.map((student, index) => (
                                    <tr
                                      key={student.copy_id}
                                      className="border border-gray-300"
                                    >
                                      <td className="px-2 py-2 text-center border border-gray-300">
                                        {index + 1}
                                      </td>

                                      <td className="px-2 py-2 text-center border border-gray-300">
                                        <input
                                          type="checkbox"
                                          checked={selectedRows.includes(
                                            student.copy_id,
                                          )}
                                          onChange={() =>
                                            handleRowSelect(student.copy_id)
                                          }
                                          className="w-3 h-3 cursor-pointer accent-blue-500"
                                        />
                                      </td>

                                      <td className="px-2 py-2 text-center border border-gray-300">
                                        {student.copy_id}
                                      </td>

                                      <td className="px-2 py-2 text-center border border-gray-300">
                                        {student?.book_title}
                                      </td>

                                      <td className="px-2 py-2 text-center border border-gray-300">
                                        {camelCase(
                                          `${student.first_name} ${student.mid_name} ${student.last_name}`,
                                        )}
                                      </td>

                                      <td className="px-2 py-2 text-center border border-gray-300">
                                        {student.class_name}{" "}
                                        {student.section_name}
                                      </td>

                                      <td className="px-2 py-2 text-center border border-gray-300">
                                        {formatDate(student.issue_date)}
                                      </td>

                                      <td className="px-2 py-2 text-center border border-gray-300">
                                        {formatDate(student.due_date)}
                                      </td>

                                      <td className="px-2 py-2 text-center border border-gray-300">
                                        {student.count}
                                      </td>

                                      {selectedRows.length > 0 && (
                                        <td className="px-2 py-2 text-center border border-gray-300">
                                          {selectedRows.includes(
                                            student.copy_id,
                                          ) ? (
                                            <button
                                              onClick={() =>
                                                handleView(student)
                                              }
                                              className="text-blue-600 hover:text-blue-800"
                                              title="View Details"
                                            >
                                              <MdOutlineRemoveRedEye />
                                            </button>
                                          ) : (
                                            <span className="text-gray-400">
                                              {""}
                                            </span>
                                          )}
                                        </td>
                                      )}
                                    </tr>
                                  ))}

                                  <tr className="bg-gray-100 font-semibold">
                                    <td
                                      colSpan={10}
                                      className="border border-gray-950"
                                    >
                                      <div className="flex justify-center items-center gap-2 px-4 py-2">
                                        <span>
                                          <span className="text-blue-800 ml-1">
                                            Total books not returned are :{" "}
                                          </span>

                                          <span className="text-pink-600 ml-1">
                                            {filteredSections.length}
                                          </span>
                                        </span>
                                      </div>
                                    </td>
                                  </tr>
                                </>
                              ) : timetable.length === 0 ? (
                                <tr>
                                  <td
                                    colSpan={10}
                                    className="text-center py-6 text-red-700 text-lg"
                                  >
                                    No data available.
                                  </td>
                                </tr>
                              ) : (
                                <tr>
                                  <td
                                    colSpan={10}
                                    className="text-center py-6 text-red-700 text-lg"
                                  >
                                    Result not found!
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                        {!loading && (
                          <>
                            <div className="w-full md:w-[65%] py-3 rounded-md bg-gray-100 flex flex-col md:flex-row gap-4 my-4 px-3">
                              <label className="md:w-[15%] text-md font-medium whitespace-nowrap mt-1">
                                Add Remark
                              </label>

                              <div className="w-full md:w-[full%]">
                                <div className="flex flex-col md:flex-row items-start md:items-end gap-3">
                                  {/* Textarea */}
                                  <div className="w-full flex-1">
                                    <textarea
                                      rows={2}
                                      value={remark}
                                      onChange={(e) => {
                                        setRemark(e.target.value);
                                        setRemarkError("");
                                      }}
                                      className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-pink-500"
                                      placeholder="Enter remark..."
                                      maxLength={1000}
                                    />

                                    {remarkError && (
                                      <p className="text-red-500 text-sm">
                                        {remarkError}
                                      </p>
                                    )}
                                  </div>

                                  {/* Clear Remark Button */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setRemark("");
                                      setRemarkError("");
                                    }}
                                    className="px-2 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition whitespace-nowrap md:self-end"
                                  >
                                    Clear Remark
                                  </button>
                                </div>
                              </div>
                            </div>
                            {/* <div className="flex flex-col md:flex-row items-start md:items-end gap-3">
                                  <div className="w-full flex-1">
                                    <textarea
                                      rows={2}
                                      value={remark}
                                      onChange={(e) => {
                                        setRemark(e.target.value);
                                        setIsRemarkApplied(false);
                                        setRemarkError("");
                                      }}
                                      className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-pink-500"
                                      placeholder="Enter remark..."
                                      maxLength={1000}
                                    />

                                    {remarkError && (
                                      <p className="text-red-500 text-sm mt-1">
                                        {remarkError}
                                      </p>
                                    )}
                                  </div>

                                  <button
                                    onClick={() => {
                                      if (!remark.trim()) {
                                        setRemarkError(
                                          "Please enter comment remark.",
                                        );
                                        return;
                                      }
                                      setIsRemarkApplied(true);
                                      toast.success(
                                        "Remark applied to selected records",
                                      );
                                    }}
                                    className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition whitespace-nowrap md:self-end"
                                  >
                                    Apply
                                  </button>
                                </div> */}

                            <div className="flex justify-end gap-4 pr-3 mt-5 ">
                              <button
                                type="button"
                                onClick={handleSubmit}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded"
                              >
                                {isSubmitting ? "Sending" : "Send Remark"}
                              </button>

                              <button
                                onClick={() => navigate("/dashboard")}
                                className="bg-yellow-300 hover:bg-yellow-400 text-white font-semibold px-4 py-2 rounded"
                              >
                                Back
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              </div>
            )}
          </>
        </div>
        {showViewModal && viewStudent && (
          // <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          //   <div className="bg-white w-[90%] md:w-[600px] rounded-lg shadow-lg p-5">
          //     <h2 className="text-lg font-semibold text-blue-800 mb-4">
          //       Student Remark Preview
          //     </h2>

          //     <div className="space-y-3 text-sm">
          //       <p>
          //         <strong>Student Name:</strong>{" "}
          //         {camelCase(
          //           `${viewStudent.first_name} ${viewStudent.mid_name} ${viewStudent.last_name}`,
          //         )}
          //       </p>

          //       <p>
          //         <strong>Class:</strong> {viewStudent.class_name}{" "}
          //         {viewStudent.section_name}
          //       </p>

          //       <p>
          //         <strong>Book Title:</strong> {viewStudent.book_title}
          //       </p>

          //       <p>
          //         <strong>Remark Subject:</strong> Library Book Pending
          //       </p>

          //       <div>
          //         <strong>Remark Description:</strong>
          //         <div className="mt-2 p-3 bg-gray-100 rounded text-justify whitespace-pre-line">
          //           {getFinalRemarkDesc(viewStudent)}
          //         </div>
          //       </div>
          //     </div>

          //     <div className="flex justify-end mt-5">
          //       <button
          //         onClick={() => setShowViewModal(false)}
          //         className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          //       >
          //         Close
          //       </button>
          //     </div>
          //   </div>
          // </div>
          <div
            className="modal"
            style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              // style={{ maxWidth: "600px" }}
            >
              <div className="modal-content">
                <div className="flex justify-between p-3">
                  <h5 className="modal-title">Student Remark Preview</h5>
                  <RxCross1
                    className="float-end relative  mt-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                    type="button"
                    onClick={handleCloseModal}
                  />
                </div>
                <div
                  className=" relative  mb-3 h-1 w-[97%] mx-auto bg-red-700"
                  style={{
                    backgroundColor: "#C03078",
                  }}
                ></div>
                <div className="modal-body px-6 py-4 space-y-4 text-sm">
                  {/* Student Name */}
                  <div className="flex items-center gap-4">
                    <label className="w-[35%] text-gray-600 font-medium">
                      Student Name
                    </label>
                    <div className="w-[65%]">
                      <input
                        type="text"
                        value={camelCase(
                          `${viewStudent.first_name} ${viewStudent.mid_name} ${viewStudent.last_name}`,
                        )}
                        readOnly
                        className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-gray-800"
                      />
                    </div>
                  </div>

                  {/* Class */}
                  <div className="flex items-center gap-4">
                    <label className="w-[35%] text-gray-600 font-medium">
                      Class
                    </label>
                    <div className="w-[65%]">
                      <input
                        type="text"
                        value={selectedClass?.label || ""}
                        readOnly
                        className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-gray-800"
                      />
                    </div>
                  </div>

                  {/* Book Title */}
                  <div className="flex items-center gap-4">
                    <label className="w-[35%] text-gray-600 font-medium">
                      Book Title
                    </label>
                    <div className="w-[65%]">
                      <input
                        type="text"
                        value={viewStudent.book_title}
                        readOnly
                        className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-gray-800"
                      />
                    </div>
                  </div>

                  {/* Remark Subject */}
                  <div className="flex items-center gap-4">
                    <label className="w-[35%] text-gray-600 font-medium">
                      Remark Subject
                    </label>
                    <div className="w-[65%]">
                      <input
                        type="text"
                        value="Library Book Pending"
                        readOnly
                        className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-gray-800"
                      />
                    </div>
                  </div>

                  {/* Remark Description */}
                  <div className="flex items-start gap-4">
                    <label className="w-[35%] text-gray-600 font-medium pt-1">
                      Remark Description
                    </label>

                    <div className="w-[65%]">
                      <div className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-gray-800 whitespace-pre-line">
                        {getFinalRemarkDesc(viewStudent)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SendRemainderRemark;
