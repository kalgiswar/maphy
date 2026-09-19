import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useTranslation } from "react-i18next";
import Modal from "react-bootstrap/Modal";
import "./_modal.scss";
import "font-awesome/css/font-awesome.min.css";
import { common } from "../Common/common";
const Domain = process.env.REACT_APP_API_URL;

function AddCategory(props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const { t } = useTranslation();
  const [message, setMessage] = useState("");

  const onSubmit = async (data) => {
    const body = {
      name: data?.name,
      category_type: data?.categoryType,
    };
    try {
      const response = await axios({
        method: "post",
        url: `${Domain}/categories`,
        data: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response?.data?.success) {
        setMessage("");
        common.notify("S", response?.data?.message);
        reset();
        props.onCategorySubmit(response?.data?.category);     
      } else {
        setMessage(response?.data?.message);
      }
    } catch (error) {
      setMessage(t("alert.error"));
    }
  };
  const onClose = () => {
    setMessage("");
    props.handleClose();
    reset();
  };

  return (
    <>
      <Modal
        show={props.show}
        onHide={onClose}
        backdrop="static"
        keyboard={false}
        animation={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>{t("category.categeoriestitle")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="new-form">
            <Container fluid>
              <Row>
                <Col md={9}>
                  <div>
                    <div className="addProperty wrapper">
                      <div className="basicDetails pt-4">
                        <Form
                          className="mb-3"
                          onSubmit={handleSubmit(onSubmit)}
                        >
                          <Row>
                            <Col sm={12}>
                              {message && <div className="alert alert-danger">{message}</div>}
                              <Form.Group className="mb-3">
                                <Form.Label>
                                  {t("category.name")}
                                  <span className="mandatory">*</span>
                                </Form.Label>
                                <Form.Control
                                  type="text"
                                  placeholder={t("category.name")}
                                  {...register("name", { required: true })}
                                  className="gen-form-control"
                                />
                                {errors.name && (
                                  <p className="error">
                                    {t("category.namerequired")}
                                  </p>
                                )}
                              </Form.Group>
                              <Form.Group className="mb-3">
                                <Form.Label>
                                  {t("category.category_type")}{" "}
                                  <span className="mandatory">*</span>
                                </Form.Label>
                                <Form.Select
                                  className="form-control"
                                  id="category_type"
                                  name="category_type"
                                  {...register("categoryType", {
                                    required: true,
                                  })}
                                >
                                  <option value="">
                                    {t("select.category")}{" "}
                                  </option>
                                  <option
                                    value="Accessory"
                                    disabled={props.pageType !== "Accessory"}
                                  >
                                    {t("category.Accessory")}
                                  </option>
                                  <option
                                    value="License"
                                    disabled={props.pageType !== "License"}
                                  >
                                    {t("category.License")}
                                  </option>
                                  <option
                                    value="Consumable"
                                    disabled={props.pageType !== "Consumable"}
                                  >
                                    {t("category.Consumable")}
                                  </option>
                                  <option
                                    value="Component"
                                    disabled={props.pageType !== "Component"}
                                  >
                                    {t("category.Component")}
                                  </option>
                                  <option
                                    value="Asset"
                                    disabled={props.pageType !== "Asset"}
                                  >
                                    {t("category.Asset")}
                                  </option>
                                </Form.Select>
                                {errors?.categoryType && (
                                  <p role="alert" className="error">
                                    {t("select.categoryreq")}
                                  </p>
                                )}
                              </Form.Group>
                            </Col>
                          </Row>
                          <div className="d-flex mt-5">
                            <Button className="primary mr-1" type="submit">
                              {t("button.save")}
                            </Button>
                            <Button variant="outline-primary" onClick={onClose}>
                              {t("button.cancel")}
                            </Button>
                          </div>
                        </Form>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </Container>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default AddCategory;
