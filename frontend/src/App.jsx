import { Routes, Route, useLocation, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";

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
import PublicUserReviewsPage from "./pages/PublicUserReviewsPage";
import EditJobPage from "./pages/EditJobPage";
import ReviewPage from "./pages/ReviewPage";

import AdminRoute from "./admin/components/AdminRoute";
import AdminJobsPage from "./admin/pages/AdminJobsPage";
import AdminApplicationsPage from "./admin/pages/AdminApplicationsPage";
import AdminUsersPage from "./admin/pages/AdminUsersPage";
import AddReviewForm from "./components/AddReviewForm";
import AdminLayout from "./admin/components/AdminLayout";
import AdminReviewsPage from "./admin/pages/AdminReviewsPage";

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="app-container">
      {!isAdminRoute && <Navbar />}
      <main className="main-content" style={!isAdminRoute ? { paddingTop: "56px" } : {}}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/jobs/:id" element={<JobDetailsPage />} />

          <Route path="/users/public/:id" element={<PublicProfilePage />} />
          <Route path="/users/public/:id/reviews" element={<PublicUserReviewsPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/my-applications" element={<MyApplicationsPage />} />
            <Route path="/add-job" element={<AddJobPage />} />
            <Route path="/my-jobs" element={<MyJobsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/jobs/:id/edit" element={<EditJobPage />} />
            <Route path="/jobs/:jobId/review/:reviewedUserId" element={<ReviewPage />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<Navigate to="/admin/jobs" replace />} />
            <Route path="/admin/jobs" element={<AdminJobsPage />} />
            <Route path="/admin/aplicari" element={<AdminApplicationsPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/reviews" element={<AdminReviewsPage/>}/>
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;