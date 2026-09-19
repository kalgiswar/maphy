import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import AssignedTo from "./locationAssets";

const TabsComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { rowData } = location.state || {};

  return (
    <>
      <div className="title d-flex justify-content-between">
        <div>
          <h1>
            {t("location.location")}
            {" - "}
            {rowData?.name}{" "}
          </h1>
        </div>
        <div className="d-flex align-items-center">
          <Button
            className="primary px-4"
            type="button"
            onClick={() => navigate("/location")}
          >
            {t("button.back")}
          </Button>
        </div>
      </div>
      <AssignedTo />{" "}
    </>
  );
};

export default TabsComponent;
