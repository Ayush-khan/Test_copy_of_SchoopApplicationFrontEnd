import axios from "axios";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RxCross1 } from "react-icons/rx";
import Select from "react-select";

function SubjectMapping() {
  const API_URL = import.meta.env.VITE_API_URL; // url for host
  const [classes, setClasses] = useState([]);
  const [reportSubject, setReportSubject] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedReportSubject, setSelectedReportSubject] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentClass, setCurrentClass] = useState(null);

  const [newClassName, setNewClassName] = useState("");
  const [newDepartmentId, setNewDepartmentId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pageSize = 10;
  const [validationErrors, setValidationErrors] = useState({});

  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");

  // validations state for unique name

  const [nameError, setNameError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({}); // For field-specific errors
  const [sectionNameis, newSectionNameis] = useState({});
  const [backendErrors, setBackendErrors] = useState({});
  const [roleId, setRoleId] = useState("");

  useEffect(() => {
    fetchSubjectMappingList();
    fechReportCardSubejects();
    fechAllSubjects();
    fetchDataRoleId();
  }, []);

  const fetchSubjectMappingList = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      const academicYr = localStorage.getItem("academicYear");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(`${API_URL}/api/get_subjectmapping`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Academic-Year": academicYr,
        },
        withCredentials: true,
      });
      console.log("response for the get API", response.data.data);

      setClasses(response.data.data);
      setPageCount(Math.ceil(response?.data?.length / pageSize));
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fechAllSubjects = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      const response = await axios.get(`${API_URL}/api/get_all_subjects`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      const options = response.data.map((sub) => ({
        label: sub.name,
        value: sub.sm_id,
      }));

      setSubjects(options);
      // setSubjects(response.data);
    } catch (error) {
      setError(error.message);
    }
  };

  const fechReportCardSubejects = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      const response = await axios.get(
        `${API_URL}/api/subject_for_reportcard`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      const options = response.data.subjects.map((sub) => ({
        label: sub.name,
        value: sub.sub_rc_master_id,
      }));

      setReportSubject(options);
      // setReportSubject(response.data.subjects);
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchDataRoleId = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.error("No authentication token found");
      return;
    }

    try {
      // Fetch session data
      const sessionResponse = await axios.get(`${API_URL}/api/sessionData`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRoleId(sessionResponse?.data?.user.role_id); // Store role_id
      // setRoleId("A"); // Store role_id
      console.log("roleIDis:", roleId);
      // Fetch academic year data
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const handleEdit = (classItem) => {
    setCurrentClass(classItem);
    console.log("inside handleEdit", classItem);

    const matchedSubject = subjects.find(
      (opt) =>
        opt.label.trim().toLowerCase() ===
        classItem.sub_name?.trim().toLowerCase()
    );
    const matchedReportSubject = reportSubject.find(
      (opt) =>
        opt.label.trim().toLowerCase() ===
        classItem.report_sub_name?.trim().toLowerCase()
    );

    setSelectedSubject(matchedSubject?.value || "");
    setSelectedReportSubject(matchedReportSubject?.value || "");

    setShowEditModal(true);
  };

  const handleAdd = () => {
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    resetForm({});
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setNewClassName("");
    setNewDepartmentId("");
    setCurrentClass(null);
    setValidationErrors({});
    setNameError("");
    setFieldErrors({});
    setBackendErrors("");
  };

  const handleSubmitAdd = async () => {
    if (isSubmitting) return;

    // Validation: check if both fields are selected
    const errors = {};
    if (!selectedSubject) errors.sm_id = "Please select a subject.";
    if (!selectedReportSubject)
      errors.sub_rc_master_id = "Please select a report card subject.";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors); // set errors to show in UI
      return; // stop submission
    }

    setIsSubmitting(true); // disable button

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.post(
        `${API_URL}/api/save_subject_mapping`,
        {
          subject_name: selectedSubject,
          report_sub_name: selectedReportSubject,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      const { status, data } = response;

      // Check if mapping already exists
      if (status === 409 || data?.message === "Mapping already exists!") {
        toast.warning("Mapping already exists!");
        return;
      }

      // Check for success status
      if (status === 200 || data?.success) {
        fetchSubjectMappingList();
        handleCloseModal();
        toast.success("Subject Mapping added successfully!");
        resetForm();
      } else {
        toast.error("Unexpected response from server.");
      }
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        if (status === 409 && data?.message === "Mapping already exists!") {
          toast.warning("Mapping already exists!");
        } else {
          toast.error(`Error adding subjects: ${data.message}`);
        }
      } else {
        toast.error(`Error adding subjects: ${error.message}`);
      }
      console.error("Error adding subjects:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Frontend Validation
    const errors = {};
    if (!selectedSubject) {
      errors.sm_id = "Please select a subject.";
    }
    if (!selectedReportSubject) {
      errors.sub_rc_master_id = "Please select a report card subject.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Authentication token missing!");
        setIsSubmitting(false);
        return;
      }

      const response = await axios.put(
        `${API_URL}/api/update_subjectmapping/${currentClass.sub_mapping}?subject_name=${selectedSubject}&report_sub_name=${selectedReportSubject}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      const { data } = response;

      // Check for known duplicate mapping error (from response message)
      if (
        data?.message?.includes("Duplicate entry") ||
        data?.error?.includes("Duplicate entry")
      ) {
        toast.warning("This subject mapping already exists.");
        return;
      }

      // Successful update
      if (data?.status === 200 || data?.success) {
        fetchSubjectMappingList();
        handleCloseModal();
        toast.success("Subject Mapping updated successfully!");
        resetForm();
      } else {
        toast.error(data?.message || "Unexpected error occurred.");
      }
    } catch (error) {
      console.error("Error updating subject mapping:", error);

      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Something went wrong.";

      if (msg.includes("Duplicate entry")) {
        toast.warning("Subject mapping already exists.");
      } else {
        toast.error(`Update failed: ${msg}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    const classToDelete = classes.find((cls) => cls.sub_mapping === id);
    console.log("subject mapping id", classToDelete);
    console.log("the subject mapping delete", classToDelete);
    setCurrentClass(classToDelete);
    setShowDeleteModal(true);
  };

  const handleSubmitDelete = async () => {
    if (isSubmitting) return; // Prevent re-submitting
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No authentication token found.");
      }

      const response = await axios.delete(
        `${API_URL}/api/delete_subjectmapping/${currentClass.sub_mapping}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      // Handle successful deletion
      if (response.data && response.data.status === 400) {
        const errorMessage = response.data.message || "Delete failed.";
        toast.error(errorMessage);
      } else {
        toast.success("Subject Mapping deleted successfully!");
        fetchSubjectMappingList(); // Refresh the classes list
      }

      setShowDeleteModal(false); // Close the modal
    } catch (error) {
      console.error("Error deleting subjects:", error);

      // Handle error responses
      if (error.response && error.response.status === 400) {
        const errorMessage = error.response.data.message || "Delete failed.";
        toast.error(errorMessage);
      } else {
        toast.error("Server error. Please try again later.");
      }
    } finally {
      setIsSubmitting(false); // Re-enable the button after the operation
      setShowDeleteModal(false);
    }
  };

  const resetForm = () => {
    setSelectedSubject("");
    setSelectedReportSubject("");
    setFieldErrors({});
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

  // Apply filtering logic
  const searchLower = searchTerm.trim().toLowerCase();
  const filteredClasses = classes.filter(
    (cls) =>
      cls.sub_name.toLowerCase().includes(searchLower) ||
      cls?.report_sub_name?.toLowerCase().includes(searchLower) ||
      cls?.sequence?.toString().includes(searchLower) ||
      cls?.class_names?.join(" , ").toLowerCase().includes(searchLower)
  );

  useEffect(() => {
    setPageCount(Math.ceil(filteredClasses.length / pageSize));
  }, [filteredClasses, pageSize]);

  // Paginate
  const displayedClasses = filteredClasses.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  return (
    <>
      {/* <NavBar /> */}
      <ToastContainer />
      <div className="container mt-4">
        <div className="card mx-auto w-[90%] shadow-lg">
          <div className="p-2 px-3 bg-gray-100 flex justify-between items-center">
            <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
              Subject Mapping
            </h3>
            <div className="box-border flex md:gap-x-2 justify-end md:h-10">
              <div className=" w-1/2 md:w-fit mr-1">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                className="btn btn-primary btn-sm md:h-9 text-xs md:text-sm"
                onClick={handleAdd}
              >
                <FontAwesomeIcon icon={faPlus} style={{ marginRight: "5px" }} />
                Add
              </button>
            </div>
          </div>
          <div
            className=" relative w-[97%]   mb-3 h-1  mx-auto bg-red-700"
            style={{
              backgroundColor: "#C03078",
            }}
          ></div>
          <div className="card-body w-full">
            <div className="h-96 lg:h-96 overflow-y-scroll lg:overflow-x-hidden w-full md:w-[84%] mx-auto">
              <div className="bg-white rounded-lg shadow-xs">
                <table className="min-w-full leading-normal table-auto">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="px-2 text-center w-full md:w-[7%] lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Sr.No
                      </th>
                      <th className="px-2 text-center w-full md:w-[20%]  lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Allocated Classes
                      </th>
                      <th className="px-2 w-full md:w-[19%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Subject Name
                      </th>
                      <th className="px-2 w-full md:w-[19%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Subject for report card
                      </th>
                      <th className="px-2 w-full md:w-[10%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Sequence
                      </th>
                      <th className="px-2 w-full md:w-[7%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Edit
                      </th>
                      <th className="px-2 w-full md:w-[7%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Delete
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <div className=" absolute left-[4%] w-[100%]  text-center flex justify-center items-center mt-14">
                        <div className=" text-center text-xl text-blue-700">
                          Please wait while data is loading...
                        </div>
                      </div>
                    ) : displayedClasses.length ? (
                      displayedClasses.map((classItem, index) => (
                        <tr
                          key={`${index}-${classItem.sub_mapping}`}
                          className={`${
                            index % 2 === 0 ? "bg-white" : "bg-gray-100"
                          } hover:bg-gray-50`}
                        >
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {currentPage * pageSize + index + 1}
                            </p>
                          </td>
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {classItem.class_names?.join(" , ")}
                            </p>
                          </td>
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {classItem.sub_name}
                            </p>
                          </td>
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {classItem.report_sub_name}
                            </p>
                          </td>
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {classItem.sequence}
                            </p>
                          </td>

                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            {classItem.isDelete === "Y" ? (
                              <button
                                className="text-blue-600 hover:text-blue-800 hover:bg-transparent "
                                onClick={() => handleEdit(classItem)}
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                            ) : (
                              ""
                            )}
                          </td>

                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            {classItem.isDelete === "Y" ? (
                              <button
                                className="text-red-600 hover:text-red-800 hover:bg-transparent "
                                onClick={() =>
                                  handleDelete(classItem.sub_mapping)
                                }
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            ) : (
                              ""
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <div className=" absolute left-[1%] w-[100%]  text-center flex justify-center items-center mt-14">
                        <div className=" text-center text-xl text-red-700">
                          Oops! No data found..
                        </div>
                      </div>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className=" flex justify-center  pt-2 -mb-3">
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
                containerClassName={"pagination"}
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
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50   flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal show" style={{ display: "block" }}>
            {/* <div className="modal-dialog modal-dialog-centered"> */}
            <div
              className="modal-dialog modal-dialog-centered"
              style={{ width: "560px", maxWidth: "100%" }}
            >
              <div className="modal-content">
                <div className="flex justify-between p-3">
                  <h5 className="modal-title">Create Subject Mapping</h5>
                  <RxCross1
                    className="float-end relative top-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                    type="button"
                    onClick={handleCloseModal}
                  />
                </div>
                <div
                  className=" relative  mb-3 h-1 w-[97%] mx-auto bg-red-700"
                  style={{
                    backgroundColor: "#C03078",
                  }}
                ></div>
                <div className="modal-body">
                  <div className=" relative -top-1 mb-4 flex justify-center  mx-4">
                    <label htmlFor="subjectid" className="w-[35%] mt-2">
                      Subject Name <span className="text-red-500">*</span>
                    </label>
                    <div className="w-[70%]">
                      <Select
                        id="subjectid"
                        options={subjects}
                        value={
                          subjects.find(
                            (opt) => opt.value === selectedSubject
                          ) || null
                        }
                        onChange={(selected) => {
                          setSelectedSubject(selected?.value || "");
                          setFieldErrors((prev) => ({ ...prev, sm_id: "" }));
                        }}
                        placeholder="Select Subject"
                        classNamePrefix="react-select"
                        isClearable
                      />
                    </div>
                    <div className="absolute top-9 left-1/3">
                      {fieldErrors.sm_id && (
                        <span className="text-danger text-xs">
                          {fieldErrors.sm_id}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className=" relative -top-1 mb-3 flex justify-center  mx-4">
                    <label htmlFor="reportsubjectid" className="w-[35%] mt-2">
                      Report Card Subject{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <div className="w-[70%]">
                      <Select
                        id="reportsubjectid"
                        options={reportSubject}
                        value={
                          reportSubject.find(
                            (opt) => opt.value === selectedReportSubject
                          ) || null
                        }
                        onChange={(selected) => {
                          setSelectedReportSubject(selected?.value || "");
                          setFieldErrors((prev) => ({
                            ...prev,
                            sub_rc_master_id: "",
                          }));
                        }}
                        placeholder="Select Subject"
                        classNamePrefix="react-select"
                        isClearable
                      />
                    </div>
                    <div className="absolute top-9 left-1/3">
                      {fieldErrors.sub_rc_master_id && (
                        <span className="text-danger text-xs">
                          {fieldErrors.sub_rc_master_id}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className=" flex justify-end p-1">
                  <button
                    type="button"
                    className="btn btn-primary px-3 mb-2 mr-8"
                    onClick={handleSubmitAdd}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Add"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50   flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal show " style={{ display: "block" }}>
            {/* <div className="modal-dialog modal-dialog-centered"> */}
            <div
              className="modal-dialog modal-dialog-centered"
              style={{ width: "560px", maxWidth: "100%" }}
            >
              <div className="modal-content">
                <div className="flex justify-between p-3">
                  <h5 className="modal-title">Edit Subject Mapping</h5>
                  <RxCross1
                    className="float-end relative  mt-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                    type="button"
                    onClick={handleCloseModal}
                  />
                </div>
                <div
                  className=" relative  mb-3 h-1 w-[97%] mx-auto bg-red-700"
                  style={{
                    backgroundColor: "#C03078",
                  }}
                ></div>
                <div className="modal-body">
                  <div className=" relative -top-1 mb-4 flex justify-center  mx-4">
                    <label htmlFor="subjectid" className="w-[35%] mt-2">
                      Subject Name <span className="text-red-500">*</span>
                    </label>
                    <div className="w-[70%]">
                      <Select
                        id="subjectid"
                        options={subjects}
                        value={
                          subjects.find(
                            (opt) => opt.value === selectedSubject
                          ) || null
                        }
                        onChange={(selected) => {
                          setSelectedSubject(selected?.value || "");
                          setFieldErrors((prev) => ({ ...prev, sm_id: "" }));
                        }}
                        placeholder="Select Subject"
                        classNamePrefix="react-select"
                        isClearable
                      />
                    </div>
                    <div className="absolute top-9 left-1/3">
                      {fieldErrors.sm_id && (
                        <span className="text-danger text-xs">
                          {fieldErrors.sm_id}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className=" relative -top-1 mb-3 flex justify-center  mx-4">
                    <label htmlFor="reportsubjectid" className="w-[35%] mt-2">
                      Report Card Subject{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <div className="w-[70%]">
                      <Select
                        id="reportsubjectid"
                        options={reportSubject}
                        value={
                          reportSubject.find(
                            (opt) => opt.value === selectedReportSubject
                          ) || null
                        }
                        onChange={(selected) => {
                          setSelectedReportSubject(selected?.value || "");
                          setFieldErrors((prev) => ({
                            ...prev,
                            sub_rc_master_id: "",
                          }));
                        }}
                        placeholder="Select Subject"
                        classNamePrefix="react-select"
                        isClearable
                      />
                    </div>
                    <div className="absolute top-9 left-1/3">
                      {fieldErrors.sub_rc_master_id && (
                        <span className="text-danger text-xs">
                          {fieldErrors.sub_rc_master_id}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className=" flex justify-end p-1">
                  <button
                    type="button"
                    className="btn btn-primary  px-3 mb-2 mr-8"
                    onClick={handleSubmitEdit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Updating..." : "Update"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50   flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal show " style={{ display: "block" }}>
            <div className="modal-dialog  modal-dialog-centered">
              <div className="modal-content">
                <div className="flex justify-between p-3">
                  <h5 className="modal-title">Delete Subject Mapping</h5>
                  <RxCross1
                    className="float-end relative mt-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                    type="button"
                    onClick={handleCloseModal}
                  />
                </div>
                <div
                  className=" relative  mb-3 h-1 w-[100%] mx-auto bg-red-700"
                  style={{
                    backgroundColor: "#C03078",
                  }}
                ></div>
                <div className="modal-body">
                  <p>
                    Are you sure you want to delete this subject mapping{" "}
                    {currentClass?.sub_name} - {currentClass?.report_sub_name}?
                  </p>
                </div>
                <div className=" flex justify-end p-3">
                  <button
                    type="button"
                    className="btn btn-danger px-3 mb-2"
                    onClick={handleSubmitDelete}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SubjectMapping;
