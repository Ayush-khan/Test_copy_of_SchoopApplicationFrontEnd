import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
import Loader from "../common/LoaderFinal/LoaderStyle";
import Select from "react-select";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";

import ImageCropperSaving from "./ImageCropperSaving";

const UpdateTeacherIdCard = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [currentPage, setCurrentPage] = useState(0);

  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingForSearch, setLoadingForSearch] = useState(false);

  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [timetable, setTimetable] = useState([]);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const pageSize = 10;
  const [searchTerm, setSearchTerm] = useState("");
  const [formErrors, setFormErrors] = useState([]);
  const [teacherCategories, setTeacherCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState("");

  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");

  useEffect(() => {
    fetchTeacherCategories();
  }, []);

  const fetchTeacherCategories = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${API_URL}/api/get_teachercategory`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.success && Array.isArray(response.data.data)) {
        setTeacherCategories(response.data.data);
      } else {
        toast.error("Failed to load staff categories");
      }
    } catch (error) {
      console.error("Error fetching staff categories:", error);
      toast.error("Error fetching staff categories");
    }
  };

  const teacherCategoryOptions = useMemo(() => {
    return teacherCategories.map((cat) => ({
      value: cat.tc_id,
      label: cat.name,
    }));
  }, [teacherCategories]);

  useEffect(() => {
    fetchStaffList();
  }, []);

  const fetchStaffList = async () => {
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

      setStaffList(response.data);
      setPageCount(Math.ceil(response.data.length / pageSize));
    } catch (error) {
      toast.error("Failed to load staff list");
    } finally {
      setLoading(false);
    }
  };

  const staffOptions = useMemo(() => {
    return staffList.map((cat) => ({
      value: cat.teacher_id,
      label: cat.name,
    }));
  }, [staffList]);

  const handleSelectStaff = (selectedOption) => {
    setSelectedStaff(selectedOption); // for UI
    setSelectedStaffId(selectedOption?.value || ""); // only value for API
  };

  const handleSelectCategory = (selectedOption) => {
    setSelectedCategory(selectedOption); // for UI
    setSelectedCategoryId(selectedOption?.value || ""); // only value for API
  };

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async () => {
    try {
      setLoadingForSearch(true);
      setTimetable([]);
      setSearchTerm("");

      const token = localStorage.getItem("authToken");

      const params = {};

      if (selectedCategoryId) params.tc_id = selectedCategoryId;
      if (selectedStaffId) params.teacher_id = selectedStaffId;

      const response = await axios.get(
        `${API_URL}/api/get_teacheridcarddetails`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      let apiData = response?.data?.data || null;

      // Convert object → array
      const finalData = Array.isArray(apiData)
        ? apiData
        : apiData
        ? [apiData]
        : [];

      if (finalData.length === 0) {
        toast.error("No Staff ID card data found.");
      }

      setTimetable(finalData);
      setPageCount(Math.ceil(finalData.length / pageSize));
    } catch (error) {
      console.error("Error fetching Staff Id Card data:", error);
      toast.error("An error occurred while fetching Staff Id Card data.");
    } finally {
      setLoadingForSearch(false);
    }
  };

  // const handleStaffImageCropped = async (croppedImageData, index) => {
  //   const teacher_id = timetable[index]?.teacher_id;

  //   if (!teacher_id) {
  //     console.error("Teacher ID not found for this record");
  //     return;
  //   }

  //   //  Update frontend UI immediately
  //   setTimetable((prev) =>
  //     prev.map((teacher, i) =>
  //       i === index ? { ...teacher, base64: croppedImageData || "" } : teacher
  //     )
  //   );

  //   setFormErrors((prevErrors) =>
  //     prevErrors.filter((err) => err.field !== `teacher_image_name_${index}`)
  //   );

  //   // Call API to save cropped image
  //   try {
  //     const token = localStorage.getItem("authToken");

  //     const formData = new FormData();
  //     formData.append("teacher_id", teacher_id);
  //     formData.append("filename", `${teacher_id}.jpg`);
  //     formData.append("base64", croppedImageData);

  //     const response = await axios.post(
  //       `${API_URL}/api/update_teacher_profile_image`,
  //       formData,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           "Content-Type": "multipart/form-data",
  //         },
  //       }
  //     );

  //     if (response.data.success) {
  //       toast.success("Profile image updated successfully");
  //     } else {
  //       toast.error("Failed to update profile image");
  //     }
  //   } catch (error) {
  //     console.error("Error updating teacher image:", error);
  //     toast.error("Error updating teacher image");
  //   }
  // };

  const handleStaffImageCropped = async (croppedImageData, index) => {
    const teacher_id = timetable[index]?.teacher_id;

    if (!teacher_id) {
      console.error("Staff ID not found for this record");
      return;
    }

    // Extract ONLY base64 part (after comma)
    const pureBase64 = croppedImageData.split(",")[1];

    // Update UI Preview (keep full data URL for image preview)
    setTimetable((prev) =>
      prev.map((teacher, i) =>
        i === index ? { ...teacher, base64: croppedImageData } : teacher
      )
    );

    setFormErrors((prevErrors) =>
      prevErrors.filter((err) => err.field !== `teacher_image_name_${index}`)
    );

    try {
      const token = localStorage.getItem("authToken");

      const formData = new FormData();
      formData.append("teacher_id", teacher_id);
      formData.append("filename", `${teacher_id}.jpg`);
      formData.append("base64", pureBase64);

      const response = await axios.post(
        `${API_URL}/api/update_teacher_profile_image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("Profile image updated successfully");
      } else {
        toast.error("Failed to update profile image");
      }
    } catch (error) {
      console.error("Error updating Staff image:", error);
      toast.error("Error updating Staff image");
    }
  };

  console.log("row", timetable);

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const toCamelCase = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  useEffect(() => {
    const trimmedSearch = searchTerm.trim().toLowerCase();

    if (trimmedSearch !== "" && prevSearchTermRef.current === "") {
      previousPageRef.current = currentPage; // Save current page before search
      setCurrentPage(0); // Jump to first page when searching
    }

    if (trimmedSearch === "" && prevSearchTermRef.current !== "") {
      setCurrentPage(previousPageRef.current); // Restore saved page when clearing search
    }

    prevSearchTermRef.current = trimmedSearch;
  }, [searchTerm]);

  const filteredSections = Array.isArray(timetable)
    ? timetable.filter((section) => {
        const searchLower = searchTerm.toLowerCase();

        const studentRollNo =
          section?.employee_id?.toString().toLowerCase() || "";
        const studentName = `${section?.name}`.toLowerCase() || "";
        const studentDOB = section?.phone?.toLowerCase() || "";
        const studentBloodGroup = section?.blood_group?.toLowerCase() || "";
        const studentGrnNo = section?.sex?.toLowerCase() || "";
        const studentClass = `${section?.address}`.toLowerCase() || "";

        return (
          studentRollNo.includes(searchLower) ||
          studentName.includes(searchLower) ||
          studentDOB.includes(searchLower) ||
          studentBloodGroup.includes(searchLower) ||
          studentGrnNo.includes(searchLower) ||
          studentClass.includes(searchLower)
        );
      })
    : [];

  useEffect(() => {
    setPageCount(Math.ceil(filteredSections.length / pageSize));
  }, [filteredSections, pageSize]);

  const displayedSections = filteredSections.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  // const displayedSections = filteredSections.slice(currentPage * pageSize);
  return (
    <>
      <div className="w-full md:w-[80%] mx-auto p-4 ">
        <ToastContainer />
        <div className="card rounded-md ">
          <div className=" card-header mb-4 flex justify-between items-center ">
            <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
              Update Staff ID Card Data
            </h5>
            <RxCross1
              className=" relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
              onClick={() => {
                navigate("/dashboard");
              }}
            />
          </div>
          <div
            className=" relative w-full -top-6 h-1  mx-auto bg-red-700"
            style={{
              backgroundColor: "#C03078",
            }}
          ></div>

          <>
            <div className="w-full flex flex-col md:flex-row items-center gap-12 p-2 ml-4">
              {/* Teacher Category */}
              <div className="flex items-center w-full md:w-[35%] gap-2">
                <label className="w-[50%] text-md">Staff Category</label>
                <div className="w-[60%]">
                  <Select
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    value={selectedCategory}
                    onChange={handleSelectCategory}
                    options={teacherCategoryOptions}
                    isSearchable
                    isClearable
                    className="text-sm"
                  />
                </div>
              </div>

              {/* Teacher Name */}
              <div className="flex items-center w-full md:w-[35%] gap-2">
                <label className="w-[50%] text-md">Staff Name</label>
                <div className="w-[70%]">
                  <Select
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    value={selectedStaff}
                    onChange={handleSelectStaff}
                    options={staffOptions}
                    isSearchable
                    isClearable
                    className="text-sm"
                  />
                </div>
              </div>

              {/* Search Button */}
              <button
                type="search"
                onClick={handleSearch}
                style={{ backgroundColor: "#2196F3" }}
                className={`h-10 px-4 rounded text-white font-bold 
                   ${loadingForSearch ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={loadingForSearch}
              >
                {loadingForSearch ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin h-4 w-4 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      ></path>
                    </svg>
                    Loading...
                  </span>
                ) : (
                  "Search"
                )}
              </button>
            </div>

            {loadingForSearch ? (
              <>
                <div className="flex justify-center items-center h-64">
                  <Loader />
                </div>
              </>
            ) : (
              <>
                {timetable.length > 0 && (
                  <>
                    <div className="w-full">
                      <div className="card-body w-full">
                        <div className="">
                          {/* h-96 lg:h-96 overflow-y-scroll lg:overflow-x-hidden  */}
                          <table className="min-w-full leading-normal table-fixed">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="px-2 text-center py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider w-[50px]">
                                  Sr.No
                                </th>
                                <th className="px-2 text-center py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider w-[120px]">
                                  Employee Id
                                </th>
                                <th className="px-2 text-center py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider w-[250px]">
                                  Staff Name
                                </th>
                                <th className="px-2 text-center py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider w-[200px]">
                                  Profile Image
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {displayedSections.length ? (
                                displayedSections.map((subject, index) => (
                                  <tr
                                    key={subject.student_id}
                                    className="text-sm"
                                  >
                                    <td className="px-2 text-center py-2 border border-gray-950 w-[50px]">
                                      {currentPage * pageSize + index + 1}
                                    </td>
                                    <td className="px-2 text-center py-2 border border-gray-950 w-[150px]">
                                      {subject?.employee_id}
                                    </td>
                                    <td className="px-2 text-center py-2 border border-gray-950 w-[250px]">
                                      {toCamelCase(subject?.name)}
                                    </td>
                                    <td className="px-2 py-2 border border-gray-950 w-[80px]">
                                      <div className="rounded-full">
                                        <ImageCropperSaving
                                          photoPreview={
                                            subject?.teacher_image_url || // NEW — always show latest saved image
                                            subject?.teacer_image_name ||
                                            subject?.image_base
                                          }
                                          onImageCropped={(croppedImage) =>
                                            handleStaffImageCropped(
                                              croppedImage,
                                              index
                                            )
                                          }
                                        />{" "}
                                        {formErrors.some(
                                          (err) =>
                                            err.field ===
                                            `student_image_base_${index}`
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
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td
                                    colSpan="9"
                                    className="text-center py-10 text-red-700 text-xl"
                                  >
                                    Oops! No data found..
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                        <div className=" flex justify-center  pt-2 -mb-3  box-border  overflow-hidden">
                          <ReactPaginate
                            previousLabel={"Previous"}
                            nextLabel={"Next"}
                            breakLabel={"..."}
                            breakClassName={"page-item"}
                            breakLinkClassName={"page-link"}
                            pageCount={pageCount}
                            marginPagesDisplayed={1}
                            pageRangeDisplayed={1}
                            onPageChange={handlePageClick}
                            containerClassName={
                              "pagination justify-content-center"
                            }
                            pageClassName={"page-item"}
                            pageLinkClassName={"page-link"}
                            previousClassName={"page-item"}
                            previousLinkClassName={"page-link"}
                            nextClassName={"page-item"}
                            nextLinkClassName={"page-link"}
                            activeClassName={"active"}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </>
        </div>
      </div>
    </>
  );
};

export default UpdateTeacherIdCard;
