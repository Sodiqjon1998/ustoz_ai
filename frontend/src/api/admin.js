import client from './client'

export async function getStats() {
  const { data } = await client.get('/admin/stats')
  return data.data
}

export async function listPlans() {
  const { data } = await client.get('/admin/plans')
  return data.data
}

export async function listTeachers(params = {}) {
  const { data } = await client.get('/admin/teachers', { params })
  return data
}

export async function getTeacher(id) {
  const { data } = await client.get(`/admin/teachers/${id}`)
  return data.data
}

export async function createTeacher(payload) {
  const { data } = await client.post('/admin/teachers', payload)
  return data.data
}

export async function extendTeacher(id, days, planId) {
  const { data } = await client.post(`/admin/teachers/${id}/extend`, { days, plan_id: planId })
  return data.data
}

export async function suspendTeacher(id) {
  const { data } = await client.post(`/admin/teachers/${id}/suspend`)
  return data.data
}

export async function activateTeacher(id) {
  const { data } = await client.post(`/admin/teachers/${id}/activate`)
  return data.data
}

export async function resetTeacherPassword(id) {
  const { data } = await client.post(`/admin/teachers/${id}/reset-password`)
  return data.data
}

export async function deleteTeacher(id) {
  const { data } = await client.delete(`/admin/teachers/${id}`)
  return data.data
}

export async function setTeacherGeminiKey(id, geminiApiKey, slot = 1) {
  const { data } = await client.post(`/admin/teachers/${id}/gemini-key`, { gemini_api_key: geminiApiKey, slot })
  return data.data
}

export async function listLeads(params = {}) {
  const { data } = await client.get('/admin/leads', { params })
  return data
}

export async function getLead(id) {
  const { data } = await client.get(`/admin/leads/${id}`)
  return data.data
}

export async function createLead(payload) {
  const { data } = await client.post('/admin/leads', payload)
  return data.data
}

export async function updateLead(id, payload) {
  const { data } = await client.patch(`/admin/leads/${id}`, payload)
  return data.data
}

export async function convertLead(id, payload) {
  const { data } = await client.post(`/admin/leads/${id}/convert`, payload)
  return data.data
}

export async function listCodes(params = {}) {
  const { data } = await client.get('/admin/codes', { params })
  return data
}

export async function createCodes(payload) {
  const { data } = await client.post('/admin/codes', payload)
  return data.data
}

export async function revokeCode(id) {
  const { data } = await client.post(`/admin/codes/${id}/revoke`)
  return data.data
}

export async function exportCodes(batchId) {
  const response = await client.get('/admin/codes/export', {
    params: batchId ? { batch_id: batchId } : {},
    responseType: 'blob',
  })
  const url = URL.createObjectURL(response.data)
  const link = document.createElement('a')
  link.href = url
  link.download = 'faollashtirish-kodlari.csv'
  link.click()
  URL.revokeObjectURL(url)
}

export async function listPayments(params = {}) {
  const { data } = await client.get('/admin/payments', { params })
  return data
}

export async function createPayment(payload) {
  const { data } = await client.post('/admin/payments', payload)
  return data.data
}

export async function listCache(params = {}) {
  const { data } = await client.get('/admin/cache', { params })
  return data
}

export async function getCacheItem(id) {
  const { data } = await client.get(`/admin/cache/${id}`)
  return data.data
}

export async function deleteCacheItem(id) {
  const { data } = await client.delete(`/admin/cache/${id}`)
  return data.data
}

export async function getSettings() {
  const { data } = await client.get('/admin/settings')
  return data.data
}

export async function updateSettings(payload) {
  const { data } = await client.post('/admin/settings', payload)
  return data.data
}
