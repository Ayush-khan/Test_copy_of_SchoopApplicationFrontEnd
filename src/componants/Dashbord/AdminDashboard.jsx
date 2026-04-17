import DashboardContent from "./DashboardContent.jsx";
// import DashboardContainerTry from "./ProperDashbord/DashboardContentTry.jsx";

const AdminDashboard = () => {
  return (
    <div
      className=" w-screen overflow-x-hidden h-screen"
    // style={{
    //   background: "   linear-gradient(to bottom, #E91E63, #2196F3)",
    // }}
    >
      {/* <DashboardContainerTry /> */}
      <DashboardContent />
    </div>
  );
};
export default AdminDashboard;
