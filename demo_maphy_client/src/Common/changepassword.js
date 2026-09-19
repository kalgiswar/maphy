import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { Container, Row, Col, Form, Button, InputGroup } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Changepassword from "../Common/passwordmodel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const ChangePasswordForm = () => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [responseStatus, setResponseStatus] = useState(false);
  const [showCreate, setShowCreate] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    newPass: false,
    confirm: false,
  });
  const Domain = process.env.REACT_APP_API_URL;

  const togglePassword = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const onSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      setNotificationMessage(t("changepassword.notmatch"));
      setShowNotifications(true);
      return;
    }

    try {
      const response = await axios.post(
        `${Domain}/users/changePassword`,
        {
          oldPassword: data.currentPassword,
          newPassword: data.newPassword,
        },
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      setResponseStatus(response.data.success);
      setNotificationMessage(response.data.message);
      console.log("Response status:", response.status);
      console.log("Response data:", response.data);
      setShowNotifications(true);

      if (response.data.success) {
        setShowCreate(false);
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error changing password:", error);
      console.error("Error response:", error.response);
      setNotificationMessage(
        t("An error occurred while changing the password."),
      );
      setShowNotifications(true);
    }
  };

  const backClick = () => {
    navigate("/Dashboard");
  };

  return (
    <Container fluid>
      <Row>
        <Col md={8}>
          <div>
            <div className="title d-flex justify-content-between">
              <div>
                <h3>{t("changepassword.changepassword")}</h3>
              </div>
            </div>
            <div className="addProperty wrapper">
              <div className="basicDetails pt-4">
                <Form
                  className="mb-3"
                  onSubmit={handleSubmit(onSubmit)}
                  noValidate
                >
                  <Row>
                    {showNotifications && (
                      <div
                        className={`alert ${
                          responseStatus ? "alert-success" : "alert-danger"
                        }`}
                      >
                        {notificationMessage}
                      </div>
                    )}
                    {showCreate && (
                      <>
                        <Col md={8} sm={12}>
                          {/* Current Password */}
                          <Form.Group className="mb-3">
                            <Form.Label>
                              {t("changepassword.currentpassword")}
                              <span className="mandatory">*</span>
                            </Form.Label>
                            <InputGroup>
                              <Form.Control
                                type={
                                  showPasswords.current ? "text" : "password"
                                }
                                id="currentPassword"
                                {...register("currentPassword", {
                                  required: true,
                                })}
                                placeholder={t("placeholder.currentpassword")}
                                className="gen-form-control"
                              />
                              <Button
                                variant="outline-secondary"
                                onClick={() => togglePassword("current")}
                              >
                                <FontAwesomeIcon
                                  icon={
                                    showPasswords.current ? faEyeSlash : faEye
                                  }
                                />
                              </Button>
                            </InputGroup>
                            {errors.currentPassword && (
                              <p className="error">
                                {t("changepassword.currentpassword-req")}
                              </p>
                            )}
                          </Form.Group>

                          {/* New Password */}
                          <Form.Group className="mb-3">
                            <Form.Label>
                              {t("changepassword.newpassword")}
                              <span className="mandatory">*</span>
                            </Form.Label>
                            <InputGroup>
                              <Form.Control
                                type={
                                  showPasswords.newPass ? "text" : "password"
                                }
                                id="newPassword"
                                {...register("newPassword", { required: true })}
                                placeholder={t("placeholder.newpassword")}
                                className="gen-form-control"
                              />
                              <Button
                                variant="outline-secondary"
                                onClick={() => togglePassword("newPass")}
                              >
                                <FontAwesomeIcon
                                  icon={
                                    showPasswords.newPass ? faEyeSlash : faEye
                                  }
                                />
                              </Button>
                            </InputGroup>
                            {errors.newPassword && (
                              <p className="error">
                                {t("changepassword.newpassword-req")}
                              </p>
                            )}
                          </Form.Group>

                          {/* Confirm Password */}
                          <Form.Group className="mb-3">
                            <Form.Label>
                              {t("changepassword.confirmpassword")}
                              <span className="mandatory">*</span>
                            </Form.Label>
                            <InputGroup>
                              <Form.Control
                                type={
                                  showPasswords.confirm ? "text" : "password"
                                }
                                id="confirmPassword"
                                {...register("confirmPassword", {
                                  required: true,
                                })}
                                placeholder={t("placeholder.confirmpassword")}
                                className="gen-form-control"
                              />
                              <Button
                                variant="outline-secondary"
                                onClick={() => togglePassword("confirm")}
                              >
                                <FontAwesomeIcon
                                  icon={
                                    showPasswords.confirm ? faEyeSlash : faEye
                                  }
                                />
                              </Button>
                            </InputGroup>
                            {errors.confirmPassword && (
                              <p className="error">
                                {t("changepassword.confirmpassword-req")}
                              </p>
                            )}
                          </Form.Group>
                        </Col>
                      </>
                    )}
                  </Row>
                  <div className="d-flex mt-5">
                    <Button className="primary mr-1" type="submit">
                      {t("button.submit")}
                    </Button>
                    <Button variant="outline-primary" onClick={backClick}>
                      {t("button.cancel")}
                    </Button>
                  </div>
                </Form>
              </div>
            </div>
          </div>
        </Col>
      </Row>
      <Changepassword show={showModal} handleClose={handleModalClose} />
    </Container>
  );
};

export default ChangePasswordForm;
