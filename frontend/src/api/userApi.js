import api from "./axios";

export const getMe = async () => {
  const response = await api.get("/api/users/me");
  return response.data;
};

export const update = async (userData) => {
  const response = await api.patch("/api/users/me", userData);
  return response.data;
};

export const getPublicUserProfile = async (email) => {
  const response = await api.get(`/api/users/public/${encodeURIComponent(email)}`);
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

// Upload CV ca FormData (fisier PDF)
export const uploadCv = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/api/users/me/cv", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Obtine CV-ul unui user ca Base64 pentru download
export const getUserCv = async (userId) => {
  const response = await api.get(`/api/users/${userId}/cv`);
  return response.data; // { cvBase64, fileName }
};

// Upload poza de profil
export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/api/users/me/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data; // { profilePictureUrl }
};

// Sterge CV-ul propriu
export const deleteCv = async () => {
  const response = await api.delete("/api/users/me/cv");
  return response.data;
};

// Sterge poza de profil (seteaza profilePictureUrl la string gol)
export const deleteAvatar = async () => {
  const response = await api.patch("/api/users/me", { profilePictureUrl: "" });
  return response.data;
};