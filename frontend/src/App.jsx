// App.jsx este componenta principală.
// Aici definim ce pagină se afișează pentru fiecare URL.

import { Routes, Route } from "react-router-dom";

// Importăm bara de navigare care va apărea pe toate paginile.
import Navbar from "./components/Navbar";

// Importăm paginile.
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AddJobPage from "./pages/AddJobPage";
import MyApplicationsPage from "./pages/MyApplicationsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import JobDetailsPage from "./pages/JobDetailsPage";
import MyJobsPage from "./pages/MyJobsPage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    // app-container este "cutia mare" a întregii aplicații.
    <div className="app-container">
      <Navbar/>

      {/* main-content este zona care se schimbă în funcție de rută */}
      <main className="main-content">
        <Routes>
          {/* Ruta / va afișa pagina principală */}
          <Route path="/" element={<HomePage />} />

          {/* Ruta /login va afișa pagina de login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Ruta /register va afișa pagina de înregistrare */}
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/jobs/:id" element={<JobDetailsPage />} />

          

          <Route element={<ProtectedRoute />}>
              <Route path="/my-applications" element={<MyApplicationsPage/>}/>
              <Route path="/add-job" element={<AddJobPage />} />
              <Route path="/my-jobs" element={<MyJobsPage/>} />
              <Route path="/profile" element={<ProfilePage/>} />
              
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;