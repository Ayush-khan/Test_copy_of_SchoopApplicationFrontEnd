import { useEffect, useMemo, useRef, useState } from "react";
import ReactPaginate from "react-paginate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import { RxCross1 } from "react-icons/rx";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import api from "../Dashbord/api";
import Select from "react-select";

const getWidgetId = (widget) =>
  widget?.widget_id ?? widget?.id ?? widget?.dashboard_widget_id ?? "";

const normalizeList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.widgets)) return payload.widgets;
  return [];
};

const WidgetsCrud = () => {
  const [widgets, setWidgets] = useState([]);
  const [widgetTypes, setWidgetTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentWidget, setCurrentWidget] = useState(null);
  const [formData, setFormData] = useState({
    widget_name: "",
    widget_key: "",
    widget_type_id: "",
    widget_type: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pageSize = 10;
  const prevSearchTermRef = useRef("");

  const fetchWidgets = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/widgets", { withCredentials: true });
      const list = normalizeList(res.data);
      setWidgets(list);
      setPageCount(Math.ceil(list.length / pageSize));
    } catch (error) {
      console.error("Error fetching widgets:", error);
      setErrors({ fetch: error.message });
    } finally {
      setLoading(false);
    }
  };

  const fetchWidgetTypes = async () => {
    try {
      const res = await api.get("/api/get_widgetstype", { withCredentials: true });
      const list = Array.isArray(res?.data?.data) ? res.data.data : [];
      setWidgetTypes(list);
    } catch (error) {
      console.error("Error fetching widget types:", error);
    }
  };

  useEffect(() => {
    fetchWidgets();
    fetchWidgetTypes();
  }, []);

  useEffect(() => {
    const searchLower = searchTerm.trim().toLowerCase();
    if (prevSearchTermRef.current !== searchLower) {
      setCurrentPage(0);
      prevSearchTermRef.current = searchLower;
    }
  }, [searchTerm]);

  const handleAdd = () => {
    setFormData({ widget_name: "", widget_key: "", widget_type_id: "", widget_type: "" });
    setErrors({});
    setShowAddModal(true);
  };

  const handleEdit = (widget) => {
    setCurrentWidget(widget);
    const typeId =
      widget?.widget_type_id ??
      widget?.type_id ??
      widget?.widget_type ??
      widget?.type ??
      "";
    setFormData({
      widget_name: widget?.widget_name ?? widget?.name ?? "",
      widget_key: widget?.widget_key ?? widget?.key ?? "",
      widget_type_id: typeId,
      widget_type: typeId,
    });
    setErrors({});
    setShowEditModal(true);
  };

  const handleDelete = (widget) => {
    setCurrentWidget(widget);
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setCurrentWidget(null);
    setErrors({});
  };

  const validate = () => {
    const nextErrors = {};
    if (!formData.widget_name?.trim()) nextErrors.widget_name = "This field is required";
    if (!formData.widget_key?.trim()) nextErrors.widget_key = "This field is required";
    if (!formData.widget_type) nextErrors.widget_type = "Widget type is required";
    return nextErrors;
  };

  const handleSubmitAdd = async () => {
    if (isSubmitting) return;
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(
        "/widget/add",
        {
          widget_key: formData.widget_key,
          widget_name: formData.widget_name,
          widget_type: formData.widget_type,
        },
        { withCredentials: true },
      );
      await fetchWidgets();
      handleCloseModal();
      toast.success("Widget added successfully!");
    } catch (error) {
      console.error("Error adding widget:", error);
      setErrors({ add: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (isSubmitting) return;
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const widgetId = getWidgetId(currentWidget);
      await api.put(
        "/widget/update",
        {
          widget_key: formData.widget_key,
          widget_name: formData.widget_name,
          widget_type: formData.widget_type,
          widget_id: widgetId,
        },
        { withCredentials: true },
      );
      await fetchWidgets();
      handleCloseModal();
      toast.success("Widget updated successfully!");
    } catch (error) {
      console.error("Error updating widget:", error);
      setErrors({ edit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitDelete = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const widgetId = getWidgetId(currentWidget);
      if (!widgetId) throw new Error("Widget ID is missing");
      await api.delete(`/widget/delete/${widgetId}`, { withCredentials: true });
      await fetchWidgets();
      handleCloseModal();
      toast.success("Widget deleted successfully!");
    } catch (error) {
      console.error("Error deleting widget:", error);
      const backendMessage = error?.response?.data?.message;
      toast.error(backendMessage || "Error deleting widget.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const searchLower = searchTerm.trim().toLowerCase();
  const filteredWidgets = widgets.filter((widget) => {
    const name = String(widget?.widget_name ?? widget?.name ?? "").toLowerCase();
    const key = String(widget?.widget_key ?? widget?.key ?? "").toLowerCase();
    const type = String(widget?.widget_type ?? widget?.type ?? widget?.widget_type_id ?? "").toLowerCase();
    return name.includes(searchLower) || key.includes(searchLower) || type.includes(searchLower);
  });

  const widgetTypeOptions = widgetTypes.map((type) => ({
    value: type.widget_type_id ?? type.id ?? type.value,
    label: type.widget_name ?? type.name ?? type.label,
  }));

  useEffect(() => {
    setPageCount(Math.ceil(filteredWidgets.length / pageSize));
  }, [filteredWidgets]);

  const displayedWidgets = filteredWidgets.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize,
  );

  return (
    <>
      <ToastContainer />
      <div className="container md:mt-4">
        <div className="card mx-auto lg:w-[90%] shadow-lg">
          <div className="card-header flex justify-between items-center">
            <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
              Widgets
            </h3>

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
          <div
            className=" relative w-[97%]  -top-0.5 mb-3 h-1  mx-auto bg-red-700"
            style={{ backgroundColor: "#C03078" }}
          ></div>

          <div className="card-body w-full">
            <div className="h-96 lg:h-96 overflow-y-scroll lg:overflow-x-hidden">
              <div className="bg-white rounded-lg shadow-xs">
                <table className="min-w-full leading-normal table-auto">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="w-full md:w-[8%] px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Sr.No
                      </th>
                      <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Name
                      </th>
                      <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Url
                      </th>
                      <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Type
                      </th>
                      <th className="w-full md:w-[10%] px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Edit
                      </th>
                      <th className="w-full md:w-[10%] px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Delete
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4 text-blue-700">
                          Please wait while data is loading...
                        </td>
                      </tr>
                    ) : displayedWidgets.length ? (
                      displayedWidgets.map((widget, index) => (
                        <tr
                          key={getWidgetId(widget) || index}
                          className={`${index % 2 === 0 ? "bg-white" : "bg-gray-100"
                            } hover:bg-gray-50`}
                        >
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {currentPage * pageSize + index + 1}
                            </p>
                          </td>
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {widget?.widget_name ?? widget?.name ?? "-"}
                            </p>
                          </td>
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {widget?.widget_key ?? widget?.key ?? "-"}
                            </p>
                          </td>
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <p className="text-gray-900 whitespace-no-wrap relative top-2">
                              {widget?.widget_type ?? widget?.type ?? widget?.widget_type_id ?? "-"}
                            </p>
                          </td>
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <button
                              className="text-blue-600 hover:text-blue-800 hover:bg-transparent"
                              onClick={() => handleEdit(widget)}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                          </td>
                          <td className="text-center px-2 lg:px-3 border border-gray-950 text-sm">
                            <button
                              className="text-red-600 hover:text-red-800 hover:bg-transparent"
                              onClick={() => handleDelete(widget)}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-4 text-gray-600">
                          No widgets found. Click Add to view.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* <div className="mt-3">
              <ReactPaginate
                previousLabel={"Previous"}
                nextLabel={"Next"}
                breakLabel={"..."}
                pageCount={pageCount}
                marginPagesDisplayed={1}
                pageRangeDisplayed={1}
                onPageChange={(data) => setCurrentPage(data.selected)}
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
            </div> */}
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
                onPageChange={(data) => setCurrentPage(data.selected)}
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

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal show" style={{ display: "block" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="flex justify-between px-3 py-2">
                  <h5 className="modal-title">Add New Widget</h5>
                  <RxCross1
                    className="float-end relative top-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                    type="button"
                    onClick={handleCloseModal}
                  />
                </div>
                <div
                  className="relative mb-3 h-1 w-[97%] mx-auto bg-red-700"
                  style={{ backgroundColor: "#C03078" }}
                ></div>
                <div className="modal-body w-full md:w-[85%] mx-auto">
                  <div className="relative mb-3 flex justify-center mx-2">
                    <label htmlFor="widgetName" className="w-1/2 mt-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={255}
                      className="form-control shadow-md mb-2"
                      id="widgetName"
                      value={formData.widget_name}
                      onChange={(e) => {
                        setFormData({ ...formData, widget_name: e.target.value });
                        setErrors((prev) => ({ ...prev, widget_name: "" }));
                      }}
                    />
                    <div className="absolute top-9 left-1/3">
                      {errors.widget_name && (
                        <span className="text-danger text-xs">
                          {errors.widget_name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="relative mb-3 flex justify-center mx-2">
                    <label htmlFor="widgetKey" className="w-1/2 mt-2">
                      Url <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={255}
                      className="form-control shadow-md mb-2"
                      id="widgetKey"
                      value={formData.widget_key}
                      onChange={(e) => {
                        setFormData({ ...formData, widget_key: e.target.value });
                        setErrors((prev) => ({ ...prev, widget_key: "" }));
                      }}
                    />
                    <div className="absolute top-9 left-1/3">
                      {errors.widget_key && (
                        <span className="text-danger text-xs">
                          {errors.widget_key}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="relative mb-3 flex justify-center mx-2">
                    <label htmlFor="widgetType" className="w-1/2 mt-2">
                      Widget Type <span className="text-red-500">*</span>
                    </label>
                    <div className="w-full">
                      <Select
                        inputId="widgetType"
                        className="shadow-md mb-2"
                        value={widgetTypeOptions.find(
                          (option) => String(option.value) === String(formData.widget_type)
                        )}
                        onChange={(selectedOption) => {
                          const nextValue = selectedOption ? selectedOption.value : "";
                          setFormData((prev) => ({
                            ...prev,
                            widget_type: nextValue,
                            widget_type_id: nextValue,
                          }));
                          setErrors((prev) => ({ ...prev, widget_type: "" }));
                        }}
                        options={widgetTypeOptions}
                        placeholder="Select widget type"
                        styles={{
                          control: (provided) => ({
                            ...provided,
                            minHeight: "32px",
                            fontSize: "0.85rem",
                          }),
                        }}
                      />
                    </div>
                    <div className="absolute top-9 left-1/3">
                      {errors.widget_type && (
                        <span className="text-danger text-xs">
                          {errors.widget_type}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end p-3">
                  <button
                    type="button"
                    className="btn btn-primary mb-2"
                    onClick={handleSubmitAdd}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Adding..." : "Add"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal show" style={{ display: "block" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="flex justify-between px-3 py-2">
                  <h5 className="modal-title">Edit Widget</h5>
                  <RxCross1
                    className="float-end relative top-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                    type="button"
                    onClick={handleCloseModal}
                  />
                </div>
                <div
                  className="relative mb-3 h-1 w-[97%] mx-auto bg-red-700"
                  style={{ backgroundColor: "#C03078" }}
                ></div>
                <div className="modal-body w-full md:w-[85%] mx-auto">
                  <div className="relative mb-3 flex justify-center mx-2">
                    <label htmlFor="editWidgetName" className="w-1/2 mt-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={255}
                      className="form-control shadow-md mb-2"
                      id="editWidgetName"
                      value={formData.widget_name}
                      onChange={(e) => {
                        setFormData({ ...formData, widget_name: e.target.value });
                        setErrors((prev) => ({ ...prev, widget_name: "" }));
                      }}
                    />
                    <div className="absolute top-9 left-1/3">
                      {errors.widget_name && (
                        <span className="text-danger text-xs">
                          {errors.widget_name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="relative mb-3 flex justify-center mx-2">
                    <label htmlFor="editWidgetKey" className="w-1/2 mt-2">
                      Url <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={255}
                      className="form-control shadow-md mb-2"
                      id="editWidgetKey"
                      value={formData.widget_key}
                      onChange={(e) => {
                        setFormData({ ...formData, widget_key: e.target.value });
                        setErrors((prev) => ({ ...prev, widget_key: "" }));
                      }}
                    />
                    <div className="absolute top-9 left-1/3">
                      {errors.widget_key && (
                        <span className="text-danger text-xs">
                          {errors.widget_key}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="relative mb-3 flex justify-center mx-2">
                    <label htmlFor="editWidgetType" className="w-1/2 mt-2">
                      Widget Type <span className="text-red-500">*</span>
                    </label>
                    <div className="w-full">
                      <Select
                        inputId="editWidgetType"
                        className="shadow-md mb-2"
                        value={widgetTypeOptions.find(
                          (option) => String(option.value) === String(formData.widget_type)
                        )}
                        onChange={(selectedOption) => {
                          const nextValue = selectedOption ? selectedOption.value : "";
                          setFormData((prev) => ({
                            ...prev,
                            widget_type: nextValue,
                            widget_type_id: nextValue,
                          }));
                          setErrors((prev) => ({ ...prev, widget_type: "" }));
                        }}
                        options={widgetTypeOptions}
                        placeholder="Select widget type"
                        styles={{
                          control: (provided) => ({
                            ...provided,
                            minHeight: "32px",
                            fontSize: "0.85rem",
                          }),
                        }}
                      />
                    </div>
                    <div className="absolute top-9 left-1/3">
                      {errors.widget_type && (
                        <span className="text-danger text-xs">
                          {errors.widget_type}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end p-3">
                  <button
                    type="button"
                    className="btn btn-primary mb-2"
                    onClick={handleSubmitEdit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Updating..." : "Update"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal show" style={{ display: "block" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="flex justify-between px-3 py-2">
                  <h5 className="modal-title">Delete Widget</h5>
                  <RxCross1
                    className="float-end relative top-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                    type="button"
                    onClick={handleCloseModal}
                  />
                </div>
                <div
                  className="relative mb-3 h-1 w-[97%] mx-auto bg-red-700"
                  style={{ backgroundColor: "#C03078" }}
                ></div>
                <div className="modal-body">
                  Are you sure you want to delete this widget?
                </div>
                <div className="flex justify-end p-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary me-2"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleSubmitDelete}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WidgetsCrud;
