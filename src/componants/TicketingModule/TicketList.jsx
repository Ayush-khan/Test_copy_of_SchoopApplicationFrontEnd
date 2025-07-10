import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import LoaderStyle from "../common/LoaderFinal/LoaderStyle";
import "react-toastify/dist/ReactToastify.css";
import { MdOutlineRemoveRedEye } from "react-icons/md";

const TicketList = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [currentPage, setCurrentPage] = useState(0);
  const [loadingForSearch, setLoadingForSearch] = useState(false);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timetable, setTimetable] = useState([]);
  const pageSize = 10;
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    handleSearch();
  }, []);

  // Handle search and fetch parent information
  const handleSearch = async () => {
    setLoadingForSearch(false);
    setSearchTerm("");
    try {
      setLoadingForSearch(true); // Start loading
      setTimetable([]);
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${API_URL}/api/get_ticketlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("staff report", response);
      if (!response?.data?.data || response?.data?.length === 0) {
        toast.error("Staff Report data not found.");
        setTimetable([]);
      } else {
        setTimetable(response?.data?.data);
        setPageCount(Math.ceil(response?.data?.data?.length / pageSize)); // Set page count based on response size
      }
    } catch (error) {
      console.error("Error fetching Staff Report Report:", error);
      toast.error("Error fetching Staff Report. Please try again.");
    } finally {
      setLoading(false);
      setIsSubmitting(false); // Re-enable the button after the operation
      setLoadingForSearch(false);
    }
  };

  const handleView = async (student) => {
    console.log("handle VIew is running on");
    console.log("ticket_id", student.ticket_id);
    navigate(`/ticketList/view/${student.ticket_id}`, {
      state: { ticketDetails: student },
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr)
      .toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
      .replace(",", " ,")
      .toLowerCase();
  };

  const filteredSections = timetable.filter((student) => {
    const searchLower = searchTerm.toLowerCase();

    // Extract relevant fields and convert them to lowercase for case-insensitive search

    const studentName = student?.first_name?.toLowerCase() || "";
    const serviceName = student?.service_name?.toLowerCase() || "";
    const ticketId = student?.ticket_id?.toString().toLowerCase() || "";
    const title = student?.title?.toLowerCase() || "";
    const status = student?.status?.toLowerCase() || "";

    const raisedOn = formatDate(student?.raised_on).toLowerCase() || "";

    // Check if the search term is present in any of the specified fields
    return (
      studentName.includes(searchLower) ||
      serviceName.includes(searchLower) ||
      ticketId.includes(searchLower) ||
      title.includes(searchLower) ||
      status.includes(searchLower) ||
      raisedOn.includes(searchLower)
    );
  });

  const displayedSections = filteredSections.slice(currentPage * pageSize);
  console.log("displayedSection", displayedSections);

  return (
    <>
      <div className="w-full md:w-[90%] mx-auto p-4 ">
        <ToastContainer />
        <div className="card rounded-md ">
          {loadingForSearch ? (
            <div className="flex justify-center items-center h-64">
              <LoaderStyle />
            </div>
          ) : (
            // timetable.length > 0 && (
            <>
              <div className="w-full">
                <div className="card mx-auto lg:w-full shadow-lg">
                  <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                    <div className="w-full flex flex-row justify-between mr-0 md:mr-4 ">
                      <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
                        List of Tickets
                      </h3>
                      <div className="w-1/2 md:w-[18%] mr-1 ">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search "
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
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
                      className="h-[550px] lg:h-[550px] overflow-y-scroll overflow-x-scroll"
                      style={{
                        scrollbarWidth: "thin", // Makes scrollbar thin in Firefox
                        scrollbarColor: "#C03178 transparent", // Sets track and thumb color in Firefox
                      }}
                    >
                      <table className="min-w-full w-[1000px] leading-normal table-auto">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="w-12 px-2 py-2 text-center border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Sr No.
                            </th>
                            <th className="w-12 px-3 py-2 text-center border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Ticket ID
                            </th>
                            <th className="w-40 px-3 py-2 text-center border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Student Name
                            </th>
                            <th className="w-20 px-3 py-2 text-center border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Service Name
                            </th>
                            <th className="w-20 px-2 py-2 text-center border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Title
                            </th>
                            <th className="w-28 px-2 py-2 text-center border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Raised On
                            </th>
                            <th className="w-20 px-3 py-2 text-center border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Status
                            </th>
                            <th className="w-12 px-3 py-2 text-center border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              View
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {loading ? (
                            <div className="absolute left-[1%] w-[100%] text-center flex justify-center items-center mt-14">
                              <div className="text-center text-xl text-blue-600">
                                Please wait while data is loading...
                              </div>
                            </div>
                          ) : displayedSections.length ? (
                            displayedSections.map((student, index) => (
                              <tr
                                key={student.adm_form_pk}
                                className="border border-gray-300"
                              >
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {index + 1}
                                </td>
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {student?.ticket_id || " "}
                                </td>
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {student?.first_name} {student?.mid_name}{" "}
                                  {student?.last_name}
                                </td>
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {student?.service_name}
                                </td>
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {student?.title}
                                </td>
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {student?.raised_on
                                    ? formatDate(student.raised_on)
                                    : " "}
                                </td>
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {student?.status || " "}
                                </td>
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  <button
                                    className="text-blue-600 hover:text-blue-800 hover:bg-transparent"
                                    onClick={() => handleView(student)}
                                  >
                                    <MdOutlineRemoveRedEye className="font-bold text-xl" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <div className="absolute left-[1%] w-[100%] text-center flex justify-center items-center mt-14">
                              <div className="text-center text-xl text-red-700">
                                Oops! No data found..
                              </div>
                            </div>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </>
            // )
          )}
        </div>
      </div>
    </>
  );
};

export default TicketList;
