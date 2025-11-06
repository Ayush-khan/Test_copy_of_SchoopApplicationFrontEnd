// Simple file
import { useEffect } from "react";
import "./App.css";
import Index from "./router/Index";
import axios from "axios";

function App() {
  // 🧹 Clear caches and unregister service workers for faster fresh loads
  const clearAllCaches = async () => {
    try {
      // 🔹 Clear browser caches (for PWA/Vite/CRA builds)
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
        console.log("✅ App caches cleared");
      }

      // 🔹 Unregister all service workers (to prevent stale assets)
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const reg of regs) await reg.unregister();
        console.log("✅ Service workers unregistered");
      }

      // 🔹 Disable axios caching globally
      axios.defaults.headers.common["Cache-Control"] = "no-cache";
      axios.defaults.headers.common["Pragma"] = "no-cache";
      axios.defaults.headers.common["Expires"] = "0";

      console.log("✅ Axios cache disabled globally");
    } catch (err) {
      console.warn("⚠️ Cache clearing failed:", err);
    }
  };

  // ✅ Run cache clear on initial mount
  useEffect(() => {
    clearAllCaches();
  }, []);

  return <Index />;
}

export default App;
