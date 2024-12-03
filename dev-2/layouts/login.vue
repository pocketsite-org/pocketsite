<script setup>
const { $pb } = useNuxtApp();

onMounted(async () => {
  if ($pb.authStore.isValid) {
    navigateTo("/admin/");
  }
});

</script>

<template>
  <slot></slot>
</template>
