import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import JobList from './pages/JobList';
import JobDetail from './pages/JobDetail';
import MyApplications from './pages/MyApplications';
import CreateJob from './pages/company/CreateJob';
import CompanyJobs from './pages/company/CompanyJobs';
import JobCandidates from './pages/company/JobCandidates';

/** Renders the right "home" page depending on the logged-in user's role. */
function Home() {
  const { user } = useAuth();
  if (user?.role === 'COMPANY') return <CompanyJobs />;
  return <JobList />;
}

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          {/* Job Seeker routes */}
          <Route
            path="/jobs/:id"
            element={
              <ProtectedRoute allowedRoles={['JOB_SEEKER']}>
                <JobDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-applications"
            element={
              <ProtectedRoute allowedRoles={['JOB_SEEKER']}>
                <MyApplications />
              </ProtectedRoute>
            }
          />

          {/* Company routes */}
          <Route
            path="/company/create-job"
            element={
              <ProtectedRoute allowedRoles={['COMPANY']}>
                <CreateJob />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/jobs/:jobId/candidates"
            element={
              <ProtectedRoute allowedRoles={['COMPANY']}>
                <JobCandidates />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
