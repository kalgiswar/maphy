import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useTranslation } from "react-i18next";
import AddLocation from "../../../Common/locationModal";
import { common } from "../../../Common/common";

const Domain = process.env.REACT_APP_API_URL;

const AddDepartments = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();
  const navigate = useNavigate();
  const { t } = useTranslation();
  let { id } = useParams();
  const isAddMode = !id;
  const [apiError, setApiError] = useState("");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [managers, setManagers] = useState([]);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const initialize = async () => {
      await fetchDropdownData();
      if (!isAddMode) {
        await getDetails();
      }
    };

    initialize();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const [companyResponse, locationResponse, managerResponse] =
        await Promise.all([
          axios.get(`${Domain}/companies/selectList?page=1`),
          axios.get(`${Domain}/locations/selectList?page=1`),
          axios.get(`${Domain}/users/selectList?page=1`),
        ]);

      if (
        companyResponse?.data &&
        locationResponse?.data &&
        managerResponse?.data
      ) {
        setCompanies(companyResponse?.data?.items);
        setLocations(locationResponse?.data?.items);
        setManagers(managerResponse?.data?.items);
      } else {
        setApiError(t("alert.dropdown"));
      }
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const getDetails = async () => {
    try {
      const response = await axios.get(`${Domain}/departments/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response?.data) {
        const fields = ["name", "company_id", "manager", "location_id"];
        fields.forEach((field) => {
          setValue(field, response?.data[field]);
        });
        if (response?.data?.company?.id) {
          setValue("company_id", response?.data?.company?.id);
        }
        if (response?.data?.manager?.id) {
          setValue("manager", response?.data?.manager?.id);
        }

        if (response?.data?.location?.id) {
          setValue("location_id", response?.data?.location?.id);
        }
      } else {
        setApiError(t("alert.error"));
      }
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const onSubmit = async (data) => {
    setApiError("");
    const body = {
      name: data?.name,
      company_id: data?.company_id,
      manager_id: data?.manager,
      location_id: data?.location_id,
    };

    try {
      const response = await axios({
        method: isAddMode ? "post" : "put",
        url: isAddMode
          ? `${Domain}/departments`
          : `${Domain}/departments/${id}`,
        data: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      });
      if (response?.data?.success) {
        const successMessage = response?.data?.message;
        common.notify("S", successMessage);
        if (sessionStorage.getItem("onboarding_active") === "true") {
          navigate("/Dashboard");
        } else {
          navigate("/Department");
        }
      } else {
        setApiError(response?.data?.message);
      }
    } catch (error) {
      setApiError(
        error.response?.data?.message ||
          "An unexpected error occurred. Please try again later."
      );
    }
  };

  const openLocationModal = () => setShowLocationModal(true);
  const closeLocationModal = () => setShowLocationModal(false);

  const handleLocationSubmit = async () => {
    try {
      const locationResponse = await axios.get(
        `${Domain}/locations/selectList?page=1`
      );
      if (locationResponse?.data) {
        setLocations(locationResponse?.data?.items);
      }
      setShowLocationModal(false);
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const backClick = async () => {
    navigate("/Department");
  };

  return (
    <Container fluid>
      <Row>
        <Col md={12}>
          <div>
            <div className="title d-flex justify-content-between">
              <div>
                <h1>
                  {isAddMode
                    ? t("departments.createdept")
                    : t("departments.updatedept")}
                </h1>
              </div>
              <Button onClick={backClick} className="back">
                {t("button.back")}
              </Button>
            </div>

            <div className="addProperty wrapper">
              <div className="basicDetails pt-4">
                <Form className="mb-3" noValidate>
                  <Row>
                    {apiError && (
                      <div className="alert alert-danger"> {apiError} </div>
                    )}
                    <Col md={6} sm={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("departments.name")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder={t("departments.name")}
                          name="name"
                          ref={register}
                          className="first-textbox-dropdown"
                          {...register("name", { required: true })}
                        />
                        {errors.name && (
                          <p role="alert" className="error">
                            {t("departments.namereq")}
                          </p>
                        )}
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("departments.company_id")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Form.Select
                          id="company_id"
                          name="company_id"
                          {...register("company_id", { required: true })}
                          className="textbox-dropdown"
                        >
                          <option value="">{t("departments.companys")}</option>
                          {companies.map((company) => (
                            <option key={company.id} value={company.id}>
                              {company.text}
                            </option>
                          ))}
                        </Form.Select>
                        {errors.company_id && (
                          <p role="alert" className="error">
                            {t("select.companyreq")}
                          </p>
                        )}
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("departments.manager_id")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Form.Select
                          as="select"
                          {...register("manager", { required: true })}
                          className="gen-form-control"
                        >
                          <option value="">{t("select.manager")}</option>
                          {managers.map((manager) => (
                            <option key={manager.id} value={manager.id}>
                              {manager.text}
                            </option>
                          ))}
                        </Form.Select>
                        {errors.manager && (
                          <p role="alert" className="error">
                            {t("select.managerreq")}
                          </p>
                        )}
                      </Form.Group>
                    </Col>
                    <div>
                      <Col md={12} sm={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("departments.location_id")}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <div className="d-flex align-items-center">
                            <Form.Select
                              id="location_id"
                              name="location_id"
                              {...register("location_id", { required: true })}
                              className="textbox-dropdown"
                            >
                              <option value="">
                                {t("departments.locations")}
                              </option>
                              {locations.map((location) => (
                                <option key={location.id} value={location.id}>
                                  {location.text}
                                </option>
                              ))}
                            </Form.Select>
                            <Col sm={6}>
                              <Button
                                className="ms-4"
                                variant="outline-primary"
                                onClick={openLocationModal}
                              >
                                {t("button.new")}
                              </Button>
                            </Col>
                          </div>

                          {errors.location_id && (
                            <p role="alert" className="error">
                              {t("select.locationreq")}
                            </p>
                          )}
                        </Form.Group>
                      </Col>
                    </div>
                    <div className="d-flex mt-5">
                      <Button
                        className="primary mr-1"
                        type="submit"
                        onClick={handleSubmit(onSubmit)}
                      >
                        {t("button.submit")}
                      </Button>
                      <Button variant="outline-primary" onClick={backClick}>
                        {t("button.btnCancel")}
                      </Button>
                    </div>
                  </Row>
                </Form>
              </div>
            </div>
          </div>
        </Col>
      </Row>
      <AddLocation
        show={showLocationModal}
        handleClose={closeLocationModal}
        onLocationSubmit={handleLocationSubmit}
      />
    </Container>
  );
};

export default AddDepartments;
