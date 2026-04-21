// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
// });

// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";

// export default defineConfig({
//   plugins: [react()],
//   build: {
//     target: "es2015",
//     minify: "esbuild", // 🔥 change here
//     sourcemap: false,
//     chunkSizeWarningLimit: 1500,

//     rollupOptions: {
//       output: {
//         manualChunks(id) {
//           if (id.includes("node_modules")) {
//             if (id.includes("react")) return "react";
//             if (id.includes("react-dom")) return "react-dom";
//             if (id.includes("axios")) return "axios";
//             return "vendor";
//           }
//         },
//       },
//     },
//   },
// });

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  resolve: {
    dedupe: ["react", "react-dom"],
  },
  build: {
    target: "es2015", // Change this if needed, try "es2015" if esnext doesn't work
    minify: "terser", // Helps avoid modern syntax issues
    // sourcemap: true, // <-- ADD THIS
    // minify: 'esbuild',   // 🔥 IMPORTANT

    sourcemap: false, // 🔕 stops sourcemap warnings
    chunkSizeWarningLimit: 3000,
  },
});
