// plugins/pocketbase.ts
import PocketBase from 'pocketbase'

export default defineNuxtPlugin(async (nuxtApp) => {
    const { data } = await useFetch('/api/pb_url')
    const pb = new PocketBase(data.value?.pb_url)
    nuxtApp.provide('pb', pb)
  })