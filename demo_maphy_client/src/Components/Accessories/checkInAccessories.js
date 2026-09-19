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
  let { id, assigned_pivot_id } = useParams();
  const [accessoriesname, setAccessoriesname] = useState("");
  const [remaining, setRemainingQty]=useState();
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    const initialize = async () => {
      await getDetails();
    };
    initialize();
  }, [id]);

  const getDetails = async () => {
    try {
      const response = await axios.get(`${Domain}/accessories/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response?.data) {
        console.log(" setRemainingQty(response?.data?.remaining_qty);:", response?.data)
        setRemainingQty(response?.data?.remaining_qty);
        if (response?.data?.name) {
          setAccessoriesname(response?.data?.name);
          setValue("AssetName", response?.data?.name);
        } else {
          setApiError(t("alert.error"));
        }
      }
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const onSubmit = async (data) => {
    const body = {
      checkin_date: data?.checkindate,
      note: data?.note,
    };

    try {
      const response = await axios({
        method: "post",
        url: `${Domain}/accessories/${assigned_pivot_id}/checkin`,
        data: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response?.data?.success) {
        common.notify("S", t("Checkin.success"));
        navigate(`/accessoriesdetails/${id}`);
      } else {
        setApiError(response?.data?.message);
      }
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const backClick = () => {
    navigate(`/accessoriesdetails/${id}`);
  };

  return (
    <Container fluid>
      <Row>
        <Col md={12}>
          <div>
            <div className="title d-flex justify-content-between">
              <div>
                <h1> {accessoriesname} - ({remaining})</h1>
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
                  {apiError && (<div className="alert alert-danger"> {apiError}  </div>)}
                    <Col md={6} sm={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("accessory.assetname")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Col md={8} sm={12}>
                          <Form.Control
                            type="text"
                            placeholder={t("accessory.assetname")}
                            {...register("AssetName", { required: true })}
                            className="gen-form-control"
                            disabled
                          />
                        </Col>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("accessory.checkin_date")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Col md={8} sm={12}>
                          <Form.Control
                            type="date"
                            placeholder={t("accessory.checkindate")}
                            {...register("checkindate", {
                              required: true,
                            })}
                            className="gen-form-control"
                          />
                        </Col>
                        {errors.checkindate?.type === "required" && (
                          <p className="error">{t("accessory.checkindate")}</p>
                        )}
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("accessory.notes")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Col md={8} sm={12}>
                          <Form.Control
                            as="textarea"
                            placeholder={t("accessory.notes")}
                            {...register("notes", { required: true })}
                            className="gen-form-control"
                          />
                        </Col>
                        {errors.notes && (
                          <p className="error">{t("accessory.notereq")}</p>
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
