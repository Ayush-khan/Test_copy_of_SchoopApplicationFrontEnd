import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { dashboardLayoutCrudService } from "./dashboardLayoutCrudService";

const createWidgetWithId = (widgetId) => ({
  dashboard_widget_id: Number(widgetId) || 0,
  widget_key: "",
  widget_name: "",
  widget_type: "Card",
  layout: { x: 0, y: 0, w: 2, h: 2 },
});

const createSectionWithWidgetId = (index = 0, widgetId = 0) => ({
  section_id: 0,
  section_name: `Section ${index + 1}`,
  section_order: index + 1,
  widgets: [createWidgetWithId(widgetId)],
});

const createLayoutWithWidgetId = (widgetId = 0) => ({
  status: true,
  dashboard: {
    dashboard_id: 0,
    name: "",
    role: "",
  },
  sections: [createSectionWithWidgetId(0, widgetId)],
});

const DashboardLayoutEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isCreate = !id || id === "new";

  const [form, setForm] = useState(createLayoutWithWidgetId(0));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [nextWidgetId, setNextWidgetId] = useState(1);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const suggestedWidgetId = await dashboardLayoutCrudService.getNextWidgetId();
      setNextWidgetId(suggestedWidgetId);

      if (isCreate) {
        setForm(createLayoutWithWidgetId(suggestedWidgetId));
        setNextWidgetId((prev) => prev + 1);
        setLoading(false);
        return;
      }

      const found = await dashboardLayoutCrudService.getById(id);
      if (!found) {
        setError("Dashboard layout not found.");
      } else {
        setForm(found);
      }
      setLoading(false);
    };
    load();
  }, [id, isCreate]);

  const widgetCount = useMemo(
    () =>
      (form?.sections || []).reduce(
        (sum, section) => sum + (section?.widgets?.length || 0),
        0,
      ),
    [form],
  );

  const setDashboard = (key, value) => {
    setForm((prev) => ({
      ...prev,
      dashboard: {
        ...prev.dashboard,
        [key]: value,
      },
    }));
  };

  const updateSection = (sectionIndex, key, value) => {
    setForm((prev) => {
      const nextSections = [...prev.sections];
      nextSections[sectionIndex] = {
        ...nextSections[sectionIndex],
        [key]: value,
      };
      return { ...prev, sections: nextSections };
    });
  };

  const addSection = () => {
    const allocatedWidgetId = nextWidgetId;
    setNextWidgetId((prev) => prev + 1);
    setForm((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        createSectionWithWidgetId(prev.sections.length, allocatedWidgetId),
      ],
    }));
  };

  const removeSection = (sectionIndex) => {
    setForm((prev) => {
      const nextSections = prev.sections.filter((_, idx) => idx !== sectionIndex);
      const fallbackSection = createSectionWithWidgetId(0, nextWidgetId);
      return {
        ...prev,
        sections: nextSections.length ? nextSections : [fallbackSection],
      };
    });
    setNextWidgetId((prev) => prev + 1);
  };

  const addWidget = (sectionIndex) => {
    const allocatedWidgetId = nextWidgetId;
    setNextWidgetId((prev) => prev + 1);
    setForm((prev) => {
      const nextSections = [...prev.sections];
      nextSections[sectionIndex] = {
        ...nextSections[sectionIndex],
        widgets: [
          ...(nextSections[sectionIndex].widgets || []),
          createWidgetWithId(allocatedWidgetId),
        ],
      };
      return { ...prev, sections: nextSections };
    });
  };

  const assignNextWidgetId = (sectionIndex, widgetIndex) => {
    const allocatedWidgetId = nextWidgetId;
    setNextWidgetId((prev) => prev + 1);
    updateWidget(sectionIndex, widgetIndex, "dashboard_widget_id", allocatedWidgetId);
  };

  const removeWidget = (sectionIndex, widgetIndex) => {
    setForm((prev) => {
      const nextSections = [...prev.sections];
      const existing = nextSections[sectionIndex].widgets || [];
      const nextWidgets = existing.filter((_, idx) => idx !== widgetIndex);
      nextSections[sectionIndex] = {
        ...nextSections[sectionIndex],
        widgets: nextWidgets.length ? nextWidgets : [createWidgetWithId(nextWidgetId)],
      };
      return { ...prev, sections: nextSections };
    });
    setNextWidgetId((prev) => prev + 1);
  };

  const updateWidget = (sectionIndex, widgetIndex, key, value) => {
    setForm((prev) => {
      const nextSections = [...prev.sections];
      const nextWidgets = [...(nextSections[sectionIndex].widgets || [])];
      nextWidgets[widgetIndex] = {
        ...nextWidgets[widgetIndex],
        [key]: value,
      };
      nextSections[sectionIndex] = {
        ...nextSections[sectionIndex],
        widgets: nextWidgets,
      };
      return { ...prev, sections: nextSections };
    });
  };

  const updateLayoutField = (sectionIndex, widgetIndex, key, value) => {
    const numeric = Number(value);
    updateWidget(sectionIndex, widgetIndex, "layout", {
      ...(form.sections?.[sectionIndex]?.widgets?.[widgetIndex]?.layout || {}),
      [key]: Number.isFinite(numeric) ? numeric : 0,
    });
  };

  const validate = () => {
    if (!form?.dashboard?.name?.trim()) return "Dashboard name is required.";
    if (!form?.dashboard?.role?.trim()) return "Dashboard role is required.";
    if (!form?.sections?.length) return "At least one section is required.";

    const widgetIds = new Set();
    for (const section of form.sections) {
      if (!section?.section_name?.trim()) return "Each section must have a name.";
      if (!section?.widgets?.length) return "Each section must have at least one widget.";
      for (const widget of section.widgets) {
        if (!widget?.widget_key?.trim()) return "Each widget must have widget_key.";
        if (!widget?.widget_name?.trim()) return "Each widget must have widget_name.";
        if (!widget?.widget_type?.trim()) return "Each widget must have widget_type.";
        const widgetId = Number(widget?.dashboard_widget_id || 0);
        if (!widgetId) return "Each widget must have a valid dashboard_widget_id.";
        if (widgetIds.has(widgetId)) return "dashboard_widget_id must be unique.";
        widgetIds.add(widgetId);
      }
    }
    return "";
  };

  const onSave = async () => {
    const validationMessage = validate();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }
    setError("");
    setSaving(true);
    if (isCreate) {
      const created = await dashboardLayoutCrudService.create(form);
      setSaving(false);
      navigate(`/dashboard-layout-crud/${created.dashboard.dashboard_id}`);
      return;
    }
    await dashboardLayoutCrudService.update(id, form);
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="card mx-auto lg:w-[96%] shadow-lg">
          <div className="card-body">
          Loading dashboard layout...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="w-full md:w-[96%] mx-auto">
        <div className="card mx-auto lg:w-full shadow-lg">
          <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
          <div>
                <h3 className="text-gray-700 text-[1.2em] lg:text-xl whitespace-nowrap m-0">
              {isCreate ? "Create Dashboard Layout" : "Edit Dashboard Layout"}
                </h3>
                <p className="m-0 text-xs text-gray-600">
              Sections: {form.sections.length} | Widgets: {widgetCount}
            </p>
          </div>
            <div className="flex gap-2">
            <button
              type="button"
                className="btn btn-outline-secondary btn-sm"
              onClick={() => navigate("/dashboard-layout-crud")}
            >
              Back
            </button>
            <button
              type="button"
                className="btn btn-primary btn-sm"
              onClick={onSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
            </div>
          </div>
          <div
            className="relative w-[97%] mb-3 h-1 mx-auto bg-red-700"
            style={{ backgroundColor: "#C03078" }}
          />
          </div>
        </div>

      <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-3 w-full md:w-[96%] mx-auto">
        <div className="lg:col-span-2">
          {error ? <div className="alert alert-danger py-2 mb-3">{error}</div> : null}

          <div className="card shadow-lg">
            <div className="card-body">
            <h2 className="mb-3 text-base font-semibold">Dashboard Info</h2>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Dashboard Name</label>
                <input
                  className="form-control"
                  value={form.dashboard.name}
                  onChange={(e) => setDashboard("name", e.target.value)}
                  placeholder="Admin Dashboard"
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Role</label>
                <input
                  className="form-control"
                  value={form.dashboard.role}
                  onChange={(e) => setDashboard("role", e.target.value.toUpperCase())}
                  placeholder="A / M / T"
                />
              </div>
              {!isCreate ? (
                <div className="col-md-3">
                  <label className="form-label">Dashboard ID</label>
                  <input className="form-control" value={form.dashboard.dashboard_id || ""} readOnly />
                </div>
              ) : null}
            </div>
          </div>
          </div>

          {(form.sections || []).map((section, sectionIndex) => (
            <div
              key={`section-${section.section_id}-${sectionIndex}`}
              className="card mt-3 shadow-lg"
            >
              <div className="card-body">
              <div className="mb-3 flex items-center justify-between border-bottom pb-2">
                <h3 className="m-0 text-sm font-semibold text-slate-700">
                  Section {sectionIndex + 1}
                </h3>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => removeSection(sectionIndex)}
                >
                  Remove Section
                </button>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-7">
                  <label className="form-label">Section Name</label>
                  <input
                    className="form-control"
                    value={section.section_name || ""}
                    onChange={(e) =>
                      updateSection(sectionIndex, "section_name", e.target.value)
                    }
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Section Order</label>
                  <input
                    type="number"
                    className="form-control"
                    value={section.section_order || 1}
                    onChange={(e) =>
                      updateSection(sectionIndex, "section_order", Number(e.target.value))
                    }
                  />
                </div>
              </div>

              {(section.widgets || []).map((widget, widgetIndex) => (
                <div
                  key={`widget-${widget.dashboard_widget_id}-${widgetIndex}`}
                  className="mb-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <strong className="small">
                      Widget {widgetIndex + 1}{" "}
                      <span className="badge bg-light text-dark border">
                        ID: {widget.dashboard_widget_id || "-"}
                      </span>
                    </strong>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => removeWidget(sectionIndex, widgetIndex)}
                    >
                      Remove Widget
                    </button>
                  </div>

                  <div className="row g-2">
                    <div className="col-md-3">
                      <label className="form-label">Widget ID</label>
                      <div className="d-flex gap-2">
                        <input
                          type="number"
                          className="form-control"
                          value={widget.dashboard_widget_id || 0}
                          onChange={(e) =>
                            updateWidget(
                              sectionIndex,
                              widgetIndex,
                              "dashboard_widget_id",
                              Number(e.target.value),
                            )
                          }
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => assignNextWidgetId(sectionIndex, widgetIndex)}
                          title="Assign next auto id"
                        >
                          Auto
                        </button>
                      </div>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Widget Key</label>
                      <input
                        className="form-control"
                        value={widget.widget_key || ""}
                        onChange={(e) =>
                          updateWidget(sectionIndex, widgetIndex, "widget_key", e.target.value)
                        }
                        placeholder="students"
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Widget Name</label>
                      <input
                        className="form-control"
                        value={widget.widget_name || ""}
                        onChange={(e) =>
                          updateWidget(sectionIndex, widgetIndex, "widget_name", e.target.value)
                        }
                        placeholder="Students"
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Widget Type</label>
                      <select
                        className="form-select"
                        value={widget.widget_type || "Card"}
                        onChange={(e) =>
                          updateWidget(sectionIndex, widgetIndex, "widget_type", e.target.value)
                        }
                      >
                        <option value="Card">Card</option>
                        <option value="Chart">Chart</option>
                        <option value="Table">Table</option>
                        <option value="List">List</option>
                      </select>
                    </div>
                  </div>

                  <div className="row g-2 mt-1">
                    <div className="col-6 col-md-3">
                      <label className="form-label">x</label>
                      <input
                        type="number"
                        className="form-control"
                        value={widget.layout?.x ?? 0}
                        onChange={(e) =>
                          updateLayoutField(sectionIndex, widgetIndex, "x", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-6 col-md-3">
                      <label className="form-label">y</label>
                      <input
                        type="number"
                        className="form-control"
                        value={widget.layout?.y ?? 0}
                        onChange={(e) =>
                          updateLayoutField(sectionIndex, widgetIndex, "y", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-6 col-md-3">
                      <label className="form-label">w</label>
                      <input
                        type="number"
                        className="form-control"
                        value={widget.layout?.w ?? 1}
                        onChange={(e) =>
                          updateLayoutField(sectionIndex, widgetIndex, "w", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-6 col-md-3">
                      <label className="form-label">h</label>
                      <input
                        type="number"
                        className="form-control"
                        value={widget.layout?.h ?? 1}
                        onChange={(e) =>
                          updateLayoutField(sectionIndex, widgetIndex, "h", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={() => addWidget(sectionIndex)}
              >
                + Add Widget
              </button>
              </div>
            </div>
          ))}

          <button type="button" className="btn btn-outline-primary mt-3" onClick={addSection}>
            + Add Section
          </button>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-4 card shadow-lg">
            <div className="card-body">
            <h2 className="mb-2 text-base font-semibold">JSON Preview</h2>
            <pre className="mb-0 max-h-[70vh] overflow-auto rounded bg-gray-50 p-2 text-xs border">
              {JSON.stringify(form, null, 2)}
            </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayoutEditor;
