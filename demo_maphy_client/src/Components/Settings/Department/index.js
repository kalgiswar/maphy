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
  const [offset, setOffset] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortField, setSortField] = useState("id");
  const [currentPage, setCurrentPage] = useState(1);
  const [show, setShow] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const Domain = process.env.REACT_APP_API_URL;

  const getDetails = async () => {
    setLoading(true);
    const url = `${Domain}/departments?limit=${sizePerPage}&offset=${offset}&search=${searchText}&sort=${sortField}&order=${sortOrder}`;
    try {
      const response = await axios.get(url);
      setData(response?.data?.rows);
      const totalPages = Math.ceil(response?.data?.total / sizePerPage);
      setTotalPages(totalPages);
    } catch (error) {
      common.notify("E", error.response);
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
    if (initialized) {
      if (searchText === "" || searchText === null) {
        getDetails();
      }
    } else {
      setInitialized(true);
    }
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
    setItemToDelete(id);
  };

  const handleClose = (e) => {
    e.preventDefault();
    setShow(false);
  };

  const onSearchClick = () => {
    setOffset(0);
    setCurrentPage(1);
    getDetails();
  };

  const deleteItem = async () => {
    const url = `${Domain}/departments/${itemToDelete}`;
    try {
      await axios.delete(url);
      setShow(false);
      getDetails();
      common.notify("S", t("alert.deleteSuccess"));
    } catch (error) {
      common.notify("E", error.response);
    }
  };

  const handleEditClick = (id) => {
    navigate(`/addEditDepartment/${id}`);
  };

  const onTableChange = (fieldName) => {
    setSortField(fieldName);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const csvData = data.map((item) => [
    item?.name,
    item?.company?.name,
    item?.manager?.name,
    item?.users_count,
    item?.location?.name,
  ]);

  return (
    <div className="form">
      <Container fluid>
        <Row>
          <Col md={12}>
            <div>
              <div className="title d-flex justify-content-between">
                <div>
                  <h1>{t("departments.departments")}</h1>
                </div>
                <div>
                  <Button
                    className="primary px-4"
                    onClick={() => navigate("/addEditDepartment")}
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
                          t("departments.name"),
                          t("departments.company_id"),
                          t("departments.manager_id"),
                          t("departments.user"),
                          t("departments.location_id"),
                        ]}
                        data={csvData}
                        filename="department.csv"
                      />
                    </Form>
                  </div>
                </div>
                <div className="table-container">
                  <Table>
                    <thead>
                      <tr>
                        <th onClick={() => onTableChange("name")}>
                          {t("departments.name")}
                          <SortingIcon
                            columnName="name"
                            sortField={sortField}
                            sortOrder={sortOrder}
                            onTableChange={onTableChange}
                          />
                        </th>
                        <th onClick={() => onTableChange("company.name")}>
                          {t("departments.company_id")}
                          <SortingIcon
                            columnName="company.name"
                            sortField={sortField}
                            sortOrder={sortOrder}
                            onTableChange={onTableChange}
                          />
                        </th>
                        <th onClick={() => onTableChange("manager.name")}>
                          {t("departments.manager_id")}
                          <SortingIcon
                            columnName="manager.name"
                            sortField={sortField}
                            sortOrder={sortOrder}
                            onTableChange={onTableChange}
                          />
                        </th>
                        <th onClick={() => onTableChange("users_count")}>
                          {t("departments.user")}
                          <SortingIcon
                            columnName="users_count"
                            sortField={sortField}
                            sortOrder={sortOrder}
                            onTableChange={onTableChange}
                          />
                        </th>
                        <th onClick={() => onTableChange("location.name")}>
                          {t("departments.location_id")}
                          <SortingIcon
                            columnName="location.name"
                            sortField={sortField}
                            sortOrder={sortOrder}
                            onTableChange={onTableChange}
                          />
                        </th>
                        <th className="right-radius">
                          {t("departments.actions")}
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
                      ) : data.length > 0 ? (
                        data.map((item, index) => (
                          <tr key={index}>
                            <td>
                              <button
                                type="button"
                                className="btn btn-link"
                                onClick={() =>
                                  navigate(`/departmentdetails/${item?.id}`, {
                                    state: { rowData: item },
                                  })
                                }
                              >
                                {item?.name}
                              </button>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-link"
                                onClick={() =>
                                  navigate(
                                    `/companiesDetails/${item?.company?.id}`,
                                    {
                                      state: {
                                        // rowData: item,
                                        activeTab: "assets",
                                      },
                                    },
                                  )
                                }
                              >
                                {item?.company?.name}
                              </button>
                            </td>
                            {/* <td>{item?.company?.name}</td> */}
                            <td>
                              <button
                                type="button"
                                className="btn btn-link"
                                onClick={() =>
                                  navigate(
                                    `/peopleDetails/${item?.manager?.id}`,
                                    {
                                      state: {
                                        activeTab: "info",
                                      },
                                    },
                                  )
                                }
                              >
                                {item?.manager?.name}
                              </button>
                            </td>
                            {/* <td>{item?.manager?.name}</td> */}
                            <td>{item?.users_count}</td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-link"
                                onClick={() =>
                                  navigate(
                                    `/locationDetails/${item?.location?.id}`,
                                    {
                                      state: {
                                        // rowData: item,
                                        activeTab: "assets",
                                      },
                                    },
                                  )
                                }
                              >
                                {item?.location?.name}
                              </button>
                            </td>
                            <td>
                              {item?.available_actions?.update && (
                                <span
                                  className="edit me-2"
                                  title="Edit"
                                  onClick={() => handleEditClick(item?.id)}
                                />
                              )}
                              {item?.available_actions?.delete === true && (
                                <span
                                  className="delete me-2"
                                  title="Delete"
                                  onClick={() => handleDeleteAlert(item?.id)}
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
