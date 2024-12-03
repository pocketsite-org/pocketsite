<script setup lang="ts">
const { $pb } = useNuxtApp()
const router = useRouter()

const form = reactive({
  email: '',
  password: '',
  error: ''
})

async function handleLogin() {
  try {
    form.error = ''
    const authData = await $pb.collection('users').authWithPassword(form.email, form.password)
    
    // Debug auth state
    console.log('Auth state after login:', {
      isValid: $pb.authStore.isValid,
      token: $pb.authStore.token,
      model: authData
    })

    // Ensure auth is valid before redirect
    if ($pb.authStore.isValid) {
      await navigateTo('/admin')
    } else {
      form.error = 'Authentication failed'
    }
  } catch (error) {
    form.error = 'Invalid email or password'
    console.error('Login failed:', error)
  }
}

</script>
<template>
<NuxtLayout name="login">
  <div class="login-container">
    <h1>Login</h1>
    
    <form @submit.prevent="handleLogin" class="login-form">
      <div class="form-group">
        <label for="email">Email</label>
        <input 
          id="email"
          v-model="form.email"
          type="email"
          required
          placeholder="Enter email"
        >
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input 
          id="password"
          v-model="form.password"
          type="password"
          required
          placeholder="Enter password"
        >
      </div>

      <div v-if="form.error" class="error">
        {{ form.error }}
      </div>

      <button type="submit">Login</button>
    </form>
  </div>
</NuxtLayout>
</template>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 2rem auto;
  padding: 1rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.error {
  color: red;
  margin-bottom: 1rem;
}
</style>