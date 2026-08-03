import { createContext, useContext, useEffect, useState } from 'react'
import * as authApi from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('ustoz_token')
    if (!token) {
      setLoading(false)
      return
    }
    authApi
      .me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  async function login(phone, password) {
    const { user } = await authApi.login(phone, password)
    setUser(user)
    return user
  }

  async function logout() {
    await authApi.logout()
    setUser(null)
  }

  async function refreshUser() {
    const fresh = await authApi.me()
    setUser(fresh)
    return fresh
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}

// Login va Dashboard ikkalasida ham ishlatiladi: hisobning navbatdagi
// majburiy bosqichi bormi (parol, faollashtirish) yoki asosiy sahifaga
// o'tsa bo'ladimi — shu yerda bir joyda hal qilinadi.
export function resolveAuthRoute(user) {
  if (!user) return '/login'
  if (user.must_change_password) return '/parol-ornatish'
  if (user.role === 'teacher' && (user.status !== 'active' || !user.subscription)) {
    return '/faollashtirish'
  }
  return user.role === 'teacher' ? '/kabinet' : '/admin'
}
