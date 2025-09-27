// File: src/components/Common/LoadingSpinner.js
import React from "react";
import { Spinner } from "react-bootstrap";

const LoadingSpinner = ({ size = "md", text = "Loading..." }) => {
  return (
    <div className="d-flex justify-content-center align-items-center py-4">
      <Spinner animation="border" variant="primary" size={size} />
      <span className="ms-2 text-muted">{text}</span>
    </div>
  );
};

export default LoadingSpinner;
