// just implenetn loader
import styles from "../../CSS/DashbordCss/Card.module.css";
import { FaSpinner } from "react-icons/fa"; // Import the spinner icon

const Card = ({
  title,
  value,
  valuePendingFee,
  spanLabel,
  color,
  icon,
  roleId,
}) => {
  // Check if value is empty string, undefined, null, or empty array
  const isLoading =
    value === "" ||
    value === undefined ||
    value === null ||
    (Array.isArray(value) && value.length === 0);

  const renderLoader = () => (
    <FaSpinner className="animate-spin text-blue-500" />
  );

  return (
    <div className="w-full bg-white flex items-center justify-around shadow-card h-28 rounded-lg">
      <div
        className={`flex items-center justify-between flex-col ${
          title === "Fee" ? "w-[35%] " : "w-1/2"
        }`}
      >
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
      <div className="w-1 h-10 border-l "></div>
      <div
        className={styles["small-desc"]}
        style={{
          width: "50%",
          display: "flex",
          justifyContent: title === "Fee" ? "flex-start" : "center",
          fontWeight: "500",
        }}
      >
        <div
          className="flex justify-center items-center gap-x-1   w-full text-center"
          style={{ textAlign: "center" }}
        >
          {spanLabel && (
            <div className="text-red-600 text-xs" style={styles.label}>
              {spanLabel}
            </div>
          )}
          {isLoading ? (
            <div>{renderLoader()}</div>
          ) : title === "Fee Pending" ? (
            <div className="mx-2 -space-y-2 text-[.8em]">
              <div className="flex justify-between items-center gap-x-2"></div>
            </div>
          ) : title === "Fee" ? (
            <div className="mx-2 -space-y-2 text-[.7em]">
              <div className="flex justify-between items-center gap-x-2">
                <span className="text-green-700 font-semibold">Collected:</span>
                <span className="text-green-600 font-semibold">
                  {new Intl.NumberFormat("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(value)}
                </span>
              </div>
              <div className="flex justify-between items-center gap-x-2">
                <span className="text-red-700 font-semibold">Pending:</span>
                <span className="text-red-600 font-semibold">
                  {new Intl.NumberFormat("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(valuePendingFee)}
                </span>
              </div>
            </div>
          ) : (
            <div>
              <div
                className={
                  title === "Approve Lesson Plans"
                    ? "text-red-600 text-[1.3em]"
                    : "text-[1.3em]"
                }
              >
                {value}
              </div>
              <div>{valuePendingFee}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;
