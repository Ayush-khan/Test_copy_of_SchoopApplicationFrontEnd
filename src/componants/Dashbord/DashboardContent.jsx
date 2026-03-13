import { useEffect, useState } from "react";
import DashboardRenderer from "./DashboardRenderer";
import LoadingSpinner from "../common/LoadingSpinner";
import api from "./api";
import { useDashboardStructure } from "../../context/DashboardStructureContext";

const SUMMARY_STALE_MS = 30 * 1000; // 30s

let summaryCache = {
    dashboardData: null,
    token: null,
    fetchedAt: 0,
};
let summaryInFlight = null;

const DashboardContent = () => {
    const [dashboardData, setDashboardData] = useState(summaryCache.dashboardData);
    const [loading, setLoading] = useState(!summaryCache.dashboardData);
    const {
        sessionInfo,
        sessionLoading,
        loadSessionInfo,
        dashboardStructure,
        structureLoading,
        loadDashboardStructure,
    } = useDashboardStructure();

    useEffect(() => {
        initDashboard();
    }, []);

    useEffect(() => {
        const onFocus = () => {
            const age = Date.now() - (summaryCache.fetchedAt || 0);
            if (age >= SUMMARY_STALE_MS) {
                loadFreshDashboard({ silent: true });
            }
        };

        window.addEventListener("focus", onFocus);
        return () => {
            window.removeEventListener("focus", onFocus);
        };
    }, []);

    const fetchSummary = async ({ roleId, regId, sortName }) => {
        if (roleId === "T") {
            return api.get(`/api/teachers/${regId}/dashboard/summary`);
        }
        if (roleId === "M" && sortName === "SACS") {
            return api.get("/api/principal/dashboard/summary");
        }
        return api.get("/api/admin/dashboard/summary");
    };

    const loadFreshDashboard = async ({ silent }) => {
        if (summaryInFlight) return summaryInFlight;

        const request = (async () => {
            try {
                if (!silent) setLoading(true);
                const currentToken = localStorage.getItem("authToken") || "";

                let nextSessionInfo = sessionInfo;

                if (!nextSessionInfo) {
                    nextSessionInfo = await loadSessionInfo();
                }

                await loadDashboardStructure({
                    roleId: nextSessionInfo.roleId,
                    sortName: nextSessionInfo.sortName,
                });

                const summaryRes = await fetchSummary(nextSessionInfo);
                setDashboardData(summaryRes.data);
                summaryCache.dashboardData = summaryRes.data;
                summaryCache.token = currentToken;
                summaryCache.fetchedAt = Date.now();
            } catch (error) {
                console.error("Dashboard Load Error", error);
            } finally {
                summaryInFlight = null;
                if (!silent) setLoading(false);
            }
        })();

        summaryInFlight = request;
        return request;
    };

    const initDashboard = async () => {
        const currentToken = localStorage.getItem("authToken") || "";
        if (summaryCache.token && summaryCache.token !== currentToken) {
            summaryCache = {
                dashboardData: null,
                token: null,
                fetchedAt: 0,
            };
        }

        const hasCache = !!summaryCache.dashboardData;

        if (hasCache) {
            setDashboardData(summaryCache.dashboardData);
            setLoading(false);
            const age = Date.now() - (summaryCache.fetchedAt || 0);
            if (age >= SUMMARY_STALE_MS) {
                loadFreshDashboard({ silent: true });
            }
            return;
        }

        await loadFreshDashboard({ silent: false });
    };

    if ((loading || sessionLoading || structureLoading) && (!dashboardStructure || !dashboardData || !sessionInfo)) {
        // return <LoadingSpinner />;
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

    return (
        <DashboardRenderer
            sections={dashboardStructure.sections || []}
            dashboardData={dashboardData}
            sessionInfo={sessionInfo}
        />
    );
};

export default DashboardContent;
