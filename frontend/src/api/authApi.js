// authApi.js
// Aici ținem funcțiile legate de autentificare.
// Ideea este să nu punem request-urile direct amestecate în pagini,
// ci să le separăm frumos.

import api from "./axios";

// Funcția loginUser primește datele din formular
// și le trimite la backend.
export const loginUser = async (loginData) => {
  // await = "așteaptă până vine răspunsul"
  const response = await api.post("/api/users/login", loginData);

  // returnăm direct datele importante din răspuns
  return response.data;
};