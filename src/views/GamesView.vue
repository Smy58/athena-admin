<script setup>
import { ref, onMounted } from 'vue'
import scheduleApi from '../api/schedule'

const items = ref([])
const loading = ref(true)
const error = ref('')
const formOpen = ref(false)
const editingId = ref(null)
const saving = ref(false)

const emptyForm = () => ({
  title: '',
  master: '',
  masterIcon: '🧙',
  date: '',
  startTime: '',
  endTime: '',
  gameSystem: 'D&D 5e',
  format: 'Ваншот',
  levelMin: null,
  levelMax: null,
  forBeginners: false,
  totalSeats: 6,
  bookedSeats: 0,
  price: 0,
  currency: '₸',
  shortDescription: '',
  ageLimit: '',
})
const form = ref(emptyForm())

async function load() {
  loading.value = true
  try {
    items.value = await scheduleApi.games()
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = null
  form.value = emptyForm()
  formOpen.value = true
}

function openEdit(g) {
  editingId.value = g.id
  form.value = { ...g }
  formOpen.value = true
}

async function submit() {
  error.value = ''
  if (!form.value.title || !form.value.master || !form.value.date) {
    error.value = 'Заполни название, мастера и дату'
    return
  }
  saving.value = true
  try {
    const payload = {
      ...form.value,
      levelMin: form.value.levelMin === '' ? null : Number(form.value.levelMin) || null,
      levelMax: form.value.levelMax === '' ? null : Number(form.value.levelMax) || null,
      totalSeats: Number(form.value.totalSeats) || 0,
      bookedSeats: Number(form.value.bookedSeats) || 0,
      price: Number(form.value.price) || 0,
    }
    if (editingId.value) {
      await scheduleApi.updateGame(editingId.value, payload)
    } else {
      await scheduleApi.createGame(payload)
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
  if (!confirm('Удалить эту игру?')) return
  await scheduleApi.removeGame(id)
  await load()
}

async function kick(gameId, userId, name) {
  if (!confirm(`Убрать «${name}» из записавшихся?`)) return
  error.value = ''
  try {
    await scheduleApi.removeSignup(gameId, userId)
    await load()
  } catch (e) {
    error.value = e.response?.data?.message || 'Не удалось убрать запись'
  }
}

onMounted(load)
</script>

<template>
  <div class="wrap">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem">
      <h1 class="title-display" style="font-size: 1.4rem">Игры в расписании</h1>
      <button class="btn btn-primary" @click="formOpen ? (formOpen = false) : openCreate()">
        {{ formOpen ? 'Отменить' : '+ Добавить игру' }}
      </button>
    </div>

    <div v-if="error && !formOpen" class="alert alert-err">{{ error }}</div>

    <div v-if="formOpen" class="auth-card" style="max-width: 620px; margin: 0 auto 1.5rem">
      <div v-if="error" class="alert alert-err">{{ error }}</div>
      <div class="field"><label>Название</label><input v-model="form.title" /></div>
      <div class="grid" style="grid-template-columns: 1fr 1fr">
        <div class="field"><label>Мастер</label><input v-model="form.master" /></div>
        <div class="field"><label>Иконка мастера</label><input v-model="form.masterIcon" /></div>
      </div>
      <div class="grid" style="grid-template-columns: 1fr 1fr 1fr">
        <div class="field"><label>Дата</label><input v-model="form.date" placeholder="12 июля" /></div>
        <div class="field"><label>Начало</label><input v-model="form.startTime" placeholder="18:00" /></div>
        <div class="field"><label>Конец</label><input v-model="form.endTime" placeholder="22:00" /></div>
      </div>
      <div class="grid" style="grid-template-columns: 1fr 1fr">
        <div class="field"><label>Система</label><input v-model="form.gameSystem" /></div>
        <div class="field"><label>Формат</label><input v-model="form.format" /></div>
      </div>
      <div class="grid" style="grid-template-columns: 1fr 1fr">
        <div class="field"><label>Мин. уровень</label><input v-model="form.levelMin" type="number" /></div>
        <div class="field"><label>Макс. уровень</label><input v-model="form.levelMax" type="number" /></div>
      </div>
      <div class="grid" style="grid-template-columns: 1fr 1fr">
        <div class="field"><label>Всего мест</label><input v-model.number="form.totalSeats" type="number" /></div>
        <div class="field"><label>Занято мест</label><input v-model.number="form.bookedSeats" type="number" /></div>
      </div>
      <div class="grid" style="grid-template-columns: 1fr 1fr">
        <div class="field"><label>Цена</label><input v-model.number="form.price" type="number" /></div>
        <div class="field"><label>Валюта</label><input v-model="form.currency" /></div>
      </div>
      <div class="field"><label>Возрастное ограничение</label><input v-model="form.ageLimit" placeholder="16+" /></div>
      <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.82rem; color: var(--t2); margin-bottom: 1.1rem">
        <input type="checkbox" v-model="form.forBeginners" /> Подходит новичкам
      </label>
      <div class="field"><label>Краткое описание</label><textarea v-model="form.shortDescription"></textarea></div>
      <button class="btn btn-primary" style="width: 100%; justify-content: center" :disabled="saving" @click="submit">
        {{ saving ? 'Сохраняем...' : editingId ? 'Сохранить' : 'Создать' }}
      </button>
    </div>

    <div v-if="loading" style="color: var(--t2); text-align: center; padding: 2rem">Загрузка...</div>
    <div v-else-if="items.length === 0" class="empty-state">Пока нет игр в расписании</div>
    <div v-else class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Название</th>
            <th>Мастер</th>
            <th>Дата</th>
            <th>Места</th>
            <th>Цена</th>
            <th>Записались</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="g in items" :key="g.id">
            <td style="color: var(--t)">{{ g.title }}</td>
            <td>{{ g.masterIcon }} {{ g.master }}</td>
            <td>{{ g.date }} · {{ g.startTime }}–{{ g.endTime }}</td>
            <td>{{ g.bookedSeats }} / {{ g.totalSeats }}</td>
            <td>{{ g.price ? g.price + ' ' + g.currency : 'Бесплатно' }}</td>
            <td style="min-width: 180px">
              <span v-if="!g.signups?.length" style="color: var(--t3)">—</span>
              <div v-else style="display: flex; flex-wrap: wrap; gap: 0.3rem">
                <span
                  v-for="s in g.signups"
                  :key="s.id"
                  class="badge"
                  style="display: inline-flex; align-items: center; gap: 0.35rem"
                >
                  {{ s.user.name }}
                  <button
                    style="background: none; border: none; color: inherit; cursor: pointer; padding: 0; font-size: 0.75rem; line-height: 1"
                    title="Убрать из записавшихся"
                    @click="kick(g.id, s.user.id, s.user.name)"
                  >
                    ✕
                  </button>
                </span>
              </div>
            </td>
            <td style="white-space: nowrap">
              <button class="btn btn-outline btn-sm" @click="openEdit(g)">Изменить</button>
              <button class="btn btn-danger btn-sm" style="margin-left: 0.4rem" @click="remove(g.id)">Удалить</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
