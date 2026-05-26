import { useState } from "react";
import { registerUser } from "../api/register";
import { useNavigate, Link } from "react-router-dom";

function RegisterPage() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [age, setAge] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!firstName.trim()) newErrors.firstName = "Prenumele este obligatoriu.";
    else if (!/^[A-ZĂÂÎȘȚ][a-zA-ZăâîșțÄäÖö\- ]+$/.test(firstName.trim())) newErrors.firstName = "Prenumele trebuie să înceapă cu majusculă și să conțină doar litere.";
    if (!lastName.trim()) newErrors.lastName = "Numele este obligatoriu.";
    else if (!/^[A-ZĂÂÎȘȚ][a-zA-ZăâîșțÄäÖö\- ]+$/.test(lastName.trim())) newErrors.lastName = "Numele trebuie să înceapă cu majusculă și să conțină doar litere.";
    if (!email.trim()) newErrors.email = "Emailul este obligatoriu.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) newErrors.email = "Introdu o adresă de email validă.";
    if (!phoneNumber.trim()) newErrors.phoneNumber = "Numărul de telefon este obligatoriu.";
    else if (!/^\d{10}$/.test(phoneNumber.trim())) newErrors.phoneNumber = "Numărul de telefon trebuie să conțină exact 10 cifre.";
    if (!password) newErrors.password = "Parola este obligatorie.";
    else if (password.length < 6) newErrors.password = "Parola trebuie să aibă cel puțin 6 caractere.";
    if (!age.trim()) newErrors.age = "Vârsta este obligatorie.";
    else if (isNaN(Number(age)) || Number(age) < 16 || Number(age) > 100) newErrors.age = "Vârsta trebuie să fie între 15 și 100 de ani.";
    if (!confirmPassword) newErrors.confirmPassword = "Confirmarea parolei este obligatorie.";
    else if (password && confirmPassword !== password) newErrors.confirmPassword = "Parolele nu coincid.";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    setErrors({});
    try {
      setLoading(true);
      await registerUser({ firstName, lastName, email, phoneNumber, password, age: Number(age) });
      navigate("/login", { state: { successMessage: "Contul a fost creat cu succes." } });
    } catch (err) {
      const data = err.response?.data;
      const msg = (typeof data === "string" ? data : null) || data?.message || data?.error || "Înregistrarea a eșuat. Verifică datele introduse.";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  const clearError = (field) => {
    if (errors[field]) setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
  };

  const inputClass = (field) => errors[field] ? { borderColor: "var(--color-error-light)" } : {};

  return (
    <section className="auth-page">
      <div className="form-box">
        <h1>Înregistrare</h1>
        <form onSubmit={handleSubmit} noValidate>
          <div className="user-box">
            <input id="firstName" type="text" placeholder="Prenume" value={firstName}
              onChange={(e) => { setFirstName(e.target.value); clearError("firstName"); }}
              style={inputClass("firstName")} />
            <label htmlFor="firstName">Prenume</label>
            {errors.firstName && <p className="form-error" style={{ marginTop: 6 }}>{errors.firstName}</p>}
          </div>
          <div className="user-box">
            <input id="lastName" type="text" placeholder="Nume" value={lastName}
              onChange={(e) => { setLastName(e.target.value); clearError("lastName"); }}
              style={inputClass("lastName")} />
            <label htmlFor="lastName">Nume</label>
            {errors.lastName && <p className="form-error" style={{ marginTop: 6 }}>{errors.lastName}</p>}
          </div>
          <div className="user-box">
            <input id="email" type="email" placeholder="Email" value={email}
              onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
              style={inputClass("email")} />
            <label htmlFor="email">Email</label>
            {errors.email && <p className="form-error" style={{ marginTop: 6 }}>{errors.email}</p>}
          </div>
          <div className="user-box">
            <input id="phoneNumber" type="text" placeholder="Număr de telefon" value={phoneNumber}
              onChange={(e) => { setPhoneNumber(e.target.value); clearError("phoneNumber"); }}
              style={inputClass("phoneNumber")} />
            <label htmlFor="phoneNumber">Număr de telefon</label>
            {errors.phoneNumber && <p className="form-error" style={{ marginTop: 6 }}>{errors.phoneNumber}</p>}
          </div>
          <div className="user-box">
            <input id="age" type="number" placeholder="Vârstă" value={age}
              onChange={(e) => { setAge(e.target.value); clearError("age"); }}
              style={inputClass("age")} />
            <label htmlFor="age">Vârstă</label>
            {errors.age && <p className="form-error" style={{ marginTop: 6 }}>{errors.age}</p>}
          </div>
          <div className="user-box">
            <input id="password" type="password" placeholder="Parolă" value={password}
              onChange={(e) => { setPassword(e.target.value); clearError("password"); clearError("confirmPassword"); }}
              style={inputClass("password")} />
            <label htmlFor="password">Parolă</label>
            {errors.password && <p className="form-error" style={{ marginTop: 6 }}>{errors.password}</p>}
          </div>
          <div className="user-box">
            <input id="confirmPassword" type="password" placeholder="Confirmă parola" value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); clearError("confirmPassword"); }}
              style={inputClass("confirmPassword")} />
            <label htmlFor="confirmPassword">Confirmă parola</label>
            {errors.confirmPassword && <p className="form-error" style={{ marginTop: 6 }}>{errors.confirmPassword}</p>}
          </div>
          {serverError && <p className="form-error">{serverError}</p>}
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Se procesează..." : "Creează cont"}
          </button>
        </form>
        <p className="form-footer">Ai deja un cont? <Link to="/login">Autentifică-te</Link></p>
      </div>
    </section>
  );
}

export default RegisterPage;