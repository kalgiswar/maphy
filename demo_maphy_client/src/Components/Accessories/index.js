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
import AddEditAccessories from "./addEditAccessories";
// import QRCodePage from "./Qrcodepage";
// import ReactDOM from "react-dom";

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
  const [editAccessoryId, setEditAccessoryId] = useState(null);
  const [modalKey, setModalKey] = useState(0);

  const Domain = process.env.REACT_APP_API_URL;

  useEffect(() => {
    getDetails();
    fetchLabelData();
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
      `/accessories?limit=${
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
    const url = Domain + "/accessories/" + itemTodelete;
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
    setEditAccessoryId(id);
    setModalKey(prev => prev + 1);
    setShowAddEditModal(true);
  };

  const handleCheckOut = (id) => {
    setCheckoutId(id);
    setShowCheckoutModal(true);
  };

  const confirmCheckOut = () => {
    setShowCheckoutModal(false);
    navigate(`/checkOutAccessories/${checkoutId}`);
  };

  const onTableChange = (filedname) => {
    setSortField(filedname);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const csvData = data.map((item) => [
    item?.name,
    item?.category?.name,
    item?.qty,
    item?.remaining_qty,
    item?.manufacturer?.name,
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
                  <h1> {t("accessory.accessory")}</h1>
                </div>
                <div>
                  <Button
                    className="primary px-4"
                    type="submit"
                    onClick={() => {
                      setEditAccessoryId(null);
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
                          t("accessory.name"),
                          t("accessory.category_id"),
                          t("accessory.Quantity"),
                          t("accessory.avail"),
                          t("accessory.manufacturer_id"),
                        ]}
                        data={csvData}
                        filename="accessory.csv"
                      />
                    </Form>
                  </div>
                </div>
                <div className="table-container">
                  <Table>
                    <thead>
                      <tr>
                        <th onClick={() => onTableChange("name")}>
                          {t("accessory.name")}{" "}
                          <SortingIcon
                            columnName="name"
                            sortField={sortField}
                            sortOrder={sortOrder}
                          />
                        </th>
                        <th onClick={() => onTableChange("category_id")}>
                          {t("accessory.category_id")}{" "}
                          <SortingIcon
                            columnName="category_id"
                            sortField={sortField}
                            sortOrder={sortOrder}
                            onTableChange={onTableChange}
                          />
                        </th>
                        <th>{t("accessory.Quantity")}</th>
                        <th>{t("accessory.avail")}</th>
                        <th>{t("accessory.manufacturer_id")}</th>
                        <th>{t("accessory.check_in_out")}</th>
                        <th className="right-radius">{t("button.actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.length > 0 ? (
                        data.map((items, index) => (
                          <tr>
                            <td>
                              <div>
                                <button
                                  type="button"
                                  className="btn btn-link"
                                  onClick={() =>
                                    navigate(
                                      `/accessoriesdetails/${items?.id}`,
                                      {
                                        state: { rowData: items },
                                      },
                                    )
                                  }
                                >
                                  {items?.name}
                                </button>
                              </div>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-link"
                                onClick={() =>
                                  navigate(
                                    `/categoryaccessory/${items?.category?.id}`,
                                    {
                                      state: { rowData: items },
                                    },
                                  )
                                }
                              >
                                {items?.category?.name}
                              </button>
                            </td>
                            <td>{items?.qty}</td>
                            <td>{items?.remaining_qty}</td>
                            <td>{items?.manufacturer?.name}</td>
                            <td>
                              <Button
                                as="input"
                                type="button"
                                value="Checkout"
                                className="Checkout"
                                onClick={() => handleCheckOut(items?.id)}
                                disabled={items?.remaining_qty <= 0}
                              />
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
                                    items?.model_number,
                                    items?.company?.name,
                                  )
                                }
                              />
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
                      {editAccessoryId ? t("accessory.updateaccessory") : t("accessory.createaccessory")}
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <AddEditAccessories
                      key={modalKey}
                      isModal={true}
                      id={editAccessoryId}
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
