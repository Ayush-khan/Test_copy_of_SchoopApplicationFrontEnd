import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import ReactPaginate from "react-paginate";

const BookDetails = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategoryGroup, setSelectedCategoryGroup] = useState(null);

  const [currentPage, setCurrentPage] = useState(0);

  const [categoryGroup, setCategoryGroup] = useState([]);
  const [categoryName, setCategoryName] = useState([]);

  const [selectedCategoryGroupId, setSelectedCategoryGroupId] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingForSearch, setLoadingForSearch] = useState(false);

  const [author, setAuthor] = useState("");
  const [title, setTitle] = useState("");
  const [assessionNo, setAssessionNo] = useState("");

  const navigate = useNavigate();
  const [loadingExams, setLoadingExams] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [timetable, setTimetable] = useState([]);
  const [isNewArrival, setIsNewArrival] = useState(false);

  const pageSize = 10;
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);

  useEffect(() => {
    fetchCategoryGroup();

    // always call API, with or without groupId
    fetchCategoryName(selectedCategoryGroupId);
  }, [selectedCategoryGroupId]);

  const fetchCategoryGroup = async () => {
    try {
      setLoadingExams(true);
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/get_category_group_name`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("group name:", response.data);

      // Ensure response is an array before setting state
      if (Array.isArray(response.data)) {
        setCategoryGroup(response.data);
      } else {
        setCategoryGroup([]); // Default to empty array
        console.error("Unexpected API response format:", response.data);
      }
    } catch (error) {
      toast.error("Error fetching Students");
      console.error("Error fetching Students:", error);
    } finally {
      setLoadingExams(false);
    }
  };

  const fetchCategoryName = async (groupId) => {
    try {
      setLoadingExams(true);
      const token = localStorage.getItem("authToken");

      // build URL conditionally
      let url = `${API_URL}/api/get_allcategoryname`;
      if (groupId) {
        url += `?category_group_id=${groupId}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("all category name:", response.data.data);

      if (Array.isArray(response.data.data)) {
        setCategoryName(response.data.data);
      } else {
        setCategoryName([]);
        console.error("Unexpected API response format:", response.data);
      }
    } catch (error) {
      toast.error("Error fetching categories");
      console.error("Error fetching categories:", error);
    } finally {
      setLoadingExams(false);
    }
  };

  const handleCategorySelect = (selectedOption) => {
    setSelectedCategory(selectedOption);
    setSelectedCategoryId(selectedOption?.value);
  };

  const categoryOptions = useMemo(() => {
    if (!Array.isArray(categoryName)) return []; // Prevent crash
    return categoryName.map((cls) => ({
      value: cls?.category_id,
      label: `${cls?.call_no} / ${cls?.category_name}`,
    }));
  }, [categoryName]);

  // const handleSearch = async () => {
  //   setLoadingForSearch(true);
  //   setIsSubmitting(true);
  //   setLoading(true);

  //   try {
  //     const token = localStorage.getItem("authToken");

  //     let params = {};
  //     if (assessionNo) params.accession_no = assessionNo;
  //     if (title) params.title = title;
  //     if (author) params.author = author;
  //     if (selectedCategoryGroup)
  //       params.category_group_id = selectedCategoryGroup.value;
  //     if (selectedCategory) params.category_id = selectedCategory.value;

  //     if (isNewArrival) params.is_new = true;

  //     console.log("Search Params:", params);

  //     //get_all_books
  //     const response = await axios.get(`${API_URL}/api/books/search`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //       params,
  //       paramsSerializer: (params) => {
  //         return new URLSearchParams(params).toString();
  //       },
  //     });

  //     console.log("API Response:", response?.data);

  //     if (!response?.data?.data || response?.data?.data?.length === 0) {
  //       setTimetable([]);
  //       setPageCount(0);
  //       setCurrentPage(0);
  //       toast.error("No records found for selected criteria.");
  //     } else {
  //       setTimetable(response?.data?.data);

  //       setPageCount(Math.ceil(response?.data?.data?.length || 0 / pageSize));
  //       setCurrentPage(0);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching report:", error);
  //     toast.error("Error fetching data. Please try again.");
  //   } finally {
  //     setIsSubmitting(false);
  //     setLoadingForSearch(false);
  //     setLoading(false);
  //   }
  // };

  const handleSearch = async () => {
    setLoadingForSearch(true);
    setIsSubmitting(true);
    setLoading(true);

    try {
      // Check if ALL fields are empty
      if (
        !assessionNo &&
        !title &&
        !author &&
        !selectedCategory &&
        !selectedCategoryGroup &&
        !isNewArrival
      ) {
        toast.error("Please enter one of the search criteria.");
        setLoading(false);
        setLoadingForSearch(false);
        setIsSubmitting(false);
        return;
      }

      const token = localStorage.getItem("authToken");

      let params = {};
      if (assessionNo) params.accession_no = assessionNo;
      if (title) params.title = title;
      if (author) params.author = author;
      if (selectedCategoryGroup)
        params.category_group_id = selectedCategoryGroup.value;
      if (selectedCategory) params.category_id = selectedCategory.value;
      if (isNewArrival) params.is_new = true;

      console.log("Search Params:", params);

      const response = await axios.get(`${API_URL}/api/books/search`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
        paramsSerializer: (params) => {
          return new URLSearchParams(params).toString();
        },
      });

      console.log("API Response:", response?.data);

      if (!response?.data?.data || response?.data?.data?.length === 0) {
        setTimetable([]);
        setPageCount(0);
        setCurrentPage(0);
        toast.error("No records found for selected criteria.");
      } else {
        setTimetable(response?.data?.data);
        setPageCount(Math.ceil((response?.data?.data?.length || 0) / pageSize));
        setCurrentPage(0);
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      toast.error("Error fetching data. Please try again.");
    } finally {
      setIsSubmitting(false);
      setLoadingForSearch(false);
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    navigate(`/bookDetails/edit/${category.book_id}`, {
      state: { category },
    });
  };

  console.log("row", timetable);

  const handleDelete = (id) => {
    console.log("id", id);
    setCurrentSection("");
    const sectionToDelete = timetable.find((leave) => leave.book_id === id);

    setCurrentSection(sectionToDelete);
    setShowDeleteModal(true);
  };

  const handleSubmitDelete = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");

      if (!token || !currentSection || !currentSection.book_id) {
        throw new Error("Book is missing");
      }

      const response = await axios.delete(
        `${API_URL}/api/books/delete/${currentSection.book_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      // fetchSections();
      if (response.data.success) {
        setShowDeleteModal(false);
        setCurrentSection(null);
        toast.success("Book delete successfully!");
      } else {
        toast.error(response.data.message || "Failed to delete book");
      }
    } catch (error) {
      console.error("Error deleting Book:", error);
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Server error. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
      setShowDeleteModal(false);
    }
  };

  const handleCloseModal = () => {
    setShowDeleteModal(false);

    setCurrentSection(null);
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

  const filteredSections = timetable.filter((student) => {
    const searchLower = searchTerm.trim().replace(/\s+/g, " ").toLowerCase();

    const normalize = (value) =>
      value?.toString().trim().replace(/\s+/g, " ").toLowerCase() || "";

    // Normalize all relevant fields for search
    const studentName = normalize(student?.book_title);
    const accessionNo = normalize(student?.accession_no);
    const className = normalize(student?.author);
    const status = normalize(student?.Status_code);
    const amount = normalize(student?.copy_id);
    const receiptNo = normalize(student?.location_of_book);
    const combined = normalize(
      `${student?.call_no || ""} / ${student?.category_name || ""}`
    );

    // Check if the search term is present in any of the specified fields
    return (
      studentName.includes(searchLower) ||
      accessionNo.includes(searchLower) ||
      className.includes(searchLower) ||
      status.includes(searchLower) ||
      amount.includes(searchLower) ||
      receiptNo.includes(searchLower) ||
      combined.includes(searchLower)
    );
  });

  useEffect(() => {
    setPageCount(Math.ceil(filteredSections.length / pageSize));
  }, [filteredSections, pageSize]);

  const displayedSections = filteredSections.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  return (
    <>
      <div className="w-full md:w-[100%] mx-auto p-4 ">
        <ToastContainer />
        <div className="card rounded-md ">
          <div className=" card-header mb-4 flex justify-between items-center ">
            <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
              Book Details
            </h5>
            <RxCross1
              className=" relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
              onClick={() => {
                navigate("/dashboard");
              }}
            />
          </div>
          <div
            className=" relative w-[98%] -top-6 h-1  mx-auto bg-red-700 "
            style={{
              backgroundColor: "#C03078",
            }}
          ></div>

          <>
            {/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pl-4 pb-4">
              
              <div className="flex flex-col">
                <label className="text-md mb-1">Enter/Scan AccessionNo.</label>
                <input
                  type="text"
                  placeholder="Accession No."
                  value={assessionNo}
                  onChange={(e) => setAssessionNo(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                />
              </div>

             
              <div className="flex flex-col">
                <label className="text-md mb-1">Call No. / Category</label>
                <Select
                  value={selectedCategory}
                  onChange={handleCategorySelect}
                  options={categoryOptions}
                  placeholder={loadingExams ? "Loading..." : "Select"}
                  isSearchable
                  isClearable
                  isDisabled={loadingExams}
                  className="text-sm w-full"
                />
              </div>

            
              <div className="flex flex-col">
                <label className="text-md mb-1">Book Title</label>
                <input
                  type="text"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                />
              </div>

            
              <div className="flex flex-col">
                <label className="text-md mb-1">Author</label>
                <input
                  type="text"
                  placeholder="Author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                />
              </div>

              <div className="flex items-center gap-4 mt-4">
                <button
                  type="search"
                  onClick={handleSearch}
                  style={{ backgroundColor: "#2196F3" }}
                  className={`h-10 text-white font-bold py-1 px-6 rounded ${
                    loadingForSearch ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={loadingForSearch}
                >
                  {loadingForSearch ? "Searching..." : "Search"}
                </button>
              </div>
            </div> */}

            <form
              onSubmit={(e) => {
                e.preventDefault(); // prevents page reload
                handleSearch();
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 pl-4 pb-4">
                <div className="flex flex-col">
                  <label className="text-md mb-1">
                    Enter/Scan AccessionNo.
                  </label>
                  <input
                    type="text"
                    placeholder="Accession No."
                    value={assessionNo}
                    onChange={(e) => setAssessionNo(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-md mb-1">Call No. / Category</label>
                  <Select
                    value={selectedCategory}
                    onChange={handleCategorySelect}
                    options={categoryOptions}
                    placeholder={loadingExams ? "Loading..." : "Select"}
                    isSearchable
                    isClearable
                    isDisabled={loadingExams}
                    className="text-sm w-full"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-md mb-1">Book Title</label>
                  <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-md mb-1">Author</label>
                  <input
                    type="text"
                    placeholder="Author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  />
                </div>

                <div className="flex items-center gap-4 mt-4">
                  <button
                    type="submit"
                    style={{ backgroundColor: "#2196F3" }}
                    className={`h-10 text-white font-bold py-1 px-6 rounded ${
                      loadingForSearch ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={loadingForSearch}
                  >
                    {loadingForSearch ? "Searching..." : "Search"}
                  </button>
                </div>
              </div>
            </form>

            {/* {timetable.length > 0 && ( */}
            <>
              <div className="w-full  p-2">
                <div className="card mx-auto lg:w-full shadow-lg">
                  <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
                    <div className="w-full flex flex-row justify-between mr-0 md:mr-4 ">
                      <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
                        Manage Books
                      </h3>
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
                          onClick={() => navigate("/createBook")}
                        >
                          <FontAwesomeIcon
                            icon={faPlus}
                            style={{ marginRight: "5px" }}
                          />
                          Add
                        </button>
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
                      className="h-96 lg:h-96 overflow-y-scroll overflow-x-scroll"
                      style={{
                        scrollbarWidth: "thin",
                        scrollbarColor: "#C03178 transparent",
                      }}
                    >
                      <table className="min-w-full leading-normal table-auto">
                        <thead>
                          <tr className="bg-gray-100">
                            <th
                              style={{ width: "10px" }}
                              className="px-2 text-center py-2 border border-gray-950 text-sm font-semibold"
                            >
                              Sr No.
                            </th>
                            <th
                              style={{ width: "30px" }}
                              className="px-2 text-center py-2 border border-gray-950 text-sm font-semibold"
                            >
                              Accession No.
                            </th>
                            <th
                              style={{ width: "200px" }}
                              className="px-2 text-center py-2 border border-gray-950 text-sm font-semibold"
                            >
                              Book Title
                            </th>
                            <th
                              style={{ width: "150px" }}
                              className="px-2 text-center py-2 border border-gray-950 text-sm font-semibold"
                            >
                              Call No./Category
                            </th>
                            <th
                              style={{ width: "150px" }}
                              className="px-2 text-center py-2 border border-gray-950 text-sm font-semibold"
                            >
                              Author
                            </th>

                            <th
                              style={{ width: "200px" }}
                              className="px-2 text-center py-2 border border-gray-950 text-sm font-semibold"
                            >
                              Publisher
                            </th>
                            <th
                              style={{ width: "10px" }}
                              className="px-2 text-center py-2 border border-gray-950 text-sm font-semibold"
                            >
                              Edit
                            </th>
                            <th
                              style={{ width: "10px" }}
                              className="px-2 text-center py-2 border border-gray-950 text-sm font-semibold"
                            >
                              Delete
                            </th>
                          </tr>
                        </thead>
                        {timetable.length > 0 && (
                          <tbody>
                            {loading ? (
                              <div className=" absolute left-[4%] w-[100%]  text-center flex justify-center items-center mt-14">
                                <div className=" text-center text-xl text-blue-700">
                                  Please wait while data is loading...
                                </div>
                              </div>
                            ) : displayedSections.length ? (
                              displayedSections?.map((student, index) => (
                                <tr
                                  key={`${student.book_id}-${index}`}
                                  className="border border-gray-300"
                                >
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {currentPage * pageSize + index + 1}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student?.copy_id || " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student?.book_title || " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student?.call_no || ""} /{" "}
                                    {student?.category_name || ""}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student?.author
                                      ? student.author
                                          .toLowerCase()
                                          .split(" ")
                                          .map(
                                            (word) =>
                                              word.charAt(0).toUpperCase() +
                                              word.slice(1)
                                          )
                                          .join(" ")
                                      : " "}
                                  </td>
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    {student?.publisher
                                      ? student.publisher
                                          .toLowerCase()
                                          .split(" ")
                                          .map(
                                            (word) =>
                                              word.charAt(0).toUpperCase() +
                                              word.slice(1)
                                          )
                                          .join(" ")
                                      : " "}
                                  </td>

                                  <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                                    <button
                                      className="text-blue-600 hover:text-blue-800 hover:bg-transparent "
                                      onClick={() => handleEdit(student)}
                                    >
                                      <FontAwesomeIcon icon={faEdit} />
                                    </button>{" "}
                                  </td>
                                  <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                                    <button
                                      className="text-red-600 hover:text-red-800 hover:bg-transparent "
                                      onClick={() =>
                                        handleDelete(student.book_id)
                                      }
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
                        )}
                      </table>
                    </div>
                    <div className=" flex justify-center pt-2 -mb-3">
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
            </>
            {/* )} */}
          </>
        </div>

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
                    Are you sure you want to delete this book:{" "}
                    {currentSection.book_title}?
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
      </div>
    </>
  );
};

export default BookDetails;
