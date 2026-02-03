// import { useState, useEffect, useMemo } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import Styles from "./EventCard.module.css";
// import Loader from "../common/LoaderFinal/DashboardLoadder/Loader";
// import MarkDropdownEditor from "../Events/MarkDropdownEditor";

// const MONTHS = [
//   "January", "February", "March", "April", "May", "June",
//   "July", "August", "September", "October", "November", "December",
// ];

// const EventCard = () => {
//   const API_URL = import.meta.env.VITE_API_URL;
//   const navigate = useNavigate();

//   const [events, setEvents] = useState([]);
//   const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
//   const [loading, setLoading] = useState(false);
//   const [roleId, setRoleId] = useState(null);
//   const [regId, setRegId] = useState(null);

//   const currentYear = new Date().getFullYear();

//   /* ================= FETCH SESSION ================= */
//   useEffect(() => {
//     const fetchRoleId = async () => {
//       try {
//         const token = localStorage.getItem("authToken");
//         if (!token) return navigate("/");

//         const { data } = await axios.get(`${API_URL}/api/sessionData`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         setRoleId(data?.user?.role_id);
//         setRegId(data?.user?.reg_id);
//       } catch (err) {
//         console.error("Session fetch failed", err);
//         navigate("/");
//       }
//     };

//     fetchRoleId();
//   }, [API_URL, navigate]);

//   /* ================= FETCH EVENTS ================= */
//   useEffect(() => {
//     if (!roleId) return;

//     const fetchEvents = async () => {
//       setLoading(true);
//       try {
//         const token = localStorage.getItem("authToken");

//         const url =
//           roleId === "T"
//             ? `${API_URL}/api/teachers/${regId}/dashboard/events`
//             : `${API_URL}/api/events`;

//         const { data } = await axios.get(url, {
//           params: {
//             month: selectedMonth + 1,
//             year: currentYear,
//           },
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         setEvents(Array.isArray(data) ? data : data?.data || []);
//       } catch (err) {
//         if (err.response?.data?.message === "Token has expired") {
//           localStorage.removeItem("authToken");
//           navigate("/");
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchEvents();
//   }, [API_URL, roleId, regId, selectedMonth, currentYear, navigate]);

//   /* ================= FILTER EVENTS ================= */
//   const filteredEvents = useMemo(() => {
//     return events.filter((e) => {
//       if (!e.start_date) return false;
//       const d = new Date(e.start_date);
//       return d.getMonth() === selectedMonth && d.getFullYear() === currentYear;
//     });
//   }, [events, selectedMonth, currentYear]);

//   /* ================= UI ================= */
//   return (
//     <div className="w-full border bg-slate-100 rounded-lg">
//       {/* HEADER */}
//       <div className="sticky top-0 flex justify-between items-center bg-gray-200 p-2 rounded-t-lg z-10">
//         <h3 className="text-gray-600 font-semibold">Events List</h3>

//         <select
//           value={selectedMonth}
//           onChange={(e) => setSelectedMonth(Number(e.target.value))}
//           className="border rounded px-2 py-1 text-sm"
//         >
//           {MONTHS.map((m, i) => (
//             <option key={i} value={i}>
//               {m} {currentYear}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* CONTENT */}
//       {loading ? (
//         <div className="flex justify-center py-10">
//           <Loader />
//         </div>
//       ) : (
//         <div className={`${Styles.eventsList} px-2`}>
//           {filteredEvents.length ? (
//             filteredEvents.map((event, i) => {
//               const startDate = new Date(event.start_date);
//               const endDate = new Date(event.end_date);

//               return (
//                 <div key={i} className={`${Styles.eventCard} flex rounded-lg mb-3`}>
//                   {/* DATE */}
//                   <div className="bg-cyan-300 text-center px-3 py-2 rounded-l-lg">
//                     <p className="text-xl font-bold text-white bg-gray-700 rounded">
//                       {startDate.getDate()}
//                     </p>
//                     <p>{MONTHS[startDate.getMonth()]}</p>
//                     <p className="text-sm text-pink-600">{event.start_time}</p>
//                   </div>

//                   {/* DETAILS */}
//                   <div className={Styles.details}>
//                     <h5 className="font-semibold text-cyan-400">
//                       {event.title}
//                       <span className="text-pink-500">
//                         {` (class-${event.class_name})`}
//                       </span>
//                     </h5>

//                     <div className={`${Styles.discription} shadow-inner`}>
//                       <MarkDropdownEditor
//                         value={event.event_desc || ""}
//                         readOnly
//                         disabled
//                       />
//                     </div>

//                     <p className="text-sm text-gray-500 mt-1">
//                       Ends on {endDate.getDate()} {MONTHS[endDate.getMonth()]} at {event.end_time}
//                     </p>
//                   </div>
//                 </div>
//               );
//             })
//           ) : (
//             (roleId === "A" || roleId === "M") && (
//               <p className="text-center mt-10 font-bold bg-gradient-to-r from-pink-500 to-blue-500 text-transparent bg-clip-text">
//                 Create event list ✨
//               </p>
//             )
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default EventCard;




import { useState, useEffect } from "react";
import axios from "axios";
import Styles from "./EventCard.module.css"; // Import CSS module
import Loader from "../common/LoaderFinal/DashboardLoadder/Loader";
import { useNavigate } from "react-router-dom";
import MarkDropdownEditor from "../Events/MarkDropdownEditor";

const EventCard = () => {
  const API_URL = import.meta.env.VITE_API_URL; // url for host
  const [events, setEvents] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const currentYear = new Date().getFullYear();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [roleId, setRoleId] = useState(null);
  const [regId, setRegId] = useState(null);

  const months = [
    { value: 0, label: "January" },
    { value: 1, label: "February" },
    { value: 2, label: "March" },
    { value: 3, label: "April" },
    { value: 4, label: "May" },
    { value: 5, label: "June" },
    { value: 6, label: "July" },
    { value: 7, label: "August" },
    { value: 8, label: "September" },
    { value: 9, label: "October" },
    { value: 10, label: "November" },
    { value: 11, label: "December" },
  ];

  useEffect(() => {
    fetchRoleId();
  });

  const fetchRoleId = async () => {
    const token = localStorage.getItem("authToken");

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


  const fetchData = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/");
        return;
      }

      const apiUrl =
        roleId === "T"
          ? `${API_URL}/api/teachers/${regId}/dashboard/events`
          : `${API_URL}/api/events`;

      const response = await axios.get(apiUrl, {
        params: {
          month: Number(selectedMonth) + 1,
          year: currentYear,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const rawData = Array.isArray(response?.data)
        ? response.data
        : response?.data?.data;

      console.log("rwa data", rawData);

      let normalizedEvents = [];

      if (Array.isArray(rawData)) {
        normalizedEvents = rawData;
      }

      setEvents(normalizedEvents);
    } catch (error) {
      setError(error.message);
      if (error.response?.data?.message === "Token has expired") {
        localStorage.removeItem("authToken");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!roleId) return;

    fetchData();
  }, [roleId, selectedMonth]);

  const handleMonthChange = (e) => {
    setSelectedMonth(parseInt(e.target.value, 10));
  };

  const filteredEvents = events.filter((event) => {
    if (!event.start_date) return false;

    const date = new Date(event.start_date);

    return (
      date.getMonth() === Number(selectedMonth) &&
      date.getFullYear() === currentYear
    );
  });



  return (
    <div className={`relative w-full border-2 border-solid  bg-slate-100  `}>
      <div className="sticky top-0 w-full m-auto header p-1 flex justify-between items-center bg-gray-200 rounded-t-lg mb-3" style={{ zIndex: "2" }}>
        <span className="lg:text-lg sm:text-xs sm:font-semibold text-gray-500 mb-1">
          Events List
        </span>
        <select
          value={selectedMonth}
          onChange={handleMonthChange}
          className="   text-sm text-gray-700 font-semibold hover:cursor-pointer bg-gray-50 mb-1 border border-gray-400"
        >
          {months.map((month) => (
            <option key={month.value} value={month.value}>
              {month.label} {currentYear}
            </option>
          ))}
        </select>

      </div>
      {
        loading ? (
          <p className="text-center relative top-[16%]  w-10 mt-10 mx-auto  ">
            <Loader />
          </p>
        ) : (
          <div
            className={`${Styles.eventsList} rounded-lg pb-3 bg-gray-100 px-2 max-h-fit overflow-x-auto min-h-fit`}
          >
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event, index) => (
                <div key={index} className={`${Styles.eventCard} rounded-lg flex flex-row justify-center items-center mx-auto w-full`}>
                  <div
                    className={` box-border  max-w-3/4 px-2  bg-gray-500   text-cyan-900 text-lg rounded-l-lg      `}
                    style={{ background: "#00FFFF", color: "#C3347D" }}
                  >
                    <div
                      className={` box-border w-full text-center  text-cyan-900 text-lg rounded-l-lg  flex flex-col items-center justify-between     `}
                    >
                      {" "}
                      <span className="    flex flex-col justify-start max-h-10px">
                        <p className=" relative top-4 text-2.5em w-8 mx-auto font-medium text-center h-8 bg-gray-600 text-white rounded-lg">
                          {event.start_date.split("-")[2] || ""}
                        </p>
                        <p>
                          {new Date(event.start_date).toLocaleString("default", {
                            month: "long",
                          }) || " "}
                        </p>
                        <p>
                          <span
                            style={{ color: "#C3347D" }}
                            className=" relative bottom-4 text-[.8em]"
                          >
                            {event?.start_time || " "}
                          </span>
                        </p>
                      </span>
                    </div>
                  </div>

                  <div className={Styles.details}>
                    <h5
                      className="sm:text-xs"
                      style={{

                        fontWeight: "550",
                        color: "#00FFFF",
                      }}
                    >
                      {event.title}{" "}
                      <span
                        style={{ color: "#C334A2" }}
                      >{` (class-${event?.class_name})`}</span>
                    </h5>
                    <div className="mb-3">


                      <div
                        className={`${Styles?.discription} text-[1em]  shadow-inner mb-0  text-sm sm:mb-1 mt-0 text-gray-800`}
                        style={{
                          maxHeight: "80px", // same as your earlier styling
                          overflowY: "auto",
                          padding: "2px",
                          // backgroundColor: "#C334A2",
                          width: "100%",
                          // backgroundColor: "#f9f9f9",
                          wordBreak: "break-word", // Ensures long words break to fit
                        }}
                      >
                        <MarkDropdownEditor
                          value={event?.event_desc || ""}
                          readOnly
                          disabled
                          className="w-full text-sm  text-gray-800 bg-transparent cursor-not-allowed"
                        />
                      </div>

                      <p
                        style={{
                          fontSize: ".9em",
                          color: "gray",
                          marginTop: "2px",
                          marginLeft: "5px",
                          marginBottom: "-10px",
                        }}
                      >
                        {`The event will conclude on ${new Date(
                          event.end_date,
                        ).getDate()} ${new Date(event.end_date).toLocaleString(
                          "default",
                          {
                            month: "long",
                          },
                        )} at ${event?.end_time}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="relative left-[1%] w-[100%] text-center flex justify-center items-center mt-10">
                <div className="flex flex-col items-center justify-center text-center">

                  {roleId === "A" || roleId === "M" && (
                    <>
                      <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
                        Create event list.
                      </p>
                    </>
                  )}

                </div>
              </div>
            )}
          </div>
        )
      }
    </div >
  );
};

export default EventCard;