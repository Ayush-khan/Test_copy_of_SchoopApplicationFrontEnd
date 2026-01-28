import React, { useState, useEffect } from "react";
import axios from "axios";
import Loader from "../common/LoaderFinal/DashboardLoadder/Loader";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";

import { FiClock } from "react-icons/fi";
import {
  FaCalendar,
  FaClipboardCheck,
  FaUser,
  FaBook,
  FaBookOpen,
  FaTextWidth,
} from "react-icons/fa6";

const TimeTableForTeacherDashbord = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const today = new Date().toISOString().split("T")[0];

  const navigate = useNavigate();

  const [roleId, setRoleId] = useState(null);
  const [regId, setRegId] = useState(null);
  const [teacherCardsData, setTeachersCardsData] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedTimetable, setSelectedTimetable] = useState({});
  const [loadingTimetable, setLoadingTimetable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState({
    className: "",
    subject: "",
  });
  const [weekdate, setWeekdate] = useState("");

  useEffect(() => {
    fetchRoleId();
  }, []);

  useEffect(() => {
    if (!roleId) return;

    fetchTeachersCardData();
  }, [roleId]);

  const fetchRoleId = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      toast.error("Authentication token not found Please login again");
      navigate("/");
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/api/sessionData`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const roleId = response?.data?.user?.role_id;
      console.log("role id", response?.data?.user?.role_id);

      const regId = response?.data?.user?.reg_id;
      console.log("reg id", response?.data?.user?.reg_id);
      setRegId(regId);

      if (roleId) {
        setRoleId(roleId);
      } else {
        console.warn("role_id not found in sessionData response");
      }
    } catch (error) {
      console.error("Failed to fetch session data:", error);
    }
  };

  const fetchTeachersCardData = async () => {
    setLoading(true);
    const token = localStorage.getItem("authToken");

    if (!token) {
      toast.error("Authentication token not found Please login again");
      navigate("/");
      return;
    }

    try {
      const response = await axios.get(
        `${API_URL}/api/teachers/${regId}/dashboard/timetable`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const teacherCards = response?.data?.data?.timetable;
      console.log("Teacher time table list.", teacherCards);
      setTeachersCardsData(teacherCards);
    } catch (error) {
      console.error("Failed to fetch session data:", error);
    } finally {
      setLoading(false);
    }
  };

  const colors = [
    "from-red-500 to-orange-500",
    "from-blue-500 to-cyan-500",
    "from-green-500 to-emerald-500",
    "from-purple-500 to-pink-500",
    "from-yellow-500 to-amber-500",
    "from-indigo-500 to-purple-500",
  ];
  useEffect(() => {
    if (!selectedTimetable) return;

    const firstGroup = Object.values(selectedTimetable)[0];
    const firstItem = firstGroup?.[0];

    if (firstItem?.week_date) {
      setWeekdate(firstItem.week_date);
    }
  }, [selectedTimetable]);

  // const timetableData = async (t_id) => {
  //   const token = localStorage.getItem("authToken");

  //   if (!token) {
  //     toast.error("Authentication token not found. Please login again");
  //     navigate("/");
  //     return;
  //   }

  //   try {
  //     setLoadingTimetable(true);

  //     const response = await axios.get(
  //       `${API_URL}/api/teachers/${regId}/dashboard/timetable/${t_id}`,
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       }
  //     );

  //     const teacherTimetable = response?.data?.data?.lessonPlanData;
  //     setSelectedTimetable(teacherTimetable);
  //     setOpenModal(true);
  //   } catch (error) {
  //     console.error("Failed to fetch timetable:", error);

  //     const status = error?.response?.status;
  //     const message = error?.response?.data?.message;

  //     if (
  //       status === 404 &&
  //       message === "Lesson Plan is not created for the current week."
  //     ) {
  //       toast.warning(message); // or toast.info(message)
  //     } else {
  //       toast.error("Failed to load timetable");
  //     }
  //   } finally {
  //     setLoadingTimetable(false);
  //   }
  // };

  const timetableData = async (t_id, className, subject) => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      toast.error("Authentication token not found. Please login again");
      navigate("/");
      return;
    }

    try {
      setLoadingTimetable(true);

      // ✅ store selected row info
      setSelectedInfo({
        className,
        subject,
      });

      const response = await axios.get(
        `${API_URL}/api/teachers/${regId}/dashboard/timetable/${t_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const teacherTimetable = response?.data?.data?.lessonPlanData;
      setSelectedTimetable(teacherTimetable);
      const weekDate = Object.values(selectedTimetable || {})?.[0]?.[0]
        ?.week_date;
      console.log("week date", weekDate);
      setWeekdate(weekDate);
      setOpenModal(true);
    } catch (error) {
      console.error("Failed to fetch timetable:", error);

      const status = error?.response?.status;
      const message = error?.response?.data?.message;

      if (
        status === 404 &&
        message === "Lesson Plan is not created for the current week."
      ) {
        toast.warning(message);
      } else {
        toast.error("Failed to load timetable");
      }
    } finally {
      setLoadingTimetable(false);
    }
  };

  return (
    <div className=" flex flex-col h-[360px]">
      <div className="bg-gray-200 px-3 py-2 rounded-t-lg flex-shrink-0">
        <span className="text-xs sm:text-sm lg:text-lg font-semibold text-gray-600">
          Today's Timetable
        </span>
      </div>

      <div className="flex-1 p-2 overflow-y-auto overflow-x-hidden">
        {loading ? (
          /* 🔹 Loading State */
          <div className="flex items-center justify-center h-full text-center">
            <p className="text-lg font-semibold text-blue-600 animate-pulse">
              Please wait, while timetable is loading...
            </p>
          </div>
        ) : teacherCardsData?.length > 0 ? (
          <div className="space-y-1">
            {teacherCardsData.map((item, index) => (
              <div
                key={index}
                // onClick={() => timetableData(item.t_id)}
                onClick={() =>
                  timetableData(
                    item.t_id,
                    `${item.class}-${item.section}`,
                    item.subject,
                  )
                }
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200"
              >
                <div className="flex items-center w-full">
                  <div
                    className={`bg-gradient-to-br ${colors[index % colors.length]
                      } text-white flex flex-col items-center justify-center px-1 py-2 min-w-[120px]`}
                  >
                    <span className="text-sm font-bold">
                      Period <span className="text-sm">{item.period_no}</span>
                    </span>
                  </div>

                  <div className="w-full p-2">
                    <div className="flex flex-col gap-2 sm:grid sm:grid-cols-[auto_1fr_auto] sm:items-center">
                      <span className="px-9 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold w-fit sm:ml-52">
                        {item.class}-{item.section}
                      </span>

                      <h3 className="flex items-center gap-2 min-w-0 text-sm sm:text-base font-medium text-gray-800 sm:justify-end mr-4">
                        <FaBook className="w-4 h-4 text-purple-600 shrink-0" />
                        <span className="truncate">{item.subject}</span>
                      </h3>

                      {/* <span className="flex items-center gap-1 px-4 py-1 bg-pink-100 text-pink-700 rounded-full text-xs sm:text-sm w-fit sm:mr-2">
                        <FiClock className="w-4 h-4" />
                        <span className="truncate">
                          {item.item_in} - {item.item_out}
                        </span>
                      </span> */}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              {/* <p className="text-xl font-bold bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
                No Timetable for today..
              </p> */}
              <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
                No Timetable for Today.
              </p>
              {/* <p className="text-sm text-gray-500">
                Take a well-deserved break!
              </p> */}
            </div>
          </div>
        )}
      </div>
      {openModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl transform scale-100 transition-all duration-300">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-1 rounded-t-xl">
              <div className="flex items-center justify-between">
                {/* Left side */}
                <div className="flex items-center gap-3 flex-wrap">
                  <FaClipboardCheck className="w-8 h-8 text-white shrink-0" />

                  <h2 className="text-lg font-bold text-white mt-1">
                    Lesson Plan Detail
                  </h2>

                  <span className="text-purple-200 font-semibold">|</span>

                  <span className="text-sm text-purple-100 font-semibold">
                    {selectedInfo.className}
                  </span>

                  <span className="text-purple-300">•</span>

                  <span className="text-sm text-purple-100">
                    {selectedInfo.subject}
                  </span>
                  <span className="text-purple-200 font-semibold">|</span>
                  <span className="text-sm text-purple-100">{weekdate}</span>
                </div>

                {/* Close button */}
                <button
                  onClick={() => setOpenModal(false)}
                  className="bg-white/20 hover:bg-white/30 px-2 py-1 rounded-full transition-colors duration-300"
                >
                  <i className="fas fa-times text-white"></i>
                </button>
              </div>
            </div>

            {/* <div className="flex-1 overflow-y-auto  h-96 p-1 bg-gradient-to-br from-gray-50 to-purple-50">
              {loadingTimetable ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">
                      Loading content...
                    </p>
                  </div>
                </div>
              ) : (
                selectedTimetable && (
                  <div className="space-y-2">
                    {Object.entries(selectedTimetable).map(
                      ([chapterName, lessons], chapterIndex) => (
                        <div
                          key={chapterIndex}
                          className="bg-white rounded-2xl shadow-lg overflow-hidden border border-purple-100 hover:shadow-xl transition-all duration-300"
                        >
                          <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-2 border-b border-purple-200">
                            <div className="flex items-center gap-3">
                              {lessons?.[chapterIndex] && (
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-bold text-purple-700">
                                    Chapter No:{" "}
                                    {lessons[chapterIndex].chapter_no}
                                  </span>
                                </div>
                              )}

                              <div className="flex-1">
                                <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 mt-1">
                                  {chapterName}
                                </h3>
                              </div>
                            </div>
                          </div>

                          <div className="p-2 space-y-1">
                            {lessons.map((lesson, index) => (
                              <div
                                key={index}
                                className="group bg-gradient-to-br from-white to-purple-50 rounded-xl p-1 border-2 border-transparent hover:border-purple-300 transition-all duration-300 shadow-sm hover:shadow-md"
                              >
                                <div className="flex items-start gap-1">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-blue-800 mb-2 text-base">
                                      {lesson.heading_name}
                                    </h4>
                                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                                      {lesson.description}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )
              )}
            </div> */}

            <div className="flex-1 overflow-y-auto h-96 p-1 bg-gradient-to-br from-gray-50 to-purple-50">
              {loadingTimetable ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">
                      Loading content...
                    </p>
                  </div>
                </div>
              ) : (
                selectedTimetable && (
                  <div className="space-y-4">
                    {Object.entries(selectedTimetable).map(
                      ([chapterName, lessons], chapterIndex) => {
                        // Separate normal and daily change lessons
                        const normalLessons = lessons.filter(
                          (l) => l.change_daily === "",
                        );
                        const dailyChangeLessons = lessons.filter(
                          (l) => l.change_daily === "Y",
                        );

                        // Function to group by heading
                        const groupByHeading = (arr) => {
                          return arr.reduce((acc, lesson) => {
                            if (!acc[lesson.heading_name])
                              acc[lesson.heading_name] = [];
                            acc[lesson.heading_name].push(lesson);
                            return acc;
                          }, {});
                        };

                        const dailyGrouped = groupByHeading(dailyChangeLessons);

                        // Helper to format date
                        const formatDate = (dateStr) => {
                          if (!dateStr) return "";
                          const date = new Date(dateStr);
                          return date.toLocaleDateString("en-GB"); // DD-MM-YYYY
                        };

                        return (
                          <div key={chapterIndex} className="space-y-2">
                            {/* Normal Lessons */}
                            {normalLessons.length > 0 && (
                              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-purple-100 hover:shadow-xl transition-all duration-300">
                                {/* <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-2 border-b border-purple-200">
                                  <h3 className="text-base font-bold text-gray-800">
                                    {chapterName} - Teaching Points
                                  </h3>
                                </div> */}
                                <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-2 border-b border-purple-200">
                                  <div className="flex items-center gap-3">
                                    {lessons?.[chapterIndex] && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold text-purple-700">
                                          Chapter No:{" "}
                                          {lessons[chapterIndex].chapter_no}
                                        </span>
                                      </div>
                                    )}

                                    <div className="flex-1">
                                      <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 mt-1">
                                        {chapterName}
                                      </h3>
                                    </div>
                                  </div>
                                </div>
                                <div className="p-2 space-y-1">
                                  {normalLessons.map((lesson, idx) => (
                                    <div
                                      key={idx}
                                      className="group bg-gradient-to-br from-white to-purple-50 rounded-xl p-1 border-2 border-transparent hover:border-purple-300 transition-all duration-300 shadow-sm hover:shadow-md"
                                    >
                                      <div className="flex items-start gap-1">
                                        <div className="flex-1 min-w-0">
                                          <h4 className="font-medium text-blue-800 mb-2 text-base">
                                            {lesson.heading_name}
                                          </h4>
                                          <p className="text-sm text-gray-600  font-medium leading-relaxed whitespace-pre-line">
                                            {lesson.description}
                                          </p>
                                          {/* <p
                                            className={`text-xs mt-1 ${
                                              lesson.start_date ===
                                              new Date()
                                                .toISOString()
                                                .split("T")[0]
                                                ? "text-red-600 font-semibold"
                                                : ""
                                            }`}
                                          >
                                            {formatDate(lesson.start_date)}
                                          </p> */}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Daily Change Lessons */}
                            {dailyChangeLessons.length > 0 && (
                              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-purple-100 hover:shadow-xl transition-all duration-300">
                                {/* <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-2 border-b border-purple-200">
                                  <h3 className="text-base font-bold text-gray-800">
                                    {chapterName} - Daily Change
                                  </h3>
                                </div> */}
                                {/* <div className="p-2 space-y-1">
                                  {Object.entries(dailyGrouped).map(
                                    ([heading, items], idx) => (
                                      <div key={idx} className="space-y-1">
                                        <h4 className="font-medium text-blue-800 mb-1 text-base">
                                          {heading}
                                        </h4>
                                        {items.map((lesson, i) => (
                                          <p
                                            key={i}
                                            className={`text-sm text-gray-600 ${
                                              lesson.start_date ===
                                              new Date()
                                                .toISOString()
                                                .split("T")[0]
                                                ? "text-red-600 font-semibold"
                                                : ""
                                            }`}
                                          >
                                            {lesson.heading_name} &nbsp;&nbsp;{" "}
                                            {formatDate(lesson.start_date)}
                                          </p>
                                        ))}
                                      </div>
                                    )
                                  )}
                                </div> */}
                                <div className="p-2 space-y-1">
                                  {/* {Object.entries(dailyGrouped).map(
                                    ([heading, items], idx) => (
                                      <div key={idx} className="space-y-1">
                                        <div className="group bg-gradient-to-br from-white to-purple-50 rounded-xl p-2 border-2 border-transparent hover:border-purple-300 transition-all duration-300 shadow-sm hover:shadow-md">
                                          <h4 className="font-medium text-blue-800 mb-2 text-base">
                                            {heading}
                                          </h4>

                                          {items.map((lesson, i) => {
                                            const isToday =
                                              lesson.start_date ===
                                              new Date()
                                                .toISOString()
                                                .split("T")[0];

                                            return (
                                              <div
                                                key={i}
                                                className={` flex justify-between items-center               
                                                  ${
                                                    isToday
                                                      ? "bg-gradient-to-br from-white to-purple-50 hover:border-purple-300" // Slightly different background for today
                                                      : "bg-gradient-to-br from-white to-purple-50 hover:border-purple-300"
                                                  }
                                                `}
                                              >
                                                <h5
                                                  className={`text-sm truncate ${
                                                    isToday
                                                      ? "text-red-600 font-semibold"
                                                      : "text-sm text-gray-600"
                                                  }`}
                                                >
                                                  {lesson.description}
                                                </h5>

                                                <p
                                                  className={`text-sm whitespace-nowrap ${
                                                    isToday
                                                      ? "text-red-600 font-semibold"
                                                      : "text-sm text-gray-600"
                                                  }`}
                                                >
                                                  {formatDate(
                                                    lesson.start_date
                                                  )}
                                                </p>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )
                                  )} */}

                                  {Object.entries(dailyGrouped).map(
                                    ([heading, items], idx) => (
                                      <div key={idx} className="space-y-1">
                                        <div className="group bg-gradient-to-br from-white to-purple-50 rounded-xl p-2 border-2 border-transparent hover:border-purple-300 transition-all duration-300 shadow-sm hover:shadow-md">
                                          <h4 className="font-medium text-blue-800 mb-1 text-base">
                                            {heading}
                                          </h4>

                                          {/* {items.map((lesson, i) => {
                                            const isToday =
                                              lesson.start_date ===
                                              new Date()
                                                .toISOString()
                                                .split("T")[0];

                                            return (
                                              <div
                                                key={i}
                                                className={`flex justify-between items-center px-1 py-0 rounded-md ${
                                                  isToday ? "bg-green-50" : ""
                                                }`}
                                              >
                                                
                                                <p
                                                  className={`text-sm leading-tight whitespace-nowrap ml-2 ${
                                                    isToday
                                                      ? "text-green-700 font-semibold"
                                                      : "text-gray-600"
                                                  }`}
                                                >
                                                  {formatDate(
                                                    lesson.start_date
                                                  )}
                                                </p>
                                              
                                                <h5
                                                  className={`text-sm leading-tight truncate ${
                                                    isToday
                                                      ? "text-green-700 font-semibold"
                                                      : "text-gray-600"
                                                  }`}
                                                >
                                                  {lesson.description}
                                                </h5>
                                              </div>
                                            );
                                          })} */}
                                          {items.map((lesson, i) => {
                                            const isToday =
                                              lesson.start_date ===
                                              new Date()
                                                .toISOString()
                                                .split("T")[0];

                                            return (
                                              <div
                                                key={i}
                                                className={`flex items-center px-1 py-0 rounded-md ${isToday ? "bg-green-50" : ""
                                                  }`}
                                              >
                                                {/* Date (fixed width, left aligned) */}
                                                <p
                                                  className={`text-sm leading-tight whitespace-nowrap w-28 mt-1 ${isToday
                                                      ? "text-green-700 font-semibold"
                                                      : "text-gray-600"
                                                    }`}
                                                >
                                                  {formatDate(
                                                    lesson.start_date,
                                                  )}
                                                </p>

                                                {/* Description (starts from same line every row) */}
                                                <h5
                                                  className={`text-sm leading-tight truncate ${isToday
                                                      ? "text-green-700 font-semibold"
                                                      : "text-gray-600"
                                                    }`}
                                                >
                                                  {lesson.description}
                                                </h5>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      },
                    )}
                  </div>
                )
              )}
            </div>

            <div className="bg-gray-50 p-2 rounded-b-2xl flex justify-end">
              <button
                onClick={() => setOpenModal(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors duration-300 flex items-center space-x-2"
              >
                <span>Close</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeTableForTeacherDashbord;
