<script setup>
import { ref, onMounted } from 'vue'
import shopApi from '../api/shop'

const titles = ref([])
const potions = ref([])
const snacks = ref([])
const loading = ref(true)
const error = ref('')

const titleFormOpen = ref(false)
const editingTitleId = ref(null)
const titleForm = ref({ id: '', name: '', price: 0 })
const savingTitle = ref(false)

const itemFormOpen = ref(false)
const editingItemId = ref(null)
const itemForm = ref({ id: '', name: '', price: 0, category: 'POTION' })
const savingItem = ref(false)

async function load() {
  loading.value = true
  try {
    const catalog = await shopApi.catalog()
    titles.value = catalog.titles
    potions.value = catalog.potions
    snacks.value = catalog.snacks
  } finally {
    loading.value = false
  }
}

function openCreateTitle() {
  editingTitleId.value = null
  titleForm.value = { id: '', name: '', price: 0 }
  titleFormOpen.value = true
}

function openEditTitle(t) {
  editingTitleId.value = t.id
  titleForm.value = { id: t.id, name: t.name, price: t.price }
  titleFormOpen.value = true
}

async function submitTitle() {
  error.value = ''
  if (!titleForm.value.id || !titleForm.value.name) {
    error.value = 'Заполни идентификатор и название'
    return
  }
  savingTitle.value = true
  try {
    const payload = { name: titleForm.value.name, price: Number(titleForm.value.price) || 0 }
    if (editingTitleId.value) {
      await shopApi.updateTitle(editingTitleId.value, payload)
    } else {
      await shopApi.createTitle({ id: titleForm.value.id, ...payload })
    }
    titleFormOpen.value = false
    await load()
  } catch (e) {
    error.value = e.response?.data?.message || 'Не удалось сохранить'
  } finally {
    savingTitle.value = false
  }
}

async function removeTitle(id) {
  if (!confirm('Удалить это звание?')) return
  await shopApi.removeTitle(id)
  await load()
}

function openCreateItem() {
  editingItemId.value = null
  itemForm.value = { id: '', name: '', price: 0, category: 'POTION' }
  itemFormOpen.value = true
}

function openEditItem(i) {
  editingItemId.value = i.id
  itemForm.value = { id: i.id, name: i.name, price: i.price, category: i.category }
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
      await shopApi.createItem({ id: itemForm.value.id, category: itemForm.value.category, ...payload })
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

onMounted(load)
</script>

<template>
  <div class="wrap">
    <h1 class="title-display" style="font-size: 1.4rem; margin-bottom: 1.5rem">Магазин</h1>
    <div v-if="error" class="alert alert-err">{{ error }}</div>

    <div v-if="loading" style="color: var(--t2); text-align: center; padding: 2rem">Загрузка...</div>

    <template v-else>
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem">
        <div class="title-display" style="font-size: 0.85rem">Звания</div>
        <button class="btn btn-primary btn-sm" @click="titleFormOpen ? (titleFormOpen = false) : openCreateTitle()">
          {{ titleFormOpen ? 'Отменить' : '+ Добавить звание' }}
        </button>
      </div>

      <div v-if="titleFormOpen" class="auth-card" style="max-width: 480px; margin: 0 auto 1.5rem">
        <div class="field">
          <label>Идентификатор (id)</label>
          <input v-model="titleForm.id" :disabled="!!editingTitleId" placeholder="legend" />
        </div>
        <div class="field"><label>Название</label><input v-model="titleForm.name" /></div>
        <div class="field"><label>Цена (фиников)</label><input v-model.number="titleForm.price" type="number" /></div>
        <button class="btn btn-primary" style="width: 100%; justify-content: center" :disabled="savingTitle" @click="submitTitle">
          {{ savingTitle ? 'Сохраняем...' : editingTitleId ? 'Сохранить' : 'Создать' }}
        </button>
      </div>

      <div class="table-wrap" style="margin-bottom: 2rem">
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
                <button class="btn btn-outline btn-sm" @click="openEditTitle(t)">Изменить</button>
                <button class="btn btn-danger btn-sm" style="margin-left: 0.4rem" @click="removeTitle(t.id)">Удалить</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem">
        <div class="title-display" style="font-size: 0.85rem">Зелья и еда</div>
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
        <div class="field">
          <label>Категория</label>
          <select v-model="itemForm.category" :disabled="!!editingItemId">
            <option value="POTION">Зелье (напиток)</option>
            <option value="SNACK">Еда</option>
          </select>
        </div>
        <button class="btn btn-primary" style="width: 100%; justify-content: center" :disabled="savingItem" @click="submitItem">
          {{ savingItem ? 'Сохраняем...' : editingItemId ? 'Сохранить' : 'Создать' }}
        </button>
      </div>

      <div class="title-display" style="font-size: 0.75rem; color: var(--t2); margin-bottom: 0.5rem">Зелья (напитки)</div>
      <div class="table-wrap" style="margin-bottom: 1.5rem">
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
            <tr v-for="p in potions" :key="p.id">
              <td><span class="badge">{{ p.id }}</span></td>
              <td style="color: var(--t)">{{ p.name }}</td>
              <td>🪙 {{ p.price }}</td>
              <td style="white-space: nowrap">
                <button class="btn btn-outline btn-sm" @click="openEditItem(p)">Изменить</button>
                <button class="btn btn-danger btn-sm" style="margin-left: 0.4rem" @click="removeItem(p.id)">Удалить</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="title-display" style="font-size: 0.75rem; color: var(--t2); margin-bottom: 0.5rem">Еда</div>
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
            <tr v-for="s in snacks" :key="s.id">
              <td><span class="badge">{{ s.id }}</span></td>
              <td style="color: var(--t)">{{ s.name }}</td>
              <td>🪙 {{ s.price }}</td>
              <td style="white-space: nowrap">
                <button class="btn btn-outline btn-sm" @click="openEditItem(s)">Изменить</button>
                <button class="btn btn-danger btn-sm" style="margin-left: 0.4rem" @click="removeItem(s.id)">Удалить</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>
