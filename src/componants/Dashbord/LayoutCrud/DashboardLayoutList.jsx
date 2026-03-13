import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { dashboardLayoutCrudService } from "./dashboardLayoutCrudService";

const DashboardLayoutList = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await dashboardLayoutCrudService.list();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id) => {
    const ok = window.confirm("Delete this dashboard layout?");
    if (!ok) return;
    await dashboardLayoutCrudService.remove(id);
    await load();
  };

  const onReset = async () => {
    const ok = window.confirm("Clear local overrides and reload API data?");
    if (!ok) return;
    await dashboardLayoutCrudService.resetSeed();
    await load();
  };

  return (
    <div className="p-4 md:p-6">
      <div className="w-full md:w-[96%] mx-auto">
        <div className="card mx-auto lg:w-full shadow-lg">
          <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
            <div>
              <h3 className="text-gray-700 text-[1.2em] lg:text-xl whitespace-nowrap m-0">
                Dashboard Layout Configuration
              </h3>
              <p className="text-xs text-gray-600 m-0">
                API structure with local override CRUD
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={onReset}
              >
                Clear Overrides
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => navigate("/dashboard-layout-crud/new")}
              >
                + Create Dashboard
              </button>
            </div>
          </div>
          <div
            className="relative w-[97%] mb-3 h-1 mx-auto bg-red-700"
            style={{ backgroundColor: "#C03078" }}
          />
        </div>

        <div className="card mt-3 shadow-lg">
          <div className="card-body w-full">
            {loading ? (
              <div className="text-center text-blue-600 py-4">
                Please wait while data is loading...
              </div>
            ) : (
              <>
                <div className="mb-2 text-sm text-gray-700">
                  Total dashboards: <strong>{items.length}</strong>
                </div>
                <div
                  className="overflow-y-auto overflow-x-auto"
                  style={{
                    maxHeight: "560px",
                    scrollbarWidth: "thin",
                    scrollbarColor: "#C03178 transparent",
                  }}
                >
                  <table className="min-w-full w-[900px] leading-normal table-auto">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-3 py-2 text-center border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          ID
                        </th>
                        <th className="px-3 py-2 text-center border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          Dashboard Name
                        </th>
                        <th className="px-3 py-2 text-center border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          Role
                        </th>
                        <th className="px-3 py-2 text-center border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          Sections
                        </th>
                        <th className="px-3 py-2 text-center border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          Widgets
                        </th>
                        <th className="px-3 py-2 text-center border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          Edit
                        </th>
                        <th className="px-3 py-2 text-center border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                          Delete
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => {
                        const sections = item?.sections || [];
                        const widgets = sections.reduce(
                          (sum, section) => sum + (section?.widgets?.length || 0),
                          0,
                        );
                        return (
                          <tr key={item?.dashboard?.dashboard_id}>
                            <td className="px-3 py-2 text-center border border-gray-300">
                              {item?.dashboard?.dashboard_id}
                            </td>
                            <td className="px-3 py-2 text-center border border-gray-300">
                              {item?.dashboard?.name || "-"}
                            </td>
                            <td className="px-3 py-2 text-center border border-gray-300">
                              {item?.dashboard?.role || "-"}
                            </td>
                            <td className="px-3 py-2 text-center border border-gray-300">
                              {sections.length}
                            </td>
                            <td className="px-3 py-2 text-center border border-gray-300">
                              {widgets}
                            </td>
                            <td className="px-3 py-2 text-center border border-gray-300">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={() =>
                                  navigate(
                                    `/dashboard-layout-crud/${item?.dashboard?.dashboard_id}`,
                                  )
                                }
                                title="Edit"
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                            </td>
                            <td className="px-3 py-2 text-center border border-gray-300">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => onDelete(item?.dashboard?.dashboard_id)}
                                title="Delete"
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {!items.length && (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-3 py-4 text-center border border-gray-300 text-gray-500"
                          >
                            No layouts found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayoutList;
