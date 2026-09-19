import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Tab, Tabs, Button } from "react-bootstrap";
import Assets from "./locationAssets";
import People from "./locationPeople";
import Accessories from "./locationAccessories";
import Consumables from "./locationConsumables";
import Components from "./locationComponents";
import axios from "axios";

const TabsComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const Domain = process.env.REACT_APP_API_URL;
  const [locationDetails, setLocationDetails] = useState([]);
  const { rowData, activeTab } = location.state || {};
  useEffect(() => {
    if (rowData) setLocationDetails(rowData);
    else {
      const url = `${Domain}/locations/${id}`;
      axios
        .get(url)
        .then((response) => {
          setLocationDetails(response?.data);
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
          <h1>
            {t("location.location")}
            {" - "}
            {rowData ? rowData?.name : locationDetails?.name}{" "}
          </h1>
        </div>
        <div className="d-flex align-items-center">
          <Button
            className="me-1"
            type="button"
            // onClick={() => navigate(-1)}
            onClick={() => navigate(`/addEditlocation/${id}`)}
          >
            {t("location.update")}
          </Button>
          <Button
            className="primary px-4"
            type="button"
            onClick={() => navigate("/location")}
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
        <Tab eventKey="people" title={t("app.people")}>
          <People />
        </Tab>
        <Tab eventKey="accessories" title={t("app.accessories")}>
          <Accessories />
        </Tab>
        <Tab eventKey="consumables" title={t("app.consumables")}>
          <Consumables />
        </Tab>
        <Tab eventKey="components" title={t("app.components")}>
          <Components />
        </Tab>
      </Tabs>
    </>
  );
};

export default TabsComponent;
