import { useForm } from "react-hook-form";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useTranslation } from "react-i18next";
import { common } from "../../../Common/common";

const Domain = process.env.REACT_APP_API_URL;

const Addcompanies = () => {
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

  useEffect(() => {
    if (!isAddMode) {
      getDetails();
    }
  }, [id, isAddMode, setValue]);

  const getDetails = async () => {
    try {
      const response = await axios.get(`${Domain}/talentGroups/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response?.data) {
        const fields = ["name", "description"];
        fields.forEach((field) => {
          setValue(field, response.data[field]);
        });
      } else setApiError(t("alert.error"));
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const onSubmit = async (data) => {
    setApiError("");
    const body = {
      name: data.name,
      description: data.description,
    };

    try {
      const response = await axios({
        method: isAddMode ? "post" : "put",
        url: isAddMode
          ? `${Domain}/talentGroups`
          : `${Domain}/talentGroups/${id}`,
        data: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response?.data?.success) {
        common.notify("S", response?.data?.message);
        navigate("/talentgroup");
      } else setApiError(response.data.message);
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const backClick = () => {
    navigate("/talentGroup");
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
                    ? t("talentgroup.talentgroup")
                    : t("talentgroup.updatetalent")}
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
                    <Col md={6} sm={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("talentgroup.name")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder={t("talentgroup.name")}
                          {...register("name", { required: true })}
                          className="gen-form-control"
                        />
                        {errors.name && (
                          <p className="error">
                            {t("talentgroup.namerequired")}
                          </p>
                        )}
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("talentgroup.description")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder={t("talentgroup.description")}
                          {...register("description", { required: true })}
                          className="gen-form-control"
                        />
                        {errors.description && (
                          <p className="error">
                            {t("talentgroup.descriptionrequired")}
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

export default Addcompanies;
