import client from './client'

export async function login(phone, password) {
  const { data } = await client.post('/auth/login', { phone, password })
  localStorage.setItem('ustoz_token', data.data.token)
  return data.data
}

export async function logout() {
  await client.post('/auth/logout')
  localStorage.removeItem('ustoz_token')
}

export async function me() {
  const { data } = await client.get('/auth/me')
  return data.data
}
