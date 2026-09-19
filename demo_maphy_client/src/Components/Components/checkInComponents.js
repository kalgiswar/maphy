import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useTranslation } from "react-i18next";
import { common } from "../../Common/common";

const Domain = process.env.REACT_APP_API_URL;

const CheckInComponents = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const { t } = useTranslation();
  let { id, assignedPivotId } = useParams();
  const [componentName, setComponentName] = useState("");
  const [remainingQty, setRemainingQty] = useState("");
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    const initialize = async () => {
      await getDetails();
    };
    initialize();
  }, [id]);

  const getDetails = async () => {
    try {
      const response = await axios.get(`${Domain}/components/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response?.data) {
        const { name, remaining } = response.data;
        setComponentName(name);
        setRemainingQty(remaining);
        setValue("name", name);
      } else setApiError(t("alert.error"));
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const onSubmit = async (data) => {
    const body = {
      assigned_qty: data?.qty,
      notes: data?.notes,
    };

    try {
      const response = await axios({
        method: "post",
        url: `${Domain}/components/${assignedPivotId}/checkin`,
        data: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response?.data?.success) {
        common.notify("S", t("Checkin.success"));
        navigate(`/componentsDetails/${id}`);
      } else setApiError(response?.data?.message);
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const backClick = () => {
    navigate(`/componentsDetails/${id}`);
  };

  return (
    <Container fluid>
      <Row>
        <Col md={12}>
          <div>
            <div className="title d-flex justify-content-between">
              <div>
                <h1>
                  {" "}
                  {componentName} ({remainingQty})
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
                          {t("component.name")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Col md={8} sm={12}>
                          <Form.Control
                            type="text"
                            placeholder={t("component.name")}
                            {...register("name", { required: true })}
                            className="gen-form-control"
                            disabled
                          />
                        </Col>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("component.qty")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Col md={8} sm={12}>
                          <Form.Control
                            type="text"
                            placeholder={t("component.qty")}
                            {...register("qty", {
                              required: true,
                              pattern: /^\s*[1-9]\d*\s*$/,
                            })}
                            className="gen-form-control"
                          />
                        </Col>
                        {errors?.qty?.type === "required" && (
                          <p className="error">{t("component.quantityreq")}</p>
                        )}
                        {errors?.qty?.type === "pattern" && (
                          <p className="error">{t("component.invalid_data")}</p>
                        )}
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("component.notes")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Col md={8} sm={12}>
                          <Form.Control
                            as="textarea"
                            placeholder={t("component.notes")}
                            {...register("notes", { required: true })}
                            className="gen-form-control"
                          />
                        </Col>
                        {errors.notes && (
                          <p className="error">{t("component.notesreq")}</p>
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
                </Form>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default CheckInComponents;
