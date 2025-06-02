import React, { useState } from "react";
import "./ProofModal.css";

const ProofModal = ({ imageUrl, isOpen, onClose }) => {
  const [isZoomed, setIsZoomed] = useState(false);

  if (!isOpen) return null;

  const handleImageClick = () => {
    setIsZoomed((prev) => !prev);
  };

  return (
    <div className="proof-modal-overlay" onClick={onClose}>
      <div className="proof-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="proof-modal-close" onClick={onClose}>
          &times;
        </button>
        <img
          src={imageUrl}
          alt="Payment Proof"
          className={`proof-modal-image ${isZoomed ? "zoomed" : ""}`}
          onClick={handleImageClick}
        />
      </div>
    </div>
  );
};

export default ProofModal;
