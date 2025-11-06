import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1, RxPadding } from "react-icons/rx";

import LoaderStyle from "../../componants/common/LoaderFinal/LoaderStyle";
import { useLocation, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";

const CheckHomework = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [currentPage, setCurrentPage] = useState(0);

  const [loadingForSearch, setLoadingForSearch] = useState(false);

  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [timetable, setTimetable] = useState([]);

  const pageSize = 10;
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const [comments, setComments] = useState({});
  const [openRows, setOpenRows] = useState([]);
  const [status, setStatus] = useState({});
  const [homeworkImage, setHomeworkImage] = useState([]);

  const { id } = useParams();
  console.log("id", id);

  const location = useLocation();
  const selectedHomework = location.state;
  console.log("selectedHomework", selectedHomework);

  useEffect(() => {
    if (selectedHomework?.homework_id && selectedHomework?.start_date) {
      fetchImageforhomework();
    }
  }, [selectedHomework]);

  // const fetchImageforhomework = async () => {
  //   try {
  //     const token = localStorage.getItem("authToken");

  //     const response = await axios.post(
  //       `${API_URL}/api/get_images_homework`,
  //       {
  //         homework_id: selectedHomework?.homework_id,
  //         homework_date: selectedHomework?.start_date?.split(" ")[0],
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     if (
  //       response?.data?.status === true &&
  //       Array.isArray(response.data.images)
  //     ) {
  //       setHomeworkImage(response.data.images);
  //     } else {
  //       setHomeworkImage([]);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching homework images:", error);
  //     toast.error("Error fetching homework images.");
  //   }
  // };

  const fetchImageforhomework = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.post(
        `${API_URL}/api/get_images_homework`,
        {
          homework_id: selectedHomework?.homework_id,
          homework_date: selectedHomework?.start_date?.split(" ")[0],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (
        response?.data?.status === true &&
        Array.isArray(response.data.images)
      ) {
        // ✅ Store both images and URL together
        setHomeworkImage({
          url: response.data.url,
          images: response.data.images,
        });
      } else {
        setHomeworkImage({ url: "", images: [] });
      }
    } catch (error) {
      console.error("Error fetching homework images:", error);
      toast.error("Error fetching homework images.");
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async () => {
    setLoadingForSearch(true);
    setSearchTerm("");

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Authentication token missing.");

      const response = await axios.post(
        `${API_URL}/api/get_student_with_homework_status`,
        {
          homework_id: selectedHomework.homework_id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Homework Status Response:", response.data);

      if (
        !response?.data?.student_details ||
        response?.data?.student_details?.length === 0
      ) {
        toast.error("No student data found for this homework.");
        setTimetable([]);
      } else {
        const students = response.data.student_details;

        // ✅ Prefill previous statuses and comments
        setTimetable(students);
        setStatus(students.map((s) => s.homework_status || "Assigned"));
        setComments(students.map((s) => s.comment || ""));

        // For pagination if applicable
        setPageCount(Math.ceil(students.length / pageSize));
      }
    } catch (error) {
      console.error("Error fetching Homework Status:", error);
      toast.error("Error fetching Homework Status. Please try again.");
    } finally {
      setIsSubmitting(false);
      setLoadingForSearch(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Authentication token missing.");
        return;
      }

      const arraylist = timetable.map((student, index) => ({
        homework_id: selectedHomework?.homework_id,
        student_id: student.student_id,
        homework_status: status[index] || "Assigned", // ✅ default to Assigned
        teachercomment: comments[index] || "",
        short_name: student.short_name || "",
      }));

      const payload = { arraylist };

      // ✅ If your backend expects FormData
      const formData = new FormData();
      formData.append("data", JSON.stringify(payload));

      const response = await fetch(`${API_URL}/api/updateHomework`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      console.log("Update Homework Response:", result);

      if (result.status === true || result.status === "true") {
        toast.success("Homework updated successfully!");
        setTimeout(() => navigate("/homework"), 2000);
      } else {
        toast.error(result.message || "Update failed, please try again.");
      }
    } catch (error) {
      console.error("Error updating homework:", error);
      toast.error("An error occurred while updating homework.");
    }
  };

  const camelCase = (str) =>
    str
      ?.toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  console.log("row", timetable);

  const filteredSections = timetable.filter((student) => {
    const searchLower = searchTerm.toLowerCase();

    const studentName =
      `${student?.first_name} ${student.mid_name} ${student.last_name}`
        ?.toLowerCase()
        .trim() || "";

    const rollNo = student?.roll_no ? String(student.roll_no) : "";

    return studentName.includes(searchLower) || rollNo.includes(searchLower);
  });

  const displayedSections = filteredSections.slice(currentPage * pageSize);

  return (
    <>
      <div className="w-full md:w-[100%] mx-auto p-4 ">
        <ToastContainer />
        <div className="card rounded-md">
          {loadingForSearch ? (
            <div className="flex justify-center items-center h-64">
              <LoaderStyle />
            </div>
          ) : (
            <>
              {timetable.length > 0 ? (
                <div className="w-full">
                  <div className="card mx-auto lg:w-full shadow-lg">
                    <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                      <div className="w-full flex flex-row justify-between">
                        <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
                          Update Homework Status
                        </h3>

                        <div className="flex items-center w-full">
                          <div
                            className="bg-blue-50 border-l-2 border-r-2 text-[1em] border-pink-500 rounded-md shadow-md mx-auto px-6 py-2"
                            style={{
                              overflowX: "auto",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <div
                              className="flex items-center gap-x-4 text-blue-800 font-medium"
                              style={{ flexWrap: "nowrap" }}
                            >
                              <span className="text-lg">🏫</span>
                              Class: {selectedHomework.cls_name}{" "}
                              {selectedHomework.sec_name}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 w-full md:w-[25%]">
                          <input
                            type="text"
                            className="form-control w-full border border-gray-400 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#C03078]"
                            placeholder="Search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />

                          <RxCross1
                            className="text-3xl text-red-600 cursor-pointer hover:bg-red-100 rounded-full p-1"
                            onClick={() => navigate("/homework")}
                          />
                        </div>
                      </div>
                    </div>

                    <div
                      className="relative w-[97%] mb-3 h-1 mx-auto bg-red-700"
                      style={{ backgroundColor: "#C03078" }}
                    ></div>

                    <div className="card-body w-full">
                      <div className="flex flex-col space-y-3">
                        {/* 📘 Homework Description */}
                        <div className="flex items-center">
                          <label className="font-semibold text-gray-800 w-48">
                            Homework Description:
                          </label>
                          <span className="text-gray-700 flex-1">
                            {selectedHomework?.description ||
                              "No description available."}
                          </span>
                        </div>

                        {/* 📎 View Attachments Section */}
                        <div className="flex items-start">
                          <label className="font-semibold text-gray-800 w-48 mt-1">
                            View Attachments:
                          </label>

                          <div className="flex-1">
                            {homeworkImage?.images?.length > 0 ? (
                              <div className="flex flex-col space-y-1">
                                {homeworkImage.images.map((img, index) => {
                                  const downloadUrl = `${homeworkImage.url}/${img.image_name}`;
                                  console.log("Download URL:", downloadUrl);

                                  return (
                                    <div
                                      key={index}
                                      className="flex items-center space-x-2"
                                    >
                                      {/* File name (non-clickable) */}
                                      <span className="text-gray-700 font-medium break-all">
                                        {img.image_name}
                                      </span>

                                      {/* Download icon */}
                                      <a
                                        href={downloadUrl}
                                        download={img.image_name}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#C03178] hover:text-pink-600"
                                        title={`Download ${img.image_name}`}
                                      >
                                        <i className="fa-solid fa-download text-sm"></i>
                                      </a>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm">
                                No attachments available.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div
                        className="h-[550px] lg:h-[550px] overflow-y-scroll overflow-x-scroll"
                        style={{
                          scrollbarWidth: "thin",
                          scrollbarColor: "#C03178 transparent",
                        }}
                      >
                        <table className="min-w-full leading-normal table-auto">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="w-6 px-2 py-2 text-center border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                Sr No.
                              </th>
                              <th className="w-6 px-3 py-2 text-center border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                Roll No.
                              </th>
                              <th className="w-25 px-3 py-2 text-center border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                Student Name
                              </th>
                              <th className="w-28 px-3 py-2 text-center border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                Status
                              </th>
                              <th className="w-28 px-3 py-2 text-center border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                Teacher's Comment
                              </th>
                              <th className="w-28 px-3 py-2 text-center border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                Parent's Comment
                              </th>
                              <th className="w-28 px-3 py-2 text-center border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                Add Comments
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {displayedSections.map((student, index) => (
                              <tr
                                key={student.adm_form_pk}
                                className="border border-gray-300"
                              >
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {index + 1}
                                </td>
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {student.roll_no}
                                </td>
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {camelCase(
                                    `${student?.first_name || ""} ${
                                      student?.mid_name || ""
                                    } ${student?.last_name || ""}`
                                  )}
                                </td>
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  <select
                                    className="border border-gray-400 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#C03078]"
                                    value={
                                      status[index] || student.homework_status
                                    }
                                    onChange={(e) =>
                                      setStatus({
                                        ...status,
                                        [index]: e.target.value,
                                      })
                                    }
                                  >
                                    <option value="Assigned">Assigned</option>
                                    <option value="Complete">Complete</option>
                                    <option value="Partial">Partial</option>
                                  </select>
                                </td>

                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {student?.comment}
                                </td>
                                <td className="px-2 py-2 text-center border border-gray-300">
                                  {student?.parent_comment}
                                </td>

                                <td className="px-2 py-2 text-center border border-gray-300 relative">
                                  {!openRows.includes(index) && (
                                    <button
                                      onClick={() =>
                                        setOpenRows([...openRows, index])
                                      }
                                      className="text-[#C03078] hover:text-pink-800 hover:bg-gray-100 p-2 rounded-md transition-all duration-200"
                                    >
                                      <FontAwesomeIcon
                                        icon={faPlus}
                                        className="text-lg"
                                      />
                                    </button>
                                  )}

                                  {openRows.includes(index) && (
                                    <div className="relative w-full mt-2">
                                      <textarea
                                        className="w-full border border-gray-400 rounded-md p-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                                        rows="2"
                                        placeholder="Enter Comment"
                                        value={comments[index] || ""}
                                        onChange={(e) =>
                                          setComments({
                                            ...comments,
                                            [index]: e.target.value,
                                          })
                                        }
                                      />

                                      <FontAwesomeIcon
                                        icon={faMinus}
                                        className="absolute top-2 right-2 text-[#C03078] cursor-pointer hover:text-pink-800 hover:bg-gray-100 p-1 rounded-md"
                                        onClick={() =>
                                          setOpenRows(
                                            openRows.filter((i) => i !== index)
                                          )
                                        }
                                      />
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="flex justify-end space-x-4 mt-4">
                          <button
                            onClick={handleUpdate}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md shadow-md transition duration-200"
                          >
                            Update
                          </button>
                          {/* Back Button */}
                          <button
                            onClick={() => navigate("/homework")}
                            className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-4 py-2 rounded-md shadow-md transition duration-200"
                          >
                            Back
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center items-center h-64">
                  <p className="text-xl text-red-700 font-medium">
                    Oops! No data found..
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CheckHomework;
