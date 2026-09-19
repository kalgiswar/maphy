import React from "react";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown } from "@fortawesome/free-solid-svg-icons";

const exportCSV = (headers, data, filename = "data.csv") => {
  const csvContent =
    "data:text/csv;charset=utf-8," +
    headers.join(",") +
    "\n" +
    data.map((row) => row.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const CsvExportButton = ({ headers, data, filename }) => {
  const handleExport = () => {
    exportCSV(headers, data, filename);
  };

  return (
    <Button
      className="icon"
      type="button"
      onClick={handleExport}
      title="Download Csv"
    >
      <FontAwesomeIcon icon={faArrowDown} />
    </Button>
  );
};

export default CsvExportButton;
