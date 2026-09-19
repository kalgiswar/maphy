import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router-dom";
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
import Modal from "react-bootstrap/Modal";

const MainPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [sizePerPage, setSizePerPage] = useState(10);
  const [offset, setOffset] = useState("0");
  const [searchText, setSearchText] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [initialized, setInitialized] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const Domain = process.env.REACT_APP_API_URL;

  const getDetails = async () => {
    const url = `${Domain}/audit?limit=${sizePerPage}&offset=${offset}&search=${searchText}&sort=${sortField}&order=${sortOrder}`;
    try {
      const response = await axios.get(url);
      setData(response?.data?.rows || []);
      const totalPages = Math.ceil(response?.data?.total / sizePerPage);
      setTotalPages(totalPages);
    } catch (error) {
      common.notify("E", error);
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
    item?.id,
    item?.asset_tag,
    item?.auditor_name,
    item?.description,
    item?.status_id,
    // item?.location,
    item?.gps_coordinates,
    item?.created_at?.datetime,
    item?.present_location,
  ]);
  return (
    <div className="form">
      <Container fluid>
        <Row>
          <Col md={12}>
            <div>
              <div className="title d-flex justify-content-between">
                <div>
                  <h1> {t("Audit.name")} </h1>
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
                          t("Audit.id"),
                          t("Audit.assettag"),
                          t("Audit.auditorname"),
                          t("Audit.description"),
                          t("Audit.status"),
                          // t("Audit.location"),
                          t("Audit.gps"),
                          t("Audit.date"),
                          t("Audit.present_location"),
                        ]}
                        data={csvData}
                        filename="Audit.csv"
                      />
                    </Form>
                  </div>
                </div>
                <div className="table-container">
                  <Table>
                    <thead>
                      <tr>
                        <th onClick={() => onTableChange("id")}>
                          {t("Audit.id")}{" "}
                          <SortingIcon
                            columnName="id"
                            sortField={sortField}
                            sortOrder={sortOrder}
                            onTableChange={onTableChange}
                          />
                        </th>
                        <th>{t("Audit.assettag")}</th>
                        <th>{t("Audit.auditorname")}</th>
                        <th>{t("Audit.description")}</th>
                        <th>{t("Audit.status")}</th>
                        {/* <th>{t("Audit.location")}</th> */}
                        <th>{t("Audit.gps")} </th>
                        <th>{t("Audit.date")} </th>
                        <th>{t("Audit.present_location")}</th>{" "}
                        <th>{t("Audit.image")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.length > 0 ? (
                        data.map((items, index) => (
                          <tr>
                            <td className="blue">{items.id}</td>
                            <td>{items?.asset_tag}</td>
                            <td>{items?.auditor_name}</td>
                            <td>{items?.description}</td>
                            <td>{items?.status_id}</td>
                            {/* <td>{items?.location}</td> */}
                            {/* <td>{items?.gps_coordinates}</td> */}
                            <td>
                              {items?.gps_coordinates ? (
                                <a
                                  href={`https://www.google.com/maps?q=${encodeURIComponent(items.gps_coordinates)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    color: "#0d6efd",
                                    textDecoration: "underline",
                                    cursor: "pointer",
                                  }}
                                >
                                  {items.gps_coordinates}
                                </a>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td>{items?.created_at?.datetime}</td>
                            <td>{items?.present_location}</td>
                            <td>
                              {items?.image ? (
                                <img
                                  src={`${Domain}/${items.image}`}
                                  alt="Audit"
                                  style={{
                                    width: "40px",
                                    height: "40px",
                                    objectFit: "cover",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => {
                                    setSelectedImageUrl(
                                      `${Domain}/${items.image}`,
                                    );
                                    setShowModal(true);
                                  }}
                                />
                              ) : (
                                "-"
                              )}
                            </td>
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
                <Modal
                  show={showModal}
                  onHide={() => setShowModal(false)}
                  size="lg"
                >
                  <Modal.Header closeButton></Modal.Header>
                  <Modal.Body className="text-center">
                    {selectedImageUrl && (
                      <img
                        src={selectedImageUrl}
                        alt="Preview"
                        style={{ maxWidth: "100%", maxHeight: "80vh" }}
                      />
                    )}
                  </Modal.Body>
                </Modal>

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
