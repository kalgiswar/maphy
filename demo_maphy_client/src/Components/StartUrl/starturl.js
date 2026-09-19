import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import { useTranslation } from "react-i18next";
import { common } from "../../Common/common";

const Domain = process.env.REACT_APP_API_URL;

const StartURL = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const [shortUrl, setShortUrl] = useState("");

  const onSubmit = async (data) => {
    const body = {
      url: data?.url,
    };

    try {
      const response = await axios({
        method: "post",
        url: `${Domain}/shorturl`,
        data: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response?.data?.short_url) {
        setMessage("");
        setShortUrl(response?.data?.short_url);
        common.notify("S", "Short URL created successfully!");
        reset();
      } else {
        setMessage(response?.data?.message || "Failed to create short URL");
        setShortUrl("");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setMessage(t("alert.error"));
      setShortUrl("");
    }
  };

  const backClick = () => {
    navigate("/dashboard");
  };

  return (
    <Container fluid>
      <Row>
        <Col md={12}>
          <div>
            <div className="title d-flex justify-content-between">
              <h1>{t("starturl.title")}</h1>
              <Button onClick={backClick} className="back">
                {t("button.back")}
              </Button>
            </div>
            <div className="addProperty wrapper">
              <div className="basicDetails pt-4">
                <Form className="mb-3" onSubmit={handleSubmit(onSubmit)}>
                  <Row>
                    {message && (
                      <div
                        className="errorMessage"
                        role="alert"
                        style={{ color: "red" }}
                      >
                        {message}
                      </div>
                    )}
                    <Col md={6} sm={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("starturl.addurl")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Col md={12} sm={12}>
                          <Form.Control
                            as="textarea"
                            rows={5}
                            placeholder={t("starturl.placeholder")}
                            {...register("url", { required: true })}
                            className="gen-form-control"
                          />
                        </Col>
                        {errors.url && (
                          <p className="error">{t("starturl.urlreq")}</p>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md={12}>
                      <Alert variant={shortUrl ? "success" : "info"}>
                        <p
                          className="mb-2"
                          style={{ fontWeight: "500", fontSize: "16px" }}
                        >
                          {shortUrl
                            ? "Here is your short URL:"
                            : "Your short URL will appear here after submission"}
                        </p>
                        {shortUrl && (
                          <div
                            className="d-flex align-items-center"
                            style={{ gap: "10px" }}
                          >
                            <a
                              href={shortUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: "#0d6efd",
                                textDecoration: "underline",
                                fontWeight: "500",
                                fontSize: "16px",
                              }}
                            >
                              {shortUrl}
                            </a>
                          </div>
                        )}
                      </Alert>
                    </Col>
                  </Row>

                  <Button variant="primary mr-1" type="submit">
                    {t("button.submit")}
                  </Button>
                  <Button variant="outline-primary" onClick={backClick}>
                    {" "}
                    {t("button.btnCancel")}{" "}
                  </Button>
                </Form>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default StartURL;
