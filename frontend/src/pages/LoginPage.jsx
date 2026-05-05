import { useState } from "react";
import { loginUser } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";

function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const location = useLocation();
  const successMessage = location.state?.successMessage || "";
  const redirectTo = location.state?.redirectTo || null;

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
      const token = data.token;

      if (!token) {
        setError("Tokenul lipsește din răspuns.");
        return;
      }

      await login(token);

      const currentUserResponse = await api.get("/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const currentUser = currentUserResponse.data;

      if (redirectTo) {
        navigate(redirectTo);
        return;
      }

      if (currentUser?.role === "ADMINISTRATOR") {
        navigate("/admin");
      } else {
        navigate("/");
      }
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