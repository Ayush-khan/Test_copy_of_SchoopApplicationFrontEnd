import { useState, useEffect } from "react";
// import React, { useState, useEffect } from "react";
import axios from "axios";
import Styles from "./EventCard.module.css"; // Import CSS module
import Loader from "../common/LoaderFinal/DashboardLoadder/Loader";
import { useNavigate } from "react-router-dom";
import MarkDropdownEditor from "../Events/MarkDropdownEditor";
import zIndex from "@mui/material/styles/zIndex";

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

  // const fetchData = async () => {
  //   setLoading(true);
  //   try {
  //     const token = localStorage.getItem("authToken");
  //     console.log("token is", token);

  //     if (!token) {
  //       navigate("/");
  //     }

  //     const response = await axios.get(`${API_URL}/api/events`, {
  //       params: {
  //         month: selectedMonth + 1,
  //         year: currentYear,
  //       },
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     setEvents(response?.data);
  //     console.log("responseData of Events", response?.data);
  //   } catch (error) {
  //     setError(error.message);
  //     // working well code
  //     const errorMsg = error.response?.data?.message;
  //     // Handle expired token
  //     if (errorMsg === "Token has expired") {
  //       localStorage.removeItem("authToken"); // Optional: clear old token
  //       navigate("/"); // Redirect to login
  //       return;
  //     }

  //     // Other error handling

  //     console.error("Error fetching events:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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

  console.log("filtered event list", filteredEvents);
  const selectedMonthLabel = months.find(
    (m) => m.value === Number(selectedMonth)
  )?.label;

  return (
    <div className={`relative w-full border-2 border-solid  bg-slate-100`}>
      <div className="sticky top-0 w-full m-auto header p-1 flex justify-between items-center bg-gray-200 rounded-t-lg mb-3" style={{ zIndex: "2" }}>
        <span className="lg:text-lg sm:text-xs sm:font-semibold text-gray-500 mb-1">
          Events List
        </span>

        {/* <div
        className={`${Styles.header} `}
        style={{ fontWeight: "800", fontSize: "1.3em" }}
      > */}
        <select
          value={selectedMonth}
          onChange={handleMonthChange}
          className="   text-sm text-gray-700 font-semibold hover:cursor-pointer bg-gray-50 mb-1 border border-gray-400"
        // className={`  hover:cursor-pointer gap-x-2`}
        >
          {months.map((month) => (
            <option key={month.value} value={month.value}>
              {month.label} {currentYear}
            </option>
          ))}
        </select>
        {/* <MdOutlineArrowDropDown /> */}
      </div>
      {
        loading ? (
          <p className="text-center relative top-[16%]  w-10 mt-10 mx-auto  ">
            <Loader />
          </p>
        ) : (
          <div
            className={`${Styles.eventsList} rounded-lg pb-20 sm:pb-20 bg-gray-100 px-2 max-h-fit overflow-x-auto min-h-fit`}
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
                        // fontSize: "1.1em",
                        fontWeight: "550",
                        // marginTop: "1em",
                        color: "#00FFFF",
                      }}
                    >
                      {event.title}{" "}
                      <span
                        style={{ color: "#C334A2" }}
                      >{` (class-${event?.class_name})`}</span>
                    </h5>
                    <div className="mb-3">
                      {/* <div
                      className={`${Styles?.discription} box-border shadow-inner mb-0 p-2 text-sm sm:mb-1 mt-0 text-gray-800`}
                      style={{
                        maxHeight: "80px", // Adjust height as needed
                        overflowY: "auto", // Enables vertical scrolling

                        padding: "8px",
                        backgroundColor: "#f9f9f9", // Optional: Light background
                      }}
                    >
                      {event?.event_desc}
                    </div> */}

                      <div
                        className={`${Styles?.discription} box-border bg-cyan-400 shadow-inner mb-0  text-sm sm:mb-1 mt-0 text-gray-800`}
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
                  {/* <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-400 to-pink-500 drop-shadow-md mb-3">
                  Oops!
                </p> */}
                  {roleId === "A" || roleId === "M" ? (
                    <>
                      <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
                        Create event list.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
                        No events scheduled for {selectedMonthLabel} {currentYear}.
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
