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

  const navigate = useNavigate();

  const [roleId, setRoleId] = useState(null);
  const [regId, setRegId] = useState(null);
  const [teacherCardsData, setTeachersCardsData] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  const [loadingTimetable, setLoadingTimetable] = useState(false);

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
        }
      );

      const teacherCards = response?.data?.data?.timetable;
      console.log("Teacher time table list.", teacherCards);
      setTeachersCardsData(teacherCards);
    } catch (error) {
      console.error("Failed to fetch session data:", error);
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

  const timetableData = async (t_id) => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      toast.error("Authentication token not found. Please login again");
      navigate("/");
      return;
    }

    try {
      setLoadingTimetable(true);

      const response = await axios.get(
        `${API_URL}/api/teachers/${regId}/dashboard/timetable/${t_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const teacherTimetable = response?.data?.data?.lessonPlanData;
      setSelectedTimetable(teacherTimetable);
      setOpenModal(true);
    } catch (error) {
      console.error("Failed to fetch timetable:", error);
      toast.error("Failed to load timetable");
    } finally {
      setLoadingTimetable(false);
    }
  };

  return (
    // <div
    //   className="bg-white rounded-lg shadow flex flex-col
    //             h-auto sm:h-[260px] md:h-[300px] lg:h-[340px] xl:h-[380px]"
    // >
    //   <div className="bg-gray-200 px-3 py-2 rounded-t-lg flex-shrink-0">
    //     <span className="text-xs sm:text-sm lg:text-lg font-semibold text-gray-600">
    //       Timetable
    //     </span>
    //   </div>

    //   <div className="flex-1 p-2 overflow-y-auto">
    //     {teacherCardsData?.length > 0 ? (
    //       <div className="space-y-1">
    //         {teacherCardsData.map((item, index) => (
    //           <div
    //             key={index}
    //             onClick={() => timetableData(item.t_id)}
    //             className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-200"
    //           >
    //             <div className="flex items-center w-full">
    //               <div
    //                 className={`bg-gradient-to-br ${
    //                   colors[index % colors.length]
    //                 } text-white flex flex-col items-center justify-center px-1 py-2 min-w-[70px]`}
    //               >
    //                 <span className="text-xs font-bold opacity-90">
    //                   Period{" "}
    //                   <span className="text-sm font-bold">
    //                     {item.period_no}
    //                   </span>
    //                 </span>
    //               </div>

    //               <div className="grid grid-cols-[auto_1fr_auto] items-center w-full p-2 gap-4">
    //                 <span className="flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold whitespace-nowrap">
    //                   {item.class}-{item.section}
    //                 </span>

    //                 <h3 className="text-base font-medium text-gray-800 flex items-center justify-center gap-2 truncate">
    //                   <FaBook className="w-4 h-4 text-purple-600 shrink-0" />
    //                   <span className="truncate ">{item.subject}</span>
    //                 </h3>

    //                 <span className="flex items-center gap-1.5 px-3 py-0 bg-pink-100 text-pink-700 rounded-full font-normal whitespace-nowrap">
    //                   <FiClock className="w-4 h-4" />
    //                   {/* {item.time_in} - {item.time_out} */}
    //                   8.00 AM - 9.00 AM
    //                 </span>
    //               </div>
    //             </div>
    //           </div>
    //         ))}
    //       </div>
    //     ) : (
    //       <div className="flex flex-1 items-center justify-center text-center h-full min-h-[200px]">
    //         <div>
    //           <p className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 mb-2">
    //             No Classes 🎊
    //           </p>
    //           <p className="text-sm text-gray-500">
    //             Take a well-deserved break!
    //           </p>
    //         </div>
    //       </div>
    //     )}
    //   </div>

    //   {openModal && (
    //     <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
    //       <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl transform scale-100 transition-all duration-300">
    //         <div className="bg-gradient-to-r  from-purple-600 to-pink-600 p-1 rounded-t-xl">
    //           <div className="flex items-center justify-between">
    //             <div className="flex items-center space-x-3">
    //               <FaClipboardCheck className="w-5 h-5 text-base text-white" />
    //               <h2 className="text-lg font-bold text-white">
    //                 Period Details
    //               </h2>
    //             </div>
    //             <button
    //               onClick={() => setOpenModal(false)}
    //               className="bg-white/20 hover:bg-white/30 px-2 py-1 rounded-full transition-colors duration-300"
    //             >
    //               <i className="fas fa-times text-white"></i>
    //             </button>
    //           </div>
    //         </div>

    //         {/* {loadingTimetable ? (
    //           <p className="text-center text-gray-500">Loading...</p>
    //         ) : (
    //           selectedTimetable && (
    //             <div className="space-y-4 max-h-[60vh] overflow-y-auto">
    //               {Object.entries(selectedTimetable).map(
    //                 ([chapterName, lessons], chapterIndex) => (
    //                   <div
    //                     key={chapterIndex}
    //                     className="bg-gray-50 border rounded-lg p-1"
    //                   >
    //                     <h2 className="text-lg font-bold text-purple-700 mb-3">
    //                       📘 {chapterName}
    //                     </h2>

    //                     <div className="space-y-3">
    //                       {lessons.map((lesson, index) => (
    //                         <div
    //                           key={index}
    //                           className="bg-white border rounded-md p-3 shadow-sm"
    //                         >
    //                           <p className="font-semibold text-gray-800">
    //                             {lesson.heading_name}
    //                           </p>

    //                           <p className="text-sm text-gray-600 whitespace-pre-line mt-1">
    //                             {lesson.description}
    //                           </p>
    //                         </div>
    //                       ))}
    //                     </div>
    //                   </div>
    //                 )
    //               )}
    //             </div>
    //           )
    //         )} */}

    //         <div className="flex-1 overflow-y-auto  h-96 p-6 bg-gradient-to-br from-gray-50 to-purple-50">
    //           {loadingTimetable ? (
    //             <div className="flex items-center justify-center h-64">
    //               <div className="text-center">
    //                 <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
    //                 <p className="text-gray-600 font-medium">
    //                   Loading content...
    //                 </p>
    //               </div>
    //             </div>
    //           ) : (
    //             selectedTimetable && (
    //               <div className="space-y-2">
    //                 {Object.entries(selectedTimetable).map(
    //                   ([chapterName, lessons], chapterIndex) => (
    //                     <div
    //                       key={chapterIndex}
    //                       className="bg-white rounded-2xl shadow-lg overflow-hidden border border-purple-100 hover:shadow-xl transition-all duration-300"
    //                     >
    //                       {/* Chapter Header */}
    //                       <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-2 border-b border-purple-200">
    //                         <div className="flex items-center gap-3">
    //                           <div className="w-5 h-5 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
    //                             {chapterIndex + 1}
    //                           </div>
    //                           <div className="flex-1">
    //                             <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
    //                               <FaBookOpen className="w-5 h-5 text-purple-600" />
    //                               {chapterName}
    //                             </h3>
    //                             {/* <p className="text-sm text-gray-600 mt-0.5">
    //                               {lessons.length} lessons
    //                             </p> */}
    //                           </div>
    //                         </div>
    //                       </div>

    //                       {/* Lessons */}
    //                       <div className="p-2 space-y-1">
    //                         {lessons.map((lesson, index) => (
    //                           <div
    //                             key={index}
    //                             className="group bg-gradient-to-br from-white to-purple-50 rounded-xl p-1 border-2 border-transparent hover:border-purple-300 transition-all duration-300 shadow-sm hover:shadow-md"
    //                           >
    //                             <div className="flex items-start gap-1">
    //                               {/* <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 transition-colors">
    //                                 <FaTextWidth className="w-4 h-4 text-purple-600" />
    //                               </div> */}
    //                               <div className="flex-1 min-w-0">
    //                                 <h4 className="font-medium text-blue-800 mb-2 text-base">
    //                                   {lesson.heading_name}
    //                                 </h4>
    //                                 <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
    //                                   {lesson.description}
    //                                 </p>
    //                               </div>
    //                             </div>
    //                           </div>
    //                         ))}
    //                       </div>
    //                     </div>
    //                   )
    //                 )}
    //               </div>
    //             )
    //           )}
    //         </div>

    //         <div className="bg-gray-50 p-2 rounded-b-2xl flex justify-end">
    //           <button
    //             onClick={() => setOpenModal(false)}
    //             className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors duration-300 flex items-center space-x-2"
    //           >
    //             <span>Close</span>
    //           </button>
    //         </div>
    //       </div>
    //     </div>
    //   )}
    // </div>

    // <div
    //   //  bg-white rounded-lg shadow flex flex-col
    //   className="
    //   min-h-[220px]
    //   sm:min-h-[260px]
    //   md:min-h-[310px]
    // "
    // >
    //   <div className="bg-gray-200 px-3 py-2 rounded-t-lg flex-shrink-0">
    //     <span className="text-xs sm:text-sm lg:text-lg font-semibold text-gray-600">
    //       Timetable
    //     </span>
    //   </div>

    //   <div className="flex-1 p-2 overflow-y-auto">
    //     {teacherCardsData?.length > 0 ? (
    //       <div className="space-y-1">
    //         {teacherCardsData.map((item, index) => (
    //           <div
    //             key={index}
    //             onClick={() => timetableData(item.t_id)}
    //             className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200"
    //           >
    //             <div className="flex items-center w-full">
    //               <div
    //                 className={`bg-gradient-to-br ${
    //                   colors[index % colors.length]
    //                 } text-white flex flex-col items-center justify-center px-1 py-2 min-w-[70px]`}
    //               >
    //                 <span className="text-xs font-bold">
    //                   Period <span className="text-sm">{item.period_no}</span>
    //                 </span>
    //               </div>

    //               <div className="w-full p-2">
    //                 <div className="flex flex-col gap-2 sm:grid sm:grid-cols-[auto_1fr_auto] sm:items-center">
    //                   <span className="px-4 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold w-fit sm:ml-24">
    //                     {item.class}-{item.section}
    //                   </span>

    //                   <h3
    //                     className="flex items-center gap-2 min-w-0
    //                text-sm sm:text-base font-medium text-gray-800
    //                sm:justify-center"
    //                   >
    //                     <FaBook className="w-4 h-4 text-purple-600 shrink-0" />
    //                     <span className="truncate">{item.subject}</span>
    //                   </h3>

    //                   <span
    //                     className="flex items-center gap-1 px-4 py-1 bg-pink-100 text-pink-700 rounded-full
    //                  text-xs sm:text-sm w-fit sm:mr-2"
    //                   >
    //                     <FiClock className="w-4 h-4" />
    //                     8.00 AM - 9.00 AM
    //                   </span>
    //                 </div>
    //               </div>
    //             </div>
    //           </div>
    //         ))}
    //       </div>
    //     ) : (
    //       <div className="flex items-center justify-center h-full text-center">
    //         <div>
    //           <p className="text-xl font-bold text-purple-600">No Classes 🎊</p>
    //           <p className="text-sm text-gray-500">
    //             Take a well-deserved break!
    //           </p>
    //         </div>
    //       </div>
    //     )}
    //   </div>
    // </div>

    <div className=" flex flex-col h-[360px]">
      {/* Header */}
      {/* <div className="bg-gray-200 px-3 py-2 rounded-t-lg flex-shrink-0">
        <span className="text-sm font-semibold text-gray-600">Timetable</span>
      </div> */}

      <div className="bg-gray-200 px-3 py-2 rounded-t-lg flex-shrink-0">
        <span className="text-xs sm:text-sm lg:text-lg font-semibold text-gray-600">
          Timetable
        </span>
      </div>
      {/* Scrollable Body */}
      <div className="flex-1 p-2 overflow-y-auto overflow-x-hidden">
        {teacherCardsData?.length > 0 ? (
          <div className="space-y-1">
            {teacherCardsData.map((item, index) => (
              <div
                key={index}
                onClick={() => timetableData(item.t_id)}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200"
              >
                <div className="flex items-center w-full">
                  <div
                    className={`bg-gradient-to-br ${
                      colors[index % colors.length]
                    } text-white flex flex-col items-center justify-center px-1 py-2 min-w-[70px]`}
                  >
                    <span className="text-xs font-bold">
                      Period <span className="text-sm">{item.period_no}</span>
                    </span>
                  </div>

                  <div className="w-full p-2">
                    <div className="flex flex-col gap-2 sm:grid sm:grid-cols-[auto_1fr_auto] sm:items-center">
                      <span className="px-4 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold w-fit sm:ml-24">
                        {item.class}-{item.section}
                      </span>

                      <h3 className="flex items-center gap-2 min-w-0 text-sm sm:text-base font-medium text-gray-800 sm:justify-center">
                        <FaBook className="w-4 h-4 text-purple-600 shrink-0" />
                        <span className="truncate">{item.subject}</span>
                      </h3>

                      <span className="flex items-center gap-1 px-4 py-1 bg-pink-100 text-pink-700 rounded-full text-xs sm:text-sm w-fit sm:mr-2">
                        <FiClock className="w-4 h-4" />
                        8.00 AM - 9.00 AM
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <p className="text-xl font-bold text-purple-600">No Classes 🎊</p>
              <p className="text-sm text-gray-500">
                Take a well-deserved break!
              </p>
            </div>
          </div>
        )}
      </div>
      {openModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl transform scale-100 transition-all duration-300">
            <div className="bg-gradient-to-r  from-purple-600 to-pink-600 p-1 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FaClipboardCheck className="w-5 h-5 text-base text-white" />
                  <h2 className="text-lg font-bold text-white">
                    Period Details
                  </h2>
                </div>
                <button
                  onClick={() => setOpenModal(false)}
                  className="bg-white/20 hover:bg-white/30 px-2 py-1 rounded-full transition-colors duration-300"
                >
                  <i className="fas fa-times text-white"></i>
                </button>
              </div>
            </div>

            {/* {loadingTimetable ? (
              <p className="text-center text-gray-500">Loading...</p>
            ) : (
              selectedTimetable && (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                  {Object.entries(selectedTimetable).map(
                    ([chapterName, lessons], chapterIndex) => (
                      <div
                        key={chapterIndex}
                        className="bg-gray-50 border rounded-lg p-1"
                      >
                        <h2 className="text-lg font-bold text-purple-700 mb-3">
                          📘 {chapterName}
                        </h2>

                        <div className="space-y-3">
                          {lessons.map((lesson, index) => (
                            <div
                              key={index}
                              className="bg-white border rounded-md p-3 shadow-sm"
                            >
                              <p className="font-semibold text-gray-800">
                                {lesson.heading_name}
                              </p>

                              <p className="text-sm text-gray-600 whitespace-pre-line mt-1">
                                {lesson.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )
            )} */}

            <div className="flex-1 overflow-y-auto  h-96 p-6 bg-gradient-to-br from-gray-50 to-purple-50">
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
                          {/* Chapter Header */}
                          <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-2 border-b border-purple-200">
                            <div className="flex items-center gap-3">
                              <div className="w-5 h-5 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {chapterIndex + 1}
                              </div>
                              <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                  <FaBookOpen className="w-5 h-5 text-purple-600" />
                                  {chapterName}
                                </h3>
                                {/* <p className="text-sm text-gray-600 mt-0.5">
                                  {lessons.length} lessons
                                </p> */}
                              </div>
                            </div>
                          </div>

                          {/* Lessons */}
                          <div className="p-2 space-y-1">
                            {lessons.map((lesson, index) => (
                              <div
                                key={index}
                                className="group bg-gradient-to-br from-white to-purple-50 rounded-xl p-1 border-2 border-transparent hover:border-purple-300 transition-all duration-300 shadow-sm hover:shadow-md"
                              >
                                <div className="flex items-start gap-1">
                                  {/* <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 transition-colors">
                                    <FaTextWidth className="w-4 h-4 text-purple-600" />
                                  </div> */}
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

{
  /* <h3 className="text-sm md:text-base font-medium text-gray-800 truncate flex items-center gap-2">
                      <FaBook className="w-4 h-4 text-purple-600 shrink-0" />
                      {item.subject}
                    </h3> */
}
