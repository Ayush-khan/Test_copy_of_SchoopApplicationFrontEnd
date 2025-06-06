import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import LoaderStyle from "../../componants/common/LoaderFinal/LoaderStyle";
import LoaderStyle from "../../common/LoaderFinal/LoaderStyle";
import Select from "react-select";

import "bootstrap/dist/css/bootstrap.min.css";
import { RxCross1 } from "react-icons/rx";

const CreateShortSMS = () => {
  const API_URL = import.meta.env.VITE_API_URL; // URL for host

  const [loading, setLoading] = useState(false); // Loader state
  const [divisionError, setDivisionError] = useState("");
  const [allClasses, setAllClasses] = useState([]);
  const [subject, setSubject] = useState("");
  const [noticeDesc, setNoticeDesc] = useState("");
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [subjectError, setSubjectError] = useState("");
  const [noticeDescError, setNoticeDescError] = useState("");
  const [classError, setClassError] = useState("");

  // Handle division checkbox change
  useEffect(() => {
    fetchClassNames();
  }, []);

  const fetchClassNames = async () => {
    setLoading(true); // Start loader
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${API_URL}/api/getClassList`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(response.data)) {
        setAllClasses(response.data);
      } else {
        setDivisionError("Unexpected data format");
      }
    } catch (error) {
      console.error("Error fetching class names:", error);
      setDivisionError("Error fetching class names");
    } finally {
      setLoading(false); // Stop loader
    }
  };

  // Handle checkbox toggle
  const handleClassChange = (classId) => {
    if (selectedClasses.includes(classId)) {
      setSelectedClasses(selectedClasses.filter((id) => id !== classId));
    } else {
      setSelectedClasses([...selectedClasses, classId]);
    }
  };

  // Select/Deselect all classes
  const handleSelectAllClasses = () => {
    if (selectedClasses.length === allClasses.length) {
      setSelectedClasses([]); // Deselect all
    } else {
      setSelectedClasses(allClasses.map((cls) => cls.class_id)); // Select all
    }
  };

  // Reset form
  const resetForm = () => {
    setSubject("");
    setNoticeDesc("");
    setSelectedClasses([]);
    setSubjectError("");
    setNoticeDescError("");
    setClassError("");
  };

  // Handle form submission
  const handleSubmit = async (isPublish = false) => {
    let hasError = false;

    if (!subject.trim()) {
      setSubjectError("Subject is required.");
      hasError = true;
    } else {
      setSubjectError("");
    }

    if (!noticeDesc.trim()) {
      setNoticeDescError("Notice description is required.");
      hasError = true;
    } else {
      setNoticeDescError("");
    }

    if (selectedClasses.length === 0) {
      setClassError("Please select at least one class.");
      hasError = true;
    } else {
      setClassError("");
    }

    if (hasError) return;

    const apiEndpoint = isPublish ? "save_publish_smsnotice" : "save_smsnotice";

    setLoading(true); // Start loader
    try {
      const token = localStorage.getItem("authToken");

      if (!token) throw new Error("No authentication token found");

      const response = await axios.post(
        `${API_URL}/api/${apiEndpoint}`,
        {
          subject,
          notice_desc: noticeDesc,
          checkbxevent: selectedClasses,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success(
          isPublish
            ? "Notice saved and published!"
            : "Notice saved successfully!"
        );
        resetForm();
      } else {
        toast.error("Unexpected server response.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error while saving the notice."
      );
    } finally {
      setLoading(false); // Stop loader
    }
  };

  return (
    <div>
      <ToastContainer />
      <div className="container mb-4">
        <div className="card-header flex justify-between items-center"></div>
        <div className="w-full mx-auto">
          <div className="container mt-4">
            <div className="card mx-auto lg:w-full shadow-lg">
              <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl">
                  Create Notice
                </h3>
                {/* <RxCross1
                  className="text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                  type="button"
                /> */}
              </div>
              <div
                className="relative mb-3 h-1 w-[97%] mx-auto"
                style={{ backgroundColor: "#C03078" }}
              ></div>
              <div className="card-body w-full ml-2">
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <LoaderStyle />
                  </div>
                ) : (
                  <div className="lg:overflow-x-hidden">
                    <div className="card-body w-full ml-2">
                      {/* Common form row style */}
                      <div className="grid grid-cols-[180px_1fr] items-start gap-4 mb-6">
                        <h5 className="text-[1em] text-gray-700">
                          Select Department{" "}
                          <span className="text-red-500">*</span>
                        </h5>
                        <div>
                          <Select
                            isMulti
                            // options={classOptions}
                            // value={classOptions.filter((opt) =>
                            //   selectedClasses.includes(opt.value)
                            // )}
                            // onChange={handleClassSelectChange}
                            placeholder="Select departments..."
                            className="text-sm w-[40%]"
                            classNamePrefix="select"
                          />
                          {classError && (
                            <p className="text-red-500 text-sm mt-1">
                              {classError}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-[180px_1fr] items-start gap-4 mb-6">
                        <h5 className="text-[1em] text-gray-700">
                          Select Staff Name{" "}
                          <span className="text-red-500">*</span>
                        </h5>
                        <div>{/* Add your Select component here */}</div>
                      </div>
                      <div className="grid grid-cols-[180px_1fr] items-start gap-4 mb-6">
                        <h5 className="text-[1em] text-gray-700">
                          Subject <span className="text-red-500">*</span>
                        </h5>
                        <div className="flex flex-col gap-1">
                          <input
                            type="text"
                            className="w-[40%] px-2 py-1 border border-gray-700 rounded-md shadow-md"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                          />
                          {subjectError && (
                            <p className="text-red-500 text-sm">
                              {subjectError}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-[180px_1fr] items-start gap-4 mb-8">
                        <h5 className="text-[1em] text-gray-700 mt-2">
                          Description <span className="text-red-500">*</span>
                        </h5>
                        <div className="flex flex-col">
                          <p className="font-light">Dear Staff,</p>
                          <textarea
                            className="px-2 py-1 border border-gray-700 rounded-md shadow-md"
                            rows="3"
                            value={noticeDesc}
                            onChange={(e) => setNoticeDesc(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const cursorPos = e.target.selectionStart;
                                const textBeforeCursor = noticeDesc.slice(
                                  0,
                                  cursorPos
                                );
                                const textAfterCursor =
                                  noticeDesc.slice(cursorPos);
                                const updatedText = `${textBeforeCursor}\n• ${textAfterCursor}`;
                                setNoticeDesc(updatedText);
                                setTimeout(() => {
                                  e.target.selectionStart =
                                    e.target.selectionEnd = cursorPos + 3;
                                }, 0);
                              }
                            }}
                          />
                          {noticeDescError && (
                            <p className="text-red-500 text-sm">
                              {noticeDescError}
                            </p>
                          )}
                        </div>
                      </div>
                      .{/* File Upload */}
                      <div className="w-full relative -top-14 md:w-[85%] flex flex-row justify-start gap-x-14 space-x-2 md:space-x-11 ">
                        <h5 className="px-2  lg:px-3 py-2 text-[1em] text-nowrap text-gray-700">
                          Upload Files
                        </h5>
                        <input
                          className="mt-3 text-xs "
                          type="file"
                          multiple
                          // onChange={handleFileUpload}
                        />{" "}
                        <span className="relative right-[7%] top-5 text-pink-500 text-[.7em]">
                          (Each file must not exceed a maximum size of 2MB)
                        </span>
                      </div>
                      <h5 className="relative -top-9 text-[1em] text-gray-700 px-2">
                        Attachment:
                      </h5>
                      <div className="  -top-16 w-full md:w-[57%] mx-auto relative right-0 md:right-10">
                        <div className=" text-xs flex flex-col">
                          {/* {uploadedFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2 space-y-3"
                            >
                              <span className="bg-gray-100 border-1 p-0.5 shadow-sm">
                                {file.name}
                              </span>
                              <RxCross1
                                className="text-xl relative -top-1 w-4 h-4 text-red-600 hover:cursor-pointer hover:bg-red-100"
                                type="button"
                                // onClick={() => removeFile(index)}
                              />
                            </div>
                          ))} */}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {!loading && (
                <div className="flex space-x-2 justify-end m-4">
                  <button
                    onClick={() => handleSubmit(false)}
                    className="btn btn-primary"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => handleSubmit(true)}
                    className="btn btn-primary"
                  >
                    Save & Publish
                  </button>
                  <button
                    onClick={resetForm}
                    className="btn btn-danger bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateShortSMS;
