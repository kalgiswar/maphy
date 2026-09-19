import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
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
import Spinner from "react-bootstrap/Spinner";

const MainPage = () => {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  let { id } = useParams();
  const [totalPages, setTotalPages] = useState(0);
  const [sizePerPage, setSizePerPage] = useState(10);
  const [offset, setOffset] = useState("0");
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortField, setSortField] = useState("id");
  const [currentPage, setCurrentPage] = useState(1);
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const Domain = process.env.REACT_APP_API_URL;

  const getDetails = async () => {
    setLoading(true);
    const url = `${Domain}/hardware?company_id=${id}&limit=${sizePerPage}&offset=${offset}&search=${searchText}&sort=${sortField}&order=${sortOrder}`;
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

  const handleInputChange = (evnt) => {
    setSearchText(evnt.target.value);
  };

  const onSearchClick = () => {
    setOffset(0);
    setCurrentPage(1);
    getDetails();
  };

  const onTableChange = (fieldname) => {
    setSortField(fieldname);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
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
                        ]}
                        data={csvData}
                        filename="AssetsListall.csv"
                      />
                    </Form>
                  </div>
                </div>
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
                      <th>{t("AssetsListall.model")}</th>
                      <th>{t("AssetsListall.category")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="text-center">
                          <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </Spinner>
                        </td>
                      </tr>
                    ) : data?.length > 0 ? (
                      data.map((items, index) => (
                        <tr key={index}>
                          <td>{items?.name}</td>
                          <td>{items?.asset_tag}</td>
                          <td>{items?.serial}</td>
                          <td>{items?.model?.name}</td>
                          <td>{items?.category?.name}</td>
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
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default MainPage;
