import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { common } from "../../../Common/common";
import axios from "axios";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import CustomPagination from "../../../Common/pagination";
import SortingIcon from "../../../Common/Icons";
import Dropdown from "react-bootstrap/Dropdown";
import CsvExportButton from "../../../Common/CsvExportButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const CategoriesLicense = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  let { id } = useParams();
  const [data, setData] = useState([]);
  const locationpath = useLocation();
  const [totalPages, setTotalPages] = useState(0);
  const [sizePerPage, setSizePerPage] = useState(10);
  const [offset, setOffset] = useState("0");
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortField, setSortField] = useState("id");
  const [currentPage, setCurrentPage] = useState(1);
  const [initialized, setInitialized] = useState(false);
  const Domain = process.env.REACT_APP_API_URL;
  const { rowData } = locationpath.state || {};

  const getDetails = async () => {
    const url = `${Domain}/licenses?category_id=${id}&limit=${
      sizePerPage ? sizePerPage : 10
    }&offset=${offset}&search=${
      searchText ? searchText : ""
    }&sort=${sortField}&order=${sortOrder}`;
    try {
      const response = await axios.get(url);
      setData(response?.data?.rows);
      const totalPages = Math.ceil(response?.data?.total / sizePerPage);
      setTotalPages(totalPages);
    } catch (response) {
      common.notify("E", response);
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
    setSizePerPage(pageSize);
  };

  const onSearchClick = () => {
    setOffset(0);
    setCurrentPage(1);
    getDetails();
  };
  const onTableChange = (fieldName) => {
    setSortField(fieldName);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };
  const csvData = data.map((items) => [
    items?.id,
    items?.name,
    items?.product_key,
    items?.manufacturer?.name,
    items?.seats,
    items?.free_seats_count,
    items?.purchase_date?.formatted,
  ]);
  return (
    <div className="form">
      <Container fluid>
        <Row>
          <Col md={12}>
            <div>
              <div className="title d-flex justify-content-between">
                <div>
                  <h1>
                    {t("category.License")} - {rowData?.name}
                  </h1>
                </div>
                <div className="d-flex align-items-center">
                  <Dropdown className="mr-1 small-btn">
                    <Dropdown.Toggle variant="outline-primary" id="location">
                      Actions
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item>
                        {" "}
                        <button
                          type="button"
                          className="btn btn-link"
                          onClick={() => navigate("/addEditCategories")}
                        >
                          {t("category.categeoriestitle")}
                        </button>{" "}
                      </Dropdown.Item>
                      <Dropdown.Item>
                        <button
                          type="button"
                          className="btn btn-link"
                          onClick={() => navigate(`/addEditcategories/${id}`)}
                        >
                          {t("category.updatecategory")}
                        </button>
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                  <Button
                    className="primary px-4"
                    type="button"
                    onClick={() => navigate("/categories")}
                  >
                    {t("button.back")}
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
                          t("CategoryLicense.id"),
                          t("CategoryLicense.license"),
                          t("CategoryLicense.productkey"),
                          t("CategoryLicense.manufacturer"),
                          t("CategoryLicense.total"),
                          t("CategoryLicense.avail"),
                          t("CategoryLicense.purchase_date"),
                        ]}
                        data={csvData}
                        filename="Audit.csv"
                      />
                    </Form>
                  </div>
                </div>
                <Table>
                  <thead>
                    <tr>
                      <th onClick={() => onTableChange("id")}>
                        {t("CategoryLicense.id")}
                        <SortingIcon
                          columnName="id"
                          sortField={sortField}
                          sortOrder={sortOrder}
                        />
                      </th>
                      <th onClick={() => onTableChange("name")}>
                        {t("CategoryLicense.license")}{" "}
                        <SortingIcon
                          columnName="name"
                          sortField={sortField}
                          sortOrder={sortOrder}
                        />
                      </th>
                      <th> {t("CategoryLicense.productkey")}</th>
                      <th> {t("CategoryLicense.manufacturer")}</th>
                      <th> {t("CategoryLicense.total")} </th>
                      <th> {t("CategoryLicense.avail")} </th>
                      <th> {t("CategoryLicense.purchase_date")} </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.length > 0 ? (
                      data.map((items, index) => (
                        <tr key={index}>
                          <td>{items?.id}</td>
                          <td>{items?.name}</td>
                          <td>{items?.product_key}</td>
                          <td>{items?.manufacturer?.name}</td>

                          <td>{items?.seats}</td>
                          <td>{items?.free_seats_count}</td>
                          <td>{items?.purchase_date?.formatted}</td>
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
                {totalPages > 0 && (
                  <CustomPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    itemsPerPage={sizePerPage}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                  />
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CategoriesLicense;
