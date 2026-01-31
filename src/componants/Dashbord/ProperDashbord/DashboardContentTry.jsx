// import { useEffect, useState } from "react";
// import api from "../api";

// // import TeacherDashboard from "./teacher/TeacherDashboard.jsx";
// import AdminDashboard from "./AdminDashboard.jsx";
// import PrincipalDashboardSACS from "../PrincipalDashboardSACS.jsx";
// import LoadingSpinner from "../../common/LoadingSpinner.jsx";
// import TeacherDashboard from "./TeacherDashboard.jsx";
// import PrincipalDashboard from "./PrincipalDashboard.jsx";

// const DashboardContainerTry = () => {
//     const [roleId, setRoleId] = useState(null);
//     const [sortName, setSortName] = useState("");
//     const [regId, setRegId] = useState(null);
//     const [dashboard, setDashboard] = useState(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         initDashboard();
//     }, []);

//     const initDashboard = async () => {
//         try {
//             setLoading(true);

//             const sessionRes = await api.get("/api/sessionData");
//             const { role_id, reg_id } = sessionRes.data.user;
//             const shortName = sessionRes.data.custom_claims.short_name;

//             setRoleId(role_id);
//             setRegId(reg_id);
//             setSortName(shortName);

//             let res;
//             if (role_id === "T") {
//                 res = await api.get(`/api/teachers/${reg_id}/dashboard/summary`);
//             } else if (role_id === "M") {
//                 res = await api.get("/api/principal/dashboard/summary");
//             } else {
//                 res = await api.get("/api/admin/dashboard/summary");
//             }

//             setDashboard(res.data);
//         } finally {
//             setLoading(false);
//         }
//     };

// if (loading) {
//     return (
//         <div className="w-screen h-screen flex items-center justify-center bg-white relative -top-[10%]">
//             {/* Overlay with blur */}
//             <div className="fixed top-0 left-0 w-full h-full bg-white bg-opacity-80 backdrop-blur-sm z-40"></div>

//             {/* Loader content */}
//             <div className="z-50 flex flex-col items-center space-y-6 px-6">
//                 {/* Google Meet style minimal avatar / icon animation */}
//                 <div className="relative w-24 h-24 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>

//                 {/* Animated dots like Google Meet waiting */}
//                 <div className="flex space-x-2">
//                     {[...Array(3)].map((_, i) => (
//                         <span
//                             key={i}
//                             className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"
//                             style={{ animationDelay: `${i * 0.2}s` }}
//                         ></span>
//                     ))}
//                 </div>

//                 {/* Engaging Text */}
//                 <p className="text-center text-blue-800 text-lg font-semibold animate-pulse">
//                     🚀 Just a moment... Your dashboard is launching!
//                 </p>

//                 {/* Optional fun tip/message */}
//                 <p className="text-sm text-gray-500 text-center max-w-xs">
//                     Meanwhile, stretch your neck or blink your eyes 👀 — healthy habits
//                     matter!
//                 </p>
//             </div>
//         </div>
//     );
// }

//     // ✅ Principal untouched
//     // if (roleId === "M" && sortName === "SACS") {
//     //     return <PrincipalDashboardSACS />;
//     // }
//     if (roleId === "M") {
//         if (sortName === "SACS") {
//             return <PrincipalDashboardSACS dashboard={dashboard} />;
//         } else {
//             return <PrincipalDashboard dashboard={dashboard} />;
//         }
//     }

//     // ✅ Teacher
//     if (roleId === "T") {
//         return <TeacherDashboard dashboard={dashboard} />;
//     }

//     // ✅ Admin / Manager / Parent
//     return <AdminDashboard data={dashboard} roleId={roleId} sortName={sortName} />;
// };

// export default DashboardContainerTry;
// uper workin weel now try for fast
import { useEffect, useState } from "react";
import api from "../api";

import AdminDashboard from "./AdminDashboard.jsx";
import PrincipalDashboardSACS from "../PrincipalDashboardSACS.jsx";
import TeacherDashboard from "./TeacherDashboard.jsx";
import PrincipalDashboard from "./PrincipalDashboard.jsx";

const DashboardContainerTry = () => {
    const [roleId, setRoleId] = useState(null);
    const [sortName, setSortName] = useState("");
    const [regId, setRegId] = useState(null);
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        initDashboard();
    }, []);

    useEffect(() => {
        if (!loading && dashboard) {
            requestAnimationFrame(() => {
                setReady(true);
            });
        }
    }, [loading, dashboard]);

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
            } else if (role_id === "M") {
                res = await api.get("/api/principal/dashboard/summary");
            } else {
                res = await api.get("/api/admin/dashboard/summary");
            }

            setDashboard(res.data);
        } finally {
            setLoading(false);
        }
    };

    // 🔒 Global blocking loader (only once)
    if (!ready) {

        return (
            <div className="w-screen h-screen flex items-center justify-center bg-white relative -top-[10%]">
                {/* Overlay with blur */}
                <div className="fixed top-0 left-0 w-full h-full bg-white bg-opacity-80 backdrop-blur-sm z-40"></div>

                {/* Loader content */}
                <div className="z-50 flex flex-col items-center space-y-6 px-6">
                    {/* Google Meet style minimal avatar / icon animation */}
                    <div className="relative w-24 h-24 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>

                    {/* Animated dots like Google Meet waiting */}
                    <div className="flex space-x-2">
                        {[...Array(3)].map((_, i) => (
                            <span
                                key={i}
                                className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"
                                style={{ animationDelay: `${i * 0.2}s` }}
                            ></span>
                        ))}
                    </div>

                    {/* Engaging Text */}
                    <p className="text-center text-blue-800 text-lg font-semibold animate-pulse">
                        🚀 Just a moment... Your dashboard is launching!
                    </p>

                    {/* Optional fun tip/message */}
                    <p className="text-sm text-gray-500 text-center max-w-xs">
                        Meanwhile, stretch your neck or blink your eyes 👀 — healthy habits
                        matter!
                    </p>
                </div>
            </div>
        );

    }

    if (roleId === "M") {
        return sortName === "SACS" ? (
            <PrincipalDashboardSACS dashboard={dashboard} ready={ready} />
        ) : (
            <PrincipalDashboard dashboard={dashboard} />
        );
    }

    if (roleId === "T") {
        return <TeacherDashboard dashboard={dashboard} />;
    }

    return <AdminDashboard data={dashboard} roleId={roleId} sortName={sortName} />;
};

export default DashboardContainerTry;
