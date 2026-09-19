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
import { faSearch, faTableColumns } from "@fortawesome/free-solid-svg-icons";
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
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const Domain = process.env.REACT_APP_API_URL;

  const getDetails = async () => {
    setLoading(true);
    const url = `${Domain}/categories?limit=${sizePerPage}&offset=${offset}&search=${searchText}&sort=${sortField}&order=${sortOrder}`;
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
  };

  const handleDeleteAlert = (id) => {
    setShow(true);
    setItemTodelete(id);
  };

  const handleClose = (e) => {
    e.preventDefault();
    setShow(false);
  };

  const deleteItem = async () => {
    const url = `${Domain}/categories/${itemTodelete}`;
    try {
      await axios.delete(url);
      setShow(false);
      getDetails();
      common.notify("S", t("alert.deleteSuccess"));
    } catch (error) {
      common.notify("E", error);
    }
  };

  const handleEditClick = (id) => {
    navigate(`/addEditCategories/${id}`);
  };
  const onTableChange = (fieldName) => {
    setSortField(fieldName);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const onSearchClick = () => {
    setOffset(0);
    setCurrentPage(1);
    getDetails();
  };

  const renderBoolean = (value) => {
    return value ? (
      <span className="boolean-true">&#10003;</span>
    ) : (
      <span className="boolean-false">&#10007;</span>
    );
  };

  const linkFormatter = (row) => {
    const categoryType = row?.category_type;
    if (categoryType === "Asset") {
      navigate(`/categories/asset/${row?.id}`, { state: { rowData: row } });
    } else if (categoryType === "License") {
      navigate(`/categories/licenses/${row?.id}`, { state: { rowData: row } });
    } else if (categoryType === "Accessory") {
      navigate(`/categories/accessories/${row?.id}`, {
        state: { rowData: row },
      });
    } else if (categoryType === "Component") {
      navigate(`/categories/components/${row?.id}`, {
        state: { rowData: row },
      });
    } else if (categoryType === "Consumable") {
      navigate(`/categories/consumables/${row?.id}`, {
        state: { rowData: row },
      });
    } else {
      navigate(`/categories`);
    }
  };

  const csvData = data.map((item) => [
    item?.name,
    item?.category_type,
    item?.item_count,
    item?.has_eula ? "Yes" : "No",
    item?.checkin_email ? "Yes" : "No",
    item?.require_acceptance ? "Yes" : "No",
  ]);

  return (
    <div className="form">
      <Container fluid>
        <Row>
          <Col md={12}>
            <div>
              <div className="title d-flex justify-content-between">
                <div>
                  <h1>{t("category.categories")}</h1>
                </div>
                <div>
                  <Button
                    className="primary px-4"
                    type="submit"
                    onClick={() => navigate("/addEditCategories")}
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
                        const
                        headers={[
                          t("category.categoriesname"),
                          t("category.type"),
                          t("category.qty"),
                          t("category.EULA"),
                          t("category.checkin_mail"),
                          t("category.Acceptance"),
                        ]}
                        data={csvData}
                        filename="categories.csv"
                      />
                    </Form>
                  </div>
                </div>
                <div className="table-container">
                  <Table>
                    <thead>
                      <tr>
                        <th onClick={() => onTableChange("name")}>
                          {t("category.categoriesname")}{" "}
                          <SortingIcon
                            columnName="name"
                            sortField={sortField}
                            sortOrder={sortOrder}
                          />
                        </th>
                        <th onClick={() => onTableChange("category_type")}>
                          {t("category.type")}
                          <SortingIcon
                            columnName="category_type"
                            sortField={sortField}
                            sortOrder={sortOrder}
                            onTableChange={onTableChange}
                          />
                        </th>

                        <th>{t("category.qty")}</th>
                        <th>{t("category.EULA")}</th>
                        <th>{t("category.checkin_mail")}</th>
                        <th>{t("category.Acceptance")}</th>
                        <th>{t("category.actions")}</th>
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
                                onClick={() => linkFormatter(items)}
                              >
                                {items.name}
                              </button>
                            </td>
                            <td>{items.category_type}</td>
                            <td>{items.item_count}</td>
                            <td>{renderBoolean(items.has_eula)}</td>
                            <td>{renderBoolean(items.checkin_email)}</td>
                            <td>{renderBoolean(items.require_acceptance)}</td>
                            <td>
                              {items?.available_actions?.update === true && (
                                <span
                                  className="edit me-2"
                                  title="Edit"
                                  onClick={() => handleEditClick(items.id)}
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
                />
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default MainPage;
