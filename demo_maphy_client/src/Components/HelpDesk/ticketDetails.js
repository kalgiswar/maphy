import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import { useTranslation } from "react-i18next";
import axios from "axios";

const Domain = process.env.REACT_APP_API_URL;

const AddTicket = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  let { id } = useParams();
  const location = useLocation();
  const { rowData } = location.state || {};
  const [data, setData] = useState({});
  console.log("rowData", rowData);

  useEffect(() => {
    if (rowData) {
      setData(rowData);
    } else {
      const url = `${Domain}/tickets/${id}`;
      axios
        .get(url)
        .then((response) => {
          setData(response.data || {});
          console.log("Departments", response.data);
        })
        .catch((error) => {
          console.error("Error fetching ticket data:", error);
        });
    }
  }, [rowData, id]);

  const backClick = () => {
    navigate("/tickets");
  };

  return (
    <Container fluid>
      <Row>
        <Col md={12}>
          <div>
            <div className="title d-flex justify-content-between">
              <div>
                <h1>{t("helpdesk.ticketdetails")}</h1>
              </div>
              <Button onClick={backClick} className="back">
                {t("button.back")}
              </Button>
            </div>
            <div className="addProperty wrapper mb-4">
              <Row className="mb-3">
                <Col md={6}>
                  <div>
                    <>{t("helpdesk.assigned_to")}</>
                    {data?.assigned}
                  </div>
                </Col>
                <Col md={6}>
                  <div>
                    <>{t("helpdesk.ticket_issues")}</>
                    {data?.ticketIssue?.name}
                  </div>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <div>
                    <>{t("helpdesk.talent_group")}</>
                    {data?.talentGroup?.name}
                  </div>
                </Col>
                <Col md={6}>
                  <div>
                    <>{t("helpdesk.descriptions")}</>
                    {data?.description}
                  </div>
                </Col>
              </Row>
              <div className="table-container">
                <Table>
                  <thead>
                    <tr>
                      <th>{t("helpdesk.user")}</th>
                      <th>{t("helpdesk.status")}</th>
                      <th>{t("helpdesk.date")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.details?.length > 0 ? (
                      data.details.map((item, index) => (
                        <tr key={index}>
                          <td>{item.user}</td>
                          <td>{data.status}</td>
                          <td>{new Date(item.date).toLocaleDateString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" align="center">
                          {t("alert.nodatafound")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default AddTicket;
