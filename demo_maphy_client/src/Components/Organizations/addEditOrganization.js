import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Form, Button, Alert, Card, Modal } from "react-bootstrap";
import axios from "axios";
import Select from "react-select";
import AddEditLocations from "../Settings/Location/addEditLocation";

const Domain = process.env.REACT_APP_API_URL;

const AddEditOrganization = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [locations, setLocations] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const [formData, setFormData] = useState({
    org_name: "",
    activated: true
  });

  const fetchLocations = async () => {
    try {
      const response = await axios.get(`${Domain}/locations/selectList?page=1`);
      if (response.data && response.data.items) {
        const formatted = response.data.items.map(loc => ({
          value: loc.id,
          label: loc.text
        }));
        setLocations(formatted);
      }
    } catch (err) {
      console.error("Error loading locations:", err);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.org_name.trim()) {
      setError("Organization name is required");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${Domain}/register/firms`, {
        name: formData.org_name,
        activated: formData.activated ? 1 : 0,
        location_ids: selectedLocations.map(loc => loc.value)
      });

      if (response.data?.errorMessage) {
        setError(response.data.errorMessage);
      } else if (response.data?.id || response.data?.result?.id) {
        setSuccess("Organization created successfully!");
        setTimeout(() => {
          navigate("/organizations");
        }, 1500);
      } else {
        setError("Unexpected response. Please try again.");
      }
    } catch (err) {
      console.error("Error creating organization:", err);
      setError(err.response?.data?.message || "Failed to create organization");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dataTable wrapper">
      <Container fluid>
        <Row className="mb-4 mt-3">
          <Col md={12}>
            <Button
              variant="link"
              onClick={() => navigate("/organizations")}
              style={{ color: "#1e3c72", textDecoration: "none", padding: 0, marginBottom: "12px" }}
            >
              ← Back to Organizations
            </Button>
            <h4 className="dashboard-overview-title">
              Create New Organization
            </h4>
            <p className="text-muted">Set up a new client organization</p>
          </Col>
        </Row>

        {error && <Alert variant="danger" onClose={() => setError("")} dismissible>{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Row className="justify-content-center">
            {/* Organization Info */}
            <Col md={6}>
              <Card className="shadow-sm mb-4" style={{ borderRadius: "12px", border: "none" }}>
                <Card.Header style={{
                  background: "linear-gradient(135deg, #1e3c72, #2a5298)",
                  color: "#fff",
                  borderRadius: "12px 12px 0 0",
                  fontWeight: "600",
                  padding: "16px 20px"
                }}>
                  Organization Details
                </Card.Header>
                <Card.Body className="p-4">
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: "500", color: "#333" }}>
                      Organization Name <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="org_name"
                      value={formData.org_name}
                      onChange={handleChange}
                      placeholder="Enter organization name"
                      style={{ borderRadius: "8px", padding: "10px 14px" }}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: "500", color: "#333" }}>
                      Branch Locations
                    </Form.Label>
                    <div className="d-flex gap-2 align-items-center">
                      <div style={{ flex: 1 }}>
                        <Select
                          isMulti
                          options={locations}
                          value={selectedLocations}
                          onChange={(options) => setSelectedLocations(options || [])}
                          placeholder="Select locations..."
                          className="basic-multi-select"
                          classNamePrefix="select"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="primary"
                        onClick={() => setShowLocationModal(true)}
                        style={{
                          height: "38px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "linear-gradient(135deg, #1e3c72, #2a5298)",
                          border: "none"
                        }}
                      >
                        +
                      </Button>
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      id="activated-switch"
                      name="activated"
                      label="Activate immediately"
                      checked={formData.activated}
                      onChange={handleChange}
                      style={{ fontWeight: "500" }}
                    />
                  </Form.Group>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Submit */}
          <Row className="justify-content-center">
            <Col md={6} className="d-flex justify-content-end gap-2 mb-4">
              <Button
                variant="secondary"
                onClick={() => navigate("/organizations")}
                style={{ borderRadius: "8px", padding: "10px 24px" }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                style={{
                  background: "linear-gradient(135deg, #1e3c72, #2a5298)",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 32px",
                  fontWeight: "600",
                  boxShadow: "0 4px 12px rgba(30, 60, 114, 0.3)"
                }}
              >
                {loading ? "Creating..." : "Create Organization"}
              </Button>
            </Col>
          </Row>
        </Form>

        <Modal show={showLocationModal} onHide={() => setShowLocationModal(false)} size="xl" backdrop="static" keyboard={false}>
          <Modal.Header closeButton>
            <Modal.Title>Create Branch Location</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <AddEditLocations
              isModal={true}
              handleClose={() => setShowLocationModal(false)}
              onSuccess={async (newLoc) => {
                setShowLocationModal(false);
                try {
                  const response = await axios.get(`${Domain}/locations/selectList?page=1`);
                  if (response.data && response.data.items) {
                    const formatted = response.data.items.map(loc => ({
                      value: loc.id,
                      label: loc.text
                    }));
                    setLocations(formatted);
                    if (newLoc && newLoc.id) {
                      const matched = formatted.find(l => Number(l.value) === Number(newLoc.id));
                      if (matched) {
                        setSelectedLocations(prev => [...prev, matched]);
                      }
                    }
                  }
                } catch (err) {
                  console.error("Error refreshing locations:", err);
                }
              }}
            />
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
};

export default AddEditOrganization;
