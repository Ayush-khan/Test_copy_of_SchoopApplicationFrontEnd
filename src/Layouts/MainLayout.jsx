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

  if (background === null) return null;

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
