import { useEffect, useState } from "react";
import DashboardRenderer from "./DashboardRenderer";
import LoadingSpinner from "../common/LoadingSpinner";
import api from "./api";

const DashboardContent = () => {
  const [dashboardStructure, setDashboardStructure] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initDashboard();
  }, []);

  const normalizeStructurePayload = (payload) => {
    if (payload?.sections && Array.isArray(payload.sections)) {
      return payload;
    }

    if (payload?.data?.sections && Array.isArray(payload.data.sections)) {
      return payload.data;
    }

    return null;
  };

  const fetchDashboardStructure = async ({ roleId, sortName }) => {
    const endpoints = [
      `/api/dashboard-structure?role=${roleId}`,
      `/api/get_dashboardstructure?short_name=${sortName}&role=${roleId}`,
    ];

    for (const endpoint of endpoints) {
      try {
        const res = await api.get(endpoint);
        const normalized = normalizeStructurePayload(res.data);
        if (normalized) return normalized;
      } catch (error) {
        console.warn(`Failed structure endpoint: ${endpoint}`, error);
      }
    }

    return null;
  };

  const initDashboard = async () => {
    try {
      setLoading(true);

      const session = await api.get("/api/sessionData");
      const { role_id, reg_id } = session.data.user;
      const sortName = session.data.custom_claims.short_name;

      setSessionInfo({
        roleId: role_id,
        regId: reg_id,
        sortName,
      });

      const structure = await fetchDashboardStructure({
        roleId: role_id,
        sortName,
      });

      setDashboardStructure(structure);

      let summaryRes;
      if (role_id === "T") {
        summaryRes = await api.get(`/api/teachers/${reg_id}/dashboard/summary`);
      } else if (role_id === "M" && sortName === "SACS") {
        summaryRes = await api.get("/api/principal/dashboard/summary");
      } else {
        summaryRes = await api.get("/api/admin/dashboard/summary");
      }

      setDashboardData(summaryRes.data);
    } catch (error) {
      console.error("Dashboard Load Error", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !dashboardStructure) {
    return <LoadingSpinner />;
  }

  return (
    <DashboardRenderer
      sections={dashboardStructure.sections || []}
      dashboardData={dashboardData}
      sessionInfo={sessionInfo}
    />
  );
};

export default DashboardContent;
