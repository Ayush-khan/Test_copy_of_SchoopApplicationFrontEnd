import { useState, useEffect } from "react";
// import React, { useState, useEffect } from "react";
import axios from "axios";
import Styles from "./EventCard.module.css"; // Import CSS module
import Loader from "../common/LoaderFinal/DashboardLoadder/Loader";
import { useNavigate } from "react-router-dom";

const EventCard = () => {
  const API_URL = import.meta.env.VITE_API_URL; // url for host
  const [events, setEvents] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const currentYear = new Date().getFullYear();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      // const academicYr = localStorage.getItem("academicYear");
      // console.log("academic year", academicYr);
      console.log("token is", token);

      if (!token) {
        // toast.error("Authentication token not found Please login again");
        navigate("/"); // 👈 Redirect to login
        return; // 👈
        // throw new Error("No authentication token found");
      }

      const response = await axios.get(`${API_URL}/api/events`, {
        params: {
          month: selectedMonth + 1, // API expects 1-based month index
          year: currentYear,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setEvents(response?.data);
      console.log("responseData of Events", response?.data);
    } catch (error) {
      setError(error.message);
      // working well code
      const errorMsg = error.response?.data?.message;
      // Handle expired token
      if (errorMsg === "Token has expired") {
        localStorage.removeItem("authToken"); // Optional: clear old token
        navigate("/"); // Redirect to login
        return;
      }

      // Other error handling

      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, [selectedMonth]); // Fetch when selectedMonth changes
  useEffect(() => {
    // Fetch data on initial load
    fetchData();
  }, []); // Empty dependency array ensures this runs only once on initial render

  const handleMonthChange = (e) => {
    setSelectedMonth(parseInt(e.target.value, 10));
  };

  const filteredEvents = events.filter(
    (event) => new Date(event.start_date).getMonth() === selectedMonth
  );
  console.log("filteredEvents", filteredEvents);

  return (
    <div className={`  border-2 border-solid h-64 bg-slate-100`}>
      <div className="  m-auto header p-1 flex justify-between items-center bg-gray-200 rounded-t-lg mb-3">
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
      {loading ? (
        <p className="text-center relative top-[16%]  w-10 mt-10 mx-auto  ">
          <Loader />
        </p>
      ) : (
        <div
          className={`${Styles.eventsList} rounded-lg pb-20 sm:pb-20  bg-gray-100 px-2`}
        >
          {filteredEvents.length ? (
            filteredEvents.map((event, index) => (
              <div key={index} className={`${Styles.eventCard}  rounded-lg `}>
                <div
                  className={` h-full box-border  max-w-3/4 px-2  bg-gray-500   text-cyan-900 text-lg rounded-l-lg      `}
                  style={{ background: "#00FFFF", color: "#C3347D" }}
                >
                  <div
                    className={` box-border w-full text-center  text-cyan-900 text-lg rounded-l-lg  flex flex-col items-center justify-between     `}
                  >
                    {" "}
                    <span className="    flex flex-col justify-start max-h-10px">
                      <p className=" relative top-4 text-2.5em w-8 mx-auto font-medium text-center h-8 bg-gray-600 text-white rounded-lg">
                        {event.start_date.split("-")[2] || ""}
                        {/* {new Date(event.start_date).getDate() + 1}{" "} */}
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
                    <div
                      className={`${Styles?.discription} box-border shadow-inner mb-0 p-2 text-sm sm:mb-1 mt-0 text-gray-800`}
                      style={{
                        maxHeight: "80px", // Adjust height as needed
                        overflowY: "auto", // Enables vertical scrolling

                        padding: "8px",
                        backgroundColor: "#f9f9f9", // Optional: Light background
                      }}
                    >
                      {event?.event_desc}
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
                        event.end_date
                      ).getDate()} ${new Date(event.end_date).toLocaleString(
                        "default",
                        {
                          month: "long",
                        }
                      )} at ${event?.end_time}`}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="relative left-[1%] w-[100%] text-center flex justify-center items-center mt-10">
              <div className="flex flex-col items-center justify-center text-center ">
                <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-400 to-pink-500 drop-shadow-md mb-3">
                  Oops!{" "}
                </p>

                <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
                  No data available.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventCard;
