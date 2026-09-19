import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Table, Badge, Button, Tabs, Tab, Card, Spinner, Modal, Form } from "react-bootstrap";
import axios from "axios";
import AlertModal from "../../Common/NotificationModal";
import { common } from "../../Common/common";

const Domain = process.env.REACT_APP_API_URL;

const OrganizationDetails = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [org, setOrg] = useState(null);
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [groups, setGroups] = useState([]);
  const [totalGroups, setTotalGroups] = useState(0);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");

  // Subscription modal
  const [showSubModal, setShowSubModal] = useState(false);
  const [subDays, setSubDays] = useState(30);
  const [subAmount, setSubAmount] = useState("");
  const [subDesc, setSubDesc] = useState("");

  // Group deletion modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState("");

  const userpermission = JSON.parse(localStorage.getItem("permissions") || "{}");
  const isSuperuser = userpermission?.superuser === "1" || userpermission?.superuser === 1 || userpermission?.superuser === true || userpermission?.superuser === "true";
  const isAdmin = userpermission?.admin === true;
  const canEditGroups = isSuperuser || userpermission?.edit_group_permissions === true || userpermission?.edit_group_permissions === "1" || userpermission?.edit_group_permissions === 1 || userpermission?.edit_group_permissions === "true";

  useEffect(() => {
    fetchOrgDetails();
    fetchOrgUsers();
    fetchOrgGroups();
    fetchOrgSummary();
  }, [id]);

  const fetchOrgGroups = async () => {
    try {
      const response = await axios.get(`${Domain}/groups`, {
        headers: { "X-Selected-Org": id },
        params: { sort: "name", order: "asc", limit: 100, offset: 0 }
      });
      setGroups(response.data.rows || []);
      setTotalGroups(response.data.total || 0);
    } catch (error) {
      console.error("Error fetching org groups:", error);
    }
  };

  const [deleteType, setDeleteType] = useState("group");

  const handleDeleteAlert = (itemId, type = "group") => {
    setItemToDelete(itemId);
    setDeleteType(type);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setShowDeleteModal(false);
  };

  const deleteItem = async () => {
    try {
      if (deleteType === "user") {
        await axios.delete(`${Domain}/users/${itemToDelete}`);
        setShowDeleteModal(false);
        fetchOrgUsers();
        fetchOrgSummary();
        common.notify("S", "User deleted successfully");
      } else {
        await axios.delete(`${Domain}/groups/${itemToDelete}`, {
          headers: { "X-Selected-Org": id }
        });
        setShowDeleteModal(false);
        fetchOrgGroups();
        fetchOrgSummary();
        common.notify("S", "Group deleted successfully");
      }
    } catch (error) {
      console.error(`Error deleting ${deleteType}:`, error);
      common.notify("E", `Failed to delete ${deleteType}`);
    }
  };

  const fetchOrgDetails = async () => {
    try {
      const response = await axios.get(`${Domain}/register/firms/${id}`);
      setOrg(response.data);
    } catch (error) {
      console.error("Error fetching org details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrgUsers = async () => {
    try {
      const response = await axios.get(`${Domain}/register/firms/${id}/users`, {
        params: { sort: "created_at", order: "desc", limit: 100, offset: 0 }
      });
      setUsers(response.data.rows || []);
      setTotalUsers(response.data.total || 0);
    } catch (error) {
      console.error("Error fetching org users:", error);
    }
  };

  const fetchOrgSummary = async () => {
    try {
      const response = await axios.get(`${Domain}/register/firms/${id}/summary`);
      setSummary(response.data);
    } catch (error) {
      console.error("Error fetching org summary:", error);
    }
  };

  const handleActivate = async () => {
    try {
      await axios.put(`${Domain}/register/firms/${id}/activate`);
      fetchOrgDetails();
    } catch (error) {
      console.error("Error activating:", error);
    }
  };

  const handleDeactivate = async () => {
    try {
      await axios.put(`${Domain}/register/firms/${id}/deactivate`);
      fetchOrgDetails();
    } catch (error) {
      console.error("Error deactivating:", error);
    }
  };

  const handleAddSubscription = async () => {
    try {
      await axios.put(`${Domain}/register/firms/${id}/subscription`, {
        number_of_days: subDays,
        amount: subAmount,
        description: subDesc
      });
      setShowSubModal(false);
      fetchOrgDetails();
    } catch (error) {
      console.error("Error adding subscription:", error);
    }
  };

  if (loading) {
    return (
      <div className="dataTable wrapper">
        <Container fluid>
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted">Loading organization details...</p>
          </div>
        </Container>
      </div>
    );
  }

  if (!org || !org.id) {
    return (
      <div className="dataTable wrapper">
        <Container fluid>
          <div className="text-center py-5">
            <h5 className="text-muted">Organization not found</h5>
            <Button variant="link" onClick={() => navigate("/organizations")}>
              ← Back to Organizations
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="dataTable wrapper">
      <Container fluid>
        {/* Back & Title */}
        <Row className="mb-3 mt-3">
          <Col md={12}>
            <Button
              variant="link"
              onClick={() => navigate("/organizations")}
              style={{ color: "#1e3c72", textDecoration: "none", padding: 0, marginBottom: "12px" }}
            >
              ← Back to Organizations
            </Button>
          </Col>
        </Row>

        {/* Org Info Card */}
        <Card className="shadow-sm mb-4" style={{ borderRadius: "12px", border: "none", overflow: "hidden" }}>
          <Card.Header
            style={{
              background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
              color: "#fff",
              padding: "20px 24px",
              borderBottom: "none"
            }}
          >
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3">
              <div>
                <h4 className="mb-1" style={{ fontWeight: "700" }}>{org.name}</h4>
                <div>
                  {org.activated ? (
                    <Badge bg="success" pill className="me-2">Active</Badge>
                  ) : (
                    <Badge bg="secondary" pill className="me-2">Inactive</Badge>
                  )}
                </div>
              </div>
              <div className="d-flex gap-2">
                {org.activated && (
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => {
                      localStorage.setItem("selectedOrgId", org.id);
                      localStorage.setItem("selectedOrgName", org.name || org.text || "");
                      navigate("/dashboard");
                      window.location.reload();
                    }}
                    style={{ borderRadius: "6px", fontWeight: "500", backgroundColor: "#28a745", border: "none" }}
                  >
                    🚀 Switch to Org Dashboard
                  </Button>
                )}
                {org.activated ? (
                  <Button
                    size="sm"
                    variant="outline-light"
                    onClick={handleDeactivate}
                    style={{ borderRadius: "6px" }}
                  >
                    Deactivate
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline-light"
                    onClick={handleActivate}
                    style={{ borderRadius: "6px" }}
                  >
                    Activate
                  </Button>
                )}
              </div>
            </div>
          </Card.Header>

          {/* Summary Stats */}
          {summary && (
            <Card.Body className="p-0">
              <Row className="g-0 text-center">
                <Col className="col-6 col-md p-3 border-end border-bottom border-md-bottom-0">
                  <div style={{ fontSize: "24px", fontWeight: "700", color: "#1e3c72" }}>
                    {summary.users_count}
                  </div>
                  <div className="text-muted" style={{ fontSize: "13px" }}>Users</div>
                </Col>
                <Col className="col-6 col-md p-3 border-bottom border-md-bottom-0 border-md-end">
                  <div style={{ fontSize: "24px", fontWeight: "700", color: "#2196f3" }}>
                    {summary.assets_count}
                  </div>
                  <div className="text-muted" style={{ fontSize: "13px" }}>Assets</div>
                </Col>
                <Col className="col-6 col-md p-3 border-end border-bottom border-md-bottom-0">
                  <div style={{ fontSize: "24px", fontWeight: "700", color: "#4caf50" }}>
                    {summary.licenses_count}
                  </div>
                  <div className="text-muted" style={{ fontSize: "13px" }}>Licenses</div>
                </Col>
                <Col className="col-6 col-md p-3 border-bottom border-md-bottom-0 border-md-end">
                  <div style={{ fontSize: "24px", fontWeight: "700", color: "#ff9800" }}>
                    {summary.accessories_count}
                  </div>
                  <div className="text-muted" style={{ fontSize: "13px" }}>Accessories</div>
                </Col>
                <Col className="col-12 col-md p-3 border-bottom-0 border-md-bottom-0">
                  <div style={{ fontSize: "24px", fontWeight: "700", color: "#9c27b0" }}>
                    {summary.consumables_count}
                  </div>
                  <div className="text-muted" style={{ fontSize: "13px" }}>Consumables</div>
                </Col>
              </Row>
            </Card.Body>
          )}
        </Card>

        {/* Tabs: Users */}
        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
          <Tab eventKey="users" title={`Users (${totalUsers})`}>
            <div className="bg-white rounded shadow-sm p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 style={{ fontWeight: "600", color: "#333", margin: 0 }}>Organization Users</h5>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => navigate(`/organizations/${id}/users/create`)}
                  style={{
                    background: "linear-gradient(135deg, #1e3c72, #2a5298)",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: "500"
                  }}
                >
                  + Add User
                </Button>
              </div>

              {users.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">No users in this organization yet.</p>
                </div>
              ) : (
                <Table hover responsive style={{ fontSize: "14px" }}>
                  <thead style={{ backgroundColor: "#f8f9fa" }}>
                    <tr>
                      <th style={{ fontWeight: "600", color: "#555" }}>#</th>
                      <th style={{ fontWeight: "600", color: "#555" }}>Name</th>
                      <th style={{ fontWeight: "600", color: "#555" }}>Email</th>
                      <th style={{ fontWeight: "600", color: "#555" }}>Job Title</th>
                      <th style={{ fontWeight: "600", color: "#555" }}>Group</th>
                      <th style={{ fontWeight: "600", color: "#555" }}>Status</th>
                      <th style={{ fontWeight: "600", color: "#555" }}>Created</th>
                      <th style={{ fontWeight: "600", color: "#555" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr key={user.id}>
                        <td>{index + 1}</td>
                        <td>
                          <strong style={{ color: "#333" }}>{user.name}</strong>
                        </td>
                        <td>{user.email}</td>
                        <td>{user.jobtitle || "-"}</td>
                        <td>
                          {user.groups && user.groups.length > 0
                            ? user.groups.map(g => (
                                <Badge key={g.id} bg="info" pill className="me-1" style={{ fontSize: "11px" }}>
                                  {g.name}
                                </Badge>
                              ))
                            : "-"
                          }
                        </td>
                        <td>
                          {user.activated ? (
                            <Badge bg="success" pill style={{ fontSize: "11px" }}>Active</Badge>
                          ) : (
                            <Badge bg="secondary" pill style={{ fontSize: "11px" }}>Inactive</Badge>
                          )}
                        </td>
                        <td style={{ fontSize: "13px", color: "#666" }}>{user.created_at?.formatted || user.created_at}</td>
                        <td>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDeleteAlert(user.id, "user")}
                            style={{ borderRadius: "4px" }}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </div>
          </Tab>
          <Tab eventKey="groups" title={`Groups (${totalGroups})`}>
            <div className="bg-white rounded shadow-sm p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 style={{ fontWeight: "600", color: "#333", margin: 0 }}>Organization Groups</h5>
                {canEditGroups && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => navigate(`/organizations/${id}/groups/create`)}
                    style={{
                      background: "linear-gradient(135deg, #1e3c72, #2a5298)",
                      border: "none",
                      borderRadius: "6px",
                      fontWeight: "500"
                    }}
                  >
                    + Add Group
                  </Button>
                )}
              </div>

              {groups.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">No groups in this organization yet.</p>
                </div>
              ) : (
                <Table hover responsive style={{ fontSize: "14px" }}>
                  <thead style={{ backgroundColor: "#f8f9fa" }}>
                    <tr>
                      <th style={{ fontWeight: "600", color: "#555" }}>#</th>
                      <th style={{ fontWeight: "600", color: "#555" }}>Group Name</th>
                      <th style={{ fontWeight: "600", color: "#555" }}>Users Count</th>
                      <th style={{ fontWeight: "600", color: "#555" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups.map((group, index) => (
                      <tr key={group.id}>
                        <td>{index + 1}</td>
                        <td>
                          <strong style={{ color: "#333" }}>{group.name}</strong>
                        </td>
                        <td>{group.users_count || 0}</td>
                        <td>
                          {canEditGroups && (
                            <>
                              <Button
                                size="sm"
                                variant="outline-primary"
                                className="me-2"
                                onClick={() => navigate(`/organizations/${id}/groups/edit/${group.id}`)}
                                style={{ borderRadius: "4px" }}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => handleDeleteAlert(group.id)}
                                style={{ borderRadius: "4px" }}
                              >
                                Delete
                              </Button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </div>
          </Tab>
        </Tabs>
        <AlertModal
          onClick={deleteItem}
          show={showDeleteModal}
          handleClose={handleCloseDeleteModal}
          modalType="delete"
        ></AlertModal>

        {/* Subscription Modal */}
        <Modal show={showSubModal} onHide={() => setShowSubModal(false)} centered>
          <Modal.Header
            closeButton
            style={{
              background: "linear-gradient(135deg, #1e3c72, #2a5298)",
              color: "#fff",
              borderBottom: "none"
            }}
          >
            <Modal.Title>Add Subscription</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: "500" }}>Number of Days</Form.Label>
              <Form.Control
                type="number"
                value={subDays}
                onChange={(e) => setSubDays(e.target.value)}
                style={{ borderRadius: "8px" }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: "500" }}>Amount</Form.Label>
              <Form.Control
                type="number"
                value={subAmount}
                onChange={(e) => setSubAmount(e.target.value)}
                placeholder="Subscription amount"
                style={{ borderRadius: "8px" }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: "500" }}>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={subDesc}
                onChange={(e) => setSubDesc(e.target.value)}
                placeholder="Subscription description"
                style={{ borderRadius: "8px" }}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer style={{ borderTop: "none" }}>
            <Button variant="secondary" onClick={() => setShowSubModal(false)}>Cancel</Button>
            <Button
              onClick={handleAddSubscription}
              style={{
                background: "linear-gradient(135deg, #1e3c72, #2a5298)",
                border: "none",
                borderRadius: "8px"
              }}
            >
              Add Subscription
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default OrganizationDetails;
