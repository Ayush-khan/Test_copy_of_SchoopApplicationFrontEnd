// import styles from "../../CSS/DashbordCss/Card.module.css";
// import { FaArrowRightLong } from "react-icons/fa6";
// const Card = ({ title, value, color, icon }) => {
//   return (
//     <div className="w-full bg-white flex items-center justify-around  shadow-card h-28 rounded-lg">
//       <div className="flex items-center justify-between flex-col w-1/2 ">
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
//         {/* <div> {TotalValue} </div> */}
//         {value}
//       </div>
//     </div>
//   );
// };

// export default Card;

// just implenetn loader

import styles from "../../CSS/DashbordCss/Card.module.css";
import { FaSpinner } from "react-icons/fa"; // Import the spinner icon

const Card = ({ title, value, spanLabel, color, icon }) => {
  // Check if value is empty string, undefined, null, or empty array
  const isLoading =
    value === "" ||
    value === undefined ||
    value === null ||
    (Array.isArray(value) && value.length === 0);

  // Loader component when data is loading
  const renderLoader = () => (
    <FaSpinner className="animate-spin text-blue-500" />
  );

  return (
    <div className="w-full bg-white flex items-center justify-around shadow-card h-28 rounded-lg">
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
        {/* If loading (value is missing, empty string, or empty array), show the loader */}
        {/* {isLoading ? renderLoader() : value} */}
        <div
          className="flex justify-center items-center gap-x-1   w-full text-center"
          style={{ textAlign: "center" }}
        >
          {spanLabel && (
            <div className="text-green-700 text-xs" style={styles.label}>
              {spanLabel}
            </div>
          )}
          <div>{isLoading ? renderLoader() : value}</div>
        </div>
      </div>
    </div>
  );
};

export default Card;
