import React from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LogoutModal = ({ show, handleClose }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    localStorage.clear();
    axios.defaults.headers.common["Authorization"] = "";
    navigate("/login");
  };

  const renderIcon = () => {
    return (
      <div className="premium-alert-icon-wrapper info">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </div>
    );
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      dialogClassName="premium-alert-modal-dialog"
      contentClassName="premium-alert-modal-content"
      centered
      backdrop="static"
    >
      <Modal.Body className="premium-alert-modal-body">
        {renderIcon()}

        <h3 className="premium-alert-title">
          Password Updated
        </h3>

        <p className="premium-alert-text">
          {t("alert.logout")}
        </p>

        <div className="premium-alert-buttons">
          <button
            className="btn btn-primary premium-alert-btn-confirm"
            onClick={handleLogout}
            type="button"
            style={{ width: "100%", maxWidth: "none" }}
          >
            {t("button.login")}
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default LogoutModal;
