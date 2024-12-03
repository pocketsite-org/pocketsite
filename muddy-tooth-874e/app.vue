<script setup>
const { $pb } = useNuxtApp()

// Now you can use PocketBase like:
const records = await $pb.collection('posts').getList()


</script>

<template>
  <div>
    <h1>Pocketsite</h1>

    <ul>
      <li v-for="record in records.items" :key="record.id">
        {{ record.title }}
      </li>
    </ul>

    <Button>Button</Button>
  </div>
</template>

