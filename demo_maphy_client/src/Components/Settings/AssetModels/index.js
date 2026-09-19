import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import AddAssetModels from "./addEditAssetmodels";
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
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortField, setSortField] = useState("id");
  const [currentPage, setCurrentPage] = useState(1);
  const [show, setShow] = useState(false);
  const [itemToDelete, setItemToDelete] = useState("");
  const [itemToRestore, setItemToRestore] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editAssetModelId, setEditAssetModelId] = useState(null);
  const [cloneMode, setCloneMode] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const Domain = process.env.REACT_APP_API_URL;

  const getDetails = async () => {
    setLoading(true);
    const url = `${Domain}/models?limit=${sizePerPage}&offset=${offset}&search=${searchText}&sort=${sortField}&order=${sortOrder}`;
    try {
      const response = await axios.get(url);
      setData(response?.data?.rows);
      const totalPages = Math.ceil(response?.data?.total / sizePerPage);
      setTotalPages(totalPages);
    } catch (error) {
      common.notify("E", error);
    } finally {
      setLoading(false);
    }
  };

  const getDeletedDetails = async () => {
    const url = `${Domain}/models?status=deleted&limit=${sizePerPage}&offset=${offset}&search=${searchText}&sort=${sortField}&order=${sortOrder}`;
    try {
      const response = await axios.get(url);
      setData(response?.data?.rows);
      const totalPages = Math.ceil(response?.data?.total / sizePerPage);
      setTotalPages(totalPages);
    } catch (error) {
      common.notify("E", error);
    }
  };

  useEffect(() => {
    if (showDeleted) {
      getDeletedDetails();
    } else {
      getDetails();
    }
  }, [currentPage, sizePerPage, sortField, sortOrder, showDeleted]);

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
    setItemToDelete(id);
  };

  const handleRestoreAlert = (id) => {
    setShow(true);
    setItemToRestore(id);
  };

  const handleClose = (e) => {
    e.preventDefault();
    setShow(false);
  };

  const onSearchClick = () => {
    setOffset(0);
    setCurrentPage(1);
    if (showDeleted) {
      getDeletedDetails();
    } else {
      getDetails();
    }
  };

  const deleteItem = async () => {
    const url = `${Domain}/models/${itemToDelete}`;
    try {
      const response = await axios.delete(url);
      setShow(false);
      // Adjust currentPage if necessary
      if (data.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        if (showDeleted) {
          getDeletedDetails();
        } else {
          getDetails();
        }
      }
      const successMessage = response?.data?.message;
      common.notify("S", successMessage);
    } catch (error) {
      common.notify("E", error);
    }
  };

  const restoreItem = async () => {
    const url = `${Domain}/models/restore/${itemToRestore}`;
    try {
      const response = await axios.put(url);
      setShow(false);
      getDeletedDetails();
      const successMessage = response?.data?.message;
      common.notify("S", successMessage);
    } catch (error) {
      common.notify("E", error);
    }
  };

  const handleEditClick = (id) => {
    setEditAssetModelId(id);
    setCloneMode(false);
    setModalKey(prev => prev + 1);
    setShowAddEditModal(true);
  };
  const handleCloneClick = (id) => {
    setEditAssetModelId(id);
    setCloneMode(true);
    setModalKey(prev => prev + 1);
    setShowAddEditModal(true);
  };
  const onTableChange = (fieldName) => {
    setSortField(fieldName);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const toggleShowDeleted = () => {
    setShowDeleted((prev) => !prev);
    setCurrentPage(1);
    setOffset(0);
  };
  const csvData = data.map((item) => [
    item?.name,
    item?.model_number,
    item?.assets_count,
    item?.manufacturer?.name,
    item?.depreciation?.name,
    item?.category?.name,
  ]);

  return (
    <div className="form">
      <Container fluid>
        <Row>
          <Col md={12}>
            <div>
              <div className="title d-flex justify-content-between">
                <div>
                  <h1>{t("assetmodel.name")}</h1>
                </div>
                <div>
                  <Button
                    className="me-2"
                    type="button"
                    onClick={toggleShowDeleted}
                  >
                    {showDeleted
                      ? t("button.viewmodels")
                      : t("button.viewdeleted")}
                  </Button>
                  <Button
                    className="primary px-4"
                    type="button"
                    onClick={() => {
                      setEditAssetModelId(null);
                      setCloneMode(false);
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
                        onChange={(e) => setSearchText(e.target.value)}
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
                          t("assetmodel.modelname"),
                          t("assetmodel.number"),
                          t("assetmodel.asset"),
                          t("assetmodel.manufacture_number"),
                          t("assetmodel.depreciation_id"),
                          t("assetmodel.category_id"),
                        ]}
                        data={csvData}
                        filename="activityreports.csv"
                      />
                    </Form>
                  </div>
                </div>
                <div className="table-container">
                  <Table>
                    <thead>
                      <tr>
                        <th onClick={() => onTableChange("name")}>
                          {t("assetmodel.modelname")}
                          <SortingIcon
                            columnName="name"
                            sortField={sortField}
                            sortOrder={sortOrder}
                          />
                        </th>
                        <th onClick={() => onTableChange("number")}>
                          {t("assetmodel.number")}
                          <SortingIcon
                            columnName="number"
                            sortField={sortField}
                            sortOrder={sortOrder}
                          />
                        </th>
                        <th onClick={() => onTableChange("assets_count")}>
                          {t("assetmodel.asset")}
                          <SortingIcon
                            columnName="assets_count"
                            sortField={sortField}
                            sortOrder={sortOrder}
                          />
                        </th>
                        <th onClick={() => onTableChange("manufacturer")}>
                          {t("assetmodel.manufacture_number")}
                          <SortingIcon
                            columnName="manufacturer"
                            sortField={sortField}
                            sortOrder={sortOrder}
                          />
                        </th>
                        <th onClick={() => onTableChange("depreciation")}>
                          {t("assetmodel.depreciation_id")}
                          <SortingIcon
                            columnName="depreciation"
                            sortField={sortField}
                            sortOrder={sortOrder}
                          />
                        </th>
                        <th onClick={() => onTableChange("category")}>
                          {t("assetmodel.category_id")}
                          <SortingIcon
                            columnName="category"
                            sortField={sortField}
                            sortOrder={sortOrder}
                          />
                        </th>
                        <th className="right-radius">
                          {t("assetmodel.actions")}
                        </th>
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
                            <td>
                              <button
                                type="button"
                                className="btn btn-link"
                                onClick={() =>
                                  navigate(
                                    `/assetmodels/details/${items?.id}`,
                                    {
                                      state: { rowData: items },
                                    },
                                  )
                                }
                              >
                                {items?.name}
                              </button>
                            </td>
                            <td>{items?.model_number}</td>
                            <td>{items?.assets_count}</td>
                            <td>{items?.manufacturer?.name}</td>
                            <td>{items?.depreciation?.name}</td>
                            <td>{items?.category?.name}</td>
                            <td>
                              {!showDeleted &&
                                items?.available_actions?.update === true && (
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
                              {!showDeleted && items?.assets_count <= 0 && (
                                <span
                                  className="delete me-2"
                                  title="Delete"
                                  onClick={() => handleDeleteAlert(items?.id)}
                                />
                              )}
                              {showDeleted && (
                                <Button
                                  as="input"
                                  type="button"
                                  value="Restore"
                                  className="restore"
                                  onClick={() => handleRestoreAlert(items?.id)}
                                />
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" align="center">
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
                      {editAssetModelId
                        ? cloneMode
                          ? t("assetmodel.clonedept")
                          : t("assetmodel.updatedept")
                        : t("assetmodel.createdept")}
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <AddAssetModels
                      key={modalKey}
                      isModal={true}
                      id={editAssetModelId}
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
