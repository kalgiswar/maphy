import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
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
import AddEditLicense from "./addEditLicense";
import Modal from "react-bootstrap/Modal";

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
  const [initialized, setInitialized] = useState(false);
  const [selectedItemToCheckoutitems, setSelectedItemToCheckoutitems] =
    useState([]);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [licenseType, setLicenseType] = useState("");
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editLicenseId, setEditLicenseId] = useState(null);
  const [editLicenseMode, setEditLicenseMode] = useState(null);
  const [modalKey, setModalKey] = useState(0);
  const Domain = process.env.REACT_APP_API_URL;
  const location = useLocation();
  //var licenseType="all";

  useEffect(() => {
    if (location.pathname === "/License/expired") {
      setLicenseType("expired");
    } else if (location.pathname === "/License/goingToExpired") {
      setLicenseType("goingToExpire");
    } else {
      setLicenseType("all");
    }
  }, [location.pathname]);

  useEffect(() => {
    if (initialized) getDetails(licenseType);
  }, [currentPage, sizePerPage, sortField, sortOrder, licenseType]);

  useEffect(() => {
    if (initialized)
      getDetails(licenseType);
    else setInitialized(true);
  }, [searchText]);

  const handlePageChange = (page) => {
    const offset = (page - 1) * sizePerPage;
    setOffset(offset);
    setCurrentPage(page);
  };

  const handlePageSizeChange = (pageSize) => {
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

  const getDetails = async (type) => {
    var url =
      Domain +
      `/licenses?limit=${
        sizePerPage ? sizePerPage : 10
      }&offset=${offset}&search=${
        searchText ? searchText : ""
      }&sort=${sortField}&order=${sortOrder}&type=${licenseType}`;
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
    getDetails(licenseType);
  };

  const deleteItem = async () => {
    const url = Domain + "/licenses/" + itemTodelete;
    await axios
      .delete(url)
      .then((response) => {
        setShow(false);
        getDetails(licenseType);
        common.notify("S", t("alert.deleteSuccess"));
      })
      .catch(function (response) {
        common.notify("E", response);
      });
  };

  const handleEditClick = (id) => {
    setEditLicenseId(id);
    setEditLicenseMode("edit");
    setModalKey(prev => prev + 1);
    setShowAddEditModal(true);
  };

  const handleCloneClick = (id) => {
    setEditLicenseId(id);
    setEditLicenseMode("clone");
    setModalKey(prev => prev + 1);
    setShowAddEditModal(true);
  };

  const onTableChange = (filedname) => {
    setSortField(filedname);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const confirmCheckOut = () => {
    setShowCheckoutModal(false);

    navigate(`/checkOutLicense/${selectedItemToCheckoutitems?.id}`, {
      state: { rowData: selectedItemToCheckoutitems },
    });
  };

  const handleCheckOut = (items) => {
    setShowCheckoutModal(true);
    setSelectedItemToCheckoutitems(items);
  };

  const handleCloseCheckoutModal = (e) => {
    e.preventDefault();
    setShowCheckoutModal(false);
  };

  const csvData = data?.map((item) => [
    item?.name,
    item?.license_name,
    item?.license_email,
    item?.category?.name,
    item?.manufacturer?.name,
    item?.supplier?.name,
    item?.seats,
    item?.free_seats_count,
    item?.purchase_date?.formatted,
  ]);

  return (
    <div className="form">
      <Container fluid>
        <Row>
          <Col md={12}>
            <div>
              <div className="title d-flex justify-content-between">
                <div>
                  <h1> {t("license.License")}</h1>
                  {/* <p className="description">
                    Top upcoming projects across various cities South and East
                    India.
                  </p> */}
                </div>
                <div>
                  <Button
                    className="primary px-4"
                    type="button"
                    onClick={() => {
                      setEditLicenseId(null);
                      setEditLicenseMode(null);
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
                          t("license.License"),
                          t("license.license_email"),
                          t("license.license_name"),
                          t("license.category"),
                          t("license.supplier_id"),
                          t("license.manufacturer_id"),
                          t("license.total"),
                          t("license.avail"),
                          t("license.purchase_date"),
                        ]}
                        data={csvData}
                        filename="Audit.csv"
                      />
                    </Form>
                  </div>
                </div>
                <div className="table-container">
                  <Table>
                    <thead>
                      <tr>
                        <th onClick={() => onTableChange("name")}>
                          {t("license.License")}
                          <SortingIcon
                            columnName="name"
                            sortField={sortField}
                            sortOrder={sortOrder}
                            onTableChange={onTableChange}
                          />
                        </th>
                        <th> {t("license.license_email")} </th>
                        <th> {t("license.license_name")} </th>
                        <th> {t("license.category")} </th>
                        <th> {t("license.supplier_id")}</th>
                        <th> {t("license.manufacturer_id")} </th>
                        <th> {t("license.total")} </th>
                        <th> {t("license.avail")} </th>
                        <th> {t("license.purchase_date")}</th>
                        <th> {t("license.checkinout")}</th>
                        <th className="right-radius">{t("button.actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.length > 0 ? (
                        data.map((items, index) => (
                          <tr>
                            <td className="text-nowrap">
                              <button
                                type="button"
                                className="btn btn-link"
                                onClick={() =>
                                  navigate(`/licenseDetails/${items?.id}`, {
                                    state: {
                                      rowData: items,
                                      activeTab: "details",
                                    },
                                  })
                                }
                              >
                                {items?.name}
                              </button>
                            </td>
                            <td>{items?.license_email}</td>
                            <td>{items?.license_name}</td>
                            <td className="text-nowrap">
                              {items?.category?.name}
                            </td>
                            <td className="text-nowrap">
                              {items?.supplier?.name}
                            </td>
                            <td className="text-nowrap">
                              {items?.manufacturer?.name}
                            </td>
                            <td>{items?.seats}</td>
                            <td>{items?.free_seats_count}</td>
                            <td>{items?.purchase_date?.formatted}</td>
                            <td>
                              {items?.available_actions?.checkout === true && (
                                <Button
                                  as="input"
                                  type="button"
                                  value="Checkout"
                                  className="checkout"
                                  onClick={() => handleCheckOut(items)}
                                  disabled={
                                    items?.free_seats_count < 1 ||
                                    licenseType === "expired" ||
                                    licenseType === "goingToExpire"
                                  }
                                />
                              )}
                            </td>
                            {/* {licenseType === "all" && ( */}
                            <td>
                              <div class="btn-group" role="group">
                                {items?.available_actions?.update === true && (
                                  <span
                                    className="edit me-2"
                                    title="Edit"
                                    onClick={() => handleEditClick(items?.id)}
                                  />
                                )}
                                <span
                                  className="clone me-2"
                                  title="Clone"
                                  onClick={() => handleCloneClick(items?.id)}
                                />
                                {items?.free_seats_count == items.seats && (
                                  <span
                                    className="delete me-2"
                                    title="Delete"
                                    onClick={() => handleDeleteAlert(items?.id)}
                                  />
                                )}
                              </div>
                            </td>
                            {/* // )} */}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="11" align="center">
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
                <AlertModal
                  onClick={confirmCheckOut}
                  show={showCheckoutModal}
                  handleClose={handleCloseCheckoutModal}
                  modalType="checkout"
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
                      {editLicenseId ? (editLicenseMode === "clone" ? t("license.clonelicense") : t("license.updatelicense")) : t("license.createlicense")}
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <AddEditLicense
                      key={modalKey}
                      isModal={true}
                      id={editLicenseId}
                      mode={editLicenseMode}
                      handleClose={() => setShowAddEditModal(false)}
                      onSuccess={() => {
                        setShowAddEditModal(false);
                        getDetails(licenseType);
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
