import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Tab, Tabs, Button } from "react-bootstrap";
import Assets from "./vendorAsset";
import License from "./vendorsLicense";
import Accessories from "./vendorAccessories";
import Improvements from "./vendorimprovements";
import axios from "axios";

const TabsComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const Domain = process.env.REACT_APP_API_URL;
  const [vendorsDetails, setVendorsDetails] = useState({});
  const { rowData, activeTab } = location.state || {};

  useEffect(() => {
    if (rowData) {
      console.log("RowData:", rowData);
      setVendorsDetails(rowData);
    } else {
      const url = `${Domain}/suppliers/${id}`;
      axios
        .get(url)
        .then((response) => {
          console.log("API Response:", response.data);
          setVendorsDetails(response.data);
        })
        .catch((error) => {
          console.error("API Error:", error);
        });
    }
  }, [Domain, id, rowData]);

  console.log("VendorsDetails:", vendorsDetails);

  return (
    <>
      <div className="title d-flex justify-content-between">
        <div>
          <h1>
            {rowData && typeof rowData.name === "string"
              ? rowData.name
              : vendorsDetails && typeof vendorsDetails.name === "string"
              ? vendorsDetails.name
              : ""}
          </h1>
        </div>
        <div className="d-flex align-items-center">
          <Button
            className="primary px-4"
            type="button"
            onClick={() => navigate("/vendors")}
          >
            {t("button.back")}
          </Button>
        </div>
      </div>
      <Tabs
        defaultActiveKey={activeTab ? activeTab : "assets"}
        id="uncontrolled-tab-example"
        className="tab md-12"
      >
        <Tab eventKey="assets" title={t("app.assets")}>
          <Assets />
        </Tab>
        <Tab eventKey="licenses" title={t("app.licenses")}>
          <License />
        </Tab>
        <Tab eventKey="accessories" title={t("app.accessories")}>
          <Accessories />
        </Tab>
        <Tab eventKey="improvements" title={t("app.improvements")}>
          <Improvements />
        </Tab>
      </Tabs>
    </>
  );
};

export default TabsComponent;
