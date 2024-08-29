// Working code of the subjectAllotment component allot teacher for a class component.
import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../../../componants/common/Loader"; // Add this dependency

const animatedComponents = makeAnimated();

const AllotTeachersForClass = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [classes, setClasses] = useState([]);
  const [classSection, setClassSection] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [classId, setClassId] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      const response = await axios.get(`${API_URL}/api/get_teacher_list`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      const teacherOptions = response.data.map((teacher) => ({
        value: teacher.reg_id,
        label: teacher.name,
      }));
      setDepartments(teacherOptions);
    } catch (error) {
      setError(error.message);
      toast.error("Error fetching teacher list");
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  const fetchClassNames = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${API_URL}/api/get_class_section`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (Array.isArray(response.data)) {
        setClasses(response.data);
      } else {
        setError("Unexpected data format");
        toast.error("Unexpected data format");
      }
    } catch (error) {
      setError("Error fetching class and section names");
      toast.error("Error fetching class and section names");
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  const handleClassSectionChange = (e) => {
    const [classSection, sectionId] = e.target.value.split(" ");
    setClassSection(e.target.value);
    setClassId(classSection);
    setSectionId(sectionId);
  };

  const handleSearchForAllotTea = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/api/subject-allotment/section/${classId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.status === "success" && response.data.data) {
        const subjectData = Object.entries(response.data.data).map(
          ([sm_id, subject]) => ({
            sm_id,
            subject_name: subject.subject_name,
            selectedTeachers: subject.details
              .filter((detail) => detail.teacher_id)
              .map((detail) => ({
                value: detail.teacher_id,
                label: detail.teacher?.name,
              })),
            details: subject.details.map((detail) => ({
              subject_id: detail.subject_id,
              teacher_id: detail.teacher_id || null,
            })),
          })
        );
        setSubjects(subjectData);
      } else {
        setError("Unexpected data format");
        toast.error("Unexpected data format");
      }
    } catch (error) {
      setError("Error fetching subjects");
      toast.error("Error fetching subjects");
    } finally {
      setLoading(false);
    }
  }, [API_URL, classId]);

  const handleTeacherSelect = (selectedOptions, subjectIndex) => {
    const newSubjects = [...subjects];
    newSubjects[subjectIndex].selectedTeachers = selectedOptions;
    newSubjects[subjectIndex].details = selectedOptions.map((option) => ({
      subject_id: newSubjects[subjectIndex].details[0].subject_id,
      teacher_id: option.value || null,
    }));
    setSubjects(newSubjects);
  };

  const handleSubmitForAllotTeacherTab = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const formattedData = {
        subjects: subjects.reduce((acc, subject) => {
          const updatedDetails = subject.selectedTeachers.map(
            (selectedTeacher) => ({
              subject_id: subject.sm_id,
              teacher_id: selectedTeacher.value,
            })
          );
          acc[subject.sm_id] = { details: updatedDetails };
          return acc;
        }, {}),
      };

      await axios.put(
        `${API_URL}/api/subject-allotments/${sectionId}/${classId}`,
        formattedData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Teacher allotment updated successfully!");
    } catch (error) {
      setError("Error updating teacher allotment");
      toast.error("Error updating teacher allotment");
    } finally {
      setLoading(false);
    }
  }, [API_URL, classId, sectionId, subjects]);

  useEffect(() => {
    fetchClassNames();
    fetchDepartments();
  }, [fetchClassNames, fetchDepartments]);

  return (
    <div>
      <ToastContainer />
      <div className="mb-4">
        <div className="md:w-[80%] mx-auto">
          <div className="form-group flex justify-center gap-x-1 md:gap-x-6">
            <label
              htmlFor="classSection"
              className="w-1/4 pt-2 items-center text-center"
            >
              Select Class <span className="text-red-500">*</span>
            </label>
            <select
              id="classSection"
              className="border w-[50%] h-10 md:h-auto rounded-md px-3 py-2 md:w-full mr-2"
              value={classSection}
              onChange={handleClassSectionChange}
            >
              <option value="">Select</option>
              {classes.map((cls) => (
                <option
                  key={cls.section_id}
                  value={`${cls.section_id} ${cls.class_id}`}
                >
                  {`${cls?.get_class?.name} ${cls?.name}`}
                </option>
              ))}
            </select>
            <button
              onClick={handleSearchForAllotTea}
              type="button"
              className="btn h-10 md:h-auto w-18 md:w-auto btn-primary"
              disabled={loading}
            >
              Browse
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-32">
          <Loader />
        </div>
      )}

      {subjects.length > 0 && !loading && (
        <div className="container mt-4">
          <div className="card mx-auto lg:w-full shadow-lg">
            <div className="card-header flex justify-between items-center">
              <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
                Manage Subjects List
              </h3>
            </div>

            <div className="card-body w-full md:w-[85%] mx-auto ">
              <div className="h-96 lg:h-96 overflow-y-scroll lg:overflow-x-hidden">
                {subjects.map((subject, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-200 grid grid-cols-3 mx-10 gap-x-8"
                  >
                    <div className="relative mt-3 font-semibold text-gray-600">
                      {subject.subject_name}
                    </div>
                    <div className="relative mt-2 col-span-2 text-[.9em]">
                      <Select
                        closeMenuOnSelect={false}
                        components={animatedComponents}
                        isMulti
                        options={departments}
                        value={subject.selectedTeachers}
                        onChange={(selectedOptions) =>
                          handleTeacherSelect(selectedOptions, index)
                        }
                      />
                    </div>
                  </div>
                ))}
                <div className="flex justify-end p-3 mr-5">
                  <button
                    onClick={handleSubmitForAllotTeacherTab}
                    type="button"
                    className="btn h-10 md:h-auto w-18 md:w-auto btn-primary"
                    disabled={loading}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllotTeachersForClass;
