import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import LoginPage from './pages/auth/LoginPage'
import ForceChangePasswordPage from './pages/auth/ForceChangePasswordPage'
import ActivationPage from './pages/auth/ActivationPage'
import DashboardPage from './pages/teacher/DashboardPage'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import TeachersPage from './pages/admin/TeachersPage'
import LeadsPage from './pages/admin/LeadsPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/parol-ornatish" element={<ForceChangePasswordPage />} />
          <Route path="/faollashtirish" element={<ActivationPage />} />
          <Route path="/" element={<DashboardPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="oqituvchilar" element={<TeachersPage />} />
            <Route path="murojaatlar" element={<LeadsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
