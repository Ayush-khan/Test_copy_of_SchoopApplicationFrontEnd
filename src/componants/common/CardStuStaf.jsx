// import styles from "../../CSS/DashbordCss/Card.module.css";
// import { FaArrowRightLong } from "react-icons/fa6";
// const Card = ({ title, TotalValue, presentValue, color, icon }) => {
//   {
//     console.log("this is totalValue=", presentValue);
//   }
//   return (
//     <div className="w-full rounded-lg bg-white flex items-center justify-around  shadow-card h-28 ">
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
//       <div className="w-1 h-10 border-l "></div>
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
//           className="flex align-item-center justify-between text-sm gap-1 flex-col  "
//           style={{ fontSize: ".9em" }}
//         >
//           <div style={{ textAlign: "center" }}>
//             {presentValue ? presentValue : "0"}
//           </div>
//           <div style={{ border: "1px solid gray" }}></div>
//           <div style={{ textAlign: "center" }}>
//             {TotalValue ? <div>{TotalValue}</div> : "value"}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Card;
// Just impleent Loader

import styles from "../../CSS/DashbordCss/Card.module.css";
import { FaArrowRightLong } from "react-icons/fa6";
import { FaSpinner } from "react-icons/fa"; // Import a spinner icon

const Card = ({ title, TotalValue, presentValue, color, icon, roleId }) => {
  console.log("this is presentValue=", presentValue);
  console.log("this is totalValue=", TotalValue);

  // Show loader only if values are missing and role is NOT T
  const isLoading = !(presentValue || TotalValue);

  const shouldShowValues = roleId !== "T";

  const renderLoader = () => (
    <FaSpinner className="animate-spin text-blue-500" />
  );

  return (
    <div className="w-full rounded-lg bg-white flex items-center justify-around shadow-card h-28">
      <div className="flex items-center justify-between flex-col w-1/2">
        {icon && (
          <div className={`${styles.icon} text-6xl text-blue-500`}>{icon}</div>
        )}
        <div
          className={`${styles["card-title"]} text-gray-600`}
          style={{ fontSize: ".8em", fontWeight: "600" }}
        >
          {title}
        </div>
      </div>

      <div className="w-1 h-10 border-l"></div>

      <div
        className={styles["small-desc"]}
        style={{
          width: "50%",
          display: "flex",
          justifyContent: "center",
          fontWeight: "500",
        }}
      >
        {shouldShowValues && (
          <div
            className="flex align-item-center justify-between text-sm gap-1 flex-col"
            style={{ fontSize: "1.3em" }}
          >
            <div style={{ textAlign: "center" }}>
              {isLoading
                ? renderLoader()
                : presentValue || presentValue === 0
                ? presentValue
                : null}
            </div>

            {!isLoading && <div style={{ border: "1px solid gray" }}></div>}

            <div style={{ textAlign: "center" }}>
              {!isLoading && (TotalValue || TotalValue === 0) ? (
                <div>{TotalValue}</div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;
