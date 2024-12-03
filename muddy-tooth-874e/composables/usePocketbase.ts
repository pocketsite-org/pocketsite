// composables/usePocketbase.ts
import PocketBase from 'pocketbase'

export const usePocketbase = () => {
    const pb = new PocketBase('https://dev-1.pockethost.io/')
    return pb
}