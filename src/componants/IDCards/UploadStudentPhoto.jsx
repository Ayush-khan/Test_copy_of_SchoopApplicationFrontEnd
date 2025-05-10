import React, { useEffect, useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import ImageCropper from "../common/ImageUploadAndCrop";
import axios from "axios";
import Loader from "../common/LoaderFinal/LoaderStyle";

const UploadStudentPhoto = () => {
  const [photo, setPhoto] = useState(null);
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [loadingForSubmit, setLoadingForSubmit] = useState(false);
  // const [students, setStudents] = useState([]);
  const [formErrors, setFormErrors] = useState([]);
  const { staff } = location.state || {};
  console.log("IdCardDetails***", staff);
  const [data, setData] = useState(null);

  const fetchStudentData = async () => {
    setFormErrors([]); // Reset errors if no validation issues

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/get_studentidcarddetails?student_id=${staff?.student_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // console.log("studentiddetails", response);

      const data = response?.data?.data || {};
      setData(data);
      // console.log("data", data);

      setStudents(data || []);
      // console.log("after setStudents", data);
    } catch (error) {
      toast.error("Error fetching Student Data");
      console.error("Error fetching Student Data:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchStudentData();
  }, []);

  const handleStudentImageCropped = (croppedImageData, index) => {
    setStudents((prev) =>
      prev.map((student, i) =>
        i === index
          ? {
              ...student,
              image_base: croppedImageData ? croppedImageData : "", // Store base64 or empty
            }
          : student
      )
    );
    setFormErrors((prevErrors) =>
      prevErrors.filter((err) => err.field !== `student_image_base_${index}`)
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Prevent double submissions
    if (loadingForSubmit) return;
    setFormErrors([]); // Reset errors if no validation issues
    let errors = [];

    console.log("Start submitting...");

    students.forEach((student, index) => {
      if (!student.image_base && !student.image_name) {
        errors.push({
          field: `student_image_base_${index}`,
          message: "Please Upload Photo",
        });
      }
    });

    if (errors.length > 0) {
      setFormErrors(errors); // Store structured errors in state
      return;
    }

    setFormErrors([]); // Reset errors if no validation issues

    console.log("Student Data Submit---->", data);

    const student = students[0] || {};

    const formattedStudent = {
      student_id: student.student_id || "",
      image_name: student.image_name || "",
      image_base: student.image_base || "",
    };

    // const formattedArray = [formattedStudent];

    const finalData = {
      ...formattedStudent,
    };

    console.log("Before Submitting data ", finalData);

    try {
      setLoadingForSubmit(true); // Start loading state
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.put(
        `${API_URL}/api/update_studentphotoforidcard`,
        finalData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Student Photo Updated successfully!");
        setFormErrors([]); // Reset errors if no validation issues

        setTimeout(() => {
          navigate("/updateStudentIdCard");
        }, 1000);
      }
    } catch (error) {
      console.error(
        "Error Updating Student Photo Card:",
        error.response?.data || error.message
      );
    } finally {
      setLoadingForSubmit(false);
      setFormErrors([]); // Reset errors if no validation issues
    }
  };

  return (
    <div className="mt-4 w-full md:w-[50%] mx-auto">
      <ToastContainer />

      <div className="card p-4 rounded-md w-full bg-white shadow-md">
        {/* Header */}
        <div className="card-header mb-4 flex justify-between items-center">
          <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
            Upload Student Photo
          </h5>
          <RxCross1
            className="float-end relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100 rounded-full "
            onClick={() => {
              navigate("/updateStudentIdCard");
            }}
          />
        </div>

        {/* Pink line */}
        <div
          className="relative w-full h-1 -top-6 mx-auto"
          style={{
            backgroundColor: "#C03078",
          }}
        ></div>

        {/* Form */}
        <div className="w-full md:w-[100%] mx-auto ">
          {/* Outer light gray card */}
          <div className="bg-gray-50 overflow-x-hidden shadow-md rounded-md p-4">
            {/* Inner white form card */}
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl p-8 w-full max-w-xl mx-auto shadow-md"
            >
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader />
                </div>
              ) : (
                <div>
                  <div className="w-full mx-auto flex flex-wrap p-4 gap-4 justify-center">
                    {students.map((student, index) => (
                      <div key={index} className="flex flex-col items-center ">
                        {" "}
                        {/* mb-5*/}
                        <div className="rounded-full">
                          <ImageCropper
                            photoPreview={
                              student?.image_name || student?.image_base
                            }
                            onImageCropped={(croppedImage) =>
                              handleStudentImageCropped(croppedImage, index)
                            }
                          />{" "}
                          {formErrors.some(
                            (err) => err.field === `student_image_base_${index}`
                          ) && (
                            <p className="text-red-500 text-xs ml-3">
                              {
                                formErrors.find(
                                  (err) =>
                                    err.field === `student_image_base_${index}`
                                )?.message
                              }
                            </p>
                          )}
                        </div>
                        {/* Details Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 w-full">
                          <div className="flex flex-col">
                            <label className="font-bold text-sm">
                              Full Name
                            </label>
                            <p className="bg-gray-200 border border-gray-100 rounded-md p-2 shadow-inner  min-h-[40px] w-full">
                              {student.first_name || ""}{" "}
                              {student.mid_name || ""} {student.last_name || ""}
                            </p>
                          </div>
                          <div className="flex flex-col">
                            <label className="font-bold text-sm">
                              Roll No.
                            </label>
                            <p className="bg-gray-200 border border-gray-100 rounded-md p-2 shadow-inner min-h-[40px] w-full">
                              {student.roll_no == null ? " " : student.roll_no}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
                      disabled={loadingForSubmit}
                    >
                      {loadingForSubmit ? "Submitting.." : "Submit"}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadStudentPhoto;
