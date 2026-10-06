export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui'],
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    gatewayApiBase: process.env.NUXT_GATEWAY_API_BASE || 'http://localhost:8080'
  },
  compatibilityDate: '2026-06-30',
  eslint: {
    config: {
      stylistic: { commaDangle: 'never', braceStyle: '1tbs' }
    }
  }
})
