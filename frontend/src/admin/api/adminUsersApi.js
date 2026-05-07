import axios from "../../api/axios";

export async function getAdminUsers(search = "") {
  const response = await axios.get("/api/admin/users", {
    params: search ? { search } : {},
  });
  return response.data;
}

export async function getAdminUserById(id) {
  const response = await axios.get(`/api/admin/users/${id}`);
  return response.data;
}

export async function updateAdminUserRole(id, role) {
  const response = await axios.patch(`/api/admin/users/${id}/role`, {
    role,
  });
  return response.data;
}

export async function deleteAdminUser(id) {
  const response = await axios.delete(`/api/admin/users/${id}`);
  return response.data;
}