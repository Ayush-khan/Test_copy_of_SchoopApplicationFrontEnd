// // src/pages/BackgroundChanger.jsx

// import { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// function BackgroundChanger({ setBackground }) {
//   const API_URL = import.meta.env.VITE_API_URL;
//   const navigate = useNavigate();

//   const [selectedColorId, setSelectedColorId] = useState(null);
//   const [selectedColorCode, setSelectedColorCode] = useState(null);
//   const [flatColors, setFlatColors] = useState([]);
//   const [gradientColors, setGradientColors] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     fetchBackgroundColors();
//     fetchActiveBackground();
//   }, []);

//   const cleanColorCode = (code) => {
//     if (!code) return "";
//     if (code.startsWith("linear-gradient") && !code.trim().endsWith(")")) {
//       return code + ")";
//     }
//     return code;
//   };

//   const fetchActiveBackground = async () => {
//     const token = localStorage.getItem("authToken");
//     if (!token) {
//       navigate("/");
//       return;
//     }

//     try {
//       const config = {
//         headers: { Authorization: `Bearer ${token}` },
//         withCredentials: true,
//       };
//       const res = await axios.get(
//         `${API_URL}/api/get_activebackgroundcolor`,
//         config
//       );
//       const active = res?.data?.data?.[0];
//       if (active) {
//         setSelectedColorId(active.background_color_id);
//         setSelectedColorCode(active.color_code);
//       }
//     } catch (err) {
//       console.error("Error fetching active background:", err.message);
//     }
//   };

//   const fetchBackgroundColors = async () => {
//     try {
//       const token = localStorage.getItem("authToken");
//       const config = {
//         headers: { Authorization: `Bearer ${token}` },
//         withCredentials: true,
//       };
//       const res = await axios.get(
//         `${API_URL}/api/get_allbackgoundcolor`,
//         config
//       );
//       const { flat_colors, gradient_color } = res?.data?.data || {};
//       setFlatColors(flat_colors);
//       setGradientColors(gradient_color);
//     } catch (err) {
//       console.error("Failed to fetch background colors:", err.message);
//     }
//   };

//   const applyBackground = async () => {
//     if (!selectedColorId) return;

//     setIsLoading(true);
//     try {
//       const token = localStorage.getItem("authToken");
//       const config = {
//         headers: { Authorization: `Bearer ${token}` },
//         withCredentials: true,
//       };

//       const cleanCode = cleanColorCode(selectedColorCode);
//       setBackground(cleanCode); // 🔴 Reflect in App.jsx

//       await axios.put(
//         `${API_URL}/api/update_backgroundcoloractive/${selectedColorId}`,
//         { background_color_id: selectedColorId },
//         config
//       );

//       navigate("/"); // Optional: go back to home after applying
//     } catch (err) {
//       console.error("Error applying background:", err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const renderColorOptions = (colors, ringColor) =>
//     colors.map((color) => (
//       <div className="relative" key={color.background_color_id}>
//         <button
//           onClick={() => {
//             setSelectedColorId(color.background_color_id);
//             setSelectedColorCode(color.color_code);
//           }}
//           style={{ background: color.color_code }}
//           className={`h-14 w-full rounded-lg transition-all duration-300 transform ${
//             selectedColorId === color.background_color_id
//               ? `scale-110 ring-4 ring-${ringColor} border-2 border-white shadow-xl z-10`
//               : "hover:scale-105 hover:ring-2 hover:ring-gray-400"
//           }`}
//           title={color.name}
//         />
//         {selectedColorId === color.background_color_id && (
//           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//             <span className="text-white text-xl font-bold drop-shadow-md">
//               ✓
//             </span>
//           </div>
//         )}
//       </div>
//     ));

//   return (
//     <div className="p-6 max-w-4xl mx-auto">
//       <h1 className="text-2xl font-bold mb-6">🎨 Change Background</h1>

//       <h2 className="font-semibold text-lg mb-2">Flat Colors</h2>
//       <div className="grid grid-cols-3 gap-4 mb-6">
//         {renderColorOptions(flatColors, "pink-500")}
//       </div>

//       <h2 className="font-semibold text-lg mb-2">Gradient Colors</h2>
//       <div className="grid grid-cols-2 gap-4 mb-6">
//         {renderColorOptions(gradientColors, "blue-500")}
//       </div>

//       <div className="flex gap-2">
//         <button
//           onClick={() => navigate("/")}
//           className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
//         >
//           Cancel
//         </button>
//         <button
//           onClick={applyBackground}
//           disabled={isLoading}
//           className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 ${
//             isLoading ? "opacity-60 cursor-not-allowed" : ""
//           }`}
//         >
//           {isLoading ? (
//             <>
//               <span className="loader border-t-white border-2 border-solid border-blue-500 rounded-full w-4 h-4 animate-spin" />
//               Applying...
//             </>
//           ) : (
//             "Apply"
//           )}
//         </button>
//       </div>
//     </div>
//   );
// }

// export default BackgroundChanger;
// BackgroundChanger.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
function BackgroundChanger() {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [flatColors, setFlatColors] = useState([]);
  const [gradientColors, setGradientColors] = useState([]);
  const [selectedColorCode, setSelectedColorCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAllColors();
  }, []);

  const fetchAllColors = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      };

      const response = await axios.get(
        `${API_URL}/api/get_allbackgoundcolor`,
        config
      );

      const { flat_colors, gradient_color } = response?.data?.data || {};
      setFlatColors(flat_colors || []);
      setGradientColors(gradient_color || []);
    } catch (err) {
      console.error("Failed to load background colors:", err.message);
    }
  };

  const applyBackground = () => {
    if (!selectedColorCode) return;

    setIsLoading(true);
    setTimeout(() => {
      localStorage.setItem("background", selectedColorCode);
      window.location.reload(); // ✅ Refresh App to apply
    }, 500);
  };

  const renderColorButton = (color) => {
    const isSelected = selectedColorCode === color.color_code;
    return (
      <div key={color.background_color_id} className="relative group">
        <button
          onClick={() => setSelectedColorCode(color.color_code)}
          style={{ background: color.color_code }}
          className={`h-16 w-full rounded-lg transition-all duration-300 border-2 ${
            isSelected
              ? "scale-110 ring-4 ring-blue-400 border-white shadow-lg"
              : "hover:scale-105 hover:ring-2 hover:ring-gray-400 border-transparent"
          }`}
          title={color.name}
        />
        {isSelected && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-white text-2xl font-bold drop-shadow-lg">
              ✓
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-6 mt-10 bg-white bg-opacity-95 rounded-xl shadow-lg relative">
      {/* ✅ Top-right buttons */}
      <div className="absolute top-4 right-4 flex space-x-3 ">
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-gray-200 hover:bg-gray-300 text-black px-3 py-2 rounded-full shadow transition"
          title="Cancel"
        >
          ❌
        </button>
        <button
          onClick={applyBackground}
          disabled={!selectedColorCode || isLoading}
          className={`bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-full shadow transition ${
            isLoading ? "opacity-60 cursor-not-allowed" : ""
          }`}
          title="Apply"
        >
          ✅
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        🎨 Select Your Background
      </h1>

      {/* Flat Colors */}
      <h2 className="text-xl font-semibold mb-3 text-gray-700">Solid Colors</h2>
      <div className="grid grid-cols-4 gap-4 mb-8">
        {flatColors.map(renderColorButton)}
      </div>

      {/* Gradient Colors */}
      <h2 className="text-xl font-semibold mb-3 text-gray-700">
        Gradient Colors
      </h2>
      <div className="grid grid-cols-4 gap-4 mb-8">
        {gradientColors.map(renderColorButton)}
      </div>

      {/* Bottom Buttons (Optional - Keep for UX) */}
      <div className="flex justify-end space-x-3 mt-8">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
        >
          Cancel
        </button>
        <button
          onClick={applyBackground}
          disabled={!selectedColorCode || isLoading}
          className={`px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition ${
            isLoading ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Applying..." : "Apply Background"}
        </button>
      </div>
    </div>
  );
}

export default BackgroundChanger;
