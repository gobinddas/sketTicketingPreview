// components/ReceiptModal.js
import React from 'react';

const ReceiptModal = ({ session, onClose }) => {
  return (
    <div className="receipt-modal">
      <div className="modal-content">
        <h2>Receipt</h2>
        <p><strong>Name:</strong> {session.name}</p>
        <p><strong>Number of People:</strong> {session.people}</p>
        <p><strong>Start Time:</strong> {session.startTime}</p>
        <p><strong>End Time:</strong> {session.endTime}</p>
        <p><strong>Total Price:</strong> Rs. {session.totalPrice}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default ReceiptModal;
