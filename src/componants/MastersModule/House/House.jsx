import { useEffect, useState, useRef } from "react";
import axios from "axios";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RxCross1 } from "react-icons/rx";
import namer from "color-namer";

// function getHexColor(colorName) {
//   const temp = document.createElement("div");
//   temp.style.color = colorName;

//   document.body.appendChild(temp);
//   const computedColor = getComputedStyle(temp).color;
//   document.body.removeChild(temp);

//   const rgb = computedColor.match(/\d+/g);
//   if (!rgb) return null;

//   return (
//     "#" +
//     rgb
//       .slice(0, 3)
//       .map((x) => {
//         const hex = parseInt(x).toString(16);
//         return hex.length === 1 ? "0" + hex : hex;
//       })
//       .join("")
//   );
// }

function getHexColor(colorName) {
  if (!colorName) return null;

  const normalized = colorName.replace(/\s+/g, "").toLowerCase();

  const temp = document.createElement("div");
  temp.style.color = normalized;
  document.body.appendChild(temp);

  const computedColor = getComputedStyle(temp).color;
  document.body.removeChild(temp);

  const rgb = computedColor.match(/\d+/g);

  // If CSS does not recognize color, rgb will be null
  if (!rgb) return null;

  return (
    "#" +
    rgb
      .slice(0, 3)
      .map((x) => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

function generateShades(hex) {
  const shades = [];

  // convert hex → rgb
  let r = parseInt(hex.substring(1, 3), 16);
  let g = parseInt(hex.substring(3, 5), 16);
  let b = parseInt(hex.substring(5, 7), 16);

  for (let i = 1; i <= 5; i++) {
    let factor = i * 0.2;

    // lighter shades
    let newR = Math.min(255, Math.floor(r + (255 - r) * factor));
    let newG = Math.min(255, Math.floor(g + (255 - g) * factor));
    let newB = Math.min(255, Math.floor(b + (255 - b) * factor));

    shades.push(`rgb(${newR}, ${newG}, ${newB})`);
  }

  for (let i = 1; i <= 5; i++) {
    let factor = i * 0.2;

    // darker shades
    let newR = Math.max(0, Math.floor(r * (1 - factor)));
    let newG = Math.max(0, Math.floor(g * (1 - factor)));
    let newB = Math.max(0, Math.floor(b * (1 - factor)));

    shades.push(`rgb(${newR}, ${newG}, ${newB})`);
  }

  return shades;
}

function House() {
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
  const [nameAvailable, setNameAvailable] = useState(true);
  const [classes, setClasses] = useState([
    { value: "#0000FF", label: "Blue" },
    { value: "#00FF00", label: "Green" },
    { value: "#FF0000", label: "Red" },
    { value: "#FFFF00", label: "Yellow" },
  ]);

  const [colorInput, setColorInput] = useState("");
  const [hexColor, setHexColor] = useState("");
  const [shades, setShades] = useState([]);
  const [colorName, setColorName] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    setColorInput(value);

    const hex = getHexColor(value);

    if (hex) {
      setHexColor(hex);
      setShades(generateShades(hex));
      setFieldErrors((prevErrors) => ({
        ...prevErrors,
        department_id: validateSectionName(newSectionName, value).department_id,
      }));
    } else {
      setHexColor("");
      setShades([]);
    }
  };

  const [roleId, setRoleId] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");

  const colorSuggestions = [
    { value: "#0000FF", label: "Blue" },
    { value: "#00FF00", label: "Green" },
    { value: "#FF0000", label: "Red" },
    { value: "#FFFF00", label: "Yellow" },
  ];

  const pageSize = 10;
  useEffect(() => {
    fetchDataRoleId();
    fetchSections();
  }, []);
  // for role_id
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
      setRoleId(sessionResponse?.data?.user.role_id); // Store role_id
      // setRoleId("A"); // Store role_id
      //   console.log("roleIDis:", roleId);
      // Fetch academic year data
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const fetchSections = async () => {
    try {
      const token = localStorage.getItem("authToken");
      // const academicYr = localStorage.getItem("academicYear");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(`${API_URL}/api/get_all_houses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      console.log("houses", response.data.data);
      setSections(response.data.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

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

  // Filtering based on subject_type or name
  const searchLower = searchTerm.trim().toLowerCase();
  const filteredSections = Array.isArray(sections)
    ? sections.filter(
        (section) =>
          section?.color_code?.toLowerCase().includes(searchLower) ||
          section?.house_name?.toLowerCase().includes(searchLower),
      )
    : [];

  // Update page count based on filtered results
  useEffect(() => {
    setPageCount(Math.ceil(filteredSections.length / pageSize));
  }, [filteredSections, pageSize]);

  // Paginate results
  const displayedSections = filteredSections.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize,
  );

  useEffect(() => {
    setPageCount(Math.ceil(filteredSections.length / pageSize));
  }, [filteredSections]);

  const validateSectionName = (name, hexColor) => {
    const errors = {};

    if (!name || name.trim() === "") {
      errors.name = "Please enter house name.";
    } else if (name.trim().length > 20) {
      errors.name = "The house name must not exceed 20 characters.";
    }

    if (!hexColor) {
      errors.department_id = "Please enter house color.";
    }

    return errors;
  };

  const getColorName = (hex) => {
    try {
      const result = namer(hex);
      // Use basic color name
      return result.basic[0].name;
    } catch (err) {
      return "Unknown";
    }
  };
  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const handleEdit = (section) => {
    setCurrentSection(section);
    console.log("this is edit ", section.house_name);
    console.log("sectionsID for subject", section.house_id);
    setNewSectionName(section.house_name);
    setClassName(section.house_name);
    setColorInput(getColorName(section.color_code));
    setColorName(getColorName(section.color_code));
    setHexColor(section.color_code);
    setShowEditModal(true);
  };

  const handleAdd = () => {
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setNewSectionName("");
    setNewDepartmentId("");
    setCurrentSection(null);
    setFieldErrors({});
    setNameError("");
    setColorInput("");
    setHexColor("");
    setShades([]);
  };

  const handleSubmitAdd = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const validationErrors = validateSectionName(newSectionName, hexColor);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No authentication token or academic year found");
      }

      await axios.post(
        `${API_URL}/api/create_house`,
        {
          house_name: newSectionName,
          color: hexColor,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        },
      );

      fetchSections();
      handleCloseModal();
      toast.success("House added successfully!");
    } catch (error) {
      console.error("Error adding house:", error);

      if (error.response) {
        if (error.response.status === 409) {
          toast.error(error.response.data.message);
        } else if (
          error.response.status === 422 &&
          error.response.data.errors
        ) {
          Object.values(error.response.data.errors).forEach((err) =>
            toast.error(err),
          );
        } else {
          toast.error(error.response.data?.message || "Server error.");
        }
      } else {
        toast.error("Network error. Please check your connection.");
      }
    } finally {
      setIsSubmitting(false); // Re-enable the button after the operation
    }
  };

  const handleSubmitEdit = async () => {
    if (isSubmitting) return; // Prevent re-submitting
    setIsSubmitting(true);
    const validationErrors = validateSectionName(newSectionName, hexColor);
    if (Object.keys(validationErrors).length) {
      setFieldErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No authentication token or academic year found");
      }

      await axios.put(
        `${API_URL}/api/update_house/${currentSection.house_id}`,
        {
          house_name: newSectionName,
          color_code: hexColor,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        },
      );

      fetchSections();
      handleCloseModal();
      toast.success("House updated successfully!");
    } catch (error) {
      console.error("Error adding house:", error);

      if (error.response) {
        if (error.response.status === 409) {
          toast.error(error.response.data.message);
        } else if (
          error.response.status === 422 &&
          error.response.data.errors
        ) {
          Object.values(error.response.data.errors).forEach((err) =>
            toast.error(err),
          );
        } else {
          toast.error(error.response.data?.message || "Server error.");
        }
      } else {
        toast.error("Network error. Please check your connection.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    console.log("the deleted house id", id);
    const sectionToDelete = sections.find((sec) => sec.house_id === id);
    setCurrentSection(sectionToDelete);
    setShowDeleteModal(true);
  };

  const handleSubmitDelete = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");

      if (!token || !currentSection || !currentSection.house_id) {
        throw new Error("house ID is missing");
      }

      const response = await axios.delete(
        `${API_URL}/api/delete_house/${currentSection.house_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        },
      );

      if (response.data.success) {
        fetchSections();
        setShowDeleteModal(false);
        setCurrentSection(null);
        toast.success("House deleted successfully!");
      } else {
        toast.error(response.data.message || "Failed to delete Division");
      }
    } catch (error) {
      console.error("Error deleting House:", error);

      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Server error. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
      setShowDeleteModal(false);
    }
  };

  const handleChangeSectionName = (e) => {
    const { value } = e.target;
    setNewSectionName(value);
    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      name: validateSectionName(value, newDepartmentId).name,
    }));
  };

  const camelCase = (str) =>
    str
      ?.toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  // const camelCase = (str) =>
  //   str
  //     ?.toLowerCase()
  //     .split(/[\s.]+/) // split by space OR dot
  //     .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ""))
  //     .join(" ");

  return (
    <>
      <ToastContainer />

      <div className="container mt-4">
        <div className="card mx-auto lg:w-3/4 shadow-lg">
          <div className="p-2 px-3 bg-gray-100 flex justify-between items-center">
            <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
              House
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

              {roleId !== "M" ? (
                loading ? ( // Replace isLoading with your actual loading flag
                  <div className="h-9 w-20 bg-gray-300 animate-pulse rounded-sm"></div>
                ) : (
                  <button
                    className="btn btn-primary btn-sm md:h-9 text-xs md:text-sm"
                    onClick={handleAdd}
                  >
                    <FontAwesomeIcon
                      icon={faPlus}
                      style={{ marginRight: "5px" }}
                    />
                    Add
                  </button>
                )
              ) : null}
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
              className={`h-96 lg:h-96 overflow-y-scroll lg:overflow-x-hidden mx-auto ${
                roleId === "M" ? "w-full md:w-[65%]" : "w-full md:w-[80%]"
              }`}
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
                        <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          Sr. No
                        </th>
                        <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          House Name
                        </th>
                        <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          Color
                        </th>
                        {roleId !== "M" && (
                          <>
                            <th className="px-2  text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Edit
                            </th>
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Delete
                            </th>
                          </>
                        )}
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
                                {/* {camelCase(section?.house_name)} */}
                                {section?.house_name}
                              </p>
                            </td>
                            <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                              <p className="text-gray-900 whitespace-no-wrap relative top-2">
                                {/* {classes.find(
                                  (cls) => cls.value === section?.color_code,
                                )?.label || section?.color_code} */}
                                {camelCase(getColorName(section.color_code))}
                              </p>
                            </td>
                            {roleId !== "M" && (
                              <>
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
                                    onClick={() =>
                                      handleDelete(section.house_id)
                                    }
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </button>
                                </td>
                              </>
                            )}
                          </tr>
                        ))
                      ) : sections.length === 0 ? (
                        <tr>
                          <td
                            colSpan="7"
                            className="text-center py-6 text-red-700 text-lg"
                          >
                            Please create house to view.
                          </td>
                        </tr>
                      ) : (
                        <tr>
                          <td
                            colSpan="7"
                            className="text-center py-6 text-red-700 text-lg"
                          >
                            Result not found!
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
                    <h5 className="modal-title">Create House</h5>
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
                    <div className=" relative mb-3 flex justify-center  mx-4">
                      <label htmlFor="sectionName" className="w-[45%] mt-2">
                        House Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={20}
                        className="form-control shadow-md mb-2"
                        id="sectionName"
                        value={newSectionName}
                        onChange={handleChangeSectionName}
                      />{" "}
                      <div className="absolute top-9 left-1/3">
                        {!nameAvailable && (
                          <span className=" block text-danger text-xs">
                            {nameError}
                          </span>
                        )}
                        {fieldErrors.name && (
                          <small className="text-danger text-xs">
                            {fieldErrors.name}
                          </small>
                        )}
                      </div>
                    </div>

                    {/* <div className="relative mb-3 mx-4">
                      <div className="flex items-center gap-3">
                        <label htmlFor="departmentId" className="w-[40%] ">
                          Color<span className="text-red-500">*</span>
                        </label>

                        <input
                          type="text"
                          placeholder="Enter color (e.g. blue)"
                          value={colorInput}
                          onChange={handleChange}
                          className="form-control shadow-md mb-2"
                        />
                      </div>

                      {fieldErrors.department_id && (
                        <span className="text-danger text-xs ml-[33%]">
                          {fieldErrors.department_id}
                        </span>
                      )}

                      {hexColor && (
                        <div className="mt-3 ml-[33%]">
                          <div
                            style={{
                              width: "30px",
                              height: "30px",
                              backgroundColor: hexColor,
                              border: "1px solid #000",
                              marginTop: "5px",
                            }}
                          />
                        </div>
                      )}
                    </div> */}
                    {/* <div className="relative mb-3 mx-4">
                      <div className="flex items-center gap-3">
                        <label className="w-[40%]">
                          Color<span className="text-red-500">*</span>
                        </label>

                        <input
                          type="text"
                          placeholder="Enter custom color"
                          value={colorInput}
                          onChange={handleChange}
                          className="form-control shadow-md mb-2"
                          maxLength={30}
                        />
                      </div>

                      <div className="flex gap-2 mt-2 ml-[33%]">
                        {colorSuggestions.map((color) => (
                          <div
                            key={color.value}
                            title={color.label}
                            onClick={() => {
                              setColorInput(color.label); // show name in input
                              setHexColor(color.value); // store HEX
                              setShades(generateShades(color.value));

                              // clear error
                              setFieldErrors((prev) => ({
                                ...prev,
                                department_id: "",
                              }));
                            }}
                            style={{
                              width: "30px",
                              height: "30px",
                              backgroundColor: color.value,
                              border: "2px solid #ccc",
                              cursor: "pointer",
                              borderRadius: "4px",
                            }}
                          />
                        ))}
                      </div>

                      {fieldErrors.department_id && (
                        <span className="text-danger text-xs ml-[33%]">
                          {fieldErrors.department_id}
                        </span>
                      )}

                      {hexColor && (
                        <div className="mt-3 ml-[33%] flex items-center gap-2">
                          <div
                            style={{
                              width: "30px",
                              height: "30px",
                              backgroundColor: hexColor,
                              border: "1px solid #000",
                            }}
                          />
                          <span className="text-sm">{colorInput}</span>
                        </div>
                      )}
                    </div> */}
                    <div className="relative mb-1 mx-4">
                      {/*  Suggestions ABOVE input */}
                      <div className="ml-[33%] mb-1">
                        <span className="text-xs font-medium text-gray-600">
                          Default Color:
                        </span>
                      </div>
                      <div className="flex gap-2 mb-2 ml-[33%]">
                        {colorSuggestions.map((color) => (
                          <div
                            key={color.value}
                            title={color.label}
                            onClick={() => {
                              setColorInput(color.label); // show name
                              setHexColor(color.value); // store HEX
                              setShades(generateShades(color.value));

                              setFieldErrors((prev) => ({
                                ...prev,
                                department_id: "",
                              }));
                            }}
                            style={{
                              width: "30px",
                              height: "30px",
                              backgroundColor: color.value,
                              cursor: "pointer",
                              borderRadius: "4px",
                              border:
                                hexColor === color.value
                                  ? "2px solid black"
                                  : "1px solid #ccc",
                            }}
                          />
                        ))}
                      </div>

                      {/* Label + Input */}
                      <div className="flex items-center gap-3">
                        <label className="w-[40%]">
                          Color<span className="text-red-500">*</span>
                        </label>

                        <input
                          type="text"
                          placeholder="Enter custom color"
                          value={colorInput}
                          onChange={handleChange}
                          className="form-control shadow-md mb-2"
                          maxLength={30}
                        />
                      </div>

                      {/* Error */}
                      {fieldErrors.department_id && (
                        <span className="text-danger text-xs ml-[33%]">
                          {fieldErrors.department_id}
                        </span>
                      )}

                      {hexColor && (
                        <div className="ml-[33%]">
                          <span className="text-xs font-medium text-gray-600">
                            Selectced color:
                          </span>
                        </div>
                      )}

                      {/* Selected Color Preview + Default label */}
                      {hexColor && (
                        <div className="mt-1 ml-[33%] flex items-center gap-2">
                          <div
                            style={{
                              width: "30px",
                              height: "30px",
                              backgroundColor: hexColor,
                              border: "1px solid #000",
                            }}
                          />

                          {/* Default / Selected Color Name */}
                          <span className="text-sm font-medium">
                            {colorInput || "Default: Blue"}
                          </span>
                        </div>
                      )}
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
                  <h5 className="modal-title">Edit House</h5>
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
                  <div className=" relative mb-3 flex justify-center  mx-4">
                    <label htmlFor="sectionName" className="w-[45%] mt-2">
                      House Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={20}
                      className="form-control shadow-md mb-2"
                      id="sectionName"
                      value={newSectionName}
                      onChange={handleChangeSectionName}
                    />{" "}
                    <div className="absolute top-9 left-1/3">
                      {!nameAvailable && (
                        <span className=" block text-danger text-xs">
                          {nameError}
                        </span>
                      )}
                      {fieldErrors.name && (
                        <small className="text-danger text-xs">
                          {fieldErrors.name}
                        </small>
                      )}
                    </div>
                  </div>

                  {/* <div className="relative mb-3 mx-4">
                    <div className="flex items-center gap-3">
                      <label htmlFor="departmentId" className="w-[40%] ">
                        Color<span className="text-red-500">*</span>
                      </label>

                      <input
                        type="text"
                        placeholder="Enter color (e.g. blue)"
                        value={colorInput}
                        onChange={handleChange}
                        className="form-control shadow-md mb-2"
                        maxLength={30}
                      />
                    </div>

                    {fieldErrors.department_id && (
                      <span className="text-danger text-xs ml-[33%]">
                        {fieldErrors.department_id}
                      </span>
                    )}

                    {hexColor && (
                      <div className="mt-3 ml-[33%]">
                        <div
                          style={{
                            width: "30px",
                            height: "30px",
                            backgroundColor: hexColor,
                            border: "1px solid #000",
                            marginTop: "5px",
                          }}
                        />
                      </div>
                    )}
                  </div> */}

                  <div className="relative mb-1 mx-4">
                    <div className="ml-[33%] mb-1">
                      <span className="text-xs font-medium text-gray-600">
                        Default Color:
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2 ml-[33%] mb-1">
                      {colorSuggestions.map((color) => (
                        <div
                          key={color.value}
                          title={color.label}
                          onClick={() => {
                            setColorInput(color.label); // show name
                            setHexColor(color.value); // store HEX
                            setShades(generateShades(color.value));

                            // clear error
                            setFieldErrors((prev) => ({
                              ...prev,
                              department_id: "",
                            }));
                          }}
                          style={{
                            width: "30px",
                            height: "30px",
                            backgroundColor: color.value,
                            cursor: "pointer",
                            borderRadius: "4px",
                            border:
                              hexColor === color.value
                                ? "2px solid black"
                                : "1px solid #ccc",
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <label htmlFor="departmentId" className="w-[40%] ">
                        Color<span className="text-red-500">*</span>
                      </label>

                      <input
                        type="text"
                        placeholder="Enter color (e.g. blue)"
                        value={colorInput}
                        onChange={handleChange}
                        className="form-control shadow-md mb-2"
                        maxLength={30}
                      />
                    </div>

                    {fieldErrors.department_id && (
                      <span className="text-danger text-xs ml-[33%]">
                        {fieldErrors.department_id}
                      </span>
                    )}

                    {hexColor && (
                      <div className="ml-[33%]">
                        <span className="text-xs font-medium text-gray-600">
                          Selectced color:
                        </span>
                      </div>
                    )}

                    {hexColor && (
                      <div className="mt-1 ml-[33%] flex items-center gap-2">
                        <div
                          style={{
                            width: "30px",
                            height: "30px",
                            backgroundColor: hexColor,
                            border: "1px solid #000",
                          }}
                        />
                        <span className="text-sm">{colorInput}</span>
                      </div>
                    )}
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
                  <p>
                    Are you sure you want to delete house:{" "}
                    {currentSection?.house_name}?
                  </p>
                </div>
                <div className=" flex justify-end p-3">
                  {/* <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button> */}
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
      </div>
    </>
  );
}

export default House;
