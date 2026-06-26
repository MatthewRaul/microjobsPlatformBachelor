import api from "./axios";

export const loginUser = async (loginData) => {
  const response = await api.post("/api/users/login", loginData);

  return response.data;
};