import Sidebar from "./sidebar";
import Header from "./header";

import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Logout from "../../Common/logoutmodal";
import Loader from "./loader";
import { registerLoaderCallback } from "../../Common/loaderService";
import Chatbot from "../Chatbot/Chatbot";
import axios from "axios";
import "./layout_premium.css";

const Domain = process.env.REACT_APP_API_URL;

function Layout() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  // Used to force Sidebar & Header to re-render after live permissions refresh
  const [permissionsKey, setPermissionsKey] = useState(0);

  // Fetch live group permissions from the server on every app load.
  // This keeps localStorage in sync with any changes made via Group Management
  // (e.g. Super Admin restricting Admin permissions) without requiring re-login.
  useEffect(() => {
    const token = localStorage.getItem("maphytoken");
    if (!token) return;
    axios
      .get(`${Domain}/users/me/permissions`)
      .then((res) => {
        if (res?.data?.permissions !== undefined && res.data.permissions !== null) {
          localStorage.setItem("permissions", JSON.stringify(res.data.permissions));
          // Bump the key so Sidebar & Header re-read localStorage with fresh permissions
          setPermissionsKey((k) => k + 1);
        }
      })
      .catch(() => {
        // Silently ignore — stale localStorage permissions will be used as fallback
      });
  }, []);

  useEffect(() => {
    registerLoaderCallback((isLoading) => {
      setGlobalLoading(isLoading);
    });
    return () => registerLoaderCallback(null);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.pageYOffset / totalHeight) * 100;
        setScrollProgress(progress);
      } else {
        setScrollProgress(0);
      }
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleShowLogoutModal = () => setShowLogoutModal(true);
  const handleCloseLogoutModal = () => setShowLogoutModal(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);



  return (
    <Container fluid className="dashboard-layout-container">
      <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }} />
      {globalLoading && <Loader />}
      <div className={`dashboard-layout ${isSidebarOpen ? "sidebar-mobile-open" : ""} layout-style-sidebar`}>
        {/* Sidebar Navigation */}
        <div className="layout-sidebar-wrapper">
          <Sidebar key={permissionsKey} onLogoutClick={handleShowLogoutModal} closeSidebar={closeSidebar} />
        </div>

        {/* Sidebar Backdrop Overlay on Mobile */}
        {isSidebarOpen && (
          <div className="layout-sidebar-backdrop" onClick={closeSidebar}></div>
        )}

        {/* Main Content Area */}
        <div className="layout-content-wrapper">
          <Header
            key={permissionsKey}
            onLogoutClick={handleShowLogoutModal}
            toggleSidebar={toggleSidebar}
          />
          <div className="layout-page-content">
            <Outlet />
          </div>
        </div>

      </div>
      <Chatbot />
      <Logout show={showLogoutModal} handleClose={handleCloseLogoutModal} />
    </Container>
  );
}

export default Layout;
