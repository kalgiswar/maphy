import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import clients from "../../images/clients.png";
import dashboard from "../../images/dashboard.png";
import downarrow from "../../images/arrow-down.png";
import settings from "../../images/settings.png";
import logoWhite from "../../images/applify-logo-white.png";
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

const Sidebar = ({ onLogoutClick, closeSidebar }) => {
  const { t } = useTranslation();
  const [expandedMenu, setExpandedMenu] = useState(1);
  const [selectedMainMenu, setSelectedMainMenu] = useState(null);
  const [selectedSubMenu, setSelectedSubMenu] = useState(null);
  const navigate = useNavigate();
  const userpermission = JSON.parse(localStorage.getItem("permissions"));

  const isSuper = userpermission?.superuser === "1" || userpermission?.superuser === 1 || userpermission?.superuser === true || userpermission?.superuser === "true";
  const selectedOrgId = localStorage.getItem("selectedOrgId");
  const isOrgSelected = selectedOrgId && selectedOrgId !== "all";
  const showOrgSidebar = isSuper && !isOrgSelected;

  const canViewSettings = isSuper || [
    "companiesview",
    "locationsview",
    "departmentsview",
    "categoriesview",
    "manufacturersview",
    "suppliersview",
    "modelsview",
    "depreciationsview",
    "statuslabelsview"
  ].some((permission) => userpermission?.[permission]);

  const handleMenuClick = (menuIndex, link) => {
    sessionStorage.removeItem("onboarding_active");
    if (expandedMenu === menuIndex) {
      setExpandedMenu(null);
    } else {
      setExpandedMenu(menuIndex);
    }
    setSelectedMainMenu(menuIndex);
    setSelectedSubMenu(null);
    if (link) {
      navigate(link);
      if (closeSidebar) closeSidebar();
    }
  };

  const handleSubMenuClick = (event, mainMenuIndex, subMenuIndex, link) => {
    event.stopPropagation();
    sessionStorage.removeItem("onboarding_active");
    setSelectedMainMenu(mainMenuIndex);
    setExpandedMenu(mainMenuIndex);
    setSelectedSubMenu(subMenuIndex);
    if (link) {
      navigate(link);
      if (closeSidebar) closeSidebar();
    }
  };

  // ========== SUPER ADMIN SIDEBAR ==========
  if (showOrgSidebar) {
    return (
      <div className="sidebar">
        <div className="sidebar-logo-container">
          <img src={logoWhite} alt="shriram" width={150} height={30} />
          <h6 className="logo-text">{t("login.Lifecycle")}</h6>
          <h6 className="logotext">{t("login.Management")}</h6>
        </div>
        <ul className="mb-2 menu">
          {/* Dashboard */}
          <li
            className={`px-1 ${selectedMainMenu === "Dashboard" ? "selected" : ""}`}
            onClick={() => handleMenuClick("Dashboard", "/dashboard")}
          >
            <Link to="/dashboard">
              <img src={dashboard} alt="Dashboard" /> {t("app.dashboard")}
            </Link>
          </li>

          {/* Organizations */}
          <li
            className={`px-1 ${selectedMainMenu === "organizations" ? "selected" : ""}`}
            onClick={() => handleMenuClick("organizations", "/organizations")}
          >
            <Link to="/organizations">
              <img src={clients} alt="Organizations" /> Organizations
            </Link>
          </li>
        </ul>
      </div>
    );
  }

  // ========== ADMIN / MANAGER SIDEBAR (unchanged) ==========
  return (
    <div className="sidebar">
      <div className="sidebar-logo-container">
        <img src={logoWhite} alt="shriram" width={150} height={30} />
        <h6 className="logo-text">{t("login.Lifecycle")}</h6>
        <h6 className="logotext">{t("login.Management")}</h6>
      </div>
      <ul className="mb-2 menu">
        <li
          className={`px-1 ${selectedMainMenu === "Dashboard" ? "selected" : ""
            }`}
          onClick={() => handleMenuClick("Dashboard", "/dashboard")}
        >
          <Link to="Dashboard">
            <img src={dashboard} alt="Dashboard" /> {t("app.dashboard")}
          </Link>
        </li>
        {isSuper && (
          <li
            className={`px-1 ${selectedMainMenu === "organizations" ? "selected" : ""}`}
            onClick={() => handleMenuClick("organizations", "/organizations")}
          >
            <Link to="/organizations">
              <img src={clients} alt="Organizations" /> Organizations
            </Link>
          </li>
        )}
        {canViewSettings && (
          <li
            className={`px-1 ${expandedMenu === 1 ? "expanded" : ""} ${selectedMainMenu === 1 ? "selected" : ""
              }`}
            onClick={() => handleMenuClick(1)}
          >
            <Link to="#">
              <img src={settings} alt="Properties" /> {t("app.settings")}
              <svg className="sidebar-caret" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </Link>
            <ul className="submenu">
              {(isSuper || userpermission?.companiesview) && (
                <li
                  className={`px-1 ${selectedSubMenu === "Company" ? "selected" : ""
                    }`}
                  onClick={(e) =>
                    handleSubMenuClick(e, 1, "Company", "/company")
                  }
                >
                  <Link to="/company"> {t("app.companies")}</Link>
                </li>
              )}
              {(isSuper || userpermission?.locationsview) && (
                <li
                  className={`px-1 ${selectedSubMenu === "Location" ? "selected" : ""
                    }`}
                  onClick={(e) =>
                    handleSubMenuClick(e, 1, "Location", "/location")
                  }
                >
                  <Link to="/location"> {t("app.location")} </Link>
                </li>
              )}
              {(isSuper || userpermission?.departmentsview) && (
                <li
                  className={`px-1 ${selectedSubMenu === "Departments" ? "selected" : ""
                    }`}
                  onClick={(e) =>
                    handleSubMenuClick(e, 1, "Departments", "/department")
                  }
                >
                  <Link to="/department"> {t("app.departments")}</Link>
                </li>
              )}
              {(isSuper || userpermission?.categoriesview) && (
                <li
                  className={`px-1 ${selectedSubMenu === "Categories" ? "selected" : ""
                    }`}
                  onClick={(e) =>
                    handleSubMenuClick(e, 1, "Categories", "/categories")
                  }
                >
                  <Link to="/categories"> {t("app.categories")} </Link>
                </li>
              )}
              {(isSuper || userpermission?.manufacturersview) && (
                <li
                  className={`px-1 ${selectedSubMenu === "Manufactures" ? "selected" : ""
                    }`}
                  onClick={(e) =>
                    handleSubMenuClick(e, 1, "Manufactures", "/manufactures")
                  }
                >
                  <Link to="/manufactures"> {t("app.manufacturers")}</Link>
                </li>
              )}
              {(isSuper || userpermission?.suppliersview) && (
                <li
                  className={`px-1 ${selectedSubMenu === "Vendors" ? "selected" : ""
                    }`}
                  onClick={(e) =>
                    handleSubMenuClick(e, 1, "Vendors", "/vendors")
                  }
                >
                  <Link to="/vendors"> {t("app.vendors")}</Link>
                </li>
              )}
              {(isSuper || userpermission?.modelsview) && (
                <li
                  className={`px-1 ${selectedSubMenu === "Asset Models" ? "selected" : ""
                    }`}
                  onClick={(e) =>
                    handleSubMenuClick(e, 1, "Asset Models", "/assetmodels")
                  }
                >
                  <Link to="/assetmodels"> {t("app.assetmodels")}</Link>
                </li>
              )}
              {(isSuper || userpermission?.depreciationsview) && (
                <li
                  className={`px-1 ${selectedSubMenu === "Depreciations" ? "selected" : ""
                    }`}
                  onClick={(e) =>
                    handleSubMenuClick(e, 1, "Depreciations", "/depreciation")
                  }
                >
                  <Link to="/depreciation"> {t("app.depreciations")}</Link>
                </li>
              )}
              {(isSuper || userpermission?.statuslabelsview) && (
                <li
                  className={`px-1 ${selectedSubMenu === "Status Labels" ? "selected" : ""
                    }`}
                  onClick={(e) =>
                    handleSubMenuClick(e, 1, "Status Labels", "/statusLabels")
                  }
                >
                  <Link to="/statusLabels"> {t("app.statuslabels")} </Link>
                </li>
              )}
            </ul>
          </li>
        )}
        {(isSuper || userpermission?.assetsview) && (
          <li
            className={`px-1 ${expandedMenu === 2 ? "expanded" : ""} ${selectedMainMenu === 2 ? "selected" : ""
              }`}
            onClick={() => handleMenuClick(2)}
          >
            <Link to="#">
              <img src={Barcode} alt="Properties" />
              {t("app.assets")} <svg className="sidebar-caret" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </Link>
            <ul className="submenu">
              <li
                className={`px-1 ${selectedSubMenu === "List All Asset" ? "selected" : ""
                  }`}
                onClick={(e) =>
                  handleSubMenuClick(e, 2, "List All Asset", "/assets")
                }
              >
                <Link to="/assets"> {t("app.listall")} </Link>
              </li>
              <li
                className={`px-1 ${selectedSubMenu === "Deployable" ? "selected" : ""
                  }`}
                onClick={(e) => handleSubMenuClick(e, 2, "Deployable", "/rtd")}
              >
                <Link to="/rtd"> {t("app.deployable")}</Link>
              </li>
              <li
                className={`px-1 ${selectedSubMenu === "Deployed" ? "selected" : ""
                  }`}
                onClick={(e) =>
                  handleSubMenuClick(e, 2, "Deployed", "/deployed")
                }
              >
                <Link to="/deployed"> {t("app.deployed")} </Link>
              </li>
              <li
                className={`px-1 ${selectedSubMenu === "UnDeployable" ? "selected" : ""
                  }`}
                onClick={(e) =>
                  handleSubMenuClick(e, 2, "UnDeployable", "/undeployable")
                }
              >
                <Link to="/undeployable"> {t("app.undeployed")} </Link>
              </li>
              <li
                className={`px-1 ${selectedSubMenu === "Asset Maintenance" ? "selected" : ""
                  }`}
                onClick={(e) =>
                  handleSubMenuClick(
                    e,
                    2,
                    "Asset Maintenance",
                    "/assetMaintenance",
                  )
                }
              >
                <Link to="/assetMaintenance">{t("app.assetmaintenances")}</Link>
              </li>
              <li
                className={`px-1 ${selectedSubMenu === "Bulk CheckOut" ? "selected" : ""
                  }`}
                onClick={(e) =>
                  handleSubMenuClick(e, 2, "Bulk CheckOut", "/bulkcheckout")
                }
              >
                <Link to="/bulkcheckout"> {t("app.bulkcheckout")}</Link>
              </li>
              <li
                className={`px-1 ${selectedSubMenu === "Pending Agent Assets" ? "selected" : ""
                  }`}
                onClick={(e) =>
                  handleSubMenuClick(e, 2, "Pending Agent Assets", "/assets/pending-agent")
                }
              >
                <Link to="/assets/pending-agent"> {t("app.pendingagentassets")}</Link>
              </li>
            </ul>
          </li>
        )}
        {(isSuper || userpermission?.licensesview) && (
          <li
            className={`px-1 ${selectedMainMenu === "License" ? "selected" : ""
              }`}
            onClick={() => handleMenuClick("License", "/license")}
          >
            <Link to="/license">
              <img src={FloppyDisk} alt="Revenue" /> {t("app.licenses")}
            </Link>
          </li>
        )}
        {(isSuper || userpermission?.accessoriesview) && (
          <li
            className={`px-1 ${selectedMainMenu === "accessories" ? "selected" : ""
              }`}
            onClick={() => handleMenuClick("accessories", "/accessories")}
          >
            <Link to="/accessories">
              <img src={Keyboard} alt="Revenue" /> {t("app.accessories")}
            </Link>
          </li>
        )}
        {(isSuper || userpermission?.consumablesview) && (
          <li
            className={`px-1 ${selectedMainMenu === "consumables" ? "selected" : ""
              }`}
            onClick={() => handleMenuClick("consumables", "/consumables")}
          >
            <Link to="/consumables">
              <img src={Waterdrop} alt="Revenue" />
              {t("app.consumables")}{" "}
            </Link>
          </li>
        )}
        {(isSuper || userpermission?.componentsview) && (
          <li
            className={`px-1 ${selectedMainMenu === "components" ? "selected" : ""
              }`}
            onClick={() => handleMenuClick("components", "/components")}
          >
            <Link to="/components">
              <img src={Hdd} alt="Revenue" /> {t("app.components")}
            </Link>
          </li>
        )}
        {(isSuper || userpermission?.usersview || userpermission?.userscreate || userpermission?.usersedit || userpermission?.usersdelete) && (
          <li
            className={`px-1 ${selectedMainMenu === "peoples" ? "selected" : ""
              }`}
            onClick={() => handleMenuClick("peoples", "/peoples")}
          >
            <Link to="/peoples">
              <img src={clients} alt="Client" /> {t("app.people")}{" "}
            </Link>
          </li>
        )}
        <li
          className={`px-1 ${selectedMainMenu === "helpdesk" ? "selected" : ""
            }`}
          onClick={() => handleMenuClick("helpdesk", "/tickets")}
        >
          <Link to="/tickets">
            <img src={ticket} alt="Revenue" /> {t("app.helpdesk")}
          </Link>
        </li>
        <li
          className={`px-1 ${selectedMainMenu === "workstatus" ? "selected" : ""
            }`}
          onClick={() => handleMenuClick("workstatus", "/workstatus")}
        >
          <Link to="/workstatus">
            {" "}
            <img src={List} alt="Revenue" /> {t("app.workstatus")}
          </Link>
        </li>
        <li
          className={`px-1 ${selectedMainMenu === "scrapsale" ? "selected" : ""
            }`}
          onClick={() => handleMenuClick("scrapsale", "/scrapsale")}
        >
          <Link to="/scrapsale">
            <img src={List} alt="Revenue" /> {t("app.scrapsale")}
          </Link>
        </li>
        {(isSuper || userpermission?.reportview) && (
          <li
            className={`px-1 ${expandedMenu === 3 ? "expanded" : ""} ${selectedMainMenu === 3 ? "selected" : ""
              }`}
            onClick={() => handleMenuClick(3)}
          >
            <Link to="#">
              <img src={Menu} alt="Properties" /> {t("app.reports")}
              <svg className="sidebar-caret" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>{" "}
            </Link>
            <ul className="submenu">
              <li
                className={`px-1 ${selectedSubMenu === "Accessory Reports" ? "selected" : ""
                  }`}
                onClick={(e) =>
                  handleSubMenuClick(
                    e,
                    3,
                    "Accessory Reports",
                    "/accessoryreports",
                  )
                }
              >
                <Link to="/accessoryreports">
                  {" "}
                  {t("app.accessoryreports")}{" "}
                </Link>
              </li>
              <li
                className={`px-1 ${selectedSubMenu === "Activity Reports" ? "selected" : ""
                  }`}
                onClick={(e) =>
                  handleSubMenuClick(
                    e,
                    3,
                    "Activity Reports",
                    "/activityreport",
                  )
                }
              >
                <Link to="/activityreport"> {t("app.activityreports")}</Link>
              </li>
              <li
                className={`px-1 ${selectedSubMenu === "License Reports" ? "selected" : ""
                  }`}
                onClick={(e) =>
                  handleSubMenuClick(e, 3, "License Reports", "/licensereport")
                }
              >
                <Link to="/licensereport"> {t("app.licensereports")} </Link>
              </li>
              <li
                className={`px-1 ${selectedSubMenu === "Depreciation Reports" ? "selected" : ""
                  }`}
                onClick={(e) =>
                  handleSubMenuClick(
                    e,
                    3,
                    "Depreciation Reports",
                    "/depreciationreport",
                  )
                }
              >
                <Link to="/depreciationreport">
                  {" "}
                  {t("app.depreciationreports")}{" "}
                </Link>
              </li>
              <li
                className={`px-1 ${selectedSubMenu === "Component Reports" ? "selected" : ""
                  }`}
                onClick={(e) =>
                  handleSubMenuClick(
                    e,
                    3,
                    "Component Reports",
                    "/componentreport",
                  )
                }
              >
                <Link to="/componentreport">
                  {" "}
                  {t("app.componentsreports")}{" "}
                </Link>
              </li>
              <li
                className={`px-1 ${selectedSubMenu === "Consumable Reports" ? "selected" : ""
                  }`}
                onClick={(e) =>
                  handleSubMenuClick(
                    e,
                    3,
                    "Consumable Reports",
                    "/consumablereport",
                  )
                }
              >
                <Link to="/consumablereport">
                  {" "}
                  {t("app.consumablereports")}
                </Link>
              </li>
              <li
                className={`px-1 ${selectedSubMenu === "Asset Reports" ? "selected" : ""
                  }`}
                onClick={(e) =>
                  handleSubMenuClick(e, 3, "Asset Reports", "/assetreport")
                }
              >
                <Link to="/assetreport"> {t("app.hardwarereports")} </Link>
              </li>
            </ul>
          </li>
        )}
        {(isSuper || userpermission?.assetsaudit) && (
          <li
            className={`px-1 ${selectedMainMenu === "Audit" ? "selected" : ""}`}
            onClick={() => handleMenuClick("Audit", "/audit")}
          >
            <Link to="/audit">
              {" "}
              <img src={History} alt="Client" />
              {t("app.audit")}
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;
