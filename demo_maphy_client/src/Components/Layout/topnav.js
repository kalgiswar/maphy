import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import clients from "../../images/clients.png";
import dashboard from "../../images/dashboard.png";
import downarrow from "../../images/arrow-down.png";
import settings from "../../images/settings.png";
import FloppyDisk from "../../images/floppy-disk.png";
import Waterdrop from "../../images/waterdrop.png";
import Keyboard from "../../images/keyboard.png";
import History from "../../images/history.png";
import Menu from "../../images/menu-of-three-lines.png";
import List from "../../images/list.png";
import Barcode from "../../images/barcode.png";
import Hdd from "../../images/hdd.png";
import ticket from "../../images/ticket.png";
import { useTranslation } from "react-i18next";

const TopNav = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const userpermission = JSON.parse(localStorage.getItem("permissions"));
  const [activeDropdown, setActiveDropdown] = useState(null);

  const isSuper = userpermission?.superuser === "1" || userpermission?.superuser === 1 || userpermission?.superuser === true || userpermission?.superuser === "true";

  // Compute whether the current user can see the Settings dropdown
  // (same logic as sidebar.js — any one settings-related permission is enough)
  const canViewSettings = [
    "companiesview",
    "locationsview",
    "departmentsview",
    "categoriesview",
    "manufacturersview",
    "suppliersview",
    "modelsview",
    "depreciationsview",
    "statuslabelsview"
  ].some((perm) => userpermission?.[perm]);

  const handleMenuClick = (link) => {
    sessionStorage.removeItem("onboarding_active");
    setActiveDropdown(null);
    if (link) {
      navigate(link);
    }
  };

  const toggleDropdown = (dropdownName) => {
    if (activeDropdown === dropdownName) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(dropdownName);
    }
  };

  // ========== SUPER ADMIN TOP NAV ==========
  if (isSuper) {
    return (
      <div className="top-nav-bar">
        <div className="top-nav-container">
          <ul className="top-nav-menu">
            <li className="top-nav-item">
              <Link to="/dashboard" onClick={() => handleMenuClick("/dashboard")}>
                <img src={dashboard} alt="Dashboard" className="top-nav-icon" />
                {t("app.dashboard")}
              </Link>
            </li>
            <li className="top-nav-item">
              <Link to="/organizations" onClick={() => handleMenuClick("/organizations")}>
                <img src={clients} alt="Organizations" className="top-nav-icon" />
                Organizations
              </Link>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="top-nav-bar">
      <div className="top-nav-container">
        <ul className="top-nav-menu">
          {/* Dashboard */}
          <li className="top-nav-item">
            <Link to="/dashboard" onClick={() => handleMenuClick("/dashboard")}>
              <img src={dashboard} alt="Dashboard" className="top-nav-icon" />
              {t("app.dashboard")}
            </Link>
          </li>

          {/* Settings Dropdown — visible to anyone with at least one settings permission */}
          {canViewSettings && (
            <li 
              className={`top-nav-item has-dropdown ${activeDropdown === "settings" ? "active" : ""}`}
              onMouseEnter={() => toggleDropdown("settings")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <span className="dropdown-trigger">
                <img src={settings} alt="Settings" className="top-nav-icon" />
                {t("app.settings")}
                <img src={downarrow} alt="arrow" className="dropdown-arrow" />
              </span>
              <ul className="top-nav-dropdown">
                {userpermission?.companiesview && (
                  <li><Link to="/company" onClick={() => handleMenuClick("/company")}>{t("app.companies")}</Link></li>
                )}
                {userpermission?.locationsview && (
                  <li><Link to="/location" onClick={() => handleMenuClick("/location")}>{t("app.location")}</Link></li>
                )}
                {userpermission?.departmentsview && (
                  <li><Link to="/department" onClick={() => handleMenuClick("/department")}>{t("app.departments")}</Link></li>
                )}
                {userpermission?.categoriesview && (
                  <li><Link to="/categories" onClick={() => handleMenuClick("/categories")}>{t("app.categories")}</Link></li>
                )}
                {userpermission?.manufacturersview && (
                  <li><Link to="/manufactures" onClick={() => handleMenuClick("/manufactures")}>{t("app.manufacturers")}</Link></li>
                )}
                {userpermission?.suppliersview && (
                  <li><Link to="/vendors" onClick={() => handleMenuClick("/vendors")}>{t("app.vendors")}</Link></li>
                )}
                {userpermission?.modelsview && (
                  <li><Link to="/assetmodels" onClick={() => handleMenuClick("/assetmodels")}>{t("app.assetmodels")}</Link></li>
                )}
                {userpermission?.depreciationsview && (
                  <li><Link to="/depreciation" onClick={() => handleMenuClick("/depreciation")}>{t("app.depreciations")}</Link></li>
                )}
                {userpermission?.statuslabelsview && (
                  <li><Link to="/statusLabels" onClick={() => handleMenuClick("/statusLabels")}>{t("app.statuslabels")}</Link></li>
                )}
              </ul>
            </li>
          )}

          {/* Assets Dropdown */}
          {userpermission?.assetsview && (
            <li 
              className={`top-nav-item has-dropdown ${activeDropdown === "assets" ? "active" : ""}`}
              onMouseEnter={() => toggleDropdown("assets")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <span className="dropdown-trigger">
                <img src={Barcode} alt="Assets" className="top-nav-icon" />
                {t("app.assets")}
                <img src={downarrow} alt="arrow" className="dropdown-arrow" />
              </span>
              <ul className="top-nav-dropdown">
                <li><Link to="/assets" onClick={() => handleMenuClick("/assets")}>{t("app.listall")}</Link></li>
                <li><Link to="/rtd" onClick={() => handleMenuClick("/rtd")}>{t("app.deployable")}</Link></li>
                <li><Link to="/deployed" onClick={() => handleMenuClick("/deployed")}>{t("app.deployed")}</Link></li>
                <li><Link to="/undeployable" onClick={() => handleMenuClick("/undeployable")}>{t("app.undeployed")}</Link></li>
                <li><Link to="/assetMaintenance" onClick={() => handleMenuClick("/assetMaintenance")}>{t("app.assetmaintenances")}</Link></li>
                <li><Link to="/bulkcheckout" onClick={() => handleMenuClick("/bulkcheckout")}>{t("app.bulkcheckout")}</Link></li>
                <li><Link to="/assets/pending-agent" onClick={() => handleMenuClick("/assets/pending-agent")}>{t("app.pendingagentassets")}</Link></li>
              </ul>
            </li>
          )}

          {/* Licenses */}
          {userpermission?.licensesview && (
            <li className="top-nav-item">
              <Link to="/license" onClick={() => handleMenuClick("/license")}>
                <img src={FloppyDisk} alt="Licenses" className="top-nav-icon" />
                {t("app.licenses")}
              </Link>
            </li>
          )}

          {/* Accessories */}
          {userpermission?.accessoriesview && (
            <li className="top-nav-item">
              <Link to="/accessories" onClick={() => handleMenuClick("/accessories")}>
                <img src={Keyboard} alt="Accessories" className="top-nav-icon" />
                {t("app.accessories")}
              </Link>
            </li>
          )}

          {/* Consumables */}
          {userpermission?.consumablesview && (
            <li className="top-nav-item">
              <Link to="/consumables" onClick={() => handleMenuClick("/consumables")}>
                <img src={Waterdrop} alt="Consumables" className="top-nav-icon" />
                {t("app.consumables")}
              </Link>
            </li>
          )}

          {/* Components */}
          {userpermission?.componentsview && (
            <li className="top-nav-item">
              <Link to="/components" onClick={() => handleMenuClick("/components")}>
                <img src={Hdd} alt="Components" className="top-nav-icon" />
                {t("app.components")}
              </Link>
            </li>
          )}

          {/* Reports Dropdown */}
          {userpermission?.reportview && (
            <li 
              className={`top-nav-item has-dropdown ${activeDropdown === "reports" ? "active" : ""}`}
              onMouseEnter={() => toggleDropdown("reports")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <span className="dropdown-trigger">
                <img src={Menu} alt="Reports" className="top-nav-icon" />
                {t("app.reports")}
                <img src={downarrow} alt="arrow" className="dropdown-arrow" />
              </span>
              <ul className="top-nav-dropdown">
                <li><Link to="/accessoryreports" onClick={() => handleMenuClick("/accessoryreports")}>{t("app.accessoryreports")}</Link></li>
                <li><Link to="/activityreport" onClick={() => handleMenuClick("/activityreport")}>{t("app.activityreports")}</Link></li>
                <li><Link to="/licensereport" onClick={() => handleMenuClick("/licensereport")}>{t("app.licensereports")}</Link></li>
                <li><Link to="/depreciationreport" onClick={() => handleMenuClick("/depreciationreport")}>{t("app.depreciationreports")}</Link></li>
                <li><Link to="/componentreport" onClick={() => handleMenuClick("/componentreport")}>{t("app.componentsreports")}</Link></li>
                <li><Link to="/consumablereport" onClick={() => handleMenuClick("/consumablereport")}>{t("app.consumablereports")}</Link></li>
                <li><Link to="/assetreport" onClick={() => handleMenuClick("/assetreport")}>{t("app.hardwarereports")}</Link></li>
              </ul>
            </li>
          )}

          {/* More Actions Dropdown */}
          <li 
            className={`top-nav-item has-dropdown ${activeDropdown === "more" ? "active" : ""}`}
            onMouseEnter={() => toggleDropdown("more")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <span className="dropdown-trigger">
              <img src={List} alt="More" className="top-nav-icon" />
              More
              <img src={downarrow} alt="arrow" className="dropdown-arrow" />
            </span>
            <ul className="top-nav-dropdown">
              {userpermission?.usersview && (
                <li><Link to="/peoples" onClick={() => handleMenuClick("/peoples")}><img src={clients} alt="" width="14" className="me-2"/>{t("app.people")}</Link></li>
              )}
              <li><Link to="/tickets" onClick={() => handleMenuClick("/tickets")}><img src={ticket} alt="" width="14" className="me-2"/>{t("app.helpdesk")}</Link></li>
              <li><Link to="/workstatus" onClick={() => handleMenuClick("/workstatus")}><img src={List} alt="" width="14" className="me-2"/>{t("app.workstatus")}</Link></li>
              <li><Link to="/scrapsale" onClick={() => handleMenuClick("/scrapsale")}><img src={List} alt="" width="14" className="me-2"/>{t("app.scrapsale")}</Link></li>
              <li><Link to="/audit" onClick={() => handleMenuClick("/audit")}><img src={History} alt="" width="14" className="me-2"/>{t("app.audit")}</Link></li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TopNav;
