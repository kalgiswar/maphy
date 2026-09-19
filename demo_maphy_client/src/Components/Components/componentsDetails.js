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
import AlertModal from "../../Common/NotificationModal";
import Dropdown from "react-bootstrap/Dropdown";
import CsvExportButton from "../../Common/CsvExportButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const ComponentsLink = () => {
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
  const [show, setShow] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [checkinId, setCheckinId] = useState(null);
  const [assignedPivotId, setAssignedPivotId] = useState(null);
  const Domain = process.env.REACT_APP_API_URL;

  const getDetails = async () => {
    var url =
      Domain +
      `/components/${id}/assets?limit=${
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
    setSizePerPage(pageSize);
  };

  const handleClose = (e) => {
    e.preventDefault();
    setShow(false);
  };

  const onSearchClick = () => {
    setOffset(0);
    setCurrentPage(1);
    getDetails();
  };

  const handleCheckIn = (id, assignedPivotId) => {
    setCheckinId(id);
    setAssignedPivotId(assignedPivotId);
    setShow(true);
  };

  const confirmCheckIn = () => {
    setShow(false);
    navigate(`/checkInComponents/${checkinId}/${assignedPivotId}`);
  };

  const csvData = data.map((item) => [item?.name, item?.qty, item?.created_at]);
  return (
    <div className="form">
      <Container fluid>
        <Row>
          <Col md={12}>
            <div>
              <div className="title d-flex justify-content-between">
                <div>
                  <h1>{t("component.componentname")} </h1>
                </div>
                <div className="d-flex align-items-center">
                  <Dropdown className="mr-1 small-btn">
                    <Dropdown.Toggle variant="outline-primary" id="location">
                      {t("button.actions")}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item>
                        <button
                          type="button"
                          className="btn btn-link"
                          onClick={() => navigate(`/addEditComponents/${id}`)}
                        >
                          {t("component.update")}
                        </button>
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                  <Button
                    className="primary px-4"
                    type="button"
                    onClick={() => navigate("/components")}
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
                          t("component.asset"),
                          t("component.quantity"),
                          t("component.checkoutdt"),
                        ]}
                        data={csvData}
                        filename="namecomponent.csv"
                      />
                    </Form>
                  </div>
                </div>
                <Table>
                  <thead>
                    <tr>
                      <th> {t("component.asset")}</th>
                      <th> {t("component.quantity")}</th>
                      <th> {t("component.checkoutdt")} </th>
                      <th> {t("button.actions")} </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.length > 0 ? (
                      data.map((items, index) => (
                        <tr key={index}>
                          <td>{items?.name}</td>
                          <td>{items?.qty}</td>
                          <td>{items?.created_at}</td>
                          <td>
                            {items?.available_actions?.checkin === true && (
                              <Button
                                as="input"
                                type="button"
                                value="Checkin"
                                className="Checkin"
                                onClick={() =>
                                  handleCheckIn(id, items?.assigned_pivot_id)
                                }
                              />
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
                  onClick={confirmCheckIn}
                  show={show}
                  handleClose={handleClose}
                  modalType="checkin"
                  checkinId={checkinId}
                ></AlertModal>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ComponentsLink;
