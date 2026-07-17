<script setup>
import { ref, computed, onMounted } from 'vue'
import scheduleApi from '../api/schedule'
import usersApi from '../api/users'

const items = ref([])
const roster = ref([])
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

const signupsGame = ref(null)
const selectedPlayerId = ref('')
const modalError = ref('')
const modalSaving = ref(false)

const availablePlayers = computed(() => {
  if (!signupsGame.value) return []
  const signedUpIds = new Set(signupsGame.value.signups.map((s) => s.user.id))
  return roster.value.filter((u) => !signedUpIds.has(u.id))
})
const isFull = computed(() => signupsGame.value && signupsGame.value.bookedSeats >= signupsGame.value.totalSeats)

async function load() {
  loading.value = true
  try {
    items.value = await scheduleApi.games()
    if (signupsGame.value) {
      signupsGame.value = items.value.find((g) => g.id === signupsGame.value.id) ?? null
    }
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

async function openSignups(game) {
  modalError.value = ''
  selectedPlayerId.value = ''
  signupsGame.value = game
  if (roster.value.length === 0) {
    roster.value = await usersApi.roster()
  }
}

function closeSignups() {
  signupsGame.value = null
}

async function addPlayer() {
  if (!selectedPlayerId.value) return
  modalError.value = ''
  modalSaving.value = true
  try {
    await scheduleApi.addSignup(signupsGame.value.id, selectedPlayerId.value)
    selectedPlayerId.value = ''
    await load()
  } catch (e) {
    modalError.value = e.response?.data?.message || 'Не удалось добавить игрока'
  } finally {
    modalSaving.value = false
  }
}

async function removePlayer(userId, name) {
  if (!confirm(`Убрать «${name}» из записавшихся?`)) return
  modalError.value = ''
  try {
    await scheduleApi.removeSignup(signupsGame.value.id, userId)
    await load()
  } catch (e) {
    modalError.value = e.response?.data?.message || 'Не удалось убрать запись'
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
            <td style="white-space: nowrap">
              <button class="btn btn-outline btn-sm" title="Записавшиеся игроки" @click="openSignups(g)">👥</button>
              <button class="btn btn-outline btn-sm" style="margin-left: 0.4rem" title="Настройки игры" @click="openEdit(g)">⚙️</button>
              <button class="btn btn-danger btn-sm" style="margin-left: 0.4rem" title="Удалить игру" @click="remove(g.id)">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="signupsGame" style="position: fixed; inset: 0; background: rgba(0,0,0,.55); z-index: 300; display: flex; align-items: center; justify-content: center; padding: 1rem" @click.self="closeSignups">
      <div class="auth-card" style="max-width: 480px; width: 100%; margin: 0; max-height: 85vh; overflow-y: auto">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem">
          <div>
            <div class="title-display" style="font-size: 1.05rem">{{ signupsGame.title }}</div>
            <div style="font-size: 0.78rem; color: var(--t2); margin-top: 0.2rem">{{ signupsGame.bookedSeats }} / {{ signupsGame.totalSeats }} мест занято</div>
          </div>
          <button class="btn btn-ghost btn-sm" @click="closeSignups">✕</button>
        </div>

        <div v-if="modalError" class="alert alert-err">{{ modalError }}</div>

        <div v-if="signupsGame.signups.length === 0" class="empty-state" style="padding: 1.5rem">Пока никто не записался</div>
        <div v-else style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.25rem">
          <div
            v-for="s in signupsGame.signups"
            :key="s.id"
            style="display: flex; align-items: center; justify-content: space-between; background: var(--bg2); border: 1px solid var(--b); border-radius: var(--r); padding: 0.6rem 0.85rem"
          >
            <span style="font-size: 0.85rem">{{ s.user.name }}</span>
            <button class="btn btn-danger btn-sm" @click="removePlayer(s.user.id, s.user.name)">Убрать</button>
          </div>
        </div>

        <div class="title-display" style="font-size: 0.8rem; margin-bottom: 0.6rem">Добавить игрока</div>
        <div v-if="isFull" style="font-size: 0.8rem; color: var(--t2)">Свободных мест не осталось.</div>
        <div v-else style="display: flex; gap: 0.5rem">
          <select v-model="selectedPlayerId" style="flex: 1; background: var(--bg3); border: 1px solid var(--b); border-radius: var(--r); padding: 0.55rem; color: var(--t)">
            <option value="" disabled>Выбери игрока...</option>
            <option v-for="u in availablePlayers" :key="u.id" :value="u.id">{{ u.name }}</option>
          </select>
          <button class="btn btn-primary btn-sm" :disabled="!selectedPlayerId || modalSaving" @click="addPlayer">Добавить</button>
        </div>
      </div>
    </div>
  </div>
</template>
