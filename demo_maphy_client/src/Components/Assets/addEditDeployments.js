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
import AddVendor from "../../Common/vendorModal";
import AddLocation from "../../Common/locationModal";
import Addmodel from "../../Common/models";
import AddStatusModal from "../../Common/statusModal";
import { common } from "../../Common/common";
import InputGroup from "react-bootstrap/InputGroup";
import Modal from "react-bootstrap/Modal";

const Domain = process.env.REACT_APP_API_URL;

const AssetsListall = (props) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const { state } = location;
  const params = useParams();
  const isModal = props && props.isModal;
  const id = isModal ? props.id : params.id;
  const isCloneMode = isModal ? (props.mode === "clone") : (state?.mode === "clone");
  const isAddMode = !id;
  const [step, setStep] = useState(1);
  const [apiError, setApiError] = useState("");
  const [companies, setCompanies] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [locations, setLocation] = useState([]);
  const [showModelsModal, setShowModelsModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [models, setModels] = useState([]);
  const [statusLabels, setStatusLabels] = useState([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [infoTextBoxes, setInfoTextBoxes] = useState([]);
  const [depreciations, setDepreciations] = useState([]);
  const pageType = isModal ? (props.pageType || "default") : (state?.pageType || "default");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const [residualValue, setResidualValue] = useState(0);
  const depreciationId = watch("depreciation_id");

  useEffect(() => {
    if (depreciationId) {
      fetchDepreciationDetails(depreciationId);
    }
  }, [depreciationId]);

  const fetchDepreciationDetails = async (id) => {
    try {
      const url = `${Domain}/depreciations/${id}`;
      console.log("Fetching depreciation data from:", url);
      const response = await axios.get(url);

      setResidualValue(response.data.residual_value);
    } catch (error) {
      console.error("Error fetching depreciation data", error);
    }
  };

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file)); // frontend preview
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await fetchDropdownData();
      if (!isAddMode || isCloneMode) {
        await getAssetsListallDetails();
      }
    };

    initialize();
  }, [id, isAddMode, isCloneMode]);

  const fetchDropdownData = async () => {
    try {
      const [
        companiesResponse,
        vendorResponse,
        locationResponse,
        modelsResponse,
        depreciationResponse,
        statusLabelsResponse,
      ] = await Promise.all([
        axios.get(`${Domain}/companies/selectList?page=1`),
        axios.get(`${Domain}/suppliers/selectList?page=1`),
        axios.get(`${Domain}/locations/selectList?page=1`),
        axios.get(`${Domain}/models/selectList?page=1`),
        axios.get(`${Domain}/depreciations/selectList?page=1`),
        axios.get(`${Domain}/statuslabels/selectList?page=1`),
      ]);

      if (
        companiesResponse?.data &&
        locationResponse?.data &&
        vendorResponse?.data &&
        modelsResponse?.data &&
        depreciationResponse?.data &&
        statusLabelsResponse?.data
      ) {
        setCompanies(companiesResponse?.data?.items);
        setLocation(locationResponse?.data?.items);
        setVendors(vendorResponse?.data?.items);
        setModels(modelsResponse?.data?.items);
        setDepreciations(depreciationResponse?.data?.items || []);
        setStatusLabels(statusLabelsResponse?.data?.items);
      } else {
        setApiError(t("alert.dropdown"));
      }
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };
  const openModelsModal = () => setShowModelsModal(true);
  const closeModelsModal = () => setShowModelsModal(false);

  const openVendorModal = () => setShowVendorModal(true);
  const closeVendorModal = () => setShowVendorModal(false);

  const openLocationModal = () => setShowLocationModal(true);
  const closeLocationModal = () => setShowLocationModal(false);

  const openStatusModal = () => setShowStatusModal(true);
  const closeStatusModal = () => setShowStatusModal(false);

  const handleModelsSubmit = async () => {
    try {
      const modelsResponse = await axios.get(
        `${Domain}/models/selectList?page=1`,
      );
      if (modelsResponse?.data) {
        setModels(modelsResponse?.data?.items);
      }
      setShowModelsModal(false);
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const handleVendorSubmit = async () => {
    try {
      const supplierResponse = await axios.get(
        `${Domain}/suppliers/selectList?page=1`,
      );
      if (supplierResponse?.data) {
        setVendors(supplierResponse?.data?.items);
      }
      setShowVendorModal(false);
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };
  const handleStatusSubmit = async () => {
    try {
      const statusLabelsResponse = await axios.get(
        `${Domain}/statuslabels/selectList?page=1`,
      );
      if (statusLabelsResponse?.data) {
        setStatusLabels(statusLabelsResponse?.data?.items);
      }
      setShowStatusModal(false);
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const handleLocationSubmit = async () => {
    try {
      const locationResponse = await axios.get(
        `${Domain}/locations/selectList?page=1`,
      );
      if (locationResponse?.data) {
        setLocation(locationResponse?.data?.items);
      }
      setShowLocationModal(false);
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const getAssetsListallDetails = async () => {
    try {
      const response = await axios.get(`${Domain}/hardware/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response?.data) {
        const fields = [
          "company",
          "name",
          "order_number",
          "purchase_cost",
          "serial",
          "supplier_id",
          "purchase_date",
          "warranty_months",
          "model",
          "status_label",
          "notes",
          "requestable",
          "GST",
          "rtd_location",
          "assetdetails",
          "depreciation_id",
        ];

        fields.forEach((field) => setValue(field, response?.data[field]));
        setInfoTextBoxes(response?.data?.assetdetails || []);
      }
      if (response?.data?.depreciation?.id) {
        setValue("depreciation_id", response?.data?.depreciation?.id);
      } else {
        setValue("depreciation_id", "");
      }
      setValue("model", response?.data?.model?.id);
      setValue("company", response?.data?.company?.id);
      setValue("status_label", response?.data?.status_label?.id);
      setValue("location", response?.data?.rtd_location?.id);
      setValue("supplier_id", response?.data?.supplier?.id);
      setValue("purchase_date", response?.data?.purchase_date?.date);
      if (response.data.image_url) {
        setImagePreview(response.data.image_url); // full image URL
      } else if (response.data.image) {
        setImagePreview(`${Domain}/${response.data.image}`);
      }
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const navigateToPage = (navigate, pageType) => {
    switch (pageType) {
      case "rtd":
        navigate("/rtd"); //Deployable
        break;
      case "undeployable":
        navigate("/undeployable");
        break;
      case "deployed":
        navigate("/deployed");
        break;
      case "assets":
        navigate("/assets");
        break;
      default:
        navigate("/assets");
        break;
    }
  };
  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("assetdetails", data?.assetdetails || "");
    formData.append("company_id", data?.company);
    formData.append("name", data?.name);
    formData.append("order_number", data?.order_number);
    formData.append("purchase_cost", data?.purchase_cost);
    formData.append("serial", data?.serial);
    formData.append("supplier_id", data?.supplier_id);
    formData.append("purchase_date", data?.purchase_date);
    formData.append("warranty_months", data?.warranty_months);
    formData.append("model_id", data?.model);
    formData.append("status_id", data?.status_label);
    formData.append("notes", data?.notes);
    formData.append("requestable", data?.requestable === false ? 0 : 1);
    formData.append("gst", data?.GST);
    formData.append("rtd_location_id", data?.location);
    formData.append("depreciation_id", data?.depreciation_id || "");
    formData.append("image", image);

    try {
      const response = await axios({
        method: isAddMode || isCloneMode ? "post" : "put",
        url:
          isAddMode || isCloneMode
            ? `${Domain}/hardware`
            : `${Domain}/hardware/${id}`,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data", // Set header for file upload
        },
      });

      if (response?.data?.success) {
        const successMessage = response?.data?.message;
        common.notify("S", successMessage);
        if (sessionStorage.getItem("onboarding_active") === "true") {
          navigate("/Dashboard");
        } else if (isModal) {
          props.onSuccess();
        } else {
          navigateToPage(navigate, pageType);
        }
      } else {
        setApiError(response?.data?.error);
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || t("alert.error");

      setApiError(errorMessage);
    }
  };

  const backClick = () => {
    if (isModal) {
      props.handleClose();
    } else {
      navigateToPage(navigate, pageType);
    }
  };

  const validateNotFutureDate = (value) => {
    const selectedDate = new Date(value);
    const today = new Date();
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return selectedDate <= today;
  };

  const addInfoTextBox = () => {
    setInfoTextBoxes([...infoTextBoxes, ""]);
  };

  const removeInfoTextBox = (index) => {
    const updatedTextBoxes = infoTextBoxes.filter((_, i) => i !== index);
    setInfoTextBoxes(updatedTextBoxes);
  };

  const handleTextBoxChange = (index, value) => {
    const updatedTextBoxes = infoTextBoxes.map((text, i) =>
      i === index ? value : text,
    );
    setInfoTextBoxes(updatedTextBoxes);
  };

  const handleNextStep = async () => {
    let fieldsToValidate = [];
    if (step === 1) {
      fieldsToValidate = ["name", "serial", "model", "company", "status_label", "location"];
    } else if (step === 2) {
      fieldsToValidate = ["purchase_date", "depreciation_id", "supplier_id", "order_number", "purchase_cost", "warranty_months"];
      if (isAddMode || isCloneMode) {
        fieldsToValidate.push("GST");
      }
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderProgressBar = () => {
    const progressPercent = ((step - 1) / 2) * 100;
    return (
      <div className="wizard-progress-container mb-5">
        <div className="wizard-progress-bar" style={{ width: `${progressPercent}%` }}></div>
        <div className="wizard-steps-indicator">
          <div className={`wizard-step-node ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <span className="step-num">{step > 1 ? '✓' : '1'}</span>
            <span className="step-label">{t("AssetsListall.step_info") || "Info"}</span>
          </div>
          <div className={`wizard-step-node ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <span className="step-num">{step > 2 ? '✓' : '2'}</span>
            <span className="step-label">{t("AssetsListall.step_financials") || "Financials"}</span>
          </div>
          <div className={`wizard-step-node ${step >= 3 ? 'active' : ''}`}>
            <span className="step-num">3</span>
            <span className="step-label">{t("AssetsListall.step_notes") || "Notes & Image"}</span>
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
                    {isAddMode
                      ? t("AssetsListall.createasset")
                      : isCloneMode
                        ? t("AssetsListall.cloneasset")
                        : t("AssetsListall.updateasset")}
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
                          <Form.Label className="me-2">
                            {t("AssetsListall.AssetName")}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder={t("AssetsListall.AssetName")}
                            {...register("name", {
                              required: true,
                              validate: (value) => {
                                if (value.trim() === "")
                                  return t("AssetsListall.namereq");
                                if (!/[a-zA-Z]/.test(value))
                                  return t("AssetsListall.invalidName");
                                return true;
                              },
                            })}
                            className="gen-form-control"
                          />
                          {errors.name && (
                            <p className="error">
                              {t("AssetsListall.namereq")}
                            </p>
                          )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("AssetsListall.serial")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder={t("AssetsListall.serial")}
                            {...register("serial", { required: true })}
                            className="gen-form-control"
                          />
                          {errors.serial && (
                            <p className="error">
                              {t("AssetsListall.serialreq")}
                            </p>
                          )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("AssetsListall.model_id")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <div className="d-flex align-items-center">
                            <div className="w-100 me-2">
                              <Form.Select
                                {...register("model", { required: true })}
                                className="gen-form-control"
                              >
                                <option value="">{t("select.model")}</option>
                                {models.map((model) => (
                                  <option key={model.id} value={model.id}>
                                    {model.text}
                                  </option>
                                ))}
                              </Form.Select>
                            </div>
                            <Button
                              variant="outline-primary"
                              onClick={openModelsModal}
                              className="px-3"
                            >
                              {t("button.new")}
                            </Button>
                          </div>
                          {errors.model && (
                            <p className="error">{t("select.modelreq")}</p>
                          )}
                        </Form.Group>
                      </Col>

                      <Col md={6} sm={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("accessory.company_id")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Form.Select
                            as="select"
                            {...register("company", { required: true })}
                            className="gen-form-control"
                          >
                            <option value="">{t("select.company")}</option>
                            {companies?.length > 0 &&
                              companies.map((company) => (
                                <option key={company.id} value={company.id}>
                                  {company.text}
                                </option>
                              ))}
                          </Form.Select>
                          {errors.company && (
                            <p className="error">{t("select.companyreq")}</p>
                          )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("AssetsListall.status_id")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <div className="d-flex align-items-center">
                            <div className="w-100 me-2">
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
                            </div>
                            <Button
                              variant="outline-primary"
                              onClick={openStatusModal}
                              className="px-3"
                            >
                              {t("button.new")}
                            </Button>
                          </div>
                          {errors.status_label && (
                            <p className="error">{t("select.statusreq")}</p>
                          )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("accessory.location_id")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <div className="d-flex align-items-center">
                            <div className="w-100 me-2">
                              <Form.Select
                                as="select"
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
                    </Row>
                  )}

                  {step === 2 && (
                    <Row>
                      <Col md={6} sm={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("accessory.purchase_date")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Form.Control
                            type="date"
                            placeholder={t("accessory.purchase_date")}
                            {...register("purchase_date", {
                              required: true,
                              validate: validateNotFutureDate,
                            })}
                            className="gen-form-control"
                          />
                          {errors.purchase_date?.type === "required" && (
                            <p className="error">
                              {t("accessory.purchase_date_req")}
                            </p>
                          )}
                          {errors.purchase_date?.type === "validate" && (
                            <p className="error">{t("accessory.invalid_date")}</p>
                          )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("assetmodel.depreciation_id")}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Form.Select
                            {...register("depreciation_id", { required: true })}
                            className="gen-form-control"
                          >
                            <option value="">
                              {t("assetmodel.depreciation")}
                            </option>
                            {depreciations?.length > 0 &&
                              depreciations.map((depreciation) => (
                                <option
                                  key={depreciation.id}
                                  value={depreciation.id}
                                >
                                  {depreciation.text}
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
                            {t("accessory.supplier_id")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <div className="d-flex align-items-center">
                            <div className="w-100 me-2">
                              <Form.Select
                                {...register("supplier_id", { required: true })}
                                className="gen-form-control"
                              >
                                <option value="">{t("select.vendor")}</option>
                                {vendors?.length > 0 &&
                                  vendors.map((vendors) => (
                                    <option key={vendors.id} value={vendors.id}>
                                      {vendors.text}
                                    </option>
                                  ))}
                              </Form.Select>
                            </div>
                            <Button
                              variant="outline-primary"
                              onClick={openVendorModal}
                              className="px-3"
                            >
                              {t("button.new")}
                            </Button>
                          </div>
                          {errors.supplier_id && (
                            <p className="error">{t("select.supplierreq")}</p>
                          )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("accessory.order_number")}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder={t("accessory.order_number")}
                            {...register("order_number", { required: true })}
                            className="gen-form-control"
                          />
                          {errors.order_number && (
                            <p className="error">
                              {t("accessory.order_number_req")}
                            </p>
                          )}
                        </Form.Group>
                      </Col>

                      <Col md={6} sm={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("accessory.purchase_cost")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Form.Control
                            type="number"
                            disabled={!depreciationId}
                            placeholder={t("accessory.purchase_cost")}
                            {...register("purchase_cost", {
                              required: true,
                              pattern: /^\s*(?=.*[1-9])\d*(?:\.\d{1,2})?\s*$/,
                              validate: (value) => {
                                if (
                                  depreciationId &&
                                  parseFloat(value) < parseFloat(residualValue)
                                ) {
                                  return t(
                                    "AssetsListall.purchaseCostValidation",
                                  );
                                }
                                return true;
                              },
                            })}
                            className="gen-form-control"
                          />
                          {errors.purchase_cost && (
                            <p className="error">
                              {errors?.purchase_cost?.message ||
                                (errors?.purchase_cost?.type === "required" &&
                                  t("component.purchase_cost_req")) ||
                                (errors?.purchase_cost?.type === "pattern" &&
                                  t("component.invalid_data"))}
                            </p>
                          )}
                        </Form.Group>

                        {(isAddMode || isCloneMode) && (
                          <Form.Group className="mb-3">
                            <Form.Label>
                              {t("AssetsListall.GST")}{" "}
                              <span className="mandatory">*</span>
                            </Form.Label>
                            <Form.Control
                              type="number"
                              placeholder={t("AssetsListall.GST")}
                              {...register("GST", {
                                required: true,
                                pattern: {
                                  value: /^\s*(?=.*[1-9])\d*(?:\.\d{1,2})?\s*$/,
                                },
                              })}
                              className="gen-form-control"
                            />
                            {errors.GST?.type === "required" && (
                              <p role="alert" className="error">
                                {t("AssetsListall.GSTreq")}
                              </p>
                            )}
                            {errors.GST?.type === "pattern" && (
                              <p role="alert" className="error">
                                {t("AssetsListall.invalidGST")}
                              </p>
                            )}
                          </Form.Group>
                        )}

                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("AssetsListall.Warranty")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <InputGroup>
                            <Form.Control
                              type="number"
                              placeholder={t("AssetsListall.Warranty")}
                              {...register("warranty_months", {
                                required: true,
                                pattern: {
                                  value: /^\s*(?=.*[1-9])\d*(?:\.\d{1,2})?\s*$/,
                                },
                              })}
                              className="gen-form-control"
                            />
                            <InputGroup.Text>Month</InputGroup.Text>
                          </InputGroup>
                          {errors.warranty_months?.type === "required" && (
                            <p role="alert" className="error">
                              {t("AssetsListall.Warrantyreq")}
                            </p>
                          )}
                          {errors.warranty_months?.type === "pattern" && (
                            <p role="alert" className="error">
                              {t("AssetsListall.invalidWarranty")}
                            </p>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>
                  )}

                  {step === 3 && (
                    <Row>
                      <Col md={6} sm={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>{t("accessory.notes")}</Form.Label>
                          <span className="mandatory">*</span>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder={t("accessory.notes")}
                            {...register("notes", { required: true })}
                            className="gen-form-control"
                          />
                          {errors.notes && (
                            <p className="error">{t("accessory.notereq")}</p>
                          )}
                        </Form.Group>

                        <div className="d-flex align-items-center mb-3">
                          <Form.Label className="mb-0 me-2">{t("AssetsListall.info") || "Info Columns"}</Form.Label>
                          <Button
                            variant="outline-primary"
                            onClick={addInfoTextBox}
                            size="sm"
                          >
                            + Add
                          </Button>
                        </div>

                        {infoTextBoxes.map((textBox, index) => (
                          <Form.Group
                            key={index}
                            className="mb-3 d-flex align-items-center"
                          >
                            <Form.Control
                              type="text"
                              value={textBox}
                              onChange={(e) =>
                                handleTextBoxChange(index, e.target.value)
                              }
                              className="gen-form-control me-2"
                            />
                            <Button
                              variant="danger"
                              onClick={() => removeInfoTextBox(index)}
                              className="remove_btn px-3"
                            >
                              {t("button.Remove")}
                            </Button>
                          </Form.Group>
                        ))}
                      </Col>

                      <Col md={6} sm={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>{t("AssetsListall.Image")}</Form.Label>
                          <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="gen-form-control"
                          />
                          {imagePreview && (
                            <div className="mt-3">
                              <img
                                src={imagePreview}
                                alt="Asset Preview"
                                style={{
                                  width: "100px",
                                  borderRadius: "5px",
                                  objectFit: "cover",
                                  border: "1px solid #ddd",
                                  cursor: "pointer",
                                }}
                                onClick={() => setShowImageModal(true)}
                              />
                            </div>
                          )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Check
                            type="checkbox"
                            label={t("AssetsListall.requestable")}
                            {...register("requestable")}
                            className="gen-form-control"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  )}

                  <div className="wizard-footer-buttons mt-5">
                    {step === 1 ? (
                      <Button key="cancel-btn" variant="outline-primary" type="button" onClick={backClick}>
                        {t("category.btnCancel")}
                      </Button>
                    ) : (
                      <Button key="back-btn" variant="outline-primary" type="button" onClick={handlePrevStep}>
                        {t("button.back") || "Back"}
                      </Button>
                    )}

                    {step < 3 ? (
                      <Button key="next-btn" className="primary" type="button" onClick={handleNextStep}>
                        {t("button.next") || "Next"}
                      </Button>
                    ) : (
                      <Button key="submit-btn" className="primary" type="submit">
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
      <Modal
        show={showImageModal}
        onHide={() => setShowImageModal(false)}
        size="lg"
      >
        <Modal.Header closeButton></Modal.Header>
        <Modal.Body className="text-center">
          <img
            src={imagePreview}
            alt="Full Size Asset"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </Modal.Body>
      </Modal>

      <Addmodel
        show={showModelsModal}
        handleClose={closeModelsModal}
        onModelSubmit={handleModelsSubmit}
      />
      <AddVendor
        show={showVendorModal}
        handleClose={closeVendorModal}
        onVendorSubmit={handleVendorSubmit}
      />
      <AddStatusModal
        show={showStatusModal}
        handleClose={closeStatusModal}
        onStatusSubmit={handleStatusSubmit}
      />
      <AddLocation
        show={showLocationModal}
        handleClose={closeLocationModal}
        onLocationSubmit={handleLocationSubmit}
      />
    </Container>
  );
};

export default AssetsListall;
