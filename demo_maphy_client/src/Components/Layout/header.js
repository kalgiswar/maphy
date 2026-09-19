import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import settings from "../../images/settings-gears.png";
import down from "../../images/down.png";
import logout from "../../images/power-off.png";
import lock from "../../images/lock.png";
import clients from "../../images/clients.png";
import { useTranslation } from "react-i18next";
import { jwtDecode } from "jwt-decode";
import { Modal, Button, Row, Col, Form } from "react-bootstrap";
import axios from "axios";
import { showLoader } from "../../Common/loaderService";


const Domain = process.env.REACT_APP_API_URL;

const Header = ({ onLogoutClick, toggleSidebar }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("maphytoken");
  const decoded = jwtDecode(token);
  const loggedUsername = decoded?.firstName;

  const [isLogoutVisible, setIsLogoutVisible] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const userpermission = JSON.parse(localStorage.getItem("permissions"));

  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(localStorage.getItem("selectedBranchId") || "all");

  // Organization switcher for Super Admin
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(localStorage.getItem("selectedOrgId") || "all");

  const isSuper = userpermission?.superuser === "1" || userpermission?.superuser === 1 || userpermission?.superuser === true || userpermission?.superuser === "true";
  const isAdmin = userpermission?.admin === true || userpermission?.admin === "1" || userpermission?.admin === 1 || userpermission?.admin === "true";
  const hasBranchesDropdown = userpermission?.branches_dropdown === true;
  const canManageGroups = userpermission?.edit_group_permissions === true;
  const showBranchSelector = isSuper || (!isAdmin && hasBranchesDropdown);

  useEffect(() => {
    if (showBranchSelector) {
      axios.get(`${Domain}/locations/selectList?page=1`)
        .then(response => {
          if (response.data && response.data.items) {
            setBranches(response.data.items);
          }
        })
        .catch(err => console.error("Error loading branches list:", err));
    }
  }, [showBranchSelector]);

  // Fetch organizations for Super Admin
  useEffect(() => {
    if (isSuper) {
      axios.get(`${Domain}/register/firms/selectList`)
        .then(response => {
          if (response.data && response.data.items) {
            setOrganizations(response.data.items);
          }
        })
        .catch(err => console.error("Error loading organizations list:", err));
    }
  }, [isSuper]);

  const handleBranchChange = (e) => {
    const val = e.target.value;
    setSelectedBranch(val);
    localStorage.setItem("selectedBranchId", val);
    showLoader();
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleOrgChange = (e) => {
    const val = e.target.value;
    setSelectedOrg(val);
    localStorage.setItem("selectedOrgId", val);
    // Also save the org name so other pages (e.g. Groups) can display which org is active
    const selectedOrgObj = organizations && organizations.find(o => String(o.id) === String(val));
    localStorage.setItem("selectedOrgName", selectedOrgObj ? (selectedOrgObj.text || selectedOrgObj.name || "") : "");
    if (val === "all") {
      localStorage.setItem("selectedBranchId", "all");
      setSelectedBranch("all");
    }
    showLoader();
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleMyProfileClick = async () => {
    setIsLogoutVisible(false);
    setShowProfileModal(true);
    setLoadingProfile(true);
    try {
      const response = await axios.get(`${Domain}/users/${decoded.userId}`);
      setProfileData(response.data);
    } catch (error) {
      console.error("Error fetching profile details:", error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const getRoleLabel = (profile) => {
    if (profile.permissions?.superuser === "1" || profile.permissions?.superuser === 1) {
      return "Super Admin";
    }
    const groupName = profile.groups?.rows?.[0]?.name || "";
    if (groupName.toLowerCase().includes("super")) {
      return "Super Admin";
    }
    if (groupName.toLowerCase().includes("admin")) {
      return "Admin";
    }
    if (profile.permissions?.admin === true || profile.permissions?.admin === "1" || profile.permissions?.admin === 1) {
      return "Admin";
    }
    return "Manager";
  };

  const handleChangePasswordClick = () => {
    setIsLogoutVisible(false);
    navigate("/forgotPassword");
  };

  const handleLogoutClick = () => {
    setIsLogoutVisible(false);
    onLogoutClick();
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsLogoutVisible(!isLogoutVisible);
  };

  useEffect(() => {
    setIsLogoutVisible(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".user-profile-menu")) {
        setIsLogoutVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="header">
      <div className="d-flex justify-content-between align-items-center w-100">
        <div className="d-flex align-items-center">
          <button className="sidebar-toggle-btn" onClick={toggleSidebar} aria-label="Toggle navigation">
            <span className="hamburger-icon"></span>
          </button>
        </div>
        <div className="d-flex align-items-center header-right">
          {isSuper && (
            <div className="org-selector-wrapper me-3">
              <Form.Select
                value={selectedOrg}
                onChange={handleOrgChange}
                className="org-select-input premium-select"
                style={{
                  minWidth: "180px",
                  borderRadius: "8px",
                  border: "1px solid #ced4da",
                  fontSize: "14px",
                  padding: "6px 12px",
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)"
                }}
              >
                <option value="all">All Organizations</option>
                {organizations && Array.isArray(organizations) && organizations
                  .filter(org => org.id !== 1 && org.id !== '1' && org.text?.toLowerCase() !== 'maphy corp' && org.name?.toLowerCase() !== 'maphy corp')
                  .map(org => (
                    <option key={org.id} value={org.id}>{org.text || org.name}</option>
                  ))}
              </Form.Select>
            </div>
          )}

          {(!isSuper && showBranchSelector) && (
            <div className="branch-selector-wrapper me-3">
              <Form.Select
                value={selectedBranch}
                onChange={handleBranchChange}
                className="branch-select-input premium-select"
                style={{
                  minWidth: "180px",
                  borderRadius: "8px",
                  border: "1px solid #ced4da",
                  fontSize: "14px",
                  padding: "6px 12px",
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)"
                }}
              >
                <option value="all">All Branches</option>
                {branches && Array.isArray(branches) && branches.map(branch => (
                  <option key={branch.id} value={branch.id}>{branch.text || branch.name}</option>
                ))}
              </Form.Select>
            </div>
          )}


          {(isSuper || isAdmin || canManageGroups) && (
            <Link to="/adminsetting">
              <img src={settings} alt="setting" className="me-3" />
            </Link>
          )}
          <div
            className="user-profile-menu"
            style={{ position: "relative" }}
          >
            <div
              className="d-flex align-items-center"
              onClick={toggleDropdown}
              style={{ cursor: "pointer" }}
            >
              <h4 className="username">{loggedUsername}</h4>
              <img
                src={down}
                alt="profile"
                style={{
                  transform: isLogoutVisible ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s ease"
                }}
              />
            </div>
            {isLogoutVisible && (
              <div className="arrow header_fontsize">
                <div className="option" onClick={handleMyProfileClick}>
                  <img
                    src={clients}
                    alt="My Profile"
                    className="header-img me-1"
                    style={{ width: "16px", height: "16px" }}
                  />
                  {t("button.myprofile")}
                </div>
                <div className="option" onClick={handleChangePasswordClick}>
                  <img
                    src={lock}
                    alt="Change Password"
                    className="header-img me-1"
                  />
                  {t("button.changepassword")}
                </div>
                <div className="option mb-1 logout-option" onClick={handleLogoutClick}>
                  <img src={logout} alt="Logout" className="me-1" />
                  {t("button.logout")}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        show={showProfileModal}
        onHide={() => setShowProfileModal(false)}
        centered
        size="lg"
        dialogClassName="premium-profile-modal"
      >
        <Modal.Header closeButton style={{ borderBottom: "none", background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)", color: "#fff" }}>
          <Modal.Title>{t("profile.title")}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4" style={{ backgroundColor: "#f8f9fa" }}>
          {loadingProfile ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : profileData ? (
            <div>
              {/* Profile Card Header Banner */}
              <div className="d-flex align-items-center mb-4 p-3 bg-white rounded shadow-sm">
                <div className="profile-avatar-placeholder d-flex justify-content-center align-items-center rounded-circle bg-primary text-white font-weight-bold" style={{ width: "70px", height: "70px", fontSize: "28px" }}>
                  {profileData.first_name ? profileData.first_name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="ms-3">
                  <h4 className="mb-1" style={{ color: "#333", fontWeight: "600" }}>{profileData.name}</h4>
                  <p className="mb-0 text-muted" style={{ fontSize: "14px" }}>
                    <strong>{t("profile.role")}:</strong> <span className="badge bg-info text-dark">{getRoleLabel(profileData)}</span>
                  </p>
                </div>
              </div>

              <Row className="g-3">
                {/* Personal Information */}
                <Col md={6}>
                  <div className="p-3 bg-white rounded shadow-sm h-100">
                    <h5 className="mb-3 text-primary" style={{ fontSize: "16px", borderBottom: "2px solid #e9ecef", paddingBottom: "8px" }}>
                      {t("profile.personalInfo")}
                    </h5>
                    <div className="mb-2">
                      <span className="text-muted d-block" style={{ fontSize: "12px" }}>Username</span>
                      <span style={{ fontWeight: "500" }}>{profileData.username || "-"}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-muted d-block" style={{ fontSize: "12px" }}>Email</span>
                      <span style={{ fontWeight: "500" }}>{profileData.email || "-"}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-muted d-block" style={{ fontSize: "12px" }}>Job Title</span>
                      <span style={{ fontWeight: "500" }}>{profileData.jobtitle || "-"}</span>
                    </div>
                  </div>
                </Col>

                {/* Organization Info */}
                <Col md={6}>
                  <div className="p-3 bg-white rounded shadow-sm h-100">
                    <h5 className="mb-3 text-primary" style={{ fontSize: "16px", borderBottom: "2px solid #e9ecef", paddingBottom: "8px" }}>
                      {t("profile.organizationInfo")}
                    </h5>
                    <div className="mb-2">
                      <span className="text-muted d-block" style={{ fontSize: "12px" }}>Company</span>
                      <span style={{ fontWeight: "500" }}>{profileData.company?.name || "-"}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-muted d-block" style={{ fontSize: "12px" }}>Department</span>
                      <span style={{ fontWeight: "500" }}>{profileData.department?.name || "-"}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-muted d-block" style={{ fontSize: "12px" }}>Group</span>
                      <span style={{ fontWeight: "500" }}>
                        {profileData.groups?.rows?.map(g => g.name).join(", ") || "-"}
                      </span>
                    </div>
                  </div>
                </Col>

                {/* Contact Info */}
                <Col md={12}>
                  <div className="p-3 bg-white rounded shadow-sm">
                    <h5 className="mb-3 text-primary" style={{ fontSize: "16px", borderBottom: "2px solid #e9ecef", paddingBottom: "8px" }}>
                      {t("profile.contactInfo")}
                    </h5>
                    <Row>
                      <Col md={6} className="mb-2">
                        <span className="text-muted d-block" style={{ fontSize: "12px" }}>Phone</span>
                        <span style={{ fontWeight: "500" }}>{profileData.phone || "-"}</span>
                      </Col>
                      <Col md={6} className="mb-2">
                        <span className="text-muted d-block" style={{ fontSize: "12px" }}>Location</span>
                        <span style={{ fontWeight: "500" }}>{profileData.location?.name || "-"}</span>
                      </Col>
                      <Col md={12} className="mb-2">
                        <span className="text-muted d-block" style={{ fontSize: "12px" }}>Address</span>
                        <span style={{ fontWeight: "500" }}>
                          {[profileData.address, profileData.city, profileData.state, profileData.country, profileData.zip].filter(Boolean).join(", ") || "-"}
                        </span>
                      </Col>
                    </Row>
                  </div>
                </Col>
              </Row>
            </div>
          ) : (
            <div className="text-center py-5 text-muted">Failed to load profile.</div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ borderTop: "none", backgroundColor: "#f8f9fa" }}>
          <Button variant="secondary" onClick={() => setShowProfileModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Header;
