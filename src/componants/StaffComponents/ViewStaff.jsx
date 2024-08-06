// corret date formate dd/mm/yy
import React, { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import { RxCross1 } from "react-icons/rx";
import { useNavigate, useLocation } from "react-router-dom";

function ViewStaff() {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const location = useLocation();
  const { staff } = location.state || {};
  const [formData, setFormData] = useState({
    employee_id: "",
    name: "",
    father_spouse_name: "",
    birthday: "",
    date_of_joining: "",
    sex: "",
    religion: "",
    blood_group: "",
    address: "",
    phone: "",
    email: "",
    designation: "",
    academic_qual: [],
    professional_qual: "",
    special_sub: "",
    trained: "",
    experience: "",
    aadhar_card_no: "",
    teacher_image_name: null,
    user_id: "",
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  // Role ID to Name Mapping
  const roleMapping = {
    A: "Admin",
    B: "Bus",
    E: "Data Entry",
    F: "Finance",
    L: "Librarian",
    M: "Management",
    N: "Printer",
    O: "Owner",
    R: "Support",
    T: "Teacher",
    X: "Support Staff",
    Y: "Security",
  };
  console.log("staff", staff);
  useEffect(() => {
    if (staff) {
      const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(date);
      };

      setFormData({
        employee_id: staff.employee_id || "",
        name: staff.name || "",
        father_spouse_name: staff.father_spouse_name || "",
        birthday: formatDate(staff.birthday),
        date_of_joining: formatDate(staff.date_of_joining),
        sex: staff.sex || "",
        religion: staff.religion || "",
        blood_group: staff.blood_group || "",
        address: staff.address || "",
        phone: staff.phone || "",
        email: staff.email || "",
        designation: staff.designation || "",
        academic_qual: staff.academic_qual
          ? staff.academic_qual.split(",")
          : [],
        professional_qual: staff.professional_qual || "",
        special_sub: staff.special_sub || "",
        trained: staff.trained || "",
        experience: staff.experience || "",
        aadhar_card_no: staff.aadhar_card_no || "",
        teacher_image_name: staff.teacher_image_name || null,
        role_id: staff.role_id || null,
        user_id: staff.user_id || null,
      });
      console.log("fromdroleid", formData.role_id);
      if (staff.teacher_image_name) {
        setPhotoPreview(
          `${API_URL}/path/to/images/${staff.teacher_image_name}`
        );
      }
    }
  }, [staff, API_URL]);

  return (
    <div className="container mx-auto p-4">
      <div className="card p-4 rounded-md">
        <div className="card-header mb-4 flex justify-between items-center">
          <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
            View Staff Details
          </h5>
          <RxCross1
            className="float-end relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
            onClick={() => {
              navigate("/StaffList");
            }}
          />
        </div>
        <div className="md:mx-5 overflow-x-hidden shadow-md p-2 bg-gray-50">
          <div className="flex flex-col md:grid md:grid-cols-3 md:gap-x-14 md:mx-10 ">
            <div className="mx-auto">
              <label
                htmlFor="teacher_image_name"
                className="block font-bold text-xs mb-2"
              >
                Photo
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Photo Preview"
                    className="h-20 w-20 rounded-[50%] mx-auto border-1 border-black object-cover"
                  />
                ) : (
                  <FaUserCircle className="mt-2 h-20 w-20 object-cover mx-auto text-gray-300" />
                )}
              </label>
            </div>
            <div className="col-span-1">
              <label
                htmlFor="academic_qual"
                className="block font-bold text-xs mb-2"
              >
                Academic Qualification
              </label>
              <div className="flex flex-wrap">
                {formData.academic_qual.map((qualification) => (
                  <span key={qualification} className="mr-4 text-sm font-md">
                    {qualification}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="address" className="block font-bold text-xs mb-2">
                Address
              </label>
              <p className="input-field resize h-[70%]  block w-full  border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner">
                {formData.address}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 ">
            {[
              { label: "Employee ID", name: "employee_id" },
              { label: "Name", name: "name" },
              { label: "Father/Spouse Name", name: "father_spouse_name" },
              { label: "Date of Birth", name: "birthday" },
              { label: "Date of Joining", name: "date_of_joining" },
              { label: "Gender", name: "sex" },
              { label: "Religion", name: "religion" },
              { label: "Blood Group", name: "blood_group" },
              { label: "Phone", name: "phone" },
              { label: "Email", name: "email" },
              {
                label: "Designation",
                name: "designation",
              },
              {
                label: "Professional Qualification",
                name: "professional_qual",
              },
              { label: "Special Subject", name: "special_sub" },
              { label: "Trained", name: "trained" },
              { label: "Experience", name: "experience" },
              { label: "Aadhar Card Number", name: "aadhar_card_no" },
              { label: "User ID", name: "user_id" },
              // { label: "Role", name: "role_id" },
              {
                label: "Role",
                name: "role_id",
                value: roleMapping[formData.designation] || "Unknown",
                // value: roleMapping[formData.role_id] || "Unknown",
              },
            ].map((field) => (
              <div key={field.name}>
                <label
                  htmlFor={field.name}
                  className="block font-bold text-xs py-1"
                >
                  {field.label}
                </label>
                {formData[field.name] ? (
                  <p className="input-field w-full border  border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner">
                    {field.value || formData[field.name]}
                  </p>
                ) : (
                  <p className="input-field w-full border pointer-events-none cursor-none border-gray-300 rounded-md py-3 px-3 bg-white shadow-inner">
                    {field.value || formData[field.name]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewStaff;
