import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Responsive, useContainerWidth } from "react-grid-layout";
import { dashboardLayoutCrudService } from "./dashboardLayoutCrudService";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const PREVIEW_COLS = { lg: 12, md: 8, sm: 4, xs: 2, xxs: 1 };
const PREVIEW_BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const PREVIEW_ROW_HEIGHT = 42;
const PREVIEW_MARGIN = [10, 10];
const PREVIEW_DRAG_HANDLE = ".preview-drag-handle";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const createWidgetWithId = (widgetId, clientKey) => ({
  dashboard_widget_id: Number(widgetId) || 0,
  __clientKey: clientKey,
  widget_key: "",
  widget_name: "",
  widget_type: "Card",
  layout: { x: 0, y: 0, w: 2, h: 2 },
});

const createSectionWithWidgetId = (index = 0, widgetId = 0, overrides = {}, clientKey) => ({
  section_id: 0,
  section_name: overrides.section_name || `Section ${index + 1}`,
  section_order:
    Number(overrides.section_order) > 0 ? Number(overrides.section_order) : index + 1,
  widgets: [createWidgetWithId(widgetId, clientKey)],
});

const createLayoutWithWidgetId = (widgetId = 0, clientKey) => ({
  status: true,
  dashboard: {
    dashboard_id: 0,
    name: "",
    role: "",
  },
  sections: [createSectionWithWidgetId(0, widgetId, {}, clientKey)],
});

const toSectionLayouts = (widgets = []) => {
  const lg = widgets.map((widget, index) => {
    const base = widget?.layout || {};
    const i = String(
      widget?.__clientKey ||
      widget?.dashboard_widget_id ||
      `${widget?.widget_key}-${index}`,
    );
    return {
      i,
      x: clamp(Number(base?.x || 0), 0, PREVIEW_COLS.lg - 1),
      y: Math.max(0, Number(base?.y || 0)),
      w: clamp(Number(base?.w || 2), 1, PREVIEW_COLS.lg),
      h: clamp(Number(base?.h || 2), 1, 24),
    };
  });

  const md = widgets.map((widget, index) => {
    const base = widget?.layout || {};
    const i = String(
      widget?.__clientKey ||
      widget?.dashboard_widget_id ||
      `${widget?.widget_key}-${index}`,
    );
    return {
      i,
      x: clamp(Number(base?.x || 0), 0, PREVIEW_COLS.md - 1),
      y: Math.max(0, Number(base?.y || 0)),
      w: clamp(Math.min(Number(base?.w || 2), PREVIEW_COLS.md), 1, PREVIEW_COLS.md),
      h: clamp(Number(base?.h || 2), 1, 24),
    };
  });

  const sm = widgets.map((widget, index) => {
    const base = widget?.layout || {};
    const i = String(
      widget?.__clientKey ||
      widget?.dashboard_widget_id ||
      `${widget?.widget_key}-${index}`,
    );
    return {
      i,
      x: clamp(Number(base?.x || 0), 0, PREVIEW_COLS.sm - 1),
      y: Math.max(0, Number(base?.y || 0)),
      w: clamp(Math.min(Number(base?.w || 2), PREVIEW_COLS.sm), 1, PREVIEW_COLS.sm),
      h: clamp(Number(base?.h || 2), 1, 24),
    };
  });

  return { lg, md, sm, xs: sm, xxs: sm };
};

const widgetPreviewShellClasses = (widgetType) => {
  const type = String(widgetType || "").toLowerCase();
  if (type === "chart") return "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200";
  if (type === "table") return "bg-gradient-to-br from-cyan-50 to-sky-50 border-cyan-200";
  if (type === "list") return "bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-200";
  return "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200";
};

const SectionLayoutPreview = ({ section, onCommitLayout, onRemoveWidget }) => {
  const widgets = section?.widgets || [];
  const { width, containerRef, mounted } = useContainerWidth({
    measureBeforeMount: false,
    initialWidth: 1100,
  });

  const layouts = useMemo(() => toSectionLayouts(widgets), [widgets]);

  const commit = (layout) => {
    if (!Array.isArray(layout)) return;
    onCommitLayout(layout);
  };

  return (
    <div ref={containerRef}>
      {mounted ? (
        <Responsive
          className="layout"
          width={width}
          layouts={layouts}
          breakpoints={PREVIEW_BREAKPOINTS}
          cols={PREVIEW_COLS}
          rowHeight={PREVIEW_ROW_HEIGHT}
          margin={PREVIEW_MARGIN}
          containerPadding={[0, 0]}
          isDraggable={true}
          isResizable={true}
          draggableHandle={PREVIEW_DRAG_HANDLE}
          compactType={null}
          preventCollision={true}
          onDragStop={(layout) => commit(layout)}
          onResizeStop={(layout) => commit(layout)}
        >
          {widgets.map((widget, index) => {
            const key = String(
              widget?.__clientKey ||
              widget?.dashboard_widget_id ||
              `${widget?.widget_key || "widget"}-${index}`,
            );
            return (
              <div key={key} className="h-full">
                <div
                  className={`h-full rounded-lg border p-2 text-xs shadow-sm transition-all ${widgetPreviewShellClasses(
                    widget?.widget_type,
                  )}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-semibold text-gray-800 truncate">
                      {widget?.widget_name || "Untitled Widget"}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="border-0 bg-white rounded px-1.5 py-[1px] text-[10px] text-red-600 hover:bg-red-50"
                        title="Remove widget"
                        onClick={() => onRemoveWidget?.(widget)}
                      >
                        ×
                      </button>
                      <button
                        type="button"
                        className="preview-drag-handle border-0 bg-white rounded px-2 py-[2px] text-[10px] text-gray-600"
                        title="Drag to move"
                      >
                        Drag
                      </button>
                    </div>
                  </div>
                  <div className="text-[11px] text-gray-600 truncate mb-1">
                    key: {widget?.widget_key || "-"}
                  </div>
                  <div className="inline-block text-[10px] px-2 py-[2px] rounded bg-white text-gray-700 mb-1">
                    {widget?.widget_type || "-"}
                  </div>
                  <div className="text-[11px] text-gray-700">
                    ({widget?.layout?.x ?? 0},{widget?.layout?.y ?? 0}) w:
                    {widget?.layout?.w ?? 0} h:{widget?.layout?.h ?? 0}
                  </div>
                </div>
              </div>
            );
          })}
        </Responsive>
      ) : (
        <div className="h-24 rounded bg-gray-100 animate-pulse" />
      )}
    </div>
  );
};

const DashboardLayoutPreviewPanel = ({ sections, onCommitLayout, onRemoveWidget }) => {
  const orderedSections = (sections || [])
    .map((section, originalIndex) => ({ section, originalIndex }))
    .sort(
      (a, b) =>
        Number(a?.section?.section_order || 0) - Number(b?.section?.section_order || 0),
    );

  return (
    <div className="card shadow-lg mt-3 border-0">
      <div className="card-body">
        <div className="rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 px-3 py-2 mb-3">
          <h2 className="text-base font-semibold mb-1">Dashboard Preview Mode</h2>
          <p className="text-sm text-gray-700 mb-2">
            Widget card ke top-right me <strong>Drag</strong> se move karein, corner se resize karein, then Save.
          </p>
          <div className="flex flex-wrap gap-2 text-[11px]">
            <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800">Card</span>
            <span className="px-2 py-1 rounded bg-amber-100 text-amber-800">Chart</span>
            <span className="px-2 py-1 rounded bg-cyan-100 text-cyan-800">Table</span>
            <span className="px-2 py-1 rounded bg-indigo-100 text-indigo-800">List</span>
          </div>
        </div>
        <div className="space-y-4">
          {orderedSections.map(({ section, originalIndex }, sectionIndex) => (
            <div
              key={section?.section_id || sectionIndex}
              className="rounded-xl p-3 bg-white border border-gray-200 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-gray-700">
                  {section?.section_name || `Section ${sectionIndex + 1}`}
                </div>
                <span className="text-[11px] px-2 py-[2px] rounded bg-gray-100 text-gray-600">
                  Widgets: {(section?.widgets || []).length}
                </span>
              </div>
              <SectionLayoutPreview
                section={section}
                onCommitLayout={(layout) => onCommitLayout(originalIndex, layout)}
                onRemoveWidget={(widget) => onRemoveWidget(originalIndex, widget)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const DashboardLayoutEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isCreate = !id || id === "new";

  const [form, setForm] = useState(createLayoutWithWidgetId(0));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [nextWidgetId, setNextWidgetId] = useState(1);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showFloatingSave, setShowFloatingSave] = useState(false);
  const clientKeyRef = useRef(0);
  const [sectionDraft, setSectionDraft] = useState({
    section_name: "Section",
    section_order: 1,
  });

  const makeClientKey = () => {
    clientKeyRef.current += 1;
    return `ck_${Date.now()}_${clientKeyRef.current}`;
  };

  const ensureClientKeys = (layout) => {
    const next = { ...layout };
    next.sections = (layout?.sections || []).map((section) => ({
      ...section,
      widgets: (section?.widgets || []).map((widget) => ({
        ...widget,
        __clientKey: widget?.__clientKey || makeClientKey(),
      })),
    }));
    return next;
  };

  const logSavedLayout = (mode, payload) => {
    const endpoint = "/save_dashboardwidgets";
    const method = "POST";
    const postmanFormat = {
      method,
      url: `{{baseUrl}}${endpoint}`,
      headers: {
        Authorization: "Bearer {{token}}",
        "Content-Type": "application/json",
      },
      body: payload,
    };

    console.groupCollapsed(
      `[Dashboard Layout CRUD] ${mode} saved: ${payload?.dashboard?.name || "Unnamed Dashboard"}`,
    );
    console.log("Saved payload:", payload);
    console.log("Dashboard ID:", payload?.dashboard?.dashboard_id);
    console.log("Role:", payload?.dashboard?.role);
    console.log("Sections:", payload?.sections?.length || 0);
    console.log(
      "Total Widgets:",
      (payload?.sections || []).reduce(
        (sum, section) => sum + (section?.widgets?.length || 0),
        0,
      ),
    );
    console.log("Postman Request:", postmanFormat);
    console.log(
      "Postman Raw Body (JSON):\n",
      JSON.stringify(payload, null, 2),
    );
    console.groupEnd();
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const suggestedWidgetId = await dashboardLayoutCrudService.getNextWidgetId();
      setNextWidgetId(suggestedWidgetId);

      if (isCreate) {
        setForm(createLayoutWithWidgetId(suggestedWidgetId, makeClientKey()));
        setSectionDraft({ section_name: `Section ${1}`, section_order: 1 });
        setNextWidgetId((prev) => prev + 1);
        setLoading(false);
        return;
      }

      const found = await dashboardLayoutCrudService.getById(id);
      if (!found) {
        setError("Dashboard layout not found.");
      } else {
        setForm(ensureClientKeys(found));
        const nextOrder =
          Math.max(
            ...((found.sections || []).map((section) => Number(section?.section_order || 0))),
            0,
          ) + 1;
        setSectionDraft({ section_name: `Section ${nextOrder}`, section_order: nextOrder });
      }
      setLoading(false);
    };
    load();
  }, [id, isCreate]);

  useEffect(() => {
    const onScroll = () => {
      setShowFloatingSave(window.scrollY > 220);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const widgetCount = useMemo(
    () =>
      (form?.sections || []).reduce(
        (sum, section) => sum + (section?.widgets?.length || 0),
        0,
      ),
    [form],
  );

  const nextSectionOrder = useMemo(() => {
    if (!Array.isArray(form?.sections) || !form.sections.length) return 1;
    return (
      Math.max(
        ...form.sections.map((section) => Number(section?.section_order || 0)),
        0,
      ) + 1
    );
  }, [form?.sections]);

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

  const addSection = (options = {}) => {
    const allocatedWidgetId = nextWidgetId;
    setNextWidgetId((prev) => prev + 1);
    setForm((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        createSectionWithWidgetId(
          prev.sections.length,
          allocatedWidgetId,
          options,
          makeClientKey(),
        ),
      ],
    }));
    setSectionDraft((prev) => ({
      section_name: `Section ${Number(options?.section_order || prev.section_order || 1) + 1}`,
      section_order: Number(options?.section_order || prev.section_order || 1) + 1,
    }));
  };

  const removeSection = (sectionIndex) => {
    setForm((prev) => {
      const nextSections = prev.sections.filter((_, idx) => idx !== sectionIndex);
      const fallbackSection = createSectionWithWidgetId(0, nextWidgetId, {}, makeClientKey());
      return {
        ...prev,
        sections: nextSections.length ? nextSections : [fallbackSection],
      };
    });
    setNextWidgetId((prev) => prev + 1);
  };

  const handleCreateSectionFromDraft = () => {
    const name = String(sectionDraft?.section_name || "").trim();
    const order = Number(sectionDraft?.section_order || 0);

    if (!name) {
      setError("Section name is required before adding a section.");
      return;
    }
    if (!order || order < 1) {
      setError("Section order must be a number greater than 0.");
      return;
    }

    setError("");
    addSection({ section_name: name, section_order: order });
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
          createWidgetWithId(allocatedWidgetId, makeClientKey()),
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
        widgets: nextWidgets.length
          ? nextWidgets
          : [createWidgetWithId(nextWidgetId, makeClientKey())],
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

  const applySectionLayout = (sectionIndex, layoutItems) => {
    setForm((prev) => {
      const nextSections = [...prev.sections];
      const section = nextSections[sectionIndex];
      if (!section) return prev;

      const layoutMap = new Map(
        (layoutItems || []).map((item) => [String(item.i), item]),
      );

      const nextWidgets = (section.widgets || []).map((widget, widgetIndex) => {
        const key = String(
          widget?.__clientKey ||
          widget?.dashboard_widget_id ||
          `${widget?.widget_key || "widget"}-${widgetIndex}`,
        );
        const nextItem = layoutMap.get(key);
        if (!nextItem) return widget;
        return {
          ...widget,
          layout: {
            ...(widget?.layout || {}),
            x: Number(nextItem.x || 0),
            y: Number(nextItem.y || 0),
            w: Number(nextItem.w || 1),
            h: Number(nextItem.h || 1),
          },
        };
      });

      nextSections[sectionIndex] = { ...section, widgets: nextWidgets };
      return { ...prev, sections: nextSections };
    });
  };

  const removeWidgetFromPreview = (sectionIndex, widget) => {
    const keyToRemove =
      widget?.__clientKey || widget?.dashboard_widget_id || widget?.widget_key;
    if (!keyToRemove) return;

    setForm((prev) => {
      const nextSections = [...prev.sections];
      const section = nextSections[sectionIndex];
      if (!section) return prev;

      const nextWidgets = (section.widgets || []).filter((item) => {
        const key =
          item?.__clientKey || item?.dashboard_widget_id || item?.widget_key;
        return key !== keyToRemove;
      });

      nextSections[sectionIndex] = {
        ...section,
        widgets: nextWidgets.length ? nextWidgets : [],
      };
      return { ...prev, sections: nextSections };
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
    console.log("Save Request Payload (client):", form);
    setSaving(true);
    if (isCreate) {
      const created = await dashboardLayoutCrudService.create(form);
      logSavedLayout("Create", created);
      setSaving(false);
      navigate(`/dashboard-layout-crud/${created.dashboard.dashboard_id}`);
      return;
    }
    const updated = await dashboardLayoutCrudService.update(id, form);
    logSavedLayout("Update", updated);
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
        <div className="w-full mx-auto">
          <div className="card mx-auto lg:w-full shadow-lg border-0 transition-all duration-300 ease-out hover:shadow-xl backdrop-blur-sm">
            <div className="p-2 px-3 bg-gradient-to-r from-slate-100 to-blue-50 border-none flex flex-col md:flex-row md:justify-between md:items-center gap-2 rounded-t">
              <div>
                <h3 className="text-[1.2em] lg:text-[1.35rem] whitespace-nowrap m-0 font-bold bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent">
                  {isCreate ? "Create Dashboard Layout" : "Edit Dashboard Layout"}
                </h3>
                <div className="m-0 text-xs text-gray-700 mt-1 flex flex-wrap gap-2">
                  <span className="px-2 py-[2px] rounded bg-white border border-gray-200">
                    Sections: {form.sections.length}
                  </span>
                  <span className="px-2 py-[2px] rounded bg-white border border-gray-200">
                    Widgets: {widgetCount}
                  </span>
                  <span className="px-2 py-[2px] rounded bg-white border border-gray-200">
                    Mode: {isPreviewMode ? "Preview" : "Editor"}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={`btn btn-sm transition-all duration-200 ${isPreviewMode ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setIsPreviewMode((prev) => !prev)}
                >
                  {isPreviewMode ? "Back To Form" : "Preview Layout"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => navigate("/dashboard-layout-crud")}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm transition-all duration-200"
                  onClick={onSave}
                  disabled={saving}
                >
                  {saving ? (
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="inline-block h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin"
                      />
                      Saving...
                    </span>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </div>
            <div
              className="relative w-[97%] mb-3 h-1 mx-auto bg-red-700"
              style={{ backgroundColor: "#C03078" }}
            />
          </div>
        </div>
      </div>

      {isPreviewMode ? (
        <div className="w-full md:w-[96%] mx-auto overflow-y-auto">
          {error ? <div className="alert alert-danger py-2 mb-3">{error}</div> : null}

          <div className="animate-[fadeIn_.28s_ease-out]">
            <DashboardLayoutPreviewPanel
              sections={form.sections || []}
              onCommitLayout={applySectionLayout}
              onRemoveWidget={removeWidgetFromPreview}
            />
          </div>
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-3 w-full md:w-[96%] mx-auto">
          <div className="lg:col-span-2">
            {error ? <div className="alert alert-danger py-2 mb-3">{error}</div> : null}

            <div className="card shadow-lg transition-all duration-300 ease-out hover:shadow-xl animate-[fadeIn_.25s_ease-out]">
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

            <div className="card mt-3 shadow-lg border-0 bg-gradient-to-r from-emerald-50 to-cyan-50 animate-[fadeIn_.28s_ease-out]">
              <div className="card-body">
                <div className="flex flex-col md:flex-row md:items-end gap-3">
                  <div className="flex-1">
                    <h2 className="mb-1 text-base font-semibold text-slate-800">
                      Section Builder
                    </h2>
                    <p className="mb-2 text-xs text-slate-600">
                      Add new section with custom name and order. One default widget will be created automatically.
                    </p>
                    <div className="row g-2">
                      <div className="col-md-7">
                        <label className="form-label">Section Name</label>
                        <input
                          className="form-control"
                          value={sectionDraft.section_name}
                          onChange={(e) =>
                            setSectionDraft((prev) => ({
                              ...prev,
                              section_name: e.target.value,
                            }))
                          }
                          placeholder="Section Name"
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Section Order</label>
                        <input
                          type="number"
                          min={1}
                          className="form-control"
                          value={sectionDraft.section_order}
                          onChange={(e) =>
                            setSectionDraft((prev) => ({
                              ...prev,
                              section_order: Number(e.target.value || 1),
                            }))
                          }
                          placeholder="1"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 pb-1">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() =>
                        setSectionDraft({
                          section_name: `Section ${nextSectionOrder}`,
                          section_order: nextSectionOrder,
                        })
                      }
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={handleCreateSectionFromDraft}
                    >
                      + Add Section
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {(form.sections || []).map((section, sectionIndex) => (
              <div
                key={`section-${section.section_id}-${sectionIndex}`}
                className="card mt-3 shadow-lg"
              >
                <div className="card-body transition-all duration-300 ease-out hover:translate-y-[-1px]">
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

            <button
              type="button"
              className="btn btn-outline-primary mt-3"
              onClick={() =>
                addSection({
                  section_name: `Section ${nextSectionOrder}`,
                  section_order: nextSectionOrder,
                })
              }
            >
              + Quick Add Section
            </button>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-4 card shadow-lg transition-all duration-300 ease-out hover:shadow-xl animate-[fadeIn_.3s_ease-out]">
              <div className="card-body">
                <h2 className="mb-2 text-base font-semibold">JSON Preview</h2>
                <pre className="mb-0 max-h-[70vh] overflow-auto rounded bg-gray-50 p-2 text-xs border">
                  {JSON.stringify(form, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
      {showFloatingSave && (
        <div className="fixed bottom-5 right-5 z-50 animate-[savePop_.25s_ease-out]">
          <button
            type="button"
            className="btn btn-primary shadow-lg rounded-full px-4 py-2"
            onClick={onSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Quick Save"}
          </button>
        </div>
      )}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes savePop {
            from { opacity: 0; transform: translateY(12px) scale(0.92); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}
      </style>
    </div>
  );
};

export default DashboardLayoutEditor;
