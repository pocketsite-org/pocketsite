<script setup lang="ts">
interface Expand {
  excerpt?: string
  content?: string
}

interface Post {
  content: string
  headerContent?: string
  footerContent?: string
  expand?: {
    [key: string]: Expand
  }
}

const { path } = useRoute()
const { data: post } = await useFetch<Post>('/api/post')

// Process content with excerpts
const processedContent = computed(() => {
  if (!post.value?.expand || !post.value?.content) return post.value?.content

  let content = post.value.content

  // Loop through expand objects
  Object.values(post.value.expand).forEach((item) => {
    if (!item.excerpt) return

    // Find placeholders like [something] in excerpt
    const matches = item.excerpt.match(/\[(.*?)\]/g)
    if (!matches) return

    // Replace each placeholder in content
    matches.forEach(placeholder => {
      const key = placeholder.replace(/[\[\]]/g, '')
      const regex = new RegExp(`\\[${key}\\]`, 'g')
      content = content.replace(regex, item.content || '')
    })
  })

  return content
})
</script>

<template>
  <NuxtLayout name="default">
    <div v-if="post">
      <div v-if="post.headerContent" v-html="post.headerContent"></div>
      <div v-html="processedContent"></div>
      <div v-if="post.footerContent" v-html="post.footerContent"></div>
    </div>
  </NuxtLayout>
</template>