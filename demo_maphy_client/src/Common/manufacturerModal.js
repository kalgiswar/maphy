import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import "./_modal.scss";
import "font-awesome/css/font-awesome.min.css";
import { useForm } from "react-hook-form";
import axios from "axios";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useTranslation } from "react-i18next";
import { common } from "../Common/common";

const Domain = process.env.REACT_APP_API_URL;

function AddManufacturer(props) {
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
      name: data?.manufacturer,
    };
    try {
      const response = await axios({
        method: "post",
        url: `${Domain}/manufacturers`,
        data: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response?.data?.success) {
        common.notify("S", response?.data?.message);
        reset();
        setMessage("");
        props.onManufacturerSubmit();
      } else {
        setMessage(response?.data?.message);
      }
    } catch (error) {
      setMessage(t("alert.error"));
    }
  };
  const onClose = () => {
    setMessage("");
    reset();
    props.handleClose();
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
          <Modal.Title>{t("manufacturers.createmanufacture")}</Modal.Title>
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
                          {message && (
                            <div className="alert alert-danger">{message}</div>
                          )}
                          <Row>
                            <Col sm={12}>
                              <Form.Group className="mb-3">
                                <Form.Label>
                                  {t("manufacturers.name")}
                                  <span className="mandatory">*</span>
                                </Form.Label>
                                <Form.Control
                                  type="text"
                                  placeholder={t("manufacturers.name")}
                                  {...register("manufacturer", {
                                    required: true,
                                  })}
                                  className="gen-form-control"
                                />
                                {errors.manufacturer && (
                                  <p className="error">
                                    {t("manufacturers.namerequired")}
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

export default AddManufacturer;
