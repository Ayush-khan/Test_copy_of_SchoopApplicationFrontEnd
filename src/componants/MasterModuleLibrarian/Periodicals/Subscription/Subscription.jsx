import { useEffect, useState, useRef } from "react";
import axios from "axios";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faPlus,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RxCross1 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import React from "react";
import Select from "react-select";
import { FaBook, FaLayerGroup } from "react-icons/fa";

function Subscription() {
  const API_URL = import.meta.env.VITE_API_URL; // URL for host
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [currentSection, setCurrentSection] = useState(null);
  const [newSectionName, setNewSectionName] = useState("");
  const [frequency, setFrequency] = useState("");
  const [subscriptionNo, setSubscriptionNo] = useState("");
  const [email, setEmail] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  const [fieldErrors, setFieldErrors] = useState({});
  const [nameError, setNameError] = useState("");
  const [nameAvailable, setNameAvailable] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [session, setSession] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [receiveDate, setReceiveDate] = useState("");
  const [receivingDate, setReceivingDate] = useState(null);
  const [selectedTitle, setSelectedTitle] = useState(null);
  const [periodicalId, setPeriodicalId] = useState(null);
  const [status, setStatus] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const academicYrTo = localStorage.getItem("academic_yr_to");
  // console.log("acadmeic", academicYrTo);

  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");

  const pageSize = 10;

  const [showVolumeModal, setShowVolumeModal] = useState(false);
  const [volumeData, setVolumeData] = useState([]);
  const [loadingVolumes, setLoadingVolumes] = useState(false);
  const [showDeleteVolumeModal, setShowDeleteVolumeModal] = useState(false);
  const [currentVolume, setCurrentVolume] = useState(null);

  const [showAddForm, setShowAddForm] = useState(false);

  const [newVolume, setNewVolume] = useState("");
  const [newIssues, setNewIssues] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [volumeForms, setVolumeForms] = useState([]);
  const [periodicals, setPeriodicals] = useState([]);

  // const fetchsessionData = async () => {
  //   try {
  //     const token = localStorage.getItem("authToken");

  //     if (!token) {
  //       throw new Error("No authentication token found");
  //     }

  //     const response = await axios.get(`${API_URL}/api/sessionData`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //       withCredentials: true,
  //     });
  //     console.log("session data", response.data);

  //     setSession(response.data);
  //   } catch (error) {
  //     setError(error.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchSections = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(`${API_URL}/api/library/subscriptions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      // console.log("Subscription data", response.data.data);

      setSections(response.data.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // fetchsessionData();
    fetchSections();
    fetchPeriodicals();
  }, []);

  const fetchPeriodicals = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(`${API_URL}/api/library/periodicals`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      // console.log("Periodicals data", response.data.data);

      setPeriodicals(response.data.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const titleOptions = periodicals.map((item) => ({
    value: item.periodical_id,
    label: item.title,
  }));
  const weeklyOptions = [
    { value: "Monday", label: "Monday" },
    { value: "Tuesday", label: "Tuesday" },
    { value: "Wednesday", label: "Wednesday" },
    { value: "Thursday", label: "Thursday" },
    { value: "Friday", label: "Friday" },
    { value: "Saturday", label: "Saturday" },
  ];

  const monthlyOptions = Array.from({ length: 31 }, (_, i) => ({
    value: i + 1,
    label: String(i + 1),
  }));

  const receivingDateOptions =
    frequency === "Weekly"
      ? weeklyOptions
      : frequency === "Monthly" || frequency === "Bimonthly"
        ? monthlyOptions
        : [];

  const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "Expired", label: "Expired" },
  ];

  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        })
      : "";

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

  const filteredSections = (sections || []).filter((section) => {
    const searchLower = searchTerm.trim().replace(/\s+/g, " ").toLowerCase();

    const serviceMatch = section?.title
      ?.trim()
      .toLowerCase()
      .includes(searchLower);

    const subscriptionNO = section?.subscription_no
      ?.trim()
      .toLowerCase()
      .includes(searchLower);

    const frequency = section?.frequency
      ?.trim()
      .toLowerCase()
      .includes(searchLower);

    const emailId = section?.email_ids
      ?.trim()
      .toLowerCase()
      .includes(searchLower);

    const createDate = formatDate(section?.create_date).includes(searchLower);

    return serviceMatch || subscriptionNO || frequency || emailId || createDate;
  });

  useEffect(() => {
    setPageCount(Math.ceil(filteredSections.length / pageSize));
  }, [filteredSections, pageSize]);

  const displayedSections = filteredSections.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize,
  );

  useEffect(() => {
    setPageCount(Math.ceil(filteredSections.length / pageSize));
  }, [filteredSections]);

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const handleEdit = (section) => {
    setCurrentSection(section);

    // ---- TITLE (react-select needs object)
    const titleOption = titleOptions.find(
      (opt) => opt.value === section.periodical_id,
    );
    setSelectedTitle(titleOption || null);

    // ---- OTHER FIELDS
    setSubscriptionNo(section.subscription_no || "");
    setFromDate(section.from_date || "");
    setToDate(section.to_date || "");
    setFrequency(section.frequency || "");
    setPeriodicalId(section.periodical_id || "");

    // ---- RECEIVING DATE (depends on frequency)
    if (section.receiving_date) {
      setReceivingDate({
        value: section.receiving_date,
        label: String(section.receiving_date),
      });
    } else {
      setReceivingDate(null);
    }

    // ---- STATUS (react-select)
    setStatus({
      value: section.status,
      label: section.status,
    });

    setFieldErrors({});
    setShowEditModal(true);
  };

  const handleAdd = () => {
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowVolumeModal(false);
    setShowDeleteVolumeModal(false);
    setVolumeForms("");

    setNewSectionName("");
    setSubscriptionNo("");
    setFromDate("");
    setToDate("");

    setReceivingDate(null);
    setSelectedTitle(null);

    setCurrentSection(null);
    setFieldErrors({});
    setNameError("");
  };

  const handleDelete = (id) => {
    // console.log("the deleted subscription id", id);
    const sectionToDelete = sections.find((sec) => sec.subscription_id === id);
    // console.log("the deleted ", sectionToDelete);
    setCurrentSection(sectionToDelete);
    setShowDeleteModal(true);
  };

  const handleSubmitDelete = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");

      if (!token || !currentSection?.subscription_id) {
        throw new Error("Subscription Id is missing");
      }

      const response = await axios.delete(
        `${API_URL}/api/library/subscriptions/${
          currentSection.subscription_id
        }`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        },
      );

      // console.log("Delete API response:", response.data);

      if (response.data.status === true) {
        fetchSections();
        toast.success(
          response.data.message || "Subscription deleted successfully.",
        );

        setShowDeleteModal(false);
        setCurrentSection(null);
        fetchSections();
      } else {
        toast.error(response.data.message || "Failed to delete subscription.");
      }
    } catch (error) {
      console.error("Error deleting subscription:", error);

      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Server error. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeFromDate = (e) => {
    const value = e.target.value;
    setFromDate(value);

    if (!value) {
      setFieldErrors((prev) => ({
        ...prev,
        fromDate: "Please select from date",
      }));
    } else if (toDate && value > toDate) {
      setFieldErrors((prev) => ({
        ...prev,
        fromDate: "From date cannot be after To date",
      }));
    } else {
      setFieldErrors((prev) => ({ ...prev, fromDate: "" }));
    }
  };

  const handleChangeToDate = (e) => {
    const value = e.target.value;
    setToDate(value);

    if (!value) {
      setFieldErrors((prev) => ({
        ...prev,
        toDate: "Please select to date",
      }));
    } else if (fromDate && value < fromDate) {
      setFieldErrors((prev) => ({
        ...prev,
        toDate: "To date cannot be before From date",
      }));
    } else {
      setFieldErrors((prev) => ({ ...prev, toDate: "" }));
    }
  };

  const handleSubmitAdd = async () => {
    if (!selectedTitle || !fromDate || !toDate || !receivingDate) {
      toast.error("Please fill all required fields");
      return;
    }

    const payload = {
      periodical_id: selectedTitle.value,
      from_date: fromDate,
      to_date: toDate,
      receiving_date: receivingDate.value || receivingDate,
    };

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        `${API_URL}/api/library/subscriptions`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.status) {
        toast.success("Subscription added successfully.");

        // Reset form
        setSelectedTitle(null);
        setSubscriptionNo("");
        setFrequency("");
        setFromDate("");
        setToDate("");
        setReceiveDate(null);
        setFieldErrors({});
        fetchSections();
        handleCloseModal();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to add subscription");
    }
  };

  const handleSubmitEdit = async () => {
    // if (!fromDate || !toDate || !receivingDate) {
    //   toast.error("Please fill all required fields");
    //   return;
    // }

    const payload = {
      from_date: fromDate,
      to_date: toDate,
      receiving_date: receivingDate.value || receivingDate,
      status: status.value,
    };

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.put(
        `${API_URL}/api/library/subscriptions/${currentSection.subscription_id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.status) {
        toast.success("Subscription updated successfully.");

        // Reset form
        setSelectedTitle(null);
        setSubscriptionNo("");
        setFrequency("");
        setFromDate("");
        setToDate("");
        setReceiveDate(null);
        fetchSections();
        setFieldErrors({});
        handleCloseModal();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update subscription");
    }
  };

  const fetchVolumes = async (subscriptionId) => {
    setLoadingVolumes(true);
    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/library/subscriptions/${subscriptionId}/volumes`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setVolumeData(response.data.data || []);
    } catch (error) {
      console.error("Error fetching volumes", error);
      setVolumeData([]);
    } finally {
      setLoadingVolumes(false);
    }
  };

  const handleView = async (section) => {
    setCurrentSection(section);
    setShowVolumeModal(true);
    fetchVolumes(section.subscription_id);
  };

  const handleVolumeDelete = (id) => {
    // console.log("the deleted volume id", id);

    const volumeToDelete = volumeData.find(
      (vol) => vol.subscription_vol_id === id,
    );

    // console.log("the deleted ", volumeToDelete);

    setCurrentVolume(volumeToDelete);
    setShowDeleteVolumeModal(true);
  };

  const handleSubmitVolumeDelete = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");

      if (!token || !currentVolume?.subscription_vol_id) {
        throw new Error("Volume Id is missing");
      }

      const response = await axios.delete(
        `${API_URL}/api/library/subscriptions/volumes/${
          currentVolume.subscription_vol_id
        }`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        },
      );

      // console.log("Delete API response:", response.data);

      if (response.data.status === true) {
        toast.success(response.data.message || "Volume deleted successfully.");

        await fetchVolumes(currentSection.subscription_id);

        setShowDeleteVolumeModal(false);
        setCurrentVolume(null);
      } else {
        toast.error(response.data.message || "Failed to delete volume.");
      }
    } catch (error) {
      console.error("Error deleting volume:", error);

      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Server error. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveVolume = (indexToRemove) => {
    setVolumeForms((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  const getIssueCountByFrequency = (frequency) => {
    switch (frequency) {
      case "Weekly":
        return 52;
      case "Bimonthly":
        return 24;
      case "Monthly":
        return 12;
      default:
        return "";
    }
  };

  const handleAddVolume = () => {
    const defaultIssues = getIssueCountByFrequency(currentSection?.frequency);

    setVolumeForms((prev) => [
      ...prev,
      {
        volume: "",
        issues: defaultIssues, // 👈 auto-filled
        startDate: "",
      },
    ]);
  };

  // const handleSaveVolumes = async () => {
  //   // validation
  //   for (let i = 0; i < volumeForms.length; i++) {
  //     const { volume, issues, startDate } = volumeForms[i];
  //     if (!volume || !issues || !startDate) {
  //       toast.error(`Please fill all required fields.`);
  //       return;
  //     }
  //   }

  //   try {
  //     const token = localStorage.getItem("authToken");

  //     const payload = {
  //       volume_start_dates: volumeForms.map((v) => v.startDate),
  //       subscription_to_date: currentSection?.to_date,
  //       receiving_date: currentSection?.receiving_date,
  //       frequency: currentSection?.frequency,
  //       volume: volumeForms.map((v) => v.volume),
  //       issue: volumeForms.map((v) => Number(v.issues)),
  //     };

  //     const response = await axios.post(
  //       `${API_URL}/api/library/subscriptions/${currentSection.subscription_id}/volumes`,
  //       payload,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //         withCredentials: true,
  //       },
  //     );

  //     if (response.data.status === true) {
  //       toast.success(response.data.message || "Volumes added successfully");

  //       await fetchVolumes(currentSection.subscription_id);
  //       setVolumeForms([]);
  //     } else {
  //       toast.error(response.data.message || "Failed to save volumes");
  //     }
  //   } catch (error) {
  //     console.error("Volume save error", error);
  //     toast.error("Server error while saving volumes");
  //   }
  // };

  const handleSaveVolumes = async () => {
    // Validation
    for (let i = 0; i < volumeForms.length; i++) {
      const { volume, issues, startDate } = volumeForms[i];
      if (!volume || !issues || !startDate) {
        toast.error(`Please fill all fields for row ${i + 1}`);
        return;
      }
    }

    try {
      const token = localStorage.getItem("authToken");

      const formData = new FormData();
      // formData.append("issue_count", currentSection.count);
      formData.append("subscription_id", currentSection.subscription_id);
      formData.append("subscription_to_date", currentSection.to_date);
      formData.append("receiving_date", currentSection.receiving_date);
      formData.append("frequency", currentSection.frequency);

      // append arrays
      volumeForms.forEach((v) => {
        formData.append("volume_start_dates[]", v.startDate);
        formData.append("volume[]", v.volume);
        formData.append("issue[]", v.issues);
      });

      const response = await axios.post(
        `${API_URL}/api/library/subscriptions/${currentSection.subscription_id}/volumes`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        },
      );

      if (response.data.status === true) {
        toast.success(response.data.message || "Volumes added successfully");

        // refresh volumes
        await fetchVolumes(currentSection.subscription_id);

        // reset form
        setVolumeForms([]);
      } else {
        toast.error(response.data.message || "Failed to save volumes");
      }
    } catch (error) {
      console.error("Volume save error", error);
      toast.error("Server error while saving volumes");
    }
  };

  return (
    <>
      <div className="w-full md:w-[95%] mx-auto p-4 ">
        <ToastContainer />
        {/* <div className="container"> */}
        {/* <div className="card  shadow-lg"> */}
        <div className="card rounded-md ">
          <div className="p-2 px-3 bg-gray-100 flex justify-between items-center">
            <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
              Subscription
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
              <button
                className="btn btn-primary btn-sm md:h-9 text-xs md:text-sm"
                onClick={handleAdd}
              >
                <FontAwesomeIcon icon={faPlus} style={{ marginRight: "5px" }} />
                Add
              </button>
              <RxCross1
                className="text-red-600 cursor-pointer hover:bg-red-100 rounded text-xl mt-1.5"
                onClick={() => navigate("/dashboard")}
              />
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
              className="lg:h-96 overflow-y-scroll lg:overflow-x-scroll"
              style={{
                scrollbarWidth: "thin", // Firefox
                scrollbarColor: "#C03178 transparent",
              }}
            >
              <div className="bg-white rounded-lg shadow-xs">
                <table className="min-w-full leading-normal table-auto">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="px-2 w-full md:w-[7%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Sr. No
                      </th>
                      <th className="px-2 w-full md:w-[25%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Magazine Title
                      </th>
                      <th className="px-2 w-full md:w-[10%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Frequency
                      </th>
                      <th className="px-2 w-full md:w-[18%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Subscription No.
                      </th>
                      <th className="px-2 w-full md:w-[10%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        From Date
                      </th>
                      <th className="px-2 w-full md:w-[10%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        To Date
                      </th>
                      <th className="px-2 w-full md:w-[10%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Receiving Date/Day
                      </th>
                      <th className="px-2 w-full md:w-[12%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Status
                      </th>
                      <th className="px-2 w-full md:w-[12%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Volume
                      </th>
                      <th className="px-2 w-full md:w-[7%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Edit
                      </th>
                      <th className="px-2 w-full md:w-[7%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Delete
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={11} className="py-20">
                          <div className="flex justify-center items-center text-blue-700 text-base sm:text-lg">
                            Please wait while data is loading...
                          </div>
                        </td>
                      </tr>
                    ) : displayedSections.length > 0 ? (
                      displayedSections.map((section, index) => (
                        <tr
                          key={section.periodical_id}
                          className={`${index % 2 === 0 ? "bg-white" : "bg-gray-100"} hover:bg-gray-50`}
                        >
                          <td className="text-center px-2 py-2 border border-gray-950 text-sm">
                            {currentPage * pageSize + index + 1}
                          </td>

                          <td className="text-center px-2 py-2 border border-gray-950 text-sm">
                            {section?.title}
                          </td>

                          <td className="text-center px-2 py-2 border border-gray-950 text-sm">
                            {section?.frequency}
                          </td>

                          <td className="text-center px-2 py-2 border border-gray-950 text-sm">
                            {section?.subscription_no}
                          </td>

                          <td className="text-center px-2 py-2 border border-gray-950 text-sm">
                            {formatDate(section?.from_date)}
                          </td>
                          <td className="text-center px-2 py-2 border border-gray-950 text-sm">
                            {formatDate(section?.to_date)}
                          </td>
                          <td className="text-center px-2 py-2 border border-gray-950 text-sm">
                            {section?.receiving_date}
                          </td>
                          <td className="text-center px-2 py-2 border border-gray-950 text-sm">
                            {section?.status}
                          </td>

                          <td className="text-center px-2 py-2 border border-gray-950 text-sm">
                            <button
                              className="text-pink-600"
                              onClick={() => handleView(section)}
                            >
                              <FaBook icon={faEdit} />
                            </button>
                          </td>

                          <td className="text-center px-2 py-2 border border-gray-950 text-sm">
                            <button
                              className="text-blue-600"
                              onClick={() => handleEdit(section)}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                          </td>

                          <td className="text-center px-2 py-2 border border-gray-950 text-sm">
                            {section.isDelete === "Y" ? (
                              <span className="text-red-600 font-semibold">
                                Deleted
                              </span>
                            ) : (
                              <button
                                onClick={() =>
                                  handleDelete(section.subscription_id)
                                }
                                className="text-red-600"
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : sections.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-20">
                          <div className="text-center text-red-700 text-base sm:text-lg">
                            Create subscription to view.
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td colSpan={10} className="py-20">
                          <div className="text-center text-red-700 text-base sm:text-lg">
                            Result not found!
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
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

        {/* Modal for adding a new section */}
        {showAddModal && (
          <div className="fixed inset-0 z-50   flex items-center justify-center bg-black bg-opacity-50">
            <div
              className="modal"
              style={{
                display: "block",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
              }}
            >
              <div
                className="modal-dialog modal-dialog-centered "
                style={{ maxWidth: "500px" }}
              >
                <div className="modal-content">
                  <div className="flex justify-between p-3">
                    <h5 className="modal-title">Create Subscription</h5>
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
                  <div className="modal-body space-y-4 p-3">
                    <div className="flex items-center">
                      <label htmlFor="title" className="w-2/3">
                        Title <span className="text-red-500">*</span>
                      </label>

                      <div className="w-2/3">
                        <Select
                          id="title"
                          options={titleOptions}
                          value={selectedTitle}
                          onChange={(option) => {
                            setSelectedTitle(option);

                            if (!option) {
                              setSubscriptionNo("");
                              setFrequency("");
                              setReceivingDate(null);
                              return;
                            }

                            const selectedItem = periodicals.find(
                              (item) => item.periodical_id === option.value,
                            );

                            if (selectedItem) {
                              setSubscriptionNo(selectedItem.subscription_no);
                              setFrequency(selectedItem.frequency);
                              setPeriodicalId(selectedItem.periodical_id);
                              setReceivingDate(null);
                            }
                          }}
                          placeholder="Select title"
                          isClearable
                        />

                        {(!nameAvailable || fieldErrors.title) && (
                          <small className="text-danger text-xs">
                            {nameError || fieldErrors.title}
                          </small>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center">
                      <label htmlFor="subscriptionno" className="w-2/3 ">
                        Subscription No <span className="text-red-500">*</span>
                      </label>
                      <div className="w-2/3">
                        <input
                          type="text"
                          maxLength={30}
                          id="subscriptionno"
                          value={subscriptionNo}
                          // onChange={handleChangeSubscription}
                          readOnly
                          className="w-full px-3 py-2 border bg-gray-200 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                        {fieldErrors.subscriptionNo && (
                          <small className="text-danger text-xs">
                            {fieldErrors.subscriptionNo}
                          </small>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center">
                      <label htmlFor="fromdate" className="w-2/3 ">
                        Subscription From Date{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="w-2/3">
                        <input
                          type="date"
                          maxLength={30}
                          id="fromdate"
                          value={fromDate}
                          onChange={handleChangeFromDate}
                          className="w-full px-3 py-2 border  border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                        {fieldErrors.fromDate && (
                          <small className="text-danger text-xs">
                            {fieldErrors.fromDate}
                          </small>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center ">
                      <label htmlFor="todate" className="w-2/3 ">
                        Subscription To Date{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="w-2/3">
                        <input
                          type="date"
                          maxLength={30}
                          id="todate"
                          value={toDate}
                          onChange={handleChangeToDate}
                          className="w-full px-3 py-2 border  border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                        {fieldErrors.toDate && (
                          <small className="text-danger text-xs">
                            {fieldErrors.toDate}
                          </small>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center">
                      <label htmlFor="receivedate" className="w-2/3">
                        Received By Date <span className="text-red-500">*</span>
                      </label>

                      <div className="w-2/3">
                        <Select
                          id="receivedate"
                          options={receivingDateOptions}
                          value={receivingDate}
                          onChange={(option) => setReceivingDate(option)}
                          placeholder="Select"
                          isClearable
                          isDisabled={!frequency}
                        />

                        {fieldErrors.receivingDate && (
                          <small className="text-danger text-xs">
                            {fieldErrors.receivingDate}
                          </small>
                        )}
                      </div>
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
            style={{
              display: "block",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="flex justify-between p-3">
                  <h5 className="modal-title">Edit Subscription</h5>
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
                <div className="modal-body space-y-4 p-3">
                  <div className="flex items-center">
                    <label htmlFor="title" className="w-2/3">
                      Title <span className="text-red-500">*</span>
                    </label>

                    <div className="w-2/3">
                      <input
                        type="text"
                        id="title"
                        value={selectedTitle?.label || ""}
                        readOnly
                        className="w-full px-3 py-2 border bg-gray-200 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <label htmlFor="subscriptionno" className="w-2/3 ">
                      Subscription No <span className="text-red-500">*</span>
                    </label>
                    <div className="w-2/3">
                      <input
                        type="text"
                        maxLength={30}
                        id="subscriptionno"
                        value={subscriptionNo}
                        // onChange={handleChangeSubscription}
                        readOnly
                        className="w-full px-3 py-2 border bg-gray-200 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                      />
                      {fieldErrors.subscriptionNo && (
                        <small className="text-danger text-xs">
                          {fieldErrors.subscriptionNo}
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <label htmlFor="fromdate" className="w-2/3 ">
                      Subscription From Date{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="w-2/3">
                      <input
                        type="date"
                        maxLength={30}
                        id="fromdate"
                        value={fromDate}
                        onChange={handleChangeFromDate}
                        className="w-full px-3 py-2 border  border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                      />
                      {fieldErrors.fromDate && (
                        <small className="text-danger text-xs">
                          {fieldErrors.fromDate}
                        </small>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center ">
                    <label htmlFor="todate" className="w-2/3 ">
                      Subscription To Date{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="w-2/3">
                      <input
                        type="date"
                        maxLength={30}
                        id="todate"
                        value={toDate}
                        onChange={handleChangeToDate}
                        className="w-full px-3 py-2 border  border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                      />
                      {fieldErrors.toDate && (
                        <small className="text-danger text-xs">
                          {fieldErrors.toDate}
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <label htmlFor="receivedate" className="w-2/3">
                      Received By Date <span className="text-red-500">*</span>
                    </label>

                    <div className="w-2/3">
                      <Select
                        id="receivedate"
                        options={receivingDateOptions}
                        value={receivingDate}
                        onChange={(option) => setReceivingDate(option)}
                        placeholder="Select"
                        isClearable
                        isDisabled={!frequency}
                      />

                      {fieldErrors.receivingDate && (
                        <small className="text-danger text-xs">
                          {fieldErrors.receivingDate}
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <label htmlFor="status" className="w-2/3">
                      Status <span className="text-red-500">*</span>
                    </label>

                    <div className="w-2/3">
                      <Select
                        id="status"
                        options={statusOptions}
                        value={status}
                        onChange={(option) => setStatus(option)}
                      />
                    </div>
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

        {/* Modal for confirming deletion */}
        {showDeleteModal && (
          <div
            className="modal"
            style={{
              display: "block",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            }}
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
                    Are you sure you want to delete Subscription :{" "}
                    {currentSection?.title}?
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

        {showVolumeModal && (
          <div
            className="modal"
            style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              style={{ maxWidth: "650px" }}
            >
              <div className="modal-content">
                <div className="flex justify-between p-3">
                  <h5
                    className="modal-title font-semibold"
                    style={{ color: "#1E40AF" }}
                  >
                    Subscription No: {currentSection?.subscription_no}
                    <span className="text-sm ml-2" style={{ color: "#C03078" }}>
                      - {currentSection?.title}
                    </span>
                  </h5>

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

                {/* <div className="px-3 pb-4"> */}
                <div className="px-3 pb-4 max-h-[400px] overflow-auto">
                  <div className="overflow-x-auto border border-gray-300 rounded-md">
                    <table className="min-w-full text-sm border-collapse">
                      <thead className="bg-gray-100 sticky top-0 z-10">
                        <tr>
                          <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                            Sr. No
                          </th>
                          <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                            Volume
                          </th>
                          <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                            No. of Issue
                          </th>
                          <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                            Volume Start Date
                          </th>
                          {currentSection?.status === "Active" && (
                            <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              Option
                            </th>
                          )}
                        </tr>
                      </thead>

                      <tbody>
                        {loadingVolumes ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="text-center py-4 text-blue-700"
                            >
                              Please wait while data is loading...
                            </td>
                          </tr>
                        ) : volumeData.length > 0 ? (
                          volumeData.map((item, index) => (
                            <tr
                              key={index}
                              className="hover:bg-gray-50 transition"
                            >
                              <td className="w-[7%] text-center px-2 py-2 border border-gray-950 text-sm">
                                {index + 1}
                              </td>

                              <td className=" w-[10%] text-center px-2 py-2 border border-gray-950 text-sm">
                                {item.volume || ""}
                              </td>

                              <td className=" w-[10%] text-center px-2 py-2 border border-gray-950 text-sm">
                                {item.no_of_issues || ""}
                              </td>

                              <td className=" w-[15%] text-center px-2 py-2 border border-gray-950 text-sm">
                                {formatDate(item.volume_start_date || "")}
                              </td>

                              {currentSection?.status === "Active" && (
                                <td className="w-[10%] text-center px-2 py-2 border border-gray-950 text-sm">
                                  <button
                                    className="text-red-600"
                                    onClick={() =>
                                      handleVolumeDelete(
                                        item.subscription_vol_id,
                                      )
                                    }
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="text-center py-4">
                              No data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {currentSection?.status === "Active" && (
                    <div className="flex justify-end mt-1">
                      <button
                        className="px-2 py-1 bg-blue-600 text-white rounded-md"
                        onClick={handleAddVolume}
                      >
                        Add
                      </button>
                    </div>
                  )}
                  {volumeForms.length > 0 && (
                    <>
                      <div className="mt-2 p-2 border border-gray-300 rounded-md bg-gray-50">
                        {volumeForms.map((form, index) => (
                          <div
                            key={index}
                            className="relative grid grid-cols-1 md:grid-cols-3 gap-4  p-3 border rounded-md bg-white"
                          >
                            <button
                              type="button"
                              onClick={() => handleRemoveVolume(index)}
                              className="absolute top-2 right-2 text-red-500 hover:text-red-700 "
                              title="Remove volume"
                            >
                              ✕
                            </button>

                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Volume <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={form.volume}
                                onChange={(e) => {
                                  const updated = [...volumeForms];
                                  updated[index].volume = e.target.value;
                                  setVolumeForms(updated);
                                }}
                                className="w-full border rounded-md px-2 py-1"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-1">
                                No. of Issue{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={form.issues}
                                onChange={(e) => {
                                  const updated = [...volumeForms];
                                  updated[index].issues = e.target.value;
                                  setVolumeForms(updated);
                                }}
                                className="w-full border rounded-md px-2 py-1"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Volume Start Date{" "}
                                <span className="text-red-500">*</span>
                              </label>

                              <input
                                type="date"
                                value={form.startDate}
                                min={currentSection?.from_date || ""}
                                max={currentSection?.to_date || ""}
                                onChange={(e) => {
                                  const updated = [...volumeForms];
                                  updated[index].startDate = e.target.value;
                                  setVolumeForms(updated);
                                }}
                                className="w-full border rounded-md px-2 py-1"
                              />

                              {/* Optional helper text */}
                              {/* {currentSection?.from_date &&
                              currentSection?.to_date && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Select date between {currentSection.from_date}{" "}
                                  and {currentSection.to_date}
                                </p>
                              )} */}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end gap-3 mt-4">
                        <button
                          type="button"
                          onClick={handleSaveVolumes}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Save
                        </button>

                        <button
                          type="button"
                          onClick={handleCloseModal}
                          className="px-4 py-2  bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                        >
                          Back
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {showDeleteVolumeModal && (
          <div
            className="modal"
            style={{
              display: "block",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="flex justify-between p-3">
                  <h5 className="modal-title">Confirm Deletion</h5>
                  <RxCross1
                    className="float-end relative mt-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                    type="button"
                    onClick={() => setShowDeleteVolumeModal(false)}
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
                    Are you sure you want to delete Volume :{" "}
                    {/* {currentSection?.title} - */}
                    {currentVolume?.volume} ?
                  </p>
                </div>
                <div className=" flex justify-end p-3">
                  <button
                    type="button"
                    className="btn btn-danger px-3 mb-2"
                    style={{}}
                    onClick={handleSubmitVolumeDelete}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* </div> */}
      </div>
    </>
  );
}

export default Subscription;
