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
import MarkDropdownEditor from "../../Events/MarkDropdownEditor";

function DynamicMailer() {
  const API_URL = import.meta.env.VITE_API_URL; // URL for host
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  const [requiresAppointment, setRequiresAppointment] = useState("N");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [classNameWithClassId, setClassNameWithClassId] = useState([]);

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [formFee, setFormFee] = useState(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [classError, setClassError] = useState("");
  const [formFeeError, setFormFeeError] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);

  const [selectedKey, setSelectedKey] = useState(null);
  const [keyError, setKeyError] = useState("");

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/admin/admission-classes`,
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
        label: `${cls.class_name}`,
      })),
    [classNameWithClassId]
  );

  const KEY_LIST = [
    "INTERVIEW_SCHEDULING_11",
    "INTERVIEW_SCHEDULING_NUR",
    "VERIFICATION_SUCCESSFULL",
    "ADDMISSION_APPROVED",
  ];

  const keyOptions = KEY_LIST.map((key) => ({
    value: key,
    label: key.replaceAll("_", " "),
  }));

  const handleKeySelect = (selectedOption) => {
    setKeyError("");
    setSelectedKey(selectedOption);
    console.log("selected key:", selectedOption);
  };

  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");

  const pageSize = 10;

  const fetchSections = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(`${API_URL}/api/admin/email-templates`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
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

  const filteredSections = Array.isArray(sections)
    ? sections.filter((section) => {
        const search = searchLower.trim().toLowerCase();

        return (
          section?.class_name?.toLowerCase().includes(search) ||
          String(section?.body ?? "")
            .toLowerCase()
            .includes(search) ||
          String(section?.key ?? "")
            .toLowerCase()
            .includes(search)
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

  useEffect(() => {
    setPageCount(Math.ceil(filteredSections.length / pageSize));
  }, [filteredSections]);

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const handleEdit = (section) => {
    setCurrentSection(section);

    setSelectedClass({
      label: section.class_name,
      value: section.class_id,
    });

    // FORM FEE
    setFormFee(section.body);

    // key

    setSelectedKey({
      label: section.key,
      value: section.key,
    });

    // CLEAR ERRORS
    setClassError("");
    setKeyError("");
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

    // FORM FEE
    setFormFee(section.body);

    // key

    setSelectedKey({
      label: section.key,
      value: section.key,
    });

    // CLEAR ERRORS
    setClassError("");
    setKeyError("");
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
    setFormFee("");
    setFormFeeError("");
    setKeyError("");
    setClassError("");
    setSelectedKey("");
  };

  //   const handleSubmitAdd = async () => {
  //     if (!selectedClassId) {
  //       setClassError("Class is required");
  //       return;
  //     }

  //     if (!selectedKey) {
  //       setKeyError("Key is required");
  //       return;
  //     }

  //     if (!formFee) {
  //       setFormFeeError("Body is required");
  //       return;
  //     }

  //     const token = localStorage.getItem("authToken");

  //     try {
  //       const { data } = await axios.post(
  //         `${API_URL}/admin/email-templates`,
  //         {
  //           key: selectedKey.value,
  //           body: formFee,
  //           class_id: selectedClassId,
  //         },
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         }
  //       );

  //       toast.success(data.message);
  //     } catch (error) {
  //       toast.error(error.response?.data?.message || "Error saving template");
  //     }
  //   };

  const handleSubmitAdd = async () => {
    if (!selectedClassId) {
      setClassError("Class is required");
      return;
    }

    if (!selectedKey?.value) {
      setKeyError("Key is required");
      return;
    }

    if (!formFee) {
      setFormFeeError("Body is required");
      return;
    }

    const token = localStorage.getItem("authToken");

    try {
      const response = await axios({
        method: "post",
        url: `${API_URL}/api/admin/email-templates`,
        data: {
          key: selectedKey.value,
          body: formFee,
          class_id: selectedClassId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(
        response.data.message || "Eamil Template Create Successfully."
      );
      fetchSections();
      handleCloseModal();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error saving template");
    }
  };

  const handleSubmitEdit = async () => {
    // Validate body
    if (!formFee || !formFee.replace(/<(.|\n)*?>/g, "").trim()) {
      setFormFeeError("Body is required");
      return;
    }

    const token = localStorage.getItem("authToken");

    if (!token) {
      toast.error("Authentication token missing");
      return;
    }

    try {
      const { data } = await axios.patch(
        `${API_URL}/api/admin/email-templates/${currentSection.id}`,
        {
          class_id: currentSection.class_id,
          body: formFee,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(data.message || "Email Template updated successfully");

      // optional: close modal / refresh list
      setShowEditModal(false);
      fetchSections();
      handleCloseModal();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error updating email template"
      );
    }
  };

  const handleDelete = (id) => {
    console.log("the deleted admission form id", id);
    const sectionToDelete = sections.find((sec) => sec.id === id);
    console.log("the deleted ", sectionToDelete);
    setCurrentSection(sectionToDelete);
    setShowDeleteModal(true);
  };

  const handleSubmitDelete = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");

      if (!token || !currentSection || !currentSection.id) {
        throw new Error("New Admission ID is missing");
      }
      console.log("delete this id", currentSection.id);
      const response = await axios.delete(
        `${API_URL}/api/admin/email-templates/${currentSection.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      console.log("The response of the delete api ", response.data);
      if (response.data.status) {
        fetchSections(); // refresh list
        setShowDeleteModal(false); // close modal
        setCurrentSection(null); // reset current selection
        toast.success(
          response.data.message || "Email template deleted successfully."
        );
      } else {
        toast.error(
          response.data.message || "Failed to delete email template!"
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
              Dynamic Mail Template
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
                      <th className="px-2 w-full md:w-[7%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Sr. No
                      </th>
                      <th className="px-2 w-full md:w-[10%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Class
                      </th>
                      <th className="px-2 w-full md:w-[20%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Key
                      </th>
                      <th className="px-2 w-full md:w-[40%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Body
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
                        <tr key={section.id} className={` hover:bg-gray-50`}>
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
                              {section?.key}
                            </p>
                          </td>

                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {/* {section?.body} */}
                              <MarkDropdownEditor
                                value={section?.body}
                                readOnly
                                disabled
                                hideToolbar
                              />
                            </p>
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
                              onClick={() => handleDelete(section.id)}
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
              <div
                className="modal-dialog modal-dialog-centered "
                style={{ maxWidth: "600px" }}
              >
                <div className="modal-content">
                  <div className="flex justify-between p-3">
                    <h5 className="modal-title">Create Mail Template</h5>
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
                    <div className="relative mb-4 flex items-center gap-10 mx-4">
                      <div className="flex items-center w-1/2">
                        <label className="w-1/2 mt-2">
                          Class <span className="text-red-500">*</span>
                        </label>

                        <div className="w-full">
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

                      <div className="flex items-center w-1/2">
                        <label className="w-1/2 mt-2">
                          Key <span className="text-red-500">*</span>
                        </label>

                        <div className="w-full">
                          <Select
                            id="keySelect"
                            options={keyOptions}
                            value={selectedKey}
                            onChange={handleKeySelect}
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
                          {keyError && (
                            <div className="mt-1 text-red-500 text-xs">
                              {keyError}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Body below */}

                    <div className="relative mb-3 mx-4">
                      <label className="block mb-2">
                        Body <span className="text-red-500">*</span>
                      </label>

                      <MarkDropdownEditor
                        id="formFee"
                        value={formFee}
                        onChange={(value) => {
                          setFormFee(value);

                          if (
                            value &&
                            value.replace(/<(.|\n)*?>/g, "").trim()
                          ) {
                            setFormFeeError("");
                          }
                        }}
                        maxlength={255}
                      />

                      {formFeeError && (
                        <div className="mt-1 text-red-500 text-xs">
                          {formFeeError}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pr-10 mt-2">
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
            <div
              className="modal-dialog modal-dialog-centered"
              style={{ maxWidth: "600px" }}
            >
              <div className="modal-content">
                <div className="flex justify-between p-3">
                  <h5 className="modal-title">Edit Mail Template</h5>
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
                  {/* Class and Key Section */}
                  <div className="flex flex-wrap gap-6 mb-4 mx-4">
                    {/* Class */}
                    <div className="flex items-center w-full sm:w-[35%]">
                      <label className="w-1/2 mt-2 text-sm font-medium">
                        Class <span className="text-red-500">*</span>
                      </label>
                      <div className="w-full">
                        <input
                          type="text"
                          value={selectedClass?.label || ""}
                          disabled
                          className="w-full text-sm px-3 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Key */}
                    <div className="flex items-center w-full sm:w-[60%]">
                      <label className="w-[20%] mt-2 text-sm font-medium">
                        Key <span className="text-red-500">*</span>
                      </label>
                      <div className="w-full">
                        <input
                          type="text"
                          value={selectedKey?.label || ""}
                          disabled
                          className="w-full text-sm px-3 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Body Section */}
                  <div className="mb-3 mx-4">
                    <label className="block mb-2 text-sm font-medium">
                      Body <span className="text-red-500">*</span>
                    </label>

                    <MarkDropdownEditor
                      id="formFee"
                      value={formFee}
                      readOnly={true} // make editor read-only
                    />
                  </div>
                </div>

                <div className=" flex justify-end pr-10 mt-2">
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
                    Are you sure you want to delete this email templete for
                    class {currentSection?.class_name} ?
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
            <div
              className="modal-dialog modal-dialog-centered"
              style={{ maxWidth: "600px" }}
            >
              <div className="modal-content">
                <div className="flex justify-between p-3">
                  <h5 className="modal-title">View Mail Template</h5>
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
                  <div className="relative mb-3 flex items-center mx-4">
                    <label htmlFor="sectionName" className="w-[20%] mt-2">
                      Class <span className="text-red-500">*</span>
                    </label>

                    <div className="w-full md:w-full">
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
                    <label htmlFor="sectionName" className="w-[20%] mt-2">
                      Key<span className="text-red-500">*</span>
                    </label>

                    <div className="w-full md:w-full">
                      <input
                        type="text"
                        value={selectedKey?.label || ""}
                        readOnly
                        disabled
                        className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="relative mb-3 flex items-center mx-4">
                    <label htmlFor="formFee" className="w-[20%] mt-2">
                      Body<span className="text-red-500">*</span>
                    </label>

                    <div className="w-full md:w-full">
                      <MarkDropdownEditor
                        id="formFee"
                        value={formFee}
                        readOnly
                        disabled
                        hideToolbar
                        maxlength={255}
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

export default DynamicMailer;
