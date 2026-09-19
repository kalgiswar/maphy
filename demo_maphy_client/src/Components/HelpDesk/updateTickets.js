import { useForm } from "react-hook-form";
import React, { useState } from "react";
import axios from "axios";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useTranslation } from "react-i18next";
import { common } from "../../Common/common";

const Domain = process.env.REACT_APP_API_URL;

const UpdateTicket = ({ ticketId, onBack }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const { t } = useTranslation();
  const [apiError, setApiError] = useState("");

  const onSubmit = async (data) => {
    setApiError("");
    const body = {
      detail: data?.description,
      status_id: "3",
    };

    try {
      const response = await axios({
        method: "put",
        url: `${Domain}/tickets/${ticketId}`,
        data: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response?.data?.success) {
        common.notify("S", response?.data?.message);
        reset();
      } else {
        setApiError(response.data.message);
      }
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col md={12}>
          <div>
            <div className="title d-flex justify-content-between">
              <div>
                <h1>{t("helpdesk.updateticket")}</h1>
              </div>
              <Button onClick={onBack} className="back">
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
                    <Col md={8} sm={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("helpdesk.description")}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          placeholder={t("helpdesk.description")}
                          {...register("description", { required: true })}
                          className="textarea"
                        />
                        {errors?.description && (
                          <p className="error">
                            {t("helpdesk.descriptionreq")}
                          </p>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                  <div className="d-flex mt-5">
                    <Button className="primary mr-1" type="submit">
                      {t("button.change")}
                    </Button>
                  </div>
                </Form>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default UpdateTicket;
