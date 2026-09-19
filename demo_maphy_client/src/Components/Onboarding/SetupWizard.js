import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Row, Col, ProgressBar, Button, Card } from "react-bootstrap";
import axios from "axios";
import "./SetupWizard.css";

const Domain = process.env.REACT_APP_API_URL;

const SetupWizard = ({ onDismiss }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Onboarding state
  const [hasBranches, setHasBranches] = useState(null); // null (unselected), true, false
  const [loading, setLoading] = useState(true);
  const [stepStatus, setStepStatus] = useState({
    companies: false,
    locations: false,
    departments: false,
    categories: false,
    manufacturers: false,
    suppliers: false,
    depreciations: false,
    models: false,
    statuslabels: false,
    users: false,
    hardware: false,
  });

  useEffect(() => {
    const userpermission = JSON.parse(localStorage.getItem("permissions")) || {};
    const isSuper = userpermission?.superuser === "1" || userpermission?.superuser === 1 || userpermission?.superuser === true || userpermission?.superuser === "true";
    const isAdmin = userpermission?.admin === true || userpermission?.admin === "1" || userpermission?.admin === 1;
    const isManager = !isSuper && !isAdmin;

    let finalHasBranches = null;
    if (isManager) {
      finalHasBranches = true;
      setHasBranches(true);
    } else {
      // Check localStorage for branch preference
      const storedBranchPreference = localStorage.getItem("onboarding_has_branches");
      if (storedBranchPreference !== null) {
        finalHasBranches = storedBranchPreference === "true";
        setHasBranches(finalHasBranches);
      }
    }
    
    checkAllSteps(finalHasBranches);
  }, []);

  const checkAllSteps = async (branchesPreference) => {
    setLoading(true);
    try {
      const userpermission = JSON.parse(localStorage.getItem("permissions")) || {};
      const isSuper = userpermission?.superuser === "1" || userpermission?.superuser === 1 || userpermission?.superuser === true || userpermission?.superuser === "true";

      const permissionMap = {
        companies: "companiesview",
        locations: "locationsview",
        departments: "departmentsview",
        categories: "categoriesview",
        manufacturers: "manufacturersview",
        suppliers: "suppliersview",
        depreciations: "depreciationsview",
        models: "modelsview",
        statuslabels: "statuslabelsview",
        users: "usersview",
        hardware: "assetsview",
      };

      const promises = [];
      const keys = Object.keys(permissionMap);

      for (const key of keys) {
        const perm = permissionMap[key];
        const hasPerm = isSuper || userpermission[perm] === true || userpermission[perm] === "1" || userpermission[perm] === 1;
        if (hasPerm) {
          promises.push({
            key,
            promise: axios.get(`${Domain}/${key}?limit=1`)
          });
        }
      }

      const results = await Promise.allSettled(promises.map(p => p.promise));
      
      const newStatus = {
        companies: false,
        locations: false,
        departments: false,
        categories: false,
        manufacturers: false,
        suppliers: false,
        depreciations: false,
        models: false,
        statuslabels: false,
        users: false,
        hardware: false,
      };

      promises.forEach((p, idx) => {
        const res = results[idx];
        newStatus[p.key] = res.status === "fulfilled" && res.value.data?.total > 0;
      });

      setStepStatus(newStatus);

      // Auto-dismiss if all steps are completed
      if (branchesPreference !== null) {
        const stepsList = allPossibleSteps.filter((step) => {
          if (step.conditional && !branchesPreference) return false;
          const perm = step.permission;
          const hasPerm = isSuper || userpermission[perm] === true || userpermission[perm] === "1" || userpermission[perm] === 1;
          return hasPerm;
        });

        const completedCount = stepsList.filter((step) => newStatus[step.id]).length;
        const totalCount = stepsList.length;

        if (totalCount > 0 && completedCount === totalCount) {
          try {
            await axios.put(`${Domain}/users/onboarding/dismiss`);
          } catch (error) {
            console.error("Error auto-dismissing onboarding in DB:", error);
          }
          localStorage.setItem("onboarding_dismissed", "true");
          if (onDismiss) {
            onDismiss();
          }
        }
      }
    } catch (error) {
      console.error("Error checking onboarding steps status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBranchSelect = (preference) => {
    localStorage.setItem("onboarding_has_branches", preference ? "true" : "false");
    setHasBranches(preference);
    checkAllSteps(preference);
  };

  const handleDismiss = async () => {
    try {
      await axios.put(`${Domain}/users/onboarding/dismiss`);
    } catch (error) {
      console.error("Error dismissing onboarding in DB:", error);
    }
    localStorage.setItem("onboarding_dismissed", "true");
    if (onDismiss) onDismiss();
  };

  // Define steps configurations
  const allPossibleSteps = [
    {
      id: "companies",
      title: t("onboarding.step_company"),
      desc: t("onboarding.step_company_desc"),
      path: "/company",
      permission: "companiesview"
    },
    {
      id: "locations",
      title: t("onboarding.step_location"),
      desc: t("onboarding.step_location_desc"),
      path: "/location",
      conditional: true, // Only if hasBranches is true
      permission: "locationsview"
    },
    {
      id: "departments",
      title: t("onboarding.step_department"),
      desc: t("onboarding.step_department_desc"),
      path: "/department",
      permission: "departmentsview"
    },
    {
      id: "categories",
      title: t("onboarding.step_category"),
      desc: t("onboarding.step_category_desc"),
      path: "/categories",
      permission: "categoriesview"
    },
    {
      id: "manufacturers",
      title: t("onboarding.step_manufacturer"),
      desc: t("onboarding.step_manufacturer_desc"),
      path: "/manufactures",
      permission: "manufacturersview"
    },
    {
      id: "suppliers",
      title: t("onboarding.step_supplier"),
      desc: t("onboarding.step_supplier_desc"),
      path: "/vendors",
      permission: "suppliersview"
    },
    {
      id: "depreciations",
      title: t("onboarding.step_depreciation"),
      desc: t("onboarding.step_depreciation_desc"),
      path: "/depreciation",
      permission: "depreciationsview"
    },
    {
      id: "models",
      title: t("onboarding.step_model"),
      desc: t("onboarding.step_model_desc"),
      path: "/assetmodels",
      permission: "modelsview"
    },
    {
      id: "statuslabels",
      title: t("onboarding.step_status"),
      desc: t("onboarding.step_status_desc"),
      path: "/statusLabels",
      permission: "statuslabelsview"
    },
    {
      id: "users",
      title: t("onboarding.step_users"),
      desc: t("onboarding.step_users_desc"),
      path: "/peoples",
      permission: "usersview"
    },
    {
      id: "hardware",
      title: t("onboarding.step_asset"),
      desc: t("onboarding.step_asset_desc"),
      path: "/assets",
      permission: "assetsview"
    },
  ];

  // Filter steps based on branch selection and permissions
  const userpermission = JSON.parse(localStorage.getItem("permissions")) || {};
  const isSuper = userpermission?.superuser === "1" || userpermission?.superuser === 1 || userpermission?.superuser === true || userpermission?.superuser === "true";

  const steps = allPossibleSteps.filter(
    (step) => {
      if (step.conditional && !hasBranches) return false;
      const perm = step.permission;
      const hasPerm = isSuper || userpermission[perm] === true || userpermission[perm] === "1" || userpermission[perm] === 1;
      return hasPerm;
    }
  );

  const completedCount = steps.filter((step) => stepStatus[step.id]).length;
  const totalCount = steps.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Render question screen if branch selection is unselected
  if (hasBranches === null) {
    return (
      <Card className="onboarding-wizard-card shadow-sm border-0 mb-4 overflow-hidden">
        <div className="onboarding-header text-white p-4">
          <h2 className="mb-2 font-weight-bold">{t("onboarding.welcome")}</h2>
          <p className="mb-0 opacity-80">{t("onboarding.branchQuestion")}</p>
        </div>
        <Card.Body className="p-4 bg-white text-center">
          <div className="d-flex justify-content-center gap-3 my-4">
            <Button
              variant="primary"
              size="lg"
              className="px-4 py-3 onboarding-action-btn font-weight-bold"
              onClick={() => handleBranchSelect(true)}
            >
              {t("onboarding.yesBranches")}
            </Button>
            <Button
              variant="outline-primary"
              size="lg"
              className="px-4 py-3 onboarding-action-btn font-weight-bold"
              onClick={() => handleBranchSelect(false)}
            >
              {t("onboarding.noBranches")}
            </Button>
          </div>
          <div className="mt-3">
            <Button variant="link" className="text-muted" onClick={handleDismiss}>
              {t("onboarding.dismiss")}
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="onboarding-wizard-card shadow-sm border-0 mb-4 overflow-hidden">
      <div className="onboarding-header text-white p-4 d-flex justify-content-between align-items-start">
        <div className="flex-grow-1">
          <h2 className="mb-1 font-weight-bold">{t("onboarding.welcome")}</h2>
          <div className="d-flex align-items-center mt-2">
            <ProgressBar
              now={progressPercent}
              className="flex-grow-1 onboarding-progress me-3"
              variant="success"
              style={{ height: "10px" }}
            />
            <span className="font-weight-bold text-nowrap">
              {t("onboarding.progress", { completed: completedCount, total: totalCount })}
            </span>
          </div>
        </div>
        <div className="d-flex align-items-center">
          <Button
            variant="outline-light"
            size="sm"
            className="ms-3 onboarding-skip-btn"
            style={{ fontWeight: "600", borderRadius: "20px", padding: "4px 15px", border: "1.5px solid rgba(255,255,255,0.6)" }}
            onClick={handleDismiss}
          >
            {t("onboarding.skip_setup") || "Skip Setup"}
          </Button>
          <Button
            variant="outline-light"
            size="sm"
            className="ms-3 border-0 bg-transparent text-white-50 hover-white"
            onClick={handleDismiss}
          >
            ✕
          </Button>
        </div>
      </div>
      <Card.Body className="p-4 bg-white">
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            <div className="onboarding-steps-scroll-container">
              {steps.map((step, idx) => {
                const isDone = stepStatus[step.id];
                return (
                  <div
                    key={step.id}
                    className={`onboarding-step-item p-3 rounded d-flex flex-column justify-content-between transition-all ${
                      isDone ? "bg-success-subtle border-success" : "bg-light border-light"
                    }`}
                    style={{
                      borderLeft: "4px solid",
                      cursor: "pointer",
                      flex: "0 0 280px",
                      minHeight: "160px"
                    }}
                    onClick={() => {
                      sessionStorage.setItem("onboarding_active", "true");
                      navigate(step.path);
                    }}
                  >
                    <div>
                      <div className="d-flex justify-content-between align-items-start">
                        <span className="step-number text-muted font-weight-bold small">
                          Step {idx + 1}
                        </span>
                        {isDone ? (
                          <span className="badge bg-success">{t("onboarding.completed")}</span>
                        ) : (
                          <span className="badge bg-secondary">Pending</span>
                        )}
                      </div>
                      <h5 className="step-title mt-2 mb-1" style={{ color: "#333", fontWeight: "600", fontSize: "15px" }}>
                        {step.title}
                      </h5>
                      <p className="step-desc text-muted mb-0 small" style={{ fontSize: "12px", lineHeight: "1.4" }}>
                        {step.desc}
                      </p>
                    </div>
                    <div className="text-end mt-3">
                      {!isDone && (
                        <Button
                          variant="primary"
                          size="sm"
                          className="onboarding-setup-btn px-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            sessionStorage.setItem("onboarding_active", "true");
                            navigate(step.path);
                          }}
                        >
                          {t("onboarding.setup")} &rarr;
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {completedCount === totalCount && (
              <div className="text-center mt-4 p-3 bg-success-subtle rounded border border-success">
                <h5 className="mb-0 text-success font-weight-bold">
                  🎉 {t("onboarding.allDone")}
                </h5>
              </div>
            )}
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default SetupWizard;
