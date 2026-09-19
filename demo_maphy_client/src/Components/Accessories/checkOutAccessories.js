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
  const [user, setUser] = useState([]);
  const [accessoriename, setAccessoriename] = useState("");
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
      const userResponse = await axios.get(`${Domain}/users/selectList?page=1`);

      if (userResponse?.data) {
        setUser(userResponse?.data?.items);
      } else {
        setApiError(t("alert.dropdown"));
      }
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const getDetails = async () => {
    try {
      const response = await axios.get(`${Domain}/accessories/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response?.data) {
        setValue("name", response?.data?.name);
        setValue("AccessoriesCategory", response?.data?.category?.name);
      }
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const onSubmit = async (data) => {
    const body = {
      // AccessoriesCategory: data?.AccessoriesCategory,
      assigned_to: data?.user,
      note: data?.notes,
    };
    try {
      const response = await axios({
        method: "post",
        url: `${Domain}/accessories/${id}/checkout`,
        data: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response?.data?.success) {
        common.notify("S", t("Checkout.success"));
        navigate("/Accessories");
      } else {
        setApiError(response?.data?.message);
      }
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const backClick = () => {
    navigate("/Accessories");
  };

  return (
    <Container fluid>
      <Row>
        <Col md={12}>
          <div>
            <div className="title d-flex justify-content-between">
              <div>
                <h1>
                  {t("accessory.checkoutaccessory")} {accessoriename}
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
                  {apiError && (<div className="alert alert-danger"> {apiError}  </div>)}

                    <Col md={6} sm={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("accessory.name")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Col md={8} sm={12}>
                          <Form.Control
                            type="text"
                            placeholder={t("accessory.name")}
                            {...register("name", { required: true })}
                            className="gen-form-control"
                            disabled
                          />
                        </Col>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("accessory.accessoriescategory")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Col md={8} sm={12}>
                          <Form.Control
                            type="text"
                            placeholder={t("accessory.accessoriescategory")}
                            {...register("AccessoriesCategory", {
                              required: true,
                            })}
                            className="gen-form-control"
                            disabled
                          />
                        </Col>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("select.user")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Col md={8} sm={12}>
                          <Form.Select
                            as="select"
                            {...register("user", { required: true })}
                            className="gen-form-control"
                          >
                            <option value="">{t("select.users")}</option>
                            {user?.length > 0 &&
                              user.map((user) => (
                                <option key={user.id} value={user.id}>
                                  {user.text}
                                </option>
                              ))}
                          </Form.Select>
                        </Col>
                        {errors.user && (
                          <p className="error">{t("select.user_req")}</p>
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
