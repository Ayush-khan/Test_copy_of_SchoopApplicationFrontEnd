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
const flatGrayColors = [
  { name: "Gainsboro", value: "#DCDCDC" }, // Light, soft gray – great for backgrounds
  { name: "Silver", value: "#C0C0C0" }, // Classic silver-gray
  { name: "Ash Gray", value: "#B2BEB5" }, // Slightly greenish tint – very modern
  { name: "Spanish Gray", value: "#989898" }, // Neutral medium gray – perfect for cards or UI blocks
  { name: "Slate Gray", value: "#708090" }, // Blue-ish undertone, looks great with whites and blues
  { name: "Dim Gray", value: "#696969" }, // Smooth and subtle – ideal for text or borders
  { name: "Sonic Silver", value: "#757575" }, // Balanced and readable on light backgrounds
  { name: "Charcoal", value: "#36454F" }, // Rich dark gray-blue – great for dark mode
  { name: "Graphite", value: "#383838" }, // Stylish dark gray – almost black, but softer
  { name: "Jet Gray", value: "#2C2C2C" }, // Dark neutral gray – good for dark UI
];

// GRADIENT COLORS
const gradientColors = [
  {
    name: "Brutal Blue Glow",
    value: "linear-gradient(135deg, #0049B7, #3A86FF, #00BBF9)",
  },
  {
    name: "Ice Cold",
    value:
      "linear-gradient(135deg, #a0d2eb, #e5eaf5, #d0bdf4, #8458B3, #a28089)",
  },
  {
    name: "Bright Blue Mix",
    value: "linear-gradient(to right, #51e2f5, #9df9ef, #edf756, #ffa8B6)",
  },
  {
    name: "Stormy Sea",
    value: "linear-gradient(135deg, #373b44, #4a6588, #4286f4)",
  },

  // 🌌 Dark / Futuristic Themes

  {
    name: "Phantom Purple",
    value: "linear-gradient(135deg, #2b2e4a, #e84545)",
  },
  {
    name: "Dark Rose",
    value: "linear-gradient(135deg, #2c3e50, #fd746c)",
  },

  {
    name: "Obsidian Flame",
    value: "linear-gradient(to right, #1a1a1a, #b31217)",
  },

  {
    name: "Emerald Night",
    value: "linear-gradient(to right, #004e92, #000428)",
  },

  // 🌚 Grayscale & Charcoal

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
    name: "Moody Pastel",
    value: "linear-gradient(135deg, #2f2f2f, #a39ba8, #c0b7c2)",
  },
  {
    name: "Ash Moonlight",
    value: "linear-gradient(135deg, #3e3e3e, #686868, #9e9e9e)",
  },
  {
    name: "Dark Platinum",
    value: "linear-gradient(135deg, #2b2b2b, #4d4d4d, #8e8e8e)",
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
                {flatGrayColors.map((color) => (
                  <div className="relative">
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.value)}
                      style={{ background: color.value }}
                      className={`h-12 w-full rounded-lg transition-all duration-300 transform 
        ${
          selectedColor === color.value
            ? "scale-110 ring-4 ring-pink-500 border-2 border-white shadow-xl z-10"
            : "hover:scale-105 hover:ring-2 hover:ring-gray-400"
        }`}
                      title={color.name}
                    />
                    {selectedColor === color.value && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-white text-xl font-bold drop-shadow-md">
                          ✓
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <h3 className="font-semibold text-lg mb-2">🌈 Gradient Colors</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {gradientColors.map((color) => (
                  <div className="relative">
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.value)}
                      style={{ background: color.value }}
                      className={`h-14 w-full rounded-lg transition-all duration-300 transform 
        ${
          selectedColor === color.value
            ? "scale-110 ring-4 ring-blue-500 border-2 border-white shadow-xl z-10"
            : "hover:scale-105 hover:ring-2 hover:ring-gray-400"
        }`}
                      title={color.name}
                    />
                    {selectedColor === color.value && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-white text-xl font-bold drop-shadow-md">
                          ✓
                        </span>
                      </div>
                    )}
                  </div>
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
