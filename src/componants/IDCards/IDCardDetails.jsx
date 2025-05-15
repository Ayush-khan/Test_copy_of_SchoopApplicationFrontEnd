import { useEffect, useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ImageCropper from "../common/ImageUploadAndCrop";
import Loader from "../common/LoaderFinal/LoaderStyle";

const IDCardDetails = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [loadingForSubmit, setLoadingForSubmit] = useState(false);
  const [students, setStudents] = useState([]);
  const [parents, setParents] = useState([]);
  const [guardian, setGuardian] = useState([]);
  const [formErrors, setFormErrors] = useState([]);
  const { staff } = location.state || {};
  console.log("IdCardDetails***", staff);
  const [data, setData] = useState(null);
  // const [selectedClassId, setSelectedClassId] = useState("");
  // const [selectedSectionId, setSelectedSectionId] = useState("");

  const fetchStudentData = async () => {
    // Reset errors if no validation issues

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/get_studentidcarddetails?student_id=${staff?.student_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = response?.data?.data || {};
      const sectionID = data[0]?.section_id;
      console.log("section data", sectionID);
      setData(data);
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

  console.log("Students", students);

  // Handle Input Changes Separately
  const handleStudentChange = (e, index) => {
    const { name, value } = e.target;
    setStudents((prev) =>
      prev.map((student, i) =>
        i === index ? { ...student, [name]: value } : student
      )
    );
  };

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
      prevErrors.filter((err) => err.field !== `student_image_name_${index}`)
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Prevent double submissions
    if (loadingForSubmit) return;
    setFormErrors([]); // Reset errors if no validation issues
    let errors = [];

    console.log("Start submitting...");

    // Collect student-related errors
    students.forEach((student, index) => {
      if (!student.blood_group) {
        errors.push({
          field: `student_blood_group_${index}`,
          message: "Blood Group is required.",
        });
      }
      if (!student.permant_add) {
        errors.push({
          field: `student_address_${index}`,
          message: "Permanent Address is required.",
        });
      }
      if (!student.image_base && !student.image_name) {
        errors.push({
          field: `student_image_base_${index}`,
          message: "Please Upload Photo.",
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
      blood_group: student.blood_group || "",
      house: student.house || "",
      permant_add: student.permant_add || "",
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

      const response = await axios.post(
        `${API_URL}/api/save_studentdetailsforidcard`,
        finalData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("ID Card Saved successfully!");
        setFormErrors([]);

        const sectionIDToPass = data[0]?.section_id;
        console.log("Navigating with sectionID:", sectionIDToPass);

        setTimeout(() => {
          navigate("/studentIdCard", {
            state: {
              sectionID: sectionIDToPass,
            },
          });
        }, 1000);
      }
    } catch (error) {
      console.error(
        "Error Saving ID Card:",
        error.response?.data || error.message
      );
    } finally {
      setLoadingForSubmit(false);
      setFormErrors([]); // Reset errors if no validation issues
    }
  };

  if (!students || !parents || !guardian)
    return (
      <>
        {" "}
        <div className="flex w-1/2 mx-auto bg-white justify-center items-center h-64">
          <Loader />
        </div>
      </>
    );

  return (
    <div className="mt-4 bg-gray-200 w-full md:w-[60%] mx-auto">
      <ToastContainer />
      <div className="card p-4 rounded-md w-full ">
        <div className=" card-header mb-4 flex justify-between items-center ">
          <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
            ID Card Details
          </h5>

          {data?.length > 0 ? (
            <RxCross1
              className="float-end relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
              onClick={() => {
                navigate("/studentIdCard", {
                  state: {
                    sectionID: data[0].section_id,
                  },
                });
              }}
            />
          ) : (
            <RxCross1
              className="float-end relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
              onClick={() => {
                navigate("/studentIdCard", {
                  state: {
                    sectionID: data[0].section_id, // or a default fallback
                  },
                });
              }}
            />
          )}
        </div>
        <div
          className=" relative w-full   -top-6 h-1  mx-auto bg-red-700"
          style={{
            backgroundColor: "#C03078",
          }}
        ></div>
        {/* <p className="  md:absolute md:right-10  md:top-[25%]   text-gray-500 ">
          <span className="text-red-500">*</span>indicates mandatory information
        </p> */}
        <form
          onSubmit={handleSubmit}
          className="   p-0 overflow-x-hidden shadow-md  bg-gray-50 "
        >
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader />
            </div>
          ) : (
            <div>
              <div className="w-full  mx-auto  flex flex-wrap p-4 gap-4 justify-center">
                {students.map((student, index) => (
                  <>
                    <div className="w-full md:w-[70%] border p-4 pt-2 rounded-lg shadow-lg bg-white">
                      {/* <h2 className="text-xl font-bold mb-4 text-center text-gray-500">
                        Student {index + 1}
                      </h2> */}

                      {/* Grid Layout for Fields */}
                      <div className="flex flex-col md:grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Full Name */}{" "}
                        <div className=" md:row-span-2 md:col-span-1  flex justify-center mb-4 ">
                          <div className="rounded-full">
                            <ImageCropper
                              photoPreview={
                                student?.image_name || student?.image_base
                              }
                              onImageCropped={(croppedImage) =>
                                handleStudentImageCropped(croppedImage, index)
                              }
                            />
                            {formErrors.some(
                              (err) =>
                                err.field === `student_image_base_${index}`
                            ) && (
                              <p className="text-red-500 text-xs ml-3">
                                {
                                  formErrors.find(
                                    (err) =>
                                      err.field ===
                                      `student_image_base_${index}`
                                  )?.message
                                }
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col mt-2">
                          <label className="font-bold text-sm">Full Name</label>
                          <p className=" bg-gray-200 border-1 border-gray-100 rounded-md p-2 shadow-inner">
                            {student.first_name || ""} {student.mid_name || " "}{" "}
                            {student.last_name || " "}
                          </p>
                        </div>
                        {/* Class & Division */}
                        <div className="flex flex-col mt-2">
                          <label className="font-bold text-sm">
                            Class & Division
                          </label>
                          <p className=" bg-gray-200 border-1 border-gray-100 rounded-md p-2 shadow-inner">
                            {student.classname || " "} -{" "}
                            {student.sectionname || " "}
                          </p>
                        </div>
                        {/* Date of Birth */}
                        <div className="flex flex-col">
                          <label className="font-bold text-sm">
                            Date of Birth
                          </label>
                          <p className=" bg-gray-200 border-1 border-gray-100 rounded-md p-2 shadow-inner">
                            {student.dob || " "}
                          </p>
                        </div>
                        {/* Blood Group */}
                        <div className="flex flex-col">
                          <label className="font-bold text-sm">
                            Blood Group <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="blood_group"
                            value={student.blood_group}
                            onChange={(e) => handleStudentChange(e, index)}
                            className="w-full   border-1 border-gray-400 rounded-md p-2 shadow-inner"
                          >
                            <option value="">Select</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                          </select>
                          {formErrors.some(
                            (err) =>
                              err.field === `student_blood_group_${index}`
                          ) && (
                            <p className="text-red-500 text-xs">
                              {
                                formErrors.find(
                                  (err) =>
                                    err.field === `student_blood_group_${index}`
                                )?.message
                              }
                            </p>
                          )}
                        </div>
                        {/* House */}
                        <div className="flex flex-col">
                          <label className="font-bold text-sm">
                            House
                            {/* <span className="text-red-500">*</span> */}
                          </label>
                          <select
                            name="house"
                            value={student.house}
                            onChange={(e) => handleStudentChange(e, index)}
                            // onChange={handleStudentChange}
                            className="w-full   border-1 border-gray-400 rounded-md p-2 shadow-inner"
                          >
                            <option value="">Select</option>
                            <option value="E">Emerald</option>
                            <option value="R">Ruby</option>
                            <option value="S">Sapphire</option>
                            <option value="D">Diamond</option>
                          </select>
                          {formErrors.some(
                            (err) => err.field === `student_house_${index}`
                          ) && (
                            <p className="text-red-500 text-xs">
                              {
                                formErrors.find(
                                  (err) =>
                                    err.field === `student_house_${index}`
                                )?.message
                              }
                            </p>
                          )}
                        </div>
                        {/* Address */}
                        <div className="col-span-2 flex flex-col">
                          <label className="font-bold text-sm">
                            Address <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            name="permant_add"
                            value={student.permant_add} // Fixed the typo
                            onChange={(e) => handleStudentChange(e, index)}
                            maxLength={240}
                            className="w-full border-1 border-gray-400 rounded-md p-2 shadow-inner"
                          />
                          {formErrors.some(
                            (err) => err.field === `student_address_${index}`
                          ) && (
                            <p className="text-red-500 text-xs">
                              {
                                formErrors.find(
                                  (err) =>
                                    err.field === `student_address_${index}`
                                )?.message
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                ))}
              </div>
              <div className="col-span-3 md:mr-9 my-2 text-right">
                {data?.length > 0 && (
                  <button
                    type="submit"
                    className="bg-yellow-500 hover:bg-yellow-500 text-white px-6 py-2 rounded-md mr-3"
                    onClick={() => {
                      navigate("/studentIdCard", {
                        state: {
                          sectionID: data?.[0]?.section_id,
                        },
                      });
                    }}
                  >
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  style={{ backgroundColor: "#2196F3" }}
                  className="btn btn-primary  px-3 mb-2 font-bold"
                  disabled={loadingForSubmit}
                >
                  {loadingForSubmit ? "Submiting..." : "Submit"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default IDCardDetails;
