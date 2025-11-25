<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
// Check auth on app mount
const authStore = useAuthStore()

onMounted(async () => {
  await authStore.checkAuth()
})
</script>
