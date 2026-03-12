import { useEffect, useState } from "react";
import DashboardRenderer from "./DashboardRenderer";
import LoadingSpinner from "../common/LoadingSpinner";
import api from "./api";
import { useDashboardStructure } from "../../context/DashboardStructureContext";

const DashboardContent = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const { dashboardStructure, structureLoading, loadDashboardStructure } =
    useDashboardStructure();

  useEffect(() => {
    initDashboard();
  }, []);

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

      await loadDashboardStructure({
        roleId: role_id,
        sortName,
      });

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

  if (loading || structureLoading || !dashboardStructure) {
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
