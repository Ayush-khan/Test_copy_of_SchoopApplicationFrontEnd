import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
// import Loader from "../common/LoaderFinal/LoaderStyle";
import { FiPrinter, FiSearch } from "react-icons/fi";
import { FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";
import zIndex from "@mui/material/styles/zIndex";

const PeriodicalsReport = () => {
  const pdfRef = useRef();
  const API_URL = import.meta.env.VITE_API_URL;
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingForSearch, setLoadingForSearch] = useState(false);

  const navigate = useNavigate();
  const [loadingExams, setLoadingExams] = useState(false);
  const [studentError, setStudentError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [timetable, setTimetable] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  const pageSize = 10;
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const [roleId, setRoleId] = useState("");
  const [regId, setRegId] = useState("");
  const [classes, setClasses] = useState([]);

  const [volumeData, setVolumeData] = useState([]);
  const [loadingVolumes, setLoadingVolumes] = useState("");
  const [volumeError, setVolumeError] = useState("");
  const [selectedVolume, setSelectedVolume] = useState(null);
  const [selectedVolumeId, setSelectedVolumeId] = useState(null);

  const [receiveDate, setReceiveDate] = useState("");
  const [loadingIssue, setLoadingIssue] = useState("");
  const [issue, setIssue] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedIssueId, setSelectedIssueId] = useState(null);

  useEffect(() => {
    // fetchDataRoleId();
    fetchPeriodicals();
  }, []);

  // const fetchDataRoleId = async () => {
  //   const token = localStorage.getItem("authToken");

  //   if (!token) {
  //     console.error("No authentication token found");
  //     return;
  //   }

  //   try {
  //     const sessionResponse = await axios.get(`${API_URL}/api/sessionData`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });

  //     const role_id = sessionResponse.data.user.role_id;
  //     const reg_id = sessionResponse.data.user.reg_id;

  //     setRoleId(role_id);
  //     setRegId(reg_id);

  //     console.log("roleIDis:", role_id); // use local variable
  //     console.log("reg id:", reg_id);

  //     return { roleId, regId };
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //   }
  // };
  // useEffect(() => {
  //   if (!roleId || !regId) return; // guard against empty
  //   fetchClasses(roleId, regId);
  // }, [roleId, regId]);

  const fetchPeriodicals = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(`${API_URL}/api/library/periodicals`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      // console.log("Periodicals data", response.data.data);
      setClasses(response.data.data);
      const periodicals = response.data.data;
      // If there is at least one subscription, fetch its volumes
      if (periodicals.length > 0) {
        fetchVolumes(periodicals[0].periodical_id);
      }
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSelect = (selectedOption) => {
    setStudentError("");
    setSelectedStudent(selectedOption);
    setSelectedStudentId(selectedOption?.value);

    setSelectedVolume(null);
    setSelectedVolumeId(null);
    setVolumeData([]);

    if (selectedOption?.value) {
      fetchVolumes(selectedOption.value);
    }
  };

  const studentOptions = useMemo(() => {
    return classes.map((cls) => ({
      value: cls.periodical_id,
      label: `${cls?.title}`,
    }));
  }, [classes]);

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

    if (selectedOption?.value) {
      fetchIssue(selectedOption.value);
    }
  };

  const volumeOptions = useMemo(
    () =>
      volumeData.map((v) => ({
        value: v.subscription_vol_id,
        label: v.volume,
      })),
    [volumeData],
  );

  const fetchIssue = async (subscriptionIssueId) => {
    if (!subscriptionIssueId) return;

    setLoadingIssue(true);
    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/library/get_volumes_issues/${subscriptionIssueId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // console.log("Issue:", response.data.data);
      setIssue(response.data.data || []);
    } catch (error) {
      console.error("Error fetching Issue", error);
      setIssue([]);
    } finally {
      setLoadingIssue(false);
    }
  };

  const handleIssueSelect = (selectedOption) => {
    // setIssueError("");
    setSelectedIssue(selectedOption);
    setSelectedIssueId(selectedOption?.value);
  };

  const issueOptions = useMemo(
    () =>
      issue.map((v) => ({
        value: v.subscription_issue_id,
        label: v.issue,
      })),
    [issue],
  );

  const handleSearch = async () => {
    setSearchTerm("");
    setShowSearch(true);

    try {
      setLoadingForSearch(true);
      setTimetable([]);

      const token = localStorage.getItem("authToken");

      const params = {};

      if (selectedStudent?.value) {
        params.periodical_id = selectedStudent.value;
      }

      if (selectedVolume?.value) {
        params.subscription_vol_id = selectedVolume.value;
      }

      if (selectedIssue?.value) {
        params.subscription_issue_id = selectedIssue.value;
      }

      if (receiveDate) {
        params.received_date = receiveDate;
      }

      const response = await axios.get(
        `${API_URL}/api/library/periodicals_report`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        },
      );

      const data = response?.data?.data || [];

      if (data.length === 0) {
        toast.error("Periodical report data not found.");
        setTimetable([]);
      } else {
        setTimetable(data);
        setPageCount(Math.ceil(data.length / pageSize));
      }
    } catch (error) {
      console.error("Error fetching periodical Report:", error);
      toast.error("Error fetching periodical report. Please try again.");
    } finally {
      setLoadingForSearch(false);
      setIsSubmitting(false);
    }
  };

  const generateStudentDetailsTableHTML = (students = []) => {
    const formatDate = (dateStr) =>
      dateStr
        ? new Date(dateStr).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          })
        : "";

    const headers = [
      "Sr No.",
      "Title",
      "Subscription No.",
      "Receiving Date",

      "Volume",
      "Issue",
    ];

    const thead = `
    <thead style="background-color: #e5e7eb; font-weight: bold;">
      <tr>
        ${headers
          .map((h) => `<th style="border: 1px  #ccc; padding: 6px;">${h}</th>`)
          .join("")}
      </tr>
    </thead>
  `;

    const tbody = `
    <tbody>
      ${timetable
        .map((student, index) => {
          return `
          <tr style="background-color: ${
            index % 2 === 0 ? "#fff" : "#f9fafb"
          };">
            <td style="border: 1px solid #ccc; padding: 6px;">${index + 1}</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${
              student.title || ""
            }</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${
              student.subscription_no || ""
            }</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${formatDate(
              student.receive_by_date || "",
            )}</td>
             
             <td style="border: 1px solid #ccc; padding: 6px;">${
               student.volume || ""
             }</td>
             <td style="border: 1px solid #ccc; padding: 6px;">${
               student.issue || ""
             }</td>
          
          </tr>
        `;
        })
        .join("")}
    </tbody>
  `;

    return `<table style="width: 100%;  font-size: 12px;">${thead}${tbody}</table>`;
  };

  const handleStudentPrint = (studentsList) => {
    const title = `Periodicals Report`;
    const tableHTML = generateStudentDetailsTableHTML(studentsList);

    const printWindow = window.open("", "_blank", "width=1000,height=800");

    printWindow.document.write(`
    <html>
      <head>
      <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { width: 100%;  font-size: 12px; }
          th, td {
  border: 1px solid #333;
}

          th { background: #f3f4f6; }
        </style>
      </head>
      <body>
        ${tableHTML}
      </body>
    </html>
  `);

    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  const handleDownloadEXL = () => {
    if (!displayedSections || displayedSections.length === 0) {
      toast.error("No data available to download the Excel sheet.");
      return;
    }

    // Define headers matching the print table
    const headers = [
      "Sr No.",
      "Title",
      "Subscription No.",
      "Receiving Date",

      "Volume",
      "Issue",
    ];

    // Convert displayedSections data to array format for Excel
    const data = displayedSections.map((student, index) => [
      index + 1,

      `${student.title}`.trim(),
      student?.subscription_no || " ",
      student?.receive_by_date ? formatDate(student.receive_by_date) : " ",

      student?.volume || " ",
      student?.issue || " ",
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const columnWidths = headers.map(() => ({ wch: 20 }));
    worksheet["!cols"] = columnWidths;

    // Create a workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Periodicals data");

    // Generate and download the Excel file
    const fileName = `Periodicals  Report.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // console.log("row", timetable);

  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        })
      : "";

  const filteredSections = Array.isArray(timetable)
    ? timetable.filter((section) => {
        const searchLower = searchTerm.toLowerCase();

        const title = `${section?.title || ""}`.trim().toString().toLowerCase();
        const date = formatDate(section?.receive_by_date?.toLowerCase() || "");
        const subcriptionNo = section?.subscription_no?.toLowerCase() || "";
        const frequency = section?.frequency?.toLowerCase() || "";
        const volume = section?.volume?.toLowerCase() || "";
        const issue = section?.issue?.toString().toLowerCase() || "";

        return (
          title.includes(searchLower) ||
          date.includes(searchLower) ||
          subcriptionNo.includes(searchLower) ||
          frequency.includes(searchLower) ||
          volume.includes(searchLower) ||
          issue.includes(searchLower)
        );
      })
    : [];

  const displayedSections = filteredSections.slice(currentPage * pageSize);

  return (
    <>
      <div
        className={`mx-auto p-4 transition-all duration-700 ease-[cubic-bezier(0.4, 0, 0.2, 1)] transform ${
          timetable.length > 0
            ? "w-full md:w-[90%] scale-100"
            : "w-full md:w-[95%] scale-[0.98]"
        }`}
      >
        <ToastContainer />
        <div className="card  rounded-md ">
          <div className=" card-header mb-4 flex justify-between items-center ">
            <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
              Periodicals Report
            </h5>

            <RxCross1
              className="  relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
              onClick={() => {
                navigate("/dashboard");
              }}
            />
          </div>
          <div
            className=" relative w-[98%]   -top-6 h-1  mx-auto bg-red-700"
            style={{
              backgroundColor: "#C03078",
            }}
          ></div>

          {filteredSections.length > 0 && (
            <div className="md:absolute md:right-3 md:top-[10%] mb-5 text-gray-500">
              <div className="mx-auto w-fit px-2 py-1 bg-blue-50 border border-blue-300 text-blue-800 text-sm rounded text-center">
                <div className="flex flex-col md:flex-row gap-x-1 justify-center md:justify-end">
                  <button
                    type="button"
                    onClick={() => setShowSearch((prev) => !prev)}
                    className="relative bg-blue-400 py-1 hover:bg-blue-500 text-white px-3 rounded group"
                  >
                    <FiSearch size={15} />

                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex items-center justify-center bg-gray-600  text-white text-[.7em] rounded-md py-1 px-2">
                      Search
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadEXL}
                    className="relative bg-blue-400 py-1 hover:bg-blue-500 text-white px-3 rounded group"
                  >
                    <FaFileExcel />

                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex items-center justify-center bg-gray-600  text-white text-[.7em] rounded-md py-1 px-2">
                      Exports to excel
                    </div>
                  </button>

                  <button
                    onClick={handleStudentPrint}
                    className="relative flex flex-row justify-center align-middle items-center gap-x-1 bg-blue-400 hover:bg-blue-500 text-white px-3 rounded group"
                  >
                    <FiPrinter />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex items-center justify-center bg-gray-600  text-white text-[.7em] rounded-md py-1 px-2">
                      Print{" "}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {timetable.length === 0 && !loadingForSearch && (
            <p className=" md:absolute md:right-7  md:top-[36%] mb-5  text-gray-500 ">
              <div className="mx-auto w-fit px-2 py-1 bg-blue-50 border border-blue-300 text-blue-800 text-sm rounded text-center">
                <strong>Note:</strong> Click on the <b>Browse</b> button to view
                data.
              </div>
            </p>
          )}

          <>
            <div
              className={`flex justify-between flex-col md:flex-row gap-x-1 ml-0 p-2  ${
                timetable.length > 0
                  ? "pb-0 w-full md:w-[100%]"
                  : "pb-4 w-full md:w-[100%]"
              }`}
            >
              <div className="w-full md:w-[100%] flex flex-col lg:flex-row items-end gap-4 ml-4">
                {/* Periodic Name */}
                <div className="w-full lg:w-[18%] flex flex-col">
                  <label htmlFor="studentSelect" className="text-md mb-1">
                    Periodic Name
                  </label>
                  <Select
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    id="studentSelect"
                    value={selectedStudent}
                    onChange={handleStudentSelect}
                    options={studentOptions}
                    placeholder={loadingExams ? "Loading..." : "Select"}
                    isSearchable
                    isClearable
                    isDisabled={loadingExams}
                    className="text-sm"
                  />
                  {studentError && (
                    <span className="text-danger text-xs mt-1">
                      {studentError}
                    </span>
                  )}
                </div>

                {/* Volume */}
                <div className="w-full lg:w-[18%] flex flex-col">
                  <label htmlFor="volumeSelect" className="text-md mb-1">
                    Volume
                  </label>
                  <Select
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    id="volumeSelect"
                    options={volumeOptions}
                    value={selectedVolume}
                    onChange={handleVolumeSelect}
                    placeholder={loadingVolumes ? "Loading..." : "Select"}
                    isSearchable
                    isClearable
                    isDisabled={!selectedStudentId || loadingVolumes}
                    className="text-sm"
                  />
                  {volumeError && (
                    <span className="text-danger text-xs mt-1">
                      {volumeError}
                    </span>
                  )}
                </div>

                {/* Issue */}
                <div className="w-full lg:w-[18%] flex flex-col">
                  <label htmlFor="volumeSelect" className="text-md mb-1">
                    Issue
                  </label>
                  <Select
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    id="issueSelect"
                    options={issueOptions}
                    value={selectedIssue}
                    onChange={handleIssueSelect}
                    placeholder={loadingIssue ? "Loading..." : "Select"}
                    isSearchable
                    isClearable
                    isDisabled={!selectedVolumeId || loadingIssue}
                    className="text-sm"
                  />
                </div>

                {/* Receive Date */}
                <div className="w-full lg:w-[18%] flex flex-col">
                  <label htmlFor="date" className="text-md mb-1">
                    Receive Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    value={receiveDate}
                    onChange={(e) => setReceiveDate(e.target.value)}
                    className="h-10 border border-gray-300 rounded px-3 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Browse Button */}
                <div className="w-full lg:w-[10%] flex">
                  <button
                    type="button"
                    onClick={handleSearch}
                    disabled={loadingForSearch}
                    className={`h-10 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold rounded px-2 flex items-center justify-center ${
                      loadingForSearch ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {loadingForSearch ? "Browsing..." : "Browse"}
                  </button>
                </div>
              </div>

              {/* {timetable.length > 0 && (
                <div className="p-2 px-3 w-72 bg-gray-100 border-none flex justify-between items-center">
                  <div className="w-full flex flex-row justify-between mr-0 md:mr-4 ">
                    <div className="w-1/2 md:w-[98%] mr-1 ">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search "
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-x-1 justify-center md:justify-end ">
                    <button
                      type="button"
                      onClick={handleDownloadEXL}
                      className="relative bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded group mb-1 lg:mb-0"
                    >
                      <FaFileExcel />
                      <div className="absolute  bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex items-center justify-center bg-gray-700 text-white text-xs text-nowrap rounded-md py-1 px-2 ">
                        Export to Excel
                      </div>
                    </button>

                    <button
                      onClick={handleStudentPrint}
                      className="relative bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded group flex items-center mb-1 lg:mb-0"
                    >
                      <FiPrinter />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex items-center justify-center bg-gray-700 text-white text-xs rounded-md py-1 px-2">
                        Print
                      </div>
                    </button>
                  </div>
                </div>
              )} */}
            </div>

            {timetable.length > 0 && (
              <>
                <div className="w-full px-4 mt-4 mb-4 ">
                  <div className="card mx-auto lg:w-full shadow-lg">
                    {showSearch && (
                      <>
                        <div className="p-1 px-3 bg-gray-100 border-none">
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
                        <div
                          className=" relative w-[97%]   mb-3 h-0.5  mx-auto bg-red-700"
                          style={{
                            backgroundColor: "#C03078",
                          }}
                        ></div>
                      </>
                    )}
                    <div className="card-body w-full ">
                      <div
                        className="h-96 lg:h-96 overflow-y-scroll overflow-x-scroll"
                        style={{
                          scrollbarWidth: "thin",
                          scrollbarColor: "#C03178 transparent",
                        }}
                      >
                        <div className="w-full flex justify-center">
                          <div className="w-full overflow-x-auto">
                            <table className="w-full table-auto leading-normal">
                              <colgroup>
                                <col className="w-[6%]" />
                                <col className="w-[25%]" />
                                <col className="w-[20%]" />
                                <col className="w-[18%]" />
                                <col className="w-[12%]" />
                                <col className="w-[12%]" />
                              </colgroup>

                              <thead
                                className="sticky top-0 bg-gray-200"
                                style={{ zIndex: 1 }}
                              >
                                <tr>
                                  {[
                                    "Sr No.",
                                    "Title",
                                    "Subscription No.",
                                    "Receiving Date",
                                    "Volume",
                                    "Issue",
                                  ].map((header, index) => (
                                    <th
                                      key={index}
                                      className="px-2 lg:px-3 py-2 text-center border border-gray-950 text-sm font-semibold text-gray-900"
                                    >
                                      {header}
                                    </th>
                                  ))}
                                </tr>
                              </thead>

                              <tbody>
                                {displayedSections.length ? (
                                  displayedSections.map((student, index) => (
                                    <tr
                                      key={student.student_id}
                                      className="border border-gray-300"
                                    >
                                      <td className="px-2 py-2 text-center border">
                                        {index + 1}
                                      </td>
                                      <td className="px-2 py-2 text-center border">
                                        {student.title || ""}
                                      </td>
                                      <td className="px-2 py-2 text-center border">
                                        {student.subscription_no || ""}
                                      </td>
                                      <td className="px-2 py-2 text-center border">
                                        {formatDate(
                                          student.receive_by_date || "",
                                        )}
                                      </td>
                                      <td className="px-2 py-2 text-center border">
                                        {student.volume || ""}
                                      </td>
                                      <td className="px-2 py-2 text-center border">
                                        {student.issue || ""}
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td
                                      colSpan={6}
                                      className="py-10 text-center text-xl text-red-700"
                                    >
                                      {timetable.length === 0
                                        ? "No data available"
                                        : "Result data found!"}
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        </div>
      </div>
    </>
  );
};

export default PeriodicalsReport;
