import api from "./axios";

export const getMe = async () => {
  const response = await api.get("/api/users/me");
  return response.data;
};

export const update= async (userData) => {
    const response = await api.patch("/api/users/me",userData);
    return response.data;
};