// Second try WIth API calling
import { useState, useEffect } from "react";
import { PieChart, Pie, Cell } from "recharts";
import axios from "axios";
import styles from "../Charts/StudentStyle.module.css";
import Loader from "../../common/LoaderFinal/DashboardLoadder/Loader";
const COLORS = ["#00FFFF", "#A287F3", "#34D399", "#EE82EE"]; // Define your colors
const HouseStudentChart = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [newDepartmentId, setNewDepartmentId] = useState("Nursery");
  const [sectionsData, setSectionsData] = useState({});
  const [houseNames, setHouseNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const fetchClassNames = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          `${API_URL}/api/get_class_for_division`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (Array.isArray(response.data)) {
          setClasses(response.data);
        } else {
          setError("Unexpected data format");
        }
      } catch (error) {
        console.error("Error fetching class names:", error);
      }
    };

    fetchClassNames();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      setSectionsData({}); // Reset data before the API call
      setHouseNames([]); // Reset house names before the API call

      try {
        const token = localStorage.getItem("authToken");
        const academicYr = localStorage.getItem("academicYear");
        console.log("academic year", academicYr);
        console.log("token is", token);

        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await axios.get(`${API_URL}/api/getHouseViseStudent`, {
          params: {
            class_name: newDepartmentId,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = response.data;

        if (!data || !data.length) {
          setError("No data returned from API");
          console.warn("No data returned from API");
          return; // Exit early if data is empty
        }

        // Transforming data into the structure needed for the pie charts
        const transformedData = data.reduce((acc, curr) => {
          if (!acc[curr.class_section]) {
            acc[curr.class_section] = [];
          }
          acc[curr.class_section].push({
            name: curr.house_name || "No House",
            value: curr.student_counts,
            color: curr.color_code || "#CCCCCC", // fallback color
          });
          return acc;
        }, {});

        setSectionsData(transformedData);

        // Extract unique house names
        const uniqueHouseNames = [
          ...new Set(data.map((item) => item.house_name || "No House")),
        ];
        setHouseNames(uniqueHouseNames);
      } catch (error) {
        setError("Error fetching class data");
        console.error("Error fetching class data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [newDepartmentId]);

  const handleChangeDepartmentId = (e) => {
    const { value } = e.target;

    setNewDepartmentId(value);
  };

  const renderPieChart = (section) => (
    <PieChart width={157} height={118}>
      <Pie
        dataKey="value"
        startAngle={180}
        endAngle={0}
        data={sectionsData[section]}
        cx="48%"
        cy="80%"
        outerRadius={50}
        fill="#8884d8"
        label
      >
        {sectionsData[section]?.map((entry, index) => (
          // <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          <Cell key={`cell-${index}`} fill={entry.color || "#CCCCCC"} />
        ))}
      </Pie>
    </PieChart>
  );

  return (
    <div
      className={`${styles.studenChart} flex flex-col w-full   lg:h-[18.2rem]`}
    >
      <div className="flex flex-row justify-between items-center bg-gray-200 p-1">
        <span className="lg:text-lg sm:text-xs sm:font-semibold text-gray-500">
          House Chart
        </span>
        <div className="w-64 sm:w-1/2 flex flex-row justify-end items-center gap-x-2">
          <label
            htmlFor="class-select"
            className="text-sm sm:text-xs font-semibold text-gray-500"
          >
            Select Class:
          </label>
          <select
            id="class-select"
            value={newDepartmentId}
            onChange={handleChangeDepartmentId}
            className="block h-fit px-2 bg-gray-100 border border-gray-950 rounded-md shadow-sm hover:cursor-pointer focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-semibold"
          >
            <option value="">Select </option>
            {/* {classes.map((cls, index) => (
                          <option key={index} value={cls}>
                            {cls}
                          </option>
                        ))} */}
            {classes.length === 0 ? (
              <option value="">No classes available</option>
            ) : (
              classes.map((cls) => (
                <option
                  key={cls.class_id}
                  value={cls.name}
                  className="max-h-20 overflow-y-scroll "
                >
                  {cls.name}
                </option>
              ))
            )}
          </select>
        </div>
      </div>
      {/* {error && <p className="text-red-500 ">{error}</p>} */}
      {loading ? (
        <p className="text-center  w-10  m-auto  ">
          <Loader />
        </p>
      ) : sectionsData && Object.keys(sectionsData).length > 0 ? (
        <div
          className={`flex mt-2 rounded-lg ${styles.customScrollbar} w-full `}
        >
          {Object.keys(sectionsData).map((section) => (
            <div
              key={section}
              className="flex   flex-col justify-center items-center gap-y-8 w-full px-4 box-border"
              style={{ alignItems: "center" }}
            >
              <p className="text-gray-400 relative top-5 font-bold text-md mb-0 pb-0">{`Section-${section}`}</p>
              {renderPieChart(section)}
              <ul className=" list-disc grid grid-cols-2 gap-x-6 mr-6 text-xs font-bold text-center">
                {sectionsData[section]?.map((entry, index) => (
                  <li
                    key={entry.name || `house-no-${index}`}
                    // style={{ color: COLORS[index % COLORS.length] }}
                    style={{ color: entry.color || "#CCCCCC" }}
                  >
                    {entry.name ? `${entry.name}` : "House-NO"}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="relative left-[1%] w-[100%] text-center flex justify-center items-center mt-8 md:mt-14">
          <div className="flex flex-col items-center justify-center text-center ">
            <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-400 to-pink-500 drop-shadow-md mb-3">
              Oops!{" "}
            </p>

            <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
              No data available for the selected class.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HouseStudentChart;
