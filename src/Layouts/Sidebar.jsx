// try one
import { RxCross2 } from "react-icons/rx";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Sidebar({ isSidebar, setIsSidebar }) {
  const [tabVisits, setTabVisits] = useState([]);
  const location = useLocation();
  console.log("locaioncurrent", location);
  // Load tab visits from local storage on component mount
  useEffect(() => {
    const storedVisits = JSON.parse(localStorage.getItem("tabVisits")) || [];
    setTabVisits(storedVisits);
  }, []);

  // Update tab visits whenever the location pathname changes
  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath) {
      const updatedVisits = updateTabVisits(currentPath, tabVisits);
      setTabVisits(updatedVisits);
      localStorage.setItem("tabVisits", JSON.stringify(updatedVisits));
    }
  }, [location.pathname]);

  // Function to update the tab visits array
  const updateTabVisits = (path, visits) => {
    const updatedVisits = [...visits];
    const existingIndex = updatedVisits.indexOf(path);

    if (existingIndex !== -1) {
      // Remove existing tab
      updatedVisits.splice(existingIndex, 1);
    }

    // Add new tab to the front
    updatedVisits.unshift(path);

    // Ensure the array only contains the last 10 tabs
    if (updatedVisits.length > 10) {
      updatedVisits.pop();
    }

    return updatedVisits;
  };
  console.log("updatevisitedpath", updateTabVisits);
  return (
    <div className={`hidden md:block md:fixed ${isSidebar ? "z-30" : ""}`}>
      <div
        className={` md:w-36 lg:h-[80vh] bg-gray-200 mt-0.5 shadow-lg relative right-36 transform transition-all duration-500 text-center pr-3 ${
          isSidebar
            ? "relative transform translate-x-36  translate-y-24 transition-all duration-500"
            : "relative transform translate-x-0 transition-all duration-500"
        }`}
      >
        <h2 className="text-[1.1em] font-semibold pt-2 bg-gray-200 text-gray-900 pr-2">
          Recent Tabs
          {/* fjsd */}
        </h2>
        <div
          className=" relative w-[100%]  left-2 mb-2 h-1  mx-auto bg-red-700"
          style={{
            backgroundColor: "#C03078",
          }}
        ></div>
        <ul className="space-y-1">
          {console.log("tabvisitednow", tabVisits)}
          {tabVisits.map((tab, index) => (
            <li
              key={index}
              className="text-sm w-[132%] relative -left-6    text-center underline-none"
            >
              <Link
                to={tab}
                className="overflow-hidden block no-underline font-semibold text-[.9em] py-2 rounded-md bg-blue-500 text-pink-200 hover:text-pink-100 hover:bg-blue-600 shadow-md hover:drop-shadow-lg hover:font-bold transition duration-300"
              >
                {tab
                  .split("/")
                  .map((segment, index, arr) => {
                    const isLastSegmentNumeric =
                      !isNaN(segment) && index === arr.length - 1;
                    return isLastSegmentNumeric
                      ? `-${segment}` // Add a dash before numeric ID
                      : `${segment.charAt(0).toUpperCase()}${segment
                          .slice(1)
                          .toLowerCase()}`;
                  })
                  .join("")}
              </Link>
            </li>
          ))}
        </ul>

        <RxCross2
          className="absolute right-2 top-3 text-xl text-red-500 hover:cursor-pointer"
          onClick={() => setIsSidebar(false)}
        />
      </div>
    </div>
  );
}
// import { RxCross2 } from "react-icons/rx";
// import { Link, useLocation } from "react-router-dom";
// import { useState, useEffect } from "react";
// import axios from "axios";

// export default function Sidebar({ isSidebar, setIsSidebar }) {
//   const [tabVisits, setTabVisits] = useState([]);
//   const location = useLocation();
//   console.log("locaioncurrent", location);
//   // Load tab visits from local storage on component mount
//   useEffect(() => {
//     const storedVisits = JSON.parse(localStorage.getItem("tabVisits")) || [];
//     setTabVisits(storedVisits);
//   }, []);
//   useEffect(() => {
//     axios
//       .get("/api/get-tabs") // Your GET API endpoint
//       .then((res) => {
//         const tabs = res.data?.tabs || [];
//         setTabVisits(tabs);
//         localStorage.setItem("tabVisits", JSON.stringify(tabs));
//       })
//       .catch((err) => {
//         // fallback to localStorage
//         const storedVisits =
//           JSON.parse(localStorage.getItem("tabVisits")) || [];
//         setTabVisits(storedVisits);
//       });
//   }, []);

//   // Update tab visits whenever the location pathname changes
//   useEffect(() => {
//     const currentPath = location.pathname;

//     if (currentPath) {
//       const updatedVisits = updateTabVisits(currentPath, tabVisits);
//       setTabVisits(updatedVisits);
//       localStorage.setItem("tabVisits", JSON.stringify(updatedVisits));

//       // Save to API using axios
//       axios
//         .post("/api/save-tabs", { tabs: updatedVisits }) // Your POST API endpoint
//         .catch((err) => {
//           console.error("Failed to save tabs:", err);
//         });
//     }
//   }, [location.pathname]);

//   // Function to update the tab visits array
//   const updateTabVisits = (path, visits) => {
//     const updatedVisits = [...visits];
//     const index = updatedVisits.findIndex((item) => item.path === path);

//     if (index !== -1) {
//       updatedVisits[index].count += 1;
//     } else {
//       updatedVisits.push({ path, count: 1 });
//     }

//     // Sort by highest count
//     updatedVisits.sort((a, b) => b.count - a.count);

//     // Limit to top 10
//     return updatedVisits.slice(0, 10);
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
//               className="text-sm w-[132%] relative -left-6 text-center underline-none"
//             >
//               <Link
//                 to={tab.path}
//                 className="overflow-hidden block no-underline font-semibold text-[.9em] py-2 rounded-md bg-blue-500 text-pink-200 hover:text-pink-100 hover:bg-blue-600 shadow-md hover:drop-shadow-lg hover:font-bold transition duration-300"
//               >
//                 {tab.path
//                   .split("/")
//                   .map((segment, index, arr) => {
//                     const isLastSegmentNumeric =
//                       !isNaN(segment) && index === arr.length - 1;
//                     return isLastSegmentNumeric
//                       ? `-${segment}`
//                       : `${segment.charAt(0).toUpperCase()}${segment
//                           .slice(1)
//                           .toLowerCase()}`;
//                   })
//                   .join("")}
//                 <span className="ml-1 text-xs text-gray-300">
//                   ({tab.count})
//                 </span>
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
