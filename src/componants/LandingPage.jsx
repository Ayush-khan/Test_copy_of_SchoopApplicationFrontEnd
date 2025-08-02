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
  const [newPasswordLoading, setNewPasswordLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ userId: false });
  const [showLandingPage, setShowLandingPage] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);
  const [backendError, setBackendError] = useState("");
  const isValid = userId.trim();
  const API_URL = import.meta.env.VITE_API_URL; // url for host

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
  const handleResetPassword = async () => {
    setTouched({ userId: true });
    if (!isValid) return;

    setLoading(true);
    setNewPasswordLoading(true);
    setBackendError(""); // clear any old error

    try {
      const formData = new FormData();
      formData.append("user_id", userId);

      let shortName = "0";
      let schoolResponse;

      // 🔹 Step 1: Try validate_staff_user API
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
        schoolResponse = staffResponse.data;
      } else {
        // 🔸 Step 2: Fallback to validate_user API
        const userResponse = await axios.post(
          "https://api.aceventura.in/demo/evolvuUserService/validate_user",
          formData
        );

        if (typeof userResponse.data === "string") {
          toast.error(userResponse.data);
          setBackendError(userResponse.data);
          return;
        }

        if (Array.isArray(userResponse.data) && userResponse.data.length > 0) {
          shortName = userResponse.data[0].short_name;
          schoolResponse = userResponse.data;
        } else {
          toast.error("Invalid user.");
          return;
        }
      }

      // ✅ Use connectdatabase API to check access and connect
      const accessFormData = new FormData();
      accessFormData.append("short_name", shortName);

      const connectResponse = await axios.post(
        `${API_URL}/api/connectdatabase`,
        accessFormData
      );
      // pass sort name in header
      // const connectResponse = await axios.post(
      //   `${API_URL}/api/connectdatabase`,
      //   {
      //     header: {
      //       sort_name: shortName,
      //       "content-Type": "application/json",
      //     },
      //   }
      // );

      if (
        typeof connectResponse.data === "object" &&
        connectResponse.data.message == "Connected to school DB using SACS"
      ) {
        toast.success("Redirecting...");
        setTimeout(() => {
          setShowLandingPage(true);
        }, 1000);
      } else {
        toast.error(
          connectResponse.data.message || "Database connection failed."
        );
      }
    } catch (error) {
      const errMsg =
        error.response?.data === "Not a valid user"
          ? "Not a valid user"
          : error.response?.data?.message ||
            "Something went wrong. Please try again.";
      toast.error(errMsg);
      setBackendError(errMsg);
    } finally {
      setLoading(false);
      setNewPasswordLoading(false);
    }
  };

  // const handleResetPassword = async () => {
  //   setTouched({ userId: true });
  //   if (!isValid) return;

  //   setLoading(true);
  //   setNewPasswordLoading(true);
  //   setBackendError(""); // Clear any old error

  //   try {
  //     console.log("API Starting now");

  //     const formData = new FormData();
  //     formData.append("user_id", userId);

  //     const response = await axios.post(
  //       "https://api.aceventura.in/demo/evolvuUserService/validate_user",
  //       formData
  //     );

  //     console.log("validate_user response -->", response);

  //     // 🟥 If response is "Not a valid user"
  //     if (typeof response.data === "string") {
  //       toast.error(response.data);
  //       setBackendError(response.data);
  //       return;
  //     }

  //     // 🟩 If valid array
  //     if (Array.isArray(response.data) && response.data.length > 0) {
  //       const shortName = response.data[0].short_name;

  //       const accessFormData = new FormData();
  //       accessFormData.append("short_name", shortName);

  //       const secondResponse = await axios.post(
  //         "https://api.aceventura.in/demo/evolvuUserService/check_user_access", // ✅ Correct API here
  //         accessFormData
  //       );

  //       if (secondResponse.data.success) {
  //         toast.success("Redirecting...");
  //         setTimeout(() => {
  //           setShowLandingPage(true);
  //         }, 1000);
  //       } else {
  //         toast.error(secondResponse.data.message || "Access denied.");
  //       }
  //     } else {
  //       toast.error("Invalid response.");
  //     }
  //   } catch (error) {
  //     const errMsg =
  //       error.response?.data === "Not a valid user"
  //         ? "Not a valid user"
  //         : error.response?.data?.message ||
  //           "Something went wrong. Please try again.";

  //     toast.error(errMsg);
  //     setBackendError(errMsg);
  //   } finally {
  //     setLoading(false);
  //     setNewPasswordLoading(false);
  //   }
  // };

  if (showLandingPage) {
    // ✅ Landing Page View
    return (
      <div className={loginStyles.loginContainer}>
        <ToastContainer />
        <div
          className={`${loginStyles.loginContainerChild} bg-none lg:h-5/6 lg:flex lg:justify-start`}
        >
          <LoginForm userId={userId} />
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
      </div>
    );
  }

  // ✅ User Verification View
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
                    onChange={(e) => {
                      setUserId(e.target.value);
                      setBackendError(""); // Clear backend error on typing
                    }}
                    onBlur={() => handleBlur("userId")}
                    className="w-full px-4 py-1 border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  {touched.userId && !userId.trim() ? (
                    <p className="text-red-600 text-sm ml-1">
                      This field is required.
                    </p>
                  ) : backendError ? (
                    <p className="text-red-600 text-sm  ml-1">{backendError}</p>
                  ) : null}
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
                      Hang tight — we're taking you to the login page
                      securely...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

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

export default LandingPage;
