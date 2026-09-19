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

const CheckOutComponents = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const { t } = useTranslation();
  let { id } = useParams();
  const [asset, setAsset] = useState([]);
  const [componentName, setComponentName] = useState("");
  const [remainingQty, setRemainingQty] = useState("");
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    const initialize = async () => {
      await fetchDropdownData();
      await getDetails();
    };
    initialize();
  }, [id]);

  const fetchDropdownData = async () => {
    try {
      const [assetResponse] = await Promise.all([
        axios.get(`${Domain}/hardware/selectList?page=1`),
      ]);

      if (assetResponse?.data) {
        setAsset(assetResponse?.data?.items);
      } else setApiError(t("alert.dropdown"));
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const getDetails = async () => {
    try {
      const response = await axios.get(`${Domain}/components/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response?.data) {
        const { name, remaining } = response.data;
        setComponentName(name);
        setRemainingQty(remaining);
        setValue("name", name);
      } else setApiError(t("alert.error"));
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const onSubmit = async (data) => {
    const body = {
      asset_id: data?.assetname,
      assigned_qty: data?.qty,
      name: data?.name,
    };
    try {
      const response = await axios({
        method: "post",
        url: `${Domain}/components/${id}/checkout`,
        data: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response?.data?.success) {
        common.notify("S", t("Checkout.success"));
        navigate("/components");
      } else setApiError(response?.data?.message);
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const backClick = () => {
    navigate("/components");
  };

  return (
    <Container fluid>
      <Row>
        <Col md={12}>
          <div>
            <div className="title d-flex justify-content-between">
              <div>
                <h1>
                  {" "}
                  {componentName} ({remainingQty})
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
                  <Row>
                    {apiError && (
                      <div className="alert alert-danger"> {apiError} </div>
                    )}
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
                            disabled
                          />
                        </Col>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("select.assetname")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Col md={8} sm={12}>
                          <Form.Select
                            as="select"
                            {...register("assetname", { required: true })}
                            className="gen-form-control"
                          >
                            <option value="">{t("select.assetname")}</option>
                            {asset?.length > 0 &&
                              asset.map((asset) => (
                                <option key={asset.id} value={asset.id}>
                                  {asset.text}
                                </option>
                              ))}
                          </Form.Select>
                        </Col>
                        {errors.assetname && (
                          <p className="error">{t("select.assetreq")}</p>
                        )}
                      </Form.Group>
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
                        {errors?.qty?.type === "required" && (
                          <p className="error">{t("component.quantityreq")}</p>
                        )}
                        {errors?.qty?.type === "pattern" && (
                          <p className="error">{t("component.invalid_data")}</p>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
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
                </Form>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default CheckOutComponents;
