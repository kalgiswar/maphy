import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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

const CheckOutAssets = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const { t } = useTranslation();
  let { id } = useParams();
  const locationpath = useLocation();
  const [userData, setUserData] = useState([]);
  const [assetData, setAssetData] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState("user"); // Set initial state to "user"
  const [apiError, setApiError] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedAsset, setSelectedAsset] = useState("");
  const [dropdownError, setDropdownError] = useState(""); // State for dropdown validation error
  const { rowData } = locationpath?.state ? locationpath.state : [];

  useEffect(() => {
    const initialize = async () => {
      await fetchDropdownData();
      if (rowData) {
        const fields = ["name", "serial"];
        fields.forEach((field) => {
          setValue(field, rowData[field]);
        });
      } else navigate("/license");
    };
    initialize();
  }, [id]);

  const fetchDropdownData = async () => {
    try {
      const [userResponse, assetResponse] = await Promise.all([
        axios.get(`${Domain}/users/selectList?page=1`),
        axios.get(`${Domain}/hardware/selectList?page=1`),
      ]);
      if (userResponse?.data) setUserData(userResponse.data.items);
      if (assetResponse?.data) setAssetData(assetResponse.data.items);
    } catch (error) {
      setApiError(t(alert.error));
    }
  };

  const onSubmit = async (data) => {
    try {
      const response = await axios({
        method: "post",
        url: Domain + "/licenses/" + rowData?.id + "/checkout",
        data: JSON.stringify({
          asset_id: selectedAsset,
          notes: data?.notes,
          assigned_to: selectedUser,
          checkout_to_type: activeDropdown === "user" ? "user" : "asset",
        }),
        headers: { "Content-Type": "application/json" },
      });
      if (response?.data?.success) {
        common.notify("S", t("Checkout.success"));
        navigate(`/licenseDetails/${rowData?.id}`, {
          state: { rowData: rowData, activeTab: "seats" },
        });
      } else {
        setApiError(response?.data?.message);
      }
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const backClick = () => {
    navigate(`/licenseDetails/${rowData?.id}`, {
      state: { rowData: rowData, activeTab: "seats" },
    });
  };

  // const handleDropdownChange = (selectedValue,dropdownType) => {
  //   setDropdownError(""); // Clear any previous dropdown error
  //   if (dropdownType === "user") {
  //     setSelectedUser(selectedValue);
  //     setSelectedAsset(""); // Clear location value
  //     setValue("user", selectedValue);
  //     setValue("asset", ""); // Clear location value in form
  //   } else if (dropdownType === "asset") {
  //     setSelectedAsset(selectedValue);
  //     setSelectedUser(""); // Clear user value
  //     setValue("asset", selectedValue);
  //     setValue("user", ""); // Clear user value in form
  //   }
  // };

  const handleDropdownChange = (selectedValue) => {
    if (activeDropdown === "user") {
      setSelectedUser(selectedValue);
      setValue("user", selectedValue);
    } else if (activeDropdown === "asset") {
      setSelectedAsset(selectedValue);
      setValue("asset", selectedValue);
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col md={12}>
          <div>
            <div className="title d-flex justify-content-between">
              <div>
                <h1>{t("Checkout.checkoutlicenseseat")}</h1>
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
                          {t("Checkout.AssetName")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Col md={8} sm={12}>
                          <Form.Control
                            type="text"
                            placeholder={t("Checkout.AssetName")}
                            {...register("name", { required: true })}
                            className="gen-form-control"
                            disabled
                          />
                        </Col>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("Checkout.serial")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Col md={8} sm={12}>
                          <Form.Control
                            type="text"
                            placeholder={t("Checkout.serial")}
                            {...register("serial", { required: true })}
                            className="gen-form-control"
                            disabled
                          />
                        </Col>
                      </Form.Group>
                      <Col md={8} sm={12}>
                        <Form.Group className="mb-3">
                          <div className="d-flex align-items-center mb-2">
                            <Form.Label
                              className="activate-button mb-0 me-3"
                              style={{ whiteSpace: "nowrap" }}
                            >
                              {t("Checkout.checkoutto")}{" "}
                            </Form.Label>
                            {/* </Col> */}
                            <Button
                              className="activateuser me-2"
                              onClick={() => setActiveDropdown("user")}
                            >
                              {t("Checkout.btnUser")}
                            </Button>
                            <Button
                              className="activatelocation"
                              onClick={() => setActiveDropdown("asset")}
                            >
                              {t("Checkout.btnAsset")}
                            </Button>
                          </div>
                          <br />
                          <Row>
                            <Col md={12} sm={12}>
                              <Form.Select
                                // as="select"
                                {...register(
                                  activeDropdown === "user" ? "user" : "asset",
                                  { required: true },
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
                                    : selectedAsset
                                }
                              >
                                <option value="">
                                  {activeDropdown === "user"
                                    ? t("Checkout.select_user")
                                    : t("Checkout.select_asset")}
                                </option>
                                {activeDropdown === "user"
                                  ? userData.map((user) => (
                                      <option key={user.id} value={user.id}>
                                        {user.text}
                                      </option>
                                    ))
                                  : assetData.map((asset) => (
                                      <option key={asset.id} value={asset.id}>
                                        {asset.text}
                                      </option>
                                    ))}
                              </Form.Select>
                            </Col>
                          </Row>
                          {errors[
                            activeDropdown === "user"
                              ? "user"
                              : "asset".type === "required"
                          ] && (
                            <p className="error">
                              {t("Checkout.checkout_to_type_req")}
                            </p>
                          )}
                        </Form.Group>
                      </Col>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("component.notes")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Col md={8} sm={12}>
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
