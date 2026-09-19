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

const AddManufactures = () => {
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
      const response = await axios.get(`${Domain}/manufacturers/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("API response:", response?.data); // Log the entire response for debugging

      if (response?.data) {
        const fields = [
          "name",
          "url",
          "support_url",
          "support_email",
          "support_phone",
        ];
        fields.forEach((field) => {
          setValue(field, response?.data[field]);
          console.log(`Setting field ${field} to`, response?.data[field]); // Debugging line
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
      support_email: data.support_email,
      support_phone: data.support_phone,
      support_url: data.support_url,
      url: data.url,
    };
    try {
      const response = await axios({
        method: isAddMode ? "post" : "put",
        url: isAddMode
          ? `${Domain}/manufacturers`
          : `${Domain}/manufacturers/${id}`,
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
          navigate("/manufactures");
        }
      } else {
        setApiError(response?.data?.message);
      }
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const backClick = () => {
    navigate("/manufactures");
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
                    ? t("manufacturers.createmanufacture")
                    : t("manufacturers.updatemanufacture")}
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
                          {t("manufacturers.name")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder={t("manufacturers.entermanufacture")}
                          {...register("name", { required: true })}
                          className="gen-form-control"
                        />
                        {errors.name && (
                          <p className="error">
                            {t("manufacturers.namerequired")}
                          </p>
                        )}
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("manufacturers.url")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder={t("manufacturers.enterurl")}
                          ref={register}
                          {...register("url", {
                            required: true,
                            pattern:
                              /^(?:(?:https?|ftp):\/\/)?(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})+(?:\/\S*)?$/,
                          })}
                          className="gen-form-control"
                        />
                        {errors.url?.type === "required" && (
                          <p className="error">
                            {t("manufacturers.urlrequired")}
                          </p>
                        )}
                        {errors.url?.type === "pattern" && (
                          <p className="error">
                            {t("manufacturers.invalidurl")}
                          </p>
                        )}
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("manufacturers.support_url")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder={t("manufacturers.entersupport_url")}
                          ref={register}
                          {...register("support_url", {
                            required: true,
                            pattern:
                              /^(?:(?:https?|ftp):\/\/)?(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})+(?:\/\S*)?$/,
                          })}
                          className="gen-form-control"
                        />
                        {errors.support_url?.type === "required" && (
                          <p className="error">
                            {t("manufacturers.support_urlrequired")}
                          </p>
                        )}
                        {errors.support_url?.type === "pattern" && (
                          <p className="error">
                            {t("manufacturers.invalidsuppurl")}
                          </p>
                        )}
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("manufacturers.support_phone")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Form.Control
                          type="tel"
                          placeholder={t("manufacturers.entersupport_phone")}
                          name="support_phone"
                          ref={register}
                          {...register("support_phone", {
                            required: true,
                            pattern: /^[0-9]{10}$/,
                          })}
                          className="gen-form-control"
                          maxLength={10}
                          onKeyPress={(event) => {
                            const pattern = /[0-9]/; // Only allow numeric digits
                            const inputChar = String.fromCharCode(
                              event.charCode,
                            );
                            if (!pattern.test(inputChar)) {
                              event.preventDefault();
                            }
                          }}
                        />

                        {errors.support_phone?.type === "required" && (
                          <p role="alert" className="error">
                            {t("manufacturers.support_phonerequired")}
                          </p>
                        )}
                        {errors.support_phone?.type === "pattern" && (
                          <p role="alert" className="error">
                            {t("manufacturers.invalidphone")}
                          </p>
                        )}
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("manufacturers.support_email")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Form.Control
                          type="email"
                          placeholder={t("manufacturers.entersupport_email")}
                          className="gen-form-control"
                          name="support_email"
                          ref={register}
                          {...register("support_email", {
                            required: true,
                            pattern: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/,
                          })}
                        />

                        {errors?.support_email?.type === "required" && (
                          <p role="alert" className="error">
                            {t("manufacturers.support_emailrequired")}
                          </p>
                        )}
                        {errors?.support_email?.type === "pattern" && (
                          <p role="alert" className="error">
                            {t("manufacturers.invalidemail")}
                          </p>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                  <div className="d-flex mt-5">
                    <Button className="primary mr-1" type="submit">
                      {t("manufacturers.submit")}
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

export default AddManufactures;
