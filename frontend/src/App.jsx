// App.jsx este componenta principală.
// Aici definim ce pagină se afișează pentru fiecare URL.

import { Routes, Route, useLocation,Navigate } from "react-router-dom";

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
import PublicProfilePage from "./pages/PublicProfilePage";
import EditJobPage from "./pages/EditJobPage";
import AdminRoute from "./admin/components/AdminRoute";
import AdminJobsPage from "./admin/pages/AdminJobsPage";
import AdminApplicationsPage from "./admin/pages/AdminApplicationsPage";
import AdminUsersPage from "./admin/pages/AdminUsersPage";


function App() {

  const location= useLocation();
  const isAdminRoute= location.pathname.startsWith("/admin");
  return (
    // app-container este "cutia mare" a întregii aplicații.
    <div className="app-container">
      {!isAdminRoute && <Navbar/>}

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

          <Route path="/users/public/:id" element={<PublicProfilePage/>}/>

          

          <Route element={<ProtectedRoute />}>
              
              <Route path="/my-applications" element={<MyApplicationsPage/>}/>
              <Route path="/add-job" element={<AddJobPage />} />
              <Route path="/my-jobs" element={<MyJobsPage/>} />
              <Route path="/profile" element={<ProfilePage/>} />
              <Route path="/jobs/:id/edit" element={<EditJobPage/>}/>
              
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<Navigate to="/admin/jobs" replace/>}/>
            <Route path="/admin/jobs" element={<AdminJobsPage />} />
            <Route path="/admin/aplicari" element={<AdminApplicationsPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;