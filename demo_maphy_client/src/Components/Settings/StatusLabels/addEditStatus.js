import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import axios from "axios";
import { common } from "../../../Common/common";

const Domain = process.env.REACT_APP_API_URL;

const AddEditStatus = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const { t } = useTranslation();
  let { id } = useParams();
  const isAddMode = !id;
  const [apiError, setApiError] = useState("");
  const [typeValue, setTypeValue] = useState(""); // State to manage the type field

  const getDetails = async () => {
    try {
      const response = await axios.get(`${Domain}/statuslabels/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response?.data) {
        const fields = [
          "name",
          "type",
          "show_in_nav",
          "default_label",
          "notes",
        ];
        fields.forEach((field) => {
          setValue(field, response?.data[field]);
        });
        if (response?.data?.type) {
          setTypeValue(response?.data?.type);
        }
        console.log(response?.data?.type);
      } else {
        setApiError(t("alert.error"));
      }
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  useEffect(() => {
    if (!isAddMode) {
      getDetails();
    }
  }, []);

  const onSubmit = async (data) => {
    const trimmedName = data?.name?.trim(); // Trim spaces from input

    const body = {
      name: trimmedName,
      type: data?.type,
      notes: data?.notes,
      show_in_nav: data?.show_in_nav,
      default_label: data?.default_label,
    };
    try {
      const response = await axios({
        method: isAddMode ? "post" : "put",
        url: isAddMode
          ? `${Domain}/statuslabels`
          : `${Domain}/statuslabels/${id}`,
        data: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response?.data?.success) {
        const successMessage = response?.data?.message;
        common.notify("S", successMessage);
        if (sessionStorage.getItem("onboarding_active") === "true") {
          navigate("/Dashboard");
        } else {
          navigate("/statusLabels");
        }
      } else {
        setApiError(response?.data?.message);
      }
    } catch (error) {
      setApiError(t("alert.error"));
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setApiError(error.response.data.message);
      } else {
        setApiError(t("alert.error"));
      }
    }
  };

  const backClick = async () => {
    navigate("/statusLabels");
  };

  return (
    <div className="form-wrapper">
      <Container fluid>
        <Row>
          <Col sm={12}>
            <div>
              <div className="title d-flex justify-content-between">
                <div>
                  <h1>
                    {isAddMode
                      ? t("statuslabel.create")
                      : t("statuslabel.update")}
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
                    <Row>
                      {apiError && (
                        <div className="alert alert-danger"> {apiError} </div>
                      )}

                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("statuslabel.name")}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder={t("statuslabel.name")}
                            {...register("name", { required: true })}
                            className="first-textbox-dropdown"
                            onBlur={(e) =>
                              setValue("name", e.target.value.trim())
                            }
                          />

                          {errors?.name?.type === "required" && (
                            <p role="alert" className="error">
                              {t("statuslabel.namereq")}
                            </p>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={6} sm={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("statuslabel.type")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Form.Select
                            placeholder={t("statuslabel.type")}
                            {...register("type", { required: true })}
                            className="textbox-dropdown"
                            value={typeValue}
                            onChange={(e) => {
                              setTypeValue(e.target.value);
                              setValue("type", e.target.value);
                            }}
                          >
                            <option value="">{t("statuslabel.type")}</option>
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
                          {errors.type?.type === "required" && (
                            <p role="alert" className="error">
                              {t("statuslabel.typereq")}
                            </p>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>
                    <div className="uploads pt-4">
                      <Row>
                        <Col md={6} sm={12}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              {t("statuslabel.notes")}{" "}
                              <span className="mandatory">*</span>
                            </Form.Label>
                            <Form.Control
                              as="textarea"
                              placeholder={t("statuslabel.notes")}
                              {...register("notes", { required: true })}
                            />
                            {errors.notes?.type === "required" && (
                              <p role="alert" className="error">
                                {t("statuslabel.notesreq")}
                              </p>
                            )}
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6} sm={12}>
                          <Form.Group>
                            <Form.Check
                              type="checkbox"
                              label={t("statuslabel.shownav")}
                              {...register("show_in_nav")}
                            />
                            <Form.Check
                              type="checkbox"
                              label={t("statuslabel.defaultlabel")}
                              {...register("default_label")}
                            />
                            <p className="status-description">
                              {t("statuslabel.paragraph")}
                            </p>
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col md={6} sm={12}>
                          <Row>
                            <div className="d-flex mt-5">
                              <Button className="primary mr-1" type="submit">
                                {t("category.submit")}
                              </Button>
                              <Button
                                variant="outline-primary"
                                onClick={backClick}
                              >
                                {t("category.btnCancel")}
                              </Button>
                            </div>
                          </Row>
                        </Col>
                      </Row>
                    </div>
                  </Form>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AddEditStatus;
