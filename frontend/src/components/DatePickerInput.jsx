import DatePicker, { registerLocale } from "react-datepicker";
import { ro } from "date-fns/locale/ro";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/datepicker.css";

registerLocale("ro", ro);

/**
 * DatePickerInput — component reutilizabil
 *
 * Props:
 *   label    — textul labelului
 *   selected — Date | null
 *   onChange — callback(date)
 *   minDate  — Date opțional
 *   maxDate  — Date opțional
 *   showTime — true (default) = afiseaza si ora | false = doar data
 */
export default function DatePickerInput({
  label,
  selected,
  onChange,
  minDate,
  maxDate,
  showTime = true,
}) {
  const hasValue = !!selected;

  return (
    <div className="user-box" style={{ position: "relative" }}>
      <DatePicker
        selected={selected}
        onChange={onChange}
        showTimeSelect={showTime}
        timeFormat={showTime ? "HH:mm" : undefined}
        timeIntervals={showTime ? 15 : undefined}
        dateFormat={showTime ? "dd.MM.yyyy, HH:mm" : "dd.MM.yyyy"}
        locale="ro"
        minDate={minDate}
        maxDate={maxDate}
        placeholderText=" "
        autoComplete="off"
        popperPlacement="bottom-start"
        popperProps={{ strategy: "fixed" }}
        customInput={
          <input
            type="text"
            placeholder=" "
            style={{ cursor: "pointer", caretColor: "transparent" }}
            readOnly
          />
        }
      />
      <label style={{
        position: "absolute",
        left: hasValue ? "4px" : "12px",
        top: hasValue ? "-20px" : "10px",
        fontSize: hasValue ? "12px" : "16px",
        color: hasValue ? "#ffffff" : "rgba(255,255,255,0.6)",
        pointerEvents: "none",
        transition: "all 0.35s ease",
      }}>
        {label}
      </label>
    </div>
  );
}