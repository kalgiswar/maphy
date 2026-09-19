import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useTranslation } from "react-i18next";
import { common } from "../../Common/common";

const Domain = process.env.REACT_APP_API_URL;

const CheckInAssets = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const { t } = useTranslation();
  let { id } = useParams();
  const locationpath = useLocation(); // Set initial state to "user"
  const [apiError, setApiError] = useState("");
  const { rowData } = (locationpath?.state) ? locationpath.state : [];
  
  useEffect(() => {
    const initialize = async () => {
      if (rowData) {
        const fields = ["name", "serial"];
        fields.forEach((field) => {
          setValue(field, rowData[field]);
        });
      }
      else
        navigate("/license");
    };
    initialize();
  }, [id]);

  const onSubmit = async (data) => {
     try {
      const response = await axios({
        method: 'post',
        url: Domain + `/licenses/${id}/checkin`,
        data: JSON.stringify({
          notes: data?.notes,
        }),
        headers: { 'Content-Type': 'application/json' }
      });
      if (response?.data?.success) {
        common.notify("S", t("Checkin.success"));
        navigate(`/licenseDetails/${rowData?.id}`, { state: { rowData: rowData, activeTab: "seats" } })
      } else {
        setApiError(response?.data?.message);
      }

    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const backClick = () => {
    navigate(`/licenseDetails/${rowData?.id}`, { state: { rowData: rowData, activeTab: "seats" } })
  };

  return (
    <Container fluid>
      <Row>
        <Col md={12}>
          <div>
            <div className="title d-flex justify-content-between">
              <div>
                <h1>{t("Checkout.checkinlicenseseat")}</h1>
              </div>
              <Button onClick={backClick} className="back">
                {t("button.back")}
              </Button>
            </div>
            <div className="addProperty wrapper">
              <div className="basicDetails pt-4">
                <Form className="mb-3" onSubmit={handleSubmit(onSubmit)} noValidate>
                  <Row>
                    {apiError && (<div className="alert alert-danger"> {apiError}  </div>)}
                    <Col md={6} sm={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("Checkout.AssetName")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Col md={8} sm={12}>
                          <Form.Control
                            type="text"
                            placeholder={t("Checkout.AssetName")}
                            {...register("name", { required: true })}
                            className="gen-form-control"
                            disabled
                          />
                        </Col>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("Checkout.serial")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Col md={8} sm={12}>
                          <Form.Control
                            type="text"
                            placeholder={t("Checkout.serial")}
                            {...register("serial", { required: true })}
                            className="gen-form-control"
                            disabled
                          />
                        </Col>
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
                        {t("button.submit")}
                      </Button>
                      <Button variant="outline-primary" onClick={backClick}>
                        {t("button.btnCancel")}
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

export default CheckInAssets;
