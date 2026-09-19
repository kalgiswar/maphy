import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { common } from "../../../Common/common";
import axios from "axios";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import CustomPagination from "../../../Common/pagination";
import AlertModal from "../../../Common/NotificationModal";
import SortingIcon from "../../../Common/Icons";
import CsvExportButton from "../../../Common/CsvExportButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
const MainPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [sizePerPage, setSizePerPage] = useState(10);
  const [offset, setOffset] = useState("0");
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortField, setSortField] = useState("id");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemTodelete, setItemTodelete] = useState("");
  const [initialized, setInitialized] = useState(false);

  const userpermission = JSON.parse(localStorage.getItem("permissions"));
  const isSuperuser = userpermission?.superuser === "1" || userpermission?.superuser === 1 || userpermission?.superuser === true || userpermission?.superuser === "true";
  const isAdmin = userpermission?.admin === true;
  const canEditGroups = isSuperuser || userpermission?.edit_group_permissions === true || userpermission?.edit_group_permissions === "1" || userpermission?.edit_group_permissions === 1 || userpermission?.edit_group_permissions === "true";

  const Domain = process.env.REACT_APP_API_URL;
  const selectedOrgId = localStorage.getItem("selectedOrgId");
  const selectedOrgName = localStorage.getItem("selectedOrgName") || "";
  const isOrgSwitched = isSuperuser && selectedOrgId && selectedOrgId !== "all" && selectedOrgId !== "undefined";

  // Super Admin can edit/delete groups in both switched and unswitched views.
  const canActuallyEditGroups = isSuperuser ? true : canEditGroups;

  useEffect(() => {
    getDetails();
  }, []);

  useEffect(() => {
    if (initialized) getDetails();
  }, [currentPage, sizePerPage, sortField, sortOrder]);

  useEffect(() => {
    if (initialized) getDetails();
    else setInitialized(true);
  }, [searchText]);

  const handlePageChange = (page) => {
    const offset = (page - 1) * sizePerPage;
    setOffset(offset);
    setCurrentPage(page);
  };

  const handlePageSizeChange = (pageSize) => {
    setOffset(0);
    setCurrentPage(1);
    setSizePerPage(pageSize);
    setOffset(0);
    setSizePerPage(pageSize);
  };
  const handleDeleteAlert = (id) => {
    setShowDeleteModal(true);
    setItemTodelete(id);
  };

  const handleCloseDeleteModal = (e) => {
    e.preventDefault();
    setShowDeleteModal(false);
  };

  const getDetails = async () => {
    var url =
      Domain +
      `/groups?limit=${sizePerPage ? sizePerPage : 10
      }&offset=${offset}&search=${searchText ? searchText : ""
      }&sort=${sortField}&order=${sortOrder}`;
    await axios
      .get(url)
      .then((response) => {
        setData(response?.data?.rows);
        const totalPages = Math.ceil(response?.data?.total / sizePerPage);
        setTotalPages(totalPages);
      })
      .catch(function (response) {
        //handle error
        common.notify("E", response);
      });
  };

  const handleInputChange = (evnt) => {
    setSearchText(evnt.target.value);
  };

  const onSearchClick = () => {
    setOffset(0);
    setCurrentPage(1);
    getDetails();
  };

  const deleteItem = async () => {
    const url = Domain + "/groups/" + itemTodelete;
    await axios
      .delete(url)
      .then((response) => {
        setShowDeleteModal(false);
        getDetails();
        const successMessage = response?.data?.message;
        common.notify("S", successMessage);
      })
      .catch(function (response) {
        common.notify("E", response);
      });
  };

  const handleEditClick = (id) => {
    navigate(`/addEditgroups/${id}`);
  };

  const onTableChange = (filedname) => {
    setSortField(filedname);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const csvData = data.map((item) => [item?.id, item?.name]);
  return (
    <div className="form">
      <Container fluid>
        <Row>
          <Col md={12}>
            <div className="group-mgmt-wrapper">
              <div className="group-mgmt-title-bar d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                  <h1>{t("groups.groupmanagement")}</h1>
                </div>
                {canEditGroups && (
                  <div>
                    <Button
                      className="premium-btn-create px-4"
                      type="submit"
                      onClick={() => navigate("/addEditgroups")}
                    >
                      {t("button.create")}
                    </Button>
                  </div>
                )}
              </div>

              {/* Info banner for Super Admin when no org is selected yet */}
              {isSuperuser && !isOrgSwitched && (
                <div
                  className="mb-4 px-3 py-3 d-flex align-items-center gap-3"
                  style={{
                    background: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",
                    border: "1px solid #7dd3fc",
                    borderRadius: "12px",
                    color: "#0369a1",
                    fontWeight: 500,
                    fontSize: "0.95rem",
                    boxShadow: "0 4px 12px rgba(3, 105, 161, 0.05)"
                  }}
                >
                  <span style={{ fontSize: "1.3rem" }}>ℹ️</span>
                  <span>
                    Select an <strong>Organization</strong> from the top navbar dropdown to enable editing group permissions.
                    In this view you can only <strong>create new groups</strong>.
                  </span>
                </div>
              )}

              {/* Org context banner — visible only when Super Admin is switched to a specific org */}
              {isOrgSwitched && (
                <div
                  className="mb-4 px-3 py-3 d-flex align-items-center gap-3"
                  style={{
                    background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                    border: "1px solid #fcd34d",
                    borderRadius: "12px",
                    color: "#b45309",
                    fontWeight: 500,
                    fontSize: "0.95rem",
                    boxShadow: "0 4px 12px rgba(180, 83, 9, 0.05)"
                  }}
                >
                  <span style={{ fontSize: "1.3rem" }}>🏢</span>
                  <span>
                    You are editing <strong>Group Permissions</strong> for organization:
                    &nbsp;<strong>{selectedOrgName || `Org #${selectedOrgId}`}</strong>
                  </span>
                </div>
              )}



              <div className="premium-search-form mb-4">
                <input
                  type="text"
                  name="search"
                  placeholder={t("search.search")}
                  className="premium-search-input"
                  onChange={handleInputChange}
                />
                <Button
                  className="premium-btn-search"
                  type="button"
                  onClick={onSearchClick}
                  title="Search"
                >
                  <FontAwesomeIcon
                    icon={faSearch}
                  />
                </Button>
                <CsvExportButton
                  headers={[t("groups.id"), t("groups.name")]}
                  data={csvData}
                  filename="groups.csv"
                />
              </div>

              <div className="premium-table-container">
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th onClick={() => onTableChange("id")}>
                        {t("groups.id")}
                        <SortingIcon
                          columnName="id"
                          sortField={sortField}
                          sortOrder={sortOrder}
                        />
                      </th>
                      <th onClick={() => onTableChange("name")}>
                        {t("groups.name")}{" "}
                        <SortingIcon
                          columnName="name"
                          sortField={sortField}
                          sortOrder={sortOrder}
                          onTableChange={onTableChange}
                        />
                      </th>
                      <th className="text-end pe-4">{t("button.actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.length > 0 ? (
                      data.map((items, index) => (
                        <tr key={items?.id || index}>
                          <td>{items?.id}</td>
                          <td style={{ fontWeight: 600, color: "#1e293b" }}>{items?.name}</td>
                          <td className="text-end pe-4">
                            {canActuallyEditGroups && items?.available_actions?.update === true && (
                              <span
                                className="action-icon-edit"
                                title="Edit"
                                onClick={() => handleEditClick(items?.id)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"></path></svg>
                              </span>
                            )}
                            {canActuallyEditGroups && items?.available_actions?.delete === true && (
                              <span
                                className="action-icon-delete"
                                title="Delete"
                                onClick={() => handleDeleteAlert(items?.id)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" align="center" className="py-4 text-muted">
                          {t("alert.nodatafound")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>

              {totalPages > 0 && (
                <div className="mt-4">
                  <CustomPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    itemsPerPage={sizePerPage}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                  />
                </div>
              )}
              
              <AlertModal
                onClick={deleteItem}
                show={showDeleteModal}
                handleClose={handleCloseDeleteModal}
                modalType="delete"
              />
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default MainPage;
