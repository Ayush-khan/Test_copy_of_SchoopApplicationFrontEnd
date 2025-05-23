import { useEffect, useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { useNavigate, useLocation, useParams } from "react-router-dom";
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
  const [formErrors, setFormErrors] = useState([]);
  const { staff } = location.state || {};
  const { id: student_id } = useParams(); // Aliased to student_id

  console.log("student_id from URL:", student_id);
  console.log("staff from location:", staff);

  const [data, setData] = useState(null);

  // const fetchStudentData = async () => {
  //   try {
  //     setLoading(true);
  //     const token = localStorage.getItem("authToken");
  //     const response = await axios.get(
  //       `${API_URL}/api/get_studentidcarddetails?student_id=${staff?.student_id}`,
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );
  //     const fetchedData = response?.data?.data || [];
  //     setData(fetchedData);
  //     setStudents(fetchedData);
  //   } catch (error) {
  //     toast.error("Error fetching Student Data");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const fetchStudentData = async () => {
  //   try {
  //     setLoading(true);
  //     const token = localStorage.getItem("authToken");
  //     const response = await axios.get(
  //       `${API_URL}/api/get_studentidcarddetails?student_id=${student_id}`,
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );
  //     const fetchedData = response?.data?.data || [];
  //     setData(fetchedData);
  //     setStudents(fetchedData);
  //   } catch (error) {
  //     toast.error("Error fetching Student Data");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");
        const idToFetch = student_id || staff?.student_id;
        if (!idToFetch) {
          toast.error("Student ID not found.");
          setLoading(false);
          return;
        }
        const response = await axios.get(
          `${API_URL}/api/get_studentidcarddetails?student_id=${idToFetch}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const fetchedData = response?.data?.data || [];
        setData(fetchedData);
        setStudents(fetchedData);
      } catch (error) {
        toast.error("Error fetching Student Data");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [student_id, staff?.student_id]);

  // useEffect(() => {
  //   fetchStudentData();
  // }, []);

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
          ? { ...student, image_base: croppedImageData || "" }
          : student
      )
    );
    setFormErrors((prevErrors) =>
      prevErrors.filter((err) => err.field !== `student_image_base_${index}`)
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loadingForSubmit) return;
    setFormErrors([]);

    let errors = [];

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
      setFormErrors(errors);
      return;
    }

    const student = students[0] || {};
    const finalData = {
      student_id: student.student_id || "",
      blood_group: student.blood_group || "",
      house: student.house || "",
      permant_add: student.permant_add || "",
      image_base: student.image_base || "",
    };

    try {
      setLoadingForSubmit(true);
      const token = localStorage.getItem("authToken");
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
        const sectionIDToPass = data[0]?.section_id;
        setTimeout(() => {
          navigate("/studentIdCard", {
            state: { sectionID: sectionIDToPass },
          });
        }, 1000);
      }
    } catch (error) {
      toast.error("Failed to save ID card.");
    } finally {
      setLoadingForSubmit(false);
    }
  };

  // if (loading || !students.length)
  //   return (
  //     <div className="flex w-1/2 mx-auto bg-white justify-center items-center h-64">
  //       <Loader />
  //     </div>
  //   );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="loader">Loading...</div>{" "}
        {/* Replace with your spinner */}
      </div>
    );
  }

  if (!students) {
    return <p className="text-center text-red-500">No student data found</p>;
  }

  return (
    <div className="mt-4 bg-gray-200 w-full md:w-[60%] mx-auto">
      <ToastContainer />
      <div className="card p-4 rounded-md w-full ">
        <div className="card-header mb-4 flex justify-between items-center">
          <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
            ID Card Details
          </h5>
          <RxCross1
            className="float-end relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
            onClick={() => {
              navigate("/studentIdCard", {
                state: {
                  sectionID: data?.[0]?.section_id,
                },
              });
            }}
          />
        </div>

        <div
          className="relative w-full -top-6 h-1 mx-auto"
          style={{ backgroundColor: "#C03078" }}
        ></div>

        <form
          onSubmit={handleSubmit}
          className="p-0 overflow-x-hidden shadow-md bg-gray-50"
        >
          <div className="w-full mx-auto flex flex-wrap p-4 gap-4 justify-center">
            {students.map((student, index) => (
              <div
                key={index}
                className="w-full md:w-[70%] border p-4 pt-2 rounded-lg shadow-lg bg-white"
              >
                <div className="flex flex-col md:grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:row-span-2 md:col-span-1 flex justify-center mb-4">
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
                  </div>

                  <div className="flex flex-col mt-2">
                    <label className="font-bold text-sm">Full Name</label>
                    <p className="bg-gray-200 border rounded-md p-2 shadow-inner">
                      {student.first_name || ""} {student.mid_name || ""}{" "}
                      {student.last_name || ""}
                    </p>
                  </div>

                  <div className="flex flex-col mt-2">
                    <label className="font-bold text-sm">
                      Class & Division
                    </label>
                    <p className="bg-gray-200 border rounded-md p-2 shadow-inner">
                      {student.classname || ""} - {student.sectionname || ""}
                    </p>
                  </div>

                  <div className="flex flex-col">
                    <label className="font-bold text-sm">Date of Birth</label>
                    <p className="bg-gray-200 border rounded-md p-2 shadow-inner">
                      {student.dob || ""}
                    </p>
                  </div>

                  <div className="flex flex-col">
                    <label className="font-bold text-sm">
                      Blood Group <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="blood_group"
                      value={student.blood_group}
                      onChange={(e) => handleStudentChange(e, index)}
                      className="w-full border rounded-md p-2 shadow-inner"
                    >
                      <option value="">Select</option>
                      {["AB+", "AB-", "A+", "A-", "B+", "B-", "O+", "O-"].map(
                        (bg) => (
                          <option key={bg} value={bg}>
                            {bg}
                          </option>
                        )
                      )}
                    </select>
                    {formErrors.some(
                      (err) => err.field === `student_blood_group_${index}`
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

                  <div className="flex flex-col">
                    <label className="font-bold text-sm">House</label>
                    <select
                      name="house"
                      value={student.house}
                      onChange={(e) => handleStudentChange(e, index)}
                      className="w-full border rounded-md p-2 shadow-inner"
                    >
                      <option value="">Select</option>
                      <option value="E">Emerald</option>
                      <option value="R">Ruby</option>
                      <option value="S">Sapphire</option>
                      <option value="D">Diamond</option>
                    </select>
                  </div>

                  <div className="col-span-2 flex flex-col">
                    <label className="font-bold text-sm">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="permant_add"
                      value={student.permant_add || ""}
                      onChange={(e) => handleStudentChange(e, index)}
                      maxLength={240}
                      className="w-full border rounded-md p-2 shadow-inner"
                    />
                    {formErrors.some(
                      (err) => err.field === `student_address_${index}`
                    ) && (
                      <p className="text-red-500 text-xs">
                        {
                          formErrors.find(
                            (err) => err.field === `student_address_${index}`
                          )?.message
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="col-span-3 md:mr-9 my-2 text-right">
            {data?.length > 0 && (
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
              >
                Submit
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default IDCardDetails;
