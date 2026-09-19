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
import { common } from "../../../Common/common";

const Domain = process.env.REACT_APP_API_URL;

const AddTicket = () => {
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
  const [talentGroups, setTalentGroups] = useState([]);
  const location = useLocation();
  const { state } = location;
  const [rowData, setRowData] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      await fetchDropdownData();
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

  const fetchDropdownData = async () => {
    try {
      const [talentGroupsResponse] = await Promise.all([
        axios.get(`${Domain}/talentGroups/selectList?page=1`),
      ]);

      if (talentGroupsResponse?.data) {
        setTalentGroups(talentGroupsResponse?.data?.items);
      } else setApiError(t("alert.dropdown"));
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const setFormValues = (data) => {
    console.log("deeeee");
    const fields = ["talent_group", "name", "description"];

    fields.forEach((field) => {
      setValue(field, data[field]);
    });

    setValue("talent_group", data?.talent_group?.id);
  };

  const onSubmit = async (data) => {
    setApiError("");
    const body = {
      name: data?.name,
      talent_group_id: data?.talent_group,
      description: data?.description,
    };

    try {
      const response = await axios({
        method: isAddMode ? "post" : "put",
        url: isAddMode
          ? `${Domain}/ticketIssues`
          : `${Domain}/ticketIssues/${id}`,
        data: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response?.data?.success) {
        common.notify("S", response?.data?.message);
        navigate("/ticketissues");
      } else {
        setApiError(response?.data?.message);
      }
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const backClick = () => {
    navigate("/ticketissues");
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
                    ? t("ticketissue.createissue")
                    : t("ticketissue.updateissue")}
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
                          {t("ticketissue.talent_group_id")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Form.Select
                          as="select"
                          {...register("talent_group", { required: true })}
                          className="gen-form-control"
                        >
                          <option value="">{t("select.talent_group")}</option>
                          {talentGroups?.length > 0 &&
                            talentGroups.map((talentGroups) => (
                              <option
                                key={talentGroups.id}
                                value={talentGroups.id}
                              >
                                {talentGroups.text}
                              </option>
                            ))}
                        </Form.Select>
                        {errors?.talent_group && (
                          <p className="error">{t("select.talent_groupreq")}</p>
                        )}
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("ticketissue.name")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder={t("ticketissue.name")}
                          {...register("name", { required: true })}
                          className="gen-form-control"
                        />
                        {errors?.name && (
                          <p className="error">{t("ticketissue.name_req")}</p>
                        )}
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          {t("ticketissue.description")}{" "}
                          <span className="mandatory">*</span>
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          placeholder={t("ticketissue.description")}
                          {...register("description", { required: true })}
                          className="gen-form-control"
                        />
                        {errors?.description && (
                          <p className="error">
                            {t("ticketissue.description_req")}
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

export default AddTicket;
