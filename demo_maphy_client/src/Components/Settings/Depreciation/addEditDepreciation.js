import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { common } from "../../../Common/common";
import axios from "axios";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useTranslation } from "react-i18next";

const Domain = process.env.REACT_APP_API_URL;

const AddDepreciations = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const { t } = useTranslation();
  let { id } = useParams();
  const isAddMode = !id;
  const [apiError, setApiError] = useState("");

  const getDetails = useCallback(async () => {
    try {
      const response = await axios.get(`${Domain}/depreciations/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response?.data) {
        const fields = ["name", "months", "residual_value"];
        fields.forEach((field) => {
          setValue(field, response.data[field]);
        });
      } else {
        setApiError(t("alert.error"));
      }
    } catch (error) {
      setApiError(t("alert.error"));
    }
  }, [id, setValue]);

  useEffect(() => {
    if (!isAddMode) {
      getDetails();
    }
  }, [id, isAddMode, getDetails]);

  const onSubmit = async (data) => {
    const body = {
      name: data.name,
      months: data.months,
      residual_value: data.residual_value,
    };
    try {
      const response = await axios({
        method: isAddMode ? "post" : "put",
        url: isAddMode
          ? `${Domain}/depreciations`
          : `${Domain}/depreciations/${id}`,
        data: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response?.data?.success) {
        const successMessage = response?.data?.message;
        common.notify("S", successMessage);
        if (sessionStorage.getItem("onboarding_active") === "true") {
          navigate("/Dashboard");
        } else {
          navigate("/depreciation");
        }
      } else {
        setApiError(response?.data?.message);
      }
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const backClick = () => {
    navigate("/depreciation");
  };

  return (
    <Container fluid>
      <Row>
        <Col md={12}>
          <div>
            <div className="title d-flex justify-content-between">
              <div>
                <h1>
                  {isAddMode
                    ? t("depreciation.createdepreciation")
                    : t("depreciation.updatedepreciation")}
                </h1>
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
                    <Col md={6} sm={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("depreciation.name")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder={t("depreciation.name")}
                          {...register("name", { required: true })}
                          className="gen-form-control"
                        />
                        {errors.name && (
                          <p className="error">{t("depreciation.namereq")}</p>
                        )}
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("depreciation.months")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Form.Control
                          type="number"
                          placeholder={t("depreciation.months")}
                          {...register("months", {
                            required: true,
                            pattern: /^\s*[1-9]\d*\s*$/,
                          })}
                          className="gen-form-control"
                        />
                        {errors.months?.type === "required" && (
                          <p className="error">{t("depreciation.monthreq")}</p>
                        )}
                        {errors.months?.type === "pattern" && (
                          <p role="alert" className="error">
                            {t("depreciation.zero")}
                          </p>
                        )}
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("depreciation.Residual_Value")}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Form.Control
                          type="number"
                          placeholder={t("depreciation.Residual_Value")}
                          {...register("residual_value", {
                            required: true,
                            pattern: /^\s*[1-9]\d*\s*$/,
                          })}
                          className="gen-form-control"
                        />
                        {errors?.residual_value?.type === "required" && (
                          <p className="error">
                            {t("depreciation.residulreq")}
                          </p>
                        )}
                        {errors.residual_value?.type === "pattern" && (
                          <p role="alert" className="error">
                            {t("depreciation.zero")}
                          </p>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                  <div className="d-flex mt-5">
                    <Button
                      className="primary mr-1"
                      type="submit"
                      // onclick={onSubmit}
                    >
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

export default AddDepreciations;
