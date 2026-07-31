import { useAuth } from '../../hooks/useAuth'

export default function AdminDashboardPage() {
  const { user, loading, logout } = useAuth()

  if (loading) {
    return <div className="p-6 text-center text-text-mute">Yuklanmoqda...</div>
  }

  if (!user || !['admin', 'super_admin'].includes(user.role)) {
    window.location.href = '/login'
    return null
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-xl font-bold">Admin</h1>
        <button onClick={logout} className="text-sm text-text-mute">
          Chiqish
        </button>
      </header>
      <p className="text-text-mute">Salom, {user.full_name} ({user.role})</p>
    </div>
  )
}
