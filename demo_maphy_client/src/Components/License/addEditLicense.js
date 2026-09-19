import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams,useLocation } from "react-router-dom";
import axios from "axios";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useTranslation } from "react-i18next";
import AddManufacturer from "../../Common/manufacturerModal";
import AddCategory from "../../Common/categoryModal";
import AddVendor from '../../Common/vendorModal';
import { common } from "../../Common/common";

const Domain = process.env.REACT_APP_API_URL;

const AddEditLicense = (props) => {
    const { register, handleSubmit, setValue, trigger, clearErrors, getValues, setError, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const params = useParams();
    const isModal = props && props.isModal;
    const id = isModal ? props.id : params.id;
    const location = useLocation();
    const { state } = location;
    const isAddMode = !id;
    const isCloneMode = isModal ? (props.mode === "clone") : (state?.mode === "clone");
    const [message, setMessage] = useState("");
    const [step, setStep] = useState(1);
    const [manufacturers, setManufacturers] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [categories, setCategories] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showManufacturerModal, setShowManufacturersModal] = useState(false);
    const [showVendorModal, setShowVendorModal] = useState(false);

    useEffect(() => {
        const initialize = async () => {
          await fetchDropdownData();
          if (!isAddMode || isCloneMode) {
            await getLicenseDetails();
          }
        };
    
        initialize();
      }, [id, isAddMode, isCloneMode]);

    const fetchDropdownData = async () => {
        try {
            const [companiesResponse, categoryResponse, manufactureResponse, vendorResponse] = await Promise.all([
                axios.get(`${Domain}/companies/selectList?page=1`),
                axios.get(`${Domain}/categories/selectList/License?page=1`),
                axios.get(`${Domain}/manufacturers/selectList?page=1`),
                axios.get(`${Domain}/suppliers/selectList?page=1`),
            ]);

            if (companiesResponse?.data && categoryResponse?.data && manufactureResponse?.data && vendorResponse?.data) {
                setCompanies(companiesResponse?.data?.items)
                setCategories(categoryResponse?.data);
                setManufacturers(manufactureResponse?.data?.items);
                setVendors(vendorResponse?.data?.items);
            } else {
                console.error("Error fetching dropdown data");
                setMessage(t("alert.error"));
            }
        } catch (error) {

            console.error("Error fetching dropdown data:", error);
            setMessage(t("alert.error"));
        }
    };

    const openCategoryModal = () => setShowCategoryModal(true);
    const closeCategoryModal = () => setShowCategoryModal(false);

    const openVendorModal = () => setShowVendorModal(true);
    const closeVendorModal = () => setShowVendorModal(false);

    const openManufacturerModal = () => setShowManufacturersModal(true);
    const closeManufacturerModal = () => setShowManufacturersModal(false);

    const handleManufacturerSubmit = async (data) => {
        try {
            const manufacturerResponse = await axios.get(
                `${Domain}/manufacturers/selectList?page=1`
            );
            if (manufacturerResponse?.data) {
                setManufacturers(manufacturerResponse?.data?.items);
            }
            setShowManufacturersModal(false);
        } catch (error) {
            setMessage(t("alert.error"));
            console.error("Error fetching manufacturers:", error);
        }
    };

    const handleCategorySubmit = async (data) => {
        try {
            const categoryResponse = await axios.get(
                `${Domain}/categories/selectList/License?page=1`
            );
            if (categoryResponse?.data) {
                setCategories(categoryResponse?.data);
            }
            setShowCategoryModal(false);
        } catch (error) {
            setMessage(t("alert.error"));
            console.error("Error fetching categories:", error);
        }
    };
    const handleVendorSubmit = async (data) => {
        try {
            const supplierResponse = await axios.get(`${Domain}/suppliers/selectList?page=1`);
            if (supplierResponse?.data) {
                setVendors(supplierResponse?.data?.items);
            }
            setShowVendorModal(false);
        } catch (error) {
            setMessage(t("alert.error"));
            console.error("Error fetching manufacturers:", error);
        }
    };

    const getLicenseDetails = async () => {
        try {
            const response = await axios.get(`${Domain}/licenses/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (response?.data) {
                const fields = ["name", "license_name", "license_email", "maintained", "termination_date", "expiration_date", "serial", "notes", "order_number", "product_key", "purchase_cost", "purchase_order", "reassignable", "seats", "category", "manufacturer", "supplier", "company", "purchase_date"];
                fields.forEach((field) => {
                    if (field === "supplier" || field === "manufacturer" || field === "company" || field === "category") {
                        setValue(field, response?.data[field]?.id);
                    }
                    else if (field === "termination_date" || field === "expiration_date" || field === "purchase_date") {
                        setValue(field, response?.data[field]?.formatted);
                    }
                    else {
                        setValue(field, response?.data[field]);
                    }
                    setMessage("");
                });
            } else {
                setMessage(t("alert.error"));
            }
        } catch (error) {
            console.error("Error fetching details:", error);
            setMessage(t("alert.error"));
        }
    };

    const onSubmit = async (data) => {
        const body = {
            category_id: data?.category,
            company_id: data?.company,
            expiration_date: data?.expiration_date,
            license_email: data?.license_email,
            license_name: data?.license_name,
            maintained: data?.maintained ? 1 : 0,
            manufacturer_id: data?.manufacturer,
            name: data?.name,
            notes: data?.notes,
            order_number: data?.order_number,
            purchase_cost: data?.purchase_cost,
            purchase_date: data?.purchase_date,
            purchase_order: data?.purchase_order,
            reassignable: data?.reassignable ? 1 : 0,
            seats: data?.seats,
            serial: data?.serial,
            supplier_id: data?.supplier,
            termination_date: data?.termination_date
        };

        try {
            const response = await axios({
                method: isAddMode || isCloneMode ? "post" : "put",
                url: isAddMode || isCloneMode ? `${Domain}/licenses` : `${Domain}/licenses/${id}`,
                data: JSON.stringify(body),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response?.data?.success) {
                setMessage("");
                common.notify("S", response?.data?.message);
                if (isModal) {
                    props.onSuccess();
                } else {
                    navigate("/license");
                }
            } else {
                setMessage(response?.data?.message);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            setMessage(t("alert.error"));
        }
    };

    const backClick = () => {
        if (isModal) {
            props.handleClose();
        } else {
            navigate("/license");
        }
    };

    const validateNotFutureDate = (value) => {
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to ensure accurate comparison
        return selectedDate <= today || "Future dates are not allowed";
    };

    const validatePastDate = (value) => {
        const today = new Date();
        const selectedDate = new Date(value);
        today.setHours(0, 0, 0, 0);
        return selectedDate >= today || "Date must be in the future";
    };

    const handleNextStep = () => {
        const values = getValues();
        let isValid = true;
        clearErrors();

        if (step === 1) {
            if (!values.name || !String(values.name).trim()) {
                setError("name", { type: "required" });
                isValid = false;
            }
            if (!values.category || !String(values.category).trim()) {
                setError("category", { type: "required" });
                isValid = false;
            }
            if (!values.serial || !String(values.serial).trim()) {
                setError("serial", { type: "required" });
                isValid = false;
            }
            if (!values.seats || !String(values.seats).trim()) {
                setError("seats", { type: "required" });
                isValid = false;
            } else if (!/^\s*(?=.*[1-9])\d*(?:\.\d{1,2})?\s*$/.test(String(values.seats))) {
                setError("seats", { type: "pattern" });
                isValid = false;
            }
            if (!values.company || !String(values.company).trim()) {
                setError("company", { type: "required" });
                isValid = false;
            }
            if (!values.manufacturer || !String(values.manufacturer).trim()) {
                setError("manufacturer", { type: "required" });
                isValid = false;
            }
        } else if (step === 2) {
            if (!values.license_name || !String(values.license_name).trim()) {
                setError("license_name", { type: "required" });
                isValid = false;
            }
            if (!values.license_email || !String(values.license_email).trim()) {
                setError("license_email", { type: "required" });
                isValid = false;
            } else if (!/^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/.test(String(values.license_email))) {
                setError("license_email", { type: "pattern" });
                isValid = false;
            }
            if (!values.supplier || !String(values.supplier).trim()) {
                setError("supplier", { type: "required" });
                isValid = false;
            }
            if (!values.order_number || !String(values.order_number).trim()) {
                setError("order_number", { type: "required" });
                isValid = false;
            }
            if (!values.purchase_order || !String(values.purchase_order).trim()) {
                setError("purchase_order", { type: "required" });
                isValid = false;
            }
        }

        if (isValid) {
            setStep(step + 1);
        }
    };

    const handleSubmitClick = async () => {
        const values = getValues();
        let isValid = true;
        clearErrors();

        if (!values.purchase_cost || !String(values.purchase_cost).trim()) {
            setError("purchase_cost", { type: "required" });
            isValid = false;
        } else if (!/^\s*(?=.*[1-9])\d*(?:\.\d{1,2})?\s*$/.test(String(values.purchase_cost))) {
            setError("purchase_cost", { type: "pattern" });
            isValid = false;
        }

        if (!values.purchase_date || !String(values.purchase_date).trim()) {
            setError("purchase_date", { type: "required" });
            isValid = false;
        } else {
            const dateValRes = validateNotFutureDate(values.purchase_date);
            if (dateValRes !== true) {
                setError("purchase_date", { type: "validate" });
                isValid = false;
            }
        }

        if (!values.expiration_date || !String(values.expiration_date).trim()) {
            setError("expiration_date", { type: "required" });
            isValid = false;
        } else {
            const dateValRes = validatePastDate(values.expiration_date);
            if (dateValRes !== true) {
                setError("expiration_date", { type: "validate" });
                isValid = false;
            }
        }

        if (!values.termination_date || !String(values.termination_date).trim()) {
            setError("termination_date", { type: "required" });
            isValid = false;
        } else {
            const dateValRes = validatePastDate(values.termination_date);
            if (dateValRes !== true) {
                setError("termination_date", { type: "validate" });
                isValid = false;
            }
        }

        if (!values.notes || !String(values.notes).trim()) {
            setError("notes", { type: "required" });
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
        const progressPercent = ((step - 1) / 2) * 100;
        return (
            <div className="wizard-progress-container mb-5">
                <div className="wizard-progress-bar" style={{ width: `${progressPercent}%` }}></div>
                <div className="wizard-steps-indicator">
                    <div className={`wizard-step-node ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                        <span className="step-num">{step > 1 ? '✓' : '1'}</span>
                        <span className="step-label">{t("license.step_details") || "Details"}</span>
                    </div>
                    <div className={`wizard-step-node ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                        <span className="step-num">{step > 2 ? '✓' : '2'}</span>
                        <span className="step-label">{t("license.step_supplier") || "Supplier"}</span>
                    </div>
                    <div className={`wizard-step-node ${step >= 3 ? 'active' : ''}`}>
                        <span className="step-num">3</span>
                        <span className="step-label">{t("license.step_financials") || "Financial & Dates"}</span>
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
                                <h1>{isAddMode ? t("license.createlicense") : isCloneMode ? t("license.clonelicense") : t("license.updatelicense")}</h1>
                                <Button onClick={backClick} className="back">
                                    {t("button.back")}
                                </Button>
                            </div>
                        )}
                        <div className="addProperty wrapper">
                            <div className="basicDetails pt-4">
                                {renderProgressBar()}
                                <Form className="mb-3" onSubmit={(e) => e.preventDefault()}>
                                    {message && (
                                        <div className="errorMessage mb-4" role="alert" style={{ color: "red" }}>
                                            {message}
                                        </div>
                                    )}

                                    {step === 1 && (
                                        <Row>
                                            <Col md={6} sm={12}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>{t("license.name")} <span className="mandatory">*</span></Form.Label>
                                                    <Col md={8} sm={12}>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder={t("license.name")}
                                                            {...register("name", { onChange: () => clearErrors("name") })}
                                                            className="gen-form-control"
                                                        />
                                                    </Col>
                                                    {errors.name && <p className="error">{t("license.namereq")}</p>}
                                                </Form.Group>

                                                <Form.Group className="mb-3">
                                                    <Form.Label>{t("license.category_id")} <span className="mandatory">*</span></Form.Label>
                                                    <div className="d-flex align-items-center">
                                                        <div className="w-100 me-2">
                                                            <Form.Select
                                                                {...register("category", { onChange: () => clearErrors("category") })}
                                                                className="gen-form-control" >
                                                                <option value="">{t("select.category")}</option>
                                                                {categories?.length > 0 && categories.map((category) => (
                                                                    <option key={category.id} value={category.id}>{category.text}</option>
                                                                ))}
                                                            </Form.Select>
                                                        </div>
                                                        <Button variant="outline-primary" onClick={openCategoryModal} className="px-3">
                                                            {t("button.new")}
                                                        </Button>
                                                    </div>
                                                    {errors.category && <p className="error">{t("select.categoryreq")}</p>}
                                                </Form.Group>

                                                <Form.Group className="mb-3">
                                                    <Form.Label>{t("license.serial")} <span className="mandatory">*</span></Form.Label>
                                                    <Col md={8} sm={12}>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder={t("license.serial")}
                                                            {...register("serial", { onChange: () => clearErrors("serial") })}
                                                            className="gen-form-control"
                                                        />
                                                    </Col>
                                                    {errors.serial && <p className="error">{t("license.serialreq")}</p>}
                                                </Form.Group>

                                                <Form.Group className="mb-3">
                                                    <Form.Label>{t("license.no_of_licenses")} <span className="mandatory">*</span></Form.Label>
                                                    <Col md={8} sm={12}>
                                                        <Form.Control
                                                            type="number"
                                                            placeholder={t("license.no_of_licenses")}
                                                            {...register("seats", { onChange: () => clearErrors("seats") })}
                                                            className="gen-form-control"
                                                        />
                                                    </Col>
                                                    {errors?.seats?.type === "required" && <p className="error">{t("license.no_of_licenses_req")}</p>}
                                                    {errors?.seats?.type === "pattern" && <p className="error">{t("license.no_of_licenses_req_int")}</p>}
                                                </Form.Group>
                                            </Col>

                                            <Col md={6} sm={12}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>{t("license.company_id")} <span className="mandatory">*</span></Form.Label>
                                                    <Col md={8} sm={12}>
                                                        <Form.Select
                                                            {...register("company", { onChange: () => clearErrors("company") })}
                                                            className="gen-form-control"
                                                        >
                                                            <option value="">{t("select.company")}</option>
                                                            {companies?.length > 0 && companies.map((companies) => (
                                                                <option key={companies.id} value={companies.id}>{companies.text}</option>
                                                            ))}
                                                        </Form.Select>
                                                    </Col>
                                                    {errors.company && <p className="error">{t("select.companyreq")}</p>}
                                                </Form.Group>

                                                <Form.Group className="mb-3">
                                                    <Form.Label>{t("license.manufacturer_id")} <span className="mandatory">*</span></Form.Label>
                                                    <div className="d-flex align-items-center">
                                                        <div className="w-100 me-2">
                                                            <Form.Select
                                                                {...register("manufacturer", { onChange: () => clearErrors("manufacturer") })}
                                                                className="gen-form-control"
                                                            >
                                                                <option value="">{t("select.manufacturer")}</option>
                                                                {manufacturers?.length > 0 && manufacturers.map((manufacturer) => (
                                                                    <option key={manufacturer.id} value={manufacturer.id}>{manufacturer.text}</option>
                                                                ))}
                                                            </Form.Select>
                                                        </div>
                                                        <Button variant="outline-primary" onClick={openManufacturerModal} className="px-3">
                                                            {t("button.new")}
                                                        </Button>
                                                    </div>
                                                    {errors.manufacturer && <p className="error">{t("select.manufacturereq")}</p>}
                                                </Form.Group>

                                                <Form.Group className="mb-3">
                                                    <Form.Check
                                                        type="checkbox"
                                                        label={t("license.reassignable")}
                                                        {...register("reassignable")}
                                                        className="gen-form-control"
                                                    />
                                                </Form.Group>

                                                <Form.Group className="mb-3">
                                                    <Form.Check
                                                        type="checkbox"
                                                        label={t("license.maintained")}
                                                        {...register("maintained")}
                                                        className="gen-form-control"
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    )}

                                    {step === 2 && (
                                        <Row>
                                            <Col md={6} sm={12}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>{t("license.license_name")} <span className="mandatory">*</span></Form.Label>
                                                    <Col md={8} sm={12}>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder={t("license.license_name")}
                                                            {...register("license_name", { onChange: () => clearErrors("license_name") })}
                                                            className="gen-form-control"
                                                        />
                                                    </Col>
                                                    {errors.license_name && <p className="error">{t("license.license_name_req")}</p>}
                                                </Form.Group>

                                                <Form.Group className="mb-3">
                                                    <Form.Label>{t("license.license_email")} <span className="mandatory">*</span></Form.Label>
                                                    <Col md={8} sm={12}>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder={t("license.license_email")}
                                                            {...register("license_email", { onChange: () => clearErrors("license_email") })}
                                                            className="gen-form-control"
                                                        />
                                                    </Col>
                                                    {errors.license_email?.type === "required" && <p className="error">{t("license.license_email_req")}</p>}
                                                    {errors?.license_email?.type === "pattern" && <p className="error">{t("license.license_email_pattern")}</p>}
                                                </Form.Group>

                                                <Form.Group className="mb-3">
                                                    <Form.Label>{t("license.supplier_id")} <span className="mandatory">*</span></Form.Label>
                                                    <div className="d-flex align-items-center">
                                                        <div className="w-100 me-2">
                                                            <Form.Select
                                                                {...register("supplier", { onChange: () => clearErrors("supplier") })}
                                                                className="gen-form-control"
                                                            >
                                                                <option value="">{t("license.supplier_id")}</option>
                                                                {vendors?.length > 0 && vendors.map((vendors) => (
                                                                    <option key={vendors.id} value={vendors.id}>{vendors.text}</option>
                                                                ))}
                                                            </Form.Select>
                                                        </div>
                                                        <Button variant="outline-primary" onClick={openVendorModal} className="px-3">
                                                            {t("button.new")}
                                                        </Button>
                                                    </div>
                                                    {errors.supplier && <p className="error">{t("select.supplierreq")}</p>}
                                                </Form.Group>
                                            </Col>

                                            <Col md={6} sm={12}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>{t("license.order_number")} <span className="mandatory">*</span></Form.Label>
                                                    <Col md={8} sm={12}>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder={t("license.order_number")}
                                                            {...register("order_number", { onChange: () => clearErrors("order_number") })}
                                                            className="gen-form-control"
                                                        />
                                                    </Col>
                                                    {errors.order_number && <p className="error">{t("license.order_number_req")}</p>}
                                                </Form.Group>

                                                <Form.Group className="mb-3">
                                                    <Form.Label>{t("license.purchase_order")} <span className="mandatory">*</span></Form.Label>
                                                    <Col md={8} sm={12}>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder={t("license.purchase_order")}
                                                            {...register("purchase_order", { onChange: () => clearErrors("purchase_order") })}
                                                            className="gen-form-control"
                                                        />
                                                    </Col>
                                                    {errors.purchase_order && <p className="error">{t("license.purchase_order_req")}</p>}
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    )}

                                    {step === 3 && (
                                        <Row>
                                            <Col md={6} sm={12}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>{t("license.purchase_cost")} <span className="mandatory">*</span></Form.Label>
                                                    <Col md={8} sm={12}>
                                                        <Form.Control
                                                            type="number"
                                                            placeholder={t("license.purchase_cost")}
                                                            {...register("purchase_cost", { onChange: () => clearErrors("purchase_cost") })}
                                                            className="gen-form-control"
                                                        />
                                                    </Col>
                                                    {errors.purchase_cost?.type === "required" && <p className="error">{t("license.purchase_cost_req")}</p>}
                                                    {errors.purchase_cost?.type === "pattern" && <p className="error">{t("license.purchase_cost_req_int")}</p>}
                                                </Form.Group>

                                                <Form.Group className="mb-3">
                                                    <Form.Label>
                                                        {t("license.purchase_date")}{" "}
                                                        <span className="mandatory">*</span>
                                                    </Form.Label>
                                                    <Col md={8} sm={12}>
                                                        <Form.Control
                                                            type="date"
                                                            placeholder={t("license.purchase_date")}
                                                            {...register("purchase_date", { onChange: () => clearErrors("purchase_date") })}
                                                            className="gen-form-control"
                                                        />
                                                    </Col>
                                                    {errors.purchase_date?.type === "required" && (
                                                        <p className="error">
                                                            {t("license.purchase_date_req")}
                                                        </p>
                                                    )}
                                                    {errors.purchase_date?.type === "validate" && (
                                                        <p className="error">{t("component.invalid_date")}</p>
                                                    )}
                                                </Form.Group>

                                                <Form.Group className="mb-3">
                                                    <Form.Label>{t("license.expiration_date")} <span className="mandatory">*</span></Form.Label>
                                                    <Col md={8} sm={12}>
                                                        <Form.Control
                                                            type="date"
                                                            placeholder={t("license.expiration_date")}
                                                            {...register("expiration_date", { onChange: () => clearErrors("expiration_date") })}
                                                            className="gen-form-control"
                                                        />
                                                    </Col>
                                                    {errors.expiration_date?.type === "required" && <p className="error">{t("license.expiration_date_req")}</p>}
                                                    {errors.expiration_date?.type === "validate" && (
                                                        <p className="error">{t("license.pastdate")}</p>
                                                    )}
                                                </Form.Group>
                                            </Col>

                                            <Col md={6} sm={12}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>{t("license.termination_date")} <span className="mandatory">*</span></Form.Label>
                                                    <Col md={8} sm={12}>
                                                        <Form.Control
                                                            type="date"
                                                            placeholder={t("license.termination_date")}
                                                            {...register("termination_date", { onChange: () => clearErrors("termination_date") })}
                                                            className="gen-form-control"
                                                        />
                                                    </Col>
                                                    {errors.termination_date?.type === "required" && <p className="error">{t("license.termination_date_req")}</p>}
                                                    {errors.termination_date?.type === "validate" && (
                                                        <p className="error">{t("license.pastdate")}</p>
                                                    )}
                                                </Form.Group>

                                                <Form.Group className="mb-3">
                                                    <Form.Label>{t("license.notes")} <span className="mandatory">*</span></Form.Label>
                                                    <Col md={8} sm={12}>
                                                        <Form.Control
                                                            as="textarea"
                                                            placeholder={t("license.notes")}
                                                            {...register("notes", { onChange: () => clearErrors("notes") })}
                                                            className="gen-form-control"
                                                            style={{ minHeight: "100px" }}
                                                        />
                                                    </Col>
                                                    {errors.notes && <p className="error">{t("license.notesreq")}</p>}
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    )}

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

                                        {step < 3 ? (
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
                    </div>
                </Col>
            </Row>
            <AddCategory
                show={showCategoryModal}
                handleClose={closeCategoryModal}
                onCategorySubmit={handleCategorySubmit}
                pageType={t("category.License")}
            />
            <AddManufacturer
                show={showManufacturerModal}
                handleClose={closeManufacturerModal}
                onManufacturerSubmit={handleManufacturerSubmit}
            />
            <AddVendor
                show={showVendorModal}
                handleClose={closeVendorModal}
                onVendorSubmit={handleVendorSubmit}
            />

        </Container>

    );
};

export default AddEditLicense;
