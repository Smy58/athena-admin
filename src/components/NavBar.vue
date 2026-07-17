<script setup>
import { ref, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const mobileOpen = ref(false)

const allLinks = [
  { to: '/', label: '🏠 Дашборд', roles: ['ADMIN', 'MASTER'] },
  { to: '/games', label: '📅 Игры', roles: ['ADMIN', 'MASTER'] },
  { to: '/history', label: '📜 История', roles: ['ADMIN', 'MASTER'] },
  { to: '/quests', label: '📋 Задания', roles: ['ADMIN', 'MASTER'] },
  { to: '/faq', label: '❓ FAQ', roles: ['ADMIN'] },
  { to: '/masters', label: '🧙 Мастера', roles: ['ADMIN'] },
  { to: '/guild', label: '🏛️ Гильдии', roles: ['ADMIN'] },
  { to: '/users', label: '👥 Игроки', roles: ['ADMIN'] },
  { to: '/admin-users', label: '🔑 Аккаунты', roles: ['ADMIN'] },
]

const links = computed(() => allLinks.filter((l) => l.roles.includes(auth.user?.role)))

function toggleMobile() {
  mobileOpen.value = !mobileOpen.value
}
function closeMobile() {
  mobileOpen.value = false
}
function handleLogout() {
  closeMobile()
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <nav v-if="auth.isLoggedIn" class="nav">
    <div class="logo">
      <span class="logo-owl">🦉</span>
      <span class="logo-text">Афина <em>Админка</em></span>
      <span class="badge" style="margin-left: 0.4rem">{{ auth.user?.role }}</span>
    </div>

    <div class="nav-links">
      <RouterLink v-for="l in links" :key="l.to" :to="l.to" class="btn btn-ghost btn-sm">{{ l.label }}</RouterLink>
      <span class="nav-user">{{ auth.user?.login }}</span>
      <button class="btn btn-outline btn-sm" @click="handleLogout">Выйти</button>
    </div>

    <button class="mobile-menu-btn" :class="{ active: mobileOpen }" aria-label="Меню" @click="toggleMobile">
      {{ mobileOpen ? '✕' : '☰' }}
    </button>
  </nav>

  <div class="mobile-menu-backdrop" :class="{ open: mobileOpen }" @click="closeMobile"></div>
  <div class="mobile-menu" :class="{ open: mobileOpen }">
    <RouterLink v-for="l in links" :key="l.to" :to="l.to" class="mobile-menu-item" @click="closeMobile">
      {{ l.label }}
    </RouterLink>
    <div class="mobile-menu-divider"></div>
    <button class="mobile-menu-item danger" @click="handleLogout">Выйти</button>
  </div>
</template>

<style scoped>
.nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(13, 13, 18, 0.9);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--b);
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 58px;
}
.logo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.logo-owl {
  width: 32px;
  height: 32px;
  background: var(--p);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  flex-shrink: 0;
}
.logo-text {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
  color: var(--t);
  white-space: nowrap;
}
.logo-text em {
  color: var(--pp);
  font-style: normal;
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
.nav-user {
  font-size: 0.8rem;
  color: var(--t2);
  margin: 0 0.3rem;
}

.mobile-menu-btn {
  display: none;
  background: transparent;
  border: 1px solid var(--b);
  border-radius: var(--r);
  color: var(--t2);
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  cursor: pointer;
  flex-shrink: 0;
  transition: 0.25s;
}
.mobile-menu-btn:hover {
  border-color: var(--b2);
  color: var(--t);
}
.mobile-menu-btn.active {
  border-color: var(--pl);
  color: var(--pl);
}
.mobile-menu-backdrop {
  position: fixed;
  top: 58px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 240;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.25s ease, visibility 0s linear 0.25s;
}
.mobile-menu-backdrop.open {
  opacity: 1;
  visibility: visible;
  transition: opacity 0.25s ease;
}
.mobile-menu {
  position: fixed;
  top: 58px;
  left: 0;
  right: 0;
  background: var(--bg2);
  border-bottom: 1px solid var(--b2);
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.55);
  z-index: 250;
  padding: 0.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  max-height: calc(100vh - 58px);
  overflow-y: auto;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-14px);
  transition: opacity 0.25s ease, transform 0.25s ease, visibility 0s linear 0.25s;
}
.mobile-menu.open {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.mobile-menu-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.8rem 1rem;
  border-radius: var(--r);
  background: none;
  border: none;
  color: var(--t2);
  font-size: 0.9rem;
  cursor: pointer;
  font-family: var(--font-body);
  transition: 0.15s;
}
.mobile-menu-item:hover {
  background: var(--bg3);
  color: var(--t);
  transform: translateX(3px);
}
.mobile-menu-item.danger {
  color: #f09595 !important;
}
.mobile-menu-divider {
  height: 1px;
  background: var(--b);
  margin: 0.4rem 0.25rem;
}

@media (max-width: 860px) {
  .nav-links {
    display: none;
  }
  .mobile-menu-btn {
    display: flex;
  }
}
</style>
