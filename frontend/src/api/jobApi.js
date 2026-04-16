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