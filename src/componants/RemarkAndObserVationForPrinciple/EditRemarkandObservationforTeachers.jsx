import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { RxCross1 } from "react-icons/rx";
import LoaderStyle from "../common/LoaderFinal/LoaderStyle";
import { useLocation, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

const EditTeacherRemarkandObservation = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [subject, setSubject] = useState("");
  const [remarkDesc, setRemarkDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [isObservation, setIsObservation] = useState(false);
  const [errors, setErrors] = useState({
    subjectError: "",
    remarkDescError: "",
    classError: "",
  });
  const { id } = useParams();
  console.log("id", id);
  const location = useLocation();
  const selectedRemark = location.state;
  console.log("selectedRemark", selectedRemark);

  const [formData, setFormData] = useState({
    name: "",
    remark_subject: "",
    remark_desc: "",
    remark_type: "Remark",
    t_remark_id: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (location.state) {
      setFormData({
        t_remark_id: location.state.t_remark_id || "",
        name: location.state.teacher_name || location.state.name || "",
        remark_subject: location.state.remark_subject || "",
        remark_desc: location.state.remark || location.state.remark_desc,
        remark_type: location.state.remark_type || "Remark",
      });
      setIsObservation(location.state.remark_type === "Observation");
    }
  }, [location.state]);

  // const resetForm = () => {
  //   if (formData) {
  //     setSubject(formData.remark_subject || "");
  //     setRemarkDesc(formData.remark || "");
  //     setIsObservation(formData.remark_type === "Observation");
  //   }
  // };

  const resetForm = () => {
    setFormData({
      t_remark_id: formData.t_remark_id, // keep the ID to avoid issues during update
      name: formData.name, // keep teacher name (read-only field)
      remark_subject: "",
      remark_desc: "",
      remark_type: "Remark",
    });

    setErrors({
      subjectError: "",
      remarkDescError: "",
      classError: "",
    });

    setIsObservation(false);
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.remark_subject?.trim()) {
      errors.subjectError = "Subject of the remark is required.";
    }

    if (!formData.remark_desc?.trim()) {
      errors.remarkDescError = "Remark description is required.";
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitEdit = async () => {
    console.log("handleSubmitEdit is runing", formData);
    console.log(formData.remark_subject);
    console.log(formData.remark_desc);
    console.log("validation start runing");
    if (!validateForm()) return;
    console.log("validation not run");
    try {
      console.log("validation  run");

      setLoading(true);
      const token = localStorage.getItem("authToken");

      // Prepare only the fields that need to be updated
      const payload = {
        remarksubject: formData.remark_subject,
        remark: formData.remark_desc,
      };

      console.log("Submitting update:", payload);

      const response = await axios.put(
        `${API_URL}/api/update_updateremarkforteacher/${formData.t_remark_id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success(response.data.message || "Remark updated successfully!");
        navigate("/remObsTeacher");
      } else {
        toast.error(response.data.message || "Failed to update remark.");
      }
    } catch (error) {
      console.error("Error updating remark:", error);
      toast.error(error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ToastContainer />
      <div className="container mb-4">
        <div className="card-header flex justify-between items-center"></div>
        <div className="w-[70%] mx-auto">
          <div className="container mt-4">
            <div className="card mx-auto lg:w-full shadow-lg">
              <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl">
                  Edit Remark & Observation
                </h3>
                <RxCross1
                  className="text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                  type="button"
                  onClick={() => navigate("/remObsTeacher")}
                />
              </div>
              <div
                className="relative mb-3 h-1 w-[97%] mx-auto"
                style={{ backgroundColor: "#C03078" }}
              ></div>
              <div className="card-body w-full ml-2">
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    {/* <div className="spinner-border text-primary" role="status"> */}
                    <LoaderStyle />
                    {/* </div> */}
                  </div>
                ) : (
                  <div className="card-body w-full ml-2">
                    <div className="space-y-5 mr-14">
                      {/* Teacher Selection */}
                      <div className="flex flex-col md:flex-row items-start md:items-center">
                        <label className="w-[40%] text-[1em] text-gray-700">
                          Teacher Name
                        </label>
                        <div className="flex-1">
                          <input
                            type="text"
                            name="name" // important for handleChange too
                            value={formData?.name || ""}
                            readOnly
                            className="w-full bg-gray-200 text-gray-700 p-2 rounded"
                          />
                        </div>
                      </div>

                      {/* Subject of Remark */}
                      <div className="flex flex-col md:flex-row items-start md:items-center">
                        <label className="w-[40%] text-[1em] text-gray-700">
                          Subject of Remark{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="flex-1">
                          <input
                            type="text"
                            className="w-full px-2 py-2 border border-gray-700 rounded-md shadow-md"
                            value={formData?.remark_subject}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                remark_subject: e.target.value,
                              })
                            }
                          />

                          {errors.subjectError && (
                            <p className="text-red-500 mt-1">
                              {errors.subjectError}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Remark */}
                      <div className="flex flex-col md:flex-row items-start md:items-center">
                        <label className="w-[40%] text-[1em] text-gray-700">
                          Remark <span className="text-red-500">*</span>
                        </label>
                        <div className="flex-1">
                          <textarea
                            rows="3"
                            className="w-full px-2 py-1 border border-gray-700 rounded-md shadow-md"
                            value={formData.remark_desc}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                remark_desc: e.target.value,
                              })
                            }
                          />
                          {errors.remarkDescError && (
                            <p className="text-red-500 mt-1">
                              {errors.remarkDescError}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {!loading && (
                <div className="flex space-x-2 justify-end mb-2 mr-2">
                  <button
                    onClick={handleSubmitEdit}
                    className="btn btn-primary"
                  >
                    Update
                  </button>
                  <button
                    onClick={resetForm}
                    className="btn btn-danger bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTeacherRemarkandObservation;
