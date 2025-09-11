// import { useEffect, useState } from "react";
// import "./App.css";
// import Index from "./router/Index";
// import axios from "axios";

// function App() {
//   const defaultBackground = "linear-gradient(to bottom, #E91E63, #2196F3)";
//   const [background, setBackground] = useState(null); // initially null
//   const API_URL = import.meta.env.VITE_API_URL;
//   const getCookie = (name) => {
//     const cookieValue = document.cookie
//       .split("; ")
//       .find((row) => row.startsWith(name + "="));
//     return cookieValue ? cookieValue.split("=")[1] : null;
//   };

//   // useEffect(() => {
//   //   const fetchActiveBackground = async () => {
//   //     try {
//   //       const token = localStorage.getItem("authToken");
//   //       const config = {
//   //         headers: { Authorization: `Bearer ${token}` },
//   //         withCredentials: true,
//   //       };

//   //       const res = await axios.get(
//   //         `${API_URL}/api/get_activebackgroundcolor`,
//   //         config
//   //       );

//   //       const active = res?.data?.data?.[0];

//   //       if (active?.color_code && typeof active.color_code === "string") {
//   //         setBackground(active.color_code); // ✅ only set if valid
//   //       } else {
//   //         setBackground(defaultBackground); // fallback
//   //       }
//   //     } catch (error) {
//   //       console.error("Failed to fetch background:", error.message);
//   //       setBackground(defaultBackground); // fallback
//   //     }
//   //   };

//   //   fetchActiveBackground();
//   // }, []);
//   useEffect(() => {
//     const fetchActiveBackground = async () => {
//       const sortNameCookie = getCookie("short_name");

//       try {
//         const token = localStorage.getItem("authToken");
//         const config = {
//           headers: { Authorization: `Bearer ${token}` },
//           withCredentials: true,
//           params: { sort_name: sortNameCookie }, // <-- pass sort_name here
//         };

//         const res = await axios.get(
//           `${API_URL}/api/get_activebackgroundcolor`,
//           config
//         );

//         const active = res?.data?.data?.[0];

//         if (active?.color_code && typeof active.color_code === "string") {
//           setBackground(active.color_code); // ✅ only set if valid
//         } else {
//           setBackground(defaultBackground); // fallback
//         }
//       } catch (error) {
//         console.error("Failed to fetch background:", error.message);
//         setBackground(defaultBackground); // fallback
//       }
//     };

//     fetchActiveBackground();
//   }, []);

//   // ✅ Wait until background is set before rendering
//   if (background === null) return null;

//   return (
//     <div
//       className="w-screen h-screen overflow-x-hidden"
//       style={{
//         background: background,
//         backgroundSize: "cover",
//         backgroundRepeat: "no-repeat",
//       }}
//     >
//       <Index />
//     </div>
//   );
// }

// export default App;

import { useEffect, useState } from "react";
import "./App.css";
import Index from "./router/Index";

function App() {
  // const defaultBackground = "linear-gradient(to bottom, #E91E63, #2196F3)";
  const [background, setBackground] = useState(null);

  const getCookie = (name) => {
    const cookieValue = document.cookie
      .split("; ")
      .find((row) => row.startsWith(name + "="));
    return cookieValue ? decodeURIComponent(cookieValue.split("=")[1]) : null;
  };

  useEffect(() => {
    const bg = getCookie("bg_color");
    if (bg) {
      setBackground(bg);
    } else {
      // setBackground(defaultBackground);
      console.log("No bg_color cookie found");
    }
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
      <Index />
    </div>
  );
}

export default App;
