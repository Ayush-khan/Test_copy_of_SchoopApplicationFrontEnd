import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RxCross1 } from "react-icons/rx";
import Loader from "../../common/LoaderFinal/LoaderStyle";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const EditCallCategory = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubjectType, setSelectedSubjectType] = useState("");
  const [subjectTypeError, setSubjectTypeError] = useState(null);
  const [subjectsIs, setSubjectsIs] = useState([]); // All subjects
  const [initialsubjectsIs, setInitialSubjectsIs] = useState([]); // All subjects
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [preCheckedSubjects, setPreCheckedSubjects] = useState([]); // Pre-selected subjects
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Error state variables
  const [classError, setClassError] = useState("");
  const [subjectError, setSubjectError] = useState("");

  const [categoryGroup, setCategoryGroup] = useState([]);

  const { state } = useLocation();
  const { id } = useParams();
  // console.log("id", id);
  // console.log("state", state);

  useEffect(() => {
    fetchAllSubjects();
  }, []);

  const fetchAllSubjects = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${API_URL}/api/category-group`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const subjects = response?.data;

      setSubjectsIs(subjects);
      setInitialSubjectsIs(subjects);

      // console.log("setSubjectsIs", subjects);
      // console.log("setInitialSubjectsIs", subjects);
    } catch (error) {
      toast.error("Error fetching subjects");
    }
  };

  // useEffect(() => {
  //   const fetchPreviousCategoryGroup = async () => {
  //     try {
  //       const token = localStorage.getItem("authToken");
  //       const response = await axios.get(
  //         `${API_URL}/api/librarycategory/${id}`,
  //         {
  //           headers: { Authorization: `Bearer ${token}` },
  //         }
  //       );

  //       const data = response?.data;
  //       console.log("Fetched category:", data);

  //       setSelectedClass(data.category_name || "");
  //       setSelectedSubjectType(data.call_no || "");

  //       // If API returns linked category groups, pre-check them
  //       if (data.category_group_ids && Array.isArray(data.category_group_ids)) {
  //         setPreCheckedSubjects(data.category_group_ids);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching category group:", error);
  //       toast.error("Error fetching category group");
  //     }
  //   };

  //   fetchPreviousCategoryGroup();
  // }, [id]);

  // const handleCheckboxChange = (subjectId) => {
  //   setSubjectError("");
  //   if (preCheckedSubjects.includes(subjectId)) {
  //     setPreCheckedSubjects(
  //       preCheckedSubjects.filter((id) => id !== subjectId)
  //     );
  //   } else {
  //     setPreCheckedSubjects([...preCheckedSubjects, subjectId]);
  //   }
  // };

  useEffect(() => {
    const fetchPreviousCategoryGroup = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          `${API_URL}/api/librarycategory/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const data = response?.data;
        // console.log("Fetched category:", data);

        setSelectedClass(data.category_name || "");
        setSelectedSubjectType(data.call_no || "");

        if (data.category_groups && Array.isArray(data.category_groups)) {
          setPreCheckedSubjects(data.category_groups); // ✅ [7,8,15,17]
        }

        // ✅ Now fetch all category groups *after* loading prechecked
        fetchAllSubjects(data.category_groups);
      } catch (error) {
        console.error("Error fetching category group:", error);
        toast.error("Error fetching category group");
      }
    };

    fetchPreviousCategoryGroup();
  }, [id]);

  const handleCheckboxChange = (subjectId) => {
    setSubjectError("");
    if (preCheckedSubjects.includes(subjectId)) {
      setPreCheckedSubjects(
        preCheckedSubjects.filter((id) => id !== subjectId),
      );
    } else {
      setPreCheckedSubjects([...preCheckedSubjects, subjectId]);
    }
  };

  useEffect(() => {
    if (state?.category?.category_groups) {
      setPreCheckedSubjects(state.category.category_groups);
    }
  }, [state]);

  const handleUpdate = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setLoading(true);

    let hasError = false;
    if (!selectedClass || selectedClass.trim() === "") {
      setClassError("Please enter a category name.");
      hasError = true;
    }
    if (!selectedSubjectType || selectedSubjectType.trim() === "") {
      setSubjectTypeError("Please enter a Call No.");
      hasError = true;
    }

    if (hasError) {
      setLoading(false);
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Authentication token missing");

      const payload = {
        category_name: selectedClass.trim(),
        call_no: selectedSubjectType.trim(),
        category_group_ids: preCheckedSubjects,
      };

      // console.log("📦 Payload:", payload);

      const response = await axios.put(
        `${API_URL}/api/update_librarycategory/${id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      // console.log(" API Response:", response.data);

      if (response.status === 200) {
        // toast.success(
        //   response.data.message || "Category updated successfully!"
        // );
        toast.success("Category updated successfully!");

        setTimeout(() => {
          navigate("/callCategory");
        }, 1000);

        // setSelectedClass("");
        // setSelectedSubjectType("");
        // setPreCheckedSubjects([]);
      } else {
        toast.error(response.data.message || "Failed to update category");
      }
    } catch (error) {
      console.error("❌ Error updating category:", error);

      if (error.response?.status === 500) {
        toast.error("Server error. Please try again later.");
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error updating category. Please try again.");
      }
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <ToastContainer />
      <div className="container mt-4">
        <div className="card mx-auto lg:w-[70%] shadow-lg">
          <div className="p-2 px-3 bg-gray-100 flex justify-between items-center">
            <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
              Edit Category
            </h3>
            <RxCross1
              className="float-end relative top-1 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
              type="button"
              onClick={() => navigate("/callCategory")}
            />
          </div>
          <div
            className=" relative -top-1 mb-3 h-1 w-[97%] mx-auto bg-red-700"
            style={{ backgroundColor: "#C03078" }}
          ></div>
          <div className="card-body w-full  mx-auto">
            {/* {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50  z-10">
                <Loader />
              </div>
            ) : ( */}
            <>
              {/* <div className="space-y-4 w-full max-w-3xl mx-auto pl-6">
               
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <label className="w-[30%] text-left font-semibold text-gray-700">
                        Category Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={selectedClass || ""}
                        onChange={(e) => {
                          setSelectedClass(e.target.value);
                          if (classError) setClassError("");
                        }}
                        placeholder="Enter Category Name"
                        className="w-[40%] border border-gray-400 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {classError && (
                      <p className="text-red-500 text-sm ml-[30%] mt-1">
                        {classError}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <label className="w-[30%] text-left font-semibold text-gray-700">
                        Call No. <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={selectedSubjectType || ""}
                        onChange={(e) => {
                          setSelectedSubjectType(e.target.value);
                          if (subjectTypeError) setSubjectTypeError("");
                        }}
                        placeholder="Enter Call No."
                        className="w-[40%] border border-gray-400 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {subjectTypeError && (
                      <p className="text-red-500 text-sm ml-[30%] mt-1">
                        {subjectTypeError}
                      </p>
                    )}
                  </div>

                 
                  <div className="flex flex-col">
                    <div className="flex items-start">
                      <label className="w-[28%] text-left font-semibold text-gray-700 pt-1">
                        Category Group Name
                      </label>
                      <div className="w-[70%] rounded-md px-3 py-2">
                        {subjectsIs.length > 0 ? (
                          <div className="grid grid-cols-2 gap-y-2">
                            {subjectsIs.map((subject) => (
                              <label
                                key={subject.category_group_id}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="checkbox"
                                  checked={preCheckedSubjects.includes(
                                    subject.category_group_id
                                  )}
                                  onChange={() =>
                                    handleCheckboxChange(
                                      subject.category_group_id
                                    )
                                  }
                                />
                                <span className="text-sm">
                                  {subject.category_group_name}
                                </span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <p className="text-blue-700">
                            Please wait while category groups are loading...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div> */}

              <div className="space-y-4 w-full max-w-3xl mx-auto pl-6">
                {/* Category Name */}
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <label className="w-[30%] text-left font-semibold text-gray-700">
                      Category Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={selectedClass}
                      onChange={(e) => {
                        setSelectedClass(e.target.value);
                        if (classError) setClassError("");
                      }}
                      placeholder="Enter Category Name"
                      className="w-[40%] border border-gray-400 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {classError && (
                    <p className="text-red-500 text-sm ml-[30%] mt-1">
                      {classError}
                    </p>
                  )}
                </div>

                {/* Call No */}
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <label className="w-[30%] text-left font-semibold text-gray-700">
                      Call No. <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={selectedSubjectType}
                      onChange={(e) => {
                        setSelectedSubjectType(e.target.value);
                        if (subjectTypeError) setSubjectTypeError("");
                      }}
                      placeholder="Enter Call No."
                      className="w-[40%] border border-gray-400 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {subjectTypeError && (
                    <p className="text-red-500 text-sm ml-[30%] mt-1">
                      {subjectTypeError}
                    </p>
                  )}
                </div>

                {/* Category Group Name */}
                <div className="flex flex-col">
                  <div className="flex items-start">
                    <label className="w-[28%] text-left font-semibold text-gray-700 pt-1">
                      Category Group Name
                    </label>
                    <div className="w-[70%] rounded-md px-3 py-2">
                      {subjectsIs.length > 0 ? (
                        <div className="grid grid-cols-2 gap-y-2">
                          {/* {subjectsIs.map((subject) => (
                              <label
                                key={subject.category_group_id}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="checkbox"
                                  checked={preCheckedSubjects.includes(
                                    subject.category_group_id
                                  )}
                                  onChange={() =>
                                    handleCheckboxChange(
                                      subject.category_group_id
                                    )
                                  }
                                />
                               

                                <span className="text-sm">
                                  {subject.category_group_name}
                                </span>
                              </label>
                            ))} */}
                          {subjectsIs.map((subject) => (
                            <label
                              key={subject.category_group_id}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="checkbox"
                                checked={preCheckedSubjects.includes(
                                  subject.category_group_id,
                                )}
                                onChange={() =>
                                  handleCheckboxChange(
                                    subject.category_group_id,
                                  )
                                }
                              />
                              <span className="text-sm">
                                {subject.category_group_name}
                              </span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <p className="text-blue-700">
                          Please wait while category groups are loading...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Save button */}
              <div className="form-group flex justify-end mt-4">
                <button
                  type="button"
                  onClick={handleUpdate}
                  className="btn btn-primary mr-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating" : "Update Category"}
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  disabled={isSubmitting}
                >
                  Reset
                </button>
              </div>
            </>
            {/* )} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCallCategory;
