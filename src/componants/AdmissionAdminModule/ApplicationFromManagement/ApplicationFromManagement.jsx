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
  const [formFee, setFormFee] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [ageStartDate, setAgeStartDate] = useState("");
  const [ageEndDate, setAgeEndDate] = useState("");

  const [startDateError, setStartDateError] = useState("");
  const [endDateError, setEndDateError] = useState("");

  const [ageStartDateError, setAgeStartDateError] = useState("");
  const [ageEndDateError, setAgeEndDateError] = useState("");

  const [classError, setClassError] = useState("");
  const [formFeeError, setFormFeeError] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);

  const [bankAccountNames , setBankAccountNames] = useState([]);
  const [account , setAccount] = useState(null);
  const [accountError , setAccountError] = useState("");

  const [accountTypes , setAccountTypes] = useState([]);
  const [accountType , setAccountType] = useState(null);
  const [accountTypeError , setAccountTypeError] = useState("");

  const MASTER_DROPDOWN_CODE = "ADMISSION_TYPE"; 

  const accountTypeOptions = useMemo(
    () =>
      accountTypes.map((a) => ({
        value: a.label,
        label: `${a.label}`,
      })),
    [accountTypes],
  );

  const accountOptions = useMemo(
    () =>
      bankAccountNames.map((a) => ({
        value: a.id,
        label: `${a.account_name}`,
      })),
    [bankAccountNames],
  );

  useEffect(() => {
    fetchExams();
    fetchBankAccountNames();
    fetchAccountTypes();
  }, []);

  const fetchExams = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/admin/admission/classes/not-created`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setClassNameWithClassId(response?.data?.data || []);
    } catch (error) {
      toast.error("Error fetching Classes");
    }
  };

  const handleClassSelect = (selectedOption) => {
    setClassError("");
    setSelectedClass(selectedOption);
    setSelectedClassId(selectedOption?.value);
  };

  const handleAccountTypeSelect = (selectedOption) => {
    setAccountTypeError("");
    setAccountType(selectedOption || null);
  };

  const handleAccountSelect = (selectedOption) => {
    setAccountError("");
    setAccount(selectedOption);
  };

  const classOptions = useMemo(
    () =>
      classNameWithClassId.map((cls) => ({
        value: cls?.class_id,
        label: `${cls.name}`,
      })),
    [classNameWithClassId],
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
        },
      );

      setSections(response.data.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBankAccountNames = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        `${API_URL}/api/admin/admission/bank-accounts`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        },
      );

      setBankAccountNames(response.data.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountTypes = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        `${API_URL}/api/master/dropdowns/code/${MASTER_DROPDOWN_CODE}/options`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        },
      );

      setAccountTypes(response.data.data);
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

  const formatDate = (dateStr) =>
    dateStr && dateStr !== "0000-00-00"
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
    (currentPage + 1) * pageSize,
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

    setAgeStartDate(section.age_start_date);
    setAgeEndDate(section.age_end_date);

    setAccount({
      value: section.account_id ?? '',
      label: section.account_name ?? "Select",
    });
    setAccountType(section.type ? {
      value: section.type,
      label: section.type,
    } : null);

    // FORM FEE
    setFormFee(section.application_form_fee);

    // PUBLISH
    setRequiresAppointment(section.publish === "Y" ? "Y" : "N");

    // CLEAR ERRORS
    setClassError("");
    setStartDateError("");
    setEndDateError("");
    setFormFeeError("");
    setAccountTypeError("");
    setAccountError("");

    // OPEN MODAL
    setShowEditModal(true);
  };

  const handleView = (section) => {
    console.log(section);
    setCurrentSection(section);

    setSelectedClass({
      label: section.class_name,
      value: section.class_id,
    });

    setAccount({
      label: section.account_name,
      value: section.account_id,
    });

    setAccountType(section.type);

    setStartDate(section.start_date);
    setEndDate(section.end_date);

    setAgeStartDate(section.age_start_date);
    setAgeEndDate(section.age_end_date);

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
    setAgeEndDate("");
    setAgeStartDate("");
    setAccountType(null);
    setAccount(null);
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setClassError("");
    setAccountError("");
    setAccountTypeError("");
    setStartDateError("");
    setEndDateError("");
    setFormFeeError("");

    let hasError = false;

    if (!selectedClass) {
      setClassError("Please select class");
      hasError = true;
    }

    if (!account || account.value == "") {
      setAccountError("Please select account");
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
    } else if (!/^\d+(\.\d+)?$/.test(formFee)) {
      setFormFeeError("Please enter only numbers");
      hasError = true;
    } else {
      setFormFeeError("");
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
      age_start_date: ageStartDate,
      age_end_date: ageEndDate,
      account_id: account.value,
      type: accountType?.value ?? "",
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
        },
      );

      toast.success("Admission created successfully");
      fetchSections();
      handleCloseModal();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    setAccountError("");
    setAccountTypeError("");
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

    if (!account) {
      setAccountError("Please select account");
      hasError = true;
    }

    // if (!formFee) {
    //   setFormFeeError("Please enter form fee");
    //   hasError = true;
    // }

    if (!formFee) {
      setFormFeeError("Please enter form fee");
      hasError = true;
    } else if (!/^\d+(\.\d+)?$/.test(formFee)) {
      setFormFeeError("Please enter only numbers");
      hasError = true;
    } else {
      setFormFeeError("");
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
      age_start_date: ageStartDate === "0000-00-00" ? "" : ageStartDate,
      age_end_date: ageEndDate === "0000-00-00" ? "" : ageEndDate,
      account_id: account.value,
      type: accountType?.value ?? "",
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
        },
      );

      toast.success("Admission updated successfully");

      fetchSections(); // refresh list
      handleCloseModal(); // close modal
    } catch (error) {

      toast.error(
        error?.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    }
  };

  const handleDelete = (id) => {
    const sectionToDelete = sections.find((sec) => sec.nac_id === id);
    setCurrentSection(sectionToDelete);
    setShowDeleteModal(true);
  };

  // const handleSubmitDelete = async () => {
  //   if (isSubmitting) return;
  //   setIsSubmitting(true);
  //   try {
  //     const token = localStorage.getItem("authToken");

  //     if (!token || !currentSection || !currentSection.nac_id) {
  //       throw new Error("New Admission ID is missing");
  //     }
  //     console.log("delete this nac_id", currentSection.nac_id);
  //     const response = await axios.delete(
  //       `${API_URL}/api/admin/admission-management/${currentSection.nac_id}`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //         withCredentials: true,
  //       },
  //     );
  //     console.log("The response of the delete api ", response.data);
  //     if (response.data.success) {
  //       fetchSections();
  //       setShowDeleteModal(false);
  //       setCurrentSection(null);
  //       toast.success("Admission class deleted successfully.");
  //     } else {
  //       toast.error(
  //         response.data.message || "Failed to delete admission class!",
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Error deleting admission class:", error);
  //     if (error.response && error.response.data && error.response.data.error) {
  //       toast.error(error.response.data.error);
  //     } else {
  //       toast.error("Server error. Please try again later.");
  //     }
  //   } finally {
  //     setIsSubmitting(false); // Re-enable the button after the operation
  //     setShowDeleteModal(false);
  //   }
  // };
  const handleSubmitDelete = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");

      if (!token || !currentSection?.nac_id) {
        throw new Error("New Admission ID is missing");
      }

      const response = await axios.delete(
        `${API_URL}/api/admin/admission-management/${currentSection.nac_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        fetchSections();
        toast.success("Admission class deleted successfully.");
      } else {
        toast.error(
          response.data.message || "Failed to delete admission class!",
        );
      }
    } catch (error) {

      if (error.response?.status === 409) {
        toast.error(
          error.response.data?.message ||
            "Cannot delete this admission. It is linked with other records.",
        );
      } else {
        toast.error("Server error. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <ToastContainer />

      <div className="container mt-4">
        <div className="card mx-auto shadow-lg">
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
            <div className="w-full overflow-x-auto">
              <div className="h-96 overflow-y-auto">
                <table className="w-full table-auto border-collapse">
                  <thead className="bg-gray-200 sticky top-0">
                    <tr>
                      <th className="px-2 md:px-3 py-2 border border-gray-900 text-xs md:text-sm font-semibold text-center">
                        Sr. No
                      </th>
                      <th className="px-2 md:px-3 py-2 border border-gray-900 text-xs md:text-sm font-semibold text-center">
                        Class
                      </th>
                      <th className="px-2 md:px-3 py-2 border border-gray-900 text-xs md:text-sm font-semibold text-center">
                        Account
                      </th>
                      <th className="px-2 md:px-3 py-2 border border-gray-900 text-xs md:text-sm font-semibold text-center">
                        Type
                      </th>
                      <th className="px-2 md:px-3 py-2 border border-gray-900 text-xs md:text-sm font-semibold text-center">
                        Start Date
                      </th>
                      <th className="px-2 md:px-3 py-2 border border-gray-900 text-xs md:text-sm font-semibold text-center">
                        End Date
                      </th>
                      <th className="px-2 md:px-3 py-2 border border-gray-900 text-xs md:text-sm font-semibold text-center">
                        Age Start Date
                      </th>
                      <th className="px-2 md:px-3 py-2 border border-gray-900 text-xs md:text-sm font-semibold text-center">
                        Age End Date
                      </th>
                      <th className="px-2 md:px-3 py-2 border border-gray-900 text-xs md:text-sm font-semibold text-center">
                        Form Fee
                      </th>
                      <th className="px-2 md:px-3 py-2 border border-gray-900 text-xs md:text-sm font-semibold text-center">
                        Status
                      </th>
                      <th className="px-2 md:px-3 py-2 border border-gray-900 text-xs md:text-sm font-semibold text-center">
                        Edit
                      </th>
                      <th className="px-2 md:px-3 py-2 border border-gray-900 text-xs md:text-sm font-semibold text-center">
                        Delete
                      </th>
                      <th className="px-2 md:px-3 py-2 border border-gray-900 text-xs md:text-sm font-semibold text-center">
                        View
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan="11"
                          className="text-center py-10 text-blue-700"
                        >
                          Please wait while data is loading...
                        </td>
                      </tr>
                    ) : displayedSections.length ? (
                      displayedSections.map((section, index) => (
                        <tr
                          key={index}
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-gray-100"
                          }
                        >
                          <td className="text-center px-2 md:px-3 py-2 border border-gray-900 text-xs md:text-sm">
                            {currentPage * pageSize + index + 1}
                          </td>

                          <td className="text-center px-2 md:px-3 py-2 border border-gray-900 text-xs md:text-sm">
                            {section?.class_name}
                          </td>

                          <td className="text-center px-2 md:px-3 py-2 border border-gray-900 text-xs md:text-sm">
                            {section?.account_name}
                          </td>

                          <td className="text-center px-2 md:px-3 py-2 border border-gray-900 text-xs md:text-sm">
                            {section?.type}
                          </td>

                          <td className="text-center px-2 md:px-3 py-2 border border-gray-900 text-xs md:text-sm">
                            {formatDate(section?.start_date)}
                          </td>

                          <td className="text-center px-2 md:px-3 py-2 border border-gray-900 text-xs md:text-sm">
                            {formatDate(section?.end_date)}
                          </td>

                          <td className="text-center px-2 md:px-3 py-2 border border-gray-900 text-xs md:text-sm">
                            {formatDate(section?.age_start_date)}
                          </td>

                          <td className="text-center px-2 md:px-3 py-2 border border-gray-900 text-xs md:text-sm">
                            {formatDate(section?.age_end_date)}
                          </td>

                          <td className="text-center px-2 md:px-3 py-2 border border-gray-900 text-xs md:text-sm">
                            {section?.application_form_fee}
                          </td>

                          <td className="text-center px-2 md:px-3 py-2 border border-gray-900 text-xs md:text-sm">
                            <span
                              className={`font-semibold ${
                                section?.publish === "N"
                                  ? "text-red-500"
                                  : "text-green-500"
                              }`}
                            >
                              {section?.publish === "N"
                                ? "Unpublish"
                                : "Publish"}
                            </span>
                          </td>

                          <td className="text-center px-2 md:px-3 py-2 border border-gray-900">
                            <button
                              className="text-blue-600 hover:text-blue-800 text-sm"
                              onClick={() => handleEdit(section)}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                          </td>

                          <td className="text-center px-2 md:px-3 py-2 border border-gray-900">
                            <button
                              className="text-red-600 hover:text-red-800 text-sm"
                              onClick={() => handleDelete(section.nac_id)}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </td>

                          <td className="text-center px-2 md:px-3 py-2 border border-gray-900">
                            <button
                              className="text-blue-600 hover:text-blue-800 text-sm"
                              onClick={() => handleView(section)}
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="11"
                          className="text-center py-10 text-red-600"
                        >
                          No data available.
                        </td>
                      </tr>
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
                      Create Application Form Management
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

                    {/* Account Name */}
                    <div className="relative mb-3 flex items-center mx-4">
                      <label htmlFor="accoutSelect" className="w-1/2 mt-2">
                        Account <span className="text-red-500">*</span>
                      </label>
                      <div className="w-full md:w-[60%]">
                        <Select
                          id="accountSelect"
                          options={accountOptions}
                          value={account}
                          onChange={handleAccountSelect}
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

                        {accountError && (
                          <div className="mt-1 text-red-500 text-xs">
                            {accountError}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Account Type */}
                    <div className="relative mb-3 flex items-center mx-4">
                      <label htmlFor="accountTypeSelect" className="w-1/2 mt-2">
                        Type
                      </label>
                      <div className="w-full md:w-[60%]">
                        <Select
                          id="accountTypeSelect"
                          options={accountTypeOptions}
                          value={accountType}
                          onChange={handleAccountTypeSelect}
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

                        {accountTypeError && (
                          <div className="mt-1 text-red-500 text-xs">
                            {accountTypeError}
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

                    <div className="relative mb-3 flex items-center mx-4">
                      <label htmlFor="agestartDate" className="w-1/2 mt-2">
                        Age Start Date
                      </label>

                      <div className="w-full md:w-[60%]">
                        <input
                          type="date"
                          id="agestartDate"
                          value={ageStartDate}
                          //   onChange={(e) => setStartDate(e.target.value)}
                          onChange={(e) => {
                            setAgeStartDate(e.target.value);
                            setAgeStartDateError("");
                          }}
                          className="w-full border rounded px-3 py-2 text-sm"
                        />

                        {ageStartDateError && (
                          <div className="mt-1 text-red-500 text-xs">
                            {ageStartDateError}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="relative mb-3 flex items-center mx-4">
                      <label htmlFor="ageendDate" className="w-1/2 mt-2">
                        Age End Date
                      </label>

                      <div className="w-full md:w-[60%]">
                        <input
                          type="date"
                          id="ageendDate"
                          value={ageEndDate}
                          //   onChange={(e) => setEndDate(e.target.value)}
                          onChange={(e) => {
                            setAgeEndDate(e.target.value);
                            setAgeEndDateError("");
                          }}
                          min={ageStartDate}
                          className="w-full border rounded px-3 py-2 text-sm"
                        />

                        {ageEndDateError && (
                          <div className="mt-1 text-red-500 text-xs">
                            {ageEndDateError}
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

                  {/* Account Name */}
                  <div className="relative mb-3 flex items-center mx-4">
                    <label htmlFor="accoutSelect" className="w-1/2 mt-2">
                      Account <span className="text-red-500">*</span>
                    </label>
                    <div className="w-full md:w-[60%]">
                      <Select
                        id="accountSelect"
                        options={accountOptions}
                        value={account}
                        onChange={handleAccountSelect}
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

                      {accountError && (
                        <div className="mt-1 text-red-500 text-xs">
                          {accountError}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Account Type */}
                  <div className="relative mb-3 flex items-center mx-4">
                    <label htmlFor="accountTypeSelect" className="w-1/2 mt-2">
                      Type
                    </label>
                    <div className="w-full md:w-[60%]">
                      <Select
                        id="accountTypeSelect"
                        options={accountTypeOptions}
                        value={accountType}
                        onChange={handleAccountTypeSelect}
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

                      {accountTypeError && (
                        <div className="mt-1 text-red-500 text-xs">
                          {accountTypeError}
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

                  <div className="relative mb-3 flex items-center mx-4">
                    <label htmlFor="agestartDate" className="w-1/2 mt-2">
                      Age Start Date
                    </label>

                    <div className="w-full md:w-[60%]">
                      <input
                        type="date"
                        id="agestartDate"
                        value={ageStartDate}
                        //   onChange={(e) => setStartDate(e.target.value)}
                        onChange={(e) => {
                          setAgeStartDate(e.target.value);
                          setAgeStartDateError("");
                        }}
                        className="w-full border rounded px-3 py-2 text-sm"
                      />

                      {ageStartDateError && (
                        <div className="mt-1 text-red-500 text-xs">
                          {ageStartDateError}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="relative mb-3 flex items-center mx-4">
                    <label htmlFor="ageendDate" className="w-1/2 mt-2">
                      Age End Date
                    </label>

                    <div className="w-full md:w-[60%]">
                      <input
                        type="date"
                        id="ageendDate"
                        value={ageEndDate}
                        //   onChange={(e) => setEndDate(e.target.value)}
                        onChange={(e) => {
                          setAgeEndDate(e.target.value);
                          setAgeEndDateError("");
                        }}
                        min={ageStartDate}
                        className="w-full border rounded px-3 py-2 text-sm"
                      />

                      {ageEndDateError && (
                        <div className="mt-1 text-red-500 text-xs">
                          {ageEndDateError}
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
                      Class
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

                  {/* Account */}
                  <div className="relative mb-3 flex items-center mx-4">
                    <label  className="w-1/2 mt-2">
                      Account
                    </label>

                    <div className="w-full md:w-[60%]">
                      <input
                        type="text"
                        value={account?.label || ""}
                        readOnly
                        disabled
                        className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Account */}
                  <div className="relative mb-3 flex items-center mx-4">
                    <label  className="w-1/2 mt-2">
                      Type
                    </label>

                    <div className="w-full md:w-[60%]">
                      <input
                        type="text"
                        value={accountType || ""}
                        readOnly
                        disabled
                        className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="relative mb-3 flex items-center mx-4">
                    <label htmlFor="startDate" className="w-1/2 mt-2">
                      Start Date
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
                      End Date
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

                  <div className="relative mb-3 flex items-center mx-4">
                    <label htmlFor="startDate" className="w-1/2 mt-2">
                      Age Start Date
                    </label>

                    <div className="w-full md:w-[60%]">
                      <input
                        type="text"
                        value={ageStartDate || ""}
                        readOnly
                        disabled
                        className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="relative mb-3 flex items-center mx-4">
                    <label htmlFor="startDate" className="w-1/2 mt-2">
                      Age End Date
                    </label>

                    <div className="w-full md:w-[60%]">
                      <input
                        type="text"
                        value={ageEndDate || ""}
                        readOnly
                        disabled
                        className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Form Fee */}
                  <div className="relative mb-3 flex items-center mx-4">
                    <label htmlFor="formFee" className="w-1/2 mt-2">
                      Form Fee
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
                      Status
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