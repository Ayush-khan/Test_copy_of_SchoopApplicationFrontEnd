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
import { useEffect, useState } from "react";
import "./App.css";
import Index from "./router/Index";

function App() {
  const [background, setBackground] = useState("#ffffff");

  useEffect(() => {
    const savedBackground = localStorage.getItem("background");
    if (savedBackground) {
      setBackground(savedBackground);
    }
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

// import { useEffect, useState } from "react";
// import "./App.css";
// import Index from "./router/Index";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// function App() {
//   const API_URL = import.meta.env.VITE_API_URL;
//   const navigate = useNavigate();

//   const [background, setBackground] = useState(null); // ❌ No hardcoded background
//   const [selectedColorId, setSelectedColorId] = useState(null);
//   const [selectedColorCode, setSelectedColorCode] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [flatColors, setFlatColors] = useState([]);
//   const [gradientColors, setGradientColors] = useState([]);
//   const [isLoading, setIsLoading] = useState(false); // ✅ Loader state

//   useEffect(() => {
//     fetchActiveBackground();
//     fetchBackgroundColors();
//   }, []);
//   const cleanColorCode = (code) => {
//     if (!code) return "";
//     if (code.startsWith("linear-gradient") && !code.trim().endsWith(")")) {
//       return code + ")";
//     }
//     return code;
//   };

//   // ✅ 1. Fetch active background color from updated API response format
//   const fetchActiveBackground = async () => {
//     const token = localStorage.getItem("authToken");
//     if (!token) {
//       console.error("No authentication token found");
//       navigate("/");
//       return;
//     }

//     try {
//       const config = {
//         headers: { Authorization: `Bearer ${token}` },
//         withCredentials: true,
//       };

//       const response = await axios.get(
//         `${API_URL}/api/get_activebackgroundcolor`,
//         config
//       );
//       const active = response?.data?.data?.[0]; // ✅ Response is an array
//       if (active) {
//         setBackground(active.color_code);
//         console.log("Active background color:", background);
//         setSelectedColorId(active.background_color_id);
//         setSelectedColorCode(active.color_code);
//       }
//     } catch (err) {
//       console.error("Failed to fetch active background color:", err.message);
//     }
//   };

//   // ✅ 2. Fetch all background colors
//   const fetchBackgroundColors = async () => {
//     try {
//       const token = localStorage.getItem("authToken");
//       const config = {
//         headers: { Authorization: `Bearer ${token}` },
//         withCredentials: true,
//       };
//       const response = await axios.get(
//         `${API_URL}/api/get_allbackgoundcolor`,
//         config
//       );
//       const { flat_colors, gradient_color } = response?.data?.data || {};
//       setFlatColors(flat_colors);
//       setGradientColors(gradient_color);
//     } catch (err) {
//       console.error("Failed to fetch background colors:", err.message);
//     }
//   };

//   // ✅ 3. Apply new background color with button loader & updated fetch
//   const applyBackground = async () => {
//     if (!selectedColorId) return;

//     setIsLoading(true);
//     try {
//       const token = localStorage.getItem("authToken");
//       const config = {
//         headers: { Authorization: `Bearer ${token}` },
//         withCredentials: true,
//       };

//       // Apply to UI immediately
//       setBackground(cleanColorCode(selectedColorCode)); // ✅ visual update
//       console.log("Applying color:", cleanColorCode(selectedColorCode));

//       // Update backend
//       await axios.put(
//         `${API_URL}/api/update_backgroundcoloractive/${selectedColorId}`,
//         { background_color_id: selectedColorId },
//         config
//       );

//       // Optionally refresh from server
//       await fetchActiveBackground();

//       setShowModal(false);
//     } catch (err) {
//       console.error("Failed to update background:", err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div
//       className=" content w-screen overflow-x-hidden h-screen  "
//       style={{ background: background || "#ffffff" }}
//     >
//       <button
//         onClick={() => setShowModal(true)}
//         className="fixed top-4 right-4 px-4 py-2 bg-white text-black rounded shadow hover:bg-gray-300 transition z-50"
//         style={{
//           background: background || "#ffffff", // fallback to white if null
//           backgroundSize: "cover", // makes gradient/full-screen backgrounds look right
//           backgroundRepeat: "no-repeat",
//         }}

//         // style={
//         //   typeof background === "string"
//         //     ? background.startsWith("linear-gradient")
//         //       ? { background }
//         //       : { backgroundColor: background }
//         //     : {}
//         // }
//       >
//         Change Backgrounds
//       </button>

//       {/* 🔵 Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 z-[9998] flex items-center justify-center">
//           <div className="bg-white w-[90%] max-w-2xl p-6 rounded shadow-lg max-h-[90vh] overflow-y-auto">
//             <h2 className="text-xl font-bold mb-4">Select Background Color</h2>

//             <h3 className="font-semibold text-lg mb-2">🎨 Flat Colors</h3>
//             <div className="grid grid-cols-3 gap-4 mb-6">
//               {flatColors.map((color) => (
//                 <div className="relative" key={color.background_color_id}>
//                   <button
//                     onClick={() => {
//                       setSelectedColorId(color.background_color_id);
//                       setSelectedColorCode(color.color_code);
//                     }}
//                     style={{ background: color.color_code }}
//                     className={`h-12 w-full rounded-lg transition-all duration-300 transform ${
//                       selectedColorId === color.background_color_id
//                         ? "scale-110 ring-4 ring-pink-500 border-2 border-white shadow-xl z-10"
//                         : "hover:scale-105 hover:ring-2 hover:ring-gray-400"
//                     }`}
//                     title={color.name}
//                   />
//                   {selectedColorId === color.background_color_id && (
//                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//                       <span className="text-white text-xl font-bold drop-shadow-md">
//                         ✓
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>

//             <h3 className="font-semibold text-lg mb-2">🌈 Gradient Colors</h3>
//             <div className="grid grid-cols-2 gap-4 mb-6">
//               {gradientColors.map((color) => (
//                 <div className="relative" key={color.background_color_id}>
//                   <button
//                     onClick={() => {
//                       setSelectedColorId(color.background_color_id);
//                       setSelectedColorCode(color.color_code);
//                     }}
//                     style={{ background: color.color_code }}
//                     className={`h-14 w-full rounded-lg transition-all duration-300 transform ${
//                       selectedColorId === color.background_color_id
//                         ? "scale-110 ring-4 ring-blue-500 border-2 border-white shadow-xl z-10"
//                         : "hover:scale-105 hover:ring-2 hover:ring-gray-400"
//                     }`}
//                     title={color.name}
//                   />
//                   {selectedColorId === color.background_color_id && (
//                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//                       <span className="text-white text-xl font-bold drop-shadow-md">
//                         ✓
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>

//             {/* Action Buttons */}
//             <div className="flex justify-end space-x-2">
//               <button
//                 onClick={() => setShowModal(false)}
//                 disabled={isLoading}
//                 className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={applyBackground}
//                 disabled={isLoading}
//                 className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 ${
//                   isLoading ? "opacity-60 cursor-not-allowed" : ""
//                 }`}
//               >
//                 {isLoading ? (
//                   <>
//                     <span className="loader border-t-white border-2 border-solid border-blue-500 rounded-full w-4 h-4 animate-spin" />
//                     Applying...
//                   </>
//                 ) : (
//                   "Apply"
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* 🌐 App Routing */}
//       <Index />
//     </div>
//   );
// }

// export default App;
