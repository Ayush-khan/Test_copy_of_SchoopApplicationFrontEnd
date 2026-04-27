import { useEffect, useState, useRef } from "react";
import axios from "axios";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RxCross1 } from "react-icons/rx";
import Select from "react-select";

function HealthActivityParameter() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [className, setClassName] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  const [fieldErrors, setFieldErrors] = useState({});
  const [nameError, setNameError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [parameterGroup, setParameterGroup] = useState([]);
  const [isLoadingParameters, setIsLoadingParameters] = useState(false);

  const [groupName, setGroupName] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  // const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(1);

  const [parameterName, setParameterName] = useState("");
  const [sequenceNo, setSequenceNo] = useState("");
  const [description, setDescription] = useState("");

  const [checkAvailability, setCheckAvailabity] = useState(true);
  const [suggestedSequence, setSuggestedSequence] = useState("");

  const [lastSequence, setLastSequence] = useState(0);
  const [loadingSequence, setLoadingSequence] = useState("");

  const [isEditMode, setIsEditMode] = useState(false);

  const [subGroups, setSubGroups] = useState("");
  const [activeSubGroup, setActiveSubGroup] = useState(null);
  const [selectedSubGroup, setSelectedSubGroup] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null);

  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");

  const pageSize = 10;

  useEffect(() => {
    fetchSections();
    // fetchDataRoleId();
    fetchGroup();
  }, []);

  useEffect(() => {
    if (selectedGroupId !== undefined) {
      fetchParameterGroup(selectedGroupId);
      fetchLastSequenceNo(selectedGroupId);
      fetchSubGroup(selectedGroupId);
    }
  }, [selectedGroupId]);

  useEffect(() => {
    if (!isEditMode && lastSequence !== null && lastSequence !== undefined) {
      setSequenceNo(lastSequence + 1);
    }
  }, [lastSequence, isEditMode]);

  useEffect(() => {
    if (!selectedGroupId || !sequenceNo) return;

    checkSequenceAvailability(selectedGroupId, sequenceNo);
  }, [selectedGroupId, sequenceNo]);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      const response = await axios.get(
        `${API_URL}/api/get_health_activity_parameter_list`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = response.data.data || [];
      setSections(data);
      // console.log("parameter", sections);
      setPageCount(Math.ceil(data.length / pageSize));
    } catch (error) {
      setError(error.message || "Error fetching data");
      toast.error(error.message || "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  // const fetchDataRoleId = async () => {
  //   const token = localStorage.getItem("authToken");

  //   if (!token) {
  //     console.error("No authentication token found");
  //     return;
  //   }

  //   try {
  //     // Fetch session data
  //     const sessionResponse = await axios.get(`${API_URL}/api/sessionData`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //     setRoleId(sessionResponse?.data?.user.role_id); // Store role_id
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //   }
  // };

  const fetchGroup = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      const response = await axios.get(
        `${API_URL}/api/get_health_activity_groups`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = response.data.data || [];
      setGroupName(data);
      // console.log("group name", groupName);
    } catch (error) {
      setError(error.message || "Error fetching data");
      toast.error(error.message || "Error fetching data");
    }
  };

  const fetchParameterGroup = async (groupId) => {
    setIsLoadingParameters(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      const id = groupId === null ? "null" : groupId;

      const response = await axios.get(
        `${API_URL}/api/get_health_activity_group_parameter_list/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = response.data.data || [];
      setParameterGroup(data);

      // console.log("group inside parameter", data);
    } catch (error) {
      setError(error.message || "Error fetching data");
      toast.error(error.message || "Error fetching data");
    } finally {
      setIsLoadingParameters(false);
    }
  };

  const groupOptions = () => {
    return groupName.map((group) => ({
      label: group.group_name,
      value: group.id,
    }));
  };

  const fetchSubGroup = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      const response = await axios.get(
        `${API_URL}/api/get_health_activity_group/${selectedGroupId}/columns_config`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // const data = response.data.data || [];
      const data = response.data.data?.columns_config || [];
      setSubGroups(data);
      console.log("sub group", subGroups);
    } catch (error) {
      setError(error.message || "Error fetching data");
      toast.error(error.message || "Error fetching data");
    }
  };

  const fetchLastSequenceNo = async () => {
    setLoadingSequence(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      const response = await axios.get(
        `${API_URL}/api/get_health_activity_last_sequence/${selectedGroupId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = response.data.last_sequence ?? 0;
      setLastSequence(data);
      // setSequenceNo(data + 1);
      console.log("last sequence no", data);
    } catch (error) {
      setError(error.message || "Error fetching data");
      toast.error(error.message || "Error fetching data");
    } finally {
      setLoadingSequence(false);
    }
  };

  const subGroupOptions = () =>
    subGroups.map((group) => ({
      value: group.key,
      label: group.label,
    }));

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

  const filteredSections = Array.isArray(sections)
    ? sections.filter((leave) => {
        const searchLower = searchTerm.trim().toLowerCase();

        const paramterName = leave.parameter_name
          ?.toLowerCase()
          .includes(searchLower);

        const groupName = leave.group_name?.toLowerCase().includes(searchLower);

        const sequence = leave.sequence?.toString().includes(searchLower);

        return paramterName || groupName || sequence;
      })
    : [];
  useEffect(() => {
    setPageCount(Math.ceil(filteredSections.length / pageSize));
  }, [filteredSections, pageSize]);

  const displayedSections = filteredSections.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize,
  );

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const checkSequenceAvailability = async (groupId, sequenceNo) => {
    try {
      const token = localStorage.getItem("authToken");

      const res = await fetch(
        `${API_URL}/api/check_sequence_availability/${groupId}/${sequenceNo}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      setCheckAvailabity(data.available);
      setSuggestedSequence(data.suggested_sequence || "");

      return data;
    } catch (err) {
      console.error(err);
    }
  };

  // const handleEdit = (leave) => {
  //   setIsEditMode(true);
  //   setCurrentSection(leave);
  //   setSelectedGroupId(leave.group_id?.toString());
  //   setSelectedGroup(leave.group_name);

  //   setSequenceNo(leave.sequence);
  //   setParameterName(leave.parameter_name);

  //   setShowEditModal(true);
  // };

//  const handleEdit = (leave) => {
//    setIsEditMode(true);
//    setCurrentSection(leave);

//    setSelectedGroupId(leave.group_id);
//    setSelectedGroup(leave.group_name);

//    setSequenceNo(leave.sequence || "");
//    setParameterName(leave.parameter_name || "");
//    setDescription(leave.description || "");

//    console.log("👉 param_data:", leave.param_data);
//    console.log("👉 subGroups:", subGroups);

//    if (subGroups?.length > 0 && leave?.param_data?.length > 0) {
//      let foundSubGroup = null;
//      let foundChild = null;

//      const savedSubGroup = leave.param_data[0];
//      const savedChild = savedSubGroup.children?.[0];

//      // ✅ normalize function
//      const normalize = (str) => str?.toString().trim().toLowerCase();

//      // 🔍 MATCH SUB GROUP
//      foundSubGroup = subGroups.find(
//        (g) => normalize(g.label) === normalize(savedSubGroup.label),
//      );

//      // 🔍 MATCH CHILD
//      if (foundSubGroup && savedChild) {
//        foundChild = foundSubGroup.children?.find(
//          (c) => normalize(c.label) === normalize(savedChild.label),
//        );
//      }

//      console.log("✅ Matched Sub Group:", foundSubGroup);
//      console.log("✅ Matched Child:", foundChild);

//      setSelectedSubGroup(foundSubGroup || null);
//      setSelectedChild(foundChild || null);
//    } else {
//      console.log("❌ subGroups or param_data missing");
//      setSelectedSubGroup(null);
//      setSelectedChild(null);
//    }

//    setShowEditModal(true);
//  };


const handleEdit = (leave) => {
  setIsEditMode(true);
  setCurrentSection(leave);

  setSelectedGroupId(leave.group_id);
  setSelectedGroup(leave.group_name);

  setSequenceNo(leave.sequence || "");
  setParameterName(leave.parameter_name || "");
  setDescription(leave.description || "");

  // ❌ REMOVE mapping from here

  setShowEditModal(true);
};

useEffect(() => {
  if (
    showEditModal &&
    currentSection &&
    subGroups?.length > 0 &&
    currentSection.param_data?.length > 0
  ) {
    console.log("🔥 Running mapping after subGroups loaded");

    const savedSubGroup = currentSection.param_data[0];
    const savedChild = savedSubGroup.children?.[0];

    const normalize = (str) => str?.toString().trim().toLowerCase();

    // 🔍 Match Sub Group
    const foundSubGroup = subGroups.find(
      (g) => normalize(g.label) === normalize(savedSubGroup.label),
    );

    // 🔍 Match Child
    let foundChild = null;
    if (foundSubGroup && savedChild) {
      foundChild = foundSubGroup.children?.find(
        (c) => normalize(c.label) === normalize(savedChild.label),
      );
    }

    console.log("✅ SubGroup:", foundSubGroup);
    console.log("✅ Child:", foundChild);

    setSelectedSubGroup(foundSubGroup || null);
    setSelectedChild(foundChild || null);
  }
}, [subGroups, showEditModal]);
  const handleAdd = () => {
    setIsEditMode(false);
    setShowAddModal(true);
    setSequenceNo(lastSequence ? lastSequence + 1 : 1);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setClassName("");

    // setGroupName(null);
    setSelectedGroup(null);
    setSelectedGroupId(1);
    setParameterName("");
    setSequenceNo("");
    setCurrentSection(null);
    setFieldErrors({});
    setNameError("");

    setSubGroups(null);
    setActiveSubGroup(null);
    setSelectedSubGroup(null);
    setSelectedChild(null);
    setDescription("");
  };

  const handleSubmitAdd = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!parameterName || !sequenceNo) {
      toast.error("Parameter Name and Sequence No are required.");
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      const payload = {
        name: parameterName,
        group_id: selectedGroupId || 1,
        sequence: Number(sequenceNo),
        description: description,
        fitness_parameter: selectedSubGroup?.label || null,
        fitness_sub_parameter: selectedChild?.label || null,
      };

      const response = await axios.post(
        `${API_URL}/api/save_health_activity_parameter`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        },
      );

      toast.success("Health & Activity parameter added successfully!");

      // RESET
      setParameterName("");
      setSequenceNo("");
      setSelectedSubGroup(null);
      setSelectedChild(null);

      fetchSections();
      fetchParameterGroup(selectedGroupId);
      fetchLastSequenceNo(selectedGroupId);

      handleCloseModal();
    } catch (error) {
      console.error("Error adding Parameter:", error);

      if (error.response?.status === 409) {
        const errorMessage = "This parameter name already exists.";
        toast.error(errorMessage);
        setFieldErrors((prev) => ({ ...prev, name: errorMessage }));
      } else {
        toast.error(
          error.response?.data?.message ||
            "Server error. Please try again later.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // const handleSubmitEdit = async () => {
  //   if (isSubmitting) return;
  //   setIsSubmitting(true);

  //   if (!parameterName || !sequenceNo) {
  //     toast.error("Parameter Name and Sequence No are required.");
  //     setIsSubmitting(false);
  //     return;
  //   }

  //   try {
  //     const token = localStorage.getItem("authToken");
  //     if (!token) throw new Error("No authentication token found");

  //     const payload = {
  //       name: parameterName,
  //       group_id: selectedGroupId || 1,
  //       sequence: sequenceNo,
  //     };

  //     const response = await axios.put(
  //       `${API_URL}/api/update_health_activity_parameter/${currentSection.id}`,
  //       payload,
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //         withCredentials: true,
  //       },
  //     );

  //     toast.success("Health & Activity parameter updated successfully!");

  //     // reset fields
  //     setParameterName("");
  //     setSequenceNo("");
  //     fetchSections();
  //     fetchLastSequenceNo(selectedGroupId);
  //     fetchParameterGroup(selectedGroupId);
  //     handleCloseModal();
  //   } catch (error) {
  //     console.error("Error adding Parameter:", error);

  //     if (error.response && error.response.status === 409) {
  //       const errorMessage = "This parameter name already exists.";
  //       toast.error(errorMessage);
  //       setFieldErrors((prev) => ({ ...prev, name: errorMessage }));
  //     } else {
  //       toast.error("Server error. Please try again later.");
  //     }
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const handleSubmitEdit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!parameterName || !sequenceNo) {
      toast.error("Parameter Name and Sequence No are required.");
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      // ✅ BUILD param_data (IMPORTANT)
      let paramData = [];

      if (selectedSubGroup) {
        paramData = [
          {
            key: selectedSubGroup.key,
            label: selectedSubGroup.label,
            children: selectedChild
              ? [
                  {
                    key: selectedChild.key,
                    label: selectedChild.label,
                  },
                ]
              : [],
          },
        ];
      }

      const payload = {
        name: parameterName,
        group_id: selectedGroupId || 1,
        sequence: Number(sequenceNo),

        // ✅ NEW FIELDS
        description: description || "",
        param_data: paramData,
      };

      console.log("🚀 Update Payload:", payload);

      await axios.put(
        `${API_URL}/api/update_health_activity_parameter/${currentSection.id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        },
      );

      toast.success("Health & Activity parameter updated successfully!");

      // ✅ RESET
      setParameterName("");
      setSequenceNo("");
      setDescription("");
      setSelectedSubGroup(null);
      setSelectedChild(null);

      fetchSections();
      fetchLastSequenceNo(selectedGroupId);
      fetchParameterGroup(selectedGroupId);

      handleCloseModal();
    } catch (error) {
      console.error("Error updating Parameter:", error);

      if (error.response?.status === 409) {
        const errorMessage = "This parameter name already exists.";
        toast.error(errorMessage);
        setFieldErrors((prev) => ({ ...prev, name: errorMessage }));
      } else {
        toast.error(
          error.response?.data?.message ||
            "Server error. Please try again later.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDelete = (id) => {
    setCurrentSection("");
    const sectionToDelete = sections.find((leave) => leave.id === id);

    setCurrentSection(sectionToDelete);
    setShowDeleteModal(true);
  };

  const handleSubmitDelete = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");

      if (!token || !currentSection || !currentSection.id) {
        throw new Error("Health & Activity parameter is missing");
      }

      const response = await axios.delete(
        `${API_URL}/api/delete_health_activity_parameter/${currentSection.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        },
      );
      fetchSections();
      if (response.status === 200) {
        setShowDeleteModal(false);
        setCurrentSection(null);
        toast.success("Health & Activity parameter deleted successfully!");
        fetchSections();
        fetchParameterGroup(selectedGroupId);
        fetchLastSequenceNo(selectedGroupId);
      } else {
        toast.error(response.data.message || "Failed to delete");
      }
    } catch (error) {
      console.error("Error deleting:", error);

      if (error.response && error.response.status === 409) {
        toast.error(error.response.data.message || "Conflict error");
      } else {
        toast.error(
          error.response?.data?.message ||
            "Server error. Please try again later.",
        );
      }
    } finally {
      setIsSubmitting(false);
      setShowDeleteModal(false);
    }
  };

  const toggleStatus = async (id) => {
    try {
      const token = localStorage.getItem("authToken");

      await axios.get(`${API_URL}/api/health_activity_parameter_status/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Health & Activity parameter status updated successfully");

      fetchSections();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const reset = () => {
    setGroupName([]);
    setSelectedGroupId(null);
    setSelectedGroup(null);
    setSequenceNo("");
    setParameterName("");
  };

  return (
    <>
      <ToastContainer />

      <div className="container  mt-4">
        <div className="card mx-auto lg:w-[70%] shadow-lg">
          <div className="p-2 px-3 bg-gray-100 flex justify-between items-center">
            <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
              Health & Activity Parameter
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
              className=" w-full  mx-auto  overflow-y-scroll lg:overflow-x-hidden "
              // h-96 lg:h-96
            >
              <div className="bg-white  rounded-lg shadow-xs ">
                <table className="min-w-full table-auto border-collapse">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="px-3 py-2 text-center border border-gray-950 text-sm font-semibold text-gray-900">
                        Sr. No
                      </th>
                      <th className="px-3 py-2 text-center border border-gray-950 text-sm font-semibold text-gray-900">
                        Parameter Name
                      </th>
                      <th className="px-3 py-2 text-center border border-gray-950 text-sm font-semibold text-gray-900">
                        Group Name
                      </th>
                      <th className="px-3 py-2 text-center border border-gray-950 text-sm font-semibold text-gray-900">
                        Sequence No
                      </th>
                      <th className="px-3 py-2 text-center border border-gray-950 text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="px-3 py-2 text-center border border-gray-950 text-sm font-semibold text-gray-900">
                        Edit
                      </th>
                      <th className="px-3 py-2 text-center border border-gray-950 text-sm font-semibold text-gray-900">
                        Delete
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="text-center text-blue-700 text-xl py-10"
                        >
                          Please wait while data is loading...
                        </td>
                      </tr>
                    ) : sections.length === 0 ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="text-center py-6 text-blue-700 text-lg"
                        >
                          Please create health & activity parameter to view.
                        </td>
                      </tr>
                    ) : displayedSections.length === 0 ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="text-center py-6 text-red-700 text-lg"
                        >
                          Result not found!
                        </td>
                      </tr>
                    ) : (
                      displayedSections.map((leave, index) => (
                        <tr
                          key={leave.id}
                          className={`${index % 2 === 0 ? "bg-white" : "bg-gray-100"} hover:bg-gray-50`}
                        >
                          <td className="text-center border border-gray-950 text-sm py-2">
                            {currentPage * pageSize + index + 1}
                          </td>

                          <td className="text-center border border-gray-950 text-sm py-2">
                            {leave.parameter_name}
                          </td>

                          <td className="text-center border border-gray-950 text-sm py-2">
                            {leave.group_name}
                          </td>

                          <td className="text-center border border-gray-950 text-sm py-2">
                            {leave.sequence}
                          </td>

                          <td className="border border-gray-950 text-sm py-2 text-center">
                            <div className="flex justify-center items-center">
                              <button
                                onClick={() => toggleStatus(leave.id)}
                                className={`w-10 h-5 flex items-center rounded-full p-1 transition-all duration-300 ${
                                  leave.is_active === "Y"
                                    ? "bg-green-500"
                                    : "bg-gray-400"
                                }`}
                              >
                                <div
                                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all duration-300 ${
                                    leave.is_active === "Y"
                                      ? "translate-x-5"
                                      : "translate-x-0"
                                  }`}
                                ></div>
                              </button>
                            </div>
                          </td>

                          <td className="text-center border border-gray-950 text-sm py-2">
                            <button
                              className="text-blue-600 hover:text-blue-800"
                              onClick={() => handleEdit(leave)}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                          </td>

                          <td className="text-center border border-gray-950 text-sm py-2">
                            <button
                              className="text-red-600 hover:text-red-800"
                              onClick={() => handleDelete(leave.id)}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {sections.length > 0 && (
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
            )}
          </div>
        </div>

        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-2">
            <div className="w-full max-w-5xl bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="flex justify-between items-center p-2 border-b">
                <h5 className="text-lg font-semibold">
                  Create Health & Activity Parameter
                </h5>

                <RxCross1
                  className="text-xl text-red-600 cursor-pointer hover:bg-red-100 rounded"
                  onClick={handleCloseModal}
                />
              </div>

              <div className="h-1 bg-pink-700 w-[98%] mx-auto"></div>

              <div className="p-4 overflow-y-auto max-h-[80vh]">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-1/2 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <label className="sm:w-40">Group Name</label>

                      <div className="flex-1">
                        <Select
                          options={groupOptions()} // [{value, label}]
                          value={
                            groupOptions().find(
                              (opt) => opt.value === selectedGroupId,
                            ) || null
                          }
                          onChange={(selectedOption) => {
                            if (!selectedOption) {
                              setSelectedGroupId(null);
                              setSelectedGroup("");
                              return;
                            }

                            setSelectedGroupId(selectedOption.value);
                            setSelectedGroup(selectedOption.label);
                          }}
                          // isClearable
                          placeholder="Select Group"
                          className="shadow-md"
                          // FIX SCROLL ISSUE
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          styles={{
                            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                          }}
                        />
                      </div>
                    </div>

                    {/* {subGroups && subGroups.length > 0 && (
                      <>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-4">
                          <label className="sm:w-40">Sub Group</label>

                          <div className="flex-1">
                            <Select
                              options={subGroupOptions()}
                              value={
                                subGroupOptions().find(
                                  (opt) => opt.value === selectedSubGroup?.key,
                                ) || null
                              }
                              onChange={(selectedOption) => {
                                if (!selectedOption) {
                                  setSelectedSubGroup(null);
                                  return;
                                }

                                const selected = subGroups.find(
                                  (g) => g.key === selectedOption.value,
                                );

                                setSelectedSubGroup(selected);
                              }}
                              placeholder="Select Sub Group"
                              className="shadow-md"
                              menuPortalTarget={document.body}
                              menuPosition="fixed"
                              styles={{
                                menuPortal: (base) => ({
                                  ...base,
                                  zIndex: 9999,
                                }),
                              }}
                              isClearable
                            />
                          </div>
                        </div>

                       
                        <div className="mt-4">
                          {!selectedSubGroup ? (
                            <p className="text-gray-400 text-sm">
                              Please select a Sub Group
                            </p>
                          ) : selectedSubGroup?.children?.length > 0 ? (
                            <div className="border rounded-md p-3 bg-gray-50">
                              <p className="font-semibold text-gray-700 mb-2">
                                {selectedSubGroup.label} - Sub Groups
                              </p>

                              {selectedSubGroup.children.map((child) => (
                                <div
                                  key={child.key}
                                  className="flex justify-between items-center bg-white border px-3 py-2 rounded mb-2"
                                >
                                  <span className="text-sm text-gray-700">
                                    {child.label}
                                  </span>

                                  <button
                                    className="text-red-500 hover:text-red-700 text-xs"
                                    onClick={() =>
                                      removeChildUI(
                                        selectedSubGroup.key,
                                        child.key,
                                      )
                                    }
                                  >
                                    ❌
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-400 text-sm">
                              No Sub-Sub Groups Available
                            </p>
                          )}
                        </div>
                      </>
                    )} */}

                    {subGroups && subGroups.length > 0 && (
                      <>
                        {/* SUB GROUP DROPDOWN */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-4">
                          <label className="sm:w-40">Sub Group</label>

                          <div className="flex-1">
                            <Select
                              options={subGroupOptions()}
                              value={
                                subGroupOptions().find(
                                  (opt) => opt.value === selectedSubGroup?.key,
                                ) || null
                              }
                              onChange={(selectedOption) => {
                                if (!selectedOption) {
                                  setSelectedSubGroup(null);
                                  setSelectedChild(null); // reset child
                                  return;
                                }

                                const selected = subGroups.find(
                                  (g) => g.key === selectedOption.value,
                                );

                                setSelectedSubGroup(selected);
                                setSelectedChild(null); // reset child on change
                              }}
                              placeholder="Select Sub Group"
                              className="shadow-md"
                              menuPortalTarget={document.body}
                              menuPosition="fixed"
                              styles={{
                                menuPortal: (base) => ({
                                  ...base,
                                  zIndex: 9999,
                                }),
                              }}
                              isClearable
                            />
                          </div>
                        </div>

                        {selectedSubGroup?.children?.length > 0 && (
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-4">
                            <label className="sm:w-40">Sub Sub Group</label>

                            <div className="flex-1">
                              <Select
                                options={selectedSubGroup.children.map(
                                  (child) => ({
                                    value: child.key,
                                    label: child.label,
                                  }),
                                )}
                                value={
                                  selectedSubGroup.children
                                    .map((child) => ({
                                      value: child.key,
                                      label: child.label,
                                    }))
                                    .find(
                                      (opt) => opt.value === selectedChild?.key,
                                    ) || null
                                }
                                onChange={(selectedOption) => {
                                  if (!selectedOption) {
                                    setSelectedChild(null);
                                    return;
                                  }

                                  const selectedChildObj =
                                    selectedSubGroup.children.find(
                                      (c) => c.key === selectedOption.value,
                                    );

                                  setSelectedChild(selectedChildObj);
                                }}
                                placeholder="Select Sub Sub Group"
                                className="shadow-md"
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={{
                                  menuPortal: (base) => ({
                                    ...base,
                                    zIndex: 9999,
                                  }),
                                }}
                                isClearable
                              />
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <label className="sm:w-40">
                        Parameter Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control shadow-md flex-1"
                        value={parameterName}
                        // onChange={(e) => setParameterName(e.target.value)}
                        onChange={(e) => {
                          const value = e.target.value;

                          // Allow alphabets, numbers, and space
                          // if (/^[a-zA-Z0-9 ]*$/.test(value)) {
                          //   setParameterName(value);
                          // }
                          if (/^.*$/.test(value)) {
                            setParameterName(value);
                          }
                        }}
                        maxLength={30}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <label className="sm:w-40 pt-2">
                        Sequence No. <span className="text-red-500">*</span>
                      </label>

                      {/* INPUT + TEXT */}
                      <div className="flex-1 flex flex-col">
                        <input
                          type="text"
                          className="form-control shadow-md w-full"
                          value={sequenceNo}
                          onChange={(e) => {
                            const value = e.target.value;

                            // Allow only digits
                            if (/^\d*$/.test(value)) {
                              setSequenceNo(value);
                            }
                          }}
                          maxLength={4}
                        />

                        {/* TEXT ALWAYS BELOW INPUT */}
                        {loadingSequence ? (
                          <span className="text-sm text-blue-500 mt-1">
                            Loading sequence...
                          </span>
                        ) : (
                          <span className="text-sm text-blue-500 mt-1">
                            Last sequence no:{" "}
                            <span className="font-semibold">
                              {lastSequence}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <label className="sm:w-40">Description </label>
                      <input
                        type="text"
                        className="form-control shadow-md flex-1"
                        value={description}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^.*$/.test(value)) {
                            setDescription(value);
                          }
                        }}
                        maxLength={100}
                      />
                    </div>
                  </div>

                  <div className="w-full md:w-1/2 md:border-l md:pl-4">
                    <h6 className="font-semibold mb-2 text-blue-700">
                      Parameter List for{" "}
                      {selectedGroupId === null || selectedGroupId === ""
                        ? "Basic Information"
                        : groupName.find((g) => g.id == selectedGroupId)
                            ?.group_name || "Basic Information"}
                    </h6>

                    {isLoadingParameters ? (
                      <div className="flex justify-center items-center h-40">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : parameterGroup.length > 0 ? (
                      <div className="max-h-52 overflow-y-auto">
                        <table className="table table-bordered text-sm w-full">
                          <thead>
                            <tr>
                              <th className="text-center">Parameter Name</th>
                              <th className="text-center">Sequence</th>
                            </tr>
                          </thead>
                          <tbody>
                            {parameterGroup.map((item) => (
                              <tr key={item.id}>
                                <td className="text-center">
                                  {item.parameter_name}
                                </td>
                                <td className="text-center">{item.sequence}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        No parameters available
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row justify-end gap-2 p-4 border-t">
                <button
                  type="button"
                  className="btn btn-primary px-4"
                  onClick={handleSubmitAdd}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Add"}
                </button>

                <button
                  type="button"
                  className="btn btn-danger px-4"
                  onClick={() => reset()}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {/* {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-2">
            
            <div className="w-full max-w-5xl bg-white rounded-lg shadow-lg overflow-hidden">
              
              <div className="flex justify-between items-center p-2 border-b">
                <h5 className="text-lg font-semibold">
                  Edit Health & Activity Parameter
                </h5>

                <RxCross1
                  className="text-xl text-red-600 cursor-pointer hover:bg-red-100 rounded"
                  onClick={handleCloseModal}
                />
              </div>

              <div className="h-1 bg-pink-700 w-[98%] mx-auto"></div>

              <div className="p-4 overflow-y-auto max-h-[80vh]">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-1/2 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <label className="sm:w-40">Group Name</label>

                      <div className="flex-1">
                        <Select
                          options={groupOptions()}
                          value={
                            groupOptions().find(
                              (opt) =>
                                opt.value.toString() ===
                                selectedGroupId?.toString(),
                            ) || null
                          }
                          onChange={(selectedOption) => {
                            if (!selectedOption) {
                              setSelectedGroupId(null);
                              setSelectedGroup("");
                              return;
                            }

                            setSelectedGroupId(selectedOption.value);

                            const selected = groupName.find(
                              (g) => g.id === selectedOption.value,
                            );

                            setSelectedGroup(selected?.group_name || "");
                          }}
                          // isClearable
                          placeholder="Select Group"
                          className="shadow-md"
                          // FIX SCROLL ISSUE
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          styles={{
                            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                          }}
                        />
                      </div>
                    </div>

                    {subGroups && subGroups.length > 0 && (
                      <>
                       
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-4">
                          <label className="sm:w-40">Sub Group</label>

                          <div className="flex-1">
                            <Select
                              options={subGroupOptions()}
                              value={
                                subGroupOptions().find(
                                  (opt) => opt.value === selectedSubGroup?.key,
                                ) || null
                              }
                              onChange={(selectedOption) => {
                                if (!selectedOption) {
                                  setSelectedSubGroup(null);
                                  setSelectedChild(null); // reset child
                                  return;
                                }

                                const selected = subGroups.find(
                                  (g) => g.key === selectedOption.value,
                                );

                                setSelectedSubGroup(selected);
                                setSelectedChild(null); // reset child on change
                              }}
                              placeholder="Select Sub Group"
                              className="shadow-md"
                              menuPortalTarget={document.body}
                              menuPosition="fixed"
                              styles={{
                                menuPortal: (base) => ({
                                  ...base,
                                  zIndex: 9999,
                                }),
                              }}
                              isClearable
                            />
                          </div>
                        </div>

                        {selectedSubGroup?.children?.length > 0 && (
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-4">
                            <label className="sm:w-40">Sub Sub Group</label>

                            <div className="flex-1">
                              <Select
                                options={selectedSubGroup.children.map(
                                  (child) => ({
                                    value: child.key,
                                    label: child.label,
                                  }),
                                )}
                                value={
                                  selectedSubGroup.children
                                    .map((child) => ({
                                      value: child.key,
                                      label: child.label,
                                    }))
                                    .find(
                                      (opt) => opt.value === selectedChild?.key,
                                    ) || null
                                }
                                onChange={(selectedOption) => {
                                  if (!selectedOption) {
                                    setSelectedChild(null);
                                    return;
                                  }

                                  const selectedChildObj =
                                    selectedSubGroup.children.find(
                                      (c) => c.key === selectedOption.value,
                                    );

                                  setSelectedChild(selectedChildObj);
                                }}
                                placeholder="Select Sub Sub Group"
                                className="shadow-md"
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={{
                                  menuPortal: (base) => ({
                                    ...base,
                                    zIndex: 9999,
                                  }),
                                }}
                                isClearable
                              />
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <label className="sm:w-40">
                        Parameter Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control shadow-md flex-1"
                        value={parameterName}
                        // onChange={(e) => setParameterName(e.target.value)}
                        onChange={(e) => {
                          const value = e.target.value;

                          // Allow alphabets, numbers, and space
                          // if (/^[a-zA-Z0-9 ]*$/.test(value)) {
                          //   setParameterName(value);
                          // }
                          if (/^.*$/.test(value)) {
                            setParameterName(value);
                          }
                        }}
                        maxLength={30}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <label className="sm:w-40 pt-2">
                        Sequence No. <span className="text-red-500">*</span>
                      </label>

                      <div className="flex-1 flex flex-col">
                        <input
                          type="text"
                          className="form-control shadow-md w-full"
                          value={sequenceNo}
                          onChange={(e) => {
                            const value = e.target.value;

                            // Allow only digits
                            if (/^\d*$/.test(value)) {
                              setSequenceNo(value);
                            }
                          }}
                          maxLength={4}
                        />

                       
                        {loadingSequence ? (
                          <span className="text-sm text-blue-500 mt-1">
                            Loading sequence...
                          </span>
                        ) : (
                          <span className="text-sm text-blue-500 mt-1">
                            Last sequence no:{" "}
                            <span className="font-semibold">
                              {lastSequence}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <label className="sm:w-40">Description </label>
                      <input
                        type="text"
                        className="form-control shadow-md flex-1"
                        value={description}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^.*$/.test(value)) {
                            setDescription(value);
                          }
                        }}
                        maxLength={100}
                      />
                    </div>
                  </div>

                  
                  <div className="w-full md:w-1/2 md:border-l md:pl-4">
                    <h6 className="font-semibold mb-2 text-blue-700">
                      Parameter List for{" "}
                      {selectedGroupId === null || selectedGroupId === ""
                        ? "Basic Information"
                        : groupName.find((g) => g.id == selectedGroupId)
                            ?.group_name || "Basic Information"}
                    </h6>

                    {isLoadingParameters ? (
                      <div className="flex justify-center items-center h-40">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : parameterGroup.length > 0 ? (
                      <div className="max-h-52 overflow-y-auto">
                        <table className="table table-bordered text-sm w-full">
                          <thead>
                            <tr>
                              <th className="text-center">Parameter Name</th>
                              <th className="text-center">Sequence</th>
                            </tr>
                          </thead>
                          <tbody>
                            {parameterGroup.map((item) => (
                              <tr key={item.id}>
                                <td className="text-center">
                                  {item.parameter_name}
                                </td>
                                <td className="text-center">{item.sequence}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        No parameters available
                      </p>
                    )}
                  </div>
                </div>
              </div>

            
              <div className="flex flex-col sm:flex-row justify-end gap-2 p-4 border-t">
                <button
                  type="button"
                  className="btn btn-primary px-4"
                  onClick={handleSubmitEdit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          </div>
        )} */}

        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-2">
            <div className="w-full max-w-5xl bg-white rounded-lg shadow-lg overflow-hidden">
              {/* HEADER */}
              <div className="flex justify-between items-center p-2 border-b">
                <h5 className="text-lg font-semibold">
                  Edit Health & Activity Parameter
                </h5>

                <RxCross1
                  className="text-xl text-red-600 cursor-pointer hover:bg-red-100 rounded"
                  onClick={handleCloseModal}
                />
              </div>

              <div className="h-1 bg-pink-700 w-[98%] mx-auto"></div>

              {/* BODY */}
              <div className="p-4 overflow-y-auto max-h-[80vh]">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* LEFT SIDE */}
                  <div className="w-full md:w-1/2 space-y-4">
                    {/* GROUP */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <label className="sm:w-40">Group Name</label>

                      <div className="flex-1">
                        <Select
                          options={groupOptions()}
                          value={
                            groupOptions().find(
                              (opt) => opt.value === selectedGroupId,
                            ) || null
                          }
                          onChange={(selectedOption) => {
                            if (!selectedOption) {
                              setSelectedGroupId(null);
                              setSelectedGroup("");
                              return;
                            }

                            setSelectedGroupId(selectedOption.value);
                            setSelectedGroup(selectedOption.label);

                            // reset sub selections
                            setSelectedSubGroup(null);
                            setSelectedChild(null);
                          }}
                          placeholder="Select Group"
                          className="shadow-md"
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          styles={{
                            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                          }}
                          isClearable
                        />
                      </div>
                    </div>

                    {/* SUB GROUP */}
                    {subGroups?.length > 0 && (
                      <>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-4">
                          <label className="sm:w-40">Sub Group</label>

                          <div className="flex-1">
                            <Select
                              options={subGroupOptions()}
                              value={
                                selectedSubGroup
                                  ? {
                                      value: selectedSubGroup.key,
                                      label: selectedSubGroup.label,
                                    }
                                  : null
                              }
                              onChange={(selectedOption) => {
                                if (!selectedOption) {
                                  setSelectedSubGroup(null);
                                  setSelectedChild(null);
                                  return;
                                }

                                const selected = subGroups.find(
                                  (g) => g.key === selectedOption.value,
                                );

                                setSelectedSubGroup(selected);
                                setSelectedChild(null);
                              }}
                              placeholder="Select Sub Group"
                              className="shadow-md"
                              menuPortalTarget={document.body}
                              menuPosition="fixed"
                              styles={{
                                menuPortal: (base) => ({
                                  ...base,
                                  zIndex: 9999,
                                }),
                              }}
                              isClearable
                            />
                          </div>
                        </div>

                        {/* SUB SUB GROUP */}
                        {selectedSubGroup?.children?.length > 0 && (
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-4">
                            <label className="sm:w-40">Sub Sub Group</label>

                            <div className="flex-1">
                              <Select
                                options={selectedSubGroup.children.map(
                                  (child) => ({
                                    value: child.key,
                                    label: child.label,
                                  }),
                                )}
                                value={
                                  selectedChild
                                    ? {
                                        value: selectedChild.key,
                                        label: selectedChild.label,
                                      }
                                    : null
                                }
                                onChange={(selectedOption) => {
                                  if (!selectedOption) {
                                    setSelectedChild(null);
                                    return;
                                  }

                                  const selectedChildObj =
                                    selectedSubGroup.children.find(
                                      (c) => c.key === selectedOption.value,
                                    );

                                  setSelectedChild(selectedChildObj);
                                }}
                                placeholder="Select Sub Sub Group"
                                className="shadow-md"
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={{
                                  menuPortal: (base) => ({
                                    ...base,
                                    zIndex: 9999,
                                  }),
                                }}
                                isClearable
                              />
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* PARAMETER */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <label className="sm:w-40">
                        Parameter Name <span className="text-red-500">*</span>
                      </label>

                      <input
                        type="text"
                        className="form-control shadow-md flex-1"
                        value={parameterName}
                        onChange={(e) => setParameterName(e.target.value)}
                        maxLength={30}
                      />
                    </div>

                    {/* SEQUENCE */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <label className="sm:w-40 pt-2">
                        Sequence No. <span className="text-red-500">*</span>
                      </label>

                      <div className="flex-1 flex flex-col">
                        <input
                          type="text"
                          className="form-control shadow-md w-full"
                          value={sequenceNo}
                          onChange={(e) => {
                            if (/^\d*$/.test(e.target.value)) {
                              setSequenceNo(e.target.value);
                            }
                          }}
                        />

                        <span className="text-sm text-blue-500 mt-1">
                          Last sequence no:{" "}
                          <span className="font-semibold">{lastSequence}</span>
                        </span>
                      </div>
                    </div>

                    {/* DESCRIPTION */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <label className="sm:w-40">Description</label>

                      <input
                        type="text"
                        className="form-control shadow-md flex-1"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        maxLength={100}
                      />
                    </div>
                  </div>

                  {/* RIGHT SIDE */}
                  <div className="w-full md:w-1/2 md:border-l md:pl-4">
                    <h6 className="font-semibold mb-2 text-blue-700">
                      Parameter List for{" "}
                      {selectedGroup ||
                        groupName.find((g) => g.id === selectedGroupId)
                          ?.group_name ||
                        "Basic Information"}
                    </h6>

                    {isLoadingParameters ? (
                      <div className="flex justify-center items-center h-40">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : parameterGroup.length > 0 ? (
                      <div className="max-h-52 overflow-y-auto">
                        <table className="table table-bordered text-sm w-full">
                          <thead>
                            <tr>
                              <th className="text-center">Parameter Name</th>
                              <th className="text-center">Sequence</th>
                            </tr>
                          </thead>
                          <tbody>
                            {parameterGroup.map((item) => (
                              <tr key={item.id}>
                                <td className="text-center">
                                  {item.parameter_name}
                                </td>
                                <td className="text-center">{item.sequence}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        No parameters available
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="flex justify-end gap-2 p-4 border-t">
                <button
                  type="button"
                  className="btn btn-primary px-4"
                  onClick={handleSubmitEdit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Update"}
                </button>
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
                    Are you sure you want to delete health and activity
                    parameter {currentSection.parameter_name} ?
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
}

export default HealthActivityParameter;


