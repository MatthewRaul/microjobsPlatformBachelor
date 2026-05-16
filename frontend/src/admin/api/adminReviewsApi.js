import api from "../../api/axios";

// Obtine toate recenziile (admin)
export const getAllReviews = async () => {
  const response = await api.get("/api/admin/reviews");
  return response.data;
};

// Sterge o recenzie (admin)
export const deleteReviewAsAdmin = async (reviewId) => {
  const response = await api.delete(`/api/admin/reviews/${reviewId}`);
  return response.data;
};