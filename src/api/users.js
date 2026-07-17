import client from './client'

export default {
  list: () => client.get('/users').then((r) => r.data),
  get: (id) => client.get(`/users/${id}`).then((r) => r.data),
  update: (id, data) => client.patch(`/users/${id}`, data).then((r) => r.data),
  remove: (id) => client.delete(`/users/${id}`).then((r) => r.data),
}
