// // // import { useEffect, useState } from "react";
// // // import axios from "axios";
// // // import ReactPaginate from "react-paginate";
// // // import "bootstrap/dist/css/bootstrap.min.css";
// // // import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// // // import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
// // // import { ToastContainer, toast } from "react-toastify";
// // // import "react-toastify/dist/ReactToastify.css";

// // // function Menus() {
// // //     const API_URL = import.meta.env.VITE_API_URL;
// // //     const [menus, setMenus] = useState([]);
// // //     const [loading, setLoading] = useState(true);
// // //     const [error, setError] = useState(null);
// // //     const [showAddModal, setShowAddModal] = useState(false);
// // //     const [showEditModal, setShowEditModal] = useState(false);
// // //     const [showDeleteModal, setShowDeleteModal] = useState(false);
// // //     const [currentMenu, setCurrentMenu] = useState(null);
// // //     const [formData, setFormData] = useState({ name: "", url: "", parent_id: "", sequence: "" });
// // //     const [searchTerm, setSearchTerm] = useState("");
// // //     const [currentPage, setCurrentPage] = useState(0);
// // //     const [pageCount, setPageCount] = useState(0);
// // //     const pageSize = 10;

// // //     const fetchMenus = async () => {
// // //         try {
// // //             const token = localStorage.getItem("authToken");
// // //             const academicYr = localStorage.getItem("academicYear");

// // //             if (!token) {
// // //                 throw new Error("No authentication token found");
// // //             }

// // //             const response = await axios.get(`${API_URL}/api/menus`, {
// // //                 headers: {
// // //                     Authorization: `Bearer ${token}`,
// // //                     "X-Academic-Year": academicYr,
// // //                 },
// // //                 withCredentials: true,
// // //             });

// // //             setMenus(response.data);
// // //             setPageCount(Math.ceil(response.data.length / pageSize));
// // //         } catch (error) {
// // //             setError(error.message);
// // //         } finally {
// // //             setLoading(false);
// // //         }
// // //     };

// // //     useEffect(() => {
// // //         fetchMenus();
// // //     }, []);

// // //     const handlePageClick = (data) => {
// // //         setCurrentPage(data.selected);
// // //     };

// // //     const handleEdit = (menu) => {
// // //         setCurrentMenu(menu);
// // //         setFormData({ name: menu.name, url: menu.url, parent_id: menu.parent_id, sequence: menu.sequence });
// // //         setShowEditModal(true);
// // //     };

// // //     const handleAdd = () => {
// // //         setFormData({ name: "", url: "", parent_id: "", sequence: "" });
// // //         setShowAddModal(true);
// // //     };

// // //     const handleCloseModal = () => {
// // //         setShowAddModal(false);
// // //         setShowEditModal(false);
// // //         setShowDeleteModal(false);
// // //         setCurrentMenu(null);
// // //     };

// // //     const handleSubmitAdd = async () => {
// // //         try {
// // //             const token = localStorage.getItem("authToken");
// // //             const academicYr = localStorage.getItem("academicYear");

// // //             if (!token) {
// // //                 throw new Error("No authentication token or academic year found");
// // //             }

// // //             await axios.post(
// // //                 `${API_URL}/api/menus`,
// // //                 { ...formData },
// // //                 {
// // //                     headers: {
// // //                         Authorization: `Bearer ${token}`,
// // //                         "X-Academic-Year": academicYr,
// // //                     },
// // //                     withCredentials: true,
// // //                 }
// // //             );

// // //             fetchMenus();
// // //             handleCloseModal();
// // //             toast.success("Menu added successfully!");
// // //         } catch (error) {
// // //             console.error("Error adding menu:", error);
// // //         }
// // //     };

// // //     const handleSubmitEdit = async () => {
// // //         try {
// // //             const token = localStorage.getItem("authToken");
// // //             const academicYr = localStorage.getItem("academicYear");

// // //             if (!token) {
// // //                 throw new Error("No authentication token or academic year found");
// // //             }

// // //             await axios.put(
// // //                 `${API_URL}/api/menus/${currentMenu.menu_id}`,
// // //                 { ...formData },
// // //                 {
// // //                     headers: {
// // //                         Authorization: `Bearer ${token}`,
// // //                         "X-Academic-Year": academicYr,
// // //                     },
// // //                     withCredentials: true,
// // //                 }
// // //             );

// // //             fetchMenus();
// // //             handleCloseModal();
// // //             toast.success("Menu updated successfully!");
// // //         } catch (error) {
// // //             console.error("Error editing menu:", error);
// // //         }
// // //     };

// // //     const handleDelete = (id) => {
// // //         const menuToDelete = menus.find((menu) => menu.menu_id === id);
// // //         setCurrentMenu(menuToDelete);
// // //         setShowDeleteModal(true);
// // //     };

// // //     const handleSubmitDelete = async () => {
// // //         try {
// // //             const token = localStorage.getItem("authToken");
// // //             const academicYr = localStorage.getItem("academicYear");

// // //             if (!token || !currentMenu || !currentMenu.menu_id) {
// // //                 throw new Error("Menu ID is missing");
// // //             }

// // //             await axios.delete(
// // //                 `${API_URL}/api/menus/${currentMenu.menu_id}`,
// // //                 {
// // //                     headers: {
// // //                         Authorization: `Bearer ${token}`,
// // //                         "X-Academic-Year": academicYr,
// // //                     },
// // //                     withCredentials: true,
// // //                 }
// // //             );

// // //             fetchMenus();
// // //             setShowDeleteModal(false);
// // //             setCurrentMenu(null);
// // //             toast.success("Menu deleted successfully!");
// // //         } catch (error) {
// // //             console.error("Error deleting menu:", error);
// // //             setError(error.message);
// // //         }
// // //     };

// // //     const filteredMenus = menus.filter((menu) =>
// // //         menu.name.toLowerCase().includes(searchTerm.toLowerCase())
// // //     );

// // //     const displayedMenus = filteredMenus.slice(
// // //         currentPage * pageSize,
// // //         (currentPage + 1) * pageSize
// // //     );

// // //     if (loading) return <p>Loading...</p>;
// // //     if (error) return <p>Error: {error}</p>;

// // //     return (
// // //         <>
// // //             <ToastContainer />

// // //             <div className="container mt-4">
// // //                 <div className="card mx-auto lg:w-3/4 shadow-lg">
// // //                     <div className="card-header flex justify-between items-center">
// // //                         <h3 className="text-gray-700 mt-1 text-md lg:text-xl">Menus</h3>
// // //                         <div className="box-border flex gap-x-2 justify-end md:h-10">
// // //                             <input
// // //                                 type="text"
// // //                                 className="form-control"
// // //                                 placeholder="Search"
// // //                                 onChange={(e) => setSearchTerm(e.target.value)}
// // //                             />
// // //                             <button
// // //                                 className="btn btn-primary btn-sm h-9"
// // //                                 onClick={handleAdd}
// // //                             >
// // //                                 <FontAwesomeIcon icon={faPlus} style={{ marginRight: "5px" }} />
// // //                                 Add
// // //                             </button>
// // //                         </div>
// // //                     </div>

// // //                     <div className="card-body w-full">
// // //                         <div className="h-96 lg:h-96 overflow-y-scroll lg:overflow-x-hidden">
// // //                             <div className="bg-gray-50 text-gray-800 leading-6">
// // //                                 <div className="flex justify-between items-center text-center border-b border-gray-300 mb-2">
// // //                                     <div className="px-2 py-1 w-1/12 font-semibold">No</div>
// // //                                     <div className="px-2 py-1 w-3/12 font-semibold">Menu Name</div>
// // //                                     <div className="px-2 py-1 w-2/12 font-semibold">Url</div>
// // //                                     <div className="px-2 py-1 w-2/12 font-semibold">Parent ID</div>
// // //                                     <div className="px-2 py-1 w-1/12 font-semibold">Sequence</div>
// // //                                     <div className="px-2 py-1 w-3/12 font-semibold">Actions</div>
// // //                                 </div>

// // //                                 {displayedMenus.map((menu, index) => (
// // //                                     <div
// // //                                         className="flex justify-between items-center text-center border-b border-gray-300"
// // //                                         key={menu.menu_id}
// // //                                     >
// // //                                         <div className="px-2 py-1 w-1/12">{index + 1}</div>
// // //                                         <div className="px-2 py-1 w-3/12">{menu.name}</div>
// // //                                         <div className="px-2 py-1 w-2/12">{menu.url}</div>
// // //                                         <div className="px-2 py-1 w-2/12">{menu.parent_id}</div>
// // //                                         <div className="px-2 py-1 w-1/12">{menu.sequence}</div>
// // //                                         <div className="px-2 py-1 w-3/12">
// // //                                             <button
// // //                                                 className="btn btn-primary btn-sm mr-2"
// // //                                                 onClick={() => handleEdit(menu)}
// // //                                             >
// // //                                                 <FontAwesomeIcon icon={faEdit} />
// // //                                             </button>
// // //                                             <button
// // //                                                 className="btn btn-danger btn-sm"
// // //                                                 onClick={() => handleDelete(menu.menu_id)}
// // //                                             >
// // //                                                 <FontAwesomeIcon icon={faTrash} />
// // //                                             </button>
// // //                                         </div>
// // //                                     </div>
// // //                                 ))}
// // //                             </div>
// // //                         </div>

// // //                         <div className="flex justify-center mt-3 mb-1">
// // //                             <ReactPaginate
// // //                                 previousLabel={"previous"}
// // //                                 nextLabel={"next"}
// // //                                 breakLabel={"..."}
// // //                                 pageCount={pageCount}
// // //                                 marginPagesDisplayed={2}
// // //                                 pageRangeDisplayed={5}
// // //                                 onPageChange={handlePageClick}
// // //                                 containerClassName={"pagination"}
// // //                                 subContainerClassName={"pages pagination"}
// // //                                 activeClassName={"active"}
// // //                                 previousClassName={"page-item"}
// // //                                 nextClassName={"page-item"}
// // //                                 previousLinkClassName={"page-link"}
// // //                                 nextLinkClassName={"page-link"}
// // //                                 pageClassName={"page-item"}
// // //                                 pageLinkClassName={"page-link"}
// // //                                 breakClassName={"page-item"}
// // //                                 breakLinkClassName={"page-link"}
// // //                             />
// // //                         </div>
// // //                     </div>
// // //                 </div>
// // //             </div>

// // //             {/* Add Menu Modal */}
// // //             {showAddModal && (
// // //                 <div className="modal-overlay">
// // //                     <div className="modal">
// // //                         <div className="modal-header">
// // //                             <h2>Add Menu</h2>
// // //                             <button onClick={handleCloseModal}>X</button>
// // //                         </div>
// // //                         <div className="modal-body">
// // //                             <form>
// // //                                 <div className="form-group">
// // //                                     <label>Name</label>
// // //                                     <input
// // //                                         type="text"
// // //                                         className="form-control"
// // //                                         value={formData.name}
// // //                                         onChange={(e) =>
// // //                                             setFormData({ ...formData, name: e.target.value })
// // //                                         }
// // //                                     />
// // //                                 </div>
// // //                                 <div className="form-group">
// // //                                     <label>URL</label>
// // //                                     <input
// // //                                         type="text"
// // //                                         className="form-control"
// // //                                         value={formData.url}
// // //                                         onChange={(e) =>
// // //                                             setFormData({ ...formData, url: e.target.value })
// // //                                         }
// // //                                     />
// // //                                 </div>
// // //                                 <div className="form-group">
// // //                                     <label>Parent ID</label>
// // //                                     <input
// // //                                         type="number"
// // //                                         className="form-control"
// // //                                         value={formData.parent_id}
// // //                                         onChange={(e) =>
// // //                                             setFormData({ ...formData, parent_id: e.target.value })
// // //                                         }
// // //                                     />
// // //                                 </div>
// // //                                 <div className="form-group">
// // //                                     <label>Sequence</label>
// // //                                     <input
// // //                                         type="number"
// // //                                         className="form-control"
// // //                                         value={formData.sequence}
// // //                                         onChange={(e) =>
// // //                                             setFormData({ ...formData, sequence: e.target.value })
// // //                                         }
// // //                                     />
// // //                                 </div>
// // //                             </form>
// // //                         </div>
// // //                         <div className="modal-footer">
// // //                             <button className="btn btn-secondary" onClick={handleCloseModal}>
// // //                                 Cancel
// // //                             </button>
// // //                             <button
// // //                                 className="btn btn-primary"
// // //                                 onClick={handleSubmitAdd}
// // //                             >
// // //                                 Save
// // //                             </button>
// // //                         </div>
// // //                     </div>
// // //                 </div>
// // //             )}

// // //             {/* Edit Menu Modal */}
// // //             {showEditModal && (
// // //                 <div className="modal-overlay">
// // //                     <div className="modal">
// // //                         <div className="modal-header">
// // //                             <h2>Edit Menu</h2>
// // //                             <button onClick={handleCloseModal}>X</button>
// // //                         </div>
// // //                         <div className="modal-body">
// // //                             <form>
// // //                                 <div className="form-group">
// // //                                     <label>Name</label>
// // //                                     <input
// // //                                         type="text"
// // //                                         className="form-control"
// // //                                         value={formData.name}
// // //                                         onChange={(e) =>
// // //                                             setFormData({ ...formData, name: e.target.value })
// // //                                         }
// // //                                     />
// // //                                 </div>
// // //                                 <div className="form-group">
// // //                                     <label>URL</label>
// // //                                     <input
// // //                                         type="text"
// // //                                         className="form-control"
// // //                                         value={formData.url}
// // //                                         onChange={(e) =>
// // //                                             setFormData({ ...formData, url: e.target.value })
// // //                                         }
// // //                                     />
// // //                                 </div>
// // //                                 <div className="form-group">
// // //                                     <label>Parent ID</label>
// // //                                     <input
// // //                                         type="number"
// // //                                         className="form-control"
// // //                                         value={formData.parent_id}
// // //                                         onChange={(e) =>
// // //                                             setFormData({ ...formData, parent_id: e.target.value })
// // //                                         }
// // //                                     />
// // //                                 </div>
// // //                                 <div className="form-group">
// // //                                     <label>Sequence</label>
// // //                                     <input
// // //                                         type="number"
// // //                                         className="form-control"
// // //                                         value={formData.sequence}
// // //                                         onChange={(e) =>
// // //                                             setFormData({ ...formData, sequence: e.target.value })
// // //                                         }
// // //                                     />
// // //                                 </div>
// // //                             </form>
// // //                         </div>
// // //                         <div className="modal-footer">
// // //                             <button className="btn btn-secondary" onClick={handleCloseModal}>
// // //                                 Cancel
// // //                             </button>
// // //                             <button
// // //                                 className="btn btn-primary"
// // //                                 onClick={handleSubmitEdit}
// // //                             >
// // //                                 Save
// // //                             </button>
// // //                         </div>
// // //                     </div>
// // //                 </div>
// // //             )}

// // //             {/* Delete Menu Modal */}
// // //             {showDeleteModal && (
// // //                 <div className="modal-overlay">
// // //                     <div className="modal">
// // //                         <div className="modal-header">
// // //                             <h2>Delete Menu</h2>
// // //                             <button onClick={handleCloseModal}>X</button>
// // //                         </div>
// // //                         <div className="modal-body">
// // //                             <p>Are you sure you want to delete this menu?</p>
// // //                         </div>
// // //                         <div className="modal-footer">
// // //                             <button className="btn btn-secondary" onClick={handleCloseModal}>
// // //                                 Cancel
// // //                             </button>
// // //                             <button
// // //                                 className="btn btn-danger"
// // //                                 onClick={handleSubmitDelete}
// // //                             >
// // //                                 Delete
// // //                             </button>
// // //                         </div>
// // //                     </div>
// // //                 </div>
// // //             )}
// // //         </>
// // //     );
// // // }

// // // export default Menus;

// // import { useEffect, useState } from "react";
// // import axios from "axios";
// // import ReactPaginate from "react-paginate";
// // import "bootstrap/dist/css/bootstrap.min.css";
// // import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// // import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
// // import { ToastContainer, toast } from "react-toastify";
// // import "react-toastify/dist/ReactToastify.css";

// // function Menus() {
// //     const API_URL = import.meta.env.VITE_API_URL;
// //     const [menus, setMenus] = useState([]);
// //     const [loading, setLoading] = useState(true);
// //     const [error, setError] = useState(null);
// //     const [showAddModal, setShowAddModal] = useState(false);
// //     const [showEditModal, setShowEditModal] = useState(false);
// //     const [showDeleteModal, setShowDeleteModal] = useState(false);
// //     const [currentMenu, setCurrentMenu] = useState(null);
// //     const [formData, setFormData] = useState({ name: "", url: "", parent_id: "", sequence: "" });
// //     const [searchTerm, setSearchTerm] = useState("");
// //     const [currentPage, setCurrentPage] = useState(0);
// //     const [pageCount, setPageCount] = useState(0);
// //     const pageSize = 10;

// //     const fetchMenus = async () => {
// //         try {
// //             const token = localStorage.getItem("authToken");
// //             const academicYr = localStorage.getItem("academicYear");

// //             if (!token) {
// //                 throw new Error("No authentication token found");
// //             }

// //             const response = await axios.get(`${API_URL}/api/menus`, {
// //                 headers: {
// //                     Authorization: `Bearer ${token}`,
// //                     "X-Academic-Year": academicYr,
// //                 },
// //                 withCredentials: true,
// //             });

// //             setMenus(response.data);
// //             setPageCount(Math.ceil(response.data.length / pageSize));
// //         } catch (error) {
// //             setError(error.message);
// //         } finally {
// //             setLoading(false);
// //         }
// //     };

// //     useEffect(() => {
// //         fetchMenus();
// //     }, []);

// //     const handlePageClick = (data) => {
// //         setCurrentPage(data.selected);
// //     };

// //     const handleEdit = (menu) => {
// //         setCurrentMenu(menu);
// //         setFormData({ name: menu.name, url: menu.url, parent_id: menu.parent_id, sequence: menu.sequence });
// //         setShowEditModal(true);
// //     };

// //     const handleAdd = () => {
// //         setFormData({ name: "", url: "", parent_id: "", sequence: "" });
// //         setShowAddModal(true);
// //     };

// //     const handleCloseModal = () => {
// //         setShowAddModal(false);
// //         setShowEditModal(false);
// //         setShowDeleteModal(false);
// //         setCurrentMenu(null);
// //     };

// //     const handleSubmitAdd = async () => {
// //         try {
// //             const token = localStorage.getItem("authToken");
// //             const academicYr = localStorage.getItem("academicYear");

// //             if (!token) {
// //                 throw new Error("No authentication token or academic year found");
// //             }

// //             await axios.post(
// //                 `${API_URL}/api/menus`,
// //                 { ...formData },
// //                 {
// //                     headers: {
// //                         Authorization: `Bearer ${token}`,
// //                         "X-Academic-Year": academicYr,
// //                     },
// //                     withCredentials: true,
// //                 }
// //             );

// //             fetchMenus();
// //             handleCloseModal();
// //             toast.success("Menu added successfully!");
// //         } catch (error) {
// //             console.error("Error adding menu:", error);
// //         }
// //     };

// //     const handleSubmitEdit = async () => {
// //         try {
// //             const token = localStorage.getItem("authToken");
// //             const academicYr = localStorage.getItem("academicYear");

// //             if (!token) {
// //                 throw new Error("No authentication token or academic year found");
// //             }

// //             await axios.put(
// //                 `${API_URL}/api/menus/${currentMenu.menu_id}`,
// //                 { ...formData },
// //                 {
// //                     headers: {
// //                         Authorization: `Bearer ${token}`,
// //                         "X-Academic-Year": academicYr,
// //                     },
// //                     withCredentials: true,
// //                 }
// //             );

// //             fetchMenus();
// //             handleCloseModal();
// //             toast.success("Menu updated successfully!");
// //         } catch (error) {
// //             console.error("Error editing menu:", error);
// //         }
// //     };

// //     const handleDelete = (id) => {
// //         const menuToDelete = menus.find((menu) => menu.menu_id === id);
// //         setCurrentMenu(menuToDelete);
// //         setShowDeleteModal(true);
// //     };

// //     const handleSubmitDelete = async () => {
// //         try {
// //             const token = localStorage.getItem("authToken");
// //             const academicYr = localStorage.getItem("academicYear");

// //             if (!token || !currentMenu || !currentMenu.menu_id) {
// //                 throw new Error("Menu ID is missing");
// //             }

// //             await axios.delete(
// //                 `${API_URL}/api/menus/${currentMenu.menu_id}`,
// //                 {
// //                     headers: {
// //                         Authorization: `Bearer ${token}`,
// //                         "X-Academic-Year": academicYr,
// //                     },
// //                     withCredentials: true,
// //                 }
// //             );

// //             fetchMenus();
// //             setShowDeleteModal(false);
// //             setCurrentMenu(null);
// //             toast.success("Menu deleted successfully!");
// //         } catch (error) {
// //             console.error("Error deleting menu:", error);
// //             setError(error.message);
// //         }
// //     };

// //     const filteredMenus = menus.filter((menu) =>
// //         menu.name.toLowerCase().includes(searchTerm.toLowerCase())
// //     );

// //     const displayedMenus = filteredMenus.slice(
// //         currentPage * pageSize,
// //         (currentPage + 1) * pageSize
// //     );

// //     if (loading) return <p>Loading...</p>;
// //     if (error) return <p>Error: {error}</p>;

// //     return (
// //         <>
// //             <ToastContainer />

// //             <div className="container mt-4">
// //                 <div className="card mx-auto lg:w-3/4 shadow-lg">
// //                     <div className="card-header flex justify-between items-center">
// //                         <h3 className="text-gray-700 mt-1 text-md lg:text-xl">Menus</h3>
// //                         <div className="box-border flex gap-x-2 justify-end md:h-10">
// //                             <input
// //                                 type="text"
// //                                 className="form-control"
// //                                 placeholder="Search"
// //                                 onChange={(e) => setSearchTerm(e.target.value)}
// //                             />
// //                             <button
// //                                 className="btn btn-primary btn-sm h-9"
// //                                 onClick={handleAdd}
// //                             >
// //                                 <FontAwesomeIcon icon={faPlus} style={{ marginRight: "5px" }} />
// //                                 Add
// //                             </button>
// //                         </div>
// //                     </div>

// //                     <div className="card-body w-full">
// //                         <div className="h-96 lg:h-96 overflow-y-scroll lg:overflow-x-hidden">
// //                             <div className="bg-gray-50 text-gray-800 leading-6">
// //                                 <div className="flex justify-between items-center text-center border-b border-gray-300 mb-2">
// //                                     <div className="px-2 py-1 w-1/12 font-semibold">No</div>
// //                                     <div className="px-2 py-1 w-3/12 font-semibold">Menu Name</div>
// //                                     <div className="px-2 py-1 w-2/12 font-semibold">Url</div>
// //                                     <div className="px-2 py-1 w-2/12 font-semibold">Parent ID</div>
// //                                     <div className="px-2 py-1 w-1/12 font-semibold">Sequence</div>
// //                                     <div className="px-2 py-1 w-3/12 font-semibold">Actions</div>
// //                                 </div>

// //                                 {displayedMenus.map((menu, index) => (
// //                                     <div
// //                                         className="flex justify-between items-center text-center border-b border-gray-300"
// //                                         key={menu.menu_id}
// //                                     >
// //                                         <div className="px-2 py-1 w-1/12">{index + 1}</div>
// //                                         <div className="px-2 py-1 w-3/12">{menu.name}</div>
// //                                         <div className="px-2 py-1 w-2/12">{menu.url}</div>
// //                                         <div className="px-2 py-1 w-2/12">{menu.parent_id}</div>
// //                                         <div className="px-2 py-1 w-1/12">{menu.sequence}</div>
// //                                         <div className="px-2 py-1 w-3/12">
// //                                             <button
// //                                                 className="btn btn-primary btn-sm mr-2"
// //                                                 onClick={() => handleEdit(menu)}
// //                                             >
// //                                                 <FontAwesomeIcon icon={faEdit} />
// //                                             </button>
// //                                             <button
// //                                                 className="btn btn-danger btn-sm"
// //                                                 onClick={() => handleDelete(menu.menu_id)}
// //                                             >
// //                                                 <FontAwesomeIcon icon={faTrash} />
// //                                             </button>
// //                                         </div>
// //                                     </div>
// //                                 ))}
// //                             </div>
// //                         </div>

// //                         <div className="flex justify-center mt-3 mb-1">
// //                             <ReactPaginate
// //                                 previousLabel={"previous"}
// //                                 nextLabel={"next"}
// //                                 breakLabel={"..."}
// //                                 pageCount={pageCount}
// //                                 marginPagesDisplayed={2}
// //                                 pageRangeDisplayed={5}
// //                                 onPageChange={handlePageClick}
// //                                 containerClassName={"pagination"}
// //                                 subContainerClassName={"pages pagination"}
// //                                 activeClassName={"active"}
// //                             />
// //                         </div>
// //                     </div>
// //                 </div>
// //             </div>

// //             {showAddModal && (
// //                 <div className="modal show d-block">
// //                     <div className="modal-dialog">
// //                         <div className="modal-content">
// //                             <div className="modal-header">
// //                                 <h5 className="modal-title">Add Menu</h5>
// //                                 <button
// //                                     type="button"
// //                                     className="close"
// //                                     onClick={handleCloseModal}
// //                                 >
// //                                     <span>&times;</span>
// //                                 </button>
// //                             </div>
// //                             <div className="modal-body">
// //                                 <div className="form-group">
// //                                     <label htmlFor="name">Name</label>
// //                                     <input
// //                                         type="text"
// //                                         className="form-control"
// //                                         id="name"
// //                                         value={formData.name}
// //                                         onChange={(e) =>
// //                                             setFormData({ ...formData, name: e.target.value })
// //                                         }
// //                                     />
// //                                 </div>
// //                                 <div className="form-group">
// //                                     <label htmlFor="url">Url</label>
// //                                     <input
// //                                         type="text"
// //                                         className="form-control"
// //                                         id="url"
// //                                         value={formData.url}
// //                                         onChange={(e) =>
// //                                             setFormData({ ...formData, url: e.target.value })
// //                                         }
// //                                     />
// //                                 </div>
// //                                 <div className="form-group">
// //                                     <label htmlFor="parent_id">Parent ID</label>
// //                                     <input
// //                                         type="text"
// //                                         className="form-control"
// //                                         id="parent_id"
// //                                         value={formData.parent_id}
// //                                         onChange={(e) =>
// //                                             setFormData({ ...formData, parent_id: e.target.value })
// //                                         }
// //                                     />
// //                                 </div>
// //                                 <div className="form-group">
// //                                     <label htmlFor="sequence">Sequence</label>
// //                                     <input
// //                                         type="text"
// //                                         className="form-control"
// //                                         id="sequence"
// //                                         value={formData.sequence}
// //                                         onChange={(e) =>
// //                                             setFormData({ ...formData, sequence: e.target.value })
// //                                         }
// //                                     />
// //                                 </div>
// //                             </div>
// //                             <div className="modal-footer">
// //                                 <button
// //                                     type="button"
// //                                     className="btn btn-secondary"
// //                                     onClick={handleCloseModal}
// //                                 >
// //                                     Close
// //                                 </button>
// //                                 <button
// //                                     type="button"
// //                                     className="btn btn-primary"
// //                                     onClick={handleSubmitAdd}
// //                                 >
// //                                     Save changes
// //                                 </button>
// //                             </div>
// //                         </div>
// //                     </div>
// //                 </div>
// //             )}

// //             {showEditModal && (
// //                 <div className="modal show d-block">
// //                     <div className="modal-dialog">
// //                         <div className="modal-content">
// //                             <div className="modal-header">
// //                                 <h5 className="modal-title">Edit Menu</h5>
// //                                 <button
// //                                     type="button"
// //                                     className="close"
// //                                     onClick={handleCloseModal}
// //                                 >
// //                                     <span>&times;</span>
// //                                 </button>
// //                             </div>
// //                             <div className="modal-body">
// //                                 <div className="form-group">
// //                                     <label htmlFor="name">Name</label>
// //                                     <input
// //                                         type="text"
// //                                         className="form-control"
// //                                         id="name"
// //                                         value={formData.name}
// //                                         onChange={(e) =>
// //                                             setFormData({ ...formData, name: e.target.value })
// //                                         }
// //                                     />
// //                                 </div>
// //                                 <div className="form-group">
// //                                     <label htmlFor="url">Url</label>
// //                                     <input
// //                                         type="text"
// //                                         className="form-control"
// //                                         id="url"
// //                                         value={formData.url}
// //                                         onChange={(e) =>
// //                                             setFormData({ ...formData, url: e.target.value })
// //                                         }
// //                                     />
// //                                 </div>
// //                                 <div className="form-group">
// //                                     <label htmlFor="parent_id">Parent ID</label>
// //                                     <input
// //                                         type="text"
// //                                         className="form-control"
// //                                         id="parent_id"
// //                                         value={formData.parent_id}
// //                                         onChange={(e) =>
// //                                             setFormData({ ...formData, parent_id: e.target.value })
// //                                         }
// //                                     />
// //                                 </div>
// //                                 <div className="form-group">
// //                                     <label htmlFor="sequence">Sequence</label>
// //                                     <input
// //                                         type="text"
// //                                         className="form-control"
// //                                         id="sequence"
// //                                         value={formData.sequence}
// //                                         onChange={(e) =>
// //                                             setFormData({ ...formData, sequence: e.target.value })
// //                                         }
// //                                     />
// //                                 </div>
// //                             </div>
// //                             <div className="modal-footer">
// //                                 <button
// //                                     type="button"
// //                                     className="btn btn-secondary"
// //                                     onClick={handleCloseModal}
// //                                 >
// //                                     Close
// //                                 </button>
// //                                 <button
// //                                     type="button"
// //                                     className="btn btn-primary"
// //                                     onClick={handleSubmitEdit}
// //                                 >
// //                                     Save changes
// //                                 </button>
// //                             </div>
// //                         </div>
// //                     </div>
// //                 </div>
// //             )}

// //             {showDeleteModal && (
// //                 <div className="modal show d-block">
// //                     <div className="modal-dialog">
// //                         <div className="modal-content">
// //                             <div className="modal-header">
// //                                 <h5 className="modal-title">Delete Menu</h5>
// //                                 <button
// //                                     type="button"
// //                                     className="close"
// //                                     onClick={handleCloseModal}
// //                                 >
// //                                     <span>&times;</span>
// //                                 </button>
// //                             </div>
// //                             <div className="modal-body">
// //                                 <p>Are you sure you want to delete this menu?</p>
// //                             </div>
// //                             <div className="modal-footer">
// //                                 <button
// //                                     type="button"
// //                                     className="btn btn-secondary"
// //                                     onClick={handleCloseModal}
// //                                 >
// //                                     Close
// //                                 </button>
// //                                 <button
// //                                     type="button"
// //                                     className="btn btn-danger"
// //                                     onClick={handleSubmitDelete}
// //                                 >
// //                                     Delete
// //                                 </button>
// //                             </div>
// //                         </div>
// //                     </div>
// //                 </div>
// //             )}
// //         </>
// //     );
// // }

// // export default Menus;

// import { useEffect, useState } from "react";
// import axios from "axios";
// import ReactPaginate from "react-paginate";
// import "bootstrap/dist/css/bootstrap.min.css";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// function Menus() {
//     const API_URL = import.meta.env.VITE_API_URL;
//     const [menus, setMenus] = useState([]);
//     const [allMenus, setAllMenus] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [showAddModal, setShowAddModal] = useState(false);
//     const [showEditModal, setShowEditModal] = useState(false);
//     const [showDeleteModal, setShowDeleteModal] = useState(false);
//     const [currentMenu, setCurrentMenu] = useState(null);
//     const [formData, setFormData] = useState({ name: "", url: "", parent_id: "", sequence: "" });
//     const [searchTerm, setSearchTerm] = useState("");
//     const [currentPage, setCurrentPage] = useState(0);
//     const [pageCount, setPageCount] = useState(0);
//     const pageSize = 10;

//     const fetchMenus = async () => {
//         try {
//             const token = localStorage.getItem("authToken");
//             const academicYr = localStorage.getItem("academicYear");

//             if (!token) {
//                 throw new Error("No authentication token found");
//             }

//             // Fetch all menus for dropdown
//             const allMenusResponse = await axios.get(`${API_URL}/api/menus`, {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                     "X-Academic-Year": academicYr,
//                 },
//                 withCredentials: true,
//             });
//             setAllMenus(allMenusResponse.data);

//             // Fetch paginated menus
//             const response = await axios.get(`${API_URL}/api/menus`, {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                     "X-Academic-Year": academicYr,
//                 },
//                 withCredentials: true,
//             });

//             setMenus(response.data);
//             setPageCount(Math.ceil(response.data.length / pageSize));
//         } catch (error) {
//             setError(error.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchMenus();
//     }, []);

//     const handlePageClick = (data) => {
//         setCurrentPage(data.selected);
//     };

//     const handleEdit = (menu) => {
//         setCurrentMenu(menu);
//         setFormData({ name: menu.name, url: menu.url, parent_id: menu.parent_id, sequence: menu.sequence });
//         setShowEditModal(true);
//     };

//     const handleAdd = () => {
//         setFormData({ name: "", url: "", parent_id: "", sequence: "" });
//         setShowAddModal(true);
//     };

//     const handleCloseModal = () => {
//         setShowAddModal(false);
//         setShowEditModal(false);
//         setShowDeleteModal(false);
//         setCurrentMenu(null);
//     };

//     const handleSubmitAdd = async () => {
//         try {
//             const token = localStorage.getItem("authToken");
//             const academicYr = localStorage.getItem("academicYear");

//             if (!token) {
//                 throw new Error("No authentication token or academic year found");
//             }

//             await axios.post(
//                 `${API_URL}/api/menus`,
//                 { ...formData },
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                         "X-Academic-Year": academicYr,
//                     },
//                     withCredentials: true,
//                 }
//             );

//             fetchMenus();
//             handleCloseModal();
//             toast.success("Menu added successfully!");
//         } catch (error) {
//             console.error("Error adding menu:", error);
//         }
//     };

//     const handleSubmitEdit = async () => {
//         try {
//             const token = localStorage.getItem("authToken");
//             const academicYr = localStorage.getItem("academicYear");

//             if (!token) {
//                 throw new Error("No authentication token or academic year found");
//             }

//             await axios.put(
//                 `${API_URL}/api/menus/${currentMenu.menu_id}`,
//                 { ...formData },
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                         "X-Academic-Year": academicYr,
//                     },
//                     withCredentials: true,
//                 }
//             );

//             fetchMenus();
//             handleCloseModal();
//             toast.success("Menu updated successfully!");
//         } catch (error) {
//             console.error("Error editing menu:", error);
//         }
//     };

//     const handleDelete = (id) => {
//         const menuToDelete = menus.find((menu) => menu.menu_id === id);
//         setCurrentMenu(menuToDelete);
//         setShowDeleteModal(true);
//     };

//     const handleSubmitDelete = async () => {
//         try {
//             const token = localStorage.getItem("authToken");
//             const academicYr = localStorage.getItem("academicYear");

//             if (!token || !currentMenu || !currentMenu.menu_id) {
//                 throw new Error("Menu ID is missing");
//             }

//             await axios.delete(
//                 `${API_URL}/api/menus/${currentMenu.menu_id}`,
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                         "X-Academic-Year": academicYr,
//                     },
//                     withCredentials: true,
//                 }
//             );

//             fetchMenus();
//             setShowDeleteModal(false);
//             setCurrentMenu(null);
//             toast.success("Menu deleted successfully!");
//         } catch (error) {
//             console.error("Error deleting menu:", error);
//             setError(error.message);
//         }
//     };

//     const filteredMenus = menus.filter((menu) =>
//         menu.name.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     const displayedMenus = filteredMenus.slice(
//         currentPage * pageSize,
//         (currentPage + 1) * pageSize
//     );

//     if (loading) return <p>Loading...</p>;
//     if (error) return <p>Error: {error}</p>;

//     return (
//         <>
//             <ToastContainer />

//             <div className="container mt-4">
//                 <div className="card mx-auto lg:w-3/4 shadow-lg">
//                     <div className="card-header flex justify-between items-center">
//                         <h3 className="text-gray-700 mt-1 text-md lg:text-xl">Menus</h3>
//                         <div className="box-border flex gap-x-2 justify-end md:h-10">
//                             <input
//                                 type="text"
//                                 className="form-control"
//                                 placeholder="Search"
//                                 onChange={(e) => setSearchTerm(e.target.value)}
//                             />
//                             <button
//                                 className="btn btn-primary btn-sm"
//                                 style={{ display: "flex", alignItems: "center", height: "36px" }}
//                                 onClick={handleAdd}
//                             >
//                                 <FontAwesomeIcon icon={faPlus} style={{ marginRight: "5px" }} />
//                                 Add
//                             </button>

//                         </div>
//                     </div>
//                     <div className="card-body w-full">
//                         <div className="h-96 lg:h-96 overflow-y-scroll lg:overflow-x-hidden">
//                             <div className="bg-white rounded-lg shadow-xs">
//                                 <table className="min-w-full leading-normal table-auto">
//                                     <thead>
//                                         <tr className="bg-gray-100">
//                                             <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
//                                                 No
//                                             </th>
//                                             <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
//                                                 Menu Name
//                                             </th>
//                                             <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
//                                                 Url
//                                             </th>
//                                             {/* <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
//                                                 Parent ID
//                                             </th> */}
//                                             <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
//                                                 Sequence
//                                             </th>
//                                             <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
//                                                 Actions
//                                             </th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {displayedMenus.map((menu, index) => (
//                                             <tr
//                                                 className="border-b border-gray-300"
//                                                 key={menu.menu_id}
//                                             >
//                                                 <td className="px-2 py-2 text-center">{index + 1}</td>
//                                                 <td className="px-2 py-2 text-center">{menu.name}</td>
//                                                 <td className="px-2 py-2 text-center">{menu.url}</td>
//                                                 {/* <td className="px-2 py-2 text-center">
//                                                     {menu.parent_id || "N/A"}
//                                                 </td> */}
//                                                 <td className="px-2 py-2 text-center">{menu.sequence}</td>
//                                                 <td className="px-2 py-2 text-center">
//                                                     <button
//                                                         className="text-blue-600 hover:text-blue-800 hover:bg-transparent "
//                                                         onClick={() => handleEdit(menu)}
//                                                     >
//                                                         <FontAwesomeIcon icon={faEdit} />
//                                                     </button>
//                                                     {/* <button
//                                                         className="btn btn-danger btn-sm mx-1"
//                                                         onClick={() => handleDelete(menu.menu_id)}
//                                                     >
//                                                         <FontAwesomeIcon icon={faTrash} />
//                                                     </button> */}
//                                                 </td>
//                                             </tr>
//                                         ))}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="card-footer flex justify-center">
//                         <ReactPaginate
//                             previousLabel={"Previous"}
//                             nextLabel={"Next"}
//                             breakLabel={"..."}
//                             pageCount={pageCount}
//                             marginPagesDisplayed={2}
//                             pageRangeDisplayed={5}
//                             onPageChange={handlePageClick}
//                             containerClassName={"pagination"}
//                             pageClassName={"page-item"}
//                             pageLinkClassName={"page-link"}
//                             previousClassName={"page-item"}
//                             previousLinkClassName={"page-link"}
//                             nextClassName={"page-item"}
//                             nextLinkClassName={"page-link"}
//                             breakClassName={"page-item"}
//                             breakLinkClassName={"page-link"}
//                             activeClassName={"active"}
//                         />
//                     </div>
//                 </div>
//             </div>

//             {showAddModal && (
//                 <div className="modal show d-block">
//                     <div className="modal-dialog">
//                         <div className="modal-content">
//                             <div className="modal-header">
//                                 <h5 className="modal-title">Add Menu</h5>
//                                 {/* <button
//                                     type="button"
//                                     className="close"
//                                     onClick={handleCloseModal}
//                                 >
//                                     <span>&times;</span>
//                                 </button> */}
//                             </div>
//                             <div className="modal-body">
//                                 <div className="form-group">
//                                     <label htmlFor="name">Name</label>
//                                     <input
//                                         type="text"
//                                         className="form-control"
//                                         id="name"
//                                         value={formData.name}
//                                         onChange={(e) =>
//                                             setFormData({ ...formData, name: e.target.value })
//                                         }
//                                     />
//                                 </div>
//                                 <div className="form-group">
//                                     <label htmlFor="url">Url</label>
//                                     <input
//                                         type="text"
//                                         className="form-control"
//                                         id="url"
//                                         value={formData.url}
//                                         onChange={(e) =>
//                                             setFormData({ ...formData, url: e.target.value })
//                                         }
//                                     />
//                                 </div>
//                                 <div className="form-group">
//                                     <label htmlFor="parent_id">Parent ID</label>
//                                     <select
//                                         className="form-control"
//                                         id="parent_id"
//                                         value={formData.parent_id}
//                                         onChange={(e) =>
//                                             setFormData({ ...formData, parent_id: e.target.value })
//                                         }
//                                     >
//                                         <option value="">None</option>
//                                         {allMenus.map((menu) => (
//                                             <option key={menu.menu_id} value={menu.menu_id}>
//                                                 {menu.name}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </div>
//                                 <div className="form-group">
//                                     <label htmlFor="sequence">Sequence</label>
//                                     <input
//                                         type="text"
//                                         className="form-control"
//                                         id="sequence"
//                                         value={formData.sequence}
//                                         onChange={(e) =>
//                                             setFormData({ ...formData, sequence: e.target.value })
//                                         }
//                                     />
//                                 </div>
//                             </div>
//                             <div className="modal-footer">
//                                 <button
//                                     type="button"
//                                     className="btn btn-secondary"
//                                     onClick={handleCloseModal}
//                                 >
//                                     Close
//                                 </button>
//                                 <button
//                                     type="button"
//                                     className="btn btn-primary"
//                                     onClick={handleSubmitAdd}
//                                 >
//                                     Submit
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {showEditModal && (
//                 <div className="modal show d-block">
//                     <div className="modal-dialog">
//                         <div className="modal-content">
//                             <div className="modal-header">
//                                 <h5 className="modal-title">Edit Menu</h5>
//                                 <button
//                                     type="button"
//                                     className="close"
//                                     onClick={handleCloseModal}
//                                 >
//                                     <span>&times;</span>
//                                 </button>
//                             </div>
//                             <div className="modal-body">
//                                 <div className="form-group">
//                                     <label htmlFor="name">Name</label>
//                                     <input
//                                         type="text"
//                                         className="form-control"
//                                         id="name"
//                                         value={formData.name}
//                                         onChange={(e) =>
//                                             setFormData({ ...formData, name: e.target.value })
//                                         }
//                                     />
//                                 </div>
//                                 <div className="form-group">
//                                     <label htmlFor="url">Url</label>
//                                     <input
//                                         type="text"
//                                         className="form-control"
//                                         id="url"
//                                         value={formData.url}
//                                         onChange={(e) =>
//                                             setFormData({ ...formData, url: e.target.value })
//                                         }
//                                     />
//                                 </div>
//                                 <div className="form-group">
//                                     <label htmlFor="parent_id">Parent ID</label>
//                                     <select
//                                         className="form-control"
//                                         id="parent_id"
//                                         value={formData.parent_id}
//                                         onChange={(e) =>
//                                             setFormData({ ...formData, parent_id: e.target.value })
//                                         }
//                                     >
//                                         <option value="">None</option>
//                                         {allMenus.map((menu) => (
//                                             <option key={menu.menu_id} value={menu.menu_id}>
//                                                 {menu.name}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </div>
//                                 <div className="form-group">
//                                     <label htmlFor="sequence">Sequence</label>
//                                     <input
//                                         type="text"
//                                         className="form-control"
//                                         id="sequence"
//                                         value={formData.sequence}
//                                         onChange={(e) =>
//                                             setFormData({ ...formData, sequence: e.target.value })
//                                         }
//                                     />
//                                 </div>
//                             </div>
//                             <div className="modal-footer">
//                                 <button
//                                     type="button"
//                                     className="btn btn-secondary"
//                                     onClick={handleCloseModal}
//                                 >
//                                     Close
//                                 </button>
//                                 <button
//                                     type="button"
//                                     className="btn btn-primary"
//                                     onClick={handleSubmitEdit}
//                                 >
//                                     Save changes
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {showDeleteModal && (
//                 <div className="modal show d-block">
//                     <div className="modal-dialog">
//                         <div className="modal-content">
//                             <div className="modal-header">
//                                 <h5 className="modal-title">Delete Menu</h5>
//                                 <button
//                                     type="button"
//                                     className="close"
//                                     onClick={handleCloseModal}
//                                 >
//                                     <span>&times;</span>
//                                 </button>
//                             </div>
//                             <div className="modal-body">
//                                 <p>Are you sure you want to delete this menu?</p>
//                             </div>
//                             <div className="modal-footer">
//                                 <button
//                                     type="button"
//                                     className="btn btn-secondary"
//                                     onClick={handleCloseModal}
//                                 >
//                                     Close
//                                 </button>
//                                 <button
//                                     type="button"
//                                     className="btn btn-danger"
//                                     onClick={handleSubmitDelete}
//                                 >
//                                     Delete
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </>
//     );
// }

// export default Menus;

// import { useEffect, useState } from "react";
// import axios from "axios";
// import ReactPaginate from "react-paginate";
// import "bootstrap/dist/css/bootstrap.min.css";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// function Menus() {
//     const API_URL = import.meta.env.VITE_API_URL;
//     const [menus, setMenus] = useState([]);
//     const [allMenus, setAllMenus] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [errors, setErrors] = useState({});
//     const [showAddModal, setShowAddModal] = useState(false);
//     const [showEditModal, setShowEditModal] = useState(false);
//     const [showDeleteModal, setShowDeleteModal] = useState(false);
//     const [currentMenu, setCurrentMenu] = useState(null);
//     const [formData, setFormData] = useState({ name: "", url: "", parent_id: "", sequence: "" });
//     const [searchTerm, setSearchTerm] = useState("");
//     const [currentPage, setCurrentPage] = useState(0);
//     const [pageCount, setPageCount] = useState(0);
//     const pageSize = 10;

//     const fetchMenus = async () => {
//         try {
//             const token = localStorage.getItem("authToken");
//             const academicYr = localStorage.getItem("academicYear");

//             if (!token) {
//                 throw new Error("No authentication token found");
//             }

//             // Fetch all menus for dropdown
//             const allMenusResponse = await axios.get(`${API_URL}/api/menus`, {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                     "X-Academic-Year": academicYr,
//                 },
//                 withCredentials: true,
//             });
//             setAllMenus(allMenusResponse.data);

//             // Fetch paginated menus
//             const response = await axios.get(`${API_URL}/api/menus`, {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                     "X-Academic-Year": academicYr,
//                 },
//                 withCredentials: true,
//             });

//             setMenus(response.data);
//             setPageCount(Math.ceil(response.data.length / pageSize));
//         } catch (error) {
//             console.error("Error fetching menus:", error);
//             setErrors({ fetch: error.message });
//         } finally {
//             setLoading(false);
//         }
//     };

//     const getParentName = (parentId) => {
//         const parentMenu = allMenus.find(menu => menu.menu_id === parentId);
//         return parentMenu ? parentMenu.name : "None";
//     };

//     useEffect(() => {
//         fetchMenus();
//     }, []);

//     const handlePageClick = (data) => {
//         setCurrentPage(data.selected);
//     };

//     const handleEdit = (menu) => {
//         setCurrentMenu(menu);
//         setFormData({ name: menu.name, url: menu.url, parent_id: menu.parent_id, sequence: menu.sequence });
//         setShowEditModal(true);
//     };

//     const handleAdd = () => {
//         setFormData({ name: "", url: "", parent_id: "", sequence: "" });
//         setShowAddModal(true);
//     };

//     const handleCloseModal = () => {
//         setShowAddModal(false);
//         setShowEditModal(false);
//         setShowDeleteModal(false);
//         setCurrentMenu(null);
//     };

//     const handleSubmitAdd = async () => {
//         try {
//             const token = localStorage.getItem("authToken");
//             const academicYr = localStorage.getItem("academicYear");

//             if (!token) {
//                 throw new Error("No authentication token or academic year found");
//             }

//             await axios.post(
//                 `${API_URL}/api/menus`,
//                 { ...formData },
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                         "X-Academic-Year": academicYr,
//                     },
//                     withCredentials: true,
//                 }
//             );

//             fetchMenus();
//             handleCloseModal();
//             toast.success("Menu added successfully!");
//         } catch (error) {
//             if (error.response && error.response.data.errors) {
//                 setErrors(error.response.data.errors);
//             } else {
//                 console.error("Error adding menu:", error);
//                 setErrors({ add: error.message });
//             }
//         }
//     };

//     const handleSubmitEdit = async () => {
//         try {
//             const token = localStorage.getItem("authToken");

//             if (!token) {
//                 throw new Error("No authentication token or academic year found");
//             }

//             await axios.put(
//                 `${API_URL}/api/menus/${currentMenu.menu_id}`,
//                 { ...formData },
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                     },
//                     withCredentials: true,
//                 }
//             );

//             fetchMenus();
//             handleCloseModal();
//             toast.success("Menu updated successfully!");
//         } catch (error) {
//             if (error.response && error.response.data.errors) {
//                 setErrors(error.response.data.errors);
//             } else {
//                 console.error("Error editing menu:", error);
//                 setErrors({ edit: error.message });
//             }
//         }
//     };

//     const handleDelete = (id) => {
//         const menuToDelete = menus.find((menu) => menu.menu_id === id);
//         setCurrentMenu(menuToDelete);
//         setShowDeleteModal(true);
//     };

//     const handleSubmitDelete = async () => {
//         try {
//             const token = localStorage.getItem("authToken");
//             const academicYr = localStorage.getItem("academicYear");

//             if (!token || !currentMenu || !currentMenu.menu_id) {
//                 throw new Error("Menu ID is missing");
//             }

//             await axios.delete(
//                 `${API_URL}/api/menus/${currentMenu.menu_id}`,
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                         "X-Academic-Year": academicYr,
//                     },
//                     withCredentials: true,
//                 }
//             );

//             fetchMenus();
//             setShowDeleteModal(false);
//             setCurrentMenu(null);
//             toast.success("Menu deleted successfully!");
//         } catch (error) {
//             console.error("Error deleting menu:", error);
//             setErrors({ delete: error.message });
//         }
//     };

//     const filteredMenus = menus.filter((menu) =>
//         menu.name.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     const displayedMenus = filteredMenus.slice(
//         currentPage * pageSize,
//         (currentPage + 1) * pageSize
//     );

//     if (loading) return <p>Loading...</p>;
//     if (errors.fetch) return <p>Error: {errors.fetch}</p>;

//     return (
//         <>
//             <ToastContainer />

//             {/* <div className="container mt-4">
//                 <div className="card mx-auto lg:w-3/4 shadow-lg">
//                     <div className="card-header flex justify-between items-center">
//                         <h3 className="text-lg font-semibold">Menus</h3>
//                         <button
//                             className="btn btn-primary"
//                             onClick={handleAdd}
//                         >
//                             <FontAwesomeIcon icon={faPlus} /> Add Menu
//                         </button>
//                     </div>

//                     <div className="card-body">
//                         <div className="mb-3">
//                             <input
//                                 type="text"
//                                 className="form-control"
//                                 placeholder="Search"
//                                 value={searchTerm}
//                                 onChange={(e) => setSearchTerm(e.target.value)}
//                             />
//                         </div>

//                         <table className="table table-bordered">
//                             <thead>
//                                 <tr>
//                                     <th>Name</th>
//                                     <th>URL</th>
//                                     <th>Parent</th>
//                                     <th>Sequence</th>
//                                     <th>Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {displayedMenus.map((menu) => (
//                                     <tr key={menu.menu_id}>
//                                         <td>{menu.name}</td>
//                                         <td>{menu.url}</td>
//                                         <td>{menu.parent_id}</td>
//                                         <td>{menu.sequence}</td>
//                                         <td>
//                                             <button
//                                                 className="btn btn-warning"
//                                                 onClick={() => handleEdit(menu)}
//                                             >
//                                                 <FontAwesomeIcon icon={faEdit} />
//                                             </button>
//                                             <button
//                                                 className="btn btn-danger ms-2"
//                                                 onClick={() => handleDelete(menu.menu_id)}
//                                             >
//                                                 <FontAwesomeIcon icon={faTrash} />
//                                             </button>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>

//                         <ReactPaginate
//                             pageCount={pageCount}
//                             onPageChange={handlePageClick}
//                             containerClassName={"pagination"}
//                             pageClassName={"page-item"}
//                             pageLinkClassName={"page-link"}
//                             previousClassName={"page-item"}
//                             previousLinkClassName={"page-link"}
//                             nextClassName={"page-item"}
//                             nextLinkClassName={"page-link"}
//                             breakClassName={"page-item"}
//                             breakLinkClassName={"page-link"}
//                             activeClassName={"active"}
//                         />
//                     </div>
//                 </div>
//             </div> */}

//             <div className="container mt-4">
//                 <div className="card mx-auto lg:w-3/4 shadow-lg">
//                     <div className="card-header d-flex justify-content-between align-items-center">
//                         <h3 className="text-lg font-semibold">Menus</h3>
//                         <div className="d-flex align-items-center">
//                             <input
//                                 type="text"
//                                 className="form-control me-3"
//                                 placeholder="Search"
//                                 value={searchTerm}
//                                 onChange={(e) => setSearchTerm(e.target.value)}
//                             />
//                             {/* <button
//                                 className="btn btn-primary"
//                                 onClick={handleAdd}
//                             >
//                                 <FontAwesomeIcon icon={faPlus} /> Add
//                             </button> */}
//                             <button
//                                 className="btn btn-primary btn-sm"
//                                 style={{ display: "flex", alignItems: "center", height: "36px" }}
//                                 onClick={handleAdd}
//                             >
//                                 <FontAwesomeIcon icon={faPlus} style={{ marginRight: "5px" }} />
//                                 Add
//                             </button>
//                         </div>
//                     </div>

//                     <div className="card-body">
//                         <table className="table table-bordered">
//                             <thead>
//                                 <tr>
//                                     <th>Name</th>
//                                     <th>URL</th>
//                                     <th>Parent</th>
//                                     <th>Sequence</th>
//                                     <th>Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {displayedMenus.map((menu) => (
//                                     <tr key={menu.menu_id}>
//                                         <td>{menu.name}</td>
//                                         <td>{menu.url}</td>
//                                         <td>{getParentName(menu.parent_id)}</td>
//                                         <td>{menu.sequence}</td>
//                                         <td>
//                                             <button
//                                                 className="text-blue-600 hover:text-blue-800 hover:bg-transparent "
//                                                 onClick={() => handleEdit(menu)}
//                                             >
//                                                 <FontAwesomeIcon icon={faEdit} />
//                                             </button>
//                                             {/* <button
//                                                 className="btn btn-danger ms-2"
//                                                 onClick={() => handleDelete(menu.menu_id)}
//                                             >
//                                                 <FontAwesomeIcon icon={faTrash} />
//                                             </button> */}
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>

//                         <ReactPaginate
//                             pageCount={pageCount}
//                             onPageChange={handlePageClick}
//                             containerClassName={"pagination"}
//                             pageClassName={"page-item"}
//                             pageLinkClassName={"page-link"}
//                             previousClassName={"page-item"}
//                             previousLinkClassName={"page-link"}
//                             nextClassName={"page-item"}
//                             nextLinkClassName={"page-link"}
//                             breakClassName={"page-item"}
//                             breakLinkClassName={"page-link"}
//                             activeClassName={"active"}
//                         />
//                     </div>
//                 </div>
//             </div>

//             {/* Add Modal */}
//             {showAddModal && (
//                 <div className="modal fade show" style={{ display: "block" }}>
//                     <div className="modal-dialog">
//                         <div className="modal-content">
//                             <div className="modal-header">
//                                 <h5 className="modal-title">Add Menu</h5>
//                                 <button
//                                     type="button"
//                                     className="btn-close"
//                                     onClick={handleCloseModal}
//                                 ></button>
//                             </div>
//                             <div className="modal-body">
//                                 <div className="mb-3">
//                                     <label className="form-label">Name</label>
//                                     <input
//                                         type="text"
//                                         className="form-control"
//                                         value={formData.name}
//                                         onChange={(e) =>
//                                             setFormData({ ...formData, name: e.target.value })
//                                         }
//                                     />
//                                     {errors.name && <p className="text-danger">{errors.name}</p>}
//                                 </div>
//                                 <div className="mb-3">
//                                     <label className="form-label">URL</label>
//                                     <input
//                                         type="text"
//                                         className="form-control"
//                                         value={formData.url}
//                                         onChange={(e) =>
//                                             setFormData({ ...formData, url: e.target.value })
//                                         }
//                                     />
//                                     {errors.url && <p className="text-danger">{errors.url}</p>}
//                                 </div>
//                                 <div className="mb-3">
//                                     <label className="form-label">Parent ID</label>
//                                     <select
//                                         className="form-select"
//                                         value={formData.parent_id}
//                                         onChange={(e) =>
//                                             setFormData({ ...formData, parent_id: e.target.value })
//                                         }
//                                     >
//                                         <option value="">None</option>
//                                         {allMenus.map((menu) => (
//                                             <option key={menu.menu_id} value={menu.menu_id}>
//                                                 {menu.name}
//                                             </option>
//                                         ))}
//                                     </select>
//                                     {errors.parent_id && <p className="text-danger">{errors.parent_id}</p>}
//                                 </div>
//                                 <div className="mb-3">
//                                     <label className="form-label">Sequence</label>
//                                     <input
//                                         type="number"
//                                         className="form-control"
//                                         value={formData.sequence}
//                                         onChange={(e) =>
//                                             setFormData({ ...formData, sequence: e.target.value })
//                                         }
//                                     />
//                                     {errors.sequence && <p className="text-danger">{errors.sequence}</p>}
//                                 </div>
//                             </div>
//                             <div className="modal-footer">
//                                 <button
//                                     type="button"
//                                     className="btn btn-secondary"
//                                     onClick={handleCloseModal}
//                                 >
//                                     Close
//                                 </button>
//                                 <button
//                                     type="button"
//                                     className="btn btn-primary"
//                                     onClick={handleSubmitAdd}
//                                 >
//                                     Add Menu
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Edit Modal */}
//             {showEditModal && (
//                 <div className="modal fade show" style={{ display: "block" }}>
//                     <div className="modal-dialog">
//                         <div className="modal-content">
//                             <div className="modal-header">
//                                 <h5 className="modal-title">Edit Menu</h5>
//                                 <button
//                                     type="button"
//                                     className="btn-close"
//                                     onClick={handleCloseModal}
//                                 ></button>
//                             </div>
//                             <div className="modal-body">
//                                 <div className="mb-3">
//                                     <label className="form-label">Name</label>
//                                     <input
//                                         type="text"
//                                         className="form-control"
//                                         value={formData.name}
//                                         onChange={(e) =>
//                                             setFormData({ ...formData, name: e.target.value })
//                                         }
//                                     />
//                                     {errors.name && <p className="text-danger">{errors.name}</p>}
//                                 </div>
//                                 <div className="mb-3">
//                                     <label className="form-label">URL</label>
//                                     <input
//                                         type="text"
//                                         className="form-control"
//                                         value={formData.url}
//                                         onChange={(e) =>
//                                             setFormData({ ...formData, url: e.target.value })
//                                         }
//                                     />
//                                     {errors.url && <p className="text-danger">{errors.url}</p>}
//                                 </div>
//                                 <div className="mb-3">
//                                     <label className="form-label">Parent ID</label>
//                                     <select
//                                         className="form-select"
//                                         value={formData.parent_id}
//                                         onChange={(e) =>
//                                             setFormData({ ...formData, parent_id: e.target.value })
//                                         }
//                                     >
//                                         <option value="0">None</option>
//                                         {allMenus.map((menu) => (
//                                             <option key={menu.menu_id} value={menu.menu_id}>
//                                                 {menu.name}
//                                             </option>
//                                         ))}
//                                     </select>
//                                     {errors.parent_id && <p className="text-danger">{errors.parent_id}</p>}
//                                 </div>
//                                 <div className="mb-3">
//                                     <label className="form-label">Sequence</label>
//                                     <input
//                                         type="number"
//                                         className="form-control"
//                                         value={formData.sequence}
//                                         onChange={(e) =>
//                                             setFormData({ ...formData, sequence: e.target.value })
//                                         }
//                                     />
//                                     {errors.sequence && <p className="text-danger">{errors.sequence}</p>}
//                                 </div>
//                             </div>
//                             <div className="modal-footer">
//                                 <button
//                                     type="button"
//                                     className="btn btn-secondary"
//                                     onClick={handleCloseModal}
//                                 >
//                                     Close
//                                 </button>
//                                 <button
//                                     type="button"
//                                     className="btn btn-primary"
//                                     onClick={handleSubmitEdit}
//                                 >
//                                     Save Changes
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Delete Modal */}
//             {showDeleteModal && (
//                 <div className="modal fade show" style={{ display: "block" }}>
//                     <div className="modal-dialog">
//                         <div className="modal-content">
//                             <div className="modal-header">
//                                 <h5 className="modal-title">Delete Menu</h5>
//                                 <button
//                                     type="button"
//                                     className="btn-close"
//                                     onClick={handleCloseModal}
//                                 ></button>
//                             </div>
//                             <div className="modal-body">
//                                 <p>Are you sure you want to delete this menu?</p>
//                             </div>
//                             <div className="modal-footer">
//                                 <button
//                                     type="button"
//                                     className="btn btn-secondary"
//                                     onClick={handleCloseModal}
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     type="button"
//                                     className="btn btn-danger"
//                                     onClick={handleSubmitDelete}
//                                 >
//                                     Delete
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </>
//     );
// }

// export default Menus;

import { useEffect, useState } from "react";
import axios from "axios";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      await axios.post(`${API_URL}/api/menus`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      fetchMenus();
      handleCloseModal();
      toast.success("Menu added successfully!");
    } catch (error) {
      if (error.response && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        console.error("Error adding menu:", error);
        setErrors({ add: error.message });
      }
    }
  };

  const handleSubmitEdit = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) throw new Error("No authentication token found");

      await axios.put(`${API_URL}/api/menus/${currentMenu.menu_id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      fetchMenus();
      handleCloseModal();
      toast.success("Menu updated successfully!");
    } catch (error) {
      if (error.response && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        console.error("Error editing menu:", error);
        setErrors({ edit: error.message });
      }
    }
  };

  const handleDelete = (id) => {
    const menuToDelete = menus.find((menu) => menu.menu_id === id);
    setCurrentMenu(menuToDelete);
    setShowDeleteModal(true);
  };

  const handleSubmitDelete = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const academicYr = localStorage.getItem("academicYear");

      if (!token || !currentMenu || !currentMenu.menu_id)
        throw new Error("Menu ID is missing");

      await axios.delete(`${API_URL}/api/menus/${currentMenu.menu_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Academic-Year": academicYr,
        },
        withCredentials: true,
      });

      fetchMenus();
      setShowDeleteModal(false);
      setCurrentMenu(null);
      toast.success("Menu deleted successfully!");
    } catch (error) {
      console.error("Error deleting menu:", error);
      setErrors({ delete: error.message });
    }
  };

  const filteredMenus = menus.filter((menu) =>
    menu.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedMenus = filteredMenus.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  if (loading) return <p>Loading...</p>;
  if (errors.fetch) return <p>Error: {errors.fetch}</p>;

  return (
    <>
      <ToastContainer />

      <div className="container mt-4">
        <div className="card mx-auto lg:w-3/4 shadow-lg">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h3 className="text-lg font-semibold">Menus</h3>
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

          <div className="card-body">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>URL</th>
                  <th>Parent</th>
                  <th>Sequence</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedMenus.map((menu) => (
                  <tr key={menu.menu_id}>
                    <td>{menu.name}</td>
                    <td>{menu.url}</td>
                    <td>{getParentName(menu.parent_id)}</td>
                    <td>{menu.sequence}</td>
                    <td>
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => handleEdit(menu)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      {/* <button
                                                className="text-red-600 hover:text-red-800 ms-2"
                                                onClick={() => handleDelete(menu.menu_id)}
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button> */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card-footer">
            <ReactPaginate
              previousLabel={"Previous"}
              nextLabel={"Next"}
              breakLabel={"..."}
              pageCount={pageCount}
              marginPagesDisplayed={2}
              pageRangeDisplayed={5}
              onPageChange={handlePageClick}
              containerClassName={"pagination"}
              pageClassName={"page-item"}
              pageLinkClassName={"page-link"}
              previousClassName={"page-item"}
              previousLinkClassName={"page-link"}
              nextClassName={"page-item"}
              nextLinkClassName={"page-link"}
              breakClassName={"page-item"}
              breakLinkClassName={"page-link"}
              activeClassName={"active"}
            />
          </div>
        </div>
      </div>

      {/* Add Menu Modal */}
      <div
        className={`modal fade ${showAddModal ? "show" : ""}`}
        style={{ display: showAddModal ? "block" : "none" }}
        tabIndex="-1"
        role="dialog"
        aria-labelledby="addMenuModalLabel"
        aria-hidden={!showAddModal}
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="addMenuModalLabel">
                Add Menu
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleCloseModal}
                aria-label="Close"
              />
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label htmlFor="menuName" className="form-label">
                    Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="menuName"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                  {errors.name && (
                    <small className="text-danger">{errors.name}</small>
                  )}
                </div>
                <div className="mb-3">
                  <label htmlFor="menuUrl" className="form-label">
                    URL
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="menuUrl"
                    value={formData.url}
                    onChange={(e) =>
                      setFormData({ ...formData, url: e.target.value })
                    }
                  />
                  {errors.url && (
                    <small className="text-danger">{errors.url}</small>
                  )}
                </div>
                <div className="mb-3">
                  <label htmlFor="parentId" className="form-label">
                    Parent
                  </label>
                  <select
                    className="form-control"
                    id="parentId"
                    value={formData.parent_id}
                    onChange={(e) =>
                      setFormData({ ...formData, parent_id: e.target.value })
                    }
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
                  {errors.parent_id && (
                    <small className="text-danger">{errors.parent_id}</small>
                  )}
                </div>
                <div className="mb-3">
                  <label htmlFor="menuSequence" className="form-label">
                    Sequence
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="menuSequence"
                    value={formData.sequence}
                    onChange={(e) =>
                      setFormData({ ...formData, sequence: e.target.value })
                    }
                  />
                  {errors.sequence && (
                    <small className="text-danger">{errors.sequence}</small>
                  )}
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSubmitAdd}
                >
                  Add Menu
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Menu Modal */}
      <div
        className={`modal fade ${showEditModal ? "show" : ""}`}
        style={{ display: showEditModal ? "block" : "none" }}
        tabIndex="-1"
        role="dialog"
        aria-labelledby="editMenuModalLabel"
        aria-hidden={!showEditModal}
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="editMenuModalLabel">
                Edit Menu
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleCloseModal}
                aria-label="Close"
              />
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label htmlFor="editMenuName" className="form-label">
                    Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="editMenuName"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                  {errors.name && (
                    <small className="text-danger">{errors.name}</small>
                  )}
                </div>
                <div className="mb-3">
                  <label htmlFor="editMenuUrl" className="form-label">
                    URL
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="editMenuUrl"
                    value={formData.url}
                    onChange={(e) =>
                      setFormData({ ...formData, url: e.target.value })
                    }
                  />
                  {errors.url && (
                    <small className="text-danger">{errors.url}</small>
                  )}
                </div>
                <div className="mb-3">
                  <label htmlFor="editParentId" className="form-label">
                    Parent
                  </label>
                  <select
                    className="form-control"
                    id="editParentId"
                    value={formData.parent_id}
                    onChange={(e) =>
                      setFormData({ ...formData, parent_id: e.target.value })
                    }
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
                  {errors.parent_id && (
                    <small className="text-danger">{errors.parent_id}</small>
                  )}
                </div>
                <div className="mb-3">
                  <label htmlFor="editMenuSequence" className="form-label">
                    Sequence
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="editMenuSequence"
                    value={formData.sequence}
                    onChange={(e) =>
                      setFormData({ ...formData, sequence: e.target.value })
                    }
                  />
                  {errors.sequence && (
                    <small className="text-danger">{errors.sequence}</small>
                  )}
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSubmitEdit}
                >
                  Update Menu
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Menu Modal */}
      <div
        className={`modal fade ${showDeleteModal ? "show" : ""}`}
        style={{ display: showDeleteModal ? "block" : "none" }}
        tabIndex="-1"
        role="dialog"
        aria-labelledby="deleteMenuModalLabel"
        aria-hidden={!showDeleteModal}
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="deleteMenuModalLabel">
                Delete Menu
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleCloseModal}
                aria-label="Close"
              />
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete the menu "{currentMenu?.name}"?
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCloseModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleSubmitDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Menus;
