
import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import "./_modal.scss";
import "font-awesome/css/font-awesome.min.css";
import { withTranslation } from "react-i18next";
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

function AddStatusModal(props) {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const [typeValue, setTypeValue] = useState("");

  const onSubmit = async (data) => {
    const body = {
      name: data?.name,
      type: data?.type,
    };
    try {
      const response = await axios({
        method: "post",
        url: `${Domain}/statuslabels`,
        data: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response?.data?.success) {
        props.onStatusSubmit();
        common.notify("S", response?.data?.message);
        reset();
        setMessage("");
      } else {
        setMessage(response?.data?.message);
      }
    } catch (error) {
      setMessage(t("alert.message"));
    }
  };

  const onClose = () => {
    props.handleClose();
    reset();
    setMessage("");
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
          <Modal.Title>{t("AssetsListall.createstatus")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="new-form">
            <Container fluid>
              {" "}
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
                            {message && (
                              <div className="alert alert-danger">
                                {message}
                              </div>
                            )}
                            <Col sm={12}>
                              <Form.Group className="mb-3">
                                <Form.Label>
                                  {t("newbutton.statusname")}
                                  <span className="mandatory">*</span>
                                </Form.Label>
                                <Form.Control
                                  type="text"
                                  placeholder={t("newbutton.statusname")}
                                  {...register("name", { required: true })}
                                  className="gen-form-control"
                                />
                                {errors.name && (
                                  <p className="error">
                                    {t("statuslabel.status-name-req")}
                                  </p>
                                )}
                              </Form.Group>
                              <Form.Group className="mb-3">
                                <Form.Label>
                                  {t("AssetsListall.status_id")}
                                  <span className="mandatory">*</span>
                                </Form.Label>
                                <Form.Select
                                  placeholder={t("AssetsListall.status_id")}
                                  {...register("type", { required: true })}
                                  className="gen-form-control"
                                  value={typeValue}
                                  onChange={(e) => {
                                    setTypeValue(e.target.value);
                                    setValue("type", e.target.value);
                                  }}
                                >
                                  <option value="">
                                    {t("statuslabel.type")}
                                  </option>
                                  <option value="deployable">
                                    {t("statuslabel.deployable")}
                                  </option>
                                  <option value="undeployable">
                                    {t("statuslabel.undeployable")}
                                  </option>
                                  <option value="deployed">
                                    {t("statuslabel.deployed")}
                                  </option>
                                </Form.Select>
                                {errors.type && (
                                  <p className="error">
                                    {t("select.statusreq")}
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

export default withTranslation()(AddStatusModal);
