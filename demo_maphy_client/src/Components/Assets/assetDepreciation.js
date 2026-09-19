import React, { useState, useEffect } from "react";
import axios from "axios";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useTranslation } from "react-i18next";

const AssetDepreciation = ({ assetName, purchaseCost, depreciationId }) => {
  console.log("assetnaem",assetName);
  console.log("purchaseCost",purchaseCost);
  console.log("depreciationId",depreciationId);
  const { t } = useTranslation();
  const [residualValue, setResidualValue] = useState(0);
  const [assetYear, setAssetYear] = useState(0);
  const [depreciationData, setDepreciationData] = useState([]);
  const Domain = process.env.REACT_APP_API_URL;


  useEffect(() => {
    // Fetch depreciation details if `depreciationId` is available
    if (depreciationId) {
      fetchDepreciationDetails(depreciationId);
    }
  }, [depreciationId]);

  useEffect(() => {
    // Perform calculations only when all required values are available
    if (purchaseCost && residualValue && assetYear ) {
      calculateDepreciation();
    }
  }, [purchaseCost, residualValue, assetYear]);

  const fetchDepreciationDetails = async (id) => {
    try {
      const url = `${Domain}/depreciations/${id}`;
      console.log("Fetching depreciation data from:", url);
      const response = await axios.get(url);

      setResidualValue(response.data.residual_value);
      setAssetYear(response.data.months); // Using months as assetYear
    } catch (error) {
      console.error("Error fetching depreciation data", error);
    }
  };

  const calculateDepreciation = () => {
    const depreciationAmount = (purchaseCost - residualValue) / assetYear;
    let remainingBalance = purchaseCost;
    let tableData = [];

    for (let year = 1; year <= assetYear; year++) {
      remainingBalance -= depreciationAmount;
      tableData.push({
        year,
        depreciation: depreciationAmount.toFixed(2),
        remainingBalance: remainingBalance.toFixed(2),
      });
    }

    setDepreciationData(tableData);
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col md={6}>
          <h3>{t("AssetsListall.asset_details")}</h3>
          <Form.Group>
            <Form.Label>{t("AssetsListall.AssetName")}</Form.Label>
            <Form.Control type="text" value={assetName} readOnly />
          </Form.Group>
          <Form.Group>
            <Form.Label>{t("AssetsListall.asset_value")}</Form.Label>
            <Form.Control type="number" value={purchaseCost} readOnly />
          </Form.Group>
          <Form.Group>
            <Form.Label>{t("AssetsListall.residual_value")}</Form.Label>
            <Form.Control type="number" value={residualValue} readOnly />
          </Form.Group>
          <Form.Group>
            <Form.Label>{t("AssetsListall.asset_year")}</Form.Label>
            <Form.Control type="number" value={assetYear} readOnly />
          </Form.Group>
        </Col>
      </Row>

      <h3 className="mt-4">{t("app.depreciation")}</h3>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>{t("AssetsListall.year")}</th>
            <th>{t("app.depreciation")}</th>
            <th>{t("AssetsListall.remaining_balance")} </th>
          </tr>
        </thead>
        <tbody>
          {depreciationData.length > 0 ? (
            depreciationData.map((item) => (
              <tr key={item.year}>
                <td>{item.year}</td>
                <td>Rs.{item.depreciation}</td>
                <td>Rs.{item.remainingBalance}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center">
                No Data Available
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default AssetDepreciation;