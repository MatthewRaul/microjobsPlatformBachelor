import api from "./axios";

export const getMe = async () => {
  const response = await api.get("/api/users/me");
  return response.data;
};

export const update= async (userData) => {
    const response = await api.patch("/api/users/me",userData);
    return response.data;
};

export const getPublicUserProfile = async (userId) => {
  const response = await api.get(`/api/users/public/${userId}`);
  return response.data;
}