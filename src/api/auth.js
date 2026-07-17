import client from './client'

export default {
  login: (payload) => client.post('/admin-auth/login', payload).then((r) => r.data),
}
