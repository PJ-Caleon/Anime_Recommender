import React from "react";
export default function InputBox({
  value,
  onChange,
  onSubmit,
  buttonText = "➤",
  type = "text",
}) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && onSubmit) {
      console.log(`Search: ${value}`);
      onSubmit();
    }
  };

  const handleClick = () => {
    if (onSubmit) {
      console.log(`Search: ${value}`);
      onSubmit();
    }
  };

  return (
    <div className="input-box-container">
      <input
        type={type}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        className="input-box-field"
      />
      <button type="button" onClick={handleClick} className="input-box-button">
        {buttonText}
      </button>
    </div>
  );
}
