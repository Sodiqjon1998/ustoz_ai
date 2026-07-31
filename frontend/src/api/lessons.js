import client from './client'

export async function listSubjects() {
  const { data } = await client.get('/subjects')
  return data.data
}

export async function listLessons() {
  const { data } = await client.get('/lessons')
  return data.data
}

export async function createLesson(payload) {
  const { data } = await client.post('/lessons', payload)
  return data
}

export async function downloadLesson(lessonId, type, filename) {
  const response = await client.get(`/lessons/${lessonId}/download/${type}`, {
    responseType: 'blob',
  })
  const url = URL.createObjectURL(response.data)
  const link = document.createElement('a')
  link.href = url
  link.download = filename || `dars.${type}`
  link.click()
  URL.revokeObjectURL(url)
}
