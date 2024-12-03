// plugins/pocketbase.ts
import { defineNuxtPlugin } from '#app'
import { usePocketbase } from '~/composables/usePocketbase'

export default defineNuxtPlugin((nuxtApp) => {
    const pb = usePocketbase()
    
    nuxtApp.provide('pb', pb)
})