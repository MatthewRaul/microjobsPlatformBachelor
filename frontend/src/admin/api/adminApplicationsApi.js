import axios from "../../api/axios";

export async function getAdminApplications(search = "") {
  const response = await axios.get("/api/admin/aplicari");
  return response.data;
}

export async function getAdminApplicationById(id) {
  const response = await axios.get(`/api/admin/aplicari/${id}`);
  return response.data;
}

export async function acceptAdminApplication(id) {
  const response = await axios.patch(`/api/admin/aplicari/${id}/accept`);
  return response.data;
}

export async function rejectAdminApplication(id) {
  const response = await axios.patch(`/api/admin/aplicari/${id}/reject`);
  return response.data;
}

export async function deleteAdminApplication(id) {
  const response = await axios.delete(`/api/admin/aplicari/${id}`);
  return response.data;
}