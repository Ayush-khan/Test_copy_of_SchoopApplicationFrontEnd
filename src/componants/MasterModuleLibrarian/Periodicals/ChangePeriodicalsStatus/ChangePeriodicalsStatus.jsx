import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLocation, useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { FiSearch } from "react-icons/fi";

const ChangePeriodicalsStatus = () => {
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

  const [volumeData, setVolumeData] = useState([]);
  const [loadingVolumes, setLoadingVolumes] = useState("");
  const [volumeError, setVolumeError] = useState("");
  const [selectedVolume, setSelectedVolume] = useState(null);
  const [selectedVolumeId, setSelectedVolumeId] = useState(null);

  const [subscriptionStatus, setSubscriptionStatus] = useState("");

  useEffect(() => {
    // fetchSessionAndExams();
    fetchExams();
  }, []);

  //   const fetchSessionAndExams = async () => {
  //     const token = localStorage.getItem("authToken");

  //     if (!token) {
  //       console.error("No authentication token found");
  //       return;
  //     }

  //     try {
  //       const sessionResponse = await axios.get(`${API_URL}/api/sessionData`, {
  //         headers: { Authorization: `Bearer ${token}` },
  //       });

  //       const shortname = sessionResponse?.data?.custom_claims?.short_name;
  //       const regId = sessionResponse?.data?.custom_claims?.reg_id;
  //       const loginUserName = sessionResponse?.data?.user?.name;

  //       setShortName(shortname);
  //       setRegId(regId);
  //       setUserName(loginUserName);

  //       console.log("short name:", shortname);
  //       console.log("regId:", regId);
  //     } catch (error) {
  //       console.error("Error fetching session data:", error);
  //     }
  //   };

  const fetchExams = async () => {
    try {
      setLoadingExams(true);
      const token = localStorage.getItem("authToken");

      const response = await axios.get(`${API_URL}/api/library/periodicals`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // console.log("Periodicals:", response);

      const subscriptions = response?.data?.data || [];
      setClassNameWithClassId(subscriptions);

      // If there is at least one subscription, fetch its volumes
      if (subscriptions.length > 0) {
        fetchVolumes(subscriptions[0].periodical_id);
      }
    } catch (error) {
      toast.error("Error fetching Periodicals");
      console.error("Error fetching Periodicals:", error);
    } finally {
      setLoadingExams(false);
    }
  };

  const handleClassSelect = (selectedOption) => {
    setClassError("");
    setSelectedClass(selectedOption);
    setSelectedClassId(selectedOption?.value);

    if (selectedOption?.value) {
      fetchVolumes(selectedOption.value);
    }
  };

  const classOptions = useMemo(
    () =>
      classNameWithClassId.map((cls) => ({
        value: cls.periodical_id,
        label: cls.title,
      })),
    [classNameWithClassId],
  );

  const fetchVolumes = async (periodicalId) => {
    if (!periodicalId) return;

    setLoadingVolumes(true);
    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/library/get_volumes_by_periodical_id/${periodicalId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // console.log("Volumes:", response.data.data);
      setVolumeData(response.data.data || []);
    } catch (error) {
      console.error("Error fetching volumes", error);
      setVolumeData([]);
    } finally {
      setLoadingVolumes(false);
    }
  };

  const handleVolumeSelect = (selectedOption) => {
    setVolumeError("");
    setSelectedVolume(selectedOption);
    setSelectedVolumeId(selectedOption?.value);
  };

  // Volume dropdown options
  const volumeOptions = useMemo(
    () =>
      volumeData.map((v) => ({
        value: v.subscription_vol_id, // use unique volume id
        label: v.volume,
      })),
    [volumeData],
  );

  // const handleSearch = async () => {
  //   setLoadingForSearch(true);
  //   setLoading(true);
  //   setTimetable([]);

  //   const token = localStorage.getItem("authToken");

  //   if (!selectedClassId) {
  //     setClassError("Please select periodicals.");
  //   }
  //   if (!selectedVolumeId) {
  //     setVolumeError("Please select volume.");
  //   }

  //   try {
  //     const params = {};

  //     if (todayReturn) {
  //       params.date = new Date().toISOString().split("T")[0];
  //     }

  //     const response = await axios.get(
  //       `${API_URL}/api/library/get_volumes_issues/${selectedVolumeId}`,
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       },
  //     );

  //     if (!response?.data?.data?.length) {
  //       toast.error("No data found.");
  //       setTimetable([]);
  //     } else {
  //       setTimetable(response.data.data);
  //       // setPageCount(Math.ceil(response.data.data.length / pageSize));
  //     }
  //   } catch (error) {
  //     console.error("Error fetching:", error);
  //     toast.error("Error fetching change periodical status. Please try again.");
  //   } finally {
  //     setLoadingForSearch(false);
  //     setLoading(false);
  //   }
  // };

  const handleSearch = async () => {
    // reset errors first
    setClassError("");
    setVolumeError("");

    // validation
    let hasError = false;

    if (!selectedClassId) {
      setClassError("Please select periodicals.");
      hasError = true;
    }

    if (!selectedVolumeId) {
      setVolumeError("Please select volume.");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    setLoadingForSearch(true);
    setLoading(true);
    setTimetable([]);

    const token = localStorage.getItem("authToken");

    try {
      const response = await axios.get(
        `${API_URL}/api/library/get_volumes_issues/${selectedVolumeId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const subscriptionStatus = response.data.subscription_status;
      setSubscriptionStatus(subscriptionStatus);

      // console.log("outside status", subscriptionStatus);

      if (!response?.data?.data?.length) {
        toast.error("No data found.");
        setTimetable([]);
      } else {
        setTimetable(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching:", error);
      toast.error("Error fetching change periodical status. Please try again.");
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
    dateStr && dateStr !== "0000-00-00"
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

  const displayedSections = filteredSections.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize,
  );

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

  //   const handleSubmit = async (e) => {
  //     e.preventDefault();

  //     const validSelectedRows = selectedRows.filter(Boolean);

  //     if (validSelectedRows.length === 0) {
  //       toast.error("Please select at least one Student.");
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

  //       formData.append("kvalue", validSelectedRows.length);

  //       let k = 1;

  //       validSelectedRows.forEach((copyId) => {
  //         const row = displayedSections.find((item) => item.copy_id === copyId);
  //         if (!row) return;

  //         const formattedDate = new Date(row.due_date).toLocaleDateString(
  //           "en-GB",
  //         );

  //         const systemRemark = `This is to inform you that, the student ${
  //           row.first_name
  //         } has not submitted the issued book ${
  //           row.book_title
  //         } to the Library on the due date ${formattedDate}. Students are not allowed to keep any book issued from Library. The book should be returned to the library tomorrow during short break.
  // Regards
  // ${camelCase(userName)}
  // Library`;

  //         const finalRemarkDesc =
  //           remark && remark.trim() !== "" ? remark.trim() : systemRemark;

  //         formData.append(`checkbox${k}`, row.member_id);
  //         formData.append(`book_id${k}`, row.book_id);
  //         formData.append(`due_date${k}`, row.due_date);
  //         formData.append(`class_id${k}`, row.class_id);
  //         formData.append(`section_id${k}`, row.section_id);
  //         formData.append(`remark_subject${k}`, "Library Book Pending");
  //         formData.append(`remark_desc${k}`, finalRemarkDesc);

  //         k++;
  //       });

  //       if (k === 1) {
  //         toast.error("No valid records found.");
  //         return;
  //       }

  //       await axios.post(`${API_URL}/api/library/reminder/send`, formData, {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });

  //       toast.success("Remark sent successfully.");
  //       setSelectedRows([]);
  //       setRemark("");
  //       handleSearch();
  //     } catch (error) {
  //       console.error(error);
  //       toast.error("Failed to send remark.");
  //     } finally {
  //       setLoading(false);
  //       setIsSubmitting(false);
  //     }
  //   };

  const handleCloseModal = () => {
    setShowViewModal(false);
  };

  const handleReceiveDateChange = (issueId, newDate) => {
    setTimetable((prev) =>
      prev.map((row) =>
        row.subscription_issue_id === issueId
          ? { ...row, receive_by_date: newDate }
          : row,
      ),
    );
  };

  const handleDateReceivedChange = (issueId, newDate) => {
    setTimetable((prev) =>
      prev.map((row) =>
        row.subscription_issue_id === issueId
          ? { ...row, date_received: newDate }
          : row,
      ),
    );
  };

  const handleSubmit = async () => {
    if (subscriptionStatus === "Expired") {
      toast.info("Subscription is expired. Dates cannot be changed.");
      return;
    }

    const token = localStorage.getItem("authToken");

    if (!token) {
      toast.error("Authentication token missing");
      return;
    }

    // 🔹 Prepare arrays from timetable
    const issue = [];
    const date_received = [];
    const receive_by_date = [];

    timetable.forEach((row) => {
      if (row.subscription_issue_id) {
        issue.push(row.issue);

        date_received.push(
          row.date_received && row.date_received !== "0000-00-00"
            ? row.date_received
            : "",
        );

        receive_by_date.push(
          row.receive_by_date && row.receive_by_date !== "0000-00-00"
            ? row.receive_by_date
            : "",
        );
      }
    });

    if (issue.length === 0) {
      toast.warning("No data to update");
      return;
    }

    const payload = {
      issue,
      date_received,
      receive_by_date,
    };

    try {
      setIsSubmitting(true);

      const response = await axios.post(
        `${API_URL}/api/library/update_periodical_status/${selectedVolumeId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      // console.log("resonse", response);

      toast.success("Subscription status updated successfully");

      // Optional: refresh list
      handleSearch();
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Failed to update subscription status");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className={` transition-all duration-500 w-[95%] mx-auto p-4`}>
        <ToastContainer />
        <div className="card rounded-md ">
          <>
            <div className="card-header  flex justify-between items-center">
              <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
                Change Periodical Status
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
            <div className="flex flex-col md:flex-row md:flex-wrap md:items-start gap-6 md:gap-8 md:ml-4">
              {/* Periodic Name */}
              <div className="flex items-start gap-2">
                <label className="text-base whitespace-nowrap w-32 pt-2">
                  Periodic Name <span className="text-red-500 text-sm">*</span>
                </label>

                <div className="w-48">
                  <Select
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

                  {/* Error space reserved */}
                  <span className="block text-xs text-red-500 min-h-[1rem]">
                    {classError}
                  </span>
                </div>
              </div>

              {/* Volume */}
              <div className="flex items-start gap-2">
                <label className="text-base whitespace-nowrap w-32 pt-2">
                  Volume <span className="text-red-500 text-sm">*</span>
                </label>

                <div className="w-48">
                  <Select
                    options={volumeOptions}
                    value={selectedVolume}
                    onChange={handleVolumeSelect}
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

                  {/* Error space reserved */}
                  <span className="block text-xs text-red-500 min-h-[1rem]">
                    {volumeError}
                  </span>
                </div>
              </div>

              {/* Browse Button */}
              <div className="flex flex-col">
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

                {/* Spacer to align with error text */}
                <span className="block min-h-[1rem]"></span>
              </div>
            </div>
          </div>

          {timetable.length > 0 && subscriptionStatus === "Expired" && (
            <div className="mb-3 ml-4 mr-4 px-4 py-1 bg-blue-50 border-l-4 border-blue-500 text-blue-800 text-sm rounded">
              <strong>Note:</strong> Subscription is expired. Received dates
              cannot be changed.
            </div>
          )}

          <>
            {timetable.length > 0 && (
              <div className="w-full mx-auto transition-all duration-300">
                <>
                  <div className="w-full pl-2 pb-2 pr-2">
                    <div className="card mx-auto lg:w-[85%] shadow-lg">
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

                                <th className="min-w-[60px] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold whitespace-nowrap">
                                  Issue
                                </th>

                                <th className="min-w-[200px] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold whitespace-nowrap">
                                  Received By Date
                                </th>

                                <th className="min-w-[200px] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold whitespace-nowrap">
                                  Status
                                </th>

                                <th className="min-w-[80px] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold">
                                  Received Date
                                </th>
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
                                      key={student.subscription_issue_id}
                                      className="border border-gray-300"
                                    >
                                      <td className="px-2 py-2 w-[10%] text-center border border-gray-300">
                                        {index + 1}
                                      </td>

                                      <td className="px-2 py-2 w-[10%] text-center border border-gray-300">
                                        {student.issue}
                                      </td>

                                      <td className="px-2 py-2 w-[30%] text-center border border-gray-300">
                                        {student?.status === "Received" ? (
                                          formatDate(student?.receive_by_date)
                                        ) : (
                                          <input
                                            type="date"
                                            min={student.from_date}
                                            max={student.to_date}
                                            value={
                                              student.receive_by_date || ""
                                            }
                                            onChange={(e) =>
                                              handleReceiveDateChange(
                                                student.subscription_issue_id,
                                                e.target.value,
                                              )
                                            }
                                            className="border border-gray-300 rounded px-2 py-1 text-sm w-[70%]"
                                          />
                                        )}
                                      </td>

                                      <td className="px-2 py-2 w-[20%] text-center border border-gray-300">
                                        {student?.status || ""}
                                      </td>

                                      <td className="px-2 py-2 w-[30%] text-center border border-gray-300">
                                        {subscriptionStatus === "Expired" ? (
                                          <input
                                            type="text"
                                            value={student.date_received || ""}
                                            className="border border-gray-300 rounded px-2 py-1 text-sm w-[70%]"
                                          />
                                        ) : (
                                          <input
                                            type="date"
                                            value={student.date_received || ""}
                                            onChange={(e) =>
                                              handleDateReceivedChange(
                                                student.subscription_issue_id,
                                                e.target.value,
                                              )
                                            }
                                            className="border border-gray-300 rounded px-2 py-1 text-sm w-[70%]"
                                          />
                                        )}
                                      </td>
                                    </tr>
                                  ))}
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
                        {/* {!loading &&  (
                          <>
                            <div className="flex justify-end gap-4 pr-3 mt-5 ">
                              <button
                                type="button"
                                onClick={handleSubmit}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded"
                              >
                                {isSubmitting ? "Saving" : "Save"}
                              </button>

                              <button
                                onClick={() => navigate("/dashboard")}
                                className="bg-yellow-300 hover:bg-yellow-400 text-white font-semibold px-4 py-2 rounded"
                              >
                                Back
                              </button>
                            </div>
                          </>
                        )} */}
                        {!loading && (
                          <div className="flex justify-end gap-4 pr-3 mt-5">
                            {subscriptionStatus !== "Expired" && (
                              <button
                                disabled={subscriptionStatus === "Expired"}
                                className={`px-4 py-2 rounded font-semibold ${
                                  subscriptionStatus === "Expired"
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-blue-500 hover:bg-blue-600 text-white"
                                }`}
                                onClick={handleSubmit}
                              >
                                Save
                              </button>
                            )}

                            <button
                              onClick={() => navigate("/dashboard")}
                              className="bg-yellow-300 hover:bg-yellow-400 text-white font-semibold px-4 py-2 rounded"
                            >
                              Back
                            </button>
                          </div>
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

export default ChangePeriodicalsStatus;
