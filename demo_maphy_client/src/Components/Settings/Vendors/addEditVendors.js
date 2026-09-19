import { useForm } from "react-hook-form";
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import { countries } from "countries-list";
import { common } from "../../../Common/common";

const Domain = process.env.REACT_APP_API_URL;

const Addvendors = (props) => {
  const {
    register,
    formState: { errors },
    setValue,
    getValues,
    setError,
    reset,
    clearErrors,
  } = useForm();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const params = useParams();
  const isModal = props && props.isModal;
  const id = isModal ? props.id : params.id;
  const isAddMode = !id;
  const [step, setStep] = useState(1);
  const [apiError, setApiError] = useState("");
  const [selectedCountry, setSelectedCountry] = useState();
  const [countryList, setCountryList] = useState([]);

  const getDetails = useCallback(
    async (countriesArray) => {
      try {
        const response = await axios.get(`${Domain}/suppliers/${id}`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response?.data) {
          const fields = [
            "name",
            "address",
            "address2",
            "city",
            "state",
            "country",
            "phone",
            "email",
            "contact",
            "url",
            "zip",
            "notes",
          ];
          fields.forEach((field) => {
            setValue(field, response?.data[field]);
          });
          if (response?.data?.country) {
            const selectedCountry = countriesArray.find(
              (country) => country.value === response?.data?.country
            );
            setSelectedCountry(
              selectedCountry || {
                value: response?.data?.country,
                label: response?.data?.country,
              }
            );
          }
        } else {
          setApiError(t("alert.error"));
        }
      } catch (error) {
        setApiError(t("alert.error"));
      }
    },
    [id, setValue, t]
  );

  useEffect(() => {
    const fetchCountriesAndDetails = async () => {
      const countriesArray = Object.keys(countries)
        .map((code) => ({
          value: code,
          label: countries[code].name,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));

      countriesArray.unshift({ value: "", label: "Select Country" }); // Add placeholder at the beginning
      setCountryList(countriesArray);

      if (!isAddMode) {
        await getDetails(countriesArray);
      }
    };

    fetchCountriesAndDetails();
  }, [isAddMode, getDetails]);

  const handleNextStep = () => {
    if (step === 1) {
      const values = getValues();
      let valid = true;
      clearErrors();

      if (!values.name || !String(values.name).trim()) {
        setError("name", { type: "required" });
        valid = false;
      }
      if (!values.contact || !String(values.contact).trim()) {
        setError("contact", { type: "required" });
        valid = false;
      }
      if (!values.phone || !String(values.phone).trim()) {
        setError("phone", { type: "required" });
        valid = false;
      } else if (!/^[0-9]{10}$/.test(String(values.phone))) {
        setError("phone", { type: "pattern" });
        valid = false;
      }
      if (!values.email || !String(values.email).trim()) {
        setError("email", { type: "required" });
        valid = false;
      } else if (!/^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/.test(String(values.email))) {
        setError("email", { type: "pattern" });
        valid = false;
      }
      if (!values.url || !String(values.url).trim()) {
        setError("url", { type: "required" });
        valid = false;
      } else if (
        !/^(?:(?:https?|ftp):\/\/)?(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})+(?:\/\S*)?$/.test(
          String(values.url)
        )
      ) {
        setError("url", { type: "pattern" });
        valid = false;
      }

      if (valid) {
        setStep(2);
      }
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Reset form state on mount so modal always starts fresh
  useEffect(() => {
    setStep(1);
    clearErrors();
  }, []);

  const renderProgressBar = () => {
    const progressPercent = ((step - 1) / 1) * 100;
    return (
      <div className="wizard-progress-container mb-5">
        <div className="wizard-progress-bar" style={{ width: `${progressPercent}%` }}></div>
        <div className="wizard-steps-indicator">
          <div className={`wizard-step-node ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <span className="step-num">{step > 1 ? '✓' : '1'}</span>
            <span className="step-label">{t("supplier.step_contact") || "General & Contact"}</span>
          </div>
          <div className={`wizard-step-node ${step >= 2 ? 'active' : ''}`}>
            <span className="step-num">2</span>
            <span className="step-label">{t("supplier.step_address") || "Address & Notes"}</span>
          </div>
        </div>
      </div>
    );
  };

  const handleSubmitClick = async () => {
    const values = getValues();
    let valid = true;
    clearErrors();

    if (!values.address || !String(values.address).trim()) {
      setError("address", { type: "required" });
      valid = false;
    }
    if (!values.city || !String(values.city).trim()) {
      setError("city", { type: "required" });
      valid = false;
    }
    if (!values.state || !String(values.state).trim()) {
      setError("state", { type: "required" });
      valid = false;
    }
    if (!selectedCountry || !selectedCountry.value) {
      setError("country", { type: "required" });
      valid = false;
    }
    if (!values.zip || !String(values.zip).trim()) {
      setError("zip", { type: "required" });
      valid = false;
    } else if (!/^[0-9]{6}$/.test(String(values.zip))) {
      setError("zip", { type: "pattern" });
      valid = false;
    }

    if (!valid) return;

    setApiError("");
    const countryCode = selectedCountry ? selectedCountry.value : "";
    const body = {
      name: values.name,
      address: values.address,
      address2: values.address2,
      city: values.city,
      state: values.state,
      country: countryCode,
      phone: values.phone,
      email: values.email,
      contact: values.contact,
      url: values.url,
      zip: values.zip,
      notes: values.notes,
    };

    try {
      const response = await axios({
        method: isAddMode ? "post" : "put",
        url: isAddMode ? `${Domain}/suppliers` : `${Domain}/suppliers/${id}`,
        data: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response?.data?.success) {
        const successMessage = response?.data?.message;
        common.notify("S", successMessage);
        reset();
        if (sessionStorage.getItem("onboarding_active") === "true") {
          navigate("/Dashboard");
        } else if (isModal) {
          props.onSuccess();
        } else {
          navigate("/vendors");
        }
      } else {
        setApiError(response?.data?.message);
      }
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const backClick = async () => {
    if (isModal) {
      props.handleClose();
    } else {
      navigate("/vendors");
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col md={12}>
          <div>
            {!isModal && (
              <div className="title d-flex justify-content-between">
                <div>
                  <h1>
                    {isAddMode ? t("supplier.create") : t("supplier.update")}
                  </h1>
                </div>
                <Button onClick={backClick} className="back">
                  {t("button.back")}
                </Button>
              </div>
            )}

            {renderProgressBar()}

            <div className="premium-wizard-card">
              <Form
                className="mb-3"
                onSubmit={(e) => e.preventDefault()}
                noValidate
              >
                {apiError && (
                  <div className="alert alert-danger mb-4"> {apiError} </div>
                )}

                <div className="wizard-step-panel">
                  {step === 1 && (
                    <Row>
                      <Col md={6} sm={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("supplier.name")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder={t("placeholder.vendorname")}
                            name="name"
                            className="gen-form-control"
                            {...register("name", { required: true })}
                          />
                          {errors.name?.type === "required" && (
                            <p role="alert" className="error">
                              {t("supplier.namerequired")}
                            </p>
                          )}
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("supplier.contact")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder={t("placeholder.contact")}
                            name="contact"
                            className="gen-form-control"
                            {...register("contact", { required: true })}
                          />
                          {errors.contact?.type === "required" && (
                            <p role="alert" className="error">
                              {t("supplier.contactrequired")}
                            </p>
                          )}
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("supplier.phone")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Form.Control
                            type="tel"
                            placeholder={t("placeholder.phone")}
                            name="phone"
                            {...register("phone", {
                              required: true,
                              pattern: /^[0-9]{10}$/,
                            })}
                            className="gen-form-control"
                            maxLength={10}
                            onKeyPress={(event) => {
                              const pattern = /[0-9]/;
                              const inputChar = String.fromCharCode(
                                event.charCode
                              );
                              if (!pattern.test(inputChar)) {
                                event.preventDefault();
                              }
                            }}
                          />
                          {errors.phone?.type === "required" && (
                            <p role="alert" className="error">
                              {t("supplier.phonerequired")}
                            </p>
                          )}
                          {errors.phone?.type === "pattern" && (
                            <p role="alert" className="error">
                              {t("supplier.invalidphone")}
                            </p>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={6} sm={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("supplier.email")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Form.Control
                            type="email"
                            placeholder={t("placeholder.email")}
                            className="gen-form-control"
                            name="email"
                            {...register("email", {
                              required: true,
                              pattern: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/,
                            })}
                          />
                          {errors.email?.type === "required" && (
                            <p role="alert" className="error">
                              {t("supplier.emailrequired")}
                            </p>
                          )}
                          {errors.email?.type === "pattern" && (
                            <p role="alert" className="error">
                              {t("supplier.invalidemail")}
                            </p>
                          )}
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("supplier.url")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Form.Control
                            type="url"
                            placeholder={t("placeholder.url")}
                            className="gen-form-control"
                            name="url"
                            {...register("url", {
                              required: true,
                              pattern:
                                /^(?:(?:https?|ftp):\/\/)?(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})+(?:\/\S*)?$/,
                            })}
                          />
                          {errors.url?.type === "required" && (
                            <p role="alert" className="error">
                              {t("supplier.urlrequired")}
                            </p>
                          )}
                          {errors.url?.type === "pattern" && (
                            <p role="alert" className="error">
                              {t("supplier.invalidurl")}
                            </p>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>
                  )}

                  {step === 2 && (
                    <Row>
                      <Col md={6} sm={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("supplier.address")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder={t("placeholder.address")}
                            name="address"
                            className="gen-form-control"
                            {...register("address", {
                              onChange: () => clearErrors("address"),
                            })}
                          />
                          {errors.address?.type === "required" && (
                            <p role="alert" className="error">
                              {t("supplier.addressrequired")}
                            </p>
                          )}
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("supplier.addressrequired2") || "Address Line 2"}{" "}
                            <span className="optional">(Optional)</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder={t("placeholder.address")}
                            name="address2"
                            className="gen-form-control"
                            {...register("address2")}
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("supplier.city")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder={t("placeholder.city")}
                            name="city"
                            className="gen-form-control"
                            {...register("city", {
                              onChange: () => clearErrors("city"),
                            })}
                          />
                          {errors.city?.type === "required" && (
                            <p role="alert" className="error">
                              {t("supplier.cityrequired")}
                            </p>
                          )}
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("supplier.state")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder={t("placeholder.state")}
                            name="state"
                            className="gen-form-control"
                            {...register("state", {
                              onChange: () => clearErrors("state"),
                            })}
                          />
                          {errors.state?.type === "required" && (
                            <p role="alert" className="error">
                              {t("supplier.staterequired")}
                            </p>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={6} sm={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("supplier.country")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                           <Select
                            placeholder={t("select.country")}
                            options={countryList}
                            value={selectedCountry}
                            onChange={(selectedOption) => {
                              setSelectedCountry(selectedOption);
                              setValue(
                                "country",
                                selectedOption ? selectedOption.value : "",
                                {
                                  shouldValidate: true,
                                }
                              );
                              clearErrors("country");
                            }}
                          />
                          {errors.country && (
                            <p className="error">
                              {t("supplier.countryrequired")}
                            </p>
                          )}
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("supplier.zip")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder={t("placeholder.zip")}
                            name="zip"
                            {...register("zip", {
                              onChange: () => clearErrors("zip"),
                            })}
                            className="gen-form-control"
                            maxLength={6}
                            onKeyPress={(event) => {
                              const pattern = /[0-9]/; // Only allow numeric digits
                              const inputChar = String.fromCharCode(
                                event.charCode
                              );
                              if (!pattern.test(inputChar)) {
                                event.preventDefault();
                              }
                            }}
                          />
                          {errors.zip?.type === "required" && (
                            <p role="alert" className="error">
                              {t("supplier.ziprequired")}
                            </p>
                          )}
                          {errors.zip?.type === "pattern" && (
                            <p role="alert" className="error">
                              {t("supplier.invalidzip")}
                            </p>
                          )}
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("supplier.notes")}{" "}
                            <span className="optional">(Optional)</span>
                          </Form.Label>
                          <Form.Control
                            as="textarea"
                            placeholder={t("placeholder.notes")}
                            className="gen-form-control"
                            name="notes"
                            {...register("notes")}
                            style={{ minHeight: "100px" }}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  )}
                </div>

                <div className="wizard-footer-buttons mt-5">
                  {step === 1 ? (
                    <Button type="button" variant="outline-primary" onClick={backClick}>
                      {t("button.btnCancel")}
                    </Button>
                  ) : (
                    <Button type="button" variant="outline-primary" onClick={handlePrevStep}>
                      {t("button.back") || "Back"}
                    </Button>
                  )}

                  {step < 2 ? (
                    <Button type="button" className="primary" onClick={handleNextStep}>
                      {t("button.next") || "Next"}
                    </Button>
                  ) : (
                    <Button className="primary" type="button" onClick={handleSubmitClick}>
                      {t("button.submit")}
                    </Button>
                  )}
                </div>
              </Form>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Addvendors;
