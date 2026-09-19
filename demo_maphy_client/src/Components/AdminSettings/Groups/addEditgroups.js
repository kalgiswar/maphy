import { useForm } from "react-hook-form";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import { useTranslation } from "react-i18next";
import { common } from "../../../Common/common";

const Domain = process.env.REACT_APP_API_URL;

const permissionsKeys = [
  "Global",
  "Admin",
  "CSV",
  "Report",
  "Assets",
  "Accessories",
  "Consumables",
  "License",
  "Component",
  "Users",
  "Models",
  "Categories",
  "Departments",
  "Statuslabel",
  "Suppliers",
  "Manufacturers",
  "Location",
  "Companies",
  "Depreciations",
  "Self",
  "BranchesDropdown",
  "EditGroupPermissions",
];

const permissionGroupsDef = [
  {
    titleKey: "group_global_control",
    descKey: "group_global_control_desc",
    keys: ["Global", "Admin", "EditGroupPermissions", "CSV", "Report"],
  },
  {
    titleKey: "group_assets_inventory",
    descKey: "group_assets_inventory_desc",
    keys: ["Assets", "Accessories", "Consumables", "License", "Component"],
  },
  {
    titleKey: "group_directory_setup",
    descKey: "group_directory_setup_desc",
    keys: [
      "Users",
      "Models",
      "Categories",
      "Departments",
      "Statuslabel",
      "Suppliers",
      "Manufacturers",
      "Location",
      "Companies",
      "Depreciations",
    ],
  },
  {
    titleKey: "group_self_navigation",
    descKey: "group_self_navigation_desc",
    keys: ["Self", "BranchesDropdown"],
  },
];

const AddEditGroups = () => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id, orgId } = useParams();
  const isAddMode = !id;
  const [apiError, setApiError] = useState("");

  const userpermission = JSON.parse(localStorage.getItem("permissions") || "{}");
  const isSuper = userpermission?.superuser === "1" || userpermission?.superuser === 1 || userpermission?.superuser === true || userpermission?.superuser === "true";
  const isAdmin = userpermission?.admin === true || userpermission?.admin === "1" || userpermission?.admin === 1 || userpermission?.admin === "true";

  const filteredPermissionGroupsDef = permissionGroupsDef.map((group) => {
    if (group.titleKey === "group_global_control") {
      let keys = group.keys;
      if (!isSuper) {
        keys = keys.filter((key) => key !== "Global" && key !== "Admin");
      }
      if (!isSuper && !isAdmin) {
        keys = keys.filter((key) => key !== "EditGroupPermissions");
      }
      return {
        ...group,
        keys,
      };
    }
    return group;
  });

  useEffect(() => {
    if (isAddMode) {
      const defaultValues = {
        permissions: permissionsKeys.reduce((acc, key) => {
          acc[key] = "false";
          return acc;
        }, {}),
      };
      reset(defaultValues);
    } else {
      getGroupDetails();
    }
  }, [id, isAddMode, reset]);

  const getGroupDetails = async () => {
    try {
      const headers = { "Content-Type": "application/json" };
      if (orgId) {
        headers["X-Selected-Org"] = orgId;
      }
      const response = await axios.get(`${Domain}/groups/${id}`, {
        headers,
      });
      if (response?.data) {
        const fetchedPermissions = permissionsKeys.reduce((acc, key) => {
          let value;
          switch (key) {
            case "Global":
              value = (response.data.permissions.superuser === "1" || response.data.permissions.superuser === 1 || response.data.permissions.superuser === true || response.data.permissions.superuser === "true") ? "true" : "false";
              break;
            case "Admin":
              value = response.data.permissions.admin ? "true" : "false";
              break;
            case "CSV":
              value = response.data.permissions.import ? "true" : "false";
              break;
            case "Report":
              value = response.data.permissions.reportview ? "true" : "false";
              break;
            case "Assets":
              value = response.data.permissions.assetsaudit ? "true" : "false";
              break;
            case "Accessories":
              value = response.data.permissions.accessoriescheckin
                ? "true"
                : "false";
              break;
            case "Consumables":
              value = response.data.permissions.consumablescheckout
                ? "true"
                : "false";
              break;
            case "License":
              value = response.data.permissions.licensescheckout
                ? "true"
                : "false";
              break;
            case "Component":
              value = response.data.permissions.componentscheckin
                ? "true"
                : "false";
              break;
            case "Users":
              value = response.data.permissions.userscreate ? "true" : "false";
              break;
            case "Models":
              value = response.data.permissions.modelscreate ? "true" : "false";
              break;
            case "Categories":
              value = response.data.permissions.categoriescreate
                ? "true"
                : "false";
              break;
            case "Departments":
              value = response.data.permissions.departmentscreate
                ? "true"
                : "false";
              break;
            case "Statuslabel":
              value = response.data.permissions.statuslabelscreate
                ? "true"
                : "false";
              break;
            case "Suppliers":
              value = response.data.permissions.supplierscreate
                ? "true"
                : "false";
              break;
            case "Manufacturers":
              value = response.data.permissions.manufacturerscreate
                ? "true"
                : "false";
              break;
            case "Location":
              value = response.data.permissions.locationscreate
                ? "true"
                : "false";
              break;
            case "Companies":
              value = response.data.permissions.companiescreate
                ? "true"
                : "false";
              break;
            case "Depreciations":
              value = response.data.permissions.depreciationscreate
                ? "true"
                : "false";
              break;
            case "Self":
              value = response.data.permissions.selfapi ? "true" : "false";
              break;
            case "BranchesDropdown":
              value = response.data.permissions.branches_dropdown ? "true" : "false";
              break;
            case "EditGroupPermissions":
              value = response.data.permissions.edit_group_permissions ? "true" : "false";
              break;
            default:
              value = "false";
              break;
          }
          acc[key] = value;
          return acc;
        }, {});
        reset({
          name: response.data.name,
          permissions: fetchedPermissions,
        });
      } else {
        setApiError(t("alert.error"));
      }
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const onSubmit = async (data) => {
    const permissions = {
      superuser: data.permissions.Global === "true" ? "1" : "0",
      admin: data.permissions.Admin === "true" ? true : false,
      import: data.permissions.CSV === "true" ? true : false,
      reportview: data.permissions.Report === "true" ? true : false,
      //assets
      assetsaudit: data.permissions.Assets === "true" ? true : false,
      assetscheckin: data.permissions.Assets === "true" ? true : false,
      assetscheckout: data.permissions.Assets === "true" ? true : false,
      assetscreate: data.permissions.Assets === "true" ? true : false,
      assetsdelete: data.permissions.Assets === "true" ? true : false,
      assetsedit: data.permissions.Assets === "true" ? true : false,
      assetsview: data.permissions.Assets === "true" ? true : false,
      assetsviewrequestable: data.permissions.Assets === "true" ? true : false,
      //accessories
      accessoriescheckin:
        data.permissions.Accessories === "true" ? true : false,
      accessoriescheckout:
        data.permissions.Accessories === "true" ? true : false,
      accessoriescreate: data.permissions.Accessories === "true" ? true : false,
      accessoriesdelete: data.permissions.Accessories === "true" ? true : false,
      accessoriesedit: data.permissions.Accessories === "true" ? true : false,
      accessoriesview: data.permissions.Accessories === "true" ? true : false,
      //consumables
      consumablescheckout:
        data.permissions.Consumables === "true" ? true : false,
      consumablescreate: data.permissions.Consumables === "true" ? true : false,
      consumablesdelete: data.permissions.Consumables === "true" ? true : false,
      consumablesedit: data.permissions.Consumables === "true" ? true : false,
      consumablesview: data.permissions.Consumables === "true" ? true : false,
      //license
      licensescheckout: data.permissions.License === "true" ? true : false,
      licensescreate: data.permissions.License === "true" ? true : false,
      licensesdelete: data.permissions.License === "true" ? true : false,
      licensesedit: data.permissions.License === "true" ? true : false,
      licenseskeys: data.permissions.License === "true" ? true : false,
      licensesview: data.permissions.License === "true" ? true : false,
      //compoenets
      componentscheckin: data.permissions.Component === "true" ? true : false,
      componentscheckout: data.permissions.Component === "true" ? true : false,
      componentscreate: data.permissions.Component === "true" ? true : false,
      componentsdelete: data.permissions.Component === "true" ? true : false,
      componentsedit: data.permissions.Component === "true" ? true : false,
      componentsview: data.permissions.Component === "true" ? true : false,
      //users
      userscreate: data.permissions.Users === "true" ? true : false,
      usersdelete: data.permissions.Users === "true" ? true : false,
      usersedit: data.permissions.Users === "true" ? true : false,
      usersview: data.permissions.Users === "true" ? true : false,
      //models
      modelscreate: data.permissions.Models === "true" ? true : false,
      modelsdelete: data.permissions.Models === "true" ? true : false,
      modelsedit: data.permissions.Models === "true" ? true : false,
      modelsview: data.permissions.Models === "true" ? true : false,
      //categorie
      categoriescreate: data.permissions.Categories === "true" ? true : false,
      categoriesdelete: data.permissions.Categories === "true" ? true : false,
      categoriesedit: data.permissions.Categories === "true" ? true : false,
      categoriesview: data.permissions.Categories === "true" ? true : false,
      //departments
      departmentscreate: data.permissions.Departments === "true" ? true : false,
      departmentsdelete: data.permissions.Departments === "true" ? true : false,
      departmentsedit: data.permissions.Departments === "true" ? true : false,
      departmentsview: data.permissions.Departments === "true" ? true : false,
      //statuslabel
      statuslabelscreate:
        data.permissions.Statuslabel === "true" ? true : false,
      statuslabelsdelete:
        data.permissions.Statuslabel === "true" ? true : false,
      statuslabelsedit: data.permissions.Statuslabel === "true" ? true : false,
      statuslabelsview: data.permissions.Statuslabel === "true" ? true : false,
      //suppliers
      supplierscreate: data.permissions.Suppliers === "true" ? true : false,
      suppliersdelete: data.permissions.Suppliers === "true" ? true : false,
      suppliersedit: data.permissions.Suppliers === "true" ? true : false,
      suppliersview: data.permissions.Suppliers === "true" ? true : false,
      //manufacturers
      manufacturerscreate:
        data.permissions.Manufacturers === "true" ? true : false,
      manufacturersdelete:
        data.permissions.Manufacturers === "true" ? true : false,
      manufacturersedit:
        data.permissions.Manufacturers === "true" ? true : false,
      manufacturersview:
        data.permissions.Manufacturers === "true" ? true : false,
      //locations
      locationscreate: data.permissions.Location === "true" ? true : false,
      locationsdelete: data.permissions.Location === "true" ? true : false,
      locationsedit: data.permissions.Location === "true" ? true : false,
      locationsview: data.permissions.Location === "true" ? true : false,
      //companies
      companiescreate: data.permissions.Companies === "true" ? true : false,
      companiesdelete: data.permissions.Companies === "true" ? true : false,
      companiesedit: data.permissions.Companies === "true" ? true : false,
      companiesview: data.permissions.Companies === "true" ? true : false,
      //depreciations
      depreciationscreate:
        data.permissions.Depreciations === "true" ? true : false,
      depreciationsdelete:
        data.permissions.Depreciations === "true" ? true : false,
      depreciationsedit:
        data.permissions.Depreciations === "true" ? true : false,
      depreciationsview:
        data.permissions.Depreciations === "true" ? true : false,
      //self
      selfapi: data.permissions.Self === "true" ? true : false,
      selfcheckout_assets: data.permissions.Self === "true" ? true : false,
      selfedit_location: data.permissions.Self === "true" ? true : false,
      selftwo_factor: data.permissions.Self === "true" ? true : false,
      branches_dropdown: data.permissions.BranchesDropdown === "true" ? true : false,
      edit_group_permissions: data.permissions.EditGroupPermissions === "true" ? true : false,
    };
    const body = {
      name: data.name,
      permissions,
    };
    console.log("payload", permissions);

    try {
      const headers = { "Content-Type": "application/json" };
      if (orgId) {
        headers["X-Selected-Org"] = orgId;
      }
      const response = await axios({
        method: isAddMode ? "post" : "put",
        url: isAddMode ? `${Domain}/groups` : `${Domain}/groups/${id}`,
        data: JSON.stringify(body),
        headers,
      });
      if (response?.data?.success) {
        common.notify("S", response?.data?.message);
        navigate(orgId ? `/organizations/${orgId}` : "/Groups");
      } else {
        setApiError(response?.data?.message);
      }
    } catch (error) {
      setApiError(t("alert.error"));
    }
  };

  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setValue(name, value);
  };

  const backClick = () => {
    navigate(orgId ? `/organizations/${orgId}` : "/Groups");
  };

  return (
    <div>
      <div className="title d-flex justify-content-between">
        <div>
          <h1> {isAddMode ? t("groups.create") : t("groups.update")}</h1>
        </div>
        <Button onClick={backClick} className="back">
          {t("button.back")}
        </Button>
      </div>
      <div className="addProperty wrapper">
        <div className="basicDetails pt-4">
          <form className="mb-3" onSubmit={handleSubmit(onSubmit)} noValidate>
            {apiError && <div className="alert alert-danger"> {apiError} </div>}
            <div className="groupsname">
              <label className="form-label">{t("groups.name")}<span className="mandatory">*</span></label>
              <input
                type="text"
                placeholder={t("groups.name")}
                {...register("name", {
                  required: true,
                })}
              />
              {errors?.name && <p className="error">{t("groups.namereq")}</p>}
            </div>
            <div className="permissions-grid">
              {filteredPermissionGroupsDef.map((group) => (
                <Card key={group.titleKey} className="permission-card">
                  <div className="card-header-custom">
                    <h4 className="permission-group-title">{t(`groups.${group.titleKey}`)}</h4>
                    <p className="permission-group-desc">{t(`groups.${group.descKey}`)}</p>
                  </div>
                  <div className="permission-items-list">
                    {group.keys.map((key) => (
                      <div key={key} className="permission-item-row">
                        <div className="permission-info">
                          <h5 className="permission-item-title">{t(`groups.${key}`)}</h5>
                          <p className="permission-item-desc">{t(`groups.${key}_desc`)}</p>
                        </div>
                        <div className="permission-toggle-group">
                          <label className="permission-toggle-label">
                            <input
                              type="radio"
                              value="true"
                              className="permission-toggle-input"
                              {...register(`permissions.${key}`, {
                                onChange: handleRadioChange,
                              })}
                            />
                            <span className="permission-toggle-btn grant">{t("groups.grant")}</span>
                          </label>
                          <label className="permission-toggle-label">
                            <input
                              type="radio"
                              value="false"
                              className="permission-toggle-input"
                              {...register(`permissions.${key}`, {
                                onChange: handleRadioChange,
                              })}
                            />
                            <span className="permission-toggle-btn deny">{t("groups.deny")}</span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
            <div className="d-flex mt-5">
              <Button className="primary mr-1" type="submit">
                {t("button.submit")}
              </Button>
              <Button variant="outline-primary" onClick={backClick}>
                {t("button.cancel")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEditGroups;
