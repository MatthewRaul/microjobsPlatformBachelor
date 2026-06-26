import api from "../../api/axios";

export async function getAdminUsers(search = "") {
  const response = await api.get("/api/admin/users", {
    params: search ? { search } : {},
  });
  return response.data;
}

export async function updateAdminUserRole(id, role) {
  const response = await api.patch(`/api/admin/users/${id}/role`, {
    role,
  });
  return response.data;
}

export async function deleteAdminUser(id) {
  const response = await api.delete(`/api/admin/users/${id}`);
  return response.data;
}