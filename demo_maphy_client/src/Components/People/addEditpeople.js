import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Select from "react-select";
import { useTranslation } from "react-i18next";
import { common } from "../../Common/common";
import Modal from "react-bootstrap/Modal";
import AddEditLocations from "../Settings/Location/addEditLocation";

const Domain = process.env.REACT_APP_API_URL;

const AddEditPeoples = (props) => {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
    watch,
    control,
    trigger,
    clearErrors,
  } = useForm({
    defaultValues: {
      activated: true
    }
  });
  const navigate = useNavigate();
  const { t } = useTranslation();
  const params = useParams();
  const isModal = props && props.isModal;
  const id = isModal ? props.id : params.id;
  const isAddMode = !id;

  const location = useLocation();
  const { state } = location;
  const [rowData, setRowData] = useState(null);

  // Resolve orgId robustly across parameters, props, editing rowData, or switcher context
  const orgId = props.orgId || params.orgId || rowData?.firm_id || props.rowData?.firm_id || state?.rowData?.firm_id || localStorage.getItem("selectedOrgId") || null;

  const [step, setStep] = useState(1);
  const [locations, setLocation] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [managers, setManagers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [talent_Groups, setTalent_groups] = useState([]);
  const [groups, setGroups] = useState([]);
  const [apiError, setApiError] = useState("");
  const [showLocationModal, setShowLocationModal] = useState(false);

  const userType = watch("user_type");
  const talentGroupId = watch("talent_group_id");

  const handleNextStep = async () => {
    let fieldsToValidate = [];
    if (step === 1) {
      fieldsToValidate = ["first_name", "last_name", "email", "username", "group_id"];
    } else if (step === 2) {
      fieldsToValidate = ["company", "jobtitle", "employee_num", "location", "phone"];
    }

    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      if (step === 2) {
        const uType = watch("user_type");
        const tGroup = watch("talent_group_id");
        if ((uType && !tGroup) || (!uType && tGroup)) {
          return;
        }
      }
      clearErrors();
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderProgressBar = () => {
    const progressPercent = ((step - 1) / 2) * 100;
    return (
      <div className="wizard-progress-container mb-5">
        <div className="wizard-progress-bar" style={{ width: `${progressPercent}%` }}></div>
        <div className="wizard-steps-indicator">
          <div className={`wizard-step-node ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <span className="step-num">{step > 1 ? '✓' : '1'}</span>
            <span className="step-label">{t("people.step_personal") || "Personal"}</span>
          </div>
          <div className={`wizard-step-node ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <span className="step-num">{step > 2 ? '✓' : '2'}</span>
            <span className="step-label">{t("people.step_org") || "Organization"}</span>
          </div>
          <div className={`wizard-step-node ${step >= 3 ? 'active' : ''}`}>
            <span className="step-num">3</span>
            <span className="step-label">{t("people.step_notes") || "Notes"}</span>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    const initialize = async () => {
      await fetchDropdownData();
      if (!isAddMode) {
        setRowData(isModal ? props.rowData : (state?.rowData || null));
      }
    };
    initialize();
  }, [isAddMode, state, isModal, props?.rowData]);

  useEffect(() => {
    if (rowData) {
      setFormValues(rowData);
    }
  }, [rowData]);

  const fetchDropdownData = async () => {
    try {
      const config = {};
      if (orgId) {
        config.headers = { "X-Selected-Org": orgId };
      }
      const [
        companiesResponse,
        locationResponse,
        managerResponse,
        departmentResponse,
        talent_groupResponse,
        groupsResponse,
      ] = await Promise.all([
        axios.get(`${Domain}/companies/selectList?page=1`, config),
        axios.get(`${Domain}/locations/selectList?page=1`, config),
        axios.get(`${Domain}/users/selectList?page=1`, config),
        axios.get(`${Domain}/departments/selectList?page=1`, config),
        axios.get(`${Domain}/talentGroups/selectList?page=1`, config),
        axios.get(`${Domain}/groups/selectList?page=1`, config),
      ]);

      if (
        companiesResponse?.data &&
        managerResponse?.data &&
        departmentResponse?.data &&
        talent_groupResponse?.data &&
        groupsResponse?.data &&
        locationResponse?.data
      ) {
        let fetchedCompanies = companiesResponse?.data?.items || [];
        let fetchedManagers = managerResponse?.data?.items || [];

        // Check if the current user is a Super Admin
        const userpermission = JSON.parse(localStorage.getItem("permissions") || "{}");
        const isCreatorSuper = userpermission?.superuser === "1" || userpermission?.superuser === 1 || userpermission?.superuser === true || userpermission?.superuser === "true";

        if (isCreatorSuper && isAddMode) {
          // 1. Fetch organization/firm details to get its name
          let orgName = "";
          if (orgId) {
            try {
              const orgRes = await axios.get(`${Domain}/register/firms/${orgId}`);
              if (orgRes?.data?.name) {
                orgName = orgRes.data.name;
              }
            } catch (e) {
              console.error("Error fetching org name:", e);
            }
          }

          // 2. Auto-select/create Company matching the organization name
          if (orgName) {
            let targetCompany = fetchedCompanies.find(c => c && c.text && c.text.toLowerCase() === orgName.toLowerCase());
            if (!targetCompany) {
              try {
                const newCompanyRes = await axios.post(`${Domain}/companies`, {
                  name: orgName
                }, config);
                if (newCompanyRes?.data?.id || newCompanyRes?.data?.result?.id) {
                  const newCompanyId = newCompanyRes.data.id || newCompanyRes.data.result.id;
                  const newCompanyObj = { id: newCompanyId, text: orgName };
                  fetchedCompanies.push(newCompanyObj);
                  targetCompany = newCompanyObj;
                }
              } catch (createErr) {
                console.error("Auto-creating company failed:", createErr);
              }
            }
            if (targetCompany) {
              setValue("company", targetCompany.id);
            }
          }

          // 3. Ensure "Super Admin" is in Creator/Incharge list and select it
          const hasSuperAdmin = fetchedManagers.some(m => m.id === 1);
          if (!hasSuperAdmin) {
            fetchedManagers.unshift({ id: 1, text: "Super Admin" });
          }
          setValue("manager", 1);
        }

        setCompanies(fetchedCompanies);
        setManagers(fetchedManagers);
        setDepartments(departmentResponse?.data?.items);
        setTalent_groups(talent_groupResponse?.data?.items);
        setLocation(locationResponse?.data?.items);

        let fetchedGroups = groupsResponse?.data?.items || [];
        fetchedGroups = fetchedGroups.filter(g => !g.text.toLowerCase().includes("super"));
        setGroups(fetchedGroups);
      } else {
        setApiError(t("alert.dropdown"));
      }
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const setFormValues = (data) => {
    console.log("deeeee");
    const fields = [
      "first_name",
      "last_name",
      "email",
      "username",
      "phone",
      "website",
      "talent_group_id",
      "employee_num",
      "jobtitle",
      "location",
      "notes",
    ];

    fields.forEach((field) => {
      setValue(field, data[field]);
    });

    setValue("activated", data.activated === 1 || data.activated === "1" || data.activated === true || data.activated === "true");
    setValue("manager", data?.manager?.id);
    setValue("department", data?.department?.id);
    setValue("company", data?.company?.id);
    setValue("location", data?.location?.id);
    setValue("group_id", data?.groups?.rows?.[0]?.id);
    setValue("user_type", data?.user_type);
  };

  const onSubmit = async (data) => {
    setApiError("");
    if (userType && !talentGroupId) {
      return;
    }
    if (!userType && talentGroupId) {
      return;
    }
    const body = {
      ...(data?.company && { company_id: data.company }),
      ...(data?.department && { department_id: data.department }),
      ...(data?.email && { email: data.email }),
      ...(data?.employee_num && { employee_num: data.employee_num }),
      ...(data?.first_name && { first_name: data.first_name }),
      ...(data?.group_id && { group_id: data.group_id }),
      ...(data?.jobtitle && { jobtitle: data.jobtitle }),
      ...(data?.last_name && { last_name: data.last_name }),
      ...(data?.location && { location_id: data.location }),
      ...(data?.manager && { manager_id: data.manager }),
      ...(data?.notes && { notes: data.notes }),
      ...(data?.phone && { phone: data.phone }),
      ...(data?.talent_group_id && { talent_group_id: data.talent_group_id }),
      ...(data?.user_type && { user_type: data.user_type }),
      ...(data?.username && { username: data.username }),
      ...(data?.website && { website: data.website }),
    };

    if (orgId) {
      body.firm_id = orgId;
    }

    if (data?.activated) {
      body.activated = "1";
    }
    else {
      body.activated = "0";
    }

    try {
      const headers = {
        "Content-Type": "application/json",
      };
      if (orgId) {
        headers["X-Selected-Org"] = orgId;
      }
      const response = await axios({
        method: isAddMode ? "post" : "put",
        url: isAddMode ? `${Domain}/users` : `${Domain}/users/${id}`,
        data: JSON.stringify(body),
        headers: headers,
      });

      if (response?.data?.success) {
        common.notify("S", response?.data?.message);
        if (sessionStorage.getItem("onboarding_active") === "true") {
          navigate("/Dashboard");
        } else if (isModal) {
          props.onSuccess();
        } else {
          if (orgId && orgId !== "all" && orgId !== 1 && orgId !== "1") {
            navigate(`/organizations/${orgId}`);
          } else {
            navigate("/peoples");
          }
        }
      } else setApiError(response?.data?.message);
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const backClick = () => {
    if (isModal) {
      props.handleClose();
    } else {
      if (orgId && orgId !== "all" && orgId !== 1 && orgId !== "1") {
        navigate(`/organizations/${orgId}`);
      } else {
        navigate("/peoples");
      }
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col md={12}>
          <div>
            {!isModal && (
              <div className="title d-flex justify-content-between mb-4">
                <div>
                  <h1>{isAddMode ? t("people.create") : t("people.update")}</h1>
                </div>
                <Button onClick={backClick} className="back">
                  {t("button.back")}
                </Button>
              </div>
            )}

            {renderProgressBar()}

            <div className="premium-wizard-card">
              <Form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
              >
                {apiError && (
                  <div className="alert alert-danger mb-4"> {apiError} </div>
                )}

                <div className="wizard-step-panel">
                  {step === 1 && (
                    <Row>
                      <Col md={6} sm={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("people.first_name")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder={t("people.first_name")}
                            {...register("first_name", { required: true })}
                            className="gen-form-control"
                          />
                          {errors.first_name && (
                            <p className="error">{t("people.firstnamereq")}</p>
                          )}
                        </Form.Group>
                      </Col>

                      <Col md={6} sm={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("people.last_name")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder={t("people.last_name")}
                            {...register("last_name", { required: true })}
                            className="gen-form-control"
                          />
                          {errors.last_name && (
                            <p className="error">{t("people.lastnamereq")}</p>
                          )}
                        </Form.Group>
                      </Col>

                      <Col md={6} sm={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("people.email")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Form.Control
                            type="email"
                            placeholder={t("people.emailad")}
                            {...register("email", {
                              required: true,
                              pattern: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/,
                            })}
                            className="gen-form-control"
                          />
                          <Form.Check
                            type="checkbox"
                            label={t("people.email_check")}
                            {...register("email_check")}
                            defaultChecked
                            disabled
                            className="mt-2"
                          />
                          {errors?.email?.type === "required" && (
                            <p className="error">{t("people.emailreq")}</p>
                          )}
                          {errors?.email?.type === "pattern" && (
                            <p className="error">{t("people.valid_email")}</p>
                          )}
                        </Form.Group>
                      </Col>

                      <Col md={6} sm={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("people.username")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder={t("people.username")}
                            {...register("username", { required: true })}
                            className="gen-form-control"
                          />
                          <Form.Check
                            type="switch"
                            id="user-active-switch"
                            label="User Active Status"
                            {...register("activated")}
                            className="mt-2"
                          />
                          {errors.username && (
                            <p className="error">{t("people.usernamereq")}</p>
                          )}
                        </Form.Group>
                      </Col>

                      <Col md={6} sm={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("people.group_id")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Form.Select
                            {...register("group_id", { required: true })}
                            className="gen-form-control"
                          >
                            <option value="">{t("select.group")}</option>
                            {groups?.length > 0 &&
                              groups.map((groups) => (
                                <option key={groups.id} value={groups.id}>
                                  {groups.text}
                                </option>
                              ))}
                          </Form.Select>
                          <Form.Text className="text-muted" style={{ fontSize: '0.85em', display: 'block', marginTop: '5px' }}>
                            {t("people.group_helper_note") || "Note: You can only assign roles/groups at or below your own privilege level."}
                          </Form.Text>
                          {errors.group_id && (
                            <p className="error">{t("people.grouprequired")}</p>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>
                  )}

                  {step === 2 && (
                    <Row>
                      <Col md={6} sm={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("people.company_id")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Form.Select
                            {...register("company", { required: true })}
                            className="gen-form-control"
                          >
                            <option value="">{t("select.company")}</option>
                            {companies?.length > 0 &&
                              companies.map((companies) => (
                                <option key={companies.id} value={companies.id}>
                                  {companies.text}
                                </option>
                              ))}
                          </Form.Select>
                          {errors.company && (
                            <p className="error">{t("select.companyreq")}</p>
                          )}
                        </Form.Group>
                      </Col>

                      <Col md={6} sm={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("people.jobtitle")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder={t("people.jobtitle")}
                            {...register("jobtitle", { required: true })}
                            className="gen-form-control"
                          />
                          {errors.jobtitle && (
                            <p className="error">{t("people.jobtitlereq")}</p>
                          )}
                        </Form.Group>
                      </Col>

                      <Col md={6} sm={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("people.employee_num")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder={t("people.employee_num")}
                            {...register("employee_num", { required: true })}
                            className="gen-form-control"
                          />
                          {errors.employee_num && (
                            <p className="error">{t("people.employee_noreq")}</p>
                          )}
                        </Form.Group>
                      </Col>

                      <Col md={6} sm={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("people.creator_incharge")}{" "}
                          </Form.Label>
                          <Form.Select
                            {...register("manager")}
                            className="gen-form-control"
                          >
                            <option value="">{t("select.creator_incharge")}</option>
                            {managers.map((manager) => (
                              <option key={manager.id} value={manager.id}>
                                {manager.id}-{manager.text}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>

                      <Col md={6} sm={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("people.department_id")}{" "}
                          </Form.Label>
                          <Form.Select
                            {...register("department")}
                            className="gen-form-control"
                          >
                            <option value="">{t("select.department")}</option>
                            {departments.map((department) => (
                              <option key={department.id} value={department.id}>
                                {department.text}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>

                      <Col md={6} sm={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("people.user_type")}{" "}
                          </Form.Label>
                          <Form.Select
                            {...register("user_type")}
                            className="gen-form-control"
                          >
                            <option value="">{t("select.user_type")}</option>
                            <option value="1"> {t("people.tech")}</option>
                            <option value="2">{t("people.tech_man")} </option>
                          </Form.Select>
                          {talentGroupId && !userType && (
                            <p className="error">
                              {t("people.user_type_required")}
                            </p>
                          )}
                        </Form.Group>
                      </Col>

                      <Col md={6} sm={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("people.talent_group_id")}{" "}
                          </Form.Label>
                          <Form.Select
                            {...register("talent_group_id")}
                            className="gen-form-control"
                          >
                            <option value="">{t("select.talent_group")}</option>
                            {talent_Groups?.length > 0 &&
                              talent_Groups.map((talent_Groups) => (
                                <option key={talent_Groups.id} value={talent_Groups.id}>
                                  {talent_Groups.text}
                                </option>
                              ))}
                          </Form.Select>
                          {userType && !talentGroupId && (
                            <p className="error">
                              {t("people.talent_group_required")}
                            </p>
                          )}
                        </Form.Group>
                      </Col>

                      <Col md={6} sm={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("people.location_id") || "Branch Location"}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <div className="d-flex gap-2 align-items-center">
                            <div style={{ flex: 1 }}>
                              <Form.Select
                                {...register("location", { required: true })}
                                className="gen-form-control"
                              >
                                <option value="">{t("select.location") || "Select Branch Location"}</option>
                                {locations?.length > 0 &&
                                  locations.map((loc) => (
                                    <option key={loc.id} value={loc.id}>
                                      {loc.text}
                                    </option>
                                  ))}
                              </Form.Select>
                            </div>
                            <Button
                              type="button"
                              className="primary"
                              onClick={() => setShowLocationModal(true)}
                              style={{
                                height: "38px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "0 15px",
                                fontWeight: "600"
                              }}
                            >
                              +
                            </Button>
                          </div>
                          {errors.location && (
                            <p className="error">{t("people.locationreq") || "Branch Location is required"}</p>
                          )}
                        </Form.Group>
                      </Col>

                      <Col md={6} sm={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("people.phone")}{" "}
                            <span className="mandatory">*</span>
                          </Form.Label>
                          <Form.Control
                            type="tel"
                            placeholder={t("placeholder.phone")}
                            {...register("phone", {
                              required: true,
                              pattern: /^[0-9]{10}$/,
                            })}
                            className="gen-form-control"
                            maxLength={10}
                            onKeyPress={(event) => {
                              const pattern = /[0-9]/;
                              const inputChar = String.fromCharCode(event.charCode);
                              if (!pattern.test(inputChar)) {
                                event.preventDefault();
                              }
                            }}
                          />
                          {errors.phone?.type === "required" && (
                            <p role="alert" className="error">
                              {t("people.phonerequired")}
                            </p>
                          )}
                          {errors.phone?.type === "pattern" && (
                            <p role="alert" className="error">
                              {t("people.invalidphone")}
                            </p>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>
                  )}

                  {step === 3 && (
                    <Row>
                      <Col md={6} sm={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("people.website")}{" "}
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder={t("people.website")}
                            {...register("website")}
                            className="gen-form-control"
                          />
                        </Form.Group>
                      </Col>

                      <Col md={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {t("people.notes")}{" "}
                          </Form.Label>
                          <Form.Control
                            as="textarea"
                            placeholder={t("people.notes")}
                            {...register("notes")}
                            className="gen-form-control"
                            style={{ minHeight: "150px" }}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  )}
                </div>

                <div className="wizard-footer-buttons mt-5">
                  {step === 1 ? (
                    <Button type="button" variant="outline-primary" onClick={backClick}>
                      {t("button.btnCancel")}
                    </Button>
                  ) : (
                    <Button type="button" variant="outline-primary" onClick={handlePrevStep}>
                      {t("button.back") || "Back"}
                    </Button>
                  )}

                  {step < 3 ? (
                    <Button type="button" className="primary" onClick={handleNextStep}>
                      {t("button.next") || "Next"}
                    </Button>
                  ) : (
                    <Button className="primary" type="button" onClick={() => onSubmit(getValues())}>
                      {t("button.submit")}
                    </Button>
                  )}
                </div>
              </Form>
            </div>
          </div>
        </Col>
      </Row>
      <Modal show={showLocationModal} onHide={() => setShowLocationModal(false)} size="xl" backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Create Branch Location</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AddEditLocations
            isModal={true}
            handleClose={() => setShowLocationModal(false)}
            onSuccess={async (newLoc) => {
              setShowLocationModal(false);
              try {
                const config = {};
                if (orgId) {
                  config.headers = { "X-Selected-Org": orgId };
                }
                const response = await axios.get(`${Domain}/locations/selectList?page=1`, config);
                if (response?.data && response.data.items) {
                  setLocation(response.data.items);
                  if (newLoc && newLoc.id) {
                    setValue("location", newLoc.id);
                  }
                }
              } catch (err) {
                console.error("Error refreshing locations:", err);
              }
            }}
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default AddEditPeoples;
