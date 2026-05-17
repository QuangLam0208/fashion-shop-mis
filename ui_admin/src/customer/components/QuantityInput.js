// src/customer/components/QuantityInput.js
import React from 'react';
import '../styles/product.css';

/**
 * QuantityInput — nút − / số lượng / +
 * Props:
 *   value: number
 *   min: number (default 1)
 *   max: number (default 99)
 *   onChange: (newValue) => void
 *   disabled: bool
 */
const QuantityInput = ({ value = 1, min = 1, max = 99, onChange, disabled = false }) => {
  const handleDec = () => { if (value > min) onChange(value - 1); };
  const handleInc = () => { if (value < max) onChange(value + 1); };
  const handleInput = (e) => {
    const v = parseInt(e.target.value);
    if (!isNaN(v) && v >= min && v <= max) onChange(v);
  };

  return (
    <div className="qty-input">
      <button
        className="qty-input__btn"
        onClick={handleDec}
        disabled={disabled || value <= min}
        aria-label="Giảm số lượng"
      >
        −
      </button>
      <input
        className="qty-input__value"
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={handleInput}
        disabled={disabled}
        aria-label="Số lượng"
      />
      <button
        className="qty-input__btn"
        onClick={handleInc}
        disabled={disabled || value >= max}
        aria-label="Tăng số lượng"
      >
        +
      </button>
    </div>
  );
};

export default QuantityInput;