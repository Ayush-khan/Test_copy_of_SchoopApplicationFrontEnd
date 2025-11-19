import { useState } from "react";
import styles from "../CSS/Navbar.module.css";
import "./styles.css";
import { RxCross1 } from "react-icons/rx";
import { MdMarkEmailRead } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

const UserVerification = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [userId, setUserId] = useState("");
  const [newPasswordLoading, setNewPasswordLoading] = useState(false);
  const [motherName, setMotherName] = useState("");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({
    userId: false,
    motherName: false,
    dob: false,
  });
  const navigate = useNavigate();
  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const isValid = userId.trim();

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
    const monthName = months[today.getMonth()];
    const year = today.getFullYear();
    return `${day} ${monthName} ${year}`;
  }

  const handleResetPassword = async () => {
    setTouched({ userId: true });
    if (!isValid) return;

    setLoading(true);
    setNewPasswordLoading(true);

    try {
      const response = await axios.post(
        `https://api.aceventura.in/evolvuUserService/validate_user`,
        {
          user_id: userId,
        }
      );

      if (response.data && response.data.length > 0) {
        const shortName = response.data[0].short_name;

        // Second API call using shortName
        const secondResponse = await axios.post(
          `https://api.aceventura.in/demo/evolvuUserService/check_user_access`,
          {
            short_name: shortName,
          }
        );

        if (secondResponse.data.success) {
          toast.success("Redirecting...");
        } else {
          toast.error(secondResponse.data.message || "Access denied.");
        }
      } else {
        toast.error("Invalid user or no data returned.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
      setNewPasswordLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div
        className="w-screen min-h-screen overflow-x-hidden flex flex-col justify-between items-center"
        style={{ background: "linear-gradient(to bottom, #E91E63, #2196F3)" }}
      >
        <div className="w-full">
          <div
            className={`${styles.navbar} w-screen flex items-center justify-between px-2 h-12`}
            style={{ background: "#C03078" }}
          >
            <div className="w-full flex justify-between items-center px-1">
              <img
                src="/logoSchoolimg.png"
                alt="Logo"
                className="h-24 relative bottom-2"
              />
              <h1 className="flex-grow text-center text-white font-semibold text-lg lg:text-2xl">
                EvolvU Smart School
              </h1>
              <h1 className="text-lg text-white px-2 hidden lg:block mt-2">
                {getCurrentDate()}
              </h1>
            </div>
          </div>

          <div className="w-full bg-gray-200 h-4"></div>

          <div className="w-full flex justify-center">
            <div className="bg-white shadow-lg border rounded-lg px-8 py-3 w-[90%] md:w-[60%] lg:w-[40%] mt-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-700">
                  User Verification
                </h2>
              </div>

              <div className="h-1 w-full bg-pink-700 mb-4 rounded"></div>

              <form className="space-y-1">
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
                    className="w-full px-4 py-1 border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  {touched.userId && !userId.trim() && (
                    <p className="text-red-600 text-sm">
                      This field is required.
                    </p>
                  )}
                </div>

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
                        Loading...
                      </span>
                    ) : (
                      "Next"
                    )}
                  </button>
                </div>
              </form>

              {newPasswordLoading && (
                <div className="fixed top-0 left-0 w-full h-full bg-transparent backdrop-blur-md z-50 flex items-center justify-center">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative w-16 h-16">
                      <div className="absolute inset-0 rounded-full border-t-4 border-blue-600 animate-spin"></div>
                      <div className="absolute inset-2 rounded-full border-4 border-blue-200 opacity-50 animate-ping"></div>
                    </div>
                    <p className="text-lg text-blue-700 font-semibold text-center animate-pulse">
                      Hang tight — we're taking you to the login page
                      securely...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Inline Footer Component */}
        <footer className="w-full">
          <div
            className="flex flex-col md:flex-row justify-between items-center text-white shadow-lg px-3"
            style={{ backgroundColor: "#2196f3" }}
          >
            <div className="text-sm md:text-base pt-3">
              <p>
                Copyright © 2016-2018{" "}
                <a
                  href="https://www.aceventura.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold hover:underline"
                  style={{ color: "#C03078" }}
                >
                  Aceventura Services
                </a>
                . All rights reserved.
              </p>
            </div>

            <div className="text-sm md:text-base pt-3">
              <a
                href="mailto:supportsacs@aceventura.in"
                className="no-underline text-white flex items-center hover:underline"
              >
                <MdMarkEmailRead className="text-white text-lg mr-2" />
                Contact for app support
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default UserVerification;
