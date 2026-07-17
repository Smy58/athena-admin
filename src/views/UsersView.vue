<script setup>
import { ref, onMounted } from 'vue'
import usersApi from '../api/users'

const items = ref([])
const loading = ref(true)
const error = ref('')
const editingId = ref(null)
const saving = ref(false)

const guildOptions = [
  { value: '', label: '— без гильдии —' },
  { value: 'TOWER', label: 'Башня Семи Печатей' },
  { value: 'LEAGUE', label: 'Лига Чёрной Монеты' },
  { value: 'BLADE', label: 'Серебряный Клинок' },
  { value: 'CANDLE', label: 'Орден Пепельной Свечи' },
]

const form = ref({
  name: '',
  email: '',
  experience: 'new',
  guild: '',
  completedContracts: 0,
  fameStones: 0,
  finiki: 0,
  activeTitle: '',
  titles: '',
})

async function load() {
  loading.value = true
  try {
    items.value = await usersApi.list()
  } finally {
    loading.value = false
  }
}

function openEdit(u) {
  editingId.value = u.id
  form.value = {
    name: u.name,
    email: u.email,
    experience: u.experience || 'new',
    guild: u.guild || '',
    completedContracts: u.completedContracts,
    fameStones: u.fameStones,
    finiki: u.finiki,
    activeTitle: u.activeTitle || '',
    titles: (u.titles || []).join(', '),
  }
}

async function submit() {
  error.value = ''
  saving.value = true
  try {
    const payload = {
      name: form.value.name,
      email: form.value.email,
      experience: form.value.experience,
      guild: form.value.guild || null,
      completedContracts: Number(form.value.completedContracts) || 0,
      fameStones: Number(form.value.fameStones) || 0,
      finiki: Number(form.value.finiki) || 0,
      activeTitle: form.value.activeTitle || null,
      titles: form.value.titles.split(',').map((s) => s.trim()).filter(Boolean),
    }
    await usersApi.update(editingId.value, payload)
    editingId.value = null
    await load()
  } catch (e) {
    error.value = e.response?.data?.message || 'Не удалось сохранить'
  } finally {
    saving.value = false
  }
}

async function remove(id) {
  if (!confirm('Удалить этого пользователя? Действие необратимо.')) return
  try {
    await usersApi.remove(id)
    await load()
  } catch (e) {
    error.value = e.response?.data?.message || 'Не удалось удалить (возможно, есть связанные задания/темы)'
  }
}

onMounted(load)
</script>

<template>
  <div class="wrap">
    <h1 class="title-display" style="font-size: 1.4rem; margin-bottom: 1.5rem">Игроки клуба</h1>
    <div v-if="error" class="alert alert-err">{{ error }}</div>

    <div v-if="editingId" class="auth-card" style="max-width: 620px; margin: 0 auto 1.5rem">
      <h2 class="title-display" style="font-size: 1rem; margin-bottom: 1rem">Редактирование игрока</h2>
      <div class="grid" style="grid-template-columns: 1fr 1fr">
        <div class="field"><label>Имя</label><input v-model="form.name" /></div>
        <div class="field"><label>Email</label><input v-model="form.email" /></div>
      </div>
      <div class="grid" style="grid-template-columns: 1fr 1fr">
        <div class="field">
          <label>Опыт</label>
          <select v-model="form.experience">
            <option value="new">Новичок</option>
            <option value="mid">Средний</option>
            <option value="exp">Опытный</option>
            <option value="dm">Мастер</option>
          </select>
        </div>
        <div class="field">
          <label>Гильдия</label>
          <select v-model="form.guild">
            <option v-for="g in guildOptions" :key="g.value" :value="g.value">{{ g.label }}</option>
          </select>
        </div>
      </div>
      <div class="grid" style="grid-template-columns: 1fr 1fr 1fr">
        <div class="field"><label>Контрактов</label><input v-model.number="form.completedContracts" type="number" /></div>
        <div class="field"><label>Камешков</label><input v-model.number="form.fameStones" type="number" /></div>
        <div class="field"><label>Фиников</label><input v-model.number="form.finiki" type="number" /></div>
      </div>
      <div class="field"><label>Активное звание (id)</label><input v-model="form.activeTitle" /></div>
      <div class="field"><label>Звания (id через запятую)</label><input v-model="form.titles" /></div>
      <div style="display: flex; gap: 0.6rem">
        <button class="btn btn-primary btn-sm" style="flex: 1; justify-content: center" :disabled="saving" @click="submit">Сохранить</button>
        <button class="btn btn-outline btn-sm" style="flex: 1; justify-content: center" @click="editingId = null">Отменить</button>
      </div>
    </div>

    <div v-if="loading" style="color: var(--t2); text-align: center; padding: 2rem">Загрузка...</div>
    <div v-else-if="items.length === 0" class="empty-state">Пока нет игроков</div>
    <div v-else class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Имя</th>
            <th>Email</th>
            <th>Гильдия</th>
            <th>Камешков</th>
            <th>Фиников</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in items" :key="u.id">
            <td style="color: var(--t)">{{ u.name }}</td>
            <td>{{ u.email }}</td>
            <td><span v-if="u.guild" class="badge">{{ u.guild }}</span></td>
            <td>{{ u.fameStones }}</td>
            <td>{{ u.finiki }}</td>
            <td style="white-space: nowrap">
              <button class="btn btn-outline btn-sm" @click="openEdit(u)">Изменить</button>
              <button class="btn btn-danger btn-sm" style="margin-left: 0.4rem" @click="remove(u.id)">Удалить</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
