<script setup>
const { $pb } = useNuxtApp();
const isLoading = ref(true);

onMounted(async () => {
  if (!$pb.authStore.isValid) {
    await navigateTo("/admin/login");
  }
  isLoading.value = false;
});

watch(
  () => $pb.authStore.isValid,
  async (isValid) => {
    if (!isValid) {
      await navigateTo("/admin/login");
    }
  }
);
</script>

<template>
  <div v-if="isLoading" class="loading-screen">
    <div class="loader">Loading...</div>
  </div>
  <template v-else>
    <AdminHeader />
    <div data-v-layout-admin >
    <NuxtLoadingIndicator color="black" />
    <slot />
    </div>
  </template>
</template>

<style>
.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
}

.loader {
  font-size: 1.2rem;
}

[data-v-layout-admin] {
  /* Reset */
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  button {
    cursor: pointer;
    padding: 0.2rem .5rem;
  }

  a {
    text-decoration: none;
    color: inherit;
  }
}
</style>
