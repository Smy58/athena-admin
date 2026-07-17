<script setup>
import { ref, onMounted } from 'vue'
import mastersApi from '../api/masters'

const items = ref([])
const loading = ref(true)
const error = ref('')
const formOpen = ref(false)
const editingId = ref(null)
const saving = ref(false)

const emptyForm = () => ({
  name: '',
  icon: '🧙',
  status: '',
  experienceLevel: '',
  gamesHostedCount: 0,
  systems: '',
  genres: '',
  styleTags: '',
  beginnerFriendly: false,
  shortDescription: '',
  fullDescription: '',
  pastGamesText: '',
})
const form = ref(emptyForm())

function toArray(csv) {
  return csv.split(',').map((s) => s.trim()).filter(Boolean)
}

function parsePastGames(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, date] = line.split('—').map((s) => s.trim())
      return { title: title || line, date: date || '' }
    })
}

function formatPastGames(pastGames) {
  return (pastGames || []).map((g) => `${g.title} — ${g.date}`).join('\n')
}

async function load() {
  loading.value = true
  try {
    items.value = await mastersApi.list()
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = null
  form.value = emptyForm()
  formOpen.value = true
}

function openEdit(m) {
  editingId.value = m.id
  form.value = {
    name: m.name,
    icon: m.icon,
    status: m.status,
    experienceLevel: m.experienceLevel,
    gamesHostedCount: m.gamesHostedCount,
    systems: m.systems.join(', '),
    genres: m.genres.join(', '),
    styleTags: m.styleTags.join(', '),
    beginnerFriendly: m.beginnerFriendly,
    shortDescription: m.shortDescription,
    fullDescription: m.fullDescription,
    pastGamesText: formatPastGames(m.pastGames),
  }
  formOpen.value = true
}

async function submit() {
  error.value = ''
  if (!form.value.name || !form.value.shortDescription) {
    error.value = 'Заполни имя и краткое описание'
    return
  }
  saving.value = true
  try {
    const payload = {
      name: form.value.name,
      icon: form.value.icon,
      status: form.value.status,
      experienceLevel: form.value.experienceLevel,
      gamesHostedCount: Number(form.value.gamesHostedCount) || 0,
      systems: toArray(form.value.systems),
      genres: toArray(form.value.genres),
      styleTags: toArray(form.value.styleTags),
      beginnerFriendly: form.value.beginnerFriendly,
      shortDescription: form.value.shortDescription,
      fullDescription: form.value.fullDescription,
      pastGames: parsePastGames(form.value.pastGamesText),
    }
    if (editingId.value) {
      await mastersApi.update(editingId.value, payload)
    } else {
      await mastersApi.create(payload)
    }
    formOpen.value = false
    await load()
  } catch (e) {
    error.value = e.response?.data?.message || 'Не удалось сохранить'
  } finally {
    saving.value = false
  }
}

async function remove(id) {
  if (!confirm('Удалить этого мастера?')) return
  await mastersApi.remove(id)
  await load()
}

onMounted(load)
</script>

<template>
  <div class="wrap">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem">
      <h1 class="title-display" style="font-size: 1.4rem">Мастера</h1>
      <button class="btn btn-primary" @click="formOpen ? (formOpen = false) : openCreate()">
        {{ formOpen ? 'Отменить' : '+ Добавить мастера' }}
      </button>
    </div>

    <div v-if="formOpen" class="auth-card" style="max-width: 620px; margin: 0 auto 1.5rem">
      <div v-if="error" class="alert alert-err">{{ error }}</div>
      <div class="grid" style="grid-template-columns: 1fr 1fr">
        <div class="field"><label>Имя</label><input v-model="form.name" /></div>
        <div class="field"><label>Иконка (эмодзи)</label><input v-model="form.icon" /></div>
      </div>
      <div class="field"><label>Статус</label><input v-model="form.status" placeholder="Мастер D&D 5e · ..." /></div>
      <div class="grid" style="grid-template-columns: 1fr 1fr">
        <div class="field"><label>Опыт</label><input v-model="form.experienceLevel" placeholder="3+ года" /></div>
        <div class="field"><label>Игр проведено</label><input v-model.number="form.gamesHostedCount" type="number" /></div>
      </div>
      <div class="field"><label>Системы (через запятую)</label><input v-model="form.systems" placeholder="D&D 5e, Call of Cthulhu" /></div>
      <div class="field"><label>Жанры (через запятую)</label><input v-model="form.genres" placeholder="Фэнтези, Хоррор" /></div>
      <div class="field"><label>Стиль (через запятую)</label><input v-model="form.styleTags" placeholder="Атмосферно, Много боёвки" /></div>
      <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.82rem; color: var(--t2); margin-bottom: 1.1rem">
        <input type="checkbox" v-model="form.beginnerFriendly" /> Подходит новичкам
      </label>
      <div class="field"><label>Краткое описание</label><textarea v-model="form.shortDescription"></textarea></div>
      <div class="field"><label>Полное описание</label><textarea v-model="form.fullDescription" style="min-height: 110px"></textarea></div>
      <div class="field">
        <label>Прошедшие игры (по одной на строку: "Название — Дата")</label>
        <textarea v-model="form.pastGamesText" placeholder="Гробница ужаса — июнь 2026"></textarea>
      </div>
      <button class="btn btn-primary" style="width: 100%; justify-content: center" :disabled="saving" @click="submit">
        {{ saving ? 'Сохраняем...' : editingId ? 'Сохранить' : 'Создать' }}
      </button>
    </div>

    <div v-if="loading" style="color: var(--t2); text-align: center; padding: 2rem">Загрузка...</div>
    <div v-else-if="items.length === 0" class="empty-state">Пока нет мастеров</div>
    <div v-else class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th></th>
            <th>Имя</th>
            <th>Статус</th>
            <th>Систем</th>
            <th>Игр</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in items" :key="m.id">
            <td style="font-size: 1.1rem">{{ m.icon }}</td>
            <td style="color: var(--t)">{{ m.name }}</td>
            <td>{{ m.status }}</td>
            <td>{{ m.systems.join(', ') }}</td>
            <td>{{ m.gamesHostedCount }}</td>
            <td style="white-space: nowrap">
              <button class="btn btn-outline btn-sm" @click="openEdit(m)">Изменить</button>
              <button class="btn btn-danger btn-sm" style="margin-left: 0.4rem" @click="remove(m.id)">Удалить</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
