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
  const [locations, setLocation] = useState([]);
  const [statusLabels, setStatusLabels] = useState([]);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    const initialize = async () => {
      await fetchDropdownData();
      await getDetails();
    };
    initialize();
  }, [id]);

  const fetchDropdownData = async () => {
    try {
      const [locationResponse, statusLabelsResponse] = await Promise.all([
        axios.get(`${Domain}/locations/selectList?page=1`),
        axios.get(`${Domain}/statuslabels/selectList?page=1&type=checkin`),
      ]);

      if (locationResponse?.data) {
        setLocation(locationResponse.data.items);
      }
      if (statusLabelsResponse?.data) {
        setStatusLabels(statusLabelsResponse.data.items);
      } else {
        setApiError(t("alert.dropdown"));
      }
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const getDetails = async () => {
    try {
      const response = await axios.get(`${Domain}/hardware/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response?.data) {
        const fields = ["model", "assetname"];

        fields.forEach((field) => {
          setValue(field, response?.data[field]);
        });

        setValue("model", response?.data?.model?.id);
        setValue("assetname", response?.data?.name);
      } else {
        setApiError(t("alert.error"));
      }
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const onSubmit = async (data) => {
    const body = {
      name: data?.assetname,
      assigned_location: data?.location,
      status_id: data?.status_label,
      expected_checkin: data?.checkin_date,
      model_id: data?.model,
      note: data?.notes,
    };

    try {
      const response = await axios({
        method: "post",
        url: `${Domain}/hardware/${id}/checkin`,
        data: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response?.data?.success) {
        common.notify("S", t("Checkin.success"));
        navigate("/deployed");
      } else {
        setApiError(response?.data?.message);
      }
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const validateNotFutureDate = (value) => {
    const selectedDate = new Date(value);
    const today = new Date();
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return selectedDate <= today;
  };

  const backClick = () => {
    navigate("/deployed");
  };

  return (
    <Container fluid>
      <Row>
        <Col md={12}>
          <div>
            <div className="title d-flex justify-content-between">
              <div>
                <h1>{t("Checkin.checkinasset")}</h1>
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
                          {t("Checkout.model_id")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Col md={8} sm={12}>
                          <Form.Control
                            type="text"
                            placeholder={t("Checkout.model_id")}
                            {...register("model", { required: true })}
                            className="gen-form-control"
                            disabled
                          />
                        </Col>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("Checkin.name")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Col md={8} sm={12}>
                          <Form.Control
                            type="text"
                            placeholder={t("Checkin.name")}
                            {...register("assetname", { required: true })}
                            className="gen-form-control"
                            disabled
                          />
                        </Col>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("Checkin.status_id")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Col md={8} sm={12}>
                          <Form.Select
                            {...register("status_label", { required: true })}
                            className="gen-form-control"
                          >
                            <option value="">{t("select.status")}</option>
                            {statusLabels.map((statusLabel) => (
                              <option
                                key={statusLabel.id}
                                value={statusLabel.id}
                              >
                                {statusLabel.text}
                              </option>
                            ))}
                          </Form.Select>
                        </Col>
                        {errors.status_label && (
                          <p className="error">{t("select.status_labelreq")}</p>
                        )}
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("Checkin.assigned_location")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Col md={8} sm={12}>
                          <Form.Select
                            {...register("location", { required: true })}
                            className="gen-form-control"
                          >
                            <option value="">
                              {t("Checkin.assigned_location")}
                            </option>
                            {locations.map((location) => (
                              <option key={location.id} value={location.id}>
                                {location.text}
                              </option>
                            ))}
                          </Form.Select>
                        </Col>
                        {errors.location && (
                          <p className="error">{t("select.locationreq")}</p>
                        )}
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("Checkin.expected_checkin")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Col md={8} sm={12}>
                          <Form.Control
                            type="date"
                            placeholder={t("Checkin.expected_checkin")}
                            {...register("checkin_date", {
                              required: true,
                              validate: validateNotFutureDate,
                            })}
                            className="gen-form-control"
                          />
                        </Col>
                        {errors.checkin_date?.type === "required" && (
                          <p className="error">
                            {t("Checkin.checkin_date_req")}
                          </p>
                        )}
                        {errors.checkin_date?.type === "validate" && (
                          <p className="error">
                            {t("Checkin.checkin_invalid_date")}
                          </p>
                        )}
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("Checkin.notes")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Col md={8} sm={12}>
                          <Form.Control
                            as="textarea"
                            placeholder={t("Checkin.notes")}
                            {...register("notes", { required: true })}
                            className="gen-form-control"
                          />
                        </Col>
                        {errors.notes && (
                          <p className="error">{t("Checkin.notesreq")}</p>
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
