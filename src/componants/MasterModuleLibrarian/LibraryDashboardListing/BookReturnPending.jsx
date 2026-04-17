import axios from "axios";
import { RxCross1 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactPaginate from "react-paginate";
import { FiSearch } from "react-icons/fi";
import { MdAddCircleOutline, MdOutlineRemoveRedEye } from "react-icons/md";
import { FaInfoCircle } from "react-icons/fa";

function BookReturnPending() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Student");

  const [searchTerm, setSearchTerm] = useState("");

  const [absentTeachers, setAbsentTeachers] = useState([]);
  const [leaveCount, setLeaveCount] = useState(0);

  const [presentTeachers, setPresentTeachers] = useState([]);
  const [prsentCount, setPrsentCount] = useState(0);

  const [currentPage, setCurrentPage] = useState(0);
  const [showSearch, setShowSearch] = useState(false);

  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");

  const [previewMessage, setPreviewMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [viewStudent, setViewStudent] = useState(null);
  const [userName, setUserName] = useState("");

  const [backendErrors, setBackendErrors] = useState("");
  const [selectedIds, setSelectedIds] = useState("");
  const [message, setMessage] = useState("");
  const maxCharacters = 150;

  const pageSize = 10;

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

      const loginUserName = sessionResponse?.data?.user?.name;

      setUserName(loginUserName);
    } catch (error) {
      console.error("Error fetching session data:", error);
    }
  };
  useEffect(() => {
    fetchAbsentNonTeachingStaff();
    handleSearch();
  }, []);

  const fetchAbsentNonTeachingStaff = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        `${API_URL}/api/book_return_pending_seperate`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const students = response.data?.data?.students || [];
      const staff = response.data?.data?.staff || [];

      // console.log("Students", students);
      // console.log("Staff", staff);

      setAbsentTeachers(students);
      setPresentTeachers(staff);
      setPrsentCount(students.length);
      setLeaveCount(staff.length);
    } catch (error) {
      setError(error.message || "Something went wrong while fetching data.");
    } finally {
      setLoading(false);
    }
  };
  const handleSearch = async () => {
    setLoading(true);
    setError("");
    // setShowSearch(true);
    await fetchAbsentNonTeachingStaff();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab); // Update the active tab state
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

  const filteredPresentTeachers = presentTeachers.filter((student) => {
    const searchLower = searchTerm.toLowerCase().trim();

    const fullName = `${student.name || ""}`.toLowerCase();
    const category = `${student.teachercategoryname || ""}`.toLowerCase();
    const phone = `${student.phone || ""}`.toLowerCase();
    const classSection = `${student.class_section || ""}`.toLowerCase();
    const punchIn = `${student.punch_in || ""}`.toLowerCase();
    const punchOut = `${student.punch_out || ""}`.toLowerCase();

    return (
      fullName.includes(searchLower) ||
      category.includes(searchLower) ||
      phone.includes(searchLower) ||
      classSection.includes(searchLower) ||
      punchIn.includes(searchLower) ||
      punchOut.includes(searchLower)
    );
  });

  // console.log(filteredPresentTeachers);

  const filteredAbsentTeachers = absentTeachers.filter((student) => {
    const searchLower = searchTerm.trim().replace(/\s+/g, " ").toLowerCase();

    const normalize = (value) =>
      value?.toString().trim().replace(/\s+/g, " ").toLowerCase() || "";

    const studentName = normalize(student?.book_title);
    const accessionNo = normalize(student?.accession_no);
    const locationBook = normalize(student?.location_of_book);
    const status = normalize(student?.Status_code);
    const amount = normalize(student?.copy_id);
    const author = normalize(student?.author);
    const publisher = normalize(student?.publisher);
    const addedDate = formatDate(normalize(student.issue_date));
    const dueDate = formatDate(normalize(student.due_date));
    const returnDate = formatDate(normalize(student.return_date));
    const pulicationYear = normalize(student?.year);
    const editionNo = normalize(student?.edition);
    const price = normalize(student?.price);
    const isbnNo = normalize(student?.isbn);
    const combined = normalize(
      `${student?.call_no || ""} / ${student?.category_name || ""}`,
    );

    const fullName = normalize(
      `${student?.first_name || ""}  ${student?.mid_name || ""} ${student?.last_name || ""}`,
    );

    const staffName = normalize(`${student?.name}`);

    return (
      studentName.includes(searchLower) ||
      accessionNo.includes(searchLower) ||
      locationBook.includes(searchLower) ||
      status.includes(searchLower) ||
      amount.includes(searchLower) ||
      author.includes(searchLower) ||
      combined.includes(searchLower) ||
      publisher.includes(searchLower) ||
      addedDate.includes(searchLower) ||
      pulicationYear.includes(searchLower) ||
      editionNo.includes(searchLower) ||
      price.includes(searchLower) ||
      isbnNo.includes(searchLower) ||
      fullName.includes(searchLower) ||
      dueDate.includes(searchLower) ||
      returnDate.includes(searchLower) ||
      staffName.includes(searchLower)
    );
  });

  // console.log(filteredAbsentTeachers);

  const activeData =
    activeTab === "Student" ? filteredAbsentTeachers : filteredPresentTeachers;

  useEffect(() => {
    setCurrentPage(0);
  }, [activeTab, searchTerm]);

  const pageCount = Math.ceil(activeData.length / pageSize);

  const displayedData = activeData.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize,
  );

  useEffect(() => {
    const trimmedSearch = searchTerm.trim().toLowerCase();

    if (trimmedSearch !== "" && prevSearchTermRef.current === "") {
      previousPageRef.current = currentPage;
      setCurrentPage(0);
    }

    if (trimmedSearch === "" && prevSearchTermRef.current !== "") {
      setCurrentPage(previousPageRef.current);
    }

    prevSearchTermRef.current = trimmedSearch;
  }, [searchTerm]);

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const selectedCount =
    activeTab === "Student"
      ? filteredAbsentTeachers.filter((t) => selectedIds.includes(t.member_id))
          .length
      : filteredPresentTeachers.filter((t) => selectedIds.includes(t.member_id))
          .length;

  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = (e, list) => {
    if (e.target.checked) {
      const allIds = list.map((item) => item.member_id);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const generateMessagePreview = (person) => {
    const name = camelCase(
      `${person.first_name || ""} ${person.mid_name || ""} ${person.last_name || ""}`,
    ).trim();

    // get all records for same member_id
    const memberBooks = displayedData.filter(
      (item) => item.member_id === person.member_id,
    );

    // build book details string
    const bookDetails = memberBooks.length
      ? memberBooks
          .map((item, index) => {
            const issueDate = formatDate(item.issue_date);
            const dueDate = formatDate(item.due_date);

            return `${index + 1}) ${item.book_title} (Issue: ${issueDate}, Due: ${dueDate})`;
          })
          .join("\n")
      : "No book details available.";

    // ✅ insert custom message OR fallback default line
    const customSection =
      message && message.trim()
        ? message.trim()
        : "Please return them to the library tomorrow during short break.";

    const finalMsg = `Dear ${name},

You have not submitted the following issued book(s):

${bookDetails}

${customSection}

Regards  
${camelCase(userName)}  
Library`;

    return finalMsg;
  };

  const handleViewMessage = (student) => {
    const msg = generateMessagePreview(student);

    setViewStudent(student);
    setPreviewMessage(msg);
    setShowModal(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    let hasError = false;
    if (selectedIds.length === 0) {
      toast.error("Please select at least one member to send message.");
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

      // console.log("selectedIds", selectedIds);
      // console.log("message", message);

      const postData = {
        member_id: selectedIds,
        message: message,
      };

      // Make the API call
      const response = await axios.post(
        `${API_URL}/api/book_return_pending_wp_message`,
        postData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Handle successful response
      if (response.status === 200) {
        toast.success("Message sent successfully!");

        setMessage("");

        setSelectedIds([]);
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

  return (
    <>
      <ToastContainer />
      <div className="md:mx-auto md:w-[90%] p-3 bg-white mt-2">
        <div className="card-header flex justify-between items-center">
          <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
            Book Return Pending
          </h3>
          {/* <RxCross1
            className="float-end relative  -top-1 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
            onClick={() => {
              navigate("/dashboard");
            }}
          /> */}
          <div className="flex flex-row gap-3 items-center justify-end">
            {/* Search */}
            <div className="relative group">
              <button
                onClick={() => setShowSearch((prev) => !prev)}
                className="text-black hover:text-pink-500"
              >
                <FiSearch size={20} />
              </button>

              <span className="absolute bottom-full mt-1 right-0 hidden group-hover:block bg-blue-500 text-white text-xs px-2 py-1 rounded shadow">
                Search
              </span>
            </div>

            {/* Close */}
            <RxCross1
              className="text-red-600 cursor-pointer hover:bg-red-100 rounded text-lg"
              onClick={() => navigate("/dashboard")}
            />
          </div>
        </div>
        <div
          className="relative mb-8 h-1 mx-auto bg-red-700"
          style={{ backgroundColor: "#C03078" }}
        ></div>
        {/* <ul className="grid grid-cols-2 gap-x-10 relative -left-6 md:left-0 md:flex md:flex-row -top-4">
          {[
            { label: "Student", count: prsentCount },
            { label: "Staff", count: leaveCount },
          ].map((tab) => (
            <li
              key={tab.label}
              className={`md:-ml-7 shadow-md ${
                activeTab === tab.label ? "text-blue-500 font-bold" : ""
              }`}
            >
              <button
                onClick={() => handleTabChange(tab.label)}
                className="px-2 md:px-4 py-1 hover:bg-gray-200 text-[1em] md:text-sm text-nowrap"
              >
                {tab.label.replace(/([A-Z])/g, " $1")}{" "}
                <span className="text-sm text-[#C03078] font-bold">
                  ({tab.count})
                </span>
              </button>
            </li>
          ))}
        </ul> */}
        <div className="flex items-center justify-between -top-5 relative">
          <ul className="grid grid-cols-2 gap-x-10 relative -left-6 md:left-0 md:flex md:flex-row">
            {[
              { label: "Student", count: prsentCount },
              { label: "Staff", count: leaveCount },
            ].map((tab) => (
              <li
                key={tab.label}
                className={`md:-ml-7 shadow-md ${
                  activeTab === tab.label ? "text-blue-500 font-bold" : ""
                }`}
              >
                <button
                  onClick={() => handleTabChange(tab.label)}
                  className="px-2 md:px-4 py-1 hover:bg-gray-200 text-[1em] md:text-sm whitespace-nowrap"
                >
                  {tab.label.replace(/([A-Z])/g, " $1")}{" "}
                  <span className="text-sm text-[#C03078] font-bold">
                    ({tab.count})
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-300 text-blue-800 text-xs md:text-sm rounded whitespace-nowrap">
            <FaInfoCircle size={16} />
            <span>
              A default message will be sent to the selected member if no custom
              message is entered.
            </span>
          </div>
        </div>
        <div className="w-full">
          <div className="bg-white rounded-md">
            {showSearch && (
              <div className="py-1 px-3 bg-gray-100 border-none rounded-t-md mb-1">
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
            )}
            {loading ? (
              <div className="text-center text-xl py-10 text-blue-700">
                Please wait while data is loading...
              </div>
            ) : activeTab === "Student" ? (
              <div
                className="lg:h-96 overflow-y-scroll"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#C03178 transparent",
                }}
              >
                <table className="min-w-full leading-normal table-auto">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-0.5  mx-auto text-center lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Sr.No
                      </th>
                      <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        <div className="flex flex-col items-center">
                          <span>Select All</span>
                          <input
                            type="checkbox"
                            onChange={(e) => handleSelectAll(e, absentTeachers)}
                            checked={
                              absentTeachers.length > 0 &&
                              absentTeachers.every((item) =>
                                selectedIds.includes(item.member_id),
                              )
                            }
                          />
                        </div>
                      </th>
                      <th className="px-0.5  mx-auto text-center lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Acession No.
                      </th>
                      <th className="px-0.5  mx-auto text-center lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Book Title
                      </th>
                      <th className="px-0.5 text-center  lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Borrower
                      </th>
                      <th className="px-0.5 text-center  lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Mobile No.
                      </th>
                      <th className="px-0.5 text-center  lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Issue Date
                      </th>
                      <th className="px-0.5 text-center  lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Due Date
                      </th>
                      {selectedIds.length > 0 && (
                        <th className="px-0.5 text-center  lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          View Message
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {displayedData.length > 0 ? (
                      displayedData.map((student, index) => (
                        <tr
                          key={student.student_id}
                          className={`${
                            index % 2 === 0 ? "bg-white" : "bg-gray-100"
                          } hover:bg-gray-50`}
                        >
                          <td className="sm:px-0.5 text-center lg:px-1 border border-gray-950 text-sm">
                            {currentPage * pageSize + index + 1}
                          </td>
                          <td className="text-center px-2 py-2 border border-gray-950 text-sm">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(student.member_id)}
                              onChange={() =>
                                handleCheckboxChange(student.member_id)
                              }
                            />
                          </td>
                          <td className="px-2 text-center lg:px-2 py-2 border border-gray-950 text-sm">
                            {student?.copy_id}
                          </td>

                          <td className="text-center px-2 lg:px-2 border border-gray-950 text-sm">
                            {student?.book_title}
                          </td>

                          <td className="text-center px-2 lg:px-2 border border-gray-950 text-sm">
                            {camelCase(
                              `${student.first_name || ""} ${student?.mid_name || ""} ${student?.last_name || ""}`,
                            )}
                          </td>
                          <td className="text-center px-2 lg:px-2 border border-gray-950 text-sm">
                            {student?.phone_no}
                          </td>
                          <td className="text-center px-2 lg:px-2 border border-gray-950 text-sm">
                            {formatDate(student?.issue_date)}
                          </td>
                          <td className="text-center px-2 lg:px-2 border border-gray-950 text-sm">
                            {formatDate(student?.due_date)}
                          </td>
                          {selectedIds.length > 0 && (
                            <td className="text-center border border-gray-950">
                              {selectedIds.includes(student.member_id) && (
                                <button
                                  onClick={() => handleViewMessage(student)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <MdOutlineRemoveRedEye />
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="9"
                          className="text-center text-xl py-5 text-red-700 border border-gray-950"
                        >
                          No data available of book return pending for student.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div
                className="h-96 lg:h-96 overflow-y-scroll"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#C03178 transparent",
                }}
              >
                <table className="min-w-full leading-normal table-auto">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-0.5 mx-auto text-center lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Sr.No
                      </th>
                      <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        <div className="flex flex-col items-center">
                          <span>Select All</span>
                          <input
                            type="checkbox"
                            onChange={(e) =>
                              handleSelectAll(e, presentTeachers)
                            }
                            checked={
                              presentTeachers.length > 0 &&
                              presentTeachers.every((item) =>
                                selectedIds.includes(item.member_id),
                              )
                            }
                          />
                        </div>
                      </th>
                      <th className="px-0.5 first-line:mx-auto text-center lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Accession No.
                      </th>
                      <th className="px-0.5  mx-auto text-center lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Book Title
                      </th>
                      <th className="px-0.5 text-center  lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Borrower
                      </th>
                      <th className="px-0.5 text-center  lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Mobile No.
                      </th>
                      <th className="px-0.5 text-center  lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Issue Date
                      </th>
                      <th className="px-0.5 text-center  lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Due Date
                      </th>
                      {selectedIds.length > 0 && (
                        <th className="px-0.5 text-center  lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          View Message
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {displayedData.length > 0 ? (
                      displayedData.map((student, index) => (
                        <tr
                          key={student.student_id}
                          className={`${
                            index % 2 === 0 ? "bg-white" : "bg-gray-100"
                          } hover:bg-gray-50`}
                        >
                          <td className="sm:px-0.5 text-center lg:px-1 border border-gray-950 text-sm">
                            {currentPage * pageSize + index + 1}
                          </td>
                          <td className="text-center px-2 py-2 border border-gray-950 text-sm">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(student.member_id)}
                              onChange={() =>
                                handleCheckboxChange(student.member_id)
                              }
                              // className="w-4 h-4 cursor-pointer accent-blue-500"
                            />
                          </td>
                          <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                            {student?.copy_id}
                          </td>

                          <td className="text-center px-2 lg:px-2 py-2 border border-gray-950 text-sm">
                            {student?.book_title}
                          </td>

                          <td className="text-center px-2 lg:px-2 border border-gray-950 text-sm">
                            {camelCase(
                              `${student.first_name || ""} ${student?.mid_name || ""} ${student?.last_name || ""}`,
                            )}
                          </td>
                          <td className="text-center px-2 lg:px-2 py-2 border border-gray-950 text-sm">
                            {student?.phone_no}
                          </td>
                          <td className="text-center px-2 lg:px-2 border border-gray-950 text-sm">
                            {formatDate(student?.issue_date)}
                          </td>
                          <td className="text-center px-2 lg:px-2 border border-gray-950 text-sm">
                            {formatDate(student?.due_date)}
                          </td>
                          {selectedIds.length > 0 && (
                            <td className="text-center border border-gray-950">
                              {selectedIds.includes(student.member_id) && (
                                <button
                                  onClick={() => handleViewMessage(student)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <MdOutlineRemoveRedEye />
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="9"
                          className="text-center text-xl py-5 text-red-700 border border-gray-950"
                        >
                          No data available of book return pending for staff.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {loading ? (
            ""
          ) : (
            <div className=" flex justify-center  pt-2 -mb-3">
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
          )}

          {loading ? (
            <span>{""}</span>
          ) : (
            ((activeTab === "Student" && filteredAbsentTeachers.length > 0) ||
              (activeTab !== "Student" &&
                filteredPresentTeachers.length > 0)) && (
              <div className="flex flex-col items-center mt-2">
                <div className="w-full md:w-[70%]">
                  <label className="mb-1 font-normal block text-left">
                    {activeTab === "Student"
                      ? "Dear Student ,"
                      : "Dear Staff ,"}
                  </label>

                  {/* Row Container */}
                  <div className="flex flex-col md:flex-row items-end gap-3 w-full">
                    {/* Textarea */}
                    <div className="relative w-full">
                      <textarea
                        value={message}
                        onChange={(e) => {
                          if (e.target.value.length <= maxCharacters) {
                            setMessage(e.target.value);
                          }
                        }}
                        className="w-full h-28 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-150 resize-none bg-transparent text-sm text-black font-normal"
                        placeholder="Enter message"
                      ></textarea>

                      <div className="absolute bottom-2 right-3 text-xs text-gray-500 pointer-events-none">
                        {message.length} / {maxCharacters}
                      </div>
                    </div>

                    {/* Button */}
                    <button
                      type="submit"
                      onClick={handleSubmit}
                      style={{ backgroundColor: "#2196F3" }}
                      className={`text-white font-bold py-2 px-4 rounded whitespace-nowrap ${
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
            )
          )}

          {loading && selectedCount > 0 && (
            <div className="text-center mt-2">
              <p className="text-blue-500 font-semibold">
                Selected Member:{" "}
                <span className="text-pink-600">{selectedCount}</span>
              </p>
            </div>
          )}

          {showModal && (
            <div
              className="modal"
              style={{
                display: "block",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
              }}
            >
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="flex justify-between p-3">
                    <h5 className="modal-title">Message Preview</h5>
                    <RxCross1
                      className="mt-2 text-xl text-red-600 cursor-pointer hover:bg-red-100"
                      onClick={() => setShowModal(false)}
                    />
                  </div>

                  <div className="mb-3 h-1 w-[97%] mx-auto bg-[#C03078]"></div>

                  <div className="modal-body px-2 py-2 text-sm">
                    <div className="flex justify-center">
                      <div className="w-[80%]">
                        <div className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 whitespace-pre-line min-h-[120px] text-start">
                          {previewMessage}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default BookReturnPending;
