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

const CheckOutConsumables = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const { t } = useTranslation();
  let { id } = useParams();
  const [users, setUsers] = useState([]);
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
      const [userResponse] = await Promise.all([
        axios.get(`${Domain}/users/selectList?page=1`),
      ]);

      if (userResponse?.data) setUsers(userResponse?.data?.items);
      else {
        setApiError(t("alert.dropdown"));
      }
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const getDetails = async () => {
    try {
      const response = await axios.get(`${Domain}/consumables/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response?.data) {
        const { name } = response.data;
        setValue("name", name);
      } else setApiError(t("alert.error"));
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const onSubmit = async (data) => {
    const body = {
      notes: data?.notes,
      assigned_to: data?.user,
      name: data?.name,
    };
    try {
      const response = await axios({
        method: "post",
        url: `${Domain}/consumables/${id}/checkout`,
        data: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response?.data?.success) {
        common.notify("S", t("Checkout.success"));
        navigate("/consumables");
      } else setApiError(response?.data?.message);
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const backClick = () => {
    navigate("/consumables");
  };

  return (
    <Container fluid>
      <Row>
        <Col md={12}>
          <div>
            <div className="title d-flex justify-content-between">
              <div>
                <h1>{t("consumable.checkout")}</h1>
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
                    <div>
                      {apiError && (
                        <div className="alert alert-danger"> {apiError} </div>
                      )}
                    </div>
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
                            {users.map((user) => (
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
                          {t("consumable.notes")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Col md={8} sm={12}>
                          <Form.Control
                            type="textarea"
                            placeholder={t("consumable.notes")}
                            {...register("notes", { required: true })}
                            className="gen-form-control"
                          />
                        </Col>
                        {errors.notes && (
                          <p className="error">{t("consumable.notesreq")}</p>
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

export default CheckOutConsumables;
