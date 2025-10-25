// // try one
// import { RxCross2 } from "react-icons/rx";
// import { Link, useLocation } from "react-router-dom";
// import { useState, useEffect } from "react";

// export default function Sidebar({ isSidebar, setIsSidebar }) {
//   const [tabVisits, setTabVisits] = useState([]);
//   const location = useLocation();
//   console.log("locaioncurrent", location);
//   // Load tab visits from local storage on component mount
//   useEffect(() => {
//     const storedVisits = JSON.parse(localStorage.getItem("tabVisits")) || [];
//     setTabVisits(storedVisits);
//   }, []);

//   // Update tab visits whenever the location pathname changes
//   useEffect(() => {
//     const currentPath = location.pathname;
//     if (currentPath) {
//       const updatedVisits = updateTabVisits(currentPath, tabVisits);
//       setTabVisits(updatedVisits);
//       localStorage.setItem("tabVisits", JSON.stringify(updatedVisits));
//     }
//   }, [location.pathname]);

//   // Function to update the tab visits array
//   const updateTabVisits = (path, visits) => {
//     const updatedVisits = [...visits];
//     const existingIndex = updatedVisits.indexOf(path);

//     if (existingIndex !== -1) {
//       // Remove existing tab
//       updatedVisits.splice(existingIndex, 1);
//     }

//     // Add new tab to the front
//     updatedVisits.unshift(path);

//     // Ensure the array only contains the last 10 tabs
//     if (updatedVisits.length > 10) {
//       updatedVisits.pop();
//     }

//     return updatedVisits;
//   };
//   console.log("updatevisitedpath", updateTabVisits);
//   return (
//     <div className={`hidden md:block md:fixed ${isSidebar ? "z-30" : ""}`}>
//       <div
//         className={` md:w-36 lg:h-[80vh] bg-gray-200 mt-0.5 shadow-lg relative right-36 transform transition-all duration-500 text-center pr-3 ${
//           isSidebar
//             ? "relative transform translate-x-36 transition-all duration-500"
//             : "relative transform translate-x-0 transition-all duration-500"
//         }`}
//       >
//         <h2 className="text-[1.1em] font-semibold pt-2 bg-gray-200 text-gray-900 pr-2">
//           Recent Tabs
//           {/* fjsd */}
//         </h2>
//         <div
//           className=" relative w-[100%]  left-2 mb-2 h-1  mx-auto bg-red-700"
//           style={{
//             backgroundColor: "#C03078",
//           }}
//         ></div>
//         <ul className="space-y-1">
//           {console.log("tabvisitednow", tabVisits)}
//           {tabVisits.map((tab, index) => (
//             <li
//               key={index}
//               className="text-sm w-[132%] relative -left-6    text-center underline-none"
//             >
//               <Link
//                 to={tab}
//                 onClick={() => setIsSidebar(false)} // 👈 Close sidebar on click
//                 className="overflow-hidden block no-underline font-semibold text-[.9em] py-2 rounded-md bg-blue-500 text-pink-200 hover:text-pink-100 hover:bg-blue-600 shadow-md hover:drop-shadow-lg hover:font-bold transition duration-300"
//               >
//                 {tab
//                   .split("/")
//                   .map((segment, index, arr) => {
//                     const isLastSegmentNumeric =
//                       !isNaN(segment) && index === arr.length - 1;
//                     return isLastSegmentNumeric
//                       ? `-${segment}` // Add a dash before numeric ID
//                       : `${segment.charAt(0).toUpperCase()}${segment
//                           .slice(1)
//                           .toLowerCase()}`;
//                   })
//                   .join("")}
//               </Link>
//             </li>
//           ))}
//         </ul>

//         <RxCross2
//           className="absolute right-2 top-3 text-xl text-red-500 hover:cursor-pointer"
//           onClick={() => setIsSidebar(false)}
//         />
//       </div>
//     </div>
//   );
// }
// FInal working with the correct mappingn of the menu items names and url from the API of /get_navleafmenus
import { RxCross2 } from "react-icons/rx";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function Sidebar({ isSidebar, setIsSidebar }) {
  const API_URL = import.meta.env.VITE_API_URL;
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef(null); // 👈 Ref for sidebar

  const [menuItems, setMenuItems] = useState([]); // store API data
  const [tabVisits, setTabVisits] = useState([]); // store sidebar items
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // 👇 Close sidebar when clicking outside
  // ✅ CLOSE SIDEBAR WHEN CLICK OUTSIDE
  // ✅ CLOSE SIDEBAR WHEN CLICK OUTSIDE
  useEffect(() => {
    function handleClickOutside(event) {
      // if sidebar is open AND clicked outside sidebar -> close it
      if (
        isSidebar &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setIsSidebar(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebar, setIsSidebar]);

  useEffect(() => {
    const fetchMenuData = async () => {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/");
        return;
      }

      try {
        const res = await axios.get(`${API_URL}/api/get_navleafmenus`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data?.success && Array.isArray(res.data.data)) {
          setMenuItems(res.data.data);
        } else {
          setError("Invalid response format");
        }
      } catch (err) {
        const errMsg = err.response?.data?.message;
        if (errMsg === "Token has expired") {
          localStorage.removeItem("authToken");
          navigate("/");
          return;
        }
        console.error("Error fetching menu:", err);
        setError("Failed to load menu");
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  // Load visited tabs from localStorage only once
  useEffect(() => {
    const storedVisits = JSON.parse(localStorage.getItem("tabVisits")) || [];
    setTabVisits(storedVisits);
  }, []);

  // On route change update visited tabs but only if menuItems are loaded
  useEffect(() => {
    const currentPath = location.pathname;

    if (
      !menuItems.length || // wait until menu is loaded
      !currentPath || // ignore empty path
      currentPath.includes("/edit/") ||
      currentPath.includes("/view/") ||
      currentPath.includes("/create/")
    ) {
      return;
    }

    setTabVisits((prevVisits) => {
      const updatedVisits = updateTabVisits(currentPath, prevVisits);
      localStorage.setItem("tabVisits", JSON.stringify(updatedVisits));
      return updatedVisits;
    });
  }, [location.pathname, menuItems]);

  const updateTabVisits = (path, visits) => {
    const updatedVisits = [...visits];
    const existingIndex = updatedVisits.findIndex((item) => item.path === path);

    // Match menu item by URL
    const matchedMenu = menuItems.find((menu) => `/${menu.url}` === path);

    // If not found in menuItems, do not store this tab at all
    if (!matchedMenu) return updatedVisits;

    const newItem = { name: matchedMenu.name, path };

    if (existingIndex !== -1) updatedVisits.splice(existingIndex, 1);
    updatedVisits.unshift(newItem);

    if (updatedVisits.length > 10) updatedVisits.pop();

    return updatedVisits;
  };

  // ... rest of your JSX remains unchanged ...

  return (
    <div className={`hidden md:block md:fixed ${isSidebar ? "z-30" : ""}`}>
      <div
        ref={sidebarRef} // 👈 attach ref here
        className={`md:w-40 lg:h-[80vh] bg-gray-200 mt-0.5 shadow-lg relative right-40 transform transition-all duration-500 text-center pr-3 ${
          isSidebar
            ? "relative transform translate-x-40 transition-all duration-500"
            : "relative transform translate-x-0 transition-all duration-500"
        }`}
      >
        {/* Header */}
        <h2 className="text-[1.1em] font-semibold pt-2 bg-gray-200 text-gray-900 pr-2">
          Recent Tabs
        </h2>
        <div
          className="relative w-[95%] left-2 mb-2 h-1 mx-auto"
          style={{ backgroundColor: "#C03078" }}
        ></div>

        {/* Loading / error states */}
        {/* Stylish loading animation */}
        {loading && (
          <>
            <div className="flex space-x-2 justify-center mt-4">
              {[...Array(3)].map((_, i) => (
                <span
                  key={i}
                  className={`w-4 h-4 rounded-full 
          bg-gradient-to-r from-pink-500 via-purple-500 to-black
          animate-bounce
          `}
                  style={{ animationDelay: `${i * 0.2}s` }}
                ></span>
              ))}
            </div>{" "}
            <p className="bg-gradient-to-r from-pink-500 via-purple-500 to-black bg-clip-text text-transparent font-bold text-sm animate-pulse">
              Loading awesome...
            </p>
          </>
        )}

        {/* Error message with nice styling */}
        {error && (
          <p className="text-sm text-red-600 bg-red-100 border border-red-300 py-1 px-2 rounded-md mx-3 mt-3 shadow-sm animate-pulse">
            ⚠️ {error}
          </p>
        )}

        {/* Render recent tabs */}
        <ul className="space-y-2 mt-2">
          {tabVisits
            .filter((tab) => tab?.name && tab?.path) // ✅ show only valid items
            .map((tab, index) => (
              <li
                key={index}
                className="text-sm w-[120%] relative -left-6 text-center"
              >
                <Link
                  to={tab.path}
                  onClick={() => setIsSidebar(false)}
                  className="block no-underline font-semibold text-[.9em] py-2 rounded-md 
          bg-blue-500 text-white hover:bg-blue-600 transition duration-300"
                >
                  {tab.name}
                </Link>
              </li>
            ))}
        </ul>

        {/* Close Icon */}
        <RxCross2
          className="absolute right-2 top-3 text-xl text-red-500 hover:cursor-pointer"
          onClick={() => setIsSidebar(false)}
        />
      </div>
    </div>
  );
}
