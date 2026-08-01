import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, UserPlus, Users, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const TABS = [
  { to: '/admin', label: 'Bosh', icon: LayoutDashboard, end: true },
  { to: '/admin/murojaatlar', label: 'Murojaatlar', icon: UserPlus },
  { to: '/admin/oqituvchilar', label: "O'qituvchilar", icon: Users },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="mx-auto min-h-svh max-w-3xl pb-20 sm:pb-8">
      <header className="flex items-center justify-between px-4 py-4">
        <h1 className="font-heading text-lg font-bold text-text">Admin</h1>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-text-mute sm:inline">{user?.full_name}</span>
          <button
            onClick={logout}
            className="flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-text-mute hover:bg-bg-subtle"
          >
            <LogOut className="h-4 w-4" />
            Chiqish
          </button>
        </div>
      </header>

      <nav className="mb-4 hidden gap-1 border-b border-border px-4 sm:flex">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium ${
                isActive
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-text-mute hover:text-text'
              }`
            }
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <main className="px-4">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-white sm:hidden">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium ${
                isActive ? 'text-brand-600' : 'text-text-mute'
              }`
            }
          >
            <tab.icon className="h-5 w-5" />
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
