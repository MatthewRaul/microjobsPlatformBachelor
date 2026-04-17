// jobApi.js
// Aici ținem funcțiile legate de joburi.
// Nu vrem să punem request-urile direct în pagină,
// ca să păstrăm codul mai curat și mai ușor de înțeles.

import api from "./axios";


// Funcția cere toate joburile publice de la backend.
export const getAllJobs = async () => {
  const response = await api.get("/api/jobs");

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
  const respons=await api.get("/api/aplicari/me");
  return response.data;
}
