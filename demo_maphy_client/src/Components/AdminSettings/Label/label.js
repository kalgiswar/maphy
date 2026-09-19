import { useForm } from "react-hook-form";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import { useTranslation } from "react-i18next";
import { common } from "../../../Common/common";

const Domain = process.env.REACT_APP_API_URL;

const AddLabels = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [apiError, setApiError] = useState("");
  const [id, setId] = useState("");

  useEffect(() => {
    getDetails();
  }, []);

  const getDetails = async () => {
    try {
      const response = await axios.get(`${Domain}/labels`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response?.data) {
        setValue("labels_fontsize", response?.data?.rows[0]?.labels_fontsize);
        setValue("labels_width", response?.data?.rows[0]?.labels_width);
        setValue("labels_height", response?.data?.rows[0]?.labels_height);
        setId(response?.data?.rows[0]?.id);
      } else {
        setApiError(t("alert.error"));
      }
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  // const onSubmit = async (data) => {
  //   setApiError("");
  //   const firmId = localStorage.getItem("firm_id");

  //   if (!firmId) {
  //     return;
  //   }

  //   const body = {
  //     firm_id: firmId,
  //     labels_fontsize: data?.labels_fontsize,
  //     labels_height: data?.labels_height,
  //     labels_width: data?.labels_width,
  //   };

  //   try {
  //     const response = await axios({
  //       method: "put",
  //       url: `${Domain}/labels/${id}`,
  //       data: JSON.stringify(body),
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     });

  //     if (response?.data?.success) {
  //       const successMessage = response?.data?.message;
  //       common.notify("S", successMessage);
  //       navigate("/adminsetting");
  //     } else {
  //       setApiError(response.data.message);
  //     }
  //   } catch (error) {
  //     setApiError(t("alert.error"));
  //   }
  // };

  const onSubmit = async (data) => {
    setApiError("");
    const firmId = localStorage.getItem("firm_id");
  
    if (!firmId) {
      return;
    }
  
    const body = {
      firm_id: firmId,
      labels_fontsize: data?.labels_fontsize,
      labels_height: data?.labels_height,
      labels_width: data?.labels_width,
    };
  
    // Check if `id` is present or null
    if (!id) {
      console.log("No ID found, calling POST method...");
      await handlePostRequest(body); // Call POST if no ID
    } else {
      console.log("ID found, calling PUT method...");
      await handlePutRequest(body); // Call PUT if ID exists
    }
  };
  
  // Function to handle PUT request (Update existing label)
  const handlePutRequest = async (body) => {
    try {
      const firmId = localStorage.getItem("firm_id");
      const response = await axios.put(`${Domain}/labels/${firmId}`, body, {
        headers: { "Content-Type": "application/json" },
      });
  
      if (response?.data?.success) {
        common.notify("S", response?.data?.message);
        navigate("/adminsetting");
      } else {
        console.warn("PUT failed, switching to POST...");
        await handlePostRequest(body);
      }
    } catch (error) {
      console.error("PUT request error, switching to POST:", error);
      await handlePostRequest(body);
    }
  };
  
  // Function to handle POST request (Create new label)
  const handlePostRequest = async (body) => {
    try {
      const postResponse = await axios.post(`${Domain}/labels`, body, {
        headers: { "Content-Type": "application/json" },
      });
  
      if (postResponse?.data?.success) {
        common.notify("S", postResponse?.data?.message);
        navigate("/adminsetting");
      } else {
        setApiError(postResponse?.data?.message || t("alert.error"));
      }
    } catch (error) {
      console.error("POST request error:", error);
      setApiError(t("alert.error"));
    }
  };
  
  const backClick = () => {
    navigate("/adminsetting");
  };

  return (
    <Container fluid>
      <Row>
        <Col md={8}>
          <div>
            <div className="title d-flex justify-content-between">
              <div>
                <h1>{t("labels.updatelabel")}</h1>
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
                    <Col md={8} sm={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("labels.labels_fontsize")}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Form.Control
                          type="number"
                          {...register("labels_fontsize", {
                            required: true,
                            pattern: /^\s*(?=.*[1-9])\d*(?:\.\d{1,2})?\s*$/,
                          })}
                          className="gen-form-control"
                        />
                        {errors?.labels_fontsize?.type === "required" && (
                          <p className="error">
                            {t("labels.labels_fontsizerequired")}
                          </p>
                        )}
                        {errors?.labels_fontsize?.type === "pattern" && (
                          <p className="error">{t("labels.invalid_data")}</p>
                        )}
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("labels.labels_width")}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <InputGroup>
                          <Form.Control
                            type="number"
                            {...register("labels_width", {
                              required: true,
                              pattern: /^\s*(?=.*[1-9])\d*(?:\.\d{1,2})?\s*$/,
                            })}
                            className="gen-form-control"
                          />
                          <InputGroup.Text>W</InputGroup.Text>
                        </InputGroup>
                        {errors?.labels_width?.type === "required" && (
                          <p className="error">{t("labels.widthrequired")}</p>
                        )}
                        {errors?.labels_width?.type === "pattern" && (
                          <p className="error">{t("labels.invalid_data")}</p>
                        )}
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <InputGroup>
                          <Form.Control
                            type="number"
                            {...register("labels_height", {
                              required: true,
                              pattern: /^\s*(?=.*[1-9])\d*(?:\.\d{1,2})?\s*$/,
                            })}
                            className="gen-form-control"
                          />
                          <InputGroup.Text>H</InputGroup.Text>
                        </InputGroup>
                        {errors?.labels_height?.type === "required" && (
                          <p className="error">{t("labels.heightrequired")}</p>
                        )}
                        {errors?.labels_height?.type === "pattern" && (
                          <p className="error">{t("labels.invalid_data")}</p>
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

export default AddLabels;
