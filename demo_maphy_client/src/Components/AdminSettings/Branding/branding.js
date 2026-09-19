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

const Branding = () => {
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
  const [rowData, setRowData] = useState(null);
  const [previewImage, setPreviewImage] = useState(null); // State for image preview

  useEffect(() => {
    getDetails();
  }, []);

  const getDetails = async () => {
    try {
      const response = await axios.get(`${Domain}/firms/getBrandingDetails`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response?.data) {
        setValue("site_name", response?.data?.rows[0]?.site_name);
        setValue("brandtype", response?.data?.rows[0]?.brandtype);
        setRowData(response?.data?.rows[0]);
      } else {
        setApiError(t("alert.error"));
      }
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };

  const onSubmit = async (data) => {
    setApiError("");
    const formData = new FormData();

    if (data.uploaded_file?.[0]) {
      formData.append("uploaded_file", data.uploaded_file[0]);
    }
    formData.append("site_name", data.site_name);
    formData.append("brandtype", data.brandtype);

    const url = `${Domain}/firms/uploadLogo`;
    try {
      const response = await axios.put(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const responseStatus = response.data.success;
      const notificationMessage = response.data.message;
      if (responseStatus) {
        common.notify("S", notificationMessage);
        navigate("/adminsetting");
      } else {
        setApiError(notificationMessage);
      }
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const backClick = () => {
    navigate("/adminsetting");
  };

  return (
    <Container fluid>
      <Row>
        <Col md={9}>
          <div>
            <div className="title d-flex justify-content-between">
              <div>
                <h1>{t("branding.branding")}</h1>
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
                      <div className="alert alert-danger">{apiError}</div>
                    )}
                    <Col md={6} sm={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>{t("branding.name")}</Form.Label>
                        <span className="mandatory">*</span>
                        <Form.Control
                          type="text"
                          placeholder={t("branding.Maphyasset")}
                          {...register("site_name", { required: true })}
                          className="gen-form-control"
                        />
                        {errors.site_name && (
                          <p className="error">{t("branding.sitereq")}</p>
                        )}
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>{t("branding.brandingtype")}</Form.Label>
                        <span className="mandatory">*</span>
                        <Form.Select
                          {...register("brandtype", { required: true })}
                          className="gen-form-control"
                        >
                          <option value="">{t("select.branding_type")}</option>
                          <option value="logo">Logo</option>
                        </Form.Select>
                        {errors.brandingtype && (
                          <p className="error">{t("branding.brandtypereq")}</p>
                        )}
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>{t("branding.logo")}</Form.Label>
                        <Form.Control
                          type="file"
                          {...register("uploaded_file")}
                          className="gen-form-control"
                          onChange={handleImageChange}
                        />
                      </Form.Group>

                      {previewImage && ( // Display the image preview if it exists
                        <div className="image-preview mt-3">
                          <img
                            src={previewImage}
                            alt="Selected Logo"
                            style={{ maxWidth: "20%", maxHeight: "50px" }}
                          />
                        </div>
                      )}
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

export default Branding;
