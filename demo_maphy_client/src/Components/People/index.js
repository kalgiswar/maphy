import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import AddEditPeoples from "./addEditpeople";
import { useTranslation } from "react-i18next";
import { common } from "../../Common/common";
import axios from "axios";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import CustomPagination from "../../Common/pagination";
import AlertModal from "../../Common/NotificationModal";
import SortingIcon from "../../Common/Icons";
import CsvExportButton from "../../Common/CsvExportButton";
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
  const [show, setShow] = useState(false);
  const [itemTodelete, setItemTodelete] = useState("");
  const [itemToRestore, setItemToRestore] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [editUserRowData, setEditUserRowData] = useState(null);
  const [modalKey, setModalKey] = useState(0);
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState("");
  const Domain = process.env.REACT_APP_API_URL;
  const userpermission = JSON.parse(localStorage.getItem("permissions") || "{}");
  const isSuper = userpermission?.superuser === "1" || userpermission?.superuser === 1 || userpermission?.superuser === true || userpermission?.superuser === "true";
  const isAdmin = userpermission?.admin === true || userpermission?.admin === "1" || userpermission?.admin === 1 || userpermission?.admin === "true";
  const canCreateUser = isSuper || isAdmin || userpermission?.userscreate === true || userpermission?.userscreate === "1" || userpermission?.userscreate === 1 || userpermission?.userscreate === "true";
  const canEditUser = isSuper || isAdmin || userpermission?.usersedit === true || userpermission?.usersedit === "1" || userpermission?.usersedit === 1 || userpermission?.usersedit === "true";
  const canDeleteUser = isSuper || isAdmin || userpermission?.usersdelete === true || userpermission?.usersdelete === "1" || userpermission?.usersdelete === 1 || userpermission?.usersdelete === "true";

  const getDetails = async () => {
    let url = `${Domain}/users?limit=${sizePerPage}&offset=${offset}&search=${searchText}&sort=${sortField}&order=${sortOrder}`;
    if (isSuper && selectedOrg) {
      url += `&firm_id=${selectedOrg}`;
    }
    try {
      const response = await axios.get(url);
      setData(response?.data?.rows || []);
      const totalPages = Math.ceil(response?.data?.total / sizePerPage);
      setTotalPages(totalPages);
    } catch (error) {
      common.notify("E", error);
    }
  };

  useEffect(() => {
    if (isSuper) {
      axios.get(`${Domain}/register/firms/selectList`)
        .then(response => {
          if (response.data && response.data.items) {
            setOrganizations(response.data.items);
          }
        })
        .catch(err => console.error("Error loading organizations list:", err));
    }
  }, [isSuper]);

  useEffect(() => {
    if (showDeleted) {
      getDeletedDetails();
    } else {
      getDetails();
    }
  }, [currentPage, sizePerPage, sortField, sortOrder, showDeleted, selectedOrg]);

  useEffect(() => {
    if (initialized) {
      if (showDeleted) {
        getDeletedDetails();
      } else {
        getDetails();
      }
    } else {
      setInitialized(true);
    }
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
  };
  const handleDeleteAlert = (id) => {
    setShow(true);
    setItemTodelete(id);
  };

  const handleClose = (e) => {
    e.preventDefault();
    setShow(false);
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
    const url = Domain + "/users/" + itemTodelete;
    await axios
      .delete(url)
      .then((response) => {
        setShow(false);
        if (data.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          if (showDeleted) {
            getDeletedDetails();
          } else {
            getDetails();
          }
        }
        common.notify("S", response?.data?.message);
      })
      .catch(function (response) {
        common.notify("E", response);
      });
  };

  const handleEditClick = (rowData) => {
    setEditUserId(rowData.id);
    setEditUserRowData(rowData);
    setModalKey(prev => prev + 1);
    setShowAddEditModal(true);
  };

  const onTableChange = (fieldname) => {
    setSortField(fieldname);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleRestoreAlert = (id) => {
    setShow(true);
    setItemToRestore(id);
  };

  const getDeletedDetails = async () => {
    let url = `${Domain}/users?deleted=true&limit=${sizePerPage}&offset=${offset}&search=${searchText}&sort=${sortField}&order=${sortOrder}`;
    if (isSuper && selectedOrg) {
      url += `&firm_id=${selectedOrg}`;
    }
    try {
      const response = await axios.get(url);
      setData(response?.data?.rows);
      const totalPages = Math.ceil(response?.data?.total / sizePerPage);
      setTotalPages(totalPages);
    } catch (error) {
      common.notify("E", error);
    }
  };

  const restoreItem = async () => {
    const url = `${Domain}/users/restore/${itemToRestore}`;
    try {
      const response = await axios.put(url);
      setShow(false);
      getDeletedDetails(); // Ensure it always fetches deleted items after restore
      common.notify("S", response?.data?.message); // Display success message here
    } catch (error) {
      common.notify("E", error);
    }
  };

  const toggleShowDeleted = () => {
    setShowDeleted((prev) => !prev);
    setCurrentPage(1);
    setOffset(0);
  };
  const csvData = data.map((item) => [
    item?.name,
    item?.email,
    item?.first_name,
    item?.last_name,
    item?.groups?.rows?.[0]?.name,
    item?.talentGroup?.name,
    item?.department?.name,
    item?.manager?.name,
    item?.assets_count,
    item?.licenses_count,
    item?.consumables_count,
    item?.accessories_count,
  ]);

  return (
    <div className="form">
      <Container fluid>
        <Row>
          <Col md={12}>
            <div>
              <div className="title d-flex justify-content-between">
                <div>
                  <h1> {t("people.currentuser")}</h1>
                </div>
                <div>
                  <Button
                    className="me-2"
                    type="button"
                    onClick={toggleShowDeleted}
                  >
                    {showDeleted
                      ? t("people.viewcurrent")
                      : t("people.viewdeleted")}
                  </Button>
                  {canCreateUser && (
                    <Button
                      className="primary px-4"
                      type="button"
                      onClick={() => {
                        setEditUserId(null);
                        setEditUserRowData(null);
                        setModalKey(prev => prev + 1);
                        setShowAddEditModal(true);
                      }}
                    >
                      {t("button.create")}
                    </Button>
                  )}
                </div>
              </div>

              <div className="dataTable wrapper">
                <div className="d-flex justify-content-between">
                  <div className="my-3">
                    <Form>
                      <input
                        type="text"
                        name="search"
                        placeholder={t("search.search")}
                        className="search me-1"
                        onChange={handleInputChange}
                      />
                      <Button
                        className="icon me-1"
                        type="button"
                        onClick={onSearchClick}
                        title="Search"
                      >
                        <FontAwesomeIcon
                          icon={faSearch}
                          className="searchicon"
                        />
                      </Button>
                      {isSuper && (
                        <Form.Select
                          value={selectedOrg}
                          onChange={(e) => {
                            setSelectedOrg(e.target.value);
                            setCurrentPage(1);
                            setOffset(0);
                          }}
                          className="d-inline-block w-auto me-2 align-middle"
                          style={{ height: '38px', padding: '0 30px 0 12px' }}
                        >
                          <option value="">All Organizations</option>
                          {organizations
                            .filter(org => org.id !== 1 && org.id !== '1' && org.text?.toLowerCase() !== 'maphy corp')
                            .map(org => (
                              <option key={org.id} value={org.id}>{org.text}</option>
                            ))}
                        </Form.Select>
                      )}
                      <CsvExportButton
                        headers={[
                          t("people.name"),
                          t("people.email"),
                          t("people.first_name"),
                          t("people.last_name"),
                          t("people.group"),
                          t("people.talent_group_id"),
                          t("people.department_id"),
                          t("people.manager_id"),
                          t("people.asset"),
                          t("people.license"),
                          t("people.consumables"),
                          t("people.accessories"),
                          t("button.actions"),
                        ]}
                        data={csvData}
                        filename="people.csv"
                      />
                    </Form>
                  </div>
                </div>
                <div className="table-container">
                  <Table>
                    <thead>
                      <tr>
                        <th>{t("people.name")} </th>
                        <th onClick={() => onTableChange("email")}>
                          {t("people.email")}{" "}
                          <SortingIcon
                            columnName="email"
                            sortField={sortField}
                            sortOrder={sortOrder}
                            onTableChange={onTableChange}
                          />
                        </th>
                        <th onClick={() => onTableChange("first_name")}>
                          {t("people.first_name")}{" "}
                          <SortingIcon
                            columnName="first_name"
                            sortField={sortField}
                            sortOrder={sortOrder}
                            onTableChange={onTableChange}
                          />
                        </th>
                        <th onClick={() => onTableChange("last_name")}>
                          {t("people.last_name")}{" "}
                          <SortingIcon
                            columnName="last_name"
                            sortField={sortField}
                            sortOrder={sortOrder}
                            onTableChange={onTableChange}
                          />
                        </th>
                        <th>{t("people.group")} </th>
                        <th>Status</th>
                        <th>{t("people.talent_group_id")} </th>
                        <th>{t("people.department_id")} </th>
                        <th>{t("people.manager_id")}</th>
                        <th>{t("people.asset")}</th>
                        <th>{t("people.license")}</th>
                        <th>{t("people.consumables")}</th>
                        <th>{t("people.accessories")}</th>
                        <th className="right-radius">{t("button.actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.length > 0 ? (
                        data.map((items, index) => (
                          <tr key={index}>
                            <td className="text-nowrap">
                              <button
                                type="button"
                                className="btn btn-link"
                                onClick={() =>
                                  navigate(`/peopleDetails/${items?.id}`, {
                                    state: {
                                      rowData: items,
                                      activeTab: "info",
                                    },
                                  })
                                }
                              >
                                {items?.name}
                              </button>
                            </td>
                            <td>{items?.email}</td>
                            <td>{items?.first_name}</td>
                            <td>{items?.last_name}</td>
                            <td>{items?.groups?.rows?.[0]?.name}</td>
                            <td>
                              {items?.activated ? (
                                <span className="badge bg-success">Active</span>
                              ) : (
                                <span className="badge bg-secondary">Inactive</span>
                              )}
                            </td>
                            <td className="text-nowrap">
                              {items?.talentGroup?.name}
                            </td>
                            <td>{items?.department?.name}</td>
                            <td className="text-nowrap">
                              {items?.manager?.name}
                            </td>
                            <td>{items?.assets_count}</td>
                            <td>{items?.licenses_count}</td>
                            <td>{items?.consumables_count}</td>
                            <td>{items?.accessories_count}</td>

                            <td>
                              <div class="btn-group" role="group">
                                {!showDeleted &&
                                  items?.available_actions?.update &&
                                  canEditUser && (
                                    <span
                                      className="edit me-2"
                                      title="Edit"
                                      onClick={() => handleEditClick(items)}
                                    />
                                  )}
                                {!showDeleted &&
                                  items?.available_actions?.delete &&
                                  canDeleteUser && (
                                    <span
                                      className="delete me-2"
                                      title="Delete"
                                      onClick={() =>
                                        handleDeleteAlert(items?.id)
                                      }
                                    />
                                  )}
                                {showDeleted && (
                                  <Button
                                    as="input"
                                    type="button"
                                    value="Restore"
                                    className="restore"
                                    onClick={() =>
                                      handleRestoreAlert(items?.id)
                                    }
                                  />
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" align="center">
                            {t("alert.nodatafound")}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
                {totalPages > 0 && (
                  <CustomPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    itemsPerPage={sizePerPage}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                  />
                )}
                <AlertModal
                  onClick={showDeleted ? restoreItem : deleteItem}
                  show={show}
                  handleClose={handleClose}
                  modalType={showDeleted ? "restore" : "delete"}
                ></AlertModal>

                <Modal
                  show={showAddEditModal}
                  onHide={() => setShowAddEditModal(false)}
                  dialogClassName="premium-wizard-modal-dialog"
                  contentClassName="premium-wizard-modal-content"
                  size="xl"
                  backdrop="static"
                  keyboard={false}
                >
                  <Modal.Header closeButton>
                    <Modal.Title>
                      {editUserId ? t("people.update") : t("people.create")}
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <AddEditPeoples
                      key={modalKey}
                      isModal={true}
                      id={editUserId}
                      rowData={editUserRowData}
                      orgId={selectedOrg || localStorage.getItem("selectedOrgId")}
                      handleClose={() => setShowAddEditModal(false)}
                      onSuccess={() => {
                        setShowAddEditModal(false);
                        if (showDeleted) {
                          getDeletedDetails();
                        } else {
                          getDetails();
                        }
                      }}
                    />
                  </Modal.Body>
                </Modal>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default MainPage;
