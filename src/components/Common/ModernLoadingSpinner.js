// File: src/components/Common/ModernLoadingSpinner.js
import React from "react";
import "./ModernLoadingSpinner.css";

const ModernLoadingSpinner = ({ size = "md", text = "Loading..." }) => {
  return (
    <div className={`modern-loading-container ${size}`}>
      <div className="modern-spinner">
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
      </div>
      {text && <span className="loading-text">{text}</span>}
    </div>
  );
};

export default ModernLoadingSpinner;
