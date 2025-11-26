<template>
  <div class="relative">
    <button
      @click="showMenu = !showMenu"
      class="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
      <span class="hidden sm:inline">{{ currentLocale.name }}</span>
    </button>

    <div
      v-if="showMenu"
      class="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50"
      @click.stop
    >
      <button
        v-for="locale in availableLocales"
        :key="locale.code"
        @click="switchLanguage(locale.code)"
        class="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition"
        :class="locale.code === currentLocale.code ? 'text-blue-600 font-medium bg-blue-50' : 'text-slate-700'"
      >
        {{ locale.name }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { locale, locales } = useI18n()
const showMenu = ref(false)

const availableLocales = computed(() => locales.value)
const currentLocale = computed(() => locales.value.find(l => l.code === locale.value) || locales.value[0])

const switchLanguage = (code: string) => {
  locale.value = code
  showMenu.value = false
}

// Close menu when clicking outside
onMounted(() => {
  document.addEventListener('click', () => {
    showMenu.value = false
  })
})
</script>
