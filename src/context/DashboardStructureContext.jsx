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
  const [dashboardStructure, setDashboardStructure] = useState(null);
  const [loading, setLoading] = useState(false);
  const inFlightRef = useRef(null);
  const tokenRef = useRef(localStorage.getItem("authToken") || "");

  const clearDashboardStructure = useCallback(() => {
    inFlightRef.current = null;
    setDashboardStructure(null);
    setLoading(false);
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
    if (dashboardStructure) return dashboardStructure;
    if (inFlightRef.current) return inFlightRef.current;

    const endpoints = [
      `/api/dashboard-structure?role=${roleId}`,
      `/api/get_dashboardstructure?short_name=${sortName}&role=${roleId}`,
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

  const value = useMemo(
    () => ({
      dashboardStructure,
      structureLoading: loading,
      loadDashboardStructure,
      clearDashboardStructure,
    }),
    [dashboardStructure, loading, loadDashboardStructure, clearDashboardStructure],
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

