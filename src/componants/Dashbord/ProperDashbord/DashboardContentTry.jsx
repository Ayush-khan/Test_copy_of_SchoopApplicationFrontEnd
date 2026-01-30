import { useEffect, useState } from "react";
import api from "../api";

// import TeacherDashboard from "./teacher/TeacherDashboard.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import PrincipalDashboardSACS from "../PrincipalDashboardSACS.jsx";
import LoadingSpinner from "../../common/LoadingSpinner.jsx";
import TeacherDashboard from "./TeacherDashboard.jsx";

const DashboardContainerTry = () => {
    const [roleId, setRoleId] = useState(null);
    const [sortName, setSortName] = useState("");
    const [regId, setRegId] = useState(null);
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        initDashboard();
    }, []);

    const initDashboard = async () => {
        try {
            setLoading(true);

            const sessionRes = await api.get("/api/sessionData");
            const { role_id, reg_id } = sessionRes.data.user;
            const shortName = sessionRes.data.custom_claims.short_name;

            setRoleId(role_id);
            setRegId(reg_id);
            setSortName(shortName);

            let res;
            if (role_id === "T") {
                res = await api.get(`/api/teachers/${reg_id}/dashboard/summary`);
            } else if (role_id === "M" && shortName === "SACS") {
                res = await api.get("/api/principal/dashboard/summary");
            } else {
                res = await api.get("/api/admin/dashboard/summary");
            }

            setDashboard(res.data);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    // ✅ Principal untouched
    if (roleId === "M" && sortName === "SACS") {
        return <PrincipalDashboardSACS />;
    }

    // ✅ Teacher
    if (roleId === "T") {
        return <TeacherDashboard dashboard={dashboard} />;
    }

    // ✅ Admin / Manager / Parent
    return <AdminDashboard data={dashboard} roleId={roleId} sortName={sortName} />;
};

export default DashboardContainerTry;
