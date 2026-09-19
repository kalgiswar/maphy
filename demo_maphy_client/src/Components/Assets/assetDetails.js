import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Tab, Tabs, Button } from "react-bootstrap";
import Components from "./assetComponents";
import Info from "./assetInfo";
import AssetMaintenance from "./assetMaintenance";
import History from "./assetHistory";
import Licenses from "./assetLicenses";
import Depreciation from "./assetDepreciation";
import axios from "axios";

const TabsComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const { id } = useParams();
  const Domain = process.env.REACT_APP_API_URL;
  const [assetDetails, setAssetDetails] = useState([]);
  const { rowData, activeTab } = location.state || {};
  console.log(("miantain", rowData));

  const pageType = state?.pageType || "default";

  useEffect(() => {
    if (rowData) setAssetDetails(rowData);
    else {
      const url = `${Domain}/hardware/${id}`;
      axios
        .get(url)
        .then((response) => {
          setAssetDetails(response?.data);
        })
        .catch((error) => {
          // common.notify("E", error);
        });
    }
  }, []);

  const navigateToPage = (navigate, pageType) => {
    switch (pageType) {
      case "rtd":
        navigate("/rtd"); //Deployable
        break;
      case "undeployable":
        navigate("/undeployable");
        break;
      case "deployed":
        navigate("/deployed");
        break;
      case "assets":
        navigate("/assets");
        break;
      case "assetMaintenance":
        navigate("/assetMaintenance");
        break;
      default:
        navigate("/assets");
        break;
    }
  };

  return (
    <>
      <div className="title d-flex justify-content-between">
        <div>
          <h1>
            {pageType === "assetMaintenance"
              ? `${assetDetails?.name} - ${t("Asset.details")}`
              : `${rowData?.name || assetDetails?.name} - ${t(
                  "Asset.details"
                )}`}
          </h1>
        </div>
        <div className="d-flex align-items-center">
          <Button
            className="primary px-4"
            type="button"
            onClick={() => navigateToPage(navigate, pageType)}
          >
            {t("button.back")}
          </Button>
        </div>
      </div>
      <Tabs
        defaultActiveKey={activeTab ? activeTab : "info"}
        id="uncontrolled-tab-example"
        className="tab md-12"
      >
        <Tab eventKey="info" title={t("app.info")}>
          <Info />
        </Tab>
        <Tab eventKey="licenses" title={t("app.licenses")}>
          <Licenses />
        </Tab>
        <Tab eventKey="components" title={t("app.components")}>
          <Components />
        </Tab>
        <Tab eventKey="maintenance" title={t("app.maintenances")}>
          <AssetMaintenance />
        </Tab>
        <Tab eventKey="history" title={t("app.history")}>
          <History />
        </Tab>
        <Tab eventKey="depreciation" title={t("app.depreciation")}>
          <Depreciation 
          assetName={rowData?.name || assetDetails?.name}
          purchaseCost={rowData?.purchase_cost || assetDetails?.purchase_cost}
          // depreciationId={rowData?.depreciation_id || assetDetails?.depreciation_id || 43}
          depreciationId={
            rowData?.depreciation && Object.keys(rowData.depreciation).length > 0
              ? rowData.depreciation.id
              : assetDetails?.depreciation && Object.keys(assetDetails.depreciation).length > 0
              ? assetDetails.depreciation.id : null
          }
          />
        </Tab>
      </Tabs>
    </>
  );
};

export default TabsComponent;
