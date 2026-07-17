<script setup>
import { ref, onMounted } from 'vue'
import questsApi from '../api/quests'

const items = ref([])
const loading = ref(true)
const error = ref('')

async function load() {
  loading.value = true
  try {
    const [active, completed] = await Promise.all([questsApi.active(), questsApi.completed()])
    items.value = [...active, ...completed]
  } finally {
    loading.value = false
  }
}

async function kick(quest, userId, name) {
  if (!confirm(`Убрать «${name}» из записавшихся на «${quest.title}»?`)) return
  error.value = ''
  try {
    await questsApi.removeSignup(quest.id, userId)
    await load()
  } catch (e) {
    error.value = e.response?.data?.message || 'Не удалось убрать запись'
  }
}

onMounted(load)
</script>

<template>
  <div class="wrap">
    <h1 class="title-display" style="font-size: 1.4rem; margin-bottom: 1.5rem">Задания</h1>
    <div v-if="error" class="alert alert-err">{{ error }}</div>

    <div v-if="loading" style="color: var(--t2); text-align: center; padding: 2rem">Загрузка...</div>
    <div v-else-if="items.length === 0" class="empty-state">Пока нет заданий</div>
    <div v-else class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Название</th>
            <th>Автор</th>
            <th>Награда</th>
            <th>Статус</th>
            <th>Записались</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="q in items" :key="q.id">
            <td style="color: var(--t)">{{ q.title }}</td>
            <td>{{ q.createdBy?.name }}</td>
            <td>{{ q.rewardType === 'ARTIFACT' ? '🏺' : '💰' }} {{ q.rewardValue }}</td>
            <td>
              <span class="badge" :style="q.completed ? '' : 'background: rgba(93,202,165,.18); color: #5dcaa5'">
                {{ q.completed ? 'Завершено' : 'Активно' }}
              </span>
            </td>
            <td style="min-width: 180px">
              <span v-if="!q.signups?.length" style="color: var(--t3)">—</span>
              <div v-else style="display: flex; flex-wrap: wrap; gap: 0.3rem">
                <span
                  v-for="s in q.signups"
                  :key="s.id"
                  class="badge"
                  style="display: inline-flex; align-items: center; gap: 0.35rem"
                >
                  {{ s.user.name }}
                  <button
                    style="background: none; border: none; color: inherit; cursor: pointer; padding: 0; font-size: 0.75rem; line-height: 1"
                    title="Убрать из записавшихся"
                    @click="kick(q, s.user.id, s.user.name)"
                  >
                    ✕
                  </button>
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
