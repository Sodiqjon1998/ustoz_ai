import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import LandingPage from './pages/landing/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import ForceChangePasswordPage from './pages/auth/ForceChangePasswordPage'
import ActivationPage from './pages/auth/ActivationPage'
import DashboardPage from './pages/teacher/DashboardPage'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import TeachersPage from './pages/admin/TeachersPage'
import LeadsPage from './pages/admin/LeadsPage'
import CodesPage from './pages/admin/CodesPage'
import PaymentsPage from './pages/admin/PaymentsPage'
import CachePage from './pages/admin/CachePage'
import SettingsPage from './pages/admin/SettingsPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/parol-ornatish" element={<ForceChangePasswordPage />} />
          <Route path="/faollashtirish" element={<ActivationPage />} />
          <Route path="/kabinet" element={<DashboardPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="oqituvchilar" element={<TeachersPage />} />
            <Route path="murojaatlar" element={<LeadsPage />} />
            <Route path="kodlar" element={<CodesPage />} />
            <Route path="tolovlar" element={<PaymentsPage />} />
            <Route path="kesh" element={<CachePage />} />
            <Route path="sozlamalar" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
