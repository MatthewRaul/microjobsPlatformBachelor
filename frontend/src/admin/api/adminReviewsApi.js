import api from "../../api/axios";

export const getAllReviews = async () => {
  const response = await api.get("/api/admin/reviews");
  return response.data;
};

export const deleteReviewAsAdmin = async (reviewId) => {
  const response = await api.delete(`/api/admin/reviews/${reviewId}`);
  return response.data;
};