import client from './client'

export default {
  catalog: () => client.get('/shop/catalog').then((r) => r.data),
  sections: () => client.get('/shop/sections').then((r) => r.data),
  createTitle: (data) => client.post('/shop/titles', data).then((r) => r.data),
  updateTitle: (id, data) => client.patch(`/shop/titles/${id}`, data).then((r) => r.data),
  removeTitle: (id) => client.delete(`/shop/titles/${id}`).then((r) => r.data),
  createSection: (data) => client.post('/shop/sections', data).then((r) => r.data),
  updateSection: (id, data) => client.patch(`/shop/sections/${id}`, data).then((r) => r.data),
  removeSection: (id) => client.delete(`/shop/sections/${id}`).then((r) => r.data),
  createItem: (data) => client.post('/shop/items', data).then((r) => r.data),
  updateItem: (id, data) => client.patch(`/shop/items/${id}`, data).then((r) => r.data),
  removeItem: (id) => client.delete(`/shop/items/${id}`).then((r) => r.data),
}
