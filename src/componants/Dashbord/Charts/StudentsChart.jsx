// Arranged the classs for accending order and make changes in the secions PCM and PCB etc baranches
// SECOND TRY FOR IMPLEMENTING THE CLASS FOR 11 AND 12 LIKE PCM AND MATHS
// import { useState, useEffect } from "react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   LabelList,
// } from "recharts";
// import axios from "axios";
// import Loader from "../../common/Loader";

// const StudentsChart = () => {
//   const API_URL = import.meta.env.VITE_API_URL; // Base URL for your API
//   const [data, setData] = useState([]);
//   const [barCategoryGap, setBarCategoryGap] = useState("40%");
//   const [xAxisFontSize, setXAxisFontSize] = useState(7);
//   const [xAxisTickMargin, setXAxisTickMargin] = useState(5);
//   const [xAxisTickWidth, setXAxisTickWidth] = useState(1);
//   const [labelFontSize, setLabelFontSize] = useState("0.6em");
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const updateBarCategoryGap = () => {
//       if (window.innerWidth > 768) {
//         setBarCategoryGap("20%");
//         setXAxisFontSize(14);
//         setXAxisTickMargin(10);
//         setXAxisTickWidth(7);
//         setLabelFontSize("0.8em");
//       } else {
//         setBarCategoryGap("15%");
//         setXAxisFontSize(".4em");
//         setXAxisTickMargin(1);
//         setXAxisTickWidth(8);
//         setLabelFontSize("0.4em");
//       }
//     };

//     updateBarCategoryGap();
//     window.addEventListener("resize", updateBarCategoryGap);

//     return () => window.removeEventListener("resize", updateBarCategoryGap);
//   }, []);

//   useEffect(() => {
//     setLoading(true);

//     const fetchData = async () => {
//       try {
//         const token = localStorage.getItem("authToken");
//         const academicYear = localStorage.getItem("academicYear");
//         if (!token) {
//           throw new Error("No authentication token found");
//         }

//         const response = await axios.get(
//           `${API_URL}/api/getClassDivisionTotalStudents`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "X-Academic-Year": academicYear,
//             },
//           }
//         );

//         console.log("The response response of charts", response.data);

//         if (!response?.data?.length) {
//           // Handle empty data case
//           console.warn("API returned no data.");
//           setData([]); // Set an empty array if there's no data
//           return;
//         }

//         // Process the data to aggregate sections under each class
//         const apiData = response.data.reduce((acc, item) => {
//           const existingClass = acc.find(
//             (entry) => entry.class === item.class_name
//           );
//           const students = isNaN(parseInt(item.total_students, 10))
//             ? 0
//             : parseInt(item.total_students, 10);

//           if (existingClass) {
//             existingClass[`Section-${item.section_name}`] = students;
//           } else {
//             acc.push({
//               class: item.class_name,
//               [`Section-${item.section_name}`]: students,
//             });
//           }
//           return acc;
//         }, []);

//         // Sort data by class name
//         const classOrder = [
//           "Nursery",
//           "LKG",
//           "UKG",
//           "1",
//           "2",
//           "3",
//           "4",
//           "5",
//           "6",
//           "7",
//           "8",
//           "9",
//           "10",
//           "11",
//           "12",
//         ];
//         const sortedData = apiData.sort(
//           (a, b) => classOrder.indexOf(a.class) - classOrder.indexOf(b.class)
//         );

//         setData(sortedData);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   const renderTooltip = ({ active, payload, label }) => {
//     if (active && payload && payload.length) {
//       const sectionData = payload[0].payload;
//       const totalStudents = Object.keys(sectionData)
//         .filter((key) => key.startsWith("Section-"))
//         .reduce((total, key) => total + (sectionData[key] || 0), 0);

//       return (
//         <div className="custom-tooltip" style={tooltipStyles}>
//           <p style={labelStyles}>{`Class: ${sectionData.class}`}</p>
//           {payload.map((entry, index) => (
//             <p
//               key={`item-${index}`}
//               style={{ ...itemStyles, color: entry.color }}
//             >{`${entry.name}: ${entry.value}`}</p>
//           ))}
//           <p style={totalStyles}>{`Total Students: ${totalStudents}`}</p>
//         </div>
//       );
//     }

//     return null;
//   };

//   const tooltipStyles = {
//     boxSizing: "border-box",
//     backgroundColor: "#fff",
//     fontWeight: "bold",
//     boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.33)",
//     borderRadius: "5px",
//     padding: "10px",
//     paddingBottom: "0px",
//     width: "100%",
//     fontSize: ".7em",
//   };

//   const labelStyles = {
//     fontWeight: "bold",
//     marginBottom: "5px",
//   };

//   const itemStyles = {
//     margin: 0,
//   };

//   const totalStyles = {
//     marginTop: "10px",
//     fontWeight: "bold",
//     fontSize: "1em",
//   };

//   // Extract all section keys dynamically
//   const sectionKeys = [
//     ...new Set(
//       data.flatMap((entry) =>
//         Object.keys(entry).filter((key) => key.startsWith("Section-"))
//       )
//     ),
//   ];

//   return (
//     // <>
//     //   {" "}
//     //   {loading ? (
//     //     <p className="text-center relative top-[50%] w-10  m-auto  ">
//     //       <Loader />
//     //     </p>
//     //   ) : (
//     //     <ResponsiveContainer
//     //       width="100%"
//     //       height="93%"
//     //       style={{
//     //         margin: "auto",
//     //       }}
//     //     >
//     //       <div className="flex flex-row justify-between items-center bg-gray-200 p-1 rounded-t-lg">
//     //         <span className="lg:text-lg sm:text-xs sm:font-semibold text-gray-500">
//     //           Class-wise Student Distribution
//     //         </span>
//     //       </div>
//     //       <BarChart
//     //         data={data}
//     //         margin={{
//     //           top: 20,
//     //           right: 20,
//     //           left: 20,
//     //           bottom: 20,
//     //         }}
//     //         barCategoryGap={barCategoryGap}
//     //       >
//     //         <XAxis
//     //           dataKey="class"
//     //           tick={{ fontSize: xAxisFontSize }}
//     //           interval={0}
//     //           tickMargin={xAxisTickMargin}
//     //           tickSize={xAxisTickWidth}
//     //         />
//     //         <YAxis />
//     //         <Tooltip content={renderTooltip} />
//     //         <Legend />
//     //         {sectionKeys.map((section, index) => (
//     //           <Bar
//     //             key={section}
//     //             dataKey={section}
//     //             stackId="a"
//     //             fill={colors[index % colors.length]}
//     //           >
//     //             <LabelList
//     //               dataKey={section}
//     //               fill="white"
//     //               style={{ fontSize: labelFontSize }}
//     //             />
//     //           </Bar>
//     //         ))}
//     //       </BarChart>
//     //     </ResponsiveContainer>
//     //   )}
//     // </>
//     <>
//       {loading ? (
//         <p className="text-center relative top-[50%] w-10 m-auto">
//           <Loader />
//         </p>
//       ) : data.length === 0 ? (
//         // Show the no data available message when data is empty
//         <div className="relative left-[1%] w-[100%] text-center flex justify-center items-center mt-8 md:mt-14">
//           <div className="flex flex-col items-center justify-center text-center py-10 animate-bounce">
//             <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-400 to-pink-500 drop-shadow-md mb-3">
//               Oops!{" "}
//             </p>

//             <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
//               No data available.
//             </p>
//           </div>
//         </div>
//       ) : (
//         <ResponsiveContainer
//           width="100%"
//           height="93%"
//           style={{
//             margin: "auto",
//           }}
//         >
//           <div className="flex flex-row justify-between items-center bg-gray-200 p-1 rounded-t-lg">
//             <span className="lg:text-lg sm:text-xs sm:font-semibold text-gray-500">
//               Class-wise Student Distribution
//             </span>
//           </div>
//           <BarChart
//             data={data}
//             margin={{
//               top: 20,
//               right: 20,
//               left: 20,
//               bottom: 20,
//             }}
//             barCategoryGap={barCategoryGap}
//           >
//             <XAxis
//               dataKey="class"
//               tick={{ fontSize: xAxisFontSize }}
//               interval={0}
//               tickMargin={xAxisTickMargin}
//               tickSize={xAxisTickWidth}
//             />
//             <YAxis />
//             <Tooltip content={renderTooltip} />
//             <Legend />
//             {/* Tatal is show in the top of the each graphbar */}
//             {/* {sectionKeys.map((section, index) => (
//               <Bar
//                 key={section}
//                 dataKey={section}
//                 stackId="a"
//                 fill={colors[index % colors.length]}
//               >
//                 <LabelList
//                   content={({ value, x, y, width, height }) =>
//                     value > 0 ? (
//                       <text
//                         x={x + width / 2}
//                         y={y}
//                         dy={-4}
//                         fill="black"
//                         fontSize={labelFontSize}
//                         textAnchor="middle"
//                       >
//                         {value}
//                       </text>
//                     ) : null
//                   }
//                 />
//               </Bar>
//             ))} */}

//             {/* old code */}
//             {sectionKeys.map((section, index) => (
//               <Bar
//                 key={section}
//                 dataKey={section}
//                 stackId="a"
//                 fill={colors[index % colors.length]}
//               >
//                 <LabelList
//                   dataKey={section}
//                   fill="white"
//                   style={{ fontSize: labelFontSize }}
//                 />
//               </Bar>
//             ))}
//           </BarChart>
//         </ResponsiveContainer>
//       )}
//     </>
//   );
// };

// const colors = [
//   "#00FFFF",
//   "#34d399",
//   "#a78bfa",
//   "#E77EE7",
//   "#FF5733",
//   "#C70039",
//   "#B58B00",
//   "#1C4592",
//   "#581845",
//   "#900C3F",
//   "#FF69B4",
//   "#40E0D0",
//   "#FFB6C1",
//   "#6495ED",
//   "#FF4500",
//   "#228B22",
//   "#8A2BE2",
//   "#FF00FF",
//   "#CD5C5C",
//   "#20B2AA",
// ];

// export default StudentsChart;

// import { useState, useEffect } from "react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   LabelList,
// } from "recharts";
// import axios from "axios";
// import Loader from "../../common/Loader";

// const StudentsChart = () => {
//   const API_URL = import.meta.env.VITE_API_URL;
//   const [data, setData] = useState([]);
//   const [barCategoryGap, setBarCategoryGap] = useState("40%");
//   const [xAxisFontSize, setXAxisFontSize] = useState(7);
//   const [xAxisTickMargin, setXAxisTickMargin] = useState(5);
//   const [xAxisTickWidth, setXAxisTickWidth] = useState(1);
//   const [labelFontSize, setLabelFontSize] = useState("0.6em");
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const updateBarCategoryGap = () => {
//       if (window.innerWidth > 768) {
//         setBarCategoryGap("20%");
//         setXAxisFontSize(14);
//         setXAxisTickMargin(10);
//         setXAxisTickWidth(7);
//         setLabelFontSize("0.8em");
//       } else {
//         setBarCategoryGap("15%");
//         setXAxisFontSize(".4em");
//         setXAxisTickMargin(1);
//         setXAxisTickWidth(8);
//         setLabelFontSize("0.4em");
//       }
//     };

//     updateBarCategoryGap();
//     window.addEventListener("resize", updateBarCategoryGap);
//     return () => window.removeEventListener("resize", updateBarCategoryGap);
//   }, []);

//   useEffect(() => {
//     setLoading(true);

//     const fetchData = async () => {
//       try {
//         const token = localStorage.getItem("authToken");
//         const academicYear = localStorage.getItem("academicYear");
//         if (!token) throw new Error("No authentication token found");

//         const response = await axios.get(
//           `${API_URL}/api/getClassDivisionTotalStudents`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "X-Academic-Year": academicYear,
//             },
//           }
//         );

//         if (!response?.data?.length) {
//           console.warn("API returned no data.");
//           setData([]);
//           return;
//         }

//         // Process data to aggregate sections under each class
//         const apiData = response.data.reduce((acc, item) => {
//           const className = item.class_name;
//           const sectionName = `Section-${item.section_name}`;
//           const students = isNaN(parseInt(item.total_students, 10))
//             ? 0
//             : parseInt(item.total_students, 10);

//           const existingClass = acc.find((entry) => entry.class === className);
//           if (existingClass) {
//             existingClass[sectionName] = students;
//           } else {
//             acc.push({ class: className, [sectionName]: students });
//           }
//           return acc;
//         }, []);

//         // Filter out classes where all sections have 0 students
//         const filteredData = apiData.filter((classData) => {
//           const totalStudents = Object.values(classData)
//             .filter((value) => typeof value === "number")
//             .reduce((total, value) => total + value, 0);
//           return totalStudents > 0;
//         });

//         const classOrder = [
//           "Nursery",
//           "LKG",
//           "UKG",
//           "1",
//           "2",
//           "3",
//           "4",
//           "5",
//           "6",
//           "7",
//           "8",
//           "9",
//           "10",
//           "11",
//           "12",
//         ];

//         const sortedData = filteredData.sort(
//           (a, b) => classOrder.indexOf(a.class) - classOrder.indexOf(b.class)
//         );

//         setData(sortedData);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   const renderTooltip = ({ active, payload }) => {
//     if (active && payload && payload.length) {
//       const sectionData = payload[0].payload;
//       const totalStudents = Object.keys(sectionData)
//         .filter((key) => key.startsWith("Section-"))
//         .reduce((total, key) => total + (sectionData[key] || 0), 0);

//       return (
//         <div className="custom-tooltip" style={tooltipStyles}>
//           <p style={labelStyles}>{`Class: ${sectionData.class}`}</p>
//           {payload.map((entry, index) => (
//             <p
//               key={`item-${index}`}
//               style={{ ...itemStyles, color: entry.color }}
//             >{`${entry.name}: ${entry.value}`}</p>
//           ))}
//           <p style={totalStyles}>{`Total Students: ${totalStudents}`}</p>
//         </div>
//       );
//     }

//     return null;
//   };

//   const tooltipStyles = {
//     boxSizing: "border-box",
//     backgroundColor: "#fff",
//     fontWeight: "bold",
//     boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.33)",
//     borderRadius: "5px",
//     padding: "10px",
//     paddingBottom: "0px",
//     width: "100%",
//     fontSize: ".7em",
//   };

//   const labelStyles = {
//     fontWeight: "bold",
//     marginBottom: "5px",
//   };

//   const itemStyles = {
//     margin: 0,
//   };

//   const totalStyles = {
//     marginTop: "10px",
//     fontWeight: "bold",
//     fontSize: "1em",
//   };

//   const sectionKeys = [
//     ...new Set(
//       data.flatMap((entry) =>
//         Object.keys(entry).filter(
//           (key) => key.startsWith("Section-") && entry[key] > 0
//         )
//       )
//     ),
//   ];

//   return (
//     <>
//       {loading ? (
//         <p className="text-center relative top-[50%] w-10 m-auto">
//           <Loader />
//         </p>
//       ) : data.length === 0 ? (
//         <div className="relative left-[1%] w-[100%] text-center flex justify-center items-center mt-8 md:mt-14">
//           <div className="flex flex-col items-center justify-center text-center py-10 animate-bounce">
//             <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-400 to-pink-500 drop-shadow-md mb-3">
//               Oops!
//             </p>
//             <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
//               No data available.
//             </p>
//           </div>
//         </div>
//       ) : (
//         <ResponsiveContainer width="100%" height="93%">
//           <div className="flex flex-row justify-between items-center bg-gray-200 p-1 rounded-t-lg">
//             <span className="lg:text-lg sm:text-xs sm:font-semibold text-gray-500">
//               Class-wise Student Distribution
//             </span>
//           </div>
//           <BarChart
//             data={data}
//             margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
//             barCategoryGap={barCategoryGap}
//           >
//             <XAxis
//               dataKey="class"
//               tick={{ fontSize: xAxisFontSize }}
//               interval={0}
//               tickMargin={xAxisTickMargin}
//               tickSize={xAxisTickWidth}
//             />
//             <YAxis />
//             <Tooltip content={renderTooltip} />
//             <Legend />
//             {sectionKeys.map((section, index) => (
//               <Bar
//                 key={section}
//                 dataKey={section}
//                 stackId="a"
//                 fill={colors[index % colors.length]}
//               >
//                 <LabelList
//                   dataKey={section}
//                   content={({ value, x, y, width, height }) =>
//                     value > 0 ? (
//                       <text
//                         x={x + width / 2}
//                         y={y + height / 2}
//                         fill="white"
//                         fontSize={labelFontSize}
//                         textAnchor="middle"
//                         dominantBaseline="middle"
//                       >
//                         {value}
//                       </text>
//                     ) : null
//                   }
//                 />
//               </Bar>
//             ))}
//           </BarChart>
//         </ResponsiveContainer>
//       )}
//     </>
//   );
// };

// const colors = [
//   "#00FFFF",
//   "#34d399",
//   "#a78bfa",
//   "#E77EE7",
//   "#FF5733",
//   "#C70039",
//   "#B58B00",
//   "#1C4592",
//   "#581845",
//   "#900C3F",
//   "#FF69B4",
//   "#40E0D0",
//   "#FFB6C1",
//   "#6495ED",
//   "#FF4500",
//   "#228B22",
//   "#8A2BE2",
//   "#FF00FF",
//   "#CD5C5C",
//   "#20B2AA",
// ];

// export default StudentsChart;

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

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const academicYear = localStorage.getItem("academicYear");
        if (!token) throw new Error("No authentication token found");

        const response = await axios.get(
          `${API_URL}/api/getClassDivisionTotalStudents`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Academic-Year": academicYear,
            },
          }
        );

        if (!response?.data?.length) {
          console.warn("API returned no data.");
          setData([]);
          return;
        }

        // Process data to aggregate sections under each class
        const apiData = response.data.reduce((acc, item) => {
          const students = parseInt(item.total_students, 10);
          if (!students || isNaN(students)) return acc; // 🔴 Skip null or 0 students

          const existingClass = acc.find(
            (entry) => entry.class === item.class_name
          );

          if (existingClass) {
            existingClass[`Division-${item.section_name}`] = students;
          } else {
            acc.push({
              class: item.class_name,
              [`Division-${item.section_name}`]: students,
            });
          }
          return acc;
        }, []);

        // Filter out classes where all sections have 0 students
        const filteredData = apiData.filter((classData) => {
          const totalStudents = Object.values(classData)
            .filter((value) => typeof value === "number")
            .reduce((total, value) => total + value, 0);
          return totalStudents > 0;
        });
        const transformedData = filteredData.map((entry) => {
          const className = entry.class.includes(" - ")
            ? entry.class.replace(" - ", "\n")
            : entry.class;

          return { ...entry, class: className };
        });
        setData(transformedData);

        setData(filteredData);
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
        subjectRaw.includes(key)
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

  const renderTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const sectionData = payload[0].payload;
      const totalStudents = Object.keys(sectionData)
        .filter((key) => key.startsWith("Division-"))
        .reduce((total, key) => total + (sectionData[key] || 0), 0);

      return (
        <div className="custom-tooltip" style={tooltipStyles}>
          <p style={labelStyles}>{`Class: ${sectionData.class}`}</p>
          {payload.map((entry, index) => (
            <p
              key={`item-${index}`}
              style={{ ...itemStyles, color: entry.color }}
            >{`${entry.name}: ${entry.value}`}</p>
          ))}
          <p style={totalStyles}>{`Total Students: ${totalStudents}`}</p>
        </div>
      );
    }

    return null;
  };

  const tooltipStyles = {
    boxSizing: "border-box",
    backgroundColor: "#fff",
    fontWeight: "bold",
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.33)",
    borderRadius: "5px",
    padding: "10px",
    paddingBottom: "0px",
    width: "100%",
    fontSize: ".7em",
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

  const sectionKeys = [
    ...new Set(
      data.flatMap((entry) =>
        Object.keys(entry).filter((key) => key.startsWith("Division-"))
      )
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
              Class-wise Student Distribution
            </span>
          </div>
          <div className="relative top-10 left-[1%] w-[100%] text-center flex justify-center items-center mt-8 md:mt-14">
            <div className="flex flex-col items-center justify-center text-center ">
              <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-400 to-pink-500 drop-shadow-md mb-3">
                Oops!
              </p>
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
              Class-wise Student Distribution
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
              >
                <LabelList
                  dataKey={section}
                  fill="white"
                  style={{ fontSize: labelFontSize }}
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
