import React, { useState } from 'react';

export default function GuestCard({ values, onChange, onClose, onApply }) {
  const [localGuests, setLocalGuests] = useState(values);

  const updateGuests = (type, operation) => {
    setLocalGuests(prev => {
      const newValue = operation === 'increment' 
        ? prev[type] + 1 
        : Math.max(type === 'adults' ? 1 : 0, prev[type] - 1);
      
      return {
        ...prev,
        [type]: newValue
      };
    });
  };

  const handleApply = () => {
    onChange(localGuests);    // ← This sends the updated guest values back to GlassSearch
    if (onApply) onApply();
  };

  return (
    <div className="guest-card">
      <h4>Select Guests</h4>
      
      <div className="guest-type">
        <div className="guest-info">
          <span className="guest-label">Adults</span>
          <span className="guest-age">Ages 13+</span>
        </div>
        <div className="guest-controls">
          <button 
            onClick={() => updateGuests('adults', 'decrement')}
            disabled={localGuests.adults <= 1}
            className="guest-btn"
          >
            –
          </button>
          <span className="guest-count">{localGuests.adults}</span>
          <button 
            onClick={() => updateGuests('adults', 'increment')}
            className="guest-btn"
          >
            +
          </button>
        </div>
      </div>

      <div className="guest-type">
        <div className="guest-info">
          <span className="guest-label">Children</span>
          <span className="guest-age">Ages 2-12</span>
        </div>
        <div className="guest-controls">
          <button 
            onClick={() => updateGuests('children', 'decrement')}
            disabled={localGuests.children <= 0}
            className="guest-btn"
          >
            –
          </button>
          <span className="guest-count">{localGuests.children}</span>
          <button 
            onClick={() => updateGuests('children', 'increment')}
            className="guest-btn"
          >
            +
          </button>
        </div>
      </div>

      <div className="guest-total">
        Total: {localGuests.adults + localGuests.children} guest(s)
      </div>

      <div className="guest-actions">
        <button className="cancel-btn" onClick={onClose}>
          Cancel
        </button>
        <button className="apply-btn" onClick={handleApply}>
          Apply
        </button>
      </div>
    </div>
  );
}