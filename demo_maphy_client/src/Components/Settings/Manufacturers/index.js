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
import Spinner from "react-bootstrap/Spinner";

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
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const Domain = process.env.REACT_APP_API_URL;

  const getDetails = async () => {
    setLoading(true);
    const url = `${Domain}/manufacturers?limit=${sizePerPage}&offset=${offset}&search=${searchText}&sort=${sortField}&order=${sortOrder}`;
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

  const getDeletedDetails = async () => {
    const url = `${Domain}/manufacturers?deleted=true&limit=${sizePerPage}&offset=${offset}&search=${searchText}&sort=${sortField}&order=${sortOrder}`;
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
    setItemTodelete(id);
  };

  const handleRestoreAlert = (id) => {
    setShow(true);
    setItemToRestore(id);
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
    if (showDeleted) {
      getDeletedDetails();
    } else {
      getDetails();
    }
  };

  const deleteItem = async () => {
    const url = Domain + "/manufacturers/" + itemTodelete;
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

  const restoreItem = async () => {
    const url = `${Domain}/manufacturers/restore/${itemToRestore}`;
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
    navigate(`/addEditManufactures/${id}`);
  };

  const onTableChange = (fieldname) => {
    setSortField(fieldname);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const toggleShowDeleted = () => {
    setShowDeleted((prev) => !prev);
    setCurrentPage(1);
    setOffset(0);
  };

  const csvData = data.map((item) => [
    item.id,
    item.name,
    item.url,
    item.support_url,
    item.support_email,
    item.support_phone,
  ]);

  const formatUrl = (url) => {
    if (!url) {
      return ""; // Handle null or undefined url gracefully
    }
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return `http://${url}`;
  };

  return (
    <div className="form">
      <Container fluid>
        <Row>
          <Col md={12}>
            <div>
              <div className="title d-flex justify-content-between">
                <div>
                  <h1> {t("manufacturers.manufacture")} </h1>
                </div>
                <div>
                  <Button
                    className="me-2"
                    type="button"
                    onClick={toggleShowDeleted}
                  >
                    {showDeleted
                      ? t("button.showcurrent")
                      : t("button.showdeleted")}
                  </Button>
                  <Button
                    className="primary px-4"
                    type="submit"
                    onClick={() => navigate("/addEditManufactures")}
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
                          t("manufacturers.id"),
                          t("manufacturers.name"),
                          t("manufacturers.url"),
                          t("manufacturers.support_url"),
                          t("manufacturers.support_email"),
                          t("manufacturers.support_phone"),
                        ]}
                        data={csvData}
                        filename="manufacturers.csv"
                      />
                    </Form>
                  </div>
                </div>
                <div className="table-container">
                  <Table>
                    <thead>
                      <tr>
                        <th onClick={() => onTableChange("id")}>
                          {t("manufacturers.id")}{" "}
                          <SortingIcon
                            columnName="id"
                            sortField={sortField}
                            sortOrder={sortOrder}
                            onTableChange={onTableChange}
                          />
                        </th>
                        <th onClick={() => onTableChange("name")}>
                          {t("manufacturers.name")}{" "}
                          <SortingIcon
                            columnName="name"
                            sortField={sortField}
                            sortOrder={sortOrder}
                            onTableChange={onTableChange}
                          />
                        </th>
                        <th onClick={() => onTableChange("url")}>
                          {t("manufacturers.url")}{" "}
                          <SortingIcon
                            columnName="url"
                            sortField={sortField}
                            sortOrder={sortOrder}
                            onTableChange={onTableChange}
                          />
                        </th>
                        <th onClick={() => onTableChange("support_url")}>
                          {t("manufacturers.support_url")}{" "}
                          <SortingIcon
                            columnName="support_url"
                            sortField={sortField}
                            sortOrder={sortOrder}
                            onTableChange={onTableChange}
                          />
                        </th>
                        <th onClick={() => onTableChange("support_email")}>
                          {t("manufacturers.support_email")}{" "}
                          <SortingIcon
                            columnName="support_email"
                            sortField={sortField}
                            sortOrder={sortOrder}
                            onTableChange={onTableChange}
                          />
                        </th>
                        <th onClick={() => onTableChange("support_phone")}>
                          {t("manufacturers.support_phone")}{" "}
                          <SortingIcon
                            columnName="support_phone"
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
                                  navigate(
                                    `/manufacturersDetails/${items?.id}`,
                                    {
                                      state: {
                                        rowData: items,
                                        activeTab: "assets",
                                      },
                                    },
                                  )
                                }
                              >
                                {items?.name}
                              </button>
                            </td>
                            <td>
                              <a
                                className="btn btn-link"
                                href={formatUrl(items?.url)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {items?.url}
                              </a>
                            </td>
                            <td>
                              <a
                                className="btn btn-link"
                                href={formatUrl(items?.support_url)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {items?.support_url}
                              </a>
                            </td>
                            <td>
                              <a
                                className="btn btn-link"
                                href={`mailto:${items?.support_email}`}
                              >
                                {items?.support_email}
                              </a>
                            </td>
                            <td>
                              <a
                                className="btn btn-link"
                                href={`tel:${items?.support_phone}`}
                              >
                                {items?.support_phone}
                              </a>
                            </td>
                            <td>
                              {!showDeleted && (
                                <span
                                  className="edit me-2"
                                  title="Edit"
                                  onClick={
                                    items?.available_actions?.update === true
                                      ? () => handleEditClick(items?.id)
                                      : null
                                  }
                                />
                              )}
                              {!showDeleted &&
                                items?.available_actions?.delete === true && (
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
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default MainPage;
