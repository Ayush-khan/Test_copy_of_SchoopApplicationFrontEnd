import axios from "axios";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RxCross1 } from "react-icons/rx";

function SpecialUserAllotment() {
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

  const [roleId, setRoleId] = useState("");
  const [data, setData] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [selectAllChecked, setSelectAllChecked] = useState(false);

  useEffect(() => {
    fetchDataRoleId();
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      const academicYr = localStorage.getItem("academicYear");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(`${API_URL}/api/get_admission_users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Academic-Year": academicYr,
        },
        withCredentials: true,
      });

      //   setClasses(response.data.data);
      //   console.log("data", response.data.data);

      setClasses(
        response.data.data.map((item) => ({
          ...item,
          is_special_user:
            item.is_special_user === true || item.is_special_user === "Y",
        })),
      );
      setPageCount(Math.ceil(response?.data?.length / pageSize));
    } catch (error) {
      setError(error.message);
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
      // Fetch session data
      const sessionResponse = await axios.get(`${API_URL}/api/sessionData`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRoleId(sessionResponse?.data?.user.role_id);

      console.log("roleIDis:", roleId);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
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

  const camelCase = (str) =>
    str
      ?.toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  // Apply filtering logic
  const searchLower = searchTerm.trim().toLowerCase();
  const filteredClasses = classes.filter((cls) => {
    return (
      (cls.parent_name || "").toLowerCase().includes(searchLower) ||
      (cls.email || "").toLowerCase().includes(searchLower) ||
      (cls.phone_no || "").toLowerCase().includes(searchLower) ||
      (cls.user_id || "").toLowerCase().includes(searchLower) ||
      (cls.user_type || "").toLowerCase().includes(searchLower)
    );
  });

  useEffect(() => {
    setPageCount(Math.ceil(filteredClasses.length / pageSize));
  }, [filteredClasses, pageSize]);

  const displayedClasses = filteredClasses.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize,
  );

  const handleSelectAll = async (e) => {
    const isChecked = e.target.checked;
    const token = localStorage.getItem("authToken");

    const ids = filteredClasses.map((item) => item.nar_id);

    setClasses((prev) =>
      prev.map((row) =>
        ids.includes(row.nar_id) ? { ...row, is_special_user: isChecked } : row,
      ),
    );

    try {
      await Promise.all(
        ids.map((id) =>
          axios.post(
            `${API_URL}/api/update_special_user`,
            {
              nar_id: id,
              special_user: isChecked ? "Y" : "N",
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          ),
        ),
      );

      console.log("All users updated");
    } catch (error) {
      console.error("Bulk update failed:", error);

      setClasses((prev) =>
        prev.map((row) =>
          ids.includes(row.nar_id)
            ? { ...row, is_special_user: !isChecked }
            : row,
        ),
      );
    }
  };

  const confirmSelectAll = async () => {
    const token = localStorage.getItem("authToken");
    const ids = filteredClasses.map((item) => item.nar_id);

    // optimistic update
    setClasses((prev) =>
      prev.map((row) =>
        ids.includes(row.nar_id)
          ? { ...row, is_special_user: selectAllChecked }
          : row,
      ),
    );

    try {
      await Promise.all(
        ids.map((id) =>
          axios.post(
            `${API_URL}/api/update_special_user`,
            {
              nar_id: id,
              special_user: selectAllChecked ? "Y" : "N",
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          ),
        ),
      );
    } catch (error) {
      console.error("Bulk update failed:", error);

      // rollback
      setClasses((prev) =>
        prev.map((row) =>
          ids.includes(row.nar_id)
            ? { ...row, is_special_user: !selectAllChecked }
            : row,
        ),
      );
    }

    setShowModal(false);
  };

  const cancelSelectAll = () => {
    setShowModal(false);
  };
  const handleSpecialUserChange = async (e, item) => {
    const isChecked = e.target.checked;
    const token = localStorage.getItem("authToken");

    // optimistic update
    setClasses((prev) =>
      prev.map((row) =>
        row.nar_id === item.nar_id
          ? { ...row, is_special_user: isChecked }
          : row,
      ),
    );

    try {
      await axios.post(
        `${API_URL}/api/update_special_user`,
        {
          nar_id: item.nar_id,
          special_user: isChecked ? "Y" : "N",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(
        `User marked as ${isChecked ? "Special User" : "Normal User"} successfully.`,
      );
    } catch (error) {
      console.error("Error updating special user:", error);

      // rollback
      setClasses((prev) =>
        prev.map((row) =>
          row.nar_id === item.nar_id
            ? { ...row, is_special_user: !isChecked }
            : row,
        ),
      );

      toast.error("Failed to update special user");
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="container mt-4">
        <div className="card mx-auto lg:w-full shadow-lg">
          <div className="p-2 px-3 bg-gray-100 flex justify-between items-center">
            <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
              Special User Allotment
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
              className={`h-96 lg:h-96 overflow-y-scroll lg:overflow-x-hidden mx-auto ${"w-full md:w-[84%]"}`}
            >
              <div className="bg-white rounded-lg shadow-xs">
                {!roleId ? (
                  <div className="flex justify-center items-center w-full h-[50vh]">
                    <div className="text-xl text-blue-700 text-center">
                      Please wait while data is loading...
                    </div>
                  </div>
                ) : loading ? (
                  <div className="flex justify-center items-center w-full h-[50vh]">
                    <div className="text-xl text-blue-700 text-center">
                      Please wait while data is loading...
                    </div>
                  </div>
                ) : (
                  <table className="min-w-full leading-normal table-auto">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="px-2 text-center  lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          Sr.No
                        </th>
                        <th className="px-2 text-center   lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          Parent Name
                        </th>
                        <th className="px-2  text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          Email
                        </th>
                        <th className="px-2  text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          Phone No.
                        </th>

                        <th className="px-2  text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          User Id
                        </th>

                        {/* <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          Special User
                        </th> */}
                        <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          <div>Special User</div>
                          {console.log(filteredClasses.length)}
                          <input
                            type="checkbox"
                            checked={
                              filteredClasses.length > 0 &&
                              filteredClasses.every(
                                (item) => item.is_special_user,
                              )
                            }
                            onChange={(e) => {
                              setSelectAllChecked(e.target.checked);
                              setShowModal(true);
                            }}
                          />
                        </th>

                        {/* <th className="px-2  text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          Edit
                        </th> */}
                        {/* <th className="px-2 w-full md:w-[10%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          Delete
                        </th> */}
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
                                {camelCase(classItem.parent_name)}
                              </p>
                            </td>
                            <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                              <p className="text-gray-900 whitespace-no-wrap relative top-2">
                                {classItem.email}
                              </p>
                            </td>
                            <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                              <p className="text-gray-900 whitespace-no-wrap relative top-2">
                                {classItem.phone_no}
                              </p>
                            </td>

                            <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                              <p className="text-gray-900 whitespace-no-wrap relative top-2">
                                {classItem.user_id}
                              </p>
                            </td>

                            <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                              <input
                                type="checkbox"
                                className="w-4 h-4 cursor-pointer"
                                checked={
                                  classItem.is_special_user === true ||
                                  classItem.is_special_user === "Y"
                                }
                                onChange={(e) =>
                                  handleSpecialUserChange(e, classItem)
                                }
                              />
                            </td>
                            {/* <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                              <button
                                className="text-blue-600 hover:text-blue-800 hover:bg-transparent"
                                onClick={() => handleEdit(classItem)}
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                            </td> */}
                            {/* <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                                <button
                                  className="text-red-600 hover:text-red-800 hover:bg-transparent"
                                  onClick={() =>
                                    handleDelete(classItem.class_id)
                                  }
                                >
                                  <FontAwesomeIcon icon={faTrash} />
                                </button>
                              </td> */}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={7}
                            className="text-center py-6 text-red-700 text-lg"
                          >
                            No data found.
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

        {showModal && (
          <div className="fixed inset-0 z-50   flex items-center justify-center bg-black bg-opacity-50">
            <div className="modal show " style={{ display: "block" }}>
              <div className="modal-dialog  modal-dialog-centered">
                <div className="modal-content">
                  <div className="flex justify-between p-3">
                    <h5 className="modal-title">Confirm Action</h5>
                    <RxCross1
                      className="float-end relative mt-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                      type="button"
                      onClick={cancelSelectAll}
                    />
                  </div>
                  <div
                    className=" relative  mb-3 h-1 w-[100%] mx-auto bg-red-700"
                    style={{
                      backgroundColor: "#C03078",
                    }}
                  ></div>
                  <div className="modal-body">
                    <p className="text-sm text-gray-600 mb-6">
                      Are you sure you want to{" "}
                      {selectAllChecked
                        ? "mark all as Special users"
                        : "mark all as Normal users"}
                      ?
                    </p>
                  </div>
                  <div className="flex justify-end gap-3 mb-3 mr-3">
                    <button
                      onClick={cancelSelectAll}
                      className="px-4 py-1 bg-gray-300 rounded hover:bg-gray-400"
                    >
                      No
                    </button>

                    <button
                      onClick={confirmSelectAll}
                      className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Yes
                    </button>
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

export default SpecialUserAllotment;
