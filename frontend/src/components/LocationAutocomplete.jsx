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
    console.log("SELECTED CITY ",location)
    onSelect(location);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <label>{label}</label>

      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowSuggestions(true);
        }}
        placeholder="Scrie orașul..."
        autoComplete="off"
      />

      {loading && <p>Se caută localități...</p>}

      {showSuggestions && suggestions.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "white",
            border: "1px solid #ccc",
            borderTop: "none",
            zIndex: 1000,
            maxHeight: "220px",
            overflowY: "auto",
          }}
        >
          {suggestions.map((item, index) => (
            <div
              key={`${item.location}-${item.county}-${index}`}
              onClick={() => handleSelect(item)}
              style={{
                padding: "10px",
                cursor: "pointer",
                borderBottom: "1px solid #eee",
              }}
            >
              <strong>{item.location}</strong>
              {item.county ? `, ${item.county}` : ""}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LocationAutocomplete;