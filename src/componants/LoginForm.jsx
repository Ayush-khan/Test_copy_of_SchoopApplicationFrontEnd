import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import LoadingSpinner from "../componants/common/LoadingSpinner.jsx"; // Import the LoadingSpinner component
import styles from "../CSS/LoginForm.module.css";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const toggleShowPassword = () => setShowPassword(!showPassword);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    const API_URL = import.meta.env.VITE_API_URL; // url for host
    e.preventDefault();
    setErrors({});
    setLoading(true); // Set loading to true when form is submitted
    try {
      const response = await axios.post(`${API_URL}/api/login`, {
        user_id: email,
        password: password,
      });
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

        const sessionData = {
          user: response.data.data,
          settings: response.data.settings,
        };
        sessionStorage.setItem("sessionData", JSON.stringify(sessionData));
        navigate("/dashboard");
      } else {
        return;
      }
    } catch (error) {
      // catch (error) {
      //   const newErrors = {};
      //   if (error.response) {
      //     if (error.response.status === 404) {
      //       newErrors.email = "Invalid username";
      //     } else if (error.response.status === 401) {
      //       newErrors.password = "Invalid password";
      //     } else {
      //       newErrors.api = "An unexpected error. Please try again later.";
      //     }
      //   } else {
      //     newErrors.api = "An unexpected error. Please try again later.";
      //   }
      //   setErrors(newErrors);
      // }
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
            message || "An unexpected error occurred. Please try again later.";
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
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter User Id"
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
          {/* <a
            onClick={() => navigate("/forgotPassword")}
            className="text-blue-600 text-sm font-semibold cursor-pointer border-b-2 border-transparent hover:border-blue-800 hover:text-blue-800 transition duration-200 ease-in-out"
          >
            I forgot my password?
          </a> */}
        </div>
        <div className={styles.formFooter}></div>
      </form>
    </div>
  );
};

export default LoginForm;
