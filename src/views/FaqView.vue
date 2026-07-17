<script setup>
import { ref, onMounted } from 'vue'
import faqApi from '../api/faq'

const items = ref([])
const loading = ref(true)
const error = ref('')
const formOpen = ref(false)
const editingId = ref(null)
const saving = ref(false)

const form = ref({ question: '', answer: '', order: 0 })

async function load() {
  loading.value = true
  try {
    items.value = await faqApi.list()
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = null
  form.value = { question: '', answer: '', order: items.value.length }
  formOpen.value = true
}

function openEdit(item) {
  editingId.value = item.id
  form.value = { question: item.question, answer: item.answer, order: item.order }
  formOpen.value = true
}

async function submit() {
  error.value = ''
  if (!form.value.question || !form.value.answer) {
    error.value = 'Заполни вопрос и ответ'
    return
  }
  saving.value = true
  try {
    if (editingId.value) {
      await faqApi.update(editingId.value, form.value)
    } else {
      await faqApi.create(form.value)
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
  if (!confirm('Удалить этот вопрос?')) return
  await faqApi.remove(id)
  await load()
}

onMounted(load)
</script>

<template>
  <div class="wrap">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem">
      <h1 class="title-display" style="font-size: 1.4rem">FAQ</h1>
      <button class="btn btn-primary" @click="formOpen ? (formOpen = false) : openCreate()">
        {{ formOpen ? 'Отменить' : '+ Добавить вопрос' }}
      </button>
    </div>

    <div v-if="formOpen" class="auth-card" style="max-width: 560px; margin: 0 auto 1.5rem">
      <div v-if="error" class="alert alert-err">{{ error }}</div>
      <div class="field"><label>Вопрос</label><input v-model="form.question" /></div>
      <div class="field"><label>Ответ</label><textarea v-model="form.answer"></textarea></div>
      <div class="field"><label>Порядок</label><input v-model.number="form.order" type="number" /></div>
      <button class="btn btn-primary" style="width: 100%; justify-content: center" :disabled="saving" @click="submit">
        {{ saving ? 'Сохраняем...' : editingId ? 'Сохранить' : 'Создать' }}
      </button>
    </div>

    <div v-if="loading" style="color: var(--t2); text-align: center; padding: 2rem">Загрузка...</div>
    <div v-else-if="items.length === 0" class="empty-state">Пока нет вопросов</div>
    <div v-else class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Вопрос</th>
            <th>Ответ</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="f in items" :key="f.id">
            <td>{{ f.order }}</td>
            <td style="color: var(--t); max-width: 260px">{{ f.question }}</td>
            <td style="max-width: 360px">{{ f.answer }}</td>
            <td style="white-space: nowrap">
              <button class="btn btn-outline btn-sm" @click="openEdit(f)">Изменить</button>
              <button class="btn btn-danger btn-sm" style="margin-left: 0.4rem" @click="remove(f.id)">Удалить</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
