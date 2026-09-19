import React, { useState, useEffect } from "react";
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

function CreateModelModal(props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const { t } = useTranslation();
  const [manufacturers, setManufacturers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const [categoryResponse, manufacturerResponse] = await Promise.all([
        axios.get(`${Domain}/categories/selectList/Asset?page=1`),
        axios.get(`${Domain}/manufacturers/selectList?page=1`),
      ]);
      setManufacturers(manufacturerResponse?.data?.items || []);
      setCategories(categoryResponse?.data || []);
    } catch (error) {
      setMessage(t("alert.error"));
    }
  };

  const onSubmit = async (data) => {
    const body = {
      name: data?.modelName,
      manufacturer_id: data?.manufacturer_id,
      category_id: data?.category,
      model_number: data?.modelNumber,
    };
    try {
      const response = await axios({
        method: "post",
        url: `${Domain}/models`,
        data: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response?.data?.success) {
        common.notify("S", response?.data?.message);
        reset();
        setMessage("");
        props.onModelSubmit(response?.data?.model);
      } else {
        setMessage(response?.data?.message);
      }
    } catch (error) {
      console.log("error:", error)
      setMessage(t("alert.error"));
    }
  };

  const onClose = () => {
    setMessage("");
    props.handleClose();
    reset();
  };

  return (
    <Modal
      show={props.show}
      onHide={props.handleClose}
      backdrop="static"
      keyboard={false}
      animation={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>{t("AssetsListall.createmodel")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container fluid>
          <Row>
            <Col md={12}>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <Row>
                  <Col sm={12}>
                    {message && (
                      <div className="alert alert-danger">{message}</div>
                    )}
                    <Form.Group className="mb-3">
                      <Form.Label>
                        {t("AssetsListall.modelname")}
                        <span className="mandatory">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder={t("AssetsListall.entermodelname")}
                        {...register("modelName", { required: true })}
                        className="gen-form-control"
                      />
                      {errors.modelName && (
                        <p className="error">{t("select.modelnamereq")}</p>
                      )}
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        {t("assetmodel.manufacturer_id")}{" "}
                        <span className="mandatory">*</span>
                      </Form.Label>
                      <Form.Select
                        {...register("manufacturer_id", { required: true })}
                        className="gen-form-control"
                      >
                        <option value="">{t("assetmodel.manufacturer")}</option>
                        {manufacturers?.length > 0 &&
                          manufacturers.map((manufacturer) => (
                            <option
                              key={manufacturer.id}
                              value={manufacturer.id}
                            >
                              {manufacturer.text}
                            </option>
                          ))}
                      </Form.Select>
                      {errors.manufacturer_id && (
                        <p className="error">
                          {t("assetmodel.manufacturerreq")}
                        </p>
                      )}
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        {t("assetmodel.category_id")}{" "}
                        <span className="mandatory">*</span>
                      </Form.Label>
                      <Form.Select
                        {...register("category", { required: true })}
                        className="gen-form-control"
                      >
                        <option value="">{t("assetmodel.category")}</option>
                        {categories?.length > 0 &&
                          categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.text}
                            </option>
                          ))}
                      </Form.Select>
                      {errors.category && (
                        <p className="error">{t("select.categoryreq")}</p>
                      )}
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        {t("newbutton.modelnumber")}
                        <span className="mandatory">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder={t("AssetsListall.entermodelnumber")}
                        {...register("modelNumber", { required: true })}
                        className="gen-form-control"
                      />
                      {errors.modelNumber && (
                        <p className="error">{t("assetmodel.numberreq")}</p>
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
            </Col>
          </Row>
        </Container>
      </Modal.Body>
    </Modal>
  );
}

export default CreateModelModal;
