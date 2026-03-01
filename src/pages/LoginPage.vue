<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../shared/supabase'

const router = useRouter()
const route = useRoute()

const email = ref('demo@todo.local')
const password = ref('123123')
const loading = ref(false)
const error = ref('')

async function signIn() {
  error.value = ''
  loading.value = true
  try {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })

    if (signInError) {
      error.value = signInError.message
      return
    }

    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.push(redirect === '/login' ? '/' : redirect)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="login-page">
    <section class="login-card">
      <h1>Sign In</h1>
      <p class="hint">Use demo credentials: <code>demo@todo.local / 123123</code></p>
      <form @submit.prevent="signIn">
        <label>
          Email
          <input v-model="email" type="email" required />
        </label>
        <label>
          Password
          <input v-model="password" type="password" required />
        </label>
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" :disabled="loading">
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>
    </section>
  </main>
</template>

<style scoped>
.login-page {
  min-height: 70vh;
  display: grid;
  place-items: center;
}

.login-card {
  width: min(420px, 92vw);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.25rem;
}

.hint {
  margin: 0.5rem 0 1rem;
  opacity: 0.8;
}

form {
  display: grid;
  gap: 0.75rem;
}

label {
  display: grid;
  gap: 0.3rem;
}

input {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.5rem 0.65rem;
}

button {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.6rem 0.7rem;
  cursor: pointer;
}

.error {
  color: #cc2f2f;
  margin: 0;
}
</style>
