import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

const GrandChildMenu = ({ anchorRef, items, onClose }) => {
  const [coords, setCoords] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top + 120, // ✅ Slightly below
        left: rect.right + 865, // ✅ Right aligned
      });
    }
  }, [anchorRef]);

  if (!coords) return null;

  return createPortal(
    <div
      style={{
        position: "absolute",
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        backgroundColor: "white",
        border: "1px solid #ccc",
        zIndex: 9999,
        minWidth: "200px",
        maxHeight: "300px",
        overflowY: "auto",
        borderRadius: "4px",
        boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
      }}
      onMouseLeave={onClose}
    >
      {items.map((item) => (
        <div
          key={item.menu_id}
          className="px-4 py-2 text-sm text-gray-800 hover:bg-pink-100 hover:text-pink-700 cursor-pointer transition-all"
          onClick={() => {
            navigate(item.url);
            onClose();
          }}
        >
          {item.name}
        </div>
      ))}
    </div>,
    document.body
  );
};

export default GrandChildMenu;
