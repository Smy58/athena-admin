<script setup>
import { ref, onMounted } from 'vue'
import scheduleApi from '../api/schedule'
import { toDateInputValue, formatDate, formatWeekday } from '../utils/date'

const items = ref([])
const loading = ref(true)
const error = ref('')
const formOpen = ref(false)
const editingId = ref(null)
const saving = ref(false)

const emptyForm = () => ({ date: '', name: '', meta: '', typeLabel: '' })
const form = ref(emptyForm())

async function load() {
  loading.value = true
  try {
    items.value = await scheduleApi.history()
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = null
  form.value = emptyForm()
  formOpen.value = true
}

function openEdit(h) {
  editingId.value = h.id
  form.value = { date: toDateInputValue(h.date), name: h.name, meta: h.meta, typeLabel: h.typeLabel }
  formOpen.value = true
}

async function submit() {
  error.value = ''
  if (!form.value.name || !form.value.date) {
    error.value = 'Заполни название и дату'
    return
  }
  saving.value = true
  try {
    if (editingId.value) {
      await scheduleApi.updateHistory(editingId.value, form.value)
    } else {
      await scheduleApi.createHistory(form.value)
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
  if (!confirm('Удалить эту запись истории?')) return
  await scheduleApi.removeHistory(id)
  await load()
}

onMounted(load)
</script>

<template>
  <div class="wrap">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem">
      <h1 class="title-display" style="font-size: 1.4rem">История игр</h1>
      <button class="btn btn-primary" @click="formOpen ? (formOpen = false) : openCreate()">
        {{ formOpen ? 'Отменить' : '+ Добавить запись' }}
      </button>
    </div>

    <div v-if="formOpen" class="auth-card" style="max-width: 520px; margin: 0 auto 1.5rem">
      <div v-if="error" class="alert alert-err">{{ error }}</div>
      <div class="field"><label>Название</label><input v-model="form.name" /></div>
      <div class="field"><label>Дата</label><input v-model="form.date" type="date" /></div>
      <div class="field"><label>Тип</label><input v-model="form.typeLabel" placeholder="Кампейн / Ваншот / Ивент" /></div>
      <div class="field"><label>Детали</label><input v-model="form.meta" placeholder="Мастер: Арман · 18:00 · завершён" /></div>
      <button class="btn btn-primary" style="width: 100%; justify-content: center" :disabled="saving" @click="submit">
        {{ saving ? 'Сохраняем...' : editingId ? 'Сохранить' : 'Создать' }}
      </button>
    </div>

    <div v-if="loading" style="color: var(--t2); text-align: center; padding: 2rem">Загрузка...</div>
    <div v-else-if="items.length === 0" class="empty-state">Пока нет записей истории</div>
    <div v-else class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Название</th>
            <th>Тип</th>
            <th>Детали</th>
            <th>Дата</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="h in items" :key="h.id">
            <td style="color: var(--t)">{{ h.name }}</td>
            <td>{{ h.typeLabel }}</td>
            <td>{{ h.meta }}</td>
            <td>{{ formatWeekday(h.date) }} {{ formatDate(h.date, { withYear: true }) }}</td>
            <td style="white-space: nowrap">
              <button class="btn btn-outline btn-sm" @click="openEdit(h)">Изменить</button>
              <button class="btn btn-danger btn-sm" style="margin-left: 0.4rem" @click="remove(h.id)">Удалить</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
