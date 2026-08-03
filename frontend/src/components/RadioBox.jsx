import React from "react";

export default function RadioBox({ options, selected, onChange }) {
  return (
    <div className="radio-box-container">
      {options.map((option) => (
        <label
          key={option.value}
          className={`radio-label ${selected === option.value ? "active" : ""}`}
        >
          <input
            type="radio"
            name="searchMode"
            value={option.value}
            checked={selected === option.value}
            onChange={(e) => onChange(e.target.value)}
            className="radio-input"
          />
          <span className="radio-text">{option.label}</span>
        </label>
      ))}
    </div>
  );
}
