import api from "../../api/axios";

export async function getAdminJobs() {
  const response = await api.get("/api/admin/jobs");
  return response.data;
}

export async function cancelAdminJob(id) {
  const response = await api.patch(`/api/admin/jobs/${id}/cancel`);
  return response.data;
}

export async function completeAdminJob(id) {
  const response = await api.patch(`/api/admin/jobs/${id}/complete`);
  return response.data;
}

export async function deleteAdminJob(id) {
  const response = await api.delete(`/api/admin/jobs/${id}`);
  return response.data;
}