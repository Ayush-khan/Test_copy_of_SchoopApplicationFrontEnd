import { useEffect, useState, useRef } from "react";
import axios from "axios";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RxCross1 } from "react-icons/rx";

function Menus() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [menus, setMenus] = useState([]);
  const [allMenus, setAllMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentMenu, setCurrentMenu] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    parent_id: "",
    sequence: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const pageSize = 10;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");
  const fetchMenus = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) throw new Error("No authentication token found");

      const [allMenusResponse, paginatedResponse] = await Promise.all([
        axios.get(`${API_URL}/api/menus`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }),
        axios.get(`${API_URL}/api/menus`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }),
      ]);

      setAllMenus(allMenusResponse.data);
      setMenus(paginatedResponse.data);
      setPageCount(Math.ceil(paginatedResponse.data.length / pageSize));
    } catch (error) {
      console.error("Error fetching menus:", error);
      setErrors({ fetch: error.message });
    } finally {
      setLoading(false);
    }
  };

  const getParentName = (parentId) => {
    const parentMenu = allMenus.find((menu) => menu.menu_id === parentId);
    return parentMenu ? parentMenu.name : "None";
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const handleEdit = (menu) => {
    setCurrentMenu(menu);
    setFormData({
      name: menu.name,
      url: menu.url,
      parent_id: menu.parent_id,
      sequence: menu.sequence,
    });
    setShowEditModal(true);
  };

  const handleAdd = () => {
    setFormData({ name: "", url: "", parent_id: "", sequence: "" });
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setCurrentMenu(null);
    setErrors({});
  };
  const handleSubmitAdd = async () => {
    if (isSubmitting) return;

    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = "This field is required";
    if (!formData.url?.trim()) newErrors.url = "This field is required";
    if (!formData.sequence?.toString().trim())
      newErrors.sequence = "This field is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      await axios.post(`${API_URL}/api/menus`, formData, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      fetchMenus();
      handleCloseModal();
      toast.success("Menu added successfully!");
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        console.error("Error adding menu:", error);
        setErrors({ add: error.message });
      }
    } finally {
      setIsSubmitting(false);
      // setShowAddModal(false);
    }
  };
  const handleSubmitEdit = async () => {
    if (isSubmitting) return;

    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = "This field is required";
    if (!formData.url?.trim()) newErrors.url = "This field is required";
    if (!formData.sequence?.toString().trim())
      newErrors.sequence = "This field is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      await axios.put(`${API_URL}/api/menus/${currentMenu.menu_id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      fetchMenus();
      handleCloseModal();
      toast.success("Menu updated successfully!");
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        // return;
      } else {
        console.error("Error editing menu:", error);
        setErrors({ edit: error.message });
        // return;
      }
    } finally {
      setIsSubmitting(false);
      // setShowEditModal(false);
    }
  };

  const handleDelete = (id) => {
    const menuToDelete = menus.find((menu) => menu.menu_id === id);
    setCurrentMenu({ menuToDelete });
    setShowDeleteModal(true);
  };

  const handleSubmitDelete = async () => {
    if (isSubmitting) return; // Prevent re-submitting
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");

      if (!token || !currentMenu?.menuToDelete?.menu_id)
        throw new Error("Menu ID is missing");

      await axios.delete(
        `${API_URL}/api/menus/${currentMenu.menuToDelete.menu_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      fetchMenus();
      setShowDeleteModal(false);
      setCurrentMenu(null);
      toast.success("Menu deleted successfully!");
    } catch (error) {
      console.error("Error deleting role:", error);

      // Prefer backend message if available
      const backendMessage = error?.response?.data?.message;
      if (backendMessage) {
        toast.error(backendMessage);
      } else {
        toast.error("Error deleting role.");
      }
    } finally {
      setIsSubmitting(false);
      setShowDeleteModal(false);
    }
  };
  useEffect(() => {
    const trimmedSearch = searchTerm.trim().toLowerCase();

    if (trimmedSearch !== "" && prevSearchTermRef.current === "") {
      previousPageRef.current = currentPage;
      setCurrentPage(0); // Go to first page on new search
    }

    if (trimmedSearch === "" && prevSearchTermRef.current !== "") {
      setCurrentPage(previousPageRef.current); // Restore previous page on clear
    }

    prevSearchTermRef.current = trimmedSearch;
  }, [searchTerm]);

  const searchLower = searchTerm.trim().toLowerCase();
  const filteredMenus = menus.filter(
    (menu) =>
      menu.name?.toLowerCase().includes(searchLower) ||
      menu.url?.toLowerCase().includes(searchLower) ||
      String(menu.parent_id).includes(searchLower) ||
      String(menu.sequence).includes(searchLower)
  );

  useEffect(() => {
    setPageCount(Math.ceil(filteredMenus.length / pageSize));
  }, [filteredMenus, pageSize]);

  const displayedMenus = filteredMenus.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  // if (loading) return <p>Loading...</p>;
  // if (errors.fetch) return <p>Error: {errors.fetch}</p>;

  return (
    <>
      <ToastContainer />
      <div className="container md:mt-4">
        <div className="card mx-auto lg:w-[90%] shadow-lg">
          <div className="card-header flex justify-between items-center">
            <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
              Menus
            </h3>

            <div className="d-flex align-items-center">
              <input
                type="text"
                className="form-control me-3"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                className="btn btn-primary btn-sm"
                style={{
                  display: "flex",
                  alignItems: "center",
                  height: "36px",
                }}
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
                      <th className="w-full md:w-[8%] px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Sr.No
                      </th>
                      <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Name
                      </th>
                      <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        URL
                      </th>
                      <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Parent
                      </th>
                      <th className="w-full md:w-[10%] px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Sequence
                      </th>
                      <th className=" w-full md:w-[10%] px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Edit
                      </th>
                      <th className=" w-full md:w-[10%] px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
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
                    ) : displayedMenus.length ? (
                      displayedMenus.map((menu, index) => (
                        <tr
                          key={menu?.menu_id}
                          className={`${
                            index % 2 === 0 ? "bg-white" : "bg-gray-100"
                          } hover:bg-gray-50`}
                        >
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {currentPage * pageSize + index + 1}{" "}
                            </p>
                          </td>
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {menu?.name}
                            </p>
                          </td>
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {menu?.url}
                            </p>
                          </td>
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {getParentName(menu.parent_id)}
                            </p>
                          </td>
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {menu?.sequence}
                            </p>
                          </td>{" "}
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <button
                              className="text-blue-600 hover:text-blue-800 hover:bg-transparent"
                              onClick={() => handleEdit(menu)}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                          </td>
                          <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                            <button
                              onClick={() => handleDelete(menu.menu_id)}
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
                pageCount={pageCount}
                marginPagesDisplayed={1}
                pageRangeDisplayed={1}
                onPageChange={handlePageClick}
                containerClassName={"pagination"}
                activeClassName={"active"}
                pageClassName={"page-item"}
                pageLinkClassName={"page-link"}
                previousClassName={"page-item"}
                nextClassName={"page-item"}
                previousLinkClassName={"page-link"}
                nextLinkClassName={"page-link"}
                breakClassName={"page-item"}
                breakLinkClassName={"page-link"}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add Menu Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal show" style={{ display: "block" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="flex justify-between px-3 py-2">
                  <h5 className="modal-title">Add New Menu</h5>
                  <RxCross1
                    className="float-end relative top-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                    type="button"
                    onClick={handleCloseModal}
                  />
                </div>
                <div
                  className="relative mb-3 h-1 w-[97%] mx-auto bg-red-700"
                  style={{ backgroundColor: "#C03078" }}
                ></div>
                <div className="modal-body w-full md:w-[85%] mx-auto">
                  {/* Name */}
                  <div className="relative mb-3 flex justify-center mx-2">
                    <label htmlFor="menuName" className="w-1/2 mt-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control shadow-md mb-2"
                      id="menuName"
                      value={formData?.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        setErrors((prev) => ({ ...prev, name: "" }));
                      }}
                    />
                    <div className="absolute top-9 left-1/3">
                      {errors.name && (
                        <span className="text-danger text-xs">
                          {errors.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* URL */}
                  <div className="relative mb-3 flex justify-center mx-2">
                    <label htmlFor="menuUrl" className="w-1/2 mt-2">
                      URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control shadow-md mb-2"
                      id="menuUrl"
                      value={formData.url}
                      onChange={(e) => {
                        setFormData({ ...formData, url: e.target.value });
                        setErrors((prev) => ({ ...prev, url: "" }));
                      }}
                    />
                    <div className="absolute top-9 left-1/3">
                      {errors.url && (
                        <span className="text-danger text-xs">
                          {errors.url}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Parent Menu */}
                  <div className="relative mb-3 flex justify-center mx-2">
                    <label htmlFor="parentId" className="w-1/2 mt-2">
                      Parent
                    </label>
                    <select
                      className="form-control shadow-md mb-2"
                      id="parentId"
                      value={formData.parent_id}
                      onChange={(e) => {
                        setFormData({ ...formData, parent_id: e.target.value });
                        setErrors((prev) => ({ ...prev, parent_id: "" }));
                      }}
                    >
                      <option value="">None</option>
                      {[
                        ...new Map(
                          allMenus.map((menu) => [menu.menu_id, menu])
                        ).values(),
                      ].map((menu) => (
                        <option key={menu.menu_id} value={menu.menu_id}>
                          {menu.name}
                        </option>
                      ))}

                      {/* {allMenus
                        .filter((menu) => menu.parent_id === 0)
                        .map((menu) => (
                          <option key={menu.menu_id} value={menu.menu_id}>
                            {menu.name}
                          </option>
                        ))} */}
                    </select>
                    <div className="absolute top-9 left-1/3">
                      {errors.parent_id && (
                        <span className="text-danger text-xs">
                          {errors.parent_id}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Sequence */}
                  <div className="relative mb-3 flex justify-center mx-2">
                    <label htmlFor="menuSequence" className="w-1/2 mt-2">
                      Sequence <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control shadow-md "
                      id="menuSequence"
                      value={formData.sequence}
                      onChange={(e) => {
                        setFormData({ ...formData, sequence: e.target.value });
                        setErrors((prev) => ({ ...prev, sequence: "" }));
                      }}
                    />
                    <div className="absolute top-9 left-1/3">
                      {errors.sequence && (
                        <span className="text-danger text-xs">
                          {errors.sequence}
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
                {/* Submit Button */}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Edit Menu Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal show" style={{ display: "block" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="flex justify-between px-3 py-2">
                  <h5 className="modal-title">Edit Menu</h5>
                  <RxCross1
                    className="float-end relative top-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                    type="button"
                    onClick={handleCloseModal}
                  />
                </div>
                <div
                  className="relative mb-3 h-1 w-[97%] mx-auto bg-red-700"
                  style={{ backgroundColor: "#C03078" }}
                ></div>
                <div className="modal-body w-full md:w-[85%] mx-auto">
                  {/* Name */}
                  <div className="relative mb-3 flex justify-center mx-2">
                    <label htmlFor="editMenuName" className="w-1/2 mt-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control shadow-md mb-2"
                      id="editMenuName"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        setErrors((prev) => ({ ...prev, name: "" }));
                      }}
                    />
                    <div className="absolute top-9 left-1/3">
                      {errors.name && (
                        <span className="text-danger text-xs">
                          {errors.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* URL */}
                  <div className="relative mb-3 flex justify-center mx-2">
                    <label htmlFor="editMenuUrl" className="w-1/2 mt-2">
                      URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control shadow-md mb-2"
                      id="editMenuUrl"
                      value={formData.url}
                      onChange={(e) => {
                        setFormData({ ...formData, url: e.target.value });
                        setErrors((prev) => ({ ...prev, url: "" }));
                      }}
                    />
                    <div className="absolute top-9 left-1/3">
                      {errors.url && (
                        <span className="text-danger text-xs">
                          {errors.url}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Parent */}
                  <div className="relative mb-3 flex justify-center mx-2">
                    <label htmlFor="editParentId" className="w-1/2 mt-2">
                      Parent
                    </label>
                    <select
                      className="form-control shadow-md mb-2"
                      id="editParentId"
                      value={formData.parent_id}
                      onChange={(e) => {
                        setFormData({ ...formData, parent_id: e.target.value });
                        setErrors((prev) => ({ ...prev, parent_id: "" }));
                      }}
                    >
                      <option value="">None</option>
                      {allMenus
                        .filter((menu) => menu.parent_id === 0)
                        .map((menu) => (
                          <option key={menu.menu_id} value={menu.menu_id}>
                            {menu.name}
                          </option>
                        ))}
                    </select>
                    <div className="absolute top-9 left-1/3">
                      {errors.parent_id && (
                        <span className="text-danger text-xs">
                          {errors.parent_id}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Sequence */}
                  <div className="relative mb-3 flex justify-center mx-2">
                    <label htmlFor="editMenuSequence" className="w-1/2  mt-2">
                      Sequence <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control shadow-md "
                      id="editMenuSequence"
                      value={formData.sequence}
                      onChange={(e) => {
                        setFormData({ ...formData, sequence: e.target.value });
                        setErrors((prev) => ({ ...prev, sequence: "" }));
                      }}
                    />
                    <div className="absolute top-9 left-1/3">
                      {errors.sequence && (
                        <span className="text-danger text-xs">
                          {errors.sequence}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit */}
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

      {/* Delete Menu Modal */}

      {showDeleteModal && (
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

                  {console.log("Delete-->", currentMenu)}
                </div>
                <div
                  className=" relative  mb-3 h-1 w-[97%] mx-auto bg-red-700"
                  style={{
                    backgroundColor: "#C03078",
                  }}
                ></div>
                <div className="modal-body">
                  Are you sure you want to delete this menu{" "}
                  {` ${currentMenu?.menuToDelete?.name} `} ?
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

export default Menus;
