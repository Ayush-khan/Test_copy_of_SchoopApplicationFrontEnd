import React, { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faPlus,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RxCross1 } from "react-icons/rx";
import Select from "react-select";

function ApplicationForMangement() {
  const API_URL = import.meta.env.VITE_API_URL; // URL for host
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const [newSectionName, setNewSectionName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [className, setClassName] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [newDepartmentId, setNewDepartmentId] = useState("");
  const [fieldErrors, setFieldErrors] = useState({}); // For field-specific errors
  const [nameError, setNameError] = useState("");

  const [description, setnewDescription] = useState("");
  const [requiresAppointment, setRequiresAppointment] = useState("N");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [classNameWithClassId, setClassNameWithClassId] = useState([]);

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [formFee, setFormFee] = useState(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [startDateError, setStartDateError] = useState("");
  const [endDateError, setEndDateError] = useState("");
  const [classError, setClassError] = useState("");
  const [formFeeError, setFormFeeError] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/admin/admission/classes/not-created`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Class", response);
      setClassNameWithClassId(response?.data?.data || []);
    } catch (error) {
      toast.error("Error fetching Classes");
      console.error("Error fetching Classes:", error);
    }
  };

  const handleClassSelect = (selectedOption) => {
    setClassError("");
    setSelectedClass(selectedOption);
    console.log("selected class", selectedOption);
    setSelectedClassId(selectedOption?.value);
  };

  const classOptions = useMemo(
    () =>
      classNameWithClassId.map((cls) => ({
        value: cls?.class_id,
        label: `${cls.name}`,
      })),
    [classNameWithClassId]
  );

  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");

  const pageSize = 10;

  const fetchSections = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        `${API_URL}/api/admin/admission-management`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      console.log("the data of ", response.data.data);

      setSections(response.data.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  useEffect(() => {
    const trimmedSearch = searchTerm.trim().toLowerCase();

    if (trimmedSearch !== "" && prevSearchTermRef.current === "") {
      previousPageRef.current = currentPage;
      setCurrentPage(0);
    }

    if (trimmedSearch === "" && prevSearchTermRef.current !== "") {
      setCurrentPage(previousPageRef.current);
    }

    prevSearchTermRef.current = trimmedSearch;
  }, [searchTerm]);

  const searchLower = searchTerm.trim().toLowerCase();
  console.log("sections before filtered sections:", sections);

  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })
      : "";

  const filteredSections = sections.filter((section) => {
    const search = searchLower.trim();

    return (
      section?.class_name?.toLowerCase().includes(search) ||
      String(section?.nac_id).toLowerCase().includes(search) ||
      formatDate(section?.start_date)?.toLowerCase().includes(search) ||
      formatDate(section?.end_date)?.toLowerCase().includes(search) ||
      String(section?.application_form_fee).toLowerCase().includes(search) ||
      (section?.publish === "Y" ? "publish" : "unpublish").includes(search)
    );
  });

  useEffect(() => {
    setPageCount(Math.ceil(filteredSections.length / pageSize));
  }, [filteredSections, pageSize]);

  const displayedSections = filteredSections.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  useEffect(() => {
    setPageCount(Math.ceil(filteredSections.length / pageSize));
  }, [filteredSections]);

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const handleEdit = (section) => {
    setCurrentSection(section);

    // CLASS (react-select expects { label, value })
    setSelectedClass({
      label: section.class_name, // adjust if different key
      value: section.class_id, // adjust if different key
    });

    // DATES (must be YYYY-MM-DD)
    setStartDate(section.start_date);
    setEndDate(section.end_date);

    // FORM FEE
    setFormFee(section.application_form_fee);

    // PUBLISH
    setRequiresAppointment(section.publish === "Y" ? "Y" : "N");

    // CLEAR ERRORS
    setClassError("");
    setStartDateError("");
    setEndDateError("");
    setFormFeeError("");

    // OPEN MODAL
    setShowEditModal(true);
  };

  const handleView = (section) => {
    setCurrentSection(section);

    setSelectedClass({
      label: section.class_name,
      value: section.class_id,
    });

    setStartDate(section.start_date);
    setEndDate(section.end_date);

    setFormFee(section.application_form_fee);

    setRequiresAppointment(section.publish === "Y" ? "Y" : "N");

    setClassError("");
    setStartDateError("");
    setEndDateError("");
    setFormFeeError("");

    // OPEN MODAL
    setShowViewModal(true);
  };

  const handleAdd = () => {
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowViewModal(false);
    setRequiresAppointment("N");
    setCurrentSection(null);
    setSelectedClass(null);
    setStartDate("");
    setEndDate("");
    setFormFee("");
  };

  //   const handleSubmitAdd = async () => {
  //     if (isSubmitting) return;
  //     setIsSubmitting(true);
  //     const validationErrors = validateSectionName(
  //       newSectionName,
  //       newDepartmentId
  //     );
  //     if (Object.keys(validationErrors).length > 0) {
  //       setFieldErrors(validationErrors);
  //       setIsSubmitting(false);
  //       return;
  //     }
  //     try {
  //       const token = localStorage.getItem("authToken");

  //       if (!token) {
  //         throw new Error("No authentication token or academic year found");
  //       }

  //       await axios.post(
  //         `${API_URL}/api/save_servicetypeticket`,
  //         {
  //           servicename: newSectionName,
  //           role_id: newDepartmentId,
  //           description: description,
  //           requiresappointment: requiresAppointment,
  //         },
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //           withCredentials: true,
  //         }
  //       );

  //       fetchSections();
  //       handleCloseModal();
  //       toast.success("New service type created!");
  //     } catch (error) {
  //       console.error("Error adding subject:", error);
  //       if (error.response && error.response.data && error.response.data.errors) {
  //         Object.values(error.response.data.errors).forEach((err) =>
  //           toast.error(err)
  //         );
  //       } else {
  //         toast.error("Server error. Please try again later.");
  //       }
  //     } finally {
  //       setIsSubmitting(false); // Re-enable the button after the operation
  //     }
  //   };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setClassError("");
    setStartDateError("");
    setEndDateError("");
    setFormFeeError("");

    let hasError = false;

    if (!selectedClass) {
      setClassError("Please select class");
      hasError = true;
    }

    if (!startDate) {
      setStartDateError("Please select start date");
      hasError = true;
    }

    if (!endDate) {
      setEndDateError("Please select end date");
      hasError = true;
    }

    if (!formFee) {
      setFormFeeError("Please enter form fee");
      hasError = true;
    }

    if (hasError) return;

    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Authentication token not found. Please login again");
      return;
    }

    const payload = {
      class_id: selectedClass.value,
      start_date: startDate,
      end_date: endDate,
      form_fee: formFee.toString(),
      publish: requiresAppointment === "Y" ? "Y" : "N",
    };

    try {
      await axios.post(
        `${API_URL}/api/admin/adminssion-management/create`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Admission created successfully");
      fetchSections();
      handleCloseModal();
    } catch (error) {
      console.error("Create admission error:", error);
      toast.error(
        error?.response?.data?.message ||
        "Something went wrong. Please try again."
      );
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();

    setStartDateError("");
    setEndDateError("");
    setFormFeeError("");

    let hasError = false;

    if (!startDate) {
      setStartDateError("Please select start date");
      hasError = true;
    }

    if (!endDate) {
      setEndDateError("Please select end date");
      hasError = true;
    }

    if (!formFee) {
      setFormFeeError("Please enter form fee");
      hasError = true;
    }

    if (hasError) return;

    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Authentication token not found. Please login again");
      return;
    }

    const payload = {
      class_id: currentSection.class_id,
      start_date: startDate,
      end_date: endDate,
      form_fee: formFee.toString(),
      publish: requiresAppointment === "Y" ? "Y" : "N",
    };

    try {
      await axios.patch(
        `${API_URL}/api/admin/admission-management/${currentSection.nac_id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Admission updated successfully");

      fetchSections(); // refresh list
      handleCloseModal(); // close modal
    } catch (error) {
      console.error("Update admission error:", error);

      toast.error(
        error?.response?.data?.message ||
        "Something went wrong. Please try again."
      );
    }
  };

  const handleDelete = (id) => {
    console.log("the deleted admission form id", id);
    const sectionToDelete = sections.find((sec) => sec.nac_id === id);
    console.log("the deleted ", sectionToDelete);
    setCurrentSection(sectionToDelete);
    setShowDeleteModal(true);
  };

  const handleSubmitDelete = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");

      if (!token || !currentSection || !currentSection.nac_id) {
        throw new Error("New Admission ID is missing");
      }
      console.log("delete this nac_id", currentSection.nac_id);
      const response = await axios.delete(
        `${API_URL}/api/admin/admission-management/${currentSection.nac_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      console.log("The response of the delete api ", response.data);
      if (response.data.success) {
        fetchSections();
        setShowDeleteModal(false);
        setCurrentSection(null);
        toast.success("Admission class deleted successfully.");
      } else {
        toast.error(
          response.data.message || "Failed to delete admission class!"
        );
      }
    } catch (error) {
      console.error("Error deleting admission class:", error);
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Server error. Please try again later.");
      }
    } finally {
      setIsSubmitting(false); // Re-enable the button after the operation
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <ToastContainer />

      <div className="container mt-4">
        <div className="card mx-auto lg:w-4/4 shadow-lg">
          <div className="p-2 px-3 bg-gray-100 flex justify-between items-center">
            <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
              Application Form Management
            </h3>{" "}
            <div className="box-border flex md:gap-x-2 justify-end md:h-10">
              <div className=" w-1/2 md:w-fit mr-1">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search "
                  value={searchTerm}
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
            <div className="h-96 lg:h-96 w-full md:w-[100%] mx-auto w-overflow-y-scroll lg:overflow-x-hidden">
              <div className="bg-white rounded-lg shadow-xs">
                <table className="min-w-full leading-normal table-auto">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="px-2 w-full md:w-[5%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Sr. No
                      </th>
                      <th className="px-2 w-full md:w-[12%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Class
                      </th>
                      <th className="px-2 w-full md:w-[13%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Start Date (DD/MM/YY)
                      </th>
                      <th className="px-2 w-full md:w-[13%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        End Date (DD/MM/YY)
                      </th>
                      <th className="px-2 w-full md:w-[12%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Form Fee
                      </th>
                      <th className="px-2 w-full md:w-[12%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Status
                      </th>
                      <th className="px-2 w-full md:w-[7%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Edit
                      </th>
                      <th className="px-2 w-full md:w-[7%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Delete
                      </th>
                      <th className="px-2 w-full md:w-[7%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        view
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
                    ) : displayedSections.length ? (
                      displayedSections.map((section, index) => (
                        <tr
                          key={section.section_id}
                          className={`${index % 2 === 0 ? "bg-white" : "bg-gray-100"
                            } hover:bg-gray-50`}
                        >
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {currentPage * pageSize + index + 1}
                            </p>
                          </td>
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {section?.class_name}
                            </p>
                          </td>
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {formatDate(section?.start_date)}
                            </p>
                          </td>
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {formatDate(section?.end_date)}
                            </p>
                          </td>
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {section?.application_form_fee}
                            </p>
                          </td>
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <span
                              className={`font-semibold ${section?.publish === "N"
                                ? "text-red-500"
                                : "text-green-500"
                                }`}
                            >
                              {section?.publish === "N"
                                ? "Unpublish"
                                : "Publish"}
                            </span>
                          </td>
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <button
                              className="text-blue-600 hover:text-blue-800 hover:bg-transparent "
                              onClick={() => handleEdit(section)}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>{" "}
                          </td>
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <button
                              className="text-red-600 hover:text-red-800 hover:bg-transparent "
                              onClick={() => handleDelete(section.nac_id)}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </td>
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <button
                              className="text-blue-600 hover:text-blue-800 hover:bg-transparent "
                              onClick={() => handleView(section)}
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </button>
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

        {/* Modal for adding a new section */}
        {showAddModal && (
          <div className="fixed inset-0 z-50   flex items-center justify-center bg-black bg-opacity-50">
            <div
              className="modal"
              style={{
                display: "block",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
              }}
            >
              <div className="modal-dialog modal-dialog-centered ">
                <div className="modal-content">
                  <div className="flex justify-between p-3">
                    <h5 className="modal-title">
                      Create Application From Management
                    </h5>
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
                    {/* Class */}
                    <div className="relative mb-3 flex items-center mx-4">
                      <label htmlFor="sectionName" className="w-1/2 mt-2">
                        Class <span className="text-red-500">*</span>
                      </label>

                      <div className="w-full md:w-[60%]">
                        <Select
                          id="classSelect"
                          options={classOptions}
                          value={selectedClass}
                          onChange={handleClassSelect}
                          placeholder="Select"
                          isSearchable
                          isClearable
                          className="text-sm"
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          styles={{
                            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                          }}
                        />

                        {classError && (
                          <div className="mt-1 text-red-500 text-xs">
                            {classError}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="relative mb-3 flex items-center mx-4">
                      <label htmlFor="startDate" className="w-1/2 mt-2">
                        Start Date <span className="text-red-500">*</span>
                      </label>

                      <div className="w-full md:w-[60%]">
                        <input
                          type="date"
                          id="startDate"
                          value={startDate}
                          //   onChange={(e) => setStartDate(e.target.value)}
                          onChange={(e) => {
                            setStartDate(e.target.value);
                            setStartDateError("");
                          }}
                          className="w-full border rounded px-3 py-2 text-sm"
                        />

                        {startDateError && (
                          <div className="mt-1 text-red-500 text-xs">
                            {startDateError}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="relative mb-3 flex items-center mx-4">
                      <label htmlFor="endDate" className="w-1/2 mt-2">
                        End Date <span className="text-red-500">*</span>
                      </label>

                      <div className="w-full md:w-[60%]">
                        <input
                          type="date"
                          id="endDate"
                          value={endDate}
                          //   onChange={(e) => setEndDate(e.target.value)}
                          onChange={(e) => {
                            setEndDate(e.target.value);
                            setEndDateError("");
                          }}
                          min={startDate}
                          className="w-full border rounded px-3 py-2 text-sm"
                        />

                        {endDateError && (
                          <div className="mt-1 text-red-500 text-xs">
                            {endDateError}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Form Fee */}
                    <div className="relative mb-3 flex items-center mx-4">
                      <label htmlFor="formFee" className="w-1/2 mt-2">
                        Form Fee <span className="text-red-500">*</span>
                      </label>

                      <div className="w-full md:w-[60%]">
                        <input
                          type="text"
                          id="formFee"
                          value={formFee}
                          //   onChange={(e) => setFormFee(e.target.value)}
                          onChange={(e) => {
                            setFormFee(e.target.value);
                            setFormFeeError(""); // ✅ clear error
                          }}
                          className="w-full border rounded px-3 py-2 text-sm"
                          placeholder="Enter amount"
                          maxLength={4}
                        />

                        {formFeeError && (
                          <div className="mt-1 text-red-500 text-xs">
                            {formFeeError}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Publish */}
                    <div className="relative mb-4 mx-4 flex items-center">
                      <label htmlFor="publish" className="w-[45%] mt-2">
                        Publish
                      </label>

                      <input
                        id="publish"
                        type="checkbox"
                        className="h-5 w-5 text-blue-600"
                        checked={requiresAppointment === "Y"}
                        onChange={(e) =>
                          setRequiresAppointment(e.target.checked ? "Y" : "N")
                        }
                      />
                    </div>
                  </div>

                  <div className=" flex justify-end p-3">
                    <button
                      type="button"
                      className="btn btn-primary px-3 mb-2"
                      style={{}}
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

        {/* Modal for editing a section */}
        {showEditModal && (
          <div
            className="modal"
            style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="flex justify-between p-3">
                  <h5 className="modal-title">
                    Edit Application Form Management
                  </h5>
                  <RxCross1
                    className="float-end relative  mt-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                    type="button"
                    // className="btn-close text-red-600"
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
                  {/* Class */}
                  <div className="relative mb-3 flex items-center mx-4">
                    <label htmlFor="sectionName" className="w-1/2 mt-2">
                      Class <span className="text-red-500">*</span>
                    </label>

                    <div className="w-full md:w-[60%]">
                      <input
                        type="text"
                        value={selectedClass?.label || ""}
                        readOnly
                        disabled
                        className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
                      />

                      {classError && (
                        <div className="mt-1 text-red-500 text-xs">
                          {classError}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="relative mb-3 flex items-center mx-4">
                    <label htmlFor="startDate" className="w-1/2 mt-2">
                      Start Date <span className="text-red-500">*</span>
                    </label>

                    <div className="w-full md:w-[60%]">
                      <input
                        type="date"
                        id="startDate"
                        value={startDate}
                        //   onChange={(e) => setStartDate(e.target.value)}
                        onChange={(e) => {
                          setStartDate(e.target.value);
                          setStartDateError("");
                        }}
                        className="w-full border rounded px-3 py-2 text-sm"
                      />

                      {startDateError && (
                        <div className="mt-1 text-red-500 text-xs">
                          {startDateError}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="relative mb-3 flex items-center mx-4">
                    <label htmlFor="endDate" className="w-1/2 mt-2">
                      End Date <span className="text-red-500">*</span>
                    </label>

                    <div className="w-full md:w-[60%]">
                      <input
                        type="date"
                        id="endDate"
                        value={endDate}
                        //   onChange={(e) => setEndDate(e.target.value)}
                        onChange={(e) => {
                          setEndDate(e.target.value);
                          setEndDateError("");
                        }}
                        min={startDate}
                        className="w-full border rounded px-3 py-2 text-sm"
                      />

                      {endDateError && (
                        <div className="mt-1 text-red-500 text-xs">
                          {endDateError}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Form Fee */}
                  <div className="relative mb-3 flex items-center mx-4">
                    <label htmlFor="formFee" className="w-1/2 mt-2">
                      Form Fee <span className="text-red-500">*</span>
                    </label>

                    <div className="w-full md:w-[60%]">
                      <input
                        type="text"
                        id="formFee"
                        value={formFee}
                        //   onChange={(e) => setFormFee(e.target.value)}
                        onChange={(e) => {
                          setFormFee(e.target.value);
                          setFormFeeError(""); // ✅ clear error
                        }}
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="Enter amount"
                        maxLength={4}
                      />

                      {formFeeError && (
                        <div className="mt-1 text-red-500 text-xs">
                          {formFeeError}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Publish */}
                  <div className="relative mb-4 mx-4 flex items-center">
                    <label htmlFor="publish" className="w-[45%] mt-2">
                      Publish
                    </label>

                    <input
                      id="publish"
                      type="checkbox"
                      className="h-5 w-5 text-blue-600"
                      checked={requiresAppointment === "Y"}
                      onChange={(e) =>
                        setRequiresAppointment(e.target.checked ? "Y" : "N")
                      }
                    />
                  </div>
                </div>

                <div className=" flex justify-end p-3">
                  <button
                    type="button"
                    className="btn btn-primary  px-3 mb-2"
                    style={{}}
                    onClick={handleSubmitEdit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Updating..." : "Update"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal for confirming deletion */}
        {showDeleteModal && (
          <div
            className="modal"
            style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="flex justify-between p-3">
                  <h5 className="modal-title">Confirm Deletion</h5>
                  <RxCross1
                    className="float-end relative mt-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
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
                  <p>
                    Are you sure you want to delete this admission class{" "}
                    {currentSection?.class_name} ?
                  </p>
                </div>
                <div className=" flex justify-end p-3">
                  <button
                    type="button"
                    className="btn btn-danger px-3 mb-2"
                    style={{}}
                    onClick={handleSubmitDelete}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showViewModal && (
          <div
            className="modal"
            style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="flex justify-between p-3">
                  <h5 className="modal-title">
                    View Application Form Management
                  </h5>
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
                  {/* Class */}
                  <div className="relative mb-3 flex items-center mx-4">
                    <label htmlFor="sectionName" className="w-1/2 mt-2">
                      Class <span className="text-red-500">*</span>
                    </label>

                    <div className="w-full md:w-[60%]">
                      <input
                        type="text"
                        value={selectedClass?.label || ""}
                        readOnly
                        disabled
                        className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="relative mb-3 flex items-center mx-4">
                    <label htmlFor="startDate" className="w-1/2 mt-2">
                      Start Date <span className="text-red-500">*</span>
                    </label>

                    <div className="w-full md:w-[60%]">
                      <input
                        type="text"
                        value={startDate || ""}
                        readOnly
                        disabled
                        className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="relative mb-3 flex items-center mx-4">
                    <label htmlFor="endDate" className="w-1/2 mt-2">
                      End Date <span className="text-red-500">*</span>
                    </label>

                    <div className="w-full md:w-[60%]">
                      <input
                        type="text"
                        value={endDate || ""}
                        readOnly
                        disabled
                        className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Form Fee */}
                  <div className="relative mb-3 flex items-center mx-4">
                    <label htmlFor="formFee" className="w-1/2 mt-2">
                      Form Fee <span className="text-red-500">*</span>
                    </label>

                    <div className="w-full md:w-[60%]">
                      <input
                        type="text"
                        value={formFee || ""}
                        readOnly
                        disabled
                        className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Publish */}
                  <div className="relative mb-3 flex items-center mx-4">
                    <label htmlFor="formFee" className="w-1/2 mt-2">
                      Status <span className="text-red-500">*</span>
                    </label>

                    <div className="w-full md:w-[60%]">
                      <input
                        type="text"
                        value={
                          requiresAppointment === "Y" ? "Publish" : "Unpublish"
                        }
                        readOnly
                        disabled
                        className={`w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-sm cursor-not-allowed`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default ApplicationForMangement;
