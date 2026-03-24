import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../componants/Dashbord/api";

const DashboardStructureContext = createContext(null);

const normalizeStructurePayload = (payload) => {
  if (payload?.sections && Array.isArray(payload.sections)) {
    return payload;
  }

  if (payload?.data?.sections && Array.isArray(payload.data.sections)) {
    return payload.data;
  }

  return null;
};

export const DashboardStructureProvider = ({ children }) => {
  const location = useLocation();
  const [sessionInfo, setSessionInfo] = useState(null);
  const [dashboardStructure, setDashboardStructure] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);
  const inFlightRef = useRef(null);
  const sessionInFlightRef = useRef(null);
  const tokenRef = useRef(localStorage.getItem("authToken") || "");
  const lastLoadedAtRef = useRef(0);
  const layoutUpdateKey = "dashboardLayoutUpdatedAt";

  const clearDashboardStructure = useCallback(() => {
    inFlightRef.current = null;
    sessionInFlightRef.current = null;
    setSessionInfo(null);
    setDashboardStructure(null);
    setLoading(false);
    setSessionLoading(false);
    lastLoadedAtRef.current = 0;
  }, []);

  // Reset cache when auth token changes (logout/login).
  useEffect(() => {
    const currentToken = localStorage.getItem("authToken") || "";
    if (currentToken !== tokenRef.current) {
      tokenRef.current = currentToken;
      clearDashboardStructure();
    }
  }, [location.pathname, clearDashboardStructure]);

  const loadDashboardStructure = useCallback(async ({ roleId, sortName }) => {
    if (!roleId) return null;
    const updatedAt = Number(localStorage.getItem(layoutUpdateKey) || 0);
    const needsRefresh = updatedAt > lastLoadedAtRef.current;
    if (dashboardStructure && !needsRefresh) return dashboardStructure;
    if (needsRefresh) {
      inFlightRef.current = null;
      setDashboardStructure(null);
    }
    if (inFlightRef.current) return inFlightRef.current;

    const endpoints = [
      `/api/get_dashboardstructure?short_name=${sortName}&role=${roleId}`,
      `/get_dashboardstructure?short_name=${sortName}&role=${roleId}`,
    ];

    const request = (async () => {
      setLoading(true);
      try {
        for (const endpoint of endpoints) {
          try {
            const res = await api.get(endpoint);
            const normalized = normalizeStructurePayload(res.data);
            if (normalized) {
              setDashboardStructure(normalized);
              lastLoadedAtRef.current = Math.max(Date.now(), updatedAt || 0);
              return normalized;
            }
          } catch (error) {
            console.warn(`Failed structure endpoint: ${endpoint}`, error);
          }
        }
        return null;
      } finally {
        inFlightRef.current = null;
        setLoading(false);
      }
    })();

    inFlightRef.current = request;
    return request;
  }, [dashboardStructure]);

  const loadSessionInfo = useCallback(async () => {
    if (sessionInfo) return sessionInfo;
    if (sessionInFlightRef.current) return sessionInFlightRef.current;

    const request = (async () => {
      setSessionLoading(true);
      try {
        const session = await api.get("/api/sessionData");
        const { role_id, reg_id } = session.data.user;
        const sortName = session.data.custom_claims.short_name;
        const normalizedSession = {
          roleId: role_id,
          regId: reg_id,
          sortName,
        };
        setSessionInfo(normalizedSession);
        return normalizedSession;
      } finally {
        sessionInFlightRef.current = null;
        setSessionLoading(false);
      }
    })();

    sessionInFlightRef.current = request;
    return request;
  }, [sessionInfo]);

  const value = useMemo(
    () => ({
      sessionInfo,
      sessionLoading,
      loadSessionInfo,
      dashboardStructure,
      structureLoading: loading,
      loadDashboardStructure,
      clearDashboardStructure,
    }),
    [
      sessionInfo,
      sessionLoading,
      loadSessionInfo,
      dashboardStructure,
      loading,
      loadDashboardStructure,
      clearDashboardStructure,
    ],
  );

  return (
    <DashboardStructureContext.Provider value={value}>
      {children}
    </DashboardStructureContext.Provider>
  );
};

export const useDashboardStructure = () => {
  const context = useContext(DashboardStructureContext);
  if (!context) {
    throw new Error("useDashboardStructure must be used inside DashboardStructureProvider");
  }
  return context;
};
