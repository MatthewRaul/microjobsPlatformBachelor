import api from "./axios";

export const getMe = async () => {
  const response = await api.get("/api/users/me");
  return response.data;
};

export const update = async (userData) => {
  const response = await api.patch("/api/users/me", userData);
  return response.data;
};

export const getPublicUserProfile = async (userId) => {
  const response = await api.get(`/api/users/public/${userId}`);
  return response.data;
};

export const getPublicUserRating = async (userId) => {
  const response = await api.get(`/api/users/${userId}/rating`);
  return response.data;
};

export const getPublicUserReviews = async (userId) => {
  const response = await api.get(`/api/users/${userId}/reviews`);
  return response.data;
};

export const createReview = async (reviewData) => {
  const response = await api.post("/api/reviews", reviewData);
  return response.data;
};