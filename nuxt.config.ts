// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      API_BASE_URL: process.env.API_BASE_URL,
      PUSHER_KEY: process.env.PUSHER_KEY,
    },
  },
  plugins: ['~/plugins/laravel-echo.ts'],
  css: ['vuetify/lib/styles/main.sass', '@mdi/font/css/materialdesignicons.css', '~/assets/css/main.scss'],
  build: {
    transpile: ['vuetify'],
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  vite: {
    define: {
      'process.env.DEBUG': false,
    },
  },
  modules: [
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
  ],
  pinia: {
    autoImports: [
      'defineStore',
      ['defineStore', 'definePiniaStore'],
    ],
  },
  ssr: false,
})