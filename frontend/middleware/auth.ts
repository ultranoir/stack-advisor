export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  // Check auth if not already done
  if (authStore.isLoading) {
    await authStore.checkAuth()
  }

  // Redirect to login if not authenticated
  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }
})
