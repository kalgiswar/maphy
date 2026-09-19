import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { common } from "../../Common/common";
import axios from "axios";

const MainPage = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const { id } = useParams();
  const Domain = process.env.REACT_APP_API_URL;
  const [infoDetails, setInfoDetails] = useState(null);
  const { rowData } = location.state || {};

  useEffect(() => {
    if (rowData) setInfoDetails(rowData);
    else {
      const url = `${Domain}/hardware/${id}`;
      axios
        .get(url)
        .then((response) => {
          setInfoDetails(response?.data || {});
        })
        .catch((error) => {
          common.notify("E", error);
        });
    }
  }, [rowData, Domain, id]);

  return (
    <div className="dataTable wrapper">
      <table className="medium-table">
        <tbody>
          <tr className="border-para">
            <td>{t("AssetsListall.id")}</td>
            <td className="right-cell">{infoDetails?.id}</td>
          </tr>
          <tr className="border-para">
            <td>{t("AssetsListall.status_id")}</td>
            <td className="right-cell">{infoDetails?.status_label?.name}</td>
          </tr>
          <tr className="border-para">
            <td>{t("AssetsListall.AssetName")}</td>
            <td className="right-cell">{infoDetails?.name}</td>
          </tr>
          <tr className="border-para">
            <td>{t("AssetsListall.asset_tag")}</td>
            <td className="right-cell">{infoDetails?.asset_tag}</td>
          </tr>
          <tr className="border-para">
            <td>{t("AssetsListall.serial")}</td>
            <td className="right-cell">{infoDetails?.serial}</td>
          </tr>
          <tr className="border-para">
            <td>{t("AssetsListall.model_number")}</td>
            <td className="right-cell">{infoDetails?.model_number}</td>
          </tr>
          <tr className="border-para">
            <td>{t("AssetsListall.notes")}</td>
            <td className="right-cell">{infoDetails?.notes}</td>
          </tr>
          <tr className="border-para">
            <td>{t("AssetsListall.checkout")}</td>
            <td className="right-cell">{infoDetails?.checkout_counter}</td>
          </tr>
          <tr className="border-para">
            <td>{t("AssetsListall.checkin")}</td>
            <td className="right-cell">{infoDetails?.checkin_counter}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default MainPage;
