<script setup>
import { useRuntimeConfig } from '#app';

const config = useRuntimeConfig();
console.log('Runtime Config:', config);
</script>

<template>
  <NuxtLayout name="admin">
    <div>
      <h1>Settings</h1>
      <pre>{{ config }}</pre> <!-- Display the runtime config in the template -->
    </div>
  </NuxtLayout>
</template>