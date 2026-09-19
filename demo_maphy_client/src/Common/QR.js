import React from "react";
import QRCode from "react-qr-code";

const QRPage = () => {
  const printData = JSON.parse(localStorage.getItem("printData"));

  if (!printData) {
    return <div>No data available for printing</div>;
  }

  const { name, categoryname, locationname, serial, companyname, labelData } =
    printData;

  const qrValue = `${name}/${categoryname}/${locationname}`;
  const qrWidth = labelData?.labels_width || 100;
  const qrHeight = labelData?.labels_height || 100;
  const fontSize = labelData?.labels_fontsize || 14;
  const qrSize = Math.max(qrWidth, qrHeight, fontSize, 100);
  return (
    // <div className="qr-page-container">
    //   {printData && printData.labelData && (
    //     <>
    //       <div className="header-text">
    //         {companyname} {serial}
    //       </div>
    //       <div className="qr-code">
    //         <QRCode value={qrValue} size={qrSize} />

    //       </div>
    //     </>
    //   )}
    // </div>
    <div className="qr-page-container">
      <div className="qr-wrapper">
        <QRCode value={qrValue} size={qrSize} />
        <div className="asset-tag" style={{ fontSize: `${fontSize}px` }}>
          {companyname} {serial}
        </div>
      </div>
    </div>
  );
};

export default QRPage;
