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
        } catch {
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
    <div className="user-box location-autocomplete">
      <input
        type="text"
        placeholder=" "
        value={value}
        onChange={(e) => { onChange(e.target.value); setShowSuggestions(true); }}
        autoComplete="off"
      />
      <label>{label}</label>

      {loading && (
        <p className="location-autocomplete__loading">Se caută localități...</p>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="location-autocomplete__dropdown">
          {suggestions.map((item, index) => (
            <div
              key={`${item.location}-${item.county}-${index}`}
              className="location-autocomplete__item"
              onClick={() => handleSelect(item)}
            >
              <strong>{item.location}</strong>
              {item.county && (
                <span className="location-autocomplete__county">{item.county}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LocationAutocomplete;