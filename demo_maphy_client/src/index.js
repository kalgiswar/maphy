import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./scss/variable.scss";
import { showLoader, hideLoader } from "./Common/loaderService";

const root = ReactDOM.createRoot(document.getElementById("root"));

axios.interceptors.request.use(
  (config) => {
    // Check if it is a search query to avoid showing the loading spinner block
    const isSearchRequest = config.url && (
      config.url.includes("search=") || 
      (config.params && config.params.search)
    );
    if (isSearchRequest) {
      config.bypassLoader = true;
    }

    if (!config.bypassLoader) {
      showLoader();
    }

    const token = localStorage.getItem("maphytoken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    const selectedBranch = localStorage.getItem("selectedBranchId");
    if (selectedBranch && selectedBranch !== "all") {
      config.headers["X-Selected-Branch"] = selectedBranch;
    }
    const selectedOrg = localStorage.getItem("selectedOrgId");
    if (selectedOrg && selectedOrg !== "all") {
      config.headers["X-Selected-Org"] = selectedOrg;
    }
    return config;
  },
  (error) => {
    if (!error.config?.bypassLoader) {
      hideLoader();
    }
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (res) => {
    if (!res.config?.bypassLoader) {
      hideLoader();
    }
    if (res?.status === 201) {
      console.log("Posted Successfully");
    }
    return res;
  },
  (err) => {
    if (!err.config?.bypassLoader) {
      hideLoader();
    }
    // 401 = token missing or invalid → must re-authenticate
    // 402 = payment required (used for licence expiry in some flows)
    // 403 = forbidden (user is authenticated but lacks permission for THIS resource)
    //       → do NOT redirect to login; let each call handle it via try/catch
    if (err?.response?.status === 401 || err?.response?.status === 402) {
      localStorage.clear();
      window.location.assign("/login");
    }
    return Promise.reject(err);
  }
);

root.render(
  //<React.StrictMode>
  <>
    <ToastContainer />
    <App />
  </>
  //</React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// Intercept search form submissions globally to trigger search on Enter key without page reload
document.addEventListener("submit", (e) => {
  const form = e.target;
  const searchInput = form.querySelector('input.search, input[name="search"], input[placeholder*="search" i]');
  if (searchInput) {
    e.preventDefault();
    const searchButton = form.querySelector('button.icon, .icon, button[title*="search" i]');
    if (searchButton) {
      searchButton.click();
    }
  }
});

