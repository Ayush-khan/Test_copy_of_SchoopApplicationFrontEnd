// import { useEffect, useState, useRef } from "react";
// import axios from "axios";
// import { useNavigate, useLocation } from "react-router-dom";
// import ReactPaginate from "react-paginate";
// import "bootstrap/dist/css/bootstrap.min.css";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faEdit } from "@fortawesome/free-solid-svg-icons";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// function ShowRolesWithMenu() {
//   const API_URL = import.meta.env.VITE_API_URL;
//   const [roles, setRoles] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(0);
//   const [pageCount, setPageCount] = useState(0);
//   const pageSize = 10;
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const previousPageRef = useRef(0);
//   const prevSearchTermRef = useRef("");
//   useEffect(() => {
//     const fetchRoles = async () => {
//       try {
//         const token = localStorage.getItem("authToken");

//         if (!token) {
//           throw new Error("No authentication token found");
//         }

//         const response = await axios.get(`${API_URL}/api/show_roles`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           withCredentials: true,
//         });

//         setRoles(response.data);
//         setPageCount(Math.ceil(response.data.length / pageSize));
//       } catch (error) {
//         setError(error.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchRoles();
//   }, []);

//   useEffect(() => {
//     const query = new URLSearchParams(location.search);
//     const message = query.get("message");
//     if (message) {
//       toast.success(message);
//     }
//   }, [location.search]);

//   const handleManage = (role) => {
//     navigate(`/manageRoleAccess/${role.role_id}`);
//   };
//   // ✅ Update page when search changes
//   useEffect(() => {
//     const trimmedSearch = searchTerm.trim().toLowerCase();

//     if (trimmedSearch !== "" && prevSearchTermRef.current === "") {
//       previousPageRef.current = currentPage;
//       setCurrentPage(0);
//     }

//     if (trimmedSearch === "" && prevSearchTermRef.current !== "") {
//       setCurrentPage(previousPageRef.current);
//     }

//     prevSearchTermRef.current = trimmedSearch;
//   }, [searchTerm]);

//   const searchLower = searchTerm.trim().toLowerCase();
//   const filteredRoles = roles.filter((role) =>
//     [role?.name, role?.role_id, role?.is_active].some((field) =>
//       field?.toString().toLowerCase().includes(searchLower)
//     )
//   );

//   // ✅ Update page count when filtered list changes
//   useEffect(() => {
//     setPageCount(Math.ceil(filteredRoles.length / pageSize));
//   }, [filteredRoles, pageSize]);

//   // ✅ Paginate filtered list
//   const displayedRoles = filteredRoles.slice(
//     currentPage * pageSize,
//     (currentPage + 1) * pageSize
//   );

//   const handlePageClick = (data) => {
//     setCurrentPage(data.selected);
//   };

//   // if (loading) return <p>Loading...</p>;
//   // if (error) return <p>Error: {error}</p>;

//   return (
//     <>
//       <ToastContainer />

//       <div className="container md:mt-4">
//         <div className="card mx-auto lg:w-3/4 shadow-lg">
//           <div className="card-header flex justify-between items-center">
//             <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
//               Manage Role Access
//             </h3>
//             <div className="box-border flex md:gap-x-2 justify-end md:h-10">
//               <div className=" w-1/2 md:w-fit mr-1">
//                 <input
//                   type="text"
//                   className="form-control"
//                   placeholder="Search"
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//               </div>
//             </div>
//           </div>
//           <div
//             className=" relative w-[97%]  -top-0.5 mb-3 h-1  mx-auto bg-red-700"
//             style={{
//               backgroundColor: "#C03078",
//             }}
//           ></div>

//           <div className="card-body w-full md:w-[70%] mx-auto ">
//             <div className="h-96 lg:h-96 overflow-y-scroll lg:overflow-x-hidden">
//               <div className="bg-white rounded-lg shadow-xs">
//                 <table className="min-w-full leading-normal table-auto">
//                   <thead>
//                     <tr className="bg-gray-200">
//                       <th className=" w-full md:w-[13%] px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
//                         S.No
//                       </th>
//                       <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
//                         Role Name
//                       </th>
//                       <th className=" w-full md:w-[30%] px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
//                         Manage Role Access
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {loading ? (
//                       <div className=" absolute left-[4%] w-[100%]  text-center flex justify-center items-center mt-14">
//                         <div className=" text-center text-xl text-blue-700">
//                           Please wait while data is loading...
//                         </div>
//                       </div>
//                     ) : displayedRoles.length ? (
//                       displayedRoles.map((role, index) => (
//                         <tr
//                           key={role.id}
//                           className={`${
//                             index % 2 === 0 ? "bg-white" : "bg-gray-100"
//                           } hover:bg-gray-50`}
//                         >
//                           <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
//                             {currentPage * pageSize + index + 1}
//                           </td>
//                           <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
//                             {role.name}
//                           </td>
//                           <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
//                             <button
//                               className="text-blue-600 hover:text-blue-800 hover:bg-transparent"
//                               onClick={() => handleManage(role)}
//                             >
//                               <FontAwesomeIcon icon={faEdit} />
//                             </button>
//                           </td>
//                         </tr>
//                       ))
//                     ) : (
//                       <div className=" absolute left-[1%] w-[100%]  text-center flex justify-center items-center mt-14">
//                         <div className=" text-center text-xl text-red-700">
//                           Oops! No data found..
//                         </div>
//                       </div>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//             {/* Pagination Container */}
//             <div className="flex justify-center mt-4">
//               <ReactPaginate
//                 previousLabel={"Previous"}
//                 nextLabel={"Next"}
//                 breakLabel={"..."}
//                 pageCount={pageCount}
//                 marginPagesDisplayed={2}
//                 pageRangeDisplayed={5}
//                 onPageChange={handlePageClick}
//                 containerClassName={"pagination"}
//                 subContainerClassName={"pages pagination"}
//                 activeClassName={"active"}
//                 previousClassName={"page-item"}
//                 nextClassName={"page-item"}
//                 pageClassName={"page-item"}
//                 breakClassName={"page-item"}
//                 previousLinkClassName={"page-link"}
//                 nextLinkClassName={"page-link"}
//                 pageLinkClassName={"page-link"}
//                 breakLinkClassName={"page-link"}
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

// export default ShowRolesWithMenu;

import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ShowRolesWithMenu() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const pageSize = 10;
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const token = localStorage.getItem("authToken");

        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await axios.get(`${API_URL}/api/show_roles`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });

        setRoles(response.data);
        setPageCount(Math.ceil(response.data.length / pageSize));
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const message = query.get("message");
    if (message) {
      toast.success(message);
    }
  }, [location.search]);

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const handleManage = (role) => {
    navigate(`/manageRoleAccess/${role.role_id}`);
  };

  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedRoles = filteredRoles.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      <ToastContainer />

      <div className="container mt-4">
        <div className="card mx-auto lg:w-3/4 shadow-lg">
          <div className="card-header flex justify-between items-center">
            <h3 className="text-gray-700 mt-1 text-md lg:text-xl">
              Manage Role Access
            </h3>
            <div className="box-border flex gap-x-2 justify-end md:h-10">
              <div>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="card-body w-full">
            <div className="h-96 lg:h-96 overflow-y-scroll lg:overflow-x-hidden">
              <div className="bg-white rounded-lg shadow-xs">
                <table className="min-w-full leading-normal table-auto">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        S.No
                      </th>
                      <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Role Name
                      </th>
                      <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Manage Role Access
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedRoles.map((role, index) => (
                      <tr key={role.id}>
                        <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                          {currentPage * pageSize + index + 1}
                        </td>
                        <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                          {role.rolename}
                        </td>
                        <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                          <button
                            className="text-blue-600 hover:text-blue-800 hover:bg-transparent"
                            onClick={() => handleManage(role)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination Container */}
              <div className="flex justify-center mt-4">
                <ReactPaginate
                  previousLabel={"Previous"}
                  nextLabel={"Next"}
                  breakLabel={"..."}
                  pageCount={pageCount}
                  marginPagesDisplayed={2}
                  pageRangeDisplayed={5}
                  onPageChange={handlePageClick}
                  containerClassName={"pagination"}
                  subContainerClassName={"pages pagination"}
                  activeClassName={"active"}
                  previousClassName={"page-item"}
                  nextClassName={"page-item"}
                  pageClassName={"page-item"}
                  breakClassName={"page-item"}
                  previousLinkClassName={"page-link"}
                  nextLinkClassName={"page-link"}
                  pageLinkClassName={"page-link"}
                  breakLinkClassName={"page-link"}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ShowRolesWithMenu;
