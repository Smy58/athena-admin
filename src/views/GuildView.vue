<script setup>
import { ref, onMounted } from 'vue'
import guildApi from '../api/guild'

const infoList = ref([])
const ranks = ref([])
const loading = ref(true)
const error = ref('')

const editingGuild = ref(null)
const infoForm = ref({ name: '', icon: '', color: '', role: '', bonus: '', rank3: '' })
const savingInfo = ref(false)

const rankFormOpen = ref(false)
const editingRankValue = ref(null)
const rankForm = ref({ value: '', label: '', fameStones: 0, finiki: 0, order: 0 })
const savingRank = ref(false)

async function load() {
  loading.value = true
  try {
    const [i, r] = await Promise.all([guildApi.info(), guildApi.ranks()])
    infoList.value = i
    ranks.value = r
  } finally {
    loading.value = false
  }
}

function openEditInfo(g) {
  editingGuild.value = g.guild
  infoForm.value = { name: g.name, icon: g.icon, color: g.color, role: g.role, bonus: g.bonus, rank3: g.rank3 }
}

async function submitInfo() {
  error.value = ''
  savingInfo.value = true
  try {
    await guildApi.updateInfo(editingGuild.value, infoForm.value)
    editingGuild.value = null
    await load()
  } catch (e) {
    error.value = e.response?.data?.message || 'Не удалось сохранить'
  } finally {
    savingInfo.value = false
  }
}

function openCreateRank() {
  editingRankValue.value = null
  rankForm.value = { value: '', label: '', fameStones: 0, finiki: 0, order: ranks.value.length }
  rankFormOpen.value = true
}

function openEditRank(r) {
  editingRankValue.value = r.value
  rankForm.value = { value: r.value, label: r.label, fameStones: r.fameStones, finiki: r.finiki, order: r.order }
  rankFormOpen.value = true
}

async function submitRank() {
  error.value = ''
  if (!rankForm.value.value || !rankForm.value.label) {
    error.value = 'Заполни идентификатор и название ранга'
    return
  }
  savingRank.value = true
  try {
    const payload = {
      label: rankForm.value.label,
      fameStones: Number(rankForm.value.fameStones) || 0,
      finiki: Number(rankForm.value.finiki) || 0,
      order: Number(rankForm.value.order) || 0,
    }
    if (editingRankValue.value) {
      await guildApi.updateRank(editingRankValue.value, payload)
    } else {
      await guildApi.createRank({ ...payload, value: rankForm.value.value })
    }
    rankFormOpen.value = false
    await load()
  } catch (e) {
    error.value = e.response?.data?.message || 'Не удалось сохранить'
  } finally {
    savingRank.value = false
  }
}

async function removeRank(value) {
  if (!confirm('Удалить этот ранг контракта?')) return
  await guildApi.removeRank(value)
  await load()
}

onMounted(load)
</script>

<template>
  <div class="wrap">
    <h1 class="title-display" style="font-size: 1.4rem; margin-bottom: 1.25rem">Гильдии</h1>
    <div v-if="error" class="alert alert-err">{{ error }}</div>

    <div v-if="loading" style="color: var(--t2); text-align: center; padding: 2rem">Загрузка...</div>

    <template v-else>
      <div class="title-display" style="font-size: 0.85rem; margin-bottom: 0.75rem">Описания гильдий</div>
      <div class="grid grid-cards" style="margin-bottom: 2rem">
        <div v-for="g in infoList" :key="g.guild" class="card">
          <div style="font-size: 1.6rem; margin-bottom: 0.5rem">{{ g.icon }}</div>
          <div class="title-display" style="font-size: 0.92rem; margin-bottom: 0.4rem" :style="{ color: g.color }">{{ g.name }}</div>
          <div style="font-size: 0.75rem; color: var(--t2); margin-bottom: 0.8rem">{{ g.role }}</div>
          <button class="btn btn-outline btn-sm" @click="openEditInfo(g)">Редактировать</button>
        </div>
      </div>

      <div v-if="editingGuild" class="auth-card" style="max-width: 560px; margin: 0 auto 2rem">
        <h2 class="title-display" style="font-size: 1rem; margin-bottom: 1rem">Редактирование гильдии</h2>
        <div class="grid" style="grid-template-columns: 1fr 1fr">
          <div class="field"><label>Название</label><input v-model="infoForm.name" /></div>
          <div class="field"><label>Иконка</label><input v-model="infoForm.icon" /></div>
        </div>
        <div class="field"><label>Цвет (hex)</label><input v-model="infoForm.color" /></div>
        <div class="field"><label>Роль</label><textarea v-model="infoForm.role"></textarea></div>
        <div class="field"><label>Бонус</label><textarea v-model="infoForm.bonus"></textarea></div>
        <div class="field"><label>Бонус ранга 3</label><textarea v-model="infoForm.rank3"></textarea></div>
        <div style="display: flex; gap: 0.6rem">
          <button class="btn btn-primary btn-sm" style="flex: 1; justify-content: center" :disabled="savingInfo" @click="submitInfo">Сохранить</button>
          <button class="btn btn-outline btn-sm" style="flex: 1; justify-content: center" @click="editingGuild = null">Отменить</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem">
        <div class="title-display" style="font-size: 0.85rem">Ранги контрактов</div>
        <button class="btn btn-primary btn-sm" @click="rankFormOpen ? (rankFormOpen = false) : openCreateRank()">
          {{ rankFormOpen ? 'Отменить' : '+ Добавить ранг' }}
        </button>
      </div>

      <div v-if="rankFormOpen" class="auth-card" style="max-width: 480px; margin: 0 auto 1.5rem">
        <div class="field"><label>Идентификатор (value)</label><input v-model="rankForm.value" :disabled="!!editingRankValue" placeholder="r1" /></div>
        <div class="field"><label>Название</label><input v-model="rankForm.label" /></div>
        <div class="grid" style="grid-template-columns: 1fr 1fr 1fr">
          <div class="field"><label>Камешков</label><input v-model.number="rankForm.fameStones" type="number" /></div>
          <div class="field"><label>Фиников</label><input v-model.number="rankForm.finiki" type="number" /></div>
          <div class="field"><label>Порядок</label><input v-model.number="rankForm.order" type="number" /></div>
        </div>
        <button class="btn btn-primary" style="width: 100%; justify-content: center" :disabled="savingRank" @click="submitRank">
          {{ savingRank ? 'Сохраняем...' : editingRankValue ? 'Сохранить' : 'Создать' }}
        </button>
      </div>

      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Value</th>
              <th>Название</th>
              <th>Камешков</th>
              <th>Фиников</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in ranks" :key="r.value">
              <td><span class="badge">{{ r.value }}</span></td>
              <td style="color: var(--t)">{{ r.label }}</td>
              <td>{{ r.fameStones }}</td>
              <td>{{ r.finiki }}</td>
              <td style="white-space: nowrap">
                <button class="btn btn-outline btn-sm" @click="openEditRank(r)">Изменить</button>
                <button class="btn btn-danger btn-sm" style="margin-left: 0.4rem" @click="removeRank(r.value)">Удалить</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>
