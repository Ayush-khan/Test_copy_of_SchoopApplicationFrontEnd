// Second try WIth API calling
import { useState, useEffect } from "react";
import axios from "axios";
import Loader from "../common/LoaderFinal/DashboardLoadder/Loader";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

const TicketForDashboard = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [roleId, setRoleId] = useState(null);
  const [regId, setRegId] = useState(null);
  const [teacherCardsData, setTeachersCardsData] = useState([]);

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
        `${API_URL}/api/teachers/${regId}/dashboard/tickets`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const teacherCards = response?.data?.data?.tickets;
      console.log("Teacher ticket applint list.", teacherCards);
      setTeachersCardsData(teacherCards);
    } catch (error) {
      console.error("Failed to fetch session data:", error);
    }
  };

  const camelCase = (str) =>
    str
      ?.toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const extractTimeRange = (dateTime) => {
    if (!dateTime) return "";
    return dateTime.split(" ").slice(1).join(" ");
  };

  return (
    // <div className="h-full md:h-72 bg-white rounded-lg shadow">
    //   <div className="flex justify-between items-center bg-gray-200 px-3 py-2 rounded-t-lg">
    //     <span className="text-xs sm:text-sm lg:text-lg font-semibold text-gray-600">
    //       Today's Tickets
    //     </span>
    //   </div>

    //   <div className="mt-2 px-3 h-[calc(100%-48px)] overflow-y-auto">
    //     {teacherCardsData?.length > 0 ? (
    //       teacherCardsData.map((item) => (
    //         <div
    //           key={item.ticket_id}
    //           className="bg-white border-l-4 border-blue-500 rounded-md shadow-sm p-3 mb-3"
    //         >
    //           <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
    //             <h3 className="text-sm sm:text-base font-semibold text-gray-800 truncate">
    //               {camelCase(
    //                 `${item.first_name} ${item.mid_name} ${item.last_name}`
    //               )}
    //             </h3>

    //             <span
    //               className={`self-start sm:self-auto text-xs font-semibold px-2 py-1 rounded-full w-fit ${
    //                 item.status === "Approved"
    //                   ? "bg-green-100 text-green-600"
    //                   : "bg-yellow-100 text-yellow-600"
    //               }`}
    //             >
    //               {item.status}
    //             </span>
    //           </div>

    //           <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">
    //             <strong>📝</strong> {item.title}
    //           </p>

    //           <p className="text-xs sm:text-sm text-gray-600 mb-1">
    //             <strong>⏰</strong> {item.appointment_date_time}
    //           </p>

    //           <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
    //             <strong>🧾</strong> {item.description}
    //           </p>
    //         </div>
    //       ))
    //     ) : (
    //       <div className="relative left-[1%] w-[100%] text-center flex justify-center items-center mt-10">
    //         <div className="flex flex-col items-center justify-center text-center">
    //           <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-400 to-pink-500 drop-shadow-md mb-3">
    //             Oops!
    //           </p>
    //           <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
    //             No appointments for today.
    //           </p>
    //         </div>
    //       </div>
    //     )}
    //   </div>
    // </div>

    <div className=" flex flex-col h-72 md:h-72">
      {/* Header   bg-white rounded-lg shadow*/}
      <div className="bg-gray-200 px-3 py-2 rounded-t-lg flex-shrink-0">
        <span className="text-xs sm:text-sm lg:text-lg font-semibold text-gray-600">
          Today's Appointment
        </span>
      </div>

      <div className="flex-1 px-3 py-1 overflow-y-auto">
        {teacherCardsData?.length > 0 ? (
          teacherCardsData.map((item) => (
            <div
              key={item.ticket_id}
              className="bg-white border-l-4 border-blue-500 rounded-md shadow-sm p-1 mb-3"
            >
              <div
                className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2"
              //gap-2 mb-2
              >
                <h3 className="text-sm sm:text-base font-semibold text-gray-800 truncate">
                  {camelCase(
                    `${item.first_name} ${item.mid_name} ${item.last_name}`
                  )}
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">
                <strong>📝</strong> {item.title}
              </p>

              <p className="text-xs sm:text-sm text-gray-600 mb-1">
                <strong>⏰</strong>{" "}
                {extractTimeRange(item.appointment_date_time)}
              </p>
            </div>
          ))
        ) : (
          <div className="relative left-[1%] w-[100%] text-center flex justify-center items-center mt-10">
            <div className="flex flex-col items-center justify-center text-center">
              <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-400 to-pink-500 drop-shadow-md mb-3">
                {/* All Done! */}
              </p>
              <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
                No appointments for today.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketForDashboard;
