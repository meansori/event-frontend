// File: src/components/Common/Modal.js
import React from "react";
import { Modal, Button } from "react-bootstrap";

const CustomModal = ({ show, onHide, title, children, size = "lg", confirmText = "Save", onConfirm, loading }) => {
  return (
    <Modal show={show} onHide={onHide} size={size} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          Cancel
        </Button>
        {onConfirm && (
          <Button variant="primary" onClick={onConfirm} disabled={loading}>
            {loading ? "Saving..." : confirmText}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default CustomModal;
