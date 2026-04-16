// AuthContext.jsx
// Acesta este locul central unde ținem autentificarea aplicației.

import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // user = datele userului logat
  const [user, setUser] = useState(null);

  // loading = cât timp verificăm dacă userul este logat
  const [loading, setLoading] = useState(true);

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const saveToken = (token) => {
    localStorage.setItem("token", token);
  };

  const removeToken = () => {
    localStorage.removeItem("token");
  };

  const fetchCurrentUser = async () => {
    try {
      const token = getToken();

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await api.get("/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(response.data);
    } catch (error) {
      removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (token) => {
    saveToken(token);
    await fetchCurrentUser();
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        getToken,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}