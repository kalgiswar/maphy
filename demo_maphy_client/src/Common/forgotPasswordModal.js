import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Modal,
  Button,
  Form,
  Alert,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import "./_modal.scss";

const Domain = process.env.REACT_APP_API_URL;

const ForgotPasswordModal = ({ show, handleClose }) => {
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm();
  const { t } = useTranslation();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    newPass: false,
    confirm: false,
  });

  const togglePassword = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const onSubmit = async (data) => {
    if (!isOtpSent) {
      try {
        const response = await axios.post(`${Domain}/users/generateotp`, {
          email: data.email,
        });
        if (response?.data?.success) {
          setSuccess(response?.data?.message);
          setIsOtpSent(true);
        } else {
          setError(response?.data?.message);
        }
      } catch (err) {
        setError(t("alert.error"));
        setSuccess("");
      }
    } else {
      try {
        const response = await axios.put(`${Domain}/users/password/update`, {
          email: data.email,
          otp: data.otp,
          password: data.confirmPassword,
        });
        if (response?.data?.success) {
          setSuccess(response?.data?.message);
          handleClose();
        } else {
          setError(response?.data?.message);
        }
      } catch (err) {
        setError(t("alert.error"));
      }
    }
  };

  useEffect(() => {
    if (!show) {
      reset();
      setIsOtpSent(false);
      setError("");
      setSuccess("");
      setShowPasswords({ newPass: false, confirm: false });
    }
  }, [show, reset]);

  return (
    <Modal show={show} onHide={handleClose} dialogClassName="custom-modal">
      <Modal.Header closeButton>
        <Modal.Title>{t("login.sentemail")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="new-form">
          <Container fluid>
            <Row>
              <Col md={9}>
                <div>
                  <div className="addProperty wrapper">
                    <div className="basicDetails pt-4">
                      <Form onSubmit={handleSubmit(onSubmit)}>
                        <Row>
                          {error && <Alert variant="danger">{error}</Alert>}
                          {success && (
                            <Alert variant="success">{success}</Alert>
                          )}
                          <Col sm={12}>
                            <div>
                              <Form.Group>
                                <Form.Control
                                  type="email"
                                  {...register("email", {
                                    required: true,
                                    pattern: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/,
                                  })}
                                  disabled={isOtpSent}
                                />
                                {errors?.email && (
                                  <span className="error">
                                    {t("login.emailreq")}
                                  </span>
                                )}
                              </Form.Group>
                            </div>
                            <br />
                            {isOtpSent && (
                              <>
                                <div>
                                  <Form.Group>
                                    <Form.Control
                                      type="text"
                                      placeholder={t("login.otp")}
                                      {...register("otp", { required: true })}
                                    />
                                    {errors?.otp && (
                                      <span className="error">
                                        {t("login.otpreq")}
                                      </span>
                                    )}
                                  </Form.Group>
                                </div>
                                <br />
                                <div>
                                  <Form.Group>
                                    <div className="password-wrapper">
                                      <Form.Control
                                        type={
                                          showPasswords.newPass
                                            ? "text"
                                            : "password"
                                        }
                                        placeholder={t("login.newPassword")}
                                        {...register("newPassword", {
                                          required: true,
                                        })}
                                      />
                                      <span
                                        className="eye-icon"
                                        onClick={() =>
                                          togglePassword("newPass")
                                        }
                                      >
                                        <FontAwesomeIcon
                                          icon={
                                            showPasswords.newPass
                                              ? faEyeSlash
                                              : faEye
                                          }
                                        />
                                      </span>
                                    </div>
                                    {errors?.newPassword && (
                                      <span className="error">
                                        {t("login.newPasswordReq")}
                                      </span>
                                    )}
                                  </Form.Group>
                                </div>
                                <br />
                                <div>
                                  <Form.Group>
                                    <div className="password-wrapper">
                                      <Form.Control
                                        type={
                                          showPasswords.confirm
                                            ? "text"
                                            : "password"
                                        }
                                        placeholder={t("login.confirmPassword")}
                                        {...register("confirmPassword", {
                                          required: true,
                                          validate: (value) =>
                                            value ===
                                              getValues("newPassword") ||
                                            t("login.passwordsMatch"),
                                        })}
                                      />
                                      <span
                                        className="eye-icon"
                                        onClick={() =>
                                          togglePassword("confirm")
                                        }
                                      >
                                        <FontAwesomeIcon
                                          icon={
                                            showPasswords.confirm
                                              ? faEyeSlash
                                              : faEye
                                          }
                                        />
                                      </span>
                                    </div>
                                    {errors?.confirmPassword && (
                                      <span className="error">
                                        {t("login.confirmPasswordReq")}
                                      </span>
                                    )}
                                  </Form.Group>
                                </div>
                              </>
                            )}
                          </Col>
                        </Row>
                        <Button className="primary mt-3" type="submit">
                          {isOtpSent ? t("button.save") : t("login.sent")}
                        </Button>
                      </Form>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ForgotPasswordModal;
