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

export async function activate(code) {
  const { data } = await client.post('/auth/activate', { code })
  return data.data
}

export async function firstChangePassword(password, passwordConfirmation) {
  const { data } = await client.post('/auth/password/first-change', {
    password,
    password_confirmation: passwordConfirmation,
  })
  return data.data
}
