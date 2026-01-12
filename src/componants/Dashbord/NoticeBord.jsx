// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import Styles from "../../CSS/DashbordCss/NoticeBord.module.css";

// function NoticeBord() {
//   const API_URL = import.meta.env.VITE_API_URL; // url for host
//   const [activeTab, setActiveTab] = useState("noticeForParents");
//   const [parentNotices, setParentNotices] = useState([]);
//   const [staffNotices, setStaffNotices] = useState([]);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchNotices = async () => {
//       try {
//         const token = localStorage.getItem("authToken");
//         const academicYr = localStorage.getItem("academicYear");
//         if (!token) {
//           throw new Error("No authentication token  found");
//         }

//         // Fetch parent notices
//         const parentResponse = await axios.get(
//           `${API_URL}/api/parent-notices`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "X-Academic-Year": academicYr,
//             },
//           }
//         );
//         setParentNotices(parentResponse.data.parent_notices);

//         // Fetch staff notices
//         const staffResponse = await axios.get(`${API_URL}/api/staff-notices`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "X-Academic-Year": "2023-2024",
//           },
//         });
//         setStaffNotices(staffResponse.data.notices);
//       } catch (error) {
//         setError(error.message);
//         console.error("Error fetching notices:", error);
//       }
//     };

//     fetchNotices();
//   }, []);

//   const handleTabChange = (tab) => {
//     setActiveTab(tab);
//   };

//   return (
//     <div
//       className={`${Styles.container} bg-slate-100 px-2 rounded-lg shadow-md `}
//     >
//       <div
//         className={` flex justify-between sm:mb-2  w-full  sm:flex flex-row mb-2`}
//       >
//         <button
//           // style={{ width: "100%", height: "3em", fontSize: ".8em" }}
//           className={`${Styles.tab} w-full h-1/4 text-sm font-bold  ${
//             activeTab === "noticeForParents" ? Styles.active : ""
//           } sm:mr-1 mx-0 sm:mb-0  p-2  text-sm sm:w-1/2`}
//           onClick={() => handleTabChange("noticeForParents")}
//         >
//           Notice for Parents
//         </button>
//         <button
//           // style={{ width: "100%", height: "3em", fontSize: ".8em" }}
//           className={`${Styles.tab} w-full h-1/4 text-sm font-bold  ${
//             activeTab === "noticeForStaff" ? Styles.active : ""
//           } sm:mr-1 mx-0 sm:mb-0  p-2 text-sm sm:w-1/2`}
//           onClick={() => handleTabChange("noticeForStaff")}
//         >
//           Notice for Staff
//         </button>
//       </div>

//       <div className="overflow-y-auto max-h-64">
//         {/* For Parent Notices */}
//         {activeTab === "noticeForParents" && parentNotices.length === 0 && (
//           <div className="relative left-[1%] w-[95%] text-center flex justify-center items-center mt-8 md:mt-14">
//             <div className="flex flex-col items-center justify-center text-center ">
//               <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-400 to-pink-500 drop-shadow-md mb-3">
//                 Oops!{" "}
//               </p>

//               <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
//                 No data available.
//               </p>
//             </div>
//           </div>
//         )}
//         {activeTab === "noticeForParents" && parentNotices.length > 0 && (
//           <div
//             className={`${Styles.noticeBoard} grid gap-2 border-4 box-border `}
//           >
//             {parentNotices.map((notice, index) => (
//               <div
//                 key={index}
//                 className={`w-full md:w-[100%] border border-gray-300 sm:px-3 sm:py-2 bg-white rounded shadow-md overflow-hidden`}
//               >
//                 {/* Date and Type */}
//                 <div className="text-xs mb-1 flex justify-between items-center text-gray-700">
//                   <span>{notice.notice_date}</span>
//                   <span className="font-bold text-blue-600">
//                     {notice.notice_type}
//                   </span>
//                 </div>

//                 {/* Subject and Classes */}
//                 <div className="text-sm mb-1 text-gray-800">
//                   <div
//                     // className="font-medium"
//                     className={`${Styles.author} text-sm `}
//                   >
//                     {notice.subject}
//                   </div>
//                   <div
//                     className={` text-xs sm:mb-1 font-bold mt-1 overflow-x-auto whitespace-wrap max-w-full text-blue-600`}
//                     style={{
//                       wordBreak: "break-word",
//                       overflowWrap: "break-word", // better wrap support
//                       whiteSpace: "normal", // allow wrapping instead of nowrap
//                       maxHeight: "100px", // max height if you want vertical scroll
//                       // maxWidth: "100%",
//                       // scrollbarWidth: "thin", // For Firefox
//                       // scrollbarColor: "pink transparent", // For Firefox
//                       // maxHeight: "100px",
//                       // overflowX: "auto",
//                     }}
//                     // style={{ scrollbarWidth: "thin" }}
//                   >
//                     {`( classes-${notice.class_name} )`}
//                   </div>
//                 </div>

//                 {/* Description */}
//                 <div
//                   className="text-sm leading-4 max-h-[80px] overflow-y-auto break-words text-gray-700"
//                   style={{ wordBreak: "break-word", maxWidth: "100%" }}
//                 >
//                   {notice.notice_desc}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* For Staff Notices */}
//         {activeTab === "noticeForStaff" && staffNotices.length === 0 && (
//           <div className="relative left-[1%] w-[95%] text-center flex justify-center items-center mt-8 md:mt-14">
//             <div className="flex flex-col items-center justify-center text-center ">
//               <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-400 to-pink-500 drop-shadow-md mb-3">
//                 Oops!{" "}
//               </p>

//               <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
//                 No data available.
//               </p>
//             </div>
//           </div>
//         )}
//         {activeTab === "noticeForStaff" && staffNotices.length > 0 && (
//           <div className={`${Styles.noticeBoard} grid gap-2`}>
//             {staffNotices.map((notice, index) => (
//               <div
//                 key={index}
//                 className={`${Styles.notice} sm:p-4 rounded shadow-md`}
//               >
//                 <div className={`${Styles.date} text-xs mb-2`}>
//                   {notice.notice_date}
//                   <span className={`${Styles.time} float-right font-bold`}>
//                     {notice.notice_type}
//                   </span>
//                 </div>
//                 <div className={`${Styles.author} text-sm mb-2`}>
//                   {notice.subject}
//                   <span
//                     className={`${Styles.time} ml-2 text-xs`}
//                   >{`( ${notice.staff_name} )`}</span>
//                 </div>

//                 <div
//                   className="text-sm leading-4 max-h-[80px] overflow-y-auto break-words text-gray-700"
//                   style={{ wordBreak: "break-word", maxWidth: "100%" }}
//                 >
//                   {notice.notice_desc}
//                 </div>
//                 {/* <div className={`${Styles.message} text-sm leading-6`}></div> */}
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default NoticeBord;
// Try UP
import { useState, useEffect } from "react";
import axios from "axios";
import Styles from "../../CSS/DashbordCss/NoticeBord.module.css";
import { useNavigate } from "react-router-dom";
import Loader from "../common/LoaderFinal/DashboardLoadder/Loader";

function NoticeBord() {
  const API_URL = import.meta.env.VITE_API_URL; // url for host
  const [activeTab, setActiveTab] = useState("noticeForParents");
  const [parentNotices, setParentNotices] = useState([]);
  const [staffNotices, setStaffNotices] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/"); // 👈 Redirect to login
          return; // 👈 Prevent further execution
        }

        // Fetch parent notices
        const parentResponse = await axios.get(
          `${API_URL}/api/parent-notices`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setParentNotices(parentResponse.data.parent_notices);

        // Fetch staff notices
        const staffResponse = await axios.get(`${API_URL}/api/staff-notices`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStaffNotices(staffResponse.data.notices);
      } catch (error) {
        setError(error.message);
        const errorMsg = error.response?.data?.message;
        // Handle expired token
        if (errorMsg === "Token has expired") {
          localStorage.removeItem("authToken"); // Optional: clear old token
          navigate("/"); // Redirect to login
          return;
        }
        console.error("Error fetching notices:", error);
      } finally {
        setLoading(false); // ✅ Always set loading to false after fetch
      }
    };

    fetchNotices();
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    // <div className={`  px-2 rounded-lg `}>
    <div className="px-2 rounded-lg h-full flex flex-col">
      {/* <div
        className={` flex justify-between sm:mb-2  w-full  sm:flex flex-row mb-2`}
      > */}
      <div className="flex mb-2 rounded-md overflow-hidden bg-gray-100">
        {/* <button
          className={`${Styles.tab} w-full h-1/4 text-sm font-bold  ${
            activeTab === "noticeForParents" ? Styles.active : ""
          } sm:mr-1 mx-0 sm:mb-0  p-2  text-sm sm:w-1/2`}
          onClick={() => handleTabChange("noticeForParents")}
        >
          Notice for Parents
        </button>
        <button
          className={`${Styles.tab} w-full h-1/4 text-sm font-bold  ${
            activeTab === "noticeForStaff" ? Styles.active : ""
          } sm:mr-1 mx-0 sm:mb-0  p-2 text-sm sm:w-1/2`}
          onClick={() => handleTabChange("noticeForStaff")}
        >
          Notice for Staff
        </button> */}
        <button
          className={`${Styles.tab
            } flex-1 px-3 py-2 text-sm font-bold transition-all ${activeTab === "noticeForParents" ? Styles.active : ""
            }`}
          onClick={() => handleTabChange("noticeForParents")}
        >
          Notice for Parents
        </button>

        <button
          className={`${Styles.tab
            } flex-1 px-3 py-2 text-sm font-bold transition-all ${activeTab === "noticeForStaff" ? Styles.active : ""
            }`}
          onClick={() => handleTabChange("noticeForStaff")}
        >
          Notice for Staff
        </button>
      </div>

      {/* <div className="overflow-y-auto max-h-64"> */}
      <div className="flex-1 overflow-y-auto pr-1">
        {activeTab === "noticeForParents" && loading && (
          <div className="text-center mt-10">
            <div className="loader animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full mx-auto" />
            <p className="text-center relative top-[16%]  w-10 mt-10 mx-auto  ">
              <Loader />
            </p>{" "}
          </div>
        )}

        {activeTab === "noticeForParents" &&
          !loading &&
          parentNotices.length === 0 && (
            <div className="relative left-[1%] w-[95%] text-center flex justify-center items-center mt-8 md:mt-14">
              <div className="flex flex-col items-center justify-center text-center ">
                <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-400 to-pink-500 drop-shadow-md mb-3">
                  Oops!
                </p>
                <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
                  No data available.
                </p>
              </div>
            </div>
          )}

        {activeTab === "noticeForParents" && parentNotices.length > 0 && (
          <div className={`${Styles.noticeBoard} grid gap-2`}>
            {parentNotices.map((notice, index) => (
              <div
                key={index}
                className={`${Styles.notice} sm:border-1 border-gray sm:px-3 sm:py-1 sm:leading-3 mb-0 sm:h-fit bg-white box-border rounded shadow-md `}
              >
                <div className={`${Styles.date} text-xs mb-2 sm:mb-1`}>
                  {notice.notice_date}
                  <span className={`${Styles.time} float-right font-bold`}>
                    {notice.notice_type}
                  </span>
                </div>
                <div className={`${Styles.author} text-sm mb-2 sm:mb-1`}>
                  {notice.subject}
                  <span
                    className={`${Styles.time} ml-2 text-xs sm:mb-1`}
                  >{`( class-${notice.class_name} )`}</span>
                </div>
                <div
                  className={`${Styles.message} text-sm leading-4 sm:leading-3 sm:mt-0`}
                >
                  {notice.notice_desc}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "noticeForStaff" && loading && (
          <div className="text-center mt-10">
            <div className="loader animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full mx-auto" />
            <p className="text-center relative top-[16%]  w-10 mt-10 mx-auto  ">
              <Loader />
            </p>{" "}
          </div>
        )}

        {activeTab === "noticeForStaff" &&
          !loading &&
          staffNotices.length === 0 && (
            <div className="relative  left-[1%] w-[95%] text-center flex justify-center items-center mt-8 md:mt-14">
              <div className="flex flex-col items-center justify-center text-center ">
                <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-400 to-pink-500 drop-shadow-md mb-3">
                  Oops!
                </p>
                <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
                  No data available.
                </p>
              </div>
            </div>
          )}

        {activeTab === "noticeForStaff" && staffNotices.length > 0 && (
          <div className={`${Styles.noticeBoard} grid gap-2`}>
            {staffNotices.map((notice, index) => (
              <div
                key={index}
                className={`${Styles.notice} sm:p-4 rounded shadow-md`}
              >
                <div className={`${Styles.date} text-xs mb-2`}>
                  {notice.notice_date}
                  <span className={`${Styles.time} float-right font-bold`}>
                    {notice.notice_type}
                  </span>
                </div>
                <div className={`${Styles.author} text-sm mb-2`}>
                  {notice.subject}
                  <span
                    className={`${Styles.time} ml-2 text-xs`}
                  >{`( ${notice.staff_name} )`}</span>
                </div>

                <div
                  className="text-sm leading-4 max-h-[80px] overflow-y-auto break-words text-gray-700"
                  style={{ wordBreak: "break-word", maxWidth: "100%" }}
                >
                  {notice.notice_desc}
                </div>
                {/* <div className={`${Styles.message} text-sm leading-6`}></div> */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default NoticeBord;
