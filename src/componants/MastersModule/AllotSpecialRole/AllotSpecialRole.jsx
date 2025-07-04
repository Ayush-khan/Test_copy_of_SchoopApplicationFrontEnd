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

function AllotSpecialRole() {
  const API_URL = import.meta.env.VITE_API_URL; // url for host
  const [classes, setClasses] = useState([]);
  const [departments, setDepartments] = useState([]);
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
  const [staffNames, setStaffNames] = useState([]);

  // validations state for unique name
  const [nameAvailable, setNameAvailable] = useState(true);
  const [nameError, setNameError] = useState("");
  const [sectionNameis, newSectionNameis] = useState({});
  const [backendErrors, setBackendErrors] = useState({});
  const [roleOptions, setRoleOptions] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    fetchAllotSpecialRoleList();
    fetchStaffNames();
    fetchDepartments();
    fetchSpecialRoles();
  }, []);
  const fetchAllotSpecialRoleList = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        `${API_URL}/api/get_allotspecialrolelist`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      setClasses(response.data?.data);
      setPageCount(Math.ceil(response?.data?.data?.length / pageSize));
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  const fetchSpecialRoles = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get(`${API_URL}/api/get_specialrole`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const opts = Array.isArray(res.data.data)
        ? res.data.data.map((r) => ({ value: r.id, label: r.name }))
        : [];
      setRoleOptions(opts);
    } catch (err) {
      toast.error("Error fetching roles");
    }
  };
  const fetchStaffNames = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${API_URL}/api/get_allstaff`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(" all staff names", response.data);

      if (Array.isArray(response.data.data)) {
        const options = response.data.data.map((staff) => ({
          value: staff.teacher_id,
          label: staff.name,
        }));
        setStaffNames(options);
      } else {
        setNameError("Unexpected data format.");
      }
    } catch (error) {
      toast.error("Error fetching Staff Names.", error);
    }
  };
  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(`${API_URL}/api/sections`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      setDepartments(response.data);
    } catch (error) {
      setError(error.message);
    }
  };

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };
  const validateFormFields = ({ departmentId, staff, role }) => {
    const errors = {};

    if (!departmentId) {
      errors.department = "Please select a department";
    }

    if (!staff) {
      errors.staff = "Please select a staff member";
    }

    if (!role) {
      errors.role = "Please select a role";
    }

    return errors;
  };

  const handleEdit = (classItem) => {
    setCurrentClass(classItem);
    setNewClassName(classItem.name);
    setNewDepartmentId(classItem.department_id);
    setSelectedStaff({
      value: classItem.teacher_id,
      label: classItem.staff_name,
    });
    setSelectedRole({
      value: classItem.specialrole_id,
      label: classItem.role_name,
    });
    setShowEditModal(true);
  };

  const handleAdd = () => {
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
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

    setValidationErrors({});
  };

  const handleSubmitAdd = async () => {
    if (isSubmitting) return; // Prevent re-submitting
    setIsSubmitting(true);
    // Perform validation first
    const validation = validateFormFields({
      departmentId: newDepartmentId,
      staff: selectedStaff,
      role: selectedRole,
    });

    if (Object.keys(validation).length > 0) {
      setFieldErrors(validation);
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Step 3: Continue with form submission if name is available
      await axios.post(
        `${API_URL}/api/classes`,
        { name: newClassName, department_id: newDepartmentId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      // Step 4: Post-submission actions
      fetchAllotSpecialRoleList();
      handleCloseModal();
      toast.success("Class added successfully!");
    } catch (error) {
      // Handle errors
      if (error.response && error.response.data) {
        toast.error(`Error adding class: ${error.response.data.message}`);
      } else {
        toast.error(`Error adding class: ${error.message}`);
      }
      console.error("Error adding class:", error);
    } finally {
      setIsSubmitting(false); // Re-enable the button after the operation
    }
  };
  const handleSubmitEdit = async () => {
    if (isSubmitting) return; // Prevent re-submitting
    setIsSubmitting(true);
    const validation = validateFormFields({
      departmentId: newDepartmentId,
      staff: selectedStaff,
      role: selectedRole,
    });

    if (Object.keys(validation).length > 0) {
      setFieldErrors(validation);
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");

      if (!token || !currentClass || !currentClass.class_id) {
        throw new Error("Class ID is missing");
      }

      console.log("Existing Class:", currentClass);
      console.log("New Class Name:", newClassName);

      const response = await axios.put(
        `${API_URL}/api/classes/${currentClass.class_id}`,
        { name: newClassName, department_id: newDepartmentId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      fetchAllotSpecialRoleList();
      handleCloseModal();
      toast.success("Class updated successfully!");

      // Reset backend errors on successful submission
      setBackendErrors({});
    } catch (error) {
      if (error.response && error.response.data) {
        const backendErrors = error.response.data.errors;
        if (backendErrors) {
          // Store backend validation errors in the state
          setBackendErrors(backendErrors);

          // Optionally show a toast with error messages
          toast.error(`Error: ${backendErrors.name?.join(", ")}`);
        } else {
          toast.error(`Error updating class: ${error.response.data.message}`);
        }
      } else {
        toast.error(`Error updating class: ${error.message}`);
      }
      console.error("Error editing class:", error);
    } finally {
      setIsSubmitting(false); // Re-enable the button after the operation
    }
  };

  const handleDelete = (id) => {
    const classToDelete = classes.find((cls) => cls.class_id === id);
    console.log("the classto didlete", classToDelete);
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
        `${API_URL}/api/classes/${currentClass.class_id}`,
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
        toast.success("Class deleted successfully!");
        fetchAllotSpecialRoleList(); // Refresh the classes list
      }

      setShowDeleteModal(false); // Close the modal
    } catch (error) {
      console.error("Error deleting class:", error);

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
      cls.role.toLowerCase().includes(searchLower) ||
      cls?.departmentname.toLowerCase()?.includes(searchLower) ||
      cls?.teachername.toLowerCase().includes(searchLower)
  );

  useEffect(() => {
    setPageCount(Math.ceil(filteredClasses.length / pageSize));
  }, [filteredClasses, pageSize]);

  // Paginate
  const displayedClasses = filteredClasses.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  const handleChangeDepartmentId = (e) => {
    const { value } = e.target;
    setNewDepartmentId(value);

    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      department_id: value ? "" : "Please select a department",
    }));
  };

  return (
    <>
      {/* <NavBar /> */}
      <ToastContainer />
      <div className="container mt-4">
        <div className="card mx-auto lg:w-3/4 shadow-lg">
          <div className="p-2 px-3 bg-gray-100 flex justify-between items-center">
            <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
              Special Role Allotment
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
            <div
              className={
                "w-full md:w-[84%] h-96 lg:h-96 overflow-y-scroll lg:overflow-x-hidden mx-auto"
              }
            >
              <div className="bg-white rounded-lg shadow-xs">
                {loading ? (
                  <div className="flex justify-center items-center w-full h-[50vh]">
                    <div className="text-xl text-blue-700 text-center">
                      Please wait while data is loading...
                    </div>
                  </div>
                ) : (
                  <table className="min-w-full leading-normal table-auto">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="px-2 text-center w-full md:w-[10%] lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          Sr.No
                        </th>
                        <th className="px-2 text-center w-full md:w-[14%]  lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          Department
                        </th>
                        <th className="px-2 w-full md:w-[19%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          Teacher{" "}
                        </th>
                        <th className="px-2 w-full md:w-[25%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          Role
                        </th>

                        <th className="px-2 w-full md:w-[10%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          Edit
                        </th>
                        <th className="px-2 w-full md:w-[10%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          Delete
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedClasses.length ? (
                        displayedClasses.map((classItem, index) => (
                          <tr
                            key={classItem.class_id}
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
                                {classItem.departmentname}
                              </p>
                            </td>
                            <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                              <p className="text-gray-900 whitespace-no-wrap relative top-2">
                                {classItem.teachername}
                              </p>
                            </td>
                            <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                              <p className="text-gray-900 whitespace-no-wrap relative top-2">
                                {classItem.role}
                              </p>
                            </td>

                            <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                              <button
                                className="text-blue-600 hover:text-blue-800 hover:bg-transparent"
                                onClick={() => handleEdit(classItem)}
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                            </td>
                            <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                              <button
                                className="text-red-600 hover:text-red-800 hover:bg-transparent"
                                onClick={() => handleDelete(classItem.class_id)}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={6}
                            className="text-center py-6 text-red-700 text-lg"
                          >
                            Oops! No data found..
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
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
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="flex justify-between p-3">
                  <h5 className="modal-title">Create New Class</h5>
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
                  <div className=" relative -top-1 mb-3 flex justify-center  mx-4">
                    <label htmlFor="newDepartmentId" className="w-1/2 mt-2">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="form-control"
                      id="newDepartmentId shadow-md"
                      value={newDepartmentId}
                      onChange={handleChangeDepartmentId}
                    >
                      <option value="">Select</option>
                      {departments.map((department) => (
                        <option
                          key={department.department_id}
                          value={department.department_id}
                        >
                          {department.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute top-9 left-1/3">
                      {fieldErrors.department_id && (
                        <span className="text-danger text-xs">
                          {fieldErrors.department_id}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Staff Name */}
                  <div className="mb-3">
                    <label className="block mb-1">
                      Staff <span className="text-red-500">*</span>
                    </label>
                    <Select
                      options={staffNames}
                      value={selectedStaff}
                      onChange={(opt) => {
                        setSelectedStaff(opt);
                        setFieldErrors((prev) => ({ ...prev, staff: "" }));
                      }}
                      placeholder="Select Staff"
                      className="w-full"
                      isSearchable
                      isClearable
                    />
                    {fieldErrors.staff && (
                      <p className="text-red-500 text-xs">
                        {fieldErrors.staff}
                      </p>
                    )}
                  </div>

                  {/* Role */}
                  <div className="mb-3">
                    <label className="block mb-1">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <Select
                      options={roleOptions}
                      value={selectedRole}
                      onChange={(opt) => {
                        setSelectedRole(opt);
                        setFieldErrors((prev) => ({ ...prev, role: "" }));
                      }}
                      placeholder="Select Role"
                      className="w-full"
                      isSearchable
                      isClearable
                    />
                    {fieldErrors.role && (
                      <p className="text-red-500 text-xs">{fieldErrors.role}</p>
                    )}
                  </div>
                </div>
                <div className=" flex justify-end p-3">
                  <button
                    type="button"
                    className="btn btn-primary px-3 mb-2 "
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal show" style={{ display: "block" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="flex justify-between p-3">
                  <h5 className="modal-title">Edit Class</h5>
                  <RxCross1
                    className="float-end relative mt-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                    type="button"
                    onClick={handleCloseModal}
                  />
                </div>

                <div
                  className="relative mb-3 h-1 w-[97%] mx-auto"
                  style={{ backgroundColor: "#C03078" }}
                ></div>

                <div className="modal-body">
                  {/* Department Dropdown */}
                  <div className="relative mb-3 flex justify-center mx-4">
                    <label htmlFor="newDepartmentId" className="w-1/2 mt-2">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="form-control shadow-md w-full"
                      id="newDepartmentId"
                      value={newDepartmentId}
                      onChange={handleChangeDepartmentId}
                    >
                      <option value="">Select</option>
                      {departments.map((department) => (
                        <option
                          key={department.department_id}
                          value={department.department_id}
                        >
                          {department.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute top-9 left-1/3 w-2/3">
                      {fieldErrors.department && (
                        <span className="text-danger text-xs">
                          {fieldErrors.department}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Staff Dropdown */}
                  <div className="mb-3 px-4">
                    <label className="block mb-1">
                      Staff Name <span className="text-red-500">*</span>
                    </label>
                    <Select
                      options={staffNames}
                      value={selectedStaff}
                      onChange={(opt) => {
                        setSelectedStaff(opt);
                        setFieldErrors((prev) => ({ ...prev, staff: "" }));
                      }}
                      placeholder="Select Staff"
                      className="w-full"
                      isSearchable
                      isClearable
                    />
                    {fieldErrors.staff && (
                      <p className="text-red-500 text-xs mt-1">
                        {fieldErrors.staff}
                      </p>
                    )}
                  </div>

                  {/* Role Dropdown */}
                  <div className="mb-3 px-4">
                    <label className="block mb-1">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <Select
                      options={roleOptions}
                      value={selectedRole}
                      onChange={(opt) => {
                        setSelectedRole(opt);
                        setFieldErrors((prev) => ({ ...prev, role: "" }));
                      }}
                      placeholder="Select Role"
                      className="w-full"
                      isSearchable
                      isClearable
                    />
                    {fieldErrors.role && (
                      <p className="text-red-500 text-xs mt-1">
                        {fieldErrors.role}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end p-3">
                  <button
                    type="button"
                    className="btn btn-primary px-3 mb-2"
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
                  <h5 className="modal-title">Delete Class</h5>
                  <RxCross1
                    className="float-end relative mt-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                    type="button"
                    // className="btn-close text-red-600"
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
                    Are you sure you want to delete this class{" "}
                    {currentClass?.name}?
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

export default AllotSpecialRole;
