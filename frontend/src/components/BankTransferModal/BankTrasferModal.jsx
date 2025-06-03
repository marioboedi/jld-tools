import React from "react";
import { toast } from "react-toastify";

import "./BankTransferModal.css";

const BankTransferModal = ({ onClose, onFileChange, onDone }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Upload Proof of Bank Transfer</h2>
        <p>Please upload an image of your transfer receipt.</p>

        <div className="modal-bank-info">
          <img
            src="https://brandingkan.com/wp-content/uploads/2023/02/Logo-Bank-BCA-1.png"
            alt="BCA Logo"
          />
          <div>
            <strong>BCA</strong> - 5990602893 a.n. Claudya (JLD TOOLS INDONESIA)
          </div>
        </div>

        <input type="file" accept="image/*" onChange={onFileChange} required />

        <div className="modal-buttons">
          <button
            className="modal-close-icon"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
          <button
            className="modal-done"
            onClick={() => {
              onDone();
              toast.success("Sukses menambah bukti pembayaran");
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default BankTransferModal;
