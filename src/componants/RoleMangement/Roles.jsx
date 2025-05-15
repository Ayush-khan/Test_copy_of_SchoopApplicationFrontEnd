import { useEffect, useState, useRef } from "react";
import axios from "axios";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faPlus,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RxCross1 } from "react-icons/rx";
import { FaCheck } from "react-icons/fa";

function Roles() {
  const API_URL = import.meta.env.VITE_API_URL; // URL for host
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleID, setNewnewRoleID] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [newStatus, setNewStatus] = useState("A");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [fieldErrors, setFieldErrors] = useState({}); // For field-specific errors
  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");
  const pageSize = 10;
  const [showDActiveModal, setShowDActiveModal] = useState(false);
  const [currentStudentDataForActivate, setCurrentStudentDataForActivate] =
    useState(null);
  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(`${API_URL}/api/roles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      setRoles(response.data.data);
      setPageCount(Math.ceil(response.data.data.length / pageSize));
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const handleEdit = (role) => {
    setCurrentRole(role);
    setNewRoleName(role.name);
    setNewnewRoleID(role?.role_id);
    setNewStatus(role?.is_active);
    setShowEditModal(true);
  };

  const handleAdd = () => {
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowDActiveModal(false);
    setFieldErrors({});
    setError(null);
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setNewRoleName("");
    setNewnewRoleID("");
    setNewStatus("");
    setCurrentRole(null);
  };
  const validateRoleForm = (rolename, role_id) => {
    const errors = {};

    if (!role_id || role_id.trim() === "") {
      errors.role_id = "Role ID is required.";
    }

    if (!rolename || rolename.trim() === "") {
      errors.rolename = "Role Name is required.";
    } else if (!/^[A-Za-z0-9 ]+$/.test(rolename)) {
      errors.rolename =
        "Role Name can only contain letters, numbers, and spaces.";
    } else if (rolename.length > 30) {
      errors.rolename = "Role Name must not exceed 30 characters.";
    }

    return errors;
  };
  const handleChangeRoleID = (e) => {
    const value = e.target.value;
    setNewnewRoleID(value);
    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      role_id: validateRoleForm(newRoleName, value).role_id,
    }));
  };

  const handleChangeRoleName = (e) => {
    const value = e.target.value;
    setNewRoleName(value);
    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      rolename: validateRoleForm(value, newRoleID).rolename,
    }));
  };
  const handleActiveAndInactive = (roleIsPass) => {
    console.log("handleActiveAndInactive-->", roleIsPass.role_id);
    const studentToActiveOrDeactive = roles.find(
      (cls) => cls.role_id === roleIsPass.role_id
    );
    setCurrentStudentDataForActivate({ studentToActiveOrDeactive });
    console.log("studentToActiveOrDeactive", studentToActiveOrDeactive);
    setShowDActiveModal(true);
  };
  const handleActivateOrNot = async () => {
    if (isSubmitting) return; // Prevent re-submitting
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");

      console.log(
        "the classes inside the delete",
        currentStudentDataForActivate?.studentToActiveOrDeactive?.role_id
      );

      if (
        !token ||
        !currentStudentDataForActivate ||
        !currentStudentDataForActivate?.studentToActiveOrDeactive?.role_id
      ) {
        throw new Error("Role ID is missing");
      }

      const response = await axios.put(
        `${API_URL}/api/update_activeinactiverole/${currentStudentDataForActivate?.studentToActiveOrDeactive?.role_id}`,
        {}, // Empty data object
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchRoles();

      setShowDActiveModal(false);
      toast.success(response?.data?.message);
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error(`Error in active or deactive roles: ${error.message}`);
      }
      console.error("Error in active or deactive roles:", error);
    } finally {
      setIsSubmitting(false); // Re-enable the button after the operation
      setShowDActiveModal(false);
    }
  };
  const handleChangeStatus = (e) => {
    const value = e.target.value;
    console.log("value:-->", value);
    setNewStatus(value);
    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      is_active: "", // Clear backend error if present
    }));
  };

  const handleSubmitAdd = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const validationErrors = validateRoleForm(newRoleName, newRoleID);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      await axios.post(
        `${API_URL}/api/roles`,
        { rolename: newRoleName, role_id: newRoleID },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      fetchRoles();
      handleCloseModal();
      toast.success("Role added successfully!");
    } catch (error) {
      console.error("Error adding role:", error);

      // Handle backend validation errors
      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        const formattedErrors = {};

        if (backendErrors.role_id) {
          formattedErrors.role_id = backendErrors.role_id[0];
        }

        if (backendErrors.rolename) {
          formattedErrors.rolename = backendErrors.rolename[0];
        }

        setFieldErrors(formattedErrors);
      } else {
        toast.error("Error adding role.");
      }
    } finally {
      setIsSubmitting(false);
      // setShowAddModal(false);
    }
  };
  const handleSubmitEdit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const validationErrors = validateRoleForm(newRoleName, newRoleID);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      await axios.put(
        `${API_URL}/api/roles/${currentRole.role_id}`,
        {
          rolename: newRoleName,
          role_id: newRoleID, // include this if your backend allows updating the ID
          // is_active: newStatus, // Removed since you excluded status from the form
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      fetchRoles();
      handleCloseModal();
      toast.success("Role updated successfully!");
    } catch (error) {
      console.error("Error editing role:", error);

      const errData = error.response?.data;

      if (errData?.errors || errData?.message) {
        const formattedErrors = {};

        if (errData.errors?.rolename) {
          formattedErrors.rolename = errData.errors.rolename[0];
        }

        if (errData.errors?.role_id) {
          formattedErrors.role_id = errData.errors.role_id[0];
        }

        if (
          errData.message ===
          "Role cannot be deactivated as it is being used in another table."
        ) {
          formattedErrors.is_active =
            "Role can not be deactivated as it's being used.";
        }

        setFieldErrors((prev) => ({
          ...prev,
          ...formattedErrors,
        }));
      } else {
        toast.error("Error updating role.");
      }
    } finally {
      setIsSubmitting(false);
      // setShowEditModal(false);
    }
  };

  const handleDelete = (id) => {
    console.log("fdh");
    const roleToDelete = roles.find((role) => role.role_id === id);
    setCurrentRole({ roleToDelete });
    setShowDeleteModal(true);
  };

  const handleSubmitDelete = async () => {
    if (isSubmitting) return; // Prevent re-submitting
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");

      if (!token || !currentRole?.roleToDelete?.role_id) {
        throw new Error("Role ID is missing");
      }

      await axios.delete(
        `${API_URL}/api/roles/${currentRole.roleToDelete.role_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      fetchRoles();
      setShowDeleteModal(false);
      setCurrentRole(null);
      toast.success("Role deleted successfully!");
    } catch (error) {
      console.error("Error deleting role:", error);

      // Prefer backend message if available
      const backendMessage = error?.response?.data?.message;
      if (backendMessage) {
        toast.error(backendMessage);
      } else {
        toast.error("Error deleting role.");
      }

      setError(error.message);
    } finally {
      setIsSubmitting(false);
      setShowDeleteModal(false);
    }
  };

  useEffect(() => {
    const trimmedSearch = searchTerm.trim().toLowerCase();

    if (trimmedSearch !== "" && prevSearchTermRef.current === "") {
      previousPageRef.current = currentPage; // Save page before search
      setCurrentPage(0); // Jump to first page when searching
    }

    if (trimmedSearch === "" && prevSearchTermRef.current !== "") {
      setCurrentPage(previousPageRef.current); // Restore page when clearing search
    }

    prevSearchTermRef.current = trimmedSearch;
  }, [searchTerm]);

  const searchLower = searchTerm.trim().toLowerCase();
  const filteredRoles = roles.filter((role) =>
    [role?.name, role?.role_id, role?.is_active].some((field) =>
      field?.toString().toLowerCase().includes(searchLower)
    )
  );
  useEffect(() => {
    setPageCount(Math.ceil(filteredRoles.length / pageSize));
  }, [filteredRoles, pageSize]);

  const displayedRoles = filteredRoles.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  return (
    <>
      <ToastContainer />

      <div className="container md:mt-4">
        <div className="card mx-auto lg:w-3/4 shadow-lg">
          <div className="card-header flex justify-between items-center">
            <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
              Roles
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
            className=" relative w-[97%]  -top-0.5 mb-3 h-1  mx-auto bg-red-700"
            style={{
              backgroundColor: "#C03078",
            }}
          ></div>

          <div className="card-body w-full">
            <div className="h-96 lg:h-96 overflow-y-scroll lg:overflow-x-hidden">
              <div className="bg-white rounded-lg shadow-xs">
                <table className="min-w-full leading-normal table-auto">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="w-full md:w-[11%] px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Sr.No
                      </th>
                      <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Name
                      </th>
                      <th className="w-full md:w-[11%] px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Role Id
                      </th>
                      <th className="w-full md:w-[11%] px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Status
                      </th>
                      <th className="w-full md:w-[11%] px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Edit
                      </th>
                      <th className="w-full md:w-[11%] px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
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
                    ) : displayedRoles.length ? (
                      displayedRoles.map((role, index) => (
                        <tr
                          key={role.id}
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
                              {role?.name}
                            </p>
                          </td>
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {role?.role_id}
                            </p>
                          </td>
                          <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm hover:bg-none">
                            <button
                              onClick={() => handleActiveAndInactive(role)}
                              className={`  font-bold hover:bg-none ${
                                role?.is_active === "Y"
                                  ? "text-green-600 hover:text-green-800 hover:bg-transparent"
                                  : "text-red-700 hover:text-red-900  hover:bg-transparent"
                              }`}
                            >
                              {role?.is_active === "Y" ? (
                                <FaCheck className="text-xl" />
                              ) : (
                                <FontAwesomeIcon
                                  icon={faXmark}
                                  className="text-xl"
                                />
                              )}
                            </button>
                          </td>
                          {/* <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {role.is_active === "Y" ? "Active" : "Inactive"}
                            </p>
                          </td> */}
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <button
                              className="text-blue-600 hover:text-blue-800 hover:bg-transparent"
                              onClick={() => handleEdit(role)}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                          </td>
                          <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                            <button
                              onClick={() => handleDelete(role.role_id)}
                              className="text-red-600 hover:text-red-800 hover:bg-transparent "
                            >
                              <FontAwesomeIcon icon={faTrash} />
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
            <div className="flex justify-center mt-4">
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

      {/* Add Role Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50   flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal show" style={{ display: "block" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="flex justify-between px-3 py-2">
                  <h5 className="modal-title">Create New Role</h5>
                  <RxCross1
                    className="float-end relative top-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                    type="button"
                    onClick={handleCloseModal}
                  />
                </div>
                <div
                  className=" relative mb-3 h-1 w-[97%] mx-auto bg-red-700"
                  style={{
                    backgroundColor: "#C03078",
                  }}
                ></div>
                <div className="modal-body w-full md:w-[90%] mx-auto  ">
                  <div className="  relative -top-1 flex justify-center  mx-2">
                    <label htmlFor="roleName" className="w-1/2 mt-2">
                      Role Name<span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      maxLength={30}
                      className="form-control shadow-md mb-3 "
                      id="roleName"
                      value={newRoleName}
                      onChange={handleChangeRoleName}
                    />
                    <div className="absolute  top-9 left-1/3">
                      {fieldErrors.rolename && (
                        <span className="text-danger text-xs">
                          {fieldErrors.rolename}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="  relative  flex justify-center  mx-2">
                    <label htmlFor="role_id" className="w-1/2 mt-2">
                      Role ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control shadow-md mb-3"
                      id="role_id"
                      maxLength={1}
                      value={newRoleID}
                      onChange={handleChangeRoleID}
                    />
                    <div className="absolute  top-9 left-1/3">
                      {fieldErrors.role_id && (
                        <span className="text-danger text-xs">
                          {fieldErrors.role_id}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className=" flex justify-end p-3">
                  <button
                    type="button"
                    className="btn btn-primary px-3 mb-2 "
                    onClick={handleSubmitAdd}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Adding..." : "Add"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditModal && currentRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal show" style={{ display: "block" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="flex justify-between px-3 py-2">
                  <h5 className="modal-title">Edit Role</h5>
                  <RxCross1
                    className="float-end relative top-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                    type="button"
                    onClick={handleCloseModal}
                  />
                </div>
                <div
                  className="relative mb-3 h-1 w-[97%] mx-auto"
                  style={{ backgroundColor: "#C03078" }}
                ></div>
                <div className="modal-body w-full md:w-[90%] mx-auto">
                  <div className="relative flex justify-center mx-2">
                    <label htmlFor="roleName" className="w-1/2 mt-2">
                      Role Name<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={30}
                      className="form-control shadow-md mb-4"
                      id="roleName"
                      value={newRoleName}
                      onChange={handleChangeRoleName}
                    />
                    <div className="absolute top-9 left-1/3">
                      {fieldErrors.rolename && (
                        <span className="text-danger text-xs">
                          {fieldErrors.rolename}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="relative flex justify-center mx-2">
                    <label htmlFor="role_id" className="w-1/2 mt-2">
                      Role ID<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={1}
                      className="form-control shadow-md mb-3"
                      id="role_id"
                      value={newRoleID}
                      onChange={handleChangeRoleID}
                    />
                    <div className="absolute top-9 left-1/3">
                      {fieldErrors.role_id && (
                        <span className="text-danger text-xs">
                          {fieldErrors.role_id}
                        </span>
                      )}
                    </div>
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

      {showDActiveModal && (
        <div className="fixed inset-0 z-50   flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="flex justify-between p-3">
                  <h5 className="modal-title">
                    {/* Confirm Activate or Deactivate */}
                    {currentStudentDataForActivate?.studentToActiveOrDeactive
                      ?.is_active === "Y"
                      ? `Confirm Deactive`
                      : `Confirm Active`}
                  </h5>
                  <RxCross1
                    className="float-end relative mt-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                    type="button"
                    // className="btn-close text-red-600"
                    onClick={handleCloseModal}
                  />
                  {console.log(
                    "the currecnt section inside activate or not of the managesubjhect",
                    currentStudentDataForActivate
                  )}
                </div>
                <div
                  className=" relative  mb-3 h-1 w-[97%] mx-auto bg-red-700"
                  style={{
                    backgroundColor: "#C03078",
                  }}
                ></div>
                <div className="modal-body">
                  {currentStudentDataForActivate?.studentToActiveOrDeactive
                    ?.is_active === "Y"
                    ? `Are you sure you want to deactive this role ${currentStudentDataForActivate?.studentToActiveOrDeactive?.name}?`
                    : `Are you sure you want to active this role ${currentStudentDataForActivate?.studentToActiveOrDeactive?.name}?`}
                </div>

                <div className=" flex justify-end p-3">
                  <button
                    type="button"
                    className="btn btn-primary px-3 mb-2"
                    onClick={handleActivateOrNot}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Activating..." : "Active"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Role Modal */}

      {showDeleteModal && currentRole && (
        <div className="fixed inset-0 z-50   flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="flex justify-between p-3">
                  <h5 className="modal-title">Confirm Delete</h5>
                  <RxCross1
                    className="float-end relative mt-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                    type="button"
                    // className="btn-close text-red-600"
                    onClick={handleCloseModal}
                  />

                  {console.log("Delete-->", currentRole)}
                </div>
                <div
                  className=" relative  mb-3 h-1 w-[97%] mx-auto bg-red-700"
                  style={{
                    backgroundColor: "#C03078",
                  }}
                ></div>
                <div className="modal-body">
                  Are you sure you want to delete this role{" "}
                  {` ${currentRole?.roleToDelete?.name} `} ?
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

export default Roles;
