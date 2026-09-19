import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { common } from "../../../Common/common";
import axios from "axios";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import CustomPagination from "../../../Common/pagination";
import AlertModal from "../../../Common/NotificationModal";
import SortingIcon from "../../../Common/Icons";
import CsvExportButton from "../../../Common/CsvExportButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const MainPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [sizePerPage, setSizePerPage] = useState(10);
  const [offset, setOffset] = useState("0");
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortField, setSortField] = useState("id");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [itemTodelete, setItemTodelete] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [editData, setEditData] = useState(null);
  const Domain = process.env.REACT_APP_API_URL;

  const getDetails = async () => {
    const url = `${Domain}/ticketIssues?limit=${sizePerPage}&offset=${offset}&search=${searchText}&sort=${sortField}&order=${sortOrder}`;
    try {
      const response = await axios.get(url);
      setData(response?.data?.rows);
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

  const handleDeleteAlert = (id) => {
    setShowDeleteModal(true);
    setItemTodelete(id);
  };

  const handleCloseDeleteModal = (e) => {
    e.preventDefault();
    setShowDeleteModal(false);
  };

  const handleCloseEditModal = (e) => {
    e.preventDefault();
    setShowEditModal(false);
  };

  const deleteItem = async () => {
    const url = `${Domain}/ticketIssues/${itemTodelete}`;
    try {
      await axios.delete(url);
      setShowDeleteModal(false);
      getDetails();
      common.notify("S", t("alert.deleteSuccess"));
    } catch (error) {
      common.notify("E", error);
    }
  };
  const handleEditClick = (rowData) => {
    setEditData(rowData);
    setShowEditModal(true);
    console.log("Row Data:", rowData);
  };

  const confirmEdit = () => {
    setShowEditModal(false);
    navigate(`/addEditTicketissues/${editData.id}`, {
      state: { rowData: editData },
    });
    console.log("Row Data to Edit:", editData);
  };

  const onTableChange = (fieldName) => {
    setSortField(fieldName);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const onSearchClick = () => {
    setOffset(0);
    setCurrentPage(1);
    getDetails();
  };

  const csvData = data.map((item) => [
    item?.id,
    item?.name,
    item?.description,
    item?.talent_group?.name,
  ]);

  return (
    <div className="form">
      <Container fluid>
        <Row>
          <Col md={12}>
            <div>
              <div className="title d-flex justify-content-between">
                <div>
                  <h1>{t("ticketissue.issuestitle")}</h1>
                </div>
                <div>
                  <Button
                    className="primary px-4"
                    type="submit"
                    onClick={() => navigate("/addEditTicketissues")}
                  >
                    {t("button.create")}
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
                          t("ticketissue.id"),
                          t("ticketissue.issuestitle"),
                          t("ticketissue.description"),
                          t("ticketissue.talent_group"),
                        ]}
                        data={csvData}
                        filename="ticket_issue.csv"
                      />
                    </Form>
                  </div>
                </div>
                <Table>
                  <thead>
                    <tr>
                      <th onClick={() => onTableChange("id")}>
                        {t("ticketissue.id")}
                        <SortingIcon
                          columnName="id"
                          sortField={sortField}
                          sortOrder={sortOrder}
                          onTableChange={onTableChange}
                        />
                      </th>
                      <th onClick={() => onTableChange("name")}>
                        {t("ticketissue.issuestitle")}
                        <SortingIcon
                          columnName="name"
                          sortField={sortField}
                          sortOrder={sortOrder}
                          onTableChange={onTableChange}
                        />
                      </th>
                      <th onClick={() => onTableChange("description")}>
                        {t("ticketissue.description")}
                        <SortingIcon
                          columnName="description"
                          sortField={sortField}
                          sortOrder={sortOrder}
                          onTableChange={onTableChange}
                        />
                      </th>
                      <th>{t("ticketissue.talent_group")}</th>
                      <th className="right-radius">
                        {t("ticketissue.actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.length > 0 ? (
                      data.map((items, index) => (
                        <tr key={index}>
                          <td>{items?.id}</td>
                          <td>{items?.name}</td>
                          <td>{items?.description}</td>
                          <td>{items?.talent_group?.name}</td>
                          <td>
                            {items.available_actions?.update === true && (
                              <span
                                className="edit me-2"
                                title="Edit"
                                onClick={() => handleEditClick(items)}
                              />
                            )}
                            {items.available_actions?.delete === true && (
                              <span
                                className="delete me-2"
                                title="Delete"
                                onClick={() => handleDeleteAlert(items.id)}
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
                  onClick={deleteItem}
                  show={showDeleteModal}
                  handleClose={handleCloseDeleteModal}
                  modalType="delete"
                ></AlertModal>
                <AlertModal
                  onClick={confirmEdit}
                  show={showEditModal}
                  handleClose={handleCloseEditModal}
                  modalType="edit"
                ></AlertModal>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default MainPage;
