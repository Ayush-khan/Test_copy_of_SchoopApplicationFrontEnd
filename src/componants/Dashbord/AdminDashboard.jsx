import DashboardContent from "./DashboardContent.jsx";
const AdminDashboard = () => {
  return (
    <div className=" w-screen overflow-x-hidden h-screen">
      <DashboardContent />
    </div>
  );
};
export default AdminDashboard;

// import { useState, useEffect } from "react";
// import DashboardContent from "./DashboardContent.jsx";
// import axios from "axios";

// const AdminDashboard = () => {
//   const API_URL = import.meta.env.VITE_API_URL; // url for host
//   const [loading, setLoading] = useState(false);
//   const [background, setBackground] = useState(
//     "linear-gradient(to bottom, #E91E63, #2196F3)"
//   );
//   const [showModal, setShowModal] = useState(false);
//   const [selectedColor, setSelectedColor] = useState(background);
//   const [flatColors, setFlatColors] = useState([]);
//   const [gradientColors, setGradientColors] = useState([]);

//   const applyBackground = () => {
//     setBackground(selectedColor);
//     setShowModal(false);
//   };
//   useEffect(() => {
//     fetchBackgroundColors();
//   }, []);
//   const fetchBackgroundColors = async () => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem("authToken");

//       if (!token) {
//         throw new Error("No authentication token found");
//       }

//       const response = await axios.get(`${API_URL}/api/get_allbackgoundcolor`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         withCredentials: true,
//       });

//       const { flat_colors, gradient_color } = response?.data?.data || {};

//       const formattedFlatColors = flat_colors.map((color) => ({
//         name: color.name,
//         value: color.color_code,
//       }));

//       const formattedGradientColors = gradient_color.map((color) => ({
//         name: color.name,
//         value: color.color_code,
//       }));

//       setFlatColors(formattedFlatColors);
//       setGradientColors(formattedGradientColors);
//     } catch (error) {
//       console.error("Error fetching background colors:", error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div
//       className="w-screen h-screen overflow-x-hidden relative transition-all duration-500"
//       style={{ background }}
//     >
//       {/* Toggle Background Button */}
//       <button
//         onClick={() => setShowModal(true)}
//         className="absolute top-4 right-4 px-4 py-2 bg-white text-black rounded shadow hover:bg-gray-300 transition z-10"
//       >
//         Change Background
//       </button>

//       {/* Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
//           <div className="bg-white w-[90%] max-w-2xl p-6 rounded shadow-lg max-h-[90vh] overflow-y-auto">
//             <h2 className="text-xl font-bold mb-4">Select Background Color</h2>

//             <div>
//               <h3 className="font-semibold text-lg mb-2">🎨 Flat Colors</h3>
//               <div className="grid grid-cols-3 gap-4 mb-6">
//                 {flatColors.map((color) => (
//                   <div className="relative">
//                     <button
//                       key={color.name}
//                       onClick={() => setSelectedColor(color.value)}
//                       style={{ background: color.value }}
//                       className={`h-12 w-full rounded-lg transition-all duration-300 transform
//         ${
//           selectedColor === color.value
//             ? "scale-110 ring-4 ring-pink-500 border-2 border-white shadow-xl z-10"
//             : "hover:scale-105 hover:ring-2 hover:ring-gray-400"
//         }`}
//                       title={color.name}
//                     />
//                     {selectedColor === color.value && (
//                       <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//                         <span className="text-white text-xl font-bold drop-shadow-md">
//                           ✓
//                         </span>
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>

//               <h3 className="font-semibold text-lg mb-2">🌈 Gradient Colors</h3>
//               <div className="grid grid-cols-2 gap-4 mb-6">
//                 {gradientColors.map((color) => (
//                   <div className="relative">
//                     <button
//                       key={color.name}
//                       onClick={() => setSelectedColor(color.value)}
//                       style={{ background: color.value }}
//                       className={`h-14 w-full rounded-lg transition-all duration-300 transform
//         ${
//           selectedColor === color.value
//             ? "scale-110 ring-4 ring-blue-500 border-2 border-white shadow-xl z-10"
//             : "hover:scale-105 hover:ring-2 hover:ring-gray-400"
//         }`}
//                       title={color.name}
//                     />
//                     {selectedColor === color.value && (
//                       <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//                         <span className="text-white text-xl font-bold drop-shadow-md">
//                           ✓
//                         </span>
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>

//               <div className="flex justify-end space-x-2">
//                 <button
//                   onClick={() => setShowModal(false)}
//                   className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={applyBackground}
//                   className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//                 >
//                   Apply
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Main Content */}
//       <DashboardContent />
//     </div>
//   );
// };

// export default AdminDashboard;
