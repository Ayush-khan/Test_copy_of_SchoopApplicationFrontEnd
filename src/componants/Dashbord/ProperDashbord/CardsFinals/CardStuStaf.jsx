
import styles from "../../CSS/DashbordCss/Card.module.css";
import { FaSpinner } from "react-icons/fa";
import { Link } from "react-router-dom";

const CardStuStaf = ({
  title,
  TotalValue,
  presentValue,
  icon,
  badge = 0,
  roleId,
  sortName,
  onCardClick,
}) => {
  // 🔒 loader logic (pure, predictable)
  const isLoading =
    presentValue === undefined || TotalValue === undefined;

  // 🧠 derived logic from props (NO API)
  const isSacsM = sortName === "SACS" && roleId === "M";

  const renderLoader = () => (
    <FaSpinner className="animate-spin text-blue-500" />
  );

  return (
    <div
      className="relative w-full rounded-lg bg-white flex items-center justify-around shadow-card h-28 cursor-pointer"
      onClick={onCardClick}
    >
      {/* 🔴 BADGE */}
      {badge > 0 && (
        <Link
          to="/studentAbsent"
          state={{ openTab: "Today's Attendance not mark classes" }}
          onClick={(e) => e.stopPropagation()}
          title="Today's attendance not marked classes"
          className="absolute top-1 right-1 min-w-[28px] h-[28px] px-2 rounded-full bg-red-600 text-white text-xs font-semibold flex items-center justify-center z-10 no-underline"
        >
          {badge}
        </Link>
      )}

      {/* LEFT */}
      <div className="flex flex-col items-center w-1/2">
        {icon && <div className={`${styles.icon} text-6xl`}>{icon}</div>}

        <div
          className={`${styles["card-title"]} text-gray-600`}
          style={{ fontSize: ".8em", fontWeight: 600 }}
        >
          {title}
        </div>
      </div>

      <div className="w-px h-10 bg-gray-300"></div>

      {/* RIGHT */}
      <div
        className={styles["small-desc"]}
        style={{
          width: isSacsM ? "70%" : "50%",
          display: "flex",
          justifyContent: "center",
          fontWeight: 500,
        }}
      >
        <div className="flex flex-col items-center gap-1 text-lg">
          <div>{isLoading ? renderLoader() : presentValue}</div>

          {!isLoading && (
            <div className="w-6 border-t border-gray-400"></div>
          )}

          <div>{!isLoading ? TotalValue : null}</div>
        </div>
      </div>
    </div>
  );
};

export default CardStuStaf;
