// // // //this is responsive
// import React, { useState, useEffect } from "react";
// import LoginForm from "./LoginForm";
// import { useNavigate } from "react-router-dom";
// import styles from "../CSS/LoginParent.module.css";
// import Notification from "./Notification";
// import { IoArrowUndoCircle } from "react-icons/io5";

// const LandingPage = () => {
//   const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const handleResize = () => {
//       setIsMobileView(window.innerWidth <= 768);
//     };

//     window.addEventListener("resize", handleResize);
//     return () => {
//       window.removeEventListener("resize", handleResize);
//     };
//   }, []);

//   const showNotificationPage = () => {
//     navigate("/notification");
//   };

//   return (
//     <div className={styles.loginContainer}>
//       <div
//         className={`${styles.loginContainerChild} bg-none lg:h-5/6 lg:flex lg:justify-start`}
//       >
//         <LoginForm />
//         {isMobileView && (
//           <button
//             className={`${styles.notificationButton}  flex justify-between`}
//             onClick={showNotificationPage}
//           >
//             <span>
//               <IoArrowUndoCircle fontSize={"1.5em"} />
//             </span>{" "}
//             Gerneral Instruction
//           </button>
//         )}
//       </div>
//       {!isMobileView && (
//         <div
//           className={`${styles.notificationContainer}  flex lg:justify-end lg:w-full lg:h-5/6`}
//         >
//           <Notification />
//         </div>
//       )}
//     </div>
//   );
// };

// export default LandingPage;
import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../CSS/Navbar.module.css";
import loginStyles from "../CSS/LoginParent.module.css";
import Notification from "./Notification";
import LoginForm from "./LoginForm";
import { ToastContainer, toast } from "react-toastify";
import { MdMarkEmailRead } from "react-icons/md";
import { IoArrowUndoCircle } from "react-icons/io5";

const LandingPage = () => {
  const [userId, setUserId] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [schoolImageUrl, setSchoolImageUrl] = useState("");
  const [newPasswordLoading, setNewPasswordLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ userId: false });
  const [showLandingPage, setShowLandingPage] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);
  const [backendError, setBackendError] = useState("");
  const isValid = userId.trim();
  const API_URL = import.meta.env.VITE_API_URL; // url for host
  const expiryDate = new Date();
  const [sortNameIs, setSortNameIs] = useState("");
  const [supportEmail, setSupportEmail] = useState("supportsacs@aceventura.in");
  // Academic year helper

  function getAcademicYearLast() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // January = 1

    let lastYear;
    if (month >= 7) {
      lastYear = year + 1; // July or later, academic year ends next year
    } else {
      lastYear = year; // Before July, academic year ends current year
    }

    return `2016-${lastYear}`;
  }

  expiryDate.setDate(expiryDate.getDate() + 1); // 1 day later
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const getCookie = (name) => {
    const cookieValue = document.cookie
      .split("; ")
      .find((row) => row.startsWith(name + "="));
    return cookieValue ? cookieValue.split("=")[1] : null;
  };
  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

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

  const fetchSchoolImages = async (shortName) => {
    const sortNameCookie = getCookie("short_name");

    try {
      const response = await axios.get(`${API_URL}/api/get_backgroundimage`, {
        params: { short_name: sortNameCookie },
      });

      const { logo, school_image } = response.data?.data || {};
      setLogoUrl(logo || "");
      setSchoolImageUrl(school_image || "");
    } catch (error) {
      console.error("Error fetching logo and background image:", error);
    }
  };

  const setShortNameCookieFromUserId = async (userId, API_URL) => {
    const formData = new FormData();
    formData.append("user_id", userId);

    let shortName = "0";

    // Step 1: validate_staff_user
    const staffResponse = await axios.post(
      "https://api.aceventura.in/demo/evolvuUserService/validate_staff_user",
      formData
    );

    if (
      Array.isArray(staffResponse.data) &&
      staffResponse.data.length > 0 &&
      staffResponse.data[0].short_name !== "0"
    ) {
      shortName = staffResponse.data[0].short_name;
    } else {
      // Step 2: fallback to validate_user
      const userResponse = await axios.post(
        "https://api.aceventura.in/demo/evolvuUserService/validate_user",
        formData
      );

      if (typeof userResponse.data === "string") {
        throw new Error(userResponse.data);
      }

      if (Array.isArray(userResponse.data) && userResponse.data.length > 0) {
        shortName = userResponse.data[0].short_name;
        setSortNameIs(shortName);
        // await fetchSchoolImages(shortName); // ✅ Fetch and store logo/bg
      } else {
        throw new Error("Invalid user.");
      }
    }

    // Connect to DB
    const accessFormData = new FormData();
    accessFormData.append("short_name", shortName);

    const connectResponse = await axios.post(
      `${API_URL}/api/connectdatabase`,
      accessFormData,
      { withCredentials: true }
    );

    if (
      !connectResponse.data.message ||
      connectResponse.data.message !== "Connected to school DB"
    ) {
      throw new Error(connectResponse.data.message || "Connection failed");
    }

    // Set cookie manually with expiry
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7); // 7 days expiry
    document.cookie = `short_name=${shortName}; path=/; expires=${expiryDate.toUTCString()}; SameSite=None; Secure`;
    // ✅ Call support email API only after DB is connected
    try {
      const response = await axios.get(`${API_URL}/api/get_supportemailid`, {
        params: { short_name: shortName },
      });
      if (response.data?.data?.support_email_id) {
        setSupportEmail(response.data.data.support_email_id);
      }
    } catch (error) {
      console.error("Failed to fetch support email", error);
    }
  };

  const handleResetPassword = async () => {
    setTouched({ userId: true });
    if (!isValid) return;

    setLoading(true);
    setNewPasswordLoading(true);
    setBackendError("");

    try {
      await setShortNameCookieFromUserId(userId, API_URL);
      await fetchSchoolImages(sortNameIs);
      toast.success("Redirecting...");
      setTimeout(() => {
        setShowLandingPage(true);
      }, 1000);
    } catch (error) {
      const errMsg =
        error.response?.data === "Not a valid user"
          ? "Not a valid user"
          : error.message ||
            error.response?.data?.message ||
            "Something went wrong. Please try again.";
      toast.error(errMsg);
      setBackendError(errMsg);
    } finally {
      setLoading(false);
      setNewPasswordLoading(false);
    }
  };

  // if (showLandingPage) {
  //   // ✅ Landing Page View
  //   return (
  //     <div className={loginStyles.loginContainer}>
  //       <ToastContainer />
  //       <div
  //         className={`${loginStyles.loginContainerChild} bg-none lg:h-5/6 lg:flex lg:justify-start`}
  //       >
  //         <LoginForm userId={userId} />
  //         {isMobileView && (
  //           <button
  //             className={`${loginStyles.notificationButton} flex justify-between`}
  //             onClick={() => toast.info("Instruction clicked")}
  //           >
  //             <span>
  //               <IoArrowUndoCircle fontSize={"1.5em"} />
  //             </span>{" "}
  //             General Instruction
  //           </button>
  //         )}

  //       </div>
  //       {!isMobileView && (
  //         <div
  //           className={`${loginStyles.notificationContainer} flex lg:justify-end lg:w-full lg:h-5/6`}
  //         >
  //           <Notification />
  //         </div>
  //       )}

  //     </div>

  //   );
  // }

  if (showLandingPage) {
    // ✅ Landing Page View
    return (
      <div
        className={loginStyles.loginContainer}
        style={{
          background: `url(${
            schoolImageUrl || "/default-bg.jpg"
          }) center center/cover no-repeat fixed`,
        }}
      >
        <ToastContainer />
        <div
          className={`${loginStyles.loginContainerChild} bg-none lg:h-5/6 lg:flex lg:justify-start`}
        >
          {/* <LoginForm userId={userId} /> */}
          <LoginForm userId={userId} sortName={sortNameIs} />

          {isMobileView && (
            <button
              className={`${loginStyles.notificationButton} flex justify-between`}
              onClick={() => toast.info("Instruction clicked")}
            >
              <span>
                <IoArrowUndoCircle fontSize={"1.5em"} />
              </span>{" "}
              General Instruction
            </button>
          )}
        </div>
        {!isMobileView && (
          <div
            className={`${loginStyles.notificationContainer} flex lg:justify-end lg:w-full lg:h-5/6`}
          >
            <Notification />
          </div>
        )}

        {/* Footer Added Here */}
        <footer className="w-full   absolute top-[93%]">
          <div className="flex flex-col md:flex-row justify-between items-center text-white/90 shadow-lg px-3 py-2 bg-white/20 backdrop-blur-md">
            <div className="text-sm md:text-base h-7">
              <p>
                Copyright © {getAcademicYearLast()}{" "}
                <a
                  href="https://www.aceventura.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold hover:underline text-pink-300"
                >
                  Aceventura Services
                </a>
                . All rights reserved.
              </p>
            </div>
            <div className="text-sm md:text-base h-7">
              <a
                href="mailto:aceventuraservices@gmail.com"
                className="no-underline text-white/90 flex items-center hover:underline"
              >
                <MdMarkEmailRead className="text-white text-lg mr-2" />
                Contact for app support
              </a>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <>
      <ToastContainer />
      <div
        className="w-screen min-h-screen overflow-x-hidden flex flex-col"
        style={{
          background:
            "url('https://as2.ftcdn.net/v2/jpg/02/10/61/87/1000_F_210618714_3ZKXkZ1ZkYxvZJ0vYg7ZJZJZJZJZJZJZ.jpg') no-repeat center center fixed",
          backgroundSize: "cover",
        }}
      >
        {/* Navbar */}
        <div className="w-full">
          <div
            className={`${styles.navbar} w-screen flex items-center justify-between px-2 h-12 text-white shadow-lg py-2 bg-white/20 backdrop-blur-md`}
          >
            <div className="w-full flex justify-between items-center px-1">
              <img
                src="/logoSchoolimg.png"
                alt="Logo"
                className="h-24 relative bottom-2"
              />
              {/* <img
                src={schoolImageUrl}
                alt="Logo"
                className="h-24 relative bottom-2 object-contain"
              /> */}
              <h1 className="flex-grow text-center text-yellow-100 font-semibold text-[2em] ">
                EvolvU Smart School
              </h1>
              <h1 className="text-md text-gray-300 px-2 hidden lg:block mt-2 text-lg">
                {getCurrentDate()}
              </h1>
            </div>
          </div>
        </div>

        {/* Centered Form Section */}
        <div className="flex-1 flex items-center justify-center relative bottom-8 px-4 ">
          <div className="bg-white/90 backdrop-blur-md shadow-lg border rounded-lg px-8 py-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold text-gray-700">
                User Verification
              </h2>
            </div>

            <div className="h-1 w-full bg-pink-700 mb-4 rounded"></div>

            <form
              className="space-y-1"
              onSubmit={(e) => {
                e.preventDefault();
                handleResetPassword();
              }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-0.5">
                  <span className="text-red-600">*</span> Please enter your user
                  ID
                </label>
                <input
                  type="text"
                  value={userId}
                  maxLength={50}
                  onChange={(e) => {
                    setUserId(e.target.value);
                    setBackendError("");
                  }}
                  onBlur={() => handleBlur("userId")}
                  className="w-full px-4 py-1 border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                {touched.userId && !userId.trim() ? (
                  <p className="text-red-600 text-sm ml-1">
                    This field is required.
                  </p>
                ) : backendError ? (
                  <p className="text-red-600 text-sm ml-1">{backendError}</p>
                ) : null}
              </div>

              <div className="flex flex-col md:flex-row justify-center gap-4 mt-2">
                <button
                  type="submit"
                  onClick={handleResetPassword}
                  disabled={loading}
                  className={`bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded shadow ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? "Loading..." : "Next"}
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
                    Hang tight — we're taking you to the login page securely...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Glassy Footer */}
        <footer className="w-full">
          <div className="flex flex-col md:flex-row justify-between items-center text-white/90 shadow-lg px-3 py-2 bg-white/20 backdrop-blur-md">
            <div className="text-sm md:text-base h-5">
              <p>
                {/* Copyright © 2016-2018{" "} */}
                Copyright © {getAcademicYearLast()}{" "}
                <a
                  href="https://www.aceventura.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold hover:underline text-pink-300"
                >
                  Aceventura Services
                </a>
                . All rights reserved.
              </p>
            </div>
            <div className="text-sm md:text-base h-5">
              <a
                href={`mailto:aceventuraservices@gmail.com`}
                className="no-underline text-white/90 flex items-center hover:underline"
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

export default LandingPage;
