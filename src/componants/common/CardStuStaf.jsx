import styles from "../../CSS/DashbordCss/Card.module.css";
import { FaArrowRightLong } from "react-icons/fa6";
import { FaSpinner } from "react-icons/fa"; // Import a spinner icon
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const CardStuStaf = ({
  title,
  TotalValue,
  presentValue,
  color,
  icon,
  roleId,
  badge,
  onCardClick,
}) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [sortNameCookie, setSortNameCookie] = useState("");
  const [regId, setRegId] = useState(null);
  const [roleIdT, setRoleId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRoleId();
  }, []);

  const isLoading = !(presentValue || TotalValue);
  const fetchRoleId = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      toast.error("Authentication token not found Please login again");

      return;
    }

    try {
      const response = await axios.get(`${API_URL}/api/sessionData`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const roleId = response?.data?.user?.role_id;
      console.log("role id", response?.data?.user?.role_id);

      const regId = response?.data?.user?.reg_id;
      console.log("reg id", response?.data?.user?.reg_id);
      setRegId(regId);
      setSortNameCookie(response?.data?.custom_claims?.short_name);
      if (roleId) {
        setRoleId(roleId);
      } else {
        console.warn("role_id not found in sessionData response");
      }
    } catch (error) {
      console.error("Failed to fetch session data:", error);
    }
  };

  const isSacsM = sortNameCookie === "SACS" && roleIdT === "M";

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

