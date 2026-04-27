import React, { useEffect, useRef, useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const EditHeathActivityRecordUpload = () => {
  const location = useLocation();
  const API_URL = import.meta.env.VITE_API_URL;
  const [loading, setLoading] = useState(false);
  const [loadingForSubmit, setLoadingForSubmit] = useState(false);

  // const { chapter } = location.state || {};
  // console.log("health and activity record", chapter);

  const { chapter, students = [], currentIndex = 0 } = location.state || {};

  const { id } = useParams();

  const formRef = useRef();

  useEffect(() => {
    formRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [id]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const containerRef = useRef();

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [id]);

  console.log("chapter", chapter);
  console.log("students", students);
  console.log("currentIndex", currentIndex);

  const [fieldParameter, setFieldParameter] = useState([]);

  const [formData, setFormData] = useState({});
  const [index, setIndex] = useState(currentIndex);

  const currentStudent = students.length > 0 ? students[index] : chapter;

  const navigate = useNavigate();

  // useEffect(() => {
  //   if (chapter && chapter.value) {
  //     try {
  //       const parsedData = JSON.parse(chapter.value);

  //       setFormData(parsedData); // dynamic set
  //     } catch (error) {
  //       console.error("JSON parse error:", error);
  //       setFormData({});
  //     }
  //   }
  // }, [chapter]);

  useEffect(() => {
    if (!students.length) return;

    const newIndex = students.findIndex(
      (stu) => String(stu.student_id) === String(id),
    );

    if (newIndex !== -1) {
      setIndex(newIndex);
    }
  }, [id, students]);

  useEffect(() => {
    if (!currentStudent) return;

    if (currentStudent.value) {
      try {
        const parsedData = JSON.parse(currentStudent.value);
        setFormData(parsedData);
      } catch (error) {
        console.error("JSON parse error:", error);
        setFormData({});
      }
    } else {
      setFormData({});
    }
  }, [currentStudent]);

  const fetchSessionData = async () => {
    const token = localStorage.getItem("authToken");

    try {
      const response = await axios.get(`${API_URL}/api/sessionData`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      console.log("response session data", response.data);

      if (response.data && response.data.user) {
        const { reg_id } = response.data.user;
        console.log("user reg id", response.data.user.reg_id);
        // Set staff name and reg_id
        setFormData((prevData) => ({
          ...prevData,
          reg_id: reg_id,
        }));
        // Call new teacher API with reg_id

        console.log("user fetch reg id", reg_id);
      } else {
        console.error("User data not found in the response");
      }
    } catch (error) {
      console.error("Error fetching session data:", error);
    }
  };

  const fetchFields = async () => {
    setLoading(true);
    const token = localStorage.getItem("authToken");

    try {
      const response = await axios.get(
        `${API_URL}/api/health_activity_parametergroup`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("response fileds data", response.data);
      setFieldParameter(response.data.data);
    } catch (error) {
      console.error("Error fetching session data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoadingForSubmit(true);

      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      // Step 1: Get all valid parameter names from API
      const validParams = fieldParameter.flatMap((group) =>
        group.parameters.map((param) => param.parameter_name),
      );

      // Step 2: Clean + filter only valid parameters
      const cleanedData = {};

      Object.keys(formData).forEach((key) => {
        if (validParams.includes(key)) {
          cleanedData[key] = formData[key] === "" ? null : formData[key];
        }
      });

      //  Debug (optional)
      console.log("Final Payload Data:", cleanedData);

      // Step 3: Prepare payload
      const payload = {
        value: JSON.stringify(cleanedData),
      };

      // Step 4: API Call
      const response = await axios.put(
        // `${API_URL}/api/update_health_record/${chapter.student_id}`,
        `${API_URL}/api/update_health_record/${currentStudent.student_id}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const { data } = response;

      //Success
      if (data.success) {
        toast.success("Health & Activity data updated successfully");

        setTimeout(() => {
          navigate("/healthActivityRecordUpload");
        }, 500);
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (error) {
      console.error("Error:", error);

      if (error.response) {
        toast.error(error.response.data.message || "Server error");
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setLoadingForSubmit(false);
    }
  };

  // const saveData = async () => {
  //   try {
  //     const token = localStorage.getItem("authToken");
  //     if (!token) throw new Error("No authentication token found");

  //     const validParams = fieldParameter.flatMap((group) =>
  //       group.parameters.map((param) => param.parameter_name),
  //     );

  //     const cleanedData = {};

  //     Object.keys(formData).forEach((key) => {
  //       if (validParams.includes(key)) {
  //         cleanedData[key] = formData[key] === "" ? null : formData[key];
  //       }
  //     });

  //     //  IMPORTANT CHECK (no data entered)
  //     const hasValue = Object.values(cleanedData).some(
  //       (val) => val !== null && val !== "",
  //     );

  //     if (!hasValue) {
  //       // No API call
  //       return true; // allow navigation but skip API
  //     }

  //     // Only now show loader
  //     setLoadingForSubmit(true);

  //     const payload = {
  //       value: JSON.stringify(cleanedData),
  //     };

  //     const response = await axios.put(
  //       `${API_URL}/api/update_health_record/${currentStudent.student_id}`,
  //       payload,
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //       },
  //     );

  //     if (response.data.success) {
  //       toast.success("Health & Activity data updated successfully");
  //       return true;
  //     } else {
  //       toast.error(response.data.message || "Update failed");
  //       return false;
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     toast.error("Error saving data");
  //     return false;
  //   } finally {
  //     setLoadingForSubmit(false);
  //   }
  // };

  const saveData = async () => {
    try {
      setLoadingForSubmit(true);

      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      const validParams = fieldParameter.flatMap((group) =>
        group.parameters.map((param) => param.parameter_name),
      );

      const cleanedData = {};

      Object.keys(formData).forEach((key) => {
        if (validParams.includes(key)) {
          cleanedData[key] = formData[key] === "" ? null : formData[key];
        }
      });

      const payload = {
        value: JSON.stringify(cleanedData),
      };

      const response = await axios.put(
        `${API_URL}/api/update_health_record/${currentStudent.student_id}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        toast.success("Health & Activity data updated successfully");
        return true;
      } else {
        toast.error(response.data.message || "Update failed");
        return false;
      }
    } catch (error) {
      console.error(error);
      toast.error("Error saving data");
      return false;
    } finally {
      setLoadingForSubmit(false);
    }
  };

  // const handleSubmit = async (event) => {
  //   event.preventDefault();

  //   const success = await saveData();

  //   if (success) {
  //     setTimeout(() => {
  //       navigate("/healthActivityRecordUpload"); // ONLY here
  //     }, 500);
  //   }
  // };

  const camelCase = (str) =>
    str
      ?.toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  useEffect(() => {
    fetchSessionData();
    fetchFields();
  }, []);

  return (
    // <div
    //   className="container mx-auto  flex items-center justify-center mt-3 "
    //   ref={formRef}
    // >
    <div
      className="container mx-auto mt-3"
      // ref={formRef}
    >
      <ToastContainer />
      <div
        className="card rounded-md w-full "
        // ref={containerRef}
      >
        <div className="p-2 px-3 bg-gray-100 border-none">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            {/* Title */}
            <h3 className="text-gray-700 text-base sm:text-lg lg:text-xl whitespace-nowrap">
              Edit Health & Activity Record
            </h3>

            {/* Scrollable blue strip */}
            <div className="overflow-x-auto scrollbar-hidden">
              <div className="min-w-max bg-blue-50 border-x-2 border-pink-500 rounded-md px-4 py-2">
                <div className="flex items-center gap-x-4 text-blue-800 font-medium whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👤</span>
                    <span>Name:</span>
                    <span>
                      {camelCase(
                        `${currentStudent?.first_name || ""} ${
                          currentStudent?.mid_name || ""
                        } ${currentStudent?.last_name || ""}`,
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-lg">🏫</span>
                    <span>Class:</span>
                    <span>
                      {currentStudent?.class_name || ""}{" "}
                      {currentStudent?.section_name || ""}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-lg">🏷️</span>
                    <span>Roll No:</span>
                    <span>{currentStudent?.roll_no || ""}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Close button */}
            <div className="flex justify-end">
              <RxCross1
                className="text-lg text-red-600 cursor-pointer hover:bg-red-100 rounded"
                onClick={() => {
                  navigate("/healthActivityRecordUpload");
                }}
              />
            </div>
          </div>
        </div>
        <div
          className=" w-[98%] h-1 mx-auto"
          style={{ backgroundColor: "#C03078" }}
        ></div>

        {loading ? (
          <>
            <div className="flex justify-center items-center py-10">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-1">
            <div>
              <div className="flex justify-between items-center mt-1 md:pl-2 md:pr-2">
                {/* Previous */}
                <div className="flex flex-col items-center relative group">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={async () => {
                      const success = await saveData();
                      if (!success) return;

                      const prevStudent = students[index - 1];
                      navigate(
                        `/editHealthActivityRecord/${prevStudent.student_id}`,
                        {
                          state: { students },
                        },
                      );
                    }}
                    className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
                  >
                    <FaArrowLeft />
                  </button>

                  <span className="absolute top-8 left-1/2 -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                    Previous
                  </span>
                </div>

                {/* Next */}
                <div className="flex flex-col items-center relative group">
                  <button
                    type="button"
                    disabled={index === students.length - 1}
                    onClick={async () => {
                      const success = await saveData();
                      if (!success) return;

                      const nextStudent = students[index + 1];
                      navigate(
                        `/editHealthActivityRecord/${nextStudent.student_id}`,
                        {
                          state: { students },
                        },
                      );
                    }}
                    className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
                  >
                    <FaArrowRight />
                  </button>

                  <span className="absolute top-8 left-1/2 -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                    Next
                  </span>
                </div>
              </div>
            </div>
            <div>
              <form
                onSubmit={handleSubmit}
                className="flex items-center justify-center overflow-x-hidden shadow-md p-2 mt-2 bg-gray-50 md:ml-2 md:mr-2"
              >
                <div className="modal-body w-full space-y-6">
                  {fieldParameter.map((group, index) => {
                    const totalFields = group.parameters?.length || 0;
                    const filledFields = group.parameters?.filter(
                      (p) => formData[p.parameter_name],
                    ).length;

                    return (
                      <div
                        key={group.group_id}
                        className="bg-white shadow rounded-xl p-2 border border-gray-100"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="bg-pink-700 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs font-semibold">
                              {index + 1}
                            </div>

                            <p className="text-sm font-semibold text-blue-800 mt-2">
                              {group.group_name}
                            </p>
                          </div>

                          <div className="bg-gray-100 text-gray-600 px-2 py-[2px] rounded-full text-[10px]">
                            {filledFields}/{totalFields}
                          </div>
                        </div>

                        {group.parameters && group.parameters.length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                            {group.parameters.map((param) => (
                              <div
                                key={param.parameter_id}
                                className="flex flex-col"
                              >
                                <label className="text-[13px] font-medium text-gray-600 mb-[2px]">
                                  {param.parameter_name}
                                </label>

                                <input
                                  type="text"
                                  value={formData[param.parameter_name] || ""}
                                  onChange={(e) => {
                                    const value = e.target.value;

                                    if (
                                      value === "" ||
                                      /^[a-zA-Z0-9]*$/.test(value)
                                    ) {
                                      setFormData((prev) => ({
                                        ...prev,
                                        [param.parameter_name]: value,
                                      }));
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();

                                      const currentIndex =
                                        group.parameters.findIndex(
                                          (p) =>
                                            p.parameter_id ===
                                            param.parameter_id,
                                        );

                                      const nextField =
                                        group.parameters[currentIndex + 1];

                                      if (nextField) {
                                        document
                                          .getElementById(
                                            `field-${group.group_id}-${nextField.parameter_id}`,
                                          )
                                          ?.focus();
                                      }
                                    }
                                  }}
                                  id={`field-${group.group_id}-${param.parameter_id}`}
                                  // className="bg-gray-50 border border-gray-200 rounded-md px-2 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-purple-400"
                                  className={`bg-gray-50 border rounded-md px-2 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400
                                ${
                                  !formData[param.parameter_name]
                                    ? "border-purple-400 bg-purple-50"
                                    : "border-gray-200"
                                }`}
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-400 text-xs">No parameters</p>
                        )}
                      </div>
                    );
                  })}

                  <div className="flex justify-between items-center mt-2">
                    {/* Previous */}
                    <div className="flex flex-col items-center">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={async () => {
                          const success = await saveData();
                          if (!success) return;

                          const prevStudent = students[index - 1];
                          navigate(
                            `/editHealthActivityRecord/${prevStudent.student_id}`,
                            {
                              state: { students },
                            },
                          );
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
                      >
                        <FaArrowLeft />
                      </button>

                      {/* Name below */}
                      <span className="text-xs text-gray-600 mt-1 text-center max-w-[100px] truncate">
                        Previous
                      </span>
                    </div>

                    {/* Next */}
                    <div className="flex flex-col items-center">
                      <button
                        type="button"
                        disabled={index === students.length - 1}
                        onClick={async () => {
                          const success = await saveData();
                          if (!success) return;

                          const nextStudent = students[index + 1];
                          navigate(
                            `/editHealthActivityRecord/${nextStudent.student_id}`,
                            {
                              state: { students },
                            },
                          );
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
                      >
                        <FaArrowRight />
                      </button>

                      {/* Name below */}
                      <span className="text-xs text-gray-600 mt-1 text-center max-w-[100px] truncate">
                        Next
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="submit"
                      className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                      disabled={loadingForSubmit}
                    >
                      {loadingForSubmit ? "Updating..." : "Update"}
                    </button>

                    <button
                      type="button"
                      className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
                      onClick={() => navigate(-1)}
                    >
                      Back
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditHeathActivityRecordUpload;
