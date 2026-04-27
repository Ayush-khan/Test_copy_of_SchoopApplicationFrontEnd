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

function HealthActivityGroup() {
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

  const [lastSequence, setLastSequence] = useState(0);

  const [isEditMode, setIsEditMode] = useState(false);

  const [selectedKeys, setSelectedKeys] = useState([]);

  const [subGroups, setSubGroups] = useState([
    {
      id: Date.now(),
      name: "",
      children: [], // must be ARRAY (multiple allowed)
    },
  ]);

  const toggleSelection = (key) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");

  const [selectedSubGroup, setSelectedSubGroup] = useState(null);

  const pageSize = 10;

  useEffect(() => {
    fetchSections();
    // fetchDataRoleId();
    fetchGroup();
  }, []);

  useEffect(() => {
    if (selectedGroupId !== undefined) {
      fetchParameterGroup(selectedGroupId);
    }
  }, [selectedGroupId]);

  useEffect(() => {
    if (!isEditMode && lastSequence !== null && lastSequence !== undefined) {
      setSequenceNo(lastSequence + 1);
    }
  }, [lastSequence, isEditMode]);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      const response = await axios.get(
        `${API_URL}/api/health_activity_groups`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = response.data.data || [];
      setSections(data);
      setPageCount(Math.ceil(data.length / pageSize));
    } catch (error) {
      setError(error.message || "Error fetching data");
      toast.error(error.message || "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

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
        `${API_URL}/api/get_health_activity_group_parameter_list/${selectedGroupId}`,
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

  const addSubGroup = () => {
    setSubGroups((prev) => [
      ...prev,
      { id: Date.now(), name: "", children: [] },
    ]);
  };

  const addChild = (parentId) => {
    setSubGroups((prev) =>
      prev.map((group) =>
        group.id === parentId
          ? {
              ...group,
              children: [
                ...group.children,
                { id: Date.now(), name: "" }, // add new each time
              ],
            }
          : group,
      ),
    );
  };

  const handleSubGroupChange = (id, value) => {
    setSubGroups((prev) =>
      prev.map((group) =>
        group.id === id ? { ...group, name: value } : group,
      ),
    );
  };

  const handleChildChange = (parentId, childId, value) => {
    setSubGroups((prev) =>
      prev.map((group) =>
        group.id === parentId
          ? {
              ...group,
              children: group.children.map((child) =>
                child.id === childId ? { ...child, name: value } : child,
              ),
            }
          : group,
      ),
    );
  };

  const removeSubGroup = (id) => {
    setSubGroups((prev) => prev.filter((g) => g.id !== id));
  };

  const removeChild = (parentId, childId) => {
    setSubGroups((prev) =>
      prev.map((group) =>
        group.id === parentId
          ? {
              ...group,
              children: group.children.filter((child) => child.id !== childId),
            }
          : group,
      ),
    );
  };

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
    setSelectedKeys([]);
  };

  const generateKey = (text) => {
    return (
      text.toLowerCase().replace(/\s+/g, "_").replace(/[^\w]/g, "") +
      "_" +
      Date.now()
    );
  };

  const formatToColumnsConfig = (groups) => {
    return groups.map((group) => ({
      key: generateKey(group.name),
      label: group.name,
      children: group.children?.length
        ? formatToColumnsConfig(group.children)
        : [],
    }));
  };

  const handleSubmitAdd = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!selectedGroupId) {
      toast.error("Please select Group");
      setIsSubmitting(false);
      return;
    }

    // 🔴 Validation
    const isInvalid = subGroups.some(
      (group) =>
        !group.name.trim() ||
        group.children.some((child) => !child.name.trim()),
    );

    if (isInvalid) {
      toast.error("All fields are required");
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      // ✅ Convert to required structure
      const columns_config = formatToColumnsConfig(subGroups);

      const payload = {
        group_id: selectedGroupId,
        columns_config,
      };

      const response = await axios.post(
        `${API_URL}/api/create_health_activity_group/columns_config`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        },
      );

      toast.success("Sub group saved successfully!");

      //  Reset
      setSubGroups([{ id: Date.now(), name: "", children: [] }]);

      fetchParameterGroup(selectedGroupId);
      handleCloseModal();
    } catch (error) {
      console.error("Error:", error);

      if (error.response?.status === 409) {
        toast.error("Duplicate entry exists.");
      } else {
        toast.error("Server error. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const convertToSubGroups = (columns) => {
    return columns.map((item) => ({
      id: Date.now() + Math.random(),
      name: item.label,
      children: item.children ? convertToSubGroups(item.children) : [],
    }));
  };

  // const handleEdit = (leave) => {
  //   setIsEditMode(true);
  //   setCurrentSection(leave);

  //   console.log(leave.group_name);
  //   console.log(leave.id);

  //   setSelectedGroupId(leave.id?.toString());
  //   setSelectedGroup(leave.group_name);

  //   // IMPORTANT: Prefill nested structure
  //   if (leave.columns_config) {
  //     const formatted = convertToSubGroups(leave.columns_config);
  //     setSubGroups(formatted);
  //   } else {
  //     setSubGroups([{ id: Date.now(), name: "", children: [] }]);
  //   }

  //   setShowEditModal(true);
  // };

  const handleEdit = (leave) => {
    setIsEditMode(true);
    setCurrentSection(leave);

    console.log("Edit Data:", leave);

    // FIX 1: use correct group_id
    setSelectedGroupId(leave.id?.toString() || "");
    setSelectedGroup(leave.group_name || "");

    // FIX 2: safe handling for columns_config
    if (
      leave.columns_config &&
      Array.isArray(leave.columns_config) &&
      leave.columns_config.length > 0
    ) {
      const formatted = convertToSubGroups(leave.columns_config);
      setSubGroups(formatted);
    } else {
      //  fallback like Add screen
      setSubGroups([
        {
          id: Date.now(),
          name: "",
          children: [],
        },
      ]);
    }

    setShowEditModal(true);
  };
  const handleSubmitEdit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!selectedGroupId) {
      toast.error("Please select Group");
      setIsSubmitting(false);
      return;
    }

    // Recursive Validation
    const validateTree = (nodes) => {
      for (let node of nodes) {
        if (!node.name.trim()) return false;
        if (node.children?.length) {
          if (!validateTree(node.children)) return false;
        }
      }
      return true;
    };

    if (!validateTree(subGroups)) {
      toast.error("All fields are required");
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      // Convert UI → API format
      const columns_config = formatToColumnsConfig(subGroups);

      const payload = {
        group_id: selectedGroupId, // optional if API needs
        columns_config,
      };

      const response = await axios.put(
        `${API_URL}/api/update_health_activity_group/${currentSection.id}/columns_config `,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        },
      );

      toast.success("Sub Group updated successfully!");

      //  Reset
      setSubGroups([{ id: Date.now(), name: "", children: [] }]);

      fetchSections();
      fetchParameterGroup(selectedGroupId);
      handleCloseModal();
    } catch (error) {
      console.error("Error updating:", error);

      if (error.response?.status === 409) {
        toast.error("Duplicate entry exists.");
      } else {
        toast.error("Server error. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // const handleDelete = (node, groupId) => {
  //   setCurrentSection({
  //     key: node.key,
  //     group_id: groupId,
  //   });

  //   setShowDeleteModal(true);
  // };

  // const handleSubmitDelete = async () => {
  //   if (isSubmitting) return;
  //   setIsSubmitting(true);

  //   try {
  //     const token = localStorage.getItem("authToken");

  //     if (!token || !currentSection) {
  //       throw new Error("Sub group data missing");
  //     }

  //     const response = await axios.post(
  //       `${API_URL}/api/delete_sub_group`,
  //       {
  //         group_id: currentSection.group_id,
  //         key: currentSection.key,
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //         withCredentials: true,
  //       },
  //     );

  //     if (response.status === 200) {
  //       toast.success("Sub Group deleted successfully!");

  //       setShowDeleteModal(false);
  //       setCurrentSection(null);

  //       fetchSections();
  //       fetchParameterGroup(selectedGroupId);
  //       fetchLastSequenceNo(selectedGroupId);
  //     } else {
  //       toast.error(response.data.message || "Failed to delete");
  //     }
  //   } catch (error) {
  //     console.error("Error deleting:", error);

  //     if (error.response?.status === 400) {
  //       // backend validation (USED case)
  //       toast.error(error.response.data.message);
  //     } else {
  //       toast.error(
  //         error.response?.data?.message ||
  //           "Server error. Please try again later.",
  //       );
  //     }
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const handleDelete = (group) => {
    setCurrentSection({
      group_id: group.id,
      group_name: group.group_name,
      subGroups: group.columns_config || [],
    });

    setSelectedSubGroup(null); // important
    setShowDeleteModal(true);
  };

  const handleSubmitDelete = async () => {
    // if (isSubmitting || !selectedSubGroup) return;
    if (isSubmitting || !selectedKeys.length === 0) return;
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.post(
        `${API_URL}/api/delete_sub_group`,
        {
          group_id: currentSection.group_id,
          // key: selectedSubGroup.key,
          keys: selectedKeys,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        },
      );

      toast.success("Sub Group deleted successfully!");

      setShowDeleteModal(false);
      setSelectedSubGroup(null);
      setCurrentSection(null);

      fetchSections();
      fetchParameterGroup(selectedGroupId);
    } catch (error) {
      console.error(error);

      if (error.response?.status === 400) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Server error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  const reset = () => {
    setGroupName([]);
    setSelectedGroupId(null);
    setSelectedGroup(null);
    setSequenceNo("");
    setParameterName("");
  };

  // with sub sub groups
  // const formatSubGroups = (nodes, level = 0) => {
  //   let result = [];

  //   nodes.forEach((node) => {
  //     result.push({
  //       label: node.label,
  //       level,
  //     });

  //     if (node.children && node.children.length > 0) {
  //       result = result.concat(formatSubGroups(node.children, level + 1));
  //     }
  //   });

  //   return result;
  // };

  const formatSubGroups = (nodes = []) => {
    return nodes.map((node) => ({
      label: node.label,
    }));
  };

  const getLabelByKey = (key, groups) => {
    for (let group of groups) {
      if (group.key === key) return group.label;

      if (group.children && group.children.length > 0) {
        const found = group.children.find((c) => c.key === key);
        if (found) return found.label;
      }
    }
    return key; // fallback
  };
  return (
    <>
      <ToastContainer />

      <div className="container  mt-4">
        <div className="card mx-auto lg:w-[70%] shadow-lg">
          <div className="p-2 px-3 bg-gray-100 flex justify-between items-center">
            <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
              Health & Activity Sub Group
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
              <div className="bg-white rounded-lg shadow-xs">
                <table className="min-w-full table-auto border-collapse">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="px-3 py-2 text-center border border-gray-950 text-sm font-semibold">
                        Sr. No
                      </th>

                      <th className="px-3 py-2 text-center border border-gray-950 text-sm font-semibold">
                        Group Name
                      </th>

                      <th className="px-3 py-2 text-center border border-gray-950 text-sm font-semibold">
                        Sub Groups
                      </th>

                      <th className="px-3 py-2 text-center border border-gray-950 text-sm font-semibold">
                        Edit
                      </th>

                      <th className="px-3 py-2 text-center border border-gray-950 text-sm font-semibold">
                        Delete
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="text-center text-blue-700 text-xl py-10"
                        >
                          Please wait while data is loading...
                        </td>
                      </tr>
                    ) : sections.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="text-center py-6 text-blue-700 text-lg"
                        >
                          Please create health & activity sub group to view.
                        </td>
                      </tr>
                    ) : displayedSections.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="text-center py-6 text-red-700 text-lg"
                        >
                          Result not found!
                        </td>
                      </tr>
                    ) : (
                      displayedSections.map((leave, index) => (
                        <tr key={leave.id} className=" hover:bg-gray-50">
                          {/* Sr No */}
                          <td className="text-center border border-gray-950 text-sm py-2">
                            {currentPage * pageSize + index + 1}
                          </td>

                          {/* Group Name */}
                          <td className="text-center border border-gray-950 text-sm py-2 ">
                            {leave.group_name}
                          </td>

                          <td className="text-center border border-gray-950 text-sm py-2 ">
                            {leave.columns_config &&
                            leave.columns_config.length > 0 ? (
                              formatSubGroups(leave.columns_config).map(
                                (item, i, arr) => (
                                  <div
                                    key={i}
                                    className={`text-gray-700 py-1 ${
                                      i !== arr.length - 1
                                        ? "border-b border-gray-200"
                                        : ""
                                    }`}
                                    style={{
                                      paddingLeft: `${item.level * 20}px`,
                                    }}
                                  >
                                    {item.level > 0 && (
                                      <span className="text-gray-400 mr-1">
                                        ↳
                                      </span>
                                    )}

                                    {item.label}
                                  </div>
                                ),
                              )
                            ) : (
                              <span className="text-gray-400 text-xs"></span>
                            )}
                          </td>

                          {/* Edit */}
                          <td className="text-center border border-gray-950 text-sm py-2">
                            <button
                              className="text-blue-600 hover:text-blue-800"
                              onClick={() => handleEdit(leave)}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                          </td>

                          {/* Delete */}
                          <td className="text-center border border-gray-950 text-sm py-2">
                            <button
                              className="text-red-600 hover:text-red-800"
                              // onClick={() => handleDelete(leave.id)}
                              onClick={() => handleDelete(leave)}
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
            <div className="w-full max-w-xl bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="flex justify-between items-center p-2 border-b">
                <h5 className="text-lg font-semibold">
                  Create Health & Activity Sub Group
                </h5>

                <RxCross1
                  className="text-xl text-red-600 cursor-pointer hover:bg-red-100 rounded"
                  onClick={handleCloseModal}
                />
              </div>

              <div className="h-1 bg-pink-700 w-[98%] mx-auto"></div>

              <div className="p-4 overflow-y-auto max-h-[80vh]">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full  space-y-4">
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

                    <div className="mt-4">
                      <label className="block mb-2">Sub Group Name</label>

                      {subGroups.map((group, index) => (
                        <div key={group.id} className="mb-3">
                          {/* Parent Row */}
                          <div className="flex gap-2 items-center">
                            <input
                              type="text"
                              className="form-control"
                              placeholder={`Sub Group ${index + 1}`}
                              value={group.name}
                              onChange={(e) =>
                                handleSubGroupChange(group.id, e.target.value)
                              }
                            />

                            {/* Add Child */}
                            <button
                              className="btn btn-info px-2"
                              onClick={() => addChild(group.id)}
                              title="Add Sub-Sub Group"
                            >
                              ⤵
                            </button>

                            {/* Add Main */}
                            {index === subGroups.length - 1 && (
                              <button
                                className="btn btn-success px-2"
                                onClick={addSubGroup}
                              >
                                +
                              </button>
                            )}

                            {/* Remove */}
                            {subGroups.length > 1 && (
                              <button
                                className="btn btn-danger px-2"
                                onClick={() => removeSubGroup(group.id)}
                              >
                                -
                              </button>
                            )}
                          </div>

                          {/* 👇 CHILDREN (Nested UI) */}
                          <div className="ml-8 mt-2">
                            {group.children.map((child, cIndex) => (
                              <div
                                key={child.id}
                                className="flex gap-2 mb-2 items-center"
                              >
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder={`Sub Sub Group ${cIndex + 1}`}
                                  value={child.name}
                                  onChange={(e) =>
                                    handleChildChange(
                                      group.id,
                                      child.id,
                                      e.target.value,
                                    )
                                  }
                                />

                                {/* ➕ Add MORE sub-sub groups */}
                                {cIndex === group.children.length - 1 && (
                                  <button
                                    className="btn btn-success px-2"
                                    onClick={() => addChild(group.id)}
                                  >
                                    +
                                  </button>
                                )}

                                {/* ❌ Remove */}
                                <button
                                  className="btn btn-danger px-2"
                                  onClick={() =>
                                    removeChild(group.id, child.id)
                                  }
                                >
                                  -
                                </button>
                              </div>
                            ))}

                            {/* If no child yet, show first add button */}
                            {/* {group.children.length === 0 && (
                              <button
                                className="btn btn-info mt-2"
                                onClick={() => addChild(group.id)}
                              >
                                Add Sub-Sub Group
                              </button>
                            )} */}
                          </div>
                        </div>
                      ))}
                    </div>
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

        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-2">
            <div className="w-full max-w-xl bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Header */}
              <div className="flex justify-between items-center p-2 border-b">
                <h5 className="text-lg font-semibold">
                  Edit Health & Activity Sub Group
                </h5>

                <RxCross1
                  className="text-xl text-red-600 cursor-pointer hover:bg-red-100 rounded"
                  onClick={handleCloseModal}
                />
              </div>

              <div className="h-1 bg-pink-700 w-[98%] mx-auto"></div>

              {/* Body */}
              <div className="p-4 overflow-y-auto max-h-[80vh]">
                {/* Group Select */}
                <div className="flex flex-col md:flex-row gap-6 mb-4">
                  <div className="w-full space-y-4">
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
                          placeholder="Select Group"
                          className="shadow-md"
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          styles={{
                            menuPortal: (base) => ({
                              ...base,
                              zIndex: 9999,
                            }),
                          }}
                        />
                      </div>
                    </div>
                    {/* NESTED SUB GROUP UI */}
                    <div className="mt-4">
                      <label className="block mb-2 font-medium">
                        Sub Group Name
                      </label>

                      {subGroups.map((group, index) => (
                        <div key={group.id} className="mb-3 ">
                          {/* Parent Row */}
                          <div className="flex gap-2 items-center">
                            <input
                              type="text"
                              className="form-control shadow-md"
                              placeholder={`Sub Group ${index + 1}`}
                              value={group.name}
                              onChange={(e) =>
                                handleSubGroupChange(group.id, e.target.value)
                              }
                            />

                            {/* Add Child */}
                            <button
                              className="btn btn-info px-2"
                              onClick={() => addChild(group.id)}
                              title="Add Sub-Sub Group"
                            >
                              ⤵
                            </button>

                            {/* Add Sub Group */}
                            {index === subGroups.length - 1 && (
                              <button
                                className="btn btn-success px-2"
                                onClick={addSubGroup}
                              >
                                +
                              </button>
                            )}

                            {/* Remove Sub Group */}
                            {subGroups.length > 1 && (
                              <button
                                className="btn btn-danger px-2"
                                onClick={() => removeSubGroup(group.id)}
                              >
                                -
                              </button>
                            )}
                          </div>

                          {/* CHILDREN */}
                          <div className="ml-8 mt-2">
                            {group.children.map((child, cIndex) => (
                              <div
                                key={child.id}
                                className="flex gap-2 mb-2 items-center"
                              >
                                <input
                                  type="text"
                                  className="form-control shadow-md"
                                  placeholder={`Sub Sub Group ${cIndex + 1}`}
                                  value={child.name}
                                  onChange={(e) =>
                                    handleChildChange(
                                      group.id,
                                      child.id,
                                      e.target.value,
                                    )
                                  }
                                />

                                {/* Add more child */}
                                {cIndex === group.children.length - 1 && (
                                  <button
                                    className="btn btn-success px-2"
                                    onClick={() => addChild(group.id)}
                                  >
                                    +
                                  </button>
                                )}

                                {/* Remove child */}
                                <button
                                  className="btn btn-danger px-2"
                                  onClick={() =>
                                    removeChild(group.id, child.id)
                                  }
                                >
                                  -
                                </button>
                              </div>
                            ))}

                            {/* If no child */}
                            {/* {group.children.length === 0 && (
                              <button
                                className="btn btn-outline-primary mt-2"
                                onClick={() => addChild(group.id)}
                              >
                                Add Sub-Sub Group
                              </button>
                            )} */}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
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

        {/* {showDeleteModal && (
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
        )} */}

        {showDeleteModal && (
          <div
            className="modal"
            style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                {/* HEADER */}
                <div className="flex justify-between p-3">
                  <h5 className="modal-title">Delete Sub Group</h5>
                  <RxCross1
                    className="text-xl text-red-600 cursor-pointer"
                    onClick={handleCloseModal}
                  />
                </div>

                <div className="h-1 w-[97%] mx-auto bg-pink-700"></div>

                {/* BODY */}
                <div className="modal-body p-3">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="font-semibold text-pink-700">
                      Group Name :-
                    </span>
                    <span className="font-semibold text-blue-700">
                      {currentSection?.group_name}
                    </span>
                  </div>
                  {/* {currentSection?.subGroups?.length > 0 ? (
                    currentSection.subGroups.map((sub, i) => (
                      <div
                        key={i}
                        className={`p-2 border mb-2 cursor-pointer rounded 
                  ${selectedSubGroup?.key === sub.key ? "bg-red-100 border-red-400" : "hover:bg-gray-100"}
                `}
                        onClick={() => setSelectedSubGroup(sub)}
                      >
                        {sub.label}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No Sub Groups Available</p>
                  )} */}
                  {currentSection?.subGroups?.length > 0 ? (
                    currentSection.subGroups.map((sub, i) => (
                      <div key={i} className="mb-2">
                        {/* 🔴 SUB GROUP */}
                        <div
                          className={`p-2 border cursor-pointer rounded flex justify-between items-center
        ${
          selectedKeys.includes(sub.key)
            ? "bg-red-100 border-red-400"
            : "hover:bg-gray-100"
        }`}
                          onClick={() => toggleSelection(sub.key)}
                        >
                          <strong>{sub.label}</strong>

                          <input
                            type="checkbox"
                            checked={selectedKeys.includes(sub.key)}
                            readOnly
                          />
                        </div>

                        {/* 🟢 SUB SUB GROUP */}
                        {sub.children && sub.children.length > 0 && (
                          <div className="ml-4 mt-1">
                            {sub.children.map((child, j) => (
                              <div
                                key={j}
                                className={`p-2 border rounded mb-1 text-sm flex justify-between items-center
              ${
                selectedKeys.includes(child.key)
                  ? "bg-red-50 border-red-300"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
                                onClick={() => toggleSelection(child.key)}
                              >
                                <span>↳ {child.label}</span>

                                <input
                                  type="checkbox"
                                  checked={selectedKeys.includes(child.key)}
                                  readOnly
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No Sub Groups Available</p>
                  )}

                  {selectedKeys.length > 0 && (
                    <div className="mt-3 text-sm text-red-600">
                      Selected:
                      <ul className="list-disc ml-5">
                        {/* {selectedKeys.map((key, i) => (
                          <li key={i}>{key}</li>
                        ))} */}

                        {selectedKeys.map((key, i) => (
                          <li key={i}>
                            {getLabelByKey(
                              key,
                              currentSection?.subGroups || [],
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* FOOTER */}
                <div className="flex justify-end p-3">
                  <button
                    className="btn btn-danger"
                    onClick={handleSubmitDelete}
                    // disabled={!selectedSubGroup || isSubmitting}
                    disabled={selectedKeys.length === 0 || isSubmitting}
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

export default HealthActivityGroup;
