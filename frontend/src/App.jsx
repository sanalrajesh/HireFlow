import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import EmployerLayout from './layouts/EmployerLayout';

// Public Pages
import Home from './pages/Home';
import JobListings from './pages/JobListings';
import JobDetails from './pages/JobDetails';
import Login from './pages/Login';
import Register from './pages/Register';

// Candidate Pages
import CandidateDashboard from './pages/CandidateDashboard';
import CandidateProfile from './pages/CandidateProfile';
import CandidateApplications from './pages/CandidateApplications';

// Employer Pages
import EmployerDashboard from './pages/EmployerDashboard';
import EmployerManageJobs from './pages/EmployerManageJobs';
import EmployerCreateJob from './pages/EmployerCreateJob';
import EmployerEditJob from './pages/EmployerEditJob';
import EmployerApplicants from './pages/EmployerApplicants';
import EmployerProfile from './pages/EmployerProfile';

import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes inside PublicLayout */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/jobs" element={<PublicLayout><JobListings /></PublicLayout>} />
          <Route path="/jobs/:id" element={<PublicLayout><JobDetails /></PublicLayout>} />
          <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
          <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />

          {/* Candidate Protected Routes inside PublicLayout */}
          <Route
            path="/candidate/dashboard"
            element={
              <ProtectedRoute allowedRoles={['Candidate']}>
                <PublicLayout>
                  <CandidateDashboard />
                </PublicLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/profile"
            element={
              <ProtectedRoute allowedRoles={['Candidate']}>
                <PublicLayout>
                  <CandidateProfile />
                </PublicLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/applications"
            element={
              <ProtectedRoute allowedRoles={['Candidate']}>
                <PublicLayout>
                  <CandidateApplications />
                </PublicLayout>
              </ProtectedRoute>
            }
          />

          {/* Employer Protected Routes inside EmployerLayout */}
          <Route
            path="/employer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['Employer']}>
                <EmployerLayout>
                  <EmployerDashboard />
                </EmployerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/jobs"
            element={
              <ProtectedRoute allowedRoles={['Employer']}>
                <EmployerLayout>
                  <EmployerManageJobs />
                </EmployerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/jobs/create"
            element={
              <ProtectedRoute allowedRoles={['Employer']}>
                <EmployerLayout>
                  <EmployerCreateJob />
                </EmployerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/jobs/edit/:id"
            element={
              <ProtectedRoute allowedRoles={['Employer']}>
                <EmployerLayout>
                  <EmployerEditJob />
                </EmployerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/applicants"
            element={
              <ProtectedRoute allowedRoles={['Employer']}>
                <EmployerLayout>
                  <EmployerApplicants />
                </EmployerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/profile"
            element={
              <ProtectedRoute allowedRoles={['Employer']}>
                <EmployerLayout>
                  <EmployerProfile />
                </EmployerLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
