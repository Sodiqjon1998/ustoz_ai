import client from './client'

/**
 * Ochiq (anonim) API — landing sahifa uchun. Auth token yubormaydi (kerak
 * bo'lmaydi) va javob strukturasi ham ichki endpointlardan sodda.
 */

export async function listPublicPlans() {
  const { data } = await client.get('/public/plans')
  return data.data
}

export async function listPublicSubjects() {
  const { data } = await client.get('/public/subjects')
  return data.data
}

export async function submitLead(payload) {
  const { data } = await client.post('/public/leads', payload)
  return data.data
}
