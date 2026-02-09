import React from "react";

const ComingSoonDashboard = ({ roleId }) => {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center text-white">

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
