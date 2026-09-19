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
import { common } from "../../Common/common";

const Domain = process.env.REACT_APP_API_URL;

const CheckOutAssets = () => {
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const { t } = useTranslation();
  let { id } = useParams();
  const [userData, setUserData] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState("user"); // Set initial state to "user"
  const [apiError, setApiError] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [dropdownError, setDropdownError] = useState(""); // State for dropdown validation error

  useEffect(() => {
    const initialize = async () => {
      await fetchDropdownData();
      await getDetails();
    };
    initialize();
  }, [id]);

  const fetchDropdownData = async () => {
    try {
      const [userResponse, locationResponse] = await Promise.all([
        axios.get(`${Domain}/users/selectList?page=1`),
        axios.get(`${Domain}/locations/selectList?page=1`),
      ]);

      if (userResponse?.data) {
        setUserData(userResponse.data.items);
      } else {
        setApiError(t("alert.error"));
      }

      if (locationResponse?.data) {
        setLocationData(locationResponse.data.items);
      } else {
        setApiError(t("alert.dropdown"));
      }
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const getDetails = async () => {
    try {
      const response = await axios.get(`${Domain}/hardware/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response?.data) {
        setValue("AssetName", response?.data?.name);
        setValue("model", response?.data?.model?.id);
        setValue("status", response?.data?.status_label?.name);
      } else {
        setApiError(t("alert.error"));
      }
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const onSubmit = async (data) => {
    if (selectedUser || selectedLocation) {
      const body = {
        checkout_at: data?.checkout_date,
        expected_checkin: data?.expected_checkin,
        model_id: data?.model,
        notes: data?.notes,
        name: data?.AssetName,
      };

      if (selectedUser) {
        body.assigned_user = selectedUser;
        body.checkout_to_type = "user";
      } else if (selectedLocation) {
        body.assigned_location = selectedLocation;
        body.checkout_to_type = "location";
      }

      try {
        const response = await axios({
          method: "post",
          url: `${Domain}/hardware/${id}/checkout`,
          data: JSON.stringify(body),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response?.data?.success) {
          common.notify("S", t("Checkout.success"));
          navigate("/rtd");
        } else {
          setApiError(response?.data?.success);
        }
      } catch (error) {
        setApiError(t("alert.error"));
      }
    } else {
      setDropdownError(t("BulkCheckout.checkout_to_type_req"));
    }
  };

  const validateNotFutureDate = (value) => {
    const selectedDate = new Date(value);
    const today = new Date();
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return selectedDate <= today;
  };

  const validateCheckinDate = (value) => {
    const checkoutDate = new Date(getValues("checkout_date"));
    const checkinDate = new Date(value);
    checkoutDate.setHours(0, 0, 0, 0);
    checkinDate.setHours(0, 0, 0, 0);
    return checkinDate > checkoutDate;
  };

  const backClick = () => {
    navigate("/rtd");
  };

  const handleDropdownChange = (selectedValue, dropdownType) => {
    setDropdownError(""); // Clear any previous dropdown error
    if (dropdownType === "user") {
      setSelectedUser(selectedValue);
      setSelectedLocation(""); // Clear location value
      setValue("user", selectedValue);
      setValue("location", ""); // Clear location value in form
    } else if (dropdownType === "location") {
      setSelectedLocation(selectedValue);
      setSelectedUser(""); // Clear user value
      setValue("location", selectedValue);
      setValue("user", ""); // Clear user value in form
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col md={12}>
          <div>
            <div className="title d-flex justify-content-between">
              <div>
                <h1>{t("Checkout.checkoutasset")}</h1>
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
                          {t("Checkout.model_id")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Col md={9} sm={12}>
                          <Form.Control
                            type="text"
                            placeholder={t("Checkout.model_id")}
                            {...register("model", { required: true })}
                            className="gen-form-control"
                            disabled
                          />
                        </Col>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("Checkout.AssetName")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Col md={9} sm={12}>
                          <Form.Control
                            type="text"
                            placeholder={t("Checkout.AssetName")}
                            {...register("AssetName", { required: true })}
                            className="gen-form-control"
                            disabled
                          />
                        </Col>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("Checkout.status_id")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Col md={9} sm={12}>
                          <Form.Control
                            type="text"
                            placeholder={t("Checkout.status_id")}
                            {...register("status", { required: true })}
                            className="gen-form-control"
                            disabled
                          />
                        </Col>
                      </Form.Group>
                      <Col md={9} sm={12}>
                        <Form.Group className="mb-3">
                          <div className="d-flex align-items-center mb-2">
                            <Form.Label
                              className="activate-button mb-0 me-3"
                              style={{ whiteSpace: "nowrap" }}
                            >
                              {t("BulkCheckout.assigned_user")}
                            </Form.Label>
                            <Button
                              className="activateuser me-2"
                              onClick={() => setActiveDropdown("user")}
                            >
                              {t("Checkout.btnUser")}
                            </Button>
                            <Button
                              className="activatelocation"
                              onClick={() => setActiveDropdown("location")}
                            >
                              {t("Checkout.btnLocation")}
                            </Button>
                          </div>
                          <br />
                          <Row>
                            <Col md={12} sm={12}>
                              <Form.Select
                                {...register(
                                  activeDropdown === "user"
                                    ? "user"
                                    : "location",
                                )}
                                className="gen-form-control"
                                onChange={(e) =>
                                  handleDropdownChange(
                                    e.target.value,
                                    activeDropdown,
                                  )
                                }
                                value={
                                  activeDropdown === "user"
                                    ? selectedUser
                                    : selectedLocation
                                }
                              >
                                <option value="">
                                  {activeDropdown === "user"
                                    ? t("select.users")
                                    : t("select.location")}
                                </option>
                                {activeDropdown === "user"
                                  ? userData.map((user) => (
                                      <option key={user.id} value={user.id}>
                                        {user.text}
                                      </option>
                                    ))
                                  : locationData.map((location) => (
                                      <option
                                        key={location.id}
                                        value={location.id}
                                      >
                                        {location.text}
                                      </option>
                                    ))}
                              </Form.Select>
                            </Col>
                          </Row>
                          <p className="error"> {dropdownError} </p>
                        </Form.Group>
                      </Col>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("Checkout.checkout_at")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Col md={9} sm={12}>
                          <Form.Control
                            type="date"
                            placeholder={t("Checkout.checkout_at")}
                            {...register("checkout_date", {
                              required: true,
                              validate: validateNotFutureDate,
                            })}
                            className="gen-form-control"
                          />
                        </Col>
                        {errors.checkout_date?.type === "required" && (
                          <p className="error">
                            {t("Checkout.checkout_date_req")}
                          </p>
                        )}
                        {errors.checkout_date?.type === "validate" && (
                          <p className="error">
                            {t("Checkout.checkout_invalid_date")}
                          </p>
                        )}
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("Checkout.expected_checkin")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Col md={9} sm={12}>
                          <Form.Control
                            type="date"
                            placeholder={t("Checkout.expected_checkin")}
                            {...register("expected_checkin", {
                              required: true,
                              validate: validateCheckinDate,
                            })}
                            className="gen-form-control"
                          />
                        </Col>
                        {errors.expected_checkin?.type === "required" && (
                          <p className="error">
                            {t("Checkout.checkin_date_req")}
                          </p>
                        )}
                        {errors.expected_checkin?.type === "validate" && (
                          <p className="error">
                            {t("Checkout.invalid_checkin_date")}
                          </p>
                        )}
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("component.notes")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Col md={9} sm={12}>
                          <Form.Control
                            as="textarea"
                            placeholder={t("component.notes")}
                            {...register("notes", { required: true })}
                            className="gen-form-control"
                          />
                        </Col>
                        {errors.notes && (
                          <p className="error">{t("component.notesreq")}</p>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <div className="d-flex mt-5">
                      <Button className="primary mr-1" type="submit">
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
    </Container>
  );
};

export default CheckOutAssets;
