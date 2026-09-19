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
import AddEditComponents from "./addEditComponents";

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
  const [labelData, setLabelData] = useState(null); //label data
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editComponentId, setEditComponentId] = useState(null);
  const [modalKey, setModalKey] = useState(0);
  const Domain = process.env.REACT_APP_API_URL;

  useEffect(() => {
    getDetails();
    fetchLabelData(); //label data
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
      `/components?limit=${
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

  //label design
  const fetchLabelData = async () => {
    const url = `${Domain}/labels`;
    try {
      const response = await axios.get(url);
      setLabelData(response.data.rows[0]);
    } catch (error) {
      console.error("There was an error fetching the label data!", error);
    }
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
    const url = Domain + "/components/" + itemTodelete;
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
    setEditComponentId(id);
    setModalKey(prev => prev + 1);
    setShowAddEditModal(true);
  };

  const handleCheckOut = (id) => {
    setCheckoutId(id);
    setShowCheckoutModal(true);
  };

  const confirmCheckOut = () => {
    setShowCheckoutModal(false);
    navigate(`/checkOutComponents/${checkoutId}`);
  };

  const onTableChange = (filedname) => {
    setSortField(filedname);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };
  const csvData = data.map((item) => [
    item?.name,
    item?.category?.name,
    item?.company?.name,
    item?.qty,
    item?.remaining,
    item?.min_amt,
    item?.purchase_cost,
  ]);

  const handlePrintClick = (
    name,
    categoryname,
    locationname,
    serial,
    companyname,
  ) => {
    const printData = {
      name,
      categoryname,
      locationname,
      serial,
      companyname,
      labelData,
    };
    localStorage.setItem("printData", JSON.stringify(printData));
    window.open(`${window.location.origin}/QRPage`, "_blank");
  };
  return (
    <div className="form">
      <Container fluid>
        <Row>
          <Col md={12}>
            <div>
              <div className="title d-flex justify-content-between">
                <div>
                  <h1> {t("component.componentname")}</h1>
                </div>
                <div>
                  <Button
                    className="primary px-4"
                    type="button"
                    onClick={() => {
                      setEditComponentId(null);
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
                          t("component.name"),
                          t("component.category_id"),
                          t("component.company_id"),
                          t("component.total"),
                          t("component.remaining"),
                          t("component.min_amts"),
                          t("component.purchase_cost"),
                        ]}
                        data={csvData}
                        filename="component.csv"
                      />
                    </Form>
                  </div>
                </div>
                <div className="table-container">
                  <Table>
                    <thead>
                      <tr>
                        <th onClick={() => onTableChange("name")}>
                          {t("component.names")}{" "}
                          <SortingIcon
                            columnName="name"
                            sortField={sortField}
                            sortOrder={sortOrder}
                          />
                        </th>
                        <th>{t("component.category_id")}</th>
                        <th>{t("component.company_id")}</th>
                        <th>{t("component.total")}</th>
                        <th>{t("component.remaining")}</th>
                        <th>{t("component.min_amts")}</th>
                        <th>{t("component.purchase_cost")}</th>
                        <th>{t("component.check_in_out")}</th>
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
                                  navigate(`/componentsDetails/${items?.id}`, {
                                    state: { rowData: items },
                                  })
                                }
                              >
                                {items?.name}
                              </button>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-link"
                                onClick={() =>
                                  navigate(
                                    `/componentsCategory/${items?.category?.id}`,
                                    {
                                      state: { rowData: items },
                                    },
                                  )
                                }
                              >
                                {items?.category?.name}
                              </button>
                            </td>
                            <td>{items?.company?.name}</td>
                            <td>{items?.qty}</td>
                            <td>{items?.remaining}</td>
                            <td>{items?.min_amt}</td>
                            <td>{items?.purchase_cost}</td>
                            <td>
                              {items?.user_can_checkout === true && (
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

                              <span
                                className="print"
                                title="Print"
                                onClick={() =>
                                  handlePrintClick(
                                    items?.name,
                                    items?.category?.name,
                                    items?.location?.name,
                                    items?.serial,
                                    items?.company?.name,
                                  )
                                }
                              />
                              {items?.remaining == items?.qty && (
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
                      {editComponentId ? t("component.update") : t("component.create")}
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <AddEditComponents
                      key={modalKey}
                      isModal={true}
                      id={editComponentId}
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
