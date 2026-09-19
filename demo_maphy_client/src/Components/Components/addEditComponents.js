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
import AddCategory from "../../Common/categoryModal";
import AddLocation from "../../Common/locationModal";
import { common } from "../../Common/common";

const Domain = process.env.REACT_APP_API_URL;

const AddEditComponents = (props) => {
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    trigger,
    clearErrors,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const params = useParams();
  const isModal = props && props.isModal;
  const id = isModal ? props.id : params.id;
  const isAddMode = !id;
  const [step, setStep] = useState(1);
  const [locations, setLocation] = useState([]);
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    const initialize = async () => {
      await fetchDropdownData();
      if (!isAddMode) {
        await getComponentsDetails();
      }
    };

    initialize();
  }, [id, isAddMode]);

  const fetchDropdownData = async () => {
    try {
      const [companiesResponse, categoryResponse, locationResponse] =
        await Promise.all([
          axios.get(`${Domain}/companies/selectList?page=1`),
          axios.get(`${Domain}/categories/selectList/Component?page=1`),
          axios.get(`${Domain}/locations/selectList?page=1`),
        ]);

      if (
        companiesResponse?.data &&
        categoryResponse?.data &&
        locationResponse?.data
      ) {
        setCompanies(companiesResponse?.data?.items);
        setCategories(categoryResponse?.data);
        setLocation(locationResponse?.data?.items);
      } else setApiError(t("alert.error"));
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const openCategoryModal = () => setShowCategoryModal(true);
  const closeCategoryModal = () => setShowCategoryModal(false);

  const openLocationModal = () => setShowLocationModal(true);
  const closeLocationModal = () => setShowLocationModal(false);

  const handleLocationSubmit = async (data) => {
    try {
      const locationResponse = await axios.get(
        `${Domain}/locations/selectList?page=1`
      );
      setLocation(locationResponse?.data?.items);
      setShowLocationModal(false);
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const handleCategorySubmit = async (data) => {
    try {
      const categoryResponse = await axios.get(
        `${Domain}/categories/selectList/Component?page=1`
      );
      setCategories(categoryResponse?.data);
      setShowCategoryModal(false);
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const getComponentsDetails = async () => {
    try {
      const response = await axios.get(`${Domain}/components/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response?.data) {
        const fields = [
          "name",
          "qty",
          "min_amt",
          "serial",
          "order_number",
          "purchase_cost",
        ];

        fields.forEach((field) => {
          setValue(field, response?.data[field]);
        });
        setValue("purchase_date", response?.data?.purchase_date?.date);
        setValue("category", response?.data?.category?.id);
        setValue("company", response?.data?.company?.id);
        setValue("location", response?.data?.location?.id);
      } else setApiError(t("alert.error"));
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const onSubmit = async (data) => {
    const body = {
      name: data?.name,
      category_id: data?.category,
      qty: data?.qty,
      min_amt: data?.min_amt,
      serial: data?.serial,
      company_id: data?.company,
      location_id: data?.location,
      order_number: data?.order_number,
      purchase_date: data?.purchase_date,
      purchase_cost: data?.purchase_cost,
    };

    try {
      const response = await axios({
        method: isAddMode ? "post" : "put",
        url: isAddMode ? `${Domain}/components` : `${Domain}/components/${id}`,
        data: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response?.data?.success) {
        common.notify("S", response?.data?.message);
        if (isModal) {
          props.onSuccess();
        } else {
          navigate("/components");
        }
      } else setApiError(response?.data?.message);
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

  const validateMinAmt = (value) => {
    const qty = getValues("qty");
    return parseInt(value, 10) <= parseInt(qty, 10);
  };

  const backClick = () => {
    if (isModal) {
      props.handleClose();
    } else {
      navigate("/components");
    }
  };

  const handleNextStep = async () => {
    let fieldsToValidate = [];
    if (step === 1) {
      fieldsToValidate = ["name", "category", "qty", "min_amt", "serial"];
    }
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      clearErrors();
      setStep(step + 1);
    }
  };

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
            <span className="step-label">{t("component.step_specs") || "Specifications"}</span>
          </div>
          <div className={`wizard-step-node ${step >= 2 ? 'active' : ''}`}>
            <span className="step-num">2</span>
            <span className="step-label">{t("component.step_purchase") || "Purchase & Logistics"}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Container fluid>
      <Row>
        <Col md={12}>
          <div>
            {!isModal && (
              <div className="title d-flex justify-content-between mb-4">
                <div>
                  <h1>
                    {isAddMode ? t("component.create") : t("component.update")}
                  </h1>
                </div>
                <Button onClick={backClick} className="back">
                  {t("button.back")}
                </Button>
              </div>
            )}
            <div className="addProperty wrapper">
              <div className="basicDetails pt-4">
                {renderProgressBar()}
                <Form
                  className="mb-3"
                  onSubmit={handleSubmit(onSubmit)}
                  noValidate
                >
                  {apiError && (
                    <div className="alert alert-danger mb-4"> {apiError} </div>
                  )}

                  {step === 1 && (
                    <Row>
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
                            />
                          </Col>
                          {errors.name && (
                            <p className="error">{t("component.namereq")}</p>
                          )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("component.category_id")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <div className="d-flex align-items-center">
                            <div className="w-100 me-2">
                              <Form.Select
                                {...register("category", { required: true })}
                                className="gen-form-control"
                              >
                                <option value="">{t("select.category")}</option>
                                {categories?.length > 0 &&
                                  categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                      {category.text}
                                    </option>
                                  ))}
                              </Form.Select>
                            </div>
                            <Button
                              variant="outline-primary"
                              onClick={openCategoryModal}
                              className="px-3"
                            >
                              {t("button.new")}
                            </Button>
                          </div>
                          {errors.category && (
                            <p className="error">{t("select.categoryreq")}</p>
                          )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("component.serial")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Col md={8} sm={12}>
                            <Form.Control
                              type="text"
                              placeholder={t("component.serial")}
                              {...register("serial", { required: true })}
                              className="gen-form-control"
                            />
                          </Col>
                          {errors.serial && (
                            <p className="error">{t("component.serial_req")}</p>
                          )}
                        </Form.Group>
                      </Col>

                      <Col md={6} sm={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("component.qty")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Col md={8} sm={12}>
                            <Form.Control
                              type="number"
                              placeholder={t("component.qty")}
                              {...register("qty", {
                                required: true,
                                pattern: /^\s*[1-9]\d*\s*$/,
                              })}
                              className="gen-form-control"
                            />
                          </Col>
                          {errors.qty?.type === "required" && (
                            <p className="error">{t("component.quantityreq")}</p>
                          )}
                          {errors.qty?.type === "pattern" && (
                            <p role="alert" className="error">
                              {t("component.invalid_data")}
                            </p>
                          )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("component.min_amt")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Col md={8} sm={12}>
                            <Form.Control
                              type="number"
                              placeholder={t("component.min_amt")}
                              {...register("min_amt", {
                                required: true,
                                pattern: /^\s*[1-9]\d*\s*$/,
                                validate: validateMinAmt,
                              })}
                              className="gen-form-control"
                            />
                          </Col>
                          {errors?.min_amt?.type === "required" && (
                            <p className="error">
                              {t("component.min_quantityreq")}
                            </p>
                          )}
                          {errors?.min_amt?.type === "pattern" && (
                            <p className="error">{t("component.invalid_data")}</p>
                          )}
                          {errors?.min_amt?.type === "validate" && (
                            <p className="error">{t("component.invalid_min")}</p>
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
                            {t("component.company_id")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Col md={8} sm={12}>
                            <Form.Select
                              {...register("company", { required: true })}
                              className="gen-form-control"
                            >
                              <option value="">{t("select.company")}</option>
                              {companies?.length > 0 &&
                                companies.map((companies) => (
                                  <option key={companies.id} value={companies.id}>
                                    {companies.text}
                                  </option>
                                ))}
                            </Form.Select>
                          </Col>
                          {errors.company && (
                            <p className="error">{t("select.companyreq")}</p>
                          )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("component.location_id")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <div className="d-flex align-items-center">
                            <div className="w-100 me-2">
                              <Form.Select
                                {...register("location", { required: true })}
                                className="gen-form-control"
                              >
                                <option value="">{t("select.location")}</option>
                                {locations.map((location) => (
                                  <option key={location.id} value={location.id}>
                                    {location.text}
                                  </option>
                                ))}
                              </Form.Select>
                            </div>
                            <Button
                              variant="outline-primary"
                              onClick={openLocationModal}
                              className="px-3"
                            >
                              {t("button.new")}
                            </Button>
                          </div>
                          {errors.location && (
                            <p className="error">{t("select.locationreq")}</p>
                          )}
                        </Form.Group>
                      </Col>

                      <Col md={6} sm={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("component.order_number")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Col md={8} sm={12}>
                            <Form.Control
                              type="text"
                              placeholder={t("component.order_number")}
                              {...register("order_number", { required: true })}
                              className="gen-form-control"
                            />
                          </Col>
                          {errors.order_number && (
                            <p className="error">
                              {t("component.order_number_req")}
                            </p>
                          )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("component.purchase_date")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Col md={8} sm={12}>
                            <Form.Control
                              type="date"
                              placeholder={t("component.purchase_date")}
                              {...register("purchase_date", {
                                required: true,
                                validate: validateNotFutureDate,
                              })}
                              className="gen-form-control"
                            />
                          </Col>
                          {errors.purchase_date?.type === "required" && (
                            <p className="error">
                              {t("component.purchase_date_req")}
                            </p>
                          )}
                          {errors.purchase_date?.type === "validate" && (
                            <p className="error">{t("component.invalid_date")}</p>
                          )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("component.purchase_cost")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Col md={8} sm={12}>
                            <Form.Control
                              type="number"
                              placeholder={t("component.purchase_cost")}
                              {...register("purchase_cost", {
                                required: true,
                                pattern: /^\s*(?=.*[1-9])\d*(?:\.\d{1,2})?\s*$/,
                              })}
                              className="gen-form-control"
                            />
                          </Col>
                          {errors?.purchase_cost?.type === "required" && (
                            <p className="error">
                              {t("component.purchase_cost_req")}
                            </p>
                          )}
                          {errors?.purchase_cost?.type === "pattern" && (
                            <p className="error">{t("component.invalid_data")}</p>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>
                  )}

                  <div className="wizard-footer-buttons mt-5">
                    {step === 1 ? (
                      <Button type="button" variant="outline-primary" onClick={backClick}>
                        {t("category.btnCancel")}
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
                      <Button className="primary" type="submit">
                        {t("category.submit")}
                      </Button>
                    )}
                  </div>
                </Form>
              </div>
            </div>
          </div>
        </Col>
      </Row>
      <AddLocation
        show={showLocationModal}
        handleClose={closeLocationModal}
        onLocationSubmit={handleLocationSubmit}
      />
      <AddCategory
        show={showCategoryModal}
        handleClose={closeCategoryModal}
        onCategorySubmit={handleCategorySubmit}
        pageType={t("category.Component")}
      />
    </Container>
  );
};

export default AddEditComponents;
