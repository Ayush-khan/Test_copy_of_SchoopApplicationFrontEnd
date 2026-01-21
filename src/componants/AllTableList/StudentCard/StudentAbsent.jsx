// Updated codeq according to arnolds
import { useEffect, useState } from "react";
import IndividualStudentTab from "./IndividualStudentTab";
import LowAttendanceTab from "./LowAttendanceTab";
import NotMarkAbsentees from "./NotMarkAbsentees";
import { RxCross1 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import axios from "axios";

const StudentAbsent = () => {
  const API_URL = import.meta.env.VITE_API_URL; // url for host
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);

  const tabFromQuery = query.get("tab");

  // const [activeTab, setActiveTab] = useState("Today's Absent Students");
  // const [activeTab, setActiveTab] = useState(() => {
  //   if (tabFromQuery === "not-mark-absentees") {
  //     return "Today's Attendance not mark for classes";
  //   }
  //   return "Today's Absent Students";
  // });

  const [activeTab, setActiveTab] = useState(
    location.state?.openTab || "Today's Absent Students",
  );

  useEffect(() => {
    if (tabFromQuery) {
      window.history.replaceState({}, "", "/studentAbsent");
    }
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab); // Update the active tab state
  };

  const [loading, setLoading] = useState(false);
  const [regId, setRegId] = useState("");
  const [roleId, setRoleId] = useState("");
  const [isClassTeacher, setIsClassTeacher] = useState("");

  useEffect(() => {
    fetchRoleId();
  }, []);

  useEffect(() => {
    if (!roleId || !regId) return;

    if (regId) {
      fetchClassTeacherData();
    }
  }, [roleId, regId]);

  const fetchRoleId = async () => {
    setLoading(true);
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Authentication token not found. Please login again");
      navigate("/");
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/api/sessionData`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const roleId = response?.data?.user?.role_id;
      const regId = response?.data?.user?.reg_id;

      setRegId(regId);

      if (roleId) setRoleId(roleId);
    } catch (error) {
      console.error("Failed to fetch session data:", error);
    } finally {
      setLoading(false); // stop loading after API
    }
  };

  const fetchClassTeacherData = async () => {
    setLoading(true);
    const token = localStorage.getItem("authToken");

    try {
      const response = await axios.get(
        `${API_URL}/api/get_classes_of_classteacher?teacher_id=${regId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const classData = response.data.data;
      console.log("class teacher", classData);

      // Check if the teacher is a class teacher
      const isClassTeacherFlag = classData.some(
        (cls) => cls.is_class_teacher === 1,
      )
        ? 1
        : 0; // store as 1 or 0
      setIsClassTeacher(isClassTeacherFlag);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching class teacher data:", err);
      setLoading(false);
    }
  };

  return (
    <div className="md:mx-auto md:w-[85%] px-3 py-2 bg-white mt-4 ">
      <div className=" card-header  flex justify-between items-center  ">
        <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
          Student Attendance
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
      {/* <ul className="grid grid-cols-2 gap-x-10 relative -left-8 md:left-3 md:flex md:flex-row  -top-4">
       
        {[
          "Today's Absent Students",
          "Student's Attendance Less than 75%",
          "Today's Attendance not mark for classes",
        ].map((tab) => (
          <li
            key={tab}
            className={`md:-ml-7 shadow-md bg-gray-100 border-1 border-gray-100 ${
              activeTab === tab ? "  text-blue-500 font-bold" : ""
            }`}
          >
            <button
              onClick={() => handleTabChange(tab)}
              className="px-2 md:px-4 py-1 hover:bg-gray-200 text-[1em] md:text-sm text-nowrap"
            >
              {tab.replace(/([A-Z])/g, " $1")}
            </button>
          </li>
        ))}
      </ul> */}

      <ul className="grid grid-cols-2 gap-x-10 relative -left-8 md:left-3 md:flex md:flex-row -top-4">
        {/* Tab Navigation */}
        {[
          "Today's Absent Students",
          "Student's Attendance Less than 75%",
          ...(roleId === "A" || roleId === "M"
            ? ["Today's Attendance not mark classes"]
            : []),
        ].map((tab) => (
          <li
            key={tab}
            className={`md:-ml-7 shadow-md bg-gray-100 border-1 border-gray-100 ${activeTab === tab ? "text-blue-500 font-bold" : ""
              }`}
          >
            <button
              onClick={() => handleTabChange(tab)}
              className="px-2 md:px-4 py-1 hover:bg-gray-200 text-[1em] md:text-sm text-nowrap"
            >
              {tab}
            </button>
          </li>
        ))}
      </ul>

      <div className="bg-white  rounded-md -mt-5">
        {activeTab === "Today's Absent Students" && <IndividualStudentTab />}
        {activeTab === "Student's Attendance Less than 75%" && (
          <div>
            <LowAttendanceTab />{" "}
          </div>
        )}
        {activeTab === "Today's Attendance not mark classes" && (
          <div>
            <NotMarkAbsentees />
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAbsent;
