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
      <div className="premium-alert-icon-wrapper destructive">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
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
    >
      <Modal.Body className="premium-alert-modal-body">
        {renderIcon()}

        <h3 className="premium-alert-title">
          {t("logout.leavepage")}
        </h3>

        <p className="premium-alert-text">
          {t("logout.paragraph")}
        </p>

        <div className="premium-alert-buttons">
          <button
            className="btn btn-secondary premium-alert-btn-cancel"
            type="button"
            onClick={handleClose}
          >
            {t("button.cancel")}
          </button>

          <button
            className="btn btn-danger premium-alert-btn-confirm-destructive"
            onClick={handleLogout}
            type="button"
          >
            {t("button.logout")}
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default LogoutModal;

