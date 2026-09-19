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
  const [offset, setOffset] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortField, setSortField] = useState("id");
  const [currentPage, setCurrentPage] = useState(1);
  const [initialized, setInitialized] = useState(false);
  const Domain = process.env.REACT_APP_API_URL;

  const getDetails = async () => {
    var url =
      Domain +
      `/reports/activity?limit=${
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
    getDetails();
  };

  const onTableChange = (fieldName) => {
    setSortField(fieldName);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const csvData = data.map((item) => [
    item?.id,
    item?.updated_at?.formatted,
    item?.admin?.name,
    item?.action_type,
    item?.item?.type,
    item?.item?.type,
    item?.target?.name,
    item?.avail,
  ]);

  return (
    <div className="form">
      <Container fluid>
        <Row>
          <Col md={12}>
            <div>
              <div className="title d-flex justify-content-between">
                <div>
                  <h1>{t("reports.activityreport")}</h1>
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
                          t("reports.id"),
                          t("reports.Date"),
                          t("reports.Admin"),
                          t("reports.Action"),
                          t("reports.Type"),
                          t("reports.Item"),
                          t("reports.To"),
                          t("reports.Notes"),
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
                        <th onClick={() => onTableChange("id")}>
                          {t("/reports.id")}
                          <SortingIcon
                            columnName="id"
                            sortField={sortField}
                            sortOrder={sortOrder}
                            onTableChange={onTableChange}
                          />
                        </th>
                        <th>{t("reports.Date")}</th>
                        <th>{t("reports.Admin")}</th>
                        <th>{t("reports.Action")}</th>
                        <th>{t("reports.Type")}</th>
                        <th>{t("reports.Item")}</th>
                        <th>{t("reports.To")}</th>
                        <th>{t("reports.Notes")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.length > 0 ? (
                        data.map((items, index) => (
                          <tr key={index}>
                            <td>{items?.id}</td>
                            <td>{items?.updated_at?.formatted}</td>
                            <td>{items?.admin?.name}</td>
                            <td>{items?.action_type}</td>
                            <td>{items?.item?.type}</td>
                            <td>{items?.item?.type}</td>
                            <td>{items?.target?.name}</td>
                            <td>{items?.avail}</td>
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
