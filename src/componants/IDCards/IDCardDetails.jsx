import { useEffect, useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ImageCropper from "../common/ImageUploadAndCrop";
import Loader from "../common/LoaderFinal/LoaderStyle";

// const StudentInfo = ({ student }) => {
//   const handleImageCropped = (croppedImageData) => {
//     // (student.image_url: croppedImageData);
//     // update image inside student the fild present image_url
//   };
//   return (
//     <div className=" w-full md:w-[30%] border p-4 rounded shadow-md mb-4 bg-white">
//       <h2 className="text-xl font-bold">Student Information</h2>

//       <div className="w-[20%] rounded-full">
//         <ImageCropper
//           photoPreview={student?.image_url}
//           onImageCropped={handleImageCropped}
//         />
//       </div>

//       <div className="border-1 border-black flex flex-row">
//         <label htmlFor="address" className="block font-bold  text-xs mb-2">
//           Full Name <span className="text-red-500">*</span>
//         </label>
//         <p>
//           {student.first_name} {student.mid_name} {student.last_name}
//         </p>
//       </div>
//       <label htmlFor="address" className="block font-bold  text-xs mb-2">
//         Class & Division <span className="text-red-500">*</span>
//       </label>
//       <p>
//         {student.classname} - {student.sectionname}
//       </p>
//       <label htmlFor="address" className="block font-bold  text-xs mb-2">
//         Date of Birth <span className="text-red-500">*</span>
//       </label>
//       <p>{student.dob}</p>
//       <label htmlFor="address" className="block font-bold  text-xs mb-2">
//         Blood Group <span className="text-red-500">*</span>
//       </label>
//       <select defaultValue={student.blood_group} className="border p-1">
//         <option value="A+">A+</option>
//         <option value="B+">B+</option>
//         <option value="O+">O+</option>
//         <option value="AB+">AB+</option>
//       </select>
//       <label htmlFor="address" className="block font-bold  text-xs mb-2">
//         House <span className="text-red-500">*</span>
//       </label>

//       <select defaultValue={student.house} className="border p-1">
//         <option value="A">A</option>
//         <option value="B">B</option>
//         <option value="C">C</option>
//         <option value="D">D</option>
//       </select>
//       <label htmlFor="address" className="block font-bold  text-xs mb-2">
//         Address <span className="text-red-500">*</span>
//       </label>
//       <textarea
//         type="text"
//         maxLength={240}
//         id="address"
//         name="address"
//         value={student.permant_add}
//         // onChange={handleChange}
//         required
//         className="input-field block w-full  border-1 border-gray-400 rounded-md py-1 px-3 bg-white shadow-inner"
//       />
//       <p>Address: {student.permant_add}</p>
//     </div>
//   );
// };
const StudentInfo = ({ student, onUpdate }) => {
  const [editedStudent, setEditedStudent] = useState(student);

  const handleImageCropped = (croppedImageData) => {
    setEditedStudent((prev) => ({ ...prev, image_url: croppedImageData }));
    onUpdate({ ...editedStudent, image_url: croppedImageData });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedStudent((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="w-full md:w-[48%] border p-4 pt-2 rounded-lg shadow-lg bg-white">
      <h2 className="text-xl font-bold mb-4 text-center text-gray-500">
        Student Information
      </h2>

      {/* Grid Layout for Fields */}
      <div className="flex flex-col md:grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Full Name */}{" "}
        <div className=" md:row-span-2 md:col-span-1  flex justify-center mb-4 ">
          <div className="rounded-full">
            <ImageCropper
              photoPreview={editedStudent?.image_url}
              onImageCropped={handleImageCropped}
            />
          </div>
        </div>
        <div className="flex flex-col mt-2">
          <label className="font-bold text-sm">Full Name</label>
          <p className=" bg-gray-200 border-1 border-gray-100 rounded-md p-2 shadow-inner">
            {editedStudent.first_name || ""} {editedStudent.mid_name || " "}{" "}
            {editedStudent.last_name || " "}
          </p>
        </div>
        {/* Class & Division */}
        <div className="flex flex-col mt-2">
          <label className="font-bold text-sm">Class & Division</label>
          <p className=" bg-gray-200 border-1 border-gray-100 rounded-md p-2 shadow-inner">
            {editedStudent.classname || " "} -{" "}
            {editedStudent.sectionname || " "}
          </p>
        </div>
        {/* Date of Birth */}
        <div className="flex flex-col">
          <label className="font-bold text-sm">Date of Birth</label>
          <p className=" bg-gray-200 border-1 border-gray-100 rounded-md p-2 shadow-inner">
            {editedStudent.dob || " "}
          </p>
        </div>
        {/* Blood Group */}
        <div className="flex flex-col">
          <label className="font-bold text-sm">
            Blood Group <span className="text-red-500">*</span>
          </label>
          <select
            name="blood_group"
            value={editedStudent.blood_group}
            onChange={handleChange}
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
        </div>
        {/* House */}
        <div className="flex flex-col">
          <label className="font-bold text-sm">
            House <span className="text-red-500">*</span>
          </label>
          <select
            name="house"
            value={editedStudent.house}
            onChange={handleChange}
            className="w-full   border-1 border-gray-400 rounded-md p-2 shadow-inner"
          >
            <option value="">Select</option>
            <option value="E">Emerald</option>
            <option value="R">Ruby</option>
            <option value="S">Sapphire</option>
            <option value="D">Diamond</option>
          </select>
        </div>
        {/* Address */}
        <div className="col-span-2 flex flex-col">
          <label className="font-bold text-sm">
            Address <span className="text-red-500">*</span>
          </label>
          <textarea
            name="permanent_add"
            value={editedStudent.permant_add}
            onChange={handleChange}
            maxLength={240}
            className="w-full  border-1 border-gray-400 rounded-md p-2 shadow-inner"
          />
        </div>
      </div>
    </div>
  );
};
const ParentInfo = ({ parent, onUpdate }) => {
  const [editedParent, setEditedParent] = useState(parent);

  const handleImageCropped = (croppedImageData, type) => {
    setEditedParent((prev) => ({ ...prev, [type]: croppedImageData }));
    onUpdate({ ...editedParent, [type]: croppedImageData });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedParent((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="w-full md:w-[80%] border p-4 pt-2 rounded-lg shadow-lg bg-white">
      <h2 className="text-xl font-bold mb-4 text-center text-gray-500">
        Parent Information
      </h2>
      <div className="flex flex-col md:flex-row gap-x-6 gap-y-6 md:gap-y-1 justify-normal md:justify-between items-center">
        <div className=" w-full md:w-[50%]">
          <div className="flex justify-center mb-4">
            <div className=" rounded-full ">
              <ImageCropper
                photoPreview={editedParent.father_image_url}
                onImageCropped={(cropped) =>
                  handleImageCropped(cropped, "father_image_url")
                }
              />
            </div>
          </div>
          <div className="  flex flex-row justify-start gap-x-1 md:gap-x-5 ">
            <label className="block mt-2 font-bold text-sm w-full md:w-[25%] ">
              {" "}
              Father Name
            </label>
            <p className=" w-full md:w-[58%] mx-auto bg-gray-200 border-1 border-gray-400 rounded-md p-2 shadow-inner">
              {editedParent.father_name || " "}
            </p>
          </div>

          <div className=" mb-2 flex flex-row justify-start gap-x-6">
            <label className="block mt-2 font-bold text-sm w-full md:w-[30%] ">
              Father Mobile <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="f_mobile"
              value={editedParent.f_mobile || ""}
              onChange={handleChange}
              className="  border-1 border-gray-400 rounded-md p-2 shadow-inner"
            />
          </div>
        </div>
        <div className=" w-full md:w-[50%]">
          <div className="flex justify-center mb-4">
            <div className=" rounded-full ">
              <ImageCropper
                photoPreview={editedParent.mother_image_url}
                onImageCropped={(cropped) =>
                  handleImageCropped(cropped, "mother_image_url")
                }
              />
            </div>
          </div>
          <div className="  flex flex-row justify-start gap-x-1 md:gap-x-5 ">
            <label className="block mt-2 font-bold text-sm w-full md:w-[30%] ">
              Mother Name
            </label>
            <p className="  w-full md:w-[56%] mx-auto bg-gray-200 border-1 border-gray-400 rounded-md p-2 shadow-inner">
              {editedParent.mother_name || " "}
            </p>
          </div>

          <div className="mb-2 flex flex-row justify-start gap-x-6">
            <label className="block font-bold mt-2 text-sm w-full md:w-[33%]  ">
              Mother Mobile <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="m_mobile"
              value={editedParent.m_mobile || ""}
              onChange={handleChange}
              className="  border-1 border-gray-400 rounded-md p-2 shadow-inner"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const GuardianInfo = ({ guardian, onUpdate }) => {
  const [editedGuardian, setEditedGuardian] = useState(guardian);

  const handleImageCropped = (croppedImageData) => {
    setEditedGuardian((prev) => ({
      ...prev,
      guardian_image_url: croppedImageData,
    }));
    onUpdate({ ...editedGuardian, guardian_image_url: croppedImageData });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedGuardian((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="w-full md:w-[40%] border p-4 pt-2 rounded-lg shadow-lg bg-white">
      <h2 className="text-xl font-bold mb-4 text-center text-gray-500">
        Guardian Information
      </h2>
      <div className="flex justify-center mb-4">
        <div className=" rounded-full ">
          <ImageCropper
            photoPreview={editedGuardian.guardian_image_url}
            onImageCropped={handleImageCropped}
          />
        </div>
      </div>
      <div className="  flex flex-row justify-start gap-x-1 md:gap-x-5">
        <label className="block mt-2 font-bold text-sm w-full md:w-[35%] ">
          Guardian Name
        </label>
        <p className=" w-full md:w-[58%] mx-auto bg-gray-200 border-1 border-gray-400 rounded-md p-2 shadow-inner">
          {editedGuardian.guardian_name || " "}
        </p>
      </div>

      <div className="  flex flex-row justify-start gap-x-6">
        <label className="block mt-2 font-bold text-sm w-full md:w-[35%] ">
          Mobile Number <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="guardian_mobile"
          value={editedGuardian.guardian_mobile || ""}
          onChange={handleChange}
          className="  border-1 border-gray-400 rounded-md p-2 shadow-inner"
        />
      </div>
    </div>
  );
};

const IDCardDetails = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const { staff } = location.state || {};
  console.log("Staff is in edit form***", staff);
  const [data, setData] = useState(null);
  const fetchExams = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/get_studentdatawithparentdata?parent_id=${staff?.parent_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Class", response);
      setData(response?.data?.data || []);
    } catch (error) {
      toast.error("Error fetching Student Data");
      console.error("Error fetching Student Data:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchExams();
  }, []);
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Prevent double submissions
    if (loading) return;

    // Validate the form data

    // Format form data for API
    const formattedFormData = {};

    try {
      setLoading(true); // Start loading state
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      console.log("Submitting data:", formattedFormData);
      const response = await axios.put(
        `${API_URL}/api/teachers/${staff.teacher_id}`,
        formattedFormData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Handle successful response
      if (response.status === 200) {
        toast.success("Teacher updated successfully!");
        setTimeout(() => {
          navigate("/studentIdCard");
        }, 500);
      }
    } catch (error) {
      console.error(
        "Error updating teacher:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false); // End loading state
    }
  };
  //   if (loading) return <p>Loading...</p>;
  if (!data) return <p>No data available</p>;

  return (
    <div className="mt-4 bg-gray-200 w-full md:w-[95%] mx-auto">
      <ToastContainer />

      <div className="card p-4 rounded-md ">
        <div className=" card-header mb-4 flex justify-between items-center ">
          <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
            ID Card Details
          </h5>

          <RxCross1
            className="float-end relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
            onClick={() => {
              navigate("/studentIdCard");
            }}
          />
        </div>
        <div
          className=" relative w-full   -top-6 h-1  mx-auto bg-red-700"
          style={{
            backgroundColor: "#C03078",
          }}
        ></div>
        <p className="  md:absolute md:right-10  md:top-[10%]   text-gray-500 ">
          <span className="text-red-500">*</span>indicates mandatory information
        </p>
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
                {data.students.map((student) => (
                  <StudentInfo key={student.student_id} student={student} />
                ))}
              </div>

              <diV className="w-full md:w-[95%] mx-auto flex flex-col md:flex-row justify-between gap-x-4">
                {data.parents.map((parent) => (
                  <ParentInfo key={parent.parent_id} parent={parent} />
                ))}
                {data.guardian && <GuardianInfo guardian={data.guardian} />}
              </diV>
              <div className="col-span-3 md:mr-9 my-2 text-right">
                <button
                  type="submit"
                  style={{ backgroundColor: "#2196F3" }}
                  className=" text-white font-bold py-1 border-1 border-blue-500 px-4 rounded"
                >
                  Update
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
