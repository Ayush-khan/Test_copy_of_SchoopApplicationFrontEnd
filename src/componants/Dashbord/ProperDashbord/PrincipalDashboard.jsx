import PrincipalDashboardSACS from "../PrincipalDashboardSACS.jsx";

const PrincipalDashboard = ({ sortName }) => {
    // If SACS
    if (sortName === "SACS") return <PrincipalDashboardSACS />;

    return (
        <div>
            <h2>Principal Dashboard</h2>
            {/* Add principal-specific cards */}
        </div>
    );
};

export default PrincipalDashboard;
