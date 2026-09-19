import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Table, Badge, Button, Form, Spinner } from "react-bootstrap";
import axios from "axios";

const Domain = process.env.REACT_APP_API_URL;

const Organizations = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState([]);
  const [totalOrgs, setTotalOrgs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;


  useEffect(() => {
    fetchOrganizations();
  }, [currentPage, searchTerm]);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${Domain}/register/firms`, {
        params: {
          search: searchTerm,
          limit: pageSize,
          offset: (currentPage - 1) * pageSize,
          sort: "created_at",
          order: "desc"
        }
      });
      setOrganizations(response.data.rows || []);
      setTotalOrgs(response.data.total || 0);
    } catch (error) {
      console.error("Error fetching organizations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (id) => {
    try {
      await axios.put(`${Domain}/register/firms/${id}/activate`);
      fetchOrganizations();
    } catch (error) {
      console.error("Error activating organization:", error);
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await axios.put(`${Domain}/register/firms/${id}/deactivate`);
      fetchOrganizations();
    } catch (error) {
      console.error("Error deactivating organization:", error);
    }
  };

  const totalPages = Math.ceil(totalOrgs / pageSize);

  return (
    <div className="dataTable wrapper">
      <Container fluid>
        <Row className="mb-4 mt-3">
          <Col md={8}>
            <h4 className="dashboard-overview-title">
              <i className="fas fa-building me-2"></i>
              Organizations
            </h4>
            <p className="text-muted">Manage all client organizations</p>
          </Col>
          <Col md={4} className="d-flex justify-content-end align-items-start">
            <Button
              variant="primary"
              className="premium-btn"
              onClick={() => navigate("/organizations/create")}
              style={{
                background: "linear-gradient(135deg, #1e3c72, #2a5298)",
                border: "none",
                borderRadius: "8px",
                padding: "10px 24px",
                fontWeight: "600",
                boxShadow: "0 4px 12px rgba(30, 60, 114, 0.3)"
              }}
            >
              + Create Organization
            </Button>
          </Col>
        </Row>

        {/* Search Bar */}
        <Row className="mb-3">
          <Col md={4}>
            <Form.Control
              type="text"
              placeholder="Search organizations..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                borderRadius: "8px",
                border: "1px solid #ced4da",
                padding: "10px 16px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
              }}
            />
          </Col>
          <Col md={8} className="d-flex justify-content-end align-items-center">
            <span className="text-muted">
              Total: <strong>{totalOrgs}</strong> organizations
            </span>
          </Col>
        </Row>

        {/* Table */}
        <div className="bg-white rounded shadow-sm p-3">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Loading organizations...</p>
            </div>
          ) : organizations.length === 0 ? (
            <div className="text-center py-5">
              <h5 className="text-muted">No organizations found</h5>
              <p className="text-muted">Create your first organization to get started.</p>
            </div>
          ) : (
            <Table hover responsive className="mb-0" style={{ fontSize: "14px" }}>
              <thead style={{ backgroundColor: "#f8f9fa" }}>
                <tr>
                  <th style={{ fontWeight: "600", color: "#555" }}>#</th>
                  <th style={{ fontWeight: "600", color: "#555" }}>Organization Name</th>
                  <th style={{ fontWeight: "600", color: "#555" }}>Users</th>
                  <th style={{ fontWeight: "600", color: "#555" }}>Status</th>
                  <th style={{ fontWeight: "600", color: "#555" }}>Created</th>
                  <th style={{ fontWeight: "600", color: "#555" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((org, index) => (
                  <tr
                    key={org.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/organizations/${org.id}`)}
                  >
                    <td>{(currentPage - 1) * pageSize + index + 1}</td>
                    <td>
                      <strong style={{ color: "#1e3c72" }}>{org.name}</strong>
                    </td>
                    <td>
                      <Badge bg="info" pill style={{ fontSize: "12px" }}>
                        {org.users_count || 0}
                      </Badge>
                    </td>
                    <td>
                      {org.activated ? (
                        <Badge bg="success" pill>Active</Badge>
                      ) : (
                        <Badge bg="secondary" pill>Inactive</Badge>
                      )}
                    </td>
                    <td style={{ fontSize: "13px", color: "#666" }}>{org.created_at?.formatted || org.created_at}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="me-1"
                        onClick={() => navigate(`/organizations/${org.id}`)}
                        style={{ fontSize: "12px", borderRadius: "6px" }}
                      >
                        View
                      </Button>
                      {org.activated ? (
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleDeactivate(org.id)}
                          style={{ fontSize: "12px", borderRadius: "6px" }}
                        >
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline-success"
                          onClick={() => handleActivate(org.id)}
                          style={{ fontSize: "12px", borderRadius: "6px" }}
                        >
                          Activate
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3 px-2">
              <span className="text-muted" style={{ fontSize: "13px" }}>
                Page {currentPage} of {totalPages}
              </span>
              <div>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="me-1"
                  style={{ borderRadius: "6px" }}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  style={{ borderRadius: "6px" }}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default Organizations;
