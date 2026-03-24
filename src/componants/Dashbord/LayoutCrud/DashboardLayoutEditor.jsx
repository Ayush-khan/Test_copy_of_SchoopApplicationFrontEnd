import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Responsive, useContainerWidth } from "react-grid-layout";
import Select from "react-select";
import { dashboardLayoutCrudService } from "./dashboardLayoutCrudService";
import api from "../api";
import WidgetRenderer from "../WidgetRenderer";
import { useDashboardStructure } from "../../../context/DashboardStructureContext";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const GRID_SCALE = 10;
const PREVIEW_COLS = {
  lg: 12 * GRID_SCALE,
  md: 8 * GRID_SCALE,
  sm: 4 * GRID_SCALE,
  xs: 2 * GRID_SCALE,
  xxs: 1 * GRID_SCALE,
};
const PREVIEW_BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const PREVIEW_ROW_HEIGHT = 56 / GRID_SCALE;
const PREVIEW_MARGIN = [16 / GRID_SCALE, 16 / GRID_SCALE];
const MAX_GRID_H = 24 * GRID_SCALE;
const PREVIEW_DRAG_HANDLE = ".preview-drag-handle";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const scaleToGrid = (value) => {
  const numeric = Number(value || 0);
  return Number.isFinite(numeric) ? Math.round(numeric * GRID_SCALE) : 0;
};
const roundTenth = (value) => Math.round(value * 10) / 10;
const unscaleFromGrid = (value) => {
  const numeric = Number(value || 0);
  return Number.isFinite(numeric) ? roundTenth(numeric / GRID_SCALE) : 0;
};

const createWidgetWithId = (widgetId, clientKey) => ({
  dashboard_widget_id: Number(widgetId) || 0,
  __clientKey: clientKey,
  widget_key: "",
  widget_name: "",
  widget_type: "",
  widget_type_id: "",
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
      x: clamp(scaleToGrid(base?.x || 0), 0, PREVIEW_COLS.lg - 1),
      y: Math.max(0, scaleToGrid(base?.y || 0)),
      w: clamp(scaleToGrid(base?.w || 2), 1, PREVIEW_COLS.lg),
      h: clamp(scaleToGrid(base?.h || 2), 1, MAX_GRID_H),
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
      x: clamp(scaleToGrid(base?.x || 0), 0, PREVIEW_COLS.md - 1),
      y: Math.max(0, scaleToGrid(base?.y || 0)),
      w: clamp(Math.min(scaleToGrid(base?.w || 2), PREVIEW_COLS.md), 1, PREVIEW_COLS.md),
      h: clamp(scaleToGrid(base?.h || 2), 1, MAX_GRID_H),
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
      x: clamp(scaleToGrid(base?.x || 0), 0, PREVIEW_COLS.sm - 1),
      y: Math.max(0, scaleToGrid(base?.y || 0)),
      w: clamp(Math.min(scaleToGrid(base?.w || 2), PREVIEW_COLS.sm), 1, PREVIEW_COLS.sm),
      h: clamp(scaleToGrid(base?.h || 2), 1, MAX_GRID_H),
    };
  });

  return { lg, md, sm, xs: sm, xxs: sm };
};

const widgetPreviewShellClasses = (widgetType) => {
  const type = String(widgetType || "").toLowerCase();
  if (type === "chart")
    return "bg-white border border-gray-200 shadow-sm p-2";
  if (type === "table" || type === "list")
    return "bg-white border border-gray-200 shadow-sm";
  return "h-full";
};

const SectionLayoutPreview = ({
  section,
  onCommitLayout,
  onRemoveWidget,
  previewData,
  previewSession,
}) => {
  const widgets = section?.widgets || [];
  const { width, containerRef, mounted } = useContainerWidth({
    measureBeforeMount: false,
    initialWidth: 1280,
  });

  const layouts = useMemo(() => toSectionLayouts(widgets), [widgets]);

  const commit = (layout) => {
    if (!Array.isArray(layout)) return;
    onCommitLayout(layout);
  };

  return (
    <div ref={containerRef} className="w-full">
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
                  className={`h-full rounded-lg relative overflow-hidden ${widgetPreviewShellClasses(
                    widget?.widget_type,
                  )}`}
                >
                  <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
                    <button
                      type="button"
                      className="border-0 bg-white/90 rounded px-1.5 py-[1px] text-[10px] text-red-600 hover:bg-red-50 shadow"
                      title="Remove widget"
                      onClick={() => onRemoveWidget?.(widget)}
                    >
                      x
                    </button>
                    <button
                      type="button"
                      className="preview-drag-handle border-0 bg-white/90 rounded px-2 py-[2px] text-[10px] text-gray-700 shadow"
                      title="Drag to move"
                    >
                      Drag
                    </button>
                  </div>
                  <div className="h-full w-full pointer-events-none">
                    <WidgetRenderer
                      widget={widget}
                      data={previewData}
                      sessionInfo={previewSession}
                    />
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

const DashboardLayoutPreviewPanel = ({
  sections,
  onCommitLayout,
  onRemoveWidget,
  previewData,
  previewSession,
}) => {
  const orderedSections = (sections || [])
    .map((section, originalIndex) => ({ section, originalIndex }))
    .sort(
      (a, b) =>
        Number(a?.section?.section_order || 0) - Number(b?.section?.section_order || 0),
    );

  return (
    <div className="space-y-6 p-4">
      {orderedSections.map(({ section, originalIndex }, sectionIndex) => (
        <div key={section?.section_id || sectionIndex} className="bg-transparent">
          <SectionLayoutPreview
            section={section}
            onCommitLayout={(layout) => onCommitLayout(originalIndex, layout)}
            onRemoveWidget={(widget) => onRemoveWidget(originalIndex, widget)}
            previewData={previewData}
            previewSession={previewSession}
          />
        </div>
      ))}
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
  const [widgetTypes, setWidgetTypes] = useState([]);
  const [widgetsByType, setWidgetsByType] = useState({});
  const [widgetTypesLoading, setWidgetTypesLoading] = useState(false);
  const [widgetsLoading, setWidgetsLoading] = useState({});
  const { sessionInfo, loadSessionInfo } = useDashboardStructure();

  const previewData = useMemo(() => ({ data: {} }), []);

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

  const normalizeWidgetTypes = (data) => {
    const list = Array.isArray(data?.data) ? data.data : data;
    if (!Array.isArray(list)) return [];
    return list.map((item) => ({
      id:
        item?.widget_type_id ??
        item?.id ??
        item?.widget_type ??
        item?.type_id ??
        item?.value,
      name:
        item?.widget_name ??
        item?.name ??
        item?.widget_type_name ??
        item?.label ??
        item?.type_name,
    })).filter((item) => item.id !== undefined && item.name);
  };

  const normalizeWidgets = (data) => {
    const list = Array.isArray(data?.data) ? data.data : data;
    if (!Array.isArray(list)) return [];
    return list.map((item) => ({
      id: item?.id ?? item?.widget_id ?? item?.dashboard_widget_id,
      name: item?.name ?? item?.widget_name ?? item?.label,
      key: item?.key ?? item?.widget_key,
    })).filter((item) => item.id !== undefined && item.name);
  };

  const fetchWidgetTypes = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    setWidgetTypesLoading(true);
    try {
      const res = await api.get("/api/get_widgetstype", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      setWidgetTypes(normalizeWidgetTypes(res?.data?.data));
    } catch (error) {
      console.error("Failed to load widget types:", error);
      setWidgetTypes([]);
    } finally {
      setWidgetTypesLoading(false);
    }
  };

  const fetchWidgetsByType = async (typeId) => {
    if (!typeId) return;
    if (widgetsByType[typeId]) return;
    const token = localStorage.getItem("authToken");
    if (!token) return;
    setWidgetsLoading((prev) => ({ ...prev, [typeId]: true }));
    try {
      const res = await api.get(`/api/widgets?widget_type=${typeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      const normalized = normalizeWidgets(res.data);
      setWidgetsByType((prev) => ({ ...prev, [typeId]: normalized }));
    } catch (error) {
      console.error("Failed to load widgets by type:", error);
      setWidgetsByType((prev) => ({ ...prev, [typeId]: [] }));
    } finally {
      setWidgetsLoading((prev) => ({ ...prev, [typeId]: false }));
    }
  };

  const getTypeIdByName = (name) => {
    if (!name) return "";
    const match = widgetTypes.find(
      (type) => String(type.name).toLowerCase() === String(name).toLowerCase(),
    );
    return match?.id ?? "";
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
    fetchWidgetTypes();
  }, []);

  useEffect(() => {
    if (!sessionInfo) {
      loadSessionInfo();
    }
  }, [sessionInfo, loadSessionInfo]);

  useEffect(() => {
    if (!widgetTypes.length) return;
    setForm((prev) => ({
      ...prev,
      sections: (prev.sections || []).map((section) => ({
        ...section,
        widgets: (section.widgets || []).map((widget) => {
          if (widget.widget_type_id) return widget;
          const typeId = getTypeIdByName(widget.widget_type);
          return typeId ? { ...widget, widget_type_id: typeId } : widget;
        }),
      })),
    }));
  }, [widgetTypes]);

  useEffect(() => {
    const typeIds = new Set();
    (form.sections || []).forEach((section) => {
      (section.widgets || []).forEach((widget) => {
        const typeId = widget.widget_type_id || getTypeIdByName(widget.widget_type);
        if (typeId) typeIds.add(String(typeId));
      });
    });
    typeIds.forEach((typeId) => {
      if (!widgetsByType[typeId]) {
        fetchWidgetsByType(typeId);
      }
    });
  }, [form.sections, widgetsByType, widgetTypes]);

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
    const numeric = parseFloat(value);
    updateWidget(sectionIndex, widgetIndex, "layout", {
      ...(form.sections?.[sectionIndex]?.widgets?.[widgetIndex]?.layout || {}),
      [key]: Number.isFinite(numeric) ? roundTenth(numeric) : 0,
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
            x: Math.max(0, unscaleFromGrid(nextItem.x || 0)),
            y: Math.max(0, unscaleFromGrid(nextItem.y || 0)),
            w: Math.max(0.5, unscaleFromGrid(nextItem.w || 1)),
            h: Math.max(0.5, unscaleFromGrid(nextItem.h || 1)),
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
        if (!widget?.widget_type_id && !widget?.widget_type?.trim()) {
          return "Each widget must have a widget type.";
        }
        if (!widget?.widget_name?.trim()) return "Each widget must have widget name.";
        if (!widget?.widget_key?.trim()) return "Each widget must have widget key.";
        if (!Number(widget?.dashboard_widget_id || 0)) {
          return "Each widget must have a valid widget id.";
        }
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
    <div className="p-4">
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
        <div className="w-full overflow-y-auto">
          {error ? <div className="alert alert-danger py-2 mb-3">{error}</div> : null}

          <div className="animate-[fadeIn_.28s_ease-out]">
            <DashboardLayoutPreviewPanel
              sections={form.sections || []}
              onCommitLayout={applySectionLayout}
              onRemoveWidget={removeWidgetFromPreview}
              previewData={previewData}
              previewSession={sessionInfo}
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
                              value={widget.dashboard_widget_id || ""}
                              readOnly
                            />
                          </div>
                        </div>

                        <div className="col-md-3">
                          <label className="form-label">Widget Type</label>
                          <Select
                            classNamePrefix="react-select"
                            isLoading={widgetTypesLoading}
                            value={(() => {
                              const typeId =
                                widget.widget_type_id ||
                                getTypeIdByName(widget.widget_type);
                              const match = widgetTypes.find(
                                (type) => String(type.id) === String(typeId),
                              );
                              return match
                                ? { value: match.id, label: match.name }
                                : null;
                            })()}
                            options={widgetTypes.map((type) => ({
                              value: type.id,
                              label: type.name,
                            }))}
                            placeholder="Select Type"
                            onChange={(option) => {
                              const nextTypeId = option?.value || "";
                              const nextTypeName = option?.label || "";
                              updateWidget(sectionIndex, widgetIndex, "widget_type_id", nextTypeId);
                              updateWidget(sectionIndex, widgetIndex, "widget_type", nextTypeName);
                              updateWidget(sectionIndex, widgetIndex, "widget_name", "");
                              updateWidget(sectionIndex, widgetIndex, "widget_key", "");
                              updateWidget(sectionIndex, widgetIndex, "dashboard_widget_id", 0);
                              fetchWidgetsByType(nextTypeId);
                            }}
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Widget Name</label>
                          <Select
                            classNamePrefix="react-select"
                            isLoading={(() => {
                              const typeId =
                                widget.widget_type_id ||
                                getTypeIdByName(widget.widget_type);
                              return typeId ? !!widgetsLoading[typeId] : false;
                            })()}
                            isDisabled={
                              !(
                                widget.widget_type_id ||
                                getTypeIdByName(widget.widget_type)
                              )
                            }
                            value={(() => {
                              const typeId =
                                widget.widget_type_id ||
                                getTypeIdByName(widget.widget_type);
                              const options = widgetsByType[typeId] || [];
                              const selected = options.find(
                                (opt) => String(opt.name) === String(widget.widget_name),
                              );
                              return selected
                                ? { value: selected.id, label: selected.name }
                                : null;
                            })()}
                            options={(() => {
                              const typeId =
                                widget.widget_type_id ||
                                getTypeIdByName(widget.widget_type);
                              const options = widgetsByType[typeId] || [];
                              return options.map((opt) => ({
                                value: opt.id,
                                label: opt.name,
                                key: opt.key,
                              }));
                            })()}
                            placeholder={(() => {
                              const typeId =
                                widget.widget_type_id ||
                                getTypeIdByName(widget.widget_type);
                              if (!typeId) return "Select type first";
                              if (widgetsLoading[typeId]) return "Loading...";
                              return "Select Widget";
                            })()}
                            onChange={(option) => {
                              const typeId =
                                widget.widget_type_id ||
                                getTypeIdByName(widget.widget_type);
                              const options = widgetsByType[typeId] || [];
                              const selected = options.find(
                                (opt) => String(opt.id) === String(option?.value),
                              );
                              updateWidget(
                                sectionIndex,
                                widgetIndex,
                                "widget_name",
                                selected?.name || "",
                              );
                              updateWidget(
                                sectionIndex,
                                widgetIndex,
                                "widget_key",
                                selected?.key || "",
                              );
                              updateWidget(
                                sectionIndex,
                                widgetIndex,
                                "dashboard_widget_id",
                                Number(selected?.id || 0),
                              );
                            }}
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Widget Key</label>
                          <input
                            className="form-control"
                            value={widget.widget_key || ""}
                            readOnly
                          />
                        </div>
                      </div>

                      <div className="row g-2 mt-1">
                        <div className="col-6 col-md-3">
                          <label className="form-label">x</label>
                          <input
                            type="number"
                            className="form-control"
                            value={widget.layout?.x ?? 0}
                            step="0.1"
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
                            step="0.1"
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
                            step="0.1"
                            min="0.1"
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
                            step="0.1"
                            min="0.1"
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
