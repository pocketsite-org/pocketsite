
export default defineEventHandler(async (event) => {
    const pb_url = event.context.cloudflare.env.PB_URL
  
  try {
    return {
        pb_url: pb_url
    };
  } catch (error) {
    console.error('Error fetching URLs:', error)
    return []
  }
})