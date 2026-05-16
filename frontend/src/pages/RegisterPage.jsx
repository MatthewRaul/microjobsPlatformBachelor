import { useState } from "react";
import { registerUser } from "../api/register";
import { useNavigate, Link } from "react-router-dom";
import "../styles/auth.css";

function RegisterPage() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [age,setAge]= useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !phoneNumber.trim() ||
      !age.trim()||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setError("Toate câmpurile sunt obligatorii.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Parolele nu coincid.");
      return;
    }

    if (password.length < 6) {
      setError("Parola trebuie să aibă minim 6 caractere.");
      return;
    }

    const registerData = { firstName, lastName, email, phoneNumber, password };

    try {
      setLoading(true);
      await registerUser(registerData);
      navigate("/login", {
        state: { successMessage: "Contul a fost creat cu succes." },
      });
    } catch (err) {
      const backendMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Înregistrarea a eșuat. Verifică datele introduse.";
      setError(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="form-box">
        <h1>Înregistrare</h1>

        <form onSubmit={handleSubmit}>
          <div className="user-box">
            <input
              id="firstName"
              type="text"
              placeholder=" "
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <label htmlFor="firstName">Prenume</label>
          </div>

          <div className="user-box">
            <input
              id="lastName"
              type="text"
              placeholder=" "
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            <label htmlFor="lastName">Nume</label>
          </div>

          <div className="user-box">
            <input
              id="email"
              type="email"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="email">Email</label>
          </div>

          <div className="user-box">
            <input
              id="phoneNumber"
              type="text"
              placeholder=" "
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <label htmlFor="phoneNumber">Număr de telefon</label>
          </div>
          <div className="user-box">
            <input
              id="phoneNumber" 
              type="text"
              placeholder=" "
              value={age}
              onChange={(e)=> setAge(e.target.value)}
              />
              <label htmlFor="age">Vârsta</label>
          </div>

          <div className="user-box">
            <input
              id="password"
              type="password"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label htmlFor="password">Parolă</label>
          </div>

          <div className="user-box">
            <input
              id="confirmPassword"
              type="password"
              placeholder=" "
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <label htmlFor="confirmPassword">Confirmă parola</label>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Se procesează..." : "Creează cont"}
          </button>
        </form>

        <p className="form-footer">
          Ai deja cont?{" "}
          <Link to="/login">Autentifică-te</Link>
        </p>
      </div>
    </section>
  );
}

export default RegisterPage;