import styles from "../../CSS/DashbordCss/Card.module.css";
import { FaSpinner } from "react-icons/fa"; // Import a spinner icon
import { Link } from "react-router-dom";

const CardStuStaf = ({
  title,
  TotalValue,
  presentValue,
  color,
  icon,
  roleId,
  sortName,
  badge,
  onCardClick,
}) => {
  const isLoading =
    (presentValue === undefined || presentValue === null) &&
    (TotalValue === undefined || TotalValue === null);
  const isSacsM = sortName === "SACS" && roleId === "M";

  const renderLoader = () => (
    <FaSpinner className="animate-spin text-blue-500" />
  );

  return (
    <div
      className="relative w-full rounded-lg bg-white flex items-center justify-around shadow-card h-28"
      onClick={onCardClick}
    >
      {badge > 0 && (
        <Link
          to="/studentAbsent"
          state={{ openTab: "Today's Attendance not mark classes" }}
          onClick={(e) => e.stopPropagation()}
          title="Today's attendance not marked classes"
          style={{
            position: "absolute",
            top: "4px",
            right: "4px",
            minWidth: "28px",
            height: "28px",
            padding: "0 8px",
            borderRadius: "999px",
            fontSize: "13px",
            fontWeight: 600,
            backgroundColor: "red",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 5,
            textDecoration: "none",
            cursor: "pointer",
          }}
        >
          {badge}
        </Link>
      )}

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
          width: isSacsM ? "70%" : "50%",
          display: "flex",
          justifyContent: "center",
          fontWeight: "500",
        }}
      >
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
      </div>
    </div>
  );
};

export default CardStuStaf;

