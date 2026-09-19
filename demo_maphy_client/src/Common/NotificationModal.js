import React from "react";
import Modal from "react-bootstrap/Modal";
import "./_modal.scss";
import { withTranslation } from "react-i18next";

function CustomModal(props) {
  const { t } = props;
  const onPress = () => {
    props.onClick();
  };

  const isDestructive = props.modalType === "delete" || props.modalType === "remove";

  // Modern SVG Icons based on type
  const renderIcon = () => {
    if (isDestructive) {
      return (
        <div className="premium-alert-icon-wrapper destructive">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
      );
    }
    return (
      <div className="premium-alert-icon-wrapper info">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </div>
    );
  };

  const getAlertMessage = () => {
    switch (props.modalType) {
      case "delete":
        return t("alert.deleteAlert");
      case "restore":
        return t("alert.restoreAlert");
      case "remove":
        return t("alert.removeAlert");
      case "edit":
        return t("alert.editalert");
      case "move":
        return t("alert.moveuser");
      case "close":
        return t("alert.closeissue");
      case "checkout":
        return t("alert.checkout");
      case "checkin":
        return t("alert.checkin");
      default:
        return "Are you sure you want to proceed?";
    }
  };

  return (
    <Modal
      show={props.show}
      onHide={props.handleClose}
      backdrop="static"
      keyboard={false}
      dialogClassName="premium-alert-modal-dialog"
      contentClassName="premium-alert-modal-content"
      centered
    >
      <Modal.Body className="premium-alert-modal-body">
        {renderIcon()}
        
        <h3 className="premium-alert-title">
          {isDestructive ? t("Confirm Action") : t("Confirmation")}
        </h3>
        
        <p className="premium-alert-text">
          {getAlertMessage()}
        </p>

        <div className="premium-alert-buttons">
          <button
            className="btn btn-secondary premium-alert-btn-cancel"
            type="button"
            onClick={props.handleClose}
          >
            {t("button.no")}
          </button>
          
          <button 
            className={`btn ${isDestructive ? 'btn-danger premium-alert-btn-confirm-destructive' : 'btn-primary premium-alert-btn-confirm'}`} 
            onClick={onPress}
          >
            {t("button.yes")}
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default withTranslation()(CustomModal);
