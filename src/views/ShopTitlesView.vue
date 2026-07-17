<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import shopApi from '../api/shop'

const titles = ref([])
const loading = ref(true)
const error = ref('')

const formOpen = ref(false)
const editingId = ref(null)
const form = ref({ id: '', name: '', price: 0 })
const saving = ref(false)

async function load() {
  loading.value = true
  try {
    const catalog = await shopApi.catalog()
    titles.value = catalog.titles
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = null
  form.value = { id: '', name: '', price: 0 }
  formOpen.value = true
}

function openEdit(t) {
  editingId.value = t.id
  form.value = { id: t.id, name: t.name, price: t.price }
  formOpen.value = true
}

async function submit() {
  error.value = ''
  if (!form.value.id || !form.value.name) {
    error.value = 'Заполни идентификатор и название'
    return
  }
  saving.value = true
  try {
    const payload = { name: form.value.name, price: Number(form.value.price) || 0 }
    if (editingId.value) {
      await shopApi.updateTitle(editingId.value, payload)
    } else {
      await shopApi.createTitle({ id: form.value.id, ...payload })
    }
    formOpen.value = false
    await load()
  } catch (e) {
    error.value = e.response?.data?.message || 'Не удалось сохранить'
  } finally {
    saving.value = false
  }
}

async function removeTitle(id) {
  if (!confirm('Удалить это звание?')) return
  await shopApi.removeTitle(id)
  await load()
}

onMounted(load)
</script>

<template>
  <div class="wrap">
    <RouterLink to="/shop" style="font-size: 0.8rem; color: var(--t2); display: inline-block; margin-bottom: 1rem">← Магазин</RouterLink>
    <h1 class="title-display" style="font-size: 1.4rem; margin-bottom: 1.5rem">🏷️ Звания</h1>
    <div v-if="error" class="alert alert-err">{{ error }}</div>

    <div v-if="loading" style="color: var(--t2); text-align: center; padding: 2rem">Загрузка...</div>

    <template v-else>
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem">
        <div class="title-display" style="font-size: 0.85rem">Список званий</div>
        <button class="btn btn-primary btn-sm" @click="formOpen ? (formOpen = false) : openCreate()">
          {{ formOpen ? 'Отменить' : '+ Добавить звание' }}
        </button>
      </div>

      <div v-if="formOpen" class="auth-card" style="max-width: 480px; margin: 0 auto 1.5rem">
        <div class="field">
          <label>Идентификатор (id)</label>
          <input v-model="form.id" :disabled="!!editingId" placeholder="legend" />
        </div>
        <div class="field"><label>Название</label><input v-model="form.name" /></div>
        <div class="field"><label>Цена (фиников)</label><input v-model.number="form.price" type="number" /></div>
        <button class="btn btn-primary" style="width: 100%; justify-content: center" :disabled="saving" @click="submit">
          {{ saving ? 'Сохраняем...' : editingId ? 'Сохранить' : 'Создать' }}
        </button>
      </div>

      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Id</th>
              <th>Название</th>
              <th>Цена</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in titles" :key="t.id">
              <td><span class="badge">{{ t.id }}</span></td>
              <td style="color: var(--t)">{{ t.name }}</td>
              <td>🪙 {{ t.price }}</td>
              <td style="white-space: nowrap">
                <button class="btn btn-outline btn-sm" @click="openEdit(t)">Изменить</button>
                <button class="btn btn-danger btn-sm" style="margin-left: 0.4rem" @click="removeTitle(t.id)">Удалить</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>
