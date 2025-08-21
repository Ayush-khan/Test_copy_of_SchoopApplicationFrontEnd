import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
import LoaderStyle from "../../componants/common/LoaderFinal/LoaderStyle";

function BackgroundChanger() {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [activeColorId, setActiveColorId] = useState(null);
  const [flatColors, setFlatColors] = useState([]);
  const [gradientColors, setGradientColors] = useState([]);
  const [selectedColorCode, setSelectedColorCode] = useState("");
  const [selectedColorType, setSelectedColorType] = useState("");
  const [selectedColorId, setSelectedColorId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    await fetchActiveBackground(); // 1. Get active background color
    await fetchAllColors(); // 2. Load all colors
    setIsFetching(false);
  };

  const fetchActiveBackground = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      };
      const res = await axios.get(
        `${API_URL}/api/get_activebackgroundcolor`,
        config
      );
      const active = res?.data?.data?.[0];
      if (active) {
        setActiveColorId(active.background_color_id); // <-- new line
        setSelectedColorId(active.background_color_id);
        setSelectedColorCode(active.color_code);
        setSelectedColorType(
          active.color_category === "flat_color" ? "flat" : "gradient"
        );
        localStorage.setItem("background", active.color_code);
      }
    } catch (err) {
      console.error("Error fetching active background:", err.message);
    }
  };

  const fetchAllColors = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      };

      const response = await axios.get(
        `${API_URL}/api/get_allbackgoundcolor`,
        config
      );
      const { flat_colors, gradient_color } = response?.data?.data || {};
      setFlatColors(flat_colors || []);
      setGradientColors(gradient_color || []);
    } catch (err) {
      console.error("Failed to load background colors:", err.message);
    }
  };

  const applyBackground = async () => {
    if (!selectedColorId) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      };

      await axios.put(
        `${API_URL}/api/update_backgroundcoloractive/${selectedColorId}`,
        { background_color_id: selectedColorId },
        config
      );

      localStorage.setItem("background", selectedColorCode);
      window.location.reload();
    } catch (err) {
      console.error("Error applying background:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderColorButton = (color, type) => {
    const isSelected = selectedColorCode === color.color_code;
    const heightClass = "h-10";

    return (
      <div key={color.background_color_id} className="relative group">
        <button
          onClick={() => {
            setSelectedColorCode(color.color_code);
            setSelectedColorType(type);
            setSelectedColorId(color.background_color_id);
          }}
          style={{ background: color.color_code }}
          className={`w-full ${heightClass} rounded-md transition-all duration-300 border-2 ${
            isSelected
              ? "scale-105 ring-4 ring-blue-400 border-white shadow-lg"
              : "hover:scale-105 hover:ring-2 hover:ring-gray-400 border-transparent"
          }`}
          title={color.name}
        />
        {isSelected && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-white text-lg font-bold drop-shadow-lg">
              ✓
            </span>
          </div>
        )}
      </div>
    );
  };

  const ApplyButton = ({ type }) => {
    const isApplicable =
      selectedColorType === type &&
      selectedColorId &&
      selectedColorId !== activeColorId;

    return (
      <button
        onClick={applyBackground}
        disabled={!isApplicable || isLoading}
        className={`px-4 py-1 text-sm rounded-full transition-all duration-200 shadow ${
          isApplicable
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-blue-600 text-white hover:bg-blue-700 "
        } ${isLoading ? "opacity-60" : ""}`}
      >
        {isLoading && isApplicable ? "Applying..." : "Apply"}
      </button>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 mt-10 bg-white bg-opacity-95 rounded-xl shadow-xl relative">
      {/* Header */}
      <div className="flex justify-between items-center ">
        <h3 className="text-gray-800 text-xl font-semibold">
          🎨 Background Color Picker
        </h3>
        <RxCross1
          className="text-3xl text-red-600 cursor-pointer hover:bg-red-100 rounded-full p-1"
          onClick={() => navigate("/dashboard")}
        />
      </div>
      <div className="h-1 w-full mb-6 bg-pink-600 rounded"></div>

      {isFetching ? (
        <div className="flex justify-center items-center h-64">
          <LoaderStyle />
        </div>
      ) : (
        // SHOW THIS ONLY WHEN NOT FETCHING
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Solid Colors */}
          <div className="flex-1 bg-gray-50 p-4 rounded-xl shadow-inner border">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-500">
                Solid Colors
              </h2>
              <ApplyButton type="flat" />
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {flatColors.map((color) => renderColorButton(color, "flat"))}
            </div>
          </div>

          {/* Gradient Colors */}
          <div className="flex-1 bg-gray-50 p-4 rounded-xl shadow-inner border">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-500">
                Gradient Colors
              </h2>
              <ApplyButton type="gradient" />
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {gradientColors.map((color) =>
                renderColorButton(color, "gradient")
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BackgroundChanger;
