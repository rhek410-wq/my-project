import api from '../utils/api'

export async function getMembers() {
  const res = await api.get('/members')
  return res.data
}

export async function getMember(id) {
  const res = await api.get(`/members/${id}`)
  return res.data
}

export async function createMember(member) {
  const res = await api.post('/members', member)
  return res.data
}

export async function updateMember(id, member) {
  const res = await api.put(`/members/${id}`, member)
  return res.data
}

export async function deleteMember(id) {
  await api.delete(`/members/${id}`)
}
