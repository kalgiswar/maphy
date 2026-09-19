import React from "react";
import QRCode from "react-qr-code";

const QRPage = () => {
  const printData = JSON.parse(localStorage.getItem("printData"));

  if (!printData) {
    return <div>No data available for printing</div>;
  }

  const { asset_tag, labelData } = printData;

  const qrValue = asset_tag || "No Data"; // Ensure a fallback value
  const qrWidth = labelData?.labels_width || 100;
  const qrHeight = labelData?.labels_height || 100;
  const fontSize = labelData?.labels_fontsize || 14;

  const qrSize = Math.max(qrWidth, qrHeight,fontSize, 100); // Ensure minimum size

  return (
    <div className="qr-page-container">
      <div className="qr-wrapper">
          <QRCode value={qrValue} size={qrSize} />
          <div className="asset-tag" style={{ fontSize: `${fontSize}px` }}>
            {asset_tag}
          </div>
      </div>
    </div>
  );
};

export default QRPage;


// import React from "react";
// import QRCode from "react-qr-code";

// const QRPage = () => {
//   const printData = JSON.parse(localStorage.getItem("printData"));

//   if (!printData) {
//     return <div>No data available for printing</div>;
//   }

//   const { asset_tag, companyname, asset_tagheader, labelData } = printData;

//   const qrValue = `${asset_tag}`;

//   // Ensure a minimum size for QR code
//   const qrWidth = labelData?.labels_width || 100;
//   const qrHeight = labelData?.labels_height || 100;
//   const fontSize = labelData?.labels_fontsize || 14;

//   // Adjust the QR code size properly
//   const qrSize = Math.max(qrWidth, qrHeight, 100); // Ensure QR code is at least 100px

//   return (
//     <div className="qr-page-container">
//       {printData && printData.labelData && (
//         <>
//           <div className="header-text" style={{ fontSize: `${fontSize}px` }}>
//             {asset_tagheader} {companyname}
//           </div>
//           <div className="qr-code">
//             <QRCode value={qrValue} size={qrSize} />
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default QRPage;



// import React from "react";
// import QRCode from "react-qr-code";

// const QRPage = () => {
//   const printData = JSON.parse(localStorage.getItem("printData"));

//   if (!printData) {
//     return <div>No data available for printing</div>;
//   }

//   const { asset_tag, companyname, asset_tagheader, labelData } = printData;

//   const qrValue = `${asset_tag}`;

//   const qrWidth = labelData?.labels_width || 100;
//   const qrHeight = labelData?.labels_height || 100;
//   const fontSize = labelData?.labels_fontsize || 14;
//   return (
//     <div className="qr-page-container">
//       {printData && printData.labelData && (
//         <>
//           <div className="header-text">
//             {asset_tagheader} {companyname}
//           </div>
//           <div className="qr-code">
//             <QRCode
//               value={qrValue}
//               size={Math.min(qrWidth, qrHeight, fontSize)}
//             />
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default QRPage;
