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
  const [data, setData] = useState([]);
  const location = useLocation();
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
  const [labelData, setLabelData] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editAssetId, setEditAssetId] = useState(null);
  const [editAssetMode, setEditAssetMode] = useState(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);
  const [bulkError, setBulkError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = React.useRef(null);
  const Domain = process.env.REACT_APP_API_URL;

  const path = location.pathname;
  let pageType;
  if (path.includes("/assets")) {
    pageType = "assets";
  }

  const getDetails = async () => {
    const url = `${Domain}/hardware?limit=${sizePerPage}&offset=${offset}&search=${searchText}&sort=${sortField}&order=${sortOrder}`;
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

  const fetchLabelData = async () => {
    const url = `${Domain}/labels`;
    try {
      const response = await axios.get(url);
      setLabelData(response.data.rows[0]);
    } catch (error) {
      common.notify("E", error);
    }
  };

  const deleteItem = async () => {
    const url = Domain + "/hardware/" + itemTodelete;
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
    item?.location?.name,
    item?.rtd_location?.name,
    item?.purchase_cost,
    item?.tax_value,
    item?.excluding_tax,
    // item?.hydrostatic_test_due_date?.date,
    // item?.capacity,
  ]);
  const handlePrintClick = (asset_tag, companyname, asset_tagheader) => {
    const printData = {
      asset_tag,
      companyname,
      asset_tagheader,
      labelData,
    };
    localStorage.setItem("printData", JSON.stringify(printData));
    window.open(`${window.location.origin}/assetQR`, "_blank");
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const extension = file.name.split('.').pop().toLowerCase();
      if (extension === 'xlsx' || extension === 'xls' || extension === 'csv') {
        setBulkFile(file);
        setBulkError(null);
      } else {
        setBulkError("Invalid file type. Please upload a CSV or Excel file (.csv, .xlsx, .xls).");
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const extension = file.name.split('.').pop().toLowerCase();
      if (extension === 'xlsx' || extension === 'xls' || extension === 'csv') {
        setBulkFile(file);
        setBulkError(null);
      } else {
        setBulkError("Invalid file type. Please upload a CSV or Excel file (.csv, .xlsx, .xls).");
      }
    }
  };

  const handleRemoveFile = () => {
    setBulkFile(null);
    setBulkResult(null);
    setBulkError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleBulkUploadSubmit = async (e) => {
    e.preventDefault();
    if (!bulkFile) return;

    setBulkUploading(true);
    setBulkError(null);
    setBulkResult(null);

    const formData = new FormData();
    formData.append("file", bulkFile);

    const url = `${Domain}/hardware/bulk-upload`;
    try {
      const response = await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      if (response?.data?.success) {
        setBulkResult(response.data);
        common.notify("S", response.data.message);
        getDetails();
      } else {
        setBulkError(response?.data?.message || "Failed to upload bulk assets.");
      }
    } catch (error) {
      setBulkError(error?.response?.data?.message || error.message || "An error occurred during upload.");
    } finally {
      setBulkUploading(false);
    }
  };
 
  return (
    <div className="form">
      <Container fluid>
        <Row>
          <Col md={12}>
            <div>
              <div className="title d-flex justify-content-between">
                <div>
                  <h1> {t("AssetsListall.allassets")}</h1>
                </div>
                <div className="d-flex align-items-center">
                  <Button
                    className="secondary px-4 me-2 btn btn-secondary text-white"
                    type="button"
                    onClick={() => {
                      setBulkFile(null);
                      setBulkResult(null);
                      setBulkError(null);
                      setShowBulkModal(true);
                    }}
                  >
                    Bulk Upload
                  </Button>
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
                          t("AssetsListall.location_id"),
                          t("AssetsListall.Default Location"),
                          t("AssetsListall.purchase_cost"),
                          t("AssetsListall.tax"),
                          t("AssetsListall.Excluding Tax"),
                          // t("AssetsListall.hydrostatic_test_due_date"),
                          // t("AssetsListall.capacity"),
                        ]}
                        data={csvData}
                        filename="AssetsListall.csv"
                        title="download Csv"
                      />
                    </Form>
                  </div>
                </div>
                <div className="table-container">
                  <Table>
                    <thead>
                      <tr>
                        <th onClick={() => onTableChange("AssetName")}>
                          {t("AssetsListall.AssetName")}{" "}
                          <SortingIcon
                            columnName="AssetName"
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
                        <th>{t("assetmodel.modelname")} </th>
                        {/* <th>{t("AssetsListall.asset_details")} </th> */}
                        <th>{t("AssetsListall.Assigned To")} </th>
                        <th>{t("AssetsListall.location_id")}</th>
                        <th>{t("AssetsListall.Default Location")}</th>
                        <th>{t("AssetsListall.purchase_cost")}</th>
                        <th>{t("AssetsListall.tax")}</th>
                        {/* <th>{t("AssetsListall.hydrostatic_test_due_date")}</th>
                        <th>{t("AssetsListall.capacity")}</th> */}
                        <th>{t("AssetsListall.Excluding Tax")}</th>
                        <th>{t("AssetsListall.image")}</th>
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
                            {/* <td>{items?.assetdetails}</td> */}
                            <td>
                              <button
                                type="button"
                                className="btn btn-link"
                                onClick={() =>
                                  navigate(
                                    `/assetmodels/details/${items?.model?.id}`,
                                  )
                                }
                              >
                                {items?.model?.name}
                              </button>
                            </td>
                            <td>{items?.assigned_to?.name}</td>
                            <td>{items?.location?.name}</td>
                            <td>{items?.rtd_location?.name}</td>
                            <td>{items?.purchase_cost}</td>
                            <td>{items?.tax_value}</td>
                            {/* <td>{items?.hydrostatic_test_due_date?.date}</td>
                            <td>{items?.capacity}</td> */}
                            <td>{items?.excluding_tax}</td>
                            {/* <td>{items?.image}</td> */}
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

                            <td>
                              <div class="btn-group" role="group">
                                {items?.available_actions?.update === true && (
                                  <span
                                    className="edit me-1"
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
                                <span
                                  className="print"
                                  title="Print"
                                  onClick={() =>
                                    handlePrintClick(
                                      items?.asset_tag,
                                      items?.company?.name,
                                      items?.asset_tag,
                                    )
                                  }
                                />
                                {items?.assigned_to &&
                                  !items?.assigned_to?.id && (
                                    <span
                                      className="delete me-1"
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
                          <td colSpan="13" align="center">
                            {t("alert.nodatafound")}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
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

              <Modal
                show={showBulkModal}
                onHide={() => setShowBulkModal(false)}
                size="md"
                backdrop="static"
                keyboard={false}
                centered
              >
                <Modal.Header closeButton>
                  <Modal.Title>Bulk Upload Assets</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Form onSubmit={handleBulkUploadSubmit}>
                    <div className="modern-upload-container">
                      {!bulkFile ? (
                        <div
                          className={`modern-dropzone ${dragActive ? "drag-active" : ""}`}
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                          onClick={onButtonClick}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            className="d-none"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileChange}
                          />
                          <div className="upload-icon-wrapper">
                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="upload-icon">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </div>
                          <h5>Drag & drop your CSV or Excel file here</h5>
                          <p className="mb-2">or <span className="browse-link">browse files</span> on your computer</p>
                          <span className="file-types-hint">Supports .csv, .xlsx, .xls formats</span>
                        </div>
                      ) : (
                        <div className="modern-selected-file-card">
                          <div className="file-icon-wrapper">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="excel-icon">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="file-details">
                            <div className="file-name">{bulkFile.name}</div>
                            <div className="file-size">{(bulkFile.size / 1024).toFixed(1)} KB</div>
                          </div>
                          <button type="button" className="remove-file-btn" onClick={handleRemoveFile} aria-label="Remove file">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}

                      <div className="modern-download-template-area flex-column mt-3">
                        <span className="fw-semibold text-secondary mb-2">Need a Template or Cafe Sample Data for Bulk Import?</span>
                        <div className="d-flex gap-2 flex-wrap justify-content-center">
                          <a
                            href={`${Domain}/uploads/sample_restaurant_assets_bulk_import.xlsx`}
                            download="sample_restaurant_assets_bulk_import.xlsx"
                            className="btn btn-sm btn-primary rounded-pill px-3 py-2 d-inline-flex align-items-center gap-1 shadow-sm"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download Cafe Sample Excel (.xlsx)
                          </a>
                          <a
                            href={`${Domain}/uploads/sample_restaurant_assets_bulk_import.csv`}
                            download="sample_restaurant_assets_bulk_import.csv"
                            className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-2 d-inline-flex align-items-center gap-1 shadow-sm"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download Cafe Sample CSV (.csv)
                          </a>
                          <a
                            href={`${Domain}/uploads/assets_bulk_import_template.xlsx`}
                            download="assets_bulk_import_template.xlsx"
                            className="btn btn-sm btn-outline-primary rounded-pill px-3 py-2 d-inline-flex align-items-center gap-1 shadow-sm"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Blank Template (.xlsx)
                          </a>
                        </div>
                      </div>
                    </div>
                    
                    {bulkUploading && <div className="text-info my-3 text-center">Uploading and parsing spreadsheet, please wait...</div>}
                    
                    {bulkError && <div className="text-danger my-3 text-center">{bulkError}</div>}
                    
                    {bulkResult && (
                      <div className="alert alert-info py-2 my-3">
                        <strong>Result:</strong> {bulkResult.message}
                        {bulkResult.errors && bulkResult.errors.length > 0 && (
                          <div className="mt-2" style={{ maxHeight: '150px', overflowY: 'auto', fontSize: '12px' }}>
                            <ul className="text-danger ps-3 mb-0">
                              {bulkResult.errors.map((err, idx) => <li key={idx}>{err}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="d-flex justify-content-end gap-2 mt-4">
                      <Button variant="secondary" className="px-4" onClick={() => setShowBulkModal(false)} disabled={bulkUploading}>
                        Close
                      </Button>
                      <Button variant="primary" className="primary px-4" type="submit" disabled={!bulkFile || bulkUploading}>
                        Upload
                      </Button>
                    </div>
                  </Form>
                </Modal.Body>
              </Modal>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default MainPage;
