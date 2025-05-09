import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoaderStyle from "../../componants/common/LoaderFinal/LoaderStyle";
import { RxCross1 } from "react-icons/rx";
import ReactPaginate from "react-paginate"; // ✅ Import pagination

function ManageRoleAccess() {
  const { roleId } = useParams();
  const API_URL = import.meta.env.VITE_API_URL;
  const [role, setRole] = useState({});
  const navigate = useNavigate();
  const [menuList, setMenuList] = useState([]);
  const [selectedMenus, setSelectedMenus] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const pageSize = 10;
  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchRoleAndMenus = async () => {
      try {
        const token = localStorage.getItem("authToken");

        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await axios.get(
          `${API_URL}/api/show_access/${roleId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
        console.log("roleid in the access role", roleId);

        setRole(response.data.role);
        setMenuList(response.data.menuList);
        setSelectedMenus(new Set(response.data.assignedMenuIds)); // Set initial selected menus
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoleAndMenus();
  }, [roleId]);

  const handleCheckboxChange = (menuId) => {
    setSelectedMenus((prevSelectedMenus) => {
      const updatedSelectedMenus = new Set(prevSelectedMenus);
      if (updatedSelectedMenus.has(menuId)) {
        updatedSelectedMenus.delete(menuId);
      } else {
        updatedSelectedMenus.add(menuId);
      }
      return updatedSelectedMenus;
    });
  };

  const handleSelectAllChange = (event) => {
    if (event.target.checked) {
      setSelectedMenus(new Set(menuList.map((menu) => menu.menu_id)));
    } else {
      setSelectedMenus(new Set());
    }
  };
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    if (selectedMenus.size === 0) {
      toast.error("Please select at least one menu.");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      await axios.post(
        `${API_URL}/api/update_access/${roleId}`,
        {
          role_id: role.id,
          menu_ids: Array.from(selectedMenus),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      toast.success("Access updated successfully!");
      navigate("/manageRoleAccess");
    } catch (error) {
      console.error("Submission error:", error);

      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        // Loop through each error field and display all messages
        Object.values(backendErrors)
          .flat()
          .forEach((msg) => {
            toast.error(msg);
          });
      } else {
        toast.error(`Error: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // const handleSubmit = async (event) => {
  //   event.preventDefault();

  //   try {
  //     const token = localStorage.getItem("authToken");

  //     if (!token) {
  //       throw new Error("No authentication token found");
  //     }

  //     await axios.post(
  //       `${API_URL}/api/update_access/${roleId}`,
  //       {
  //         role_id: role.id,
  //         menu_ids: Array.from(selectedMenus),
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //         withCredentials: true,
  //       }
  //     );

  //     toast.success("Access updated successfully!");
  //     navigate("/show_roles");
  //   } catch (error) {
  //     toast.error(`Error: ${error.message}`);
  //   }
  // };
  useEffect(() => {
    setPageCount(Math.ceil(filteredMenuList.length / pageSize));
  }, [menuList, searchTerm]);

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const searchLower = searchTerm.trim().toLowerCase();
  const filteredMenuList = menuList.filter(
    (menu) =>
      menu.name?.toLowerCase().includes(searchLower) ||
      String(menu.menu_id).includes(searchLower)
  );

  const displayedMenus = filteredMenuList.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  useEffect(() => {
    if (searchLower !== "" && prevSearchTermRef.current === "") {
      previousPageRef.current = currentPage;
      setCurrentPage(0);
    }
    if (searchLower === "" && prevSearchTermRef.current !== "") {
      setCurrentPage(previousPageRef.current);
    }
    prevSearchTermRef.current = searchLower;
  }, [searchTerm]);
  // if (loading) return <p>Loading...</p>;
  // if (error) return <p>Error: {error}</p>;

  return (
    <>
      <ToastContainer />
      <div className="container md:mt-4">
        <div className="card mx-auto lg:w-3/4 shadow-lg">
          <div className="card-header flex justify-between items-center">
            <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
              Role:{" "}
              <span className="text-blue-500 font-semibold hover:text-blue-600 cursor-pointer ">
                {role?.name || " "}
              </span>{" "}
              Access Details
            </h3>
            <RxCross1
              className="text-xl  text-red-600 hover:cursor-pointer"
              onClick={() => navigate("/manageRoleAccess")}
            />
          </div>

          <div
            className="w-[97%] h-1 mx-auto "
            style={{ backgroundColor: "#C03078" }}
          ></div>

          <div className="card-body w-full md:w-[85%] mx-auto">
            <div className="flex flex-row w-full justify-end items-center gap-2 relative top-2">
              <h5 className=" w-[50%] text-center text-blue-500 ">
                List of Menus URLs
              </h5>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <LoaderStyle />
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="h-[400px] overflow-y-scroll">
                  <table className="min-w-full leading-normal table-auto">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className=" w-full md:w-[15%] text-center px-3 py-2 border border-gray-950 text-sm font-semibold">
                          Menu ID
                        </th>
                        <th className=" text-center px-3 py-2 border border-gray-950 text-sm font-semibold">
                          Menu Name
                        </th>

                        <th className=" w-full md:w-[20%] text-center px-3 py-2 border border-gray-950 text-sm font-semibold">
                          <div className="form-check flex gap-2">
                            <input
                              type="checkbox"
                              id="select_all"
                              className="form-check-input "
                              onChange={handleSelectAllChange}
                              checked={
                                displayedMenus.length > 0 &&
                                displayedMenus.every((menu) =>
                                  selectedMenus.has(menu.menu_id)
                                )
                              }
                            />
                            <label
                              htmlFor="select_all"
                              className="form-check-label relative top-0.5"
                            >
                              Select All
                            </label>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedMenus.map((menu, index) => (
                        <tr
                          key={menu.menu_id}
                          className={`${
                            index % 2 === 0 ? "bg-white" : "bg-gray-100"
                          } hover:bg-gray-50`}
                        >
                          <td className="text-center px-3 py-2 border border-gray-950 text-sm">
                            {menu.menu_id}
                          </td>
                          <td
                            className="text-center px-3 py-2 border border-gray-950 text-sm"
                            style={{
                              fontWeight:
                                menu.parent_id === 0 ? "bold" : "normal",
                              paddingLeft:
                                menu.parent_id !== 0 ? "30px" : "12px",
                            }}
                          >
                            {menu.name}
                          </td>

                          <td className="text-center px-3 py-2 border border-gray-950 text-sm">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={selectedMenus.has(menu.menu_id)}
                              onChange={() =>
                                handleCheckboxChange(menu.menu_id)
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>{" "}
                </div>

                <div className="flex justify-between items-center px-3 mt-4 flex-wrap">
                  {/* Pagination - Centered */}
                  <div className="flex-grow flex justify-center order-1 md:order-none w-full md:w-auto mb-2 md:mb-0">
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

                  {/* Button - Right Aligned */}
                  <div className="order-2 md:order-none relative -top-4">
                    <button
                      type="button"
                      className="btn btn-primary px-3"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Updating..." : "Update"}
                    </button>
                  </div>
                </div>

                {/* <div className="text-center mt-4">
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </div> */}
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ManageRoleAccess;
