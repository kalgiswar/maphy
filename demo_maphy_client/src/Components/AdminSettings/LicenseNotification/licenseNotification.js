import { useForm } from "react-hook-form";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useTranslation } from "react-i18next";
import { common } from "../../../Common/common";

const Domain = process.env.REACT_APP_API_URL;

const AddAdminLicense = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    getDetails();
  }, []);

  const getDetails = async () => {
    try {
      const response = await axios.get(`${Domain}/licenseNotifications`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response?.data) {
        setValue("days", response?.data?.rows[0]?.no_of_days);
        setValue("description", response?.data?.rows[0]?.description);
      } else {
        setApiError(t("alert.error"));
      }
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const onSubmit = async (data) => {
    setApiError("");
    const body = {
      no_of_days: data?.days,
      description: data?.description,
    };
    try {
      const response = await axios({
        method: "post",
        url: `${Domain}/licenseNotifications`,
        data: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response?.data?.success) {
        common.notify("S", t("licenseExpiryNotifications.success"));
        navigate("/adminsetting");
      } else {
        setApiError(response.data.message);
      }
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const backClick = () => {
    navigate("/adminsetting");
  };

  return (
    <Container fluid>
      <Row>
        <Col md={8}>
          <div>
            <div className="title d-flex justify-content-between">
              <div>
                <h1>{t("licenseExpiryNotifications.license_notifications")}</h1>
              </div>
              <Button onClick={backClick} className="back">
                {t("button.back")}
              </Button>
            </div>
            <div className="addProperty wrapper">
              <div className="basicDetails pt-4">
                <Form
                  className="mb-3"
                  onSubmit={handleSubmit(onSubmit)}
                  noValidate
                >
                  <Row>
                    {apiError && (
                      <div className="alert alert-danger"> {apiError} </div>
                    )}
                    <Col md={8} sm={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("licenseExpiryNotifications.days")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Form.Control
                          type="number"
                          placeholder={t("licenseExpiryNotifications.days")}
                          {...register("days", {
                            required: true,
                            pattern: /^\s*(?=.*[1-9])\d*(?:\.\d{1,2})?\s*$/,
                          })}
                          className="gen-form-control"
                        />
                        {errors?.days?.type === "required" && (
                          <p className="error">
                            {t("licenseExpiryNotifications.daysrequired")}
                          </p>
                        )}
                        {errors?.days?.type === "pattern" && (
                          <p className="error">{t("labels.invalid_data")}</p>
                        )}
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("licenseExpiryNotifications.description")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          placeholder={t(
                            "licenseExpiryNotifications.description"
                          )}
                          {...register("description", { required: true })}
                          className="gen-form-control"
                        />
                        {errors?.description?.type === "required" && (
                          <p className="error">
                            {t("licenseExpiryNotifications.descriptionreq")}
                          </p>
                        )}
                      </Form.Group>
                    </Col>
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
    </Container>
  );
};

export default AddAdminLicense;
