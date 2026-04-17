// LoginPage.jsx

import { useState } from "react";
import { loginUser } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useLocation} from "react-router-dom";

function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const location=useLocation();
  const successMessage= location.state?.successMessage || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Completează emailul și parola.");
      return;
    }

    try {
      setLoading(true);

      const data = await loginUser(formData);

      // Dacă la tine tokenul are alt nume, schimbi aici
      const token = data.token;

      if (!token) {
        setError("Tokenul lipsește din răspuns.");
        return;
      }

      await login(token);
      navigate("/");
    } catch (err) {
      const backendMessage =
        err.response?.data?.message || "Email sau parolă greșită.";

      setError(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page auth-page">
      <h1>Login</h1>

      {successMessage && <p className="form-success">{successMessage}</p>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Introdu emailul"
          value={formData.email}
          onChange={handleChange}
        />

        <label htmlFor="password">Parolă</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Introdu parola"
          value={formData.password}
          onChange={handleChange}
        />

        {error && <p className="error-message">{error}</p>}

        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? "Se procesează..." : "Autentificare"}
        </button>
      </form>
    </section>
  );
}

export default LoginPage;