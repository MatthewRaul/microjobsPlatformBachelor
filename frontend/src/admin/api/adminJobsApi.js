import axios from "../../api/axios";

export async function getAdminJobs(filters = {}) {
  const params = {};

  if (filters.location) {
    params.location = filters.location;
  }

  if (filters.participants) {
    params.participants = filters.participants;
  }

  if (filters.startDate) {
    params.startDate = filters.startDate;
  }

  if (filters.endDate) {
    params.endDate = filters.endDate;
  }

  if (filters.status) {
    params.status = filters.status;
  }

  const response = await axios.get("/api/jobs", { params });
  return response.data;
}

export async function cancelAdminJob(id) {
  const response = await axios.patch(`/api/jobs/${id}/cancel`);
  return response.data;
}

export async function completeAdminJob(id) {
  const response = await axios.patch(`/api/jobs/${id}/complete`);
  return response.data;
}

export async function deleteAdminJob(id) {
  const response = await axios.delete(`/api/jobs/${id}`);
  return response.data;
}