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
import UpdateTickets from "./updateTickets";
import UpdateTicketStatus from "./updateTicketStatus";
import { jwtDecode } from "jwt-decode";

const TicketsByStatus = ({
  ticketStatus,
  userType,
  isActive,
  talentGroupId,
}) => {
  console.log("UT", userType);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [name, setName] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [sizePerPage, setSizePerPage] = useState(10);
  const [offset, setOffset] = useState("0");
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortField, setSortField] = useState("id");
  const [currentPage, setCurrentPage] = useState(1);
  const [initialized, setInitialized] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [selectedStatusId, setTicketStatusId] = useState(null);
  const [view, setView] = useState("table");
  const [userId, setUserId] = useState("");
  console.log("FN", userId);

  const Domain = process.env.REACT_APP_API_URL;

  // Effect to fetch details only when the tab is active
  useEffect(() => {
    const token = localStorage.getItem("maphytoken");
    const decoded = jwtDecode(token);
    setUserId(decoded.userId);
    if (isActive) {
      getDetails();
    }
  }, [ticketStatus, isActive]);

  // Effect to handle pagination and sorting changes
  useEffect(() => {
    if (initialized) getDetails();
  }, [currentPage, sizePerPage, sortField, sortOrder]);

  // Effect to handle search input changes
  useEffect(() => {
    if (initialized) {
      getDetails();
    } else {
      setInitialized(true);
    }
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
    const url = `${Domain}/tickets?limit=${
      sizePerPage ? sizePerPage : 10
    }&offset=${offset}&search=${
      searchText ? searchText : ""
    }&sort=${sortField}&order=${sortOrder}&status_id=${ticketStatus}`;
    await axios
      .get(url)
      .then((response) => {
        setData(response?.data?.rows);
        setName(response?.data?.rows[0]?.asset_tag);
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

  const handleCloseClick = (id) => {
    setSelectedTicketId(id);
    setView("updateTicket");
  };

  const handleStatusClick = (id) => {
    setTicketStatusId(id);
    setView("updateTicketStatus");
  };

  const onTableChange = (filedname) => {
    setSortField(filedname);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const csvData = data.map((item) => [
    item?.id,
    item?.description,
    item?.asset_tag,
    item?.assigned,
    item?.userName,
    item?.status,
    item?.ticketIssue?.name,
    item?.created_at?.formatted,
  ]);

  const handleBackClick = () => {
    setView("tickets");
    setSelectedTicketId(null);
    setTicketStatusId(null);
    getDetails();
  };

  if (view === "updateTicketStatus" && selectedStatusId) {
    return (
      <UpdateTicketStatus
        ticketId={selectedStatusId}
        onBack={handleBackClick}
        userType={userType}
        asset_tag={name}
        talentGroupId={talentGroupId}
        ticketStatusOption={ticketStatus}
      />
    );
  }

  if (view === "updateTicket" && selectedTicketId) {
    return (
      <UpdateTickets ticketId={selectedTicketId} onBack={handleBackClick} />
    );
  }

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
                          t("helpdesk.id"),
                          t("helpdesk.description"),
                          t("helpdesk.asset_tag"),
                          t("helpdesk.assigned"),
                          t("helpdesk.username"),
                          t("helpdesk.status"),
                          t("helpdesk.ticket_issue"),
                          t("helpdesk.created_at"),
                        ]}
                        data={csvData}
                        filename="helpdesk.csv"
                      />
                    </Form>
                  </div>
                </div>
                <div className="table-container">
                  <Table>
                    <thead>
                      <tr>
                        <th onClick={() => onTableChange("id")}>
                          {t("helpdesk.id")}{" "}
                          <SortingIcon
                            columnName="id"
                            sortField={sortField}
                            sortOrder={sortOrder}
                          />
                        </th>
                        <th>{t("helpdesk.description")}</th>
                        <th>{t("helpdesk.asset_tag")}</th>
                        <th>{t("helpdesk.assigned")}</th>
                        <th>{t("helpdesk.username")}</th>
                        <th>{t("helpdesk.status")}</th>
                        <th>{t("helpdesk.ticket_issue")}</th>
                        <th>{t("helpdesk.created_at")}</th>
                        {ticketStatus !== "3" && (
                          <th className="right-radius">
                            {t("button.actions")}
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {data?.length > 0 ? (
                        data.map((items, index) => (
                          <tr key={index}>
                            <td>
                              <button
                                type="button"
                                className="btn btn-link"
                                onClick={() =>
                                  navigate(`/ticketDetails/${items?.id}`, {
                                    // state: { rowData: items },
                                  })
                                }
                              >
                                {items?.id}
                              </button>
                            </td>
                            <td>{items?.description}</td>
                            <td>{items?.asset_tag}</td>
                            <td>{items?.assigned}</td>
                            <td>{items?.userName}</td>
                            <td>{items?.status}</td>
                            <td>{items?.ticketIssue?.name}</td>
                            <td>{items?.created_at?.formatted}</td>
                            {ticketStatus !== "3" && ticketStatus === "99" && (
                              <td>
                                {items?.status === "Open" && (
                                  <Button
                                    as="input"
                                    type="button"
                                    value="close"
                                    className="close"
                                    onClick={() => handleCloseClick(items?.id)}
                                  />
                                )}
                              </td>
                            )}
                            {ticketStatus !== "3" && ticketStatus !== "99" && (
                              <td>
                                <Button
                                  as="input"
                                  type="button"
                                  value="Status"
                                  className="status"
                                  onClick={() => handleStatusClick(items?.id)}
                                  disabled={
                                    (userType === 1 || userType === "1") &&
                                    userId !== items?.assigned_to
                                  }
                                />
                              </td>
                            )}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" align="center">
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

export default TicketsByStatus;
