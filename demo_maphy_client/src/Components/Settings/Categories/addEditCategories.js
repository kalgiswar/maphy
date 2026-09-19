import React, { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import axios from "axios";
import { common } from "../../../Common/common";

const Domain = process.env.REACT_APP_API_URL;

const AddCategories = () => {
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

  const getCategoryDetails = useCallback(async () => {
    try {
      const response = await axios.get(`${Domain}/categories/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response?.data) {
        const fields = [
          "name",
          "category_type",
          "eula_text",
          "has_eula",
          "checkin_email",
          "require_acceptance",
        ];
        fields.forEach((field) => {
          setValue(field, response?.data[field]);
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
      getCategoryDetails();
    }
  }, [isAddMode, getCategoryDetails]);

  const onSubmit = async (data) => {
    setApiError("");
    const body = {
      name: data?.name,
      category_type: data?.category_type,
      eula_text: data?.eula_text,
      has_eula: data?.has_eula,
      checkin_email: data?.checkin_email,
      require_acceptance: data?.require_acceptance,
    };

    try {
      const response = await axios({
        method: isAddMode ? "post" : "put",
        url: isAddMode ? `${Domain}/categories` : `${Domain}/categories/${id}`,
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
          navigate("/categories");
        }
      } else {
        setApiError(response?.data?.message);
      }
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const backClick = () => {
    navigate("/categories");
  };

  return (
    <div className="form-wrapper">
      <Container fluid>
        <Row>
          <Col md={12}>
            <div>
              <div className="title d-flex justify-content-between">
                <div>
                  <h1>
                    {isAddMode
                      ? t("category.categeoriestitle")
                      : t("category.updatecategory")}
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
                    {apiError && (
                      <div className="alert alert-danger ">{apiError}</div>
                    )}
                    <Row sm={12}>
                      <Col md={4} sm={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("category.name")}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder={t("category.name")}
                            {...register("name", { required: true })}
                            className="first-textbox-dropdown"
                          />
                          {errors?.name && (
                            <p role="alert" className="error">
                              {t("category.namerequired")}
                            </p>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={4} sm={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("category.category_type")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Form.Select
                            {...register("category_type", { required: true })}
                            className="textbox-dropdown"
                          >
                            <option value="">{t("select.category")} </option>
                            <option value="Accessory">
                              {t("category.Accessory")}
                            </option>
                            <option value="License">
                              {t("category.License")}
                            </option>
                            <option value="Consumable">
                              {t("category.Consumable")}
                            </option>
                            <option value="Component">
                              {t("category.Component")}
                            </option>
                            <option value="Asset">{t("category.Asset")}</option>
                          </Form.Select>
                          {errors?.category_type && (
                            <p role="alert" className="error">
                              {t("select.categoryreq")}
                            </p>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>
                    <div className="uploads pt-4">
                      <Row>
                        <Col md={8} sm={12}>
                          <Form.Group className="mb-3">
                            <Form.Label>{t("category.eula_text")}</Form.Label>
                            <Form.Control
                              as="textarea"
                              placeholder={t("category.eula_text")}
                              {...register("eula_text")}
                            />
                            <p>{t("category.eula")}</p>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6} sm={12}>
                          <Form.Group>
                            <Form.Check
                              type="checkbox"
                              label={t("category.has_eula")}
                              {...register("has_eula")}
                            />
                            <Form.Check
                              type="checkbox"
                              label={t("category.require_acceptance")}
                              {...register("require_acceptance")}
                            />
                            <Form.Check
                              type="checkbox"
                              label={t("category.checkin_email")}
                              {...register("checkin_email")}
                            />
                            {errors?.has_eula && (
                              <p role="alert" className="error">
                                {errors?.has_eula?.message}
                              </p>
                            )}
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <div className="d-flex mt-5">
                          <Button className="primary mr-1" type="submit">
                            {t("category.submit")}
                          </Button>
                          <Button variant="outline-primary" onClick={backClick}>
                            {t("category.btnCancel")}
                          </Button>
                        </div>
                      </Row>
                    </div>
                  </Form>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AddCategories;
