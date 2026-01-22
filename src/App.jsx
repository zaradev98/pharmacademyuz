import CertificateGenerator from './components/CertificateGenerator'
          <Route
            path="/certificate-generator"
            element={
              <ProtectedRoute>
                <CertificateGenerator />
              </ProtectedRoute>
            }
          />
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './AuthContext'

import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Profile from './components/Profile'
import UserManagement from './components/UserManagement'
import ProtectedRoute from './components/ProtectedRoute'
import ViewCertificateWrapper from './components/ViewCertificateWrapper'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/view-certificate"
            element={
              <ProtectedRoute>
                <ViewCertificateWrapper />
              </ProtectedRoute>
            }
          />
          <Route
            path="/certificate-generator"
            element={
              <ProtectedRoute>
                <CertificateGenerator />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
