<template>
  <div class="min-h-screen bg-slate-900 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
          <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-white">Stack Advisor</h1>
        <p class="text-slate-400 mt-2">Outil d'estimation interne</p>
      </div>

      <!-- Login card -->
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <h2 class="text-xl font-semibold text-slate-800 mb-2">Connexion</h2>
        <p class="text-slate-500 mb-6">Entrez vos identifiants pour accéder à l'outil</p>

        <!-- Error message -->
        <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {{ errorMessage }}
        </div>

        <!-- Login form -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              autocomplete="email"
              placeholder="votre@email.com"
              class="input"
              :disabled="isLoading"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-slate-700 mb-1">
              Mot de passe
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              autocomplete="current-password"
              placeholder="••••••••"
              class="input"
              :disabled="isLoading"
            />
          </div>

          <button
            type="submit"
            :disabled="isLoading || !email || !password"
            class="w-full btn-primary py-3"
          >
            <svg v-if="isLoading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {{ isLoading ? 'Connexion...' : 'Se connecter' }}
          </button>
        </form>

        <p class="text-center text-sm text-slate-500 mt-6">
          Accès réservé à l'équipe technique
        </p>
      </div>

      <!-- Footer -->
      <p class="text-center text-slate-500 text-sm mt-8">
        © {{ new Date().getFullYear() }} Ultranoir — Outil interne
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

const { login } = useDirectus()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const result = await login(email.value, password.value)
    
    if (result.success) {
      await authStore.checkAuth()
      navigateTo('/estimation')
    } else {
      errorMessage.value = result.error || 'Email ou mot de passe incorrect'
    }
  } catch (error) {
    errorMessage.value = 'Une erreur est survenue. Veuillez réessayer.'
  } finally {
    isLoading.value = false
  }
}
</script>
