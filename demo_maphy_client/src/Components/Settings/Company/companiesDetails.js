import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Tab, Tabs, Button } from "react-bootstrap";
import People from "./companiesPeople";
import Assets from "./companiesAssets";
import Licenses from "./companiesLicenses";
import Accessories from "./companiesAccessories";
import Consumables from "./companiesConsumables";
import Components from "./companiesComponents";
import axios from "axios";

const TabsComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const Domain = process.env.REACT_APP_API_URL;
  const [licenseDetails, setLicenseDetails] = useState([]);
  const { rowData, activeTab } = location.state || {};
  useEffect(() => {
    if (rowData) setLicenseDetails(rowData);
    else {
      const url = `${Domain}/companies/${id}`;
      axios
        .get(url)
        .then((response) => {
          setLicenseDetails(response?.data);
        })
        .catch((error) => {
          // common.notify("E", error);
        });
    }
  }, []);
  return (
    <>
      <div className="title d-flex justify-content-between">
        <div>
          <h1> {rowData ? rowData?.name : licenseDetails?.name} </h1>
        </div>
        <div className="d-flex align-items-center">
          <Button
            className="primary px-4"
            type="button"
            onClick={() => navigate("/company")}
          >
            {t("button.back")}
          </Button>
        </div>
      </div>
      <Tabs
        defaultActiveKey={activeTab ? activeTab : "people"}
        id="uncontrolled-tab-example"
        className="tab md-12"
      >
        <Tab eventKey="people" title={t("app.people")}>
          <div>
            <People />
          </div>
        </Tab>
        <Tab eventKey="assets" title={t("app.assets")}>
          <div>
            <Assets />
          </div>
        </Tab>
        <Tab eventKey="licenses" title={t("app.licenses")}>
          <div>
            <Licenses />
          </div>
        </Tab>
        <Tab eventKey="accessories" title={t("app.accessories")}>
          <div>
            <Accessories />
          </div>
        </Tab>
        <Tab eventKey="consumables" title={t("app.consumables")}>
          <div>
            <Consumables />
          </div>
        </Tab>
        <Tab eventKey="components" title={t("app.components")}>
          <div>
            <Components />
          </div>
        </Tab>
      </Tabs>
    </>
  );
};

export default TabsComponent;
