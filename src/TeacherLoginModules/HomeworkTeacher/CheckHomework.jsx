import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1, RxPadding } from "react-icons/rx";

import LoaderStyle from "../../componants/common/LoaderFinal/LoaderStyle";
import { useLocation, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faUserSlash } from "@fortawesome/free-solid-svg-icons";

const CheckHomework = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [currentPage, setCurrentPage] = useState(0);

  const [loadingForSearch, setLoadingForSearch] = useState(false);

  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [timetable, setTimetable] = useState([]);

  const pageSize = 10;
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const { id } = useParams();
  console.log("id", id);

  const location = useLocation();
  const selectedHomework = location.state;
  console.log("selectedHomework", selectedHomework);

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async () => {
    setLoadingForSearch(true);
    setSearchTerm("");

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Authentication token missing.");

      const response = await axios.post(
        `${API_URL}/api/get_students_homework_viewed`,
        {
          class_id: selectedHomework.class_id,
          section_id: selectedHomework.section_id,
          homework_id: selectedHomework.homework_id,
          acd_yr: selectedHomework.acd_yr,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Homework Status Response:", response.data);

      if (
        !response?.data?.student_list ||
        response?.data?.student_list?.length === 0
      ) {
        toast.error("No student data found for this homework.");
        setTimetable([]);
      } else {
        setTimetable(response.data.student_list);
        setPageCount(Math.ceil(response.data.student_list.length / pageSize));
      }
    } catch (error) {
      console.error("Error fetching Homework Status:", error);
      toast.error("Error fetching Homework Status. Please try again.");
    } finally {
      setIsSubmitting(false);
      setLoadingForSearch(false);
    }
  };
  const camelCase = (str) =>
    str
      ?.toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  console.log("row", timetable);

  const filteredSections = timetable.filter((student) => {
    const searchLower = searchTerm.toLowerCase();

    const studentName =
      `${student?.first_name} ${student.mid_name} ${student.last_name}`
        ?.toLowerCase()
        .trim() || "";

    const rollNo = student?.roll_no ? String(student.roll_no) : "";

    return studentName.includes(searchLower) || rollNo.includes(searchLower);
  });

  const displayedSections = filteredSections.slice(currentPage * pageSize);

  return (
    <>
      <div className="w-full md:w-[80%] mx-auto p-4 ">
        <ToastContainer />
        <div className="card rounded-md">
          {loadingForSearch ? (
            <div className="flex justify-center items-center h-64">
              <LoaderStyle />
            </div>
          ) : (
            <>
              {timetable.length > 0 ? (
                <div className="w-full">
                  <div className="card mx-auto lg:w-full shadow-lg">
                    {/* Header */}
                    <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                      <div className="w-full flex flex-row justify-between">
                        <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
                          Viewed By
                        </h3>

                        <div className="flex items-center w-full">
                          <div
                            className="bg-blue-50 border-l-2 border-r-2 text-[1em] border-pink-500 rounded-md shadow-md mx-auto px-6 py-2"
                            style={{
                              overflowX: "auto",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <div
                              className="flex items-center gap-x-4 text-blue-800 font-medium"
                              style={{ flexWrap: "nowrap" }}
                            >
                              Homework - {selectedHomework.cls_name}{" "}
                              {selectedHomework.sec_name}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 w-full md:w-[25%]">
                          <input
                            type="text"
                            className="form-control w-full border border-gray-400 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#C03078]"
                            placeholder="Search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />

                          <RxCross1
                            className="text-3xl text-red-600 cursor-pointer hover:bg-red-100 rounded-full p-1"
                            onClick={() => navigate("/homework")}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div
                      className="relative w-[97%] mb-3 h-1 mx-auto bg-red-700"
                      style={{ backgroundColor: "#C03078" }}
                    ></div>

                    {/* Table */}
                    <div className="card-body w-full">
                      <div
                        className="h-[550px] lg:h-[550px] overflow-y-scroll overflow-x-scroll"
                        style={{
                          scrollbarWidth: "thin",
                          scrollbarColor: "#C03178 transparent",
                        }}
                      >
                        <table className="min-w-full leading-normal table-auto">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="w-12 px-2 py-2 text-center border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                Sr No.
                              </th>
                              <th className="w-12 px-3 py-2 text-center border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                Roll No.
                              </th>
                              <th className="w-40 px-3 py-2 text-center border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                Student Name
                              </th>
                              <th className="w-28 px-3 py-2 text-center border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                Viewed
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {displayedSections?.length > 0 ? (
                              displayedSections.map((student, index) => (
                                <tr
                                  key={student.adm_form_pk}
                                  className="border border-gray-300"
                                >
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {index + 1}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student?.roll_no || " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {camelCase(
                                      `${student?.first_name || ""} ${
                                        student?.mid_name || ""
                                      } ${student?.last_name || ""}`
                                    )}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student?.read_status === 0 ? (
                                      <FontAwesomeIcon
                                        icon={faUserSlash}
                                        className="text-red-600 text-xl"
                                        title="Not Viewed"
                                      />
                                    ) : (
                                      <FontAwesomeIcon
                                        icon={faUser}
                                        className="text-blue-600 text-xl"
                                        title="Viewed"
                                      />
                                    )}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan="4"
                                  className="text-center py-8 text-red-700 text-lg font-medium"
                                >
                                  Oops! No data found..
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // ✅ When timetable is empty
                <div className="flex justify-center items-center h-64">
                  <p className="text-xl text-red-700 font-medium">
                    Oops! No data found..
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CheckHomework;
