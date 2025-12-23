import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../../componants/common/LoaderFinal/LoaderStyle";
import { RxCross1 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";

function TimeTableViewForTeacher() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [loading, setLoading] = useState(false);
  const [timetable, setTimetable] = useState({});
  const [teacherName, setTeacherName] = useState("");
  const [regId, setRegId] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const navigate = useNavigate();
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");
        if (!token) {
          toast.error("Token missing, please login again");
          return;
        }

        // 1️⃣ Get session data
        const sessionRes = await axios.get(`${API_URL}/api/sessionData`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const teacherId = sessionRes?.data?.user?.reg_id;
        const teacherName = sessionRes?.data?.user?.name;
        const acdYr = sessionRes?.data?.custom_claims?.academic_year;

        console.log("academic year", acdYr);

        setTeacherName(teacherName);
        setRegId(teacherId);
        setAcademicYear(acdYr);

        // 2️⃣ Fetch timetable for all days in parallel
        const requests = days.map((day) => {
          const formData = new FormData();
          formData.append("teacher_id", teacherId);
          formData.append("day", day);
          formData.append("acd_yr", acdYr);

          return axios
            .post(`${API_URL}/api/get_teacher_timetable`, formData, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => ({ day, data: res.data?.tt_data }))
            .catch(() => ({ day, data: [] })); // Prevent one failure from breaking all
        });

        const responses = await Promise.all(requests);

        const timetableData = {};
        responses.forEach(({ day, data }) => {
          if (data) timetableData[day] = data;
        });

        setTimetable(timetableData);
      } catch (error) {
        console.error("Error fetching timetable:", error);
        toast.error("Failed to fetch timetable");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      {/* <ToastContainer /> */}
      <div className="md:mx-auto md:w-[90%] p-4 bg-white mt-4 ">
        <div className=" card-header  flex justify-between items-center  ">
          <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
            Timetable{" "}
          </h3>
          <RxCross1
            className="float-end relative -top-1 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
            onClick={() => {
              navigate("/dashboard");
            }}
          />
        </div>
        <div
          className=" relative  mb-8   h-1  mx-auto bg-red-700"
          style={{
            backgroundColor: "#C03078",
          }}
        ></div>

        <div className="bg-gradient-to-b from-white to-gray-50 rounded-xl shadow-md border border-gray-200 p-6">
          <ToastContainer />

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader />
            </div>
          ) : (
            <>
              <h2 className="text-center text-lg font-semibold text-[#C03078] mb-4 flex justify-center items-center gap-2">
                🗓 Timetable of {teacherName}
              </h2>

              <table className="border-collapse border border-gray-400 w-full text-sm">
                <thead>
                  <tr>
                    <th className="bg-green-300 border border-gray-400 px-4 py-2 text-gray-900 font-semibold text-center">
                      Day
                    </th>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((period) => (
                      <th
                        key={period}
                        className="border border-gray-400 px-3 py-2 font-semibold text-center"
                        style={{
                          backgroundColor: [
                            "#e6d7f5",
                            "#fef08a",
                            "#b2f5ea",
                            "#a7f3d0",
                            "#bae6fd",
                            "#dbeafe",
                            "#fef3c7",
                            "#fce7f3",
                          ][period - 1],
                        }}
                      >
                        {period}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {days.map((day) => (
                    <tr key={day}>
                      <td className="bg-green-100 border border-gray-400 font-semibold text-gray-700 text-center px-3 py-2">
                        {day}
                      </td>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((period) => {
                        const subjectData = timetable[day]?.find(
                          (p) => p.period_no === period
                        );
                        return (
                          <td
                            key={period}
                            className="border border-gray-400 text-center px-2 py-2 bg-gray-50"
                          >
                            {subjectData ? (
                              <div className="flex flex-col items-center justify-center">
                                <span className="text-blue-700 font-semibold">
                                  {subjectData.subject}
                                </span>
                                <span className="text-red-600 text-xs mt-1">
                                  {subjectData.class} {subjectData.section}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400">---</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default TimeTableViewForTeacher;
