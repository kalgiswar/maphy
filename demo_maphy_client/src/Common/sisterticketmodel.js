import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import axios from "axios";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { common } from "../Common/common";

const Domain = process.env.REACT_APP_API_URL;

const AddSisterTicket = ({ show, handleClose,asset_tag ,ticketId}) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();
  let { id } = useParams();
  const { t } = useTranslation();
  const [apiError, setApiError] = useState("");
  const [ticketIssue, setTicketIssues] = useState([]);
  setValue("asset_tag",asset_tag);

  useEffect(() => {
    const initialize = async () => {
      await fetchDropdownData();
    };
    initialize();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const [ticketIssueResponse] = await Promise.all([
        axios.get(`${Domain}/ticketIssues/selectList?page=1`),
      ]);

      if (ticketIssueResponse?.data) {
        setTicketIssues(ticketIssueResponse?.data?.items);
      } else setApiError(t("alert.dropdown"));
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const onSubmit = async (data) => {
    setApiError("");
    const body = {
      asset_tag: data?.asset_tag,
      details: data?.details,
      issue_id: data?.ticket_issue,
      description: data?.description,
    };

    try {
      const response = await axios({
        method: "post",
        url: `${Domain}/tickets/${ticketId}/sister`,
        data: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response?.data?.success) {
        common.notify("S", response?.data?.message);
        handleClose();
      } else {
        setApiError(response?.data?.message);
      }
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop="static"
      keyboard={false}
      animation={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>{t("helpdesk.createticket")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="new-form">
          <Container fluid>
            <Row>
              <Col md={9}>
                <div className="addProperty wrapper">
                  <div className="basicDetails pt-4">
                    <Form className="mb-3" onSubmit={handleSubmit(onSubmit)}>
                      <Row>
                        {apiError && (
                          <div className="alert alert-danger">{apiError}</div>
                        )}
                        <Col sm={12}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              {t("helpdesk.asset_tag")}
                              <span className="mandatory">*</span>
                            </Form.Label>
                            <Form.Control
                              type="text"
                              placeholder={t("helpdesk.asset_tag")}
                              {...register("asset_tag", { required: true })}
                              className="gen-form-control"
                              disabled
                            />
                            
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Label>
                              {t("helpdesk.description")}
                              <span className="mandatory">*</span>
                            </Form.Label>
                            <Form.Control
                              as="textarea"
                              placeholder={t("helpdesk.description")}
                              {...register("description", { required: true })}
                              className="gen-form-control"
                            />
                            {errors?.description && (
                              <p className="error">
                                {t("helpdesk.description_req")}
                              </p>
                            )}
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              {t("helpdesk.details")}
                              <span className="mandatory">*</span>
                            </Form.Label>
                            <Form.Control
                              as="textarea"
                              placeholder={t("helpdesk.details")}
                              {...register("details", { required: true })}
                              className="gen-form-control"
                            />
                            {errors?.details && (
                              <p className="error">
                                {t("helpdesk.details_req")}
                              </p>
                            )}
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              {t("helpdesk.ticket_issue")}
                              <span className="mandatory">*</span>
                            </Form.Label>
                            <Form.Select
                              as="select"
                              {...register("ticket_issue", { required: true })}
                              className="gen-form-control"
                            >
                              <option value="">
                                {t("select.ticket_issue")}
                              </option>
                              {ticketIssue?.length > 0 &&
                                ticketIssue.map((ticketIssue) => (
                                  <option
                                    key={ticketIssue.id}
                                    value={ticketIssue.id}
                                  >
                                    {ticketIssue.text}
                                  </option>
                                ))}
                            </Form.Select>
                            {errors?.ticket_issue && (
                              <p className="error">
                                {t("select.ticket_issuereq")}
                              </p>
                            )}
                          </Form.Group>
                        </Col>
                      </Row>
                      <div className="d-flex mt-5">
                        <Button className="primary mr-1" type="submit">
                          {t("button.submit")}
                        </Button>
                        <Button variant="outline-primary" onClick={handleClose}>
                          {t("button.cancel")}
                        </Button>
                      </div>
                    </Form>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default AddSisterTicket;
