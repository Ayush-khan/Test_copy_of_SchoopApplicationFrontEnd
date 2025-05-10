import React, { useEffect, useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import ImageCropper from "../common/ImageUploadAndCrop";
import axios from "axios";
import Loader from "../common/LoaderFinal/LoaderStyle";

const UploadParentPhoto = () => {
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
        `${API_URL}/api/get_parentandguardianimage?student_id=${staff?.student_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("gardianiddetails", response);

      const data = response?.data?.data || {};
      setData(data);
      console.log("data", data);

      setStudents(data || []);
      console.log("after setStudents", data);
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

  const handleFatherImageCropped = (croppedImageData, index) => {
    setStudents((prev) =>
      prev.map((father, i) =>
        i === index
          ? {
              ...father,
              father_image: croppedImageData ? croppedImageData : "", // Store base64 or empty
            }
          : father
      )
    );
    // setFormErrors((prevErrors) =>
    //   prevErrors.filter((err) => err.field !== `father_image_${index}`)
    // );
  };

  const handleMotherImageCropped = (croppedImageData, index) => {
    setStudents((prev) =>
      prev.map((mother, i) =>
        i === index
          ? {
              ...mother,
              mother_image: croppedImageData ? croppedImageData : "", // Store base64 or empty
            }
          : mother
      )
    );
    // setFormErrors((prevErrors) =>
    //   prevErrors.filter((err) => err.field !== `mother_image_${index}`)
    // );
  };

  const handleGuardianImageCropped = (croppedImageData, index) => {
    setStudents((prev) =>
      prev.map((guardian, i) =>
        i === index
          ? {
              ...guardian,
              guardian_image: croppedImageData ? croppedImageData : "", // Store base64 or empty
            }
          : guardian
      )
    );
    // setFormErrors((prevErrors) =>
    //   prevErrors.filter((err) => err.field !== `father_image_${index}`)
    // );
  };

  // const handleSubmit = async (event) => {
  //   event.preventDefault();

  //   // Prevent double submissions
  //   if (loadingForSubmit) return;
  //   setFormErrors([]); // Reset errors if no validation issues
  //   let errors = [];

  //   console.log("Start submitting...");

  //   students.forEach((student, index) => {
  //     if (!student.father_image && !student.father_image_name) {
  //       errors.push({
  //         field: `student_father_image_${index}`,
  //         message: "Please Upload Photo",
  //       });
  //     }
  //     if (!student.mother_image && !student.mother_image_name) {
  //       errors.push({
  //         field: `student_mother_image_${index}`,
  //         message: "Please Upload Photo",
  //       });
  //     }
  //     if (!student.guardian_image && !student.guardian_image_name) {
  //       errors.push({
  //         field: `student_guardian_image_${index}`,
  //         message: "Please Upload Photo",
  //       });
  //     }
  //   });

  //   if (errors.length > 0) {
  //     setFormErrors(errors); // Store structured errors in state
  //     return;
  //   }

  //   setFormErrors([]); // Reset errors if no validation issues

  //   console.log("Student Data Submit---->", data);

  //   const student = students[0] || {};

  //   const formattedStudent = {
  //     parent_id: staff?.parent_id || "",
  //     student_id: student.student_id || "",
  //     father_image: student.father_image || "",
  //     mother_image: student.mother_image || "",
  //     guardian_image: student.guardian_image || "",
  //   };

  //   // const formattedArray = [formattedStudent];

  //   const finalData = {
  //     ...formattedStudent,
  //   };

  //   console.log("Before Submitting data ", finalData);

  //   try {
  //     setLoadingForSubmit(true); // Start loading state
  //     const token = localStorage.getItem("authToken");
  //     if (!token) {
  //       throw new Error("No authentication token found");
  //     }

  //     const response = await axios.post(
  //       `${API_URL}/api/update_parentguradianimage`,
  //       finalData,
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     if (response.status === 200) {
  //       toast.success("Parent's Photo Updated successfully!");
  //       setFormErrors([]); // Reset errors if no validation issues

  //       setTimeout(() => {
  //         navigate("/updateStudentIdCard");
  //       }, 1500);
  //     }
  //   } catch (error) {
  //     console.error(
  //       "Error Updating Student Photo Card:",
  //       error.response?.data || error.message
  //     );
  //   } finally {
  //     setLoadingForSubmit(false);
  //     setFormErrors([]); // Reset errors if no validation issues
  //   }
  // };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loadingForSubmit) return;

    setFormErrors([]);
    let errors = [];

    console.log("Start submitting...");

    students.forEach((student, index) => {
      if (!student.father_image && !student.father_image_name) {
        errors.push({
          field: `student_father_image_${index}`,
          message: "Please Upload Photo",
        });
      }
      if (!student.mother_image && !student.mother_image_name) {
        errors.push({
          field: `student_mother_image_${index}`,
          message: "Please Upload Photo",
        });
      }
      if (!student.guardian_image && !student.guardian_image_name) {
        errors.push({
          field: `student_guardian_image_${index}`,
          message: "Please Upload Photo",
        });
      }
    });

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    const student = students[0] || {};
    const finalData = {
      parent_id: staff?.parent_id || "",
      student_id: student.student_id || "",
      father_image: student.father_image || "",
      mother_image: student.mother_image || "",
      guardian_image: student.guardian_image || "",
    };

    try {
      setLoadingForSubmit(true);
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      const response = await axios.post(
        `${API_URL}/api/update_parentguradianimage`,
        finalData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Parent's Photo Updated successfully!");
        setFormErrors([]);
        setTimeout(() => {
          navigate("/updateStudentIdCard");
        }, 1500);
      }
    } catch (error) {
      console.error(
        "Error Updating Student Photo Card:",
        error.response?.data || error.message
      );
    } finally {
      setLoadingForSubmit(false);
      setFormErrors([]);
    }
  };

  return (
    <div className="mt-4 w-full md:w-[90%] mx-auto">
      <ToastContainer />

      <div className="card p-4 rounded-md w-full bg-white shadow-md">
        {/* Header */}
        <div className="card-header mb-4 flex justify-between items-center">
          <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
            Upload Parent Photo
          </h5>
          <RxCross1
            className="float-end relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100 rounded-full p-1"
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
        {/* 
        <div className="w-full">
          <form onSubmit={handleSubmit}>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader />
              </div>
            ) : (
              <>
                <div className="w-full">
                  <form onSubmit={handleSubmit}>
                    {loading ? (
                      <div className="flex justify-center items-center h-64">
                        <Loader />
                      </div>
                    ) : students && students.length > 0 ? (
                      <>
                        <div className="flex flex-wrap gap-4 mx-2">
                          {students.map((student, index) => (
                            <React.Fragment key={index}>
                              <div className="flex-1 min-w-[300px] max-w-[450px] bg-gray-50 shadow-md rounded-md p-6">
                                <div className="bg-white rounded-2xl p-6 shadow-md">
                                  <h2 className="text-xl font-bold mb-4 text-center text-gray-500">
                                    Father Information
                                  </h2>
                                  <div className="flex flex-col items-center mb-6">
                                    <div className="rounded-full">
                                      <ImageCropper
                                        photoPreview={
                                          student?.father_image_name ||
                                          student?.father_image
                                        }
                                        onImageCropped={(croppedImage) =>
                                          handleFatherImageCropped(
                                            croppedImage,
                                            index
                                          )
                                        }
                                      />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 gap-4">
                                    <div className="flex flex-col">
                                      <label className="font-bold text-sm">
                                        Father Name
                                      </label>
                                      <p className="bg-gray-200 border border-gray-100 rounded-md p-2 shadow-inner min-h-[40px] w-full">
                                        {student?.father_name}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex-1 min-w-[300px] max-w-[450px] bg-gray-50 shadow-md rounded-md p-6">
                                <div className="bg-white rounded-2xl p-6 shadow-md">
                                  <h2 className="text-xl font-bold mb-4 text-center text-gray-500">
                                    Mother Information
                                  </h2>
                                  <div className="flex flex-col items-center mb-6">
                                    <div className="rounded-full">
                                      <ImageCropper
                                        photoPreview={
                                          student?.mother_image_name ||
                                          student?.mother_image
                                        }
                                        onImageCropped={(croppedImage) =>
                                          handleMotherImageCropped(
                                            croppedImage,
                                            index
                                          )
                                        }
                                      />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 gap-4">
                                    <div className="flex flex-col">
                                      <label className="font-bold text-sm">
                                        Mother Name
                                      </label>
                                      <p className="bg-gray-200 border border-gray-100 rounded-md p-2 shadow-inner min-h-[40px] w-full">
                                        {student?.mother_name}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex-1 min-w-[300px] max-w-[450px] bg-gray-50 shadow-md rounded-md p-6">
                                <div className="bg-white rounded-2xl p-6 shadow-md">
                                  <h2 className="text-xl font-bold mb-4 text-center text-gray-500">
                                    Guardian Information
                                  </h2>
                                  <div className="flex flex-col items-center mb-6">
                                    <div className="rounded-full">
                                      <ImageCropper
                                        photoPreview={
                                          student?.guardian_image_name ||
                                          student?.guardian_image
                                        }
                                        onImageCropped={(croppedImage) =>
                                          handleGuardianImageCropped(
                                            croppedImage,
                                            index
                                          )
                                        }
                                      />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 gap-4">
                                    <div className="flex flex-col">
                                      <label className="font-bold text-sm">
                                        Guardian Name
                                      </label>
                                      <p className="bg-gray-200 border border-gray-100 rounded-md p-2 shadow-inner min-h-[40px] w-full">
                                        {student?.guardian_name || ""}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </React.Fragment>
                          ))}
                        </div>

                        <div className="flex justify-end mt-6 mr-4">
                          <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
                          >
                            Submit
                          </button>
                        </div>
                      </>
                    ) : (
                      <div
                        className="flex justify-center items-center h-full text-red-700 text-xl font-semibold"
                        colSpan="10"
                        // className="text-center text-red-700 py-4"
                      >
                        Oops! No data found.
                      </div>
                    )}
                  </form>
                </div>
              </>
            )}
          </form>
        </div> */}

        <div className="w-full">
          <form onSubmit={handleSubmit}>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader />
              </div>
            ) : students && students.length > 0 ? (
              <>
                <div className="flex flex-wrap gap-4 mx-2">
                  {students.map((student, index) => (
                    <React.Fragment key={index}>
                      {/* Father Card */}
                      <div className="flex-1 min-w-[300px] max-w-[450px] bg-gray-50 shadow-md rounded-md p-6">
                        <div className="bg-white rounded-2xl p-6 shadow-md">
                          <h2 className="text-xl font-bold mb-4 text-center text-gray-500">
                            Father Information
                          </h2>
                          <div className="flex flex-col items-center mb-6">
                            <div className="rounded-full">
                              <ImageCropper
                                photoPreview={
                                  student?.father_image_name ||
                                  student?.father_image
                                }
                                onImageCropped={(croppedImage) =>
                                  handleFatherImageCropped(croppedImage, index)
                                }
                              />
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <label className="font-bold text-sm">
                              Father Name
                            </label>
                            <p className="bg-gray-200 border border-gray-100 rounded-md p-2 shadow-inner min-h-[40px] w-full">
                              {student?.father_name}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Mother Card */}
                      <div className="flex-1 min-w-[300px] max-w-[450px] bg-gray-50 shadow-md rounded-md p-6">
                        <div className="bg-white rounded-2xl p-6 shadow-md">
                          <h2 className="text-xl font-bold mb-4 text-center text-gray-500">
                            Mother Information
                          </h2>
                          <div className="flex flex-col items-center mb-6">
                            <div className="rounded-full">
                              <ImageCropper
                                photoPreview={
                                  student?.mother_image_name ||
                                  student?.mother_image
                                }
                                onImageCropped={(croppedImage) =>
                                  handleMotherImageCropped(croppedImage, index)
                                }
                              />
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <label className="font-bold text-sm">
                              Mother Name
                            </label>
                            <p className="bg-gray-200 border border-gray-100 rounded-md p-2 shadow-inner min-h-[40px] w-full">
                              {student?.mother_name}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Guardian Card */}
                      <div className="flex-1 min-w-[300px] max-w-[450px] bg-gray-50 shadow-md rounded-md p-6">
                        <div className="bg-white rounded-2xl p-6 shadow-md">
                          <h2 className="text-xl font-bold mb-4 text-center text-gray-500">
                            Guardian Information
                          </h2>
                          <div className="flex flex-col items-center mb-6">
                            <div className="rounded-full">
                              <ImageCropper
                                photoPreview={
                                  student?.guardian_image_name ||
                                  student?.guardian_image
                                }
                                onImageCropped={(croppedImage) =>
                                  handleGuardianImageCropped(
                                    croppedImage,
                                    index
                                  )
                                }
                              />
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <label className="font-bold text-sm">
                              Guardian Name
                            </label>
                            <p className="bg-gray-200 border border-gray-100 rounded-md p-2 shadow-inner min-h-[40px] w-full">
                              {student?.guardian_name || ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  ))}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end mt-6 mr-4">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
                    disabled={loadingForSubmit}
                  >
                    {loadingForSubmit ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex justify-center items-center h-full text-red-700 text-xl font-semibold">
                Oops! No data found.
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadParentPhoto;
