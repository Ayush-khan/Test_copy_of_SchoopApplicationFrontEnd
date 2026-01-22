import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import LoadingSpinner from "../componants/common/LoadingSpinner.jsx"; // Import the LoadingSpinner component
import styles from "../CSS/LoginForm.module.css";

const LoginForm = ({ userId }) => {
  const API_URL = import.meta.env.VITE_API_URL; // url for host
  const [roleName, setRoleName] = useState("");
  const [appLinks, setAppLinks] = useState([]);
  // const [appLinks, setAppLinks] = useState([]);
  const [currentRoleId, setCurrentRoleId] = useState("");

  const [email, setEmail] = useState(userId || "");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const toggleShowPassword = () => setShowPassword(!showPassword);
  const [rememberMe, setRememberMe] = useState(false); // ✅ NEW
  const [background, setBackground] = useState(null);
  const defaultBackground = "linear-gradient(to bottom, #E91E63, #2196F3)";

  function getAcademicYearLast() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // Jan=1

    let lastYear;
    if (month >= 7) {
      lastYear = year + 1; // July ya baad -> session ka end next year
    } else {
      lastYear = year; // July se pehle -> session ka end current year
    }

    return `2016-${lastYear}`;
  }

  const navigate = useNavigate();
  const getCookie = (name) => {
    const cookieValue = document.cookie
      .split("; ")
      .find((row) => row.startsWith(name + "="));
    return cookieValue ? cookieValue.split("=")[1] : null;
  };
  useEffect(() => {
    fetchUserRole();
    fetchAndSetBackground();
  }, []);

  const fetchAndSetBackground = async () => {
    const sortName = getCookie("short_name");

    // ✅ Agar short_name cookie nahi hai toh default color set karo
    if (!sortName) {
      setBackground(defaultBackground);
      return;
    }

    try {
      const res = await axios.get(`${API_URL}/api/get_activebackgroundcolor`, {
        withCredentials: true,
        params: { short_name: sortName },
      });

      const color = res?.data?.data?.[0]?.color_code;

      if (color && typeof color === "string") {
        // ✅ Save in cookie
        document.cookie = `background_color=${color}; path=/; max-age=86400`;
        setBackground(color);
      } else {
        document.cookie = `background_color=; path=/; max-age=0`;
        setBackground(defaultBackground);
      }
    } catch (error) {
      console.error("Failed to fetch background:", error.message);
      setBackground(defaultBackground);
    }
  };

  const roleNameMap = {
    A: "Admin",
    B: "Bus",
    E: "Data Entry",
    F: "Finance",
    L: "Librarian",
    M: "Management",
    N: "Printer",
    O: "Owner",
    P: "Parent",
    R: "AceVentura Support",
    S: "Student",
    T: "Teacher",
    U: "AceVentura",
    X: "Support Staff",
    Y: "Security",
    CC: "Curriculum Coordinator",
    MA: "Main Admin",
    TM: "Timetable Planner",
  };

  const fetchUserRole = async () => {
    const sortNameCookie = getCookie("short_name");

    try {
      const response = await axios.get(`${API_URL}/api/get_roleofuser`, {
        params: {
          short_name: sortNameCookie,
          user_id: userId,
        },
      });

      const roleId = response.data?.data?.[0]?.role_id;

      if (roleId) {
        setCurrentRoleId(roleId);
        const roleLabel = roleNameMap[roleId] || "User";
        setRoleName(roleLabel);

        const formData = new FormData();
        formData.append("role_id", roleId);

        const postResponse = await axios.post(
          `https://api.aceventura.in/demo/evolvuUserService/get_app_urls`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const apps = postResponse?.data?.data || [];
        const filteredApps = apps.filter((app) => app.role_id === roleId);
        setAppLinks(filteredApps);
      }
    } catch (error) {
      console.error("Error fetching user role or app URLs:", error);
    }
  };

  const handleSubmit = async (e) => {
    const sortNameCookie = getCookie("short_name");
    console.log("sortNameCookie", sortNameCookie);
    e.preventDefault();
    setErrors({});
    setLoading(true); // Set loading to true when form is submitted
    try {
      const response = await axios.post(
        `${API_URL}/api/login`,
        {
          user_id: email,
          password: password,
          rememberme: rememberMe,
          short_name: sortNameCookie,
        },
        {
          withCredentials: true, // ✅ Send browser cookies
        }
      );
      console.log(
        "responseerror",
        response.data.success,
        "and ",
        response.data.status
      );
      const userNotAllowed = {};
      if (response.data.success === false && response.data.status === 403) {
        userNotAllowed.onlyAdminAllowError = response.data.message;
        setErrors(userNotAllowed);
        console.log("userNotAllowed", userNotAllowed);
        console.log("setErros", errors.onlyAdminAllowError);

        return;
      }

      console.log("the message of the response of the login", response);

      if (response.status === 200) {
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem(
          "academic_yr_from",
          response?.data?.userdetails?.settings?.academic_yr_from
        );
        localStorage.setItem(
          "academic_yr_to",
          response?.data?.userdetails?.settings?.academic_yr_to
        );
        const sessionData = {
          user: response.data.data,
          settings: response.data.settings,
        };
        sessionStorage.setItem("sessionData", JSON.stringify(sessionData));
        navigate("/dashboard");
        return;
      } else {
        return;
      }
    } catch (error) {
      const newErrors = {};

      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message;

        if (status === 404) {
          newErrors.email = "Invalid username";
        } else if (status === 401) {
          newErrors.password = "Invalid password";
        } else if (
          message === "This password does not use the Bcrypt algorithm."
        ) {
          newErrors.password = "This password not using Bcrypt encryption.";
        } else {
          newErrors.api =
            error.response.data.error ||
            message ||
            "An unexpected error occurred. Please try again later.";
        }
      } else {
        newErrors.api = "Network error or server is unreachable.";
      }

      setErrors(newErrors);
    } finally {
      setLoading(false); // Set loading to false after the request is complete
    }
  };

  return (
    <div className={styles.loginForm}>
      <h2>Log-In</h2>
      <p>Enter your details to login to your account</p>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <div className={styles.inputWrapper}>
            <FontAwesomeIcon icon={faUser} className={styles.userIcon} />
            <input
              type="text"
              readOnly={!!userId} // Make input read-only if userId is provided
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter User Id"
              className={`
    ${userId ? "bg-gray-600  cursor-not-allowed" : "bg-gray-600 "}
    focus:outline-none focus:ring-2 focus:ring-blue-400`}
              required
            />
          </div>
          {errors.email && <span className={styles.error}>{errors.email}</span>}
        </div>
        <div className={styles.formGroup}>
          <div className={styles.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className={`
   
    focus:outline-none focus:ring-2 focus:ring-blue-400`}
            />
            <FontAwesomeIcon
              icon={showPassword ? faEyeSlash : faEye}
              className={styles.eyeIcon}
              onClick={toggleShowPassword}
            />
          </div>
          {errors.password && (
            <div
              className={`${styles.error} text-center w-[90%] mx-auto  text-nowrap text-xs`}
            >
              {errors.password}
            </div>
          )}
        </div>
        {errors.onlyAdminAllowError && (
          <div
            className={`${styles.error} text-center w-[90%] mx-auto relative -top-4 text-nowrap text-xs`}
          >
            {errors.onlyAdminAllowError}
          </div>
        )}

        {errors.api && (
          <span
            className={`${styles.error} text-center relative -left-3  text-nowrap text-xs`}
          >
            {errors.api}
          </span>
        )}
        <div className="flex items-center ml-3 mb-0.5 ">
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="mr-1"
          />
          <label
            htmlFor="rememberMe"
            // className="text-sm font-medium text-gray-700"
            className={`text-sm font-medium text-gray-900  `}
          >
            Remember me
          </label>
        </div>
        <button
          type="submit"
          className={`${styles.loginButton} flex place-items-center justify-center`}
          disabled={loading}
        >
          {loading ? <LoadingSpinner /> : "Login"}
        </button>
        <div
          className={`${styles.forgotPassword} w-full flex justify-center items-center mx-auto `}
        >
          <a
            onClick={() => navigate("/forgotPassword")}
            className="text-blue-600 text-sm font-semibold cursor-pointer border-b-2 border-transparent hover:border-blue-800 hover:text-blue-800 transition duration-200 ease-in-out"
          >
            I forgot my password?
          </a>
        </div>
        <div className={styles.formFooter}></div>
      </form>

      {/* ✅ App download links section */}
      {appLinks.length > 0 && (
        <div className=" text-center bg-white rounded-xl  shadow-md border border-gray-200">
          {/* Title first */}
          <h6 className=" font-semibold text-gray-800 mt-2">
            {roleName} app is now available in{" "}
            <span className="text-lg">📱</span>
          </h6>

          {/* App badges in a strict horizontal row */}
          <div className="flex flex-row justify-center items-center gap-y-4">
            {appLinks.map((app) => (
              <a
                key={app.app_id}
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all duration-200 hover:scale-105 hover:bg-gray-100 rounded-lg p-1"
              >
                <img
                  src={
                    app.type === "android"
                      ? "https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                      : "https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                  }
                  alt={`${roleName} ${app.type} app`}
                  className="h-10 object-contain"
                />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
