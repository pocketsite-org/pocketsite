// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  nitro: {
    preset: "cloudflare-pages"
  },

  plugins: [
    '~/plugins/pocketbase'
  ],

  modules: [
    "nitro-cloudflare-dev",
    "@nuxtjs/tailwindcss",
    ["@nuxtjs/color-mode", {
      classSuffix: ''
    }],
    ["shadcn-nuxt", {
      prefix: '',
      componentDir: './components/ui'
    }]
  ],
  
  tailwindcss: {
    config: {
      darkMode: 'class'
    }
  }


})