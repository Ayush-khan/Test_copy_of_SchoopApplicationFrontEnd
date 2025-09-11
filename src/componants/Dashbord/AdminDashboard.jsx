import DashboardContent from "./DashboardContent.jsx";
const AdminDashboard = () => {
  return (
    <div
      className=" w-screen overflow-x-hidden h-screen"
      // style={{
      //   background: "   linear-gradient(to bottom, #E91E63, #2196F3)",
      // }}
    >
      <DashboardContent />
    </div>
  );
};
export default AdminDashboard;

// // test for bg chnage
// import { useEffect } from "react";
// import axios from "axios";
// import DashboardContent from "./DashboardContent.jsx";

// const AdminDashboard = () => {
//   const API_URL = import.meta.env.VITE_API_URL;

//   const getCookie = (name) => {
//     const cookieValue = document.cookie
//       .split("; ")
//       .find((row) => row.startsWith(name + "="));
//     return cookieValue ? decodeURIComponent(cookieValue.split("=")[1]) : null;
//   };

//   useEffect(() => {
//     const fetchAndSetBackground = async () => {
//       const token = localStorage.getItem("authToken");
//       const sortName = getCookie("short_name");

//       if (!token || !sortName) return;

//       try {
//         const config = {
//           headers: { Authorization: `Bearer ${token}` },
//           withCredentials: true,
//           params: { short_name: sortName },
//         };

//         const res = await axios.get(
//           `${API_URL}/api/get_activebackgroundcolor`,
//           config
//         );

//         const active = res?.data?.data?.[0];

//         if (active?.color_code && typeof active.color_code === "string") {
//           // ✅ Save background color to cookie
//           document.cookie = `bg_color=${encodeURIComponent(
//             active.color_code
//           )}; path=/; max-age=86400`; // 1 day
//         }
//       } catch (err) {
//         console.error(
//           "Failed to fetch background color in dashboard:",
//           err.message
//         );
//       }
//     };

//     fetchAndSetBackground();
//   }, []);

//   return (
//     <div className="w-screen overflow-x-hidden h-screen">
//       <DashboardContent />
//     </div>
//   );
// };

// export default AdminDashboard;
