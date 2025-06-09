// src/components/LoginRequiredModal/LoginRequiredModal.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginRequiredModal.css';

const LoginRequiredModal = ({ onClose }) => {
  const navigate = useNavigate();

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2 className="modal-title">Login Required</h2>
        <p className="modal-message">You must be logged in to perform this action.</p>
        <div className="modal-buttons">
          <button className="btn btn-primary" onClick={() => navigate('/login')}>
            Go to Login
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginRequiredModal;
