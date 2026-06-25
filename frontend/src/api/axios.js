
// Aici configurăm "baza" pentru toate request-urile către backend.
// Ideea este simplă:
// în loc să scriem de fiecare dată http://localhost:8080,
// îl punem o singură dată aici.

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

api.interceptors.request.use(
  (config)=>{
    const token=localStorage.getItem("token");
    if(token){
      config.headers.Authorization=`Bearer ${token}`;
    }

    return config;
  },
    (error)=>{
      return Promise.reject(error);
    }
  );


export default api;