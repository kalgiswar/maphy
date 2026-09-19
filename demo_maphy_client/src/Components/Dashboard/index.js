import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import axios from "axios";
import { common } from "../../Common/common";
import Chart from "react-google-charts";
import { Table, Badge, Card, Spinner } from "react-bootstrap";
import PieChart from "../../images/pie-chart.png";
import Statistic from "../../images/statistic.png";
import Down from "../../images/down.png";
import whiteArrow from "../../images/whiteArrow.png";
import SetupWizard from "../Onboarding/SetupWizard";

const Domain = process.env.REACT_APP_API_URL;

// ========== SUPER ADMIN ORG OVERVIEW DASHBOARD ==========
const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    fetchOverview();
    const intervalId = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleString("en-US", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      );
    });
    return () => clearInterval(intervalId);
  }, []);

  const fetchOverview = async () => {
    try {
      const response = await axios.get(`${Domain}/register/firms/org-overview`);
      setOverview(response.data);
    } catch (error) {
      console.error("Error fetching org overview:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dataTable wrapper">
        <Container fluid>
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted">Loading dashboard...</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="dataTable wrapper">
      <Container fluid>
        <Row>
          <Col md={12}>
            <h4 className="mb-3 mt-3 dashboard-overview-title">{t("dashboard.overview")}</h4>
            <p className="date-header">{currentTime}</p>
            <h1 className="mt-4">Organization Overview</h1>

            {/* Summary Cards */}
            <div className="row mb-4 dashboard-cards-row">
              <div className="col-xl-2 col-md-4">
                <div className="card text-white" style={{ width: "10rem", background: "linear-gradient(135deg, #1e3c72, #2a5298)", borderRadius: "12px" }}>
                  <div className="card-body">
                    <div className="card-text">Total Organizations</div>
                    <div className="text-center" style={{ fontSize: 28, fontWeight: 700 }}>
                      {overview?.totalOrgs || 0}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-2 col-md-4">
                <div className="card text-white" style={{ width: "10rem", background: "linear-gradient(135deg, #4caf50, #2e7d32)", borderRadius: "12px" }}>
                  <div className="card-body">
                    <div className="card-text">Active Orgs</div>
                    <div className="text-center" style={{ fontSize: 28, fontWeight: 700 }}>
                      {overview?.activeOrgs || 0}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-2 col-md-4">
                <div className="card text-white" style={{ width: "10rem", background: "linear-gradient(135deg, #ff9800, #e65100)", borderRadius: "12px" }}>
                  <div className="card-body">
                    <div className="card-text">Inactive Orgs</div>
                    <div className="text-center" style={{ fontSize: 28, fontWeight: 700 }}>
                      {overview?.inactiveOrgs || 0}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-2 col-md-4">
                <div className="card text-white" style={{ width: "10rem", background: "linear-gradient(135deg, #2196f3, #1565c0)", borderRadius: "12px" }}>
                  <div className="card-body">
                    <div className="card-text">Total Users</div>
                    <div className="text-center" style={{ fontSize: 28, fontWeight: 700 }}>
                      {overview?.totalUsers || 0}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-2 col-md-4">
                <div className="card text-white" style={{ width: "10rem", background: "linear-gradient(135deg, #9c27b0, #6a1b9a)", borderRadius: "12px" }}>
                  <div className="card-body">
                    <div className="card-text">Total Assets</div>
                    <div className="text-center" style={{ fontSize: 28, fontWeight: 700 }}>
                      {overview?.totalAssets || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Organizations Table */}
            <Card className="shadow-sm" style={{ borderRadius: "12px", border: "none" }}>
              <Card.Header style={{
                background: "#fff",
                borderBottom: "2px solid #e9ecef",
                padding: "16px 20px",
                borderRadius: "12px 12px 0 0"
              }}>
                <h5 style={{ margin: 0, fontWeight: "600", color: "#333" }}>
                  Organizations
                </h5>
              </Card.Header>
              <Card.Body className="p-0">
                {overview?.organizations?.length > 0 ? (
                  <Table hover responsive className="mb-0" style={{ fontSize: "14px" }}>
                    <thead style={{ backgroundColor: "#f8f9fa" }}>
                      <tr>
                        <th style={{ fontWeight: "600", color: "#555" }}>#</th>
                        <th style={{ fontWeight: "600", color: "#555" }}>Name</th>
                        <th style={{ fontWeight: "600", color: "#555" }}>Users</th>
                        <th style={{ fontWeight: "600", color: "#555" }}>Assets</th>
                        <th style={{ fontWeight: "600", color: "#555" }}>Status</th>
                        <th style={{ fontWeight: "600", color: "#555" }}>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overview.organizations.map((org, index) => (
                        <tr
                          key={org.id}
                          style={{ cursor: "pointer" }}
                          onClick={() => navigate(`/organizations/${org.id}`)}
                        >
                          <td>{index + 1}</td>
                          <td><strong style={{ color: "#1e3c72" }}>{org.name}</strong></td>
                          <td><Badge bg="info" pill>{org.users_count}</Badge></td>
                          <td><Badge bg="primary" pill>{org.assets_count}</Badge></td>
                          <td>
                            {org.activated ? (
                              <Badge bg="success" pill>Active</Badge>
                            ) : (
                              <Badge bg="secondary" pill>Inactive</Badge>
                            )}
                          </td>
                           <td style={{ fontSize: "13px", color: "#666" }}>{org.created_at?.formatted || org.created_at}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <div className="text-center py-5">
                    <p className="text-muted">No organizations created yet.</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};
// ========== END SUPER ADMIN DASHBOARD ==========

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [assetTotal, setAssetTotal] = useState(0);
  const [accessoriesTotal, setAccessoriesTotal] = useState(0);
  const [consumablesTotal, setConsumablesTotal] = useState(0);
  const [licenseTotal, setLicensesTotal] = useState(0);
  const [licensesGoingToExpired, setLicensesGoingToExpired] = useState(0);
  const [licenseExpiredTotal, setLicenseExpiredTotal] = useState(0);
  const [bieChartData, setBiechartData] = useState([]);
  const [recentActivityData, setRecentActivityData] = useState([]);
  const [isTableVisible, setIsTableVisible] = useState(false);
  const userpermission = JSON.parse(localStorage.getItem("permissions"));
  const [currentTime, setCurrentTime] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if Super Admin and which org is selected
  const isSuperAdmin = userpermission?.superuser === "1" || userpermission?.superuser === 1 || userpermission?.superuser === true || userpermission?.superuser === "true";
  const selectedOrgId = localStorage.getItem("selectedOrgId");
  const showOrgOverview = isSuperAdmin && (!selectedOrgId || selectedOrgId === "all");

  useEffect(() => {
    const checkOnboarding = async () => {
      const isSuperAdmin = localStorage.getItem("firm_id") === "1" && (userpermission?.superuser === "1" || userpermission?.superuser === 1 || userpermission?.superuser === true || userpermission?.superuser === "true");
      if (isSuperAdmin) {
        setShowOnboarding(false);
        return;
      }
      
      const dismissed = localStorage.getItem("onboarding_dismissed");
      if (dismissed === "true") {
        setShowOnboarding(false);
        return;
      }

      try {
        const response = await axios.get(`${Domain}/users/me`);
        if (response?.data?.onboarding_dismissed) {
          localStorage.setItem("onboarding_dismissed", "true");
          setShowOnboarding(false);
        } else {
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error("Error fetching onboarding status:", error);
        setShowOnboarding(true);
      }
    };

    checkOnboarding();
  }, [userpermission]);
  const [accessoriesChartData, setAccessoriesChartData] = useState([]);
  const [consumablesChartData, setConsumablesChartData] = useState([]);
  const [userGroupChartData, setUserGroupChartData] = useState([]);
  const [isAccessoriesChartVisible, setIsAccessoriesChartVisible] =
    useState(true);
  const [isChartReady, setIsChartReady] = useState(false);
  const toggleAccessoriesChart = () => {
    setIsAccessoriesChartVisible(!isAccessoriesChartVisible);
  };
  const [licenseChartData, setLicenseChartData] = useState([]);
  const [ticketChartData, setTicketChartData] = useState([]);
  const [componentChartData, setComponentChartData] = useState([]);

  var chartdata = [];
  const Domain = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (!showOrgOverview) {
      getChartDetails();
      getDashboardDetails();
      getAccessoriesChartDetails();
      getComponentChartDetails();
      getConsumablesChartDetails();
      getLicenseChartDetails();
      getUserGroupChartDetails();
      getTicketChartDetails();
      callRecentActivityData();
    }
    const intervalId = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleString("en-US", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      );
    });
    return () => clearInterval(intervalId);
  }, [showOrgOverview]);

  const getChartDetails = async () => {
    chartdata = [];
    const url = Domain + "/dashboard/chart";
    try {
      const response = await axios.get(url);
      var data = response?.data;
      console.log("data:", data);
      if (data && Object.keys(data).length > 0) {
        chartdata.push(["Assets", t("chart.assetstatus")]);
        chartdata.push([t("chart.deployable"), data.deployableCount]);
        chartdata.push([t("chart.deployed"), data.deployedCount]);
        chartdata.push([t("chart.undeployed"), data.undeployedCount]);
        setBiechartData(chartdata);
      }
    } catch (error) {
      console.error("Error fetching dashboard chart data:", error);
    }
  };
  // const getChartDetails = async () => {
  //   const url = `${Domain}/dashboard/chart`;

  //   try {
  //     const response = await axios.get(url);
  //     const data = response?.data;
  //     console.log("data:", data);

  //     if (Object.keys(data).length === 0 && data.constructor === Object) {
  //       console.log("data is empty!");
  //       setBiechartData([]); // clear chart if data is empty
  //       return;
  //     }

  //     const chartData = [
  //       ["Assets", t("chart.assetstatus")],
  //       [t("chart.deployable"), data.deployableCount],
  //       [t("chart.deployed"), data.undeployedCount],
  //       [t("chart.undeployed"), data.deployedCount],
  //     ];

  //     // Check if any count > 0
  //     const hasValidData = chartData
  //       .slice(1)
  //       .some((item) => Number(item[1]) > 0);

  //     if (hasValidData) {
  //       setBiechartData(chartData);
  //     } else {
  //       setBiechartData([]); // or maybe show "No data available"
  //     }
  //   } catch (error) {
  //     console.error("Error fetching dashboard chart data:", error);
  //   }
  // };

  const getAccessoriesChartDetails = async () => {
    const url = `${Domain}/accessories/chart`;

    try {
      const response = await axios.get(url);
      const data = response.data;

      const chartData = [
        ["Accessories", t("app.accessorystatus")],
        [t("app.remainingQty"), Number(data.totalRemainingQty)],
        [t("app.checkoutCount"), Number(data.totalCheckoutCount)],
      ];
      // Check if there's at least one non-zero value
      const hasValidData = chartData.slice(1).some((item) => item[1] > 0);

      if (hasValidData) {
        setAccessoriesChartData(chartData);
        // optionally: setIsAccessoriesChartReady(true);
      } else {
        setAccessoriesChartData([]);
        // optionally: setIsAccessoriesChartReady(false);
      }
      // setAccessoriesChartData(chartData);
    } catch (error) {
      console.error("Error fetching accessories chart data", error);
    }
  };
  const getComponentChartDetails = async () => {
    const url = `${Domain}/components/chart`;

    try {
      const response = await axios.get(url);
      const data = response.data;

      const chartData = [
        ["Component", t("app.componentstatus")],
        [t("app.remainingQty"), Number(data.totalRemainingQty)],
        [t("app.checkoutCount"), Number(data.totalCheckoutCount)],
      ];
      const hasValidData = chartData.slice(1).some((item) => item[1] > 0);

      if (hasValidData) {
        setComponentChartData(chartData);
      } else {
        setComponentChartData([]);
      }
      // setComponentChartData(chartData);
    } catch (error) {
      console.error("Error fetching component chart data", error);
    }
  };

  const getConsumablesChartDetails = async () => {
    const url = `${Domain}/consumables/chart`;

    try {
      const response = await axios.get(url);
      const data = response.data;

      const chartData = [
        ["Consumables", t("app.consumablestatus")],
        [t("app.remainingQty"), Number(data.totalRemainingQty)],
        [t("app.checkoutCount"), Number(data.totalCheckoutCount)],
      ];
      const hasValidData = chartData.slice(1).some((item) => item[1] > 0);

      if (hasValidData) {
        setConsumablesChartData(chartData);
      } else {
        setConsumablesChartData([]);
      }

      // setConsumablesChartData(chartData);
    } catch (error) {
      console.error("Error fetching consumables chart data", error);
    }
  };
  const getLicenseChartDetails = async () => {
    const url = `${Domain}/licenses/chart`;

    try {
      const response = await axios.get(url);
      const data = response.data;

      const chartData = [
        ["Licenses", t("app.licensestatus") || "License Status"],
        [t("app.totalAssigned"), Number(data.totalAssignedSeats)],
        [t("app.totalFree"), Number(data.totalFreeSeats)],
      ];
      const hasValidData = chartData.slice(1).some((item) => item[1] > 0);

      if (hasValidData) {
        setLicenseChartData(chartData);
      } else {
        setLicenseChartData([]);
      }
      // setLicenseChartData(chartData);
    } catch (error) {
      console.error("Error fetching license chart data", error);
    }
  };

  const getUserGroupChartDetails = async () => {
    const url = `${Domain}/users/chart`;

    try {
      const response = await axios.get(url);
      const groupData = response.data.groups;

      const chartData = [["Group", "Users"]];

      groupData.forEach((group) => {
        chartData.push([
          group.groupName || "Unassigned", // null check
          Number(group.userCount),
        ]);
      });

      setUserGroupChartData(chartData);
    } catch (error) {
      console.error("Error fetching user group chart data", error);
    }
  };
  const getTicketChartDetails = async () => {
    const url = `${Domain}/tickets/chart`;

    try {
      const response = await axios.get(url);
      const { statuses } = response.data;

      if (!Array.isArray(statuses) || statuses.length === 0) {
        setIsChartReady(false);
        setTicketChartData([]);
        return;
      }

      const chartData = [["Status", "Count"]];
      statuses.forEach((item) => {
        const name = item.status_name || "Unknown";
        const count = Number(item.count);
        if (!isNaN(count)) {
          chartData.push([name, count]);
        }
      });

      if (chartData.length <= 1) {
        setIsChartReady(false);
        setTicketChartData([]);
        return;
      }

      setTicketChartData(chartData);
      setIsChartReady(true);
    } catch (error) {
      console.error("Error fetching ticket chart data", error);
      setIsChartReady(false);
      setTicketChartData([]);
    }
  };

  // const callRecentActivityData = async () => {
  //   const url = Domain + "/reports/activity";

  //   await axios.get(url).then((response) => {
  //     console.log("hhhd:", response?.data?.rows);
  //     setRecentActivityData(response?.data?.rows);
  //     console.log("recentActicityData:", recentActivityData.length);
  //   });
  // };
  const callRecentActivityData = async () => {
    const url = Domain + "/reports/activity";

    // Add query parameters: sort=created_at&order=desc
    const params = {
      sort: "created_at",
      order: "desc",
    };

    try {
      const response = await axios.get(url, { params });
      console.log("hhhd:", response?.data?.rows);
      setRecentActivityData(response?.data?.rows);
      console.log("recentActivityData:", response?.data?.rows?.length);
    } catch (error) {
      console.error("Error fetching activity data:", error);
    }
  };

  const getDashboardDetails = async () => {
    const url = Domain + "/dashboard/";
    try {
      const response = await axios.get(url);
      setAssetTotal(response?.data?.assetsCount);
      setAccessoriesTotal(response?.data?.accessoriesCount);
      setLicensesTotal(response?.data?.licensesCount);
      setConsumablesTotal(response?.data?.consumablesCount);
      setLicenseExpiredTotal(response?.data?.licenseExpiredCount);
      setLicensesGoingToExpired(response?.data?.LicensesGoingToExpired);
    } catch (error) {
      console.error("Error fetching dashboard summary:", error);
    }
  };

  const toggleTable = () => {
    setIsTableVisible(!isTableVisible);
  };

  if (showOrgOverview) {
    return <SuperAdminDashboard />;
  }

  return (
    <div className="dataTable wrapper">
      <Container fluid>
        <Row>
          <Col md={12}>
            {showOnboarding && (
              <SetupWizard onDismiss={() => setShowOnboarding(false)} />
            )}
            <h4 className="mb-3 mt-3 dashboard-overview-title">{t("dashboard.overview")}</h4>
            <p className="date-header">{currentTime}</p>
            {/* <p className="date-header">Saturday, 10 March 2024</p> */}
            <div className="row">
              <h1 className="mt-4">{t("dashboard.dashboard")}</h1>

              {/* {userpermission?.superuser === "1" && ( */}
              <div className="row dashboard-cards-row">
                <div className="col-xl-2 col-md-6">
                  <div
                    className="card blue-bg text-white"
                    style={{ width: "10rem" }}
                  >
                    <div className="card-body blue-bg">
                      <div className="card-text"> {t("app.totalassets")} </div>
                      <div className="text-center" style={{ fontSize: 20 }}>
                        {assetTotal}
                      </div>
                    </div>
                    <Link
                      onClick={() => {
                        if (userpermission?.modelsview === true) {
                          navigate("/Assets");
                        }
                      }}
                      className="small blue-bg text-white stretched-link"
                    >
                      <div className="card-footer d-flex align-items-center justify-content-between">
                        {t("dashboard.viewdetails")}
                        <img src={whiteArrow} alt="Chart" />
                      </div>
                    </Link>
                  </div>
                </div>

                <div className="col-xl-2 col-md-6">
                  <div
                    className="card green-bg text-white mb-4"
                    style={{ width: "10rem" }}
                  >
                    <div className="card-body green-bg">
                      <div>{t("app.totalaccessory")}</div>
                      <div className="text-center" style={{ fontSize: 20 }}>
                        {accessoriesTotal}
                      </div>
                    </div>
                    <Link
                      onClick={() => {
                        if (userpermission?.accessoriesview === true) {
                          navigate("/Accessories");
                        }
                      }}
                      className="small green-bg text-white stretched-link"
                    >
                      <div className="card-footer d-flex align-items-center justify-content-between">
                        {t("dashboard.viewdetails")}
                        <img src={whiteArrow} alt="Chart" />
                      </div>
                    </Link>
                  </div>
                </div>

                <div className="col-xl-2 col-md-6">
                  <div
                    className="card bg-info text-white mb-3"
                    style={{ width: "10rem" }}
                  >
                    <div className="card-body">
                      <div>{t("app.totalconsumable")}</div>
                      <div className="text-center" style={{ fontSize: 20 }}>
                        {consumablesTotal}
                      </div>
                    </div>
                    <Link
                      onClick={() => {
                        if (userpermission?.consumablesview === true) {
                          navigate("/consumables");
                        }
                      }}
                      className="small text-white stretched-link"
                    >
                      <div className="card-footer d-flex align-items-center justify-content-between">
                        {t("dashboard.viewdetails")}
                        <img src={whiteArrow} alt="Chart" />
                      </div>
                    </Link>
                  </div>
                </div>

                <div className="col-xl-2 col-md-6 ">
                  <div
                    className="card yellow-bg text-white mb-4"
                    style={{ width: "10rem" }}
                  >
                    <div className="card-body yellow-bg">
                      <div>{t("app.totallicense")}</div>
                      <div className="text-center" style={{ fontSize: 20 }}>
                        {licenseTotal}
                      </div>
                    </div>
                    <Link
                      className="small yellow-bg text-white stretched-link"
                      onClick={() => {
                        if (userpermission?.licensesview === true) {
                          navigate("/License");
                        }
                      }}
                    >
                      <div className="card-footer d-flex align-items-center justify-content-between">
                        {t("dashboard.viewdetails")}
                        <img src={whiteArrow} alt="Chart" />
                      </div>
                    </Link>
                  </div>
                </div>

                <div className="col-xl-2 col-md-6">
                  <div
                    className="card black-bg text-white mb-4"
                    style={{ width: "10rem" }}
                  >
                    <div className="card-body black-bg">
                      <div> {t("app.totallicenseexpired")}</div>
                      <div className="text-center" style={{ fontSize: 20 }}>
                        {licenseExpiredTotal}
                      </div>
                    </div>
                    <Link
                      onClick={() => {
                        if (userpermission?.licensesview === true) {
                          navigate("/License/expired");
                        }
                      }}
                      className="small black-bg text-white stretched-link"
                    >
                      <div className="card-footer d-flex align-items-center justify-content-between">
                        {t("dashboard.viewdetails")}
                        <img src={whiteArrow} alt="Chart" />
                      </div>
                    </Link>
                  </div>
                </div>

                <div className="col-xl-2 col-md-6">
                  <div
                    className="card bg-danger text-white mb-4"
                    style={{ width: "10rem" }}
                  >
                    <div className="card-body">
                      <div> {t("app.licensegoingtoexpire")}</div>
                      <div className="text-center" style={{ fontSize: 20 }}>
                        {licensesGoingToExpired}
                      </div>
                    </div>
                    <Link
                      className="small text-white stretched-link"
                      onClick={() => {
                        if (userpermission?.licensesview === true) {
                          navigate("/License/goingToExpired");
                        }
                      }}
                    >
                      <div className="card-footer d-flex align-items-center justify-content-between">
                        {t("dashboard.viewdetails")}
                        <img src={whiteArrow} alt="Chart" />
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <div className="grey-bg w-100">
                <div>
                  <i className="fas fa-chart-pie me-1">
                    <img src={PieChart} alt="Chart" />
                  </i>
                  {t("app.assetstatus")}
                </div>

                {bieChartData.length > 1 ? (
                  <Chart
                    width={"450px"}
                    height={"250px"}
                    chartType="PieChart"
                    loader={<div>{t("dashboard.loadingchart")}</div>}
                    data={bieChartData}
                    options={{
                      colors: ["purple", "orange", "gray"],
                      is3D: true,
                    }}
                    rootProps={{ "data-testid": "2" }}
                  />
                ) : (
                  <div className="text-muted">{t("dashboard.noChartData")}</div>
                )}
              </div>

              <div className="grey-bg w-100">
                <div>
                  <i className="fas fa-chart-bar me-1">
                    <img src={Statistic} alt="Chart" />
                  </i>
                  {t("app.assetstatus")}
                </div>
                {/* <div id="assetbar" className="collapse show">
                  <div className="card-body"> */}
                {/* <Doughnut data={data} /> */}
                {bieChartData.length > 1 ? (
                  <Chart
                    chartType="BarChart"
                    loader={<div>{t("dashboard.loadingchart")}</div>}
                    data={bieChartData}
                    options={{
                      chartArea: { width: "50%" },
                      colors: ["#156b77"],
                      hAxis: {
                        title: t("chart.totalasset"),
                        minValue: 0,
                      },
                      is3D: true,
                    }}
                    rootProps={{ "data-testid": "1" }}
                  />
                ) : (
                  <div className="text-muted">{t("dashboard.noChartData")}</div>
                )}
              </div>
            </div>
            {/* </div>
            </div> */}
            {/*<div className="mb-3">
              <div
                className="header-table"
                onClick={toggleAccessoriesChart}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  cursor: "pointer",
                }}
              >
                <h4>{t("app.accessorystatus")}</h4>
                <img src={Down} alt="toggle" />
              </div> */}
            {/* {isAccessoriesChartVisible && ( */}
            <div className="d-flex justify-content-between mb-3">
              <div className="grey-bg w-100">
                <div>
                  <i className="fas fa-chart-pie me-1">
                    <img src={PieChart} alt="Chart" />
                  </i>
                  {t("app.accessorystatus")}
                </div>
                {accessoriesChartData.length > 1 ? (
                  <Chart
                    width={"100%"}
                    height={"250px"}
                    chartType="PieChart"
                    loader={<div>{t("dashboard.loadingchart")}</div>}
                    data={accessoriesChartData}
                    options={{
                      colors: ["#4caf50", "#2196f3", "#f44336"],
                      is3D: true,
                    }}
                    rootProps={{ "data-testid": "accessories-pie-chart" }}
                  />
                ) : (
                  <div className="text-muted">{t("dashboard.noChartData")}</div>
                )}
              </div>
              <div className="grey-bg w-100">
                <div>
                  <i className="fas fa-chart-bar me-1">
                    <img src={Statistic} alt="Chart" />
                  </i>
                  {t("app.accessorystatus")}
                </div>

                {/* <div id="accessorybar" className="collapse show">
                  <div className="card-body"> */}
                {accessoriesChartData.length > 1 ? (
                  <Chart
                    chartType="BarChart"
                    loader={<div>{t("dashboard.loadingchart")}</div>}
                    data={accessoriesChartData}
                    options={{
                      chartArea: { width: "50%" },
                      colors: ["#156b77"],
                      hAxis: {
                        title: t("app.totalaccessories") || "Accessories",
                        minValue: 0,
                      },
                    }}
                    rootProps={{ "data-testid": "accessories-bar-chart" }}
                  />
                ) : (
                  <div className="text-muted">{t("dashboard.noChartData")}</div>
                )}
                {/* </div>
                </div> */}
              </div>
            </div>
            {/* )}
            </div> */}
            <div className="d-flex justify-content-between mb-3">
              <div className="grey-bg w-100">
                <div>
                  <i className="fas fa-chart-pie me-1">
                    <img src={PieChart} alt="Chart" />
                  </i>
                  {t("app.componentstatus")}
                </div>
                {componentChartData.length > 1 ? (
                  <Chart
                    width={"100%"}
                    height={"250px"}
                    chartType="PieChart"
                    loader={<div>{t("dashboard.loadingchart")}</div>}
                    data={componentChartData}
                    options={{
                      colors: ["#009688", "#3f51b5", "#e91e63"],
                      is3D: true,
                    }}
                    rootProps={{ "data-testid": "component-pie-chart" }}
                  />
                ) : (
                  <div className="text-muted">{t("dashboard.noChartData")}</div>
                )}
              </div>

              <div className="grey-bg w-100">
                <div>
                  <i className="fas fa-chart-bar me-1">
                    <img src={Statistic} alt="Chart" />
                  </i>
                  {t("app.componentstatus")}
                </div>

                {/* <div id="componentbar" className="collapse show">
                  <div className="card-body"> */}

                {componentChartData.length > 1 ? (
                  <Chart
                    chartType="BarChart"
                    loader={<div>{t("dashboard.loadingchart")}</div>}
                    data={componentChartData}
                    options={{
                      chartArea: { width: "50%" },
                      colors: ["#156b77"],
                      hAxis: {
                        title: t("chart.totalcomponents") || "Components",
                        minValue: 0,
                      },
                      is3D: true,
                    }}
                    rootProps={{ "data-testid": "component-bar-chart" }}
                  />
                ) : (
                  <div className="text-muted">{t("dashboard.noChartData")}</div>
                )}
                {/* //   </div>
                // </div> */}
              </div>
            </div>
            ;
            <div className="d-flex justify-content-between mb-3">
              <div className="grey-bg w-100">
                <div>
                  <i className="fas fa-chart-pie me-1">
                    <img src={PieChart} alt="Chart" />
                  </i>
                  {t("app.consumablestatus")}
                </div>
                {consumablesChartData.length > 1 ? (
                  <Chart
                    width={"100%"}
                    height={"250px"}
                    chartType="PieChart"
                    loader={<div>{t("dashboard.loadingchart")}</div>}
                    data={consumablesChartData}
                    options={{
                      colors: ["#9c27b0", "#00bcd4", "#ff9800"],
                      is3D: true,
                    }}
                    rootProps={{ "data-testid": "consumables-pie-chart" }}
                  />
                ) : (
                  <div className="text-muted">{t("dashboard.noChartData")}</div>
                )}
              </div>
              <div className="grey-bg w-100">
                <div>
                  <i className="fas fa-chart-bar me-1">
                    <img src={Statistic} alt="Chart" />
                  </i>
                  {t("app.consumablestatus")}
                </div>

                {/* <div id="accessorybar" className="collapse show">
                  <div className="card-body"> */}
                {consumablesChartData.length > 1 ? (
                  <Chart
                    chartType="BarChart"
                    loader={<div>{t("dashboard.loadingchart")}</div>}
                    data={consumablesChartData}
                    options={{
                      chartArea: { width: "50%" },
                      colors: ["#156b77"],
                      hAxis: {
                        title: t("app.totalconsumables") || "Consumables",
                        minValue: 0,
                      },
                    }}
                    rootProps={{ "data-testid": "consumables-bar-chart" }}
                  />
                ) : (
                  <div className="text-muted">{t("dashboard.noChartData")}</div>
                )}
                {/* </div>
                </div> */}
              </div>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <div className="grey-bg w-100">
                <div>
                  <i className="fas fa-chart-pie me-1">
                    <img src={PieChart} alt="Chart" />
                  </i>
                  {t("app.licensestatus")}
                </div>
                {licenseChartData.length > 1 ? (
                  <Chart
                    width={"100%"}
                    height={"250px"}
                    chartType="PieChart"
                    loader={<div>{t("dashboard.loadingchart")}</div>}
                    data={licenseChartData}
                    options={{
                      colors: ["#4caf50", "#ff9800"],
                      is3D: true,
                    }}
                    rootProps={{ "data-testid": "license-pie-chart" }}
                  />
                ) : (
                  <div className="text-muted">{t("dashboard.noChartData")}</div>
                )}
              </div>

              <div className="grey-bg w-100">
                <div>
                  <i className="fas fa-chart-bar me-1">
                    <img src={Statistic} alt="Chart" />
                  </i>
                  {t("app.licensestatus")}
                </div>

                {/* <div id="licensebar" className="collapse show">
                  <div className="card-body"> */}
                {licenseChartData.length > 1 ? (
                  <Chart
                    chartType="BarChart"
                    loader={<div>{t("dashboard.loadingchart")}</div>}
                    data={licenseChartData}
                    options={{
                      chartArea: { width: "50%" },
                      colors: ["#156b77"],
                      hAxis: {
                        title: t("chart.totalseats") || "Total Seats",
                        minValue: 0,
                      },
                      is3D: true,
                    }}
                    rootProps={{ "data-testid": "license-bar-chart" }}
                  />
                ) : (
                  <div className="text-muted">{t("dashboard.noChartData")}</div>
                )}
                {/* //   </div>
                // </div> */}
              </div>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <div className="grey-bg w-100">
                <div>
                  <i className="fas fa-chart-pie me-1">
                    <img src={PieChart} alt="Chart" />
                  </i>
                  {t("app.usergroupstatus") || "User Group Distribution"}
                </div>
                {userGroupChartData.length > 1 ? (
                  <Chart
                    width={"100%"}
                    height={"250px"}
                    chartType="PieChart"
                    loader={<div>{t("dashboard.loadingchart")}</div>}
                    data={userGroupChartData}
                    options={{
                      is3D: true,
                      colors: [
                        "#3f51b5",
                        "#ff9800",
                        "#009688",
                        "#9c27b0",
                        "#f44336",
                        "#607d8b",
                      ],
                      // pieSliceText: "value",
                    }}
                    rootProps={{ "data-testid": "user-group-pie-chart" }}
                  />
                ) : (
                  <div className="text-muted">{t("dashboard.noChartData")}</div>
                )}
              </div>
              <div className="grey-bg w-100">
                <div>
                  <i className="fas fa-chart-bar me-1">
                    <img src={Statistic} alt="Chart" />
                  </i>
                  {t("app.usergroupstatus")}
                </div>

                {/* <div id="accessorybar" className="collapse show">
                  <div className="card-body"> */}
                {userGroupChartData.length > 1 ? (
                  <Chart
                    chartType="BarChart"
                    loader={<div>{t("dashboard.loadingchart")}</div>}
                    data={userGroupChartData}
                    options={{
                      chartArea: { width: "50%" },
                      colors: ["#156b77"],
                      hAxis: {
                        title: t("chart.totalusers"),
                        minValue: 0,
                      },
                      is3D: true,
                    }}
                    rootProps={{ "data-testid": "user-group-bar-chart" }}
                  />
                ) : (
                  <div className="text-muted">{t("dashboard.noChartData")}</div>
                )}
                {/* //   </div>
                // </div> */}
              </div>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <div className="grey-bg w-100">
                <div>
                  <i className="fas fa-chart-pie me-1">
                    <img src={PieChart} alt="Chart" />
                  </i>
                  {t("app.ticketstatus")}
                </div>
                {isChartReady ? (
                  <Chart
                    width={"100%"}
                    height={"250px"}
                    chartType="PieChart"
                    loader={<div>{t("dashboard.loadingchart")}</div>}
                    data={ticketChartData}
                    options={{
                      colors: [
                        "#673ab7",
                        "#03a9f4",
                        "#8bc34a",
                        "#e91e63",
                        "#ffc107",
                        "#9e9e9e",
                      ],
                      is3D: true,
                    }}
                    rootProps={{ "data-testid": "ticket-pie-chart" }}
                  />
                ) : (
                  <div className="text-muted">{t("dashboard.noChartData")}</div>
                )}
              </div>

              <div className="grey-bg w-100">
                <div>
                  <i className="fas fa-chart-bar me-1">
                    <img src={Statistic} alt="Chart" />
                  </i>
                  {t("app.ticketstatus")}
                </div>

                {/* <div id="ticketbar" className="collapse show">
                  <div className="card-body"> */}
                {isChartReady ? (
                  <Chart
                    chartType="BarChart"
                    loader={<div>{t("dashboard.loadingchart")}</div>}
                    data={ticketChartData}
                    options={{
                      chartArea: { width: "50%" },
                      colors: ["#156b77"],
                      hAxis: {
                        title: t("chart.totalticket") || "Tickets",
                        minValue: 0,
                      },
                      is3D: true,
                    }}
                    rootProps={{ "data-testid": "ticket-bar-chart" }}
                  />
                ) : (
                  <div className="text-muted">
                    <div className="text-muted">
                      {t("dashboard.noChartData")}
                    </div>
                  </div>
                )}
                {/* </div>
                </div> */}
              </div>
            </div>
            <div>
              <div
                className="header-table"
                onClick={toggleTable}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  cursor: "pointer",
                }}
              >
                <h4>{t("app.activity")}</h4>
                <img src={Down} alt="plus" />
              </div>
              {isTableVisible && (
                <div className="grey-bg w-100 table-container">
                  <Table>
                    <thead>
                      <tr>
                        <th>{t("app.date")}</th>
                        <th>{t("app.admin")}</th>
                        <th>{t("app.action")}</th>
                        <th>{t("app.type")}</th>
                        <th>{t("app.item")}</th>
                        <th>{t("app.to")}</th>
                        <th>{t("app.notes")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentActivityData?.length > 0 ? (
                        recentActivityData.map((items, index) => (
                          <tr key={index}>
                            <td>{items?.created_at?.formatted}</td>
                            <td>{items?.admin?.name}</td>
                            <td>{items?.action_type}</td>
                            <td>{items?.item?.type}</td>
                            <td>{items?.item?.name}</td>
                            <td>{items?.target?.name}</td>
                            <td>{items?.use}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" align="center">
                            {t("alert.nodatafound")}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Dashboard;
