import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import LessonForm from '../../components/lesson/LessonForm'
import LessonList from '../../components/lesson/LessonList'
import { listLessons } from '../../api/lessons'

export default function DashboardPage() {
  const { user, loading, logout } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [lessons, setLessons] = useState([])

  useEffect(() => {
    if (user) {
      listLessons().then(setLessons)
    }
  }, [user])

  if (loading) {
    return <div className="p-6 text-center text-text-mute">Yuklanmoqda...</div>
  }

  if (!user) {
    window.location.href = '/login'
    return null
  }

  function handleCreated() {
    listLessons().then(setLessons)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-xl font-bold">USTOZ AI</h1>
        <button onClick={logout} className="text-sm text-text-mute">
          Chiqish
        </button>
      </header>

      <p className="mb-6 text-lg">
        Assalomu alaykum, {user.full_name}! 👋
      </p>

      {showForm ? (
        <Card className="mb-6">
          <h2 className="mb-4 font-heading font-semibold">Yangi dars</h2>
          <LessonForm onCreated={handleCreated} onCancel={() => setShowForm(false)} />
        </Card>
      ) : (
        <Button size="lg" className="mb-6 w-full" onClick={() => setShowForm(true)}>
          ✨ Yangi dars yaratish
        </Button>
      )}

      <Card className="mb-6">
        <h2 className="mb-2 font-heading font-semibold">Obuna holati</h2>
        {user.subscription ? (
          <p className="text-text-mute">
            {user.subscription.plan} · {user.subscription.generations_used}/
            {user.subscription.generation_limit ?? '∞'} · {user.subscription.ends_at} gacha
          </p>
        ) : (
          <p className="text-danger">Faol obuna yo'q</p>
        )}
      </Card>

      <h2 className="mb-3 font-heading font-semibold">So'nggi darslar</h2>
      <LessonList lessons={lessons} />
    </div>
  )
}
