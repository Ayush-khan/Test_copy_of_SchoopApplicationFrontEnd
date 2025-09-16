// workin corrct.is correct

// import { Outlet } from "react-router-dom";
// import NavBar from "./NavBar";
// import Footer from "./Footer";
// function MainLayout() {
//   return (
//     <div>
//       <NavBar />
//       <div
//         className=" content w-screen overflow-x-hidden h-screen  pb-4 mt-[10%] pt-[16%] md:pt-1 md:mt-[7%] "
//         // style={{
//         //   background: "   linear-gradient(to bottom, #E91E63, #2196F3)",
//         // }}
//       >
//         <Outlet className=" " />
//       </div>{" "}
//       <div className="">
//         <Footer />
//       </div>
//     </div>
//   );
// }

// export default MainLayout;
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";
import Footer from "./Footer";
import axios from "axios";
import LoadingSpinner from "../componants/common/LoadingSpinner";

function MainLayout() {
  const defaultBackground = "linear-gradient(to bottom, #E91E63, #2196F3)";
  const [background, setBackground] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;

  const getCookie = (name) => {
    const cookieValue = document.cookie
      .split("; ")
      .find((row) => row.startsWith(name + "="));
    return cookieValue ? cookieValue.split("=")[1] : null;
  };

  useEffect(() => {
    const shortName = getCookie("short_name");

    if (!shortName) {
      setBackground(defaultBackground);
      return;
    }

    const fetchActiveBackground = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const config = {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        };

        const res = await axios.get(
          `${API_URL}/api/get_activebackgroundcolor?short_name=${shortName}`,
          config
        );

        const active = res?.data?.data?.[0];

        if (active?.color_code && typeof active.color_code === "string") {
          setBackground(active.color_code);
        } else {
          setBackground(defaultBackground);
        }
      } catch (error) {
        console.error("Failed to fetch background:", error.message);
        setBackground(defaultBackground);
      }
    };

    fetchActiveBackground();
  }, []);

  if (background === null) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-white relative">
        {/* Overlay with blur */}
        <div className="fixed top-0 left-0 w-full h-full bg-white bg-opacity-80 backdrop-blur-sm z-40"></div>

        {/* Loader content */}
        <div className="z-50 flex flex-col items-center space-y-6 px-6">
          {/* Google Meet style minimal avatar / icon animation */}
          <div className="relative w-24 h-24 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>

          {/* Animated dots like Google Meet waiting */}
          <div className="flex space-x-2">
            {[...Array(3)].map((_, i) => (
              <span
                key={i}
                className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              ></span>
            ))}
          </div>

          {/* Engaging Text */}
          <p className="text-center text-blue-800 text-lg font-semibold animate-pulse">
            🚀 Just a moment... Your dashboard is launching!
          </p>

          {/* Optional fun tip/message */}
          <p className="text-sm text-gray-500 text-center max-w-xs">
            Meanwhile, stretch your neck or blink your eyes 👀 — healthy habits
            matter!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-screen h-screen overflow-x-hidden"
      style={{
        background: background,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <NavBar />
      <div className="content w-screen overflow-x-hidden h-screen pb-4 mt-[10%] pt-[16%] md:pt-1 md:mt-[7%]">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

export default MainLayout;
