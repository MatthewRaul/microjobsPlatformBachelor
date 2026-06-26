import api from "../../api/axios";

export async function getAdminApplications(search = "") {
  const response = await api.get("/api/admin/aplicari");
  return response.data;
}

export async function acceptAdminApplication(id) {
  const response = await api.patch(`/api/admin/aplicari/${id}/accept`);
  return response.data;
}

export async function rejectAdminApplication(id) {
  const response = await api.patch(`/api/admin/aplicari/${id}/reject`);
  return response.data;
}

export async function deleteAdminApplication(id) {
  const response = await api.delete(`/api/admin/aplicari/${id}`);
  return response.data;
}