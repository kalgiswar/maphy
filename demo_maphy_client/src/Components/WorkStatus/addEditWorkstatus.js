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

const AddWorkstatus = () => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const { t } = useTranslation();
  let { id } = useParams();
  const isAddMode = !id;
  const [apiError, setApiError] = useState("");
  // const [currentTime, setCurrentTime] = useState("");
  const fromTime = watch("fromTime");
  const location = useLocation();
  const { state } = location;
  const [rowData, setRowData] = useState(null);
  const currentTime = new Date().toLocaleTimeString(); 

  useEffect(() => {
    const initialize = async () => {
      if (!isAddMode) {
        setRowData(state?.rowData || null);
      }
    };
    initialize();
  }, [isAddMode, state]);

  useEffect(() => {
    if (rowData) {
      setFormValues(rowData);
    }
  }, [rowData]);

  // const fetchCurrentTime = async () => {
  //   try {
  //     const response = await axios.get(`${Domain}/workstatus/currentTime`);
  //     if (response?.data?.success) {
  //       setCurrentTime(response.data.currentTime);
  //     } else {
  //       setApiError("Error fetching current time from API");
  //     }
  //   } catch (error) {
  //     setApiError("Error fetching current time from API");
  //   }
  // };

  const setFormValues = (data) => {
    const fields = ["task", "taskDescription", "status", "fromTime", "toTime"];

    fields.forEach((field) => {
      setValue(field, data.details[0][field]);
    });

    setValue("task", data.details[0].task);
    setValue("taskDescription", data.details[0].taskDescription);
    setValue("status", data.details[0].status);
    setValue("fromTime", data.details[0].fromTime);
    setValue("toTime", data.details[0].toTime);
  };

  const onSubmit = async (data) => {
    setApiError("");
    const body = {
      details: [
        {
          fromTime: data?.fromTime,
          toTime: data?.toTime,
          task: data?.task,
          taskDescription: data?.taskDescription,
          status: data?.status,
        },
      ],
    };

    try {
      const response = await axios({
        method: isAddMode ? "post" : "put",
        url: isAddMode ? `${Domain}/workstatus` : `${Domain}/workstatus/${id}`,
        data: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response?.data?.success) {
        const successMessage = response?.data?.message;
        common.notify("S", successMessage);
        navigate("/WorkStatus");
      } else {
        setApiError(response?.data?.message);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setApiError(t(alert.error));
    }
  };

  const backClick = () => {
    navigate("/WorkStatus");
  };

  const validateToTime = (value) => {
    if (fromTime && value) {
      if (value <= fromTime) {
        return t("workstatus.invalidtotime");
      }
      if (value > currentTime) {
        return t("workstatus.invalidtime");
      }
    }
    return true;
  };

  return (
    <Container fluid>
      <Row>
        <Col md={9}>
          <div>
            <div className="title d-flex justify-content-between">
              <div>
                <h1>
                  {isAddMode
                    ? t("workstatus.workstatus")
                    : t("workstatus.workstatus")}
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
                  {apiError && (
                    <div className="alert alert-danger"> {apiError} </div>
                  )}

                  <Row>
                    <Col md={6} sm={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("workstatus.fromtime")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Form.Control
                          type="time"
                          {...register("fromTime", { required: true })}
                          className="gen-form-control"
                        />
                        {errors.fromTime && (
                          <p className="error">
                            {t("workstatus.fromtimerequired")}
                          </p>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6} sm={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("workstatus.totime")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Form.Control
                          type="time"
                          {...register("toTime", {
                            required: true,
                            validate: validateToTime,
                          })}
                          className="gen-form-control"
                        />
                        {errors?.fromTime?.type === "required" && (
                          <p className="error">
                            {t("workstatus.totimerequired")}
                          </p>
                        )}
                        {errors.toTime && (
                          <p className="error">{errors.toTime.message}</p>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={12} sm={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("workstatus.task")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          placeholder={t("workstatus.task")}
                          {...register("task", { required: true })}
                          className="gen-form-control"
                        />
                        {errors.task && (
                          <p className="error">
                            {t("workstatus.taskrequired")}
                          </p>
                        )}
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("workstatus.taskdescription")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          placeholder={t("workstatus.taskdescription")}
                          {...register("taskDescription", { required: true })}
                          className="gen-form-control"
                        />
                        {errors.taskDescription && (
                          <p className="error">
                            {t("workstatus.taskdescriptionrequired")}
                          </p>
                        )}
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("workstatus.status")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Form.Select
                          {...register("status", { required: true })}
                          className="gen-form-control"
                        >
                          <option value="">{t("workstatus.status")}</option>
                          <option value="pending">
                            {t("workstatus.pending")}
                          </option>
                          <option value="In Progress">
                            {t("workstatus.inprogress")}
                          </option>
                          <option value="Completed">
                            {t("workstatus.completed")}
                          </option>
                        </Form.Select>
                        {errors.status && (
                          <p className="error">
                            {t("workstatus.statusrequired")}
                          </p>
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

export default AddWorkstatus;
