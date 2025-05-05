import { useState } from "react";
import styles from "../CSS/Navbar.module.css";
import "./styles.css";
import Footer from "./Footer";
import { RxCross1 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [userId, setUserId] = useState("");
  const [motherName, setMotherName] = useState("");
  const [dob, setDob] = useState("");
  const navigate = useNavigate();
  const [touched, setTouched] = useState({
    userId: false,
    motherName: false,
    dob: false,
  });
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  const academicYearIs = `${currentYear} - ${nextYear}`;
  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const isValid = userId.trim() && motherName.trim() && dob;

  const handleResetPassword = () => {
    if (!isValid) return;
    console.log({ userId, motherName, dob });
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
    const monthIndex = today.getMonth();
    const year = String(today.getFullYear()).slice();

    const monthName = months[monthIndex];

    return `${day} ${monthName} ${year}`;
  }

  return (
    <>
      <div
        className=" w-screen overflow-x-hidden h-screen flex flex-col items-center"
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
                  St. Arnold's Central School ({academicYearIs})
                </h1>
              </div>

              <div className="text-sm text-gray-700">
                <h1 className="text-lg lg:text-sm text-white px-2 hidden lg:block mt-2">
                  {getCurrentDate()}
                </h1>
              </div>
            </div>
          </div>
        </div>
        {/* <div className="bg-gray-300 h-10"></div> */}
        <div className="w-full  bg-gray-200 mb-4 h-2" />

        {/* Forgot Password Box */}
        <div className=" card md:w-[50%] mx-auto bg-white border shadow-lg w-full   rounded-md">
          <div className=" card-header mb-4 flex justify-between items-center ">
            <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
              Forgot Password
            </h5>
            <RxCross1
              className=" relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
              onClick={() => {
                navigate("/");
              }}
            />
          </div>
          <div
            className=" relative w-[98%]   -top-6 h-1  mx-auto bg-red-700"
            style={{
              backgroundColor: "#C03078",
            }}
          ></div>
          {/* <div className="bg-blue-600 text-white text-center text-lg py-2 font-semibold mb-6">
            Forgot Password
          </div> */}

          <form className=" p-6 space-y-4">
            {/* User ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <span className="text-red-600">*</span> Please enter your user
                id
              </label>
              <input
                type="text"
                value={userId}
                maxLength={50}
                onChange={(e) => setUserId(e.target.value)}
                onBlur={() => handleBlur("userId")}
                className="w-full mt-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {touched.userId && !userId.trim() && (
                <p className="text-red-600 text-sm mt-1">
                  This field is required.
                </p>
              )}
            </div>

            {/* Mother's Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <span className="text-red-600">*</span> Mother's name
              </label>
              <input
                type="text"
                value={motherName}
                maxLength={100}
                onChange={(e) => setMotherName(e.target.value)}
                onBlur={() => handleBlur("motherName")}
                className="w-full mt-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {touched.motherName && !motherName.trim() && (
                <p className="text-red-600 text-sm mt-1">
                  This field is required.
                </p>
              )}
            </div>

            {/* DOB */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <span className="text-red-600">*</span> Your child's Date Of
                Birth
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                onBlur={() => handleBlur("dob")}
                className="w-full mt-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {touched.dob && !dob && (
                <p className="text-red-600 text-sm mt-1">
                  This field is required.
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-center gap-4 mt-4">
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={!isValid}
                className={`px-4 py-2 rounded text-white transition ${
                  isValid
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                Reset password
              </button>

              <button
                type="button"
                onClick={() => console.log("Go to login page")}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
              >
                Login Page
              </button>
            </div>
          </form>

          <p className="text-sm text-gray-600 mt-6 text-center">
            If you do not remember answers to these questions then please enter
            your userid and click on this link to{" "}
            <button
              className="text-blue-600 underline hover:text-blue-800"
              onClick={() => console.log("Send new password link")}
            >
              receive a new password
            </button>
          </p>
        </div>
      </div>{" "}
      <Footer />
    </>
  );
};

export default ForgotPassword;
