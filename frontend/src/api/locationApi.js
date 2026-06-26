import api from "./axios";

export const searchLocations = async (query) => {
  const response = await api.get("/api/locations/search", {
    params: { query },
  });

  return response.data.map(item=> ({
    location: item.location,
    county:item.county
  }));
};