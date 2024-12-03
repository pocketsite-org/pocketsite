import PocketBase from 'pocketbase'

interface PbUrlResponse {
  pb_url: string
}

export const usePocketbase = () => {
  const { data } = useFetch<PbUrlResponse>('/api/pb_url')
  
  // Create reactive URL reference
  const baseUrl = computed(() => 
    data.value?.pb_url || 'https://dev-1.pockethost.io/'
  )

  // Initialize PocketBase with computed URL
  const pb = new PocketBase(baseUrl.value)
  return pb
}