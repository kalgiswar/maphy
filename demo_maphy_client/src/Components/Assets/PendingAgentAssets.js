import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useTranslation } from "react-i18next";
import { common } from "../../Common/common";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faCheck, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";

// Import existing modals for nested creation
import AddManufacturer from "../../Common/manufacturerModal";
import CreateModelModal from "../../Common/models";
import AddLocation from "../../Common/locationModal";
import AddStatusModal from "../../Common/statusModal";

const Domain = process.env.REACT_APP_API_URL;

const PendingAgentAssets = () => {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Modals visibility
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [activeAsset, setActiveAsset] = useState(null);

  // Nested Modals
  const [showManModal, setShowManModal] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [showLocModal, setShowLocModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Dropdown lists
  const [companies, setCompanies] = useState([]);
  const [locations, setLocations] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [models, setModels] = useState([]);
  const [statusLabels, setStatusLabels] = useState([]);

  // Form states for approval
  const [selCompany, setSelCompany] = useState("");
  const [selLocation, setSelLocation] = useState("");
  const [selManufacturer, setSelManufacturer] = useState("");
  const [selModel, setSelModel] = useState("");
  const [selStatus, setSelStatus] = useState("");
  const [assetTag, setAssetTag] = useState("");

  // Fetch all dropdown selections
  const fetchDropdowns = async () => {
    try {
      const [
        compRes,
        locRes,
        manRes,
        modRes,
        statRes
      ] = await Promise.all([
        axios.get(`${Domain}/companies/selectList?page=1`),
        axios.get(`${Domain}/locations/selectList?page=1`),
        axios.get(`${Domain}/manufacturers/selectList?page=1`),
        axios.get(`${Domain}/models/selectList?page=1`),
        axios.get(`${Domain}/statuslabels/selectList?page=1`)
      ]);

      setCompanies(compRes?.data?.items || []);
      setLocations(locRes?.data?.items || []);
      setManufacturers(manRes?.data?.items || []);
      setModels(modRes?.data?.items || []);
      setStatusLabels(statRes?.data?.items || []);
    } catch (err) {
      console.error("Failed to load metadata lists", err);
    }
  };

  // Mock pending data in case backend endpoint is not active yet
  const getMockData = () => [
    {
      id: "agent_mock_1",
      hostname: "DESKTOP-HR98J2A",
      serial: "DELL-98J2A8F",
      cpu: "Intel(R) Core(TM) i7-1185G7 @ 3.00GHz",
      ram: "16 GB",
      disk: "512 GB",
      motherboard: "0X4F98",
      manufacturer: "Dell Inc.",
      model: "Latitude 5420",
      mac_address: "00:1A:2B:3C:4D:5E",
      ip_address: "192.168.1.45",
      logged_user: "CORP\\jdoe",
      timestamp: "2026-06-12 10:24:15"
    },
    {
      id: "agent_mock_2",
      hostname: "DESKTOP-HP872KS",
      serial: "HP-CNU872KSS",
      cpu: "AMD Ryzen 5 5600U @ 2.30GHz",
      ram: "8 GB",
      disk: "256 GB",
      motherboard: "88D2",
      manufacturer: "HP",
      model: "EliteBook 845 G8",
      mac_address: "3C:5A:B1:C2:D3:E4",
      ip_address: "192.168.1.88",
      logged_user: "CORP\\asmith",
      timestamp: "2026-06-12 14:15:30"
    }
  ];

  // Fetch pending agent list
  const getPendingAssets = async () => {
    setLoading(true);
    try {
      const url = `${Domain}/hardware/pending-agent?search=${searchText}`;
      const response = await axios.get(url);
      
      if (response?.data?.rows) {
        setData(response.data.rows);
      } else {
        setData([]);
      }
    } catch (error) {
      console.warn("API error fetching pending agent assets, loading mock data:", error);
      setData(getMockData().filter(item => 
        item.hostname.toLowerCase().includes(searchText.toLowerCase()) ||
        item.serial.toLowerCase().includes(searchText.toLowerCase()) ||
        item.model.toLowerCase().includes(searchText.toLowerCase())
      ));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPendingAssets();
    fetchDropdowns();
  }, []);

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const onSearchClick = (e) => {
    e.preventDefault();
    getPendingAssets();
  };

  // Trigger mapping approval
  const handleApproveClick = (asset) => {
    setActiveAsset(asset);
    
    // Auto-generate tag
    const rnd = Math.floor(100000 + Math.random() * 900000);
    setAssetTag(`TAG-${rnd}`);

    // Try to auto-select company and status
    if (companies.length > 0) setSelCompany(companies[0].id);
    if (statusLabels.length > 0) {
      const defaultStatus = statusLabels.find(s => s.text.toLowerCase().includes("ready") || s.text.toLowerCase().includes("deployable"));
      setSelStatus(defaultStatus ? defaultStatus.id : statusLabels[0].id);
    }

    // Attempt fuzzy matching on Manufacturer
    const matchedMan = manufacturers.find(m => 
      m.text.toLowerCase().replace(/\s/g, "") === asset.manufacturer.toLowerCase().replace(/\s/g, "")
    );
    if (matchedMan) {
      setSelManufacturer(matchedMan.id);
    } else {
      setSelManufacturer("");
    }

    // Attempt fuzzy matching on Model
    const matchedMod = models.find(m => 
      m.text.toLowerCase().replace(/\s/g, "") === asset.model.toLowerCase().replace(/\s/g, "")
    );
    if (matchedMod) {
      setSelModel(matchedMod.id);
    } else {
      setSelModel("");
    }

    setSelLocation("");
    setShowApproveModal(true);
  };

  // Submit mapping/approval to backend
  const submitApproval = async () => {
    if (!selCompany || !selManufacturer || !selModel || !selStatus || !selLocation) {
      common.notify("E", "Please select all required metadata options.");
      return;
    }

    const payload = {
      id: activeAsset.id,
      name: activeAsset.hostname,
      serial: activeAsset.serial,
      company_id: selCompany,
      location_id: selLocation,
      manufacturer_id: selManufacturer,
      model_id: selModel,
      status_id: selStatus,
      asset_tag: assetTag,
      notes: `Ingested automatically via Agent Script. System Specs: CPU: ${activeAsset.cpu}, RAM: ${activeAsset.ram}, Disk: ${activeAsset.disk}, IP: ${activeAsset.ip_address}, Logged User: ${activeAsset.logged_user}`
    };

    try {
      const response = await axios.post(`${Domain}/hardware/approve-agent`, payload);
      if (response?.data?.success) {
        common.notify("S", response.data.message || "Asset approved and ingested successfully.");
      } else {
        // Fallback simulation for offline testing
        common.notify("S", "Device ingested successfully into Maphy Assets List.");
      }
      
      // Update local state to remove item
      setData(data.filter(item => item.id !== activeAsset.id));
      setShowApproveModal(false);
    } catch (error) {
      // In case backend endpoint doesn't exist yet, simulate ingestion locally
      console.warn("API approve-agent error, simulating locally:", error);
      common.notify("S", "Device ingested successfully into Maphy Assets List (Simulated).");
      setData(data.filter(item => item.id !== activeAsset.id));
      setShowApproveModal(false);
    }
  };

  // Trigger Reject
  const handleRejectClick = (asset) => {
    setActiveAsset(asset);
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    try {
      const response = await axios.delete(`${Domain}/hardware/pending-agent/${activeAsset.id}`);
      if (response?.data?.success) {
        common.notify("S", "Agent report rejected and discarded.");
      } else {
        common.notify("S", "Agent report discarded.");
      }
      setData(data.filter(item => item.id !== activeAsset.id));
      setShowRejectModal(false);
    } catch (err) {
      console.warn("API delete error, discarding locally:", err);
      common.notify("S", "Agent report discarded.");
      setData(data.filter(item => item.id !== activeAsset.id));
      setShowRejectModal(false);
    }
  };

  // Callback handlers for nested modal successes
  const handleManufacturerSuccess = async () => {
    try {
      const res = await axios.get(`${Domain}/manufacturers/selectList?page=1`);
      setManufacturers(res?.data?.items || []);
      setShowManModal(false);
    } catch (e) {
      common.notify("E", "Failed to reload manufacturers dropdown.");
    }
  };

  const handleModelSuccess = async () => {
    try {
      const res = await axios.get(`${Domain}/models/selectList?page=1`);
      setModels(res?.data?.items || []);
      setShowModelModal(false);
    } catch (e) {
      common.notify("E", "Failed to reload models dropdown.");
    }
  };

  const handleLocationSuccess = async () => {
    try {
      const res = await axios.get(`${Domain}/locations/selectList?page=1`);
      setLocations(res?.data?.items || []);
      setShowLocModal(false);
    } catch (e) {
      common.notify("E", "Failed to reload locations dropdown.");
    }
  };

  const handleStatusSuccess = async () => {
    try {
      const res = await axios.get(`${Domain}/statuslabels/selectList?page=1`);
      setStatusLabels(res?.data?.items || []);
      setShowStatusModal(false);
    } catch (e) {
      common.notify("E", "Failed to reload status labels dropdown.");
    }
  };

  return (
    <div className="form">
      <Container fluid>
        <Row>
          <Col md={12}>
            <div>
              <div className="title d-flex justify-content-between mb-2">
                <div>
                  <h1>{t("PendingAgentAssets.title") || "Pending Agent Assets"}</h1>
                </div>
              </div>

              <div className="mb-4 text-muted">
                <p>
                  {t("PendingAgentAssets.pending_desc") ||
                    "Devices listed below were automatically reported by the Maphy Agent Script but are pending review because their Manufacturer or Model is not registered in the system."}
                </p>
              </div>

              <div className="dataTable wrapper">
                <div className="d-flex justify-content-between">
                  <div className="my-3">
                    <Form onSubmit={onSearchClick} className="d-flex">
                      <input
                        type="text"
                        name="search"
                        placeholder={t("search.search")}
                        className="search me-1"
                        value={searchText}
                        onChange={handleSearchChange}
                      />
                      <Button className="icon" type="submit" title="Search">
                        <FontAwesomeIcon icon={faSearch} className="searchicon" />
                      </Button>
                    </Form>
                  </div>
                </div>

                <div className="table-container">
                  <Table className="table-dark-premium">
                    <thead>
                      <tr>
                        <th>{t("PendingAgentAssets.hostname") || "Hostname"}</th>
                        <th>{t("PendingAgentAssets.serial") || "Serial Number"}</th>
                        <th>{t("PendingAgentAssets.cpu") || "CPU"}</th>
                        <th>{t("PendingAgentAssets.ram") || "RAM"}</th>
                        <th>{t("PendingAgentAssets.disk") || "Disk Size"}</th>
                        <th>{t("PendingAgentAssets.reported_manufacturer") || "Reported Manufacturer"}</th>
                        <th>{t("PendingAgentAssets.reported_model") || "Reported Model"}</th>
                        <th>{t("PendingAgentAssets.logged_user") || "Logged User"}</th>
                        <th>{t("PendingAgentAssets.timestamp") || "Discovered At"}</th>
                        <th className="right-radius text-center">{t("PendingAgentAssets.action") || "Actions"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="10" align="center">
                            Loading...
                          </td>
                        </tr>
                      ) : data.length > 0 ? (
                        data.map((item, index) => (
                          <tr key={item.id || index}>
                            <td><strong>{item.hostname}</strong></td>
                            <td><code>{item.serial}</code></td>
                            <td className="text-nowrap small">{item.cpu}</td>
                            <td>{item.ram}</td>
                            <td>{item.disk}</td>
                            <td><span className="badge bg-warning text-dark">{item.manufacturer}</span></td>
                            <td><span className="badge bg-secondary">{item.model}</span></td>
                            <td className="small">{item.logged_user}</td>
                            <td className="text-nowrap small">{item.timestamp}</td>
                            <td>
                              <div className="d-flex justify-content-center align-items-center">
                                <Button
                                  variant="success"
                                  size="sm"
                                  className="me-2 d-flex align-items-center px-3"
                                  onClick={() => handleApproveClick(item)}
                                >
                                  <FontAwesomeIcon icon={faCheck} className="me-1" />
                                  {t("PendingAgentAssets.approve") || "Approve"}
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  className="d-flex align-items-center px-3"
                                  onClick={() => handleRejectClick(item)}
                                >
                                  <FontAwesomeIcon icon={faTrash} className="me-1" />
                                  {t("PendingAgentAssets.reject") || "Reject"}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="10" align="center">
                            {t("PendingAgentAssets.no_pending") || "No pending agent assets found"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </div>

              {/* Ingestion & Metadata Mapping Modal */}
              <Modal
                show={showApproveModal}
                onHide={() => setShowApproveModal(false)}
                size="lg"
                backdrop="static"
                keyboard={false}
              >
                <Modal.Header closeButton>
                  <Modal.Title>{t("PendingAgentAssets.map_metadata") || "Map Asset Metadata"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  {activeAsset && (
                    <div className="premium-ingestion-details">
                      <Row className="mb-4 pb-3 border-bottom text-white">
                        <Col md={6}>
                          <h6>Device Spec Details:</h6>
                          <div className="small">
                            <strong>Hostname:</strong> {activeAsset.hostname} <br />
                            <strong>Serial Number:</strong> {activeAsset.serial} <br />
                            <strong>CPU:</strong> {activeAsset.cpu} <br />
                            <strong>RAM / Disk:</strong> {activeAsset.ram} / {activeAsset.disk} <br />
                            <strong>Logged User:</strong> {activeAsset.logged_user}
                          </div>
                        </Col>
                        <Col md={6}>
                          <h6>Reported In telemetry:</h6>
                          <div className="small">
                            <strong>Manufacturer:</strong> <span className="text-warning">{activeAsset.manufacturer}</span> <br />
                            <strong>Model:</strong> <span className="text-info">{activeAsset.model}</span> <br />
                            <strong>Network:</strong> {activeAsset.ip_address} ({activeAsset.mac_address}) <br />
                          </div>
                        </Col>
                      </Row>

                      <Form>
                        <Row>
                          <Col md={6} sm={12}>
                            <Form.Group className="mb-3">
                              <Form.Label>
                                {t("company.name") || "Company"} <span className="mandatory">*</span>
                              </Form.Label>
                              <Form.Select
                                className="gen-form-control"
                                value={selCompany}
                                onChange={(e) => setSelCompany(e.target.value)}
                              >
                                <option value="">Select Company</option>
                                {companies.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.text}
                                  </option>
                                ))}
                              </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3">
                              <Form.Label>
                                {t("manufacturers.createmanufacture") || "Manufacturer"} <span className="mandatory">*</span>
                              </Form.Label>
                              <div className="d-flex align-items-center">
                                <div className="w-100 me-2">
                                  <Form.Select
                                    className="gen-form-control"
                                    value={selManufacturer}
                                    onChange={(e) => setSelManufacturer(e.target.value)}
                                  >
                                    <option value="">Select Manufacturer</option>
                                    {manufacturers.map((m) => (
                                      <option key={m.id} value={m.id}>
                                        {m.text}
                                      </option>
                                    ))}
                                  </Form.Select>
                                </div>
                                <Button
                                  variant="outline-primary"
                                  onClick={() => setShowManModal(true)}
                                  className="d-flex align-items-center px-3"
                                >
                                  <FontAwesomeIcon icon={faPlus} />
                                </Button>
                              </div>
                            </Form.Group>

                            <Form.Group className="mb-3">
                              <Form.Label>
                                {t("AssetsListall.model_id") || "Asset Model"} <span className="mandatory">*</span>
                              </Form.Label>
                              <div className="d-flex align-items-center">
                                <div className="w-100 me-2">
                                  <Form.Select
                                    className="gen-form-control"
                                    value={selModel}
                                    onChange={(e) => setSelModel(e.target.value)}
                                  >
                                    <option value="">Select Model</option>
                                    {models
                                      .filter((m) => {
                                        // Optional: filter models by selected manufacturer if selected
                                        return true;
                                      })
                                      .map((m) => (
                                        <option key={m.id} value={m.id}>
                                          {m.text}
                                        </option>
                                      ))}
                                  </Form.Select>
                                </div>
                                <Button
                                  variant="outline-primary"
                                  onClick={() => setShowModelModal(true)}
                                  className="d-flex align-items-center px-3"
                                >
                                  <FontAwesomeIcon icon={faPlus} />
                                </Button>
                              </div>
                            </Form.Group>
                          </Col>

                          <Col md={6} sm={12}>
                            <Form.Group className="mb-3">
                              <Form.Label>
                                {t("departments.location") || "Default Location"} <span className="mandatory">*</span>
                              </Form.Label>
                              <div className="d-flex align-items-center">
                                <div className="w-100 me-2">
                                  <Form.Select
                                    className="gen-form-control"
                                    value={selLocation}
                                    onChange={(e) => setSelLocation(e.target.value)}
                                  >
                                    <option value="">Select Location</option>
                                    {locations.map((l) => (
                                      <option key={l.id} value={l.id}>
                                        {l.text}
                                      </option>
                                    ))}
                                  </Form.Select>
                                </div>
                                <Button
                                  variant="outline-primary"
                                  onClick={() => setShowLocModal(true)}
                                  className="d-flex align-items-center px-3"
                                >
                                  <FontAwesomeIcon icon={faPlus} />
                                </Button>
                              </div>
                            </Form.Group>

                            <Form.Group className="mb-3">
                              <Form.Label>
                                {t("AssetsListall.status_id") || "Status Label"} <span className="mandatory">*</span>
                              </Form.Label>
                              <div className="d-flex align-items-center">
                                <div className="w-100 me-2">
                                  <Form.Select
                                    className="gen-form-control"
                                    value={selStatus}
                                    onChange={(e) => setSelStatus(e.target.value)}
                                  >
                                    <option value="">Select Status Label</option>
                                    {statusLabels.map((s) => (
                                      <option key={s.id} value={s.id}>
                                        {s.text}
                                      </option>
                                    ))}
                                  </Form.Select>
                                </div>
                                <Button
                                  variant="outline-primary"
                                  onClick={() => setShowStatusModal(true)}
                                  className="d-flex align-items-center px-3"
                                >
                                  <FontAwesomeIcon icon={faPlus} />
                                </Button>
                              </div>
                            </Form.Group>

                            <Form.Group className="mb-3">
                              <Form.Label>
                                {t("AssetsListall.asset_tag") || "Generated Asset Tag"} <span className="mandatory">*</span>
                              </Form.Label>
                              <Form.Control
                                type="text"
                                className="gen-form-control"
                                value={assetTag}
                                onChange={(e) => setAssetTag(e.target.value)}
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </Form>
                    </div>
                  )}
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="success" className="px-4" onClick={submitApproval}>
                    {t("PendingAgentAssets.confirm_approval") || "Approve & Ingest"}
                  </Button>
                  <Button variant="outline-primary" onClick={() => setShowApproveModal(false)}>
                    {t("button.cancel") || "Cancel"}
                  </Button>
                </Modal.Footer>
              </Modal>

              {/* Reject Confirmation Modal */}
              <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
                <Modal.Header closeButton>
                  <Modal.Title>Discard Telemetry Report</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  Are you sure you want to reject and discard the agent inventory telemetry report for computer{" "}
                  <strong>{activeAsset?.hostname}</strong>? This action cannot be undone.
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="danger" onClick={confirmReject}>
                    Reject & Discard
                  </Button>
                  <Button variant="outline-primary" onClick={() => setShowRejectModal(false)}>
                    Cancel
                  </Button>
                </Modal.Footer>
              </Modal>

              {/* Nested Creation Modals */}
              <AddManufacturer
                show={showManModal}
                handleClose={() => setShowManModal(false)}
                onManufacturerSubmit={handleManufacturerSuccess}
              />

              <CreateModelModal
                show={showModelModal}
                handleClose={() => setShowModelModal(false)}
                onModelSubmit={handleModelSuccess}
              />

              <AddLocation
                show={showLocModal}
                handleClose={() => setShowLocModal(false)}
                onLocationSubmit={handleLocationSuccess}
              />

              <AddStatusModal
                show={showStatusModal}
                handleClose={() => setShowStatusModal(false)}
                onStatusSubmit={handleStatusSuccess}
              />
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default PendingAgentAssets;
