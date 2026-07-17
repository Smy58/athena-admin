<script setup>
import { ref, onMounted } from 'vue'
import adminUsersApi from '../api/adminUsers'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const items = ref([])
const loading = ref(true)
const error = ref('')
const formOpen = ref(false)
const editingId = ref(null)
const saving = ref(false)

const emptyForm = () => ({ login: '', password: '', role: 'MASTER' })
const form = ref(emptyForm())

async function load() {
  loading.value = true
  try {
    items.value = await adminUsersApi.list()
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = null
  form.value = emptyForm()
  formOpen.value = true
}

function openEdit(a) {
  editingId.value = a.id
  form.value = { login: a.login, password: '', role: a.role }
  formOpen.value = true
}

async function submit() {
  error.value = ''
  if (!form.value.login || (!editingId.value && !form.value.password)) {
    error.value = 'Заполни логин и пароль'
    return
  }
  saving.value = true
  try {
    if (editingId.value) {
      const payload = { login: form.value.login, role: form.value.role }
      if (form.value.password) payload.password = form.value.password
      await adminUsersApi.update(editingId.value, payload)
    } else {
      await adminUsersApi.create(form.value)
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
  if (!confirm('Удалить этот аккаунт?')) return
  error.value = ''
  try {
    await adminUsersApi.remove(id)
    await load()
  } catch (e) {
    error.value = e.response?.data?.message || 'Не удалось удалить'
  }
}

onMounted(load)
</script>

<template>
  <div class="wrap">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem">
      <h1 class="title-display" style="font-size: 1.4rem">Аккаунты админки</h1>
      <button class="btn btn-primary" @click="formOpen ? (formOpen = false) : openCreate()">
        {{ formOpen ? 'Отменить' : '+ Добавить аккаунт' }}
      </button>
    </div>

    <div v-if="error" class="alert alert-err">{{ error }}</div>

    <div v-if="formOpen" class="auth-card" style="max-width: 480px; margin: 0 auto 1.5rem">
      <div class="field"><label>Логин</label><input v-model="form.login" /></div>
      <div class="field">
        <label>{{ editingId ? 'Новый пароль (необязательно)' : 'Пароль' }}</label>
        <input v-model="form.password" type="password" placeholder="••••••••" />
      </div>
      <div class="field">
        <label>Роль</label>
        <select v-model="form.role">
          <option value="ADMIN">ADMIN — полный доступ</option>
          <option value="MASTER">MASTER — только игры и история</option>
        </select>
      </div>
      <button class="btn btn-primary" style="width: 100%; justify-content: center" :disabled="saving" @click="submit">
        {{ saving ? 'Сохраняем...' : editingId ? 'Сохранить' : 'Создать' }}
      </button>
    </div>

    <div v-if="loading" style="color: var(--t2); text-align: center; padding: 2rem">Загрузка...</div>
    <div v-else class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Логин</th>
            <th>Роль</th>
            <th>Создан</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in items" :key="a.id">
            <td style="color: var(--t)">{{ a.login }}</td>
            <td><span class="badge">{{ a.role }}</span></td>
            <td>{{ new Date(a.createdAt).toLocaleDateString('ru-RU') }}</td>
            <td style="white-space: nowrap">
              <button class="btn btn-outline btn-sm" @click="openEdit(a)">Изменить</button>
              <button
                v-if="a.id !== auth.user?.id"
                class="btn btn-danger btn-sm"
                style="margin-left: 0.4rem"
                @click="remove(a.id)"
              >
                Удалить
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
