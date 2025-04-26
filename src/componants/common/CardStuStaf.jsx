import styles from "../../CSS/DashbordCss/Card.module.css";
import { FaArrowRightLong } from "react-icons/fa6";
const Card = ({ title, TotalValue, presentValue, color, icon }) => {
  {
    console.log("this is totalValue=", presentValue);
  }
  return (
    <div className="w-full rounded-lg bg-white flex items-center justify-around  shadow-card h-28 ">
      <div className="flex items-center justify-between flex-col w-1/2">
        {icon && (
          <div className={`${styles.icon} text-6xl text-blue-500`}>{icon}</div>
        )}

        <div
          className={styles["card-title"]}
          style={{ fontSize: "12px", fontWeight: "400" }}
        >
          {title}
        </div>
      </div>
      <div className="w-1 h-10 border-l "></div>
      <div
        className={styles["small-desc"]}
        style={{
          width: "50%",
          display: "flex",
          justifyContent: "center",
          fontWeight: "500",
        }}
      >
        <div
          className="flex align-item-center justify-between text-sm gap-1 flex-col  "
          style={{ fontSize: ".9em" }}
        >
          <div style={{ textAlign: "center" }}>
            {presentValue ? presentValue : "0"}
          </div>
          <div style={{ border: "1px solid gray" }}></div>
          <div style={{ textAlign: "center" }}>
            {TotalValue ? <div>{TotalValue}</div> : "value"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
// Just impleent Loader
// import React from "react";
// import styles from "../../CSS/DashbordCss/Card.module.css";
// import { FaArrowRightLong } from "react-icons/fa6";
// import { FaSpinner } from "react-icons/fa"; // Import a spinner icon

// const Card = ({ title, TotalValue, presentValue, color, icon }) => {
//   console.log("this is presentValue=", presentValue);
//   console.log("this is totalValue=", TotalValue);

//   // Loader component when both values are missing
//   const renderLoader = () => (
//     <FaSpinner className="animate-spin text-blue-500" />
//   );

//   // Check if both presentValue and TotalValue are missing
//   const isLoading = !(presentValue || TotalValue);

//   return (
//     <div className="w-full rounded-lg bg-white flex items-center justify-around shadow-card h-28">
//       <div className="flex items-center justify-between flex-col w-1/2">
//         {icon && (
//           <div className={`${styles.icon} text-6xl text-blue-500`}>{icon}</div>
//         )}

//         <div
//           className={styles["card-title"]}
//           style={{ fontSize: "12px", fontWeight: "400" }}
//         >
//           {title}
//         </div>
//       </div>
//       <div className="w-1 h-10 border-l"></div>
//       <div
//         className={styles["small-desc"]}
//         style={{
//           width: "50%",
//           display: "flex",
//           justifyContent: "center",
//           fontWeight: "500",
//         }}
//       >
//         <div
//           className="flex align-item-center justify-between text-sm gap-1 flex-col"
//           style={{ fontSize: ".9em" }}
//         >
//           <div style={{ textAlign: "center" }}>
//             {/* Show the loader or value */}
//             {isLoading
//               ? renderLoader()
//               : presentValue || presentValue === 0
//               ? presentValue
//               : null}
//           </div>

//           {/* Conditionally render the border */}
//           {!isLoading && <div style={{ border: "1px solid gray" }}></div>}

//           <div style={{ textAlign: "center" }}>
//             {/* Only show TotalValue when not loading */}
//             {!isLoading && (TotalValue || TotalValue === 0) ? (
//               <div>{TotalValue}</div>
//             ) : null}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Card;
