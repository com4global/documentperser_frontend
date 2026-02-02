import React from 'react';
import '../Styles/AdminDashboard.css';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel' }) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-dialog-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-dialog-header">
          <h3>{title}</h3>
        </div>
        <div className="confirm-dialog-body">
          <p>{message}</p>
        </div>
        <div className="confirm-dialog-footer">
          <button className="btn-cancel" onClick={onCancel}>{cancelText}</button>
          <button className="btn-confirm" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;