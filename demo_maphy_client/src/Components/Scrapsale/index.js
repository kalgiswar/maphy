import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Spinner from "react-bootstrap/Spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

import CustomPagination from "../../Common/pagination";
import AlertModal from "../../Common/NotificationModal";
import SortingIcon from "../../Common/Icons";
import CsvExportButton from "../../Common/CsvExportButton";
import { common } from "../../Common/common";

const ScrapSalesPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const Domain = process.env.REACT_APP_API_URL;

  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [sizePerPage, setSizePerPage] = useState(10);
  const [offset, setOffset] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState(""); // controlled input
  const [searchText, setSearchText] = useState(""); // actual query param
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [show, setShow] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const getScrapSales = async () => {
    setLoading(true);
    const url = `${Domain}/scrapSale?search=${searchText}&sort=${sortField}&limit=${sizePerPage}&offset=${offset}&order=${sortOrder}`;
    try {
      const response = await axios.get(url);
      setData(response?.data?.rows || []);
      const total = response?.data?.total || 0;
      setTotalPages(Math.ceil(total / sizePerPage));
    } catch (err) {
      common.notify("E", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getScrapSales();
  }, []);

  useEffect(() => {
    if (initialized) getScrapSales();
  }, [currentPage, sizePerPage, sortField, sortOrder]);

  useEffect(() => {
    if (initialized) getScrapSales();
    else setInitialized(true);
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

  const onSearchClick = () => {
    setOffset(0);
    setCurrentPage(1);
    setSearchText(searchInput); // this triggers useEffect
  };

  const onTableChange = (field) => {
    setSortField(field);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleEditClick = (id) => {
    navigate(`/addEditScrapsale/${id}`);
  };

  const handleDeleteAlert = (id) => {
    setShow(true);
    setItemToDelete(id);
  };

  const handleClose = (e) => {
    e.preventDefault();
    setShow(false);
  };

  const deleteItem = async () => {
    const url = `${Domain}/scrapSale/${itemToDelete}`;
    try {
      await axios.delete(url);
      common.notify("S", t("alert.deleteSuccess"));
      getScrapSales();
    } catch (err) {
      common.notify("E", err);
    } finally {
      setShow(false);
    }
  };

  const csvData = data.map((item) => [
    item?.item_name,
    item?.item_type,
    item?.sale_date,
    item?.quantity,
    item?.unit_price,
    item?.total_price,
    item?.buyer_name,
    item?.buyer_contact,
    item?.remarks,
  ]);

  return (
    <div className="form">
      <Container fluid>
        <Row>
          <Col md={12}>
            <div>
              <div className="title d-flex justify-content-between">
                <div>
                  <h1>{t("scrap.sales")}</h1>
                </div>
                <div>
                  <Button
                    className="primary px-4"
                    type="submit"
                    onClick={() => navigate("/addEditScrapsale")}
                  >
                    {t("button.create")}
                  </Button>
                </div>
              </div>

              <div className="dataTable wrapper">
                <div className="d-flex justify-content-between">
                  <div className="my-3">
                    <Form className="d-flex">
                      <input
                        type="text"
                        value={searchInput}
                        placeholder={t("search.search")}
                        className="search me-1"
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && onSearchClick()}
                      />
                      <Button className="icon me-1" onClick={onSearchClick}>
                        <FontAwesomeIcon icon={faSearch} />
                      </Button>
                      <CsvExportButton
                        headers={[
                          t("scrap.item_name"),
                          t("scrap.item_type"),
                          t("scrap.sale_date"),
                          t("scrap.quantity"),
                          t("scrap.unit_price"),
                          t("scrap.total_price"),
                          t("scrap.buyer_name"),
                          t("scrap.buyer_contact"),
                          t("scrap.remarks"),
                        ]}
                        data={csvData}
                        filename="scrap_sales.csv"
                      />
                    </Form>
                  </div>
                </div>

                <div className="table-container">
                  <Table>
                    <thead>
                      <tr>
                        <th onClick={() => onTableChange("item_name")}>
                          {t("scrap.item_name")}
                          <SortingIcon
                            columnName="item_name"
                            sortField={sortField}
                            sortOrder={sortOrder}
                          />
                        </th>
                        <th>{t("scrap.item_type")}</th>
                        <th onClick={() => onTableChange("sale_date")}>
                          {t("scrap.sale_date")}
                          <SortingIcon
                            columnName="sale_date"
                            sortField={sortField}
                            sortOrder={sortOrder}
                          />
                        </th>
                        <th>{t("scrap.quantity")}</th>
                        <th>{t("scrap.unit_price")}</th>
                        <th>{t("scrap.total_price")}</th>
                        <th>{t("scrap.buyer_name")}</th>
                        <th>{t("scrap.buyer_contact")}</th>
                        <th>{t("scrap.remarks")}</th>
                        <th>{t("category.actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="10" className="text-center">
                            <Spinner animation="border" />
                          </td>
                        </tr>
                      ) : data.length > 0 ? (
                        data.map((item, idx) => (
                          <tr key={idx}>
                            <td>{item.item_name}</td>
                            <td>{item.item_type}</td>
                            <td>{item.sale_date}</td>
                            <td>{item.quantity}</td>
                            <td>{item.unit_price}</td>
                            <td>{item.total_price}</td>
                            <td>{item.buyer_name}</td>
                            <td>{item.buyer_contact}</td>
                            <td>{item.remarks}</td>
                            <td>
                              <span
                                className="edit me-2"
                                title="Edit"
                                onClick={() => handleEditClick(item.id)}
                              />
                              <span
                                className="delete"
                                title="Delete"
                                onClick={() => handleDeleteAlert(item.id)}
                              />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="10" align="center">
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

export default ScrapSalesPage;
