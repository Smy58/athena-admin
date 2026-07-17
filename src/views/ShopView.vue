<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import shopApi from '../api/shop'

const sections = ref([])
const loading = ref(true)
const error = ref('')

const formOpen = ref(false)
const form = ref({ id: '', name: '', icon: '' })
const saving = ref(false)

async function load() {
  loading.value = true
  try {
    sections.value = await shopApi.sections()
  } finally {
    loading.value = false
  }
}

function openCreate() {
  form.value = { id: '', name: '', icon: '' }
  formOpen.value = !formOpen.value
}

async function submit() {
  error.value = ''
  if (!form.value.id || !form.value.name) {
    error.value = 'Заполни идентификатор и название'
    return
  }
  saving.value = true
  try {
    await shopApi.createSection({ ...form.value })
    formOpen.value = false
    await load()
  } catch (e) {
    error.value = e.response?.data?.message || 'Не удалось создать раздел'
  } finally {
    saving.value = false
  }
}

async function removeSection(s) {
  if (!confirm(`Удалить раздел «${s.name}»? Все товары в нём (${s.items.length}) тоже будут удалены.`)) return
  await shopApi.removeSection(s.id)
  await load()
}

onMounted(load)
</script>

<template>
  <div class="wrap">
    <h1 class="title-display" style="font-size: 1.4rem; margin-bottom: 1.5rem">Магазин</h1>
    <div v-if="error" class="alert alert-err">{{ error }}</div>

    <div v-if="loading" style="color: var(--t2); text-align: center; padding: 2rem">Загрузка...</div>

    <template v-else>
      <div class="grid grid-cards" style="margin-bottom: 2rem">
        <RouterLink to="/shop/titles" class="card" style="cursor: pointer">
          <div style="font-size: 1.5rem; margin-bottom: 0.75rem">🏷️</div>
          <div class="title-display" style="font-size: 0.9rem; margin-bottom: 0.3rem">Звания</div>
          <div style="font-size: 0.75rem; color: var(--t2)">Покупаются один раз и экипируются</div>
        </RouterLink>

        <div v-for="s in sections" :key="s.id" class="card" style="position: relative">
          <RouterLink :to="`/shop/sections/${s.id}`" style="display: block; cursor: pointer">
            <div style="font-size: 1.5rem; margin-bottom: 0.75rem">{{ s.icon || '📦' }}</div>
            <div class="title-display" style="font-size: 0.9rem; margin-bottom: 0.3rem">{{ s.name }}</div>
            <div style="font-size: 0.75rem; color: var(--t2)">{{ s.items.length }} товаров</div>
          </RouterLink>
          <button
            class="btn btn-danger btn-sm"
            style="position: absolute; top: 0.6rem; right: 0.6rem"
            @click="removeSection(s)"
          >
            🗑️
          </button>
        </div>
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem">
        <div class="title-display" style="font-size: 0.85rem">Разделы расходников</div>
        <button class="btn btn-primary btn-sm" @click="openCreate">
          {{ formOpen ? 'Отменить' : '+ Добавить раздел' }}
        </button>
      </div>

      <div v-if="formOpen" class="auth-card" style="max-width: 480px; margin: 0 auto">
        <div class="field">
          <label>Идентификатор (id)</label>
          <input v-model="form.id" placeholder="merch" />
        </div>
        <div class="field"><label>Название</label><input v-model="form.name" placeholder="Сувениры" /></div>
        <div class="field"><label>Иконка (эмодзи)</label><input v-model="form.icon" placeholder="🎁" /></div>
        <button class="btn btn-primary" style="width: 100%; justify-content: center" :disabled="saving" @click="submit">
          {{ saving ? 'Сохраняем...' : 'Создать' }}
        </button>
      </div>
    </template>
  </div>
</template>
