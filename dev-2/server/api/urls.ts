import { defineSitemapEventHandler } from '#imports'
import type { SitemapUrlInput } from '#sitemap/types'
import PocketBase from 'pocketbase'

export default defineSitemapEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const pb = new PocketBase(event.context.cloudflare.env.PB_URL)
  
  try {
    const urls = await pb.collection('urls').getFullList()
    return urls.map(url => ({
      loc: url.name,
      lastmod: new Date(url.updated).toISOString()
    })) satisfies SitemapUrlInput[]
  } catch (error) {
    console.error('Error fetching URLs:', error)
    return []
  }
})