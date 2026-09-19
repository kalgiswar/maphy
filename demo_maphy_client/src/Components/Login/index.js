import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Form, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import loginImage from "../../images/Maphy.png";
import logo from "../../images/applify-logo-white.png";
import axios from "axios";
import Loader from "../Layout/loader";
import { registerLoaderCallback } from "../../Common/loaderService";
import "../../scss/variable.scss";
import "./login_premium.css";
import { useTranslation } from "react-i18next";
import ForgotPassword from "../../Common/forgotPasswordModal";
import { jwtDecode } from "jwt-decode";
import { InputGroup } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faSyncAlt } from "@fortawesome/free-solid-svg-icons";

const Domain = process.env.REACT_APP_API_URL;

function Login() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
  } = useForm();
  const [errorMessage, setErrorMessage] = useState("");
  const { t } = useTranslation();
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("maphytoken")) {
      navigate("/Dashboard", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    registerLoaderCallback((isLoading) => {
      setGlobalLoading(isLoading);
    });
    return () => registerLoaderCallback(null);
  }, []);

  const onSubmit = async (data) => {
    console.log("Attempting login...");
    clearErrors();
    try {
      const response = await axios.post(`${Domain}/users/login`, {
        email: data.email,
        password: data.password,
      });

      if (response?.data?.success) {
        const token = response?.data?.accessToken;
        localStorage.setItem("maphytoken", token);
        localStorage.setItem(
          "permissions",
          JSON.stringify(response?.data?.permissions)
        );
        localStorage.setItem("onboarding_dismissed", response?.data?.onboarding_dismissed ? "true" : "false");
        const decodedToken = jwtDecode(token);
        console.log("Decoded Token:", decodedToken);
        localStorage.setItem("firm_id", decodedToken.firmId);
        console.log("Firm ID stored:", decodedToken.firmId);
        navigate("/Dashboard");
      } else setErrorMessage(response?.data?.message);
    } catch (error) {
      setErrorMessage(t("alert.error"));
    }
  };

  const handleShowForgotPassword = () => setShowForgotPasswordModal(true);
  const handleCloseForgotPassword = () => {
    setShowForgotPasswordModal(false);
    clearErrors();
  };



  const renderNewLogin = () => {
    return (
      <div className="premium-login-container">
        {/* Left Side: Brand Panel */}
        <div className="premium-brand-panel">
          <div className="brand-panel-content">
            <div className="brand-logo-wrapper">
              <img
                src={logo}
                alt="Logo"
                className="premium-logo-img"
              />
            </div>
            
            <div className="brand-text-wrapper">
              <h1 className="brand-heading">Maphy</h1>
              <p className="brand-tagline">
                {t("login.maphy")}
              </p>
            </div>
            
            {/* Elegant SVG Asset Network Illustration */}
            <div className="asset-pattern-svg">
              <svg width="100%" height="240" viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Connecting Lines */}
                <line x1="80" y1="120" x2="200" y2="60" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
                <line x1="80" y1="120" x2="200" y2="180" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
                <line x1="200" y1="60" x2="320" y2="120" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
                <line x1="200" y1="180" x2="320" y2="120" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
                <line x1="200" y1="60" x2="200" y2="180" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeDasharray="6 6" />

                {/* Nodes with pulses */}
                <g className="node-group">
                  <circle cx="80" cy="120" r="24" fill="rgba(23, 168, 252, 0.1)" />
                  <circle cx="80" cy="120" r="12" fill="rgba(23, 168, 252, 0.2)" />
                  <circle cx="80" cy="120" r="6" fill="#17a8fc" />
                </g>

                <g className="node-group">
                  <circle cx="200" cy="60" r="32" fill="rgba(2, 157, 247, 0.1)" />
                  <circle cx="200" cy="60" r="16" fill="rgba(2, 157, 247, 0.2)" />
                  <circle cx="200" cy="60" r="8" fill="#029df7" />
                </g>

                <g className="node-group">
                  <circle cx="200" cy="180" r="32" fill="rgba(43, 175, 252, 0.1)" />
                  <circle cx="200" cy="180" r="16" fill="rgba(43, 175, 252, 0.2)" />
                  <circle cx="200" cy="180" r="8" fill="#2baffc" />
                </g>

                <g className="node-group">
                  <circle cx="320" cy="120" r="24" fill="rgba(23, 168, 252, 0.1)" />
                  <circle cx="320" cy="120" r="12" fill="rgba(23, 168, 252, 0.2)" />
                  <circle cx="320" cy="120" r="6" fill="#17a8fc" />
                </g>
              </svg>
            </div>
            
            <div className="brand-footer">
              <span>&copy; {new Date().getFullYear()} Maphy. All rights reserved.</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form Panel */}
        <div className="premium-form-panel">
          <div className="premium-login-card">
            {/* Mobile-only branding display */}
            <div className="premium-mobile-branding">
              <img
                src={logo}
                alt="Logo"
                className="premium-mobile-logo"
              />
              <p className="premium-mobile-subtitle">{t("login.maphy")}</p>
            </div>

            <div className="form-header">
              <h2 className="premium-login-header-text">{t("login.login")}</h2>
              <p className="form-instruction">Please enter your credentials to access your asset dashboard.</p>
            </div>

            <Form
              noValidate
              onSubmit={handleSubmit(onSubmit)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit(onSubmit)();
                }
              }}
              autoComplete="off"
            >
              <Form.Group className="form-group">
                <Form.Label>{t("login.email")}</Form.Label>
                <div className="premium-input-wrapper">
                  <Form.Control
                    type="email"
                    placeholder={t("login.email")}
                    {...register("email", {
                      required: true,
                      pattern: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/,
                    })}
                  />
                </div>
                {errors?.email?.type === "required" && (
                  <span className="text-danger">{t("login.emailreq")}</span>
                )}
                {errors?.email?.type === "pattern" && (
                  <span className="text-danger">{t("login.invalidemail")}</span>
                )}
              </Form.Group>

              <Form.Group className="form-group">
                <Form.Label>{t("login.password")}</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    placeholder={t("login.password")}
                    {...register("password", {
                      required: true,
                    })}
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </Button>
                </InputGroup>
                {errors?.password && (
                  <span className="text-danger">{t("login.passreq")}</span>
                )}
              </Form.Group>

              {errorMessage && (
                <Alert className="alert alert-danger">{errorMessage}</Alert>
              )}

              <div className="premium-btn-group">
                <Button className="btn-submit-premium" type="submit">
                  {t("login.submit")}
                </Button>
                <Button
                  className="btn-forgot-premium"
                  onClick={handleShowForgotPassword}
                >
                  {t("login.forgotpassword")}
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {globalLoading && <Loader />}
      {renderNewLogin()}

      <ForgotPassword
        show={showForgotPasswordModal}
        handleClose={handleCloseForgotPassword}
      />
    </>
  );
}

export default Login;

