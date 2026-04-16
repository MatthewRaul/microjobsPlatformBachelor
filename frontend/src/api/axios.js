
// Aici configurăm "baza" pentru toate request-urile către backend.
// Ideea este simplă:
// în loc să scriem de fiecare dată http://localhost:8080,
// îl punem o singură dată aici.

import axios from "axios";

// Creăm o instanță Axios personalizată.
// baseURL = adresa de bază a backend-ului tău Spring Boot.
const api = axios.create({
  baseURL: "http://localhost:8080",
});

// Exportăm instanța ca să o putem folosi în alte fișiere.
export default api;