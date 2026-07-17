import client from './client'

export default {
  list: () => client.get('/admin-auth/users').then((r) => r.data),
  create: (data) => client.post('/admin-auth/users', data).then((r) => r.data),
  update: (id, data) => client.patch(`/admin-auth/users/${id}`, data).then((r) => r.data),
  remove: (id) => client.delete(`/admin-auth/users/${id}`).then((r) => r.data),
}
