// jobApi.js
// Aici ținem funcțiile legate de joburi.
// Nu vrem să punem request-urile direct în pagină,
// ca să păstrăm codul mai curat și mai ușor de înțeles.

import api from "./axios";


// Funcția cere toate joburile publice de la backend.
export const getAllJobs = async (filters={}) => {
  const response = await api.get("/api/jobs", {
    params:filters ,
  });

  // response.data este lista de joburi trimisă de backend
  return response.data;
};
export const createJob= async(jobData)=>{
  const response=await api.post("/api/jobs",jobData);
  return response.data;
};

export const applyToJob = async (jobId) => {
  const response = await api.post(`/api/jobs/${jobId}/apply`);
  return response.data;
};

export const getMyApplications = async()=>{
  const response=await api.get("/api/aplicari/me");
  return response.data;
};

export const getJobById= async (jobId)=> {
  const response = await api.get(`/api/jobs/${jobId}`);
  return response.data;
};

export const cancelJob = async (jobId) => {
  const response = await api.patch(`/api/jobs/${jobId}/cancel`);
  return response.data;
};

export const completeJob = async (jobId) => {
  const response = await api.patch(`/api/jobs/${jobId}/complete`);
  return response.data;
};

export const getMyJobs= async () => {
  const response = await api.get("/api/jobs/me");
  return response.data;
};

export const updateJob = async (jobId, jobData) => {
  const response = await api.patch(`/api/jobs/${jobId}`, jobData);
  return response.data;
};

export const deleteJob= async (jobId) => {
  const response = await api.delete(`/api/jobs/${jobId}`);
  return response.data;
}

export const getApplicationsForJob = async (jobId) => {
  const response = await api.get(`/api/jobs/${jobId}/aplicari`);
  return response.data;
};

export const acceptApplication = async (applicationId) => {
  const response = await api.patch(`/api/aplicari/${applicationId}/accept`);
  return response.data;
};

export const rejectApplication = async (applicationId) => {
  const response = await api.patch(`/api/aplicari/${applicationId}/reject`);
  return response.data;
};




