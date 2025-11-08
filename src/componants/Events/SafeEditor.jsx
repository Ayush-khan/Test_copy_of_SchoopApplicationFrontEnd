import React, { useState } from "react";

// ⚙️ A minimal functional error boundary wrapper
function SafeEditor({ children }) {
  const [hasError, setHasError] = useState(false);

  try {
    if (hasError) {
      return (
        <div style={{ color: "red", padding: "10px" }}>
          ⚠️ Editor failed to load.
        </div>
      );
    }
    return children;
  } catch (err) {
    console.error("Error inside SafeEditor:", err);
    setHasError(true);
    return (
      <div style={{ color: "red", padding: "10px" }}>
        ⚠️ Editor failed to load.
      </div>
    );
  }
}

export default SafeEditor;
