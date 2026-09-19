import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Tab, Tabs, Button } from "react-bootstrap";
import Assets from "./manufacturersAssets";
import Licenses from "./manufacturersLicenses";
import Accessories from "./manufacturersAccessories";
import Consumables from "./manufacturersConsumables";
import axios from "axios";
import Dropdown from "react-bootstrap/Dropdown";


const TabsComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const Domain = process.env.REACT_APP_API_URL;
  const [manufacturersDetails, setLicenseDetails] = useState([]);
  const { rowData, activeTab } = location.state || {};
  useEffect(() => {
    if (rowData) setLicenseDetails(rowData);
    else {
      const url = `${Domain}/manufacturers/${id}`;
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
          <h1> {rowData ? rowData?.name : manufacturersDetails?.name} </h1>
        </div>
        <div className="d-flex align-items-center">
          <Dropdown className="mr-1 small-btn">
            <Dropdown.Toggle variant="outline-primary" id="location">
              {t("button.actions")}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item>
                <button
                  type="button"
                  className="btn btn-link"
                  onClick={() => navigate("/addEditManufactures")}
                >
                  {t("manufacturers.createmanufacture")}
                </button>
                <br />
                <button
                  type="button"
                  className="btn btn-link"
                  onClick={() => navigate(`/addEditManufactures/${id}`)}
                >
                  {t("manufacturers.updatemanufacture")}
                </button>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Button
            className="primary px-4"
            type="button"
            onClick={() => navigate("/manufactures")}
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
