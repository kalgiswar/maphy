import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import { useNavigate, useLocation } from "react-router-dom";
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
import AssetsListall from "./addEditDeployments";

const MainPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [sizePerPage, setSizePerPage] = useState(10);
  const [offset, setOffset] = useState("0");
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortField, setSortField] = useState("id");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemToDelete, setItemTodelete] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showCheckinnModal, setShowCheckinModal] = useState(false);
  const [checkoutId, setCheckoutId] = useState(null);
  const [checkinId, setCheckinId] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editAssetId, setEditAssetId] = useState(null);
  const [editAssetMode, setEditAssetMode] = useState(null);
  const Domain = process.env.REACT_APP_API_URL;

  const path = location.pathname;
  let pageType;
  if (path.includes("/rtd")) {
    pageType = "rtd";
  } else if (path.includes("/undeployable")) {
    pageType = "undeployable";
  } else if (path.includes("/deployed")) {
    pageType = "deployed";
  } else {
    pageType = "default";
  }

  const getDetails = async () => {
    let url;
    if (pageType === "rtd") {
      url = `${Domain}/hardware?status=rtd&limit=${sizePerPage}&offset=${offset}&search=${searchText}&sort=${sortField}&order=${sortOrder}`;
    } else if (pageType === "undeployable") {
      url = `${Domain}/hardware?status=undeployable&limit=${sizePerPage}&offset=${offset}&search=${searchText}&sort=${sortField}&order=${sortOrder}`;
    } else {
      url = `${Domain}/hardware?status=deployed&limit=${sizePerPage}&offset=${offset}&search=${searchText}&sort=${sortField}&order=${sortOrder}`;
    }
    try {
      const response = await axios.get(url);
      console.log("ressss:", response);
      setData(response?.data?.rows || []);
      const totalPages = Math.ceil(response?.data?.total / sizePerPage);
      setTotalPages(totalPages);
    } catch (error) {
      common.notify("E", error);
    }
  };

  useEffect(() => {
    getDetails();
  }, [location.pathname]);

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
  };

  const handleDeleteAlert = (id) => {
    setShowDeleteModal(true);
    setItemTodelete(id);
  };

  const handleCloseDeleteModal = (e) => {
    e.preventDefault();
    setShowDeleteModal(false);
  };

  const handleCloseCheckinModal = (e) => {
    e.preventDefault();
    setShowCheckinModal(false);
  };

  const handleCloseCheckoutModal = (e) => {
    e.preventDefault();
    setShowCheckoutModal(false);
  };

  const handleInputChange = (event) => {
    setSearchText(event.target.value);
  };

  const onSearchClick = () => {
    setOffset(0);
    setCurrentPage(1);
    getDetails();
  };

  const deleteItem = async () => {
    const url = Domain + "/hardware/" + itemToDelete;
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
    setEditAssetId(id);
    setEditAssetMode("edit");
    setShowAddEditModal(true);
  };

  const handleCloneClick = (id) => {
    setEditAssetId(id);
    setEditAssetMode("clone");
    setShowAddEditModal(true);
  };

  const onTableChange = (fieldname) => {
    setSortField(fieldname);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const getHeaderTitle = () => {
    switch (pageType) {
      case "rtd":
        return t("AssetsListall.deployableassets");
      case "undeployable":
        return t("AssetsListall.undeployableassets");
      case "deployed":
        return t("AssetsListall.deployedassets");
      default:
        return t("AssetsListall.assets");
    }
  };

  const handleCheckOut = (id) => {
    setCheckoutId(id);
    setShowCheckoutModal(true);
  };

  const confirmCheckOut = () => {
    setShowCheckoutModal(false);
    navigate(`/checkOutDeployable/${checkoutId}`);
  };

  const handleCheckIn = (id) => {
    setCheckinId(id);
    setShowCheckinModal(true);
  };

  const confirmCheckIn = () => {
    setShowCheckinModal(false);
    navigate(`/checkInAssets/${checkinId}`);
  };
  const handleImageClick = (url) => {
    setSelectedImageUrl(`${Domain}/${url}`);
    setShowImageModal(true);
  };
  const csvData = data.map((item) => [
    item?.name,
    item?.asset_tag,
    item?.serial,
    item?.category?.name,
    item?.status_label?.name,
    item?.assetdetails,
    item?.assigned_to?.name,
    item?.model_number,
    item?.location?.name,
    item?.rtd_location?.name,
    item?.purchase_cost,
    // item?.hydrostatic_test_due_date?.date,
    // item?.capacity,
  ]);
  return (
    <div className="form">
      <Container fluid>
        <Row>
          <Col md={12}>
            <div>
              <div className="title d-flex justify-content-between">
                <div>
                  <h1>{getHeaderTitle()}</h1>
                </div>
                <div>
                  <Button
                    className="primary px-4"
                    type="button"
                    onClick={() => {
                      setEditAssetId(null);
                      setEditAssetMode(null);
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
                          t("AssetsListall.AssetName"),
                          t("AssetsListall.asset_tag"),
                          t("AssetsListall.serial"),
                          t("AssetsListall.category"),
                          t("AssetsListall.status_id"),
                          t("AssetsListall.asset_details"),
                          t("AssetsListall.Assigned To"),
                          t("AssetsListall.model_number"),
                          t("AssetsListall.location_id"),
                          t("AssetsListall.Default Location"),
                          t("AssetsListall.purchase_cost"),
                          // t("AssetsListall.hydrostatic_test_due_date"),
                          // t("AssetsListall.capacity"),
                        ]}
                        data={csvData}
                        filename="AssetsListall.csv"
                      />
                    </Form>
                  </div>
                </div>
                <div className="table-container">
                  <Table>
                    <thead>
                      <tr>
                        <th onClick={() => onTableChange("name")}>
                          {t("AssetsListall.AssetName")}{" "}
                          <SortingIcon
                            columnName="name"
                            sortField={sortField}
                            sortOrder={sortOrder}
                            onTableChange={onTableChange}
                          />
                        </th>
                        <th onClick={() => onTableChange("asset_tag")}>
                          {t("AssetsListall.asset_tag")}{" "}
                          <SortingIcon
                            columnName="asset_tag"
                            sortField={sortField}
                            sortOrder={sortOrder}
                            onTableChange={onTableChange}
                          />
                        </th>
                        <th>{t("AssetsListall.serial")}</th>
                        <th>{t("AssetsListall.category")}</th>
                        <th>{t("AssetsListall.status_id")} </th>
                        <th>{t("AssetsListall.asset_details")} </th>
                        {pageType === "deployed" && (
                          <th>{t("AssetsListall.Assigned To")} </th>
                        )}
                        {pageType === "undeployable" && (
                          <th>{t("AssetsListall.model_number")} </th>
                        )}
                        {pageType === "rtd" && (
                          <th>{t("AssetsListall.location_id")}</th>
                        )}
                        <th>{t("AssetsListall.Default Location")}</th>
                        <th>{t("AssetsListall.purchase_cost")}</th>
                        {/* <th>{t("AssetsListall.hydrostatic_test_due_date")}</th>
                        <th>{t("AssetsListall.capacity")}</th> */}
                        <th>{t("AssetsListall.image")}</th>
                        {pageType !== "undeployable" && (
                          <th>{t("AssetsListall.checkincheckout")}</th>
                        )}
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
                                  navigate(`/assetDetails/${items?.id}`, {
                                    state: {
                                      pageType,
                                      rowData: items,
                                      activeTab: "info",
                                    },
                                  })
                                }
                              >
                                {items?.name}
                              </button>
                            </td>
                            <td>{items?.asset_tag}</td>
                            <td>{items?.serial}</td>
                            <td className="text-nowrap">
                              {items?.category?.name}
                            </td>
                            <td>{items?.status_label?.name}</td>
                            <td>{items?.assetdetails}</td>
                            {pageType === "deployed" && (
                              <td>{items?.assigned_to?.name}</td>
                            )}
                            {pageType === "undeployable" && (
                              <td>{items?.model_number}</td>
                            )}
                            {pageType === "rtd" && (
                              <td>{items?.location?.name}</td>
                            )}
                            <td>{items?.rtd_location?.name}</td>
                            <td>{items?.purchase_cost}</td>
                            {/* <td>{items?.hydrostatic_test_due_date?.date}</td>
                            <td>{items?.capacity}</td> */}
                            <td>
                              {items?.image ? (
                                <img
                                  src={`${Domain}/${items.image}`}
                                  alt="Asset"
                                  style={{
                                    width: "40px",
                                    height: "40px",
                                    objectFit: "cover",
                                  }}
                                  onClick={() => handleImageClick(items.image)}
                                />
                              ) : (
                                "-"
                              )}
                            </td>
                            {pageType !== "undeployable" && (
                              <td>
                                {pageType === "rtd" && (
                                  <Button
                                    as="input"
                                    type="button"
                                    value="Checkout"
                                    className="checkout"
                                    onClick={() => handleCheckOut(items?.id)}
                                  />
                                )}
                                {pageType === "deployed" && (
                                  <Button
                                    as="input"
                                    type="button"
                                    value="Checkin"
                                    className="checkin"
                                    onClick={() => handleCheckIn(items?.id)}
                                  />
                                )}
                              </td>
                            )}
                            <td>
                              <div class="btn-group" role="group">
                                {items?.available_actions?.update === true && (
                                  <span
                                    className="edit me-2"
                                    title="Edit"
                                    onClick={() => handleEditClick(items?.id)}
                                  />
                                )}
                                {items?.available_actions?.clone === true && (
                                  <span
                                    className="clone me-2"
                                    title="Clone"
                                    onClick={() => handleCloneClick(items?.id)}
                                  />
                                )}
                                {items?.assigned_to &&
                                  !items?.assigned_to?.id && (
                                    <span
                                      className="delete me-2"
                                      title="Delete"
                                      onClick={() =>
                                        handleDeleteAlert(items?.id)
                                      }
                                    />
                                  )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="12" align="center">
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
                <Modal
                  show={showImageModal}
                  onHide={() => setShowImageModal(false)}
                  size="lg"
                >
                  <Modal.Header closeButton></Modal.Header>
                  <Modal.Body className="text-center">
                    <img
                      src={selectedImageUrl}
                      alt="Full Preview"
                      style={{ maxWidth: "100%", maxHeight: "80vh" }}
                    />
                  </Modal.Body>
                </Modal>
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
                <AlertModal
                  onClick={confirmCheckIn}
                  show={showCheckinnModal}
                  handleClose={handleCloseCheckinModal}
                  modalType="checkin"
                  checkinId={checkinId}
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
                      {editAssetId ? (editAssetMode === "clone" ? t("AssetsListall.cloneasset") : t("AssetsListall.updateasset")) : t("AssetsListall.createasset")}
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <AssetsListall
                      isModal={true}
                      id={editAssetId}
                      mode={editAssetMode}
                      pageType={pageType}
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
