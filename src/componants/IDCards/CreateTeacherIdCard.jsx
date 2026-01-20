import { useState, useEffect, useRef } from "react";
import { RxCross1 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import ImageCropper from "../common/ImageUploadAndCrop.jsx";
import Loader from "../common/LoaderFinal/LoaderStyle.jsx";
import Select from "react-select";

function CreateTeacherIdCard() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});
  const [employeeIdBackendError, setEmployeeIdBackendError] = useState("");
  const [backendErrors, setBackendErrors] = useState({});

  const navigate = useNavigate();

  const [regId, setRegId] = useState("");
  const [roleId, setRoleId] = useState("");
  const [teacherData, setTeacherData] = useState(false);
  const [allTeachers, setAllTeachers] = useState(false);
  const [staffs, setStaffs] = useState([]);
  const activeTeacherIdRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    emergency_phone: "",
    sex: "",
    blood_group: "",
    employee_id: "",
    address: "", // current address
    permanent_address: "", // permanent address
    sameAsCurrent: false,
    confirm_status: false,
  });

  useEffect(() => {
    fetchDataRoleId();
  }, []);

  useEffect(() => {
    if (roleId === "A") {
      fetchStaffs();
    }
  }, [roleId]);

  const fetchDataRoleId = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.error("No authentication token found");
      return;
    }

    try {
      const sessionResponse = await axios.get(`${API_URL}/api/sessionData`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const reg_id = sessionResponse.data.user.reg_id;
      const role_id = sessionResponse.data.user.role_id;
      setRegId(reg_id);
      setRoleId(role_id);

      console.log("reg id", reg_id);
      console.log("role Id", role_id);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchStaffs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(`${API_URL}/api/staff_list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      setStaffs(response.data);
    } catch (error) {
      console.log("error");
    } finally {
      setLoading(false);
    }
  };

  const staffOptions = staffs.map((staff) => ({
    value: staff.teacher_id, // or staff.employee_id
    label: staff.name, // what user sees
  }));

  // useEffect(() => {
  //   if (regId) {
  //     fetchTeacherData();
  //   }
  // }, [regId]);

  useEffect(() => {
    if (roleId && roleId !== "A" && regId) {
      fetchTeacherData(); // non-admin only
    }
  }, [roleId, regId]);

  useEffect(() => {
    if (roleId === "A" && formData.teacher_id) {
      fetchAllStaffData(formData.teacher_id);
    }
  }, [formData.teacher_id, roleId]);

  useEffect(() => {
    activeTeacherIdRef.current = formData.teacher_id || null;
  }, [formData.teacher_id]);

  const fetchTeacherData = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.error("No authentication token found");
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/api/teachersdata/${regId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const teacher_details = response.data.teacher;

      if (!teacher_details) {
        console.error("No teacher found for regId:", regId);
        return;
      }

      setTeacherData(teacher_details);
      console.log("Teacher details", teacher_details);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // const fetchAllStaffData = async (teacherId) => {
  //   const token = localStorage.getItem("authToken");
  //   if (!token || !teacherId) return;

  //   try {
  //     const response = await axios.get(`${API_URL}/api/teachers/${teacherId}`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });

  //     const teacher = response.data.teacher;
  //     if (!teacher) return;

  //     setTeacherData(teacher);
  //   } catch (error) {
  //     console.error("Error fetching staff:", error);
  //   }
  // };

  const fetchAllStaffData = async (teacherId) => {
    const token = localStorage.getItem("authToken");
    if (!token || !teacherId) return;

    try {
      const response = await axios.get(
        `${API_URL}/api/teachersdata/${teacherId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // ✅ Ignore stale response
      if (activeTeacherIdRef.current !== teacherId) return;

      setTeacherData(response.data.teacher);
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
  };

  useEffect(() => {
    if (!teacherData) return;

    const currentAddress =
      teacherData.address || teacherData.current_address || "";

    const permanentAddress =
      teacherData.permanent_address || teacherData.residence_address || "";

    const isSameAddress =
      currentAddress.trim() !== "" &&
      currentAddress.trim() === permanentAddress.trim();

    setFormData((prev) => ({
      ...prev,
      name: teacherData.name || "",
      phone: teacherData.phone || "",
      emergency_phone: teacherData.emergency_phone || "",
      sex: teacherData.sex || "",
      blood_group: teacherData.blood_group || "",
      employee_id: teacherData.employee_id || "",
      address: currentAddress,
      permanent_address: permanentAddress,
      sameAsCurrent: isSameAddress,
      confirm_status: teacherData.confirm === "Y",
    }));
  }, [teacherData]);

  const handleSameAsCurrent = (e) => {
    const checked = e.target.checked;

    setFormData((prev) => ({
      ...prev,
      sameAsCurrent: checked,
      permanent_address: checked ? prev.address : "",
    }));
  };

  const validatePhone = (phone) => {
    if (!phone) return "Phone number is required";
    if (!/^\d{10}$/.test(phone)) return "Phone number must be 10 digits";
    return null;
  };

  const validateAddress = (address) => {
    if (!address) return "Address is required";
    return null;
  };

  const validateBloodGroup = (bloodGroup) => {
    const validGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    if (!bloodGroup) return "Blood group is required";
    if (!validGroups.includes(bloodGroup.toUpperCase()))
      return "Invalid blood group";
    return null;
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name) newErrors.name = "Name is required";
    else if (!/^[^\d]/.test(formData.name))
      newErrors.name = "Name should not start with a number";

    if (!formData.sex) newErrors.sex = "Gender is required";

    newErrors.address = validateAddress(formData.address);
    newErrors.permanent_address = validateAddress(formData.permanent_address);

    newErrors.phone = validatePhone(formData.phone);
    newErrors.emergency_phone = validatePhone(formData.emergency_phone);

    newErrors.blood_group = validateBloodGroup(formData.blood_group);

    Object.keys(newErrors).forEach(
      (key) => newErrors[key] === null && delete newErrors[key],
    );
    setErrors(newErrors);
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "phone" || name === "emergency_phone") {
      newValue = newValue.replace(/[^\d]/g, "");
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));

    // Validate field on change
    let fieldError = null;
    if (name === "phone" || name === "emergency_phone")
      fieldError = validatePhone(newValue);
    else if (name === "address" || name === "permanent_address")
      fieldError = validateAddress(newValue);
    else if (name === "blood_group") fieldError = validateBloodGroup(newValue);
    else if (name === "name")
      fieldError = /^[^\d].*/.test(newValue)
        ? null
        : "Name should not start with a number";

    setErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  // const handleSubmit = async (event) => {
  //   event.preventDefault();

  //   // Confirm status mandatory check
  //   if (!formData.confirm_status) {
  //     toast.error(
  //       "Please select the below checkbox. confirm all details before saving.",
  //     );
  //     return;
  //   }

  //   const validationErrors = validate();

  //   if (Object.keys(validationErrors).length > 0) {
  //     Object.values(validationErrors).forEach((error) => toast.error(error));
  //     return;
  //   }

  //   const formattedFormData = {
  //     ...formData,
  //     confirm_status: formData.confirm_status ? "Y" : "N",
  //   };

  //   try {
  //     setLoading(true);
  //     const token = localStorage.getItem("authToken");
  //     if (!token) throw new Error("No authentication token found");

  //     const response = await axios.put(
  //       `${API_URL}/api/update_teacherdetails/${regId}`,
  //       formattedFormData,
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       },
  //     );

  //     if (response.data.status === 400 && response.data.success === false) {
  //       toast.error(
  //         "Userid is created using staff name, please use a different name",
  //       );
  //       return;
  //     }

  //     if (response.status === 200) {
  //       toast.success(
  //         response.data.message || "Id Card details updated successfully!",
  //       );
  //     }
  //   } catch (error) {
  //     if (error.response?.data) {
  //       const { errors, message } = error.response.data;
  //       if (errors) {
  //         setBackendErrors(errors);
  //         Object.entries(errors).forEach(([field, messages]) =>
  //           messages.forEach((msg) => toast.error(`${field}: ${msg}`)),
  //         );
  //       } else if (message) {
  //         toast.error(message);
  //       }
  //     } else {
  //       toast.error(error.message);
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.confirm_status) {
      toast.error(
        "Please select the below checkbox. confirm all details before saving.",
      );
      return;
    }

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      Object.values(validationErrors).forEach((error) => toast.error(error));
      return;
    }

    const formattedFormData = {
      ...formData,
      confirm_status: formData.confirm_status ? "Y" : "N",
    };

    // ✅ CRITICAL FIX
    const updateTeacherId = roleId === "A" ? formData.teacher_id : regId;

    if (!updateTeacherId) {
      toast.error("Please select a staff first");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      const response = await axios.put(
        `${API_URL}/api/update_teacherdetails/${updateTeacherId}`,
        formattedFormData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.status === 200) {
        toast.success(
          response.data.message || "Id Card details updated successfully!",
        );

        // ✅ Refresh correct data
        if (roleId === "A") {
          fetchAllStaffData(updateTeacherId);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const toCamelCase = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <div className="container mx-auto p-4 ">
      <ToastContainer />
      <div className="card pb-2  rounded-md ">
        {" "}
        {/* p-2 */}
        <div className=" card-header mb-4 flex justify-between items-center ">
          <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
            Staff Id Card Details
          </h5>

          <RxCross1
            className="float-end relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
            onClick={() => {
              setErrors({});
              navigate("/dashboard");
            }}
          />
        </div>
        <div
          className=" relative w-full   -top-6 h-1  mx-auto bg-red-700"
          style={{
            backgroundColor: "#C03078",
          }}
        ></div>
        {/* <p className="  md:absolute md:right-7  md:top-[18%]   text-gray-500 ">
          <span className="text-red-500">*</span>indicates mandatory information
        </p> */}
        <form
          onSubmit={handleSubmit}
          className="  md:mx-5 overflow-x-hidden shadow-md p-2 bg-gray-50"
        >
          {" "}
          {loading ? (
            <div className=" inset-0  h-52 flex items-center justify-center bg-gray-50  z-10">
              <Loader />
            </div>
          ) : (
            // <div className=" flex flex-col gap-4 md:grid  md:grid-cols-3 md:gap-x-14 md:mx-10 gap-y-1">
            //   <div>
            //     <label htmlFor="name" className="block font-bold  text-xs mb-2">
            //       Name <span className="text-red-500">*</span>
            //     </label>
            //     <input
            //       type="text"
            //       maxLength={100}
            //       id="name"
            //       name="name"
            //       pattern="^[^\d].*"
            //       title="Name should not start with a number"
            //       required
            //       readOnly
            //       value={toCamelCase(formData.name)}
            //       onChange={handleChange}
            //       placeholder="Name"
            //       className="block  border w-full border-gray-300 bg-gray-100 rounded-md py-1 px-3   shadow-inner"
            //     />
            //   </div>

            //   <div>
            //     <label
            //       htmlFor="phone"
            //       className="block font-bold  text-xs mb-2"
            //     >
            //       Contact no. <span className="text-red-500">*</span>
            //     </label>
            //     <div className="flex ">
            //       <span className=" rounded-l-md pt-1 bg-gray-200 text-black font-bold px-2 pointer-events-none ml-1">
            //         +91
            //       </span>
            //       <input
            //         type="text"
            //         id="phone"
            //         name="phone"
            //         pattern="\d{10}"
            //         maxLength="10"
            //         title="Please enter only 10 digit number "
            //         value={formData.phone}
            //         onChange={handleChange}
            //         className="input-field block w-full border border-gray-300 outline-none  rounded-r-md py-1 px-3 bg-white shadow-inner "
            //         required
            //       />
            //     </div>
            //     {backendErrors.phone && (
            //       <span className="error">{backendErrors.phone[0]}</span>
            //     )}
            //     {errors.phone && (
            //       <span className="text-red-500 text-xs">{errors.phone}</span>
            //     )}
            //   </div>

            //   <div>
            //     <label
            //       htmlFor="emergency_phone"
            //       className="block font-bold  text-xs mb-2"
            //     >
            //       Emergency contact no. <span className="text-red-500">*</span>
            //     </label>
            //     <div className="flex ">
            //       <span className=" rounded-l-md pt-1 bg-gray-200 text-black font-bold px-2 pointer-events-none ml-1">
            //         +91
            //       </span>
            //       <input
            //         type="text"
            //         id="emergency_phone"
            //         name="emergency_phone"
            //         pattern="\d{10}"
            //         maxLength="10"
            //         title="Please enter only 10 digit number "
            //         value={formData.emergency_phone}
            //         onChange={handleChange}
            //         className="input-field block w-full border border-gray-300 outline-none  rounded-r-md py-1 px-3 bg-white shadow-inner "
            //         required
            //       />
            //     </div>
            //     {backendErrors.emergency_phone && (
            //       <span className="error">
            //         {backendErrors.emergency_phone[0]}
            //       </span>
            //     )}
            //     {errors.emergency_phone && (
            //       <span className="text-red-500 text-xs">
            //         {errors.emergency_phone}
            //       </span>
            //     )}
            //   </div>

            //   <div>
            //     <label htmlFor="sex" className="block font-bold  text-xs mb-2">
            //       Gender <span className="text-red-500">*</span>
            //     </label>
            //     <input
            //       id="sex"
            //       name="sex"
            //       value={toCamelCase(formData.sex)}
            //       onChange={handleChange}
            //       readOnly
            //       className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-gray-100 shadow-inner"
            //       required
            //     />
            //     {errors.sex && (
            //       <span className="text-red-500 text-xs">{errors.sex}</span>
            //     )}
            //   </div>

            //   <div>
            //     <label
            //       htmlFor="blood_group"
            //       className="block font-bold  text-xs mb-2"
            //     >
            //       Blood Group <spna className="text-red-500">*</spna>
            //     </label>
            //     <select
            //       id="blood_group"
            //       name="blood_group"
            //       value={formData.blood_group}
            //       onChange={handleChange}
            //       className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
            //     >
            //       <option className="bg-gray-300" value="">
            //         Select
            //       </option>
            //       <option value="A+">A+</option>
            //       <option value="A-">A-</option>
            //       <option value="B+">B+</option>
            //       <option value="B-">B-</option>
            //       <option value="O+">O+</option>
            //       <option value="O-">O-</option>
            //       <option value="AB+">AB+</option>
            //       <option value="AB-">AB-</option>
            //     </select>
            //   </div>

            //   <div>
            //     <label
            //       htmlFor="employee_id"
            //       className="block font-bold  text-xs mb-2"
            //     >
            //       Employee ID <span className="text-red-500">*</span>
            //     </label>
            //     <input
            //       type="tel"
            //       maxLength={5}
            //       id="employee_id"
            //       name="employee_id"
            //       value={formData.employee_id}
            //       onChange={handleChange}
            //       readOnly
            //       className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-gray-100 shadow-inner"
            //       required
            //     />
            //     {errors.employee_id && (
            //       <span className="text-red-500 text-xs">
            //         {errors.employee_id}
            //       </span>
            //     )}
            //     <span className="text-red-500 text-xs">
            //       {employeeIdBackendError}
            //     </span>
            //   </div>

            //   <div>
            //     <label
            //       htmlFor="address"
            //       className="block font-bold text-xs mb-2"
            //     >
            //       Current Address <span className="text-red-500">*</span>
            //     </label>

            //     <textarea
            //       maxLength={200}
            //       id="address"
            //       name="address"
            //       value={formData.address}
            //       onChange={handleChange}
            //       className="input-field resize block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
            //       rows="3"
            //       required
            //     />

            //     {errors.address && (
            //       <span className="text-red-500 text-xs">{errors.address}</span>
            //     )}
            //   </div>

            //   <div>
            //     <label
            //       htmlFor="permanent_address"
            //       className="block font-bold text-xs mb-2"
            //     >
            //       Permanent Address <span className="text-red-500">*</span>
            //     </label>

            //     <textarea
            //       maxLength={200}
            //       id="permanent_address"
            //       name="permanent_address"
            //       value={formData.permanent_address}
            //       onChange={handleChange}
            //       className="input-field resize block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
            //       rows="3"
            //       required
            //       // disabled={formData.sameAsCurrent}
            //     />
            //     {/* Checkbox */}
            //     <div className="flex items-center gap-2 mb-2">
            //       <input
            //         type="checkbox"
            //         id="sameAsCurrent"
            //         checked={formData.sameAsCurrent}
            //         onChange={handleSameAsCurrent}
            //       />
            //       <label htmlFor="sameAsCurrent" className="text-xs">
            //         Same as Current Address
            //       </label>
            //     </div>
            //     {errors.permanent_address && (
            //       <span className="text-red-500 text-xs">
            //         {errors.permanent_address}
            //       </span>
            //     )}
            //   </div>

            //   <div className="md:col-span-3 flex items-center justify-between">
            //     <div className="flex items-center gap-2">
            //       <input
            //         type="checkbox"
            //         id="confim_status"
            //         checked={formData.confirm_status}
            //         onChange={(e) =>
            //           setFormData({
            //             ...formData,
            //             confirm_status: e.target.checked,
            //           })
            //         }
            //       />
            //       <label htmlFor="declaration" className="text-xs">
            //         I hereby declare that the information provided is true and
            //         correct.
            //       </label>
            //     </div>

            //     <button
            //       type="submit"
            //       style={{ backgroundColor: "#2196F3" }}
            //       className="text-white font-bold py-1 px-4 rounded border border-blue-500"
            //     >
            //       Save
            //     </button>
            //   </div>
            // </div>
            <>
              {roleId === "A" ? (
                <>
                  <div className=" flex flex-col gap-4 md:grid  md:grid-cols-3 md:gap-x-14 md:mx-10 gap-y-1">
                    <div>
                      <label
                        htmlFor="name"
                        className="block font-bold  text-xs mb-2"
                      >
                        Staff Name <span className="text-red-500">*</span>
                      </label>
                      {/* <Select
                        options={staffOptions}
                        placeholder="Select Staff"
                        value={
                          staffOptions.find(
                            (opt) => opt.value === formData.teacher_id,
                          ) || null
                        }
                        isClearable
                        onChange={(selected) => {
                          // ✅ when cleared
                          if (!selected) {
                            setFormData((prev) => ({
                              ...prev,
                              teacher_id: "",
                              name: "",
                            }));
                            setTeacherData(null); // optional: clear form fields
                            return;
                          }

                          // ✅ when selected
                          setFormData((prev) => ({
                            ...prev,
                            teacher_id: selected.value,
                            name: selected.label,
                          }));

                          fetchAllStaffData(selected.value);
                        }}
                      /> */}
                      <Select
                        options={staffOptions}
                        placeholder="Select Staff"
                        value={
                          staffOptions.find(
                            (opt) => opt.value === formData.teacher_id,
                          ) || null
                        }
                        // isClearable
                        onChange={(selected) => {
                          // if (!selected) {
                          //   // Clear selection only
                          //   setFormData((prev) => ({
                          //     ...prev,
                          //     teacher_id: "",
                          //     name: "",
                          //   }));
                          //   setTeacherData(null);
                          //   return;
                          // }

                          if (!selected) {
                            setFormData((prev) => ({
                              ...prev,
                              teacher_id: "",
                              name: "",
                            }));
                            setTeacherData(null);
                            return;
                          }

                          setFormData((prev) => ({
                            ...prev,
                            teacher_id: selected.value,
                            name: selected.label,
                          }));
                        }}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="block font-bold  text-xs mb-2"
                      >
                        Contact no. <span className="text-red-500">*</span>
                      </label>
                      <div className="flex ">
                        <span className=" rounded-l-md pt-1 bg-gray-200 text-black font-bold px-2 pointer-events-none ml-1">
                          +91
                        </span>
                        <input
                          type="text"
                          id="phone"
                          name="phone"
                          pattern="\d{10}"
                          maxLength="10"
                          title="Please enter only 10 digit number "
                          value={formData.phone}
                          onChange={handleChange}
                          className="input-field block w-full border border-gray-300 outline-none  rounded-r-md py-1 px-3 bg-white shadow-inner "
                          required
                        />
                      </div>
                      {backendErrors.phone && (
                        <span className="error">{backendErrors.phone[0]}</span>
                      )}
                      {errors.phone && (
                        <span className="text-red-500 text-xs">
                          {errors.phone}
                        </span>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="emergency_phone"
                        className="block font-bold  text-xs mb-2"
                      >
                        Emergency contact no.{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="flex ">
                        <span className=" rounded-l-md pt-1 bg-gray-200 text-black font-bold px-2 pointer-events-none ml-1">
                          +91
                        </span>
                        <input
                          type="text"
                          id="emergency_phone"
                          name="emergency_phone"
                          pattern="\d{10}"
                          maxLength="10"
                          title="Please enter only 10 digit number "
                          value={formData.emergency_phone}
                          onChange={handleChange}
                          className="input-field block w-full border border-gray-300 outline-none  rounded-r-md py-1 px-3 bg-white shadow-inner "
                          required
                        />
                      </div>
                      {backendErrors.emergency_phone && (
                        <span className="error">
                          {backendErrors.emergency_phone[0]}
                        </span>
                      )}
                      {errors.emergency_phone && (
                        <span className="text-red-500 text-xs">
                          {errors.emergency_phone}
                        </span>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="sex"
                        className="block font-bold  text-xs mb-2"
                      >
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="sex"
                        name="sex"
                        value={toCamelCase(formData.sex)}
                        onChange={handleChange}
                        readOnly
                        className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-gray-100 shadow-inner"
                        required
                      />
                      {errors.sex && (
                        <span className="text-red-500 text-xs">
                          {errors.sex}
                        </span>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="blood_group"
                        className="block font-bold  text-xs mb-2"
                      >
                        Blood Group <spna className="text-red-500">*</spna>
                      </label>
                      <select
                        id="blood_group"
                        name="blood_group"
                        value={formData.blood_group}
                        onChange={handleChange}
                        className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                      >
                        <option className="bg-gray-300" value="">
                          Select
                        </option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="employee_id"
                        className="block font-bold  text-xs mb-2"
                      >
                        Employee ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        maxLength={5}
                        id="employee_id"
                        name="employee_id"
                        value={formData.employee_id}
                        onChange={handleChange}
                        readOnly
                        className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-gray-100 shadow-inner"
                        required
                      />
                      {errors.employee_id && (
                        <span className="text-red-500 text-xs">
                          {errors.employee_id}
                        </span>
                      )}
                      <span className="text-red-500 text-xs">
                        {employeeIdBackendError}
                      </span>
                    </div>

                    <div>
                      <label
                        htmlFor="address"
                        className="block font-bold text-xs mb-2"
                      >
                        Current Address <span className="text-red-500">*</span>
                      </label>

                      <textarea
                        maxLength={200}
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="input-field resize block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                        rows="3"
                        required
                      />

                      {errors.address && (
                        <span className="text-red-500 text-xs">
                          {errors.address}
                        </span>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="permanent_address"
                        className="block font-bold text-xs mb-2"
                      >
                        Permanent Address{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <textarea
                        maxLength={200}
                        id="permanent_address"
                        name="permanent_address"
                        value={formData.permanent_address}
                        onChange={handleChange}
                        className="input-field resize block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                        rows="3"
                        required
                      // disabled={formData.sameAsCurrent}
                      />
                      {/* Checkbox */}
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          id="sameAsCurrent"
                          checked={formData.sameAsCurrent}
                          onChange={handleSameAsCurrent}
                        />
                        <label htmlFor="sameAsCurrent" className="text-xs">
                          Same as Current Address
                        </label>
                      </div>
                      {errors.permanent_address && (
                        <span className="text-red-500 text-xs">
                          {errors.permanent_address}
                        </span>
                      )}
                    </div>

                    <div className="md:col-span-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="confim_status"
                          checked={formData.confirm_status}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              confirm_status: e.target.checked,
                            })
                          }
                        />
                        <label htmlFor="declaration" className="text-xs">
                          I hereby declare that the information provided is true
                          and correct.
                        </label>
                      </div>

                      <button
                        type="submit"
                        style={{ backgroundColor: "#2196F3" }}
                        className="text-white font-bold py-1 px-4 rounded border border-blue-500"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className=" flex flex-col gap-4 md:grid  md:grid-cols-3 md:gap-x-14 md:mx-10 gap-y-1">
                    <div>
                      <label
                        htmlFor="name"
                        className="block font-bold  text-xs mb-2"
                      >
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={100}
                        id="name"
                        name="name"
                        pattern="^[^\d].*"
                        title="Name should not start with a number"
                        required
                        readOnly
                        value={toCamelCase(formData.name)}
                        onChange={handleChange}
                        placeholder="Name"
                        className="block  border w-full border-gray-300 bg-gray-100 rounded-md py-1 px-3   shadow-inner"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="block font-bold  text-xs mb-2"
                      >
                        Contact no. <span className="text-red-500">*</span>
                      </label>
                      <div className="flex ">
                        <span className=" rounded-l-md pt-1 bg-gray-200 text-black font-bold px-2 pointer-events-none ml-1">
                          +91
                        </span>
                        <input
                          type="text"
                          id="phone"
                          name="phone"
                          pattern="\d{10}"
                          maxLength="10"
                          title="Please enter only 10 digit number "
                          value={formData.phone}
                          onChange={handleChange}
                          className="input-field block w-full border border-gray-300 outline-none  rounded-r-md py-1 px-3 bg-white shadow-inner "
                          required
                        />
                      </div>
                      {backendErrors.phone && (
                        <span className="error">{backendErrors.phone[0]}</span>
                      )}
                      {errors.phone && (
                        <span className="text-red-500 text-xs">
                          {errors.phone}
                        </span>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="emergency_phone"
                        className="block font-bold  text-xs mb-2"
                      >
                        Emergency contact no.{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="flex ">
                        <span className=" rounded-l-md pt-1 bg-gray-200 text-black font-bold px-2 pointer-events-none ml-1">
                          +91
                        </span>
                        <input
                          type="text"
                          id="emergency_phone"
                          name="emergency_phone"
                          pattern="\d{10}"
                          maxLength="10"
                          title="Please enter only 10 digit number "
                          value={formData.emergency_phone}
                          onChange={handleChange}
                          className="input-field block w-full border border-gray-300 outline-none  rounded-r-md py-1 px-3 bg-white shadow-inner "
                          required
                        />
                      </div>
                      {backendErrors.emergency_phone && (
                        <span className="error">
                          {backendErrors.emergency_phone[0]}
                        </span>
                      )}
                      {errors.emergency_phone && (
                        <span className="text-red-500 text-xs">
                          {errors.emergency_phone}
                        </span>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="sex"
                        className="block font-bold  text-xs mb-2"
                      >
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="sex"
                        name="sex"
                        value={toCamelCase(formData.sex)}
                        onChange={handleChange}
                        readOnly
                        className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-gray-100 shadow-inner"
                        required
                      />
                      {errors.sex && (
                        <span className="text-red-500 text-xs">
                          {errors.sex}
                        </span>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="blood_group"
                        className="block font-bold  text-xs mb-2"
                      >
                        Blood Group <spna className="text-red-500">*</spna>
                      </label>
                      <select
                        id="blood_group"
                        name="blood_group"
                        value={formData.blood_group}
                        onChange={handleChange}
                        className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                      >
                        <option className="bg-gray-300" value="">
                          Select
                        </option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="employee_id"
                        className="block font-bold  text-xs mb-2"
                      >
                        Employee ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        maxLength={5}
                        id="employee_id"
                        name="employee_id"
                        value={formData.employee_id}
                        onChange={handleChange}
                        readOnly
                        className="input-field block w-full border border-gray-300 rounded-md py-1 px-3 bg-gray-100 shadow-inner"
                        required
                      />
                      {errors.employee_id && (
                        <span className="text-red-500 text-xs">
                          {errors.employee_id}
                        </span>
                      )}
                      <span className="text-red-500 text-xs">
                        {employeeIdBackendError}
                      </span>
                    </div>

                    <div>
                      <label
                        htmlFor="address"
                        className="block font-bold text-xs mb-2"
                      >
                        Current Address <span className="text-red-500">*</span>
                      </label>

                      <textarea
                        maxLength={200}
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="input-field resize block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                        rows="3"
                        required
                      />

                      {errors.address && (
                        <span className="text-red-500 text-xs">
                          {errors.address}
                        </span>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="permanent_address"
                        className="block font-bold text-xs mb-2"
                      >
                        Permanent Address{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <textarea
                        maxLength={200}
                        id="permanent_address"
                        name="permanent_address"
                        value={formData.permanent_address}
                        onChange={handleChange}
                        className="input-field resize block w-full border border-gray-300 rounded-md py-1 px-3 bg-white shadow-inner"
                        rows="3"
                        required
                      // disabled={formData.sameAsCurrent}
                      />
                      {/* Checkbox */}
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          id="sameAsCurrent"
                          checked={formData.sameAsCurrent}
                          onChange={handleSameAsCurrent}
                        />
                        <label htmlFor="sameAsCurrent" className="text-xs">
                          Same as Current Address
                        </label>
                      </div>
                      {errors.permanent_address && (
                        <span className="text-red-500 text-xs">
                          {errors.permanent_address}
                        </span>
                      )}
                    </div>

                    <div className="md:col-span-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="confim_status"
                          checked={formData.confirm_status}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              confirm_status: e.target.checked,
                            })
                          }
                        />
                        <label htmlFor="declaration" className="text-xs">
                          I hereby declare that the information provided is true
                          and correct.
                        </label>
                      </div>

                      <button
                        type="submit"
                        style={{ backgroundColor: "#2196F3" }}
                        className="text-white font-bold py-1 px-4 rounded border border-blue-500"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </form>
      </div>
    </div>
  );
}

export default CreateTeacherIdCard;
