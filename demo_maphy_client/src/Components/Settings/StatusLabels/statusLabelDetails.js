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
import CsvExportButton from "../../../Common/CsvExportButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const StatusLabelDetails = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  let { id } = useParams();
  const locationpath = useLocation();
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [sizePerPage, setSizePerPage] = useState(10);
  const [offset, setOffset] = useState("0");
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortField, setSortField] = useState("id");
  const [currentPage, setCurrentPage] = useState(1);
  const [initialized, setInitialized] = useState(false);
  const { rowData } = locationpath?.state || {};
  const [name, setName] = useState("");
  const Domain = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (rowData?.name) {
      localStorage.setItem("Name", rowData.name);
      console.log("saved", localStorage.setItem("Name", rowData.name));
      setName(rowData.name);
    }
  }, [rowData]);

  useEffect(() => {
    const storedName = localStorage.getItem("Name");
    if (storedName) {
      setName(storedName);
    }
  }, []);

  const getDetails = async () => {
    try {
      const response = await axios.get(
        `${Domain}/hardware/byStatus?status_id=${id}&limit=${
          sizePerPage ? sizePerPage : 10
        }&offset=${offset}&search=${
          searchText ? searchText : ""
        }&sort=${sortField}&order=${sortOrder}`,
      );
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
    items?.name,
    items?.category?.name,
    items?.status_label?.name,
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
                  <h1>{name}</h1>
                </div>

                <div className="d-flex align-items-center">
                  <Button
                    className="primary px-4"
                    type="button"
                    onClick={() => navigate("/statusLabels")}
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
                          t("departments.assetname"),
                          t("departments.category"),
                          t("departments.status"),
                          t("departments.manufacture"),
                          t("departments.supplier"),
                        ]}
                        data={csvData}
                        filename="activityreports.csv"
                      />
                    </Form>
                  </div>
                </div>
                <Table>
                  <thead>
                    <tr>
                      <th onClick={() => onTableChange("name")}>
                        {t("statuslabel.assetname")}{" "}
                        <SortingIcon
                          columnName="name"
                          sortField={sortField}
                          sortOrder={sortOrder}
                        />
                      </th>
                      <th> {t("statuslabel.category")}</th>
                      <th> {t("statuslabel.status")}</th>
                      <th> {t("statuslabel.manufacture")} </th>
                      <th> {t("statuslabel.supplier")} </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.length > 0 ? (
                      data.map((items, index) => (
                        <tr key={index}>
                          <td>{items?.name}</td>
                          <td>{items?.category?.name}</td>
                          <td>{items?.status_label?.name}</td>
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

export default StatusLabelDetails;
