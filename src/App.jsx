import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './AuthContext'

import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Profile from './components/Profile'
import UserManagement from './components/UserManagement'
import ProtectedRoute from './components/ProtectedRoute'
import ViewCertificateWrapper from './components/ViewCertificateWrapper'
import CertificateGenerator from './components/CertificateGenerator'
import QrGenerator from './components/QrGenerator'
import PublicViewPage from './pages/PublicViewPage'
import QrPublicView from './pages/QrPublicView'
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
          <Route
            path="/qr-generator"
            element={
              <ProtectedRoute>
                <QrGenerator />
              </ProtectedRoute>
            }
          />
          <Route
            path="/view"
            element={<PublicViewPage />}
          />
          <Route path="/:id" element={<QrPublicView />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
