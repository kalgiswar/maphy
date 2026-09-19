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
import AddManufacturer from "../../../Common/manufacturerModal";
import AddCategory from "../../../Common/categoryModal";
import { common } from "../../../Common/common";

const Domain = process.env.REACT_APP_API_URL;

const AddAssetModels = (props) => {
  const {
    register,
    setValue,
    getValues,
    setError,
    formState: { errors },
    clearErrors,
  } = useForm();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const params = useParams();
  const isModal = props && props.isModal;
  const id = isModal ? props.id : params.id;
  const location = useLocation();
  const { state } = location;
  const isAddMode = !id;
  const isCloneMode = state?.mode === "clone";
  const [step, setStep] = useState(1);
  const [apiError, setApiError] = useState("");
  const [showManufacturerModal, setShowManufacturerModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [manufacturers, setManufacturers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [depreciations, setDepreciations] = useState([]);

  useEffect(() => {
    const initializeData = async () => {
      await fetchDropdownData();
      if (!isAddMode || isCloneMode) {
        await getAssetModelsDetails();
      }
    };
    initializeData();
  }, [id, isAddMode, isCloneMode]);

  const fetchDropdownData = async () => {
    try {
      const [categoryResponse, depreciationResponse, manufacturerResponse] =
        await Promise.all([
          axios.get(`${Domain}/categories/selectList/Asset?page=1`),
          axios.get(`${Domain}/depreciations/selectList?page=1`),
          axios.get(`${Domain}/manufacturers/selectList?page=1`),
        ]);

      setManufacturers(manufacturerResponse?.data?.items || []);
      setCategories(categoryResponse?.data || []);
      setDepreciations(depreciationResponse?.data?.items || []);
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const getAssetModelsDetails = async () => {
    try {
      const response = await axios.get(`${Domain}/models/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response?.data) {
        const fields = [
          "category",
          "depreciation_id",
          "eol",
          "manufacturer_id",
          "model_number",
          "name",
          "notes",
          "requestable",
        ];

        fields.forEach((field) => {
          if (field in response.data) {
            setValue(field, response.data[field]);
          }
        });

        if (response.data.category?.id) {
          setValue("category", response.data.category.id);
        }
        if (response.data.depreciation?.id) {
          setValue("depreciation_id", response.data.depreciation.id);
        }
        if (response.data.manufacturer?.id) {
          setValue("manufacturer_id", response.data.manufacturer.id);
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
      let valid = true;
      clearErrors();

      if (!values.name || !String(values.name).trim()) {
        setError("name", { type: "required" });
        valid = false;
      }
      if (!values.manufacturer_id || !String(values.manufacturer_id).trim()) {
        setError("manufacturer_id", { type: "required" });
        valid = false;
      }
      if (!values.category || !String(values.category).trim()) {
        setError("category", { type: "required" });
        valid = false;
      }
      if (!values.model_number || !String(values.model_number).trim()) {
        setError("model_number", { type: "required" });
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
            <span className="step-label">{t("assetmodel.step_spec") || "Specifications"}</span>
          </div>
          <div className={`wizard-step-node ${step >= 2 ? 'active' : ''}`}>
            <span className="step-num">2</span>
            <span className="step-label">{t("assetmodel.step_lifecycle") || "Lifecycle & Notes"}</span>
          </div>
        </div>
      </div>
    );
  };

  const handleSubmitClick = async () => {
    const values = getValues();
    let valid = true;
    clearErrors();

    if (!values.depreciation_id || !String(values.depreciation_id).trim()) {
      setError("depreciation_id", { type: "required" });
      valid = false;
    }
    if (!values.eol || !String(values.eol).trim()) {
      setError("eol", { type: "required" });
      valid = false;
    } else if (!/^\s*[1-9]\d*\s*$/.test(String(values.eol))) {
      setError("eol", { type: "pattern" });
      valid = false;
    }
    if (!values.notes || !String(values.notes).trim()) {
      setError("notes", { type: "required" });
      valid = false;
    }

    if (!valid) return;

    const body = {
      category_id: values?.category,
      depreciation_id: values?.depreciation_id,
      eol: values?.eol,
      manufacturer_id: values?.manufacturer_id,
      model_number: values?.model_number,
      name: values?.name,
      notes: values?.notes,
      requestable: values?.requestable,
    };

    try {
      const response = await axios({
        method: isAddMode || isCloneMode ? "post" : "put",
        url:
          isAddMode || isCloneMode
            ? `${Domain}/models`
            : `${Domain}/models/${id}`,
        data: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response?.data?.success) {
        common.notify("S", response?.data?.message);
        if (sessionStorage.getItem("onboarding_active") === "true") {
          navigate("/Dashboard");
        } else if (isModal) {
          props.onSuccess();
        } else {
          navigate("/AssetModels");
        }
      } else {
        setApiError(response?.data?.message);
      }
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const backClick = () => {
    if (isModal) {
      props.handleClose();
    } else {
      navigate("/AssetModels");
    }
  };

  const openManufacturerModal = () => setShowManufacturerModal(true);
  const closeManufacturerModal = () => setShowManufacturerModal(false);
  const openCategoryModal = () => setShowCategoryModal(true);
  const closeCategoryModal = () => setShowCategoryModal(false);

  const handleManufacturerSubmit = async () => {
    try {
      const manufacturerResponse = await axios.get(
        `${Domain}/manufacturers/selectList?page=1`
      );
      setManufacturers(manufacturerResponse?.data?.items);
      setShowManufacturerModal(false);
    } catch (error) {
      console.error("Error fetching manufacturers:", error);
    }
  };

  const handleCategorySubmit = async () => {
    try {
      const categoryResponse = await axios.get(
        `${Domain}/categories/selectList/Asset?page=1`
      );
      setCategories(categoryResponse?.data);
      setShowCategoryModal(false);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col md={12}>
          <div>
            {!isModal && (
              <div className="title d-flex justify-content-between">
                <h1>
                  {isAddMode
                    ? t("assetmodel.createdept")
                    : isCloneMode
                    ? t("assetmodel.clonedept")
                    : t("assetmodel.updatedept")}
                </h1>
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
                  <div className="alert alert-danger mb-4">{apiError}</div>
                )}

                <div className="wizard-step-panel">
                  {step === 1 && (
                    <Row>
                      <Col md={6} sm={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("assetmodel.name")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder={t("assetmodel.name")}
                            {...register("name", { required: true })}
                            className="gen-form-control"
                          />
                          {errors.name && (
                            <p className="error">{t("assetmodel.namereq")}</p>
                          )}
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("assetmodel.manufacturer_id")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <div className="d-flex align-items-center">
                            <Form.Select
                              {...register("manufacturer_id", { required: true })}
                              className="gen-form-control"
                            >
                              <option value="">
                                {t("assetmodel.manufacturer")}
                              </option>
                              {manufacturers.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.text}
                                </option>
                              ))}
                            </Form.Select>
                            <Button
                              className="ms-3 remove_btn"
                              variant="outline-primary"
                              onClick={openManufacturerModal}
                            >
                              {t("button.new")}
                            </Button>
                          </div>
                          {errors.manufacturer_id && (
                            <p className="error">
                              {t("assetmodel.manufacturerreq")}
                            </p>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={6} sm={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("assetmodel.category_id")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <div className="d-flex align-items-center">
                            <Form.Select
                              {...register("category", { required: true })}
                              className="gen-form-control"
                            >
                              <option value="">{t("assetmodel.category")}</option>
                              {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.text}
                                </option>
                              ))}
                            </Form.Select>
                            <Button
                              className="ms-3 remove_btn"
                              variant="outline-primary"
                              onClick={openCategoryModal}
                            >
                              {t("button.new")}
                            </Button>
                          </div>
                          {errors.category && (
                            <p className="error">{t("assetmodel.categoryreq")}</p>
                          )}
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("assetmodel.model_number")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder={t("assetmodel.model_number")}
                            {...register("model_number", { required: true })}
                            className="gen-form-control"
                          />
                          {errors.model_number && (
                            <p className="error">{t("assetmodel.numberreq")}</p>
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
                            {t("assetmodel.depreciation_id")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Form.Select
                            {...register("depreciation_id", {
                              onChange: () => clearErrors("depreciation_id"),
                            })}
                            className="gen-form-control"
                          >
                            <option value="">
                              {t("assetmodel.depreciation")}
                            </option>
                            {depreciations.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.text}
                              </option>
                            ))}
                          </Form.Select>
                          {errors.depreciation_id && (
                            <p className="error">
                              {t("assetmodel.depreciationreq")}
                            </p>
                          )}
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("assetmodel.eol")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Form.Control
                            type="number"
                            placeholder={t("assetmodel.eol")}
                            {...register("eol", {
                              onChange: () => clearErrors("eol"),
                            })}
                            className="gen-form-control"
                          />
                          {errors.eol?.type === "required" && (
                            <p className="error">{t("assetmodel.eolreq")}</p>
                          )}
                          {errors.eol?.type === "pattern" && (
                            <p className="error">{t("assetmodel.invalidEOL")}</p>
                          )}
                        </Form.Group>
                        <Form.Group className="mb-3 mt-4">
                          <Form.Check
                            type="checkbox"
                            label={t("assetmodel.requestable")}
                            {...register("requestable")}
                            className="gen-form-control"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6} sm={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("assetmodel.notes")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                           <Form.Control
                            as="textarea"
                            placeholder={t("assetmodel.notes")}
                            {...register("notes", {
                              onChange: () => clearErrors("notes"),
                            })}
                            className="gen-form-control"
                            style={{ minHeight: "130px" }}
                          />
                          {errors.notes && (
                            <p className="error">{t("assetmodel.notesreq")}</p>
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

      <AddCategory
        show={showCategoryModal}
        handleClose={closeCategoryModal}
        onCategorySubmit={handleCategorySubmit}
        pageType={t("category.Asset")}
      />
      <AddManufacturer
        show={showManufacturerModal}
        handleClose={closeManufacturerModal}
        onManufacturerSubmit={handleManufacturerSubmit}
      />
    </Container>
  );
};

export default AddAssetModels;
