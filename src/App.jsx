// // woking well but  no cahes  handle  in this in the below file cahses are  handle
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
import { useEffect, useState } from "react";
import "./App.css";
import Index from "./router/Index";
import axios from "axios";

function App() {
  const defaultBackground = "linear-gradient(to bottom, #E91E63, #2196F3)";
  const [background, setBackground] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;

  const getCookie = (name) => {
    const cookieValue = document.cookie
      .split("; ")
      .find((row) => row.startsWith(name + "="));
    return cookieValue ? cookieValue.split("=")[1] : null;
  };

  // ✅ Step 1: Clear caches + service worker at app start
  const clearAllCaches = async () => {
    try {
      // 🔹 Clear browser cache storage (for PWA/Vite/CRA)
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
        console.log("✅ App caches cleared");
      }

      // 🔹 Unregister old service workers (avoid stale builds)
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const reg of regs) await reg.unregister();
        console.log("✅ Service workers unregistered");
      }

      // 🔹 Clean axios cache headers globally
      axios.defaults.headers.common["Cache-Control"] = "no-cache";
      axios.defaults.headers.common["Pragma"] = "no-cache";
      axios.defaults.headers.common["Expires"] = "0";
    } catch (err) {
      console.warn("Cache clear failed:", err);
    }
  };

  useEffect(() => {
    clearAllCaches(); // ✅ run on app load (once)
  }, []);

  // ✅ Step 2: Fetch background color (optimized)
  useEffect(() => {
    const shortNameFromCookie = getCookie("short_name");
    if (!shortNameFromCookie) {
      setBackground(defaultBackground);
      return;
    }

    const fetchActiveBackground = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No auth token");

        // fresh, no-cache request
        const res = await axios.get(
          `${API_URL}/api/get_activebackgroundcolor?short_name=${shortNameFromCookie}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
              Expires: "0",
            },
            withCredentials: true,
          }
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

    // Run in microtask for faster mount
    requestIdleCallback(fetchActiveBackground);
  }, []);

  // ✅ Step 3: Basic optimization — hide render until ready
  if (background === null) return null;

  return (
    <div
      className="w-screen h-screen overflow-x-hidden"
      style={{
        background: background,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        transition: "background 0.3s ease-in-out", // smooth visual feel
      }}
    >
      <Index />
    </div>
  );
}

export default App;
