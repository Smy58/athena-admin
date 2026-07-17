import client from './client'

export default {
  active: () => client.get('/quests/active').then((r) => r.data),
  completed: () => client.get('/quests/completed').then((r) => r.data),
  removeSignup: (questId, userId) => client.delete(`/quests/${questId}/signups/${userId}`).then((r) => r.data),
}
