import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
// import ImageCropperRC from "../../componants/Domain/ImageCropperRC";
import ImageCropperRC from "../ImageCropperRC";

const PhotoUploadForReportCard = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingForSearch, setLoadingForSearch] = useState(false);

  const navigate = useNavigate();
  const [loadingExams, setLoadingExams] = useState(false);
  const [studentError, setStudentError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsOptions, setTermsOptions] = useState([]);
  const [loadingTermsData, setLoadingTermsData] = useState(false);

  const [timetable, setTimetable] = useState([]);

  const pageSize = 10;
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const [roleId, setRoleId] = useState("");
  const [regId, setRegId] = useState("");

  const [domain, setDomain] = useState([]);

  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const [showStudentReport, setShowStudentReport] = useState(false);

  const [uploadedImages, setUploadedImages] = useState({});

  useEffect(() => {
    fetchDataRoleId();
    fetchtermsByClassId();
  }, []);

  useEffect(() => {
    if (!roleId || !regId) return; // guard against empty
    fetchClasses(roleId, regId);
  }, [roleId, regId]);

  useEffect(() => {
    if (selectedStudentId) {
      console.log("Triggering fetchDomain with class_id:", selectedStudentId);
      fetchDomain(selectedStudentId);
    }
  }, [selectedStudentId]);

  const fetchClasses = async (roleId, regId) => {
    const token = localStorage.getItem("authToken");
    setLoadingExams(true);

    try {
      if (roleId === "T") {
        const response = await axios.get(
          `${API_URL}/api/get_teacherclasseswithclassteacher?teacher_id=${regId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const mappedData = (response.data.data || [])
          .filter((item) => item.is_class_teacher === 1)
          .map((cls) => ({
            value: cls.class_id,
            class_id: cls.class_id,
            section_id: cls.section_id,
            classname: cls.classname,
            sectionname: cls.sectionname,
            label: `${cls.classname} ${cls.sectionname}`,
          }));

        setStudentNameWithClassId(mappedData || []);

        setStudentNameWithClassId(mappedData || []);
      } else {
        const response = await axios.get(`${API_URL}/api/g`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setStudentNameWithClassId(response?.data || []);
      }
    } catch (error) {
      toast.error("Error fetching Classes");
      console.error("Error fetching Classes:", error);
    } finally {
      setLoadingExams(false);
    }
  };

  const fetchtermsByClassId = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.get(`${API_URL}/api/get_Term`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const mappedExams =
        response?.data?.map((exam) => ({
          label: exam.name,
          value: exam?.term_id,
        })) || [];

      setTermsOptions(mappedExams);
    } catch (err) {
      console.error("Error fetching exams:", err);
    } finally {
      setLoadingTermsData(false);
    }
  };

  const studentOptions = useMemo(() => {
    if (!studentNameWithClassId) return [];

    return studentNameWithClassId.map((cls) => {
      if (roleId === "T") {
        return {
          value: cls.class_id, // ✅ class_id
          section_id: cls.section_id, // ✅ section_id
          classname: cls.classname,
          sectionname: cls.sectionname,
          label: `${cls.classname} ${cls.sectionname}`,
        };
      } else {
        return {
          value: cls.class_id,
          section_id: cls.section_id,
          classname: cls.get_class?.name,
          sectionname: cls.name,
          label: `${cls.get_class?.name} ${cls.name}`,
        };
      }
    });
  }, [studentNameWithClassId, roleId]);

  const handleStudentSelect = (selectedOption) => {
    setStudentError("");
    setSelectedStudent(selectedOption);

    setSelectedStudentId(selectedOption?.value); // class_id
    setSelectedSectionId(selectedOption?.section_id); // section_id

    console.log("Selected class_id:", selectedOption?.value);
    console.log("Selected section_id:", selectedOption?.section_id);
  };

  const fetchDomain = async (classId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      const response = await axios.get(
        `${API_URL}/api/get_domains/${classId}`, // ✅ pass class_id
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      console.log("Domain data:", response.data.data);

      setDomain(response.data.data);
      setPageCount(Math.ceil((response.data?.data?.length || 0) / pageSize));
    } catch (error) {
      console.log("fetchDomain error:", error.message);
    } finally {
      setLoading(false);
    }
  };

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

      const role_id = sessionResponse.data.user.role_id;
      const reg_id = sessionResponse.data.user.reg_id;

      setRoleId(role_id);
      setRegId(reg_id);

      console.log("roleIDis:", role_id); // use local variable
      console.log("reg id:", reg_id);

      return { roleId, regId };
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const toCamelCase = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const handleSearch = async () => {
    setLoadingForSearch(false);

    if (!selectedStudentId) {
      setStudentError("Please select Class.");
      setLoadingForSearch(false);
      return;
    }
    if (!selectedSectionId) {
      setStudentError("Section is missing.");
      setLoadingForSearch(false);
      return;
    }

    try {
      setLoadingForSearch(true);
      setTimetable([]);
      const token = localStorage.getItem("authToken");

      const params = {
        class_id: selectedStudentId,
        section_id: selectedSectionId,
      };

      const response = await axios.get(`${API_URL}/api/students_report_card`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      console.log("response", response);

      // ✅ API returns students inside response.data.data
      const students = response?.data?.data || [];

      if (students.length === 0) {
        console.log("No students found");
        setTimetable([]);
        setSelectedRecords([]); // clear previous selections
        toast.warning("No students found for this class/section.");
      } else {
        setTimetable(students);
        setPageCount(Math.ceil(students.length / pageSize));
        setShowStudentReport(true);
      }
    } catch (error) {
      console.error("Error fetching Students data:", error);
      toast.error("Error fetching Students data. Please try again.");
    } finally {
      setIsSubmitting(false);
      setLoadingForSearch(false);
    }
  };

  const handleFileChange = (e, studentId, type, parentId = null) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImages((prev) => ({
          ...prev,

          // student image + student_id
          ...(type === "student"
            ? {
                [`s_image_${studentId}`]: reader.result,
                student_id: studentId,
              }
            : {}),

          // family image + parent_id
          ...(type === "family" && parentId
            ? {
                [`f_image_${parentId}`]: reader.result,
                parent_id: parentId,
              }
            : {}),
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const token = localStorage.getItem("authToken");

      const payload = {
        class_id: selectedStudentId,
        section_id: selectedSectionId,
        ...uploadedImages, // add all s_image_ and f_image_ keys
      };

      console.log("Final Payload:", payload);

      const response = await axios.post(
        `${API_URL}/api/save_studentsreportcard`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response?.data?.status === 200) {
        toast.success("Photo uploaded for report card successfully!");
        window.scrollTo({ top: 0, behavior: "smooth" });
        setShowStudentReport(false);
      }
    } catch (error) {
      console.error("Error saving photo:", error);
      toast.error("Error saving data. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredSections = timetable.filter((section) => {
    const searchLower = searchTerm.toLowerCase();

    const regNo = section?.reg_no?.toLowerCase() || "";
    const admissionClass = section?.admission_class?.toLowerCase() || "";
    const studentName = `${section?.first_name || ""} ${
      section?.mid_name?.trim() || ""
    } ${section?.last_name || ""}`
      .toLowerCase()
      .trim();

    const name = section?.name?.toLowerCase().trim() || "";

    return (
      regNo.includes(searchLower) ||
      admissionClass.includes(searchLower) ||
      studentName.includes(searchLower) ||
      name.includes(searchLower)
    );
  });
  console.log("displayed section", filteredSections);

  const displayedSections = filteredSections.slice(currentPage * pageSize);
  console.log("displayed section", displayedSections);

  return (
    <>
      <div
        className={` transition-all duration-500 w-[80%]  mx-auto p-4 ${
          showStudentReport ? "w-full " : "w-[80%] "
        }`}
      >
        <ToastContainer />
        {/* <div className="card w-[80%] flex-center rounded-md "> */}
        <div className="w-full flex justify-center ">
          <div className="card w-[95%] rounded-md shadow-md bg-white">
            {!showStudentReport && (
              <>
                <div className=" card-header mb-4 flex justify-between items-center ">
                  <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
                    Upload Photo for Report Card
                  </h5>
                  <RxCross1
                    className="  relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                    onClick={() => {
                      navigate("/dashboard");
                    }}
                  />
                </div>
                <div
                  className=" relative w-[98%]   -top-6 h-1  mx-auto bg-red-700"
                  style={{
                    backgroundColor: "#C03078",
                  }}
                ></div>
              </>
            )}

            <>
              {!showStudentReport && (
                <div className=" w-full md:w-[100%] flex justify-center flex-col md:flex-row gap-x-1 ml-0 p-2">
                  <div className="w-full md:w-[99%] flex md:flex-row justify-between items-center mt-0 md:mt-4">
                    <div className="w-full md:w-[99%]  gap-x-0 md:gap-x-12 flex flex-col gap-y-2 md:gap-y-0 md:flex-row">
                      <div className="w-full md:w-[30%] gap-x-2   justify-around  my-1 md:my-4 flex md:flex-row ">
                        <label
                          className="md:w-[30%] text-md pl-0 md:pl-5 mt-1.5"
                          htmlFor="studentSelect"
                        >
                          Class <span className="text-sm text-red-500">*</span>
                        </label>
                        <div className=" w-full md:w-[65%]">
                          <Select
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            id="studentSelect"
                            value={selectedStudent}
                            onChange={handleStudentSelect}
                            options={studentOptions}
                            placeholder={loadingExams ? "Loading..." : "Select"}
                            isSearchable
                            isClearable
                            className="text-sm"
                            isDisabled={loadingExams}
                          />
                          {studentError && (
                            <div className="h-8 relative ml-1 text-danger text-xs">
                              {studentError}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-1">
                        <button
                          type="search"
                          onClick={handleSearch}
                          style={{ backgroundColor: "#2196F3" }}
                          className={`btn h-10 w-18 md:w-auto btn-primary text-white font-bold py-1 border-1 border-blue-500 px-4 rounded ${
                            loadingForSearch
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
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
                              Browsing...
                            </span>
                          ) : (
                            "Browse"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {showStudentReport && (
                <>
                  {/* {timetable.length > 0 && ( */}
                  <>
                    <div className="w-full">
                      <div className="card mx-auto lg:w-full shadow-lg">
                        <div className="p-2 px-3 bg-gray-100 border-none flex items-center justify-between">
                          <div className="w-full flex flex-row items-center justify-between ">
                            <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap mr-6">
                              Upload Photo For Report Card
                            </h3>
                            <div className="flex items-center w-full md:ml-24">
                              <div className="flex flex-row items-center w-[70%] bg-blue-50 border-l-2 border-r-2 border-pink-500 rounded-md shadow-md px-4 py-1 gap-4 overflow-x-auto">
                                <div className="flex flex-col md:flex-row items-center flex-grow gap-2">
                                  <label
                                    className="md:w-[30%] text-md font-medium"
                                    htmlFor="studentSelect"
                                  >
                                    Class
                                    <span className="text-sm text-red-500">
                                      *
                                    </span>
                                  </label>

                                  <div className="w-full md:w-3/4">
                                    <Select
                                      menuPortalTarget={document.body}
                                      menuPosition="fixed"
                                      id="studentSelect"
                                      value={selectedStudent}
                                      onChange={handleStudentSelect}
                                      options={studentOptions}
                                      placeholder={
                                        loadingExams ? "Loading..." : "Select"
                                      }
                                      isSearchable
                                      isClearable
                                      className="text-sm"
                                      isDisabled={loadingExams}
                                    />
                                    {studentError && (
                                      <div className="h-8 text-danger text-xs mt-1">
                                        {studentError}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Browse Button */}
                                <div className="flex-shrink-0 w-auto">
                                  <button
                                    type="button"
                                    onClick={handleSearch}
                                    style={{ backgroundColor: "#2196F3" }}
                                    className={`btn h-9 px-4 text-white font-bold rounded border border-blue-500 
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
                                        Browsing...
                                      </span>
                                    ) : (
                                      "Browse"
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex mb-1.5 flex-col md:flex-row gap-x-6 justify-center md:justify-end ">
                            <RxCross1
                              className="text-base text-red-600 cursor-pointer hover:bg-red-100 rounded"
                              onClick={() => setShowStudentReport(false)}
                            />
                          </div>
                        </div>

                        <div
                          className=" w-[97%] h-1 mx-auto"
                          style={{ backgroundColor: "#C03078" }}
                        ></div>
                        <div className="card-body w-full">
                          <div
                            className="h-96 lg:h-96 overflow-y-scroll"
                            //  overflow-x-scroll
                            style={{
                              scrollbarWidth: "thin", // Makes scrollbar thin in Firefox
                              scrollbarColor: "#C03178 transparent", // Sets track and thumb color in Firefox
                            }}
                          >
                            <table className="min-w-full leading-normal table-auto ">
                              <thead
                                className="sticky top-0  bg-gray-200"
                                style={{ zIndex: "1px" }}
                              >
                                <tr className="bg-gray-200">
                                  <th className="w-[7%] px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                    Sr No.
                                  </th>
                                  <th className="w-[7%] px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                    Roll No.
                                  </th>
                                  <th className="w-[20%] px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                    Student Name
                                  </th>
                                  <th className="w-[30%] px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                    Student Photo
                                  </th>
                                  <th className="w-[30%] px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                    Family Photo
                                  </th>
                                </tr>
                              </thead>

                              <tbody>
                                {loadingForSearch ? (
                                  <div className=" absolute left-[4%] w-[100%]  text-center flex justify-center items-center mt-14">
                                    <div className=" text-center text-xl text-blue-700">
                                      Please wait while data is loading...
                                    </div>
                                  </div>
                                ) : displayedSections.length ? (
                                  displayedSections.map((student, index) => (
                                    <tr
                                      key={student.student_id}
                                      className="border border-gray-300"
                                    >
                                      <td className="px-2 py-2 text-center border border-gray-300">
                                        {index + 1}
                                      </td>
                                      <td className="px-2 py-2 text-center border border-gray-300">
                                        {student.roll_no || ""}
                                      </td>
                                      <td className="px-2 py-2 text-center border border-gray-300">
                                        {toCamelCase(student.first_name || "")}{" "}
                                        {toCamelCase(student.mid_name || "")}{" "}
                                        {toCamelCase(student.last_name || "")}
                                      </td>
                                      {/* Student Image Upload */}
                                      <td className="px-2 py-2 text-center border border-gray-300">
                                        {student.image_url ? (
                                          <ImageCropperRC
                                            photoPreview={student.image_url}
                                            onImageCropped={(croppedImage) => {
                                              setUploadedImages((prev) => ({
                                                ...prev,
                                                [`s_image_${student.student_id}`]:
                                                  croppedImage,
                                                student_id: student.student_id,
                                              }));
                                            }}
                                          />
                                        ) : (
                                          <div className="flex flex-col items-center justify-center">
                                            <faUser className="text-4xl text-gray-400 mb-2" />
                                            <ImageCropperRC
                                              photoPreview={student.image_url}
                                              onImageCropped={(
                                                croppedImage
                                              ) => {
                                                setUploadedImages((prev) => ({
                                                  ...prev,
                                                  [`s_image_${student.student_id}`]:
                                                    croppedImage,
                                                  student_id:
                                                    student.student_id,
                                                }));
                                              }}
                                            />
                                          </div>
                                        )}
                                      </td>

                                      {/* Family Image Upload */}
                                      <td className="px-2 py-2 text-center border border-gray-300">
                                        {student.family_image_url ? (
                                          <ImageCropperRC
                                            photoPreview={
                                              student.family_image_url
                                            }
                                            onImageCropped={(croppedImage) => {
                                              setUploadedImages((prev) => ({
                                                ...prev,
                                                [`f_image_${student.parent_id}`]:
                                                  croppedImage,
                                                parent_id: student.parent_id,
                                              }));
                                            }}
                                          />
                                        ) : (
                                          <div className="flex flex-col items-center justify-center">
                                            <faUser className="text-4xl text-gray-400 mb-2" />

                                            <ImageCropperRC
                                              photoPreview={
                                                student.family_image_url
                                              }
                                              onImageCropped={(
                                                croppedImage
                                              ) => {
                                                setUploadedImages((prev) => ({
                                                  ...prev,
                                                  [`f_image_${student.parent_id}`]:
                                                    croppedImage,
                                                  parent_id: student.parent_id,
                                                }));
                                              }}
                                            />
                                          </div>
                                        )}
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td
                                      colSpan={5}
                                      className="text-center text-xl text-red-700 py-4"
                                    >
                                      Oops! No data found..
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                            {loadingForSearch ? (
                              ""
                            ) : (
                              <div className="flex justify-end gap-3 mt-4 mr-4">
                                <button
                                  type="button"
                                  onClick={handleSubmit}
                                  className={`bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-md`}
                                  disabled={isSaving}
                                >
                                  {isSaving ? "Saving..." : "Save"}
                                </button>

                                <button
                                  type="button"
                                  className="bg-yellow-300 hover:bg-yellow-400 text-white font-medium px-4 py-2 rounded-lg shadow-md"
                                  onClick={() => setShowStudentReport(false)}
                                >
                                  Back
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                  {/* )} */}
                </>
              )}
            </>
          </div>
        </div>
      </div>
    </>
  );
};

export default PhotoUploadForReportCard;
