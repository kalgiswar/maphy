import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import Chart from "react-google-charts";
import { jwtDecode } from "jwt-decode";
import { Container, Row, Col } from "react-bootstrap";
import PieChart from "../../images/pie-chart.png";
import Statistic from "../../images/statistic.png";

const Domain = process.env.REACT_APP_API_URL;

const TicketChart = () => {
  const { t, i18n } = useTranslation();
  const [hiddenShowTicketChart, setHiddenShowTicketChart] = useState(true);
  const [ticketchartdata, setTicketchartdata] = useState([]);
  const [apiError, setApiError] = useState("");
  const [isChartReady, setIsChartReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("maphytoken");
    if (token) {
      const decoded = jwtDecode(token);
      const userType = decoded.userType;
      console.log("typeeee", userType);

      if (userType === 2) {
        setHiddenShowTicketChart(false);
        callTicketChartData();
      }
    }
  }, []);

  const callTicketChartData = useCallback(async () => {
    const url = `${Domain}/tickets/chart`;

    try {
      const response = await axios.get(url);
      const { statuses } = response.data;

      if (!Array.isArray(statuses) || statuses.length === 0) {
        setIsChartReady(false);
        setTicketchartdata([]);
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
        setTicketchartdata([]);
        return;
      }

      setTicketchartdata(chartData);
      setIsChartReady(true);
    } catch (error) {
      console.error("Error fetching ticket chart data", error);
      setIsChartReady(false);
      setTicketchartdata([]);
    }
  }, []);

  const onLanguageHandle = (event) => {
    const newLang = event.target.value;
    i18n.changeLanguage(newLang);
  };

  if (hiddenShowTicketChart) {
    return null;
  }

  return (
    <Container fluid>
      <Row className="d-flex justify-content-between mb-3">
        {apiError && <div className="alert alert-danger"> {apiError} </div>}
        <Col md={6} className="grey-bg w-100 mb-3">
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
              loader={<div>Loading Chart</div>}
              data={ticketchartdata}
              options={{
                colors: [
                  "purple",
                  "orange",
                  "gray",
                  "yellow",
                  "blue",
                  "green",
                  "pink",
                ],
                is3D: true,
              }}
              rootProps={{ "data-testid": "2" }}
            />
          ) : (
            <div className="text-muted">{t("dashboard.noChartData")}</div>
          )}
        </Col>
        <Col md={6} className="grey-bg w-100">
          <div>
            <i className="fas fa-chart-bar me-1">
              <img src={Statistic} alt="Chart" />
            </i>
            {t("app.ticketstatus")}
          </div>

          <div id="assetbar" className="collapse show">
            <div className="card-body">
              {ticketchartdata.length > 1 ? (
                <Chart
                  width={"100%"}
                  height={"250px"}
                  chartType="BarChart"
                  loader={<div>Loading Chart</div>}
                  data={ticketchartdata}
                  options={{
                    chartArea: { width: "50%" },
                    colors: ["#156b77"],
                    hAxis: {
                      title: t("chart.totalticket"),
                      minValue: 0,
                    },
                    is3D: true,
                  }}
                  rootProps={{ "data-testid": "3" }}
                />
              ) : (
                <div className="text-muted">{t("dashboard.noChartData")}</div>
              )}
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default TicketChart;
