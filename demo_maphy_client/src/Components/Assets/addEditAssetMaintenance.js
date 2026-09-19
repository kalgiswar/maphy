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

const AddEditAssetMaintenance = () => {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();
  const isAddMode = !id;
  const [apiError, setApiError] = useState("");
  const [vendors, setVendors] = useState([]);
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    const initialize = async () => {
      await fetchDropdownData();
      if (!isAddMode) {
        await fetchAssetMaintenance();
      }
    };

    initialize();
  }, [id, isAddMode]);

  const fetchDropdownData = async () => {
    try {
      const [assetResponse, vendorResponse] = await Promise.all([
        axios.get(`${Domain}/hardware/selectList?page=1`),
        axios.get(`${Domain}/suppliers/selectList?page=1`),
      ]);

      if (assetResponse?.data?.items && vendorResponse?.data?.items) {
        setAssets(assetResponse.data.items);
        setVendors(vendorResponse.data.items);
      } else {
        setApiError(t("alert.dropdown"));
      }
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const fetchAssetMaintenance = async () => {
    try {
      const response = await axios.get(`${Domain}/maintenances/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response?.data) {
        const fields = [
          "asset_id",
          "asset_maintenance_type",
          "completion_date",
          "cost",
          "is_warranty",
          "notes",
          "start_date",
          "supplier_id",
          "title",
        ];
        fields.forEach((field) => {
          setValue(field, response?.data[field]);
        });
        setValue("start_date", response?.data?.start_date?.date);
        setValue("completion_date", response?.data?.completion_date?.date);
        setValue("supplier_id", response?.data?.supplier?.id);
        setValue("asset_id", response?.data?.asset?.id);
        setValue("WarrantyMonths", response?.data?.is_warranty === 1);
      } else {
        setApiError(t("alert.error"));
      }
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const onSubmit = async (data) => {
    const body = {
      asset_id: data?.asset_id,
      asset_maintenance_type: data?.asset_maintenance_type,
      completion_date: data?.completion_date,
      cost: data?.cost,
      is_warranty: data?.WarrantyMonths ? 1 : 0,
      notes: data?.notes,
      title: data?.title,
      start_date: data?.start_date,
      supplier_id: data?.supplier_id,
    };

    try {
      const response = await axios({
        method: isAddMode ? "post" : "put",
        url: isAddMode
          ? `${Domain}/maintenances`
          : `${Domain}/maintenances/${id}`,
        data: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response?.data?.success) {
        const successMessage = response?.data?.message;
        common.notify("S", successMessage);
        navigate("/assetMaintenance");
      } else {
        setApiError(response?.data?.message);
      }
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const backClick = () => {
    navigate("/assetMaintenance");
  };

  const validateDateRange = (value) => {
    const startDate = getValues("start_date");
    return (
      new Date(startDate) < new Date(value) ||
      t("assetMaintenance.dateRangeError")
    );
  };

  return (
    <Container fluid>
      <Row>
        <Col md={12}>
          <div>
            <div className="title d-flex justify-content-between">
              <div>
                <h1>
                  {isAddMode
                    ? t("assetMaintenance.createasset")
                    : t("assetMaintenance.updateasset")}
                </h1>
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
                  {apiError && (
                    <div className="alert alert-danger"> {apiError} </div>
                  )}
                  <Row>
                    <Col md={6} sm={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("assetmodel.asset")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Col md={8} sm={12}>
                          <Form.Select
                            {...register("asset_id", { required: true })}
                            className="gen-form-control"
                          >
                            <option value="">{t("select.asset")}</option>
                            {assets?.map((asset) => (
                              <option key={asset.id} value={asset.id}>
                                {asset.text}
                              </option>
                            ))}
                          </Form.Select>
                        </Col>
                        {errors.asset_id && (
                          <p className="error">{t("select.assetreq")}</p>
                        )}
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("accessory.supplier_id")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>

                        <Col md={8} sm={12}>
                          <Form.Select
                            {...register("supplier_id", { required: true })}
                            className="gen-form-control"
                          >
                            <option value="">{t("select.vendor")}</option>
                            {vendors?.map((vendor) => (
                              <option key={vendor.id} value={vendor.id}>
                                {vendor.text}
                              </option>
                            ))}
                          </Form.Select>
                        </Col>
                        {errors.supplier_id && (
                          <p className="error">{t("select.supplierreq")}</p>
                        )}
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("assetMaintenance.asset_maintenance_type")}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Col md={8} sm={12}>
                          <Form.Select
                            {...register("asset_maintenance_type", {
                              required: true,
                            })}
                            className="gen-form-control"
                          >
                            <option value="">
                              {t("select.assetMaintenanceType")}
                            </option>
                            <option value="Maintenance">
                              {t("assetMaintenance.Maintenance")}
                            </option>
                            <option value="Repair">
                              {t("assetMaintenance.Repair")}
                            </option>
                            <option value="Upgrade">
                              {t("assetMaintenance.Upgrade")}
                            </option>
                            <option value="PAT Test">
                              {t("assetMaintenance.PATTest")}
                            </option>
                            <option value="Calibration">
                              {t("assetMaintenance.Calibration")}
                            </option>
                            <option value="Hardware Support">
                              {t("assetMaintenance.HardwareSupport")}
                            </option>
                            <option value="Software Support">
                              {t("assetMaintenance.SoftwareSupport")}
                            </option>
                          </Form.Select>
                        </Col>
                        {errors.asset_maintenance_type && (
                          <p className="error">
                            {t("select.assetMaintenanceTypeReq")}
                          </p>
                        )}
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("AssetsListall.title")}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Col md={8} sm={12}>
                          <Form.Control
                            type="text"
                            placeholder={t("AssetsListall.title")}
                            {...register("title", { required: true })}
                            className="gen-form-control"
                          />
                        </Col>
                        {errors.title && (
                          <p className="error">{t("AssetsListall.titlereq")}</p>
                        )}
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("AssetsListall.startdate")}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Col md={8} sm={12}>
                          <Form.Control
                            type="date"
                            {...register("start_date", {
                              required: t("AssetsListall.startreq"),
                            })}
                            className="gen-form-control"
                          />
                        </Col>
                        {errors.start_date && (
                          <p className="error">{errors.start_date.message}</p>
                        )}
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("AssetsListall.completiondate")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Col md={8} sm={12}>
                          <Form.Control
                            type="date"
                            {...register("completion_date", {
                              required: t("AssetsListall.completerequired"),
                              validate: validateDateRange,
                            })}
                            className="gen-form-control"
                          />
                        </Col>
                        {errors.completion_date && (
                          <p className="error">
                            {errors.completion_date.message}
                          </p>
                        )}
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Check
                          type="checkbox"
                          label={t("assetMaintenance.WarrantyMonths")}
                          {...register("WarrantyMonths")}
                          className="gen-form-control"
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("assetmodel.cost")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Col md={8} sm={12}>
                          <Form.Control
                            type="number"
                            placeholder={t("assetmodel.cost")}
                            {...register("cost", {
                              required: true,
                              pattern: /^\s*(?=.*[1-9])\d*(?:\.\d{1,2})?\s*$/,
                            })}
                            className="gen-form-control"
                          />
                        </Col>
                        {errors.cost?.type === "required" && (
                          <p className="error">
                            {t("accessory.purchase_cost_req")}
                          </p>
                        )}
                        {errors.cost?.type === "pattern" && (
                          <p className="error">{t("accessory.invalidcost")}</p>
                        )}
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>{t("accessory.notes")}</Form.Label>
                        <span className="mandatory">*</span>
                        <Col md={8} sm={12}>
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
                        </Col>
                      </Form.Group>

                      <Row>
                        <div className="d-flex mt-5">
                          <Button className="primary mr-1" type="submit">
                            {t("category.submit")}
                          </Button>
                          <Button variant="outline-primary" onClick={backClick}>
                            {t("category.btnCancel")}
                          </Button>
                        </div>
                      </Row>
                    </Col>
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

export default AddEditAssetMaintenance;
