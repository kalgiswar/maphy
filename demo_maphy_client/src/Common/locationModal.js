import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Select from "react-select";
import { countries } from "countries-list";
import { useTranslation } from "react-i18next";
import Modal from "react-bootstrap/Modal";
import "./_modal.scss";
import "font-awesome/css/font-awesome.min.css";
import { common } from "../Common/common";
const Domain = process.env.REACT_APP_API_URL;

function AddLocation(props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm();
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryList, setCountryList] = useState([]);

  useEffect(() => {
    const countriesArray = Object.keys(countries)
      .map((code) => ({
        value: code,
        label: countries[code].name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
    countriesArray.unshift({ value: "", label: "Select Country" });
    setCountryList(countriesArray);
  }, []);

  const onSubmit = async (data) => {
    const countryCode = selectedCountry ? selectedCountry.value : "";
    const body = {
      city: data?.city,
      country: countryCode,
      name: data?.location,
    };
    try {
      const response = await axios({
        method: "post",
        url: `${Domain}/locations`,
        data: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response?.data?.success) {
        setMessage("");
        setSelectedCountry("");
        common.notify("S", response?.data?.message);
        reset();
        props.onLocationSubmit(response?.data?.location);
      } else setMessage(response?.data?.message);
    } catch (error) {
      setMessage(t("alert.error"));
    }
  };
  const onClose = () => {
    setSelectedCountry("");
    setMessage("");
    props.handleClose();
    reset();
  };
  return (
    <>
      <Modal
        show={props.show}
        onHide={onClose}
        backdrop="static"
        keyboard={false}
        animation={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>{t("location.create")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="new-form">
            <Container fluid>
              <Row>
                <Col md={9}>
                  <div>
                    <div className="addProperty wrapper">
                      <div className="basicDetails pt-4">
                        <Form
                          className="mb-3"
                          onSubmit={handleSubmit(onSubmit)}
                        >
                          <Row>
                            {message && (
                              <div className="alert alert-danger">
                                {message}
                              </div>
                            )}
                            <Col sm={12}>
                              <div>
                                <Form.Group className="mb-3">
                                  <Form.Label>
                                    {t("departments.location")}
                                    <span className="mandatory">*</span>
                                  </Form.Label>
                                  <Form.Control
                                    type="text"
                                    placeholder={t("departments.location")}
                                    {...register("location", {
                                      required: true,
                                    })}
                                    className="gen-form-control"
                                  />
                                  {errors.location && (
                                    <p className="error">
                                      {t("departments.locationreqd")}
                                    </p>
                                  )}
                                </Form.Group>
                              </div>
                              <Form.Group className="mb-3">
                                <Form.Label>
                                  {t("departments.city")}
                                  <span className="mandatory">*</span>
                                </Form.Label>
                                <Form.Control
                                  type="text"
                                  placeholder={t("departments.city")}
                                  {...register("city", { required: true })}
                                  className="gen-form-control"
                                />
                                {errors.city && (
                                  <p className="error">
                                    {t("departments.cityreqd")}
                                  </p>
                                )}
                              </Form.Group>
                              <Form.Group className="mb-3">
                                <Form.Label>
                                  {t("departments.country")}
                                  <span className="mandatory">*</span>
                                </Form.Label>
                                <Select
                                  placeholder={t("select.country")}
                                  {...register("country", { required: true })}
                                  options={countryList}
                                  value={selectedCountry}
                                  onChange={(selectedOption) => {
                                    setSelectedCountry(selectedOption);
                                    setValue(
                                      "country",
                                      selectedOption
                                        ? selectedOption.value
                                        : "",
                                      {
                                        shouldValidate: true,
                                      }
                                    );
                                  }}
                                />
                                {errors.country && (
                                  <p className="error">
                                    {t("departments.countryreqd")}
                                  </p>
                                )}
                              </Form.Group>
                            </Col>
                          </Row>
                          <div className="d-flex mt-5">
                            <Button className="primary mr-1" type="submit">
                              {t("button.save")}
                            </Button>
                            <Button variant="outline-primary" onClick={onClose}>
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
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default AddLocation;
