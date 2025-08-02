import DashboardContent from "./DashboardContent.jsx";
const AdminDashboard = () => {
  return (
    <div
      className=" w-screen overflow-x-hidden h-screen"
      style={{
        background: "   linear-gradient(to bottom, #E91E63, #2196F3)",
      }}
    >
      <DashboardContent />
    </div>
  );
};
export default AdminDashboard;

// import { useState } from "react";
// import DashboardContent from "./DashboardContent.jsx";

// const AdminDashboard = () => {
//   const [isAltBg, setIsAltBg] = useState(false);

//   const toggleBackground = () => {
//     setIsAltBg((prev) => !prev);
//   };

//   const background = isAltBg
//     ? "linear-gradient(to right, #1e3c72, #2a5298)" // Alternate theme
//     : "linear-gradient(to bottom, #E91E63, #2196F3)"; // Default theme

//   return (
//     <div
//       className="w-screen h-screen overflow-x-hidden relative transition-all duration-500"
//       style={{ background }}
//     >
//       {/* Toggle Background Button */}
//       <button
//         onClick={toggleBackground}
//         className="absolute top-4 right-4 px-4 py-2 bg-white text-black rounded shadow hover:bg-gray-300 transition"
//       >
//         Change Background
//       </button>

//       {/* Main Content */}
//       <DashboardContent />
//     </div>
//   );
// };

// export default AdminDashboard;
