import { useState, useEffect } from "react";
import styles from "../CSS/Navbar.module.css";
import "./styles.css";
import Footer from "./Footer";
import { RxCross1 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

const ForgotPassword = () => {
  const API_URL = import.meta.env.VITE_API_URL; // url for host
  const [userId, setUserId] = useState("");
  const [newPasswordLoading, setNewPasswordLoading] = useState(false);

  const [schoolInfo, setSchoolInfo] = useState({});
  const [motherName, setMotherName] = useState("");
  const [dob, setDob] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({
    userId: false,
    motherName: false,
    dob: false,
  });
  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const isValid = userId.trim() && motherName.trim() && dob;

  function getCurrentDate() {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const monthIndex = today.getMonth();
    const year = String(today.getFullYear()).slice();

    const monthName = months[monthIndex];

    return `${day} ${monthName} ${year}`;
  }
  useEffect(() => {
    fetchClasses();
  }, []);
  const fetchClasses = async () => {
    setLoading(true);

    try {
      const response = await axios.get(`${API_URL}/api/get_schoolname`, {
        withCredentials: true,
      });

      const schoolData = response?.data?.data;

      // Set both school name and academic year
      setSchoolInfo({
        name: schoolData?.page_title, // or page_title if preferred
        academicYear: schoolData?.academic_yr,
      });
    } catch (error) {
      toast.error(error.message || "Failed to fetch school information.");
    } finally {
      setLoading(false);
    }
  };
  const handleResetPassword = async () => {
    setTouched({
      userId: true,
      motherName: true,
      dob: true,
    });

    if (!isValid) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/update_forgotpassword`,
        {
          user_id: userId,
          answer_one: motherName,
          dob: dob,
        }
      );

      if (response.data.success) {
        toast.success("Password reset instructions sent.");
      } else {
        toast.error(response.data.message || "Something went wrong.");
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to reset password.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNewPassword = async () => {
    if (!userId.trim()) {
      toast.error("Please enter your user ID.");
      return;
    }

    setNewPasswordLoading(true); // Start loading

    try {
      const response = await axios.post(
        `${API_URL}/api/save_newpasswordforgot`,
        {
          user_id: userId,
        }
      );

      if (response.data.success) {
        // Show the actual message from backend
        toast.success(response.data.message || "Password sent successfully.");
      } else {
        toast.error(response.data.message || "Something went wrong.");
      }
    } catch (error) {
      toast.error("Failed to send new password.");
    } finally {
      setNewPasswordLoading(false); // Stop loading
    }
  };

  return (
    <>
      <ToastContainer />
      <div
        // className="w-screen overflow-x-hidden h-screen flex flex-col items-center"
        className="w-screen min-h-screen overflow-x-hidden flex flex-col justify-between items-center"
        style={{
          background: "   linear-gradient(to bottom, #E91E63, #2196F3)",
        }}
      >
        <div className="">
          <div
            className={`${styles.navbar} w-screen flex items-center justify-between px-2  h-12 `}
            style={{
              background: "#C03078",
            }}
          >
            {" "}
            <div className="w-full flex justify-between items-center px-2">
              <img
                src="/ArnoldsLogo.png"
                alt="Logo"
                className="h-10 bg-transparent"
                style={{ fontSize: "2em" }}
              />
              <div className="flex-grow ">
                <h1
                  className={` flex justify-center items-center   lg:text-2xl  font-semibold   sm:font-bold  text-white `}
                >
                  {schoolInfo.name} ({schoolInfo.academicYear})
                </h1>
              </div>

              <div className="text-sm text-gray-700">
                <h1 className="text-lg lg:text-sm text-white px-2 hidden lg:block mt-2">
                  {getCurrentDate()}
                </h1>
              </div>
            </div>
          </div>{" "}
          <div className="w-full  bg-gray-200  h-4"></div>
          <div className="w-full flex justify-center">
            <div className="bg-white shadow-lg border rounded-lg px-8 py-3 w-[90%] md:w-[60%] lg:w-[40%] mt-6">
              <div className="flex justify-between items-center ">
                <h2 className="text-xl font-semibold text-gray-700">
                  Forgot Password
                </h2>
                <RxCross1
                  className="text-2xl text-red-600 hover:cursor-pointer hover:bg-red-100 p-1 rounded"
                  onClick={() => navigate("/")}
                />
              </div>
              <div className="h-1 w-full bg-pink-700 mb-4 rounded"></div>

              <form className="space-y-1">
                {/* User ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-0.5">
                    <span className="text-red-600">*</span> Please enter your
                    user ID
                  </label>
                  <input
                    type="text"
                    value={userId}
                    maxLength={50}
                    onChange={(e) => setUserId(e.target.value)}
                    onBlur={() => handleBlur("userId")}
                    className="w-full px-4 py-1  border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <div className="min-h-[1rem]">
                    {touched.userId && !userId.trim() && (
                      <p className="text-red-600 text-sm ">
                        This field is required.
                      </p>
                    )}
                  </div>
                </div>

                {/* Mother's Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-0.5">
                    <span className="text-red-600">*</span> Mother's Name
                  </label>
                  <input
                    type="text"
                    value={motherName}
                    maxLength={100}
                    onChange={(e) => setMotherName(e.target.value)}
                    onBlur={() => handleBlur("motherName")}
                    className="w-full px-4 py-1  border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <div className="min-h-[1rem]">
                    {touched.motherName && !motherName.trim() && (
                      <p className="text-red-600 text-sm ">
                        This field is required.
                      </p>
                    )}
                  </div>
                </div>

                {/* DOB */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-0.5">
                    <span className="text-red-600">*</span> Your Child's Date Of
                    Birth
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    onBlur={() => handleBlur("dob")}
                    className="w-full px-4 py-1  border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <div className="min-h-[1rem]">
                    {touched.dob && !dob && (
                      <p className="text-red-600 text-sm ">
                        This field is required.
                      </p>
                    )}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col md:flex-row justify-center gap-4 mt-2">
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={loading}
                    className={`bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded shadow ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin h-4 w-4 mr-2 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          ></path>
                        </svg>
                        Resetting...
                      </span>
                    ) : (
                      "Reset Password"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-6 rounded shadow"
                  >
                    Login Page
                  </button>
                </div>
              </form>

              <p className="text-sm text-gray-600 mt-3 text-center">
                If you do not remember answers to these questions then please
                enter your userid and click on this link to{" "}
                <button
                  className={`text-blue-600 underline hover:bg-gray-50 hover:text-blue-800 hover:underline-offset-4 hover:shadow-md hover:rounded transition-all duration-200 ease-in-out ${
                    newPasswordLoading ? "cursor-not-allowed opacity-60" : ""
                  }`}
                  onClick={handleSendNewPassword}
                  disabled={newPasswordLoading}
                >
                  {newPasswordLoading
                    ? "Please wait..."
                    : "receive a new password"}
                </button>
                .
              </p>
            </div>
          </div>{" "}
          {newPasswordLoading && (
            <div className="fixed top-0 left-0 w-full h-full bg-transparent backdrop-blur-md z-50 flex items-center justify-center">
              <div className="flex flex-col items-center space-y-4">
                {/* Loader Spinner with Glow */}
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-t-4 border-blue-600 animate-spin"></div>
                  <div className="absolute inset-2 rounded-full border-4 border-blue-200 opacity-50 animate-ping"></div>
                </div>

                {/* Enhanced Message */}
                <p className="text-lg text-blue-700 font-semibold text-center animate-pulse">
                  Please wait — we’re securely sending your new password...
                </p>
              </div>
            </div>
          )}
        </div>{" "}
        <div className="w-full">
          <Footer />
        </div>
        {/* <div className="bg-gray-300 h-10"></div> */}
        {/* Forgot Password Box */}
      </div>{" "}
    </>
  );
};

export default ForgotPassword;
