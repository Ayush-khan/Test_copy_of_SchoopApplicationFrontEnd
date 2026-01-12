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
  Label,
  CartesianGrid,
  ReferenceLine,
  Cell,
} from "recharts";
import Select from "react-select";
import axios from "axios";
import Loader from "../common/LoaderFinal/DashboardLoadder/Loader";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

import { MdClass } from "react-icons/md";

const ClassWiseAcademicPerformance = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [data, setData] = useState([]);
  const [barCategoryGap, setBarCategoryGap] = useState("40%");
  const [xAxisFontSize, setXAxisFontSize] = useState(7);
  const [xAxisTickMargin, setXAxisTickMargin] = useState(5);
  const [xAxisTickWidth, setXAxisTickWidth] = useState(1);
  const [labelFontSize, setLabelFontSize] = useState("0.6em");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [roleId, setRoleId] = useState(null);
  const [regId, setRegId] = useState(null);
  const [teacherCardsData, setTeachersCardsData] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classIdForManage, setclassIdForManage] = useState("");
  const [sectionIdForManage, setSectionIdForManage] = useState("");

  const [nameError, setNameError] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const updateBarCategoryGap = () => {
      if (window.innerWidth > 768) {
        setBarCategoryGap("20%");
        setXAxisFontSize(14);
        setXAxisTickMargin(10);
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

        const classOrder = [
          "Nursery",
          "LKG",
          "UKG",
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9",
          "10",
          "11",
          "12",
        ];

        const sortedData = filteredData.sort(
          (a, b) => classOrder.indexOf(a.class) - classOrder.indexOf(b.class)
        );

        setData(sortedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    fetchRoleId();
  }, []);

  useEffect(() => {
    if (!roleId) return;

    fetchClassNames();
    fetchTeachersCardData();
  }, [roleId]);

  const fetchRoleId = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      toast.error("Authentication token not found Please login again");
      navigate("/");
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

      if (roleId) {
        setRoleId(roleId);
      } else {
        console.warn("role_id not found in sessionData response");
      }
    } catch (error) {
      console.error("Failed to fetch session data:", error);
    }
  };

  const fetchClassNames = async () => {
    try {
      const token = localStorage.getItem("authToken");

      // 🔹 If Teacher
      if (roleId === "T") {
        const responseForClass = await axios.get(
          `${API_URL}/api/get_teacherclasseswithclassteacher?teacher_id=${regId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const mappedData =
          responseForClass.data?.data?.map((item) => ({
            value: `${item.class_id}-${item.section_id}`,
            label: `${item.classname} ${item.sectionname}`,
            class_id: item.class_id,
            section_id: item.section_id,
          })) || [];

        setClasses(mappedData); // 👈 reuse same state
      }
      // 🔹 Admin / Other roles
      else {
        const response = await axios.get(`${API_URL}/api/get_class_section`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (Array.isArray(response.data)) {
          setClasses(response.data);
        } else {
          setError("Unexpected data format");
        }
      }
    } catch (error) {
      console.error("Error fetching class and section names:", error);
      setError("Error fetching class and section names");
    }
  };

  const classOptions = classes.map((cls) => ({
    value: cls.value || `${cls?.get_class?.name}-${cls.name}`,
    label: cls.label || `${cls?.get_class?.name} ${cls.name}`,
    class_id: cls.class_id,
    section_id: cls.section_id,
  }));

  useEffect(() => {
    if (!selectedClass && classOptions.length > 0) {
      const defaultClass = classOptions[0];

      setSelectedClass(defaultClass);
      setclassIdForManage(defaultClass.class_id);
      setSectionIdForManage(defaultClass.section_id);

      fetchTeachersCardData(defaultClass.class_id, defaultClass.section_id);
    }
  }, [classOptions, selectedClass]);

  const handleClassSelect = (selectedOption) => {
    setSelectedClass(selectedOption);

    if (selectedOption) {
      setclassIdForManage(selectedOption.class_id);
      setSectionIdForManage(selectedOption.section_id);

      fetchTeachersCardData(selectedOption.class_id, selectedOption.section_id);
    } else {
      setclassIdForManage("");
      setSectionIdForManage("");
    }
  };

  // const handleClassSelect = (selectedOption) => {
  //   setSelectedClass(selectedOption);

  //   if (selectedOption) {
  //     setclassIdForManage(selectedOption.class_id);
  //     setSectionIdForManage(selectedOption.section_id);

  //     fetchTeachersCardData(selectedOption.class_id, selectedOption.section_id);
  //   } else {
  //     setclassIdForManage("");
  //     setSectionIdForManage("");
  //   }
  // };

  // const transformPerformanceData = (data) => {
  //   // Map each subject to chart data
  //   return data.map((item) => ({
  //     subject: item.subject_name, // X-axis
  //     averageMarks: item.average_marks, // Y-axis
  //   }));
  // };

  const transformPerformanceData = (performanceData) => {
    return performanceData.map((item) => ({
      subject: item.subject_name,
      averageMarks: item.average_percentage,
      studentCount: item.studentCount,
      totalMarks: item.totalMarksStudentGot,
      outOfTotal: item.outOfTotalMarks,
    }));
  };

  const fetchTeachersCardData = async (class_id, section_id) => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      toast.error("Authentication token not found. Please login again");
      navigate("/");
      return;
    }

    try {
      const queryParams = new URLSearchParams({
        class_id,
        section_id,
      }).toString();

      const response = await axios.get(
        `${API_URL}/api/teachers/${regId}/dashboard/graph?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const teacherCards = response?.data?.data;
      console.log("Teacher ticket applicant list:", teacherCards);

      const performanceData = teacherCards?.performanceData || [];
      const chartData = transformPerformanceData(performanceData);

      setData(chartData);
      setTeachersCardsData(teacherCards);
    } catch (error) {
      console.error("Failed to fetch session data:", error);
    }
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
        <div className="h-[285px] flex justify-center items-center">
          <Loader />
        </div>
      ) : data.length === 0 ? (
        <div className="h-[285px] bg-white rounded-lg shadow">
          <div className="flex justify-between items-center bg-gray-200 p-2 rounded-t-lg">
            <span className="lg:text-lg sm:text-xs font-semibold text-gray-600">
              Class-wise Academic Performance
            </span>

            <div className="w-23 sm:w-23">
              <Select
                options={classOptions}
                value={selectedClass}
                onChange={handleClassSelect}
                placeholder="Select Class"
                // isClearable
                className="text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col justify-center items-center h-[230px]">
            <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-400 to-pink-500 mb-2">
              Oops!
            </p>
            <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
              No data available.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="flex justify-between items-center bg-gray-200 p-2 rounded-t-lg">
            <span className="lg:text-lg sm:text-xs font-semibold text-gray-600">
              Class-wise Academic Performance
            </span>
            <div className="flex items-center gap-2">
              {/* <div className="min-w-[160px]">
                <Select
                  options={classOptions}
                  value={selectedClass}
                  onChange={handleClassSelect}
                  placeholder="Select Class"
                  // isClearable
                  className="text-sm"
                  classNamePrefix="react-select"
                />
              </div> */}

              <label
                htmlFor="class-select"
                className="text-sm sm:text-xs font-semibold text-gray-500"
              >
                Select Class:
              </label>

              <select
                id="class-select"
                value={
                  selectedClass
                    ? `${selectedClass.class_id}-${selectedClass.section_id}`
                    : ""
                }
                onChange={(e) => {
                  const value = e.target.value;

                  if (!value) {
                    handleClassSelect(null);
                    return;
                  }

                  const selected = classOptions.find(
                    (opt) => opt.value === value
                  );

                  handleClassSelect(selected);
                }}
                className="block h-fit px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:cursor-pointer focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500 sm:text-sm font-semibold min-w-[120px]"
              >
                <option value="">Select</option>

                {classOptions.length === 0 ? (
                  <option value="">No classes available</option>
                ) : (
                  classOptions.map((cls) => (
                    <option key={cls.value} value={cls.value}>
                      {cls.label}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm pl-4 pr-4 pt-2 pb-1">
            {data?.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data} barCategoryGap={30}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E5E7EB"
                  />
                  <XAxis
                    dataKey="subject"
                    tick={{ fontSize: 12 }}
                    axisLine={{ stroke: "#9CA3AF" }}
                    tickLine={{ stroke: "#9CA3AF" }}
                  >
                    <Label
                      value="Subjects"
                      position="insideBottom"
                      offset={-1}
                      style={{
                        textAnchor: "middle",
                        fill: "#EC4899",
                        fontSize: 14,
                        fontWeight: "700",
                        fontFamily: "Inter, sans-serif",
                      }}
                    />
                  </XAxis>

                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 20, 40, 60, 80, 100]}
                    axisLine={{ stroke: "#9CA3AF" }}
                    tickLine={{ stroke: "#9CA3AF" }}
                    allowDecimals={false}
                  >
                    <Label
                      value="Average Percentage (%)"
                      angle={-90}
                      position="insideLeft"
                      style={{
                        textAnchor: "middle",
                        fill: "#EC4899",
                        fontSize: 14,
                        fontWeight: "700",
                        fontFamily: "Inter, sans-serif",
                      }}
                    />
                  </YAxis>

                  {/* <ReferenceLine
                    y={35}
                    stroke="#EF4444"
                    strokeDasharray="4 4"
                    label={{
                      value: "Pass Mark (35%)",
                      position: "right",
                      fill: "#EF4444",
                      fontSize: 11,
                      fontWeight: "600",
                    }}
                  /> */}

                  <Tooltip
                    cursor={{ fill: "rgba(99,102,241,0.08)" }}
                    content={({ payload }) => {
                      if (!payload || !payload.length) return null;
                      const d = payload[0].payload;

                      return (
                        <div className="bg-white border rounded-lg p-2 text-xs space-y-0 shadow">
                          <p className="font-bold mb-0 text-pink-500">
                            {d.subject}
                          </p>
                          <p>
                            📊 Avg Percentage: <b>{d.averageMarks}</b>
                          </p>
                          <p>
                            👨‍🎓 Students: <b>{d.studentCount}</b>
                          </p>
                          {/* <p>
                            📝 Total:{" "}
                            <b>
                              {d.totalMarks}/{d.outOfTotal}
                            </b>
                          </p> */}
                        </div>
                      );
                    }}
                  />
                  <Bar
                    dataKey="averageMarks"
                    fill="#6366F1"
                    radius={[10, 10, 0, 0]}
                  />

                  {/* <Bar dataKey="averageMarks" radius={[10, 10, 0, 0]}>
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.averageMarks >= 60
                            ? "#22C55E" // Green
                            : entry.averageMarks >= 35
                            ? "#F59E0B" // Yellow
                            : "#EF4444" // Red
                        }
                      />
                    ))}
                  </Bar> */}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-gray-400 text-sm">
                Select a class to view performance data
              </div>
            )}
          </div>

          {/* <div className="px-4 ">
            {data?.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data} barCategoryGap={20}>
                  <XAxis
                    dataKey="subject"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                  />
                  <YAxis allowDecimals={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: "rgba(99,102,241,0.1)" }}
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "10px",
                      border: "1px solid #e5e7eb",
                      fontSize: "12px",
                    }}
                    formatter={(value) => [`${value}`, "Average Marks"]}
                  />
                  <Legend />
                  <Bar
                    dataKey="averageMarks"
                    name="Average Marks"
                    fill="#6366F1"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[260px] text-gray-400 text-sm">
                Select a class to view performance data
              </div>
            )}
          </div> */}
        </div>
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

export default ClassWiseAcademicPerformance;
