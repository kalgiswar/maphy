import { useForm } from "react-hook-form";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
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

const AddEditLocations = (props) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    trigger,
    watch,
    clearErrors,
    getValues,
    setError,
  } = useForm();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const params = useParams();
  const isModal = props && props.isModal;
  const id = isModal ? props.id : params.id;
  const isAddMode = !id;
  const [step, setStep] = useState(1);
  const [apiError, setApiError] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryList, setCountryList] = useState([]);
  const [managers, setManagers] = useState([]);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const initialize = async () => {
      await fetchCountriesAndDetails();
      await fetchDropdownData();
      if (!isAddMode) {
        await getDetails();
      }
    };

    initialize();
  }, [id, isAddMode]);

  const fetchDropdownData = async () => {
    try {
      const [locationResponse, managerResponse] = await Promise.all([
        axios.get(`${Domain}/locations/selectList?page=1`),
        axios.get(`${Domain}/users/selectList?page=1`),
      ]);

      if (locationResponse?.data && managerResponse?.data) {
        setLocations(locationResponse?.data?.items);
        setManagers(managerResponse?.data?.items);
      } else {
        setApiError(t("alert.dropdown"));
      }
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const fetchCountriesAndDetails = async () => {
    const countriesArray = Object.keys(countries)
      .map((code) => ({
        value: code,
        label: countries[code].name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
    countriesArray.unshift({ value: "", label: t("select.country") }); // Add placeholder at the beginning
    setCountryList(countriesArray);
  };

  const getDetails = async () => {
    try {
      const response = await axios.get(`${Domain}/locations/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response?.data) {
        const fields = [
          "name",
          "currency",
          "address",
          "address2",
          "city",
          "state",
          "country",
          "zip",
        ];
        fields.forEach((field) => {
          setValue(field, response?.data[field]);
        });

        setValue("parent", response?.data?.parent?.id || ""); 
        setValue("manager", response?.data?.manager?.id || "");

        if (response?.data?.country && countryList) {
          const selectedCountry = countryList.find(
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
  };

  const handleNextStep = () => {
    if (step === 1) {
      const values = getValues();
      let isValid = true;
      clearErrors();

      if (!values.name || !String(values.name).trim()) {
        setError("name", { type: "required" });
        isValid = false;
      }
      if (!values.currency || !String(values.currency).trim()) {
        setError("currency", { type: "required" });
        isValid = false;
      }

      if (isValid) {
        setStep(2);
      }
    }
  };

  const handleSubmitClick = async () => {
    const values = getValues();
    let isValid = true;
    clearErrors();

    if (!values.address || !String(values.address).trim()) {
      setError("address", { type: "required" });
      isValid = false;
    }
    if (!values.city || !String(values.city).trim()) {
      setError("city", { type: "required" });
      isValid = false;
    }
    if (!values.state || !String(values.state).trim()) {
      setError("state", { type: "required" });
      isValid = false;
    }
    if (!selectedCountry || !selectedCountry.value) {
      setError("country", { type: "required" });
      isValid = false;
    }
    if (!values.zip || !String(values.zip).trim()) {
      setError("zip", { type: "required" });
      isValid = false;
    } else if (!/^[0-9]{6}$/.test(String(values.zip))) {
      setError("zip", { type: "pattern" });
      isValid = false;
    }

    if (isValid) {
      onSubmit(values);
    }
  };

  useEffect(() => {
    setStep(1);
    clearErrors();
  }, []);

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderProgressBar = () => {
    const progressPercent = ((step - 1) / 1) * 100;
    return (
      <div className="wizard-progress-container mb-5">
        <div className="wizard-progress-bar" style={{ width: `${progressPercent}%` }}></div>
        <div className="wizard-steps-indicator">
          <div className={`wizard-step-node ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <span className="step-num">{step > 1 ? '✓' : '1'}</span>
            <span className="step-label">{t("location.step_general") || "General Info"}</span>
          </div>
          <div className={`wizard-step-node ${step >= 2 ? 'active' : ''}`}>
            <span className="step-num">2</span>
            <span className="step-label">{t("location.step_address") || "Address Details"}</span>
          </div>
        </div>
      </div>
    );
  };

  const onSubmit = async (data) => {
    setApiError(""); // Clear previous errors
    const countryCode = selectedCountry ? selectedCountry.value : "";
    const body = {
      name: data?.name,
      currency: data?.currency,
      address: data?.address,
      address2: data?.address2,
      city: data?.city,
      state: data?.state,
      country: countryCode,
      zip: data?.zip,
      manager_id: data.manager || null,
      parent_id: data.parent || null,
    };

    if (body.manager_id === "") body.manager_id = null;
    if (body.parent_id === "") body.parent_id = null;

    try {
      const response = await axios({
        method: isAddMode ? "post" : "put",
        url: isAddMode ? `${Domain}/locations` : `${Domain}/locations/${id}`,
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
          props.onSuccess(response?.data);
        } else {
          navigate("/location");
        }
      } else {
        setApiError(response?.data?.message || "Error submitting form");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setApiError(
        error.response?.data?.message ||
          "An unexpected error occurred. Please try again later."
      );
    }
  };

  const backClick = async () => {
    if (isModal) {
      props.handleClose();
    } else {
      navigate("/location");
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
                    {isAddMode ? t("location.create") : t("location.update")}
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
                            {t("location.name")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder={t("location.name")}
                            name="name"
                            {...register("name", { onChange: () => clearErrors("name") })}
                            className="gen-form-control"
                          />
                          {errors.name?.type === "required" && (
                            <p role="alert" className="error">
                              {t("location.namerequired")}
                            </p>
                          )}
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("location.parent_id")}{" "}
                            <span className="mandatory"></span>
                          </Form.Label>
                          <Form.Select
                            {...register("parent")}
                            className="gen-form-control"
                          >
                            <option value="">{t("location.parent_id")}</option>
                            {locations.map((location) => (
                              <option key={location.id} value={location.id}>
                                {location.text}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6} sm={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("location.manager_id")}{" "}
                            <span className="mandatory"></span>
                          </Form.Label>
                          <Form.Select
                            {...register("manager")}
                            className="gen-form-control"
                          >
                            <option value="">{t("location.manager_id")}</option>
                            {managers.map((manager) => (
                              <option key={manager.id} value={manager.id}>
                                {manager.text}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("location.currency")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder={t("location.currency")}
                            name="currency"
                            {...register("currency", { onChange: () => clearErrors("currency") })}
                            className="gen-form-control"
                          />
                          {errors.currency?.type === "required" && (
                            <p role="alert" className="error">
                              {t("location.currencyrequired")}
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
                            {t("location.address")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder={t("location.address")}
                            name="address"
                            {...register("address", { onChange: () => clearErrors("address") })}
                            className="gen-form-control"
                          />
                          {errors.address?.type === "required" && (
                            <p role="alert" className="error">
                              {t("location.addressrequired")}
                            </p>
                          )}
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("location.address2") || "Address Line 2"}
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder={t("location.address2") || "Address Line 2"}
                            name="address2"
                            {...register("address2")}
                            className="gen-form-control"
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("location.city")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder={t("location.city")}
                            name="city"
                            {...register("city", { onChange: () => clearErrors("city") })}
                            className="gen-form-control"
                          />
                          {errors.city?.type === "required" && (
                            <p role="alert" className="error">
                              {t("location.cityrequired")}
                            </p>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={6} sm={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("location.state")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder={t("location.state")}
                            name="state"
                            {...register("state", { onChange: () => clearErrors("state") })}
                            className="gen-form-control"
                          />
                          {errors.state?.type === "required" && (
                            <p role="alert" className="error">
                              {t("location.staterequired")}
                            </p>
                          )}
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("location.country")}{" "}
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
                                selectedOption ? selectedOption.value : ""
                              );
                              clearErrors("country");
                            }}
                          />
                          {errors.country && (
                            <p className="error">
                              {t("location.countryrequired")}
                            </p>
                          )}
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("location.zip")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder={t("location.zip")}
                            name="zip"
                            {...register("zip", { onChange: () => clearErrors("zip") })}
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
                              {t("location.ziprequired")}
                            </p>
                          )}
                          {errors.zip?.type === "pattern" && (
                            <p role="alert" className="error">
                              {t("location.invalidzip")}
                            </p>
                          )}
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

export default AddEditLocations;
