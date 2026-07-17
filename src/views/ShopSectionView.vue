<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import shopApi from '../api/shop'

const route = useRoute()
const router = useRouter()

const sections = ref([])
const loading = ref(true)
const error = ref('')

const section = computed(() => sections.value.find((s) => s.id === route.params.id))
const items = computed(() => section.value?.items ?? [])

const sectionFormOpen = ref(false)
const sectionForm = ref({ name: '', icon: '' })
const savingSection = ref(false)

const itemFormOpen = ref(false)
const editingItemId = ref(null)
const itemForm = ref({ id: '', name: '', price: 0 })
const savingItem = ref(false)

async function load() {
  loading.value = true
  try {
    sections.value = await shopApi.sections()
  } finally {
    loading.value = false
  }
}

function openEditSection() {
  if (!section.value) return
  sectionForm.value = { name: section.value.name, icon: section.value.icon || '' }
  sectionFormOpen.value = !sectionFormOpen.value
}

async function submitSection() {
  error.value = ''
  savingSection.value = true
  try {
    await shopApi.updateSection(section.value.id, { ...sectionForm.value })
    sectionFormOpen.value = false
    await load()
  } catch (e) {
    error.value = e.response?.data?.message || 'Не удалось сохранить раздел'
  } finally {
    savingSection.value = false
  }
}

async function removeSection() {
  if (!confirm(`Удалить раздел «${section.value.name}»? Все товары в нём (${items.value.length}) тоже будут удалены.`)) return
  await shopApi.removeSection(section.value.id)
  router.push('/shop')
}

function openCreateItem() {
  editingItemId.value = null
  itemForm.value = { id: '', name: '', price: 0 }
  itemFormOpen.value = true
}

function openEditItem(i) {
  editingItemId.value = i.id
  itemForm.value = { id: i.id, name: i.name, price: i.price }
  itemFormOpen.value = true
}

async function submitItem() {
  error.value = ''
  if (!itemForm.value.id || !itemForm.value.name) {
    error.value = 'Заполни идентификатор и название'
    return
  }
  savingItem.value = true
  try {
    const payload = { name: itemForm.value.name, price: Number(itemForm.value.price) || 0 }
    if (editingItemId.value) {
      await shopApi.updateItem(editingItemId.value, payload)
    } else {
      await shopApi.createItem({ id: itemForm.value.id, sectionId: section.value.id, ...payload })
    }
    itemFormOpen.value = false
    await load()
  } catch (e) {
    error.value = e.response?.data?.message || 'Не удалось сохранить'
  } finally {
    savingItem.value = false
  }
}

async function removeItem(id) {
  if (!confirm('Удалить этот товар?')) return
  await shopApi.removeItem(id)
  await load()
}

watch(() => route.params.id, load)
onMounted(load)
</script>

<template>
  <div class="wrap">
    <RouterLink to="/shop" style="font-size: 0.8rem; color: var(--t2); display: inline-block; margin-bottom: 1rem">← Магазин</RouterLink>

    <div v-if="error" class="alert alert-err">{{ error }}</div>
    <div v-if="loading" style="color: var(--t2); text-align: center; padding: 2rem">Загрузка...</div>
    <div v-else-if="!section" class="empty-state">Раздел не найден</div>

    <template v-else>
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem">
        <h1 class="title-display" style="font-size: 1.4rem">{{ section.icon || '📦' }} {{ section.name }}</h1>
        <div style="display: flex; gap: 0.4rem">
          <button class="btn btn-outline btn-sm" @click="openEditSection">{{ sectionFormOpen ? 'Отменить' : '⚙️ Раздел' }}</button>
          <button class="btn btn-danger btn-sm" @click="removeSection">🗑️ Удалить раздел</button>
        </div>
      </div>

      <div v-if="sectionFormOpen" class="auth-card" style="max-width: 480px; margin: 0 auto 1.5rem">
        <div class="field"><label>Название</label><input v-model="sectionForm.name" /></div>
        <div class="field"><label>Иконка (эмодзи)</label><input v-model="sectionForm.icon" /></div>
        <button class="btn btn-primary" style="width: 100%; justify-content: center" :disabled="savingSection" @click="submitSection">
          {{ savingSection ? 'Сохраняем...' : 'Сохранить' }}
        </button>
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; margin: 1.5rem 0 0.75rem">
        <div class="title-display" style="font-size: 0.85rem">Товары</div>
        <button class="btn btn-primary btn-sm" @click="itemFormOpen ? (itemFormOpen = false) : openCreateItem()">
          {{ itemFormOpen ? 'Отменить' : '+ Добавить товар' }}
        </button>
      </div>

      <div v-if="itemFormOpen" class="auth-card" style="max-width: 480px; margin: 0 auto 1.5rem">
        <div class="field">
          <label>Идентификатор (id)</label>
          <input v-model="itemForm.id" :disabled="!!editingItemId" placeholder="water" />
        </div>
        <div class="field"><label>Название</label><input v-model="itemForm.name" placeholder="💧 Вода" /></div>
        <div class="field"><label>Цена (фиников)</label><input v-model.number="itemForm.price" type="number" /></div>
        <button class="btn btn-primary" style="width: 100%; justify-content: center" :disabled="savingItem" @click="submitItem">
          {{ savingItem ? 'Сохраняем...' : editingItemId ? 'Сохранить' : 'Создать' }}
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
            <tr v-for="i in items" :key="i.id">
              <td><span class="badge">{{ i.id }}</span></td>
              <td style="color: var(--t)">{{ i.name }}</td>
              <td>🪙 {{ i.price }}</td>
              <td style="white-space: nowrap">
                <button class="btn btn-outline btn-sm" @click="openEditItem(i)">Изменить</button>
                <button class="btn btn-danger btn-sm" style="margin-left: 0.4rem" @click="removeItem(i.id)">Удалить</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>
