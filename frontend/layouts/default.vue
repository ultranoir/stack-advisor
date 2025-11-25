<template>
  <div class="flex min-h-screen bg-slate-100">
    <!-- Sidebar -->
    <aside class="w-64 bg-slate-900 text-white flex flex-col min-h-screen fixed left-0 top-0 bottom-0">
      <!-- Logo -->
      <div class="p-6 border-b border-slate-700">
        <NuxtLink to="/estimation" class="flex items-center gap-2">
          <svg class="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <h1 class="text-xl font-bold">Stack Advisor</h1>
        </NuxtLink>
        <p class="text-slate-400 text-sm mt-1">Outil d'estimation interne</p>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4">
        <ul class="space-y-2">
          <li>
            <NuxtLink
              to="/estimation"
              class="flex items-center gap-3 px-4 py-3 rounded-lg transition"
              :class="isEstimationRoute ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Nouvelle estimation
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/history"
              class="flex items-center gap-3 px-4 py-3 rounded-lg transition"
              :class="route.path === '/history' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              Historique
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- User -->
      <div class="p-4 border-t border-slate-700">
        <div class="flex items-center gap-3 px-4 py-3">
          <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
            {{ authStore.userInitials }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">{{ authStore.userName }}</p>
            <p class="text-xs text-slate-400 truncate">{{ authStore.user?.email }}</p>
          </div>
          <button
            @click="handleLogout"
            class="text-slate-400 hover:text-white p-1"
            title="Déconnexion"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 ml-64">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const authStore = useAuthStore()

const isEstimationRoute = computed(() => {
  return route.path.startsWith('/estimation')
})

const handleLogout = async () => {
  await authStore.logout()
}
</script>
