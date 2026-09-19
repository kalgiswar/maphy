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
    setSizePerPage(pageSize);
  };

  const getDetails = async () => {
    var url =
      Domain +
      `/maintenances?supplier_id${id}&limit=${
        sizePerPage ? sizePerPage : 10
      }&offset=${offset}&search=${
        searchText ? searchText : ""
      }&sort=${sortField}&order=${sortOrder}&type=all`;
    await axios
      .get(url)
      .then((response) => {
        setData(response?.data?.rows);
        const totalPages = Math.ceil(response?.data?.total / sizePerPage);
        setTotalPages(totalPages);
      })
      .catch(function (response) {
        //handle error
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

  const onTableChange = (fieldname) => {
    setSortField(fieldname);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const csvData = data?.map((item) => [
    item?.asset?.name,
    item?.asset?.asset_tag,
    item?.supplier?.name,
    item?.asset_maintenance_type,
    item?.notes,
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
                          t("AssetsListall.supplier"),
                          t("AssetsListall.maintain_type"),
                          t("AssetsListall.notes"),
                        ]}
                        data={csvData}
                        filename="peopleLicense.csv"
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
                      <th> {t("AssetsListall.supplier")} </th>
                      <th> {t("AssetsListall.maintain_type")} </th>
                      <th> {t("AssetsListall.notes")} </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.length > 0 ? (
                      data.map((items, index) => (
                        <tr key={index}>
                          <td>{items?.asset?.name}</td>
                          <td>{items?.asset?.asset_tag}</td>
                          <td>{items?.supplier?.name}</td>
                          <td>{items?.asset_maintenance_type}</td>
                          <td>{items?.notes}</td>
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
