import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
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
  const { t } = useTranslation();
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

  const getDetails = async () => {
    var url =
      Domain +
      `/hardware?limit=${
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

  const csvData = data.map((item) => [
    item?.name,
    item?.asset_tag,
    item?.serial,
    item?.category?.name,
    item?.status_label?.status_meta,
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
              <div className="title d-flex justify-content-between">
                <div>
                  <h1>{t("reports.asset")}</h1>
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
                          t("reports.Assetname"),
                          t("reports.Assettag"),
                          t("reports.Serial"),
                          t("reports.Category"),
                          t("reports.Status"),
                          t("reports.Assetdetails"),
                          t("reports.Assignedto"),
                          t("reports.Location"),
                          t("reports.DefaultLocation"),
                          t("reports.totalPurchasecost"),
                          t("reports.Taxcost"),
                          t("reports.Excludingtax"),
                        ]}
                        data={csvData}
                        filename="Assetreports.csv"
                      />
                    </Form>
                  </div>
                </div>
                <div className="table-container">
                  <Table>
                    <thead>
                      <tr>
                        <th onClick={() => onTableChange("Assetname")}>
                          {t("reports.Assetname")}
                          <SortingIcon
                            columnName="Assetname"
                            sortField={sortField}
                            sortOrder={sortOrder}
                            onTableChange={onTableChange}
                          />
                        </th>
                        <th onClick={() => onTableChange("Assettag")}>
                          {t("reports.Assettag")}
                          <SortingIcon
                            columnName="Assettag"
                            sortField={sortField}
                            sortOrder={sortOrder}
                            onTableChange={onTableChange}
                          />
                        </th>
                        <th>{t("reports.Serial")} </th>
                        <th>{t("reports.Category")} </th>
                        <th> {t("reports.Status")} </th>
                        <th>{t("reports.Assetdetails")}</th>
                        <th>{t("reports.Assignedto")} </th>
                        <th>{t("reports.Location")} </th>
                        <th> {t("reports.DefaultLocation")}</th>
                        <th>{t("reports.totalPurchasecost")}</th>
                        <th>{t("reports.Taxcost")}</th>
                        <th>{t("reports.Excludingtax")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.length > 0 ? (
                        data.map((items, index) => (
                          <tr>
                            <td className="text-nowrap">{items?.name}</td>
                            <td>{items?.asset_tag}</td>
                            <td>{items?.serial}</td>
                            <td className="text-nowrap">
                              {items?.category?.name}
                            </td>
                            <td>{items?.status_label?.status_meta}</td>
                            <td>{items?.assetdetails}</td>
                            <td>{items?.assigned_to?.name}</td>
                            <td>{items?.location?.name}</td>
                            <td>{items?.rtd_location?.name}</td>
                            <td>{items?.purchase_cost}</td>
                            <td>{items?.tax_value}</td>
                            <td>{items?.excluding_tax}</td>
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
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default MainPage;
