// try code for removing 0 in the bar of graph
import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import axios from "axios";
import Loader from "../../common/LoaderFinal/DashboardLoadder/Loader";

const StudentsChart = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [data, setData] = useState([]);
  const [barCategoryGap, setBarCategoryGap] = useState("40%");
  const [xAxisFontSize, setXAxisFontSize] = useState(6);
  const [xAxisTickMargin, setXAxisTickMargin] = useState(5);
  const [xAxisTickWidth, setXAxisTickWidth] = useState(1);
  const [labelFontSize, setLabelFontSize] = useState("0.6em");
  const [loading, setLoading] = useState(false);
  const [hoveredSectionKey, setHoveredSectionKey] = useState(null);
  const [attendanceMap, setAttendanceMap] = useState({});

  useEffect(() => {
    const updateBarCategoryGap = () => {
      if (window.innerWidth > 768) {
        setBarCategoryGap("20%");
        setXAxisFontSize(12);
        setXAxisTickMargin(6);
        setXAxisTickWidth(7);
        setLabelFontSize("0.8em");
      } else {
        setBarCategoryGap("15%");
        setXAxisFontSize(".4em");
        setXAxisTickMargin(1);
        setXAxisTickWidth(8);
        setLabelFontSize("0.4em");
      }
    };

    updateBarCategoryGap();
    window.addEventListener("resize", updateBarCategoryGap);
    return () => window.removeEventListener("resize", updateBarCategoryGap);
  }, []);

  useEffect(() => {
    setLoading(true);

    // const fetchData = async () => {
    //   try {
    //     const token = localStorage.getItem("authToken");
    //     const academicYear = localStorage.getItem("academicYear");
    //     if (!token) throw new Error("No authentication token found");

    //     const response = await axios.get(
    //       `${API_URL}/api/attendance/analytics/graph`,
    //       {
    //         headers: {
    //           Authorization: `Bearer ${token}`,
    //           "X-Academic-Year": academicYear,
    //         },
    //       },
    //     );

    //     // 🔹 1. Log raw API response
    //     console.log("RAW API RESPONSE 👉", response.data.data);

    //     if (!response?.data?.data?.length) {
    //       setData([]);
    //       return;
    //     }

    //     const transformed = response.data.data.map((cls) => {
    //       const obj = { class: cls.class_name };

    //       cls.sections.forEach((sec) => {
    //         obj[`Division-${sec.section}`] = sec.strength;
    //       });

    //       return obj;
    //     });

    //     // const transformed = response.data.data.map((cls) => {
    //     //   const obj = { class: cls.class_name };

    //     //   cls.sections.forEach((sec) => {
    //     //     const key = `Division-${sec.section}`;

    //     //     // ✅ used by bar height
    //     //     obj[key] = sec.strength;

    //     //     // ✅ hidden metadata (tooltip only)
    //     //     obj[`${key}-Present`] = sec.present;
    //     //     obj[`${key}-Absent`] = sec.absent;
    //     //   });

    //     //   return obj;
    //     // });

    //     setData(transformed);

    //     setData(transformed);

    //     // 🔹 2. Log transformed data (used by BarChart)
    //     console.log("TRANSFORMED CHART DATA 👉", transformed);
    //   } catch (error) {
    //     console.error("Error fetching data:", error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const academicYear = localStorage.getItem("academicYear");

        if (!token) throw new Error("No authentication token found");

        const response = await axios.get(
          `${API_URL}/api/attendance/analytics/graph`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Academic-Year": academicYear,
            },
          },
        );

        const apiData = response?.data?.data || [];

        console.log("RAW API RESPONSE 👉", apiData);

        if (!apiData.length) {
          setData([]);
          setAttendanceMap({});
          return;
        }

        /* ---------------------------------------------------
       1️⃣ TRANSFORM DATA FOR BAR CHART (ONLY STRENGTH)
    --------------------------------------------------- */
        const chartData = apiData.map((cls) => {
          const row = { class: cls.class_name };

          cls.sections.forEach((sec) => {
            row[`Division-${sec.section}`] = sec.strength;
          });

          return row;
        });

        /* ---------------------------------------------------
       2️⃣ BUILD ATTENDANCE LOOKUP (FOR TOOLTIP ONLY)
    --------------------------------------------------- */
        const attendanceLookup = {};

        apiData.forEach((cls) => {
          cls.sections.forEach((sec) => {
            attendanceLookup[`${cls.class_name}-${sec.section}`] = {
              present: sec.present ?? 0,
              absent: sec.absent ?? 0,
            };
          });
        });

        /* ---------------------------------------------------
       3️⃣ UPDATE STATE
    --------------------------------------------------- */
        setData(chartData);
        setAttendanceMap(attendanceLookup);

        console.log("TRANSFORMED CHART DATA 👉", chartData);
        console.log("ATTENDANCE MAP 👉", attendanceLookup);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderCustomXAxisTick = ({ x, y, payload }) => {
    const fullClassName = payload.value;

    let shortName = fullClassName;

    if (fullClassName.includes(" - ")) {
      const parts = fullClassName.split(" - ");
      const subjectRaw = parts[1].trim().toLowerCase();

      const abbreviationMap = {
        science: "Sci",
        commerce: "Com",
        arts: "Art",
        humanities: "Hum",
        pcm: "PCM",
        pcb: "PCB",
        pcmb: "PCMB",
        bio: "Bio",
        biology: "Bio",
        math: "Math",
        maths: "Math",
        cs: "CS",
        "computer science": "CS",
        "physical education": "PE",
        pe: "PE",
        economics: "Eco",
        accounts: "Acc",
        accounting: "Acc",
        business: "Bus",
        "business studies": "Bus",
        english: "Eng",
        hindi: "Hin",
        history: "His",
        geography: "Geo",
        political: "Pol",
        "political science": "Pol",
        sociology: "Soc",
        psychology: "Psy",
      };

      // Match full key or best guess
      const matchedKey = Object.keys(abbreviationMap).find((key) =>
        subjectRaw.includes(key),
      );

      const abbr = matchedKey
        ? abbreviationMap[matchedKey]
        : subjectRaw.slice(0, 3).toUpperCase();

      shortName = `${parts[0]}-${abbr}`;
    }

    return (
      <g transform={`translate(${x},${y})`}>
        <title>{fullClassName}</title>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="middle"
          fontSize={xAxisFontSize}
          fill="#666"
        >
          {shortName}
        </text>
      </g>
    );
  };

  // const renderTooltip = ({ active, payload }) => {
  //   if (!active || !payload || !payload.length || !hoveredSectionKey)
  //     return null;

  //   const key = hoveredSectionKey; // ✅ REAL hovered section
  //   const section = key.replace("Division-", "");
  //   const data = payload[0].payload; // class data

  //   return (
  //     <div style={tooltipStyles}>
  //       <p className="mb-0">Class: {data.class}</p>
  //       {/* className="mb-0 */}
  //       <p className="mb-0">Section: {section}</p>
  //       <p className="mb-0">Total Students: {data[key]}</p>
  //       <p className="mb-0" style={{ color: "#34d399" }}>
  //         Present: {data[`${key}-Present`] ?? 0}
  //       </p>
  //       <p className="mb-0" style={{ color: "#FF5733" }}>
  //         Absent: {data[`${key}-Absent`] ?? 0}
  //       </p>
  //     </div>
  //   );
  // };

  const renderTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length || !hoveredSectionKey)
      return null;

    const key = hoveredSectionKey; // Division-A
    const section = key.replace("Division-", "");
    const data = payload[0].payload; // chart row
    const className = data.class;

    const attendance = attendanceMap[`${className}-${section}`] || {};

    return (
      <div style={tooltipStyles}>
        <p className="mb-0">Class: {className}</p>
        <p className="mb-0">Division: {section}</p>
        <p className="mb-0">Total Students: {data[key]}</p>

        <p className="mb-0" style={{ color: "#34d399" }}>
          Present: {attendance.present ?? 0}
        </p>

        <p className="mb-0" style={{ color: "#FF5733" }}>
          Absent: {attendance.absent ?? 0}
        </p>
      </div>
    );
  };

  const tooltipStyles = {
    boxSizing: "border-box",
    backgroundColor: "#fff",
    fontWeight: "bold",
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.33)",
    borderRadius: "5px",
    padding: "5px",
    paddingBottom: "0px",
    width: "100%",
    // fontSize: ".7em",
    fontSize: ".9em",
  };

  const labelStyles = {
    fontWeight: "bold",
    marginBottom: "5px",
  };

  const itemStyles = {
    margin: 0,
  };

  const totalStyles = {
    marginTop: "10px",
    fontWeight: "bold",
    fontSize: "1em",
  };

  // const sectionKeys = [
  //   ...new Set(
  //     data.flatMap((entry) =>
  //       Object.keys(entry).filter((key) => key.startsWith("Division-"))
  //     )
  //   ),
  // ];

  const sectionKeys = [
    ...new Set(
      data.flatMap((entry) =>
        Object.keys(entry).filter((key) => key.startsWith("Division-")),
      ),
    ),
  ];

  return (
    <>
      {loading ? (
        <p className="text-center relative top-[50%] w-10 m-auto">
          <Loader />
        </p>
      ) : data.length === 0 ? (
        <>
          <div className="flex flex-row justify-between items-center bg-gray-200 p-1 rounded-t-lg">
            <span className="lg:text-lg sm:text-xs sm:font-semibold text-gray-500">
              Class-wise Student Attendance Distribution
            </span>
          </div>
          <div className="relative top-10 left-[1%] w-[100%] text-center flex justify-center items-center mt-8 md:mt-14">
            <div className="flex flex-col items-center justify-center text-center ">
              {/* <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-400 to-pink-500 drop-shadow-md mb-3">
                Oops!
              </p> */}
              <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
                No data available.
              </p>
            </div>
          </div>
        </>
      ) : (
        <ResponsiveContainer width="100%" height="93%">
          <div className="flex flex-row justify-between items-center bg-gray-200 p-1 rounded-t-lg">
            <span className="lg:text-lg sm:text-xs sm:font-semibold text-gray-500">
              Class-wise Student Attendance Distribution
            </span>
          </div>
          <BarChart
            data={data}
            margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
            barCategoryGap={barCategoryGap}
          >
            <XAxis
              dataKey="class"
              tick={renderCustomXAxisTick}
              interval={0}
              tickMargin={xAxisTickMargin}
              tickSize={xAxisTickWidth}
            />

            <YAxis />
            <Tooltip content={renderTooltip} />
            <Legend />

            {sectionKeys.map((section, index) => (
              <Bar
                key={section}
                dataKey={section}
                stackId="a"
                fill={colors[index % colors.length]}
                onMouseEnter={() => setHoveredSectionKey(section)}
              >
                <LabelList
                  dataKey={section}
                  formatter={() => section.replace("Division-", "")}
                  fill="white"
                  style={{ fontSize: labelFontSize, fontWeight: "bold" }}
                />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </>
  );
};

const colors = [
  "#00FFFF",
  "#34d399",
  "#a78bfa",
  "#E77EE7",
  "#FF5733",
  "#C70039",
  "#B58B00",
  "#1C4592",
  "#581845",
  "#900C3F",
  "#FF69B4",
  "#40E0D0",
  "#FFB6C1",
  "#6495ED",
  "#FF4500",
  "#228B22",
  "#8A2BE2",
  "#FF00FF",
  "#CD5C5C",
  "#20B2AA",
];

export default StudentsChart;
