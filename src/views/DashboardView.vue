<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()

const allCards = [
  { to: '/games', icon: '📅', title: 'Игры', sub: 'Расписание предстоящих игр', roles: ['ADMIN', 'MASTER'] },
  { to: '/history', icon: '📜', title: 'История', sub: 'Прошедшие игры и ивенты', roles: ['ADMIN', 'MASTER'] },
  { to: '/faq', icon: '❓', title: 'FAQ', sub: 'Вопросы и ответы на сайте', roles: ['ADMIN'] },
  { to: '/masters', icon: '🧙', title: 'Мастера', sub: 'Профили мастеров клуба', roles: ['ADMIN'] },
  { to: '/guild', icon: '🏛️', title: 'Гильдии', sub: 'Описания и ранги контрактов', roles: ['ADMIN'] },
]

const cards = computed(() => allCards.filter((c) => c.roles.includes(auth.user?.role)))
</script>

<template>
  <div class="wrap">
    <p style="font-family: var(--font-display); font-size: 0.65rem; letter-spacing: 0.2em; color: var(--pp); text-transform: uppercase; margin-bottom: 0.4rem">
      Панель управления
    </p>
    <h1 class="title-display" style="font-size: 1.6rem; margin-bottom: 1.75rem">
      Привет, <span class="accent">{{ auth.user?.login }}</span>
    </h1>

    <div class="grid grid-cards">
      <RouterLink v-for="c in cards" :key="c.to" :to="c.to" class="card" style="cursor: pointer">
        <div style="font-size: 1.5rem; margin-bottom: 0.75rem">{{ c.icon }}</div>
        <div class="title-display" style="font-size: 0.85rem; margin-bottom: 0.3rem">{{ c.title }}</div>
        <div style="font-size: 0.75rem; color: var(--t2)">{{ c.sub }}</div>
      </RouterLink>
    </div>
  </div>
</template>
