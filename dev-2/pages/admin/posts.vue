<script setup>
const { $pb } = useNuxtApp();

const urls = await $pb.collection("urls").getFullList({
});
</script>

<template>
  <NuxtLayout name="admin">
    <div>
      <h1>Posts</h1>
    </div>

    <div>
      <h2>URLs</h2>
      <ul>
        <li v-for="url in urls" :key="url.id">
          <nuxt-link :to="url.name">{{ url.name }}</nuxt-link>
          <p>{{ url.updated }}</p>

        </li>
      </ul>
    </div>
  </NuxtLayout>
</template>
