// App.jsx este componenta principală.
// Aici definim ce pagină se afișează pentru fiecare URL.

import { Routes, Route } from "react-router-dom";

// Importăm bara de navigare care va apărea pe toate paginile.
import Navbar from "./components/Navbar";

// Importăm paginile.
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

function App() {
  return (
    // app-container este "cutia mare" a întregii aplicații.
    <div className="app-container">
      {/* Navbar va rămâne vizibil sus */}

      {/* main-content este zona care se schimbă în funcție de rută */}
      <main className="main-content">
        <Routes>
          {/* Ruta / va afișa pagina principală */}
          <Route path="/" element={<HomePage />} />

          {/* Ruta /login va afișa pagina de login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Ruta /register va afișa pagina de înregistrare */}
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;