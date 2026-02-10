import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
import { FiPrinter, FiSearch } from "react-icons/fi";
import { FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";
import ReactPaginate from "react-paginate";

const BooksReport = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategoryGroup, setSelectedCategoryGroup] = useState(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [showSearch, setShowSearch] = useState(false);

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

  const pageSize = 10;
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");
  const isClearingRef = useRef(false);

  const [debouncedSearchTrigger, setDebouncedSearchTrigger] = useState({});
  useEffect(() => {
    if (isClearingRef.current) {
      isClearingRef.current = false;
      return;
    }

    const hasAnyFilter =
      assessionNo ||
      title ||
      author ||
      selectedCategory ||
      selectedCategoryGroup;

    // Always call search when debounce fires
    handleSearch({
      assessionNo: assessionNo || "",
      title: title || "",
      author: author || "",
      selectedCategory: selectedCategory || "",
      selectedCategoryGroup: selectedCategoryGroup || "",
    });
  }, [debouncedSearchTrigger]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTrigger(Date.now()); // just a trigger
    }, 500);

    return () => clearTimeout(timer);
  }, [assessionNo, title, author, selectedCategory, selectedCategoryGroup]);

  useEffect(() => {
    handleSearch();
    fetchCategoryGroup();

    fetchCategoryName(selectedCategoryGroupId);
  }, [selectedCategoryGroupId]);

  // useEffect(() => {
  //   if (isClearingRef.current) {
  //     isClearingRef.current = false;
  //     return;
  //   }

  //   if (
  //     assessionNo ||
  //     title ||
  //     author ||
  //     selectedCategory ||
  //     selectedCategoryGroup
  //   ) {
  //     handleSearch();
  //   }
  // }, [assessionNo, title, author, selectedCategory, selectedCategoryGroup]);

  const fetchCategoryGroup = async () => {
    try {
      setLoadingExams(true);
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/get_category_group_name`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // console.log("group name:", response.data);

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

  const handleCategoryGroupSelect = (selectedOption, actionMeta) => {
    if (actionMeta.action === "clear") {
      isClearingRef.current = true;

      setSelectedCategoryGroup(null);
      setSelectedCategoryGroupId(null);

      handleSearch({ clearAll: true });
      return;
    }

    setSelectedCategoryGroup(selectedOption);
    setSelectedCategoryGroupId(selectedOption.value);
  };

  const categoryGroupOptions = useMemo(() => {
    if (!Array.isArray(categoryGroup)) return []; // Prevent crash
    return categoryGroup.map((cls) => ({
      value: cls?.value,
      label: cls?.label,
    }));
  }, [categoryGroup]);

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

      // console.log("all category name:", response.data.data);

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

  const handleCategorySelect = (selectedOption, actionMeta) => {
    if (actionMeta.action === "clear") {
      isClearingRef.current = true;

      setSelectedCategory(null);
      setSelectedCategoryId(null);

      handleSearch({ clearAll: true });
      return;
    }

    setSelectedCategory(selectedOption);
    setSelectedCategoryId(selectedOption.value);
  };

  const categoryOptions = useMemo(() => {
    if (!Array.isArray(categoryName)) return [];
    return categoryName.map((cls) => ({
      value: cls?.category_id,
      label: `${cls?.call_no} / ${cls?.category_name}`,
    }));
  }, [categoryName]);

  //   const handleSearch = async () => {
  //     setLoadingForSearch(true);
  //     setIsSubmitting(true);
  //     setLoading(true);

  //     try {
  //       const token = localStorage.getItem("authToken");

  //       let params = {};
  //       if (assessionNo) params.accession_no = assessionNo;
  //       if (title) params.title = title;
  //       if (author) params.author = author;
  //       if (selectedCategoryGroup)
  //         params.category_group_id = selectedCategoryGroup.value;
  //       if (selectedCategory) params.category_id = selectedCategory.value;

  //       if (isNewArrival) params.is_new = true;

  //       console.log("Search Params:", params);

  //       const response = await axios.get(
  //         `${API_URL}/api/library/get_books_report`,
  //         {
  //           headers: { Authorization: `Bearer ${token}` },
  //           params,
  //           paramsSerializer: (params) => {
  //             return new URLSearchParams(params).toString();
  //           },
  //         },
  //       );

  //       console.log("API Response:", response?.data);

  //       if (!response?.data?.data || response?.data?.data?.length === 0) {
  //         setTimetable([]);
  //         setPageCount(0);
  //         setCurrentPage(0);
  //         toast.error("No records found for selected criteria.");
  //       } else {
  //         setTimetable(response?.data?.data);

  //         setPageCount(Math.ceil(response?.data?.data?.length || 0 / pageSize));
  //         setCurrentPage(0);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching report:", error);
  //       toast.error("Error fetching data. Please try again.");
  //     } finally {
  //       setIsSubmitting(false);
  //       setLoadingForSearch(false);
  //       setLoading(false);
  //     }
  //   };

  const handleSearch = async ({ clearAll = false } = {}) => {
    setLoadingForSearch(true);
    setIsSubmitting(true);
    setLoading(true);
    setShowSearch(false);

    try {
      const token = localStorage.getItem("authToken");

      let params = {};

      if (!clearAll) {
        if (assessionNo) params.accession_no = assessionNo;
        if (title) params.title = title;
        if (author) params.location_of_book = author;
        if (selectedCategoryGroup)
          params.category_group_id = selectedCategoryGroup.value;
        if (selectedCategory) params.category_id = selectedCategory.value;
      }

      // console.log("Search Params:", params);

      const response = await axios.get(
        `${API_URL}/api/library/get_books_report`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
          paramsSerializer: (params) => new URLSearchParams(params).toString(),
        },
      );

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

  const handlePrint = () => {
    const printTitle = `Books Report`;
    const printContent = `
    <div id="tableMain" class="flex items-center justify-center min-h-screen bg-white">
         <h5 id="tableHeading5"  class="text-lg font-semibold border-1 border-black">${printTitle}</h5>
    <div id="tableHeading" class="text-center w-3/4">
      <table class="min-w-full leading-normal table-auto border border-black mx-auto mt-2">
        <thead>
          <tr class="bg-gray-100">
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Sr.No</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Accession No.</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Date</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Book Title</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Call/Category</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Author</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Publisher/Place of Publication</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Year of Publication</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Edition</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">No. of pages</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Source</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Price</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">ISBN No.</th>
            <th class="px-2 text-center py-2 border border-black text-sm font-semibold">Location</th>
          </tr>
        </thead>
     <tbody>
      ${timetable
        .map((student, index) => {
          return `
          <tr style="background-color: ${index % 2 === 0 ? "#fff" : "#f9fafb"
            };">
            <td style="border: 1px solid #ccc; padding: 6px;">${index + 1}</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${student.copy_id || ""
            }</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${formatDate(
              student.added_date || "",
            )}</td>
            <td style="border: 1px solid #ccc; padding: 6px;">${student.book_title || ""
            }</td>
            <td style="border: 1px solid #ccc; padding: 6px;">
             ${student?.call_no || "-"} / ${student?.category_name || "-"}
            </td>
            <td style="border: 1px solid #ccc; padding: 6px;">${formatDate(
              student.author || "",
            )}</td>
             
             <td style="border: 1px solid #ccc; padding: 6px;">${student.publisher || ""
            }</td>
             <td style="border: 1px solid #ccc; padding: 6px;">${student.year || ""
            }</td>

              <td style="border: 1px solid #ccc; padding: 6px;">${student.edition || ""
            }</td>
               <td style="border: 1px solid #ccc; padding: 6px;">${student.no_of_pages || ""
            }</td>
                <td style="border: 1px solid #ccc; padding: 6px;">${student.source_of_book || ""
            }</td>
             <td style="border: 1px solid #ccc; padding: 6px;">${student.price || ""
            }</td>
              <td style="border: 1px solid #ccc; padding: 6px;">${student.isbn || ""
            }</td>
             <td style="border: 1px solid #ccc; padding: 6px;">${student.location_of_book || ""
            }</td>
          
          </tr>
        `;
        })
        .join("")}
    </tbody>

      </table>
    </div>
  </div>`;

    const printWindow = window.open("", "_blank", "width=2000,height=1000");

    printWindow.document.write(`
    <html>
      <head>
        <title>${printTitle}</title>
        <style>
                   @page {
                size: A4 landscape; /* Wider format for better fit */
                margin: 10px;
            }

                      body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

                       /* Scrollable container */
            #printContainer {
                width: 100%;
                overflow-x: auto;  /* Enables horizontal scrolling */
                white-space: nowrap; /* Prevents text wrapping */
            }

                      #tableMain {
                width: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-start;
                padding: 0 10px;
            }

                       table {
                border-spacing: 0;
                width: 100%;
                min-width: 1200px; /* Ensures table doesn't shrink */
                margin: auto;
                table-layout: fixed; /* Ensures even column spacing */
            }

                      th, td {
                border: 1px solid gray;
                padding: 8px;
                text-align: center;
                font-size: 12px;
                word-wrap: break-word; /* Ensures text breaks properly */
            }

            th {
                font-size: 0.8em;
                background-color: #f9f9f9;
            }


           /* Ensure scrolling is available in print mode */
            @media print {
                #printContainer {
                    overflow-x: auto;
                    display: block;
                    width: 100%;
                    height: auto;
                }
             table {
                    min-width: 100%;
                }
}

        </style>
      </head>
         <body>
        <div id="printContainer">
            ${printContent}
        </div>
    </body>
    </html>
  `);

    printWindow.document.close();

    //  Ensure content is fully loaded before printing
    printWindow.onload = function () {
      printWindow.focus();
      printWindow.print();
      printWindow.close(); // Optional: close after printing
    };
  };

  const handleDownloadEXL = () => {
    if (!displayedSections || displayedSections.length === 0) {
      toast.error("No data available to download the Excel sheet.");
      return;
    }

    // Define headers matching the print table
    const headers = [
      "Sr No.",
      "Accession No.",
      "Date",
      "Book Title",
      "Call No./Category",
      "Author",
      "Publisher/Place of Publication",
      "Year of Publication",
      "Edition",
      "No. of pages",
      "Source",
      "Price",
      "ISBN No.",
      "Location",
    ];
    // Convert displayedSections data to array format for Excel
    const data = filteredSections.map((student, index) => [
      index + 1,
      student?.copy_id || " ",
      formatDate(student?.added_date || " "),
      student?.book_title || " ",
      `${student?.call_no || " "} / ${student?.category_name}`,
      student?.author || " ",
      student?.publisher || " ",
      student?.year || " ",
      student?.edition || " ",
      student?.no_of_pages || " ",
      student?.source_of_book || " ",
      student?.price || " ",
      student?.isbn || " ",
      student?.location_of_book || " ",
    ]);

    // Create a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // Auto-adjust column width
    const columnWidths = headers.map(() => ({ wch: 20 })); // Approx. width of 20 characters per column
    worksheet["!cols"] = columnWidths;

    // Create a workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Books Available Data");

    // Generate and download the Excel file
    const fileName = `Books Report.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // console.log("row", timetable);

  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })
      : "";

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
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

  const filteredSections = timetable.filter((student) => {
    const searchLower = searchTerm.trim().replace(/\s+/g, " ").toLowerCase();

    const normalize = (value) =>
      value?.toString().trim().replace(/\s+/g, " ").toLowerCase() || "";

    const studentName = normalize(student?.book_title);
    const accessionNo = normalize(student?.accession_no);
    const locationBook = normalize(student?.location_of_book);
    const status = normalize(student?.Status_code);
    const amount = normalize(student?.copy_id);
    const author = normalize(student?.author);
    const publisher = normalize(student?.publisher);
    const addedDate = formatDate(normalize(student.added_date));
    const pulicationYear = normalize(student?.year);
    const editionNo = normalize(student?.edition);
    const price = normalize(student?.price);
    const isbnNo = normalize(student?.isbn);
    const combined = normalize(
      `${student?.call_no || ""} / ${student?.category_name || ""}`,
    );

    return (
      studentName.includes(searchLower) ||
      accessionNo.includes(searchLower) ||
      locationBook.includes(searchLower) ||
      status.includes(searchLower) ||
      amount.includes(searchLower) ||
      author.includes(searchLower) ||
      combined.includes(searchLower) ||
      publisher.includes(searchLower) ||
      addedDate.includes(searchLower) ||
      pulicationYear.includes(searchLower) ||
      editionNo.includes(searchLower) ||
      price.includes(searchLower) ||
      isbnNo.includes(searchLower)
    );
  });

  useEffect(() => {
    setPageCount(Math.ceil(filteredSections.length / pageSize));
  }, [filteredSections, pageSize]);

  const displayedSections = filteredSections.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize,
  );

  return (
    <>
      <div className="w-full md:w-[100%] mx-auto p-4 ">
        <ToastContainer />
        <div className="card rounded-md ">
          <div className=" card-header mb-4 flex justify-between items-center ">
            <h5 className="text-gray-700 text-md lg:text-lg">Books Report</h5>
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
          {filteredSections.length > 0 && (
            <div className="md:absolute md:right-7 md:top-[10%] mb-5 text-gray-500">
              <div className="mx-auto w-fit px-2 py-1 bg-blue-50 border border-blue-300 text-blue-800 text-sm rounded text-center">
                <div className="flex flex-col md:flex-row gap-x-1 justify-center md:justify-end">
                  <button
                    type="button"
                    onClick={() => setShowSearch((prev) => !prev)}
                    className="relative bg-blue-400 py-1 hover:bg-blue-500 text-white px-3 rounded group"
                  >
                    <FiSearch size={15} />

                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex items-center justify-center bg-gray-600  text-white text-[.7em] rounded-md py-1 px-2">
                      Search
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadEXL}
                    className="relative bg-blue-400 py-1 hover:bg-blue-500 text-white px-3 rounded group"
                  >
                    <FaFileExcel />

                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex items-center justify-center bg-gray-600  text-white text-[.7em] rounded-md py-1 px-2">
                      Exports to excel
                    </div>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="relative flex flex-row justify-center align-middle items-center gap-x-1 bg-blue-400 hover:bg-blue-500 text-white px-3 rounded group"
                  >
                    <FiPrinter />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex items-center justify-center bg-gray-600  text-white text-[.7em] rounded-md py-1 px-2">
                      Print{" "}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* {filteredSections.length > 0 && (
            <div
              className="
      w-full
      flex justify-end
      md:absolute md:right-7 md:top-[10%]
      mb-4 md:mb-0
    "
            >
              <div
                className="
        w-fit
        px-2 py-2
        bg-blue-50 border border-blue-300
        text-blue-800 text-sm rounded
      "
              >
                <div
                  className="
          flex flex-wrap
          justify-center md:justify-end
          gap-2
        "
                >
                  <button
                    type="button"
                    onClick={() => setShowSearch((prev) => !prev)}
                    className="
            relative
            flex items-center justify-center
            bg-blue-400 hover:bg-blue-500
            text-white
            p-2 md:px-3
            rounded
            group
          "
                  >
                    <FiSearch size={16} />

                    <span
                      className="
              hidden md:group-hover:flex
              absolute bottom-full left-1/2
              -translate-x-1/2 mb-2
              bg-gray-600 text-white
              text-[10px]
              rounded-md px-2 py-1
              whitespace-nowrap
            "
                    >
                      Search
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadEXL}
                    className="
            relative
            flex items-center justify-center
            bg-blue-400 hover:bg-blue-500
            text-white
            p-2 md:px-3
            rounded
            group
          "
                  >
                    <FaFileExcel size={15} />

                    <span
                      className="
              hidden md:group-hover:flex
              absolute bottom-full left-1/2
              -translate-x-1/2 mb-2
              bg-gray-600 text-white
              text-[10px]
              rounded-md px-2 py-1
              whitespace-nowrap
            "
                    >
                      Export to Excel
                    </span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="
            relative
            flex items-center justify-center
            bg-blue-400 hover:bg-blue-500
            text-white
            p-2 md:px-3
            rounded
            group
          "
                  >
                    <FiPrinter size={16} />

                    <span
                      className="
              hidden md:group-hover:flex
              absolute bottom-full left-1/2
              -translate-x-1/2 mb-2
              bg-gray-600 text-white
              text-[10px]
              rounded-md px-2 py-1
              whitespace-nowrap
            "
                    >
                      Print
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )} */}

          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pl-4 pr-4">
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
                <label className="text-md mb-1">Category group name</label>
                <Select
                  value={selectedCategoryGroup}
                  onChange={handleCategoryGroupSelect}
                  options={categoryGroupOptions}
                  placeholder={loadingExams ? "Loading..." : "Select"}
                  isSearchable
                  isClearable
                  isDisabled={loadingExams}
                  className="text-sm w-full"
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
                <label className="text-md mb-1">Location</label>
                <input
                  type="text"
                  placeholder="Location"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                />
              </div>

              {/* <div className="flex items-center gap-4">
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
              </div> */}
            </div>

            <>
              <div className="w-full  p-2">
                <div className="card mx-auto lg:w-full shadow-lg">
                  {showSearch && (
                    <>
                      <div className="p-1 px-3 bg-gray-100 border-none">
                        <div className="w-full flex justify-end mr-0 md:mr-4">
                          <div className="w-1/2 md:w-[18%] mr-1">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Search"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                      <div
                        className=" relative w-[97%]   mb-3 h-0.5  mx-auto bg-red-700"
                        style={{
                          backgroundColor: "#C03078",
                        }}
                      ></div>
                    </>
                  )}

                  <div className="card-body w-full">
                    <div
                      className="h-96 lg:h-96 overflow-y-scroll overflow-x-scroll"
                      style={{
                        scrollbarWidth: "thin",
                        scrollbarColor: "#C03178 transparent",
                      }}
                    >
                      <table className="min-w-[2200px] leading-normal table-auto">
                        <thead>
                          <tr className="bg-gray-100">
                            <th
                              style={{ width: "10px" }}
                              className="px-1 py-1 text-center border border-gray-950 text-sm font-semibold"
                            >
                              Sr No.
                            </th>
                            <th
                              style={{ width: "50px" }}
                              className="px-1 py-1 text-center border border-gray-950 text-sm font-semibold"
                            >
                              Accession No.
                            </th>
                            <th
                              style={{ width: "30px" }}
                              className="px-1 py-1 text-center border border-gray-950 text-sm font-semibold"
                            >
                              Date
                            </th>
                            <th
                              style={{ width: "230px" }}
                              className="px-1 py-1 text-center border border-gray-950 text-sm font-semibold whitespace-nowrap"
                            >
                              Book Title
                            </th>

                            <th
                              style={{ width: "150px" }}
                              className="px-1 py-1 text-center border border-gray-950 text-sm font-semibold"
                            >
                              Call No./Category
                            </th>
                            <th
                              style={{ width: "120px" }}
                              className="px-1 py-1 text-center border border-gray-950 text-sm font-semibold"
                            >
                              Author
                            </th>
                            <th
                              style={{ width: "120px" }}
                              className="px-1 py-1 text-center border border-gray-950 text-sm font-semibold"
                            >
                              Publisher/Place of Publication
                            </th>
                            <th
                              style={{ width: "50px" }}
                              className="px-1 py-1 text-center border border-gray-950 text-sm font-semibold"
                            >
                              Year of Publication
                            </th>
                            <th
                              style={{ width: "80px" }}
                              className="px-1 py-1 text-center border border-gray-950 text-sm font-semibold"
                            >
                              Edition
                            </th>
                            <th
                              style={{ width: "80px" }}
                              className="px-1 py-1 text-center border border-gray-950 text-sm font-semibold"
                            >
                              No. of pages
                            </th>
                            <th
                              style={{ width: "80px" }}
                              className="px-1 py-1 text-center  border border-gray-950 text-sm font-semibold"
                            >
                              Source
                            </th>
                            <th
                              style={{ width: "50px" }}
                              className="px-1 py-1 text-center border border-gray-950 text-sm font-semibold"
                            >
                              Price
                            </th>
                            <th
                              style={{ width: "110px" }}
                              className="px-1 py-1 text-center border border-gray-950 text-sm font-semibold"
                            >
                              ISBN No.
                            </th>
                            <th
                              style={{ width: "120px" }}
                              className="px-1 py-1 text-center border border-gray-950 text-sm font-semibold"
                            >
                              Location
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {/* LOADING */}
                          {loading && (
                            <div className="absolute inset-0 flex justify-center items-center bg-white/70 z-10">
                              <div className="text-xl text-blue-700 ">
                                Please wait while data is loading...
                              </div>
                            </div>
                          )}

                          {/* DATA ROWS */}
                          {!loading &&
                            displayedSections.length > 0 &&
                            displayedSections.map((student, index) => (
                              <tr
                                key={`${student.adm_form_pk}-${index}`}
                                className="border border-gray-300"
                              >
                                <td className="px-2 py-2 text-center border">
                                  {currentPage * pageSize + index + 1}
                                </td>
                                <td className="px-2 py-2 text-center border">
                                  {student?.copy_id || ""}
                                </td>
                                <td className="px-2 py-2 text-center border">
                                  {formatDate(student?.added_date)}
                                </td>
                                <td className="px-2 py-2 text-center border">
                                  {student?.book_title || ""}
                                </td>
                                <td className="px-2 py-2 text-center border">
                                  {student?.call_no || "-"} /{" "}
                                  {student?.category_name || ""}
                                </td>
                                <td className="px-2 py-2 text-center border">
                                  {student?.author
                                    ? student.author
                                      .toLowerCase()
                                      .split(" ")
                                      .map(
                                        (w) =>
                                          w.charAt(0).toUpperCase() +
                                          w.slice(1),
                                      )
                                      .join(" ")
                                    : "-"}
                                </td>
                                <td className="px-2 py-2 text-center border">
                                  {student?.publisher || ""}
                                </td>
                                <td className="px-2 py-2 text-center border">
                                  {student?.year || ""}
                                </td>
                                <td className="px-2 py-2 text-center border">
                                  {student?.edition || ""}
                                </td>
                                <td className="px-2 py-2 text-center border">
                                  {student?.no_of_pages || ""}
                                </td>
                                <td className="px-2 py-2 text-center border">
                                  {student?.source_of_book || ""}
                                </td>
                                <td className="px-2 py-2 text-center border">
                                  {student?.price || ""}
                                </td>
                                <td className="px-2 py-2 text-center border">
                                  {student?.isbn || ""}
                                </td>
                                <td className="px-2 py-2 text-center border">
                                  {student?.location_of_book || ""}
                                </td>
                              </tr>
                            ))}

                          {/* NO DATA */}
                          {!loading && timetable.length === 0 && (
                            <div className="absolute inset-0 flex justify-center items-center">
                              <div className="text-xl text-red-700">
                                No data available.
                              </div>
                            </div>
                          )}

                          {/* DATA FOUND (but maybe filtered empty) */}
                          {!loading &&
                            timetable.length > 0 &&
                            displayedSections.length === 0 && (
                              <div className="absolute inset-0 flex justify-center items-center">
                                <div className="text-xl text-red-700">
                                  Result data found!
                                </div>
                              </div>
                            )}

                          {/* TOTAL COUNT ROW */}
                          {!loading && filteredSections.length > 0 && (
                            <div className="absolute bottom-2 left-4 z-10">
                              <div className="px-4 py-2 bg-gray-100 border rounded shadow text-sm">
                                <span className="text-blue-800 font-semibold">
                                  Total books are :
                                </span>
                                <span className="text-pink-600 ml-2 font-semibold">
                                  {filteredSections.length}
                                </span>
                              </div>
                            </div>
                          )}
                        </tbody>
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
          </>
        </div>
      </div>
    </>
  );
};

export default BooksReport;
