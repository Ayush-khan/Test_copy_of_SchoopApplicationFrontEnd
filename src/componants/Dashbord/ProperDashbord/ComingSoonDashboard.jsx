import axios from "axios";
import React from "react";

const ComingSoonDashboard = ({ roleId }) => {

    const LMS_URL = "https://ednova.evolvu.in";
    const tokenToLMS = localStorage.getItem("authToken");
    console.log("TOken to lms", tokenToLMS);

    const goToLMS = async () => {
        try {
        const schoolToken = localStorage.getItem("authToken");

        if (!schoolToken) {
            alert("Please login first");
            return;
        }

        console.log(" Initiating SSO login...");

        const response = await axios.post(
            `${LMS_URL}/sso/api/school/lms-sso`,
            {},
            {
            headers: {
                Authorization: `Bearer ${schoolToken}`, // FIXED
                "Content-Type": "application/json",
            },
            withCredentials: true,
            },
        );

        console.log(" SSO Response:", response.data);

        if (response.data?.success && response.data?.lms_url) {
            console.log("🚀 Redirecting to LMS...");
            window.location.href = response.data.lms_url; //  BEST
        } else {
            alert("Login failed. Invalid response from LMS.");
        }
        } catch (error) {
        console.error(" SSO failed:", error.response?.data || error.message);

        if (error.response?.status === 403) {
            alert("Authentication failed. Please login again.");
        } else {
            alert("Connection error. Please try again later.");
        }
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center text-white">

            <section className="w-full px-4 md:px-6 py-3">
                <div className="flex justify-center">
                <button
                    onClick={goToLMS}
                    className="flex items-center gap-2 bg-pink-700 text-white
            px-5 py-3 rounded-lg shadow-md hover:bg-pink-800
            transition-all duration-200 font-semibold"
                >
                    Go to LMS →
                </button>
                </div>
            </section>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fadeInUp">
                Dashboard Coming Soon 🚧
            </h1>

            <p className="text-lg text-indigo-100 mb-6 animate-fadeInUp delay-200">
                Your role ({roleId || "Unknown"}) dashboard is under development.
            </p>

            <div className="flex space-x-2 animate-pulse">
                <span className="w-3 h-3 bg-white rounded-full"></span>
                <span className="w-3 h-3 bg-white rounded-full"></span>
                <span className="w-3 h-3 bg-white rounded-full"></span>
            </div>

            <p className="mt-6 text-sm text-indigo-200 italic">
                We’re building something awesome for you ✨
            </p>
        </div>
    );
};

export default ComingSoonDashboard;
