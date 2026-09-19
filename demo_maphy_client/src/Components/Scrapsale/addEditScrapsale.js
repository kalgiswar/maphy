import React, { useEffect, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { useTranslation } from "react-i18next";
import { common } from "../../Common/common";

const Domain = process.env.REACT_APP_API_URL;

const AddScrapSale = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isAddMode = !id;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const [apiError, setApiError] = useState("");

  const getDetails = useCallback(async () => {
    try {
      const response = await axios.get(`${Domain}/scrapSale/${id}`);
      if (response?.data) {
        const fields = [
          "item_name",
          "item_type",
          "sale_date",
          "quantity",
          "unit_price",
          "buyer_name",
          "buyer_contact",
          "remarks",
        ];
        fields.forEach((field) => setValue(field, response.data[field]));
      } else {
        setApiError(t("alert.error"));
      }
    } catch (err) {
      setApiError(t("alert.error"));
    }
  }, [id, setValue, t]);

  useEffect(() => {
    if (!isAddMode) {
      getDetails();
    }
  }, [isAddMode, getDetails]);

  const onSubmit = async (data) => {
    const url = isAddMode ? `${Domain}/scrapSale` : `${Domain}/scrapSale/${id}`;

    try {
      const response = await axios({
        method: isAddMode ? "post" : "put",
        url,
        data: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const isSuccess =
        response?.data?.success === true || response?.status === 200;

      if (isSuccess) {
        const message = response?.data?.message || t("alert.save_success");
        common.notify("S", message);
        setTimeout(() => {
          navigate("/scrapsale");
        }, 100);
      } else {
        setApiError(response?.data?.message || t("alert.error"));
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        t("alert.error");

      setApiError(errorMessage);
    }
  };

  const backClick = () => navigate("/scrapSale");

  return (
    <Container fluid>
      <Row>
        <Col md={12}>
          <div className="title d-flex justify-content-between">
            <h1>
              {isAddMode
                ? t("scrap.create_scrap_sale")
                : t("scrap.edit_scrap_sale")}
            </h1>
            <Button onClick={backClick} className="back">
              {t("button.back")}
            </Button>
          </div>

          <div className="addProperty wrapper">
            <Form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Row>
                {apiError && (
                  <div className="alert alert-danger">{apiError}</div>
                )}

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      {t("scrap.item_name")}{" "}
                      <span className="mandatory">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder={t("scrap.item_name")}
                      {...register("item_name", { required: true })}
                      className="gen-form-control"
                    />
                    {errors.item_name && (
                      <p className="error">{t("scrap.item_name_required")}</p>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      {t("scrap.item_type")}{" "}
                      <span className="mandatory">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder={t("scrap.item_type")}
                      {...register("item_type", { required: true })}
                      className="gen-form-control"
                    />
                    {errors.item_type && (
                      <p className="error">{t("scrap.item_type_required")}</p>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      {t("scrap.sale_date")}{" "}
                      <span className="mandatory">*</span>
                    </Form.Label>
                    <Form.Control
                      type="date"
                      placeholder={t("scrap.sale_date")}
                      {...register("sale_date", { required: true })}
                      className="gen-form-control"
                    />
                    {errors.sale_date && (
                      <p className="error">{t("scrap.sale_date_required")}</p>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      {t("scrap.quantity")} <span className="mandatory">*</span>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      placeholder={t("scrap.quantity")}
                      {...register("quantity", {
                        required: true,
                        min: 1,
                        valueAsNumber: true, // ✅ ensures it's a number
                      })}
                      className="gen-form-control"
                    />
                    {errors.quantity && (
                      <p className="error">{t("scrap.quantity_required")}</p>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      {t("scrap.unit_price")}{" "}
                      <span className="mandatory">*</span>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      placeholder={t("scrap.unit_price")}
                      {...register("unit_price", {
                        required: true,
                        min: 0,
                        valueAsNumber: true, // ✅ ensures it's a number
                      })}
                      className="gen-form-control"
                    />
                    {errors.unit_price && (
                      <p className="error">{t("scrap.unit_price_required")}</p>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      {t("scrap.buyer_name")}{" "}
                      <span className="mandatory">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder={t("scrap.buyer_name")}
                      {...register("buyer_name", { required: true })}
                      className="gen-form-control"
                    />
                    {errors.buyer_name && (
                      <p className="error">{t("scrap.buyer_name_required")}</p>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      {t("scrap.buyer_contact")}{" "}
                      <span className="mandatory">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder={t("scrap.buyer_contact")}
                      {...register("buyer_contact", { required: true })}
                      className="gen-form-control"
                    />
                    {errors.buyer_contact && (
                      <p className="error">
                        {t("scrap.buyer_contact_required")}
                      </p>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>{t("scrap.remarks")}</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder={t("scrap.remarks")}
                      {...register("remarks")}
                      className="gen-form-control"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex mt-4">
                <Button type="submit" className="primary me-2">
                  {t("scrap.submit")}
                </Button>
                <Button variant="outline-primary" onClick={backClick}>
                  {t("button.cancel")}
                </Button>
              </div>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default AddScrapSale;
