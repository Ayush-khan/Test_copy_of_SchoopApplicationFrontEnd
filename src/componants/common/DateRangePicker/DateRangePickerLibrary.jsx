import React, { useState, useEffect } from "react";
import { DateRange } from "react-date-range";
import { format, startOfWeek, endOfWeek } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const DateRangePickerComponent = ({ onDateChange }) => {
  /* 🔐 Prevent timezone issues */
  const safeDate = (date = new Date()) => {
    const d = new Date(date);
    d.setHours(12, 0, 0, 0);
    return d;
  };

  const today = safeDate();
  const formattedToday = format(today, "yyyy-MM-dd");

  const [showPicker, setShowPicker] = useState(false);

  const [dateRange, setDateRange] = useState([
    { startDate: today, endDate: today, key: "selection" },
  ]);

  const [tempDateRange, setTempDateRange] = useState(dateRange);
  const [selectedPreset, setSelectedPreset] = useState("Today");

  /* ✅ Correct preset ranges */
  const presetOptions = [
    {
      label: "Today",
      range: [safeDate(), safeDate()],
    },
    {
      label: "Yesterday",
      range: [
        safeDate(
          new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1),
        ),
        safeDate(
          new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1),
        ),
      ],
    },
    {
      label: "Last 1 Week",
      range: [
        safeDate(
          new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6),
        ),
        safeDate(today),
      ],
    },
    {
      label: "Last 30 Days",
      range: [
        safeDate(
          new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29),
        ),
        safeDate(today),
      ],
    },
    {
      label: "Last 90 Days",
      range: [
        safeDate(
          new Date(today.getFullYear(), today.getMonth(), today.getDate() - 89),
        ),
        safeDate(today),
      ],
    },
    {
      label: "Last 180 Days",
      range: [
        safeDate(
          new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() - 179,
          ),
        ),
        safeDate(today),
      ],
    },
    {
      label: "Last 1 Year",
      range: [
        safeDate(
          new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()),
        ),
        safeDate(today),
      ],
    },
    {
      label: "Custom Range",
      range: null,
    },
  ];

  /* Initial load */
  useEffect(() => {
    onDateChange(formattedToday, formattedToday);
  }, []);

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset.label);

    if (preset.label === "Custom Range") {
      setTempDateRange(dateRange);
    } else {
      setTempDateRange([
        {
          startDate: preset.range[0],
          endDate: preset.range[1],
          key: "selection",
        },
      ]);
    }
  };

  /* ✅ Apply only on button click */
  const handleApply = () => {
    const searchFrom = format(tempDateRange[0].startDate, "yyyy-MM-dd");
    const searchTo = format(tempDateRange[0].endDate, "yyyy-MM-dd");

    setDateRange(tempDateRange);
    onDateChange(searchFrom, searchTo);
    setShowPicker(false);
  };

  const formatDate = (date) => format(date, "MMMM d, yyyy");

  return (
    <div className="relative">
      <div
        className="border border-gray-300 rounded-lg px-4 py-2 cursor-pointer shadow-md bg-white flex items-center gap-2 hover:ring-2 hover:ring-blue-500 transition-all"
        onClick={() => setShowPicker(!showPicker)}
      >
        <span className="text-gray-500">📅</span>
        <span className="text-gray-800">
          {formatDate(dateRange[0].startDate)} -{" "}
          {formatDate(dateRange[0].endDate)}
        </span>
      </div>

      {showPicker && (
        <div className="absolute top-12 left-0 bg-white border rounded-lg shadow-lg z-10 w-full md:w-[70%]">
          <div className="flex flex-col p-3 gap-2">
            {presetOptions.map((preset) => (
              <button
                key={preset.label}
                className={`px-3 py-1 rounded-md ${selectedPreset === preset.label
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-blue-100"
                  }`}
                onClick={() => handlePresetSelect(preset)}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {selectedPreset === "Custom Range" && (
            <div className="absolute top-0 left-full bg-white border rounded-lg shadow-md">
              <DateRange
                onChange={(item) => setTempDateRange([item.selection])}
                ranges={tempDateRange}
                moveRangeOnFirstSelection={false}
                editableDateInputs
              />
            </div>
          )}

          <div className="flex justify-end p-2 border-t gap-2">
            <button
              className="bg-green-500 text-white px-4 py-2 rounded"
              onClick={handleApply}
            >
              Apply
            </button>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded"
              onClick={() => setShowPicker(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePickerComponent;
