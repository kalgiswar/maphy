import { useForm } from "react-hook-form";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useTranslation } from "react-i18next";
import { common } from "../../Common/common";

const Domain = process.env.REACT_APP_API_URL;

const AddTicket = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [apiError, setApiError] = useState("");
  const [ticketIssue, setTicketIssues] = useState([]);

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
        url: `${Domain}/tickets`,
        data: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response?.data?.success) {
        common.notify("S", response?.data?.message);
        navigate("/tickets");
      } else {
        setApiError(response?.data?.message);
      }
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const backClick = () => {
    navigate("/tickets");
  };

  return (
    <Container fluid>
      <Row>
        <Col md={12}>
          <div>
            <div className="title d-flex justify-content-between">
              <div>
                <h1>{t("helpdesk.createticket")}</h1>
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
                          {t("helpdesk.asset_tag")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder={t("helpdesk.asset_tag")}
                          {...register("asset_tag", { required: true })}
                          className="gen-form-control"
                        />
                        {errors?.asset_tag && (
                          <p className="error">{t("helpdesk.assettagreq")}</p>
                        )}
                      </Form.Group>{" "}
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("helpdesk.ticket_issue")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Form.Select
                          as="select"
                          {...register("ticket_issue", { required: true })}
                          className="gen-form-control"
                        >
                          <option value="">{t("select.ticket_issue")}</option>
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
                          <p className="error">{t("select.ticket_issuereq")}</p>
                        )}
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("helpdesk.description")}{" "}
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
                          {t("helpdesk.details")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          placeholder={t("helpdesk.details")}
                          {...register("details", { required: true })}
                          className="gen-form-control"
                        />
                        {errors?.details && (
                          <p className="error">{t("helpdesk.details_req")}</p>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                  <div className="d-flex mt-5">
                    <Button className="primary mr-1" type="submit">
                      {t("button.submit")}
                    </Button>
                    <Button variant="outline-primary" onClick={backClick}>
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
  );
};

export default AddTicket;
