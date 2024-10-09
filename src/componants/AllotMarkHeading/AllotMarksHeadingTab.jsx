import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RxCross1 } from "react-icons/rx";

const AllotMarksHeadingTab = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubjectType, setSelectedSubjectType] = useState("");
  const [subjectTypeError, setSubjectTypeError] = useState(null);
  const [subjectsIs, setSubjectsIs] = useState([]); // All subjects
  const [initialsubjectsIs, setInitialSubjectsIs] = useState([]); // All subjects

  const [preCheckedSubjects, setPreCheckedSubjects] = useState([]); // Pre-selected subjects

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
      const response = await axios.get(
        `${API_URL}/api/subject_for_reportcard`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Assuming response.data.subjects is the correct structure
      const subjects = response?.data?.subjects;

      setSubjectsIs(subjects);
      setInitialSubjectsIs(subjects);

      console.log("setSubjectsIs", subjects);
      console.log("setInitialSubjectsIs", subjects);
    } catch (error) {
      toast.error("Error fetching subjects");
    }
  };

  // Fetch pre-selected subjects based on class and subject type
  const fetchPreSelectedSubjects = async (classId, subjectType) => {
    if (!classId || !subjectType) return;
    console.log("classId:", classId, "subjectType:", subjectType.value);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/api/get_sub_report_allotted/${classId}/${subjectType.value}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(
        "without maching preselected subject come form api",
        response?.data?.subjectAllotments
      );
      const fetchedPreCheckedSubjects = response?.data?.subjectAllotments.map(
        (subject) => subject.get_subjects_for_report_card.sub_rc_master_id
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
  };

  const handleSubjectTypeChange = (value) => {
    setSelectedSubjectType(value);
    if (subjectTypeError) {
      setSubjectTypeError("");
    }

    // Fetch pre-selected subjects when both class and subject type are selected
    if (selectedClass && value) {
      fetchPreSelectedSubjects(selectedClass.value, value);
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
    let hasError = false;

    // Validate form fields
    if (!selectedClass) {
      setClassError("Please select a class.");
      hasError = true;
    }
    if (!selectedSubjectType) {
      setSubjectTypeError("Please select a subject type.");
      hasError = true;
    }
    if (preCheckedSubjects.length === 0) {
      setSubjectError("Please select at least one subject.");
      hasError = true;
    }

    if (hasError) return; // If there are errors, don't proceed with the save.

    try {
      const token = localStorage.getItem("authToken");
      console.log(
        "subjects",
        preCheckedSubjects,
        "subject_type",
        selectedSubjectType.value
      );

      // Make the API request to save the subject allotment
      const response = await axios.post(
        `${API_URL}/api/subject-allotments-reportcard/${selectedClass.value}`,
        {
          subject_ids: preCheckedSubjects, // Array of subject IDs (like [1, 2, 3])
          subject_type: selectedSubjectType.value, // e.g., 'core' or 'optional'
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Handle the response from the backend
      if (response.status === 200) {
        toast.success("Subjects allotted successfully");
        console.log("API Response:", response.data); // Log the response for debugging

        // Clear fields after successful submission
        setSelectedClass(null);
        setSelectedSubjectType("");
        setPreCheckedSubjects([]);
      } else {
        toast.error("Unexpected response status from the server.");
        console.error("Response status:", response.status);
      }
    } catch (error) {
      if (error.response) {
        // If the server responded with a status other than 200 range
        console.error(
          "Error response from server:",
          error?.response?.data?.message
        );
        toast.error(error?.response?.data?.message);
      } else {
        // If there was a problem with the request (e.g., network error)
        console.error("Error with request:", error.message);
        toast.error("Error saving allotment");
      }
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
            {/* Select Class */}
            <div className="form-group flex justify-center gap-x-1 md:gap-x-6">
              <label className="w-1/4 pt-2 items-center text-center px-2 lg:px-3 py-2 font-semibold text-[1em] text-gray-700">
                Select Class <span className="text-red-500">*</span>
              </label>
              <div className="w-full relative">
                <Select
                  value={selectedClass}
                  onChange={handleClassChange}
                  placeholder="Select"
                  className="w-full md:w-[50%] mb-3"
                  isClearable
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
            <div className="form-group flex justify-center gap-x-1 md:gap-x-6">
              <label className="w-1/4 pt-2 text-center px-2 lg:px-3 py-2 font-semibold text-[1em] text-gray-700">
                Subject Type <span className="text-red-500">*</span>
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
            </div>

            {/* Display subjects with checkboxes */}
            <div className="form-group flex justify-center gap-x-1 md:gap-x-6 mt-4">
              <label className="w-1/4 pt-2 items-center text-center px-2 lg:px-3 py-2 font-semibold text-[1em] text-gray-700 ">
                Select Subjects <span className="text-red-500">*</span>
              </label>
              <div className="w-full">
                <div className="relative gap-x-10 top-2 grid grid-cols-3 w-full">
                  {subjectsIs.length > 0 ? (
                    subjectsIs.map((subject) => (
                      <div
                        key={subject.sub_rc_master_id}
                        className="flex items-center gap-x-2"
                      >
                        <label>
                          <input
                            type="checkbox"
                            checked={preCheckedSubjects.includes(
                              subject.sub_rc_master_id
                            )}
                            onChange={() =>
                              handleCheckboxChange(subject.sub_rc_master_id)
                            }
                            className="mr-2"
                          />
                          {subject.name}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="mt-2">No subjects available</p>
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
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllotMarksHeadingTab;
