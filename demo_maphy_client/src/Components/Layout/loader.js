import React from "react";

const Loader = () => {
  return (
    <div className="maphy-loader-overlay">
      <div className="maphy-loader-container">
        <svg viewBox="0 0 100 100" className="maphy-loader-svg">
          <defs>
            <linearGradient id="loader-glow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#029df7" stopOpacity="1" />
              <stop offset="100%" stopColor="#2baffc" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          {/* Orbit track */}
          <circle cx="50" cy="50" r="40" className="loader-orbit-track" />
          {/* Orbit rotating glowing dash */}
          <circle cx="50" cy="50" r="40" className="loader-orbit-glow" />
          {/* The letter M path */}
          <path
            d="M 30,70 L 30,30 L 50,52 L 70,30 L 70,70"
            className="loader-m-path"
          />
        </svg>
        <div className="loader-text">MAPHY</div>
      </div>
    </div>
  );
};

export default Loader;
