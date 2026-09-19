import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { common } from "../../Common/common";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";

const MainPage = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const { id } = useParams();
  const Domain = process.env.REACT_APP_API_URL;
  const [infoDetails, setInfoDetails] = useState(null);
  const { rowData } = location.state || {};
  console.log("people", rowData);

  useEffect(() => {
    if (rowData) setInfoDetails(rowData);
    else {
      const url = `${Domain}/users/${id}`;
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

  // if (!infoDetails) {
  //   return <div>Loading...</div>;
  // }

  return (
    <div className="dataTable wrapper table-border">
      <table className="medium-table">
        <tbody>
          <tr className="border-para">
            <td>{t("people.name")}</td>
            <td className="right-cell">{infoDetails?.name}</td>
          </tr>
          <tr>
            <td>{t("people.company_id")}</td>
            <td className="right-cell">{infoDetails?.company?.name}</td>
          </tr>
          <tr className="border-para">
            <td>{t("people.username")}</td>
            <td className="right-cell">{infoDetails?.username}</td>
          </tr>
          <tr>
            <td rowSpan="3">{t("people.address")}</td>
            <td className="right-cell">{infoDetails?.address}</td>
          </tr>
          <tr>
            <td className="right-cell">
              {infoDetails?.city} {","} {infoDetails?.state}
            </td>
          </tr>
          <tr>
            <td className="right-cell">{infoDetails?.country}</td>
          </tr>
          <tr className="border-para">
            <td>{t("people.groups")}</td>
            <td className="right-cell">
              {infoDetails?.groups?.rows?.[0]?.name}
            </td>
          </tr>
          <tr>
            <td>{t("people.job")}</td>
            <td className="right-cell">{infoDetails?.jobtitle}</td>
          </tr>
          <tr className="border-para">
            <td>{t("people.employee_no")}</td>
            <td className="right-cell">{infoDetails?.employee_num}</td>
          </tr>
          <tr>
            <td>{t("people.manager_id")}</td>
            <td className="right-cell">{infoDetails?.manager?.name}</td>
          </tr>
          <tr className="border-para">
            <td>{t("people.email")}</td>
            <td className="right-cell">{infoDetails?.email}</td>
          </tr>
          <tr>
            <td>{t("people.website")}</td>
            <td className="right-cell">{infoDetails?.website}</td>
          </tr>
          <tr className="border-para">
            <td>{t("people.phone")}</td>
            <td className="right-cell">{infoDetails?.phone}</td>
          </tr>
          <tr>
            <td>{t("people.department_id")}</td>
            <td className="right-cell">{infoDetails?.department?.name}</td>
          </tr>
          <tr className="border-para">
            <td>{t("people.createat")}</td>
            <td className="right-cell">{infoDetails?.created_at?.formatted}</td>
          </tr>
          <tr className="border-para">
            <td>{t("people.login")}</td>
            <td className="right-cell">
              {infoDetails?.activated === true ? (
                <span>
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    style={{ color: "green" }}
                  />{" "}
                  {t("yes")}
                </span>
              ) : (
                <span>
                  <FontAwesomeIcon
                    icon={faTimesCircle}
                    style={{ color: "red" }}
                  />{" "}
                  {t("no")}
                </span>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default MainPage;
