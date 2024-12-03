import PocketBase from 'pocketbase'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },


  nitro: {
    preset: "cloudflare-pages",
  },

  sitemap: {
    sources: [
      '/api/urls',
    ],
    excludeAppSources: true,
  },

  plugins: [
    '~/plugins/pocketbase'
  ],

  modules: [
    "nitro-cloudflare-dev",
    "nuxt-codemirror",
    "@nuxtjs/sitemap",
  ],

})