// import DashboardContent from "./DashboardContent.jsx";
// const AdminDashboard = () => {
//   return (
//     <div
//       className=" w-screen overflow-x-hidden h-screen"
//       style={{
//         background: "   linear-gradient(to bottom, #E91E63, #2196F3)",
//       }}
//     >
//       <DashboardContent />
//     </div>
//   );
// };
// export default AdminDashboard;

import { useState } from "react";
import DashboardContent from "./DashboardContent.jsx";

// FLAT COLORS
const flatColors = [
  { name: "Barely Green", value: "#acb7ae" },
  { name: "Tan Blonde", value: "#e4decd" },
  { name: "Blondey", value: "#c2b490" },
  { name: "Goldi-lots", value: "#c7af6b" },
  { name: "Blueberry", value: "#6B7A8F" },
  { name: "Apple Core", value: "#DCC7AA" },
  { name: "Sand Tan", value: "#e1b382" },
  { name: "Sand Tan Shadow", value: "#c89666" },
  { name: "Night Blue", value: "#2d545e" },
  { name: "Night Blue Shadow", value: "#12343b" },
  { name: "Brightly Orange #2", value: "#f43a09" },
  { name: "Brightly Orange", value: "#ff1e00" },
  { name: "Dimly Blue", value: "#e8f9fd" },
  { name: "Alert Green", value: "#59ce8f" },
  // DARK FLAT COLORS
  { name: "Charcoal Black", value: "#1C1C1C" },
  { name: "Midnight Gray", value: "#2C2C2C" },
  { name: "Deep Ash", value: "#3A3A3A" },
  { name: "Shadow Blue", value: "#2F3E46" },
  { name: "Navy Night", value: "#1B263B" },
  { name: "Raven", value: "#121212" },
  { name: "Dim Coal", value: "#222222" },
];

// GRADIENT COLORS
const gradientColors = [
  { name: "Yass Queen", value: "linear-gradient(to right, #ff1d58, #ff1d58)" },
  {
    name: "Sister Sister",
    value: "linear-gradient(to right, #f75990, #f75990)",
  },
  {
    name: "Crown Yellow",
    value: "linear-gradient(to right, #fff685, #fff685)",
  },
  { name: "Blue Light", value: "linear-gradient(to right, #00DDFF, #00DDFF)" },
  { name: "Brutal Blue", value: "linear-gradient(to right, #0049B7, #0049B7)" },
  {
    name: "Ice Cold",
    value:
      "linear-gradient(to right, #a0d2eb, #e5eaf5, #d0bdf4, #8458B3, #a28089)",
  },
  {
    name: "Bright Blue Mix",
    value: "linear-gradient(to right, #51e2f5, #9df9ef, #edf756, #ffa8B6)",
  },

  // DARK GRADIENT COLORS
  {
    name: "Nightfall",
    value: "linear-gradient(to right, #0f2027, #203a43, #2c5364)",
  },
  { name: "Deep Space", value: "linear-gradient(to right, #000428, #004e92)" },
  {
    name: "Phantom Purple",
    value: "linear-gradient(to right, #2b2e4a, #e84545)",
  },
  { name: "Dark Rose", value: "linear-gradient(to right, #2c3e50, #fd746c)" },
  { name: "Moody Sky", value: "linear-gradient(to right, #434343, #000000)" },
  { name: "Galaxy Mix", value: "linear-gradient(to right, #141E30, #243B55)" },

  // NEW DARK GRADIENTS
  {
    name: "Twilight Shadows",
    value: "linear-gradient(to right, #0f0c29, #302b63, #24243e)",
  },
  {
    name: "Dark Steel",
    value: "linear-gradient(to right, #434343, #000000)",
  },
  {
    name: "Black Night",
    value: "linear-gradient(to right, #000000, #434343)",
  },
  {
    name: "Misty Noir",
    value: "linear-gradient(to right, #1e130c, #9a8478)",
  },
  {
    name: "Black Cherry",
    value: "linear-gradient(to right, #2b0f1c, #4a0f23, #6a1b34)",
  },
  {
    name: "Obsidian Flame",
    value: "linear-gradient(to right, #1a1a1a, #b31217)",
  },
  {
    name: "Ashen Violet",
    value: "linear-gradient(to right, #41295a, #2F0743)",
  },
  {
    name: "Emerald Night",
    value: "linear-gradient(to right, #004e92, #000428)",
  },
  {
    name: "Stormy Sea",
    value: "linear-gradient(to right, #373b44, #4286f4)",
  },
  {
    name: "Muted Cosmos",
    value: "linear-gradient(to right, #1e2022, #3a3d40, #4b4e52)",
  },

  // NEWLY ADDED GRADIENTS
  {
    name: "Silver Fade",
    value: "linear-gradient(135deg, #e0e0e0, #cfcfcf, #bfbfbf)",
  },
  {
    name: "Soft Steel",
    value: "linear-gradient(145deg, #f0f0f0, #d6d6d6, #bbbbbb)",
  },
  {
    name: "Grey Horizon",
    value: "linear-gradient(to right, #d3d3d3, #a8a8a8)",
  },
  {
    name: "Charcoal Drift",
    value: "linear-gradient(120deg, #2e2e2e, #4a4a4a, #6e6e6e)",
  },
];

const AdminDashboard = () => {
  const [background, setBackground] = useState(
    "linear-gradient(to bottom, #E91E63, #2196F3)"
  );
  const [showModal, setShowModal] = useState(false);
  const [selectedColor, setSelectedColor] = useState(background);

  const applyBackground = () => {
    setBackground(selectedColor);
    setShowModal(false);
  };

  return (
    <div
      className="w-screen h-screen overflow-x-hidden relative transition-all duration-500"
      style={{ background }}
    >
      {/* Toggle Background Button */}
      <button
        onClick={() => setShowModal(true)}
        className="absolute top-4 right-4 px-4 py-2 bg-white text-black rounded shadow hover:bg-gray-300 transition z-10"
      >
        Change Background
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white w-[90%] max-w-2xl p-6 rounded shadow-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Select Background Color</h2>

            <div>
              <h3 className="font-semibold text-lg mb-2">🎨 Flat Colors</h3>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {flatColors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.value)}
                    style={{ background: color.value }}
                    className={`h-10 rounded border-2 ${
                      selectedColor === color.value
                        ? "border-black"
                        : "border-transparent"
                    }`}
                    title={color.name}
                  />
                ))}
              </div>

              <h3 className="font-semibold text-lg mb-2">🌈 Gradient Colors</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {gradientColors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.value)}
                    style={{ background: color.value }}
                    className={`h-12 rounded border-2 ${
                      selectedColor === color.value
                        ? "border-black"
                        : "border-transparent"
                    }`}
                    title={color.name}
                  />
                ))}
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={applyBackground}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <DashboardContent />
    </div>
  );
};

export default AdminDashboard;
