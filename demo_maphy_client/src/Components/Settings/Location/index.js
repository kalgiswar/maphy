import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import AddEditLocations from "./addEditLocation";
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
import Spinner from "react-bootstrap/Spinner";

const MainPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [sizePerPage, setSizePerPage] = useState(10);
  const [offset, setOffset] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [show, setShow] = useState(false);
  const [itemTodelete, setItemTodelete] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editLocationId, setEditLocationId] = useState(null);
  const [modalKey, setModalKey] = useState(0);
  const Domain = process.env.REACT_APP_API_URL;

  const getDetails = async () => {
    setLoading(true);
    const url = `${Domain}/locations?limit=${sizePerPage}&offset=${offset}&search=${searchText}&sort=${sortField}&order=${sortOrder}`;
    try {
      const response = await axios.get(url);
      setData(response?.data?.rows || []);
      const totalPages = Math.ceil(response?.data?.total / sizePerPage);
      setTotalPages(totalPages);
    } catch (error) {
      common.notify("E", error);
    } finally {
      setLoading(false);
    }
  };

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
    const newOffset = (page - 1) * sizePerPage;
    setOffset(newOffset);
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
    const url = `${Domain}/locations/${itemTodelete}`;
    await axios
      .delete(url)
      .then((response) => {
        setShow(false);
        getDetails();
        const successMessage = response?.data?.message;
        common.notify("S", successMessage);
      })
      .catch(function (response) {
        common.notify("E", response);
      });
  };

  const handleEditClick = (id) => {
    setEditLocationId(id);
    setModalKey(prev => prev + 1);
    setShowAddEditModal(true);
  };

  const onTableChange = (fieldname) => {
    setSortField(fieldname);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const csvData = data.map((item) => [
    item.id,
    item.name,
    item.assets_count,
    item.assigned_assets_count,
    item.users_count,
    item.state,
    item.manager.name,
  ]);

  return (
    <div className="form">
      <Container fluid>
        <Row>
          <Col md={12}>
            <div>
              <div className="title d-flex justify-content-between">
                <div>
                  <h1> {t("location.name")} </h1>
                </div>
                <div>
                  <Button
                    className="primary px-4"
                    type="button"
                    onClick={() => {
                      setEditLocationId(null);
                      setModalKey(prev => prev + 1);
                      setShowAddEditModal(true);
                    }}
                  >
                    {t("button.create")}
                  </Button>
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
                      <CsvExportButton
                        headers={[
                          t("location.id"),
                          t("location.name"),
                          t("location.assets"),
                          t("location.assetsAssigned"),
                          t("location.people"),
                          t("location.state"),
                          t("location.manager_id"),
                        ]}
                        data={csvData}
                        filename="locations.csv"
                      />
                    </Form>
                  </div>
                </div>
                <div className="table-container">
                  <Table>
                    <thead>
                      <tr>
                        <th onClick={() => onTableChange("id")}>
                          {t("location.id")}{" "}
                          <SortingIcon
                            columnName="id"
                            sortField={sortField}
                            sortOrder={sortOrder}
                            onTableChange={onTableChange}
                          />
                        </th>
                        <th onClick={() => onTableChange("name")}>
                          {t("location.name")}{" "}
                          <SortingIcon
                            columnName="name"
                            sortField={sortField}
                            sortOrder={sortOrder}
                            onTableChange={onTableChange}
                          />
                        </th>
                        <th onClick={() => onTableChange("assets_count")}>
                          {t("location.assets")}{" "}
                          <SortingIcon
                            columnName="assets_count"
                            sortField={sortField}
                            sortOrder={sortOrder}
                            onTableChange={onTableChange}
                          />
                        </th>
                        <th
                          onClick={() => onTableChange("assigned_assets_count")}
                        >
                          {t("location.assetsAssigned")}{" "}
                          <SortingIcon
                            columnName="assigned_assets_count"
                            sortField={sortField}
                            sortOrder={sortOrder}
                            onTableChange={onTableChange}
                          />
                        </th>
                        <th onClick={() => onTableChange("users_count")}>
                          {t("location.people")}{" "}
                          <SortingIcon
                            columnName="users_count"
                            sortField={sortField}
                            sortOrder={sortOrder}
                            onTableChange={onTableChange}
                          />
                        </th>
                        <th onClick={() => onTableChange("state")}>
                          {t("location.state")}{" "}
                          <SortingIcon
                            columnName="state"
                            sortField={sortField}
                            sortOrder={sortOrder}
                            onTableChange={onTableChange}
                          />
                        </th>
                        <th onClick={() => onTableChange("manager.name")}>
                          {t("location.manager_id")}{" "}
                          <SortingIcon
                            columnName="manager.name"
                            sortField={sortField}
                            sortOrder={sortOrder}
                            onTableChange={onTableChange}
                          />
                        </th>
                        <th className="right-radius">{t("button.actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="7" className="text-center">
                            <Spinner animation="border" role="status">
                              <span className="visually-hidden">
                                Loading...
                              </span>
                            </Spinner>
                          </td>
                        </tr>
                      ) : data?.length > 0 ? (
                        data.map((items, index) => (
                          <tr key={index}>
                            <td className="blue">{items.id}</td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-link"
                                onClick={() =>
                                  navigate(`/locationDetails/${items?.id}`, {
                                    state: {
                                      rowData: items,
                                      activeTab: "assets",
                                    },
                                  })
                                }
                              >
                                {items?.name}
                              </button>
                            </td>
                            {/* <td>{items?.name}</td> */}
                            <td>{items?.assets_count}</td>
                            <td>
                              {/* <button
                                type="button"
                                className="btn btn-link"
                                onClick={() =>
                                  navigate(`/assignedTo/${items?.id}`, {
                                    state: {
                                      rowData: items,
                                    },
                                  })
                                }
                              >
                                {items?.assigned_assets_count}
                              </button> */}
                              {items?.assigned_assets_count}
                            </td>
                            <td>{items?.users_count}</td>
                            <td>{items?.state}</td>
                            <td>{items?.manager.name}</td>

                            <td>
                              {items?.available_actions?.update === true && (
                                <span
                                  className="edit me-2"
                                  title="Edit"
                                  onClick={() => handleEditClick(items?.id)}
                                />
                              )}
                              {items?.available_actions?.delete === true && (
                                <span
                                  className="delete me-2"
                                  title="Delete"
                                  onClick={() => handleDeleteAlert(items?.id)}
                                />
                              )}
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
                  onClick={deleteItem}
                  show={show}
                  handleClose={handleClose}
                  modalType="delete"
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
                      {editLocationId ? t("location.update") : t("location.create")}
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <AddEditLocations
                      key={modalKey}
                      isModal={true}
                      id={editLocationId}
                      handleClose={() => setShowAddEditModal(false)}
                      onSuccess={() => {
                        setShowAddEditModal(false);
                        getDetails();
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
