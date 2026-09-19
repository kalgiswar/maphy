import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { common } from "../../../Common/common";
import axios from "axios";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import CustomPagination from "../../../Common/pagination";
import SortingIcon from "../../../Common/Icons";
import CsvExportButton from "../../../Common/CsvExportButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const MainPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  let { id } = useParams();
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [sizePerPage, setSizePerPage] = useState(10);
  const [offset, setOffset] = useState("0");
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortField, setSortField] = useState("id");
  const [currentPage, setCurrentPage] = useState(1);
  const [initialized, setInitialized] = useState(false);
  const Domain = process.env.REACT_APP_API_URL;

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
    setOffset(0);
    setSizePerPage(pageSize);
  };

  const getDetails = async () => {
    var url =
      Domain +
      `/consumables?location_id=${id}&limit=${
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

  const handleInputChange = (evnt) => {
    setSearchText(evnt.target.value);
  };

  const onSearchClick = () => {
    setOffset(0);
    setCurrentPage(1);
    getDetails();
  };

  const onTableChange = (filedname) => {
    setSortField(filedname);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const csvData = data.map((item) => [
    item?.name,
    item?.category?.name,
    item?.qty,
    item?.remaining,
    item?.min_qty,
    item?.location?.name,
    item?.order_number,
    item?.purchase_date?.formatted,
    item?.purchase_cost,
  ]);

  return (
    <div className="form">
      <Container fluid>
        <Row>
          <Col md={12}>
            <div>
              <div className="dataTable wrapper">
                <div className="d-flex justify-content-between">
                  <div className="my-3">
                    <Form>
                      <input
                        type="text"
                        name="search me-2"
                        placeholder={t("search.search")}
                        className="search"
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
                          t("consumable.name"),
                          t("consumable.category_id"),
                          t("consumable.total"),
                          t("consumable.remaining"),
                          t("consumable.min_qty"),
                          t("consumable.location_id"),
                          t("consumable.order_number"),
                          t("consumable.purchase_date"),
                          t("consumable.purchase_cost"),
                        ]}
                        data={csvData}
                        filename="consumable.csv"
                      />
                    </Form>
                  </div>
                </div>
                <Table>
                  <thead>
                    <tr>
                      <th onClick={() => onTableChange("name")}>
                        {t("consumable.name")}{" "}
                        <SortingIcon
                          columnName="name"
                          sortField={sortField}
                          sortOrder={sortOrder}
                        />
                      </th>
                      <th onClick={() => onTableChange("category.name")}>
                        {t("consumable.category_id")}{" "}
                        <SortingIcon
                          columnName="category.name"
                          sortField={sortField}
                          sortOrder={sortOrder}
                        />
                      </th>
                      <th onClick={() => onTableChange("qty")}>
                        {t("consumable.total")}{" "}
                        <SortingIcon
                          columnName="qty"
                          sortField={sortField}
                          sortOrder={sortOrder}
                        />
                      </th>
                      <th onClick={() => onTableChange("remaining")}>
                        {t("consumable.remaining")}{" "}
                        <SortingIcon
                          columnName="remaining"
                          sortField={sortField}
                          sortOrder={sortOrder}
                        />
                      </th>
                      <th onClick={() => onTableChange("min_amt")}>
                        {t("consumable.min_qty")}{" "}
                        <SortingIcon
                          columnName="min_amt"
                          sortField={sortField}
                          sortOrder={sortOrder}
                        />
                      </th>
                      <th>{t("consumable.location_id")}</th>
                      <th>{t("consumable.order_number")}</th>
                      <th>{t("consumable.purchase_date")}</th>
                      <th>{t("consumable.purchase_cost")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.length > 0 ? (
                      data.map((items, index) => (
                        <tr>
                          <td>{items?.name}</td>
                          <td>{items?.category?.name}</td>
                          <td>{items?.qty}</td>
                          <td>{items?.remaining}</td>
                          <td>{items?.min_qty}</td>
                          <td>{items?.location?.name}</td>
                          <td>{items?.order_number}</td>
                          <td>{items?.purchase_date?.formatted}</td>
                          <td>{items?.purchase_cost}</td>
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
