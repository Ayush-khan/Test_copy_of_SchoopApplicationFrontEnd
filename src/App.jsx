// import "./App.css";
// import Index from "./router/Index";

// function App() {
//   const API_URL = import.meta.env.VITE_API_URL; // url for host

//   return (
//     <div
//       className=" w-screen overflow-x-hidden h-screen "
//       style={{
//         background: "#E61F64",
//       }}
//     >
//       <Index />
//     </div>
//   );
// }

// export default App;
// App.jsx
// import { useEffect, useState } from "react";
// import "./App.css";
// import Index from "./router/Index";

// function App() {
//   const [background, setBackground] = useState("#ffffff");

//   useEffect(() => {
//     const savedBackground = localStorage.getItem("background");
//     if (savedBackground) {
//       setBackground(savedBackground);
//     }
//   }, []);

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
  const [background, setBackground] = useState(
    "linear-gradient(to bottom, #E91E63, #2196F3)"
  );
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchActiveBackground = async () => {
      try {
        const token = localStorage.getItem("authToken"); // Only for auth, not background
        const config = {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        };
        const res = await axios.get(
          `${API_URL}/api/get_activebackgroundcolor`,
          config
        );
        const active = res?.data?.data?.[0];
        if (active?.color_code) {
          setBackground(active.color_code);
        }
      } catch (error) {
        console.error(
          "Failed to fetch active background color:",
          error.message
        );
      }
    };

    fetchActiveBackground();
  }, []);

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
