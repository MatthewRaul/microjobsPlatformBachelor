import api from "./axios";

// Funcția loginUser primește datele din formular
// și le trimite la backend.
export const loginUser = async (loginData) => {
  // await = "așteaptă până vine răspunsul"
  const response = await api.post("/api/users/login", loginData);

  // returnăm direct datele importante din răspuns
  return response.data;
};