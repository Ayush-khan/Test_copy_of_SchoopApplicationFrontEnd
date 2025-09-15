// // import { useEffect, useState } from "react";
// // import "./App.css";
// // import Index from "./router/Index";
// // import axios from "axios";

// // function App() {
// //   const defaultBackground = "linear-gradient(to bottom, #E91E63, #2196F3)";
// //   const [background, setBackground] = useState(null); // initially null
// //   const API_URL = import.meta.env.VITE_API_URL;

// //   useEffect(() => {
// //     const fetchActiveBackground = async () => {
// //       try {
// //         const token = localStorage.getItem("authToken");
// //         const config = {
// //           headers: { Authorization: `Bearer ${token}` },
// //           withCredentials: true,
// //         };

// //         const res = await axios.get(
// //           `${API_URL}/api/get_activebackgroundcolor`,
// //           config
// //         );

// //         const active = res?.data?.data?.[0];

// //         if (active?.color_code && typeof active.color_code === "string") {
// //           setBackground(active.color_code); // ✅ only set if valid
// //         } else {
// //           setBackground(defaultBackground); // fallback
// //         }
// //       } catch (error) {
// //         console.error("Failed to fetch background:", error.message);
// //         setBackground(defaultBackground); // fallback
// //       }
// //     };

// //     fetchActiveBackground();
// //   }, []);

// //   // ✅ Wait until background is set before rendering
// //   if (background === null) return null;

// //   return (
// //     <div
// //       className="w-screen h-screen overflow-x-hidden"
// //       style={{
// //         background: background,
// //         backgroundSize: "cover",
// //         backgroundRepeat: "no-repeat",
// //       }}
// //     >
// //       <Index />
// //     </div>
// //   );
// // }

// // export default App;
// import { useEffect, useState } from "react";
// import "./App.css";
// import Index from "./router/Index";
// import axios from "axios";

// function App() {
//   const defaultBackground = "linear-gradient(to bottom, #E91E63, #2196F3)";
//   const [background, setBackground] = useState(null);
//   const API_URL = import.meta.env.VITE_API_URL;

//   const getCookie = (name) => {
//     const cookieValue = document.cookie
//       .split("; ")
//       .find((row) => row.startsWith(name + "="));
//     return cookieValue ? cookieValue.split("=")[1] : null;
//   };

//   useEffect(() => {
//     const shortNameFromCookie = getCookie("short_name");
//     // const shortNameFromStorage = localStorage.getItem("short_name");

//     const shortName = shortNameFromCookie;

//     if (!shortName) {
//       // ❌ No DB connection or login done, skip API call
//       setBackground(defaultBackground);
//       return;
//     }

//     const fetchActiveBackground = async () => {
//       try {
//         const token = localStorage.getItem("authToken");
//         const config = {
//           headers: { Authorization: `Bearer ${token}` },
//           withCredentials: true,
//         };

//         const res = await axios.get(
//           `${API_URL}/api/get_activebackgroundcolor?short_name=${shortName}`,
//           config
//         );

//         const active = res?.data?.data?.[0];

//         if (active?.color_code && typeof active.color_code === "string") {
//           setBackground(active.color_code);
//         } else {
//           setBackground(defaultBackground);
//         }
//       } catch (error) {
//         console.error("Failed to fetch background:", error.message);
//         setBackground(defaultBackground);
//       }
//     };

//     fetchActiveBackground();
//   }, []);

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

// Simple file
import "./App.css";
import Index from "./router/Index";

function App() {
  return <Index />;
}

export default App;
