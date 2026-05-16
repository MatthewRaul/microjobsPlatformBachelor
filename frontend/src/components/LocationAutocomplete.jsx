import { useEffect, useState } from "react";
import { searchLocations } from "../api/locationApi";

function LocationAutocomplete({ value, onChange, onSelect, label = "Localitate" }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const fetchSuggestions = async () => {
        if (!value || value.trim().length < 2) {
          setSuggestions([]);
          return;
        }

        try {
          setLoading(true);
          const results = await searchLocations(value.trim());
          setSuggestions(results);
          setShowSuggestions(true);
        } catch (error) {
          console.error("Eroare la căutarea localităților:", error);
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
      };

      fetchSuggestions();
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [value]);

  const handleSelect = (location) => {
    onSelect(location);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="user-box" style={{ position: "relative" }}>
      <input
        type="text"
        placeholder=" "
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowSuggestions(true);
        }}
        autoComplete="off"
      />
      <label>{label}</label>

      {loading && (
        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", margin: "4px 0 0 0" }}>
          Se caută localități...
        </p>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          background: "#2d2d2d",
          border: "1px solid rgba(255,255,255,0.3)",
          borderRadius: "6px",
          zIndex: 1000,
          maxHeight: "220px",
          overflowY: "auto",
          marginTop: "4px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
        }}>
          {suggestions.map((item, index) => (
            <div
              key={`${item.location}-${item.county}-${index}`}
              onClick={() => handleSelect(item)}
              style={{
                padding: "10px 14px",
                cursor: "pointer",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                color: "#ffffff",
                fontSize: "14px",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <strong>{item.location}</strong>
              {item.county ? (
                <span style={{ color: "rgba(255,255,255,0.55)", marginLeft: "6px" }}>
                  {item.county}
                </span>
              ) : ""}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LocationAutocomplete;