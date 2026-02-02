import styles from "../../CSS/DashbordCss/Card.module.css";
import { FaSpinner } from "react-icons/fa"; // Import the spinner icon

const Card = ({
  title,
  value,
  valuePendingFee,
  valueAbsent,
  spanLabel,
  valueTeacher,
  color,
  icon,
  roleId,        // ✅ parent se aa raha
  sortName,
  showDivider = false,
}) => {





  const isSacsM = sortName === "SACS" && roleId === "M";

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
    <>
      {["A", "P", "M"].includes(roleId) && (
        <>
          <div className="w-full bg-white flex items-center justify-around shadow-card h-28 rounded-lg">
            <div
              className={`flex items-center justify-between flex-col ${title === "Fee" ? "w-[35%] " : "w-1/2"
                }`}
            >
              {icon && (
                <div className={`${styles.icon} text-6xl text-blue-500`}>
                  {icon}
                </div>
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
                // width: "50%",
                width: isSacsM ? "80%" : "50%",
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
                  /* 🔹 Fee card */
                  <div className="mx-2 -space-y-2 text-[.7em]">
                    <div className="flex justify-between items-center gap-x-2">
                      <span className="text-green-700 font-semibold">
                        Collected:
                      </span>
                      <span className="text-green-600 font-semibold">
                        {new Intl.NumberFormat("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(value)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center gap-x-2">
                      <span className="text-red-700 font-semibold">
                        Pending:
                      </span>
                      <span className="text-red-600 font-semibold">
                        {new Intl.NumberFormat("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(valuePendingFee)}
                      </span>
                    </div>
                  </div>
                ) : title === "Defaulter List" ? (
                  /* 🔹 Defaulter List card (separate condition) */
                  <div className="mx-2 -space-y-2 text-[.7em]">
                    <div className="flex justify-between items-center gap-x-2">
                      <span className="text-green-700 font-semibold">
                        Student Count:
                      </span>
                      <span className="text-green-600 font-semibold">
                        {value}
                      </span>
                    </div>

                    <div className="flex justify-between items-center gap-x-2">
                      <span className="text-red-700 font-semibold">
                        Pending:
                      </span>
                      <span className="text-red-600 font-semibold">
                        {new Intl.NumberFormat("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(valuePendingFee)}
                      </span>
                    </div>
                  </div>
                ) : title === "Nursery" ||
                  title === "KG" ||
                  title === "School" ||
                  title === "Caretaker" ? (
                  <div className="mx-2 -space-y-0 text-[.7em]">
                    <div className="flex justify-between items-center gap-x-2">
                      <span className="text-green-700 font-semibold text-sm">
                        Present:
                      </span>
                      <span className="text-green-600 font-semibold text-sm">
                        {value}
                      </span>
                    </div>

                    <div className="flex justify-between items-center gap-x-2">
                      <span className="text-red-700 font-semibold text-sm">
                        Absent:
                      </span>
                      <span className="text-red-600 font-semibold text-sm">
                        {valueAbsent}
                      </span>
                    </div>
                    <div className="flex justify-between items-center gap-x-2">
                      <span className="text-blue-700 font-semibold text-sm">
                        Total:
                      </span>
                      <span className="text-blue-600 font-semibold text-sm">
                        {valuePendingFee}
                      </span>
                    </div>
                  </div>
                ) : title === "Lesson Plans" ? (
                  <div className="mx-2 space-y-1 text-[.7em]">
                    <div className="flex justify-between items-center gap-x-2">
                      <span className="text-blue-700 font-semibold text-xs">
                        No of Teachers:
                      </span>
                      <span className="text-blue-600 font-semibold text-xs">
                        {value}
                      </span>
                    </div>
                    <div className="flex justify-between items-center gap-x-2">
                      <span className="text-green-700 font-semibold text-xs">
                        Submitted:
                      </span>
                      <span className="text-green-600 font-semibold text-xs">
                        {valuePendingFee}
                      </span>
                    </div>

                    <div className="flex justify-between items-center gap-x-2">
                      <span className="text-red-700 font-semibold text-xs">
                        Not Submitted:
                      </span>
                      <span className="text-red-600 font-semibold text-xs">
                        {valueAbsent}
                      </span>
                    </div>
                    <div className="flex justify-between items-center gap-x-2 whitespace-nowrap">
                      <span className="text-orange-700 font-semibold text-xs ">
                        Pending for approval:
                      </span>
                      <span className="text-orange-600 font-semibold text-xs">
                        {valueTeacher}
                        {/* 100 */}
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
        </>
      )}

      {/* Teacher login Dashbord Cards */}
      {["T"].includes(roleId) && (
        <>
          <div className="w-full bg-white flex items-center justify-around shadow-card h-28 rounded-lg">
            <div
              className={`flex items-center justify-between flex-col ${title === "Fee" ? "w-[35%] " : "w-1/2"
                }`}
            >
              {icon && (
                <div className={`${styles.icon} text-6xl text-blue-500`}>
                  {icon}
                </div>
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
                  /* 🔹 Fee card */
                  <div className="mx-2 -space-y-2 text-[.7em]">
                    <div className="flex justify-between items-center gap-x-2">
                      <span className="text-green-700 font-semibold">
                        Collected:
                      </span>
                      <span className="text-green-600 font-semibold">
                        {new Intl.NumberFormat("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(value)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center gap-x-2">
                      <span className="text-red-700 font-semibold">
                        Pending:
                      </span>
                      <span className="text-red-600 font-semibold">
                        {new Intl.NumberFormat("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(valuePendingFee)}
                      </span>
                    </div>
                  </div>
                ) : title === "Defaulter List" ? (
                  /* 🔹 Defaulter List card (separate condition) */
                  <div className="mx-2 -space-y-0 text-[.7em]">
                    <div className="flex justify-between items-center gap-x-2 text-xs">
                      <span className="text-green-700 font-semibold">
                        Student Count:
                      </span>
                      <span className="text-green-600 font-semibold">
                        {value}
                      </span>
                    </div>

                    <div className="flex justify-between items-center gap-x-2 text-xs">
                      <span className="text-red-700 font-semibold">
                        Pending:
                      </span>
                      <span className="text-red-600 font-semibold">
                        {new Intl.NumberFormat("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(valuePendingFee)}
                      </span>
                    </div>
                  </div>
                ) : title === "Homework" ? (
                  <div className="mx-2 -space-y-2 text-[.7em]">
                    <div className="flex justify-between items-center gap-x-2 text-xs">
                      <span className=" text-red-700 font-semibold whitespace-nowrap">
                        Not Submitted:
                      </span>
                      <span className=" text-red-600 font-semibold whitespace-nowrap ">
                        {value}
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
        </>
      )}
    </>
  );
};

export default Card;
