import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Tab, Tabs, Button } from "react-bootstrap";
import Assets from "./peopleAssets";
import Info from "./peopleInfo";
import Accessories from "./peopleAccessories";
import Consumables from "./peopleConsumables";
import Licenses from "./peopleLicenses";
import axios from "axios";

const TabsComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const Domain = process.env.REACT_APP_API_URL;
  const [peopleDetails, setPeopleDetails] = useState([]);
  const { rowData, activeTab } = location.state || {};

  console.log("Departments", rowData);

  useEffect(() => {
    if (rowData) setPeopleDetails(rowData);
    else {
      const url = `${Domain}/users/${id}`;
      axios
        .get(url)
        .then((response) => {
          setPeopleDetails(response?.data);
          console.log("Departments", response?.data);
        })
        .catch((error) => {});
    }
  }, []);

  return (
    <>
      <div className="title d-flex justify-content-between">
        <div>
          <h1>{rowData ? rowData?.name : peopleDetails?.name} </h1>
        </div>
        <div className="d-flex align-items-center">
          <Button
            className="primary px-4"
            type="button"
            onClick={() => navigate("/peoples")}
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
        <Tab eventKey="assets" title={t("app.assets")}>
          <Assets />
        </Tab>
        <Tab eventKey="licenses" title={t("app.licenses")}>
          <Licenses />
        </Tab>
        <Tab eventKey="accessories" title={t("app.accessories")}>
          <Accessories />
        </Tab>
        <Tab eventKey="consumables" title={t("app.consumables")}>
          <Consumables />
        </Tab>
      </Tabs>
    </>
  );
};

export default TabsComponent;
