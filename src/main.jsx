import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "bootstrap/dist/css/bootstrap.css";
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
// for tabwise token wrk fine.. resolve issues
// import ReactDOM from "react-dom/client";
// import App from "./App.jsx";
// import "./index.css";
// import "bootstrap/dist/css/bootstrap.css";
// import { BrowserRouter } from "react-router-dom";
// window.addEventListener("beforeunload", () => {
//   localStorage.removeItem("authToken");
// });

// Give each tab a unique ID
// if (!sessionStorage.getItem("tabId")) {
//   sessionStorage.setItem("tabId", Date.now().toString());
// }
// const tabId = sessionStorage.getItem("tabId");
// (function () {
//   const originalSetItem = localStorage.setItem;
//   const originalGetItem = localStorage.getItem;

//   // Store token per tab
//   localStorage.setItem = function (key, value) {
//     if (key === "authToken") {
//       return originalSetItem.call(localStorage, `authToken_${tabId}`, value);
//     }
//     return originalSetItem.call(localStorage, key, value);
//   };

//   // Retrieve token per tab
//   localStorage.getItem = function (key) {
//     if (key === "authToken") {
//       return originalGetItem.call(localStorage, `authToken_${tabId}`);
//     }
//     return originalGetItem.call(localStorage, key);
//   };
// })();

// // ---------------- Step 3: Render React App ----------------
// ReactDOM.createRoot(document.getElementById("root")).render(
//   <BrowserRouter>
//     <App />
//   </BrowserRouter>
// );
