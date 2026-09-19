import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router-dom";
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
import Modal from "react-bootstrap/Modal";
import AddEditConsumables from "./addEditConsumables";

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
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [itemTodelete, setItemTodelete] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [checkoutId, setCheckoutId] = useState(null);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editConsumableId, setEditConsumableId] = useState(null);
  const [modalKey, setModalKey] = useState(0);
  const Domain = process.env.REACT_APP_API_URL;

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

  const handleCloseCheckoutModal = (e) => {
    e.preventDefault();
    setShowCheckoutModal(false);
  };

  const getDetails = async () => {
    var url =
      Domain +
      `/consumables?limit=${
        sizePerPage ? sizePerPage : 10
      }&offset=${offset}&search=${
        searchText ? searchText : ""
      }&sort=${sortField}&order=${sortOrder}`;
    await axios
      .get(url)
      .then((response) => {
        setData(response?.data?.rows);
        const totalPages = Math.ceil(response?.data?.total / sizePerPage);
        setTotalPages(totalPages);
      })
      .catch(function (response) {
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
    const url = Domain + "/consumables/" + itemTodelete;
    await axios
      .delete(url)
      .then((response) => {
        setShowDeleteModal(false);
        getDetails();
        common.notify("S", response?.data?.message);
      })
      .catch(function (response) {
        common.notify("E", response);
      });
  };

  const handleEditClick = (id) => {
    setEditConsumableId(id);
    setModalKey(prev => prev + 1);
    setShowAddEditModal(true);
  };

  const onTableChange = (filedname) => {
    setSortField(filedname);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleCheckOut = (id) => {
    setCheckoutId(id);
    setShowCheckoutModal(true);
  };

  const confirmCheckOut = () => {
    setShowCheckoutModal(false);
    navigate(`/checkOutConsumables/${checkoutId}`);
  };
  const csvData = data.map((item) => [
    item?.name,
    item?.category?.name,
    item?.model_number,
    item?.qty,
    item?.remaining,
    item?.min_qty,
    item?.location?.name,
    item?.purchase_cost,
  ]);

  return (
    <div className="form">
      <Container fluid>
        <Row>
          <Col md={12}>
            <div>
              <div className="title d-flex justify-content-between">
                <div>
                  <h1> {t("consumable.consumablename")}</h1>
                  {/* <p className="description">
                    Top upcoming projects across various cities South and East
                    India.
                  </p> */}
                </div>
                <div>
                  <Button
                    className="primary px-4"
                    type="submit"
                    onClick={() => {
                      setEditConsumableId(null);
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
                          t("consumable.name"),
                          t("consumable.category_id"),
                          t("consumable.model"),
                          t("consumable.total"),
                          t("consumable.remaining"),
                          t("consumable.min_qty"),
                          t("consumable.location_id"),
                          t("consumable.purchase_cost"),
                        ]}
                        data={csvData}
                        filename="consumable.csv"
                      />
                    </Form>
                  </div>
                </div>
                <div className="table-container">
                  <Table>
                    <thead>
                      <tr>
                        <th onClick={() => onTableChange("name")}>
                          {t("consumable.name")}{" "}
                          <SortingIcon
                            columnName="name"
                            sortField={sortField}
                            sortOrder={sortOrder}
                          />
                        </th>
                        <th>{t("consumable.category_id")}</th>
                        <th>{t("consumable.model")}</th>
                        <th>{t("consumable.total")}</th>
                        <th>{t("consumable.remaining")}</th>
                        <th>{t("consumable.min_qty")}</th>
                        <th>{t("consumable.location_id")}</th>
                        <th>{t("consumable.purchase_cost")}</th>
                        <th>{t("consumable.check_in_out")}</th>
                        <th className="right-radius">{t("button.actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.length > 0 ? (
                        data.map((items, index) => (
                          <tr>
                            <td>
                              <button
                                type="button"
                                className="btn btn-link"
                                onClick={() =>
                                  navigate(`/consumablesDetails/${items?.id}`, {
                                    state: { rowData: items },
                                  })
                                }
                              >
                                {items?.name}
                              </button>
                            </td>{" "}
                            <td>
                              <button
                                type="button"
                                className="btn btn-link"
                                onClick={() =>
                                  navigate(
                                    `/consumablesCategory/${items?.category?.id}`,
                                    {
                                      state: { rowData: items },
                                    },
                                  )
                                }
                              >
                                {items?.category?.name}
                              </button>
                            </td>{" "}
                            <td>{items?.model_number}</td>
                            <td>{items?.qty}</td>
                            <td>{items?.remaining}</td>
                            <td>{items?.min_qty}</td>
                            <td>{items?.location?.name}</td>
                            <td>{items?.purchase_cost}</td>
                            <td>
                              {items?.available_actions?.checkout === true && (
                                <Button
                                  as="input"
                                  type="button"
                                  value="Checkout"
                                  className="Checkout"
                                  onClick={() => handleCheckOut(items?.id)}
                                  disabled={items.remaining <= 0}
                                />
                              )}
                            </td>
                            <td>
                              {items?.available_actions?.update === true && (
                                <span
                                  className="edit me-2"
                                  title="Edit"
                                  onClick={() => handleEditClick(items?.id)}
                                />
                              )}
                              {items?.remaining_qty == items?.qty && (
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
                  show={showDeleteModal}
                  handleClose={handleCloseDeleteModal}
                  modalType="delete"
                ></AlertModal>
                <AlertModal
                  onClick={confirmCheckOut}
                  show={showCheckoutModal}
                  handleClose={handleCloseCheckoutModal}
                  modalType="checkout"
                  checkoutId={checkoutId}
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
                      {editConsumableId ? t("consumable.update") : t("consumable.create")}
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <AddEditConsumables
                      key={modalKey}
                      isModal={true}
                      id={editConsumableId}
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
