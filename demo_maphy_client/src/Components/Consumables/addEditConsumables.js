import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { useTranslation } from "react-i18next";
import AddCategory from "../../Common/categoryModal";
import AddLocation from "../../Common/locationModal";
import AddManufacturer from "../../Common/manufacturerModal";
import { common } from "../../Common/common";

const Domain = process.env.REACT_APP_API_URL;

const AddEditConsumables = (props) => {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
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
  const [showManufacturerModal, setShowManufacturerModal] = useState(false);
  const [manufacturers, setManufacturers] = useState([]);
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
      const [
        companiesResponse,
        categoryResponse,
        locationResponse,
        manufacturerResponse,
      ] = await Promise.all([
        axios.get(`${Domain}/companies/selectList?page=1`),
        axios.get(`${Domain}/categories/selectList/Consumable?page=1`),
        axios.get(`${Domain}/locations/selectList?page=1`),
        axios.get(`${Domain}/manufacturers/selectList?page=1`),
      ]);

      if (
        companiesResponse?.data &&
        categoryResponse?.data &&
        locationResponse?.data &&
        manufacturerResponse?.data
      ) {
        setCompanies(companiesResponse?.data?.items);
        setCategories(categoryResponse?.data);
        setLocation(locationResponse?.data?.items);
        setManufacturers(manufacturerResponse?.data?.items);
      } else setApiError(t("alert.dropdown"));
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const openCategoryModal = () => setShowCategoryModal(true);
  const closeCategoryModal = () => setShowCategoryModal(false);

  const openLocationModal = () => setShowLocationModal(true);
  const closeLocationModal = () => setShowLocationModal(false);

  const openManufacturerModal = () => setShowManufacturerModal(true);
  const closeManufacturerModal = () => setShowManufacturerModal(false);

  const handleManufacturerSubmit = async (data) => {
    try {
      const manufacturerResponse = await axios.get(
        `${Domain}/manufacturers/selectList?page=1`,
      );
      if (manufacturerResponse?.data)
        setManufacturers(manufacturerResponse?.data?.items);
      setShowManufacturerModal(false);
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const handleLocationSubmit = async (data) => {
    try {
      const locationResponse = await axios.get(
        `${Domain}/locations/selectList?page=1`,
      );
      if (locationResponse?.data) setLocation(locationResponse?.data?.items);
      setShowLocationModal(false);
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const handleCategorySubmit = async (data) => {
    try {
      const categoryResponse = await axios.get(
        `${Domain}/categories/selectList/Consumable?page=1`,
      );
      if (categoryResponse?.data) setCategories(categoryResponse?.data);
      setShowCategoryModal(false);
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const getComponentsDetails = async () => {
    try {
      const response = await axios.get(`${Domain}/consumables/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response?.data) {
        const fields = [
          "name",
          "qty",
          "min_amt",
          "item_no",
          "order_number",
          "purchase_cost",
          "model_number",
        ];

        fields.forEach((field) => {
          if (response.data[field] !== undefined) {
            setValue(field, response.data[field]);
          }
        });
        setValue("purchase_date", response?.data?.purchase_date?.date);
        setValue("category", response?.data?.category?.id);
        setValue("item_no", response?.data?.item_no);
        setValue("company", response?.data?.company?.id);
        setValue("location", response?.data?.location?.id);
        setValue("manufacturer_id", response?.data?.manufacturer?.id);
      } else setApiError(t("alert.error"));
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const onSubmit = async (data) => {
    const body = {
      company_id: data?.company,
      name: data?.name,
      category_id: data?.category,
      manufacturer_id: data?.manufacturer_id,
      location_id: data?.location,
      model_number: data?.model_number,
      item_no: data?.item_no,
      order_number: data?.order_number,
      purchase_date: data?.purchase_date,
      purchase_cost: data?.purchase_cost,
      qty: data?.qty,
      min_amt: data?.min_amt,
    };

    try {
      const response = await axios({
        method: isAddMode ? "post" : "put",
        url: isAddMode
          ? `${Domain}/consumables`
          : `${Domain}/consumables/${id}`,
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
          navigate("/consumables");
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
      navigate("/consumables");
    }
  };

  const handleNextStep = async () => {
    let fieldsToValidate = [];
    if (step === 1) {
      fieldsToValidate = ["name", "category", "manufacturer_id", "item_no", "model_number", "qty", "min_amt"];
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
            <span className="step-label">{t("consumable.step_specs") || "Specifications"}</span>
          </div>
          <div className={`wizard-step-node ${step >= 2 ? 'active' : ''}`}>
            <span className="step-num">2</span>
            <span className="step-label">{t("consumable.step_purchase") || "Purchase & Logistics"}</span>
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
                    {isAddMode ? t("consumable.create") : t("consumable.update")}
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
                            {t("consumable.name")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Col md={8} sm={12}>
                            <Form.Control
                              type="text"
                              placeholder={t("consumable.name")}
                              {...register("name", { required: true })}
                              className="gen-form-control"
                            />
                          </Col>
                          {errors.name && (
                            <p className="error">{t("consumable.namereq")}</p>
                          )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("consumable.category_id")}{" "}
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
                            {t("assetmodel.manufacturer_id")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <div className="d-flex align-items-center">
                            <div className="w-100 me-2">
                              <Form.Select
                                {...register("manufacturer_id", { required: true })}
                                className="gen-form-control"
                              >
                                <option value="">{t("select.manufacturer")}</option>
                                {manufacturers?.length > 0 &&
                                  manufacturers.map((manufacturer) => (
                                    <option key={manufacturer.id} value={manufacturer.id}>
                                      {manufacturer.text}
                                    </option>
                                  ))}
                              </Form.Select>
                            </div>
                            <Button
                              variant="outline-primary"
                              onClick={openManufacturerModal}
                              className="px-3"
                            >
                              {t("button.new")}
                            </Button>
                          </div>
                          {errors.manufacturer_id && (
                            <p className="error">{t("select.manufacturereq")}</p>
                          )}
                        </Form.Group>
                      </Col>

                      <Col md={6} sm={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("consumable.item_no")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Col md={8} sm={12}>
                            <Form.Control
                              type="text"
                              placeholder={t("consumable.item_no")}
                              {...register("item_no", { required: true })}
                              className="gen-form-control"
                            />
                          </Col>
                          {errors.item_no && (
                            <p className="error">{t("consumable.item_no_req")}</p>
                          )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("consumable.model_number")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Col md={8} sm={12}>
                            <Form.Control
                              type="text"
                              placeholder={t("consumable.model_number")}
                              {...register("model_number", { required: true })}
                              className="gen-form-control"
                            />
                          </Col>
                          {errors.model_number && (
                            <p className="error">{t("consumable.model_number_req")}</p>
                          )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("consumable.qty")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Col md={8} sm={12}>
                            <Form.Control
                              type="number"
                              placeholder={t("consumable.qty")}
                              {...register("qty", {
                                required: true,
                                pattern: /^\s*[1-9]\d*\s*$/,
                              })}
                              className="gen-form-control"
                            />
                          </Col>
                          {errors.qty?.type === "required" && (
                            <p className="error">{t("consumable.quantityreq")}</p>
                          )}
                          {errors.qty?.type === "pattern" && (
                            <p className="error">{t("consumable.invalid_data")}</p>
                          )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("consumable.min_amt")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Col md={8} sm={12}>
                            <Form.Control
                              type="number"
                              placeholder={t("consumable.min_amt")}
                              {...register("min_amt", {
                                required: true,
                                pattern: /^\s*[1-9]\d*\s*$/,
                                validate: validateMinAmt,
                              })}
                              className="gen-form-control"
                            />
                          </Col>
                          {errors?.min_amt?.type === "required" && (
                            <p className="error">{t("consumable.min_quantityreq")}</p>
                          )}
                          {errors?.min_amt?.type === "pattern" && (
                            <p className="error">{t("consumable.invalid_data")}</p>
                          )}
                          {errors?.min_amt?.type === "validate" && (
                            <p className="error">{t("consumable.calreq")}</p>
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
                            {t("consumable.company_id")}{" "}
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
                            {t("consumable.location_id")}{" "}
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
                            {t("consumable.order_number")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Col md={8} sm={12}>
                            <Form.Control
                              type="text"
                              placeholder={t("consumable.order_number")}
                              {...register("order_number", { required: true })}
                              className="gen-form-control"
                            />
                          </Col>
                          {errors.order_number && (
                            <p className="error">{t("consumable.order_number_req")}</p>
                          )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("consumable.purchase_date")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Col md={8} sm={12}>
                            <Form.Control
                              type="date"
                              placeholder={t("consumable.purchase_date")}
                              {...register("purchase_date", {
                                required: true,
                                validate: validateNotFutureDate,
                              })}
                              className="gen-form-control"
                            />
                          </Col>
                          {errors.purchase_date?.type === "required" && (
                            <p className="error">{t("consumable.purchase_date_req")}</p>
                          )}
                          {errors.purchase_date?.type === "validate" && (
                            <p className="error">{t("consumable.invalid_date")}</p>
                          )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("consumable.purchase_cost")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Col md={8} sm={12}>
                            <Form.Control
                              type="number"
                              placeholder={t("consumable.purchase_cost")}
                              {...register("purchase_cost", {
                                required: true,
                                pattern: /^\s*(?=.*[1-9])\d*(?:\.\d{1,2})?\s*$/,
                              })}
                              className="gen-form-control"
                            />
                          </Col>
                          {errors?.purchase_cost?.type === "required" && (
                            <p className="error">{t("consumable.purchase_cost_req")}</p>
                          )}
                          {errors?.purchase_cost?.type === "pattern" && (
                            <p className="error">{t("consumable.invalid_data")}</p>
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
        pageType={t("category.Consumable")}
      />
      <AddManufacturer
        show={showManufacturerModal}
        handleClose={closeManufacturerModal}
        onManufacturerSubmit={handleManufacturerSubmit}
      />
    </Container>
  );
};

export default AddEditConsumables;
