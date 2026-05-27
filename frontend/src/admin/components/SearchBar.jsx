import { useState } from "react";
import "../styles/admin.css";

export default function SearchBar({ onSearch, placeholder = "Caută..." }) {
  const [value, setValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(value.trim());
  };

  const handleClear = () => {
    setValue("");
    onSearch("");
  };

  return (
    <form onSubmit={handleSubmit} className="admin-search-form">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="admin-search-input"
      />
      <button type="submit" className="admin-btn admin-btn--primary">
        Caută
      </button>
      <button type="button" onClick={handleClear} className="admin-btn admin-btn--reset">
        Reset
      </button>
    </form>
  );
}