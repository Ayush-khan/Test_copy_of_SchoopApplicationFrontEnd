import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { RxCross1 } from "react-icons/rx";
import LoaderStyle from "../../common/LoaderFinal/LoaderStyle";
import { useNavigate } from "react-router-dom";
import "react-quill/dist/quill.snow.css";
import Select from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlusCircle,
  faTimesCircle,
  faXmark,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";

const CreateDomainDetails = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [allClasses, setAllClasses] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState(null);
  const [loading, setLoading] = useState(false); // Loader state
  // const [details, setDetails] = useState([{ competency: "", outcome: "" }]);
  const [details, setDetails] = useState([]);

  const [errors, setErrors] = useState({});

  const [roles, setRoles] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const [classIdForManage, setclassIdForManage] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [subjectIdForManage, setSubjectIdForManage] = useState("");
  const [compentencies, setCompentencies] = useState([]);
  const [selectedCompentencies, setSelectedCompentencies] = useState(null);
  const [name, setName] = useState("");
  const [curriculumGoal, setCurriculumGoal] = useState("");

  useEffect(() => {
    fetchClassNames();
    fetchCompentencies();
  }, []);
  useEffect(() => {
    if (classIdForManage) {
      fetchSubject(classIdForManage);
    }
  }, [classIdForManage]);

  const fetchClassNames = async () => {
    setLoadingClasses(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${API_URL}/api/getClassList`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllClasses(response.data || []);
    } catch (error) {
      toast.error("Error fetching class names");
    } finally {
      setLoadingClasses(false);
    }
  };

  const classOptions = allClasses.map((cls) => ({
    value: cls.class_id,
    label: `${cls?.name}  `,
  }));

  const fetchSubject = async (classId) => {
    setLoadingSubjects(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/api/get_hpc_subject_Alloted_for_report_card/${classId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const rolesData = response.data.subjectAllotments || [];
      setRoles(rolesData);
    } catch (error) {
      toast.error("Error fetching subjects");
    } finally {
      setLoadingSubjects(false);
    }
  };

  const subjectOptions = roles.map((dept) => ({
    value: dept.hpc_sm_id,
    label: dept.subject_name,
  }));

  const fetchCompentencies = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      const response = await axios.get(
        `${API_URL}/api/get_domaincompetencies`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = response.data.data || [];
      console.log("compentencies", data);
      setCompentencies(data);
    } catch (error) {
      toast.error(error.message || "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const competencyOptions = compentencies.map((dept) => ({
    value: dept.dm_competency_id,
    label: dept.name,
  }));

  const handleClassSelect = (selectedOption) => {
    setSelectedClasses(selectedOption);
    setclassIdForManage(selectedOption ? selectedOption.value : null);

    // remove error when user selects
    setErrors((prev) => {
      const { class_id, ...rest } = prev;
      return rest;
    });
  };

  const handleSubjectSelect = (selectedOption) => {
    setSelectedSubject(selectedOption);
    setSubjectIdForManage(selectedOption ? selectedOption.value : null);

    // remove error when user selects
    setErrors((prev) => {
      const { hpc_sm_id, ...rest } = prev;
      return rest;
    });
  };

  const handleCompentencySelect = (selectedOption, index) => {
    const updatedDetails = [...details];
    updatedDetails[index].competency = selectedOption
      ? selectedOption.value
      : "";

    console.log("compency id", updatedDetails);
    setDetails(updatedDetails);

    // remove error for this row competency
    setErrors((prev) => {
      const { [`competency_${index}`]: _, ...rest } = prev;
      return rest;
    });
  };

  // const handleChange = (index, field, value) => {
  //   const updatedDetails = [...details];
  //   updatedDetails[index][field] = value;
  //   setDetails(updatedDetails);

  //   // remove error for this row outcome if typing
  //   if (field === "outcome") {
  //     setErrors((prev) => {
  //       const { [`outcome_${index}`]: _, ...rest } = prev;
  //       return rest;
  //     });
  //   }
  // };

  const handleChange = (index, field, value) => {
    const updatedDetails = [...details];
    updatedDetails[index][field] = value;
    setDetails(updatedDetails);

    // Remove error for this row outcome if typing
    if (field === "outcome") {
      setErrors((prev) => {
        const updatedErrors = { ...prev };
        if (updatedErrors.details && updatedErrors.details[index]) {
          updatedErrors.details[index] = {
            ...updatedErrors.details[index],
            outcome: "", // clear outcome error
          };
        }
        return updatedErrors;
      });
    }
  };

  // const handleAddRow = () => {
  //   setDetails([...details, { competency: "", outcome: "" }]);
  // };

  // const handleRemoveRow = (index) => {
  //   const updated = details.filter((_, i) => i !== index);
  //   setDetails(updated);
  // };

  const handleAddRow = () => {
    setDetails([...details, { competency: "", outcome: "" }]);
  };

  const handleRemoveRow = (index) => {
    const updated = details.filter((_, i) => i !== index);
    setDetails(updated);
  };

  const handleSubmitAdd = async () => {
    let newErrors = {
      details: [],
    };

    if (!classIdForManage) {
      newErrors.class_id = "Class is required";
    }

    // if (!subjectIdForManage) {
    //   newErrors.hpc_sm_id = "Subject is required";
    // }

    if (!name || name.trim() === "") {
      newErrors.name = "Name is required";
    }

    if (!curriculumGoal || curriculumGoal.trim() === "") {
      newErrors.curriculum_goal = "Curriculum Goal is required";
    }

    // Check if at least one main field is filled
    const anyMainFieldFilled =
      classIdForManage ||
      (name && name.trim() !== "") ||
      (curriculumGoal && curriculumGoal.trim() !== "");

    // Validate learning outcomes only if some main field is filled
    if (anyMainFieldFilled) {
      if (details.length === 0) {
        toast.error("At least one detail is required.");
        newErrors.details[0] = {
          outcome: "", // just string, not toast
        };
      } else {
        details.forEach((row, index) => {
          const rowErrors = {};
          // if (!row.competency) {
          //   rowErrors.competency = "Competency is required";
          // }
          if (!row.outcome || row.outcome.trim() === "") {
            rowErrors.outcome = "Learning outcome is required";
          }
          newErrors.details[index] = rowErrors;
        });
      }
    }
    const hasErrors =
      Object.keys(newErrors).length > 1 ||
      newErrors.details.some((rowErr) => Object.keys(rowErr || {}).length > 0);

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    if (isSubmitting) return;
    setIsSubmitting(true);

    const payload = {
      class_id: classIdForManage,
      hpc_sm_id: subjectIdForManage,
      name,
      curriculum_goal: curriculumGoal,
      parameters: details.map((row) => ({
        competencies: row.competency, // use name here if API expects text
        learning_outcomes: row.outcome,
      })),
    };

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      const response = await axios.post(
        `${API_URL}/api/save_domainparameters`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Saved successfully:", response.data);
      toast.success("Domain Parameters Saved Successfully!");
      resetForm();
      navigate("/domainDetails");
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error(error.message || "Failed to save data");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedClasses(null);
    setErrors({});
    setSelectedCompentencies(null);
    setSelectedSubject(null);
    setName("");
    setCurriculumGoal("");
    setDetails([{ competency: "", outcome: "" }]);
  };

  return (
    <div>
      <ToastContainer />
      <div className="container mb-4">
        <div className="card-header flex justify-between items-center"></div>
        <div className="w-[75%] mx-auto">
          <div className="container mt-4">
            <div className="card mx-auto lg:w-full shadow-lg">
              <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl">
                  Create Domain
                </h3>
                <RxCross1
                  className="text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                  type="button"
                  onClick={() => navigate("/domainDetails")}
                />
              </div>
              <div
                className="relative h-1 w-[97%] mx-auto"
                style={{ backgroundColor: "#C03078" }}
              ></div>
              <div className="">
                <div className="card-body w-full ml-2">
                  {loading ? (
                    <div className="flex justify-center items-center h-64">
                      <LoaderStyle />
                    </div>
                  ) : (
                    <div className="card-body w-full ml-2">
                      <form className="space-y-5">
                        {/* Select Classes */}
                        <div className="flex flex-col lg:flex-row items-start gap-3">
                          <label className="font-semibold lg:w-[180px] mt-2">
                            Select Class{" "}
                            <span className="text-sm text-red-500">*</span>
                          </label>

                          {/* Wrap input + error together */}
                          <div className="w-full md:w-[50%] flex flex-col">
                            <Select
                              id="classSelect"
                              value={selectedClasses}
                              onChange={handleClassSelect}
                              options={classOptions}
                              placeholder="Select"
                              isSearchable
                              isClearable
                              className="text-sm"
                              styles={{
                                menu: (provided) => ({
                                  ...provided,
                                  zIndex: 1050,
                                }),
                              }}
                            />

                            {/* Error directly below */}
                            {errors.class_id && (
                              <p className="text-red-500 text-xs ">
                                {errors.class_id}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* HPC Subject */}
                        <div className="flex flex-col lg:flex-row items-start gap-3">
                          <label className="font-semibold lg:w-[180px] mt-2">
                            HPC Subject{" "}
                          </label>

                          <div className="w-full md:w-[50%] flex flex-col">
                            <Select
                              id="hpcSubject"
                              value={selectedSubject}
                              onChange={handleSubjectSelect}
                              options={subjectOptions}
                              placeholder="Select"
                              isSearchable
                              isClearable
                              className="text-sm"
                              styles={{
                                menu: (provided) => ({
                                  ...provided,
                                  zIndex: 1050,
                                }),
                              }}
                            />

                            {errors.hpc_sm_id && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors.hpc_sm_id}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Name */}
                        <div className="flex flex-col lg:flex-row items-start gap-3">
                          <label className="font-semibold lg:w-[180px] mt-2">
                            Name <span className="text-sm text-red-500">*</span>
                          </label>

                          <div className="w-full md:w-[50%] flex flex-col">
                            <input
                              type="text"
                              id="name"
                              name="name"
                              value={name}
                              // onChange={(e) => setName(e.target.value)}
                              onChange={(e) => {
                                setName(e.target.value);

                                // remove error if value entered
                                if (e.target.value.trim() !== "") {
                                  setErrors((prev) => {
                                    const { name, ...rest } = prev;
                                    return rest;
                                  });
                                }
                              }}
                              maxLength={100}
                              placeholder="Enter name"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            {errors.name && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors.name}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Curriculum Goal */}
                        <div className="flex flex-col lg:flex-row items-start gap-3">
                          <label className="font-semibold lg:w-[180px] mt-2">
                            Curriculum Goal{" "}
                            <span className="text-sm text-red-500">*</span>
                          </label>

                          <div className="w-full md:w-[50%] flex flex-col">
                            <textarea
                              id="curriculumGoal"
                              name="curriculumGoal"
                              value={curriculumGoal}
                              // onChange={(e) =>
                              //   setCurriculumGoal(e.target.value)
                              // }
                              onChange={(e) => {
                                setCurriculumGoal(e.target.value);

                                // remove error if value entered
                                if (e.target.value.trim() !== "") {
                                  setErrors((prev) => {
                                    const { curriculum_goal, ...rest } = prev;
                                    return rest;
                                  });
                                }
                              }}
                              maxLength={200}
                              placeholder="Enter curriculum goal"
                              required
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            {errors.curriculum_goal && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors.curriculum_goal}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="w-full mt-6">
                          {/* Section Title */}
                          <h2 className="font-semibold text-lg mb-2">
                            Details
                          </h2>

                          {/* Table Layout */}
                          <div className="overflow-x-auto">
                            <table className="w-full table-fixed border border-gray-300 rounded-lg">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="border border-gray-300 px-3 py-2 text-center w-30">
                                    Competencies
                                  </th>
                                  <th className="border border-gray-300 px-3 py-2 text-center w-50">
                                    Learning Outcome
                                  </th>

                                  <th className="border border-gray-300 px-3 py-2 text-center w-24">
                                    Action
                                    {/* Plus Icon in header */}
                                    <div className="relative flex items-center group">
                                      <button
                                        type="button"
                                        onClick={handleAddRow}
                                        className="ml-4 text-green-600 hover:text-green-800 hover:bg-gray-200"
                                      >
                                        <FontAwesomeIcon
                                          icon={faPlusCircle}
                                          className="w-5 h-5"
                                        />
                                      </button>

                                      {/* Tooltip */}
                                      <div
                                        className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2
        hidden group-hover:flex items-center justify-center 
        bg-green-500 text-white text-[.8em] rounded-md py-1 px-2 shadow-md"
                                      >
                                        Add
                                      </div>
                                    </div>
                                  </th>
                                </tr>
                              </thead>

                              <tbody>
                                {details.length === 0 ? (
                                  <tr>
                                    <td
                                      colSpan="3"
                                      className="text-center text-gray-500 py-3"
                                    >
                                      Click ➕ to add competencies & outcomes
                                    </td>
                                  </tr>
                                ) : (
                                  details.map((row, index) => (
                                    <tr key={index}>
                                      {/* Competencies */}
                                      <td className="border border-gray-300 px-3 py-2">
                                        <div className="flex flex-col">
                                          <Select
                                            value={
                                              competencyOptions.find(
                                                (opt) =>
                                                  opt.value === row.competency
                                              ) || null
                                            }
                                            onChange={(selectedOption) =>
                                              handleCompentencySelect(
                                                selectedOption,
                                                index
                                              )
                                            }
                                            options={competencyOptions}
                                            placeholder="Select Competency"
                                            isClearable
                                            isSearchable
                                            className="text-sm"
                                            menuPortalTarget={document.body}
                                            styles={{
                                              menuPortal: (base) => ({
                                                ...base,
                                                zIndex: 9999,
                                              }),
                                            }}
                                          />

                                          {errors.details?.[index]
                                            ?.competency && (
                                            <p className="text-red-500 text-xs mt-1">
                                              {errors.details[index].competency}
                                            </p>
                                          )}
                                        </div>
                                      </td>

                                      {/* Learning Outcome */}
                                      <td className="border border-gray-300 px-3 py-2">
                                        <div className="flex flex-col">
                                          <textarea
                                            value={row.outcome}
                                            onChange={(e) =>
                                              handleChange(
                                                index,
                                                "outcome",
                                                e.target.value
                                              )
                                            }
                                            maxLength={200}
                                            placeholder="Enter learning outcome"
                                            rows={2}
                                            className="w-full px-2 py-1 border border-gray-300 rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          />
                                          {errors.details?.[index]?.outcome && (
                                            <p className="text-red-500 text-xs mt-1">
                                              {errors.details[index].outcome}
                                            </p>
                                          )}
                                        </div>
                                      </td>

                                      {/* Remove Button */}
                                      <td className="border border-gray-300 px-3 py-2 text-center">
                                        <div className="relative flex items-center justify-center group">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleRemoveRow(index)
                                            }
                                            className="text-red-600 hover:text-red-800 hover:bg-gray-200"
                                          >
                                            <FontAwesomeIcon
                                              icon={faXmark}
                                              className="w-5 h-5"
                                            />
                                          </button>

                                          {/* Tooltip */}
                                          <div
                                            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mt-2
                hidden group-hover:flex items-center justify-center 
                bg-red-500 text-white text-[.8em] rounded-md py-1 px-2 shadow-md"
                                          >
                                            Remove
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </form>
                    </div>
                  )}
                </div>

                {!loading && (
                  <div className="flex flex-wrap justify-end gap-2 m-4">
                    <button
                      onClick={() => handleSubmitAdd()}
                      className="btn btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={resetForm}
                      className="btn btn-danger bg-gray-500 text-white rounded-md hover:bg-gray-600"
                      disabled={isSubmitting}
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => navigate("/domainDetails")}
                      className="btn btn-warning bg-gray-500 text-white rounded-md hover:bg-gray-600"
                      disabled={isSubmitting}
                    >
                      Back
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateDomainDetails;
