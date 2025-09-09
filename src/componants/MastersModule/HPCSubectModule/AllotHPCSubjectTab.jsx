import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RxCross1 } from "react-icons/rx";
import Loader from "../../common/LoaderFinal/LoaderStyle";

const AllotHPCSubjectTab = () => {
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

  // Error state variables
  const [classError, setClassError] = useState("");
  const [subjectError, setSubjectError] = useState("");

  // Fetch class list on component mount
  useEffect(() => {
    fetchClassNames();
  }, []);

  useEffect(() => {
    fetchAllSubjects();
  }, []);

  const fetchClassNames = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${API_URL}/api/getClassList`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(response.data);
    } catch (error) {
      toast.error("Error fetching class names");
    }
  };

  const fetchAllSubjects = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${API_URL}/api/hpcsubject`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Assuming response.data.subjects is the correct structure
      const subjects = response?.data?.data;

      setSubjectsIs(subjects);
      setInitialSubjectsIs(subjects);

      console.log("setSubjectsIs", subjects);
      console.log("setInitialSubjectsIs", subjects);
    } catch (error) {
      toast.error("Error fetching subjects");
    }
  };

  const fetchPreSelectedSubjects = async (classId) => {
    if (!classId) return;
    console.log("classId:", classId);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/api/get_hpc_sub_report_allotted/${classId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(
        "without maching preselected subject come form api",
        response?.data?.subjectAllotments
      );
      const fetchedPreCheckedSubjects = response?.data?.subjectAllotments.map(
        (subject) => subject.hpc_sm_id
      );

      setPreCheckedSubjects(fetchedPreCheckedSubjects);
      console.log("setPreCheckedSubjects", response?.data?.subjectAllotments);
    } catch (error) {
      toast.error(error?.response?.data?.error);
      console.log("error", error);
    }
  };

  const handleClassChange = (selectedOption) => {
    setSelectedClass(selectedOption);
    setClassError("");
    setSelectedSubjectType("");
    setPreCheckedSubjects([]);

    if (selectedOption?.value) {
      fetchPreSelectedSubjects(selectedOption.value);
    }
  };

  const handleCheckboxChange = (subjectId) => {
    setSubjectError("");
    if (preCheckedSubjects.includes(subjectId)) {
      setPreCheckedSubjects(
        preCheckedSubjects.filter((id) => id !== subjectId)
      );
    } else {
      setPreCheckedSubjects([...preCheckedSubjects, subjectId]);
    }
  };

  const handleSave = async () => {
    if (isSubmitting) return; // Prevent re-submitting
    setIsSubmitting(true);
    setLoading(true);
    let hasError = false;

    // Validate form fields
    if (!selectedClass) {
      setClassError("Please select a class.");
      hasError = true;
    }

    if (preCheckedSubjects.length === 0) {
      setSubjectError("Please select at least one subject.");
      hasError = true;
    }

    if (hasError) {
      setLoading(false);
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        `${API_URL}/api/hpc-subject-allotments-reportcard/${selectedClass.value}`,
        {
          subject_ids: preCheckedSubjects,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Handle the response from the backend
      if (response.status === 200) {
        toast.success("HPC Subjects allotted successfully");
        setLoading(false);
        console.log("API Response:", response.data); // Log the response for debugging
        setSelectedClass(null);
        setSelectedSubjectType("");
        setPreCheckedSubjects([]);
      } else {
        toast.error("Unexpected response status from the server.");
        console.error("Response status:", response.status);
      }
    } catch (error) {
      if (error.response) {
        toast.error(error?.response?.data?.message);
      } else {
        console.error("Error with request:", error.message);
        toast.error("Error saving allotment");
      }
    } finally {
      setLoading(false);
      setIsSubmitting(false); // Re-enable the button after the operation
    }
  };

  return (
    <div>
      <ToastContainer />
      <div className="container mt-4">
        <div className="card mx-auto lg:w-full shadow-lg">
          <div className="p-2 px-3 bg-gray-100 flex justify-between items-center">
            <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
              Allot Subject For Report Card
            </h3>
          </div>
          <div
            className=" relative -top-2 mb-3 h-1 w-[97%] mx-auto bg-red-700"
            style={{ backgroundColor: "#C03078" }}
          ></div>
          <div className="card-body w-full md:w-[85%] mx-auto">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50  z-10">
                <Loader /> {/* Replace this with your loader component */}
              </div>
            ) : (
              <>
                <div className="form-group flex justify-center gap-x-1 md:gap-x-6">
                  <label className="w-[32%] pt-2 items-center text-center px-2 lg:px-3 py-2 font-semibold text-[1em] text-gray-700">
                    Select Class <span className="text-red-500">*</span>
                  </label>
                  <div className="w-full relative">
                    <Select
                      value={selectedClass}
                      onChange={handleClassChange}
                      placeholder="Select"
                      className="w-full md:w-[50%] mb-3"
                      isClearable
                      // options={classes
                      //   .filter((cls) => {
                      //     const name = cls?.name
                      //       ?.toString()
                      //       .trim()
                      //       .toLowerCase();
                      //     if (["nursery", "lkg", "ukg"].includes(name))
                      //       return true;
                      //     const number = parseInt(name, 10);
                      //     return !isNaN(number) && number <= 2;
                      //   })
                      //   .map((cls) => ({
                      //     value: cls.class_id,
                      //     label: cls.name,
                      //   }))}
                      options={classes.map((classObj) => ({
                        value: classObj.class_id,
                        label: classObj.name,
                      }))}
                    />

                    {classError && (
                      <p className="relative -top-4 -mb-3 text-red-500 text-sm">
                        {classError}
                      </p>
                    )}
                  </div>
                </div>

                {/* Select Subject Type */}
                {/* <div className="form-group flex justify-center gap-x-1 md:gap-x-14">
                  <label className="w-[27%] pt-2 text-center px-2 lg:px-3 py-2 font-semibold text-[1em] text-gray-700">
                    HPC Subject Type <span className="text-red-500">*</span>
                  </label>
                  <div className="w-full">
                    <Select
                      value={selectedSubjectType}
                      onChange={handleSubjectTypeChange}
                      placeholder="Select"
                      className="w-full md:w-[50%]"
                      isClearable
                      isSearchable
                      options={[
                        { value: "Scholastic", label: "Scholastic" },
                        { value: "Co-Scholastic", label: "Co-Scholastic" },
                      ]}
                    />
                    {subjectTypeError && (
                      <p className="absolute text-red-500 text-sm">
                        {subjectTypeError}
                      </p>
                    )}
                  </div>
                </div> */}

                {/* Display subjects with checkboxes */}
                <div className="form-group flex justify-center gap-x-1 md:gap-x-16 mt-4">
                  <label className="w-[25%] pt-2 items-center text-center px-2 lg:px-3 py-2 font-semibold text-[1em] text-gray-700 ">
                    HPC Select Subjects <span className="text-red-500">*</span>
                  </label>
                  <div className="w-full">
                    <div className="relative gap-x-10 top-2 grid grid-cols-3 w-full">
                      {subjectsIs.length > 0 ? (
                        subjectsIs.map((subject) => (
                          <div
                            key={subject.hpc_sm_id}
                            className="flex items-center gap-x-2"
                          >
                            <label>
                              <input
                                type="checkbox"
                                checked={preCheckedSubjects.includes(
                                  subject.hpc_sm_id
                                )}
                                onChange={() =>
                                  handleCheckboxChange(subject.hpc_sm_id)
                                }
                                className="mr-2"
                              />
                              {subject.name}
                            </label>
                          </div>
                        ))
                      ) : (
                        <p className="w-[180%] text-blue-700 ">
                          Please wait while subjects are loading...
                        </p>
                      )}
                    </div>
                    {subjectError && (
                      <p className="absolute text-red-500 text-sm">
                        {subjectError}
                      </p>
                    )}
                  </div>
                </div>

                {/* Save button */}

                <div className="form-group flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllotHPCSubjectTab;
