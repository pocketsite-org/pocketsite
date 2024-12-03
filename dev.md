- Install node and npm
- https://developers.cloudflare.com/pages/framework-guides/deploy-a-nuxt-site/
- npm install pocketbase

´´´
// composables/usePocketbase.ts
import PocketBase from 'pocketbase'

export const usePocketbase = () => {
const pb = new PocketBase('https://dev-1.pockethost.io/')
return pb
}
´´´

´´´
// plugins/pocketbase.ts
import { defineNuxtPlugin } from '#app'
import { usePocketbase } from '~/composables/usePocketbase'

export default defineNuxtPlugin((nuxtApp) => {
const pb = usePocketbase()

    nuxtApp.provide('pb', pb)

})
´´´

´´´
plugins: [
'~/plugins/pocketbase'
],
´´´

´´´

<script setup>
const { $pb } = useNuxtApp()
</script>

´´´

- Follow https://nuxt.com/docs/getting-started/views
- 
