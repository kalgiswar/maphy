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

const AssetModalDetails = () => {
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
        `${Domain}/users?department_id=${id}&limit=${
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
    items?.username,
    items?.company?.name,
    items?.state,
    items?.country,
    items?.location?.name,
    items?.assets_count,
    items?.licenses_count,
    items?.consumables_count,
    items?.accessories_count,
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
                    className="primary px-4 me-1"
                    type="button"
                    onClick={() => navigate(`/addEditDepartment/${id}`)}
                  >
                    {t("departments.updatedept")}
                  </Button>

                  <Button
                    className="primary px-4"
                    type="button"
                    onClick={() => navigate("/department")}
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
                          t("departments.Name"),
                          t("departments.username"),
                          t("departments.company_id"),
                          t("departments.state"),
                          t("departments.country"),
                          t("departments.location_id"),
                          t("departments.asset"),
                          t("departments.license"),
                          t("departments.consumables"),
                          t("departments.accessories"),
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
                      <th> {t("departments.Name")}</th>
                      <th>
                        {t("departments.username")}
                        <SortingIcon
                          columnName="id"
                          sortField={sortField}
                          sortOrder={sortOrder}
                          onTableChange={onTableChange}
                        />
                      </th>
                      <th>{t("departments.company_id")}</th>
                      <th> {t("departments.state")}</th>
                      <th> {t("departments.country")} </th>
                      <th> {t("departments.location_id")} </th>
                      <th> {t("departments.asset")} </th>
                      <th> {t("departments.license")} </th>
                      <th> {t("departments.consumables")} </th>
                      <th> {t("departments.accessories")} </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.length > 0 ? (
                      data.map((items, index) => (
                        <tr key={index}>
                          <td>{items?.name}</td>
                          <td>{items?.username}</td>
                          <td>{items?.company?.name}</td>
                          <td>{items?.state}</td>
                          <td>{items?.country}</td>
                          <td>{items?.location?.name}</td>
                          <td>{items?.assets_count}</td>
                          <td>{items?.licenses_count}</td>
                          <td>{items?.consumables_count}</td>
                          <td>{items?.accessories_count}</td>
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

export default AssetModalDetails;
