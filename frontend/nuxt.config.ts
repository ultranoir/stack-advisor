// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/google-fonts',
  ],

  runtimeConfig: {
    public: {
      directusUrl: process.env.NUXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055',
    },
  },

  googleFonts: {
    families: {
      Inter: [400, 500, 600, 700],
    },
  },

  app: {
    head: {
      title: 'Stack Advisor - Outil d\'estimation interne',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Outil interne de recommandation de stack et d\'estimation budgétaire' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  typescript: {
    strict: true,
  },

  routeRules: {
    '/': { redirect: '/estimation' },
  },

  compatibilityDate: '2025-01-01',
})
