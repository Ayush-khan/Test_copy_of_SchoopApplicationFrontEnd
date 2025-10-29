import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { RxCross1 } from "react-icons/rx";
// import LoaderStyle from "../common/LoaderFinal/LoaderStyle";
import LoaderStyle from "../../componants/common/LoaderFinal/LoaderStyle";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const EditTeacherNotes = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const { id } = useParams(); // if you pass teacher remark id in route
  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    t_remark_id: "",
    name: "",
    remark_subject: "",
    remark_desc: "",
    remark_type: "Remark", // either "Remark" or "Observation"
    filenottobedeleted: [], // existing files to keep
    userfile: [], // new files to upload
  });

  const [isObservation, setIsObservation] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (location.state) {
      setFormData({
        t_remark_id: location.state.t_remark_id || "",
        name: location.state.teacher_name || location.state.name || "",
        remark_subject: location.state.remark_subject || "",
        remark_desc: location.state.remark || location.state.remark_desc,
        remark_type: location.state.remark_type || "Remark",
        filenottobedeleted: location.state.files || [],
        userfile: [],
      });
      setIsObservation((location.state.remark_type || "") === "Observation");
    }
  }, [location.state]);

  const validateForm = () => {
    const errs = {};
    if (!formData.remark_subject?.trim()) {
      errs.subjectError = "Subject of the remark is required.";
    }
    if (!formData.remark_desc?.trim()) {
      errs.remarkDescError = "Remark description is required.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFileUpload = (e) => {
    const newFiles = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      userfile: [...prev.userfile, ...newFiles],
    }));
  };

  const handleRemoveOldFile = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      filenottobedeleted: prev.filenottobedeleted.filter(
        (_, idx) => idx !== indexToRemove
      ),
    }));
  };

  const resetForm = () => {
    setFormData((prev) => ({
      t_remark_id: prev.t_remark_id,
      name: prev.name,
      remark_subject: "",
      remark_desc: "",
      remark_type: "Remark",
      filenottobedeleted: [],
      userfile: [],
    }));
    setErrors({});
    setIsObservation(false);
  };

  const handleSubmitEdit = async (e) => {
    e?.preventDefault?.();

    if (isSubmitting) return;
    if (!validateForm()) return;

    setIsSubmitting(true);
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");

      const payload = {
        t_remark_id: formData.t_remark_id,
        remarksubject: formData.remark_subject,
        remark: formData.remark_desc,
        remark_type: isObservation ? "Observation" : "Remark",
      };

      const response = await axios.put(
        `${API_URL}/api/update_updateremarkforteacher/${formData.t_remark_id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.data.success) {
        toast.success(response.data.message || "Remark updated successfully!");
        navigate("/remObsTeacher");
      } else {
        toast.error(response.data.message || "Failed to update remark.");
      }
    } catch (err) {
      console.error("Error updating remark:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <div>
      <ToastContainer />
      <div className="container mb-4">
        <div className="w-[70%] mx-auto">
          <div className="container mt-4">
            <div className="card shadow-lg mx-auto lg:w-full">
              <div className="p-2 px-3 bg-gray-100 flex justify-between items-center">
                <h3 className="text-gray-700 text-xl">
                  Edit Remark & Observation
                </h3>
                <RxCross1
                  className="text-xl text-red-600 cursor-pointer"
                  onClick={() => navigate("/remObsTeacher")}
                />
              </div>
              <div
                className="h-1 w-[97%] mx-auto"
                style={{ backgroundColor: "#C03078" }}
              ></div>

              <div className="card-body w-full ml-2">
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <LoaderStyle />
                  </div>
                ) : (
                  <form onSubmit={handleSubmitEdit} className="space-y-5 mr-14">
                    {/* Teacher Name (read-only) */}
                    <div className="flex flex-col md:flex-row items-start md:items-center">
                      <label className="w-[40%] text-gray-700">
                        Teacher Name
                      </label>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={formData.name}
                          readOnly
                          className="w-full bg-gray-200 p-2 rounded"
                        />
                      </div>
                    </div>

                    {/* Subject of Remark */}
                    <div className="flex flex-col md:flex-row items-start md:items-center">
                      <label className="w-[40%] text-gray-700">
                        Subject of Remark{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="flex-1">
                        <input
                          type="text"
                          className="w-full px-2 py-2 border border-gray-700 rounded-md shadow-md"
                          value={formData.remark_subject}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              remark_subject: e.target.value,
                            }))
                          }
                        />
                        {errors.subjectError && (
                          <p className="text-red-500 mt-1">
                            {errors.subjectError}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Remark Description */}
                    <div className="flex flex-col md:flex-row items-start md:items-center">
                      <label className="w-[40%] text-gray-700">
                        Remark <span className="text-red-500">*</span>
                      </label>
                      <div className="flex-1">
                        <textarea
                          rows="3"
                          className="w-full px-2 py-1 border border-gray-700 rounded-md shadow-md"
                          value={formData.remark_desc}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              remark_desc: e.target.value,
                            }))
                          }
                        />
                        {errors.remarkDescError && (
                          <p className="text-red-500 mt-1">
                            {errors.remarkDescError}
                          </p>
                        )}

                        {/* Observation Checkbox */}
                        <div className="mt-2">
                          <label className="inline-flex items-center text-sm text-gray-700">
                            <input
                              type="checkbox"
                              className="mr-2"
                              checked={isObservation}
                              onChange={(e) =>
                                setIsObservation(e.target.checked)
                              }
                            />
                            Observation
                          </label>
                          <p className="text-xs text-gray-500 ml-6">
                            (Observation will not be shown to parents!)
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end space-x-2 mb-2 mr-2">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Updating..." : "Update"}
                      </button>
                      <button
                        type="button"
                        onClick={resetForm}
                        className="btn btn-danger bg-gray-500 text-white rounded-md hover:bg-gray-600"
                      >
                        Reset
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTeacherNotes;
