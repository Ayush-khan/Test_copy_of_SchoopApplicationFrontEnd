import { useEffect, useState } from "react";
import axios from "axios";
import { RxCross1 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PersonalProfile = () => {
  // const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const location = useLocation();
  const student = location.state?.studentData || {};

  console.log("student", student);

  const message = location.state?.message;
  console.log(message);

  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
    }
  }, [location.state]);

  return (
    <>
      <div className="card px-3 relative -top-6 w-full  shadow-md flex flex-col h-auto min-h-full">
        {/* Student Information */}
        <div className="  flex justify-between items-center">
          {/* <div className="card-header  flex justify-between items-center"> */}
          <h3 className="text-blue-500 w-full text-center mt-1 mb-0 text-[1em] lg:text-xl text-nowrap">
            Student's Personal Profile{" "}
          </h3>
          <RxCross1
            className="float-end relative right-2  top-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
            onClick={() => navigate("/dashboard")}
          />
        </div>
        <div className="flex flex-col gap-y-3 p-2 flex-grow">
          <h3 className="text-gray-700 mt-1 mb-0 text-[1em] lg:text-xl text-nowrap">
            Student Information
          </h3>
          <div
            className="relative w-full h-0.5 mx-auto bg-red-700"
            style={{ backgroundColor: "#C03078" }}
          ></div>

          <div className=" text-sm grid grid-cols-3 gap-x-4 mt-3">
            {[
              {
                label: "Student Name",
                value: student.student_name || " ",
              },
              {
                label: "Date of Birth",
                value: student.dob || " ",
              },
              {
                label: "Admission Date",
                value: student.admission_date || " ",
              },
              { label: "GR No.", value: student.reg_no || " " },
              {
                label: "Student ID",
                value: student.student_id || " ",
              },
              {
                label: "Udise Pen No.",
                value: student.udise_pen_no || " ",
              },
              {
                label: "Aadhaar no.",
                value: student.stu_aadhaar_no || " ",
              },
              {
                label: "Class",
                value: student.get_class?.name || " ",
              },
              {
                label: "Division",
                value: student.get_division?.name || " ",
              },
              {
                label: "Roll No.",
                value: student.roll_no || " ",
              },
              { label: "House", value: student.house || " " },
              {
                label: "Admitted In Class",
                value: student.admission_class || " ",
              },
              {
                label: "Gender",
                value:
                  student.gender === "F"
                    ? "Female"
                    : student.gender === "M"
                    ? "Male"
                    : student.gender || "",
              },
              {
                label: "Blood Group",
                value: student.blood_group || " ",
              },
              {
                label: "Permanant Address",
                value: student.permant_add || " ",
              },
              { label: "City", value: student.city || " " },
              { label: "State", value: student.state || " " },
              { label: "Pincode", value: student.pincode || " " },
              {
                label: "Religion",
                value: student.religion || " ",
              },
              { label: "Caste", value: student.caste || " " },
              {
                label: "Category",
                value: student.category || " ",
              },
              {
                label: "Nationality",
                value: student.nationality || " ",
              },
              {
                label: "Birth Place",
                value: student.birth_place || " ",
              },
              {
                label: "Mother Tongue",
                value: student.mother_tongue || " ",
              },
              {
                label: "Emergency Name",
                value: student.emergency_name || " ",
              },
              {
                label: "Emergency Contact",
                value: student.emergency_contact || " ",
              },
              {
                label: "Emergency Address",
                value: student.emergency_add || " ",
              },
              {
                label: "Transport Mode",
                value: student.transport_mode || " ",
              },
              {
                label: "Allergies",
                value: student.allergies || " ",
              },
              { label: "Weight", value: student.weight || " " },
              { label: "Height", value: student.height || " " },
              {
                label: "Has spectacles",
                value: student.has_spec || " ",
              },
            ].map((item, index) => (
              <div key={index} className="flex">
                <p className="w-40 font-bold">{item.label}:</p>
                <p className="flex-1">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Parent Information */}
        <div className="flex flex-col gap-y-3 p-2 flex-grow">
          <h3 className="text-gray-700 mt-1 mb-0 text-[1em] lg:text-xl text-nowrap">
            Parent Information
          </h3>
          <div
            className="relative w-full h-0.5 mx-auto bg-red-700"
            style={{ backgroundColor: "#C03078" }}
          ></div>

          <div className="text-sm grid grid-cols-3 gap-x-4 mt-3">
            {[
              {
                label: "Father Name",
                value: student.parents?.father_name || " ",
              },
              {
                label: "Occupation",
                value: student.parents?.father_occupation || " ",
              },
              {
                label: "Office Address",
                value: student.parents?.f_office_add || " ",
              },
              {
                label: "Telephone",
                value: student.parents?.f_office_tel || " ",
              },
              {
                label: "Mobile Number",
                value: student.parents?.f_mobile || " ",
              },
              {
                label: "Email Id", // 👈 Label can be same
                value: student.parents?.f_email || " ", // ✅ Use exact key
              },
              {
                label: "Aadhaar no.",
                value: student.parents?.parent_adhar_no || " ",
              },
              {
                label: "Date of Birth",
                value: student.parents?.f_dob || " ",
              },
              {
                label: "Blood Group",
                value: student.parents?.f_blood_group || " ",
              },
              {
                label: "User Id",
                value: student.parents?.user?.user_id || " ",
              },
            ].map((item, index) => (
              <div key={index} className="flex">
                <p className="w-40 font-bold">{item.label}:</p>
                <p className="flex-1">{item.value}</p>
              </div>
            ))}

            {[
              {
                label: "Mother Name",
                value: student.parents?.mother_name || " ",
              },
              {
                label: "Occupation",
                value: student.parents?.mother_occupation || " ",
              },
              {
                label: "Office Address",
                value: student.parents?.m_office_add || " ",
              },
              {
                label: "Telephone",
                value: student.parents?.m_office_tel || " ",
              },
              {
                label: "Mobile Number",
                value: student.parents?.m_mobile || " ",
              },
              {
                label: "Email Id", // ✅ Same label
                value: student.parents?.m_emailid || " ", // ✅ Correct key for mother's email
              },
              {
                label: "Aadhaar no.",
                value: student.parents?.m_adhar_no || " ",
              },
              {
                label: "Date of Birth",
                value: student.parents?.m_dob || " ",
              },
              {
                label: "Blood Group",
                value: student.parents?.m_blood_group || " ",
              },
            ].map((item, index) => (
              <div key={index} className="flex">
                <p className="w-40 font-bold">{item.label}:</p>
                <p className="flex-1">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default PersonalProfile;
// Stylinsh UI
// import { useEffect, useState } from "react";
// import axios from "axios";
// import { RxCross1 } from "react-icons/rx";
// import { useNavigate } from "react-router-dom";
// import { useLocation } from "react-router-dom";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const PersonalProfile = () => {
//   // const API_URL = import.meta.env.VITE_API_URL;
//   const navigate = useNavigate();
//   const location = useLocation();
//   const student = location.state?.studentData || {};

//   console.log("student", student);

//   const message = location.state?.message;
//   console.log(message);

//   useEffect(() => {
//     if (location.state?.message) {
//       toast.success(location.state.message);
//     }
//   }, [location.state]);

//   return (
//     <>
//       <div className="card px-3 relative -top-6 w-full  shadow-md flex flex-col h-auto min-h-full">
//         {/* Student Information */}
//         <div className="flex flex-col gap-y-6  bg-gray-50 rounded-lg shadow-inner mt-6">
//           <div
//             className="  flex justify-between items-center

//           "
//           >
//             <h3
//               className="text-[#C03078] relative top-2 left-3
//              w-full  mt-1 mb-0 text-[1em] lg:text-xl font-bold tracking-wide"
//             >
//               Student's Personal Profile{" "}
//             </h3>
//             <RxCross1
//               className="float-end relative right-2  top-3  text-red-600 hover:cursor-pointer hover:bg-red-100 text-2xl"
//               onClick={() => navigate("/dashboard")}
//             />
//           </div>

//           <div className="h-0.5 w-full bg-[#C03078] rounded"></div>

//           {/* Personal Details */}
//           <div
//             className="bg-white shadow-md p-3
//             rounded-lg border border-gray-200"
//           >
//             <h4 className="text-lg font-semibold text-blue-700 mb-3">
//               Personal Details
//             </h4>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-md">
//               {[
//                 {
//                   label: "Student's Full Name",
//                   value: [
//                     student.first_name,
//                     student.mid_name,
//                     student.last_name,
//                   ]
//                     .filter(Boolean) // removes null, undefined, ""
//                     .join(" "),
//                 },
//                 { label: "Student Name", value: student.student_name },
//                 {
//                   label: "Gender",
//                   value:
//                     student.gender === "M"
//                       ? "Male"
//                       : student.gender === "F"
//                       ? "Female"
//                       : "Other",
//                 },
//                 { label: "Date of Birth", value: student.dob },
//                 { label: "Birth Place", value: student.birth_place },
//                 { label: "Nationality", value: student.nationality },
//                 { label: "Religion", value: student.religion },
//                 { label: "Caste", value: student.caste },
//                 { label: "Category", value: student.category },
//                 { label: "Blood Group", value: student.blood_group },
//                 { label: "Mother Tongue", value: student.mother_tongue },
//                 { label: "Aadhaar No.", value: student.stu_aadhaar_no },
//               ].map((item, index) => (
//                 <div key={index} className="flex">
//                   <span className="font-medium w-40 text-gray-700">
//                     {item.label}:
//                   </span>
//                   <span className="text-gray-900">{item.value || "N/A"}</span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Academic Details */}
//           <div className="bg-white shadow-md p-3 rounded-lg border border-gray-200">
//             <h4 className="text-lg font-semibold text-green-700 mb-3">
//               Academic Details
//             </h4>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-md">
//               {[
//                 { label: "Admission Date", value: student.admission_date },
//                 { label: "Admitted in Class", value: student.admission_class },
//                 { label: "Class Name       ", value: student.get_class?.name },
//                 { label: "Division", value: student.get_division?.name },
//                 { label: "Roll No.", value: student.roll_no },
//                 { label: "GR No.", value: student.reg_no },
//                 { label: "Student ID", value: student.student_id },
//                 { label: "UDISE Pen No.", value: student.udise_pen_no },
//                 { label: "House Name", value: student.house },
//               ].map((item, index) => (
//                 <div key={index} className="flex">
//                   <span className="font-medium w-40 text-gray-700">
//                     {item.label}:
//                   </span>
//                   <span className="text-gray-900">{item.value || "N/A"}</span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Contact Details */}
//           <div className="bg-white shadow-md p-3 rounded-lg border border-gray-200">
//             <h4 className="text-lg font-semibold text-purple-700 mb-3">
//               Contact Details
//             </h4>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-md">
//               {[
//                 { label: "Permanent Address", value: student.permant_add },
//                 { label: "City of Residence ", value: student.city },
//                 { label: "State of Residence  ", value: student.state },
//                 { label: "Pincode", value: student.pincode },
//               ].map((item, index) => (
//                 <div key={index} className="flex">
//                   <span className="font-medium w-40 text-gray-700">
//                     {item.label}:
//                   </span>
//                   <span className="text-gray-900">{item.value || "N/A"}</span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Emergency Details */}
//           <div className="bg-white shadow-md p-3 rounded-lg border border-gray-200">
//             <h4 className="text-lg font-semibold text-red-700 mb-3">
//               Emergency Details
//             </h4>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-md">
//               {[
//                 { label: "Emergency Name", value: student.emergency_name },
//                 {
//                   label: "Emergency Contact",
//                   value: student.emergency_contact,
//                 },
//                 { label: "Emergency Address", value: student.emergency_add },
//               ].map((item, index) => (
//                 <div key={index} className="flex">
//                   <span className="font-medium w-40 text-gray-700">
//                     {item.label}:
//                   </span>
//                   <span className="text-gray-900">{item.value || "N/A"}</span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Health Details */}
//           <div className="bg-white shadow-md p-3 rounded-lg border border-gray-200">
//             <h4 className="text-lg font-semibold text-amber-700 mb-3">
//               Health Details
//             </h4>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-md">
//               {[
//                 { label: "Height", value: student.height },
//                 { label: "Weight", value: student.weight },
//                 { label: "Has Spectacles", value: student.has_spec },
//                 { label: "Transport Mode", value: student.transport_mode },
//                 { label: "Allergies", value: student.allergies },
//               ].map((item, index) => (
//                 <div key={index} className="flex">
//                   <span className="font-medium w-40 text-gray-700">
//                     {item.label}:
//                   </span>
//                   <span className="text-gray-900">{item.value || "N/A"}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Parent Information */}
//         <div className="flex flex-col gap-y-4  bg-gray-50 rounded-lg shadow-inner mt-6">
//           <h3
//             className="text-[#C03078] relative top-3 left-3
//            text-xl font-semibold"
//           >
//             Parent Information
//           </h3>
//           <div className="h-0.5 w-full bg-[#C03078] rounded"></div>

//           {/* Father's Info */}
//           <div className="bg-white shadow p-3 rounded-md border border-gray-200">
//             <h4 className="text-lg font-semibold text-blue-600 mb-2">
//               Father's Details
//             </h4>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-md">
//               {[
//                 { label: "Name", value: student.parents?.father_name },
//                 {
//                   label: "Occupation",
//                   value: student.parents?.father_occupation,
//                 },
//                 {
//                   label: "Office Address",
//                   value: student.parents?.f_office_add,
//                 },
//                 { label: "Telephone", value: student.parents?.f_office_tel },
//                 { label: "Mobile Number", value: student.parents?.f_mobile },
//                 { label: "Email Id", value: student.parents?.f_email },
//                 {
//                   label: "Aadhaar No.",
//                   value: student.parents?.parent_adhar_no,
//                 },
//                 { label: "Date of Birth", value: student.parents?.f_dob },
//                 { label: "Blood Group", value: student.parents?.f_blood_group },
//                 { label: "User Id", value: student.parents?.user?.user_id },
//               ].map((item, index) => (
//                 <div key={index} className="flex">
//                   <span className="font-medium w-40 text-gray-700">
//                     {item.label}:
//                   </span>
//                   <span className="text-gray-900">{item.value || "N/A"}</span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Mother's Info */}
//           <div
//             className="bg-white shadow p-3 rounded-md border border-gray-200 mt-4
// mb-4 "
//           >
//             <h4 className="text-lg font-semibold text-pink-600 mb-2">
//               Mother's Details
//             </h4>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-md">
//               {[
//                 { label: "Name", value: student.parents?.mother_name },
//                 {
//                   label: "Occupation",
//                   value: student.parents?.mother_occupation,
//                 },
//                 {
//                   label: "Office Address",
//                   value: student.parents?.m_office_add,
//                 },
//                 { label: "Telephone", value: student.parents?.m_office_tel },
//                 { label: "Mobile Number", value: student.parents?.m_mobile },
//                 { label: "Email Id", value: student.parents?.m_emailid },
//                 { label: "Aadhaar No.", value: student.parents?.m_adhar_no },
//                 { label: "Date of Birth", value: student.parents?.m_dob },
//                 { label: "Blood Group", value: student.parents?.m_blood_group },
//               ].map((item, index) => (
//                 <div key={index} className="flex">
//                   <span className="font-medium w-40 text-gray-700">
//                     {item.label}:
//                   </span>
//                   <span className="text-gray-900">{item.value || "N/A"}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default PersonalProfile;
