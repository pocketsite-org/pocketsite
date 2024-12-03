<script setup>
const { $pb } = useNuxtApp();

function logout() {
  $pb.authStore.clear();
  navigateTo("/admin/login");
}
</script>

<template>
  <div class="admin-header" data-v-layout-admin>
    <NuxtLink to="/admin"><button>📊 Dashboard</button></NuxtLink>
    <NuxtLink to="/admin/pages"><button>📄 Pages</button></NuxtLink>
    <NuxtLink to="/admin/posts"><button>📝 Posts</button></NuxtLink>
    <NuxtLink to="/admin/parts"><button>🧩 Parts</button></NuxtLink>
    <NuxtLink to="/admin/themes"><button>🎨 Themes</button></NuxtLink>
    <!-- <NuxtLink to="/admin/plugins"><button>🔌 Plugins</button></NuxtLink> -->
    <NuxtLink to="/admin/settings"><button>⚙️ Settings</button></NuxtLink>
    <NuxtLink to="/admin/users"><button>👥 Users</button></NuxtLink>
    <NuxtLink to="/admin/profile"><button>👤 Profile</button></NuxtLink>

    <button @click="logout">👋 Logout</button>
  </div>
  <hr />
</template>

<style scoped>
.admin-header {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 0px;
}
</style>
