import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTicket,
  faTags,
  faPeopleGroup,
  faFloppyDisk,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Branding from "../../images/branding.png";

const Adminsetting = () => {
  const { t } = useTranslation();
  const userpermission = JSON.parse(localStorage.getItem("permissions"));
  const isSuperuser = userpermission?.superuser === "1" || userpermission?.superuser === 1 || userpermission?.superuser === true || userpermission?.superuser === "true";
  const isAdmin = userpermission?.admin === true || userpermission?.admin === "1" || userpermission?.admin === 1 || userpermission?.admin === "true";
  const canManageGroups = userpermission?.edit_group_permissions === true;
  const hasFullAccess = isSuperuser || isAdmin;

  return (
    <Container>
      <div className="dataTable wrapper-admin">
        {hasFullAccess ? (
          <>
            <Row>
              <Col md={3} className="bordered-col p-3">
                <Link to="/branding" className="a-admin">
                  <img src={Branding} alt="Branding" />
                  {t("adminsettings.Branding")}
                </Link>
                <p>{t("adminsettings.logo")}</p>
              </Col>
              <Col md={3} className="bordered-col p-3">
                <Link to="/Ticketissues" className="a-admin">
                  <FontAwesomeIcon icon={faTicket} />
                  {t("adminsettings.ticketissues")}
                </Link>
                <p>{t("adminsettings.issues")}</p>
              </Col>
              <Col md={3} className="bordered-col p-3">
                <Link to="/TalentGroup" className="a-admin">
                  <FontAwesomeIcon icon={faPeopleGroup} />
                  {t("adminsettings.talentgroups")}
                </Link>
                <p>{t("adminsettings.Technical")}</p>
              </Col>
            </Row>
            <Row>
              <Col md={3} className="bordered-col p-3">
                <Link to="/Groups" className="a-admin">
                  <FontAwesomeIcon icon={faPeopleGroup} />
                  {t("adminsettings.groups")}
                </Link>
                <p>{t("adminsettings.account")}</p>
              </Col>
              <Col md={3} className="bordered-col p-3">
                <Link to="/Label" className="a-admin">
                  <FontAwesomeIcon icon={faTags} />
                  {t("adminsettings.label")}
                </Link>
                <p>{t("adminsettings.labelsize")}</p>
              </Col>
            </Row>
            <Row>
              <Col md={3} className="bordered-col p-3">
                <Link to="/LicenseNotification" className="a-admin">
                  <FontAwesomeIcon icon={faFloppyDisk} />
                  {t("adminsettings.license")}
                </Link>
                <p>{t("adminsettings.licensenotification")}</p>
              </Col>
            </Row>
          </>
        ) : (
          canManageGroups && (
            <Row>
              <Col md={3} className="bordered-col p-3">
                <Link to="/Groups" className="a-admin">
                  <FontAwesomeIcon icon={faPeopleGroup} />
                  {t("adminsettings.groups")}
                </Link>
                <p>{t("adminsettings.account")}</p>
              </Col>
            </Row>
          )
        )}
      </div>
    </Container>
  );
};

export default Adminsetting;