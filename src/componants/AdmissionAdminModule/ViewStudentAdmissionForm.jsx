import React, { useState, useEffect } from "react";
import {
  FaDownload,
  FaFolderOpen,
  FaUserCircle,
  FaUsers,
} from "react-icons/fa";
import { RxCross1 } from "react-icons/rx";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaUserGroup } from "react-icons/fa6";
import { FiDownload } from "react-icons/fi";
import { FaFilePdf, FaEye, FaUser } from "react-icons/fa";
import { useParams, useSearchParams } from "react-router-dom";

function ViewStudentAdmissionForm() {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const location = useLocation();

  const [student, setStudent] = useState(null);
  const [attachments, setAttachments] = useState([]);

  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const class_id = searchParams.get("class_id");
  const fromModule = location.state?.from;

  console.log("Form ID:", id);
  console.log("Class ID:", class_id);
  console.log("From Module:", fromModule);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const token = localStorage.getItem("authToken");

        const response = await axios.get(
          `${API_URL}/api/admin/applications/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const { application, attachments } = response.data.data;

        setStudent(application);
        setAttachments(attachments || []);
      } catch (error) {
        console.error(error);
        toast.error("Error fetching student data");
      }
    };

    if (id) {
      fetchStudentData();
    }
  }, [API_URL, id]);

  const [formData, setFormData] = useState({
    first_name: "",
    mid_name: "",
    last_name: "",
    student_name: "",
    dob: "",
    admission_date: "",
    stud_id_no: "",
    stud_aadhar: "",
    gender: "",
    category: " ",
    blood_group: " ",
    mother_tongue: "",
    perm_address: " ",
    birth_place: "",
    admission_class: "",
    city: "",
    state: "",
    roll_no: "",
    class_id: "",
    section_id: "",
    religion: "",
    caste: "",
    subcaste: "",
    vehicle_no: "",
    emergency_name: "",
    emergency_contact: "",
    emergency_add: "",
    transport_mode: " ",
    height: "",
    weight: "",
    allergies: "",
    nationality: "",
    pincode: "",
    image_name: null,
    student_id: "",
    reg_no: " ",
    current_school_class: " ",
    acheivements: " ",
    locality: "",
    // Parent fields
    father_name: "",
    father_occupation: "",
    f_office_add: "",
    f_office_tel: "",
    f_mobile: "",
    f_email: "",
    f_dob: " ",
    m_dob: " ",
    f_aadhar_no: "",
    f_qualification: "",
    m_qualification: "",
    mother_name: "",
    mother_occupation: "",
    m_office_add: "",
    m_office_tel: "",
    m_mobile: "",
    m_emailid: "",
    m_aadhar_no: "",
    m_blood_group: "",
    f_blood_group: "",
    has_specs: "",
    udise_pen_no: "",
    apaar_id: "",
    user_id: "",
    SetToReceiveSMS: "",
    SetEmailIDAsUsername: "",
    // sibling
    sibling: "",
    sibling_class: "",
    sibling_name: "",
    sibling_section: "",
    area_in_which_parent_can_contribute: "",
    other_area: "",
  });

  useEffect(() => {
    if (student) {
      setFormData({
        first_name: student.first_name || " ",
        mid_name: student.mid_name || "",
        last_name: student.last_name || "",
        house: student.house || "",
        student_name: student.student_name || "",
        dob: student.dob || "",
        admission_date: student.admission_date || "",
        stud_id_no: student.stud_id_no || "",
        stud_aadhar: student.stud_aadhar || "",
        gender: student.gender || "",
        perm_address: student.perm_address || " ",
        mother_tongue: student.mother_tongue || "",
        birth_place: student.birth_place || "",
        admission_class: student.admission_class || " ",
        city: student.city || " ",
        state: student.state || "",
        roll_no: student.roll_no || "",
        student_id: student.student_id || " ",
        reg_no: student.reg_no || " ",
        blood_group: student.blood_group || " ",
        category: student.category || " ",
        class_name: student.class_name || " ",
        religion: student.religion || "",
        caste: student.caste || "",
        subcaste: student.subcaste || "",
        transport_mode: student.transport_mode || " ",
        vehicle_no: student.vehicle_no || "",
        emergency_name: student.emergency_name || " ",
        emergency_contact: student.emergency_contact || "",
        emergency_add: student.emergency_add || "",
        height: student.height || "",
        weight: student.weight || "",
        allergies: student.allergies || "",
        nationality: student.nationality || "",
        pincode: student.pincode || "",
        image_name: student.image_name || null,
        current_school_class: student.current_school_class || "",
        acheivements: student.acheivements || "",
        locality: student.locality || "",

        f_qualification: student?.f_qualification || "",
        father_name: student?.father_name || " ",
        father_occupation: student?.father_occupation || "",
        f_office_add: student?.f_office_add || "  ",
        f_blood_group: student?.f_blood_group || "",
        f_office_tel: student?.f_office_tel || "",
        f_mobile: student?.f_mobile || "",
        f_email: student?.f_email || "",
        f_dob: student?.f_dob || " ",
        m_dob: student?.m_dob || " ",
        m_blood_group: student?.m_blood_group || "",

        f_aadhar_no: student?.f_aadhar_no || " ",
        m_aadhar_no: student?.m_aadhar_no || "",

        mother_name: student?.mother_name || " ",
        mother_occupation: student?.mother_occupation || "",
        m_office_add: student?.m_office_add || " ",
        m_office_tel: student?.m_office_tel || "",
        m_mobile: student?.m_mobile || "",
        m_emailid: student?.m_emailid || "",
        m_qualification: student?.m_qualification || "",

        udise_pen_no: student.udise_pen_no || " ",
        apaar_id: student?.apaar_id || " ",
        user_id: student?.user_master?.user_id || " ",
        SetToReceiveSMS: student.SetToReceiveSMS || "",
        SetEmailIDAsUsername: student.SetEmailIDAsUsername || "",
        sibling: student.sibling || "",
        sibling_student_id: student.sibling_student_id || " ",
        sibling_name: student.sibling_name || " ",
        sibling_class: student.sibling_class || " ",
        sibling_section: student.sibling_section || " ",
        area_in_which_parent_can_contribute:
          student.area_in_which_parent_can_contribute || "",
        other_area: student.other_area || "",
      });
    }
  }, [student]);

  console.log("setFormdata", formData);

  const DOC_TYPE_LABELS = {
    BC: "Birth Certificate",
    CC: "Caste Certificate",
    PQ: "Parent's Highest Educational Qualification",
    AC: "Aadhaar Card",
    FP: "Family Photo",
    PS: "Photo of Child",
    BF: "Bonafide Certificate",
    AD: "Report Card",
    BP: "Baptism Certificate",
    PC: "Parent Aadhar card",
    // FOR 11
    // FP: "Father Photo",
    MP: "Mother Photo",
    FA: "Father Aadhar Card",
    MA: "Mother Aadhar Card",
    // AC: "Student Aadhar Card",
    // 9R: "9th Report Card",
    RC: "10th Preboard Report Card",
    TC: "Transfer Certificate",
    MB: "Marksheet 10th Board",
    MC: "Migration Certificate",
  };

  const allFiles = attachments ? Object.values(attachments).flat() : [];

  const downloadFile = async (fileUrl, fileName) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = fileName || "download";
      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const [previewFile, setPreviewFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openPreview = (file) => {
    if (!file.is_image) {
      window.open(file.file_url, "_blank");
      return;
    }
    setPreviewFile(file);
    setIsModalOpen(true);
  };

  const closePreview = () => {
    setPreviewFile(null);
    setIsModalOpen(false);
  };

  return (
    <div className=" w-[95%] mx-auto p-4">
      <ToastContainer />
      <div className="card rounded-md">
        <div className="relative card-header mb-4 flex items-center justify-center">
          <h5 className="text-gray-700 text-md lg:text-lg">
            Admission Form Details
          </h5>

          {/* Form ID – visually near heading but not affecting center */}
          <div className="bg-blue-50 border-l-2 border-r-2 border-pink-500 rounded-md shadow-md px-4 py-1 mx-auto">
            <div className="flex items-center justify-center gap-2 text-blue-800 font-medium">
              <label className="whitespace-nowrap">Form Id :</label>
              <span className="text-pink-500 font-semibold">{id}</span>
            </div>
          </div>

          {/* Close icon */}
          {/* <RxCross1
            className="absolute right-3 text-xl text-red-600 cursor-pointer hover:bg-red-100 rounded"
            onClick={() =>
              navigate("/listOfAdmissionSuccessfulPayment", {
                state: { class_id },
              })
            }
          /> */}
          <RxCross1
            className="absolute right-3 text-xl text-red-600 cursor-pointer hover:bg-red-100 rounded"
            // onClick={() => {
            //   if (fromModule === "listOfStudentsForDocumentSubmission") {
            //     navigate("/listOfStudentsForDocumentSubmission");
            //   } else if (fromModule === "listOfStudentForSchedulingInterview") {
            //     navigate("/listOfStudentForSchedulingInterview");
            //   } else if (fromModule === "listOfStudentForVerfication") {
            //     navigate("/listOfStudentForVerfication");
            //   } else if (fromModule === "listOfStudentForApproval") {
            //     navigate("/listOfStudentForApproval");
            //   } else if (fromModule === "listofAdmissionSuccessfulPayment") {
            //     navigate("/listofAdmissionSuccessfulPayment");
            //   } else {
            //     navigate(-1);
            //   }
            // }}
            onClick={() => {
              const stateData = { class_id };

              if (fromModule === "listOfStudentsForDocumentSubmission") {
                navigate("/listOfStudentsForDocumentSubmission");
              } else if (fromModule === "listOfStudentForSchedulingInterview") {
                navigate("/listOfStudentForSchedulingInterview");
              } else if (fromModule === "listOfStudentForVerfication") {
                navigate("/listOfStudentForVerfication");
              } else if (fromModule === "listOfStudentForApproval") {
                navigate("/listOfStudentForApproval", { state: stateData });
              } else if (fromModule === "listofAdmissionSuccessfulPayment") {
                navigate("/listofAdmissionSuccessfulPayment", {
                  state: stateData,
                });
              } else {
                navigate(-1);
              }
            }}
          />
        </div>

        <div
          className="relative w-full -top-6 h-1 mx-auto bg-red-700"
          style={{ backgroundColor: "#C03078" }}
        ></div>

        <form className="md:mx-2 overflow-x-hidden shadow-md py-1 bg-gray-50 mt-0">
          <div className="flex flex-col gap-y-3 p-2 md:grid md:grid-cols-4 md:gap-x-14 md:mx-10 ">
            <div
              className="w-full col-span-4 relative "
            // top-4
            >
              <div className="w-full mx-auto">
                <h3 className="text-blue-500 w-full mx-auto text-center  md:text-[1.2em] text-nowrap font-bold">
                  {" "}
                  <FaUser className="text-[1.2em] text-blue-500 inline" />{" "}
                  Student Information :{" "}
                </h3>
              </div>
            </div>
            <div className="mt-2">
              <label
                htmlFor="first_name"
                className="block font-bold text-xs mb-0.5"
              >
                First Name
              </label>
              <input
                type="text"
                disabled
                value={formData.first_name}
                className="  block w-full  rounded-md py-1 px-3 bg-gray-300 "
              />
            </div>
            <div className="mt-2">
              <label
                htmlFor="mid_name"
                className="block font-bold text-xs mb-0.5"
              >
                Middle Name
              </label>
              <input
                type="text"
                disabled
                value={formData.mid_name}
                className=" block w-full  rounded-md py-1 px-3 bg-gray-300 "

              // onBlur={handleBlur}
              />
            </div>
            <div className="mt-2">
              <label
                htmlFor="lastName"
                className="block font-bold text-xs mb-0.5"
              >
                Last Name
              </label>
              <input
                type="text"
                disabled
                value={formData.last_name}
                className=" block w-full  rounded-md py-1 px-3 bg-gray-300 "

              // onBlur={handleBlur}
              />
            </div>
            <div className="mt-2">
              <label
                htmlFor="studentClass"
                className="block font-bold text-xs mb-0.5"
              >
                Class
              </label>
              <input
                type="text"
                disabled
                value={formData.class_name}
                className=" block w-full  rounded-md py-1 px-3 bg-gray-300 "
              ></input>
            </div>
            <div className="mt-2">
              <label
                htmlFor="dateOfBirth"
                className="block font-bold text-xs mb-0.5"
              >
                Date of Birth
              </label>
              <input
                type="date"
                disabled
                value={formData.dob}
                className=" block w-full  rounded-md py-1 px-3 bg-gray-300 "

              // onBlur={handleBlur}
              />
            </div>
            <div className="mt-2">
              <label
                htmlFor="birthPlace"
                className="block font-bold text-xs mb-0.5"
              >
                Birth Place
              </label>
              <input
                type="text"
                disabled
                value={formData.birth_place}
                className=" block w-full  rounded-md py-1 px-3 bg-gray-300 "

              // onBlur={handleBlur}
              />
            </div>
            <div className="mt-2">
              <label
                htmlFor="motherTongue"
                className="block font-bold text-xs mb-0.5"
              >
                Mother Tongue
              </label>
              <input
                type="text"
                disabled
                value={formData.mother_tongue}
                className=" block w-full  rounded-md py-1 px-3 bg-gray-300 "

              // onBlur={handleBlur}
              />
            </div>
            <div className="mt-2">
              <label
                htmlFor="gender"
                className="block font-bold text-xs mb-0.5"
              >
                Gender
              </label>
              <input
                type="text"
                disabled
                value={
                  formData.gender === "F"
                    ? "Female"
                    : formData.gender === "M"
                      ? "Male"
                      : ""
                }
                className=" block w-full  rounded-md py-1 px-3 bg-gray-300 "

              // onBlur={handleBlur}
              ></input>
            </div>
            <div className="mt-2">
              <label
                htmlFor="religion"
                className="block font-bold text-xs mb-0.5"
              >
                Religion
              </label>
              <input
                type="text"
                disabled
                value={formData.religion}
                className=" block w-full  rounded-md py-1 px-3 bg-gray-300 "

              // onBlur={handleBlur}
              ></input>
            </div>
            <div className="mt-2">
              <label htmlFor="caste" className="block font-bold text-xs mb-0.5">
                Caste
              </label>
              <input
                type="text"
                disabled
                value={formData.caste}
                className=" block w-full  rounded-md py-1 px-3 bg-gray-300 "

              // onBlur={handleBlur}
              />
            </div>
            <div className="mt-2">
              <label htmlFor="caste" className="block font-bold text-xs mb-0.5">
                Sub Caste
              </label>
              <input
                type="text"
                disabled
                value={formData.subcaste}
                className=" block w-full  rounded-md py-1 px-3 bg-gray-300 "

              // onBlur={handleBlur}
              />
            </div>
            <div className="mt-2">
              <label
                htmlFor="category"
                className="block font-bold text-xs mb-0.5"
              >
                Category
              </label>
              <input
                type="text"
                disabled
                value={formData.category}
                className=" block w-full  rounded-md py-1 px-3 bg-gray-300 "

              // onBlur={handleBlur}
              ></input>
            </div>
            <div className="mt-2">
              <label
                htmlFor="nationality"
                className="block font-bold text-xs mb-0.5"
              >
                Nationality
              </label>
              <input
                type="text"
                disabled
                value={formData.nationality}
                className=" block w-full  rounded-md py-1 px-3 bg-gray-300 "

              // onBlur={handleBlur}
              />
            </div>
            <div className="mt-2">
              <label
                htmlFor="address"
                className="block font-bold text-xs mb-0.5"
              >
                Present Address
              </label>
              <textarea
                id="address"
                disabled
                rows={2}
                value={formData.locality}
                className=" block w-full  rounded-md py-1 px-3 bg-gray-300 "
              />
            </div>
            <div className="mt-2">
              <label htmlFor="city" className="block font-bold text-xs mb-0.5">
                City
              </label>
              <input
                type="text"
                disabled
                maxLength={100}
                value={formData.city}
                className=" block w-full  rounded-md py-1 px-3 bg-gray-300 "

              // onBlur={handleBlur}
              />
            </div>
            <div className="mt-2">
              <label htmlFor="state" className="block font-bold text-xs mb-0.5">
                State
              </label>
              <input
                type="text"
                disabled
                value={formData.state}
                className=" block w-full  rounded-md py-1 px-3 bg-gray-300 "

              // onBlur={handleBlur}
              />
            </div>
            <div className="mt-2">
              <label
                htmlFor="pincode"
                className="block font-bold text-xs mb-0.5"
              >
                Pincode
              </label>
              <input
                type="text"
                disabled
                value={formData.pincode}
                className=" block w-full  rounded-md py-1 px-3 bg-gray-300 "

              // onBlur={handleBlur}
              />
            </div>
            <div className="mt-2">
              <label
                htmlFor="address"
                className="block font-bold text-xs mb-0.5"
              >
                Permanant Address
              </label>
              <textarea
                id="address"
                disabled
                rows={2}
                value={formData.perm_address}
                className=" block w-full  rounded-md py-1 px-3 bg-gray-300 "
              />
            </div>
            <div className="mt-2">
              <label
                htmlFor="pincode"
                className="block font-bold text-xs mb-0.5"
              >
                Aadhaar card no.
              </label>
              <input
                type="text"
                disabled
                value={formData.stud_aadhar}
                className=" block w-full  rounded-md py-1 px-3 bg-gray-300 "

              // onBlur={handleBlur}
              />
            </div>
            <div className="mt-2">
              <label
                htmlFor="blood_group"
                className="block font-bold text-xs mb-0.5"
              >
                Blood Group
              </label>
              <input
                type="text"
                disabled
                value={formData.blood_group}
                className=" block w-full  rounded-md py-1 px-3 bg-gray-300 "
              />
            </div>
            <div className="mt-2">
              <label
                htmlFor="blood_group"
                className="block font-bold text-xs mb-0.5"
              >
                Current School & Class
              </label>
              <input
                type="text"
                disabled
                value={formData.current_school_class}
                className=" block w-full  rounded-md py-1 px-3 bg-gray-300 "
              />
            </div>
            <div className="mt-2">
              <label
                htmlFor="blood_group"
                className="block font-bold text-xs mb-0.5"
              >
                Achievements(If Any)
              </label>
              <input
                type="text"
                disabled
                value={formData.acheivements}
                className=" block w-full  rounded-md py-1 px-3 bg-gray-300 "
              />
            </div>
            {/* Sibling Information */}
            <div className="w-full col-span-4 relative top-4">
              <div className="w-full mx-auto">
                <h3 className="text-blue-500 w-full mx-auto text-center  md:text-[1.2em] text-nowrap font-bold">
                  {" "}
                  <FaUsers className="text-[1.2em] text-blue-500 inline" />{" "}
                  Sibling's Information :{" "}
                </h3>
              </div>
            </div>
            <div className="mt-2">
              <label htmlFor="email" className="block font-bold text-xs mb-0.5">
                Sibling
              </label>
              <input
                type="text"
                id="email"
                disabled
                maxLength={100}
                value={formData.sibling === "Y" ? "Yes" : " "}
                className=" block w-full  rounded-md py-1 px-3 bg-gray-300 "
              />
            </div>
            <div className="mt-2">
              <label htmlFor="email" className="block font-bold text-xs mb-0.5">
                Class
              </label>
              <input
                type="text"
                id="email"
                disabled
                maxLength={100}
                value={`${formData.sibling_class || ""} ${formData.sibling_section || ""
                  }`}
                className=" block w-full  rounded-md py-1 px-3 bg-gray-300 "
              />
            </div>
            <div className="mt-2">
              <label htmlFor="email" className="block font-bold text-xs mb-0.5">
                Student Id
              </label>
              <input
                type="text"
                id="email"
                disabled
                maxLength={100}
                value={formData.sibling_name}
                className=" block w-full  rounded-md py-1 px-3 bg-gray-300 "
              />
            </div>
            {/* Parent Information */}
            <div className="w-full col-span-4 relative top-4">
              <div className="w-full mx-auto">
                <h3 className="text-blue-500 w-full mx-auto text-center  md:text-[1.2em] text-nowrap font-bold">
                  {" "}
                  <FaUserGroup className="text-[1.2em] text-blue-500 inline" />{" "}
                  Parent's Information :{" "}
                </h3>
              </div>
            </div>
            <div className="mt-2">
              <label htmlFor="email" className="block font-bold text-xs mb-0.5">
                Father Name
              </label>
              <input
                type="text"
                id="email"
                disabled
                maxLength={100}
                value={formData.father_name}
                className=" block w-full  rounded-md py-1 px-3 bg-gray-300 "
              />
            </div>
            <div>
              <label htmlFor="phone" className="block font-bold text-xs mb-0.5">
                Mobile Number
              </label>
              <div className="flex">
                <span className="w-[15%] h-[34px] text-[14px] text-[#555] text-center border border-[#ccc] border-r-0 flex items-center justify-center p-1">
                  +91
                </span>
                <input
                  type="tel"
                  id="phone"
                  disabled
                  pattern="\d{10}"
                  maxLength="10"
                  value={formData.f_mobile}
                  className=" block w-full  outline-none rounded-r-md py-1 px-3 bg-gray-300 "
                  required
                />
              </div>
            </div>
            <div className="mt-2">
              <label htmlFor="email" className="block font-bold text-xs mb-0.5">
                Email Id
              </label>
              <input
                type="text"
                disabled
                value={formData.f_email}
                className=" block w-full  rounded-md py-1 px-3 bg-gray-300 "
              />
            </div>
            <div className="mt-2">
              <label htmlFor="email" className="block font-bold text-xs mb-0.5">
                Father Occupation
              </label>
              <input
                type="text"
                id="email"
                maxLength={100}
                disabled
                value={formData.father_occupation}
                className=" block w-full  rounded-md py-1 px-3 bg-gray-300 "
              />
            </div>
            <div className="mt-2">
              <label htmlFor="email" className="block font-bold text-xs mb-0.5">
                Mother Name
              </label>
              <input
                type="text"
                id="email"
                disabled
                maxLength={100}
                value={formData.mother_name}
                className=" block w-full  rounded-md py-1 px-3 bg-gray-300 "
              />
            </div>
            <div>
              <label htmlFor="phone" className="block font-bold text-xs mb-0.5">
                Mobile Number
              </label>
              <div className="flex">
                <span className="w-[15%] h-[34px] text-[14px] text-[#555] text-center border border-[#ccc] border-r-0 flex items-center justify-center p-1">
                  +91
                </span>
                <input
                  type="tel"
                  id="phone"
                  disabled
                  pattern="\d{10}"
                  maxLength="10"
                  value={formData.m_mobile}
                  className=" block w-full  outline-none rounded-r-md py-1 px-3 bg-gray-300 "
                  required
                />
              </div>
            </div>
            <div className="mt-2">
              <label htmlFor="email" className="block font-bold text-xs mb-0.5">
                Email Id
              </label>
              <input
                type="text"
                disabled
                value={formData.m_emailid}
                className=" block w-full  rounded-md py-1 px-3 bg-gray-300 "
              />
            </div>
            <div className="mt-2">
              <label htmlFor="email" className="block font-bold text-xs mb-0.5">
                Mother Occupation
              </label>
              <input
                type="text"
                id="email"
                maxLength={100}
                disabled
                value={formData.mother_occupation}
                className=" block w-full  rounded-md py-1 px-3 bg-gray-300 "
              />
            </div>
            <div className="mt-2">
              <label htmlFor="email" className="block font-bold text-xs mb-0.5">
                Father Aadhaar Card No.
              </label>
              <input
                type="text"
                id="email"
                maxLength={100}
                disabled
                value={formData.f_aadhar_no}
                className=" block w-full  rounded-md py-1 px-3 bg-gray-300 "
              />
            </div>{" "}
            <div className="mt-2">
              <label htmlFor="email" className="block font-bold text-xs mb-0.5">
                Mother aadhaar Card No.
              </label>
              <input
                type="text"
                id="email"
                maxLength={100}
                disabled
                value={formData.m_aadhar_no}
                className=" block w-full  rounded-md py-1 px-3 bg-gray-300 "
              />
            </div>{" "}
            <div className="mt-2">
              <label htmlFor="email" className="block font-bold text-xs mb-0.5">
                Father Qulification
              </label>
              <input
                type="text"
                id="email"
                maxLength={100}
                disabled
                value={formData.f_qualification}
                className=" block w-full  rounded-md py-1 px-3 bg-gray-300 "
              />
            </div>{" "}
            <div className="mt-2">
              <label htmlFor="email" className="block font-bold text-xs mb-0.5">
                Mother Qualification
              </label>
              <input
                type="text"
                id="email"
                maxLength={100}
                disabled
                value={formData.m_qualification}
                className=" block w-full  rounded-md py-1 px-3 bg-gray-300 "
              />
            </div>
            <div className="mt-2">
              <label htmlFor="email" className="block font-bold text-xs mb-0.5">
                Areas in which parent can contribute
              </label>
              <input
                type="text"
                id="email"
                maxLength={100}
                disabled
                value={formData.area_in_which_parent_can_contribute}
                className=" block w-full  rounded-md py-1 px-3 bg-gray-300 "
              />
            </div>
            <div className="mt-2">
              <label htmlFor="email" className="block font-bold text-xs mb-0.5">
                Others
              </label>
              <input
                type="text"
                id="email"
                maxLength={100}
                disabled
                value={formData.other_area}
                className=" block w-full  rounded-md py-1 px-3 bg-gray-300 "
              />
            </div>
            <div className="w-full col-span-4 relative top-4">
              <div className="w-full mx-auto">
                <h3 className="text-blue-500 w-full mx-auto text-center  md:text-[1.2em] text-nowrap font-bold">
                  {" "}
                  <FaFolderOpen className="text-[1.2em] text-blue-500 inline" />{" "}
                  View Documents :{" "}
                </h3>
              </div>
            </div>
            <div className="w-full col-span-4 mt-6">
              {allFiles.length > 0 && (
                <div className="border rounded-lg shadow-sm p-4 bg-white">
                  <div className="space-y-2">
                    {allFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between border rounded-md px-3 py-2 hover:bg-gray-50"
                      >
                        {/* Left section */}
                        <div className="flex items-center gap-3 min-w-0">
                          <FaFilePdf className="text-red-500 text-lg flex-shrink-0" />

                          <div className="flex flex-col min-w-0">
                            {/* Document type name */}
                            <span className="text-xs text-gray-500 font-semibold">
                              {DOC_TYPE_LABELS[file.doc_type] || file.doc_type}
                            </span>

                            {/* File name */}
                            <span className="text-sm font-medium text-gray-800 truncate">
                              {file.file_name}
                            </span>
                          </div>
                        </div>

                        {/* Right actions */}
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            className="text-blue-600 hover:text-blue-800"
                            title="View"
                            onClick={() => openPreview(file)}
                          >
                            <FaEye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            className="text-green-600 hover:text-green-800"
                            title="Download"
                            onClick={() =>
                              downloadFile(file.file_url, file.file_name)
                            }
                          >
                            <FaDownload className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="col-span-3 md:mr-9 my-2 text-right">
            <button
              // onClick={() => {
              //   navigate("/listOfAdmissionSuccessfulPayment", {
              //     state: {
              //       class_id: class_id,
              //     },
              //   });
              // }}
              onClick={() => {
                const stateData = { class_id };

                if (fromModule === "listOfStudentsForDocumentSubmission") {
                  navigate("/listOfStudentsForDocumentSubmission");
                } else if (
                  fromModule === "listOfStudentForSchedulingInterview"
                ) {
                  navigate("/listOfStudentForSchedulingInterview");
                } else if (fromModule === "listOfStudentForVerfication") {
                  navigate("/listOfStudentForVerfication");
                } else if (fromModule === "listOfStudentForApproval") {
                  navigate("/listOfStudentForApproval", { state: stateData });
                } else if (fromModule === "listofAdmissionSuccessfulPayment") {
                  navigate("/listofAdmissionSuccessfulPayment", {
                    state: stateData,
                  });
                } else {
                  navigate(-1);
                }
              }}
              className="text-white font-bold py-1 bg-yellow-500 hover:bg-yellow-600 border-1 border-yellow-500 px-4 rounded"
            >
              Back
            </button>
          </div>
        </form>
      </div>
      {isModalOpen && previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg w-[50%] max-w-4xl h-[80%] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-2 border-b">
              <h3 className="text-sm font-semibold truncate">
                {previewFile.file_name}
              </h3>
              <button
                onClick={closePreview}
                className="text-gray-600 hover:text-red-500"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
              {previewFile.is_image ? (
                <img
                  src={previewFile.file_url}
                  alt="Preview"
                  className="mx-auto max-h-full object-contain"
                />
              ) : (
                <iframe
                  src={previewFile.file_url}
                  title="Document Preview"
                  className="w-full h-full border"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewStudentAdmissionForm;
