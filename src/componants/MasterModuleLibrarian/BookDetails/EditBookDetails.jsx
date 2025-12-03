import { useEffect, useState, useMemo, useRef } from "react";
import { RxCross1 } from "react-icons/rx";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import Select from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faBookOpen,
  faPen,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

const EditBookDetails = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    publisher: "",
    no_of_days: "",
    location: "",
  });
  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);
  const [errors, setErrors] = useState({});

  const [loadingExams, setLoadingExams] = useState(false);

  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [selectedIssueType, setSelectedIssueType] = useState(null);

  const [rowErrors, setRowErrors] = useState([]);
  const [lastAccessionNo, setLastAccessionNo] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [bookDetails, setBookDetails] = useState("");

  const navigate = useNavigate();

  const { state } = useLocation();
  const { id } = useParams();
  console.log("id", id);
  console.log("state", state);

  useEffect(() => {
    fetchLastAccessionNo();
  }, []);

  const fetchLastAccessionNo = async () => {
    try {
      setLoadingExams(true);
      const token = localStorage.getItem("authToken");

      const response = await axios.get(`${API_URL}/api/books/max-copy-id`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("last accession no:", response.data.max_copy_id);

      if (response.data) {
        setLastAccessionNo(response.data.max_copy_id);
      } else {
        setLastAccessionNo([]);
        console.error("Unexpected API response format:", response.data);
      }
    } catch (error) {
      toast.error("Error fetching Students");
      console.error("Error fetching Students:", error);
    }
  };

  const [rows, setRows] = useState([
    {
      accessionNo: (lastAccessionNo + 1).toString(),
      // accessionNo : lastAccessionNo.max_copy_id + 1;
      billNo: "",
      source: "",
      year: "",
      edition: "",
      pages: "",
      price: "",
      option: "",
    },
  ]);

  useEffect(() => {
    if (lastAccessionNo) {
      setRows([
        {
          accessionNo: (parseInt(lastAccessionNo) + 1).toString(),
          billNo: "",
          source: "",
          year: "",
          edition: "",
          pages: "",
          price: "",
          option: "",
        },
      ]);
    }
  }, [lastAccessionNo]);

  const handleAddRow = () => {
    setSubmitted(false);

    const nextAccession =
      rows.filter((r) => r.isOld).length > 0
        ? lastAccessionNo +
          (rows.length - rows.filter((r) => r.isOld).length) +
          1
        : lastAccessionNo + 1;

    setRows([
      ...rows,
      {
        accessionNo: nextAccession.toString(),
        billNo: "",
        source: "",
        year: "",
        edition: "",
        pages: "",
        price: "",
        option: "",
        isOld: false, // this row is new and editable
      },
    ]);
  };

  const handleInputChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);

    // Remove error for that specific field when user types
    setRowErrors((prevErrors) => {
      const newErrors = [...prevErrors];
      if (newErrors[index] && newErrors[index][field]) {
        delete newErrors[index][field];
      }
      return newErrors;
    });
  };

  const handleDeleteRow = (index) => {
    const updatedRows = rows.filter((_, i) => i !== index);
    setRows(updatedRows);
  };

  const validate = () => {
    const newErrors = {};

    // Helper to safely trim a field
    const get = (key) => {
      const v = formData[key];
      return v !== undefined && v !== null ? String(v).trim() : "";
    };

    const title = get("book_title");
    const location = get("location_of_book");
    const daysBorrow = get("days_borrow");
    const author = get("author");
    const publisher = get("publisher");
    const issueType = get("issue_type");

    // Book title
    if (!title) newErrors.book_title = "Book title is required";

    // Category
    if (!selectedStudentId) {
      newErrors.category_id = "Category is required";
    }

    // Author
    if (!author) newErrors.author = "Author is required";

    // Publisher
    if (!publisher) newErrors.publisher = "Publisher is required";

    // Location of book
    if (!location) newErrors.location_of_book = "Location of book is required";

    // Issue type
    if (!issueType) newErrors.issue_type = "Issue type is required";

    // Days borrow
    if (daysBorrow) {
      if (!/^\d+$/.test(daysBorrow)) {
        newErrors.days_borrow = "Please enter only numbers";
      }
    }

    setErrors(newErrors);
    return newErrors;
  };

  const validateRows = () => {
    return rows.map((row, index) => {
      const errors = {};

      if (!row.isOld) {
        const isDuplicate = rows.some(
          (r, i) => r.accessionNo === row.accessionNo && i !== index && !r.isOld // compare only with NEW rows
        );

        if (isDuplicate) {
          errors.accessionNo = "Accession No. is already present";
        }
      }

      if (!row.accessionNo || row.accessionNo.toString().trim() === "") {
        errors.accessionNo = "Accession No. is required";
      }

      if (!row.pages || row.pages.toString().trim() === "") {
        errors.pages = "Pages are required";
      }

      if (!row.price || row.price.toString().trim() === "") {
        errors.price = "Price is required";
      }

      return errors;
    });
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoadingExams(true);
      const token = localStorage.getItem("authToken");

      const response = await axios.get(`${API_URL}/api/get_librarycategory`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("call category", response);
      let data =
        response?.data?.CallCategory ||
        response?.data?.data ||
        response?.data ||
        [];

      if (!Array.isArray(data)) {
        data = Object.values(data);
      }

      console.log(" Cleaned Data:", data);
      setStudentNameWithClassId(data);
    } catch (error) {
      toast.error("Error fetching Staff");
      console.error("Error fetching Staff:", error);
    } finally {
      setLoadingExams(false);
    }
  };

  const handleCategorySelect = (selectedOption) => {
    setSelectedStudent(selectedOption);
    setSelectedStudentId(selectedOption?.value);

    setFormData((prev) => ({
      ...prev,
      selectedStudent: selectedOption,
    }));
  };

  const categoryOptions = useMemo(
    () =>
      Array.isArray(studentNameWithClassId)
        ? studentNameWithClassId.map((cls) => ({
            value: cls?.value,
            label: cls?.label || "",
          }))
        : [],
    [studentNameWithClassId]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value.trim(),
    }));

    // Clear error for this field
    setErrors((prevErr) => {
      if (!prevErr[name]) return prevErr;
      const newErr = { ...prevErr };
      delete newErr[name];
      return newErr;
    });
  };

  const issueTypeOptions = [
    { value: "I", label: "Issue to All" },
    { value: "T", label: "Only for Teachers" },
    { value: "R", label: "Reading in Library" },
  ];

  const statusOptions = [
    { value: "A", label: "Available" },
    { value: "O", label: "Old" },
    { value: "L", label: "Lost" },
    { value: "I", label: "Issued" },
    { value: "D", label: "Damage" },
  ];

  useEffect(() => {
    const fetchBookDetails = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken");

        const response = await axios.post(
          `${API_URL}/api/get-book-details`,
          { book_id: id },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const books = response?.data?.data || [];
        const book = books[0]; // main book info

        if (book) {
          // Book-level fields
          setFormData({
            book_title: book.book_title ?? "",
            author: book.author ?? "",
            publisher: book.publisher ?? "",
            days_borrow: book.days_borrow ?? "",
            location_of_book: book.location_of_book ?? "",
            category_id: book.category_id ?? "",
            // issueType: book.issue_type ?? "",
            issue_type: book.issue_type ?? "",
          });

          // Issue Type
          const selectedIssue = issueTypeOptions.find(
            (opt) => opt.value === book.issue_type
          );
          setSelectedIssueType(selectedIssue || null);

          // Category
          const selectedCategory = categoryOptions.find(
            (opt) => opt.value == book.category_id
          );
          if (selectedCategory) {
            setSelectedStudent(selectedCategory);
            setSelectedStudentId(selectedCategory.value);

            setFormData((prev) => ({
              ...prev,
              selectedStudent: selectedCategory,
            }));
          }

          setRows(
            books.map((bk) => ({
              accessionNo: bk.copy_id,
              billNo: bk.bill_no,
              source: bk.source_of_book,
              isbnno: bk.isbn,
              year: bk.year,
              edition: bk.edition,
              pages: bk.no_of_pages,
              price: bk.price,
              option: bk.status,
              isOld: true, // mark as read-only row
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching book details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBookDetails();
  }, [id, categoryOptions]);

  // useEffect(() => {
  //   const fetchBookDetails = async () => {
  //     setLoading(true);
  //     try {
  //       const token = localStorage.getItem("authToken");

  //       const response = await axios.post(
  //         `${API_URL}/api/get-book-details`,
  //         { book_id: id },
  //         { headers: { Authorization: `Bearer ${token}` } }
  //       );

  //       const books = response?.data?.data || [];
  //       const book = books[0];

  //       if (book) {
  //         // Set form fields
  //         setFormData({
  //           book_title: book.book_title ?? "",
  //           author: book.author ?? "",
  //           publisher: book.publisher ?? "",
  //           days_borrow: book.days_borrow ?? "",
  //           location_of_book: book.location_of_book ?? "",
  //           category_id: book.category_id ?? "",
  //           issue_type: book.issue_type ?? "",
  //         });

  //         // Set issue type
  //         const selectedIssue = issueTypeOptions.find(
  //           (opt) => opt.value === book.issue_type
  //         );
  //         setSelectedIssueType(selectedIssue || null);

  //         // Set category
  //         const selectedCategory = categoryOptions.find(
  //           (opt) => opt.value == book.category_id
  //         );
  //         if (selectedCategory) {
  //           setSelectedStudent(selectedCategory);
  //           setSelectedStudentId(selectedCategory.value);
  //         }

  //         // Rows
  //         setRows(
  //           books.map((bk) => ({
  //             accessionNo: bk.copy_id,
  //             billNo: bk.bill_no,
  //             source: bk.source_of_book,
  //             isbnno: bk.isbn,
  //             year: bk.year,
  //             edition: bk.edition,
  //             pages: bk.no_of_pages,
  //             price: bk.price,
  //             option: bk.status,
  //             isOld: true,
  //           }))
  //         );
  //       }
  //     } catch (error) {
  //       console.error("Error fetching book details:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   if (id) fetchBookDetails();
  // }, [id]);

  const handleUpdate = async (event) => {
    event.preventDefault();
    setSubmitted(true);

    // Run validations
    const validationErrors = validate();
    const rowValidationErrors = validateRows();

    console.log("=== FORM VALIDATION ERRORS ===");
    console.log(validationErrors);

    console.log("=== ROW VALIDATION ERRORS ===");
    rowValidationErrors.forEach((err, index) => {
      if (Object.keys(err).length > 0) {
        console.log(`Row ${index + 1} Errors:`, err);
      }
    });

    const hasFormErrors = Object.keys(validationErrors).length > 0;
    const hasRowErrors = rowValidationErrors.some(
      (rowErr) => Object.keys(rowErr).length > 0
    );

    if (hasFormErrors || hasRowErrors) {
      console.warn("❌ VALIDATION FAILED — FIX ERRORS BEFORE SUBMITTING");
      setErrors(validationErrors);
      toast.error("Please fix the validation errors before submitting.");
      return;
    }

    console.log("✅ Validation Passed");

    // Normalizer
    const normalize = (v) => {
      if (v === undefined || v === null || String(v).trim() === "") return null;
      return String(v).trim();
    };

    const convert = (arr) => arr.map((v) => normalize(v));

    // Arrays
    // const bill_no = convert(rows.map((r) => r.billNo));
    // const edition = convert(rows.map((r) => r.edition));
    // const source = convert(rows.map((r) => r.source));
    // const year = convert(rows.map((r) => r.year));
    // const no_of_pages = convert(rows.map((r) => r.pages));
    // const price = convert(rows.map((r) => r.price));
    // const copy = convert(rows.map((r) => r.accessionNo));
    // const isbn = convert(rows.map((r) => r.isbnno));

    // Final Payload
    // const payload = {
    //   operation: "edit",
    //   book_title: normalize(formData.book_title),
    //   category_id: selectedStudentId,
    //   author: normalize(formData.author),
    //   publisher: normalize(formData.publisher),
    //   location_of_book: normalize(formData.location_of_book),
    //   days_borrow: normalize(formData.days_borrow),
    //   issue_type: normalize(formData.issue_type),

    //   bill_no,
    //   edition,
    //   source,
    //   year,
    //   no_of_pages,
    //   price,
    //   copy,
    //   isbn,
    // };
    const arr = Array.isArray(rows) ? rows : [];

    const payload = {
      operation: "edit",
      book_title: normalize(formData.book_title),
      category_id: selectedStudentId,
      author: normalize(formData.author),
      publisher: normalize(formData.publisher),
      location_of_book: normalize(formData.location_of_book),
      days_borrow: normalize(formData.days_borrow),
      issue_type: normalize(formData.issue_type),

      bill_no: convert(arr.map((r) => r.billNo)),
      edition: convert(arr.map((r) => r.edition)),
      source: convert(arr.map((r) => r.source)),
      year: convert(arr.map((r) => r.year)),
      no_of_pages: convert(arr.map((r) => r.pages)),
      price: convert(arr.map((r) => r.price)),
      copy: convert(arr.map((r) => r.accessionNo)),
      isbn: convert(arr.map((r) => r.isbnno)),
    };

    console.log("=== FINAL PAYLOAD SENT TO BACKEND ===");
    console.log(payload);

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      const response = await axios.post(
        `${API_URL}/api/books/edit/${id}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("=== API RESPONSE ===", response.data);

      if (response.data?.success) {
        toast.success("Book Updated Successfully!");
        setTimeout(() => navigate("/bookDetails"), 600);
      } else {
        toast.error(response.data?.message);
      }
    } catch (error) {
      console.error("❌ API ERROR:", error);
      toast.error(
        error.response?.data?.message ||
          "An error occurred while updating the form."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    // <div className="container mx-auto mt-4 flex items-center justify-center  ">
    <div className={` transition-all duration-500  mx-auto p-4 w-full `}>
      <ToastContainer />
      <div className="card rounded-md w-[100%] ">
        <div className=" card-header mb-4 flex justify-between items-center">
          <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
            Edit Book Details
          </h5>

          <RxCross1
            className="float-end relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
            onClick={() => {
              setErrors({});
              navigate("/bookDetails");
            }}
          />
        </div>
        <div
          className=" relative w-full -top-6 h-1  mx-auto bg-red-700"
          style={{
            backgroundColor: "#C03078",
          }}
        ></div>
        <p className="  md:absolute md:right-6  md:top-[10%]  text-gray-500  ">
          <span className="text-red-500">*</span>indicates mandatory information
        </p>

        <form
          onSubmit={handleUpdate}
          className="flex items-center justify-center overflow-x-hidden shadow-md  ml-2 mr-2 mb-2 bg-gray-50 space-y-2" //min-h-screen flex items-center justify-center overflow-x-hidden shadow-md p-4 bg-gray-50
        >
          <div className="modal-body px-4 py-2">
            <div className="flex items-center justify-between mb-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-sm border-l-4 border-r-4 border-pink-400">
              <div className="flex items-center space-x-3">
                <div className="relative bg-blue-600 text-white pt-0 b-0 pr-2 pl-2 rounded-lg shadow-md ml-3">
                  <FontAwesomeIcon icon={faBookOpen} size="sm" />
                  <FontAwesomeIcon
                    icon={faPen}
                    size="2xs"
                    className="absolute bottom-3 right-1 text-pink-400"
                  />
                </div>
                <h2 className="text-sm md:text-base font-bold text-gray-800">
                  Create Book
                </h2>
              </div>
            </div>

            {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="flex flex-col">
                <label htmlFor="title" className="mb-1">
                  Book Title<span className="text-red-500">*</span>
                </label>
                <input
                  maxLength={100}
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  rows="2"
                  className="form-control shadow-md"
                />
                {errors.title && (
                  <span className="text-danger text-xs mt-1">
                    {errors.title}
                  </span>
                )}
              </div>

              <div className="flex flex-col">
                <label htmlFor="sectionName" className="mb-1">
                  Call/Category <span className="text-red-500">*</span>
                </label>
                <Select
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  id="studentSelect"
                  value={selectedStudent}
                  onChange={handleCategorySelect}
                  options={categoryOptions}
                  placeholder={loadingExams ? "Loading..." : "Select"}
                  isSearchable
                  isClearable
                  isDisabled={loadingExams}
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      fontSize: ".9em",
                      minHeight: "30px",
                    }),
                    menu: (provided) => ({
                      ...provided,
                      fontSize: "1em",
                    }),
                    option: (provided) => ({
                      ...provided,
                      fontSize: ".9em",
                    }),
                  }}
                />

                {errors.staff_name && (
                  <span className="text-danger text-xs mt-1">
                    {errors.staff_name}
                  </span>
                )}
              </div>

              <div className="flex flex-col">
                <label htmlFor="author" className="mb-1">
                  Author<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  maxLength={100}
                  value={formData.author}
                  onChange={handleChange}
                  className="form-control shadow-md"
                />
                {errors.author && (
                  <span className="text-danger text-xs mt-1">
                    {errors.author}
                  </span>
                )}
              </div>

              <div className="flex flex-col">
                <label htmlFor="publisher" className="mb-1">
                  Publisher <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="publisher"
                  name="publisher"
                  maxLength={100}
                  value={formData.publisher}
                  onChange={handleChange}
                  className="form-control shadow-md"
                />
                {errors.publisher && (
                  <span className="text-danger text-xs mt-1">
                    {errors.publisher}
                  </span>
                )}
              </div>

              <div className="flex flex-col">
                <label htmlFor="no_of_days" className="mb-1">
                  No. of days borrow
                </label>
                <input
                  type="text"
                  id="no_of_days"
                  name="no_of_days"
                  maxLength={2}
                  value={formData.no_of_days}
                  onChange={handleChange}
                  className="form-control shadow-md"
                />
                {errors.no_of_days && (
                  <span className="text-danger text-xs mt-1">
                    {errors.no_of_days}
                  </span>
                )}
              </div>

              <div className="flex flex-col">
                <label htmlFor="location" className="mb-1">
                  Location of Book <span className="text-red-500">*</span>
                </label>
                <input
                  maxLength={50}
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  rows="2"
                  className="form-control shadow-md"
                />
                {errors.location && (
                  <span className="text-danger text-xs mt-1">
                    {errors.location}
                  </span>
                )}
              </div>

              <div className="flex flex-col">
                <label htmlFor="issuetype" className="mb-1">
                  Issued Type <span className="text-red-500">*</span>
                </label>

                <Select
                  id="issuetype"
                  value={selectedIssueType}
                  onChange={(selected) => setSelectedIssueType(selected)}
                  options={issueTypeOptions}
                  placeholder="Select"
                  isSearchable={false}
                  isClearable
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      fontSize: ".9em",
                      minHeight: "30px",
                    }),
                    menu: (provided) => ({
                      ...provided,
                      fontSize: "1em",
                    }),
                    option: (provided) => ({
                      ...provided,
                      fontSize: ".9em",
                    }),
                  }}
                />
                {errors.issueType && (
                  <span className="text-danger text-xs mt-1">
                    {errors.issueType}
                  </span>
                )}
              </div>
            </div> */}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              {/* Book Title */}
              <div className="flex flex-col">
                <label className="mb-1">
                  Book Title <span className="text-red-500">*</span>
                </label>
                <input
                  maxLength={100}
                  name="book_title"
                  value={formData.book_title}
                  onChange={handleChange}
                  className="form-control shadow-md"
                />
                {errors.book_title && (
                  <span className="text-danger text-xs mt-1">
                    {errors.book_title}
                  </span>
                )}
              </div>

              {/* Category */}
              <div className="flex flex-col">
                <label className="mb-1">
                  Call/Category <span className="text-red-500">*</span>
                </label>
                <Select
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  value={selectedStudent}
                  onChange={handleCategorySelect}
                  options={categoryOptions}
                  placeholder="Select"
                  isSearchable
                  isClearable
                />
                {errors.category_id && (
                  <span className="text-danger text-xs mt-1">
                    {errors.category_id}
                  </span>
                )}
              </div>

              {/* Author */}
              <div className="flex flex-col">
                <label className="mb-1">
                  Author <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="author"
                  maxLength={100}
                  value={formData.author}
                  onChange={handleChange}
                  className="form-control shadow-md"
                />
                {errors.author && (
                  <span className="text-danger text-xs mt-1">
                    {errors.author}
                  </span>
                )}
              </div>

              {/* Publisher */}
              <div className="flex flex-col">
                <label className="mb-1">
                  Publisher <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="publisher"
                  maxLength={100}
                  value={formData.publisher}
                  onChange={handleChange}
                  className="form-control shadow-md"
                />
                {errors.publisher && (
                  <span className="text-danger text-xs mt-1">
                    {errors.publisher}
                  </span>
                )}
              </div>

              {/* Borrow Days */}
              <div className="flex flex-col">
                <label className="mb-1">No. of days borrow</label>
                <input
                  type="text"
                  name="days_borrow"
                  maxLength={2}
                  value={formData.days_borrow}
                  onChange={handleChange}
                  className="form-control shadow-md"
                />
                {errors.days_borrow && (
                  <span className="text-danger text-xs mt-1">
                    {errors.days_borrow}
                  </span>
                )}
              </div>

              {/* Location */}
              <div className="flex flex-col">
                <label className="mb-1">
                  Location of Book <span className="text-red-500">*</span>
                </label>
                <input
                  maxLength={50}
                  name="location_of_book"
                  value={formData.location_of_book}
                  onChange={handleChange}
                  className="form-control shadow-md"
                />
                {errors.location_of_book && (
                  <span className="text-danger text-xs mt-1">
                    {errors.location_of_book}
                  </span>
                )}
              </div>

              {/* Issue Type */}
              <div className="flex flex-col">
                <label className="mb-1">
                  Issued Type <span className="text-red-500">*</span>
                </label>

                <Select
                  value={selectedIssueType}
                  onChange={(selected) => {
                    setSelectedIssueType(selected);
                    handleChange({
                      target: {
                        name: "issue_type",
                        value: selected?.value || "",
                      },
                    });
                  }}
                  options={issueTypeOptions}
                  isSearchable={false}
                  isClearable
                />

                {errors.issue_type && (
                  <span className="text-danger text-xs mt-1">
                    {errors.issue_type}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mb-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-sm border-l-4 border-r-4 border-pink-400">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 text-white pt-0 pb-0 pr-2 pl-2 rounded-lg shadow-md ml-3">
                  <FontAwesomeIcon icon={faBook} size="sm" />
                </div>
                <h2 className="text-sm md:text-base font-bold text-gray-800">
                  Copy Details
                </h2>
              </div>
            </div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-gray-700">
                Last Accession No :{" "}
                <span className="text-blue-700">
                  <span className="text-blue-700">
                    {lastAccessionNo ? lastAccessionNo : "Loading..."}
                  </span>
                </span>
              </p>
              <button
                type="button"
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1 rounded-full shadow"
                onClick={handleAddRow}
              >
                <FontAwesomeIcon icon={faPlus} />
                Add more copies
              </button>
            </div>

            <div className="overflow-x-auto shadow-md rounded-xl border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-sm text-center">
                <thead className="bg-gray-200 text-gray-700 text-xs font-normal">
                  {/* <tr>
                    <th className="px-3 py-2 border">
                      Accession No<span className="text-red-500">*</span>
                    </th>
                    <th className="px-3 py-2 border">Bill No</th>
                    <th className="px-3 py-2 border">Source of Book</th>
                    <th className="px-3 py-2 border">ISBN No.</th>
                    <th className="px-3 py-2 border">Year of Publication</th>
                    <th className="px-3 py-2 border">Edition</th>
                    <th className="px-3 py-2 border">
                      No. of Pages<span className="text-red-500">*</span>
                    </th>
                    <th className="px-3 py-2 border">
                      Price<span className="text-red-500">*</span>
                    </th>
                    <th className="px-3 py-2 border">Status</th>
                  </tr> */}
                  <tr>
                    <th className="px-3 py-2 border w-[120px]">
                      Accession No<span className="text-red-500">*</span>
                    </th>

                    <th className="px-3 py-2 border w-[100px]">Bill No</th>

                    <th className="px-3 py-2 border w-[180px]">
                      Source of Book
                    </th>

                    <th className="px-3 py-2 border w-[130px]">ISBN No.</th>

                    <th className="px-3 py-2 border w-[150px]">
                      Year of Publication
                    </th>

                    <th className="px-3 py-2 border w-[120px]">Edition</th>

                    <th className="px-3 py-2 border w-[110px]">
                      No. of Pages<span className="text-red-500">*</span>
                    </th>

                    <th className="px-3 py-2 border w-[80px]">
                      Price<span className="text-red-500">*</span>
                    </th>

                    <th className="px-3 py-2 border w-[100px]">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 bg-white">
                  {rows.map((row, index) => (
                    <tr key={index} className="align-top">
                      <td className="border px-2 py-2">
                        <input
                          type="text"
                          value={row.accessionNo}
                          onChange={(e) =>
                            !row.isOld &&
                            handleInputChange(
                              index,
                              "accessionNo",
                              e.target.value
                            )
                          }
                          readOnly={row.isOld}
                          className={`w-full border rounded-md text-sm p-1 ${
                            row.isOld ? "bg-gray-100 cursor-not-allowed" : ""
                          }`}
                        />
                      </td>

                      {/* Bill No */}
                      <td className="border px-2 py-2">
                        <input
                          type="text"
                          value={row.billNo}
                          onChange={(e) =>
                            handleInputChange(index, "billNo", e.target.value)
                          }
                          maxLength={10}
                          className="w-full border border-gray-300 rounded-md text-sm p-1"
                        />
                      </td>

                      {/* Source */}
                      <td className="border px-2 py-2">
                        <input
                          type="text"
                          value={row.source}
                          onChange={(e) =>
                            handleInputChange(index, "source", e.target.value)
                          }
                          maxLength={50}
                          className="w-full border border-gray-300 rounded-md text-sm p-1"
                        />
                      </td>
                      <td className="border px-2 py-2">
                        <input
                          type="text"
                          value={row.isbnno}
                          onChange={(e) =>
                            handleInputChange(index, "isbnno", e.target.value)
                          }
                          maxLength={20}
                          className="w-full border border-gray-300 rounded-md text-sm p-1"
                        />
                      </td>

                      {/* Year */}
                      <td className="border px-2 py-2">
                        <input
                          type="text"
                          value={row.year}
                          onChange={(e) =>
                            handleInputChange(index, "year", e.target.value)
                          }
                          maxLength={4}
                          className="w-full border border-gray-300 rounded-md text-sm p-1"
                        />
                      </td>

                      {/* Edition */}
                      <td className="border px-2 py-2">
                        <input
                          type="text"
                          value={row.edition}
                          onChange={(e) =>
                            handleInputChange(index, "edition", e.target.value)
                          }
                          maxLength={10}
                          className="w-full border border-gray-300 rounded-md text-sm p-1"
                        />
                      </td>

                      {/* Pages */}
                      <td className="border px-2 py-2">
                        <input
                          type="text"
                          value={row.pages}
                          onChange={(e) =>
                            handleInputChange(index, "pages", e.target.value)
                          }
                          maxLength={5}
                          className="w-full border border-gray-300 rounded-md text-sm p-1"
                        />
                        {submitted && rowErrors[index]?.pages && (
                          <p className="text-red-500 text-xs mt-1">
                            {rowErrors[index].pages}
                          </p>
                        )}
                      </td>

                      {/* Price */}
                      <td className="border px-2 py-2">
                        <input
                          type="text"
                          value={row.price}
                          onChange={(e) =>
                            handleInputChange(index, "price", e.target.value)
                          }
                          className="w-full border border-gray-300 rounded-md text-sm p-1"
                        />
                        {submitted && rowErrors[index]?.price && (
                          <p className="text-red-500 text-xs mt-1">
                            {rowErrors[index].price}
                          </p>
                        )}
                      </td>

                      {/* <td className="border px-2 py-2 text-center">
                        {index === 0 ? (
                          // 👉 Show dropdown for first row only
                          <select
                            value={row.option || ""}
                            onChange={(e) =>
                              handleInputChange(index, "option", e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-md text-sm p-1"
                          >
                            <option value="">Select Status</option>
                            {statusOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          // 👉 Show delete button for all other rows
                          <button
                            type="button"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteRow(index)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        )}

                        {rowErrors[index]?.option && (
                          <p className="text-red-500 text-xs mt-1">
                            {rowErrors[index].option}
                          </p>
                        )}
                      </td> */}
                      <td className="border px-2 py-2 text-center">
                        {row.isOld ? (
                          // 🔵 OLD ROW → Show dropdown
                          <select
                            value={row.option || ""}
                            onChange={(e) =>
                              handleInputChange(index, "option", e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-md text-sm p-1"
                          >
                            <option value="">Select Status</option>
                            {statusOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <button
                            type="button"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteRow(index)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        )}

                        {rowErrors[index]?.option && (
                          <p className="text-red-500 text-xs mt-1">
                            {rowErrors[index].option}
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Submit Button */}
            <div className="text-right mt-6">
              <button
                className="bg-blue-500 text-white py-1 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed mr-2"
                onClick={handleUpdate}
                disabled={loading}
              >
                {loading ? "Updating..." : "Update book"}
              </button>
              <button className="bg-red-500 text-white py-1 px-4 rounded hover:bg-red-700 disabled:bg-blue-300 disabled:cursor-not-allowed mr-2">
                Reset
              </button>
              <button
                className="bg-yellow-400 text-white py-1 px-4 rounded hover:bg-yellow-500 disabled:bg-blue-300 disabled:cursor-not-allowed  "
                onClick={() => navigate("/bookDetails")}
              >
                Back
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBookDetails;
