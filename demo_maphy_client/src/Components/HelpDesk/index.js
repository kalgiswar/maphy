import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, Tab, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import TicketCreate from "../HelpDesk/createTicket";
import TicketsByStatus from "../HelpDesk/ticketByStatus";
import TicketChart from "../HelpDesk/ticketChart";
import MyTickets from "../HelpDesk/ticketByStatus";
import Switch from "react-switch";
import axios from "axios";
import {jwtDecode} from "jwt-decode"; // Fixed import

const Domain = process.env.REACT_APP_API_URL;

const TicketMain = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [state, setState] = useState({
    showAvailableStatus: false,
    showTalentGroupTabs: false,
    hiddenShowTicketChart: true,
    isManager: false,
  });
  const [showTicket, setShowTicket] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [userId, setUserId] = useState("");
  const [talentGroupId, setTalentGroupId] = useState("");
  const [userType, setUsertype] = useState("");
  const [activeTab, setActiveTab] = useState("myTickets");
  const [availabilityStatus, setAvailabilityStatus] = useState(false); // Ensure this is boolean

  useEffect(() => {
    const token = localStorage.getItem("maphytoken");
    if (token) {
      const decoded = jwtDecode(token);
      console.log("Decodes",decoded);
      setUserId(decoded.userId);
      setTalentGroupId(decoded.talentGroupId);
      setUsertype(decoded.userType);

      if (decoded.talentGroupId) {
        setState((prevState) => ({ ...prevState, showTalentGroupTabs: true }));
        if (decoded.userType === 1 || decoded.userType === "1") {
          setState((prevState) => ({
            ...prevState,
            showAvailableStatus: true,
          }));
          getUserAvailabilityStatus(decoded.userId); // Fetch status on load
        }
        if (decoded.userType === 2 || decoded.userType === "2") {
          setState((prevState) => ({
            ...prevState,
            isManager: true,
            hiddenShowTicketChart: false,
          }));
        }
      }
    }
  }, []);

  const getUserAvailabilityStatus = async (userId) => {
    try {
      const url = `${Domain}/users/${userId}/status`;
      const response = await axios.get(url);
      setAvailabilityStatus(response.data.availabilityStatus); // Update based on API
    } catch (error) {
      console.error("Error fetching user availability status:", error);
    }
  };

  const handleAvailableChange = async (checked) => {
    try {
      setAvailabilityStatus(checked); // Immediately update UI
      const newStatus = checked ? 1 : 0;
      await axios.put(
        `${Domain}/users/status/${userId}`,
        { availability_status: newStatus },
        { headers: { "Content-Type": "application/json" } }
      );
      // If needed, you can verify the response or set additional state here
    } catch (error) {
      console.error("Error updating availability status:", error);
    }
    setActiveTab("myTickets");
  };

  const createBtnClick = () => {
    setShowTicket(false);
    setShowCreate(true);
  };

  const handleTabSelect = (k) => {
    setActiveTab(k);
  };

  const {
    showAvailableStatus,
    showTalentGroupTabs,
    isManager,
    hiddenShowTicketChart,
  } = state;

  if (showTicket) {
    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="btn-available">
            <h4 className="helpdesktitle">{t("app.helpdesk")}</h4>
            <div className="available">
              {showAvailableStatus && (
                <div className="mb-4">
                  <h5 className="custom-available">Available:</h5>
                  <Switch
                    onChange={handleAvailableChange}
                    checked={availabilityStatus} // Ensure it's controlled by state
                    className="react-switch custom-availablebtn"
                    id="normal-switch"
                  />
                </div>
              )}
            </div>
            <div className="create">
              <Button
                className="primary px-4"
                type="submit"
                onClick={() => navigate("/createTicket")}
              >
                {t("button.create")}
              </Button>
            </div>
          </div>
        </div>
        <div className="table-responsive">
          <Tabs
            activeKey={activeTab}
            onSelect={handleTabSelect}
            id="uncontrolled-tab-example"
          >
            <Tab eventKey="myTickets" title="My Tickets">
              <MyTickets
                ticketStatus="99"
                isActive={activeTab === "myTickets"}
              />
            </Tab>
            {showTalentGroupTabs && isManager ? (
              <Tab eventKey="Open" title="Open">
                <TicketsByStatus
                  ticketStatus="1"
                  userType={userType}
                  isActive={activeTab === "Open"}
                  talentGroupId={talentGroupId}
                />
              </Tab>
            ) : null}
            {showTalentGroupTabs ? (
              <Tab eventKey="InProgress" title="InProgress">
                <TicketsByStatus
                  ticketStatus="2"
                  userType={userType}
                  isActive={activeTab === "InProgress"}
                  talentGroupId={talentGroupId}
                />
              </Tab>
            ) : null}
            {showTalentGroupTabs ? (
              <Tab eventKey="Hold" title="Hold">
                <TicketsByStatus
                  ticketStatus="5"
                  userType={userType}
                  isActive={activeTab === "Hold"}
                  talentGroupId={talentGroupId}
                />
              </Tab>
            ) : null}
            {showTalentGroupTabs ? (
              <Tab eventKey="Escalate" title="Escalate">
                <TicketsByStatus
                  ticketStatus="4"
                  userType={userType}
                  isActive={activeTab === "Escalate"}
                  talentGroupId={talentGroupId}
                />
              </Tab>
            ) : null}
            {showTalentGroupTabs ? (
              <Tab eventKey="SisterTicket" title="SisterTicket">
                <TicketsByStatus
                  ticketStatus="6"
                  userType={userType}
                  isActive={activeTab === "SisterTicket"}
                  talentGroupId={talentGroupId}
                />
              </Tab>
            ) : null}
            {showTalentGroupTabs ? (
              <Tab eventKey="Closed" title="Closed">
                <TicketsByStatus
                  ticketStatus="3"
                  isActive={activeTab === "Closed"}
                  talentGroupId={talentGroupId}
                />
              </Tab>
            ) : null}
            {showTalentGroupTabs && isManager ? (
              <Tab
                eventKey="Chart"
                title="Chart"
                hidden={state.hiddenShowTicketChart}
              >
                <TicketChart />
              </Tab>
            ) : null}
          </Tabs>
        </div>
      </div>
    );
  } else {
    return <TicketCreate />;
  }
};

export default TicketMain;



