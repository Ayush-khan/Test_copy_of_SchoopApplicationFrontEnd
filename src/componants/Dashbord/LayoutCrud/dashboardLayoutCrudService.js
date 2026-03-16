import api from "../api";

const STORAGE_KEY = "dashboard_layout_crud_overrides_v2";

const createEmptyStore = () => ({
  created: [],
  updated: {},
  deleted: [],
});

const clone = (value) => JSON.parse(JSON.stringify(value));

const getStore = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return createEmptyStore();
  try {
    const parsed = JSON.parse(raw);
    return {
      created: Array.isArray(parsed?.created) ? parsed.created : [],
      updated:
        parsed?.updated && typeof parsed.updated === "object"
          ? parsed.updated
          : {},
      deleted: Array.isArray(parsed?.deleted) ? parsed.deleted : [],
    };
  } catch {
    return createEmptyStore();
  }
};

const saveStore = (store) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

const normalizeStructurePayload = (payload) => {
  if (payload?.sections && Array.isArray(payload.sections)) return payload;
  if (payload?.data?.sections && Array.isArray(payload.data.sections))
    return payload.data;
  return null;
};

const stripClientKeys = (payload) => {
  const cloned = clone(payload || {});
  cloned.sections = (cloned.sections || []).map((section) => ({
    ...section,
    widgets: (section.widgets || []).map((widget) => {
      const { __clientKey, ...rest } = widget || {};
      return rest;
    }),
  }));
  return cloned;
};

const saveDashboardWidgets = async (payload) => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("No authentication token found");
  }

  const res = await api.post(
    "/api/save_dashboardwidgets",
    stripClientKeys(payload),
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    },
  );
  const serverPayload =
    normalizeStructurePayload(res.data) ||
    normalizeStructurePayload(res.data?.data) ||
    res.data?.data ||
    res.data;
  return serverPayload || payload;
};

const normalizeLayout = (payload, sourceLayouts = []) => {
  const cloned = clone(payload || {});
  const dashboard = cloned.dashboard || {};
  const sections = Array.isArray(cloned.sections) ? cloned.sections : [];

  const nextSectionId =
    sourceLayouts.reduce((max, layout) => {
      const sectionMax = (layout?.sections || []).reduce(
        (innerMax, section) =>
          Math.max(innerMax, Number(section?.section_id || 0)),
        0,
      );
      return Math.max(max, sectionMax);
    }, 0) + 1;

  const nextWidgetId =
    sourceLayouts.reduce((max, layout) => {
      const widgetMax = (layout?.sections || []).reduce(
        (sectionMax, section) => {
          const maxInSection = (section?.widgets || []).reduce(
            (widgetMaxValue, widget) =>
              Math.max(
                widgetMaxValue,
                Number(widget?.dashboard_widget_id || 0),
              ),
            0,
          );
          return Math.max(sectionMax, maxInSection);
        },
        0,
      );
      return Math.max(max, widgetMax);
    }, 0) + 1;

  let sectionCounter = nextSectionId;
  let widgetCounter = nextWidgetId;

  const normalizedSections = sections.map((section, sectionIndex) => {
    const widgets = Array.isArray(section?.widgets) ? section.widgets : [];
    const normalizedWidgets = widgets.map((widget) => {
      const layout = widget?.layout || {};
      const dashboard_widget_id =
        Number(widget?.dashboard_widget_id || 0) || widgetCounter++;
      return {
        dashboard_widget_id,
        widget_key: String(widget?.widget_key || "").trim(),
        widget_name: String(widget?.widget_name || "").trim(),
        widget_type: String(widget?.widget_type || "Card").trim(),
        layout: {
          x: Number(layout?.x || 0),
          y: Number(layout?.y || 0),
          w: Math.max(1, Number(layout?.w || 1)),
          h: Math.max(1, Number(layout?.h || 1)),
        },
      };
    });

    return {
      section_id: Number(section?.section_id || 0) || sectionCounter++,
      section_name: String(
        section?.section_name || `Section ${sectionIndex + 1}`,
      ).trim(),
      section_order: Number(section?.section_order || sectionIndex + 1),
      widgets: normalizedWidgets,
    };
  });

  return {
    status: true,
    dashboard: {
      dashboard_id: Number(dashboard?.dashboard_id || 0),
      name: String(dashboard?.name || "").trim(),
      role: String(dashboard?.role || "")
        .trim()
        .toUpperCase(),
    },
    sections: normalizedSections,
  };
};

const fetchSessionInfo = async () => {
  const session = await api.get("/api/sessionData");
  const roleId = session?.data?.user?.role_id;
  const sortName = session?.data?.custom_claims?.short_name;
  return { roleId, sortName };
};

const fetchRemoteLayouts = async () => {
  try {
    const { roleId, sortName } = await fetchSessionInfo();
    if (!roleId) return [];

    const endpoints = [
      `/api/get_dashboardstructure?short_name=${sortName}&role=${roleId}`,
      `/get_dashboardstructure?short_name=${sortName}&role=${roleId}`,
      `/api/dashboard-structure?role=${roleId}`,
      `/dashboard-structure?role=${roleId}`,
    ];

    for (const endpoint of endpoints) {
      try {
        const res = await api.get(endpoint);
        const normalized = normalizeStructurePayload(res.data);
        if (normalized?.dashboard?.dashboard_id) return [normalized];
      } catch (error) {
        console.warn(`Dashboard structure endpoint failed: ${endpoint}`, error);
      }
    }
    return [];
  } catch (error) {
    console.warn("Unable to load session for dashboard structure API", error);
    return [];
  }
};

const mergeLayouts = (remoteLayouts, store) => {
  const mergedMap = new Map(
    (remoteLayouts || []).map((layout) => [
      Number(layout?.dashboard?.dashboard_id),
      layout,
    ]),
  );

  Object.entries(store.updated || {}).forEach(([id, value]) => {
    mergedMap.set(Number(id), value);
  });

  (store.deleted || []).forEach((id) => {
    mergedMap.delete(Number(id));
  });

  (store.created || []).forEach((layout) => {
    mergedMap.set(Number(layout?.dashboard?.dashboard_id), layout);
  });

  return [...mergedMap.values()].sort(
    (a, b) =>
      Number(a?.dashboard?.dashboard_id || 0) -
      Number(b?.dashboard?.dashboard_id || 0),
  );
};

const getMaxDashboardId = (layouts) =>
  layouts.reduce(
    (max, item) => Math.max(max, Number(item?.dashboard?.dashboard_id || 0)),
    0,
  );

const getMaxWidgetId = (layouts) =>
  layouts.reduce((max, layout) => {
    const widgetMax = (layout?.sections || []).reduce((sectionMax, section) => {
      const maxInSection = (section?.widgets || []).reduce(
        (widgetMaxValue, widget) =>
          Math.max(widgetMaxValue, Number(widget?.dashboard_widget_id || 0)),
        0,
      );
      return Math.max(sectionMax, maxInSection);
    }, 0);
    return Math.max(max, widgetMax);
  }, 0);

export const dashboardLayoutCrudService = {
  async list() {
    const remoteLayouts = await fetchRemoteLayouts();
    const store = getStore();
    return clone(mergeLayouts(remoteLayouts, store));
  },

  async getById(id) {
    const layouts = await this.list();
    const found = layouts.find(
      (item) => Number(item?.dashboard?.dashboard_id) === Number(id),
    );
    return found ? clone(found) : null;
  },

  async create(payload) {
    const current = await this.list();
    const normalized = normalizeLayout(payload, current);
    normalized.dashboard.dashboard_id = getMaxDashboardId(current) + 1;

    const saved = await saveDashboardWidgets(normalized);
    const savedNormalized = normalizeLayout(saved, current);

    const store = getStore();
    store.created.push(savedNormalized);
    saveStore(store);
    return clone(savedNormalized);
  },

  async update(id, payload) {
    const dashboardId = Number(id);
    const current = await this.list();
    const normalized = normalizeLayout(payload, current);
    normalized.dashboard.dashboard_id = dashboardId;

    const saved = await saveDashboardWidgets(normalized);
    const savedNormalized = normalizeLayout(saved, current);

    const store = getStore();
    const createdIndex = store.created.findIndex(
      (item) => Number(item?.dashboard?.dashboard_id) === dashboardId,
    );

    if (createdIndex !== -1) {
      store.created[createdIndex] = savedNormalized;
    } else {
      store.updated[String(dashboardId)] = savedNormalized;
      store.deleted = store.deleted.filter(
        (item) => Number(item) !== dashboardId,
      );
    }
    saveStore(store);
    return clone(savedNormalized);
  },

  async remove(id) {
    const dashboardId = Number(id);
    const store = getStore();
    const createdBefore = store.created.length;
    store.created = store.created.filter(
      (item) => Number(item?.dashboard?.dashboard_id) !== dashboardId,
    );

    delete store.updated[String(dashboardId)];
    if (store.created.length === createdBefore) {
      if (!store.deleted.some((item) => Number(item) === dashboardId)) {
        store.deleted.push(dashboardId);
      }
    } else {
      store.deleted = store.deleted.filter(
        (item) => Number(item) !== dashboardId,
      );
    }
    saveStore(store);
    return true;
  },

  async resetSeed() {
    saveStore(createEmptyStore());
    return this.list();
  },

  async getNextWidgetId() {
    const layouts = await this.list();
    return getMaxWidgetId(layouts) + 1;
  },
};
