import { useState } from "react";

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
    <form onSubmit={handleSubmit} style={styles.form}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        style={styles.input}
      />

      <button type="submit" style={{ ...styles.button, ...styles.searchButton }}>
        Caută
      </button>

      <button type="button" onClick={handleClear} style={{ ...styles.button, ...styles.clearButton }}>
        Reset
      </button>
    </form>
  );
}

const styles = {
  form: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },
  input: {
    flex: 1,
    minWidth: "240px",
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    outline: "none",
    backgroundColor: "#ffffff",
  },
  button: {
    padding: "12px 16px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  searchButton: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
  },
  clearButton: {
    backgroundColor: "#e5e7eb",
    color: "#111827",
  },
};