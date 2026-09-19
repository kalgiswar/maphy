import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { common } from "../../Common/common";
import axios from "axios";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import CustomPagination from "../../Common/pagination";
import SortingIcon from "../../Common/Icons";
import CsvExportButton from "../../Common/CsvExportButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

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
  const { categoryId } = useParams();
  const [initialized, setInitialized] = useState(false);
  const Domain = process.env.REACT_APP_API_URL;

  const getDetails = async () => {
    const url = `${Domain}/accessories?category_id=${categoryId}&limit=${
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
    setOffset(0);
    setCurrentPage(1);
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

  const backClick = () => {
    navigate("/Accessories");
  };

  const csvData = data.map((items) => [
    items.name,
    items?.category?.name,
    items?.qty,
    items?.remaining_qty,
    items?.min_qty,
    items?.manufacturer?.name,
    items?.supplier?.name,
  ]);

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
                  <Button onClick={backClick} className="back">
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
                          t("accessory.name"),
                          t("accessory.category_id"),
                          t("accessory.Quantity"),
                          t("accessory.avail"),
                          t("accessory.min_amt"),
                          t("accessory.manufacturer_id"),
                          t("accessory.supplier_id"),
                        ]}
                        data={csvData}
                        filename="categoryaccessory.csv"
                      />
                    </Form>
                  </div>
                </div>
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
                      <th onClick={() => onTableChange("category?.name")}>
                        {t("component.category_id")}{" "}
                        <SortingIcon
                          columnName="category?.name"
                          sortField={sortField}
                          sortOrder={sortOrder}
                        />
                      </th>
                      <th>{t("accessory.Quantity")}</th>
                      <th>{t("accessory.avail")}</th>
                      <th>{t("accessory.min_amt")}</th>
                      <th>{t("accessory.manufacturer_id")}</th>
                      <th>{t("accessory.supplier_id")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.length > 0 ? (
                      data.map((items, index) => (
                        <tr>
                          <td>{items.name}</td>
                          <td>{items?.category?.name}</td>
                          <td>{items?.qty}</td>
                          <td>{items?.remaining_qty}</td>
                          <td>{items?.min_qty}</td>
                          <td>{items?.manufacturer?.name}</td>
                          <td>{items?.supplier?.name}</td>
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

export default MainPage;
