import DatePicker, { registerLocale } from "react-datepicker";
import { ro } from "date-fns/locale/ro";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/datepicker.css";

registerLocale("ro", ro);

export default function DatePickerInput({label, selected, onChange, minDate, maxDate, minTime, maxTime, filterTime, showTime = true}) {
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
        minTime={minTime}
        maxTime={maxTime}
        filterTime={filterTime}
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
        color: hasValue ? "#ffffff" : "rgba(0,0,0,0.5)",
        pointerEvents: "none",
        transition: "all 0.35s ease",
      }}>
        {label}
      </label>
    </div>
  );
}



