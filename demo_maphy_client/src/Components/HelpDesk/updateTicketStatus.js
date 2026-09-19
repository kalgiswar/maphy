import { useForm } from "react-hook-form";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useTranslation } from "react-i18next";
import { common } from "../../Common/common";
import AddSisterTicket from "../../Common/sisterticketmodel";

const Domain = process.env.REACT_APP_API_URL;

const UpdateTicketStatus = ({
  ticketId,
  onBack,
  userType,
  asset_tag,
  talentGroupId,
  ticketStatusOption
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();
  const { t } = useTranslation();
  const [apiError, setApiError] = useState("");
  const [ticketStatus, setTicketStatus] = useState([]);
  const [user, setUser] = useState([]);
  const [showModal, setShowModal] = useState(false);
  console.log("userrrr", user);

  const selectedStatus = watch("ticketStatus");
  useEffect(() => {
    const initialize = async () => {
      await fetchDropdownData();
      if (userType === 2 || userType === "2") await fetchUsers();
    };
    initialize();
  }, []);

  useEffect(() => {
    if (selectedStatus === "6") {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [selectedStatus]);

  const fetchDropdownData = async () => {
    try {
      const [ticketStatusResponse] = await Promise.all([
        axios.get(`${Domain}/tickets/ticketstatus?userType=${userType}`),
      ]);
      if (ticketStatusResponse?.data) {
        const filteredStatuses = ticketStatusResponse.data.items.filter(
          (status) => Number(status.id) !== Number(ticketStatusOption)
        );

        console.log("filter status",filteredStatuses);
        setTicketStatus(filteredStatuses);
      } else setApiError(t("alert.dropdown"));
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const fetchUsers = async () => {
    try {
      const [userResponse] = await Promise.all([
        axios.get(`${Domain}/tickets/${talentGroupId}/users`),
      ]);
      if (userResponse?.data) {
        console.log("res", userResponse?.data);
        setUser(userResponse?.data);
      } else setApiError(t("alert.dropdown"));
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const onSubmit = async (data) => {
    setApiError("");
    const body = {
      detail: data?.description,
      status_id: data?.ticketStatus,
    };
    if (selectedStatus === "7" || selectedStatus === 7) {
      body.assigned_to = data?.assignedto;
    }
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

  const handleModalClose = () => {
    setShowModal(false);
  };

  return (
    <Container fluid>
      <Row>
        <Col md={12}>
          <div>
            <div className="title d-flex justify-content-between">
              <div>
                <h1>{t("helpdesk.updateticketstatus")}</h1>
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
                          {t("helpdesk.ticketstatus")}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Form.Select
                          as="select"
                          {...register("ticketStatus", { required: true })}
                          className="gen-form-control"
                        >
                          <option value="">{t("select.ticketStatus")}</option>
                          {ticketStatus?.length > 0 &&
                            ticketStatus.map((ticketStatus) => (
                              <option
                                key={ticketStatus.id}
                                value={ticketStatus.id}
                              >
                                {ticketStatus.text}
                              </option>
                            ))}
                        </Form.Select>
                        {errors?.ticketStatus && (
                          <p className="error">{t("select.ticketstatusreq")}</p>
                        )}
                      </Form.Group>
                      {(selectedStatus === "7" || selectedStatus === 7) && (
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("helpdesk.assignedto")}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Form.Select
                            as="select"
                            {...register("assignedto", { required: true })}
                            className="gen-form-control"
                          >
                            <option value="">{t("select.user")}</option>
                            {user?.length > 0 &&
                              user.map((user) => (
                                <option key={user.id} value={user.id}>
                                  {`${user.firstName} ${user.lastName}`}
                                </option>
                              ))}
                          </Form.Select>
                        </Form.Group>
                      )}
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
      <AddSisterTicket
        show={showModal}
        handleClose={handleModalClose}
        onLocationSubmit={handleModalClose}
        asset_tag={asset_tag}
        ticketId={ticketId}
      />
    </Container>
  );
};

export default UpdateTicketStatus;
